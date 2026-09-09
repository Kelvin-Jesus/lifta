# 02: Adaptação do WorkoutHeatmap para Suportar Tonelagem

**What to build:**
Permitir que o componente `WorkoutHeatmap` receba a propriedade `metric?: 'calories' | 'tonnage'` (padrão `'calories'`) e adapte os níveis de calor (0-4), tooltips das células, legenda de gradiente e card de detalhes com base em volume levantado (kg) ou calorias (kcal).

**Blocked by:** 01: Funções de Cálculo e Formatação de Métricas (Calorias e Tonelagem)

**Status:** resolved

- [x] Atualizar `DayCell` para registrar `totalVolumeKg` em cada dia além de `calories`.
- [x] Implementar cálculo de nível de intensidade baseado em volume quando `metric === 'tonnage'`.
- [x] Exibir tooltips e atributos `data-metric-value` condizentes com a métrica ativa.
- [x] Atualizar legenda inferior para exibir "Mais tonelagem" e faixas de peso correspondentes em modo tonelagem.
- [x] Atualizar card de detalhes ao clicar numa célula para exibir o volume levantado e o label "tonelagem total".
- [x] Adicionar testes unitários em `dashboard.test.tsx` cobrindo o WorkoutHeatmap no modo tonelagem e no modo calorias.
