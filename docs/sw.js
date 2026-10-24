  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html') || caches.match('./'))
    );
    return;
  }

  if (req.url.includes('/api/') || req.url.includes('script.google.com')) {
    event.respondWith(
      fetch(req).catch(() => new Response(
        JSON.stringify({ offline: true, message: 'Offline mode active.' }),
        { headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return res;
      }).catch(() => caches.match(req));
    })
  );
});
