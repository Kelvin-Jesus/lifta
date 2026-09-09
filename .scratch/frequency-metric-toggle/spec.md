# Spec: Toggle entre Frequência + Calorias e Frequência + Tonelagem

Status: ready-for-agent

## Problem Statement

No dashboard inicial (`HomeDashboard`), o usuário visualiza o card de métricas de atividade física no modo "Frequência e Intensidade", exibindo a contagem de treinos combinada exclusivamente com calorias estimadas (ex: `4 treinos • ~1.820 kcal`), tanto no cabeçalho quanto no heatmap estilo GitHub.

Porém, praticantes de musculação e treinamento de força frequentemente priorizam **tonelagem** (volume total de carga levantada em kg: reps × peso) como principal indicador de sobrecarga progressiva e dedicação semanal, em vez de gasto calórico estimado. Atualmente, o usuário não possui uma forma rápida na interface de alternar a visualização para acompanhar seu volume/tonelagem total ao lado da frequência.

## Solution

Implementar um controle na UI (botão/segmented control intuitivo no cabeçalho do card de métricas) que permita ao usuário alternar com 1 toque entre:
1. **Frequência + Calorias**: Exibe o título "Frequência e Calorias", meta com calorias estimadas (ex: `4 treinos • ~1.820 kcal`), e o heatmap com gradiente e detalhes baseados no gasto calórico.
2. **Frequência + Tonelagem**: Exibe o título "Frequência e Tonelagem", meta com volume acumulado em kg/toneladas (ex: `4 treinos • 16.400 kg`), e o heatmap com gradiente e detalhes calculados pelo volume total de carga levantada.

A preferência selecionada é persistida localmente (`localStorage`), garantindo que o app mantenha a escolha do usuário entre sessões.

## User Stories

1. As a strength athlete, I want to toggle the stats header from calories to tonnage, so that I can track my total weekly volume progression instead of caloric burn.
2. As a fitness enthusiast, I want to toggle back to calories whenever I focus on energy expenditure, so that I have complete visibility over both aspects of my training.
3. As a user, I want the heatmap cells and legend to reflect the chosen metric (calories or tonnage), so that the visual intensity levels align with the metric I selected.
4. As a user, I want the date detail popover/card in the heatmap to show the corresponding metric (kcal vs kg), so that inspecting a specific day provides accurate volume or calorie data.
5. As a user, I want my metric preference to be persisted across page reloads, so that I don't have to re-select my preferred view every time I open Lifta.
6. As a user on a mobile device, I want the toggle button to be ergonomically placed and responsive, so that it doesn't cause layout overflow or touch target collision with the Agenda button.
7. As a screen reader user, I want accessible labels and aria states on the toggle button, so that I can easily discern which metric mode is currently active.

## Implementation Decisions

1. **State & Persistence**:
   - Introduce a metric state `'calories' | 'tonnage'` initialized from `localStorage.getItem('lifta_stats_metric')` defaulting to `'calories'`.
   - Update `localStorage` synchronously whenever the user switches metrics.

2. **UI Placement & Ergonomics**:
   - Add a segmented pill toggle (`kcal` | `kg`) in `.heatmap-header` adjacent to the Agenda/Grid view toggle.
   - When the user selects `kcal`, metric is `'calories'`. When selecting `kg`, metric is `'tonnage'`.
   - On the heatmap card header:
     - Title adapts dynamically: `'Frequência e Calorias'` (calories) vs `'Frequência e Tonelagem'` (tonnage) when in heatmap view, and `'Agenda da Semana'` when in agenda view.
     - Meta text displays formatted frequency and sum of metrics for the current week / period (e.g. `4 treinos • ~1.820 kcal` vs `4 treinos • 16.400 kg`).

3. **Heatmap Metric Binding**:
   - `WorkoutHeatmap` receives a `metric: 'calories' | 'tonnage'` prop.
   - Each `DayCell` includes both `calories` and `totalVolumeKg`.
   - The cell intensity `level` (0 to 4) is evaluated based on:
     - For `calories`: `< 250 kcal` (1), `< 400 kcal` (2), `< 600 kcal` (3), `>= 600 kcal` (4).
     - For `tonnage`: `< 2.500 kg` (1), `< 4.500 kg` (2), `< 6.500 kg` (3), `>= 6.500 kg` (4).
   - Tooltips, legend text (`Mais calorias` vs `Mais tonelagem`), and detail card values dynamically reflect the active metric.

4. **Domain Calculations & Helpers**:
   - Add utility functions in domain to calculate current week stats (workout count, total calories, total volume kg) and format tonnage/calories with proper Brazilian Portuguese number formatting (`16.400 kg`).

## Testing Decisions

- Test pure domain formatting and volume calculation utilities via Vitest unit tests.
- Test `WorkoutHeatmap` rendering in both `'calories'` and `'tonnage'` modes, asserting correct intensity levels, tooltips, legend labels, and detail card values.
- Test `HomeDashboard` metric switching: clicking the toggle button switches the title, meta text, and updates localStorage.
- Perform UI QA using real browser interaction verifying responsive layout, visual fidelity, and state transitions.

## Out of Scope

- Modifying the underlying historical workout data model or database schema (the existing `WorkoutSession` schema already stores `totalVolumeKg` and `estimatedCalories`).
- Changing the Weekly Agenda view (agenda is scheduled by day of week).

## Further Notes

- Maintains 100% offline-first functionality with zero external dependencies.
- Follows Apple HIG segmented control styling and existing Lifta dark/light theme tokens.
