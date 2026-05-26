// sw.js - Service Worker sin cacheo de CDNs externos
const CACHE_NAME = 'aguadulce-v3';  // Cambia el número cada vez que actualices
const urlsToCache = [
  './',
  './nueva_propuesta.html',  // ← Asegura que es este
  './manifest.json'
  // NO incluyas CDNs externos (tailwind, firebase, etc.)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cachear solo recursos locales, ignorar fallos de CDN
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Algún recurso no se pudo cachear', err);
        });
      })
  );
  self.skipWaiting(); // Activar inmediatamente
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) return response;
        // Si no, ir a la red y cachear solo si es del mismo origen
        return fetch(event.request).then(fetchResponse => {
          // Solo cachear respuestas del mismo origen (para evitar CORS)
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
        // Puedes devolver una página offline aquí si quieres
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
  self.clients.claim(); // Tomar control inmediato
});
