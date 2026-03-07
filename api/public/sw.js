const CACHE_NAME = 'jw-study-pro-cache-v30'; // Incremented cache version for new PWA icons
const ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/pwa-192.svg',
  '/pwa-512.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap' // Cache fonts
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
  // STRICT BYPASS for API calls - bypass cache entirely
  if (event.request.url.includes('/api/')) {
    return event.respondWith(fetch(event.request));
  }

  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached response if found
      if (cached) {
        return cached;
      }
      
      // Otherwise, fetch from network
      return fetch(event.request).then((response) => {
        // Cache valid responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        // If network fails for navigation requests, return offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        // For other requests, you might return a generic offline image or error page
        return new Response('Network request failed and no cache available for ' + event.request.url, { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Listen for message from client to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
