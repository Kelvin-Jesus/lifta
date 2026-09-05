# 05 - Prototype Workout Flow

Type: prototype
Status: resolved
Blocked by: 04

## Question

Criar e comparar abordagens de interface descartáveis para a tela de treino ativo (inspiradas em componentes do OpenSourceUI), avaliando velocidade de registro, quantidade de toques, legibilidade e densidade de informação?

## Answer

Protótipo reconstruído e aprovado com foco estrito em **design de utilitário nativo de iPhone (iOS Native Utility)** em [`.scratch/lifta/prototypes/workout-flow.html`](../prototypes/workout-flow.html):

1. **Eliminação completa de padrões "vibecoded" / AI-generated**:
   - Zero gradientes decorativos ou texto em gradiente.
   - Zero glassmorphism gratuito, sombras estouradas ou cantos arredondados excessivos.
   - Zero emojis como ícones de interface; uso exclusivo de vetores monocromáticos com traço limpo de 2px.
   - Uma única cor de destaque sóbria (Apple Blue `#0a84ff`) e verde semântico apenas para conclusão de série (`#30d158`).

2. **Estrutura Agrupada Estilo iOS (Inset Grouped Layout)**:
   - Cada exercício ocupa a tela inteira em um carrossel horizontal de snap suave.
   - Linhas de série estruturadas em tabela nativa (Série, Carga, Reps, Status) com separadores sutis de 0.5px.
   - Metas de sobrecarga exibidas de forma discreta e informativa, sem caixas chamativas.

3. **Ergonomia e Micro-interações Táteis (Apple Design & Emil Kowalski)**:
   - Alvos de toque com mínimo de 44×44px para botões de check e steppers de carga/reps.
   - Feedback visual imediato ao toque (`:active { transform: scale(0.92-0.98) }`) com curvas de aceleração do sistema (`cubic-bezier(0.25, 1, 0.5, 1)`).
   - Botão de ação primário ("Concluir Série") ancorado na base acessível ao polegar.
   - Rest timer no formato de barra dinâmica discreta na base com atalhos de `+30s` e `Pular`.
   - Suporte completo a `prefers-reduced-motion` e números tabulares (`tabular-nums`).
