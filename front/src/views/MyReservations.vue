<template>
  <div class="my-reservations">
    <!-- Header avec le même style que Profile -->
    <div class="reservations-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Mes Réservations</h1>
      <button @click="$router.push('/reservations')" class="new-reservation-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="reservationStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement de vos réservations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="reservationStore.error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ reservationStore.error }}</p>
      <button @click="loadReservations" class="retry-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
        </svg>
        Réessayer
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!reservations.length" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 14h.01M16 14h.01M8 14h.01M12 18h.01M16 18h.01M8 18h.01" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Aucune réservation</h2>
      <p>Vous n'avez pas encore de réservations.</p>
      <button @click="$router.push('/reservations')" class="primary-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
        </svg>
        Faire une réservation
      </button>
    </div>

    <!-- Reservations List -->
    <div v-else class="reservations-container">
      <!-- Filtres -->
      <div class="filters">
        <div class="filter-group">
          <label>Statut :</label>
          <select v-model="statusFilter">
            <option value="">Tous</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Période :</label>
          <select v-model="periodFilter">
            <option value="all">Toutes</option>
            <option value="upcoming">À venir</option>
            <option value="past">Passées</option>
          </select>
        </div>
      </div>

      <!-- Liste des réservations -->
      <div class="reservations-grid">
        <div 
          v-for="reservation in filteredReservations" 
          :key="reservation.id"
          class="reservation-card"
          :class="getCardClass(reservation)"
        >
          <!-- Status Badge -->
          <div class="status-badge" :class="reservation.status">
            {{ getStatusText(reservation.status) }}
          </div>

          <!-- Date et heure -->
          <div class="reservation-datetime">
            <div class="date">
              <i class="fas fa-calendar"></i>
              {{ formatDate(reservation.reservation_date) }}
            </div>
            <div class="time">
              <i class="fas fa-clock"></i>
              {{ formatTime(reservation.reservation_date) }}
            </div>
          </div>

          <!-- Détails -->
          <div class="reservation-details">
            <div class="guests">
              <i class="fas fa-users"></i>
              {{ reservation.number_of_guests }} 
              {{ reservation.number_of_guests > 1 ? 'personnes' : 'personne' }}
            </div>
            
            <div class="reservation-id">
              <i class="fas fa-hashtag"></i>
              Réservation #{{ reservation.id }}
            </div>
            
            <div class="created-date">
              <i class="fas fa-plus-circle"></i>
              Créée le {{ formatDate(reservation.created_at) }}
            </div>
          </div>

          <!-- Actions -->
          <div class="reservation-actions">
            <template v-if="canModifyReservation(reservation)">
              <button 
                @click="editReservation(reservation)"
                class="btn btn-outline btn-sm"
              >
                <i class="fas fa-edit"></i>
                Modifier
              </button>
              
              <button 
                @click="confirmCancelReservation(reservation)"
                class="btn btn-danger btn-sm"
              >
                <i class="fas fa-times"></i>
                Annuler
              </button>
            </template>
            
            <template v-else-if="reservation.status === 'confirmed' && isPast(reservation)">
              <span class="past-reservation">Réservation terminée</span>
            </template>
            
            <template v-else-if="reservation.status === 'cancelled'">
              <span class="cancelled-reservation">Réservation annulée</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmation d'annulation -->
  <div v-if="showCancelModal" class="modal-overlay" @click="showCancelModal = false">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>Confirmer l'annulation</h3>
        <button @click="showCancelModal = false" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <p>Êtes-vous sûr de vouloir annuler cette réservation ?</p>
        <div class="reservation-summary" v-if="reservationToCancel">
          <strong>{{ formatDate(reservationToCancel.reservation_date) }}</strong>
          à {{ formatTime(reservationToCancel.reservation_date) }}
          <br>
          {{ reservationToCancel.number_of_guests }} 
          {{ reservationToCancel.number_of_guests > 1 ? 'personnes' : 'personne' }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="showCancelModal = false" class="btn btn-outline">
          Non, garder
        </button>
        <button 
          @click="cancelReservation" 
          class="btn btn-danger"
          :disabled="reservationStore.loading"
        >
          <i class="fas fa-times"></i>
          Oui, annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useReservationStore } from '../stores/reservationStore'

const router = useRouter()
const authStore = useAuthStore()
const reservationStore = useReservationStore()

// États réactifs
const statusFilter = ref('')
const periodFilter = ref('all')
const showCancelModal = ref(false)
const reservationToCancel = ref(null)

// Computed
const reservations = computed(() => reservationStore.userReservations)

const filteredReservations = computed(() => {
  let filtered = [...reservations.value]
  
  // Filtre par statut
  if (statusFilter.value) {
    filtered = filtered.filter(r => r.status === statusFilter.value)
  }
  
  // Filtre par période
  if (periodFilter.value === 'upcoming') {
    filtered = filtered.filter(r => new Date(r.reservation_date) > new Date())
  } else if (periodFilter.value === 'past') {
    filtered = filtered.filter(r => new Date(r.reservation_date) < new Date())
  }
  
  // Trier par date (plus récentes en premier)
  return filtered.sort((a, b) => new Date(b.reservation_date) - new Date(a.reservation_date))
})

// Méthodes
const loadReservations = async () => {
  try {
    await reservationStore.fetchUserReservations()
  } catch (error) {
    console.error('Erreur lors du chargement des réservations:', error)
  }
}

const getCardClass = (reservation) => {
  const classes = []
  
  if (reservation.status === 'cancelled') {
    classes.push('cancelled')
  } else if (isPast(reservation)) {
    classes.push('past')
  } else {
    classes.push('upcoming')
  }
  
  return classes
}

const getStatusText = (status) => {
  const statusMap = {
    'confirmed': 'Confirmée',
    'cancelled': 'Annulée',
    'pending': 'En attente'
  }
  return statusMap[status] || status
}

const isPast = (reservation) => {
  return new Date(reservation.reservation_date) < new Date()
}

const canModifyReservation = (reservation) => {
  return reservationStore.canModifyReservation(reservation)
}

const formatDate = (dateString) => {
  return reservationStore.formatDate(dateString)
}

const formatTime = (dateString) => {
  return reservationStore.formatTime(dateString)
}

const editReservation = (reservation) => {
  // TODO: Implémenter la modification
  router.push(`/reservations/edit/${reservation.id}`)
}

const confirmCancelReservation = (reservation) => {
  reservationToCancel.value = reservation
  showCancelModal.value = true
}

const cancelReservation = async () => {
  try {
    await reservationStore.cancelReservation(reservationToCancel.value.id)
    showCancelModal.value = false
    reservationToCancel.value = null
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error)
  }
}

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  
  loadReservations()
})
</script>

<style scoped>
.my-reservations {
  min-height: 100vh;
  background: #f8f9fa;
}

.reservations-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #f0f0f0;
}

.reservations-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.new-reservation-btn {
  background: #007bff;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.new-reservation-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
}

/* Loading & Error States */
.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #666;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 4rem 2rem;
  color: #e74c3c;
}

.error-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

/* Empty State */
.retry-btn {
  background: #007bff;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0056b3;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #666;
  gap: 16px;
  padding: 20px;
  text-align: center;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 8px;
}

.empty-state h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin: 0;
}


.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #666;
  gap: 16px;
  padding: 20px;
}

.error-icon {
  font-size: 48px;
}


/* Filtres */
.filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Grid des réservations */
.reservations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Carte de réservation */
.reservation-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.reservation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.reservation-card.upcoming {
  border-color: #27ae60;
}

.reservation-card.past {
  border-color: #95a5a6;
  opacity: 0.8;
}

.reservation-card.cancelled {
  border-color: #e74c3c;
  background: #fdf2f2;
}

/* Badge de statut */
.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

/* Date et heure */
.reservation-datetime {
  margin-bottom: 1rem;
  padding-right: 6rem;
}

.reservation-datetime .date {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.reservation-datetime .time {
  font-size: 1rem;
  color: #3498db;
  font-weight: 500;
}

.reservation-datetime i {
  margin-right: 0.5rem;
  width: 20px;
}

/* Détails */
.reservation-details {
  margin-bottom: 1.5rem;
}

.reservation-details > div {
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.reservation-details i {
  margin-right: 0.5rem;
  width: 16px;
  color: #95a5a6;
}

.guests {
  font-weight: 600;
  color: #495057 !important;
}

/* Actions */
.reservation-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.past-reservation,
.cancelled-reservation {
  font-size: 0.9rem;
  color: #6c757d;
  font-style: italic;
}

/* Boutons */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.primary-btn {
  background: #007bff;
  color: white;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
  color: #495057;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.reservation-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  border-left: 4px solid #3498db;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .my-reservations {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .reservations-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal {
    margin: 1rem;
    min-width: auto;
  }
}
</style>
