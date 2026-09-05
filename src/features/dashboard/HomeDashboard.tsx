import { createSignal, onMount, For, Show, type Component } from 'solid-js';
import { Effect } from 'effect';
import { RoutineRepository } from '../../storage/repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../../storage/repositories/WorkoutSessionRepository';
import type { Routine } from '../../domain/routine';
import type { WorkoutSession } from '../../domain/session';
import { DEFAULT_SAMPLE_ROUTINES } from '../../catalog/defaultRoutines';
import { HeroWorkoutCard } from './HeroWorkoutCard';
import { WorkoutHeatmap } from './WorkoutHeatmap';
import { WeeklyAgenda } from './WeeklyAgenda';
import { RoutineManagerSheet } from './RoutineManagerSheet';

export interface HomeDashboardProps {
  onStartWorkout: (routine: Routine) => void;
  onResumeActiveWorkout?: () => void;
  hasActiveWorkout?: boolean;
  onNavigateTab?: (tab: 'train' | 'routines' | 'history' | 'exercises' | 'settings') => void;
}

export const HomeDashboard: Component<HomeDashboardProps> = (props) => {
  const [routines, setRoutines] = createSignal<Routine[]>([]);
  const [sessions, setSessions] = createSignal<WorkoutSession[]>([]);
  const [selectedRoutine, setSelectedRoutine] = createSignal<Routine | null>(null);

  const [statsView, setStatsView] = createSignal<'heatmap' | 'agenda'>('heatmap');
  const [isRoutineSheetOpen, setIsRoutineSheetOpen] = createSignal(false);

  const loadData = async () => {
    let [allRoutines, allSessions] = await Promise.all([
      Effect.runPromise(RoutineRepository.listAll()),
      Effect.runPromise(WorkoutSessionRepository.listAll()),
    ]);

    if (allRoutines.length === 0) {
      for (const r of DEFAULT_SAMPLE_ROUTINES) {
        await Effect.runPromise(RoutineRepository.save(r));
      }
      allRoutines = await Effect.runPromise(RoutineRepository.listAll());
    }

    setRoutines(allRoutines);
    setSessions(allSessions);
  };

  onMount(() => {
    loadData();
  });

  return (
    <div
      class="w-full min-h-[100dvh] bg-theme-bg text-theme-primary p-4 pb-28 max-w-lg mx-auto flex flex-col gap-5 select-none theme-transition"
      data-testid="home-dashboard"
    >
      {/* Top Header */}
      <header class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Lifta Logo"
            class="w-9 h-9 rounded-xl object-cover shadow-lg shadow-black/40 border border-theme-subtle"
          />
          <div>
            <h1 class="text-base font-black tracking-tight text-theme-primary">
              LIFTA
            </h1>
            <span class="text-[10px] uppercase font-mono tracking-wider text-theme-secondary block">
              Gym Tracking & Agent Engine
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (props.onNavigateTab) props.onNavigateTab('settings');
            }}
            class="w-9 h-9 rounded-xl bg-theme-surface border border-theme-separator text-theme-secondary hover:text-theme-primary active:scale-95 flex items-center justify-center transition-all cursor-pointer"
            title="Ajustes e Tema"
            aria-label="Configurações"
            data-testid="btn-open-settings"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIsRoutineSheetOpen(true)}
            class="h-9 px-3 rounded-xl bg-theme-surface border border-theme-separator text-theme-secondary hover:text-theme-primary active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            data-testid="btn-open-routines"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Fichas
          </button>
        </div>
      </header>

      {/* Active Workout Recovery Banner (if user navigated away while workout active) */}
      <Show when={props.hasActiveWorkout}>
        <div
          class="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between animate-pulse"
          data-testid="active-workout-recovery-banner"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span class="text-xs font-bold text-emerald-400">
              Você tem um treino em andamento!
            </span>
          </div>
          <button
            type="button"
            onClick={props.onResumeActiveWorkout}
            class="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md active:scale-95 transition-transform"
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
          <span class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold">
            Atividade & Planejamento
          </span>

          {/* Segmented Switch */}
          <div class="flex items-center p-1 rounded-xl bg-theme-surface border border-theme-subtle text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setStatsView('heatmap')}
              class={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statsView() === 'heatmap'
                  ? 'bg-theme-elevated text-theme-primary shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
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
                  ? 'bg-theme-elevated text-theme-primary shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
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

      {/* Quick Access to Other Routines (matching prototype) */}
      <div class="flex flex-col gap-2">
        <span class="text-xs font-mono uppercase tracking-wider text-theme-secondary font-semibold">
          Outras Fichas
        </span>
        <div class="flex flex-col gap-2">
          <For
            each={routines().slice(0, 3)}
            fallback={
              <div class="p-4 rounded-2xl bg-theme-surface border border-theme-subtle text-xs text-theme-tertiary font-mono text-center">
                Nenhuma outra ficha cadastrada.
              </div>
            }
          >
            {(r) => (
              <div
                class="p-3.5 rounded-2xl bg-theme-surface border border-theme-separator hover:border-theme-accent/50 flex items-center justify-between cursor-pointer transition-all active:bg-theme-elevated"
                onClick={() => props.onStartWorkout(r)}
              >
                <div>
                  <h4 class="text-xs font-bold text-theme-primary">{r.name}</h4>
                  <span class="text-[10px] text-theme-secondary font-mono">
                    {r.exercises.length} exercícios
                  </span>
                </div>
                <span class="text-theme-tertiary font-mono text-xs">›</span>
              </div>
            )}
          </For>
        </div>
      </div>

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
