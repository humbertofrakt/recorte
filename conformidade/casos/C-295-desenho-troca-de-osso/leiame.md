# C-295-desenho-troca-de-osso — a espada vai da mão às costas em 0,5 s

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 9.5 (`slot` / `bone` com `transform`), 4.3, 5.1, 12.4 (`bone` no dump de `slots`) |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

A chave `slot/bone` faz o slot `espada` sair do osso `mao` e pendurar no osso `costas` a partir de 0,5 s. O runtime **não converte nada**: a chave carrega o `transform`, a posição do anexo no espaço do osso novo, como o Spriter grava no `object_ref`. O que o caso prende, com duas amostras coladas na chave:

1. em 0,49 o anexo é medido da mão; o dump de `slots` diz `bone: "mao"`;
2. em 0,51 o anexo é medido das costas **através do `transform`**, e `bone: "costas"`;
3. **a ordem do `transform`**: `M = M_costas × T(transform) · R(transform) × anexo`. Translação primeiro, rotação depois. As costas estão giradas 90° e o `transform` desgira −90°: um runtime que aplique `R` antes de `T` põe a espada em outro lugar (a conta mostra qual).

Os ossos em si não mudam (`bones` igual nas duas amostras): o slot não entra na árvore.

## O rig

`root` → `mao (50, 100)` e `root` → `costas (−20, 120)`, girada 90°. Slot `espada` na `mao`, região `espada` com `x: 20`, 40×10.
Animação `guardar`, 1 s: `slot/espada/bone` = `null` em 0, `"costas"` em 0,5 com `transform { x: 10, y: 0, rotation: −90, scaleX: 1, scaleY: 1 }`.

## Contas

### Conta 1 — geométrica

```
região: centro em x = 20 no osso, 40×10 → cantos no osso: (0, −5) (40, −5) (40, 5) (0, 5)

t = 0,49 → osso aplicado = mao (chave null), sem transform
  cantos + (50, 100) → [50, 95, 90, 95, 90, 105, 50, 105]

t = 0,51 → osso aplicado = costas, com transform
  costas: origem (−20, 120), eixo X apontando para +Y do mundo (girada 90°)
  T(10, 0) no espaço das costas: anda 10 pelo eixo X das costas = 10 para cima no mundo → (−20, 130)
  R(−90) em cima da rotação 90 das costas → rotação total 0: os eixos voltam a coincidir com o mundo
  logo o anexo é medido de (−20, 130) sem giro:
  cantos + (−20, 130) → [−20, 125, 20, 125, 20, 135, −20, 135]
```

### Conta 2 — matrizes da §5.4, com o `transform` como um osso auxiliar filho das costas

```
costas: r = 90 → a = cos 90 = 0, b = cos 180 = −1, c = sin 90 = 1, d = sin 180 = 0; mundo (−20, 120)
transform como osso filho das costas: x = 10, y = 0, r = −90
  worldX = a·10 + b·0 + (−20) = 0 − 20 = −20
  worldY = c·10 + d·0 + 120  = 10 + 120 = 130
  local: la = cos(−90) = 0, lb = cos 0 = 1, lc = sin(−90) = −1, ld = sin 0 = 0
  linear = [0 −1; 1 0] × [0 1; −1 0] = [0·0 + (−1)(−1), 0·1 + (−1)·0; 1·0 + 0·(−1), 1·1 + 0·0] = [1 0; 0 1]
  → M = T(−20, 130), identidade
vértices = (px − 20, py + 130) para (0, −5) (40, −5) (40, 5) (0, 5) → [−20, 125, 20, 125, 20, 135, −20, 135]

em 0,49, M = M_mao = T(50, 100): (px + 50, py + 100) → [50, 95, 90, 95, 90, 105, 50, 105]
```

### As duas batem

O erro de ordem, para ficar registrado: `M_costas × R(−90) × T(10, 0)` leva `(10, 0)` primeiro por `R(−90)` → `(0, −10)`, e depois pelas costas → `(−20 + (−1)(−10), 120 + 0) = (−10, 120)`: a espada sairia em `[−10, 115, 30, 115, 30, 125, −10, 125]`. Outro erro: esquecer o `transform` e pendurar a espada crua nas costas → `M_costas × anexo`, cantos girados 90° a partir de `(−20, 120)`: `[−15, 120, −15, 160, −25, 160, −25, 120]`.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
