import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // État
  const items = ref([])
  const isLoading = ref(false)

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Méthode simple (pas computed)
  const getItemQuantity = (productId) => {
    const item = items.value.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  // Actions
  const addItem = async (product) => {
    isLoading.value = true
    
    try {
      // Simule délai réseau
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const existingItem = items.value.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        items.value.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        })
      }
      
      saveToStorage()
    } catch (error) {
      console.error('Erreur ajout panier:', error)
    } finally {
      isLoading.value = false
    }
  }

  const removeItem = (productId) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
        saveToStorage()
      }
    }
  }

  const clear = () => {
    items.value = []
    saveToStorage()
  }

  // Persistance
  const saveToStorage = () => {
    localStorage.setItem('cart-items', JSON.stringify(items.value))
  }

  const loadFromStorage = () => {
    const saved = localStorage.getItem('cart-items')
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch (error) {
        console.error('Erreur chargement panier:', error)
        items.value = []
      }
    }
  }

  const totalQuantity = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  return {
    // État
    items,
    isLoading,
    
    // Getters
    itemCount,
    totalPrice,
    totalQuantity,
    isEmpty,
    
    // Méthodes
    getItemQuantity,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    loadFromStorage
  }
})
