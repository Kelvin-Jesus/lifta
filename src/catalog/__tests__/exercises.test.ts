import { describe, it, expect } from 'vitest';
import {
  EXERCISE_CATALOG,
  searchExercises,
  filterExercisesByMuscle,
  filterExercisesByEquipment,
  getExerciseById,
  createCustomExercise,
} from '../exercises';

describe('Exercise Catalog', () => {
  it('contains standard exercises covering all muscle groups', () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThan(30);

    const muscleGroups = new Set(
      EXERCISE_CATALOG.flatMap((ex) => [
        ...ex.primaryMuscles,
        ...ex.secondaryMuscles,
      ])
    );

    expect(muscleGroups.has('chest')).toBe(true);
    expect(muscleGroups.has('back')).toBe(true);
    expect(muscleGroups.has('shoulders')).toBe(true);
    expect(muscleGroups.has('biceps')).toBe(true);
    expect(muscleGroups.has('triceps')).toBe(true);
    expect(muscleGroups.has('quadriceps')).toBe(true);
    expect(muscleGroups.has('hamstrings')).toBe(true);
    expect(muscleGroups.has('glutes')).toBe(true);
    expect(muscleGroups.has('calves')).toBe(true);
    expect(muscleGroups.has('abs')).toBe(true);
    expect(muscleGroups.has('obliques')).toBe(true);
    expect(muscleGroups.has('forearms')).toBe(true);
  });

  it('searches exercises by query in name or instructions', () => {
    const results = searchExercises(EXERCISE_CATALOG, 'supino');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((ex) => ex.name.toLowerCase().includes('supino'))).toBe(true);
  });

  it('filters exercises by target muscle group', () => {
    const chestExercises = filterExercisesByMuscle(EXERCISE_CATALOG, 'chest');
    expect(chestExercises.length).toBeGreaterThan(0);
    for (const ex of chestExercises) {
      const allMuscles = [...ex.primaryMuscles, ...ex.secondaryMuscles];
      expect(allMuscles).toContain('chest');
    }
  });

  it('filters exercises by equipment', () => {
    const barbellExercises = filterExercisesByEquipment(EXERCISE_CATALOG, 'barbell');
    expect(barbellExercises.length).toBeGreaterThan(0);
    for (const ex of barbellExercises) {
      expect(ex.equipment).toBe('barbell');
    }
  });

  it('finds exercise by ID', () => {
    const benchPress = getExerciseById(EXERCISE_CATALOG, 'bench-press');
    expect(benchPress).toBeDefined();
    expect(benchPress?.primaryMuscles).toContain('chest');
  });

  it('creates custom exercise with valid schema', () => {
    const custom = createCustomExercise({
      name: 'Elevação Y no Banco Inclinado',
      primaryMuscles: ['shoulders'],
      secondaryMuscles: ['back'],
      equipment: 'dumbbell',
      instructions: 'Deitado em decúbito ventral a 30 graus, elevar em formato Y.',
    });

    expect(custom.id).toMatch(/^custom-/);
    expect(custom.isCustom).toBe(true);
    expect(custom.name).toBe('Elevação Y no Banco Inclinado');
  });
});
