# Dossier backend/src/routes

Ce dossier contient les routes de l'API.

Une route relie une URL a un controller. Exemple: une requete `GET /api/produits` passe par une route, puis appelle le controller des produits.

Les routes appliquent aussi les middlewares d'authentification et de role.

## Organisation

Chaque fichier de route correspond a un domaine:

- authentification;
- clients;
- produits;
- categories;
- fournisseurs;
- ventes;
- paiements;
- rapports;
- utilisateurs;
- emails.

## Bonne pratique

Une route doit rester courte. Elle indique l'URL, les protections et la fonction du controller a appeler. La validation avancee et les requetes SQL restent dans les controllers ou les services.
