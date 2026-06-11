import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const COMPANY = {
    raison_sociale: 'Quincaillerie Centrale',
    num_id_nationale: 'CD-LSH-QC-2026-001',
    email: 'contact@quincaillerie-centrale.cd',
    ville: 'Goma'
};

const MANAGER = {
    nom: 'KITSA LUSENGE Sage',
    email: 'sage.kitsa@quincaillerie-centrale.cd',
    password_hash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f'
};

const tablesToClear = [
    'paiement',
    'lignes_ventes',
    'mouvements_stock',
    'fournisseurs',
    'ventes',
    'produits',
    'categorie_produit',
    'client',
    'mail_messages',
    'user_activity_logs',
    'notifications',
    'demandes_abonnement',
    'utilisateur',
    'entreprise'
];

const sequenceValues = [
    ['entreprise', 0],
    ['utilisateur', 0],
    ['client', 0],
    ['ventes', 0],
    ['lignes_ventes', 0],
    ['paiement', 0],
    ['mouvements_stock', 0]
];

const tableExists = async (connection, tableName) => {
    const [rows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [tableName]
    );
    return Number(rows[0]?.total || 0) > 0;
};

const columnExists = async (connection, tableName, columnName) => {
    const [rows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );
    return Number(rows[0]?.total || 0) > 0;
};

const dropForeignKeysForColumn = async (connection, tableName, columnName) => {
    const [rows] = await connection.query(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [tableName, columnName]
    );

    for (const row of rows) {
        const constraintName = String(row.CONSTRAINT_NAME).replace(/`/g, '``');
        await connection.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY \`${constraintName}\``);
    }
};

const dropIfExists = async (connection, sql) => {
    await connection.query(sql);
};

const main = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: false
    });

    try {
        await connection.beginTransaction();
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        await dropIfExists(connection, 'DROP VIEW IF EXISTS v_devis_complet');
        await dropIfExists(connection, 'DROP VIEW IF EXISTS v_superadmin_entreprises_stats');
        await dropIfExists(connection, 'DROP PROCEDURE IF EXISTS sp_ConvertirDevisEnFacture');
        await dropIfExists(connection, 'DROP PROCEDURE IF EXISTS sp_Admin_CreerEntrepriseComplete');
        await dropIfExists(connection, 'DROP PROCEDURE IF EXISTS sp_Admin_ModifierAbonnement');
        await dropIfExists(connection, 'DROP PROCEDURE IF EXISTS sp_GetDashboardStats');
        await dropIfExists(connection, 'DROP TRIGGER IF EXISTS tg_id_devis');
        await dropIfExists(connection, 'DROP TRIGGER IF EXISTS tg_id_lignes_devis');
        await dropIfExists(connection, 'DROP TRIGGER IF EXISTS tg_calcul_montant_devis_insert');
        await dropIfExists(connection, 'DROP TRIGGER IF EXISTS tg_calcul_montant_devis_update');
        await dropIfExists(connection, 'DROP TRIGGER IF EXISTS tg_calcul_montant_devis_delete');
        await dropIfExists(connection, 'DROP TRIGGER IF EXISTS tg_id_super_admin');

        if (await tableExists(connection, 'lignes_devis')) {
            await connection.query('DROP TABLE lignes_devis');
        }
        if (await tableExists(connection, 'devis')) {
            await connection.query('DROP TABLE devis');
        }

        if (await columnExists(connection, 'entreprise', 'cree_par_admin_id')) {
            await dropForeignKeysForColumn(connection, 'entreprise', 'cree_par_admin_id');
            await connection.query('ALTER TABLE entreprise DROP COLUMN cree_par_admin_id');
        }

        if (await tableExists(connection, 'super_admin')) {
            await connection.query('DROP TABLE super_admin');
        }

        for (const tableName of tablesToClear) {
            if (await tableExists(connection, tableName)) {
                await connection.query(`DELETE FROM ${tableName}`);
            }
        }

        if (await tableExists(connection, 'notifications')) {
            await connection.query(
                `ALTER TABLE notifications
                 MODIFY recipient_type ENUM('user','enterprise_admin') NOT NULL DEFAULT 'user'`
            );
        }

        await connection.query(`DELETE FROM sequences WHERE nom_table IN ('super_admin', 'devis', 'lignes_devis')`);
        for (const [nomTable, value] of sequenceValues) {
            await connection.query(
                `INSERT INTO sequences (nom_table, derniere_valeur)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE derniere_valeur = VALUES(derniere_valeur)`,
                [nomTable, value]
            );
        }

        await connection.query(
            `INSERT INTO entreprise
                (id_entreprise, raison_sociale, num_id_nationale, email, ville,
                 statut_abonnement, date_expiration_abonnement)
             VALUES ('', ?, ?, ?, ?, 'actif', DATE_ADD(CURDATE(), INTERVAL 12 MONTH))`,
            [COMPANY.raison_sociale, COMPANY.num_id_nationale, COMPANY.email, COMPANY.ville]
        );

        const [[company]] = await connection.query(
            'SELECT id_entreprise FROM entreprise WHERE num_id_nationale = ?',
            [COMPANY.num_id_nationale]
        );

        await connection.query(
            `INSERT INTO utilisateur
                (id_utilisateur, entreprise_id, nom, email, mot_de_passe, role, actif)
             VALUES ('', ?, ?, ?, ?, 'manager', TRUE)`,
            [company.id_entreprise, MANAGER.nom, MANAGER.email, MANAGER.password_hash]
        );

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.commit();

        console.log('Base reinitialisee pour Quincaillerie Centrale.');
        console.log(`Entreprise: ${company.id_entreprise} - ${COMPANY.raison_sociale}`);
        console.log(`Manager: ${MANAGER.email}`);
    } catch (error) {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => null);
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
