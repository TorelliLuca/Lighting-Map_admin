# Reference Servizi (Client API)

Questo documento documenta le funzioni esposte in `src/services/api.js`. Tutte le funzioni restituiscono `Promise<AxiosResponse<T>>` e propagano gli errori Axios.

## Configurazione Axios
- Istanza: `api = axios.create({ baseURL: import.meta.env.VITE_SERVER_URL })`
- La variabile `VITE_SERVER_URL` deve essere configurata in `.env`. Vedi `docs/env.md`.

---

## Town Hall Services (`townHallService`)
Percorso base: `/townHalls`

- `getAll()`
  - Metodo: GET `/townHalls`
  - Parametri: nessuno
  - Ritorno: lista dei comuni

- `getByName(name)`
  - Metodo: GET `/townHalls/:name`
  - Parametri: `name: string`
  - Ritorno: comune con nome specificato

- `create(data)`
  - Metodo: POST `/townHalls`
  - Body: `{ name, province?, region?, coordinates?: { lat, lng }, borders?, light_points: Array, userEmail }`
  - Ritorno: comune creato (incluso `_id`)

- `update(data)`
  - Metodo: POST `/townHalls/update`
  - Body: `{ name, userEmail, light_points: Array }`
  - Ritorno: messaggio di esito

- `delete(id)`
  - Metodo: DELETE `/townHalls/:id`
  - Parametri: `id: string`
  - Ritorno: esito eliminazione

- `downloadExcel(data)`
  - Metodo: POST `/townHalls/api/downloadExcelTownHall`
  - Body: filtro/dati export
  - Opzioni: `{ responseType: 'blob' }`
  - Ritorno: Blob Excel del comune

- `downloadCSV(data)`
  - Metodo: POST `/townHalls/api/downloadCSVTownHall`
  - Body: filtro/dati export
  - Opzioni: `{ responseType: 'blob' }`
  - Ritorno: Blob CSV del comune

- `getSuggestions(prefix)`
  - Metodo: GET `/borders/suggest-townhall-name/prefix?prefix=<prefix>`
  - Parametri: `prefix: string`
  - Ritorno: array suggerimenti (contiene `_id` e `properties.comune`)

- `getGeoInfo(id)`
  - Metodo: GET `/borders/geo-info/:id`
  - Parametri: `id: string` (borders id dal suggerimento)
  - Ritorno: `{ comune, provincia, regione, latitudine, longitudine, ... }`

---

## User Services (`userService`)
Percorso base: `/users`

- `getAll()`
  - Metodo: GET `/users`
  - Ritorno: lista utenti

- `getByEmail(email)`
  - Metodo: GET `/users/getForEmail/:email`
  - Parametri: `email: string`

- `getById(id)`
  - Metodo: GET `/users/:id`
  - Parametri: `id: string`

- `addTownHall(data)`
  - Metodo: POST `/users/addTownHalls`
  - Body: `{ userId, townHallIds | townHallNames }`

- `removeTownHall(data)`
  - Metodo: DELETE `/users/removeTownHalls`
  - Body: `{ userId, townHallIds | townHallNames }` (passato in `data`)

- `validateUser(data)`
  - Metodo: POST `/users/validateUser`
  - Body: `{ userId, ... }`

- `removeUser(data)`
  - Metodo: POST `/users/removeUser`
  - Body: `{ userId }`

- `removeUserByID(id)`
  - Metodo: POST `/users/removeUserByID/:id`
  - Parametri: `id: string`

- `updateUser(data)`
  - Metodo: POST `/users/update/modifyUser`
  - Body: `{ userId, ... }`

- `sendApprovalEmail(data)`
  - Metodo: POST `/send-email-to-user/isApproved`
  - Body: `{ userId | email, approved: boolean }`

- `downloadCSV()`
  - Metodo: GET `/users/api/downloadCsv`
  - Opzioni: `{ responseType: 'blob' }`
  - Ritorno: Blob CSV utenti

- `getLightPointsCount(id)`
  - Metodo: GET `/users/:id/lightPointsCount`
  - Parametri: `id: string`
  - Ritorno: `{ totalLightPoints: number, townhalls: string[] }`

- `updateUserType(data)`
  - Metodo: POST `/users/update-user-type`
  - Body: `{ userId, type }`

---

## Access Log Services (`accessLogService`)
Percorso base: `/api/access-logs`

- `getMonthlyUsers()`
  - Metodo: GET `/api/access-logs/stats/monthly-users`
  - Ritorno: trend mensile e elenco utenti attivi nel mese corrente

- `getTopActions()`
  - Metodo: GET `/api/access-logs/stats/top-actions`

- `getTopUser()`
  - Metodo: GET `/api/access-logs/stats/top-user`

- `getYearlyTrend()`
  - Metodo: GET `/api/access-logs/stats/yearly-trend`

- `getFailedRequests()`
  - Metodo: GET `/api/access-logs/stats/failed-requests`
  - Ritorno: array di `{ _id: actionCode, count }`

- `getActionHeatmap()`
  - Metodo: GET `/api/access-logs/stats/action-heatmap`
  - Ritorno: `{ action, hour, count }[]`

- `getPercentageNewUsers()`
  - Metodo: GET `/api/access-logs/newUsersPercentageChange`

- `getNewTownHalls()`
  - Metodo: GET `/api/access-logs/newTownsThisMonth`

- `getNewLightPoints()`
  - Metodo: GET `/api/access-logs/newLightPointsThisMonth`

- `accessThisMonth(data)`
  - Metodo: POST `/api/access-logs/access-this-month`
  - Body: `{ ids: string[] }`
  - Ritorno: mappa `{ [userId]: accessCount }`

- `getFailedRequestsDetails(actionId)`
  - Metodo: GET `/api/access-logs/stats/failed-requests-details/:actionId`
  - Parametri: `actionId: string`
  - Ritorno: dettagli richieste fallite

- `getLastLogin(userIds)`
  - Metodo: POST `/api/access-logs/last-login`
  - Body: `{ userIds: string[] }`
  - Ritorno: array di `{ userId, latestLogin }`

---

## Organization Service (`organizationService`)
Percorso base: `/organizations`

- `create(data)`
  - Metodo: POST `/organizations/add-organization`
  - Body: `{ name, ... }`

- `getAll()`
  - Metodo: GET `/organizations/all-organizations`

- `getById(id)`
  - Metodo: GET `/organizations/:id`

- `addUsersToOrganization(data)`
  - Metodo: PUT `/organizations/add-users-to-organization`
  - Body: `{ organizationId, userIds }`

- `removeUserFromOrganization(data)`
  - Metodo: PUT `/organizations/remove-user-from-organization`
  - Body: `{ organizationId, userId }`

- `update(id, data)`
  - Metodo: PUT `/organizations/:id`

- `delete(id)`
  - Metodo: DELETE `/organizations/:id`

- `deleteWithUsers(id)`
  - Metodo: DELETE `/organizations/:id/with-users`

- `createContract(data)`
  - Metodo: PUT `/organizations/add-contract-to-organization`
  - Body: `{ organizationId, contract }`

- `associateTownhall(data)`
  - Metodo: PUT `/organizations/associate-townhall-to-organization`
  - Body: `{ organizationId, townhallId }`

---

## Gestione Errori
- Le funzioni restituiscono le risposte Axios; gestire gli errori con `try/catch` lato chiamante.
- Nel caso di download (CSV/Excel) impostare `responseType: 'blob'` come già fatto nei servizi.

## Esempio d'uso
```js
import { townHallService } from '@/services/api'

async function creaComune() {
  const data = { name: 'Roma', light_points: [], userEmail: 'user@example.com' }
  const res = await townHallService.create(data)
  console.log(res.data)
}
```
