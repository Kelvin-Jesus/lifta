# 03: Botão de Alternância no Cabeçalho do Dashboard e Persistência

**What to build:**
Implementar o botão/segmented pill de alternância de métrica no cabeçalho do `HomeDashboard`, atualizando dinamicamente o título ("Frequência e Calorias" / "Frequência e Tonelagem") e o subtítulo meta ("4 treinos • ~1.820 kcal" / "4 treinos • 16.400 kg"), persistindo a escolha em `localStorage`.

**Blocked by:** 02: Adaptação do WorkoutHeatmap para Suportar Tonelagem

**Status:** resolved

- [x] Criar estado reativo `statsMetric` ('calories' | 'tonnage') em `HomeDashboard`, inicializado a partir de `localStorage`.
- [x] Adicionar controle segmentado na interface (`.metric-toggle-pill` com botões `kcal` e `kg`) com estilo visual alinhado ao Apple HIG e tema do Lifta.
- [x] Atualizar o título do card para refletir a métrica selecionada no modo heatmap (`Frequência e Calorias` vs `Frequência e Tonelagem`).
- [x] Atualizar o meta texto no cabeçalho usando os dados reais das sessões da semana atual através de `calculateCurrentWeekStats`.
- [x] Passar `metric={statsMetric()}` para o componente `WorkoutHeatmap`.
- [x] Cobrir com testes em `dashboard.test.tsx` verificando alternância de estado, persistência em localStorage e atualização dos textos na tela.
