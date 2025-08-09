const CACHE_NAME = 'lafavola-v1.0.1'; // Changez la version
const urlsToCache = [
  './',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Installation
self.addEventListener('install', event => {
  console.log('SW: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW: Cache failed:', err))
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('SW: Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignorer certaines requêtes
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (req.url.includes('/@vite/')) return;
  if (req.url.includes('/api/')) return; // ⭐ Important : ignorer les API
  if (req.headers.get('accept') === 'text/event-stream') return;

  event.respondWith(handleFetch(req));
});

async function handleFetch(req) {
  // Pour les documents HTML (navigation SPA)
  if (req.destination === 'document') {
    try {
      return await fetch(req);
    } catch {
      // Fallback vers la page principale pour SPA
      return caches.match('./') || fetch('./');
    }
  }

  // Cache first pour les autres ressources
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const response = await fetch(req);
    if (req.method === 'GET' && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, response.clone()).catch(console.warn);
    }
    return response;
  } catch (err) {
    throw err;
  }
}

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
