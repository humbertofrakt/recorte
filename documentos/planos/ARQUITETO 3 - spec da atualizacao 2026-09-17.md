# ARQUITETO 3 — A spec da atualização — 17/09/2026

Escrito pelo ARQUITETO (`animador-8b`). **Documento, não código.** É o desenho
do modelo novo em cima do formato que existe: o que muda na spec, no runtime e
no editor, e **como**. Cada item cita a decisão do Humberto que o autoriza
(`programa-novo/02`–`10`, `AS REGRAS DA BASE`, `RESPOSTAS`).

Legenda: **🗣️** palavra dele · **💡** proposta do Arquiteto, sem aval · **🔒**
precisa da palavra dele antes de virar código (regra 7) · **✅** já decidido,
só executar.

---

## 0. Uma tabela para carregar na cabeça

| Palavra dele | O que é no arquivo | Novo? |
|:---|:---|:---:|
| **Projeto** (a caixa) | um `.bonez` com vários `.bone` dentro (§2.9). Na pasta de trabalho: `manifest.json` + os `.bone` + o atlas | não — usa o que existe |
| **Corpo** (homem, lobisomem, mecha) | um arquivo `.bone`: ossos, slots, peles, regras, **e as suas animações** | não |
| **Base** | a pose de repouso do corpo (§5.1), vista na janela Animação como a entrada de **quadro 0** daquele corpo | não — muda o nome e a tela |
| **Virada** (colar o lobisomem no meio) | timeline `body`, só `stepped`, com a `uri` do outro corpo | **sim** — F3 |
| **Entidade** (fogo, espada, explosão) | anexo `skeleton` num slot (§7.11), **sem socket** | não — tira campo |
| **Tomada** | um slot | não |
| **Pino** | a raiz do filho, com `x, y, rotation, scale` no osso do slot | não |
| **Pendurar** | criar um slot novo no osso e pôr o anexo `skeleton` nele | não |
| **Pilha de peles** (Feitas/Ativas) | a lista de peles ativas do runtime, de baixo para cima; a de cima vence | texto de spec — F19, F22 |
| **Pele de fora** (Dota) | um `.bone` só de `skins` com `rig`, citado em `assets.skins` (§2.8), que **agora pode trazer osso** | **sim** — F23 |
| **Animação de fora** (Mixamo) | um `.bone` só de `animations` com `rig`, em `assets.animations` | não; **sim** para F24 (`rig.reference`) |
| **Desenho troca de osso** | timeline `slot` / `bone` | **sim** — F8 |
| **Pesos animados** | timeline `weights` | **sim** — F9 |
| **Área de recorte por animação** | `animation.crop` | **sim** — F16 |

Cinco campos novos no núcleo, um campo que sai, e três textos de spec que
mudam de sentido. Tudo o mais é **porta** (editor) ou **tela**.

---

## 1. O projeto é a caixa (P1–P3, E17)

### 1.1 No formato — nada novo ✅

§2.9 já guarda vários esqueletos num `.bonez`, com `manifest.skeletons[]` e
`main`. A regra de resolução (§2.8, base = pasta do `main`) já serve.

### 1.2 Quem é corpo e quem é entidade 💡

🗣️ BASE §18: *"não existe 'isto é base, aquilo é entidade' por natureza.
Existe onde você encaixou."* Então o papel **não é do formato**: é do editor.

| O quê | Onde mora | Quem lê |
|:---|:---|:---|
| a lista **Corpos** e a lista **Entidades** da janela | `manifest.extras.RECORTE_projeto = { corpos: [uri], entidades: [uri], emFoco: uri }` | só o editor. Leitor ignora `extras` |
| `main` do manifesto | o corpo em foco na hora de salvar | o jogo que quer "o principal" sem perguntar |
| um arquivo que é corpo **e** está encaixado noutro (o piloto no mecha) | aparece nas duas listas | — |

Sem campo novo no núcleo. Cumpre R8 (estado do editor fora do `.bone`).

### 1.3 Na pasta de trabalho 💡 🔒

Hoje o Salvar grava `x.bone` + `x.atlas.json` + páginas na pasta do projeto
(lote 62). Com N corpos:

| Saída | O que grava | Custo |
|:---|:---|:---|
| **a** — a pasta do projeto ganha `manifest.json`; cada corpo e entidade é um `.bone` ao lado; um atlas por projeto | a pasta é o `.bonez` aberto; **Salvar como pacote** só zipa | reaproveita Abrir pasta, o recente, o rascunho |
| **b** — o projeto é sempre um `.bonez` no disco | um arquivo só, sempre | cada Salvar reescreve o zip inteiro; perde o "abrir a pasta e as imagens estão lá" do Spriter |

**Recomendo a.** É o fluxo do Spriter (pasta de projeto) e o que os lotes 59–62
já fizeram. Decisão dele porque muda o que "Salvar" grava.

### 1.4 Abrir outro `.bone` (E17) ✅

| Gesto | O que faz |
|:---|:---|
| **Abrir como corpo** | copia (ou referencia — ver E4) o arquivo para a pasta do projeto, lista em Corpos, abre a base dele |
| **Abrir como entidade** | lista em Entidades, fechado. Aparece no painel Entidades e na grade do botão direito |
| **Promover** entidade → corpo (E2) | move de lista. Nada no dado |
| **Rebaixar** corpo → entidade (E2) | idem |
| **Salvar** uma entidade editada (E4) | pergunta **Novo** (cópia dentro do projeto) ou **Por cima** (o arquivo de origem), e diz quantos projetos usam o original, se souber |

---

## 2. Corpo e base (M1–M3, M7, M9)

### 2.1 No formato — muda o texto, não o dado ✅

§5.1 ganha o nome: *"A setup pose é a **base** do corpo. É o quadro 0 que toda
animação deste corpo herda."* A regra *"propriedade sem timeline fica na
setup pose"* é exatamente M3 e Q27 (*"mexer na base vale em todas, menos onde
uma chave barra"*). Nada muda no runtime.

### 2.2 No editor

| # | O quê | Como |
|:---:|:---|:---|
| M1 | a base é uma entrada da janela Animação | clicar no corpo com nenhuma animação escolhida abre a **base**: cena, Árvore, linha do tempo com o **quadro 0** só, duração 0 |
| M5 | o tocador nunca apaga | com a base aberta ele mostra `0,00 s`, um losango, botões de tocar cinza **com a dica** ("a base tem um quadro só") |
| M6 | editar sempre grava | com animação aberta, mexer grava chave. **Sai** o interruptor "Gravar sozinho" e a saída `'bloqueado'`. Entram **Chavear o escolhido** (`K`, já existe) e **Chavear tudo** (`Ctrl+K`, já existe) como os Key selected / Key all do Spriter |
| M7 | mexida que não se anima vai para a base | osso novo, forma da malha, pesos, pivô, comprimento de osso, osso do slot **sem chave**: escrevem na base do **corpo do instante** e a barra diz *"foi para a base do lobisomem"* |
| M9 | salvar como base nova | com a animação em `t`: novo `.bone` = cópia do corpo com a pose de `t` gravada como setup (ossos, slots, `attachment` ativo, deform assado em `vertices`); entra em Corpos com o nome pedido. A animação de origem **não muda** |
| M12 | cena, Árvore, Ordem, Propriedades mostram o corpo do instante | leem `corpoEm(doc, t)`, o mesmo padrão de `appliedParents` (v12.8) |

**A base aberta é `doc.animation === null`.** Isso continua. O que sai é o
**freio**: nenhuma ferramenta some (`Tool.modes` vai embora), nenhum recado
manda "voltar à Montagem", nenhum botão fica cinza por causa disso, e o
interruptor da barra sai (M4, degrau 9 do ARQUITETO 4).

---

## 3. A virada — timeline `body` (F1, F3, M10, M11, M11b, F25) 🔒

### 3.1 O dado

```json
{ "type": "body",
  "keys": [ { "time": 0.5, "value": "lobisomem.bone", "keepSkins": true } ] }
```

| Campo | Tipo | Padrão | O que é |
|:---|:---|:---|:---|
| `type` | `"body"` | — | uma por animação (L1 se repetir) |
| `key.value` | uri ou `null` | — | o corpo que vale **da chave em diante**. Relativa a `assets.skeletonsBase`, como §7.11. `null` = o corpo do próprio arquivo |
| `key.curve` | — | `stepped` | só `stepped`; outra curva é L2 e vira `stepped` (como `parent`, §9.4) |
| `key.keepSkins` 💡 | boolean | `true` | F25/Q39: a pilha de peles ativas **passa** para o corpo novo (pelo nome; nome que não existe é ignorado com aviso uma vez) ou **não passa** (o corpo novo entra só com a pele `default` dele) |

Nível **C**. Leitor de nível A ou B ignora a timeline (X-302) e mostra o corpo
do arquivo o tempo todo — que é o que o Diretor tinha proposto em BASE §5, só
que agora **de graça**, sem "corpo 0".

### 3.2 A regra (normativa) 💡

```
corpoEm(anim, t):
    k = última chave de `body` com time <= t        // nenhuma → o arquivo
    return k.value ?? o próprio arquivo

Pose(projeto, anim, t, now):
    corpo = corpoEm(anim, t)
    esqueleto = esqueletos[corpo]                   // um Skeleton por corpo, montado uma vez
    pose = setup(esqueleto)                         // 5.1: a BASE daquele corpo
    for tl in anim.timelines:
        if tl.type == "body" or "event" or property == "reset": continue
        alvo = esqueleto.acharPorNome(tl.type, tl.target)
        if alvo == null: continue                   // o rabo antes da virada; o braço do mecha depois dela
        aplicar tl em pose (9.10)
    updatePose(esqueleto, now)
```

| Regra | Por quê |
|:---|:---|
| O esqueleto **não é remontado**: cada corpo citado é montado **uma vez** ao carregar, e a virada **troca** qual está vivo | é a tradução de "o rabo nasce" (BASE §16) que mantém o runtime barato e puro. BASE §6 temia remontar no meio; não precisa |
| Timelines casam com o corpo **por nome**, no instante | é a semântica do Spriter (a `mainline` dele) e a mesma da `rig` §4.8. Nada é convertido (Q27: *"o que a animação disse continua dito"*) |
| Nome que o corpo do instante não tem: **ignorado**, aviso **uma vez** por (corpo, alvo), L2 `BODY_UNMET` | regra 21, e igual a `RIG_UNMET` |
| Um nome que não existe no arquivo mas existe num corpo citado por `body` **não é L1** `REF_*_MISSING` | a mesma exceção que §4.8 dá ao `rig`: a chave `body` é a declaração. O validador confere quando tem os dois arquivos |
| `drawOrder`, regras, parâmetros, morphs: os do corpo do instante | são do corpo |
| Eventos, tags, variáveis: da animação | não têm corpo |
| Entidades (slots com `skeleton`): o corpo novo precisa ter o **slot de mesmo nome**; senão aviso, nunca inventa (BASE §13) | M11b: peça a mais é esperada; peça que falta avisa |
| Física: o estado é de cada esqueleto; ao trocar de corpo, o esqueleto que entra começa como no primeiro `updatePose` (`reset`) | não há como carregar velocidade de um osso que não existe no outro |
| Em laço, `t` é `t mod duration`, e a virada obedece (como C-282) | — |
| Chave `body` em `time: 0` com `value != null`: permitida, L2 `BODY_AT_START` (*"esta animação é de outro corpo: guarde-a lá"*) | M8: cada corpo tem as suas |

### 3.3 O que muda no pose dump (§12.4)

Ganha o campo `body: uri | null` por amostra; os canais `bones`, `slots`,
`vertices` são os do corpo do instante. Sem isso dois runtimes não têm como
divergir na virada.

### 3.4 Casos de conformidade novos

| Caso | O que prende |
|:---|:---|
| `C-290-virada-corte-seco` | homem e lobisomem; `rabo` só no segundo; chave de `rabo` antes e depois da virada: antes ignorada, depois vale; o `braco` do homem para de ser lido depois |
| `C-291-virada-em-laco` | a virada dentro do laço, e a volta ao arquivo em `t mod duration` |
| `C-292-virada-e-entidade` | slot `espada` com `skeleton` nos dois corpos: a entidade continua; num terceiro corpo sem o slot: aviso, sem desenho |
| `C-293-virada-e-pilha` | `keepSkins: true` leva `armadura`; `false` entra só com `default` |

### 3.5 No runtime

| TS | Python |
|:---|:---|
| `Actor` (ou `Personagem`): `{ esqueletos: Map<uri, Skeleton>, arquivo, animação, t }`; `pose(actor, anim, t)` como acima; `AnimationState.apply` recebe o actor | o mesmo; **e antes disso o Python precisa do §7.11** (aninhado), que hoje não faz |

---

## 4. A entidade — imagem com relógio (E1, E5–E16, F4, F7, F18)

### 4.1 O socket sai (F7) ✅

| Sai | Onde |
|:---|:---|
| `point.socket` | §7.9 |
| `skeleton.socket`, `skeleton.childSocket` | §7.11, tabela e fórmula (fica só o caso *"sem socket"*: `P = M_slotBone × T(x,y) · R · S`) |
| `rig.sockets` | §4.8 |
| Apêndice A 62 | revogado, com o motivo: 🗣️ *"não se guarda a mão direita nas costas"* |
| exemplos `mecha.bone`, `espada.bone`, `capacete.bone`, `mecha-pele-inverno.bone` | refeitos: a espada entra no slot `weapon` com `x, y, rotation`; o capacete no slot `head` |
| casos pendentes C-271, C-272, C-278 | apagados |
| casos pendentes C-270, C-273, C-274, C-275, C-276, C-277, C-279 | refeitos sem socket; entram em `casos/` quando os **dois** runtimes passarem |

### 4.2 O que fica e vira a entidade ✅

| Palavra dele | Já é |
|:---|:---|
| segue a imagem (E5) | o anexo `skeleton` ocupa o **mesmo placeholder** que a imagem ocupava. Trocar imagem por entidade = trocar o anexo do slot (grade do botão direito, E6). O `x, y, rotation, scale` do anexo saem do **pivô da imagem** (§10.3): a raiz do filho cai onde a imagem encaixava (E7) |
| tomada e pino (E8) | slot e transformação do anexo |
| pendurar cria tomada (E9) | soltar a entidade num osso cria slot + anexo `skeleton` — o mesmo caminho de soltar uma imagem (lote 57), inclusive com chave `attachment` em `t` e `null` em 0 quando a animação está aberta |
| lugar na ordem de desenho (E11) | é a posição do slot. "Acima de tudo" = slot no `root`, no fim da ordem |
| já vem animada (E1) | `attachment.animation` + `loop` + `timeScale` |
| qual animação toca (E12b, F18) | `attachment.animation` é o padrão; a chave `nested/animation` troca. **`baseAnimation` basta?** Sim: o padrão é `animation`; `baseAnimation` é o **fundo** em laço (decisão 63), opcional. Ficam os dois |
| faixa (E13) | `origin` = tempo da chave `slot/attachment` que mostra o `skeleton` (ou 0), e da chave `nested/animation` que a troca; esticar = chave `nested/timeScale`. **Nenhum campo novo** — é a tela que falta |
| em laço começa onde foi solta (E14) | `origin` = o tempo da chave `attachment` (é assim que `nested.ts` já conta) |
| dirige corpos e entidades (E12) | os dois já vivem na mesma animação |
| `inheritAnimation` (responde ao pai pelo nome) | fica, opcional. O Spriter não tem; não entra na tela da 1.0 |

### 4.3 O anel e o piloto (BASE §17–§18) 💡

O anel é **um corpo com uma tomada no meio da ordem de desenho**: `anel_tras`,
slot `dentro` (vazio), `anel_frente`. O personagem entra no slot `dentro` como
entidade. O piloto entra na `cabine` do mecha do mesmo jeito. **Zero campo
novo.** O que falta é o gesto "encaixar o corpo A no slot de B" e o **foco**
(§1.2). O anexo `skeleton` desenha o filho como um bloco (§7.11) — o filho
**não** se mistura à ordem do pai. Se um dia o anel precisar que o personagem
fique **entre** as suas partes e ao mesmo tempo o personagem seja o corpo em
foco, é o gesto de foco que troca, não o dado.

### 4.4 No runtime

Nada novo para a entidade em si no TS (`nested.ts` faz). **Python: implementar
§7.11 e `nested`** — sem isso nenhum caso de entidade pode entrar em `casos/`
(§12.8 exige dois runtimes).

---

## 5. Peles (I3–I15, F15, F19, F22, F23, F25)

### 5.1 A pilha — texto de spec (F19, F22) ✅

| Hoje (§2.2, §4.4, §7.1) | Passa a |
|:---|:---|
| *"`default`, se existir, está sempre ativa, por baixo das outras"* | **`default` é uma pele como as outras**: a que o editor cria primeiro e a única que o Recorte não deixa apagar. Ela só está ativa se estiver na pilha |
| *"a última adicionada tem prioridade"* | *"A **pilha** é a lista de peles ativas, de baixo para cima. Onde duas dão anexo ao mesmo placeholder, **a de cima vence**."* (é a mesma conta: a última da lista é a de cima) |
| `lista = ["default"] + …` no algoritmo | `lista = pilha` (com `includes` expandidos, como hoje) |
| um placeholder sem anexo na pilha "mostra nada" | igual |

| Runtime | O que muda |
|:---|:---|
| `Skeleton.rebuildSkinLookup` / `setSkin` | não põe `defaultSkin` na frente sozinho; `activeSkins` pode conter `default` |
| `Skeleton` novo | começa com `[default]` na pilha, para um arquivo de hoje abrir igual |
| A-025, A-026 | `esperado.json` passa a listar a pilha inteira |
| Python | idem |

### 5.2 A pele de fora traz osso (F23) 🔒

§2.8 hoje ignora `bones`, `slots`, `constraints` do arquivo externo. Passa a:

| Do arquivo externo entra | Regra |
|:---|:---|
| `skins[]` | como hoje, pelo nome |
| `bones[]` com `skinRequired: true` | entram no hospedeiro. `parent` tem de ser um nome de `rig.bones` **ou** outro osso do mesmo arquivo externo (L1 se não) |
| `slots[]` | entram no hospedeiro (é onde a imagem do rabo mora). Sem `skinRequired` em slot: um slot só desenha o que alguma pele dá |
| `constraints[]` com `skinRequired: true` | entram |
| `bones[]` sem `skinRequired` | **ignorados com L2** `EXTERNAL_BONE_NOT_SKIN` (um osso sem pele num arquivo de pele é erro de quem gravou) |
| colisão de nome com o local | o local vale, L2 `EXTERNAL_DUPLICATE` (como hoje) |
| o esqueleto do hospedeiro é montado **com** esses ossos, uma vez | osso `skinRequired` é sempre calculado (§7.1), só aparece com a pele. **Sem remontar** |

Casos: `C-277` refeito, `C-294-pele-externa-com-osso`. Exemplo: `lobisomem-rabo.bone`.

### 5.3 A pele é do corpo (F15) ✅

Já é: `skins[]` mora no `.bone` do corpo. Só o texto ganha a frase.

### 5.4 Promover pele → base (I13, F25) — editor ✅

Corpo novo = cópia do corpo com: a pilha escolhida **assada** na `default`
(anexo por anexo, a de cima vence); ossos e regras `skinRequired` dessa pilha
viram comuns; as peles assadas saem; `skin.drawOrder` das assadas vira a
ordem do array `slots`. Entra em Corpos. **Zero campo novo.**

### 5.5 Na tela (I4–I12) — editor ✅

| # | O quê |
|:---:|:---|
| I7, I7b, I7d | painel Peles com **Feitas** e **Ativas**; arrastar liga, tira, reordena; editar na mesma janela; o lápis continua e é a pele em edição |
| I5, I6 | **um lápis só**: osso, desenho e regra nascem `skinRequired` na pele do lápis; ícone com nome na dica na Árvore e na cena; desligar a pele some com tudo que só existia nela |
| I9, I4 | fazer a pele como o Spriter: uma imagem por vez **ou** a pasta inteira (Trocar pasta de origem…, um desfazer, nome repetido avisa) |
| I8 | sistema de alinhar a imagem: pela guia do PSD; sem guia, pela tela; tamanho diferente avisa (`psd.ts:712` passa a ler a guia) |
| E10 (`visibleSkins[0]` = lápis) | **separa**: `pilha: string[]` e `emEdicao: string | null` em `RECORTE_editor_state` |

---

## 6. O desenho troca de osso por chave (F8, G10) 🔒

O único jeito honesto de fazer o desenho **não saltar** ao trocar de osso é a
chave carregar a posição dele no osso novo — é o que §9.4 já faz com os locais
do osso, e o que o Spriter grava no `object_ref` de cada chave.

```json
{ "type": "slot", "target": "espada", "property": "bone",
  "keys": [ { "time": 0.5, "value": "costas",
              "offset": { "x": 12, "y": -30, "rotation": 90, "scaleX": 1, "scaleY": 1 } } ] }
```

| Campo | Regra |
|:---|:---|
| `value` | nome do osso, ou `null` = o osso do arquivo, sem `offset`. Só `stepped`. Nível **B** |
| `offset` | opcional; padrão identidade. Multiplica a transformação **do anexo que o slot mostra**, no espaço do osso novo, enquanto a chave vale: `M = M_osso × T(offset) · R(offset) · S(offset) × anexo` |
| malha com pesos | os vértices pesados **não** mudam: já são medidos dos ossos deles (§7.4). O `offset` vale só para `region` e para malha sem `binding` |
| ordem de desenho | não muda: o slot continua no lugar dele |
| quem grava | o editor, na porta única de trocar pai (`runReparent`, caminho 2): com desenho na seleção e animação aberta, grava esta chave em vez de deixar o desenho de fora |
| runtime | `Slot.bone` passa a ser o osso aplicado; `setToSetupPose` devolve o do arquivo. Mesma ordem de cálculo de sempre (o slot não entra na árvore) |
| conformidade | `C-295-desenho-troca-de-osso`: a espada vai da mão às costas em `0,5`; os quatro cantos de mundo em `0,49` e `0,51` batem com a conta |
| importador do Spriter | `object_ref.parent` por chave passa a virar esta timeline (hoje assa). `--assar` continua para quem quiser |

Alternativa considerada e **descartada**: o runtime calcular o `offset`
sozinho a partir da pose em `t_chave`. Funcionaria, mas o runtime passaria a
**converter**, que é o que §9.4 e o Humberto (Q27) recusaram. A chave que
carrega o número é mais simples de provar em dois runtimes.

---

## 7. Pesos animáveis (F9) 🔒

```json
{ "type": "weights", "target": "capa", "skin": "default", "attachment": "capa",
  "keys": [ { "time": 0, "value": [ 1, 0,  0.7, 0.3, … ] },
            { "time": 1, "value": [ 0.5, 0.5,  0.2, 0.8, … ] } ] }
```

| Regra | |
|:---|:---|
| endereço | como `deform`: `(slot, skin, attachment)` |
| `value` | os **pesos** do `binding` (§7.4), na ordem do `binding`, **só os pesos**: a estrutura (quantos ossos por vértice, quais) não anima. Tamanho diferente do `binding` é L1 |
| curva | interpolável, uma curva para o array inteiro (como `deform`) |
| renormalização | **nenhuma** (§7.4 já não renormaliza). O editor grava soma 1 |
| nível | **B** |
| runtime | `VertexAttachment.computeWorldVertices` lê os pesos do slot quando há chave, como lê o `deform` |
| conformidade | `C-296-pesos-animados`: um vértice que passa de `hips 1` para `torso 1` em 1 s; posição em `0,5` é a média das duas |
| editor | pintar peso com animação aberta continua indo para a **base** (M7). Um botão **Chavear pesos** (na aba Malha e pesos, ícone com nome) grava a chave. 💡 Não gravar sozinho: peso é gesto de estrutura na cabeça de quem pinta |

---

## 8. Recorte da exportação por animação (F16) ✅

```json
{ "name": "attack", "crop": { "x": -80, "y": -10, "width": 240, "height": 200 }, … }
```

Em unidades do esqueleto, canto inferior esquerdo como §4.1. **Informativo**:
nenhum leitor de pose usa. A exportação de imagem oferece as duas opções (Q21):
corte automático da borda (**padrão**, o de hoje) ou o `crop` da animação. Na
cena, o retângulo em **magenta** quando existe (Spriter cap. 26). Nível A,
validador só confere números.

---

## 9. A animação de fora se ajusta ao tamanho (F24) 🔒

`rig.reference: { "bone": "tronco", "length": 120 }` no arquivo de animação.
Ao entrar num hospedeiro pela §2.8, o leitor calcula
`k = hospedeiro.bones[bone].length / length` e multiplica por `k` as timelines
`bone/x` e `bone/y` **da animação de fora**. Rotação, escala e shear não mudam.
Sem `reference`, `k = 1`. Osso que o hospedeiro não tem: `k = 1` e `RIG_UNMET`.

É a "decisão 3, opção b" do `PLANO peças e mechas` (10/09), que nunca foi
respondida e agora foi (Q41: 🗣️ *"o Spine tem essa opção"*). Caso
`C-297-retarget-translacao`.

---

## 10. A convenção de nomes (F6, M14) 🔒 os nomes

| O quê | Onde |
|:---|:---|
| um arquivo publicado com a spec: `formato/rigs/humanoide-v1.bone` — ossos com comprimento, slots reservados, sem arte | §14.4 (exemplos publicados) e §4.8 (`rig.name: "humanoide-v1"`) |
| 💡 os nomes, em português, com o par `_e/_d` que o editor já espelha: `raiz` · `quadril` · `tronco` · `pescoco` · `cabeca` · `braco_e/_d` · `antebraco_e/_d` · `mao_e/_d` · `coxa_e/_d` · `canela_e/_d` · `pe_e/_d` | a lista é dele |
| slots reservados: `arma_d`, `arma_e`, `costas`, `cabeca_acessorio` | as tomadas de fábrica |
| animações de fábrica: `parado`, `andar`, `correr`, `pular`, `cair`, `ataque`, `dano`, `morrer` | a biblioteca (`07`), depois |

---

## 11. Partículas (F10, F10b) — depois ✅ (1ª fase fechada pelo Planejador)

Extensão `BONE_particles`, anexo `BONE_particle` num slot. O desenho da
Pesquisa 1 (Parte 2) **cabe no modelo novo sem retoque**: um emissor é uma
"imagem com relógio", como a entidade — mora num slot, segue o osso, tem a sua
semente. Fica para o degrau 10. Nada a decidir agora além do que o Planejador
já fechou (Q16).

---

## 12. A física e a régua R1 🔒

Ver ARQUITETO 1 §4.1. **Recomendo**: manter a física como está; a spec ganha
uma frase em §1.3 e §6.5 — *"a física é a única simulação do formato; um
quadro dela depende dos anteriores; quem precisa de quadro puro assa em
chaves"* — e o editor ganha **Assar a física em chaves** (D6, Q28). Nenhum
campo novo.

---

## 13. O que sai da spec, o que muda, o que entra — a lista para o executor do degrau 1

| Seção | Mexida |
|:---|:---|
| §1.3 princípios | acrescenta R1 (quadro é função pura do tempo) com a exceção da física |
| §2.2 raiz | `skins`: tira *"default sempre ativa por baixo"* |
| §2.8 externos | pele de fora traz `bones`, `slots`, `constraints` `skinRequired` (F23); `rig.reference` (F24) |
| §2.9 `.bonez` | nota: o projeto do editor é um `.bonez`; `manifest.extras` guarda as listas do editor |
| §4.3 `Slot` | `bone` passa a ser animável (`stepped`, com `offset`) |
| §4.4 `Skin` | a pilha; a de cima vence; `default` comum |
| §4.6 `Animation` | `crop` |
| §4.7 tabela | `key.value` de `body` → uri; `key.value` de `slot/bone` → osso |
| §4.8 `rig` | sai `sockets`; entra `reference` |
| §5.1 | *setup pose = base*; a base é por corpo |
| §7.1 | `default` comum |
| §7.9 `point` | sai `socket` |
| §7.11 `skeleton` | saem `socket`, `childSocket`; a fórmula fica só com o caso simples; ganha o parágrafo "a entidade segue a imagem" |
| §9.1 tabela | linhas novas: `body` · `slot/bone` · `weights` |
| §9.5 | `slot/bone` |
| §9.6 | `weights` |
| §9.10 `Pose` | recebe o projeto; `corpoEm`; casamento por nome |
| §9.13 novo | a virada, normativa (o §3.2 acima) |
| §12.4 | `body` no dump; casos novos C-290 a C-297 |
| §13.3 Spriter | `object_ref.parent` → `slot/bone`; `entity` → corpo; SCML → projeto |
| Apêndice A | 62 revogado; 72 (virada), 73 (pilha), 74 (slot/bone), 75 (weights), 76 (crop), 77 (pele com osso), 78 (reference), 79 (física é simulação) |
| Apêndice B | 7 já fechada; 10 (`baseAnimation` fica normativo — a entidade depende dele); 11 (`assets.skins` fica) |
| `bone.schema.json`, validador, site | acompanham |
| cabeçalho | `generator: "Recorte 0.2.0"`; a spec vira rascunho **0.2**. Sem compatibilidade com o rascunho 0.1 (M13), escrito no CHANGELOG |

---

## 14. O editor — o modelo do documento

| Hoje | Passa a |
|:---|:---|
| `Doc { file: BoneFile }` | `Projeto { corpos: Map<uri, Doc>, entidades: Set<uri>, emFoco: uri, manifesto }`. Cada `Doc` continua sendo um `.bone` (o contrato não muda por corpo) |
| `doc.skeleton` | `projeto.esqueletoEm(t)`: o `Skeleton` do corpo do instante da animação aberta |
| `doc.animation === null` = Montagem | `doc.animation === null` = **base aberta**. Sem `EditorMode`, sem `Tool.modes`, sem `MODE_ITEM`, sem `'bloqueado'`, sem semáforo |
| `setPropertyOrKey` | dois caminhos só: base aberta → setup; animação aberta → chave. `keyValuesNow` idem |
| `visibleSkins[0]` = lápis | `pilha[]` + `emEdicao` |
| `Reparent` caminho 2 deixa o desenho de fora | grava `slot/bone` |
| Árvore, Ordem, Propriedades leem `file` | leem o corpo do instante |
| painel Animações: uma lista | **Corpos** · **Animações do corpo** · painel **Entidades** ao lado do Imagens |
| linha do tempo: sem faixa | linha `nested` por slot com `skeleton`: uma **faixa** que se arrasta (`origin`) e se estica (`timeScale`); botão direito lista as animações do filho (E12b) |
| grade do botão direito: imagens | imagens **e** entidades (E6) |
| teclas fixas | `keys.ts` lê uma tabela de troca na máquina (G7); `B` cria osso, `Y` posa, `N` livre (G1) |
| Shift soma chave | Ctrl + clique soma; Ctrl + arrastar clona (G2) |
| Copiar a ordem grava em 0 | grava em **cada chave** que existe (G3) |
| arrastar chave | move só ela (G11, conferir no Spriter antes) |
| Chavear com semáforo | sem semáforo (G13) |
| Arranjo único no menu Janela | arranjos com nome (C6); painel **Pivôs** (C4); tela cheia da Visualização com animações e peles (C5) |

---

## 15. As perguntas que sobram para o Humberto 🔒

Em ordem do que trava mais. Enquanto não responde, a suposição do Arquiteto
está escrita e a obra segue com ela.

| # | Pergunta | Suposição |
|:---:|:---|:---|
| A1 | **Base = corpo?** Cada corpo tem uma base (a pose de repouso dele), e o projeto tem vários corpos. É isso? (ARQUITETO 1 §4.2) | sim |
| A2 | **A pasta do projeto ganha `manifest.json` e vários `.bone`** (saída a de §1.3)? | sim |
| A3 | **A virada leva a pilha de peles por padrão** (`keepSkins: true`)? | sim |
| A4 | **A chave de troca de osso do desenho carrega a posição** (`offset`) em vez de o runtime converter (§6)? | sim |
| A5 | **Pesos animados: só por Chavear pesos**, nunca sozinho (§7)? | sim |
| A6 | **Os nomes da convenção** (§10) | os propostos |
| A7 | **A física fica como está, com Assar em chaves** (§12)? | sim |
| A8 | **`inheritAnimation` (a espada responde ao `attack` do pai) fica no formato, fora da tela da 1.0?** | sim |
| Q42 | animação daqui por cima da de fora (não trava) | não, por ora |

Técnicas delegadas (*"escolha o mais simples"*): nível de leitor das timelines
novas, códigos de aviso, numeração dos casos, nome `body`/`weights`/`crop`.
