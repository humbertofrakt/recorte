# A malha e os pesos conferidos — lote 4 e a prova final (v32.4) — 06/10/2026

Rodada 41, lote 4, o último da malha. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.4** (o "Sobre" diz v32.4) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 17h28 a 17h32, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-41-conferida/lote4/` (7) |
| Material | o herói de exemplo, aberto pelo próprio programa; o `cape_upper` **sem malha**, do zero. **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **6** (1 a 6) | 0 | 0 | 6 |

## Os defeitos

Nenhum que pare o uso. Só pequenos:

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **`Esc` solta o desenho escolhido**: depois de pintar, apertei `Esc` para largar a escolha de vértices e **a aba voltou a *"Escolha um desenho na árvore ou na tela"*** (mesmo que antes, lote 2). Quem acabou de pintar precisa escolher o desenho de novo | 6 | — |
| 2 | *Pequeno.* **Uma regra segura o osso na animação.** Com `idle` aberto, tentei girar o `cape2`: ***"cape2 não girou: a regra cape_follow manda nele. Desligue o olho dela na aba Regras."*** A mensagem é **boa** (diz o porquê e o caminho), mas **quem faz a capa dobrar** tem de **sair da aba, achar a regra e desligar o olho**: **mais 3 gestos que a prova não esperava** | 6 | — |
| 3 | *Pequeno.* **Pintar com o Raio pequeno pega poucos vértices**: com Raio 12 e uma passada, *"Peso de cape2 pintado em 3 vértices."* (de 10). A frase é boa, mas **o usuário não sabe se 3 basta**; teria de **escolher os vértices e olhar** (não consegui ler os pesos depois, porque o `Esc` soltou o desenho: defeito 1) | 6 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Em 1920×1080 a aba *Malha e pesos* mostra *Desenho*, *Forma* e *Ossos* **sem rolar** (*Pesos* pode ficar abaixo) | **vi funcionar** | Com o desenho `cape_upper` e a malha virada: o painel (430 px) mostra, **sem rolar**, ***Desenho escolhido*** (y 214), ***Forma*** com os botões (276 a 500), ***Ossos que influenciam*** com *Ligar ossos* e *"Nenhum osso ligado ainda."* (525 a 600). ***Pesos*** começa em 617, **na borda**: o título aparece e os botões ficam abaixo. *O painel cresce quando se liga um osso (a lista ganha linhas), e então rola* | `B0_malha_virada` |
| 2 | Fechar o painel *Ligar* **reparte os pesos sozinho** entre os dois ossos, e o rodapé diz | **vi funcionar** | *Ligar ossos* → clicar `cape1` (*"entrou na malha com peso 100 % em todos os pontos"*) → clicar `cape2` (*"com peso 0 %: pinte, ou use Pesos automáticos"*) → *Ligar ossos* de novo: ***"Os 2 ossos ligados repartiram o peso sozinhos (Pesos automáticos em 9 vértices). Pinte para ajustar; Ctrl+Z volta."*** A lista passa a mostrar **`cape1` 80 % e `cape2` 20 %** (antes, `cape2` ficava em 0 %). Os vértices da foto ganharam **pizzas laranja e roxa** | `E1_fechou_ligar` |
| 3 | *Afastamento (px)* na linha do rótulo; o título *Pesos* tem *"Testar…"* na dica; a lixeira do osso **não corta** | **vi funcionar** | ***Afastamento (px)*** e a caixa (**2**) **na mesma linha**, com a dica *"…em pixels da imagem, de 0 a 30 px. 0 desliga"*. **O título *Pesos*:** ***"Testar: gire um osso ligado e veja a malha seguir. Ctrl+Z volta o último passo dos pesos"***. **A lixeira** (*"Tirar cape1 da malha: ela para de seguir este osso…"*) termina em **1908 px**, **dentro** do painel (que vai até 1920) | `B0_malha_virada` · `E1_fechou_ligar` |
| 4 | Menu: porta *"Criar ou apagar aresta"* | **vi funcionar** | *Malha e regras → Malha ▸*: *Virar malha · Gerar automática · Traçar contorno · Criar vértice · **Criar ou apagar aresta** · Apagar vértice · Usar a forma de outra malha*; dica: ***"Escolha dois vértices na malha primeiro (ferramenta Malha: clique e Shift + clique, ou a caixa)"*** | `D1_submenu_malha` |
| 5 | O círculo do pincel **redesenha ao mudar o Raio pela caixa**; o atalho do Raio está dito na dica (se existir) | **vi funcionar** | Com o mouse **fora da cena** (digitando na caixa), o círculo azul **mudou de tamanho na hora**: **Raio 40 → 760 px de diâmetro; Raio 15 → 285 px**, no mesmo centro. **O atalho existe e está dito:** ***"…Com a ferramenta Pesos na mão, as teclas [ e ] diminuem e aumentam"***; apertei `]` com o mouse na cena e o Raio foi **de 15 para 19 e para 24** | `F1_raio15` |
| 6 | **PROVA FINAL:** dobrar uma capa com pesos em dois ossos, do zero, só pela tela: virar em malha, criar vértices, ligar dois ossos, pintar, girar na animação. Passos, tropeços, foto | **vi funcionar** | **Chegou ao fim em 26 gestos** (abaixo). **A capa dobrou**: com o `cape2` em −20° a **capa de baixo se abre para a esquerda**, e em 25° **recolhe e some atrás do corpo**, enquanto o osso `cape1` e o ombro **ficam parados** (foto: antes à esquerda, depois no meio e à direita) | `K_antes_e_dobras` · `H2_tela` |

## A prova final — os 26 gestos

| # | O que fiz | O que vi |
|:---:|:---|:---|
| 1 | aba *Malha e pesos* | — |
| 2 | clicar o desenho `cape_upper` na Árvore | *"Desenho escolhido: cape_upper"*, só o botão *Virar malha* |
| 3 | *Virar malha* | *"virou malha: 4 vértices. A ferramenta Malha (M) ligou: arraste os quadrados brancos."* |
| 4 | `F` (enquadrar) | zoom 949 % |
| 5 | *Criar vértice* (liga o modo) | dica *"clique na malha cria um vértice"* |
| 6–10 | clicar 5 vezes dentro da malha | *"Vértice novo."* (9 vértices) |
| 11 | *Criar vértice* (desliga) | *"Modo de criar vértice fechado."* |
| 12 | *Ligar ossos* | *"Clique nos ossos que puxam esta malha. Ligar ossos de novo termina."* |
| 13 | clicar `cape1` na Árvore | *"entrou… com peso 100 %"* |
| 14 | clicar `cape2` | *"…com peso 0 %"* |
| 15 | *Ligar ossos* (fecha) | ***"Os 2 ossos ligados repartiram o peso sozinhos (Pesos automáticos em 9 vértices)."*** |
| 16 | escolher o osso `cape2` (*Pintar*) | o osso **brilha** |
| 17 | modo *Substituir* | — |
| 18–19 | Raio 12, Força 100 | — |
| 20 | arrastar o pincel pela parte de baixo da malha | ***"Peso de cape2 pintado em 3 vértices."*** |
| 21 | abrir a animação `idle` | — |
| 22 | clicar o osso `cape2` | *"Osso: cape2"* |
| 23 | digitar o ângulo | ***"cape2 não girou: a regra cape_follow manda nele. Desligue o olho dela na aba Regras."*** *(tropeço, defeito 2)* |
| 24 | aba *Regras* → desligar o olho da `cape_follow` | *"Ligar e desligar a regra."* |
| 25 | voltar às *Propriedades*, clicar o osso `cape2` | — |
| 26 | digitar o ângulo | *"Chavear ângulo."*: **a capa dobra** |

**Tropeços de um usuário novo:** **(T1)** o `Esc` solta o desenho (defeito 1). **(T2)** a regra `cape_follow` segura o osso (defeito 2): é um **tropeço do boneco de exemplo**, e a mensagem o resolve. **(T3)** o **Ângulo** de um osso numa animação é **absoluto**, e o *"base 10"* ao lado diz o ponto de partida; digitei **70** esperando uns graus a mais e a capa **sumiu atrás do corpo** (girou **60°**): **foi meu engano**, mas **nada avisa** que 60° é muito. **(T4)** o painel *Malha e pesos* **rola** assim que a lista de ossos cresce, e o *Pincel* fica **escondido abaixo**. **(T5)** pintar pega **poucos vértices** (defeito 3).

## A rodada 41 está FEITA?

**Sim.** As seis coisas pedidas **funcionam** e a prova final **chega ao fim só pela tela**: virar em malha, criar vértices, ligar dois ossos (que **se repartem sozinhos**), pintar e **dobrar a capa na animação**. O que sobra são três **pequenos** (o `Esc` que solta o desenho, a regra que segura o osso, e não saber se o pincel pegou bastante).

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A capa | **fiz a malha pela tela**, 9 vértices, num boneco de exemplo | uma malha feita à mão num boneco de verdade |
| A regra `cape_follow` | **desliguei o olho** (pelo programa) | que a capa dobra com a regra ligada |
| "A capa dobrou" | **minha leitura** de três fotos paradas | o movimento tocando; o que o Humberto acharia |
| Os pesos pintados | **não li** os pesos depois de pintar (o `Esc` soltou o desenho) | que os **3** vértices pintados deram a dobra que se vê |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
