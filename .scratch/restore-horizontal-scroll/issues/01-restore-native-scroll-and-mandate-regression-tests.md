# Task 01: Restaurar Scroll Horizontal Nativo e Mandar Testes de Regressão nos Workflows

Status: resolved

## Contexto e Escopo
1. Restaurar o container do `WorkoutDeck.tsx` com `overflow-x-auto snap-x snap-mandatory flex scroll-smooth no-scrollbar`.
2. Remover os botões de carrossel (`btn-deck-prev`, `btn-deck-next`), transformações via `translateX` e interceptações de drag JS.
3. Atualizar `.agents/workflows/routing.md`, `.agents/rules/routing.md` e `AGENTS.md` para exigir a criação contínua de testes de regressão de todos os tipos possíveis em qualquer alteração.
4. Criar suite de testes de regressão cobrindo o scroll snap nativo, sincronização de índices, atalhos de teclado e ausência de botões indesejados de carrossel.

## Answer
- Restabelecido o elemento `<main>` no `WorkoutDeck.tsx` com rolagem nativa acelerada por hardware: `overflow-x-auto snap-x snap-mandatory flex scroll-smooth no-scrollbar`, com `-webkit-overflow-scrolling: touch` e `scrollbar-width: none`.
- Removidos completamente os botões flutuantes de carrossel (`btn-deck-prev`, `btn-deck-next`), a trilha manual de `translateX` e os manipuladores de drag JS que sobrepunham a rolagem natural.
- Restabelecida sincronização bidirecional via listener `onScroll` nativo e navegação via teclado (`ArrowLeft` / `ArrowRight`) e barra segmentada.
- Adicionada a política obrigatória de geração de testes de regressão de todos os tipos possíveis em `AGENTS.md`, `.agents/rules/routing.md` e `.agents/workflows/routing.md`.
- Criada a suíte de testes de regressão `src/features/workout/__tests__/workoutDeckScrollRegression.test.tsx` com 5 testes de regressão cobrindo classes nativas, ausência de botões de carrossel, eventos de scroll nativos e navegação de teclado/segmentos.

