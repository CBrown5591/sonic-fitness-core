/**
 * SONIC FITNESS HUD // SERVICE WORKER (NETWORK-FIRST ENGINE)
 * Only caches heavy static assets (MP3 audio and PNG icons).
 * HTML, CSS, and JS are ALWAYS fetched live over the network so you never get stuck on stale code.
 */

const CACHE_NAME = 'sonic-media-v17';
const MEDIA_ASSETS = [
  './assets/audio/sa2_clear.mp3',
  './assets/audio/genesis_clear.mp3',
  './assets/audio/level_up.mp3',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static audio and icon assets.');
      return cache.addAll(MEDIA_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // 1. Audio and Icons: Cache-First for instant playback and offline display
  if (url.includes('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // 2. Apps Script API Webhook: Direct Network Pass-Through
  if (url.includes('script.google.com')) {
    event.respondWith(fetch(req));
    return;
  }

  // 3. App Code (index.html, styles.css, app.js, manifest.json):
  // ALWAYS Network-First! Fetch latest code from GitHub, fall back to cache only if strictly offline.
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      })
      .catch(() => caches.match(req) || caches.match('./index.html'))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
