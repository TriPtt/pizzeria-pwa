<template>
  <div class="menu-page">
    <!-- Header avec AppHeader -->
    <AppHeader 
      :title="currentCategoryTitle"
      :cart-count="cartStore.itemCount"
      @toggle-menu="handleMenuToggle"
      @open-cart="handleCartOpen" 
      @open-search="handleSearchOpen"
    >
      <!-- Bouton retour custom dans le slot left -->
      <template #left>
        <button class="back-btn" @click="$router.go(-1)">
          <i class="ri-arrow-left-line"></i>
        </button>
      </template>

      <!-- Actions custom dans le slot right -->
      <template #right>
        <button class="header-action-btn" @click="toggleFavorites">
          <i class="ri-heart-line" :class="{ 'active': showFavorites }"></i>
        </button>
        <button class="header-action-btn" @click="handleSearchOpen">
          <i class="ri-search-line"></i>
        </button>
      </template>
    </AppHeader>

    <!-- Filtres de catégories -->
    <div class="category-filters">
      <div class="filters-container">
        <button
          v-for="category in categories"
          :key="category.key"
          :class="['category-btn', { 'active': selectedCategory === category.key }]"
          @click="setCategory(category.key)"
        >
          <i :class="category.icon"></i>
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- Compteur de produits -->
    <div class="products-count">
      {{ filteredProducts.length }} Produit{{ filteredProducts.length !== 1 ? 's' : '' }}
    </div>

    <!-- Contenu principal -->
    <div class="menu-content">
      <!-- États de chargement -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des produits...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="ri-error-warning-line"></i>
        <p>{{ error }}</p>
        <button @click="retryLoad" class="retry-btn">Réessayer</button>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <i class="ri-inbox-line"></i>
        <p>Aucun produit trouvé</p>
        <small v-if="selectedCategory !== 'all'">
          Aucun {{ getCategoryLabel(selectedCategory).toLowerCase() }} disponible
        </small>
      </div>

      <!-- Grille de produits -->
      <div v-else class="products-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
          @toggle-favorite="handleToggleFavorite"
          @click="handleProductClick"
        />
      </div>
    </div>

    <!-- Bottom Actions comme dans ton design -->
    <div class="bottom-actions">
      <button class="action-btn sort-btn" @click="openSortMenu">
        <i class="ri-sort-desc"></i>
        SORT
      </button>
      <button class="action-btn filter-btn" @click="openFilterMenu">
        <i class="ri-filter-line"></i>
        FILTER
      </button>
    </div>

    <!-- Modals -->
    <SortModal 
      v-if="showSortModal"
      :current-sort="sortBy"
      @close="showSortModal = false"
      @sort="handleSort"
    />

    <FilterModal
      v-if="showFilterModal"
      :current-filters="filters"
      @close="showFilterModal = false"
      @apply="handleFilters"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../stores/productsStore'
import { useCartStore } from '../stores/cartStore'
import AppHeader from '../components/AppHeader.vue'
import ProductCard from '../components/ProductCard.vue'
import SortModal from '../components/SortModal.vue'
import FilterModal from '../components/FilterModal.vue'

// Stores
const productsStore = useProductsStore()
const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

// État local
const selectedCategory = ref('all')
const showFavorites = ref(false)
const showSortModal = ref(false)
const showFilterModal = ref(false)
const sortBy = ref('name')
const filters = ref({
  minPrice: null,
  maxPrice: null,
  available: true
})

// Catégories avec icônes
const categories = ref([
  { key: 'all', label: 'Tous', icon: 'ri-apps-line' },
  { key: 'pizza', label: 'Pizzas', icon: 'ri-bread-line' },
  { key: 'boisson', label: 'Boissons', icon: 'ri-cup-line' },
  { key: 'dessert', label: 'Desserts', icon: 'ri-cake-3-line' }
])

// Computed
const loading = computed(() => productsStore.loading)
const error = computed(() => productsStore.error)

const currentCategoryTitle = computed(() => {
  const category = categories.value.find(c => c.key === selectedCategory.value)
  return category ? category.label : 'Menu'
})

const filteredProducts = computed(() => {
  let products = productsStore.products

  // Filtre par catégorie
  if (selectedCategory.value !== 'all') {
    products = products.filter(p => p.type === selectedCategory.value)
  }

  // Filtre favoris
  if (showFavorites.value) {
    products = products.filter(p => productsStore.favorites.has(p.id))
  }

  // Filtre prix
  if (filters.value.minPrice) {
    products = products.filter(p => p.price >= filters.value.minPrice)
  }
  if (filters.value.maxPrice) {
    products = products.filter(p => p.price <= filters.value.maxPrice)
  }

  // Filtre disponibilité
  if (filters.value.available) {
    products = products.filter(p => p.available)
  }

  // Tri
  products = [...products].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'popular':
        return (b.orders_count || 0) - (a.orders_count || 0)
      default:
        return 0
    }
  })

  return products
})

// Méthodes
const setCategory = (categoryKey) => {
  selectedCategory.value = categoryKey
  // Mettre à jour l'URL
  router.replace({ 
    path: '/menu', 
    query: { category: categoryKey !== 'all' ? categoryKey : undefined }
  })
}

const getCategoryLabel = (key) => {
  const category = categories.value.find(c => c.key === key)
  return category ? category.label : 'Produits'
}

const toggleFavorites = () => {
  showFavorites.value = !showFavorites.value
}

const handleAddToCart = (product) => {
  cartStore.addItem(product)
  // Feedback visuel
  console.log(`✅ ${product.name} ajouté au panier`)
}

const handleToggleFavorite = (product) => {
  productsStore.toggleFavorite(product.id)
}

const handleProductClick = (product) => {
  router.push(`/product/${product.id}`)
}

const handleMenuToggle = () => {
  // Logique du menu
  console.log('Toggle menu')
}

const handleCartOpen = () => {
  router.push('/cart')
}

const handleSearchOpen = () => {
  router.push('/search')
}

const openSortMenu = () => {
  showSortModal.value = true
}

const openFilterMenu = () => {
  showFilterModal.value = true
}

const handleSort = (newSort) => {
  sortBy.value = newSort
  showSortModal.value = false
}

const handleFilters = (newFilters) => {
  filters.value = { ...newFilters }
  showFilterModal.value = false
}

const retryLoad = () => {
  productsStore.fetchProducts()
}

// Lifecycle
onMounted(async () => {
  // Récupérer la catégorie depuis l'URL
  const categoryFromRoute = route.query.category
  if (categoryFromRoute && categories.value.some(c => c.key === categoryFromRoute)) {
    selectedCategory.value = categoryFromRoute
  }

  // Charger les produits
  try {
    await productsStore.fetchProducts()
  } catch (err) {
    console.error('Erreur chargement produits:', err)
  }
})

// Watch route changes
watch(() => route.query.category, (newCategory) => {
  if (newCategory && categories.value.some(c => c.key === newCategory)) {
    selectedCategory.value = newCategory
  } else {
    selectedCategory.value = 'all'
  }
})
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 140px; /* Space for bottom actions */
}

.back-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.header-action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  margin-left: 0.25rem;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
}

.header-action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.header-action-btn.active,
.header-action-btn .active {
  color: #ef4444;
}

/* Filtres de catégories */
.category-filters {
  background: white;
  padding: 1rem 0 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 60px; /* Height of AppHeader */
  z-index: 10;
}

.filters-container {
  display: flex;
  gap: 0.75rem;
  padding: 0 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.category-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.category-btn.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.category-btn i {
  font-size: 1rem;
}

/* Compteur */
.products-count {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #6b7280;
  background: white;
}

/* Contenu */
.menu-content {
  padding: 0 1rem;
}

/* États */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Grille de produits */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem 0;
}

/* Bottom Actions */
.bottom-actions {
  position: fixed;
  bottom: 70px; 
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  z-index: 20;
}

.action-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  background: #f8fafc;
  color: #374151;
}

.action-btn i {
  font-size: 1.2rem;
}

.filter-btn {
  border-left: 1px solid #e5e7eb;
}

/* Scrollbar */
.filters-container::-webkit-scrollbar {
  display: none;
}

.filters-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
