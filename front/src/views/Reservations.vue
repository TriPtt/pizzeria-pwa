<template>
  <div class="reservations-page">
    <!-- Header -->
    <div class="reservations-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Réservation</h1>
      <button @click="showMyReservations" class="my-reservations-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0-2-2V5a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2"/>
          <path d="m9 11 3 3 8-8" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <!-- Contenu principal -->
    <div class="reservations-content">
      
      <!-- Étape 1: Sélection date et nombre de personnes -->
      <div v-if="step === 1" class="step-container">
        <div class="step-header">
          <h2>📅 Choisir la date et le nombre de personnes</h2>
          <p>Sélectionnez votre date et le nombre de convives</p>
        </div>

        <div class="form-group">
          <label>Date de réservation</label>
          <input 
            type="date" 
            v-model="selectedDate"
            :min="minDate"
            :max="maxDate"
            class="date-input"
            @change="resetTimeSlot"
          />
        </div>

        <div class="form-group">
          <label>Nombre de personnes</label>
          <div class="guests-selector">
            <button 
              @click="decreaseGuests" 
              :disabled="selectedGuests <= 1"
              class="guests-btn"
            >-</button>
            <span class="guests-count">{{ selectedGuests }}</span>
            <button 
              @click="increaseGuests" 
              :disabled="selectedGuests >= 8"
              class="guests-btn"
            >+</button>
          </div>
          <small class="help-text">
            Maximum 8 personnes. Pour plus, contactez-nous au 📞 01.23.45.67.89
          </small>
        </div>

        <button 
          @click="searchAvailableSlots" 
          :disabled="!selectedDate || loading"
          class="continue-btn"
        >
          <span v-if="loading">Recherche...</span>
          <span v-else>Voir les créneaux disponibles</span>
        </button>
      </div>

      <!-- Étape 2: Sélection du créneau -->
      <div v-if="step === 2" class="step-container">
        <div class="step-header">
          <h2>🕐 Choisir un créneau</h2>
          <p>{{ formatDateLong(selectedDate) }} - {{ selectedGuests }} personne{{ selectedGuests > 1 ? 's' : '' }}</p>
          <button @click="step = 1" class="modify-btn">Modifier</button>
        </div>

        <div v-if="availableSlots.length === 0" class="no-slots">
          <div class="no-slots-icon">😔</div>
          <h3>Aucun créneau disponible</h3>
          <p>Essayez une autre date ou un nombre de personnes différent.</p>
          <button @click="step = 1" class="back-to-date-btn">
            Choisir une autre date
          </button>
        </div>

        <div v-else class="slots-grid">
          <button
            v-for="slot in availableSlots"
            :key="slot.datetime"
            @click="selectTimeSlot(slot)"
            :class="['slot-btn', { 'selected': selectedSlot?.datetime === slot.datetime }]"
          >
            {{ slot.time }}
          </button>
        </div>

        <button 
          v-if="selectedSlot"
          @click="step = 3" 
          class="continue-btn"
        >
          Continuer
        </button>
      </div>

      <!-- Étape 3: Confirmation -->
      <div v-if="step === 3" class="step-container">
        <div class="step-header">
          <h2>✅ Confirmer la réservation</h2>
        </div>

        <div class="reservation-summary">
          <div class="summary-item">
            <span class="label">📅 Date :</span>
            <span class="value">{{ formatDateLong(selectedDate) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">🕐 Heure :</span>
            <span class="value">{{ selectedSlot?.time }}</span>
          </div>
          <div class="summary-item">
            <span class="label">👥 Personnes :</span>
            <span class="value">{{ selectedGuests }}</span>
          </div>
          <div class="summary-item">
            <span class="label">⏱️ Durée :</span>
            <span class="value">1h30</span>
          </div>
        </div>

        <div class="info-box">
          <h4>📋 Informations importantes</h4>
          <ul>
            <li>La table sera libérée automatiquement après 1h30</li>
            <li>Modification/annulation possible jusqu'à 2h avant</li>
            <li>Vous recevrez une confirmation par SMS</li>
          </ul>
        </div>

        <div class="action-buttons">
          <button @click="step = 2" class="back-btn-step">
            Retour
          </button>
          <button 
            @click="confirmReservation" 
            :disabled="loading"
            class="confirm-btn"
          >
            <span v-if="loading">Confirmation...</span>
            <span v-else>Confirmer la réservation</span>
          </button>
        </div>
      </div>

      <!-- Étape 4: Succès -->
      <div v-if="step === 4" class="step-container success-container">
        <div class="success-animation">🎉</div>
        <h2>Réservation confirmée !</h2>
        <p>Votre table est réservée pour le {{ formatDateLong(selectedDate) }} à {{ selectedSlot?.time }}</p>
        
        <div class="success-actions">
          <button @click="goToMyReservations" class="view-reservations-btn">
            Voir mes réservations
          </button>
          <button @click="resetForm" class="new-reservation-btn">
            Nouvelle réservation
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStore } from '../stores/reservationStore'

// Stores
const router = useRouter()
const reservationStore = useReservationStore()

// États réactifs
const step = ref(1)
const loading = ref(false)
const selectedDate = ref('')
const selectedGuests = ref(2)
const selectedSlot = ref(null)
const availableSlots = ref([])

// Dates limites
const today = new Date()
const minDate = computed(() => {
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 30) // 30 jours à l'avance
  return maxDate.toISOString().split('T')[0]
})

// Méthodes
const increaseGuests = () => {
  if (selectedGuests.value < 8) selectedGuests.value++
}

const decreaseGuests = () => {
  if (selectedGuests.value > 1) selectedGuests.value--
}

const resetTimeSlot = () => {
  selectedSlot.value = null
  availableSlots.value = []
  if (step.value > 1) step.value = 1
}

const formatDateLong = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const searchAvailableSlots = async () => {
  loading.value = true
  try {
    const slots = await reservationStore.getAvailableSlots(selectedDate.value, selectedGuests.value)
    availableSlots.value = slots
    step.value = 2
  } catch (error) {
    alert(error.message || 'Erreur lors de la recherche des créneaux')
  } finally {
    loading.value = false
  }
}

const selectTimeSlot = (slot) => {
  selectedSlot.value = slot
}

const confirmReservation = async () => {
  loading.value = true
  try {
    await reservationStore.createReservation({
      reservation_date: selectedSlot.value.datetime,
      number_of_guests: selectedGuests.value
    })
    step.value = 4
  } catch (error) {
    alert(error.message || 'Erreur lors de la réservation')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  step.value = 1
  selectedDate.value = ''
  selectedGuests.value = 2
  selectedSlot.value = null
  availableSlots.value = []
}

const showMyReservations = () => {
  router.push('/mes-reservations')
}

const goToMyReservations = () => {
  router.push('/mes-reservations')
}
</script>


<style scoped>
.reservations-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.reservations-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.reservations-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.back-btn, .my-reservations-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover, .my-reservations-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.reservations-content {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.step-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.step-header {
  text-align: center;
  margin-bottom: 24px;
}

.step-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.3rem;
}

.step-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.modify-btn {
  background: #f0f8ff;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.date-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
}

.guests-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 12px 0;
}

.guests-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.guests-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.guests-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.guests-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  min-width: 30px;
  text-align: center;
}

.help-text {
  display: block;
  text-align: center;
  color: #666;
  font-size: 0.8rem;
  margin-top: 8px;
}

.continue-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.continue-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-slots {
  text-align: center;
  padding: 40px 20px;
}

.no-slots-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-slots h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.no-slots p {
  margin: 0 0 20px 0;
  color: #666;
}

.back-to-date-btn {
  background: #f8f9fa;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.slot-btn {
  padding: 12px 8px;
  border: 2px solid #e1e5e9;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}

.slot-btn:hover {
  border-color: #667eea;
  background: #f0f8ff;
}

.slot-btn.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.reservation-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  color: #666;
  font-weight: 500;
}

.summary-item .value {
  color: #333;
  font-weight: 600;
}

.info-box {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-box h4 {
  margin: 0 0 12px 0;
  color: #856404;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  color: #856404;
}

.info-box li {
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}

.back-btn-step {
  padding: 12px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
}

.confirm-btn {
  padding: 12px;
  background: linear-gradient(45deg, #00b894, #00cec9);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.success-container {
  text-align: center;
}

.success-animation {
  font-size: 4rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.success-actions {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.view-reservations-btn, .new-reservation-btn {
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.view-reservations-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.new-reservation-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

/* Responsive */
@media (max-width: 768px) {
  .reservations-content {
    padding: 16px 12px;
  }
  
  .step-container {
    padding: 20px;
  }
  
  .slots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
