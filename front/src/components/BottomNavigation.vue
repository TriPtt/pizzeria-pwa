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
        <div class="nav-content">
          <div class="nav-icon-container">
            <i :class="activeTab === item.route ? item.activeIcon : item.icon" class="nav-icon"></i>
            
            <!-- Badge harmonisé -->
            <span 
              v-if="item.badge && item.badge > 0" 
              class="nav-badge"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </div>
          
          <span class="nav-label">{{ item.label }}</span>
        </div>

        <!-- Point indicateur actif -->
        <div v-if="activeTab === item.route" class="active-dot"></div>
      </button>
    </div>

    <div class="safe-area"></div>
  </nav>
</template>

<script setup>
// Votre script existant reste identique
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()

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

const emit = defineEmits(['tabChange'])
const router = useRouter()
const route = useRoute()
const isHidden = ref(false)
const lastScrollY = ref(0)

const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/products')) return 'menu'
  if (path.startsWith('/profile')) return 'profile'
  if (path.startsWith('/cart')) return 'cart'
  if (path.startsWith('/reservations') || path.startsWith('/mes-reservations')) return 'reservations'
  return 'home'
})

const navItems = computed(() => [
  {
    id: 'home',
    route: 'home',
    path: '/',
    label: 'Accueil',
    icon: 'ri-home-line',
    activeIcon: 'ri-home-fill'
  },
  {
    id: 'menu',
    route: 'menu', 
    path: '/products',
    label: 'Menu',
    icon: 'ri-restaurant-line',
    activeIcon: 'ri-restaurant-fill'
  },
  {
    id: 'reservations',
    route: 'reservations',
    path: '/reservations',
    label: 'Réserver',
    icon: 'ri-calendar-line',
    activeIcon: 'ri-calendar-fill'
  },
  {
    id: 'cart',
    route: 'cart',
    icon: 'ri-shopping-basket-line',
    activeIcon: 'ri-shopping-basket-fill',
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

const handleScroll = () => {
  if (!props.hideOnScroll) return

  const currentScrollY = window.scrollY

  if (currentScrollY < 100) {
    isHidden.value = false
  } else if (currentScrollY > lastScrollY.value && currentScrollY > 150) {
    isHidden.value = true
  } else if (currentScrollY < lastScrollY.value - 10) {
    isHidden.value = false
  }

  lastScrollY.value = currentScrollY
}

const handleNavClick = (item) => {
  if (route.path !== item.path) {
    router.push(item.path)
  }

  emit('tabChange', item)

  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

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
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.04);
}

.bottom-nav.hidden {
  transform: translateY(100%);
}

.nav-container {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  padding: 0.75rem 1rem 0.5rem;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-radius: 16px;
  padding: 0.5rem 0.25rem 0.75rem;
}

.nav-item:active {
  transform: scale(0.96);
}

.nav-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  position: relative;
}

.nav-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.nav-icon {
  font-size: 1.375rem;
  color: #64748b;
  transition: all 0.25s ease;
}

.nav-item.active .nav-icon {
  color: #1f2937;
  transform: scale(1.05);
}

/* Badge dans le style de votre app */
.nav-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #dc2626;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  line-height: 1;
  min-width: 18px;
  text-align: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
  animation: badgeScale 0.3s ease-out;
}

@keyframes badgeScale {
  0% { 
    transform: scale(0);
    opacity: 0;
  }
  100% { 
    transform: scale(1);
    opacity: 1;
  }
}

.nav-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.25s ease;
  line-height: 1;
  text-align: center;
}

.nav-item.active .nav-label {
  color: #1f2937;
  font-weight: 600;
}

/* Point indicateur simple et élégant */
.active-dot {
  position: absolute;
  bottom: 0;
  width: 4px;
  height: 4px;
  background: #1f2937;
  border-radius: 50%;
  animation: dotFade 0.3s ease-out;
}

@keyframes dotFade {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.safe-area {
  height: env(safe-area-inset-bottom, 0px);
  background: rgba(255, 255, 255, 0.98);
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

/* Hover subtil sur desktop */
@media (hover: hover) {
  .nav-item:hover:not(.active) .nav-icon {
    color: #374151;
    transform: scale(1.02);
  }

  .nav-item:hover:not(.active) .nav-label {
    color: #374151;
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .bottom-nav {
    background: rgba(17, 24, 39, 0.98);
    border-top: 1px solid rgba(55, 65, 81, 0.2);
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.2);
  }

  .nav-icon,
  .nav-label {
    color: #9ca3af;
  }

  .nav-item.active .nav-icon,
  .nav-item.active .nav-label {
    color: white;
  }

  .active-dot {
    background: white;
  }

  .safe-area {
    background: rgba(17, 24, 39, 0.98);
  }

  .nav-badge {
    border-color: #1f2937;
  }
}

/* Responsive pour petits écrans */
@media (max-width: 380px) {
  .nav-container {
    padding: 0.625rem 0.75rem 0.375rem;
  }

  .nav-item {
    padding: 0.375rem 0.125rem 0.625rem;
  }

  .nav-icon {
    font-size: 1.25rem;
  }

  .nav-icon-container {
    width: 26px;
    height: 26px;
  }

  .nav-label {
    font-size: 0.625rem;
  }

  .nav-badge {
    top: -4px;
    right: -4px;
    min-width: 16px;
    font-size: 0.55rem;
  }
}

/* Animation pour les changements de badge */
.nav-badge {
  transition: transform 0.2s ease;
}

.nav-item:active .nav-badge {
  transform: scale(0.9);
}
</style>
