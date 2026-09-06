import { createSignal, Show, onCleanup, type Component } from 'solid-js';
import type { ResistanceSet, WorkoutSet } from '../../domain/set';
import type { SetKind } from '../../domain/types';
import { triggerHaptic } from '../../utils/haptics';

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

function createHoldAction(callback: () => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;
  let lastPointerDownTime = 0;

  const stop = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    lastPointerDownTime = Date.now();
    callback();
    triggerHaptic('light');

    timer = setTimeout(() => {
      let count = 0;
      const tick = () => {
        callback();
        triggerHaptic('light');
        count++;
        if (count === 6 && interval) {
          clearInterval(interval);
          interval = setInterval(tick, 50);
        }
      };
      interval = setInterval(tick, 100);
    }, 350);
  };

  const onClick = () => {
    if (Date.now() - lastPointerDownTime < 300) {
      return;
    }
    callback();
    triggerHaptic('light');
  };

  onCleanup(() => {
    stop();
  });

  return {
    onPointerDown,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick,
  };
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
        return 'bg-theme-elevated text-theme-secondary border border-theme-subtle';
    }
  };

  const weightMinus = createHoldAction(() => props.onAdjustWeight(-2.5));
  const weightPlus = createHoldAction(() => props.onAdjustWeight(2.5));
  const repsMinus = createHoldAction(() => props.onAdjustReps(-1));
  const repsPlus = createHoldAction(() => props.onAdjustReps(1));

  return (
    <div
      class={`flex items-center justify-between py-2 px-3 transition-colors duration-150 border-b border-theme-subtle select-none ${
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
          onPointerDown={weightMinus.onPointerDown}
          onPointerUp={weightMinus.onPointerUp}
          onPointerLeave={weightMinus.onPointerLeave}
          onPointerCancel={weightMinus.onPointerCancel}
          onClick={weightMinus.onClick}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-theme-secondary active:text-theme-primary active:bg-theme-elevated rounded-md font-bold text-sm select-none active:scale-95 transition-transform"
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
              class="w-16 h-11 flex flex-col items-center justify-center rounded-lg bg-theme-elevated border border-theme-subtle hover:border-theme-separator active:border-blue-500 transition-colors"
              title="Toque para digitar carga"
              data-testid={`weight-display-${props.setIndex}`}
            >
              <span class="text-sm font-semibold text-theme-primary tabular-nums">
                {rSet()?.weightKg ?? 0}
              </span>
              <span class="text-[9px] uppercase tracking-wider text-theme-secondary font-mono">kg</span>
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
            class="w-16 h-11 text-center bg-theme-elevated text-theme-primary rounded-lg border border-blue-500 font-semibold text-sm outline-none"
          />
        </Show>

        <button
          type="button"
          onPointerDown={weightPlus.onPointerDown}
          onPointerUp={weightPlus.onPointerUp}
          onPointerLeave={weightPlus.onPointerLeave}
          onPointerCancel={weightPlus.onPointerCancel}
          onClick={weightPlus.onClick}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-theme-secondary active:text-theme-primary active:bg-theme-elevated rounded-lg font-bold text-sm select-none active:scale-95 transition-transform"
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
          onPointerDown={repsMinus.onPointerDown}
          onPointerUp={repsMinus.onPointerUp}
          onPointerLeave={repsMinus.onPointerLeave}
          onPointerCancel={repsMinus.onPointerCancel}
          onClick={repsMinus.onClick}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-theme-secondary active:text-theme-primary active:bg-theme-elevated rounded-lg font-bold text-sm select-none active:scale-95 transition-transform"
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
              class="w-14 h-11 flex flex-col items-center justify-center rounded-lg bg-theme-elevated border border-theme-subtle hover:border-theme-separator active:border-blue-500 transition-colors"
              title="Toque para digitar reps"
              data-testid={`reps-display-${props.setIndex}`}
            >
              <span class="text-sm font-semibold text-theme-primary tabular-nums">
                {rSet()?.reps ?? 0}
              </span>
              <span class="text-[9px] uppercase tracking-wider text-theme-secondary font-mono">reps</span>
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
            class="w-14 h-11 text-center bg-theme-elevated text-theme-primary rounded-lg border border-blue-500 font-semibold text-sm outline-none"
          />
        </Show>

        <button
          type="button"
          onPointerDown={repsPlus.onPointerDown}
          onPointerUp={repsPlus.onPointerUp}
          onPointerLeave={repsPlus.onPointerLeave}
          onPointerCancel={repsPlus.onPointerCancel}
          onClick={repsPlus.onClick}
          class="w-10 h-11 min-w-[40px] flex items-center justify-center text-theme-secondary active:text-theme-primary active:bg-theme-elevated rounded-lg font-bold text-sm select-none active:scale-95 transition-transform"
          aria-label="Aumentar 1 repetição"
          data-testid={`btn-reps-plus-${props.setIndex}`}
        >
          +
        </button>
      </div>

      {/* Completion Toggle Status Button (44px target) */}
      <div class="flex justify-end pr-1">
        <button
          type="button"
          onClick={props.onToggleComplete}
          class={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            props.set.completed
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
              : 'bg-theme-elevated border border-theme-subtle text-theme-secondary hover:border-theme-separator active:scale-95'
          }`}
          aria-label={
            props.set.completed
              ? 'Desmarcar série'
              : `Concluir série ${props.setIndex + 1}`
          }
          data-testid={`btn-complete-set-${props.setIndex}`}
        >
          <Show
            when={props.set.completed}
            fallback={
              <svg class="w-4 h-4 text-theme-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            }
          >
            <svg class="w-5 h-5 text-white stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </Show>
        </button>
      </div>
    </div>
  );
};
