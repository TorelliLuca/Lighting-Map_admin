# Componenti – Reference e Linee Guida

Questa reference elenca i componenti principali presenti in `src/components/`, con scopo e API (prop principali). Per dettagli implementativi, consultare i file sorgente.

## Common (`src/components/common/`)

- Alert.jsx
  - Scopo: Mostrare messaggi di stato (success, error, info) con stile coerente.
  - Prop principali: `type` ("success" | "error" | "info"), `message: string`, `className?`.

- Button.jsx
  - Scopo: Pulsante stilizzato con varianti.
  - Prop principali: `onClick`, `isLoading?`, `disabled?`, `className?`, children.

- Card.jsx
  - Scopo: Contenitore a scheda. Esporta `Card`, `CardHeader`, `CardBody`.
  - Prop principali: `className?`, children.

- InfoCard.jsx
  - Scopo: Card informativa con icona e testo.
  - Prop principali: `title`, `description`, `icon?`.

- Input.jsx
  - Scopo: Campo input con etichetta.
  - Prop principali: `label?`, `type`, `value`, `onChange`, `placeholder?`, `className?`.

- LoadingScreen.jsx
  - Scopo: Schermata di caricamento full-page.
  - Prop principali: `message?`.

- PageHeader.jsx
  - Scopo: Intestazione pagina con titolo e descrizione.
  - Prop principali: `title: string`, `description?: string`.

- Select.jsx
  - Scopo: Select base con etichetta.
  - Prop principali: `label?`, `options`, `value`, `onChange`.

## UI (`src/components/ui/`)

- glass-card.jsx
  - Scopo: Componenti Glass UI; esporta `GlassCard`, `GlassCardHeader`, `GlassCardContent`.
  - Prop principali: `variant?` ("elevated" | ...), `className?`, children.

- modern-* (alert, button, dialog, input, loading, page-header, select)
  - Scopo: Variazioni moderne dei componenti base con stili coerenti.
  - Prop: coerenti con i corrispettivi di base (es. `className?`, `onClick`, `open`, ecc.).

- Componenti Radix wrapper (dialog.jsx, dropdown-menu.jsx, popover.jsx, radio-group.jsx, scroll-area.jsx, select.jsx, separator.jsx, sheet.jsx, sidebar.jsx, tabs.jsx, tooltip.jsx, command.jsx)
  - Scopo: Astrazioni sugli elementi Radix con styling Tailwind.
  - Prop: generalmente in linea con Radix UI, con `className?` e children.

- chart.jsx
  - Scopo: Utility/adapter per grafici.

- UI base (avatar.jsx, badge.jsx, button.jsx, card.jsx, label.jsx)
  - Scopo: Primitive di interfaccia generiche.

## Layout (`src/components/layout/`)

- modern-navbar.jsx, modern-sidebar.jsx, modern-footer.jsx
  - Scopo: Struttura di navigazione, barra laterale e footer per layout applicativo moderno.

## Modal Utenti

- `src/components/UserModal.jsx`
  - Scopo: Modale dettaglio dati utente (utilizzata in `AccessLogsDashboard.jsx`).
  - Prop principali: `userId`, `isOpen`, `onClose`.

## Linee guida d'uso
- Preferire i componenti `common/` per elementi base ricorrenti.
- Per interazioni avanzate (dialog, tooltip, tabs), usare i wrapper in `ui/` per garantire accessibilità e coerenza visiva.
- Evitare duplicazioni: prima di creare un nuovo componente, verificare che non esista una variante adeguata in `ui/` o `common/`.
