export const ensureRuntimeSchema = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS sequences (
            nom_table VARCHAR(50) PRIMARY KEY,
            derniere_valeur INT NOT NULL DEFAULT 0
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS entreprise (
            id_entreprise VARCHAR(50) PRIMARY KEY,
            raison_sociale VARCHAR(200) NOT NULL,
            num_id_nationale VARCHAR(50) UNIQUE,
            email VARCHAR(150),
            ville VARCHAR(100),
            statut_abonnement ENUM('actif', 'suspendu', 'expire') DEFAULT 'actif',
            date_expiration_abonnement DATE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS utilisateur (
            id_utilisateur VARCHAR(50) PRIMARY KEY,
            entreprise_id VARCHAR(50) NOT NULL,
            nom VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            telephone VARCHAR(30),
            mot_de_passe VARCHAR(255) NOT NULL,
            role ENUM('manager','caissier','magasinier') NOT NULL,
            actif BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS client (
            id_client VARCHAR(50) PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            postnom VARCHAR(100),
            telephone VARCHAR(20),
            entreprise_id VARCHAR(50) NOT NULL,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS categorie_produit (
            id_categorie VARCHAR(50) PRIMARY KEY,
            entreprise_id VARCHAR(50) NOT NULL,
            reference_categorie VARCHAR(50),
            nom VARCHAR(120) NOT NULL,
            description VARCHAR(255),
            photo_url TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_categorie_entreprise_nom (entreprise_id, nom),
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS produits (
            id_produit VARCHAR(50) PRIMARY KEY,
            reference_produit VARCHAR(50) NOT NULL,
            nom VARCHAR(200) NOT NULL,
            categorie_id VARCHAR(50) NULL,
            prix_ht DECIMAL(10,2) NOT NULL,
            prix_achat DECIMAL(10,2) NOT NULL DEFAULT 0,
            taux_tva DECIMAL(5,2) DEFAULT 16.00,
            quantite_stock INT DEFAULT 0,
            seuil_alerte INT DEFAULT 5,
            photo_url TEXT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS fournisseurs (
            id_fournisseur VARCHAR(50) PRIMARY KEY,
            entreprise_id VARCHAR(50) NOT NULL,
            nom VARCHAR(160) NOT NULL,
            telephone VARCHAR(30),
            email VARCHAR(160),
            adresse VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_fournisseur_entreprise_nom (entreprise_id, nom),
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS mouvements_stock (
            id_mouvement VARCHAR(50) PRIMARY KEY,
            produit_id VARCHAR(50) NOT NULL,
            fournisseur_id VARCHAR(50) NULL,
            type_mouvement ENUM('entree', 'sortie') NOT NULL,
            quantite INT NOT NULL,
            prix_achat_unitaire DECIMAL(10,2) NULL,
            prix_achat_total DECIMAL(12,2) NULL,
            note VARCHAR(255) NULL,
            date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (produit_id) REFERENCES produits(id_produit) ON DELETE CASCADE,
            FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id_fournisseur) ON DELETE SET NULL
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS ventes (
            id_ventes VARCHAR(50) PRIMARY KEY,
            numero_facture VARCHAR(50) UNIQUE NOT NULL,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            montant_ttc DECIMAL(10,2) DEFAULT 0,
            date_vente TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES client(id_client),
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS lignes_ventes (
            id_lignes_ventes VARCHAR(50) PRIMARY KEY,
            vente_id VARCHAR(50) NOT NULL,
            produit_id VARCHAR(50) NOT NULL,
            quantite INT NOT NULL,
            prix_unitaire_ht DECIMAL(10,2) NOT NULL,
            prix_achat_unitaire DECIMAL(10,2) NOT NULL DEFAULT 0,
            FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE,
            FOREIGN KEY (produit_id) REFERENCES produits(id_produit)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS paiement (
            id_paiement VARCHAR(50) PRIMARY KEY,
            vente_id VARCHAR(50) NOT NULL,
            montant DECIMAL(10,2) NOT NULL,
            mode_paiement ENUM('especes', 'carte', 'virement', 'mobile_money') NOT NULL,
            reference_externe VARCHAR(100),
            telephone_payeur VARCHAR(20),
            date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id_notification INT AUTO_INCREMENT PRIMARY KEY,
            recipient_type ENUM('user','enterprise_admin') NOT NULL DEFAULT 'user',
            recipient_user_id VARCHAR(50),
            entreprise_id VARCHAR(50),
            titre VARCHAR(160) NOT NULL,
            message TEXT NOT NULL,
            lu BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_notifications_user (recipient_user_id, lu),
            INDEX idx_notifications_entreprise (entreprise_id, recipient_type, lu)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS mail_messages (
            id_mail INT AUTO_INCREMENT PRIMARY KEY,
            entreprise_id VARCHAR(50),
            user_id VARCHAR(50),
            sender_email VARCHAR(160),
            to_email VARCHAR(160) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT,
            status VARCHAR(40) NOT NULL DEFAULT 'envoye',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_mail_entreprise (entreprise_id, created_at),
            INDEX idx_mail_user (user_id, created_at)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_activity_logs (
            id_log INT AUTO_INCREMENT PRIMARY KEY,
            entreprise_id VARCHAR(50) NOT NULL,
            user_id VARCHAR(50) NOT NULL,
            user_name VARCHAR(160),
            user_role VARCHAR(50),
            action_type VARCHAR(30) NOT NULL,
            module VARCHAR(80),
            entity_id VARCHAR(80),
            description VARCHAR(255) NOT NULL,
            metadata JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_activity_entreprise_date (entreprise_id, created_at),
            INDEX idx_activity_user_date (user_id, created_at)
        )
    `);

    const addColumnIfMissing = async (table, column, definition) => {
        const [rows] = await pool.query(
            `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?`,
            [table, column]
        );

        if (rows.length === 0) {
            await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        }
    };

    await addColumnIfMissing('notifications', 'recipient_type', "ENUM('user','enterprise_admin') NOT NULL DEFAULT 'user'");
    await addColumnIfMissing('notifications', 'recipient_user_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('notifications', 'entreprise_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('notifications', 'titre', "VARCHAR(160) NOT NULL DEFAULT 'Notification'");
    await addColumnIfMissing('notifications', 'message', 'TEXT NULL');
    await addColumnIfMissing('notifications', 'lu', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfMissing('notifications', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await addColumnIfMissing('mail_messages', 'entreprise_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('mail_messages', 'user_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('mail_messages', 'sender_email', 'VARCHAR(160) NULL');
    await addColumnIfMissing('mail_messages', 'to_email', "VARCHAR(160) NOT NULL DEFAULT ''");
    await addColumnIfMissing('mail_messages', 'subject', "VARCHAR(255) NOT NULL DEFAULT ''");
    await addColumnIfMissing('mail_messages', 'message', 'TEXT NULL');
    await addColumnIfMissing('mail_messages', 'status', 'VARCHAR(40) NOT NULL DEFAULT "envoye"');
    await addColumnIfMissing('mail_messages', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await addColumnIfMissing('utilisateur', 'telephone', 'VARCHAR(30) NULL');

    await addColumnIfMissing('user_activity_logs', 'entreprise_id', 'VARCHAR(50) NOT NULL');
    await addColumnIfMissing('user_activity_logs', 'user_id', 'VARCHAR(50) NOT NULL');
    await addColumnIfMissing('user_activity_logs', 'user_name', 'VARCHAR(160) NULL');
    await addColumnIfMissing('user_activity_logs', 'user_role', 'VARCHAR(50) NULL');
    await addColumnIfMissing('user_activity_logs', 'action_type', 'VARCHAR(30) NOT NULL DEFAULT "ACTION"');
    await addColumnIfMissing('user_activity_logs', 'module', 'VARCHAR(80) NULL');
    await addColumnIfMissing('user_activity_logs', 'entity_id', 'VARCHAR(80) NULL');
    await addColumnIfMissing('user_activity_logs', 'description', 'VARCHAR(255) NOT NULL DEFAULT "Action utilisateur"');
    await addColumnIfMissing('user_activity_logs', 'metadata', 'JSON NULL');
    await addColumnIfMissing('user_activity_logs', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    const [productColumns] = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'produits'
          AND COLUMN_NAME = 'categorie_id'
    `);

    if (productColumns.length === 0) {
        await pool.query(`ALTER TABLE produits ADD COLUMN categorie_id VARCHAR(50) NULL AFTER nom`);
    }

    await addColumnIfMissing('produits', 'photo_url', 'TEXT NULL');
    await addColumnIfMissing('produits', 'prix_achat', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
    await addColumnIfMissing('mouvements_stock', 'fournisseur_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('mouvements_stock', 'prix_achat_unitaire', 'DECIMAL(10,2) NULL');
    await addColumnIfMissing('mouvements_stock', 'prix_achat_total', 'DECIMAL(12,2) NULL');
    await addColumnIfMissing('mouvements_stock', 'note', 'VARCHAR(255) NULL');
    await addColumnIfMissing('lignes_ventes', 'prix_achat_unitaire', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
    await addColumnIfMissing('categorie_produit', 'reference_categorie', 'VARCHAR(50) NULL');
    await addColumnIfMissing('categorie_produit', 'photo_url', 'TEXT NULL');

    await pool.query(`
        UPDATE categorie_produit
        SET reference_categorie = LEFT(id_categorie, 50)
        WHERE reference_categorie IS NULL OR reference_categorie = ''
    `);
};
