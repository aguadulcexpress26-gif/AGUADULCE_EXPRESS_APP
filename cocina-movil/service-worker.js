const CACHE_NAME = 'aguadulce-cocina-v1';
const urlsToCache = [
    '/AGUADULCE_EXPRESS_APP/cocina-movil/index.html',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions-compat.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', event => {
    console.log('🔄 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Archivos cacheados');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('✅ Service Worker activado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        console.log(`🧹 Eliminando cache antiguo: ${name}`);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en cache, devolverlo
                if (response) {
                    return response;
                }
                // Si no, buscar en la red
                return fetch(event.request).catch(() => {
                    // Si falla la red, mostrar página offline
                    if (event.request.mode === 'navigate') {
                        return caches.match('/AGUADULCE_EXPRESS_APP/cocina-movil/index.html');
                    }
                });
            })
    );
});
