// sw.js - Service Worker para PWA
// ⚠️ IMPORTANTE: Cambiar el número de versión cuando actualices ventas.html

const CACHE_NAME = 'aguadulce-clientes-v2';   // ← Subimos a v2

const urlsToCache = [
  '/AGUADULCE_EXPRESS_APP/ventas.html',
  '/AGUADULCE_EXPRESS_APP/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'
];

self.addEventListener('install', event => {
  console.log('🔄 Service Worker instalando v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // ← Fuerza al nuevo SW a activarse inmediatamente
});

self.addEventListener('activate', event => {
  console.log('✅ Service Worker activando v2...');
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
  self.clients.claim(); // ← Toma el control inmediatamente
});

self.addEventListener('fetch', event => {
  // Estrategia: network-first para HTML, cache-first para assets
  const url = new URL(event.request.url);
  
  // Si es el HTML principal → network-first (siempre busca la versión nueva)
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/ventas.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Guardar en caché la versión nueva
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request)) // Si falla → usar caché
    );
    return;
  }
  
  // Para el resto → cache-first (más rápido)
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
