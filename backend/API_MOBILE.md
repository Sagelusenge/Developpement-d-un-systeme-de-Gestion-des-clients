# Documentation API Mobile - Quincaillerie Centrale

Base URL locale:
```txt
http://localhost:5000
```

Base URL Render:
```txt
https://developpement-d-un-systeme-de-gestion.onrender.com
```

Toutes les routes métier commencent par `/api`.

## Headers
Routes publiques: pas de token.
Routes protégées:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Authentification

### Login
`POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "sage.kitsa@quincaillerie-centrale.cd",
  "password": "12345678"
}
```
- **Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Connexion reussie",
  "token": "eyJhbG...",
  "user": {
    "id": "USR-00001",
    "nom": "Sage Kitsa",
    "email": "sage.kitsa@quincaillerie-centrale.cd",
    "telephone": "+243...",
    "role": "manager",
    "entreprise_id": "ENT-001",
    "entreprise_nom": "Quincaillerie Centrale",
    "type": "utilisateur"
  }
}
```

### Infos utilisateur connecté
`GET /api/auth/me`
- **Success Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id_utilisateur": "USR-00001",
    "nom": "Sage Kitsa",
    "email": "sage.kitsa@...",
    "telephone": "+243...",
    "role": "manager",
    "entreprise_id": "ENT-001",
    "entreprise_nom": "Quincaillerie Centrale"
  }
}
```

### Modifier profil
`PUT /api/auth/profile`
- **Request Body**:
```json
{
  "nom": "KITSA LUSENGE Sage",
  "telephone": "+243 990 000 001"
}
```
- **Success Response**: `{"success": true, "message": "Profil mis a jour", "user": {...}}`

---

## Dashboard

### Statistiques générales
`GET /api/dashboard/stats`
- **Success Response**:
```json
{
  "success": true,
  "data": {
    "total_clients": 150,
    "alertes_stock": 5,
    "ca_mois_en_cours": 4500.50,
    "ventes_ht_mois": 3880.00,
    "cout_achat_mois": 2500.00,
    "resultat_mois": 1380.00,
    "total_creances": 1200.00,
    "clients_variation_pct": 5.2,
    "ca_variation_pct": -1.5,
    "creances_variation_pct": -2.4
  }
}
```

### Ventes mensuelles (Graphe)
`GET /api/dashboard/ventes-mensuelles`
- **Success Response**:
```json
{
  "success": true,
  "data": [
    { "mois": "Jan", "total": 1200 },
    { "mois": "Fev", "total": 1500 }
  ]
}
```

---

## Clients

### Liste des clients
`GET /api/clients`
- **Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_client": "CLI-00001",
      "nom": "Kitsa",
      "postnom": "Lusenge",
      "telephone": "+243...",
      "nombre_achats": 10,
      "ca_total": 1250.00
    }
  ]
}
```

### Créer un client
`POST /api/clients`
- **Request Body**: `{"nom": "Patrick", "postnom": "Kabongo", "telephone": "+243..."}`
- **Success Response**:
```json
{
  "success": true,
  "message": "Client cree avec succes",
  "data": { "id_client": "CLI-00052", "nom": "Patrick", ... }
}
```

---

## Produits et Stock

### Liste des produits
`GET /api/produits`
- **Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRD-00001",
      "reference_produit": "CIM-42",
      "nom": "Ciment gris 42.5",
      "categorie_nom": "Construction",
      "prix_ht": 20.00,
      "quantite_stock": 50,
      "statut_stock": "OK"
    }
  ]
}
```

### Approvisionner un produit
`POST /api/produits/:id/approvisionner`
- **Request Body**:
```json
{
  "fournisseur_id": "FOU-00001",
  "quantite": 50,
  "prix_achat": 12.00,
  "note": "Arrivage juin"
}
```
- **Success Response**:
```json
{
  "success": true,
  "message": "Stock mis a jour (+50 unites)",
  "data": {
    "prix_achat_unitaire": 12.00,
    "cout_moyen_pondere": 13.50,
    "stock_apres_achat": 100
  }
}
```

---

## Ventes / Factures

### Liste des factures
`GET /api/ventes`
- **Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_ventes": "FAC-2026-00001",
      "numero_facture": "FAC-2026-00001",
      "date_vente": "2026-06-11T10:00:00.000Z",
      "client_nom": "Kitsa",
      "montant_ttc": 134.00,
      "total_paye": 100.00,
      "reste_a_payer": 34.00
    }
  ]
}
```

### Créer une vente
`POST /api/ventes`
- **Request Body**:
```json
{
  "client_id": "CLI-00001",
  "articles": [
    { "produit_id": "PRD-00001", "quantite": 2, "prix": 20.00 }
  ]
}
```
- **Success Response**:
```json
{
  "success": true,
  "message": "Vente enregistree avec succes",
  "facture": "FAC-2026-00050",
  "id": "FAC-2026-00050"
}
```

---

## Paiements

### Enregistrer un paiement
`POST /api/paiements`
- **Request Body**:
```json
{
  "vente_id": "FAC-2026-00001",
  "montant": 50.00,
  "mode_paiement": "especes"
}
```
- **Success Response**: `{"success": true, "message": "Paiement enregistre", "id": "PAY-..."}`

### Rapport de caisse (groupé par jour/mode)
`GET /api/paiements/rapport-caisse`
- **Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "Date": "2026-06-11",
      "Mode_Paiement": "especes",
      "Nombre_Transactions": 5,
      "Total_Encaisse": 1250.00
    }
  ]
}
```

---

## Rapports

### Bilan financier
`GET /api/rapports/bilan?date_debut=2026-06-01&date_fin=2026-06-30`
- **Success Response**:
```json
{
  "success": true,
  "data": {
    "ventes_ht": 15000.00,
    "cout_achat": 10000.00,
    "resultat": 5000.00,
    "total_factures": 45
  }
}
```

### Livre de caisse (détail des flux)
`GET /api/rapports/livre-caisse`
- **Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "date_paiement": "2026-06-11T14:30:00.000Z",
      "numero_facture": "FAC-2026-00001",
      "client_nom": "Kitsa",
      "mode_paiement": "especes",
      "montant": 100.00
    }
  ]
}
```

---

## Notifications

`GET /api/notifications`
- **Success Response**:
```json
{
  "success": true,
  "data": [
    {
      "id_notification": 1,
      "titre": "Alerte Stock",
      "message": "Le produit Ciment est presque épuisé",
      "lu": 0,
      "created_at": "..."
    }
  ]
}
```
