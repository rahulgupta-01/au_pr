const CACHE_NAME = 'apr-shell-v3'; // Version bumped to v3
const DATA_CACHE = 'apr-data-v1';

const SHELL_ASSETS = [
  '/css/style.css',
  '/js/main.js',
  '/js/router.js',
  '/js/ui.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting(); // Force the new service worker to activate immediately
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

  // If the request is for an external domain, ignore it and let the browser handle it.
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Stale-while-revalidate for data files
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

  // Network-first for HTML pages to avoid caching the shell
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html'))); // We'd need an offline.html for this to be perfect, but for now, just fetching is fine.
    return;
  }
  
  // Cache-first for all other assets from our own domain
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});