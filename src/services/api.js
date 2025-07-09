import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
})

// Town Hall Services
export const townHallService = {
  getAll: () => api.get('/townHalls'),
  getByName: (name) => api.get(`/townHalls/${name}`),
  create: (data) => api.post('/townHalls', data),
  update: (data) => api.post('/townHalls/update', data),
  delete: (name) => api.delete('/townHalls', { data: { name } }),
  downloadExcel: (data) => api.post('/townHalls/api/downloadExcelTownHall', data, { responseType: 'blob' }),
  downloadCSV: (data) => api.post('/townHalls/api/downloadCSVTownHall', data, { responseType: 'blob' })
}

// User Services
export const userService = {
  getAll: () => api.get('/users'),
  getByEmail: (email) => api.get(`/users/getForEmail/${email}`),
  addTownHall: (data) => api.post('/users/addTownHalls', data),
  removeTownHall: (data) => api.delete('/users/removeTownHalls', { data }),
  validateUser: (data) => api.post('/users/validateUser', data),
  removeUser: (data) => api.post('/users/removeUser', data),
  updateUser: (data) => api.post('/users/update/modifyUser', data),
  sendApprovalEmail: (data) => api.post('/send-email-to-user/isApproved', data),
  downloadCSV: () => api.get('/users/api/downloadCsv', { responseType: 'blob' }),
  getLightPointsCount: (id) => api.get(`/users/${id}/lightPointsCount`),
}

// Access Log Services
export const accessLogService = {
  getMonthlyUsers: () => api.get('/api/access-logs/stats/monthly-users'),
  getTopActions: () => api.get('/api/access-logs/stats/top-actions'),
  getTopUser: () => api.get('/api/access-logs/stats/top-user'),
  getYearlyTrend: () => api.get('/api/access-logs/stats/yearly-trend'),
  getFailedRequests: () => api.get('/api/access-logs/stats/failed-requests'),
  getActionHeatmap: () => api.get('/api/access-logs/stats/action-heatmap'),
}
