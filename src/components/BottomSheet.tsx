import { Show, createSignal, createEffect, onCleanup, type Component, type JSX } from 'solid-js';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: JSX.Element;
  maxHeight?: string;
}

export const BottomSheet: Component<BottomSheetProps> = (props) => {
  let sheetRef: HTMLDivElement | undefined;
  let grabberRef: HTMLDivElement | undefined;

  const [isDragging, setIsDragging] = createSignal(false);
  const [translateY, setTranslateY] = createSignal(0);

  let startY = 0;
  let startTime = 0;
  let currentY = 0;

  // Esc key listener
  createEffect(() => {
    if (!props.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  // Reset position when opened
  createEffect(() => {
    if (props.isOpen) {
      setTranslateY(0);
      setIsDragging(false);
    }
  });

  const handlePointerDown = (e: PointerEvent) => {
    if (!grabberRef || !sheetRef) return;
    grabberRef.setPointerCapture(e.pointerId);
    startY = e.clientY;
    startTime = performance.now();
    currentY = 0;
    setIsDragging(true);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging()) return;
    const deltaY = e.clientY - startY;

    // Apple Rubber-Banding: when pulling UP past top (deltaY < 0), apply resistance factor 0.35
    if (deltaY < 0) {
      currentY = deltaY * 0.35;
    } else {
      currentY = deltaY;
    }

    setTranslateY(currentY);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging() || !grabberRef) return;
    grabberRef.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    const elapsed = Math.max(1, performance.now() - startTime);
    const velocityY = (e.clientY - startY) / elapsed; // px per ms
    const sheetHeight = sheetRef?.offsetHeight ?? 400;

    // Flick to dismiss or dragged past 35% of sheet height
    if (velocityY > 0.42 || currentY > sheetHeight * 0.35) {
      setTranslateY(sheetHeight);
      setTimeout(() => {
        props.onClose();
        setTranslateY(0);
      }, 200);
    } else {
      // Spring snap back to 0
      setTranslateY(0);
    }
  };

  const scrimOpacity = () => {
    if (!sheetRef || !isDragging() || translateY() <= 0) return 1;
    const sheetHeight = sheetRef.offsetHeight || 400;
    return Math.max(0, 1 - translateY() / sheetHeight);
  };

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 z-50 flex items-end justify-center select-none"
        role="dialog"
        aria-modal="true"
        data-testid="bottom-sheet"
      >
        {/* Backdrop Scrim */}
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
          style={{ opacity: scrimOpacity() }}
          onClick={props.onClose}
          data-testid="sheet-backdrop"
        />

        {/* Sheet Container with iOS curved corners and border */}
        <div
          ref={sheetRef}
          class="relative w-full max-w-lg bg-neutral-900 border-t border-x border-neutral-750 rounded-t-3xl shadow-2xl shadow-black flex flex-col z-10 overflow-hidden"
          style={{
            'max-height': props.maxHeight ?? '85dvh',
            transform: `translateY(${translateY()}px)`,
            transition: isDragging()
              ? 'none'
              : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
          data-testid="sheet-content"
        >
          {/* Tactile Grabber Handle Area (Comfortable touch target) */}
          <div
            ref={grabberRef}
            class="w-full py-3 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            data-testid="sheet-grabber"
          >
            <div class="w-9 h-1.5 rounded-full bg-neutral-600 hover:bg-neutral-500 transition-colors" />
          </div>

          {/* Optional Title Header */}
          <Show when={props.title}>
            <div class="px-5 pb-2 flex items-center justify-between border-b border-neutral-800">
              <h3 class="text-base font-bold text-neutral-100 tracking-tight">
                {props.title}
              </h3>
              <button
                type="button"
                onClick={props.onClose}
                class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
          </Show>

          {/* Sheet Body with scrolling */}
          <div class="p-5 overflow-y-auto max-h-[calc(85dvh-70px)] overscroll-contain">
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
};
