# Dossier backend/src

Ce dossier contient le code source de l'API.

- `server.js` lance le serveur HTTP.
- `app.js` assemble Express, CORS, JSON, routes et gestion d'erreurs.
- `config` connecte l'application a MySQL.
- `controllers` contient les traitements metier.
- `routes` expose les endpoints.
- `middleware` protege les routes.
- `services` regroupe les helpers reutilisables.

## Lecture conseillee

Pour comprendre le backend rapidement:

1. Lire `app.js` pour voir les routes montees.
2. Lire `routes/` pour comprendre les URL disponibles.
3. Lire `middleware/` pour voir la securite JWT et les roles.
4. Lire `controllers/` pour suivre la logique metier.
5. Lire `services/schemaService.js` pour comprendre les evolutions de la base.

## Regle generale

Les routes ne doivent pas contenir la logique metier lourde. Elles orientent la requete vers le bon controller. Les controllers traitent les donnees et les services regroupent ce qui est reutilisable.
