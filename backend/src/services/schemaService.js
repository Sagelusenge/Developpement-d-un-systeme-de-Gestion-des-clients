export const ensureRuntimeSchema = async (pool) => {
    const legacyTriggers = [
        'tg_id_entreprise',
        'tg_id_utilisateur',
        'tg_id_client',
        'tg_id_produits',
        'tg_id_ventes',
        'tg_id_lignes_ventes',
        'tg_id_paiement',
        'tg_verif_stock_avant_vente',
        'tg_stock_apres_vente',
        'tg_calcul_montant_vente_insert',
        'tg_activation_auto_abonnement',
        'tg_verif_abonnement_avant_vente'
    ];

    for (const trigger of legacyTriggers) {
        await pool.query(`DROP TRIGGER IF EXISTS \`${trigger}\``);
    }

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
            ville VARCHAR(100)
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
            role ENUM('manager','vendeur','magasinier') NOT NULL,
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
            unite VARCHAR(40) NOT NULL DEFAULT 'piece',
            prix_ht DECIMAL(10,2) NOT NULL,
            prix_achat DECIMAL(10,2) NOT NULL DEFAULT 0,
            taux_tva DECIMAL(5,2) NULL DEFAULT NULL,
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
            mode_paiement ENUM('especes', 'carte', 'virement', 'mobile_money', 'stripe') NOT NULL,
            reference_externe VARCHAR(100),
            telephone_payeur VARCHAR(20),
            date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS paiement_stripe_sessions (
            id_session VARCHAR(50) PRIMARY KEY,
            vente_id VARCHAR(50) NOT NULL,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            montant DECIMAL(10,2) NOT NULL,
            devise VARCHAR(10) NOT NULL DEFAULT 'usd',
            statut ENUM('en_attente','confirmee','echec','annulee') NOT NULL DEFAULT 'en_attente',
            stripe_session_id VARCHAR(120) NULL,
            stripe_payment_intent VARCHAR(120) NULL,
            checkout_url TEXT NULL,
            raw_response JSON NULL,
            raw_webhook JSON NULL,
            erreur VARCHAR(500) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            confirmed_at TIMESTAMP NULL,
            UNIQUE KEY uniq_stripe_session (stripe_session_id),
            INDEX idx_stripe_vente (vente_id, statut),
            FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE,
            FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS demandes_paiement_mobile (
            id_demande VARCHAR(50) PRIMARY KEY,
            vente_id VARCHAR(50) NOT NULL,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            operateur ENUM('mpesa','airtel_money','orange_money') NOT NULL,
            telephone_payeur VARCHAR(20) NOT NULL,
            montant DECIMAL(10,2) NOT NULL,
            reference_externe VARCHAR(100) NOT NULL,
            statut ENUM('en_attente','confirmee','rejetee') NOT NULL DEFAULT 'en_attente',
            date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_traitement TIMESTAMP NULL,
            UNIQUE KEY uniq_mobile_reference (entreprise_id, operateur, reference_externe),
            FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE,
            FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS commandes (
            id_commande VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            statut ENUM('en_attente','confirmee','preparee','livree','annulee','rejetee') NOT NULL DEFAULT 'en_attente',
            montant_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
            note_client VARCHAR(500),
            vente_id VARCHAR(50) NULL,
            date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES client(id_client),
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
            FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE SET NULL
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS lignes_commandes (
            id_ligne_commande VARCHAR(50) PRIMARY KEY,
            commande_id VARCHAR(50) NOT NULL,
            produit_id VARCHAR(50) NOT NULL,
            quantite INT NOT NULL,
            prix_unitaire_ht DECIMAL(10,2) NOT NULL,
            taux_tva DECIMAL(5,2) NULL DEFAULT NULL,
            FOREIGN KEY (commande_id) REFERENCES commandes(id_commande) ON DELETE CASCADE,
            FOREIGN KEY (produit_id) REFERENCES produits(id_produit)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS reclamations (
            id_reclamation VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            commande_id VARCHAR(50) NULL,
            vente_id VARCHAR(50) NULL,
            sujet VARCHAR(180) NOT NULL,
            message TEXT NOT NULL,
            entity_type VARCHAR(40) NULL,
            entity_id VARCHAR(80) NULL,
            reponse TEXT NULL,
            statut ENUM('ouverte','en_cours','resolue','cloturee') NOT NULL DEFAULT 'ouverte',
            date_reclamation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES client(id_client),
            FOREIGN KEY (commande_id) REFERENCES commandes(id_commande) ON DELETE SET NULL,
            FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE SET NULL,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_conversations (
            id_conversation VARCHAR(50) PRIMARY KEY,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            statut ENUM('ouverte','en_attente_manager','resolue') DEFAULT 'ouverte',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id_message VARCHAR(50) PRIMARY KEY,
            conversation_id VARCHAR(50) NOT NULL,
            sender_type ENUM('client','bot','manager') NOT NULL,
            sender_id VARCHAR(50),
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id_conversation) ON DELETE CASCADE
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
        CREATE TABLE IF NOT EXISTS public_contacts (
            id_contact INT AUTO_INCREMENT PRIMARY KEY,
            entreprise_id VARCHAR(50) NOT NULL,
            nom VARCHAR(160) NOT NULL,
            email VARCHAR(160) NOT NULL,
            sujet VARCHAR(180) NOT NULL,
            message TEXT NOT NULL,
            statut ENUM('nouveau','lu','traite') NOT NULL DEFAULT 'nouveau',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
            INDEX idx_public_contacts_entreprise (entreprise_id, statut, created_at)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS prospect_email_campaigns (
            id_campaign INT AUTO_INCREMENT PRIMARY KEY,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            campaign_key VARCHAR(80) NOT NULL,
            statut ENUM('en_cours','envoye','echec') NOT NULL DEFAULT 'en_cours',
            provider_message_id VARCHAR(255),
            erreur VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sent_at TIMESTAMP NULL,
            UNIQUE KEY uniq_prospect_campaign (client_id, campaign_key),
            FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS crm_email_campaigns (
            id_campaign INT AUTO_INCREMENT PRIMARY KEY,
            client_id VARCHAR(50) NOT NULL,
            entreprise_id VARCHAR(50) NOT NULL,
            campaign_key VARCHAR(120) NOT NULL,
            statut ENUM('en_cours','envoye','echec') NOT NULL DEFAULT 'en_cours',
            provider_message_id VARCHAR(255),
            erreur VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sent_at TIMESTAMP NULL,
            UNIQUE KEY uniq_crm_email_campaign (client_id, campaign_key),
            INDEX idx_crm_email_entreprise (entreprise_id, campaign_key, created_at),
            FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE,
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_codes (
            id_reset INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            email VARCHAR(150) NOT NULL,
            code_hash VARCHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_password_reset_email (email, created_at),
            INDEX idx_password_reset_user (user_id, used_at),
            FOREIGN KEY (user_id) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS client_registration_codes (
            id_registration INT AUTO_INCREMENT PRIMARY KEY,
            entreprise_id VARCHAR(50) NOT NULL,
            nom VARCHAR(100) NOT NULL,
            postnom VARCHAR(100),
            telephone VARCHAR(30),
            email VARCHAR(150) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            code_hash VARCHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_client_registration_email (email, used_at, created_at),
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS client_password_reset_codes (
            id_reset INT AUTO_INCREMENT PRIMARY KEY,
            client_id VARCHAR(50) NOT NULL,
            email VARCHAR(150) NOT NULL,
            code_hash VARCHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_client_reset_email (email, created_at),
            FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE
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

    await pool.query(`
        CREATE TABLE IF NOT EXISTS documents_archive (
            id_document VARCHAR(50) PRIMARY KEY,
            entreprise_id VARCHAR(50) NOT NULL,
            uploaded_by VARCHAR(50) NOT NULL,
            titre VARCHAR(180) NOT NULL,
            type_document VARCHAR(80) NOT NULL DEFAULT 'document',
            description VARCHAR(500),
            file_url TEXT NOT NULL,
            file_name VARCHAR(255),
            mime_type VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_archive_entreprise_date (entreprise_id, created_at),
            INDEX idx_archive_type (entreprise_id, type_document),
            FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
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
            await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        }
    };

    const dropColumnIfExists = async (table, column) => {
        const [rows] = await pool.query(
            `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?`,
            [table, column]
        );

        if (rows.length > 0) {
            await pool.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``);
        }
    };

    await pool.query(`DROP TABLE IF EXISTS demandes_abonnement`);
    await dropColumnIfExists('entreprise', 'statut_abonnement');
    await dropColumnIfExists('entreprise', 'date_expiration_abonnement');

    await addColumnIfMissing('notifications', 'recipient_type', "ENUM('user','enterprise_admin') NOT NULL DEFAULT 'user'");
    await addColumnIfMissing('notifications', 'recipient_user_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('notifications', 'entreprise_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('notifications', 'titre', "VARCHAR(160) NOT NULL DEFAULT 'Notification'");
    await addColumnIfMissing('notifications', 'message', 'TEXT NULL');
    await addColumnIfMissing('notifications', 'entity_type', 'VARCHAR(40) NULL');
    await addColumnIfMissing('notifications', 'entity_id', 'VARCHAR(80) NULL');
    await addColumnIfMissing('notifications', 'lu', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfMissing('notifications', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await addColumnIfMissing('mail_messages', 'entreprise_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('mail_messages', 'user_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('mail_messages', 'sender_email', 'VARCHAR(160) NULL');
    await addColumnIfMissing('mail_messages', 'to_email', "VARCHAR(160) NOT NULL DEFAULT ''");
    await addColumnIfMissing('mail_messages', 'subject', "VARCHAR(255) NOT NULL DEFAULT ''");
    await addColumnIfMissing('mail_messages', 'message', 'TEXT NULL');
    await addColumnIfMissing('mail_messages', 'status', "VARCHAR(40) NOT NULL DEFAULT 'envoye'");
    await addColumnIfMissing('mail_messages', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await pool.query(`ALTER TABLE paiement MODIFY mode_paiement ENUM('especes', 'carte', 'virement', 'mobile_money', 'stripe') NOT NULL`);

    await addColumnIfMissing('password_reset_codes', 'user_id', 'VARCHAR(50) NOT NULL');
    await addColumnIfMissing('password_reset_codes', 'email', "VARCHAR(150) NOT NULL DEFAULT ''");
    await addColumnIfMissing('password_reset_codes', 'code_hash', "VARCHAR(64) NOT NULL DEFAULT ''");
    await addColumnIfMissing('password_reset_codes', 'expires_at', 'DATETIME NOT NULL');
    await addColumnIfMissing('password_reset_codes', 'used_at', 'DATETIME NULL');
    await addColumnIfMissing('password_reset_codes', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await addColumnIfMissing('utilisateur', 'telephone', 'VARCHAR(30) NULL');
    try {
        const ancienRoleVente = ['cais', 'sier'].join('');
        await pool.query(`ALTER TABLE utilisateur MODIFY role ENUM('manager','${ancienRoleVente}','vendeur','magasinier') NOT NULL`);
        await pool.query(`UPDATE utilisateur SET role='vendeur' WHERE role=?`, [ancienRoleVente]);
        await pool.query(`ALTER TABLE utilisateur MODIFY role ENUM('manager','vendeur','magasinier') NOT NULL`);
        await pool.query(`UPDATE user_activity_logs SET user_role='vendeur' WHERE user_role=?`, [ancienRoleVente]);
    } catch (error) {
        console.warn('Migration role vendeur ignoree:', error.message);
    }
    await addColumnIfMissing('client', 'email', 'VARCHAR(150) NULL');
    await addColumnIfMissing('client', 'mot_de_passe', 'VARCHAR(255) NULL');
    await addColumnIfMissing('client', 'actif', 'BOOLEAN DEFAULT TRUE');
    await addColumnIfMissing('client', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfMissing('client', 'email_verified_at', 'DATETIME NULL');
    await pool.query(`UPDATE client SET email_verified_at=created_at WHERE email_verified_at IS NULL AND email IS NOT NULL AND mot_de_passe IS NOT NULL`);

    await addColumnIfMissing('user_activity_logs', 'entreprise_id', 'VARCHAR(50) NOT NULL');
    await addColumnIfMissing('user_activity_logs', 'user_id', 'VARCHAR(50) NOT NULL');
    await addColumnIfMissing('user_activity_logs', 'user_name', 'VARCHAR(160) NULL');
    await addColumnIfMissing('user_activity_logs', 'user_role', 'VARCHAR(50) NULL');
    await addColumnIfMissing('user_activity_logs', 'action_type', "VARCHAR(30) NOT NULL DEFAULT 'ACTION'");
    await addColumnIfMissing('user_activity_logs', 'module', 'VARCHAR(80) NULL');
    await addColumnIfMissing('user_activity_logs', 'entity_id', 'VARCHAR(80) NULL');
    await addColumnIfMissing('user_activity_logs', 'description', "VARCHAR(255) NOT NULL DEFAULT 'Action utilisateur'");
    await addColumnIfMissing('user_activity_logs', 'metadata', 'JSON NULL');
    await addColumnIfMissing('user_activity_logs', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await addColumnIfMissing('documents_archive', 'entreprise_id', 'VARCHAR(50) NOT NULL');
    await addColumnIfMissing('documents_archive', 'uploaded_by', 'VARCHAR(50) NOT NULL');
    await addColumnIfMissing('documents_archive', 'titre', "VARCHAR(180) NOT NULL DEFAULT 'Document archive'");
    await addColumnIfMissing('documents_archive', 'type_document', "VARCHAR(80) NOT NULL DEFAULT 'document'");
    await addColumnIfMissing('documents_archive', 'description', 'VARCHAR(500) NULL');
    await addColumnIfMissing('documents_archive', 'file_url', 'TEXT NULL');
    await addColumnIfMissing('documents_archive', 'file_name', 'VARCHAR(255) NULL');
    await addColumnIfMissing('documents_archive', 'mime_type', 'VARCHAR(100) NULL');
    await addColumnIfMissing('documents_archive', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

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
    await addColumnIfMissing('produits', 'unite', "VARCHAR(40) NOT NULL DEFAULT 'piece'");
    await addColumnIfMissing('produits', 'prix_achat', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
    await addColumnIfMissing('produits', 'taux_tva', 'DECIMAL(5,2) NULL DEFAULT NULL');
    await pool.query(`ALTER TABLE produits MODIFY taux_tva DECIMAL(5,2) NULL DEFAULT NULL`);
    await addColumnIfMissing('mouvements_stock', 'fournisseur_id', 'VARCHAR(50) NULL');
    await addColumnIfMissing('mouvements_stock', 'prix_achat_unitaire', 'DECIMAL(10,2) NULL');
    await addColumnIfMissing('mouvements_stock', 'prix_achat_total', 'DECIMAL(12,2) NULL');
    await addColumnIfMissing('mouvements_stock', 'note', 'VARCHAR(255) NULL');
    await addColumnIfMissing('lignes_ventes', 'prix_achat_unitaire', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
    await addColumnIfMissing('lignes_commandes', 'taux_tva', 'DECIMAL(5,2) NULL DEFAULT NULL');
    await pool.query(`ALTER TABLE lignes_commandes MODIFY taux_tva DECIMAL(5,2) NULL DEFAULT NULL`);
    await addColumnIfMissing('categorie_produit', 'reference_categorie', 'VARCHAR(50) NULL');
    await addColumnIfMissing('categorie_produit', 'photo_url', 'TEXT NULL');

    await pool.query(`
        UPDATE categorie_produit
        SET reference_categorie = LEFT(id_categorie, 50)
        WHERE reference_categorie IS NULL OR reference_categorie = ''
    `);
};
