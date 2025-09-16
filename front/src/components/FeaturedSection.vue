<template>
  <section class="featured-section">
    <div class="featured-card" @click="handleClick">
      <img 
        :src="image" 
        :alt="title" 
        class="featured-image" 
      />
      <div class="featured-overlay">
        <div class="featured-content">
          <span v-if="badge" class="featured-badge">{{ badge }}</span>
          <h2 class="featured-title">{{ title }}</h2>
          <p class="featured-description">{{ description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Props
defineProps({
  title: {
    type: String,
    default: 'En ce moment'
  },
  description: {
    type: String,
    default: 'Découvrez nos dernières nouveautés'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop'
  },
  badge: {
    type: String,
    default: null
  },
  showButton: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: 'Découvrir'
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.featured-section {
  padding: 1rem;
}

.featured-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 200px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.featured-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.featured-card:hover .featured-image {
  transform: scale(1.05);
}

.featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg, 
    rgba(0, 0, 0, 0.7) 0%, 
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.5) 100%
  );
  display: flex;
  align-items: center;
  padding: 1.5rem;
}

.featured-content {
  position: relative;
  z-index: 2;
}

.featured-badge {
  display: inline-block;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.featured-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.featured-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.featured-cta {
  background: white;
  color: #1f2937;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.featured-cta:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .featured-card {
    height: 180px;
  }
  
  .featured-overlay {
    padding: 1rem;
  }
  
  .featured-title {
    font-size: 1.25rem;
  }
  
  .featured-description {
    font-size: 0.9rem;
  }
}
</style>
