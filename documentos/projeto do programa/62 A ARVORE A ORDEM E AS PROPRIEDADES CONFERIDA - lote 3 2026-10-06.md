# A Árvore, a Ordem e as Propriedades conferidas — lote 3, a Árvore escolhe e anda (v32.9) — 06/10/2026

Rodada 43, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.9** (o "Sobre" diz v32.9; o zip `recorte v32.9 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 18h45 a 18h49, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-43-conferida/lote3/` (8) |
| Material | o herói de exemplo, aberto pelo próprio programa. Renomeei e reparentei peças para provar (`torso` → `tronco`, `arm_b` → `braco_b`, `forearm_b` → `cotovelo_b`, `hair` virou filho de `arm`). **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 3, 4) | **2** (2, 5) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 2 | achado em negrito e o **×** existem; renomear a peça achada a **mantém** na lista, **mas reescrevendo o texto da busca** com o nome novo e **escondendo os outros achados** |
| 5 | Largura, caixas com dica e campo preso por regra **vi funcionar**; o **"Imagem" do osso** **não achei** (só no desenho) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Renomear uma peça achada mexe no que se digitou na busca.** Busquei `arm` (achou 10 linhas: `arm`, `forearm`, `arm_b`…), renomeei `forearm_b` para `cotovelo_b` (F2): ela **continuou na lista**, mas **o campo de busca passou de `arm` para `cotovelo_b`** e **os outros achados sumiram** (a lista ficou `hips · torso · braco_b · cotovelo_b`). A peça não some, como pedido; mas **o usuário vê o texto dele trocado** sem ter apertado nada e perde os outros achados | 2 | `G0_f2` · `F0_apos_renomear` |
| 2 | *Pequeno, dúvida.* **Depois de `Shift+clique` as setas partem da âncora, não da linha clicada.** Cliquei `torso`, dei `Shift+clique` em `cape_path` (faixa de 5) e apertei `↓`: a escolha foi para **`mask`** (logo abaixo do `torso`, a âncora), **não** para o que vem depois do `cape_path`. Pode ser a regra de quem faz faixa; **o pedido dizia "o foco fica na linha"**, e aqui o foco ficou **na âncora** | 1 | — |
| 3 | *Pequeno.* **Durante o arrasto o rodapé não mudou**: ao passar um desenho sobre outro li *"Para mudar quem fica na frente, use a aba Ordem…"* **só depois de soltar**; durante o arrasto o rodapé seguia na frase de antes | 4 | — |
| 4 | *Dúvida.* **O osso não tem campo *Imagem*** (conferi `head`, `hair`, `leg`, `arm`): o campo só existe no **desenho**, onde diz ***"Imagem: face. Clique para ver as imagens da mesma pasta e trocar. Shift na escolha troca em todas as skins"*** e o título ***"Desenho: head · imagem face · no osso head"***. O pedido dizia *"'Imagem' do osso diz de quem é"*: **não achei esse campo no osso**; o do **desenho** diz | 5 | `J0_ficha_desenho` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Árvore: `Ctrl+clique` soma, `Shift+clique` faz faixa, `↑↓` andam, `←` dobra ou sobe ao pai, `→` abre; o foco fica na linha; `Alt+clique` no triângulo dobra o ramo inteiro | **vi funcionar** | **Li a escolha pelo `aria-selected` de cada linha.** Clique em `mask`: **[mask]** · `Ctrl+clique` em `hitbox`: **[mask, hitbox]** · `Ctrl+clique` em `body`: **[mask, body, hitbox]** · `Ctrl+clique` em `mask` de novo: **[body, hitbox]** (**tirou**). Clique em `torso` + `Shift+clique` em `cape_path`: **faixa [torso, mask, body, hitbox, cape_path]**; a ficha diz ***"Vários itens"*** (foto). **Setas:** `↓` e `↑` andam uma linha por vez (`torso` → `hips` em dois `↑`). **`←` no `head` aberto:** **dobra** (os filhos somem da lista); **`←` de novo:** **sobe ao pai** (`torso`). **`→` no `head` dobrado:** **abre** (os filhos voltam); **`→` no já aberto:** não anda (fica no `head`, **não vai ao primeiro filho**). **Foco:** depois de clicar, o foco do teclado está **na linha clicada** (`document.activeElement` = a linha). ***`Alt+clique` no triângulo do `torso`*:** **dobrou o ramo inteiro** (a lista ficou `hips · torso · leg…`); `Alt+clique` de novo **abriu tudo**; o clique simples, no triângulo, **fecha/abre só aquele nível**. *(Defeito 2: foco depois da faixa)* | `B0_faixa` · `D0_alt_dobra` |
| 2 | Busca: o achado fica em **negrito**; há um **×** para fechar; **renomear uma peça achada não a faz sumir da busca** | **pela metade** | Digitei `arm`: **10 linhas** (`hips`, `torso`, `arm`, `arm`, `forearm`, `forearm`, `arm_b`, `arm_back`, `forearm_b`, `forearm_back`); **as achadas em *negrito* e sublinhadas** (peso 700 e sublinhado; as outras, 400). **O botão *×*** ao lado do campo, com a dica ***"Fechar a busca e mostrar a árvore inteira"***: apertei e **a árvore inteira voltou**, sem campo. **Renomear (F2) `arm_b` → `braco_b` e `forearm_b` → `cotovelo_b`:** as duas **continuaram na lista**, **mas** o texto da busca virou o nome novo e os outros achados sumiram (**defeito 1**) | `E0_busca_arm` · `F0_apos_renomear` · `G0_f2` |
| 3 | Rodapé: renomear diz *"X agora se chama Y"*; nome repetido diz *"Já existe X: Y ficou X2"*; nome vazio avisa; arrastar para outro pai diz *"X virou filho de Y"* e X fica escolhida | **vi funcionar** | **Normal:** *"hips2 agora se chama tronco."* (e *"arm_b agora se chama braco_b."*, *"forearm_b agora se chama cotovelo_b."*). **Repetido:** `torso` → `hips`: ***"Já existe "hips": torso ficou hips2."*** (a lista mostra `hips2`). **Vazio:** apaguei o nome e dei `Enter`: ***"O nome não pode ficar vazio: hips2 continua hips2."*** (o nome **não mudou**). **Reparentar:** arrastei o osso `hair` para cima do `arm`: ***"hair virou filho de arm."***; **`hair` ficou escolhida** (*"Osso: hair"* nas Propriedades, linha azul na Árvore) | `I0_virou_filho` |
| 4 | Arrastar **desenho sobre desenho** manda à aba *Ordem* (mensagem) | **vi funcionar** | Arrastei o desenho `mask` sobre o `body`: rodapé ***"Para mudar quem fica na frente, use a aba Ordem: lá se arrasta a ordem de desenho."***; **a Árvore não mudou** (a ordem das linhas ficou igual). *(Defeito 3: a frase só aparece ao soltar)* | — |
| 5 | Ficha: ***"Largura"* inteira**; as **4 caixas de marcar do osso com dica**; ***"Imagem"* do osso diz de quem é**; **campo preso por regra com borda e dica** | **pela metade** | **Largura:** no desenho `shin_front` o rótulo ***"Largura"*** cabe **numa linha só** (23 px de altura, 50 de largura; antes quebrava em *"Largu/ra"*). **Caixas do osso `leg`:** **as 7 têm dica**: ***"Os ossos filhos ficam onde estão. Só este osso muda."*** · ***"Os desenhos presos a este osso ficam onde estão. Só vale com a base aberta."*** · ***"As caixas de colisão e os recortes ficam onde estão. Só vale com a base aberta."*** · as 3 de *Herança* · ***"Só com a skin: Ligado: só existe quando uma skin que o lista está vestida (o rabo do lobisomem). Desligado: existe sempre"***. **Campo preso por regra:** no osso `head`, o ***Ângulo*** tem **borda laranja de 2 px** (`rgb(217,138,0)`; os campos livres, cinza de 1 px) e a dica ***"head não girou: as regras head_lean, look_driver mandam nele. Desligue o olho delas na aba Regras. Ficou na base: Ctrl+Z desfaz. Ângulo em graus (°)…"***; no `leg` (sem regra), cinza. ***Imagem:*** ver o defeito 4 | `J0_ficha_desenho` · `K0_osso_head_regra` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A frase do campo preso **traz uma sobra de mensagem velha** (*"Ficou na base: Ctrl+Z desfaz"*) que **não vale** se eu **só olhei** o osso e não digitei nada: **li o título sem ter tentado mexer**. Fala de um passo que **não houve** |
| C2 | O **negrito e o sublinhado** juntos nos achados fazem a busca **ler muito bem**; o nome que **não** casa (`hips`, `torso`, só caminho) fica em peso normal: bom |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A escolha | lida pelo `aria-selected` de cada linha | a cor da linha (vi nas fotos que o azul bate) |
| O arrasto | arrasto de verdade interceptado por protocolo, com `dragEnter`/`dragOver`/`drop` mandados por mim | o arrasto com a mão |
| Teclas | `ArrowUp/Down/Left/Right` mandadas por protocolo | outro teclado |
| Renomear com a busca aberta | `F2` e `Enter` | o duplo clique no nome |
| Só o herói de exemplo, só ossos e desenhos | — | slots, caixas, regras, eventos na Árvore |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
