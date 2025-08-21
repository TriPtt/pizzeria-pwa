<template>
  <div class="wishlist-page">
    <!-- Header identique aux autres pages (panier, commande) -->
    <div class="wishlist-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Ma Liste de Souhaits</h1>
    </div>

    <!-- Contenu scrollable -->
    <div class="wishlist-content">
      <!-- Loading State -->
      <div v-if="wishlistStore.isLoading && wishlistStore.isEmpty" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement de votre liste...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="wishlistStore.error && wishlistStore.isEmpty" class="error-container">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Erreur de chargement</h3>
        <p>{{ wishlistStore.error }}</p>
        <button @click="refreshWishlist" class="retry-btn">
          Réessayer
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="wishlistStore.isEmpty" class="empty-state">
        <div class="empty-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                  stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
        <h2>Votre liste de souhaits est vide</h2>
        <p>Parcourez nos produits et ajoutez vos articles préférés !</p>
        <router-link to="/products" class="browse-btn">
          Découvrir nos produits
        </router-link>
      </div>

      <!-- Wishlist Items -->
      <div v-else class="wishlist-grid">
        <div 
          v-for="item in wishlistStore.items" 
          :key="item.id"
          class="wishlist-item"
        >
          <div class="item-image">
            <img 
              :src="item.image || '/images/placeholder.jpg'" 
              :alt="item.name"
              @error="$event.target.src = '/images/placeholder.jpg'"
            />
            
            <!-- Bouton de suppression individuel -->
            <button 
              @click="removeFromWishlist(item.id)"
              :disabled="isRemoving"
              class="remove-btn"
              title="Retirer de la liste de souhaits"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            
            <div v-if="!item.available" class="status-badge out-of-stock">
              Rupture de stock
            </div>
            <div v-else class="status-badge in-stock">
              En stock
            </div>
          </div>

          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-category">{{ item.type }}</p>
            
            <div class="item-price">
              <span class="current-price">{{ item.price }}€</span>
            </div>

            <button
              @click="addToCart(item)"
              :disabled="!item.available || isAddingToCart"
              class="add-to-cart-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13H17Z" 
                      stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ !item.available ? 'Indisponible' : isAddingToCart ? 'Ajout...' : 'Ajouter au panier' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions flottantes en bas -->
    <div v-if="!wishlistStore.isEmpty" class="floating-actions">
      <button 
        @click="clearAllWishlist"
        :disabled="wishlistStore.isLoading"
        class="clear-all-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" 
                stroke="currentColor" stroke-width="2"/>
        </svg>
        Vider la liste ({{ wishlistStore.itemCount }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '../stores/wishlistStore'
import { useCartStore } from '../stores/cartStore'
import { useNotificationStore } from '../stores/notificationStore'

const router = useRouter()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()

// States
const isAddingToCart = ref(false)
const isRemoving = ref(false)

// Méthodes
const addToCart = async (item) => {
  if (!item.available || isAddingToCart.value) return
  
  try {
    isAddingToCart.value = true
    
    // Adapter l'objet selon le format attendu par le store panier
    const cartItem = {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image: item.image,
      type: item.type,
      description: item.description,
      vegetarian: item.vegetarian
    }
    
    await cartStore.addItem(cartItem)
    
    // ✅ Notification d'ajout au panier
    notificationStore.addNotification(`${item.name} ajouté au panier !`, 'success')
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
    notificationStore.addNotification('Erreur lors de l\'ajout au panier', 'error')
  } finally {
    isAddingToCart.value = false
  }
}

const removeFromWishlist = async (productId) => {
  try {
    isRemoving.value = true
    await wishlistStore.removeFromWishlist(productId)
    notificationStore.addNotification('Article retiré de la liste de souhaits', 'success')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    notificationStore.addNotification('Erreur lors de la suppression', 'error')
  } finally {
    isRemoving.value = false
  }
}

const clearAllWishlist = async () => {
  if (confirm('Êtes-vous sûr de vouloir vider votre liste de souhaits ?')) {
    try {
      await wishlistStore.clearWishlist()
      notificationStore.addNotification('Liste de souhaits vidée', 'success')
    } catch (error) {
      console.error('Erreur lors du vidage:', error)
      notificationStore.addNotification('Une erreur est survenue', 'error')
    }
  }
}

const refreshWishlist = async () => {
  try {
    await wishlistStore.fetchWishlist()
  } catch (error) {
    console.error('Erreur lors de l\'actualisation:', error)
  }
}

// Lifecycle
onMounted(() => {
  wishlistStore.initializeWishlist()
})
</script>

<style scoped>
.wishlist-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140px;
  overscroll-behavior: none;
}

.wishlist-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.wishlist-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Container scrollable */
.wishlist-content {
  padding: 20px 16px;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #dc3545;
}

.error-container svg {
  margin-bottom: 16px;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 32px;
}

.browse-btn {
  background: #007bff;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
}

/* Wishlist grid */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.wishlist-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.wishlist-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.item-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.wishlist-item:hover .item-image img {
  transform: scale(1.05);
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 8px;
  border: none;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wishlist-item:hover .remove-btn {
  opacity: 1;
  transform: scale(1);
}

.remove-btn:hover {
  background: #dc3545;
  transform: scale(1.1);
}

.remove-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: scale(0.8);
}

.status-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.in-stock {
  background: rgba(40, 167, 69, 0.9);
  color: white;
}

.status-badge.out-of-stock {
  background: rgba(220, 53, 69, 0.9);
  color: white;
}

.item-info {
  padding: 16px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
  line-height: 1.3;
}

.item-category {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px;
  text-transform: capitalize;
}

.item-price {
  margin: 0 0 16px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #007bff;
}

.add-to-cart-btn {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #007bff;
  border-radius: 8px;
  background: white;
  color: #007bff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.add-to-cart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ddd;
  color: #999;
}

/* Actions flottantes */
.floating-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.clear-all-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.2s;
}

.clear-all-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

.clear-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .wishlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .wishlist-content {
    padding: 16px 12px;
  }
  
  .floating-actions {
    left: 16px;
    right: 16px;
    transform: none;
  }
  
  .clear-all-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .wishlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>