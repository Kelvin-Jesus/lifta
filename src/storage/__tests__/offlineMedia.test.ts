import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  EXERCISE_MEDIA_CACHE,
  clearExerciseMedia,
  exerciseMediaUrls,
  getOfflineMediaStatus,
  prefetchExerciseMedia,
} from '../offlineMedia';

class FakeCache {
  store = new Map<string, unknown>();

  async keys() {
    return [...this.store.keys()].map((url) => ({ url }));
  }

  async match(url: string) {
    return this.store.get(url);
  }

  async put(url: string, response: unknown) {
    this.store.set(url, response);
  }
}

const caches = new Map<string, FakeCache>();
const fetchMock = vi.fn();

beforeEach(() => {
  caches.clear();
  fetchMock.mockReset();
  vi.stubGlobal('caches', {
    open: async (name: string) => {
      if (!caches.has(name)) caches.set(name, new FakeCache());
      return caches.get(name)!;
    },
    delete: async (name: string) => caches.delete(name),
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const okResponse = () => ({ ok: true, status: 200, clone: () => ({ body: 'gif' }) });

describe('Offline exercise media', () => {
  it('reports how much of the catalog is available offline', async () => {
    const urls = exerciseMediaUrls();
    expect(urls.length).toBeGreaterThan(200);

    const empty = await getOfflineMediaStatus();
    expect(empty.total).toBe(urls.length);
    expect(empty.cached).toBe(0);
    expect(empty.missing).toBe(urls.length);
    expect(empty.approximateBytesRemaining).toBeGreaterThan(0);

    const cache = new FakeCache();
    await cache.put(urls[0], okResponse());
    caches.set(EXERCISE_MEDIA_CACHE, cache);

    const partial = await getOfflineMediaStatus();
    expect(partial.cached).toBe(1);
    expect(partial.missing).toBe(urls.length - 1);
  });

  it('downloads every missing animation into the media cache', async () => {
    fetchMock.mockImplementation(async () => okResponse());

    const progressUpdates: number[] = [];
    const result = await prefetchExerciseMedia({
      concurrency: 8,
      onProgress: (p) => progressUpdates.push(p.cached),
    });

    const urls = exerciseMediaUrls();
    expect(result.cached).toBe(urls.length);
    expect(result.failed).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(urls.length);
    expect(progressUpdates.at(-1)).toBe(urls.length);

    const status = await getOfflineMediaStatus();
    expect(status.missing).toBe(0);
  });

  it('skips what is already cached instead of downloading it again', async () => {
    const urls = exerciseMediaUrls();
    const cache = new FakeCache();
    for (const url of urls.slice(0, 10)) await cache.put(url, okResponse());
    caches.set(EXERCISE_MEDIA_CACHE, cache);
    fetchMock.mockImplementation(async () => okResponse());

    const result = await prefetchExerciseMedia({ concurrency: 8 });

    expect(fetchMock).toHaveBeenCalledTimes(urls.length - 10);
    expect(result.cached).toBe(urls.length);
  });

  it('counts failures instead of rejecting when the network drops mid-download', async () => {
    let call = 0;
    fetchMock.mockImplementation(async () => {
      call += 1;
      if (call % 2 === 0) throw new Error('offline');
      return okResponse();
    });

    const result = await prefetchExerciseMedia({ concurrency: 2 });

    expect(result.failed).toBeGreaterThan(0);
    expect(result.cached).toBeGreaterThan(0);
    expect(result.cached + result.failed).toBe(result.total);
  });

  it('frees the space when the user removes the downloads', async () => {
    fetchMock.mockImplementation(async () => okResponse());
    await prefetchExerciseMedia({ concurrency: 8 });
    expect((await getOfflineMediaStatus()).cached).toBeGreaterThan(0);

    await clearExerciseMedia();

    expect((await getOfflineMediaStatus()).cached).toBe(0);
  });
});
