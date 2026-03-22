const BW_SW_VERSION = '20260322_ghclean1';
const BW_CACHE = `kedrix-cache-${BW_SW_VERSION}`;
const BW_CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './license-system.js',
  './tracking.js',
  './guided-activation.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/favicon-16.png',
  './assets/favicon-32.png',
  './assets/modern-logo-kedrix-pfe.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(BW_CACHE)
      .then((cache) => cache.addAll(BW_CORE_ASSETS))
      .catch((err) => {
        console.warn('[Kedrix SW] Precaching parziale fallito:', err);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('kedrix-cache-') && key !== BW_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({ type: 'BW_SW_ACTIVATED', version: BW_SW_VERSION });
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(BW_CACHE);
        cache.put('./index.html', networkResponse.clone());
        return networkResponse;
      } catch {
        const cachedResponse = await caches.match('./index.html');
        return cachedResponse || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request, { ignoreSearch: false });
    if (cachedResponse) return cachedResponse;

    try {
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.ok && !url.pathname.endsWith('.map')) {
        const cache = await caches.open(BW_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch {
      const fallbackResponse = await caches.match(url.pathname, { ignoreSearch: true });
      return fallbackResponse || Response.error();
    }
  })());
});
