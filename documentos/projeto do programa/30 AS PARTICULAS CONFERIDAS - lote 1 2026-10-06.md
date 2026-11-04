# As partículas conferidas — lote 1 (v30.2) — 06/10/2026

Rodada 38, lote 1. Conferente: `CONFERINDO · rodada 39 — a aba das entidades` (a janela da rodada anterior). **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.2** (o "Sobre" diz v30.2) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 08h49 a 08h54, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-38-conferida/lote1/` (7) |
| Material | o herói de exemplo, aberto pelo próprio programa; nada trocado por falso |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (2, 3) | **1** (1) | 0 | 3 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Ctrl+↓/↑ e os botões ↑/↓ da Ordem dizem *"Mandar para trás"* / *"Trazer para a frente"* e o emissor não muda de lugar.** Na base, com o emissor escolhido, apertei Ctrl+↓ duas vezes, Ctrl+↑ e o botão ↓ da Ordem: o rodapé disse o passo e o **Ctrl+Z desfez cada um** ("Desfeito: Trazer para a frente"), mas o emissor **continuou a primeira linha da lista** (posição 0 de 24 antes e depois), e a cena não mudou. Só o passo de um lugar: *Frente de tudo / Fundo de tudo* e o arrasto movem de verdade | 1 | `Z_depois_ctrl_baixo` |
| 2 | **Escolher o emissor pela Ordem abre a ficha de *Slot*, e não a do emissor.** Clicando na linha `foot_b_particulas` da Ordem: *"Slot: foot_b_particulas"*, com Ficha rápida (X, Y, Escala, Ângulo, Alfa) e o campo *Osso*; as abas Nascer, Forma etc. **não aparecem**. A ficha do emissor só abre ao escolhê-lo na cena (a estrela) ou logo ao criá-lo. Quem trocou a ordem e quer mudar a forma tem de clicar na estrela | 3 | `P_ordem_slot` |
| 3 | *Pequeno.* Em animação, mandar o emissor para a frente ou para trás **grava uma chave de "Ordem de desenho"** (*"foot_b_particulas atrás de tudo (chave em 0,21 s)"*), no quadro em que o tocador parou. Quem quer só mudar a peça na base e esqueceu a animação aberta cria a chave sem querer | 1 | `X4_frente_e_atras` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | O emissor aparece na Ordem como peça; arrastar ali ou Ctrl+setas põe na frente ou atrás; a cena obedece; Ctrl+Z desfaz | **pela metade** | **Aparece:** linha `foot_b_particulas` com o ícone de pontinhos, no alto da Ordem. **Arrastar:** arrastei a linha para a terceira posição; rodapé *"Chave de Ordem de desenho criada…"*, a linha foi para o terceiro lugar; `Ctrl+Z`: *"Desfeito: Mudar a ordem de desenho"* e voltou. **Frente e atrás, pelo botão *Fundo de tudo*:** com o emissor na frente o fogo cobre a bota; mandado ao fundo (*"atrás de tudo"*) a **bota cobre o fogo**: a cena obedece. `Ctrl+Z` desfaz. **Não funciona:** o passo de um lugar (Ctrl+↑/↓ e botões ↑/↓): defeito 1 | `X4_frente_e_atras` · `Z_depois_ctrl_baixo` | 
| 2 | Botão Partículas / menu Partículas → Fogo, Fumaça, Faísca: cada um se vê de primeira: tamanho visível, fumaça cinza-escura que se distingue do fundo, faísca em 2 estouros | **vi funcionar** | **Fogo:** laranja, do tamanho da perna, visível ao tocar (`X4_frente_e_atras`, esquerda). **Fumaça:** nuvem **cinza-escura** em volta das pernas, que se distingue do fundo claro. **Faísca:** estouro laranja no pé; a ficha tem **uma linha de rajada com 24 partículas, 2 vezes, a cada 0,5 s** (rodapé da ficha: *"1 rajada · 48 partículas"*), ou seja, **dois estouros**. Cada um foi criado pelo menu e tocado sem mexer em nada | `P_zoom_fumaca_faisca_faisca` · `P_faisca_rajadas` · `X4_frente_e_atras` |
| 3 | Nada das partículas quebrou: a ficha do emissor abre, as formas trocam | **vi funcionar** | Escolhido o emissor na cena: *"Nascer · Emissor: foot_b_particulas"*, com as dez abas (Nascer, Tempo, Lugar, Forma, Movimento, Forças, Tamanho e giro, Cor, Imagem, Mais). Na aba Forma: *Círculo → "Forma: círculo"*, *Anel → "Forma: anel"*, *Retângulo → "Forma: retângulo"* (a caixa *Retângulo (px) 60 × 40* aparece na cena) | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A faísca tem dois estouros mas a ficha diz *"1 rajada · 48 partículas"*.** Quem lê "1 rajada" espera um estouro só |
| C2 | Escolhido o emissor na **Ordem**, o rodapé e a ficha falam de **Slot**; escolhido na cena, de **Emissor**. É a mesma peça com dois nomes |
| C3 | Depois de **Fundo de tudo** na animação, a Ordem passa a mostrar um losango (◆) ao lado das linhas: a chave de ordem. Não está explicado onde |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Nada trocado | — | — |
| O toque | toquei a animação `idle` por 1,3 a 1,8 s e fotografei em pleno toque | o tempo exato do estouro |
| Fumaça "de primeira" | só em um herói, sobre o fundo claro | a fumaça sobre o fundo escuro |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
| Arrasto na Ordem | arrasto interceptado por protocolo, soltura mandada por mim | o arrasto com a mão |
| Frente/atrás com Ctrl+setas | só o rodapé, a posição na lista e o desfazer; não vi a cena com mais de um passo | o efeito de dois ou mais passos |
