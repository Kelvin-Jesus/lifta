const CACHE_NAME = 'lifta-app-shell-v2';

/**
 * Exercise animations are hosted off-origin. They live in their own cache so
 * an app-shell upgrade never throws away ~23 MB the user already downloaded
 * for offline use (see src/storage/offlineMedia.ts).
 */
const MEDIA_CACHE_NAME = 'lifta-media-v1';
const MEDIA_HOSTS = ['raw.githubusercontent.com'];

const getScopePath = () => {
  try {
    if (self.registration && self.registration.scope) {
      const p = new URL(self.registration.scope).pathname;
      return p.endsWith('/') ? p : p + '/';
    }
  } catch {}
  return '/';
};

const BASE = getScopePath();

const STATIC_ASSETS = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icon-192.svg`,
  `${BASE}icon-512.svg`,
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
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== MEDIA_CACHE_NAME)
            .map((key) => caches.delete(key))
        )
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
  const baseWithoutSlash = BASE.endsWith('/') && BASE.length > 1 ? BASE.slice(0, -1) : BASE;
  return (
    url.pathname === '/' ||
    url.pathname === BASE ||
    url.pathname === baseWithoutSlash ||
    url.pathname.endsWith('/index.html')
  );
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
    const cached =
      (await caches.match(request)) ??
      (await caches.match(`${BASE}index.html`)) ??
      (await caches.match('/index.html'));
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
      const fallback =
        (await caches.match(`${BASE}index.html`)) ??
        (await caches.match('/index.html'));
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
};

/**
 * Exercise animations: cache-first against the media cache and stored on the
 * way through, so browsing the catalogue online is enough to make those
 * animations available in the gym with no signal.
 */
const mediaCacheFirst = async (request) => {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  const cached = await cache.match(request.url);
  if (cached) return cached;

  // 1. Try CORS fetch with request.url (raw.githubusercontent.com supports CORS)
  try {
    const networkResponse = await fetch(request.url, { mode: 'cors' });
    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
      try {
        await cache.put(request.url, networkResponse.clone());
      } catch {}
      return networkResponse;
    }
  } catch {
    // CORS fetch failed; proceed to direct request fallback
  }

  // 2. Direct fetch fallback with original request
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
      try {
        await cache.put(request.url, networkResponse.clone());
      } catch {}
      return networkResponse;
    }
    return networkResponse;
  } catch {
    return new Response('', { status: 504, statusText: 'Offline media' });
  }
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  if (url.origin !== self.location.origin) {
    if (MEDIA_HOSTS.includes(url.hostname) && url.pathname.endsWith('.gif')) {
      event.respondWith(mediaCacheFirst(event.request));
    }
    return;
  }

  event.respondWith(
    isDocumentRequest(event.request) ? networkFirst(event.request) : cacheFirst(event.request)
  );
});
