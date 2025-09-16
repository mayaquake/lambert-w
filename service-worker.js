const CACHE_NAME = "hello-pwa-dynamic-v1";

// Install – inget särskilt behövs, vi fyller på cache vid fetch
self.addEventListener("install", event => {
  self.skipWaiting();
});

// Activate – rensa gamla cacher
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

// Fetch – cache first, annars nätet
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Returnera från cache om den finns
        return cachedResponse;
      }
      // Annars hämta från nätet och lägg i cache
      return fetch(event.request).then(networkResponse => {
        // Endast cacha giltiga svar (status 200, typ basic = samma origin)
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Här kan du lägga en offline-fallback-sida om du vill
      });
    })
  );
});