import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const orderCount = computed(() => orders.value.length)
  
  const recentOrders = computed(() => {
    return orders.value
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  })

  // Actions
  const fetchOrders = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }

      const response = await axios.get('http://localhost:5000/api/orders/user/my-orders', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📦 Commandes récupérées:', response.data)
      orders.value = response.data.orders || []
      
    } catch (err) {
      console.error('❌ Erreur récupération commandes:', err)
      
      if (err.response?.status === 401) {
        error.value = 'Session expirée, veuillez vous reconnecter'
      } else if (err.response?.status === 404) {
        error.value = 'Service temporairement indisponible'
      } else {
        error.value = err.response?.data?.error || 'Impossible de charger les commandes'
      }
      
      orders.value = []
    } finally {
      isLoading.value = false
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'ready': 'Prête',
      'delivered': 'Récupérée',
      'cancelled': 'Annulée'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#fbbf24',
      'confirmed': '#3b82f6',
      'preparing': '#f59e0b',
      'ready': '#10b981',
      'delivered': '#6b7280',
      'cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const createOrder = async (orderData) => {
    isLoading.value = true
    error.value = null
    
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('Non connecté')
      }

      console.log('📦 Envoi commande:', orderData)
      
      // ✅ Format pour ton API
      const payload = {
        items: orderData.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        pickup_date: orderData.pickup_date,
        pickup_time: orderData.pickup_time,
        notes: orderData.customer.notes
      }
      
      console.log('🚀 Payload API:', payload)
      
      const response = await axios.post('http://localhost:5000/api/orders', payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ Commande créée:', response.data)
      
      // Recharge les commandes après création
      await fetchOrders()
      
      return response.data.order
    } catch (err) {
      console.error('❌ Erreur création commande:', err)
      
      if (err.response?.status === 401) {
        error.value = 'Session expirée, veuillez vous reconnecter'
      } else if (err.response?.status === 400) {
        error.value = err.response.data.error || 'Données de commande invalides'
      } else {
        error.value = err.response?.data?.error || 'Impossible de créer la commande'
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    orders,
    isLoading,
    error,
    
    // Getters
    orderCount,
    recentOrders,
    
    // Actions
    fetchOrders,
    getStatusLabel,
    getStatusColor,
    createOrder
  }
})
