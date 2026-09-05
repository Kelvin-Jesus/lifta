import type { MuscleGroup, Equipment } from '../domain/types';

export const MUSCLE_NAME_PT: Record<MuscleGroup, string> = {
  chest: 'Peitoral',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraços',
  abs: 'Abdômen',
  obliques: 'Oblíquos',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posterior de Coxa',
  glutes: 'Glúteos',
  calves: 'Panturrilhas',
};

export const EQUIPMENT_NAME_PT: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Halteres',
  machine: 'Máquina',
  cable: 'Polia / Cabo',
  bodyweight: 'Peso Corporal',
  cardio: 'Cardio',
};

export function formatMuscleName(muscle?: string): string {
  if (!muscle) return '';
  return MUSCLE_NAME_PT[muscle as MuscleGroup] ?? muscle;
}

export function formatEquipmentName(equipment?: string): string {
  if (!equipment) return '';
  return EQUIPMENT_NAME_PT[equipment as Equipment] ?? equipment;
}
