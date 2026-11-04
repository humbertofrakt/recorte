# Como provar que o seu runtime `.bone` está conforme

Também em inglês: [English](how-to-prove-conformance.md)

Para quem está escrevendo um runtime `.bone` em outra linguagem — C++, Rust,
C#, Python, Go, o que for — e quer poder dizer em público:
**"bone 1.0, nível C"**.

Você não precisa de permissão de ninguém. Precisa de um relatório que qualquer
pessoa possa refazer.

---

## Passo 1 — escolha o nível que você vai mirar

| Nível | Escreva isto primeiro |
|:---:|:---|
| **A** | Ler o JSON, cabeçalho e versão, ossos com os cinco modos de herança, slots, `region`, skins, atlas, as timelines de osso / slot / `drawOrder` / evento, e as três curvas. |
| **B** | Tudo de A, mais `mesh` com pesos, `linkedmesh`, `boundingbox`, `clipping`, `point`, `sequence`, `deform`, variáveis, tags e o binário `.boneb`. |
| **C** | Tudo de B, mais as cinco constraints, o attachment `path`, esqueleto aninhado, parâmetros, drivers e morphs. |

Sempre, em qualquer nível:

- Abrir arquivo de `minor` maior que o seu. **Nunca recusar por `minor`.**
- Ignorar propriedade, tipo, timeline e extensão que você não conhece.
- Não normalizar pesos. Não reordenar ossos, slots nem constraints.

Isso é o que os casos **X** medem, e eles são obrigatórios em todo nível.

Comece por A. É desenhado para caber num fim de semana.

---

## Passo 2 — escreva o adaptador

O adaptador é um programinha de 100 a 300 linhas. Ele é a ponte entre a suíte e
o seu runtime. Contrato:

| | |
|:---|:---|
| **Recebe** | A pasta do caso como último argumento da linha de comando. |
| **Recebe** | A **sonda** em JSON na entrada padrão. |
| **Devolve** | O **pose dump** em JSON na saída padrão. |
| **Erro** | Código de saída diferente de zero; a mensagem vai na saída de erro. |

### A sonda

```json
{
  "skins": ["armadura"],
  "animation": "andar",
  "times": [0, 0.25, 0.5, 1.0],
  "loop": true,
  "physicsDt": 0.01,
  "measure": ["bones", "slots", "drawOrder", "vertices", "events", "tags"]
}
```

| Campo | O que fazer |
|:---|:---|
| `skins` | A **pilha** de peles (spec 4.4), de baixo para cima: onde duas dão anexo ao mesmo placeholder, a de cima vence. `"default"` é uma pele como as outras: só está ativa se estiver na lista. Ausente = `["default"]`. |
| `animation` | Nome da animação a aplicar. Ausente ou `null` = só a setup pose. |
| `times` | Os tempos do esqueleto a amostrar, em segundos, crescentes. |
| `loop` | `true` = o tempo da animação dá a volta em `duration`, e os eventos se repetem a cada volta. |
| `physicsDt` | Passo fixo de simulação. Ver o passo 4. |
| `measure` | Quais blocos escrever em cada amostra. Ausente = `bones`, `slots`, `drawOrder`, `events`, `tags`. |

### O pose dump

```json
{
  "version": "1.0",
  "samples": [
    { "time": 0.5,
      "bones": {
        "arm": { "a": 0.7071, "b": -0.7071, "c": 0.7071, "d": 0.7071,
                 "worldX": 0, "worldY": 40,
                 "ax": 0, "ay": 40, "arotation": 45,
                 "ascaleX": 1, "ascaleY": 1, "ashearX": 0, "ashearY": 0 }
      },
      "body": null,
      "slots": {
        "arm": { "attachment": "arm", "bone": "arm", "color": [1, 0.8, 0.8, 1],
                 "darkColor": null, "visible": true, "sequenceIndex": -1 }
      },
      "drawOrder": ["body", "arm"],
      "vertices": { "arm/arm": [3.536, 31.464, 47.376, 77.477, 33.234, 91.619, -3.536, 48.536] },
      "boundingBoxes": {},
      "points": { "mao/ponta": { "x": 10, "y": 20, "rotation": 45 } },
      "events": [ { "time": 0.5, "event": "passo", "int": 2, "float": 0,
                    "string": "", "volume": 0.5, "balance": 0 } ],
      "tags": ["idle"],
      "variables": { "vida": 3 },
      "parameters": { "olhar": 0.5 }
    }
  ]
}
```

Regras do dump, uma por linha:

- `body` é a `uri` do **corpo do instante** (spec 9.13), ou `null` quando é o
  corpo do arquivo. Sempre presente, também num projeto de um corpo só. Os
  outros canais da amostra são os desse corpo.
- `bones` é um objeto **por nome**: matriz de mundo (`a b c d worldX worldY`) e
  pose aplicada (`ax ay arotation ascaleX ascaleY ashearX ashearY`). Um osso do
  filho aninhado entra com a chave `"<slot>/<osso>"`.
- `slots` traz sempre `attachment`, `bone` (o osso **aplicado**: o do arquivo,
  ou o da chave `slot/bone`), `color`, `darkColor`, `visible` e `sequenceIndex`.
- Os ângulos do dump (`arotation`, `ashearX`, `ashearY`, rotação de ponto) saem
  **reduzidos a `(-180, 180]`**. A pose interna guarda o valor cru; só a saída
  reduz.
- `vertices` e `boundingBoxes` usam a chave `"slot/attachment"`, com os
  vértices de mundo em pares `x, y`.
- `sequenceIndex` é o frame **resolvido** da sequência (já passado pelo
  `sequence.setup` quando não há chave). `-1` quando o attachment não tem
  sequência.
- `events` traz os valores **efetivos**: cada campo da chave sobrescreve o da
  definição; o que a chave não diz vem da definição.
- Números com no máximo **6 casas decimais**.
- Escreva o dump inteiro, sempre. Sobra não atrapalha: **o `esperado.json`
  decide o que é comparado**, e o que ele não menciona não é olhado.

### Onde está a sonda de cada caso

A sonda vem para o seu adaptador pela **entrada padrão**, mas ela mora dentro
do caso, e você pode abrir e ler antes de rodar qualquer coisa: está na chave
`"probe"` do `esperado.json`, ou num `probe.json` separado ao lado, quando o
caso tiver um. O `probe.json`, quando existe, **ganha** do `"probe"`.

### Adaptador que roda de verdade

O esboço em Python abaixo mostra a forma. Quando o seu adaptador divergir e
você não souber por quê, o arquivo para ler linha a linha é este, que passa
nos casos hoje:

    conformidade/adaptador-referencia.mjs

Confira você mesmo, da raiz do projeto:

```
node ferramentas/conformidade.mjs --adaptador "node conformidade/adaptador-referencia.mjs"
```

Ele usa o runtime de referência em TypeScript, mas o que interessa não é isso:
é a moldura em volta — como a pasta do caso chega, como a sonda é lida, como as
três embalagens são achadas, e por que uma recusa tem que sair pelo código de
saída e não pelo dump.

### Adaptador de exemplo (Python, esqueleto)

```python
import json, sys, os

pasta = sys.argv[-1]
sonda = json.load(sys.stdin)

esqueleto = meu_runtime.carregar(os.path.join(pasta, "entrada.bone"))
esqueleto.pilha(sonda.get("skins", ["default"]))   # de baixo para cima; a de cima vence

anim = sonda.get("animation")
amostras = []
anterior = float("-inf")
for t in sonda["times"]:
    esqueleto.pose(anim, t, agora=t, loop=sonda.get("loop", False))
    amostras.append(montar_amostra(esqueleto, t, anterior, sonda))
    anterior = t

json.dump({"version": "1.0", "samples": amostras}, sys.stdout)
```

---

## Passo 3 — como cada amostra é montada

Esta é a parte que dá briga entre dois runtimes corretos, então está escrita
com todas as letras.

**Uma amostra é uma pose completa, feita do zero:**

```
1. volte tudo para a setup pose
2. aplique a animação no tempo t          (Pose, seção 9.10 da spec)
3. rode o updatePose: aplicada = local, constraints na ordem do array, mundo
4. leia os valores e escreva a amostra
```

**Tempo da animação.** Sem `loop`, é o próprio `t` (antes da primeira chave vale
a primeira chave; depois da última vale a última). Com `loop` e `duration > 0`,
é `t − floor(t / duration) × duration`.

**Eventos.** O intervalo da amostra `i` é `(times[i−1], times[i]]`, com `−∞` na
primeira. Com `loop`, uma chave em `k` dispara em `k`, `k + duration`,
`k + 2·duration`, e assim por diante. Dentro de uma amostra, entregue por ordem
de tempo; empate mantém a ordem das chaves.

---

## Passo 4 — física, quando o caso pede

Quando a sonda traz `physicsDt` maior que zero, **não** basta posar nos tempos
pedidos. A simulação é encadeada: cada passo depende do anterior.

```
o relógio anda de 0 em 0, em passos de physicsDt
a cada passo, faça uma pose completa (setup, animação, updatePose) com now = o relógio
quando o relógio bate num tempo pedido, grave a amostra
```

Todo tempo pedido é múltiplo exato do passo. Se não for, o caso está errado e a
suíte reclama.

**Outro `dt` dá outra trajetória, e isso é esperado** (6.5 da spec). Por isso a
suíte fixa o passo.

---

## Passo 5 — rode a suíte

```
node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py"
```

Comece por um caso só, para ajustar o adaptador:

```
node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py" --caso A-010-heranca-cinco-modos
```

Depois por nível:

```
node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py" --nivel A --nivel X
```

Quando falha, a saída mostra onde:

```
A-010-heranca-cinco-modos
  /samples/0/bones/noScale/a
    esperado 0.27735   obtido -0.27735   diferença 0.5547 (tolerância 0.0001)
```

O caminho é um JSON Pointer dentro do dump. `/samples/0/bones/noScale/a` quer
dizer: primeira amostra, osso `noScale`, componente `a` da matriz.

**Leia o `leiame.md` do caso que falhou.** Ele traz a conta escrita passo a
passo, direto da spec. Na maioria das vezes a linha exata onde o seu runtime
divergiu está lá.

---

## Passo 6 — as tolerâncias

| O quê | Tolerância |
|:---|---:|
| Posição, vértice, `worldX/Y`, `ax/ay` | `1e-3` px |
| Ângulo (`arotation`, `ashearX/Y`) | `1e-2` grau, por distância circular |
| Componente de matriz (`a b c d`) e escala | `1e-4` |
| Cor | `1e-3` |
| Física com `dt` fixo | `1e-2` px |
| `softness` do IK | `1e-1` px |
| Eventos, ordem de desenho, tags, nomes, booleanos | **exatos** |

Ângulo é comparado por distância circular: `179.999` e `-180` são o mesmo
ângulo.

Você **pode** calcular em float 32 ou float 64, pré-tabelar curvas, mapear em
memória, reordenar internamente — desde que o resultado caiba nessas
tolerâncias.

---

## Passo 7 — publique

Gere o relatório para máquina:

```
node ferramentas/conformidade.mjs --json --adaptador "python meu_adaptador.py" > conformance-report.json
```

Guarde-o num endereço público — o repositório do seu runtime serve — e mande a
linha para o **registro oficial**, em `conformidade/REGISTRY.md`, com o nome do
runtime, a versão, a linguagem, o nível, quantos casos passaram e a data. O
arquivo já traz o cabeçalho da tabela pronto e a primeira linha preenchida.

Como mandar: abra uma issue no repositório do formato. O endereço está no
`README.md` e em `CONTRIBUTING.md`.

### O texto que você pode publicar ao passar

Com **100% dos casos A e X**:

> `<nome do runtime> <versão>` implementa o formato **bone 1.0, nível A**.
> Passa em 100% dos casos A e X da suíte de conformidade oficial.
> Relatório: `conformance-report.json`, gerado em `<data>`.

Com **100% dos casos A, B e X**: troque por **nível B**.

Com **100% dos casos A, B, C e X**: troque por **nível C**.

**Nível R (renderização) — reservado, ainda sem casos.** A família `R-` está
prevista na §12.4 e **não existe** no repositório: são zero casos. Enquanto
não existirem, **não** publique "nível R": é uma afirmação que ninguém pode
conferir, e num documento cuja força vem de "vale porque é público e
refazível", uma afirmação sem lastro contamina as outras três.

### O que você **não** pode dizer

- "Nível C" com um caso C falhando. Um caso é um caso.
- "Nível B" sem os casos X. Compatibilidade não é opcional.
- "Conforme" sem publicar o relatório. A auto-certificação vale porque é
  pública e refazível.

Um runtime que implementa parte do nível C **declara o maior nível que atinge
por inteiro**, e pode dizer à parte quais recursos do nível seguinte já tem.

---

## Se você achar um caso errado

Acontece. A spec é texto e texto tem erro.

Abra uma issue com: o caso, o campo, o número que você calculou, e **a conta**.
Se a sua conta seguir a spec e o `esperado.json` não seguir, quem muda é o caso
— e a spec, se o texto for ambíguo.

O que **não** acontece é o inverso: a suíte não é ajustada para acomodar um
runtime. Uma proposta que quebre um caso existente é recusada sem discussão
(12.8 da spec).
