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
import { ActiveSessionRepository } from './storage/repositories/ActiveSessionRepository';
import { SettingsRepository } from './storage/repositories/SettingsRepository';
import { initWebMCPPolyfill } from './webmcp/modelContextPolyfill';
import { registerAllWebMCPTools } from './webmcp/tools';
import { registerServiceWorker } from './pwa';
import type { Routine } from './domain/routine';
import { DEFAULT_SAMPLE_ROUTINES } from './catalog/defaultRoutines';

export const App: Component = () => {
  const [currentScreen, setCurrentScreen] = createSignal<'tabs' | 'workout'>('tabs');
  const [currentTab, setCurrentTab] = createSignal<TabId>('train');
  const [hasActiveWorkout, setHasActiveWorkout] = createSignal(false);

  const initApp = async () => {
    // 1. Initialize WebMCP
    const context = initWebMCPPolyfill();
    registerAllWebMCPTools(context);

    // 2. Register Service Worker
    registerServiceWorker();

    // 3. Initialize saved theme
    try {
      const settings = await Effect.runPromise(SettingsRepository.getSettings());
      if (settings && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', settings.theme);
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

    // 5. Check for active workout recovery (<80ms restore)
    const active = await Effect.runPromise(ActiveSessionRepository.getActive());
    if (active) {
      setHasActiveWorkout(true);
    }
  };

  onMount(() => {
    initApp();
  });

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
    <div class="min-h-[100dvh] w-full bg-theme-bg text-theme-primary font-sans selection:bg-blue-500/30 selection:text-white flex justify-center theme-transition">
      <div class="w-full max-w-[440px] min-h-[100dvh] flex flex-col relative bg-theme-bg shadow-2xl">
        <Show
          when={currentScreen() === 'tabs'}
          fallback={
            <WorkoutDeck
              onFinish={handleWorkoutFinishedOrExit}
              onExit={handleWorkoutFinishedOrExit}
            />
          }
        >
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
            <HistoryView />
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
      </div>
    </div>
  );
};
