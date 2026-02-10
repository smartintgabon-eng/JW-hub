const CACHE_NAME = 'jw-study-pro-cache-v5';
const ASSETS = [
  '/',
  '/index.html', // Cette entrée sera gérée par le process de build de react-scripts
  '%PUBLIC_URL%/logo192.png', // Ajout pour PWA
  '%PUBLIC_URL%/logo512.png', // Ajout pour PWA
  '%PUBLIC_URL%/favicon.ico' // Ajout pour le favicon
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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
  // Ignore les requêtes vers l'API Gemini pour éviter de les mettre en cache
  if (event.request.url.includes('generativelanguage.googleapis.com')) return;

  // Sert les ressources depuis le cache, ou les récupère et les met en cache
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Vérifie si la réponse est valide avant de la mettre en cache
        if (!response || response.status !== 200 || response.type !== 'basic') return response;

        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => null); // Gère les erreurs de fetch (par exemple, réseau hors ligne)
    })
  );
});