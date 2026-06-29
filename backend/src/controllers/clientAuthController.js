import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';
import { nextId } from '../services/idService.js';
import { getMailErrorMessage, sendClientWelcomeEmail, sendVerificationCodeEmail } from '../services/mailService.js';

const tokenFor = (client) => jwt.sign({
    id: client.id_client,
    client_id: client.id_client,
    entreprise_id: client.entreprise_id,
    email: client.email,
    nom: client.nom,
    role: 'client',
    type: 'client'
}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });

const publicClient = (client) => ({
    id: client.id_client,
    id_client: client.id_client,
    nom: client.nom,
    postnom: client.postnom,
    email: client.email,
    telephone: client.telephone,
    entreprise_id: client.entreprise_id,
    entreprise_nom: client.entreprise_nom,
    entreprise_logo: client.entreprise_logo || null,
    role: 'client',
    type: 'client'
});

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const registrationHash = (email, code) => crypto.createHash('sha256').update(`${normalizeEmail(email)}:${code}:${process.env.JWT_SECRET || 'crm-client-registration'}`).digest('hex');

export const registerClient = async (req, res) => {
    const nom = String(req.body.nom || '').trim();
    const postnom = String(req.body.postnom || '').trim();
    const telephone = String(req.body.telephone || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!nom || !email || !telephone || !password) return res.status(400).json({ success: false, message: 'Nom, telephone, email et mot de passe sont requis.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: 'Adresse email invalide.' });
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule et un chiffre.' });
    }
    try {
        const [[existing]] = await pool.query(`SELECT id_client FROM client WHERE LOWER(email) = ? LIMIT 1`, [email]);
        if (existing) return res.status(409).json({ success: false, message: 'Un compte client utilise deja cette adresse email.' });
        const [[recent]] = await pool.query(`SELECT created_at FROM client_registration_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1`, [email]);
        if (recent && Date.now() - new Date(recent.created_at).getTime() < 60000) {
            return res.status(429).json({ success: false, message: 'Veuillez patienter une minute avant de demander un nouveau code.' });
        }
        const [[company]] = await pool.query(`SELECT id_entreprise FROM entreprise ORDER BY id_entreprise LIMIT 1`);
        if (!company) return res.status(503).json({ success: false, message: 'Les inscriptions sont temporairement indisponibles.' });
        const code = String(crypto.randomInt(100000, 1000000));
        await pool.query(`UPDATE client_registration_codes SET used_at = NOW() WHERE email = ? AND used_at IS NULL`, [email]);
        await pool.query(
            `INSERT INTO client_registration_codes (entreprise_id, nom, postnom, telephone, email, password_hash, code_hash, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
            [company.id_entreprise, nom, postnom || null, telephone, email, await bcrypt.hash(password, 10), registrationHash(email, code)]
        );
        const mail = await sendVerificationCodeEmail({ to: email, name: nom, code });
        if (mail?.skipped) return res.status(503).json({ success: false, message: 'Le service email doit etre configure avant de pouvoir confirmer votre inscription.' });
        res.status(201).json({ success: true, message: 'Un code de confirmation a ete envoye à votre adresse email.', email });
    } catch (error) {
        res.status(500).json({ success: false, message: getMailErrorMessage(error) });
    }
};

export const verifyClientEmail = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || '').trim();
    if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: 'Email et code à 6 chiffres requis.' });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[pending]] = await connection.query(
            `SELECT * FROM client_registration_codes WHERE email = ? AND code_hash = ? AND used_at IS NULL AND expires_at >= NOW()
             ORDER BY created_at DESC LIMIT 1 FOR UPDATE`, [email, registrationHash(email, code)]
        );
        if (!pending) { await connection.rollback(); return res.status(400).json({ success: false, message: 'Code invalide ou expire.' }); }
        const [[existing]] = await connection.query(`SELECT id_client FROM client WHERE LOWER(email) = ? LIMIT 1`, [email]);
        if (existing) { await connection.rollback(); return res.status(409).json({ success: false, message: 'Ce compte client existe deja.' }); }
        const clientId = await nextId(connection, 'client', 'CLI', 5);
        await connection.query(
            `INSERT INTO client (id_client, nom, postnom, telephone, email, mot_de_passe, entreprise_id, actif,email_verified_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1,NOW())`,
            [clientId, pending.nom, pending.postnom, pending.telephone, pending.email, pending.password_hash, pending.entreprise_id]
        );
        await connection.query(`UPDATE client_registration_codes SET used_at = NOW() WHERE id_registration = ?`, [pending.id_registration]);
        await connection.commit();
        const conversationId = await nextId(connection, 'chat_conversations', 'CHAT', 6);
        const welcomeMessageId = await nextId(connection, 'chat_messages', 'MSG', 7);
        await connection.query(`INSERT INTO chat_conversations (id_conversation,client_id,entreprise_id,statut) VALUES (?,?,?,'ouverte')`, [conversationId, clientId, pending.entreprise_id]);
        await connection.query(`INSERT INTO chat_messages (id_message,conversation_id,sender_type,message) VALUES (?,?,'bot',?)`, [welcomeMessageId, conversationId, `Bienvenue ${pending.nom} chez Quincaillerie Centrale. Votre espace est pret. Je peux vous aider a trouver un materiel, verifier un prix ou suivre une commande.`]);
        const [[client]] = await pool.query(
            `SELECT c.*, e.raison_sociale AS entreprise_nom, e.logo_url AS entreprise_logo FROM client c JOIN entreprise e ON e.id_entreprise = c.entreprise_id WHERE c.id_client = ?`, [clientId]
        );
        sendClientWelcomeEmail({ to: client.email, name: client.nom }).catch(() => null);
        res.status(201).json({ success: true, message: 'Votre adresse email est confirmee. Bienvenue !', token: tokenFor(client), user: publicClient(client) });
    } catch (error) {
        await connection.rollback(); res.status(500).json({ success: false, message: error.message });
    } finally { connection.release(); }
};

export const resendClientCode = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ success: false, message: 'Adresse email requise.' });
    try {
        const [[pending]] = await pool.query(
            `SELECT * FROM client_registration_codes WHERE email = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`, [email]
        );
        if (!pending) return res.status(404).json({ success: false, message: 'Aucune inscription en attente pour cette adresse.' });
        if (Date.now() - new Date(pending.created_at).getTime() < 60000) return res.status(429).json({ success: false, message: 'Veuillez patienter une minute avant de renvoyer le code.' });
        const code = String(crypto.randomInt(100000, 1000000));
        await pool.query(`UPDATE client_registration_codes SET code_hash = ?, expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE), created_at = NOW() WHERE id_registration = ?`, [registrationHash(email, code), pending.id_registration]);
        const mail = await sendVerificationCodeEmail({ to: email, name: pending.nom, code });
        if (mail?.skipped) return res.status(503).json({ success: false, message: 'Service email non configure.' });
        res.json({ success: true, message: 'Un nouveau code vient de vous etre envoye.' });
    } catch (error) { res.status(500).json({ success: false, message: getMailErrorMessage(error) }); }
};

export const loginClient = async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    try {
        const [rows] = await pool.query(
            `SELECT c.*, e.raison_sociale AS entreprise_nom, e.logo_url AS entreprise_logo
             FROM client c JOIN entreprise e ON e.id_entreprise = c.entreprise_id
             WHERE LOWER(c.email) = ? AND c.actif = 1`, [email]
        );
        const client = rows[0];
        if (!client?.mot_de_passe || !(await bcrypt.compare(password, client.mot_de_passe))) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe client incorrect.' });
        }
        res.json({ success: true, token: tokenFor(client), user: publicClient(client) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClientMe = async (req, res) => {
    try {
        const [[client]] = await pool.query(
            `SELECT c.*, e.raison_sociale AS entreprise_nom, e.logo_url AS entreprise_logo
             FROM client c JOIN entreprise e ON e.id_entreprise = c.entreprise_id
             WHERE c.id_client = ? AND c.entreprise_id = ? AND c.actif = 1`,
            [req.user.client_id, req.user.entreprise_id]
        );
        if (!client) return res.status(404).json({ success: false, message: 'Compte client introuvable.' });
        res.json({ success: true, user: publicClient(client) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClientDashboard = async (req, res) => {
    const clientId = req.user.client_id;
    const entrepriseId = req.user.entreprise_id;

    try {
        const [
            [[orderStats]],
            [[invoiceStats]],
            [[complaintStats]],
            [latestOrders],
            [recentInvoices]
        ] = await Promise.all([
            pool.query(
                `SELECT
                    COUNT(*) AS total_commandes,
                    SUM(statut = 'en_attente') AS commandes_en_attente,
                    SUM(statut IN ('confirmee', 'preparee')) AS commandes_en_cours,
                    SUM(statut = 'livree') AS commandes_livrees
                 FROM commandes
                 WHERE client_id = ? AND entreprise_id = ?`,
                [clientId, entrepriseId]
            ),
            pool.query(
                `SELECT
                    COUNT(*) AS total_factures,
                    COALESCE(SUM(v.montant_ttc), 0) AS total_achats,
                    COALESCE(SUM(IFNULL(pay.total_paye, 0)), 0) AS total_paye,
                    COALESCE(SUM(GREATEST(v.montant_ttc - IFNULL(pay.total_paye, 0), 0)), 0) AS total_restant
                 FROM ventes v
                 LEFT JOIN (
                    SELECT vente_id, SUM(montant) AS total_paye
                    FROM paiement
                    GROUP BY vente_id
                 ) pay ON pay.vente_id = v.id_ventes
                 WHERE v.client_id = ? AND v.entreprise_id = ?`,
                [clientId, entrepriseId]
            ),
            pool.query(
                `SELECT
                    COUNT(*) AS total_reclamations,
                    SUM(statut NOT IN ('resolue', 'cloturee')) AS reclamations_ouvertes
                 FROM reclamations
                 WHERE client_id = ? AND entreprise_id = ?`,
                [clientId, entrepriseId]
            ),
            pool.query(
                `SELECT co.id_commande, co.montant_ttc, co.statut, co.date_commande,
                        co.updated_at, v.numero_facture
                 FROM commandes co
                 LEFT JOIN ventes v ON v.id_ventes = co.vente_id
                 WHERE co.client_id = ? AND co.entreprise_id = ?
                 ORDER BY co.date_commande DESC
                 LIMIT 5`,
                [clientId, entrepriseId]
            ),
            pool.query(
                `SELECT v.id_ventes, v.numero_facture, v.montant_ttc, v.date_vente,
                        IFNULL(pay.total_paye, 0) AS total_paye,
                        GREATEST(v.montant_ttc - IFNULL(pay.total_paye, 0), 0) AS reste_a_payer
                 FROM ventes v
                 LEFT JOIN (
                    SELECT vente_id, SUM(montant) AS total_paye
                    FROM paiement
                    GROUP BY vente_id
                 ) pay ON pay.vente_id = v.id_ventes
                 WHERE v.client_id = ? AND v.entreprise_id = ?
                 ORDER BY v.date_vente DESC
                 LIMIT 5`,
                [clientId, entrepriseId]
            )
        ]);

        const normalizeNumbers = (row) => Object.fromEntries(
            Object.entries(row || {}).map(([key, value]) => [key, Number(value || 0)])
        );

        res.json({
            success: true,
            data: {
                stats: {
                    ...normalizeNumbers(orderStats),
                    ...normalizeNumbers(invoiceStats),
                    ...normalizeNumbers(complaintStats)
                },
                dernieres_commandes: latestOrders,
                factures_recentes: recentInvoices
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateClientProfile = async (req, res) => {
    const nom = String(req.body.nom || '').trim();
    if (!nom) return res.status(400).json({ success: false, message: 'Nom requis.' });
    try {
        await pool.query(
            `UPDATE client SET nom = ?, telephone = ? WHERE id_client = ? AND entreprise_id = ?`,
            [nom, String(req.body.telephone || '').trim() || null, req.user.client_id, req.user.entreprise_id]
        );
        req.user.nom = nom;
        return getClientMe(req, res);
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const changeClientPassword = async (req, res) => {
    const password = String(req.body.new_password || '');
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caracteres.' });
    try {
        await pool.query(`UPDATE client SET mot_de_passe = ? WHERE id_client = ? AND entreprise_id = ?`, [await bcrypt.hash(password, 10), req.user.client_id, req.user.entreprise_id]);
        res.json({ success: true, message: 'Mot de passe client mis a jour.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
