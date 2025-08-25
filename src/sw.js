// A unique name for the cache, updated to trigger a refresh when the service worker changes.
const CACHE_NAME = 'apr-shell-v7'; 
const DATA_CACHE = 'apr-data-v2';

// Core assets that make up the app's shell. All HTML pages are included for the router.
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/plan.html',
  '/visa.html',
  '/documents.html',
  '/contact.html',
  '/css/style.css',
  '/js/main.js',
  '/js/router.js',
  '/js/ui.js'
];

// On install, pre-cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching all required shell assets');
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// On activation, clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (![CACHE_NAME, DATA_CACHE].includes(k)) {
            return caches.delete(k);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Intercept fetch requests to implement caching strategies.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore requests to external domains.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Strategy 1: Stale-while-revalidate for data files.
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkResponsePromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) cache.put(request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || networkResponsePromise;
      })
    );
    return;
  }

  // Strategy 2: For direct navigation, always serve the main app shell.
  // The client-side router will handle rendering the correct page.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(response => {
        return response || fetch('/index.html');
      })
    );
    return;
  }

  // Strategy 3: Cache-first for all other assets (CSS, JS, images, and HTML partials requested by the router).
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request);
    })
  );
});