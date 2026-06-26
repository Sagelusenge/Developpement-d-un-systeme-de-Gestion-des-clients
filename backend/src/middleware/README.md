# Dossier backend/src/middleware

Ce dossier contient les traitements qui passent avant les controllers.

Ils servent surtout a:

- verifier le token JWT;
- identifier l'utilisateur connecte;
- bloquer les actions interdites selon le role;
- proteger les routes sensibles.

## Authentification

Le middleware d'authentification lit le header:

```text
Authorization: Bearer <token>
```

Si le token est valide, l'utilisateur est ajoute dans la requete. Si le token est absent, expire ou invalide, la route est bloquee.

## Roles

Les roles permettent de separer les responsabilites:

- manager: acces large;
- vendeur: ventes, factures, paiements;
- magasinier: produits, stock, fournisseurs.

## Token

Le token JWT expire apres 2h. Cette duree limite les risques si un appareil reste connecte trop longtemps.
