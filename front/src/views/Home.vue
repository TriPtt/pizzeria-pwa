<template>
  <div class="home">
    <!-- Header avec compteur cart dynamique -->
    <AppHeader 
      title="Accueil"
      :cart-count="cartStore.itemCount"
      @toggle-menu="handleMenuToggle"
      @open-cart="handleCartOpen" 
      @open-search="handleSearchOpen"
    />

    <SearchModal
      :isOpen="isSearchOpen"
      :products="products"
      @close="closeSearch"
      @selectProduct="handleProductSelect"
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

    <!-- App Promo -->
    <AppPromoSection 
      v-if="!isInstalled"
      :title="isInstallable ? 
        'Installez LA FAVOLA en 1 clic !' : 
        'Ajoutez LA FAVOLA à votre écran d\'accueil !'"
      :button-text="isInstallable ? 'Installer maintenant' : 'Instructions'"
      theme="purple"
      :dismissible="true"
      @button-click="handleAppInstall"
      @dismiss="handleAppPromoDismiss"
    />

    <!-- Footer -->
    <FooterSection 
      address="39 Rue Gambetta, 17400 Saint-Jean-d'Angély"
      phone="07 44 52 57 77"
      email="lafavola17@gmail.com"
      city="Saint-Jean-d'Angély"
      :start-year="2021"
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
import { useCartStore } from '../stores/cartStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import SearchModal from '../components/SearchModal.vue'
import { usePWA } from '../composables/usePWA'

const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { isSupported, isInstallable, isInstalled, installPWA } = usePWA()

// États
const cartItems = ref([])
const products = ref([])
const loading = ref(true)
const error = ref(null)
const activeCategory = ref(null)
const isSearchOpen = ref(false)

// Modifier la fonction addToCart
const addToCart = (product) => {
  // console.log('🛒 Ajouter au panier:', product.name)
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
const featuredImage = ref('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop')

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

const handleMenuToggle = () => console.log('🍔 Menu toggle')
const handleCartOpen = () => {
  router.push('/cart')
}
const handleSearchOpen = () => {
  isSearchOpen.value = true
}

const closeSearch = () => {
  isSearchOpen.value = false
}

const handleFeaturedClick = () => console.log('🍕 Featured clicked!')


const handleCategoryClick = (category) => {
  // console.log('📂 Category clicked:', category.name)
  activeCategory.value = activeCategory.value === category.type ? null : category.type
  scrollToSection(category.type)
}

const openProduct = (product) => {
  // console.log('🍕 Ouvrir produit:', product.name)
  router.push(`/product/${product.id}`)
}

const toggleFavorite = (product) => {
  // console.log('❤️ Toggle favorite:', product.name)
  favoritesStore.toggleFavorite(product)
}

const handleSeeAll = (type) => {
  // console.log('👀 See all:', type)
  router.push(`/products/${type}`)
}

const handleAppInstall = async () => {
  console.log('📱 Tentative d\'installation...')
  
  // Si déjà installée
  if (isInstalled.value) {
    alert('✅ L\'application est déjà installée!')
    return
  }
  
  // Si installable via le prompt
  if (isInstallable.value) {
    console.log('🚀 Installation via prompt...')
    const installed = await installPWA()
    
    if (installed) {
      console.log('✅ Installation réussie!')
      return // 🚨 AJOUTE CE RETURN !
    } else {
      console.log('❌ Installation annulée')
      return // 🚨 AJOUTE CE RETURN !
    }
  }
  
  // 🚨 AJOUTE CONSOLE.LOG
  console.log('💡 Fallback vers instructions manuelles')
  
  // Fallback : Instructions manuelles
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  
  if (isIOS) {
    alert('📱 Pour installer sur iOS :\n\n1️⃣ Appuyez sur "Partager" ⬆️\n2️⃣ Sélectionnez "Sur l\'écran d\'accueil" 📲')
  } else if (isAndroid) {
    alert('📱 Pour installer sur Android :\n\n1️⃣ Menu du navigateur ⋮\n2️⃣ "Installer l\'application" ou "Ajouter à l\'écran d\'accueil" 📲')
  } else {
    alert('📱 Pour installer :\n\nRecherchez "Installer l\'application" dans le menu de votre navigateur 🌐')
  }
}


const handleAppPromoDismiss = () => {
  console.log('❌ Promo app fermée')
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

const API = import.meta.env.VITE_API_URL_BACK

// 🌐 API
const fetchProducts = async () => {
  try {
    // console.log('🚀 Chargement des produits...')
    loading.value = true
    error.value = null

    const res = await axios.get(`${API}/api/products`)
    products.value = res.data
    
    // console.log(`✅ ${products.value.length} produits chargés`)
  } catch (err) {
    // console.error('❌ Erreur de chargement:', err)
    error.value = err.response?.data?.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Charge les données depuis localStorage
  cartStore.loadFromStorage()
  favoritesStore.loadFromStorage()
})

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.home {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 80px;
  line-height: 1.5;
  box-sizing: border-box;
  overscroll-behavior: none;
}

.home :deep(.products-section) {
  scroll-margin-top: 80px; /* Ajuste selon la hauteur réelle de ton header */
}
</style>
