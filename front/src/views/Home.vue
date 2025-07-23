<template>
  <div class="home">
    <!-- Header -->
    <AppHeader 
      title="Accueil"
      :cart-count="cartItems.length"
      @toggle-menu="handleMenuToggle"
      @open-cart="handleCartOpen" 
      @open-search="handleSearchOpen"
    />

    <!-- Featured -->
    <FeaturedSection 
      title="En ce moment"
      description="La pizza Raclette : Base crème, pomme de terre, fromage à raclette."
      :image="featuredImage"
      badge="Nouveauté"
      :show-button="true"
      button-text="Commander"
      @click="handleFeaturedClick"
    />

    <!-- Catégories -->
    <CategoriesSection 
      title="Catégories"
      :categories="categoriesWithCount"
      :active-category="activeCategory"
      @category-click="handleCategoryClick"
    />

    <!-- Sections Produits -->
    <ProductsSection 
      v-for="type in ['pizza', 'boisson', 'dessert']"
      :key="type"
      :type="type"
      :products="products"
      :loading="loading"
      :error="error"
      @product-click="openProduct"
      @add-to-cart="addToCart"
      @toggle-favorite="toggleFavorite"
      @see-all="handleSeeAll"
    />

    <!-- 🆕 App Promo avec thème -->
    <AppPromoSection 
      title="Téléchargez l'app LA FAVOLA pour commander plus rapidement !"
      button-text="Installer l'app"
      theme="purple"
      :dismissible="true"
      @button-click="handleAppInstall"
      @dismiss="handleAppPromoDismiss"
    />

    <!-- 🆕 Footer avec toutes les infos -->
    <FooterSection 
      address="123 Rue de la Pizza, 75001 Paris"
      phone="01 23 45 67 89"
      email="contact@lafavola.fr"
      city="Paris"
      :start-year="2010"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import FeaturedSection from '../components/FeaturedSection.vue'
import CategoriesSection from '../components/CategoriesSection.vue'
import ProductsSection from '../components/ProductsSection.vue'
import AppPromoSection from '../components/AppPromoSection.vue'
import FooterSection from '../components/FooterSection.vue'

// États
const cartItems = ref([])
const products = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref(null)
const favorites = ref([])

// Injection pour mettre à jour le cart count global
const updateCartCount = inject('updateCartCount')

// Modifier la fonction addToCart
const addToCart = (product) => {
  console.log('🛒 Ajouter au panier:', product.name)
  cartItems.value.push({ 
    ...product, 
    quantity: 1, 
    cartId: Date.now() 
  })
  
  // 🆕 Mettre à jour le badge de la bottom nav
  updateCartCount(cartItems.value.length)
}

// Router
const router = useRouter()

// Images
const featuredImage = ref('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop')

// Catégories avec compteurs
const categoriesWithCount = computed(() => {
  const pizzasCount = products.value.filter(p => p.type === 'pizza').length
  const boissonsCount = products.value.filter(p => p.type === 'boisson').length
  const dessertsCount = products.value.filter(p => p.type === 'dessert').length

  return [
    {
      id: 1,
      name: 'Pizzas',
      type: 'pizza',
      icon: 'ri-pie-chart-2-line',
      color: '#ef4444',
      count: pizzasCount
    },
    {
      id: 2,
      name: 'Boissons',
      type: 'boisson',
      icon: 'ri-cup-line',
      color: '#3b82f6',
      count: boissonsCount
    },
    {
      id: 3,
      name: 'Desserts',
      type: 'dessert',
      icon: 'ri-cake-2-line',
      color: '#8b5cf6',
      count: dessertsCount
    }
  ]
})

// 🎯 Handlers Header
const handleMenuToggle = () => console.log('🍔 Menu toggle')
const handleCartOpen = () => console.log('🛒 Ouvrir panier')
const handleSearchOpen = () => console.log('🔍 Ouvrir recherche')

// 🎯 Handlers Featured
const handleFeaturedClick = () => console.log('🍕 Featured clicked!')

// 🎯 Handlers Categories
const handleCategoryClick = (category) => {
  console.log('📂 Category clicked:', category.name)
  activeCategory.value = activeCategory.value === category.type ? null : category.type
  scrollToSection(category.type)
}

// 🎯 Handlers Products
const openProduct = (product) => {
  console.log('🍕 Ouvrir produit:', product.name)
  router.push(`/product/${product.id}`)
}


const toggleFavorite = (product) => {
  console.log('❤️ Toggle favorite:', product.name)
  const existingIndex = favorites.value.findIndex(fav => fav.id === product.id)
  
  if (existingIndex > -1) {
    favorites.value.splice(existingIndex, 1)
  } else {
    favorites.value.push(product)
  }
}

const handleSeeAll = (type) => {
  console.log('👀 See all:', type)
  router.push(`/products/${type}`)
}

// 🎯 Handlers App Promo
const handleAppInstall = () => {
  console.log('📱 Installation de l\'app...')
  // Ici tu peux ajouter la logique PWA
}

const handleAppPromoDismiss = () => {
  console.log('❌ Promo app fermée')
  // Sauvegarder en localStorage que l'utilisateur a fermé
}

// 🔧 Utilitaires
const scrollToSection = (type) => {
  const element = document.getElementById(`section-${type}`)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest' 
    })
  }
}

// 🌐 API
const fetchProducts = async () => {
  try {
    console.log('🚀 Chargement des produits...')
    loading.value = true
    error.value = null
    
    const res = await axios.get('http://localhost:5000/api/products')
    products.value = res.data
    
    console.log(`✅ ${products.value.length} produits chargés`)
  } catch (err) {
    console.error('❌ Erreur de chargement:', err)
    error.value = err.response?.data?.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.home {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 20px;
  line-height: 1.5;
}
</style>
