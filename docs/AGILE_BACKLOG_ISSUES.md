# Backlog Agile et issues GitHub proposees

Ce document sert a montrer au professeur que le projet a ete gere avec une logique Agile.
Les elements ci-dessous peuvent etre crees comme issues GitHub.
Chaque issue represente une user story, une amelioration, une correction ou une tache technique.

## Pourquoi ce document existe

L'integration GitHub disponible dans l'environnement n'a pas l'autorisation de creer directement les issues dans le depot.
Le contenu ci-dessous est donc pret a etre copie dans GitHub.
Il peut aussi servir de preuve de backlog dans la documentation du projet.

## Issue 1 - Authentification, roles et securite des sessions

### Objectif

Mettre en place une connexion securisee pour les utilisateurs de l'application.

### Description

En tant qu'utilisateur autorise, je veux me connecter avec mon email et mon mot de passe afin d'acceder uniquement aux modules qui correspondent a mon role.

### Taches

- Creer la route de connexion.
- Generer un token JWT.
- Limiter la duree du token a 2 heures.
- Proteger les routes backend.
- Gerer les roles manager, caissier et magasinier.

### Criteres d'acceptation

- Un utilisateur non connecte ne peut pas acceder aux routes protegees.
- Un utilisateur voit uniquement les menus de son role.
- Le token expire apres 2 heures.
- La deconnexion supprime la session locale.

## Issue 2 - Tableau de bord commercial

### Objectif

Afficher les indicateurs essentiels de l'entreprise.

### Description

En tant que manager, je veux voir rapidement le total vendu, l'argent deja recu, le cout des produits vendus et le gain du mois.

### Taches

- Afficher les cartes principales du tableau de bord.
- Calculer le total vendu TTC.
- Calculer l'argent deja recu.
- Calculer le cout des produits vendus.
- Calculer le gain sur les ventes HT.
- Retirer la barre de recherche globale du dashboard.

### Criteres d'acceptation

- Le dashboard charge sans erreur.
- Les montants correspondent aux donnees backend.
- La recherche globale n'apparait pas sur le dashboard.
- Les textes sont simples pour l'utilisateur.

## Issue 3 - Gestion des clients

### Objectif

Gerer les fiches clients et leur historique commercial.

### Description

En tant que caissier ou manager, je veux ajouter, rechercher, modifier et consulter les clients afin de suivre les ventes et les dettes.

### Taches

- Creer la liste des clients.
- Ajouter un formulaire de creation client.
- Ajouter la recherche client.
- Afficher le chiffre d'affaires client.
- Afficher l'historique client.

### Criteres d'acceptation

- Un client peut etre cree.
- Un client peut etre retrouve par nom ou telephone.
- L'historique affiche les factures liees au client.
- Les actions sont protegees selon le role.

## Issue 4 - Ventes et factures

### Objectif

Permettre la creation de factures avec plusieurs produits.

### Description

En tant que caissier, je veux creer une facture en recherchant un client et des produits afin d'enregistrer une vente.

### Taches

- Ajouter la recherche client dans le formulaire de vente.
- Ajouter la recherche produit.
- Calculer les lignes de vente.
- Imprimer une facture.
- Mettre a jour le stock apres vente.

### Criteres d'acceptation

- Une facture peut etre creee avec un ou plusieurs produits.
- Le client est selectionne avec une recherche.
- Le stock diminue apres validation.
- Le total de la facture est correct.

## Issue 5 - Paiements et caisse

### Objectif

Suivre l'argent reellement encaisse.

### Description

En tant que caissier, je veux enregistrer les paiements et filtrer la caisse par periode afin de connaitre l'argent recu.

### Taches

- Enregistrer un paiement sur une facture.
- Verifier que le paiement ne depasse pas le reste a payer.
- Filtrer la caisse du jour.
- Filtrer la caisse hebdomadaire.
- Filtrer la caisse du mois.
- Filtrer la caisse du ... au ...

### Criteres d'acceptation

- Un paiement est lie a une facture.
- Le total caisse change selon la periode.
- Les filtres affichent les bonnes lignes.
- Le mode de paiement est visible.

## Issue 6 - Produits, stock et photos

### Objectif

Gerer le catalogue produit et le stock.

### Description

En tant que magasinier, je veux gerer les produits, leurs photos, leurs prix et leur stock afin de suivre les marchandises.

### Taches

- Creer les produits.
- Ajouter une URL de photo produit.
- Afficher une image par defaut si aucune photo n'existe.
- Afficher le stock.
- Afficher le statut OK, ALERTE ou RUPTURE.
- Retirer les messages explicatifs inutiles dans l'ecran produits.

### Criteres d'acceptation

- Un produit affiche une image.
- Le produit peut etre recherche.
- Le stock est visible.
- Les textes sont simples.

## Issue 7 - Categories avec photos

### Objectif

Organiser les produits par categories.

### Description

En tant que magasinier, je veux creer des categories avec photos afin de mieux organiser les produits.

### Taches

- Creer une categorie.
- Modifier une categorie.
- Ajouter une URL de photo.
- Afficher une image par defaut si aucune URL n'est fournie.
- Lier les produits a une categorie.

### Criteres d'acceptation

- Une categorie peut etre creee.
- Une categorie peut avoir une photo.
- Les produits peuvent etre filtres par categorie.

## Issue 8 - Fournisseurs sans affichage de prix global

### Objectif

Gerer uniquement les contacts fournisseurs et les approvisionnements.

### Description

En tant que magasinier, je veux voir les fournisseurs sans afficher un prix d'achat global afin d'eviter une mauvaise interpretation.

### Taches

- Supprimer le message explicatif dans la page fournisseurs.
- Supprimer la colonne Achats.
- Supprimer la valeur total_achats cote API.
- Garder uniquement le nombre d'approvisionnements.

### Criteres d'acceptation

- La page fournisseurs n'affiche plus la colonne Achats.
- Aucun message long ne s'affiche au-dessus du tableau.
- L'API fournisseurs ne renvoie plus total_achats.

## Issue 9 - Rapports et impressions

### Objectif

Produire des rapports utiles pour la gestion.

### Description

En tant que manager, je veux imprimer les rapports de ventes, caisse, dettes et stock afin de suivre l'activite de l'entreprise.

### Taches

- Afficher les factures.
- Afficher les dettes clients.
- Afficher le livre de caisse.
- Afficher le bilan.
- Afficher l'inventaire.
- Ajouter des boutons d'impression.

### Criteres d'acceptation

- Les rapports sont lisibles.
- Les filtres de periode fonctionnent.
- Les impressions contiennent les bonnes colonnes.

## Issue 10 - Responsive mobile

### Objectif

Adapter l'application aux telephones.

### Description

En tant qu'utilisateur mobile, je veux naviguer facilement avec un bouton menu, des icones visibles et des tableaux lisibles.

### Taches

- Afficher une topbar mobile claire.
- Garder menu, cloche, aide et profil sur une ligne.
- Afficher la recherche sous les icones quand elle est utile.
- Ouvrir et fermer la navigation avec le meme bouton menu.
- Transformer les tableaux en cartes sur mobile.
- Eviter les colonnes de navigation cassees.

### Criteres d'acceptation

- Le dashboard est lisible sur telephone.
- Le bouton menu ouvre et ferme la nav.
- Les cartes KPI ne debordent pas.
- Les tableaux restent lisibles.

## Issue 11 - Documentation utilisateur et technique

### Objectif

Documenter le projet pour la presentation, la maintenance et l'evaluation.

### Description

En tant qu'etudiant, je veux disposer d'une documentation complete pour expliquer l'application au professeur.

### Taches

- Rediger le README principal.
- Rediger le fonctionnement detaille.
- Rediger la documentation backend.
- Rediger la documentation frontend.
- Expliquer les roles.
- Expliquer les calculs.
- Expliquer le deploiement.

### Criteres d'acceptation

- Chaque document important contient au moins 500 lignes.
- Les documents sont places dans le depot.
- Les explications sont simples et coherentes.

## Issue 12 - Deploiement Render

### Objectif

Deployer l'application en ligne.

### Description

En tant que manager technique, je veux deployer le frontend et le backend sur Render afin que l'application soit accessible en ligne.

### Taches

- Connecter Render au depot GitHub.
- Deployer depuis la branche main.
- Configurer les variables d'environnement backend.
- Configurer JWT_EXPIRES_IN=2h.
- Redemarrer le backend.
- Redemarrer le frontend.
- Utiliser Clear build cache & deploy si l'ancien code reste visible.

### Criteres d'acceptation

- Render utilise la branche main.
- L'ancien message fournisseur n'apparait plus.
- Le frontend charge le dernier build.
- Le backend utilise les nouvelles routes et variables.

## Comment expliquer la methode Agile au professeur

Nous pouvons expliquer que nous avons utilise une approche Agile parce que le projet a evolue par petites iterations.
Au lieu de tout construire d'un seul coup, nous avons decoupe le travail en modules et en user stories.

### Exemple d'explication orale

Nous avons utilise la methode Agile en travaillant par sprints courts.
Chaque sprint correspondait a un ensemble de fonctionnalites prioritaires.
Par exemple, nous avons commence par l'authentification et les roles, puis nous avons ajoute les clients, les produits, les ventes, les paiements, les rapports et enfin les corrections responsive.
Apres chaque iteration, nous avons teste l'application, corrige les retours et pousse les modifications sur GitHub.

### Pourquoi Agile convient a ce projet

- Le besoin a change plusieurs fois pendant le developpement.
- Certains textes devaient etre simplifies apres observation de l'interface.
- La responsivite mobile a ete corrigee apres tests visuels.
- Les fournisseurs ont ete ajustes apres retour utilisateur.
- Les paiements ont recu de nouveaux filtres apres analyse de l'utilisation reelle.
- Les documents ont ete enrichis en fin de projet pour la presentation.

### Les elements Agile visibles dans le projet

- Backlog: liste des issues et fonctionnalites a faire.
- Sprint: groupe de taches realisees dans une periode courte.
- User story: besoin exprime du point de vue utilisateur.
- Increment: version utilisable apres chaque ajout.
- Feedback: retour apres test ou capture d'ecran.
- Iteration: correction progressive jusqu'a atteindre le resultat voulu.
- Definition of Done: build reussi, push GitHub, comportement verifie.

### Reponse courte si le professeur demande

Nous avons applique Agile en decoupant le projet en petites user stories.
Chaque fonctionnalite a ete developpee, testee, corrigee puis poussee sur GitHub.
Les retours obtenus apres chaque test ont permis d'ameliorer l'application progressivement.
Cette methode nous a aide a adapter le projet aux besoins reels: roles, ventes, paiements, fournisseurs, rapports, documentation et responsive mobile.

### Exemple de sprint

Sprint 1: authentification, roles et structure backend.
Sprint 2: clients, produits et categories.
Sprint 3: ventes, factures et stock.
Sprint 4: paiements, caisse et rapports.
Sprint 5: responsive, textes simples, fournisseurs et documentation.

### Conclusion

La methode Agile nous a permis de livrer une application utilisable progressivement.
Chaque correction venait d'un besoin observe.
Le projet final est donc le resultat de plusieurs iterations controlees.
