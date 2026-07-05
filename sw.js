// EtherLabs Tools — Service Worker v11
var CACHE_NAME = 'etherlabs-v13';
var URLS_TO_CACHE = [
  "/etherlabs-tool/",
  "/etherlabs-tool/divisore-spese/",
  "/etherlabs-tool/en/divisore-spese/",
  "/etherlabs-tool/calcolatore-debiti/",
  "/etherlabs-tool/en/calcolatore-debiti/",
  "/etherlabs-tool/calcolatore-fire/",
  "/etherlabs-tool/en/calcolatore-fire/",
  "/etherlabs-tool/calcolatore-mutuo/",
  "/etherlabs-tool/en/calcolatore-mutuo/",
  "/etherlabs-tool/calcolatore-stipendio/",
  "/etherlabs-tool/en/calcolatore-stipendio/",
  "/etherlabs-tool/calcolatore-tariffa/",
  "/etherlabs-tool/en/calcolatore-tariffa/",
  "/etherlabs-tool/cv-builder/",
  "/etherlabs-tool/en/cv-builder/",
  "/etherlabs-tool/generatore-contratti/",
  "/etherlabs-tool/en/generatore-contratti/",
  "/etherlabs-tool/generatore-fatture/",
  "/etherlabs-tool/en/generatore-fatture/",
  "/etherlabs-tool/generatore-firma/",
  "/etherlabs-tool/en/generatore-firma/",
  "/etherlabs-tool/generatore-password/",
  "/etherlabs-tool/en/generatore-password/",
  "/etherlabs-tool/generatore-preventivi/",
  "/etherlabs-tool/en/generatore-preventivi/",
  "/etherlabs-tool/matrice-eisenhower/",
  "/etherlabs-tool/en/matrice-eisenhower/",
  "/etherlabs-tool/budget-matrimonio/",
  "/etherlabs-tool/en/budget-matrimonio/",
  "/etherlabs-tool/pomodoro-timer/",
  "/etherlabs-tool/en/pomodoro-timer/",
  "/etherlabs-tool/side-hustle/",
  "/etherlabs-tool/en/side-hustle/",
  "/etherlabs-tool/tracker-risparmio/",
  "/etherlabs-tool/en/tracker-risparmio/"
];

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(URLS_TO_CACHE); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        if (response.status === 200) { var c = response.clone(); caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, c); }); }
        return response;
      });
    }).catch(function() { return caches.match('/etherlabs-tool/'); })
  );
});
