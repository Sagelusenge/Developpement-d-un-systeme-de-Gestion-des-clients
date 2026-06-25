# Quincaillerie Centrale - CRM PME

Application web de gestion commerciale interne pour une quincaillerie ou une PME. Le projet aide a gerer les clients, les ventes, les paiements, les produits, le stock, les fournisseurs, les rapports et les utilisateurs avec des roles simples.

## Objectif du projet

Le but est de remplacer le suivi manuel par une application claire:

- suivre les factures creees;
- voir ce qui est deja paye et ce qui reste a payer;
- connaitre le stock disponible;
- enregistrer les approvisionnements;
- suivre les mouvements entree et sortie;
- imprimer les rapports utiles;
- limiter les actions selon le role de l'utilisateur.

## Roles

L'application utilise trois roles principaux.

| Role | Utilisation principale |
| --- | --- |
| Manager | Supervise l'activite, les clients, commandes, reclamations, rapports, chat, emails et utilisateurs. Il consulte les ventes et paiements sans les creer. |
| Caissier | Enregistre les ventes, les factures et les paiements. |
| Magasinier | Gere les produits, le stock, les fournisseurs et les mouvements. |
| Client | Cree son compte, commande, consulte ses achats, paie par Mobile Money, reclame et dialogue avec l'assistance. |

## Modules

### Site public

Le site vitrine utilise des routes distinctes :

- `/` : accueil ;
- `/about` : histoire, mission et valeurs ;
- `/services` : produits et services ;
- `/contact` : formulaire transmis aux managers ;
- `/inscription` : creation et verification du compte client ;
- `/connexion` : connexion equipe ou client ;
- `/app` : application CRM apres authentification.

L'inscription client envoie un code de confirmation a six chiffres par email. Le code expire apres 15 minutes et n'est jamais stocke en clair.

### Tableau de bord

Le tableau de bord donne une vue rapide de l'activite:

- total vendu ce mois;
- argent deja recu;
- cout des produits vendus;
- benefice du mois;
- ventes des derniers mois;
- repartition des paiements;
- produits les plus vendus;
- dernieres factures.

### Clients

Le module clients garde les informations simples:

- nom;
- postnom;
- telephone;
- nombre d'achats;
- chiffre d'affaires;
- statut.

### Ventes

Le module ventes permet de creer une facture avec un client et des produits. Le prix de vente peut etre ajuste dans la fenetre de vente directe avant la facturation.

Une vente peut etre:

- payee;
- partiellement payee;
- non payee.

### Paiements

Le module paiements enregistre l'argent reellement recu. Il permet aussi de filtrer la caisse:

- caisse du jour;
- caisse hebdomadaire;
- caisse mensuelle;
- periode personnalisee du ... au ....

### Produits et stock

Le module produits gere:

- nom du produit;
- reference;
- categorie;
- prix de vente;
- prix d'achat moyen;
- quantite en stock;
- photo par URL;
- approvisionnement;
- mouvements de stock.

Sur mobile, les produits restent presentes comme sur ordinateur mais avec moins de colonnes visuelles, afin d'eviter le chevauchement des images.

### Categories

Les categories organisent les produits. Une categorie peut avoir une photo pour aider l'utilisateur a reconnaitre rapidement la famille de produits.

### Fournisseurs

Le fournisseur garde les informations d'identite et de contact. Le prix d'achat n'est pas garde directement sur le fournisseur, car il peut changer a chaque livraison. Le prix d'achat est saisi pendant l'approvisionnement.

### Rapports

Les rapports donnent des etats imprimables:

- dettes clients;
- ventes;
- livre de caisse;
- journal;
- inventaire;
- mouvements de stock;
- top clients.

Le rapport "Bilan" a ete retire de l'interface pour eviter la confusion avec les calculs simples du tableau de bord.

### Ou sont generes les rapports et les PDF ?

Les rapports ne sont pas stockes comme fichiers PDF permanents dans le projet. Les donnees restent dans MySQL, puis l'application genere les etats a la demande.

- Donnees backend: `backend/src/controllers/rapportController.js`
- Routes backend: `backend/src/routes/rapportRoutes.js`
- Appels frontend: `frontend/src/main.jsx`, dans le composant `Page` et le composant `Rapports`
- Mise en page imprimable/PDF: `frontend/src/main.jsx`, fonctions `printLayout`, `printDocument`, `printTableDocument` et `printRows`

Quand l'utilisateur clique sur "Imprimer", le frontend ouvre une page d'impression. Le fichier PDF est cree seulement si l'utilisateur choisit "Enregistrer en PDF" dans la boite d'impression du navigateur.

## Calculs importants

### Total vendu ce mois

Total TTC des factures creees pendant le mois. Il inclut les factures payees et non payees, car une facture creee represente une vente.

### Argent deja recu

Total des paiements reellement enregistres. C'est l'argent qui est deja entre dans la caisse.

### Cout d'achat des ventes

Quantite vendue multipliee par le prix d'achat du produit.

### Benefice du mois

Vente hors taxe moins cout d'achat des produits vendus.

Formule simple:

```text
benefice = quantite vendue x (prix de vente HT - prix d'achat)
```

Le benefice est un resultat commercial theorique lie a la vente. Le paiement montre seulement si l'argent est deja encaisse ou non.

## Architecture

```text
CRM-PME/
  backend/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
    scripts/
    crm_pme.sql
  frontend/
    src/
      main.jsx
    styles.css
  docs/
```

## Backend

Le backend est une API Node.js avec Express et MySQL.

Fonctions principales:

- authentification JWT;
- expiration du token reglee a 2h;
- controle des roles;
- CRUD des modules;
- routes de rapports;
- verification et evolution du schema SQL;
- envoi de notifications email si configure.

## Frontend

Le frontend est une application React avec Vite.

Fonctions principales:

- navigation par role;
- tableau de bord;
- formulaires;
- tableaux avec defilement horizontal sur mobile;
- popups;
- notifications visibles au-dessus des popups;
- design responsive pour telephone, tablette et desktop.

## Installation locale

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables d'environnement

Backend:

```text
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=crm_pme
JWT_SECRET=une_cle_secrete
```

Frontend:

```text
VITE_API_URL=http://localhost:5000/api
```

## Deploiement Render

Pour que les changements soient visibles sur Render:

1. pousser la branche `main` sur GitHub;
2. ouvrir Render;
3. verifier que le service backend et le service frontend pointent sur `main`;
4. lancer `Manual Deploy` si le redeploiement automatique ne part pas;
5. vider le cache du navigateur si l'ancien affichage reste visible.

Frontend:

```text
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Backend:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

## Methode Agile

Le projet peut etre explique avec la methode Agile de cette facon:

- les besoins ont ete decoupes en petits modules;
- chaque module correspond a une fonctionnalite visible;
- les captures d'ecran et les retours utilisateur ont servi de feedback;
- les corrections ont ete faites par iteration;
- GitHub Issues peut servir de backlog;
- les commits montrent l'evolution du projet;
- les tests et validations sont faits apres chaque lot de changements.

Exemple d'explication orale:

> Nous avons utilise une approche Agile parce que le besoin a evolue pendant le developpement. Au lieu d'attendre la fin pour tout corriger, nous avons travaille par petites parties: clients, ventes, paiements, stock, rapports et responsive. Apres chaque retour, nous avons corrige, teste et pousse sur GitHub. Les issues representent notre backlog et les commits representent les iterations.

## Documentation

Les documents detailles sont dans `docs/`:

- `DOCUMENTATION_BACKEND.md`;
- `DOCUMENTATION_FRONTEND.md`;
- `FONCTIONNEMENT_APPLICATION_DETAILLE.md`;
- `AGILE_BACKLOG_ISSUES.md`;
- `diagrammes-sequence/`.

## Verification

Commandes utiles:

```bash
cd frontend
npm run build
```

```bash
cd backend
npm start
```

## Etat actuel

Les corrections recentes concernent:

- rafraichissement direct des routes SPA via `frontend/public/_redirects`;
- menu equipe organise en accordeons Magasin, Commercial et Messages;
- module Commentaires pour conserver les formulaires du site public;
- fiche de mouvements reunissant approvisionnements et sorties issues des ventes;
- chatbot hybride: recherche SQL prioritaire, puis OpenAI si configure;
- chat plus naturel: salutations, remerciements, fautes courantes et questions d'aide ne sont plus transferees inutilement;
- avis IA facultatif pour le manager;
- cycle email CRM: verification, bienvenue, commande recue, statut, facture disponible, prospect, client inactif et nouveaute produit ciblee;
- message de bienvenue et recommandation hebdomadaire limitee pour la fidelisation;
- Mobile Money automatique lorsque le prestataire est configure, avec validation manuelle de secours;
- script `crm_pme.sql` autonome valide sur une base neuve, sans triggers metier en double;
- comprehension locale des fautes courantes du chat, meme sans appel IA;
- espace client complet avec inscription et verification de l'email par code;
- pages publiques distinctes avec footer, defilement et animations d'apparition;
- connexion unique: le serveur detecte automatiquement le type de compte;
- commandes, achats, factures, reclamations et paiement Mobile Money client;
- chat persistant en temps reel avec affichage optimiste sans page de chargement;
- assistant automatique, transfert au manager, notification interne et email professionnel;
- navigation metier reordonnee et sidebar defilable;
- controle des prix: commande et vente utilisent le prix de vente, jamais le cout d'achat;
- demandes Mobile Money verifiees par le caissier avant comptabilisation;
- responsive mobile/tablette;
- menu mobile pleine largeur;
- tableaux mobiles avec defilement horizontal;
- rapport mouvements de stock;
- suppression du bilan dans les rapports;
- fluidite du prix de vente dans la vente directe;
- notifications visibles au-dessus des popups;
- token d'authentification expire apres 2h.
