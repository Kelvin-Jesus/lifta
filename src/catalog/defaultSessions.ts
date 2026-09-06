import type { WorkoutSession } from '../domain/session';

export function getSampleSessions(): WorkoutSession[] {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - dayOfWeek));

  const numWeeks = 18;
  const totalDays = numWeeks * 7; // 126 days
  const startDate = new Date(endOfWeek);
  startDate.setDate(endOfWeek.getDate() - totalDays + 1);

  const sessions: WorkoutSession[] = [];

  for (let i = 0; i < totalDays; i++) {
    // 1. Earlier weeks (first 5 weeks: days 0 to 34) stay unlit / "apagados" like GitHub
    if (i < 35) {
      continue;
    }

    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    d.setHours(19, 15, 0, 0);

    // 2. Current week (last 7 days: i >= 119) matches dashboard header: 4 treinos • ~1.820 kcal
    if (i >= totalDays - 7) {
      const dayInWeek = i - (totalDays - 7); // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
      // 4 workouts this week: Mon (0), Wed (2), Fri (4), Sat (5)
      if (dayInWeek !== 0 && dayInWeek !== 2 && dayInWeek !== 4 && dayInWeek !== 5) {
        continue;
      }

      let calories = 450;
      let duration = 50;
      let volume = 4100;
      let routineType = 'A';

      if (dayInWeek === 0) {
        calories = 450; // Mon (Tier 3)
        duration = 50;
        volume = 4100;
        routineType = 'A';
      } else if (dayInWeek === 2) {
        calories = 480; // Wed (Tier 3)
        duration = 55;
        volume = 4400;
        routineType = 'B';
      } else if (dayInWeek === 4) {
        calories = 650; // Fri (Tier 4)
        duration = 65;
        volume = 5600;
        routineType = 'C';
      } else if (dayInWeek === 5) {
        calories = 240; // Sat (Tier 1)
        duration = 30;
        volume = 2200;
        routineType = 'A';
      }
      // Total calories: 450 + 480 + 650 + 240 = 1820 kcal (exactly 4 treinos)

      const routineName = routineType === 'A'
        ? 'Treino A • Peitoral e Tríceps'
        : routineType === 'B'
          ? 'Treino B • Costas e Bíceps'
          : 'Treino C • Pernas e Ombros';
      const routineId = routineType === 'A'
        ? 'routine-a-push'
        : routineType === 'B'
          ? 'routine-b-pull'
          : 'routine-c-legs';

      const endD = new Date(d);
      endD.setMinutes(endD.getMinutes() + duration);

      sessions.push({
        id: `session-sample-${i}`,
        routineId,
        routineName,
        startedAt: d.toISOString(),
        endedAt: endD.toISOString(),
        durationMinutes: duration,
        estimatedCalories: calories,
        totalVolumeKg: volume,
        exercises: [
          {
            exerciseId: routineType === 'A' ? 'bench-press' : routineType === 'B' ? 'pull-up' : 'barbell-squat',
            exerciseName: routineType === 'A' ? 'Supino Reto com Barra' : routineType === 'B' ? 'Barra Fixa' : 'Agachamento Livre',
            sets: [
              { type: 'resistance', kind: 'normal', reps: 10, weightKg: 70, completed: true, restSeconds: 90 },
              { type: 'resistance', kind: 'normal', reps: 8, weightKg: 75, completed: true, restSeconds: 90 },
              { type: 'resistance', kind: 'normal', reps: 8, weightKg: 75, completed: true, restSeconds: 90 },
            ],
          },
        ],
      });
      continue;
    }

    // 3. Active consistency period (weeks 5 to 16, days 35 to 118)
    // Organic, realistic scatter of workouts across weekdays and weekends
    const isWorkoutDay = (i % 3 === 0 || i % 7 === 1);
    if (!isWorkoutDay) continue;

    // Organic caloric intensity tiers
    let calories: number;
    let duration: number;
    let volume: number;

    if (i % 5 === 0) {
      calories = 650; // Tier 4 (>600 kcal)
      duration = 65;
      volume = 5300;
    } else if (i % 4 === 0) {
      calories = 480; // Tier 3 (400-600 kcal)
      duration = 55;
      volume = 4200;
    } else if (i % 2 === 0) {
      calories = 340; // Tier 2 (250-400 kcal)
      duration = 45;
      volume = 3200;
    } else {
      calories = 210; // Tier 1 (150-250 kcal)
      duration = 32;
      volume = 2000;
    }

    const routineType = (i % 3 === 0) ? (i % 6 === 0 ? 'A' : 'B') : 'C';
    const routineName = routineType === 'A'
      ? 'Treino A • Peitoral e Tríceps'
      : routineType === 'B'
        ? 'Treino B • Costas e Bíceps'
        : 'Treino C • Pernas e Ombros';
    const routineId = routineType === 'A'
      ? 'routine-a-push'
      : routineType === 'B'
        ? 'routine-b-pull'
        : 'routine-c-legs';

    const endD = new Date(d);
    endD.setMinutes(endD.getMinutes() + duration);

    sessions.push({
      id: `session-sample-${i}`,
      routineId,
      routineName,
      startedAt: d.toISOString(),
      endedAt: endD.toISOString(),
      durationMinutes: duration,
      estimatedCalories: calories,
      totalVolumeKg: volume,
      exercises: [
        {
          exerciseId: routineType === 'A' ? 'bench-press' : routineType === 'B' ? 'pull-up' : 'barbell-squat',
          exerciseName: routineType === 'A' ? 'Supino Reto com Barra' : routineType === 'B' ? 'Barra Fixa' : 'Agachamento Livre',
          sets: [
            { type: 'resistance', kind: 'normal', reps: 10, weightKg: 70, completed: true, restSeconds: 90 },
            { type: 'resistance', kind: 'normal', reps: 8, weightKg: 75, completed: true, restSeconds: 90 },
            { type: 'resistance', kind: 'normal', reps: 8, weightKg: 75, completed: true, restSeconds: 90 },
          ],
        },
      ],
    });
  }

  return sessions;
}
