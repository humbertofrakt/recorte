# As partículas conferidas — 05/10/2026

Rodada 30. Conferente: `CONFERINDO · rodada 24 — os consertos e os painéis`.
**Nenhum código foi mexido.** Só usei o programa e fotografei. Régua: a seção 5 de `02 AS DECISOES` (o Humberto não conseguiu usar as partículas: lugar próprio, clicar, mover e girar, prender a um osso, e um sistema completo).

| | |
|:---|:---|
| Versão montada | **v28.0** (o "Sobre" diz v28.0) |
| Como | `programa/` na porta 5324 · Chrome sem janela · mouse e teclado por protocolo |
| Telas | **1920×1080**, e **1280×720 só para a F1** |
| Hora | 16h55 a 17h06 do relógio da máquina, 05/10/2026 |
| Fotos | `backup/fotos-obra/rodada-30/` (16) |
| Material | o herói de exemplo, com **Partículas → Fogo** (emissor no osso `foot_b`). Para a F8, o seletor de arquivo do Windows foi trocado por um falso (guarda e devolve o texto) |
| Como medi "a partícula muda na cena" | foto da região do emissor num quadro fixo da animação (0,67 s do `idle`), **sem o emissor escolhido** (para as alças não entrarem), antes e depois; a medida é estável (duas fotos seguidas: 0 px de diferença) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Não achei a porta | Não dá sem janela |
|:---:|:---:|:---:|:---:|:---:|
| **6** | **2** (F2, F4) | 0 | 0 | 0 |

8 linhas. Nenhum "não funciona".

## Os defeitos, do pior para o menor

| # | Defeito | Linha | Foto | Como repetir |
|:---:|:---|:---:|:---|:---|
| 1 | **Retângulo e Linha nascem com tamanho zero: a cena não mostra nada.** Escolhi **Retângulo** (campo *"Retângulo (px)": 0 · 0*) e **Linha** (*Início 0 · 0, Fim 0 · 0*): na cena só aparece a estrela do emissor, **nenhuma alça**. O que o Humberto pediu (*"a cena mostra de onde nascem"*) só vale **depois** de digitar números; quem escolhe a forma e olha a cena acha que não funcionou | F5 | `F5_06_linha` (a linha antes dos números) · `F5_07_linha_com_numeros` (depois) | Fogo → aba Forma → Linha (ou Retângulo). Olhar a cena |
| 2 | **No círculo, no anel e no arco os campos são os mesmos três** (*Raio · Anel (0 a 1) · Trecho (°)*). No **círculo**, *Anel* e *Trecho* aparecem mas não fazem nada que se veja: o círculo é só o raio. O texto não diz quais campos valem para qual forma | F4 | `F3_aba_forma` | Aba Forma, clicar Círculo, Anel, Arco e comparar os campos |
| 3 | **Dois `Ctrl+Z` pulam demais.** Digitei o tamanho do retângulo (80 e 40) e puxei a alça de canto; um `Ctrl+Z` não voltou ao 80 e 40 e sim a **0 · 0**. Na linha, igual (voltou a 0, 0, 0, 0 e perdeu os números digitados). Os passos de digitar e de puxar da mesma forma **se juntam** num só | F5 | | Retângulo: digitar 80 e 40, puxar o canto, `Ctrl+Z` |
| 4 | **No círculo com o raio padrão (8) as duas alças ficam em cima da estrela do emissor**, uma de cada lado, e não se sabe qual é qual: a da **esquerda** puxa o **raio**, a da **direita** puxa o **trecho** (cheguei a puxar o trecho achando que era o raio: 360 → 359,46) | F5 | `F5_00_circulo_alcas` | Fogo escolhido, forma Círculo (já vem assim). Puxar a alça da direita |
| 5 | **Aumentar a "Taxa por segundo" de 40 para 200 não muda a cena** no quadro medido (0 px). Mudou ao baixar a taxa para 20 e subir a vida para 2 s (1.828 px). Pode ser o teto *"Máximo de vivas: 200"* que o nome da taxa não avisa | F2 | | Idle, 0,67 s. Aba Nascer, Taxa por segundo: 200 |
| 6 | O seletor **Espaço** (aba Forças) mostra *"do mundo —"* cortado: a explicação inteira (*"soltas ao nascer; a gravidade fica no mundo"*) existe, mas só se lê com a lista aberta | C | `F1_forcas_1280` | Aba Forças, olhar o campo Espaço |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| F1 | A ficha do emissor cabe no painel sem rolar, nas duas telas; cada grupo está a um clique; dá para saber o que cada aba guarda antes de clicar; nada que existia sumiu | **vi funcionar** | **Partículas → Fogo** e a ficha abre com **nove abas em ícones** (uma fileira): **Nascer · Tempo · Lugar · Forma · Movimento · Forças · Tamanho, giro e cor · Imagem · Mais**. O nome de cada uma é a **dica** do ícone (e o cabeçalho do painel diz a aba em uso: *"Forças · Emissor: foot_b_particulas"*). **Sem rolar:** nenhuma das nove rola, em **1920×1080** (painel até y 895) e em **1280×720** (painel de 228 px: y 307 a 535); em 1280 o último controle de cada aba termina antes do fim do painel (no máximo y 506 de 535). **Nada sumiu**, por amostra: **Taxa por segundo**, **Vida (s)** e **Máximo de vivas** (Nascer) · **Velocidade (px/s)** e **Direção** (Movimento) · **Gravidade** e **Arrasto** (Forças) · **Imagem** e *Quadro inicial* (Imagem) · **Semente** e **Nome** (Mais) | `F1_00_emissor_1920` · `F1_emissor_1280` · `F1_forcas_1280` · `F1_aba_Tempo` · `F1_aba_Movimento` | |
| F2 | Mudo um número em cada aba: a partícula muda na cena; `Ctrl+Z` desfaz | **pela metade** | Conferi **Tempo** (*Tremor ao nascer* 0 → 5: 452 px de mudança), **Movimento** (*Velocidade* 50 → 300), **Forças** (*Gravidade* 0 → 400), **Tamanho, giro e cor** (*Tamanho* 0,8 → 3), **Forma** (*Raio* 8 → 60: 3.077 px), **Nascer** (*Taxa* 20 e *Vida* 2: 1.828 px). Em todas a **cena mudou** e o `Ctrl+Z` devolveu o número (e a foto idêntica à de antes, 0 px). **Não conferi** *Lugar*, *Imagem* e *Mais*. **E** a *Taxa por segundo* sozinha, 40 → 200, **não mudou nada na cena** (defeito 5) | `F1_aba_Movimento` | Defeito 5 |
| F3 | Escolho a forma por um desenho. Dá para saber qual está escolhida. As formas que não posso usar dizem por quê | **vi funcionar** | Na aba **Forma**, uma segunda fileira de **nove ícones**: Ponto · Retângulo · Círculo · Anel · Arco · Linha · Osso · Malha · Caminho. **A escolhida está acesa em azul** (o Círculo, que é a de fábrica). Cada ícone tem a dica com o nome e a regra (*"Anel — nasce na borda do círculo"*, *"Linha — nasce ao longo de um segmento"*…). **As que não dá para usar ficam apagadas, com o motivo na dica:** *Malha — "este slot não tem malha. Ponha uma malha no slot do emissor"*; *Caminho — "ainda não. A forma nova está sendo feita (rodada 16, lote 7)"* | `F3_aba_forma` | |
| F4 | Mudando a forma, os campos mudam para os daquela forma, e as partículas passam a nascer naquele desenho | **pela metade** | **Os campos mudam:** Ponto: **nenhum** · Retângulo: *"Retângulo (px)"* · Linha: *"Início X · Y"* e *"Fim X · Y"* · Osso: **nenhum**. **Mas** Círculo, Anel e Arco mostram **os mesmos três campos** (defeito 2). **As partículas nascerem no desenho:** a cena mostra o desenho de cada forma (círculo, anel com o círculo de dentro tracejado, arco, retângulo, linha) e as partículas aparecem em volta do arco e do círculo (foto do arco); **não medi** uma a uma onde nascem as partículas nas cinco formas | `F3_aba_forma` · `F5_03_anel` · `F5_04_arco` · `F5_05_retangulo` | Defeito 2 |
| F5 | Com o emissor escolhido, a cena mostra de onde nascem. Puxo o raio do círculo, o de dentro do anel, o fim do arco, o canto do retângulo, as pontas da linha: a forma muda, o número acompanha, `Ctrl+Z` desfaz | **vi funcionar** | **Círculo:** a alça da esquerda puxa o **raio** (8 → 55,01), `Ctrl+Z` volta a 8; a da direita puxa o **trecho** (360 → 359,46), `Ctrl+Z` volta. **Anel:** o círculo de **dentro** (*Anel*) 0,2 → 0,58; `Ctrl+Z` volta. **Arco:** o **fim** do arco, *Trecho* 90 → 65,72; `Ctrl+Z` volta. **Retângulo:** o canto, 80 × 40 → 119,99 × 81,01. **Linha:** a ponta do fim, 80 · 40 → 100 · 59,51. Em todos o **número da ficha acompanha**. Ressalvas: defeitos 1, 3 e 4 | `F5_00_circulo_alcas` · `F5_03_anel` · `F5_04_arco` · `F5_05_retangulo` · `F5_07_linha_com_numeros` | |
| F6 | As alças da forma não brigam com mover e girar o emissor | **vi funcionar** | Com as alças do arco na cena, a ferramenta **Mover** arrastando o emissor: *"Mover emissor"*, Lugar de (15 · 1,14) para (50,27 · 24,05). A ferramenta **Girar**: *"Girar emissor"*, Giro de 15 para 129,7. Dois `Ctrl+Z` devolvem tudo | | |
| F7 | Com o emissor preso a um osso que gira, a forma acompanha | **vi funcionar** | Prendi o emissor ao osso `arm_b` (*"O desenho de foot_b_particulas trocou para o osso arm_b, por chave, em 0,00 s"*) e olhei o `walk` nos quadros 0 e 10 (o `arm_b` gira de −178° para −163°): **as alças e o arco mudam de lugar e de ângulo** de um quadro para o outro, junto com o braço. *(Foto cortada embaixo: as alças aparecem na borda; a prova é a mudança de posição)* | | |
| F8 | Salvo, fecho, reabro: a forma e os números são os mesmos | **vi funcionar** | Arco (*Raio 60 · Anel 0,2 · Trecho 90*), *Velocidade 123*. Salvei (*"Salvo em particulas-r30.bone"*), fechei (Novo projeto), reabri: **os mesmos campos (60 · 0,2 · 90)**, **Velocidade 123**, **osso `foot_b`** | | |

## Parte C — o que confundiria o Humberto na primeira vez (ele é disléxico)

| # | Onde | O que |
|:---:|:---|:---|
| C1 | **Ícones sem nome à vista.** A ficha do emissor tem **duas fileiras de nove ícones** (as abas e as formas). **Nenhum tem texto ao lado**: o nome só vem na **dica** (ao parar o mouse). O cabeçalho diz o nome da aba aberta (bom), mas **não diz qual forma está escolhida** (só o ícone azul). Para quem lê devagar, é tentativa e erro. Sugestão minha: escrever o nome da forma escolhida ao lado do campo (*"Forma: círculo"*) | `F3_aba_forma` |
| C2 | **Alças pequenas e empilhadas.** No raio padrão (8 px, a 100 % de zoom) as alças do círculo ficam em cima da estrela (defeito 4); o anel e o arco têm três alças perto umas das outras, e não se diz o que cada uma puxa | `F5_00_circulo_alcas` · `F5_04_arco` |
| C3 | **Forma nova que não aparece** (Retângulo e Linha com 0): defeito 1 | `F5_06_linha` |
| C4 | **Texto demais** na lista do **Espaço** (a frase longa cortada) e nos nomes das abas com vírgulas (*"Tamanho, giro e cor"*): o ícone dessa aba é o único com nome de três coisas | `F1_forcas_1280` |
| C5 | Criar o emissor duas vezes (clicar **Fogo** de novo) cria um segundo emissor (`foot_b_particulas2`) no mesmo osso sem avisar; a lista do painel Partículas mostra os dois, iguais | `F2_painel_particulas` |
| C6 | **Ctrl+Z demais** (defeito 3): no emissor, um `Ctrl+Z` pode desfazer três ações; com o Humberto desfazendo "uma coisinha", perde o que fez antes | |
| C7 | Os desenhos das formas **seguem o zoom**: a 100 % são minúsculos; só crescem com o raio. Sem uma dica de "puxe aqui" na cena | |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O seletor de arquivo do Windows (F8) | `showSaveFilePicker` e `showOpenFilePicker` trocados por funções que guardam e devolvem o texto | que o Salvar grava certo no disco |
| As partículas nascerem no desenho, forma por forma (F4) | só vi o desenho na cena e partículas em volta do arco e do círculo | a posição de nascimento de cada uma das cinco formas |
| Abas *Lugar*, *Imagem*, *Mais* (F2) | não mudei um número em cada | |
| Telas | 1280×720 só na F1 | o resto nessa tela |
