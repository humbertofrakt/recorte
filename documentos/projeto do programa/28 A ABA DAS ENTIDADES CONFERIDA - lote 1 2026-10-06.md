# A aba das entidades conferida — lote 1 (v30.0) — 06/10/2026

Rodada 39. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`.
Plano: `22 A ABA DAS ENTIDADES - o plano 2026-10-05.md`, lote 1. **Nenhum código foi mexido.** Só usei o programa e fotografei.

| | |
|:---|:---|
| Versão montada | **v30.0** (o "Sobre" diz v30.0) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 08h04 a 08h07, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-39-conferida/` (10) |
| Material | o herói de exemplo, aberto pelo próprio programa (sem pasta falsa, sem seletor trocado) |
| Não rodei | roteiro nem medição |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** | 0 | 0 | 5 |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Em cima, o projeto aberto é um cartão de moldura dupla com AQUI | **vi funcionar** | Sob o título *MONTAGEM*: cartão **`heroi`** de moldura azul dupla, com **AQUI** no canto | `V1_cartoes_zoom` |
| 2 | Dentro dele, uma linha por slot com entidade; a entidade é um cartão de borda cheia com PROJETO e "anima: …"; as outras imagens viram "+ N outras imagens" | **vi funcionar** | Dentro do `heroi`: a linha **`weapon`** e, nela, o cartão **`espada`** de borda cheia, **PROJETO**, *"anima: idle"*. Embaixo: ***"+ 22 outras imagens"*** (o herói tem 23 imagens e uma é a espada) | `V1_cartoes_zoom` |
| 3 | Animando a espada por dentro: o herói aparece por fora (EM VOLTA) e a espada é o AQUI na linha weapon | **vi funcionar** | Cliquei `idle` debaixo de *espada* na lista de animações: *"Animando espada por dentro: idle. heroi fica à vista, parado."* A aba mostra **`heroi` · EM VOLTA** · linha **`weapon`** · cartão **`espada` · AQUI** com *"+ 2 outras imagens"* (as duas imagens da espada) | `V3_espada_por_dentro` |
| 4 | Embaixo, a prateleira como antes: arrastar para a cena e Promover a base funcionam | **vi funcionar** | **Arrastar** o cartão *espada* da prateleira para a cena (arrasto de verdade por protocolo): *"espada virou uma tomada no osso hair…"*; a espada aparece na cena e **um segundo slot `espada`** entra no cartão do herói, com PROJETO e *anima: idle*; `Ctrl+Z`: *"Desfeito: Pendurar entidade"* e o cartão volta ao que era. **Promover a base** (botão direito na prateleira, item único): *"espada entrou em Bases. Clique nela na janela Animação para abri-la."*; a lista de bases ganhou *Base — montar · espada* | `V4_depois_do_arrasto` · `V4_promover` · `V4_promovida` |
| 5 | Nada que já funcionava quebrou: arrastar entidade para a cena, a Visualização | **vi funcionar** | O arrasto: item 4. **A Visualização** (aba Prévia): abre, toca, e a **tela cheia** mostra o herói com a espada, as animações `idle · walk · attack`, as skins e a frase *"Aqui é teste: pôr e tirar skin não mexe no arquivo"*; `Esc` volta | `V5_previa_a` · `V5_tela_cheia` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A prateleira esvazia depois de Promover a base.** O cartão `espada` some dela e a aba diz *"Nenhuma entidade. Uma entidade é um `.bone` inteiro usado como peça…"*, enquanto o cartão do herói ainda mostra a espada na linha `weapon`. Quem acabou de promover pode achar que a espada saiu do herói. (Não sei se o lote 1 pretendia isso.) |
| C2 | **A borda do cartão da prateleira ficou tracejada** depois de eu abrir a espada por dentro (a classe se chama `entidades-aberta`); no começo, sem a espada aberta, era cheia. O plano reserva a borda tracejada para a palavra *teste*, e aqui **não há palavra nenhuma**. Pode ser outra coisa (entidade aberta), mas lê-se como "teste" |
| C3 | Quando a espada está por dentro, a aba **não mostra o cartão do projeto-pai como `AQUI`**: o herói vira *EM VOLTA*, e a aba diz *"Nenhuma entidade"* na prateleira (a espada não tem entidades dentro). É o esperado, só estranho para quem lê a mensagem solta |
| C4 | O cartão `heroi` tem a linha **`weapon`** como texto solto, sem caixa; as entidades têm caixa. Fácil de ler, mas as linhas de slot de imagem (as "outras imagens") não aparecem uma a uma: só o total |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Nada trocado | o herói abriu pelo item *Abrir o herói* | — |
| Telas | só 1920×1080 | o dobrado em 1280×720 (a trilha `nave › mecha › BONECO`) |
| Cadeia de dois níveis | o herói só tem **um** nível de entidade (a espada) | o cartão dentro de cartão dentro de cartão |
| Ligação de teste (lote 2) | fora do lote 1 | — |
