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
import { ref, computed, onMounted } from 'vue'
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
  return route.name === 'home' // ou route.path === '/'
})

// Gestion du changement d'onglet
const handleTabChange = (tab) => {
  console.log('🔄 Changement onglet:', tab.label)
  // Ici tu peux ajouter des analytics, etc.
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
}

.page-with-fixed-footer {
  padding-bottom: 100px;
  box-sizing: border-box;
}


</style>
