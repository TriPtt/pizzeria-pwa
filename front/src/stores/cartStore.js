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
    return items.value.reduce((total, item) => {
      // Utilise finalPrice si disponible, sinon price de base
      const price = item.finalPrice || item.price
      return total + (price * item.quantity)
    }, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Méthode simple (pas computed)
  const getItemQuantity = (productId) => {
    const item = items.value.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  // 🆕 Génère un ID unique pour les items avec customizations
  const generateItemKey = (product, customizations = null) => {
    if (!customizations || (!customizations.supplements?.length && !customizations.removedIngredients?.length)) {
      return `${product.id}`
    }
    
    const supplements = customizations.supplements?.sort().join(',') || ''
    const removed = customizations.removedIngredients?.sort().join(',') || ''
    return `${product.id}_${supplements}_${removed}`
  }

  // Actions
  const addItem = async (product) => {
    isLoading.value = true
    
    try {
      // Simule délai réseau
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Génère la clé unique basée sur le produit + customizations
      const itemKey = generateItemKey(product, product.customizations)
      const existingItem = items.value.find(item => item.itemKey === itemKey)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        // Nouvel item avec toutes les données nécessaires
        const newItem = {
          id: product.id,
          itemKey, // 🆕 Clé unique pour différencier les variantes
          name: product.name,
          price: product.price, // Prix de base
          finalPrice: product.finalPrice || product.price, // 🆕 Prix avec suppléments
          image: product.image,
          description: product.description,
          quantity: 1,
          customizations: product.customizations || null // 🆕 Suppléments et retraits
        }
        
        items.value.push(newItem)
      }
      
      saveToStorage()
    } catch (error) {
      console.error('Erreur ajout panier:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 🆕 Supprime par itemKey au lieu de juste l'ID
  const removeItem = (itemKey) => {
    const index = items.value.findIndex(item => item.itemKey === itemKey)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  // 🆕 Update par itemKey
  const updateQuantity = (itemKey, quantity) => {
    const item = items.value.find(item => item.itemKey === itemKey)
    if (item) {
      if (quantity <= 0) {
        removeItem(itemKey)
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
        const loadedItems = JSON.parse(saved)
        // 🆕 S'assure que les anciens items ont un itemKey
        items.value = loadedItems.map(item => ({
          ...item,
          itemKey: item.itemKey || `${item.id}`
        }))
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
    loadFromStorage,
    generateItemKey // 🆕 Export pour autres composants
  }
})
