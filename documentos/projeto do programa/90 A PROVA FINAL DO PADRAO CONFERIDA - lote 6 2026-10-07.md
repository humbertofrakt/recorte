# A prova final do padrão conferida — lote 6 (v35.4) — 07/10/2026

Rodada 47, lote 6, o último. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.4** (o "Sobre" diz v35.4; servi o zip `recorte v35.4 2026-10-07.zip`, extraído fora da pasta; o zip é das 08h33) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 08h34 a 08h44, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote6/` (16) |
| Material | o herói de exemplo; um emissor *Fogo* no `foot_b`; o `body` virado em malha; um evento novo; o `heroi.bone` solto numa pasta vazia (42 avisos). **Nada foi salvo**; os arrastos da Ordem, **desfiz e conferi**. **Não rodei `medir`, roteiro nem pesos**: o número da altura **li no `ESTADO.md`** |

## O quadro (os itens do lote 5b que passaram para esta versão, e os do lote 6)

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **6** (1, 2, 3, 5, 6, 8) | **3** (5b, 6b, 9) | **1** (4) | 10 |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 1 | Na Ordem, soltar uma peça para a frente de outra **não parte a pasta** | **vi funcionar** |
| 2 | A barra diz *"N avisos"* igual à janela (e **o clique abre a janela**) | **vi funcionar** |
| 3 | *"skins ▾"* | **saiu de vez** (vi funcionar) |
| 4 | Em 720, a Ordem mostra 3 linhas | **não funciona** (1 linha inteira) |
| 5 | Clique na barrinha leva o foco: 3 teclas = 3 casas (Regras, Alfa, **Partículas**) | **vi funcionar** |
| 5b | O mesmo na **barra de velocidade do tocador** | **pela metade** (o foco chega; as setas movem a agulha) |
| 6 | Dicas e as 4 barras da Prévia com nome | **vi funcionar** |
| 6b | *"Copiar para a linha do tempo"* numa linha | **pela metade** (duas linhas) |
| 7 | A tabela dos painéis, em 1920 e 1280 | ver abaixo |
| 8 | Número da altura (lido) | **82 de 90**, subiu 1 |
| 9 | Um usuário novo lê a Prévia, as Curvas e a chave de evento | **pela metade** |

*(A linha 7 é a tabela dos painéis: não entra na contagem.)*

## Os defeitos

| # | Defeito | Foto |
|:---:|:---|:---|
| 1 | **Em 1280×720 a Ordem mostra uma linha inteira, não três.** Recarreguei a página em 1280×720 e abri o herói: o corpo da aba tem **122 px**, a lista **75 px**, e só `hand` (45 px) cabe inteira; a segunda aparece cortada. (Sem recarregar, depois de mudar a janela, eram 87 px e **zero** linhas) | `E2_ordem_720_recarregado` |
| 2 | **A barra de velocidade do tocador não ajusta com a seta.** Com a `idle` aberta, o clique na barra leva o foco **(vi `activeElement` ser a barra, ainda com o botão apertado)**, e `→` ×3: **a velocidade continua em 46** e **a agulha anda** (0,00 → 0,03 → 0,07 → 0,10 s); `←` volta a agulha; `↑` vai à chave anterior. (`PageUp` mexeu na barra: 46 → 65, na v35.3.) Na base o tocador está apagado e o clique **não** leva o foco | `F2_velocidade` |
| 3 | **As barras de *Cor ao nascer* das Partículas são de 26 e 31 px** (a de *Cor do emissor*, 59 px): acertar o polegar é difícil. Cada uma **tem a dica** (*"Cor ao nascer (de), opacidade: 100 % (de 0 a 100 %…"*) e **3 teclas = 3 casas** | `G1_particulas_cor` |
| 4 | **O *Copiar para a linha do tempo* ainda ocupa duas linhas** (*"Vira animação nova, uma chave por quadro"*, 42 px em 234 px) e o bloco *"O que se perde na cópia"* segue com cinco frases de jargão (*morphs, variáveis e tags*, *sequência de imagens*, *cor de slot*) | `L0_previa_1920` |
| 5 | **Em 1920 e em 1280 a *Regras* e a *Prévia* rolam inteiras** (a lista, os parâmetros e as variáveis juntos rolam como um corpo só); e em 1280 rolam também a *Malha e pesos*, a *Exibição*, a *Skins*, a *Entidades* e a ficha do desenho. O pedido era *"só as listas rolam"*. Está na tabela abaixo | `J_Regras_1280` · `J_Malha_1280` · `J_Exibição_1280` |
| 6 | *Pequeno.* **Soltar uma peça depois da última de uma pasta não faz nada, e o rodapé não diz** (a notícia continuava *"Desfeito: Mover peça"*): é um gesto sem resposta | `B2_depois_da_ultima` |
| 7 | *Pequeno.* **Os nomes seguem cortados** na Árvore, na Ordem e na Regras: *"arm → forearm → hand_tar"*, *"cape1 → cape2 → cape_pat"*, *"de -1 a 1 · look_driver"* (o nome da regra **está inteiro**; o corte é na linha de baixo, a dos ossos) | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Na Ordem, soltar uma peça para a frente de outra não parte a pasta (ou avisa antes) | **vi funcionar** | `forearm` solta no **terço de cima** de `shin_front` (dentro da pasta *perna*) e **no meio**: **entra na pasta** (*"forearm entrou na pasta perna."*; a lista fica com **uma** pasta *perna*: *foot_front, forearm, shin_front, leg_front*). Solta no terço de cima de `foot_front` (a primeira da pasta): **fica fora**, **antes** da pasta (*"forearm: 5ª de 19, entre arm e foot_front"*). **Ctrl+Z** devolveu a lista (conferi). **Nenhuma pasta partida.** Defeito 6 | `B1_ordem_meio` · `B2_depois_da_ultima` |
| 2 | A barra diz *"N avisos"* igual à janela | **vi funcionar** | `heroi.bone` solto numa pasta sem o atlas: a barra diz ***"42 avisos — ver"*** (botão, dica ***"Abre a janela de Problemas: cada aviso com o que fazer para consertar"***); **clicar nela abre** a janela, que diz ***"Ver as 42 linhas, uma por imagem"*** (42 itens) e ***"42 problemas, 21 com conserto aqui."*** **42 = 42 = 42.** *(Correção do doc `88`: lá escrevi que o clique na barra **não abria**. **Eu procurava a janela com um seletor que não a achava.** Na v35.4 abre, e **não sei dizer se na v35.3 abria**.)* | `C2_janela_pela_barra` |
| 3 | *"skins ▾"* existe no cartão ou saiu de vez | **vi funcionar** | **Saiu de vez.** O cartão da `espada` na *Montagem* traz ***espada · PROJETO · anima: idle ▾***; a palavra *skins* só existe no menu e na aba | `D0_entidades` |
| 4 | Em 720, a Ordem mostra 3 linhas | **não funciona** | Defeito 1: **1 linha inteira** | `E2_ordem_720_recarregado` |
| 5 | Clique na barrinha leva o foco para ela: 3 teclas = 3 casas | **vi funcionar** nas **Regras**, no **Alfa** e nas **Partículas** · **pela metade** na **velocidade** | **Regras:** *Força* de `cape_follow`, clique no polegar: **`activeElement` é a barra** (já com o botão apertado); `←` ×3 **100 → 99 → 98 → 97**; `→` ×3 volta. **Alfa** (*Cor do osso, opacidade*): **o mesmo**. **Partículas** (emissor *Fogo*, aba *Cor*): *Cor do emissor*, *Cor ao nascer (de)*, *(até)*: **100 → 99 → 98 → 97** nas **três**, foco **fica**. **Velocidade:** defeito 2. **Tudo por mouse real, sem `.focus()`** | `F2_velocidade` · `G1_particulas_cor` |
| 6 | As 4 barras da Prévia têm nome; abas, linhas de animação, linhas do gráfico, selects e caixas têm dica | **vi funcionar** | **Quatro barras** com `title` e `aria-label` ***"Quanto aparece, em %, de 0 a 100: 0 esta camada some, 100 ela entra inteira por cima da de baixo"***, e **`100%` ao lado**. Em 163 controles à vista, 150 têm dica; **os 13 sem dica são os do menu de cima** (*Arquivo*, *Editar*…). Abas, linhas de animação, linhas do gráfico, selects (*Animação*, *Velocidade*, *Ícone*, *Eixos*) e caixas (*Repetir*, *Todos os ossos*): **com dica**. *"Copiar"* em uma linha: defeito 4 | `L0_previa_1920` |
| 7 | A tabela dos painéis (1920 e 1280): rótulo curto? unidade depois da caixa? faixa na dica? botão com dica? só lista rola? | **ver tabela** | A tabela abaixo (medida por programa; lida com os olhos em seis painéis) | ver abaixo |
| 8 | O número da altura | **vi funcionar** (lido) | `ESTADO.md`, linha **8**: ***"82 de 90 de altura (`npm run medir`, 07/10, 08:29, com a casa vazia; subiu 1 desde a v34.8: a Malha cabe em 1440×900)"***. Os 8 que rolam: *a ficha completa do desenho, a da regra Comando, a Exibição, a Malha em 1280 e a Prévia em 1280*. **Bate com o que vi**: a Malha e a Exibição rolam em 1280 (tabela). **Não rodei o `medir`.** | — |
| 9 | Um usuário novo lê a Prévia, as Curvas e a chave de evento | **pela metade** | Abaixo | `L0_previa_1920` · `M0_curvas_1920` · `N2_chave_de_evento_aberta` · `N3_definicao_evento` |

## A tabela dos painéis (item 7)

*Os números são do corpo da aba aberta, com o painel **na frente** (o grupo cresce quando a aba entra: **472 px** em 1920×1080 e **228 px** em 1280×720).* **"Rola"** diz o que rola: **lista** (só a lista) ou **corpo** (o painel todo). **"Sem dica"** = botões, caixas, seletores e barras sem `title` (nome e dica).

| Painel | 1920×1080: rola? | 1280×720: rola? | Números: unidade depois · faixa na dica | Sem dica | Rótulos |
|:---|:---|:---|:---:|:---:|:---|
| **Árvore** | lista (393 de 1522) | *não medi nesta passada* | — | 0 de 90 | nomes cortados (`sword_blade`, `hand_point`…) |
| **Ordem** | lista (400 de 1117) | lista, **75 px** (1 linha) | — | 0 de 6 | `foot_b_particulas` cortado |
| **Propriedades** (osso `head`) | **corpo** (431 de 611) | **corpo** (169 de 426, com o `body` escolhido) | **8 de 8 · 8 de 8** | 0 | *"Herda espelhamento"* (rótulo de 18 letras) |
| **Propriedades** (desenho, emissor) | cabe | rola (ficha do desenho; o emissor cabe) | 3 de 3 · 3 de 3 | 0 | curtos |
| **Imagens** | lista (366 de 1138) | lista (122 de 1138) | — | 0 de 7 | *"Nenhuma pasta aberta"* cortado |
| **Entidades** | cabe | **corpo** (228 de 385) | — | 0 de 4 | curtos |
| **Pivôs** | cabe | grade (109 de 236) | — | 0 de 32 | *"Repetir para a pasta: não vale na raiz"* (38 letras) |
| **Malha e pesos** (com malha) | cabe | **corpo** (272 de 441) | **3 de 3 · 3 de 3** | 0 de 15 | curtos |
| **Partículas** (a lista) | cabe | cabe | — | 0 de 4 | curtos |
| **Exibição** | cabe | **corpo** (185 de 379) | — | 0 de 20 | curtos |
| **Prévia** | **corpo** (412 de 665) | **corpo** (167 de 665) | **4 de 4 · 4 de 4** | 0 de 30 | curtos |
| **Animações** | cabe | lista (169 de 242) | — | 0 de 16 | curtos |
| **Skins** | cabe | **corpo** (176 de 284) | — | 0 de 14 | curtos |
| **Regras** | **corpo** (380 de 721) | **corpo** (136 de 721) | — | 0 de 35 | detalhe da regra cortado (*"arm → forearm → hand_tar"*) |
| **Histórico** | lista (434 de 1106) | lista (190 de 1106) | — | 0 de 33 | curtos |

**O que a tabela diz:** **todo número tem unidade e faixa; todo botão do painel tem dica**; **o que ainda rola como um corpo** é a ***Propriedades*** (osso), a ***Prévia*** e a ***Regras*** em 1920, e **mais** a *Entidades*, a *Malha e pesos*, a *Exibição* e a *Skins* em 1280.

## O usuário novo (item 9): o que ainda não se entenderia

| Onde | O que se entende | O que **não** |
|:---|:---|:---|
| **Prévia** | *"Camada 0 segue idle"*; *Quanto aparece 100%* e *Mistura 0,2 s* com dica clara | **o que é uma camada** e **para que se mistura** (nada diz *"toque o andar e o ataque juntos"*); *Todos os ossos* e *"Esta camada move a base inteira"* **não dizem o que acontece se desmarcar**; *Tempo — parada* nas camadas vazias; o bloco *"O que se perde na cópia"* é **jargão** (*morphs*, *tags*, *cor de slot*) |
| **Curvas** | os sete formatos têm dica, e a linha ***"Clique num ponto do gráfico (uma chave) para escolhê-la: o formato da curva vale dela até a próxima"*** diz o primeiro passo | **os formatos não têm desenho** (só o nome); a dica de *Passa do alvo* e *Recua e passa* **cita o Spine e o Blender** (***"back out"***, ***"back in-out"***), que um novato não conhece; o eixo do gráfico **não diz a unidade**; ***"Vendo"*** na lista de baixo **não diz que é um liga/desliga** |
| **Chave de evento** | *Evento: hit*, *Definição do evento "hit"*, *Chavear evento em 0,00 s*, *Apagar esta chave* | **o que é um evento** (um aviso que o jogo recebe naquele instante); **para que serve *Som***; ***Inteiro*, *Decimal*, *Texto*, *Volume*, *Balanço*** aparecem **sem uma linha dizendo quando se usa**; **a seção fica no fim da folha**, e em 1920 só se vê rolando |

## O veredito: a rodada 47 está FEITA?

**Quase.** O padrão foi **entregue** (unidade e faixa em todo número; dica em todo botão de ícone; ajuda curta; as barras que andam com o teclado; a Ordem que não parte pasta; os avisos contados igual). **O que fica para fechar**, em ordem:

| # | O que falta | Onde |
|:---:|:---|:---|
| 1 | **A Ordem em 720 não mostra 3 linhas** (mostra 1) | defeito 1 |
| 2 | **A seta da barra de velocidade não anda a velocidade** | defeito 2 |
| 3 | **Em 1280 quase todos os painéis rolam como um corpo só**; o pedido era *"só as listas rolam"* | defeito 5 |
| 4 | **O *Copiar para a linha do tempo* tem duas linhas, não uma** | defeito 4 |
| 5 | **O usuário novo** não entende *camada*, *evento* e os formatos das curvas sozinho | item 9 |

## O programa inteiro, pelas nove partes: o que ainda falta para a mão do Humberto

| # | O que | Estado |
|:---:|:---|:---|
| 1 | **A cor ao nascer do Fogo** | o seletor de *Cor ao nascer* mostra **branco** (`#ffffff`) num emissor *Fogo* que **queima laranja**; e a *Cor na vida* **não muda** ao trocar a de nascer: é a rodada 48 |
| 2 | **O que só ele confirma** (doc `89`): o seletor de cor do Windows, soltar pasta do Explorer, seletor de pasta, a pasta *Downloads*, o `bcp` contra o Spriter, os 14 passos com a mão, painéis arrastando, exportar e importar skin, o Construct e o Godot | **não se prova num Chrome sem janela**: continua dele |
| 3 | **Salvar e reabrir de verdade** | tudo o que conferi nesta rodada foi **em memória**: nada foi salvo e reaberto em disco |
| 4 | **Telas** | só 1920×1080 e 1280×720; **1440×900** (a que o `medir` mede) **eu não vi a olho** |
| 5 | **Um arquivo grande** | só o herói e uma pasta de 12 imagens; **nunca** um `.scml` pesado nem 200 chaves |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **Fogo** nasce **bonito** (a chama laranja se vê na cena e na Prévia), mas **a ficha mostra branco**: quem ajusta a cor pela ficha **não vê o que vai mudar** |
| C2 | Soltar uma peça **dentro** da pasta agora **diz** *"entrou na pasta perna"*; era o que faltava: o gesto não é mais mudo (só o *depois da última* continua mudo) |
| C3 | A **barra de avisos** virou botão com dica e **abre**: antes era só texto |
| C4 | O **grupo de painéis cresce** quando a aba entra (472 px em 1920): foi o que fez a Malha, a Prévia e quase tudo caber |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Os arrastos da Ordem | arrasto de peça do navegador por protocolo (`dragEnter`/`dragOver`/`drop` entregues no ponto) | a sensação na mão; a linha laranja do alvo |
| A tabela dos painéis | **uma varredura por programa**, painel por painel, com o painel na frente; **lida com os olhos** só em Malha, Exibição, Regras, Entidades, Propriedades | os painéis que a varredura não contou (menus, janelas, tooltips) |
| O 1280×720 | **mudei a janela do Chrome** por protocolo (e recarreguei uma vez); não é um computador de 1280 | o 1280 de verdade |
| A Árvore em 1280 | **não medi** nesta passada | — |
| A chave de evento | só **li** a seção e a definição; **não** gravei uma chave nova | o que o jogo recebe |
| Soltar pasta no Explorer, Downloads, seletor do Windows | **não** provei | — |
| O número 82 de 90 | **lido** no `ESTADO.md` | — |
