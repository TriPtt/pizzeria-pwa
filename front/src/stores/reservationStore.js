import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './authStore'

const api = import.meta.env.VITE_API_URL_BACK;

export const useReservationStore = defineStore('reservation', () => {
  // État
  const reservations = ref([])
  const userReservations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getAuthToken = () => {
    const authStore = useAuthStore()
    const token = authStore.token
    console.log('🔐 Getting token from authStore:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')
    return token
  }

  // Configuration axios de base
  const apiClient = axios.create({
    baseURL: `${api}/api`,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Intercepteur pour ajouter le token automatiquement
  apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()
    
    console.log('📡 Making request to:', config.url) // Debug
    console.log('🔑 Token available:', !!token) // Debug
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header set') // Debug
    } else {
      console.log('❌ No token found!') // Debug
    }
    
    return config
  })

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
    const dayOfWeek = date.getDay()
    const daySchedule = openingHours[dayOfWeek]
    
    const slots = []
    
    daySchedule.forEach(period => {
      const [startHour, startMin] = period.start.split(':').map(Number)
      const [endHour, endMin] = period.end.split(':').map(Number)
      
      let currentHour = startHour
      let currentMin = startMin
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        // ✅ FORMAT ISO POUR LA BDD
        const slotDate = new Date(date)
        slotDate.setHours(currentHour, currentMin, 0, 0)
        
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
        
        slots.push({
          time: timeStr,
          datetime: slotDate.toISOString(), // ✅ FORMAT ISO
          available: true
        })
        
        // Incrémenter de 30 minutes
        currentMin += 30
        if (currentMin >= 60) {
          currentMin = 0
          currentHour += 1
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
      console.log('🔍 Fetching slots for:', { date, guests }) // Debug
      
      const response = await apiClient.get('/reservations/slots/available', {
        params: {
          date,
          guests
        }
      })

      console.log('✅ Response received:', response.data) // Debug

      return response.data.slots || generateTimeSlots(date) // Fallback sur génération locale

    } catch (err) {
      console.error('❌ Error fetching slots:', err) // Debug
      
      // Si c'est une erreur réseau, utiliser les créneaux générés localement
      if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
        console.log('🔄 Using fallback slots generation') // Debug
        return generateTimeSlots(date)
      }
      
      setError(err.response?.data?.error || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Créer une réservation
  const createReservation = async (reservationData) => {
    setLoading(true)
    clearError()
    
    console.log('🎯 Creating reservation with data:', reservationData)
    console.log('📝 Data details:', {
      reservation_date: reservationData.reservation_date,
      guests: reservationData.guests,
      status: reservationData.status,
      type: typeof reservationData.reservation_date,
      isValidDate: !isNaN(new Date(reservationData.reservation_date))
    })
    
    try {
      const response = await apiClient.post('/reservations', reservationData)
      
      console.log('✅ Reservation created successfully:', response.data)
      
      const newReservation = response.data.reservation
      reservations.value.unshift(newReservation)
      
      return newReservation
      
    } catch (err) {
      console.error('❌ Create reservation error:', err)
      console.error('❌ Error response data:', err.response?.data) // ✅ IMPORTANT
      
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la création de la réservation'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  // Récupérer toutes les réservations de l'utilisateur
  const fetchUserReservations = async () => {
    setLoading(true)
    clearError()
    
    try {
      console.log('🔍 Fetching user reservations...')
      const response = await apiClient.get('/reservations/user/me')
      
      console.log('✅ Response data:', response.data)
      
      userReservations.value = response.data || []
      
      return response.data
      
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.response?.data?.error || err.message)
      userReservations.value = []
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
      const response = await apiClient.put(`/reservations/${id}`, updateData)
      
      const updatedReservation = response.data.reservation
      
      // Mettre à jour dans le state
      const index = reservations.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reservations.value[index] = updatedReservation
      }
      
      return updatedReservation
      
    } catch (err) {
      setError(err.response?.data?.error || err.message)
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
      await apiClient.delete(`/reservations/${id}`)

      // Mettre à jour le statut dans le state
      const reservation = reservations.value.find(r => r.id === id)
      if (reservation) {
        reservation.status = 'cancelled'
      }
      
      return true
      
    } catch (err) {
      setError(err.response?.data?.error || err.message)
      throw err
    } finally {
      setLoading(false)
    }
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
    userReservations,
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
    setError,
    
    // Utilitaires
    formatDate,
    formatTime,
    canModifyReservation,
    clearError
  }
})
