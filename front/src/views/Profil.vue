<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="profile-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Profile</h1>
    </div>

    <!-- Loading state -->
    <div v-if="authStore.isLoading" class="loading-state">
      <p>Chargement...</p>
    </div>

    <!-- Contenu -->
    <div v-else class="profile-content">
      <!-- Section utilisateur principale -->
      <div class="user-card" @click="$router.push('/profile/personal-info')">
        <div class="user-row">
          <div class="user-avatar">
            <!-- ✅ Si avatar depuis l'API -->
            <img v-if="user?.avatar" :src="`http://localhost:3001${user.avatar}`" :alt="user?.name || 'User'">
            <div v-else class="avatar-placeholder">
              {{ getInitials(user?.name || user?.email || 'User') }}
            </div>
          </div>
          
          <div class="user-details">
            <h3>{{ user?.name || 'Nom non renseigné' }}</h3>
            <p>{{ user?.email || 'Email non renseigné' }}</p>
            <!-- ✅ Affiche le phone seulement s'il existe -->
            <p v-if="user?.phone">{{ user.phone }}</p>
            <p v-else class="placeholder-text">Téléphone non renseigné</p>
          </div>
          
          <div class="chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Menu items -->
      <div class="menu-section">
        <div class="menu-item" @click="$router.push('/profile/personal-info')">
          <span>Informations personnelles</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>

        <div class="menu-item" @click="$router.push('/orders')">
          <div class="menu-item-content">
            <span>Mes commandes</span>
            <!-- ✅ Affiche le nombre de commandes -->
            <span v-if="orderCount > 0" class="order-count">{{ orderCount }}</span>
            <span v-else class="no-orders">Aucune commande</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>

        <div class="menu-item" @click="$router.push('/wishlist')">
          <span>Ma liste de souhaits</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>

        <div class="menu-item" @click="$router.push('/profile/reviews')">
          <span>Mes avis</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <!-- Bouton logout -->
      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn" :disabled="authStore.isLoading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ authStore.isLoading ? 'Déconnexion...' : 'Se déconnecter' }}
        </button>
      </div>

      <!-- Debug info (enlève ça en prod) -->
      <div v-if="showDebug" class="debug-info">
        <h4>Debug Info:</h4>
        <pre>{{ JSON.stringify(user, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/ordersStore'

const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const router = useRouter()

// Pour debugger (mets à true si tu veux voir les données)
const showDebug = ref(false)

// Computed
const user = computed(() => {
  console.log('User data dans profile:', authStore.user)
  return authStore.user
})

const orderCount = computed(() => ordersStore.orderCount)

// Methods
const getInitials = (name) => {
  if (!name) return 'U'
  
  // Si c'est un email, prendre la partie avant @
  if (name.includes('@')) {
    name = name.split('@')[0]
  }
  
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleLogout = async () => {
  try {
    const confirmLogout = confirm('Êtes-vous sûr de vouloir vous déconnecter ?')
    if (!confirmLogout) return
    
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    alert('Erreur lors de la déconnexion')
  }
}

// Lifecycle
onMounted(() => {
  // Vérifier si l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  ordersStore.fetchOrders()
  
  console.log('✅ Profile mounted avec user:', authStore.user)
  console.log('✅ Commandes chargées:', ordersStore.orders)
  
  // Debug toggle (double-tap sur le header)
  let tapCount = 0
  const profileHeader = document.querySelector('.profile-header h1')
  if (profileHeader) {
    profileHeader.addEventListener('click', () => {
      tapCount++
      setTimeout(() => tapCount = 0, 300)
      if (tapCount === 2) {
        showDebug.value = !showDebug.value
      }
    })
  }
})

onMounted(() => {
  console.log('🔍 DEBUG PROFILE:')
  console.log('- authStore:', authStore)
  console.log('- authStore.user:', authStore.user)
  console.log('- authStore.isAuthenticated:', authStore.isAuthenticated)
  console.log('- authStore.token:', authStore.token)
  console.log('- localStorage user:', localStorage.getItem('user'))
  console.log('- localStorage token:', localStorage.getItem('token'))
})
</script>

<style scoped>
/* Tes styles existants + quelques ajouts */

/* Loading state */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

/* Placeholder text */
.placeholder-text {
  color: #999 !important;
  font-style: italic;
}

/* User card cliquable */
.user-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Debug info */
.debug-info {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.debug-info h4 {
  margin: 0 0 8px 0;
  color: #666;
}

.debug-info pre {
  font-size: 12px;
  color: #333;
  margin: 0;
  white-space: pre-wrap;
}

/* Button disabled state */
.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animation d'entrée */
.profile-content {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Le reste de tes styles... */
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.profile-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.profile-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.profile-content {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.user-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-details h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.user-details p {
  font-size: 14px;
  color: #666;
  margin: 2px 0;
}

.chevron {
  color: #ccc;
  flex-shrink: 0;
}

.menu-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item span {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.menu-item svg {
  color: #ccc;
}

.logout-section {
  margin-top: 20px;
}

.logout-btn {
  width: 100%;
  background: white;
  border: 2px solid #007bff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #007bff;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #007bff;
  color: white;
}

.menu-item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-count {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: 12px;
  align-self: flex-start;
}

.no-orders {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

@media (max-width: 768px) {
  .profile-content {
    padding: 16px 12px;
    max-width: none;
  }
}
</style>
