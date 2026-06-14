# Dossier backend/src/services

Ce dossier contient des fonctions partagees par plusieurs controllers.

Un service evite de dupliquer la meme logique dans plusieurs fichiers. Par exemple, `schemaService.js` verifie et complete certaines colonnes necessaires dans la base.

## Services utiles

- `schemaService.js`: verifie que certaines tables et colonnes existent.
- service mail: prepare l'envoi des emails et notifications quand la configuration SMTP est disponible.

## Role dans l'architecture

Un service ne represente pas une route. Il represente une logique reutilisable. Si deux controllers ont besoin de la meme operation, cette operation doit plutot etre placee dans un service.

## Exemple

La verification du schema permet de deployer plus facilement sur Render ou sur une nouvelle base, car l'API peut completer certaines colonnes attendues sans refaire toute l'installation manuellement.
