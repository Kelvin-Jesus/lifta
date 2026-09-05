import { createSignal, Show, type Component } from 'solid-js';
import type { ResistanceSet, WorkoutSet } from '../../domain/set';
import type { SetKind } from '../../domain/types';

export interface SetRowProps {
  setIndex: number;
  set: WorkoutSet;
  onToggleComplete: () => void;
  onAdjustWeight: (delta: number) => void;
  onSetWeight: (val: number) => void;
  onAdjustReps: (delta: number) => void;
  onSetReps: (val: number) => void;
  onCycleKind: () => void;
  onRemoveSet?: () => void;
}

export const SetRow: Component<SetRowProps> = (props) => {
  const [isEditingWeight, setIsEditingWeight] = createSignal(false);
  const [isEditingReps, setIsEditingReps] = createSignal(false);

  const rSet = () => (props.set.type === 'resistance' ? (props.set as ResistanceSet) : null);

  const getKindLabel = (kind: SetKind) => {
    switch (kind) {
      case 'warmup':
        return 'A'; // Aquecimento
      case 'dropset':
        return 'D';
      case 'failure':
        return 'F';
      default:
        return `${props.setIndex + 1}`;
    }
  };

  const getKindBadgeClass = (kind: SetKind) => {
    switch (kind) {
      case 'warmup':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'dropset':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'failure':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border border-neutral-700/50';
    }
  };

  return (
    <div
      class={`flex items-center justify-between py-2 px-3 transition-colors duration-150 border-b border-neutral-800/60 select-none ${
        props.set.completed ? 'bg-emerald-950/15' : 'bg-transparent'
      }`}
      data-testid={`set-row-${props.setIndex}`}
    >
      {/* Set Number / Kind Switcher */}
      <button
        type="button"
        onClick={props.onCycleKind}
        title="Clique para alternar tipo de série (Normal, Aquecimento, Drop, Falha)"
        class={`w-10 h-10 min-w-[40px] rounded-lg flex items-center justify-center font-bold text-xs active:scale-95 transition-transform ${getKindBadgeClass(
          rSet()?.kind ?? 'normal'
        )}`}
        data-testid={`set-kind-btn-${props.setIndex}`}
      >
        {getKindLabel(rSet()?.kind ?? 'normal')}
      </button>

      {/* Weight Stepper */}
      <div class="flex items-center gap-1">
        <button
          type="button"
          onClick={() => props.onAdjustWeight(-2.5)}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-neutral-400 active:text-white active:bg-neutral-800 rounded-md font-bold text-sm"
          aria-label="Diminuir 2.5 kg"
          data-testid={`btn-weight-minus-${props.setIndex}`}
        >
          -
        </button>

        <Show
          when={isEditingWeight()}
          fallback={
            <button
              type="button"
              onDblClick={() => setIsEditingWeight(true)}
              onClick={() => setIsEditingWeight(true)}
              class="w-16 h-11 flex flex-col items-center justify-center rounded bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 active:border-blue-500"
              title="Toque para digitar carga"
              data-testid={`weight-display-${props.setIndex}`}
            >
              <span class="text-sm font-semibold text-neutral-100 tabular-nums">
                {rSet()?.weightKg ?? 0}
              </span>
              <span class="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">kg</span>
            </button>
          }
        >
          <input
            type="number"
            step="0.5"
            min="0"
            autofocus
            value={rSet()?.weightKg ?? 0}
            onBlur={(e) => {
              const val = parseFloat(e.currentTarget.value);
              if (!isNaN(val)) props.onSetWeight(val);
              setIsEditingWeight(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseFloat(e.currentTarget.value);
                if (!isNaN(val)) props.onSetWeight(val);
                setIsEditingWeight(false);
              }
            }}
            class="w-16 h-11 text-center bg-neutral-900 text-white rounded border border-blue-500 font-semibold text-sm outline-none"
          />
        </Show>

        <button
          type="button"
          onClick={() => props.onAdjustWeight(2.5)}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-neutral-400 active:text-white active:bg-neutral-800 rounded-md font-bold text-sm"
          aria-label="Aumentar 2.5 kg"
          data-testid={`btn-weight-plus-${props.setIndex}`}
        >
          +
        </button>
      </div>

      {/* Reps Stepper */}
      <div class="flex items-center gap-1">
        <button
          type="button"
          onClick={() => props.onAdjustReps(-1)}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-neutral-400 active:text-white active:bg-neutral-800 rounded-md font-bold text-sm"
          aria-label="Diminuir 1 repetição"
          data-testid={`btn-reps-minus-${props.setIndex}`}
        >
          -
        </button>

        <Show
          when={isEditingReps()}
          fallback={
            <button
              type="button"
              onDblClick={() => setIsEditingReps(true)}
              onClick={() => setIsEditingReps(true)}
              class="w-14 h-11 flex flex-col items-center justify-center rounded bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 active:border-blue-500"
              title="Toque para digitar reps"
              data-testid={`reps-display-${props.setIndex}`}
            >
              <span class="text-sm font-semibold text-neutral-100 tabular-nums">
                {rSet()?.reps ?? 0}
              </span>
              <span class="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">reps</span>
            </button>
          }
        >
          <input
            type="number"
            min="0"
            autofocus
            value={rSet()?.reps ?? 0}
            onBlur={(e) => {
              const val = parseInt(e.currentTarget.value, 10);
              if (!isNaN(val)) props.onSetReps(val);
              setIsEditingReps(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseInt(e.currentTarget.value, 10);
                if (!isNaN(val)) props.onSetReps(val);
                setIsEditingReps(false);
              }
            }}
            class="w-14 h-11 text-center bg-neutral-900 text-white rounded border border-blue-500 font-semibold text-sm outline-none"
          />
        </Show>

        <button
          type="button"
          onClick={() => props.onAdjustReps(1)}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-neutral-400 active:text-white active:bg-neutral-800 rounded-md font-bold text-sm"
          aria-label="Aumentar 1 repetição"
          data-testid={`btn-reps-plus-${props.setIndex}`}
        >
          +
        </button>
      </div>

      {/* Status Checkbox Circle (44x44px touch target) */}
      <button
        type="button"
        onClick={props.onToggleComplete}
        class={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center active:scale-90 transition-all ${
          props.set.completed
            ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-950/40'
            : 'border-2 border-neutral-700 text-transparent hover:border-neutral-500'
        }`}
        aria-label={props.set.completed ? 'Desmarcar série' : 'Concluir série'}
        data-testid={`btn-complete-set-${props.setIndex}`}
      >
        <svg
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="3"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  );
};
