# Runtime de referência — Recorte (.bone)

Biblioteca TypeScript que lê um arquivo `.bone` + atlas e calcula a pose de um esqueleto 2D a cada quadro. É a implementação de referência da especificação em `../formato/ESPECIFICACAO 2026-09-06.md`.

Sem dependências de engine. Roda no navegador e no Node.

## Estado — fase 2 fechada

Tudo o que a spec pede para calcular e desenhar um quadro está implementado:
as cinco constraints (§6), os parâmetros e o driver (§8.1, §8.2), a lista de
desenho com máscara (§7.7) e um renderizador Canvas 2D (§7).

- **324 testes** passando (`npx vitest run`), `npx tsc --noEmit` limpo.
- As cinco constraints são reais: `NoopConstraint` não é mais usada por
  nenhum tipo. Basta importar `src/index.ts` para que os registros valham.
- `testes/heroi.test.ts` carrega `formato/exemplos/heroi.bone` do disco e roda
  as três animações do início ao fim, quadro a quadro.
- `ferramentas/render-png.mjs` grava um PNG do quadro (prova visual e base do
  pose dump de §12.4).

Esqueleto aninhado (§7.11) já é instanciado e desenhado, no runtime, no
`render-png.mjs` e no editor.

Camadas de animação (tracks), crossfade e máscara de ossos estão em
`src/animation-state.ts` (requisitos A5 e T5). É máquina de runtime: **nenhum
campo novo entra no arquivo**. O único campo do formato que ele lê é
`animation.defaultMix` (§4.6), a dica de crossfade que o `.bone` já carregava e
que ninguém consumia.

## Rascunho 0.2 — degrau 2 (17/09/2026)

O runtime lê a spec `../formato/ESPECIFICACAO 2026-09-17.md`.

| O quê | Onde | Como se usa |
|:---|:---|:---|
| Pilha de peles, sem `default` implícita (§4.4) | `skeleton.ts` | `setSkinStack(["armadura"])` é a pilha exata. `setSkin(...)` continua pondo a `default` por baixo, porque o editor conta com isso |
| Virada de corpo (§9.13) | `actor.ts` | `new Actor(data, arquivo.bodies)`; `actor.pose(animação, t)`. Um `Skeleton` por corpo, montado uma vez |
| O desenho troca de osso (§9.5) | `skeleton.ts`, `animation.ts` | `Slot.bone` é o osso aplicado; `Slot.boneMatrix` já traz o `transform` da chave |
| Pesos animados (§9.6) | `animation.ts`, `vertex-attachment.ts` | timeline `weights`, pelo mesmo caminho do `deform` |
| Animações e peles de fora, pele com osso, `rig.reference` (§2.8) | `externos.ts`, `file.ts` | `loadSkeletonFile(bytes, { files })` lê os arquivos ao lado |
| As duas camadas do filho e `inheritAnimation` (§7.11) | `nested.ts` | vem do anexo `skeleton` |
| Avisos novos | `loader.ts`, `actor.ts` | `BODY_UNMET`, `RIG_UNMET`, `SLOT_BONE_UNMET`, `RANGE_WEIGHTS_SIZE`, `CLIP_SELF_INTERSECT`, `BODY_MISSING`, `ENTITY_GONE` |

## Pastas

| Pasta | O que tem |
|:---|:---|
| `src/` | código-fonte (ES modules, TypeScript estrito, identificadores em inglês) |
| `testes/` | testes unitários (Vitest) e casos de conformidade |

As notas de desenvolvimento saíram desta pasta e estão em
`documentos/notas-de-desenvolvimento/`:

| Arquivo | O que tem |
|:---|:---|
| `DUVIDAS-SPEC.md` | pontos da spec que precisam de decisão |
| `PEDIDOS-FUNDACAO.md` | pedidos entre módulos (os dois abertos foram atendidos) |

## Arquivos de `src/`

| Arquivo | O que faz |
|:---|:---|
| `index.ts` | Exporta tudo. Importa `constraints/*.ts` por efeito colateral: é o que troca as fábricas "noop" pelas reais. |
| `types.ts` | Tipos do JSON do `.bone` e do atlas, como estão no arquivo (campos opcionais = opcionais). |
| `math.ts` | Graus/radianos, `clamp`, `normalizeAngle`, `atan2(0,0)=0`, matriz 2×3 e inversa com guarda de determinante (§3.6, §5.5). |
| `curve.ts` | Curvas de chave normalizadas (`linear`, `stepped`, Bézier com clamp de `cx1` e `cx2`) e amostragem exata (§9.3). |
| `data.ts` | Classes de dados imutáveis: `SkeletonData`, `BoneData`, `SlotData`, `SkinData`, constraints, eventos, parâmetros, morphs, variáveis, animações, timelines resolvidas e atlas (`AtlasData`, UV §10.4). |
| `loader.ts` | `loadSkeletonData(json, opções)`, `loadAtlas(json)` e as versões por texto (`parseBoneText`, `loadSkeletonFromText`, `loadAtlasFromText`: aceitam BOM e recusam chave repetida, §2.1). Aplica padrões, resolve nomes, valida uris (§2.8), detecta ciclos e referências quebradas com os fallbacks da spec (§4.7, §2.5). Erros citam o JSON Pointer. `{ strict: true }` transforma todo L1 em erro; `{ allowMissingRequiredExtensions: true }` carrega degradado um arquivo com extensão obrigatória desconhecida (§2.7). |
| `uri.ts` | Regras de uri de §2.8 (`validateUri`, `joinUri`): relativa, sem `..`, sem barra invertida, sem `:`, percent-encoding decodificado, 1024 code points. |
| `json-text.ts` | BOM e chave duplicada no texto JSON (§2.1), com JSON Pointer. |
| `skeleton.ts` | Instâncias: `Bone` (pose local, aplicada e mundo; §5.4 e §5.5; `updateWorldTransformWithChildren` para a regra de sujeira), `Slot`, `Skeleton` (`updateWorldTransform(now)` §5.6 com o relógio `time` de §6.5, `advance(dt)`, skins combinadas §4.4, `getBounds`, `setParameter`). |
| `animation.ts` | `evaluate*` e `applyAnimation` / `pose` (§9.10: busca binária, primeira chave antes da primeira chave, rotação sem wrap, deform com curva única), `fireEvents` (§8.6), `applyResets` (§9.8), `activeTags` (§8.5). |
| `animation-state.ts` | Camadas (tracks), crossfade e mistura por propriedade. `AnimationState` (camada corrente, tempo, laço, velocidade, alpha, fila com atraso, máscara de ossos, ouvintes), `AnimationStateData` (tabela de duração de mistura por par, com `defaultMix` de §4.6 como padrão) e `applyAnimationMixed` — o `applyAnimation` de §9.10 com alpha, modo de mistura (`setup`, `first`, `replace`, `add`) e máscara. Com alpha 1 e sem máscara ele escreve exatamente o que §9.10 manda. |
| `sequence-frame.ts` | Frame de uma sequência no tempo `t` (§9.6), os sete modos. |
| `color.ts` | Cor final `light`/`dark` (§7.12), `shadeTexel`, fatores de blend. |
| `render-list.ts` | O que desenhar num quadro com a máscara ativa (§7.7, §7.13). A geometria do recorte fica com o renderizador. |
| `parameters.ts` | Valor de um parâmetro no quadro (§8.1): `source` num osso, senão timeline / API do jogo / padrão, sempre por `constrain` (clamp ou repeat). |
| `constraints/constraint.ts` | Interface `Constraint` (`update(skeleton, now)`), registro `registerConstraint` / `createConstraint` e a `NoopConstraint` de reserva. Cada arquivo irmão registra o tipo real ao ser importado (o último registro vence). |
| `constraints/ik.ts` | IK de 1 e 2 ossos (§6.2): `bendPositive`, `compress`, `stretch`, `uniform`, `softness`. |
| `constraints/transform.ts` | Transform constraint (§6.3): `local`, `relative`, os seis mixes e os offsets. |
| `constraints/path.ts` | Path constraint (§6.4): `positionMode`, `spacingMode`, `rotateMode`, tabela de arco com `constantSpeed`, caminho aberto e fechado. |
| `constraints/physics.ts` | Física de mola (§6.5): inércia, força, amortecimento, massa, vento, gravidade, `limit`, `fps` e `reset`. |
| `constraints/driver.ts` | Driver (§8.2): modo alvos (keyforms com `input` no lugar de `time`) e modo contínuo (o parâmetro vira tempo numa animação-controle). Escreve a pose **aplicada**. |
| `render/canvas.ts` | Renderizador Canvas 2D de referência (§7): region por matriz afim, mesh triângulo a triângulo, recorte, cor `light`/`dark`, blends e desenho de depuração. Detalhes e limites em `src/render/README.md`. |
| `attachments/attachment.ts` | Base de todo attachment (nome do placeholder, cor). |
| `attachments/vertex-attachment.ts` | Base de `mesh`, `linkedmesh`, `boundingbox`, `clipping`, `path`: `binding` SoA e `computeWorldVertices` com deform + morph (§7.4, §8.3). |
| `attachments/region.ts` | `region`: cantos e UVs pré-calculados a partir do atlas (§7.3), um conjunto por frame de sequência; `offsetsFor(slot)` / `uvsFor(slot)` escolhem o frame sem mudar o attachment. |
| `attachments/mesh.ts` | `mesh`: UVs da imagem original mapeados para a página, por frame de sequência (`regionUVsFor(slot)`). |
| `attachments/linkedmesh.ts` | `linkedmesh`: compartilha os arrays da mesh pai (§7.5), com sequência própria. |
| `attachments/boundingbox.ts` | `boundingbox`: polígono, retângulo ou elipse (16 pontos). |
| `attachments/clipping.ts` | `clipping`: máscara com `end`, `slots[]`, `invert`. |
| `attachments/path.ts` | `path`: âncoras Bézier e `lengths`. |
| `attachments/point.ts` | `point`: posição e rotação no mundo (§7.9). |
| `attachments/skeleton-attachment.ts` | `skeleton` (aninhado): dados e matriz de pai para a raiz do filho (§7.11). |
| `attachments/sequence.ts` | Sequência de imagens: nomes dos frames e regiões resolvidas (§7.10). |
| `actor.ts` | `Actor`: um projeto com vários corpos e a virada (§9.13). `corpoEm`, casamento por nome com cache, pilha por `keepSkins`, entidade que continua, física do corpo que entra do zero. |
| `externos.ts` | `composeExternals`: dobra `assets.skins` e `assets.animations` no JSON antes de carregar (§2.8): osso, slot e regra `skinRequired` no fim, `rig` conferido, `rig.reference` escala `x` e `y`. |

## Testes (`testes/`)

| Arquivo | Cobre |
|:---|:---|
| `math.test.ts` | Ângulos, guardas, matriz, curvas. |
| `loader.test.ts` | `minimo.bone`, `heroi.bone` + atlas, padrões, erros e fallbacks. |
| `skeleton.test.ts` | Cadeia calculada à mão, os modos `inherit*`, mundo ↔ local, skins, relógio `now`, regra de sujeira, sinal do `shearY` da raiz (DUVIDAS 10). |
| `attachments.test.ts` | Cantos de `region` com atlas girado, frames de sequência por slot, skinning de `mesh`, morph, linkedmesh (deform herdado ou não), buffer de deform reutilizado. |
| `animation.test.ts` | `evaluate` (350→10 dá 180 no meio, primeira chave antes da primeira chave, stepped, Bézier), frames de sequência, `applyAnimation`/`pose`, eventos com loop, resets, tags, cor final, ordem de desenho com clipping. |
| `constraint-ik.test.ts`, `constraint-transform.test.ts`, `constraint-path.test.ts`, `constraint-physics.test.ts`, `constraint-driver.test.ts` | As cinco constraints, valores derivados à mão do pseudocódigo da spec. |
| `animation-state.test.ts` | Crossfade no meio da transição com valor calculado à mão, camada de cima com alpha 0,5, máscara de ossos, os quatro modos de mistura, fila com atraso, ouvintes na ordem, laço e evento uma vez por volta. |
| `render.test.ts` | Matriz afim do triângulo, quadrilátero do `region` (inclusive girado no atlas), mapa de blends, lista exata de `collectDrawables` do herói. |
| `virada.test.ts` | O `Actor`: `corpoEm`, nenhum esqueleto remontado, casamento por nome, `keepSkins`, corpo que falta, física, entidade que continua, `AnimationState` e desenho. |
| `externos.test.ts` | Pele de fora com osso, animações de fora, `rig.reference`, profundidade 1, arquivo faltando, o leitor `files`. |
| `heroi.test.ts` | O exemplo inteiro: carrega do disco, monta o esqueleto, confere as cinco constraints reais, nenhuma matriz NaN, as três animações quadro a quadro a 1/60 s com os eventos esperados e a lista de desenho. |

## Comandos (na raiz do projeto)

```bash
npx tsc --noEmit -p tsconfig.json
npx vitest run
node ferramentas/validador/validar.mjs --todos
node ferramentas/render-png.mjs walk 0.5 saida.png
```

`render-png.mjs` é um rasterizador próprio em JS puro, sem dependências: lê o
PNG do atlas com um decodificador mínimo (zlib do Node), preenche os
triângulos amostrando a textura por vizinho mais próximo, aplica a cor de
§7.12 e a máscara de §7.7, desenha as linhas dos ossos e grava o PNG com
`zlib.deflate`. Sem antialias, sem filtro bilinear e sem esqueleto aninhado
(§7.11, o `sword` do herói sai como "sem imagem"). Ele compila `runtime/src`
para `ferramentas/visualizador/dist` quando precisa.

Licença: Apache 2.0 (ferramentas) · Especificação: CC-BY 4.0
