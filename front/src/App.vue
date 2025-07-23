<template>
  <div id="app">
    <router-view />
    
    <!-- 🆕 Bottom Navigation -->
    <BottomNavigation 
      :cart-count="cartCount"
      :hide-on-scroll="true"
      @tab-change="handleTabChange"
    />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import BottomNavigation from './components/BottomNavigation.vue'

// État global du panier (tu peux remplacer par Pinia plus tard)
const cartCount = ref(3) // Exemple

// Gestion du changement d'onglet
const handleTabChange = (tab) => {
  console.log('🔄 Changement onglet:', tab.label)
  // Ici tu peux ajouter des analytics, etc.
}
</script>

<style>
#app {
  /* Espace pour la bottom nav */
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
}

/* Reset par défaut */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
