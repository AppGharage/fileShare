const cacheName = 'fileShare';
const cacheVersion = `${cacheName}::1.2.0`;

const cachedFiles = [
    '/',
    '/css/styles.css',
    'images/bg.png',
    'js/custom-file-input.js'
];

//Variables to hold Network files
const networkFiles = [
];

//Installing Service Worker
self.addEventListener('install', event => {
    console.log('[pwa install]');
    event.waitUntil(
        //Open Cache and all URLS to cache
        caches.open(cacheVersion)
            .then(cache => cache.addAll(cachedFiles))
    );
});

//Activating Service Worker
self.addEventListener('activate', event => {
    console.log('[pwa activate]');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key.indexOf(cacheName) === 0 && key !== cacheVersion)
                    .map(key => caches.delete(key))
            )
        )
    );
    return self.clients.claim();
});

//Fetch from cache or network
self.addEventListener('fetch', event => {
    //Fetch Network first, then cache
    if (networkFiles.filter(item => event.request.url.match(item)).length) {
        console.log('[network fetch]', event.request.url);
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    } else {
        console.log('[pwa fetch]', event.request.url);
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    caches.open(cacheVersion).then(cache => cache.add(event.request.url));
                    return response || fetch(event.request);
                })
        );
    }
});