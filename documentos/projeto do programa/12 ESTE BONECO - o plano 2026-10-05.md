# 12 — "Este boneco": o plano

Escrito pelo executor da rodada 11 (`PLANEJANDO · rodada 11 — Este boneco`, ref `35f718`) em **05/10/2026**, data do relógio.
Parte 1 da ficha `rodadas/RODADA 11 - Este boneco 2026-10-05.md`. **Nenhum código foi escrito. Nada foi rodado.** Só leitura.

## O resumo, em cinco linhas

| # | |
|:---:|:---|
| 1 | **Um campo novo, um só:** `around`, no anexo `skeleton` de **quem recebe**. O valor é o nome do slot **do filho** que marca o meio |
| 2 | A marca é **do encaixe**, não da entidade. O poder em outro boneco, sem a marca, entra em bloco como hoje |
| 3 | Os runtimes não mudam conta nenhuma: muda **só a ordem da lista de desenho**. Três grupos: atrás · o boneco · na frente |
| 4 | Hoje **nenhum caso mede** a ordem de desenho de dentro da peça. Entra um canal novo na sonda, `drawList`, e **11 casos**, todos com a lista calculada à mão aqui. Mais um, à parte, da física |
| 5 | Nenhum dos três programas faz isto. **É nosso.** A régua é a decisão do Humberto |

---

## 1. O que o formato já tem

| Assunto | Onde | O que diz |
|:---|:---:|:---|
| Ordem de desenho base | 4.3, 4.4 | a ordem do array `slots`; por cima, o `drawOrder` de cada skin da pilha. Índice 0 desenha primeiro |
| Ordem por chave | 9.5 | timeline `drawOrder`, deslocamentos sobre a ordem base. Stepped. `[]` volta à base |
| A peça encaixada | 7.11 | anexo `skeleton` num slot. Ocupa **o mesmo placeholder** que uma imagem. Entra por skin ou pela chave `slot/attachment` |
| Onde ela é desenhada | 7.11, regra 3 | *"O filho é desenhado **inteiro** na posição do slot. Sua ordem interna não se mistura com a do pai."* |
| O quadro | 7.13 | `"skeleton": desenhar a instância aninhada, recursivo, como um bloco` |
| A ordem de dentro | 7.11 | é a do próprio filho (o array `slots` dele, as skins dele, a timeline `drawOrder` da animação dele) |
| Máscara | 7.7 | *"Esqueleto aninhado é recortado como um bloco; a máscara não entra nele."* |
| Campo desconhecido | 2.5 | o leitor ignora, preserva ao regravar, e **deveria** avisar uma vez |
| Versão | 2.4 | propriedade opcional nova é `minor`. Arquivo com `minVersion` maior que o leitor: abre em "melhor esforço" e **avisa com destaque** |

**O que os dois runtimes fazem hoje:**

| Runtime | Onde | O que faz |
|:---|:---|:---|
| TypeScript | `runtime/src/render-list.ts`, `collectDrawables` | uma volta pela ordem do esqueleto. O anexo `skeleton` vira **uma** entrada, no lugar do slot. Quem desenha (`render/canvas.ts`, `drawNested`) entra nela e chama a mesma volta para o filho. **Um bloco só** |
| Python | `runtime-python/recorte/skeleton.py`, `ordered_slots` | só a ordem dos slots do corpo. **Não tem lista de desenho que entra no filho.** `visible_attachments` nem cita o `skeleton` |
| A sonda (12.4) | canal `drawOrder` | só os nomes dos slots **do corpo de fora**. O filho não aparece |

**Achado (regra 28):** a frase *"o filho é desenhado inteiro na posição do slot"* está na spec desde 17/09 e **nenhum dos 90 casos a mede**. O C-270 ("aninhado básico") mede ossos, vértices, pontos e eventos. Não mede ordem. O primeiro caso novo fecha esse buraco antes de mexer em qualquer coisa.

---

## 2. Como os outros fazem

Li as três listas de funções em `documentos/pesquisa/nova pesquisa/`.

| Programa | O que a pesquisa da casa diz | Peça em dois lugares? |
|:---|:---|:---:|
| Spriter | *Z-order palette*: cada sprite tem **uma** posição. Ctrl+setas sobe e desce | não aparece |
| Spine | *Draw order*: cada slot, **uma** posição. *Skeleton draw order*: ordem **entre** esqueletos inteiros | não aparece |
| DragonBones | *"a ordem é só a do painel de hierarquia"*: cada slot, **uma** posição | não aparece |

As três listas são de funções do editor, não do formato de arquivo. Nenhuma cita peça partida em dois lugares da ordem. **De memória, não conferido hoje:** nos três a peça aninhada (sub-entidade, armature filha) ocupa uma posição só.

**Então é nosso.** A régua são as três linhas do Humberto.

---

## 3. As opções de formato

| | **A — `around` no anexo de quem recebe** | **B — marca dentro da entidade** | **C — dois slots, a mesma entidade duas vezes** |
|:---|:---|:---|:---|
| O que se grava | um campo no anexo `skeleton`, no arquivo do **personagem**: `"around": "meio"` | um campo no slot `meio`, no arquivo do **poder** | dois anexos `skeleton` no personagem (um no fundo, um na frente), cada um com a lista dos slots que mostra |
| De quem é a marca | do **encaixe** | da **entidade**: vale em todo boneco que a usa | do encaixe |
| Campos novos | **1** | 1 | 1 (a lista) e mais uma regra para os dois relógios andarem juntos |
| Quem lê | o desenhador, ao montar a lista | o desenhador | o desenhador, e o relógio |
| Leitor velho, arquivo novo | ignora o campo: desenha **em bloco**, no lugar do slot, com a imagem do meio à vista. Avisa pela versão (2.4) | igual | desenha as duas cópias **inteiras**: o poder aparece duas vezes. Pior |
| Arquivo velho, leitor novo | sem o campo, a volta é a de hoje. **Byte a byte igual** | igual | igual |
| Liga e desliga no meio da animação | **sim, sem nada novo:** dois placeholders (com e sem a marca) e a chave `slot/attachment` que já existe | não: precisa de timeline nova | sim, mas com duas chaves casadas |
| O poder em outro boneco, sem a marca | **entra em bloco** | não dá: a marca vai junto | entra em bloco |
| Custo nos dois runtimes | a volta da lista ganha três grupos. Nenhuma conta de osso muda | igual | maior: duas instâncias, um relógio, filtro de slots |
| Construct e Godot | **só ordem de lista** (confere com a pesquisa `08`). Ver a pergunta 8 | igual | duas instâncias: memória em dobro |

---

## 4. A recomendação: a opção A

```json
"aura": { "poder": { "type": "skeleton", "uri": "poder.bone", "around": "meio" } }
```

| Campo | Tipo | Obrigatório | Padrão | O que é |
|:---|:---|:---:|:---|:---|
| `around` | nome de slot **do filho** | não | ausente | O filho é desenhado **em volta** de quem o recebe. Ausente = em bloco, como sempre |

**Por quê:**

| # | Razão |
|:---:|:---|
| 1 | É a menor: **um campo opcional**, num objeto que já existe. Nenhum tipo novo, nenhuma timeline nova |
| 2 | O Humberto fez o gesto **estando na animação do personagem**. O arquivo aberto é o do personagem. A entidade só muda por "abrir, mexer, salvar" (`02`, seção 2). Então a marca mora no personagem |
| 3 | Não fecha a porta das armas e das rodas: cada slot tem o seu anexo, cada anexo a sua marca. Trocar um, ou todos, é trocar anexos |
| 4 | Ligar e desligar por chave sai de graça, pela chave `slot/attachment` |
| 5 | O valor é um **slot**, não uma imagem. O slot tem lugar na ordem mesmo vazio ou escondido: a marca não cai quando a imagem some |

**A regra, como vai para a spec (7.11 e 7.13):**

```
lista(S) = atras(S) ++ meio(S) ++ frente(S)

para cada slot L de S, na ordem de desenho atual de S, com o clipping de 7.7:
  anexo comum                  -> entra em meio(S)
  skeleton SEM around          -> lista(filho) inteira entra em meio(S), no lugar de L
  skeleton COM around = m      -> F = lista(filho), sem a peça do slot m
                                  o que em F vem ANTES de m  -> entra no INÍCIO de atras(S)   (a cebola)
                                  o que em F vem DEPOIS de m -> entra no fim de frente(S)
```

| Regra | |
|:---|:---|
| "Antes" e "depois" de `m` | pela posição do slot `m` na ordem de desenho **atual do filho**. O `atras` e o `frente` do próprio filho ficam antes e depois de tudo |
| O slot `m` | **nunca é desenhado** enquanto a marca vale, tenha o anexo que tiver |
| O lugar do slot `L` na ordem de quem recebe | não vale para o desenho enquanto a marca vale. Continua guardado: tirou a marca, a peça volta para lá |
| Duas peças com a marca | **a cebola** (decisão do Diretor, 05/10, 10h40; vai ao Humberto como pergunta). A de slot mais alto abraça a de slot mais baixo: mais na frente na metade da frente, **mais atrás** na metade de trás. *A proposta deste plano era "a ordem dos slots decide nas duas metades"; foi trocada* |
| `m` não existe no filho | sem marca: em bloco. **Avisa uma vez.** Validador: L2 quando o filho está ao alcance |
| Versão | `x-since: 1.1`. O gravador sobe `minVersion` para 1.1 **só** quando o campo existe. O leitor 1.0 então avisa com destaque (2.4): é a resposta à regra 21 |
| Tudo o mais do filho | matriz, relógio, cor herdada, eventos, física: **nada muda** |

---

## 5. Os casos difíceis

| # | O caso | A resposta |
|:---:|:---|:---|
| 1 | A peça com a marca **dentro de outra** peça | "Este boneco" é **quem a recebe**, um nível só. O poder fica em volta do herói; o herói, com o poder, entra em bloco no mundo. Caso C-315 |
| 2 | E se o herói, que tem o poder em volta, é posto **em volta** de outro? | Corta-se a lista **inteira** do herói no slot do meio dele. O "atrás" do poder vai junto para trás; o "na frente", para a frente. Caso C-316 |
| 3 | **Duas** peças com a marca no mesmo boneco | A cebola: a de slot mais alto fica por fora, dos dois lados. Caso C-314. *(Decisão do Diretor; ver a pergunta 9)* |
| 4 | A imagem do meio **some** (skin, escondida, chave de visibilidade, anexo `null`) | Nada muda: a marca é o **slot**. Caso C-317 |
| 5 | O slot do meio é **apagado** ou renomeado na entidade | O nome não bate: em bloco, com aviso. Caso X-307. O editor avisa ao abrir |
| 6 | A ordem da peça **animada por chave** | Vale a ordem **do instante**. Uma bolinha passa de trás para a frente pela chave `drawOrder` do próprio poder. É o exemplo do Humberto: *"bolinhas pela frente e por trás"*. Caso C-312 |
| 7 | A **marca** muda de lugar no meio da animação | Sim, do mesmo jeito: é um slot da ordem do filho. Caso C-312, terceira amostra |
| 8 | A ordem de **quem recebe** animada por chave | Não mexe na peça marcada: ela está fora do boneco inteiro. Caso C-313 |
| 9 | Máscara **do filho** que começa atrás e acaba na frente | A máscara é calculada na volta do filho, **antes** de partir. Cada peça leva a sua máscara para onde for. Caso C-318 |
| 10 | Máscara **de quem recebe** | **Não corta** a peça marcada: ela não está mais naquele trecho da ordem. A máscara do avô, que corta o boneco em bloco, corta tudo. Caso C-319 |
| 11 | Modo de mistura | Vai com cada peça, como hoje. A ordem nova é que dá o fundo certo. Sem caso: nenhum caso da casa mede mistura (12.4 já diz) |
| 12 | A peça **solta para o jogo** | Nada muda: a marca é só de desenho. O jogo, ao encaixar, diz a marca: ver a pergunta 8 |
| 13 | "Tirar a entidade" | O campo mora no anexo. Sai o anexo, sai a marca. A imagem de antes volta |
| 14 | A mesma entidade em outro boneco, **sem** a marca | Em bloco. A marca é do encaixe |
| 15 | A mesma entidade **duas vezes** no mesmo boneco (as rodas) | Duas marcas, uma por slot. Trocar uma, ou "todas as iguais", troca anexos. Se a entidade nova tem um slot com o mesmo nome, a marca fica; senão, aviso |
| 16 | A marca ligada só **num trecho** da animação | Dois placeholders e a chave `slot/attachment`. Caso C-313, terceira amostra |

---

## 6. Os casos de conformidade novos

### O canal novo da sonda: `drawList`

Vai na 12.4. **Não é campo do formato:** é o que a sonda pede ao runtime.

```json
"drawList": [ { "piece": "aura/anel/anel", "clips": [] }, { "piece": "perna/perna", "clips": [] } ]
```

| Campo | O que é |
|:---|:---|
| `piece` | `slot/anexo`, com o slot de quem recebe na frente a cada nível (o mesmo prefixo dos outros canais) |
| `clips` | as máscaras que cortam a peça, de fora para dentro, pelo mesmo nome. **Sempre presente**; vazia = nenhuma |
| O que entra | `region`, `mesh`, `linkedmesh` e o emissor de partícula, visíveis, na ordem em que são desenhados. Máscara e ponto não entram |

### Os arquivos

| Arquivo | Slots, na ordem do array | Anexos |
|:---|:---|:---|
| `poder.bone` | `bola_a` · `anel` · `meio` · `brilho` · `bola_b` | uma `region` em cada, com o nome do slot |
| herói | `perna` · `tronco` · `aura` · `cabeca` | `region` em três; `aura` tem o `skeleton` `poder.bone` |
| `escudo.bone` | `fundo` · `centro` · `frente` | `region` |

A `aura` fica **no meio** da ordem do herói de propósito: assim "em bloco" e "em volta" dão listas diferentes, e se vê que o lugar do slot deixou de valer.

Abreviação nas tabelas: `aura/anel` quer dizer `aura/anel/anel`; `perna` quer dizer `perna/perna`. No `esperado.json` vai o nome inteiro.

### Os onze casos, com a conta

| Caso | O que olha | A lista esperada, na ordem |
|:---|:---|:---|
| **C-310** em bloco (sem a marca) | a frase da 7.11 que ninguém media | `perna` · `tronco` · `aura/bola_a` · `aura/anel` · `aura/meio` · `aura/brilho` · `aura/bola_b` · `cabeca` **(8)** |
| **C-311** este boneco, básico. `around: "meio"` | as três linhas do Humberto | `aura/bola_a` · `aura/anel` · `perna` · `tronco` · `cabeca` · `aura/brilho` · `aura/bola_b` **(7; `aura/meio` não está)**. Canal `drawOrder`: `perna, tronco, aura, cabeca`, sem mudar |
| **C-312** a ordem do filho por chave | a marca corta pela ordem **do instante** | três amostras, abaixo |
| **C-313** a ordem de quem recebe por chave, e a marca desligada por chave | o boneco muda por dentro; a peça fica fora | três amostras, abaixo |
| **C-314** duas peças marcadas. Herói: `escudo` · `perna` · `aura` · `cabeca` | a cebola: a de slot mais alto abraça a outra | `aura/bola_a` · `aura/anel` · `escudo/fundo` · `perna` · `cabeca` · `escudo/frente` · `aura/brilho` · `aura/bola_b` **(8)**. Conta: o `escudo` (slot 0) põe `fundo` atrás e `frente` na frente; a `aura` (slot 2) põe as duas dela **antes** de `escudo/fundo` e as outras duas **depois** de `escudo/frente`. *A outra leitura daria `escudo/fundo` · `aura/bola_a` · `aura/anel` nas três primeiras.* O C-316 não muda: há uma marca só por nível |
| **C-315** níveis, em bloco. Mundo: `chao` · `heroi` · `ceu`; `heroi` é o herói do C-311, sem marca no mundo | a volta é de um nível só | `chao` · `heroi/aura/bola_a` · `heroi/aura/anel` · `heroi/perna` · `heroi/tronco` · `heroi/cabeca` · `heroi/aura/brilho` · `heroi/aura/bola_b` · `ceu` **(9)** |
| **C-316** níveis, marcado. O mesmo mundo, `heroi` com `around: "tronco"` | corta-se a lista **inteira** do filho | `heroi/aura/bola_a` · `heroi/aura/anel` · `heroi/perna` · `chao` · `ceu` · `heroi/cabeca` · `heroi/aura/brilho` · `heroi/aura/bola_b` **(8; `heroi/tronco` não está)** |
| **C-317** a imagem do meio some. O poder toca `some`: chave `slot/attachment` de `meio` = `null` em 0,5 | a marca é o slot | em 0,25 e em 0,75: **a mesma lista do C-311** |
| **C-318** máscara do filho. Poder: `mascara` (clipping, `end: "brilho"`) · `anel` · `meio` · `brilho` · `bola_b` | a máscara viaja com a peça | `aura/anel` **cortada** · `perna` · `tronco` · `cabeca` · `aura/brilho` **cortada** · `aura/bola_b` livre. "Cortada" = `clips: ["aura/mascara/mascara"]` |
| **C-319** máscara de quem recebe. Herói: `recorte` (clipping, `end: "cabeca"`) · `perna` · `aura` (marcada) · `cabeca` | a máscara do boneco não corta o que está fora dele | `aura/bola_a` livre · `aura/anel` livre · `perna` **cortada** · `cabeca` **cortada** · `aura/brilho` livre · `aura/bola_b` livre. "Cortada" = `clips: ["recorte/recorte"]` |
| **X-307** `around: "nao_existe"` | nome que não bate: em bloco, sem inventar | **a mesma lista do C-310 (8, com `aura/meio`)** |

**C-312, a conta.** O poder toca `orbita` (1 s, em laço), pelo campo `animation` do anexo. Ordem base do poder: `bola_a`(0) · `anel`(1) · `meio`(2) · `brilho`(3) · `bola_b`(4).

| Chave `drawOrder` do poder | A conta (9.5) | Ordem do poder |
|:---|:---|:---|
| `t = 0`: `[]` | a base | `bola_a` · `anel` · `meio` · `brilho` · `bola_b` |
| `t = 0,5`: `bola_a`, `+3` | `bola_a` vai para 0 + 3 = 3. Os outros enchem 0, 1, 2 e 4 | `anel` · `meio` · `brilho` · `bola_a` · `bola_b` |
| `t = 0,8`: `meio`, `−2` | `meio` vai para 2 − 2 = 0. Os outros enchem 1 a 4 | `meio` · `bola_a` · `anel` · `brilho` · `bola_b` |

| Amostra | A lista esperada |
|:---:|:---|
| 0,25 | `aura/bola_a` · `aura/anel` · `perna` · `tronco` · `cabeca` · `aura/brilho` · `aura/bola_b` |
| 0,6 | `aura/anel` · `perna` · `tronco` · `cabeca` · `aura/brilho` · `aura/bola_a` · `aura/bola_b` *(a bola passou para a frente)* |
| 0,9 | `perna` · `tronco` · `cabeca` · `aura/bola_a` · `aura/anel` · `aura/brilho` · `aura/bola_b` *(a marca foi para o fundo: tudo na frente)* |

**C-313, a conta.** O herói toca `troca` (1 s). O poder está parado. Ordem base do herói: `perna`(0) · `tronco`(1) · `aura`(2) · `cabeca`(3).

| Chave do herói | A conta | Fica |
|:---|:---|:---|
| `drawOrder`, `t = 0`: `[]` | a base | `perna` · `tronco` · `aura` · `cabeca` |
| `drawOrder`, `t = 0,5`: `cabeca`, `−3` | `cabeca` vai para 3 − 3 = 0. Os outros enchem 1, 2 e 3 | `cabeca` · `perna` · `tronco` · `aura` |
| `slot/attachment` de `aura`, `t = 0`: `poder` | o placeholder **com** `around` | |
| `slot/attachment` de `aura`, `t = 0,75`: `poder_bloco` | a mesma `uri`, **sem** `around` | |

| Amostra | A lista esperada |
|:---:|:---|
| 0,25 | `aura/bola_a` · `aura/anel` · `perna` · `tronco` · `cabeca` · `aura/brilho` · `aura/bola_b` |
| 0,6 | `aura/bola_a` · `aura/anel` · `cabeca` · `perna` · `tronco` · `aura/brilho` · `aura/bola_b` *(o boneco mudou por dentro; a peça não)* |
| 0,9 | `cabeca` · `perna` · `tronco` · `aura/bola_a` · `aura/anel` · `aura/meio` · `aura/brilho` · `aura/bola_b` *(sem a marca: em bloco, no lugar do slot, e o meio volta a ser desenhado)* |

### À parte: o amortecimento da física (achado do Diretor)

**C-263 — física, amortecimento.** Os casos de hoje usam `damping: 1`: a linha `velocidade *= d` nunca é provada.

| O rig | |
|:---|:---|
| Ossos | `root`; `haste`, filha do `root`, em (0, 100). Nada se move. `referenceScale: 100` |
| Regra | `physics` na `haste`: `x: 1` (o resto 0) · `strength: 0` · `damping: 0.5` · `mass: 1` · `wind: 36` · `gravity: 0` · `fps: 60` |
| Sonda | `physicsDt: 0.01` · amostras 0 · 0,04 · 0,07 · mede `bones` |

A conta (6.5), só o trecho de X. `step = 1/60`. `d = 0,5^(60 × 1/60) = 0,5`. A cada passo: `v += (wind × referenceScale) × step = 3600/60 = 60` · `desloc += v × step` · `v ×= 0,5`.

| Passo | `v` depois de somar | `desloc` | `v` depois do freio | Sem freio, `desloc` seria |
|:---:|---:|---:|---:|---:|
| 1 | 60 | 1 | 30 | 1 |
| 2 | 90 | **2,5** | 45 | 3 |
| 3 | 105 | 4,25 | 52,5 | 6 |
| 4 | 112,5 | **6,125** | 56,25 | 10 |

O primeiro quadro só liga a física (`reset`). Depois, um passo a cada 1/60 s acumulado: em 0,04 s cabem **2**; em 0,07 s cabem **4**.

| Amostra | `haste.worldX` esperado | `haste.worldY` |
|:---:|---:|---:|
| 0 | 0 | 100 |
| 0,04 | **2,5** | 100 |
| 0,07 | **6,125** | 100 |

As amostras fogem de 0,05 e de 0,10 de propósito: ali o tempo acumulado encosta num múltiplo exato de 1/60, e o arredondamento decidiria o passo. Em 0,07 os dois caminhos dão 4 passos.

### Como separo quem escreve o caso de quem escreve o runtime (regra 26)

| Passo | Quem | |
|:---:|:---|:---|
| 1 | este plano | as listas acima estão escritas **antes** de existir código |
| 2 | lote 1 | os `esperado.json` são **digitados destas tabelas**. Nunca gerados por runtime |
| 3 | lote 2 | o TypeScript é escrito pelo texto novo da spec |
| 4 | lote 3 | o Python é escrito **só pelo texto da spec e pelos `leiame.md`**, sem abrir o `render-list.ts`. **Sugiro que seja outro chat** (uma reserva): eu já terei escrito o TypeScript, e não dá para desver |
| 5 | cada caso | antes do verde, o vermelho: cada caso é visto **falhar** no runtime sem a mudança. E a regra 28: o `leiame.md` diz o que o verde prova, e qual lista errada um runtime ingênuo daria |
| 6 | se a máquina discordar da conta à mão | **paro e relato.** Não ajusto o esperado |

---

## 7. O gesto no editor

| Passo | O que acontece |
|:---:|:---|
| 1 | O poder já está na animação do personagem (arrastado da aba Entidades) |
| 2 | Botão direito **numa imagem de dentro** do poder, na cena. A grade abre |
| 3 | O primeiro item da grade é **Este boneco**. Só aparece quando a imagem clicada é de uma entidade encaixada |
| 4 | Clique. A imagem clicada vira o meio |

| Assunto | Como fica |
|:---|:---|
| Onde grava | na **base**: no anexo, e vale em todas as animações. **No meio de uma animação:** só nela, daquele quadro em diante (segundo placeholder e chave `slot/attachment`). É a regra de trocar que já existe (`02`, seção 2) |
| A porta no menu | Entidades ▸ **Este boneco** (liga) e **Tirar o Este boneco** (desliga), com a entidade escolhida. Ids em `ui/actions-table.ts` |
| Na cena | a imagem do meio some. Com a peça escolhida, ela aparece como **contorno tracejado** com o nome: é onde se clica para desfazer |
| Na aba Ordem | a peça sai da lista comum e vira **duas linhas presas**: "poder · na frente (2)" no alto, "poder · atrás (2)" embaixo. Não se arrastam. A dica explica |
| Como se desfaz | Ctrl+Z (um `Command` só, `apply` e `revert` exatos) · botão direito em qualquer imagem da peça: o item aparece marcado, clicar tira · o menu Entidades |
| O rodapé | *"Poder em volta de Herói: 2 atrás, 2 na frente. A imagem 'meio' marca o meio e não é desenhada."* |
| O que o editor avisa | o slot do meio não existe mais na entidade (barra de avisos, ao abrir) · máscara do boneco que citava a peça |

---

## 8. Os lotes

| Lote | O quê | Prova | Versão |
|:---:|:---|:---|:---:|
| 1 | **Formato e casos.** Spec: 7.11 (o campo e a regra), 7.13 (os três grupos), 7.7 (uma linha), 2.5 (uma linha), 12.4 (o canal `drawList`), Apêndice A. Schema com `x-since: 1.1`. Os 12 casos (11 e o C-263) em `casos-pendentes/`, com `esperado.json` digitado e `leiame.md` | os 90 casos de hoje continuam verdes; o schema valida os arquivos novos e os velhos | uma |
| 2 | **Runtime TypeScript.** `render-list.ts`: os três grupos. Canal `drawList` no adaptador. `render/canvas.ts` desenha pela lista nova | cada caso visto vermelho antes; depois os 12 verdes; os 90 sem mudar | uma |
| 3 | **Runtime Python.** A lista de desenho que entra no filho (não existe hoje) e o canal | os 12 verdes; os casos saem de `casos-pendentes/`; os dois runtimes concordam nos 102 | uma |
| 4 | **Editor.** O `Command` · o item na grade · saber **qual imagem de dentro** foi clicada · a aba Ordem · o contorno na cena · o rodapé · o menu Entidades. Salvar sem o campo sai byte a byte igual, com teste | suíte, `tsc`, roteiro, medição, fotos | uma |
| 5 | **A lista para os leitores** (quem faz são a K5 e a G5) | abaixo | — |

**O que a K5 e a G5 precisam:**

| Leitor | O que muda |
|:---|:---|
| Construct | o `juntarPecas` de `leitor-construct/src/desenhador.ts` já entra no filho pela `collectDrawables` do runtime. Com o lote 2 ele recebe os três grupos. A máscara de quem recebe deixa de ir para a peça marcada. **É só ordem de lista** |
| Godot | o `desenhador.gd` ainda não desenha entidade (está escrito lá: "rodada G5"). A G5 já nasce com os três grupos, copiando o Python do lote 3 |
| Os dois, no jogo | `encaixar(slot, peça)` ganha um argumento opcional: o slot do meio. Sem ele, em bloco. O `encaixar_todas` das rodas não muda |
| Os dois | rodar os 12 casos novos pelo adaptador de cada um |

---

## 9. O que eu não sei

| # | O que | O que faço |
|:---:|:---|:---|
| 1 | **O nome do campo.** Propus `around`. É decisão do Humberto (regra 7); a função está decidida, o nome não | sigo com `around` até ele dizer outro. Trocar é barato antes do lote 1 |
| 2 | **Duas peças marcadas: quem fica mais atrás.** Eu tinha escolhido "a ordem dos slots decide nas duas metades". **O Diretor decidiu a cebola** (05/10), e leva ao Humberto | está no C-314, já com a cebola. Se o Humberto quiser a outra, muda uma linha da regra e três posições da lista |
| 3 | **Os três programas, no formato de arquivo.** A pesquisa da casa é de funções do editor. Não fui à internet | disse de memória, e marquei |
| 4 | **Clicar numa imagem de dentro da entidade.** Hoje o `viewport/picking.ts` responde "acertou a peça", não "qual imagem de dentro" (`nestedContains` devolve sim ou não). Não abri o programa | é trabalho do lote 4; pode ser maior do que parece |
| 5 | **Trocar de placeholder com a mesma `uri` por chave: o relógio do filho continua ou zera?** A 7.11 só fala disso na virada de corpo | o C-313 usa o poder parado para não depender. No lote 2 leio o código e digo; se zerar, é pergunta para o Diretor |
| 6 | **Se os leitores 1.0 de hoje avisam mesmo** ao ver `minVersion` 1.1. Existe o caso X-303; não o rodei | confiro no lote 1 |
| 7 | **O C-263 sem animação e com `physicsDt`.** Os casos de física de hoje têm animação. Não sei se a sonda anda o relógio sem ela | confiro no lote 1. Se não andar, ponho uma animação vazia de 1 s |
| 8 | **A máscara cujo `end` é o slot do meio.** Pela 7.7 de hoje, slot vazio ou escondido **não** fecha a máscara. Mantive: o meio conta como hoje, só não é desenhado | sem caso próprio. Digo no `leiame` do C-318 |
| 9 | **A foto do editor.** Nada do capítulo 7 foi visto na tela | lote 4, com fotos |

---

## O lote 1, feito — 05/10/2026, 10h50

| O quê | Onde | Prova |
|:---|:---|:---|
| O campo `around` e a regra dos três grupos, com a cebola | spec 7.11, 7.13, 7.7, 2.5, Apêndice A 82 | fim de linha conferido nos bytes: CRLF, 3991 e 3991 |
| O canal `drawList` | spec 12.4 | — |
| `around` no schema, `x-since 1.1` | `formato/bone.schema.json` (LF) | os 26 arquivos novos e os 10 exemplos validam; 59 testes do schema e do site verdes |
| Os 12 casos | `conformidade/casos-pendentes/` | `esperado.json` digitado das tabelas deste plano |
| Os 90 casos de hoje | — | **90 de 90**, medido às 10h46 |

**As dúvidas da pergunta 9 que este lote respondeu:**

| # | Resposta |
|:---:|:---|
| 6 | O leitor 1.0 **avisa**: `runtime/src/loader.ts`, `checkVersion`, linha 353: *file requires 1.1, reader is 1.0: best effort*. Lido no código. O X-303 passa, mas ele prova o outro ramo (`minVersion` 1.0); **o ramo do `minVersion` maior não tem caso** |
| 7 | A sonda anda o relógio sem animação. O **C-263 bate com a conta à mão** no runtime de referência: 2,5 e 6,125. Prova ao contrário, numa cópia fora da casa: com 3 e 10 no esperado ele reprova (diferença 0,5 e 3,875) |

**Achado do lote 1 (regras 21 e 28) — o executor de conformidade dá verde mudo.**

Os 11 casos de `drawList` **passam hoje** no runtime de referência, que não tem o canal. Prova: numa cópia fora da casa, troquei `perna/perna` por `ERRADO/ERRADO` no esperado do C-310, e ele **passou**. O `ferramentas/conformidade.mjs` não compara um canal que o runtime não devolve. Não é defeito destes casos: vale para qualquer canal desconhecido, em qualquer runtime, com `--adaptador` também.

| Consequência | O que proponho |
|:---|:---|
| O "vermelho antes do verde" da regra 26 **não existe** para estes 11 casos enquanto o executor for assim | **primeiro passo do lote 2:** canal citado no esperado e ausente do dump **reprova**, com o nome do canal. Só depois o runtime |
| Um leitor de fora (Construct, Godot) passaria os 11 sem desenhar nada disto | o mesmo conserto resolve |
| Não mexi no executor | `ferramentas/` está fora da cerca do lote 1 |

---

## O lote 2, feito — 05/10/2026, 10h58 (sem versão: o fecho é quando o Diretor disser)

| Passo | O quê | Prova |
|:---:|:---|:---|
| 1 | O executor reprova a chave de amostra que ele não conhece, com o nome; `drawList` ganhou comparador | 2 testes em `ferramentas/testes/conformidade.test.ts`, vistos vermelhos antes |
| 2 | O estrago medido nos quatro leitores | referência 90 · Python 90 · Construct 90 · Godot 79 (os 11 de sempre). **Nenhum verde perdido** |
| 3 | Os 11 de `drawList` vistos vermelhos | `obtido "<sem drawList>"`, antes do runtime |
| 4 | Runtime TypeScript: `around` no anexo e no leitor; `collectDrawGroups` (os três grupos, a cebola) e `collectDrawList` (a lista aberta) em `render-list.ts`; a tela (`render/canvas.ts`) anda pelos três grupos; canal `drawList` no dump | **os 12 verdes** com o esperado digitado · os 11 **reprovam** com a lista que o runtime errado daria (cópia fora da casa) · os 90 sem mudar · 674 testes de `runtime/testes`, do executor e do desenhador do Construct verdes · `tsc` do editor e do executor limpos |
| 5 | A dúvida 5, lida no código | abaixo |

**O que o verde dos casos NÃO prova, e o que fecha o buraco (regra 28).** O canal `drawList` sai de `collectDrawList`; a tela entra no filho por conta própria, por `collectDrawGroups`. São dois caminhos. Por isso há um teste em `runtime/testes/aninhado.test.ts`: a tela desenha na **mesma ordem** da lista, em 8 casos. Visto vermelho com a tela estragada de propósito (o meio desenhado, o bloco no lugar).

**`collectDrawables` não mudou**, de propósito. Quem ainda o usa (o desenhador do Construct, hoje) desenha um arquivo com `around` **em bloco**, que é o recuo escrito na spec, e não em dobro. A K5 troca para `collectDrawGroups` ou `collectDrawList`.

**A dúvida 5 — trocar de placeholder com a mesma `uri` por chave: o relógio do filho ZERA.** `runtime/src/skeleton.ts`, `updateNested` (linha 910): a instância do filho é presa ao **objeto do anexo**, não à `uri`. Trocou o anexo, a instância velha some, com o aviso `NESTED_GONE`, e a nova começa em 0 (Apêndice C, regra 16). Só a virada de corpo (9.13) continua pela `uri`.

| Consequência para o "Este boneco" | |
|:---|:---|
| Ligar ou desligar a marca **no meio da animação** (dois placeholders e a chave `slot/attachment`) **recomeça a animação do poder** naquele quadro, e solta um aviso | não mudei nada. **É decisão:** ou a spec diz que o relógio continua quando a `uri` é a mesma (como na virada), ou o editor avisa. O C-313 não mede isto: o poder está parado |

**Vermelhos que não são meus, pelo nome (regra 24):** `npx tsc --noEmit` na raiz acusa `ferramentas/testes/importar.test.ts` (758, 762), `medida-particulas.test.ts` (158), `psd-ossos.test.ts` (82) e `psd.test.ts` (891). Nenhum foi tocado hoje (datas conferidas). O fecho da casa usa o `tsc` do editor, que está limpo.

---

## O lote 2b — o relógio continua na troca de placeholder com a mesma `uri` (05/10/2026, 11h00)

Decisão do Diretor: **sim, continua.** Esta seção foi escrita **antes** do código.

**Como o runtime acha o zero do relógio hoje** (Apêndice C, regra 1; `runtime/src/animation.ts`, `runStart`): o relógio do filho não é guardado, é **conta**: `tempo do filho = (tempo do pai − início da corrida) × timeScale`. A "corrida" é a fila de chaves `slot/attachment` seguidas com o **mesmo valor** (o mesmo nome de placeholder). Trocar `poder` por `poder_bloco` começa outra corrida: o zero pula para a chave da troca.

| A regra nova | |
|:---|:---|
| A corrida | recua enquanto a chave anterior tiver o mesmo valor **ou mostrar um anexo `skeleton` da mesma `uri` resolvida** |
| A instância | o slot passou a mostrar outro anexo `skeleton` da mesma `uri`: a instância **é a mesma** (o mesmo esqueleto vivo, com a física dele), e passa a ler os campos do anexo novo (`x`, `y`, `animation`, `around`…). Sem `NESTED_GONE` |
| `uri` diferente, ou anexo que não é `skeleton` | como hoje: a instância some com `NESTED_GONE`, e a nova começa em 0 |

### Os dois casos, com a conta

| Arquivo | O que tem |
|:---|:---|
| `poder.bone` | ossos `root` e `orbe` (filho do root, em 0, 0). Slots `bola_a` (no `orbe`) · `meio` · `bola_b`. Animação `andar`, 2 s, em laço: `orbe.x` de 0 a 200, linear. Ou seja: **`orbe.x` = 100 × tempo do filho** |
| herói | slots `perna` · `aura` · `cabeca`, tudo no `root` em (0, 0). `aura` tem dois placeholders: `poder` (`around: "meio"`, `animation: "andar"`) e `poder_bloco` (sem `around`, `animation: "andar"`). Animação `troca`, 1 s: `slot/attachment` de `aura` = `poder` em 0, `poder_bloco` em 0,75 |

| Caso | `poder_bloco` aponta para | Amostra 0,5 | Amostra 0,9 | O runtime de hoje dá em 0,9 |
|:---|:---|:---|:---|:---|
| **C-320** a troca com a **mesma** `uri` | `poder.bone` | início da corrida 0 → filho em 0,5 → **`aura/orbe.worldX` = 50** | a corrida recua pela chave de 0,75 até a de 0 → filho em 0,9 → **90** | **15** (zero em 0,75: 0,9 − 0,75 = 0,15) |
| **C-321** a troca com **outra** `uri` | `outro.bone` (cópia igual, outro nome de arquivo) | **50** | corrida nova em 0,75 → filho em 0,15 → **15** | 15 (já passa: é o chão; vermelho só com 90 no esperado) |

A lista de desenho, igual nos dois: em 0,5 `aura/bola_a` · `perna` · `cabeca` · `aura/bola_b` (em volta); em 0,9 `perna` · `aura/bola_a` · `aura/meio` · `aura/bola_b` · `cabeca` (em bloco).

O C-321 existe para o C-320 não provar demais: sem ele, um runtime que **nunca** zerasse passaria.

### O lote 2b, feito — 11h03

| O quê | Onde | Prova |
|:---|:---|:---|
| A regra na spec | 7.11 (regra nova, e a linha do `around`), Apêndice C 1 e 16, Apêndice A 83, lista de casos da 12.4 | CRLF conferido |
| Os dois casos | `conformidade/casos-pendentes/C-320…` e `C-321…` | **C-320 visto vermelho antes do código: esperado 90, obtido 15**, como a conta previa. C-321 já passava; reprova com 90 no esperado (cópia fora da casa: obtido 15) |
| O zero do relógio | `runtime/src/animation.ts`, `entityRunStart`: a corrida recua pela chave que mostra outro placeholder da mesma `uri` | C-320 verde |
| A instância | `runtime/src/nested.ts`, `rebind`; `skeleton.ts`, `nestedSkeleton` e `updateNested`: mesma `uri` e mesmo arquivo carregado, a instância fica (o mesmo esqueleto vivo, com a física) e lê o anexo novo. Sem `NESTED_GONE` | 3 testes em `runtime/testes/aninhado.test.ts`; o da instância visto vermelho com o `rebind` desligado |
| Os casos | — | **104 de 104** no runtime de referência (90 de `casos/` e os 14 novos), às 11h02. 677 testes verdes. `tsc` do editor e do executor limpos |

**Algum caso de hoje dependia do zerar? Nenhum.** Os 90 passam sem mudar um número. Nenhum deles troca de placeholder entre dois anexos `skeleton` da mesma `uri`; o C-299 (o fundo começa na chave) continua verde. Fora dos runtimes, ninguém lê `NESTED_GONE`, `nestedOrigin` nem `runStart` (varri `editor/`, `leitor-construct/` e `ferramentas/`: zero).

| O que não está provado | |
|:---|:---|
| A **física** do filho continuando na troca | a instância é a mesma (provado), e a física mora nela; mas não há caso nem teste com física dentro do filho |
| A troca por **pele** (não por chave) entre dois anexos da mesma `uri` | o mesmo código serve (a instância fica); sem teste |
| Os anexos com `skins` diferentes | a instância fica e veste as peles do anexo novo; sem teste |
| O pacote do Construct e o Godot | não remedi: o pacote do Construct é montado (`npm run leitor:construct`), e montar está fora da cerca |

---

## O lote 4, parte 1 — o editor: o comando e a porta pelo menu (11h29, sem versão)

Parti o lote, como o Diretor previu: a parte 1 funciona **sem** o clique de dentro da entidade.

| O que existe | Onde |
|:---|:---|
| O comando `SetEntityAround`: marca e tira, na base ou numa animação. Um passo de desfazer, o arquivo volta letra por letra | `editor/src/anim/entity-around.ts` (novo) |
| Na base: o campo no anexo. Numa animação: segundo placeholder (`poder_este_boneco` ou `poder_em_bloco`) e a chave `slot/attachment` na agulha; reusa o placeholder se já existe | idem |
| `minVersion` e `version` sobem para 1.1 só quando o campo existe; tirada a última marca, o 1.1 exato volta a 1.0 | idem, `syncAroundHeader` |
| Entidades ▸ **Este boneco…** (pergunta o meio pela lista dos slots da entidade; cada linha diz "N atrás do boneco, M na frente"; a marca de agora leva "agora") e **Tirar o Este boneco**. Cinza diz por quê | `panels/entities-actions.ts`, `ui/menus.ts`, `ui/actions-table.ts` |
| O rodapé: *"poder em volta de heroi: 2 atrás, 2 na frente. A imagem "meio" marca o meio e não é desenhada"* | `entity-around.ts`, `aroundNotice` |
| A barra de avisos quando o slot do meio não existe mais na entidade | `doc/around-warnings.ts` (novo), chamado em `doc/document.ts` |
| A cena já desenha em volta | veio do runtime (lote 2): o editor desenha pelo `CanvasRenderer` |

| Prova | |
|:---|:---|
| 10 testes novos, em `editor/testes/pasta-do-projeto.test.ts` | base, animação, tirar num trecho, reuso, `minVersion`, arquivo sem `around` intocado, as contas, o aviso, as portas, o menu. A lista de desenho é lida do esqueleto vivo do documento |
| Vistos vermelhos | o desfazer sem devolver o cabeçalho (2 testes) e o aviso mudo (1 teste), estragados de propósito e restaurados na mesma volta |
| Testes reescritos, pelo nome | `acoes.test.ts`: *"toda ação dos doze menus está nela"* (285 → 287) e *"registerCoreActions registra toda ação de arranque"* (117 → 119). Só a contagem, pelas duas portas novas |
| Medido | `tsc` do editor limpo · 405 testes em 5 arquivos (pasta-do-projeto, acoes, fronteiras, menus, linha-do-tempo), às 11h28 |

**Achado que é do runtime, e eu não toquei (regra 27: *implementei o campo e não subi a versão que o leitor diz conhecer*).** `runtime/src/loader.ts`, linha 60: `READER_VERSION = { major: 1, minor: 0 }`. Um arquivo com `around` sai com `minVersion` 1.1, e o nosso próprio leitor, que **sabe** ler o `around`, avisa *"file requires 1.1, reader is 1.0: best effort"*. No editor isso cai na barra de avisos de todo projeto que usar o "Este boneco". O conserto é uma linha (`minor: 1`), no runtime TypeScript e no Python, e o X-303 precisa continuar verde. **Peço o "pode".**

**A dúvida 4, respondida:** `viewport/picking.ts`, `nestedContains`, devolve só sim ou não; o clique na entidade devolve o slot **de quem recebe**. E mais: o `picking` anda por `collectDrawables`, em bloco. Com a marca, a metade da frente do poder é desenhada por cima de tudo, mas o clique ainda a procura no lugar do slot: clicar numa bolinha da frente que cobre a cabeça pega a cabeça. E o meio, que não é desenhado, continua clicável (o que ajuda).

| Fica para a parte 2 | |
|:---|:---|
| O botão direito numa imagem de dentro da entidade, com **Este boneco** como primeiro item da grade | precisa do `picking` dizer qual imagem de dentro |
| O `picking` pela ordem em volta | `collectDrawGroups` no lugar de `collectDrawables` |
| A aba Ordem: as duas linhas presas | não comecei |
| O contorno tracejado do meio na cena | não comecei |
| O `CHANGELOG` e as fotos | no fecho, com o número da versão |
| Nada foi visto na tela | navegador e `programa/` estão fora da cerca |

---

## O lote 4, parte 2 — o clique, a grade, o contorno, a aba Ordem (11h39, sem versão)

| # | O que existe | Onde | Prova |
|:---:|:---|:---|:---|
| 1 | O leitor diz que conhece a 1.1 | `runtime/src/loader.ts`, `READER_VERSION` | teste em `runtime/testes/loader.test.ts`, visto vermelho antes: 1.1 abre sem aviso; 1.2 continua avisando ("requires 1.2, reader is 1.1") |
| 2 | O clique pela ordem em volta: o que está por cima é o que ele pega. Um acerto só por peça | `viewport/picking.ts`, `pickAll` por `collectDrawGroups` | teste; vermelho com o clique devolvido ao bloco |
| 2 | O meio, que não é desenhado, só pega o clique com a peça **escolhida** | `picking.ts`, `withChosen`; `onion.ts`, `PickLocks.markersOf`; ligado no botão direito e no clique de Selecionar | teste; vermelho com o meio sempre clicável |
| 3 | O clique diz **qual imagem de dentro** | `picking.ts`, `nestedHit`, e o campo `Pick.inner` | teste: bloco, metade da frente, metade de trás, fora |
| 3 | Botão direito numa imagem de dentro: **Este boneco** é o primeiro item das opções da grade. Na imagem que já é o meio: **Este boneco ✓**, e clicar tira | `panels/entities-actions.ts`, `aroundGridOption`; `viewport/viewport.ts`, `openDrawingMenu` e `openDrawingOptions` | teste do item (marca, marcado, troca de meio, tira, e o arquivo volta letra por letra) |
| 4 | Aba Ordem: as duas linhas presas, *"poder · na frente (2)"* em cima e *"poder · atrás (2)"* embaixo, com a dica. Duas entidades: a cebola | `anim/entity-around.ts`, `aroundLines`; `panels/draw-order.ts` e `.css` | teste da conta (uma, duas, fechada, só num trecho) |
| 4 | O contorno tracejado do meio, com o nome, quando a peça está escolhida | `picking.ts`, `markerOutline`; `viewport/viewport-draw.ts`, `drawAroundMarkers` | teste da geometria |

| Medido às 11h38 e 11h39 | |
|:---|:---|
| `tsc` do editor e do executor | limpos |
| 10 arquivos de teste do editor (pasta-do-projeto, acoes, fronteiras, menus, linha-do-tempo, cena-selecao, viewport, ferramentas, cena, acabamento) | 786 verdes, 5 pulados |
| `runtime/testes`, o do executor, o do desenhador do Construct | 678 verdes |
| Conformidade no runtime de referência | 90 de 90, e os 14 pendentes verdes |

**Testes novos:** 7 no editor (17 no bloco do "Este boneco") e 1 no runtime. **Testes reescritos, pelo nome**, uma linha em cada:

| Arquivo | Teste | O que mudou |
|:---|:---|:---|
| `cena-selecao.test.ts` | *"o clique na lâmina ACHA a entidade"* | o acerto ganhou `inner: 'lamina'` |
| `cena.test.ts` | *"a cena registra as duas, e as duas chamam o mesmo caminho do gesto"* | o texto procurado passou a ter `, hit.inner` |

**O que o verde NÃO prova (regra 28), às claras:**

| | |
|:---|:---|
| **Nada foi visto na tela** | navegador e `programa/` fora da cerca. O desenho do contorno e das linhas presas só tem a **conta** provada, não o desenho |
| "O primeiro item" | é o primeiro da lista de **opções** da grade. Não sei se a grade mostra as opções acima ou abaixo das miniaturas: é para ver na foto |
| A aba Ordem | a peça em volta continua também na linha dela, no lugar do slot (o lugar fica guardado). Não a acinzentei |
| A caixa de seleção (arrastar no vazio) | continua pela lista em bloco: ela só testa quem toca o retângulo, a ordem não importa |
| Os testes do clique | ficaram no bloco do "Este boneco", em `pasta-do-projeto.test.ts`, e não em `cena-selecao.test.ts`: usam o herói e o poder do bloco |

**Para o fecho (não é agora):**

| | |
|:---|:---|
| O pacote do Construct | **está velho de novo**: `runtime/` mudou (`READER_VERSION`). Remontar no fecho (`npm run leitor:construct`) e rodar os 90 sobre ele |
| O Python | a mesma linha da versão do leitor, e o lote 3 (os 14 casos) |
| `CHANGELOG`, fotos nas três telas, suíte inteira, roteiro, medição, `montar-programa.py`, versão | com o "pode fechar" |
| Uma falha minha de régua | editei `viewport/onion.ts` e `viewport/viewport-draw.ts` **antes** da cópia de segurança. Está dito na linha do INDICE; o estado de antes é o do zip da v27.5 |

---

## O fecho da v27.6 (15h17; a versão foi guardada às 12h01)

| | |
|:---|:---|
| Versão | **v27.6**, `backup/versoes/recorte v27.6 2026-10-05.zip`; `programa/` montado com o número |
| Os 14 casos | **não promovidos** (decisão do Diretor): um teste da K5 os lê de `casos-pendentes/`. Passam nos dois runtimes, confronto igual (11h56) |
| Suíte | 5.096 em 91 arquivos, 5.066 verdes, 29 pulados, 1 vermelho (o do manual, de 15/09), às 11h59, com o chat da K5 escrevendo |
| Roteiro · painéis | 14 de 14 (11h57) · 30 de 30 e 21 de 30 (11h58) |
| Três réguas que a suíte inteira acusou, e consertei | as duas ações novas sem nome de tarefa (`tarefas.ts`) e sem estado (`existir-nao-e-funcionar.test.ts`); ganharam também um teste em `acoes.test.ts` |
| Fotos | 12, **só em 1920×1080**, em `backup/fotos-obra/rodada-11/` |

**O que as fotos mostraram de diferente do que a conta previa:**

| # | O que se vê | O que fazer |
|:---:|:---|:---|
| 1 | **"Este boneco" NÃO é o primeiro item da grade.** A grade mostra as miniaturas em cima, depois "fonte: pasta · objeto", e só então as opções, na ordem: *Em todas as skins* · **Este boneco** · Trazer para a frente · Mandar para trás · Duplicar · Apagar. O Humberto pediu o primeiro item | subir o item para o alto da grade, antes das miniaturas (`panels/image-picker.ts`). Um lote pequeno, com foto |
| 2 | O herói de exemplo tem **duas espadas no mesmo lugar**: a imagem `sword_blade` e a entidade `espada`. Com as duas à vista não se vê a entidade mudar de ordem. Escondi a imagem pelo olho da Árvore para fotografar | é do exemplo, não do programa |
| 3 | A `espada.bone` só tem dois slots (`lamina` e `brilho`): o meio é sempre uma das duas, e sobra uma peça de um lado só. Mostra a regra, mas não mostra "metade atrás, metade na frente" | falta um exemplo de poder com várias peças, para a foto que o Humberto vai querer ver |
| 4 | O nome no contorno tracejado fica **por cima das alças** da ferramenta Transformar e se lê mal | mudar o lugar do texto |
| 5 | Na aba Ordem a linha *"espada · atrás (1)"* fica no fim da lista, fora da vista sem rolar; e aparece *"espada · na frente (0)"*, uma linha para zero peças | esconder a linha de zero; pensar onde pôr a de trás |
| 6 | Bate com a conta: o rodapé, o item marcado (**Este boneco ✓**), Tirar, a lista do menu com "N atrás, M na frente", a marca só da agulha em diante na animação, o Ctrl+Z | — |
