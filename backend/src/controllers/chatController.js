import pool from '../config/db.js';
import { nextId } from '../services/idService.js';
import { createNotification, notifyEnterpriseAdmins } from '../services/notificationService.js';

const isClient = (req) => req.user.type === 'client';
const automaticReply = (message) => {
    const text = String(message || '').trim().toLowerCase();
    if (/^(bonjour|bonsoir|salut|hello|bjr|cc)[!. ]*$/.test(text)) return "Bonjour ! Je suis l’assistant de Quincaillerie Centrale. Posez directement votre question sur une commande, un prix, une facture, un paiement ou une reclamation.";
    if (/(adresse|situe|localisation|trouver)/.test(text)) return "Nous sommes sur l’Avenue du Commerce, quartier Murara, commune de Karisimbi à Goma.";
    if (/(commande|statut|livraison|suivre)/.test(text)) return "Ouvrez la rubrique Commandes pour voir le statut exact : en attente, confirmee, preparee ou livree. Donnez-moi la reference CMD si vous avez besoin d’aide supplementaire.";
    if (/(prix|catalogue|produit|stock|disponible)/.test(text)) return "Les prix affiches dans le catalogue sont les prix de vente HT ; le total de la commande inclut 16 % de TVA. Seuls les produits en stock et dont le prix couvre le cout d’achat peuvent etre commandes.";
    if (/(facture|achat|paiement|reste|dette)/.test(text)) return "La rubrique Mes achats affiche vos factures, les montants payes et le reste à payer. Pour un cas precis, indiquez le numero de facture FAC.";
    if (/(reclamation|plainte|probleme|endommage|erreur)/.test(text)) return "Vous pouvez ouvrir une reclamation depuis la rubrique Reclamations. Elle sera transmise au manager avec la reference de votre commande ou facture.";
    if (/(horaire|ouvert|ferme)/.test(text)) return "Les horaires ne sont pas encore publies dans le systeme. Votre question est transmise au manager pour une reponse confirmee.";
    return null;
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
            reply = automaticReply(message);
            if (reply) {
                const botId = await nextId(connection, 'chat_messages', 'MSG', 7);
                await connection.query(`INSERT INTO chat_messages (id_message, conversation_id, sender_type, sender_id, message) VALUES (?, ?, 'bot', NULL, ?)`, [botId, conversationId, reply]);
                await connection.query(`UPDATE chat_conversations SET statut = 'ouverte', updated_at = NOW() WHERE id_conversation = ?`, [conversationId]);
            } else {
                await connection.query(`UPDATE chat_conversations SET statut = 'en_attente_manager', updated_at = NOW() WHERE id_conversation = ?`, [conversationId]);
            }
        } else {
            await connection.query(`UPDATE chat_conversations SET statut = 'ouverte', updated_at = NOW() WHERE id_conversation = ?`, [conversationId]);
        }
        await connection.commit();
        if (isClient(req) && !reply) await notifyEnterpriseAdmins({ entreprise_id: req.user.entreprise_id, titre: 'Message client à traiter', message: `${req.user.nom || 'Un client'} attend une reponse dans ${conversationId}.`, entity_type: 'chat', entity_id: conversationId }).catch(() => null);
        if (!isClient(req)) await createNotification({ recipient_type: 'user', recipient_user_id: conversation.client_id, entreprise_id: req.user.entreprise_id, titre: 'Nouvelle reponse du manager', message: `Une reponse a ete ajoutee dans ${conversationId}.`, entity_type: 'chat', entity_id: conversationId }).catch(() => null);
        res.status(201).json({ success: true, message: reply ? 'Reponse automatique envoyee.' : 'Message enregistre.', conversation_id: conversationId, automatic_reply: reply });
    } catch (error) {
        await connection.rollback(); res.status(400).json({ success: false, message: error.message });
    } finally { connection.release(); }
};
