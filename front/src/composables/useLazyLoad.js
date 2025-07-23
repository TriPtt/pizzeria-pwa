import { ref, onMounted, onUnmounted } from 'vue'

export function useLazyLoad(options = {}) {
  const target = ref(null)
  const isVisible = ref(false)
  const hasLoaded = ref(false)
  
  let observer = null

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  }

  onMounted(() => {
    if (!target.value) return

    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasLoaded.value) {
        isVisible.value = true
        hasLoaded.value = true
        
        // Déconnexion après premier chargement
        observer.disconnect()
      }
    }, defaultOptions)

    observer.observe(target.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return { target, isVisible, hasLoaded }
}
