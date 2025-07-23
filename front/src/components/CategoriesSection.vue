<template>
  <section class="categories-section">
    <h3 class="section-title">{{ title }}</h3>
    <div class="categories-grid">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="category-item" 
        @click="handleCategoryClick(category)"
        :class="{ 'active': activeCategory === category.type }"
      >
        <div class="category-icon">
          <i :class="category.icon"></i>
        </div>
        <span class="category-label">{{ category.name }}</span>
        <span v-if="category.count" class="category-count">{{ category.count }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Catégories'
  },
  categories: {
    type: Array,
    default: () => [
      {
        id: 1,
        name: 'Pizzas',
        type: 'pizza',
        icon: 'ri-pie-chart-2-line',
        color: '#ef4444',
        count: 0
      },
      {
        id: 2,
        name: 'Boissons',
        type: 'boisson',
        icon: 'ri-cup-line',
        color: '#3b82f6',
        count: 0
      },
      {
        id: 3,
        name: 'Desserts',
        type: 'dessert',
        icon: 'ri-cake-2-line',
        color: '#8b5cf6',
        count: 0
      }
    ]
  },
  activeCategory: {
    type: String,
    default: null
  },
  showCount: {
    type: Boolean,
    default: true
  }
})

// Events
const emit = defineEmits(['categoryClick'])

const handleCategoryClick = (category) => {
  emit('categoryClick', category)
}

// Computed pour ajouter les couleurs CSS
const categoriesWithStyles = computed(() => {
  return props.categories.map(cat => ({
    ...cat,
    cssVars: {
      '--category-color': cat.color || '#6b7280'
    }
  }))
})
</script>

<style scoped>
.categories-section {
  padding: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  max-width: 400px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.75rem;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.category-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.category-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #e5e7eb;
}

.category-item:hover::before {
  opacity: 1;
}

.category-item.active {
  border-color: var(--category-color, #3b82f6);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
  transform: translateY(-2px);
}

.category-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  color: #6b7280;
  transition: all 0.3s;
}

.category-item:hover .category-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  transform: scale(1.1);
}

.category-item.active .category-icon {
  background: var(--category-color, #3b82f6);
  color: white;
}

.category-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  transition: color 0.3s;
}

.category-item:hover .category-label {
  color: #1f2937;
}

.category-item.active .category-label {
  color: var(--category-color, #3b82f6);
}

.category-count {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  transform: scale(0.9);
  transition: transform 0.3s;
}

.category-item:hover .category-count {
  transform: scale(1);
}

/* Responsive */
@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  
  .category-item {
    padding: 0.75rem 0.5rem;
  }
  
  .category-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
  
  .category-label {
    font-size: 0.8rem;
  }
}

/* Animation d'apparition */
.category-item {
  animation: fadeInUp 0.6s ease-out;
}

.category-item:nth-child(1) { animation-delay: 0.1s; }
.category-item:nth-child(2) { animation-delay: 0.2s; }
.category-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
