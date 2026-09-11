const CACHE = 'zac-app-v6';
const ASSETS = ['./', './index.html', './schedule.html', './bells.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(ASSETS.map((url) =>
        fetch(url, { cache: 'reload' }).then((res) => cache.put(url, res)).catch(() => {})
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests (the app shell). External links (zac.org.ua) go straight to network.
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  // Network-first: always try to get the latest version. Only fall back to
  // the cached copy if the network is unavailable (offline).
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
