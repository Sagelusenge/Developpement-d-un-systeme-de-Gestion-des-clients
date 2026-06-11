USE crm_pme;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_devis_complet;
DROP VIEW IF EXISTS v_superadmin_entreprises_stats;
DROP PROCEDURE IF EXISTS sp_ConvertirDevisEnFacture;
DROP PROCEDURE IF EXISTS sp_Admin_CreerEntrepriseComplete;
DROP PROCEDURE IF EXISTS sp_Admin_ModifierAbonnement;
DROP PROCEDURE IF EXISTS sp_GetDashboardStats;
DROP TRIGGER IF EXISTS tg_id_devis;
DROP TRIGGER IF EXISTS tg_id_lignes_devis;
DROP TRIGGER IF EXISTS tg_calcul_montant_devis_insert;
DROP TRIGGER IF EXISTS tg_calcul_montant_devis_update;
DROP TRIGGER IF EXISTS tg_calcul_montant_devis_delete;
DROP TRIGGER IF EXISTS tg_id_super_admin;

DROP TABLE IF EXISTS lignes_devis;
DROP TABLE IF EXISTS devis;

DELETE FROM paiement;
DELETE FROM lignes_ventes;
DELETE FROM mouvements_stock;
DELETE FROM fournisseurs;
DELETE FROM ventes;
DELETE FROM produits;
DELETE FROM client;
DELETE FROM demandes_abonnement;
DELETE FROM utilisateur;
DELETE FROM entreprise;

DROP TABLE IF EXISTS super_admin;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO sequences (nom_table, derniere_valeur) VALUES
('entreprise', 0),
('utilisateur', 0),
('client', 0),
('ventes', 0),
('lignes_ventes', 0),
('paiement', 0),
('mouvements_stock', 0)
ON DUPLICATE KEY UPDATE derniere_valeur = VALUES(derniere_valeur);

DELETE FROM sequences WHERE nom_table IN ('super_admin', 'devis', 'lignes_devis');

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
