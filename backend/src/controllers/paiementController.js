import pool from '../config/db.js';
import { nextId } from '../services/idService.js';

// POST /api/paiements
export const createPaiement = async (req, res) => {
    const { vente_id, montant, mode_paiement, reference_externe, telephone_payeur } = req.body;
    const entreprise_id = req.user.entreprise_id;
    const montantNumber = Number(montant);
    const reference = String(reference_externe || '').trim();
    const telephone = String(telephone_payeur || '').trim();

    if (!vente_id || !Number.isFinite(montantNumber) || montantNumber <= 0 || !mode_paiement) {
        return res.status(400).json({ success: false, message: 'Donnees paiement incompletes ou invalides' });
    }

    if (mode_paiement === 'mobile_money' && (!reference || !telephone)) {
        return res.status(400).json({ success: false, message: 'Reference et numero requis pour Mobile Money' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [ventes] = await connection.query(
            `SELECT v.id_ventes, v.montant_ttc, IFNULL(SUM(p.montant), 0) AS total_paye
             FROM ventes v
             LEFT JOIN paiement p ON p.vente_id = v.id_ventes
             WHERE v.id_ventes = ? AND v.entreprise_id = ?
             GROUP BY v.id_ventes`,
            [vente_id, entreprise_id]
        );

        if (ventes.length === 0) {
            return res.status(404).json({ success: false, message: 'Facture introuvable dans votre entreprise' });
        }

        const reste = Number(ventes[0].montant_ttc) - Number(ventes[0].total_paye);
        if (montantNumber > reste) {
            return res.status(400).json({
                success: false,
                message: `Le paiement depasse le reste a payer (${reste.toFixed(2)} USD).`
            });
        }

        const idPaiement = await nextId(connection, 'paiement', 'PAY', 5);
        await connection.query(
            `INSERT INTO paiement
                (id_paiement, vente_id, montant, mode_paiement, reference_externe, telephone_payeur)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [idPaiement, vente_id, montantNumber, mode_paiement, reference || null, telephone || null]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            message: `Paiement de ${montantNumber} USD enregistre (${mode_paiement})`,
            data: { id_paiement: idPaiement }
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

// GET /api/paiements/rapport-caisse
export const getRapportCaisse = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT DATE(p.date_paiement) AS date_paiement,
                    p.mode_paiement,
                    COUNT(*) AS nombre_paiements,
                    IFNULL(SUM(p.montant), 0) AS total
             FROM paiement p
             JOIN ventes v ON v.id_ventes = p.vente_id
             WHERE v.entreprise_id = ?
             GROUP BY DATE(p.date_paiement), p.mode_paiement
             ORDER BY date_paiement DESC`,
            [entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRepartitionPaiements = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT p.mode_paiement,
                    COUNT(*) AS transactions,
                    IFNULL(SUM(p.montant), 0) AS total
             FROM paiement p
             JOIN ventes v ON v.id_ventes = p.vente_id
             WHERE v.entreprise_id = ?
             GROUP BY p.mode_paiement
             ORDER BY total DESC`,
            [entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
