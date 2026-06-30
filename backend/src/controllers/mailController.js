import { brandedEmail, escapeHtml, getMailErrorMessage, isMailReady, sendMail } from '../services/mailService.js';
import pool from '../config/db.js';

export const getMailStatus = (req, res) => {
    res.json({
        success: true,
        data: {
            ready: isMailReady(),
            sender: process.env.EMAIL_USER || null
        }
    });
};

export const getMailMessages = async (req, res) => {
    try {
        const params = [];
        let where = '';

        where = 'WHERE entreprise_id = ?';
        params.push(req.user.entreprise_id);

        const [rows] = await pool.query(
            `SELECT id_mail, sender_email, to_email, subject, message, status, created_at
             FROM mail_messages
             ${where}
             ORDER BY created_at DESC
             LIMIT 60`,
            params
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erreur lecture emails:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendCustomMail = async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Destinataire, sujet et message requis'
        });
    }

    try {
        const result = await sendMail({
            to,
            subject,
            text: message,
            html: brandedEmail({
                eyebrow: 'MESSAGE DE NOTRE EQUIPE',
                title: subject,
                greeting: 'Bonjour',
                content: `<div style="color:#45566b;font-size:15px;line-height:1.8;white-space:pre-line">${escapeHtml(message).replace(/\n/g, '<br>')}</div>`,
                notice: 'Vous pouvez repondre directement à cet email pour poursuivre l’echange avec notre equipe.'
            }),
            replyTo: req.user?.email,
            fromName: req.user?.nom || 'Quincaillerie Centrale'
        });

        if (result.skipped) {
            return res.status(503).json({ success: false, message: result.message });
        }

        await pool.query(
            `INSERT INTO mail_messages
                (entreprise_id, user_id, sender_email, to_email, subject, message, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user?.entreprise_id || null,
                req.user?.id || null,
                req.user?.email || process.env.EMAIL_USER || null,
                to,
                subject,
                message,
                'envoye'
            ]
        );

        res.json({ success: true, message: 'Email envoye', data: result });
    } catch (error) {
        console.error('Erreur envoi email SMTP:', error.message);
        res.status(500).json({ success: false, message: getMailErrorMessage(error) });
    }
};

export const sendClientsMail = async (req, res) => {
    const { subject, message } = req.body;
    const entreprise_id = req.user?.entreprise_id;

    if (!subject || !message) {
        return res.status(400).json({ success: false, message: 'Sujet et message requis' });
    }

    if (!isMailReady()) {
        return res.status(503).json({ success: false, message: 'Configuration email absente' });
    }

    try {
        const [clients] = await pool.query(
            `SELECT id_client, nom, email
             FROM client
             WHERE entreprise_id = ? AND actif = 1 AND email IS NOT NULL AND email <> ''`,
            [entreprise_id]
        );

        if (!clients.length) {
            return res.status(404).json({ success: false, message: 'Aucun client actif avec email trouve.' });
        }

        let nextClientIndex = 0;
        let sent = 0;
        const failures = [];
        const worker = async () => {
            while (nextClientIndex < clients.length) {
                const client = clients[nextClientIndex++];
                try {
                    const result = await sendMail({
                        to: client.email,
                        subject,
                        text: `Bonjour ${client.nom || 'cher client'},\n\n${message}\n\nL'equipe Quincaillerie Centrale`,
                        html: brandedEmail({
                            eyebrow: 'MESSAGE CLIENT',
                            title: subject,
                            greeting: `Bonjour ${client.nom || 'cher client'}`,
                            content: `<div style="color:#45566b;font-size:15px;line-height:1.8;white-space:pre-line">${escapeHtml(message).replace(/\n/g, '<br>')}</div>`,
                            notice: 'Ce message vous est envoye parce que vous etes client de Quincaillerie Centrale.'
                        }),
                        replyTo: req.user?.email,
                        fromName: req.user?.nom || 'Quincaillerie Centrale'
                    });
                    if (result.skipped) throw new Error(result.message);
                    sent += 1;
                } catch (error) {
                    failures.push({ email: client.email, error: getMailErrorMessage(error) });
                }
            }
        };
        const configuredConcurrency = Number(process.env.EMAIL_BULK_CONCURRENCY || 4);
        const concurrency = Math.min(
            Number.isFinite(configuredConcurrency) ? Math.max(1, Math.floor(configuredConcurrency)) : 4,
            clients.length,
            10
        );
        await Promise.all(Array.from({ length: concurrency }, () => worker()));
        const failed = failures.length;
        const deliveryStatus = failed ? (sent ? 'partiel' : 'echec') : 'envoye';

        await pool.query(
            `INSERT INTO mail_messages
                (entreprise_id, user_id, sender_email, to_email, subject, message, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                entreprise_id,
                req.user?.id || null,
                req.user?.email || process.env.EMAIL_USER || null,
                `Tous les clients (${sent}/${clients.length})`,
                subject,
                message,
                deliveryStatus
            ]
        );

        if (!sent) {
            return res.status(502).json({
                success: false,
                message: `Aucun email envoye sur ${clients.length}. ${failures[0]?.error || 'Verifiez la configuration SMTP.'}`,
                data: { recipients: clients.length, sent, failed }
            });
        }

        res.json({
            success: true,
            message: failed
                ? `Envoi termine : ${sent} email(s) envoye(s), ${failed} echec(s).`
                : `Email envoye a ${sent} client(s).`,
            data: { recipients: clients.length, sent, failed }
        });
    } catch (error) {
        console.error('Erreur envoi clients:', error.message);
        res.status(500).json({ success: false, message: getMailErrorMessage(error) });
    }
};

export const sendTeamNotification = async (req, res) => {
    const { subject, message } = req.body;
    const entreprise_id = req.user?.entreprise_id;

    if (!entreprise_id) {
        return res.status(400).json({
            success: false,
            message: 'Entreprise introuvable pour envoyer une notification interne.'
        });
    }

    if (!subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Sujet et message requis'
        });
    }

    const connection = await pool.getConnection();

    try {
        const [users] = await connection.query(
            `SELECT id_utilisateur
             FROM utilisateur
             WHERE entreprise_id = ? AND actif = 1`,
            [entreprise_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun utilisateur actif trouve dans cette entreprise.'
            });
        }

        await connection.beginTransaction();

        const notificationRows = users.map((item) => [
            'user',
            item.id_utilisateur,
            entreprise_id,
            subject,
            message
        ]);

        await connection.query(
            `INSERT INTO notifications
                (recipient_type, recipient_user_id, entreprise_id, titre, message)
             VALUES ?`,
            [notificationRows]
        );

        await connection.query(
            `INSERT INTO mail_messages
                (entreprise_id, user_id, sender_email, to_email, subject, message, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                entreprise_id,
                req.user?.id || null,
                req.user?.email || process.env.EMAIL_USER || null,
                'Tous les utilisateurs',
                subject,
                message,
                'notification'
            ]
        );

        await connection.commit();

        res.json({
            success: true,
            message: `Notification envoyee a ${users.length} utilisateur(s).`,
            data: { recipients: users.length }
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};
