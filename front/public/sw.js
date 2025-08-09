const CACHE_NAME = 'lafavola-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/menu',
  '/cart',
  '/profile',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => name !== CACHE_NAME ? caches.delete(name) : null)
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler : Cache First avec protections
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // IGNORER : schemes non-http(s) (ex: chrome-extension://), websocket/hmr et le client Vite
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (req.url.includes('/@vite/') || req.url.includes('/@vite/client')) return;
  if (req.headers.get('accept') === 'text/event-stream') return; // SSE
  if (req.url.startsWith('ws:') || req.url.startsWith('wss:')) return;

  event.respondWith((async () => {
    // Try cache first
    const cached = await caches.match(req);
    if (cached) return cached;

    // Otherwise network fetch
    try {
      const networkResponse = await fetch(req);

      // Only cache GET requests and successful 200 OK responses with http(s)
      if (
        req.method === 'GET' &&
        networkResponse &&
        networkResponse.status === 200 &&
        ['basic', 'cors'].includes(networkResponse.type)
      ) {
        const responseToCache = networkResponse.clone();
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(req, responseToCache);
        } catch (err) {
          // Ne pas laisser le SW crasher pour un échec de cache (quota, scheme, etc.)
          console.warn('cache.put failed, skipping:', err);
        }
      }

      return networkResponse;
    } catch (err) {
      // En cas d'erreur réseau, fournir fallback pour les documents
      if (req.destination === 'document') {
        const fallback = await caches.match('/');
        if (fallback) return fallback;
      }
      // Pour autres cas, rejeter (la requête échouera)
      throw err;
    }
  })());
});

// Push notifications (inchangé)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        { action: 'view', title: 'Voir', icon: '/icons/view-icon.png' },
        { action: 'close', title: 'Fermer', icon: '/icons/close-icon.png' }
      ]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
