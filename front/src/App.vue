<template>
  <div id="app">
    <router-view />

    <ProductOverlay 
      :show="overlayStore.showProductOverlay"
      :product="overlayStore.selectedProduct"
      @close="overlayStore.closeProductOverlay"
    />
    
    <BottomNavigation 
      :cart-count="overlayStore.cartCount"
      :hide-on-scroll="true"
      @tab-change="handleTabChange"
      v-if="showBottomNav"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BottomNavigation from './components/BottomNavigation.vue'
import ProductOverlay from './components/ProductOverlay.vue'
import { useOverlayStore } from './stores/overlayStore'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useWishlistStore } from './stores/wishlistStore'

onMounted(() => {
  const authStore = useAuthStore()
  authStore.initAuth()
  const wishlistStore = useWishlistStore()
  wishlistStore.initializeWishlist()
})

const route = useRoute()
const overlayStore = useOverlayStore()

const showBottomNav = computed(() => {
  return route.name === 'home' || route.name === 'menu' || 
         route.name === 'profile' || route.name === 'reservations'
})

// 🎯 Ajout/suppression de classe CSS sur le body
watch(showBottomNav, (hasBottomNav) => {
  if (hasBottomNav) {
    document.body.classList.add('has-bottom-nav')
  } else {
    document.body.classList.remove('has-bottom-nav')
  }
}, { immediate: true })

const handleTabChange = (tab) => {
  console.log('🔄 Changement onglet:', tab.label)
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  position: fixed;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  width: 100%;
}

#app {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  transition: padding-bottom 0.3s ease;
}

/* 🎯 Quand la bottom nav est présente */
body.has-bottom-nav #app {
  padding-bottom: 90px;
}

/* Pour être sûr que ça marche sur toutes les pages */
body.has-bottom-nav .page-container,
body.has-bottom-nav .menu-page,
body.has-bottom-nav .home-page,
body.has-bottom-nav .profile-page,
body.has-bottom-nav .cart-page {
  margin-bottom: 20px; /* Marge supplémentaire si besoin */
}
</style>
