<template>
  <div 
    class="product-card"
    @click="handleClick"
    :class="{ 'loading': loading }"
  >
    <div class="product-image-container">
      <img 
        :src="productImage" 
        :alt="product.name"
        class="product-image"
        @error="handleImageError"
        :class="{ 'loading': imageLoading }"
      />
      
      <button 
        class="favorite-btn"
        @click.stop="handleFavorite"
        :class="{ 'active': isFavorite }"
      >
        <i :class="isFavorite ? 'ri-heart-fill' : 'ri-heart-line'"></i>
      </button>
      
      <div v-if="product.badge" class="product-badge">
        {{ product.badge }}
      </div>
    </div>
    
    <div class="product-info">
      <h4 class="product-name">{{ product.name }}</h4>
      <p class="product-description">{{ product.description }}</p>
      
      <div class="product-meta">
        <div v-if="product.vegetarian" class="vegetarian-badge">
          🌱 Végé
        </div>
        <div v-if="!product.available" class="unavailable-badge">
          Indisponible
        </div>
      </div>
      
      <div class="product-footer">
        <span class="product-price">{{ formatPrice(product.price) }}€</span>
        <button 
          class="add-btn" 
          @click.stop="handleAddToCart"
          :disabled="!product.available"
        >
          <i class="ri-add-line"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  favorites: {
    type: Array,
    default: () => []
  }
})

// Events
const emit = defineEmits(['click', 'addToCart', 'toggleFavorite'])

// État local
const imageLoading = ref(true)
const imageError = ref(false)

// Computed
const productImage = computed(() => {
  if (imageError.value) {
    // Images de fallback par type
    const fallbacks = {
      pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      boisson: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=300&h=200&fit=crop',
      dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop'
    }
    return fallbacks[props.product.type] || fallbacks.pizza
  }
  return props.product.image
})

const isFavorite = computed(() => {
  return props.favorites.some(fav => fav.id === props.product.id)
})

// Méthodes
const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2)
}

const handleClick = () => {
  emit('click', props.product)
}

const handleAddToCart = () => {
  if (props.product.available) {
    emit('addToCart', props.product)
  }
}

const handleFavorite = () => {
  emit('toggleFavorite', props.product)
}

const handleImageError = () => {
  imageError.value = true
  imageLoading.value = false
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  min-width: 160px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.product-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

.product-image-container {
  position: relative;
}

.product-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  transition: opacity 0.3s;
}

.product-image.loading {
  opacity: 0.7;
}

.favorite-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
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
  transition: all 0.2s;
  backdrop-filter: blur(4px);
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
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
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
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.product-description {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
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
}

.product-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
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
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: #3730a3;
  transform: scale(1.1);
}

.add-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .product-card {
    min-width: 140px;
  }
  
  .product-image {
    height: 100px;
  }
  
  .product-info {
    padding: 0.6rem;
  }
}
</style>
