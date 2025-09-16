<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewsStore } from '../stores/reviewsStore'

const props = defineProps({
  productId: [String, Number],
  productName: String,
  show: Boolean
})

const emit = defineEmits(['close'])

const reviewsStore = useReviewsStore()
const activeTab = ref('reviews')

const reviewsData = computed(() => reviewsStore.getProductReviews(props.productId))
const loading = computed(() => reviewsStore.loading)

const ratingStats = computed(() => {
  const stats = []
  for (let i = 5; i >= 1; i--) {
    const count = reviewsData.value.ratingDistribution[i] || 0
    const percentage = reviewsData.value.totalRatings > 0 
      ? (count / reviewsData.value.totalRatings) * 100 
      : 0
    stats.push({ stars: i, count, percentage })
  }
  return stats
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}

onMounted(() => {
  if (props.productId) {
    reviewsStore.fetchProductReviews(props.productId)
  }
})
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal-backdrop" @click="$emit('close')">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <button @click="$emit('close')" class="close-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <h2>Avis sur {{ productName }}</h2>
            <div></div>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button 
              :class="['tab', { active: activeTab === 'reviews' }]"
              @click="activeTab = 'reviews'"
            >
              Avis ({{ reviewsData.totalReviews }})
            </button>
            <button 
              :class="['tab', { active: activeTab === 'stats' }]"
              @click="activeTab = 'stats'"
            >
              Statistiques
            </button>
          </div>

          <div class="modal-content">
            <!-- Loading -->
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <span>Chargement des avis...</span>
            </div>

            <!-- Tab Avis -->
            <div v-else-if="activeTab === 'reviews'" class="reviews-tab">
              <!-- Résumé -->
              <div class="reviews-summary">
                <div class="rating-overview">
                  <span class="big-rating">{{ reviewsData.averageRating }}</span>
                  <div class="stars-display">
                    <i 
                      v-for="(filled, index) in renderStars(Math.round(reviewsData.averageRating))"
                      :key="index"
                      :class="filled ? 'ri-star-fill' : 'ri-star-line'"
                      class="star"
                    ></i>
                  </div>
                  <span class="rating-count">{{ reviewsData.totalRatings }} notes</span>
                </div>
              </div>

              <!-- Liste des avis -->
              <div class="reviews-list">
                <div 
                  v-for="review in reviewsData.reviews" 
                  :key="review.id"
                  class="review-item"
                >
                  <div class="review-header">
                    <div class="author-info">
                      <span class="author-name">{{ review.author }}</span>
                      <span v-if="review.verified" class="verified-badge">Vérifié</span>
                    </div>
                    <div class="review-meta">
                      <div class="review-stars">
                        <i 
                          v-for="(filled, index) in renderStars(review.rating)"
                          :key="index"
                          :class="filled ? 'ri-star-fill' : 'ri-star-line'"
                          class="star small"
                        ></i>
                      </div>
                      <span class="review-date">{{ formatDate(review.date) }}</span>
                    </div>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                </div>

                <div v-if="reviewsData.reviews.length === 0" class="no-reviews">
                  <p>Aucun avis pour le moment</p>
                  <p class="text-muted">Soyez le premier à laisser un avis !</p>
                </div>
              </div>
            </div>

            <!-- Tab Statistiques -->
            <div v-else-if="activeTab === 'stats'" class="stats-tab">
              <h3>Répartition des notes</h3>
              <div class="rating-breakdown">
                <div 
                  v-for="stat in ratingStats" 
                  :key="stat.stars"
                  class="rating-bar-row"
                >
                  <span class="stars-label">{{ stat.stars }} ★</span>
                  <div class="rating-bar">
                    <div 
                      class="rating-fill"
                      :style="{ width: stat.percentage + '%' }"
                    ></div>
                  </div>
                  <span class="count-label">{{ stat.count }}</span>
                </div>
              </div>

              <div class="stats-summary">
                <div class="stat-item">
                  <span class="stat-value">{{ reviewsData.averageRating }}</span>
                  <span class="stat-label">Note moyenne</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ reviewsData.totalRatings }}</span>
                  <span class="stat-label">Total notes</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ reviewsData.totalReviews }}</span>
                  <span class="stat-label">Avis détaillés</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.modal-container {
  background: white;
  width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab.active {
  color: #e67e22;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #e67e22;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.reviews-summary {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.rating-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.big-rating {
  font-size: 48px;
  font-weight: bold;
  color: #333;
}

.stars-display {
  display: flex;
  gap: 4px;
}

.star {
  color: #ffa500;
  font-size: 20px;
}

.star.small {
  font-size: 16px;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.verified-badge {
  background: #28a745;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.review-meta {
  text-align: right;
}

.review-stars {
  margin-bottom: 4px;
}

.review-date {
  font-size: 12px;
  color: #666;
}

.review-comment {
  color: #333;
  line-height: 1.5;
  margin: 0;
}

.rating-breakdown {
  margin: 20px 0;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stars-label {
  width: 40px;
  font-size: 14px;
}

.rating-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  background: #ffa500;
  transition: width 0.3s;
}

.count-label {
  width: 30px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #e67e22;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #e67e22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.text-muted {
  color: #999;
  font-size: 14px;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.modal-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .modal-backdrop {
    align-items: center;
    justify-content: center;
  }
  
  .modal-container {
    max-width: 600px;
    max-height: 80vh;
    border-radius: 16px;
  }
}
</style>
