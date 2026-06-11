# Prompt draw.io - Notifications

Crée un diagramme de séquence UML propre et lisible intitulé "Notifications - Quincaillerie Centrale".

Acteurs et composants:
- Utilisateur
- Frontend Web
- Backend API
- Middleware Authentification JWT
- Base de données MySQL
- Service Notifications
- Service Email

Scénario:
1. Après connexion, le Frontend Web appelle `GET /api/notifications`.
2. Le Middleware JWT vérifie le token.
3. Le Backend API demande les notifications au Service Notifications.
4. Le Service Notifications lit MySQL.
5. MySQL retourne les notifications.
6. Le Frontend Web affiche le compteur de notifications non lues.
7. L'utilisateur clique sur une notification.
8. Le Frontend Web envoie `PUT /api/notifications/:id/read`.
9. Le Backend API marque la notification comme lue dans MySQL.
10. Le Frontend Web diminue le compteur.

Option:
- Si la notification concerne un mot de passe oublié, afficher la modale de reconfiguration.
- Le Service Email peut envoyer un message si l'action métier le demande.

Contraintes:
- Utiliser un bloc `opt` pour le cas mot de passe oublié.
- Couleurs: Notifications orange, Email vert, Backend bleu foncé, MySQL gris.
