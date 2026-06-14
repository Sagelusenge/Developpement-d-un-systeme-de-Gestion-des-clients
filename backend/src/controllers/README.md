# Dossier backend/src/controllers

Ce dossier contient la logique metier de l'API.

Chaque controller recoit une requete, verifie les donnees utiles, execute les requetes SQL, puis renvoie une reponse JSON.

Exemples:

- `authController.js`: connexion, profil et utilisateurs.
- `produitController.js`: produits, stock et approvisionnement.
- `venteController.js`: factures, lignes de vente, benefice et suppression.
- `dashboardController.js`: chiffres du tableau de bord.
- `rapportController.js`: factures, caisse, journal, inventaire et donnees de rapports.

## Points metier a retenir

- Les ventes creent les factures et les lignes vendues.
- Les paiements enregistrent seulement l'argent recu.
- Les produits gardent le prix de vente et le stock.
- Les approvisionnements creent des entrees de stock avec prix d'achat.
- Les rapports utilisent les donnees deja enregistrees sans modifier la base.
