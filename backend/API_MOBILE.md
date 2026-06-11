# Documentation API Mobile - Quincaillerie Centrale

Base URL locale: `http://localhost:5000/api`

En production, remplacer par l'URL du backend deploye.

## Authentification

Toutes les routes protegees utilisent:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Connexion

`POST /auth/login`

Body:

```json
{
  "email": "sage.kitsa@quincaillerie-centrale.cd",
  "password": "12345678"
}
```

Reponse:

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "USR-00001",
    "nom": "KITSA LUSENGE Sage",
    "email": "sage.kitsa@quincaillerie-centrale.cd",
    "telephone": "+243...",
    "role": "manager",
    "entreprise_id": "ENT-...",
    "entreprise_nom": "Quincaillerie Centrale"
  }
}
```

### Profil connecte

`GET /auth/me`

### Modifier profil

`PUT /auth/profile`

Body:

```json
{
  "nom": "KITSA LUSENGE Sage",
  "telephone": "+243 990 000 001"
}
```

### Changer mot de passe

`POST /auth/change-password`

Body:

```json
{
  "new_password": "nouveauMotDePasse",
  "confirm_password": "nouveauMotDePasse"
}
```

## Dashboard

### Statistiques

`GET /dashboard/stats`

Retourne clients, chiffre du mois, argent recu, cout d'achat et resultat du mois.

### Resultat mensuel

`GET /dashboard/resultat-mensuel`

Retourne par mois:

```json
{
  "mois": "Jun",
  "ventes_ht": 1000,
  "cout_achat": 700,
  "resultat": 300
}
```

Formule:

```text
benefice/perte = somme((prix_vente_unitaire - prix_achat_unitaire) * quantite)
```

## Fournisseurs

### Liste

`GET /fournisseurs`

### Ajouter

`POST /fournisseurs`

```json
{
  "nom": "Katanga Materiaux",
  "telephone": "+243 990 120 111",
  "email": "vente@example.cd",
  "adresse": "Lubumbashi"
}
```

### Modifier

`PUT /fournisseurs/:id`

### Supprimer

`DELETE /fournisseurs/:id`

Un fournisseur deja utilise dans un approvisionnement n'est pas supprime afin de garder l'historique.

## Produits et stock

### Liste produits

`GET /produits`

### Ajouter produit

`POST /produits`

```json
{
  "reference_produit": "CIM-42",
  "nom": "Ciment gris 42.5",
  "categorie_id": "CAT-...",
  "prix_ht": 20,
  "taux_tva": 16,
  "quantite_stock": 0,
  "seuil_alerte": 10,
  "photo_url": ""
}
```

### Approvisionner

`POST /produits/:id/approvisionner`

```json
{
  "fournisseur_id": "FOU-...",
  "quantite": 50,
  "prix_achat": 12,
  "note": "Premier achat"
}
```

Le backend calcule:

```text
prix_achat_total = quantite * prix_achat
```

Le produit garde un coût moyen pondéré pour calculer le bénéfice des ventes.
Chaque mouvement stock conserve aussi son prix exact pour l'historique.

Exemple:

```text
10 pièces à 12 USD + 10 pièces à 15 USD = coût moyen 13,50 USD
```

### Mouvements recents

`GET /produits/mouvements-recents`

Retourne produit, fournisseur, quantite, prix achat unitaire, prix achat total et date.

## Ventes / factures

### Liste factures

`GET /ventes`

### Creer une vente

`POST /ventes`

```json
{
  "client_id": "CLI-...",
  "articles": [
    {
      "produit_id": "PRD-...",
      "quantite": 3,
      "prix": 20
    }
  ]
}
```

Important:

- `prix` est le prix de vente unitaire saisi par le caissier.
- Le backend prend le prix d'achat courant du produit au moment de la vente.
- Le stock est verifie puis diminue.
- La facture est creee automatiquement.
- Le benefice/perte est calcule dans les rapports avec `prix - prix_achat_unitaire`.

### Detail facture

`GET /ventes/:id`

Retourne les lignes avec:

- `prix_unitaire_ht`
- `prix_achat_unitaire`
- `total_ht`
- `cout_total`
- `resultat_ligne_ht`

### Modifier facture

`PUT /ventes/:id`

Impossible si la facture a deja un paiement.

### Supprimer facture

`DELETE /ventes/:id`

Impossible si la facture a deja un paiement.

## Paiements

### Enregistrer paiement

`POST /paiements`

```json
{
  "vente_id": "FAC-...",
  "montant": 100,
  "mode_paiement": "especes",
  "reference_externe": "",
  "telephone_payeur": ""
}
```

Modes:

- `especes`
- `carte`
- `virement`
- `mobile_money`

Pour `mobile_money`, `reference_externe` et `telephone_payeur` sont requis.

## Rapports

Les rapports acceptent les filtres:

```http
?date_debut=2026-06-01&date_fin=2026-06-30
```

### Bilan

`GET /rapports/bilan`

Retourne:

- `ventes_ht`
- `cout_achat`
- `resultat`
- `total_factures`

### Journal

`GET /rapports/journal`

### Livre de caisse

`GET /rapports/livre-caisse`

### Valeur stock

`GET /rapports/stock`

### Creances

`GET /rapports/creances`

## Notifications

### Liste

`GET /notifications`

### Marquer comme lue

`PUT /notifications/:id/read`

Le compteur mobile doit compter uniquement les notifications avec `lu = false`.
