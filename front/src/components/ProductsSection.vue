<template>
  <section 
    :id="`section-${type}`"
    class="products-section"
  >
    <!-- Header de section -->
    <div class="section-header">
      <h3 class="section-title">{{ sectionTitle }}</h3>
      <button class="see-all-btn" @click="handleSeeAll">
        Voir tout <i class="ri-arrow-right-s-line"></i>
      </button>
    </div>
    
    <!-- États de chargement -->
    <div v-if="loading" class="state-message">
      <div class="loading-spinner"></div>
      🔄 Chargement des produits...
    </div>
    
    <div v-else-if="error" class="state-message error">
      ❌ Erreur: {{ error }}
    </div>
    
    <div v-else-if="filteredProducts.length === 0" class="state-message empty">
      😴 Aucun {{ type }} disponible pour le moment
      <br>
      <small>Ajoutez des {{ type }}s dans votre base de données</small>
    </div>
    
    <!-- Grille de produits -->
    <div v-else class="products-scroll">
      <div class="products-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :loading="false"
          @click="handleProductClick(product)"
          @add-to-cart="handleAddToCart(product)"
          @toggle-favorite="handleToggleFavorite(product)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value => ['pizza', 'boisson', 'dessert'].includes(value)
  },
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: null
  }
})

// Events
const emit = defineEmits(['productClick', 'addToCart', 'toggleFavorite', 'seeAll'])

// Computed
const sectionTitle = computed(() => {
  if (props.title) return props.title
  return `Les ${capitalize(props.type)}s`
})

const filteredProducts = computed(() => {
  return props.products.filter(product => 
    product.type === props.type && product.available
  )
})

// Méthodes
const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const handleProductClick = (product) => {
  emit('productClick', product)
}

const handleAddToCart = (product) => {
  emit('addToCart', product)
}

const handleToggleFavorite = (product) => {
  emit('toggleFavorite', product)
}


const handleSeeAll = (categoryKey) => {
  if (props.type === 'pizza') {
    categoryKey = 'pizza'
  } else if (props.type === 'boisson') {
    categoryKey = 'boisson'
  } else if (props.type === 'dessert') {
    categoryKey = 'dessert'
  }
  // Mettre à jour l'URL
  router.replace({ 
    path: '/products', 
    query: { category: categoryKey !== 'all' ? categoryKey : undefined }
  })
}

</script>

<style scoped>
.products-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.see-all-btn {
  background: none;
  border: none;
  color: #4f46e5;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.see-all-btn:hover {
  color: #3730a3;
}

.state-message {
  padding: 2rem 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.state-message.error {
  color: #dc2626;
}

.state-message.empty small {
  color: #9ca3af;
  font-size: 0.8rem;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f4f6;
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.products-scroll {
  overflow-x: auto;
  padding: 0 1rem;
}

.products-grid {
  display: flex;
  gap: 1rem;
  padding-bottom: 0.5rem;
}

/* Scrollbar styling */
.products-scroll::-webkit-scrollbar {
  height: 4px;
}

.products-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.products-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.products-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .products-grid {
    gap: 0.75rem;
  }
}
</style>
