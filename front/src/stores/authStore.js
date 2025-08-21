import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  
  const api = import.meta.env.VITE_API_URL_BACK;

  // Getters
  const isAuthenticated = computed(() => {
    const result = !!user.value && !!token.value
    // console.log('🔍 isAuthenticated computed:', result, { user: user.value, token: token.value })
    return result
  })
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  const login = async (email, password) => {
    isLoading.value = true
    error.value = ''
    try {
      const response = await fetch(`${api}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password_hash: password 
        }),
      })

      const data = await response.json()
      // console.log('🔍 Login data received:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      setAuth(data.utilisateur, data.token)
      
      return data
    } catch (error) {
      console.error('Erreur login:', error)
      error.value = error.message
      throw error
    } finally {
      isLoading.value = false
    }
  }

   const register = async (userData) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const registerData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password_hash: userData.password
      }

      const response = await fetch(`${api}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()
      console.log('🔍 Réponse backend register:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'inscription')
      }

      if (data.token && data.user) {
      setAuth(data.user, data.token)
    } else {
      console.log('❌ Pas de token dans la réponse:', data)
    }
      
      return data
      
    } catch (err) {
      console.error('Erreur register:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }


  const logout = () => {
    user.value = null
    token.value = null
    error.value = ''
    
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    
    // console.log('👋 User logged out')
  }

  const updateUser = async (userData) => {
    if (!user.value) return

    try {
      const response = await fetch(`${api}/api/users/${user.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur mise à jour')
      }

      user.value = { ...user.value, ...data.user }
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return data.user
    } catch (error) {
      console.error('Erreur update user:', error)
      throw error
    }
  }

  const deleteAccount = async () => {
    if (!user.value || !token.value) {
      throw new Error('Utilisateur non authentifié')
    }

    try {
      const response = await fetch(`${api}/api/auth/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur suppression compte')
      }

      logout()
      return { message: 'Compte supprimé avec succès' }
    } catch (error) {
      console.error('Erreur delete account:', error)
      throw error
    }
  }


  const setAuth = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
    
    if (authToken) {
      localStorage.setItem('authToken', authToken)
    }
  }


  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('authToken')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
      } catch (error) {
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
      }
    } else {
      console.log('No saved auth found')
    }
  }


  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userName,
    userEmail,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    deleteAccount,
    setAuth,
    initAuth
  }
})
