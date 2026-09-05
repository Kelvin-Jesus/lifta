import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Effect } from 'effect';
import { IDBFactory } from 'fake-indexeddb';
import { createActiveWorkoutStore } from '../activeWorkoutStore';
import { ActiveSessionRepository } from '../../../storage/repositories/ActiveSessionRepository';
import { WorkoutSessionRepository } from '../../../storage/repositories/WorkoutSessionRepository';
import type { Routine } from '../../../domain/routine';

describe('Active Workout Engine Integration', () => {
  const sampleRoutine: Routine = {
    id: 'routine-chest-day',
    name: 'Treino A - Peitoral e Tríceps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        exerciseId: 'bench-press',
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        suggestedRestSeconds: 90,
      },
      {
        exerciseId: 'tricep-rope-pushdown',
        targetSets: 3,
        targetRepsMin: 12,
        suggestedRestSeconds: 60,
      },
    ],
  };

  beforeEach(() => {
    indexedDB = new IDBFactory();
    vi.clearAllMocks();
  });

  it('starts a workout, carries over historical loads, and writes atomic active session to IndexedDB', async () => {
    const store = createActiveWorkoutStore();

    const historicalLoads = {
      'bench-press': { weightKg: 80, reps: 8 },
    };

    const activeSession = await store.startWorkout(sampleRoutine, historicalLoads);

    expect(activeSession.routineId).toBe('routine-chest-day');
    expect(activeSession.exercises.length).toBe(2);

    // Bench press should have inherited 80kg
    const benchPress = activeSession.exercises[0];
    expect(benchPress.sets.length).toBe(3);
    expect((benchPress.sets[0] as any).weightKg).toBe(80);
    expect((benchPress.sets[0] as any).reps).toBe(8);

    // Triceps did not have history, so it should default
    const triceps = activeSession.exercises[1];
    expect((triceps.sets[0] as any).weightKg).toBe(20);

    // Verify stored in IndexedDB
    const persisted = await Effect.runPromise(ActiveSessionRepository.getActive());
    expect(persisted).not.toBeNull();
    expect(persisted?.routineId).toBe('routine-chest-day');
  });

  it('adjusts weight and reps with steppers and updates IndexedDB atomically', async () => {
    const store = createActiveWorkoutStore();
    await store.startWorkout(sampleRoutine);

    // Increase weight by 2.5kg on set 0
    await store.adjustWeight(0, 0, 2.5);
    let session = store.session();
    expect((session?.exercises[0].sets[0] as any).weightKg).toBe(22.5);

    // Increase reps by 1 on set 0
    await store.adjustReps(0, 0, 1);
    session = store.session();
    expect((session?.exercises[0].sets[0] as any).reps).toBe(9);

    // Check persistence
    const persisted = await Effect.runPromise(ActiveSessionRepository.getActive());
    expect((persisted?.exercises[0].sets[0] as any).weightKg).toBe(22.5);
    expect((persisted?.exercises[0].sets[0] as any).reps).toBe(9);
  });

  it('cycles set kind (normal -> warmup -> dropset -> failure)', async () => {
    const store = createActiveWorkoutStore();
    await store.startWorkout(sampleRoutine);

    await store.cycleSetKind(0, 0);
    expect((store.session()?.exercises[0].sets[0] as any).kind).toBe('warmup');

    await store.cycleSetKind(0, 0);
    expect((store.session()?.exercises[0].sets[0] as any).kind).toBe('dropset');

    await store.cycleSetKind(0, 0);
    expect((store.session()?.exercises[0].sets[0] as any).kind).toBe('failure');

    await store.cycleSetKind(0, 0);
    expect((store.session()?.exercises[0].sets[0] as any).kind).toBe('normal');
  });

  it('completes set in 1 tap, activates rest timer, and allows reversible toggle', async () => {
    const store = createActiveWorkoutStore();
    await store.startWorkout(sampleRoutine);

    // Complete set 0 of exercise 0
    await store.completeSet(0, 0, 90);
    expect(store.session()?.exercises[0].sets[0].completed).toBe(true);
    expect(store.restTimer().active).toBe(true);
    expect(store.restTimer().remainingSeconds).toBeGreaterThanOrEqual(89);

    // Add 30 seconds to rest
    store.addRestSeconds(30);
    expect(store.restTimer().remainingSeconds).toBeGreaterThanOrEqual(118);

    // Skip rest
    store.skipRestTimer();
    expect(store.restTimer().active).toBe(false);

    // Uncomplete set reversibly
    await store.uncompleteSet(0, 0);
    expect(store.session()?.exercises[0].sets[0].completed).toBe(false);
  });

  it('finishes workout, calculates volume and calories, saves to session history and clears active session', async () => {
    const store = createActiveWorkoutStore();
    await store.startWorkout(sampleRoutine, {
      'bench-press': { weightKg: 100, reps: 10 },
    });

    // Complete all 3 sets of bench press (100kg * 10 reps * 3 sets = 3000 kg volume)
    await store.completeSet(0, 0);
    await store.completeSet(0, 1);
    await store.completeSet(0, 2);

    const finished = await store.finishWorkout(80, 'Treino muito consistente');
    expect(finished).not.toBeNull();
    expect(finished?.totalVolumeKg).toBe(3000);
    expect(finished?.estimatedCalories).toBeGreaterThan(0);
    expect(finished?.notes).toBe('Treino muito consistente');

    // Active session should now be cleared
    const active = await Effect.runPromise(ActiveSessionRepository.getActive());
    expect(active).toBeNull();

    // History should have the finished workout
    const allSessions = await Effect.runPromise(WorkoutSessionRepository.listAll());
    expect(allSessions.length).toBe(1);
    expect(allSessions[0].id).toBe(finished?.id);
  });
});
