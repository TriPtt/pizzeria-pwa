<template>
  <nav class="bottom-nav" :class="{ 'hidden': isHidden }">
    <div class="nav-container">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="[
          'nav-item',
          { 'active': activeTab === item.route }
        ]"
        @click="handleNavClick(item)"
      >
        <div class="nav-icon-container">
          <i :class="item.icon" class="nav-icon"></i>
          <span 
            v-if="item.badge && item.badge > 0" 
            class="nav-badge"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </div>
        <span class="nav-label">{{ item.label }}</span>
        
        <!-- Indicateur actif -->
        <div v-if="activeTab === item.route" class="nav-indicator"></div>
      </button>
    </div>
    
    <!-- Zone de sécurité pour iPhone -->
    <div class="safe-area"></div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()

// Props
const props = defineProps({
  cartCount: {
    type: Number,
    default: 0
  },
  hideOnScroll: {
    type: Boolean,
    default: true
  }
})

// Events
const emit = defineEmits(['tabChange'])

// Router
const router = useRouter()
const route = useRoute()

// États
const isHidden = ref(false)
const lastScrollY = ref(0)

// Active tab basé sur la route actuelle
const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/products')) return 'menu'
  if (path.startsWith('/profile')) return 'profile'
  if (path.startsWith('/cart')) return 'cart'
  if (path.startsWith('/reservations') || path.startsWith('/mes-reservations')) return 'reservations' // 🆕
  return 'home'
})

// Configuration des onglets - 🆕 Ajout du bouton réservation
const navItems = computed(() => [
  {
    id: 'home',
    route: 'home',
    path: '/',
    label: 'Accueil',
    icon: 'ri-home-4-line',
    activeIcon: 'ri-home-4-fill'
  },
  {
    id: 'menu',
    route: 'menu', 
    path: '/products',
    label: 'Menu',
    icon: 'ri-grid-line',
    activeIcon: 'ri-grid-fill'
  },
  {
    id: 'reservations', // 🆕 Nouvel onglet
    route: 'reservations',
    path: '/reservations',
    label: 'Réserver',
    icon: 'ri-calendar-line',
    activeIcon: 'ri-calendar-fill'
  },
  {
    id: 'cart',
    route: 'cart',
    icon: 'ri-shopping-bag-line',
    activeIcon: 'ri-shopping-bag-fill',
    label: 'Panier',
    path: '/cart',
    badge: cartStore.itemCount 
  },
  {
    id: 'profile',
    route: 'profile',
    path: '/profile', 
    label: 'Profil',
    icon: 'ri-user-line',
    activeIcon: 'ri-user-fill'
  }
])

// Gestion du scroll pour cacher/afficher
const handleScroll = () => {
  if (!props.hideOnScroll) return
  
  const currentScrollY = window.scrollY
  
  if (currentScrollY < 100) {
    // Toujours visible en haut de page
    isHidden.value = false
  } else if (currentScrollY > lastScrollY.value && currentScrollY > 150) {
    // Scroll vers le bas = cacher
    isHidden.value = true
  } else if (currentScrollY < lastScrollY.value - 10) {
    // Scroll vers le haut = afficher
    isHidden.value = false
  }
  
  lastScrollY.value = currentScrollY
}

// Navigation
const handleNavClick = (item) => {
  if (route.path !== item.path) {
    router.push(item.path)
  }
  
  emit('tabChange', item)
  
  // Haptic feedback sur mobile
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

// Lifecycle
onMounted(() => {
  if (props.hideOnScroll) {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (props.hideOnScroll) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
/* 🆕 Navigation à 5 éléments maintenant */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  transform: translateY(0);
  transition: transform 0.3s ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.bottom-nav.hidden {
  transform: translateY(100%);
}

.nav-container {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  padding: 0.5rem 0.5rem 0; /* 🆕 Padding réduit pour 5 éléments */
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.15rem 0.5rem; /* 🆕 Padding horizontal réduit */
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-radius: 12px;
  margin: 0 0.1rem; /* 🆕 Marge réduite */
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px; /* 🆕 Légèrement plus petit */
  height: 28px;
  margin-bottom: 0.25rem;
}

.nav-icon {
  font-size: 1.3rem; /* 🆕 Légèrement plus petit pour 5 éléments */
  color: #9ca3af;
  transition: all 0.2s ease;
}

.nav-item.active .nav-icon {
  color: #4f46e5;
  transform: scale(1.1);
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.35rem;
  border-radius: 10px;
  line-height: 1;
  min-width: 18px;
  text-align: center;
  border: 2px solid white;
  animation: bounceIn 0.5s ease;
}

@keyframes bounceIn {
  0% { 
    transform: scale(0);
    opacity: 0;
  }
  50% { 
    transform: scale(1.2);
    opacity: 1;
  }
  100% { 
    transform: scale(1);
  }
}

.nav-label {
  font-size: 0.65rem; /* 🆕 Légèrement plus petit */
  font-weight: 500;
  color: #9ca3af;
  transition: color 0.2s ease;
  line-height: 1;
  text-align: center;
}

.nav-item.active .nav-label {
  color: #4f46e5;
  font-weight: 600;
}

.nav-indicator {
  position: absolute;
  top: 0.25rem;
  width: 28px; /* 🆕 Ajusté à la nouvelle taille */
  height: 3px;
  background: #4f46e5;
  border-radius: 2px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-5px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.safe-area {
  height: env(safe-area-inset-bottom, 0px);
  background: rgba(255, 255, 255, 0.95);
}

/* Variante sombre */
@media (prefers-color-scheme: dark) {
  .bottom-nav {
    background: rgba(17, 24, 39, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .nav-icon,
  .nav-label {
    color: #9ca3af;
  }
  
  .nav-item.active .nav-icon,
  .nav-item.active .nav-label {
    color: #a78bfa;
  }
  
  .nav-indicator {
    background: #a78bfa;
  }
  
  .safe-area {
    background: rgba(17, 24, 39, 0.95);
  }
}

/* 🆕 Responsive optimisé pour 5 éléments */
@media (max-width: 380px) {
  .nav-container {
    padding: 0.5rem 0.25rem 0;
  }
  
  .nav-item {
    margin: 0 0.05rem;
    padding: 0.5rem 0.1rem 0.25rem;
  }
  
  .nav-icon {
    font-size: 1.2rem;
  }
  
  .nav-label {
    font-size: 0.6rem;
  }
  
  .nav-icon-container {
    width: 24px;
    height: 24px;
  }
  
  .nav-indicator {
    width: 24px;
  }
}

/* Animation d'entrée */
.bottom-nav {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Effet hover sur desktop */
@media (hover: hover) {
  .nav-item:hover {
    background: rgba(79, 70, 229, 0.05);
  }
  
  .nav-item:hover .nav-icon {
    color: #6366f1;
    transform: scale(1.05);
  }
  
  .nav-item:hover .nav-label {
    color: #6366f1;
  }
}
</style>
