const CACHE_NAME = 'lafavola-v1.0.0'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Ajoute tes routes principales
  '/menu',
  '/cart',
  '/profile',
  // Assets critiques (optionnel)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Cache ouvert')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('✅ Service Worker: Tous les fichiers mis en cache')
        self.skipWaiting() // Force l'activation immédiate
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activation...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Suppression ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Service Worker: Activé et prêt!')
      self.clients.claim() // Prend contrôle immédiatement
    })
  )
})

// Interception des requêtes (stratégie Cache First pour les assets)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourne depuis le cache si disponible
        if (response) {
          return response
        }
        
        // Sinon, récupère depuis le réseau
        return fetch(event.request).then(response => {
          // Vérifie si la réponse est valide
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // Clone la réponse pour la mettre en cache
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })
          
          return response
        })
      })
      .catch(() => {
        // Fallback en cas d'erreur (mode hors ligne)
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})

// Gestion des notifications push (optionnel)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/icons/close-icon.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})
