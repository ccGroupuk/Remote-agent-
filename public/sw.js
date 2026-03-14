const CACHE_NAME = 'adr-shell-v2'; // Bumped version to force activation

self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Nuke old caches
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all open pages immediately
    );
});

self.addEventListener('fetch', (e) => {
    // Network First Strategy for everything to prevent aggressive stale caching crashes
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
