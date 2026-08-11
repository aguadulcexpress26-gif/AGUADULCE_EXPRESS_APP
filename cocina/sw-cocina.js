// ============================================
// SERVICE WORKER PARA PWA DE COCINA
// Aguadulce Express - Versión 2.0
// ============================================

const CACHE_NAME = 'aguadulce-cocina-v2';
const OFFLINE_URL = '/AGUADULCE_EXPRESS_APP/cocina/offline.html';

// Recursos a cachear (prioridad crítica)
const urlsToCache = [
  // HTML y manifest
  '/AGUADULCE_EXPRESS_APP/cocina/cocina.html',
  '/AGUADULCE_EXPRESS_APP/cocina/manifest-cocina.json',
  
  // CDNs (Firebase)
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
  
  // CDNs (CSS)
  'https://cdn.tailwindcss.com',
  
  // CDNs (Librerías)
  'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// ============================================
// INSTALACIÓN
// ============================================
self.addEventListener('install', event => {
  console.log('📦 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📂 Cache abierto, agregando recursos...');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('✅ Recursos cacheados exitosamente');
            // Cachear página offline
            return cache.add(OFFLINE_URL);
          })
          .catch(error => {
            console.error('❌ Error al cachear:', error);
          });
      })
      .then(() => {
        console.log('🔄 Forzando activación...');
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVACIÓN
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
        console.log('✅ Service Worker activado y controlando clientes');
        return self.clients.claim();
      })
  );
});

// ============================================
// INTERCEPTAR PETICIONES (FETCH)
// ============================================
self.addEventListener('fetch', event => {
  // Ignorar peticiones de analytics y extensions
  if (event.request.url.includes('google-analytics') ||
      event.request.url.includes('chrome-extension')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si está en cache, devolverlo
        if (cachedResponse) {
          console.log('📦 Cache hit:', event.request.url);
          return cachedResponse;
        }
        
        // Si no está en cache, hacer fetch
        console.log('🌐 Fetching:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Verificar si es una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta para cachear
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('⚠️ No se pudo cachear:', event.request.url);
                }
              });
            
            return response;
          })
          .catch(error => {
            console.error('❌ Error en fetch:', error);
            
            // Si falla el fetch, mostrar página offline
            return caches.match(OFFLINE_URL)
              .then(offlineResponse => {
                if (offlineResponse) {
                  return offlineResponse;
                }
                
                // Si no hay página offline, mostrar mensaje simple
                return new Response(
                  '🌐 Sin conexión a internet. Por favor, verifica tu conexión.',
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                      'Content-Type': 'text/plain'
                    })
                  }
                );
              });
          });
      })
  );
});

// ============================================
// GESTIÓN DE NOTIFICACIONES PUSH
// ============================================
self.addEventListener('push', event => {
  console.log('📨 Notificación push recibida:', event);
  
  let data = {
    title: 'Aguadulce Express',
    body: 'Nuevo pedido en la cocina',
    icon: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
    badge: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
    vibrate: [200, 100, 200],
    sound: '/sounds/notification.mp3',
    actions: [
      {
        action: 'ver',
        title: '👀 Ver pedido',
        icon: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg'
      },
      {
        action: 'cerrar',
        title: '❌ Cerrar',
        icon: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg'
      }
    ]
  };
  
  // Parsear datos si vienen en JSON
  if (event.data) {
    try {
      const pushData = event.data.json();
      data = { ...data, ...pushData };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: data.vibrate,
      actions: data.actions,
      data: {
        url: data.url || '/AGUADULCE_EXPRESS_APP/cocina/cocina.html'
      }
    })
  );
});

// ============================================
// GESTIÓN DE CLICKS EN NOTIFICACIONES
// ============================================
self.addEventListener('notificationclick', event => {
  console.log('🔔 Click en notificación:', event);
  
  event.notification.close();
  
  if (event.action === 'ver') {
    // Abrir la app con el pedido específico
    const url = event.notification.data.url || '/AGUADULCE_EXPRESS_APP/cocina/cocina.html';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then(windowClients => {
        // Si ya hay una ventana abierta, usarla
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else if (event.action === 'cerrar') {
    // Solo cerrar la notificación
    console.log('❌ Notificación cerrada');
  } else {
    // Click en la notificación (sin acción)
    const url = event.notification.data.url || '/AGUADULCE_EXPRESS_APP/cocina/cocina.html';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// ============================================
// GESTIÓN DE MENSAJES
// ============================================
self.addEventListener('message', event => {
  console.log('💬 Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================
// LOGS DE INICIO
// ============================================
console.log('🚀 Service Worker de Aguadulce Express - Cocina');
console.log(`📦 Cache: ${CACHE_NAME}`);
console.log('📱 Versión 2.0 - Optimizado para tabletas');
