import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * The service worker is plain JS shipped from `public/`, so it is loaded here
 * into a fake ServiceWorkerGlobalScope and exercised through its real fetch
 * handler.
 */
const SW_SOURCE = readFileSync(
  path.resolve(__dirname, '../public/sw.js'),
  'utf8'
);

class FakeResponse {
  status: number;
  type: string;
  body: string;

  constructor(body: string, init: { status?: number; type?: string } = {}) {
    this.body = body;
    this.status = init.status ?? 200;
    this.type = init.type ?? 'basic';
  }

  clone() {
    return new FakeResponse(this.body, { status: this.status, type: this.type });
  }
}

interface FetchEvent {
  request: { url: string; method: string; mode: string };
  respondWith: (response: Promise<FakeResponse>) => void;
}

const loadServiceWorker = (options: {
  cached: Record<string, string>;
  network: Record<string, string> | null;
  mediaCached?: Record<string, string>;
  existingCacheNames?: string[];
}) => {
  const stores = new Map<string, Map<string, FakeResponse>>();
  stores.set(
    'lifta-app-shell-v2',
    new Map(Object.entries(options.cached).map(([url, body]) => [url, new FakeResponse(body)]))
  );
  stores.set(
    'lifta-media-v1',
    new Map(
      Object.entries(options.mediaCached ?? {}).map(([url, body]) => [url, new FakeResponse(body)])
    )
  );

  const keyOf = (request: { url: string } | string) =>
    typeof request === 'string'
      ? request.startsWith('http')
        ? request
        : `https://app.test${request}`
      : request.url;

  const cacheFor = (name: string) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name)!;
    return {
      match: async (request: { url: string } | string) => store.get(keyOf(request)),
      put: async (request: { url: string } | string, response: FakeResponse) => {
        store.set(keyOf(request), response);
      },
      keys: async () => [...store.keys()].map((url) => ({ url })),
      addAll: async () => undefined,
    };
  };

  const deleted: string[] = [];
  const caches = {
    open: async (name: string) => cacheFor(name),
    match: async (request: { url: string } | string) => {
      for (const store of stores.values()) {
        const hit = store.get(keyOf(request));
        if (hit) return hit;
      }
      return undefined;
    },
    keys: async () => options.existingCacheNames ?? [...stores.keys()],
    delete: async (name: string) => {
      deleted.push(name);
      return stores.delete(name);
    },
  };

  const fetchImpl = vi.fn(async (request: { url: string } | string) => {
    const url = keyOf(request);
    if (!options.network) throw new Error('offline');
    const body = options.network[url];
    if (body === undefined) throw new Error('offline');
    return new FakeResponse(body);
  });

  const listeners: Record<string, (event: unknown) => void> = {};
  const self = {
    addEventListener: (type: string, handler: (event: unknown) => void) => {
      listeners[type] = handler;
    },
    location: { origin: 'https://app.test' },
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined },
  };

  new Function('self', 'caches', 'fetch', 'Response', 'URL', SW_SOURCE)(
    self,
    caches,
    fetchImpl,
    FakeResponse,
    URL
  );

  const handleFetch = async (url: string, mode: string) => {
    let captured: Promise<FakeResponse> | null = null;
    const event: FetchEvent = {
      request: { url, method: 'GET', mode },
      respondWith: (response) => {
        captured = response;
      },
    };
    listeners.fetch?.(event);
    if (captured === null) return null;
    return (await captured) as FakeResponse;
  };

  const runActivate = async () => {
    let work: Promise<unknown> = Promise.resolve();
    listeners.activate?.({ waitUntil: (p: Promise<unknown>) => (work = p) });
    await work;
  };

  return { handleFetch, runActivate, fetchImpl, stores, deleted };
};

describe('Service worker freshness regression', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('[REGRESSION] serves the document from the network so new builds are picked up', async () => {
    const { handleFetch, fetchImpl } = loadServiceWorker({
      cached: { 'https://app.test/': '<script src="/assets/index-OLD.js">' },
      network: { 'https://app.test/': '<script src="/assets/index-NEW.js">' },
    });

    const response = await handleFetch('https://app.test/', 'navigate');

    expect(response!.body).toContain('index-NEW.js');
    expect(fetchImpl).toHaveBeenCalled();
  });

  it('[REGRESSION] falls back to the cached document when offline', async () => {
    const { handleFetch } = loadServiceWorker({
      cached: { 'https://app.test/index.html': '<script src="/assets/index-OLD.js">' },
      network: null,
    });

    const response = await handleFetch('https://app.test/index.html', 'navigate');

    expect(response!.status).toBe(200);
    expect(response!.body).toContain('index-OLD.js');
  });

  it('serves hashed assets from cache without waiting on the network', async () => {
    const { handleFetch, fetchImpl } = loadServiceWorker({
      cached: { 'https://app.test/assets/index-NEW.js': 'bundle' },
      network: { 'https://app.test/assets/index-NEW.js': 'bundle' },
    });

    const response = await handleFetch('https://app.test/assets/index-NEW.js', 'no-cors');

    expect(response!.body).toBe('bundle');
    // Background revalidation is allowed, but the response must not depend on it.
    expect(response).toBeInstanceOf(FakeResponse);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

const GIF = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0001-x.gif';

describe('Offline exercise media in the service worker', () => {
  it('[REGRESSION] serves a cached animation with no network at all', async () => {
    const { handleFetch, fetchImpl } = loadServiceWorker({
      cached: {},
      network: null,
      mediaCached: { [GIF]: 'gif-bytes' },
    });

    const response = await handleFetch(GIF, 'no-cors');

    expect(response!.body).toBe('gif-bytes');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('stores animations fetched while online so the next session works offline', async () => {
    const { handleFetch, stores } = loadServiceWorker({
      cached: {},
      network: { [GIF]: 'gif-bytes' },
    });

    const response = await handleFetch(GIF, 'no-cors');

    expect(response!.body).toBe('gif-bytes');
    expect(stores.get('lifta-media-v1')!.has(GIF)).toBe(true);
  });

  it('[REGRESSION] keeps downloaded animations when the app shell is upgraded', async () => {
    const { runActivate, deleted, stores } = loadServiceWorker({
      cached: {},
      network: {},
      mediaCached: { [GIF]: 'gif-bytes' },
      existingCacheNames: ['lifta-app-shell-v1', 'lifta-app-shell-v2', 'lifta-media-v1'],
    });

    await runActivate();

    expect(deleted).toEqual(['lifta-app-shell-v1']);
    expect(stores.get('lifta-media-v1')!.has(GIF)).toBe(true);
  });

  it('does not hijack unrelated cross-origin requests', async () => {
    const { handleFetch } = loadServiceWorker({ cached: {}, network: null });

    expect(await handleFetch('https://example.com/api/ping', 'cors')).toBeNull();
  });
});
