# Application mobile Expo

Cette application mobile reproduit la logique principale du site web:

- connexion avec le backend Render;
- appbar en haut;
- menu lateral;
- barre de navigation en bas;
- dashboard;
- clients;
- produits;
- fournisseurs;
- ventes;
- paiements;
- rapports.

## Lancer avec Expo Go

```bash
cd mobile
npm start
```

Scanner le QR Code avec Expo Go sur Android.

## Construire un APK

Installer EAS CLI si necessaire:

```bash
npm install -g eas-cli
```

Se connecter:

```bash
eas login
```

Construire l'APK:

```bash
npm run apk
```

Le profil `preview` dans `eas.json` genere un fichier APK installable.

Dernier build APK genere:

```text
https://expo.dev/accounts/sagelusenge/projects/quincaillerie-centrale-mobile/builds/718c6a3d-ea49-4d52-a8f2-b032b503d152
```

## API utilisee

```text
https://developpement-d-un-systeme-de-gestion.onrender.com/api
```
