<template>
  <div class="home">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button class="menu-btn">
          <i class="ri-menu-line"></i>
        </button>
        <h1 class="header-title">Accueil</h1>
      </div>
      <div class="header-actions">
        <button class="header-btn">
          <i class="ri-add-line"></i>
        </button>
        <button class="header-btn">
          <i class="ri-search-line"></i>
        </button>
        <button class="header-btn">
          <i class="ri-notification-3-line"></i>
        </button>
      </div>
    </header>

    <!-- En ce moment -->
    <section class="featured-section">
      <div class="featured-card">
        <img 
          src="https://knowledgeone.ca/wp-content/uploads/2022/05/learner-online.jpg" 
          alt="En ce moment" 
          class="featured-image" 
        />
        <div class="featured-overlay">
          <h2 class="featured-title">En ce moment</h2>
          <p class="featured-description">
            La pizza Raclette : Base crème, pomme de terre, fromage à raclette.
          </p>
        </div>
      </div>
    </section>

    <!-- Catégories -->
    <section class="categories-section">
      <h3 class="section-title">Catégories</h3>
      <div class="categories-grid">
        <div class="category-item" @click="scrollToSection('pizza')">
          <div class="category-icon">
            <i class="ri-pie-chart-2-line"></i>
          </div>
          <span class="category-label">Pizzas</span>
        </div>
        <div class="category-item" @click="scrollToSection('boisson')">
          <div class="category-icon">
            <i class="ri-cup-line"></i>
          </div>
          <span class="category-label">Boissons</span>
        </div>
        <div class="category-item" @click="scrollToSection('dessert')">
          <div class="category-icon">
            <i class="ri-cake-2-line"></i>
          </div>
          <span class="category-label">Desserts</span>
        </div>
      </div>
    </section>

    <!-- Sections de produits -->
    <section 
      v-for="type in ['pizza', 'boisson', 'dessert']" 
      :key="type" 
      :id="`section-${type}`"
      class="products-section"
    >
      <div class="section-header">
        <h3 class="section-title">Les {{ capitalize(type) }}s</h3>
        <button class="see-all-btn">
          Voir tout <i class="ri-arrow-right-s-line"></i>
        </button>
      </div>
      
      <div class="products-scroll">
        <div class="products-grid">
          <div 
            v-for="product in filteredProducts(type)" 
            :key="product.id" 
            class="product-card"
            @click="openProduct(product)"
          >
            <div class="product-image-container">
              <img 
                :src="product.image" 
                :alt="product.name" 
                class="product-image" 
              />
              <button class="favorite-btn" @click.stop="toggleFavorite(product.id)">
                <i class="ri-heart-line"></i>
              </button>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-description">{{ product.description || 'Base tomate' }}</p>
              <div class="product-footer">
                <span class="product-price">{{ product.price.toFixed(2) }}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Promotion App -->
    <section class="app-promo-section">
      <div class="app-promo-card">
        <div class="app-promo-icon">
          <div class="phone-icon">
            <i class="ri-smartphone-line"></i>
          </div>
        </div>
        <div class="app-promo-content">
          <h3 class="app-promo-title">Découvrez vos produits plus rapidement avec l'application web LA FAVOLA</h3>
          <button class="app-promo-btn">
            Ajouter le raccourci <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Footer Info -->
    <section class="footer-info">
      <button class="footer-expand-btn">
        En savoir plus sur LA FAVOLA <i class="ri-arrow-down-s-line"></i>
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const filteredProducts = (type) => {
  return products.value.filter(p => p.type === type).slice(0, 6)
}

const scrollToSection = (type) => {
  const element = document.getElementById(`section-${type}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const openProduct = (product) => {
  console.log('Ouvrir produit:', product)
  // Navigation vers la page produit
}

const toggleFavorite = (productId) => {
  console.log('Toggle favorite:', productId)
  // Logique des favoris
}

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/products')
    products.value = res.data
  } catch (err) {
    console.error('Erreur chargement produits', err)
  }
})
</script>

<style scoped>
.home {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* Header */
.header {
  background: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #374151;
  cursor: pointer;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #374151;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.header-btn:hover {
  background-color: #f3f4f6;
}

/* Featured Section */
.featured-section {
  padding: 1rem;
}

.featured-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.featured-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1.5rem 1rem 1rem;
}

.featured-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.featured-description {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

/* Categories */
.categories-section {
  padding: 0 1rem 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.categories-grid {
  display: flex;
  gap: 2rem;
  justify-content: flex-start;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-item:hover {
  transform: translateY(-2px);
}

.category-icon {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
}

.category-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

/* Products Sections */
.products-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 1rem;
}

.see-all-btn {
  background: none;
  border: none;
  color: #4f46e5;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.products-scroll {
  overflow-x: auto;
  padding: 0 1rem;
}

.products-grid {
  display: flex;
  gap: 1rem;
  padding-bottom: 0.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  min-width: 160px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.product-image-container {
  position: relative;
}

.product-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
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
}

.favorite-btn:hover {
  background: white;
  color: #ef4444;
}

.product-info {
  padding: 0.75rem;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.product-description {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
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

/* App Promo */
.app-promo-section {
  padding: 1rem;
  margin: 2rem 0;
}

.app-promo-card {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.app-promo-icon {
  flex-shrink: 0;
}

.phone-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.app-promo-content {
  flex: 1;
}

.app-promo-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.app-promo-btn {
  background: white;
  color: #1e40af;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: transform 0.2s;
}

.app-promo-btn:hover {
  transform: translateY(-1px);
}

/* Footer Info */
.footer-info {
  padding: 1rem;
}

.footer-expand-btn {
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  color: #374151;
  transition: background-color 0.2s;
}

.footer-expand-btn:hover {
  background-color: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
  .products-grid {
    gap: 0.75rem;
  }
  
  .product-card {
    min-width: 140px;
  }
  
  .app-promo-card {
    flex-direction: column;
    text-align: center;
  }
}

/* Scrollbar styling */
.products-scroll::-webkit-scrollbar {
  height: 4px;
}

.products-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.products-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.products-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
