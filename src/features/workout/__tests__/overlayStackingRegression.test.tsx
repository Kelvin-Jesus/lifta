import 'fake-indexeddb/auto';
import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { MuscleFocusCard } from '../MuscleFocusCard';
import { FloatingRestBar } from '../FloatingRestBar';

/** Tailwind classes are the only stacking signal available in happy-dom. */
const zIndexOf = (element: Element) => {
  const match = /(?:^|\s)z-\[?(\d+)\]?(?:\s|$)/.exec(element.className.toString());
  expect(match, `no z-index class on ${element.getAttribute('data-testid')}`).not.toBeNull();
  return Number(match![1]);
};

const TAB_BAR_Z = 50; // .tab-bar in src/index.css

describe('Overlay stacking regression', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('[REGRESSION] shows the expanded gif above the details sheet it was opened from', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <MuscleFocusCard exerciseId="bench-press" />, container);

    (container.querySelector('[data-testid="btn-open-exercise-details"]') as HTMLElement).click();
    const sheet = container.querySelector('[data-testid="bottom-sheet"]') as HTMLElement;
    expect(sheet).not.toBeNull();

    (container.querySelector('[data-testid="sheet-gif-container"]') as HTMLElement).click();
    const modal = container.querySelector('[data-testid="exercise-gif-modal"]') as HTMLElement;
    expect(modal).not.toBeNull();

    // The lightbox used to share z-50 with everything else and landed behind
    // the sheet that opened it.
    expect(zIndexOf(modal)).toBeGreaterThan(zIndexOf(sheet));
    expect(zIndexOf(sheet)).toBeGreaterThan(TAB_BAR_Z);
  });

  it('[REGRESSION] keeps the rest bar above the tab bar but under sheets', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <FloatingRestBar
          timer={{ active: true, remainingSeconds: 60, durationSeconds: 90 }}
          onAddSeconds={() => {}}
          onSkip={() => {}}
        />
      ),
      container
    );

    const restBar = container.querySelector('[data-testid="floating-rest-bar"]') as HTMLElement;
    expect(zIndexOf(restBar)).toBeGreaterThan(TAB_BAR_Z);
    expect(zIndexOf(restBar)).toBeLessThan(60);
  });
});
