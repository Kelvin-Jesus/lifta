/**
 * Haptic and discrete audio cues for mobile gym training
 */

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' = 'medium'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'heavy':
        navigator.vibrate([50, 40, 50]);
        break;
      case 'success':
        navigator.vibrate([30, 60, 40, 60, 50]);
        break;
    }
  } catch {
    // Ignore environments where vibrate is disabled or restricted
  }
}

export function playDiscreteBeep(): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;

  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // AudioContext blocked by browser autoplay policy
  }
}
