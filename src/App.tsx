import { createSignal, onMount, Show, type Component } from 'solid-js';
import { Effect } from 'effect';
import { HomeDashboard } from './features/dashboard/HomeDashboard';
import { RoutinesView } from './features/routines/RoutinesView';
import { HistoryView } from './features/history/HistoryView';
import { CatalogView } from './features/catalog/CatalogView';
import { SettingsView } from './features/settings/SettingsView';
import { BottomTabBar, type TabId } from './components/BottomTabBar';
import { WorkoutDeck } from './features/workout/WorkoutDeck';
import { activeWorkoutStore } from './features/workout/activeWorkoutStore';
import { RoutineRepository } from './storage/repositories/RoutineRepository';
import { WorkoutSessionRepository } from './storage/repositories/WorkoutSessionRepository';
import { ActiveSessionRepository } from './storage/repositories/ActiveSessionRepository';
import { SettingsRepository } from './storage/repositories/SettingsRepository';
import { initWebMCPPolyfill } from './webmcp/modelContextPolyfill';
import { registerAllWebMCPTools } from './webmcp/tools';
import { registerServiceWorker } from './pwa';
import { startOfflineMediaWarmup } from './storage/offlineMedia';
import type { Routine } from './domain/routine';
import { DEFAULT_SAMPLE_ROUTINES } from './catalog/defaultRoutines';
import { getSampleSessions } from './catalog/defaultSessions';

/**
 * Reads the initial screen/tab from the URL so that any screen is directly
 * addressable (`/?tab=history`, `/?screen=workout`). Read-only: navigating
 * between tabs afterwards does not touch history, preserving existing behavior.
 */
export const readInitialLocation = (
  search: string
): { tab: TabId; screen: 'tabs' | 'workout' } => {
  const validTabs: readonly TabId[] = ['train', 'routines', 'history', 'exercises', 'settings'];
  let tab: TabId = 'train';
  let screen: 'tabs' | 'workout' = 'tabs';
  try {
    const params = new URLSearchParams(search);
    const requestedTab = params.get('tab');
    if (requestedTab && (validTabs as readonly string[]).includes(requestedTab)) {
      tab = requestedTab as TabId;
    }
    if (params.get('screen') === 'workout') {
      screen = 'workout';
    }
  } catch {
    // malformed URL: fall back to defaults
  }
  return { tab, screen };
};

export const App: Component = () => {
  const initialLocation = readInitialLocation(
    typeof window === 'undefined' ? '' : window.location.search
  );
  const [currentScreen, setCurrentScreen] = createSignal<'tabs' | 'workout'>('tabs');
  const [currentTab, setCurrentTab] = createSignal<TabId>(initialLocation.tab);
  const [hasActiveWorkout, setHasActiveWorkout] = createSignal(false);
  const [currentTheme, setCurrentTheme] = createSignal<'dark' | 'light'>('dark');

  const initApp = async () => {
    // 1. Initialize WebMCP — optional integration: a failure here must never
    // stop theme restore or active-workout recovery below.
    try {
      const context = initWebMCPPolyfill();
      registerAllWebMCPTools(context);
    } catch (error) {
      console.warn('WebMCP indisponível:', error);
    }

    // 2. Register Service Worker and, on an installed PWA, make sure the
    // exercise animations are available without a connection.
    registerServiceWorker();
    startOfflineMediaWarmup();

    // 3. Initialize saved theme
    try {
      const settings = await Effect.runPromise(SettingsRepository.getSettings());
      if (settings && typeof document !== 'undefined') {
        setCurrentTheme(settings.theme);
        document.documentElement.setAttribute('data-theme', settings.theme);
        document.body.setAttribute('data-theme', settings.theme);
        document.documentElement.setAttribute('data-accent', settings.accentColor);
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {
      // ignore
    }

    // 4. Seed default routines if database is new
    const existingRoutines = await Effect.runPromise(RoutineRepository.listAll());
    if (existingRoutines.length === 0) {
      for (const r of DEFAULT_SAMPLE_ROUTINES) {
        await Effect.runPromise(RoutineRepository.save(r));
      }
    }

    // 5. Seed default sessions if database is new
    const existingSessions = await Effect.runPromise(WorkoutSessionRepository.listAll());
    if (existingSessions.length === 0) {
      for (const s of getSampleSessions()) {
        await Effect.runPromise(WorkoutSessionRepository.save(s));
      }
    }

    // 6. Check for active workout recovery (<80ms restore)
    const active = await Effect.runPromise(ActiveSessionRepository.getActive());
    if (active) {
      setHasActiveWorkout(true);
      if (initialLocation.screen === 'workout') {
        await activeWorkoutStore.resumeWorkout();
        setCurrentScreen('workout');
      }
    }
  };

  onMount(() => {
    initApp();
  });

  const toggleTheme = async () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      document.body.setAttribute('data-theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    try {
      await Effect.runPromise(SettingsRepository.updateSettings({ theme: next }));
    } catch {
      // ignore
    }
  };

  const handleStartWorkout = async (routine: Routine) => {
    await activeWorkoutStore.startWorkout(routine);
    setHasActiveWorkout(true);
    setCurrentScreen('workout');
  };

  const handleResumeWorkout = async () => {
    await activeWorkoutStore.resumeWorkout();
    setCurrentScreen('workout');
  };

  const handleWorkoutFinishedOrExit = () => {
    setHasActiveWorkout(activeWorkoutStore.session() !== null);
    setCurrentScreen('tabs');
  };

  return (
    <div class="min-h-[100dvh] w-full bg-black flex justify-center items-center select-none theme-transition">
      <main class="app-shell" role="main">
        <Show
          when={currentScreen() === 'tabs'}
          fallback={
            <WorkoutDeck
              onFinish={handleWorkoutFinishedOrExit}
              onExit={handleWorkoutFinishedOrExit}
            />
          }
        >
          {/* Header Bar persistent across all tabs */}
          <header class="header-bar">
            <div class="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Lifta Logo"
                width="28"
                height="28"
                decoding="async"
                fetchpriority="high"
                class="w-7 h-7 rounded-lg object-cover shadow-sm"
              />
              <div class="brand-title">Lifta<span class="sr-only">LIFTA</span></div>
            </div>

            <div class="header-actions">
              {/* Theme Toggle Button (Light/Dark) */}
              <button
                type="button"
                class="icon-btn"
                onClick={toggleTheme}
                aria-label="Alternar tema claro/escuro"
                title="Tema"
                data-testid="btn-toggle-theme"
              >
                <Show
                  when={currentTheme() === 'dark'}
                  fallback={
                    <svg id="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  }
                >
                  <svg id="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </Show>
              </button>

              {/* Assistant / Settings Button */}
              <button
                type="button"
                class="icon-btn"
                onClick={() => setCurrentTab('settings')}
                aria-label="Configurações"
                title="Configurações"
                data-testid="tab-settings"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          </header>

          {/* Active Tab View */}
          <Show when={currentTab() === 'train'}>
            <HomeDashboard
              onStartWorkout={handleStartWorkout}
              onResumeActiveWorkout={handleResumeWorkout}
              hasActiveWorkout={hasActiveWorkout()}
              onNavigateTab={setCurrentTab}
            />
          </Show>

          <Show when={currentTab() === 'routines'}>
            <RoutinesView onStartWorkout={handleStartWorkout} />
          </Show>

          <Show when={currentTab() === 'history'}>
            <HistoryView onStartWorkout={handleStartWorkout} />
          </Show>

          <Show when={currentTab() === 'exercises'}>
            <CatalogView />
          </Show>

          <Show when={currentTab() === 'settings'}>
            <SettingsView onBack={() => setCurrentTab('train')} />
          </Show>

          {/* Persistent iOS Bottom Tab Bar */}
          <BottomTabBar
            activeTab={currentTab()}
            onSelectTab={setCurrentTab}
          />
        </Show>
      </main>
    </div>
  );
};
