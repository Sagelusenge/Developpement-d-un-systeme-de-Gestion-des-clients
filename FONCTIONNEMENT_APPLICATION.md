# Fonctionnement de l'application

Cette application sert a gerer une quincaillerie ou une PME commerciale: clients, fournisseurs, produits, stock, ventes, paiements, factures, rapports et utilisateurs.

## Logique du benefice

Le benefice n'est pas calcule avec l'argent recu. Il est calcule avec le prix d'achat et le prix de vente des produits vendus.

Formule utilisee:

```text
Benefice brut = (prix de vente HT - prix d'achat) x quantite vendue
```

Exemple:

```text
10 sacs de ciment achetes a 10 USD le sac
Prix de vente choisi: 14 USD le sac
Benefice par sac: 14 - 10 = 4 USD
Benefice total: 4 x 10 = 40 USD
```

Sur le dashboard:

- `Ventes facturees (mois)` = total TTC des factures du mois.
- `Argent encaisse (mois)` = total des paiements recus pendant le mois.
- `Cout marchandises vendues` = cout d'achat des produits qui ont ete vendus.
- `Benefice brut (mois)` = ventes HT moins cout d'achat des produits vendus.

Il est donc possible que les ventes facturees et l'argent encaisse soient identiques si toutes les factures du mois ont ete payees. Le benefice reste separe, car il depend du cout d'achat des marchandises.

## Fournisseurs et prix d'achat

Un fournisseur ne porte pas directement un prix fixe. Le fournisseur garde surtout l'identite, le telephone, l'email et l'adresse.

Le prix d'achat est saisi au moment de l'approvisionnement, parce qu'un meme fournisseur peut vendre le meme produit a un prix different selon la date, le transport, la quantite ou la negociation.

## Procedure d'utilisation

1. Se connecter avec un compte autorise.
2. Ajouter les fournisseurs dans `Fournisseurs`.
3. Ajouter les categories dans `Categories`.
4. Ajouter les produits dans `Produits` avec leur reference, unite, prix d'achat, prix de vente et seuil d'alerte.
5. Faire un approvisionnement depuis `Produits` en choisissant le fournisseur, la quantite et le prix d'achat reel.
6. Ajouter les clients dans `Clients`.
7. Creer une vente dans `Ventes` ou `Vente directe`.
8. Enregistrer le paiement dans `Paiements`.
9. Verifier le dashboard pour voir les ventes, les encaissements, le cout d'achat et le benefice.
10. Consulter `Rapports` pour les factures, dettes clients, livre de caisse, bilan, journal et inventaire.

## Roles

- `manager`: supervise les clients, commandes, reclamations, rapports, chat, emails et utilisateurs; il ne cree pas les ventes ni les encaissements.
- `caissier`: gere les ventes, paiements, clients et rapports de caisse.
- `magasinier`: gere les produits, fournisseurs, categories, stock et approvisionnements.
- `client`: commande, consulte ses achats et factures, transmet un paiement Mobile Money, reclame et utilise le chat.

## Rapports

Les rapports s'ouvrent sur la periode mensuelle par defaut. Cela evite d'afficher une page vide quand il n'y a pas eu d'operation le jour meme.

Les principaux rapports sont:

- Factures.
- Dettes clients.
- Livre de caisse.
- Bilan.
- Journal.
- Inventaire.
- Top clients.

## Espace client, chat et Mobile Money

1. Le nouveau client cree son compte depuis le site public et confirme son adresse avec le code recu par email.
2. La connexion est unique; le backend reconnait automatiquement client, manager, caissier ou magasinier.
3. Le client choisit les produits disponibles au prix de vente catalogue. Le backend recalcule lui-meme le total et bloque un prix de vente inferieur au cout.
4. Une commande peut ensuite etre suivie jusqu'a sa facture. Les achats affichent montant, total paye et reste.
5. Pour Mobile Money, le client selectionne M-Pesa, Airtel Money ou Orange Money, puis fournit telephone, montant et reference de transaction.
6. La demande reste `en_attente`: elle n'entre pas dans la caisse avant confirmation du caissier. Le caissier peut la confirmer ou la rejeter.
7. Dans le chat, le message apparait immediatement chez l'expediteur. Un flux temps reel avertit l'autre interlocuteur sans rechargement de page.
8. Le bot repond aux questions fiables et consulte les references `CMD-...` ou `FAC-...`. Sinon, il transfere la question au manager, cree une notification et envoie un email professionnel.

## Navigation actuelle

Pour le manager, l'ordre de reference est: Tableau de bord, Clients, Fournisseurs, Categories, Produits, Ventes, Paiements, Commandes, Reclamations, Rapports, Chat, Emails, Utilisateurs, Deconnexion. Les entrees sont ensuite filtrees selon les permissions de chaque role.

Le menu equipe est maintenant regroupe:

- `Magasin`: Fournisseurs, Categories, Produits;
- `Commercial`: Ventes, Paiements, Commandes, Reclamations;
- `Messages`: Chat, Emails, Commentaires.

Un seul bloc peut rester ouvert. L'espace client conserve ses petits boutons simples.

## Intelligence, fidelisation et commentaires

- Le formulaire Contact cree une ligne dans `public_contacts`, puis notifie le manager.
- Le chatbot reconnait des variantes comme `bonhour` et cherche d'abord prix et stock dans MySQL.
- OpenAI fonctionne seulement dans le backend avec `OPENAI_API_KEY`; aucune cle ne doit etre placee dans React.
- Un nouveau client recoit un message de bienvenue, puis au maximum une recommandation par semaine fondee sur le stock reel.
- Le manager peut demander une analyse IA de ses indicateurs.

### Email du prospect sans achat

Pour les tests, `PROSPECT_FOLLOWUP_HOURS=24`. Une fois ce delai atteint, un compte actif avec email verifie et aucune vente recoit un unique email de decouverte. L'email contient exactement trois produits disponibles, leur prix de vente, leur unite et un bouton vers la connexion. La campagne `prospect_discovery_v1` est journalisee dans `prospect_email_campaigns`, ce qui empeche un second envoi. En production, remplacer 24 par 168.

### Segmentation du portefeuille client

- `Prospect`: aucun achat;
- `Nouveau client`: exactement un achat;
- `Client regulier`: de 2 a 4 achats;
- `Client fidele`: au moins 5 achats ou 1 000 USD de chiffre d'affaires;
- `VIP`: au moins 10 achats ou 5 000 USD de chiffre d'affaires.

Les niveaux les plus eleves sont prioritaires. Par exemple, un client avec seulement trois achats mais 5 000 USD de chiffre d'affaires est classe VIP. La page Clients peut etre filtree sur chacun de ces statuts.

## Paiement Mobile Money automatique

Avec `MOBILE_MONEY_PROVIDER_URL` et `MOBILE_MONEY_PROVIDER_KEY`, laisser la reference vide lance la demande chez le prestataire. Si celui-ci confirme immediatement, le paiement entre directement dans la caisse. Sans prestataire configure, le client saisit la reference de son transfert et le caissier la verifie. Une commande doit d'abord etre transformee en facture.
