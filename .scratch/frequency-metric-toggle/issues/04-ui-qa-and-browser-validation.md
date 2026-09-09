# 04: Validação de UI e QA no Navegador Real

**What to build:**
Executar validação interativa e adversária no navegador real através do subagente de browser/UI QA, verificando responsividade em viewports mobile (iPhone SE e iPhone 14/16), ergonomia de toque, micro-animações, estados de hover/press e transição suave entre métricas.

**Blocked by:** 03: Botão de Alternância no Cabeçalho do Dashboard e Persistência

**Status:** claimed

- [ ] Inspecionar visualmente o cabeçalho do dashboard com o servidor de desenvolvimento rodando.
- [ ] Testar clique rápido e alternância repetida entre `kcal` e `kg`.
- [ ] Verificar ausência de overflow ou quebras de linha indesejadas em telas estreitas (360px - 390px).
- [ ] Confirmar que o gradiente de cores do heatmap e a legenda mudam corretamente.
- [ ] Confirmar que ao recarregar a página, a métrica selecionada permanece ativa.
