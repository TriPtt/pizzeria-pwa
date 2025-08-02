<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-btn" @click="$emit('toggleMenu')">
        <i class="ri-menu-line"></i>
      </button>
      <h1 class="header-title">{{ title }}</h1>
    </div>
    <div class="header-actions">
      <button class="header-btn" @click="$emit('openCart')">
        <i class="ri-shopping-cart-line"></i>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </button>
      <button class="header-btn" @click="$emit('openSearch')">
        <i class="ri-search-line"></i>
      </button>
      <button 
        class="header-btn logout-btn" 
        @click="handleLogout" 
        title="Se déconnecter"
      >
        <i class="ri-logout-box-line"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore' // 🎯 Import du store

// Props
defineProps({
  title: {
    type: String,
    default: 'Accueil'
  },
  cartCount: {
    type: Number,
    default: 0
  }
})

// Events
defineEmits(['toggleMenu', 'openCart', 'openSearch'])

// Router et Store
const router = useRouter()
const authStore = useAuthStore() // 🎯 Utilisation du store

const handleLogout = async () => {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    try {
      // 🎯 Utiliser la méthode logout du store
      await authStore.logout()
      
      // 🎯 Redirection vers login
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      
      // 🎯 Fallback: forcer la déconnexion même en cas d'erreur
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      authStore.user = null
      authStore.token = null
      router.push('/login')
    }
  }
}
</script>


<style scoped>
.header {
  background: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #374151;
  cursor: pointer;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.header-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #374151;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  position: relative;
}

.header-btn:hover {
  background-color: #f3f4f6;
}

.logout-btn {
  color: #ef4444 !important;
}

.logout-btn:hover {
  background-color: #fef2f2 !important;
}

.cart-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
</style>
