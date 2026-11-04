# Dúvidas sobre a especificação — runtime

Pontos encontrados ao implementar a fundação do runtime. Cada item traz a seção da
spec, o problema e a proposta. O runtime segue a leitura indicada em "o que o
runtime faz" até a spec decidir.

## 1. §7.3 — UVs dos cantos do `region` com corte de borda (`offsetX/offsetY`)

**Problema.** Os quatro cantos calculados em 7.3 são os cantos do **recorte**
(`x0 = -OW/2 + ox`, `x1 = x0 + rw`). Mas o texto diz que os UVs dos cantos são
`BL=(0,1) BR=(1,1) TR=(1,0) TL=(0,0)` na imagem **original**, passados por 10.4.
Com `offsetX > 0` ou `offsetY > 0`, (0,1) é o canto da imagem original, que fica
**fora** do recorte: 10.4 devolve `px = -offsetX`, um pixel na margem da página.
A geometria do recorte receberia a textura da imagem inteira, encolhida.

**Proposta.** Dizer que os UVs dos cantos são os do **recorte** na imagem
original: `u0 = offsetX/OW`, `u1 = (offsetX+width)/OW`, `v_baixo = 1 - offsetY/OH`,
`v_topo = 1 - (offsetY+height)/OH`. Sem offsets isso vira exatamente
(0,1)/(1,1)/(1,0)/(0,0).

**O que o runtime faz.** `RegionAttachment.updateRegion()` usa os UVs do recorte
(equivale ao `RegionAttachment.updateRegion` do Spine 4.2, que usa `u, v, u2, v2`
da região na página).

**FECHADO em 08/09/2026.** A proposta foi adotada: a §7.3 agora traz a fórmula
do recorte por escrito, com o parágrafo que explica por que a forma curta
engana. Os casos **B-102** (com `offsetX`/`offsetY`) e **B-103** (com
`rotation: 90`) prendem os números, e o canal **`uvs`** do pose dump (§12.4)
foi criado para que eles possam ser conferidos — antes disso a suíte não
comparava textura nenhuma.

## 2. §10.3 / §10.4 — sentido da rotação 90 do atlas vs. Spine

**Problema.** A spec define `rotation: 90` como "girado 90° horário": o canto
superior esquerdo do recorte cai no canto superior **direito** do retângulo na
página. No Spine (`TextureAtlas`, `rotate: true` / `degrees: 90`) a região é
armazenada girada 90° **anti-horário** (canto superior esquerdo do recorte cai no
canto inferior esquerdo). Não é erro — a fórmula de 10.4 é coerente consigo mesma —
mas o importador de atlas do Spine (13.1) precisa converter (`x, y` mudam) ou a
spec precisa adotar a convenção do Spine.

**O que o runtime faz.** Segue 10.4 ao pé da letra (`AtlasRegionData.computeUV`).

**Coberto desde 08/09/2026.** A convenção continua sendo a da spec (horário), e
o caso **B-103** prende os números: um runtime que use a convenção anti-horária
do Spine sem converter troca os eixos e falha. O importador de atlas do Spine
(13.1) já faz a conversão. A escolha entre as duas convenções segue sendo uma
decisão do dono; a diferença agora é medida.

## 3. §5.5 — `appliedFromWorld` não é inversa exata com `shearY`

**Observação.** Com `shearY ≠ 0`, a decomposição devolve
`scaleY = det / scaleX = scaleY·cos(shearY)` (não o comprimento da coluna 2).
`rotation`, `scaleX` e `shearY` saem certos. Reconstruir o mundo a partir dessa
pose dá uma matriz diferente da original. É o comportamento do Spine 4.2
(`updateAppliedTransform`) e a spec o porta fielmente, então está "certo por
definição", mas vale registrar na spec que a função é aproximada sob shear —
os casos de conformidade que comparam `ascaleY` depois de transform/path/physics
dependem disso.

**O que o runtime faz.** Porta a fórmula como está (`Bone.updateAppliedTransform`);
teste em `testes/skeleton.test.ts` documenta o `cos(shearY)`.

## 4. §7.6 vs §9.6 — `deform` em `boundingbox`

**Problema.** 7.6 diz que a forma de colisão é levada ao mundo "sem deform e sem
morph"; 9.6 permite timeline `deform` com alvo `boundingbox`, `clipping` e `path`.

**Proposta.** Escolher uma: ou 9.6 restringe `deform` a `mesh`/`linkedmesh`, ou
7.6 passa a dizer "com o deform da animação, sem morph".

**O que o runtime faz.** `VertexAttachment.computeWorldVertices` aplica deform e
morph a qualquer attachment de vértices (leitura de 9.6). Morphs só podem apontar
para `mesh` (8.3), então na prática `boundingbox` recebe só deform.

## 5. §4.7 — fallback de nome duplicado

**Problema.** 2.1 diz que `name` repetido na mesma categoria é inválido, mas 4.7
não diz o que o leitor faz (só cobre referência inexistente).

**O que o runtime faz.** Mantém os dois objetos no array (índices preservados),
aponta as referências por nome para o **primeiro** e avisa (L1 em modo estrito).

## 6. §9.1 / §9.2 — chaves fora de ordem

**Problema.** `time` não crescente é L1, sem fallback definido.

**O que o runtime faz.** Em modo tolerante reordena as chaves por `time` (ordem
estável) e, em timelines que exigem crescimento estrito, mantém a última chave de
cada `time` repetido. Em modo estrito lança erro.

## 7. §9.5 — `duration` menor que a última chave

**Problema.** "Chaves depois de `duration` são L1", sem fallback.

**O que o runtime faz.** Mantém `duration` como gravada e avisa. As chaves além
dela ficam no array (só tocam quando o runtime passa de `duration`, por exemplo sem
loop).

## 8. §8.1 — parâmetro com `max <= min`

**Problema.** `max > min` é L1, sem fallback. Com `min 1, max 0` a fórmula de
clamp devolve `1` para `0.5` e `0` para `2`; com `repeat`, o envolvimento divide
por zero ou por número negativo.

**Proposta.** Dizer que um parâmetro com `max <= min` vale sempre `min` (o leitor
força `max = min`).

**O que o runtime faz.** `loadParameters` força `max = min` e avisa;
`ParameterData.constrain` devolve `min` quando `max <= min`, com ou sem `repeat`.

## 9. §6.2 — IK de 2 ossos com osso fora do modo `normal`

**Problema.** "Ambos DEVEM estar no modo `normal` (L1)", sem fallback. As outras
violações de IK (raiz constrangida, alvo na cadeia, `bones[1]` que não é filho)
são referências/estrutura e 4.7 manda ignorar a constraint. A fórmula `ik2`
assume `normal` e produz lixo nos outros modos.

**Proposta.** Tratar como as demais regras L1 de IK: a constraint é ignorada por
inteiro, com aviso. (O Spine aplica a fórmula mesmo assim; o resultado é
imprevisível e não vale a pena reproduzir.)

**O que o runtime faz.** `loadIk` descarta a constraint em modo tolerante e
lança em modo estrito.

## 10. §5.5 — sinal de `shearY` na raiz em `appliedFromWorld`

**Problema.** No ramo `parent == null`, `p.shearY = atan2d(a*b + c*d, a*d − b*c)`.
Conta: raiz com `rotation 0, shearY 30, escala 1` dá `b = cos120 = −0.5`,
`d = sin120 = 0.866`, `a = 1`, `c = 0` → `atan2d(−0.5, 0.866) = −30`. O ramo com pai
usa `−atan2d(ra*rb + rc*rd, det)` e devolve `+30`. Mundo → aplicada → mundo na raiz
com shear não fecha. É o comportamento literal do `Bone.updateAppliedTransform` do
Spine 4.2 (que a spec porta), mas afeta `transform`/`physics` que escrevam a raiz.

**Proposta.** `p.shearY = −atan2d(a*b + c*d, a*d − b*c)` no ramo da raiz, e conferir
contra o spine-runtimes antes de congelar.

**O que o runtime faz.** Mantém a fórmula como está na spec.
`testes/skeleton.test.ts` ("documents the root shearY sign") fixa o comportamento
atual (`−30`) para a mudança ser visível quando a spec decidir.

## 11. §8.5 vs §9.10 — tags antes da primeira chave

**Problema.** 9.10 diz que antes da primeira chave vale a **primeira chave** (regra
geral de `evaluate`). 8.5 diz que `activeTags` antes da primeira chave da timeline
`tag` é **só `animation.tags`**. As duas regras dão resultados diferentes para a
timeline `tag`.

**Proposta.** Registrar em 9.10 que `tag` é exceção (vale 8.5), ou alinhar 8.5 com
9.10.

**O que o runtime faz.** Segue 8.5 (a regra específica): `activeTags` e
`applyAnimation` devolvem só `animation.tags` antes da primeira chave de `tag`.

## 12. §9.10 — `deform` e `sequence` quando o slot mostra outro attachment

**Observação.** `Pose` guarda `pose.deform[slot][skin][attachment]` para todo
attachment keyado, mas um slot desenha um attachment só. A spec não diz o que
acontece com a chave de `deform`/`sequence` de um attachment que o slot não está
mostrando naquele instante (por troca de `slot/attachment` ou de skin).

**O que o runtime faz.** Como o Spine: a chave só tem efeito quando o slot mostra
o attachment nomeado (ou um `linkedmesh` que herda o deform dele). Para isso,
`applyAnimation` aplica `deform` e `sequence` depois das outras timelines.

## 13. §6.2 — normalização do ângulo em `ik1` / `ik2` vs Spine 4.2

**Observação.** A spec usa `normalized(g)` → `(-180, 180]` (redução completa).
O Spine 4.2 (`IkConstraint.apply`) faz uma dobra única:
`if (r > 180) r -= 360; else if (r < -180) r += 360;` e não trata `-180`.
Diferença só aparece com `|r| > 540` (impossível na prática, `r` é soma de
poucos ângulos) ou exatamente em `-180`, onde a spec devolve `+180` e o Spine
mantém `-180`. O resultado no mundo é o mesmo (`cos`/`sin` iguais); só o
valor de `arotation` lido de volta pode diferir em 360.

**O que o runtime faz.** Segue a spec (`normalizeAngle` de `math.ts`) em
`constraints/ik.ts`. Sem impacto visual.

## 14. §8.1 — o valor posto pelo jogo perde para a timeline

**Problema.** A tabela de precedência de 8.1 lista, nesta ordem: `source`,
timeline `parameter`, valor posto pelo jogo, `default`. Ou seja, um parâmetro
keyado na animação **ignora** o que o jogo escreveu pela API. Nos runtimes
parecidos (Sliders do Spine, Live2D) é o contrário: o valor posto pelo jogo é o
mais forte, e a timeline serve de valor de fundo.

**Proposta.** Ou inverter as duas linhas do meio, ou dizer explicitamente que a
API do jogo escreve "por baixo" da animação (e que quem quiser mandar no
parâmetro não deve keyá-lo).

**O que o runtime faz.** Segue a ordem literal da tabela: `setParameter` grava
em `Skeleton.parameters`, `applyAnimation` grava depois e sobrescreve, e
`parameters.ts` recalcula `source` na hora em que o driver roda (mais forte que
os dois).

## 15. §8.2 — `mode: "add"` precisa de um valor de setup que nem todo alvo tem

**Problema.** `aplicarAlvo` com `"add"` faz `novo = cur + (val − setup(alvo)) ×
mix`. Três alvos interpoláveis não têm valor de setup definido na spec:

- `nested.time` e `nested.timeScale` (9.9): não existem na setup pose; o runtime
  os mantém "não definidos" até alguém escrever.
- `deform` (9.6): a setup pose é "sem deform".
- `slot.darkColor` quando o slot não tem `darkColor` na setup pose (`null`).

**Proposta.** Dizer em 8.2 que o setup de um alvo sem valor na setup pose é
`0` (deform e darkColor) e que `nested.time` / `nested.timeScale` só aceitam
`"replace"` (L1), como já acontece com `nested.animation`.

**O que o runtime faz.** `constraints/driver.ts`: setup `0` para `deform` e
para `darkColor` ausente; em `nested.number` sem valor corrente, `"add"` parte
de `0` e `"replace"` parte do próprio valor da chave (senão o `NaN` contamina o
resultado).

## 16. §8.2 — `darkColor` nulo não é interpolável

**Problema.** 8.2 divide os alvos em "interpolável" e "string, bool, null,
drawOrder". Uma chave de `darkColor` pode valer `null` ("tint black desligado"),
e o alvo pode estar `null` no momento. Interpolar entre `null` e `[r,g,b]` não
existe.

**O que o runtime faz.** Mesma regra de 9.5 para a timeline: se a chave vale
`null`, ou se o slot está sem `darkColor`, o alvo é tratado como não
interpolável (`mix >= 0.5` troca, abaixo disso não muda). Com os dois lados
presentes, interpola componente a componente.

## 17. §8.2 — modo contínuo e as timelines que não são valores

**Problema.** O pseudocódigo pula `event`, `sequence` e `tag` ao percorrer as
timelines da animação-controle. A timeline `constraint` com `property: "reset"`
(9.8) também não é um valor: ela dispara ao **cruzar** um tempo, e o driver não
tem tempo anterior para comparar.

**Proposta.** Somar `reset` à lista de tipos pulados em 8.2.

**O que o runtime faz.** Pula `event`, `sequence`, `tag` e `constraint.reset`
nos dois modos (`isValueTimeline` em `constraints/driver.ts`).

## 18. §6.4 — quando calcular a tangente `T[i]` no passo 2 da `path`

**Problema.** O passo 2 grava a tangente só quando
`tangents or (i == n and not scale)`. Mas o passo 3 lê `T[i+1]` no ramo
`else if spaces[i+1] == 0`, para qualquer `rotateMode`. Com `chain` e um
espaço zero no meio da lista, `T[i+1]` nunca foi calculado.

O Spine 4.2 (`addCurvePosition`) usa outra condição:
`tangents || (i > 0 && space == 0)` — a tangente é calculada na amostra `i`
quando o espaço que levou até ela é zero.

**Proposta.** Trocar a condição do passo 2 por `tangents or (i > 0 and
spaces[i] == 0)`, ou simplesmente dizer que `T[i]` é calculado em todas as
amostras.

**O que o runtime faz.** Calcula `T[i]` em **todas** as amostras
(`addCurvePosition` em `constraints/path.ts` sempre grava o ângulo). É um
superconjunto das duas leituras e não muda nenhum resultado usado.

## 19. §6.4 — tabela e pseudocódigo discordam no `spacingMode: "length"`

**Problema.** A tabela diz `bones[i-1].length × escalaMundoX + spacing`
(o `spacing` **não** é escalado). O pseudocódigo diz
`(setupLength + spacing) * worldLen / setupLength`, que é
`setupLength × escala + spacing × escala` (o `spacing` **é** escalado).
Com escala de mundo 1 as duas dão o mesmo; com escala 2 e `spacing 30` a
tabela dá `2·L + 30` e o pseudocódigo `2·L + 60`.

**Proposta.** Alinhar a tabela ao pseudocódigo (decisão 18: o pseudocódigo é
normativo).

**O que o runtime faz.** Segue o pseudocódigo.
Teste: "fixed: the gap follows the world scale of the bone".

## 20. §6.4 — `spacingMode: "proportional"` diverge do Spine 4.2

**Observação.** Na spec o `proportional` normaliza os comprimentos de mundo
para que a soma seja `m × spacing` em **pixels de mundo** (`m = n` em
`tangent`, `n + 1` nos outros — decisão 20). O Spine 4.2, além dessa
normalização, multiplica cada espaço por `pathLength / spacesCount` no passo 2,
o que faz o `spacing` do `proportional` virar uma **fração do caminho**, como
no `percent`.

Também: o passo 1 da spec percorre `i in 0..n-1` (calcula `spaces[1..n]`) em
todos os modos, enquanto o Spine percorre `spacesCount - 1` entradas, ou seja
`n - 1` em `tangent`. Em `tangent` + `proportional` a soma normalizada da spec
tem um termo a mais que a do Spine.

**O que o runtime faz.** Segue a spec nos dois pontos.
Testes: "proportional in chain mode uses m = n + 1" e "... in tangent mode
uses m = n".

## 21. §6.4 / §7.8 — caminho de comprimento zero e `lengths` curto demais

**Problema.** A spec não diz o que acontece quando o comprimento total do
caminho é `0` (todas as âncoras no mesmo ponto). Com caminho fechado,
`q mod total` divide por zero; com aberto, todo `q > 0` cai na extrapolação.
Também não há fallback para `lengths` com menos entradas que o número de
curvas (7.8 diz que é L1, sem dizer o que o leitor faz).

**Proposta.** Dizer que a constraint não faz nada quando `total <= 0`, e que
um `lengths` inválido faz o leitor tratar o attachment como
`constantSpeed: true`.

**O que o runtime faz.** Exatamente isso (`computeWorldPositions` devolve
`null` com `total <= 0`; `constantSpeed` é forçado quando
`lengths.length < curveCount`).

## 22. §11.5 / §11.6 — `TKEY` não distingue `curve` ausente de `curve: "linear"`

**Problema.** O bloco `TKEY` guarda a interpolação em `u8 curveType[]`, com
`0 = linear`. Mas em JSON `"linear"` é o **padrão** (9.2): a chave pode não ter
`curve` nenhuma, ou ter `curve: "linear"` escrito. Os dois viram `0`. Na volta o
leitor tem que escolher um dos dois, e 11.1 exige que a ida e volta devolva a
mesma árvore. Com `>= 64` chaves o `TKEY` é **obrigatório**, então o arquivo
com `"linear"` escrito não tem saída legal.

**Proposta.** Ou dizer que `curve: "linear"` explícita é normalizada para
ausente na gravação (e que isso não conta como diferença em 11.1), ou reservar
`curveType == 3` para "linear escrita".

**O que a ferramenta faz.** `escrever.ts` **não** usa `TKEY` quando alguma
chave traz `curve: "linear"` escrita; essas timelines ficam na árvore, onde a
diferença é preservada. O `TKEY` só entra quando a ida e volta é exata.

## 23. §11.5 — `x/y/width/height` são inteiros no atlas e floats no esqueleto

**Problema.** A lista de nomes `integer` de 11.5 traz "`x/y/width/height/offset*/
original*` de atlas". Mas `x`, `y`, `width` e `height` também existem no
esqueleto (`skeleton`, `bone`, `region`, `mesh`), onde são **floats**. O texto
resolve pelo "de atlas", mas um gravador que só olhe o nome da propriedade
transforma `bone.x = 0.5` em inteiro e destrói o valor.

**Proposta.** Dizer explicitamente que a regra depende do arquivo: os nomes de
10.3 só são inteiros dentro de um `.atlas.json`.

**O que a ferramenta faz.** `writeBoneb` tem a opção `atlas`, ligada só quando
a árvore é um atlas. Fora dela, `x/y/width/height` vão como `f32`. Além disso,
qualquer valor não inteiro sob nome "de inteiro" é gravado como `f32`, para
que nenhum arquivo perca dado por causa de um nome.

## 24. §2.8 regra 3 vs. §12.6 — `..` como segmento ou como sequência

**Problema.** 2.8 proíbe os **segmentos** `..` e `.`. 12.6 manda "rejeitar
entrada de ZIP e uri com `..`", sem falar em segmento. Um nome como
`..oculto.png` é um segmento válido pela primeira leitura e proibido pela
segunda.

**Proposta.** Escolher uma das duas na spec.

**O que a ferramenta faz.** `bonez.ts` segue a leitura mais defensiva: recusa
`..` em qualquer posição do nome. É a única que não dá para contornar com
codificação, e um nome de arquivo com dois pontos seguidos não é perda real.

## 25. §11.3 — o cabeçalho não diz se existe padding no fim do arquivo

**Problema.** 11.2 manda alinhar toda seção em 16 bytes, e 11.3 manda o leitor
recusar se `fileSize` não bater. Não está dito se o **fim** do arquivo também é
preenchido até o próximo múltiplo de 16. Dois gravadores corretos podem gerar
arquivos de tamanhos diferentes para a mesma árvore.

**Proposta.** Dizer que o arquivo acaba no fim da última seção, sem
preenchimento de cauda.

**O que a ferramenta faz.** Grava sem preenchimento de cauda (`fileSize` = fim
da última seção). Na leitura, aceita as duas formas: só checa
`offset + length <= fileSize` e `fileSize == bytes.length`.

## 26. §12.4 — a suíte pede `probe.json`, mas o pose dump não diz o que é comparado

**Problema.** A 12.4 mostra `probe.json` e `expected.json` lado a lado, mas não
diz se um campo **ausente** do `expected.json` é comparado ou ignorado. O
exemplo da 14.2 responde de fato: o osso `arm` traz `arotation` e a matriz, e
nada mais — nem `ax`, nem `ascaleX`. Se ausência fosse igual a zero, o exemplo
da própria spec falharia.

**Proposta.** Escrever a regra: **o `expected.json` declara o que é comparado.**
Campo, osso ou slot que ele não menciona não entra na comparação.

**O que a ferramenta faz.** Segue essa regra. É o que deixa um caso dizer "só
este osso, só a rotação dele" sem escrever o esqueleto inteiro.

## 27. §12.4 — não há como observar o frame de uma sequência no pose dump

**Problema.** A 9.6 define sete modos de `sequence` com fórmulas exatas, e a
12.4 manda cada recurso da spec ter pelo menos um caso. Mas o pose dump da 12.4
só tem `attachment`, `color` e `visible` no bloco `slots`. O frame ativo não
aparece em lugar nenhum, e sem ele os sete modos não são testáveis.

**Proposta.** Acrescentar `sequenceIndex` ao bloco `slots` do pose dump: o
índice **resolvido** do frame (já passado pelo `setup` quando não há chave),
`-1` quando o attachment não tem sequência.

**O que a ferramenta faz.** Grava esse campo. O caso `B-110-sequencia-sete-modos`
depende dele.

## 28. §12.4 — o pose dump não tem `darkColor`

**Problema.** A 9.5 anima `slot.darkColor`, inclusive ligando e desligando o
tint black com `null`. O bloco `slots` da 12.4 não tem onde guardar isso.

**Proposta.** Acrescentar `darkColor` (`[r, g, b]` ou `null`) ao bloco `slots`.

**O que a ferramenta faz.** Grava o campo. Pela regra da dúvida 26, um caso que
não o mencionar continua não o comparando.

## 29. §3.6 — não há tolerância declarada para escala

**Problema.** A lista de tolerâncias da 3.6 cobre posição, vértice, ângulo,
componente de matriz, cor, física e `softness` do IK. `ascaleX` e `ascaleY` do
pose dump não são nenhuma dessas coisas.

**Proposta.** Dizer que escala usa a tolerância de componente de matriz
(`1e-4`), já que é dela que a escala é extraída (5.5).

**O que a ferramenta faz.** Compara `ascaleX` e `ascaleY` com `1e-4`.

## 30. §12.4 — a sonda não diz como os eventos são recortados entre amostras

**Problema.** `fireEvents` (8.6) precisa de `prev` e `now`. A sonda da 12.4 dá
uma lista de `times`, e não diz qual é o `prev` de cada amostra. Dois harnesses
razoáveis (intervalo entre amostras, ou sempre `-∞`) dão listas diferentes.

**Proposta.** Escrever: o intervalo da amostra `i` é `(times[i−1], times[i]]`,
com `prev = -∞` na primeira amostra.

**O que a ferramenta faz.** Exatamente isso. O caso `A-027-evento-em-laco`
depende dessa definição.

## 31. §12.4 — `physicsDt` não diz de onde o relógio parte

**Problema.** A sonda traz `physicsDt: 0.016666`, mas não diz que o relógio
começa em `0`, nem o que fazer quando um tempo pedido cai no meio de um passo.
Sem isso a trajetória da física não é reprodutível, que é justamente o que a
6.5 promete.

**Proposta.** Escrever: com `physicsDt`, o relógio anda de `0` em passos desse
tamanho e **todo tempo pedido tem que ser múltiplo exato do passo**. Sem
`physicsDt`, cada tempo é posado sozinho a partir da setup pose.

**O que a ferramenta faz.** Isso, e recusa o caso com erro claro quando um
tempo pedido não é múltiplo do passo.

## 32. §12.4 — o layout de pastas da suíte está em inglês, o do Recorte em português

**Problema.** A 12.4 escreve `conformance/cases/<caso>/case.bone`,
`probe.json`, `expected.json`, `README.md`. O repositório do Recorte fala
português com quem lê.

**Proposta.** Deixar a spec dizer que os nomes de arquivo do repositório são
convenção local, e que o que é normativo são o **formato do pose dump** e os
**campos da sonda**, não os nomes das pastas.

**O que a ferramenta faz.** Usa `conformidade/casos/<caso>/` com
`entrada.bone`, `esperado.json` e `leiame.md`. A sonda mora na chave `"probe"`
dentro do `esperado.json`; um `probe.json` separado, do jeito da 12.4, também é
lido quando existe. Os prefixos de nível dos casos (`A-`, `B-`, `C-`, `X-`)
seguem a 12.4 sem tradução, porque são identificadores.
