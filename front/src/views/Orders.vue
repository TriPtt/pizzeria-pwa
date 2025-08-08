<template>
  <div class="orders-page">
    <!-- Header -->
    <div class="orders-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Mes Commandes</h1>
    </div>

    <!-- Content -->
    <div class="orders-content">
      <!-- Loading -->
      <div v-if="ordersStore.isLoading" class="loading">
        <p>Chargement de vos commandes...</p>
      </div>

      <!-- Error -->
      <div v-else-if="ordersStore.error" class="error">
        <p>{{ ordersStore.error }}</p>
        <button @click="ordersStore.fetchOrders()" class="retry-btn">
          Réessayer
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="ordersStore.orders.length === 0" class="empty-state">
        <h3>Aucune commande</h3>
        <p>Vous n'avez pas encore passé de commande</p>
        <button @click="$router.push('/')" class="browse-btn">
          Découvrir le menu
        </button>
      </div>

      <!-- Orders list -->
      <div v-else class="orders-list">
        <div 
          v-for="order in ordersStore.orders" 
          :key="order.id" 
          class="order-card"
        >
          <!-- Header avec numéro et statut -->
          <div class="order-header">
            <div>
              <h3>{{ order.order_number }}</h3>
              <p class="order-date">{{ formatDate(order.created_at) }}</p>
            </div>
            <div 
              class="status-badge"
              :style="{ 
                color: ordersStore.getStatusColor(order.status),
                backgroundColor: ordersStore.getStatusColor(order.status) + '20'
              }"
            >
              {{ ordersStore.getStatusLabel(order.status) }}
            </div>
          </div>

          <!-- Détails -->
          <div class="order-details">
            <!-- Items -->
            <div class="order-items">
              <p v-for="item in order.items" :key="item.name">
                {{ item.quantity }}x {{ item.name }} - {{ item.price.toFixed(2) }}€
              </p>
            </div>

            <!-- Total -->
            <div class="order-total">
              <strong>Total: {{ parseFloat(order.total_price).toFixed(2) }}€</strong>
            </div>

            <!-- Date de mise à jour si différente -->
            <div v-if="order.updated_at !== order.created_at" class="order-updated">
              <small>Mis à jour: {{ formatDate(order.updated_at) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOrdersStore } from '../stores/ordersStore'

const ordersStore = useOrdersStore()

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  console.log('🔄 Chargement des commandes...')
  await ordersStore.fetchOrders()
  console.log('📋 Commandes chargées:', ordersStore.orders)
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.orders-header {
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

.orders-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.orders-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 40px 20px;
}

.error {
  color: #dc2626;
}

.retry-btn, .browse-btn {
  margin-top: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state h3 {
  margin-bottom: 8px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.order-date {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-details {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.pickup-info {
  margin-bottom: 12px;
}

.pickup-info p {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.order-items {
  margin-bottom: 16px;
}

.order-items p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.order-total {
  text-align: right;
  font-size: 18px;
  color: #333;
}

.order-updated {
  margin-top: 8px;
  text-align: right;
}

.order-updated small {
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .orders-content {
    padding: 16px 12px;
    max-width: none;
  }
  
  .order-card {
    padding: 16px;
  }
}
</style>
