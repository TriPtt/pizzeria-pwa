import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import api from '../utils/api' 

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters avec vérification de sécurité
  const itemCount = computed(() => items.value?.length || 0)
  const isEmpty = computed(() => !items.value || items.value.length === 0)
  
  const isInWishlist = (productId) => {
    if (!items.value || !Array.isArray(items.value)) {
      return false
    }
    return items.value.some(item => item.id === parseInt(productId))
  }

  // Actions
  const fetchWishlist = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🔍 Fetching wishlist...')
      
      // ✅ Utilisation de l'instance api configurée
      const response = await api.get('/api/wishlist')
      
      items.value = response.data.items || []
      console.log(`✅ Wishlist loaded: ${items.value.length} items`)
      
      localStorage.setItem('wishlist', JSON.stringify(items.value))
      return response.data

    } catch (err) {
      console.error('❌ Error fetching wishlist:', err)
      error.value = err.response?.data?.message || 'Erreur lors du chargement'
      
      // Fallback localStorage
      try {
        const saved = localStorage.getItem('wishlist')
        if (saved) {
          const parsedItems = JSON.parse(saved)
          items.value = Array.isArray(parsedItems) ? parsedItems : []
        } else {
          items.value = []
        }
      } catch (storageError) {
        items.value = []
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addToWishlist = async (productId) => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('Vous devez être connecté')
    }

    if (isInWishlist(productId)) {
      throw new Error('Produit déjà dans la wishlist')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🔍 Adding to wishlist:', productId)
      
      // ✅ L'instance api ajoute automatiquement le token
      const response = await api.post('/api/wishlist/add', {
        product_id: productId
      })

      // Refresh la wishlist
      await fetchWishlist()
      
      console.log('✅ Product added to wishlist')
      return response.data

    } catch (err) {
      console.error('❌ Error adding to wishlist:', err)
      error.value = err.response?.data?.message || 'Erreur lors de l\'ajout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeFromWishlist = async (productId) => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('Vous devez être connecté')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🔍 Removing from wishlist:', productId)
      
      // ✅ Utilisation de l'instance api
      const response = await api.delete(`/api/wishlist/remove/${productId}`)

      // Mise à jour locale immédiate
      if (items.value && Array.isArray(items.value)) {
        items.value = items.value.filter(item => item.id !== parseInt(productId))
      }
      
      localStorage.setItem('wishlist', JSON.stringify(items.value))
      
      console.log('✅ Product removed from wishlist')
      return response.data

    } catch (err) {
      console.error('❌ Error removing from wishlist:', err)
      error.value = err.response?.data?.message || 'Erreur lors de la suppression'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  const clearWishlist = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error('Vous devez être connecté')
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('🔍 Clearing wishlist...')
      
      // ✅ Utilisation de l'instance api
      const response = await api.delete('/api/wishlist/clear')

      items.value = []
      localStorage.removeItem('wishlist')
      
      console.log('✅ Wishlist cleared')
      return response.data

    } catch (err) {
      console.error('❌ Error clearing wishlist:', err)
      error.value = err.response?.data?.message || 'Erreur lors du vidage'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const initializeWishlist = async () => {
    console.log('🚀 Initializing wishlist...')
    
    try {
      const saved = localStorage.getItem('wishlist')
      if (saved) {
        const parsedItems = JSON.parse(saved)
        items.value = Array.isArray(parsedItems) ? parsedItems : []
      } else {
        items.value = []
      }
    } catch (error) {
      items.value = []
    }

    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      try {
        await fetchWishlist()
      } catch (error) {
        console.log('⚠️ Could not sync with API')
      }
    }
  }

  return {
    items,
    isLoading,
    error,
    itemCount,
    isEmpty,
    isInWishlist,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    initializeWishlist
  }
})
