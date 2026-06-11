# Prompt draw.io - Authentification

Crée un diagramme de séquence UML propre et lisible intitulé "Authentification - Quincaillerie Centrale".

Acteurs et composants:
- Utilisateur
- Frontend Web
- Backend API
- Middleware Authentification JWT
- Base de données MySQL

Scénario:
1. L'utilisateur ouvre l'application.
2. Le Frontend Web affiche la page de connexion.
3. L'utilisateur saisit email et mot de passe.
4. Le Frontend Web envoie `POST /api/auth/login`.
5. Le Backend API recherche l'utilisateur dans MySQL.
6. MySQL retourne l'utilisateur, son rôle et son état.
7. Bloc `alt`:
   - Si utilisateur suspendu ou inactif: retourner "Utilisateur déjà suspendu".
   - Si mot de passe invalide: retourner "Email ou mot de passe incorrect".
   - Si valide: générer un token JWT.
8. Le Backend API retourne token + infos utilisateur.
9. Le Frontend Web stocke le token et affiche le tableau de bord selon le rôle.

Contraintes:
- Format paysage compatible draw.io.
- Lifelines bien espacées.
- Appels synchrones en flèches pleines.
- Réponses en flèches pointillées.
- Couleurs: Frontend bleu clair, Backend bleu foncé, MySQL gris, erreurs rouge clair.
- Utiliser un bloc `alt` pour les cas d'erreur.
