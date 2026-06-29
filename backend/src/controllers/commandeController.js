import pool from '../config/db.js';
import { nextFactureId, nextId } from '../services/idService.js';
import { notifyEnterpriseRoles } from '../services/notificationService.js';
import { sendInvoiceAvailableEmail, sendOrderReceivedEmail, sendOrderStatusEmail } from '../services/mailService.js';

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

const espaceClientUrl = () => `${String(process.env.FRONTEND_URL || 'http://127.0.0.1:5174').split(',')[0].trim().replace(/\/$/, '')}/connexion`;

const taxRate = (value) => {
    if (value === undefined || value === null || String(value).trim() === '') return 0;
    const rate = Number(value);
    return Number.isFinite(rate) && rate > 0 ? rate : 0;
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
                    v.montant_ttc - IFNULL(SUM(p.montant), 0) AS reste_a_payer,
                    (SELECT d.statut FROM demandes_paiement_mobile d WHERE d.vente_id=v.id_ventes ORDER BY d.date_demande DESC LIMIT 1) AS paiement_mobile_statut,
                    (SELECT d.id_demande FROM demandes_paiement_mobile d WHERE d.vente_id=v.id_ventes ORDER BY d.date_demande DESC LIMIT 1) AS paiement_mobile_reference
             FROM ventes v LEFT JOIN paiement p ON p.vente_id = v.id_ventes
             WHERE v.client_id = ? AND v.entreprise_id = ?
             GROUP BY v.id_ventes ORDER BY v.date_vente DESC`,
            [req.user.client_id, req.user.entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getCommandeClientById = async (req, res) => {
    if (!isClient(req)) return res.status(403).json({ success: false, message: 'Espace client requis.' });
    try {
        const [rows] = await pool.query(
            `SELECT co.*, v.numero_facture
             FROM commandes co
             LEFT JOIN ventes v ON v.id_ventes = co.vente_id
             WHERE co.id_commande = ? AND co.client_id = ? AND co.entreprise_id = ?
             LIMIT 1`,
            [req.params.id, req.user.client_id, req.user.entreprise_id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Commande introuvable.' });
        const [commande] = await attachLines(rows);
        res.json({ success: true, data: commande });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAchatClientById = async (req, res) => {
    if (!isClient(req)) return res.status(403).json({ success: false, message: 'Espace client requis.' });
    try {
        const [[facture]] = await pool.query(
            `SELECT v.id_ventes, v.numero_facture, v.montant_ttc, v.date_vente,
                    IFNULL(SUM(p.montant), 0) AS total_paye,
                    GREATEST(v.montant_ttc - IFNULL(SUM(p.montant), 0), 0) AS reste_a_payer
             FROM ventes v
             LEFT JOIN paiement p ON p.vente_id = v.id_ventes
             WHERE (v.id_ventes = ? OR v.numero_facture = ?)
               AND v.client_id = ? AND v.entreprise_id = ?
             GROUP BY v.id_ventes
             LIMIT 1`,
            [req.params.id, req.params.id, req.user.client_id, req.user.entreprise_id]
        );
        if (!facture) return res.status(404).json({ success: false, message: 'Facture introuvable.' });

        const [[lignes], [paiements]] = await Promise.all([
            pool.query(
                `SELECT lv.id_lignes_ventes, lv.produit_id, p.nom AS produit_nom, p.unite,
                        lv.quantite, lv.prix_unitaire_ht,
                        lv.quantite * lv.prix_unitaire_ht AS sous_total_ht
                 FROM lignes_ventes lv
                 JOIN produits p ON p.id_produit = lv.produit_id
                 WHERE lv.vente_id = ?
                 ORDER BY lv.id_lignes_ventes`,
                [facture.id_ventes]
            ),
            pool.query(
                `SELECT id_paiement, montant, mode_paiement, reference_externe, date_paiement
                 FROM paiement
                 WHERE vente_id = ?
                 ORDER BY date_paiement DESC`,
                [facture.id_ventes]
            )
        ]);

        res.json({ success: true, data: { ...facture, lignes, paiements } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const cancelCommandeClient = async (req, res) => {
    if (!isClient(req)) return res.status(403).json({ success: false, message: 'Espace client requis.' });
    try {
        const [result] = await pool.query(
            `UPDATE commandes
             SET statut = 'annulee'
             WHERE id_commande = ? AND client_id = ? AND entreprise_id = ?
               AND statut = 'en_attente' AND vente_id IS NULL`,
            [req.params.id, req.user.client_id, req.user.entreprise_id]
        );
        if (!result.affectedRows) {
            return res.status(409).json({ success: false, message: 'Seule une commande en attente peut etre annulee.' });
        }
        await notifyEnterpriseRoles({
            entreprise_id: req.user.entreprise_id,
            roles: ['manager', 'vendeur'],
            titre: 'Commande annulee par le client',
            message: `${req.user.nom || 'Un client'} a annule la commande ${req.params.id}.`,
            entity_type: 'commande',
            entity_id: req.params.id
        }).catch(() => null);
        res.json({ success: true, message: 'Commande annulee.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
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
                `SELECT id_produit, nom, unite, prix_ht, prix_achat, taux_tva, quantite_stock FROM produits
                 WHERE id_produit = ? AND entreprise_id = ?`, [article.produit_id, req.user.entreprise_id]
            );
            if (!product || !Number.isInteger(quantite) || quantite <= 0) throw new Error('Produit ou quantite invalide.');
            if (quantite > product.quantite_stock) throw new Error(`Stock disponible insuffisant pour ${product.nom}.`);
            if (Number(product.prix_ht) < Number(product.prix_achat || 0)) throw new Error(`${product.nom} est temporairement indisponible: son prix catalogue est inferieur à son cout d'achat.`);
            const tauxTva = taxRate(product.taux_tva);
            const prixTtc = Number(product.prix_ht) * (1 + tauxTva / 100);
            lines.push({ ...product, quantite, taux_tva: tauxTva, prix_ttc: Number(prixTtc.toFixed(2)) });
            total += quantite * prixTtc;
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
                `INSERT INTO lignes_commandes (id_ligne_commande, commande_id, produit_id, quantite, prix_unitaire_ht, taux_tva)
                 VALUES (?, ?, ?, ?, ?, ?)`, [lineId, id, line.id_produit, line.quantite, line.prix_ht, line.taux_tva]
            );
        }
        await connection.commit();
        await notifyEnterpriseRoles({ entreprise_id: req.user.entreprise_id, roles: ['manager', 'vendeur'], titre: 'Nouvelle commande client', message: `${req.user.nom || 'Un client'} a envoye la commande ${id}.`, entity_type: 'commande', entity_id: id }).catch(() => null);
        sendOrderReceivedEmail({
            to: req.user.email,
            name: req.user.nom,
            orderId: id,
            total: Number(total.toFixed(2)),
            lines,
            espaceUrl: espaceClientUrl()
        }).catch(() => null);
        res.status(201).json({ success: true, message: 'Commande envoyee.', id });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally { connection.release(); }
};

export const updateCommandeStatus = async (req, res) => {
    if (isClient(req) || !['manager', 'vendeur'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Action interdite.' });
    const statut = String(req.body.statut || '');
    if (!allowedStatuses.includes(statut)) return res.status(400).json({ success: false, message: 'Statut invalide.' });
    try {
        const [[order]] = await pool.query(
            `SELECT co.id_commande,co.statut,c.nom AS client_nom,c.email AS client_email
             FROM commandes co JOIN client c ON c.id_client=co.client_id
             WHERE co.id_commande=? AND co.entreprise_id=? AND co.vente_id IS NULL`,
            [req.params.id, req.user.entreprise_id]
        );
        const [result] = await pool.query(
            `UPDATE commandes SET statut = ? WHERE id_commande = ? AND entreprise_id = ? AND vente_id IS NULL`,
            [statut, req.params.id, req.user.entreprise_id]
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Commande introuvable ou deja facturee.' });
        if (order?.client_email && order.statut !== statut) {
            sendOrderStatusEmail({ to: order.client_email, name: order.client_nom, orderId: order.id_commande, status: statut, espaceUrl: espaceClientUrl() }).catch(() => null);
        }
        res.json({ success: true, message: 'Statut de la commande mis a jour.' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const convertCommande = async (req, res) => {
    if (req.user.type === 'client' || req.user.role !== 'vendeur') return res.status(403).json({ success: false, message: 'Seul le vendeur peut creer la facture.' });
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
            const tauxTva = taxRate(line.taux_tva);
            total += Number(line.quantite) * Number(line.prix_unitaire_ht) * (1 + tauxTva / 100);
        }
        await connection.query(`UPDATE ventes SET montant_ttc = ? WHERE id_ventes = ?`, [Number(total.toFixed(2)), invoiceId]);
        await connection.query(`UPDATE commandes SET statut = 'confirmee', vente_id = ? WHERE id_commande = ?`, [invoiceId, order.id_commande]);
        await connection.commit();
        const [[client]] = await pool.query(`SELECT nom,email FROM client WHERE id_client=?`, [order.client_id]);
        if (client?.email) {
            sendInvoiceAvailableEmail({
                to: client.email,
                name: client.nom,
                orderId: order.id_commande,
                invoiceId,
                total: Number(total.toFixed(2)),
                espaceUrl: espaceClientUrl()
            }).catch(() => null);
        }
        res.json({ success: true, message: `Commande convertie en facture ${invoiceId}.`, facture: invoiceId });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally { connection.release(); }
};
