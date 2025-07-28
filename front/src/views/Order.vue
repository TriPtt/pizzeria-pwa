<template>
  <div class="order-page">
    <!-- Header avec le même style que le panier -->
    <div class="order-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Finaliser la commande</h1>
    </div>

    <!-- Le reste du contenu dans un container scrollable -->
    <div class="order-content">
      <!-- Récapitulatif panier -->
      <div class="cart-summary">
        <h3>Votre commande</h3>
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <img :src="item.image" :alt="item.name" />
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p>{{ item.quantity }}x {{ item.price }}€</p>
            </div>
            <div class="item-total">
              {{ (item.price * item.quantity).toFixed(2) }}€
            </div>
          </div>
        </div>
        <div class="total">
          <strong>Total: {{ totalPrice.toFixed(2) }}€</strong>
        </div>
      </div>

      <!-- Sélection créneau -->
      <div class="time-selection">
        <h3>Choisir un créneau de retrait</h3>
        
        <!-- Sélecteur de date -->
        <div class="date-selector">
          <button 
            v-for="date in availableDates" 
            :key="date.value"
            @click="selectedDate = date.value"
            :class="['date-btn', { active: selectedDate === date.value }]"
          >
            {{ date.label }}
          </button>
        </div>

        <!-- Créneaux horaires -->
        <div class="time-slots">
          <div v-if="loadingSlots" class="loading">
            Chargement des créneaux...
          </div>
          <div v-else class="slots-grid">
            <button
              v-for="slot in availableSlots"
              :key="slot.time"
              @click="selectedSlot = slot"
              :class="['slot-btn', { 
                active: selectedSlot?.time === slot.time,
                full: slot.available < totalPizzas
              }]"
              :disabled="slot.available < totalPizzas"
            >
              {{ slot.time }}
              <small v-if="slot.available < 5">{{ slot.available }} places</small>
            </button>
          </div>
        </div>
      </div>

      <!-- Informations client -->
      <div class="customer-info">
        <h3>Vos informations</h3>
        <form @submit.prevent class="info-form">
          <input v-model="customerInfo.name" placeholder="Nom et prénom" required />
          <input v-model="customerInfo.phone" placeholder="Téléphone" required />
          <textarea v-model="customerInfo.notes" placeholder="Remarques (optionnel)"></textarea>
        </form>
      </div>
    </div>

    <!-- Footer fixe avec bouton de validation -->
    <div class="order-footer">
      <div class="footer-total">
        <span>Total à payer</span>
        <span class="total-price">{{ totalPrice.toFixed(2) }}€</span>
      </div>
      <button 
        @click="submitOrder"
        :disabled="!canSubmitOrder || submitting"
        class="submit-btn"
      >
        <span v-if="submitting">Commande en cours...</span>
        <span v-else>Confirmer la commande</span>
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore' // ← Ajoute ça
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/ordersStore'

const cartStore = useCartStore()
const authStore = useAuthStore() // ← Ajoute ça
const router = useRouter()

// Data
const selectedDate = ref('')
const selectedSlot = ref(null)
const availableSlots = ref([])
const loadingSlots = ref(false)
const submitting = ref(false)

const customerInfo = ref({
  name: '',
  phone: '',
  notes: ''
})

// Computed
const cartItems = computed(() => cartStore.items)
const totalPrice = computed(() => cartStore.totalPrice)
const totalPizzas = computed(() => cartStore.totalQuantity)

const availableDates = computed(() => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return [
    {
      value: today.toISOString().split('T')[0],
      label: "Aujourd'hui"
    },
    {
      value: tomorrow.toISOString().split('T')[0],
      label: "Demain"
    }
  ]
})

const canSubmitOrder = computed(() => {
  return selectedSlot.value && 
         cartItems.value.length > 0 &&
         customerInfo.value.name.trim() &&
         customerInfo.value.phone.trim()
})

// ✅ NOUVEAU - Générer les créneaux horaires
const generateTimeSlots = (date) => {
  const slots = []
  const selectedDateTime = new Date(date)
  const now = new Date()
  
  // Horaires: 11h30 à 14h00 et 18h00 à 21h30
  const timeRanges = [
    { start: 11.5, end: 14 },    // 11h30 - 14h00
    { start: 18, end: 21.5 }     // 18h00 - 21h30
  ]
  
  timeRanges.forEach(range => {
    for (let hour = range.start; hour < range.end; hour += 0.5) {
      const slotTime = new Date(selectedDateTime)
      slotTime.setHours(Math.floor(hour))
      slotTime.setMinutes((hour % 1) * 60)
      slotTime.setSeconds(0)
      
      // Ne propose que les créneaux futurs (au moins 30 min à l'avance)
      const minTime = new Date(now.getTime() + 30 * 60000)
      
      if (slotTime > minTime) {
        const timeString = slotTime.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        
        slots.push({
          time: timeString,
          datetime: slotTime,
          available: Math.floor(Math.random() * 8) + 3 // Simulation: 3-10 places
        })
      }
    }
  })
  
  return slots.sort((a, b) => a.datetime - b.datetime)
}

// Methods
const fetchAvailableSlots = async (date) => {
  loadingSlots.value = true
  selectedSlot.value = null
  
  try {
    // ✅ Version avec vraie API (quand tu l'auras)
    // const response = await axios.get(`/api/orders/available-slots?date=${date}&pizzas=${totalPizzas.value}`)
    // availableSlots.value = response.data.slots
    
    // ✅ Version simulation pour le moment
    await new Promise(resolve => setTimeout(resolve, 500)) // Simule loading
    availableSlots.value = generateTimeSlots(date)
    
    // Auto-sélectionne le premier créneau disponible
    const availableSlot = availableSlots.value.find(slot => slot.available >= totalPizzas.value)
    if (availableSlot) {
      selectedSlot.value = availableSlot
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des créneaux:', error)
    // Fallback sur simulation si l'API ne marche pas
    availableSlots.value = generateTimeSlots(date)
  } finally {
    loadingSlots.value = false
  }
}

const submitOrder = async () => {
  if (!canSubmitOrder.value) return
  
  submitting.value = true
  
  try {
    console.log('🚀 Début création commande...')
    
    // ✅ Prépare les données au bon format
    const orderData = {
      items: cartItems.value, // Tes items avec id, name, price, quantity
      customer: {
        name: customerInfo.value.name.trim(),
        phone: customerInfo.value.phone.trim(),
        notes: customerInfo.value.notes.trim()
      },
      pickup_date: selectedDate.value,
      pickup_time: selectedSlot.value.time,
      total: totalPrice.value,
      pizza_count: totalPizzas.value
    }
    
    console.log('📦 Données commande:', orderData)
    
    // ✅ Utilise le store orders pour créer la commande
    const ordersStore = useOrdersStore()
    const createdOrder = await ordersStore.createOrder(orderData)
    
    console.log('✅ Commande créée:', createdOrder)
    
    // ✅ Vide le panier
    cartStore.clear()
    
    // ✅ Redirige vers confirmation avec l'ID
    router.push({
      name: 'order-confirmation',
      params: { id: createdOrder.id },
      query: {
        orderNumber: createdOrder.order_number,
        total: createdOrder.total_price,
        pickupDate: selectedDate.value,
        pickupTime: selectedSlot.value.time
      }
    })
    
  } catch (error) {
    console.error('❌ Erreur commande:', error)
    
    // ✅ Affiche l'erreur spécifique du store
    const ordersStore = useOrdersStore()
    const errorMessage = ordersStore.error || 'Erreur lors de la commande. Veuillez réessayer.'
    
    alert(`❌ ${errorMessage}`)
  } finally {
    submitting.value = false
  }
}

// Watchers
watch(selectedDate, (newDate) => {
  if (newDate) {
    fetchAvailableSlots(newDate)
  }
})

// ✅ NOUVEAU - Auto-complétion des infos utilisateur
const loadUserInfo = () => {
  if (authStore.user) {
    customerInfo.value.name = authStore.user.name || ''
    customerInfo.value.phone = authStore.user.phone || ''
  }
}

// Lifecycle
onMounted(() => {
  // Redirect si panier vide
  if (cartItems.value.length === 0) {
    router.push('/cart')
    return
  }
  
  // ✅ Auto-complète les infos utilisateur
  loadUserInfo()
  
  // Sélectionne aujourd'hui par défaut
  selectedDate.value = availableDates.value[0].value
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140px;
  overscroll-behavior: none;
}

/* ✅ Header identique au panier */
.order-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #333;
}

.order-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

/* Container scrollable */
.order-content {
  padding: 20px 16px;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cart-summary h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.item-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.item-total {
  font-weight: 600;
  color: #333;
}

.total {
  text-align: right;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #eee;
  font-size: 18px;
  color: #333;
}

.time-selection,
.customer-info {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.time-selection h3,
.customer-info h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.date-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.date-btn {
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.date-btn:hover {
  border-color: #007bff;
}

.date-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.slot-btn {
  padding: 16px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.slot-btn:hover:not(:disabled) {
  border-color: #007bff;
}

.slot-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slot-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.slot-btn.full {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.slot-btn small {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-form input,
.info-form textarea {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.info-form input:focus,
.info-form textarea:focus {
  outline: none;
  border-color: #007bff;
}

.info-form textarea {
  resize: vertical;
  min-height: 80px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

/* ✅ Footer fixe identique au panier */
.order-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.footer-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: center;
}

.footer-total span:first-child {
  color: #666;
}

.total-price {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.submit-btn {
  width: 100%;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .order-content {
    padding: 16px 12px;
  }
  
  .date-selector {
    flex-direction: column;
    gap: 8px;
  }
  
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
}
</style>