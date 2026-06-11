import pool from '../config/db.js';

const nextClientId = async (connection) => {
    await connection.query(
        `INSERT INTO sequences (nom_table, derniere_valeur)
         VALUES ('client', 0)
         ON DUPLICATE KEY UPDATE derniere_valeur = derniere_valeur`
    );
    await connection.query(
        `UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'client'`
    );
    const [[row]] = await connection.query(
        `SELECT derniere_valeur FROM sequences WHERE nom_table = 'client'`
    );
    return `CLI-${String(row.derniere_valeur).padStart(5, '0')}`;
};

export const getAllClients = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT c.*,
                COUNT(v.id_ventes) AS nombre_achats,
                IFNULL(SUM(v.montant_ttc), 0) AS ca_total
             FROM client c
             LEFT JOIN ventes v ON c.id_client = v.client_id
             WHERE c.entreprise_id = ?
             GROUP BY c.id_client
             ORDER BY c.nom ASC`,
            [entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getClientById = async (req, res) => {
    const { id } = req.params;
    const entreprise_id = req.user.entreprise_id;
    try {
        const [clients] = await pool.query(
            'SELECT * FROM client WHERE id_client = ? AND entreprise_id = ?',
            [id, entreprise_id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ success: false, message: 'Client non trouve' });
        }

        const [historique] = await pool.query(
            `SELECT v.numero_facture, v.date_vente, v.montant_ttc,
                    IFNULL(SUM(p.montant), 0) AS total_paye,
                    (v.montant_ttc - IFNULL(SUM(p.montant), 0)) AS reste
             FROM ventes v
             LEFT JOIN paiement p ON v.id_ventes = p.vente_id
             WHERE v.client_id = ? AND v.entreprise_id = ?
             GROUP BY v.id_ventes
             ORDER BY v.date_vente DESC`,
            [id, entreprise_id]
        );

        res.json({
            success: true,
            data: { client: clients[0], historique }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createClient = async (req, res) => {
    const { nom, postnom, telephone } = req.body;
    const entreprise_id = req.user.entreprise_id;

    if (!nom) {
        return res.status(400).json({ success: false, message: 'Le nom du client est requis' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const idClient = await nextClientId(connection);

        await connection.query(
            `INSERT INTO client (id_client, nom, postnom, telephone, entreprise_id)
             VALUES (?, ?, ?, ?, ?)`,
            [idClient, nom, postnom || null, telephone || null, entreprise_id]
        );

        const [newClient] = await connection.query(
            `SELECT * FROM client
             WHERE entreprise_id = ?
               AND (id_client = ? OR telephone = ?)
             ORDER BY id_client DESC
             LIMIT 1`,
            [entreprise_id, idClient, telephone || null]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Client cree avec succes',
            data: newClient[0]
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

export const updateClient = async (req, res) => {
    const { id } = req.params;
    const { nom, postnom, telephone } = req.body;
    const entreprise_id = req.user.entreprise_id;

    try {
        const [result] = await pool.query(
            `UPDATE client
             SET nom = ?, postnom = ?, telephone = ?
             WHERE id_client = ? AND entreprise_id = ?`,
            [nom, postnom || null, telephone || null, id, entreprise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Client introuvable' });
        }

        res.json({ success: true, message: 'Client mis a jour' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteClient = async (req, res) => {
    const { id } = req.params;
    const entreprise_id = req.user.entreprise_id;

    try {
        const [result] = await pool.query(
            'DELETE FROM client WHERE id_client = ? AND entreprise_id = ?',
            [id, entreprise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Client introuvable' });
        }

        res.json({ success: true, message: 'Client supprime' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
