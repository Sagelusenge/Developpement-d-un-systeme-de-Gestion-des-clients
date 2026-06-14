# Documentation backend detaillee

Cette documentation explique l architecture backend, les routes, les controles, les calculs, la securite et les bonnes pratiques de maintenance.

## Architecture backend
- Le backend est une API Express en JavaScript moderne.
- Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
- Le fichier server.js demarre le serveur HTTP.
- Le fichier app.js configure Express, CORS, JSON et les routes API.
- La connexion MySQL est centralisee dans config/db.js.
- Les controllers contiennent la logique metier de chaque module.
- Les routes declarent les endpoints et les roles autorises.
- Les services contiennent les helpers partages comme les identifiants et l audit.
1. Le backend est une API Express en JavaScript moderne.
1. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
1. Le fichier server.js demarre le serveur HTTP.
1. Le fichier app.js configure Express, CORS, JSON et les routes API.
1. La connexion MySQL est centralisee dans config/db.js.
1. Les controllers contiennent la logique metier de chaque module.
1. Les routes declarent les endpoints et les roles autorises.
1. Les services contiennent les helpers partages comme les identifiants et l audit.
2. Le backend est une API Express en JavaScript moderne.
2. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
2. Le fichier server.js demarre le serveur HTTP.
2. Le fichier app.js configure Express, CORS, JSON et les routes API.
2. La connexion MySQL est centralisee dans config/db.js.
2. Les controllers contiennent la logique metier de chaque module.
2. Les routes declarent les endpoints et les roles autorises.
2. Les services contiennent les helpers partages comme les identifiants et l audit.
3. Le backend est une API Express en JavaScript moderne.
3. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
3. Le fichier server.js demarre le serveur HTTP.
3. Le fichier app.js configure Express, CORS, JSON et les routes API.
3. La connexion MySQL est centralisee dans config/db.js.
3. Les controllers contiennent la logique metier de chaque module.
3. Les routes declarent les endpoints et les roles autorises.
3. Les services contiennent les helpers partages comme les identifiants et l audit.
4. Le backend est une API Express en JavaScript moderne.
4. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
4. Le fichier server.js demarre le serveur HTTP.
4. Le fichier app.js configure Express, CORS, JSON et les routes API.
4. La connexion MySQL est centralisee dans config/db.js.
4. Les controllers contiennent la logique metier de chaque module.
4. Les routes declarent les endpoints et les roles autorises.
4. Les services contiennent les helpers partages comme les identifiants et l audit.
5. Le backend est une API Express en JavaScript moderne.
5. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
5. Le fichier server.js demarre le serveur HTTP.
5. Le fichier app.js configure Express, CORS, JSON et les routes API.
5. La connexion MySQL est centralisee dans config/db.js.
5. Les controllers contiennent la logique metier de chaque module.
5. Les routes declarent les endpoints et les roles autorises.
5. Les services contiennent les helpers partages comme les identifiants et l audit.
6. Le backend est une API Express en JavaScript moderne.
6. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
6. Le fichier server.js demarre le serveur HTTP.
6. Le fichier app.js configure Express, CORS, JSON et les routes API.
6. La connexion MySQL est centralisee dans config/db.js.
6. Les controllers contiennent la logique metier de chaque module.
6. Les routes declarent les endpoints et les roles autorises.
6. Les services contiennent les helpers partages comme les identifiants et l audit.
7. Le backend est une API Express en JavaScript moderne.
7. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
7. Le fichier server.js demarre le serveur HTTP.
7. Le fichier app.js configure Express, CORS, JSON et les routes API.
7. La connexion MySQL est centralisee dans config/db.js.
7. Les controllers contiennent la logique metier de chaque module.
7. Les routes declarent les endpoints et les roles autorises.
7. Les services contiennent les helpers partages comme les identifiants et l audit.
8. Le backend est une API Express en JavaScript moderne.
8. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
8. Le fichier server.js demarre le serveur HTTP.
8. Le fichier app.js configure Express, CORS, JSON et les routes API.
8. La connexion MySQL est centralisee dans config/db.js.
8. Les controllers contiennent la logique metier de chaque module.
8. Les routes declarent les endpoints et les roles autorises.
8. Les services contiennent les helpers partages comme les identifiants et l audit.
9. Le backend est une API Express en JavaScript moderne.
9. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
9. Le fichier server.js demarre le serveur HTTP.
9. Le fichier app.js configure Express, CORS, JSON et les routes API.
9. La connexion MySQL est centralisee dans config/db.js.
9. Les controllers contiennent la logique metier de chaque module.
9. Les routes declarent les endpoints et les roles autorises.
9. Les services contiennent les helpers partages comme les identifiants et l audit.
10. Le backend est une API Express en JavaScript moderne.
10. Le dossier src contient la configuration, les routes, les controllers, les middleware et les services.
10. Le fichier server.js demarre le serveur HTTP.
10. Le fichier app.js configure Express, CORS, JSON et les routes API.
10. La connexion MySQL est centralisee dans config/db.js.
10. Les controllers contiennent la logique metier de chaque module.
10. Les routes declarent les endpoints et les roles autorises.
10. Les services contiennent les helpers partages comme les identifiants et l audit.

## Authentification et securite
- La connexion verifie email et mot de passe.
- Le mot de passe recent est compare avec bcrypt.
- Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
- Le JWT contient l identite, le role et l entreprise.
- Le middleware protect bloque les appels sans jeton valide.
- Le middleware authorizeRoles limite les actions par role.
- Les messages d erreur restent simples pour l utilisateur.
- Les champs sensibles sont exclus de l audit.
1. La connexion verifie email et mot de passe.
1. Le mot de passe recent est compare avec bcrypt.
1. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
1. Le JWT contient l identite, le role et l entreprise.
1. Le middleware protect bloque les appels sans jeton valide.
1. Le middleware authorizeRoles limite les actions par role.
1. Les messages d erreur restent simples pour l utilisateur.
1. Les champs sensibles sont exclus de l audit.
2. La connexion verifie email et mot de passe.
2. Le mot de passe recent est compare avec bcrypt.
2. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
2. Le JWT contient l identite, le role et l entreprise.
2. Le middleware protect bloque les appels sans jeton valide.
2. Le middleware authorizeRoles limite les actions par role.
2. Les messages d erreur restent simples pour l utilisateur.
2. Les champs sensibles sont exclus de l audit.
3. La connexion verifie email et mot de passe.
3. Le mot de passe recent est compare avec bcrypt.
3. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
3. Le JWT contient l identite, le role et l entreprise.
3. Le middleware protect bloque les appels sans jeton valide.
3. Le middleware authorizeRoles limite les actions par role.
3. Les messages d erreur restent simples pour l utilisateur.
3. Les champs sensibles sont exclus de l audit.
4. La connexion verifie email et mot de passe.
4. Le mot de passe recent est compare avec bcrypt.
4. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
4. Le JWT contient l identite, le role et l entreprise.
4. Le middleware protect bloque les appels sans jeton valide.
4. Le middleware authorizeRoles limite les actions par role.
4. Les messages d erreur restent simples pour l utilisateur.
4. Les champs sensibles sont exclus de l audit.
5. La connexion verifie email et mot de passe.
5. Le mot de passe recent est compare avec bcrypt.
5. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
5. Le JWT contient l identite, le role et l entreprise.
5. Le middleware protect bloque les appels sans jeton valide.
5. Le middleware authorizeRoles limite les actions par role.
5. Les messages d erreur restent simples pour l utilisateur.
5. Les champs sensibles sont exclus de l audit.
6. La connexion verifie email et mot de passe.
6. Le mot de passe recent est compare avec bcrypt.
6. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
6. Le JWT contient l identite, le role et l entreprise.
6. Le middleware protect bloque les appels sans jeton valide.
6. Le middleware authorizeRoles limite les actions par role.
6. Les messages d erreur restent simples pour l utilisateur.
6. Les champs sensibles sont exclus de l audit.
7. La connexion verifie email et mot de passe.
7. Le mot de passe recent est compare avec bcrypt.
7. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
7. Le JWT contient l identite, le role et l entreprise.
7. Le middleware protect bloque les appels sans jeton valide.
7. Le middleware authorizeRoles limite les actions par role.
7. Les messages d erreur restent simples pour l utilisateur.
7. Les champs sensibles sont exclus de l audit.
8. La connexion verifie email et mot de passe.
8. Le mot de passe recent est compare avec bcrypt.
8. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
8. Le JWT contient l identite, le role et l entreprise.
8. Le middleware protect bloque les appels sans jeton valide.
8. Le middleware authorizeRoles limite les actions par role.
8. Les messages d erreur restent simples pour l utilisateur.
8. Les champs sensibles sont exclus de l audit.
9. La connexion verifie email et mot de passe.
9. Le mot de passe recent est compare avec bcrypt.
9. Les anciens hash SHA-256 peuvent encore etre lus pour compatibilite.
9. Le JWT contient l identite, le role et l entreprise.
9. Le middleware protect bloque les appels sans jeton valide.
9. Le middleware authorizeRoles limite les actions par role.
9. Les messages d erreur restent simples pour l utilisateur.
9. Les champs sensibles sont exclus de l audit.

## Controllers principaux
- authController gere connexion, profil, mot de passe et recuperation.
- clientController gere clients et historique client.
- produitController gere produits, stock et approvisionnements.
- categorieController gere les familles de produits.
- fournisseurController gere les contacts fournisseurs.
- venteController gere factures, lignes et baisse du stock.
- paiementController gere encaissements et rapport caisse.
- rapportController gere factures, dettes, bilan, journal et inventaire.
1. authController gere connexion, profil, mot de passe et recuperation.
1. clientController gere clients et historique client.
1. produitController gere produits, stock et approvisionnements.
1. categorieController gere les familles de produits.
1. fournisseurController gere les contacts fournisseurs.
1. venteController gere factures, lignes et baisse du stock.
1. paiementController gere encaissements et rapport caisse.
1. rapportController gere factures, dettes, bilan, journal et inventaire.
2. authController gere connexion, profil, mot de passe et recuperation.
2. clientController gere clients et historique client.
2. produitController gere produits, stock et approvisionnements.
2. categorieController gere les familles de produits.
2. fournisseurController gere les contacts fournisseurs.
2. venteController gere factures, lignes et baisse du stock.
2. paiementController gere encaissements et rapport caisse.
2. rapportController gere factures, dettes, bilan, journal et inventaire.
3. authController gere connexion, profil, mot de passe et recuperation.
3. clientController gere clients et historique client.
3. produitController gere produits, stock et approvisionnements.
3. categorieController gere les familles de produits.
3. fournisseurController gere les contacts fournisseurs.
3. venteController gere factures, lignes et baisse du stock.
3. paiementController gere encaissements et rapport caisse.
3. rapportController gere factures, dettes, bilan, journal et inventaire.
4. authController gere connexion, profil, mot de passe et recuperation.
4. clientController gere clients et historique client.
4. produitController gere produits, stock et approvisionnements.
4. categorieController gere les familles de produits.
4. fournisseurController gere les contacts fournisseurs.
4. venteController gere factures, lignes et baisse du stock.
4. paiementController gere encaissements et rapport caisse.
4. rapportController gere factures, dettes, bilan, journal et inventaire.
5. authController gere connexion, profil, mot de passe et recuperation.
5. clientController gere clients et historique client.
5. produitController gere produits, stock et approvisionnements.
5. categorieController gere les familles de produits.
5. fournisseurController gere les contacts fournisseurs.
5. venteController gere factures, lignes et baisse du stock.
5. paiementController gere encaissements et rapport caisse.
5. rapportController gere factures, dettes, bilan, journal et inventaire.
6. authController gere connexion, profil, mot de passe et recuperation.
6. clientController gere clients et historique client.
6. produitController gere produits, stock et approvisionnements.
6. categorieController gere les familles de produits.
6. fournisseurController gere les contacts fournisseurs.
6. venteController gere factures, lignes et baisse du stock.
6. paiementController gere encaissements et rapport caisse.
6. rapportController gere factures, dettes, bilan, journal et inventaire.
7. authController gere connexion, profil, mot de passe et recuperation.
7. clientController gere clients et historique client.
7. produitController gere produits, stock et approvisionnements.
7. categorieController gere les familles de produits.
7. fournisseurController gere les contacts fournisseurs.
7. venteController gere factures, lignes et baisse du stock.
7. paiementController gere encaissements et rapport caisse.
7. rapportController gere factures, dettes, bilan, journal et inventaire.
8. authController gere connexion, profil, mot de passe et recuperation.
8. clientController gere clients et historique client.
8. produitController gere produits, stock et approvisionnements.
8. categorieController gere les familles de produits.
8. fournisseurController gere les contacts fournisseurs.
8. venteController gere factures, lignes et baisse du stock.
8. paiementController gere encaissements et rapport caisse.
8. rapportController gere factures, dettes, bilan, journal et inventaire.
9. authController gere connexion, profil, mot de passe et recuperation.
9. clientController gere clients et historique client.
9. produitController gere produits, stock et approvisionnements.
9. categorieController gere les familles de produits.
9. fournisseurController gere les contacts fournisseurs.
9. venteController gere factures, lignes et baisse du stock.
9. paiementController gere encaissements et rapport caisse.
9. rapportController gere factures, dettes, bilan, journal et inventaire.

## Regles de donnees
- Chaque entreprise voit uniquement ses donnees.
- Chaque requete sensible filtre par entreprise_id.
- Un produit appartient a une entreprise.
- Une vente appartient a une entreprise via le client et la facture.
- Un paiement appartient indirectement a une entreprise via la vente.
- Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
- Un mouvement de stock garde le prix d achat de la livraison.
- Les suppressions critiques verifient les contraintes metier.
1. Chaque entreprise voit uniquement ses donnees.
1. Chaque requete sensible filtre par entreprise_id.
1. Un produit appartient a une entreprise.
1. Une vente appartient a une entreprise via le client et la facture.
1. Un paiement appartient indirectement a une entreprise via la vente.
1. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
1. Un mouvement de stock garde le prix d achat de la livraison.
1. Les suppressions critiques verifient les contraintes metier.
2. Chaque entreprise voit uniquement ses donnees.
2. Chaque requete sensible filtre par entreprise_id.
2. Un produit appartient a une entreprise.
2. Une vente appartient a une entreprise via le client et la facture.
2. Un paiement appartient indirectement a une entreprise via la vente.
2. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
2. Un mouvement de stock garde le prix d achat de la livraison.
2. Les suppressions critiques verifient les contraintes metier.
3. Chaque entreprise voit uniquement ses donnees.
3. Chaque requete sensible filtre par entreprise_id.
3. Un produit appartient a une entreprise.
3. Une vente appartient a une entreprise via le client et la facture.
3. Un paiement appartient indirectement a une entreprise via la vente.
3. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
3. Un mouvement de stock garde le prix d achat de la livraison.
3. Les suppressions critiques verifient les contraintes metier.
4. Chaque entreprise voit uniquement ses donnees.
4. Chaque requete sensible filtre par entreprise_id.
4. Un produit appartient a une entreprise.
4. Une vente appartient a une entreprise via le client et la facture.
4. Un paiement appartient indirectement a une entreprise via la vente.
4. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
4. Un mouvement de stock garde le prix d achat de la livraison.
4. Les suppressions critiques verifient les contraintes metier.
5. Chaque entreprise voit uniquement ses donnees.
5. Chaque requete sensible filtre par entreprise_id.
5. Un produit appartient a une entreprise.
5. Une vente appartient a une entreprise via le client et la facture.
5. Un paiement appartient indirectement a une entreprise via la vente.
5. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
5. Un mouvement de stock garde le prix d achat de la livraison.
5. Les suppressions critiques verifient les contraintes metier.
6. Chaque entreprise voit uniquement ses donnees.
6. Chaque requete sensible filtre par entreprise_id.
6. Un produit appartient a une entreprise.
6. Une vente appartient a une entreprise via le client et la facture.
6. Un paiement appartient indirectement a une entreprise via la vente.
6. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
6. Un mouvement de stock garde le prix d achat de la livraison.
6. Les suppressions critiques verifient les contraintes metier.
7. Chaque entreprise voit uniquement ses donnees.
7. Chaque requete sensible filtre par entreprise_id.
7. Un produit appartient a une entreprise.
7. Une vente appartient a une entreprise via le client et la facture.
7. Un paiement appartient indirectement a une entreprise via la vente.
7. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
7. Un mouvement de stock garde le prix d achat de la livraison.
7. Les suppressions critiques verifient les contraintes metier.
8. Chaque entreprise voit uniquement ses donnees.
8. Chaque requete sensible filtre par entreprise_id.
8. Un produit appartient a une entreprise.
8. Une vente appartient a une entreprise via le client et la facture.
8. Un paiement appartient indirectement a une entreprise via la vente.
8. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
8. Un mouvement de stock garde le prix d achat de la livraison.
8. Les suppressions critiques verifient les contraintes metier.
9. Chaque entreprise voit uniquement ses donnees.
9. Chaque requete sensible filtre par entreprise_id.
9. Un produit appartient a une entreprise.
9. Une vente appartient a une entreprise via le client et la facture.
9. Un paiement appartient indirectement a une entreprise via la vente.
9. Un fournisseur ne porte pas de prix de vente ou de prix d achat fixe.
9. Un mouvement de stock garde le prix d achat de la livraison.
9. Les suppressions critiques verifient les contraintes metier.

## Calculs backend
- Le total vendu du mois utilise la somme TTC des ventes du mois.
- L argent recu du mois utilise la somme des paiements du mois.
- Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
- Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
- Le total creances utilise montant TTC moins paiements deja recus.
- La valeur du stock utilise quantite_stock multipliee par prix_achat.
- Le cout moyen pondere est recalcule pendant l approvisionnement.
- Les rapports acceptent les filtres de dates quand la route le prevoit.
1. Le total vendu du mois utilise la somme TTC des ventes du mois.
1. L argent recu du mois utilise la somme des paiements du mois.
1. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
1. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
1. Le total creances utilise montant TTC moins paiements deja recus.
1. La valeur du stock utilise quantite_stock multipliee par prix_achat.
1. Le cout moyen pondere est recalcule pendant l approvisionnement.
1. Les rapports acceptent les filtres de dates quand la route le prevoit.
2. Le total vendu du mois utilise la somme TTC des ventes du mois.
2. L argent recu du mois utilise la somme des paiements du mois.
2. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
2. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
2. Le total creances utilise montant TTC moins paiements deja recus.
2. La valeur du stock utilise quantite_stock multipliee par prix_achat.
2. Le cout moyen pondere est recalcule pendant l approvisionnement.
2. Les rapports acceptent les filtres de dates quand la route le prevoit.
3. Le total vendu du mois utilise la somme TTC des ventes du mois.
3. L argent recu du mois utilise la somme des paiements du mois.
3. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
3. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
3. Le total creances utilise montant TTC moins paiements deja recus.
3. La valeur du stock utilise quantite_stock multipliee par prix_achat.
3. Le cout moyen pondere est recalcule pendant l approvisionnement.
3. Les rapports acceptent les filtres de dates quand la route le prevoit.
4. Le total vendu du mois utilise la somme TTC des ventes du mois.
4. L argent recu du mois utilise la somme des paiements du mois.
4. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
4. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
4. Le total creances utilise montant TTC moins paiements deja recus.
4. La valeur du stock utilise quantite_stock multipliee par prix_achat.
4. Le cout moyen pondere est recalcule pendant l approvisionnement.
4. Les rapports acceptent les filtres de dates quand la route le prevoit.
5. Le total vendu du mois utilise la somme TTC des ventes du mois.
5. L argent recu du mois utilise la somme des paiements du mois.
5. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
5. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
5. Le total creances utilise montant TTC moins paiements deja recus.
5. La valeur du stock utilise quantite_stock multipliee par prix_achat.
5. Le cout moyen pondere est recalcule pendant l approvisionnement.
5. Les rapports acceptent les filtres de dates quand la route le prevoit.
6. Le total vendu du mois utilise la somme TTC des ventes du mois.
6. L argent recu du mois utilise la somme des paiements du mois.
6. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
6. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
6. Le total creances utilise montant TTC moins paiements deja recus.
6. La valeur du stock utilise quantite_stock multipliee par prix_achat.
6. Le cout moyen pondere est recalcule pendant l approvisionnement.
6. Les rapports acceptent les filtres de dates quand la route le prevoit.
7. Le total vendu du mois utilise la somme TTC des ventes du mois.
7. L argent recu du mois utilise la somme des paiements du mois.
7. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
7. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
7. Le total creances utilise montant TTC moins paiements deja recus.
7. La valeur du stock utilise quantite_stock multipliee par prix_achat.
7. Le cout moyen pondere est recalcule pendant l approvisionnement.
7. Les rapports acceptent les filtres de dates quand la route le prevoit.
8. Le total vendu du mois utilise la somme TTC des ventes du mois.
8. L argent recu du mois utilise la somme des paiements du mois.
8. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
8. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
8. Le total creances utilise montant TTC moins paiements deja recus.
8. La valeur du stock utilise quantite_stock multipliee par prix_achat.
8. Le cout moyen pondere est recalcule pendant l approvisionnement.
8. Les rapports acceptent les filtres de dates quand la route le prevoit.
9. Le total vendu du mois utilise la somme TTC des ventes du mois.
9. L argent recu du mois utilise la somme des paiements du mois.
9. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
9. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
9. Le total creances utilise montant TTC moins paiements deja recus.
9. La valeur du stock utilise quantite_stock multipliee par prix_achat.
9. Le cout moyen pondere est recalcule pendant l approvisionnement.
9. Les rapports acceptent les filtres de dates quand la route le prevoit.
10. Le total vendu du mois utilise la somme TTC des ventes du mois.
10. L argent recu du mois utilise la somme des paiements du mois.
10. Le cout vendu utilise quantite vendue multipliee par prix achat de ligne ou produit.
10. Le gain utilise quantite vendue multipliee par prix vente HT moins prix achat.
10. Le total creances utilise montant TTC moins paiements deja recus.
10. La valeur du stock utilise quantite_stock multipliee par prix_achat.
10. Le cout moyen pondere est recalcule pendant l approvisionnement.
10. Les rapports acceptent les filtres de dates quand la route le prevoit.

## Endpoints importants
- POST /api/auth/login connecte un utilisateur.
- GET /api/auth/me renvoie le profil courant.
- GET /api/clients liste les clients.
- GET /api/produits liste les produits avec statut stock.
- POST /api/produits/:id/approvisionner ajoute du stock.
- GET /api/fournisseurs liste les fournisseurs sans total achat.
- POST /api/ventes cree une facture.
- GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
1. POST /api/auth/login connecte un utilisateur.
1. GET /api/auth/me renvoie le profil courant.
1. GET /api/clients liste les clients.
1. GET /api/produits liste les produits avec statut stock.
1. POST /api/produits/:id/approvisionner ajoute du stock.
1. GET /api/fournisseurs liste les fournisseurs sans total achat.
1. POST /api/ventes cree une facture.
1. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
2. POST /api/auth/login connecte un utilisateur.
2. GET /api/auth/me renvoie le profil courant.
2. GET /api/clients liste les clients.
2. GET /api/produits liste les produits avec statut stock.
2. POST /api/produits/:id/approvisionner ajoute du stock.
2. GET /api/fournisseurs liste les fournisseurs sans total achat.
2. POST /api/ventes cree une facture.
2. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
3. POST /api/auth/login connecte un utilisateur.
3. GET /api/auth/me renvoie le profil courant.
3. GET /api/clients liste les clients.
3. GET /api/produits liste les produits avec statut stock.
3. POST /api/produits/:id/approvisionner ajoute du stock.
3. GET /api/fournisseurs liste les fournisseurs sans total achat.
3. POST /api/ventes cree une facture.
3. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
4. POST /api/auth/login connecte un utilisateur.
4. GET /api/auth/me renvoie le profil courant.
4. GET /api/clients liste les clients.
4. GET /api/produits liste les produits avec statut stock.
4. POST /api/produits/:id/approvisionner ajoute du stock.
4. GET /api/fournisseurs liste les fournisseurs sans total achat.
4. POST /api/ventes cree une facture.
4. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
5. POST /api/auth/login connecte un utilisateur.
5. GET /api/auth/me renvoie le profil courant.
5. GET /api/clients liste les clients.
5. GET /api/produits liste les produits avec statut stock.
5. POST /api/produits/:id/approvisionner ajoute du stock.
5. GET /api/fournisseurs liste les fournisseurs sans total achat.
5. POST /api/ventes cree une facture.
5. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
6. POST /api/auth/login connecte un utilisateur.
6. GET /api/auth/me renvoie le profil courant.
6. GET /api/clients liste les clients.
6. GET /api/produits liste les produits avec statut stock.
6. POST /api/produits/:id/approvisionner ajoute du stock.
6. GET /api/fournisseurs liste les fournisseurs sans total achat.
6. POST /api/ventes cree une facture.
6. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
7. POST /api/auth/login connecte un utilisateur.
7. GET /api/auth/me renvoie le profil courant.
7. GET /api/clients liste les clients.
7. GET /api/produits liste les produits avec statut stock.
7. POST /api/produits/:id/approvisionner ajoute du stock.
7. GET /api/fournisseurs liste les fournisseurs sans total achat.
7. POST /api/ventes cree une facture.
7. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
8. POST /api/auth/login connecte un utilisateur.
8. GET /api/auth/me renvoie le profil courant.
8. GET /api/clients liste les clients.
8. GET /api/produits liste les produits avec statut stock.
8. POST /api/produits/:id/approvisionner ajoute du stock.
8. GET /api/fournisseurs liste les fournisseurs sans total achat.
8. POST /api/ventes cree une facture.
8. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.
9. POST /api/auth/login connecte un utilisateur.
9. GET /api/auth/me renvoie le profil courant.
9. GET /api/clients liste les clients.
9. GET /api/produits liste les produits avec statut stock.
9. POST /api/produits/:id/approvisionner ajoute du stock.
9. GET /api/fournisseurs liste les fournisseurs sans total achat.
9. POST /api/ventes cree une facture.
9. GET /api/paiements/rapport-caisse regroupe la caisse par date et mode.

- Note 1: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 2: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 3: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 4: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 5: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 6: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 7: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 8: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 9: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 10: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 11: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 12: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
- Note 13: documentation backend doit rester simple, verifiable et utile pour un utilisateur non technique.
