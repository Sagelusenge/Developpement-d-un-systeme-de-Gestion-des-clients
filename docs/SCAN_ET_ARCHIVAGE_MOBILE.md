# Scan et archivage — Guide pour le développeur mobile

## 1. Objet du module

Ce document décrit uniquement le module mobile de capture, scan et archivage.

Le mobile doit permettre de :

1. prendre une photo avec la caméra ;
2. choisir une image ou un PDF déjà présent sur le téléphone ;
3. recadrer et compresser l’image ;
4. saisir les informations du document ;
5. envoyer le fichier au backend ;
6. consulter et ouvrir les archives déjà enregistrées.

Les captures et les documents scannés sont conservés côté serveur. Le mobile ne doit garder qu’une copie temporaire pendant la préparation et l’envoi.

## 2. Droits par rôle

| Action | Manager | Vendeur | Magasinier | Client |
|---|---:|---:|---:|---:|
| Scanner et archiver | Oui | Non | Non | Non |
| Lister les archives | Oui | Oui | Non | Non |
| Ouvrir un document | Oui | Oui | Non | Non |
| Modifier ou supprimer | Non disponible | Non disponible | Non disponible | Non disponible |

Le backend vérifie le rôle contenu dans le JWT. Il ne faut pas se contenter de masquer les boutons dans l’application mobile.

## 3. Configuration API

La variable mobile doit contenir l’URL de l’API avec le préfixe `/api`.

```text
API_URL=https://votre-backend.onrender.com/api
```

Toutes les requêtes utilisent :

```http
Authorization: Bearer <token_interne>
Content-Type: application/json
```

## 4. Formats acceptés

Le backend accepte les fichiers suivants :

| Format | Type MIME | Préfixe `data_url` |
|---|---|---|
| JPEG | `image/jpeg` | `data:image/jpeg;base64,` |
| PNG | `image/png` | `data:image/png;base64,` |
| WEBP | `image/webp` | `data:image/webp;base64,` |
| PDF | `application/pdf` | `data:application/pdf;base64,` |

La limite backend par défaut est :

```text
ARCHIVE_MAX_BYTES=8388608
```

Cependant, Base64 augmente la taille d’environ 33 % et le corps JSON du serveur est limité à 8 Mo par défaut. Le mobile doit donc viser un fichier final inférieur à **5 Mo**, idéalement entre **500 Ko et 2 Mo** pour une image.

## 5. Envoyer un scan

### Endpoint

```http
POST /api/archives
```

Rôle requis : `manager`.

### Corps JSON

```json
{
  "titre": "Facture fournisseur ciment - juin 2026",
  "type_document": "facture_fournisseur",
  "description": "Document scanné au dépôt principal",
  "file_name": "facture-ciment-2026-06.jpg",
  "data_url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

### Champs

| Champ | Obligatoire | Description |
|---|---:|---|
| `titre` | Oui | Nom lisible du document, maximum 180 caractères en base |
| `type_document` | Non | Catégorie fonctionnelle, maximum 80 caractères |
| `description` | Non | Information complémentaire, maximum 500 caractères en base |
| `file_name` | Non | Nom original ou nom généré par le mobile |
| `data_url` | Oui | Type MIME suivi du contenu Base64 |

Valeurs conseillées pour `type_document` :

- `facture_fournisseur` ;
- `recu` ;
- `bon_livraison` ;
- `preuve_paiement` ;
- `contrat` ;
- `inventaire` ;
- `document_administratif` ;
- `autre`.

Ces valeurs sont une convention mobile. Le backend accepte actuellement toute chaîne non vide de 80 caractères maximum.

### Réponse réussie

Statut HTTP : `201`.

```json
{
  "success": true,
  "message": "Document archive.",
  "data": {
    "id_document": "ARC-000001",
    "file_url": "https://votre-backend.onrender.com/uploads/archives/1719740000000-a1b2c3d4.jpg"
  }
}
```

Après cette réponse, le mobile peut supprimer sa copie temporaire et actualiser la liste des archives.

## 6. Lister les archives

### Endpoint

```http
GET /api/archives
```

Rôles autorisés : `manager`, `vendeur`.

### Réponse

```json
{
  "success": true,
  "data": [
    {
      "id_document": "ARC-000001",
      "entreprise_id": "ENT-00001",
      "uploaded_by": "USR-00001",
      "uploaded_by_name": "Responsable principal",
      "titre": "Facture fournisseur ciment - juin 2026",
      "type_document": "facture_fournisseur",
      "description": "Document scanné au dépôt principal",
      "file_url": "https://votre-backend.onrender.com/uploads/archives/1719740000000-a1b2c3d4.jpg",
      "file_name": "facture-ciment-2026-06.jpg",
      "mime_type": "image/jpeg",
      "created_at": "2026-06-30T08:30:00.000Z"
    }
  ]
}
```

Le backend renvoie les 200 archives les plus récentes, triées de la plus récente à la plus ancienne.

## 7. Ouverture et aperçu

- Pour une image, afficher `file_url` dans un composant image avec zoom.
- Pour un PDF, ouvrir `file_url` dans le lecteur PDF du mobile ou dans un composant PDF.
- Toujours prévoir les états chargement, fichier indisponible et nouvelle tentative.
- Utiliser `mime_type` pour choisir le lecteur.
- Ne jamais reconstruire l’URL localement : utiliser exactement `file_url` retourné par l’API.

## 8. Flux recommandé dans l’application

### Écran « Scanner »

1. Bouton `Prendre une photo`.
2. Bouton `Choisir dans la galerie`.
3. Bouton `Choisir un PDF`.
4. Aperçu du document.
5. Recadrage, rotation et amélioration du contraste.
6. Formulaire : titre, type, description.
7. Bouton `Archiver`.
8. Barre de progression et blocage du double clic.
9. Confirmation avec la référence `id_document`.

### Écran « Archives »

Chaque ligne ou carte doit afficher :

- aperçu miniature pour une image, ou icône PDF ;
- titre ;
- type de document ;
- date ;
- personne ayant ajouté le document ;
- bouton `Ouvrir`.

Filtres locaux recommandés :

- recherche par titre ;
- type de document ;
- date ;
- auteur.

## 9. Traitement d’une image avant l’envoi

Le mobile doit :

1. corriger l’orientation EXIF ;
2. recadrer les bords inutiles ;
3. limiter le grand côté à environ 1600–2000 pixels ;
4. convertir de préférence en JPEG avec une qualité de 70–80 % ;
5. vérifier que le résultat reste lisible ;
6. convertir le fichier final en Base64 ;
7. ajouter le préfixe MIME pour former `data_url`.

Exemple logique :

```javascript
const dataUrl = `data:${mimeType};base64,${base64Content}`;

await api.post('/archives', {
  titre,
  type_document: typeDocument,
  description,
  file_name: fileName,
  data_url: dataUrl
});
```

Le champ `base64Content` ne doit contenir ni espace, ni saut de ligne, ni préfixe supplémentaire.

## 10. Documents de plusieurs pages

Un appel `POST /api/archives` enregistre un seul fichier.

Pour un document de plusieurs pages, deux stratégies sont possibles :

1. stratégie recommandée : capturer toutes les pages, générer un seul PDF sur le mobile, puis archiver ce PDF ;
2. stratégie simple : archiver chaque page séparément avec des titres comme `Contrat — page 1/3`.

Le PDF final doit respecter la même limite de taille.

## 11. Gestion réseau et reprise

États conseillés :

- `brouillon` : fichier préparé localement ;
- `en_attente` : connexion absente ;
- `envoi` : requête en cours ;
- `envoye` : réponse HTTP 201 reçue ;
- `echec` : erreur nécessitant une nouvelle tentative.

En cas de coupure :

1. conserver temporairement le fichier et les métadonnées dans le stockage privé de l’application ;
2. attendre le retour du réseau ;
3. demander confirmation avant une nouvelle tentative si la première requête a pu atteindre le serveur ;
4. recharger `GET /api/archives` et rechercher le titre, le nom du fichier et la date afin d’éviter un doublon.

Le backend ne possède pas encore de clé d’idempotence. Une répétition du même `POST` peut donc créer deux archives.

## 12. Erreurs à gérer

| HTTP | Cas possible | Message mobile conseillé |
|---:|---|---|
| 400 | Titre absent | « Saisissez le titre du document. » |
| 400 | Base64 ou format invalide | « Le fichier doit être une image JPG, PNG, WEBP ou un PDF. » |
| 400 | Fichier trop lourd | « Compressez le document avant de réessayer. » |
| 401 | Token absent ou expiré | Reconnecter l’utilisateur |
| 403 | Rôle non autorisé | « Seul le manager peut archiver un document. » |
| 413 | Corps JSON trop grand | Réduire fortement la taille de l’image ou du PDF |
| 500 | Erreur serveur | Conserver le brouillon et proposer une nouvelle tentative |

Toujours afficher en priorité le champ `message` renvoyé par l’API.

## 13. Sécurité

- Utiliser uniquement HTTPS en production.
- Stocker le JWT dans le stockage sécurisé du système.
- Ne pas placer le Base64 dans les logs.
- Ne pas conserver durablement les scans dans la galerie sans accord de l’utilisateur.
- Effacer les fichiers temporaires après un envoi réussi.
- Ne jamais afficher les archives d’une autre entreprise.
- Ne pas transmettre `entreprise_id` depuis le mobile : le backend le récupère depuis le token.

## 14. Stockage persistant côté serveur

Point important pour la mise en production : le backend actuel écrit les fichiers dans :

```text
backend/src/uploads/archives
```

Sur un hébergement Render sans disque persistant, ces fichiers peuvent disparaître lors d’un redéploiement ou d’un redémarrage. Avant d’utiliser l’archivage comme conservation définitive, l’équipe backend doit mettre en place l’une des solutions suivantes :

- un disque persistant Render monté sur le dossier d’archives ;
- un stockage objet durable comme S3, Cloudinary ou un service compatible ;
- une sauvegarde externe régulière.

La base de données conserve les métadonnées et `file_url`, mais elle ne contient pas le fichier lui-même.

## 15. Limites actuelles de l’API

- un seul fichier par requête ;
- création réservée au manager ;
- consultation manager et vendeur ;
- maximum 200 résultats ;
- aucun endpoint de suppression ;
- aucun endpoint de modification ;
- aucune pagination ;
- aucune clé d’idempotence ;
- aucun rattachement direct à une commande, une vente ou un fournisseur ;
- stockage local non durable si aucun disque persistant n’est configuré.

Le développeur mobile doit respecter ces limites et ne pas simuler côté mobile une fonction que le backend ne propose pas.

## 16. Critères de validation mobile

Le module est considéré prêt lorsque :

- une photo prise par la caméra peut être recadrée et archivée ;
- une image de la galerie peut être archivée ;
- un PDF peut être archivé ;
- un fichier trop lourd est bloqué ou compressé avant envoi ;
- le double envoi est empêché pendant la requête ;
- le manager voit immédiatement le nouveau document ;
- le vendeur peut consulter et ouvrir le document ;
- les erreurs 401, 403, 413 et réseau sont correctement affichées ;
- les fichiers temporaires sont supprimés après succès ;
- un scan multipage peut être assemblé en PDF ou envoyé page par page.
