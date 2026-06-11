# Quincaillerie Centrale - Backend

Le systeme est configure pour une seule entreprise: Quincaillerie Centrale.

## Acces manager initial

- Email: `sage.kitsa@quincaillerie-centrale.cd`
- Role: `manager`
- Le mot de passe initial est stocke en base sous forme de hash SHA-256, pas en clair.

## Modules actifs

- Authentification utilisateur
- Tableau de bord
- Clients
- Produits et stock
- Categories
- Factures / ventes
- Paiements
- Rapports
- Utilisateurs internes
- Emails et notifications

## Modules retires

- Super admin
- Devis
- Lignes de devis

## Reinitialiser la base locale

Depuis `backend`:

```bash
npm run db:reset:quincaillerie
```

Ce script supprime les anciennes structures super admin et devis, vide les donnees metier, puis recree uniquement Quincaillerie Centrale et son manager.
