# Defeitos achados no uso — 28/09/2026

Só se acrescenta. Cada defeito traz **o gesto que o provoca** e **o dono**.
Quem acha não conserta fora da própria cerca: avisa o Planejador.

| Estado | Quer dizer |
|:---|:---|
| **medido** | reproduzi, e o gesto está escrito |
| **a medir** | vi uma vez. Pode ser outra coisa. Ninguém conserte ainda |

---

## Do chat A — 28/09/2026, 23:55 — achados tirando as fotos do lote 1

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| A1 | **Uma barra marrom VAZIA** aparece nas janelas de formulário. É a linha do aviso, desenhada mesmo sem aviso nenhum | Aba Ordem → duplo clique no nome de uma pasta. A barra está lá antes de digitar | **medido** | `ui/dialog.ts` e o CSS dele — **sem dono na rodada** |
| A2 | **O nome do arquivo sai com lixo** no programa montado: `heroi-DUlefYnW.bone`, no canto de cima. No modo de desenvolvimento sai `heroi.bone` | `programa\Abrir o editor.bat` → Abrir o herói | **medido** | a montagem (`ferramentas/montar-programa.py`) ou quem lê o nome — **a decidir** |
| A3 | **O rascunho do trabalho pode ser trocado por um vazio.** Eu tinha o herói aberto, com uma pasta renomeada e não salva. A página recarregou. A janela de recuperar ofereceu *"sem nome"*, e não o herói | herói aberto e mexido → recarregar a página → olhar o que a janela oferece | **a medir** | chat A (`doc/rascunho.ts`) |
| A4 | **Desfazer deixa `shearX: 0` escrito** onde o campo não existia. O boneco é o mesmo; o arquivo não volta letra por letra | inclinar um osso → `Ctrl+Z` → comparar o `.bone` | **medido** | chat F (`viewport/tools/select.ts`, `writeBone`) |
| A5 | **O teste "a compensação é um passo de desfazer" prova outra coisa** (regra 28). Faz um movimento só e confere só o filho | ler `eixos-e-chaves.test.ts`, linha 472 | **medido** | **sem dono na rodada** |

**Fotos:** `backup/fotos-rodada-final/defeitos/`. A barra vazia (A1) e o nome com
lixo (A2) aparecem em `lote-1_pasta_antes-janela.jpg`.

## Do chat D — 29/09/2026, 00:01 — achados tirando as fotos do lote 1

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| D1 | **Com um parâmetro escolhido, Propriedades abre em "Compensar"** — três marcas de arrasto de osso (não mexer nos filhos, nos desenhos, nas caixas) — e a ficha do parâmetro fica **abaixo da borda**. O título diz "Parâmetro: parametro" e o que se vê é coisa de osso. Régua do arroz: *"o que eu criei apareceu na tela?"* — a linha sim, a ficha não | herói → Árvore → `Novo ▾` → Parâmetro (com a ferramenta Transformar na mão, que é a que abre). Foto: `backup/fotos-rodada-final/arvore-malha-tempo/lote-1_depois.png` | **medido** | chat B (`panels/properties.ts`, `renderCompensation`) |
| D2 | O mesmo, **a medir**, para o evento: a ficha do evento mora no fim de Propriedades (`prop-eventos`), depois de tudo. Clicar no evento na Árvore escolhe o evento e deixa a seleção vazia; não medi se a ficha aparece sem rolar | herói → Árvore → clique em `step`, no grupo "Eventos e parâmetros" | **a medir** | chat B |

## Do chat B — 29/09/2026, 00:02 — achados tirando as fotos do lote 1

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| B1 | **A partícula sai BRANCA na cena: o desenhador aplica só o alfa dela, nunca a cor.** `runtime/src/render/canvas.ts`, `drawParticles`: usa `particle.color[3]` no `globalAlpha` e nunca lê `particle.color[0..2]`. O comentário logo acima diz *"The particle's own colour and alpha ARE applied"* — **o comentário mente**, e é a forma da regra 21: parece funcionar e não avisa. Um fogo com `colorOverLifetime` amarelo → vermelho sai branco. **Afeta a cena do editor, a Prévia e o exportar imagem**, que usam o mesmo desenhador | botão Partículas → Fogo → abrir `idle` → agulha em 0,5 s. Foto: `backup/fotos-rodada-final/particulas/lote-1_depois.png` (o borrão branco na mão do herói) | **medido** | `runtime/` — **fora de todas as cercas da rodada**. Decisão do Planejador |
| B2 | **O emissor nasce escolhido e a Árvore NÃO rola até ele.** A linha fica fora da vista; quem criou não vê o que criou | herói → escolher `forearm` → botão Partículas → Fogo. A Árvore continua no topo (`hips`, `torso`…) | **medido** | chat D (`panels/tree*`) |
| B3 | É o **D1** acima, visto do emissor: Propriedades mostra "COMPENSAR" antes da ficha do emissor | o mesmo gesto do B2, com Transformar na mão | **medido** | chat B, lote 2 |

**O que o chat B faz no lote 1, dentro da cerca, sem esperar o B1:** a imagem de
cada modelo sai **já pintada na cor dele** (fogo laranja, fumaça cinza, faísca
amarela, poeira terra), e os campos de cor dos modelos só mexem no **alfa**. Assim
o modelo sai igual num desenhador que aplica a cor e neste que não aplica. **Isso
não conserta o B1:** quem pintar a cor na ficha continua vendo branco.

## Do chat E — 29/09/2026, 00:11 — o `Ctrl+Z` depois de cada gesto de entrada

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| E1 | **Desfazer o "Importar PSD" (substituir) não devolve o arquivo letra por letra.** O conteúdo volta igual; a ORDEM não: `constraints` e `animations` voltam no FIM do arquivo, depois de `extensions` e `extras`. Salvar depois disso grava um `.bone` que difere do original em todo o texto de baixo | herói aberto → Arquivo → Importar → PSD… (`heroi.psd`) → Substituir → `Ctrl+Z` → salvar e comparar. Medido por uma sonda de fora, com as MESMAS chaves do comando: acrescentar volta letra por letra; substituir, não | **medido** | a forma é do `SnapshotCommand` (`doc/commands.ts`, chat A); **o conserto no comando do PSD é meu** (`io/import-psd.ts`) |

**A forma do erro (regra 27):** *o desfazer devolve o VALOR, e não o LUGAR* — a
chave que o comando apagou volta com `file[nome] = valor`, e um objeto do
JavaScript põe chave nova no fim. Vale para todo `SnapshotCommand` cujo
`mutate` APAGA uma chave, e é a mesma cara do A4 (o `shearX: 0` que não estava
lá): o desfazer diz "o boneco é o mesmo" e o arquivo diz outra coisa.

## Do chat G — 29/09/2026, 00:12 — a fila de criar, tocar e ajustar uma animação

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| G1 | **Botão direito no losango do Resumo não abre nada.** O menu da curva (Linear · Suave · Parada · Curva…) só existe na linha de detalhe. O Resumo é o que aparece por padrão (`dope-compacta`), então o gesto do Spriter — botão direito na chave muda a curva — não funciona na tela que se vê | herói → abrir `idle` → botão direito num losango do Resumo | **medido**, foto `backup/fotos-rodada-final/animacoes/lote-2_12_direito-na-chave-do-resumo-nada.png` | chat D (`panels/dopesheet-player.ts`, `buildSummaryMark`) |

## Do chat H — 29/09/2026, 00:13 — a fila de trazer a arte e marcar o pivô

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| H1 | **Trocar a imagem de um desenho solto faz ele PULAR.** Duas mãos de 24×24, o mesmo pivô (meio de cima), e a peça desce 12 px na troca. O Spriter diz: a imagem nova entra *"no lugar da atual, pelos pivôs das duas"* — mesmo pivô, nenhum pulo | pasta com `mao_aberta` e `mao_fechada` → pivô no meio de cima nas duas → arrastar `mao_aberta` para a cena → clicar a peça → botão direito em `mao_fechada` → Usar no desenho escolhido. `y` vai de 0,17 a −12. Fotos `backup/fotos-rodada-final/imagens-e-pivo/lote-2_13` e `_14` | **medido** | chat E (`io/pivot-model.ts`, `swapImage`) |
| H2 | **Acertar o pivô de uma imagem TELETRANSPORTA o desenho solto que a usa.** A cabeça em (150, 100) vai para (0, 28), perto da origem. O rodapé diz *"1 desenho recolocado"*, sem dizer para onde | soltar `corpo/cabeca` em (150, 100) → Janela → Pivôs → escolher a cabeça → clicar no queixo, na prévia. Fotos `lote-2_17` e `_18` | **medido** | chat E (`io/pivot-atlas.ts`, `SetPivotCommand`, e `placeByPivot`) |
| H3 | **As setas não empurram o desenho escolhido na cena.** No Spriter, seta = 1 px (*Mouse and Keyboard Controls*) | soltar uma imagem na cena (ela nasce escolhida) → setas. O `x` não muda. Foto `lote-2_11` | **medido** | chat F (a cena e as teclas) |

**A forma do erro de H1 e H2 (regra 27):** *a conta põe o pivô novo na ORIGEM
DO OSSO, e não no lugar onde o pivô velho estava.* Para o desenho preso ao osso
pelo próprio pivô, dá no mesmo — e é esse o caso que os testes provam. Para o
desenho **solto**, que é como toda imagem nasce desde o lote 60, ele pula. Onde
mais procurar: todo lugar que chama `placeByPivot` com um desenho que já estava
na cena (`SwapFolderImages`, `SwapImageEverywhere`, `StampPivots`).

## Do chat K — 29/09/2026, 00:15 — usando o programa para animar um ciclo de andar

Programa **montado** (`programa/`, LEIA-ME diz v22.7), porta 5311, 1440×900. Herói de exemplo. Passo a passo e
respostas às quatro perguntas em `documentos/pesquisa/nova pesquisa/SEQUENCIA animar um ciclo de andar 2026-09-28.md`.
Fotos em `backup/fotos-rodada-final/uso-animar/` (o número entre parênteses é o prefixo do nome da foto).

| # | Tipo | O defeito | O gesto | O que devia ser (referência) | Estado | Dono |
|:---:|:---|:---|:---|:---|:---:|:---|
| K1 | **CRIEI E SUMIU** | A animação nova **não aparece na lista**. O painel Animações mostra só uma fatia de uma linha, sem rolagem. A lista só surge arrastando um divisor **sem alça à vista** (entre Imagens e Animações) | Abrir o herói → painel Animações → **+** (ou `Animação → Nova animação`) → procurar o nome na lista (06, 07) | Spriter: a paleta de animações lista todas. Spine: a *Animations view* lista e o duplo clique renomeia | **medido** | Animações (`panels/animations*`) e a altura dos painéis da direita (Casca, `ui/shell.css`) |
| K2 | **FEZ E NÃO AVISOU** | Ao **renomear**, o rodapé diz *"**Abriu** a animação 'andar'"*. O verbo é de outra ação | Lápis do painel ou `Animação → Renomear` → dar nome (08) | "Renomeou a animação 'animação' para 'andar'" | **medido** | Animações (chat G) |
| K3 | **FEZ E NÃO AVISOU** | Posar cria a chave **sem dizer**. O rodapé continua *"Mexer grava chave."*. A prova é um losango pequeno na linha Resumo, e a caixa do tempo ficar **laranja** — cor que **nenhuma dica explica** | Animação aberta → girar um osso em 0,00 s (11, 12) | Spine: o botão de chave muda de cor e há texto. Aqui a chave existe; falta a **frase**: *"Chave em 0,00 s: Rotação de leg_b"* | **medido** | Linha do tempo (`panels/dopesheet*`) e o rodapé (Casca) |
| K4 | **A SEQUÊNCIA QUEBRA AQUI** | Depois de criar a animação e posar o 1º quadro, **nada manda** "vá a outro ponto do tempo e pose de novo". O mesmo no passo zero: abrir o herói deixa a tela em "Base: heroi — Mexer grava na base" sem apontar o caminho para uma animação | Abrir o herói → olhar o rodapé. Criar animação → posar → olhar o rodapé (02, 12) | Spriter, passos 2–4 do manual: posar → clicar outro ponto da linha do tempo → posar de novo. A tela devia mostrar **o passo seguinte** | **medido** | Animações + Linha do tempo. Decisão do Planejador: onde mora a "próxima dica" |
| K5 | **NÃO SE ACHA** | **Não existe colar a pose espelhada.** `Editar` só tem *Copiar a pose inteira* e *Colar*. *Inverter a seleção* (Ctrl+Shift+I) **não espelha**; *Copiar/Colar posição do osso* leva **um** osso, sem espelhar. Para o outro pé à frente, girei cada perna à mão, a olho | Ciclo de andar: copiar a pose de 0,00 s, colar em 0,50 s, tentar colocar a outra perna à frente (14, 15, 18) | Spine: espelhar é escala -1 na ferramenta Escala. **Spriter: não achei** nada sobre colar espelhado. O passo 6 da fila **não tem porta** | **medido** | Linha do tempo / `anim/keying.ts`. **Decisão do Humberto**: é função nova (par esquerda/direita), não só botão |
| K6 | **A SEQUÊNCIA QUEBRA AQUI** | Uma animação **nova não repete**. O botão *Repetir (L)* vem desligado e **nenhum aviso diz isso**. Num ciclo de andar, é o primeiro erro que o usuário comete. Também não há dica de "cole a pose 1 no fim do tempo (End → Ctrl+V)" para fechar o laço | Criar animação → posar → tocar → ela para no fim (28) | Spine: *Loop Start/End* e *Offset* para fechar o laço. Spriter: **não achei** | **medido** | Animações + tocador |
| K7 | **DEU ERRO** | **A lista não atualiza.** Ligo *Repetir* e o rodapé diz *"Repetir ligado em andar."*, mas a etiqueta "**repete**" **não aparece** na linha. Só apareceu depois de escolher outra animação e voltar | Animação nova → botão Repetir (L) → olhar a linha na lista (29, 30) | A etiqueta acompanha o botão na hora | **medido** | Animações (chat G) |
| K8 | **DEU ERRO** | **Os campos da Ficha rápida não acompanham o quadro.** Em 0,50 s digitei Ângulo −55 (a perna mexeu, rodapé *"Mudar ângulo."*) e o campo **continuou −95**, também depois de voltar a 0,50 s (24, 31). Igual na troca de imagem: o campo diz **Imagem: face** enquanto o rosto já é `cape_upper` (K12). Não sei se mostra a base de propósito; **se for, o rótulo devia dizer "Base"** | Animação aberta → escolher osso → 0,50 s → digitar o ângulo → olhar o campo | O campo mostra o valor do quadro onde estou (Spine: os campos numéricos seguem o quadro) | **a medir** | Ficha (`panels/properties*`, chat B) |
| K9 | **NÃO SE ACHA** | Na aba **Curvas** os botões do formato (*Suave, Entrada suave, Saída suave, Linear, Degrau, Passa do alvo, Recua e passa*) ficam **abaixo do gráfico**. Só aparecem **rolando a aba**. À vista há só *Ajustar* e *Mostrar todas* | Detalhes → Curvas → escolher uma chave no gráfico → procurar onde mudar a curva (34, 35, 36) | Spine: os botões de tipo de curva ficam junto do gráfico. **Depois de achados, funcionam bem**: rodapé *"Curva Suave."* e o gráfico vira um S (37, 38) | **medido** | Linha do tempo (`panels/graph*`, chat G) |
| K10 | **NÃO SE ACHA** | **Escolher o osso certo é difícil.** Clicar na perna pega o osso vizinho (pedi a coxa de trás, veio `shin`). O nome só aparece em Propriedades. A Árvore mostra ~9 linhas e o `leg_b` só ficou à vista **depois de dobrar o torso**. `Editar → Escolher` só tem *os filhos* `]` e *os pais* `[`: **não tem irmão** | Ciclo de andar: escolher a perna de trás e a da frente, alternando (10, 20, 21, 22) | Spriter: clicar no osso e lista de ossos visível. Spine: árvore alta, com o nome do osso no clique | **medido** | Cena (chat F) e Árvore (chat D) |
| K11 | **FEZ E NÃO AVISOU** | **A ferramenta muda sozinha.** Cliquei no rosto só para escolher. O programa ligou a ferramenta **Malha** e o gizmo do osso sumiu. O rodapé diz *"Ligou a ferramenta Malha (M), para mexer na cena.."* (com **dois pontos**) | Ferramenta Transformar → clicar no rosto do herói (42) | Escolher não devia trocar de ferramenta. Se troca, tem de dizer **por quê** e como voltar | **medido** | Cena (chat F) |
| K12 | **FEZ E NÃO AVISOU** | Trocar a imagem no meio **funciona e avisa bem** (*"head mostra 'cape_upper' a partir de 0,50 s, só nesta animação."*, foto 41). **Mas:** (a) o campo Imagem continua "face" (ver K8); (b) a Linha do tempo só mostra um losango no **Resumo** em 0,50 s. **Não há linha "head · imagem"** para ver, mover ou apagar só essa troca | Animação → 0,50 s → escolher o rosto → Ficha rápida → Imagem → escolher outra (41, 43, 39) | Spriter: a troca vira chave daquele objeto, na linha dele | **a medir** | Linha do tempo + Ficha |
| K13 | **A SEQUÊNCIA QUEBRA AQUI** | Abrir **Detalhes** (linha do tempo e curvas) **encolhe a cena a uma faixa** (~190 px em 1440×900). Não vejo o boneco enquanto ajusto a curva ou o tempo | Detalhes → olhar a cena (33, 34) | Spine: o gráfico e a cena lado a lado, ou a cena mantém altura | **medido** | Casca e layout (`ui/shell.css`) |
| K14 | **DEU ERRO** | Renomear e criar animação usam a **caixa nativa do navegador** (`prompt`), fora do visual do programa. Um chat de uso **não vê** essa caixa, e a ordem de hoje do Humberto é que nenhum chat abra janela do sistema | `Animação → Renomear animação` (05) | Caixa do próprio programa, como as outras janelas. Spriter renomeia dentro da paleta | **medido** | Animações (chat G) |

**Confirmações de defeitos de outros chats** (vistos também por K):

| Ref. | O que vi |
|:---:|:---|
| **A2** | O título saiu **`heroi-DUlefYnW.bone`** no montado (02). Confirmado |
| **A3** | No modo de desenvolvimento (5211) a página **recarregou sozinha** duas vezes (outros chats gravando). A janela de recuperar ofereceu um rascunho **"sem nome"**, e não o herói que eu tinha aberto e mexido (`xx_5211_...jpg`). **Confirmado** |

**Bom, para não se perder** (a régua do arroz também elogia):

| O quê | Onde |
|:---|:---|
| *Copiar a pose inteira* (Ctrl+Shift+C, igual ao Spriter) e *Colar* dizem tudo: *"Pose de 0,00 s copiada: 2 valores."* e *"Colar chaves."* | passos 5 e 7 |
| Arrastar o losango muda o tempo, e o rodapé diz *"Mover chaves."* | passo 9 |
| Trocar imagem no meio: a frase diz **a partir de quando** e **só nesta animação** | passo 11 |

### Do chat K — acréscimo, 29/09/2026, 00:20

| # | Tipo | O defeito | O gesto | O que devia ser (referência) | Estado | Dono |
|:---:|:---|:---|:---|:---|:---:|:---|
| K15 | **DEU ERRO** | **A troca de imagem vale ANTES do quadro em que foi feita.** O rodapé diz *"head mostra cape_upper a partir de 0,50 s, só nesta animação."*, mas em **0,00 s** e em **0,23 s** o rosto **já é `cape_upper`** (46, 47). A frase mente. Parece que a única chave da troca vale para trás, até o começo | Animação nova → ir a 0,50 s → escolher o rosto → Ficha rápida → Imagem → escolher `cape_upper` → voltar a 0,00 s e olhar a cabeça | Spriter, *Swapping the Image*: a imagem **muda naquele momento**; antes dele fica a original. Ao criar a troca, o programa devia gravar também a imagem antiga no começo | **medido** | Animações e chaves (`anim/keying.ts`, chat D/G) — **quem escreve a chave de imagem** |

## Do chat I — 29/09/2026, 00:21 — achados fazendo a fila de ver, esconder e vestir (lote 2)

Fotos: `backup/fotos-rodada-final/exibicao-e-peles/lote-2*/`. A lista inteira, com os meus
(I1 a I8), está em `documentos/pesquisa/nova pesquisa/SEQUENCIA exibicao peles e historico 2026-09-28.md`.
Aqui só os de fora da minha cerca.

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| I-O1 | **O olho da Árvore esconde e não diz nada.** O rodapé fica com a frase velha. Régua do arroz: *"o programa disse?"* — não | herói → Árvore → clicar o olho da linha do desenho `hair`. Foto `lote-2/09` | **medido** | chat D (`panels/tree*`) |
| I-O2 | **Trocar a imagem com o lápis numa pele nova troca na `default`.** O rodapé diz *"body/body agora mostra arm"*, sem dizer a pele. Quem fez uma pele para trocar a roupa troca a roupa do corpo. No Spriter é justamente isso o *Character Map*: trocar a imagem **naquele mapa** | herói → Peles → Nova pele (o lápis fica nela) → escolher `body` → Propriedades → Imagem → `arm`. Conferido no arquivo: `skins.default.attachments.body.body.path = "arm"`; a pele nova fica vazia. Fotos `lote-2e/01`, `02` | **medido** | chat H (a janela de trocar imagem, `SwapSlotImage` em `panels/palette-model.ts`) |
| I-O3 | **1280×720: o botão "Travar desenhos" sai cortado** na borda direita da barra do alto ("Trav") | abrir o editor em 1280×720 | **medido** | a barra de ações (`ui/shell*`) — chat A |
| I-O4 | **"Opções da casca de cebola" abre cortada**: só *"Só nas chaves"* aparece, espremida na faixa do Resumo | abrir `walk` → régua da linha do tempo → o botão ao lado da cebola. Foto `lote-2b/10` | **medido** | chat D (`panels/dopesheet-player.ts`) |

## Do chat J (uso: do zero ao boneco montado) — 29/09/2026, 00:23

Programa: `programa/` montado, v22.8, porta 5310. Fotos: `backup/fotos-rodada-final/uso-boneco/` (`NN_porta5310_*` no painel do aplicativo; `hNN_headless_*` em Chrome sem janela, com o seletor de arquivo trocado). Fila e as quatro perguntas em `documentos/pesquisa/nova pesquisa/SEQUENCIA do zero ao boneco montado 2026-09-28.md`.
Tipos: NÃO SE ACHA · CRIEI E SUMIU · FEZ E NÃO AVISOU · A SEQUÊNCIA QUEBRA AQUI · DEU ERRO.

| # | Tipo | O defeito | O gesto | O que devia acontecer (referência) | Estado | Dono |
|:---:|:---|:---|:---|:---|:---:|:---|
| J1 | **A SEQUÊNCIA QUEBRA AQUI** | Depois de **Salvar**, `Arquivo → Abrir projeto…` escolhendo o `.bone` recém-salvo abre a Árvore **sem as imagens**: ícones quebrados, cena vazia, "8 avisos". O rodapé diz *"Abra o atlas junto"*, sem botão. Só `Abrir pasta do projeto…` traz tudo de volta, e nada diz isso | montar boneco → Salvar → recarregar a página → `Arquivo → Abrir projeto…` → escolher `sem nome.bone`. Fotos h13 (quebra) e h14 (certo). **Com o seletor trocado; o do Windows fica sem prova** | Spriter: o `.scml` é salvo na pasta do projeto e abre com as imagens ([Starting a Project](https://brashmonkey.com/spriter_manual/starting%20a%20project.htm)). Spine: o projeto guarda o caminho das imagens ([Images](https://en.esotericsoftware.com/spine-images)) | **medido** | Arquivo, exportar, importar (`io/*`) |
| J2 | **A SEQUÊNCIA QUEBRA AQUI** | `Esqueleto → Virar filho de…` (P) não faz o que o nome diz: o osso escolhido vira o **pai** do que se pinta, e o modo pede **segurar** P. Pelo menu, o clique na cena só seleciona e o modo acaba sem avisar | escolher `osso3` → menu `Esqueleto → Virar filho de…` → clicar num desenho na cena. Fotos 25, 26. (Segurando P de verdade funciona: h06 a h09) | Spriter: escolher o osso, segurar **B**, clicar no sprite; ele fica mais opaco. Spine: arrastar na árvore ou `Set Parent` | **medido** | Casca e menus (`ui/actions-table.ts`, `register-actions.ts`) e Árvore |
| J3 | **A SEQUÊNCIA QUEBRA AQUI** | `Esqueleto → Novo → Osso` cria um osso de **comprimento zero na origem**, quase invisível, e **não** filho do osso escolhido. Duas vezes: `osso` e `osso3` ficaram soltos na raiz | criar um osso; escolher `osso2`; `Esqueleto → Novo → Osso`. Fotos 20, 24 | Spine: pela árvore, o osso novo nasce filho do escolhido, na ponta dele. Spriter: com um osso escolhido, o novo é filho | **medido** | Árvore (`tree-commands.ts`) e Casca (`register-actions.ts`) |
| J4 | **DEU ERRO** | Com a ferramenta **Criar osso** ativa, o painel da direita **encolhe de 259 px para 97 px**: abas Imagens, Pivôs e Animações ficam cortadas, e só voltam ao trocar de ferramenta. Causa vista: a dica do rodapé tem 1154 px e empurra a grade | clicar no ícone `Criar osso` (ou tecla B). Fotos 21, 23; **h04, h05** | o painel não muda de tamanho com o texto do rodapé | **medido** (2×: painel do aplicativo e headless) | Casca e menus (`ui/shell.css`, a barra de estado); o texto vem da Cena (`viewport/tools`) |
| J5 | **DEU ERRO** | Arrastar a miniatura da aba Imagens para a cena **de verdade** (painel do aplicativo) mostra um erro **falso**: *"Não sei o que fazer com i2uK3w…AAAABJRU5ErkJggg==. Solte um .bone, um .psd, imagens…"* — e a imagem entra mesmo assim. Outra vez com *"…com arrasto"* | arrastar uma miniatura para a cena. Fotos 04, 09, 10. **Soltando por script o rodapé é certo** (h03) — então o aviso vem do arrasto real da `<img>` da miniatura chegando ao "soltar arquivo" da casca | o rodapé diz *"entrou solta, como… crie o osso — ele pega o desenho"* (já diz, no caminho por script) | **a medir** (não repeti fora do painel do aplicativo) | Casca e menus (`ui/shell-drop.ts`); miniatura em Imagens e pasta (`panels/palette.ts`) |
| J6 | **CRIEI E SUMIU** | Trocar o pivô de uma imagem já na cena **faz o desenho pular** meia largura (ou altura) de lugar. A mão foi parar atrás da faca. O rodapé diz *"1 desenho recolocado"*, e não que andou | aba `Pivôs` → escolher a mão → "meio da esquerda". Depois a faca → "meio de baixo". Fotos 14, 15, 17 | Spriter: o pivô padrão vale para a imagem; não descreve o desenho já posto pulando ([Default Pivot Points](https://brashmonkey.com/spriter_manual/default%20pivot%20points.htm)) | **medido** | Imagens e pivô (`panels/pivot-panel*`, chat H) |
| J7 | **NÃO SE ACHA** | Pivô: **dois cliques na miniatura não fazem nada** (no Spriter abrem o pivô). Os botões `Definir pivô…` e `Carimbar pivôs` do painel `Pivôs` têm **tamanho zero**: não se veem. Sobram os nove pontos | aba `Imagens` → duplo clique numa miniatura. Aba `Pivôs` → procurar o botão `Definir pivô…`. Fotos 12, 16 | Spriter: duplo clique na imagem abre o diálogo de pivô, com "copiar/colar pivôs padrão" | **medido** | Imagens e pivô (chat H) |
| J8 | **NÃO SE ACHA** | Prender o desenho no osso **arrastando a linha na Árvore** funciona e avisa (*"1 item virou filho de osso3."*), mas **nada na tela diz que dá para arrastar**. E arrastar uma linha que **não** estava escolhida não fez nada, sem aviso; só funcionou clicando nela antes | Árvore: arrastar `_0000s_0003` para cima de `osso3` sem escolher antes (nada); escolher e arrastar (funcionou). Fotos 27 a 30 | Spine: arrastar na árvore equivale a `Set Parent` e a página da árvore diz isso ([Tree](https://en.esotericsoftware.com/spine-tree)) | **a medir** (o "nada" pode ser do arrasto simulado do painel) | Árvore |
| J9 | **FEZ E NÃO AVISOU** | Digitei `90` em `Ângulo` do osso e dei Tab: o rodapé diz *"Mudar Ângulo."* mas **a cena não mexeu** (o osso continuou a 45°). Girar com a ferramenta funcionou e levou os desenhos juntos | escolher `osso2` → campo `Ângulo` → `90` → Tab. Fotos 33, 34, 35. No campo `Escala X`, `Return` não confirmou; `Tab` sim | o osso gira | **a medir** (não repeti em Chrome sem janela) | Ficha e propriedades (`panels/properties*`, chat B) |
| J10 | **DEU ERRO** | `Ajuda → Sobre o Recorte` diz **"Versão 0.1.0"**. O programa montado é a v22.8 | `Ajuda → Sobre o Recorte`. Foto 05 | a versão de verdade | **medido** | Casca e menus (o `Sobre`) |
| J11 | **NÃO SE ACHA** | O aviso das boas-vindas manda ir a *"Arquivo → Abrir pasta…"*. No menu o item se chama **"Abrir pasta do projeto…"** | ler o cartão, abrir `Arquivo`. Fotos 00, 06 | o mesmo nome nos dois lugares | **medido** | Casca e menus |
| J12 | **NÃO SE ACHA** | O botão que cria o osso é um **ícone sem nome** entre onze iguais: achei pela dica ao passar o mouse. O caminho pelo menu (`Esqueleto → Novo → Osso`) dá o resultado do J3 | procurar "criar osso" sem passar o mouse. Fotos 18 a 21 | Spriter: `Alt` + arrastar. Spine: ferramenta `Create` com o nome e a tecla nas dicas ([Tools](https://en.esotericsoftware.com/spine-tools)) | **medido** | Cena (`viewport/viewport-toolbar.ts`) |
| J13 | **FEZ E NÃO AVISOU** | Depois de **Salvar**, recarregar a página faz a janela dizer *"Havia trabalho não salvo… sem nome.bone"* e oferecer recuperar, embora o arquivo estivesse salvo | Salvar → recarregar. Foto h11. Parente do **A3** | não perguntar quando não há o que recuperar | **a medir** | chat A (`doc/rascunho.ts`) |
| J14 | **FEZ E NÃO AVISOU** | O projeto **nunca pede um nome**: Salvar grava `sem nome.bone` (com espaço) e o título da janela fica `sem nome.bone` | Salvar num projeto novo. h10, h13 | Spriter: o projeto nasce com o `File > New Project`, na pasta principal. O diálogo do Windows pode pedir o nome: **sem prova** | **medido** (sem o seletor real) | Arquivo, exportar, importar |
| J15 | **NÃO SE ACHA** | A aba `Imagens` mostra só uma linha e meia de miniaturas em 1440×900: das 4 imagens só 2 se veem sem rolar. O nome da pasta `mao` aparece cortado | abrir a pasta de 4 imagens. Fotos h02, h03 | ver todas, ou dizer que rola | **medido** | Imagens e pasta |

**Contagem do chat J (15):** DEU ERRO 3 (J4, J5, J10) · A SEQUÊNCIA QUEBRA AQUI 3 (J1, J2, J3) · NÃO SE ACHA 5 (J7, J8, J11, J12, J15) · CRIEI E SUMIU 1 (J6) · FEZ E NÃO AVISOU 3 (J9, J13, J14).

**O que funcionou bem e vale guardar** (o lado que passou na régua do arroz): as mensagens do rodapé quando o gesto é o certo — *"5 imagens entraram na aba Imagens. Arraste para a cena para usar"*, *"entrou solta… crie o osso — ele pega o desenho"*, *"Osso novo pegou 1 desenho, sem mover"*, *"1 item virou filho de osso3"*, *"osso ficou com 3 filhos novos"*, *"Salvo em… Atlas gravado ao lado…"*, *"reaberto de onde parou"*. A aba `Ordem` e os botões dela têm dica clara. O crachá azul (nº de usos) na miniatura diz de cara quais imagens já estão na cena.

## Do chat N (`USO · exportar e entregar`) — 29/09/2026, 00:30 — exportar e entregar, herói de exemplo

Programa: `programa/` montado (v22.8), porta 5314. **Tudo o que mexe com arquivo foi feito sem janela do Windows, com o seletor de arquivo trocado por um receptor local.** O seletor de verdade do Windows fica **SEM prova**. Fotos: `backup/fotos-rodada-final/uso-exportar/`. Saídas conferidas: `.../uso-exportar/saidas/`. A tabela das quatro perguntas está em `documentos/pesquisa/nova pesquisa/SEQUENCIA exportar e entregar 2026-09-28.md`.

| # | Defeito | O gesto que o provoca · o que aconteceu · o que devia (referência) | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| N-1 | **NÃO SE ACHA.** Exportar não está à vista | Herói aberto → olhar a barra de cima: só há Novo, Abrir e Salvar. No menu **Arquivo** o item **Exportar ▸** é um dos últimos de uma lista comprida que **rola**: em 1440×900 ele fica escondido até rolar. *Spine:* menu **Export** próprio + `Ctrl+E`. *Spriter:* **File → Export To PNG** | **medido** | Casca e menus (`ui/menus`, `ui/shell*`) |
| N-2 | **NÃO SE ACHA.** Os nomes de Exportar ▸ não dizem o que saem | Arquivo → Exportar ▸ mostra **glTF… · Imagem… · Por pele…**. Quem quer um GIF, uma folha ou um vídeo procura essas palavras e não as vê; tudo isso mora dentro de "Imagem…". *Spine:* o diálogo lista GIF, PNG, APNG, vídeo por nome. *Spriter:* "Export Animation to PNG/GIF" | **medido** | Casca e menus (o rótulo) · Arquivo/exportar (`io/*`) |
| N-3 | **NÃO SE ACHA.** Há **dois** "exportar" com sentidos diferentes, e nenhum diz para que serve | Arquivo → Exportar ▸ Imagem… (imagens da animação) **e** Animação → **Exportar animação…** (um arquivo `.bone` só com animações, para outro corpo). O segundo grava `animacoes-animacoes.bone`: o nome repete a palavra e não diz de qual corpo veio | **medido** | Casca e menus · Arquivo/exportar (`io/*`) |
| N-4 | **NÃO SE ACHA.** A área de recorte não está à vista, nem no diálogo, nem na cena | Exportar imagem → campo **Recorte** → *"A área desenhada nesta animação"* → o programa diz *"idle não tem área desenhada"* e **não diz onde se desenha**. A única "**Área de desenho**" (X, Y, largura, altura, escala de referência) está em Propriedades → Esqueleto, **abaixo da dobra** de um painel de 154 px; nada liga uma à outra, e a dela é do esqueleto, não da animação. Não há retângulo arrastável na cena. *Spriter:* ícone "Change Animation Export Box Size", retângulo cinza arrastável + números + alcance (esta animação / todas). *Spine:* **Crop** com cantos laranja arrastáveis na prévia | **medido** | Arquivo/exportar (`io/*`, o diálogo) · Cena (`viewport/*`, o retângulo) |
| N-5 | **A SEQUÊNCIA QUEBRA AQUI.** O diálogo de exportar não mostra o que vai sair | Exportar imagem: nenhuma prévia, nenhum tamanho estimado; o único desenho é a linha *"Nada foi desenhado ainda."* Só depois de exportar o programa diz "114 por 242". *Spine:* painel de prévia com quadro, área branca do recorte e **tamanho estimado do arquivo** | **medido** | Arquivo/exportar (`io/*`) |
| N-6 | **FEZ E NÃO AVISOU — e avisou ERRADO.** "Tamanho de cada quadro" mente com "Todas as animações" | Exportar imagem → marcar **Todas as animações** → GIF → Exportar. O aviso diz *"Tamanho de cada quadro: 114 por 242 pixels"*, mas os arquivos saem **idle 114×242 · walk 156×242 · attack 295×281** (conferido abrindo cada GIF). Regra 21 da casa: aviso que não diz a verdade | **medido** | Arquivo/exportar (`io/*`) |
| N-7 | **FEZ E NÃO AVISOU.** O PNG diz "60 arquivos gravados", mas saiu **1 arquivo** | Exportar imagem → formato **Sequência de imagens PNG** (o marcador "Um arquivo só (.zip)" já vem ligado) → Exportar. O aviso: *"60 arquivo(s) gravado(s)"* e a lista dos 60 nomes. O que saiu: **`heroi-….zip`** (2 MB, 60 PNG dentro). **O nome do .zip não aparece em lugar nenhum** | **medido** | Arquivo/exportar (`io/*`) |
| N-8 | **FEZ E NÃO AVISOU.** Nenhum aviso de exportar diz **onde** o arquivo foi parar | GIF, PNG, folha, WebM, glTF: o aviso traz o nome do arquivo, nunca a pasta. *Spriter:* o seletor de arquivo vem **antes** e o usuário escolhe pasta e nome. *Spine:* campos "Output folder / Output file" no diálogo. Aqui o GIF e a folha vão para o navegador, sem escolher nada (o que o navegador faz com isso **não pude provar** sem janela) | **medido** (o texto) | Arquivo/exportar (`io/*`) |
| N-9 | **FEZ E NÃO AVISOU / A SEQUÊNCIA QUEBRA.** "Repetir a última exportação" é mudo e não repete sempre | `Ctrl+Shift+E` depois de um WebM: repetiu sem abrir o diálogo, e só disse *"Repetindo a exportação de imagem…"* na barra de baixo; **nenhum aviso de arquivo**. Depois de **Por pele…**, o mesmo atalho **reabriu o diálogo** em vez de repetir, sem dizer que era diferente. *Spine:* `Ctrl+Shift+E` repete e ponto | **medido** | Casca e menus (o atalho) · Arquivo/exportar (`io/*`) |
| N-10 | **A SEQUÊNCIA QUEBRA AQUI.** O diálogo não guarda a escolha da vez passada | Exportar PNG → fechar → abrir **Exportar imagem** de novo: volta em *GIF animado*, 0–2 s, fps 30, tudo do zero. Quem exporta várias vezes refaz tudo. *Spine:* **Save / Load** guarda as opções num arquivo | **medido** | Arquivo/exportar (`io/*`) |
| N-11 | **DEU ERRO?** Um WebM saiu com **0,73 s** em vez de 2 s | Exportar imagem → **Vídeo WebM** (idle, 0–2 s, 60 quadros) → abri o arquivo num `<video>`: 114×242, VP9, **duração 0,727 s**. Repeti com `Ctrl+Shift+E`: **1,968 s**. O próprio diálogo avisa *"o tempo é o do relógio do navegador, não quadro a quadro"*. Pode ter sido o painel do navegador ocupado com as minhas fotos | **a medir** | Arquivo/exportar (`io/*`) |
| N-12 | **FEZ E NÃO AVISOU.** O herói de exemplo abre com um nome estranho, e todo arquivo herda | Arquivo → Abrir o herói (exemplo) → o título da janela vira **`heroi-DUlefYnW.bone`**. Todos os arquivos exportados saem com esse sufixo (`heroi-DUlefYnW.gif`, `.zip`, `.bonez`…). Sem sentido para quem lê | **medido** | Casca e menus (abrir o herói) |
| N-13 | **FEZ E NÃO AVISOU direito.** Avisos em jargão que quem faz arroz não entende | *"Corpo entregue… Não havia imagem da pasta para fatiar: o atlas que ele já citava vale"* · *"Arquivo fatiado. Nada saiu: ele já era só isto"* · glTF: *"(5.3)"*, *"(7.7)"*, *"(9.6)"*, *"§2.8"*. **Entregar um corpo** grava só o `.bone`, e o aviso não diz para quê serve, nem que a pasta de imagens fica de fora | **medido** | Arquivo/exportar (`io/*`) |
| N-14 | **FEZ E NÃO AVISOU (ruído).** Toda exportação de imagem repete a dica do ffmpeg/MP4 | GIF, PNG e folha: o aviso termina com *"Vídeo MP4 não sai daqui… ffmpeg -framerate 30 …"*, sem relação com o que a pessoa pediu. Só faz sentido no formato Vídeo | **medido** | Arquivo/exportar (`io/*`) |
| N-15 | **A SEQUÊNCIA QUEBRA AQUI.** O 1º clique em **Arquivo** só realça a palavra | Visto 2 vezes em 4: clicar **Arquivo** realçou o botão e a lista **não abriu**; o clique seguinte abriu. Pode ser o painel do navegador lento, não o programa | **a medir** | Casca e menus (`ui/menus`) |
| N-16 | **A SEQUÊNCIA QUEBRA AQUI (leve).** O diálogo **Exportar imagem** não cabe, e abre rolado | 1440×900: o diálogo é mais alto que a tela e abre **rolado para baixo**: o título fica escondido. Com **Todas as animações** marcado, **De/Até (segundos)** continuam ligados, sem dizer que são ignorados | **medido** | Arquivo/exportar (`io/*`, `ui/dialog.css`) |

**O que funcionou (para a conta ficar honesta):** GIF, PNG (zip), folha + JSON, WebM, glTF, por pele, `.boneb`, `.bonez` e `.bone` **abriram e são o que se pediu** (conferidos: 60 quadros a 114×242 · folha 912×1936 com 8×8 · `.boneb` relido com 18 ossos e 3 animações · `.bonez` validado "ida e volta: igual" · `.glb` com 37 nós e 3 animações). Os avisos de **Salvar como binário** (*"17.900 bytes, 63,1% menor que o .bone"*) e **Salvar como pacote** (*"3 arquivos dentro, 35.924 bytes"*) dizem o que aconteceu.

**Contagem:** NÃO SE ACHA **4** · A SEQUÊNCIA QUEBRA AQUI **4** (2 medidos, 1 leve, 1 a medir; o N-9 conta nos dois tipos) · FEZ E NÃO AVISOU **7** · DEU ERRO **1** (a medir) · CRIEI E SUMIU **0**.

## Do chat M — 29/09/2026, 00:25 — usando peles e troca de roupa (programa montado, porta 5313)

Fila e as quatro perguntas em `documentos/pesquisa/nova pesquisa/SEQUENCIA peles e troca de roupa 2026-09-28.md`. Fotos: `backup/fotos-rodada-final/uso-peles/`.
Exportar, importar e pele de pasta: **feitos sem janela, com o seletor trocado** (Chrome sem janela).

| # | Tipo | O gesto | O que aconteceu | O que devia (a referência) | Estado | Dono |
|:---:|:---|:---|:---|:---|:---:|:---|
| M1 | **DEU ERRO** | aba Peles → **+** → duplo clique no nome → renomear para `camisa_azul` | aparece **"1 aviso"**: *a pele "pele" está ligada e este corpo não a tem* — o nome **ANTIGO**. Fica até a próxima troca. Fotos `07`, `08` | renomear não deixa rastro do nome velho. Spriter: renomear o mapa não gera erro | **medido** (2×) | peles (`panels/skins-actions.ts`; onde a lista de peles ligadas guarda o nome) — chat I |
| M2 | **A SEQUÊNCIA QUEBRA AQUI** | pele nova com o lápis aceso → escolher o desenho `body` → botão direito na imagem `armadura/body` → *Usar no desenho escolhido* (ou botão direito no boneco na cena → escolher imagem) | troca na **BASE** (`default` 23→23). A pele fica com **0 desenhos**. **Desligar a pele não desfaz.** O rodapé não diz onde caiu. Fotos `12`, `13`, `14`, `23`. **Confirma o I-O2** e acrescenta o botão direito da cena | Spriter: a troca de imagem de um *Character Map* mora no mapa: veste e despe. Aqui, "trocar a camisa" muda o boneco para sempre | **medido** | peles (chat I) + o botão direito da cena (chat F) + o menu da imagem (chat H) — o Planejador decide o dono |
| M3 | **NÃO SE ACHA** | pele nova → "e agora, como ponho uma imagem nela?" | nenhum botão, nenhuma frase. O único caminho é **arrastar** a imagem da aba Imagens para a cena com o lápis aceso: cria um desenho **novo** (`body2`), **longe do boneco** (200; −137), sem dizer a qual osso pertence. Foto `15` | Spriter: colunas "imagem original / imagem substituta" à vista (*Edit Character Map*). Spine: arrastar o anexo até o marcador de lugar | **medido** | peles (chat I); a janela de "Fazer a pele" é o mais parecido com o Spriter |
| M4 | **FEZ E NÃO AVISOU** | o mesmo arrastar do M3 | o desenho é criado, mas o rodapé diz *"Não sei o que fazer com JCeMsCm…AAEIFTkSuQmCC. Solte um .bone, um .psd, imagens…"* — um pedaço de texto de imagem, como se o gesto tivesse falhado | dizer *"'body' entrou na pele 'camisa_azul'"* | **a medir** (o arrasto foi feito pela ferramenta do painel; um mouse de verdade pode diferir) | `ui/shell-drop.ts` — chat E |
| M5 | **NÃO SE ACHA** | abrir o herói → aba **Peles**, na largura de fábrica | os nomes saem cortados: `d 23`, `armad… 3`, `armad… 1`. Só se lê arrastando a divisória da coluna da direita. Fotos `04` (antes), `05` (depois) | ler o nome da pele sem mexer no painel | **medido** | peles — `skins.css` (chat I) |
| M6 | **NÃO SE ACHA** | mudar o nome de uma pele | só o **duplo clique** no nome, e nada na tela diz | um botão de lápis com nome; ou *F2* dito na dica | **medido** | peles (chat I) |
| M7 | **FEZ E NÃO AVISOU** | coluna ATIVAS → **×** ao lado da pele | a pele sai da pilha e o desenho some; o rodapé **fica mudo**. (Ligar diz *'Pele "camisa_azul" ligada.'*) Foto `16` | *'Pele "camisa_azul" desligada.'* | **medido** | peles (chat I) |
| M8 | **FEZ E NÃO AVISOU** | arrastar uma pele de FEITAS e soltar **em cima da linha `default`** | nada acontece, nada é dito. Só o vão **"embaixo de todas"** aceita. Foto `17` | aceitar em qualquer ponto da coluna, ou dizer onde soltar | **medido** | peles (chat I) |
| M9 | **DEU ERRO** | Ajuda → **Sobre o Recorte** (no `programa/`) | diz **"Versão 0.1.0"**; o `LEIA-ME` do `programa/` diz v22.7. E o nome do arquivo aberto sai `heroi-DUlefYnW.bone` (**confirma o A2**). Foto `03` | a versão do programa que roda | **medido** | a montagem (`ferramentas/montar-programa.py`) e a Casca (`ui/shell*`) |
| M10 | **NÃO SE ACHA** | achar *exportar*, *importar* e *pele de uma pasta* na aba Peles | sete ícones **sem texto**, iguais em tamanho; o da pasta, o da pasta aberta e o do disquete só se distinguem pela dica. E **Exportar pele só vale para a pele com o LÁPIS aceso**, não para a que foi clicada (o rodapé explica: *"acenda o lápis nela"* — mas só depois de errar) | Spriter: disquete azul e pasta amarela, no mesmo canto, com nome | **medido** | peles (chat I) |
| M11 | **A SEQUÊNCIA QUEBRA AQUI** | exportar a pele `armadura` (lápis aceso → disquete) → apagá-la → **Importar pele…** com o arquivo `armadura.bone` | o seletor de arquivo abre (o mesmo do *Abrir*: várias, `.bone/.json/.boneb/.bonez` e imagens), e depois **nada**: a pele **NÃO volta** e o rodapé **fica mudo**. Foto `34b`. Feito sem janela, com o seletor trocado (2 rodadas) | Spriter: o arquivo de personagem volta com a folha amarela; diz *"carregado"*. Aqui: diz *"importada"* ou diz por que não | **medido** | peles (chat I) + `io/*` (chat E) |
| M12 | **DEU ERRO** | Apagar pele (lixeira) na `armadura`, com `armadura_capa` no herói | a pergunta diz *"Ela veste 3 slot(s)…"* e **não diz** que `armadura_capa` inclui `armadura`. Depois: **"2 avisos"**, um deles em **inglês**: *pele "armadura_capa" › includes › 0: skin "armadura" does not exist; ignored*. Foto `34a3` | dizer na pergunta *"a pele 'armadura_capa' depende desta"*; aviso em português | **medido** | peles (chat I) e o validador (a mensagem em inglês) |
| M13 | **FEZ E NÃO AVISOU** | botão direito no boneco → item **"Em todas as peles"** | clicar **não muda nada** e **não diz nada**; ninguém sabe o que ele faz. Foto `24` | o nome dizer o efeito, ou mostrar o estado (marcado / desmarcado) | **a medir** | cena, o menu do botão direito (chat F) |
| M14 | **CRIEI E SUMIU** | `attack` → 0,27 s → botão direito no desenho → trocar a imagem (o rodapé diz *"a partir de 0,27 s"*) → abrir *Detalhes* | a linha do tempo **não tem fileira nem marca de "imagem"** que mostre a chave criada (só Osso `arm` › Rotação, regras e o Resumo). Foto `31`. **Ver K12/K15** | Spine: o slot ganha uma chave de anexo visível (*Slots*: "the attachment can be keyed") | **a medir** | linha do tempo (chat D) |
| M15 | **DEU ERRO** | botão direito num ponto **vazio** da cena, com uma animação aberta | o rodapé diz *"Não há ferramenta anterior para voltar."* — frase de outro gesto (o botão direito vira "ferramenta anterior") | dizer *"nada aqui para escolher"*, ou nada | **a medir** (visto 1×) | cena (chat F) |
| M16 | **NÃO SE ACHA** | tarefa "pôr uma imagem numa pele" no 1440×900 | a aba **Imagens** e a aba **Peles** moram na mesma coluna e **não cabem juntas**: uma some quando a outra abre. Para arrastar uma imagem para a pele é preciso arrastar o divisor (sem alça à vista, ver K1) até as duas caberem. Fotos `09`, `04` | as duas à vista: a panela e o arroz na mesma bancada | **medido** | a Casca (`ui/shell*`, `colunas-e-barra`) |

**Contagem do chat M:** NÃO SE ACHA **5** (M3, M5, M6, M10, M16) · CRIEI E SUMIU **1** (M14, a medir) · FEZ E NÃO AVISOU **4** (M4, M7, M8, M13) · A SEQUÊNCIA QUEBRA AQUI **2** (M2, M11) · DEU ERRO **4** (M1, M9, M12, M15). Total **16**, dos quais **4 a medir** (M4, M13, M14, M15).

**O que funcionou e o Humberto deve saber que está certo:** a mensagem de *pele de pasta* (*"cobre 1 desenho; 18 continuam os de baixo"*), a de *trocar no meio da animação* (*"a partir de 0,27 s, só nesta animação"*), a de *exportar* (*"exige 6 nomes de quem a usar"*) e a janela *Exportar → Por pele…* (tabela *"O que vai sair"*).

**Nota do chat K sobre o K5, 29/09/2026, 00:25 (por aviso do Planejador):** o colar espelhado **existe**, no menu **Animação**. Eu procurei em `Editar`, `Esqueleto` e `Animação` só na parte de cima da lista e não vi. **Continua sendo NÃO SE ACHA**: o lugar onde um usuário procura colar pose é o `Editar`, ao lado de *Colar*, e é lá que ele devia estar (ou uma pista de onde está). O texto do K5 acima fica como foi escrito.

## Chat C — o passo 14 do roteiro cai por TEMPO (29/09/2026, 00:24)

| # | Tipo | Onde | O que acontece | Números | Dono |
|:---:|:---|:---|:---|:---|:---|
| C1 | **DEU ERRO** (na prova, não no programa) | `ferramentas/provas/roteiro-30.mjs`, passo 14, `ate('(__r.doc().file.slots ?? []).length > 0', 5000)` | com a máquina a 100%, **Abrir pasta** leva mais que 5 s; o roteiro lê o documento antes de ele chegar e diz *"reaberto diferente do salvo"*, com tudo → nada | 13 de 14 às 00:11 e 00:13. Numa cópia fora da pasta, esperando até 60 s: **40,9 s**, **11,1 s** e **14,6 s**, e **14 de 14** as três vezes, com o código de hoje. CPU 100%: 9 Vite, 6 `programa/servidor.mjs`, 56 Chrome, 2 scripts de outros chats | `ferramentas/provas/`, **sem dono nesta rodada**. Conserto pelo TEMPO, nunca encurtando a prova |

A forma do meu erro: *medi com a casa parada de gravar, e não parada de rodar.*

## Do chat E — 29/09/2026, 00:26 — usando o importar com arquivo de verdade (lote 3)

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| E2 | **Um projeto de verdade do Spriter entra INVISÍVEL.** 176 avisos *"image not found in any atlas; attachment will be invisible"*, 0 atlas, a cena só com os triângulos dos ossos. O Spriter não tem atlas: usa as imagens soltas da pasta. O importador lê as imagens que vieram junto e ninguém as liga ao boneco | soltar `exemplo/game/bcp.scml` + as 129 imagens das subpastas, cada uma com o caminho de dentro da pasta. Foto: `backup/fotos-rodada-final/arquivo/lote-3_spriter.png` | **medido** | `io/import-foreign.ts` e o caso `'outro'` de `ui/shell-drop.ts` — **meu** |
| E3 | **Não há gesto que traga as subpastas de um projeto do Spriter.** O menu "De outro programa…" escolhe arquivos de UMA pasta; "Abrir pasta…" vê o `.scml` e o ignora (só procura `.bone`); e arrastar a pasta na janela entrega ao programa só o nome dela — o `drop` lê `dataTransfer.files`, que não desce em pasta | os três gestos, com `exemplo/game` | **a medir** (o do arrasto é o comportamento conhecido do navegador; falta a foto) | o arrasto é **meu** (`shell-drop.ts`); "Abrir pasta…" e o menu são da **casca** (`ui/shell-file.ts`) |

Do mesmo passeio, o que funcionou, para ninguém medir de novo:

| Gesto | Arquivo | Resultado |
|:---|:---|:---|
| De outro programa, solto | herói do Spine: `heroi-spine.json` + `heroi.atlas` + `heroi.png` (`ferramentas/testes/exemplos-de-fora/`) | 21 ossos, 18 slots, `andar` e `parado`, **0 avisos**. Foto `lote-3_spine.png` |
| PSD, solto num documento vazio | `formato/exemplos/heroi.psd` | 19 camadas, 19 slots, 1 página, **0 avisos**; um passo de desfazer ("Importar PSD"). A janela da página avisa que a camada `ossos` foi ignorada e aponta "PSD com ossos…". Foto `lote-3_psd.png` |

## Do chat F — 29/09/2026, 00:27 — achados fazendo a fila da cena (lote 2)

Fotos: `backup/fotos-rodada-final/cena/lote-2_passo-NN_*.png`. A fila inteira, com as quatro perguntas, está em `documentos/pesquisa/nova pesquisa/SEQUENCIA cena e ferramentas 2026-09-28.md`.

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| F1 | **O recado do rodapé é escrito e apagado no mesmo quadro.** Com o botão apertado a cena chama `doc.repose()` a cada quadro, que emite uma mudança sem nome, e o rodapé volta a "Arquivo não salvo". "Segure Alt e arraste para desenhar a caixa" existe no código e ninguém nunca leu | Caixa (X) → arrastar no vazio sem Alt. Foto `passo-17` | **medido** (gravei os recados: o de cima foi dito, o rodapé não mostrou) | chat F, lote 3 |
| F2 | **Nenhum arrasto diz o que fez ao soltar**: mover, girar, escalar, criar osso. Só o desfazer diz ("Desfeito: Mover osso") | Transformar → arrastar a cabeça. Foto `passo-03` | **medido** | chat F, lote 3 (com o F1) |
| F3 | **Girar um osso que uma regra segura grava no arquivo e não muda a tela, calado.** Cabeça: `look_driver` (driver, modo `add`) — sem ele o giro aparece. Braço: `ik_arm` | herói, base aberta → escolher a cabeça → girar pela bolinha. Arquivo: −53,8°; tela: parada. Fotos `passo-04`, `passo-07` | **medido** (tirei cada regra por um instante e medi) | o aviso: chat F. Se o driver `add` devia somar ao giro: `runtime/`, **fora das cercas** |
| F4 | **Caixa e Ponto não dizem o gesto ao serem pegos na barra** (o Criar osso diz). Arrastar sem Alt não faz nada | barra → Caixa. Fotos `passo-16`, `passo-19` | **medido** | `ui/toolbar-model.ts`, `toolFooter` — chat A, ou F se a cerca mudar |
| F5 | **A tela pula 56 px.** A dica do Criar osso no rodapé é longa, não quebra, e empurra a coluna da direita para fora. Ao trocar de ferramenta, volta. O clique seguinte cai no lugar errado | barra → Criar osso → arrastar um osso → apertar T. Fotos `passo-12`, `passo-13`, `passo-14` | **medido** | chat A (CSS do rodapé, `ui/toolbar-model.ts`) — já passado à casca |
| F6 | O K11 do chat K, medido por aqui: a aba Malha e pesos estava **escondida** atrás de Animações e ligou a Malha mesmo assim | foto `passo-02_escolher-a-cabeca-liga-a-malha` | **medido** | chat D |
| F7 | A Árvore **não rola** até o osso escolhido na cena (é o B2) | escolher o braço na cena. Foto `passo-06` | **medido** | chat D |

## Do chat L (USO · malha e pesos) — 29/09/2026, 04:32 — a fila de malha e pesos, feita com a mão

Programa **montado v22.8** (`programa/`, porta 5312), herói, desenho `body`. Fotos em
`backup/fotos-rodada-final/uso-malha/` (as `hd*` são em 1280×720 cheios). Tipos:
**NÃO SE ACHA · CRIEI E SUMIU · FEZ E NÃO AVISOU · A SEQUÊNCIA QUEBRA AQUI · DEU ERRO**.
Detalhe passo a passo em `documentos/pesquisa/nova pesquisa/SEQUENCIA malha e pesos 2026-09-28.md`.

| # | Tipo | O defeito — o que aconteceu | O gesto | O que devia (referência) | Estado | Dono |
|:---:|:---:|:---|:---|:---|:---:|:---|
| L1 | **NÃO SE ACHA** | **O pincel de pesos é só um ÍCONE na barra de cima**, sem nome à vista. O painel Malha e pesos tem um grupo **"Pincel ▸"** (Somar, Subtrair, Substituir, Suavizar, Raio, Força) que **abre mas não liga o pincel**. Quem abre o grupo e arrasta na cena não pinta nada, e nada diz por quê | herói → `body` → Virar malha → Ligar ossos → Pesos automáticos → abrir "Pincel ▸" → arrastar na cena com a ferramenta Malha: nada. O pincel só liga clicando no ícone de pincel da barra | Spine: a ferramenta **Weights** tem o painel dela, e ligar a ferramenta liga o pincel. O grupo do painel devia ter um botão **"Pintar pesos"** que liga a ferramenta, ou avisar *"ligue o pincel (ícone da barra)"* | **medido** | chat D (`panels/mesh-panel*`: o botão/aviso) e chat B (`viewport/viewport-toolbar.ts`: o nome do ícone) |
| L2 | **A SEQUÊNCIA QUEBRA AQUI** | **Depois de "Pesos automáticos", a cena não muda.** Os pesos só se veem **com o pincel da barra ligado** (cada ponto ganha a cor do osso). Sem isso a pessoa aperta "Pesos automáticos" e não vê nada acontecer | mesmo gesto do L1, parar em "Pesos automáticos" e olhar a cena | Spine: ao ligar os ossos, a ferramenta Weights **mostra** cores e pizzas de uma vez. O passo seguinte ao "Pesos automáticos" devia ser um aviso *"veja os pesos: ligue o pincel"* | **medido** | chat D |
| L3 | **FEZ E NÃO AVISOU** | **O resultado dos pesos automáticos fica escondido.** O rodapé diz só "Pesos automáticos." O aviso de verdade — *"Pesos automáticos em 35 vértices."* — está num quadro azul **no fim do painel, abaixo da dobra**, e só se vê rolando | mesmo gesto do L1; olhar o rodapé e o painel sem rolar | o resultado no rodapé, que é onde o resto do programa avisa (como no "Ligar ossos") | **medido** | chat D |
| L4 | **FEZ E NÃO AVISOU** | **Virar malha, Traçar contorno e Gerar automática dizem o NOME do botão, não o resultado.** Rodapé: "Ligou a ferramenta Malha (M), para mexer na cena." / "Traçar contorno." / "Gerar malha." Nenhum diz que a malha foi criada nem quantos pontos tem | `body` → Virar malha → Traçar contorno → Gerar automática, olhando o rodapé | "Malha criada: 4 pontos." / "Contorno traçado: N pontos." / "N pontos, N triângulos." — como o "Ligar ossos" já faz: `"torso" entrou na malha "body", com peso 1 em todos os pontos.` | **medido** | chat D |
| L5 | **A SEQUÊNCIA QUEBRA AQUI** | **O painel Malha e pesos é uma lista vertical longa numa janela baixa.** Em 1280×720 mostra ~8 linhas por vez (no app, a 800×450, eram 4). A ordem certa (Forma → Vértices → Ossos → Pesos → Pincel) existe, mas o passo seguinte quase sempre está **abaixo da dobra** | abrir Malha e pesos e tentar seguir de cima a baixo sem rolar | Spine: o painel de pesos mostra ossos e ferramentas juntos. Aqui: a lista de ossos, o botão de pesos automáticos e o pincel nunca cabem na mesma vista | **medido** | chat D, lote 4 (já está na ficha D: cabe, rolando, grupos dobráveis) |
| L6 | **FEZ E NÃO AVISOU** | **"Criar aresta" fica apagado sem dizer por quê.** Clicar nele apagado não faz nada e não avisa. Ele só acende com **dois vértices escolhidos**, e a única forma que achei foi **Shift+clique** — nenhuma dica na tela | Virar malha → Gerar automática → clicar "Criar aresta" (apagado) → nada. Depois: clicar um ponto (fica laranja) e **Shift+clicar** outro | Spine: ferramenta **Create**: arrasta de um vértice a outro. Aqui devia haver o aviso *"escolha dois pontos (Shift+clique)"* quando o botão está apagado | **medido** | chat D (`mesh-panel*`, `viewport/tools/mesh-tool.ts`) |
| L7 | **CRIEI E SUMIU** | **A aresta criada à mão não se distingue das que a malha traçou sozinha.** Depois de "Criar aresta" o botão vira "Apagar aresta" e o rodapé diz "Criar aresta.", mas na cena não vi nenhuma linha nova de cor própria | escolher dois vértices vizinhos → Criar aresta → olhar a cena | Spine: aresta **manual em laranja**, as automáticas em cinza tracejado | **a medir** (dois pontos vizinhos já tinham fio) | chat D |
| L8 | **FEZ E NÃO AVISOU** | **Pintar peso não avisa.** Com o pincel ligado e o osso escolhido, arrastar muda as cores e os números (arm 38% → 57%), mas o rodapé continua "Arquivo não salvo." Não diz qual osso foi pintado, nem se somou ou substituiu | pincel da barra → clicar o nome `arm` na lista de ossos → arrastar na cena | "Pintou `arm` em N pontos (Somar)." | **medido** | chat D |
| L9 | **NÃO SE ACHA** | **O osso que o pincel pinta é o que se escolhe pelo NOME, na lista de ossos do painel.** Nada diz isso. O nome fica **cortado** ("tor…") e a lista está **longe da cena** (no fim do painel, à direita). A legenda de cores (verde = torso, roxo = arm) **não existe na cena**: só na lista | Malha e pesos → rolar até "Ossos que influenciam" → clicar o nome do osso → pincel ligado → arrastar | Spine: lista de ossos com cor **ao lado** da cena, osso ativo destacado | **medido** | chat D |
| L10 | **FEZ E NÃO AVISOU** | **Girar o osso `arm` não faz nada e não diz nada.** Girar o `torso` funciona (e o desenho deforma). O `arm` tem o ícone de telefone (IK): o anel de girar aparece, arrasta-se, **nada gira, nenhuma mensagem** | ferramenta Girar → escolher `arm` → arrastar o anel azul | ao menos um aviso: *"`arm` é comandado por IK: gire o alvo, ou desligue o IK"* | **a medir** (não sei se é o IK; só vi que `torso` gira e `arm` não) | chat F (`viewport/tools/select.ts` e o girar) |
| L11 | **A SEQUÊNCIA QUEBRA AQUI** | **Testar os pesos dobrando o osso grava na BASE, sem animação aberta.** O rodapé mostra só a etiqueta "Base: heroi — Mexer grava na base", sem mensagem do gesto. Funciona e dá para desfazer ("Desfeito: Girar osso."), mas nada diz *"isto é só um teste, desfaça, ou abra uma animação"* | escolher `torso` → Girar → arrastar o anel. O arquivo fica "não salvo" com o boneco torto | Spine: *"teste em Setup e desfaça, ou em Animar com auto-chave desligada"*. Aqui, um aviso no primeiro giro depois de mexer nos pesos | **a decidir** | chat F (aviso) e chat D (o passo "testar" no painel) |
| L12 | **A SEQUÊNCIA QUEBRA AQUI** | **Malha e pesos e Animações moram no MESMO grupo de abas.** Para testar os pesos dentro de uma animação é preciso **trocar de aba** a cada vez. Os dois nunca se veem juntos | abrir Animações → clicar `idle` → clicar a aba Malha e pesos: a lista de animações some | Spine: a árvore, a cena e a linha do tempo à vista; só o painel de pesos alterna | **a decidir** | Casca (`ui/shell*`, arranjo dos painéis) — **sem dono na rodada** |
| L13 | **DEU ERRO** (leve) | **Mensagens do rodapé terminam com DOIS pontos.** "Ligou a ferramenta Malha (M), para mexer na cena.." · "…Ligar ossos de novo termina.." · "Modo de ligar ossos fechado.." | qualquer passo acima, olhar o fim do rodapé | um ponto só. A mensagem já traz o ponto e a casca acrescenta outro | **medido** | Casca (`ui/shell*`: quem junta a mensagem com "Arquivo não salvo") e chat D (os textos do painel) |
| L14 | **A SEQUÊNCIA QUEBRA AQUI** | **O rodapé com mensagem longa passa para DUAS linhas e a tela PULA.** "Clique nos ossos que puxam esta malha. Ligar ossos de novo termina." empurra a linha do tempo e a cena para cima; o desenho e o botão que eu ia clicar mudam de lugar entre uma foto e outra | Malha e pesos → Ligar ossos, em 1280×720 (foto hd06) | o rodapé com altura fixa, ou a mensagem cortada com "…" | **medido** | Casca (`ui/shell.css`, a barra de estado) — **sem dono na rodada** |
| L15 | **CRIEI E SUMIU** | **Abrir o herói deixa o boneco pequeno e cortado no alto da cena** (zoom 100%, cabeça fora da vista). Quem vai fazer a malha da camisa vê um boneco de poucos centímetros e precisa achar **Ajustar** e rolar o mouse para ver um ponto de malha | tela inicial → **Abrir o herói** → olhar a cena | a cena **ajustada** ao abrir (o que o botão "Ajustar" já faz) | **medido** | chat F (`viewport/viewport.ts`) |
| L16 | **NÃO SE ACHA** | **Na barra de cima, o último botão fica CORTADO na borda direita** em 1280×720: "Travar desenhos" aparece como "Trav…", e o que vier depois some | abrir o editor em 1280×720 (foto hd01) | a barra rolar, ou quebrar em duas linhas, ou agrupar o excesso em "Mais ▾" | **a medir** (não rolei a barra para ver se há mais botões) | Casca (`ui/shell*`) — **sem dono na rodada** |

**O que já está bom** (não mexer): o aviso do **Ligar ossos** é o modelo — o painel abre um
quadro azul *e* o rodapé diz *"Clique nos ossos que puxam esta malha. Ligar ossos de novo termina."*;
depois cada osso ligado diz o que aconteceu (*`"torso" entrou na malha "body", com peso 1 em
todos os pontos.` / `"arm" entrou na malha "body" com peso 0: pinte, ou use Pesos automáticos.`*),
**com o passo seguinte dentro da frase**. O "Criar vértice" faz o mesmo. O **desfazer** avisa
("Desfeito: Girar osso."). O que falta é **levar esse padrão ao resto do painel**.

**Ainda por fazer (quando o Planejador disser "casa livre"):** o passo 11 — *arrastar um
vértice na animação e ver a chave nascer* — e a foto dele.

| # | Tipo | Onde | O que acontece | Números | Dono |
|:---:|:---|:---|:---|:---|:---|
| C2 | **LENTO** | Arquivo → Abrir pasta do projeto, com o herói salvo na pasta | abrir leva **5 a 6 segundos** com a máquina vazia — é lento para quem usa. A prova do roteiro passou a esperar 30 s (C1, P39), e **isso não esconde este número**: ele fica escrito aqui | 29/09, CPU 11%: hoje 4,6 s, 5,3 s e 5,3 s; a v22.8 5,3 s e 6,2 s — não piorou, já era assim | `io/project-folder.ts`, **chat E** |

### Do chat L — 29/09/2026, 05:06 — o passo 11, na v23.1

| # | Tipo | O defeito — o que aconteceu | O gesto | O que devia (referência) | Estado | Dono |
|:---:|:---:|:---|:---|:---|:---:|:---|
| L17 | **FEZ E NÃO AVISOU** | **Arrastar um vértice na animação cria a chave, mas o programa não diz.** O vértice anda e nasce um losango em 0,53 s no "Resumo"; o rodapé só repete a etiqueta "Animação: idle — Mexer grava chave." Não vi a linha própria da deformação na linha do tempo (só o "Resumo"). E **arrastar sem escolher o vértice antes não faz nada**, sem aviso | abrir `idle` → tempo 0,53 s → ferramenta Malha → **clicar** o vértice → arrastar | Spine: mover vértice em Animar cria uma **Deform key**, com linha própria. Aqui: rodapé *"Chave de deformação criada em 0,53 s (body)."* | **medido** (v23.1) | chat D (`viewport/tools/mesh-tool.ts`, o aviso) e chat G/linha do tempo (a linha da deformação) |

## Do chat A2 (`EXECUTANDO · a casca`) — 29/09/2026, 05:09

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| A3 | **consertado às 05:08**, espera a janela 2. Duas formas: *o ouvinte tratava "limpo" como "acabei de salvar"* e *a saída gravava o rascunho mesmo limpo*. Agora só o SALVAR apaga, e fechar a aba limpo não grava. Leva junto o **J13** | — | **consertado** | chat A2 |
| A2-1 | **A SEQUÊNCIA QUEBRA AQUI.** O rascunho é **um só**. Quem escolhe "Agora não — guardar o rascunho" e depois **mexe** no documento novo grava por cima do guardado, calado: o trabalho recusado some | herói mexido → recarregar → "Agora não" → criar um osso → recarregar: a janela oferece o novo, e o herói sumiu | **medido** (é o passo 4 da medição do A3, 29/09, 00:20) | chat A2. Decisão do Planejador: guardar os dois, o antigo com a data, e a janela de recuperar mostra os dois. Depois do P19 |


## Do chat E — 29/09/2026, 05:20 — achado consertando o E2

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| E4 | **Salvar perdia os quadros de uma sequência** — a pasta numerada (degrau 8.6) e a folha do Aseprite (v22.5). O Salvar empacota só as imagens "em uso", e o `imagesInUse` contava a sequência pelo PREFIXO (`olho_`), nenhum quadro. E contava a caixa `corte` do Spriter como imagem: o Salvar levaria uma imagem que ninguém usa | pasta com `olho_01…03` → Trazer como sequência → Salvar → reabrir. Medido por sonda: *"Salvar leva: [ 'corte' ]"* | **consertado** às 05:20 (`io/project-folder.ts`, `imagesOfAttachment`), com teste | chat E |

**A forma (regra 27):** *contei o nome do anexo como nome de imagem.* Onde
mais ela vale: todo leitor de `imagesInUse` — o Salvar (`folder-save.ts`), o
"Trocar a pasta de origem" da aba Imagens (`panels/palette.ts`, chat H) e o
importador do Spriter (E2). Os três passam a ver os quadros e a deixar a caixa.

| # | Tipo | Onde | O que acontece | Forma | Dono · estado |
|:---:|:---|:---|:---|:---|:---|
| C4 | **DEU ERRO**, calado (regra 21) | aba Regras → botão **"Assar a física em chaves"** | o botão pedia o ícone `key`, que **não existia**: desde o degrau 12 ele desenhava a **letra "A"** no lugar (dá para ver nas fotos `lote-1_*` e `lote-2_*`). Achado pelo teste do lote 3 (`hasIcon('key')` deu `false`) | *usei um nome de ícone que ninguém tinha desenhado, e o desenho de reserva escondeu a falta.* É a mesma cara do `ik` de 15/09, que virou LETRA na mão do herói | chat C · **fechado** em 29/09, 06:08: o ícone `key` entrou em `ui/icons.ts` (só acréscimo). Número da versão: a da janela de fecho |

### Do chat K — v23.2, 29/09/2026, 10:04 — defeitos novos achados refazendo a fila

Programa montado v23.2. Fotos em `backup/fotos-rodada-final/uso-animar/v23.2/`. A conferência de K1 a K15 está em `SEQUENCIA animar um ciclo de andar 2026-09-28.md`, seção "Conferência na v23.2".

| # | Tipo | O defeito | O gesto | O que devia ser | Estado | Dono |
|:---:|:---|:---|:---|:---|:---:|:---|
| K16 | **DEU ERRO** | Ao **trocar a imagem** de um desenho, os **Detalhes abrem sozinhos e cobrem o tocador**: Chavear e Chavear tudo aparecem cortados pela metade (fotos 28, 29). O botão Detalhes, para fechar, fica meio escondido | Animação aberta → 0,50 s → escolher o rosto → Ficha rápida → Imagem → escolher outra | Se a linha do tempo abre para mostrar a chave, o tocador continua inteiro | **medido** | Casca e layout (`ui/shell.css`) / Linha do tempo |
| K17 | **NÃO SE ACHA** | O painel **Propriedades tem 3 linhas de altura** em 1440×900. Ângulo, Escala e Posição do osso ficam escondidos; só rolando (fotos 31, 32) | Escolher um osso → olhar Propriedades | O campo que se usa toda hora (Ângulo) à vista | **medido** | Ficha (`panels/properties*`, chat B) e a altura dos painéis (Casca) |
| K18 | **a medir** | **Ctrl+V pelo teclado não colou** (o menu `Editar → Colar` colou). Pode ser só o meu Chrome sem janela. **Ninguém conserte antes de outro olho** | Copiar a pose (Ctrl+Shift+C) → End → Ctrl+V | Colar as chaves e dizer *"Colar chaves."* | **a medir** | Casca e menus (`ui/keys.ts`) |


## Do chat E — 29/09/2026, 10:06 — achado provando o E4 no programa montado

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| E5 | **Salvar a folha do Aseprite estragava todos os quadros, calado.** Depois de salvar e reabrir, cada quadro mostrava a TIRA INTEIRA — os oito bonecos lado a lado —, e o rodapé dizia "Nenhum aviso". O Salvar lia a PÁGINA de cada região; os oito quadros dividem uma página, o empacotador via oito imagens iguais e guardava uma, com sete apelidos | `programa/` v23.2 → Abrir pasta (vazia) → soltar `boneco.png` + `boneco.json` → Salvar → Abrir pasta de novo → `pular` em 0,30 s. Fotos `backup/fotos-rodada-final/arquivo/E5_antes.png` (v23.2) e `E5_depois.png` | **consertado** às 10:06 (`io/folder-save.ts`, `regionCrop`), com teste | chat E |

**A forma (regra 27):** *li a página no lugar da região.* Na pasta cada imagem é
a sua página, e o erro não aparecia; ele só existe onde uma página tem várias
regiões — hoje, a folha do Aseprite. **O E4 só foi pego por causa da prova de
ida e volta que o Planejador pediu; e o E5 só apareceu porque a prova rodou no
programa montado, com salvar e reabrir de verdade.**

## Do chat E — 29/09/2026, 10:09 — a foto do Spriter de verdade

| # | O defeito | O gesto | Estado | Dono |
|:---:|:---|:---|:---:|:---|
| E6 | **O projeto de verdade do Spriter TRAVA a página quando entra inteiro.** Cada imagem do jogo tem 1664×1157 (≈7,7 MB aberta). Com 10 imagens, entra em ~10 s e o desenho aparece (foto `arquivo/E2_dez.png`). Com 20, a página para de responder por mais de 2 minutos, e nem o depurador consegue pausá-la — ou seja, a trava não é no JavaScript. Com as 88 que o boneco usa, é o que eu fazia às 05:40, e provavelmente parte do que derrubou a máquina às 05:57 | soltar a pasta `exemplo/game` inteira na janela | **a medir** — medido só em Chrome SEM placa de vídeo (desenho por software). Falta medir com placa de vídeo, e sem risco para a memória da casa | **a decidir**: a leitura é minha (`io/`); o desenho das imagens grandes é da cena (F) e da aba Imagens (H) |

A lógica do E2 está provada fora da tela: fora do navegador o passo inteiro leva
25 ms, e dos 176 avisos sobram **2**, os dois da única imagem que falta de
verdade (`mao/_0000_Camada-1-copiar_tmp5068`, um arquivo sem extensão no disco).

## Do chat M — v23.2 — 29/09/2026, 10:20 — conferindo os consertos de peles (programa montado, porta 5313)

Veredito de M1–M16 na v23.2: `documentos/pesquisa/nova pesquisa/SEQUENCIA peles e troca de roupa 2026-09-28.md`, seção "3ª parte". **8 consertados · 5 pela metade · 3 não consertados.** Fotos: `backup/fotos-rodada-final/uso-peles/v23.2/`.
Ainda abertos da lista antiga: **M7** (despir sem aviso), **M15** (botão direito no vazio), **M16** (Imagens e Peles não cabem juntas), e pela metade **M9, M10, M11, M12, M13**.

| # | Tipo | O gesto | O que aconteceu (v23.2) | O que devia | Estado | Dono |
|:---:|:---|:---|:---|:---|:---:|:---|
| M17 | **A SEQUÊNCIA QUEBRA AQUI** | herói → aba Peles → acender o lápis da `armadura` → Arquivo → Exportar → *Pele, para outro boneco…* (grava `armadura.bone`, 1 474 bytes) → apagar a pele → Arquivo → Importar → *Pele, de outro boneco…* com esse arquivo | o rodapé diz *"Importar pele parou: /bones: expected an array."* e "1 aviso". A pele **não volta**. A exportação diz *"exige 6 nomes de quem a usar"*, mas a importação **recusa** o arquivo que ela mesma gerou. A frase é técnica e em inglês. Fotos `71`, `74` | o que sai da Exportar entra na Importar; e, se não entra, dizer em português por quê | **medido** (feito sem janela, com o seletor trocado; 2 rodadas na v22.7 e 1 na v23.2) | peles (chat I) + `io/*` (chat E) |
| M18 | **NÃO SE ACHA** | Esqueleto → **Peles ▸** | só há **2 itens**: *Trocar imagem nas peles…* e *Promover pele a base…*. *Nova pele* e *Fazer a pele de uma pasta* **não estão em menu nenhum nem na Paleta de comandos** (só nos ícones sem texto). Fotos `13`, `83`. Árvore → Novo ▾ → **Pele** existe (`82`) | os dois estarem em Esqueleto → Peles ▸ (a fila do Spriter começa por "criar") | **medido** | peles (chat I) e a Casca (`ui/menus.ts`) |
| M19 | **NÃO SE ACHA** | criar uma pele nova, no 1440×900 | a faixa nova *"A pele … está vazia. Arraste uma imagem…"* (três linhas) empurra FEITAS e ATIVAS para baixo: **ATIVAS sai cortada**; e a aba **Imagens**, de onde se arrasta, fica **sem uma imagem à vista** (só o cabeçalho). Foto `22`. Agrava o M16 | a instrução aparecer **com** a aba Imagens aberta ao lado | **medido** | peles (chat I) e a Casca (colunas, `colunas-e-barra`) |
| M20 | **FEZ E NÃO AVISOU** | escolher um **osso** (ou nada) na Árvore → Esqueleto → Peles ▸ | *Trocar imagem nas peles…* fica **cinza sem dizer por quê**. Com um desenho escolhido, funciona e o banner explica bem. Fotos `13` (nada escolhido) e `40` (o mesmo item já habilitado, com o desenho `body2` escolhido) | uma dica *"escolha um desenho, não um osso"* | **medido** | peles (chat I) |

## Do chat A2 — 29/09/2026, 10:27 — o A2-1 consertado

| # | O defeito | Estado | Dono |
|:---:|:---|:---:|:---|
| A2-1 | O rascunho único, que o trabalho novo apagava depois de "Agora não" | **consertado às 10:20** (P55), espera a v23.3. Fotos `p55_antes.png` e `p55_depois.png` | chat A2 |
| A2-2 | **Visto na foto do P12:** com a faixa de baixo aberta, as abas "Linha do tempo / Curvas" cobrem a barra do tocador (cortam "Chavear" e o tempo). Foto `backup/fotos-rodada-final/defeitos/p12_depois.png` | **medido** | faixa de baixo — chat P ou D |
| A2-3 | **Visto nas fotos dos menus:** "Repetir a última exportação" quebra NO MEIO da palavra no menu Arquivo ("exportaçã / o"). Foto `menu-Arquivo_depois.png` | **medido** | CSS do menu — chat P |
| A2-4 | **Visto nas fotos do P19:** o primeiro campo do rodapé ficou estreito — "Arquivo salvo." sai "Arquivo sa…". Foto `p19-cor_depois.png` | **medido** | CSS do rodapé — chat P |


## Do chat J — 29/09/2026, 10:27 — conferência na v23.2

Fila refeita na v23.2 (`programa/LEIA-ME.txt`), fotos em `backup/fotos-rodada-final/uso-boneco/v23.2/`. Resposta por defeito em `documentos/pesquisa/nova pesquisa/SEQUENCIA do zero ao boneco montado 2026-09-28.md`, seção "Conferência na v23.2". Resumo: consertados J3, J4, J7, J12, J13 · pela metade J8 · não consertados J1, J2, J6, J9, J10, J11, J14, J15 · não conferido J5.

**Retratação do J8:** o "arrastar uma linha não escolhida não faz nada" era do arrasto simulado do painel do aplicativo. Em Chrome sem janela arrastar linha não escolhida funciona (*"1 item virou filho de osso2."*). Vale só a metade "nada na tela diz que dá para arrastar".
**J9 agora é "medido":** `Ângulo` 32,74 → 90 no `osso` com 4 desenhos filhos; rodapé *"Mudar Ângulo."*; nada se mexe. Fotos q19, q20.

| # | Tipo | O defeito | O gesto | O que devia acontecer | Versão | Dono |
|:---:|:---|:---|:---|:---|:---:|:---|
| J16 | **FEZ E NÃO AVISOU** | O rodapé corta a mensagem com reticências e some o próximo passo: *"…Para prender num osso: com ela escolhida, cr…"*, *"Osso novo pegou 1 desenho, se…"*, *"…na ponta de…"* | soltar uma imagem na cena; criar um osso. Fotos q05, q10, q12 | a mensagem inteira à vista (ou em 2 linhas) — a régua do arroz pede que o passo seguinte esteja à vista | v23.2 | Casca e menus (`ui/shell.css`, a barra de estado) |
| J17 | **NÃO SE ACHA** | Com um osso escolhido, a `Ficha rápida` mostra X, Y e Escala; o `Ângulo` fica abaixo da borda, só rolando | escolher um osso em 1440×900. Foto q19 | o ângulo à vista, junto de X e Y | v23.2 | Ficha e propriedades (`panels/properties*`) |
