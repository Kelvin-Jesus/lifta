import { createSignal, onMount, Show, type Component } from 'solid-js';
import { Effect } from 'effect';
import { RoutineRepository } from '../../storage/repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../../storage/repositories/WorkoutSessionRepository';
import { SettingsRepository, type Settings } from '../../storage/repositories/SettingsRepository';
import type { Routine } from '../../domain/routine';
import type { WorkoutSession } from '../../domain/session';
import { HeroWorkoutCard } from './HeroWorkoutCard';
import { WorkoutHeatmap } from './WorkoutHeatmap';
import { WeeklyAgenda } from './WeeklyAgenda';
import { ThemeSelector } from './ThemeSelector';
import { RoutineManagerSheet } from './RoutineManagerSheet';

export interface HomeDashboardProps {
  onStartWorkout: (routine: Routine) => void;
  onResumeActiveWorkout?: () => void;
  hasActiveWorkout?: boolean;
}

export const HomeDashboard: Component<HomeDashboardProps> = (props) => {
  const [routines, setRoutines] = createSignal<Routine[]>([]);
  const [sessions, setSessions] = createSignal<WorkoutSession[]>([]);
  const [settings, setSettings] = createSignal<Settings | undefined>(undefined);
  const [selectedRoutine, setSelectedRoutine] = createSignal<Routine | null>(null);

  const [statsView, setStatsView] = createSignal<'heatmap' | 'agenda'>('heatmap');
  const [isRoutineSheetOpen, setIsRoutineSheetOpen] = createSignal(false);
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);

  const loadData = async () => {
    const [allRoutines, allSessions, appSettings] = await Promise.all([
      Effect.runPromise(RoutineRepository.listAll()),
      Effect.runPromise(WorkoutSessionRepository.listAll()),
      Effect.runPromise(SettingsRepository.getSettings()),
    ]);

    setRoutines(allRoutines);
    setSessions(allSessions);
    setSettings(appSettings);
  };

  onMount(() => {
    loadData();
  });

  return (
    <div
      class="w-full min-h-[100dvh] bg-neutral-950 text-neutral-100 p-4 pb-20 max-w-lg mx-auto flex flex-col gap-5 select-none"
      data-testid="home-dashboard"
    >
      {/* Top Header */}
      <header class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-950/60">
            L
          </div>
          <div>
            <h1 class="text-base font-black tracking-tight text-neutral-100">
              LIFTA
            </h1>
            <span class="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">
              Gym Tracking & Agent Engine
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen())}
            class="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            title="Configurações e Tema"
            data-testid="btn-open-settings"
          >
            ⚙️
          </button>
          <button
            type="button"
            onClick={() => setIsRoutineSheetOpen(true)}
            class="h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            data-testid="btn-open-routines"
          >
            Fichas
          </button>
        </div>
      </header>

      {/* Active Workout Recovery Banner (if user navigated away while workout active) */}
      <Show when={props.hasActiveWorkout}>
        <div
          class="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between animate-pulse"
          data-testid="active-workout-recovery-banner"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span class="text-xs font-bold text-emerald-300">
              Você tem um treino em andamento!
            </span>
          </div>
          <button
            type="button"
            onClick={props.onResumeActiveWorkout}
            class="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md"
            data-testid="btn-resume-workout"
          >
            Retomar
          </button>
        </div>
      </Show>

      {/* Hero Workout Card of the Day */}
      <HeroWorkoutCard
        routines={routines()}
        selectedRoutine={selectedRoutine()}
        onSelectRoutine={setSelectedRoutine}
        onStartWorkout={props.onStartWorkout}
      />

      {/* Stats Container with Segment Switcher: Heatmap vs Agenda */}
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
            Atividade & Planejamento
          </span>

          {/* Segmented Switch */}
          <div class="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setStatsView('heatmap')}
              class={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statsView() === 'heatmap'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              data-testid="tab-heatmap"
            >
              Heatmap
            </button>
            <button
              type="button"
              onClick={() => setStatsView('agenda')}
              class={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statsView() === 'agenda'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              data-testid="tab-agenda"
            >
              Agenda
            </button>
          </div>
        </div>

        <Show
          when={statsView() === 'heatmap'}
          fallback={
            <WeeklyAgenda
              routines={routines()}
              sessions={sessions()}
              onStartRoutine={props.onStartWorkout}
            />
          }
        >
          <WorkoutHeatmap sessions={sessions()} />
        </Show>
      </div>

      {/* Settings / Theme Collapsible Section */}
      <Show when={isSettingsOpen()}>
        <div class="animate-in fade-in duration-200">
          <ThemeSelector initialSettings={settings()} />
        </div>
      </Show>

      {/* Routine Manager Sheet */}
      <RoutineManagerSheet
        isOpen={isRoutineSheetOpen()}
        onClose={() => setIsRoutineSheetOpen(false)}
        routines={routines()}
        onRoutinesUpdated={loadData}
      />
    </div>
  );
};
