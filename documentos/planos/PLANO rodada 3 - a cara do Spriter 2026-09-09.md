# Plano da rodada 3 — a cara do Spriter

Escrito em 09/09/2026 pelo planejador, a pedido do Humberto:
**"planeje mudanças para deixar nosso programa parecido com o Spriter"**.

O pedido veio com a tela do Spriter Pro aberta no boneco dele, e com três
observações, nas palavras dele:

1. **"Observe que não temos isso"**: os quatro botões `Show Bones · Lock Bones · Show Sprites · Lock Sprites`, em texto, acesos em laranja.
2. **"Nossos menus são muito bagunçados e não temos coisas básicas que o Spriter tem."**
3. **"O Spriter é limpo e claro. Ele usa as laterais, por isso a cena é muito mais espaçosa. A linha do tempo mostra só a linha principal, e só mostra os detalhes quando você clica para mostrar os detalhes."**

Este plano compara a tela dele com o Recorte de hoje (v3.5) e diz, lote a
lote, o que muda. A ordem dos lotes é a ordem das reclamações: primeiro a
linha do tempo, depois as laterais, depois os quatro botões.

O planejador não escreve código. O executor executa, um lote por versão.

---

## Medido: onde vai a altura da tela hoje

Recorte em 1912×860, `heroi.bone`, tela que o Humberto mandou:

| Faixa | Altura | Fração |
|:---|:---:|:---:|
| Menu | 44 px | 5% |
| Barra de ferramentas | 70 px | 8% |
| **Cena** | **370 px** | **43%** |
| Faixa de baixo (abas, tocador, botões em bloco, régua, Resumo) | 300 px | 35% |
| Rodapé | 60 px | 7% |

No Spriter, na mesma janela, a cena leva **78%** e a linha do tempo **11%**.
A meta desta rodada: **cena ≥ 70%** com a faixa de baixo fechada.

---

## O que a tela do Spriter mostra, e o que o Recorte tem hoje

| Região | Spriter | Recorte hoje (v3.5) | O que fazer | Lote |
|:---|:---|:---|:---|:---:|
| Linha do tempo | **uma linha**: tocador, régua, chaves. Puxa para cima para abrir uma linha por objeto | 5 linhas: abas, tocador com 4 listas, 8 botões em bloco, régua, Resumo | fechada por padrão; **Detalhes** abre | 14 |
| Tocador | barra de velocidade com número, tempo atual / duração para digitar, **Key selected · Key all** | lista de velocidades; tempo só na régua; Chavear só por tecla | barra, dois campos, dois botões | 15 |
| Colunas | esquerda: Z-order / Hierarchy + Object Properties. Direita: Palette + Animations | só à direita; a cena espremida entre a coluna e a faixa de baixo | duas colunas laterais | 16 |
| Linha abaixo do menu | ícones: desfazer, refazer, recortar, copiar, colar, apagar, novo, abrir, salvar. Depois **Show/Lock Bones, Show/Lock Sprites** em texto laranja | só ferramentas e dois cadeados em ícone | uma barra só; os quatro em texto, laranja quando ligados | 17 |
| Cores | painel cinza escuro, cena cinza claro, ligado em laranja | branco e azul | tema escuro, padrão | 18 |
| Cabeçalho dos painéis | uma linha de ícones pequenos | Árvore: 8 botões de texto em 3 linhas; Animações: 5 botões de texto em 2 linhas | ícones, uma linha, **Novo ▾** | 19 |
| Menus | 6 menus curtos | 7 menus, itens sem ordem clara | auditoria: agrupar, ordenar, tirar repetido | 19 |
| Histórico | aba **History** ao lado de Animations | não tem | aba Histórico | 19 |
| Ordem de desenho | lista só de imagens, miniatura grande, arrasta | seção dentro da Árvore, miniatura de 24 px | aba **Ordem** ao lado de Hierarquia | 16 |
| Paleta de imagens | as imagens do projeto, miniatura; arrastar para a cena cria um sprite | não existe | painel **Imagens** | 20 |
| Cena | réguas com números em cima e à esquerda | grade e eixos coloridos | réguas | 21 |
| Propriedades | x · y · escala x · escala y · **ângulo com disco** · **alfa com barra** | campos de digitar, na ordem do formato | ficha rápida em cima | 22 |

### Defeitos vistos na tela dele, para o lote 19 fechar

| O que aparece | Onde |
|:---|:---|
| Texto "imagem. Escolha um slot ou um desenho primeiro." dentro da aba **Animações** | é o aviso do painel Malha vazando para outra aba |
| Seção "MOSTRAR NA TELA" embaixo dos botões de Animações | é o painel Exibição vazando para a aba Animações |
| Cabeçalho da Árvore cortado ("— o … 18") | a linha de título dos Ossos fica escondida atrás dos 8 botões |

Os três dizem a mesma coisa: `panel-group-body` mostra mais de um `panel-body`
ao mesmo tempo. Um teste sem navegador confere que, num grupo, **só o painel
ativo está sem `hidden`**.

### O que **não** copiamos, e por quê

| Do Spriter | Por quê fica de fora |
|:---|:---|
| Menu **Modes**, entidade, "Alt + Click: create bone" na Palette | nosso arquivo é um esqueleto; criar osso já é ferramenta com tecla. Alt colide com Alt+arrastar nosso (rodada 2, itens 68, 69, 71) |
| Campo **pivô** da imagem | não é campo do formato. O mesmo efeito é a posição da imagem no osso (`pesquisa antiga/menu/06`, seção 4). Campo novo é decisão do Humberto (regra 7) |
| **Char Maps** | já existe: são as **peles** |
| Régua do tempo em **milissegundos** | o formato grava segundos (§9). Continua `s` e quadro. Ver "Decisões" |
| Botão × em cada painel | fechar painel sem lugar para reabrir é criticado no próprio Spriter. Nossos painéis são abas, e Janela → Voltar ao padrão traz tudo |

---

## Resumo em uma tabela

| Lote | Versão | O que entra | Arquivos novos | Teste |
|:---:|:---:|:---|:---|:---|
| 14 | v3.6 | linha do tempo fechada por padrão; **Detalhes** abre | `panels/dock-model.ts` | `lote14-linha-limpa.test.ts` |
| 15 | v3.7 | tocador: barra de velocidade, campos de tempo, Chavear na linha | — | `lote15-tocador.test.ts` |
| 16 | v3.8 | duas colunas laterais; aba Ordem com miniatura de 40 px | `ui/layout-model.ts`, `panels/draw-order.ts` | `lote16-duas-colunas.test.ts` |
| 17 | v3.9 | barra de ações numa linha; Ver e Travar em texto laranja | `ui/action-bar-model.ts` | `lote17-barra.test.ts` |
| 18 | v4.0 | tema escuro, padrão; Exibir → Tema | `ui/theme.ts` | `lote18-tema.test.ts` |
| 19 | v4.1 | painéis limpos: Novo ▾, ícones, Histórico; menus auditados; os 3 defeitos | `panels/history-model.ts`, `panels/history.ts`, `ui/menu-audit.ts` | `lote19-paineis-limpos.test.ts` |
| 20 | v4.2 | painel Imagens; arrastar para a cena cria o slot | `panels/palette-model.ts`, `panels/palette.ts` | `lote20-imagens.test.ts` |
| 21 | v4.3 | réguas na cena | `viewport/rulers.ts` | `lote21-reguas.test.ts` |
| 22 | v4.4 | ficha rápida: seis campos, disco e barra | `panels/quick-model.ts` | `lote22-ficha-rapida.test.ts` |

Os números de versão são os **próximos livres hoje**. O lote de runtime do
socket também está na fila (`ESTADO.md`). Quem chegar primeiro leva o número;
o outro pega o próximo livre no `INDICE.md`. O `versao.py` recusa repetido.

---

## Referência visual: os prints do Spriter

O Humberto, 09/09/2026: *"com uma imagem o programa se transformou da água pro vinho"*. A tela dele
do Spriter guiou esta rodada. Há **139 prints** do Spriter em
`documentos/pesquisa/nova pesquisa/spriter/prints/`, um por função, e o manual em PDF na mesma pasta.
**Antes de desenhar um painel ou uma janela, o executor abre o print correspondente** e copia a
disposição: onde fica o botão, o que está escrito, o que está escondido. Anota em Desvios qual print usou.

### Prints escolhidos, lote a lote

Olhados um a um pelo planejador em 09/09. Caminhos a partir de `documentos/pesquisa/nova pesquisa/`.
Os prints do Spriter são recortes do manual, pequenos; os do Spine e do DragonBones mostram o painel inteiro.
A tela cheia do Spriter que guiou a rodada está gravada: `spriter/prints/00-tela-do-humberto.png`.

| Lote | Print | O que copiar dele |
|:---:|:---|:---|
| **todos** | `spriter/prints/00-tela-do-humberto.png` | **a tela cheia do Spriter que o Humberto mandou e que guiou a rodada.** Vale mais que os 139 recortes juntos: duas colunas, barra numa linha, os quatro botões laranja, a linha do tempo numa faixa. Abrir antes de qualquer lote |
| 26 | `spine/prints/tools_toolbar.png` | a ordem **Rotate · Translate · Scale · Shear**, um ícone por ferramenta, Shear como paralelogramo. Scale é um quadrado com seta na diagonal: o nosso vai ser o L de duas setas que o Humberto desenhou, mas o tamanho e o traço são estes |
| 27, Peles | `spriter/prints/21-criar-character-map_239.jpg` | o botão **Char Maps** na paleta de Animações: é o lugar onde a pele mora no Spriter, um botão à vista |
| 27, Peles | `spriter/prints/22-empilhar-character-maps_244.jpg` | a janela com duas colunas, **Active** e **Available**, arrastar para aplicar, duplo clique para editar. A frase de ajuda no topo da janela é o modelo da nossa frase de uma linha |
| 27, Peles | `spine/prints/skins_properties.png` | os dois botões **New…** e **Add to Skin**, e a caixa Export |
| 27, Regras | `spine/prints/constraints_tree.png` | a lista de regras: **ícone colorido por tipo** e nome. É a aba Regras |
| 27, Regras | `spine/prints/ik_properties1.png` | a janela de IK: **Parent · Child · Target**, opções Compress · Stretch · Uniform, **Mix como barra**. É exatamente a janela guiada: pai, filho, alvo, três caixas, uma barra |
| 27, Regras | `spine/prints/transform_properties.png`, `path-constraint_properties.png` | as janelas dos outros dois tipos com cadeia |
| 27, Regras | `dragonbones/prints/advancedFeatures_IK_56d6a71568f12.png` | a regra **desenhada na cena**: a cadeia em laranja e o alvo no pé. É como a nossa alça deve aparecer |
| 28 | `spine/prints/tree_tree-view.png` | a Árvore do Spine: **Constraints · Draw Order · Skins · Events · Animations · Images · Audio**, cada seção com ícone. Nada escondido: tudo tem seção |
| 28 | `spine/prints/playback_playback-view.png`, `dopesheet_dopesheet.png` | o tocador e a folha de chaves do Spine, com os botões de laço e marcas à vista |
| 28 | `spriter/prints/12-linha-do-tempo-avancada_216.jpg` | a faixa aberta do Spriter: tocador à esquerda, **barra de velocidade com o número**, uma linha por objeto |
| 28 | `spriter/prints/15-key-all-vs-key-selected_227.jpg` | **key selected · key all** como dois botões de texto, o ligado em laranja |
| todos | `dragonbones/prints/interface_mainInterface_p1.png` | a tela inteira do DragonBones com as sete regiões numeradas: cena, barra, ferramentas, modos, ver e travar, árvore, linha do tempo. Serve para conferir se a nossa arrumação bate |

## Regras que valem para os nove lotes

1. **Backup antes.** `backup/editor-src_2026-MM-DD_antes-do-lote-N/` a pasta inteira. Linha no `INDICE.md`.
2. **Decisão em módulo puro, DOM só desenha.** Cada lote tem um `*-model.ts` sem `document`. O teste roda sem navegador.
3. **A contagem de testes nunca cai.** Hoje: 1.732. Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs`.
4. **Nenhum campo novo no formato.** O que é só do editor vai em `RECORTE_prefs` ou em `RECORTE_editor_state`.
5. **Menu e botão chamam a mesma função** de `ui/actions.ts`. Nunca uma cópia.
6. **Tecla tratada uma vez.** Botão sempre com nome na dica e no `aria-label`.
7. **Manual nas duas línguas** (`documentos/manual/01-comecar.md` e `en/01-getting-started.md`) **e `CHANGELOG`** no mesmo lote. Imagem nova em `manual/imagens/`, tirada do editor rodando.
8. **Ícones são desenhos nossos** em `ui/icons.ts`, 24×24, `currentColor`. Nada de CDN (desvio 1 do lote 4).
9. **Nada some.** O que sai da vista vai para um ⋯, um menu ou um "Detalhes". Todo item continua no menu com a tecla escrita ao lado.
10. Item que não bater com o código: parar, escrever em **Desvios** no fim deste arquivo, seguir.
11. Depois de cada lote: uma mensagem curta ao Humberto. O que entrou, quantos testes, o que ficou.
12. **A faixa de baixo só abre por três gestos do Humberto:** clicar em Detalhes, puxar a alça até a altura mínima de aberta, ou escolher Curvas no menu Janela. **Nunca** na partida, nunca ao trocar de modo, nunca ao escolher animação, nunca por ferramenta ou por tecla que não seja a de Detalhes. Pedido dele, 09/09/2026: "se ela está fechada, não devia abrir do nada".
13. **Todo botão novo de barra, cabeçalho ou aba nasce em ícone**, com o nome por extenso na dica e no `aria-label`. Item de menu suspenso continua em palavra. Regra do Humberto ao executor, 09/09/2026: "cuidar dos menus para que fiquem agradáveis e eficientes como fizemos com ícones, economizando espaço, mantendo o estilo". Vale para todo lote, sem ele pedir de novo.

---

## Lote 14 → v3.6 · Linha do tempo fechada por padrão

### O que muda na tela

A faixa de baixo nasce **fechada**, como a do Spriter. Fechada, ela tem
**três linhas** e nada mais:

| Linha | O que tem |
|:---|:---|
| 1 | o tocador (lote 15 arruma o conteúdo dele) |
| 2 | a régua, com o trecho de laço e as marcas como hoje |
| 3 | **Resumo**: uma chave por tempo, como hoje |

Um botão **Detalhes** na ponta direita da linha 1 (ícone de seta, dica
"Detalhes: uma linha por osso e desenho, e os botões em bloco") abre:

- as abas **Linha do tempo · Curvas · Prévia**, que hoje ficam sempre à vista;
- a linha dos oito botões em bloco (Apagar chave · Copiar · Colar · Esticar…);
- as linhas por alvo, com a hierarquia dobrável de hoje.

Arrastar a borda de cima da faixa também abre, como no Spriter ("puxar para
cima abre uma linha por objeto"). Fechar de novo: o mesmo botão, ou arrastar
para baixo até a altura mínima.

Aberta ou fechada, a **tecla** de cada botão em bloco continua funcionando e
o item continua no menu Animação. Regra 9.

### Como construir

- `panels/dock-model.ts` **novo**, puro. `DockState { open: boolean, height: number }`. `toggleDock`, `dockHeightFor(state, rows)`. Fechada: `height = CLOSED_HEIGHT` (3 linhas × altura da linha, medido e escrito como constante, ≈ 120 px). Aberta: a altura gravada, mínimo 240.
- `dockOpen` entra em `RECORTE_editor_state`, ao lado da coluna. Padrão `false`.
- `dopesheet.ts` já tem a hierarquia dobrável e o Resumo. Fechada, ele recebe `compact: true` e desenha só o Resumo. Nada de segundo componente.
- As abas Curvas e Prévia **só aparecem abertas**. Escolher Curvas com a faixa fechada (pelo menu Janela) abre a faixa.
- `dockGrip` de hoje continua sendo a alça. Abaixo de `CLOSED_HEIGHT + 40` ela fecha; acima abre.

### Testes — `lote14-linha-limpa.test.ts`

| Teste | Esperado |
|:---|:---|
| `parseEditorState({})` | `dockOpen: false` |
| `dockHeightFor({ open: false }, 30 linhas)` | `CLOSED_HEIGHT`, não importa quantas linhas |
| `dockHeightFor({ open: true, height: 100 })` | `240` (o mínimo) |
| `toggleDock` duas vezes | volta ao estado inicial, `height` preservada |
| dopesheet `compact: true` | linhas desenhadas = 1 (Resumo); nenhuma linha por alvo no modelo |
| botão Detalhes | `aria-expanded` acompanha `open`; dica contém "Detalhes" |
| conferência sem cabeça | em 1440×900 fechada, a cena tem **≥ 70%** da altura da janela. Escrever o número medido em Desvios |

### Manual

Capítulo 03, "A linha do tempo": começa pela faixa fechada, com a imagem.
Depois "Detalhes", com a imagem aberta. As imagens antigas da faixa saem.

### Pronto quando

Abrir o editor → três linhas embaixo, cena grande. Detalhes → tudo o que existe hoje. Fechar e abrir o navegador → lembra. Testes ≥ 1.739.

---

## Lote 15 → v3.7 · Tocador como o do Spriter

### O que muda na tela

A linha 1 da faixa fica assim, da esquerda para a direita:

| Transporte | Velocidade | Tempo | Chavear | Canto |
|:---|:---|:---|:---|:---|
| os 6 botões de hoje + repetir | **barra** de 10 a 200 e o número ao lado, `100` | `atual` **/** `duração`, os dois para digitar | **Chavear escolhidos (K)** · **Chavear tudo (Ctrl+K)** | Detalhes (lote 14) |

Saem da linha e vão para o **⋯ Mais** (que passa a existir também fechado, ao
lado de Detalhes): o modo de fim ("Como o arquivo diz…") e "Tirar trecho de
laço". Continuam no menu Animação.

Digitar em **atual** move a cabeça. Digitar em **duração** faz o que Animação
→ Duração faz hoje; a pergunta do lote 13 deixa de ser pergunta.

### Como construir

- Sem arquivo novo. `dopesheet-model.ts` ganha `speedFromSlider(v)` (10–200 → 0,1–2,0, dois decimais) e usa o `parseTime` que já existe.
- `buildSpeedControl` troca o `<select>` por `<input type="range">` + número. Os dois escrevem em `transport.setSpeed`.
- Os dois botões de Chavear chamam as **mesmas** ações de `K` e `Ctrl+K`. Em **Montagem** ficam cinza, com a dica dizendo por quê.
- `SPEED_OPTIONS` continua exportado (os testes do lote 2 o citam). Só sai do DOM.

### Testes — `lote15-tocador.test.ts`

| Teste | Esperado |
|:---|:---|
| `speedFromSlider(100)` | `1` |
| `speedFromSlider(25)` | `0.25` |
| `speedFromSlider(500)` | `2` |
| digitar `0,5` em atual, animação de 1 s | cabeça em `0.5` |
| digitar `2` em duração no `walk` | `animationDuration` = `2`; um passo de desfazer |
| Chavear escolhidos em Montagem | `disabled`; dica contém "Animando" |
| linha 1 fechada, 1440 px | todos os controles cabem: nenhum `scrollWidth > clientWidth` |

### Manual

Capítulo 03, "Tocar": a linha nova, com a imagem. A lista de velocidades sai do texto.

### Pronto quando

Barra a 50 toca na metade. Digitar 0,5 pula para lá. Chavear tudo pelo botão faz o mesmo que Ctrl+K. Testes ≥ 1.746.

---

## Lote 16 → v3.8 · Duas colunas laterais e a aba Ordem

### O que muda na tela

"Ele usa as laterais." A cena fica entre duas colunas, como no Spriter:

| Esquerda | Direita |
|:---|:---|
| **Hierarquia · Ordem** (grupo de cima) | **Imagens** (lote 20; até lá, **Exibição**) |
| **Propriedades** (grupo de baixo) | **Animações · Histórico · Malha** (Histórico no lote 19) |

A aba **Ordem** é a seção "Slots (ordem de desenho)" de hoje, sozinha, lista
plana, **miniatura de 40 px**, um slot por linha, o nome do desenho atual ao
lado. Arrastar reordena. Ctrl+↑ / Ctrl+↓ subem e descem um. Tudo pela mesma
`Command` de hoje, "Mudar a ordem de desenho".

`Tab` esconde as duas colunas e a faixa. **Janela → Voltar ao padrão** volta a
esta arrumação. Botão direito numa aba: **Mover para a outra coluna**.

### Como construir

- `ui/layout-model.ts` **novo**, puro. `LayoutState { left: ColumnState, right: ColumnState, widths: [number, number], hidden }`. `panel-groups.ts` continua sendo a lei de **uma** coluna; o novo só junta duas.
- Migração: o `RECORTE_editor_state` de hoje guarda **uma** coluna. `parseLayout(raw)`: formato antigo vira a **direita**; a esquerda nasce de fábrica. Nada se perde.
- `DEFAULT_GROUPS` vai para o layout: esquerda `[['arvore', 'ordem'], ['propriedades']]`, direita `[['imagens', 'exibicao'], ['animacoes', 'historico', 'malha']]`. Id de painel que ainda não existe é pulado sem estourar (é o que `parseColumn` já faz).
- `panels/draw-order.ts` **novo**: desenha a partir de `slotRows(file)` de `tree-model.ts`. Não copia a lógica da Árvore; chama.
- `THUMB_SIZE` já é parâmetro de `thumbnailFor`: a aba pede 40.
- Largura: 260 px cada, arrastável pela borda (irmão do `panel-split-grip`). Mínimo 180, máximo 480.

### Testes — `lote16-duas-colunas.test.ts`

| Teste | Esperado |
|:---|:---|
| `parseLayout(antigo)` com `groups: [['arvore','propriedades'],['animacoes']]` | `right.groups` igual ao antigo; `left` de fábrica |
| `parseLayout(undefined)` | os dois lados de fábrica; `hidden: false`; `widths: [260, 260]` |
| `moveToOtherColumn(layout, 'propriedades')` | some da esquerda, entra no **fim** do último grupo da direita, fica ativa lá |
| `draw-order` no `heroi.bone` | linhas = `file.slots.length`; a primeira é `file.slots[0].name` |
| Ctrl+↓ no primeiro slot | vira o segundo; um passo de desfazer; `Ctrl+Z` devolve |
| `parseLayout({ widths: [100, 900] })` | `[180, 480]` |
| conferência sem cabeça | com a faixa fechada, a cena tem ≥ 70% da altura **e** ≥ 60% da largura em 1440×900 |

### Manual

Capítulo 01, "As colunas": a imagem das duas colunas. Capítulo 02, "Ordem de desenho": aponta para a aba Ordem.

### Pronto quando

Abrir → Árvore à esquerda, Animações à direita, cena grande no meio. Arrastar um slot na aba Ordem muda a ordem na cena. Tab esconde, Tab traz. Testes ≥ 1.753.

---

## Lote 17 → v3.9 · Barra de ações e os quatro botões

### O que muda na tela

"Observe que não temos isso." A linha acima da cena vira **uma barra só**,
como a do Spriter, da esquerda para a direita:

| Grupo | Botões | Como | Já existe em |
|:---|:---|:---|:---|
| Arquivo | Novo · Abrir · Salvar | ícone | `actions.ts`, menu Arquivo |
| Editar | Desfazer · Refazer · Recortar · Copiar · Colar · Apagar | ícone | `actions.ts`, menu Editar |
| Ferramentas | as de hoje, ordem de hoje | ícone | `toolbar-model.ts` |
| Eixos | a lista de três palavras | como hoje | `toolbar-model.ts` |
| Ver e travar | **Ver ossos (7) · Travar ossos (8) · Ver desenhos (9) · Travar desenhos (0)** | **texto**, fundo **laranja** quando ligado, cinza quando não | as travas em `LOCK_ITEMS`; os "ver" no menu Exibir |

Os quatro são em texto de propósito: é assim no Spriter e é assim que ele os
reconhece. Os demais são ícone com dica; a palavra aparece com **Editar →
Preferências → mostrar nome**.

Separador fino entre grupos. Nada de segunda linha: janela estreita, a barra
rola de lado (`overflow-x: auto`). A cena não encolhe.

### O interruptor de modo — acrescentado em 09/09/2026, a pedido do Humberto

O Recorte já tem os dois modos, **Montagem** e **Animando**, desde a v0.6. Ninguém vê: uma frase no rodapé e um botão dentro do painel Animações. O Spine mostra um letreiro grande no canto da cena, `SETUP` / `ANIMATE`, e o Humberto pediu o mesmo.

| O que | Como |
|:---|:---|
| Onde | **ponta esquerda da barra**, antes do grupo Arquivo: um interruptor de duas posições, `Montagem | Animando`, em texto |
| Cor | **Animando fica laranja** (`--toggle-on`, o mesmo dos Ver/Travar). Montagem fica cinza. A cor diz "aqui você está gravando chave" |
| Tecla | `Ctrl+Tab`. `Tab` sozinho continua escondendo os painéis |
| Faixa de baixo | **trocar de modo não mexe na faixa.** Fechada continua fechada, aberta continua aberta. Regra 12: o Humberto pediu que ela não abra sozinha |
| O que sai | o botão "Voltar à montagem" **sai do painel Animações**. O item do menu Animação continua, com a tecla escrita ao lado |
| O que chama | a **mesma** ação de trocar modo que o menu Animação chama hoje. Nunca uma cópia |

No modelo: um sexto grupo, `modo`, o primeiro da lista de `actionBarGroups`, com **um** botão `style: 'mode-switch'`. Sem animação escolhida, a posição Animando fica cinza e a dica diz "Escolha uma animação primeiro".

Testes a mais em `lote17-barra.test.ts`:

| Teste | Esperado |
|:---|:---|
| `actionBarGroups(...)` | **6** grupos; o primeiro é `modo`, com 1 botão `style: 'mode-switch'` e `actionId` da troca de modo |
| trocar de modo com a faixa fechada | `dock.open` continua `false`; `dock.height` **não muda** |
| trocar de modo com a faixa aberta | `dock.open` continua `true` |
| sem animação escolhida | a posição Animando está `disabled`; dica contém "animação" |
| painel Animações | "Voltar à montagem" não está mais no DOM; o item do menu Animação continua, com `Ctrl+Tab` |

Manual: capítulo 01, "Os dois modos", passa a apontar para o interruptor, com a imagem. Capítulo 03, a primeira frase de "Animando" também.

**Não** copiar do Spine: painéis diferentes por modo. Os nossos são os mesmos nos dois.

### Como construir

- `ui/action-bar-model.ts` **novo**, puro. `actionBarGroups(tools, mode)` devolve os cinco grupos, cada botão `{ id, icon, label, key, hint, actionId, style: 'icon' | 'text-toggle' }`. `actionId` é a chave em `ui/actions.ts`. **Nenhum botão sem `actionId` que exista.**
- `LOCK_ITEMS` e `MOVED_OUT_OF_TOOLBAR` mudam de `toolbar-model.ts` para aqui. O teste do lote 4 é atualizado com o porquê escrito nele.
- Desfazer e Refazer cinza quando `canUndo` / `canRedo` é falso. Colar cinza sem nada copiado.
- Laranja: variável `--toggle-on`, definida nos dois temas (lote 18 a acerta no escuro; no claro nasce `#d98a2b` já neste lote).
- Ícones novos: `undo`, `redo`, `cut`, `copy`, `paste`, `trash`, `new`, `open`, `save`. Nove desenhos.

### Testes — `lote17-barra.test.ts`

| Teste | Esperado |
|:---|:---|
| `actionBarGroups(getTools(), 'montagem')` | 5 grupos: arquivo, editar, ferramentas, eixos, verTravar, nesta ordem |
| todo botão | `actionId in ACTIONS`; `label` não vazio; `style === 'icon'` ⇒ `hasIcon(icon)` |
| grupo verTravar | 4 botões, `style: 'text-toggle'`, teclas `7 8 9 0` nesta ordem |
| grupo editar | 6 botões; o primeiro `undo`, o segundo `redo` |
| `toolsForMode` | o teste do lote 4 passa sem mudar o esperado |
| conferência sem cabeça | a barra tem **uma** linha em 1440 px: `offsetHeight` ≤ 48 |

### Manual

Capítulo 01, "A barra": a lista nova, com a imagem. Capítulo 02, "Ver e travar": os quatro botões.

### Pronto quando

Em 1440×900 a barra é uma linha e a cena não perdeu altura. Clicar em Salvar = Ctrl+S. "Ver ossos" ligado é laranja e desliga com 7. Testes ≥ 1.759.

---

## Lote 18 → v4.0 · Tema escuro

### O que muda na tela

As cores do Spriter da tela dele: painel cinza escuro, texto claro, cena cinza
claro, ligado em laranja. O claro de hoje continua em **Exibir → Tema → Claro
· Escuro**. Padrão: **Escuro**.

### Como construir

- `ui/theme.ts` **novo**, puro. `THEMES = { claro, escuro }`, cada um com **as mesmas chaves**: as do `:root` do `shell.css` (`--ink`, `--ink-soft`, `--paper`, `--panel`, `--line`, `--line-strong`, `--accent`, `--accent-ink`, `--warn`, `--warn-bg`, `--stage`, `--toggle-on`) mais as da cena que hoje estão presas no `COLOR` do `viewport.ts` (`grid`, `gridStrong`, eixos, seleção).
- `applyTheme(name)` no `shell.ts` escreve as variáveis em `document.documentElement.style`. O `viewport.ts` **lê** as cores por `getComputedStyle` uma vez por troca, e não do `COLOR` fixo.
- `Prefs.theme: 'claro' | 'escuro'`, padrão `'escuro'`. `parsePrefs` aceita só os dois.
- `contrastRatio(a, b)` puro, WCAG. Texto sobre painel ≥ 4,5 nos dois temas.

### Valores de partida do escuro

| Chave | Valor | De onde |
|:---|:---:|:---|
| `--panel` | `#3a3a3a` | painel do Spriter |
| `--paper` | `#2e2e2e` | fundo entre painéis |
| `--ink` | `#e6e6e6` | texto |
| `--line` | `#555555` | bordas |
| `--toggle-on` | `#d98a2b` | o laranja do "Show Bones" |
| `--accent` | `#d98a2b` | o mesmo laranja para o botão de ferramenta ativo |
| `--stage` | `#c8c8c8` | a cena |
| `grid` | `#bcbcbc` | grade sobre a cena |

O executor ajusta um tom para bater o contraste. Não inventa cor sem passar no teste.

### Testes — `lote18-tema.test.ts`

| Teste | Esperado |
|:---|:---|
| `Object.keys(THEMES.escuro)` | igual a `Object.keys(THEMES.claro)`, mesma ordem |
| `contrastRatio('#e6e6e6', '#3a3a3a')` | ≥ 4,5 |
| `contrastRatio(ink, panel)` nos dois temas | ≥ 4,5 |
| `parsePrefs({ theme: 'roxo' }).theme` | `'escuro'` |
| `parsePrefs({}).theme` | `'escuro'` |
| menu Exibir → Tema | dois filhos, marcado o de `prefs()` |

### Manual

Capítulo 01, seção "Tema": uma frase e a imagem escura. As imagens dos outros
capítulos ficam claras; o 01 avisa uma vez. Um lote só de imagens vem depois.

### Pronto quando

Abrir → escuro. Exibir → Tema → Claro → como hoje, sem recarregar. Recarregar mantém. Console limpo. Testes ≥ 1.765.

---

## Lote 19 → v4.1 · Painéis limpos, menus auditados, Histórico

### O que muda na tela

"Nossos menus são muito bagunçados." Três frentes:

**a) Cabeçalho da Árvore.** Os 8 botões em 3 linhas (Osso · Slot · Regra ·
lista de regra · Evento · Pele · Parâmetro · Apagar) viram **uma linha de
ícones**, como a paleta de Animações do Spriter:

| Botão | Como |
|:---|:---|
| **Novo ▾** | um botão; abre a lista: Osso · Slot · Regra ▸ (as cinco) · Evento · Pele · Parâmetro |
| Apagar | ícone lixeira, cinza sem seleção |
| Buscar | ícone lupa; abre a caixa de filtro (Ctrl+F, do projeto do menu) |

**b) Animações.** Nova · Duplicar · Renomear · Apagar · Voltar à montagem
viram ícones numa linha. A palavra volta com `toolNames`.

**c) Histórico.** Aba ao lado de Animações, como no Spriter: uma linha por
passo de desfazer, com o `label` que a `Command` já tem. A atual em destaque.
Clicar numa linha volta ou avança até ela. Desfeitos ficam cinza até serem
sobrescritos.

**d) Menus.** Auditoria dos sete, com regra escrita e testada:

| Regra | Como se confere |
|:---|:---|
| item aparece **uma** vez na barra inteira | conjunto de `actionId` sem repetido |
| menu com mais de 12 itens tem separadores a cada grupo de até 6 | contagem entre separadores |
| todo item com tecla mostra a tecla | `shortcut` não vazio ⇒ aparece no `menu-key` |
| ordem dentro de cada menu: criar · editar · ver · apagar; o mais usado em cima | tabela `MENU_ORDER` em `ui/menu-audit.ts`, uma linha por menu, escrita à mão neste lote |
| nome curto: até 3 palavras; a explicação vai na dica | comprimento do `label` |

O `PROJETO DO MENU 2026-09-08` continua mandando sobre **quais** itens
existem. Este lote manda sobre **ordem e agrupamento**. Se os dois brigarem,
escrever em Desvios e seguir o `PROJETO DO MENU`.

**e) Os três defeitos** da tela dele (vazamento entre abas, cabeçalho cortado).

### Como construir

- `doc/undo.ts`: `UndoStack` ganha `entries()` → `{ label, index }[]` e `cursor()`. **Só leitura.**
- `panels/history-model.ts` **novo**, puro: `historyRows(stack)` → `{ label, index, state: 'feito' | 'desfeito' | 'atual' }[]`; `stepsTo(stack, index)` → `{ undo: n }` ou `{ redo: n }`. `panels/history.ts` chama `doc.undo()` / `doc.redo()` `n` vezes. Nunca mexe na pilha direto.
- `ui/menu-audit.ts` **novo**, puro: `auditMenus(menus)` → lista de violações `{ menu, item, regra }`. O teste espera **lista vazia**.
- Tree: `Novo ▾` reutiliza o `menu-list` do `shell.ts`. Nada de segundo componente de menu.
- Vazamento: achar por que mais de um `panel-body` fica sem `hidden`. Suspeita: o `panel-group-body` rola e mostra o próximo painel. O teste puro em `paineis.test.ts` confere que `activePanels(state)` devolve **um** id por grupo, e o DOM esconde os outros.
- Ícones novos: `plus`, `duplicate`, `rename`, `back-to-setup`, `search`, `chevron-down`.

### Testes — `lote19-paineis-limpos.test.ts`

| Teste | Esperado |
|:---|:---|
| `auditMenus(MENUS)` | `[]` |
| 3 comandos | `historyRows` tem 3; a 3ª é `atual` |
| 1 `undo` | 2ª `atual`, 3ª `desfeito`; `stepsTo(stack, 0)` = `{ undo: 1 }`; `stepsTo(stack, 2)` = `{ redo: 1 }` |
| comando novo após undo | a desfeita sumiu; total 3 |
| `undoLimit` cheio | `entries().length` ≤ limite |
| cabeçalho da Árvore | 3 botões, todos com `hasIcon` e `label`; `Novo` tem `children.length === 6` |
| botões de Animações | 5, todos com `hasIcon` e `label` |
| grupo com 3 painéis, ativo o 2º | exatamente um `panel-body` sem `hidden` |

### Manual

Capítulo 01, "Desfazer": o Histórico. Capítulo 02: o botão Novo ▾, com a imagem. Capítulo 03: os ícones de Animações.

### Pronto quando

Árvore com uma linha de ícones e o título "Ossos 18" à vista. Aba Animações sem texto de outro painel. Mover um osso três vezes → três linhas no Histórico; clicar na primeira → cena volta. Testes ≥ 1.775.

---

## Lote 20 → v4.2 · Painel Imagens

### O que muda na tela

O painel **Imagens**, direita em cima, é a "Palette" do Spriter: **todas as
regiões do atlas**, miniatura de 48 px, nome embaixo, caixa de busca no topo.
Ao lado de cada uma, um número pequeno: quantos slots a usam.

**Arrastar uma imagem para a cena cria um slot** com aquele desenho, onde
soltou, filho do osso escolhido (ou `root`). Um passo de desfazer. É o "drag
new items as sprites".

Arrastar para **cima de um slot na Árvore** troca o desenho daquele slot.

### Como construir

- `panels/palette-model.ts` **novo**, puro:
  - `paletteEntries(doc, filtro)` → `{ name, usedBy }[]`, ordem do atlas, filtro sem acento e sem caixa.
  - `dropAsSlot(doc, name, worldX, worldY, boneName)` → a `Command`: slot novo com nome único (`name`, `name_2`…), anexo `region`, posição de mundo levada para o local do osso. Reaproveita o que `import-psd.ts` faz para pôr um slot "onde estava na tela".
- `panels/palette.ts` desenha. Arrasto com `dataTransfer` `text/x-recorte-imagem`. O `viewport.ts` ganha `ondrop` para esse tipo e nada mais.
- Sem atlas: "Nenhum atlas. Arquivo → Importar PSD… ou Reempacotar atlas".

### Testes — `lote20-imagens.test.ts`

| Teste | Esperado |
|:---|:---|
| `paletteEntries(heroi, '')` | entradas = regiões do atlas do herói, lidas do arquivo; `usedBy` de `sword` ≥ 1 |
| `paletteEntries(heroi, 'MAO')` | só nomes com "mao" ou "mão" |
| `dropAsSlot(heroi, 'sword', 100, 50, 'hand')` aplicado | `slots.length` + 1; `bone: 'hand'`; anexo `x, y` = `(100, 50)` no local de `hand`, conferido com `worldToLocal` do runtime, 1e-6 |
| `boneName` vazio | `bone: 'root'` |
| dois `dropAsSlot` de `sword` | `sword` e `sword_2` |
| `revert` | `file` igual ao de antes, texto contra texto |

### Manual

Capítulo 02, "Trazer uma imagem para a cena": duas frases e a imagem do arrasto.

### Pronto quando

Arrastar `sword` com `hand` escolhido → aparece, gruda na mão, Ctrl+Z tira. Busca filtra ao digitar. Testes ≥ 1.781.

---

## Lote 21 → v4.3 · Réguas na cena

### O que muda na tela

Régua em cima e à esquerda, como no Spriter: números do mundo (`-1000 · -500 ·
0 · 500 · 1000`), passo igual ao da grade, marca fina a cada décimo. Uma linha
acompanha o mouse. **Exibir → Réguas** liga e desliga. Padrão ligado.

Barras de rolagem **não** entram: a cena é infinita e Espaço + arrastar já
move. Está escrito para não voltar.

### Como construir

- `viewport/rulers.ts` **novo**, puro. `rulerTicks(camera, lengthPx, axis)` → `{ px, value, major }[]`. Usa `gridStep` de `camera.ts`: **régua e grade nunca discordam**.
- No mesmo `canvas`, em espaço de tela, depois da grade e antes do esqueleto. 20 px. O `Camera` ganha os 20 px para a origem continuar onde estava.
- `view.rulers: boolean` em `RECORTE_editor_state`, ao lado de `view.grid`.

### Testes — `lote21-reguas.test.ts`

| Teste | Esperado |
|:---|:---|
| zoom 1, origem no centro de 1000 px | maiores em `-500, 0, 500`; `px` de `0` é 500 |
| zoom 2 | os valores dos maiores seguem `gridStep(2, gridPixels)` |
| eixo Y | `px` menor → `value` maior (Y para cima, §3) |
| `rulers: false` | `rulerTicks` não é chamado; a cena volta aos 20 px |
| `parseViewState({ rulers: 'sim' })` | `true`, não estoura |

### Manual

Capítulo 01, "A cena": uma frase e o item de menu.

### Pronto quando

A régua diz `0` na linha verde e `500` a meio caminho em zoom 1. Zoom muda, régua acompanha, grade bate. Testes ≥ 1.786.

---

## Lote 22 → v4.4 · Ficha rápida em Propriedades

### O que muda na tela

O topo de Propriedades vira a ficha do Spriter, para **osso** e **desenho**:

| Campo | Controle |
|:---|:---|
| x · y | número; arrasto lateral muda |
| escala x · escala y | número; cadeado liga os dois |
| ângulo | número **e um disco** para girar |
| alfa | número **e uma barra** de 0 a 100 |

O resto do painel continua embaixo, dobrado por seção. Nada some.

### Como construir

- `panels/quick-model.ts` **novo**, puro:
  - `quickFields(selection)` → os seis campos com ponteiro JSON (osso: `x`, `y`, `scaleX`, `scaleY`, `rotation`; desenho: os do anexo; alfa é `color[3]` do slot; para osso a linha de alfa fica **vazia**, não cinza — desvio 2 do lote 12).
  - `angleFromDial(cx, cy, px, py)` → graus, Y para cima: direita 0, cima 90, esquerda 180, baixo −90 (§4.2).
  - `alphaFromSlider(v)` = `v / 100`, preso em `[0, 1]`.
- Disco: `<svg>` de 48 px, uma agulha. Arrastar grava pelo mesmo caminho do campo de número (mesma `Command`, merge no arrasto, `breakMerge` ao soltar).
- Em **Animando**, a ficha cria chave como o campo de hoje cria.

### Testes — `lote22-ficha-rapida.test.ts`

| Teste | Esperado |
|:---|:---|
| `angleFromDial(0,0, 10,0)` | `0` |
| `angleFromDial(0,0, 0,10)` | `90` |
| `angleFromDial(0,0, -10,0)` | `180` |
| `angleFromDial(0,0, 0,-10)` | `-90` |
| `alphaFromSlider(150)` | `1` |
| `quickFields(osso 'arm')` | 6 linhas; alfa com `pointer: null` |
| `quickFields(slot 'weapon')` | alfa aponta para `/slots/N/color/3` |
| disco a 90° em Animando | uma chave em `arm.rotation` = `90` |

### Manual

Capítulo 02, "Propriedades": a imagem da ficha. Capítulo 03: "o disco também cria chave".

### Pronto quando

Girar o disco gira o osso e o número acompanha. Barra de alfa clareia o desenho. Ctrl+Z desfaz o arrasto em um passo. Testes ≥ 1.794.

### Lote 15 → v3.7

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "Sem arquivo novo" | nada a corrigir | nenhum arquivo novo de código. Só `editor/testes/lote15-tocador.test.ts` |
| 2 | `speedFromSlider(500)` = `2` | a barra vai até 200; 500 é um valor que a barra não produz, mas um `.bone` editado à mão pode trazer | preso nos limites: 500 → 200 → `2`. E `sliderFromSpeed` faz o caminho de volta sem perder nada em toda a faixa (teste com os 191 valores) |
| 3 | "a pergunta do lote 13 deixa de ser pergunta" | apagar a pergunta apagaria a função de **esticar as chaves junto**, que não tem outra porta | o **campo** muda só o número, sem perguntar. A pergunta virou **Animação → Mudar duração…**, que era um item **cinza** desde o lote menus e agora funciona. Uma função a mais, e não a menos |
| 4 | os dois de Chavear em texto | "Chavear escolhidos" ocupava 170px | o botão diz **Chavear**; o nome inteiro, "Chavear escolhidos", está na dica e no `aria-label`. "Chavear tudo" cabe inteiro |
| 5 | "linha 1 fechada, 1440 px: nenhum `scrollWidth > clientWidth`" | **não cabia.** Presa entre a barra de ferramentas e a coluna, a faixa tem 888px numa janela de 1440, e a linha nova mede 929 mesmo depois de encolher folgas, botões, a barra e os campos | **a faixa passou a atravessar a janela inteira**, por baixo da coluna — que é como é no Spriter (olhe a tela dele: a Timeline vai de ponta a ponta). Com 1440 de largura a linha cabe: `1228 ≤ 1228`. É trabalho que o lote 16 ia mexer de qualquer jeito; foi trazido para cá porque sem ele o teste do lote 15 não fecha |
| 6 | — | o modo de fim foi para o ⋯ Mais, e o ⋯ Mais morava na barra dos botões em bloco, que **some com a faixa fechada** | o ⋯ Mais mudou para a linha 1, ao lado do Detalhes. É o que o plano já previa ("passa a existir também fechado, ao lado de Detalhes") |
| 7 | — | dois testes de lotes anteriores esperavam o texto antigo | atualizados **com o porquê escrito dentro**: `lote2-tocador` (a dica do Chavear) e `lote4-cena-maior` (a lista do ⋯ Mais, que ganhou "No fim" na frente). Nenhum teste foi apagado |

**Medido depois do lote**, Chrome headless, 1440×900, `walk` aberta, console limpo:

| | |
|:---|---:|
| Faixa de baixo, fechada | 121 px · 13% |
| Largura da faixa | **1440 px** (era 1100) |
| Linha 1 | cabe inteira, `1228 ≤ 1228` |
| **Cena** | **611 px · 68%** |

### Lote 16 → v3.8

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | migração: "o formato antigo vira a **direita**; a esquerda nasce de fábrica" | assim ao pé da letra, `arvore` e `propriedades` apareciam nos **DOIS** lados: a coluna antiga os tinha, e a esquerda de fábrica também | quem estava na coluna antiga **fica nela**. Só o que ela não conhecia se decide por fábrica — hoje a aba `ordem`. Teste: nenhum id nos dois lados |
| 2 | `LayoutState` com `widths` e `hidden` | `parseColumnState` põe **todo** painel conhecido que sobrou dentro da coluna que ele leu. Rodado duas vezes, punha cada painel nos dois lados | `parseLayout` decide de quem é cada um antes: quem estava guardado num lado fica nele, e o que sobrou vai para o lado onde nasce de fábrica |
| 3 | direita: `[['imagens','exibicao'],['animacoes','historico','malha']]` | `imagens` (lote 20) e `historico` (lote 19) não existem | pulados sem estourar, como o plano previa. `missingTabs(known)` diz **quais** faltam, e um teste os lista: um id reservado que nunca chegasse seria uma aba prometida e não entregue |
| 4 | Ordem: "Ctrl+↑ / Ctrl+↓ sobem e descem um" | o menu Esqueleto já tinha **Subir/Descer na ordem de desenho** com `+` e `−`, cinzas desde o lote 5 | os dois caminhos existem e são a mesma ação: `+`/`−` pelo menu, `Ctrl+↑`/`Ctrl+↓` com o foco numa linha da aba. Os itens do menu deixaram de ser cinza |
| 5 | "Botão direito numa aba: **Mover para a outra coluna**" | um gesto que só se descobre por acaso é um gesto que quase ninguém descobre | além do botão direito, **Janela → Mover painel para a outra coluna**, com a lista de painéis e o lado em que cada um está |
| 6 | — | **defeito achado, de antes do lote:** `hidden` não escondia painel nenhum que declarasse o próprio `display`. Um painel que põe classe no host e escreve `display: flex` passa por cima do `[hidden]` do navegador, e dois painéis ficam desenhados na mesma casa | `.panel-body[hidden]` e `.dock-panel[hidden]` com `display: none`. **São os três defeitos da tela do Humberto** que o plano marcou para o lote 19 (a linha "os três dizem a mesma coisa"): a raiz é esta, e ela está fechada. O lote 19 fica com o teste puro de `activePanels` |
| 7 | — | **defeito achado, de antes do lote:** a tabela "Mostrar na tela" do painel Exibição **nunca teve CSS**. Os `<span>` saíam em fila e o cabeçalho lia-se "VerTravarNomeOssos". Não saltava aos olhos porque a coluna tinha 340px e a fila quebrava por acaso; a 260px ela deixou de quebrar | grade de quatro colunas escrita em `view-panel.css` |
| 8 | — | o `conferir-editor.mjs` procurava o `walk` em `document.querySelector('.panel-column')`, e passou a pegar a coluna da **esquerda** | ele varre a coluna da direita, e passou a medir também a **largura** da cena e a de cada coluna |

**A medida que o plano pediu (item 4 da ordem de trabalho).** Chrome headless,
1440×900, `walk` aberta, console limpo:

| | |
|:---|---:|
| Coluna da esquerda | 260 px |
| Coluna da direita | 260 px |
| **Cena — altura** | **611 px · 68%** |
| **Cena — largura** | **904 px · 63%** |
| Faixa de baixo | 121 px · 13% |

**A largura fechou: o plano pedia ≥ 60% e deu 63%.** A altura continua em 68%,
contra os 70% pedidos, e a diferença continua sendo a mesma barra de
ferramentas de 60px que o **lote 17** transforma em uma barra de ações só.

### Lote 17 → v3.9

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | grupo Editar: "Recortar" | **não existe** a ação `recortar` no programa. Existe `recortar-chaves`, `Ctrl+X`, do lote 10 | o botão é **Recortar chaves**, com `Ctrl+X`, apontando para a ação que existe. Regra 5: menu e botão chamam a mesma função |
| 2 | `actionId in ACTIONS` | um teste sem navegador **não tem registro de ações**: nenhum painel montou, e o registro nasce vazio | a auditoria recebe a pergunta de fora. O teste responde com o MENU — que é dado puro — mais os `ferramenta-*`. Toda ação da barra que não é ferramenta tem que estar num menu, que é a regra 5 escrita como teste |
| 3 | "a barra tem uma linha em 1440: `offsetHeight` ≤ 48" | com a barra **dentro da cena**, entre as duas colunas do lote 16, ela tinha 904px de largura para 1889 de conteúdo, e media 71px com a rolagem | **a barra saiu de dentro da cena e virou uma linha da janela inteira**, logo abaixo do menu — que é onde ela está na tela do Spriter. Com 1440 de largura o conteúdo cabe inteiro, a rolagem some, e ela mede **44 px** |
| 4 | — | os quatro interruptores saíam **azuis**. `.viewport-button.is-active` pinta de azul a ferramenta ativa, tem o mesmo peso que `.viewport-interruptor.is-active` e vem **depois** no arquivo | a regra do laranja passou a ter três classes. Medido: `rgb(217, 138, 43)` nos dois ligados |
| 5 | ferramentas: `actionBarGroups(tools, mode)` | construir a barra com o modo corrente **criava e destruía botões** a cada troca de animação, e o botão sumia em vez de ficar escondido — o contrário do que o lote 4 fez | a tela constrói com `montagem`, que traz todas (as cinco com `modes` só valem nela), e o `syncToolModes` de sempre esconde as que não valem. O modelo continua filtrando, e o teste prova os dois modos |
| 6 | — | a barra passou a ter também Novo, Abrir, Salvar, Desfazer… e a preferência "mostrar nome" só valia para as ferramentas | ela vale para a barra inteira |
| 7 | — | a altura precisou de mais 6px para caber em 48: folga de 10 para 8, grupo de 4 para 3, botão de 38 para 34 de altura | a barra ficou em **44 px**, e a cena ganhou os 16px que a barra devolveu |

**A medida do fim da rodada.** Chrome headless, 1440×900, `walk` aberta,
console limpo, linha do tempo fechada:

| Faixa | px | Fração |
|:---|---:|---:|
| Menu | 44 | 5% |
| **Barra de ações** | **44** | 5% |
| **Cena (o canvas)** | **627** | **70%** |
| Faixa de baixo | 121 | 13% |
| Rodapé | 54 | 6% |

**A meta da rodada — cena ≥ 70% da altura — bateu no lote 17**, e a largura
fechou no 16 (63%, contra os 60% pedidos). O ponto de partida, na tela que o
Humberto mandou, era **43% da altura**.

### Lote 18 → v4.0

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "o `viewport.ts` **lê** as cores por `getComputedStyle` uma vez por troca" | uma leitura ao motor de estilo por troca de tema é barata, mas o desenho da cena roda **por quadro**, e ele precisa das cores em toda passada | `COLOR()` virou função e lê o objeto do tema, que é memória. Uma leitura de objeto por quadro é grátis; uma de `getComputedStyle` não seria. A cena continua trocando de cor na hora, porque `onThemeChange` pede o desenho |
| 2 | `--stage` e `grid` entram no tema | a cor de FUNDO da cena não é do tema: ela é `view.background`, uma escolha de quem usa, gravada no arquivo, com seletor de cor no painel Exibição desde a fase 4 | o tema traz `sceneBackground` e ele vale para o CSS da caixa da cena; o **canvas** continua pintado com a cor que a pessoa escolheu. Sobrescrevê-la mudaria, sem avisar, a aparência de um `.bone` que alguém já ajustou |
| 3 | valores de partida do escuro: `--accent` = o laranja | usar o mesmo laranja para "ferramenta ativa" e para "ver e travar ligado" faria os dois estados se lerem como um só, e a barra tem os dois lado a lado | `--accent` no escuro é o azul do claro **clareado até passar em 4,5** (`#5b8dff`); o laranja fica só para os quatro de ver e travar, que é o que o Humberto reconhece. Está escrito no `theme.ts` |
| 4 | `--ink-soft` no escuro | `#9a9a9a` dá 4,6 sobre o painel, que passa raspando | `#b0b0b0`, que dá **5,2**. O executor ajusta o tom para bater o contraste, como o plano manda, e não inventa cor sem passar no teste |
| 5 | — | **defeito criado e corrigido no mesmo lote:** o laranja era declarado dentro do bloco dos quatro botões, e a troca para variáveis o transformou em `--toggle-on: var(--toggle-on, …)` — uma variável que se define por si mesma. O navegador trata isso como valor inválido, e os quatro **acendiam transparentes** | o laranja passou a morar num lugar só: o `:root` do `shell.css` e os dois temas. Medido depois: `rgb(217, 138, 43)` nos dois ligados, nos dois temas |
| 6 | — | as três paletas locais (`--painel-*`, `--dope-*`, e os 55 valores fixos do `viewport.css`) repetiam as cores em vez de as apontar | todas passaram a apontar para os tokens do tema, com o valor de antes como **chão** depois da vírgula: se o JavaScript não rodar, o editor ainda tem cor |

**Medido depois do lote**, Chrome headless, 1440×900, console limpo: a cena
continua em **70% da altura** e 63% da largura. O tema não custou um pixel.

### Lote 19 → v4.1

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "nome curto: até **3 palavras**" · "comprimento do `label`" | o plano escreveu as duas coisas, e elas discordam. Contar palavras reprovava "Não mexer nos filhos" (20 letras, que se lê de um golpe) e aprovava "Reempacotar atlas" (17) | **28 letras**, que é a coluna "como se confere" do próprio plano. O que cansa o olho é a largura da linha, não quantos espaços ela tem. Quatro nomes foram encurtados; com a regra das palavras seriam vinte |
| 2 | "os 3 defeitos de vazamento entre abas" | **já estavam fechados no lote 16.** A raiz era uma só: `hidden` não vencia o `display` que um painel declara no próprio host | o lote 16 fechou a raiz; o lote 19 fica com o teste puro. Está escrito nos Desvios do 16 para ninguém contar a mesma vitória duas vezes |
| 3 | `historyRows(stack)` → `{ label, index, state }` | faltava um lugar para onde voltar quando se desfaz TUDO: sem ele, "desfazer tudo" era um ponto sem nome na lista | a lista começa em **"Arquivo aberto"**, no índice `-1`. É um passo de verdade: `stepsTo(pilha, -1)` devolve quantos `undo` faltam para chegar nele |
| 4 | `stepsTo` → `{ undo: n }` ou `{ redo: n }` | quem chama não pode ter que decidir para que lado ir: é aí que se erra | a conta nunca devolve número negativo, e `{ undo: 0 }` é "já está lá". O painel só conta as chamadas |
| 5 | `UndoStack` ganha `entries()` e `cursor()` | o `EditorDoc` do contrato é implementado por **quatro** documentos de mentira nos testes, e nenhum tem pilha | `history` é **opcional** no contrato, como o `endMerge` já era. Sem ela, o painel mostra só "Arquivo aberto" |
| 6 | "Buscar: ícone lupa; abre a caixa de filtro (Ctrl+F, do projeto do menu)" | a caixa de filtro **não existe**: ela é do projeto do menu e não foi construída em lote nenhum | o botão existe, cinza, e a dica diz "vem no lote seguinte". Um botão que explica por que não faz nada ensina mais que um botão ausente — é a mesma regra dos itens `soon` do menu |
| 7 | — | o lote encurtou nomes de menu e o manual cita alguns deles | os quatro encurtados não aparecem no manual: "Voltar à pose de repouso", "Voltar tudo ao repouso", "Apagar as linhas" e "Mover para a outra coluna" |

**O que a auditoria achou, e fechou.** `auditMenus` devolvia **28** problemas
na primeira rodada:

| O quê | Quantos | Onde |
|:---|---:|:---|
| Nome com mais de 28 letras | 4 | Esqueleto (2), Animação (1), Janela (1) |
| Menu comprido com bloco de mais de 6 | 6 | Arquivo, Exibir (2), Animação (2), Janela |
| Nome com mais de 3 palavras (regra trocada, desvio 1) | 18 | seis menus |
| Ação repetida em dois menus | **0** | — |

Hoje `auditMenus(allMenus(...))` devolve **lista vazia**, e um teste prova que
ela ainda acusa de verdade — um menu inventado com um nome comprido continua
sendo reprovado.

### Lote 20 → v4.2

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `paletteEntries(doc, filtro)` | um teste puro não deve montar um `Doc` inteiro só para listar nomes, e a lista de regiões vem dos ATLAS, que não são o arquivo | `paletteEntries(atlasNames, file, filtro)`. O painel monta a lista de nomes a partir de `doc.atlases`; a conta recebe nomes e arquivo |
| 2 | "dois `dropAsSlot` de `sword` → `sword` e `sword_2`" | o `uniqueName` do contrato numera **sem separador** desde a fundação: `sword`, `sword2`. Mudar isso mexeria em osso, slot, animação e pele | ficou `blade`, `blade2`. Um separador só aqui faria o painel Imagens nomear diferente de todo o resto do programa |
| 3 | `dropAsSlot(doc, name, worldX, worldY, boneName)` | uma função que recebe o documento e devolve uma `Command` é um jeito só de dizer "construtor" | `new DropImageAsSlot(file, image, bone, visibleSkins, x, y)`, como as outras vinte e tantas do editor. `x` e `y` chegam no espaço do OSSO: quem arrasta converte, porque só a cena sabe a matriz |
| 4 | "arrastar para cima de um slot na Árvore troca o desenho" | o comando existe (`SwapSlotImage`) e está testado; **a Árvore ainda não o recebe** | o comando e o teste ficam; o gesto na Árvore fica para a rodada 4. Escrito aqui para não se contar como feito |
| 5 | — | **defeito achado:** um anexo **`null`** — que é como o formato diz "esta pele esconde este slot" (§7.1) — derrubava a conta de usos. E derrubar a conta derrubava a montagem inteira dos painéis: os que vinham depois ficavam com a tela da montagem anterior, **sem erro visível** | tratado, com teste próprio. O sintoma é o que vale registrar: um painel que estoura ao montar deixa os vizinhos com uma tela velha, e nada na tela diz que aconteceu |

### Lote 21 → v4.3

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `rulerTicks(camera, lengthPx, axis)` | a régua precisa saber **onde a faixa começa e acaba no mundo**, e isso é uma conta da câmera com o tamanho da tela — não cabe passar a câmera inteira para um módulo puro | `rulerTicks({ zoom, from, to }, lengthPx, axis)`. Quem chama faz o `screenToWorld` dos dois cantos, que é uma linha, e a conta fica sem saber o que é uma câmera |
| 2 | "o `Camera` ganha os 20px para a origem continuar onde estava" | mexer na origem da câmera por causa da régua mudaria **toda** conta de tela do editor — o zoom, o enquadrar, o clique, o arrasto —, e a régua é uma moldura | a régua é desenhada **por cima**, em espaço de tela, e não desloca nada. O que ela tapa são 20px da borda do papel, e o desenho está no meio |
| 3 | "eixo Y: `px` menor → `value` maior" | a câmera já devolve o canto de cima como `from`, com o valor maior; a conta não precisa de sinal nenhum | o `axis` fica no tipo, para quem lê saber que existem dois, e o teste prende o comportamento: no Y, mais pixel é menos valor |
| 4 | `view.rulers` em `RECORTE_editor_state`, ao lado de `view.grid` | nada a corrigir | feito. `parseViewSettings({ rulers: 'sim' })` devolve `true` e não estoura |

### Lote 22 → v4.4

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `quickFields(selection)` | a seleção diz **quem**, mas os ponteiros dependem do ARQUIVO: o índice do osso, a pele onde o desenho está | `quickSubject(selection)` decide quem, e `quickFields(file, subject)` monta os ponteiros. Duas contas separadas, e as duas testáveis sozinhas |
| 2 | "desenho: os do anexo" | um slot pode não ter desenho na pele aberta, e um ponteiro para um anexo que não existe gravaria no vazio | `attachmentPointer` procura o anexo de repouso na primeira pele que o tenha; sem ele, as cinco linhas ficam **vazias**, com a dica dizendo por quê |
| 3 | `angleFromDial(cx, cy, px, py)` com Y para cima | o SVG cresce para BAIXO, como toda tela | a conta é toda com Y para cima, como o formato (§4.2); quem desenha inverte o sinal em duas linhas — uma na agulha, outra no ponteiro. O teste prende os quatro quadrantes |
| 4 | disco de **48px** | com 48, a linha do ângulo ficava com o dobro da altura das outras cinco, a ficha ganhava um degrau no meio e a **sexta linha (o alfa) saía da vista** em 1440×900 | disco de **36px**, e as linhas apertadas de 36 para 30px. As seis cabem sem rolar |
| 5 | — | com a divisão de fábrica da coluna esquerda em 58% para a Árvore, a ficha não cabia | a esquerda passou a nascer **meio a meio** (`LEFT_SPLIT`). A direita fica com o `DEFAULT_SPLIT` de sempre |
| 6 | "arrasto lateral muda" o número | o arrasto sobre o rótulo é o item "Campos numéricos com setas e arrasto" da lista de acabamento do `ESTADO.md`, e vale para o painel INTEIRO, não só para a ficha | os seis campos aceitam digitar; o **disco** e a **barra** são os dois gestos de arrastar que este lote traz. O arrasto sobre o rótulo continua na lista de acabamento, para ser feito de uma vez em todos os campos |

### Lote 23 → v4.6 · o interruptor de modo, e mais ícones

Dois pedidos do Humberto de 09/09/2026, depois de a rodada fechar. O do
interruptor veio pelo planejador, na seção "O interruptor de modo"; o dos
ícones veio dele direto: *"tem muitos nomes onde podia ser trocados por ícones,
só isso já ganharíamos muito espaço"*.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | tecla `Ctrl+Tab` | funciona: o mapa de teclas sai dos próprios menus, e a entrada ganhou a tecla. **Mas o navegador pode ficar com ela antes**: `Ctrl+Tab` troca de aba no Chrome, e uma página não consegue impedir. No `programa/` montado, e em qualquer janela que não seja uma aba de navegador, ela chega | escrito assim. O menu, o interruptor e o item continuam sendo três portas para o mesmo lugar |
| 2 | "trocar para Animando abre a faixa; voltar fecha" | o documento avisa a cada mudança, e não só na troca de modo: sem memória, a faixa aberta à mão em Montagem seria fechada no primeiro clique em qualquer lugar | `followMode` guarda o modo da última mudança e só age quando ele **troca**. A faixa aberta à mão fica aberta — conferido no navegador |
| 3 | "a posição Animando fica cinza sem animação escolhida" | "sem animação escolhida" é o próprio modo Montagem; o que trava de verdade é **não haver animação nenhuma no arquivo** | cinza quando `animations` está vazio. A dica diz o caminho: "crie uma em Animações → Nova" |
| 4 | — | **o interruptor pesa 205px**, e a barra passou a precisar de **1.494px** numa janela de 1.440 | ela **rola de lado**, que é o comportamento desenhado no lote 17. A barra de rolagem custa 4px de altura: a cena em Montagem foi de **70% para 69%**. Ver a nota abaixo |
| 5 | — | o `conferir-editor.mjs` media a cena **depois** de entrar em Animando, e em Animando a faixa agora abre: ele passou a acusar 40% | ele mede as duas: `cenaMontagem` (a que vale como número do projeto) e a de Animando |

**Os ícones, medidos.** Os sete botões em bloco da linha do tempo:

| | Largura |
|:---|---:|
| Com a palavra (como eram) | **889 px** |
| Em ícone (como ficaram) | **378 px** |
| **Devolvido à folha** | **511 px** |

A palavra "Eixos" também saiu da barra — a lista ao lado já mostra a escolha.
Em tudo isso a palavra continua no `title` e no `aria-label`, e volta com
**Editar → Preferências → Mostrar nome das ferramentas**.

**De onde tirar os 54px que faltam para a barra caber em 1.440.** Medido, por
grupo, em Montagem:

| Grupo | px |
|:---|---:|
| Ver e travar (quatro palavras, pedido do Humberto) | 433 |
| Ferramentas (11 ícones) | 385 |
| Editar (6 ícones) | 221 |
| **Modo** (o novo) | **205** |
| Arquivo (3 ícones) | 113 |
| Eixos (a lista) | 92 |

Apertar folga já foi feito e rendeu 8px. O próximo lugar de verdade é **tirar as
ferramentas da barra e pôr numa tira vertical**, como no Spriter e no Spine — o
elemento `.tool-strip` já existe e está vazio desde a fundação. São 385px de
uma vez, e a barra passaria a sobrar. **É decisão do Humberto**: a tira come
largura da cena, e a rodada 3 inteira foi sobre dar largura a ela.

### Lote 24 → v4.7 · anotações 3, 4, 6 e 7

As quatro anotações que a seção mandava para o "lote 15". **O lote 15 fechou às
06h de 09/09/2026, na v3.7**, e o 16, o 17 e a rodada inteira fecharam depois
dele (v4.5, e o lote 23 na v4.6). O planejador previu o caso e escreveu a
saída: *"se o lote 15 já estiver fechado, as anotações 3, 4, 6 e 7 entram como
lote 15b, versão própria, antes do 16"*. Como os três lotes estão fechados,
elas viraram **lote 24 → v4.7**, com os mesmos testes que a seção pedia.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | anotação 4 lista três lugares onde a faixa abre sozinha | havia um **quarto**, e era o mais visível: o `followMode` do lote 23 abria a faixa ao entrar em Animando — e escolher uma animação entra em Animando. Fotografado no navegador antes e depois | `followMode` **saiu inteiro**, com `lastMode` junto. Trocar de modo não mexe mais na faixa: é a regra 12, e é o que o planejador corrigiu na seção "O interruptor de modo". O desvio 2 do lote 23 fica **revogado** por decisão do Humberto |
| 2 | "`showDockPanel` na partida" | tirar o abre-sozinho de dentro do `showDockPanel` deixaria **Janela → Curvas** sem porta: as Curvas só existem com a faixa aberta | o abrir mudou de lugar, não sumiu. `showDockPanel` **nunca** abre, e com a faixa fechada põe a Linha do tempo à frente; quem abre é o `showPanel`, que é o caminho do **menu Janela** e só dele. Gesto dele, porta dele |
| 3 | "`OPEN_AT` de 40 px" | `OPEN_AT` é usado nos dois sentidos, abrir e fechar. Subir o número quebraria o fechar, que estava certo | **abrir e fechar deixaram de ter a mesma medida**: fechada, ela só abre puxada até `OPEN_MIN` (240px); aberta, continua fechando em `OPEN_AT` (161px). O teste da alça no `lote14-linha-limpa` foi trocado, e diz por quê |
| 4 | anotação 6: "achar o ponto que para o tocador" | o ponto é o `transport.forget()` de `open()`, em `panels/animations.ts`. `forget()` continua certo — a batida velha aponta para a animação velha e tem que morrer. O que faltava era **acender de novo** | nasceu `switchAnimation(doc, name, player)` no motor do tocador: um módulo puro, com o tocador por parâmetro, que o teste roda com relógio de mentira. `closeAnimation` passou a usar a mesma função com `null` |
| 5 | anotação 7: "bandeirinha na régua" | uma bandeirinha com posição própria discordaria da agulha no primeiro arredondamento | a bandeirinha mora **dentro** da agulha, e anda com ela sem uma segunda conta. Perto do fim da régua ela troca de lado sozinha, senão sairia do painel |
| 6 | anotação 7: "agulha grossa e vermelha" | `--dope-cursor` (#d24500, laranja de tijolo) também pintava as bordas do **trecho de laço** | a agulha virou vermelha de verdade (#d21a1a) e o trecho ganhou token próprio, `--dope-trecho-borda`, com o laranja de antes. Duas coisas diferentes, duas cores |
| 7 | anotação 3: a dica com sete nomes | uma dica escrita à mão envelhece no próximo controle novo | ela **sai da própria `MORE_CONTROLS`**, pelo campo `hintName`. Ficam de fora só **Fator**, que é o argumento do Esticar, e **Espelhar esquerda e direita**, que a palavra "espelhar" já cobre — e um teste prova que são só esses dois |

**Não foi feito neste lote, de propósito:** as anotações 5, 8, 9 e 11 (lote 16
da seção) e a 12 (lote 19 da seção), que mexem em painéis de coluna, e a 10
(lote 17 da seção), que mexe na barra de ferramentas. Elas são os dois lotes
seguintes. A anotação 2 já estava feita no lote 23.

**A medida da cena, medida.** O desvio 5 do lote 23 teve que ensinar o
`conferir-editor.mjs` a medir duas cenas, porque em Animando a faixa abria e a
cena caía para 39%. Com a faixa não abrindo mais, as duas medidas voltaram a
ser a mesma:

| | Montagem | Animando |
|:---|---:|---:|
| Lote 23 (v4.6) | 623 px · **69%** | 352 px · **39%** |
| Lote 24 (v4.7) | 623 px · **69%** | 623 px · **69%** |

Medido em 1440×900, Chrome headless, `heroi.bone`, animação `walk` tocando a 61
quadros por segundo. Console limpo. **A cena em Animando ganhou 30 pontos**, e
não porque alguém a aumentou: porque parou de encolher sem ser chamada.

---

### Lote 25 → v4.8 · anotações 5, 8, 9, 11 e 14

As anotações que a seção mandava para o "lote 16", mais a 14, que ela mandava
para o "lote 15". Os dois lotes estão fechados desde a manhã de 09/09/2026;
viraram **lote 25 → v4.8**, com os testes que a seção pedia.

**Print usado:** `documentos/pesquisa/nova pesquisa/spriter/prints/06-ordem-z_203.jpg`
— a aba **Z-order** do Spriter. Copiada a disposição: miniatura à esquerda, nome
à direita, linha escolhida realçada, e **nenhuma frase de explicação** em lugar
nenhum do painel.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | anotação 11: teste com `hair` e `arm_back` → o aviso diz `1 peça mudou de lugar` | no `heroi.bone` esses dois são **vizinhos** (índices 2 e 3): pôr os dois numa pasta não move ninguém, e a conta honesta é **0** | a conta é "quantas das escolhidas mudam de lugar", e o teste prova as duas pontas: `hair` + `arm_back` → **0**, e a janela diz "nenhuma peça muda de lugar: elas já são vizinhas"; `hair` + `body` (índices 2 e 10) → **1** |
| 2 | anotação 11: "pasta quebrada em duas" | a `capa` do herói tem três membros, e o terceiro é o `cape_path`, que mora longe dos outros dois | o corte é feito na lista **já filtrada**, e o `cape_path` não entra nela (anotação 9). A `capa` continua inteira, e não quebrada por causa de algo que ninguém vê. Quebrar de verdade precisa de uma peça **visível** no meio, e é isso que o teste faz |
| 3 | anotação 11: renomear "grava em todas as peças dela" | "todas" inclui as que não aparecem na lista | `RenameFolder` troca o nome em **todo** slot com aquela `folder`, o `cape_path` junto. Senão sobraria uma pasta fantasma: invisível na tela e visível no `.bone` |
| 4 | anotação 8: "nenhum elemento com o texto antigo" | não há jsdom neste projeto | o teste lê o **código-fonte** do painel e prova que a frase e a classe `ordem-aviso` sumiram. É a prova que dá para fazer sem navegador, e ela não envelhece |
| 5 | anotação 5: "`DEFAULT_GROUPS` da direita passa a…" | `DEFAULT_GROUPS` é do `panel-groups.ts`, de antes do lote 16; quem manda desde o 16 é o `RIGHT_GROUPS`, no `layout-model.ts` | mexido no `RIGHT_GROUPS`. A migração já existia e cobriu o caso sozinha: painel que não está em nenhuma das colunas guardadas vai para o lado onde ele nasce de fábrica |
| 6 | — | **três painéis liam o tema errado**: `ordem`, `historico` e `imagens` montavam o host sem a classe `painel`, que é onde os tokens `--painel-*` são definidos. Todo `var(--painel-x, cor-clara)` caía na reserva, que é a cor do tema **claro** | corrigido nos três. Achado por acidente: o cabeçalho de pasta usa fundo de campo, e ele saiu branco no tema escuro. As abas são dos lotes 16, 19 e 20; o tema escuro é do 18, e ninguém tinha olhado para elas depois. Está no CHANGELOG como defeito à parte |
| 7 | — | `hand` e `weapon` do `heroi.bone` ficam com a miniatura vazia: o atlas do exemplo não tem região `hand`, e `weapon` é um `skeleton` de fora, que não tem imagem | **deixado como está**: é o exemplo, não o programa. Não é o caso da anotação 9 — os dois desenham e têm ordem. Fica anotado para não ser "achado" de novo |

**A cena não mudou:** 623 px · 69% nos dois modos, faixa de baixo em 121 px,
colunas em 260 px. Medido em 1440×900, Chrome headless, console limpo.

---

### Lote 26 → v4.9 · anotações 10 e 16

**Print usado:** nenhum. O Spriter não tem ferramenta de inclinar na barra —
inclinar é dele um campo numérico —, então não havia disposição para copiar. O
desenho do ícone de Escalar veio do próprio Humberto, e o de Inclinar da regra
que a ferramenta já cumpre: o topo anda, a base fica.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "trocar a ordem de registro, ou dar um `order` às ferramentas: o executor escolhe" | trocar dois `import` de lugar conserta a barra hoje e a quebra de novo no dia em que alguém reordenar os imports — e não há como um teste explicar por que a ordem dos imports importa. Um `order` no `Tool` mexeria no `contract.ts`, que é a lei do editor, para uma decisão que é de tela | **nem um nem outro**: uma lista `TOOL_ORDER` escrita no `toolbar-model.ts`, e o `toolbarItems` ordena por ela. Ferramenta fora da lista vai para o fim, e a ordenação é **estável**. O `contract.ts` não foi tocado |
| 2 | — | a **tira vertical escondida** (`.tool-strip`) montava os botões pela ordem de registro, por um caminho próprio | ela passou a ler o mesmo `toolbarItems`. Ela está com `display: none` desde o lote 17, e no dia em que for ligada — é a ideia da tira do Spriter, no fim deste plano — mostraria uma ordem diferente da barra, sem ninguém entender por quê |
| 3 | "sem osso, o rodapé diz…" | não havia rodapé de ferramenta: a barra de status tinha o estado do arquivo, o modo e os avisos, e nada sobre a ferramenta na mão | nasceu `status-tool`, que **só aparece quando há algo a dizer**. Uma linha de ajuda permanente vira paisagem em dois dias, e aí deixa de ser lida justamente quando é necessária. A conta de quando falar é o `toolFooter`, puro |
| 4 | "sem osso escolhido, Inclinar não faz nada" — dito só do Inclinar | conferido nas outras três: **Mover, Girar e Escalar caem no desenho** quando não há osso, e fazem alguma coisa | a lista `NEEDS_BONE` tem **uma** ferramenta, e um teste prova que as outras nunca põem linha no rodapé. Se um dia outra precisar de osso, ela entra na lista e ganha a frase dela |
| 5 | "nenhum botão com `icon: ''`" | o teste vale para as ferramentas do modo, e não para a barra inteira: `Eixos` é um grupo vazio de propósito | o teste percorre `toolbarItems` e exige ícone em cada um. `hasIcon('shear')` e `hasIcon('scale')` também são conferidos por nome |

#### Anotação 16 — o clique que não chegava

A causa foi conferida **antes** de mexer, como o plano mandou. Com o `heroi.bone`
aberto, no navegador: guardar o nó do botão `walk`, arrastar a agulha na régua,
e perguntar se ele ainda está no DOM.

| | Antes | Depois |
|:---|:---|:---|
| `alvoAntes === alvoDepois` | `false` | `true` |
| `document.contains(alvoAntes)` | `false` | `true` |

Oito arrastos seguidos, e o mesmo nó. Era isso: o botão morria entre o
`mousedown` e o `mouseup`, e o navegador não dispara `click` entre dois
elementos diferentes.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 8 | `needsRedraw(change, panel)` decide | `change.kind` **não distingue** "andou o tempo" de "abriu outra animação": o `Doc` emite `time` nos dois casos (`document.ts`, os dois setters). Um `ChangeKind` novo mexeria no `contract.ts`, que é a lei do editor, por causa de um painel | `redrawPlan(kind, antes, agora)` compara o que está **desenhado** com o que teria de estar. Não precisa que o aviso conte nada: ele já sabe olhar |
| 9 | "mesma regra para a Árvore, a Ordem, as Imagens e o Histórico" | **só o painel Animações escuta `time`.** A Árvore, a Ordem e o Histórico escutam `selection`; as Imagens, nem isso. O defeito descrito **não pode acontecer** nos outros três | feito no **Animações** (onde estava o defeito) e na **Ordem** (mesma forma de lista, e o `selection` chega a cada clique na cena). Árvore, Imagens e Histórico ficam para quando houver sintoma: a cirurgia seletiva neles é maior — a Árvore tem linhas aninhadas e estado de arrasto — e não há relato |
| 10 | — | a primeira `signature` juntava os campos com `\|`. Um slot chamado `a\|1` dá a mesma assinatura que dois campos `a` e `1`, e **duas listas diferentes com a mesma assinatura fariam a tela deixar de se refazer** — o oposto do defeito que este arquivo existe para não ter | `JSON.stringify`. O erro foi pego por um teste escrito no mesmo lote, e o teste ficou |

**A cena não mudou:** 623 px · 69% nos dois modos. Console limpo, 61 quadros por
segundo no Chrome headless.

---

### Lote 27 → v5.0 · anotação 12, a aba Peles

**O lote 27 do plano tinha as anotações 12 e 13 juntas.** Elas foram partidas:
a **12 (Peles)** é este lote, e a **13 (Regras)** vira o **lote 28**. Motivo: a
12 está pronta, provada e fotografada, e a 13 é maior que ela sozinha — janela
guiada por tipo, campo de cadeia em Propriedades, validação e rodapé. Uma
versão que entrega as duas fica sem prova por horas, e "volta pra 5.0" deixa de
poder devolver só uma das duas. As anotações 15 passam a ser o **lote 29**.

**Prints usados:**

| Print | O que veio dele |
|:---|:---|
| `spriter/prints/22-empilhar-character-maps_244.jpg` | a frase de ajuda no topo, antes da lista |
| `spriter/prints/00-tela-do-humberto.png` | os ícones numa linha no alto do painel, e a linha escolhida em laranja |
| `spine/prints/skins_properties.png` | o botão de criar junto da lista, e não dentro de um menu |

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "a seção Peles **sai da Árvore**" | a seção Peles da Árvore não tinha só as peles: ela tinha, **aninhados sob cada uma**, todos os anexos do arquivo. Tirar a seção inteira tiraria a única porta para escolher um desenho pelo nome — o de uma pele desligada, por exemplo, que não está na cena para ser clicado | as **peles** saíram; os **anexos** ficaram, numa seção **Desenhos**, com o slot e a pele ao lado (`head · armadura`). Regra 9 do plano: nada some |
| 2 | "um texto de uma linha no topo da aba, **só quando há uma pele**" | lido ao pé da letra e aplicado: a frase fica enquanto há **uma** pele e sai na segunda | e é o certo pelo espaço: numa coluna de 260px a frase ocupa **três linhas**, e quem já tem duas roupas no personagem já sabe o que uma pele é. Regra do Humberto de 09/09/2026 sobre economizar espaço |
| 3 | "botões em cima, em ícone: Nova pele · Duplicar · Apagar" | feito. Duplicar e Apagar precisam saber **em qual** pele agir, e a aba não tem seleção própria | eles agem na pele **em laranja** — a do lápis, "Editar aqui". É a que a pessoa está olhando, e a dica de cada botão diz o nome dela |
| 4 | — | **renomear uma pele** não era só trocar o nome na lista: ele aparece no campo `skin` de cada linha de tempo de `deform` e `sequence` (§12.2). Trocar num e não no outro quebra a animação em silêncio | `RenameSkin` troca nos dois. O inverso é exato — renomear de volta —, então não há foto guardada |
| 5 | — | **apagar uma pele** deixava linhas de tempo apontando para um nome que não existe mais: o arquivo carrega e não desenha, e ninguém descobre por quê | `DeleteSkin` leva junto as linhas de tempo daquela pele, e guarda foto de `skins` e `animations` para desfazer devolver tudo |
| 6 | — | a aba nova entrou no menu **Janela** e o bloco de cima virou **7 itens**. A auditoria de menus do lote 19 recusa bloco de mais de seis, e o teste dela quebrou | o corte passou de 5/7 para **6/6**. O teste do lote 27 confere o limite de novo, para o próximo painel novo não repetir |
| 7 | — | dois painéis registravam a ação `nova-pele` (a Árvore e a aba nova), e o registro é por id: o último a montar ganhava | só a **aba** registra. O item Novo ▾ → Pele chama a mesma ação, que **traz a aba à frente** e cria. Regra 5 da casa |

**A cena não mudou:** 623 px · 69% nos dois modos. Console limpo, 61 quadros por
segundo no Chrome headless.

---

### Lote 28 → v5.1 · anotação 13, a aba Regras

**Prints usados:**

| Print | O que veio dele |
|:---|:---|
| `spine/prints/constraints_tree.png` | a lista com um **ícone por tipo** — é o que faz cinco linhas se lerem de relance |
| `spine/prints/ik_properties1.png` | a janela: rótulo à esquerda, valor à direita, uma linha por pergunta, a força numa barra |
| `spine/prints/transform_properties.png` e `path-constraint_properties.png` | as outras duas com cadeia; confirmam "Bones" e "Target" como duas linhas separadas |
| `spriter/prints/00-tela-do-humberto.png` | os ícones numa linha no alto do painel, e a linha escolhida realçada |

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "campo **Ossos da cadeia** (lista com caixas, **ordem editável**)" | uma lista com ordem editável precisa de arrastar linha dentro de um campo de propriedade — e a ordem que ela editaria é a que **já vem certa** do arquivo: no formato o pai vem sempre antes do filho (§4.1), então a ordem do arquivo **é** pai → filho | a cadeia usa o `checklist` que já existia (o da máscara), e ele grava na **ordem do arquivo**. Marcar de trás para frente deixa de ser um jeito de quebrar a IK sem perceber. A janela guiada faz o mesmo, e a dica dela diz que a ordem é posta sozinha |
| 2 | "nome de osso que não existe → a linha da aba fica vermelha" | feito, e mais: a regra **sem osso nenhum** também. Ela existe, não faz nada, e some da cena sem aviso — foi assim que uma IK mal criada passava despercebida | `ruleRows` devolve uma lista de problemas por regra, em português, e a linha fica em vermelho com o primeiro deles escrito embaixo do nome |
| 3 | "olho para ligar e desligar (`mix` 0 ↔ o valor guardado)" | o valor guardado tem de sobreviver **entre dois comandos**: desligar grava zero, e o comando de ligar é outro objeto, que já não vê o 0,4 de antes. Guardar no arquivo seria campo novo (regra 7 da casa) | uma memória de **sessão**, no módulo, por nome de regra. Regra que nasce desligada no arquivo volta em 1, que é o único palpite honesto. Um teste prova o 0,4 indo e voltando |
| 4 | "janela guiada em palavras simples, uma por tipo" | não havia janela com escolha, caixas e validação — só `askForm`, de campos de texto | nasceu `askGuided` no `ui/dialog.ts`, e ela não é só das regras: escolha, caixas de marcar, ligar/desligar, e um `validate` que **segura o botão**. A janela não fecha errada |
| 5 | "sai da Árvore como seção" | feito. A Árvore perdeu a última das quatro seções que ela tinha em setembro | o osso com regra ganhou a marca laranja, e um teste prova que o **alvo** não é marcado: ele não se mexe sozinho, ele é perseguido |
| 6 | — | a aba nova fez o menu Janela chegar a **treze** painéis, e o corte de 6/6 do lote 27 estourou de novo | o menu passou a ter **três blocos pelo que se está fazendo** — montar, animar, olhar. Cada um com no máximo cinco, e sobra folga para o próximo painel novo entrar sem obrigar a recortar tudo outra vez |
| 7 | — | `AddConstraint`, o do "Novo ▾ → Regra", continua adivinhando um osso e um alvo | ele **ficou**, e a janela guiada é um caminho novo (`AddGuidedRule`), que não adivinha nada. Tirar o antigo quebraria o item do menu sem ninguém pedir; o que ele cria agora aparece na aba com o problema escrito, e conserta-se ali |

**Conferido no navegador, com o `heroi.bone`:** a janela recusou o alvo `shin`
com a cadeia `leg, shin` (*"o alvo não pode ser um dos ossos que dobram"*, botão
cinza), aceitou o alvo `foot`, e a regra nasceu com **`leg → shin → foot`** — a
IK de dois ossos que a tela não fazia. O rodapé do Posar apareceu com a
ferramenta na mão.

**A cena não mudou:** 623 px · 69% nos dois modos. Console limpo, 61 quadros por
segundo no Chrome headless.

---

### Lote 29 → v5.2 · anotação 15, as funções escondidas

**O achado do lote, e ele muda o desenho do teste.** A varredura procurava
funções que faltassem num menu. **Não havia nenhuma.** Rodando a conta contra o
código, das 65 ações registradas só **uma** não tinha porta — e era a
`nova-regra-guiada`, que eu tinha acabado de criar no lote 28.

As dez da anotação eram outra coisa: **gestos sem ação nenhuma**. `Alt` + clique
na régua, `M` com o foco na faixa, botão direito no losango, `Ctrl` + arrastar
no Criar osso. Não havia o que pôr num menu, porque não havia função — havia um
`if` no meio de um manipulador de evento. O trabalho do lote foi **criar as
ações** e dar porta a elas.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `hiddenFunctions(menus, toolbar, contextMenus)` lista o que não aparece | a lista das ações **registradas** não existe em lugar nenhum: elas nascem em `mount()`, que precisa de DOM, e há três formas de registrar (`registerAction`, o `add` do shell, e nomes montados por template) | o teste lê a lista do **código-fonte**, com duas expressões, e passa para a função pura. Ela não pode envelhecer: ação nova sem porta reprova no mesmo dia |
| 2 | — | as cinco `nova-regra-<tipo>` ficaram **sem porta** depois do item k, e é de propósito: elas continuam existindo para os testes e para a importação | nasceu a lista `EXEMPT`, e **cada linha carrega o motivo escrito**. Sem o motivo, uma lista de exceções cresce até a auditoria não provar mais nada |
| 3 | item g: "menu Animação → Curva da chave" | os quatro itens **já existiam** no menu, e estavam **cinzas desde o lote 12**, esperando um lote que passou há três semanas. O botão direito no losango faz isso desde então, e ninguém ligou o menu | ligados, com as ações do painel. O nome mudou de "Interpolação" para **"Curva da chave"**, que diz de que chave se fala |
| 4 | item f: "botão direito no desenho, **na cena** e na Árvore" | o botão direito **na cena já tem dono**: ele volta à ferramenta anterior, desde o lote 13. Pôr um menu ali tiraria um gesto para dar outro | feito **na Árvore**. Na cena, o gesto de voltar ficou — e ganhou a linha de rodapé na primeira vez, que é a outra metade da anotação. Escrito aqui para não ser "esquecido" |
| 5 | item e: "com P apertado, o cursor muda e os candidatos ganham contorno laranja" | feito o que resolve o problema: **o item do menu abre a lista**, com busca. O contorno laranja é desenho de cena, e é enfeite de um caminho que continua existindo | a lista entrou; o contorno **não**. Um osso pequeno atrás de um desenho continua difícil de acertar mesmo contornado, e a lista resolve isso de vez. Fica anotado como não feito |
| 6 | "cada linha vira um item do lote 19" | o lote 19 fechou em setembro | viraram o lote 29 |
| 7 | — | a barra de ações ganhou um **grupo novo**, `exibir`, com a imagem de referência. Ela era o único botão sem grupo onde caber | grupo com um item só, e o nome já diz onde os próximos vão |

**Conferido no navegador:** os três botões do canto da régua com as dicas
certas, o menu do botão direito da Árvore com "Virar filho de… · Substituir
nomes… · Renomear", a aba **Malha e pesos** na tira mesmo sem a ferramenta, e o
botão da imagem de referência na barra.

**A cena não mudou:** 623 px · 69% nos dois modos. Console limpo, 61 quadros por
segundo no Chrome headless.

---

---

## Decisões para o Humberto

Tomei estas por conta. Uma palavra e o executor troca.

| # | O que decidi | A outra opção |
|:---:|:---|:---|
| 1 | **Linha do tempo nasce fechada**, três linhas | nasce aberta como hoje e só lembra se fechar |
| 2 | **Tema escuro é o padrão** | claro por padrão, escuro no menu |
| 3 | **Árvore e Propriedades à esquerda**, Imagens e Animações à direita, como no Spriter | tudo à direita, e só Imagens à esquerda |
| 4 | **Ver e Travar em texto**, laranja, como no Spriter; o resto da barra em ícone | os quatro também em ícone |
| 5 | **Régua do tempo em segundos e quadros** | milissegundos como no Spriter. O formato grava segundos; ms seria só conta na tela. Dá para pôr como opção depois |

---

## O que fica para a rodada 4, de propósito

| O que | Por quê |
|:---|:---|
| Barras de rolagem na cena | cena infinita; Espaço + arrastar já move |
| Alt + arrastar cria osso em qualquer ferramenta (Spriter) | colide com Alt+arrastar nosso (rodada 2, item 68). Precisa decisão de tecla |
| Sub-entidade pela tela (Novo → Esqueleto no slot) | é o passo 5 do lote de runtime do socket, `ESTADO.md` |
| Refazer as imagens do manual inteiro no tema escuro | um lote só de imagens, depois que a tela parar de mudar |
| Régua do tempo em ms | opção; decisão 5 |
| Atalhos remapeáveis | primeiro a tabela de atalhos, do projeto do menu |

---

## Ordem de trabalho para o executor

1. Ler `CLAUDE.md`, `editor/src/contract.ts` inteiro, e este plano.
2. Um lote por versão, na ordem 14 → 22. Backup antes. Testes, `tsc`, conformidade, versão.
3. Cada lote fecha com uma imagem nova em `documentos/manual/imagens/`, tirada do editor rodando em 1440×900, e o console limpo.
4. Nos lotes 14, 16 e 17, escrever em Desvios o número medido: fração da cena na altura e na largura.
5. Item que não bater com o código: parar, escrever em **Desvios**, seguir para o próximo item do lote.
6. Precisou de runtime, ferramentas, formato ou conformidade: chamar a sessão que construiu o Recorte. Este plano não pede nada disso; se pedir, é desvio.

---

## Anotações do Humberto — o que ele pediu usando o programa

Ele usa o editor entre um lote e outro e aponta. Cada pedido entra aqui no dia,
nas palavras dele, com o lote que fecha. **O executor lê esta tabela antes de
começar cada lote.** O que já foi feito fica marcado.

**Fechado em 09/09/2026, v5.2: as dezesseis anotações estão feitas** (lotes 14, 23 a 29). O que vier depois abre uma tabela nova, "Anotações da rodada 4".

**Numeração, a partir de 09/09 à noite.** A rodada 3 fechou na v4.5. As anotações
saem em lotes próprios, numerados a partir do 23, e a coluna "Lote" desta tabela
usa **esse** número, o livre no `backup/INDICE.md` na hora de escrever. Os blocos
abaixo que ainda dizem "lote 15, 16, 17, 19" nas frases falam do lote da rodada 3
onde a função nasceu; o lote que fecha a anotação é o da tabela.

| # | Data | Pedido | Lote |
|:---:|:---|:---|:---:|
| 1 | 09/09 | tirar "quadro N" da régua | 14, **feito** |
| 2 | 09/09 | interruptor **Montagem / Animando** na barra, como o Spine | 23, **feito** |
| 3 | 09/09 | a dica do **⋯ Mais** está incompleta: não fala de "No fim" nem de "Mostrar só os escolhidos" | 24, **feito** |
| 4 | 09/09 | **"Não quero que a linha do tempo fique abrindo. Se ela está fechada, não devia abrir do nada."** | 24, **feito** |
| 5 | 09/09 | **"Muda isso de lugar, não faz sentido tá aí"**: a Prévia sai da faixa de baixo e vai para a coluna da direita, aba ao lado de Imagens · Exibição | 25, **feito** |
| 6 | 09/09 | **"Quando dou play e mudo de animação, ele não troca a animação automaticamente."** | 24, **feito** |
| 7 | 09/09 | **"Não sei qual é o quadro que eu estou mexendo. Podia estar escrito na barra."** O tempo e o quadro atual escritos **na própria régua**, em cima da agulha | 24, **feito** |
| 8 | 09/09 | **"Ordem é de cima pra baixo, e você ainda colocou um texto kkkk. Muda isso."** Na aba Ordem, o de cima da lista fica **na frente**, como no Spriter. E a frase explicativa sai | 25, **feito** |
| 9 | 09/09 | **"O que é isso?"** apontando `hitbox`, `hand_point`, `cape_path` na aba Ordem, com miniatura vazia. Caixa, Ponto e Caminho não são desenhos: **saem da aba Ordem** | 25, **feito** |
| 10 | 09/09 | **"Isso é ordem Z? O ícone ficou fora do padrão. Tentei usar, não entendi."** É Inclinar (tecla Z), sem ícone, fora de ordem. Ordem: Mover · Girar · Escalar · Inclinar. Ícone de Escalar como ele desenhou: **L com seta nas duas pontas** | 26, **feito** |
| 11 | 09/09 | **"Deixar criar pastas para guardar imagens na Ordem. Eu poderia pôr as peças da capa dentro de uma pasta e mover todas de uma vez."** | 25, **feito** |
| 12 | 09/09 | **"Não sei onde estão as skins e como faço para usar."** Hoje a pele está em três lugares: seção Peles na Árvore, caixas Mostrar / Editar aqui no painel Exibição, botão Pele no Novo. Ninguém acha. Vira **uma aba só: Peles**, na coluna da direita, como o botão Char Maps do Spriter | 27, **feito** |
| 13 | 09/09 | **"Entendi as 5 regras. Mas não sei como usar, e está escondido."** Pior: pela tela hoje **não dá** para montar uma regra de IK de dois ossos, a do próprio manual. Criar grava um osso só; Propriedades não tem o campo da cadeia; o alvo é escolhido sozinho, sem perguntar | 28, **feito** |
| 14 | 09/09 | **"Quando clico numa animação sem laço, ela roda uma vez. Deveria rodar sempre enquanto o play estiver ligado, sem fazer loop."** O tocador do editor repete sempre. O `repete` da lista é o que o **jogo** faz, não o tocador | 25, **feito** |
| 15 | 09/09 | **"Aproveite e veja se tem outras funções extremamente importantes escondidas."** Varredura feita no código inteiro: 10 achadas. Lista e o que fazer com cada uma abaixo | 29, **feito** |
| 16 | 09/09 | **"Quando tiver uma animação rodando, quero poder clicar em outra e ela tocar. Atualmente isso está travado."** Repetiu a 6 depois da v4.8: o `switchAnimation` está certo, mas **o clique não chega**. Causa provável: o painel Animações refaz a lista inteira a cada `refresh`, e tocando o tempo muda a cada quadro; o botão em que o mouse desceu já não existe quando ele sobe, e o `click` não dispara | 26, **feito** |

### O que cada anotação pede, por lote

#### Lote 24, feito (anotações 3, 4, 6, 7) — feito como **lote 24 → v4.7**, ver Desvios

**Anotação 4 — a faixa não abre sozinha.** Onde o código abre hoje sem pedir:

| Onde | O que faz | O que fica |
|:---|:---|:---|
| `ui/shell.ts`, `showDockPanel` | pedir Curvas ou Prévia com a faixa fechada abre a faixa | Curvas pelo menu Janela pode abrir: é gesto do Humberto. Qualquer outro caminho, não |
| `ui/shell.ts`, fim de `mount` | chama `showDockPanel(activeDock)` na partida; aba lembrada Curvas → abre sozinha | na partida a faixa nasce como `dock.open` gravado. Fechada, a aba ativa volta a Linha do tempo. Nada abre |
| `panels/dock-model.ts`, `OPEN_AT = CLOSED_HEIGHT + 40` | esbarrar na alça 40 px abre | só abre quando puxada até `OPEN_MIN`. `dockFromDrag(fechada, CLOSED_HEIGHT + 100)` continua fechada |

**Anotação 6 — trocar de animação tocando.** `transport.tick` já lê `doc.animation` a cada quadro; algo no caminho de `doc.animation = name` (`panels/animations.ts`) para o tocador ou congela a agulha. Achar o ponto e escrever em Desvios. Regra: **tocando + clicar em outra animação = continua tocando a nova, do tempo 0**. Parado + clicar = parado, tempo 0.
Teste: `play`, `doc.animation = 'walk'`, dois `tick` → `isPlaying()` é `true` e `doc.time` andou; `pause`, trocar → `isPlaying()` é `false`, `doc.time` é `0`.

**Anotação 7 — onde está a agulha.** Vale com a faixa fechada também:
- a **agulha** fica grossa e vermelha, da régua até o fim do Resumo, com uma **bandeirinha na régua** escrita com o tempo e o quadro: `0,02 s · q 1`;
- o campo de tempo do tocador ganha fundo laranja quando a agulha está **em cima de uma chave** (o semáforo do lote 3a já sabe).
Teste puro: `playheadLabel(0.02, 30)` → `'0,02 s · q 1'`; `playheadLabel(1, 30)` → `'1,00 s · q 30'`; agulha em cima de chave → `onKey: true`.

**Anotação 3 — dica do ⋯ Mais.** Passa a listar tudo o que tem dentro: "No fim, esticar, espelhar, fechar ciclo, pares de nome, mostrar só os escolhidos, tirar trecho de laço".

**Anotação 14 — o tocador repete sempre.** Hoje o modo de fim padrão é "Como o arquivo diz": animação sem `loop` toca uma vez e para. O Humberto quer o tocador andando enquanto o play estiver ligado.
- Padrão do tocador passa a **Repetir**, sempre, independente do `animation.loop` do arquivo. Nenhum campo do arquivo muda: `loop` continua sendo o que o jogo lê, e o selo `repete` da lista de Animações continua mostrando isso.
- O modo "Como o arquivo diz" **continua existindo** no ⋯ Mais, para quem quer ver o que o jogo vai fazer. Só deixa de ser o padrão.
- Ao trocar de animação tocando (anotação 6), o modo de fim não muda.
- Teste: `attack` (sem `loop`) tocando 2 s → `isPlaying()` é `true` e `doc.time` voltou ao começo pelo menos uma vez; `defaultEndMode` é `'repetir'`; escolher "Como o arquivo diz" → `attack` para em `0.6`.

#### Lote 25 (anotações 5, 8, 9, 11, 14) — **feito**, v4.8, ver Desvios

**Anotação 5 — Prévia na coluna da direita.**
- `DEFAULT_GROUPS` da direita passa a `[['imagens', 'exibicao', 'previa'], ['animacoes', 'historico', 'malha']]`.
- `DOCK_PANELS` fica só com `linha-do-tempo` e `curvas`. A Prévia volta a ser painel de coluna, como era antes do lote 12. O desvio 1 do lote 12 a mandou para baixo; a decisão do Humberto agora é a contrária, e fica escrita em Desvios.
- A telinha desenha na largura da coluna; **Tela cheia**, que já existe, cobre quem quer ver grande.
- Migração: estado gravado com `previa` na faixa → primeiro grupo da direita, sem estourar; faixa ativa volta a `linha-do-tempo`.
- Manual: capítulo 03, "Prévia", aponta para a coluna. Imagem nova.

**Anotação 8 — Ordem de ponta-cabeça.**
- A lista mostra `file.slots` **invertido**: o último do array, desenhado por último, fica em cima. Spriter, Spine e todo programa de camadas fazem assim.
- A frase "De cima para baixo: o de cima é desenhado primeiro e fica ATRÁS" **sai**. Nenhum texto no lugar.
- Arrastar para cima = trazer para a frente. Ctrl+↑ = frente. Ctrl+↓ = atrás. O mesmo `Command`; só a conta do índice inverte.
- Teste: primeira linha é `file.slots[file.slots.length - 1].name`; Ctrl+↑ na segunda linha → vira a primeira **e** vira o último do array; nenhum elemento com o texto antigo.

**Anotação 9 — Ordem só lista desenhos.**
- Entra só o slot cujo anexo atual é `region`, `mesh`, `linkedmesh` ou `skeleton`. Fica de fora `boundingbox`, `point`, `path` e `clipping`.
- Slot com desenho só em outra pele entra com miniatura vazia e nome em cinza: esse tem ordem, só não tem imagem agora.
- Caixa, Ponto e Caminho continuam na **Árvore**, onde já têm seção.
- Teste: a lista do `heroi.bone` não contém `hitbox`, `hand_point`, `cape_path`; contém `hand`.

**Anotação 11 — pastas na aba Ordem.**
- O formato **já tem** `slot.folder` (§4.3): o importador de PSD grava o grupo do Photoshop nele, e `npm run fatiar` corta por pasta. Nenhum campo novo. O que falta é a tela.
- Na aba Ordem, slots com a mesma `folder` aparecem **dentro de uma pasta dobrável**, com o nome dela, uma miniatura da primeira peça e a contagem. Pasta fechada ocupa uma linha.
- **Arrastar a pasta** move todas as peças de uma vez, mantendo a ordem interna. Ctrl+↑ / Ctrl+↓ na pasta também. É um `Command` só, "Mover pasta", com `apply` e `revert` exatos: desfazer devolve tudo em um passo.
- **Nova pasta**: escolher duas ou mais peças, botão direito → "Pôr numa pasta…", pede o nome. Grava `folder` em cada uma. As peças ficam **contíguas** na ordem de desenho: quem estava longe é puxado para junto da primeira, e a janela avisa quantas mudaram de lugar.
- **Tirar da pasta**: botão direito → "Tirar da pasta". Apaga `folder`. A ordem não muda.
- Renomear a pasta: duplo clique no nome. Grava em todas as peças.
- Regra do formato que a tela respeita: `folder` é só agrupamento; **a ordem de desenho continua sendo o array** `slots`. Uma pasta com peça intercalada de fora (`capa/a`, `hair`, `capa/b`) é mostrada **quebrada em duas**, com aviso, e "Juntar" arruma.
- A Árvore continua mostrando as pastas como hoje mostra os grupos do PSD.
- Teste: `heroi.bone` com `cape_upper` e `cape_lower` em `folder: 'capa'` → a lista tem uma pasta `capa` com 2; mover a pasta um passo para a frente → os dois índices andam e a diferença entre eles não muda; `revert` devolve o array igual, texto contra texto; "Pôr numa pasta" com `hair` e `arm_back` → os dois ganham `folder`, ficam vizinhos, e o aviso diz `1 peça mudou de lugar`.

#### Lote 27, feito (anotação 12); lote 28 (anotação 13); lote 29 (anotação 15)

**Anotação 12 — aba Peles.** Um lugar só para tudo de pele, na coluna da direita, aba ao lado de Animações · Histórico:

| Linha por pele | O que tem |
|:---|:---|
| olho | **Mostrar**: desenha na cena. Várias ligadas se empilham, a de cima cobre |
| lápis | **Editar aqui**: onde um anexo novo nasce. Só uma por vez, destacada em laranja |
| nome | duplo clique renomeia |
| contagem | quantos slots a pele veste |

Botões em cima, em ícone: **Nova pele** · **Duplicar** · **Apagar**. A seção "Peles" **sai da Árvore** e as duas caixas **saem do painel Exibição**: são a mesma função, chamada de um lugar só (regra 5). O botão "Pele" do Novo ▾ da Árvore aponta para a aba.

Um texto de uma linha no topo da aba, só quando há uma pele: "Pele é uma roupa. O esqueleto é o mesmo, só o desenho muda. Nova pele para criar outra."

Teste: `heroi.bone` → 3 linhas (`default`, `armadura`, `armadura_capa`), contagens 23, 3 e o que o arquivo disser; ligar Mostrar em duas → `visibleSkins` tem as duas na ordem em que foram ligadas; Editar aqui só aceita uma; a Árvore não tem mais seção `skins`; o painel Exibição não tem mais a lista.

**Anotação 13 — as regras.** O que a varredura achou (`tree-model.ts`, `buildConstraint`; `properties-model.ts`, campos da regra):

| Hoje | Problema |
|:---|:---|
| Novo → Regra → tipo grava `bones: [primeiro osso escolhido]` | cadeia de **um** osso, mesmo com dois escolhidos. IK de perna não dobra |
| `target` é "o primeiro osso do arquivo fora da cadeia" | ninguém perguntou. Pode cair num osso sem relação |
| Propriedades da regra: Nome, Força, Alvo, Dobra, Encolhe, Estica, Suavidade | **não tem o campo da cadeia** (`bones`). Não dá para pôr o segundo osso depois |
| alvo igual a um osso da cadeia | nada impede; o manual diz que não pode |
| alça da regra na cena só aparece se alvo e ossos existem | se um nome estiver errado, some sem aviso |
| ferramenta **Posar** (B) dobra a perna arrastando | **não cria regra nenhuma.** Escreve rotações. Ninguém diz isso na tela |

O que fica:
- **Aba Regras** na coluna da direita, ao lado de Peles: uma linha por regra, ícone do tipo, nome, alvo, Força como barra, olho para ligar e desligar (`mix` 0 ↔ o valor guardado, sem apagar). Sai da Árvore como seção; a Árvore ganha um ícone pequeno ao lado do osso que tem regra.
- **Nova regra é uma janela guiada**, em palavras simples, uma por tipo. IK: "Que ossos dobram? (escolha 1 ou 2, na ordem pai → filho)" · "Que osso eles perseguem?" · "Dobra para que lado?". Transformação: "Quem copia?" · "Copia de quem?" · "Quanto?". Caminho: "Que ossos deslizam?" · "Por qual caminho?". Física: "Que osso balança?" · gravidade e vento com barras. Comando: "Que parâmetro?" · "Mexe em quê?". Cada janela tem **uma frase** dizendo o que a regra faz e o exemplo do herói.
- Propriedades ganha o campo **Ossos da cadeia** (lista com caixas, ordem editável) para os três tipos que têm cadeia. O `bones` grava a ordem da lista.
- Validação com palavra: alvo dentro da cadeia → a janela não fecha e diz "O alvo não pode ser um dos ossos que dobram". Nome de osso que não existe → a linha da aba fica vermelha com "osso `x` não existe".
- Rodapé ao ligar a ferramenta Posar: "Posar dobra a cadeia agora, sem criar regra. Para o jogo dobrar sozinho, crie uma regra de IK."
- Nenhum campo novo no formato: `bones`, `target`, `mix` e os demais já existem (§4.5).
- Teste: janela de IK com `leg` e `shin` e alvo `foot_target` → `constraints[n].bones` é `['leg', 'shin']`, `target` é `'foot_target'`; alvo `shin` → erro com "não pode"; lista da aba do `heroi.bone` tem 5 linhas com os tipos certos; olho fechado em `hair_physics` → `mix` 0 e o valor antigo volta ao reabrir; `revert` devolve o arquivo igual.

**Anotação 15 — as dez funções escondidas, e o que fazer.** Varredura em `menus.ts`, `actions.ts`, `shell.ts`, `viewport/tools/*`, `dopesheet.ts`, `tree.ts`, `properties-model.ts`. Cada linha vira um item do lote 19; onde diz "já", outra anotação cobre.

| # | Escondida | Onde só existe hoje | O que fica |
|:---:|:---|:---|:---|
| a | **Marcar o trecho de laço** | Alt+clique esquerdo e direito na régua. Só "Tirar" tem botão | dois botões pequenos na régua, ao lado da cebola: **Início do trecho** · **Fim do trecho**, ícone de colchete. Botão direito na régua também oferece os dois |
| b | **Marcas** (M, Ctrl+↑/↓, duplo clique renomeia com `prompt` do navegador) | tecla com foco na faixa; nada em menu | botão **Marca** na régua; menu Animação → Marcas ▸ Nova · Anterior · Próxima; renomear na nossa janela, não no `prompt` |
| c | **Cadeia da regra de IK** | não existe | anotação 13 |
| d | **Ctrl+arrastar** (cria osso já preso aos desenhos) e **Alt+arrastar** (redesenha o osso) em Criar osso | só no comentário do código | rodapé ao ligar Criar osso: "Arraste para criar. Ctrl: já prende os desenhos escolhidos. Alt sobre um osso: redesenha sem mover os filhos." Dica do botão igual |
| e | **Virar filho (P)** | modo mira só avisado no rodapé; o item do menu exige o mesmo clique | com P apertado, o cursor muda e os candidatos a pai ganham contorno laranja; o item do menu abre uma lista de ossos para escolher o pai **sem** clicar na cena |
| f | **Copiar e colar âncora** | só menu Editar, palavra "âncora" | botão direito no desenho, na cena e na Árvore: "Copiar posição no osso" · "Colar posição no osso". A palavra âncora sai da tela; fica no manual como sinônimo |
| g | **Botão direito no losango** (interpolação) e **duplo clique** (apaga) | nenhuma pista | dica ao passar o mouse no losango: "Botão direito: curva · Duplo clique: apagar". Menu Animação → Curva da chave ▸ Linear · Suave · Parada |
| h | **Peles** | painel Exibição | anotação 12 |
| i | **Substituir nomes** | só menu Editar | também no botão direito da Árvore, em qualquer linha |
| k | **Novo ▾ → Regra** e **Esqueleto → Novo → Regra** ainda criam **adivinhando** (um osso, alvo qualquer) | `AddConstraint` de antes do lote 28 | os dois itens passam a abrir a **mesma janela guiada** da aba Regras (`askGuided`). Ninguém mais cria regra às cegas. `AddConstraint` continua existindo para os testes e para a importação |
| j | **Aba Malha e pesos** | só aparece com a ferramenta Malha ou Pesos na mão | a aba fica **sempre**; sem a ferramenta, mostra uma frase: "Escolha a ferramenta Malha (M) ou Pesos (G) para editar" |

Mais três, menores, da mesma varredura: **Shift+Delete** (apaga as linhas inteiras) ganha a tecla escrita ao lado do item do menu; **botão direito na cena** (volta à ferramenta anterior) ganha uma linha no rodapé na primeira vez que se usa; **Imagem de referência** ganha um botão na barra de ações, grupo Exibir.

Teste: uma função pura `hiddenFunctions(menus, toolbar, contextMenus)` lista toda ação registrada em `actions.ts` que não aparece em menu, barra ou botão direito. O teste espera **lista vazia**, e escreve qual ação sobrou quando falha. É o mesmo desenho do `auditMenus` deste lote.

#### Lote 26 (anotações 10 e 16) — **feito**, v4.9, ver Desvios; a 2 saiu no lote 23

**Anotação 16 — o clique na lista de animações tocando.** Conferir primeiro a causa: com `idle` tocando, `mousedown` num `.anim-item`, e ver se o elemento ainda está no DOM no `mouseup`. Se não estiver, é isto.
- O painel Animações **não refaz a lista quando só o tempo mudou**. `refresh(change)` olha o tipo da mudança: tempo → nada; animação aberta mudou → só troca o `aria-selected` das linhas; estrutura (nova, apagada, renomeada, duração) → refaz.
- Mesma regra para a **Árvore**, a **Ordem**, as **Imagens** e o **Histórico**: nenhum painel de lista refaz o DOM por mudança de tempo. Uma função pura `needsRedraw(change, panel)` decide, e o teste a cobre para cada painel.
- Enquanto o botão em que o mouse desceu existir, o clique chega. Não trocar `click` por `mousedown`: isso esconderia a causa e quebraria o arrasto que a Árvore já tem.
- Teste: 60 mudanças de tempo seguidas → a lista de Animações tem **os mesmos** nós de antes (`isSameNode`); `doc.animation = 'walk'` → só `aria-selected` muda, nós iguais; `AddAnimation` → nós novos. Conferência sem cabeça: tocar `idle`, clicar em `walk` → `doc.animation === 'walk'` e `isPlaying()`.

**Anotação 2** já está na seção "O interruptor de modo", corrigida: trocar de modo **não mexe na faixa**.

**Anotação 10 — Inclinar e Escalar.**
- **Ordem**: Escolher · Mover · Girar · **Escalar** · **Inclinar**. Hoje `shear` se registra antes de `scale` e a barra segue a ordem de registro. Trocar a ordem de registro, ou dar um `order` às ferramentas: o executor escolhe e escreve em Desvios.
- **Ícone de Inclinar**: retângulo virando paralelogramo, o topo deslocado para a direita. Entra em `icons.ts` como `shear`. **Nunca a letra Z**: ele leu como "ordem Z".
- **Ícone de Escalar** como ele desenhou: **L com seta nas duas pontas**, uma para cima e uma para a direita, saindo do mesmo canto. O de hoje ele leu como inclinar.
- **Sem osso escolhido**, Inclinar não faz nada e não diz nada (desvio 6 do lote 13). Passa a dizer no rodapé: "Inclinar: escolha um osso e arraste. O topo anda, a base fica." A dica do botão diz o mesmo.
- Teste: `toolbarItems()` tem `scale` antes de `shear`; `hasIcon('shear')`; nenhum botão com `icon: ''`; rodapé com Inclinar e sem osso contém "escolha um osso".

---

## Anotações da rodada 4

Pedidos do Humberto depois da v5.2. Mesma regra: nas palavras dele, com o lote que fecha.

| # | Data | Pedido | Lote |
|:---:|:---|:---|:---:|
| 17 | 09/09 | **"Eu pedi para que o pai pegasse os filhos: você seleciona o pai e depois seleciona os filhos, como no Spriter."** Hoje o `P` é do Spine: escolhe os filhos, aperta P, clica no pai. Ele quer o **B do Spriter**: escolhe o pai, segura a tecla, clica em cada filho; cada clique prende um. Solta a tecla, acabou. A lista com busca do lote 29 fica como segundo caminho | 31, **feito** |

| 18 | 09/09 | **"O que é isso?"** apontando `hand` e `weapon` na aba Ordem, com miniatura vazia. São dois tipos de desenho que a miniatura não sabe recortar: `hand` é uma **sequência** (`path: "hand_"`, quadros `hand_01..03`) e `weapon` é um **esqueleto filho** (`espada.bone`). O nome não está no atlas, o recorte devolve nulo, a caixa fica vazia sem explicar | 32, **feito** |

| 19 | 09/09 | **Trocar de pai mexe o desenho na tela.** Achado do executor no lote 31: reparentar guarda a pose **local**, então o filho pula de lugar. É de sempre, nos três caminhos, e o gesto novo pôs à vista. Spriter e Spine guardam a pose de **mundo**: o filho fica onde está | 34, **feito** |
| 20 | 09/09 | **A tecla fura o modo.** Em Animando os botões de estrutura somem, mas `N` põe Criar osso na mão e cria osso com a animação aberta. `toolForKey` não olha `tool.modes` | 33, **feito** |
| 21 | 09/09 | **Texto quebrado** na janela Exportar imagem: "AnimaÃ§Ã£o", "RepetiÃ§Ãµes do GIF". Cinco frases em `export-image.ts`, mais em `ferramentas/src/exportar/quadros.ts` | 33, **feito** |
| 22 | 09/09 | **Dez itens de menu cinzas para sempre**, prometendo lotes que já passaram (`soon()` em `menus.ts`) | 33, **feito** |
| 23 | 09/09 | **Arrastar um arquivo da área de trabalho para a janela não faz nada.** Primeiro gesto de quem chega de outro programa | 36, **feito** |
| 24 | 09/09 | **Documento novo não diz o que fazer**: grade vazia, nenhum convite. E não há `.psd` de exemplo no projeto: o passo 1 do manual não é percorrível | 36, **feito** |
| 25 | 09/09 | **Aba Ordem tem zero botões**: só arrasto ou Ctrl+↑/↓, escrito só na dica | 35, **feito** |
| 26 | 09/09 | **Não há duplicar osso, slot ou membro.** Copiar e Colar são só de chaves; Duplicar só existe para animação e pele | 37, **feito** |
| 27 | 09/09 | **`hidden` que não esconde, pela quarta vez** (lotes 14, 16, 19, 30, 37): `[hidden]{display:none}` é do navegador e um `display:flex` de autor passa por cima. Cada vez foi achado olhando a tela. Precisa de uma regra que pegue a quinta antes de nascer | 38, **feito** |

**Anotação 27 — acabar com a família do `hidden`.** Uma regra só no CSS da casa: `[hidden] { display: none !important }` no `shell.css`, no topo, para valer sobre qualquer `display` de autor. E um teste que varre todo `.css` de `editor/src` e recusa seletor `[hidden]` com `display` diferente de `none`: se a regra geral existe, nenhum outro é necessário. Depois de entrar, os quatro consertos locais podem sair. Lote pequeno, próximo livre.

As linhas 19 a 26 vêm da lista **"O básico que falta"**, que o executor levantou percorrendo o capítulo 00 do manual no editor rodando (Desvios do `PLANO lote 30 - o manual`). Nada foi consertado no lote 30; os lotes 33 a 37 fecham uma a uma.

### Lotes 33 a 37 — o básico

#### Lote 33 — três consertos pequenos (anotações 20, 21, 22)

- **20.** `toolForKey(key, mode)` recusa ferramenta cujo `modes` não inclui o modo. Em Animando, `N`, `O`, `X`, `M`, `G` não fazem nada e o rodapé diz "Criar osso é da Montagem. Ctrl+Tab troca." Teste: `toolForKey('n', 'animando')` é `null`; a barra e a tecla concordam para as dez ferramentas nos dois modos.
- **21.** Consertar as frases. Teste que **recusa `Ã` e `Â` em qualquer `.ts` do projeto**: é o rastro de UTF-8 lido como Latin-1, e nunca é texto legítimo em português.
- **22.** Regra: **nenhum item de menu fica cinza para sempre.** Ou funciona, ou sai. Os dez: Abrir recente (lista dos últimos 5, `RECORTE_prefs`) · Selecionar tudo `Ctrl+A` · Buscar na Árvore `Ctrl+F` (o botão de busca já existe desde o lote 19: ligar) · Selecionar todas as chaves · Chave anterior / seguinte (já existem em `↑ ↓`: ligar) · Tocar para trás (o tocador já anda em `direction: -1`: ligar) · Sair (fecha a aba com o aviso de arquivo sujo) · Novo → Imagem no slot (abre a aba Imagens com a busca no foco; o arrasto já cria) · **Novo → Esqueleto filho: sai do menu** até o runtime do socket, com uma linha em `MOVED_OUT` dizendo por quê. Teste: `auditMenus` passa a recusar item com `soon()`; a lista `EXEMPT` vazia.

#### Lote 34 — trocar de pai não move nada (anotação 19)

- Ao reparentar, osso ou desenho, a pose de **mundo** é preservada: a nova pose local é `L' = P'⁻¹ · W`, onde `W` é a matriz de mundo de antes e `P'` a do novo pai. É a mesma conta do Compensar do lote 6 (`F = B'⁻¹·B`); reaproveitar.
- Vale para os três caminhos: P segurado, arrasto na Árvore, campo Osso em Propriedades. Um `Command` só, `Reparent`, com `apply` e `revert` exatos, usado pelos três. Hoje são três códigos.
- Em Animando: reparentar é mudança de estrutura, vale para a pose de repouso; a tela avisa "Estrutura muda na Montagem" e troca de modo antes, como o Spine faz.
- Teste: `arm` sob `torso`, mundo `(120, 80, 30°)`; reparentar para `hips` → mundo igual até 1e-6, local diferente; `revert` devolve o local antigo; desenho `sword` de `hand` para `forearm` → cantos no mundo iguais até 1e-6.

#### Lote 35 — a aba Ordem ganha botões (anotação 25)

Uma linha de ícones no alto da aba, como o Z-order do Spriter (print `06-ordem-z_203.jpg`): **Trazer para a frente** (Ctrl+↑) · **Mandar para trás** (Ctrl+↓) · **Frente de tudo** (Ctrl+Shift+↑) · **Fundo de tudo** (Ctrl+Shift+↓) · **Nova pasta** · **Tirar da pasta**. Cinza sem seleção. Chamam as ações que já existem; as duas "de tudo" nascem em `actions.ts` e entram no menu Esqueleto. Teste: seis botões com `hasIcon` e `label`; "Frente de tudo" em `cape_upper` → último do array; um passo de desfazer.

#### Lote 36 — chegar no programa (anotações 23, 24)

- **Soltar arquivo na janela** faz o que Arquivo → Abrir / Importar faria: `.bone`, `.boneb`, `.bonez` abrem; `.psd`, `.psb` importam; `.scml`, `.json` (Spine, DragonBones) importam pelo detector de conteúdo que já existe; `.png` e `.jpg` vão para o atlas e aparecem na aba Imagens. Arquivo sujo pergunta antes. Vários arquivos: um `.bone` e imagens juntas viram um projeto. `dragover` mostra uma faixa "Solte para abrir".
- **Documento novo** mostra, no meio da cena vazia, três botões grandes em ícone com nome: **Importar PSD** · **Abrir o herói** (o exemplo) · **Começar vazio**. Somem no primeiro osso ou imagem. É a tela de boas-vindas que a rodada 2 deixou para depois (item 107).
- **`.psd` de exemplo**: `formato/exemplos/heroi/heroi.psd`, gerado do atlas do herói por `ferramentas/` (o importador já lê PSD; nasce o inverso, `montar-psd.mjs`, uma camada por região, grupos pelas pastas de slot). É o arquivo que o capítulo 00 abre. Listado no `leiame.md` dos exemplos.
- Teste: `dropPlan(files)` puro classifica `[heroi.bone, atlas.png]` → `{ abrir: heroi.bone, imagens: [atlas.png] }`, `[x.psd]` → `{ importar: 'psd' }`, `[a.bone, b.bone]` → erro "um esqueleto por vez"; o `.psd` gerado passa pelo importador e devolve os mesmos slots do herói, nas mesmas posições até 1 px.

#### Lote 37 — duplicar (anotação 26)

- **Duplicar** (`Ctrl+D`) para osso, slot e desenho escolhidos. Osso duplica **com os filhos e os desenhos deles** (o membro inteiro); nomes ganham `_2`, `_3`; regras que apontavam para o original **não** são duplicadas nem redirecionadas, e a tela diz quantas ficaram de fora. O duplicado nasce **deslocado 20 px** para a direita, para não ficar em cima do original, e já escolhido.
- Botão em ícone no cabeçalho da Árvore, ao lado de Apagar. Menu Editar → Duplicar. Um passo de desfazer.
- **Espelhar ao duplicar** fica para depois: precisa da decisão do eixo e da regra de nome (`_esq`/`_dir` da rodada 1). Está escrito para não voltar sem decisão.
- Teste: duplicar `arm` (com `forearm`, `hand` e 3 desenhos) → 3 ossos e 3 slots novos, nomes `arm_2`, `forearm_2`, `hand_2`; mundo do `arm_2` = mundo do `arm` + (20, 0); `ik_arm` continua apontando para `arm`; `revert` devolve o arquivo igual, texto contra texto.

**Anotação 18 — miniatura para todo tipo de desenho. FEITA no lote 32, v5.7** (ver os desvios no fim). Hoje `thumbnailFor` só acha `region` cujo nome está no atlas. Fica:

| Tipo | Miniatura |
|:---|:---|
| `region` | como hoje |
| `region` com `sequence` | o quadro `setup` da sequência (`hand_01`); um cantinho com "3" dizendo quantos quadros |
| `mesh`, `linkedmesh` | a imagem do `path`, como a region |
| `skeleton` | o esqueleto filho **desenhado** pelo runtime na pose de repouso, no quadrado; se não carregou, o ícone de osso |
| `boundingbox`, `point`, `path`, `clipping` | não entram na Ordem (anotação 9); na Árvore, o ícone do tipo |

Nunca caixa vazia: se não houver imagem, o **ícone do tipo** com o nome do tipo na dica. Teste: `thumbnailKind(attachment)` puro devolve `{ source: 'hand_01', badge: 3 }` para `hand`, `{ source: 'skeleton' }` para `sword`; na conferência sem cabeça, nenhuma linha da Ordem do `heroi.bone` fica sem `<img>` ou ícone.

**Anotação 17 — o gesto invertido. FEITA no lote 31, v5.6** (ver os desvios no fim).
- Com um osso escolhido, **segurar P** entra no modo "pegar filhos": o cursor muda, o rodapé diz "Clique nos ossos e desenhos que vão virar filhos de `hips`. Solte P para terminar." Cada clique prende um; clicar de novo solta (como o B do Spriter, que liga e desliga). Soltar P sai do modo. Um passo de desfazer por clique, com o nome do filho no `label`.
- Com **vários** escolhidos e nenhum pai óbvio, P continua fazendo o que faz hoje (clica no pai). O rodapé diz qual dos dois modos está valendo. Os dois gestos, uma tecla: o que decide é a seleção no momento em que P desce.
- Menu Esqueleto → "Virar filho de…" continua abrindo a lista com busca.
- Teste puro: `parentGesture(selection)` → `'pegar-filhos'` com um osso, `'escolher-pai'` com dois ou mais; sequência escolher `hips`, P, clique `arm`, clique `leg`, clique `arm` de novo → `arm` volta ao pai antigo, `leg` fica em `hips`; `revert` três vezes devolve o arquivo igual.

## Desvios

(o executor escreve aqui; uma tabela por lote, como nas rodadas 1 e 2)

### Lote 14 → v3.6

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | teste `parseEditorState({})` devolve `dockOpen: false` | **não existe `parseEditorState`.** A casca lê a extensão com `readEditorState` do `contract.ts` e cada pedaço tem o seu leitor: `parseColumnState` para a coluna, e agora `parseDockState` para a faixa | `parseDockState(undefined)`, `({})` e `(null)` devolvem `{ open: false }`. Mesma prova, no leitor que existe |
| 2 | `dockOpen` entra em `RECORTE_editor_state` | a faixa precisa guardar **duas** coisas: aberta ou fechada, e a altura de quando está aberta (o plano pede "a altura gravada") | uma chave só, `dock: { open, height }`, ao lado de `panels`. `DOCK_STATE_KEY` exportado |
| 3 | `CLOSED_HEIGHT` "≈ 120 px" | **medido**: tocador 51 + régua 48 + Resumo 35 + borda 2 | **136 px** na primeira volta. O Humberto olhou a foto e pediu: *"se tirar o nome quadro da linha do tempo ele pode ficar ainda mais fina"*. Ver a linha 7 abaixo: ficou em **121 px**, que é o "≈ 120" que o plano tinha escrito de cabeça |
| 4 | aberta, o mínimo é 240 | 240 é o mínimo, mas é um mínimo **inútil**: em 1440×900 as abas + o tocador + os botões + a régua + o Resumo comem 214px e sobram 26px de linha — meia linha. Abrir "Detalhes" e não ver linha nenhuma é o botão mentindo | `OPEN_MIN` continua **240** (o plano manda). `DEFAULT_OPEN_HEIGHT`, que é com quanto ela **abre da primeira vez**, é **380**: aparecem quatro linhas inteiras |
| 5 | — | **defeito achado, de antes do lote:** o menu do **⋯ Mais** nunca esteve escondido. `hidden` era escrito no elemento e a regra de autor `display: flex` passava por cima do `[hidden]` do navegador. A caixa dos oito controles ficava desenhada em cima da cena e recebia clique; ela caiu bem em cima do botão Detalhes novo, que foi como apareceu | corrigido no mesmo lote: `.dope-mais-lista[hidden]`, `.dope-barra[hidden]` e `.dope-eventos[hidden]` com `display: none`. **É o mesmo tipo dos três defeitos do lote 19** (um `hidden` que não esconde), e vale ler o lote 19 com isso em mente |
| 6 | o botão Detalhes na ponta direita da **linha 1** | a linha 1 (`.dope-tocador`) **rola de lado** numa janela estreita, e o botão saía da vista junto com os últimos controles — justamente o botão que reabre a faixa | a linha 1 virou `.dope-linha1`: o tocador que rola por dentro, e o Detalhes **fora** dele, preso na ponta direita |
| 7 | — | **pedido do Humberto, 09/09/2026**, olhando a foto do lote: tirar "quadro N" da régua. Tirar o texto sozinho não mudou nada: quem mandava na altura daquela linha eram os dois botões do canto da cebola, de 34px | a régua escreve só o segundo (o quadro continua no tocador e na dica de cada marca), os botões do canto foram a 26px e a linha da régua a 32px. **136 → 121 px**, e a cena **66% → 68%**. Entra no zip da v3.7, porque a v3.6 já estava guardada quando ele pediu |

**A medida que o plano pediu (item 4 da ordem de trabalho).** Chrome headless,
1440×900, `heroi.bone`, animação `walk` aberta, console limpo:

| Faixa | Fechada | Aberta |
|:---|---:|---:|
| Menu | 44 px · 5% | 44 px · 5% |
| Barra de ferramentas da cena | 60 px · 7% | 60 px · 7% |
| **Cena (o canvas)** | **611 px · 68%** | 352 px · 39% |
| Faixa de baixo | 121 px · 13% | 380 px · 42% |
| Rodapé | 54 px · 6% | 54 px · 6% |

**A meta de ≥ 70% NÃO foi alcançada no lote 14: deu 68%.** O ponto de partida
do plano era 43%, então o lote entregou 25 pontos dos 27. Os 2 que faltam estão
medidos e têm dono: a **barra de ferramentas da cena, 60 px (6,7%)**, que é
exatamente o que o **lote 17** transforma em uma barra de ações só. Não há como
tirá-los aqui sem fazer o trabalho do lote 17 dentro do 14. Escrito assim para
ninguém contar essa vitória duas vezes, como aconteceu com o item 15 da rodada
2.



### Lote 31 → v5.6 — anotação 17, o pai pega os filhos

**Feito**, com o gesto do Spriter na tecla que já existia. Seis desvios, nenhum
bloqueante.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `parentGesture(selection)` → `pegar-filhos` com um osso, `escolher-pai` com dois ou mais | falta o terceiro caso, que é o de todo dia: **um desenho escolhido**. Um slot não pode ser pai de coisa nenhuma, então "aquele é o pai" não se sustenta | um osso **e nada mais** → `pegar-filhos`. Qualquer desenho na conta, sozinho ou junto → `escolher-pai`. Nada escolhido → `nada`, que é o recado, e não um gesto |
| 2 | "segura P … solta P termina" | a `Tool` do `contract.ts` **só tinha `onKey`**: a tecla que sobe não chegava a ferramenta nenhuma | dois membros novos, os dois opcionais: `onKeyUp` e `cursorClass`. A cena e a casca roteiam a subida do mesmo jeito que roteiam a descida |
| 3 | "o cursor muda" | a tecla pode ser solta com o foco em qualquer canto da janela, e aí quem atende é a **casca**, que não conhece o canvas. A ordem dos dois ouvintes de `document` não é nossa | o cursor é acertado **no laço de quadro** da cena, e não no evento: uma comparação por quadro, e o DOM só é tocado quando a classe muda. `.is-pegando-filhos` e `.is-escolhendo-pai`, no `viewport.css` |
| 4 | "um passo de desfazer por clique, com o nome do filho no `label`" | `ReparentMany` escrevia sempre "Virar filho de hips". Três cliques seguidos deixavam três passos com o mesmo nome no Histórico | `ReparentMany` ganhou um `label` opcional, usado **só** por este gesto: "braco vira filho de hips", "braco volta para root" |
| 5 | — | **quatro testes do lote 0** provavam o gesto de antes com **um** osso escolhido, que é justamente a seleção que agora faz o gesto novo | os quatro passaram a escolher dois ossos, que é onde o gesto de antes vive agora. A contagem não caiu: 2.027 → **2.043** |
| 6 | — | as fotos do manual: a tecla `P` não chegava ao editor no `fotos-manual.mjs`. Medido: a foto anterior cria um osso, e **criar um osso deixa o foco numa caixa de texto**; a casca ignora tecla de gesto com o foco ali, porque ali a tecla é letra | `__foto.semFoco()`, que tira o foco de onde ele estiver, e `teclaSegurada`, que segura a tecla **durante a foto** e a solta depois. Duas fotos novas: o antes, e o rodapé com o convite |

**O que este lote NÃO fez, e é decisão do Humberto.** Trocar de pai guarda a
pose **local**, então o desenho **anda na tela** ao mudar de pai. Não é novo, e
não é deste gesto: os três caminhos (a tecla, o menu, o arrasto na Árvore)
sempre fizeram assim. Com o gesto novo isso fica muito mais à vista, porque são
vários filhos em seguida. O manual passou a dizer isso em uma frase, nas duas
línguas. **Manter a pose de mundo ao trocar de pai é uma anotação nova**, se
ele quiser — e é conta de matriz, não de interface.


### Lote 32 → v5.7 — anotação 18, miniatura para todo tipo de desenho

**Feita a tabela inteira do plano.** Seis desvios, nenhum bloqueante.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `thumbnailKind(attachment)` | o `path` é **opcional**: ausente, quem dá o nome da imagem é o **nome do desenho** (§7.8). Só a definição não basta | `thumbnailKind(def, name)`. O nome entra como segundo argumento e só é usado quando falta o `path` |
| 2 | devolve `{ source: 'skeleton' }` para `sword` | `'skeleton'` é o **tipo**, e o que a miniatura precisa saber é **qual** esqueleto | `{ kind: 'esqueleto', source: 'espada.bone' }` — o `uri`. O `kind` é o que a tela usa para escolher entre imagem, esqueleto e ícone; o `source` diz qual |
| 3 | "o ícone do tipo" | **não existia ícone** para `path` nem para `clipping` | dois desenhos novos em `icons.ts`, nas regras da casa (24×24, traço 2, `currentColor`): **caminho** (a curva com as duas alças) e **máscara** (o retângulo recortado pelo círculo) |
| 4 | "o esqueleto filho desenhado pelo runtime na pose de repouso" | o desenho não sai do arquivo: sai do **filho vivo**, que o `slot.nestedSkeleton()` monta e que só existe depois que o `uri` resolveu | `skeletonThumbnail` usa o `CanvasRenderer` do runtime sobre `slot.nestedSkeleton()`, com `getBounds()` para encaixar sem esticar. Não carregou, não tem tamanho, ou canvas sujo por imagem de outra origem: cai no **ícone de osso**, como o plano manda |
| 5 | — | `thumbnailFor` recebe **nome de imagem**, e o painel **Imagens** continua chamando assim, porque lá tudo já é região do atlas | `thumbnailFor` ficou como está. A porta nova é `thumbnailNode(doc, slot, desenho)`, que **nunca devolve nulo** e é quem a Ordem e a Árvore usam |
| 6 | "na conferência sem cabeça, nenhuma linha da Ordem fica sem `<img>` ou ícone" | — | `conferir-editor.mjs` ganhou o campo `ordemSemBuraco`, que abre a aba Ordem depois da foto e conta. Medido no herói: **23 linhas, 0 vazias** |

**Um efeito de borda, de propósito:** um desenho que só existe em **outra pele**
agora mostra a imagem dele, porque a procura varre todas as peles. Antes ficava
sem miniatura. O nome continua apagado, que é o que diz "não é este que
aparece agora"; o manual foi corrigido nas duas línguas.


### Lote 33 → v5.8 — anotações 20, 21 e 22

**As três feitas.** Cinco desvios.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `toolForKey(key, mode)` recusa a ferramenta de outro modo | recusar não basta: a tecla ficaria **muda**, e mudo se lê como quebrado | duas funções. `toolForKey(tecla, modo)` devolve só o que vale ali — é o que o teste do plano pina — e `toolOfKey(tecla)` devolve a ferramenta em qualquer modo, para o rodapé poder dizer `Criar osso é da Montagem. Ctrl+Tab troca de modo`. A cena e a casca chamam as duas, pela mesma função |
| 2 | teste que **recusa `Ã` e `Â` em qualquer `.ts`** | `Ã` sozinho é **português de verdade**: "NÃO", em maiúsculas, aparece num comentário do próprio `export-image.ts`. A regra da letra reprovaria texto certo | a regra é a **dupla**: `Ã` ou `Â` seguido de um caractere de continuação (U+0080 a U+00BF), que é o rastro do UTF-8 lido como Latin-1 e nunca é texto legítimo. O teste varre `editor/src`, `editor/testes`, `runtime/src`, `runtime/testes` e `ferramentas/src`, e diz arquivo e linha |
| 3 | 5 frases em `export-image.ts` | eram **doze**, e mais **onze** no `ferramentas/src/exportar/quadros.ts` — inclusive dentro de uma tabela de comentário que ninguém tinha lido de novo | as 23 consertadas de uma vez, decodificando cada dupla; conferido na janela de verdade, com o texto lido da tela |
| 4 | **Abrir recente**: lista dos últimos 5 em `RECORTE_prefs` | um **submenu** teria que nascer e morrer a cada arquivo aberto, e o mesmo item mudaria de nome debaixo do dedo; a auditoria dos menus, além disso, recusa item sem ação fixa | uma **janela com busca**, igual à do "Virar filho de…", que ele já conhece. A lista mora em `RECORTE_recentes` (texto, cinco linhas); o jeito de reabrir é o `FileSystemFileHandle`, que não é texto e foi para o IndexedDB. Guarda **todos** os arquivos abertos juntos — o esqueleto e as imagens —, senão reabrir traria o personagem sem os desenhos |
| 5 | os dez "ou funcionam, ou saem" | **Abrir recente** fica cinza enquanto a lista está vazia, e isso é ESTADO, não promessa | a auditoria recusa `enabled: false` **com dica de lote**; cinza por estado continua certo e tem dica própria ("Os arquivos que você abrir aparecem aqui"). `soon()` e `later()` foram apagados do `menus.ts`: a ferramenta que fazia a porta cinza não existe mais |

**Medido no editor rodando, 1440×900:** `N` em Animando não cria osso e o rodapé
explica; `Ctrl+F` abre a busca e filtrar por "fore" leva a Árvore de 67 linhas a
11; `Ctrl+A` escolhe 41 itens; **Selecionar todas as chaves** escolhe 87;
**Tocar para trás** acende o tocador; **Imagem no slot…** abre o painel Imagens
com o foco na busca; a janela Exportar imagem não tem mais nenhuma dupla
quebrada; e **Esqueleto filho…** não está mais no menu.


### Lote 34 → v5.9 — anotação 19, trocar de pai não move nada

**Feita.** Quatro desvios.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | vale para os **três** caminhos | eram **quatro**: a tecla `P`, o menu **Esqueleto → Virar filho de…**, o **arrasto na Árvore** e o campo **Osso** do painel Propriedades, que ninguém tinha contado e que escrevia `slot.bone` direto, sem compensar nada | os quatro passam por `runReparent`. `ReparentBone` e `ReparentMany` foram **apagados** do `tree-model.ts`, com uma nota no lugar dizendo para onde foram |
| 2 | `L' = P'⁻¹ · W` para osso e desenho | o **desenho** nem sempre cabe. Uma `region` tem `x, y, rotation, scaleX, scaleY` e **não tem inclinação**: quando os dois ossos têm escalas diferentes nos dois eixos, a conta exata pede uma inclinação que o formato não escreve. O osso nunca cai nisso, porque `shearY` existe para ele | a conta exata onde ela cabe, e `Reparent.distorted` quando não cabe — a tela avisa em vez de mentir. `isSimilarity(F)` é quem decide, e é uma linha de matemática, não um chute |
| 3 | — | **malha com pesos** não pode ser mexida: o mundo dela sai do `binding`, e o osso do slot não entra nessa conta. Compensá-la moveria o desenho de verdade | anexo com `binding` fica de fora, com o motivo escrito e um teste que prova que o arquivo dele não é tocado |
| 4 | "a tela avisa e troca de modo antes" | o gesto do lote 31 dá **um comando por clique**: repetir o aviso a cada clique encheria o rodapé | `runReparent` devolve o que aconteceu (`leftAnimating`, `distorted`) e o gesto acrescenta ao recado dele: *"body virou filho de hips (estrutura muda na Montagem, e voltei para ela)"* |

**Medido:** no herói, mover `arm` para `hips` deixa `arm`, `forearm`, `head` e
`hand_target` com a matriz de mundo igual até **1e-6**; a espada trocando de
osso não anda um pixel; desfazer devolve o arquivo **texto contra texto**. Dois
testes do lote 31 mudaram de número de propósito: eles clicavam onde o osso
tinha ido parar, e agora ele não vai a lugar nenhum.


### Lote 35 → v6.0 — anotação 25, a aba Ordem ganha botões

**Feita.** Três desvios.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "Frente de tudo" leva a **pasta** junto | uma pasta pode aparecer **quebrada**: no herói, `capa` tem `cape_upper` e `cape_lower` no começo do array e `cape_path` no fim. Juntar os dois pelo nome arrastaria o personagem inteiro no meio | o bloco é o **pedaço vizinho**, lido do `orderEntries` — o mesmo que a lista desenha. Medido: a `capa` da lista tem 2 peças, e o arquivo tem 3 slots com esse nome de pasta |
| 2 | uma linha de ícones no alto da aba | seis botões de 48 px não cabem numa coluna de 258, e **botão cortado é botão que não existe** — que é justamente o que este lote veio consertar | ícone de 16 px e enchimento menor: 36 px cada, e os seis cabem numa linha só. Numa coluna mais estreita a barra **quebra em duas linhas** em vez de cortar |
| 3 | as duas "de tudo" entram no menu Esqueleto | com elas, o bloco da ordem no menu ficou com **sete** itens entre separadores, e a auditoria do lote 19 recusa mais de seis | um separador novo entre **mover** e **pastas**, e a linha do Esqueleto no `MENU_ORDER` passou a citar as pastas. A auditoria continua em zero |

**Medido na tela:** com nada escolhido os seis nascem cinzas; escolhida a
`cape_upper`, os seis acendem; **Frente de tudo** move o pedaço da pasta para o
topo da lista e o rodapé diz *"Pasta capa na frente de tudo"*.


### Lote 36 → v6.1 — anotações 23 e 24, chegar no programa

**Feitas as três partes.** Cinco desvios.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `[a.bone, b.bone]` → erro "um esqueleto por vez" | **o próprio herói vem com dois**: `heroi.bone` e `espada.bone`, que é o esqueleto filho dele (§7.11). Recusar seria recusar o exemplo do projeto | `{ kind: 'escolher' }`: a janela com busca pergunta qual abrir, e os outros **viajam junto** — é o que faz o filho ser resolvido. Quem escolhe é a pessoa; o programa não adivinha |
| 2 | `.psd` de exemplo "gerado do atlas do herói" | do **atlas** não dá: o atlas tem os recortes, e não onde cada peça fica no personagem. E giro e malha não estão lá | gerado do `heroi.bone`, desenhando **um slot de cada vez** com o mesmo `desenharPose` da prova visual e recortando o opaco. Um desenho girado sai girado, e a malha sai deformada, porque é o mesmo rasterizador |
| 3 | "os mesmos slots do herói, nas mesmas posições até 1 px" | comparar os NÚMEROS dos dois arquivos não prova nada: o importador cria outro esqueleto, outro atlas, outros nomes. E o PSD **não guarda a origem do mundo** — o importador centraliza a tela, então há sempre um deslocamento comum | nasceu `ferramentas/conferir-arte.mjs`: desenha os dois arquivos, slot por slot, e compara o retângulo do que ficou opaco, tirando o deslocamento comum. Medido no herói: **0 px** de centro e **0 px** de tamanho, nas 19 peças |
| 4 | — | a camada da **espada** saía vazia: trocar o attachment de um slot **derruba o esqueleto filho** dele, e é o `updateWorldTransform` que o monta de novo | duas linhas de `updateWorldTransform` no laço, com o motivo escrito. 18 camadas viraram 19 |
| 5 | as boas-vindas com "Abrir o herói" | a ação do exemplo ficava **sem porta** depois que as boas-vindas sumiam, e a auditoria do lote 29 reprovou — com razão | **Arquivo → Abrir o herói (exemplo)** entrou no menu. A mesma ação, duas portas |

**Medido na tela:** soltar `heroi.bone` + atlas + png + `espada.bone` mostra a
faixa *"Solte para escolher qual abrir"*, abre a janela, e escolher o herói
carrega os 18 ossos com o recado *"heroi.bone aberto pelo arrasto"*; **Arquivo →
Novo** mostra os três botões, e **Abrir o herói** traz o exemplo e some com a
caixa.


### Lote 37 → v6.2 — anotação 26, Duplicar

**Feita.** Com ela, **a lista "O básico que falta" está fechada**: as nove
linhas viraram as anotações 19 a 26, e os lotes 33 a 37 fecharam todas.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | duplicar `arm` dá 3 ossos e 3 slots | no herói, `arm` tem **um** filho (`forearm`) e **seis** slots pendem dos dois: `arm`, `forearm`, `sword_blade`, `weapon`, `hand`, `hand_point` | 2 ossos e 6 slots, contados do arquivo. O teste pina os nomes, e não um número escrito de cabeça |
| 2 | nomes com `_2`, `_3` | `uniqueName(nome + '_2')` daria `arm_22` na segunda vez, e `arm_2_2` se o sufixo fosse empilhado | `copyName` **troca** o sufixo: `arm` → `arm_2` → `arm_3` |
| 3 | "mundo do `arm_2` = mundo do `arm` + (20, 0)" | o `arm` do herói é puxado pela regra **`ik_arm`**, e a cópia não tem regra nenhuma: comparar os dois mundos mediria a regra. E recompor a pose a partir da matriz de mundo copiaria para dentro da cópia o que a regra fez com o original | o deslocamento é do **vetor**: `P⁻¹ · (20, 0)` somado ao `x`/`y` local, e o resto da pose fica intacto. O teste do mundo usa a `leg`, que não tem regra; a `arm` prova a estrutura |
| 4 | — | **o `hidden` não escondia** a caixa de boas-vindas do lote 36: `[hidden] { display: none }` é regra do navegador, e `.viewport-boas-vindas { display: flex }` passa por cima dela. É o **quarto** defeito desta família no projeto (lotes 14, 16, 19 e 30) | `.viewport-boas-vindas[hidden]` e `.drop-faixa[hidden]` com `display: none`, e o motivo escrito ao lado. Achado olhando a tela depois de duplicar, e não por teste |
| 5 | botão no cabeçalho da Árvore | o quarto botão **não cabia**: a barra quebrava em duas linhas, e a segunda é altura tirada da árvore | ícone de 16 px e enchimento menor nos três botões de ícone, como na aba Ordem. Uma linha só, 54 px |

**Medido na tela:** com nada escolhido o botão nasce cinza; escolhida a `leg`,
ele acende, e o clique diz *"3 ossos e 3 desenhos duplicados, 20 px à direita"*
— a perna inteira, com coxa, canela e pé.


### Lote 38 → v6.3 — anotação 27, escondido é escondido

**Feita.** Dois desvios, os dois de tamanho.

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "os quatro consertos locais saem" | eram **nove seletores**, em quatro folhas: `.dope-barra`, `.dope-eventos`, `.dope-mais-lista`, `.arvore-novo-lista`, `.viewport-button`, `.viewport-boas-vindas`, `.drop-faixa`, e mais os antigos `.tool-strip`/`.panel`, `.dock*`, `.panel-body`, `.panel-column`, `.panel-width-grip` | todos apagados. A regra é **uma**, e o teste exige que seja uma: qualquer `[hidden]` com `display` numa segunda folha reprova |
| 2 | um teste que varre os `.css` | varrer a FONTE não prova que a regra chegou à tela: o `programa/` é montado por outro caminho | dois testes. O da fonte, e outro que abre `programa/assets/*.css` e procura a regra no CSS montado. E a conferência sem cabeça ganhou `escondidoEscondido`, que conta no DOM de verdade: **32 marcados, 0 aparecendo** |

**A família, para o registro:**

| Lote | O que ficou desenhado por cima |
|:---:|:---|
| 14 | o menu do ⋯ Mais, em cima da cena, pegando clique |
| 16 | a barra da faixa de baixo |
| 19 | três listas de painel |
| 30 | as cinco ferramentas de estrutura, em Animando |
| 37 | a caixa de boas-vindas, com o personagem já carregado |
