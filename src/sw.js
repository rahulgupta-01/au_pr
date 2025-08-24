const CACHE_NAME = 'apr-shell-v2';
const DATA_CACHE = 'apr-data-v1';

const SHELL_ASSETS = [
  '/css/style.css',
  '/js/main.js',
  '/js/router.js',
  '/js/ui.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (![CACHE_NAME, DATA_CACHE].includes(k)) return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/data/')) {
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
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
