import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL 
})

// Town Hall Services
export const townHallService = {
  getAll: () => api.get('/townHalls'),
  getByName: (name) => api.get(`/townHalls/${name}`),
  create: (data) => api.post('/townHalls', data),
  update: (data) => api.post('/townHalls/update', data),
  delete: (id) => api.delete(`/townHalls/${id}`),
  downloadExcel: (data) => api.post('/townHalls/api/downloadExcelTownHall', data, { responseType: 'blob' }),
  downloadCSV: (data) => api.post('/townHalls/api/downloadCSVTownHall', data, { responseType: 'blob' }),
  getSuggestions: (prefix) => api.get(`/borders/suggest-townhall-name/prefix?prefix=${prefix}`),
  getGeoInfo: (id) => api.get(`/borders/geo-info/${id}`)
}

// User Services
export const userService = {
  getAll: () => api.get('/users'),
  getByEmail: (email) => api.get(`/users/getForEmail/${email}`),
  getById: (id) => api.get(`/users/${id}`),
  addTownHall: (data) => api.post('/users/addTownHalls', data),
  removeTownHall: (data) => api.delete('/users/removeTownHalls', { data }),
  validateUser: (data) => api.post('/users/validateUser', data),
  removeUser: (data) => api.post('/users/removeUser', data),
  removeUserByID: (id) => api.post(`/users/removeUserByID/${id}`),
  updateUser: (data) => api.post('/users/update/modifyUser', data),
  sendApprovalEmail: (data) => api.post('/send-email-to-user/isApproved', data),
  downloadCSV: () => api.get('/users/api/downloadCsv', { responseType: 'blob' }),
  getLightPointsCount: (id) => api.get(`/users/${id}/lightPointsCount`),
  updateUserType: (data) => api.post('/users/update-user-type', data),
}

// Access Log Services
export const accessLogService = {
  getMonthlyUsers: () => api.get('/api/access-logs/stats/monthly-users'),
  getTopActions: () => api.get('/api/access-logs/stats/top-actions'),
  getTopUser: () => api.get('/api/access-logs/stats/top-user'),
  getYearlyTrend: () => api.get('/api/access-logs/stats/yearly-trend'),
  getFailedRequests: () => api.get('/api/access-logs/stats/failed-requests'),
  getActionHeatmap: () => api.get('/api/access-logs/stats/action-heatmap'),
  getPercentageNewUsers: () => api.get('/api/access-logs/newUsersPercentageChange'),
  getNewTownHalls: () => api.get('/api/access-logs/newTownsThisMonth'),
  getNewLightPoints: () => api.get('/api/access-logs/newLightPointsThisMonth'),
  accessThisMonth: (data) => api.post('/api/access-logs/access-this-month', data),
  getFailedRequestsDetails: (data) => api.get(`/api/access-logs/stats/failed-requests-details/${data}`),
  getLastLogin: (userIds) => api.post('/api/access-logs/last-login', { userIds })
}

export const organizationService = {
  create: (data) => api.post('/organizations/add-organization', data),
  getAll: () => api.get('/organizations/all-organizations'),
  getById: (id) => api.get(`/organizations/${id}`),
  addUsersToOrganization: (data) => api.put('/organizations/add-users-to-organization', data),
  removeUserFromOrganization: (data) => api.put('/organizations/remove-user-from-organization', data),
  update: (id, data) => api.put(`/organizations/${id}`, data),
  delete: (id) => api.delete(`/organizations/${id}`),
  deleteWithUsers: (id) => api.delete(`/organizations/${id}/with-users`),
  createContract: (data) => api.put('/organizations/add-contract-to-organization', data),
  associateTownhall: (data) => api.put('/organizations/associate-townhall-to-organization', data)

}