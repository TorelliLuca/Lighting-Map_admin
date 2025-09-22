# Pagine (Views) – Documentazione

Questo documento descrive le principali pagine sotto `src/pages/`, con scopo, flussi, stato locale e dipendenze dai servizi.

## UpdateTownhall (`src/pages/UpdateTownhall.jsx`)

- **Scopo**
  - Gestire l'aggiornamento dei dati di un comune esistente da CSV.
  - Creare un nuovo comune con supporto a suggerimenti e geolocalizzazione su mappa, più upload CSV dei punti luce.

- **Componenti/UI utilizzati**
  - `PageHeader`, `Card`/`CardHeader`/`CardBody`, `Button`, `Alert`, `Input` da `src/components/common/`
  - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` da `@/components/ui/tabs`
  - Icone `lucide-react` (`Upload`, `FileUp`, `AlertCircle`, `Building`, `Search`, `Plus`, `RefreshCw`, `MapPin`, `Info`)
  - Notifiche `react-hot-toast`
  - Mappa Leaflet caricata via CDN in `useEffect`

- **Servizi/API**
  - `townHallService` da `src/services/api.js`:
    - `getAll()`, `update(data)`, `create(data)`, `getSuggestions(prefix)`, `getGeoInfo(id)`

- **Stato principale** (hook `useState`)
  - `loading`, `alert`, `activeTab`
  - `townHalls`, `filteredTownHalls`, `townHallSearch`, `selectedTownHall`, `showTownHallDropdown`
  - `updateFile`, `newFile`, `isDraggingUpdate`, `isDraggingNew`
  - Nuovo comune: `newTownHallName`, `newTownHallProvince`, `newTownHallRegion`, `newTownHallIstatCode`, `selectedBordersId`
  - Autocomplete: `townhallSuggestions`, `showSuggestions`, `loadingSuggestions`
  - Mappa/coordinate: `coordinates`, `mapInitialized`, `mapRef`, `markerRef`, `mapInstanceRef`
  - Operazioni: `updating`, `creating`, `searchingLocation`

- **Flussi principali**
  - Aggiornamento comune esistente:
    - Selezione comune tramite ricerca e dropdown.
    - Drag & drop o selezione file CSV.
    - `handleUpdateTownHall()` legge CSV, converte in JSON (`csvToJson`), invia `townHallService.update(data)`.
  - Creazione nuovo comune:
    - Suggerimenti nome con `getSuggestions(prefix)`, selezione popolano provincia/regione e coordinate da `getGeoInfo(id)`.
    - Mappa Leaflet con marker draggable e click-to-set.
    - Upload CSV e invio tramite `townHallService.create(data)`.

- **Validazioni e UX**
  - Controllo estensione file `.csv`.
  - Disabilitazione pulsanti durante `isLoading`/`creating`/`updating`.
  - Toast di successo/errore e `Alert` contestuali.

- **Note tecniche**
  - La funzione `csvToJson` assume separatore `;` e rimuove `"` ai bordi dei campi.
  - La mappa è caricata via `<link>` e `<script>` dinamici e pulita in uncleanup effect.

---

## AccessLogsDashboard (`src/pages/AccessLogsDashboard.jsx`)

- **Scopo**
  - Mostrare statistiche avanzate degli accessi: utenti attivi mensili, top azioni, trend annuale, richieste fallite e heatmap oraria.

- **Componenti/UI utilizzati**
  - UI glass: `GlassCard`, `GlassCardHeader`, `GlassCardContent` da `src/components/ui/glass-card`
  - Header: `ModernPageHeader`
  - Grafici: Recharts (`BarChart`, `LineChart`, `ResponsiveContainer`, ecc.)
  - Animazioni: `framer-motion`
  - Conteggi animati: `react-countup`
  - Modali utente: `UserModal`
  - Icone `lucide-react`

- **Servizi/API**
  - `accessLogService`:
    - `getMonthlyUsers()`, `accessThisMonth({ids})`, `getLastLogin(ids)`, `getTopActions()`, `getTopUser()`, `getYearlyTrend()`, `getFailedRequests()`, `getActionHeatmap()`
  - `userService`:
    - `getLightPointsCount(userId)` per top user e utente corrente

- **Stato principale**
  - `monthlyUsers`, `monthlyUsersTrend`, `monthlyUsersList`, `monthlyUsersAccessMap`, `monthlyUsersAccessCount`
  - `topActions`, `topUser`, `topUserLightPoints`, `myLightPoints`
  - `yearlyTrend`, `failedRequests`, `failedRequestsDetails`
  - `actionHeatmapRaw`
  - `showModal`, `selectedUser`
  - `showAllTownhalls`
  - `showFailedRequestsModal`, `selectedFailedAction`, `selectedFailedDetails`, `isLoadingDetails`
  - `lastLoginData`

- **Flussi principali**
  - `useEffect` iniziale richiama in sequenza endpoint stats e popola le card e grafici.
  - Tabella utenti attivi mensili con colonne: Nome, Accessi (mese), Ultimo Accesso, Azioni (apri `UserModal`).
  - Card "Richieste Fallite" con lista per azione, bottone dettagli che apre modale e carica `getFailedRequestsDetails(actionId)`.
  - Grafici: bar chart utenti mensili e line chart trend annuale.

- **Utility**
  - `getReadableUserAgent` da `src/utils/formatters.js` per decodificare user agent.

- **Note**
  - Le classi tailwind dinamiche (es. `from-${accent}-500`) richiedono attenzione al safelist in Tailwind se necessario.

---

## Funzioni principali per pagina

Di seguito l'elenco delle funzioni e handler definiti nelle pagine principali, con scopo, parametri e flusso di esecuzione.

### UpdateTownhall.jsx – Funzioni

- `csvToJson(csv: string): object[]`
  - Converte un CSV separato da `;` in un array di oggetti, usando l'intestazione (prima riga) come chiavi. Trimma i valori e rimuove `"` ai bordi.

- `initializeMap(): void`
  - Inizializza la mappa Leaflet su `mapRef` con vista iniziale `coordinates`. Aggiunge un marker draggable e listener su click mappa per aggiornare `coordinates`. Salva riferimenti in `mapInstanceRef` e `markerRef`.

- `handleTownHallSelect(townHall)`: void
  - Imposta `selectedTownHall`, sincronizza `townHallSearch` e chiude il dropdown.

- `handleSuggestionSelect(suggestion)`: Promise<void>
  - Imposta `newTownHallName` da `suggestion.properties.comune`, salva `selectedBordersId` da `suggestion._id`, chiama `townHallService.getGeoInfo` per popolare `province`, `region` e aggiornare `coordinates`. Allinea mappa/marker se inizializzati. Gestisce stato `loadingSuggestions` e mostra toast.

- File Upload (update):
  - `handleUpdateFileChange(event)`: valida estensione `.csv`, imposta `updateFile`.
  - `handleUpdateDragOver(e)`: previene default, imposta `isDraggingUpdate=true`.
  - `handleUpdateDragLeave()`: imposta `isDraggingUpdate=false`.
  - `handleUpdateDrop(e)`: valida file trascinato e imposta `updateFile`.

- File Upload (new):
  - `handleNewFileChange(event)`: valida estensione `.csv`, imposta `newFile`.
  - `handleNewDragOver(e)`: previene default, imposta `isDraggingNew=true`.
  - `handleNewDragLeave()`: imposta `isDraggingNew=false`.
  - `handleNewDrop(e)`: valida file trascinato e imposta `newFile`.

- `handleUpdateTownHall(): Promise<void>`
  - Validazioni: richiede `selectedTownHall` e `updateFile`.
  - Legge il CSV via `FileReader`, converte con `csvToJson`, costruisce payload `{ name, userEmail, light_points }` (email da `localStorage.userData`).
  - Chiama `townHallService.update(data)`, aggiorna stato locale di `townHalls` e `filteredTownHalls`, mostra `Alert`/toast, resetta form e stati. Gestisce `updating`.

- `handleCreateTownHall(): Promise<void>`
  - Validazioni: richiede `newTownHallName` e `newFile`.
  - Legge CSV, converte con `csvToJson`, costruisce payload `{ name, province, region, coordinates: {lat,lng}, borders, light_points, userEmail }`.
  - Chiama `townHallService.create(data)`, aggiorna elenco comuni locale con `_id` restituito, mostra `Alert`/toast, resetta form e mappa. Gestisce `creating`.

### AccessLogsDashboard.jsx – Funzioni

- `actionLabel(code: string): string`
  - Mappa i codici di azione a etichette leggibili (es. `ADD_REPORT` -> "Aggiunta Report"). Ritorna `code` se non mappato.

- `renderHeatmap(): ReactNode`
  - Costruisce una matrice oraria-azione da `actionHeatmapRaw`, calcola l'intensità normalizzata e renderizza una heatmap a griglia con classi Tailwind in base al livello.

- `handleShowFailedDetails(actionId: string): Promise<void>`
  - Apre la modale dettagli richieste fallite, carica i dettagli via `accessLogService.getFailedRequestsDetails(actionId)`, gestendo `isLoadingDetails` e `selectedFailedDetails`.

- Effetto iniziale `useEffect(...)`
  - Flusso: carica `monthlyUsers`/trend + elenco utenti del mese; se presenti, chiama `accessThisMonth({ids})` e `getLastLogin(ids)` per accessi/ultimo login; carica `topActions`, `topUser` (+ `userService.getLightPointsCount`), `yearlyTrend`, `failedRequests` (+ dettagli), `actionHeatmap`. Gestisce `isLoading` globale della pagina.
