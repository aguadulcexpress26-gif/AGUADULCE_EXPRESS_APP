// sw-reparto.js - Service Worker específico para el panel de reparto
const CACHE_NAME = 'aguadulce-reparto-v1';

const urlsToCache = [
  '/AGUADULCE_EXPRESS_APP/',
  '/AGUADULCE_EXPRESS_APP/reparto.html',
  '/AGUADULCE_EXPRESS_APP/manifest-reparto.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Algún recurso no se pudo cachear (reparto)', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(err => {
        console.warn('Fetch fallido (reparto):', err);
        return new Response('Error de conexión', { status: 503 });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});
