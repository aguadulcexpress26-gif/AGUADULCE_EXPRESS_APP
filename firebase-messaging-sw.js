// firebase-messaging-sw.js
const CACHE_NAME = 'aguadulce-reparto-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Escuchamos mensajes desde la app (reparto.html)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOTIFICACION_PEDIDO') {
    const { titulo, cuerpo, pedidoId, total } = event.data;

    self.registration.showNotification(titulo, {
      body: cuerpo,
      icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
      badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
      vibrate: [200, 100, 200],
      sound: true,          // Intentar sonido
      data: {
        url: `/AGUADULCE_EXPRESS_APP/reparto/reparto.html?pedidoId=${pedidoId}`,
        pedidoId: pedidoId
      },
      actions: [
        { action: 'ver', title: 'Ver pedido' },
        { action: 'cerrar', title: 'Cerrar' }
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
