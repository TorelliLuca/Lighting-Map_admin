# Contexts e Utils

## Contexts (`src/context/`)

- ThemeContext.jsx
  - Scopo: Gestione tema (dark/light) o preferenze di stile a livello globale.
  - API tipica: `ThemeProvider`, `useTheme()` con valori `theme`, `setTheme`.
  - Uso: Wrappare l'app o porzioni in cui il tema è rilevante.

- UserContext.jsx
  - Scopo: Stato utente autenticato e metadati associati.
  - API tipica: `UserProvider`, `useUser()` che espone `{ userData, setUserData }` e altre utilità.
  - Esempio d'uso: in `AccessLogsDashboard.jsx` viene usato `useUser()` per ottenere `userData`.

> Per la firma esatta dei provider/hook consultare i file in `src/context/`.

## Utils (`src/utils/`)

- cn.js
  - Scopo: Utility per combinare classi CSS (tipicamente wrapper su `clsx` e/o `tailwind-merge`).
  - Uso: `cn('base', cond && 'optional')` per comporre classi in modo sicuro.

- formatters.js
  - Scopo: Funzioni di formattazione. Include `getReadableUserAgent(uaString)` utilizzato in `AccessLogsDashboard.jsx` per mostrare Browser/OS/Device.
  - API: `getReadableUserAgent(uaString) -> { browser, os, device }`.
