const CACHE_NAME = 'apr-shell-v1';
const DATA_CACHE = 'apr-data-v1';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/router.js',
  '/js/ui.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (![CACHE_NAME, DATA_CACHE].includes(k)) return caches.delete(k);
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/data/')) {
    // Stale-while-revalidate for JSON
    event.respondWith((async () => {
      const cache = await caches.open(DATA_CACHE);
      const cached = await cache.match(event.request);
      const networkPromise = fetch(event.request).then(res => {
        if (res && res.status === 200) cache.put(event.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || networkPromise;
    })());
    return;
  }
  // Cache-first for shell
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
