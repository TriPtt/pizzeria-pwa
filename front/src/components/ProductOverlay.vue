<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useIngredientsStore } from '../stores/ingredientsStore'

const props = defineProps({
  product: Object,
  show: Boolean
})

const emit = defineEmits(['close'])

// Stores
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const ingredientsStore = useIngredientsStore()

// State
const selectedSupplements = ref([])
const removedIngredients = ref([])
const ingredientsData = ref({
  baseIngredients: [],
  supplements: [],
  removableIngredients: []
})

// Computed
const isFavorite = computed(() => 
  favoritesStore.isFavorite(props.product?.id)
)

const supplements = computed(() => ingredientsData.value.supplements)
const removableIngredients = computed(() => ingredientsData.value.removableIngredients)

const finalPrice = computed(() => {
  if (!props.product) return '0.00'
  return ingredientsStore.calculateCustomPrice(
    props.product.price,
    selectedSupplements.value,
    supplements.value
  )
})

const isPizza = computed(() => props.product?.type === 'pizza')

// Methods
const loadIngredients = async () => {
  if (!props.product?.id || !isPizza.value) return
  
  try {
    const data = await ingredientsStore.fetchProductIngredients(props.product.id)
    ingredientsData.value = data
  } catch (error) {
    console.error('❌ Erreur chargement ingrédients:', error)
  }
}

const handleBackdropClick = () => {
  emit('close')
}

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
  const cartItem = {
    ...props.product,
    finalPrice: finalPrice.value,
    customizations: {
      supplements: selectedSupplements.value.map(id => 
        supplements.value.find(s => s.id === id)
      ).filter(Boolean),
      removedIngredients: removedIngredients.value.map(id =>
        removableIngredients.value.find(r => r.id === id)
      ).filter(Boolean)
    }
  }
  
  cartStore.addItem(cartItem)
  emit('close')
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
    loadIngredients()
  } else {
    document.body.style.overflow = ''
    // Reset selections
    selectedSupplements.value = []
    removedIngredients.value = []
  }
})
</script>

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
          @click.stop
        >
          <!-- Header -->
          <div class="overlay-header">
            <button @click="$emit('close')" class="back-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <h2>{{ product.name }}</h2>
            <div class="header-spacer"></div>
          </div>

          <!-- Content -->
          <div class="overlay-content">
            <!-- Image -->
            <div class="overlay-image-container">
              <img 
                :src="product.image" 
                :alt="product.name"
                class="overlay-image"
              />
            </div>

            <!-- Product Info -->
            <div class="product-info-section">
              <div class="product-header">
                <h1 class="product-title">{{ product.name }}</h1>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">
                  <span v-if="finalPrice != product.price" class="original-price">{{ product.price }}€</span>
                  <span class="current-price">{{ finalPrice }}€</span>
                </div>
              </div>

              <!-- Rating section (garde ton code existant) -->
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>

              <!-- Ingrédients pour pizzas uniquement -->
              <div v-if="isPizza" class="supplements-section">
                
                <!-- Suppléments -->
                <div v-if="supplements.length > 0">
                  <div class="section-header">
                    <h3 class="section-title">Suppléments</h3>
                    <span class="price-badge">1€</span>
                  </div>
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

                <!-- Ingrédients à retirer -->
                <div v-if="removableIngredients.length > 0">
                  <h3 class="section-title">Retirer des ingrédients</h3>
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

                <!-- Loading state -->
                <div v-if="ingredientsStore.loading" class="loading-ingredients">
                  <div class="spinner"></div>
                  <span>Chargement des ingrédients...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="overlay-actions">
            <button 
              @click="toggleFavorite" 
              :class="['favorite-btn', { 'active': isFavorite }]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                      :fill="isFavorite ? 'currentColor' : 'none'"
                      stroke="currentColor" 
                      stroke-width="2"/>
              </svg>
            </button>
            
            <button 
              @click="addToCart"
              :disabled="!product.available"
              class="add-to-cart-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="2"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
                <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Ajouter au panier - {{ finalPrice }}€</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>


<style scoped>
/* Overlay plein écran */
.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.price-badge {
  background: #e67e22;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(230, 126, 34, 0.2);
}

/* 🗑️ SUPPRESSION : Prix individuel sur les chips */
.ingredient-chip {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.ingredient-chip:hover {
  border-color: #e67e22;
  background: #fff5f0;
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

.overlay-container {
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header avec navigation */
.overlay-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 60px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #333;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

.overlay-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  text-align: center;
  max-width: calc(100% - 120px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-spacer {
  width: 40px; /* Pour équilibrer le bouton back */
}

/* Contenu scrollable */
.overlay-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px; /* Espace pour les actions fixes */
}

.overlay-image-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.overlay-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-section {
  padding: 24px 20px;
}

.product-header {
  margin-bottom: 24px;
}

.product-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #333;
  line-height: 1.2;
}

.product-description {
  color: #666;
  margin: 0 0 16px 0;
  font-size: 16px;
  line-height: 1.5;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  color: #e67e22;
}

/* Rating */
.product-rating {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 32px;
}

.rating-score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
}

.score {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ffa500;
  font-size: 18px;
}

.rating-details {
  flex: 1;
}

.rating-details span {
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
  color: #333;
}

.rating-meta {
  color: #666;
  font-size: 14px;
}

.rating-arrow {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.rating-arrow:hover {
  background: #f0f0f0;
}

/* Suppléments */
.supplements-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.ingredient-chips {
  display: flex;
  flex-direction: row;
  gap: 12px;
  overflow-x: auto;
  margin-bottom: 32px;
  padding-bottom: 6px; /* Pour éviter que le dernier chip soit coupé */
  scrollbar-width: none; /* Firefox */
  max-width: 100vw;
}

.ingredient-chips::-webkit-scrollbar {
  display: none;
}

.ingredient-chip {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.ingredient-chip:hover {
  border-color: #e67e22;
  background: #fff5f0;
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

/* Actions fixes en bas */
.overlay-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 16px;
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
}

.favorite-btn {
  width: 56px;
  height: 56px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.favorite-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
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
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  background: #34495e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.3);
}

.add-to-cart-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Animations */
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.overlay-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.overlay-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .overlay-header {
    padding: 12px 16px;
  }
  
  .product-info-section {
    padding: 20px 16px;
  }
  
  .overlay-actions {
    padding: 16px;
  }
  
  .product-title {
    font-size: 24px;
  }
}
/* Prix avec customisations */
.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 18px;
}

.current-price {
  font-size: 24px;
  font-weight: bold;
  color: #e67e22;
}

/* Loading des ingrédients */
.loading-ingredients {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #e67e22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>
