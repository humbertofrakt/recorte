# `casos-pendentes/` — os oito casos de partícula, desde 18/09/2026

> **05/10/2026 (v27.7): os 14 casos saíram daqui para `casos/`** — `C-263`, `C-310` a `C-321` e `X-307`. Os dois runtimes passam neles, e o confronto concorda campo a campo (104 de 104). **Aqui ficou só o `P-002`**. O resto deste leiame é a história, como estava.

> **05/10/2026, noite (v28.8): os 10 casos da rodada 34 saíram daqui para `casos/`** — `C-264`, `C-322` a `C-326`, `P-027` a `P-029` e `X-308`, escritos à mão pela spec por um chat que não escreveu runtime. Três deles derrubaram o TypeScript (C-324, C-326, P-029) e dois o Python (C-326, P-027); consertados os dois, eles passam, e o confronto concorda campo a campo (121, contando o P-002). **Aqui ficou só o `P-002`**.

Esta pasta guarda caso **completo** (entrada, esperado conferido à mão, leiame
com a conta) que nenhum dos dois runtimes passa ainda (spec §12.4). **O executor
não a varre**: `node ferramentas/conformidade.mjs` continua dizendo 71 de 71.

Em 17/09/2026, no fecho da rodada dos degraus 2 e 3, os 18 casos que moravam
aqui (C-270, C-273 a C-277, C-279, C-290 a C-300) entraram em `casos/`: os dois
runtimes passaram e o confronto campo a campo não achou diferença.

---

## O que está aqui agora

Os oito casos da extensão `BONE_particles`, escritos em 18/09/2026 pelo chat
`EXECUTANDO · particulas no formato`, degrau 12, parte `P1`, lote 3.

| Caso | O que prova |
|:---|:---|
| **P-001** posição fechada | A posição é conta da idade, não soma de passos. 11 partículas em `t = 0.5`, com gravidade, arrasto, giro e escala |
| **P-002** taxa em rampa | A inversa estável da integral. **2ª fase** — ver abaixo |
| **P-003** laço | Em `t = 0.02` já há partículas da volta anterior; `t` e `t + D` dão o **mesmo** quadro |
| **P-004** pré-aquecimento | Índice **negativo** no hash, por complemento de dois. 23 partículas já no ar em `t = 0.1` |
| **P-005** teto de vivas | `maxParticles 5` com 12 vivas: as 5 **mais novas**, e o nascimento não é bloqueado |
| **P-006** `space: "world"` | O osso gira 90° entre `t_i` e `t` e a partícula **não** gira junto: `(100, 0)`, não `(0, 100)` |
| **P-007** rajada com probabilidade | Sorteio por partícula, canal 11, fluxo da rajada: nascem **6 de 10**, e não 5 |
| **P-008** arrastar para trás | `0.9 → 0.3 → 0.9` dá o primeiro quadro de volta, **igual campo a campo** |

## A segunda leva — P-009 a P-016, escritos em 18/09/2026

**A régua que decidiu a lista:** toda decisão da rodada de 18/09 foi tomada num
ponto que **nenhum dos oito primeiros casos exercita**. Os dois runtimes
passavam os oito e desenhariam coisas diferentes na mão de quem usasse. Cada
caso abaixo fecha um desses pontos.

| Caso | O que prende | Por que nenhum dos oito o separava |
|:---|:---|:---|
| **P-009** | `startDelay` ≠ 0 com `prewarm`: a origem desloca, e o pré-aquecimento parte dela | os oito têm `startDelay: 0` |
| **P-010** | `startDelay` ≠ 0 com rajada, **mudando quem o laço corta** | idem |
| **P-011** | Rajada com laço: a explosão que sumia ao virar a volta, e o corte dos ciclos além de `D` | o P-007, o único com rajada, tem `looping: false` |
| **P-012** | `spherizeDirection` ≠ 0 com `spread`: mistura primeiro, leque depois | com `spherize: 0` as duas ordens coincidem |
| **P-013** | Osso com escala **não uniforme**: o `scale` do dump é `hypot(a, c)` | nos oito a escala do osso é `1`, e as quatro leituras coincidem |
| **P-014** | `oldestInFront` | os oito usam o padrão `youngestInFront` |
| **P-015** | Malha `edge` e `triangle`, a fórmula de **dobrar**, e **a mesma triangulação escrita noutra ordem exigindo a mesma aresta** | nenhum caso usa `shape: "mesh"` fora de `vertex` |
| **P-016** | Chave de `emitting` com `startDelay` ≠ 0: a timeline vale no **relógio do esqueleto** | idem |

**Estes oito pedem TRÊS acordos, não dois.** O `esperado.json` de cada um foi
calculado por uma implementação de referência escrita só pela spec — a mesma que
reproduz o P-001 número a número. Os dois runtimes rodam depois. **Se os três
baterem, o caso entra. Se dois baterem e um não, o errado se conserta. Se os
três discordarem, a spec ainda está calada ali** — e isso sobe ao Planejador
**antes** de qualquer conserto.

O coração do P-015 é o par `fx`/`fx2`: duas malhas iguais com `triangles`
escrito em ordens diferentes e com os índices rodados, que **têm de dar posições
idênticas**. Um runtime que guarde a ordem de descoberta das arestas escolhe
outra aresta para o mesmo `u12` — e sem esse par ninguém notaria, porque cada
lista sozinha "parece" certa.

## Duas coisas que estes casos EXIGEM antes de rodar

**1. A medida `particles` no `pose-dump`.** O `pose-dump` da §12.4 não tinha como
falar de partícula. Os oito casos pedem uma medida nova, e o formato dela está
escrito na §14.1 de `formato/extensions/BONE_particles.md`. **Quem a implementa
em `ferramentas/src/conformidade/` é o chat do runtime TypeScript** — ela está
fora da cerca de quem escreveu os casos, e os casos são o contrato que ela
cumpre.

**2. O módulo P nos dois runtimes.** Nenhum dos dois lê `BONE_particle` hoje.

## P-002 é de 2ª fase, e o `esperado.json` dele está VAZIO de propósito

A 1ª fase da extensão tem `rate` **fixo**: quem anima é `emitting`, em degraus.
O P-002 exercita o ramo `linear` da integral da taxa, que é 2ª fase. Ele foi
escrito agora porque a **conta** dele precisava ficar fechada na spec — dois
leitores que a adivinhem vão adivinhar diferente, e foi assim que nasceram o
C-299 e o C-300. A entrada e a conta estão no leiame dele; a lista de partículas
do `esperado.json` é preenchida quando a 2ª fase abrir.

**Não mova o P-002 para `casos/` antes disso.**

## Como estes números foram tirados

Por **duas implementações independentes** escritas só pela spec da extensão, uma
em JavaScript e uma em Python, conferidas campo a campo: mesmo bit. Os cinco
números de referência do hash (§3.2) também foram refeitos na máquina, e não
copiados da pesquisa.

Isso **não basta**, e está escrito aqui para ninguém confundir: as duas são do
mesmo autor, e duas implementações do mesmo autor erram junto. Os números
**têm de ser refeitos pelos dois runtimes** — `P2` em TypeScript, `P3` em
Python, sem um olhar o outro — antes de qualquer caso sair desta pasta.

## Quem move, e quando

**O Planejador**, e só quando os dois runtimes passarem e o
`npm run conformidade:dois` confrontar campo a campo **sem diferença**.

Se os dois lerem a spec de jeitos diferentes: **o caso decide e a spec ganha uma
linha**. Nunca se conserta o teste para o código passar. Escrever estes oito já
rendeu três linhas novas à spec da extensão — quantos nascimentos tem uma volta
(§6), o que a matriz do osso leva junto e em que instante (§7.2), e o formato do
dump (§14.1) — e cada uma delas era uma coisa que dois leitores teriam
adivinhado diferente.

## A rodada 11 — "Este boneco": 14 casos, escritos em 05/10/2026

Pelo executor da rodada 11 (ref `35f718`), lote 1. A conta de cada um está no `leiame.md` dele e no plano
`documentos/projeto do programa/12 ESTE BONECO - o plano 2026-10-05.md`. **Os
`esperado.json` foram digitados dessas contas; nenhum runtime foi consultado.**

| Caso | O que prende |
|:---|:---|
| **C-310** | o aninhado em bloco, no lugar do slot: a frase da 7.11 que nenhum caso media |
| **C-311** | `around`: atrás do boneco inteiro, na frente do boneco inteiro, o meio não é desenhado |
| **C-312** | o corte é pela ordem do filho **no instante** (chave `drawOrder` do filho) |
| **C-313** | a ordem de quem recebe por chave não move a peça; a marca desliga pela chave `slot/attachment` |
| **C-314** | duas peças marcadas: a cebola |
| **C-315**, **C-316** | níveis: em bloco, e marcado |
| **C-317** | a imagem do meio some; a marca é o slot |
| **C-318**, **C-319** | a máscara do filho viaja com a peça; a de quem recebe não corta a peça marcada |
| **X-307** | `around` com slot que não existe: em bloco, sem palpite |
| **C-263** | física: o amortecimento, com a conta à mão (à parte do "Este boneco") |
| **C-320**, **C-321** | trocar de placeholder por chave: com a mesma `uri` o relógio do filho continua (90); com outra, zera (15). Lote 2b |

**O que eles exigem antes de rodar:** o canal `drawList` no pose-dump (spec 12.4) e o `around` (spec 7.11) nos dois runtimes. O C-263 não exige nada: **já passa** no runtime de
referência, e reprova com o esperado errado (provado numa cópia, 05/10).

**O verde mudo, consertado em 05/10/2026.** De manhã os 11 casos de `drawList` apareciam como
"passou" num runtime que não tinha o canal: o executor pulava a chave que ele mesmo não
sabia comparar. Desde o lote 2 da rodada 11, chave desconhecida **reprova, com o nome**
(`ferramentas/src/conformidade/pose-dump.ts`, dois testes). No runtime de referência os 14
passam, e os 11 reprovam com a lista que um runtime errado daria. **Falta o Python.**

**Quem move:** o Diretor, quando os dois runtimes passarem e o confronto não achar diferença.

## A rodada 34 — os casos que faltam: 10 casos, escritos em 05/10/2026

Pelo `EXECUTANDO · rodada 34` (ref `5ec797`), pela ficha do `DIRETOR · 000da3`.
**Cada `esperado.json` foi digitado da conta do `leiame` dele, antes de rodar
qualquer leitor.** A física saiu de uma implementação da §6.5 escrita só pelo
pseudocódigo (ela reproduz o C-262 nas quatro amostras); as partículas, do hash
da §3.2 conferido nos cinco números de referência.

Os quatro leitores, às 20h45–20h46 (`--casos conformidade/casos-pendentes`):

| Caso | O que prende | TS | Python | Construct | Godot |
|:---|:---|:---:|:---:|:---:|:---:|
| **C-264** | a chave `reset` em 0 dispara no primeiro quadro, sem atrasar a física | verde | verde | verde | verde |
| **C-322** | a máscara de quem recebe corta a peça **em bloco** | verde | verde | verde | verde |
| **C-323** | a máscara cujo `end` é o slot marcado acaba ali; a peça marcada não é cortada | verde | verde | verde | verde |
| **C-324** | o meio mostra um filho com `around` próprio: some só o meio do neto | **vermelho** (4 peças) | verde | **vermelho** (4 peças) | verde |
| **C-325** | a física do filho continua na troca de placeholder de mesma `uri` | verde | verde | verde | verde |
| **C-326** | a chave `reset` da animação do filho dispara | **vermelho** (1,180874) | **vermelho** (1,180874) | **vermelho** (1,180874) | **vermelho** (1,180874) |
| **P-027** | malha em `world`, emissor girado e deslocado: o ponto entra no esqueleto uma vez | verde | **vermelho** (leva duas vezes: 8,373938 ; 126,971364) | verde | verde |
| **P-028** | caminho com pesos (`binding`), lido em `t_i` | verde | verde | verde | verde |
| **P-029** | emissor de forma desconhecida fora da `drawList` | **vermelho** (desenha `fx_mau/nevoa`) | verde | **vermelho** (idem) | verde |
| **X-308** | `minVersion` acima do leitor: abre em melhor esforço | verde | verde | verde | verde |

Cada vermelho deu **exatamente** o número que o `leiame` do caso diz que o leitor
errado daria. Os quatro casos todos-verdes de C (C-264, C-322, C-323, C-325) foram
vistos **falhar** numa cópia com o esperado do leitor errado (regra 26).

**Verdes que não provam tudo o que o nome diz (regra 28):** P-029 e X-308 não veem
o **aviso** (a sonda não tem canal `warnings`); X-308 passa num leitor que nunca lê
`minVersion`; C-264 não separa "dispara em `t = 0`" de "não dispara no começo", e
**não** reproduz a diferença de 0,07 px entre Godot e Construct (os dois passam).

**Quem move:** o Diretor, quando os leitores passarem.
