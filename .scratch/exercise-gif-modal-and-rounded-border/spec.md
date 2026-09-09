# Spec: Bordas Arredondadas no GIF de Execução e Modal de Expansão/Zoom

Status: ready-for-agent

## Problem Statement
No fluxo ativo de treino (`WorkoutDeck`, `MuscleFocusCard` e `ExerciseCard`), o usuário identificou duas falhas de usabilidade e acabamento visual:
1. **Falta de borda arredondada no GIF**: O GIF de execução do exercício está sendo renderizado com cantos retos ou inconsistentes com o padrão visual do sistema (`rounded-2xl` com `overflow-hidden`), gerando descontinuidade visual em relação ao resto da aplicação.
2. **Incapacidade de expandir o GIF**: O usuário não consegue ampliar ou expandir o GIF de demonstração de execução para visualizar a técnica do movimento em maior detalhe e alta resolução durante o treino.

## Solution
1. **Padronização das Bordas Arredondadas (`rounded-2xl`)**:
   - Em `MuscleFocusCard.tsx` e `ExerciseCard.tsx`, garantir que tanto os contêineres de mídia quanto as imagens de GIF possuam bordas arredondadas harmônicas do sistema (`rounded-2xl`, `overflow-hidden`, moldura elegante com `border-theme-subtle` e fundo sutil).
   - Eliminar qualquer recorte abrupto em imagens com aspect-ratio variado através de enquadramento limpo (`rounded-xl` interno com `object-contain`).
2. **Modal de Expansão / Lightbox do GIF de Execução (`ExerciseGifModal.tsx`)**:
   - Criar um componente modal de expansão em alta fidelidade (`ExerciseGifModal`):
     - Exibição ampliada e em destaque do GIF em loop de execução técnica (`max-h-[65vh]`, cantos `rounded-2xl`).
     - Fundo imersivo com `bg-black/80 backdrop-blur-md` e fechamento intuitivo via clique fora (backdrop), botão fechar (`✕`) e tecla `Escape`.
     - Metadados do exercício: título, grupo muscular e instruções técnicas de postura em formato legível.
   - Adicionar sinalizador visual tátil no card de treino:
     - Badge/botão "Ampliar" com ícone de expansão sobre o GIF.
     - Toque no GIF ou no botão de ampliação abre diretamente a visualização expandida.
     - Suporte a feedback tátil (`triggerHaptic('light')`).

## User Stories
1. Como atleta durante o treino, quero tocar no GIF de execução para vê-lo em tamanho grande e detalhes nítidos, facilitando a verificação da postura correta.
2. Como usuário, quero que os cantos do GIF acompanhem o padrão de design arredondado do restante do app (`rounded-2xl`), mantendo a harmonia visual.
3. Como usuário em dispositivo móvel, quero fechar facilmente o modal tocando fora ou no botão fechar.
