import pool from '../config/db.js';

const lineCostSql = 'COALESCE(NULLIF(lv.prix_achat_unitaire, 0), NULLIF(p.prix_achat, 0), 0)';

const buildDateFilter = (alias, query) => {
    const clauses = [];
    const params = [];
    if (query.date_debut) {
        clauses.push(`DATE(${alias}) >= ?`);
        params.push(query.date_debut);
    }
    if (query.date_fin) {
        clauses.push(`DATE(${alias}) <= ?`);
        params.push(query.date_fin);
    }
    return { sql: clauses.length ? ` AND ${clauses.join(' AND ')}` : '', params };
};

export const getFactures = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    const dateFilter = buildDateFilter('v.date_vente', req.query);
    try {
        const [rows] = await pool.query(
            `SELECT v.id_ventes, v.numero_facture, v.date_vente, v.montant_ttc,
                    c.id_client, c.nom AS client_nom, c.postnom AS client_postnom,
                    IFNULL(SUM(p.montant), 0) AS total_paye,
                    (v.montant_ttc - IFNULL(SUM(p.montant), 0)) AS reste_a_payer
             FROM ventes v
             JOIN client c ON c.id_client = v.client_id
             LEFT JOIN paiement p ON p.vente_id = v.id_ventes
             WHERE v.entreprise_id = ?${dateFilter.sql}
             GROUP BY v.id_ventes
             ORDER BY v.date_vente DESC`,
            [entreprise_id, ...dateFilter.params]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCreances = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    const dateFilter = buildDateFilter('v.date_vente', req.query);
    try {
        const [rows] = await pool.query(
            `SELECT v.numero_facture, v.date_vente, c.nom AS client_nom,
                    v.montant_ttc AS montant_du,
                    IFNULL(SUM(p.montant), 0) AS montant_paye,
                    (v.montant_ttc - IFNULL(SUM(p.montant), 0)) AS reste_a_payer
             FROM ventes v
             JOIN client c ON c.id_client = v.client_id
             LEFT JOIN paiement p ON p.vente_id = v.id_ventes
             WHERE v.entreprise_id = ?${dateFilter.sql}
             GROUP BY v.id_ventes
             HAVING reste_a_payer > 0
             ORDER BY reste_a_payer DESC`,
            [entreprise_id, ...dateFilter.params]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStockInventaire = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT p.id_produit, p.reference_produit, p.nom, p.unite,
                    p.prix_ht AS prix_vente_unitaire,
                    p.prix_achat AS prix_achat_moyen,
                    p.quantite_stock,
                    p.seuil_alerte,
                    IFNULL(entrees.total_entrees, 0) AS total_entrees,
                    IFNULL(sorties.total_sorties, 0) AS total_sorties,
                    dernier_entree.derniere_entree,
                    (p.quantite_stock * p.prix_achat) AS valeur_stock_achat,
                    (p.quantite_stock * p.prix_ht) AS valeur_stock_vente,
                    c.nom AS categorie_nom,
                    CASE
                        WHEN p.quantite_stock <= 0 THEN 'RUPTURE'
                        WHEN p.quantite_stock <= p.seuil_alerte THEN 'REAPPROVISIONNER'
                        ELSE 'OK'
                    END AS statut
             FROM produits p
             LEFT JOIN categorie_produit c ON c.id_categorie = p.categorie_id
             LEFT JOIN (
                SELECT produit_id, SUM(quantite) AS total_entrees
                FROM mouvements_stock
                WHERE type_mouvement='entree'
                GROUP BY produit_id
             ) entrees ON entrees.produit_id = p.id_produit
             LEFT JOIN (
                SELECT lv.produit_id, SUM(lv.quantite) AS total_sorties
                FROM lignes_ventes lv
                JOIN ventes v ON v.id_ventes = lv.vente_id
                WHERE v.entreprise_id = ?
                GROUP BY lv.produit_id
             ) sorties ON sorties.produit_id = p.id_produit
             LEFT JOIN (
                SELECT produit_id, MAX(date_mouvement) AS derniere_entree
                FROM mouvements_stock
                WHERE type_mouvement='entree'
                GROUP BY produit_id
             ) dernier_entree ON dernier_entree.produit_id = p.id_produit
             WHERE p.entreprise_id = ?
             ORDER BY p.nom ASC`,
            [entreprise_id, entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTopAcheteurs = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    const dateFilter = buildDateFilter('v.date_vente', req.query);
    try {
        const [rows] = await pool.query(
            `SELECT c.id_client, c.nom, c.postnom,
                    COUNT(v.id_ventes) AS nombre_achats,
                    IFNULL(SUM(v.montant_ttc), 0) AS ca_total,
                    MAX(v.date_vente) AS derniere_visite
             FROM client c
             LEFT JOIN ventes v ON v.client_id = c.id_client
                ${dateFilter.sql ? dateFilter.sql.replace(' AND ', ' AND ') : ''}
             WHERE c.entreprise_id = ?
             GROUP BY c.id_client
             ORDER BY ca_total DESC, nombre_achats DESC
             LIMIT 10`,
            [...dateFilter.params, entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBilan = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    const dateFilter = buildDateFilter('v.date_vente', req.query);
    try {
        const [[row]] = await pool.query(
            `SELECT
                IFNULL(SUM(lv.quantite * lv.prix_unitaire_ht), 0) AS ventes_ht,
                IFNULL(SUM(lv.quantite * ${lineCostSql}), 0) AS cout_achat,
                IFNULL(SUM(lv.quantite * (lv.prix_unitaire_ht - ${lineCostSql})), 0) AS resultat,
                COUNT(DISTINCT v.id_ventes) AS total_factures
             FROM ventes v
             JOIN lignes_ventes lv ON lv.vente_id = v.id_ventes
             JOIN produits p ON p.id_produit = lv.produit_id
             WHERE v.entreprise_id = ?${dateFilter.sql}`,
            [entreprise_id, ...dateFilter.params]
        );

        res.json({ success: true, data: row });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getJournal = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    const dateFilter = buildDateFilter('v.date_vente', req.query);
    try {
        const [rows] = await pool.query(
            `SELECT v.date_vente AS date_operation,
                    v.numero_facture AS reference,
                    c.nom AS libelle,
                    v.montant_ttc AS entree,
                    0 AS sortie,
                    'Facture' AS type_operation
             FROM ventes v
             JOIN client c ON c.id_client = v.client_id
             WHERE v.entreprise_id = ?${dateFilter.sql}
             ORDER BY date_operation DESC`,
            [entreprise_id, ...dateFilter.params]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLivreCaisse = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    const dateFilter = buildDateFilter('p.date_paiement', req.query);
    try {
        const [rows] = await pool.query(
            `SELECT p.date_paiement,
                    v.numero_facture,
                    c.nom AS client_nom,
                    p.mode_paiement,
                    p.montant,
                    p.reference_externe
             FROM paiement p
             JOIN ventes v ON v.id_ventes = p.vente_id
             JOIN client c ON c.id_client = v.client_id
             WHERE v.entreprise_id = ?${dateFilter.sql}
             ORDER BY p.date_paiement DESC`,
            [entreprise_id, ...dateFilter.params]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistoriqueClient = async (req, res) => {
    const { id } = req.params;
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT v.numero_facture, v.date_vente, p.nom AS produit_nom,
                    lv.quantite, lv.prix_unitaire_ht,
                    (lv.quantite * lv.prix_unitaire_ht * 1.16) AS total_ttc
             FROM client c
             JOIN ventes v ON v.client_id = c.id_client
             JOIN lignes_ventes lv ON lv.vente_id = v.id_ventes
             JOIN produits p ON p.id_produit = lv.produit_id
             WHERE c.id_client = ? AND c.entreprise_id = ? AND v.entreprise_id = ?
             ORDER BY v.date_vente DESC`,
            [id, entreprise_id, entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
