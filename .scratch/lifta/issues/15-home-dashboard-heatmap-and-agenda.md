# 15 - Home Dashboard Heatmap and Agenda

Type: task
Status: resolved
Blocked by: 11, 12

## Goal

Construir a tela principal do aplicativo (Home / Treinar), apresentando o Card Hero inteligente da rotina do dia, o Heatmap de 12 semanas estilo GitHub alimentado pelo cálculo calórico MET offline, a Agenda Semanal de treinos programados, o gerenciamento de rotinas e o controle de temas e cores de destaque.

## Deliverables

1. **Card Hero Inteligente do Dia**:
   - Detecção automática do treino previsto pelo dia da semana ou pelo rodízio contínuo (A → B → C).
   - Card amplo com visualizador anatômico da cobertura muscular da ficha toda via `body-highlighter`.
   - Botão de ação primária `Iniciar Treino de Hoje` iniciando o fluxo em 1 toque.
   - Atalhos rápidos para acessar outras fichas cadastradas.
2. **Heatmap de Consistência & Calorias Estilo GitHub**:
   - Grade temporal de 12 semanas × 7 dias (84 células).
   - Intensidade da cor mapeada em 4 níveis determinísticos pelo gasto calórico da sessão (`<200 kcal`, `200-400 kcal`, `400-600 kcal`, `>600 kcal`), calculado 100% offline.
   - Toque na célula exibindo tooltip com data, rotina, duração e calorias.
3. **Agenda Semanal Expandível**:
   - Alternador no topo do container de stats entre visão "Grid" e visão "Agenda".
   - Exibição dos dias de segunda a domingo com a ficha programada e status de conclusão na semana corrente.
4. **Gerenciamento de Rotinas**:
   - Visualização da lista de rotinas (A, B, C) com quantidade de exercícios e músculos trabalhados.
   - Criação e edição manual de rotinas.
5. **Temas & Personalização**:
   - Alternador Dark Mode OLED puro (`#000000`) e Light Mode nativo (`#f2f2f7`).
   - Seletor de cor de destaque (`--accent`): Azul Apple padrão (`#007aff`) e Roxo Índigo (`#5856d6`).
