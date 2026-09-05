import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'solid-js/web';
import { CatalogView } from '../CatalogView';

describe('CatalogView', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders catalog header and exercise search input', () => {
    render(() => <CatalogView />, container);

    expect(container.textContent).toContain('Catálogo de Exercícios');
    expect(container.querySelector('[data-testid="input-catalog-search"]')).not.toBeNull();
    expect(container.textContent).toContain('Todos');
  });

  it('filters exercises by search query', async () => {
    render(() => <CatalogView />, container);

    const searchInput = container.querySelector('[data-testid="input-catalog-search"]') as HTMLInputElement;
    searchInput.value = 'Supino';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((r) => setTimeout(r, 40));
    expect(container.textContent).toContain('Supino Reto com Barra');
    expect(container.textContent).not.toContain('Agachamento Livre com Barra');
  });

  it('filters exercises by muscle category pill', async () => {
    render(() => <CatalogView />, container);

    const buttons = Array.from(container.querySelectorAll('button'));
    const peitoralBtn = buttons.find((b) => b.textContent?.trim() === 'Peitoral');
    expect(peitoralBtn).toBeDefined();
    peitoralBtn?.click();

    await new Promise((r) => setTimeout(r, 40));
    expect(container.textContent).toContain('Supino Reto com Barra');
  });

  it('expands and collapses exercise details on click', async () => {
    render(() => <CatalogView />, container);

    const exerciseCard = container.querySelector('[data-testid="catalog-card-bench-press"]') as HTMLElement;
    expect(exerciseCard).not.toBeNull();

    // Click to expand
    exerciseCard.click();
    await new Promise((r) => setTimeout(r, 40));
    expect(container.textContent).toContain('Deite-se no banco');

    // Click to collapse
    exerciseCard.click();
    await new Promise((r) => setTimeout(r, 40));
    expect(container.textContent).not.toContain('Deite-se no banco');
  });
});
