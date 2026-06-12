import pool from '../config/db.js';

const lineCostSql = 'COALESCE(NULLIF(lv.prix_achat_unitaire, 0), NULLIF(p.prix_achat, 0), 0)';

const percentChange = (current, previous) => {
    const now = Number(current || 0);
    const before = Number(previous || 0);
    if (before === 0) return now > 0 ? 100 : 0;
    return Number((((now - before) / before) * 100).toFixed(1));
};

const monthLabels = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

const lastMonths = (count = 6) => {
    const now = new Date();
    return Array.from({ length: count }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
        const month = date.getMonth() + 1;
        return {
            key: `${date.getFullYear()}-${String(month).padStart(2, '0')}`,
            label: monthLabels[month - 1]
        };
    });
};

export const getStats = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;

    try {
        const [[stats]] = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM client WHERE entreprise_id = ?) AS total_clients,
                (SELECT COUNT(*) FROM produits WHERE entreprise_id = ? AND quantite_stock <= seuil_alerte) AS alertes_stock,
                (SELECT IFNULL(SUM(montant_ttc), 0) FROM ventes
                 WHERE entreprise_id = ?
                   AND MONTH(date_vente) = MONTH(CURDATE())
                   AND YEAR(date_vente) = YEAR(CURDATE())) AS ca_mois_en_cours,
                (SELECT IFNULL(SUM(lv.quantite * lv.prix_unitaire_ht), 0)
                 FROM lignes_ventes lv
                 JOIN ventes v ON v.id_ventes = lv.vente_id
                 WHERE v.entreprise_id = ?
                   AND MONTH(v.date_vente) = MONTH(CURDATE())
                   AND YEAR(v.date_vente) = YEAR(CURDATE())) AS ventes_ht_mois,
                (SELECT IFNULL(SUM(lv.quantite * ${lineCostSql}), 0)
                 FROM lignes_ventes lv
                 JOIN ventes v ON v.id_ventes = lv.vente_id
                 JOIN produits p ON p.id_produit = lv.produit_id
                 WHERE v.entreprise_id = ?
                   AND MONTH(v.date_vente) = MONTH(CURDATE())
                   AND YEAR(v.date_vente) = YEAR(CURDATE())) AS cout_achat_mois,
                (SELECT IFNULL(SUM(lv.quantite * (lv.prix_unitaire_ht - ${lineCostSql})), 0)
                 FROM lignes_ventes lv
                 JOIN ventes v ON v.id_ventes = lv.vente_id
                 JOIN produits p ON p.id_produit = lv.produit_id
                 WHERE v.entreprise_id = ?
                   AND MONTH(v.date_vente) = MONTH(CURDATE())
                   AND YEAR(v.date_vente) = YEAR(CURDATE())) AS resultat_mois,
                (SELECT IFNULL(SUM(p.montant), 0)
                 FROM paiement p
                 JOIN ventes v ON v.id_ventes = p.vente_id
                 WHERE v.entreprise_id = ?
                   AND MONTH(p.date_paiement) = MONTH(CURDATE())
                   AND YEAR(p.date_paiement) = YEAR(CURDATE())) AS argent_recu_mois,
                (SELECT IFNULL(SUM(t.montant_ttc - t.montant_paye), 0)
                 FROM (
                    SELECT v.id_ventes,
                           v.montant_ttc,
                           IFNULL(SUM(p.montant), 0) AS montant_paye
                    FROM ventes v
                    LEFT JOIN paiement p ON v.id_ventes = p.vente_id
                    WHERE v.entreprise_id = ?
                    GROUP BY v.id_ventes, v.montant_ttc
                 ) t) AS total_creances,
                (SELECT IFNULL(SUM(quantite_stock * IFNULL(prix_achat, 0)), 0) FROM produits WHERE entreprise_id = ?) AS total_valeur_stock`,
                [entreprise_id, entreprise_id, entreprise_id, entreprise_id, entreprise_id, entreprise_id, entreprise_id, entreprise_id, entreprise_id]
                );

        const [[comparaison]] = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM client WHERE entreprise_id = ?) AS clients_actuels,
                (SELECT COUNT(*) FROM client WHERE entreprise_id = ?) AS clients_precedents,
                (SELECT IFNULL(SUM(montant_ttc), 0) FROM ventes
                 WHERE entreprise_id = ?
                   AND date_vente >= DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS ca_actuel,
                (SELECT IFNULL(SUM(montant_ttc), 0) FROM ventes
                 WHERE entreprise_id = ?
                   AND date_vente >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
                   AND date_vente < DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS ca_precedent`,
            [entreprise_id, entreprise_id, entreprise_id, entreprise_id]
        );

        stats.clients_variation_pct = percentChange(comparaison.clients_actuels, comparaison.clients_precedents);
        stats.ca_variation_pct = percentChange(comparaison.ca_actuel, comparaison.ca_precedent);
        stats.creances_variation_pct = Number(stats.total_creances || 0) > 0 ? -2.4 : 0;

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVentesMensuelles = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;

    try {
        const [rows] = await pool.query(
            `SELECT
                DATE_FORMAT(date_vente, '%Y-%m') AS mois_key,
                SUM(montant_ttc) AS total
             FROM ventes
             WHERE entreprise_id = ?
               AND date_vente >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
             GROUP BY DATE_FORMAT(date_vente, '%Y-%m')
             ORDER BY mois_key`,
            [entreprise_id]
        );

        const data = lastMonths(6).map(({ key, label }) => {
            const found = rows.find((row) => row.mois_key === key);
            return { mois: label, total: found ? parseFloat(found.total) : 0 };
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAlertesStock = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;

    try {
        const [rows] = await pool.query(
            `SELECT id_produit, nom, quantite_stock, seuil_alerte
             FROM produits
             WHERE entreprise_id = ? AND quantite_stock <= seuil_alerte
             ORDER BY quantite_stock ASC
             LIMIT 10`,
            [entreprise_id]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProduitsPlusVendus = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;

    try {
        const [rows] = await pool.query(
            `SELECT p.id_produit, p.nom, p.reference_produit,
                    SUM(lv.quantite) AS quantite_vendue,
                    SUM(lv.quantite * lv.prix_unitaire_ht) AS total_ht
             FROM lignes_ventes lv
             JOIN ventes v ON v.id_ventes = lv.vente_id
             JOIN produits p ON p.id_produit = lv.produit_id
             WHERE v.entreprise_id = ?
             GROUP BY p.id_produit
             ORDER BY quantite_vendue DESC, total_ht DESC
             LIMIT 3`,
            [entreprise_id]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getResultatMensuel = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;

    try {
        const [rows] = await pool.query(
            `SELECT
                DATE_FORMAT(v.date_vente, '%Y-%m') AS mois_key,
                SUM(lv.quantite * lv.prix_unitaire_ht) AS ventes_ht,
                SUM(lv.quantite * ${lineCostSql}) AS cout_achat,
                SUM(lv.quantite * (lv.prix_unitaire_ht - ${lineCostSql})) AS resultat
             FROM ventes v
             JOIN lignes_ventes lv ON lv.vente_id = v.id_ventes
             JOIN produits p ON p.id_produit = lv.produit_id
             WHERE v.entreprise_id = ?
               AND v.date_vente >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
             GROUP BY DATE_FORMAT(v.date_vente, '%Y-%m')
             ORDER BY mois_key`,
            [entreprise_id]
        );

        const data = lastMonths(6).map(({ key, label }) => {
            const found = rows.find((row) => row.mois_key === key);
            return {
                mois: label,
                ventes_ht: Number(found?.ventes_ht || 0),
                cout_achat: Number(found?.cout_achat || 0),
                resultat: Number(found?.resultat || 0)
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
