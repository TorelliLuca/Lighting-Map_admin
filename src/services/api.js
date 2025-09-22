import axios from 'axios'

/**
 * Axios instance configured with base URL from VITE_SERVER_URL.
 * See docs/env.md for environment configuration.
 * @type {import('axios').AxiosInstance}
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL 
})

// Town Hall Services
/**
 * Service for Town Hall management.
 * All methods return a Promise of AxiosResponse and may throw AxiosError.
 */
export const townHallService = {
  /**
   * Fetch all town halls.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getAll: () => api.get('/townHalls'),
  /**
   * Get a town hall by name.
   * @param {string} name
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getByName: (name) => api.get(`/townHalls/${name}`),
  /**
   * Create a new town hall.
   * @param {{name:string, province?:string, region?:string, coordinates?:{lat:number,lng:number}, borders?:string, light_points:any[], userEmail:string}} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  create: (data) => api.post('/townHalls', data),
  /**
   * Update an existing town hall's light points.
   * @param {{name:string, userEmail:string, light_points:any[]}} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  update: (data) => api.post('/townHalls/update', data),
  /**
   * Delete a town hall by id.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  delete: (id) => api.delete(`/townHalls/${id}`),
  /**
   * Download an Excel export for a town hall.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<Blob>>}
   */
  downloadExcel: (data) => api.post('/townHalls/api/downloadExcelTownHall', data, { responseType: 'blob' }),
  /**
   * Download a CSV export for a town hall.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<Blob>>}
   */
  downloadCSV: (data) => api.post('/townHalls/api/downloadCSVTownHall', data, { responseType: 'blob' }),
  /**
   * Get autocomplete suggestions for town hall names.
   * @param {string} prefix
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getSuggestions: (prefix) => api.get(`/borders/suggest-townhall-name/prefix?prefix=${prefix}`),
  /**
   * Fetch geo info for a town hall borders id.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getGeoInfo: (id) => api.get(`/borders/geo-info/${id}`)
}

// User Services
/**
 * Service for User management and metrics.
 */
export const userService = {
  /**
   * Fetch all users.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getAll: () => api.get('/users'),
  /**
   * Get a user by email.
   * @param {string} email
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getByEmail: (email) => api.get(`/users/getForEmail/${email}`),
  /**
   * Get a user by id.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getById: (id) => api.get(`/users/${id}`),
  /**
   * Add a town hall to a user.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  addTownHall: (data) => api.post('/users/addTownHalls', data),
  /**
   * Remove a town hall from a user.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  removeTownHall: (data) => api.delete('/users/removeTownHalls', { data }),
  /**
   * Validate a user.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  validateUser: (data) => api.post('/users/validateUser', data),
  /**
   * Remove a user.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  removeUser: (data) => api.post('/users/removeUser', data),
  /**
   * Remove a user by id.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  removeUserByID: (id) => api.post(`/users/removeUserByID/${id}`),
  /**
   * Update a user.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  updateUser: (data) => api.post('/users/update/modifyUser', data),
  /**
   * Send an approval email to a user.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  sendApprovalEmail: (data) => api.post('/send-email-to-user/isApproved', data),
  /**
   * Download a CSV export of users.
   * @returns {Promise<import('axios').AxiosResponse<Blob>>}
   */
  downloadCSV: () => api.get('/users/api/downloadCsv', { responseType: 'blob' }),
  /**
   * Get the light points count for a user.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getLightPointsCount: (id) => api.get(`/users/${id}/lightPointsCount`),
  /**
   * Update a user's type.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  updateUserType: (data) => api.post('/users/update-user-type', data),
}

// Access Log Services
/**
 * Service for Access Logs and analytics.
 */
export const accessLogService = {
  /**
   * Get the monthly users.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getMonthlyUsers: () => api.get('/api/access-logs/stats/monthly-users'),
  /**
   * Get the top actions.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getTopActions: () => api.get('/api/access-logs/stats/top-actions'),
  /**
   * Get the top user.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getTopUser: () => api.get('/api/access-logs/stats/top-user'),
  /**
   * Get the yearly trend.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getYearlyTrend: () => api.get('/api/access-logs/stats/yearly-trend'),
  /**
   * Get the failed requests.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getFailedRequests: () => api.get('/api/access-logs/stats/failed-requests'),
  /**
   * Get the action heatmap.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getActionHeatmap: () => api.get('/api/access-logs/stats/action-heatmap'),
  /**
   * Get the percentage of new users.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getPercentageNewUsers: () => api.get('/api/access-logs/newUsersPercentageChange'),
  /**
   * Get the new town halls.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getNewTownHalls: () => api.get('/api/access-logs/newTownsThisMonth'),
  /**
   * Get the new light points.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getNewLightPoints: () => api.get('/api/access-logs/newLightPointsThisMonth'),
  /**
   * Get the access logs for this month.
   * @param {{ids:string[]}} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  accessThisMonth: (data) => api.post('/api/access-logs/access-this-month', data),
  /**
   * Get the failed requests details.
   * @param {string} data actionId
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getFailedRequestsDetails: (data) => api.get(`/api/access-logs/stats/failed-requests-details/${data}`),
  /**
   * Get the last login for a user.
   * @param {string[]} userIds
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getLastLogin: (userIds) => api.post('/api/access-logs/last-login', { userIds })
}

/**
 * Organization management service.
 */
export const organizationService = {
  /**
   * Create a new organization.
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  create: (data) => api.post('/organizations/add-organization', data),
  /**
   * Get all organizations.
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getAll: () => api.get('/organizations/all-organizations'),
  /**
   * Get an organization by id.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  getById: (id) => api.get(`/organizations/${id}`),
  /**
   * Add users to an organization.
   * @param {{organizationId:string,userIds:string[]}} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  addUsersToOrganization: (data) => api.put('/organizations/add-users-to-organization', data),
  /**
   * Remove a user from an organization.
   * @param {{organizationId:string,userId:string}} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  removeUserFromOrganization: (data) => api.put('/organizations/remove-user-from-organization', data),
  /**
   * Update an organization.
   * @param {string} id
   * @param {any} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  update: (id, data) => api.put(`/organizations/${id}`, data),
  /**
   * Delete an organization.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  delete: (id) => api.delete(`/organizations/${id}`),
  /**
   * Delete an organization with users.
   * @param {string} id
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  deleteWithUsers: (id) => api.delete(`/organizations/${id}/with-users`),
  /**
   * Create a contract for an organization.
   * @param {{organizationId:string,contract:any}} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  createContract: (data) => api.put('/organizations/add-contract-to-organization', data),
  /**
   * Associate a town hall with an organization.
   * @param {{organizationId:string,townhallId:string}} data
   * @returns {Promise<import('axios').AxiosResponse<any>>}
   */
  associateTownhall: (data) => api.put('/organizations/associate-townhall-to-organization', data)
}