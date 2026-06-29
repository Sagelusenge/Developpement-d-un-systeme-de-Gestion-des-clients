import pool from '../config/db.js';
import { notifyEnterpriseAdmins } from '../services/notificationService.js';
import { sendPublicContactReceivedEmail } from '../services/mailService.js';

const publicSiteUrl = () => String(process.env.FRONTEND_URL || 'http://127.0.0.1:5174').split(',')[0].trim().replace(/\/$/, '');

export const getPublicSiteConfig = async (_req, res) => {
    try {
        const [[config]] = await pool.query(
            `SELECT raison_sociale, logo_url, email, ville, slogan, description_site,
                    telephone, adresse, horaires, annonce_site, hero_titre,
                    hero_description, couleur_principale
             FROM entreprise
             ORDER BY id_entreprise
             LIMIT 1`
        );
        if (!config) return res.status(404).json({ success: false, message: 'Configuration du site introuvable.' });
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendPublicContact = async (req, res) => {
    const nom = String(req.body.nom || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const sujet = String(req.body.sujet || '').trim();
    const message = String(req.body.message || '').trim();

    if (!nom || !email || !sujet || !message) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Adresse email invalide.' });
    }
    if (message.length > 2000) {
        return res.status(400).json({ success: false, message: 'Le message est trop long.' });
    }

    try {
        const [[company]] = await pool.query(
            `SELECT id_entreprise FROM entreprise ORDER BY id_entreprise LIMIT 1`
        );
        if (!company) return res.status(503).json({ success: false, message: 'Service de contact temporairement indisponible.' });

        const [result] = await pool.query(`INSERT INTO public_contacts (entreprise_id,nom,email,sujet,message) VALUES (?,?,?,?,?)`, [company.id_entreprise, nom, email, sujet, message]);
        await notifyEnterpriseAdmins({
            entreprise_id: company.id_entreprise,
            titre: `Contact du site : ${sujet}`.slice(0, 160),
            message: `${nom} (${email}) : ${message}`.slice(0, 3000),
            entity_type: 'commentaire',
            entity_id: String(result.insertId)
        });
        sendPublicContactReceivedEmail({ to: email, name: nom, subject: sujet, espaceUrl: publicSiteUrl() }).catch(() => null);
        res.status(201).json({ success: true, message: 'Votre message a bien ete transmis a notre equipe.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPublicContacts = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM public_contacts WHERE entreprise_id=? ORDER BY created_at DESC`, [req.user.entreprise_id]);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updatePublicContact = async (req, res) => {
    const statut = String(req.body.statut || 'lu');
    if (!['nouveau', 'lu', 'traite'].includes(statut)) return res.status(400).json({ success: false, message: 'Statut invalide.' });
    await pool.query(`UPDATE public_contacts SET statut=? WHERE id_contact=? AND entreprise_id=?`, [statut, req.params.id, req.user.entreprise_id]);
    res.json({ success: true, message: 'Commentaire mis a jour.' });
};
