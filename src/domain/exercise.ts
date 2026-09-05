import { Schema } from 'effect';
import { MuscleGroup, Equipment } from './types';

export const Exercise = Schema.Struct({
  id: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'O ID do exercício é obrigatório' })
  ),
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'O nome do exercício é obrigatório' })
  ),
  primaryMuscles: Schema.Array(MuscleGroup).pipe(
    Schema.minItems(1, { message: () => 'Pelo menos um músculo primário deve ser informado' })
  ),
  secondaryMuscles: Schema.Array(MuscleGroup),
  equipment: Equipment,
  instructions: Schema.optional(Schema.String),
  gifUrl: Schema.optional(Schema.String),
  isCustom: Schema.optional(Schema.Boolean),
});
export type Exercise = typeof Exercise.Type;
