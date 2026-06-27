USE crm_pme;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM user_activity_logs;
DELETE FROM documents_archive;
DELETE FROM crm_email_campaigns;
DELETE FROM prospect_email_campaigns;
DELETE FROM public_contacts;
DELETE FROM mail_messages;
DELETE FROM notifications;
DELETE FROM chat_messages;
DELETE FROM chat_conversations;
DELETE FROM client_password_reset_codes;
DELETE FROM client_registration_codes;
DELETE FROM password_reset_codes;
DELETE FROM reclamations;
DELETE FROM lignes_commandes;
DELETE FROM commandes;
DELETE FROM demandes_paiement_mobile;
DELETE FROM paiement;
DELETE FROM lignes_ventes;
DELETE FROM ventes;
DELETE FROM mouvements_stock;
DELETE FROM produits;
DELETE FROM fournisseurs;
DELETE FROM categorie_produit;
DELETE FROM client;
DELETE FROM utilisateur;
DELETE FROM entreprise;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO sequences (nom_table, derniere_valeur) VALUES
('entreprise', 1),
('utilisateur', 1),
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
ON DUPLICATE KEY UPDATE derniere_valeur = VALUES(derniere_valeur);

INSERT INTO entreprise (
    id_entreprise,
    raison_sociale,
    num_id_nationale,
    email,
    ville
)
VALUES (
    'ENT-0001',
    'Quincaillerie Centrale',
    'CD-LSH-QC-2026-001',
    'contact@quincaillerie-centrale.cd',
    'Goma'
);

-- Mot de passe historique SHA-256 conserve pour compatibilite login.
-- Il est recommande de reinitialiser ce compte depuis l'application.
INSERT INTO utilisateur (
    id_utilisateur,
    entreprise_id,
    nom,
    email,
    mot_de_passe,
    role,
    actif
)
VALUES (
    'USR-00001',
    'ENT-0001',
    'KITSA LUSENGE Sage',
    'sage.kitsa@quincaillerie-centrale.cd',
    'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
    'manager',
    TRUE
);
