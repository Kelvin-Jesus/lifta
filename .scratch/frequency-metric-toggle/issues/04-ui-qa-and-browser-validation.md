# 04: Validação de UI e QA no Navegador Real

**What to build:**
Executar validação interativa e adversária no navegador real através do subagente de browser/UI QA, verificando responsividade em viewports mobile (iPhone SE e iPhone 14/16), ergonomia de toque, micro-animações, estados de hover/press e transição suave entre métricas.

**Blocked by:** 03: Botão de Alternância no Cabeçalho do Dashboard e Persistência

**Status:** resolved

- [x] Inspecionar visualmente o cabeçalho do dashboard com o servidor de desenvolvimento rodando.
- [x] Testar clique rápido e alternância repetida entre `kcal` e `kg`.
- [x] Verificar ausência de overflow ou quebras de linha indesejadas em telas estreitas (360px - 390px).
- [x] Confirmar que o gradiente de cores do heatmap e a legenda mudam corretamente.
- [x] Confirmar que ao recarregar a página, a métrica selecionada permanece ativa.
