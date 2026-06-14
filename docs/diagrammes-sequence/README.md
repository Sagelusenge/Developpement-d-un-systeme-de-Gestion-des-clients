# Dossier docs/diagrammes-sequence

Ce dossier contient les diagrammes de sequence du systeme.

Chaque fichier decrit un flux:

- `01-authentification.md`: connexion et verification utilisateur.
- `02-approvisionnement.md`: entree de stock avec fournisseur et prix d'achat.
- `03-vente.md`: creation de vente, facture et paiement.
- `04-rapports.md`: generation des rapports.
- `05-notifications.md`: notifications et alertes.

## Utilite pour la presentation

Les diagrammes de sequence montrent l'ordre des actions entre l'utilisateur, le frontend, le backend et la base de donnees. Ils aident a expliquer le fonctionnement sans entrer directement dans le code.

## Conseil

Pour un jury ou un professeur, commencer par le diagramme de vente. C'est le flux le plus parlant: choix client, choix produit, creation facture, sortie de stock, puis paiement si le client regle.
