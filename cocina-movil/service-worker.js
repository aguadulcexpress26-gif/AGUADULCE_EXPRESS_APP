const CACHE_NAME = 'aguadulce-cocina-v3';

// ✅ SOLO archivos locales (sin CDNs externos)
const urlsToCache = [
    '/cocina-movil/',
    '/cocina-movil/index.html',
    '/cocina-movil/manifest.json'
];

self.addEventListener('install', event => {
    console.log('🔄 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Archivos cacheados');
                // ✅ Si algún archivo falla, no rompe el SW
                return Promise.allSettled(
                    urlsToCache.map(url => 
                        cache.add(url).catch(err => 
                            console.warn(`⚠️ No se pudo cachear: ${url}`, err.message)
                        )
                    )
                );
            })
            .then(() => self.skipWaiting())
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
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('/cocina-movil/index.html');
                    }
                });
            })
    );
});
