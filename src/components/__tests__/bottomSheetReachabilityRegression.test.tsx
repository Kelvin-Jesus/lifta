import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { BottomSheet } from '../BottomSheet';

describe('BottomSheet reachability regression', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('[REGRESSION] stacks above the bottom tab bar so sheet actions stay tappable', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <BottomSheet isOpen={true} onClose={vi.fn()} title="Gerenciar Rotinas">
          <button type="button" data-testid="sheet-action">
            + Criar Nova Rotina
          </button>
        </BottomSheet>
      ),
      container
    );

    const sheet = container.querySelector('[data-testid="bottom-sheet"]') as HTMLElement;
    expect(sheet).not.toBeNull();

    // .tab-bar sits at z-index 50; the sheet must win the stacking context.
    const zClass = Array.from(sheet.classList).find((c) => c.startsWith('z-'));
    expect(zClass).toBe('z-[60]');
  });

  it('[REGRESSION] reserves safe-area space under the last action', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(
      () => (
        <BottomSheet isOpen={true} onClose={vi.fn()}>
          <button type="button" data-testid="sheet-action">
            + Criar Nova Rotina
          </button>
        </BottomSheet>
      ),
      container
    );

    const action = container.querySelector('[data-testid="sheet-action"]') as HTMLElement;
    const body = action.parentElement as HTMLElement;
    expect(body.getAttribute('style') ?? '').toContain('safe-area-inset-bottom');
  });
});
