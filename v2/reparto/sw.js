// Service Worker para la app de reparto con FCM
const CACHE_NAME = 'reparto-v2-fcm';
const urlsToCache = [
    '/AGUADULCE_EXPRESS_APP/v2/reparto/index.html',
    'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

self.addEventListener('install', event => {
    console.log('✅ SW Reparto V2 instalado');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    console.log('✅ SW Reparto V2 activado');
    event.waitUntil(clients.claim());
});

// ⭐ LO NUEVO: Recibir notificaciones push
self.addEventListener('push', event => {
    console.log('📨 Notificación push recibida', event);
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch(e) {
            data = { title: 'Aguadulce Express', body: event.data.text() };
        }
    }
    
    const options = {
        body: data.body || '📦 Tienes un nuevo pedido para repartir',
        icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        vibrate: [200, 100, 200],
        data: { url: '/AGUADULCE_EXPRESS_APP/v2/reparto/index.html' },
        actions: [{ action: 'open', title: '📦 Ver pedido' }]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Aguadulce Express - Nuevo Pedido', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/AGUADULCE_EXPRESS_APP/v2/reparto/index.html')
    );
});
