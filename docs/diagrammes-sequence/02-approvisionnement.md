# Prompt draw.io - Approvisionnement

Crée un diagramme de séquence UML propre et lisible intitulé "Approvisionnement produit - Quincaillerie Centrale".

Acteurs et composants:
- Magasinier
- Frontend Web
- Backend API
- Middleware Authentification JWT
- Base de données MySQL

Scénario:
1. Le magasinier ouvre Produits & Stocks.
2. Le Frontend Web charge produits et fournisseurs.
3. Le magasinier choisit un produit.
4. Le magasinier choisit un fournisseur.
5. Le magasinier saisit quantité et prix d'achat unitaire.
6. Le Frontend Web calcule et affiche `prix_total_achat = quantité * prix_achat_unitaire`.
7. Le Frontend Web envoie `POST /api/produits/:id/approvisionner`.
8. Le Middleware JWT vérifie le token et le rôle manager/magasinier.
9. Le Backend API vérifie produit et fournisseur dans MySQL.
10. Le Backend API met à jour le stock du produit.
11. Le Backend API enregistre le mouvement stock avec fournisseur, quantité, prix achat unitaire et total.
12. MySQL confirme l'enregistrement.
13. Le Backend API retourne confirmation.
14. Le Frontend Web affiche "Stock mis à jour".

Contraintes:
- Utiliser un bloc `alt` pour fournisseur absent, produit absent ou données invalides.
- Couleurs: Frontend bleu clair, Backend bleu foncé, MySQL gris.
- Mettre en évidence le calcul du prix total achat.
