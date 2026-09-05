import { Schema } from 'effect';
import { Weekday } from './types';

export const RoutineExercise = Schema.Struct({
  exerciseId: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'O ID do exercício é obrigatório' })
  ),
  targetSets: Schema.Number.pipe(
    Schema.int(),
    Schema.greaterThan(0, { message: () => 'Deve haver pelo menos 1 série' })
  ),
  targetRepsMin: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.greaterThan(0))),
  targetRepsMax: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.greaterThan(0))),
  suggestedRestSeconds: Schema.Number.pipe(
    Schema.int(),
    Schema.greaterThanOrEqualTo(0)
  ),
  notes: Schema.optional(Schema.String),
});
export type RoutineExercise = typeof RoutineExercise.Type;

export const Routine = Schema.Struct({
  id: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'O ID da rotina é obrigatório' })
  ),
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'O nome da rotina é obrigatório' })
  ),
  description: Schema.optional(Schema.String),
  scheduledDays: Schema.optional(Schema.Array(Weekday)),
  exercises: Schema.Array(RoutineExercise).pipe(
    Schema.minItems(1, { message: () => 'A rotina deve conter pelo menos 1 exercício' })
  ),
  createdAt: Schema.String,
  updatedAt: Schema.String,
});
export type Routine = typeof Routine.Type;
