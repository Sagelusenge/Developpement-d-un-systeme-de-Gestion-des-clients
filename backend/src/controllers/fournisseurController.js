import pool from '../config/db.js';

export const getFournisseurs = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT f.*,
                    COUNT(m.id_mouvement) AS total_approvisionnements,
                    IFNULL(SUM(m.quantite * IFNULL(m.prix_achat_unitaire, 0)), 0) AS total_achats
             FROM fournisseurs f
             LEFT JOIN mouvements_stock m ON m.fournisseur_id = f.id_fournisseur
             WHERE f.entreprise_id = ?
             GROUP BY f.id_fournisseur
             ORDER BY f.nom ASC`,
            [req.user.entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createFournisseur = async (req, res) => {
    const { nom, telephone, email, adresse } = req.body;

    if (!nom) {
        return res.status(400).json({ success: false, message: 'Nom fournisseur requis' });
    }

    try {
        const id = `FOU-${Date.now()}-${req.user.entreprise_id.slice(0, 8)}`.slice(0, 50);
        await pool.query(
            `INSERT INTO fournisseurs (id_fournisseur, entreprise_id, nom, telephone, email, adresse)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, req.user.entreprise_id, nom, telephone || null, email || null, adresse || null]
        );

        res.status(201).json({ success: true, message: 'Fournisseur ajoute', data: { id_fournisseur: id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateFournisseur = async (req, res) => {
    const { id } = req.params;
    const { nom, telephone, email, adresse } = req.body;

    if (!nom) {
        return res.status(400).json({ success: false, message: 'Nom fournisseur requis' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE fournisseurs
             SET nom = ?, telephone = ?, email = ?, adresse = ?
             WHERE id_fournisseur = ? AND entreprise_id = ?`,
            [nom, telephone || null, email || null, adresse || null, id, req.user.entreprise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Fournisseur introuvable' });
        }

        res.json({ success: true, message: 'Fournisseur mis a jour' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteFournisseur = async (req, res) => {
    const { id } = req.params;

    try {
        const [used] = await pool.query(
            `SELECT COUNT(*) AS total FROM mouvements_stock WHERE fournisseur_id = ?`,
            [id]
        );

        if (Number(used[0]?.total || 0) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ce fournisseur a deja des approvisionnements. Vous pouvez le laisser comme archive.'
            });
        }

        const [result] = await pool.query(
            `DELETE FROM fournisseurs WHERE id_fournisseur = ? AND entreprise_id = ?`,
            [id, req.user.entreprise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Fournisseur introuvable' });
        }

        res.json({ success: true, message: 'Fournisseur supprime' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
