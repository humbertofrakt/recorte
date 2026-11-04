# Onde a especificação não bastou

**Quem escreveu:** o autor do segundo runtime, em Python (`runtime-python/`).
**Como:** lendo `formato/ESPECIFICACAO 2026-09-06.md` e `formato/bone.schema.json`,
sem abrir `runtime/src/`.
**Quando:** 08/09/2026, fase 7.

Esta lista é o resultado do experimento. Cada linha é um ponto em que o texto
da spec, sozinho, **não** foi suficiente para escrever código que passa na
suíte. Onde eu tive que adivinhar, está escrito o que eu adivinhei.

Nenhum item aqui é reclamação de estilo. São buracos que um implementador de
fora cai, e que custam horas — ou fazem ele desistir.

---

## Placar honesto

| Item | O que aconteceu |
|:---|:---|
| Casos que passaram lendo só a spec | **36 de 39**, na primeira rodada |
| Casos que só passaram depois de olhar o `leiame.md` do caso | **2** (C-230, C-260) |
| Casos que falharam por bug meu, e não por spec | **1** (A-023, erro de digitação) |
| Total depois das correções | **39 de 39**, nível C |

Os dois casos do meio são os dois itens mais graves da lista abaixo.

---

## Os graves — a spec está errada ou incompleta, e a suíte prova

### 1. §5.6, passo 3: recalcular tudo no fim **quebra** o caso C-230

Este foi o pior. Custou mais tempo que todo o resto junto.

A §5.6 manda, ao pé da letra:

```
// 3. mundo final
for bone in skeleton.bones: updateWorld(bone)
```

Fiz isso. O caso **C-230** falhou.

**Por quê.** Uma regra de transformação escreve a matriz de mundo do osso e
depois chama `appliedFromWorld` (§5.5). Sob cisalhamento, a §5.5 **perde**
informação: ela devolve `ascaleY = det / ascaleX`, que é menor que o
comprimento real da coluna pelo fator `cos(shearY)`. Refazer `updateWorld` a
partir dessa pose aplicada **não devolve a matriz que a regra deixou**.

| | `b` | `d` |
|:---|---:|---:|
| Matriz que a regra deixou (e que o `esperado.json` cobra) | −0,5 | 0,866025 |
| Matriz depois do passo 3 da §5.6, ao pé da letra | −0,433013 | 0,75 |

Erro de 0,116 num campo com tolerância de 0,0001.

**A solução está na spec, mas rotulada como opcional.** O parágrafo seguinte,
"**Regra de otimização (cache de sujeira)**", diz que o runtime **PODE** evitar
o recálculo total. Não é opcional: é **a única leitura que passa na suíte**. Um
osso cuja matriz de mundo uma regra escreveu **NÃO DEVE** ser recalculado a
partir da pose aplicada; só os descendentes dele.

**O que fazer:** trocar o passo 3 por "recalcule os ossos que estão sujos", e
mover o parágrafo do cache de sujeira de "otimização" para normativo. Enquanto
a §5.5 for aproximada sob cisalhamento, as duas leituras **não** dão o mesmo
resultado, e a §5.6 hoje afirma que dão.

Ligado à decisão em aberto 6b do `ESTADO.md`, mas **independente dela**: mesmo
que a §5.5 seja corrigida, a §5.6 continua ambígua.

### 2. §6.5: a spec não diz que o estado da física sobrevive a `Pose()`

A §9.10 (`Pose`) começa com `pose = setup(skeleton)`. A §5.1 diz que a setup
pose inclui "**constraint: todos os seus valores** (`mix`, `position`,
`bendPositive` …)".

Li isso e, a cada quadro, devolvi a constraint inteira ao setup — inclusive
`xOffset`, `xVelocity`, `remaining`, `lastTime`. O caso **C-260** falhou com a
haste colada no osso pai: a física nunca acumulava nada.

A §6.5 diz que o estado por instância "não vai no arquivo", mas **não** diz que
ele não é tocado pela setup pose. São duas coisas diferentes, e a spec só
escreve uma.

**O que fazer:** escrever na §5.1 e na §6.5, com todas as letras: a setup pose
devolve os **valores animáveis** da constraint; o **estado da simulação** só é
zerado por `physicsReset` (§6.5) ou pela timeline `reset` (§9.8).

---

## Os que a suíte cobra e a §12.4 não escreve

O `esperado.json` de três casos cobra coisas que não estão em lugar nenhum do
texto normativo. Eu só descobri lendo o `leiame.md` dos casos — o que **é**
olhar a resposta.

### 3. §12.4: o canal `sequenceIndex` do dump de slot não existe na spec

O exemplo de pose dump da §12.4 mostra, dentro de `slots`, só três campos:
`attachment`, `color` e `visible`.

O caso **B-110** compara `slots.<slot>.sequenceIndex`. Esse campo não aparece
em nenhuma linha da §12.4. Adivinhei o nome pelo `esperado.json`.

**O que fazer:** acrescentar `sequenceIndex` à lista de campos de `slots` na
§12.4, dizendo que ele só aparece quando o anexo ativo tem `sequence`.

### 4. §12.4: o que `slots.<slot>.attachment` traz quando o placeholder não resolve

O caso **X-302** exige `null` para um slot cujo placeholder aponta para um anexo
de tipo desconhecido. Faz sentido — a §2.5 diz "trata o placeholder como
vazio" — mas o dump podia igualmente ter reportado o **nome do placeholder**,
que continua sendo o valor da pose. A §12.4 não escolhe.

**O que fazer:** uma frase na §12.4: `attachment` é o nome do placeholder
quando ele resolve para um anexo, e `null` quando não resolve.

### 5. §12.4: `physicsDt` não diz o que fazer com o relógio

A §12.4 mostra `"physicsDt": 0.016666` no exemplo de `probe.json` e não diz
mais nada sobre ele.

A regra de verdade está escrita **só no `leiame.md` do C-260**: "o relógio anda
de 0.01 em 0.01 segundo **desde `t = 0`**, e as amostras pedidas são todas
múltiplos exatos do passo. Um runtime que amostrar direto em `t = 0.5` sem os
50 passos intermediários não bate."

Isso é comportamento normativo do harness. Sem ele, um implementador amostra
direto no tempo pedido e erra por 8 pixels.

**O que fazer:** mover essa frase do `leiame.md` para a §12.4.

### 6. §12.4: a janela de tempo do canal `events` também só está num `leiame.md`

O caso **A-027** cobra que os eventos de uma amostra são os do intervalo
`(tempo da amostra anterior, tempo desta]`, com `−∞` na primeira. A §8.6 define
`fireEvents(anim, prev, now, loop)`, mas **não** diz que `prev` é o tempo da
amostra anterior do dump. Está escrito só no `leiame.md` do caso.

### 7. §12.4: `loop` na sonda enrola a **pose** ou só os eventos?

A sonda do A-027 traz `"loop": true` e mede só `events`. Nenhum caso mede a
**pose** com `loop: true`, e a §12.4 não diz se o tempo da pose vira
`t mod duration`.

**O que eu adivinhei:** sim, a pose também usa `t mod duration`. Não foi testado
por caso nenhum, então pode estar errado e ninguém percebe.

---

## As ambiguidades que eu tive que resolver sozinho

### 8. §9.6 e §7.4: qual `skin` casa com qual `deform`

A §9.10 guarda o deform em `pose.deform[alvo][skin][attachment]` — três chaves.
A §7.4 (`worldVertices`) recebe um `deform` já escolhido, sem dizer **como** foi
escolhido.

O problema aparece quando a skin ativa é `armadura`, o anexo veio de lá, e a
timeline de `deform` diz `skin: "default"` (o padrão, porque o gravador não
escreveu nada). As três chaves não batem.

Pior: a §4.4 devolve **o anexo**, não a skin de onde ele veio. "De qual skin
este anexo veio" não é um conceito que a spec tenha, e a §8.3 (morph targets)
também endereça por `(skin, slot, placeholder)`.

**O que eu adivinhei:** procuro `(slot, skin da timeline, placeholder)`, depois
`(slot, "default", placeholder)`, depois qualquer skin com o mesmo slot e
placeholder. Nenhum caso da suíte exercita isso: todos os casos com deform têm
uma skin só.

### 9. §6.4: `extrapolaAntes` e `extrapolaDepois` são chamadas e nunca definidas

O pseudocódigo da §6.4 chama duas funções que não existem em lugar nenhum:

```
else if q < 0:  P[i], T[i] = extrapolaAntes(W, q);  continue
else if q > total: P[i], T[i] = extrapolaDepois(W, q - total);  continue
```

A prosa acima diz "extrapola em linha reta a partir da âncora 0 na direção da
sua alça de saída". Isso resolve a direção, mas não diz:

- o que fazer quando a alça está **em cima** da âncora (direção de comprimento
  zero);
- se a distância `q` é medida ao longo dessa reta (é o que eu fiz) ou de outro
  jeito;
- na ponta de trás, se a direção vem da alça de **chegada** para a âncora (é o
  que eu fiz) ou o contrário — o sinal muda o resultado 180°.

### 10. §6.4: de onde sai o `total` do caminho

`positionMode: "percent"` multiplica `position` pelo comprimento total. Mas o
caminho tem **dois** comprimentos possíveis: o do array `lengths` (setup pose,
obrigatório no arquivo) e o calculado nos vértices de mundo do quadro.

A §6.4 diz qual dos dois serve para **localizar `t`**, e não diz qual serve
para o `total`. Com um osso escalando o caminho, os dois divergem.

**O que eu adivinhei:** `constantSpeed: true` usa o calculado; `false` usa o
`lengths` gravado.

### 11. §6.5: a indentação do pseudocódigo é normativa, e isso é frágil

No `physicsApply`, a linha `remaining = a` fica quatro espaços à esquerda,
**fora** do bloco `if useRot or useScale`. É só isso que diz que o `a` sobrando
do laço de X e Y volta para `remaining` quando a constraint não usa rotação nem
escala.

Errei na primeira leitura. Uma frase em prosa ("o tempo não consumido volta
para `remaining` em todos os caminhos") custa uma linha e não depende de
espaços em branco sobreviverem a uma cópia.

### 12. §7.3: `width: 0` sem atlas nenhum

A tabela diz: `width` `0` = "usar o atlas (`originalWidth / atlas.scale`)". Se
não há atlas, e não há imagem solta, o tamanho não está definido em lugar
nenhum.

**O que eu adivinhei:** anexo invisível, sem geometria. A §2.8 já manda isso
para arquivo faltando, mas não para `width: 0`.

### 13. §12.4: `uvs` de uma região sem atlas

A §12.4 diz que um caso que carrega atlas **DEVE** medir `uvs`. Não diz o que
um dump devolve para uma região **sem** atlas — os quatro cantos literais
`(0,1) (1,1) (1,0) (0,0)`, ou nada. Escolhi os quatro cantos literais.

### 14. §2.9: a base de resolução dentro do `.bonez`

A regra é "pasta do arquivo principal dentro do ZIP". O caso ZIP-501 tem o
`main` na raiz do pacote, então **pasta do main** e **raiz do ZIP** dão o mesmo
resultado, e o caso não distingue as duas leituras.

Com `main: "personagens/heroi.bone"` e um atlas em `atlas/heroi.atlas.json`, as
duas leituras discordam. Falta caso.

### 15. §9.5: colisão no `drawOrder` exige ler duas vezes

"Se duas entradas caem no mesmo índice, a **última** no array vence e a
anterior é tratada como não citada (entra no passo 2)." Mas o passo 2 pula quem
"já foi citado". Um slot que perdeu a colisão precisa ser **descitado**, o que a
frase implica mas não escreve. Um exemplo numérico de três linhas resolveria.

---

## O que já estava registrado, e eu confirmo de fora

### 16. §5.5: na raiz, mundo → aplicada → mundo não fecha

Já está escrito na própria spec, com o comentário grande, e é a decisão 6b do
`ESTADO.md`. Registro aqui só para dizer que um implementador de fora **bate
nisso no primeiro dia**: uma raiz com `shearY: 30` volta com `shearY: −30`, e o
primeiro instinto é achar que o próprio código está errado.

O comentário na spec é o que me impediu de "consertar" e divergir. Ele vale o
espaço que ocupa. Mantenha.

---

## O que a spec acertou, e vale dizer

Para a lista acima ser lida na medida certa: **36 de 39 casos passaram na
primeira rodada, lendo só o texto.** Isso é muito bom. Em particular:

- Os pseudocódigos das §5.4, §6.2 e §6.3 são **literalmente portáveis**. Digitei
  linha por linha em Python e funcionaram de primeira, inclusive o ramo de
  elipse do IK de dois ossos.
- A §10.4 (UV) e a §7.3 (quatro cantos) são exatas, com a verificação escrita
  junto. Os casos B-102 e B-103 passaram de primeira.
- A tabela de fallbacks da §2.5 é completa o bastante para os cinco casos X
  passarem sem nenhuma adivinhação.
- A §11 (binário) é auto-descritiva de verdade: escrevi um gravador de teste a
  partir das tabelas 11.3 a 11.6, sem ver gravador nenhum, e o leitor casou.
