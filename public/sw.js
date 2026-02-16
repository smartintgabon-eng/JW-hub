const CACHE_NAME = 'jw-study-pro-cache-v24'; // Incrément de la version du cache
const ASSETS = [
  './',
  './index.html',
  './logo192.png',
  './logo512.png',
  './favicon.ico',
  // Ajout du CDN TailwindCSS au cache pour l'accès hors ligne
  'https://cdn.tailwindcss.com' 
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS.filter(asset => asset.indexOf('http') === 0 || asset.indexOf('./') === 0))) // Filtrer pour n'ajouter que les URL valides
  );
  self.skipWaiting(); // Permet au nouveau SW de s'activer immédiatement
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim(); // Prend le contrôle des clients existants immédiatement
});

self.addEventListener('fetch', (event) => {
  // Ignore les requêtes vers l'API Gemini ou notre API Route pour éviter de les mettre en cache
  if (event.request.url.includes('generativelanguage.googleapis.com') || event.request.url.includes('/api/generate-content') || event.request.method !== 'GET') {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Si l'actif est en cache, le retourner
      if (cached) return cached;

      // Sinon, tenter de récupérer l'actif du réseau
      return fetch(event.request).then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Mettre en cache les polices et les CSS pour l'expérience hors ligne
        const url = new URL(event.request.url);
        if (url.origin === self.location.origin || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.pathname.endsWith('.css')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch((error) => {
        // En cas d'échec du réseau, tenter de trouver une version hors ligne
        console.error('Fetch failed:', error);
        return caches.match('./index.html'); // Fallback to index.html for navigation
      });
    })
  );
});

// Écouteur pour les messages du client pour ignorer l'attente du Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});