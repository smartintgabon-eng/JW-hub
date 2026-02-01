
const CACHE_NAME = 'jw-study-app-v8';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation : Mise en cache des fichiers de base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Installation du cache PWA...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage des vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch : Stratégie "Network First" avec repli sur le cache pour éviter le 404
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si on a une réponse valide du réseau, on la renvoie
        return response;
      })
      .catch(() => {
        // Si le réseau échoue (mode hors-ligne ou erreur serveur), on cherche dans le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si c'est une navigation (changement de page), on renvoie toujours l'index
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
