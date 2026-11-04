# Encargo — as partículas na tela (a parte `P4`) — 22/09/2026

Escrito pelo `PLANEJADOR · dd3937`. **A peça vive neste arquivo.**

## O porquê, na voz do Humberto

> *"Tem um sistema de partícula decente. Eu não vejo claramente como é que isso
> funciona no nosso aplicativo. Você mexe, mexe, mexe, e parece que está fazendo
> alguma coisa, mas eu não vejo isso no aplicativo. O carro sem o volante. Você
> está brincando sozinho."*

**Ele tem razão.** O degrau 12 construiu o motor inteiro e parou antes do
volante. Hoje as partículas:

| Onde | Estado |
|:---|:---|
| No formato | a extensão `BONE_particles` escrita, com schema e validador |
| Nos **dois** runtimes | calculam tudo: posição, ângulo, tamanho, cor, quadro |
| Em **16 casos** de conformidade | provados, nos dois, escritos às cegas |
| **No editor** | **nada.** Não há botão, não há painel, não se vê na cena |

**Este encargo é o volante.**

## A regra que manda em tudo aqui

> **LOTE SEM FOTO NÃO FECHA.** Ordem do Humberto, 21/09.

Se não dá para fotografar, não é entrega: é preparo, e preparo não conta como
progresso. Cada lote entrega um par em `backup/fotos-particulas/`, com
`node ferramentas/provas/foto-da-tela.mjs SAIDA.png --preparo ARQUIVO.js`
(portas 5193/9337). O preparo fica ao lado da foto.

**E a foto não serve só para ele ver — serve para nós vermos.** Em 22/09, um
chat foi fotografar uma dica nova, não a encontrou na tela, e descobriu que
**toda dica de item de menu ligado estava invisível desde 18/09**. Nenhum teste
pegava: a dica existia, escrita certa, e não chegava aos olhos.

## O que já está pronto e NÃO se reescreve

| Onde | O quê |
|:---|:---|
| `runtime/src/particles/emitter.ts` | **`computeParticles`** — devolve a lista de partículas vivas num instante: posição, ângulo, escala, cor, quadro |
| `runtime/src/render-list.ts` | `BONE_particle` **já está** em `DRAWABLE_TYPES` |
| `formato/extensions/BONE_particles.md` | a spec da extensão, inteira. **É a lei**: onde ela e este encargo discordarem, manda ela |
| `conformidade/casos/P-001` a `P-017` | 16 casos, os números certos, nos dois runtimes |

**Você não vai calcular partícula nenhuma.** O motor entrega a lista; o seu
trabalho é **criar o emissor, mostrá-lo e desenhá-lo**.

## Os três lotes

### Lote 1 — o emissor existe e se vê que existe

Criar um emissor e vê-lo na Árvore, na Ordem e em Propriedades. **Ainda sem
desenhar partícula na cena.**

| # | O quê |
|:---:|:---|
| 1 | **Criar**: um comando que põe um anexo `"type": "BONE_particle"` num slot, no molde do Ponto e da Caixa (`panels/tree-commands.ts`). Porta: o **Novo ▾** da Árvore, e o menu Esqueleto → Novo. **Um id só** em `ui/actions-table.ts` |
| 2 | **Ver na Árvore e na Ordem**: uma linha em `POR_TIPO` do `panels/thumbnail-kind.ts` — ícone e o nome do tipo em português. Hoje um tipo que ele não conhece cai no buraco que esse arquivo existe para tapar |
| 3 | **Ficha mínima** em Propriedades: o nome, o slot, a semente, e o aviso de que o desenho vem no lote 2 |

**A foto:** a Árvore com o emissor dentro, o ícone, e a ficha aberta.

### Lote 2 — as partículas aparecem na cena, e se mexem

**É o lote que o Humberto quer ver.** A Prévia toca a animação e as partículas
saem do emissor.

| # | O quê |
|:---:|:---|
| 1 | `viewport/viewport-draw.ts` desenha a lista que o `computeParticles` devolve, no instante da cena |
| 2 | **A semente é fixa**: arrastar a agulha para trás mostra o MESMO quadro. Isso é a régua inteira da extensão, e há 16 casos provando que o motor a cumpre. **O teste tem de provar que a TELA também a cumpre** |
| 3 | Onde o runtime não desenha (forma desconhecida, malha sem triangulação), **a tela avisa** — não some em silêncio (regra 21) |

**A foto:** o herói com partículas saindo, e uma segunda no mesmo instante
depois de arrastar a agulha para trás e voltar — **as duas idênticas**.

### Lote 3 — a ficha de verdade

Os campos da 1ª fase em Propriedades: taxa liga/desliga, vida, velocidade,
direção e abertura, forma, gravidade, rotação, tamanho, cor, imagem, espaço,
semente. **Só os da 1ª fase** — a tabela está no `documentos/programa-novo/07`.

| Cuidado | |
|:---|:---|
| **Duplicar dá semente nova** | é o defeito do Unity, escrito em `OS ERROS QUE NAO VAMOS REPETIR` §9 |
| A ficha é **alta** | Propriedades já pede 707 px a mais com uma regra escolhida. Meça (`npm run medir`) e **escreva o número**, mesmo que piore |

## A cerca

`panels/tree-commands.ts` · `panels/thumbnail-kind.ts` · `panels/properties-model.ts`
e `properties.ts` · `viewport/viewport-draw.ts` · `viewport/picking.ts` · os
testes das partes. Passagem (`contract.ts`, `ui/actions-table.ts`, `ui/menus.ts`,
`ui/keys.ts`, `CHANGELOG.md`, `ESTADO.md`, `backup/INDICE.md`): **só
acrescentando, relendo do disco antes de gravar**.

**Não toca:** `runtime/`, `runtime-python/`, `formato/`, `conformidade/`,
`site/`, `documentos/manual/`, `ui/action-audit.ts`, `ui/command-audit.ts`.

**Você vai sozinho no editor** — o emissor atravessa quatro partes, e é por isso
que este encargo não se divide.

## As regras que custaram caro, e não se reaprendem

| # | |
|:---:|:---|
| 1 | **Antes de provar que consertou, prove que o defeito existia.** Teste que nunca se viu falhar não é teste |
| 2 | **"Por que este verde é explicável?" e "o que este verde prova?" são perguntas diferentes.** A primeira sozinha engana |
| 3 | **Guardar uma chave que o programa pode reescrever** quebra o desfazer. Copie o nome no construtor; nunca leia do objeto vivo |
| 4 | **Existir não é funcionar.** Dar porta à ação e deixar o corpo dependendo da tela dá verde e não faz nada |
| 5 | **Esconder também é um efeito** |
| 6 | **Número de fecho se mede com a casa vazia**, e a medida tem hora |
| 7 | **Descreva o próprio erro pela FORMA, não pelo estrago** |

## Pronto quando

O Humberto abre o programa, cria um emissor, aperta Tocar **e vê partículas**.
Arrasta a agulha para trás e vê o mesmo quadro. Suíte sem queda, `tsc` limpo,
três pares de fotos, e o número da medição escrito — **mesmo que tenha piorado**.

---

## Desvios — pelo `EXECUTANDO · as particulas na tela`, 22/09/2026

Os três lotes fecharam: **v21.9** (o emissor existe e se vê), **v22.6** (as
partículas na cena), **v22.7** (a ficha da 1ª fase). Quatro desvios do encargo,
e cinco formas de erro para a casa varrer.

### Desvio 1 — o item 1 do lote 2 não foi escrito, porque já existia

O encargo mandava: *"`viewport/viewport-draw.ts` desenha a lista que o
`computeParticles` devolve"*. **Fui medir antes e a cena já desenhava.** O editor
posa o esqueleto e o entrega ao `CanvasRenderer` do runtime; esse desenhador já
tem `BONE_particle` em `DRAWABLE_TYPES` e já tem o `drawParticles`. Medido na
tela às 01h05: 45 partículas jorrando do antebraço do herói.

**Nenhuma linha de desenho foi escrita.** Escrever um segundo desenho daria duas
contas para a mesma coisa, divergindo em uma semana. Está dito no CHANGELOG para
o próximo não procurar o código e não achar.

### Desvio 2 — o ícone `particle` entrou em `ui/icons.ts`, fora da cerca

Emprestar o ícone do Ponto faria a linha da Árvore dizer "um ponto" onde há um
emissor. Entrei **só acrescentando uma entrada**, relendo do disco, e avisei o
Planejador, que confirmou: `ui/icons.ts` é passagem na prática.

### Desvio 3 — a altura foi medida no preparo da foto, não pelo `npm run medir`

Não tive o "pode" do Planejador para o `medir`, e a casa estava com cinco chats.
O preparo mede a altura da ficha do emissor direto no painel, o que responde uma
pergunta **melhor** para este lote: o `medir` dá o número do painel inteiro,
este dá o do assunto que engordou. **O `npm run medir` continua devendo.**

### Desvio 4 — a linha "ainda não desenha" do lote 1 saiu no lote 3

O encargo pedia, no lote 1, *"o aviso de que o desenho vem no lote 2"*. Ele foi
escrito e **tirado depois**, porque o lote 2 cumpriu a promessa. Uma promessa
cumprida que fica na tela vira mentira, e pior que a falta que ela cobria: quem
a lesse desconfiaria do jorro que está vendo.

---

## As formas de erro deste encargo

Descritas pela **forma**, e não pelo estrago, para servirem a quem não as
cometeu (regra 27).

| # | A forma |
|:---:|:---|
| 1 | **Criei DUAS listas e só cuidei de UMA no desfazer.** O `AddSlotWithAttachment` apagava a `skins` que criara e deixava a `slots`. Atinge o Ponto, a Caixa e a Máscara, que herdam o mesmo `apply` |
| 2 | **O arquivo de exemplo rico esconde o caso vazio.** Ninguém tinha visto a de cima porque **o herói tem vinte slots, e nenhum teste partia de um arquivo que não tem nenhum**. Vale para qualquer teste que use o herói como chão — é prima do `K` que parecia inofensivo por ter sido medido num osso sem curva |
| 3 | **Medi o palco inteiro e culpei a peça nova.** A ida-e-volta da agulha dizia "quadro diferente" e a culpa ia cair nas partículas. Eram os **mesmos 561 pixels** com e sem emissor: o cabelo e a capa do herói, que andam numa regra de física — e física guarda estado **de propósito**. A metade que fecha: **a régua do instrumento não vai dentro do próprio passeio**, porque o segundo passeio parte de um estado diferente do primeiro. Medi e vi: 618 com emissor, 1543 sem, na mesma página |
| 4 | **Prometi na tela o que o código não podia cumprir.** A frase da forma desconhecida ia repetir a palavra do arquivo — e o carregador já a trocara pelo padrão `point`. Diria *"a forma 'point' é desconhecida"*, mandando a pessoa procurar a palavra errada **no arquivo dela** |
| 5 | **Apontei para dentro de um array e criei um array de um elemento.** `/…/lifetime/0` num campo ausente deixa `[2]`; o schema exige dois e o runtime lê `faixa[1]`: a vida sai `NaN`. **Inválido de um jeito que a tela não mostra** |

**Uma consequência que não é deste lote e vale para todos, e ninguém a tinha
escrito em lugar nenhum:**

> **A cena do editor não é função pura de `t`.** Arrastar a agulha para trás e
> voltar **não** devolve o mesmo desenho do herói — a física do cabelo e da
> capa guarda estado de propósito.

Toca qualquer prova futura que compare fotos da cena, inclusive a casca de
cebola. O Planejador vai escrevê-la no `ESTADO.md`.

**E a regra do Humberto deu resultado três vezes em uma noite.** A foto achou o
que teste nenhum achava: o grupo "O emissor" que estava no modelo e **caía
abaixo da borda** do painel; a frase do aviso **correndo para fora do palco**,
chegando aos olhos como *"…escolha uma em Prop"*; e os rótulos longos quebrando
em **três linhas**, que custavam 306 px da ficha.

## O que fica devendo

| # | O quê |
|:---:|:---|
| 1 | **`npm run medir` e `npm run roteiro`** neste lote — nunca tive o "pode", e a casa estava com cinco chats |
| 2 | **Os 2 393 px que faltam na ficha.** Pedido de desenho, não conserto escondido: grupos que recolhem, segunda coluna, ou abas dentro da ficha. Junto com o "Compensar" que vem antes da ficha do assunto |
| 3 | **`onWarning` da cena**, em `viewport.ts` (fora da cerca, e outro chat estava nele). Uma linha. Mas o rodapé é o lugar **errado** para o aviso do emissor: mandaria procurar QUAL emissor num arquivo com vários — o anel na cena é o lugar certo, e ele já está lá |
| 4 | **Duplicar um emissor com semente nova** no caminho do `Ctrl+D` (`doc/duplicate.ts`, fora da cerca). O comando de CRIAR já dá semente nova, e `freshSeed` está exportado para quem for fazer |
| 5 | **Gradiente de cor e alfa ao longo da vida** (`colorOverLifetime`, `alphaOverLifetime`, `scaleOverLifetime`): são listas de chaves, e uma lista de chaves precisa de editor próprio, não de campo. 2ª fase de tela |
| 6 | **A timeline `emitting` na linha do tempo.** O motor já a lê (§4.1) e a ficha já tem a caixa; falta a faixa na linha do tempo para chavear liga/desliga. Não é da minha parte |
