# Documentation API Mobile - Quincaillerie Centrale

Base URL locale:

```txt
http://localhost:5000
```

Base URL Render:

```txt
https://developpement-d-un-systeme-de-gestion.onrender.com
```

Toutes les routes metier commencent par `/api`.

## Headers

Routes publiques: pas de token.

Routes protegees:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## Authentification

```http
GET  /api/health
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-request-password
```

### Login

```json
{
  "email": "sage.kitsa@quincaillerie-centrale.cd",
  "password": "12345678"
}
```

### Modifier profil

```json
{
  "nom": "KITSA LUSENGE Sage",
  "telephone": "+243 990 000 001"
}
```

### Changer mot de passe

```json
{
  "new_password": "nouveauMotDePasse",
  "confirm_password": "nouveauMotDePasse"
}
```

## Dashboard

```http
GET /api/dashboard/stats
GET /api/dashboard/ventes-mensuelles
GET /api/dashboard/resultat-mensuel
GET /api/dashboard/alertes-stock
GET /api/dashboard/produits-plus-vendus
```

Formule du resultat:

```txt
benefice/perte = somme((prix_vente_unitaire - prix_achat_unitaire) * quantite)
```

## Clients

```http
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

Body:

```json
{
  "nom": "Kabongo",
  "postnom": "Patrick",
  "telephone": "+243990000000"
}
```

## Categories

```http
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

Body:

```json
{
  "nom": "Ciment",
  "description": "Produits de construction",
  "photo_url": ""
}
```

La reference categorie est generee automatiquement par le backend.

## Fournisseurs

```http
GET    /api/fournisseurs
POST   /api/fournisseurs
PUT    /api/fournisseurs/:id
DELETE /api/fournisseurs/:id
```

Body:

```json
{
  "nom": "Katanga Materiaux",
  "telephone": "+243990000000",
  "email": "contact@example.cd",
  "adresse": "Lubumbashi"
}
```

Un fournisseur deja utilise dans un approvisionnement n'est pas supprime afin de garder l'historique.

## Produits et Stock

```http
GET    /api/produits
POST   /api/produits
PUT    /api/produits/:id
DELETE /api/produits/:id
GET    /api/produits/mouvements-recents
POST   /api/produits/:id/approvisionner
```

### Produit

```json
{
  "reference_produit": "CIM-42",
  "nom": "Ciment gris 42.5",
  "categorie_id": "CAT-...",
  "prix_ht": 20,
  "taux_tva": 16,
  "quantite_stock": 0,
  "seuil_alerte": 10,
  "photo_url": ""
}
```

### Approvisionnement

```json
{
  "fournisseur_id": "FOU-...",
  "quantite": 50,
  "prix_achat": 12,
  "note": "Premier achat"
}
```

Calculs:

```txt
prix_achat_total = quantite * prix_achat
cout_moyen_pondere = valeur_stock_actuelle + nouvel_achat / stock_total
```

Exemple:

```txt
10 pieces a 12 USD + 10 pieces a 15 USD = cout moyen 13,50 USD
```

## Ventes / Factures

```http
GET    /api/ventes
GET    /api/ventes/:id
POST   /api/ventes
PUT    /api/ventes/:id
DELETE /api/ventes/:id
```

Body:

```json
{
  "client_id": "CLI-...",
  "articles": [
    {
      "produit_id": "PRD-...",
      "quantite": 3,
      "prix": 20
    }
  ]
}
```

Notes:

- `prix` est le prix de vente unitaire saisi par le caissier.
- Le backend garde le prix d'achat unitaire au moment de la vente.
- Le stock est verifie puis diminue.
- Une facture payee ne peut pas etre modifiee ou supprimee.

## Paiements

```http
POST /api/paiements
GET  /api/paiements/rapport-caisse
GET  /api/paiements/repartition
```

Body:

```json
{
  "vente_id": "FAC-...",
  "montant": 100,
  "mode_paiement": "especes",
  "reference_externe": "",
  "telephone_payeur": ""
}
```

Modes:

```txt
especes
carte
virement
mobile_money
```

Pour `mobile_money`, `reference_externe` et `telephone_payeur` sont requis.

## Rapports

```http
GET /api/rapports/factures
GET /api/rapports/creances
GET /api/rapports/stock
GET /api/rapports/top-acheteurs
GET /api/rapports/bilan
GET /api/rapports/journal
GET /api/rapports/livre-caisse
```

Filtres date:

```http
GET /api/rapports/bilan?date_debut=2026-06-01&date_fin=2026-06-30
```

## Utilisateurs

```http
GET    /api/utilisateurs
POST   /api/utilisateurs
PUT    /api/utilisateurs/:id
DELETE /api/utilisateurs/:id
PUT    /api/utilisateurs/:id/toggle
GET    /api/utilisateurs/:id/activity
```

Body:

```json
{
  "nom": "Nom Utilisateur",
  "email": "user@example.com",
  "password": "12345678",
  "role": "caissier"
}
```

Roles:

```txt
manager
caissier
magasinier
```

## Notifications

```http
GET /api/notifications
PUT /api/notifications/:id/read
```

Le compteur mobile doit compter uniquement les notifications avec `lu = false`.

## Emails

```http
GET  /api/mail/status
GET  /api/mail/messages
POST /api/mail/send
POST /api/mail/notify-team
```

Body email:

```json
{
  "to": "client@example.com",
  "subject": "Sujet",
  "message": "Message"
}
```
