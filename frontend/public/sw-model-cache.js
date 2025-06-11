// Service worker placeholder
// Since we use ml-service for model hosting, we don't need model caching
console.log('Service worker loaded - but model caching is handled by ml-service');

// Respond to any requests with empty response
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests normally
  return;
});

self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(self.clients.claim());
});
