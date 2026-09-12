const CACHE_NAME = 'lifta-app-shell-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

/**
 * The document is the only file that names the current build's hashed assets,
 * so it must come from the network whenever the network is available.
 * Serving it cache-first pinned users to an old bundle forever: the app looked
 * "not updated" even after a reload. Hashed assets stay cache-first because a
 * new build produces new filenames.
 */
const isDocumentRequest = (request) => {
  if (request.mode === 'navigate') return true;
  const url = new URL(request.url);
  return url.pathname === '/' || url.pathname.endsWith('/index.html');
};

const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const copy = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, copy);
    }
    return networkResponse;
  } catch {
    const cached = (await caches.match(request)) ?? (await caches.match('/index.html'));
    return cached ?? new Response('Offline', { status: 503, statusText: 'Offline' });
  }
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) {
    // Refresh in the background for the next visit.
    fetch(request)
      .then(async (networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse);
        }
      })
      .catch(() => {
        // Offline: keep the cached copy.
      });
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const copy = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, copy);
    }
    return networkResponse;
  } catch {
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Avoid caching non-GET or cross-origin requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    isDocumentRequest(event.request) ? networkFirst(event.request) : cacheFirst(event.request)
  );
});
