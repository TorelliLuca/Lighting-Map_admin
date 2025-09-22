# Guida Rapida (Getting Started)

Questa guida spiega come configurare, avviare e buildare il progetto.

## Prerequisiti
- Node.js >= 18
- npm >= 9

## Installazione dipendenze
```bash
npm install
```

## Variabili d'ambiente
Configurare i file `.env.development` e `.env.production`. Vedi `docs/env.md`.

Variabile obbligatoria:
- `VITE_SERVER_URL`: base URL del backend per le chiamate API.

## Avvio in sviluppo
```bash
npm run dev
```
Avvia un server Vite in sviluppo. L'URL sarà mostrato in console (di default http://localhost:5173).

## Build di produzione
```bash
npm run build
```
Genera l'output in `dist/`.

## Preview della build
```bash
npm run preview
```
Serve la build in locale per testare l'output di produzione.

## Linting
```bash
npm run lint
```
Esegue ESLint su file `js`/`jsx`.
