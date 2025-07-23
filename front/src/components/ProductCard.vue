<script setup>
import { computed, ref } from 'vue'
import LazyImage from './LazyImage.vue'
import { useCartStore } from '../stores/cartStore'
import { useFavoritesStore } from '../stores/favoritesStore'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

// 🚀 PINIA STORES
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

// Computed
const isFavorite = computed(() => {
  return favoritesStore.isFavorite(props.product.id)
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
// Méthodes
const handleClick = () => {
  emit('click', props.product)
}

const handleAddToCart = async () => {
  if (props.product.available && !isAnimating.value) {
    isAnimating.value = true
    
    try {
      await cartStore.addItem(props.product)
      
      // Animation de succès
      justAdded.value = true
      setTimeout(() => {
        justAdded.value = false
        isAnimating.value = false
      }, 800)
      
    } catch (error) {
      console.error('Erreur ajout panier:', error)
      isAnimating.value = false
    }
  }
}

const handleFavorite = () => {
  favoritesStore.toggleFavorite(props.product)
}

const handleImageLoad = () => {
  console.log('Image chargée:', props.product.name)
}

const handleImageError = () => {
  console.error('Erreur chargement image:', props.product.name)
}
</script>

<template>
  <article 
    class="product-card stagger-item glow-hover"
    @click="handleClick"
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
          <!-- Bouton favori avec animation -->
          <transition name="scale-bounce" mode="out-in">
            <button 
              :key="isFavorite"
              class="favorite-btn"
              @click.stop="handleFavorite"
              :class="{ 'active': isFavorite }"
            >
              <i :class="isFavorite ? 'ri-heart-fill' : 'ri-heart-line'"></i>
            </button>
          </transition>
          
          <!-- Badge avec floating -->
          <transition name="bounce">
            <div v-if="product.badge" class="product-badge floating">
              {{ product.badge }}
            </div>
          </transition>
        </div>
      </transition>
    </div>
    
    <!-- ✅ Contenu du produit -->
     <div class="product-info">
      <transition name="slide-up">
        <h3 class="product-name">{{ product.name }}</h3>
      </transition>
      
      <transition name="slide-up" :style="{ 'transition-delay': '0.1s' }">
        <p class="product-description">{{ product.description }}</p>
      </transition>

      <div class="product-footer">
        <transition name="slide-up" :style="{ 'transition-delay': '0.2s' }">
          <span class="product-price">
            {{ Number(product.price).toFixed(2) }}€
          </span>
        </transition>
        
        <!-- Bouton Add avec animation -->
        <transition name="scale-bounce" mode="out-in">
          <button 
            class="add-btn"
            @click.stop="handleAddToCart"
            :disabled="!product.available || isAnimating"
            :class="{ 
              'bounce': justAdded,
              'loading-spinner': isAnimating
            }"
          >
            <transition name="fade" mode="out-in">
              <i v-if="isAnimating" key="loading" class="ri-loader-4-line"></i>
              <i v-else-if="justAdded" key="success" class="ri-check-line"></i>
              <span v-else-if="isInCart" key="count" class="cart-count">{{ cartQuantity }}</span>
              <i v-else key="add" class="ri-add-line"></i>
            </transition>
          </button>
        </transition>
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
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
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

.favorite-btn {
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
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  pointer-events: all;
}

.favorite-btn:hover {
  background: white;
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #ef4444;
  background: rgba(255, 255, 255, 0.95);
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
  transition: all 0.2s ease;
  position: relative;
  min-width: 32px;
}

.add-btn:hover:not(:disabled) {
  background: #3730a3;
  transform: scale(1.1);
}

.add-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.cart-quantity {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-card.just-added {
  animation: bounce 0.6s ease;
  border-color: #10b981 !important;
}

.product-card.animating {
  pointer-events: none;
}

.favorite-btn {
  transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.favorite-btn.active {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.add-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.add-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.add-btn:disabled {
  opacity: 0.7;
}

.cart-count {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 16px;
}

.product-badge {
  animation-delay: 0.5s;
}

/* Responsive animations */
@media (prefers-reduced-motion: reduce) {
  .product-card,
  .favorite-btn,
  .add-btn {
    transition: none !important;
    animation: none !important;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
