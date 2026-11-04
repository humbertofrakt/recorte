# PLANO painéis que cabem · 11/09/2026

Planejador → executor. Um lote, **65**, pequeno, só bolo. Entra depois do 63a, antes do 64.

## O que o Humberto disse, 11/09/2026, com a foto da aba Malha e pesos

> "Esses menus estão impossíveis de usar."

Foto: a coluna da direita com o painel **Malha e pesos** mais largo que ela. Texto cortado ("Forma de outra malha do me…"), a lista `01 (1) — …` saindo pela borda, barra de rolagem **horizontal** embaixo, e a seção **Malha ligada** (avançada) em cima de tudo, antes de Forma e Pesos.

## Regra

**Nenhum painel é mais largo que a coluna. Nunca há rolagem de lado num painel.** Texto quebra linha; nome comprido corta com reticências e aparece inteiro na dica; lista e campo têm `max-width: 100%`; linha de botões quebra em duas quando não cabe.

## Lote 65

| O que | Como |
|:---|:---|
| CSS da coluna da direita e dos painéis (`panels.css`, `mesh-panel.css`, `view-panel.css`, `preview.css`, `shell.css`) | `min-width: 0` em todo filho de flex/grid da coluna; `overflow-x: hidden` no corpo do painel; `overflow-wrap: anywhere` em parágrafo e rótulo; `select`, `input` e botão com `max-width: 100%`; linhas de botões com `flex-wrap: wrap` |
| Aba **Malha e pesos**, ordem das seções | 1 **Desenho escolhido** · 2 **Forma** (Virar malha · Gerar automática · Traçar contorno) · 3 **Ossos que influenciam** (com a frase do P) · 4 **Pesos** (automáticos · Suavizar · os outros) · 5 **Pincel** · 6 **Avançado: Malha ligada**, **dobrada** por padrão, no fim. O texto longo da malha ligada vira uma frase curta e o resto vai para a dica |
| Toda aba da coluna da direita | a mesma conferência: Propriedades, Animações, Peles, Regras, Histórico, Imagens, Exibição, Prévia |
| Medição (como a rodada 3 fez, Chrome headless) | em **1440×900** e **1280×720**, com `heroi.bone` aberto e a malha `cape` escolhida, para cada painel: `scrollWidth <= clientWidth`. Foto de cada aba no INDICE |

| Teste | Esperado |
|:---|:---|
| `meshPanelSections()` pura (a ordem das seções) | `['desenho', 'forma', 'ossos', 'pesos', 'pincel', 'ligada']`; `ligada.collapsed === true` |
| rótulo com 40 caracteres em `labelFor` | texto cortado com `…` e o inteiro em `title` |
| medição headless, 8 abas × 2 tamanhos | 16 medições, zero com rolagem horizontal; o resultado vai para Desvios |

**Pronto quando:** nenhuma aba da direita tem barra de rolagem de lado, em nenhum dos dois tamanhos, e a aba Malha e pesos começa por Forma.

## Ordem de trabalho

Backup antes; INDICE; contagem não cai; `tsc`; `conformidade.mjs`; CHANGELOG; `versao.py`; remontar o programa/ e avisar. Manual pausado.

## Desvios

### Lote 65 — v10.1

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| Medir com "a malha `cape` escolhida" | No herói, a capa são duas imagens inteiras (`region`); a única malha é a `face`, no slot `head` | Medido com a `face` escolhida |
| "Toda aba da coluna da direita" (8) | As colunas têm 11 abas: Árvore, Ordem e Propriedades moram na esquerda; Malha e pesos na direita | Medidas as 11, nas duas colunas, nos dois tamanhos: 22 medições |
| A base, antes do conserto | Em 1440×900 só a Malha e pesos transbordava: o corpo rolava de lado (278 px em 258), pelos dois campos da linha do pincel (Raio e Força), 19 px além da coluna. Em 1280×720 as 11 cabiam | A linha do pincel quebra em duas e a régua encolhe. As regras gerais do plano entram só dentro das colunas: a linha do tempo, embaixo, rola de lado de propósito |
| Depois do conserto | — | **22 de 22 medições sem nada passando da coluna.** Console limpo. Fotos das 22 em `backup/fotos-lote65_2026-09-11/` |
| Texto cortado e a lista `01 (1) — …` saindo pela borda (a foto) | O herói não tem nomes compridos, então a medição não reproduz esse caso | Nome comprido na lista da malha ligada corta com reticências (`labelFor`), inteiro na dica; nome de osso corta pelo CSS, inteiro na dica; lista, campo e botão com `max-width: 100%` |
| "O texto longo da malha ligada vira uma frase curta" | — | *Empresta a forma de outra malha do mesmo slot.* A explicação inteira fica na dica do título |
| "Forma (Virar malha · Gerar automática · Traçar contorno)" | Com imagem inteira não há malha, e a Forma de sempre não aparece | Imagem inteira ganha uma seção Forma só com o Virar malha; malha ganha a Forma de sempre |
| `meshPanelSections()` pura | — | Módulo `mesh-panel-model.ts`; o painel desenha nessa ordem. A malha ligada é um `<details>` que lembra se ficou aberta enquanto o painel é refeito |
| A medição "como a rodada 3 fez" | O molde da rodada 3 media altura, não largura | `medir-paineis.mjs`, no molde do roteiro, com porta própria (5192) |
