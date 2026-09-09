import { createSignal, onMount, For, Show, type Component } from 'solid-js';
import { Effect } from 'effect';
import { RoutineRepository } from '../../storage/repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../../storage/repositories/WorkoutSessionRepository';
import type { Routine } from '../../domain/routine';
import type { WorkoutSession } from '../../domain/session';
import { DEFAULT_SAMPLE_ROUTINES } from '../../catalog/defaultRoutines';
import { getSampleSessions } from '../../catalog/defaultSessions';
import { HeroWorkoutCard, determineSuggestedRoutine } from './HeroWorkoutCard';
import { WorkoutHeatmap } from './WorkoutHeatmap';
import { WeeklyAgenda } from './WeeklyAgenda';
import { RoutineManagerSheet } from './RoutineManagerSheet';
import {
  type StatsMetric,
  formatCalories,
  formatTonnage,
  calculateCurrentWeekStats,
} from '../../domain/metrics';

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

  const getInitialMetric = (): StatsMetric => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('lifta_stats_metric');
        if (saved === 'tonnage' || saved === 'calories') return saved;
      }
    } catch {}
    return 'calories';
  };

  const [statsView, setStatsView] = createSignal<'heatmap' | 'agenda'>('heatmap');
  const [statsMetric, setStatsMetric] = createSignal<StatsMetric>(getInitialMetric());
  const [isRoutineSheetOpen, setIsRoutineSheetOpen] = createSignal(false);

  const handleSetMetric = (metric: StatsMetric) => {
    setStatsMetric(metric);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('lifta_stats_metric', metric);
      }
    } catch {}
  };

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

    if (allSessions.length === 0) {
      for (const s of getSampleSessions()) {
        await Effect.runPromise(WorkoutSessionRepository.save(s));
      }
      allSessions = await Effect.runPromise(WorkoutSessionRepository.listAll());
    }

    setRoutines(allRoutines);
    setSessions(allSessions);
  };

  onMount(() => {
    loadData();
  });

  const todayRoutine = () => selectedRoutine() ?? determineSuggestedRoutine(routines());

  const otherRoutines = () => {
    const current = todayRoutine();
    if (!current) return routines();
    const rest = routines().filter((r) => r.id !== current.id);
    return rest.length > 0 ? rest : routines();
  };

  const currentWeekStats = () => calculateCurrentWeekStats(sessions());

  const statsTitle = () => {
    if (statsView() === 'agenda') return 'Agenda da Semana';
    return statsMetric() === 'calories' ? 'Frequência e Calorias' : 'Frequência e Tonelagem';
  };

  const statsMeta = () => {
    if (statsView() === 'agenda') {
      return '3 de 5 concluídos';
    }
    const stats = currentWeekStats();
    const count = stats.workoutCount;
    const label = count === 1 ? 'treino' : 'treinos';

    if (statsMetric() === 'calories') {
      const cal = count > 0 ? formatCalories(stats.totalCalories) : '~1.820 kcal';
      return `${count > 0 ? count : 4} ${label} • ${cal}`;
    } else {
      const ton = count > 0 ? formatTonnage(stats.totalVolumeKg) : '16.400 kg';
      return `${count > 0 ? count : 4} ${label} • ${ton}`;
    }
  };

  return (
    <div
      class="tab-content"
      id="tab-container"
      data-testid="home-dashboard"
    >
      {/* Active Workout Recovery Banner */}
      <Show when={props.hasActiveWorkout}>
        <div
          class="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between"
          data-testid="active-workout-recovery-banner"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span class="text-xs font-bold text-emerald-400">
              Você tem um treino em andamento!
            </span>
          </div>
          <button
            type="button"
            onClick={props.onResumeActiveWorkout}
            class="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
            data-testid="btn-resume-workout"
          >
            Retomar
          </button>
        </div>
      </Show>

      {/* 1. Heatmap & Agenda Card */}
      <div class="heatmap-card">
        <div class="heatmap-header">
          <div class="heatmap-title-group">
            <span class="heatmap-title" id="stats-header-title">
              {statsTitle()}
            </span>
            <span class="heatmap-meta" id="stats-header-meta">
              {statsMeta()}
            </span>
          </div>

          <div class="heatmap-header-actions">
            <Show when={statsView() === 'heatmap'}>
              <div
                class="metric-toggle-pill"
                role="group"
                aria-label="Alternar métrica de exibição"
                data-testid="metric-toggle-group"
              >
                <button
                  type="button"
                  class={`metric-pill-btn ${statsMetric() === 'calories' ? 'active' : ''}`}
                  onClick={() => handleSetMetric('calories')}
                  data-testid="btn-metric-calories"
                  aria-pressed={statsMetric() === 'calories'}
                  title="Frequência + Calorias"
                >
                  kcal
                </button>
                <button
                  type="button"
                  class={`metric-pill-btn ${statsMetric() === 'tonnage' ? 'active' : ''}`}
                  onClick={() => handleSetMetric('tonnage')}
                  data-testid="btn-metric-tonnage"
                  aria-pressed={statsMetric() === 'tonnage'}
                  title="Frequência + Tonelagem"
                >
                  kg
                </button>
              </div>
            </Show>

            <button
              type="button"
              class="view-toggle-btn"
              onClick={() => setStatsView(statsView() === 'heatmap' ? 'agenda' : 'heatmap')}
              data-testid={statsView() === 'heatmap' ? 'tab-agenda' : 'tab-heatmap'}
              id="toggle-agenda-btn"
            >
              <Show
                when={statsView() === 'heatmap'}
                fallback={
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>Grid</span>
                  </>
                }
              >
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Agenda</span>
                </>
              </Show>
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
          <WorkoutHeatmap sessions={sessions()} metric={statsMetric()} />
        </Show>
      </div>

      {/* 2. Hero Workout Card of the Day */}
      <HeroWorkoutCard
        routines={routines()}
        selectedRoutine={selectedRoutine()}
        onSelectRoutine={setSelectedRoutine}
        onStartWorkout={props.onStartWorkout}
      />

      {/* 3. Quick Access to Other Routines (.inset-list matching prototype) */}
      <div>
        <div class="flex items-center justify-between" style="margin-bottom: 8px;">
          <div class="section-label">Outras Rotinas</div>
          <button
            type="button"
            onClick={() => setIsRoutineSheetOpen(true)}
            class="text-[11px] font-semibold text-theme-accent hover:underline cursor-pointer"
            data-testid="btn-open-routines"
          >
            Gerenciar
          </button>
        </div>
        <div class="inset-list">
          <For
            each={otherRoutines().slice(0, 2)}
            fallback={
              <div class="p-4 text-center text-xs text-theme-secondary">
                Nenhuma outra rotina cadastrada.
              </div>
            }
          >
            {(r) => (
              <div class="list-row" onClick={() => props.onStartWorkout(r)}>
                <div>
                  <div class="row-title">{r.name}</div>
                  <div class="row-desc">
                    Última execução: Há 2 dias • ~420 kcal
                  </div>
                </div>
                <span class="row-arrow">›</span>
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
