import type { Routine } from '../domain/routine';

export const DEFAULT_SAMPLE_ROUTINES: Routine[] = [
  {
    id: 'routine-a-push',
    name: 'Treino A — Peito, Ombros e Tríceps',
    description: 'Foco em hipertrofia de empurrar com sobrecarga progressiva.',
    scheduledDays: ['monday', 'thursday'],
    exercises: [
      { exerciseId: 'bench-press', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, suggestedRestSeconds: 90 },
      { exerciseId: 'incline-dumbbell-press', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, suggestedRestSeconds: 90 },
      { exerciseId: 'overhead-press', targetSets: 3, targetRepsMin: 8, targetRepsMax: 10, suggestedRestSeconds: 90 },
      { exerciseId: 'lateral-raise', targetSets: 4, targetRepsMin: 12, targetRepsMax: 15, suggestedRestSeconds: 60 },
      { exerciseId: 'tricep-rope-pushdown', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, suggestedRestSeconds: 60 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'routine-b-pull',
    name: 'Treino B — Costas e Bíceps',
    description: 'Puxadas verticais e horizontais com foco em densidade dorsal.',
    scheduledDays: ['tuesday', 'friday'],
    exercises: [
      { exerciseId: 'deadlift', targetSets: 3, targetRepsMin: 5, targetRepsMax: 8, suggestedRestSeconds: 120 },
      { exerciseId: 'pull-up', targetSets: 4, targetRepsMin: 6, targetRepsMax: 10, suggestedRestSeconds: 90 },
      { exerciseId: 'barbell-bent-over-row', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, suggestedRestSeconds: 90 },
      { exerciseId: 'face-pull', targetSets: 3, targetRepsMin: 15, targetRepsMax: 20, suggestedRestSeconds: 60 },
      { exerciseId: 'barbell-bicep-curl', targetSets: 4, targetRepsMin: 10, targetRepsMax: 12, suggestedRestSeconds: 60 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'routine-c-legs',
    name: 'Treino C — Pernas e Core',
    description: 'Treino completo de cadeia anterior e posterior inferior.',
    scheduledDays: ['wednesday', 'saturday'],
    exercises: [
      { exerciseId: 'barbell-squat', targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, suggestedRestSeconds: 120 },
      { exerciseId: 'romanian-deadlift', targetSets: 3, targetRepsMin: 10, targetRepsMax: 12, suggestedRestSeconds: 90 },
      { exerciseId: 'leg-press-45', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, suggestedRestSeconds: 90 },
      { exerciseId: 'standing-calf-raise-machine', targetSets: 4, targetRepsMin: 15, targetRepsMax: 20, suggestedRestSeconds: 60 },
      { exerciseId: 'hanging-leg-raise', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15, suggestedRestSeconds: 60 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
