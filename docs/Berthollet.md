# Berthollet — Endpoints mobile client

Documentation destinée au développeur mobile de l’espace client Quincaillerie Centrale.

Base URL actuelle :

```text
https://13.61.230.65/api
```

En local :

```text
http://127.0.0.1:5000/api
```

Toutes les routes protégées utilisent :

```http
Authorization: Bearer <token_client>
Content-Type: application/json
```

Le token client contient notamment :

```json
{
  "id": "CLI-00001",
  "client_id": "CLI-00001",
  "entreprise_id": 1,
  "email": "client@gmail.com",
  "nom": "Katati",
  "role": "client",
  "type": "client"
}
```

Important : le mobile ne doit pas demander au client de choisir son rôle. Le backend reconnaît le client avec le token.

---

## 1. Format général des réponses

Réponse réussie standard :

```json
{
  "success": true,
  "message": "Operation reussie",
  "data": {}
}
```

Réponse d’erreur standard :

```json
{
  "success": false,
  "message": "Explication de l'erreur"
}
```

Codes HTTP fréquents :

- `200` : lecture ou modification réussie.
- `201` : création réussie.
- `400` : body invalide ou règle métier non respectée.
- `401` : token absent, invalide ou expiré.
- `403` : action non autorisée.
- `404` : ressource introuvable.
- `409` : conflit, par exemple commande non annulable ou référence déjà utilisée.
- `500` : erreur serveur.

---

## 2. Authentification client

### 2.1 Inscription — demander le code email

```http
POST /client-auth/register
```

Body :

```json
{
  "nom": "Katati",
  "postnom": "Mabayo",
  "telephone": "0997788432",
  "email": "katatimilabyo@gmail.com",
  "password": "ClientPro1"
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `nom` | string | oui | Nom du client. |
| `postnom` | string | non | Postnom du client. |
| `telephone` | string | oui | Téléphone du client. |
| `email` | string | oui | Email unique du client. |
| `password` | string | oui | Minimum 8 caractères, une majuscule, une minuscule et un chiffre. |

Réponse `201` :

```json
{
  "success": true,
  "message": "Un code de confirmation a ete envoye à votre adresse email.",
  "email": "katatimilabyo@gmail.com"
}
```

Erreurs possibles :

```json
{
  "success": false,
  "message": "Un compte client utilise deja cette adresse email."
}
```

```json
{
  "success": false,
  "message": "Veuillez patienter une minute avant de demander un nouveau code."
}
```

---

### 2.2 Confirmer le code email

```http
POST /client-auth/verify-email
```

Body :

```json
{
  "email": "katatimilabyo@gmail.com",
  "code": "123456"
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `email` | string | oui | Email utilisé à l’inscription. |
| `code` | string | oui | Code à 6 chiffres reçu par email. |

Réponse `201` :

```json
{
  "success": true,
  "message": "Votre adresse email est confirmee. Bienvenue !",
  "token": "jwt_client",
  "user": {
    "id": "CLI-00001",
    "id_client": "CLI-00001",
    "nom": "Katati",
    "postnom": "Mabayo",
    "email": "katatimilabyo@gmail.com",
    "telephone": "0997788432",
    "entreprise_id": 1,
    "entreprise_nom": "Quincaillerie Centrale",
    "entreprise_logo": "/uploads/companies/logo.png",
    "role": "client",
    "type": "client"
  }
}
```

Erreurs possibles :

```json
{
  "success": false,
  "message": "Code invalide ou expire."
}
```

---

### 2.3 Renvoyer le code email

```http
POST /client-auth/resend-code
```

Body :

```json
{
  "email": "katatimilabyo@gmail.com"
}
```

Réponse `200` :

```json
{
  "success": true,
  "message": "Un nouveau code vient de vous etre envoye."
}
```

---

### 2.4 Connexion client

```http
POST /client-auth/login
```

Body :

```json
{
  "email": "katatimilabyo@gmail.com",
  "password": "ClientPro1"
}
```

Réponse `200` :

```json
{
  "success": true,
  "token": "jwt_client",
  "user": {
    "id": "CLI-00001",
    "id_client": "CLI-00001",
    "nom": "Katati",
    "postnom": "Mabayo",
    "email": "katatimilabyo@gmail.com",
    "telephone": "0997788432",
    "entreprise_id": 1,
    "entreprise_nom": "Quincaillerie Centrale",
    "entreprise_logo": "/uploads/companies/logo.png",
    "role": "client",
    "type": "client"
  }
}
```

---

## 3. Profil client

### 3.1 Lire mon profil

```http
GET /client-auth/me
```

Réponse `200` :

```json
{
  "success": true,
  "user": {
    "id": "CLI-00001",
    "id_client": "CLI-00001",
    "nom": "Katati",
    "postnom": "Mabayo",
    "email": "katatimilabyo@gmail.com",
    "telephone": "0997788432",
    "entreprise_id": 1,
    "entreprise_nom": "Quincaillerie Centrale",
    "entreprise_logo": "/uploads/companies/logo.png",
    "role": "client",
    "type": "client"
  }
}
```

---

### 3.2 Modifier mon profil

```http
PUT /client-auth/profile
```

Body :

```json
{
  "nom": "Katati",
  "telephone": "0997788432"
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `nom` | string | oui | Nouveau nom complet affiché. |
| `telephone` | string | non | Téléphone du client. Si vide, il peut être enregistré à `null`. |

Réponse `200` :

```json
{
  "success": true,
  "user": {
    "id": "CLI-00001",
    "id_client": "CLI-00001",
    "nom": "Katati",
    "postnom": "Mabayo",
    "email": "katatimilabyo@gmail.com",
    "telephone": "0997788432",
    "entreprise_id": 1,
    "entreprise_nom": "Quincaillerie Centrale",
    "entreprise_logo": "/uploads/companies/logo.png",
    "role": "client",
    "type": "client"
  }
}
```

---

### 3.3 Changer mon mot de passe

```http
POST /client-auth/change-password
```

Body :

```json
{
  "new_password": "NouveauClient1"
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `new_password` | string | oui | Nouveau mot de passe, minimum 6 caractères. |

Réponse `200` :

```json
{
  "success": true,
  "message": "Mot de passe client mis a jour."
}
```

---

## 4. Tableau de bord client

### 4.1 Résumé de l’espace client

```http
GET /client-auth/dashboard
```

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "stats": {
      "total_commandes": 4,
      "commandes_en_attente": 1,
      "commandes_en_cours": 2,
      "commandes_livrees": 1,
      "total_factures": 4,
      "total_achats": 4172.08,
      "total_paye": 4152.08,
      "total_restant": 20,
      "total_reclamations": 1,
      "reclamations_ouvertes": 0
    },
    "dernieres_commandes": [
      {
        "id_commande": "CMD-000007",
        "montant_ttc": 596.24,
        "statut": "en_attente",
        "date_commande": "2026-06-29T08:00:00.000Z",
        "updated_at": "2026-06-29T08:00:00.000Z",
        "numero_facture": null
      }
    ],
    "factures_recentes": [
      {
        "id_ventes": "VEN-00007",
        "numero_facture": "FAC-2026-00007",
        "montant_ttc": 2320,
        "date_vente": "2026-06-27T00:00:00.000Z",
        "total_paye": 2300,
        "reste_a_payer": 20
      }
    ]
  }
}
```

Note importante : `reclamations_ouvertes` compte seulement les réclamations avec statut `ouverte` ou `en_cours`. Une réclamation `resolue` ou `cloturee` n’est plus ouverte, mais reste dans `total_reclamations`.

---

## 5. Catalogue et commandes

### 5.1 Voir le catalogue disponible

```http
GET /commandes/catalogue
```

Réponse `200` :

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRO-00001",
      "reference_produit": "PRD-00001",
      "nom": "Ciment",
      "unite": "piece",
      "prix_ht": 11.6,
      "taux_tva": 16,
      "quantite_stock": 1663,
      "photo_url": "/uploads/products/ciment.png",
      "categorie_nom": "construction"
    }
  ]
}
```

Champs produit :

| Champ | Description |
|---|---|
| `id_produit` | Identifiant interne du produit à envoyer dans une commande. |
| `reference_produit` | Référence lisible du produit. |
| `nom` | Nom du produit. |
| `unite` | Unité de vente : `piece`, `sac`, `kilogramme`, etc. |
| `prix_ht` | Prix catalogue utilisé par le backend. |
| `taux_tva` | Taux TVA du produit. Peut être `0` ou `null`. |
| `quantite_stock` | Stock disponible. |
| `photo_url` | Image du produit. |
| `categorie_nom` | Catégorie du produit. |

---

### 5.2 Créer une commande

```http
POST /commandes
```

Body :

```json
{
  "note_client": "Livraison, precision sur la commande...",
  "articles": [
    {
      "produit_id": "PRO-00001",
      "quantite": 4
    },
    {
      "produit_id": "PRO-00002",
      "quantite": 2
    }
  ]
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `note_client` | string | non | Note visible par l’équipe. |
| `articles` | array | oui | Liste des produits commandés. |
| `articles[].produit_id` | string | oui | Identifiant `id_produit` reçu depuis le catalogue. |
| `articles[].quantite` | number entier | oui | Quantité demandée. Doit être supérieure à 0. |

Réponse `201` :

```json
{
  "success": true,
  "message": "Commande envoyee.",
  "id": "CMD-000007"
}
```

Règles backend :

- Le client ne choisit pas le prix.
- Le backend récupère le prix catalogue depuis MySQL.
- Le backend vérifie le stock.
- Le backend refuse une quantité invalide ou supérieure au stock.
- La commande commence généralement au statut `en_attente`.

---

### 5.3 Lister mes commandes

```http
GET /commandes
```

Réponse `200` :

```json
{
  "success": true,
  "data": [
    {
      "id_commande": "CMD-000007",
      "client_id": "CLI-00001",
      "entreprise_id": 1,
      "montant_ttc": 596.24,
      "statut": "en_attente",
      "note_client": "Livraison, precision sur la commande...",
      "vente_id": null,
      "date_commande": "2026-06-29T08:00:00.000Z",
      "updated_at": "2026-06-29T08:00:00.000Z",
      "client_nom": "Katati",
      "client_postnom": "Mabayo",
      "client_telephone": "0997788432",
      "numero_facture": null,
      "lignes": [
        {
          "id_ligne_commande": "LCM-0000001",
          "commande_id": "CMD-000007",
          "produit_id": "PRO-00001",
          "quantite": 4,
          "prix_unitaire_ht": 11.6,
          "taux_tva": 16,
          "produit_nom": "Ciment",
          "photo_url": "/uploads/products/ciment.png",
          "unite": "piece"
        }
      ]
    }
  ]
}
```

Statuts commande possibles :

```text
en_attente, confirmee, preparee, livree, annulee, rejetee
```

---

### 5.4 Détail d’une commande

```http
GET /commandes/:id
```

Exemple :

```http
GET /commandes/CMD-000007
```

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "id_commande": "CMD-000007",
    "client_id": "CLI-00001",
    "entreprise_id": 1,
    "montant_ttc": 596.24,
    "statut": "en_attente",
    "note_client": "Livraison, precision sur la commande...",
    "vente_id": null,
    "date_commande": "2026-06-29T08:00:00.000Z",
    "updated_at": "2026-06-29T08:00:00.000Z",
    "numero_facture": null,
    "lignes": [
      {
        "id_ligne_commande": "LCM-0000001",
        "commande_id": "CMD-000007",
        "produit_id": "PRO-00001",
        "quantite": 4,
        "prix_unitaire_ht": 11.6,
        "taux_tva": 16,
        "produit_nom": "Ciment",
        "photo_url": "/uploads/products/ciment.png",
        "unite": "piece"
      }
    ]
  }
}
```

---

### 5.5 Annuler une commande

```http
PUT /commandes/:id/annuler
```

Body :

```json
{}
```

Réponse `200` :

```json
{
  "success": true,
  "message": "Commande annulee."
}
```

Règle backend : le client peut annuler seulement une commande :

- au statut `en_attente`
- non encore facturée (`vente_id = null`)

Erreur possible :

```json
{
  "success": false,
  "message": "Seule une commande en attente peut etre annulee."
}
```

---

## 6. Achats, factures et paiements

### 6.1 Lister mes factures

```http
GET /commandes/achats
```

Réponse `200` :

```json
{
  "success": true,
  "data": [
    {
      "id_ventes": "VEN-00007",
      "numero_facture": "FAC-2026-00007",
      "montant_ttc": 2320,
      "date_vente": "2026-06-27T00:00:00.000Z",
      "total_paye": 2300,
      "reste_a_payer": 20,
      "paiement_mobile_statut": "en_attente",
      "paiement_mobile_reference": "MOB-000001"
    }
  ]
}
```

Champs :

| Champ | Description |
|---|---|
| `id_ventes` | Identifiant technique de la vente/facture. À utiliser pour les paiements. |
| `numero_facture` | Numéro lisible affiché au client. |
| `montant_ttc` | Montant total de la facture. |
| `date_vente` | Date de création de la facture. |
| `total_paye` | Montant déjà payé. |
| `reste_a_payer` | Solde restant. |
| `paiement_mobile_statut` | Dernier statut Mobile Money : `en_attente`, `confirmee`, `rejetee`, ou `null`. |
| `paiement_mobile_reference` | Référence de la dernière demande Mobile Money, ou `null`. |

---

### 6.2 Détail d’une facture

```http
GET /commandes/achats/:id
```

`:id` peut être `id_ventes` ou `numero_facture`.

Exemples :

```http
GET /commandes/achats/VEN-00007
GET /commandes/achats/FAC-2026-00007
```

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "id_ventes": "VEN-00007",
    "numero_facture": "FAC-2026-00007",
    "montant_ttc": 2320,
    "date_vente": "2026-06-27T00:00:00.000Z",
    "total_paye": 2300,
    "reste_a_payer": 20,
    "lignes": [
      {
        "id_lignes_ventes": "LV-000001",
        "produit_id": "PRO-00001",
        "produit_nom": "Ciment",
        "unite": "piece",
        "quantite": 4,
        "prix_unitaire_ht": 11.6,
        "sous_total_ht": 46.4
      }
    ],
    "paiements": [
      {
        "id_paiement": "PAY-00001",
        "montant": 2300,
        "mode_paiement": "mobile_money",
        "reference_externe": "MPESA123456",
        "date_paiement": "2026-06-27T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 6.3 Paiement Stripe — créer une session

```http
POST /paiements/stripe/checkout
```

Body :

```json
{
  "vente_id": "VEN-00007",
  "montant": 20
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `vente_id` | string | oui | Identifiant `id_ventes` de la facture. |
| `montant` | number | oui | Montant à payer. Peut être partiel, mais ne doit pas dépasser `reste_a_payer`. |

Réponse `201` :

```json
{
  "success": true,
  "message": "Session Stripe creee.",
  "data": {
    "id_session": "STR-000001",
    "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_xxx",
    "stripe_session_id": "cs_test_xxx"
  }
}
```

Le mobile doit ouvrir `checkout_url` dans un navigateur externe ou WebView sécurisé.

---

### 6.4 Paiement Stripe — vérifier le statut

```http
GET /paiements/stripe/status/:id
```

`:id` peut être `id_session` interne ou `stripe_session_id`.

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "id_session": "STR-000001",
    "vente_id": "VEN-00007",
    "montant": 20,
    "devise": "usd",
    "statut": "confirmee",
    "stripe_session_id": "cs_test_xxx",
    "created_at": "2026-06-29T09:00:00.000Z",
    "confirmed_at": "2026-06-29T09:05:00.000Z"
  }
}
```

Statuts possibles :

```text
en_attente, confirmee, echec
```

---

### 6.5 Paiement Mobile Money — envoyer une demande

```http
POST /paiements/mobile-money/client
```

Body avec référence déjà obtenue par le client :

```json
{
  "vente_id": "VEN-00007",
  "operateur": "mpesa",
  "telephone_payeur": "+243997788432",
  "montant": 20,
  "reference_externe": "MPESA123456"
}
```

Body sans référence, si un prestataire Mobile Money automatique est configuré :

```json
{
  "vente_id": "VEN-00007",
  "operateur": "mpesa",
  "telephone_payeur": "+243997788432",
  "montant": 20,
  "reference_externe": ""
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `vente_id` | string | oui | Identifiant `id_ventes` de la facture. |
| `operateur` | string | oui | `mpesa`, `airtel_money` ou `orange_money`. |
| `telephone_payeur` | string | oui | Numéro payeur, 9 à 15 chiffres, `+` accepté. |
| `montant` | number | oui | Montant à payer, inférieur ou égal au reste à payer. |
| `reference_externe` | string | non | Référence de transaction fournie par l’opérateur. Si vide, le backend essaie de lancer un paiement automatique. |

Réponse `201` :

```json
{
  "success": true,
  "message": "Paiement Mobile Money recu et en cours de verification.",
  "data": {
    "id_demande": "MOB-000001",
    "statut": "en_attente"
  }
}
```

Si le paiement est confirmé automatiquement :

```json
{
  "success": true,
  "message": "Paiement Mobile Money confirme automatiquement.",
  "data": {
    "id_demande": "MOB-000001",
    "statut": "confirmee"
  }
}
```

Statuts possibles :

```text
en_attente, confirmee, rejetee
```

---

## 7. Réclamations client

### 7.1 Lister mes réclamations

```http
GET /reclamations
```

Réponse `200` :

```json
{
  "success": true,
  "data": [
    {
      "id_reclamation": "REC-000004",
      "client_id": "CLI-00001",
      "entreprise_id": 1,
      "commande_id": "CMD-000007",
      "vente_id": null,
      "sujet": "Je ne vois pas des signes dans ma boite",
      "message": "1234567890",
      "reponse": "Bien, nous sommes desoles pour ce desagrement.",
      "statut": "resolue",
      "date_reclamation": "2026-06-29T08:00:00.000Z",
      "updated_at": "2026-06-29T08:20:00.000Z",
      "client_nom": "Katati",
      "client_postnom": "Mabayo"
    }
  ]
}
```

Statuts possibles :

```text
ouverte, en_cours, resolue, cloturee
```

Pour le compteur “réclamations ouvertes”, compter uniquement :

```text
ouverte, en_cours
```

Une réclamation `resolue` est une ancienne demande traitée, donc elle ne compte plus comme ouverte.

---

### 7.2 Créer une réclamation

```http
POST /reclamations
```

Body :

```json
{
  "sujet": "Produit endommage",
  "message": "Le sac de ciment etait dechire a la reception.",
  "commande_id": "CMD-000007",
  "vente_id": "VEN-00007"
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `sujet` | string | oui | Sujet court de la réclamation. |
| `message` | string | oui | Détail de la demande. |
| `commande_id` | string/null | non | Commande concernée. |
| `vente_id` | string/null | non | Facture/vente concernée. |

Réponse `201` :

```json
{
  "success": true,
  "message": "Reclamation envoyee au manager.",
  "id": "REC-000005"
}
```

Effets automatiques :

- notification interne au manager ;
- email de confirmation au client si l’email est configuré.

---

## 8. Assistance / chat client

### 8.1 Lister mes conversations

```http
GET /chat
```

Réponse `200` :

```json
{
  "success": true,
  "data": [
    {
      "id_conversation": "CHAT-000003",
      "client_id": "CLI-00001",
      "entreprise_id": 1,
      "statut": "ouverte",
      "created_at": "2026-06-27T22:00:00.000Z",
      "updated_at": "2026-06-27T22:13:00.000Z",
      "client_nom": "Katati",
      "client_postnom": "Mabayo",
      "dernier_message": "prix",
      "messages": [
        {
          "id_message": "MSG-0000001",
          "conversation_id": "CHAT-000003",
          "sender_type": "bot",
          "sender_id": null,
          "message": "Bonjour Katati. Je suis l'assistant de Quincaillerie Centrale.",
          "created_at": "2026-06-27T22:00:00.000Z"
        },
        {
          "id_message": "MSG-0000002",
          "conversation_id": "CHAT-000003",
          "sender_type": "client",
          "sender_id": "CLI-00001",
          "message": "facture",
          "created_at": "2026-06-27T23:00:00.000Z"
        },
        {
          "id_message": "MSG-0000003",
          "conversation_id": "CHAT-000003",
          "sender_type": "manager",
          "sender_id": "USR-00001",
          "message": "prix",
          "created_at": "2026-06-27T22:13:00.000Z"
        }
      ]
    }
  ]
}
```

`sender_type` possibles :

```text
client, manager, bot
```

---

### 8.2 Envoyer un message au chat

```http
POST /chat/messages
```

Body pour une conversation existante :

```json
{
  "conversation_id": "CHAT-000003",
  "message": "Je veux connaitre le prix du ciment."
}
```

Body pour laisser le backend utiliser/créer la conversation du client :

```json
{
  "conversation_id": "",
  "message": "Je veux connaitre le prix du ciment."
}
```

Champs :

| Champ | Type | Obligatoire | Description |
|---|---:|---:|---|
| `conversation_id` | string | non | Conversation existante. Si vide, le backend prend la dernière conversation ouverte ou en crée une. |
| `message` | string | oui | Message du client, maximum 2000 caractères. |

Réponse `201` :

```json
{
  "success": true,
  "message": "Reponse automatique envoyee.",
  "conversation_id": "CHAT-000003",
  "automatic_reply": "Le ciment disponible est affiche avec son prix de vente dans votre catalogue.",
  "escalated": false
}
```

Si le bot ne sait pas répondre :

```json
{
  "success": true,
  "message": "Question transmise au manager.",
  "conversation_id": "CHAT-000003",
  "automatic_reply": "Je n'ai pas une reponse suffisamment fiable pour cette question. Je viens de la transmettre au manager, qui vous repondra ici dans quelques minutes.",
  "escalated": true
}
```

---

### 8.3 Flux temps réel du chat

```http
GET /chat/stream?token=<token_client>
```

Cette route utilise Server-Sent Events.

Réponse initiale :

```text
event: connected
data: {"connected":true}
```

Quand un nouveau message arrive, le mobile peut recharger :

```http
GET /chat
```

ou mettre à jour la conversation si l’événement contient une référence de conversation.

---

## 9. Notifications

### 9.1 Lister les notifications non lues

```http
GET /notifications
```

Réponse `200` :

```json
{
  "success": true,
  "data": [
    {
      "id_notification": "NOT-000001",
      "recipient_type": "user",
      "recipient_user_id": "CLI-00001",
      "entreprise_id": 1,
      "titre": "Nouvelle reponse du manager",
      "message": "Une reponse a ete ajoutee dans CHAT-000003.",
      "entity_type": "chat",
      "entity_id": "CHAT-000003",
      "lu": 0,
      "created_at": "2026-06-27T22:13:00.000Z"
    }
  ]
}
```

Champs :

| Champ | Description |
|---|---|
| `id_notification` | Identifiant de la notification. |
| `recipient_type` | Type de destinataire. |
| `recipient_user_id` | Identifiant du destinataire. Pour le client, peut correspondre à `client_id`. |
| `entreprise_id` | Entreprise liée. |
| `titre` | Titre affiché dans la cloche. |
| `message` | Message court. |
| `entity_type` | Type de ressource : `chat`, `commande`, `reclamation`, etc. |
| `entity_id` | Identifiant de la ressource liée. |
| `lu` | `0` ou `false` si non lue, `1` ou `true` si lue. |
| `created_at` | Date de création. |

Note mobile : les notifications affichées sont seulement les non lues.

---

### 9.2 Marquer une notification comme lue

```http
PUT /notifications/:id/read
```

Body :

```json
{}
```

Réponse `200` :

```json
{
  "success": true,
  "message": "Notification lue"
}
```

---

## 10. Site public utile au mobile

Ces routes ne nécessitent pas de token. Elles peuvent servir à afficher les informations publiques dans l’application mobile.

### 10.1 Configuration publique de l’entreprise

```http
GET /public/config
```

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "raison_sociale": "Quincaillerie Centrale",
    "logo_url": "/uploads/companies/logo.png",
    "num_id_nationale": "NAT-001",
    "email": "contact@quincaillerie.cd",
    "ville": "Goma",
    "slogan": "Materiaux & construction",
    "description_site": "Des materiaux fiables pour construire Goma.",
    "telephone": "+243990000000",
    "adresse": "Avenue du Commerce, quartier Murara",
    "horaires": "Lun - Sam : 8h00 - 17h00",
    "annonce_site": "",
    "hero_titre": "Construire solide. Construire ensemble.",
    "hero_description": "Materiaux de construction et articles de quincaillerie de qualite.",
    "couleur_principale": "#0b5ea8"
  }
}
```

---

### 10.2 Envoyer un message depuis Contact

```http
POST /public/contact
```

Body :

```json
{
  "nom": "Katati",
  "email": "katatimilabyo@gmail.com",
  "telephone": "0997788432",
  "sujet": "Demande d'information",
  "message": "Je veux connaitre vos horaires."
}
```

Réponse `201` :

```json
{
  "success": true,
  "message": "Votre message a ete envoye."
}
```

---

## 11. Écrans mobiles à prévoir

Le client peut faire tout ceci :

1. Créer un compte.
2. Confirmer son email avec un code.
3. Renvoyer le code.
4. Se connecter.
5. Voir son tableau de bord.
6. Modifier son profil.
7. Changer son mot de passe.
8. Voir le catalogue.
9. Ajouter des produits au panier côté mobile.
10. Envoyer une commande.
11. Voir ses commandes.
12. Voir le détail d’une commande.
13. Annuler une commande encore en attente.
14. Voir ses factures.
15. Voir le détail d’une facture.
16. Payer une facture par Stripe.
17. Vérifier le statut Stripe.
18. Déclarer un paiement Mobile Money.
19. Voir le dernier statut Mobile Money dans la liste des factures.
20. Envoyer une réclamation.
21. Voir ses réclamations et leurs réponses.
22. Discuter avec l’assistant/manager.
23. Écouter le flux temps réel du chat.
24. Voir ses notifications.
25. Marquer une notification comme lue.
26. Lire les informations publiques de l’entreprise.
27. Envoyer un message via Contact.

---

## 12. Recommandations d’intégration mobile

- Stocker le token dans un stockage sécurisé mobile.
- Ajouter `Authorization: Bearer <token_client>` sur toutes les routes protégées.
- Si une route renvoie `401`, déconnecter le client ou demander une reconnexion.
- Pour les images :
  - si `photo_url` commence par `/uploads`, préfixer avec le domaine backend ;
  - exemple : `https://13.61.230.65/uploads/products/ciment.png`.
- Pour les montants :
  - afficher en USD ;
  - ne jamais recalculer le prix final comme source de vérité ;
  - utiliser les montants renvoyés par le backend pour commandes/factures.
- Pour les réclamations :
  - `ouverte` et `en_cours` = demande encore active ;
  - `resolue` et `cloturee` = demande déjà traitée.
- Pour le chat :
  - envoyer le message avec `POST /chat/messages` ;
  - recharger `GET /chat` après envoi ou après événement SSE.
- Pour les notifications :
  - afficher la cloche avec le nombre d’éléments retournés par `GET /notifications` ;
  - appeler `PUT /notifications/:id/read` quand le client ouvre la notification.

