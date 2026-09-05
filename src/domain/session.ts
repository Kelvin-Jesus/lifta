import { Schema } from 'effect';
import { WorkoutSet } from './set';

export const LoggedExercise = Schema.Struct({
  exerciseId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'O ID do exercício é obrigatório' })
  ),
  exerciseName: Schema.optional(Schema.String),
  sets: Schema.Array(WorkoutSet),
  notes: Schema.optional(Schema.String),
});
export type LoggedExercise = typeof LoggedExercise.Type;

export const WorkoutSession = Schema.Struct({
  id: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'O ID da sessão é obrigatório' })
  ),
  routineId: Schema.optional(Schema.String),
  routineName: Schema.optional(Schema.String),
  startedAt: Schema.String,
  endedAt: Schema.String,
  durationMinutes: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0)
  ),
  exercises: Schema.Array(LoggedExercise),
  estimatedCalories: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0)
  ),
  totalVolumeKg: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0)
  ),
  notes: Schema.optional(Schema.String),
});
export type WorkoutSession = typeof WorkoutSession.Type;

export const ActiveSession = Schema.Struct({
  id: Schema.String,
  routineId: Schema.optional(Schema.String),
  routineName: Schema.optional(Schema.String),
  startedAt: Schema.String,
  activeExerciseIndex: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0)),
  exercises: Schema.Array(LoggedExercise),
  restTimerEndTimestamp: Schema.optional(Schema.NullOr(Schema.Number)),
  restTimerDurationSeconds: Schema.optional(Schema.Number),
});
export type ActiveSession = typeof ActiveSession.Type;
