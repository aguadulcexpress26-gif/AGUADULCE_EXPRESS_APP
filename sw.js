const CACHE_NAME = 'aguadulce-v2';
const urlsToCache = [
  './',
  './index.html',
  './COCINA.html',
  './repartidor_prueba.html',
  './manifest.json',
  'https://i.postimg.cc/mZwjLXxw/Logo-Aguadulce-Express.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
