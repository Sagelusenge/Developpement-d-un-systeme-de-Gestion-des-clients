# Dossier frontend/src

Ce dossier contient le code React de l'interface. Le projet est volontairement centralise dans `main.jsx` pour faciliter la lecture pendant la presentation academique.

## Contenu principal

`main.jsx` contient:

- la connexion;
- le layout principal;
- le menu par role;
- le tableau de bord;
- les pages clients, ventes, paiements, categories, fournisseurs, produits, rapports, utilisateurs et emails;
- les composants reutilisables: tableaux, badges, boutons, formulaires, modales et champs de recherche;
- les appels API vers le backend;
- les calculs d'affichage comme les totaux, statuts et filtres.

## Appels API

Les appels utilisent `API_URL`, construit a partir de:

```text
ici on met le url du frontend
```

Si la variable n'est pas definie, l'application utilise l'URL par defaut prevue dans le code.

## Responsive

Les styles ne sont pas dans ce dossier mais dans `../styles.css`. Les composants gardent des classes stables pour permettre:

- un menu mobile pleine largeur;
- des tableaux avec defilement horizontal;
- une vente directe lisible sur petit ecran;
- des produits en grille adaptee;
- des messages d'erreur visibles au-dessus des popups.

## Bonne pratique locale

Avant de pousser une correction frontend:

```bash
cd frontend
npm run build
```

Si le build passe, le code peut etre envoye sur GitHub puis redeploye sur Render.
