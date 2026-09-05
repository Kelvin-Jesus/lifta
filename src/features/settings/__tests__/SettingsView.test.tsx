import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'solid-js/web';
import { IDBFactory } from 'fake-indexeddb';
import { SettingsView } from '../SettingsView';
import { SettingsRepository } from '../../../storage/repositories/SettingsRepository';
import { Effect } from 'effect';

describe('SettingsView', () => {
  let container: HTMLDivElement;

  beforeEach(async () => {
    indexedDB = new IDBFactory();
    container = document.createElement('div');
    document.body.appendChild(container);
    await Effect.runPromise(
      SettingsRepository.updateSettings({
        theme: 'dark',
        accentColor: 'blue',
      })
    );
  });

  afterEach(() => {
    container.remove();
  });

  it('renders title, theme buttons and backup actions', async () => {
    render(() => <SettingsView />, container);

    expect(container.textContent).toContain('Ajustes');
    expect(container.querySelector('[data-testid="btn-theme-dark"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="btn-theme-light"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="btn-accent-blue"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="btn-accent-indigo"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="btn-export-backup"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="btn-export-csv"]')).not.toBeNull();
    expect(container.textContent).toContain('Restaurar Backup');
  });

  it('toggles theme to light when Light iOS is clicked', async () => {
    render(() => <SettingsView />, container);

    const lightBtn = container.querySelector('[data-testid="btn-theme-light"]') as HTMLButtonElement;
    lightBtn.click();

    await new Promise((r) => setTimeout(r, 50));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    const settings = await Effect.runPromise(SettingsRepository.getSettings());
    expect(settings.theme).toBe('light');
  });

  it('toggles accent to indigo when Roxo Índigo is clicked', async () => {
    render(() => <SettingsView />, container);

    const indigoBtn = container.querySelector('[data-testid="btn-accent-indigo"]') as HTMLButtonElement;
    indigoBtn.click();

    await new Promise((r) => setTimeout(r, 50));
    expect(document.documentElement.getAttribute('data-accent')).toBe('indigo');

    const settings = await Effect.runPromise(SettingsRepository.getSettings());
    expect(settings.accentColor).toBe('indigo');
  });

  it('calls onBack prop when back button is provided and clicked', () => {
    const onBack = vi.fn();
    render(() => <SettingsView onBack={onBack} />, container);

    const backBtn = container.querySelector('[data-testid="btn-settings-back"]') as HTMLButtonElement;
    backBtn.click();

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('handles export JSON click without crashing', async () => {
    render(() => <SettingsView />, container);

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
    globalThis.URL.revokeObjectURL = vi.fn();

    const exportBtn = container.querySelector('[data-testid="btn-export-backup"]') as HTMLButtonElement;
    exportBtn.click();

    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toContain('Backup JSON exportado com sucesso');
  });

  it('handles export CSV click without crashing', async () => {
    render(() => <SettingsView />, container);

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
    globalThis.URL.revokeObjectURL = vi.fn();

    const exportBtn = container.querySelector('[data-testid="btn-export-csv"]') as HTMLButtonElement;
    exportBtn.click();

    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toContain('Planilha CSV exportada com sucesso');
  });
});
