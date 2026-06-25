const CACHE_NAME = 'muthubalan-pwa-v5';

// ===== INSTALL =====
self.addEventListener('install', event => {
  self.skipWaiting();
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => 
      Promise.all(names.map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// ===== FETCH =====
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 1. HTML files - ALWAYS network first (fresh content)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          // Update cache with fresh HTML
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // 2. Images, CSS, JS - Cache first (speed)
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Return cached immediately for speed
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Update cache in background
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => cached); // Offline fallback
      
      return cached || fetchPromise;
    })
  );
});
