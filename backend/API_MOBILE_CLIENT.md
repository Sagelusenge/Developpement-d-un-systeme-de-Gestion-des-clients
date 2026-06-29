# API mobile - Espace client uniquement

Base URL:

```text
https://votre-backend/api
```

Base URL AWS actuelle:

```text
https://13.61.230.65/api
```

URL du site AWS:

```text
https://13.61.230.65/
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

## Tableau de bord client

Cette route regroupe les indicateurs utiles a l'ecran d'accueil mobile. Elle evite de lancer plusieurs requetes pour afficher le nombre de commandes, les achats, les soldes et les reclamations.

```http
GET /client-auth/dashboard
```

Reponse:

```json
{
  "success": true,
  "data": {
    "stats": {
      "total_commandes": 8,
      "commandes_en_attente": 1,
      "commandes_en_cours": 2,
      "commandes_livrees": 5,
      "total_factures": 6,
      "total_achats": 1850,
      "total_paye": 1500,
      "total_restant": 350,
      "total_reclamations": 2,
      "reclamations_ouvertes": 1
    },
    "dernieres_commandes": [
      {
        "id_commande": "CMD-000003",
        "montant_ttc": 260,
        "statut": "preparee",
        "date_commande": "2026-06-29T08:30:00.000Z",
        "numero_facture": "FAC-2026-00004"
      }
    ],
    "factures_recentes": [
      {
        "id_ventes": "FAC-2026-00004",
        "numero_facture": "FAC-2026-00004",
        "montant_ttc": 260,
        "total_paye": 100,
        "reste_a_payer": 160
      }
    ]
  }
}
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

### Detail d'une commande

```http
GET /commandes/CMD-000003
```

La reponse contient la commande, son statut, sa facture eventuelle et le tableau `lignes` avec les produits commandes.

### Annuler une commande en attente

```http
PUT /commandes/CMD-000003/annuler
```

Body:

```json
{}
```

Seule une commande ayant encore le statut `en_attente` et non facturee peut etre annulee par le client.

### Mes achats et factures

```http
GET /commandes/achats
```

### Detail d'une facture

```http
GET /commandes/achats/FAC-2026-00004
```

La reponse contient le resume de la facture, le tableau `lignes` et l'historique `paiements`.

---

## Paiement Stripe

### Creer une session de paiement

```http
POST /paiements/stripe/checkout
```

Body:

```json
{
  "vente_id": "FAC-2026-00004",
  "montant": 50
}
```

Reponse 201:

```json
{
  "success": true,
  "message": "Session Stripe creee.",
  "data": {
    "id_session": "STR-000001",
    "checkout_url": "https://checkout.stripe.com/...",
    "stripe_session_id": "cs_test_..."
  }
}
```

Le mobile ouvre `checkout_url` dans le navigateur ou une WebView securisee.

### Verifier le statut Stripe

```http
GET /paiements/stripe/status/STR-000001
```

Valeurs possibles de `statut`: `en_attente`, `confirmee`, `echec`, `annulee`.

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

---

## Notifications client

### Lister les notifications non lues

```http
GET /notifications
```

### Marquer une notification comme lue

```http
PUT /notifications/NOT-000001/read
```

Body:

```json
{}
```

---

## Resume des routes client

| Fonction | Methode | Route |
|---|---:|---|
| Inscription | POST | `/client-auth/register` |
| Confirmation email | POST | `/client-auth/verify-email` |
| Renvoi du code | POST | `/client-auth/resend-code` |
| Connexion | POST | `/auth/login` |
| Profil | GET | `/client-auth/me` |
| Modification du profil | PUT | `/client-auth/profile` |
| Mot de passe | POST | `/client-auth/change-password` |
| Tableau de bord | GET | `/client-auth/dashboard` |
| Catalogue | GET | `/commandes/catalogue` |
| Mes commandes | GET | `/commandes` |
| Detail commande | GET | `/commandes/:id` |
| Nouvelle commande | POST | `/commandes` |
| Annuler une commande | PUT | `/commandes/:id/annuler` |
| Mes factures | GET | `/commandes/achats` |
| Detail facture | GET | `/commandes/achats/:id` |
| Paiement Stripe | POST | `/paiements/stripe/checkout` |
| Statut Stripe | GET | `/paiements/stripe/status/:id` |
| Paiement Mobile Money | POST | `/paiements/mobile-money/client` |
| Mes reclamations | GET | `/reclamations` |
| Nouvelle reclamation | POST | `/reclamations` |
| Conversations | GET | `/chat` |
| Nouveau message | POST | `/chat/messages` |
| Evenements chat | GET | `/chat/stream?token=...` |
| Notifications | GET | `/notifications` |
| Notification lue | PUT | `/notifications/:id/read` |

## Reponses d'erreur

Toutes les erreurs suivent ce format:

```json
{
  "success": false,
  "message": "Description exploitable par l'application mobile."
}
```

Codes courants:

- `400`: donnees invalides ou regle metier non respectee;
- `401`: token absent, invalide ou expire;
- `403`: route interdite au role client;
- `404`: ressource inexistante ou n'appartenant pas au client;
- `409`: doublon ou conflit;
- `429`: trop de demandes rapprochees;
- `500`: erreur serveur;
- `503`: service externe non configure ou indisponible.
