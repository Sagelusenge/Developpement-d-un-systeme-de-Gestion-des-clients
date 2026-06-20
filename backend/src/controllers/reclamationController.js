import pool from '../config/db.js';
import { nextId } from '../services/idService.js';
import { notifyEnterpriseAdmins } from '../services/notificationService.js';

const isClient = (req) => req.user.type === 'client';
export const getReclamations = async (req, res) => {
    try {
        if (!isClient(req) && req.user.role !== 'manager') return res.status(403).json({ success: false, message: 'Acces reserve au manager.' });
        const params = [req.user.entreprise_id];
        const filter = isClient(req) ? ' AND r.client_id = ?' : '';
        if (isClient(req)) params.push(req.user.client_id);
        const [rows] = await pool.query(
            `SELECT r.*, c.nom AS client_nom, c.postnom AS client_postnom
             FROM reclamations r JOIN client c ON c.id_client = r.client_id
             WHERE r.entreprise_id = ?${filter} ORDER BY r.date_reclamation DESC`, params
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const createReclamation = async (req, res) => {
    if (!isClient(req)) return res.status(403).json({ success: false, message: 'Seul un client peut envoyer une reclamation.' });
    const sujet = String(req.body.sujet || '').trim();
    const message = String(req.body.message || '').trim();
    if (!sujet || !message) return res.status(400).json({ success: false, message: 'Sujet et message requis.' });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const id = await nextId(connection, 'reclamations', 'REC', 6);
        await connection.query(
            `INSERT INTO reclamations (id_reclamation, client_id, entreprise_id, commande_id, vente_id, sujet, message)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user.client_id, req.user.entreprise_id, req.body.commande_id || null, req.body.vente_id || null, sujet, message]
        );
        await connection.commit();
        await notifyEnterpriseAdmins({ entreprise_id: req.user.entreprise_id, titre: 'Nouvelle reclamation client', message: `${req.user.nom || 'Un client'} a envoye la reclamation ${id}: ${sujet}.` }).catch(() => null);
        res.status(201).json({ success: true, message: 'Reclamation envoyee au manager.', id });
    } catch (error) {
        await connection.rollback(); res.status(400).json({ success: false, message: error.message });
    } finally { connection.release(); }
};

export const updateReclamation = async (req, res) => {
    if (isClient(req) || req.user.role !== 'manager') return res.status(403).json({ success: false, message: 'Acces reserve au manager.' });
    const statuses = ['ouverte', 'en_cours', 'resolue', 'cloturee'];
    if (!statuses.includes(req.body.statut)) return res.status(400).json({ success: false, message: 'Statut invalide.' });
    try {
        const [result] = await pool.query(
            `UPDATE reclamations SET statut = ?, reponse = ? WHERE id_reclamation = ? AND entreprise_id = ?`,
            [req.body.statut, String(req.body.reponse || '').trim() || null, req.params.id, req.user.entreprise_id]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Reclamation introuvable.' });
        res.json({ success: true, message: 'Reclamation mise a jour.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
