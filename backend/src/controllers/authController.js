import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { brandedEmail, codeBlock, getMailErrorMessage, sendMail, sendPasswordCodeEmail, sendSecurityNoticeEmail } from '../services/mailService.js';

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id_utilisateur,
            email: user.email,
            role: user.role,
            entreprise_id: user.entreprise_id,
            nom: user.nom,
            type: 'utilisateur'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const createResetCode = () => String(crypto.randomInt(100000, 1000000));

const hashResetCode = (email, code) => crypto
    .createHash('sha256')
    .update(`${normalizeEmail(email)}:${String(code || '').trim()}:${process.env.JWT_SECRET || 'crm-pme-reset'}`)
    .digest('hex');

const findValidResetCode = async ({ email, code }) => {
    const [rows] = await pool.query(
        `SELECT prc.id_reset, prc.user_id, prc.email, u.nom
         FROM password_reset_codes prc
         JOIN utilisateur u ON u.id_utilisateur = prc.user_id
         WHERE prc.email = ?
           AND prc.code_hash = ?
           AND prc.used_at IS NULL
           AND prc.expires_at >= NOW()
           AND u.actif = 1
         ORDER BY prc.created_at DESC
         LIMIT 1`,
        [normalizeEmail(email), hashResetCode(email, code)]
    );

    if (rows[0]) return { ...rows[0], account_type: 'utilisateur' };
    const [clients] = await pool.query(
        `SELECT prc.id_reset, prc.client_id, prc.email, c.nom
         FROM client_password_reset_codes prc JOIN client c ON c.id_client = prc.client_id
         WHERE prc.email = ? AND prc.code_hash = ? AND prc.used_at IS NULL AND prc.expires_at >= NOW() AND c.actif = 1
         ORDER BY prc.created_at DESC LIMIT 1`,
        [normalizeEmail(email), hashResetCode(email, code)]
    );
    return clients[0] ? { ...clients[0], account_type: 'client' } : null;
};

export const login = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email et mot de passe requis'
        });
    }

    try {
        const [users] = await pool.query(
            `SELECT u.*, e.raison_sociale AS entreprise_nom, e.logo_url AS entreprise_logo
             FROM utilisateur u
             JOIN entreprise e ON e.id_entreprise = u.entreprise_id
             WHERE u.email = ? AND u.actif = 1`,
            [email]
        );

        const user = users[0];
        let isMatch = false;

        if (user?.mot_de_passe?.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, user.mot_de_passe);
        } else if (user?.mot_de_passe) {
            const sha2Hash = crypto.createHash('sha256').update(password).digest('hex');
            isMatch = sha2Hash === user.mot_de_passe;
        }

        if (!isMatch) {
            const [[client]] = await pool.query(
                `SELECT c.*, e.raison_sociale AS entreprise_nom
                 FROM client c JOIN entreprise e ON e.id_entreprise = c.entreprise_id
                 WHERE LOWER(c.email) = ? AND c.actif = 1 LIMIT 1`, [email]
            );
            if (!client?.mot_de_passe || !(await bcrypt.compare(password, client.mot_de_passe))) {
                return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
            }
            const clientToken = jwt.sign({ id: client.id_client, client_id: client.id_client, email: client.email, role: 'client', entreprise_id: client.entreprise_id, nom: client.nom, type: 'client' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
            return res.json({
                success: true, message: 'Connexion reussie', token: clientToken,
                user: { id: client.id_client, id_client: client.id_client, nom: client.nom, postnom: client.postnom, email: client.email, telephone: client.telephone, role: 'client', entreprise_id: client.entreprise_id, entreprise_nom: client.entreprise_nom, type: 'client' }
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Connexion reussie',
            token,
            user: {
                id: user.id_utilisateur,
                nom: user.nom,
                email: user.email,
                telephone: user.telephone,
                role: user.role,
                entreprise_id: user.entreprise_id,
                entreprise_nom: user.entreprise_nom,
                entreprise_logo: user.entreprise_logo,
                type: 'utilisateur'
            }
        });
    } catch (error) {
        console.error('Erreur login:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id_utilisateur, u.nom, u.email, u.telephone, u.role,
                    u.entreprise_id, e.raison_sociale AS entreprise_nom, e.logo_url AS entreprise_logo
             FROM utilisateur u
             JOIN entreprise e ON u.entreprise_id = e.id_entreprise
             WHERE u.id_utilisateur = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
        }

        res.json({ success: true, user: users[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const { nom, telephone } = req.body;

    if (!nom || !String(nom).trim()) {
        return res.status(400).json({ success: false, message: 'Nom requis' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE utilisateur
             SET nom = ?, telephone = ?
             WHERE id_utilisateur = ? AND entreprise_id = ? AND actif = 1`,
            [String(nom).trim(), telephone || null, req.user.id, req.user.entreprise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
        }

        const [[user]] = await pool.query(
            `SELECT u.id_utilisateur, u.nom, u.email, u.telephone, u.role,
                    u.entreprise_id, e.raison_sociale AS entreprise_nom, e.logo_url AS entreprise_logo
             FROM utilisateur u
             JOIN entreprise e ON u.entreprise_id = e.id_entreprise
             WHERE u.id_utilisateur = ?`,
            [req.user.id]
        );

        res.json({ success: true, message: 'Profil mis a jour', user: { ...user, id: user.id_utilisateur, type: 'utilisateur' } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const changePassword = async (req, res) => {
    const { new_password } = req.body;

    if (!new_password) {
        return res.status(400).json({ success: false, message: 'Nouveau mot de passe requis' });
    }

    if (String(new_password).length < 6) {
        return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres' });
    }

    try {
        const [users] = await pool.query('SELECT id_utilisateur FROM utilisateur WHERE id_utilisateur = ? AND actif = 1', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.query(
            'UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ success: true, message: 'Mot de passe mis a jour' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetRequestedPassword = async (req, res) => {
    const { email, new_password } = req.body;

    if (!email || !new_password) {
        return res.status(400).json({ success: false, message: 'Email et nouveau mot de passe requis' });
    }

    if (String(new_password).length < 6) {
        return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres' });
    }

    if (req.user?.role !== 'manager') {
        return res.status(403).json({ success: false, message: 'Seul un manager peut reinitialiser un mot de passe utilisateur.' });
    }

    try {
        const [users] = await pool.query(
            `SELECT u.id_utilisateur, u.nom, u.email, u.role, e.raison_sociale
             FROM utilisateur u
             JOIN entreprise e ON e.id_entreprise = u.entreprise_id
             WHERE u.email = ? AND u.entreprise_id = ? AND u.actif = 1`,
            [email, req.user.entreprise_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable pour cette demande' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.query(
            'UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?',
            [hashedPassword, users[0].id_utilisateur]
        );

        await sendMail({
            to: users[0].email,
            subject: 'Votre acces temporaire | Quincaillerie Centrale',
            text: `Bonjour ${users[0].nom},\n\nVotre mot de passe temporaire est ${new_password}. Changez-le des votre prochaine connexion.`,
            html: brandedEmail({ eyebrow: 'GESTION DES ACCES', title: 'Un nouveau mot de passe temporaire', greeting: `Bonjour ${users[0].nom}`, intro: 'Votre responsable a reinitialise votre acces à la plateforme.', content: codeBlock(new_password, 'Mot de passe temporaire'), notice: 'Pour proteger votre compte, remplacez ce mot de passe immediatement apres votre connexion.' })
        }).catch(() => null);

        res.json({ success: true, message: `Mot de passe reinitialise pour ${email}.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email requis' });
    }

    try {
        const [users] = await pool.query(
            `SELECT u.id_utilisateur, u.nom, u.email, u.role, u.entreprise_id, e.raison_sociale
             FROM utilisateur u
             JOIN entreprise e ON e.id_entreprise = u.entreprise_id
             WHERE LOWER(u.email) = ? AND u.actif = 1`,
            [email]
        );

        let user = users[0];
        if (!user) {
            const [[client]] = await pool.query(`SELECT id_client, nom, email, entreprise_id FROM client WHERE LOWER(email) = ? AND actif = 1 LIMIT 1`, [email]);
            if (!client) return res.json({ success: true, message: 'Si cet email existe, un code de recuperation a ete envoye.' });
            user = { ...client, account_type: 'client' };
        }
        const code = createResetCode();
        const codeHash = hashResetCode(user.email, code);

        if (user.account_type === 'client') {
            await pool.query('UPDATE client_password_reset_codes SET used_at = NOW() WHERE client_id = ? AND used_at IS NULL', [user.id_client]);
            await pool.query(`INSERT INTO client_password_reset_codes (client_id, email, code_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`, [user.id_client, normalizeEmail(user.email), codeHash]);
        } else {
            await pool.query('UPDATE password_reset_codes SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [user.id_utilisateur]);
            await pool.query(`INSERT INTO password_reset_codes (user_id, email, code_hash, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`, [user.id_utilisateur, normalizeEmail(user.email), codeHash]);
        }

        const mailResult = await sendPasswordCodeEmail({ to: user.email, name: user.nom, code });

        if (mailResult?.skipped) {
            return res.status(503).json({ success: false, message: 'Service email non configure sur le serveur.' });
        }

        res.json({ success: true, message: 'Code de recuperation envoye par email.' });
    } catch (error) {
        console.error('Erreur forgot password:', error.message);
        res.status(500).json({ success: false, message: getMailErrorMessage(error) });
    }
};

export const verifyResetCode = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || '').trim();

    if (!email || !/^\d{6}$/.test(code)) {
        return res.status(400).json({ success: false, message: 'Email et code a 6 chiffres requis' });
    }

    try {
        const reset = await findValidResetCode({ email, code });

        if (!reset) {
            return res.status(400).json({ success: false, message: 'Code invalide ou expire' });
        }

        res.json({ success: true, message: 'Code confirme. Vous pouvez definir un nouveau mot de passe.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetPasswordWithCode = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || '').trim();
    const newPassword = String(req.body.new_password || '');
    const confirmPassword = String(req.body.confirm_password || '');

    if (!email || !/^\d{6}$/.test(code)) {
        return res.status(400).json({ success: false, message: 'Email et code a 6 chiffres requis' });
    }

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caracteres' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Les deux mots de passe ne correspondent pas' });
    }

    try {
        const reset = await findValidResetCode({ email, code });

        if (!reset) {
            return res.status(400).json({ success: false, message: 'Code invalide ou expire' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        if (reset.account_type === 'client') {
            await pool.query('UPDATE client SET mot_de_passe = ? WHERE id_client = ?', [hashedPassword, reset.client_id]);
            await pool.query('UPDATE client_password_reset_codes SET used_at = NOW() WHERE id_reset = ?', [reset.id_reset]);
        } else {
            await pool.query('UPDATE utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?', [hashedPassword, reset.user_id]);
            await pool.query('UPDATE password_reset_codes SET used_at = NOW() WHERE id_reset = ?', [reset.id_reset]);
        }

        sendSecurityNoticeEmail({ to: reset.email, name: reset.nom, title: 'Votre mot de passe a ete modifie', message: 'La reinitialisation de votre mot de passe vient d’etre effectuee avec succes.' })
            .catch((error) => console.error('Erreur email confirmation reset:', error.message));

        res.json({ success: true, message: 'Mot de passe reinitialise. Vous pouvez vous connecter.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
