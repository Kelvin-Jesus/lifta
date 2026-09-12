import 'fake-indexeddb/auto';
import { describe, it, expect, afterEach } from 'vitest';
import { initWebMCPPolyfill } from '../modelContextPolyfill';
import { registerAllWebMCPTools } from '../tools';

const restoreDocumentModelContext = () => {
  delete (document as unknown as Record<string, unknown>).modelContext;
};

describe('WebMCP polyfill against a native document.modelContext', () => {
  afterEach(() => {
    restoreDocumentModelContext();
  });

  it('installs the polyfill when the existing object does not speak the app contract', () => {
    // Chrome 141+ exposes a read-only `document.modelContext` with a different
    // surface; the app must not adopt it and must not throw on registration.
    Object.defineProperty(document, 'modelContext', {
      get: () => ({ provideContext: () => undefined }),
      configurable: true,
    });

    const context = initWebMCPPolyfill();

    expect(typeof context.registerTool).toBe('function');
    expect(() => registerAllWebMCPTools(context)).not.toThrow();
    expect(context.listTools().length).toBeGreaterThan(0);
  });

  it('keeps an existing context that already implements the contract', () => {
    const first = initWebMCPPolyfill();
    registerAllWebMCPTools(first);

    const second = initWebMCPPolyfill();

    expect(second).toBe(first);
    expect(second.listTools().length).toBe(first.listTools().length);
  });
});
