import { createSignal, createRoot } from 'solid-js';
import { Effect } from 'effect';
import type { Routine } from '../../domain/routine';
import type { WorkoutSession, ActiveSession, LoggedExercise } from '../../domain/session';
import type { WorkoutSet } from '../../domain/set';
import type { SetKind } from '../../domain/types';
import { calculateEstimatedCalories, calculateTotalVolumeKg } from '../../domain/calories';
import { ActiveSessionRepository } from '../../storage/repositories/ActiveSessionRepository';
import { WorkoutSessionRepository } from '../../storage/repositories/WorkoutSessionRepository';
import { triggerHaptic, playDiscreteBeep } from '../../utils/haptics';
import { getExerciseById, EXERCISE_CATALOG } from '../../catalog/exercises';

export interface RestTimerState {
  active: boolean;
  remainingSeconds: number;
  durationSeconds: number;
}

export function createActiveWorkoutStore() {
  const [session, setSession] = createSignal<ActiveSession | null>(null);
  const [restTimer, setRestTimer] = createSignal<RestTimerState>({
    active: false,
    remainingSeconds: 0,
    durationSeconds: 90,
  });
  const [elapsedSeconds, setElapsedSeconds] = createSignal<number>(0);

  let elapsedIntervalId: any = null;
  let restIntervalId: any = null;

  const startElapsedTimer = (startedAtIso: string) => {
    if (elapsedIntervalId) clearInterval(elapsedIntervalId);
    const startMs = new Date(startedAtIso).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - startMs) / 1000));
      setElapsedSeconds(diff);
    };
    updateElapsed();
    elapsedIntervalId = setInterval(updateElapsed, 1000);
  };

  const stopElapsedTimer = () => {
    if (elapsedIntervalId) {
      clearInterval(elapsedIntervalId);
      elapsedIntervalId = null;
    }
  };

  const startRestCountdown = (durationSeconds: number, endTimestamp?: number) => {
    if (restIntervalId) clearInterval(restIntervalId);

    const targetEnd = endTimestamp ?? Date.now() + durationSeconds * 1000;
    const initialRemaining = Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000));

    setRestTimer({
      active: true,
      remainingSeconds: initialRemaining,
      durationSeconds,
    });

    restIntervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(restIntervalId);
        restIntervalId = null;
        setRestTimer({
          active: false,
          remainingSeconds: 0,
          durationSeconds,
        });
        triggerHaptic('success');
        playDiscreteBeep();

        // Clear rest timestamp in active session storage
        const current = session();
        if (current) {
          const updated: ActiveSession = {
            ...current,
            restTimerEndTimestamp: null,
            restTimerDurationSeconds: undefined,
          };
          setSession(updated);
          Effect.runPromise(ActiveSessionRepository.saveActive(updated));
        }
      } else {
        setRestTimer((prev) => ({
          ...prev,
          remainingSeconds: remaining,
        }));
      }
    }, 1000);
  };

  const stopRestCountdown = () => {
    if (restIntervalId) {
      clearInterval(restIntervalId);
      restIntervalId = null;
    }
    setRestTimer((prev) => ({
      ...prev,
      active: false,
      remainingSeconds: 0,
    }));
  };

  const persistSession = async (updated: ActiveSession) => {
    setSession(updated);
    await Effect.runPromise(ActiveSessionRepository.saveActive(updated));
  };

  const startWorkout = async (
    routine: Routine,
    lastKnownLoads: Record<string, { weightKg: number; reps: number }> = {}
  ): Promise<ActiveSession> => {
    const startedAt = new Date().toISOString();

    const exercises: LoggedExercise[] = routine.exercises.map((re) => {
      const catalogInfo = getExerciseById(EXERCISE_CATALOG, re.exerciseId);
      const defaultLoad = lastKnownLoads[re.exerciseId] ?? {
        weightKg: 20,
        reps: re.targetRepsMin ?? 10,
      };

      const sets: WorkoutSet[] = Array.from({ length: re.targetSets }).map(() => ({
        type: 'resistance',
        kind: 'normal',
        weightKg: defaultLoad.weightKg,
        reps: defaultLoad.reps,
        completed: false,
        restSeconds: re.suggestedRestSeconds,
      }));

      return {
        exerciseId: re.exerciseId,
        exerciseName: catalogInfo?.name ?? re.exerciseId,
        sets,
        notes: re.notes,
      };
    });

    const newSession: ActiveSession = {
      id: 'current',
      routineId: routine.id,
      routineName: routine.name,
      startedAt,
      activeExerciseIndex: 0,
      exercises,
      restTimerEndTimestamp: null,
    };

    await persistSession(newSession);
    startElapsedTimer(startedAt);
    return newSession;
  };

  const resumeWorkout = async (): Promise<ActiveSession | null> => {
    const existing = await Effect.runPromise(ActiveSessionRepository.getActive());
    if (!existing) return null;

    setSession(existing);
    startElapsedTimer(existing.startedAt);

    if (existing.restTimerEndTimestamp && existing.restTimerEndTimestamp > Date.now()) {
      const duration = existing.restTimerDurationSeconds ?? 90;
      startRestCountdown(duration, existing.restTimerEndTimestamp);
    }

    return existing;
  };

  const completeSet = async (
    exerciseIndex: number,
    setIndex: number,
    customRestSeconds?: number
  ) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const targetSet = sets[setIndex];

    if (!targetSet) return;

    // Mark set as completed
    const updatedSet: WorkoutSet = {
      ...targetSet,
      completed: true,
    };
    sets[setIndex] = updatedSet;
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    // Determine rest duration
    let restDuration = customRestSeconds;
    if (!restDuration) {
      if (targetSet.type === 'resistance' && targetSet.restSeconds) {
        restDuration = targetSet.restSeconds;
      } else {
        restDuration = 90;
      }
    }

    const restTimerEnd = Date.now() + restDuration * 1000;
    const updatedSession: ActiveSession = {
      ...current,
      exercises,
      restTimerEndTimestamp: restTimerEnd,
      restTimerDurationSeconds: restDuration,
    };

    await persistSession(updatedSession);
    triggerHaptic('medium');
    startRestCountdown(restDuration, restTimerEnd);
  };

  const uncompleteSet = async (exerciseIndex: number, setIndex: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const targetSet = sets[setIndex];

    if (!targetSet) return;

    sets[setIndex] = {
      ...targetSet,
      completed: false,
    };
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    const updatedSession: ActiveSession = {
      ...current,
      exercises,
    };

    await persistSession(updatedSession);
    triggerHaptic('light');
  };

  const adjustWeight = async (exerciseIndex: number, setIndex: number, deltaKg: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const targetSet = sets[setIndex];

    if (!targetSet || targetSet.type !== 'resistance') return;

    const newWeight = Math.max(0, Math.round((targetSet.weightKg + deltaKg) * 10) / 10);
    sets[setIndex] = {
      ...targetSet,
      weightKg: newWeight,
    };
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    await persistSession({ ...current, exercises });
    triggerHaptic('light');
  };

  const setWeight = async (exerciseIndex: number, setIndex: number, weightKg: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const targetSet = sets[setIndex];

    if (!targetSet || targetSet.type !== 'resistance') return;

    sets[setIndex] = {
      ...targetSet,
      weightKg: Math.max(0, weightKg),
    };
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    await persistSession({ ...current, exercises });
  };

  const adjustReps = async (exerciseIndex: number, setIndex: number, deltaReps: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const targetSet = sets[setIndex];

    if (!targetSet || targetSet.type !== 'resistance') return;

    const newReps = Math.max(0, targetSet.reps + deltaReps);
    sets[setIndex] = {
      ...targetSet,
      reps: newReps,
    };
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    await persistSession({ ...current, exercises });
    triggerHaptic('light');
  };

  const setReps = async (exerciseIndex: number, setIndex: number, reps: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const targetSet = sets[setIndex];

    if (!targetSet || targetSet.type !== 'resistance') return;

    sets[setIndex] = {
      ...targetSet,
      reps: Math.max(0, Math.round(reps)),
    };
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    await persistSession({ ...current, exercises });
  };

  const cycleSetKind = async (exerciseIndex: number, setIndex: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const targetSet = sets[setIndex];

    if (!targetSet || targetSet.type !== 'resistance') return;

    const kinds: SetKind[] = ['normal', 'warmup', 'dropset', 'failure'];
    const currentIndex = kinds.indexOf(targetSet.kind);
    const nextKind = kinds[(currentIndex + 1) % kinds.length];

    sets[setIndex] = {
      ...targetSet,
      kind: nextKind,
    };
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    await persistSession({ ...current, exercises });
    triggerHaptic('light');
  };

  const addSet = async (exerciseIndex: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    const sets = [...targetExercise.sets];
    const lastSet = sets[sets.length - 1];

    let newSet: WorkoutSet;
    if (lastSet && lastSet.type === 'resistance') {
      newSet = {
        type: 'resistance',
        kind: 'normal',
        weightKg: lastSet.weightKg,
        reps: lastSet.reps,
        completed: false,
        restSeconds: lastSet.restSeconds ?? 90,
      };
    } else {
      newSet = {
        type: 'resistance',
        kind: 'normal',
        weightKg: 20,
        reps: 10,
        completed: false,
        restSeconds: 90,
      };
    }

    sets.push(newSet);
    targetExercise.sets = sets;
    exercises[exerciseIndex] = targetExercise;

    await persistSession({ ...current, exercises });
    triggerHaptic('light');
  };

  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    const current = session();
    if (!current) return;

    const exercises = [...current.exercises];
    const targetExercise = { ...exercises[exerciseIndex] };
    if (targetExercise.sets.length <= 1) return; // Keep at least one set

    targetExercise.sets = targetExercise.sets.filter((_, i) => i !== setIndex);
    exercises[exerciseIndex] = targetExercise;

    await persistSession({ ...current, exercises });
    triggerHaptic('light');
  };

  const setActiveExerciseIndex = async (index: number) => {
    const current = session();
    if (!current || index < 0 || index >= current.exercises.length) return;

    const updated = {
      ...current,
      activeExerciseIndex: index,
    };
    await persistSession(updated);
  };

  const replaceExercise = async (exerciseIndex: number, newExerciseId: string) => {
    const current = session();
    if (!current || exerciseIndex < 0 || exerciseIndex >= current.exercises.length) return;

    const catalogExercise = getExerciseById(EXERCISE_CATALOG, newExerciseId);
    if (!catalogExercise) return;

    const exercises = [...current.exercises];
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      exerciseId: catalogExercise.id,
      exerciseName: catalogExercise.name,
    };

    await persistSession({ ...current, exercises });
    triggerHaptic('medium');
  };

  const addRestSeconds = (deltaSeconds: number = 30) => {
    const currentTimer = restTimer();
    if (!currentTimer.active) return;

    const newRemaining = currentTimer.remainingSeconds + deltaSeconds;
    const newEnd = Date.now() + newRemaining * 1000;
    startRestCountdown(newRemaining, newEnd);

    const currentSession = session();
    if (currentSession) {
      persistSession({
        ...currentSession,
        restTimerEndTimestamp: newEnd,
        restTimerDurationSeconds: newRemaining,
      });
    }
    triggerHaptic('light');
  };

  const skipRestTimer = () => {
    stopRestCountdown();
    const currentSession = session();
    if (currentSession) {
      persistSession({
        ...currentSession,
        restTimerEndTimestamp: null,
        restTimerDurationSeconds: undefined,
      });
    }
    triggerHaptic('medium');
  };

  const finishWorkout = async (
    userWeightKg?: number,
    notes?: string
  ): Promise<WorkoutSession | null> => {
    const current = session();
    if (!current) return null;

    stopElapsedTimer();
    stopRestCountdown();

    const endedAt = new Date().toISOString();
    const startMs = new Date(current.startedAt).getTime();
    const endMs = new Date(endedAt).getTime();
    const durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));

    const totalVolumeKg = calculateTotalVolumeKg(current.exercises);
    const estimatedCalories = calculateEstimatedCalories({
      bodyWeightKg: userWeightKg ?? 75,
      durationMinutes,
      isVigorous: totalVolumeKg > 5000,
      hasCardio: current.exercises.some((e) =>
        e.sets.some((s) => s.type === 'cardio')
      ),
    });

    const finishedSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      routineId: current.routineId,
      routineName: current.routineName,
      startedAt: current.startedAt,
      endedAt,
      durationMinutes,
      exercises: current.exercises,
      estimatedCalories,
      totalVolumeKg,
      notes,
    };

    await Effect.runPromise(WorkoutSessionRepository.save(finishedSession));
    await Effect.runPromise(ActiveSessionRepository.clearActive());
    setSession(null);
    triggerHaptic('success');

    return finishedSession;
  };

  const cancelWorkout = async () => {
    stopElapsedTimer();
    stopRestCountdown();
    await Effect.runPromise(ActiveSessionRepository.clearActive());
    setSession(null);
  };

  return {
    session,
    restTimer,
    elapsedSeconds,
    startWorkout,
    resumeWorkout,
    completeSet,
    uncompleteSet,
    adjustWeight,
    setWeight,
    adjustReps,
    setReps,
    cycleSetKind,
    addSet,
    removeSet,
    setActiveExerciseIndex,
    replaceExercise,
    addRestSeconds,
    skipRestTimer,
    finishWorkout,
    cancelWorkout,
  };
}

export const activeWorkoutStore = createRoot(createActiveWorkoutStore);
