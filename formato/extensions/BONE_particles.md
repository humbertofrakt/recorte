# `BONE_particles` — emissor de partículas sem estado

**Versão da extensão:** 1.2 (05/11/2026: `rate` animado por integral, §4.2) · 1.1 (05/10/2026: a forma `path`, §9.4.2) · **Estado:** candidata (não é núcleo) · **Licença:** CC-BY 4.0
**Schema:** `formato/extensions/BONE_particles.schema.json`
**Contra a spec:** `formato/ESPECIFICACAO 2026-09-17.md`, rascunho 0.2.
**Escrita em** 18/09/2026.

Fonte do desenho: `documentos/planos/O QUE AINDA NAO TEMOS 2026-09-16.md`, Parte 2
(o campo a campo e as contas) · `documentos/programa-novo/07 efeitos e particulas.md`
(o pedido e o que entra na 1ª fase).

---

## 1. O que é, em uma tela

| Pergunta | Resposta |
|:---|:---|
| O que é | Um anexo novo, `"type": "BONE_particle"`, dentro de um slot, preso ao osso do slot — como um `region`, com `x`, `y` e `rotation` próprios (§9.10) |
| A régua | O quadro no tempo `t` é **função pura** de (arquivo, animação, `t`). Nada é guardado entre quadros |
| Quem nasce | A partícula `i` nasce em `t_i`, calculado pela taxa |
| O acaso | `u = acaso(semente, fluxo, i, canal)`, hash PCG de 32 bits, inteiro exato |
| Onde está | Conta fechada da idade `a = t − t_i`, com gravidade e arrasto linear |
| Limite de vivas | Desenha as `maxParticles` **mais novas** vivas. Sem estado |
| Leitor sem a extensão | Placeholder vazio (§2.5 da spec) **e aviso uma vez**, com o nome do emissor e do slot |

**Por que função pura.** Godot e Unity simulam para frente: arrastar o cursor para
trás não devolve o mesmo quadro. É o buraco que ninguém ocupa — o efeito que o
animador afina na mesma linha do tempo do boneco e que qualquer runtime toca
igual, para frente e para trás. Esta extensão existe para isso, e **toda** decisão
abaixo se dobra a essa régua.

---

## 2. Como entra no arquivo

### 2.1 O anexo

```json
"skins": [{ "name": "default", "attachments": {
  "<slot>": { "<placeholder>": { "type": "BONE_particle", ... } }
}}]
```

O tipo é **sempre prefixado**: `"BONE_particle"`, no singular (um anexo é um
emissor). O nome da extensão é `BONE_particles`, no plural, e é ele que vai em
`extensionsUsed`. **Ninguém escreve `"type": "particle"` sem prefixo.** Quando e
se a extensão for promovida ao núcleo (§12.8 da spec), o nome prefixado continua
aceito para sempre, como alias.

### 2.2 `extensionsUsed` e `extensionsRequired`

A §2.7 da spec manda: todo `type` prefixado **DEVE** ter a extensão em
`extensionsUsed`.

```json
"bone": { "version": "1.1" },
"extensionsUsed": ["BONE_particles"]
```

`extensionsRequired` é **opcional** e é decisão do gravador: o emissor tem
fallback escrito (§7.3 aqui), então o arquivo abre sem a extensão. Um arquivo cujo
sentido inteiro é o efeito (um `.bone` que só tem fumaça) **PODE** exigi-la.

### 2.3 De onde o schema desta extensão é chamado

A §12.7 da spec diz: *"Extensões registradas trazem o seu schema e o validador o
aplica pelo nome."* Isso não acontecia: o `definitions/extensions` do
`bone.schema.json` confere só o **nome** da chave (o regex da §2.7) e que o valor
é um objeto; o conteúdo não era validado por ninguém.

A partir daqui vale o seguinte, e está ligado no código:

| Onde | O quê |
|:---|:---|
| `ferramentas/validador/validar.mjs` | Carrega os schemas de `formato/extensions/*.schema.json` e monta um registro **nome da extensão → schema** |
| `site/validador/nucleo.js` | Aplica o schema pelo nome, sobre cada objeto `extensions.<nome>` e sobre cada anexo de tipo prefixado dessa extensão |
| Extensão sem schema no registro | L2 — a §2.7 já previa: *"Nome não registrado é válido no arquivo, mas o validador avisa"* |

**O `"BONE_particle"` passa no `bone.schema.json` como está, e isso foi conferido
no disco em 18/09/2026.** O `definitions/attachmentType` é um `anyOf` de dois
ramos: o `enum` fechado dos oito tipos do núcleo **e**
`definitions/coreOrExtensionType`, que é `pattern: ^[A-Z][A-Z0-9]{1,7}_[a-z0-9_]+$`.
`BONE_particle` casa com o segundo ramo. **Não há defeito do schema contra a
§2.7.** Os casos do validador provam isso, para ninguém ter de reconferir.

---

## 3. A régua: o acaso

### 3.1 A identidade de uma partícula

Três inteiros: `(fluxo, ciclo, índice)`.

| Fluxo | O que é |
|:---:|:---|
| `0` | Emissão contínua (a taxa) |
| `1 + b` | A rajada número `b` da lista `bursts` |

O acaso de uma partícula **só depende da chave e da semente**. Nunca do número do
quadro, nunca do `dt`, nunca da ordem de cálculo.

### 3.2 O hash: PCG de 32 bits

Base: Jarzynski e Olano, *"Hash Functions for GPU Rendering"*, JCGT 2020.

```
// todas as contas em inteiro sem sinal de 32 bits, mod 2^32
function pcg(v):
    state = v * 747796405 + 2891336453
    word  = ((state >> ((state >> 28) + 4)) ^ state) * 277803737
    return (word >> 22) ^ word

function acaso(semente, fluxo, indice, canal):          // devolve u em [0, 1)
    h = pcg(semente)
    h = pcg(h ^ fluxo)
    h = pcg(h ^ indice)          // índice negativo: complemento de 2 em 32 bits
    h = pcg(h ^ canal)
    return (h >> 8) / 16777216   // 24 bits: exato em float32 e em float64
```

Como escrever em cada linguagem:

| Linguagem | Multiplicação | Deslocamento |
|:---|:---|:---|
| JavaScript / TypeScript | `Math.imul(a, b) >>> 0` | `>>>` |
| Python | `(a * b) & 0xFFFFFFFF` | `>>` |
| C / C# / GLSL / HLSL | `uint32_t` / `uint` já dá a volta | `>>` |

Por que `(h >> 8) / 2^24`: um número de 24 bits cabe **exato** em float32. Um
runtime que calcule em float32 (permitido pela §3.6 da spec) tira o mesmo `u`.

**Valores de referência.** Conferidos na máquina em 18/09/2026, Node e Python,
**mesmo bit nos cinco**:

| Entrada | Saída |
|:---|:---|
| `pcg(0)` | `129708002` |
| `pcg(42)` | `1223963391` |
| `pcg(0xFFFFFFFF)` | `3861530882` |
| `acaso(42, 0, 7, 0)` | `0.4190843105316162` |
| `acaso(42, 0, −3, 0)` | `0.5181800723075867` |

Um runtime que não reproduza estes cinco números **não implementa P**. É a
primeira coisa a conferir, antes de qualquer caso.

### 3.3 Tabela de canais (congelada)

Número de canal **nunca** muda de sentido. Canal novo entra só no fim.

| Canal | Usado por |
|:---:|:---|
| 0 | `lifetime` |
| 1 | `speed` |
| 2 | direção dentro do `spread` |
| 3 | forma: primeira coordenada |
| 4 | forma: segunda coordenada |
| 5 | `angle` |
| 6 | `angularVelocity` |
| 7 | `scale` |
| 8 | `startColor` |
| 9 | `startFrame` |
| 10 | `randomness` (tremor do instante de nascimento) |
| 11 | `probability` da rajada |
| 12 | forma `mesh`: escolha do vértice / aresta / triângulo |
| 13–15 | **reservados** (ruído, 2ª fase). Um leitor não os usa nesta versão |

Campo com faixa `[min, max]`: `valor = min + (max − min) × u`.

### 3.4 O que é proibido, e por quê

| Proibido | Por quê |
|:---|:---|
| `Math.random`, `rand()`, `Random.value` | Sem semente, ou semente com algoritmo diferente em cada linguagem. Dois leitores nunca batem |
| Gerador com estado (`next()`) | O número da partícula 7 passa a depender de quantas vezes chamaram antes. Pular quadro muda tudo |
| Hash em float (`fract(sin(x) * 43758.5)`) | `sin` muda entre bibliotecas e GPUs. Não é bit a bit |
| Posição acumulada `p += v * dt` | Depende do `dt`. 30 fps e 60 fps dão lugares diferentes. Voltar o cursor não desfaz |
| Contador acumulado de nascimentos | Mesma coisa: `acumulador += taxa * dt` erra diferente em cada ritmo de quadro |
| Semente automática | É exatamente o que a régua proíbe. `seed` é **sempre** fixa, e `0` é semente válida |

A única soma permitida é **por chave**, na carga do arquivo (§4.2). Ela tem ordem
fixa e número fixo de parcelas, e não depende do quadro.

---

## 4. Quando nasce

### 4.1 A 1ª fase: `emitting` liga e desliga

Nesta versão da extensão, **`rate` é um número fixo no anexo** e quem anima é
`emitting`, booleano, com chaves `stepped`. A taxa efetiva é:

```
taxa_efetiva(t) = rate   se emitting(t) for verdadeiro
                  0      caso contrário
```

`E(t)` = número de nascimentos até `t` = a integral da taxa efetiva. Com `rate`
constante e `emitting` em degraus, a integral é uma soma de retângulos: fechada,
exata, e a inversa é uma divisão.

```
trecho que começa em t0, com E0 = E(t0) e taxa r0 (que é rate ou 0):
    E(t) = E0 + r0·(t − t0)
    τ(d) = d / r0            // d = i − E0;  com r0 = 0 o trecho não gera ninguém
```

**Em que relógio a timeline de `emitting` é lida — normativo.** No **relógio do
esqueleto**, o mesmo em que o animador pôs a chave. **Não** em `t − startDelay`.

```
emitting(t)          // t é o tempo do esqueleto, sem desconto nenhum
```

**A régua geral, e ela vale para todo campo animável que vier depois:**

> **O `startDelay` desloca NASCIMENTOS, que o programa gera. Não desloca CHAVES,
> que uma pessoa põe à mão na linha do tempo.**

| O que segue o `startDelay` | O que não segue |
|:---|:---|
| Os nascimentos do fluxo contínuo (§4.2) | A timeline de `emitting` |
| Os ciclos de uma rajada (§4.3) | Qualquer timeline de campo animável |
| A janela do `prewarm` (§6), que estende para trás **a partir da origem deslocada** | |

**Por quê.** Se a timeline fosse lida no relógio do emissor, mudar o
`startDelay` de `0` para `0.3` faria **todas as chaves de `emitting` andarem
0,3 s sem se moverem na tela**: o animador veria a chave parada onde a pôs e o
efeito acontecendo noutro instante. É o programa fazendo uma coisa e mostrando
outra — exatamente o que a regra 21 do projeto proíbe.

A distinção está escrita aqui, e não só a decisão, porque é ela que explica de
uma vez por que o `prewarm` e a rajada seguem o `startDelay` — **são
nascimentos, gerados pela conta** — e a timeline não — **é controle, posto à
mão**. Quem acrescentar o próximo campo animável já tem a resposta.

*Com `startDelay: 0` as duas leituras coincidem, e é o caso dos oito casos de
hoje: nenhum deles as separa. Escrita em 18/09/2026, depois de a pergunta subir
do confronto dos dois runtimes.*

### 4.2 A conta geral (o ramo linear: 2ª fase, em serviço desde a 1.2)

A conta abaixo está escrita **inteira** de propósito, e isso é decisão do
Planejador de 18/09/2026: **spec que cala é spec que vai ser adivinhada.** Foi
assim que nasceram os casos C-299 e C-300 — dois runtimes lendo a mesma spec de
jeitos diferentes porque ela não dizia. Um runtime da 1ª fase precisa só do ramo
`stepped`; os dois ramos ficam escritos aqui para que o segundo leitor não invente
o seu próprio depois, e para que a 2ª fase não mude o número de nada.

| Curva da chave de `rate` | `E` no trecho | A inversa |
|:---|:---|:---|
| `stepped` | reta | `τ = d / r0` |
| `linear` (**2ª fase**, versão 1.2) | parábola | `τ = 2d / (r0 + sqrt(r0² + 2·s·d))` |

**Desde a versão 1.2 (05/11/2026) o ramo `linear` está em serviço** nos dois
runtimes, e o caso P-002 o prova. `rate` é animável por uma timeline
`BONE_particle` com `property: "rate"` (§9). A taxa efetiva passa a ser:

```
taxa_efetiva(t) = rate(t)   se emitting(t) for verdadeiro
                  0         caso contrário
rate(t)         = a timeline de rate lida em t (§9.10 da spec), ou o número do
                  anexo se não há timeline. Com timeline, o número do anexo NÃO vale.
```

**Os trechos — normativo.** Os cortes são a origem `o`, toda chave de `emitting`
depois de `o` e **toda chave de `rate` depois de `o`**. Dentro de um trecho a
taxa é uma reta: `r0` é a taxa efetiva **no início** do trecho e `s` a inclinação
da chave de `rate` que vale ali (`0` com `stepped`, `0` depois da última chave,
`0` com `emitting` falso). A área do trecho de largura `Δ` é
`r0·Δ + s·Δ²/2`, somada em float64 na ordem dos trechos.

**O índice que cai na fronteira de uma rampa que começa em zero.** Com `r0 = 0`,
`s > 0` e `d = 0`, a forma estável dá `0 / 0`. A partícula nasce **na fronteira**:
`τ = 0`. É onde `E` a alcança (o P-002 tem uma: o índice 0 em `t = 0`). Com
`r0 = 0` e `s = 0` o trecho não gera ninguém, como na 1ª fase.

**A 1ª fase não muda um bit.** Com `s = 0` a forma estável é `2d / (2·r0)`, que
é `d / r0` exatamente em IEEE 754 (dobrar é exato, e `sqrt(r0·r0) = r0`).

Onde o trecho começa em `t0` com `E0 = E(t0)`, taxa `r0`, inclinação
`s = (r1 − r0) / (t1 − t0)`, e `d = i − E0`.

A forma `2d / (r0 + sqrt(...))` é a **estável**: não divide por `s` e vale com
`s = 0`. Um runtime **DEVE** usar esta forma, e não `(−r0 + sqrt(...)) / s`.

**A origem da emissão é `o = startDelay`**, e é daí que a integral parte:

> A integral `E` corre **no relógio do esqueleto**, a partir de `o`, com
> `emitting(t)` lido em `t` **sem desconto nenhum**: `E(o) = 0`. O nascimento do
> índice `i` é o instante `t_cont` do esqueleto em que `E(t_cont) = i` — a
> **inversa da integral**, e **não** uma soma aplicada depois.

```
a origem:  o = startDelay                     // E(o) = 0; nada nasce antes de o
na carga:  recortar os trechos de taxa efetiva a partir de o
           E_k = soma das áreas dos trechos 0..k−1, em float64, nesta ordem
           // é o único "acumulado" permitido: por chave, não por quadro
           // trecho com taxa efetiva ZERO tem área zero: NÃO consome índice

partícula i do fluxo 0, com i >= 0:
    achar o trecho k com E_k <= i < E_{k+1}       // busca binária
    t_cont = t_k + τ(i − E_k)                     // JÁ no relógio do esqueleto
    t_i    = aplicar explosiveness e randomness (§4.4)

partícula i < 0 (pré-aquecimento, §6):
    t_cont = o + i / r0        // r0 = a taxa da primeira chave (§9.10 da spec):
                               // a de rate, se rate é animado; e 0 se emitting
                               // começa falso

viva em t  se  t_i <= t < t_i + life_i
idade      a = t − t_i
```

Regras:

- Taxa negativa: L1 `RANGE_PARTICLE_RATE`. O runtime troca por `0` **na chave**,
  antes de integrar.
- Bézier em `rate`: L2 `RANGE_PARTICLE_RATE_CURVE`. O runtime usa `linear` e
  **avisa**. O editor não oferece Bézier nesse campo.
- Antes da primeira chave vale a primeira chave (§9.10 da spec). Por isso a taxa
  em tempo negativo é conhecida, e o pré-aquecimento (§6) tem número.
- **O `startDelay` desloca a ORIGEM, e isso não é o mesmo que somar no fim.**
  O `prewarm` estende para trás **a partir dessa origem**, não do zero absoluto.

**Por que as três expressões do `startDelay` NÃO têm a mesma forma** — e não
"uniformize" as três, que é o erro que esta linha desfez:

| Onde | A forma | Por quê |
|:---|:---|:---|
| §4.2, fluxo contínuo | a origem `o` da **integral** | há uma integral no meio. O instante do nascimento sai da **inversa** dela, e a integral tem de começar em `o` |
| §4.3, rajada | `t_i = startDelay + time + c·interval` | `time` e `interval` são instantes **escritos pelo autor**. Não há integral: somar é deslocar |
| §6, o corte | `0 <= startDelay + time + c·interval < D` | o mesmo instante da §4.3, conferido contra a volta |

**O que a soma no fim fazia de errado**, escrito porque um caso precisou separar
as duas e porque a frase bem escrita e errada passou por muita gente: com
`startDelay 0.3`, `rate 20` e uma chave de `emitting` fechando em `0.5`, ela
fazia nascer partículas em `0.5`, `0.55`, `0.6`, `0.65`, `0.7` e `0.75` —
**instantes em que `emitting` é falso no relógio do esqueleto**, que é o relógio
que a §4.1 nomeia como o que vale. O animador fecha a torneira em `0.5`, vê a
chave parada onde a pôs, e o efeito continua nascendo até `0.75`. É exatamente o
defeito que a §4.1 existe para evitar.

Com a origem no lugar certo: **nada nasce antes de `startDelay`** (a §9.1
continua valendo) e **nada nasce enquanto `emitting` é falso** (a §4.1 continua
valendo, e agora a conta concorda com ela). Com `startDelay 0.6` e a chave
fechando em `0.5`, **não nasce nada** — e isso não é absurdo: a torneira fechou
antes de o emissor ligar.

**Quando o `emitting` RELIGA, os índices continuam de onde pararam** — é o que a
mecânica de trechos acima já diz, e vale a pena escrever porque a alternativa é
tentadora e errada. Um trecho de taxa zero tem área zero: ele **não consome
índice nenhum**. Com `rate 20`, ligado em `[0, 0.5)`, desligado em `[0.5, 0.8)`
e ligado de novo a partir de `0.8`, a partícula que nasce em `0.8` é o índice
**10**, e não o **16**:

```
E(0.5) = 10          →  índices 0..9 nasceram
[0.5, 0.8) tem taxa 0 e área 0   →  E(0.8) = 10, ainda
a que nasce em 0.8 é o índice 10
```

**Não é só a contagem: é a identidade.** Índice diferente é `hash` diferente
(§3.2), logo vida, velocidade, ângulo e cor diferentes. **A mesma partícula com
dois nomes desenha duas coisas.** Um leitor que calcule `t_i = i / rate` e
depois descarte quem caiu com a torneira fechada acerta a lista **enquanto o
`emitting` só fechar** — e erra na primeira vez que ele reabrir. O caso P-017
existe para isso.

### 4.3 Rajadas

Uma rajada `b` da lista `bursts` nasce fora da taxa contínua, no fluxo `1 + b`.

```
rajada b, ciclo c (0 <= c < cycles), partícula j (0 <= j < count):
    t_i   = startDelay + time + c·interval
    chave = (fluxo 1+b, índice c·count + j)
    nasce se acaso(seed, 1+b, c·count + j, 11) < probability
```

**O `startDelay` toca a rajada**, e está escrito aqui por extenso porque a
expressão curta (`time + c·interval`) convida a esquecê-lo. Ele é propriedade do
**emissor inteiro**, não de um fluxo: a §9.1 o define como *"nascimentos só a
partir daqui"*, e a §6 acaba de fixar que **rajada é nascimento**. Ler
"nascimento" de um jeito na §6 e de outro na §9.1 seria a mesma palavra valendo
duas coisas no mesmo documento.

A mesma expressão longa aparece no corte da §6, e é de propósito: **se o
`startDelay` aparece numa seção e some na outra, o próximo leitor implementa as
duas coisas.**

`probability` é sorteio **por partícula**, não por ciclo, e usa o canal 11.
Com `probability: 1` (o padrão) todas nascem; o consumo do canal 11 é o mesmo e o
resultado também, porque `u < 1` sempre (o `u` está em `[0, 1)`).

### 4.4 Explosividade e tremor do nascimento

Aplicados nesta ordem, sobre `t_cont`:

```
explosiveness (e):
    inicio = início do ciclo de duration que contém t_cont
    t_i = inicio + (1 − e)·(t_cont − inicio)        // monotônica, pura
randomness (r):
    t_i += r · acaso(seed, fluxo, i, 10) / taxa_local
```

`taxa_local` é a taxa efetiva no instante `t_cont`, **lida no relógio do
esqueleto, sem desconto de `startDelay` nenhum**. Isso sai de graça da §4.2: com
a integral correndo a partir da origem `o`, o `t_cont` que ela devolve **já é**
do relógio do esqueleto. Não há conversão a fazer aqui, e tentar descontar o
`startDelay` outra vez seria descontá-lo duas vezes.

*(A frase está escrita porque o runtime TypeScript levantou a dúvida enquanto a
§4.2 ainda somava o `startDelay` no fim — e naquela redação a dúvida era
legítima, porque `t_cont` ficava em dois relógios ao mesmo tempo. Com a origem
no lugar certo ela deixa de existir, e a linha fica para ninguém a levantar de
novo.)*

O tremor fica **dentro da própria vaga**: não troca a ordem de nascimento. Com
`taxa_local = 0` o tremor é `0` (não há vaga para tremer).

---

## 5. Quais partículas olhar

Sem estado, o leitor precisa de uma janela. Ela vem de um campo **não animável**:
`lifetime.max`.

```
candidatos contínuos:  i de ceil(E(t − lifetime.max)) − 1  até  floor(E(t)) + 1
filtro:                t_i <= t < t_i + life_i
                       // o t_i manda; o E só escolhe candidatos
```

É por isso que `lifetime` **não é animável**: com chaves, a janela exigiria varrer
a curva, e uma Bézier faz barriga.

---

## 6. Laço e pré-aquecimento

A §9.11 da spec diz que o laço é decisão do runtime: o arquivo não sabe se a
animação repete. Então o **emissor declara**.

| `looping` | O que entra em `t` | Efeito |
|:---:|:---|:---|
| `true` | os nascimentos da volta atual **e** os das voltas anteriores, deslocados de `−D`, `−2D`… enquanto couberem na janela `lifetime.max` | Emenda perfeita. Em `t = 0` já há partículas |
| `false` | os nascimentos em `[−prewarm, t]` | `prewarm: 0` começa vazio; `prewarm: 2` começa como se tivesse rodado 2 s |

`D` = a duração da animação que toca (§9.11 da spec).

**Nas voltas anteriores o acaso NÃO inclui o número da volta.** Se incluísse, `t`
sozinho não bastaria para saber a volta, e a função deixaria de ser pura. Duas
partículas de voltas diferentes com o mesmo índice têm o mesmo `u` e a mesma vida;
o que muda é o `t_i`.

**"Nascimentos" inclui a rajada.** A frase acima diz "os nascimentos da volta
atual e os das voltas anteriores", e não dizia se rajada conta. **Conta: uma
rajada é um nascimento.** As voltas de trás trazem as rajadas delas, deslocadas
de `−D`, `−2D`…, pela mesma regra do fluxo contínuo.

Tratá-la à parte faria **a explosão sumir ao virar a volta** — e a emenda que o
laço existe para esconder apareceria justo no efeito que mais se nota.

**Os ciclos de uma rajada que passam de `D`.** Uma rajada com
`cycles · interval` maior que a duração transborda a volta, e aí os ciclos de
trás caem **em cima** dos da frente. Com `time 0.1`, `cycles 5`, `interval 0.5`
e `D = 1`, os ciclos ficam em `0.1, 0.6, 1.1, 1.6, 2.1`; deslocados de `−D`, o
terceiro cai em `0.1` — **o mesmo `t_i` do primeiro da volta atual**, com índice
diferente. Duas partículas no mesmo instante, que ninguém pediu.

| `looping` | O que a volta leva |
|:---:|:---|
| `true` | **Só os ciclos cujo instante cai em `[0, D)`** — isto é, `0 <= startDelay + time + c·interval < D`. O leitor **DEVERIA** avisar **quantos ciclos** ficaram de fora |
| `false` | **Todos** os ciclos valem. É o laço que corta, e sem laço não há o que emendar |

**A fronteira, em símbolos, porque em palavras ela tem duas leituras.** Zero
**fechado**, `D` **aberto**: `0 <= instante < D`. Um ciclo que caia **exatamente
em `D`** não entra nesta volta — ele é o primeiro ciclo da volta seguinte, e
contá-lo nas duas o duplicaria, que é justamente o defeito que este corte existe
para matar.

É **a mesma fronteira** dos índices do fluxo contínuo, logo abaixo
(`0 <= i < E(D)`), e está escrita do mesmo jeito de propósito: duas frases com a
mesma regra escritas de jeitos diferentes acabam divergindo.

O caso que separa as duas leituras é o mais banal que alguém vai escrever: um
`interval` que divide a duração certinho — uma rajada a cada `0.5` s numa
animação de `1` s. Com `time: 0`, os ciclos caem em `0`, `0.5`, `1.0`…, e o
terceiro está exatamente em `D`. **Fica de fora.**

**E o `startDelay` entra na conta do corte**, com a mesma expressão longa da
§4.3. Não é detalhe de escrita: ele muda quem é cortado.

| | `startDelay 0.3`, rajada em `time 0.8`, `D = 1` |
|:---|:---|
| Com o `startDelay` na conta | `0.3 + 0.8 = 1.1` → **fora** da volta, cortado, com aviso |
| Sem ele, pela expressão curta | `0.8` → **dentro** |

Duas partículas diferentes na tela, do mesmo arquivo, conforme o leitor.
**Nenhum dos oito casos separa as duas leituras** — todos têm `startDelay: 0`.

*Achado em 18/09/2026 pelo chat do runtime Python, ao conferir o corte novo.
Ele relata que quase implementou as duas coisas, porque leu as duas frases: a
§4.3 escrevia `t_i = time + c·interval` e a §9.1 dizia "nascimentos só a partir
daqui". Por isso a expressão vai longa nas duas seções, e não curta numa e longa
na outra.*

Sem o corte, o laço ganha uma sobreposição que o autor não pediu. Com o corte e
**sem o aviso**, some em silêncio um ciclo que ele escreveu — e as duas coisas
são erradas pelo mesmo motivo.

*Achado em 18/09/2026 pelo chat do runtime Python, medindo a consequência da
linha acima. É o feitio destas coisas: uma decisão fecha um buraco e mostra o
seguinte.*

**Quantos nascimentos tem uma volta.** Uma volta traz os índices `0 <= i < E(D)`,
e a volta de trás é a mesma lista com `t_i` deslocado de `−D`. Com `E(D)` inteiro
a emenda é perfeita: o último nascimento de uma volta e o primeiro da seguinte
ficam a `1/rate` um do outro, como todos os outros.

Com `E(D)` **não** inteiro eles ficam mais perto que `1/rate` — sobra um pedaço
de volta menor que uma vaga. É o preço da emenda, e não há como não pagá-lo sem
guardar estado. Escrito aqui porque a conta é conhecida e ninguém deve
descobri-la sozinho; o caso P-003 usa `E(D)` inteiro **de propósito**, e o de
`E(D)` fracionário fica para um caso próprio quando alguém precisar dele.

Esta linha nasceu de escrever o P-003 (18/09/2026): a spec não dizia quantos
nascimentos uma volta tem, e dois leitores teriam adivinhado diferente. É a
regra de empate funcionando antes de custar um caso.

Em `prewarm`, os índices são **negativos** e nascem com a taxa da primeira chave.
O hash aceita índice negativo (§3.2): `acaso(42, 0, −3, 0) = 0.5181800723075867`.

`prewarm` só vale com `looping: false`. Com `looping: true` ele é ignorado (o laço
já preenche), e o leitor **DEVERIA** avisar uma vez.

---

## 7. Limite de vivas, espaço, e o fallback

### 7.1 Limite de vivas, sem estado

Unity e Godot **bloqueiam o nascimento** quando lotou. Isso é estado: quem nasce
passa a depender de quem estava vivo antes.

Aqui: **desenha as `maxParticles` mais novas vivas.**

```
vivas = todas com t_i <= t < t_i + life_i
ordenar por (t_i decrescente, fluxo crescente, índice decrescente)
desenhar as primeiras maxParticles
```

O preço, escrito: com limite baixo, uma partícula velha some de repente. O leitor
que corta **DEVERIA** avisar uma vez; o editor diz quantas ("12 partículas
cortadas neste quadro").

**São DUAS etapas, e a ordem entre elas é normativa.** O corte e a ordem de
desenho são coisas diferentes, decididas em seções diferentes, e fazê-las na
ordem errada muda quem aparece na tela:

```
1. cortar:   as maxParticles MAIS NOVAS          // §7.1 — sempre, em qualquer sortMode
2. ordenar:  a ordem de desenho do sortMode      // §9.9
```

**Cortar depois de inverter guardaria as mais VELHAS** — e o defeito só aparece
quando `oldestInFront` e um `maxParticles` apertado andam juntos, que é
exatamente o par que ninguém testa. O `sortMode` decide **de que ponta a lista
começa**, nunca **quem fica**.

**E `oldestInFront` inverte a lista INTEIRA** — normativo, e em símbolos:

```
oldestInFront = reverse(youngestInFront)
```

O desempate vai junto: `(t_i, fluxo, índice)` inverte nos **três**. Não é uma
ordenação nova com critérios próprios. *"In front"* diz de que ponta a lista
começa, e mais nada — se só o `t_i` invertesse e o `fluxo` continuasse crescente,
duas partículas nascidas no **mesmo instante** trocariam de lugar entre os dois
modos sem motivo nenhum.

*Escrita em 18/09/2026. O caso P-014 prova o campo com **um fluxo só**, de
propósito, porque foi escrito antes desta linha: ele não depende dela, e
continua valendo depois dela.*

### 7.2 Espaço

> **Desde 04/10/2026:** "a matriz do osso", aqui e em toda a extensão, é a
> **matriz do emissor**, `M_emissor = M_osso × T(x, y) · R(rotation)` — a
> §9.10 **desta extensão** (não a §9.10 da spec, que é a pose). Com os três
> campos ausentes, as duas são a mesma.

| `space` | A conta |
|:---|:---|
| `"local"` | Tudo no referencial do osso. Em `t`, multiplica pela matriz de mundo do osso **em `t`**. O efeito anda junto, rígido |
| `"world"` | `p0` e `v0` são levados ao espaço do esqueleto pela matriz do osso **em `t_i`**. Depois a partícula segue sozinha. `g` fica no espaço do esqueleto. **Malha e caminho** (`shape: "mesh"`, `"path"`): o ponto deles nasce no esqueleto, e por isso **primeiro volta** ao referencial do emissor pela inversa da mesma matriz (§9.4.2, passo 7); esta linha o leva de volta, e ele cai em cima da malha ou do caminho. Ninguém o leva ao esqueleto duas vezes |

A matriz em `t_i` vem de `Pose(esqueleto, animação, t_i)` (§9.10 da spec). É função
pura. Um runtime **PODE** guardar em cache por `t_i` exato: cache não muda
resultado.

**O que a matriz do osso leva junto, e em que instante** — a tabela que faltava,
escrita ao redigir o caso P-006 (18/09/2026), porque sem ela dois leitores
adivinhariam diferente:

| O quê | `space: "local"` | `space: "world"` |
|:---|:---|:---|
| `p0` e `v0` | ficam no referencial do osso | vão ao espaço do esqueleto pela matriz em **`t_i`** |
| A posição desenhada | `p(a)` multiplicada pela matriz do osso em **`t`** | `p(a)`, que já está no espaço do esqueleto |
| O ângulo | `θ(a)` mais a rotação do osso em **`t`** | `θ(a)` mais a rotação do osso em **`t_i`** |
| `gravity` | no referencial do osso | no espaço do esqueleto |
| A escala | multiplica a escala do osso em **`t`** | multiplica a escala do osso em **`t_i`** |

Numa palavra: em `local` o osso continua mandando na partícula depois de ela
nascer; em `world` ele a solta no instante do nascimento e nunca mais a toca.

Três cuidados:

1. **"Mundo" no arquivo é o espaço do esqueleto.** O jogo move o personagem por
   fora; o arquivo não conhece isso. Um runtime de jogo **PODE** compor com a
   matriz do objeto em `t_i` se tiver o histórico — e isso fica **fora** da
   conformidade.
2. **Custo:** uma pose por nascimento. O editor avisa se passar de um teto
   (256 poses por quadro).
3. **Osso com `physics` (§6.5 da spec):** a pose em `t_i` herda a regra de `dt`
   fixo da física. Continua determinístico, mas caro.

### 7.3 O fallback — o que um leitor sem P faz

Esta é a parte que a §2.7 da spec **exige** de toda extensão, e ela vale mesmo
que o autor do arquivo esqueça de tudo o mais.

| Leitor | Faz |
|:---|:---|
| **Sem P** | Trata o placeholder como **vazio** (é o fallback de `attachment.type` desconhecido, §2.5 da spec) **e avisa uma vez**, nomeando o emissor e o slot: `emissor de partículas ignorado: "fumaca" no slot "boca"` |
| Com P, campo desconhecido | Ignora o campo (§2.5). Preserva em regravação (§2.6) |
| Com P, `shape` desconhecida | **Não desenha o emissor.** Avisa uma vez. Cair para `point` seria palpite silencioso |
| Com P, `rate` com Bézier | Usa `linear`. Avisa (L2) |
| Com P, blend fora da §7.12 | `normal`. Avisa (já é regra da §7.12) |

O aviso **não é opcional na prática**: um emissor que some calado é a regra 21 da
casa (*"onde o programa não entende, ele avisa — não improvisa"*). O leitor que
não avisa passa nos casos de conformidade e engana o usuário.

### 7.4 Linhas novas para a tabela da §2.5 da spec

| Onde | Valor desconhecido | Leitor faz |
|:---|:---|:---|
| `BONE_particle.shape` | Forma desconhecida | **Não desenha o emissor.** Avisa uma vez |
| `BONE_particle.space` | Valor desconhecido | Usa `"local"`. Avisa |
| `BONE_particle.sortMode` | Valor desconhecido | Usa `"youngestInFront"`. Avisa |
| `BONE_particle.frameMode` | Valor desconhecido | Usa `"lifetime"`. Avisa |
| `BONE_particle.meshMode` | Valor desconhecido | Usa `"vertex"`. Avisa |

`shape` é a única que **não** cai para um padrão, e a diferença é de propósito:
uma forma desconhecida mudaria o desenho inteiro, e inventar um ponto na origem
seria um palpite que o usuário não tem como notar. As outras quatro têm padrão
declarado e só mudam um detalhe.

---

## 8. Onde está: a conta fechada

Arrasto linear `k` (1/s), gravidade `g` (px/s²), velocidade inicial `v0`, posição
inicial `p0`, idade `a`:

```
a equação:  v' = g − k·v

se k < 0.00001:
    p(a) = p0 + v0·a + ½·g·a²
    v(a) = v0 + g·a
senão:
    F    = −expm1(−k·a) / k            // = (1 − e^(−k·a)) / k, sem perder precisão
    p(a) = p0 + (g/k)·a + (v0 − g/k)·F
    v(a) = g/k + (v0 − g/k)·e^(−k·a)
```

`expm1` existe em JS (`Math.expm1`), Python (`math.expm1`) e C (`expm1`). O
limiar `0.00001` é o da §3.6 da spec, e o runtime **DEVE** usar exatamente esse
número.

Rotação: `θ(a) = angle_i + angularVelocity_i · a`, em graus.

`v(a)` só é usada por `alignToVelocity`.

---

## 9. Os campos

Convenções da spec valem: Y para cima, graus anti-horário, `0` aponta para `+X`,
segundos, px (§3.1).

**Dois sentidos de "animável":**

| Marca | Sentido |
|:---:|:---|
| **N** | Animável, lido **no nascimento** `t_i`. Fica congelado na partícula |
| **T** | Animável, lido **em `t`**. Vale para todas as vivas de uma vez |
| **I** | Animável por integral (só `rate`; **2ª fase**, em serviço desde a 1.2, §4.2) |
| não | Fixo no anexo |

Campo animável entra numa timeline prefixada:

```json
{ "type": "BONE_particle", "target": "<slot>", "skin": "default",
  "attachment": "<placeholder>", "property": "<campo>", "keys": [...] }
```

Uma faixa `[min, max]` anima como valor de 2 componentes (§9.3 da spec, `C = 2`).
Um leitor sem a extensão ignora a timeline (é o fallback de `timeline.type`
desconhecido, §2.5 da spec) — e é por isso que o tipo da timeline também é
prefixado.

### 9.1 Emissão

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `emitting` | boolean | **N** (`stepped`) | `true` | Desligado zera a taxa efetiva. As já nascidas continuam vivas |
| `rate` | number, partículas/s, `>= 0` | I (**1.2**) | `10` | Animável por integral (§4.2). Chave `linear` ou `stepped`; Bézier vira `linear` com aviso. Com timeline, o número do anexo não vale |
| `bursts` | lista de `{time, count, cycles, interval, probability}` | não | `[]` | §4.3 |
| `explosiveness` | number 0..1 | não | `0` | §4.4. A janela é `duration` |
| `duration` | number, s, `> 0` | não | `1` | **Só** para `explosiveness`. O laço usa a duração da animação (§6) |
| `randomness` | number 0..1 | não | `0` | §4.4. Canal 10 |
| `startDelay` | number, s, `>= 0` | não | `0` | Nascimentos só a partir daqui — **do emissor inteiro**, taxa **e** rajada. Está por extenso nas contas da §4.2, da §4.3 e do corte da §6. Desloca **nascimento**, nunca **chave**: a §4.1 dá a régua |

Campos de uma rajada: `time` (s, `>= 0`), `count` (integer `>= 1`, padrão `1`),
`cycles` (integer `>= 1`, padrão `1`), `interval` (s, `> 0`, padrão `1`),
`probability` (0..1, padrão `1`).

### 9.2 Vida e teto

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `lifetime` | `[min, max]`, s, `> 0` | **não** | `[1, 1]` | Canal 0. Não animável: o `max` define a janela (§5) |
| `maxParticles` | integer `>= 1` | não | `1000` | §7.1. Teto do formato: **10 000** (§10) |

### 9.3 Velocidade, direção, abertura

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `speed` | `[min, max]`, px/s | N | `[100, 100]` | Canal 1. Escalar; a direção vem à parte |
| `direction` | number, graus | N | `90` (para cima) | Ângulo em vez de vetor: segue a §3.1 e anima com uma curva só |
| `spread` | number, graus, 0..180 | N | `0` | **Meia**-abertura, em volta da **base misturada** (§9.3.1). Com `spherizeDirection: 0`: `θ = direction + spread·(2·u2 − 1)` |
| `spherizeDirection` | number 0..1 | não | `0` | `0` usa `direction`; `1` sai para fora do centro da forma. Mistura de ângulos pelo **caminho curto**. A ordem contra o `spread` é normativa: §9.3.1 |
| `alignToVelocity` | boolean | não | `false` | Usa `v(a)` (§8). Soma `angle` por cima |

#### 9.3.1 A ordem: mistura primeiro, leque depois — normativo

`spherizeDirection` e `spread` são duas coisas que mexem no mesmo ângulo, e a
ordem entre elas muda o desenho. A ordem é esta, e não a outra:

```
1. base = mistura(direction, ângulo_de_saída_da_forma, spherizeDirection)
          // caminho curto entre os dois ângulos
2. θ    = base + spread·(2·u2 − 1)
```

**Primeiro mistura, depois abre o leque em volta da base misturada.**

**Por quê.** `spread` é **meia-abertura**, e meia-abertura se mede em volta da
direção que vale. Na ordem contrária — abrir o leque em volta de `direction` e
só então misturar — a mistura puxa as duas pontas do leque para o mesmo lugar, e
**o leque encolhe por `(1 − spherizeDirection)`** sem ninguém ter pedido: com
`spherizeDirection: 1` ele fecha de vez, e todas as partículas saem no mesmo
ângulo por mais que o autor tenha aberto o `spread`. Isso é efeito colateral que
esta spec não pede e que ninguém descobriria sem medir.

Com `spherizeDirection: 0` as duas ordens dão o mesmo resultado — é por isso que
nenhum dos oito casos as separa, e é por isso que esta linha precisava existir.

*Escrita em 18/09/2026, do confronto dos dois runtimes. Só um dos dois levantou
a escolha, e **foi o que perdeu** que trouxe o argumento acima.*

### 9.4 Forma do emissor

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `shape` | `point`, `circle`, `rectangle`, `edge`, `bone`, `mesh`, `path` | não | `"point"` | Desconhecida: **não desenha e avisa** (§7.4). `path` é da **1.1** |
| `radius` | number, px, `>= 0` | N | `0` | `circle` |
| `radiusThickness` | number 0..1 | N | `1` | `0` só a borda, `1` disco cheio. Área uniforme: `r = R·sqrt((1−T)² + u3·(1 − (1−T)²))` |
| `arc` | number, graus | N | `360` | `φ = u4 · arc`, a partir de `+X` do osso |
| `size` | `[w, h]`, px, medida **inteira** | N | `[0, 0]` | `rectangle`: `p0 = ((u3 − ½)·w, (u4 − ½)·h)` |
| `edge` | `[x0, y0, x1, y1]`, px | N | `[0,0,0,0]` | `p0 = lerp(a, b, u3)` |
| `mesh` | string | não | — | `shape: "mesh"`: o placeholder de um `mesh` **do mesmo slot**. Exige nível B |
| `meshMode` | `vertex`, `edge`, `triangle` | não | `"vertex"` | Vértices deformados **em `t_i`** (pose + deform). As contas de `edge` e `triangle` são normativas: §9.4.1 |
| `curve` | string, `"<slot>/<placeholder>"` | não | — | **1.1.** `shape: "path"`: um anexo `path` (§7.8 da spec) de **qualquer** slot. O slot é o que vem **antes da primeira barra**; o placeholder é o resto, e pode ter barra. A conta: §9.4.2. Caminho com pesos exige nível B |

`shape: "path"` — **ao longo de um caminho** — nasce sobre uma curva Bézier do
arquivo, espalhada por igual no **comprimento**. O nome do campo é `curve`, e não
`path`: `path` já é a imagem da partícula (§9.8).

`shape: "bone"` não tem campos: é o `edge` de `(0,0)` a `(length, 0)` do próprio
osso, com o comprimento lido em `t_i`. É palavra nova — nenhum dos três programas
de referência tem osso.

#### 9.4.1 `meshMode`: as contas, por extenso — normativo

Esta seção dizia *"ponto uniforme (canais 3, 4)"* e não escrevia a conta. **Não
é uma conta só:** há duas usuais, e elas dão pontos **diferentes** para os
mesmos dois `u`. Dois runtimes independentes leram isto e um implementou uma
delas enquanto o outro se recusou a escolher — com razão, os dois. Quem estava
errada era esta spec.

**`meshMode: "vertex"`** — sorteia um vértice, uniforme, pelo canal 12:

```
v  = floor(u12 · N)          // N = número de vértices; u12 = acaso(seed, fluxo, i, 12)
p0 = posição deformada do vértice v em t_i
```

**`meshMode: "edge"`** — sorteia uma **aresta única da triangulação**, uniforme
pelo canal 12, e um ponto ao longo dela pelo canal 3:

```
arestas = pares (a, b) com a < b, tirados de `triangles`, SEM repetir
          // cada triângulo dá três pares; a aresta partilhada por dois
          // triângulos entra UMA vez. Ordenadas pelo par (a, b) crescente.
e  = floor(u12 · M)          // M = número de arestas únicas
p0 = lerp(vértice a, vértice b, u3)      // deformados em t_i
```

**A lista é a da triangulação, e NUNCA o campo `edges` da malha.** A §7 do
formato diz o que `edges` é: *"Pares de índices. **Só editor.**"*, opcional, com
padrão `[]`. Um emissor amarrado a ele **não emitiria nada** num arquivo normal
— e sem motivo visível para quem usa, que é a pior espécie de silêncio. A
triangulação, ao contrário, existe em toda malha por obrigação.

**`meshMode: "triangle"`** — sorteia um triângulo por **área acumulada**, pelo
canal 12, e um ponto uniforme dentro dele pelos canais 3 e 4:

```
t  = triângulo escolhido por busca na soma acumulada das áreas, com u12
     // áreas em t_i, já deformadas; assim triângulo grande recebe mais
s  = u3
w  = u4
se s + w > 1:                 // DOBRAR
    s = 1 − s
    w = 1 − w
p0 = A + s·(B − A) + w·(C − A)
```

**Por que a de dobrar, e não a da raiz quadrada.** A outra fórmula usual é
`s = 1 − sqrt(u3)`, `w = u4·sqrt(u3)`. As duas dão distribuição uniforme; as
duas são defensáveis; e elas **não dão o mesmo ponto** para os mesmos dois `u`.
A escolha é a de dobrar porque ela gasta **os dois canais que esta seção já
nomeia** (3 e 4) e não chama uma raiz quadrada que esta seção não pede — é a que
se encaixa no que já estava escrito. Não é "mais certa": é a que ficou, e agora
está escrita para não ser adivinhada.

*Escrita em 18/09/2026, do confronto dos dois runtimes.*

#### 9.4.2 `shape: "path"`: a conta, por extenso — normativo (1.1)

*Acrescentada em 05/10/2026 (rodada 16). Decisão do Humberto: a forma "ao longo
de um caminho".*

**De onde vem o caminho.** `curve` é `"<slot>/<placeholder>"`. O slot é o texto
**antes da primeira barra**; o placeholder é **todo o resto** (pode ter barra). O
anexo é procurado nas peles como qualquer placeholder (§4.4 da spec), **seja qual
for o anexo que o slot mostra**: um caminho nunca é desenhado. Tem de ser um
anexo `path` (§7.8 da spec) com `K >= 2` âncoras.

```
1. W  = os 3K pontos do caminho em t_i, no espaço do esqueleto:
        o osso do slot DO CAMINHO em t_i, e o deform desse anexo nesse slot
        em t_i (§9.10 da spec) — a mesma régua da malha
2. as curvas: aberto, K − 1; fechado, K — a última liga a âncora K−1 à 0,
        com a alça de saída de K−1 e a de chegada de 0 (§6.4 da spec)
3. a poligonal: cada curva em 10 segmentos, nos pontos B(t), t = 0, 0.1 … 1
        B(t) = (1−t)³A + 3(1−t)²t·H1 + 3(1−t)t²·H2 + t³C
        (a mesma régua de comprimento da §6.4 da spec)
4. L_k   = comprimento reto de cada segmento, na ordem do caminho
   total = soma dos L_k, nesta ordem               // fechado inclui a curva que volta
5. s  = u3 · total                                  // u3 = acaso(seed, fluxo, i, 3)
6. p0 = o ponto a s do começo, NA POLIGONAL:
        achar o primeiro segmento k com acc_k + L_k >= s   (acc_k = soma dos anteriores;
        segmento de comprimento zero é pulado)
        p0 = lerp(início_k, fim_k, (s − acc_k) / L_k)
        total = 0: p0 = a primeira âncora
7. p0 volta ao referencial do EMISSOR pela inversa de M_emissor(t_i),
   NOS DOIS ESPAÇOS. Daí em diante é um p0 como o de qualquer forma:
   - spherizeDirection mede atan2(p0) neste p0, a partir da origem do emissor
   - space "local": vai pela M_emissor(t)  (§7.2)
   - space "world": vai ao esqueleto pela M_emissor(t_i)  (§7.2) — e cai de
     volta EM CIMA do caminho. O ponto entra no esqueleto uma vez só
```

| Regra | Por quê |
|:---|:---|
| **Sempre por comprimento.** `constantSpeed` e `lengths` do caminho são **ignorados** | A partícula se espalha por igual na curva. Com `t` uniforme ela junta onde as alças estão perto da âncora |
| **A poligonal de 10 segmentos**, e não o comprimento exato | É a régua que a §6.4 da spec já usa. Dois leitores que medissem "o comprimento de verdade" com passos diferentes dariam pontos diferentes: numa curva de 300 px, o exato e os 10 segmentos ficam a ~0,7 px um do outro (o P-024) |
| **Lido em `t_i`** | Função pura do tempo, como a malha. Caminho animado (osso ou deform) muda **onde nascem as novas**; as já nascidas não pulam |
| O caminho pode ser de **outro slot** | Um slot mostra um anexo de cada vez, e o caminho costuma morar no slot dele |
| `direction`, `spread`, `spherizeDirection` | Iguais às outras formas: no referencial do emissor. O "centro da forma" do `spherizeDirection` é a **origem do emissor**, e o ângulo é o do `p0` **já trazido** ao referencial do emissor (passo 7) — nos dois espaços. **Nunca** o ângulo do ponto no esqueleto: com o emissor girado ou deslocado, os dois dão direções diferentes (o P-026) |
| Canais | Só o **3**. O 4 e o 12 não são usados |

| Quando não dá | Leitor faz |
|:---|:---|
| `curve` ausente, slot ou placeholder que não existe, anexo que não é `path`, `K < 2` | **Não desenha o emissor e avisa uma vez** (regra 21 da casa; como a forma desconhecida, §7.4). Nunca cai para `point` |
| Caminho com pesos (`binding`) num leitor sem o nível B | Mesma coisa: não desenha e avisa |

**O leitor 1.0 e um arquivo 1.1.** Para um leitor de P 1.0, `"path"` é forma
desconhecida: ele **não desenha o emissor e avisa** (§7.3, §7.4). Ninguém desenha
errado calado. O validador 1.0 recusa `"path"` pelo `enum` (L1): custo aceito.

Os casos P-021 a P-026 provam esta seção (§14).

### 9.5 Forças

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `gravity` | `[x, y]`, px/s² | N | `[0, 0]` | **Padrão zero**: nada cai sem o autor pedir. Em `world`, no espaço do esqueleto |
| `drag` | number, 1/s, `>= 0` | N | `0` | **Linear**: `v' = −k·v` |

**Nota honesta sobre o N nas forças:** a gravidade animada é lida no nascimento.
Uma chave que muda a gravidade **não** entorta as partículas já no ar. É o preço
da conta fechada, e está escrito para ninguém descobrir sozinho.

### 9.6 Rotação e tamanho

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `angle` | `[min, max]`, graus | N | `[0, 0]` | Canal 5 |
| `angularVelocity` | `[min, max]`, graus/s | N | `[0, 0]` | Canal 6. Constante na vida |
| `scale` | `[min, max]`, fator da imagem | N | `[1, 1]` | Canal 7. Fator, como `region.scaleX` (§7.3 da spec) |
| `scaleOverLifetime` | chaves `{time, value, curve}`, `time` em **0..1 da vida** | não | ausente = `1` | Reusa a §9.2–9.3 da spec inteira; só troca segundos por `a / life_i` |

### 9.7 Cor

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `startColor` | `[color4, color4]` | N | `[[1,1,1,1],[1,1,1,1]]` | Canal 8. **Uma só `u`** para os 4 componentes: `lerp(c1, c2, u8)` |
| `colorOverLifetime` | chaves de `color4`, `time` 0..1 da vida | não | ausente = branco | É o gradiente. Mesmo formato de chave da §9.2 da spec |
| `alphaOverLifetime` | chaves de number 0..1, `time` 0..1 da vida | não | ausente = `1` | Multiplica o alfa do gradiente |

```
cor_particula = startColor_i × colorOverLifetime(a/life) × (1,1,1, alphaOverLifetime(a/life))
light         = slot.color × attachment.color × cor_particula   // slot e attachment lidos em t
```

Depois é **exatamente** a fórmula da §7.12 da spec, com o `darkColor` do slot.
Nenhuma regra de cor nova.

### 9.8 Imagem e folha de quadros

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `path` | string, região do atlas (§7.2, §2.8 da spec) | não | o nome do placeholder | Mesmo `path` de `region` |
| `sequence` | objeto `Sequence` da §7.10 da spec | não | ausente | Reusa a §7.10 inteira. Sem grade: lista de regiões do atlas |
| `frameMode` | `"lifetime"` ou `"fps"` | não | `"lifetime"` | |
| `cycles` | number, `> 0` | não | `1` | `lifetime`: `k = floor((a/life)·cycles·n + 0.00001) mod n` |
| `fps` | number, `> 0` | não | `12` | `fps`: `k = floor(a·fps + 0.00001) mod n` |
| `startFrame` | `[min, max]`, índice | N | `[0, 0]` | Canal 9. `floor(lerp) mod n`, somado a `k` |

O guarda `+ 0.00001` é o mesmo da §9.6 da spec.

### 9.9 Mistura, espaço, semente, laço, ordem

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| **mistura** | — | — | — | **Não existe campo.** O emissor usa o `blend` do slot, como todo anexo (§7.12 da spec). Fumaça aditiva mora num slot aditivo |
| `space` | `"local"` ou `"world"` | não | `"local"` | §7.2. Padrão `local`: não exige pose em `t_i` |
| `seed` | integer 0..4294967295 | não | `0` | **Sempre fixa.** Não existe semente automática (§3.4). `0` é semente válida |
| `looping` | boolean | não | `true` | §6 |
| `prewarm` | number, s, `>= 0` | não | `0` | §6. Só com `looping: false` |
| `sortMode` | `"youngestInFront"` ou `"oldestInFront"` | não | `"youngestInFront"` | Empate: `(t_i, fluxo, índice)`. `oldestInFront = reverse(youngestInFront)`, os três critérios juntos — e ele **não** muda quem é cortado: §7.1 |

Entre anexos, o emissor inteiro desenha na posição do seu slot na `drawOrder`
(§9.5 da spec). O `clipping` vale como para qualquer anexo.

**A semente, escrita com exemplo porque a documentação errada do Godot custou
caro a muita gente:** ela é **uma por emissor**. Duplicar um emissor **DEVE** dar
semente nova — é o defeito do Unity, e é o que faz duas fogueiras lado a lado
parecerem a mesma fogueira. Isso é regra de **editor**, não de leitor: um leitor
só lê o número que está no arquivo.

### 9.10 Onde o emissor está: `x`, `y`, `rotation` — normativo

*Acrescentada em 04/10/2026 (rodada 15). Decisão do Humberto: o emissor ganha
posição e giro próprios, **como a imagem**.*

| Campo | Tipo e unidade | Animável | Padrão | Observação |
|:---|:---|:---:|:---|:---|
| `x` | number, px | não | `0` | Origem do emissor no espaço local do osso do slot, como `region.x` (§7.3 da spec) |
| `y` | number, px | não | `0` | |
| `rotation` | number, graus, anti-horário | não | `0` | Gira o referencial do emissor |

**A matriz do emissor:**

```
M_emissor = M_osso × T(x, y) · R(rotation)
```

É a mesma ordem da imagem (§7.3 da spec: `T(x,y) · R(rotation) · S`, depois o
osso), **sem a escala**: o emissor não tem `scaleX` nem `scaleY`.

**A regra, uma só: em TODO lugar desta extensão onde se lê "a matriz do osso",
lê-se `M_emissor`.** São a §7.2 (as duas colunas, `local` e `world`, nos
instantes `t` e `t_i` de sempre), a §8, a §9.4 e a §14.1 (o ângulo é o da
rotação de `M_emissor`, e a escala do dump é `hypot(a, c)` de `M_emissor`).
Nada mais muda: os instantes, o acaso, as contas fechadas são os mesmos.

**Com `x = y = rotation = 0`, `M_emissor = M_osso`**, e um arquivo sem os três
campos desenha **exatamente** o que desenhava antes: nenhum caso muda de número.

As consequências, escritas porque são a primeira coisa que alguém estranha:

| O quê | Onde fica |
|:---|:---|
| `direction`, `spread`, as formas `point`, `circle`, `rectangle`, `edge` | no referencial do **emissor**: girar o emissor gira o jato |
| `gravity` em `space: "local"` | no referencial do **emissor**, como antes ficava no do osso: **girar o emissor gira a gravidade local**. Quem quer a gravidade parada no mundo usa `space: "world"`, onde ela fica no espaço do esqueleto (§7.2) |
| `shape: "bone"` | o segmento `(0,0)` → `(comprimento, 0)` no referencial do **emissor**. Com `x = y = rotation = 0` ele está em cima do osso; **deslocado ou girado, ele sai de cima do osso** e vai junto com o emissor. O comprimento continua o do osso, lido em `t_i` |
| `shape: "mesh"` | continua **sobre a malha**: os vértices vêm no espaço do esqueleto e voltam pela inversa de `M_emissor(t_i)` — **nos dois espaços** desde 05/10/2026 (§9.4.2, passo 7; antes o texto dizia só `local`, e em `world` um leitor levava o ponto ao esqueleto duas vezes); o ponto cai no mesmo lugar da malha. O que o emissor gira é a direção |

**Por que não animável.** O emissor animado se move pelo osso dele. O editor
cria um osso só do emissor para as chaves, como faz com a imagem; o arquivo
não ganha timeline nova.

Os casos P-018 (`x`, `y` num osso girado), P-019 (`rotation` num osso de escala
não uniforme, com gravidade local) e P-020 (`space: "world"` com o osso andando
entre os nascimentos) provam a §9.10.

---

## 10. O nível P, e os limites

Partícula **não entra na escada A → B → C** da spec. É um **módulo lateral: P**,
que exige o nível A.

| O quê | Exige também |
|:---|:---|
| `shape: "mesh"` | nível **B** (é preciso deformar a malha em `t_i`) |
| `shape: "path"` com caminho de pesos | nível **B** (os pontos vêm do `binding`). Sem pesos, só A + P |
| `space: "world"` | nível **C** se o osso do slot estiver sob constraints |

Um leitor **PODE** declarar "A + P" ou "C + P". Um leitor que declara P **DEVE**
reproduzir os cinco números de referência da §3.2 e passar os casos P-001 a P-008.

**Limites (§12.6 da spec):**

| Item | Máximo |
|:---|---:|
| `maxParticles` por emissor | 10 000 |
| `rate × lifetime.max` (vivas esperadas) | 10 000 — acima é L2 `LIMIT_PARTICLE_COUNT` |
| Rajadas por emissor | 1024 |
| `cycles` de uma rajada | 1 048 576 |
| Poses por quadro em `space: "world"` (aviso do editor) | 256 |

---

## 11. O validador

| Código | Nível | Quando |
|:---|:---:|:---|
| `RANGE_PARTICLE_MINMAX` | L1 | `min > max` em qualquer faixa (`lifetime`, `speed`, `angle`, `angularVelocity`, `scale`, `startFrame`) |
| `RANGE_PARTICLE_RATE` | L1 | `rate` negativo (no anexo ou em qualquer chave) |
| `RANGE_PARTICLE_RATE_CURVE` | L2 | Bézier numa chave de `rate` |
| `REF_PARTICLE_MESH` | L1 | `mesh` não aponta para um anexo `mesh` do **mesmo slot** |
| `REF_PARTICLE_CURVE` | L1 | **1.1.** `shape: "path"` e `curve` não aponta para um anexo `path` (`"<slot>/<placeholder>"`, §9.4.2) |
| `LIMIT_PARTICLE_COUNT` | L2 | `rate × lifetime.max` passa do teto da §10 |

Mais o que a §2.7 da spec já manda e agora é conferido: a extensão aparece num
`type` prefixado e **não** está em `extensionsUsed` → L1.

---

## 12. O que fica de fora, com o nome certo

| Limite | Nome nas ferramentas | Por que sai |
|:---|:---|:---|
| Colisão | `collision_mode` (Godot), Collision (Effekseer) | Depende de onde a partícula estava a cada passo. Sem conta fechada |
| Sub-emissor por colisão | `sub_emitter_mode` AT_COLLISION | Depende da colisão |
| Força que depende da posição | `radial_accel`, `tangential_accel`, `orbit_velocity`; Vortex, Attraction | Vira equação diferencial sem solução fechada |
| Aceleração na direção da velocidade | `linear_accel` | Com gravidade junto, sem forma fechada |
| Turbulência como campo de força | `turbulence_*`; Noise (Unity) | O ruído é lido na posição **atual**, que depende do ruído anterior. Estado |
| Taxa por distância | Rate over Distance (Unity) | Exige o comprimento do caminho do osso: integral numérica |
| Herdar velocidade do emissor | `inherit_velocity_ratio`; Emitter Velocity | A derivada da pose com constraints não tem conta fechada |
| Semente automática | `use_fixed_seed = false`; Auto Random Seed | É exatamente o que a régua proíbe |
| Pausar fora da tela | Culling Mode | Pausa é estado |
| Mundo do jogo | Simulation Space: World | O arquivo só conhece o espaço do esqueleto (§7.2) |

**Cabe na régua, adiado só por tamanho:** sub-emissor no nascimento e na morte
(a morte é `t_i + life_i`, número conhecido), rastro (`p(a − j·Δ)`), aceleração
angular, quadro por velocidade, e o ruído de deslocamento dos canais 13–15.
Nenhum deles entra nesta versão.

**A 1ª fase, e o que fica para a 2ª:**

| 1ª fase (esta versão) | 2ª fase |
|:---|:---|
| Taxa liga/desliga (`emitting` animável, `rate` fixo) | `rate` animável por integral (o ramo `linear` da §4.2) — **em serviço desde a 1.2 (05/11/2026)** |
| Uma semente por emissor; duplicar dá semente nova | "manter a semente" como gesto do editor |
| Mistura só pelo slot | — |
| Gravidade padrão zero | — |
| — | sub-emissor, rastro, ruído |
| Nenhum campo de efeito novo | grupo como imagem, mais misturas, UV, dissolve, distorção |

---

## 13. Exemplo

```json
{
  "bone": { "version": "1.1" },
  "extensionsUsed": ["BONE_particles"],
  "skins": [{
    "name": "default",
    "attachments": {
      "cachimbo_fumaca": {
        "fumaca": {
          "type": "BONE_particle",
          "path": "fx/fumaca",
          "seed": 42,
          "rate": 20,
          "lifetime": [1, 1.5],
          "maxParticles": 200,
          "looping": true,
          "shape": "circle",
          "radius": 10,
          "speed": [100, 150],
          "direction": 90,
          "spread": 30,
          "gravity": [0, -200],
          "drag": 0.5,
          "angle": [0, 360],
          "angularVelocity": [-90, 90],
          "scale": [0.5, 1],
          "scaleOverLifetime": [
            { "time": 0, "value": 0.2 },
            { "time": 1, "value": 1.5 }
          ],
          "colorOverLifetime": [
            { "time": 0,   "value": [1, 1, 1, 0] },
            { "time": 0.1, "value": [1, 1, 1, 0.8] },
            { "time": 1,   "value": [0.6, 0.6, 0.6, 0] }
          ],
          "space": "world",
          "sortMode": "youngestInFront"
        }
      }
    }
  }],
  "animations": [{
    "name": "fumar",
    "timelines": [{
      "type": "BONE_particle", "target": "cachimbo_fumaca", "skin": "default",
      "attachment": "fumaca", "property": "emitting",
      "keys": [
        { "time": 0,   "value": true,  "curve": "stepped" },
        { "time": 1.5, "value": false, "curve": "stepped" }
      ]
    }]
  }]
}
```

O slot `cachimbo_fumaca` tem `"blend": "screen"` na lista de slots (§7.12 da
spec). **Nenhum campo de mistura no emissor.**

---

## 14. Casos de conformidade

Um caso nasce em `conformidade/casos-pendentes/` e só entra em
`conformidade/casos/` quando **três fontes independentes** dão o mesmo número: a
implementação de referência que escreveu o caso, o runtime TypeScript e o
runtime Python. Quem o move é o Planejador, nunca o executor.

**Dezesseis entraram em `casos/` em 18/09/2026. O P-002 não — até 05/11/2026.**

> **05/11/2026: o P-002 entrou.** A 2ª fase de `rate` abriu (versão 1.2), o
> `esperado.json` foi preenchido por uma conta à parte — 8, 21 e 33 vivas em
> `t = 0.6`, `1` e `1.31` —, os dois runtimes passaram e o confronto bateu. Agora
> um runtime sem a rampa dá zero partículas e **reprova**. Entraram junto o
> **P-030** (rampa cortada pela torneira, e `rate` + `emitting` no mesmo
> emissor) e o **P-031** (dois emissores no mesmo slot, cada um com a sua
> torneira), e o **P-032** (`space` e `sortMode` desconhecidos caem no padrão
> da §7.4). A suíte passa a dizer **`P: 32/32`**. A história abaixo fica como
> estava.

> **Por que o P-002 fica de fora.** Ele é o único de **2ª fase**, e o
> `esperado.json` dele traz uma lista **vazia** de propósito. Um runtime de 1ª
> fase lê `rate: 0` no anexo, não implementa a timeline de `rate`, produz zero
> partículas — e **passa**. **Ele passa sem exercitar nada.**
>
> Ele chegou a entrar em `casos/` em 18/09/2026 e foi **devolvido no mesmo dia**,
> porque um `P: 17/17` valendo dezesseis provas e um caso mudo é um número que
> mente. A suíte diz **`P: 16/16`**, e é verdade.

**Em 04/10/2026 entraram mais três**, P-018, P-019 e P-020, da §9.10 (`x`, `y`
e `rotation` do emissor): os números foram calculados à mão antes do código, e
os dois runtimes bateram com eles. A suíte passa a dizer **`P: 19/19`**.
>
> Ele volta quando a 2ª fase abrir: o ramo `linear` da §4.2 em serviço, `rate`
> animável, e o `esperado.json` preenchido com a conta que o leiame dele já traz.
> **Quem o mover antes disso repõe o número que mente.**

| Caso | Prova |
|:---|:---|
| P-001 | Posição fechada, sem pose: os `u` de oito canais, `t_i`, vida, posição, ângulo e escala |
| P-002 | Taxa em rampa (o ramo `linear` da §4.2; **2ª fase**, em `casos/` desde 05/11/2026) |
| P-003 | Laço: `t` e `t + D` dão o mesmo quadro |
| P-004 | Pré-aquecimento: índice `−3` existe e tem o `u` de `acaso(42, 0, −3, 0)` |
| P-005 | Teto de vivas: `maxParticles 5` com 12 vivas, lista exata das 5 |
| P-006 | `space: "world"`: o osso gira 90° entre `t_i` e `t`; a partícula **não** gira junto |
| P-007 | Rajada com `probability 0.5`: lista exata de quem nasceu |
| P-008 | **Arrastar para trás:** avaliar `t = 0.9`, `0.3`, `0.9`; igual **bit a bit** ao primeiro |
| P-018 | §9.10: `x`, `y` no espaço do osso (girado 90°), e não no do esqueleto |
| P-019 | §9.10: `rotation` gira o jato e a gravidade local; a ordem é `M_osso × R`, e não `R × M_osso` |
| P-020 | §9.10 com `space: "world"`: a partícula usa `M_emissor(t_i)`, a do nascimento, com o osso andando |
| P-021 | §9.4.2: reta com alças juntas e `constantSpeed: false` — o ponto é **por comprimento**, não por `t` |
| P-022 | §9.4.2: caminho animado por `deform` — os pontos são lidos em **`t_i`**, não em `t` |
| P-023 | §9.4.2: caminho em **outro slot**, emissor deslocado — em `local`, `p0` volta pela inversa de `M_emissor(t_i)` e cai **em cima da curva** |
| P-024 | §9.4.2: uma curva de verdade — a **poligonal de 10 segmentos**, e não o comprimento exato |
| P-025 | §9.4.2: caminho **fechado** — o comprimento inclui a curva que volta |
| P-026 | §9.4.2, passo 7, em `world`: o ponto entra no esqueleto **uma vez**, e o `spherizeDirection` sai da **origem do emissor**, com o emissor girado e deslocado |
| P-030 | §4.2: a torneira corta a rampa no meio; `rate` e `emitting` do mesmo emissor são **duas** timelines |
| P-031 | §9: dois emissores no mesmo slot, cada um com a sua timeline de `emitting` — a identidade leva o `attachment` |
| P-032 | §7.4: `space` e `sortMode` desconhecidos caem em `local` e `youngestInFront` |

**Em 05/10/2026 entraram P-021 a P-026** (a forma `path`, versão 1.1): números
calculados à mão antes do código, a conta escrita no `leiame` de cada um, e as
**três** fontes batendo — a conta, o runtime TypeScript e o runtime Python (este
escrito só por esta spec e pelos `leiame`). A suíte passa a dizer **`P: 25/25`**.
O P-026 nasceu do confronto: o Python achou que o passo 7 e a §7.2 se
contradiziam em `world`, e que nenhum caso olhava o `spherizeDirection` no caminho.

**Tolerâncias: `1e-3` para todo campo sob `/particles/`, reta, e `1e-2` para
nada.** Não são as da §3.6 da spec: o ângulo de pose lá tem `1e-2`, e aqui não.
A conta e o tamanho estão na §14.2, e os dois são normativos. Os valores de `u`
são **exatos** (24 bits).

### 14.1 O que o dump mede — `measure: "particles"`

O `pose-dump` da §12.4 da spec não tinha como falar de partícula. Os oito casos
pedem uma medida nova, e é esta. **Quem a implementa em
`ferramentas/src/conformidade/` é o chat do runtime TypeScript**, e os casos são
o contrato que ele cumpre.

```json
"particles": {
  "fx/jato": [
    { "flow": 0, "index": 10, "birth": 0.5, "life": 1.041656, "age": 0,
      "x": 5.764159, "y": 4.489928, "angle": 281.419301, "scale": 0.804563 }
  ]
}
```

| Campo | O que é |
|:---|:---|
| A chave | `<slot>/<placeholder>`, o emissor **que o slot mostra** no instante. Um placeholder que o slot não mostra não é desenhado e não entra no dump (linha de 05/11/2026; o P-031 tem um) |
| A lista | As vivas, **na ordem de desenho** já cortada por `maxParticles` (§7.1) |
| `flow`, `index` | A identidade da §3.1. `index` **pode ser negativo** (pré-aquecimento) |
| `birth` | `t_i`, no tempo do esqueleto. Negativo no pré-aquecimento e nas voltas anteriores |
| `life` | `life_i`, a vida sorteada |
| `age` | `t − t_i` |
| `x`, `y` | **Sempre no espaço do esqueleto**, nos dois `space`. É o que se pode comparar entre um `local` e um `world`, e é o que o P-006 usa |
| `angle` | Graus, **não** reduzido a `−180..180`: `251.145834`, não `−108.854166`. O comparador **NÃO PODE** medi-lo por distância circular — ver §14.2 |
| `scale` | O fator, já com a escala do osso (§7.2) |

Números arredondados a **6 casas**, como o resto do `pose-dump`. Emissor sem
nenhuma viva sai como lista vazia, e não some da chave: sumir seria confundir
"não há partícula" com "o leitor não implementa P".

### 14.2 Como o comparador mede `/particles/` — normativo

Duas regras, e **elas são separadas**: uma é a **conta** da diferença, a outra é
o **tamanho** que se aceita. Confundi-las é o que deixa a prova frouxa.

#### A conta: diferença simples, nunca circular

O comparador do `pose-dump` mede ângulo pela **distância circular**, a que dá a
volta em 360°. Para a pose de um osso isso é certo: `−170°` e `190°` são a mesma
pose, e um leitor que escolha uma das duas escritas não está errado.

**Para o `angle` de uma partícula é errado.** Aqui `251.145834` e `−108.854166`
são exatamente 360° de diferença, e **não** são a mesma coisa: o segundo é o que
sai de um leitor que reduziu o ângulo para `−180..180`, e a §14.1 diz que ele
tem de **falhar**. Medido em círculo, esse leitor passa.

| Campo | Como se mede |
|:---|:---|
| `angle` | `abs(esperado − obtido)`, diferença **simples**. **Nunca** distância circular |
| `x`, `y`, `birth`, `life`, `age`, `scale` | Diferença simples |
| `flow`, `index` | Inteiros, **exatos** |

Em código: no comparador, `angle` de `/particles/` **NÃO DEVE** entrar no
conjunto de campos de ângulo (hoje `arotation`, `ashearX`, `ashearY`,
`rotation`). É o gesto mais natural do mundo — o campo se chama `angle` — e é
justamente ele que apaga a prova.

#### O tamanho: `1e-3` para todos, e mais apertado que o ângulo de pose de propósito

**Um número só para todo campo sob `/particles/`, e ele é `1e-3`.**

| Campo de `/particles/` | Tolerância |
|:---|:---|
| `angle` | **`1e-3` grau** — e **não** os `1e-2` que a §3.6 dá ao ângulo de pose |
| `x`, `y` | `1e-3` px, como a §3.6 |
| `birth`, `life`, `age`, `scale` | `1e-3` |
| `flow`, `index` | exatos |

**Por que a spec fixa o número em vez de deixar a cada comparador.** Cada runtime
tem o seu próprio comparador. Escritos às cegas, um pôs `1e-2` (a da §3.6 para
ângulo) e o outro `1e-3` (a de posição) — e os dois tinham argumento. Duas
réguas diferentes querem dizer que **o mesmo caso é medido com folgas diferentes
conforme quem mede**, e aí a prova deixa de ser uma prova só. Ficou `1e-3`
porque os dois batem as seis casas exatas nos oito casos: onde os dois podem
passar apertado, aperta-se.

**Por que mais apertado, e por que não se deve afrouxar depois:** nada aqui
acumula. Toda saída é conta fechada de um `u` exato de 24 bits (§3.2, §8) — não
há passo, não há iteração, não há erro que cresça com o tempo. E o dump arredonda
a 6 casas, então dois leitores certos diferem no máximo **um passo de
arredondamento**, `1e-6`. O `1e-3` já deixa mil vezes de folga.

Afrouxar para `1e-2` "porque é ângulo" seria copiar a folga de um número que
precisa dela — o ângulo de pose, que sai de matriz e de trigonometria encadeada
— para um que não precisa. Folga que não é necessária não é generosidade: é
espaço para um erro sistemático morar sem ser visto.

**E uma honestidade sobre as duas regras, porque a confusão entre elas é fácil:**
o erro de 360° **não** era escondido pelo tamanho da tolerância. Ele é 36 000
vezes maior que `1e-2`, e 360 000 vezes maior que `1e-3`: nenhuma tolerância
razoável o esconderia. Quem o esconde é a **conta circular**, que o transforma
em zero. As duas regras estão aqui porque as duas valem — a primeira contra o
erro de 360°, a segunda contra o erro pequeno e constante que ninguém procura.

*Esta seção nasceu de uma observação do chat do runtime Python, em 18/09/2026:
os dois runtimes chegaram à leitura certa por conta própria, e **dois leitores
acertarem não prova que a frase basta — prova que ela bastou para aqueles
dois.** Um terceiro leitor, daqui a um ano, lê esta §14.1 e não tem como saber.
Estava escrito só no leiame do P-001 e preso por um teste de runtime; agora está
onde um implementador de fora vai ler.*

**A regra que decide empate.** Se os dois runtimes lerem esta spec de jeitos
diferentes, **o caso decide e esta spec ganha uma linha**. Nunca se conserta o
teste para o código passar. Já custou dois casos ao projeto (C-299 e C-300).

---

## 15. Promoção ao núcleo

A §12.8 da spec exige duas implementações independentes e uma proposta pública.
Quando os dois runtimes passarem os oito casos, esta extensão **PODE** ser
proposta para a próxima `minor`, com `"type": "particle"` no núcleo e
`"BONE_particle"` aceito para sempre como alias. **Enquanto isso não acontece,
ninguém escreve `"type": "particle"` sem prefixo em lugar nenhum.**
