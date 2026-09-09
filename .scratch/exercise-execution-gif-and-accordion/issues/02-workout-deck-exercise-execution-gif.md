# Issue 02: GIF de Demonstração de Execução Prioritário na Tela Ativa do Exercício

Status: done
Blocked by: none

## Context

Na tela ativa de execução de treino (`WorkoutDeck`), o card superior (`MuscleFocusCard`) atualmente exibe apenas a silhueta anatômica com os músculos ativados. O usuário solicitou que o GIF com a execução correta do movimento esteja presente na tela ativa como prioridade máxima em relação à tela anatômica das partes do corpo.

## Scope & Implementation Details

1. Atualizar o componente `MuscleFocusCard.tsx` (ou renomear/adaptar para card de mídia e anatomia do exercício) para carregar o GIF de demonstração como visual padrão prioritário.
2. Criar um controle ergonômico com alternância imediata entre:
   - `Execução` (GIF de demonstração, ativado por padrão)
   - `Músculos` (Silhueta anatômica `BodyHighlighter`)
3. Adicionar moldura com estilo premium, cantos arredondados, fundo elevado, indicador de movimento (`• Demonstração do Movimento`) e badge do equipamento.
4. Manter fallback visual elegante para exercícios sem GIF.
5. Escrever testes unitários em `workoutDeckAndSheet.test.tsx` validando o carregamento prioritário do GIF e alternância de modos.
