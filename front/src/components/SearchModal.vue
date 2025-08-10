<template>
  <div v-if="isOpen" class="search-modal-overlay" @click="closeModal">
    <div class="search-modal" @click.stop>
      <div class="search-header">
        <div class="search-input-container">
          <i class="ri-search-line search-icon"></i>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="search-input"
            @input="handleSearch"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <button @click="closeModal" class="close-btn">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="search-content">
        <!-- Loading -->
        <div v-if="isLoading" class="search-loading">
          <i class="ri-loader-4-line spin"></i>
          Recherche en cours...
        </div>

        <!-- Résultats -->
        <div v-else-if="searchResults.length > 0" class="search-results">
          <p class="results-count">{{ searchResults.length }} résultat(s) trouvé(s)</p>
          <div class="products-grid">
            <div 
              v-for="product in searchResults" 
              :key="product.id"
              class="search-product-card"
              @click="openProductOverlay(product)"
            >
              <img 
                :src="product.image" 
                :alt="product.name"
                class="product-image"
                @error="handleImageError"
              />
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">{{ product.price }}€</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="searchQuery && !isLoading" class="no-results">
          <i class="ri-search-line"></i>
          <p>Aucun produit trouvé pour "{{ searchQuery }}"</p>
          <small>Essayez avec d'autres mots-clés</small>
        </div>

        <!-- État initial -->
        <div v-else class="search-placeholder">
          <i class="ri-search-line"></i>
          <p>Tapez le nom d'un produit pour commencer la recherche</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useOverlayStore } from '../stores/overlayStore'

const overlayStore = useOverlayStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  products: {
    type: Array,
    default: () => []
  }
})

// Events
const emit = defineEmits(['close', 'selectProduct'])

// Data
const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const searchInput = ref(null)

const openProductOverlay = (product) => {
  overlayStore.openProductOverlay(product)
  closeModal() // Fermer la recherche
}

// Watch pour focus sur l'input quand modal s'ouvre
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    // Reset quand on ferme
    searchQuery.value = ''
    searchResults.value = []
  }
})

// Fonction de recherche fuzzy
const fuzzySearch = (query, text) => {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Recherche exacte d'abord
  if (textLower.includes(queryLower)) {
    return true
  }
  
  // Recherche fuzzy - permet quelques erreurs
  let queryIndex = 0
  let textIndex = 0
  let errors = 0
  const maxErrors = Math.floor(query.length * 0.3) // 30% d'erreurs autorisées
  
  while (queryIndex < queryLower.length && textIndex < textLower.length) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      queryIndex++
      textIndex++
    } else {
      errors++
      if (errors > maxErrors) return false
      textIndex++
    }
  }
  
  return queryIndex === queryLower.length
}

// Gestionnaire de recherche avec debounce
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  isLoading.value = true
  
  searchTimeout = setTimeout(() => {
    const query = searchQuery.value.trim()
    
    searchResults.value = props.products.filter(product => {
      return fuzzySearch(query, product.name) || 
             fuzzySearch(query, product.description || '')
    })
    
    isLoading.value = false
  }, 300) // Debounce de 300ms
}

// Actions
const closeModal = () => {
  emit('close')
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchInput.value?.focus()
}

const selectProduct = (product) => {
  emit('selectProduct', product)
  closeModal()
}

const handleImageError = (event) => {
  event.target.src = '/placeholder-product.png'
}
</script>

<style scoped>
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding-top: 10vh;
}

.search-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.search-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #6b7280;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.results-count {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.product-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
}

.no-results, .search-placeholder {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.no-results i, .search-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results p, .search-placeholder p {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.no-results small {
  color: #9ca3af;
}
</style>
