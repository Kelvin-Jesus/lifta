import { Show, type Component } from 'solid-js';
import type { RestTimerState } from './activeWorkoutStore';

export interface FloatingRestBarProps {
  timer: RestTimerState;
  onAddSeconds: (seconds: number) => void;
  onSkip: () => void;
}

export const FloatingRestBar: Component<FloatingRestBarProps> = (props) => {
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = () => {
    if (!props.timer.active || props.timer.durationSeconds <= 0) return 0;
    const elapsed = props.timer.durationSeconds - props.timer.remainingSeconds;
    return Math.min(100, Math.max(0, (elapsed / props.timer.durationSeconds) * 100));
  };

  return (
    <Show when={props.timer.active}>
      <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm rounded-full bg-neutral-900/90 border border-neutral-750 backdrop-blur-xl shadow-2xl shadow-black/80 px-4 py-2.5 flex items-center justify-between transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 select-none"
        data-testid="floating-rest-bar"
      >
        {/* Left: Timer Display */}
        <div class="flex items-center gap-2.5">
          <div class="relative w-8 h-8 flex items-center justify-center">
            <svg class="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="currentColor"
                stroke-width="2.5"
                class="text-neutral-800"
                fill="none"
              />
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="currentColor"
                stroke-width="2.5"
                class="text-emerald-400 transition-all duration-300 ease-linear"
                fill="none"
                stroke-dasharray="81.68"
                stroke-dashoffset={81.68 - (81.68 * progressPercent()) / 100}
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div class="flex flex-col">
            <span class="text-[10px] tracking-wider uppercase text-neutral-400 font-mono font-medium">
              Descanso
            </span>
            <span
              class="text-base font-bold text-neutral-100 font-mono tracking-tight tabular-nums"
              data-testid="rest-timer-countdown"
            >
              {formatTime(props.timer.remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => props.onAddSeconds(30)}
            class="h-9 px-3 min-w-[44px] rounded-full bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-neutral-200 text-xs font-semibold tracking-wide border border-neutral-700/50 transition-all"
            data-testid="btn-add-rest-30s"
          >
            +30s
          </button>

          <button
            type="button"
            onClick={props.onSkip}
            class="h-9 px-3 min-w-[44px] rounded-full bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 text-neutral-400 active:text-white text-xs font-semibold tracking-wide border border-neutral-700/50 transition-all"
            data-testid="btn-skip-rest"
          >
            Pular
          </button>
        </div>
      </div>
    </Show>
  );
};
