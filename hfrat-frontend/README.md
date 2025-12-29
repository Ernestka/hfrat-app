# HFRAT Frontend (React + Vite)

Minimal React app that communicates with the HFRAT Django API via JWT.

## Setup

```bash
npm install
npm run dev
```

Base API: `http://127.0.0.1:8000/api/`

## Auth
- Logs in via `POST /api/token/` with `username` and `password`.
- Stores `access` token in `localStorage` under key `access`.
- Axios attaches `Authorization: Bearer <access>` automatically.

## Routes
- `/login` – Username/password form to obtain JWT
- `/reporter` – Protected form to submit/update resource report
- `/monitor` – Protected dashboard listing all facilities’ latest reports

## Files
- `src/services/api.js` – Axios instance with base URL and auth header
- `src/components/ProtectedRoute.jsx` – Guards protected pages by checking token
- `src/pages/*` – Page components
