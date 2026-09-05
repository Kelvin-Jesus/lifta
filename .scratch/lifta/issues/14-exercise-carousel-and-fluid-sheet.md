# 14 - Exercise Carousel and Fluid Sheet

Type: task
Status: resolved
Blocked by: 13

## Goal

Implementar o carrossel horizontal de tela cheia (100dvh) com scroll snap suave por exercício, o Card de Foco Muscular ampliado com o mapa do `body-highlighter`, e o Bottom Sheet nativo do iOS com Grabber e física fluida de gestos (1:1 direct tracking, rubber-banding e flick to dismiss), suportando o fluxo de substituição ágil de aparelhos ocupados.

## Deliverables

1. **Carrossel Horizontal 100dvh**:
   - Container horizontal com CSS scroll snap obrigatório por exercício (`scroll-snap-type: x mandatory`).
   - Barra de progresso segmentada interativa no topo sincronizada com o scroll.
   - Banner de meta de sobrecarga progressiva comparativa com a última sessão.
2. **Card de Foco Muscular Anatômico**:
   - Card de tamanho generoso (~80×120px) exibindo a silhueta do exercício atual com o músculo mais treinado em destaque vibrante.
   - Pílulas com nível de ativação e relação de músculos sinergistas.
   - Toque no card abre o Bottom Sheet com visão anatômica detalhada frente/costas.
3. **Bottom Sheet Nativo com Gestos Fluidos do iOS**:
   - Grabber handle com alvo tátil confortável.
   - Controlador físico de gestos com Pointer Events e `setPointerCapture`:
     - Manipulação direta 1:1 acompanhando o dedo/cursor;
     - *Rubber-banding* elástico da Apple ao tentar puxar para cima além do topo;
     - *Flick to dismiss* baseado na velocidade de soltura (`velocityY > 0.42 px/ms`);
     - Desvanecimento gradual do backdrop scrim em tempo real;
     - Retorno em mola (*snap back*) ao soltar sem arrastar o suficiente.
4. **Fluxo de Substituição de Aparelho Ocupado**:
   - Botão `Substituir` no cabeçalho do exercício abrindo sheet pré-filtrado com alternativas do mesmo foco muscular.
   - Troca do movimento na sessão em andamento com 1 toque, preservando as séries e emitindo toast reversível.
