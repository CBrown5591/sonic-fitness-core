const CACHE_NAME = 'sonic-fitness-v15';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];
const OPTIONAL_ASSETS = [
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/audio/level_up.mp3',
  './assets/audio/sa2_clear.mp3',
  './assets/audio/genesis_clear.mp3'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Initializing cache for', CACHE_NAME);
      // Cache core assets gracefully (won't throw if one is missing)
      const allAssets = [...CORE_ASSETS, ...OPTIONAL_ASSETS];
      await Promise.allSettled(
        allAssets.map(url => 
          cache.add(url).catch(err => {
            console.warn('[SW] Non-critical asset cache skip:', url);
          })
        )
      );
    })
  );
});

self.addEventListener('activate', (e) => {
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

// Network-first for app code (HTML, JS, CSS) so updates appear immediately
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

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

  // Cache-first for images, fonts, and audio
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => null);
    })
  );
});
