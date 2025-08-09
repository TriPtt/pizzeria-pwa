import { ref, onMounted } from 'vue'

export function usePWA() {
  const deferredPrompt = ref(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const isSupported = ref(false)
  
  onMounted(() => {
    // Vérifier le support PWA
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
    
    // Vérifier si déjà installé
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true
    
    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // console.log('💾 PWA: Installation disponible!')
      // Empêche l'affichage automatique du prompt
      e.preventDefault()
      // Stocke l'événement pour l'utiliser plus tard
      deferredPrompt.value = e
      isInstallable.value = true
    })
    
    // Écouter l'installation
    window.addEventListener('appinstalled', () => {
      // console.log('✅ PWA: App installée!')
      isInstalled.value = true
      isInstallable.value = false
      deferredPrompt.value = null
    })
    
    // Enregistrer le service worker
    registerServiceWorker()
  })
  
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        // console.log('✅ Service Worker enregistré:', registration.scope)
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          // console.log('🔄 Nouvelle version disponible!')
        })
        
      } catch (error) {
        console.error('❌ Erreur Service Worker:', error)
      }
    }
  }
  
  const installPWA = async () => {
    if (!deferredPrompt.value) {
      console.warn('⚠️ PWA: Pas de prompt d\'installation disponible')
      return false
    }
    
    try {
      // Affiche le prompt d'installation
      deferredPrompt.value.prompt()
      
      // Attend la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.value.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA: Installation acceptée')
        return true
      } else {
        console.log('❌ PWA: Installation refusée')
        return false
      }
    } catch (error) {
      console.error('❌ Erreur installation PWA:', error)
      return false
    } finally {
      deferredPrompt.value = null
      isInstallable.value = false
    }
  }
  
  return {
    isSupported,
    isInstallable,
    isInstalled,
    installPWA
  }
}
