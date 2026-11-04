# Flash, pulso e tremor — o que os três programas fazem, e os desvios

Escrito pelo `EXECUTANDO · flash, pulso e tremor`, 22/09/2026.
Fonte do encargo: `COMO SE FAZ EFEITO 2026-09-16.md` §6, itens 2 e 4.

---

## Os três programas, gesto por gesto

**Régua do Humberto: antes de todo gesto novo, ver como Spriter, Spine e
DragonBones fazem.** Aqui vai o que cada um faz — e o que nós fizemos
diferente, com o motivo.

**A honestidade primeiro (regra 21):** a pasta `documentos/pesquisa/` **não
tem** nada sobre estes três gestos — procurei por *flash*, *pulso*, *tremor*,
*shake*, *noise* e *ruído* e não há linha. O que está abaixo vem de
conhecimento, **não de medição nos programas**, e quem tiver um deles na mão
deve conferir antes de citar como fato. O que é fato medido está marcado.

### 1. Flash

| Programa | O que faz |
|:---|:---|
| **Spriter** | não tem gesto de flash. O que há é a **cor do objeto** por chave (alfa e tint), e o flash se faz à mão: três chaves de cor |
| **Spine** | não tem gesto de flash. Tem o **tint black** (`darkColor`) na timeline de cor do slot, que é exatamente a conta que faz um branco puro. O caminho é o mesmo à mão: três chaves |
| **DragonBones** | não tem gesto de flash. Tem cor por slot com `alphaOffset` / `redOffset`, que soma em vez de multiplicar — outro caminho para o mesmo lugar |

**Os três chegam ao mesmo lugar à mão, e nenhum tem o gesto.** Então o nosso
não copia um deles: ele **automatiza o que os três fazem à mão**, e grava as
chaves que qualquer um dos três gravaria. Isso é o que o "só porta" da §6 quer
dizer.

**O que nós fizemos diferente, e é uma escolha:** o `darkColor`, e não o
`color`. O caminho do DragonBones (somar) não existe no nosso formato — o
`color` do slot **multiplica** (7.12). Multiplicar por branco não muda nada.
`darkColor = (1,1,1)` leva o pixel a branco puro pela mesma fórmula, sem
shader e sem blend aditivo. É a conta do Spine, e é a única que o nosso
formato já sabe fazer.

### 2. Pulso

| Programa | O que faz |
|:---|:---|
| **Spriter** | escala por chave, à mão. Sem gesto de pulso |
| **Spine** | escala por chave, à mão, com a curva desenhada no gráfico. Sem gesto de pulso |
| **DragonBones** | escala por chave, à mão. Sem gesto de pulso |

Mesma história. O nosso grava as três chaves de escala **com a curva suave já
posta**, porque um pulso linear anda em bico e ninguém quer isso — quem desenha
à mão nos três programas desenha a curva logo em seguida.

### 3. Tremor

| Programa | O que faz |
|:---|:---|
| **Spriter** | nada. Tremor é chave a chave |
| **Spine** | nada no editor. A comunidade pede há anos; a resposta de sempre é *"faça no jogo"* |
| **DragonBones** | nada |
| **Unity** (fora dos três, mas é a fonte do erro) | tem, e **embaralha a semente ao duplicar** — `OS ERROS QUE NAO VAMOS REPETIR` §9, com a issue registrada |

**Aqui nós fazemos algo que nenhum dos três faz**, e por isso o cuidado maior.
O defeito do Unity **não tem como acontecer no nosso**, pelo desenho: não há
semente guardada em lugar nenhum. O gesto sorteia, grava chaves e some.
Duplicar a animação copia números que já estão na linha do tempo.

---

## Desvios

### D1 — A porta mora em `ui/`, e não ao lado da conta

**Combinado com o Planejador antes de escrever, e aprovado.**

`anim/` é o degrau 1 e o registro de ações é o degrau 3 (`contract.ts`,
cabeçalho; `fronteiras.test.ts` cobra). Então a conta ficou em
`anim/efeitos.ts` e a porta em `ui/efeitos-actions.ts`, com uma linha
acrescentada em `ui/register-actions.ts`. É o mesmo molde de
`panels/rules-actions.ts`, nascido horas antes pela mesma razão.

### D2 — Os canais do sorteio não são a tabela da §3.3

O `pcg` e o `acaso` da §3.2 da `BONE_particles` são usados **bit a bit**, e o
teste confere os cinco valores de referência. O que **não** veio de lá é a
tabela de canais da §3.3 (`0 = lifetime`, `1 = speed`…): aquela é dos campos de
um **emissor**, e está congelada para eles. Um tremor não é um emissor — não
emite, não guarda semente, não entra no arquivo como objeto nenhum. O fluxo e
os canais do tremor são endereço interno de um sorteio que vive três
milissegundos e vira chave.

**Suposição escrita, caso alguém discorde depois:** assumi que reutilizar a
função sem reutilizar a tabela é o certo, porque a tabela congela o **sentido**
de cada canal para os campos de partícula, e nós não escrevemos campo de
partícula nenhum. Se o Humberto ou o Planejador preferir um fluxo reservado
próprio, é trocar dois números em `anim/efeitos.ts` e reescrever o teste da
semente.

### D3 — Sem tecla de atalho, de propósito

A regra 17 pede uma linha em `ui/keys.ts` para tecla nova. **Não pus tecla
nenhuma**, então não há linha: os três são gesto de vez em quando, como o
"Colar corpo aqui", que também ficou sem tecla de propósito. Pôr três teclas
novas numa tabela já cheia custa mais do que rende.

### D4 — Gravei nos arquivos de passagem antes de tirar a cópia

**Meu erro, e a forma é esta:** *escrevi no arquivo de passagem antes de tirar
a cópia de segurança.* A regra 1 pede a cópia **antes**, e ela existe
exatamente para dizer o que havia ali. As cópias que estão em `backup/` com
`depois-do-lote-1-dos-efeitos` no nome são, portanto, a linha de base **do
próximo** lote, não deste. O que veio antes de mim sobrevive por sorte, nas
cópias que o chat dos defeitos tirou por volta das 00h30.

### D5 — O `acoes.test.ts` foi tocado no meio da mão de outro chat

Acrescentar ação **obriga** a mexer em `acoes.test.ts`, que prende os números
`tabela.length` e `arranque().length`. Gravei às 00h56 sem saber que o chat dos
defeitos estava no arquivo. Não houve estrago — ele viu e não brigou pelo
número. **A régua que ficou (a 25 da casa):** quem for acrescentar ação avisa o
Planejador antes de gravar ali, porque ele sabe quem mais está no arquivo.

### D6 — O erro de dois minutos

Gravei `efeitos.test.ts` às 00h52 com um `as` que o `tsc` recusa, medi em
seguida e consertei às 00h54. Nesses dois minutos o vermelho apareceu na tela
do chat dos defeitos, que estava medindo. **A forma:** *gravei um arquivo e o
deixei no disco antes de conferir o tipo.* O `tsc` é da casa inteira; o meu
minuto de rascunho é o vermelho de outro. **Escreva e meça na mesma volta.**

---

## O que fica para quem vier

| O quê | Onde |
|:---|:---|
| Os itens 1, 3, 5 e 6 da §6 continuam de pé | `COMO SE FAZ EFEITO 2026-09-16.md` |
| O item 5 (emissor sem estado) é **campo novo**: decisão do Humberto (regra 7) | idem |
| Se os três efeitos ganharem painel em vez de janela, a conta não muda | `anim/efeitos.ts` já separa plano de gravação |
| Um quarto efeito do mesmo feitio (piscar, desaparecer, sacudir a cor) entra como um `planoDo*` novo e três linhas de porta | idem |

---

# Lote 2 — a folha animada do Aseprite (§6 item 1)

## Os três programas, para este gesto

**Medido no código desta casa, não nos programas** (a `documentos/pesquisa/`
não tem a comparação, e eu não tenho os três na mão). O que segue vem de
conhecimento e está marcado como tal, como no lote 1.

| Programa | Como a folha animada entra |
|:---|:---|
| **Spine 4.2** | arrastar um **grupo numerado** de imagens cria UM attachment `Sequence`; o número no fim do nome é o quadro. Folha única com JSON: não entra sozinha — passa pelo empacotador de atlas |
| **Spriter** | a pasta de imagens vira quadros do mesmo objeto, trocados por chave de imagem |
| **DragonBones** | *display list* do slot com vários quadros, trocados pela linha do tempo |

Esta tabela já estava escrita no cabeçalho de `io/drop-plan.ts` desde o degrau
8, por quem fez a metade da pasta numerada — e **o Spine continua sendo o
modelo**: o número no fim do nome manda, e o que entra é um anexo só. O que
este lote acrescenta é a folha **única**, que nenhum dos três aceita arrastando
com o `.json` do Aseprite ao lado.

## Desvios do lote 2

### D7 — Mexi em `ui/shell-drop.ts`, e pedi antes

Combinado com o Planejador e aprovado: ninguém estava no arquivo. Só
acrescentei — o ramo novo vem **antes** do `switch`, e nenhuma linha antiga
mudou. Vem antes porque o `dropPlan` só vê nomes, e pelo nome o `.json` da
folha é igual ao do Spine: quem desempata é o conteúdo, e o conteúdo só se lê
ali.

### D8 — A cópia tardia, de novo — e desta vez com a saída escrita

**Mesma forma do D4**, e é para constar: as cópias dos quatro arquivos de código
saíram depois da escrita. Desta vez, em vez de fingir, o nome diz o que elas
são (`depois-do-lote-2-da-folha`) e o `INDICE.md` aponta a linha de base
verdadeira: o zip `recorte v21.8 2026-09-22.zip`, guardado às 01h02 pelo lote
anterior, com o projeto inteiro. **Todo fecho de versão é uma linha de base, e
eu não estava usando a que eu mesmo tinha criado.**

### D9 — As `frameTags` são lidas e não viram animação

O Aseprite marca trechos de quadros com nome (`queimando`, de 0 a 3). O módulo
**lê** essas etiquetas e as carrega em `sheet.tags`, e o rodapé as conta para
quem soltou. Mas elas **não viram animação** neste lote.

Escrito de propósito, e não esquecido: uma etiqueta é uma animação pronta com
chaves de `sequence`, e fazer isso bem pede decidir o que acontece quando já
existe uma animação com aquele nome, e o que fazer com as durações por quadro
(o Aseprite dá milissegundos por quadro; a §7.10 não tem esse campo, e a
troca vem da timeline `sequence` da 9.6). **São decisões, não código** — e
decisão de comportamento novo sobe, não se inventa.
