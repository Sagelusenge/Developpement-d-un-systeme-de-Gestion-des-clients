import pool from '../config/db.js';

const clean = (value, maxLength) => {
    const text = String(value || '').trim();
    return text ? text.slice(0, maxLength) : null;
};

export const getEntreprise = async (req, res) => {
    try {
        const [[entreprise]] = await pool.query(
            `SELECT id_entreprise, raison_sociale, logo_url, num_id_nationale, email, ville,
                    slogan, description_site, telephone, adresse, horaires, annonce_site,
                    hero_titre, hero_description, couleur_principale
             FROM entreprise
             WHERE id_entreprise = ?`,
            [req.user.entreprise_id]
        );

        if (!entreprise) {
            return res.status(404).json({ success: false, message: 'Entreprise introuvable' });
        }

        res.json({ success: true, data: entreprise });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateEntreprise = async (req, res) => {
    const raisonSociale = clean(req.body.raison_sociale, 200);
    const logoUrl = clean(req.body.logo_url, 2000);

    if (!raisonSociale) {
        return res.status(400).json({ success: false, message: "Le nom de l'entreprise est requis" });
    }

    if (logoUrl && !/^(https?:\/\/|\/uploads\/)/i.test(logoUrl)) {
        return res.status(400).json({ success: false, message: 'Le lien du logo est invalide' });
    }

    const couleurPrincipale = clean(req.body.couleur_principale, 7) || '#0b5ea8';
    if (!/^#[0-9a-f]{6}$/i.test(couleurPrincipale)) {
        return res.status(400).json({ success: false, message: 'La couleur principale doit etre au format hexadecimal (#0b5ea8)' });
    }

    try {
        await pool.query(
            `UPDATE entreprise
             SET raison_sociale = ?, logo_url = ?, num_id_nationale = ?, email = ?, ville = ?,
                 slogan = ?, description_site = ?, telephone = ?, adresse = ?, horaires = ?,
                 annonce_site = ?, hero_titre = ?, hero_description = ?, couleur_principale = ?
             WHERE id_entreprise = ?`,
            [
                raisonSociale,
                logoUrl,
                clean(req.body.num_id_nationale, 50),
                clean(req.body.email, 150),
                clean(req.body.ville, 100),
                clean(req.body.slogan, 200),
                clean(req.body.description_site, 2000),
                clean(req.body.telephone, 30),
                clean(req.body.adresse, 255),
                clean(req.body.horaires, 200),
                clean(req.body.annonce_site, 255),
                clean(req.body.hero_titre, 200),
                clean(req.body.hero_description, 500),
                couleurPrincipale,
                req.user.entreprise_id
            ]
        );

        const [[entreprise]] = await pool.query(
            `SELECT id_entreprise, raison_sociale, logo_url, num_id_nationale, email, ville,
                    slogan, description_site, telephone, adresse, horaires, annonce_site,
                    hero_titre, hero_description, couleur_principale
             FROM entreprise
             WHERE id_entreprise = ?`,
            [req.user.entreprise_id]
        );

        res.json({ success: true, message: 'Configuration de l’entreprise mise a jour', data: entreprise });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Ce numero d’identification est deja utilise' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
