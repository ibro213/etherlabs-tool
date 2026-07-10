// EtherLabs Tools — Service Worker
var CACHE_NAME = 'etherlabs-v26';
var BASE = '/etherlabs-tool/';
var SHELLS = [
  "", "divisore-spese/", "en/divisore-spese/",
  "calcolatore-debiti/", "en/calcolatore-debiti/",
  "calcolatore-fire/", "en/calcolatore-fire/",
  "calcolatore-mutuo/", "en/calcolatore-mutuo/",
  "calcolatore-stipendio/", "en/calcolatore-stipendio/",
  "calcolatore-tariffa/", "en/calcolatore-tariffa/",
  "cv-builder/", "en/cv-builder/",
  "generatore-contratti/", "en/generatore-contratti/",
  "generatore-fatture/", "en/generatore-fatture/",
  "generatore-firma/", "en/generatore-firma/",
  "generatore-password/", "en/generatore-password/",
  "generatore-preventivi/", "en/generatore-preventivi/",
  "matrice-eisenhower/", "en/matrice-eisenhower/",
  "budget-matrimonio/", "en/budget-matrimonio/",
  "pomodoro-timer/", "en/pomodoro-timer/",
  "side-hustle/", "en/side-hustle/",
  "tracker-risparmio/", "en/tracker-risparmio/"
].map(function(s) { return BASE + s; });
// precache anche manifest + icone (installabilita' offline reale)
var ASSETS = [
  BASE + "manifest.json",
  BASE + "assets/icons/icon-192.png",
  BASE + "assets/icons/icon-512.png"
];

// install: cache resiliente (un 404 non fa fallire tutto l'install)
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(SHELLS.concat(ASSETS).map(function(url) {
        return cache.add(url).catch(function() { /* ignora singolo asset mancante */ });
      }));
    })
  );
  self.skipWaiting();
});

// activate: elimina le cache vecchie
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; })
                            .map(function(n) { return caches.delete(n); }));
  }).then(function() { return self.clients.claim(); }));
});

// fetch: solo GET same-origin; niente fallback-homepage sugli asset
self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;                       // POST/PUT ecc: passa al browser
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // risorse esterne: non intercettare

  // Navigazioni (apertura pagina): cache-first, poi rete, poi shell del tool, infine home
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then(function(cached) {
        return cached || fetch(req).then(function(resp) {
          if (resp && resp.status === 200) {
            var c = resp.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(req, c); });
          }
          return resp;
        }).catch(function() {
          // offline e pagina non in cache: ripiega sulla directory-shell del tool, non su una pagina a caso
          return caches.match(url.pathname.replace(/[^/]*$/, '')) ||
                 caches.match(BASE);
        });
      })
    );
    return;
  }

  // Asset (icone/manifest): cache-first, nessun fallback-home in caso di errore
  event.respondWith(
    caches.match(req).then(function(cached) {
      return cached || fetch(req).then(function(resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var c = resp.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(req, c); });
        }
        return resp;
      });
    })
  );
});
