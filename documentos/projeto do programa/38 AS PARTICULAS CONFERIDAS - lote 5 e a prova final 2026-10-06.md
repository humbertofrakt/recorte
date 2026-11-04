# As partículas conferidas — lote 5 e a prova final (v31.0) — 06/10/2026

Rodada 38, lote 5, "o objetivo da rodada". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.0** (o "Sobre" diz v31.0) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 12h04 a 12h13, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-38-conferida/lote5/` (8) |
| Material | o herói de exemplo, aberto pelo próprio programa; **as cores** (fumaça, fogo, faísca) foram escritas por uma linha de código, porque o seletor de cor do sistema não abre sem janela |
| Um tropeço meu | o Chrome da prova caiu no meio; reiniciei e refiz o fogo e a faísca do início |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (2, 4, 5) | **2** (1, 3) | 0 | 5 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A *Faísca* pronta é quase invisível.** Fogo e fumaça se veem de primeira; na faísca vi só **pontinhos pálidos**, mesmo logo depois do primeiro estouro (0,35 s). Quem escolhe *Faísca* acha que não funcionou | 1 | `T_prontos` · `V_faisca_cedo_e_vazio` |
| 2 | **A dica de cada porta não diz a receita.** *Fogo: "um emissor de fogo no osso escolhido, já com imagem: toque a animação para ver"*; o mesmo para fumaça, faísca e poeira. Diz **o que é**, não **os números** (taxa, vida, velocidade…) | 1 | — |
| 3 | **A faísca feita do vazio: não consegui mostrar numa foto.** Montei (taxa 0, vida 0,3 a 0,6, velocidade 180 a 320, gravidade −400, tamanho 0,6 a 1, cores amarela e branca, uma rajada de 30 × 2 a cada 0,4 s), mas na foto o **fogo** da etapa anterior continuava na cena e as faíscas não se distinguiram | 3 | `X_faisca_zoom` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Partículas → Novo: fumaça / fogo / faísca: cada um nasce pronto e se vê; a dica da porta diz a receita | **pela metade** | **Fogo:** chama laranja na perna ✓. **Fumaça:** nuvem cinza-escura ✓. **Faísca:** **quase invisível** (defeito 1). **A dica da porta** diz o que é, **não** a receita (defeito 2). No botão da barra: *"Partículas: cria um emissor no osso escolhido — vazio, ou pronto: fogo, fumaça, faísca, poeira"* | `T_prontos` |
| 2 | Partículas → Novo: vazio: nasce visível (magenta, 20/s). A partir dele, faça uma fumaça só pela tela; conte os passos; chegou a algo que parece fumaça subindo? Foto | **vi funcionar** | **Nasce visível:** pontinhos magenta, selo *"leve · 20"*, rodapé *"Toque a animação para ver"* ✓. **Fumaça:** **11 passos de ficha** (vida de/a, velocidade de/a, gravidade Y, tamanho de/a, as duas cores, a curva *aparece e some*) **e mais 4** para acertar (velocidade 60 a 110, tamanho 1 a 2). **Resultado:** uma **coluna cinza que sobe até acima da cabeça e some no alto**: **parece fumaça subindo** (com as primeiras opções, 20 a 45 px/s e tamanho 2 a 4, ficou uma **nuvem parada em volta das pernas**). Foto | `W1_fumaca` (primeira tentativa) · `W2_fumaca2_zoom` (a que sobe) |
| 3 | O mesmo para fogo e faísca, mais rápido (passos e foto) | **pela metade** | **Fogo do vazio:** **9 passos** (taxa 40, vida 0,5 a 1, velocidade 60 a 110, gravidade Y 60, tamanho 1,6 a 2,4, duas cores laranja e amarela): **chama laranja** na perna, **parece fogo** ✓. **Faísca do vazio:** **10 passos** (os da lista, mais abrir *Rajadas*, o **+**, e três números); **sem foto que prove** (defeito 3) | `X_fogo_zoom` · `X_faisca_zoom` · `X_rajadas_janela` |
| 4 | A barrinha de "Cor ao nascer" ao arrastar: o número aparece no rodapé | **vi funcionar** | Arrastando a barra de *Cor ao nascer (de)*: o rodapé diz ***"Cor ao nascer (de): opacidade 0 %."*** (e o valor fica ao soltar). Nasceu também uma frase na dica *"Só a Cor ao nascer…"* | `B4_durante_arrasto` |
| 5 | A dica da janela da explosão diz que é o tempo da explosão inteira | **vi funcionar** | ***"Janela da explosiv. (s) — em segundos, de 0 para cima: o tempo da explosão inteira — as partículas dela nascem espalhadas nessa janela. Não é a Vida de cada partícula (essa é a Vida, na aba Nascer)"*** | — |

## Onde a dica ajudou e onde tropecei (a fumaça do vazio)

| Onde | O que houve |
|:---|:---|
| **Ajudou** | A dica da **Velocidade**: *"Típico: fumaça 30 a 60, fogo 60 a 110, faísca 180 a 320"* deu os números de cada efeito. A **Direção** (*"90 para cima"*) e a **Gravidade** (*"Y positivo para cima"*) acertaram o rumo. O vazio já nasce **magenta e visível**: me deu algo para mexer |
| **Tropecei** | (1) Segui a dica da fumaça (**30 a 60**) mas escolhi **20 a 45** e **tamanho 2 a 4**: deu **nuvem parada**; só com **60 a 110 e tamanho 1 a 2** a fumaça **subiu**. A dica de **tamanho** não diz o que é "grande demais". (2) As **cores** são o seletor do sistema (não consegui abrir; escrevi por código). (3) Clicar na cena **desmarca** o emissor; voltei por clicar na linha dele na Ordem. (4) **Tamanho de/a** mostrou **valores já mexidos pelo passo anterior** (de 1,2 / 1,6) e um *"a"* que apareceu como 0: não entendi a origem. (5) Preciso **abrir `idle` e tocar** para ver: o rodapé avisa |

## A rodada 38 está FEITA?

**Quase.** O que ficou:

| O que falta | Por quê |
|:---|:---|
| A **faísca pronta** se vê só como pontinhos pálidos | defeito 1: é o que o Humberto verá ao escolher *Faísca* |
| A **receita** na dica da porta | defeito 2: as portas dizem o que é, não os números |
| A **faísca feita do vazio** sem prova em foto | defeito 3: preciso de uma conferência com a cena limpa de outros emissores |
| As **cores** (fumaça, fogo, faísca) | só provadas por linha de código; falta quem escolha a cor com o seletor de verdade |

O que **está feito**: o vazio nasce visível; a fumaça sobe; o fogo sai; a barrinha de opacidade diz o número; a janela da explosão se explica; as frases de forma; o *Para fora*; a ordem de desenho do emissor.

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As cores | escritas por linha de código | como é escolher a cor com o seletor de verdade |
| "Parece fumaça" / "parece fogo" | **minha** leitura de uma foto | o que o Humberto acharia |
| Faísca do vazio | **sem foto** | que a rajada que montei dispara |
| Faísca pronta | duas fotos (0,35 s e 1,7 s) | o instante exato do estouro |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
