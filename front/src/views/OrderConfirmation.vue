<template>
  <div class="confirmation-page">
    <div class="confirmation-content">
      <div class="success-icon">✅</div>
      <h1>Commande confirmée !</h1>
      
      <div v-if="orderData.order_Number" class="order-details">
        <p><strong>Numéro:</strong> #{{ orderData.order_Number }}</p>
        <p><strong>Total:</strong> {{ orderData.total_price }}€</p>
        <p><strong>Retrait:</strong> {{ orderData.pickup_Date }} à {{ orderData.pickup_Time }}</p>
      </div>
      
      <div v-else class="loading">
        <p>Chargement des détails...</p>
      </div>
      
      <button @click="goHome" class="home-btn">
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const orderData = ref({})
const debugInfo = ref('')

onMounted(() => {
  console.log('🏪 OrderConfirmation mounted')
  
  // Vérifier localStorage
  const storedData = localStorage.getItem('orderConfirmation')
  console.log('📥 Données stockées:', storedData)
  
  if (storedData) {
    try {
      orderData.value = JSON.parse(storedData)
      console.log('✅ Données parsées:', orderData.value)
      localStorage.removeItem('orderConfirmation')
      console.log('🧹 LocalStorage nettoyé')
    } catch (error) {
      console.error('💥 Erreur parsing:', error)
      debugInfo.value = 'Erreur de parsing: ' + error.message
    }
  } else {
    console.log('❌ Aucune donnée dans localStorage')
    debugInfo.value = 'Aucune donnée trouvée dans localStorage'
  }
  
  // Debug localStorage complet
  console.log('🔍 Contenu complet localStorage:')
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    console.log(`  ${key}: ${localStorage.getItem(key)}`)
  }
})
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.confirmation-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.confirmation-content {
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
}

.order-details p {
  margin: 8px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.home-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.loading {
  margin: 24px 0;
  color: #666;
}

</style>