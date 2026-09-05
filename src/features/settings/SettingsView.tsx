import { createSignal, createEffect, Show, type Component } from 'solid-js';
import { Effect } from 'effect';
import { SettingsRepository, type Settings } from '../../storage/repositories/SettingsRepository';
import { exportLiftaJson, exportSessionsCsv, importLiftaJson } from '../../storage/export-import';

export interface SettingsViewProps {
  onBack?: () => void;
}

export const SettingsView: Component<SettingsViewProps> = (props) => {
  const [settings, setSettings] = createSignal<Settings>({
    key: 'app_settings',
    theme: 'dark',
    accentColor: 'blue',
    bodyWeightKg: 75,
    vibrationEnabled: true,
    soundEnabled: false,
  });

  const [toastMessage, setToastMessage] = createSignal<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  createEffect(() => {
    Effect.runPromise(SettingsRepository.getSettings()).then((s) => {
      setSettings(s);
    });
  });

  const handleUpdate = async (newTheme: 'dark' | 'light', newAccent: 'blue' | 'indigo') => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    root.setAttribute('data-accent', newAccent);
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const updated = await Effect.runPromise(
      SettingsRepository.updateSettings({
        theme: newTheme,
        accentColor: newAccent,
      })
    );
    setSettings(updated);
    showToast('Ajustes visuais atualizados');
  };

  const handleExportJson = async () => {
    try {
      const json = await Effect.runPromise(exportLiftaJson());
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifta-backup-${new Date().toISOString().slice(0, 10)}.lifta.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON exportado com sucesso');
    } catch {
      showToast('Erro ao exportar backup');
    }
  };

  const handleExportCsv = async () => {
    try {
      const csv = await Effect.runPromise(exportSessionsCsv());
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifta-historico-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Planilha CSV exportada com sucesso');
    } catch {
      showToast('Erro ao exportar CSV');
    }
  };

  const handleFileImport = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await Effect.runPromise(importLiftaJson(text));
      showToast(`Restaurado: ${res.routinesImported} fichas, ${res.sessionsImported} treinos`);
      // Reload settings
      const s = await Effect.runPromise(SettingsRepository.getSettings());
      setSettings(s);
      document.documentElement.setAttribute('data-theme', s.theme);
      document.documentElement.setAttribute('data-accent', s.accentColor);
    } catch {
      showToast('Arquivo de backup inválido ou incompatível');
    } finally {
      input.value = '';
    }
  };

  return (
    <div
      class="w-full min-h-[100dvh] bg-theme-bg text-theme-primary pb-24 p-4 flex flex-col gap-5 select-none theme-transition"
      data-testid="settings-view"
    >
      {/* Header */}
      <header class="flex items-center justify-between pt-2 pb-1 border-b border-theme-subtle">
        <div class="flex items-center gap-3">
          <Show when={props.onBack}>
            <button
              type="button"
              onClick={props.onBack}
              class="w-9 h-9 rounded-xl bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              aria-label="Voltar"
              data-testid="btn-settings-back"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Show>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-theme-primary">Ajustes</h1>
            <span class="text-xs text-theme-secondary font-mono">Personalização e Dados Soberanos</span>
          </div>
        </div>
      </header>

      {/* Section 1: Tema e Cores */}
      <div class="bg-theme-surface border border-theme-separator rounded-2xl p-4 flex flex-col gap-4">
        <h2 class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold flex items-center gap-1.5">
          <svg class="w-4 h-4 text-theme-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Aparência do Aplicativo
        </h2>

        <div class="grid grid-cols-2 gap-3">
          {/* Dark OLED */}
          <button
            type="button"
            onClick={() => handleUpdate('dark', settings().accentColor)}
            class={`h-12 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
              settings().theme === 'dark'
                ? 'bg-theme-elevated border-blue-500 text-theme-primary shadow-sm'
                : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary'
            }`}
            data-testid="btn-theme-dark"
          >
            <span class="w-3.5 h-3.5 rounded-full bg-black border border-neutral-700" />
            Dark OLED
          </button>

          {/* Light iOS */}
          <button
            type="button"
            onClick={() => handleUpdate('light', settings().accentColor)}
            class={`h-12 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
              settings().theme === 'light'
                ? 'bg-theme-elevated border-blue-500 text-theme-primary shadow-sm'
                : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary'
            }`}
            data-testid="btn-theme-light"
          >
            <span class="w-3.5 h-3.5 rounded-full bg-neutral-200 border border-neutral-400" />
            Light iOS
          </button>
        </div>

        {/* Accent Colors */}
        <div>
          <span class="text-[10px] uppercase font-mono tracking-wider text-theme-tertiary block mb-2">
            Cor de Destaque
          </span>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleUpdate(settings().theme, 'blue')}
              class={`h-10 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                settings().accentColor === 'blue'
                  ? 'bg-blue-500/15 border-blue-500 text-blue-500 font-bold'
                  : 'bg-theme-surface border-theme-subtle text-theme-secondary'
              }`}
              data-testid="btn-accent-blue"
            >
              <span class="w-3 h-3 rounded-full bg-[#007aff]" />
              Azul Apple
            </button>

            <button
              type="button"
              onClick={() => handleUpdate(settings().theme, 'indigo')}
              class={`h-10 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                settings().accentColor === 'indigo'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-500 font-bold'
                  : 'bg-theme-surface border-theme-subtle text-theme-secondary'
              }`}
              data-testid="btn-accent-indigo"
            >
              <span class="w-3 h-3 rounded-full bg-[#5856d6]" />
              Roxo Índigo
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Backup & Exportação Soberana */}
      <div class="bg-theme-surface border border-theme-separator rounded-2xl p-4 flex flex-col gap-3">
        <h2 class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Soberania de Dados & Backup
        </h2>
        <p class="text-xs text-theme-secondary leading-relaxed">
          Seus dados são 100% locais no seu navegador. Exporte backups regulares para restaurar em outros aparelhos.
        </p>

        <div class="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            class="w-full h-11 rounded-xl bg-theme-elevated hover:opacity-90 active:scale-[0.98] border border-theme-subtle text-xs font-bold text-theme-primary flex items-center justify-center gap-2 transition-all"
            data-testid="btn-export-backup"
          >
            <svg class="w-4 h-4 text-theme-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Backup Completo (.lifta.json)
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            class="w-full h-11 rounded-xl bg-theme-elevated hover:opacity-90 active:scale-[0.98] border border-theme-subtle text-xs font-bold text-theme-primary flex items-center justify-center gap-2 transition-all"
            data-testid="btn-export-csv"
          >
            <svg class="w-4 h-4 text-theme-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Planilha de Séries (.csv)
          </button>

          <label
            class="w-full h-11 rounded-xl bg-theme-elevated hover:opacity-90 active:scale-[0.98] border border-theme-subtle text-xs font-bold text-theme-accent flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <svg class="w-4 h-4 text-theme-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Restaurar Backup (.lifta.json)
            <input
              type="file"
              accept=".json,.lifta.json"
              onChange={handleFileImport}
              class="hidden"
              data-testid="input-import-backup"
            />
          </label>
        </div>
      </div>

      {/* Section 3: WebMCP & Engine */}
      <div class="bg-theme-surface border border-theme-separator rounded-2xl p-4 flex flex-col gap-2">
        <h2 class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          WebMCP & Agente IA
        </h2>
        <p class="text-xs text-theme-secondary leading-relaxed">
          O Lifta expõe 12 ferramentas padronizadas em <code class="text-theme-accent font-mono text-[11px]">document.modelContext</code> para que agentes IA possam automatizar fatias de treino, analisar sobrecarga progressiva e sincronizar com segurança.
        </p>
      </div>

      {/* Section 4: Sobre */}
      <div class="p-4 text-center text-theme-tertiary text-xs font-mono">
        Lifta • Mobile Workout Engine v1.0.0
        <span class="block mt-1 text-[10px]">Local-First • Zero Cloud Lock-in • Solid-JS + Effect</span>
      </div>

      {/* Toast Notification */}
      <div
        class={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-theme-surface border border-theme-separator text-xs font-semibold text-theme-primary shadow-2xl transition-all duration-200 ${
          toastMessage() ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {toastMessage()}
      </div>
    </div>
  );
};
