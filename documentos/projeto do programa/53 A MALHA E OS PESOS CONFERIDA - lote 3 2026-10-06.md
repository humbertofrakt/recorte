# A malha e os pesos conferidos — lote 3, o pincel na cena (v32.2) — 06/10/2026

Rodada 41, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.2** (o "Sobre" diz v32.2) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 17h15 a 17h18, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-41-conferida/lote3/` (6) |
| Material | o herói de exemplo. O `cape_upper` não tem malha: **fiz pela tela** (*Virar malha*, *Gerar automática*, *Ligar ossos* `cape1` e `cape2`, *Pesos automáticos*: 29 vértices). **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (2, 3, 4, 5) | **1** (1) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | o círculo **segue o mouse** e **tem o tamanho do Raio**; mas, **mudando o Raio na caixa** (o mouse está no painel), o círculo **fica velho** na cena até o mouse voltar |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **O círculo não se atualiza quando se muda o Raio com o mouse fora da cena.** Pus o Raio em 30 (círculo grande, 650 px de diâmetro), depois em **10** pela caixa: a foto seguinte **ainda mostrava o círculo de 30** no lugar onde o mouse estivera. Só ao **voltar o mouse à cena** ele saiu com o tamanho de 10 (218 px). *Pode ser inevitável* (o círculo só existe com o mouse em cima); **não dá para "ver o Raio crescer" enquanto se digita** | 1 | `B3_raio30` |
| 2 | *Pequeno.* **Não consegui mudar o Raio com o mouse parado na cena.** A tecla `]` **não fez nada** no Raio (continuou em 10; o rodapé só falou de seleção: *"0 ossos e 1 desenho(s): o escolhido e os filhos"*). Se existe um atalho de teclado para o Raio, **não está dito na tela** | 1 | — |
| 3 | *Pequeno.* **A dica do osso escolhido some quando o desenho muda.** Escolhendo o desenho de novo (pela árvore), os dois botões dos ossos ficam **sem destaque** e a pincelada diz *"Escolha o osso que vai pintar"* (**certo**). Mas **o painel não diz qual osso estava escolhido antes**: quem acabou de pintar com o `cape1` precisa escolher de novo | 3 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Com *Pesos* na mão, o círculo do pincel **segue o mouse mesmo parado** e **cresce e encolhe** com o *Raio* | **pela metade** | **Segue:** mexi o mouse de (1000,500) para (1100,300) e as duas fotos têm o círculo **em cada lugar** (a diferença entre as fotos: 2.635 pixels, do cursor de um ponto ao outro). **Tamanho:** Raio **30** → círculo azul de **uns 650 px** de diâmetro (a 1084 % de zoom, 30 px de esqueleto ≈ 325 px de raio); Raio **10** → **218 px** de diâmetro. **Mas:** ver o defeito 1 (muda com o mouse na cena, não com o mouse no painel) | `B2_circulo_b` · `B3_raio30` |
| 2 | O osso que está sendo pintado **brilha por cima da malha** | **vi funcionar** | Escolhi `cape1` (no painel): o osso **fica grosso e laranja**, **por cima da malha**, e o `cape1 85 %` fica **marcado** na lista. Escolhi `cape2`: o osso **fica roxo, grosso**, com a mesma cor da pizza dele (a cor que o osso tem em cada vértice). **Trocar de osso muda o brilho** na hora | `C1_osso_cape1` · `C2_osso_cape2` |
| 3 | Pincel **sem** osso escolhido: o rodapé diz como escolher (nada acontece calado) | **vi funcionar** | Escolhi o desenho de novo (nenhum osso destacado) e arrastei o pincel sobre a malha: rodapé ***"Escolha o osso que vai pintar: clique no nome dele em Ossos que influenciam, ou no osso na cena, fora da malha."*** **Nenhum passo novo** no histórico (o último seguiu *Pesos automáticos*) | — |
| 4 | Ao soltar a pincelada: *"Peso de cape1 pintado em N vértices"*; numa animação aberta, acrescenta *"foi para a base"* | **vi funcionar** | **Na base:** *Substituir*, `cape1`, raio 30, força 100, arrastei: ***"Peso de cape1 pintado em 14 vértices."*** **Com `idle` aberto**, `cape2`: ***"Peso de cape2 pintado em 29 vértices (foi para a base)."*** | `E2_pintou_em_animacao` |
| 5 | A frase da lista e as caixas dizem *"vários"* do mesmo jeito | **vi funcionar** | Escolhi **29 vértices** com a *Malha* (caixa): a frase diz ***"% = peso dos 29 vértices escolhidos ("vários" = diferente entre eles) · a caixa trava o osso"*** e **as duas caixas** (`cape1`, `cape2`) mostram ***"vários"*** em cinza. A frase **explica a palavra**, e a mesma palavra aparece nas caixas (a v31.9 dizia *"peso médio"* com as caixas em *"vários"*) | `F0_varios` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | Escolher um osso para pintar **também o escolhe na árvore** (*"Osso: cape1"* em Propriedades): o painel de baixo muda sozinho |
| C2 | O número de vértices de *Pesos automáticos* e do pincel **bate com a malha** (29): dá para saber que o pincel pegou **tudo** |
| C3 | Com o **Raio 30 e o zoom em 1084 %**, o círculo cobre **quase toda a malha**: o Raio é em px do esqueleto, e a tela mostra isso, mas quem aproxima muito **não vê** a relação |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A malha e os pesos | **fiz** pela tela no `cape_upper`; não veio pronta | uma malha feita à mão num boneco de verdade |
| "Segue o mouse mesmo parado" | **movi** o mouse de um ponto a outro e comparei as fotos; **não** vi o círculo **mexer** em tempo real | o acompanhamento enquanto o mouse anda |
| Tamanho do círculo | medi por pixels de cor azul numa foto | o tamanho exato em px de esqueleto |
| Atalho do Raio | tentei só `]` | outra tecla (`[`, `Ctrl+roda`…) |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
