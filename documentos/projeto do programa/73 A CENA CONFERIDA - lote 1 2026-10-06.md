# A cena conferida — lote 1, o número durante o gesto (v33.8) — 06/10/2026

Rodada 46, lote 1. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.8** (o "Sobre" diz v33.8; servi o zip `recorte v33.8 2026-10-06.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · **botão do mouse apertado de verdade** (mouse por protocolo) e **leitura do rodapé entre um movimento e outro** · 1920×1080 |
| Hora | 23h04 a 23h07, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-46-conferida/lote1/` (12) |
| Material | o herói de exemplo (aberto pelo próprio programa). Cada gesto foi **desfeito** com `Ctrl+Z` depois de lido. **Nada foi salvo.** Nenhuma caixa nativa do navegador foi chamada. Para ter certeza do que o rodapé diz, **conferi cada número com a ficha de Propriedades** (X, Y, Ângulo, Escala), antes e depois |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 3, 4) | 0 | 0 | 4 |

## Os defeitos

Nenhum que atrapalhe. Só notas:

| # | Nota | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno, dúvida.* **Começar o arrasto de *Escalar* em cima da linha do eixo dá um fator enorme em Y.** Com o osso `hips`, a ferramenta *Escalar* e o botão apertado **na linha horizontal da origem** (a mesma altura), subi o mouse 40 px e o rodapé disse ***"Escalar X × 1,4 · Y × −79"***; subindo 60 px, ***"Y × −119"***, e **a ficha ficou com Escala Y −119**. A conta é a **razão** entre a distância de agora e a de início, e o início era perto de zero. Um usuário que aperta em cima da linha do osso **vai ver** isso | 2 | `E1_durante_escalar` |
| 2 | *Pequeno.* **As setas dizem *"Andar 1 px com o osso"* e *"Andar 10 px com o osso"* sem o sentido.** O rodapé não diz para onde andou (esquerda, cima…); conferi pela ficha que o movimento é o certo | 3 | `G1_depois_das_setas` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Com o botão apertado, movendo um osso, o rodapé diz *"Mover X −12 px · Y −33 px"* e muda enquanto o mouse anda | **vi funcionar** | Osso `hips`, ferramenta *Mover* (`W`), botão apertado, mouse indo de (0,0) a (−12, +33) **em pixels de tela**: a **cada passo** o rodapé mudou: ***"Mover X −4 px · Y −10 px."*** → ***"Mover X −12 px · Y −33 px."*** (**a sua frase, palavra por palavra**). **Conferi na ficha:** X de 0 para **−12**, Y de 90 para **57** (−33) ✓. **Num osso filho de um osso girado** (`arm`, pai com 90° de giro) a frase usa os **eixos do pai**: o mouse a (−12, +33) deu ***"Mover X −33 px · Y 12 px"*** e a ficha foi de (55, −10) para (22, 2): **Δ −33 e +12**, igual ao rodapé ✓ (a dica da ficha diz *"no espaço do osso pai"*) | `C0_durante_mover_hips` · `B1_durante_mover` |
| 2 | Girando: *"Girar 53,8° (agora −31,2°)"*; escalando: *"Escalar X × 1,4"*; inclinando: *"Inclinar Y …° (agora …°)"* | **vi funcionar** | **Girar** (`E`): em `hips` (ângulo 0): ***"Girar 10,1° (agora 10,1°)"*** → ***"Girar 30° (agora 30°)"*** → ***"Girar 53,9° (agora 53,9°)"*** (mirei 53,8 e saiu 53,9: arredondamento do pixel). Em `arm` (ângulo −160): ***"Girar 23,5° (agora −136,5°)"*** → ***"Girar 62,8° (agora −97,2°)"***: **−160 + 62,8 = −97,2** ✓, e a **ficha** terminou em **−97,23**. **Escalar** (`R`): ***"Escalar X × 1,2 · Y × 1"*** → ***"Escalar X × 1,4 · Y × 1"*** (a sua frase). **Inclinar** (`Z`): ***"Inclinar X 25,7° (agora 25,7°) · Y 0° (agora 0°)"*** → ***"Inclinar X 43,9° (agora 43,9°) · Y 36,9° (agora 36,9°)"***: **mostra os dois eixos quando os dois andam**. Todas **mudaram durante** o arrasto | `D0_durante_girar` · `E0_girar_com_angulo` · `E1_durante_escalar` · `F0_durante_inclinar` |
| 3 | As teclas `W`/`E`/`R`/`Z` (ferramentas) dizem o mesmo no rodapé; as setas dizem *"Andar 10 px com o osso"* | **vi funcionar** | Apertei **`W`, `E`, `R`, `Z`** (a barra marcou *Mover (W)*, *Girar (E)*, *Escalar (R)*, *Inclinar (Z)* a cada vez): as frases acima **são as das quatro ferramentas sozinhas**; com o **Transformar** (`T`) **a mesma frase, uma só por movimento**: arrasto dentro do osso ***"Mover X −12 px · Y −33 px."***; pela bolinha ***"Girar −35,2° (agora 54,8°)"***; pelo quadradinho (Alt + o do meio) ***"Inclinar Y 78,7° (agora 78,7°)"***; (e o quadradinho de escala disse ***"Escalar Y × 2,33"*** na 1ª tentativa que errou o alvo). **Setas**, com a cena em foco (cliquei o osso na cena): `←` e `↑` ***"Andar 1 px com o osso."***; **`Shift+→` e `Shift+↓`** ***"Andar 10 px com o osso."***; a ficha foi de (0, 0) para **(9, −9)**: −1, +1, +10, −10 ✓ | `G0_cena_com_foco` · `G1_depois_das_setas` · `H2_transformar_mover` · `I0_transformar_girar` |
| 4 | Ao soltar, a frase final tem o número e a unidade (não *"Mover."* seco) | **vi funcionar** | **Em todos** (`W`, `E`, `R`, `Z` e `T`) **a frase depois de soltar o botão é a última do arrasto**, com número e unidade: ***"Mover X −12 px · Y −33 px."***, ***"Girar 53,9° (agora 53,9°)."***, ***"Escalar X × 1,4 · Y × 1"*** (e, no arrasto que começou em cima da linha do eixo, ***"Escalar X × 1 · Y × −119"***: defeito 1), ***"Inclinar X 43,9° (agora 43,9°) · Y 36,9° (agora 36,9°)."*** O `Ctrl+Z` seguinte dizia ***"Desfeito: Mover osso."*** e ***"Desfeito: Inclinar osso."*** (**não abri** o painel *Histórico*). | `D0_durante_girar` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **O número do rodapé é o da ficha** em todos os casos que conferi (mover, girar, escalar, andar): o que o rodapé diz durante o arrasto é o que a ficha mostra depois. Bom para quem anima de olho no rodapé |
| C2 | O *"(agora …)"* em **Girar** é o ângulo **absoluto do osso** (`−160 + 62,8 = −97,2`), e não o do mundo: a ficha traz também o *"mundo"*, e o rodapé **não diz qual dos dois** é o "agora" |
| C3 | *Mover* num osso filho de pai girado diz X e Y **do pai**, não os da tela: bate com a ficha, mas **não** com o movimento que o mouse faz na tela (mouse a −12 e +33, rodapé −33 e 12) |
| C4 | O quadradinho de **escala** do Transformar, apertado onde se pensava em *mover*, **escala** em vez de mover: foi o meu primeiro arrasto (a bolinha e os quadradinhos ficam perto do osso) |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O mouse | botão apertado e movimentos mandados por protocolo, com 250 ms entre um e outro para ler o rodapé | a **velocidade** do arrasto com a mão (o rodapé acompanha um movimento rápido?) |
| O rodapé "durante" | li o **texto** do rodapé a cada passo | que a frase **aparece** sem piscar (o olho) |
| Só o herói de exemplo, só ossos (`hips`, `arm`, `torso`) | — | *Mover* de desenho solto, de caixa, de ponto; gestos **com animação aberta** (aqui foi só a base) |
| *Inclinar*, só o X e o Y de um osso | — | o inclinar com a base aberta *vs* a pose |
| O teclado | `W`, `E`, `R`, `Z`, `T`, setas e `Shift+setas` mandados por protocolo | outro teclado |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
