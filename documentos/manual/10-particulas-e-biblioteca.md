# 10. Partículas e biblioteca

Escrito em 07/10/2026, na v36.5. Conferido no código, arquivo por arquivo.
Cada seção diz o selo; a tabela do fim junta todos.

## O que você vai conseguir fazer no fim

1. Pôr fogo, fumaça, faísca ou poeira num osso, com um clique.
2. Afinar o emissor na ficha: de onde nasce, para onde vai, a cor, o peso.
3. Trazer parado, andar, correr e pular prontos para a sua base.

---

## As palavras

| Palavra | O que é |
|:---|:---|
| **Emissor** | o lugar de onde as partículas nascem. Fica preso a um osso |
| **Partícula** | um ponto que nasce, voa e morre. Cada uma tem a mesma imagem |
| **Rajada** | muitas partículas de uma vez, num instante |
| **Semente** | o número do sorteio. O mesmo número dá sempre o mesmo efeito |
| **Biblioteca** | as animações prontas que vêm dentro do programa |

**A agulha volta, e as partículas voltam iguais.** O efeito é conta do
tempo, não sorteio novo. Por isso o jogo vê o mesmo que você.

---

## Onde moram as partículas

Três portas. As três criam a mesma coisa.

| Porta | Onde |
|:---|:---|
| O menu **Partículas** | na barra de menus |
| O botão **Partículas** | na barra de ações. É o único botão que mostra a palavra sempre |
| O painel **Partículas** | **Janela → Partículas**, no bloco do animar |

O menu **Partículas**:

| Item | Faz |
|:---|:---|
| **Novo emissor vazio** | um emissor magenta, subindo. O ponto de partida |
| **Fogo** | vida curta, sobe rápido, encolhe, amarelo e vermelho |
| **Fumaça** | vida longa, sobe devagar, cresce, cinza escuro |
| **Faísca** | dois estouros de 40, rápida, para todos os lados, cai |
| **Poeira** | nasce numa faixa, devagar, bege a pardo, assenta |
| **Prender ao osso escolhido** | o emissor vira filho do osso, sem sair do lugar |

**A dica de cada item diz os números.** Passe o mouse por cima.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Menu Partículas | existe | barra de menus |
| Botão Partículas, com a palavra | existe | barra de ações |
| Painel Partículas | existe | Janela → Partículas |
| Os quatro prontos e o vazio | existe | menu, botão ou painel |

---

## Criar um emissor

| Passo | Gesto |
|:---:|:---|
| 1 | Clique no osso (o pé, a mão, a tocha) |
| 2 | **Partículas → Fogo** (ou outro) |
| 3 | O rodapé diz o nome, o osso e a semente |
| 4 | Toque a animação para ver |

**Em que osso ele nasce:**

| Você escolheu | Nasce em |
|:---|:---|
| um osso | nele |
| uma imagem | no osso dela |
| nada | no osso **mais perto do meio da cena**. O rodapé diz |
| não há osso | não nasce. O rodapé diz *"Crie um osso antes"* |

| O que o programa faz | Por quê |
|:---|:---|
| Nasce **apontando para cima**, mesmo num osso torto | para o jato não sair de lado |
| Traz junto a imagem `fx/ponto-suave` | um ponto branco de borda suave. A cor vem da ficha |
| Clicou Fogo duas vezes no mesmo osso | nasce o segundo, e o rodapé avisa *"Mais um emissor neste osso"* |
| Mistura normal nos quatro | aditivo sobre o fundo claro vira borrão branco. A mistura se muda no slot |

**Criar é um passo só no desfazer.** `Ctrl+Z` tira o emissor e a imagem.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Nasce no osso escolhido, ou no do meio da cena | existe | escolha o osso, depois o item |
| Nasce apontando para cima | existe | — |
| A imagem do ponto suave entra junto | existe | — |
| Aviso de segundo emissor no mesmo osso | existe | rodapé |

---

## Na cena

Todo emissor à vista tem uma **estrela de quatro pontas** na origem.

| Para | Gesto |
|:---|:---|
| escolher | clique na estrela, ou nas partículas vivas |
| mover | **Transformar** na mão, arraste. Como uma imagem |
| girar | **Transformar** na mão, gire. Gira a direção junto |
| escalar | **não dá**: o emissor não tem escala. O programa recusa e diz por quê |

**Escolhido o emissor, a cena desenha a forma** de onde as partículas
nascem. Nos números que se arrastam, há **alças**:

| Forma | Alças |
|:---|:---|
| círculo | o raio |
| anel | o raio e a espessura |
| arco | o raio e o fim do arco |
| retângulo | o canto |
| linha | as duas pontas. A ponta em cima da estrela fica sem alça: digite no campo |
| osso, malha | sem alça. Só o destaque |

Arrastar a alça grava aquele número, e nenhum outro. Um passo no desfazer.

**Quando o emissor não desenha nada, a cena diz por quê**, ao lado da
estrela:

| Palavra | Quer dizer |
|:---|:---|
| *sem imagem* | escolha uma em Propriedades |
| *taxa 0* | taxa 0 e nenhuma rajada: nada nasce |
| *emissão desligada* | a caixa **Emitindo** está desmarcada |
| *sem malha* | forma malha, e nenhuma malha escolhida |
| *sem caminho* · *caminho sumiu* | forma caminho, e o caminho falta |
| *forma desconhecida* | o arquivo traz uma forma que este programa não lê |

| Função | Selo | Gesto |
|:---|:---:|:---|
| A estrela na cena | existe | — |
| Escolher pela estrela ou pelas partículas | existe | clique |
| Mover e girar | existe | Transformar |
| Escalar recusado, com o motivo | existe | Transformar |
| A forma desenhada, com alças | existe | escolha o emissor |
| O aviso curto na cena | existe | — |

---

## O painel Partículas

**Janela → Partículas.** Uma linha por emissor.

| Parte | Faz |
|:---|:---|
| **Novo ▾** | o vazio ou um dos quatro. O mesmo menu do botão da barra |
| **Duplicar** | copia o emissor escolhido, com **semente nova**: as duas fogueiras não saem iguais |
| **Apagar** | apaga o emissor escolhido |
| a linha | o nome, o osso, e o aviso curto. Clique: a ficha abre em Propriedades |

Sem emissor, o painel diz o que fazer: *"Nenhum emissor. Novo ▾ cria um…"*.

| Função | Selo | Gesto |
|:---|:---:|:---|
| A lista dos emissores | existe | Janela → Partículas |
| Novo ▾ · Duplicar · Apagar | existe | barra do painel |
| Duplicar com semente nova | existe | Duplicar |

---

## A ficha do emissor

Escolha o emissor. **Propriedades** mostra a ficha em **dez abas com ícone**.
Cada aba tem no máximo **cinco linhas**: cabe sem rolar, até em 1280 × 720.

| Aba | O que tem |
|:---|:---|
| **Nascer** | Emitindo · Taxa · Vida (de · a) · Máximo de vivas · Rajadas |
| **Tempo** | Atraso · Explosão e janela · Tremor · Repetir · Pré-aquecer (só sem Repetir) |
| **Lugar** | X · Y · Ângulo · Alfa (a ficha rápida) · Osso. A Escala não vale no emissor: a dica manda para **Tamanho** |
| **Forma** | os nove botões de forma, e os números da forma escolhida · Para fora |
| **Movimento** | Velocidade (de · a) · Direção · Abertura ± · Vira com o voo |
| **Forças** | Gravidade (X · Y) · Freio · Espaço |
| **Tamanho e giro** | Tamanho (de · a) · Tamanho na vida · Giro inicial · Giro |
| **Cor** | Cor ao nascer (de · a) · Cor na vida · Some na vida · Cor do emissor |
| **Imagem** | a imagem da partícula · a folha de quadros |
| **Mais** | Nome · Semente · Na frente |

**Só aparece o campo que vale agora.** O raio só com o círculo. O
Pré-aquecer só sem Repetir. Nada some: está a um clique.

**Cada número diz a unidade e a faixa.** A unidade vem depois da caixa
(`s`, `px`, `°`, `%`). A dica diz a faixa e um valor típico.

| Campo | O que é bom saber |
|:---|:---|
| **Abertura ±** | é **para cada lado**. 180 solta para todos os lados. 0 sai numa coluna |
| **Direção** | 0 direita, 90 cima, 180 esquerda, 270 baixo |
| **Espaço** | *do emissor*: as partículas seguem o osso. *do mundo*: ficam para trás quando ele anda |
| **Freio** | 1 tira 63 % da velocidade em um segundo |
| **Semente** | fixa. O mesmo número, o mesmo efeito |
| **Máximo de vivas** | quando corta, o rótulo diz *"corta N"*. Subir a taxa não muda nada até subir o máximo |

| Função | Selo | Gesto |
|:---|:---:|:---|
| A ficha em dez abas, sem rolar | existe | Propriedades, com o emissor escolhido |
| Só o campo que vale agora | existe | — |
| Unidade depois da caixa, faixa na dica | existe | passe o mouse |
| Máximo de vivas avisa quando corta | existe | aba Nascer |

---

## A forma: de onde nasce

Aba **Forma**. Nove botões com desenho. Embaixo, uma linha diz o nome, onde
nasce e para onde sai: *"Anel: nasce na borda, sai para cima"*.

| Botão | Nasce |
|:---|:---|
| **Ponto** | tudo do mesmo lugar |
| **Retângulo** | dentro de uma caixa |
| **Círculo** | dentro do disco |
| **Anel** | na borda do círculo |
| **Arco** | num pedaço do círculo |
| **Linha** | ao longo de um segmento |
| **Osso** | ao longo do osso |
| **Malha** | de uma malha do mesmo slot. Cinza se o slot não tem malha |
| **Caminho** | ao longo de uma curva. Cinza se o boneco não tem caminho |

| O que o programa faz | Por quê |
|:---|:---|
| Escolher a forma dá um tamanho de partida | círculo de raio 30, caixa 60 × 40, linha de 60. Antes nascia zero, e não se via |
| Só quando o número de agora é zero | o número que você pôs nunca é pisado |
| Trocar de forma não apaga a outra | voltar ao círculo devolve o raio de antes |
| Escolher a forma é um passo no desfazer | mesmo gravando dois ou três campos |

**Anel e arco não são formas novas no arquivo.** São o círculo com espessura
e trecho. No programa têm botão próprio, porque é assim que se procuram.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Os nove botões de forma | existe | aba Forma |
| A linha "nasce · sai" | existe | embaixo dos botões |
| Tamanho de partida, sem pisar no seu | existe | clique na forma |
| Caminho, de qualquer slot | existe | aba Forma, lista Caminho |

---

## As curvas da vida e a cor

Da **esquerda** (nasce) à **direita** (morre).

| Campo | Aba | Gesto |
|:---|:---|:---|
| **Tamanho na vida** | Tamanho e giro | clique põe ponto · arraste move · botão direito tira · **▾** traz prontas |
| **Some na vida** | Cor | o mesmo |
| **Cor na vida** | Cor | clique na barra põe uma cor · arraste o losango · **duplo clique troca a cor** · botão direito tira |

**As curvas prontas (▾):**

| Tamanho na vida | Some na vida |
|:---|:---|
| igual a vida toda | sempre inteira |
| cresce | some no fim |
| encolhe | aparece e some |
| pulsa | some aos poucos |

**A cor que se vê é a Cor ao nascer vezes a Cor na vida.** Branco não muda
nada. Embaixo da barra **Cor na vida**, duas faixas finas mostram a cor que
se vê de verdade.

**Para escurecer a faísca no fim:** aba **Cor**, barra **Cor na vida**.
Clique: entram as duas pontas, brancas. Duplo clique na ponta da direita:
escolha o vermelho-escuro.

As duas pontas ficam sempre. O botão direito nelas não tira: o rodapé diz.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Tamanho na vida, Some na vida | existe | aba Tamanho e giro · aba Cor |
| Curvas prontas | existe | ▾ ao lado da curva |
| Cor na vida, o gradiente | existe | aba Cor |
| As faixas da cor que se vê | existe | embaixo da barra Cor na vida |
| Grava ao soltar, um passo no desfazer | existe | — |

---

## As rajadas

Aba **Nascer**, linha **Rajadas**. O botão diz quantas: *"2 rajadas · 34
partículas ▾"*.

| Passo | Gesto |
|:---:|:---|
| 1 | Clique no botão: abre a janelinha **Rajadas** |
| 2 | **+** põe uma rajada |
| 3 | Uma linha por rajada: quando, quantas, quantas vezes, a cada quanto, a chance |
| 4 | A lixeira tira a rajada |
| 5 | `Esc` ou clique fora fecha |

A faísca pronta usa uma rajada de 40, duas vezes, a cada 0,5 s.

| Função | Selo | Gesto |
|:---|:---:|:---|
| A janelinha das rajadas | existe | aba Nascer → Rajadas ▾ |
| Pôr, mudar, tirar rajada | existe | + · campos · lixeira |
| Fechar com Esc | existe | `Esc` |

---

## A folha de quadros

Aba **Imagem**. A partícula pode trocar de figura na vida (a chama que
tremula).

| Campo | Faz |
|:---|:---|
| **Folha de quadros** | quantos quadros · o número do primeiro · os dígitos (`2` dá `01`, `02`…) |
| **A folha corre** | ao longo da vida, ou a tantos quadros por segundo |
| **Voltas** ou **Quadros** | quantas voltas na vida, ou quantos por segundo |
| **Quadro inicial** | de qual quadro começa (de · a) |

Sem folha, só aparece a linha da imagem e a da folha. O resto vem quando há
quadros.

A lista de quadros com nomes soltos (`frames`) **não tem campo**. Um arquivo
que a traz continua valendo.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Folha por número (quadros, primeiro, dígitos) | existe | aba Imagem |
| A folha corre na vida ou por segundo | existe | aba Imagem |
| A lista explícita `frames` | falta | sem campo; o arquivo que a traz abre |

---

## O peso: o que o jogo aguenta

No título da ficha, **na frente do nome**, um selo com palavra e número:
*"médio · 80"*.

| Selo | Por emissor | O boneco inteiro |
|:---|:---:|:---:|
| **leve** | até 60 vivas | até 100 |
| **médio** | até 150 | até 300 |
| **pesado** | acima de 150 | acima de 300 |

| O que é bom saber | |
|:---|:---|
| De onde vem o número | taxa × vida mais longa, mais as rajadas, até o Máximo de vivas |
| Quanto custa | ~50 µs por partícula, medido no leitor do Godot em 05/10 |
| A dica | diz os ms por quadro, e a conta do boneco inteiro |
| **Só avisa** | nada é impedido. O jogo pode ter um boneco só na tela |
| Barra de avisos | só o **pesado** vai para lá. O médio fica no selo |

| Função | Selo | Gesto |
|:---|:---:|:---|
| O selo de peso, com palavra e número | existe | título da ficha |
| O boneco inteiro, na dica | existe | passe o mouse no selo |
| O pesado na barra de avisos | existe | botão de avisos |

---

## Prender a outro osso

| Gesto | Onde |
|:---|:---|
| **Partículas → Prender ao osso escolhido** | escolha o emissor e o osso. Sem osso escolhido, a janela pergunta qual |
| campo **Osso** | aba **Lugar** da ficha |

O emissor fica onde está na tela. Já preso àquele osso: o rodapé diz.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Prender ao osso escolhido | existe | menu Partículas |
| Campo Osso | existe | aba Lugar |
| Prender pela Árvore e por `P` + clique | não confirmei | o comentário do código diz; não vi o gesto no emissor |

---

## Partículas na animação

O emissor vale **em todas as animações**: os campos moram no anexo.

| Para | Gesto |
|:---|:---|
| ligar e desligar no tempo | caixa **Emitindo** (aba Nascer), com a animação aberta: vira chave |
| repetir com a animação | caixa **Repetir** (aba Tempo) |
| começar já cheio | **Pré-aquecer**, com Repetir desligado |

**Só Emitindo vira chave.** Velocidade, direção, raio e os outros ainda não.
Foi decisão do Humberto: pôr chave em tudo é uma rodada própria.

Flash, pulso e tremor **não são partícula**: gravam chaves. Estão em
**Animação → Efeitos de chave** ([capítulo 4](04-animar.md#efeitos-de-chave)).

| Função | Selo | Gesto |
|:---|:---:|:---|
| Emitindo vira chave | existe | aba Nascer, com animação aberta |
| Os outros números viram chave | falta | decidido para outra rodada |
| Trilha e sub-emissor | falta | decidido para depois |

---

## As partículas no jogo

O emissor vai no `.bone` como extensão `BONE_particles`. Quem não conhece a
extensão abre o arquivo assim mesmo, sem as partículas.

| Leitor | Partículas |
|:---|:---|
| TypeScript (`runtime/`) | lê |
| Python (`runtime-python/`) | lê |
| Construct 3 | lê. Acima de 300 vivas num emissor, desenha todas e **avisa** |
| Godot | lê. Andam sozinhas |

Os casos `P-001` a `P-029` da conformidade provam as partículas.

| Função | Selo | Gesto |
|:---|:---:|:---|
| A extensão no formato | existe | `formato/` |
| Os leitores lendo partículas | existe | ver [capítulo 8](08-exportar-e-usar-no-jogo.md) |

---

## A biblioteca de animações

Quatro animações prontas vêm dentro do programa: **parado**, **andar**,
**correr** e **pular**.

| Animação | Tempo | Repete |
|:---|:---:|:---:|
| parado | 2,00 s | sim |
| andar | 1,00 s | sim |
| correr | 0,60 s | sim |
| pular | 0,90 s | não |

Elas foram gravadas contra a **convenção de nomes `humanoide-v1`**: o corpo
sem arte em `formato/rigs/humanoide-v1.bone`. **Elas entram pelo nome do
osso.** Onde o nome bate, a animação move o osso. Onde não bate, aquela parte
fica de fora, e a base continua abrindo.

### Trazer

| Passo | Gesto |
|:---:|:---|
| 1 | **Animação → Animações → Biblioteca de animações…** · ou o ícone **pasta** na tira do painel Animações |
| 2 | A janela mostra o arquivo, as quatro animações, e **o que esta base não tem** |
| 3 | **Gravar o arquivo e trazer** |
| 4 | Escolha onde gravar: **ao lado do seu `.bone`** |
| 5 | As animações aparecem na lista Animações, na seção **De fora** |

**A janela diz antes de trazer:**

| Linha | Quer dizer |
|:---|:---|
| *"Esta base tem todos os nomes"* | as animações entram inteiras |
| *"Esta base NÃO tem o osso …"* | o que depender dele fica de fora. Entra assim mesmo, e nada quebra |
| *"Tamanho: … k = 2,000"* | as translações entram multiplicadas, pelo tamanho do osso de referência |

**Por que gravar.** O arquivo mora dentro do programa. O jogo não acha o que
está dentro do editor. Então trazer é gravar o arquivo ao lado do projeto e
citar o nome dele.

| Fechou… | O que acontece |
|:---|:---|
| a janela da biblioteca | nada entra. O rodapé: *"Nada veio da biblioteca"* |
| a janela de gravar | nada entra |

**As de fora não se editam aqui.** Elas entram pelo nome ao carregar.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Biblioteca de animações, as quatro | existe | Animação → Animações → Biblioteca de animações… |
| O ícone pasta no painel Animações | existe | tira do painel Animações |
| O que a base não tem, antes de trazer | existe | a janela |
| O fator de tamanho, como número | existe | a janela |
| Grava ao lado do projeto e cita | existe | Gravar o arquivo e trazer |
| Na lista, em De fora | existe | painel Animações |
| Editar as de fora no programa | falta | o editor não as edita |
| Ver as de fora tocando na cena | não confirmei | — |
| Mais animações além das quatro | falta | só `humanoide-v1-animacoes.bone` tem animação |

Levar e trazer animações **entre as suas bases** é outra porta: **Arquivo →
Exportar / Importar → Animações…** ([capítulo 5](05-entidades.md)).

---

## O selo — o que este capítulo confirma

Selos: **existe** · **existe diferente** · **falta** · **muda com as bases**.
Conferido no código em 07/10/2026. Caminhos a partir de `editor/src/`.

| Função | Selo | Onde |
|:---|:---:|:---|
| Menu Partículas: vazio, os quatro, Prender | existe | `ui/menus.ts:1272` |
| Botão Partículas com a palavra | existe | `viewport/viewport-toolbar.ts:264`, `panels/particle-presets.ts:640` |
| Painel Partículas no menu Janela | existe | `ui/menus.ts:1640` |
| Os quatro prontos, com os números | existe | `panels/particle-presets.ts:127` |
| O vazio, magenta, que se vê | existe | `panels/particle-presets.ts:253` |
| Em que osso nasce | existe | `panels/particle-presets.ts:294` |
| Nasce apontando para cima | existe | `panels/particle-presets.ts:350` |
| Aviso de segundo emissor no osso | existe | `panels/particle-presets.ts:559` |
| A estrela e o clique | existe | `viewport/viewport-draw.ts:1023`, `viewport/picking.ts:490` |
| Mover e girar; escalar recusado | existe | `viewport/tools/attachment-edit.ts:50`, `panels/quick-model.ts:171` |
| A forma na cena, com alças | existe | `viewport/emitter-shape.ts:147` |
| O aviso curto (sem imagem, taxa 0…) | existe | `viewport/particles-view.ts:127` |
| Painel: Novo ▾, Duplicar, Apagar | existe | `panels/particles-panel.ts:76` |
| Duplicar com semente nova | existe | `doc/duplicate.ts:264` |
| A ficha em dez abas, cinco linhas | existe | `panels/particle-sheet.ts:31`, `:309` |
| Unidade e faixa de cada número | existe | `panels/particle-sheet.ts:373`, `:425` |
| Máximo de vivas avisa que corta | existe | `panels/particle-sheet.ts:546` |
| Os nove botões de forma | existe | `panels/particle-sheet.ts:163` |
| A linha "nasce · sai" | existe | `panels/particle-sheet.ts:230` |
| Curvas da vida e as prontas | existe | `panels/properties.ts:972`, `panels/life-curve.ts:144` |
| Cor na vida, o gradiente | existe | `panels/properties.ts:1091` |
| As rajadas, a janelinha | existe | `panels/properties.ts:1197`, `panels/burst-list.ts:1` |
| A folha de quadros por número | existe | `panels/properties-model.ts:1500` |
| A lista `frames` | falta | plano `16`, Desvios do lote 9 |
| O selo de peso | existe | `panels/properties.ts:218`, `panels/particle-weight.ts:115` |
| O pesado na barra de avisos | existe | `panels/particle-weight.ts:133` |
| Prender ao osso escolhido | existe | `panels/particles-actions.ts:26` |
| Prender pela Árvore e por `P` | não confirmei | só o comentário de `panels/particles-actions.ts:5` |
| Emitindo vira chave | existe | `anim/keying.ts:679` |
| Os outros números viram chave | falta | plano `16`, pergunta 4 |
| Trilha e sub-emissor | falta | plano `16`, seção 7 |
| Leitores lendo partículas | existe | `leitor-construct/LEIA-ME.md:100`, `leitor-godot/LEIA-ME.md:73` |
| Biblioteca no menu Animação | existe | `ui/menus.ts:1368` |
| Ícone pasta no painel Animações | existe | `panels/animations.ts:161` |
| Os arquivos de fábrica | existe | `io/animation-library.ts:52`, `formato/rigs/` |
| O que falta, antes de trazer | existe | `io/animation-library.ts:219` |
| O fator de tamanho | existe | `io/animation-library.ts:128` |
| Gravar e citar | existe | `io/animation-library.ts:268`, `panels/animations-actions.ts:596` |
| Editar as de fora | falta | `panels/animations.ts:70` |
| Ver as de fora tocando | não confirmei | — |

---

Próximo: [11. A espada de um, o boneco de outro](11-a-espada-de-um-o-boneco-de-outro.md) · Volta ao [índice](README.md).
