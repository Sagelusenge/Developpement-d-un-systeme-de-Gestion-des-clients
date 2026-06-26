# API client et scan mobile

Ce document regroupe les endpoints utiles pour l'application client et l'espace mobile de scan documentaire.

Base URL locale:

```txt
http://127.0.0.1:5000/api
```

Base URL production actuelle:

```txt
https://developpement-d-un-systeme-de-gestion.onrender.com/api
```

Base URL AWS actuelle:

```txt
https://13.61.230.65/api
```

Pour ouvrir le site dans le navigateur:

```txt
https://13.61.230.65/
```

Toutes les routes protegees utilisent:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## 1. Inscription client

### Demander l'inscription

```http
POST /client-auth/register
```

Body:

```json
{
  "nom": "Sage",
  "postnom": "Lusenge",
  "telephone": "+243970000000",
  "email": "sage@example.com",
  "password": "Client@123"
}
```

Reponse:

```json
{
  "success": true,
  "message": "Code de verification envoye par email."
}
```

### Confirmer l'email

```http
POST /client-auth/verify-email
```

Body:

```json
{
  "email": "sage@example.com",
  "code": "123456"
}
```

Reponse:

```json
{
  "success": true,
  "message": "Compte client active.",
  "token": "<jwt>",
  "user": {
    "id_client": "CLI-000001",
    "nom": "Sage",
    "email": "sage@example.com",
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
{
  "email": "sage@example.com"
}
```

## 2. Connexion et profil client

### Connexion unique

```http
POST /auth/login
```

Body:

```json
{
  "email": "sage@example.com",
  "password": "Client@123"
}
```

Reponse:

```json
{
  "success": true,
  "message": "Connexion reussie",
  "token": "<jwt>",
  "user": {
    "id_client": "CLI-000001",
    "nom": "Sage",
    "role": "client",
    "type": "client"
  }
}
```

### Profil connecte

```http
GET /client-auth/me
```

Reponse:

```json
{
  "success": true,
  "user": {
    "id_client": "CLI-000001",
    "nom": "Sage",
    "postnom": "Lusenge",
    "telephone": "+243970000000",
    "email": "sage@example.com",
    "role": "client"
  }
}
```

### Modifier le profil

```http
PUT /client-auth/profile
```

Body:

```json
{
  "nom": "Sage",
  "postnom": "Lusenge",
  "telephone": "+243970000000"
}
```

## 3. Mot de passe client

### Demander un code de recuperation

```http
POST /auth/forgot-password
```

Body:

```json
{
  "email": "sage@example.com"
}
```

### Verifier le code

```http
POST /auth/verify-reset-code
```

Body:

```json
{
  "email": "sage@example.com",
  "code": "123456"
}
```

### Definir un nouveau mot de passe

```http
POST /auth/reset-password
```

Body:

```json
{
  "email": "sage@example.com",
  "code": "123456",
  "new_password": "Nouveau@123",
  "confirm_password": "Nouveau@123"
}
```

## 4. Catalogue client

```http
GET /commandes/catalogue
```

Reponse:

```json
{
  "success": true,
  "data": [
    {
      "id_produit": "PRO-000001",
      "reference_produit": "PEI-001",
      "nom": "Peinture",
      "unite": "piece",
      "prix_ht": "500.00",
      "taux_tva": "16.00",
      "quantite_stock": 20,
      "photo_url": "https://...",
      "categorie_nom": "Construction"
    }
  ]
}
```

Le mobile doit afficher le prix TTC:

```txt
prix_ttc = prix_ht * (1 + taux_tva / 100)
```

## 5. Commandes client

### Creer une commande

```http
POST /commandes
```

Body:

```json
{
  "note_client": "Livraison demain matin si possible.",
  "articles": [
    {
      "produit_id": "PRO-000001",
      "quantite": 3
    }
  ]
}
```

Reponse:

```json
{
  "success": true,
  "message": "Commande envoyee.",
  "id": "CMD-000001"
}
```

### Lister les commandes du client

```http
GET /commandes
```

Reponse:

```json
{
  "success": true,
  "data": [
    {
      "id_commande": "CMD-000001",
      "statut": "en_attente",
      "montant_ttc": "1740.00",
      "date_commande": "2026-06-26T10:00:00.000Z",
      "numero_facture": null,
      "lignes": [
        {
          "produit_nom": "Peinture",
          "quantite": 3,
          "prix_unitaire_ht": "500.00",
          "taux_tva": "16.00"
        }
      ]
    }
  ]
}
```

## 6. Achats et factures client

```http
GET /commandes/achats
```

Reponse:

```json
{
  "success": true,
  "data": [
    {
      "id_ventes": "FAC-2026-00001",
      "numero_facture": "FAC-2026-00001",
      "montant_ttc": "1740.00",
      "total_paye": "1000.00",
      "reste_a_payer": "740.00",
      "date_vente": "2026-06-26T10:30:00.000Z"
    }
  ]
}
```

Note: les endpoints Mobile Money existent cote backend, mais le paiement Mobile Money, carte et virement sont actuellement masques cote frontend.

## 7. Reclamations client

### Creer une reclamation

```http
POST /reclamations
```

Body:

```json
{
  "commande_id": "CMD-000001",
  "sujet": "Question sur ma commande",
  "message": "Je souhaite savoir quand la commande sera prete."
}
```

### Lister les reclamations du client

```http
GET /reclamations
```

Reponse:

```json
{
  "success": true,
  "data": [
    {
      "id_reclamation": "REC-000001",
      "sujet": "Question sur ma commande",
      "message": "Je souhaite savoir quand la commande sera prete.",
      "statut": "ouverte",
      "date_reclamation": "2026-06-26T11:00:00.000Z"
    }
  ]
}
```

## 7.1 Message depuis la page Contact / Accueil

Cette route est publique. Elle permet a un visiteur ou client potentiel d'envoyer un message depuis le site vitrine.

```http
POST /public/contact
```

Body:

```json
{
  "nom": "Sage Lusenge",
  "email": "sage@example.com",
  "sujet": "Demande de prix",
  "message": "Je souhaite avoir des informations sur les produits disponibles."
}
```

Reponse:

```json
{
  "success": true,
  "message": "Votre message a bien ete transmis a notre equipe."
}
```

Effets:

- le message est stocke dans les commentaires du site;
- le manager recoit une notification interne;
- l'expediteur recoit un email de confirmation de reception.

## 8. Chat client

### Lister les conversations

```http
GET /chat
```

### Envoyer un message

```http
POST /chat
```

Body:

```json
{
  "conversation_id": "CHAT-000001",
  "message": "Quel est le prix du bois ?"
}
```

Reponse:

```json
{
  "success": true,
  "data": {
    "conversation_id": "CHAT-000001"
  }
}
```

### Flux instantane SSE

```http
GET /chat/stream?token=<jwt>
```

Le mobile peut utiliser ce flux pour recevoir les nouveaux messages sans actualiser.

## 9. Scan mobile et archivage documentaire

Ces endpoints concernent l'espace mobile du manager pour scanner des factures, recus ou documents et les envoyer vers le bouton Archivage dans les rapports.

### Envoyer un document scanne

```http
POST /archives
```

Role: manager.

Body image:

```json
{
  "titre": "Facture fournisseur ciment",
  "type_document": "facture_fournisseur",
  "description": "Facture scannee depuis le mobile",
  "file_name": "facture-ciment.jpg",
  "data_url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

Body PDF:

```json
{
  "titre": "Contrat fournisseur",
  "type_document": "contrat",
  "description": "Contrat annuel scanne",
  "file_name": "contrat.pdf",
  "data_url": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

Reponse:

```json
{
  "success": true,
  "message": "Document archive.",
  "data": {
    "id_document": "ARC-000001",
    "file_url": "https://.../uploads/archives/ARC-000001-facture-ciment.jpg"
  }
}
```

Formats acceptes:

- JPEG;
- PNG;
- WEBP;
- PDF.

Limite par defaut:

```txt
ARCHIVE_MAX_BYTES=8388608
```

### Lister les documents archives

```http
GET /archives
```

Roles: manager, vendeur.

Reponse:

```json
{
  "success": true,
  "data": [
    {
      "id_document": "ARC-000001",
      "titre": "Facture fournisseur ciment",
      "type_document": "facture_fournisseur",
      "description": "Facture scannee depuis le mobile",
      "file_url": "https://...",
      "file_name": "facture-ciment.jpg",
      "mime_type": "image/jpeg",
      "created_at": "2026-06-26T12:00:00.000Z"
    }
  ]
}
```

## 10. Upload image produit/categorie

Cet endpoint est utile pour le magasinier lorsqu'il ajoute une photo depuis l'interface.

```http
POST /uploads/image
```

Role: magasinier.

Body:

```json
{
  "folder": "products",
  "file_name": "peinture.jpg",
  "data_url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

Reponse:

```json
{
  "success": true,
  "url": "https://.../uploads/products/..."
}
```

Folders autorises:

- `products`;
- `categories`.

## 11. Bonnes pratiques mobile

- Toujours stocker le token de maniere securisee.
- Ne jamais afficher le prix d'achat au client.
- Calculer l'affichage TTC a partir de `prix_ht` et `taux_tva`.
- Toujours laisser le backend recalculer les totaux.
- Compresser les images scannees avant upload.
- Afficher une progression pendant l'envoi de scan.
- Reessayer l'upload si la connexion mobile coupe.
- Ne pas envoyer de documents sensibles sans HTTPS.
