import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
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
export const adminCreateUser = async ({ username, password, role, facility_id }) => {
    const { data } = await api.post('admin/users/', {
        username,
        password,
        role,
        facility_id: facility_id ?? null,
    })
    return data
}
