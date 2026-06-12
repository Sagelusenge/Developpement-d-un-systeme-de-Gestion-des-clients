# Dossier backend/src/middleware

Ce dossier contient les traitements qui passent avant les controllers.

Ils servent surtout a:

- verifier le token JWT;
- identifier l'utilisateur connecte;
- bloquer les actions interdites selon le role;
- proteger les routes sensibles.

