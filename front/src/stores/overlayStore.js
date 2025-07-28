import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOverlayStore = defineStore('overlay', () => {
  const showProductOverlay = ref(false)
  const selectedProduct = ref(null)

  const openProductOverlay = (product) => {
    selectedProduct.value = product
    showProductOverlay.value = true
  }

  const closeProductOverlay = () => {
    showProductOverlay.value = false
    selectedProduct.value = null
  }

  return {
    showProductOverlay,
    selectedProduct,
    openProductOverlay,
    closeProductOverlay
  }
})
