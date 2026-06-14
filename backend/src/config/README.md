# Dossier backend/src/config

Ce dossier contient la configuration technique du backend.

Le fichier principal est `db.js`. Il cree le pool de connexion MySQL a partir des variables d'environnement.

Ce dossier aide tout le reste du backend a parler a la base de donnees sans repeter la configuration partout.

## Variables attendues

```text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
```

## Pourquoi un pool MySQL

Le pool garde plusieurs connexions disponibles. Cela evite d'ouvrir une nouvelle connexion a chaque requete et rend l'API plus stable quand plusieurs utilisateurs travaillent en meme temps.

## Bonne pratique

Ne jamais mettre les identifiants de production directement dans le code. Les valeurs doivent rester dans `.env` en local et dans les variables d'environnement Render en production.
