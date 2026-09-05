import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createModelContext, initWebMCPPolyfill } from '../modelContextPolyfill';
import { registerAllWebMCPTools } from '../tools';
import type { WorkoutSession } from '../../domain/session';

describe('WebMCP Agent Interface - 12 Canonical Tools', () => {
  let context: ReturnType<typeof createModelContext>;

  beforeEach(() => {
    indexedDB = new IDBFactory();
    context = createModelContext();
    registerAllWebMCPTools(context);
  });

  it('registers exactly 12 canonical tools', () => {
    const tools = context.listTools();
    expect(tools.length).toBe(12);

    const names = tools.map((t) => t.name);
    expect(names).toContain('search_exercises');
    expect(names).toContain('get_exercise_details');
    expect(names).toContain('create_routine');
    expect(names).toContain('get_routine');
    expect(names).toContain('list_routines');
    expect(names).toContain('update_routine');
    expect(names).toContain('delete_routine');
    expect(names).toContain('replace_exercise_in_routine');
    expect(names).toContain('get_workout_history');
    expect(names).toContain('get_exercise_progress');
    expect(names).toContain('log_workout_session');
    expect(names).toContain('delete_workout_session');
  });

  it('Tool 1 & 2: searches exercises and retrieves exercise details', async () => {
    const searchRes = await context.callTool('search_exercises', { query: 'supino' });
    expect(searchRes.exercises.length).toBeGreaterThan(0);
    expect(searchRes.exercises[0].name.toLowerCase()).toContain('supino');

    const details = await context.callTool('get_exercise_details', { exerciseId: 'bench-press' });
    expect(details.id).toBe('bench-press');
    expect(details.primaryMuscles).toContain('chest');

    await expect(
      context.callTool('get_exercise_details', { exerciseId: 'non-existent' })
    ).rejects.toThrow('Exercício não encontrado');
  });

  it('Tool 3, 4, 5: creates, retrieves and lists routines', async () => {
    const createRes = await context.callTool('create_routine', {
      name: 'Treino A - Peito',
      scheduledDays: ['monday'],
      exercises: [{ exerciseId: 'bench-press', targetSets: 4 }],
    });

    expect(createRes.routineId).toMatch(/^routine-/);
    expect(createRes.routine.name).toBe('Treino A - Peito');

    const getRes = await context.callTool('get_routine', { routineId: createRes.routineId });
    expect(getRes.name).toBe('Treino A - Peito');

    const listRes = await context.callTool('list_routines', {});
    expect(listRes.total).toBe(1);
    expect(listRes.routines[0].id).toBe(createRes.routineId);
  });

  it('Tool 6, 7, 8: enforces human-in-the-loop approval on destructive operations', async () => {
    const createRes = await context.callTool('create_routine', {
      name: 'Treino Teste',
      exercises: [{ exerciseId: 'bench-press', targetSets: 3 }],
    });
    const routineId = createRes.routineId;

    // Set approval handler to reject
    context.setApprovalHandler(async () => false);

    // Should reject update
    await expect(
      context.callTool('update_routine', { routineId, patch: { name: 'Novo Nome' } })
    ).rejects.toThrow('aprovação recusada');

    // Should reject replace exercise
    await expect(
      context.callTool('replace_exercise_in_routine', {
        routineId,
        oldExerciseId: 'bench-press',
        newExerciseId: 'push-up',
      })
    ).rejects.toThrow('aprovação recusada');

    // Should reject delete
    await expect(
      context.callTool('delete_routine', { routineId })
    ).rejects.toThrow('aprovação recusada');

    // Now set approval handler to approve
    context.setApprovalHandler(async () => true);

    const updateRes = await context.callTool('update_routine', {
      routineId,
      patch: { name: 'Nome Atualizado' },
    });
    expect(updateRes.routine.name).toBe('Nome Atualizado');

    const replaceRes = await context.callTool('replace_exercise_in_routine', {
      routineId,
      oldExerciseId: 'bench-press',
      newExerciseId: 'push-up',
    });
    expect(replaceRes.routine.exercises[0].exerciseId).toBe('push-up');

    const deleteRes = await context.callTool('delete_routine', { routineId });
    expect(deleteRes.success).toBe(true);
  });

  it('Tool 9, 10, 11, 12: logs session, calculates 1RM progress, gets history and deletes session', async () => {
    const sampleSession: Omit<WorkoutSession, 'id'> = {
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: 50,
      totalVolumeKg: 2400,
      estimatedCalories: 420,
      exercises: [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Supino Reto com Barra',
          sets: [
            { type: 'resistance', kind: 'normal', weightKg: 100, reps: 5, completed: true },
            { type: 'resistance', kind: 'normal', weightKg: 100, reps: 5, completed: true },
          ],
        },
      ],
    };

    const logRes = await context.callTool('log_workout_session', sampleSession);
    expect(logRes.sessionId).toMatch(/^session-/);

    // Get workout history
    const historyRes = await context.callTool('get_workout_history', { limit: 10 });
    expect(historyRes.total).toBe(1);

    // Get exercise progress: 100kg x 5 reps -> Brzycki estimated 1RM = 100 / (1.0278 - 0.0278 * 5) = ~112.5 kg
    const progressRes = await context.callTool('get_exercise_progress', {
      exerciseId: 'bench-press',
    });
    expect(progressRes.history.length).toBe(1);
    expect(progressRes.history[0].maxWeightKg).toBe(100);
    expect(progressRes.estimated1RM).toBeGreaterThan(110);

    // Delete session with approval
    context.setApprovalHandler(async () => true);
    const delRes = await context.callTool('delete_workout_session', {
      sessionId: logRes.sessionId,
    });
    expect(delRes.success).toBe(true);
  });

  it('postMessage automation bridge dispatches tools and handles external invocation', async () => {
    const polyfill = initWebMCPPolyfill();
    registerAllWebMCPTools(polyfill);

    expect((document as any).modelContext).toBeDefined();

    // Call tool via document.modelContext
    const res = await (document as any).modelContext.callTool('search_exercises', {
      query: 'deadlift',
    });
    expect(res.exercises.length).toBeGreaterThan(0);
  });
});
