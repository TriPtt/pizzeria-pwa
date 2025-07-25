<template>
  <button 
    @click="toggleWishlist"
    :class="['wishlist-btn', { 'is-favorite': isInWishlist(productId) }]"
    :disabled="isLoading"
    :title="isInWishlist(productId) ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path 
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
        :stroke="isInWishlist(productId) ? 'none' : 'currentColor'" 
        :fill="isInWishlist(productId) ? 'currentColor' : 'none'"
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useWishlistStore } from '../stores/wishlistStore'
import { useNotificationStore } from '../stores/notificationStore'

const props = defineProps({
  productId: {
    type: Number,
    required: true
  }
})

const wishlistStore = useWishlistStore()
const notificationStore = useNotificationStore()
const isLoading = ref(false)

const isInWishlist = wishlistStore.isInWishlist

const toggleWishlist = async () => {
  isLoading.value = true
  try {
    const wasInWishlist = isInWishlist(props.productId)
    await wishlistStore.toggleWishlist(props.productId)
    
    const message = wasInWishlist 
      ? 'Retiré de votre liste de souhaits' 
      : 'Ajouté à votre liste de souhaits'
    notificationStore.addNotification(message, 'success')
  } catch (error) {
    console.error('Erreur wishlist toggle:', error)
    notificationStore.addNotification('Une erreur est survenue', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.wishlist-btn {
  padding: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.wishlist-btn:hover {
  background: white;
  color: #dc3545;
  transform: scale(1.1);
}

.wishlist-btn.is-favorite {
  background: #dc3545;
  color: white;
}

.wishlist-btn.is-favorite:hover {
  background: #c82333;
}

.wishlist-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
