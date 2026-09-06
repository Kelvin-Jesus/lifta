import { onMount, Show, type Component } from 'solid-js';
import type { WorkoutSession } from '../../domain/session';
import { triggerHaptic } from '../../utils/haptics';

export interface WorkoutVictoryModalProps {
  session: WorkoutSession;
  onDismiss: () => void;
}

export const WorkoutVictoryModal: Component<WorkoutVictoryModalProps> = (props) => {
  onMount(() => {
    triggerHaptic('victory');
  });

  const totalCompletedSets = () => {
    return props.session.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
  };

  const totalSets = () => {
    return props.session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  };

  const bestLift = () => {
    let maxWeight = 0;
    let exerciseName = '';
    for (const ex of props.session.exercises) {
      for (const s of ex.sets) {
        if (s.type === 'resistance' && (s as any).weightKg > maxWeight) {
          maxWeight = (s as any).weightKg;
          exerciseName = ex.exerciseName ?? '';
        }
      }
    }
    return maxWeight > 0 ? { exerciseName, maxWeight } : null;
  };

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      data-testid="workout-victory-modal"
    >
      <div
        class="victory-card w-full max-w-sm rounded-3xl bg-theme-elevated border border-theme-subtle p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
        data-testid="victory-card"
      >
        {/* Ambient Top Glow */}
        <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* 1. Victory Laurel / Trophy Emblem */}
        <div class="victory-stagger-1 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <svg class="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* 2. Header Titles */}
        <div class="victory-stagger-2 mb-6">
          <span class="text-[11px] uppercase tracking-widest font-mono text-emerald-400 font-bold block mb-1">
            Missão Cumprida
          </span>
          <h2 class="text-2xl font-black text-theme-primary tracking-tight">
            Treino Concluído!
          </h2>
          <p class="text-xs text-theme-secondary mt-1">
            {props.session.routineName ?? 'Treino de Hoje'}
          </p>
        </div>

        {/* 3. Metrics Grid (2x2) */}
        <div class="victory-stagger-3 grid grid-cols-2 gap-2.5 w-full mb-5">
          <div class="p-3 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col items-center">
            <span class="text-[10px] uppercase font-mono text-theme-secondary">Volume Total</span>
            <span class="text-lg font-bold text-theme-primary tabular-nums mt-0.5">
              {props.session.totalVolumeKg.toLocaleString('pt-BR')} <span class="text-xs font-normal text-theme-secondary">kg</span>
            </span>
          </div>

          <div class="p-3 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col items-center">
            <span class="text-[10px] uppercase font-mono text-theme-secondary">Duração</span>
            <span class="text-lg font-bold text-theme-primary tabular-nums mt-0.5">
              {props.session.durationMinutes} <span class="text-xs font-normal text-theme-secondary">min</span>
            </span>
          </div>

          <div class="p-3 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col items-center">
            <span class="text-[10px] uppercase font-mono text-theme-secondary">Séries</span>
            <span class="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
              {totalCompletedSets()} <span class="text-xs font-normal text-theme-secondary">/ {totalSets()}</span>
            </span>
          </div>

          <div class="p-3 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col items-center">
            <span class="text-[10px] uppercase font-mono text-theme-secondary">Calorias</span>
            <span class="text-lg font-bold text-theme-primary tabular-nums mt-0.5">
              ~{props.session.estimatedCalories} <span class="text-xs font-normal text-theme-secondary">kcal</span>
            </span>
          </div>
        </div>

        {/* 4. Highlight Pill (Best Lift or 100% completion) */}
        <div class="victory-stagger-4 w-full mb-6">
          <Show
            when={bestLift()}
            fallback={
              <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                ⚡ Consistência impecável: todas as séries finalizadas!
              </div>
            }
          >
            {(lift) => (
              <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 font-medium flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>
                  Maior carga: <strong>{lift().maxWeight} kg</strong> no {lift().exerciseName}
                </span>
              </div>
            )}
          </Show>
        </div>

        {/* 5. Primary Action Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            props.onDismiss();
          }}
          class="victory-stagger-5 w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.97] transition-all cursor-pointer"
          data-testid="btn-victory-confirm"
        >
          Concluir Treino
        </button>
      </div>
    </div>
  );
};
