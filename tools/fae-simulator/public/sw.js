const CACHE = "__CACHE__";
const PREFIX = "__PREFIX__";
const BASE = "__BASE__";
const ASSETS = __ASSETS__;
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin ||
    !new URL(event.request.url).pathname.startsWith(BASE)
  )
    return;
  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(event.request, { ignoreVary: true }))
      .then(
        (cached) =>
          cached ||
          fetch(event.request).catch((error) => {
            if (event.request.mode === "navigate")
              return caches.match(`${BASE}index.html`);
            throw error;
          }),
      ),
  );
});
