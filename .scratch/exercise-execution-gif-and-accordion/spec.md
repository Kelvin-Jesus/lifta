# Spec: Demonstração de Execução (GIF) Prioritária no Treino Ativo e Animação de Abertura/Fechamento no Catálogo

Status: done

## Problem Statement

Atualmente no Lifta existem duas lacunas importantes de usabilidade e polimento visual:

1. **Ausência de Animação no Accordion do Catálogo (`CatalogView`)**:
   Na lista de exercícios do catálogo, tocar em um exercício expande os detalhes (GIF de demonstração, instruções de execução e mapa anatômico dos músculos alvo). No entanto, o conteúdo surge e desaparece abruptamente (via `<Show when={isExpanded()}>` puro), sem transição fluida de altura/opacidade e com o indicador de seta alternando instantaneamente entre caracteres estáticos (`›` e `▲`). Isso causa quebra de continuidade visual e sensação de rigidez na interface.

2. **Falta do GIF de Execução na Tela Ativa do Exercício (`WorkoutDeck` / `MuscleFocusCard`)**:
   Durante a execução ativa de um treino, o atleta na academia precisa rapidamente consultar a técnica correta de execução do exercício (trajetória, pegada e amplitude). No entanto, o card superior visível no topo da tela ativa (`MuscleFocusCard`) exibe apenas a silhueta anatômica ("tela de partes do corpo que o exercício pega"). A animação GIF de execução fica ausente desse card ou escondida em um botão secundário dentro do card de séries. Conforme solicitado pelo usuário, a demonstração em GIF da execução é prioridade máxima em relação à visualização puramente anatômica dos músculos.

## Solution

1. **Animação Fluida de Abertura e Fechamento no Catálogo**:
   - Implementar uma animação de accordion baseada em CSS Grid moderno (`grid-template-rows: 0fr` para `1fr`), com overflow oculto e transição suave de opacidade e sutil deslocamento vertical (`translateY`).
   - Substituir o caractere estático por um ícone SVG de chevron moderno com rotação física contínua de 180° (`transition: transform 220ms var(--ease-apple)`).
   - Respeitar estritamente `prefers-reduced-motion` com transições suaves sem saltos.

2. **GIF de Demonstração de Execução como Prioridade na Tela de Execução Ativa (`WorkoutDeck` / `MuscleFocusCard`)**:
   - Evoluir o card superior da tela de execução (`MuscleFocusCard`) para exibir com prioridade imediata o **GIF de demonstração do movimento** (`ex.gifUrl`).
   - Oferecer um controle segmentado ou abas sutis (`Execução` / `Músculos`), mantendo `Execução` como padrão/prioritário.
   - Na visualização de Execução:
     - Exibir o GIF animado em moldura elegante com cantos arredondados, fundo elevado e indicador dinâmico `• Demonstração do Movimento`.
     - Exibir nome do exercício, equipamento e foco muscular principal com badge contextual.
     - Disponibilizar botão de substituição rápida ("Trocar") e botão de detalhes ("Expandir / Instruções").
   - Ao tocar no card ou no botão de detalhes, abrir Bottom Sheet completo contendo:
     - GIF em alta definição com loop contínuo.
     - Instruções detalhadas passo a passo de postura e execução.
     - Mapa anatômico interativo (`BodyHighlighter`) com músculos primários e sinergistas.

## User Stories

1. Como atleta executando um treino, quero ver imediatamente o GIF animado de demonstração do exercício na tela de execução, para que eu possa verificar a postura e movimento correto antes de iniciar a série sem precisar navegar por menus secundários.
2. Como atleta em dúvida sobre a ativação muscular, quero poder alternar com 1 toque para a visualização dos músculos alvo e sinergistas, para que eu compreenda o foco da contração.
3. Como usuário navegando pelo Catálogo de Exercícios, quero que ao tocar em um exercício ele expanda e recolha suavemente com animação fluida de altura e chevron rotacionando, para que a experiência pareça nativa, polida e agradável.
4. Como usuário com preferências de redução de movimento ativadas no sistema operacional (`prefers-reduced-motion`), quero que as transições ocorram de maneira discreta e acessível, sem animações bruscas que causem desconforto.
5. Como usuário que toca no card de mídia do exercício ativo, quero que se abra um Bottom Sheet com o GIF ampliado, dicas de execução e a anatomia completa, para aprofundar minha compreensão da técnica.

## Implementation Decisions

1. **CSS Grid Accordion & Chevron Physics**:
   - Usar `display: grid; grid-template-rows: 0fr -> 1fr;` em `.accordion-collapse` e `.accordion-collapse.expanded`.
   - Transição com timing de 220ms e curva de aceleração cúbica natural da Apple (`cubic-bezier(0.25, 1, 0.5, 1)`).
   - Ícone de chevron animado via `transform: rotate(180deg)`.
2. **Priorização do GIF no Top Card do Treino (`MuscleFocusCard`)**:
   - Adicionar estado `activeMediaView: 'execution' | 'muscles'` inicializado em `'execution'` (prioridade).
   - Apresentar o GIF de demonstração em moldura ergonômica com proporção adaptada para mobile.
   - Manter fallback gracioso para exercícios que não possuam GIF, exibindo o mapa anatômico.
   - Bottom Sheet enriquecido com GIF + Instruções passo a passo + Mapa anatômico.
3. **Ergonomia e Design System**:
   - Manter compatibilidade com Tailwind v4 e variáveis de tema do Lifta (Dark/Light).
   - Suporte a toque com feedback tátil e active states responsivos.

## Testing Decisions

- Testar abertura e fechamento animado do accordion em `CatalogView.test.tsx`.
- Testar exibição do GIF como visual padrão prioritário em `workoutDeckAndSheet.test.tsx`.
- Testar alternância entre aba de Execução (GIF) e Músculos (Anatomia).
- Testar abertura do Bottom Sheet completo a partir do card ativo contendo GIF, instruções e anatomia.
- Verificação de UI QA via browser real para validação das animações ativas e ergonomia mobile.
