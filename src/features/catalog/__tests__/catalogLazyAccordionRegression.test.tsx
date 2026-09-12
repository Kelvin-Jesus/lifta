import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { CatalogView } from '../CatalogView';
import { EXERCISE_CATALOG } from '../../../catalog/exercises';

describe('Catalog accordion lazy mount regression', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('[REGRESSION] does not mount gif and anatomy markup for collapsed rows', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <CatalogView />, container);

    // One row per exercise is present...
    expect(container.querySelectorAll('[data-testid^="catalog-card-"]').length).toBe(
      EXERCISE_CATALOG.length
    );

    // ...but none of the expensive content: mounting every gif + anatomy SVG up
    // front costs a ~230 ms main-thread task on a 4x-throttled low-end phone.
    expect(container.querySelectorAll('img[alt^="Demonstração de execução"]').length).toBe(0);
    expect(container.querySelectorAll('[data-testid^="body-highlighter-"]').length).toBe(0);
  });

  it('[REGRESSION] mounts the heavy content on expand and keeps the animated wrapper', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <CatalogView />, container);

    const card = container.querySelector('[data-testid="catalog-card-bench-press"]') as HTMLElement;
    const accordion = container.querySelector(
      '[data-testid="catalog-accordion-bench-press"]'
    ) as HTMLElement;

    // Collapsed: wrapper exists so the grid-rows transition still animates.
    expect(accordion).not.toBeNull();
    expect(accordion.classList.contains('catalog-accordion-grid')).toBe(true);
    expect(accordion.querySelector('img')).toBeNull();

    card.click();

    expect(accordion.classList.contains('expanded')).toBe(true);
    expect(accordion.querySelector('img[alt^="Demonstração de execução"]')).not.toBeNull();

    // Collapsing keeps the content mounted so the closing animation has content.
    card.click();
    expect(accordion.classList.contains('expanded')).toBe(false);
    expect(accordion.querySelector('img[alt^="Demonstração de execução"]')).not.toBeNull();
  });
});
