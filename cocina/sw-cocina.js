// ============================================
// SERVICE WORKER PARA PWA DE COCINA (CORREGIDO)
// Aguadulce Express - Versión 3.0
// ============================================

const CACHE_NAME = 'aguadulce-cocina-v3';
const OFFLINE_URL = '/AGUADULCE_EXPRESS_APP/cocina/offline.html';

// ⚠️ SOLO cachear recursos locales y CDNs críticos que SÍ funcionan
const urlsToCache = [
  // HTML y manifest
  '/AGUADULCE_EXPRESS_APP/cocina/cocina.html',
  '/AGUADULCE_EXPRESS_APP/cocina/manifest-cocina.json'
];

// ============================================
// INSTALACIÓN (CORREGIDA)
// ============================================
self.addEventListener('install', event => {
  console.log('📦 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📂 Cache abierto, agregando recursos...');
        return cache.addAll(urlsToCache).catch(error => {
          console.warn('⚠️ Error al cachear algunos recursos:', error);
        });
      })
      .then(() => {
        console.log('🔄 Forzando activación...');
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVACIÓN (CORREGIDA)
// ============================================
self.addEventListener('activate', event => {
  console.log('⚡ Service Worker activando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado');
        return self.clients.claim();
      })
  );
});

// ============================================
// INTERCEPTAR PETICIONES (CORREGIDO)
// ============================================
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // 🔥 IGNORAR PETICIONES A CDNs EXTERNOS (NO CACHEAR)
  if (url.includes('cdn.tailwindcss.com') ||
      url.includes('cdn.jsdelivr.net') ||
      url.includes('gstatic.com') ||
      url.includes('googleapis.com') ||
      url.includes('fcm.googleapis.com') ||
      url.includes('maps.googleapis.com') ||
      url.includes('google-analytics') ||
      url.includes('chrome-extension')) {
    // Dejar que el navegador maneje directamente (sin cache)
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('📦 Cache hit:', event.request.url);
          return cachedResponse;
        }
        
        console.log('🌐 Fetching:', event.request.url);
        return fetch(event.request).catch(() => {
          // Si offline y es una página HTML, mostrar offline.html
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_URL).then(response => {
              if (response) return response;
              return new Response('🌐 Sin conexión', { status: 503 });
            });
          }
          return new Response('🌐 Sin conexión', { status: 503 });
        });
      })
  );
});

// ============================================
// NOTIFICACIONES PUSH (CORREGIDO PARA SILK)
// ============================================
self.addEventListener('push', event => {
  console.log('📨 Notificación push recibida:', event);
  
  let title = '🍳 Aguadulce Express';
  let body = 'Nuevo pedido en la cocina';
  let icon = 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg';
  let url = '/AGUADULCE_EXPRESS_APP/cocina/cocina.html';
  let pedidoId = null;
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('📨 Datos push:', data);
      title = data.titulo || data.title || title;
      body = data.mensaje || data.body || body;
      icon = data.icon || icon;
      url = data.url || url;
      pedidoId = data.pedidoId || data.data?.pedidoId || null;
    } catch (e) {
      body = event.data.text() || body;
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: icon,
      vibrate: [200, 100, 200],
      data: {
        url: url,
        pedidoId: pedidoId
      },
      actions: [
        { action: 'ver', title: '👀 Ver pedido' },
        { action: 'cerrar', title: '❌ Cerrar' }
      ]
    })
  );
});

// ============================================
// CLICK EN NOTIFICACIONES
// ============================================
self.addEventListener('notificationclick', event => {
  console.log('🔔 Click en notificación:', event);
  event.notification.close();
  
  const url = event.notification.data?.url || '/AGUADULCE_EXPRESS_APP/cocina/cocina.html';
  const pedidoId = event.notification.data?.pedidoId || null;
  
  // Si hay pedidoId, agregarlo a la URL
  const targetUrl = pedidoId ? `${url}?pedido=${pedidoId}` : url;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('cocina.html') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ============================================
// MENSAJES
// ============================================
self.addEventListener('message', event => {
  console.log('💬 Mensaje recibido:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker de Aguadulce Express - Cocina v3');
console.log(`📦 Cache: ${CACHE_NAME}`);
