# Spec: Restauração do Scroll Horizontal Nativo no WorkoutDeck e Mandato de Testes de Regressão nos Workflows

Status: ready-for-agent

## Problem Statement

1. **Quebra do Scroll Horizontal no WorkoutDeck**: Em intervenções anteriores, a rolagem horizontal nativa fluida (`overflow-x-auto snap-x snap-mandatory flex scroll-smooth`) foi equivocadamente substituída por um simulador de carrossel com botões flutuantes (`btn-deck-prev`, `btn-deck-next`), contêiner `overflow-hidden` e transformações CSS manuais via `translateX`. Essa abordagem quebrou a experiência ergonômica nativa de deslize (swipe mobile, dois dedos no trackpad, rolagem suave de hardware) e inseriu elementos visuais indesejados na tela de treino.
2. **Necessidade de Diretriz Permanente para Testes de Regressão nos Workflows**: Modificações em comportamentos funcionais já consolidados devem ser blindadas por testes de regressão automatizados de todos os tipos possíveis (unitários, integração/componente, interação/gesto e E2E) para evitar reincidência de quebras estruturais e de UX.

## Solution

1. **Restaurar Rolagem Nativa com CSS Scroll Snap**:
   - Restaurar o elemento `<main>` do `WorkoutDeck` com `overflow-x-auto snap-x snap-mandatory flex scroll-smooth no-scrollbar` e propriedades CSS para aceleração por hardware (`-webkit-overflow-scrolling: touch`, `scrollbar-width: none`).
   - Cada card de exercício é filho direto com `snap-center` e largura total `min-w-full`.
   - Eliminar definitivamente os botões flutuantes de carrossel (`btn-deck-prev` e `btn-deck-next`) e o container de translação manual `translateX`.
   - Manter sincronização bidirecional via listener `onScroll` nativo para atualizar `activePageIndex` e a barra segmentada de progresso.
   - Preservar atalhos de teclado (`ArrowLeft` / `ArrowRight`) e navegação via segmentos do topo chamando `scrollTo`.
2. **Atualização dos Workflows e Políticas de Agente**:
   - Atualizar `.agents/workflows/routing.md`, `.agents/rules/routing.md` e `AGENTS.md` com política estrita: para qualquer bugfix, refatoração ou modificação em fluxo existente, é mandatório criar testes de regressão de todos os tipos aplicáveis (unitários, componentes/interação, gestos/rolagem e E2E).

## User Stories

1. Como praticante durante o treino, quero deslizar horizontalmente com um gesto fluido do polegar para trocar de exercício, aproveitando o snap nativo do sistema operacional sem botões intrusivos na tela.
2. Como usuário em desktop/laptop, quero usar trackpad ou teclas direcionais (ArrowLeft / ArrowRight) para navegar entre exercícios sem perder a fluidez da interface.
3. Como mantenedor do projeto, quero que os workflows instruam todos os agentes a sempre produzir testes de regressão abrangentes para evitar que features consolidadas voltem a ser quebradas.
