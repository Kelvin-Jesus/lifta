import { describe, it, expect } from 'vitest';
import {
  formatCalories,
  formatTonnage,
  calculateCurrentWeekStats,
} from '../metrics';
import type { WorkoutSession } from '../session';
import { getSampleSessions } from '../../catalog/defaultSessions';

describe('Metrics Domain Helpers', () => {
  describe('formatCalories', () => {
    it('formats positive calories with tilde and pt-BR separator', () => {
      expect(formatCalories(1820)).toBe('~1.820 kcal');
      expect(formatCalories(450)).toBe('~450 kcal');
      expect(formatCalories(10500)).toBe('~10.500 kcal');
    });

    it('formats 0 or negative calories as 0 kcal', () => {
      expect(formatCalories(0)).toBe('0 kcal');
      expect(formatCalories(-10)).toBe('0 kcal');
    });
  });

  describe('formatTonnage', () => {
    it('formats weight volume with kg and pt-BR separator', () => {
      expect(formatTonnage(16400)).toBe('16.400 kg');
      expect(formatTonnage(4200)).toBe('4.200 kg');
      expect(formatTonnage(850)).toBe('850 kg');
    });

    it('formats 0 or negative tonnage as 0 kg', () => {
      expect(formatTonnage(0)).toBe('0 kg');
      expect(formatTonnage(-50)).toBe('0 kg');
    });
  });

  describe('calculateCurrentWeekStats', () => {
    it('returns zeroes when sessions array is empty', () => {
      const stats = calculateCurrentWeekStats([]);
      expect(stats).toEqual({
        workoutCount: 0,
        totalCalories: 0,
        totalVolumeKg: 0,
      });
    });

    it('correctly aggregates sessions from sample sessions in the current week', () => {
      const sampleSessions = getSampleSessions();
      const stats = calculateCurrentWeekStats(sampleSessions);

      expect(stats.workoutCount).toBe(4);
      expect(stats.totalCalories).toBe(1820);
      expect(stats.totalVolumeKg).toBeGreaterThanOrEqual(16000);
    });

    it('filters sessions outside of the current week window', () => {
      const today = new Date('2026-09-09T12:00:00.000Z');
      const insideSession: WorkoutSession = {
        id: 's-inside',
        startedAt: '2026-09-09T10:00:00.000Z',
        endedAt: '2026-09-09T11:00:00.000Z',
        durationMinutes: 60,
        exercises: [],
        estimatedCalories: 500,
        totalVolumeKg: 4500,
      };

      const pastSession: WorkoutSession = {
        id: 's-past',
        startedAt: '2026-08-01T10:00:00.000Z',
        endedAt: '2026-08-01T11:00:00.000Z',
        durationMinutes: 60,
        exercises: [],
        estimatedCalories: 300,
        totalVolumeKg: 3000,
      };

      const stats = calculateCurrentWeekStats([insideSession, pastSession], today);
      expect(stats.workoutCount).toBe(1);
      expect(stats.totalCalories).toBe(500);
      expect(stats.totalVolumeKg).toBe(4500);
    });
  });
});
