# Prompt draw.io - Vente / Facture

Crée un diagramme de séquence UML propre et lisible intitulé "Vente et calcul gain/perte - Quincaillerie Centrale".

Acteurs et composants:
- Vendeur
- Frontend Web
- Backend API
- Middleware Authentification JWT
- Base de données MySQL

Scénario:
1. Le vendeur ouvre la page Factures.
2. Le Frontend Web charge clients et produits.
3. Le vendeur sélectionne un client.
4. Le vendeur ajoute un ou plusieurs produits.
5. Pour chaque ligne, le vendeur saisit quantité et prix de vente unitaire.
6. Le Frontend Web affiche le total ligne et le gain estimé:
   `gain = (prix_vente_unitaire - prix_achat_unitaire) * quantité`.
7. Le Frontend Web envoie `POST /api/ventes`.
8. Le Middleware JWT vérifie le token et le rôle manager/vendeur.
9. Le Backend API vérifie le client.
10. Pour chaque produit, le Backend API verrouille la ligne produit, vérifie le stock et lit le prix d'achat courant.
11. Le Backend API crée la facture.
12. Le Backend API crée les lignes de vente avec prix vente et prix achat.
13. MySQL diminue le stock.
14. Le Backend API retourne le numéro de facture.
15. Le Frontend Web affiche la facture.

Contraintes:
- Utiliser un bloc `loop` pour les lignes produits.
- Utiliser un bloc `alt` pour stock insuffisant ou prix invalide.
- Couleurs sobres et format paysage.
