// firebase-sw-v4.js
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

// 🔥 SONIDOS DISPONIBLES - Cambia la URL por el que quieras
const SONIDOS = {
    'alerta': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    'timbre': 'https://actions.google.com/sound/bar/office-door-bell.mp3',
    'campana': 'https://www.soundjay.com/misc/sounds/electric-bell-01.mp3',
    'default': 'default'  // Sonido por defecto del móvil
};

// 🔥 CAMBIA AQUÍ EL SONIDO QUE QUIERES USAR
const SONIDO_SELECCIONADO = 'default'; // Opciones: 'alerta', 'timbre', 'campana', 'default'

function playRepeatingSound() {
    if (soundInterval) clearInterval(soundInterval);
    
    const playSound = () => {
        if (SONIDO_SELECCIONADO === 'default') {
            // Sonido por defecto del móvil (no requiere URL)
            console.log('Usando sonido por defecto del móvil');
        } else {
            const audio = new Audio(SONIDOS[SONIDO_SELECCIONADO]);
            audio.volume = 1.0;
            audio.play().catch(e => console.log('Error:', e));
        }
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

// También hacer vibrar el móvil
function vibrarMovil() {
    if (navigator.vibrate) {
        navigator.vibrate([500, 300, 500, 300, 500]);
    }
}

messaging.onBackgroundMessage((payload) => {
    console.log('📱 Notificación en background:', payload);
    
    const notificationTitle = payload.notification?.title || 'Aguadulce Express';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes un nuevo pedido asignado',
        icon: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        badge: 'https://i.postimg.cc/JzmCWWG3/MOTO-LOGO.webp',
        vibrate: [500, 300, 500, 300, 500],
        requireInteraction: true,
        priority: 'high',
        tag: 'nuevo-pedido',
        renotify: true
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => {
            playRepeatingSound();
            vibrarMovil();
        })
        .catch(err => console.log('Error:', err));
});

self.addEventListener('notificationclick', (event) => {
    if (soundInterval) {
        clearInterval(soundInterval);
        soundInterval = null;
    }
    event.notification.close();
    event.waitUntil(clients.openWindow('/AGUADULCE_EXPRESS_APP/reparto/reparto.html'));
});
