# C-290-virada-corte-seco — o homem vira lobisomem no meio da animação

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 9.13 (`body`), 9.10 (`Pose` recebe o projeto), 5.1 (a base é por corpo), 12.4 (`body` no dump) |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

A timeline `body` troca de corpo em 0,5 s, **corte seco**. Antes, a animação corre no corpo do arquivo (o homem); depois, no lobisomem, que tem **outra base**: o tronco mais alto e um osso `rabo` que o homem não tem. Três coisas ficam presas:

1. **`corpoEm`**: antes da primeira chave `body` vale o **arquivo**, e não a primeira chave (a única exceção à regra de 9.10). Em 0,25 o dump traz `body: null`, o osso `braco` e nenhum `rabo`; em 0,75 traz `body: "lobisomem.bone"`, o `rabo` e nenhum `braco`.
2. **As timelines casam por nome com o corpo do instante.** A linha `rabo/rotation` existe desde `t = 0` e é **ignorada** enquanto o corpo é o homem (aviso `BODY_UNMET`, uma vez); a linha `braco/rotation` para de ser lida depois da virada. A linha `tronco/x` vale nos dois, porque os dois têm `tronco`. Nada é convertido.
3. **A base é do corpo do instante.** O `tronco` do homem está em `y = 100`; o do lobisomem, em `y = 120`. A região `corpo` do homem tem 20×40; a do lobisomem, 30×60. O canal `vertices` denuncia qual base está viva.

E o validador: `rabo` não existe em `entrada.bone`, e mesmo assim a timeline **não é L1** (4.7): a chave `body` declara o lobisomem, e ele tem o osso.

## O rig

`entrada.bone` (o homem): `root` → `tronco (0, 100)` → `braco (0, 0)`. Slot `corpo` no `tronco`, região 20×40.
`lobisomem.bone`: `root` → `tronco (0, 120)` → `rabo (−10, 0)`. Slot `corpo` no `tronco`, região 30×60.

Animação `transformar`, 1 s: `body` = `"lobisomem.bone"` em 0,5 · `tronco/x` 0 → 40 · `braco/rotation` 0 → 90 · `rabo/rotation` 0 → 60, tudo linear.

## Contas

### Conta 1 — geométrica

```
t = 0,25 → corpo = homem (nenhuma chave body com time <= 0,25)
  tronco/x = 0 + 40·0,25 = 10 → tronco em (10, 100), sem giro
  braco/rotation = 0 + 90·0,25 = 22,5 → braco na origem do tronco, (10, 100), girado 22,5°
  rabo/rotation: o homem não tem rabo → ignorada
  corpo/corpo (20×40, centro no tronco): cantos (±10, ±20) + (10, 100)
    BL (0, 80)  BR (20, 80)  TR (20, 120)  TL (0, 120)

t = 0,75 → corpo = lobisomem (última chave body com time <= 0,75 é a de 0,5)
  tronco/x = 0 + 40·0,75 = 30 → tronco em (30, 120)
  rabo/rotation = 0 + 60·0,75 = 45 → rabo em tronco + (−10, 0) = (20, 120), girado 45°
  braco/rotation: o lobisomem não tem braco → ignorada
  corpo/corpo (30×60): cantos (±15, ±30) + (30, 120)
    BL (15, 90)  BR (45, 90)  TR (45, 150)  TL (15, 150)
```

### Conta 2 — matrizes da §5.4 (modo `normal`, `sx = sy = 1`)

Matriz local de um osso com rotação `r`: `a = cos r`, `b = cos(r + 90)`, `c = sin r`, `d = sin(r + 90)`. Mundo do filho: `worldX = pa·x + pb·y + pwX`, `worldY = pc·x + pd·y + pwY`, e a parte linear é o produto `[pa pb; pc pd] × [la lb; lc ld]`.

```
t = 0,25 (homem)
  tronco: pai = root (identidade). x = 10, y = 100, r = 0 → [1 0; 0 1], mundo (10, 100)
  braco:  pai = tronco. x = 0, y = 0, r = 22,5
          la = cos 22,5 = 0,923880   lb = cos 112,5 = −0,382683
          lc = sin 22,5 = 0,382683   ld = sin 112,5 = 0,923880
          mundo = (1·0 + 0·0 + 10, 0·0 + 1·0 + 100) = (10, 100)
          linear = identidade × local → a 0,923880  b −0,382683  c 0,382683  d 0,923880
  vértices: localToWorld(tronco, px, py) = (px + 10, py + 100) para cada canto (±10, ±20)
          → [0, 80, 20, 80, 20, 120, 0, 120]

t = 0,75 (lobisomem)
  tronco: x = 30, y = 120, r = 0 → identidade, mundo (30, 120)
  rabo:   x = −10, y = 0, r = 45
          la = 0,707107  lb = cos 135 = −0,707107  lc = 0,707107  ld = sin 135 = 0,707107
          mundo = (1·(−10) + 0·0 + 30, 0·(−10) + 1·0 + 120) = (20, 120)
          a 0,707107  b −0,707107  c 0,707107  d 0,707107
  vértices: (px + 30, py + 120) para (±15, ±30) → [15, 90, 45, 90, 45, 150, 15, 150]
```

### As duas batem

Mesmos seis números por osso, mesmos oito por região, em cada amostra. O que um runtime **errado** daria: quem lê "antes da primeira chave, a primeira chave" mostra o lobisomem em 0,25 (tronco em `(10, 120)`, região 30×60); quem remonta o esqueleto convertendo as timelines mostra o `braco` depois da virada.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
