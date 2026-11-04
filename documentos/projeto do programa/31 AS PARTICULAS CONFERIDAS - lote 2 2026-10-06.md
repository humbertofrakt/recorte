# As partículas conferidas — lote 2 (v30.3) — 06/10/2026

Rodada 38, lote 2. Conferente: `CONFERINDO · rodada 39 — a aba das entidades` (a janela da rodada anterior). **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.3** (o "Sobre" diz v30.3) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 08h55 a 09h00, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-38-conferida/lote2/` (4) |
| Material | o herói, com um emissor *Fogo*; nada trocado por falso |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 3, 4) | **1** (2) | 0 | 4 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O "0,5" do *Arrasto (1/s)* a ficha não explica.** A caixa não tem dica. Quem lê só a tela não sabe se 0,5 é muito ou pouco, nem para que serve. Em *Movimento*, **Direção (°)**, **Sair do centro** e, em *Tempo*, a **força** da *Explosão* também não têm dica; a *Explosão · força* só diz "Explosividade" ao passar o mouse | 2, 4 | `F_todas_as_abas_1080` |
| 2 | *Pequeno.* A *janela* da *Explosão* tem a unidade só na dica (*"Janela da explosiv. (s)"*); no rótulo está só *"janela"*. A *força* não tem unidade nenhuma | 1, 2 | `F_todas_as_abas_1080` |
| 3 | *Pequeno.* Em *Cor ao nascer*, o controle ao lado de cada cor é uma barrinha sem rótulo; só a dica diz que é a **transparência** (*"Cor ao nascer (de), transparência"*) | 1 | `F_Cor_zoom` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Toda faixa (Vida, Velocidade, Tamanho, Giros, Cor ao nascer) diz "de … a …" entre as duas caixas, e a unidade está no rótulo ou na dica | **vi funcionar** | **Vida (s)** *de 0,6 a 1* · **Velocidade (px/s)** *de 60 a 110* · **Tamanho (fator)** *de 1,6 a 2,4* · **Giro inicial (°)** *de 0 a 0* · **Giro/s (°)** *de 0 a 0* · **Cor ao nascer** *de [cor] a [cor]*. As unidades estão no rótulo, entre parênteses; as dicas repetem (*"Vida (s) (mínimo)"*, *"…(máximo)"*). Exceções nos defeitos 2 e 3 | `F_todas_as_abas_1080` |
| 2 | Os pares dizem o que é cada caixa: Gravidade X e Y, Linha X e Y, Retângulo larg. e alt., Explosão força e janela | **pela metade** | **Gravidade (px/s²)** *X 0 · Y 60* ✓ · **Retângulo (px)** *larg. 60 · alt. 40* ✓ · **Linha**: *Início X · Y* e *Fim X · Y*, cada um com *X* e *Y* ✓ · **Explosão · janela**: *força 0 · janela 1* — as duas caixas têm nome, mas **a unidade da janela e o sentido da força só aparecem na dica**, e a força não tem unidade (defeito 2) | `F_todas_as_abas_1080` · `S_formas_campos_1080` |
| 3 | Nada transborda: 1920×1080 e 1280×720, a ficha cabe de lado | **vi funcionar** | Medi as dez abas (Nascer, Tempo, Lugar, Forma, Movimento, Forças, Tamanho e giro, Cor, Imagem, Mais) **nas duas telas**: a largura da ficha é 258 px, nenhum campo passa da borda direita e não há barra de rolagem de lado. Com as quatro formas (Retângulo, Anel, Arco, Linha), o mesmo | `F_todas_as_abas_1080` · `G_todas_as_abas_720` · `S_formas_campos_1080` |
| 4 | Um usuário que lê a ficha pela primeira vez entende o "0,5" sem perguntar | **vi funcionar** nas faixas · **não entendo** no Arrasto | Ver "Lendo só a tela", abaixo | — |

## Lendo só a tela — o que cada coisa quer dizer

Sem abrir manual, só com o que a ficha mostra:

| Na tela | O que eu entendo |
|:---|:---|
| **Vida (s) de 0,6 a 1** | cada partícula vive entre **0,6 e 1 segundo**; o programa sorteia um valor dentro disso |
| **Velocidade (px/s) de 60 a 110** | cada uma sai do emissor andando entre **60 e 110 pixels por segundo** |
| **Direção (°) 90** · **Abertura (±°) 12** | sai a 90 graus, com **12 graus de folga para cada lado** (a dica da abertura diz *"Abertura p/ cada lado"*) |
| **Tamanho (fator) de 1,6 a 2,4** | cada uma nasce de **1,6 a 2,4 vezes** o tamanho da imagem |
| **Giro inicial (°) de 0 a 0** · **Giro/s (°) de 0 a 0** | **nenhum giro**: nasce reta e não gira |
| **Cor ao nascer de [cor] a [cor]** | a cor de cada uma é **sorteada entre as duas**; a barrinha ao lado de cada cor é a transparência (só a dica diz) |
| **Gravidade (px/s²) X 0 · Y 60** | uma força que **puxa para baixo 60** a cada segundo; X zero: sem puxão de lado |
| **Máximo de vivas 200** · **Taxa por segundo 40** | no máximo 200 de uma vez; nascem 40 por segundo |
| **Explosão · força 0 · janela 1** | **não entendo sem a dica**: a *janela* é em segundos, e a *força* 0 parece ser "sem explosão" |
| **Arrasto (1/s) 0,5** | **não entendo**: sei só que é "por segundo". Não sei se 0,5 freia pouco ou muito, nem para que serve |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | "de … a …" aparece como duas palavrinhas miúdas, uma antes de cada caixa; a leitura é boa, mas o *de* e o *a* são pequenos e cinza |
| C2 | O selo *"leve · 40"* tem uma dica comprida que fala de Godot; quem faz o primeiro emissor não a lê |
| C3 | Em 1280×720 a ficha tem altura de 228 px e **cabe** (nenhuma aba rola); a Cor é a mais apertada: as barras de transparência ficam muito curtas |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Nada trocado | — | — |
| Telas | 1920×1080 e 1280×720; 1440×900 não | a ficha em 1440×900 |
| "Cabe de lado" | medi por números e vi as fotos | a ficha com um nome de emissor muito longo |
| "Entender sem perguntar" | **sou eu** lendo a tela, e conheço o programa | o que um usuário de primeira vez entende de verdade |
