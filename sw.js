// Service Worker para Feria-Consig PWA
const CACHE_NAME = 'feria-consig-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar: guardar archivos en cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Feria-Consig: Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(function(err) {
        console.log('Feria-Consig: Error al cachear', err);
      })
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejas y tomar control
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: estrategia "Network First" para datos, "Cache First" para archivos estáticos
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);

  // Si es una petición a Supabase (API), siempre ir a la red
  if (requestUrl.hostname.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para archivos estáticos: cache primero, red como fallback
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(function(networkResponse) {
            // No cachear peticiones de API o datos dinámicos
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Cachear respuesta nueva
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(function() {
            // Si falla la red y no está en cache, servir index.html
            // Esto es clave para que funcione la PWA instalada
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
