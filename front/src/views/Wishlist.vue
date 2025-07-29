<template>
  <div class="wishlist-page">
    <!-- Header -->
    <div class="wishlist-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      
      <h1 class="page-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                fill="currentColor"/>
        </svg>
        Ma Liste de Souhaits
      </h1>
      
      <div class="header-actions">
        <span class="item-count">{{ wishlistStore.itemCount }} article{{ wishlistStore.itemCount > 1 ? 's' : '' }}</span>
        
        <button 
          v-if="!wishlistStore.isEmpty" 
          @click="clearAllWishlist"
          :disabled="wishlistStore.isLoading"
          class="clear-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" 
                  stroke="currentColor" stroke-width="2"/>
          </svg>
          Tout vider
        </button>
      </div>
    </div>

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
            
            <WishlistButton 
              :productId="item.id"
              size="small"
              class="remove-btn"
            />
            
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
              {{ !item.available ? 'Indisponible' : 'Ajouter au panier' }}
            </button>
          </div>

          <div class="added-date">
            Ajouté le {{ formatDate(item.created_at) }}
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="!wishlistStore.isEmpty" class="wishlist-stats">
        <div class="stats-item">
          <span class="stats-number">{{ wishlistStore.itemCount }}</span>
          <span class="stats-label">Articles sauvés</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ availableItemsCount }}</span>
          <span class="stats-label">Disponibles</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ totalValue.toFixed(2) }}€</span>
          <span class="stats-label">Valeur totale</span>
        </div>
      </div>
    </div>

    <!-- Floating Refresh Button -->
    <button 
      v-if="!wishlistStore.isEmpty"
      @click="refreshWishlist"
      :disabled="wishlistStore.isLoading"
      class="refresh-btn"
      title="Actualiser la liste"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 4V10H7" stroke="currentColor" stroke-width="2"/>
        <path d="M23 20V14H17" stroke="currentColor" stroke-width="2"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" 
              stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWishlistStore } from '../stores/wishlistStore'
import { useCartStore } from '../stores/cartStore'
import WishlistButton from '../components/WishlistButton.vue'

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const isAddingToCart = ref(false)

// Computed properties
const availableItemsCount = computed(() => {
  return wishlistStore.items.filter(item => item.available).length
})

const totalValue = computed(() => {
  return wishlistStore.items.reduce((sum, item) => sum + parseFloat(item.price), 0)
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  })
}

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
    
    // Message de succès (tu peux utiliser une notification)
    console.log(`${item.name} ajouté au panier !`)
    
    // Optionnel: retirer automatiquement de la wishlist
    // await wishlistStore.removeFromWishlist(item.id)
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
    alert('Erreur lors de l\'ajout au panier')
  } finally {
    isAddingToCart.value = false
  }
}

const clearAllWishlist = async () => {
  if (confirm('Êtes-vous sûr de vouloir vider votre liste de souhaits ?')) {
    try {
      await wishlistStore.clearWishlist()
    } catch (error) {
      console.error('Erreur lors du vidage:', error)
      alert('Une erreur est survenue')
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
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
}

.wishlist-header {
  background: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: #007bff;
  color: white;
}

.page-title {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.clear-btn {
  padding: 8px 12px;
  border: 1px solid #dc3545;
  border-radius: 8px;
  background: white;
  color: #dc3545;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wishlist-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #dc3545;
}

.retry-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin: 0 auto 24px;
  color: #ccc;
}

.empty-state h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 12px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin: 0 0 24px;
}

.browse-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-block;
}

.browse-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* Grid des produits */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.wishlist-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.wishlist-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
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
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
}

.wishlist-item:hover .remove-btn {
  opacity: 1;
  transform: scale(1);
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

.added-date {
  padding: 8px 16px;
  background: #f8f9fa;
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* Stats */
.wishlist-stats {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.stats-item {
  text-align: center;
}

.stats-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #007bff;
}

.stats-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

/* Floating refresh button */
.refresh-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0,123,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1000;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0,123,255,0.4);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .wishlist-header {
    padding: 12px 16px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .wishlist-content {
    padding: 16px;
  }
  
  .wishlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  .wishlist-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stats-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .refresh-btn {
    bottom: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
  }
}
</style>
