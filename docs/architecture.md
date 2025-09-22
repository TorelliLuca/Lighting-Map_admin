# Architettura e Struttura del Progetto

## Stack Tecnologico
- Frontend: React 18 + Vite
- Styling: TailwindCSS
- UI: componenti custom e Radix UI (Tabs, Dialog, ecc.)
- Grafici: Recharts, Chart.js
- Animazioni: Framer Motion
- HTTP client: Axios

## Struttura Cartelle Principale
```
root/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ common/           # Componenti riutilizzabili base (Button, Input, Card, Alert, ecc.)
│  │  ├─ layout/           # Navbar, Sidebar, Footer
│  │  └─ ui/               # Componenti UI avanzati (glass-card, dialog, modern-*)
│  ├─ pages/               # Pagine applicative (UpdateTownhall, AccessLogsDashboard, ...)
│  ├─ services/            # Client API (axios) e servizi
│  ├─ context/             # Context globali (es. UserContext)
│  ├─ utils/               # Helper e formatter
│  ├─ App.jsx              # Root app
│  └─ App.css
├─ .env.development        # Config sviluppo
├─ .env.production         # Config produzione
├─ tailwind.config.js      # Config Tailwind
├─ vite.config.js          # Config Vite
└─ package.json
```

## Flussi Principali
- Autenticazione/Utente (indiretta): informazioni utente dal `UserContext` (es. in `AccessLogsDashboard.jsx`).
- Gestione Comuni: pagina `UpdateTownhall.jsx` per aggiornare/creare comuni da CSV, con suggerimenti e mappa interattiva (Leaflet via CDN).
- Access Logs: pagina `AccessLogsDashboard.jsx` per statistiche e insight tramite `accessLogService`.

## Comunicazione con Backend
- `src/services/api.js` definisce istanza `axios` con `baseURL` da `VITE_SERVER_URL` e i servizi:
  - `townHallService`: CRUD comuni, download CSV/Excel, suggerimenti e geo info.
  - `userService`: gestione utenti e metriche.
  - `accessLogService`: statistiche di accesso, heatmap, trend.
  - `organizationService`: CRUD organizzazioni e operazioni correlate.

## Sicurezza e Dati Sensibili
- Le variabili `.env` non vanno committate con segreti.
- I download di file sono gestiti come `blob` lato client.

## Note di Manutenzione
- Aggiornare `docs/services.md` quando si modificano endpoint o parametri.
- Tenere sincronizzata la sezione pagine/Componenti in `docs/pages.md` e `docs/components.md` se si introducono nuove view o componenti.
