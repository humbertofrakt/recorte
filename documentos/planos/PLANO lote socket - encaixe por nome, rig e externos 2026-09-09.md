# PLANO — encaixe por nome, contrato de rig, animação e skin externas

Data: 09/09/2026. Escopo decidido pelo Humberto: **só spec + schema + exemplos + casos**. Runtime e editor vêm depois.

## Contexto

O Humberto fechou três decisões de formato (recorte de 09/09/2026):

1. Esqueleto filho como **arquivo externo**, encaixado **por nome** (socket): "mão direita" ↔ "empunhadura". Filho com **dois canais**: responde ao pai (pai toca `recarregar`, filho toca o `recarregar` dele) e roda solto (motosserra girando sempre).
2. **Animação separada do esqueleto**, com **contrato de rig** explícito: lista de nomes que o esqueleto precisa ter.
3. **Skin de fora**: arquivo próprio, carregado no jogo, que encaixa pelo nome dos slots.

É um mecanismo só: **arquivo externo que encaixa por nome, com contrato declarado.**

O que já existe e fica: filho por `uri` (§7.11), animação por nome de osso (§9.1), slot separado da imagem (§4.3), skin como tabela (§4.4), timeline `nested` (§9.9), `point` descrito como "ponto de encaixe" (§7.9).

Decisões já tomadas com ele: nome `socket`; entra no rascunho 1.0; skin externa também entra.

## Desenho dos campos

**Cinco campos novos, uma seção nova, duas listas em `assets`. Nenhum tipo de anexo novo, nenhuma timeline nova.**

### §7.9 `point` — o pai publica o socket

| nome | tipo | obrig. | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `socket` | name | não | — | Publica este ponto como socket. Ex.: `"mao_direita"`. Nível C. |

Por que reaproveitar `point` e não criar `sockets[]` no esqueleto: `point` já tem `x/y/rotation` no osso, já anima com o osso, já troca por skin (pele de inverno move a mão) e já tem canal no dump (`points`).

Busca: varre os `point` das skins ativas na ordem de `slots`. Dois iguais: L2 `SOCKET_DUPLICATE`, vale o primeiro.

### §7.11 attachment `skeleton` — o encaixe e os dois canais

| nome | tipo | obrig. | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `socket` | name | não | — | Socket **do pai**. Ausente = encaixe de hoje (osso do slot). |
| `childSocket` | name | não | = `socket` | Socket **do filho** que se alinha ao do pai. Ausente = raiz do filho. |
| `inheritAnimation` | boolean | não | `false` | Canal 1: filho toca a animação com o **mesmo nome** da do pai, se tiver. |
| `baseAnimation` | name | não | — | Canal 2: animação que roda **sempre** no filho, em laço, relógio próprio. |

Nomes casam com `inheritColor`, `inheritRotation`, `timeScale`, que já moram no mesmo objeto.

Matriz com socket (substitui a primeira regra de §7.11):

```
S = M_ossoDoSlot × T(p.x, p.y) · R(p.rotation)              // p = point do socket do pai
P = S × T(x, y) · R(rotation) · S(scaleX, scaleY)            // x/y/... do anexo, agora relativos ao socket
se childSocket: P = P × inversa(T(c.x, c.y) · R(c.rotation)) // c = point do filho, medido da raiz dele
raiz do filho: como hoje (caso normal da 5.4), com pa..pd = P
```

Precedência da animação do filho:

| Ordem | Fonte | Relógio |
|:---:|:---|:---|
| 1 | chave `nested/animation` ativa | zera na troca; `nested/time` manda |
| 2 | `inheritAnimation` e o filho tem a animação do pai | relógio do pai × `timeScale` |
| 3 | `attachment.animation` (campo de hoje) | próprio × `timeScale` |
| 4 | nada | setup pose do filho |
| sempre | `baseAnimation`, por baixo de 1–4 | próprio, em laço, imune a `nested/time` e a trocas |

Duas camadas, ordem fixa, alpha 1 (estende §9.10):

```
p = Pose(filho, baseAnimation, tBase)      // sem baseAnimation: p = setup(filho)
se resp: aplicar timelines de resp sobre p em t_resp   // replace
updatePose(filho, now)
```

### Nova §4.8 `rig` — o contrato

| nome | tipo | obrig. | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | não | — | Nome do contrato. Ex.: `"mecha-humanoide-v1"`. |
| `bones` | name[] | não | `[]` | Ossos que o hospedeiro DEVE ter. |
| `slots` | name[] | não | `[]` | Slots que o hospedeiro DEVE ter. Skin externa lista os que preenche. |
| `sockets` | name[] | não | `[]` | Sockets que o hospedeiro DEVE publicar. |

Arquivo só de animações = `.bone` normal com um osso raiz (§2.2 exige `bones`) + `rig` + `animations`. Arquivo de skin = idem, com `rig` + `skins`.

### §2.8 `assets` — as referências

| nome | tipo | obrig. | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `animations` | uri[] | não | `[]` | Arquivos só com animações. Relativos a `skeletonsBase`. Nível C. |
| `skins` | uri[] | não | `[]` | Arquivos com skins externas. Mesma base. Nível C. |

As animações e skins de fora entram nos namespaces pelo nome. Local ganha de externo (L2). Arquivo externo **não** pode ter `assets.animations`/`skins` próprio: L1 `EXTERNAL_CHAIN`. Profundidade 1.

### Quando o nome não bate

| Situação | Nível | Comportamento |
|:---|:---:|:---|
| `socket` não publicado | L2 `SOCKET_MISSING` | encaixe de hoje, aviso uma vez |
| `childSocket` não existe no filho | L2 `SOCKET_MISSING_CHILD` | raiz do filho |
| `inheritAnimation` e o filho não tem a animação | aviso uma vez | só o fundo; sem fundo, setup |
| `baseAnimation` não existe | L2 `NESTED_ANIMATION_MISSING` | ignora a camada |
| `rig.*` não atendido | L2 `RIG_UNMET` | carrega; timeline órfã já é ignorada (§4.7) |
| `assets.animations/skins` não resolve | aviso uma vez (§2.8) | nada acrescentado |
| leitor A ou B | — | ignora tudo isso; filho vira placeholder vazio (§7.11 hoje) |

## Onde muda

Arquivo: `formato/ESPECIFICACAO 2026-09-06.md` (linhas de hoje).

| Seção | Linha | O que entra |
|:---|---:|:---|
| §2.2 raiz | 88 | linha `rig` |
| §2.5 fallbacks | 164 | socket desconhecido → encaixe de hoje; externo não resolvido → ignora |
| §2.8 `assets` | 255, 300 | duas linhas na tabela; parágrafo de resolução; `EXTERNAL_CHAIN` |
| §4.0 mapa | 439 | `rig`; `socket` em `point`; 4 campos no `skeleton` |
| §4.7 quem aponta | 572 | 5 linhas: `point.socket`, `skeleton.socket`, `childSocket`, `rig.*`, `assets.animations/skins` |
| **§4.8 `rig`** nova | após 593 | tabela + regra `RIG_UNMET` |
| §7.2 níveis | 1459 | `point.socket` é C |
| §7.9 `point` | 1674 | linha `socket` + busca |
| §7.11 `skeleton` | 1712–1734 | 4 linhas; matriz com socket; precedência; duas camadas |
| §9.9 `nested` | 2197 | chave ganha de `inheritAnimation`; `baseAnimation` imune |
| §9.10 `Pose` | 2209 | filho posado em duas camadas |
| §12.1–12.3 | 2565–2615 | nível C amplia; item 8 de DEVE; códigos novos |
| §12.4 suíte | 2712, 2740 | 8 casos na árvore; sai "aninhado" da lista do que falta; **regra do prefixo `<slot>/` nos canais do dump** |
| §12.6 limites | 2915 | profundidade de externo = 1 |
| §13.3 Spriter | 3121 | sub-entity → `socket` + `inheritAnimation` |
| §14.4 exemplos | 3368 | 3 arquivos novos |
| Apêndice A | 3442 | itens 62–66 |
| Apêndice B | 3452 | 2 pontos: mix de duas camadas normativo?; `assets.skins` vs `skin.uri` |

Schema `formato/bone.schema.json`:

| definition | linha | mudança |
|:---|---:|:---|
| raiz | 11–29 | `+ rig` |
| `assets` | 109 | `+ animations`, `+ skins` (array de `uri`) |
| `attachmentPoint` | 603 | `+ socket` |
| `attachmentSkeleton` | 612 | `+ socket`, `childSocket`, `inheritAnimation`, `baseAnimation` |
| `rig` nova | perto de 435 | `{ name, bones, slots, sockets, extensions, extras }`, `x-level: "C"` |

Tudo com `x-since: "1.0"`.

Exemplos `formato/exemplos/`:

| Arquivo | Mudança |
|:---|:---|
| `heroi.bone:193` | `hand_point` ganha `"socket": "mao_direita"` (inerte, nada consome) |
| `heroi.bone:179` | **não mexer** no anexo `sword`: mover para socket exige zerar `x: 35` e quebra `runtime/testes/aninhado.test.ts` enquanto o runtime ignora `socket` |
| `espada.bone` | slot `punho` + `point { socket: "empunhadura" }`; animação `attack` |
| **novo** `mecha.bone` | usa tudo: socket, `childSocket`, `inheritAnimation`, `baseAnimation: "idle"`, `assets.animations`, `assets.skins` |
| **novo** `mecha-animacoes.bone` | 1 osso raiz, `rig { bones }`, 2 animações |
| **novo** `mecha-pele-inverno.bone` | `rig { slots }`, 1 skin |
| `leiame.md` | 3 linhas + 1 parágrafo por arquivo |

## Casos de conformidade

Família C, próximo livre: **270**. Hoje **nenhum** caso tem anexo `skeleton`.

| id | Prende |
|:---|:---|
| `C-270-aninhado-basico` | matriz da raiz do filho; filho como bloco; evento `<slot>/<evento>`; `inheritColor` |
| `C-271-socket-encaixe` | mesma arma em dois sockets → duas poses; `childSocket` desloca |
| `C-272-socket-ausente` | socket não publicado → encaixe de hoje, L2 |
| `C-273-espelha-animacao` | `inheritAnimation`: tem → toca; não tem → fica no fundo |
| `C-274-animacao-de-fundo` | `baseAnimation` sob `nested/animation`; troca não zera o fundo |
| `C-275-animacoes-externas` | `assets.animations` traz por nome; local ganha |
| `C-276-rig-nao-atendido` | `rig.bones` cita osso ausente → L2, resto roda |
| `C-277-skin-externa` | `assets.skins` encaixa por slot; par com/sem, como A-025/A-026 |

**Sonda:** hoje nenhum canal enxerga dentro do filho (§12.4). Sem canal novo: os objetos do filho entram nos canais existentes com chave prefixada `"<slot>/…"`, a convenção que os eventos já usam. Regra normativa em §12.4.

**Dependência:** emitir o prefixo é trabalho de `runtime/`, `runtime-python/` e `conformidade/adaptador-referencia.mjs`. Como `ferramentas/testes/conformidade.test.ts` exige que o runtime de referência passe em **todos** os casos de `conformidade/casos/`, os oito casos nascem completos (`entrada.bone`, `esperado.json`, `leiame.md` com a conta à mão) em **`conformidade/casos-pendentes/`**, pasta que ninguém varre. O lote de runtime move para `casos/` quando ficarem verdes.

## Ordem de execução

Cada sub-lote: backup datado antes de escrever → editar → `npm run validar -- --todos` → `npx vitest run` → `python ferramentas/versao.py N.N "..."` → linha no `backup/INDICE.md`.

| Versão | Sub-lote | Entrega |
|:---:|:---|:---|
| **v3.1** | spec: socket e encaixe | §2.5, §4.0, §4.7, §7.2, §7.9, §7.11, §9.9, §9.10, §12.1–12.3 |
| **v3.2** | spec: contrato e externos | §2.2, §2.8, §4.8 nova, §12.6, §13.3, Apêndices A e B |
| **v3.3** | schema | 5 mudanças em `bone.schema.json`; `validar --todos` é o teste |
| **v3.4** | exemplos | `heroi`, `espada`, trio `mecha*`, `leiame.md`, §14.4, `CHANGELOG.md` |
| **v3.5** | casos + §12.4 | 8 casos em `casos-pendentes/`; §12.4; `conformidade/README.md`; `ESTADO.md` |
| *v3.6+* | *lote seguinte, runtime* | *prefixo no dump; loader de socket e externos; mover os casos* |

Backup antes de v3.1: `backup/formato_2026-09-09_antes-do-lote-socket/` com a pasta `formato/` inteira.

## Verificação

- `npm run validar -- --todos`: os 5 exemplos de hoje + 3 novos passam no schema novo.
- `npx vitest run`: 1.732 continua (nenhum teste cai; `casos-pendentes/` não é varrida).
- `node ferramentas/conformidade.mjs`: 46 de 46, intocado.
- `npx tsc --noEmit -p editor/tsconfig.json`: limpo (nada em `editor/` muda).
- Leitura cruzada: cada campo novo aparece em §4.0 (mapa), §4.7 (quem aponta), schema e um exemplo.

## Decisões tomadas por mim neste plano (avisar o Humberto)

| # | Escolha | Alternativa descartada |
|:---:|:---|:---|
| 1 | `baseAnimation` + resposta em duas camadas de ordem fixa vira **normativo** | deixar fora da 1.0; mas o recorte pede a motosserra girando sempre |
| 2 | `assets.skins` (simétrico com `atlases`) | `skin.uri` |
| 3 | Externo não encadeia (`EXTERNAL_CHAIN` L1) | biblioteca que puxa biblioteca |
| 4 | Casos nascem em `casos-pendentes/` | esperar o lote de runtime e deixar a §12.8 em dívida |
| 5 | `heroi.bone` só declara o socket; o encaixe completo vai para o lote de runtime | mover a espada agora e quebrar `aninhado.test.ts` |

## Desvios

| O plano dizia | O código pediu | O que ficou |
|:---|:---|:---|
| v3.1 spec parte 1, v3.2 spec parte 2, v3.3 schema, v3.4 exemplos, v3.5 casos | As duas partes da spec foram escritas em sequência antes da primeira versão | **v3.1** spec inteira, **v3.2** schema, **v3.3** exemplos, **v3.4** casos. Quatro versões, não cinco |
| 8 casos, C-270 a C-277 | A sonda pede **uma** animação por caso; "tem o par" e "não tem o par" do `inheritAnimation`, e "externa entra" e "local ganha", precisam de dois casos cada | **10 casos**, C-270 a C-279 (C-278 espelha-sem-par, C-279 externa-local-ganha) |
| `rig` só como contrato | Um arquivo só de animações cita ossos que não tem; pela §4.7 isso seria L1 | Regra nova na §4.8: nome que está no `rig` conta como existente dentro do arquivo. A §7.1 ganhou a mesma frase para slots de skin externa. O validador da linha de comando não confere alvos de timeline, então nada mudou em código |
| `nested/animation` ganha de `inheritAnimation` | Faltava dizer o que `null` faz: cai para a fonte 2 ou é "nada em cima"? | `null` = nenhuma animação de cima; não cai. Escrito na §9.9 e provado no C-274 |
| Códigos: `SOCKET_*`, `RIG_UNMET`, `EXTERNAL_CHAIN` | Faltavam dois casos de aviso | `RIG_INCOMPLETE` (rig cita menos do que usa) e `EXTERNAL_DUPLICATE` (nome externo igual ao local) |
| `inheritColor` medido no C-270 | O canal `slots` do dump mede a cor do slot, não o produto com o pai; a 12.4 não decide qual gravar | Fora do C-270, dito no leiame. Fica para um caso próprio |
| `nested/time` não mexe no fundo, no C-274 | Um caso com duas timelines `nested` e duas camadas ficaria difícil de conferir à mão | Fora do C-274, dito no leiame. Fica para um caso próprio |
| Validador da web sem menção | `site.test.ts` compara o schema compilado com o `bone.schema.json` | `node site/validador/construir-esquema.mjs` rodado; 334,5 kB |

Fechamento: 1.732 testes, 46/46 nos dois caminhos do executor, `tsc` limpo, 8 exemplos válidos, 10 casos pendentes com todos os `.bone` válidos.
