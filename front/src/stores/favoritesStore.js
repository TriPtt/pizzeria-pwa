import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  // État
  const favorites = ref([])

  // Getters
  const favoritesCount = computed(() => favorites.value.length)
  const isEmpty = computed(() => favorites.value.length === 0)

  // Méthode simple (pas computed)
  const isFavorite = (productId) => {
    return favorites.value.some(fav => fav.id === productId)
  }

  // Actions
  const addFavorite = (product) => {
    if (!isFavorite(product.id)) {
      favorites.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        addedAt: new Date().toISOString()
      })
      saveToStorage()
    }
  }

  const removeFavorite = (productId) => {
    const index = favorites.value.findIndex(fav => fav.id === productId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveToStorage()
    }
  }

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id)
    } else {
      addFavorite(product)
    }
  }

  const clearFavorites = () => {
    favorites.value = []
    saveToStorage()
  }

  // Persistance
  const saveToStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const loadFromStorage = () => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      try {
        favorites.value = JSON.parse(saved)
      } catch (error) {
        console.error('Erreur chargement favoris:', error)
        favorites.value = []
      }
    }
  }

  return {
    // État
    favorites,
    
    // Getters
    favoritesCount,
    isEmpty,
    
    // Méthodes
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    loadFromStorage
  }
})
