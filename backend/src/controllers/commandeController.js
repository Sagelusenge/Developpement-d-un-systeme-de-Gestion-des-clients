import pool from '../config/db.js';
import { nextFactureId, nextId } from '../services/idService.js';
import { notifyEnterpriseAdmins } from '../services/notificationService.js';

const isClient = (req) => req.user.type === 'client';
const allowedStatuses = ['en_attente', 'confirmee', 'preparee', 'livree', 'annulee', 'rejetee'];

const attachLines = async (commandes) => {
    if (!commandes.length) return commandes;
    const ids = commandes.map((item) => item.id_commande);
    const [lines] = await pool.query(
        `SELECT lc.*, p.nom AS produit_nom, p.photo_url, p.unite
         FROM lignes_commandes lc JOIN produits p ON p.id_produit = lc.produit_id
         WHERE lc.commande_id IN (?) ORDER BY lc.id_ligne_commande`, [ids]
    );
    return commandes.map((item) => ({ ...item, lignes: lines.filter((line) => line.commande_id === item.id_commande) }));
};

export const getCatalogue = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.id_produit, p.reference_produit, p.nom, p.unite, p.prix_ht, p.taux_tva,
                    p.quantite_stock, p.photo_url, c.nom AS categorie_nom
             FROM produits p LEFT JOIN categorie_produit c ON c.id_categorie = p.categorie_id
             WHERE p.entreprise_id = ? AND p.quantite_stock > 0 AND p.prix_ht >= p.prix_achat ORDER BY p.nom`,
            [req.user.entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getCommandes = async (req, res) => {
    try {
        const params = [req.user.entreprise_id];
        let clientFilter = '';
        if (isClient(req)) { clientFilter = ' AND co.client_id = ?'; params.push(req.user.client_id); }
        const [rows] = await pool.query(
            `SELECT co.*, c.nom AS client_nom, c.postnom AS client_postnom, c.telephone AS client_telephone,
                    v.numero_facture
             FROM commandes co JOIN client c ON c.id_client = co.client_id
             LEFT JOIN ventes v ON v.id_ventes = co.vente_id
             WHERE co.entreprise_id = ?${clientFilter} ORDER BY co.date_commande DESC`, params
        );
        res.json({ success: true, data: await attachLines(rows) });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAchatsClient = async (req, res) => {
    if (!isClient(req)) return res.status(403).json({ success: false, message: 'Espace client requis.' });
    try {
        const [rows] = await pool.query(
            `SELECT v.id_ventes, v.numero_facture, v.montant_ttc, v.date_vente,
                    IFNULL(SUM(p.montant), 0) AS total_paye,
                    v.montant_ttc - IFNULL(SUM(p.montant), 0) AS reste_a_payer
             FROM ventes v LEFT JOIN paiement p ON p.vente_id = v.id_ventes
             WHERE v.client_id = ? AND v.entreprise_id = ?
             GROUP BY v.id_ventes ORDER BY v.date_vente DESC`,
            [req.user.client_id, req.user.entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const createCommande = async (req, res) => {
    if (!isClient(req)) return res.status(403).json({ success: false, message: 'Seul un client peut passer une commande.' });
    const articles = Array.isArray(req.body.articles) ? req.body.articles : [];
    if (!articles.length) return res.status(400).json({ success: false, message: 'Ajoutez au moins un produit.' });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const lines = [];
        let total = 0;
        for (const article of articles) {
            const quantite = Number(article.quantite);
            const [[product]] = await connection.query(
                `SELECT id_produit, nom, prix_ht, prix_achat, quantite_stock FROM produits
                 WHERE id_produit = ? AND entreprise_id = ?`, [article.produit_id, req.user.entreprise_id]
            );
            if (!product || !Number.isInteger(quantite) || quantite <= 0) throw new Error('Produit ou quantite invalide.');
            if (quantite > product.quantite_stock) throw new Error(`Stock disponible insuffisant pour ${product.nom}.`);
            if (Number(product.prix_ht) < Number(product.prix_achat || 0)) throw new Error(`${product.nom} est temporairement indisponible: son prix catalogue est inferieur à son cout d'achat.`);
            lines.push({ ...product, quantite });
            total += quantite * Number(product.prix_ht) * 1.16;
        }
        const id = await nextId(connection, 'commandes', 'CMD', 6);
        await connection.query(
            `INSERT INTO commandes (id_commande, client_id, entreprise_id, montant_ttc, note_client)
             VALUES (?, ?, ?, ?, ?)`,
            [id, req.user.client_id, req.user.entreprise_id, Number(total.toFixed(2)), String(req.body.note_client || '').trim() || null]
        );
        for (const line of lines) {
            const lineId = await nextId(connection, 'lignes_commandes', 'LCM', 7);
            await connection.query(
                `INSERT INTO lignes_commandes (id_ligne_commande, commande_id, produit_id, quantite, prix_unitaire_ht)
                 VALUES (?, ?, ?, ?, ?)`, [lineId, id, line.id_produit, line.quantite, line.prix_ht]
            );
        }
        await connection.commit();
        await notifyEnterpriseAdmins({ entreprise_id: req.user.entreprise_id, titre: 'Nouvelle commande client', message: `${req.user.nom || 'Un client'} a envoye la commande ${id}.`, entity_type: 'commande', entity_id: id }).catch(() => null);
        res.status(201).json({ success: true, message: 'Commande envoyee.', id });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally { connection.release(); }
};

export const updateCommandeStatus = async (req, res) => {
    if (isClient(req) || !['manager', 'caissier'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Action interdite.' });
    const statut = String(req.body.statut || '');
    if (!allowedStatuses.includes(statut)) return res.status(400).json({ success: false, message: 'Statut invalide.' });
    try {
        const [result] = await pool.query(
            `UPDATE commandes SET statut = ? WHERE id_commande = ? AND entreprise_id = ? AND vente_id IS NULL`,
            [statut, req.params.id, req.user.entreprise_id]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Commande introuvable ou deja facturee.' });
        res.json({ success: true, message: 'Statut de la commande mis a jour.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const convertCommande = async (req, res) => {
    if (req.user.type === 'client' || req.user.role !== 'caissier') return res.status(403).json({ success: false, message: 'Seul le caissier peut creer la facture.' });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[order]] = await connection.query(
            `SELECT * FROM commandes WHERE id_commande = ? AND entreprise_id = ? FOR UPDATE`,
            [req.params.id, req.user.entreprise_id]
        );
        if (!order) throw new Error('Commande introuvable.');
        if (order.vente_id) throw new Error('Cette commande est deja facturee.');
        if (['annulee', 'rejetee'].includes(order.statut)) throw new Error('Cette commande ne peut plus etre facturee.');
        const [lines] = await connection.query(`SELECT * FROM lignes_commandes WHERE commande_id = ?`, [order.id_commande]);
        const invoiceId = await nextFactureId(connection);
        await connection.query(
            `INSERT INTO ventes (id_ventes, numero_facture, client_id, entreprise_id, montant_ttc) VALUES (?, ?, ?, ?, 0)`,
            [invoiceId, invoiceId, order.client_id, order.entreprise_id]
        );
        let total = 0;
        for (const line of lines) {
            const [[product]] = await connection.query(
                `SELECT prix_achat, quantite_stock FROM produits WHERE id_produit = ? AND entreprise_id = ? FOR UPDATE`,
                [line.produit_id, order.entreprise_id]
            );
            if (!product || Number(product.quantite_stock) < Number(line.quantite)) throw new Error(`Stock insuffisant pour ${line.produit_id}.`);
            if (Number(line.prix_unitaire_ht) < Number(product.prix_achat || 0)) throw new Error(`Facturation bloquee pour ${line.produit_id}: le prix commande est inferieur au cout actuel. Le magasinier doit corriger le prix catalogue puis le client doit confirmer une nouvelle commande.`);
            const saleLineId = await nextId(connection, 'lignes_ventes', 'LVT', 6);
            await connection.query(
                `INSERT INTO lignes_ventes (id_lignes_ventes, vente_id, produit_id, quantite, prix_unitaire_ht, prix_achat_unitaire)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [saleLineId, invoiceId, line.produit_id, line.quantite, line.prix_unitaire_ht, product.prix_achat || 0]
            );
            await connection.query(`UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id_produit = ?`, [line.quantite, line.produit_id]);
            total += Number(line.quantite) * Number(line.prix_unitaire_ht) * 1.16;
        }
        await connection.query(`UPDATE ventes SET montant_ttc = ? WHERE id_ventes = ?`, [Number(total.toFixed(2)), invoiceId]);
        await connection.query(`UPDATE commandes SET statut = 'confirmee', vente_id = ? WHERE id_commande = ?`, [invoiceId, order.id_commande]);
        await connection.commit();
        res.json({ success: true, message: `Commande convertie en facture ${invoiceId}.`, facture: invoiceId });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally { connection.release(); }
};
