import { ref, onMounted, onUnmounted } from 'vue'

export function useImageOptimization(src, fallback = '/images/placeholder.jpg') {
  const imageSrc = ref(fallback)
  const imageLoaded = ref(false)
  const imageError = ref(false)
  const loading = ref(true)

  const loadImage = () => {
    const img = new Image()
    
    img.onload = () => {
      imageSrc.value = src
      imageLoaded.value = true
      imageError.value = false
      loading.value = false
    }
    
    img.onerror = () => {
      imageSrc.value = fallback
      imageLoaded.value = false
      imageError.value = true
      loading.value = false
    }
    
    img.src = src
  }

  onMounted(() => {
    if (src) {
      loadImage()
    } else {
      loading.value = false
    }
  })

  return {
    imageSrc,
    imageLoaded,
    imageError,
    loading,
    reload: loadImage
  }
}
