# C-293-virada-e-pilha — a pilha de peles passa, ou não passa, na virada

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 9.13 (`keepSkins`), 4.4 (a pilha; a de cima vence), 7.1 |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

A sonda põe na pilha `["default", "armadura"]`, de baixo para cima. Os dois corpos têm as duas peles, com regiões de tamanhos diferentes, todas no mesmo placeholder `corpo`: **só a geometria denuncia** qual pele está em cima e em qual corpo. A animação vira duas vezes:

| Chave | `value` | `keepSkins` | O que acontece |
|:---:|:---|:---:|:---|
| 0,3 | `lobisomem.bone` | `true` (o padrão) | a pilha passa pelo nome: o lobisomem entra com `["default", "armadura"]`, e a `armadura` dele (36×72) vence |
| 0,6 | `null` (volta ao arquivo) | `false` | o homem volta **só com `["default"]`**: a armadura dele (24×48) não aparece; vale a `default` (20×40) |

Três amostras: 0,15 (homem, armadura por cima), 0,45 (lobisomem, armadura por cima), 0,75 (homem, só default). É a resposta Q39 do Humberto (*"depende do projeto: decide quem está fazendo"*) e a Q32 (*"a de cima vence"*) num caso só.

## O rig

`entrada.bone` (homem): `root` → `tronco (0, 100)`. Slot `corpo`. Peles: `default` (região 20×40), `armadura` (24×48).
`lobisomem.bone`: `root` → `tronco (0, 120)`. Slot `corpo`. Peles: `default` (30×60), `armadura` (36×72).
Animação `vestir`, 1 s: só a timeline `body` acima.

## Contas

### Conta 1 — a pilha e a geometria

```
t = 0,15 → corpo = homem; pilha = [default, armadura]; a de cima (armadura) dá corpo → 24×48
  cantos (±12, ±24) + tronco (0, 100) → [−12, 76, 12, 76, 12, 124, −12, 124]
t = 0,45 → chave 0,3: lobisomem, keepSkins true → pilha = [default, armadura] (os dois nomes existem lá)
  a de cima (armadura do lobisomem) → 36×72; cantos (±18, ±36) + tronco (0, 120) → [−18, 84, 18, 84, 18, 156, −18, 156]
t = 0,75 → chave 0,6: null (o arquivo), keepSkins false → pilha = [default]
  default do homem → 20×40; cantos (±10, ±20) + (0, 100) → [−10, 80, 10, 80, 10, 120, −10, 120]
```

### Conta 2 — a resolução de 4.4, passo a passo

```
lista = para cada pele da pilha, de baixo para cima: (includes dela, depois ela)
para pele em reversed(lista): se pele.attachments[corpo] tem "corpo": é este

t = 0,15  lista = [default, armadura] → reversed: armadura primeiro → tem "corpo" → região 24×48 do homem
          localToWorld(tronco (0,100), ±12, ±24) → [−12, 76, 12, 76, 12, 124, −12, 124]
t = 0,45  pilha passada pelo nome ao lobisomem: [default, armadura] → armadura do lobisomem → 36×72
          localToWorld(tronco (0,120), ±18, ±36) → [−18, 84, 18, 84, 18, 156, −18, 156]
t = 0,75  pilha nova: [default] → reversed: só default → 20×40 do homem
          localToWorld(tronco (0,100), ±10, ±20) → [−10, 80, 10, 80, 10, 120, −10, 120]
```

### As duas batem

Erros que o caso pega: a `default` "sempre por baixo, sempre ativa" (não muda aqui, mas `keepSkins: false` com uma `default` implícita daria o mesmo resultado por acidente — por isso a terceira amostra volta ao **homem**, cuja `armadura` tem 24×48 e não pode aparecer); a pilha esquecida na virada (0,45 daria 30×60); `keepSkins` ignorado (0,75 daria 24×48).

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
