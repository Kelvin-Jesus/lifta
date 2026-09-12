/**
 * Performance gates and route map for the low-end-device audit.
 *
 * The app is a single-URL SPA; every screen is addressable through the
 * read-only deep-link params implemented in `src/App.tsx`
 * (`?tab=…`, `?screen=workout`).
 */

export const GATES = {
  /** Lighthouse mobile performance score (0-100). */
  minPerformanceScore: 90,
  /** Lighthouse Total Blocking Time, milliseconds. */
  maxTotalBlockingTimeMs: 200,
  /** Share of animation frames that must stay inside the 60 fps budget. */
  minFramesWithinBudget: 0.95,
  /**
   * A frame counts as "within budget" when the delta between consecutive
   * rAF callbacks stays below this value. At 60 Hz vsync a healthy frame lands
   * at ~16.7 ms; a dropped frame lands at >=33 ms, so 20 ms separates
   * "hit the 16.7 ms budget" from "missed a vsync" without flagging jitter.
   */
  frameBudgetMs: 20,
  /** No main-thread task may exceed this during scripted interaction. */
  maxLongTaskMs: 200,
  /** Initial JS transferred for the route, gzip bytes. */
  maxScriptTransferBytes: 200 * 1024,
};

/** Moto G Power emulation, matching the Lighthouse mobile preset. */
export const MOBILE_DEVICE = {
  width: 412,
  height: 823,
  deviceScaleFactor: 1.75,
  mobile: true,
  userAgent:
    'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
};

export const CPU_THROTTLE_RATE = 4;

/**
 * Scripted interactions are expressed as data so the audit stays declarative.
 * `tap` selectors are optional: a missing selector is skipped, not failed,
 * so the harness never blocks on cosmetic markup changes.
 */
export const ROUTES = [
  {
    id: 'train',
    label: 'Dashboard / Treinar',
    url: '/?tab=train',
    waitFor: '[data-testid="bottom-tab-bar"]',
    interactions: [
      { type: 'scroll' },
      { type: 'tap', selector: '[data-testid="tab-routines"]' },
      { type: 'tap', selector: '[data-testid="tab-train"]' },
      { type: 'scroll' },
    ],
  },
  {
    id: 'routines',
    label: 'Rotinas',
    url: '/?tab=routines',
    waitFor: '[data-testid="bottom-tab-bar"]',
    interactions: [
      { type: 'scroll' },
      { type: 'tap', selector: '[data-testid="tab-history"]' },
      { type: 'tap', selector: '[data-testid="tab-routines"]' },
      { type: 'scroll' },
    ],
  },
  {
    id: 'history',
    label: 'Histórico',
    url: '/?tab=history',
    waitFor: '[data-testid="bottom-tab-bar"]',
    interactions: [
      { type: 'scroll' },
      { type: 'tap', selector: '[data-testid="tab-exercises"]' },
      { type: 'tap', selector: '[data-testid="tab-history"]' },
      { type: 'scroll' },
    ],
  },
  {
    id: 'exercises',
    label: 'Catálogo de Exercícios',
    url: '/?tab=exercises',
    waitFor: '[data-testid="bottom-tab-bar"]',
    interactions: [
      { type: 'scroll' },
      { type: 'typeSearch', selector: '[data-testid="input-catalog-search"]', text: 'supino' },
      { type: 'tap', selector: '[data-testid="catalog-card-bench-press"]' },
      { type: 'tap', selector: '[data-testid="catalog-card-bench-press"]' },
      { type: 'scroll' },
    ],
  },
  {
    id: 'settings',
    label: 'Configurações',
    url: '/?tab=settings',
    waitFor: '[data-testid="bottom-tab-bar"]',
    interactions: [
      { type: 'scroll' },
      { type: 'tap', selector: '[data-testid="btn-toggle-theme"]' },
      { type: 'tap', selector: '[data-testid="btn-toggle-theme"]' },
      { type: 'scroll' },
    ],
  },
  {
    id: 'workout',
    label: 'Treino Ativo (WorkoutDeck)',
    url: '/?screen=workout',
    requiresActiveWorkout: true,
    waitFor: '[data-testid="workout-deck"]',
    interactions: [
      { type: 'scroll' },
      { type: 'tap', selector: '[data-testid="btn-weight-plus-0"]' },
      { type: 'tap', selector: '[data-testid="btn-reps-plus-0"]' },
      { type: 'tap', selector: '[data-testid="btn-complete-set-0"]' },
      { type: 'swipe', selector: '[data-testid="deck-carousel"]' },
      { type: 'scroll' },
    ],
  },
];
