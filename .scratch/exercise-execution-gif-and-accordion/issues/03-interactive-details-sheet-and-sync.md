# Issue 03: Bottom Sheet Unificado com GIF, Instruções e Anatomia Completa

Status: done
Blocked by: none

## Context

Ao tocar no card de mídia do exercício ativo (`MuscleFocusCard`) ou no botão de detalhes, o usuário deve ser levado a um Bottom Sheet completo e informativo, exibindo tanto o GIF em tamanho expandido quanto as instruções de execução e o mapa anatômico interativo dos músculos.

## Scope & Implementation Details

1. Enriquecer o modal/bottom sheet em `MuscleFocusCard.tsx` para apresentar em abas ou seções bem delineadas:
   - GIF de execução ampliado e nítido com status animado.
   - Bloco de "Instruções de Execução" com texto de suporte para forma e técnica.
   - Visualizador de músculos alvo (`BodyHighlighter`) com badges dos músculos primários e sinergistas.
2. Garantir fechamento fluido por gesto (arrastar para baixo) ou toque no backdrop/tecla Esc via `BottomSheet`.
3. Escrever testes unitários em `workoutDeckAndSheet.test.tsx` cobrindo a renderização dos três elementos dentro do sheet.
