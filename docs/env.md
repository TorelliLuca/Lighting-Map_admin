# Configurazione Ambiente (.env)

Il progetto utilizza Vite e legge le variabili d'ambiente prefissate con `VITE_`.

## File supportati
- `.env.development`
- `.env.production`

I file sono già presenti alla root del progetto. Configurare i valori secondo l'ambiente.

## Variabili
- `VITE_SERVER_URL` (obbligatoria): URL base del backend a cui vengono indirizzate le chiamate in `src/services/api.js`.
  - Esempio (sviluppo): `http://localhost:3000`
  - Esempio (produzione): `https://api.miodominio.tld`

## Esempio di `.env.development`
```
VITE_SERVER_URL=http://localhost:3000
```

## Note
- Dopo aver modificato le variabili, riavviare il dev server (`npm run dev`).
- Non committare segreti o token nei file `.env`.
