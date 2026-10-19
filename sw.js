// sw.js - Service Worker con Precaché e Intercepción (Versión 2)
const CACHE_NAME = 'devconnect-shell-v3';

// Lista de recursos estáticos esenciales del proyecto
const STATIC_ASSETS = [
    '/',
    '/index.html', // <--- CAMBIA '/src/index.html' POR '/index.html'
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    '/images/im192.png',
    '/images/im512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// FASE DE INSTALACIÓN: Guardando recursos de forma segura (aislando errores)
self.addEventListener('install', event => {
    console.log('SW: Instalando y precacheando recursos...');

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(async cache => {
            console.log('SW: Caché abierta:', CACHE_NAME);

            // Iteramos uno por uno para registrar éxitos y aislar errores individuales
            for (let asset of STATIC_ASSETS) {
                try {
                    await cache.add(asset);
                    console.log('✅ Archivo guardado con éxito:', asset);
                } catch (err) {
                    console.error('❌ Error al guardar el archivo:', asset, err);
                }
            }
        })
        .then(() => {
            console.log('SW: Proceso de instalación finalizado.');
            return self.skipWaiting();
        })
    );
});

// FASE DE ACTIVACIÓN: Limpieza de versiones de caché antiguas y toma de control
self.addEventListener('activate', event => {
    console.log('SW: Activado y listo.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Borrando caché obsoleta:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// FASE FETCH: Estrategia Cache First (Caché primero con respaldo en Red)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(responseInCache => {
            // Si se encuentra en caché, lo devolvemos directamente
            if (responseInCache) {
                console.log('SW: Sirviendo desde Caché ->', event.request.url);
                return responseInCache;
            }

            // Si no está en caché, lo buscamos en la red
            console.log('SW: No está en caché. Buscando en Red ->', event.request.url);
            return fetch(event.request);
        })
        .catch(error => {
            console.error('SW: Error en fetch y recurso no disponible:', error);
        })
    );
});