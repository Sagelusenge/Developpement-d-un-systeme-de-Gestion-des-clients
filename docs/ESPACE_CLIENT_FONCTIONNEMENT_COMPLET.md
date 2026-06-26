# Espace client - fonctionnement complet

Ce document explique tout ce qu'un client peut faire dans le systeme CRM Quincaillerie Centrale, depuis son inscription jusqu'au suivi de ses achats, commandes, reclamations et conversations.

## 1. Creation du compte client

Le client peut creer un compte depuis la page publique d'inscription.

Informations demandees:

- nom;
- postnom;
- telephone;
- adresse email;
- mot de passe;
- confirmation du mot de passe;
- acceptation de la creation de l'espace client.

Apres l'envoi du formulaire, le systeme cree une demande d'inscription temporaire et envoie un code de confirmation a l'adresse email du client.

Regles appliquees:

- l'email est normalise en minuscules;
- le mot de passe est chiffre avant stockage;
- le code email expire apres une duree limitee;
- le compte client n'est actif qu'apres confirmation de l'email;
- un email de bienvenue est envoye apres activation.

## 2. Verification de l'email

Le client saisit le code recu par email.

Si le code est correct:

- le client est cree dans la table `client`;
- son email est marque comme verifie;
- son espace personnel devient actif;
- il recoit un token de connexion;
- il est redirige vers son espace client.

Si le code est incorrect ou expire, le client peut demander un nouveau code.

## 3. Connexion client

La page de connexion est unique pour toute l'application.

Le client saisit:

- son adresse email;
- son mot de passe.

Le backend detecte automatiquement si le compte correspond a un client ou a un utilisateur interne. Le client n'a donc pas besoin de choisir entre "client", "manager", "vendeur" ou "magasinier".

Apres connexion, le client voit uniquement les pages autorisees pour lui:

- Mon espace;
- Mes achats;
- Commandes;
- Reclamations;
- Assistance;
- Deconnexion.

## 4. Mot de passe oublie

Le client peut demander une reinitialisation de mot de passe.

Fonctionnement:

1. Il saisit son email.
2. Le systeme envoie un code de recuperation.
3. Le client saisit le code.
4. Il definit un nouveau mot de passe.
5. Le systeme confirme par email que le mot de passe a ete modifie.

Les codes et mots de passe ne sont jamais stockes en clair.

## 5. Tableau de bord client - Mon espace

La page "Mon espace" donne au client une vue rapide de son activite.

Elle affiche notamment:

- le nombre de commandes;
- les dernieres commandes;
- les factures recentes;
- les statuts principaux;
- des raccourcis vers Commander, Mes achats, Reclamations et Assistance.

Objectif: permettre au client de retrouver rapidement ce qu'il a fait avec l'entreprise.

## 6. Catalogue client

Dans la page Commandes, le client voit le catalogue disponible.

Le catalogue affiche uniquement:

- les produits en stock;
- les produits dont le prix de vente couvre le cout d'achat;
- le nom du produit;
- la categorie;
- l'unite;
- le stock disponible;
- le prix de vente TTC;
- la photo si elle existe.

Le client ne voit jamais le prix d'achat.

## 7. Panier et creation de commande

Le client peut ajouter des produits au panier.

Regles:

- la quantite ne peut pas depasser le stock disponible;
- le montant est calcule avec le prix de vente catalogue;
- le backend relit toujours les prix depuis la base;
- le client peut ajouter une note pour l'equipe;
- une commande est creee avec le statut `en_attente`.

Apres creation:

- le manager et/ou l'equipe recoivent une notification;
- le client recoit un email de confirmation de commande;
- la commande apparait dans le suivi client.

## 8. Suivi des commandes

Le client peut consulter ses commandes.

Informations affichees:

- reference de commande;
- date;
- nombre d'articles;
- montant TTC;
- statut;
- facture associee si la commande a ete transformee en facture.

Statuts possibles:

- `en_attente`: commande envoyee, pas encore traitee;
- `confirmee`: commande acceptee;
- `preparee`: commande en preparation;
- `livree`: commande livree;
- `annulee`: commande annulee;
- `rejetee`: commande refusee.

Chaque changement important peut declencher un email au client.

## 9. Transformation en facture

Le client ne transforme pas lui-meme une commande en facture.

Cette action est faite par le vendeur.

Lors de la facturation:

- le stock est verifie;
- le prix de vente de la commande est controle;
- le systeme bloque une facturation si le prix de vente est inferieur au cout actuel;
- une facture est creee;
- le stock est diminue;
- le client recoit un email indiquant que la facture est disponible.

## 10. Mes achats et factures

Le client peut consulter ses factures dans "Mes achats".

Informations affichees:

- numero de facture;
- date;
- montant total;
- montant deja paye;
- reste a payer;
- statut de paiement.

Statuts visibles:

- `Paye`;
- `Partiel`;
- `Impaye`.

Pour le moment, le paiement Mobile Money, carte et virement sont masques cote frontend. Le backend conserve la logique pour une activation future.

## 11. Reclamations

Le client peut envoyer une reclamation directement au manager.

Informations possibles:

- sujet;
- message;
- commande concernee si applicable.

Apres envoi:

- la reclamation est stockee;
- le manager la voit dans son espace;
- une notification est creee;
- le client peut suivre le traitement.

Statuts:

- `ouverte`;
- `en_cours`;
- `resolue`;
- `cloturee`.

## 12. Assistance et chat

Le client peut discuter avec l'assistant automatique.

Le chat permet de:

- poser une question sur un produit;
- demander un prix;
- demander le stock;
- demander le suivi d'une commande;
- demander le statut d'une facture;
- poser une question sur une reclamation;
- obtenir une orientation generale.

Si l'IA ou l'assistant ne peut pas repondre de maniere fiable, la conversation peut etre transmise au manager. Les messages sont conserves dans l'historique, comme une conversation professionnelle.

## 13. Emails CRM envoyes au client

Le systeme peut envoyer plusieurs emails professionnels:

- code de verification d'inscription;
- bienvenue apres activation;
- confirmation de reception d'un message envoye depuis la page Contact / Accueil;
- confirmation de commande;
- changement de statut de commande;
- facture disponible;
- confirmation de reception d'une reclamation;
- mise a jour du statut d'une reclamation;
- reinitialisation de mot de passe;
- confirmation de changement de mot de passe;
- relance prospect apres un delai configure;
- recommandation de produits selon l'historique d'achat;
- nouveaute produit dans une categorie deja achetee.

Ces emails sont transactionnels ou de fidelisation limitee. Le systeme evite le harcelement: les relances automatiques sont espacees, les recommandations sont basees sur des produits disponibles, et les emails importants sont declenches par une action claire du client ou de l'equipe.

## 13.1 Notifications internes liees au client

Certaines actions client creent aussi des notifications internes:

- une nouvelle commande notifie le manager et le vendeur;
- une reclamation notifie le manager;
- un message depuis la page Contact notifie le manager;
- une conversation chat complexe peut notifier le manager.

Le vendeur recoit donc les notifications utiles a son travail commercial, principalement les nouvelles commandes client. Les reclamations restent cote manager afin d'eviter qu'un vendeur traite une plainte sensible sans validation.

## 14. Fidelisation client

Le systeme classe les clients selon leur activite commerciale.

Exemples de statuts:

- prospect;
- nouveau client;
- client regulier;
- client fidele;
- VIP.

Pour un prospect sans achat, le systeme peut envoyer un email de decouverte apres le delai configure. Pour un client ayant deja achete, les recommandations peuvent s'appuyer sur les categories et produits deja achetes.

## 15. Securite cote client

Mesures appliquees:

- authentification par token JWT;
- routes protegees;
- chaque client ne voit que ses propres commandes, achats et reclamations;
- mot de passe chiffre;
- codes de verification limites dans le temps;
- donnees sensibles masquees dans le journal d'audit;
- prix d'achat invisible pour le client.

## 16. Ce que le client ne peut pas faire

Le client ne peut pas:

- creer une vente;
- creer une facture;
- modifier le stock;
- voir le prix d'achat;
- voir les autres clients;
- voir les rapports internes;
- voir les utilisateurs internes;
- confirmer un paiement;
- consulter les archives internes;
- gerer les produits ou fournisseurs.

## 17. Parcours complet type

1. Le client cree son compte.
2. Il confirme son email.
3. Il se connecte.
4. Il consulte le catalogue.
5. Il ajoute des produits au panier.
6. Il envoie une commande.
7. Il recoit un email de confirmation.
8. Le vendeur traite la commande.
9. La commande est transformee en facture.
10. Le client recoit l'email de facture disponible.
11. Il consulte ses achats.
12. Il peut envoyer une reclamation ou discuter dans le chat.
13. Le CRM continue la fidelisation par emails ou recommandations utiles.
