// sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  // Simple fetch interceptor to satisfy PWA requirements
  // We bypass the cache and fetch from network to ensure it's always up to date
  event.respondWith(fetch(event.request));
});
