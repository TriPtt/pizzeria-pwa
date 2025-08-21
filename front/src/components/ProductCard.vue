<script setup>
import { computed, ref } from 'vue'
import LazyImage from './LazyImage.vue'
import { useCartStore } from '../stores/cartStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useOverlayStore } from '../stores/overlayStore'

const overlayStore = useOverlayStore()

const openOverlay = () => {
  overlayStore.openProductOverlay(props.product)
}

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const cartStore = useCartStore()
const wishlistStore = useWishlistStore() 

// Computed
const isInWishlist = computed(() => {
  return wishlistStore.isInWishlist(props.product.id) || false
})

const cartQuantity = computed(() => {
  return cartStore.getItemQuantity(props.product.id)
})

const isInCart = computed(() => cartQuantity.value > 0)

const fallbackImage = computed(() => {
  const fallbacks = {
    pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    burger: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    boisson: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'
  }
  return fallbacks[props.product.category] || fallbacks.pizza
})

const isAnimating = ref(false)
const justAdded = ref(false)
const wishlistAnimating = ref(false)

const handleAddToCart = async () => {
  if (props.product.available && !isAnimating.value) {
    isAnimating.value = true
    
    try {
      await cartStore.addItem(props.product)
      
      // Animation de succès (sans bounce)
      justAdded.value = true
      setTimeout(() => {
        justAdded.value = false
        isAnimating.value = false
      }, 400)  // Délai inchangé, mais sans effet de bounce
      
    } catch (error) {
      console.error('Erreur ajout panier:', error)
      isAnimating.value = false
    }
  }
}

const handleWishlist = async () => {
  if (wishlistAnimating.value) return
  
  wishlistAnimating.value = true
  
  try {
    await wishlistStore.toggleWishlist(props.product.id)
    
    setTimeout(() => {
      wishlistAnimating.value = false
    }, 200)  // Délai inchangé, mais sans effet de bounce
    
  } catch (error) {
    console.error('Erreur wishlist:', error)
    wishlistAnimating.value = false
    
    if (error.message.includes('connecté')) {
      alert('Vous devez être connecté pour ajouter à votre liste de souhaits')
    } else {
      alert('Une erreur est survenue')
    }
  }
}

const handleImageLoad = () => {
  // console.log('Image chargée:', props.product.name)
}

const handleImageError = () => {
  console.error('Erreur chargement image:', props.product.name)
}
</script>

<template>
  <article 
    class="product-card stagger-item glow-hover"
    @click="openOverlay"
    :class="{ 
      'loading': cartStore.isLoading,
      'just-added': justAdded,
      'animating': isAnimating
    }"
  >
    <!-- ✅ Image container -->
    <div class="product-image-container">
      <transition name="fade" mode="out-in">
        <LazyImage
          :key="product.id"
          :src="product.image"
          :alt="product.name"
          :fallback="fallbackImage"
          aspect-ratio="4/3"
          :lazy="true"
          :skeleton="true"
          class="product-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </transition>
      
      <!-- Overlay avec boutons -->
      <transition name="slide-up">
        <div class="product-overlay" v-show="true">
          <!-- ✅ Bouton wishlist (sans animation de bounce) -->
          <button 
            :key="isInWishlist"
            class="wishlist-btn"
            @click.stop="handleWishlist"
            :class="{ 
              'active': isInWishlist,
              'loading': wishlistAnimating
            }"
            :disabled="wishlistAnimating"
            title="Ajouter aux favoris"
          >
            <transition name="fade" mode="out-in">
              <i v-if="wishlistAnimating" key="loading" class="ri-loader-4-line spinning"></i>
              <i v-else-if="isInWishlist" key="filled" class="ri-heart-fill"></i>
              <i v-else key="empty" class="ri-heart-line"></i>
            </transition>
          </button>
          
          <!-- Badge sans bounce -->
          <transition name="fade">
            <div v-if="product.badge" class="product-badge">
              {{ product.badge }}
            </div>
          </transition>
        </div>
      </transition>
    </div>
    
    <!-- ✅ Contenu du produit -->
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      
      <p class="product-description">{{ product.description }}</p>

      <div class="product-footer">
        <span class="product-price">
          {{ Number(product.price).toFixed(2) }}€
        </span>
        
        <!-- Bouton Add (sans animation de bounce) -->
        <button 
          class="add-btn"
          @click.stop="handleAddToCart"
          :disabled="!product.available || isAnimating"
          :class="{ 
            'loading-spinner': isAnimating
          }"
          title="Ajouter au panier"
        >
          <transition name="fade" mode="out-in">
            <i v-if="isAnimating" key="loading" class="ri-loader-4-line spinning"></i>
            <i v-else-if="justAdded" key="success" class="ri-check-line"></i>
            <span v-else-if="isInCart" key="count" class="cart-count">{{ cartQuantity }}</span>
            <i v-else key="add" class="ri-add-line"></i>
          </transition>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;  /* Transition simple, sans bounce */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);  /* Déplacement simple, sans scale ou bounce */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.product-card.loading {
  opacity: 0.8;
  pointer-events: none;
}

.product-image-container {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem;
  pointer-events: none;
}

/* ✅ Styles wishlist sans bounce */
.wishlist-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  color: #6b7280;
  transition: all 0.1s ease;  /* Transition simple, sans cubic-bezier pour bounce */
  backdrop-filter: blur(4px);
  pointer-events: all;
  position: relative;
}

.wishlist-btn:hover:not(:disabled) {
  background: white;
  /* Supprimé : transform: scale(1.1); pour enlever le bounce */
}

.wishlist-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.wishlist-btn.active {
  color: #ef4444;
  background: rgba(255, 255, 255, 0.95);
  /* Supprimé : animation: heartBeat 0.15s ease; pour enlever le bounce */
}

.wishlist-btn.loading {
  pointer-events: none;
}

/* ✅ Animation pour le loader, rendue plus rapide */
.spinning {
  animation: spin 0.5s linear infinite;  /* ✅ Changé : Anciennement 1s, maintenant 0.5s pour plus de rapidité */
}

.product-badge {
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.product-description {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.product-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.vegetarian-badge,
.unavailable-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-weight: 500;
}

.vegetarian-badge {
  background: #dcfce7;
  color: #166534;
}

.unavailable-badge {
  background: #fef2f2;
  color: #dc2626;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.product-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6366f1;
}

.add-btn {
  background: #4f46e5;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1rem;
  position: relative;
  min-width: 32px;
  transition: all 0.15s ease;  /* Transition simple, sans bounce */
}

.add-btn:hover:not(:disabled) {
  background: #3730a3;
  /* Supprimé : transform: scale(1.1); pour enlever le bounce */
}

.add-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* ✅ Animations restantes */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
