# Dossier backend

Ce dossier contient l'API du systeme. Il gere l'authentification, les donnees MySQL, les ventes, les paiements, les produits, les rapports et les permissions.

Fichiers importants:

- `src/server.js`: point de demarrage du serveur.
- `src/app.js`: configuration Express, routes et middlewares.
- `src/config`: configuration de la base de donnees.
- `src/controllers`: logique metier des endpoints.
- `src/routes`: declaration des URL de l'API.
- `src/middleware`: securite, authentification et controles de roles.
- `src/services`: fonctions partagees, par exemple verification du schema.
- `scripts`: scripts utiles pour initialiser ou alimenter la base.
- `API_MOBILE.md`: documentation complete de l'API pour le developpeur mobile.
- `crm_pme.sql`: structure SQL principale.

