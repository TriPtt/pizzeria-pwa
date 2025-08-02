import { defineStore } from 'pinia'
import axios from 'axios'
const api = import.meta.env.VITE_API_URL_BACK;

export const useIngredientsStore = defineStore('ingredients', {
  state: () => ({
    productIngredients: {}, // Cache des ingrédients par produit
    loading: false,
    error: null
  }),

  getters: {
    // Récupérer les ingrédients d'un produit depuis le cache
    getProductIngredients: (state) => (productId) => {
      return state.productIngredients[productId] || null
    },

    // Vérifier si les ingrédients sont déjà chargés
    areIngredientsLoaded: (state) => (productId) => {
      return !!state.productIngredients[productId]
    }
  },

  actions: {
    async fetchProductIngredients(productId) {
      // Si déjà en cache, ne pas recharger
      if (this.productIngredients[productId]) {
        return this.productIngredients[productId]
      }

      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${api}/api/products/${productId}/ingredients`)

        // Stocker en cache
        this.productIngredients[productId] = response.data
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Erreur lors du chargement des ingrédients'
        console.error('❌ Erreur fetch ingrédients:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Nettoyer le cache (optionnel)
    clearCache() {
      this.productIngredients = {}
    },

    // Calculer le prix avec customisations
    calculateCustomPrice(basePrice, selectedSupplements, supplements) {
      let total = parseFloat(basePrice)
      
      selectedSupplements.forEach(suppId => {
        const supplement = supplements.find(s => s.id === suppId)
        if (supplement) {
          total += parseFloat(supplement.price)
        }
      })
      
      return total.toFixed(2)
    }
  }
})
