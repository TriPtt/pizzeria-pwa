<template>
  <div class="cart-page">
    <!-- Header -->
    <div class="cart-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Mon panier</h1>
    </div>

    <!-- Contenu -->
    <div class="cart-content">
      <!-- Panier vide -->
      <div v-if="cartStore.isEmpty" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Ajoutez des produits pour commencer votre commande</p>
        <button @click="$router.push('/')" class="continue-btn">
          Continuer mes achats
        </button>
      </div>

      <!-- Items du panier -->
      <div v-else class="cart-items">
        <!-- Item -->
        <div 
          v-for="item in cartStore.items" 
          :key="item.itemKey" 
          class="cart-item"
        >
          <!-- Image -->
          <div class="item-image">
            <img :src="item.image" :alt="item.name">
          </div>

          <!-- Info -->
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-subtitle">{{ getItemDescription(item) }}</p>
            
            <!-- 🆕 Customizations -->
            <div v-if="item.customizations" class="customizations">
              <!-- Suppléments ajoutés -->
              <div v-if="item.customizations.supplements?.length" class="supplements">
                <span class="custom-label">Suppléments:</span>
                <span class="custom-items">
                  {{ item.customizations.supplements.map(s => s.name).join(', ') }}
                </span>
              </div>
              <!-- Ingrédients retirés -->
              <div v-if="item.customizations.removedIngredients?.length" class="removed">
                <span class="custom-label">Retiré:</span>
                <span class="custom-items removed-text">
                  {{ item.customizations.removedIngredients.map(r => r.name).join(', ') }}
                </span>
              </div>
            </div>
            
            <!-- Quantity selector -->
            <div class="quantity-selector">
              <span>Qty:</span>
              <select 
                :value="item.quantity" 
                @change="updateQuantity(item.itemKey, $event.target.value)"
                class="qty-select"
              >
                <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>

            <!-- 🆕 Prix avec détails -->
            <div class="item-pricing">
              <div v-if="item.finalPrice !== item.price" class="price-breakdown">
                <span class="base-price">{{ formatPrice(item.price) }}</span>
                <span class="supplements-price">+{{ formatPrice(item.finalPrice - item.price) }}</span>
              </div>
              <div class="final-price">{{ formatPrice(item.finalPrice) }}</div>
            </div>

            <!-- Actions -->
            <div class="item-actions">
              <button @click="addToWishlist(item)" class="wishlist-btn">
                Ajouter aux souhaits
              </button>
              <button @click="removeItem(item.itemKey)" class="remove-btn">
                Retirer
              </button>
            </div>
          </div>
        </div>

        <!-- Code promo -->
        <div class="promo-section">
          <div class="promo-input">
            <input 
              v-model="promoCode" 
              type="text" 
              placeholder="Ajouter un code promo"
              class="promo-field"
            >
            <button @click="applyPromo" class="promo-btn">
              VÉRIFIER
            </button>
          </div>
        </div>

        <!-- Récapitulatif -->
        <div class="order-summary">
          <h2>Détails de la commande</h2>
          
          <div class="summary-line">
            <span>Sous-total</span>
            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          
          <div class="summary-line total">
            <span><strong>Total</strong></span>
            <span><strong>{{ formatPrice(finalTotal) }}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer fixe -->
    <div v-if="!cartStore.isEmpty" class="cart-footer">
      <div class="footer-total">
        <span>Total du panier</span>
        <span class="total-price">{{ formatPrice(finalTotal) }}</span>
      </div>
      <button @click="proceedToCheckout" class="checkout-btn">
        Passer la commande
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'

const router = useRouter()
const cartStore = useCartStore()

// State
const promoCode = ref('')

// Computed
const finalTotal = computed(() => {
  return cartStore.totalPrice
})

// Methods
const formatPrice = (price) => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  return `${numPrice.toFixed(2).replace('.', ',')}€`
}

// 🆕 Description dynamique avec customizations
const getItemDescription = (item) => {
  if (item.customizations) {
    const supplementsCount = item.customizations.supplements?.length || 0
    const removedCount = item.customizations.removedIngredients?.length || 0
    
    if (supplementsCount > 0 || removedCount > 0) {
      const parts = []
      if (supplementsCount > 0) parts.push(`+${supplementsCount} supplément${supplementsCount > 1 ? 's' : ''}`)
      if (removedCount > 0) parts.push(`-${removedCount} ingrédient${removedCount > 1 ? 's' : ''}`)
      return parts.join(', ')
    }
  }
  return item.description || 'Base tomate'
}

const updateQuantity = (itemKey, quantity) => {
  cartStore.updateQuantity(itemKey, parseInt(quantity))
}

const removeItem = (itemKey) => {
  cartStore.removeItem(itemKey)
}

const addToWishlist = (item) => {
  // TODO: Implémenter wishlist
  console.log('Ajout aux souhaits:', item)
}

const applyPromo = () => {
  // TODO: Logique code promo
  console.log('Code promo:', promoCode.value)
}

const proceedToCheckout = () => {
  // TODO: Navigation vers checkout
  console.log('Commande:', cartStore.items)
  router.push('/checkout')
}

// Lifecycle
onMounted(() => {
  cartStore.loadFromStorage()
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140px;
  overscroll-behavior: none; 
}

.cart-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #333;
}

.cart-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}
/* Empty state */
.empty-cart {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-cart h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
}

.empty-cart p {
  color: #666;
  margin-bottom: 32px;
}

.continue-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Cart items */
.cart-items {
  padding-top: 20px;
}

.cart-item {
  display: flex;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.item-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.qty-select {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
}

.item-price {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.item-actions {
  display: flex;
  gap: 16px;
}

.wishlist-btn, .remove-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.remove-btn {
  color: #dc3545;
}

/* Promo section */
.promo-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.promo-input {
  display: flex;
  gap: 12px;
}

.promo-field {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
}

.promo-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
}

/* Order summary */
.order-summary {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.order-summary h2 {
  font-size: 18px;
  margin: 0 0 20px 0;
  color: #333;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #666;
}

.summary-line.total {
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 12px;
  color: #333;
  font-size: 18px;
}

/* Footer fixe */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.footer-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.total-price {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.checkout-btn {
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.checkout-btn:hover {
  background: #0056b3;
}

/* Responsive */
@media (max-width: 768px) {
  .cart-content {
    padding: 0 16px;
  }
  
  .cart-item {
    padding: 12px;
  }
  
  .item-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .promo-input {
    flex-direction: column;
  }
}

.customizations {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.4;
}

.supplements, .removed {
  margin-bottom: 4px;
}

.supplements:last-child, .removed:last-child {
  margin-bottom: 0;
}

.custom-label {
  font-weight: 600;
  color: #666;
  margin-right: 6px;
}

.custom-items {
  color: #333;
}

.removed-text {
  color: #dc3545;
  text-decoration: line-through;
}

.item-pricing {
  margin-bottom: 12px;
}

.price-breakdown {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.base-price {
  margin-right: 8px;
}

.supplements-price {
  color: #28a745;
  font-weight: 600;
}

.final-price {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style>
