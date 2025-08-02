import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  
  const api = import.meta.env.VITE_API_URL_BACK;

  // Getters
  const isAuthenticated = computed(() => {
    const result = !!user.value && !!token.value
    console.log('🔍 isAuthenticated computed:', result, { user: user.value, token: token.value })
    return result
  })
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  const login = async (email, password) => {
    isLoading.value = true
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
      console.log('🔍 Login data received:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      setAuth(data.utilisateur, data.token)
      
      return data
    } catch (error) {
      console.error('Erreur login:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    try {
      const response = await fetch(`${api}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'inscription')
      }

      // ✅ FIX: Utilise "utilisateur" ici aussi
      setAuth(data.utilisateur, data.token)
      
      return data
    } catch (error) {
      console.error('Erreur register:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }


  const logout = () => {
    user.value = null
    token.value = null
    
    localStorage.removeItem('user')
    // ✅ CORRECTION: Utiliser 'authToken' au lieu de 'token'
    localStorage.removeItem('authToken')
    
    console.log('👋 User logged out')
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

      // Mettre à jour le user local
      user.value = { ...user.value, ...data.user }
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return data.user
    } catch (error) {
      console.error('Erreur update user:', error)
      throw error
    }
  }


  const setAuth = (userData, authToken) => {
    console.log('🔍 setAuth called with:')
    console.log('- userData:', userData)
    console.log('- authToken:', authToken)
    
    user.value = userData
    token.value = authToken
    
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('✅ User saved:', userData.name, userData.email)
    }
    
    if (authToken) {
      // ✅ CORRECTION: Utiliser 'authToken' au lieu de 'token'
      localStorage.setItem('authToken', authToken)
      console.log('✅ Token saved in localStorage as authToken')
    }
  }


  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    // ✅ CORRECTION: Utiliser 'authToken' au lieu de 'token'
    const savedToken = localStorage.getItem('authToken')
    
    console.log('🔍 Init auth - savedUser:', savedUser ? 'YES' : 'NO')
    console.log('🔍 Init auth - savedToken:', savedToken ? 'YES' : 'NO')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
        console.log('🔄 Auth restored from localStorage:', user.value.name)
      } catch (error) {
        console.error('❌ Erreur parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
      }
    } else {
      console.log('👤 No saved auth found')
    }
  }


  return {
    // State
    user,
    token,
    isLoading,
    
    // Getters
    isAuthenticated,
    userName,
    userEmail,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    setAuth,
    initAuth
  }
})
