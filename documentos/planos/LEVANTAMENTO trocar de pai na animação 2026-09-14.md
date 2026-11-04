# LEVANTAMENTO — trocar de pai no meio da animação

| Item | Valor |
|:---|:---|
| Data | 14/09/2026 |
| Pedido por | Planejador |
| Feito por | Executor (animador-4b) |
| Tipo | Levantamento. Sem solução, sem plano de execução |

O assunto: o osso troca de pai **dentro** de uma animação (`bone/parent`,
spec 9.4). O formato e o runtime já sabem fazer. O editor não. Este documento
lista o que já existe, o que falta, onde o gesto entra e os riscos — para o
Planejador escrever o plano.

---

## 1. O que o editor já tem e serve

**Formato e runtime — completos e conformes.**

| Peça | Onde | O que faz |
|:---|:---|:---|
| A timeline `parent` | `formato/ESPECIFICACAO 2026-09-06.md` §9.4 | Normativa: stepped só, `null` = pai do arquivo, sem conversão de locais, ciclo ignorado com aviso `PARENT_CYCLE` |
| A ordem de cálculo | §5.6 | Refazer a travessia da árvore quando o pai aplicado muda, normativo |
| `applyParentKey` | `runtime/src/animation.ts:281-290` | Lê a chave, chama `Bone.setParent`, avisa uma vez em ciclo |
| `Bone.setParent` | `runtime/src/skeleton.ts:93` | Recusa ciclo (devolve `false`), muda `children`, marca `orderDirty` |
| `rebuildUpdateOrder` | `runtime/src/skeleton.ts:850-870` | Travessia da árvore atual a partir das raízes — a ordem de 5.6 |
| `updateWorldTransform` | `runtime/src/skeleton.ts:788-806` | Chama `rebuildUpdateOrder` sozinho quando `orderDirty` |
| Conformidade | C-281, C-282, C-286 | 3 casos, os três passam (53 de 53 hoje) |
| Prévia do editor | `editor/src/doc/document.ts` `reposeQuiet` | Reaplica `setToSetupPose` + `applyAnimation` + `updateWorldTransform` a cada mudança de tempo — a ordem já sai certa quadro a quadro, sem código novo |

**No editor, a peça estrutural que faz metade da conta.**

| Peça | Onde | O que faz |
|:---|:---|:---|
| `Reparent` (comando) | `editor/src/doc/reparent.ts:109-248` | Pendura ossos/desenhos em `parent`, reescreve os locais no espaço do pai novo SEM mover o desenho na tela (`L' = P'⁻¹ · W`), reordena `file.bones` |
| `localFromWorld` | `editor/src/doc/world-math.ts:82` | A decomposição que faz essa conta — a mesma matemática que uma chave `parent` precisaria para escrever os locais no espaço do pai novo |
| `liveWorldMatrices` | `editor/src/doc/reparent.ts:76-86` | Já existe um caminho que mede o mundo **na pose da tela** (o quadro de agora), não só na pose de repouso — usado hoje só quando a seleção é só desenhos, em Animando (lote 63a) |
| `canReparent` / `reparentVerdict` | `editor/src/doc/bones.ts` | Recusa ciclo, decide "pode" / "não pode" / "troca de lugar" (`SwapBones`) — hoje só contra a estrutura do ARQUIVO |
| A porta única | `editor/src/doc/reparent.ts:411` `runReparent` | Os quatro gestos (arrastar na Árvore, `P` segurado, campo Osso do painel Propriedades, menu) passam todos por aqui |
| `setKey` / `TimelineTarget` / `boneTarget` | `editor/src/anim/keying.ts` | A infraestrutura genérica de chave já aceita qualquer `(type, target, property)` — não há nada nela que recuse `{type:'bone', property:'parent'}` especificamente |
| `targetInfo` para `bone` | `keying.ts:232-238` | Propriedade de osso fora de `BONE_NUMERIC`/`BONE_BOOLEAN` já cai no `stepped` por padrão — ou seja, se um alvo `parent` chegasse até aqui, a folha já saberia que ele é stepped |

**Resumo:** a metade "trocar de pai sem pular na tela" já está escrita e testada — só que ela sempre escreve na pose de repouso (`file.bones[].parent`), nunca dentro de uma `timeline`.

---

## 2. O que falta — do menor para o maior

1. **`targetForPointer` tem um comentário e uma regra desatualizados.**
   `keying.ts:617-621` diz, ao pé da letra: "*o pointer que nomeia... o
   `parent` de um osso... não pode ser animado*". Isso valia antes da 9.4.
   O código (linha 645) de fato devolve `null` para `parent` — pequeno de
   mudar, mas é uma decisão: o painel Propriedades usa esta função para
   saber se um campo é "estrutural" (edita sempre) ou "animável" (edita
   conforme o modo), e `bones[i].parent` (um índice/nome direto no arquivo)
   não é o mesmo endereço que uma chave `parent` escreve (que é `value` da
   timeline, não um ponteiro).

2. **`BONE_KEY_PROPERTIES` não tem `parent`.**
   `editor/src/anim/pose-mode.ts:385-386` é a lista que o botão **Chavear**
   e o **Voltar à pose de repouso** (`resetToSetup`) usam para saber o que
   gravar de um osso. Sem `parent` na lista, mesmo depois de existir uma
   chave de pai em algum ponto, essas duas ações não a tocam.

3. **Nenhuma verificação de ciclo contra a árvore APLICADA no instante.**
   `canReparent`/`reparentVerdict` (`doc/bones.ts`) testam contra
   `file.bones[].parent` — a estrutura do arquivo. Uma chave `parent` muda
   a árvore só NAQUELE ponto da animação; um osso que é ancestral válido na
   pose de repouso pode já ser descendente no quadro 40, por causa de uma
   chave anterior na mesma animação (ou o contrário). O gesto em Animando
   precisaria checar contra a árvore **aplicada no tempo de agora**
   (`doc.skeleton`), não contra o arquivo. Não existe hoje.

4. **Não há comando que escreva a chave.** Este é o item central.
   Não existe um `ReparentKey` (ou nome parecido) que, com uma animação
   aberta, escreva NUMA TACADA SÓ: a chave `bone/parent` no tempo de agora
   E as chaves dos locais (`x`, `y`, `rotation`, `scaleX`, `scaleY`,
   possivelmente `shearY`) no espaço do pai novo, do jeito que a 9.4 exige
   ("quem grava a chave grava também os locais"). A matemática
   (`localFromWorld`, já citada) existe; o comando que a chama dentro de
   `doc.run(...)`, gravando tudo como UM passo de desfazer, não existe.

5. **A porta única não sabe se ramificar.**
   `runReparent` (`doc/reparent.ts:411-469`) hoje só tem um caminho para
   ossos: estrutural, na pose de repouso, e **sempre** chama
   `switchAnimation(doc, null)` primeiro quando a seleção tem osso e uma
   animação está aberta (linha 419-426, 446-447). Ensinar os quatro gestos
   (arrastar na Árvore, `P`, campo Osso, menu) a produzir uma chave em vez
   de sair de Animando significa mudar esta função — e decidir SOB QUE
   CONDIÇÃO ela grava a chave em vez de sair (sempre? só com "Gravar
   sozinho" ligado, como o resto de Animando? perguntando?). Esta decisão
   não está tomada em código nenhum hoje — não é deste levantamento
   inventar qual.

6. **A Árvore é uma só, e é sempre a do arquivo.**
   `panels/tree-model.ts` lê `file.bones[].parent` direto — a MESMA árvore
   em Montagem e em Animando, em qualquer quadro. Não existe, em NENHUM
   painel do editor hoje, o conceito de "isto está diferente da estrutura
   do arquivo neste instante" — não é um padrão que já exista e baste
   copiar para a Árvore; é terreno novo. Com 9.4, a Árvore pode ter que
   mostrar a hierarquia **aplicada no quadro de agora**, diferente da do
   arquivo, quando uma chave `parent` já passou.

7. **Os desenhos (slots) NÃO entram na 9.4 — e a porta única hoje trata os
   dois como a mesma coisa.**
   A spec 9.5 lista as timelines de `slot`: `attachment`, `color`,
   `darkColor`, `visible`. Não há `bone` (o dono do slot) entre elas — só
   um OSSO pode trocar de pai numa chave; um DESENHO não tem como trocar de
   osso dono no meio de uom animação, hoje nem depois da 9.4. Mas
   `runReparent`/`Reparent` tratam ossos e desenhos escolhidos juntos, pela
   mesma porta (`reparentTargets` devolve `bones` e `slots` separados, mas
   um `Reparent` só resolve os dois de uma vez). O gesto novo (chave) só
   vale para ossos; desenho continua sendo estrutural (ou, em Animando,
   pela pose da tela — lote 63a) para sempre. Separar os dois caminhos
   dentro da porta única é trabalho, e é fácil esquecer o caso "seleção com
   osso E desenho junto, em Animando".

---

## 3. Onde o gesto entra

**Hoje:** com uma animação aberta, qualquer um dos quatro gestos que envolve
osso (arrastar na Árvore, `P` segurado, campo Osso do Propriedades — este só
vale para slot, então não se aplica — , menu) chama `switchAnimation(doc,
null)` ANTES de rodar o `Reparent`, e depois avisa: *"Estrutura muda na
Montagem: voltei para ela."* (`reparentExtra`, `reparent.ts:370`). É a frase
que o Humberto vê hoje, citada no `ESTADO.md`: *"ele te manda 'voltar à
Montagem'"*.

A EXCEÇÃO já existe: quando a seleção é **só desenhos** (nenhum osso), o
editor FICA em Animando e mede o mundo na pose da tela (`liveWorldMatrices`,
lote 63a) — porque trocar o osso-dono de um desenho não é visto como mudança
de estrutura do jeito que trocar o pai de um OSSO é.

**Com a 9.4:** o pedido do Planejador é que isso deixe de ser necessário para
osso também — vire uma chave, sem sair de Animando. Note-se que:

- Isso não é "tirar a saída de Animando" — é trocar o QUE a estrutura muda:
  hoje ela sempre muda `file.bones[].parent` (o arquivo, a pose de
  repouso); com 9.4 ela pode, EM VEZ DISSO, mudar `animations[].timelines`
  (uma chave). A pose de repouso continua existindo e continua sendo o que
  Montagem edita — o gesto em Animando passa a ter um destino diferente do
  gesto em Montagem, e a porta única (item 5 da seção 2) precisa saber qual
  é qual.
- O que acontece quando a seleção mistura osso com desenho, em Animando,
  não está decidido (ver item 7 da seção 2): hoje os dois saem juntos da
  animação; com a chave, o osso poderia ficar e o desenho ainda teria que
  sair (ou usar a pose da tela do lote 63a) — dois caminhos dentro do mesmo
  clique.
- Não achei, em código nem em plano, uma resposta para: a chave é gravada
  SEMPRE que se troca de pai em Animando, ou só quando "Gravar sozinho"
  está ligado (a régua do resto de Animando)? Fica como falta de
  informação — não é para este levantamento decidir.

---

## 4. Riscos

**Ordem de cálculo (5.6) — risco BAIXO, já coberto.**
O runtime já refaz a ordem sozinho (`orderDirty` + `rebuildUpdateOrder`,
`skeleton.ts:850-870`), e a prévia do editor já reaplica a animação inteira a
cada mudança de tempo (`reposeQuiet`, `document.ts:329-332`) — não há
otimização de "pose incremental" no caminho que pudesse pular esse
recálculo. C-281 já cobra exatamente isso e passa. O trabalho novo não mexe
aqui; é bom o Planejador saber que este risco, o mais citado no pedido, já
está coberto pela base.

**A Árvore no quadro 12 — risco ALTO, terreno novo.**
Não existe hoje, em painel nenhum, o conceito de "isto é diferente do
arquivo neste instante". A Árvore lê `file.bones[].parent` sempre. Decisões
em aberto que o plano vai ter que tomar, e que este levantamento não
antecipa: a Árvore muda de cara sozinha ao mudar o tempo? Mostra as duas
(arquivo e aplicada)? Só marca quem está diferente? Qualquer uma delas é
código que não tem precedente no projeto para copiar.

**Perda de `shearX` — risco MÉDIO, já documentado noutro lugar.**
`localFromWorld` (`world-math.ts:32`) sempre devolve `shearX = 0` — é a
decomposição de §5.5, que tem um grau de liberdade a menos que a matriz
geral. O comando `Reparent` de hoje já convive com isso: o comentário de
`writeLocal` (`reparent.ts:339-341`) explica que `shearX` nunca é escrito
por cima porque a decomposição sempre o zeraria. Se o comando novo reusa a
mesma matemática (e é o caminho óbvio, é a mesma conta), um osso com
`shearX` diferente de zero no instante da troca perde esse valor ao ganhar
locais no espaço do pai novo — sem aviso. Vale uma decisão explícita do
Planejador: aceitar a perda (como o `Reparent` de Montagem já aceita), ou
achar outra conta.

**Ciclo checado contra a árvore errada — risco MÉDIO.**
`canReparent`/`reparentVerdict` testam contra o arquivo. Numa animação onde
uma chave anterior já mudou quem é pai de quem, o editor poderia OFERECER
(ou aceitar) uma troca que o runtime recusaria naquele quadro específico
(ciclo aplicado, não ciclo de arquivo) — e a spec diz que a chave nesse caso
é silenciosamente ignorada com aviso uma vez (`PARENT_CYCLE`). Um editor que
deixa gravar uma chave que o runtime vai ignorar é um editor que mente para
quem está animando.

**Escopo osso × desenho — risco de confundir, não de quebrar.**
Coberto na seção 2, item 7 e seção 3. Risco de plano, não de código: fácil
escrever a história pensando só em osso e esbarrar depois na seleção mista.

---

## 5. Como os três programas tratam isso

| Programa | Trata? | Como |
|:---|:---:|:---|
| **Spriter** | **Sim** — é dele | A hierarquia não é uma timeline à parte: cada chave da **mainline** (a faixa fechada, "resumo de tudo") já é um keyframe completo com `bone_ref`/`object_ref` por objeto — quem é filho de quem está DENTRO da chave. Trocar o pai de um osso num ponto do tempo é, na prática, escrever uma mainline key nova com a referência trocada. Na timeline aberta (uma linha por objeto — `documentos/pesquisa/pesquisa antiga/menu/01 Spriter Pro 2026-09-08.md:210-234`) não existe uma linha "pai" separada: a estrutura só aparece fechada, na faixa mestra. |
| **Spine** | Não | A hierarquia de ossos é fixa, decidida na pose de repouso (`documentos/pesquisa/pesquisa antiga/01 Spine 2026-09-06.md:8`). O que anima "parecido" são Transform Constraints e IK — nunca uma troca de `parent` de verdade. É por isso que a 9.4 da spec cita "semântica do Spriter", não do Spine. |
| **DragonBones** | Não | O modelo de dados tem `parent` estático por osso (`02 DragonBones e Spriter 2026-09-06.md:12`); as timelines de animação documentadas (translate, rotate, scale, `ffd`, `ik`, `zOrder`, display, cor) não incluem troca de pai. |

**Diferença para o `.bone`:** o formato do Recorte não tem "mainline"
(keyframe-mestre com tudo dentro) — cada propriedade já é a sua própria
timeline, como no Spine. Então uma chave `parent` no `.bone` é só MAIS UMA
linha na ficha do osso, ao lado de `x`, `y`, `rotação` — não precisa do
conceito de "keyframe fechado" que o Spriter usa para mostrar a troca. Isso
é mais simples de encaixar na folha de tempo que já existe
(`dopesheetGroups`, seção 1) do que copiar o desenho do Spriter — mas também
quer dizer que não há, nos três programas olhados, uma referência pronta de
"como desenhar uma linha de pai" numa folha de tempo por-propriedade: o
Spriter nunca precisou, porque a dele é por keyframe-mestre.

---

## 6. O que faltou saber

- Não verifiquei o renderizador de células da folha de tempo
  (`panels/dopesheet.ts` / `dopesheet-edit.ts`) para confirmar como uma
  linha `stepped` de valor NÃO-booleano (um nome de osso, não um `true`/
  `false` como `inheritRotation`) apareceria hoje. Pelo `targetInfo`, o tipo
  já cai em `stepped`, mas não confirmei se o desenho da célula aguenta um
  texto (nome do pai) em vez de um ícone de liga/desliga.
- Não achei, em nenhum documento, uma resposta para a condição de gravar a
  chave (sempre, ou só com "Gravar sozinho" ligado, ou perguntando) — está
  em aberto na seção 3.
- Não achei uma decisão registrada sobre o que fazer com a seleção mista
  (osso + desenho) em Animando, com a 9.4 — seção 2, item 7.
- Não fui atrás de como o Spriter 2 (beta) trata isso, só o Spriter Pro —
  os prints salvos em `documentos/pesquisa/nova pesquisa/spine/` são todos
  do Spine, não achei uma pasta equivalente do Spriter com prints novos.

---

Avisei o Planejador que terminei.
