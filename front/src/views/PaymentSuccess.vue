<template>
  <div class="payment-success">
    <div class="success-content">
      <div class="success-icon">✅</div>
      <h1>Paiement réussi !</h1>
      <p v-if="loading">Finalisation de votre commande...</p>
      
      <div v-if="order" class="order-details">
        <h3>Détails de votre commande</h3>
        <p><strong>Numéro:</strong> #{{ order.id }}</p>
        <p><strong>Total:</strong> {{ order.total_amount }}€</p>
        <p><strong>Retrait:</strong> {{ order.pickup_date }} à {{ order.pickup_time }}</p>
      </div>

      <div v-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <button @click="router.push('/')" class="home-btn">
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(true)
const order = ref(null)
const error = ref(null)

const finalizeOrder = async () => {
  const pendingOrder = localStorage.getItem('pendingOrder')
  
  if (!pendingOrder) {
    console.error('Aucune commande en attente trouvée')
    router.push('/')
    return
  }

  try {
    const orderData = JSON.parse(pendingOrder)
    const token = authStore.token
    
    if (!token) {
      console.error('Utilisateur non connecté')
      error.value = 'Vous devez être connecté pour finaliser la commande'
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL_BACK}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur response:', errorText)
      throw new Error(`Erreur ${response.status}: ${errorText}`)
    }

    const createdOrder = await response.json()
    console.log('Commande créée:', createdOrder)
    
    // 💾 STOCKER DANS LOCALSTORAGE D'ABORD
    const confirmationData = {
      order_Number: createdOrder.order.id,
      total_price: createdOrder.order.total_price,
      pickup_Date: createdOrder.order.pickup_date,
      pickup_Time: createdOrder.order.pickup_time
    }
    localStorage.setItem('orderConfirmation', JSON.stringify(confirmationData))
    console.log('✅ Données stockées:', confirmationData)
    
    // 🧹 NETTOYER D'ABORD
    localStorage.removeItem('pendingOrder')
    cartStore.clear()
    
    // 🚀 REDIRIGER EN DERNIER
    router.push({ name: 'order-confirmation' })
    
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Erreur lors de la finalisation de la commande'
    loading.value = false
  }
}

onMounted(() => {
  finalizeOrder()
})
</script>


<style scoped>
.payment-success {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.success-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.order-details {
  margin: 24px 0;
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.order-details p {
  margin: 8px 0;
}

.error {
  margin: 20px 0;
  padding: 16px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  border: 1px solid #fca5a5;
}

.home-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s;
}

.home-btn:hover {
  background: #218838;
}
</style>
