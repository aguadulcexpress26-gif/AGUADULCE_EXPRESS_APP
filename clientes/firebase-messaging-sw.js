// ============================================================
// 🔔 FIREBASE MESSAGING SERVICE WORKER
// ============================================================
// Maneja las notificaciones push del cliente cuando la app
// está cerrada o en segundo plano.
// ============================================================

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDw-EdjMC5S2nQTR3ownQBlHx2AcHZBy0A",
    authDomain: "aguadulce-express-v2.firebaseapp.com",
    databaseURL: "https://aguadulce-express-v2-default-rtdb.firebaseio.com",
    projectId: "aguadulce-express-v2",
    storageBucket: "aguadulce-express-v2.firebasestorage.app",
    messagingSenderId: "897110914130",
    appId: "1:897110914130:web:9289bbc7a1a1b34205b8b"
});

const messaging = firebase.messaging();

// ============================================================
// 📩 NOTIFICACIONES EN BACKGROUND (app cerrada / segundo plano)
// ============================================================
messaging.onBackgroundMessage((payload) => {
    console.log('📩 Notificación en background:', payload);
    
    const data = payload.data || {};
    const estado = data.estado || '';
    
    // Configurar según el estado
    let config;
    
    if (estado === 'EN_PUERTA') {
        // 🔔 Repartidor en la puerta — MÁXIMA PRIORIDAD
        config = {
            title: payload.notification?.title || '🔔 ¡El repartidor está en tu puerta!',
            body: payload.notification?.body || 'Sal a recibir tu pedido',
            vibrate: [300, 100, 300, 100, 300, 100, 300],
            requireInteraction: true,  // No desaparece hasta que la toque
            tag: `pedido-puerta-${data.pedidoId || Date.now()}`  // Único para que no se solapen
        };
    } else if (estado === 'EN_REPARTO') {
        // 🛵 Pedido en camino — prioridad normal
        config = {
            title: payload.notification?.title || '🛵 Tu pedido va en camino',
            body: payload.notification?.body || 'El repartidor se dirige a tu dirección',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            tag: `pedido-reparto-${data.pedidoId || Date.now()}`
        };
    } else {
        // Otros tipos (billetera, etc.)
        config = {
            title: payload.notification?.title || '🔔 Aguadulce Express',
            body: payload.notification?.body || 'Tienes una notificación',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            tag: `general-${Date.now()}`
        };
    }
    
    const notificationOptions = {
        body: config.body,
        icon: payload.notification?.icon || 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
        badge: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
        vibrate: config.vibrate,
        requireInteraction: config.requireInteraction,
        tag: config.tag,
        data: {
            url: 'https://aguadulce-express.com/clientes/ventas.html',
            pedidoId: data.pedidoId || '',
            estado: estado,
            tipo: data.tipo || ''
        },
        actions: estado === 'EN_PUERTA' ? [
            { action: 'abrir', title: '👁️ Ver pedido' },
            { action: 'cerrar', title: '✖️ Cerrar' }
        ] : [
            { action: 'abrir', title: '👁️ Ver pedido' }
        ]
    };
    
    return self.registration.showNotification(config.title, notificationOptions);
});

// ============================================================
// 👆 CLICK EN LA NOTIFICACIÓN → ABRIR LA APP
// ============================================================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Click en notificación:', event.notification.tag);
    
    event.notification.close();
    
    // Si pulsó "cerrar", no abrir nada
    if (event.action === 'cerrar') {
        return;
    }
    
    // URL a abrir
    const urlToOpen = event.notification.data?.url || 'https://aguadulce-express.com/clientes/ventas.html';
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        }).then((clientList) => {
            // Si la app ya está abierta, enfocarla
            for (const client of clientList) {
                if (client.url.includes('aguadulce-express.com') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no, abrir una nueva pestaña/ventana
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// ============================================================
// 🧹 LIMPIAR NOTIFICACIONES ANTIGUAS AL CERRAR
// ============================================================
self.addEventListener('notificationclose', (event) => {
    console.log('🗑️ Notificación cerrada:', event.notification.tag);
});
