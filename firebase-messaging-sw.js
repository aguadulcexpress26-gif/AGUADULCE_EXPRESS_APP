// ============================================
// FIREBASE MESSAGING SERVICE WORKER - NUEVO
// UBICACIÓN: /firebase-messaging-sw-nuevo.js (RAÍZ)
// PROYECTO: aguadulce-express-v2
// ============================================

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 🔥 CONFIGURACIÓN CORRECTA DEL PROYECTO ACTUAL
const firebaseConfig = {
    apiKey: "AIzaSyBEapmpody3y_vFyPF0ngUnCn5ZFOtxPjs",
    authDomain: "aguadulce-express-v2.firebaseapp.com",
    databaseURL: "https://aguadulce-express-v2-default-rtdb.firebaseio.com",
    projectId: "aguadulce-express-v2",
    storageBucket: "aguadulce-express-v2.appspot.com",
    messagingSenderId: "103953800507",
    appId: "1:103953800507:web:tu_app_id"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ============================================
// MANEJAR MENSAJES EN BACKGROUND
// ============================================
messaging.onBackgroundMessage((payload) => {
    console.log('📨 Mensaje en background:', payload);

    const notificationTitle = payload.notification?.title || '📦 Nuevo Pedido';
    const notificationOptions = {
        body: payload.notification?.body || 'Hay un nuevo pedido disponible',
        icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
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
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

console.log('✅ Firebase Messaging Service Worker NUEVO registrado correctamente');
