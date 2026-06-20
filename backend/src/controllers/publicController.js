import pool from '../config/db.js';
import { notifyEnterpriseAdmins } from '../services/notificationService.js';

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
            `SELECT id_entreprise FROM entreprise WHERE statut_abonnement = 'actif' ORDER BY id_entreprise LIMIT 1`
        );
        if (!company) return res.status(503).json({ success: false, message: 'Service de contact temporairement indisponible.' });

        await notifyEnterpriseAdmins({
            entreprise_id: company.id_entreprise,
            titre: `Contact du site : ${sujet}`.slice(0, 160),
            message: `${nom} (${email}) : ${message}`.slice(0, 3000)
        });
        res.status(201).json({ success: true, message: 'Votre message a bien ete transmis a notre equipe.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
