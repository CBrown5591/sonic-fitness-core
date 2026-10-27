const CACHE_NAME = 'sonic-fitness-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/audio/level_up.mp3',
  './assets/audio/sa2_clear.mp3',
  './assets/audio/genesis_clear.mp3'
];

self.addEventListener('install', (e) => {
  // Force active immediately on install
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets for', CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[SW] Non-critical asset cache skip:', err);
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  // Purge any outdated caches immediately
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for app.js and index.html so code updates show instantly!
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // If requesting app.js, styles.css, or HTML, try network first
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for audio & images
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
