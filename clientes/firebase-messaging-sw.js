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

messaging.onBackgroundMessage((payload) => {
    console.log('📩 Notificación en background:', payload);
    const { title, body, icon } = payload.notification || {};
    self.registration.showNotification(title || '🔔 Aguadulce Express', {
        body: body || 'Tienes una notificación',
        icon: icon || 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
        badge: 'https://i.postimg.cc/cCv7qsHf/IMAGEN-PNG-512.jpg',
        vibrate: [300, 100, 300],
        requireInteraction: true
    });
});
