const CACHE_NAME = "sav-cache-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/historique.html",
  "/fiche.html",
  "/stock.html",
  "/styles/main.css",
  "/styles/components.css",
  "/styles/sav.css",
  "/scripts/firebase-config.js",
  "/scripts/sav-create.js",
  "/scripts/sav-historique.js",
  "/scripts/sav-fiche.js",
  "/scripts/sav-stock.js",
  "/scripts/sav-pdf.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-1024.png"
];

// INSTALLATION DU CACHE
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATION
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => k !== CACHE_NAME && caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// STRATEGIE : NETWORK FIRST + FALLBACK CACHE
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Réseau OK → met à jour le cache
        cachePut(event.request, response.clone());
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

async function cachePut(request, response) {
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response);
}
