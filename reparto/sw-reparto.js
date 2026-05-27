// sw-reparto.js - Service Worker específico para reparto
const CACHE_NAME = 'aguadulce-reparto-v1';

const urlsToCache = [
  '/AGUADULCE_EXPRESS_APP/reparto/reparto.html',
  '/AGUADULCE_EXPRESS_APP/reparto/manifest-reparto.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache).catch(err => console.warn(err)))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('script.google.com')) return;
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME && caches.delete(key))
    ))
  );
  self.clients.claim();
});
