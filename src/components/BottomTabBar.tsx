import type { Component } from 'solid-js';

export type TabId = 'train' | 'routines' | 'history' | 'exercises' | 'settings';

export interface BottomTabBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const BottomTabBar: Component<BottomTabBarProps> = (props) => {
  return (
    <nav
      class="tab-bar"
      role="navigation"
      aria-label="Navegação principal"
      data-testid="bottom-tab-bar"
    >
      {/* 1. Treinar */}
      <button
        type="button"
        onClick={() => props.onSelectTab('train')}
        class={`tab-item ${props.activeTab === 'train' ? 'active' : ''}`}
        aria-label="Treinar"
        data-testid="tab-train"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
        <span class="tab-label">Treinar</span>
      </button>

      {/* 2. Rotinas */}
      <button
        type="button"
        onClick={() => props.onSelectTab('routines')}
        class={`tab-item ${props.activeTab === 'routines' ? 'active' : ''}`}
        aria-label="Rotinas"
        data-testid="tab-routines"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span class="tab-label">Rotinas</span>
      </button>

      {/* 3. Histórico */}
      <button
        type="button"
        onClick={() => props.onSelectTab('history')}
        class={`tab-item ${props.activeTab === 'history' ? 'active' : ''}`}
        aria-label="Histórico"
        data-testid="tab-history"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span class="tab-label">Histórico</span>
      </button>

      {/* 4. Exercícios */}
      <button
        type="button"
        onClick={() => props.onSelectTab('exercises')}
        class={`tab-item ${props.activeTab === 'exercises' ? 'active' : ''}`}
        aria-label="Exercícios"
        data-testid="tab-exercises"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <span class="tab-label">Exercícios</span>
      </button>
    </nav>
  );
};

