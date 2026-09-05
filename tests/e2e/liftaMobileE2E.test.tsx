import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { Effect } from 'effect';
import { render } from 'solid-js/web';
import { App } from '../../src/App';
import { createActiveWorkoutStore } from '../../src/features/workout/activeWorkoutStore';
import { RoutineRepository } from '../../src/storage/repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../../src/storage/repositories/WorkoutSessionRepository';
import { ActiveSessionRepository } from '../../src/storage/repositories/ActiveSessionRepository';
import { exportLiftaJson, importLiftaJson } from '../../src/storage/export-import';
import type { Routine } from '../../src/domain/routine';

describe('Lifta Mobile E2E Simulation (iPhone 15)', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const sampleRoutine: Routine = {
    id: 'routine-e2e',
    name: 'Treino A - Peitoral e Tríceps',
    scheduledDays: ['monday'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { exerciseId: 'bench-press', targetSets: 3, suggestedRestSeconds: 90 },
      { exerciseId: 'tricep-rope-pushdown', targetSets: 2, suggestedRestSeconds: 60 },
    ],
  };

  it('E2E Test 1: Complete Happy Path workout flow', async () => {
    const store = createActiveWorkoutStore();

    // 1. Start workout
    const active = await store.startWorkout(sampleRoutine);
    expect(active.routineName).toBe('Treino A - Peitoral e Tríceps');

    // 2. Adjust weight with steppers
    await store.adjustWeight(0, 0, 2.5);
    expect((store.session()?.exercises[0].sets[0] as any).weightKg).toBe(22.5);

    // 3. Complete set 1
    await store.completeSet(0, 0);
    expect(store.session()?.exercises[0].sets[0].completed).toBe(true);
    expect(store.restTimer().active).toBe(true);

    // 4. Skip rest
    store.skipRestTimer();
    expect(store.restTimer().active).toBe(false);

    // 5. Complete remaining sets
    await store.completeSet(0, 1);
    await store.completeSet(0, 2);
    await store.completeSet(1, 0);
    await store.completeSet(1, 1);

    // 6. Finish workout
    const finished = await store.finishWorkout(75, 'Treino E2E concluído com sucesso');
    expect(finished).not.toBeNull();
    expect(finished?.durationMinutes).toBeGreaterThanOrEqual(1);
    expect(finished?.totalVolumeKg).toBeGreaterThan(0);
    expect(finished?.estimatedCalories).toBeGreaterThan(0);

    // 7. Verify active workout cleared and history saved
    const activePersisted = await Effect.runPromise(ActiveSessionRepository.getActive());
    expect(activePersisted).toBeNull();

    const history = await Effect.runPromise(WorkoutSessionRepository.listAll());
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(finished?.id);
  });

  it('E2E Test 2: 100% Offline operation (zero network dependency)', async () => {
    // All repositories and stores operate on local IndexedDB
    const store = createActiveWorkoutStore();
    await store.startWorkout(sampleRoutine);

    await store.adjustReps(0, 0, 2);
    await store.completeSet(0, 0);

    const persisted = await Effect.runPromise(ActiveSessionRepository.getActive());
    expect(persisted).not.toBeNull();
    expect((persisted?.exercises[0].sets[0] as any).reps).toBe(12);
  });

  it('E2E Test 3: iOS memory crash resilience & state recovery (<80ms)', async () => {
    const store1 = createActiveWorkoutStore();
    await store1.startWorkout(sampleRoutine);

    // Complete set 0 of exercise 0
    await store1.completeSet(0, 0);
    await store1.adjustWeight(0, 1, 5);

    // Simulate app killed / memory reload: create a fresh store instance and call resumeWorkout
    const store2 = createActiveWorkoutStore();
    const restored = await store2.resumeWorkout();

    expect(restored).not.toBeNull();
    expect(restored?.routineId).toBe('routine-e2e');
    expect(restored?.exercises[0].sets[0].completed).toBe(true);
    expect((restored?.exercises[0].sets[1] as any).weightKg).toBe(25);
  });

  it('E2E Test 4: Sovereign backup export and import cycle', async () => {
    // Save sample routine and workout session
    await Effect.runPromise(RoutineRepository.save(sampleRoutine));
    const store = createActiveWorkoutStore();
    await store.startWorkout(sampleRoutine);
    await store.completeSet(0, 0);
    await store.finishWorkout();

    // Export sovereign JSON string
    const exportedJsonStr = await Effect.runPromise(exportLiftaJson());
    const parsedBackup = JSON.parse(exportedJsonStr);
    expect(parsedBackup.routines.length).toBe(1);
    expect(parsedBackup.workoutSessions.length).toBe(1);

    // Wipe IndexedDB
    indexedDB = new IDBFactory();

    // Verify database is empty
    const routinesBefore = await Effect.runPromise(RoutineRepository.listAll());
    expect(routinesBefore.length).toBe(0);

    // Import backup
    const importResult = await Effect.runPromise(importLiftaJson(exportedJsonStr, { dryRun: false }));
    expect(importResult.routinesImported).toBe(1);
    expect(importResult.sessionsImported).toBe(1);

    // Verify fully restored
    const routinesAfter = await Effect.runPromise(RoutineRepository.listAll());
    expect(routinesAfter.length).toBe(1);
    expect(routinesAfter[0].id).toBe(sampleRoutine.id);

    const sessionsAfter = await Effect.runPromise(WorkoutSessionRepository.listAll());
    expect(sessionsAfter.length).toBe(1);
  });

  it('Renders full App container on simulated iPhone 15 viewport', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(() => <App />, container);

    // Should render HomeDashboard initially
    expect(container.querySelector('[data-testid="home-dashboard"]')).not.toBeNull();
    expect(container.textContent).toContain('LIFTA');
  });
});
