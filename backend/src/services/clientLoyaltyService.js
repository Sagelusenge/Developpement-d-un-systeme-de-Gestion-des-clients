import pool from '../config/db.js';
import { nextId } from './idService.js';
import { publishChatUpdate } from './chatRealtimeService.js';
import { sendProspectDiscoveryEmail } from './mailService.js';

const prospectCampaignKey = 'prospect_discovery_v1';

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
    const frontendOrigin = String(process.env.FRONTEND_URL || 'http://127.0.0.1:5174').split(',')[0].trim().replace(/\/$/, '');
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
