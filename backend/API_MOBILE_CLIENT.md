# API mobile - Espace client uniquement

Base URL:

```text
https://votre-backend/api
```

Toutes les routes protegees utilisent:

```http
Authorization: Bearer <token_client>
Content-Type: application/json
```

Le mobile ne doit pas demander au client de choisir son role. Le backend detecte le compte automatiquement.

---

## Inscription client

### Demander le code email

```http
POST /client-auth/register
```

Body:

```json
{
  "nom": "Sage",
  "postnom": "Lusenge",
  "telephone": "+243990000000",
  "email": "sage@gmail.com",
  "password": "ClientPro1"
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Un code de confirmation a ete envoye a votre adresse email.",
  "email": "sage@gmail.com"
}
```

### Confirmer le code

```http
POST /client-auth/verify-email
```

Body:

```json
{
  "email": "sage@gmail.com",
  "code": "123456"
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Votre adresse email est confirmee. Bienvenue !",
  "token": "jwt_client",
  "user": {
    "id_client": "CLI-00042",
    "nom": "Sage",
    "email": "sage@gmail.com",
    "role": "client",
    "type": "client"
  }
}
```

### Renvoyer le code

```http
POST /client-auth/resend-code
```

Body:

```json
{ "email": "sage@gmail.com" }
```

---

## Connexion et profil

### Connexion unique

```http
POST /auth/login
```

Body:

```json
{
  "email": "sage@gmail.com",
  "password": "ClientPro1"
}
```

Reponse:

```json
{
  "success": true,
  "message": "Connexion reussie",
  "token": "jwt_client",
  "user": {
    "id_client": "CLI-00042",
    "role": "client",
    "type": "client"
  }
}
```

### Mon profil

```http
GET /client-auth/me
```

### Modifier mon profil

```http
PUT /client-auth/profile
```

Body:

```json
{
  "nom": "Sage Lusenge",
  "telephone": "+243990000000"
}
```

### Changer mon mot de passe

```http
POST /client-auth/change-password
```

Body:

```json
{ "new_password": "NouveauClient1" }
```

---

## Catalogue et commandes

### Catalogue client

```http
GET /commandes/catalogue
```

Reponse:

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRD-00001",
      "reference_produit": "BOIS-001",
      "nom": "Bois",
      "unite": "piece",
      "prix_ht": 130,
      "quantite_stock": 20,
      "categorie_nom": "Construction"
    }
  ]
}
```

### Creer une commande

```http
POST /commandes
```

Body:

```json
{
  "note_client": "Je passerai demain.",
  "articles": [
    { "produit_id": "PRD-00001", "quantite": 2 }
  ]
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Commande envoyee.",
  "id": "CMD-000003"
}
```

### Mes commandes

```http
GET /commandes
```

### Mes achats et factures

```http
GET /commandes/achats
```

---

## Paiement Mobile Money

```http
POST /paiements/mobile-money/client
```

Body:

```json
{
  "vente_id": "FAC-2026-00004",
  "operateur": "airtel_money",
  "telephone_payeur": "+243990000000",
  "montant": 50,
  "reference_externe": "TX123456"
}
```

Reponse:

```json
{
  "success": true,
  "message": "Demande de paiement Mobile Money enregistree.",
  "data": {
    "id_demande": "MOB-000001",
    "statut": "en_attente"
  }
}
```

---

## Reclamations

### Lister mes reclamations

```http
GET /reclamations
```

### Creer une reclamation

```http
POST /reclamations
```

Body:

```json
{
  "sujet": "Produit manquant",
  "message": "Il manque une piece dans ma commande.",
  "commande_id": "CMD-000003"
}
```

---

## Chat client

### Lister mes conversations

```http
GET /chat
```

### Envoyer un message

```http
POST /chat/messages
```

Body:

```json
{
  "conversation_id": "CHAT-000001",
  "message": "Je viendrai demain"
}
```

Reponse:

```json
{
  "success": true,
  "message": "Reponse automatique envoyee.",
  "conversation_id": "CHAT-000001",
  "automatic_reply": "C'est note. Vous pouvez passer demain; si cela concerne une commande, gardez sa reference CMD ou votre facture FAC pour que l'equipe retrouve rapidement votre dossier.",
  "escalated": false
}
```

### Temps reel

```http
GET /chat/stream?token=<token_client>
```

Le mobile doit afficher le message sortant immediatement, puis rafraichir la conversation quand un evenement `chat-update` arrive.

