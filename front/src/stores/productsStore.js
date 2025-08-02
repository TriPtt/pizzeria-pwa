import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL_BACK

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    categories: ['pizza', 'boisson', 'dessert'],
    favorites: new Set(), // Pour stocker les favoris localement
  }),

  getters: {
    // Produits par catégorie
    productsByCategory: (state) => (category) => {
      return state.products.filter(product => 
        product.type === category && product.available
      )
    },

    // Produits favoris
    favoriteProducts: (state) => {
      return state.products.filter(product => 
        state.favorites.has(product.id)
      )
    },

    // Produits disponibles
    availableProducts: (state) => {
      return state.products.filter(product => product.available)
    },

    // Recherche de produits
    searchProducts: (state) => (query) => {
      if (!query) return state.products
      
      const searchTerm = query.toLowerCase()
      return state.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.type.toLowerCase().includes(searchTerm)
      )
    },

    // Produit par ID
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === parseInt(id))
    },

    // Statistiques
    totalProducts: (state) => state.products.length,
    
    productsByType: (state) => {
      return state.categories.reduce((acc, category) => {
        acc[category] = state.products.filter(p => p.type === category).length
        return acc
      }, {})
    }
  },

  actions: {
    // 🔥 Récupérer tous les produits avec debug amélioré
    async fetchProducts() {
      this.loading = true
      this.error = null
      
      try {
        const url = `${API_URL}/api/products`
        console.log('🔄 Requête vers:', url)
        
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', response.headers)
        console.log('📡 Response data type:', typeof response.data)
        console.log('✅ Produits récupérés:', response.data)
        
        // 🎯 Vérification que c'est bien un array
        if (!Array.isArray(response.data)) {
          throw new Error(`Réponse invalide: attendu Array, reçu ${typeof response.data}`)
        }
        
        // Traitement des données
        this.products = response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          available: Boolean(product.available),
          image_url: product.image_url || '/placeholder-pizza.jpg',
          is_favorite: this.favorites.has(product.id)
        }))

        this.loadFavoritesFromStorage()
        
        return this.products
        
      } catch (error) {
        console.error('❌ Erreur complète:', error)
        console.error('❌ Error response:', error.response)
        
        if (error.response) {
          console.log('❌ Status:', error.response.status)
          console.log('❌ Data:', error.response.data)
          console.log('❌ Headers:', error.response.headers)
        }
        
        if (error.response?.status === 404) {
          this.error = 'API produits non trouvée - Vérifiez votre backend'
        } else if (error.response?.status >= 500) {
          this.error = 'Erreur serveur, veuillez réessayer'
        } else {
          this.error = error.message || 'Erreur lors du chargement'
        }
        
        throw error
      } finally {
        this.loading = false
      }
    },

    // 🔥 Récupérer un produit spécifique
    async fetchProductById(id) {
      this.loading = true
      this.error = null
      
      try {
        console.log(`🔄 Récupération produit ${id}...`)
        
        const response = await axios.get(`${API_URL}/api/products/${id}`)
        
        console.log('✅ Produit récupéré:', response.data)
        
        const product = {
          ...response.data,
          price: parseFloat(response.data.price),
          available: Boolean(response.data.available),
          image_url: response.data.image_url || '/placeholder-pizza.jpg',
          is_favorite: this.favorites.has(parseInt(id))
        }

        // Mettre à jour dans le store si existe
        const index = this.products.findIndex(p => p.id === parseInt(id))
        if (index !== -1) {
          this.products[index] = product
        } else {
          this.products.push(product)
        }

        return product
        
      } catch (error) {
        console.error(`❌ Erreur récupération produit ${id}:`, error)
        this.error = error.response?.data?.message || 'Produit non trouvé'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 🔥 Récupérer produits par catégorie
    async fetchProductsByCategory(category) {
      this.loading = true
      this.error = null
      
      try {
        console.log(`🔄 Récupération produits catégorie: ${category}`)
        
        const response = await axios.get(`${API_URL}/api/products`, {
          params: { type: category, available: true }
        })
        
        console.log(`✅ Produits ${category} récupérés:`, response.data)
        
        // Filtrer par catégorie côté client si l'API ne le fait pas
        const categoryProducts = response.data
          .filter(product => product.type === category)
          .map(product => ({
            ...product,
            price: parseFloat(product.price),
            available: Boolean(product.available),
            image_url: product.image_url || '/placeholder-pizza.jpg',
            is_favorite: this.favorites.has(product.id)
          }))

        // Mettre à jour les produits dans le store
        categoryProducts.forEach(newProduct => {
          const index = this.products.findIndex(p => p.id === newProduct.id)
          if (index !== -1) {
            this.products[index] = newProduct
          } else {
            this.products.push(newProduct)
          }
        })

        return categoryProducts
        
      } catch (error) {
        console.error(`❌ Erreur produits ${category}:`, error)
        this.error = error.response?.data?.message || `Erreur lors du chargement des ${category}s`
        throw error
      } finally {
        this.loading = false
      }
    },

    // 🔥 Toggle favori (local storage pour l'instant)
    toggleFavorite(productId) {
      try {
        const id = parseInt(productId)
        
        if (this.favorites.has(id)) {
          this.favorites.delete(id)
          console.log(`💔 Produit ${id} retiré des favoris`)
        } else {
          this.favorites.add(id)
          console.log(`❤️ Produit ${id} ajouté aux favoris`)
        }

        // Mettre à jour le produit dans le store
        const product = this.products.find(p => p.id === id)
        if (product) {
          product.is_favorite = this.favorites.has(id)
        }

        // Sauvegarder en localStorage
        this.saveFavoritesToStorage()

        return this.favorites.has(id)
        
      } catch (error) {
        console.error('❌ Erreur toggle favori:', error)
        throw error
      }
    },

    // 🔥 Sauvegarder favoris
    saveFavoritesToStorage() {
      try {
        const favoritesArray = Array.from(this.favorites)
        localStorage.setItem('favorites', JSON.stringify(favoritesArray))
        console.log('💾 Favoris sauvegardés:', favoritesArray)
      } catch (error) {
        console.error('❌ Erreur sauvegarde favoris:', error)
      }
    },

    // 🔥 Charger favoris
    loadFavoritesFromStorage() {
      try {
        const saved = localStorage.getItem('favorites')
        if (saved) {
          const favoritesArray = JSON.parse(saved)
          this.favorites = new Set(favoritesArray)
          
          // Mettre à jour les produits
          this.products.forEach(product => {
            product.is_favorite = this.favorites.has(product.id)
          })
          
          console.log('📂 Favoris chargés:', favoritesArray)
        }
      } catch (error) {
        console.error('❌ Erreur chargement favoris:', error)
        this.favorites = new Set()
      }
    },

    // 🔥 Recherche avec API (optionnel)
    async searchProductsAPI(query) {
      if (!query || query.length < 2) {
        return this.products
      }

      this.loading = true
      this.error = null
      
      try {
        console.log(`🔍 Recherche API: "${query}"`)

        const response = await axios.get(`${API_URL}/api/products/search`, {
          params: { q: query }
        })
        
        console.log('✅ Résultats recherche:', response.data)
        
        return response.data.map(product => ({
          ...product,
          price: parseFloat(product.price),
          available: Boolean(product.available),
          image_url: product.image_url || '/placeholder-pizza.jpg',
          is_favorite: this.favorites.has(product.id)
        }))
        
      } catch (error) {
        console.error('❌ Erreur recherche:', error)
        // Fallback sur recherche locale
        return this.searchProducts(query)
      } finally {
        this.loading = false
      }
    },

    // 🔥 Clear store
    clearProducts() {
      this.products = []
      this.error = null
      this.loading = false
    },

    // 🔥 Initialisation du store
    async initialize() {
      console.log('🚀 Initialisation ProductsStore...')
      
      // Charger les favoris
      this.loadFavoritesFromStorage()
      
      // Charger les produits si ils n'existent pas
      if (this.products.length === 0) {
        await this.fetchProducts()
      }
      
      console.log('✅ ProductsStore initialisé')
    }
  }
})
