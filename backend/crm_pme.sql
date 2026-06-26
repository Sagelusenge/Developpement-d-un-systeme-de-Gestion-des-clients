-- Schema propre CRM PME - Quincaillerie Centrale
-- La logique metier (stock, facturation, paiements et identifiants) est geree
-- par l'API Express. Ce fichier ne cree volontairement aucun trigger metier
-- et aucune donnee de demonstration.

CREATE DATABASE IF NOT EXISTS crm_pme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_pme;

SET NAMES utf8mb4;

CREATE TABLE sequences (
    nom_table VARCHAR(50) PRIMARY KEY,
    derniere_valeur INT NOT NULL DEFAULT 0
);

CREATE TABLE entreprise (
    id_entreprise VARCHAR(50) PRIMARY KEY,
    raison_sociale VARCHAR(200) NOT NULL,
    num_id_nationale VARCHAR(50) UNIQUE,
    email VARCHAR(150) UNIQUE,
    ville VARCHAR(100),
    statut_abonnement ENUM('actif', 'suspendu', 'expire') DEFAULT 'actif',
    date_expiration_abonnement DATE
);

CREATE TABLE utilisateur (
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

CREATE TABLE user_activity_logs (
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

CREATE TABLE client (
    id_client VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    postnom VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(150),
    mot_de_passe VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified_at DATETIME NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
    INDEX idx_client_entreprise (entreprise_id),
    INDEX idx_client_created_at (created_at)
);

CREATE TABLE categorie_produit (
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

CREATE TABLE fournisseurs (
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

CREATE TABLE produits (
    id_produit VARCHAR(50) PRIMARY KEY,
    reference_produit VARCHAR(50) NOT NULL,
    nom VARCHAR(200) NOT NULL,
    categorie_id VARCHAR(50) NULL,
    unite VARCHAR(40) NOT NULL DEFAULT 'piece',
    prix_ht DECIMAL(10,2) NOT NULL,
    prix_achat DECIMAL(10,2) NOT NULL DEFAULT 0,
    taux_tva DECIMAL(5,2) DEFAULT 16.00,
    quantite_stock INT DEFAULT 0,
    seuil_alerte INT DEFAULT 5,
    photo_url TEXT NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (categorie_id) REFERENCES categorie_produit(id_categorie) ON DELETE SET NULL,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
    UNIQUE KEY uniq_produit_reference_entreprise (entreprise_id, reference_produit),
    INDEX idx_produit_stock (entreprise_id, quantite_stock)
);

CREATE TABLE mouvements_stock (
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
);

CREATE TABLE ventes (
    id_ventes VARCHAR(50) PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    montant_ttc DECIMAL(10,2) DEFAULT 0,
    date_vente TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id_client),
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
);

CREATE TABLE lignes_ventes (
    id_lignes_ventes VARCHAR(50) PRIMARY KEY,
    vente_id VARCHAR(50) NOT NULL,
    produit_id VARCHAR(50) NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    prix_achat_unitaire DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id_produit)
);

CREATE TABLE paiement (
    id_paiement VARCHAR(50) PRIMARY KEY,
    vente_id VARCHAR(50) NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    mode_paiement ENUM('especes', 'carte', 'virement', 'mobile_money') NOT NULL,
    reference_externe VARCHAR(100),
    telephone_payeur VARCHAR(20),
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE CASCADE
);

CREATE TABLE demandes_paiement_mobile (
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

CREATE TABLE commandes (
    id_commande VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    statut ENUM('en_attente','confirmee','preparee','livree','annulee','rejetee') DEFAULT 'en_attente',
    montant_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
    note_client VARCHAR(500),
    vente_id VARCHAR(50),
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id_client),
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE,
    FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE SET NULL
);

CREATE TABLE lignes_commandes (
    id_ligne_commande VARCHAR(50) PRIMARY KEY,
    commande_id VARCHAR(50) NOT NULL,
    produit_id VARCHAR(50) NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (commande_id) REFERENCES commandes(id_commande) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id_produit)
);

CREATE TABLE reclamations (
    id_reclamation VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    commande_id VARCHAR(50),
    vente_id VARCHAR(50),
    sujet VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(40),
    entity_id VARCHAR(80),
    reponse TEXT,
    statut ENUM('ouverte','en_cours','resolue','cloturee') DEFAULT 'ouverte',
    date_reclamation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id_client),
    FOREIGN KEY (commande_id) REFERENCES commandes(id_commande) ON DELETE SET NULL,
    FOREIGN KEY (vente_id) REFERENCES ventes(id_ventes) ON DELETE SET NULL,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
);

CREATE TABLE client_registration_codes (
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

CREATE TABLE chat_conversations (
    id_conversation VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    entreprise_id VARCHAR(50) NOT NULL,
    statut ENUM('ouverte','en_attente_manager','resolue') DEFAULT 'ouverte',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id_client) ON DELETE CASCADE,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
);

CREATE TABLE client_password_reset_codes (
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

CREATE TABLE password_reset_codes (
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

CREATE TABLE chat_messages (
    id_message VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) NOT NULL,
    sender_type ENUM('client','bot','manager') NOT NULL,
    sender_id VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id_conversation) ON DELETE CASCADE
);

CREATE TABLE demandes_abonnement (
    id_demande INT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id VARCHAR(50) NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    monnaie VARCHAR(10) DEFAULT 'USD',
    statut ENUM('en_attente', 'succes', 'echec') DEFAULT 'en_attente',
    transaction_id_externe VARCHAR(100),
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise(id_entreprise) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    recipient_type ENUM('user','enterprise_admin') NOT NULL DEFAULT 'user',
    recipient_user_id VARCHAR(50),
    entreprise_id VARCHAR(50),
    titre VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(40),
    entity_id VARCHAR(80),
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user (recipient_user_id, lu),
    INDEX idx_notifications_entreprise (entreprise_id, recipient_type, lu)
);

CREATE TABLE mail_messages (
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
);

CREATE TABLE public_contacts (
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

CREATE TABLE prospect_email_campaigns (
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

CREATE TABLE crm_email_campaigns (
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

CREATE TABLE documents_archive (
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

/*
ARCHIVE DES ANCIENS TRIGGERS, PROCEDURES ET COMPTES DE DEMONSTRATION
-------------------------------------------------------------------
Bloc desactive. L'API Express gere deja les identifiants, le stock,
les mouvements, les factures et les paiements. Reactiver ce bloc
provoquerait notamment une double diminution du stock.

INSERT INTO sequences (nom_table, derniere_valeur) VALUES
('entreprise', 0),
('utilisateur', 0),
('client', 0),
('ventes', 0),
('lignes_ventes', 0),
('paiement', 0),
('mouvements_stock', 0);

DELIMITER $$

CREATE TRIGGER tg_id_entreprise BEFORE INSERT ON entreprise FOR EACH ROW
BEGIN
    DECLARE v_nb INT;
    DECLARE v_pref VARCHAR(10);
    IF NEW.id_entreprise IS NULL OR NEW.id_entreprise = '' THEN
        UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'entreprise';
        SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'entreprise';
        SET v_pref = UPPER(LEFT(REPLACE(NEW.raison_sociale, ' ', ''), 3));
        SET NEW.id_entreprise = CONCAT('ENT-', v_pref, '-', LPAD(v_nb, 4, '0'));
    END IF;
END$$

CREATE TRIGGER tg_id_utilisateur BEFORE INSERT ON utilisateur FOR EACH ROW
BEGIN
    DECLARE v_nb INT;
    IF NEW.id_utilisateur IS NULL OR NEW.id_utilisateur = '' THEN
        UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'utilisateur';
        SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'utilisateur';
        SET NEW.id_utilisateur = CONCAT('USR-', LPAD(v_nb, 5, '0'));
    END IF;
END$$

CREATE TRIGGER tg_id_client BEFORE INSERT ON client FOR EACH ROW
BEGIN
    DECLARE v_nb INT;
    IF NEW.id_client IS NULL OR NEW.id_client = '' THEN
        UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'client';
        SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'client';
        SET NEW.id_client = CONCAT('CLI-', LPAD(v_nb, 5, '0'));
    END IF;
END$$

CREATE TRIGGER tg_id_produits BEFORE INSERT ON produits FOR EACH ROW
BEGIN
    IF NEW.id_produit IS NULL OR NEW.id_produit = '' THEN
        SET NEW.id_produit = UPPER(CONCAT('PRD-', REPLACE(NEW.reference_produit, ' ', ''), '-', LEFT(NEW.entreprise_id, 8)));
    END IF;
END$$

CREATE TRIGGER tg_id_ventes BEFORE INSERT ON ventes FOR EACH ROW
BEGIN
    DECLARE v_nb INT;
    IF NEW.id_ventes IS NULL OR NEW.id_ventes = '' THEN
        UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'ventes';
        SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'ventes';
        SET NEW.id_ventes = CONCAT('FAC-', YEAR(CURDATE()), '-', LPAD(v_nb, 5, '0'));
        SET NEW.numero_facture = NEW.id_ventes;
    END IF;
END$$

CREATE TRIGGER tg_id_lignes_ventes BEFORE INSERT ON lignes_ventes FOR EACH ROW
BEGIN
    DECLARE v_nb INT;
    IF NEW.id_lignes_ventes IS NULL OR NEW.id_lignes_ventes = '' THEN
        UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'lignes_ventes';
        SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'lignes_ventes';
        SET NEW.id_lignes_ventes = CONCAT('LVT-', LPAD(v_nb, 6, '0'));
    END IF;
END$$

CREATE TRIGGER tg_id_paiement BEFORE INSERT ON paiement FOR EACH ROW
BEGIN
    DECLARE v_nb INT;
    IF NEW.id_paiement IS NULL OR NEW.id_paiement = '' THEN
        UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'paiement';
        SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'paiement';
        SET NEW.id_paiement = CONCAT('PAY-', DATE_FORMAT(NOW(), '%y%m'), '-', LPAD(v_nb, 5, '0'));
    END IF;
END$$

CREATE TRIGGER tg_verif_stock_avant_vente BEFORE INSERT ON lignes_ventes FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    SELECT quantite_stock INTO v_stock FROM produits WHERE id_produit = NEW.produit_id;
    IF v_stock < NEW.quantite THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erreur : Stock insuffisant.';
    END IF;
END$$

CREATE TRIGGER tg_stock_apres_vente AFTER INSERT ON lignes_ventes FOR EACH ROW
BEGIN
    DECLARE v_nb INT;
    UPDATE produits SET quantite_stock = quantite_stock - NEW.quantite WHERE id_produit = NEW.produit_id;
    UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'mouvements_stock';
    SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'mouvements_stock';
    INSERT INTO mouvements_stock (id_mouvement, produit_id, type_mouvement, quantite)
    VALUES (CONCAT('MVT-', LPAD(v_nb, 6, '0')), NEW.produit_id, 'sortie', NEW.quantite);
END$$

CREATE TRIGGER tg_calcul_montant_vente_insert AFTER INSERT ON lignes_ventes FOR EACH ROW
BEGIN
    UPDATE ventes
    SET montant_ttc = (SELECT SUM(quantite * prix_unitaire_ht) * 1.16 FROM lignes_ventes WHERE vente_id = NEW.vente_id)
    WHERE id_ventes = NEW.vente_id;
END$$

CREATE TRIGGER tg_activation_auto_abonnement AFTER UPDATE ON demandes_abonnement FOR EACH ROW
BEGIN
    IF NEW.statut = 'succes' AND OLD.statut = 'en_attente' THEN
        UPDATE entreprise
        SET statut_abonnement = 'actif',
            date_expiration_abonnement = DATE_ADD(IFNULL(date_expiration_abonnement, CURDATE()), INTERVAL 1 MONTH)
        WHERE id_entreprise = NEW.entreprise_id;
    END IF;
END$$

CREATE TRIGGER tg_verif_abonnement_avant_vente BEFORE INSERT ON ventes FOR EACH ROW
BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_expiration DATE;
    SELECT statut_abonnement, date_expiration_abonnement INTO v_statut, v_expiration
    FROM entreprise WHERE id_entreprise = NEW.entreprise_id;
    IF v_statut != 'actif' OR v_expiration < CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Service suspendu.';
    END IF;
END$$

CREATE PROCEDURE sp_EnregistrerPaiement(
    IN p_vente_id VARCHAR(50),
    IN p_montant DECIMAL(10,2),
    IN p_mode ENUM('especes', 'carte', 'virement', 'mobile_money'),
    IN p_ref_externe VARCHAR(100),
    IN p_telephone VARCHAR(20)
)
BEGIN
    INSERT INTO paiement (vente_id, montant, mode_paiement, reference_externe, telephone_payeur)
    VALUES (p_vente_id, p_montant, p_mode, p_ref_externe, p_telephone);
END$$

CREATE PROCEDURE sp_ApprovisionnerProduit(
    IN p_produit_id VARCHAR(50),
    IN p_quantite INT
)
BEGIN
    DECLARE v_nb INT;
    START TRANSACTION;
        UPDATE produits SET quantite_stock = quantite_stock + p_quantite WHERE id_produit = p_produit_id;
        UPDATE sequences SET derniere_valeur = derniere_valeur + 1 WHERE nom_table = 'mouvements_stock';
        SELECT derniere_valeur INTO v_nb FROM sequences WHERE nom_table = 'mouvements_stock';
        INSERT INTO mouvements_stock (id_mouvement, produit_id, type_mouvement, quantite)
        VALUES (CONCAT('MVT-', LPAD(v_nb, 6, '0')), p_produit_id, 'entree', p_quantite);
    COMMIT;
END$$

DELIMITER ;

INSERT INTO entreprise (
    id_entreprise,
    raison_sociale,
    num_id_nationale,
    email,
    ville,
    statut_abonnement,
    date_expiration_abonnement
)
VALUES (
    '',
    'Quincaillerie Centrale',
    'CD-LSH-QC-2026-001',
    'contact@quincaillerie-centrale.cd',
    'Lubumbashi',
    'actif',
    DATE_ADD(CURDATE(), INTERVAL 12 MONTH)
);

INSERT INTO utilisateur (id_utilisateur, entreprise_id, nom, email, mot_de_passe, role, actif)
VALUES (
    '',
    (SELECT id_entreprise FROM entreprise WHERE num_id_nationale = 'CD-LSH-QC-2026-001'),
    'KITSA LUSENGE Sage',
    'sage.kitsa@quincaillerie-centrale.cd',
    'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
    'manager',
    TRUE
);
FIN DE L'ARCHIVE */

CREATE OR REPLACE VIEW v_factures_complet AS
SELECT
    v.numero_facture AS "Facture_No",
    v.date_vente AS "Date",
    e.raison_sociale AS "Emetteur",
    c.nom AS "Client_Nom",
    c.postnom AS "Client_Postnom",
    p.nom AS "Designation",
    lv.quantite AS "Qte",
    lv.prix_unitaire_ht AS "PU_HT",
    (lv.quantite * lv.prix_unitaire_ht) AS "Total_Ligne_HT",
    p.taux_tva AS "Taux_TVA",
    v.montant_ttc AS "Total_Facture_TTC"
FROM ventes v
JOIN entreprise e ON v.entreprise_id = e.id_entreprise
JOIN client c ON v.client_id = c.id_client
JOIN lignes_ventes lv ON v.id_ventes = lv.vente_id
JOIN produits p ON lv.produit_id = p.id_produit;

CREATE OR REPLACE VIEW v_etat_creances AS
SELECT
    v.numero_facture,
    c.nom AS "Client",
    v.montant_ttc AS "Du",
    IFNULL(SUM(pa.montant), 0) AS "Paye",
    (v.montant_ttc - IFNULL(SUM(pa.montant), 0)) AS "Reste_a_Payer",
    CASE
        WHEN (v.montant_ttc - IFNULL(SUM(pa.montant), 0)) <= 0 THEN 'Solde'
        WHEN IFNULL(SUM(pa.montant), 0) > 0 THEN 'Partiel'
        ELSE 'Impaye'
    END AS "Statut_Paiement"
FROM ventes v
JOIN client c ON v.client_id = c.id_client
LEFT JOIN paiement pa ON v.id_ventes = pa.vente_id
GROUP BY v.id_ventes;

CREATE OR REPLACE VIEW v_statistiques_paiements AS
SELECT
    e.raison_sociale AS "Entreprise",
    p.mode_paiement AS "Mode",
    SUM(p.montant) AS "Total_Percu",
    COUNT(p.id_paiement) AS "Nombre_Transactions"
FROM paiement p
JOIN ventes v ON p.vente_id = v.id_ventes
JOIN entreprise e ON v.entreprise_id = e.id_entreprise
GROUP BY e.id_entreprise, p.mode_paiement;

CREATE OR REPLACE VIEW v_rapport_caisse_journalier AS
SELECT
    DATE(p.date_paiement) AS "Date",
    v.entreprise_id,
    p.mode_paiement AS "Mode_Paiement",
    COUNT(p.id_paiement) AS "Nombre_Transactions",
    SUM(p.montant) AS "Total_Encaisse"
FROM paiement p
JOIN ventes v ON p.vente_id = v.id_ventes
WHERE DATE(p.date_paiement) = CURDATE()
GROUP BY v.entreprise_id, p.mode_paiement, DATE(p.date_paiement);

CREATE OR REPLACE VIEW v_client_360_top_acheteurs AS
SELECT
    c.id_client,
    c.nom AS "Nom",
    c.postnom AS "Postnom",
    c.entreprise_id,
    COUNT(v.id_ventes) AS "Nombre_Achats",
    IFNULL(SUM(v.montant_ttc), 0) AS "CA_Total_Genere",
    MAX(v.date_vente) AS "Derniere_Visite",
    CASE
        WHEN COUNT(v.id_ventes) >= 10 OR IFNULL(SUM(v.montant_ttc),0) >= 5000 THEN 'vip'
        WHEN COUNT(v.id_ventes) >= 5 OR IFNULL(SUM(v.montant_ttc),0) >= 1000 THEN 'fidele'
        WHEN COUNT(v.id_ventes) >= 2 THEN 'regulier'
        WHEN COUNT(v.id_ventes) = 1 THEN 'nouveau'
        ELSE 'prospect'
    END AS "Segment_Statut"
FROM client c
LEFT JOIN ventes v ON c.id_client = v.client_id
GROUP BY c.id_client
ORDER BY CA_Total_Genere DESC;

CREATE OR REPLACE VIEW v_historique_achats_par_client AS
SELECT
    c.id_client,
    c.nom AS "Client",
    v.date_vente AS "Date",
    v.numero_facture AS "Facture",
    p.nom AS "Produit",
    lv.quantite AS "Qte",
    lv.prix_unitaire_ht AS "Prix_Unitaire",
    (lv.quantite * lv.prix_unitaire_ht * (1 + p.taux_tva / 100)) AS "Total_TTC"
FROM client c
JOIN ventes v ON c.id_client = v.client_id
JOIN lignes_ventes lv ON v.id_ventes = lv.vente_id
JOIN produits p ON lv.produit_id = p.id_produit;

CREATE OR REPLACE VIEW v_fiche_stock_inventaire AS
SELECT
    p.id_produit,
    p.reference_produit AS "Ref",
    p.nom AS "Designation",
    p.quantite_stock AS "Stock_Actuel",
    p.seuil_alerte AS "Alerte",
    (p.quantite_stock * p.prix_ht) AS "Valeur_Stock_HT",
    CASE
        WHEN p.quantite_stock <= 0 THEN 'RUPTURE'
        WHEN p.quantite_stock <= p.seuil_alerte THEN 'REAPPROVISIONNER'
        ELSE 'OK'
    END AS "Statut"
FROM produits p;
