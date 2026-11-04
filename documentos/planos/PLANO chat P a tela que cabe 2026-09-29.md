# Plano — chat P, a tela que cabe — 29/09/2026

Chat P (`EXECUTANDO · a tela que cabe`, ref `b143ea`). Reporta ao `PLANEJADOR · 9f75b5`.
Escrito às 05:05 (relógio da máquina), com a casa **fechada**: só leitura do código.
Referência: `documentos/pesquisa/nova pesquisa/REFERENCIA a tela que cabe 2026-09-29.md`.

**Tudo abaixo é leitura do código. Nada foi medido na tela ainda.**
O primeiro passo de cada lote é **ver o defeito acontecer** (regra 26).

---

## Lote 2 — os que PULAM

### 2a · O rodapé (J4, F5, L14)

| | |
|:---|:---|
| **Causa lida** | `.shell` tem `grid-template-columns: 1fr`. `1fr` tem mínimo *auto*: a coluna cresce com o conteúdo. `.status-tool` é filho de flex **sem** `min-width: 0`, com `nowrap`. Frase longa → a coluna da grade alarga → a coluna da direita é espremida |
| **L14 (duas linhas)** | `.status-state` e `.status-mode span` **quebram linha**. Frase longa neles → o rodapé cresce → a tela sobe |
| **Conserto (meu, `ui/shell.css`)** | `.shell` → `minmax(0, 1fr)` · `.status-bar` com altura fixa e `overflow: hidden` · todo filho numa linha, `min-width: 0`, reticências · o botão de avisos nunca encolhe |
| **A dica (da casca)** | `title` com a frase inteira em `div.status-tool` (`shell.ts:2451`) e `div.status-state` |
| **Prova** | foto antes e depois, Criar osso na mão, 1440×900 e 1280×720 · medir a largura da coluna da direita com e sem a frase · um teste lê o CSS e confere as regras |

### 2b · A cena encolhe com Detalhes (K13)

| | |
|:---|:---|
| **Causa lida** | a faixa aberta nasce com 380 px (`dock-model.ts`). O chão da cena (`STAGE_MIN = 260`) mora em `shell.ts`, da casca, e mede só a barra da cena — **medir** se a barra de ações e o resto entram na conta |
| **Conserto (meu)** | CSS: a cena com `min-height`; a faixa com `flex-shrink`, rolando por dentro. Se precisar de número: `dock-model.ts` ganha a conta pura do chão |
| **Se o CSS não bastar** | a casca muda `fitToWindow`. Peço pelo Planejador |

---

## Lote 3 — os que NÃO CABEM

### 3a · A barra de ações em 1280×720 (L16, I-O3)

| | |
|:---|:---|
| **Hoje** | `.viewport-toolbar` **rola de lado** (`overflow-x: auto`, barra de 6 px). "Travar desenhos" sai cortado |
| **Referência** | Spine esconde a palavra; a barra Qt põe o que sobra num botão no fim |
| **O que faço (meu)** | conta pura em `ui/action-bar-model.ts`: dadas as larguras e o espaço, **quem vai para o "Mais ▾"**. De trás para frente. **Nunca** entram: a ferramenta escolhida e Partículas (P38). Teste em `colunas-e-barra` |
| **Fronteira** | o DOM da barra é `viewport/viewport-toolbar.ts` e `viewport.css`, do **chat B**. Ou o B liga a conta, ou autoriza eu acrescentar a função de desenho. **Pergunta ao Planejador** |

### 3b · A lista de animações e a alça (K1b, M16)

| | |
|:---|:---|
| **Hoje** | `.panel-group { min-height: 90px }`, `GROUP_MIN_PX = 80`. A alça `.panel-split-grip` tem 8 px lisos: **não parece alça** |
| **O que faço** | a alça ganha **marca à vista** (os três traços do meio), cursor e dica · o grupo tem chão de algumas linhas úteis, não 80 px |
| **M16** | Imagens e Peles no mesmo lado, grupos diferentes: com a alça à vista e o chão, as duas cabem. Confirmar com foto |

---

## Lote 4 — o arranjo de fábrica (P33)

| O quê | Onde | Como |
|:---|:---|:---|
| Malha e pesos vai para o grupo 1 da direita, com Imagens e Pivôs | `ui/layout-model.ts`, `RIGHT_GROUPS` | tirar `malha` do grupo 2, pôr no grupo 1 |
| **Quem já arrumou não muda** | `shell.ts:799` lê a bancada da máquina (`RECORTE_bancada`); `parseColumnState` guarda os grupos gravados | já é assim. **Provo com teste**: bancada gravada com a malha no grupo 2 → continua no grupo 2 |
| Só muda quem nunca arrumou e o "Voltar ao padrão" | `defaultLayout` | teste: bancada vazia → grupo 1; `defaultLayout` → grupo 1 |
| Botão **Prévia** na barra de ações, em ícone, nome na dica | `ui/action-bar-model.ts` | `iconItem('previa', <ícone>, 'Prévia', null, …, 'painel-previa')`. A ação `painel-previa` já existe. O ícone: `ui/icons.ts` é de passagem — acrescento um, se preciso |
| O **arranjo "Pivô"** cita os grupos à mão | `ui/arrangements.ts` | conferir se a malha precisa entrar nele |

---

### Decisões do Planejador que mudam este plano

| # | Decisão |
|:---:|:---|
| P48 | o "Mais ▾" inteiro é meu: posso escrever em `viewport-toolbar.ts` (só a função dele e a chamada) e em `viewport.css` (só as regras da barra), **depois** do "fechei o lote 1" do chat B. Ordem dos lotes: **2 · 4 · 3** |
| P49 | `ordem.test.ts:363` continua `toEqual`, com a lista NOVA inteira, na ordem do menu Janela. E um teste irmão para o grupo 2, sem a malha. O número de altura da Malha, antes e depois, vai para os Desvios |

**As listas do lote 4**, pela ordem do menu Janela (`A ORDEM DOS MENUS`, seção 6: Imagens · Entidades · Pivôs … Malha e pesos; Exibição · Prévia):

| Grupo | Lista |
|:---:|:---|
| 1 | `imagens` · `entidades` · `pivos` · `malha` · `exibicao` · `previa` |
| 2 | `animacoes` · `peles` · `regras` · `historico` |

**Risco a medir:** seis abas numa tira de 260 px quebram em mais linhas, e cada linha custa ~33 px ao painel.

## Suposições (enquanto o Planejador não responde)

| # | Suposição |
|:---:|:---|
| S1 | O "Mais ▾" é desenhado pelo chat B. Eu entrego a conta e o teste |
| S2 | K13 se resolve em CSS, sem tocar `shell.ts` |
| S3 | A frase inteira do rodapé vai no `title`, posto pela casca |

## Desvios

| # | O desvio | Por quê |
|:---:|:---|:---|
| 1 | **O chão da cena é 55% (P56).** Em 1280×720 com Detalhes, a faixa de baixo cai de **318** para **226 px**: tocador, botões, régua e Resumo à vista; as linhas por osso só rolando | a preferência do Humberto é cena grande; a faixa é lista, e rola |
| 2 | **Erro meu de prova, pela forma:** *a cena de foto abriu a animação pelo índice, e não pelo nome*. As duas fotos "antes-detalhes" mostravam "Animação: 0" | refeitas do `programa/` v23.1 com a `walk` pelo nome; as falsas em `lote2/descartadas/`, com o porquê |
| 3 | **Erro meu, pela forma:** *escrevi um conserto local sem procurar a regra da casa*. Pus `.viewport-toolbar [hidden]` em `viewport.css`; a regra única do escondido mora em `ui/shell.css` desde o lote 38, e o `paineis.test.ts` (linha 807) acusou. Achado pelo chat B | tirado na mesma volta; o "Mais ▾" usa só o atributo `hidden` |
| 4 | **A ordem de saída do "Mais ▾" não é só "de trás para a frente".** Saem primeiro Recortar, Copiar, Colar, Apagar e Imagem de referência; os quatro de texto (Ver/Travar) por último | na primeira medida, "Travar ossos", "Ver desenhos" e "Travar desenhos" sumiam em 1440×900: eram o pedido do Humberto com a tela do Spriter aberta. Mesmo assim, "Travar desenhos" ainda sai em 1440, e "Ver desenhos" também sai em 1280 |
| 5 | **O vite do chat P roda sem recarga** (`server.hmr: false`, configuração no scratchpad) | com dez chats gravando, a página recarregava no meio da foto. O chat C chegou na mesma saída (`vite-quieto.mjs`) |
| 6 | **O lote 3a veio antes do lote 4** (ordem do Planejador) | a palavra da ferramenta (P38) faria a barra rolar também em 1440 |
