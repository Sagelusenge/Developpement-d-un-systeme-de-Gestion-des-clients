# CRM PME - Quincaillerie Centrale

Application web de gestion commerciale pour une PME ou une quincaillerie.

Le projet contient deux parties principales:

- `backend`: API Node.js/Express connectee a MySQL.
- `frontend`: interface React/Vite consommatrice de l'API.

Le guide metier et la procedure d'utilisation sont dans [FONCTIONNEMENT_APPLICATION.md](FONCTIONNEMENT_APPLICATION.md).

## Demarrage local

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

La variable importante du frontend est:

```text
VITE_API_URL=http://localhost:5000/api
```

En production Render, elle doit pointer vers l'API:

```text
VITE_API_URL=https://developpement-d-un-systeme-de-gestion.onrender.com/api
```

## Documentation

- API mobile: `backend/API_MOBILE.md`.
- Fonctionnement general: `FONCTIONNEMENT_APPLICATION.md`.
- Diagrammes: `docs/diagrammes-sequence`.

