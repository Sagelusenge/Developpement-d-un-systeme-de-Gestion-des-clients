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
- inscription et authentification client;
- commandes et achats client;
- reclamations;
- chat et flux temps reel SSE;
- demandes de paiement Mobile Money.

Routes recentes importantes:

- `GET /api/chat/stream?token=...`: evenements de chat instantanes;
- `POST /api/paiements/mobile-money/client`: soumission client;
- `GET /api/paiements/mobile-money/demandes`: consultation manager/caissier;
- `PUT /api/paiements/mobile-money/demandes/:id`: confirmation ou rejet par le caissier.
- `GET /api/chat/manager-analysis`: avis IA reserve au manager;
- `GET /api/public/contacts`: messages du site reserves au manager;
- `PUT /api/public/contacts/:id`: classement lu ou traite.

## Bonne pratique

Une route doit rester courte. Elle indique l'URL, les protections et la fonction du controller a appeler. La validation avancee et les requetes SQL restent dans les controllers ou les services.
