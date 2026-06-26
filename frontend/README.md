# Frontend - Interface Quincaillerie Centrale

Ce dossier contient l'application React utilisee par les managers, vendeurs et magasiniers. Elle consomme l'API backend et presente les modules du CRM PME.

## Structure

| Fichier | Role |
| --- | --- |
| `src/main.jsx` | Pages, composants React, appels API et logique d'affichage. |
| `styles.css` | Design global, responsive, tableaux, popups et navigation. |
| `vite.config.js` | Configuration Vite. |
| `.env.example` | Exemple de variable d'API. |
| `dist/` | Dossier genere par `npm run build`. |

## Pages principales

- Tableau de bord.
- Clients.
- Ventes.
- Paiements.
- Categories.
- Fournisseurs.
- Produits et stock.
- Rapports.
- Utilisateurs.
- Emails.

## Responsive

Le design supporte:

- desktop;
- tablette;
- telephone.

Les tableaux restent sous forme de tableaux sur mobile. Une barre de defilement horizontale permet de voir les colonnes comme les actions, le montant ou le statut. Cette solution evite les cartes empilees qui rendaient les factures et les produits difficiles a lire.

Le menu mobile occupe toute la largeur de l'ecran quand il est ouvert. Le bouton menu reste accessible pour fermer la navigation.

## Vente directe

La fenetre de vente directe permet:

- de choisir un client;
- de rechercher un produit;
- d'ajouter un produit;
- de modifier la quantite;
- de modifier le prix de vente unitaire;
- de voir le total et le gain de la ligne;
- de facturer.

Le champ prix de vente garde la saisie fluide pendant que l'utilisateur tape, puis la valeur est convertie au moment de l'envoi.

## Notifications

Les messages d'erreur et de confirmation s'affichent au-dessus des popups sur mobile pour rester visibles pendant la saisie.

## Installation locale

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Variable principale

```text
VITE_API_URL=https://developpement-d-un-systeme-de-gestion.onrender.com/api
```

En local:

```text
VITE_API_URL=http://localhost:5000/api
```

## Render

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Apres un push sur `main`, Render doit reconstruire le frontend. Si la page montre encore l'ancien design, vider le cache du navigateur ou lancer un redeploiement manuel.
