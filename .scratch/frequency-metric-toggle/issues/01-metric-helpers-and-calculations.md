# 01: Funções de Cálculo e Formatação de Métricas (Calorias e Tonelagem)

**What to build:**
Adicionar funções utilitárias no domínio para agregação e formatação de métricas semanais (contagem de treinos, soma de calorias estimadas e soma de tonelagem/volume em kg), além de formatação padronizada para exibição na UI (`16.400 kg` / `~1.820 kcal`).

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Implementar `calculateCurrentWeekStats(sessions, referenceDate?)` retornando `{ workoutCount, totalCalories, totalVolumeKg }`.
- [x] Implementar `formatTonnage(volumeKg: number): string` com separadores pt-BR (`16.400 kg`).
- [x] Implementar `formatCalories(kcal: number): string` com indicador aproximado pt-BR (`~1.820 kcal`).
- [x] Cobrir com testes unitários em `src/domain/__tests__/metrics.test.ts` garantindo comportamento com dados vazios, 1 treino e múltiplos treinos.
