# Task 01: Implementar Bordas Arredondadas no GIF e Modal de Expansão

Status: resolved

## Contexto e Escopo
1. Criar componente `ExerciseGifModal.tsx` em `src/features/workout/ExerciseGifModal.tsx` com visual Apple Design, cantos `rounded-2xl` / `rounded-3xl`, GIF ampliado com looping, instruções técnicas, tecla ESC e clique fora.
2. Atualizar `MuscleFocusCard.tsx` para garantir cantos `rounded-2xl`, botão/badge de "Ampliar" e abertura do `ExerciseGifModal` ao clicar no GIF de execução.
3. Atualizar `ExerciseCard.tsx` com `rounded-2xl` e clique para expandir no `ExerciseGifModal`.
4. Criar testes de regressão cobrindo o modal de expansão, cantos arredondados, abertura/fechamento e tecla Escape.

## Answer
- Criado o componente `ExerciseGifModal.tsx` com acabamento Apple Design (`rounded-3xl`, backdrop blur com `bg-black/85`, GIF com `rounded-2xl`, indicator em loop e instruções de postura).
- Atualizado `MuscleFocusCard.tsx` com `rounded-2xl` no container da thumbnail e `rounded-xl` na imagem, além do badge tátil "Ampliar" e trigger de abertura do modal em 1 toque.
- Atualizado `ExerciseCard.tsx` com moldura `rounded-2xl` no preview e gatilho de abertura do modal ampliado.
- Criada a suíte de testes de regressão `src/features/workout/__tests__/exerciseGifModalAndRoundedRegression.test.tsx` com 4 testes validando classes de borda, abertura do modal, fechamento por botão/ESC/backdrop e expansão no `ExerciseCard`.

