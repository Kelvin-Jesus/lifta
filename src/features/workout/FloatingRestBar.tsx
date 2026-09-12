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
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] w-[92%] max-w-sm rounded-full bg-theme-surface/95 border border-theme-separator backdrop-blur-xl shadow-2xl px-4 py-2.5 flex items-center justify-between transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 select-none theme-transition"
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
                class="text-theme-elevated"
                fill="none"
              />
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="currentColor"
                stroke-width="2.5"
                class="text-emerald-500 transition-all duration-300 ease-linear"
                fill="none"
                stroke-dasharray="81.68"
                stroke-dashoffset={81.68 - (81.68 * progressPercent()) / 100}
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div class="flex flex-col">
            <span class="text-[10px] tracking-wider uppercase text-theme-secondary font-mono font-medium">
              Descanso
            </span>
            <span
              class="text-base font-bold text-theme-primary font-mono tracking-tight tabular-nums"
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
            class="h-9 px-3 min-w-[44px] rounded-full bg-theme-elevated hover:opacity-90 active:scale-95 text-theme-primary text-xs font-semibold tracking-wide border border-theme-subtle transition-all"
            data-testid="btn-add-rest-30s"
          >
            +30s
          </button>

          <button
            type="button"
            onClick={props.onSkip}
            class="h-9 px-3 min-w-[44px] rounded-full bg-theme-elevated hover:opacity-90 active:scale-95 text-theme-secondary active:text-theme-primary text-xs font-semibold tracking-wide border border-theme-subtle transition-all"
            data-testid="btn-skip-rest"
          >
            Pular
          </button>
        </div>
      </div>
    </Show>
  );
};
