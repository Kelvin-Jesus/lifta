import { createSignal, createEffect, type Component } from 'solid-js';
import { Effect } from 'effect';
import { SettingsRepository, type Settings } from '../../storage/repositories/SettingsRepository';

export interface ThemeSelectorProps {
  initialSettings?: Settings;
  onSettingsChanged?: (settings: Settings) => void;
}

export const ThemeSelector: Component<ThemeSelectorProps> = (props) => {
  const [theme, setTheme] = createSignal<'dark' | 'light'>(props.initialSettings?.theme ?? 'dark');
  const [accentColor, setAccentColor] = createSignal<'blue' | 'indigo'>(
    props.initialSettings?.accentColor ?? 'blue'
  );

  // Apply theme & accent to DOM documentElement
  createEffect(() => {
    const currentTheme = theme();
    const currentAccent = accentColor();

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', currentTheme);
      root.setAttribute('data-accent', currentAccent);
      root.style.setProperty('--color-accent', currentAccent === 'indigo' ? '#5856d6' : '#007aff');
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  });

  const handleUpdate = async (newTheme: 'dark' | 'light', newAccent: 'blue' | 'indigo') => {
    setTheme(newTheme);
    setAccentColor(newAccent);

    const updated = await Effect.runPromise(
      SettingsRepository.updateSettings({
        theme: newTheme,
        accentColor: newAccent,
      })
    );

    if (props.onSettingsChanged) {
      props.onSettingsChanged(updated);
    }
  };

  return (
    <div
      class="w-full bg-theme-surface border border-theme-separator rounded-2xl p-4 select-none theme-transition"
      data-testid="theme-selector"
    >
      <h3 class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold mb-3 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-theme-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Personalização Visual
      </h3>

      <div class="grid grid-cols-2 gap-3 mb-3">
        {/* Dark OLED Option */}
        <button
          type="button"
          onClick={() => handleUpdate('dark', accentColor())}
          class={`h-11 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            theme() === 'dark'
              ? 'bg-theme-elevated border-blue-500 text-theme-primary shadow-md'
              : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary'
          }`}
          data-testid="btn-theme-dark"
        >
          <span class="w-3 h-3 rounded-full bg-black border border-neutral-700" />
          Dark OLED
        </button>

        {/* Light Native Option */}
        <button
          type="button"
          onClick={() => handleUpdate('light', accentColor())}
          class={`h-11 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
            theme() === 'light'
              ? 'bg-theme-elevated border-blue-500 text-theme-primary shadow-md'
              : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary'
          }`}
          data-testid="btn-theme-light"
        >
          <span class="w-3 h-3 rounded-full bg-neutral-200 border border-neutral-400" />
          Light iOS
        </button>
      </div>

      {/* Accent Color Palette */}
      <div>
        <span class="text-[10px] uppercase font-mono tracking-wider text-theme-tertiary block mb-2">
          Cor de Destaque
        </span>
        <div class="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleUpdate(theme(), 'blue')}
            class={`flex-1 h-9 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              accentColor() === 'blue'
                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                : 'bg-theme-surface border-theme-subtle text-theme-secondary'
            }`}
            data-testid="btn-accent-blue"
          >
            <span class="w-3.5 h-3.5 rounded-full bg-[#007aff]" />
            Azul Apple
          </button>

          <button
            type="button"
            onClick={() => handleUpdate(theme(), 'indigo')}
            class={`flex-1 h-9 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              accentColor() === 'indigo'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                : 'bg-theme-surface border-theme-subtle text-theme-secondary'
            }`}
            data-testid="btn-accent-indigo"
          >
            <span class="w-3.5 h-3.5 rounded-full bg-[#5856d6]" />
            Roxo Índigo
          </button>
        </div>
      </div>
    </div>
  );
};
