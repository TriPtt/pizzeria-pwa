import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL_BACK}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// ✅ Intercepteur avec plus de debug
api.interceptors.request.use(
  (config) => {
    console.log('🔍 API Request Debug:')
    console.log('  - URL:', config.baseURL + config.url)
    console.log('  - Method:', config.method?.toUpperCase())
    
    const token = localStorage.getItem('authToken')
    console.log('  - Token in localStorage:', token ? 'YES ✅' : 'NO ❌')
    
    if (token) {
      console.log('  - Token preview:', token.substring(0, 30) + '...')
      config.headers.Authorization = `Bearer ${token}`
      console.log('  - Authorization header:', config.headers.Authorization.substring(0, 40) + '...')
    } else {
      console.log('  - ❌ NO TOKEN FOUND IN LOCALSTORAGE!')
    }
    
    console.log('  - All headers:', config.headers)
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('❌ API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      headers: error.config?.headers
    })
    
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - Token might be expired or invalid')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // Redirection optionnelle
      if (window.location.pathname !== '/login') {
        console.log('🔄 Redirecting to login...')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
