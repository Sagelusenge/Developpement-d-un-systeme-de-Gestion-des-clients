# Documentation API Mobile - Quincaillerie Centrale

Ce document sert de guide complet pour developper l'application mobile.

## Variables d'environnement frontend

Le frontend Vite lit les variables qui commencent par `VITE_`.

Fichier a creer cote frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Pour la production Render:

```env
VITE_API_URL=https://developpement-d-un-systeme-de-gestion.onrender.com/api
```

Notes:
- En local, le backend tourne par defaut sur `http://localhost:5000`.
- Dans le code frontend, `VITE_API_URL` doit contenir le prefixe `/api`.
- Si `VITE_API_URL` n'est pas defini, le frontend utilise `/api`.
- Ne jamais mettre de token JWT dans `.env`. Le token vient de `POST /api/auth/login`.

## Configuration mobile

Base URL locale:

```text
http://localhost:5000/api
```

Base URL production:

```text
https://developpement-d-un-systeme-de-gestion.onrender.com/api
```

Pour un telephone physique sur le meme reseau que le PC, remplacer `localhost` par l'adresse IP du PC:

```text
http://192.168.1.20:5000/api
```

## Headers communs

Tous les endpoints proteges exigent le JWT retourne par la connexion.

```http
Authorization: Bearer <TOKEN>
Content-Type: application/json
Accept: application/json
```

Les endpoints publics:
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/verify-reset-code`
- `POST /auth/reset-password`
- `POST /client-auth/login`
- `POST /client-auth/register`
- `POST /client-auth/verify-email`
- `POST /client-auth/resend-code`
- `POST /public/contact`

## Reponses d'erreur standards

Token manquant:

```json
{
  "success": false,
  "message": "Acces refuse. Token manquant."
}
```

Token invalide ou expire:

```json
{
  "success": false,
  "message": "Token invalide ou expire."
}
```

Role interdit:

```json
{
  "success": false,
  "message": "Acces refuse"
}
```

Validation:

```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

Erreur serveur:

```json
{
  "success": false,
  "message": "Message technique retourne par le serveur"
}
```

## Roles

```text
manager     Supervision, clients, utilisateurs, rapports, commandes et reclamations. Consulte les ventes et paiements sans les creer.
vendeur    Clients, creation des ventes, conversion des commandes, paiements, certains rapports, consultation produits.
magasinier  Produits, categories, fournisseurs, stock, certains rapports.
client      Catalogue, commandes personnelles, achats, factures, profil et reclamations personnelles.
```

---

# Authentification

## Connexion

```http
POST /auth/login
```

Body:

```json
{
  "email": "sage.kitsa@example.com",
  "password": "motdepasse"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Connexion reussie",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USR-00001",
    "nom": "KITSA LUSENGE Sage",
    "email": "sage.kitsa@example.com",
    "telephone": "+243990000000",
    "role": "manager",
    "entreprise_id": "ENT-00001",
    "entreprise_nom": "Quincaillerie Centrale",
    "type": "utilisateur"
  }
}
```

Erreurs:
- 400 si email ou mot de passe absent.
- 401 si identifiants incorrects.
- 403 si abonnement suspendu.

## Demander recuperation de mot de passe

```http
POST /auth/forgot-password
```

Body:

```json
{
  "email": "vendeur@example.com"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Code de recuperation envoye par email."
}
```

Le code contient 6 chiffres et expire apres 15 minutes.

## Verifier le code de recuperation

```http
POST /auth/verify-reset-code
```

Body:

```json
{
  "email": "vendeur@example.com",
  "code": "483921"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Code confirme. Vous pouvez definir un nouveau mot de passe."
}
```

## Definir le nouveau mot de passe

```http
POST /auth/reset-password
```

Body:

```json
{
  "email": "vendeur@example.com",
  "code": "483921",
  "new_password": "NouveauPass1",
  "confirm_password": "NouveauPass1"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Mot de passe reinitialise. Vous pouvez vous connecter."
}
```

## Profil connecte

```http
GET /auth/me
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "user": {
    "id_utilisateur": "USR-00001",
    "nom": "KITSA LUSENGE Sage",
    "email": "sage.kitsa@example.com",
    "telephone": "+243990000000",
    "role": "manager",
    "entreprise_id": "ENT-00001",
    "entreprise_nom": "Quincaillerie Centrale"
  }
}
```

## Modifier son profil

```http
PUT /auth/profile
```

Body:

```json
{
  "nom": "KITSA LUSENGE Sage",
  "telephone": "+243990000000"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Profil mis a jour",
  "user": {
    "id_utilisateur": "USR-00001",
    "id": "USR-00001",
    "nom": "KITSA LUSENGE Sage",
    "email": "sage.kitsa@example.com",
    "telephone": "+243990000000",
    "role": "manager",
    "entreprise_id": "ENT-00001",
    "entreprise_nom": "Quincaillerie Centrale",
    "type": "utilisateur"
  }
}
```

## Changer son mot de passe

```http
POST /auth/change-password
```

Body:

```json
{
  "new_password": "nouveau123"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Mot de passe mis a jour"
}
```

## Reinitialiser le mot de passe d'un utilisateur

Reserve au manager.

```http
POST /auth/reset-request-password
```

Body:

```json
{
  "email": "vendeur@example.com",
  "new_password": "temporaire123"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Mot de passe reinitialise pour vendeur@example.com."
}
```

---

# Clients

Roles: `manager`, `vendeur` pour lecture/creation. Modification/suppression: `manager`.

## Lister les clients

```http
GET /clients
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_client": "CLI-00001",
      "nom": "Meshe",
      "postnom": "Munihire",
      "telephone": "+243990000001",
      "entreprise_id": "ENT-00001",
      "nombre_achats": 3,
      "ca_total": 390.5
    }
  ]
}
```

## Detail et historique client

```http
GET /clients/:id
```

Exemple:

```http
GET /clients/CLI-00001
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": {
    "client": {
      "id_client": "CLI-00001",
      "nom": "Meshe",
      "postnom": "Munihire",
      "telephone": "+243990000001",
      "entreprise_id": "ENT-00001"
    },
    "historique": [
      {
        "numero_facture": "FAC-000001",
        "date_vente": "2026-06-11T10:00:00.000Z",
        "montant_ttc": 150.8,
        "total_paye": 100,
        "reste": 50.8
      }
    ]
  }
}
```

## Creer un client

```http
POST /clients
```

Body:

```json
{
  "nom": "Meshe",
  "postnom": "Munihire",
  "telephone": "+243990000001"
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Client cree avec succes",
  "data": {
    "id_client": "CLI-00001",
    "nom": "Meshe",
    "postnom": "Munihire",
    "telephone": "+243990000001",
    "entreprise_id": "ENT-00001"
  }
}
```

## Modifier un client

```http
PUT /clients/:id
```

Body:

```json
{
  "nom": "Meshe",
  "postnom": "Munihire",
  "telephone": "+243990000002"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Client mis a jour"
}
```

## Supprimer un client

```http
DELETE /clients/:id
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "message": "Client supprime"
}
```

---

# Categories

Roles: lecture `manager`, `vendeur`, `magasinier`; creation/modification/suppression `magasinier` uniquement.

## Lister les categories

```http
GET /categories
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_categorie": "CAT-1710000000000-ENT-0000",
      "entreprise_id": "ENT-00001",
      "reference_categorie": "CAT-CIMENT-00001",
      "nom": "Ciment",
      "description": "Ciments et materiaux de construction",
      "photo_url": null,
      "created_at": "2026-06-11T10:00:00.000Z",
      "total_produits": 4
    }
  ]
}
```

## Creer une categorie

```http
POST /categories
```

Body:

```json
{
  "reference_categorie": "CAT-CIMENT",
  "nom": "Ciment",
  "description": "Ciments et materiaux de construction",
  "photo_url": "https://exemple.com/ciment.jpg"
}
```

`reference_categorie` est optionnelle. Si elle est vide, le backend la genere.

Reponse 201:

```json
{
  "success": true,
  "message": "Categorie creee",
  "data": {
    "id_categorie": "CAT-1710000000000-ENT-0000",
    "reference_categorie": "CAT-CIMENT",
    "nom": "Ciment",
    "description": "Ciments et materiaux de construction",
    "photo_url": "https://exemple.com/ciment.jpg"
  }
}
```

## Modifier une categorie

```http
PUT /categories/:id
```

Body:

```json
{
  "reference_categorie": "CAT-CIMENT",
  "nom": "Ciment gris",
  "description": "Ciments gris et blancs",
  "photo_url": null
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Categorie mise a jour"
}
```

## Supprimer une categorie

```http
DELETE /categories/:id
```

Body: aucun.

Effet: les produits de cette categorie gardent le produit mais `categorie_id` devient `null`.

Reponse 200:

```json
{
  "success": true,
  "message": "Categorie supprimee"
}
```

---

# Produits et stock

Roles: lecture `manager`, `vendeur`, `magasinier`; creation/modification/approvisionnement/suppression `magasinier` uniquement.

Unites conseillees:

```text
piece, kilogramme, gramme, carton, sac, litre, metre, paquet
```

## Lister les produits

```http
GET /produits
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRD-00001",
      "reference_produit": "CIM-42",
      "nom": "Ciment gris 42.5",
      "categorie_id": "CAT-DEMO-CIMENT",
      "categorie_nom": "Ciment",
      "unite": "sac",
      "prix_ht": 20,
      "prix_achat": 15,
      "taux_tva": 16,
      "quantite_stock": 65,
      "seuil_alerte": 15,
      "photo_url": null,
      "entreprise_id": "ENT-00001",
      "statut_stock": "OK"
    }
  ]
}
```

`statut_stock` vaut:
- `OK`
- `ALERTE`
- `RUPTURE`

## Mouvements recents de stock

```http
GET /produits/mouvements-recents
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_mouvement": "MVT-000001",
      "type_mouvement": "entree",
      "quantite": 20,
      "date_mouvement": "2026-06-11T10:00:00.000Z",
      "prix_achat_unitaire": 15,
      "prix_achat_total": 300,
      "note": "Livraison fournisseur",
      "produit_nom": "Ciment gris 42.5",
      "reference_produit": "CIM-42",
      "fournisseur_nom": "Fournisseur Central"
    }
  ]
}
```

## Creer un produit

```http
POST /produits
```

Body:

```json
{
  "nom": "Ciment gris 42.5",
  "categorie_id": "CAT-DEMO-CIMENT",
  "unite": "sac",
  "photo_url": null,
  "prix_ht": 20,
  "taux_tva": 16,
  "quantite_stock": 10,
  "seuil_alerte": 5
}
```

Notes:
- `reference_produit` n'est pas envoyee dans le body. Le backend genere toujours la reference automatiquement.
- `categorie_id` peut etre `null` ou chaine vide.
- `unite` vaut `piece` par defaut.

Reponse 201:

```json
{
  "success": true,
  "message": "Produit cree avec succes",
  "data": {
    "id_produit": "PRD-00001",
    "reference_produit": "CIM-42"
  }
}
```

## Modifier un produit

```http
PUT /produits/:id
```

Body:

```json
{
  "nom": "Ciment gris 42.5",
  "categorie_id": "CAT-DEMO-CIMENT",
  "unite": "sac",
  "photo_url": null,
  "prix_ht": 21,
  "taux_tva": 16,
  "seuil_alerte": 8
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Produit mis a jour"
}
```

## Supprimer un produit

```http
DELETE /produits/:id
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "message": "Produit supprime"
}
```

## Approvisionner un produit

```http
POST /produits/:id/approvisionner
```

Body:

```json
{
  "quantite": 20,
  "fournisseur_id": "FOU-1710000000000-ENT-0000",
  "prix_achat": 15,
  "note": "Livraison du 11/06/2026"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Stock mis a jour (+20 unites)",
  "data": {
    "prix_achat_unitaire": 15,
    "prix_achat_total": 300,
    "cout_moyen_pondere": 15.25,
    "stock_apres_achat": 85
  }
}
```

---

# Fournisseurs

Roles: lecture `manager`, `magasinier`, `vendeur`; creation/modification/suppression `magasinier` uniquement.

## Lister les fournisseurs

```http
GET /fournisseurs
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_fournisseur": "FOU-1710000000000-ENT-0000",
      "entreprise_id": "ENT-00001",
      "nom": "Fournisseur Central",
      "telephone": "+243990000003",
      "email": "contact@fournisseur.cd",
      "adresse": "Lubumbashi",
      "created_at": "2026-06-11T10:00:00.000Z",
      "total_approvisionnements": 4
    }
  ]
}
```

## Creer un fournisseur

```http
POST /fournisseurs
```

Body:

```json
{
  "nom": "Fournisseur Central",
  "telephone": "+243990000003",
  "email": "contact@fournisseur.cd",
  "adresse": "Lubumbashi"
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Fournisseur ajoute",
  "data": {
    "id_fournisseur": "FOU-1710000000000-ENT-0000"
  }
}
```

## Modifier un fournisseur

```http
PUT /fournisseurs/:id
```

Body:

```json
{
  "nom": "Fournisseur Central SARL",
  "telephone": "+243990000004",
  "email": "contact@fournisseur.cd",
  "adresse": "Kinshasa"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Fournisseur mis a jour"
}
```

## Supprimer un fournisseur

```http
DELETE /fournisseurs/:id
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "message": "Fournisseur supprime"
}
```

Erreur possible si le fournisseur a deja des approvisionnements:

```json
{
  "success": false,
  "message": "Ce fournisseur a deja des approvisionnements. Vous pouvez le laisser comme archive."
}
```

---

# Ventes et factures

Roles: lecture `manager`, `vendeur`; creation/modification `vendeur`; suppression exceptionnelle `manager`.

TVA appliquee par le backend pour les ventes: `16%`.

## Lister les factures

```http
GET /ventes
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_ventes": "FAC-000001",
      "numero_facture": "FAC-000001",
      "client_id": "CLI-00001",
      "entreprise_id": "ENT-00001",
      "montant_ttc": 150.8,
      "date_vente": "2026-06-11T10:00:00.000Z",
      "client_nom": "Meshe",
      "total_paye": 100,
      "reste_a_payer": 50.8
    }
  ]
}
```

## Detail d'une facture

```http
GET /ventes/:id
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": {
    "id_ventes": "FAC-000001",
    "numero_facture": "FAC-000001",
    "client_id": "CLI-00001",
    "client_nom": "Meshe",
    "client_tel": "+243990000001",
    "entreprise_nom": "Quincaillerie Centrale",
    "ville": "Lubumbashi",
    "montant_ttc": 150.8,
    "date_vente": "2026-06-11T10:00:00.000Z",
    "lignes": [
      {
        "id_lignes_ventes": "LVT-000001",
        "vente_id": "FAC-000001",
        "produit_id": "PRD-00001",
        "quantite": 2,
        "prix_unitaire_ht": 65,
        "prix_achat_unitaire": 45,
        "produit_nom": "Bois",
        "total_ht": 130,
        "cout_total": 90,
        "resultat_ligne_ht": 40,
        "total_ttc": 150.8
      }
    ],
    "paiements": [
      {
        "id_paiement": "PAY-00001",
        "vente_id": "FAC-000001",
        "montant": 100,
        "mode_paiement": "especes",
        "reference_externe": null,
        "telephone_payeur": null,
        "date_paiement": "2026-06-11T10:05:00.000Z"
      }
    ]
  }
}
```

## Creer une vente

```http
POST /ventes
```

Body:

```json
{
  "client_id": "CLI-00001",
  "articles": [
    {
      "produit_id": "PRD-00001",
      "quantite": 2,
      "prix": 65
    }
  ]
}
```

Notes:
- `prix` est optionnel. Si absent, le backend utilise `prix_ht` du produit.
- `quantite` doit etre positive.
- Le stock est diminue automatiquement.
- Le backend refuse si le stock est insuffisant.

Reponse 201:

```json
{
  "success": true,
  "message": "Vente enregistree avec succes",
  "facture": "FAC-000001",
  "id": "FAC-000001"
}
```

## Modifier une vente

```http
PUT /ventes/:id
```

Body:

```json
{
  "client_id": "CLI-00001",
  "articles": [
    {
      "produit_id": "PRD-00002",
      "quantite": 1,
      "prix": 120
    }
  ]
}
```

Notes:
- Impossible si la facture a deja un paiement.
- Le backend restaure l'ancien stock, remplace les lignes puis diminue le nouveau stock.

Reponse 200:

```json
{
  "success": true,
  "message": "Facture mise a jour"
}
```

## Supprimer une vente

```http
DELETE /ventes/:id
```

Body: aucun.

Notes:
- Impossible si la facture a deja un paiement.
- Le stock des lignes est restaure.

Reponse 200:

```json
{
  "success": true,
  "message": "Facture supprimee"
}
```

---

# Paiements

Roles: consultation `manager`, `vendeur`; enregistrement d'un paiement `vendeur` uniquement.

Modes acceptes:

```text
especes, carte, virement, mobile_money
```

Pour `mobile_money`, `reference_externe` et `telephone_payeur` sont obligatoires.

## Enregistrer un paiement

```http
POST /paiements
```

Body especes:

```json
{
  "vente_id": "FAC-000001",
  "montant": 100,
  "mode_paiement": "especes"
}
```

Body mobile money:

```json
{
  "vente_id": "FAC-000001",
  "montant": 100,
  "mode_paiement": "mobile_money",
  "reference_externe": "MPESA-123456",
  "telephone_payeur": "+243990000001"
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Paiement de 100 USD enregistre (especes)",
  "data": {
    "id_paiement": "PAY-00001"
  }
}
```

Erreur si paiement superieur au reste:

```json
{
  "success": false,
  "message": "Le paiement depasse le reste a payer (50.80 USD)."
}
```

## Rapport caisse

```http
GET /paiements/rapport-caisse
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "Date": "2026-06-11",
      "Mode_Paiement": "especes",
      "Nombre_Transactions": 4,
      "Total_Encaisse": 500
    }
  ]
}
```

## Repartition des paiements

```http
GET /paiements/repartition
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "mode_paiement": "especes",
      "transactions": 4,
      "total": 500
    }
  ]
}
```

---

# Dashboard

## Statistiques generales

Roles: `manager`, `vendeur`, `magasinier`.

```http
GET /dashboard/stats
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": {
    "total_clients": 150,
    "alertes_stock": 5,
    "ca_mois_en_cours": 4500.5,
    "ventes_ht_mois": 3880,
    "cout_achat_mois": 2500,
    "resultat_mois": 1380,
    "argent_recu_mois": 4500.5,
    "total_creances": 1200,
    "total_valeur_stock": 25000.50,
    "clients_variation_pct": 3.2,
    "ca_variation_pct": 5.2,
    "creances_variation_pct": -2.4
  }
}
```

Notes de calcul:

- `ca_mois_en_cours`: total TTC des factures du mois.
- `argent_recu_mois`: paiements encaisses pendant le mois.
- `ventes_ht_mois`: total HT des lignes vendues pendant le mois.
- `cout_achat_mois`: cout d'achat des produits vendus.
- `resultat_mois`: `ventes_ht_mois - cout_achat_mois`.
- Une facture totalement payee peut faire que `ca_mois_en_cours` et `argent_recu_mois` soient identiques. Le gain reste different, car il depend du cout d'achat.

## Ventes mensuelles

Roles: `manager`, `vendeur`.

```http
GET /dashboard/ventes-mensuelles
```

Body: aucun.

Reponse 200, sur les 6 derniers mois:

```json
{
  "success": true,
  "data": [
    { "mois": "Jan", "total": 0 },
    { "mois": "Fev", "total": 300 }
  ]
}
```

## Alertes stock

Roles: `manager`, `magasinier`.

```http
GET /dashboard/alertes-stock
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRD-00001",
      "nom": "Ciment gris 42.5",
      "quantite_stock": 4,
      "seuil_alerte": 5
    }
  ]
}
```

## Produits plus vendus

Roles: `manager`, `vendeur`, `magasinier`.

```http
GET /dashboard/produits-plus-vendus
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRD-00001",
      "nom": "Ciment gris 42.5",
      "reference_produit": "CIM-42",
      "quantite_vendue": 20,
      "total_ht": 400
    }
  ]
}
```

## Resultat mensuel

Roles: `manager`, `vendeur`.

```http
GET /dashboard/resultat-mensuel
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "mois": "Jan",
      "ventes_ht": 0,
      "cout_achat": 0,
      "resultat": 0
    }
  ]
}
```

---

# Rapports

Tous les rapports acceptent optionnellement:

```http
?date_debut=2026-06-01&date_fin=2026-06-30
```

## Rapport factures

Roles: `manager`, `vendeur`.

```http
GET /rapports/factures
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_ventes": "FAC-000001",
      "numero_facture": "FAC-000001",
      "date_vente": "2026-06-11T10:00:00.000Z",
      "montant_ttc": 150.8,
      "id_client": "CLI-00001",
      "client_nom": "Meshe",
      "client_postnom": "Munihire",
      "total_paye": 100,
      "reste_a_payer": 50.8
    }
  ]
}
```

## Creances

Roles: `manager`, `vendeur`.

```http
GET /rapports/creances
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "numero_facture": "FAC-000001",
      "date_vente": "2026-06-11T10:00:00.000Z",
      "client_nom": "Meshe",
      "montant_du": 150.8,
      "montant_paye": 100,
      "reste_a_payer": 50.8
    }
  ]
}
```

## Stock inventaire

Roles: `manager`, `magasinier`, `vendeur`.

```http
GET /rapports/stock-inventaire
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRD-00001",
      "reference_produit": "CIM-42",
      "nom": "Ciment gris 42.5",
      "prix_ht": 20,
      "quantite_stock": 65,
      "seuil_alerte": 15,
      "valeur_stock_ht": 1300,
      "statut": "OK"
    }
  ]
}
```

## Top acheteurs

Roles: `manager`, `vendeur`, `magasinier`.

```http
GET /rapports/top-acheteurs
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_client": "CLI-00001",
      "nom": "Meshe",
      "postnom": "Munihire",
      "nombre_achats": 3,
      "ca_total": 390.5,
      "derniere_visite": "2026-06-11T10:00:00.000Z"
    }
  ]
}
```

## Historique client

Roles: `manager`, `vendeur`.

```http
GET /rapports/historique-client/:id
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "numero_facture": "FAC-000001",
      "date_vente": "2026-06-11T10:00:00.000Z",
      "produit_nom": "Bois",
      "quantite": 2,
      "prix_unitaire_ht": 65,
      "total_ttc": 150.8
    }
  ]
}
```

## Bilan financier

Roles: `manager`, `vendeur`.

```http
GET /rapports/bilan
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": {
    "ventes_ht": 5000,
    "cout_achat": 3000,
    "resultat": 2000,
    "total_factures": 15
  }
}
```

## Journal

Roles: `manager`, `vendeur`.

```http
GET /rapports/journal
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "date_operation": "2026-06-11T10:00:00.000Z",
      "reference": "FAC-000001",
      "libelle": "Meshe",
      "entree": 150.8,
      "sortie": 0,
      "type_operation": "Facture"
    }
  ]
}
```

## Livre de caisse

Roles: `manager`, `vendeur`.

```http
GET /rapports/livre-caisse
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "date_paiement": "2026-06-11T10:05:00.000Z",
      "numero_facture": "FAC-000001",
      "client_nom": "Meshe",
      "mode_paiement": "especes",
      "montant": 100,
      "reference_externe": null
    }
  ]
}
```

---

# Utilisateurs

Role: `manager`.

## Lister les utilisateurs

```http
GET /utilisateurs
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_utilisateur": "USR-00001",
      "nom": "KITSA LUSENGE Sage",
      "email": "sage.kitsa@example.com",
      "role": "manager",
      "actif": 1
    }
  ]
}
```

## Creer un utilisateur

```http
POST /utilisateurs
```

Body:

```json
{
  "nom": "Vendeur Principal",
  "email": "vendeur@example.com",
  "mot_de_passe": "secret123",
  "role": "vendeur"
}
```

Roles valides: `manager`, `vendeur`, `magasinier`.

Reponse 201:

```json
{
  "success": true,
  "message": "Utilisateur Vendeur Principal cree avec le role vendeur",
  "data": {
    "id_utilisateur": "USR-00002",
    "nom": "Vendeur Principal",
    "email": "vendeur@example.com",
    "role": "vendeur"
  }
}
```

## Historique utilisateur

```http
GET /utilisateurs/:id/historique
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": {
    "utilisateur": {
      "id_utilisateur": "USR-00002",
      "nom": "Vendeur Principal",
      "email": "vendeur@example.com",
      "role": "vendeur",
      "actif": 1
    },
    "historique": [
      {
        "id_log": 1,
        "user_id": "USR-00002",
        "user_name": "Vendeur Principal",
        "user_role": "vendeur",
        "action_type": "CREATE",
        "module": "ventes",
        "entity_id": "FAC-000001",
        "description": "Creation facture",
        "metadata": null,
        "created_at": "2026-06-11T10:00:00.000Z"
      }
    ]
  }
}
```

## Modifier un utilisateur

```http
PUT /utilisateurs/:id
```

Body sans changement mot de passe:

```json
{
  "nom": "Vendeur Principal",
  "email": "vendeur@example.com",
  "role": "vendeur"
}
```

Body avec changement mot de passe:

```json
{
  "nom": "Vendeur Principal",
  "email": "vendeur@example.com",
  "role": "vendeur",
  "mot_de_passe": "nouveau123"
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Utilisateur mis a jour"
}
```

## Activer ou suspendre un utilisateur

```http
PUT /utilisateurs/:id/toggle
```

Body: aucun.

Reponse 200 si l'utilisateur etait actif:

```json
{
  "success": true,
  "message": "Utilisateur suspendu. Il ne peut plus se connecter."
}
```

Reponse 200 si l'utilisateur etait suspendu:

```json
{
  "success": true,
  "message": "Utilisateur reactive. Il peut se connecter."
}
```

## Supprimer un utilisateur

```http
DELETE /utilisateurs/:id
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "message": "Utilisateur supprime"
}
```

Notes:
- Un utilisateur ne peut pas supprimer son propre compte.
- Un manager ne peut pas supprimer un autre manager.

---

# Notifications

Endpoint protege par JWT.

## Lister les notifications

```http
GET /notifications
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_notification": 1,
      "recipient_type": "user",
      "recipient_user_id": "USR-00001",
      "entreprise_id": "ENT-00001",
      "titre": "Demande de recuperation de mot de passe",
      "message": "Un utilisateur demande la recuperation.",
      "lu": 0,
      "created_at": "2026-06-11T10:00:00.000Z"
    }
  ]
}
```

## Marquer une notification comme lue

```http
PUT /notifications/:id/read
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "message": "Notification lue"
}
```

---

# Emails

Endpoint protege par JWT. L'envoi et la consultation des messages sont reserves au `manager`.

## Statut email

```http
GET /mail/status
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": {
    "ready": true,
    "sender": "sage.kitsa@example.com"
  }
}
```

## Historique des emails/messages

Role: `manager`.

```http
GET /mail/messages
```

Body: aucun.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_mail": 1,
      "sender_email": "sage.kitsa@example.com",
      "to_email": "client@example.com",
      "subject": "Facture",
      "message": "Bonjour...",
      "status": "envoye",
      "created_at": "2026-06-11T10:00:00.000Z"
    }
  ]
}
```

## Envoyer un email

Role: `manager`.

```http
POST /mail/send
```

Body:

```json
{
  "to": "client@example.com",
  "subject": "Votre facture",
  "message": "Bonjour, veuillez trouver votre facture."
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Email envoye",
  "data": {
    "success": true
  }
}
```

Erreur si le service mail n'est pas configure:

```json
{
  "success": false,
  "message": "Service email non configure"
}
```

## Envoyer une notification interne a toute l'equipe

Role: `manager`.

```http
POST /mail/notify-team
```

Body:

```json
{
  "subject": "Inventaire",
  "message": "Inventaire prevu demain a 08h00."
}
```

Reponse 200:

```json
{
  "success": true,
  "message": "Notification envoyee a 3 utilisateur(s).",
  "data": {
    "recipients": 3
  }
}
```

---

# Espace client mobile

Le mobile utilise une connexion unique. Il ne doit jamais demander a l'utilisateur de choisir entre `client` et `equipe`: le backend detecte le type de compte a partir de l'email et du mot de passe.

## Inscription client - demander le code

```http
POST /client-auth/register
```

Endpoint public. Le mot de passe doit avoir au moins 8 caracteres, une majuscule, une minuscule et un chiffre.

Body:

```json
{
  "nom": "Sage",
  "postnom": "Lusenge",
  "telephone": "+243970000000",
  "email": "sage@gmail.com",
  "password": "ClientPro1"
}
```

## Soumettre un paiement Mobile Money depuis l'espace client

Le client transmet la reference recue de l'operateur. La somme reste au statut `en_attente` et n'est pas ajoutee aux encaissements avant verification. Operateurs: `mpesa`, `airtel_money`, `orange_money`.

```http
POST /paiements/mobile-money/client
Authorization: Bearer <token_client>
Content-Type: application/json
```

```json
{
  "vente_id": "FAC-2026-00003",
  "operateur": "mpesa",
  "telephone_payeur": "+243990000001",
  "montant": 120.00,
  "reference_externe": "MP240621ABC"
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Paiement Mobile Money recu et en cours de verification.",
  "data": { "id_demande": "MOB-000001", "statut": "en_attente" }
}
```

Une reference deja utilisee, une facture appartenant a un autre client ou un montant superieur au solde est refuse.

Traitement par l'equipe:

```http
GET /paiements/mobile-money/demandes
PUT /paiements/mobile-money/demandes/MOB-000001
```

Body de decision (vendeur):

```json
{ "statut": "confirmee" }
```

Valeurs: `confirmee` ou `rejetee`. Une confirmation cree le paiement `mobile_money`; un manager peut consulter les demandes mais seul le vendeur peut les valider.

Si `reference_externe` est vide et que le prestataire est configure, le backend lance automatiquement la demande sur le telephone. Une confirmation immediate retourne:

```json
{
  "success": true,
  "message": "Paiement Mobile Money confirme automatiquement.",
  "data": { "id_demande": "MOB-000001", "statut": "confirmee" }
}
```

Sans prestataire configure, le serveur retourne 503 et demande une reference de transfert manuel.

Reponse 201:

```json
{
  "success": true,
  "message": "Un code de confirmation a ete envoye a votre adresse email.",
  "email": "sage@gmail.com"
}
```

Erreurs principales: `400` donnees invalides, `409` email deja utilise, `429` nouvelle demande en moins d'une minute, `503` service email non configure.

## Confirmer l'adresse email

```http
POST /client-auth/verify-email
```

Body:

```json
{
  "email": "sage@gmail.com",
  "code": "483921"
}
```

Reponse 201. Le mobile doit enregistrer `token`, `user` et ouvrir directement l'espace client:

```json
{
  "success": true,
  "message": "Votre adresse email est confirmee. Bienvenue !",
  "token": "JWT_TOKEN",
  "user": {
    "id": "CLI-00042",
    "id_client": "CLI-00042",
    "nom": "Sage",
    "postnom": "Lusenge",
    "email": "sage@gmail.com",
    "telephone": "+243970000000",
    "role": "client",
    "entreprise_id": "ENT-00001",
    "entreprise_nom": "Quincaillerie Centrale",
    "type": "client"
  }
}
```

## Renvoyer le code d'inscription

```http
POST /client-auth/resend-code
```

Body:

```json
{ "email": "sage@gmail.com" }
```

Reponse 200:

```json
{ "success": true, "message": "Un nouveau code vient de vous etre envoye." }
```

## Connexion unique equipe/client

```http
POST /auth/login
```

Body identique pour tous les roles:

```json
{
  "email": "sage@gmail.com",
  "password": "ClientPro1"
}
```

La reponse contient `user.role` egal a `manager`, `vendeur`, `magasinier` ou `client`. La navigation mobile doit etre construite a partir de cette valeur.

## Profil client

```http
GET /client-auth/me
PUT /client-auth/profile
POST /client-auth/change-password
```

Body de modification du profil:

```json
{
  "nom": "Sage Lusenge",
  "telephone": "+243970000001"
}
```

Body de changement du mot de passe:

```json
{ "new_password": "NouveauClient1" }
```

Reponse standard:

```json
{ "success": true, "message": "Mot de passe client mis a jour." }
```

## Catalogue client securise

```http
GET /commandes/catalogue
```

Le catalogue retourne uniquement les produits en stock dont le prix de vente couvre le cout d'achat. `prix_ht` est le prix de vente unitaire hors taxe. Le mobile ne doit jamais utiliser `prix_achat` pour calculer une commande.

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRD-00012",
      "reference_produit": "BARRE-12",
      "nom": "Barre de fer 12mm",
      "unite": "piece",
      "prix_ht": 123,
      "taux_tva": 16,
      "quantite_stock": 25,
      "photo_url": null,
      "categorie_nom": "Fer"
    }
  ]
}
```

Calcul d'affichage: `total_ttc = prix_ht x quantite x 1.16`. Exemple reel corrige: `123 x 5 x 1.16 = 713.40 USD`.

## Creer une commande

```http
POST /commandes
```

Body:

```json
{
  "note_client": "Je passerai recuperer la commande au magasin.",
  "articles": [
    { "produit_id": "PRD-00012", "quantite": 5 }
  ]
}
```

Le backend relit toujours le prix de vente catalogue. Il refuse le stock insuffisant et tout produit dont `prix_ht < prix_achat`.

Reponse 201:

```json
{
  "success": true,
  "message": "Commande envoyee.",
  "id": "CMD-000003"
}
```

## Lister et suivre les commandes

```http
GET /commandes
```

Pour un client, seules ses commandes sont retournees. Pour un manager ou vendeur, toutes les commandes de l'entreprise sont retournees.

```json
{
  "success": true,
  "data": [
    {
      "id_commande": "CMD-000003",
      "client_id": "CLI-00042",
      "statut": "en_attente",
      "montant_ttc": 713.4,
      "vente_id": null,
      "numero_facture": null,
      "date_commande": "2026-06-20T10:30:00.000Z",
      "lignes": [
        {
          "produit_id": "PRD-00012",
          "produit_nom": "Barre de fer 12mm",
          "quantite": 5,
          "prix_unitaire_ht": 123
        }
      ]
    }
  ]
}
```

Statuts: `en_attente`, `confirmee`, `preparee`, `livree`, `annulee`, `rejetee`.

## Modifier le statut d'une commande

Roles: manager ou vendeur.

```http
PUT /commandes/:id/statut
```

```json
{ "statut": "preparee" }
```

Reponse 200:

```json
{ "success": true, "message": "Statut de la commande mis a jour." }
```

## Convertir une commande en facture

Role: vendeur uniquement.

```http
POST /commandes/:id/convertir
```

Body: objet vide `{}`.

```json
{
  "success": true,
  "message": "Commande convertie en facture FAC-2026-00042.",
  "facture": "FAC-2026-00042"
}
```

La conversion conserve le prix de vente enregistre dans la commande et recontrole qu'il n'est pas inferieur au cout d'achat actuel.

## Achats et factures du client

```http
GET /commandes/achats
```

```json
{
  "success": true,
  "data": [
    {
      "id_ventes": "FAC-2026-00042",
      "numero_facture": "FAC-2026-00042",
      "montant_ttc": 713.4,
      "date_vente": "2026-06-20T11:00:00.000Z",
      "total_paye": 50,
      "reste_a_payer": 42.8
    }
  ]
}
```

## Reclamations

```http
GET /reclamations
POST /reclamations
PUT /reclamations/:id
```

Creation par le client:

```json
{
  "sujet": "Article manquant",
  "message": "Il manque une piece dans ma commande.",
  "commande_id": "CMD-000003",
  "vente_id": null
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Reclamation envoyee au manager.",
  "id": "REC-000008"
}
```

Traitement par le manager:

```json
{
  "statut": "en_cours",
  "reponse": "Nous verifions la preparation de votre commande."
}
```

Statuts: `ouverte`, `en_cours`, `resolue`, `cloturee`.

# Chat client, assistant automatique et manager

Les messages sont conserves dans la base comme une messagerie. L'assistant repond automatiquement aux salutations et questions frequentes. Une question non reconnue passe la conversation au statut `en_attente_manager` et notifie le manager.

Avant l'appel IA, le backend normalise plusieurs fautes usuelles. Exemples: `bonhour` devient `bonjour`, `paoement` devient `paiement` et `commade` devient `commande`. Les intentions connues restent donc disponibles lorsque OpenAI n'est pas configure ou temporairement indisponible.

## Flux temps reel

```http
GET /chat/stream?token=<JWT_URL_ENCODE>
Accept: text/event-stream
```

Le serveur envoie un evenement `chat-update` immediatement apres l'enregistrement d'un message:

```text
event: chat-update
data: {"conversation_id":"CHAT-000001","sender_type":"manager"}
```

A la reception, l'application mobile rappelle `GET /chat` en arriere-plan, sans afficher de page de chargement. Elle doit aussi afficher le message sortant de facon optimiste des le clic sur Envoyer.

## Analyse IA manager

```http
GET /chat/manager-analysis
Authorization: Bearer <token_manager>
```

Reponse 200:

```json
{
  "success": true,
  "data": {
    "analysis": "Constats et actions prioritaires...",
    "generated_at": "2026-06-21T18:00:00.000Z"
  }
}
```

Reponse 503 si `OPENAI_API_KEY` n'est pas configuree. La cle ne doit jamais etre envoyee par l'application mobile.

## Lister les conversations

```http
GET /chat
```

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_conversation": "CHAT-000001",
      "client_id": "CLI-00042",
      "client_nom": "Sage",
      "statut": "ouverte",
      "dernier_message": "Ou se trouve votre magasin ?",
      "messages": [
        {
          "id_message": "MSG-0000001",
          "sender_type": "client",
          "message": "Ou se trouve votre magasin ?",
          "created_at": "2026-06-21T08:00:00.000Z"
        },
        {
          "id_message": "MSG-0000002",
          "sender_type": "bot",
          "message": "Nous sommes sur l'Avenue du Commerce, quartier Murara, commune de Karisimbi a Goma.",
          "created_at": "2026-06-21T08:00:01.000Z"
        }
      ]
    }
  ]
}
```

## Envoyer un message

```http
POST /chat/messages
```

Premier message client (la conversation est creee automatiquement):

```json
{ "message": "Quel est le statut de ma commande CMD-000003 ?" }
```

Message suivant ou reponse manager:

```json
{
  "conversation_id": "CHAT-000001",
  "message": "Votre commande est en preparation."
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Reponse automatique envoyee.",
  "conversation_id": "CHAT-000001",
  "automatic_reply": "Ouvrez la rubrique Commandes pour voir le statut exact..."
}
```

# Notifications avec navigation

`GET /notifications` retourne maintenant `entity_type` et `entity_id`.

```json
{
  "id_notification": 51,
  "titre": "Nouvelle commande client",
  "message": "Sage a envoye la commande CMD-000003.",
  "entity_type": "commande",
  "entity_id": "CMD-000003",
  "lu": 0,
  "created_at": "2026-06-21T08:00:00.000Z"
}
```

Correspondance mobile:
- `commande` ouvre la page Commandes filtree par `entity_id`;
- `reclamation` ouvre Reclamations;
- `chat` ouvre la conversation concernee.

Apres ouverture, appeler `PUT /notifications/:id/read` et retirer immediatement la notification de la liste locale.

# Commentaires du site public

Le formulaire public `POST /public/contact` stocke maintenant le message avant de notifier le manager.

```http
GET /public/contacts
Authorization: Bearer <token_manager>
```

Reponse 200:

```json
{
  "success": true,
  "data": [
    {
      "id_contact": 42,
      "nom": "Patrick Kalume",
      "email": "patrick@example.com",
      "sujet": "Demande de prix",
      "message": "Avez-vous du bois en stock ?",
      "statut": "nouveau",
      "created_at": "2026-06-22T08:00:00.000Z"
    }
  ]
}
```

```http
PUT /public/contacts/42
Authorization: Bearer <token_manager>
Content-Type: application/json
```

```json
{ "statut": "traite" }
```

Statuts autorises: `nouveau`, `lu`, `traite`.

# Matrice des permissions mise a jour

## Relance automatique du prospect sans achat

Cette fonction est executee par le backend et ne demande aucun appel mobile. Un client actif dont l'email a ete confirme, inscrit depuis au moins `PROSPECT_FOLLOWUP_HOURS` et sans vente recoit un seul email `prospect_discovery_v1`.

L'email contient trois produits respectant:

```text
quantite_stock > 0
prix_ht >= prix_achat
```

La table `prospect_email_campaigns` empeche les doublons avec une contrainte unique sur le client et la campagne. Valeur de test: `24`; valeur de production conseillee: `168`.

| Action | Manager | Vendeur | Magasinier | Client |
| --- | --- | --- | --- | --- |
| Consulter ventes/paiements | Oui | Oui | Non | Ses achats |
| Creer/modifier/supprimer une vente | Non | Oui | Non | Non |
| Enregistrer un paiement | Non | Oui | Non | Non |
| Creer/modifier stock, produits, categories, fournisseurs | Non | Non | Oui | Non |
| Superviser commandes | Oui | Oui | Non | Ses commandes |
| Convertir commande en facture | Non | Oui | Non | Non |
| Traiter reclamations | Oui | Non | Non | Creer/consulter |
| Repondre au chat humain | Oui | Non | Non | Envoyer/consulter |

---

# Resume rapide des endpoints

```text
POST   /auth/login
POST   /auth/forgot-password
GET    /auth/me
PUT    /auth/profile
POST   /auth/change-password
POST   /auth/reset-request-password

POST   /client-auth/register
POST   /client-auth/verify-email
POST   /client-auth/resend-code
POST   /client-auth/login
GET    /client-auth/me
PUT    /client-auth/profile
POST   /client-auth/change-password

GET    /commandes/catalogue
GET    /commandes/achats
GET    /commandes
POST   /commandes
PUT    /commandes/:id/statut
POST   /commandes/:id/convertir

GET    /reclamations
POST   /reclamations
PUT    /reclamations/:id

GET    /chat
POST   /chat/messages

POST   /public/contact

GET    /clients
GET    /clients/:id
POST   /clients
PUT    /clients/:id
DELETE /clients/:id

`GET /clients` contient aussi `segment_statut`: `prospect`, `nouveau`, `regulier`, `fidele` ou `vip`, calcule avec le nombre d'achats et le chiffre d'affaires.

GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id

GET    /produits
GET    /produits/mouvements-recents
POST   /produits
PUT    /produits/:id
DELETE /produits/:id
POST   /produits/:id/approvisionner

GET    /fournisseurs
POST   /fournisseurs
PUT    /fournisseurs/:id
DELETE /fournisseurs/:id

GET    /ventes
GET    /ventes/:id
POST   /ventes
PUT    /ventes/:id
DELETE /ventes/:id

POST   /paiements
GET    /paiements/rapport-caisse
GET    /paiements/repartition

GET    /dashboard/stats
GET    /dashboard/ventes-mensuelles
GET    /dashboard/alertes-stock
GET    /dashboard/produits-plus-vendus
GET    /dashboard/resultat-mensuel

GET    /rapports/factures
GET    /rapports/creances
GET    /rapports/stock-inventaire
GET    /rapports/top-acheteurs
GET    /rapports/historique-client/:id
GET    /rapports/bilan
GET    /rapports/journal
GET    /rapports/livre-caisse

GET    /utilisateurs
POST   /utilisateurs
GET    /utilisateurs/:id/historique
PUT    /utilisateurs/:id
PUT    /utilisateurs/:id/toggle
DELETE /utilisateurs/:id

GET    /notifications
PUT    /notifications/:id/read

GET    /mail/status
GET    /mail/messages
POST   /mail/send
POST   /mail/notify-team
```

## Emails automatiques du CRM

Ces emails sont declenches par le backend; l'application mobile n'a pas besoin d'appeler un endpoint dedie:

- inscription client: code de verification, puis email de bienvenue;
- commande creee: confirmation de reception au client;
- statut de commande modifie: notification email au client;
- commande convertie en facture: email indiquant la facture disponible;
- prospect sans achat: email unique apres `PROSPECT_FOLLOWUP_HOURS`;
- client inactif: relance apres `INACTIVE_CLIENT_EMAIL_DAYS`, basee sur les categories deja achetees;
- nouveau produit: email cible aux clients qui ont deja achete dans cette categorie.

Les tables `prospect_email_campaigns` et `crm_email_campaigns` evitent les doublons. Si SMTP n'est pas configure, les envois sont ignores sans bloquer l'action principale.

## Archivage documentaire mobile

Le manager mobile peut scanner une facture, un document administratif ou une preuve, puis l'envoyer au backend. Le document apparait ensuite dans Rapports > Archivage.

### Envoyer un document scanne

```http
POST /api/archives
Authorization: Bearer <token_manager>
Content-Type: application/json
```

Body:

```json
{
  "titre": "Facture fournisseur juin",
  "type_document": "facture_fournisseur",
  "description": "Document scanne depuis le mobile",
  "file_name": "facture-juin.jpg",
  "data_url": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Document archive.",
  "data": {
    "id_document": "ARC-000001",
    "file_url": "https://votre-api/uploads/archives/..."
  }
}
```

### Lister les archives

```http
GET /api/archives
Authorization: Bearer <token_manager_ou_vendeur>
```

Reponse:

```json
{
  "success": true,
  "data": [
    {
      "id_document": "ARC-000001",
      "titre": "Facture fournisseur juin",
      "type_document": "facture_fournisseur",
      "file_url": "https://votre-api/uploads/archives/...",
      "created_at": "2026-06-26T10:00:00.000Z"
    }
  ]
}
```

---

# ðŸ–¨ï¸ Impression

Ces endpoints sont utilisÃ©s pour rÃ©cupÃ©rer les donnÃ©es structurÃ©es nÃ©cessaires Ã  la gÃ©nÃ©ration de factures (PDF) ou de rapports imprimables.

## Impression d'une facture
`GET /api/ventes/:id` : Renvoie les dÃ©tails complets (Client, Articles, Totaux, Paiements).

## Impression d'un rapport
`GET /api/rapports/stock-inventaire` : Ã‰tat du stock avec quantitÃ©s et valeurs.
`GET /api/rapports/bilan` : RÃ©sumÃ© financier (Ventes, Achats, BÃ©nÃ©fice).
`GET /api/rapports/journal` : Journal des opÃ©rations.
`GET /api/rapports/livre-caisse` : Journal des encaissements.
`GET /api/rapports/creances` : Liste des dettes clients.
`GET /api/rapports/top-acheteurs` : Classement des clients.

