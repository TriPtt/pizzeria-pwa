<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Trier par</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="sort-options">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          class="sort-option"
          :class="{ active: currentSort === option.value }"
          @click="selectSort(option.value)"
        >
          <div class="option-content">
            <i :class="option.icon"></i>
            <div class="option-text">
              <span class="option-label">{{ option.label }}</span>
              <small class="option-description">{{ option.description }}</small>
            </div>
          </div>
          <i v-if="currentSort === option.value" class="ri-check-line check-icon"></i>
        </button>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">
          Annuler
        </button>
        <button class="apply-btn" @click="applySort">
          Appliquer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentSort: {
    type: String,
    default: 'name'
  }
})

const emit = defineEmits(['close', 'sort'])

const selectedSort = ref(props.currentSort)

const sortOptions = [
  {
    value: 'name',
    label: 'Nom (A-Z)',
    description: 'Ordre alphabétique',
    icon: 'ri-sort-alphabet-asc'
  },
  {
    value: 'name-desc',
    label: 'Nom (Z-A)',
    description: 'Ordre alphabétique inversé',
    icon: 'ri-sort-alphabet-desc'
  },
  {
    value: 'price-asc',
    label: 'Prix croissant',
    description: 'Du moins cher au plus cher',
    icon: 'ri-arrow-up-line'
  },
  {
    value: 'price-desc',
    label: 'Prix décroissant',
    description: 'Du plus cher au moins cher',
    icon: 'ri-arrow-down-line'
  },
  {
    value: 'popular',
    label: 'Popularité',
    description: 'Les plus commandés',
    icon: 'ri-fire-line'
  }
]

const selectSort = (value) => {
  selectedSort.value = value
}

const applySort = () => {
  emit('sort', selectedSort.value)
}
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
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
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

.sort-options {
  padding: 0.5rem 0;
  max-height: 60vh;
  overflow-y: auto;
}

.sort-option {
  width: 100%;
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.sort-option:hover {
  background: #f8fafc;
}

.sort-option.active {
  background: #eff6ff;
  color: #2563eb;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-content i {
  font-size: 1.25rem;
  color: #6b7280;
  width: 24px;
  text-align: center;
}

.sort-option.active .option-content i {
  color: #2563eb;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-label {
  font-weight: 500;
  color: #1f2937;
}

.sort-option.active .option-label {
  color: #2563eb;
}

.option-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.check-icon {
  color: #2563eb;
  font-size: 1.25rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
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
    max-height: 70vh;
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
