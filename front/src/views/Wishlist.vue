<template>
  <div class="wishlist-page">
    <!-- Header -->
    <div class="wishlist-header">
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                fill="currentColor"/>
        </svg>
        Ma Liste de Souhaits
      </h1>
      
      <div class="wishlist-stats">
        <span class="item-count">{{ wishlistStore.itemCount }} article{{ wishlistStore.itemCount > 1 ? 's' : '' }}</span>
        
        <button 
          v-if="!wishlistStore.isEmpty" 
          @click="clearAllWishlist"
          :disabled="wishlistStore.isLoading"
          class="clear-btn"
        >
          Tout vider
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="wishlistStore.isLoading && wishlistStore.isEmpty" class="loading-container">
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
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
              stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <h2>Votre liste de souhaits est vide</h2>
      <p>Parcourez nos produits et ajoutez vos articles préférés !</p>
      <router-link to="/products" class="browse-btn">
        Découvrir nos produits
      </router-link>
    </div>

    <!-- Wishlist Items -->
    <div v-else class="wishlist-items">
      <div 
        v-for="item in wishlistStore.items" 
        :key="item.id"
        class="wishlist-item"
      >
        <div class="item-image">
          <img 
            :src="item.image_url || '/images/placeholder.jpg'" 
            :alt="item.nom"
            @error="$event.target.src = '/images/placeholder.jpg'"
          />
          <div v-if="item.stock === 0" class="out-of-stock-badge">
            Rupture de stock
          </div>
        </div>

        <div class="item-info">
          <router-link :to="`/products/${item.id}`" class="item-title">
            {{ item.nom }}
          </router-link>
          
          <p v-if="item.description" class="item-description">
            {{ item.description }}
          </p>

          <div class="item-price">
            <span v-if="item.prix_promo" class="promo-price">
              {{ item.prix_promo }}€
            </span>
            <span 
              :class="['regular-price', { 'striked': item.prix_promo }]"
            >
              {{ item.prix }}€
            </span>
          </div>

          <div class="item-meta">
            <span class="added-date">
              Ajouté le {{ formatDate(item.created_at) }}
            </span>
            <span v-if="item.stock > 0" class="stock-info">
              {{ item.stock }} en stock
            </span>
          </div>
        </div>

        <div class="item-actions">
          <button
            @click="addToCart(item)"
            :disabled="item.stock === 0"
            class="add-to-cart-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13H17Z" 
                    stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ item.stock === 0 ? 'Indisponible' : 'Ajouter au panier' }}
          </button>

          <WishlistButton 
            :productId="item.id"
            size="small"
            class="remove-btn"
          />
        </div>
      </div>
    </div>

    <!-- Refresh Button -->
    <button 
      v-if="!wishlistStore.isEmpty"
      @click="refreshWishlist"
      :disabled="wishlistStore.isLoading"
      class="refresh-btn"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 4V10H7" stroke="currentColor" stroke-width="2"/>
        <path d="M23 20V14H17" stroke="currentColor" stroke-width="2"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" 
              stroke="currentColor" stroke-width="2"/>
      </svg>
      Actualiser
    </button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWishlistStore } from '../stores/wishlistStore'
import { useCartStore } from '../stores/cartStore'
import WishlistButton from '../components/WishlistButton.vue'

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  })
}

const addToCart = (item) => {
  if (item.stock > 0) {
    cartStore.addItem(item)
    // Optionnel: retirer de la wishlist après ajout au panier
    // wishlistStore.removeFromWishlist(item.id)
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

onMounted(() => {
  wishlistStore.initializeWishlist()
})
</script>

<style scoped>
.wishlist-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #dc3545;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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
}

.header-actions {
  display: flex;
  gap: 8px;
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

.wishlist-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 60px 20px;
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

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin: 0 auto 24px;
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
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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
}

.wishlist-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
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
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
}

.wishlist-item:hover .remove-btn {
  opacity: 1;
  transform: scale(1);
}

.remove-btn:hover {
  background: #dc3545;
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
}

.item-price {
  margin: 0 0 16px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #007bff;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-left: 8px;
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
  margin: 24px 20px 0;
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

/* Responsive */
@media (max-width: 768px) {
  .wishlist-header {
    padding: 12px 16px;
  }
  
  .wishlist-content {
    padding: 16px;
  }
  
  .wishlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  .wishlist-stats {
    margin: 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .stats-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
