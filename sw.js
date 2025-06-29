const CACHE_NAME = "zooom-pwa-v1";
const urlsToCache = [
  "/zooom/index.html",
  "/zooom/login.html",
  "/zooom/register.html",
  "/zooom/post.html",
  "/zooom/thread.html",
  "/zooom/profile.html",
  "/zooom/explore.html",
  "/zooom/explore-users.html",
  "/zooom/notifications.html",
  "/zooom/settings.html",
  "/zooom/js/supabase.js",
  "/zooom/js/main.js",
  "/zooom/js/feed.js",
  "/zooom/js/auth.js",
  "/zooom/js/register.js",
  "/zooom/js/post.js",
  "/zooom/js/profile.js",
  "/zooom/js/thread.js",
  "/zooom/css/main.css",
  "/zooom/css/feed.css",
  "/zooom/css/auth.css",
  "/zooom/css/profile.css",
  "/zooom/css/reply-card.css",
  "/zooom/components/navbar.html",
  "/zooom/components/thread-card.html",
  "/zooom/components/reply-card.html",
  "/zooom/components/thread-actions.html",
  "/zooom/components/notification.html",
  "/zooom/assets/logo.png",
  "/zooom/assets/avatar.png"
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached file or fetch from network
      return response || fetch(event.request);
    })
  );
});
