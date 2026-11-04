# C-294-pele-externa-com-osso — a pele de fora traz o osso do rabo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 2.8 (`assets.skins`: a pele traz osso), 4.8 (`rig`), 7.1 (`skinRequired`), 4.4 (a pilha) |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

O hospedeiro tem `root` → `tronco` e um slot `corpo`. A pele `lobisomem` mora em `rabo.bone`, citada em `assets.skins`, e precisa de um osso que o hospedeiro **não tem**: ela o traz. Do arquivo da pele entram no corpo (2.8): o osso `rabo` (`skinRequired: true`, pendurado em `tronco`, que o `rig` declara), o slot `rabo` (no fim da ordem de desenho) e a pele. O osso `root` do arquivo da pele, sem `skinRequired`, é ignorado sem aviso. Com a pilha `["default", "lobisomem"]` o rabo aparece, girado 30°, atrás do tronco. É a resposta Q40 do Humberto (F23), e o par do C-277.

O que o caso prende: o osso trazido é calculado como qualquer outro (matriz de mundo em `bones`); o slot trazido entra **no fim** de `drawOrder`; a região da pele externa resolve o tamanho pelo próprio anexo (`width`/`height` gravados), sem atlas.

## O rig

`entrada.bone`: `root` → `tronco (0, 100)`. Slot `corpo` (20×40). `assets.skins: ["rabo.bone"]`.
`rabo.bone`: `rig.bones: ["tronco"]`. Ossos: `root` (ignorado) e `rabo` (`parent: tronco`, `x: −10`, `rotation: 30`, `skinRequired`). Slot `rabo` no osso `rabo`. Pele `lobisomem` com `bones: ["rabo"]` e a região `rabo` (`x: 10`, 20×6).

## Contas

### Conta 1 — geométrica

```
tronco = (0, 100), sem giro
rabo = tronco + (−10, 0) = (−10, 100), girado 30°
região rabo: centro em x = 10 no osso, 20×6 → cantos no osso: (0, −3) (20, −3) (20, 3) (0, 3)
girar 30° (cos 0,866025, sin 0,5) e somar (−10, 100):
  (0, −3)  → (0 + 1,5,        0 − 2,598076)        = (1,5, −2,598076)          → (−8,5, 97,401924)
  (20, −3) → (17,320508 + 1,5, 10 − 2,598076)      = (18,820508, 7,401924)     → (8,820508, 107,401924)
  (20, 3)  → (17,320508 − 1,5, 10 + 2,598076)      = (15,820508, 12,598076)    → (5,820508, 112,598076)
  (0, 3)   → (−1,5,           2,598076)            = (−1,5, 2,598076)          → (−11,5, 102,598076)
corpo/corpo: (±10, ±20) + (0, 100) → [−10, 80, 10, 80, 10, 120, −10, 120]
ordem de desenho: [corpo] do hospedeiro, depois [rabo] trazido → ["corpo", "rabo"]
```

### Conta 2 — matrizes da §5.4

```
rabo: pai = tronco (identidade em (0, 100)); x = −10, y = 0, r = 30
  la = cos 30 = 0,866025   lb = cos 120 = −0,5   lc = sin 30 = 0,5   ld = sin 120 = 0,866025
  worldX = 1·(−10) + 0·0 + 0 = −10;  worldY = 0·(−10) + 1·0 + 100 = 100
  a 0,866025  b −0,5  c 0,5  d 0,866025
vértices = (a·px + b·py − 10,  c·px + d·py + 100):
  (0, −3)  → (0 + 1,5 − 10, 0 − 2,598076 + 100) = (−8,5, 97,401924)
  (20, −3) → (17,320508 + 1,5 − 10, 10 − 2,598076 + 100) = (8,820508, 107,401924)
  (20, 3)  → (17,320508 − 1,5 − 10, 10 + 2,598076 + 100) = (5,820508, 112,598076)
  (0, 3)   → (−1,5 − 10, 2,598076 + 100) = (−11,5, 102,598076)
```

### As duas batem

Erros que o caso pega: ignorar `bones` do arquivo de pele (regra do 0.1) — o slot `rabo` fica sem osso e some, ou pendura em `bones[0]` e sai em `(−10, 0)`; pôr o slot trazido antes dos locais; remontar o esqueleto ao trocar de pele (não muda o número aqui, mas muda a `physics` de quem tiver).

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
