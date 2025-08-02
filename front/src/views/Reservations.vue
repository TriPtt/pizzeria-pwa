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

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p>Chargement...</p>
    </div>

    <!-- Contenu principal -->
    <div v-else class="reservations-content">
      
      <!-- Étape 1: Sélection date et nombre de personnes -->
      <div v-if="step === 1" class="step-card">
        <div class="step-header">
          <h2>📅 Choisir la date et le nombre de personnes</h2>
          <p>Sélectionnez votre date et le nombre de convives</p>
        </div>

        <div class="form-section">
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
        </div>

        <button 
          @click="searchAvailableSlots" 
          :disabled="!selectedDate"
          class="primary-btn"
        >
          Voir les créneaux disponibles
        </button>
      </div>

      <!-- Étape 2: Sélection du créneau -->
      <div v-if="step === 2" class="step-card">
        <div class="step-header">
          <h2>🕐 Choisir un créneau</h2>
          <div class="selection-summary">
            <p>{{ formatDateLong(selectedDate) }}</p>
            <p>{{ selectedGuests }} personne{{ selectedGuests > 1 ? 's' : '' }}</p>
          </div>
          <button @click="step = 1" class="modify-btn">Modifier</button>
        </div>

        <div v-if="availableSlots.length === 0" class="empty-state">
          <div class="empty-icon">😔</div>
          <h3>Aucun créneau disponible</h3>
          <p>Essayez une autre date ou un nombre de personnes différent.</p>
          <button @click="step = 1" class="secondary-btn">
            Choisir une autre date
          </button>
        </div>

        <div v-else>
          <div class="slots-grid">
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
            class="primary-btn"
          >
            Continuer
          </button>
        </div>
      </div>

      <!-- Étape 3: Confirmation -->
      <div v-if="step === 3" class="step-card">
        <div class="step-header">
          <h2>✅ Confirmer la réservation</h2>
        </div>

        <div class="summary-section">
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

        <div class="info-section">
          <h4>📋 Informations importantes</h4>
          <ul>
            <li>La table sera libérée automatiquement après 1h30</li>
            <li>Modification/annulation possible jusqu'à 2h avant</li>
            <li>Vous recevrez une confirmation par SMS</li>
          </ul>
        </div>

        <div class="action-buttons">
          <button @click="step = 2" class="secondary-btn">
            Retour
          </button>
          <button 
            @click="confirmReservation"
            class="confirm-btn"
          >
            Confirmer la réservation
          </button>
        </div>
      </div>

      <!-- Étape 4: Succès -->
      <div v-if="step === 4" class="step-card success-card">
        <div class="success-animation">🎉</div>
        <h2>Réservation confirmée !</h2>
        <p class="success-text">
          Votre table est réservée pour le {{ formatDateLong(selectedDate) }} à {{ selectedSlot?.time }}
        </p>
        
        <div class="success-actions">
          <button @click="goToMyReservations" class="primary-btn">
            Voir mes réservations
          </button>
          <button @click="resetForm" class="secondary-btn">
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
import { useAuthStore } from '../stores/authStore'

// Stores
const router = useRouter()
const reservationStore = useReservationStore()
const authStore = useAuthStore()

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
  maxDate.setDate(maxDate.getDate() + 30)
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
  if (!selectedSlot.value) {
    alert('Veuillez sélectionner un créneau')
    return
  }

  if (!authStore.isAuthenticated) {
    alert('Vous devez être connecté pour faire une réservation')
    router.push('/auth/login')
    return
  }

  const guestCount = parseInt(selectedGuests.value)
  if (guestCount < 1 || guestCount > 8) {
    alert('Le nombre d\'invités doit être entre 1 et 8')
    return
  }

  loading.value = true
  
  try {
    console.log('🎯 Selected slot details:', selectedSlot.value)
    console.log('👥 Selected guests:', selectedGuests.value)
    
    // ✅ ASSURE-TOI QUE LES DONNÉES SONT CORRECTES
    const reservationData = {
      reservation_date: selectedSlot.value.datetime, // ou selectedSlot.value.date + 'T' + selectedSlot.value.time
      number_of_guests: parseInt(selectedGuests.value), // Force en nombre
    }
    
    console.log('📤 Sending reservation data:', reservationData)
    
    await reservationStore.createReservation(reservationData)
    
    step.value = 4
    
  } catch (error) {
    console.error('❌ Erreur lors de la confirmation:', error)
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
  background: #f8f9fa;
}

/* Header - même style que Profil */
.reservations-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reservations-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.back-btn, .my-reservations-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover, .my-reservations-btn:hover {
  background: #f0f0f0;
}

/* Loading state */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

/* Content */
.reservations-content {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
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

/* Step card - même style que user-card */
.step-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

/* Step header */
.step-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.step-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.step-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.selection-summary {
  margin: 12px 0;
}

.selection-summary p {
  margin: 4px 0;
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.modify-btn {
  background: #f8f9fa;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}

.modify-btn:hover {
  background: #007bff;
  color: white;
}

/* Form section */
.form-section {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.date-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  background: #f8f9fa;
}

.date-input:focus {
  outline: none;
  border-color: #007bff;
  background: white;
}

/* Guests selector */
.guests-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 12px 0;
}

.guests-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guests-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.guests-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.guests-count {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  min-width: 30px;
  text-align: center;
}

.help-text {
  display: block;
  text-align: center;
  color: #6c757d;
  font-size: 12px;
  margin-top: 8px;
  line-height: 1.4;
}

/* Buttons */
.primary-btn {
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: white;
  color: #007bff;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #007bff;
  color: white;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 14px;
}

/* Slots grid */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.slot-btn {
  padding: 12px 8px;
  border: 2px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.slot-btn:hover {
  border-color: #007bff;
  background: #e7f3ff;
  color: #007bff;
}

.slot-btn.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

/* Summary section */
.summary-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  color: #6c757d;
  font-weight: 500;
  font-size: 14px;
}

.summary-item .value {
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

/* Info section */
.info-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-section h4 {
  margin: 0 0 12px 0;
  color: #856404;
  font-size: 14px;
  font-weight: 600;
}

.info-section ul {
  margin: 0;
  padding-left: 16px;
  color: #856404;
}

.info-section li {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.4;
}

/* Action buttons */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}

.confirm-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background: #218838;
}

/* Success card */
.success-card {
  text-align: center;
}

.success-animation {
  font-size: 4rem;
  margin-bottom: 16px;
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

.success-card h2 {
  color: #28a745;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.success-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.success-actions {
  display: grid;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .reservations-content {
    padding: 16px 12px;
    max-width: none;
  }
  
  .step-card {
    padding: 20px 16px;
  }
  
  .slots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
