# Issue 04: UI QA, Inspeção Visual em Navegador Real e Validação de Animações

Status: done
Blocked by: none

## Context

Conforme as diretrizes do projeto Lifta em `AGENTS.md`, tarefas com alterações visuais e de movimento requerem inspeção ativa em navegador real com foco em microinterações, performance de renderização, rotação fluida de chevrons, ausência de layout shifts bruscos e validação de `prefers-reduced-motion`.

## Scope & Implementation Details

1. Iniciar servidor de desenvolvimento local (`npm run dev` / `pnpm dev`).
2. Utilizar browser subagent / browser automation para inspecionar:
   - Abertura e recolhimento suave do accordion no catálogo (`CatalogView`).
   - Rotação suave do chevron de 180° sem repinturas custosas.
   - Tela de execução de treino (`WorkoutDeck`): verificar que o GIF é carregado e reproduzido de forma proeminente com prioridade no topo da tela.
   - Alternância rápida e sem atraso entre "Execução" e "Músculos".
   - Abertura do Bottom Sheet de detalhes com exibição fluida do GIF, texto de instrução e silhueta anatômica.
   - Responsividade no frame mobile e nos temas Dark e Light.
3. Capturar evidências visuais (screenshots e gravações WebP) e registrar no walkthrough.
