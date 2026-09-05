import { Effect } from 'effect';
import type { ModelContext, WebMCPTool } from './types';
import {
  EXERCISE_CATALOG,
  searchExercises,
  filterExercisesByMuscle,
  filterExercisesByEquipment,
  getExerciseById,
} from '../catalog/exercises';
import { RoutineRepository } from '../storage/repositories/RoutineRepository';
import { WorkoutSessionRepository } from '../storage/repositories/WorkoutSessionRepository';
import type { Routine, RoutineExercise } from '../domain/routine';
import type { WorkoutSession } from '../domain/session';
import type { MuscleGroup, Equipment, Weekday } from '../domain/types';

export function getAllWebMCPTools(): WebMCPTool[] {
  const searchExercisesTool: WebMCPTool = {
    name: 'search_exercises',
    description: 'Busca exercícios no catálogo por texto, grupo muscular alvo ou equipamento necessário.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Termo de busca (nome ou instrução)' },
        muscleGroup: {
          type: 'string',
          enum: [
            'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
            'abs', 'obliques', 'quadriceps', 'hamstrings', 'glutes', 'calves',
          ],
          description: 'Grupo muscular alvo',
        },
        equipment: {
          type: 'string',
          enum: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'cardio'],
          description: 'Tipo de equipamento',
        },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        exercises: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
      },
    },
    requiresApproval: false,
    handler: async (params: {
      query?: string;
      muscleGroup?: MuscleGroup;
      equipment?: Equipment;
    }) => {
      let results = [...EXERCISE_CATALOG];
      if (params.query) {
        results = searchExercises(results, params.query);
      }
      if (params.muscleGroup) {
        results = filterExercisesByMuscle(results, params.muscleGroup);
      }
      if (params.equipment) {
        results = filterExercisesByEquipment(results, params.equipment);
      }
      return {
        exercises: results.map((ex) => ({
          id: ex.id,
          name: ex.name,
          primaryMuscles: ex.primaryMuscles,
          secondaryMuscles: ex.secondaryMuscles,
          equipment: ex.equipment,
        })),
        total: results.length,
      };
    },
  };

  const getExerciseDetailsTool: WebMCPTool = {
    name: 'get_exercise_details',
    description: 'Retorna metadados completos de um exercício (instruções posturais e músculos ativados).',
    inputSchema: {
      type: 'object',
      required: ['exerciseId'],
      properties: {
        exerciseId: { type: 'string', description: 'ID canônico do exercício' },
      },
    },
    requiresApproval: false,
    handler: async (params: { exerciseId: string }) => {
      const exercise = getExerciseById(EXERCISE_CATALOG, params.exerciseId);
      if (!exercise) {
        throw new Error(`Exercício não encontrado no catálogo: ${params.exerciseId}`);
      }
      return exercise;
    },
  };

  const createRoutineTool: WebMCPTool = {
    name: 'create_routine',
    description: 'Cria uma nova rotina/ficha de treino com lista ordenada de exercícios e séries alvo.',
    inputSchema: {
      type: 'object',
      required: ['name', 'exercises'],
      properties: {
        name: { type: 'string', description: 'Nome da ficha (ex: Treino A - Peito)' },
        description: { type: 'string', description: 'Descrição ou observações gerais' },
        scheduledDays: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
          description: 'Dias da semana programados para esta ficha',
        },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            required: ['exerciseId', 'targetSets'],
            properties: {
              exerciseId: { type: 'string' },
              targetSets: { type: 'number', minimum: 1 },
              targetRepsMin: { type: 'number' },
              targetRepsMax: { type: 'number' },
              suggestedRestSeconds: { type: 'number' },
              notes: { type: 'string' },
            },
          },
          minItems: 1,
        },
      },
    },
    requiresApproval: false,
    handler: async (params: {
      name: string;
      description?: string;
      scheduledDays?: Weekday[];
      exercises: RoutineExercise[];
    }) => {
      const now = new Date().toISOString();
      const routine: Routine = {
        id: `routine-${Date.now()}`,
        name: params.name.trim(),
        description: params.description,
        scheduledDays: params.scheduledDays,
        exercises: params.exercises.map((e) => ({
          ...e,
          suggestedRestSeconds: e.suggestedRestSeconds ?? 90,
        })),
        createdAt: now,
        updatedAt: now,
      };

      const saved = await Effect.runPromise(RoutineRepository.save(routine));
      return {
        routineId: saved.id,
        routine: saved,
      };
    },
  };

  const getRoutineTool: WebMCPTool = {
    name: 'get_routine',
    description: 'Busca os detalhes de uma rotina existente por ID.',
    inputSchema: {
      type: 'object',
      required: ['routineId'],
      properties: {
        routineId: { type: 'string', description: 'ID da rotina' },
      },
    },
    requiresApproval: false,
    handler: async (params: { routineId: string }) => {
      const routine = await Effect.runPromise(RoutineRepository.getById(params.routineId));
      if (!routine) {
        throw new Error(`Rotina não encontrada: ${params.routineId}`);
      }
      return routine;
    },
  };

  const listRoutinesTool: WebMCPTool = {
    name: 'list_routines',
    description: 'Lista todas as rotinas e fichas de treino cadastradas no banco local.',
    inputSchema: { type: 'object', properties: {} },
    requiresApproval: false,
    handler: async () => {
      const routines = await Effect.runPromise(RoutineRepository.listAll());
      return {
        routines,
        total: routines.length,
      };
    },
  };

  const updateRoutineTool: WebMCPTool = {
    name: 'update_routine',
    description: 'Atualiza o nome, dias programados ou lista de exercícios de uma rotina.',
    inputSchema: {
      type: 'object',
      required: ['routineId', 'patch'],
      properties: {
        routineId: { type: 'string' },
        patch: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            scheduledDays: { type: 'array', items: { type: 'string' } },
            exercises: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    requiresApproval: true,
    handler: async (params: { routineId: string; patch: Partial<Routine> }) => {
      const current = await Effect.runPromise(RoutineRepository.getById(params.routineId));
      if (!current) {
        throw new Error(`Rotina não encontrada para atualização: ${params.routineId}`);
      }

      const updated: Routine = {
        ...current,
        ...params.patch,
        updatedAt: new Date().toISOString(),
      };

      const saved = await Effect.runPromise(RoutineRepository.save(updated));
      return { routine: saved };
    },
  };

  const deleteRoutineTool: WebMCPTool = {
    name: 'delete_routine',
    description: 'Exclui permanentemente uma rotina cadastrada.',
    inputSchema: {
      type: 'object',
      required: ['routineId'],
      properties: {
        routineId: { type: 'string' },
      },
    },
    requiresApproval: true,
    handler: async (params: { routineId: string }) => {
      const success = await Effect.runPromise(RoutineRepository.delete(params.routineId));
      return { success };
    },
  };

  const replaceExerciseInRoutineTool: WebMCPTool = {
    name: 'replace_exercise_in_routine',
    description: 'Substitui um exercício por outro em uma ficha mantendo a quantidade de séries alvo.',
    inputSchema: {
      type: 'object',
      required: ['routineId', 'oldExerciseId', 'newExerciseId'],
      properties: {
        routineId: { type: 'string' },
        oldExerciseId: { type: 'string' },
        newExerciseId: { type: 'string' },
      },
    },
    requiresApproval: true,
    handler: async (params: {
      routineId: string;
      oldExerciseId: string;
      newExerciseId: string;
    }) => {
      const current = await Effect.runPromise(RoutineRepository.getById(params.routineId));
      if (!current) {
        throw new Error(`Rotina não encontrada: ${params.routineId}`);
      }

      const exercises = current.exercises.map((e) =>
        e.exerciseId === params.oldExerciseId
          ? { ...e, exerciseId: params.newExerciseId }
          : e
      );

      const updated: Routine = {
        ...current,
        exercises,
        updatedAt: new Date().toISOString(),
      };

      const saved = await Effect.runPromise(RoutineRepository.save(updated));
      return { routine: saved };
    },
  };

  const getWorkoutHistoryTool: WebMCPTool = {
    name: 'get_workout_history',
    description: 'Consulta o histórico de sessões de treino executadas.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 20 },
        fromDate: { type: 'string', description: 'Data inicial ISO' },
        toDate: { type: 'string', description: 'Data final ISO' },
      },
    },
    requiresApproval: false,
    handler: async (params: { limit?: number; fromDate?: string; toDate?: string }) => {
      const sessions = await Effect.runPromise(
        WorkoutSessionRepository.listAll({
          limit: params.limit,
          fromDate: params.fromDate,
          toDate: params.toDate,
        })
      );
      return {
        sessions,
        total: sessions.length,
      };
    },
  };

  const getExerciseProgressTool: WebMCPTool = {
    name: 'get_exercise_progress',
    description: 'Calcula o progresso de cargas, volume e 1RM estimado (fórmula Brzycki) para um exercício.',
    inputSchema: {
      type: 'object',
      required: ['exerciseId'],
      properties: {
        exerciseId: { type: 'string' },
        periodDays: { type: 'number', default: 90 },
      },
    },
    requiresApproval: false,
    handler: async (params: { exerciseId: string; periodDays?: number }) => {
      const allSessions = await Effect.runPromise(WorkoutSessionRepository.listAll());
      const cutoffMs = Date.now() - (params.periodDays ?? 90) * 86400000;

      const progressPoints: {
        date: string;
        maxWeightKg: number;
        totalVolumeKg: number;
        estimated1RM: number;
      }[] = [];

      let globalEstimated1RM = 0;

      for (const s of allSessions) {
        if (new Date(s.startedAt).getTime() < cutoffMs) continue;

        const targetExercise = s.exercises.find((e) => e.exerciseId === params.exerciseId);
        if (!targetExercise) continue;

        let maxWeight = 0;
        let dayVolume = 0;
        let dayBest1RM = 0;

        for (const set of targetExercise.sets) {
          if (set.completed && set.type === 'resistance') {
            const w = set.weightKg;
            const r = set.reps;
            dayVolume += w * r;
            if (w > maxWeight) maxWeight = w;

            // Brzycki 1RM formula: weight / (1.0278 - 0.0278 * reps)
            const brzycki = r === 1 ? w : w / (1.0278 - 0.0278 * Math.min(36, r));
            if (brzycki > dayBest1RM) dayBest1RM = Math.round(brzycki * 10) / 10;
          }
        }

        if (maxWeight > 0) {
          if (dayBest1RM > globalEstimated1RM) globalEstimated1RM = dayBest1RM;
          progressPoints.push({
            date: s.startedAt.slice(0, 10),
            maxWeightKg: maxWeight,
            totalVolumeKg: Math.round(dayVolume * 10) / 10,
            estimated1RM: dayBest1RM,
          });
        }
      }

      return {
        exerciseId: params.exerciseId,
        history: progressPoints,
        estimated1RM: globalEstimated1RM,
      };
    },
  };

  const logWorkoutSessionTool: WebMCPTool = {
    name: 'log_workout_session',
    description: 'Registra uma sessão de treino concluída diretamente no banco de dados local.',
    inputSchema: {
      type: 'object',
      required: ['startedAt', 'endedAt', 'durationMinutes', 'exercises', 'totalVolumeKg', 'estimatedCalories'],
      properties: {
        routineId: { type: 'string' },
        routineName: { type: 'string' },
        startedAt: { type: 'string' },
        endedAt: { type: 'string' },
        durationMinutes: { type: 'number' },
        exercises: { type: 'array', items: { type: 'object' } },
        totalVolumeKg: { type: 'number' },
        estimatedCalories: { type: 'number' },
        notes: { type: 'string' },
      },
    },
    requiresApproval: false,
    handler: async (params: Omit<WorkoutSession, 'id'>) => {
      const session: WorkoutSession = {
        ...params,
        id: `session-${Date.now()}`,
      };

      const saved = await Effect.runPromise(WorkoutSessionRepository.save(session));
      return {
        sessionId: saved.id,
        session: saved,
      };
    },
  };

  const deleteWorkoutSessionTool: WebMCPTool = {
    name: 'delete_workout_session',
    description: 'Remove uma sessão de treino do histórico.',
    inputSchema: {
      type: 'object',
      required: ['sessionId'],
      properties: {
        sessionId: { type: 'string' },
      },
    },
    requiresApproval: true,
    handler: async (params: { sessionId: string }) => {
      const success = await Effect.runPromise(WorkoutSessionRepository.delete(params.sessionId));
      return { success };
    },
  };

  return [
    searchExercisesTool,
    getExerciseDetailsTool,
    createRoutineTool,
    getRoutineTool,
    listRoutinesTool,
    updateRoutineTool,
    deleteRoutineTool,
    replaceExerciseInRoutineTool,
    getWorkoutHistoryTool,
    getExerciseProgressTool,
    logWorkoutSessionTool,
    deleteWorkoutSessionTool,
  ];
}

export function registerAllWebMCPTools(context: ModelContext): void {
  const tools = getAllWebMCPTools();
  for (const tool of tools) {
    context.registerTool(tool);
  }
}
