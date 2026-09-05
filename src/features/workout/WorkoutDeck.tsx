import { For, Show, createSignal, onMount, type Component } from 'solid-js';
import { activeWorkoutStore } from './activeWorkoutStore';
import { MuscleFocusCard } from './MuscleFocusCard';
import { ExerciseCard } from './ExerciseCard';
import { FloatingRestBar } from './FloatingRestBar';
import { SubstituteExerciseSheet } from './SubstituteExerciseSheet';

export interface WorkoutDeckProps {
  onFinish?: () => void;
  onExit?: () => void;
}

export const WorkoutDeck: Component<WorkoutDeckProps> = (props) => {
  let carouselRef: HTMLDivElement | undefined;

  const [activePageIndex, setActivePageIndex] = createSignal(0);
  const [substituteExerciseIndex, setSubstituteExerciseIndex] = createSignal<number | null>(null);
  const [toastMessage, setToastMessage] = createSignal<string | null>(null);

  const session = () => activeWorkoutStore.session();
  const restTimer = () => activeWorkoutStore.restTimer();
  const elapsed = () => activeWorkoutStore.elapsedSeconds();

  const exercises = () => session()?.exercises ?? [];

  const formatElapsed = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [dragOffset, setDragOffset] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isHorizontalGesture: boolean | null = null;

  const scrollToExercise = (index: number) => {
    if (index < 0 || index >= exercises().length) return;
    setActivePageIndex(index);
    activeWorkoutStore.setActiveExerciseIndex(index);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isHorizontalGesture = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    if (isHorizontalGesture === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalGesture) {
      // Apply rubber banding at outer edges
      const isAtLeft = activePageIndex() === 0 && deltaX > 0;
      const isAtRight = activePageIndex() === exercises().length - 1 && deltaX < 0;
      const effectiveDelta = isAtLeft || isAtRight ? deltaX * 0.35 : deltaX;
      setDragOffset(effectiveDelta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging()) return;
    setIsDragging(false);
    const delta = dragOffset();
    const duration = Date.now() - touchStartTime;
    setDragOffset(0);

    if (isHorizontalGesture) {
      const isFlick = duration < 320 && Math.abs(delta) > 25;
      const isDrag = Math.abs(delta) > 60;

      if (isFlick || isDrag) {
        if (delta < 0 && activePageIndex() < exercises().length - 1) {
          scrollToExercise(activePageIndex() + 1);
        } else if (delta > 0 && activePageIndex() > 0) {
          scrollToExercise(activePageIndex() - 1);
        }
      }
    }
    isHorizontalGesture = null;
  };

  onMount(() => {
    const active = session()?.activeExerciseIndex ?? 0;
    if (active > 0) {
      scrollToExercise(active);
    }
  });

  return (
    <div
      class="w-full h-[100dvh] max-h-[100dvh] flex flex-col bg-theme-bg text-theme-primary overflow-hidden select-none theme-transition"
      data-testid="workout-deck"
    >
      {/* Top Header Bar */}
      <header class="p-3 border-b border-theme-separator bg-theme-surface/90 backdrop-blur-md flex-shrink-0 theme-transition">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={props.onExit}
              class="w-8 h-8 rounded-full bg-theme-elevated hover:opacity-80 active:scale-95 flex items-center justify-center text-theme-secondary hover:text-theme-primary transition-all"
              aria-label="Sair"
              data-testid="btn-deck-exit"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 class="text-sm font-bold tracking-tight text-theme-primary truncate max-w-[200px]">
              {session()?.routineName ?? 'Treino Ativo'}
            </h1>
          </div>

          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-theme-elevated border border-theme-subtle">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span
              class="text-xs font-mono font-bold text-theme-primary tabular-nums"
              data-testid="elapsed-time-display"
            >
              {formatElapsed(elapsed())}
            </span>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div
          class="flex items-center gap-1.5 w-full cursor-pointer"
          data-testid="segmented-progress-bar"
        >
          <For each={exercises()}>
            {(ex, idx) => {
              const isAllComplete = () =>
                ex.sets.length > 0 && ex.sets.every((s) => s.completed);
              const isCurrent = () => idx() === activePageIndex();

              return (
                <button
                  type="button"
                  onClick={() => scrollToExercise(idx())}
                  class={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isCurrent()
                      ? 'bg-blue-500 ring-2 ring-blue-500/40'
                      : isAllComplete()
                      ? 'bg-emerald-500'
                      : 'bg-theme-elevated'
                  }`}
                  title={`Ir para exercício ${idx() + 1}`}
                  data-testid={`progress-segment-${idx()}`}
                />
              );
            }}
          </For>
        </div>

        {/* Progressive Overload Target Banner */}
        <div class="mt-2 py-1 px-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-[11px]">
          <span class="text-blue-400 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Sobrecarga Progressiva
          </span>
          <span class="font-mono text-blue-400 font-semibold text-[10px]">
            +2.5 kg ou +1 rep vs última sessão
          </span>
        </div>
      </header>

      {/* Horizontal Carousel (Strict 1-at-a-time slide track with Apple gesture physics) */}
      <main
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        class="flex-1 w-full overflow-hidden relative touch-pan-y"
        data-testid="deck-carousel"
      >
        <div
          class="flex h-full w-full"
          style={{
            transform: `translateX(calc(-${activePageIndex() * 100}% + ${dragOffset()}px))`,
            transition: isDragging()
              ? 'none'
              : 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          <For each={exercises()}>
            {(exercise, idx) => (
              <div
                class="w-full min-w-full flex-shrink-0 h-full px-4 py-4 overflow-y-auto flex flex-col items-center overscroll-contain"
                data-testid={`deck-page-${idx()}`}
              >
                {/* Top Muscle Focus Card with live highlighted silhouette */}
                <MuscleFocusCard
                  exerciseId={exercise.exerciseId}
                  onOpenSubstitute={() => setSubstituteExerciseIndex(idx())}
                />

                {/* Core Exercise Card with Inset Grouped Set Table and 1-tap Steppers */}
                <ExerciseCard
                  exerciseIndex={idx()}
                  exercise={exercise}
                  totalExercises={exercises().length}
                  onToggleCompleteSet={(sIdx) => {
                    const set = exercise.sets[sIdx];
                    if (set.completed) {
                      activeWorkoutStore.uncompleteSet(idx(), sIdx);
                    } else {
                      activeWorkoutStore.completeSet(idx(), sIdx);
                    }
                  }}
                  onAdjustWeight={(sIdx, delta) =>
                    activeWorkoutStore.adjustWeight(idx(), sIdx, delta)
                  }
                  onSetWeight={(sIdx, val) =>
                    activeWorkoutStore.setWeight(idx(), sIdx, val)
                  }
                  onAdjustReps={(sIdx, delta) =>
                    activeWorkoutStore.adjustReps(idx(), sIdx, delta)
                  }
                  onSetReps={(sIdx, val) =>
                    activeWorkoutStore.setReps(idx(), sIdx, val)
                  }
                  onCycleKind={(sIdx) =>
                    activeWorkoutStore.cycleSetKind(idx(), sIdx)
                  }
                  onAddSet={() => activeWorkoutStore.addSet(idx())}
                  onRemoveSet={(sIdx) => activeWorkoutStore.removeSet(idx(), sIdx)}
                  onNextExercise={() => {
                    if (idx() < exercises().length - 1) {
                      scrollToExercise(idx() + 1);
                    }
                  }}
                  onFinishWorkout={async () => {
                    await activeWorkoutStore.finishWorkout();
                    if (props.onFinish) props.onFinish();
                  }}
                />
              </div>
            )}
          </For>
        </div>
      </main>

      {/* Floating Rest Bar (Dynamic Island style countdown) */}
      <FloatingRestBar
        timer={restTimer()}
        onAddSeconds={(s) => activeWorkoutStore.addRestSeconds(s)}
        onSkip={() => activeWorkoutStore.skipRestTimer()}
      />

      {/* Substitute Exercise Bottom Sheet */}
      <Show when={substituteExerciseIndex() !== null}>
        <SubstituteExerciseSheet
          isOpen={substituteExerciseIndex() !== null}
          onClose={() => setSubstituteExerciseIndex(null)}
          currentExerciseId={
            exercises()[substituteExerciseIndex()!]?.exerciseId ?? ''
          }
          onSelectSubstitute={(newId) => {
            const idx = substituteExerciseIndex();
            if (idx !== null) {
              activeWorkoutStore.replaceExercise(idx, newId);
              showToast('Exercício substituído mantendo o histórico de séries.');
            }
          }}
        />
      </Show>

      {/* Toast Notification */}
      <Show when={toastMessage()}>
        <div
          class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-theme-surface border border-theme-separator text-xs text-theme-primary shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 select-none"
          data-testid="deck-toast"
        >
          {toastMessage()}
        </div>
      </Show>
    </div>
  );
};
