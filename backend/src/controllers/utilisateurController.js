import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendWelcomeUserEmail } from '../services/mailService.js';
import { nextId } from '../services/idService.js';

const rolesAutorises = ['manager', 'vendeur', 'magasinier'];
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const createResetCode = () => String(crypto.randomInt(100000, 1000000));
const hashResetCode = (email, code) => crypto
    .createHash('sha256')
    .update(`${normalizeEmail(email)}:${String(code || '').trim()}:${process.env.JWT_SECRET || 'crm-pme-reset'}`)
    .digest('hex');

const getFrontendUrl = () => String(process.env.FRONTEND_URL || 'http://127.0.0.1:5174').split(',')[0].trim().replace(/\/$/, '');
const resetPasswordUrl = ({ email, code }) => `${getFrontendUrl()}/connexion?reset=1&email=${encodeURIComponent(normalizeEmail(email))}&code=${encodeURIComponent(code)}`;

// GET /api/utilisateurs
export const getAllUtilisateurs = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT id_utilisateur, nom, email, role, actif, 'equipe' AS type_compte
             FROM utilisateur WHERE entreprise_id = ?
             UNION ALL
             SELECT id_client AS id_utilisateur, CONCAT(nom, ' ', IFNULL(postnom, '')) AS nom,
                    email, 'client' AS role, actif, 'client' AS type_compte
             FROM client WHERE entreprise_id = ? AND email IS NOT NULL
             ORDER BY role, nom`,
            [entreprise_id, entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/utilisateurs/:id/historique
export const getHistoriqueUtilisateur = async (req, res) => {
    const { id } = req.params;
    const entreprise_id = req.user.entreprise_id;

    try {
        const [users] = await pool.query(
            `SELECT id_utilisateur, nom, email, role, actif
             FROM utilisateur
             WHERE id_utilisateur = ? AND entreprise_id = ?`,
            [id, entreprise_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }

        const [logs] = await pool.query(
            `SELECT id_log, user_id, user_name, user_role, action_type, module, entity_id, description, metadata, created_at
             FROM user_activity_logs
             WHERE entreprise_id = ? AND user_id = ?
             ORDER BY created_at DESC
             LIMIT 100`,
            [entreprise_id, id]
        );

        res.json({
            success: true,
            data: {
                utilisateur: users[0],
                historique: logs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/utilisateurs/audit/journal
export const getJournalAudit = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    const fetchAll = String(req.query.all || '') === '1';
    const limit = Math.min(Math.max(Number(req.query.limit || 300), 20), 1000);
    const module = String(req.query.module || '').trim();
    const action = String(req.query.action || '').trim();

    try {
        const filters = ['entreprise_id = ?'];
        const params = [entreprise_id];

        if (module) {
            filters.push('module = ?');
            params.push(module);
        }

        if (action) {
            filters.push('action_type = ?');
            params.push(action);
        }

        const sql = 
            `SELECT id_log, user_id, user_name, user_role, action_type, module, entity_id,
                    description, metadata, created_at
             FROM user_activity_logs
             WHERE ${filters.join(' AND ')}
             ORDER BY created_at DESC${fetchAll ? '' : ' LIMIT ?'}`;
        const [rows] = await pool.query(sql, fetchAll ? params : [...params, limit]);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/utilisateurs
export const createUtilisateur = async (req, res) => {
    const { nom, email, role } = req.body;
    const entreprise_id = req.user.entreprise_id;

    if (!nom || !email || !role) {
        return res.status(400).json({
            success: false,
            message: 'Nom, email et role sont requis'
        });
    }

    if (!rolesAutorises.includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Role invalide'
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const id_utilisateur = await nextId(connection, 'utilisateur', 'USR', 5);
        const initialPassword = crypto.randomBytes(24).toString('base64url');
        const hashedMdp = await bcrypt.hash(initialPassword, 10);
        const resetCode = createResetCode();
        const normalizedEmail = normalizeEmail(email);

        await connection.query(
            `INSERT INTO utilisateur
                (id_utilisateur, entreprise_id, nom, email, mot_de_passe, role, actif)
             VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [id_utilisateur, entreprise_id, nom, normalizedEmail, hashedMdp, role]
        );

        await connection.query(
            `INSERT INTO password_reset_codes (user_id, email, code_hash, expires_at)
             VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
            [id_utilisateur, normalizedEmail, hashResetCode(normalizedEmail, resetCode)]
        );

        await connection.commit();

        sendWelcomeUserEmail({
            to: normalizedEmail,
            name: nom,
            role,
            resetUrl: resetPasswordUrl({ email: normalizedEmail, code: resetCode })
        }).catch((error) => console.error('Erreur email utilisateur:', error.message));

        res.status(201).json({
            success: true,
            message: `Utilisateur ${nom} cree avec le role ${role}`,
            data: { id_utilisateur, nom, email: normalizedEmail, role }
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

// PUT /api/utilisateurs/:id
export const updateUtilisateur = async (req, res) => {
    const { id } = req.params;
    const { nom, email, role, mot_de_passe } = req.body;
    const entreprise_id = req.user.entreprise_id;

    if (!nom || !email || !role) {
        return res.status(400).json({ success: false, message: 'Nom, email et role requis' });
    }

    if (!rolesAutorises.includes(role)) {
        return res.status(400).json({ success: false, message: 'Role invalide' });
    }

    try {
        let result;
        if (mot_de_passe) {
            const hashedMdp = await bcrypt.hash(mot_de_passe, 10);
            [result] = await pool.query(
                `UPDATE utilisateur
                 SET nom = ?, email = ?, role = ?, mot_de_passe = ?
                 WHERE id_utilisateur = ? AND entreprise_id = ?`,
                [nom, email, role, hashedMdp, id, entreprise_id]
            );
        } else {
            [result] = await pool.query(
                `UPDATE utilisateur
                 SET nom = ?, email = ?, role = ?
                 WHERE id_utilisateur = ? AND entreprise_id = ?`,
                [nom, email, role, id, entreprise_id]
            );
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }

        res.json({ success: true, message: 'Utilisateur mis a jour' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/utilisateurs/:id/toggle
export const toggleUtilisateur = async (req, res) => {
    const { id } = req.params;
    const entreprise_id = req.user.entreprise_id;

    try {
        const [users] = await pool.query(
            `SELECT actif FROM utilisateur WHERE id_utilisateur = ? AND entreprise_id = ?`,
            [id, entreprise_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }

        const [result] = await pool.query(
            `UPDATE utilisateur
             SET actif = NOT actif
             WHERE id_utilisateur = ? AND entreprise_id = ?`,
            [id, entreprise_id]
        );

        const wasActive = Boolean(users[0].actif);
        res.json({
            success: true,
            message: wasActive ? 'Utilisateur suspendu. Il ne peut plus se connecter.' : 'Utilisateur reactive. Il peut se connecter.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/utilisateurs/:id
export const deleteUtilisateur = async (req, res) => {
    const { id } = req.params;
    const entreprise_id = req.user.entreprise_id;

    if (id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    try {
        const [users] = await pool.query(
            `SELECT id_utilisateur, role
             FROM utilisateur
             WHERE id_utilisateur = ? AND entreprise_id = ?`,
            [id, entreprise_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }

        if (users[0].role === 'manager') {
            return res.status(403).json({ success: false, message: 'Un manager ne peut pas supprimer un autre manager' });
        }

        const [result] = await pool.query(
            `DELETE FROM utilisateur WHERE id_utilisateur = ? AND entreprise_id = ?`,
            [id, entreprise_id]
        );

        res.json({ success: true, message: 'Utilisateur supprime' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
