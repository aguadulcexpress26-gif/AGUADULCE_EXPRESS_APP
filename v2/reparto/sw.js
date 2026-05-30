// Service Worker para la app de reparto con FCM
const CACHE_NAME = 'reparto-v2-fcm';

self.addEventListener('install', event => {
    console.log('✅ SW Reparto V2 instalado');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('✅ SW Reparto V2 activado');
    event.waitUntil(clients.claim());
});

// ⭐ RECIBIR NOTIFICACIONES PUSH
self.addEventListener('push', event => {
    console.log('📨 Notificación push recibida');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch(e) {
            data = { 
                title: 'Aguadulce Express', 
                body: event.data.text() 
            };
        }
    }
    
    const options = {
        body: data.body || '📦 Tienes un nuevo pedido para repartir',
        icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        vibrate: [200, 100, 200],
        data: { 
            url: '/AGUADULCE_EXPRESS_APP/v2/reparto/index.html' 
        },
        actions: [
            {
                action: 'open',
                title: '📦 Ver pedido'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || 'Aguadulce Express - Nuevo Pedido', 
            options
        )
    );
});

// ⭐ CUANDO EL USUARIO HACE CLIC EN LA NOTIFICACIÓN
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/AGUADULCE_EXPRESS_APP/v2/reparto/index.html')
    );
});
