var CACHE_STATIC_NAME = 'static-v11';
var CACHE_DYNAMIC_NAME = 'dynamic-v3';

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/aboutus.css',
                    'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
                ]);
            })
    )
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                    console.log('[Service Worker] Removing old cache.', key);
                    return caches.delete(key);
                    }
                }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request)
            .then(function(res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                })
            })
            .catch(function(err) {
                return caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        return response;
                    } else {
                        return caches.open(CACHE_STATIC_NAME)
                        .then(function(cache) {
                            if (event.request.headers.get('accept').includes('text/html')) {
                                return cache.match('/offline.html');
                            }
                        });
                    }
                });
            })
    );
});