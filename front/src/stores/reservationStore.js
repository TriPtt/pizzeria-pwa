import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReservationStore = defineStore('reservation', () => {
  // État
  const reservations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const upcomingReservations = computed(() => {
    const now = new Date()
    return reservations.value
      .filter(r => new Date(r.reservation_date) > now && r.status !== 'cancelled')
      .sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date))
  })

  const pastReservations = computed(() => {
    const now = new Date()
    return reservations.value
      .filter(r => new Date(r.reservation_date) <= now)
      .sort((a, b) => new Date(b.reservation_date) - new Date(a.reservation_date))
  })

  const totalReservations = computed(() => reservations.value.length)

  // Horaires d'ouverture
  const openingHours = {
    1: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Lundi
    2: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Mardi
    3: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Mercredi
    4: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '22:30' }], // Jeudi
    5: [{ start: '11:30', end: '14:30' }, { start: '18:30', end: '23:00' }], // Vendredi
    6: [{ start: '11:30', end: '23:00' }], // Samedi
    0: [{ start: '11:30', end: '22:00' }]  // Dimanche
  }

  // Actions
  const setLoading = (status) => {
    loading.value = status
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Générer les créneaux disponibles pour une date
  const generateTimeSlots = (dateStr) => {
    const date = new Date(dateStr)
    const dayOfWeek = date.getDay() // 0 = dimanche, 1 = lundi, etc.
    const daySchedule = openingHours[dayOfWeek]
    
    const slots = []
    
    daySchedule.forEach(period => {
      const [startHour, startMin] = period.start.split(':').map(Number)
      const [endHour, endMin] = period.end.split(':').map(Number)
      
      let currentHour = startHour
      let currentMin = startMin
      
      while (true) {
        // Vérifier si on peut encore faire une résa de 1h30
        const endTime = new Date(date)
        endTime.setHours(currentHour, currentMin + 90, 0, 0)
        
        const periodEnd = new Date(date)
        periodEnd.setHours(endHour, endMin, 0, 0)
        
        if (endTime > periodEnd) break
        
        const slotTime = new Date(date)
        slotTime.setHours(currentHour, currentMin, 0, 0)
        
        slots.push({
          time: `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`,
          datetime: slotTime.toISOString(),
          available: true
        })
        
        // Créneaux toutes les 30 minutes
        currentMin += 30
        if (currentMin >= 60) {
          currentMin = 0
          currentHour++
        }
      }
    })
    
    return slots
  }

  // Récupérer les créneaux disponibles
  const getAvailableSlots = async (date, guests) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await fetch(
        `/api/reservations/slots/available?date=${date}&guests=${guests}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération des créneaux')
      }
      
      const data = await response.json()
      return data.slots || generateTimeSlots(date) // Fallback sur génération locale
      
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Créer une réservation
  const createReservation = async (reservationData) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(reservationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la réservation')
      }

      const data = await response.json()
      const newReservation = data.reservation
      
      // Ajouter la nouvelle réservation au state
      reservations.value.unshift(newReservation)
      
      return newReservation
      
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Récupérer toutes les réservations de l'utilisateur
  const fetchUserReservations = async () => {
    setLoading(true)
    clearError()
    
    try {
      const response = await fetch('/api/reservations/user/me', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération des réservations')
      }

      const data = await response.json()
      reservations.value = data
      
      return data
      
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Modifier une réservation
  const updateReservation = async (id, updateData) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la modification')
      }

      const data = await response.json()
      const updatedReservation = data.reservation
      
      // Mettre à jour dans le state
      const index = reservations.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reservations.value[index] = updatedReservation
      }
      
      return updatedReservation
      
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Annuler une réservation
  const cancelReservation = async (id) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'annulation')
      }

      // Mettre à jour le statut dans le state
      const reservation = reservations.value.find(r => r.id === id)
      if (reservation) {
        reservation.status = 'cancelled'
      }
      
      return true
      
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Utilitaire pour récupérer le token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  // Formater une date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Formater une heure
  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Vérifier si on peut modifier/annuler (2h avant)
  const canModifyReservation = (reservationDate) => {
    const now = new Date()
    const reservationTime = new Date(reservationDate)
    const timeDiff = (reservationTime - now) / (1000 * 60 * 60) // en heures
    return timeDiff >= 2
  }

  return {
    // State
    reservations,
    loading,
    error,
    
    // Getters
    upcomingReservations,
    pastReservations,
    totalReservations,
    
    // Actions
    getAvailableSlots,
    createReservation,
    fetchUserReservations,
    updateReservation,
    cancelReservation,
    
    // Utilitaires
    formatDate,
    formatTime,
    canModifyReservation,
    clearError
  }
})
