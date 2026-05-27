// sw.js - Service Worker corregido (ignora peticiones a Google Apps Script)
const CACHE_NAME = 'aguadulce-v10';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Algún recurso no se pudo cachear', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // 🔥 IMPORTANTE: Ignorar peticiones a Google Apps Script (evita errores CORS)
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(fetchResponse => {
          if (fetchResponse && fetchResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
      .catch(err => {
        console.warn('Fetch fallido, sin conexión?', err);
        return new Response('Error de conexión', { status: 503, statusText: 'Offline' });
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
