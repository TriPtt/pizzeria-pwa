<!-- src/components/ProductOverlay.vue -->
<template>
  <teleport to="body">
    <transition name="overlay">
      <div 
        v-if="show" 
        class="overlay-backdrop"
        @click="handleBackdropClick"
      >
        <div 
          class="overlay-container"
          :class="{ 'overlay-expanded': expanded }"
          @click.stop
        >
          <!-- Handle pour glisser -->
          <div 
            class="overlay-handle"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseStart"
          >
            <div class="handle-bar"></div>
          </div>

          <!-- Image principale -->
          <div class="overlay-image-container">
            <img 
              :src="product.image" 
              :alt="product.name"
              class="overlay-image"
            />
            <button 
              @click="$emit('close')" 
              class="overlay-close"
            >
              <i class="ri-close-line"></i>
            </button>
          </div>

          <!-- Contenu scrollable -->
          <div class="overlay-content">
            <div class="product-header">
              <div class="product-info">
                <h1 class="product-title">{{ product.name }}</h1>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">{{ product.price }}€</div>
              </div>
            </div>

            <!-- Ratings -->
            <div class="product-rating">
              <div class="rating-score">
                <span class="score">4.5</span>
                <div class="stars">
                  <i v-for="n in 5" :key="n" 
                     :class="n <= 4.5 ? 'ri-star-fill' : 'ri-star-line'"
                     class="star"
                  ></i>
                </div>
              </div>
              <div class="rating-details">
                <span>Note moyenne</span>
                <div class="rating-meta">43 notes et 23 avis</div>
              </div>
              <button class="rating-arrow">
                <i class="ri-arrow-right-s-line"></i>
              </button>
            </div>

            <!-- Suppléments -->
            <div class="supplements-section">
              <h3 class="section-title">
                Suppléments <span class="price-indicator">1€</span>
              </h3>
              
              <div class="ingredient-group">
                <div class="ingredient-chips">
                  <button 
                    v-for="ingredient in supplements" 
                    :key="ingredient.id"
                    @click="toggleSupplement(ingredient.id)"
                    :class="[
                      'ingredient-chip',
                      { 'selected': selectedSupplements.includes(ingredient.id) }
                    ]"
                  >
                    {{ ingredient.name }}
                  </button>
                </div>
              </div>

              <h3 class="section-title">Retirer des ingrédients</h3>
              
              <div class="ingredient-group">
                <div class="ingredient-chips">
                  <button 
                    v-for="ingredient in removableIngredients" 
                    :key="ingredient.id"
                    @click="toggleRemoval(ingredient.id)"
                    :class="[
                      'ingredient-chip',
                      'removable',
                      { 'removed': removedIngredients.includes(ingredient.id) }
                    ]"
                  >
                    {{ ingredient.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="overlay-actions">
              <button 
                @click="toggleFavorite" 
                :class="['favorite-btn', { 'active': isFavorite }]"
              >
                <i :class="isFavorite ? 'ri-heart-fill' : 'ri-heart-line'"></i>
              </button>
              
              <button 
                @click="addToCart"
                :disabled="!product.available"
                class="add-to-cart-btn"
              >
                <i class="ri-shopping-bag-line"></i>
                <span>Ajouter au panier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { watch } from 'vue'

const props = defineProps({
  product: Object,
  show: Boolean
})

const emit = defineEmits(['close'])

// Stores
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

// State
const expanded = ref(false)
const selectedSupplements = ref([])
const removedIngredients = ref([])
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

// Mock data
const supplements = ref([
  { id: 1, name: 'Champignons' },
  { id: 2, name: 'Oignons' },
  { id: 3, name: 'Lardons' },
  { id: 4, name: 'Jambon' },
  { id: 5, name: 'Poivrons' }
])

const removableIngredients = ref([
  { id: 1, name: 'Champignons' },
  { id: 2, name: 'Oignons' },
  { id: 3, name: 'Lardons' }
])

// Computed
const isFavorite = computed(() => 
  favoritesStore.isFavorite(props.product?.id)
)

// Touch/Mouse handlers
const handleTouchStart = (e) => {
  startY.value = e.touches[0].clientY
  isDragging.value = true
}

const handleMouseStart = (e) => {
  startY.value = e.clientY
  isDragging.value = true
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseEnd)
}

const handleTouchMove = (e) => {
  if (!isDragging.value) return
  currentY.value = e.touches[0].clientY
  const diff = currentY.value - startY.value
  
  // Expand vers le haut
  if (diff < -100 && !expanded.value) {
    expanded.value = true
  }
  // Fermer vers le bas
  else if (diff > 100 && expanded.value) {
    expanded.value = false
  }
  // Fermer complètement
  else if (diff > 200 && !expanded.value) {
    emit('close')
  }
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  currentY.value = e.clientY
  const diff = currentY.value - startY.value
  
  if (diff < -100 && !expanded.value) {
    expanded.value = true
  } else if (diff > 100 && expanded.value) {
    expanded.value = false
  } else if (diff > 200 && !expanded.value) {
    emit('close')
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
}

const handleMouseEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseEnd)
}

const handleBackdropClick = () => {
  emit('close')
}

// Actions
const toggleSupplement = (id) => {
  const index = selectedSupplements.value.indexOf(id)
  if (index > -1) {
    selectedSupplements.value.splice(index, 1)
  } else {
    selectedSupplements.value.push(id)
  }
}

const toggleRemoval = (id) => {
  const index = removedIngredients.value.indexOf(id)
  if (index > -1) {
    removedIngredients.value.splice(index, 1)
  } else {
    removedIngredients.value.push(id)
  }
}

const toggleFavorite = () => {
  if (isFavorite.value) {
    favoritesStore.removeFromFavorites(props.product.id)
  } else {
    favoritesStore.addToFavorites(props.product)
  }
}

const addToCart = () => {
  cartStore.addItem({
    ...props.product,
    supplements: selectedSupplements.value,
    removedIngredients: removedIngredients.value
  })
  emit('close')
}

// Lifecycle
onMounted(() => {
  document.body.style.overflow = ''
})

watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Cleanup au unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.overlay-container {
  width: 100%;
  background: white;
  border-radius: 20px 20px 0 0;
  max-height: 60vh;
  overflow: hidden;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.overlay-container.overlay-expanded {
  max-height: 85vh;
}

.overlay-handle {
  padding: 12px;
  display: flex;
  justify-content: center;
  cursor: grab;
  user-select: none;
}

.overlay-handle:active {
  cursor: grabbing;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
}

.overlay-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.overlay-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.overlay-close:hover {
  background: white;
  transform: scale(1.1);
}

.overlay-content {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(85vh - 200px - 60px);
}

.product-header {
  margin-bottom: 20px;
}

.product-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.product-description {
  color: #666;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #e67e22;
}

.product-rating {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.rating-score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.score {
  font-size: 18px;
  font-weight: bold;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ffa500;
  font-size: 16px;
}

.rating-details {
  flex: 1;
}

.rating-details span {
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.rating-meta {
  color: #666;
  font-size: 14px;
}

.rating-arrow {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.supplements-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-indicator {
  background: #f8f9fa;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: normal;
}

.ingredient-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.ingredient-chip {
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.ingredient-chip:hover {
  border-color: #e67e22;
}

.ingredient-chip.selected {
  background: #e67e22;
  color: white;
  border-color: #e67e22;
}

.ingredient-chip.removable.removed {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.overlay-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.favorite-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.add-to-cart-btn {
  flex: 1;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  background: #34495e;
  transform: translateY(-1px);
}

.add-to-cart-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

/* Animations */
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.overlay-enter-from {
  opacity: 0;
}

.overlay-leave-to {
  opacity: 0;
}

.overlay-enter-from .overlay-container,
.overlay-leave-to .overlay-container {
  transform: translateY(100%);
}
</style>
