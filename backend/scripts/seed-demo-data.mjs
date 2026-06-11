import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { ensureRuntimeSchema } from '../src/services/schemaService.js';
import pool from '../src/config/db.js';

dotenv.config();

const companyName = 'Quincaillerie Centrale';

const main = async () => {
    await ensureRuntimeSchema(pool);
    await pool.end();

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: false
    });

    try {
        await connection.beginTransaction();

        const [[company]] = await connection.query(
            `SELECT id_entreprise FROM entreprise WHERE raison_sociale = ? LIMIT 1`,
            [companyName]
        );

        if (!company) {
            throw new Error(`Entreprise introuvable: ${companyName}`);
        }

        const entrepriseId = company.id_entreprise;
        const productId = (reference) => `PRD-${String(reference).replace(/\s+/g, '')}-${entrepriseId.slice(0, 8)}`.toUpperCase();
        const products = {
            ciment: productId('CIM-42'),
            marteau: productId('OUT-MAR'),
            tuyau: productId('PLO-TUY'),
            robinet: productId('PLO-ROB')
        };

        await connection.query(
            `UPDATE utilisateur
             SET telephone = COALESCE(telephone, '+243 990 000 001')
             WHERE entreprise_id = ? AND email = 'sage.kitsa@quincaillerie-centrale.cd'`,
            [entrepriseId]
        );

        await connection.query(
            `INSERT INTO categorie_produit
                (id_categorie, entreprise_id, reference_categorie, nom, description)
             VALUES
                ('CAT-DEMO-CIMENT', ?, 'CAT-CIMENT', 'Ciment', 'Ciments et produits de construction'),
                ('CAT-DEMO-OUTILS', ?, 'CAT-OUTILS', 'Outils', 'Outillage manuel et accessoires'),
                ('CAT-DEMO-PLOMBERIE', ?, 'CAT-PLOMBERIE', 'Plomberie', 'Tuyaux, robinets et raccords')
             ON DUPLICATE KEY UPDATE
                nom = VALUES(nom),
                description = VALUES(description)`,
            [entrepriseId, entrepriseId, entrepriseId]
        );

        await connection.query(
            `INSERT INTO fournisseurs
                (id_fournisseur, entreprise_id, nom, telephone, email, adresse)
             VALUES
                ('FOU-DEMO-KATANGA', ?, 'Katanga Materiaux', '+243 990 120 111', 'vente@katanga-materiaux.cd', 'Lubumbashi'),
                ('FOU-DEMO-BUILD', ?, 'Build Market RDC', '+243 990 120 222', 'contact@buildmarket.cd', 'Goma'),
                ('FOU-DEMO-TOOLS', ?, 'Tools Express', '+243 990 120 333', 'sales@tools-express.cd', 'Kinshasa')
             ON DUPLICATE KEY UPDATE
                telephone = VALUES(telephone),
                email = VALUES(email),
                adresse = VALUES(adresse)`,
            [entrepriseId, entrepriseId, entrepriseId]
        );

        await connection.query(
            `INSERT INTO produits
                (id_produit, reference_produit, nom, categorie_id, unite, prix_ht, prix_achat, taux_tva, quantite_stock, seuil_alerte, entreprise_id)
             VALUES
                ('', 'CIM-42', 'Ciment gris 42.5', 'CAT-DEMO-CIMENT', 'sac', 20.00, 15.00, 16.00, 65, 15, ?),
                ('', 'OUT-MAR', 'Marteau chantier', 'CAT-DEMO-OUTILS', 'piece', 9.00, 5.50, 16.00, 28, 8, ?),
                ('', 'PLO-TUY', 'Tuyau PVC 32mm', 'CAT-DEMO-PLOMBERIE', 'piece', 4.50, 2.75, 16.00, 90, 20, ?),
                ('', 'PLO-ROB', 'Robinet laiton', 'CAT-DEMO-PLOMBERIE', 'piece', 7.50, 4.25, 16.00, 18, 10, ?)
             ON DUPLICATE KEY UPDATE
                categorie_id = VALUES(categorie_id),
                unite = VALUES(unite),
                prix_ht = VALUES(prix_ht),
                prix_achat = VALUES(prix_achat),
                taux_tva = VALUES(taux_tva),
                quantite_stock = VALUES(quantite_stock),
                seuil_alerte = VALUES(seuil_alerte)`,
            [entrepriseId, entrepriseId, entrepriseId, entrepriseId]
        );

        const [oldDemoClients] = await connection.query(
            `SELECT id_client
             FROM client
             WHERE entreprise_id = ?
               AND telephone IN ('+243 990 210 001', '+243 990 210 002', '+243 990 210 003')`,
            [entrepriseId]
        );
        const oldClientIds = oldDemoClients.map((client) => client.id_client);
        if (oldClientIds.length) {
            const [oldVentes] = await connection.query(
                `SELECT id_ventes FROM ventes WHERE entreprise_id = ? AND client_id IN (?)`,
                [entrepriseId, oldClientIds]
            );
            const oldVenteIds = oldVentes.map((vente) => vente.id_ventes);
            if (oldVenteIds.length) {
                await connection.query(`DELETE FROM paiement WHERE vente_id IN (?)`, [oldVenteIds]);
                await connection.query(`DELETE FROM lignes_ventes WHERE vente_id IN (?)`, [oldVenteIds]);
                await connection.query(`DELETE FROM ventes WHERE id_ventes IN (?)`, [oldVenteIds]);
            }
        }
        await connection.query(`DELETE FROM mouvements_stock WHERE id_mouvement LIKE 'MVT-DEMO-%'`);

        await connection.query(
            `DELETE FROM client
             WHERE entreprise_id = ?
               AND telephone IN ('+243 990 210 001', '+243 990 210 002', '+243 990 210 003')`,
            [entrepriseId]
        );

        await connection.query(
            `INSERT INTO client (id_client, nom, postnom, telephone, entreprise_id)
             VALUES
                ('', 'Kabongo', 'Patrick', '+243 990 210 001', ?),
                ('', 'Mutombo', 'Claire', '+243 990 210 002', ?),
                ('', 'Ilunga', 'David', '+243 990 210 003', ?)`,
            [entrepriseId, entrepriseId, entrepriseId]
        );

        const [demoClients] = await connection.query(
            `SELECT id_client, telephone
             FROM client
             WHERE entreprise_id = ?
               AND telephone IN ('+243 990 210 001', '+243 990 210 002', '+243 990 210 003')`,
            [entrepriseId]
        );
        const clientIdByPhone = Object.fromEntries(demoClients.map((client) => [client.telephone, client.id_client]));

        const mouvements = [
            ['MVT-DEMO-CIM-12', products.ciment, 'entree', 40, 'FOU-DEMO-KATANGA', 12, 480, 'Premier achat a 12 USD'],
            ['MVT-DEMO-CIM-15', products.ciment, 'entree', 45, 'FOU-DEMO-BUILD', 15, 675, 'Nouvel achat a 15 USD'],
            ['MVT-DEMO-MARTEAU', products.marteau, 'entree', 30, 'FOU-DEMO-TOOLS', 5.5, 165, 'Stock initial outils'],
            ['MVT-DEMO-TUYAU', products.tuyau, 'entree', 100, 'FOU-DEMO-BUILD', 2.75, 275, 'Stock initial plomberie']
        ];

        for (const mouvement of mouvements) {
            await connection.query(
                `INSERT INTO mouvements_stock
                    (id_mouvement, produit_id, type_mouvement, quantite, fournisseur_id, prix_achat_unitaire, prix_achat_total, note)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                mouvement
            );
        }

        const ventes = [
            ['kabongo', clientIdByPhone['+243 990 210 001'], entrepriseId, 348.00, '2026-06-03 09:15:00'],
            ['mutombo', clientIdByPhone['+243 990 210 002'], entrepriseId, 151.38, '2026-06-06 14:30:00'],
            ['ilunga', clientIdByPhone['+243 990 210 003'], entrepriseId, 52.20, '2026-06-09 11:10:00']
        ];

        const venteIds = {};
        for (const [key, clientId, currentEntrepriseId, montant, dateVente] of ventes) {
            await connection.query(
                `INSERT INTO ventes (id_ventes, numero_facture, client_id, entreprise_id, montant_ttc, date_vente)
                 VALUES ('', '', ?, ?, ?, ?)`,
                [clientId, currentEntrepriseId, montant, dateVente]
            );
            const [[vente]] = await connection.query(
                `SELECT id_ventes
                 FROM ventes
                 WHERE client_id = ? AND entreprise_id = ? AND date_vente = ?
                 ORDER BY id_ventes DESC
                 LIMIT 1`,
                [clientId, currentEntrepriseId, dateVente]
            );
            venteIds[key] = vente.id_ventes;
        }

        const lignes = [
            [venteIds.kabongo, products.ciment, 15, 20.00, 15.00],
            [venteIds.mutombo, products.marteau, 5, 9.00, 5.50],
            [venteIds.mutombo, products.tuyau, 18, 4.50, 2.75],
            [venteIds.ilunga, products.robinet, 6, 7.50, 4.25]
        ];

        for (const ligne of lignes) {
            await connection.query(
                `INSERT INTO lignes_ventes
                    (id_lignes_ventes, vente_id, produit_id, quantite, prix_unitaire_ht, prix_achat_unitaire)
                 VALUES ('', ?, ?, ?, ?, ?)`,
                ligne
            );
        }

        const paiements = [
            [venteIds.kabongo, 300.00, 'especes', null, null, '2026-06-03 09:20:00'],
            [venteIds.mutombo, 151.38, 'mobile_money', 'MM-DEMO-002', '+243 990 210 002', '2026-06-06 14:38:00'],
            [venteIds.ilunga, 30.00, 'especes', null, null, '2026-06-09 11:18:00']
        ];

        for (const paiement of paiements) {
            await connection.query(
                `INSERT INTO paiement
                    (id_paiement, vente_id, montant, mode_paiement, reference_externe, telephone_payeur, date_paiement)
                 VALUES ('', ?, ?, ?, ?, ?, ?)`,
                paiement
            );
        }

        await connection.query(
            `UPDATE produits
             SET quantite_stock = CASE id_produit
                WHEN ? THEN 50
                WHEN ? THEN 23
                WHEN ? THEN 72
                WHEN ? THEN 12
                ELSE quantite_stock
             END
             WHERE entreprise_id = ?`,
            [products.ciment, products.marteau, products.tuyau, products.robinet, entrepriseId]
        );

        await connection.commit();
        console.log('Jeux de donnees demo ajoutes pour Quincaillerie Centrale.');
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
};

main().catch((error) => {
    console.error(error.message);
    if (error.sql) console.error(error.sql);
    process.exit(1);
});
