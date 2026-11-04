# Dois runtimes, a mesma suíte

**Data:** 08/09/2026, fim da fase 7.

Um formato com um runtime só não é um formato: é um programa. Enquanto a suíte
de conformidade só rodou contra o runtime que a gerou, ela provou que o runtime
concorda consigo mesmo.

Esta página é o fim disso. O formato `.bone` tem **dois** runtimes, escritos
por caminhos independentes, e eles foram postos frente a frente.

---

## Os dois runtimes

| | Runtime de referência | Segundo runtime |
|:---|:---|:---|
| Linguagem | TypeScript | Python 3.12 |
| Onde | `runtime/src/` | `runtime-python/recorte/` |
| Dependências | nenhuma | nenhuma, só biblioteca padrão |
| Escrito a partir de | a spec **e** o porte do Spine 4.2 | **só o texto da spec** e o JSON Schema, sem abrir `runtime/src/` |
| Testes próprios | dentro dos 1.285 do projeto | 128, com `unittest` |
| Nível declarado | C | C |

O segundo runtime é o experimento que importa: o autor dele **não podia ler o
primeiro**. Se a especificação bastar, ele passa. Onde ele não passou, a
especificação tem buraco — e o buraco é a descoberta, não o bug.

---

## Placar dos dois, caso a caso

Os dois comandos, da raiz do projeto:

```
node ferramentas/conformidade.mjs
python runtime-python/conformidade.py
```

| Caso | Nível | TypeScript | Python | Diferença entre os dois |
|:---|:---:|:---:|:---:|---:|
| A-010-heranca-cinco-modos | A | passou | passou | 4,0e-7 |
| A-011-shear | A | passou | passou | 3,9e-7 |
| A-020-curvas | A | passou | passou | 5,0e-7 |
| A-021-rotacao-sem-volta | A | passou | passou | 3,0e-7 |
| A-022-antes-da-primeira-chave | A | passou | passou | 1,2e-16 |
| A-023-draworder-offsets | A | passou | passou | nenhuma |
| A-024-troca-de-attachment | A | passou | passou | nenhuma |
| A-025-skin-padrao | A | passou | passou | nenhuma |
| A-026-skin-trocada | A | passou | passou | 1,8e-15 |
| A-027-evento-em-laco | A | passou | passou | nenhuma |
| A-028-escala-zero | A | passou | passou | 1,8e-15 |
| **A-029-draworder-colisao** | A | passou | passou | nenhuma |
| B-101-pesos-sem-normalizar | B | passou | passou | 7,1e-15 |
| B-102-atlas-regiao-com-corte | B | passou | passou | 3,6e-15 |
| B-103-atlas-regiao-girada | B | passou | passou | 5,0e-7 |
| **B-104-linkedmesh** | B | passou | passou | 6,1e-15 |
| B-110-sequencia-sete-modos | B | passou | passou | nenhuma |
| BIN-401-roundtrip | BIN | passou | passou | 4,1e-7 |
| C-200-ordem-das-constraints | C | passou | passou | 6,1e-15 |
| C-210-ik-1-osso | C | passou | passou | 3,5e-7 |
| C-211-ik-1-osso-stretch | C | passou | passou | 3,5e-7 |
| C-212-ik-2-ossos | C | passou | passou | 4,0e-7 |
| C-213-ik-2-ossos-stretch | C | passou | passou | 2,2e-7 |
| C-220-transform-mundo-absoluto | C | passou | passou | 4,0e-7 |
| C-221-transform-mundo-relativo | C | passou | passou | 3,5e-7 |
| C-222-transform-local-absoluto | C | passou | passou | 3,4e-7 |
| C-223-transform-local-relativo | C | passou | passou | 2,7e-7 |
| C-224-transform-mix-parcial-mais-de-180 | C | passou | passou | 4,4e-7 |
| C-230-transform-com-shear | C | passou | passou | 4,0e-7 |
| C-231-raiz-com-coluna-zerada | C | passou | passou | 4,4e-16 |
| C-240-path-posicao | C | passou | passou | 2,8e-14 |
| C-241-path-espacamento | C | passou | passou | 1,4e-14 |
| C-242-path-rotacao-chain | C | passou | passou | 4,7e-7 |
| C-250-deform-mais-morph | C | passou | passou | 6,1e-15 |
| C-260-fisica-passo-fixo | C | passou | passou | 4,4e-7 |
| X-301-propriedade-desconhecida | X | passou | passou | 1,2e-15 |
| X-302-tipo-desconhecido | X | passou | passou | 1,8e-15 |
| X-303-minor-maior | X | passou | passou | 3,6e-15 |
| X-304-extensao-nao-exigida | X | passou | passou | 1,2e-16 |
| X-305-extensao-exigida-desconhecida | X | recusou | recusou | nenhuma |
| ZIP-501-manifesto | ZIP | passou | passou | 3,6e-15 |

**46 de 46 nos dois. 46 de 46 concordam campo a campo.**

A coluna da direita **não** é a diferença para o `esperado.json`: é a diferença
entre **um runtime e o outro**, medida campo a campo. As sobras de `e-7` são o
arredondamento de 6 casas do dump; as de `e-15` são a última casa do float 64.

Os dois casos em negrito nasceram nesta fase, dos achados abaixo.

---

## Como o confronto é feito

A suíte compara cada runtime com o `esperado.json`. Isso **não** é suficiente
para dizer que dois runtimes concordam, porque o harness compara só os campos
que o esperado cita. Um campo que um runtime escreve e o outro omite nunca
reprova ninguém — e os dois desenham coisas diferentes.

Então existe uma segunda ferramenta, que roda os dois adaptadores no mesmo caso
com a mesma sonda e compara os **dois dumps inteiros**, chave por chave:

```
node ferramentas/comparar-runtimes.mjs
node ferramentas/comparar-runtimes.mjs --json
npm run conformidade:dois
```

Ela sai com código diferente de zero quando os dois discordam. Campo presente
num e ausente no outro conta como divergência, e não como zero.

---

## As divergências, e o veredito de cada uma

Foram **seis**. Na primeira rodada, 10 dos 39 casos divergiam.

### 1. `darkColor` e `sequenceIndex` no dump de slot — 10 casos

| | |
|:---|:---|
| **Casos** | A-024, A-025, A-026, B-102, B-103, B-110, X-301, X-302, X-303, ZIP-501 |
| **TypeScript** | escreve sempre: `darkColor: null`, `sequenceIndex: -1` |
| **Python** | omite os dois quando não há dark color e não há sequência |
| **Veredito** | **Ambiguidade da especificação.** A §12.4 mostrava três campos de `slots` no exemplo (`attachment`, `color`, `visible`) e não dizia nada sobre os outros dois nem sobre presença. |

Esta é a divergência mais importante do relatório, e não por causa dos números
— eles batiam. É importante por causa de **como ela some**: os dois runtimes
passavam em 39 de 39, e o campo faltando era invisível para a suíte.

**O que foi feito.** A §12.4 ganhou a tabela dos cinco campos de `slots`, com
quando cada um aparece, e a frase: presença de campo é normativa, um dump com
campo faltando não é conforme. O runtime Python passou a escrever os dois.
Apêndice A, 45.

### 2. Solver de Bézier: a parada estava medida no eixo errado — 1 caso

| | |
|:---|:---|
| **Caso** | A-020-curvas |
| **Medido** | os dois discordavam em **8,5e-5**, com tolerância de conformidade de **1e-4** |
| **Veredito** | **Erro da especificação.** Os dois runtimes obedeciam ao texto ao pé da letra e chegaram a 85% do limite de reprovação. |

A §9.3 mandava resolver `x(s) = t` "até `|x(s) − t| <= 1e-6 × (t1 − t0)`". Essa
é uma tolerância no eixo do **tempo**. O erro que sobra em `s` chega ao valor
multiplicado por `|v'(s)| / |x'(s)|`, e essa razão **não tem limite superior**:
uma curva de aceleração forte transforma um erro invisível em `x` num erro
grande no valor.

Não é teoria. O A-020 tem uma curva com alças `cy = 0`, isto é, `v(s) = s³·100`.
Perto de `s = 1`, `dv/ds = 300`. Um erro de `1e-6` em `s` vira `3e-4` no valor.

**O que foi feito.** A §9.3 passou a exigir a parada medida em `s`: o intervalo
que ainda pode conter a raiz tem de ficar menor que `1e-9`. Os **três** solvers
do projeto — runtime TypeScript, runtime Python e o do editor — foram trocados.
A divergência caiu de 8,5e-5 para 5,0e-7, que é o arredondamento do dump.
Apêndice A, 46.

O teste `editor/testes/curvas.test.ts` pegou o terceiro solver sozinho: ele
existe justamente para o editor e o runtime não se afastarem, e quebrou no
mesmo minuto em que o runtime foi corrigido.

### 3. `uvs` de uma malha ligada — caso novo

| | |
|:---|:---|
| **Caso** | B-104-linkedmesh (criado nesta fase) |
| **TypeScript** | não escrevia nada: o `linkedmesh` não é `MeshAttachment`, e o `else if` do dump não pegava ele |
| **Python** | escrevia os UV do parent |
| **Veredito** | **Erro do runtime TypeScript.** Uma `linkedmesh` tem imagem própria; sem ela no canal `uvs`, nenhum erro de textura de malha ligada é visto pela suíte. |

**O que foi feito.** O dump de referência passou a incluir `linkedmesh` no
canal `uvs`. Apêndice A, 51.

### 4. `uvs` sem atlas — o que devolver

| | |
|:---|:---|
| **Veredito** | **Ambiguidade da especificação.** A §12.4 exigia medir `uvs` num caso **com** atlas e não dizia o que sai sem atlas. |

**O que foi feito.** A §12.4 passou a dizer: sem atlas, os UV são os literais —
os quatro cantos `(0,1) (1,1) (1,0) (0,0)` numa região, e os `uvs` do arquivo
numa malha, sem o mapeamento da §10.4. Apêndice A, 51.

### 5. Base de resolução dentro do `.bonez`

| | |
|:---|:---|
| **TypeScript** | procurava na pasta do `main` e, **se não achasse, tentava a raiz do ZIP** |
| **Python** | só na pasta do `main` |
| **Veredito** | **Erro do runtime TypeScript.** Um leitor com segunda chance abre pacotes que outro leitor recusa, e o autor do pacote nunca descobre que está errado. |

Nenhum caso pegava isso: o ZIP-501 tem o `main` na raiz do pacote, e aí as duas
leituras dão o mesmo resultado.

**O que foi feito.** A segunda chance saiu do runtime, e a §2.8 passou a dizer
com todas as letras que ela é proibida, com um exemplo de `main` em subpasta.
A falta de um caso de `.bonez` com `main` em subpasta entrou na lista do que a
suíte não cobre. Apêndice A, 54.

### 6. Colisão de `drawOrder` — caso novo

| | |
|:---|:---|
| **Caso** | A-029-draworder-colisao (criado nesta fase) |
| **Veredito** | **Ambiguidade da especificação**, sem divergência de runtime: os dois já faziam a mesma coisa, por sorte. |

A §9.5 dizia que a entrada perdedora "é tratada como não citada". Mas o passo 2
do algoritmo pula quem "já foi citado". Um runtime que lê a frase ao pé da letra
deixa um buraco na ordem e **desenha um slot a menos**.

**O que foi feito.** A §9.5 ganhou a palavra "descitado" e dois exemplos
numéricos completos, e o caso A-029 prende os dois comportamentos: a colisão e
o clamp de índice fora de faixa. Apêndice A, 52.

---

## O que a especificação ganhou com isso

Treze entradas novas no Apêndice A, todas com origem **"dois runtimes"**:

| # | O que mudou | Seção | Origem |
|:---:|:---|:---|:---|
| 43 | A regra de sujeira virou **normativa**; recalcular tudo reprova no C-230 por 0,116 | 5.6, 12.2 | segundo runtime |
| 44 | O estado da simulação de física **atravessa** a setup pose | 5.1, 6.5 | segundo runtime |
| 45 | Presença de campo no pose dump é normativa; a tabela dos cinco campos de `slots` | 12.4 | **confronto** |
| 46 | A parada do solver de Bézier é medida em `s`, nunca em `x` | 9.3 | **confronto** |
| 47 | `extrapolaAntes` e `extrapolaDepois` da §6.4, enfim definidas | 6.4 | segundo runtime |
| 48 | Qual dos dois comprimentos é o `total` do caminho | 6.4 | segundo runtime |
| 49 | Ordem de busca do `deform` por skin | 9.6 | segundo runtime |
| 50 | `physicsDt`, janela de `events` e `loop` saíram do `leiame.md` para a §12.4 | 12.4 | segundo runtime |
| 51 | `uvs` sem atlas são literais; `linkedmesh` entra no canal `uvs` | 12.4, 7.5 | **confronto** |
| 52 | Colisão de `drawOrder`: o perdedor é **descitado** | 9.5 | **confronto** |
| 53 | `width: 0` sem atlas e sem imagem = attachment vazio | 7.3 | segundo runtime |
| 54 | A base dentro do `.bonez` é a pasta do `main`, sem segunda chance | 2.8 | **confronto** |
| 55 | `remaining = a` vale em todos os caminhos do `physicsApply` | 6.5 | segundo runtime |

As sete de "segundo runtime" vêm do
`documentos/notas-de-desenvolvimento/SPEC-INSUFICIENTE.md`, escrito por quem
implementou o runtime Python lendo só o texto. As seis marcadas **confronto**
só apareceram quando os dois dumps foram postos lado a lado — nenhuma delas
reprovava caso nenhum.

---

## Os dois graves do `SPEC-INSUFICIENTE.md`

O relatório do segundo runtime abre com dois pontos em que o texto da spec, ao
pé da letra, **falha na própria suíte**. Os dois estão consertados.

### §5.6 passo 3: recalcular tudo quebra o C-230

O texto mandava, no fim do quadro, `for bone in skeleton.bones: updateWorld(bone)`.

Uma constraint escreve a matriz de mundo e depois chama `appliedFromWorld`
(§5.5). Sob cisalhamento a §5.5 **perde** informação. Refazer `updateWorld` a
partir dessa pose aplicada não devolve a matriz que a constraint deixou:

| | `b` | `d` |
|:---|---:|---:|
| Matriz que a constraint deixou, e que o C-230 cobra | −0,5 | 0,866025 |
| Matriz depois do passo 3, ao pé da letra | −0,433013 | 0,75 |

Erro de 0,116 num campo com tolerância de 0,0001.

A saída já estava escrita na spec — o parágrafo do "cache de sujeira" — mas
rotulada como **otimização**, com "PODE". Não é opcional: é a única leitura que
passa. A §5.6 agora traz a regra como tabela normativa, com a conta do C-230
escrita ao lado, e a §12.2 deixou de chamar isso de "DEVERIA".

### §5.1 e §6.5: a física não sobrevivia à setup pose

A §5.1 dizia que a setup pose inclui "todos os valores" da constraint. Lendo
assim, `xOffset`, `xVelocity`, `remaining` e `lastTime` voltam ao zero a cada
quadro, a física nunca acumula, e o C-260 falha com a haste colada no pai.

A §6.5 dizia que o estado "não vai no arquivo". São duas coisas diferentes, e a
spec só escrevia uma.

Agora as duas seções dizem: a setup pose devolve os **valores animáveis**; o
**estado de simulação** só é zerado por `physicsReset` ou pela timeline `reset`.

---

## O que este confronto ainda NÃO prova

Honestidade é o que dá valor ao resto da página.

| O que | Por quê |
|:---|:---|
| Os dois runtimes não são independentes de verdade em 5.4, 5.5 e 6.2–6.5 | O de TypeScript é porte do Spine 4.2; o de Python copiou o **pseudocódigo da spec**, que foi tirado do mesmo lugar. Dois portes da mesma fonte concordarem não prova que a fonte está certa. A conferência contra o `spine-runtimes` em C++ continua aberta (Apêndice B, 6). |
| O segundo runtime não cobre tudo | Fora dele: esqueleto aninhado, recorte de verdade dos triângulos, desenho, **gravação** dos três formatos, validador L0/L1/L2, mistura por faixas e extensões `BONE_*`. Ele **lê**; ele não grava. |
| A suíte continua com buracos | `boundingbox`, `clipping`, `point`, `tag`, `variable`, `parameter`, `driver`, attachment `skeleton`, `darkColor` e `blend` não têm caso. Cinco canais da sonda não são medidos por caso nenhum. Falta o `.bonez` com `main` em subpasta. |
| Um terceiro runtime acharia mais | Foram **seis** divergências em dois. O número não vai a zero por decreto: vai a zero quando a suíte medir tudo o que a spec promete. |
| ~~Nenhum dos dois lê o rascunho 0.2~~ (manhã de 17/09/2026) | **Fechado à tarde do mesmo dia.** Os dois runtimes leem o 0.2: TypeScript v13.7, Python v13.4 (só pela spec). Os 18 casos novos entraram em `casos/` e o confronto dá **71 de 71 concordando campo a campo**. O segundo runtime anotou 16 lugares em que a spec não bastava (Apêndice C); dois deles (o relógio do filho e o tempo do evento do filho) tinham sido lidos de jeitos diferentes pelos dois, e os casos C-299 e C-300 decidiram. |

---

## Como refazer este confronto

```
node ferramentas/conformidade.mjs                     # runtime de referência
python runtime-python/conformidade.py                 # segundo runtime
node ferramentas/comparar-runtimes.mjs                # os dois, campo a campo
```

E, para rodar a suíte oficial **contra** o runtime Python, pelo executor de
fora, que é o caminho que um terceiro usaria:

```
node ferramentas/conformidade.mjs --adaptador "python runtime-python/adaptador.py"
```

Os três dão 46 de 46.
