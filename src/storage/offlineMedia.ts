import { EXERCISE_CATALOG } from '../catalog/exercises';

/**
 * Exercise animations live off-origin, so an installed PWA only works in the
 * gym (no signal, airplane mode, prepaid data) if they are in Cache Storage.
 * The service worker reads the very same cache, cache-first.
 */
export const EXERCISE_MEDIA_CACHE = 'lifta-media-v1';

/** ~95 KB per animation; used to tell the user what a full download costs. */
const APPROX_BYTES_PER_MEDIA = 95_000;

export interface OfflineMediaStatus {
  total: number;
  cached: number;
  missing: number;
  approximateBytesRemaining: number;
}

export interface PrefetchProgress {
  cached: number;
  total: number;
  failed: number;
}

export interface PrefetchOptions {
  concurrency?: number;
  onProgress?: (progress: PrefetchProgress) => void;
  signal?: AbortSignal;
}

const mediaSupported = () => typeof caches !== 'undefined' && typeof fetch === 'function';

export const exerciseMediaUrls = (): string[] => [
  ...new Set(
    EXERCISE_CATALOG.map((exercise) => exercise.gifUrl).filter(
      (url): url is string => typeof url === 'string' && url.length > 0
    )
  ),
];

export const getOfflineMediaStatus = async (): Promise<OfflineMediaStatus> => {
  const urls = exerciseMediaUrls();
  if (!mediaSupported()) {
    return { total: urls.length, cached: 0, missing: urls.length, approximateBytesRemaining: 0 };
  }

  const cache = await caches.open(EXERCISE_MEDIA_CACHE);
  const keys = await cache.keys();
  const stored = new Set(keys.map((request) => request.url));
  const cached = urls.filter((url) => stored.has(url)).length;
  const missing = urls.length - cached;

  return {
    total: urls.length,
    cached,
    missing,
    approximateBytesRemaining: missing * APPROX_BYTES_PER_MEDIA,
  };
};

/**
 * Downloads every missing animation into the media cache. Safe to call on every
 * launch: already-cached entries are skipped, so it converges instead of
 * re-downloading.
 */
export const prefetchExerciseMedia = async (
  options: PrefetchOptions = {}
): Promise<PrefetchProgress> => {
  const urls = exerciseMediaUrls();
  const progress: PrefetchProgress = { cached: 0, total: urls.length, failed: 0 };

  if (!mediaSupported()) return progress;

  const cache = await caches.open(EXERCISE_MEDIA_CACHE);
  const keys = await cache.keys();
  const stored = new Set(keys.map((request) => request.url));
  progress.cached = urls.filter((url) => stored.has(url)).length;
  options.onProgress?.({ ...progress });

  const pending = urls.filter((url) => !stored.has(url));
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, 8));
  let cursor = 0;

  const worker = async () => {
    while (cursor < pending.length) {
      if (options.signal?.aborted) return;
      const url = pending[cursor];
      cursor += 1;
      try {
        const response = await fetch(url, { signal: options.signal, cache: 'no-cache' });
        if (response.ok) {
          await cache.put(url, response.clone());
          progress.cached += 1;
        } else {
          progress.failed += 1;
        }
      } catch {
        if (options.signal?.aborted) return;
        progress.failed += 1;
      }
      options.onProgress?.({ ...progress });
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, worker));
  return progress;
};

export const clearExerciseMedia = async (): Promise<void> => {
  if (typeof caches === 'undefined') return;
  await caches.delete(EXERCISE_MEDIA_CACHE);
};

/**
 * Installed app: the user expects it to work in the gym without signal, so the
 * download starts by itself, quietly and at low concurrency. In a browser tab
 * it stays opt-in from Settings.
 */
export const startOfflineMediaWarmup = (): void => {
  if (typeof window === 'undefined' || !mediaSupported()) return;

  // `navigator.standalone` (iOS) and `navigator.connection` are not in the DOM
  // lib, so read them through `in` narrowing instead of asserting a shape.
  const iosStandalone =
    'standalone' in navigator && typeof navigator.standalone === 'boolean'
      ? navigator.standalone
      : false;
  const isInstalled =
    window.matchMedia?.('(display-mode: standalone)').matches === true || iosStandalone;
  if (!isInstalled) return;

  if ('connection' in navigator) {
    const connection = navigator.connection;
    if (
      connection &&
      typeof connection === 'object' &&
      'saveData' in connection &&
      connection.saveData === true
    ) {
      return;
    }
  }

  const start = () => {
    void prefetchExerciseMedia({ concurrency: 3 });
  };

  if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start);
  } else {
    setTimeout(start, 3000);
  }
};
