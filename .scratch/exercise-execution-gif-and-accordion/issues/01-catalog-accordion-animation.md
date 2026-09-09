# Issue 01: Animação Fluida de Abertura e Fechamento no Catálogo de Exercícios

Status: done
Blocked by: none

## Context

No componente `CatalogView.tsx`, a expansão de detalhes do exercício ocorre através de um `<Show when={isExpanded()}>` abrupto e uma seta estática de texto (`▲` / `›`). É necessário adicionar uma animação fluida de abertura e fechamento (accordion) com rotação suave do chevron, sem travamentos de layout.

## Scope & Implementation Details

1. Adicionar classes de accordion no CSS (`.catalog-accordion`, `.catalog-accordion-inner`, etc.) utilizando CSS Grid (`grid-template-rows: 0fr -> 1fr`) e transições em `opacity` e `transform: translateY`.
2. Substituir os caracteres unicode por um ícone SVG de chevron com `transition: transform 220ms var(--ease-apple)` que rotaciona suavemente quando expandido.
3. Adicionar regra para `@media (prefers-reduced-motion: reduce)`.
4. Atualizar testes unitários em `CatalogView.test.tsx` para garantir a integridade dos atributos de expansão e clique interno.
