const CACHE_NAME = 'barcode-v1';
const urlsToCache = [
    '/-cameratest/',
    '/-cameratest/index.html',
    '/-cameratest/app.js',
    '/-cameratest/manifest.json',
    '/-cameratest/icon-192.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => 
            response || fetch(event.request)
        )
    );
});
