// ============================================
// FIREBASE MESSAGING SERVICE WORKER
// ============================================

// Importar la configuración de Firebase
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (la misma que usas en la app)
firebase.initializeApp({
    apiKey: "AIzaSyBEapmpody3y_vFyPF0ngUnCn5ZFOtxPjs",
    authDomain: "aguadulce-express-v2.firebaseapp.com",
    databaseURL: "https://aguadulce-express-v2-default-rtdb.firebaseio.com",
    projectId: "aguadulce-express-v2",
    storageBucket: "aguadulce-express-v2.appspot.com",
    messagingSenderId: "103953800507",
    appId: "1:103953800507:web:tu_app_id"
});

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// ============================================
// MANEJAR MENSAJES EN BACKGROUND
// ============================================
messaging.onBackgroundMessage((payload) => {
    console.log('📨 Mensaje en background:', payload);

    // Personalizar la notificación
    const notificationTitle = payload.notification?.title || '📦 Nuevo Pedido';
    const notificationOptions = {
        body: payload.notification?.body || 'Hay un nuevo pedido disponible',
        icon: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
        badge: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
        vibrate: [200, 100, 200, 100, 200],
        data: payload.data || {},
        actions: [
            { action: 'abrir', title: '📋 Ver pedido' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================
// MANEJAR CLIC EN NOTIFICACIÓN
// ============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/AGUADULCE_EXPRESS_APP/reparto/index.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

console.log('✅ Firebase Messaging Service Worker registrado');
