# Runtime Python do formato `.bone`

Segundo runtime do formato, escrito em Python, **só com biblioteca padrão**.
Nada para instalar.

## Para que serve

**Prova de portabilidade.** Até agora o formato tinha uma implementação só, em
TypeScript, e a suíte de conformidade foi escrita pela mesma cabeça que
escreveu o runtime. Um formato com um runtime só não é padrão: é um programa.

Este runtime foi escrito **lendo a especificação**, não o código TypeScript.
Isso prova três coisas de uma vez:

| O que prova | Como |
|:---|:---|
| A spec é implementável por outra pessoa | 36 dos 39 casos passaram na primeira rodada, lendo só o texto |
| A suíte pega erro de verdade | Dois casos falharam e apontaram buracos reais na spec |
| O formato é portável | Os mesmos 46 casos passam nos dois runtimes |

Onde a spec não bastou está anotado em
`documentos/notas-de-desenvolvimento/SPEC-INSUFICIENTE.md`. Essa lista é o
resultado mais valioso deste trabalho.

## Como rodar

| Comando | O que faz |
|:---|:---|
| `python runtime-python/conformidade.py` | Roda os 71 casos de conformidade |
| `python runtime-python/conformidade.py --casos conformidade/casos-pendentes` | Roda os casos que ainda esperam os dois runtimes (hoje os 8 de partícula, P-001 a P-008) |
| `python runtime-python/conformidade.py --json` | O mesmo, em JSON, com o nível alcançado |
| `python runtime-python/conformidade.py --nivel C` | Só os casos de um nível |
| `python runtime-python/conformidade.py --caso C-212-ik-2-ossos` | Só um caso |
| `python -m unittest discover runtime-python/testes` | Roda os 230 testes próprios |
| `node ferramentas/conformidade.mjs --adaptador "python runtime-python/adaptador.py"` | Roda a suíte pelo executor **oficial**, contra este runtime |

A última linha é a que vale como prova: quem confere é o executor do projeto,
não o meu.

## Resultado de hoje

**71 de 71 casos passam. Nível alcançado: C.** E os **8 de partícula** de
`casos-pendentes/` também (18/09/2026, degrau 12).

**05/10/2026 (v27.7): 104 de 104**, com os 14 casos promovidos de `casos-pendentes/` (`C-263`, `C-310` a `C-321`, `X-307`): `A 13/13 · B 7/7 · BIN 1/1 · C 57/57 · P 19/19 · X 6/6 · ZIP 1/1`.

```
A: 13/13   B: 7/7   C: 44/44   X: 5/5   BIN: 1/1   ZIP: 1/1
pendentes: P 8/8
```

Conferido pelos dois caminhos: pelo `conformidade.py` deste runtime e pelo
executor oficial em Node, com `--adaptador`.

Os oito de partícula **não saem de `casos-pendentes/` por isso**: quem os move é
o Planejador, e só quando os **dois** runtimes passarem e o confronto campo a
campo não achar diferença. Um runtime que passa sozinho não prova nada — as duas
implementações têm de ser independentes, e esta foi escrita **sem abrir
`runtime/src/`**, só pela spec da extensão.

## Como usar no seu programa

```python
from recorte import load_skeleton_file
from recorte.actor import Actor

dados = load_skeleton_file("heroi.bone")     # .bone, .boneb ou .bonez
ator = Actor(dados)                          # um esqueleto por corpo, montado uma vez
ator.set_skins(["default", "armadura"])      # a pilha, de baixo para cima

andar = dados.find_animation("andar")
esqueleto = ator.pose(andar, 0.5, 0.5, False, 0.0)   # o corpo do instante, já posado

for slot, anexo, pele in esqueleto.visible_attachments():
    pontos = esqueleto.world_vertices(slot, anexo, pele)
    uvs = anexo.page_uvs
```

## O que tem dentro

| Arquivo | O que faz |
|:---|:---|
| `recorte/loader.py` | Lê `.bone`, `.boneb` e `.bonez`. Cabeçalho, versão, extensões, fallbacks (§2 e §4) |
| `recorte/binary.py` | Decodifica o binário `.boneb`: tabela de strings, árvore, blocos `TKEY`, `BIND`, `VERT` (§11) |
| `recorte/atlas.py` | Atlas, regiões, giro de 90°, mapeamento de UV (§10) |
| `recorte/skeleton.py` | Setup pose, cinco modos de herança, matriz de mundo, mundo→aplicada, vértices, caixas, recorte (§3, §5, §7) |
| `recorte/animation.py` | Timelines, três curvas, ordem de desenho, sequências, eventos, parâmetros, drivers (§8 e §9) |
| `recorte/constraints.py` | As cinco regras: `ik`, `transform`, `path`, `physics`, `driver` (§6 e §8.2) |
| `recorte/actor.py` | O projeto em movimento: a virada de corpo (§9.13) e o esqueleto aninhado em duas camadas (§7.11) |
| `recorte/pose_dump.py` | Pose dump da §12.4 e a comparação com tolerâncias |
| `conformidade.py` | Roda a suíte contra este runtime |
| `adaptador.py` | Deixa o executor oficial rodar a suíte contra este runtime |

## O que este runtime cobre

Nível **C** completo, pela regra da §12.4:

- Ossos com os **oito modos de herança** da §5.3: os cinco do Spine e os três
  do F3 (`noRotation`, `noReflection`, `onlyReflection`).
- Slots, cor, cor escura, blend, visibilidade, **ordem de desenho** com
  deslocamentos.
- Peles como **pilha** (a de cima vence, nenhuma `default` implícita), `includes`,
  esconder com `null`.
- **Esqueleto aninhado** (a entidade, §7.11): a raiz do filho no osso do slot
  vezes o `T·R·S` do anexo, `baseAnimation` por baixo, `nested`,
  `inheritAnimation`, canais e eventos prefixados `<slot>/`.
- **De fora** (§2.8): animações com `rig.reference`, peles com osso, slot e
  regra `skinRequired`; `rig` conferido com aviso.
- **Virada de corpo** (§9.13): um esqueleto por corpo, `keepSkins`, a entidade
  que continua no slot de mesmo nome. `slot/bone` com `transform` (§9.5) e
  `weights` animados (§9.6).
- Anexos: `region`, `mesh` com pesos, `linkedmesh`, `boundingbox` (polígono,
  retângulo e elipse), `clipping` (a máscara em vigor), `path`, `point`.
- Animações: todas as timelines da tabela da §9.1, as três curvas, `deform`,
  `sequence` nos sete modos, eventos com laço.
- Regras: `ik` de 1 e 2 ossos (com `stretch`, `compress`, `softness`),
  `transform` nos quatro modos, `path` nos quatro espaçamentos e três rotações,
  `physics` com passo fixo, `driver` nos dois modos.
- Parâmetros (inclusive dirigidos por osso), morphs, variáveis, tags.
- As três embalagens: `.bone`, `.boneb` e `.bonez`.

## O que este runtime **não** cobre

Está aqui para ninguém confundir "passou na suíte" com "implementa tudo".

| Não cobre | Nota |
|:---|:---|
| **Desenhar** | Não há renderizador. O runtime entrega vértices, UVs, cor e ordem; quem desenha é o seu programa. |
| **Recorte de verdade** (`clipping`) | Ele diz **qual** máscara vale para cada slot. Não corta os triângulos (§7.7 deixa isso para o renderizador). |
| **`inheritColor`** | Lido e guardado. Nenhum canal do dump o mede, e o runtime não multiplica a cor do filho. |
| **Aviso de auto-interseção da `clipping`** | Não há (§7.7). |
| **Mistura de animações** | Só a função `Pose` da §9.10, uma animação por vez, alpha 1. Não há faixas nem crossfade. |
| **Gravar** | Só leitura. Não grava `.bone`, `.boneb` nem `.bonez`. |
| **Validador** | Não checa L0/L1/L2. Usa a tabela de fallbacks da §2.5 e abre o arquivo. |
| **Extensões `BONE_*`** | Só a `BONE_particles` (módulo lateral **P**, 1ª fase). Um `extensionsRequired` com qualquer outra faz o arquivo ser **recusado**, como manda a §2.7. |
| **Partículas, 2ª fase** | A taxa animada por integral (o ramo `linear` da §4.2 da extensão) não entra: `rate` é fixo e quem anima é `emitting`. Uma timeline de `rate` é **recusada com aviso**, nunca desenhada como se nada fosse. Sub-emissor, rastro e ruído também não existem. |
| **Imagem solta sem atlas** | Um anexo sem região no atlas fica sem UV de página. O runtime não abre arquivo de imagem. |

Os casos da suíte também não cobrem tudo: a própria §12.4 lista o que falta.
Um runtime pode passar em 39 de 39 sem ter implementado nada dessa lista — e
este aqui é honesto sobre a parte dela que ele não fez.

## Licença

Apache 2.0, como o resto dos runtimes do projeto. Ver `LICENSE` na raiz.
