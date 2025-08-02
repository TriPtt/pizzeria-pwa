<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Filtres</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="filter-content">
        <!-- Filtre Prix -->
        <div class="filter-section">
          <h4 class="filter-title">
            <i class="ri-money-euro-circle-line"></i>
            Prix
          </h4>
          <div class="price-range">
            <div class="price-input">
              <label>Prix minimum</label>
              <div class="input-group">
                <input 
                  type="number" 
                  v-model.number="localFilters.minPrice"
                  placeholder="0"
                  min="0"
                  step="0.50"
                />
                <span class="currency">€</span>
              </div>
            </div>
            <div class="price-input">
              <label>Prix maximum</label>
              <div class="input-group">
                <input 
                  type="number" 
                  v-model.number="localFilters.maxPrice"
                  placeholder="50"
                  min="0"
                  step="0.50"
                />
                <span class="currency">€</span>
              </div>
            </div>
          </div>
          
          <!-- Prix rapides -->
          <div class="quick-prices">
            <button 
              v-for="range in priceRanges"
              :key="range.label"
              class="price-range-btn"
              :class="{ active: isRangeSelected(range) }"
              @click="selectPriceRange(range)"
            >
              {{ range.label }}
            </button>
          </div>
        </div>

        <!-- Filtre Disponibilité -->
        <div class="filter-section">
          <h4 class="filter-title">
            <i class="ri-check-line"></i>
            Disponibilité
          </h4>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="localFilters.available"
              />
              <span class="checkmark"></span>
              Afficher uniquement les produits disponibles
            </label>
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="localFilters.showOutOfStock"
              />
              <span class="checkmark"></span>
              Inclure les produits en rupture
            </label>
          </div>
        </div>

        <!-- Filtre Notes (si tu as des reviews) -->
        <div class="filter-section">
          <h4 class="filter-title">
            <i class="ri-star-line"></i>
            Note minimum
          </h4>
          <div class="rating-filter">
            <div 
              v-for="rating in [1, 2, 3, 4, 5]"
              :key="rating"
              class="rating-option"
              :class="{ active: localFilters.minRating === rating }"
              @click="selectRating(rating)"
            >
              <div class="stars">
                <i 
                  v-for="star in 5"
                  :key="star"
                  :class="[
                    'ri-star-line',
                    star <= rating ? 'filled' : ''
                  ]"
                ></i>
              </div>
              <span>{{ rating }}+ étoiles</span>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="filter-stats">
          <div class="stat-item">
            <i class="ri-checkbox-circle-line"></i>
            <span>{{ filteredCount }} produits correspondent</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="reset-btn" @click="resetFilters">
          <i class="ri-refresh-line"></i>
          Reset
        </button>
        <div class="main-actions">
          <button class="cancel-btn" @click="$emit('close')">
            Annuler
          </button>
          <button class="apply-btn" @click="applyFilters">
            Appliquer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  currentFilters: {
    type: Object,
    default: () => ({
      minPrice: null,
      maxPrice: null,
      available: true,
      showOutOfStock: false,
      minRating: null
    })
  }
})

const emit = defineEmits(['close', 'apply'])

const localFilters = ref({ ...props.currentFilters })

// Prix prédéfinis
const priceRanges = [
  { label: '0€ - 10€', min: 0, max: 10 },
  { label: '10€ - 20€', min: 10, max: 20 },
  { label: '20€ - 30€', min: 20, max: 30 },
  { label: '30€+', min: 30, max: null }
]

// Nombre de produits filtrés (simulation)
const filteredCount = ref(42)

const isRangeSelected = (range) => {
  return localFilters.value.minPrice === range.min && 
         localFilters.value.maxPrice === range.max
}

const selectPriceRange = (range) => {
  if (isRangeSelected(range)) {
    // Déselectionner si déjà sélectionné
    localFilters.value.minPrice = null
    localFilters.value.maxPrice = null
  } else {
    localFilters.value.minPrice = range.min
    localFilters.value.maxPrice = range.max
  }
}

const selectRating = (rating) => {
  if (localFilters.value.minRating === rating) {
    localFilters.value.minRating = null
  } else {
    localFilters.value.minRating = rating
  }
}

const resetFilters = () => {
  localFilters.value = {
    minPrice: null,
    maxPrice: null,
    available: true,
    showOutOfStock: false,
    minRating: null
  }
}

const applyFilters = () => {
  emit('apply', { ...localFilters.value })
}

// Watch pour mettre à jour le compteur
watch(localFilters, () => {
  // Ici tu pourrais calculer le vrai nombre de produits
  // filteredCount.value = calculateFilteredProducts()
}, { deep: true })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px 16px 0 0;
  max-height: 85vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  color: #6b7280;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
}

.filter-section {
  padding: 1.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.filter-section:last-child {
  border-bottom: none;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.filter-title i {
  color: #4f46e5;
}

/* Prix */
.price-range {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.price-input {
  flex: 1;
}

.price-input label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.input-group {
  position: relative;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.input-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.currency {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
}

.quick-prices {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.price-range-btn {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.price-range-btn:hover {
  background: #e2e8f0;
}

.price-range-btn.active {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

/* Checkbox */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-item input:checked + .checkmark {
  background: #4f46e5;
  border-color: #4f46e5;
}

.checkbox-item input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* Rating */
.rating-filter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-option:hover {
  background: #f8fafc;
}

.rating-option.active {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.stars i.filled {
  color: #fbbf24;
}

.stars i:not(.filled) {
  color: #d1d5db;
}

/* Stats */
.filter-stats {
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
}

.reset-btn:hover {
  background: #e5e7eb;
}

.main-actions {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.cancel-btn,
.apply-btn {
  flex: 1;
  padding: 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.apply-btn {
  background: #4f46e5;
  border: 1px solid #4f46e5;
  color: white;
}

.apply-btn:hover {
  background: #3730a3;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Desktop */
@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }

  .modal-content {
    border-radius: 16px;
    max-height: 80vh;
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
}
</style>
