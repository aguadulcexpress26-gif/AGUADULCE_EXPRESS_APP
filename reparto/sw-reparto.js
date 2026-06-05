// sw-reparto.js - Service Worker para notificaciones y PWA
const CACHE_NAME = 'aguadulce-reparto-v2';

self.addEventListener('install', event => {
  console.log('📦 Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('✅ Service Worker activado');
  event.waitUntil(clients.claim());
});

// Escuchar mensajes desde la app (reparto.html)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOTIFICACION_PEDIDO') {
    const { titulo, cuerpo, pedidoId, total } = event.data;
    
    self.registration.showNotification(titulo, {
      body: cuerpo,
      icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
      badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: {
        url: `/AGUADULCE_EXPRESS_APP/reparto/reparto.html?pedidoId=${pedidoId}`,
        pedidoId: pedidoId
      },
      actions: [
        { action: 'ver', title: '📋 Ver pedido' },
        { action: 'cerrar', title: '❌ Cerrar' }
      ]
    });
  }
});

// Al hacer clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'ver') {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
