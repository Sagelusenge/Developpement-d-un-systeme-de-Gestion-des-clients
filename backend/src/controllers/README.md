# Dossier backend/src/controllers

Ce dossier contient la logique metier de l'API.

Chaque controller recoit une requete, verifie les donnees utiles, execute les requetes SQL, puis renvoie une reponse JSON.

Exemples:

- `authController.js`: connexion, profil et utilisateurs.
- `produitController.js`: produits, stock et approvisionnement.
- `venteController.js`: factures, lignes de vente, benefice et suppression.
- `dashboardController.js`: chiffres du tableau de bord.
- `rapportController.js`: factures, caisse, bilan, journal et inventaire.

