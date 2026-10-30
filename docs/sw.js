// -------------------------------------------------------------
// SERVICE WORKER // CACHE & OFFLINE RUNTIME (MODULAR ES6 BUILD)
// -------------------------------------------------------------

const CACHE_NAME = 'sonic-fitness-v17-esm';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  // Root ES6 Module
  './js/app.js',
  // Data Catalogs
  './js/data/stages.js',
  './js/data/cardioConfigs.js',
  './js/data/movementIntel.js',
  './js/data/artifacts.js',
  // Calculation & Telemetry Engines
  './js/engine/calc.js',
  './js/engine/autoReg.js',
  './js/engine/flightPath.js',
  './js/engine/records.js',
  // Core Subsystems
  './js/core/audio.js',
  './js/core/timer.js',
  './js/core/sync.js',
  // UI Components
  './js/ui/renderHud.js',
  './js/ui/renderArtifacts.js',
  './js/ui/renderVault.js',
  './js/ui/auditModal.js',
  './js/ui/resultsOverlay.js',
  // Audio Assets
  './assets/audio/sa2_clear.mp3',
  './assets/audio/genesis_clear.mp3',
  './assets/audio/level_up.mp3',
  // Icons
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Pre-caching ES6 modular assets...');
      const results = await Promise.allSettled(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            await cache.put(url, response);
          } catch (err) {
            console.warn(`[ServiceWorker] Failed to cache asset: ${url}`, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass Google Apps Script webhook calls directly to network
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
