// firebase-sw-v2.js - Service Worker para notificaciones push con sonido (v2)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCJcLQ0ikUwZSV7L_8mLLax8B5qnhP0Roc",
    authDomain: "aguadulce-notificaciones.firebaseapp.com",
    databaseURL: "https://aguadulce-notificaciones-default-rtdb.firebaseio.com",
    projectId: "aguadulce-notificaciones",
    storageBucket: "aguadulce-notificaciones.firebasestorage.app",
    messagingSenderId: "153627815909",
    appId: "1:940283725281:web:3b388d2e7f362a99d2bea0"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

let soundInterval = null;

const SONIDO_URL = 'https://raw.githubusercontent.com/aguadulcexpress26-gif/AGUADULCE_EXPRESS_APP/main/sonidorepartidoraguadulceexpress.mp3';

function playRepeatingSound() {
    if (soundInterval) clearInterval(soundInterval);
    
    const playSound = () => {
        const audio = new Audio(SONIDO_URL);
        audio.volume = 1.0;
        audio.play().catch(e => console.log('Error:', e));
    };
    
    playSound();
    let repeticiones = 0;
    soundInterval = setInterval(() => {
        repeticiones++;
        if (repeticiones >= 5) {
            clearInterval(soundInterval);
            soundInterval = null;
        } else {
            playSound();
        }
    }, 2000);
    
    setTimeout(() => {
        if (soundInterval) {
            clearInterval(soundInterval);
            soundInterval = null;
        }
    }, 11000);
}

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'Aguadulce Express';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes un nuevo pedido asignado',
        icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        vibrate: [500, 300, 500, 300, 500, 300, 1000],
        requireInteraction: true,
        priority: 'high',
        tag: 'nuevo-pedido',
        renotify: true
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => playRepeatingSound())
        .catch(err => console.log('Error:', err));
});

messaging.onMessage((payload) => {
    playRepeatingSound();
    const notificationTitle = payload.notification?.title || 'Aguadulce Express';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes un nuevo pedido asignado',
        icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        vibrate: [500, 300, 500, 300, 500, 300, 1000],
        requireInteraction: true
    };
    self.registration.showNotification(notificationTitle, notificationOptions).catch(e => console.log);
});

self.addEventListener('notificationclick', (event) => {
    if (soundInterval) {
        clearInterval(soundInterval);
        soundInterval = null;
    }
    event.notification.close();
    event.waitUntil(clients.openWindow('/AGUADULCE_EXPRESS_APP/reparto/reparto.html'));
});
