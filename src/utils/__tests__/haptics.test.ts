import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerHaptic, playDiscreteBeep } from '../haptics';

describe('haptics utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers navigator.vibrate with correct patterns', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });

    triggerHaptic('light');
    expect(vibrateMock).toHaveBeenCalledWith(15);

    triggerHaptic('medium');
    expect(vibrateMock).toHaveBeenCalledWith(35);

    triggerHaptic('heavy');
    expect(vibrateMock).toHaveBeenCalledWith([50, 40, 50]);

    triggerHaptic('success');
    expect(vibrateMock).toHaveBeenCalledWith([30, 60, 40, 60, 50]);
  });

  it('handles playDiscreteBeep without throwing', () => {
    const mockOsc = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const mockAudioContext = vi.fn().mockImplementation(() => ({
      currentTime: 0,
      destination: {},
      createOscillator: () => mockOsc,
      createGain: () => mockGain,
    }));

    (window as any).AudioContext = mockAudioContext;

    expect(() => playDiscreteBeep()).not.toThrow();
    expect(mockAudioContext).toHaveBeenCalled();
    expect(mockOsc.start).toHaveBeenCalled();
  });
});
