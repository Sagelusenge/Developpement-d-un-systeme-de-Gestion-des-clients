# Dossier frontend/src

Ce dossier contient le code React de l'interface. Le projet est volontairement centralise dans `main.jsx` pour faciliter la lecture pendant la presentation academique.

## Contenu principal

`main.jsx` contient:

- la connexion;
- le site public multipage, l'inscription client et la verification email;
- le layout principal;
- le menu par role;
- le tableau de bord;
- les pages clients, ventes, paiements, categories, fournisseurs, produits, rapports, utilisateurs et emails;
- les composants reutilisables: tableaux, badges, boutons, formulaires, modales et champs de recherche;
- les appels API vers le backend;
- les calculs d'affichage comme les totaux, statuts et filtres.
- l'espace client: commandes, achats, Mobile Money, reclamations et assistance;
- le chat temps reel avec message optimiste et flux SSE;

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
- des pages publiques defilables avec footer et animations `IntersectionObserver`;
- une sidebar defilable lorsque le menu contient beaucoup d'entrees.

## Navigation et donnees instantanees

Le menu est ordonne selon le parcours metier: tableau de bord, clients, fournisseurs, categories, produits, ventes, paiements, commandes, reclamations, rapports, chat, emails, utilisateurs et deconnexion. Les entrees non autorisees sont masquees selon le role.

Le chat ajoute d'abord le message dans l'etat React, puis l'envoie au backend. Le flux `EventSource` ecoute `/api/chat/stream` et recharge silencieusement les conversations; aucun ecran de chargement global n'apparait pendant l'echange.

Dans `Mes achats`, le client peut ouvrir la modale Mobile Money. Une demande en attente desactive un second paiement sur la meme facture jusqu'au traitement.

## Blocs de navigation

Pour l'equipe, la sidebar utilise trois accordeons exclusifs: Magasin, Commercial et Messages. Commentaires est place avec Chat et Emails. Le client conserve des boutons compacts sans accordeon.

Le chatbot affiche les messages optimistes immédiatement, reconnait les fautes simples par le backend et ne contient aucune cle OpenAI. Le bouton d'analyse IA du manager appelle uniquement l'API protegee.

## Bonne pratique locale

Avant de pousser une correction frontend:

```bash
cd frontend
npm run build
```

Si le build passe, le code peut etre envoye sur GitHub puis redeploye sur Render.
