
const CACHE_NAME = 'jw-study-v4';
const OFFLINE_URL = './index.html';

// Liste des ressources essentielles à mettre en cache immédiatement
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Stratégie pour les pages de navigation (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Stratégie pour les autres ressources : Cache First, then Network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Fallback pour les requêtes échouées
        if (event.request.destination === 'image') {
           return caches.match('./manifest.json'); // Juste pour renvoyer quelque chose de valide
        }
        return null;
      });
    })
  );
});
