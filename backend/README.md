# Backend - API Quincaillerie Centrale

Ce dossier contient l'API Express du CRM PME. Il gere aussi les comptes clients, commandes, reclamations, chat temps reel, emails professionnels et demandes Mobile Money.

## Structure

| Chemin | Role |
| --- | --- |
| `src/server.js` | Point de demarrage du serveur. |
| `src/app.js` | Configuration Express, JSON, CORS, routes et middlewares. |
| `src/config/` | Connexion MySQL et configuration technique. |
| `src/controllers/` | Logique metier des endpoints. |
| `src/routes/` | Declaration des URL de l'API. |
| `src/middleware/` | Authentification JWT et controle des roles. |
| `src/services/` | Fonctions partagees, schema SQL et services mail. |
| `scripts/` | Scripts d'initialisation et donnees de demonstration. |
| `crm_pme.sql` | Structure SQL principale. |
| `API_MOBILE.md` | Documentation des endpoints pour une application mobile. |

## Fonctionnement

1. L'utilisateur se connecte avec email et mot de passe.
2. Le backend verifie le compte et signe un token JWT.
3. Le token expire apres 2h.
4. Chaque route protegee verifie le token.
5. Certaines routes verifient aussi le role: manager, caissier ou magasinier.
6. Les controllers executent les requetes SQL.
7. Les donnees sont renvoyees au frontend en JSON.

## Fonctionnalites recentes

- authentification unifiee des comptes equipe et client;
- inscription client avec code email temporaire;
- commandes calculees exclusivement avec le prix de vente catalogue;
- chat persistant et flux SSE `GET /api/chat/stream`;
- reponses automatiques sur commandes et factures, puis escalade au manager;
- alerte du manager par notification et email lors d'une question complexe;
- demande Mobile Money client, controle d'unicite de la reference et verification par le caissier;
- table `demandes_paiement_mobile` creee par le schema d'execution.

La description exhaustive des bodies et reponses se trouve dans `API_MOBILE.md`.

## IA et secrets

Le chat fonctionne en mode hybride: reponses SQL/FAQ locales, puis OpenAI Responses API pour les questions generales. La cle doit etre configuree uniquement dans l'environnement du backend:

```text
OPENAI_API_KEY=nouvelle_cle_non_publiee
OPENAI_MODEL=gpt-4.1-mini
```

Ne jamais placer la cle dans `frontend`, Git, une capture ou une conversation. Une cle exposee doit etre revoquee avant utilisation.

## Hebergement SPA

Le fichier `frontend/public/_redirects` doit etre inclus dans le build afin que l'hebergeur renvoie les routes comme `/app` et `/contact` vers `index.html` lors d'une actualisation.

## Relance email des prospects

Le serveur controle les prospects toutes les heures. Un prospect est eligible si son compte est actif, son email a ete verifie, il n'a aucune vente et son inscription depasse le delai configure. La campagne n'est envoyee que si au moins trois produits vendables sont en stock.

```text
PROSPECT_FOLLOWUP_HOURS=24
```

Utiliser `168` apres la phase de test.

## Modules API

- Authentification et profil.
- Clients.
- Produits et stock.
- Categories.
- Fournisseurs.
- Ventes et lignes de vente.
- Paiements et caisse.
- Rapports.
- Utilisateurs.
- Emails et notifications.

## Regles metier importantes

- Une facture peut exister meme si elle n'est pas encore payee.
- Le paiement represente l'argent reellement encaisse.
- Le stock baisse lors d'une vente.
- Le stock augmente lors d'un approvisionnement.
- Le prix d'achat est saisi pendant l'approvisionnement, pas dans la fiche fournisseur.
- Les mouvements de stock gardent la trace des entrees et sorties.
- Le gain commercial se calcule avec le prix de vente HT moins le cout d'achat.

## Installation locale

```bash
npm install
npm run dev
```

## Variables d'environnement

```text
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crm_pme
JWT_SECRET=une_cle_secrete
FRONTEND_URL=http://localhost:5173
```

## Commandes utiles

```bash
npm start
npm run dev
```

## Deploiement Render

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Apres un push sur `main`, verifier dans Render que le service backend redeploie bien la derniere version. Si l'ancien comportement reste visible, lancer un `Manual Deploy`.
