// sw.js - Service Worker para PWA Aguadulce Express (Clientes)
const CACHE_VERSION = 'v5';  // ← Subimos a v5
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
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('✅ SW activando', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME && caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // HTML y JSON → network-first
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Resto → cache-first
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
