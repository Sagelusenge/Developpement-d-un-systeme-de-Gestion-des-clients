# Prompt draw.io - Rapports

Crée un diagramme de séquence UML propre et lisible intitulé "Rapports et bilan - Quincaillerie Centrale".

Acteurs et composants:
- Manager ou Caissier
- Frontend Web
- Backend API
- Middleware Authentification JWT
- Base de données MySQL

Scénario:
1. L'utilisateur ouvre Rapports.
2. Le Frontend Web affiche les filtres de période.
3. L'utilisateur choisit date début et date fin.
4. Le Frontend Web appelle les endpoints rapports:
   - `GET /api/rapports/bilan`
   - `GET /api/rapports/journal`
   - `GET /api/rapports/livre-caisse`
   - `GET /api/rapports/creances`
   - `GET /api/rapports/stock`
5. Le Middleware JWT vérifie le token et le rôle.
6. Le Backend API interroge MySQL avec les dates.
7. MySQL retourne ventes, paiements, coût achat, valeur stock et créances.
8. Le Backend API calcule résultat:
   `résultat = ventes_ht - coût_achat`.
9. Le Backend API retourne les rapports.
10. Le Frontend Web affiche les tableaux et boutons d'impression.

Contraintes:
- Utiliser un bloc `opt` pour l'impression.
- Utiliser un bloc `alt` pour manager/caissier/magasinier selon les rapports autorisés.
- Couleurs: rapports en bleu, MySQL gris.
