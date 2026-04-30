// Service Worker para Aguadulce Express
const CACHE_NAME = 'aguadulce-v1';
const urlsToCache = [
  './',
  './index.html',
  './cocinaxpress.html',
  './manifest.json',
  'https://i.postimg.cc/mZwjLXxw/Logo-Aguadulce-Express.jpg'
];

// Instalación del Service Worker y almacenamiento en caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Manejo de peticiones (Estrategia: Network First)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
