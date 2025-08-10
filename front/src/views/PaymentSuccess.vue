<template>
  <div class="payment-success">
    <div class="success-content">
      <div class="success-icon">✅</div>
      <h1>Paiement réussi !</h1>
      <p v-if="loading">Finalisation de votre commande...</p>
      
      <div v-if="order" class="order-details">
        <h3>Détails de votre commande</h3>
        <p><strong>Numéro:</strong> #{{ order.order_number || order.id }}</p>
        <p><strong>Total:</strong> {{ order.total_amount || order.total_price }}€</p>
        <p><strong>Retrait:</strong> {{ order.pickup_date }} à {{ order.pickup_time }}</p>
      </div>

      <div v-if="error" class="error">
        <p>{{ error }}</p>
        <button v-if="isAuthError" @click="redirectToLogin" class="retry-btn">
          Se reconnecter
        </button>
        <button v-else @click="retryOrder" class="retry-btn">
          Réessayer
        </button>
      </div>

      <button @click="router.push('/')" class="home-btn">
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const loading = ref(true)
const order = ref(null)
const error = ref(null)

// Calculer si l'erreur est liée à l'auth
const isAuthError = computed(() => {
  return error.value && (
    error.value.includes('401') || 
    error.value.includes('Token manquant') || 
    error.value.includes('Unauthorized')
  )
})

async function finalizeOrder() {
  try {
    loading.value = true
    error.value = null

    // ⭐ Vérification de l'authentification AVANT tout
    console.log('Auth state:', {
      isAuthenticated: authStore.isAuthenticated,
      hasToken: !!authStore.token,
      hasUser: !!authStore.user,
      tokenFromStorage: !!localStorage.getItem('token')
    })

    // ⭐ Si pas authentifié, essayer de restaurer depuis localStorage
    if (!authStore.isAuthenticated) {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        console.log('Tentative de restauration de session...')
        authStore.token = token
        authStore.user = JSON.parse(userData)
      } else {
        console.warn('Aucune session trouvée, commande en tant qu\'invité')
      }
    }

    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || 'null')
    console.log('pendingOrder (full):', pendingOrder)
    
    if (!pendingOrder) {
      throw new Error('Aucune commande en attente trouvée')
    }

    // 1) Customer -> customer_name / customer_phone
    const customer_name = (pendingOrder.customer?.name ?? pendingOrder.customer_name ?? '').trim()
    const customer_phone = (pendingOrder.customer?.phone ?? pendingOrder.customer_phone ?? '').trim()

    if (!customer_name || !customer_phone) {
      console.error('Nom/téléphone manquant:', { customer_name, customer_phone })
      throw new Error('Informations client manquantes (nom ou téléphone)')
    }

    // 2) Normalize products -> items
    const rawProducts = Array.isArray(pendingOrder.products) 
      ? pendingOrder.products 
      : (pendingOrder.items || [])
    
    if (!rawProducts.length) {
      throw new Error('Aucun produit trouvé dans la commande')
    }

    const normalizedItems = rawProducts.map((p, idx) => {
      const productId = p.id ?? p.product_id ?? p.productId ?? p.sku ?? null
      if (!productId) {
        throw new Error(`Produit sans ID détecté (index ${idx})`)
      }
      
      const idNum = Number(productId)
      if (!Number.isFinite(idNum)) {
        throw new Error(`ID produit non numérique: ${productId}`)
      }
      
      return {
        product_id: idNum,
        quantity: Math.max(1, parseInt(p.quantity ?? p.qty ?? 1, 10)),
        base_price: Number(p.base_price ?? p.price ?? 0),
        unit_price: Number(p.unit_price ?? p.finalPrice ?? p.price ?? 0),
        customizations: p.customizations ?? {},
        description: p.description ?? null
      }
    })

    // 3) Construire orderData
    const orderData = {
      items: normalizedItems,
      customer_name,
      customer_phone,
      pickup_date: pendingOrder.pickup_date,
      pickup_time: pendingOrder.pickup_time,
      notes: pendingOrder.notes ?? '',
      total_amount: Number(pendingOrder.total_price ?? pendingOrder.total_amount ?? 0)
    }

    console.log('orderData to send:', orderData)

    // ⭐ 4) Headers avec gestion intelligente du token
    const headers = {
      'Content-Type': 'application/json'
    }

    // Essayer plusieurs sources pour le token
    const token = authStore.token || localStorage.getItem('token')
    if (token) {
      headers.Authorization = `Bearer ${token}`
      console.log('Token ajouté aux headers:', !!token)
    } else {
      console.warn('Aucun token trouvé, requête sans authentification')
    }

    // 5) Envoi avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const res = await fetch(`${import.meta.env.VITE_API_URL_BACK}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Erreur response:', errorText)
      
      // ⭐ Gestion spécifique des erreurs 401
      if (res.status === 401) {
        console.error('Erreur d\'authentification détectée')
        authStore.logout() // Nettoyer le store
        throw new Error(`Authentification requise. Veuillez vous reconnecter. (${res.status})`)
      }
      
      throw new Error(`Erreur ${res.status}: ${errorText}`)
    }

    const created = await res.json()
    console.log('Commande créée:', created)

    // ⭐ 6) Mettre à jour l'état local
    order.value = created.order || created
    
    // Nettoyage
    localStorage.removeItem('pendingOrder')

    // Sauvegarder confirmation
    localStorage.setItem('orderConfirmation', JSON.stringify({
      order_number: created.order?.order_number ?? `CMD-${created.order?.id ?? Date.now()}`,
      total_price: created.order?.total_price ?? orderData.total_amount,
      pickup_date: created.order?.pickup_date ?? orderData.pickup_date,
      pickup_time: created.order?.pickup_time ?? orderData.pickup_time
    }))

    cartStore.clear()

  } catch (err) {
    console.error('Erreur finalizeOrder:', err)
    
    if (err.name === 'AbortError') {
      error.value = 'La requête a pris trop de temps. Veuillez réessayer.'
    } else {
      error.value = err.message || 'Une erreur est survenue lors de la finalisation de votre commande.'
    }
  } finally {
    loading.value = false
  }
}

// ⭐ Méthodes pour gérer les erreurs
const retryOrder = () => {
  finalizeOrder()
}

const redirectToLogin = () => {
  // Sauvegarder l'URL actuelle pour redirection après login
  localStorage.setItem('redirectAfterLogin', window.location.pathname)
  router.push('/login')
}

onMounted(() => {
  // ⭐ Petit délai pour laisser le temps aux stores de s'initialiser
  setTimeout(() => {
    finalizeOrder()
  }, 100)
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

.home-btn, .retry-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 8px;
  transition: background-color 0.2s;
}

.retry-btn {
  background: #007bff;
}

.home-btn:hover {
  background: #218838;
}

.retry-btn:hover {
  background: #0056b3;
}
</style>
