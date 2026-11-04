# A Árvore, a Ordem e as Propriedades conferidas — lote 5 e a prova final (v33.4) — 06/10/2026

Rodada 43, lote 5. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.4**. **Atenção:** o `programa/` da pasta **já era a v33.5** quando comecei (22h24). Tirei a **v33.4 do zip** `recorte v33.4 2026-10-06.zip`, servi à parte, e o "Sobre" disse **v33.4** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 (e 1280×720 numa medida) |
| Hora | 22h24 a 22h28, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-43-conferida/lote5/` (11). **Não havia `.bone`** na pasta `rodada-43/lote5/` (só fotos), então montei o boneco |
| O boneco grande | o herói de exemplo (**21 ossos**, 23 linhas na Ordem) **mais duas cópias do `torso`** (*Duplicar* no botão direito, 2 vezes: *"9 ossos e 17 desenhos duplicados"* cada). Ficou com **39 ossos**, **45 peças na Ordem** (49 linhas: 4 pastas), 96 linhas na Árvore. **Nada foi salvo.** Nenhuma caixa nativa do navegador (instrumentei `alert`/`confirm`/`prompt`) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (1, 2) | 0 | 0 | 2 |

A prova final **foi do começo ao fim, sem travar**, com **um tropeço do programa** (defeito 1) e **uma medida ruim em 1280×720** (defeito 2).

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Arrastar uma peça para fora da pasta, na Ordem, parte a pasta em duas.** Soltei `capinha` (que estava dentro da pasta `capa`) em cima de `hair`, e ela **continuou "da pasta `capa`"**: a lista ficou com *"capa · 1 peça · pedaço 2 de 2"* (só com a `capinha`) e *"capa · 5 peças · pedaço 1 de 2"* depois dela. **O programa avisa e oferece o conserto**: *"A pasta capa está em 2 pedaços: há peça de fora no meio dela."* com o botão ***Juntar***. Mas quem só queria pôr uma peça na frente de outra **não pediu** partir a pasta; **não apertei Juntar**, então não sei o que ele faz | 2 | `F1_depois_na_ordem` |
| 2 | **Em 1280×720 a Ordem mostra uma linha só.** Com a ficha (Propriedades) aberta embaixo, a lista da Ordem ficou com **51 px de altura: 1 peça à vista** (`arm_back`), e o resto só rolando. **Não tentei** recolher a ficha nem arrastar a divisa (um usuário pode); **não é o caso pedido** (1920), só deixo a medida | 1 | `H0_ordem_1280` |
| 3 | *Pequeno, já visto no lote 3.* **Durante o arrasto o rodapé não mudou** (na Árvore e na Ordem): lia *"cape_upper_2 agora se chama capinha."* com a peça já em cima do alvo; a frase nova só veio depois de soltar | 2 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Aba *Ordem*: nome e imagem numa linha; cabem 9 peças à vista em 1920 | **vi funcionar** | Herói de exemplo, 1920×1080: **cada linha tem 45 px** e traz *nome em negrito e o nome da imagem em cinza na mesma linha* (*"hand hand"*, *"weapon entidade espada"*, *"sword_blade blade"*, *"forearm forearm"*…). **A lista de 435 px mostra 9 linhas inteiras** (`hand, weapon, arma, sword_blade, forearm, arm, perna, foot_front, shin_front`; a 10ª, cortada). *(Contei as 3 pastas como linha: são **7 peças e 2 pastas**, não 9 peças.)* | `A0_ordem_1920` |
| 2 | **Prova final** no boneco grande, como usuário novo: achar pela busca → renomear (F2) → arrastar para outro pai → pôr na frente de outra pela Ordem → ler na ficha onde está e quanto gira (com °) | **vi funcionar** | Ver a prova abaixo | `B0_boneco_grande` · `C0_busca_achou` · `C1_renomeou` · `D0_antes_do_arrasto` · `D1_depois_do_arrasto` · `E0_ordem_abre` · `F1_depois_na_ordem` · `G0_ficha` |

## A prova final, passo a passo

Peça escolhida: o desenho `cape_upper_2`, de uma das cópias.

| Passo | O que fiz | O que o programa disse | Gestos |
|:---:|:---|:---|:---|
| 1 · achar | clique na lupa da Árvore; digitei `cape_upper_2` | a Árvore ficou com **4 linhas**: `hips`, `torso_2`, `cape1_2` e o **desenho** `cape_upper_2` (os pais, só como caminho). **Um achado só**, sem confundir com as outras 38 cópias | 1 clique · 12 letras |
| 2 · renomear | cliquei na peça; `F2`; `Ctrl+A`; digitei `capinha`; `Enter` | ***"cape_upper_2 agora se chama capinha."*** O **campo da busca seguiu como digitei** (`cape_upper_2`) e a peça **ficou à vista**, com o nome novo (o conserto do lote 3 vale) | 1 clique · 3 teclas · 7 letras |
| 3 · outro pai | fechei a busca (×); arrastei a `capinha` até a linha do osso `cape2_2` | ***"capinha virou filho de cape2_2."*** Na Árvore a peça passou a ficar **recuada, embaixo de `cape2_2`**. A ficha confirmou: *"no osso cape2_2"* | 1 clique · 1 arrasto |
| 4 · Ordem | cliquei na aba *Ordem*; arrastei a `capinha` até a **metade de cima** da linha `hair` | a lista **abriu rolada até a peça, escolhida** (rolagem 1.723; a peça estava na 47ª linha de 49). Depois do arrasto o rodapé disse ***"capinha: 39ª de 45, entre hair_3 e hair."*** (**na frente de `hair`**, como queria). Defeito 1: a pasta `capa` ficou em dois pedaços | 1 clique · 1 arrasto |
| 5 · ler a ficha | **nenhum gesto** (a ficha já estava à vista, embaixo) | ***"Desenho: capinha — imagem cape_upper · no osso cape2_2"***; ***Ângulo −10 °*** e, ao lado, em cinza, ***"mundo −100°"***. **Os dois números, com o °**, no mesmo olhar | 0 |

### A conta

| O que | Quanto |
|:---|:---:|
| Cliques | **4** (lupa, a peça, o ×, a aba *Ordem*) |
| Arrastos | **2** (um na Árvore, um na Ordem) |
| Teclas | **3** (`F2`, `Ctrl+A`, `Enter`) |
| Digitação | **2 vezes, 19 letras** (12 da busca, 7 do nome) |
| Gestos no total | **11** (4 + 2 + 3 + 2 digitações) |
| Rolagens da Árvore | **não contei** (a lista tem 96 linhas; para largar a peça sobre o osso foi preciso vê-los juntos) |
| Tropeços **do programa** | **1** (a pasta `capa` partida, com aviso e *Juntar*) |
| Tropeços **meus** | **1**: o primeiro arrasto na Árvore **errou o alvo** (o meu script mirou a mesma linha nas duas pontas e a peça caiu nela mesma): **sem efeito**, repeti. **Não é do programa** e **não entra na conta acima** |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A Ordem abre **rolada até a peça escolhida**: foi a primeira coisa que li depois de trocar de aba. Não precisei procurar a peça nas 49 linhas |
| C2 | O rodapé da Ordem diz **onde ficou** com os vizinhos (*"entre hair_3 e hair"*): dá para conferir sem olhar a lista. O **"de 45"** conta **só as peças**: contei na lista (50 linhas, menos 4 pastas e a linha de aviso) e **fecha** |
| C3 | A ficha dá **o ângulo local e o do mundo** (*−10°* e *mundo −100°*): quem anima sabe quanto a peça gira de verdade. O *mundo* está em cinza, menor |
| C4 | Duplicar o `torso` leva **9 ossos e 17 desenhos** e avisa as **4 regras que ficaram de fora**: o boneco grande nasce sem as regras do herói (`ik_arm`, `head_lean`…) |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O boneco grande | **montei** com *Duplicar* ×2 sobre o herói (não havia `.bone` em `rodada-43/lote5/`) | um boneco **feito à mão** com 20+ ossos; cópias do mesmo torso podem se comportar melhor que peças diferentes |
| Usuário novo | **eu**, que conheço o programa; contei os gestos que **um usuário precisaria**, não os meus erros | quanto tempo leva alguém que **nunca viu** o programa; **onde ele hesitaria** |
| Os arrastos | arrasto de verdade interceptado por protocolo, `dragEnter`/`dragOver`/`drop` mandados por mim | o arrasto com a mão (a precisão de largar na metade de cima da linha) |
| *Juntar* | **não apertei** | o que ele faz com a pasta partida |
| `Ctrl+Z` da prova | **não** conferi | desfazer o arrasto da Ordem e o de pai |
| A versão | **v33.4 tirada do zip**; o `programa/` já era a **v33.5** | a v33.5 |
| Telas | 1920×1080; **1280×720 só uma medida** (a Ordem) | 1440×900 |
