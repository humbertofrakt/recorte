# As partículas conferidas, segunda parte — 05/10/2026

Rodada 31. Conferente: `CONFERINDO · rodada 24 — os consertos e os painéis`.
**Nenhum código foi mexido.** Só usei o programa e fotografei.

| | |
|:---|:---|
| Versão montada | **v28.3** (o "Sobre" diz v28.3) |
| Como | `programa/` na porta 5324 · Chrome sem janela · mouse e teclado por protocolo |
| Telas | **1920×1080**, e **1280×720** só na G1 (a ficha cabendo) |
| Hora | 17h47 a 18h02 do relógio da máquina, 05/10/2026 |
| Fotos | `backup/fotos-obra/rodada-31/` (19) |
| Material | o herói de exemplo com **Partículas → Fogo** (emissor no osso `foot_b`, na animação `idle`). Na G9 o seletor de arquivo do Windows foi trocado por um falso (guarda e devolve o texto) |
| Como medi "a cena muda" | foto da região do emissor num quadro fixo do `idle`, **sem o emissor escolhido**, antes e depois, comparada pixel a pixel (a medida é estável: duas fotos seguidas dão 0 px) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Não achei a porta | Não dá sem janela |
|:---:|:---:|:---:|:---:|:---:|
| **7** | **2** (G1, G7) | 0 | 0 | 0 |

9 linhas. Nenhum "não funciona".

## Os defeitos, do pior para o menor

| # | Defeito | Linha | Foto | Como repetir |
|:---:|:---|:---:|:---|:---|
| 1 | **A janela das Rajadas se esconde atrás da linha do tempo.** Em 1920×1080 ela abre **translúcida e por baixo** dos botões de tocar da linha do tempo: *"Mais uma rajada"* e *"Fechar"* ficam apagados atrás da barra, e os campos (*Quando (s) · Quantas · Vezes · A cada (s) · Chance*) aparecem **em cima dos botões de tocar**, com as letras uma sobre a outra. Funciona (cliquei e criei), mas quem não sabe onde clicar não vê. A lixeira (*"Tirar a rajada 1"*) fica em y 936, **atrás** da linha do tempo | G5 | `G5_popup` · `G5_popup_depois_de_mais` | Fogo escolhido, aba Nascer, **Rajadas ▾** |
| 2 | **Não consegui arrastar a chave de *Emitindo* na linha do tempo.** A chave nasce (*"Chave em 0,33 s: Emitindo de foot_b_particulas"*), copiar e colar funcionam (*"Chave em 1,33 s"*) e apagar funciona (*"Apagar chave"*), mas **arrastar a chave de 0,33 s para a direita não a moveu**, em duas tentativas (uma com 20 passos, outra com 12 passos lentos) | G7 | | Idle, quadro 10, desmarcar *Emitindo*; Detalhes; arrastar a chave da linha *Emitindo* |
| 3 | **A alça não diz o que puxa.** Parado em cima da alça: cursor de mira, o rodapé não muda, nenhuma etiqueta. Arrastando: o rodapé também não diz. O nome só vem **depois**, no *Desfazer* (*"Desfeito: Raio: 83,09"*). No arco, as duas alças (a de cima e a da ponta) não se distinguem | G1 | `G1_alcas_arco` · `G1_alca_durante_arrasto` | Forma Arco, passar o mouse e arrastar uma alça |
| 4 | **Em 1280×720, na animação, a aba *Lugar* corta o campo *Osso*** (a metade de baixo do seletor fica sob a linha do tempo, e a aba não rola). As outras nove abas cabem (a mais baixa termina em y 426 de 430) | G1 | `G1_lugar_1280` | Tela 1280×720, `idle` aberto, Fogo escolhido, aba Lugar |
| 5 | **A folha de quadros tem três números sem nome na tela** (*4 · 1 · 0*); o que cada um é (*quadros · primeiro número · dígitos*) só se lê na dica | G8 | `G8_folha` | Aba Imagem |
| 6 | **Tirar um ponto da curva só pelo botão direito**, e a curva não diz isso (o gradiente diz: *"clique põe uma cor, arraste para mover, duplo clique troca a cor, botão direito tira"*). O duplo clique no ponto da curva **não** o tira | G3 | `G3_pontos` | Aba *Tamanho e giro*, duplo clique num ponto da curva |
| 7 | De onde vem a conta do peso só se lê na **dica** do selo (*"a taxa vezes a vida, mais as rajadas, até o Máximo de vivas… Leve até 60, médio até 150, pesado acima"*) | G6 | `G6_peso_pesado` | Parar o mouse no selo |
| 8 | Depois de `Ctrl+Z` na curva de tamanho a foto da cena ficou **329 px** (0,8 %) diferente da de antes: pode ser ruído do cabelo; nas outras mudanças o `Ctrl+Z` voltou a 0 px | G3 | | Aplicar a curva *cresce*, `Ctrl+Z` |
| 9 | *Não pude testar* o **duplo clique que troca a cor** de uma parada do gradiente: abre o seletor de cor do sistema, que não abre sem janela. A *cor do emissor*, mudei por script (a cena mudou: 1.025 px; `Ctrl+Z`: 0 px) | G4 | | |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| G1 | Os seis: retângulo e linha nascem com tamanho que se vê · digitar e puxar são passos separados no `Ctrl+Z` · círculo, anel e arco mostram só os campos deles · cada alça diz o que puxa · subir a Taxa muda a cena · criar o Fogo de novo avisa. E a ficha cabe sem rolar nas duas telas | **pela metade** | **Retângulo:** nasce **60 × 40**; **Linha:** de **−30 a 30** (antes: 0). **Ctrl+Z:** digitei o retângulo (80 × 40), puxei o canto (139,99 × 83,01), **um** `Ctrl+Z`: *"Desfeito: Retângulo: 139,99 × 83,01"*, volta a **80 × 40**. **Campos:** Círculo: *Raio*; Anel: *Raio · Espessura (0–1)*; Arco: *Raio · Espessura (0–1) · Trecho (°)*. **Taxa:** 40 → 200 muda a cena (**4.540 px**). **Fogo de novo:** *"Mais um emissor neste osso (já havia foot_b_particulas). Fogo: emissor foot_b_particulas2…"*. **A alça diz o que puxa:** **não** (defeito 3). **Ficha:** 1920×1080 nenhuma das dez abas rola; 1280×720 nove cabem e a **Lugar** corta o *Osso* (defeito 4) | `G1_Retangulo` · `G1_Linha` · `G1_retangulo_80x40` · `G1_alcas_arco` · `G1_lugar_1280` · `G1_cor_1280` | Defeitos 3 e 4 |
| G2 | O nome da forma escolhida está escrito, e não só aceso | **vi funcionar** | Na aba Forma a primeira linha diz **"Forma: círculo — nasce dentro do disco"**; muda ao escolher: *"Forma: anel — nasce na borda do círculo"*, *"Forma: arco — um pedaço do círculo"*, *"Forma: retângulo — nasce dentro de uma caixa"*, *"Forma: linha — nasce ao longo de um segmento"* | `G1_retangulo_80x40` | |
| G3 | Tamanho e sumir ao longo da vida: curva que eu mexo (ponho ponto, arrasto, tiro), com curvas prontas; a partícula muda; `Ctrl+Z` desfaz | **vi funcionar** | Aba *Tamanho e giro*, **Tamanho na vida**: o **▾** abre *"curvas prontas"*: **igual a vida toda · cresce · encolhe · pulsa**. *cresce*: a curva muda e a cena muda (**1.581 px**); `Ctrl+Z`: *"Desfeito: Mudar Tamanho na vida"*. **Ponto:** um clique no vazio **põe** (2 → 3 pontos); **arrastar** o ponto do meio para cima muda a curva e a cena (**274 px**); **botão direito** no ponto o **tira** (3 → 2). *"Sumir ao longo da vida"* é o gráfico **"Some na vida"** da aba **Cor**, com o mesmo ▾ de *"curvas prontas"* | `G3_tamanho_aba` · `G3_pontos` · `G3_cresce` | |
| G4 | Cor ao longo da vida: um gradiente (ponho cor, arrasto, troco, tiro); a cor do emissor; a cena acompanha | **vi funcionar** | Aba **Cor**: *Cor ao nascer · Cor na vida · Some na vida · Cor do emissor*. A dica da faixa: *"clique põe uma cor, arraste para mover, duplo clique troca a cor, botão direito tira"*. **Pôr:** clique na faixa em 74 % → nova parada (*"Cor em 74 % da vida"*). **Arrastar:** a parada foi para 57 %; a cena mudou (120 px). **Tirar:** botão direito → a parada some (4 → 3). **Cor do emissor:** mudei para verde: a cena mudou (**1.025 px**) e `Ctrl+Z` voltou a **0 px**. **Trocar a cor (duplo clique): não pude** (defeito 9) | `G4_cor_aba` · `G4_gradiente` | |
| G5 | Rajadas: criar, dizer quando e quantas, repetir, apagar; na cena as partículas saem de uma vez naquele instante | **vi funcionar** | **Rajadas ▾** abre uma janela: **Mais uma rajada** põe uma (*"1 rajada · 10 partículas"* no botão). Campos: **Quando (s) · Quantas · Vezes · A cada (s) · Chance (0 a 1)** (repetir = Vezes e A cada). Pus **0,3 s e 80**: a janela diz *"1 rajada · 80 partículas"*. **Apagar:** *"Tirar a rajada 1"*: *"Nenhuma rajada. O + põe uma: várias partículas de uma vez."* **A cena** nos quadros 11, **com** e **sem** a rajada: **863 px** de diferença. `Ctrl+Z`: *"Desfeito: Mudar Rajadas"*. **Mas** a janela se esconde atrás da linha do tempo (defeito 1). *Não medi* o instante exato do estouro nem as repetições na cena | `G5_popup` · `G5_popup_depois_de_mais` · `G5_lista_aberta` | |
| G6 | O peso: a ficha diz, com palavra, se está leve, médio ou pesado, e com quantas partículas; dá para saber de onde vem a conta; avisa quando fica pesado e **não impede** | **vi funcionar** | **No alto de toda aba** do emissor há um selo com a palavra e o número: **"leve · 36"** (fábrica), **"médio · 116"** (com a folha de 4 quadros), **"pesado · 180"/"pesado · 200"** (em vermelho, borda vermelha). **A conta:** a dica do selo diz *"até ~180 partículas vivas de uma vez (a taxa vezes a vida, mais as rajadas, até o Máximo de vivas). No Godot cada partícula custa ~50 µs: ~9 ms por quadro por boneco assim (meio quadro a 60 fps são 8 ms). Leve até 60, médio até 150, pesado acima. O boneco inteiro: ~216*" (defeito 7). **Aviso:** com Taxa 2.000 e vida 4–5 o selo fica vermelho, o rótulo do *Máximo de vivas* vira **"Teto corta 9800"** em vermelho, e o rodapé mostra **"2 avisos — ver"**. **Não impede:** o programa aceitou a taxa de 2.000 | `G6_peso_pesado` | |
| G7 | Ligar e desligar o emissor no meio da animação: para de soltar daquele quadro em diante; linha dele na linha do tempo; a chave se apaga, se arrasta e se copia; a agulha para trás e de novo para a frente dá o mesmo desenho | **pela metade** | No quadro 10 desmarquei **Emitindo**: *"Chave em 0,33 s: Emitindo de foot_b_particulas"*. **Para de soltar:** no quadro 30 a cena fica **16.301 px** diferente da original (as partículas sumiram). **Linha na linha do tempo:** *"Emissor foot_b_particulas / foot_b_particulas · Emitindo"* com **duas chaves**. **Agulha:** quadro 30 → quadro 5 → quadro 30, e quadro 30 → quadro 12 → quadro 30: **0 px** de diferença das duas vezes. **Apagar:** *"Apagar chave"* ✓. **Copiar e colar:** *"Chave em 1,33 s"* ✓. **Arrastar: não** (defeito 2) | (sem foto: a prova é a medida) | Defeito 2 |
| G8 | A folha de quadros: digo quantos quadros a imagem tem, e a partícula passa a trocar de quadro | **vi funcionar** | Aba Imagem: **Folha de quadros** (três números). Pus **4 quadros**: o rodapé disse *"Folha de quadros: quadros"*, **apareceram** *A folha corre (ao longo da vida da partícula · a tantos quadros por segundo) · Voltas na vida · Quadro inicial*, e a **cena mudou (1.110 px)**. *(Defeito 5: os três números sem nome)* | `G8_folha` · `G8_apos_quadros` | |
| G9 | Salvo, fecho e reabro: curvas, gradiente, rajadas e a chave de ligar e desligar são os mesmos | **vi funcionar** | Pus a curva *pulsa*, uma parada nova no gradiente (74 %), uma rajada de 80, a folha de 4 quadros e as duas chaves de *Emitindo*. Salvei (*"Salvo em g9.bone"*), fechei (Novo projeto) e reabri: **a curva (pontos), as quatro paradas do gradiente, *"1 rajada · 80 partículas"*, a taxa, a vida, o teto e a folha (4 · 1 · 0)** estão **iguais** (comparação do texto e dos números), e a linha *Emitindo* tem as **duas chaves** | | |

## Parte C — o que confundiria o Humberto na primeira vez (ele é disléxico)

| # | Onde | O que |
|:---:|:---|:---|
| C1 | **Ícones sem nome**: a ficha tem agora **dez abas em ícones** (uma fileira) e **nove formas em ícones** (outra fileira). O nome só vem na dica; o cabeçalho diz a aba aberta e a primeira linha da Forma diz a forma escolhida (melhorou), mas **os gráficos e o ▾ (curvas prontas) são só ícone** | `G1_alcas_arco` · `G3_tamanho_aba` |
| C2 | **Três ações diferentes por gesto** no gradiente e na curva (clique põe, arraste move, duplo clique troca, botão direito tira): o gradiente **diz** (na dica da faixa), a curva **não diz**, e o botão direito é o que menos se descobre | `G3_pontos` |
| C3 | **Janelas que se escondem**: a janela das Rajadas por baixo da linha do tempo (defeito 1) | `G5_popup` |
| C4 | **Número sem nome**: a folha de quadros (defeito 5); no círculo *Raio* é o único campo, mas no anel e no arco o campo é *Espessura (0–1)*: um número entre 0 e 1 num painel de pixels | `G8_folha` |
| C5 | **Selo de peso: bom** (palavra, número, cor), mas **"a taxa vezes a vida, mais as rajadas…"** (a explicação) está só na dica: para quem lê devagar, é o texto mais longo e o mais escondido | `G6_peso_pesado` |
| C6 | **"Teto corta 9800"** é um aviso útil e curto, mas quem não sabe o que é o "teto" não liga ao *Máximo de vivas* logo abaixo | `G6_peso_pesado` |
| C7 | O emissor criado de novo no mesmo osso fica com o nome **`foot_b_particulas2`**: o rodapé avisa, mas depois a lista só mostra os dois nomes quase iguais | |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O seletor de arquivo do Windows (G9) | `showSaveFilePicker` e `showOpenFilePicker` trocados por funções que guardam e devolvem o texto | que o Salvar grava certo no disco |
| O seletor de cor do sistema | a *cor do emissor* mudei por script; o **duplo clique que troca a cor de uma parada** não testei | G4, o trecho "troco a cor" |
| O instante exato da rajada e as repetições | só comparei a cena com e sem a rajada | G5, "saem de uma vez naquele instante" e "repetir" |
| Telas | 1280×720 só na G1 | o resto nessa tela |
