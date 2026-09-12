import { describe, it, expect } from 'vitest';
import { EXERCISE_CATALOG } from '../exercises';
import { EXERCISE_MEDIA_ATTRIBUTION } from '../exercisesExtended';
import { DEFAULT_SAMPLE_ROUTINES } from '../defaultRoutines';
import { MuscleGroup, Equipment } from '../../domain/types';

const MUSCLES = MuscleGroup.literals;
const EQUIPMENT = Equipment.literals;

describe('Exercise catalog integrity', () => {
  it('offers a usable number of exercises per muscle group', () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThanOrEqual(200);

    const perMuscle = new Map<string, number>();
    for (const exercise of EXERCISE_CATALOG) {
      for (const muscle of exercise.primaryMuscles) {
        perMuscle.set(muscle, (perMuscle.get(muscle) ?? 0) + 1);
      }
    }

    for (const muscle of MUSCLES) {
      // Obliques are trained mostly as a secondary target, the rest must have
      // enough variety to actually build a routine from the catalog alone.
      const minimum = muscle === 'obliques' ? 4 : 8;
      expect(perMuscle.get(muscle) ?? 0, `poucos exercícios para ${muscle}`).toBeGreaterThanOrEqual(
        minimum
      );
    }
  });

  it('keeps ids and names unique so routines cannot resolve the wrong movement', () => {
    const ids = EXERCISE_CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);

    const names = EXERCISE_CATALOG.map((e) =>
      e.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );
    expect(new Set(names).size).toBe(names.length);
  });

  it('exposes valid taxonomy, instructions and media for every entry', () => {
    for (const exercise of EXERCISE_CATALOG) {
      expect(EQUIPMENT, `${exercise.id}: equipamento inválido`).toContain(exercise.equipment);
      expect(exercise.primaryMuscles.length).toBeGreaterThan(0);
      for (const muscle of [...exercise.primaryMuscles, ...exercise.secondaryMuscles]) {
        expect(MUSCLES, `${exercise.id}: músculo inválido`).toContain(muscle);
      }
      expect(exercise.secondaryMuscles).not.toContain(exercise.primaryMuscles[0]);
      expect((exercise.instructions ?? '').length, `${exercise.id}: sem instruções`).toBeGreaterThan(
        20
      );
      if (exercise.gifUrl) {
        expect(exercise.gifUrl).toMatch(/^https:\/\/.+\.gif$/);
      }
    }
  });

  it('keeps every routine exercise resolvable in the catalog', () => {
    const ids = new Set(EXERCISE_CATALOG.map((e) => e.id));
    for (const routine of DEFAULT_SAMPLE_ROUTINES) {
      for (const exercise of routine.exercises) {
        expect(ids, `rotina ${routine.name} referencia ${exercise.exerciseId}`).toContain(
          exercise.exerciseId
        );
      }
    }
  });

  it('carries the media attribution required by the dataset license', () => {
    expect(EXERCISE_MEDIA_ATTRIBUTION).toContain('Gym visual');
  });
});
