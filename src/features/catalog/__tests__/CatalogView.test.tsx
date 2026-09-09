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

  it('expands and collapses exercise details on click with smooth accordion and rotating chevron', async () => {
    render(() => <CatalogView />, container);

    const exerciseCard = container.querySelector('[data-testid="catalog-card-bench-press"]') as HTMLElement;
    expect(exerciseCard).not.toBeNull();

    const accordion = container.querySelector('[data-testid="catalog-accordion-bench-press"]') as HTMLElement;
    const chevron = container.querySelector('[data-testid="catalog-chevron-bench-press"]') as HTMLElement;
    expect(accordion).not.toBeNull();
    expect(chevron).not.toBeNull();

    // Initial state: collapsed
    expect(accordion.classList.contains('expanded')).toBe(false);
    expect(chevron.classList.contains('expanded')).toBe(false);
    expect(accordion.getAttribute('aria-hidden')).toBe('true');

    // Click to expand
    exerciseCard.click();
    await new Promise((r) => setTimeout(r, 40));

    expect(accordion.classList.contains('expanded')).toBe(true);
    expect(chevron.classList.contains('expanded')).toBe(true);
    expect(accordion.getAttribute('aria-hidden')).toBe('false');
    expect(container.textContent).toContain('Deite-se no banco');

    // Click to collapse
    exerciseCard.click();
    await new Promise((r) => setTimeout(r, 40));

    expect(accordion.classList.contains('expanded')).toBe(false);
    expect(chevron.classList.contains('expanded')).toBe(false);
    expect(accordion.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders gif, instructions, and target muscles when expanded without collapsing on details click', async () => {
    render(() => <CatalogView />, container);

    const exerciseCard = container.querySelector('[data-testid="catalog-card-bench-press"]') as HTMLElement;
    expect(exerciseCard).not.toBeNull();

    // Expand
    exerciseCard.click();
    await new Promise((r) => setTimeout(r, 40));

    // Verify gif demonstration
    const gifImg = container.querySelector('img[alt*="Demonstração de execução"]') as HTMLImageElement;
    expect(gifImg).not.toBeNull();
    expect(gifImg.src).toContain('.gif');

    // Verify instructions and target muscles
    expect(container.textContent).toContain('Instruções de Execução');
    expect(container.textContent).toContain('Músculos Alvo');
    expect(container.textContent).toContain('Peitoral (Primário)');

    // Clicking inside the details should not collapse
    gifImg.click();
    await new Promise((r) => setTimeout(r, 40));
    expect(container.textContent).toContain('Instruções de Execução');
  });
});
