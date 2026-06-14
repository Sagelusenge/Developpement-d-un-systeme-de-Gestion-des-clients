# Dossier backend/scripts

Ce dossier contient les scripts d'administration et de donnees.

Ils peuvent servir a initialiser la base, ajouter des donnees realistes, corriger des donnees anciennes ou faire des controles rapides.

Avant d'executer un script, verifier le fichier `.env` du backend pour etre certain de travailler sur la bonne base de donnees.

## Utilisation prudente

Les scripts peuvent modifier la base de donnees. Il faut donc verifier:

- le nom de la base;
- l'environnement utilise;
- le contenu du script;
- la presence d'une sauvegarde si la base contient de vraies donnees.

## Cas utiles

- remplir une base de demonstration;
- tester rapidement le tableau de bord;
- verifier des donnees de stock;
- corriger des donnees anciennes apres une evolution du schema.
