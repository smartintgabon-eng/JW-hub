const CACHE_NAME = 'jw-study-pro-cache-v10'; // Incrément de la version du cache
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
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignore les requêtes vers l'API Gemini ou notre API Route pour éviter de les mettre en cache
  if (event.request.url.includes('generativelanguage.googleapis.com') || event.request.url.includes('/api/generate-content')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => null);
    })
  );
});