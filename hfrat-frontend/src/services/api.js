import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
})

// Attach token to all requests
api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401 (token expired/invalid)
api.interceptors.response.use(
    (resp) => resp,
    (err) => {
        if (err.response && err.response.status === 401) {
            logout()
        }
        return Promise.reject(err)
    }
)

// Auth service functions

export const getToken = () => localStorage.getItem('access_token')

export const login = async (username, password) => {
    const { data } = await api.post('token/', { username, password })
    localStorage.setItem('access_token', data.access)
    return data
}

export const getUserInfo = async () => {
    const { data } = await api.get('health/')
    return data
}

export const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
}

export default api

// Admin API
export const adminCreateUser = async ({ username, password, role, hospital_name, country, city }) => {
    const payload = { username, password, role }
    if (role === 'REPORTER') {
        payload.hospital_name = hospital_name
        payload.country = country
        payload.city = city
    }
    const { data } = await api.post('admin/create-user/', payload)
    return data
}

export const adminGetUsers = async () => {
    const { data } = await api.get('admin/users/list/')
    return data
}

export const adminUpdateUser = async (userId, updates) => {
    const { data } = await api.put(`admin/users/${userId}/`, updates)
    return data
}

export const adminDeleteUser = async (userId) => {
    const { data } = await api.delete(`admin/users/${userId}/`)
    return data
}

export const adminExportUsers = async () => {
    const response = await api.get('admin/users/export/', {
        responseType: 'blob'
    })
    return response
}

// Monitor API
export const monitorGetTrend = async (facilityId) => {
    const { data } = await api.get(`monitor/trend/?facility_id=${facilityId}`)
    return data
}

export const monitorExportDashboard = async () => {
    const response = await api.get('monitor/dashboard/export/', {
        responseType: 'blob'
    })
    return response
}

// Settings API
export const adminGetSettings = async () => {
    const { data } = await api.get('admin/settings/')
    return data
}

export const adminCreateSetting = async (settingData) => {
    const { data } = await api.post('admin/settings/', settingData)
    return data
}

export const adminUpdateSetting = async (settingId, updates) => {
    const { data } = await api.put(`admin/settings/${settingId}/`, updates)
    return data
}

export const adminDeleteSetting = async (settingId) => {
    const { data } = await api.delete(`admin/settings/${settingId}/`)
    return data
}

export const adminInitializeSettings = async () => {
    const { data } = await api.post('admin/settings/initialize/')
    return data
}
