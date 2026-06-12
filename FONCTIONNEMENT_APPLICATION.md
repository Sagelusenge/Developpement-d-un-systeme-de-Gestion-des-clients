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

- `manager`: gere presque tout le systeme.
- `caissier`: gere les ventes, paiements, clients et rapports de caisse.
- `magasinier`: gere les produits, fournisseurs, categories, stock et approvisionnements.

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

