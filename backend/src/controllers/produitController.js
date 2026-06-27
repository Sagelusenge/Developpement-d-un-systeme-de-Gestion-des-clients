import pool from '../config/db.js';
import { nextId } from '../services/idService.js';
import { notifyClientsForNewCategoryProduct } from '../services/clientLoyaltyService.js';

const sanitizeReference = (value) => String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

const buildProductReference = (nom) => {
    const base = sanitizeReference(nom).slice(0, 18) || 'PRODUIT';
    const suffix = Date.now().toString(36).toUpperCase().slice(-5);
    return sanitizeReference(`${base}-${suffix}`);
};

const parseOptionalTaxRate = (value) => {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const rate = Number(value);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
};

// GET /api/produits
export const getAllProduits = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT p.*, c.nom AS categorie_nom,
                CASE
                    WHEN p.quantite_stock <= 0 THEN 'RUPTURE'
                    WHEN p.quantite_stock <= p.seuil_alerte THEN 'ALERTE'
                    ELSE 'OK'
                END AS statut_stock
             FROM produits p
             LEFT JOIN categorie_produit c ON c.id_categorie = p.categorie_id
             WHERE p.entreprise_id = ?
             ORDER BY (p.prix_ht < p.prix_achat) DESC, p.nom ASC`,
            [entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMouvementsStock = async (req, res) => {
    const entreprise_id = req.user.entreprise_id;
    try {
        const [rows] = await pool.query(
            `SELECT * FROM (
             SELECT m.id_mouvement, m.type_mouvement, m.quantite, m.date_mouvement,
                    m.prix_achat_unitaire, m.prix_achat_total, m.note,
                    p.nom AS produit_nom, p.reference_produit,
                    f.nom AS fournisseur_nom
             FROM mouvements_stock m
             JOIN produits p ON p.id_produit = m.produit_id
             LEFT JOIN fournisseurs f ON f.id_fournisseur = m.fournisseur_id
             WHERE p.entreprise_id = ?
             UNION ALL
             SELECT CONCAT('SORTIE-',lv.id_lignes_ventes), 'sortie', lv.quantite, v.date_vente,
                    lv.prix_achat_unitaire, lv.quantite * lv.prix_achat_unitaire,
                    CONCAT('Vente ',v.numero_facture), p.nom, p.reference_produit, NULL
             FROM lignes_ventes lv JOIN ventes v ON v.id_ventes=lv.vente_id
             JOIN produits p ON p.id_produit=lv.produit_id
             WHERE v.entreprise_id = ?) mouvements
             ORDER BY date_mouvement DESC LIMIT 1000`,
            [entreprise_id, entreprise_id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/produits
export const createProduit = async (req, res) => {
    const { nom, categorie_id, photo_url, prix_ht, prix_achat, taux_tva, quantite_stock, seuil_alerte, unite } = req.body;
    const entreprise_id = req.user.entreprise_id;
    const normalizedTauxTva = parseOptionalTaxRate(taux_tva);

    if (!nom || Number(prix_ht) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Nom et prix positif requis'
        });
    }
    if (Number(prix_achat || 0) > Number(prix_ht)) {
        return res.status(400).json({ success: false, message: "Le prix de vente ne peut pas etre inferieur au cout d'achat." });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const idProduit = await nextId(connection, 'produits', 'PRD', 5);
        const reference = buildProductReference(nom);
        await connection.query(
            `INSERT INTO produits
             (id_produit, reference_produit, nom, categorie_id, unite, photo_url, prix_ht, prix_achat, taux_tva, quantite_stock, seuil_alerte, entreprise_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idProduit,
                reference,
                nom,
                categorie_id || null,
                unite || 'piece',
                photo_url || null,
                Number(prix_ht),
                Number(prix_achat) || 0,
                normalizedTauxTva,
                Number(quantite_stock) || 0,
                Number(seuil_alerte) || 5,
                entreprise_id
            ]
        );
        const stockInitial = Number(quantite_stock) || 0;
        if (stockInitial > 0) {
            const idMouvement = await nextId(connection, 'mouvements_stock', 'MVT', 6);
            await connection.query(
                `INSERT INTO mouvements_stock
                    (id_mouvement, produit_id, type_mouvement, quantite, prix_achat_unitaire, prix_achat_total, note)
                 VALUES (?, ?, 'entree', ?, ?, ?, ?)`,
                [idMouvement, idProduit, stockInitial, Number(prix_achat) || 0, stockInitial * (Number(prix_achat) || 0), 'Stock initial a la creation du produit']
            );
        }
        await connection.commit();
        notifyClientsForNewCategoryProduct({ productId: idProduit, entrepriseId: entreprise_id }).catch(() => null);
        res.status(201).json({ success: true, message: 'Produit cree avec succes', data: { id_produit: idProduit, reference_produit: reference } });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

// PUT /api/produits/:id
export const updateProduit = async (req, res) => {
    const { id } = req.params;
    const { nom, categorie_id, unite, photo_url, prix_ht, prix_achat, taux_tva, seuil_alerte } = req.body;
    const entreprise_id = req.user.entreprise_id;
    const normalizedTauxTva = parseOptionalTaxRate(taux_tva);

    if (!nom || Number(prix_ht) <= 0) {
        return res.status(400).json({ success: false, message: 'Nom et prix positif requis' });
    }
    if (Number(prix_achat || 0) > Number(prix_ht)) {
        return res.status(400).json({ success: false, message: "Le prix de vente ne peut pas etre inferieur au cout d'achat." });
    }

    try {
        const [result] = await pool.query(
            `UPDATE produits
             SET nom = ?, categorie_id = ?, unite = ?, photo_url = ?, prix_ht = ?, prix_achat = ?, taux_tva = ?, seuil_alerte = ?
             WHERE id_produit = ? AND entreprise_id = ?`,
            [nom, categorie_id || null, unite || 'piece', photo_url || null, Number(prix_ht), Number(prix_achat) || 0, normalizedTauxTva, Number(seuil_alerte) || 5, id, entreprise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produit introuvable' });
        }

        res.json({ success: true, message: 'Produit mis a jour' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/produits/:id/approvisionner
export const approvisionner = async (req, res) => {
    const { id } = req.params;
    const { quantite, fournisseur_id, prix_achat, note } = req.body;
    const entreprise_id = req.user.entreprise_id;
    const quantiteNumber = Number(quantite);
    const prixAchatNumber = Number(prix_achat);

    if (!Number.isFinite(quantiteNumber) || quantiteNumber <= 0) {
        return res.status(400).json({ success: false, message: 'Quantite positive requise' });
    }

    if (!fournisseur_id) {
        return res.status(400).json({ success: false, message: 'Fournisseur requis pour approvisionner' });
    }

    if (!Number.isFinite(prixAchatNumber) || prixAchatNumber < 0) {
        return res.status(400).json({ success: false, message: 'Prix d achat valide requis' });
    }

    try {
        const [produits] = await pool.query(
            `SELECT id_produit FROM produits WHERE id_produit = ? AND entreprise_id = ?`,
            [id, entreprise_id]
        );

        if (produits.length === 0) {
            return res.status(404).json({ success: false, message: 'Produit introuvable dans votre entreprise' });
        }

        const [fournisseurs] = await pool.query(
            `SELECT id_fournisseur FROM fournisseurs WHERE id_fournisseur = ? AND entreprise_id = ?`,
            [fournisseur_id, entreprise_id]
        );

        if (fournisseurs.length === 0) {
            return res.status(404).json({ success: false, message: 'Fournisseur introuvable' });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [[produitStock]] = await connection.query(
                `SELECT quantite_stock, prix_achat
                 FROM produits
                 WHERE id_produit = ? AND entreprise_id = ?
                 FOR UPDATE`,
                [id, entreprise_id]
            );
            const stockActuel = Number(produitStock?.quantite_stock || 0);
            const coutActuel = Number(produitStock?.prix_achat || 0);
            const coutTotalActuel = Math.max(0, stockActuel) * coutActuel;
            const coutNouvelAchat = quantiteNumber * prixAchatNumber;
            const stockApresAchat = stockActuel + quantiteNumber;
            const coutMoyenPondere = stockApresAchat > 0
                ? Number(((coutTotalActuel + coutNouvelAchat) / stockApresAchat).toFixed(2))
                : prixAchatNumber;

            await connection.query(
                `UPDATE produits
                 SET quantite_stock = quantite_stock + ?, prix_achat = ?
                 WHERE id_produit = ? AND entreprise_id = ?`,
                [quantiteNumber, coutMoyenPondere, id, entreprise_id]
            );
            const idMouvement = await nextId(connection, 'mouvements_stock', 'MVT', 6);
            await connection.query(
                `INSERT INTO mouvements_stock
                    (id_mouvement, produit_id, type_mouvement, quantite, fournisseur_id, prix_achat_unitaire, prix_achat_total, note)
                 VALUES (?, ?, 'entree', ?, ?, ?, ?, ?)`,
                [idMouvement, id, quantiteNumber, fournisseur_id, prixAchatNumber, prixAchatNumber * quantiteNumber, note || null]
            );
            await connection.commit();
            if (stockActuel <= 0 && stockApresAchat > 0) {
                notifyClientsForNewCategoryProduct({ productId: id, entrepriseId: entreprise_id }).catch(() => null);
            }
            res.json({
                success: true,
                message: `Stock mis a jour (+${quantiteNumber} unites)`,
                data: {
                    prix_achat_unitaire: prixAchatNumber,
                    prix_achat_total: coutNouvelAchat,
                    cout_moyen_pondere: coutMoyenPondere,
                    stock_apres_achat: stockApresAchat
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/produits/:id
export const deleteProduit = async (req, res) => {
    const { id } = req.params;
    const entreprise_id = req.user.entreprise_id;
    try {
        const [result] = await pool.query(
            'DELETE FROM produits WHERE id_produit = ? AND entreprise_id = ?',
            [id, entreprise_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Produit introuvable' });
        }

        res.json({ success: true, message: 'Produit supprime' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
