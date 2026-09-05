import type { Component } from 'solid-js';

export type TabId = 'train' | 'routines' | 'history' | 'exercises' | 'settings';

export interface BottomTabBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const BottomTabBar: Component<BottomTabBarProps> = (props) => {
  return (
    <nav
      class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] h-[60px] bg-theme-surface/85 backdrop-blur-xl border-t border-theme-separator flex items-center justify-around px-2 z-40 select-none theme-transition"
      role="navigation"
      aria-label="Navegação principal"
      data-testid="bottom-tab-bar"
    >
      {/* 1. Treinar */}
      <button
        type="button"
        onClick={() => props.onSelectTab('train')}
        class={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-90 transition-transform ${
          props.activeTab === 'train' ? 'text-theme-accent' : 'text-theme-tertiary hover:text-theme-secondary'
        }`}
        aria-label="Treinar"
        data-testid="tab-train"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
        <span class="text-[10px] font-semibold tracking-tight">Treinar</span>
      </button>

      {/* 2. Fichas */}
      <button
        type="button"
        onClick={() => props.onSelectTab('routines')}
        class={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-90 transition-transform ${
          props.activeTab === 'routines' ? 'text-theme-accent' : 'text-theme-tertiary hover:text-theme-secondary'
        }`}
        aria-label="Fichas"
        data-testid="tab-routines"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span class="text-[10px] font-semibold tracking-tight">Fichas</span>
      </button>

      {/* 3. Histórico */}
      <button
        type="button"
        onClick={() => props.onSelectTab('history')}
        class={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-90 transition-transform ${
          props.activeTab === 'history' ? 'text-theme-accent' : 'text-theme-tertiary hover:text-theme-secondary'
        }`}
        aria-label="Histórico"
        data-testid="tab-history"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" stroke-width="2" />
          <polyline points="12 7 12 12 15 14" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span class="text-[10px] font-semibold tracking-tight">Histórico</span>
      </button>

      {/* 4. Exercícios */}
      <button
        type="button"
        onClick={() => props.onSelectTab('exercises')}
        class={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-90 transition-transform ${
          props.activeTab === 'exercises' ? 'text-theme-accent' : 'text-theme-tertiary hover:text-theme-secondary'
        }`}
        aria-label="Exercícios"
        data-testid="tab-exercises"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <polygon points="12 2 2 7 12 12 22 7 12 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <polyline points="2 17 12 22 22 17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <polyline points="2 12 12 17 22 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-[10px] font-semibold tracking-tight">Catálogo</span>
      </button>

      {/* 5. Ajustes */}
      <button
        type="button"
        onClick={() => props.onSelectTab('settings')}
        class={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-90 transition-transform ${
          props.activeTab === 'settings' ? 'text-theme-accent' : 'text-theme-tertiary hover:text-theme-secondary'
        }`}
        aria-label="Ajustes"
        data-testid="tab-settings"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-[10px] font-semibold tracking-tight">Ajustes</span>
      </button>
    </nav>
  );
};
