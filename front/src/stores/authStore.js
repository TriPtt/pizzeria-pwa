import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  const login = async (email, password) => {
    isLoading.value = true
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
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

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      // ✅ Sauvegarder les données comme ton API les renvoie
      setAuth(data.user, data.token)
      
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }
      
      // Auto-login après inscription
      setAuth(data.user, data.token)
      
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
    localStorage.removeItem('token')
    
    console.log('👋 User logged out')
  }

  const updateUser = async (userData) => {
    if (!user.value) return

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.value.id}`, {
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
    user.value = userData
    token.value = authToken
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
    
    console.log('✅ User authenticated:', userData)
  }

  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
        console.log('🔄 Auth restored from localStorage:', user.value)
      } catch (error) {
        console.error('❌ Erreur parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
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
