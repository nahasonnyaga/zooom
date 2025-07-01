self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('zooom-v1').then(cache => cache.addAll([
      '/',
      '/index.html',
      '/css/main.css',
      '/js/main.js',
      // Add more assets here
    ]))
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
