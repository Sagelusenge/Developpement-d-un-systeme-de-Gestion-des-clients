import pool from '../config/db.js';
import { nextId } from './idService.js';
import { publishChatUpdate } from './chatRealtimeService.js';
import {
    sendCategoryNewProductEmail,
    sendInactiveClientEmail,
    sendProspectDiscoveryEmail
} from './mailService.js';

const prospectCampaignKey = 'prospect_discovery_v1';
const inactiveCampaignPrefix = 'inactive_client';
const productCampaignPrefix = 'new_stock_product';

const getFrontendOrigin = () => String(process.env.FRONTEND_URL || 'http://127.0.0.1:5174')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');

const claimCampaign = async ({ clientId, entrepriseId, campaignKey }) => {
    const [claim] = await pool.query(
        `INSERT IGNORE INTO crm_email_campaigns (client_id,entreprise_id,campaign_key) VALUES (?,?,?)`,
        [clientId, entrepriseId, campaignKey]
    );
    return Boolean(claim.affectedRows);
};

const markCampaign = async ({ clientId, campaignKey, status, messageId = null, error = null }) => {
    await pool.query(
        `UPDATE crm_email_campaigns
         SET statut=?, provider_message_id=?, erreur=?, sent_at=IF(?='envoye',NOW(),sent_at)
         WHERE client_id=? AND campaign_key=?`,
        [status, messageId, error ? String(error).slice(0, 500) : null, status, clientId, campaignKey]
    );
};

export const sendProspectFollowUpEmails = async () => {
    const hours = Math.max(1, Math.min(720, Number.parseInt(process.env.PROSPECT_FOLLOWUP_HOURS || '24', 10) || 24));
    const [prospects] = await pool.query(
        `SELECT c.id_client,c.nom,c.email,c.entreprise_id
         FROM client c
         WHERE c.actif=1 AND c.email IS NOT NULL AND c.email<>'' AND c.email_verified_at IS NOT NULL
           AND c.created_at <= DATE_SUB(NOW(),INTERVAL ${hours} HOUR)
           AND NOT EXISTS (SELECT 1 FROM ventes v WHERE v.client_id=c.id_client)
           AND NOT EXISTS (SELECT 1 FROM prospect_email_campaigns pc WHERE pc.client_id=c.id_client AND pc.campaign_key=?)
         ORDER BY c.created_at ASC LIMIT 100`,
        [prospectCampaignKey]
    );
    const frontendOrigin = getFrontendOrigin();
    for (const prospect of prospects) {
        const [products] = await pool.query(`SELECT nom,unite,prix_ht,quantite_stock FROM produits WHERE entreprise_id=? AND quantite_stock>0 AND prix_ht>=prix_achat ORDER BY quantite_stock DESC,nom ASC LIMIT 3`, [prospect.entreprise_id]);
        if (products.length < 3) continue;
        const [claim] = await pool.query(`INSERT IGNORE INTO prospect_email_campaigns (client_id,entreprise_id,campaign_key) VALUES (?,?,?)`, [prospect.id_client, prospect.entreprise_id, prospectCampaignKey]);
        if (!claim.affectedRows) continue;
        try {
            const result = await sendProspectDiscoveryEmail({ to: prospect.email, name: prospect.nom, products, catalogUrl: `${frontendOrigin}/connexion` });
            if (result?.skipped) {
                await pool.query(`DELETE FROM prospect_email_campaigns WHERE client_id=? AND campaign_key=? AND statut='en_cours'`, [prospect.id_client, prospectCampaignKey]);
                continue;
            }
            await pool.query(`UPDATE prospect_email_campaigns SET statut='envoye',provider_message_id=?,sent_at=NOW() WHERE client_id=? AND campaign_key=?`, [result.messageId || null, prospect.id_client, prospectCampaignKey]);
        } catch (error) {
            await pool.query(`UPDATE prospect_email_campaigns SET statut='echec',erreur=? WHERE client_id=? AND campaign_key=?`, [String(error.message || error).slice(0, 500), prospect.id_client, prospectCampaignKey]);
        }
    }
};

export const sendWeeklyClientRecommendations = async () => {
    const [clients] = await pool.query(`SELECT c.id_client,c.nom,c.entreprise_id FROM client c WHERE c.actif=1 AND c.created_at <= DATE_SUB(NOW(),INTERVAL 7 DAY) AND NOT EXISTS (SELECT 1 FROM chat_conversations cc JOIN chat_messages cm ON cm.conversation_id=cc.id_conversation WHERE cc.client_id=c.id_client AND cm.sender_type='bot' AND cm.message LIKE '[Conseil de la semaine]%' AND cm.created_at >= DATE_SUB(NOW(),INTERVAL 7 DAY)) LIMIT 100`);
    for (const client of clients) {
        const [products] = await pool.query(`SELECT nom,unite,prix_ht,quantite_stock FROM produits WHERE entreprise_id=? AND quantite_stock>0 AND prix_ht>=prix_achat ORDER BY quantite_stock DESC,nom LIMIT 3`, [client.entreprise_id]);
        if (!products.length) continue;
        const connection = await pool.getConnection();
        try {
            let [[conversation]] = await connection.query(`SELECT id_conversation FROM chat_conversations WHERE client_id=? AND entreprise_id=? AND statut<>'resolue' ORDER BY updated_at DESC LIMIT 1`, [client.id_client, client.entreprise_id]);
            if (!conversation) { const id = await nextId(connection, 'chat_conversations', 'CHAT', 6); await connection.query(`INSERT INTO chat_conversations (id_conversation,client_id,entreprise_id) VALUES (?,?,?)`, [id, client.id_client, client.entreprise_id]); conversation = { id_conversation: id }; }
            const messageId = await nextId(connection, 'chat_messages', 'MSG', 7);
            const selection = products.map((p) => `${p.nom}: ${Number(p.prix_ht).toFixed(2)} USD HT/${p.unite || 'piece'}`).join(' ; ');
            await connection.query(`INSERT INTO chat_messages (id_message,conversation_id,sender_type,message) VALUES (?,?,'bot',?)`, [messageId, conversation.id_conversation, `[Conseil de la semaine] Bonjour ${client.nom}. Voici une selection disponible, sans multiplier les messages: ${selection}. Ecrivez-moi le nom d'un produit pour verifier son stock.`]);
            publishChatUpdate(client.entreprise_id, { conversation_id: conversation.id_conversation, sender_type: 'bot' });
        } finally { connection.release(); }
    }
};

export const sendInactiveClientEmails = async () => {
    const days = Math.max(1, Math.min(365, Number.parseInt(process.env.INACTIVE_CLIENT_EMAIL_DAYS || '7', 10) || 7));
    const campaignKey = `${inactiveCampaignPrefix}_${days}d`;
    const frontendOrigin = getFrontendOrigin();
    const [clients] = await pool.query(
        `SELECT c.id_client,c.nom,c.email,c.entreprise_id,MAX(v.date_vente) AS last_purchase,COUNT(v.id_ventes) AS purchases
         FROM client c
         JOIN ventes v ON v.client_id=c.id_client
         WHERE c.actif=1 AND c.email IS NOT NULL AND c.email<>'' AND c.email_verified_at IS NOT NULL
         GROUP BY c.id_client
         HAVING purchases > 0
            AND last_purchase <= DATE_SUB(NOW(),INTERVAL ? DAY)
            AND NOT EXISTS (
                SELECT 1 FROM crm_email_campaigns ce
                WHERE ce.client_id=c.id_client
                  AND ce.campaign_key LIKE ?
                  AND ce.created_at >= DATE_SUB(NOW(),INTERVAL ? DAY)
            )
         ORDER BY last_purchase ASC LIMIT 100`,
        [days, `${campaignKey}_%`, days]
    );

    for (const client of clients) {
        const [products] = await pool.query(
            `SELECT DISTINCT p.nom,p.unite,p.prix_ht,p.quantite_stock
             FROM produits p
             WHERE p.entreprise_id=? AND p.quantite_stock>0 AND p.prix_ht>=p.prix_achat
               AND p.categorie_id IS NOT NULL
               AND EXISTS (
                   SELECT 1
                   FROM ventes v_old
                   JOIN lignes_ventes lv_old ON lv_old.vente_id = v_old.id_ventes
                   JOIN produits bought ON bought.id_produit = lv_old.produit_id
                   WHERE v_old.client_id=? AND bought.categorie_id = p.categorie_id
               )
             ORDER BY p.quantite_stock DESC,p.nom ASC LIMIT 3`,
            [client.entreprise_id, client.id_client]
        );
        if (!products.length) continue;
        const uniqueKey = `${campaignKey}_${new Date().toISOString().slice(0, 10)}`;
        if (!await claimCampaign({ clientId: client.id_client, entrepriseId: client.entreprise_id, campaignKey: uniqueKey })) continue;
        try {
            const result = await sendInactiveClientEmail({ to: client.email, name: client.nom, products, espaceUrl: `${frontendOrigin}/connexion`, days });
            if (result?.skipped) {
                await pool.query(`DELETE FROM crm_email_campaigns WHERE client_id=? AND campaign_key=? AND statut='en_cours'`, [client.id_client, uniqueKey]);
                continue;
            }
            await markCampaign({ clientId: client.id_client, campaignKey: uniqueKey, status: 'envoye', messageId: result.messageId || null });
        } catch (error) {
            await markCampaign({ clientId: client.id_client, campaignKey: uniqueKey, status: 'echec', error: error.message || error });
        }
    }
};

export const notifyClientsForNewCategoryProduct = async ({ productId, entrepriseId }) => {
    const frontendOrigin = getFrontendOrigin();
    const [[product]] = await pool.query(
        `SELECT p.id_produit,p.nom,p.unite,p.prix_ht,p.quantite_stock,p.categorie_id,c.nom AS categorie_nom
         FROM produits p LEFT JOIN categorie_produit c ON c.id_categorie=p.categorie_id
         WHERE p.id_produit=? AND p.entreprise_id=? AND p.quantite_stock>0 AND p.prix_ht>=p.prix_achat`,
        [productId, entrepriseId]
    );
    if (!product) return;
    const [clients] = await pool.query(
        `SELECT DISTINCT c.id_client,c.nom,c.email,c.entreprise_id
         FROM client c
         WHERE c.entreprise_id=? AND c.actif=1
           AND c.email IS NOT NULL AND c.email<>''
           AND c.email_verified_at IS NOT NULL
         LIMIT 500`,
        [entrepriseId]
    );
    let sent = 0;
    for (const client of clients) {
        const campaignKey = `${productCampaignPrefix}_${product.id_produit}`;
        if (!await claimCampaign({ clientId: client.id_client, entrepriseId: client.entreprise_id, campaignKey })) continue;
        try {
            const result = await sendCategoryNewProductEmail({
                to: client.email,
                name: client.nom,
                product,
                categoryName: product.categorie_nom,
                espaceUrl: `${frontendOrigin}/connexion`
            });
            if (result?.skipped) {
                await pool.query(`DELETE FROM crm_email_campaigns WHERE client_id=? AND campaign_key=? AND statut='en_cours'`, [client.id_client, campaignKey]);
                continue;
            }
            sent += 1;
            await markCampaign({ clientId: client.id_client, campaignKey, status: 'envoye', messageId: result.messageId || null });
        } catch (error) {
            await markCampaign({ clientId: client.id_client, campaignKey, status: 'echec', error: error.message || error });
        }
    }
    if (sent > 0) {
        await pool.query(
            `INSERT INTO mail_messages
                (entreprise_id, sender_email, to_email, subject, message, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                entrepriseId,
                process.env.EMAIL_USER || null,
                `Tous les clients confirmes (${sent})`,
                `Nouveau produit disponible en stock: ${product.nom}`,
                `Campagne automatique envoyee pour le produit ${product.nom} (${product.id_produit}), categorie ${product.categorie_nom || 'non renseignee'}, prix ${Number(product.prix_ht || 0).toFixed(2)} USD.`,
                'envoye'
            ]
        );
    }
};
