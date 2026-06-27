import pool from '../config/db.js';
import { nextId } from '../services/idService.js';
import { createNotification, notifyEnterpriseAdmins } from '../services/notificationService.js';
import { sendManagerChatAlertEmail } from '../services/mailService.js';
import { publishChatUpdate, subscribeToChat } from '../services/chatRealtimeService.js';
import { generateBusinessReply, generateManagerAnalysis } from '../services/openaiService.js';

const isClient = (req) => req.user.type === 'client';
const normalizeChatText = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(bonhour|bonjor|bounjour|bhonjour|bhnjour|bnjour)\b/g, 'bonjour')
    .replace(/\b(vsa|vaz)\b/g, 'vas')
    .replace(/\b(biem|b1|bain)\b/g, 'bien')
    .replace(/\b(paoement|paiemnt|paiemet|paiment|payement)\b/g, 'paiement')
    .replace(/\b(commade|comande|commnde)\b/g, 'commande')
    .replace(/\b(factur|facturre)\b/g, 'facture')
    .replace(/\b(reclamtion|reclammation)\b/g, 'reclamation')
    .replace(/\b(concernat|consernant)\b/g, 'concernant')
    .replace(/\bkel\b/g, 'quel')
    .replace(/\bke\b/g, 'que')
    .replace(/\bsvp\b/g, 's il vous plait')
    .replace(/\s+/g, ' ');

const managerLocalAnalysis = ({ stats, meilleurs_clients = [], stock = [] }) => {
    const alertes = Number(stats?.alertes_stock || 0);
    const commandes = Number(stats?.commandes_attente || 0);
    const reclamations = Number(stats?.reclamations_ouvertes || 0);
    const clients = Number(stats?.clients || 0);
    const topClient = meilleurs_clients.find((client) => Number(client.chiffre_affaires || 0) > 0);
    const stockDisponible = stock.filter((item) => Number(item.quantite_stock || 0) > 0).slice(0, 3);
    return [
        'Constats',
        `- Le systeme suit actuellement ${clients} client(s).`,
        `- ${commandes} commande(s) sont encore en attente de traitement.`,
        `- ${reclamations} reclamation(s) restent ouvertes ou en cours.`,
        `- ${alertes} produit(s) demandent une attention stock.`,
        topClient ? `- Le meilleur client visible est ${topClient.nom}, avec ${Number(topClient.chiffre_affaires || 0).toFixed(2)} USD de chiffre d'affaires.` : '- Aucun meilleur client significatif ne ressort encore des donnees.',
        '',
        'Risques a surveiller',
        commandes > 0 ? '- Les commandes en attente peuvent ralentir la satisfaction client si elles ne sont pas traitees rapidement.' : '- Les commandes semblent sous controle pour le moment.',
        reclamations > 0 ? '- Les reclamations ouvertes doivent etre suivies pour eviter une perte de confiance.' : '- Les reclamations ne montrent pas de pression immediate.',
        alertes > 0 ? '- Les alertes de stock peuvent provoquer des ruptures sur les articles demandes.' : '- Le stock ne montre pas d’alerte critique dans les donnees recues.',
        '',
        'Actions prioritaires',
        '- Traiter les commandes en attente avant les nouvelles actions commerciales.',
        '- Relancer les clients actifs avec des produits disponibles et pertinents.',
        '- Surveiller les produits en alerte et prioriser les approvisionnements.',
        '- Repondre aux reclamations avec une trace claire dans le systeme.',
        '',
        'Perspectives des 30 prochains jours',
        stockDisponible.length
            ? `- Mettre en avant les produits disponibles comme ${stockDisponible.map((p) => p.nom).join(', ')}.`
            : '- Reconstituer d’abord les produits vendables avant de lancer une campagne commerciale.',
        '- Transformer les prospects en clients par des messages courts, utiles et limites.',
        '- Utiliser les archives documentaires pour conserver les preuves commerciales et administratives.'
    ].join('\n');
};

const automaticReply = async (message, user, conversationId = null) => {
    const text = normalizeChatText(message);
    if (/^(merci|merci beaucoup|ok|daccord|d accord|parfait|super|bien recu|ca marche|c est bon|c bon|merci pour votre reponse)[!. ]*$/.test(text)
        || /(merci|remercie).*(reponse|aide|information)/.test(text)) {
        return "Avec plaisir. Je reste disponible si vous voulez verifier un prix, suivre une commande, consulter une facture ou comprendre un paiement.";
    }
    if (/(qui es tu|tu fais quoi|comment tu peux m aider|aide moi|besoin d aide)/.test(text)) {
        return "Je suis l'assistant automatique de Quincaillerie Centrale. Je peux chercher un produit dans le stock, donner le prix catalogue, expliquer le paiement, suivre une commande avec sa reference CMD ou une facture avec sa reference FAC.";
    }
    const commandRef = text.match(/cmd-\d+/i)?.[0]?.toUpperCase();
    if (commandRef) {
        const [[order]] = await pool.query(`SELECT statut, montant_ttc, vente_id FROM commandes WHERE id_commande = ? AND client_id = ? AND entreprise_id = ?`, [commandRef, user.client_id, user.entreprise_id]);
        if (order) return `La commande ${commandRef} est actuellement « ${order.statut} ». Son total est de ${Number(order.montant_ttc).toFixed(2)} USD TTC${order.vente_id ? ` et elle est liee a la facture ${order.vente_id}` : ''}.`;
    }
    const invoiceRef = text.match(/fac-(?:\d{4}-)?\d+/i)?.[0]?.toUpperCase();
    if (invoiceRef) {
        const [[invoice]] = await pool.query(`SELECT v.montant_ttc, IFNULL(SUM(p.montant),0) AS total_paye FROM ventes v LEFT JOIN paiement p ON p.vente_id=v.id_ventes WHERE v.id_ventes=? AND v.client_id=? AND v.entreprise_id=? GROUP BY v.id_ventes`, [invoiceRef, user.client_id, user.entreprise_id]);
        if (invoice) return `La facture ${invoiceRef} est de ${Number(invoice.montant_ttc).toFixed(2)} USD TTC. Montant paye : ${Number(invoice.total_paye).toFixed(2)} USD ; reste : ${(Number(invoice.montant_ttc) - Number(invoice.total_paye)).toFixed(2)} USD.`;
    }
    if (/^(bonjour|bonsoir|salut|slt|hello|bjr|cc)[!. ]*$/.test(text)) return `Bonjour${String(user.nom || '').trim() ? ` ${String(user.nom).trim()}` : ''}. Je suis l’assistant de Quincaillerie Centrale. Je peux verifier un prix, le stock, une commande, une facture ou un paiement.`;
    if (/(tu vas bien|vous allez bien|ca va|comment allez vous|comment vas tu)/.test(text)) {
        return "Je vais bien, merci. Je suis disponible pour vous aider avec un produit, une commande, une facture, un paiement ou une reclamation.";
    }
    if (/(je suis fache|je suis decu|pas content|mauvais service|trop lent|enerve|colere)/.test(text)) {
        return "Je comprends votre mecontentement et je suis desole pour cette experience. Donnez-moi la reference de la commande, de la facture ou expliquez le probleme; si la situation demande une decision humaine, je la transmettrai au manager.";
    }
    if (/(manager|responsable|gerant|parler a quelqu un|humain|agent)/.test(text)) {
        return null;
    }
    if (/(je viendrai demain|je vais venir demain|je passerai demain|je viens demain|demain je passe|je viendrais demain|je passerais demain)/.test(text)) {
        return "C'est note. Vous pouvez passer demain; si cela concerne une commande, gardez sa reference CMD ou votre facture FAC pour que l'equipe retrouve rapidement votre dossier.";
    }
    if (/(je vais passer|je passerai|je viens recuperer|je viens prendre|je viendrai|je passerais)/.test(text)) {
        return "Tres bien. Pensez a venir avec votre reference de commande ou de facture afin que l'equipe retrouve rapidement votre dossier.";
    }
    if (/(merci.*demain|a demain|ok demain)/.test(text)) {
        return "Parfait, a demain. Je reste disponible si vous voulez verifier une commande, une facture ou le stock avant votre passage.";
    }
    const ignored = new Set(['quel','quelle','quels','quelles','prix','combien','coute','cout','stock','disponible','avez','vous','produit','materiel','concernant','pour','dans','est','le','la','les','un','une','du','de','des']);
    const terms = text.replace(/[^a-z0-9 -]/g, ' ').split(/\s+/).filter((word) => word.length >= 3 && !ignored.has(word)).slice(0, 4);
    if (terms.length && /(prix|combien|coute|cout|stock|disponible|materiel|produit)/.test(text)) {
        const conditions = terms.map(() => `(LOWER(p.nom) LIKE ? OR LOWER(p.reference_produit) LIKE ? OR LOWER(IFNULL(c.nom,'')) LIKE ?)`).join(' OR ');
        const params = terms.flatMap((term) => [`%${term}%`, `%${term}%`, `%${term}%`]);
        const [products] = await pool.query(`SELECT p.nom,p.reference_produit,p.unite,p.prix_ht,p.quantite_stock,c.nom categorie_nom FROM produits p LEFT JOIN categorie_produit c ON c.id_categorie=p.categorie_id WHERE p.entreprise_id=? AND (${conditions}) ORDER BY p.quantite_stock DESC LIMIT 5`, [user.entreprise_id, ...params]);
        if (products.length) return products.map((p) => `${p.nom} (${p.reference_produit}) : ${Number(p.prix_ht).toFixed(2)} USD HT par ${p.unite || 'piece'}, stock ${p.quantite_stock}.`).join('\n');
    }
    if (/(adresse|situe|localisation|trouver)/.test(text)) return "Nous sommes sur l’Avenue du Commerce, quartier Murara, commune de Karisimbi à Goma.";
    if (/(commande|statut|livraison|suivre)/.test(text)) return "Ouvrez la rubrique Commandes pour voir le statut exact : en attente, confirmee, preparee ou livree. Donnez-moi la reference CMD si vous avez besoin d’aide supplementaire.";
    if (/(prix|catalogue|produit|stock|disponible)/.test(text)) return "Indiquez le nom du materiel recherche. Je consulterai directement le catalogue et le stock disponibles.";
    if (/(paiement|payer|stripe|carte|mobile money|mpesa|airtel money|orange money)/.test(text)) return "Pour payer, ouvrez Mes achats puis choisissez une facture avec un reste à payer. En mode test, le bouton Payer Stripe test permet un paiement complet ou partiel par carte. Si aucune facture n'apparait, votre commande doit d'abord etre validee et transformee en facture par l'equipe.";
    if (/(facture|achat|reste|dette)/.test(text)) return "La rubrique Mes achats affiche vos factures, les montants payes et le reste à payer. Pour un cas precis, indiquez le numero de facture FAC.";
    if (/(reclamation|plainte|probleme|endommage|erreur)/.test(text)) return "Vous pouvez ouvrir une reclamation depuis la rubrique Reclamations. Elle sera transmise au manager avec la reference de votre commande ou facture.";
    if (/(horaire|ouvert|ferme)/.test(text)) return "Les horaires ne sont pas encore publies dans le systeme. Votre question est transmise au manager pour une reponse confirmee.";
    const [catalogue] = await pool.query(`SELECT p.nom,p.reference_produit,p.unite,p.prix_ht,p.quantite_stock,c.nom categorie_nom FROM produits p LEFT JOIN categorie_produit c ON c.id_categorie=p.categorie_id WHERE p.entreprise_id=? AND p.quantite_stock>0 AND p.prix_ht>=p.prix_achat ORDER BY p.nom LIMIT 60`, [user.entreprise_id]);
    const [recentOrders] = await pool.query(`SELECT id_commande,statut,montant_ttc,date_commande FROM commandes WHERE client_id=? AND entreprise_id=? ORDER BY date_commande DESC LIMIT 5`, [user.client_id, user.entreprise_id]);
    const [recentInvoices] = await pool.query(`SELECT v.id_ventes,v.numero_facture,v.montant_ttc,IFNULL(SUM(p.montant),0) total_paye FROM ventes v LEFT JOIN paiement p ON p.vente_id=v.id_ventes WHERE v.client_id=? AND v.entreprise_id=? GROUP BY v.id_ventes ORDER BY v.date_vente DESC LIMIT 5`, [user.client_id, user.entreprise_id]);
    const [history] = conversationId
        ? await pool.query(`SELECT sender_type,message,created_at FROM chat_messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT 8`, [conversationId])
        : [[]];
    const aiReply = await generateBusinessReply({
        question: message,
        clientName: user.nom,
        context: {
            entreprise: {
                nom: 'Quincaillerie Centrale',
                ville: 'Goma',
                espace_client: ['Commandes', 'Mes achats', 'Reclamations', 'Assistance', 'Paiement Stripe test si active']
            },
            catalogue,
            commandes_recentes: recentOrders,
            factures_recentes: recentInvoices,
            conversation_recente: history.reverse()
        }
    });
    if (aiReply && !aiReply.includes('TRANSFERER_MANAGER')) return aiReply;
    return "Je comprends votre message. Pour vous aider correctement, je peux verifier un prix ou un stock, suivre une commande avec sa reference CMD, expliquer une facture FAC, orienter le paiement ou vous guider pour une reclamation. Donnez-moi simplement la reference ou le produit concerne.";
};

const loadMessages = async (conversationId) => {
    const [messages] = await pool.query(`SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`, [conversationId]);
    return messages;
};

export const getChats = async (req, res) => {
    try {
        if (!isClient(req) && req.user.role !== 'manager') return res.status(403).json({ success: false, message: 'Chat reserve aux clients et au manager.' });
        const params = [req.user.entreprise_id];
        const filter = isClient(req) ? ' AND cc.client_id = ?' : '';
        if (isClient(req)) params.push(req.user.client_id);
        const [rows] = await pool.query(
            `SELECT cc.*, c.nom AS client_nom, c.postnom AS client_postnom,
                    (SELECT message FROM chat_messages WHERE conversation_id = cc.id_conversation ORDER BY created_at DESC LIMIT 1) AS dernier_message
             FROM chat_conversations cc JOIN client c ON c.id_client = cc.client_id
             WHERE cc.entreprise_id = ?${filter} ORDER BY cc.updated_at DESC`, params
        );
        for (const row of rows) row.messages = await loadMessages(row.id_conversation);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const streamChatUpdates = (req, res) => {
    if (!isClient(req) && req.user.role !== 'manager') return res.status(403).end();
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`event: connected\ndata: {"connected":true}\n\n`);
    const unsubscribe = subscribeToChat(req.user.entreprise_id, res);
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 20000);
    req.on('close', () => { clearInterval(heartbeat); unsubscribe(); });
};

export const getManagerAiAnalysis = async (req, res) => {
    if (req.user.role !== 'manager') return res.status(403).json({ success: false, message: 'Analyse reservee au manager.' });
    const [[stats]] = await pool.query(`SELECT (SELECT COUNT(*) FROM client WHERE entreprise_id=?) clients,(SELECT COUNT(*) FROM commandes WHERE entreprise_id=? AND statut='en_attente') commandes_attente,(SELECT COUNT(*) FROM reclamations WHERE entreprise_id=? AND statut IN ('ouverte','en_cours')) reclamations_ouvertes,(SELECT COUNT(*) FROM produits WHERE entreprise_id=? AND quantite_stock<=seuil_alerte) alertes_stock`, [req.user.entreprise_id,req.user.entreprise_id,req.user.entreprise_id,req.user.entreprise_id]);
    const [top] = await pool.query(`SELECT c.nom,COUNT(v.id_ventes) achats,IFNULL(SUM(v.montant_ttc),0) chiffre_affaires FROM client c LEFT JOIN ventes v ON v.client_id=c.id_client WHERE c.entreprise_id=? GROUP BY c.id_client ORDER BY chiffre_affaires DESC LIMIT 5`, [req.user.entreprise_id]);
    const [slowStock] = await pool.query(`SELECT nom,quantite_stock,prix_ht FROM produits WHERE entreprise_id=? ORDER BY quantite_stock DESC LIMIT 10`, [req.user.entreprise_id]);
    const analysis = await generateManagerAnalysis({ stats, meilleurs_clients: top, stock: slowStock });
    res.json({
        success: true,
        data: {
            analysis: analysis || managerLocalAnalysis({ stats, meilleurs_clients: top, stock: slowStock }),
            generated_at: new Date().toISOString(),
            mode: analysis ? 'openai' : 'local'
        }
    });
};

export const sendChatMessage = async (req, res) => {
    const message = String(req.body.message || '').trim();
    if (!message || message.length > 2000) return res.status(400).json({ success: false, message: 'Message requis (2000 caracteres maximum).' });
    if (!isClient(req) && req.user.role !== 'manager') return res.status(403).json({ success: false, message: 'Action interdite.' });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let conversationId = String(req.body.conversation_id || '').trim();
        let conversation;
        if (conversationId) {
            const [[row]] = await connection.query(`SELECT * FROM chat_conversations WHERE id_conversation = ? AND entreprise_id = ?`, [conversationId, req.user.entreprise_id]);
            conversation = row;
        } else if (isClient(req)) {
            const [[row]] = await connection.query(`SELECT * FROM chat_conversations WHERE client_id = ? AND entreprise_id = ? AND statut <> 'resolue' ORDER BY created_at DESC LIMIT 1`, [req.user.client_id, req.user.entreprise_id]);
            conversation = row;
            if (!conversation) {
                conversationId = await nextId(connection, 'chat_conversations', 'CHAT', 6);
                await connection.query(`INSERT INTO chat_conversations (id_conversation, client_id, entreprise_id) VALUES (?, ?, ?)`, [conversationId, req.user.client_id, req.user.entreprise_id]);
                conversation = { id_conversation: conversationId, client_id: req.user.client_id };
            }
        }
        if (!conversation || (isClient(req) && conversation.client_id !== req.user.client_id)) throw new Error('Conversation introuvable.');
        conversationId = conversation.id_conversation;
        const senderType = isClient(req) ? 'client' : 'manager';
        const messageId = await nextId(connection, 'chat_messages', 'MSG', 7);
        await connection.query(`INSERT INTO chat_messages (id_message, conversation_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?, ?)`, [messageId, conversationId, senderType, req.user.id, message]);
        let reply = null;
        if (isClient(req)) {
            reply = await automaticReply(message, req.user, conversationId);
            if (reply) {
                const botId = await nextId(connection, 'chat_messages', 'MSG', 7);
                await connection.query(`INSERT INTO chat_messages (id_message, conversation_id, sender_type, sender_id, message) VALUES (?, ?, 'bot', NULL, ?)`, [botId, conversationId, reply]);
                await connection.query(`UPDATE chat_conversations SET statut = 'ouverte', updated_at = NOW() WHERE id_conversation = ?`, [conversationId]);
            } else {
                reply = "Je n'ai pas une reponse suffisamment fiable pour cette question. Je viens de la transmettre au manager, qui vous repondra ici dans quelques minutes.";
                const botId = await nextId(connection, 'chat_messages', 'MSG', 7);
                await connection.query(`INSERT INTO chat_messages (id_message, conversation_id, sender_type, sender_id, message) VALUES (?, ?, 'bot', NULL, ?)`, [botId, conversationId, reply]);
                await connection.query(`UPDATE chat_conversations SET statut = 'en_attente_manager', updated_at = NOW() WHERE id_conversation = ?`, [conversationId]);
            }
        } else {
            await connection.query(`UPDATE chat_conversations SET statut = 'ouverte', updated_at = NOW() WHERE id_conversation = ?`, [conversationId]);
        }
        await connection.commit();
        publishChatUpdate(req.user.entreprise_id, { conversation_id: conversationId, sender_type: senderType });
        const [[chatState]] = await pool.query(`SELECT statut FROM chat_conversations WHERE id_conversation = ?`, [conversationId]);
        const escalated = isClient(req) && chatState?.statut === 'en_attente_manager';
        if (escalated) {
            await notifyEnterpriseAdmins({ entreprise_id: req.user.entreprise_id, titre: 'Message client à traiter', message: `${req.user.nom || 'Un client'} attend une reponse dans ${conversationId}.`, entity_type: 'chat', entity_id: conversationId }).catch(() => null);
            const [managers] = await pool.query(`SELECT nom, email FROM utilisateur WHERE entreprise_id = ? AND role = 'manager' AND actif = 1 AND email IS NOT NULL`, [req.user.entreprise_id]);
            for (const manager of managers) await sendManagerChatAlertEmail({ to: manager.email, managerName: manager.nom, clientName: req.user.nom, clientEmail: req.user.email, conversationId, message }).catch(() => null);
        }
        if (!isClient(req)) await createNotification({ recipient_type: 'user', recipient_user_id: conversation.client_id, entreprise_id: req.user.entreprise_id, titre: 'Nouvelle reponse du manager', message: `Une reponse a ete ajoutee dans ${conversationId}.`, entity_type: 'chat', entity_id: conversationId }).catch(() => null);
        res.status(201).json({ success: true, message: escalated ? 'Question transmise au manager.' : 'Reponse automatique envoyee.', conversation_id: conversationId, automatic_reply: reply, escalated });
    } catch (error) {
        await connection.rollback(); res.status(400).json({ success: false, message: error.message });
    } finally { connection.release(); }
};
