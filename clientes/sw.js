// sw.js - Service Worker para PWA
// ⚠️ IMPORTANTE: Cambiar CACHE_VERSION cuando actualices ventas.html

const CACHE_VERSION = 'v3';  // ← SUBIMOS DE V1 A V3 PARA FORZAR ACTUALIZACIÓN
const CACHE_NAME = `aguadulce-clientes-${CACHE_VERSION}`;

const urlsToCache = [
  './ventas.html',
  './manifest.json',
  'https://cdn.tailwindcss.com/3.4.16',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'
];

self.addEventListener('install', event => {
  console.log('🔄 SW instalando', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('⚠️ Error cacheando:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('✅ SW activando', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('🗑️ Borrando caché antigua:', key);
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // HTML y JSON → network-first (siempre fresco)
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Resto → cache-first
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
