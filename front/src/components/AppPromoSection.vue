<template>
  <section class="app-promo-section">
    <div class="app-promo-card" :style="cardStyle">
      <div class="app-promo-icon">
        <div class="phone-icon" :style="iconStyle">
          <i :class="icon"></i>
        </div>
      </div>
      
      <div class="app-promo-content">
        <h3 class="app-promo-title">{{ title }}</h3>
        <button 
          class="app-promo-btn" 
          @click="handleButtonClick"
          :disabled="loading || isInstalled"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ dynamicButtonText }}
          <i v-if="!loading && !isInstalled" :class="buttonIcon"></i>
        </button>
      </div>
      
      <button 
        v-if="dismissible" 
        class="dismiss-btn"
        @click="handleDismiss"
        title="Fermer"
      >
        <i class="ri-close-line"></i>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePWA } from '../composables/usePWA'

const { isSupported, isInstallable, isInstalled, installPWA } = usePWA()
// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Découvrez vos produits plus rapidement avec l\'application web LA FAVOLA'
  },
  buttonText: {
    type: String,
    default: 'Ajouter le raccourci'
  },
  buttonIcon: {
    type: String,
    default: 'ri-arrow-right-line'
  },
  icon: {
    type: String,
    default: 'ri-smartphone-line'
  },
  theme: {
    type: String,
    default: 'blue',
    validator: value => ['blue', 'purple', 'green', 'orange'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['buttonClick', 'dismiss'])

// État
const loading = ref(false)

// Thèmes de couleurs
const themes = {
  blue: {
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  purple: {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  green: {
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  orange: {
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  }
}

// Computed styles
const cardStyle = computed(() => ({
  background: themes[props.theme].gradient
}))

const iconStyle = computed(() => ({
  background: themes[props.theme].iconBg
}))

const dynamicButtonText = computed(() => {
  if (isInstalled.value) return '✅ App installée'
  if (isInstallable.value) return 'Installer l\'app'
  if (isSupported.value) return 'App disponible'
  return 'Non supporté'
})

// Méthodes
const handleButtonClick = async () => {
  if (loading.value || isInstalled.value) return
  
  loading.value = true
  
  try {
    if (isInstallable.value) {
      // Installation PWA
      const success = await installPWA()
      if (success) {
        // console.log('✅ PWA installée avec succès!')
      }
    } else {
      // Fallback: ajouter aux favoris ou autre action
      // console.log('📌 Ajout aux favoris du navigateur')
    }
    
    emit('buttonClick')
  } catch (error) {
    console.error('❌ Erreur installation:', error)
  } finally {
    loading.value = false
  }
}

const handleDismiss = () => {
  emit('dismiss')
}
</script>

<style scoped>
.app-promo-section {
  padding: 1rem;
  margin: 2rem 0;
}

.app-promo-card {
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.app-promo-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.app-promo-icon {
  flex-shrink: 0;
}

.phone-icon {
  border-radius: 12px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.app-promo-card:hover .phone-icon {
  transform: scale(1.1) rotate(5deg);
}

.app-promo-content {
  flex: 1;
}

.app-promo-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  opacity: 0.95;
}

.app-promo-btn {
  background: rgba(255, 255, 255, 0.95);
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
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 120px;
  justify-content: center;
}

.app-promo-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: white;
}

.app-promo-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dismiss-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 768px) {
  .app-promo-card {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }
  
  .app-promo-title {
    font-size: 1.1rem;
  }
  
  .dismiss-btn {
    top: 0.75rem;
    right: 0.75rem;
  }
}
</style>
