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
}) => {
  const store = new Map<string, FakeResponse>(
    Object.entries(options.cached).map(([url, body]) => [url, new FakeResponse(body)])
  );

  const cache = {
    match: async (request: { url: string } | string) =>
      store.get(typeof request === 'string' ? `https://app.test${request}` : request.url),
    put: async (request: { url: string } | string, response: FakeResponse) => {
      store.set(typeof request === 'string' ? `https://app.test${request}` : request.url, response);
    },
    addAll: async () => undefined,
  };

  const caches = {
    open: async () => cache,
    match: cache.match,
    keys: async () => ['lifta-app-shell-v1', 'lifta-app-shell-v2'],
    delete: vi.fn(async () => true),
  };

  const fetchImpl = vi.fn(async (request: { url: string }) => {
    if (!options.network) throw new Error('offline');
    const body = options.network[request.url];
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

  // eslint-disable-next-line no-new-func
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
    expect(captured).not.toBeNull();
    return (await captured!) as FakeResponse;
  };

  return { handleFetch, fetchImpl, store };
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

    expect(response.body).toContain('index-NEW.js');
    expect(fetchImpl).toHaveBeenCalled();
  });

  it('[REGRESSION] falls back to the cached document when offline', async () => {
    const { handleFetch } = loadServiceWorker({
      cached: { 'https://app.test/index.html': '<script src="/assets/index-OLD.js">' },
      network: null,
    });

    const response = await handleFetch('https://app.test/index.html', 'navigate');

    expect(response.status).toBe(200);
    expect(response.body).toContain('index-OLD.js');
  });

  it('serves hashed assets from cache without waiting on the network', async () => {
    const { handleFetch, fetchImpl } = loadServiceWorker({
      cached: { 'https://app.test/assets/index-NEW.js': 'bundle' },
      network: { 'https://app.test/assets/index-NEW.js': 'bundle' },
    });

    const response = await handleFetch('https://app.test/assets/index-NEW.js', 'no-cors');

    expect(response.body).toBe('bundle');
    // Background revalidation is allowed, but the response must not depend on it.
    expect(response).toBeInstanceOf(FakeResponse);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
