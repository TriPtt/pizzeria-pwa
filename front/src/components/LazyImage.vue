<template>
  <div 
    ref="container"
    class="lazy-image-container"
    :style="containerStyle"
  >
    <!-- Placeholder pendant le chargement -->
    <div 
      v-if="!imageLoaded && !imageError"
      class="lazy-placeholder"
      :class="placeholderClass"
    >
      <div class="lazy-skeleton" v-if="skeleton">
        <div class="skeleton-shimmer"></div>
      </div>
      <div v-else class="lazy-icon">
        <i :class="placeholderIcon"></i>
      </div>
    </div>

    <!-- Image principale -->
    <img
      v-show="imageLoaded && !imageError"
      :src="finalSrc"
      :alt="alt"
      class="lazy-image"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Image de fallback en cas d'erreur -->
    <div 
      v-if="imageError"
      class="lazy-error"
      :class="errorClass"
    >
      <i class="ri-image-line"></i>
      <span v-if="showErrorText">{{ errorText }}</span>
    </div>

    <!-- Overlay optionnel -->
    <div v-if="overlay" class="lazy-overlay" :style="overlayStyle">
      <slot name="overlay"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLazyLoad } from '../composables/useLazyLoad'

// Props
const props = defineProps({
  src: String,
  alt: String,
  fallback: {
    type: String,
    default: '/images/placeholder.jpg'
  },
  width: [String, Number],
  height: [String, Number],
  aspectRatio: {
    type: String,
    default: '1/1' // ratios: 16/9, 4/3, 1/1, etc.
  },
  lazy: {
    type: Boolean,
    default: true
  },
  skeleton: {
    type: Boolean,
    default: true
  },
  placeholderIcon: {
    type: String,
    default: 'ri-image-line'
  },
  showErrorText: {
    type: Boolean,
    default: false
  },
  errorText: {
    type: String,
    default: 'Image non disponible'
  },
  overlay: Boolean,
  rounded: {
    type: String,
    default: '12px'
  },
  objectFit: {
    type: String,
    default: 'cover'
  }
})

// Events
const emit = defineEmits(['load', 'error'])

// État
const imageLoaded = ref(false)
const imageError = ref(false)

// Lazy loading
const { target: container, isVisible } = useLazyLoad({
  threshold: 0.1,
  rootMargin: '100px'
})

// Image source finale
const finalSrc = computed(() => {
  if (!props.lazy) return props.src
  return isVisible.value ? props.src : null
})

// Styles calculés
const containerStyle = computed(() => ({
  width: props.width ? `${props.width}px` : '100%',
  height: props.height ? `${props.height}px` : 'auto',
  aspectRatio: props.aspectRatio,
  borderRadius: props.rounded
}))

const overlayStyle = computed(() => ({
  borderRadius: props.rounded
}))

// Classes dynamiques
const placeholderClass = computed(() => ({
  'skeleton-mode': props.skeleton
}))

const imageClass = computed(() => ({
  'fade-in': imageLoaded.value
}))

const errorClass = computed(() => ({
  'with-text': props.showErrorText
}))

// Gestion des événements
const handleLoad = () => {
  imageLoaded.value = true
  imageError.value = false
  emit('load')
}

const handleError = () => {
  imageLoaded.value = false
  imageError.value = true
  emit('error')
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
              linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
              linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.lazy-skeleton {
  width: 100%;
  height: 100%;
  position: relative;
  background: #e5e7eb;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.6), 
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.lazy-icon {
  font-size: 2rem;
  color: #9ca3af;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: v-bind(objectFit);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image.fade-in {
  opacity: 1;
}

.lazy-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}

.lazy-error i {
  font-size: 2rem;
  color: #d1d5db;
}

.lazy-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Variantes de ratio */
.lazy-image-container[style*="aspect-ratio: 16/9"] {
  aspect-ratio: 16/9;
}

.lazy-image-container[style*="aspect-ratio: 4/3"] {
  aspect-ratio: 4/3;
}

.lazy-image-container[style*="aspect-ratio: 1/1"] {
  aspect-ratio: 1/1;
}
</style>
