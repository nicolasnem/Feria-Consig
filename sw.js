const CACHE_NAME = 'feria-consig-v1';
const urlsToCache = [
  './index_seguro.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});