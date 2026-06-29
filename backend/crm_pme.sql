-- Schema complet CRM PME - Quincaillerie Centrale
-- Version alignee avec la logique actuelle de l'API Express.
-- Important:
-- - les identifiants, le stock, les commandes, les factures et les emails sont geres par l'API;
-- - les anciens modules d'abonnement sont retires;
-- - les anciens triggers de stock/ID sont supprimes pour eviter les doubles traitements.

CREATE DATABASE IF NOT EXISTS crm_pme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_pme;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TRIGGER IF EXISTS tg_id_entreprise;
DROP TRIGGER IF EXISTS tg_id_utilisateur;
DROP TRIGGER IF EXISTS tg_id_client;
DROP TRIGGER IF EXISTS tg_id_produits;
DROP TRIGGER IF EXISTS tg_id_ventes;
DROP TRIGGER IF EXISTS tg_id_lignes_ventes;
DROP TRIGGER IF EXISTS tg_id_paiement;
DROP TRIGGER IF EXISTS tg_verif_stock_avant_vente;
DROP TRIGGER IF EXISTS tg_stock_apres_vente;
DROP TRIGGER IF EXISTS tg_calcul_montant_vente_insert;
DROP TRIGGER IF EXISTS tg_activation_auto_abonnement;
DROP TRIGGER IF EXISTS tg_verif_abonnement_avant_vente;

DROP PROCEDURE IF EXISTS sp_EnregistrerPaiement;
DROP PROCEDURE IF EXISTS sp_ApprovisionnerProduit;
DROP PROCEDURE IF EXISTS sp_RecalculerMontantVente;

DROP VIEW IF EXISTS v_factures_complet;
DROP VIEW IF EXISTS v_etat_creances;
DROP VIEW IF EXISTS v_statistiques_paiements;
DROP VIEW IF EXISTS v_rapport_caisse_journalier;
DROP VIEW IF EXISTS v_client_360_top_acheteurs;
DROP VIEW IF EXISTS v_historique_achats_par_client;
DROP VIEW IF EXISTS v_fiche_stock_inventaire;
DROP VIEW IF EXISTS v_commandes_clients;
DROP VIEW IF EXISTS v_reclamations_clients;
DROP VIEW IF EXISTS v_mouvements_stock_detail;
DROP VIEW IF EXISTS v_journal_audit;

DROP TABLE IF EXISTS demandes_abonnement;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS sequences (
    nom_table VARCHAR(50) PRIMARY KEY,
    derniere_valeur INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entreprise (
    id_entreprise VARCHAR(50) PRIMARY KEY,
    raison_sociale VARCHAR(200) NOT NULL,
    logo_url TEXT NULL,
    slogan VARCHAR(200),
    description_site TEXT,
    telephone VARCHAR(30),
    adresse VARCHAR(255),
    horaires VARCHAR(200),
    annonce_site VARCHAR(255),
    hero_titre VARCHAR(200),
    hero_description VARCHAR(500),
    couleur_principale VARCHAR(7) DEFAULT '#0b5ea8',
    num_id_nationale VARCHAR(50) UNIQUE,
    email VARCHAR(150),
    ville VARCHAR(100)
);

SET @drop_statut_abonnement = (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE entreprise DROP COLUMN statut_abonnement',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'entreprise'
      AND COLUMN_NAME = 'statut_abonnement'
);
PREPARE stmt FROM @drop_statut_abonnement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_date_expiration_abonnement = (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE entreprise DROP COLUMN date_expiration_abonnement',
        'SELECT 1'
    )
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'entreprise'
      AND COLUMN_NAME = 'date_expiration_abonnement'
);
PREPARE stmt FROM @drop_date_expiration_abonnement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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
);

CREATE TABLE IF NOT EXISTS client (
    id_client VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    postnom VARCHAR(100),
    telephone VARCHAR(30),
    email VARCHAR(150),
    mot_de_passe VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified_at DATETIME NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
    INDEX idx_client_entreprise (entreprise_id),
    INDEX idx_client_email (email),
    INDEX idx_client_created_at (created_at)
);

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
);

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
);

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
    FOREIGN KEY (categorie_id) REFERENCES categorie_produit(id_categorie) ON DELETE SET NULL,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
    UNIQUE KEY uniq_produit_reference_entreprise (entreprise_id, reference_produit),
    INDEX idx_produit_stock (entreprise_id, quantite_stock),
    INDEX idx_produit_categorie (categorie_id)
);

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
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id_fournisseur) ON DELETE SET NULL,
    INDEX idx_mouvements_produit_date (produit_id, date_mouvement)
);

CREATE TABLE IF NOT EXISTS ventes (
    id_ventes VARCHAR(50) PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    montant_ttc DECIMAL(10,2) DEFAULT 0,
    date_vente TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id_client),
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
    INDEX idx_ventes_entreprise_date (entreprise_id, date_vente)
);

CREATE TABLE IF NOT EXISTS lignes_ventes (
    id_lignes_ventes VARCHAR(50) PRIMARY KEY,
    vente_id VARCHAR(50) NOT NULL,
    produit_id VARCHAR(50) NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    prix_achat_unitaire DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id_produit),
    INDEX idx_lignes_ventes_vente (vente_id),
    INDEX idx_lignes_ventes_produit (produit_id)
);

CREATE TABLE IF NOT EXISTS paiement (
    id_paiement VARCHAR(50) PRIMARY KEY,
    vente_id VARCHAR(50) NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    mode_paiement ENUM('especes', 'carte', 'virement', 'mobile_money') NOT NULL,
    reference_externe VARCHAR(100),
    telephone_payeur VARCHAR(20),
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE,
    INDEX idx_paiement_vente (vente_id),
    INDEX idx_paiement_date (date_paiement)
);

-- Stripe est le prestataire de paiement, mais le mode comptable reste "carte".
-- Cette instruction normalise aussi les installations qui utilisaient l'ancienne valeur "stripe".
UPDATE paiement SET mode_paiement = 'carte' WHERE mode_paiement = 'stripe';
ALTER TABLE paiement
    MODIFY mode_paiement ENUM('especes', 'carte', 'virement', 'mobile_money') NOT NULL;

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
);

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
);

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
    FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE SET NULL,
    INDEX idx_commandes_entreprise_date (entreprise_id, date_commande),
    INDEX idx_commandes_client (client_id)
);

CREATE TABLE IF NOT EXISTS lignes_commandes (
    id_ligne_commande VARCHAR(50) PRIMARY KEY,
    commande_id VARCHAR(50) NOT NULL,
    produit_id VARCHAR(50) NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    taux_tva DECIMAL(5,2) NULL DEFAULT NULL,
    FOREIGN KEY (commande_id) REFERENCES commandes(id_commande) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id_produit)
);

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
);

CREATE TABLE IF NOT EXISTS chat_conversations (
    id_conversation VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    statut ENUM('ouverte','en_attente_manager','resolue') DEFAULT 'ouverte',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id_message VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) NOT NULL,
    sender_type ENUM('client','bot','manager') NOT NULL,
    sender_id VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id_conversation) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    recipient_type ENUM('user','enterprise_admin') NOT NULL DEFAULT 'user',
    recipient_user_id VARCHAR(50),
    entreprise_id VARCHAR(50),
    titre VARCHAR(160) NOT NULL DEFAULT 'Notification',
    message TEXT,
    entity_type VARCHAR(40),
    entity_id VARCHAR(80),
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user (recipient_user_id, lu),
    INDEX idx_notifications_entreprise (entreprise_id, recipient_type, lu)
);

CREATE TABLE IF NOT EXISTS mail_messages (
    id_mail INT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id VARCHAR(50),
    user_id VARCHAR(50),
    sender_email VARCHAR(160),
    to_email VARCHAR(160) NOT NULL DEFAULT '',
    subject VARCHAR(255) NOT NULL DEFAULT '',
    message TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'envoye',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mail_entreprise (entreprise_id, created_at),
    INDEX idx_mail_user (user_id, created_at)
);

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
);

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
);

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
);

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
);

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
);

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
);

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
);

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
);

INSERT INTO sequences (nom_table, derniere_valeur) VALUES
('entreprise', 0),
('utilisateur', 0),
('client', 0),
('categorie_produit', 0),
('fournisseurs', 0),
('produits', 0),
('mouvements_stock', 0),
('ventes', 0),
('lignes_ventes', 0),
('paiement', 0),
('commandes', 0),
('lignes_commandes', 0),
('reclamations', 0),
('chat_conversations', 0),
('chat_messages', 0),
('documents_archive', 0)
ON DUPLICATE KEY UPDATE derniere_valeur = derniere_valeur;

DELIMITER $$

CREATE PROCEDURE sp_RecalculerMontantVente(IN p_vente_id VARCHAR(50))
BEGIN
    UPDATE ventes v
    SET v.montant_ttc = (
        SELECT IFNULL(SUM(lv.quantite * lv.prix_unitaire_ht * (1 + IFNULL(p.taux_tva, 0) / 100)), 0)
        FROM lignes_ventes lv
        JOIN produits p ON p.id_produit = lv.produit_id
        WHERE lv.vente_id = p_vente_id
    )
    WHERE v.id_ventes = p_vente_id;
END$$

CREATE PROCEDURE sp_EnregistrerPaiement(
    IN p_id_paiement VARCHAR(50),
    IN p_vente_id VARCHAR(50),
    IN p_montant DECIMAL(10,2),
    IN p_mode ENUM('especes', 'carte', 'virement', 'mobile_money'),
    IN p_ref_externe VARCHAR(100),
    IN p_telephone VARCHAR(20)
)
BEGIN
    INSERT INTO paiement (id_paiement, vente_id, montant, mode_paiement, reference_externe, telephone_payeur)
    VALUES (p_id_paiement, p_vente_id, p_montant, p_mode, p_ref_externe, p_telephone);
END$$

CREATE PROCEDURE sp_ApprovisionnerProduit(
    IN p_id_mouvement VARCHAR(50),
    IN p_produit_id VARCHAR(50),
    IN p_fournisseur_id VARCHAR(50),
    IN p_quantite INT,
    IN p_prix_achat_unitaire DECIMAL(10,2),
    IN p_note VARCHAR(255)
)
BEGIN
    START TRANSACTION;
        UPDATE produits
        SET quantite_stock = quantite_stock + p_quantite,
            prix_achat = p_prix_achat_unitaire
        WHERE id_produit = p_produit_id;

        INSERT INTO mouvements_stock (
            id_mouvement, produit_id, fournisseur_id, type_mouvement,
            quantite, prix_achat_unitaire, prix_achat_total, note
        )
        VALUES (
            p_id_mouvement, p_produit_id, p_fournisseur_id, 'entree',
            p_quantite, p_prix_achat_unitaire, p_quantite * p_prix_achat_unitaire, p_note
        );
    COMMIT;
END$$

DELIMITER ;

-- Aucun trigger actif n'est cree volontairement.
-- La logique metier est centralisee dans l'API afin d'eviter:
-- - double decrement du stock;
-- - double generation d'identifiants;
-- - recalcul facture different de la logique Express.

CREATE OR REPLACE VIEW v_factures_complet AS
SELECT
    v.id_ventes,
    v.numero_facture,
    v.date_vente,
    v.entreprise_id,
    e.raison_sociale AS entreprise,
    c.id_client,
    c.nom AS client_nom,
    c.postnom AS client_postnom,
    p.id_produit,
    p.nom AS produit,
    lv.quantite,
    lv.prix_unitaire_ht,
    p.taux_tva,
    (lv.quantite * lv.prix_unitaire_ht * (1 + IFNULL(p.taux_tva, 0) / 100)) AS total_ligne_ttc,
    v.montant_ttc AS total_facture_ttc
FROM ventes v
JOIN entreprise e ON e.id_entreprise = v.entreprise_id
JOIN client c ON c.id_client = v.client_id
JOIN lignes_ventes lv ON lv.vente_id = v.id_ventes
JOIN produits p ON p.id_produit = lv.produit_id;

CREATE OR REPLACE VIEW v_etat_creances AS
SELECT
    v.id_ventes,
    v.numero_facture,
    v.entreprise_id,
    c.id_client,
    CONCAT(c.nom, ' ', IFNULL(c.postnom, '')) AS client,
    v.montant_ttc AS montant_du,
    IFNULL(SUM(pa.montant), 0) AS montant_paye,
    (v.montant_ttc - IFNULL(SUM(pa.montant), 0)) AS reste_a_payer,
    CASE
        WHEN (v.montant_ttc - IFNULL(SUM(pa.montant), 0)) <= 0 THEN 'paye'
        WHEN IFNULL(SUM(pa.montant), 0) > 0 THEN 'partiel'
        ELSE 'impaye'
    END AS statut_paiement
FROM ventes v
JOIN client c ON c.id_client = v.client_id
LEFT JOIN paiement pa ON pa.vente_id = v.id_ventes
GROUP BY v.id_ventes, v.numero_facture, v.entreprise_id, c.id_client, c.nom, c.postnom, v.montant_ttc;

CREATE OR REPLACE VIEW v_statistiques_paiements AS
SELECT
    v.entreprise_id,
    p.mode_paiement,
    SUM(p.montant) AS total_percu,
    COUNT(p.id_paiement) AS nombre_transactions
FROM paiement p
JOIN ventes v ON v.id_ventes = p.vente_id
GROUP BY v.entreprise_id, p.mode_paiement;

CREATE OR REPLACE VIEW v_rapport_caisse_journalier AS
SELECT
    DATE(p.date_paiement) AS date_paiement,
    v.entreprise_id,
    p.mode_paiement,
    COUNT(p.id_paiement) AS nombre_transactions,
    SUM(p.montant) AS total_encaisse
FROM paiement p
JOIN ventes v ON v.id_ventes = p.vente_id
WHERE DATE(p.date_paiement) = CURDATE()
GROUP BY DATE(p.date_paiement), v.entreprise_id, p.mode_paiement;

CREATE OR REPLACE VIEW v_client_360_top_acheteurs AS
SELECT
    c.id_client,
    c.entreprise_id,
    c.nom,
    c.postnom,
    c.telephone,
    c.email,
    COUNT(v.id_ventes) AS nombre_achats,
    IFNULL(SUM(v.montant_ttc), 0) AS ca_total,
    MAX(v.date_vente) AS derniere_visite,
    CASE
        WHEN COUNT(v.id_ventes) >= 10 OR IFNULL(SUM(v.montant_ttc),0) >= 5000 THEN 'vip'
        WHEN COUNT(v.id_ventes) >= 5 OR IFNULL(SUM(v.montant_ttc),0) >= 1000 THEN 'fidele'
        WHEN COUNT(v.id_ventes) >= 2 THEN 'regulier'
        WHEN COUNT(v.id_ventes) = 1 THEN 'nouveau'
        ELSE 'prospect'
    END AS segment_statut
FROM client c
LEFT JOIN ventes v ON v.client_id = c.id_client
GROUP BY c.id_client, c.entreprise_id, c.nom, c.postnom, c.telephone, c.email;

CREATE OR REPLACE VIEW v_historique_achats_par_client AS
SELECT
    c.id_client,
    c.entreprise_id,
    CONCAT(c.nom, ' ', IFNULL(c.postnom, '')) AS client,
    v.date_vente,
    v.numero_facture,
    p.nom AS produit,
    lv.quantite,
    lv.prix_unitaire_ht,
    p.taux_tva,
    (lv.quantite * lv.prix_unitaire_ht * (1 + IFNULL(p.taux_tva, 0) / 100)) AS total_ttc
FROM client c
JOIN ventes v ON v.client_id = c.id_client
JOIN lignes_ventes lv ON lv.vente_id = v.id_ventes
JOIN produits p ON p.id_produit = lv.produit_id;

CREATE OR REPLACE VIEW v_fiche_stock_inventaire AS
SELECT
    p.id_produit,
    p.entreprise_id,
    p.reference_produit,
    p.nom,
    c.nom AS categorie,
    p.unite,
    p.quantite_stock,
    p.seuil_alerte,
    p.prix_achat,
    p.prix_ht,
    (p.quantite_stock * p.prix_achat) AS valeur_stock_achat,
    CASE
        WHEN p.quantite_stock <= 0 THEN 'rupture'
        WHEN p.quantite_stock <= p.seuil_alerte THEN 'alerte'
        ELSE 'ok'
    END AS statut_stock
FROM produits p
LEFT JOIN categorie_produit c ON c.id_categorie = p.categorie_id;

CREATE OR REPLACE VIEW v_commandes_clients AS
SELECT
    co.id_commande,
    co.entreprise_id,
    co.client_id,
    CONCAT(c.nom, ' ', IFNULL(c.postnom, '')) AS client,
    co.statut,
    co.montant_ttc,
    co.note_client,
    co.vente_id,
    v.numero_facture,
    co.date_commande,
    co.updated_at
FROM commandes co
JOIN client c ON c.id_client = co.client_id
LEFT JOIN ventes v ON v.id_ventes = co.vente_id;

CREATE OR REPLACE VIEW v_reclamations_clients AS
SELECT
    r.id_reclamation,
    r.entreprise_id,
    r.client_id,
    CONCAT(c.nom, ' ', IFNULL(c.postnom, '')) AS client,
    r.commande_id,
    r.vente_id,
    r.sujet,
    r.message,
    r.reponse,
    r.statut,
    r.date_reclamation,
    r.updated_at
FROM reclamations r
JOIN client c ON c.id_client = r.client_id;

CREATE OR REPLACE VIEW v_mouvements_stock_detail AS
SELECT
    m.id_mouvement,
    p.entreprise_id,
    m.date_mouvement,
    m.type_mouvement,
    m.quantite,
    m.prix_achat_unitaire,
    m.prix_achat_total,
    m.note,
    p.id_produit,
    p.reference_produit,
    p.nom AS produit,
    f.id_fournisseur,
    f.nom AS fournisseur
FROM mouvements_stock m
JOIN produits p ON p.id_produit = m.produit_id
LEFT JOIN fournisseurs f ON f.id_fournisseur = m.fournisseur_id;

CREATE OR REPLACE VIEW v_journal_audit AS
SELECT
    id_log,
    entreprise_id,
    user_id,
    user_name,
    user_role,
    action_type,
    module,
    entity_id,
    description,
    metadata,
    created_at
FROM user_activity_logs;
