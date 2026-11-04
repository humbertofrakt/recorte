# C-297-retarget-translacao — a animação de fora se ajusta ao tamanho do boneco

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 2.8 (`assets.animations` e `rig.reference`), 4.8 |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

`andar.bone` foi gravado num boneco cujo `tronco` media **60**. O hospedeiro tem um `tronco` de **120**. O arquivo de animações declara `rig.reference: { bone: "tronco", length: 60 }`; ao copiar a animação, o leitor calcula `k = 120 / 60 = 2` e multiplica por `k` os valores das timelines `bone/x` e `bone/y` **da animação de fora**. A rotação não muda. É a opção do Spine que o Humberto pediu (Q41, F24). O `cabeca`, filho do tronco, mostra que o ajuste é só nas translações da animação: a posição do filho no pai (`x: 120`) é do hospedeiro e não é tocada.

## O rig

`entrada.bone`: `root` → `tronco (0, 100)`, `length: 120` → `cabeca (120, 0)`. `assets.animations: ["andar.bone"]`.
`andar.bone`: `rig.bones: ["tronco"]`, `rig.reference: { tronco, 60 }`. Animação `andar`, 1 s: `tronco/x` 0 → 30 · `tronco/y` 100 → 110 · `tronco/rotation` 0 → 45, linear.

## Contas

### Conta 1 — o fator e a pose

```
k = length do hospedeiro / reference.length = 120 / 60 = 2
timelines copiadas: x: 0 → 60 (×2) · y: 200 → 220 (×2) · rotation: 0 → 45 (não muda)

t = 0,5:
  tronco.x = 0 + 60·0,5 = 30        (sem k seria 15)
  tronco.y = 200 + 20·0,5 = 210     (sem k seria 105)
  tronco.rotation = 22,5
  tronco em (30, 210), girado 22,5°
  cabeca = tronco + 120·(cos 22,5, sin 22,5) = (30 + 120·0,923880, 210 + 120·0,382683)
         = (30 + 110,865544, 210 + 45,922012) = (140,865544, 255,922012), girada 22,5° (herda)
```

### Conta 2 — matrizes da §5.4, com `k` aplicado no valor da chave antes de `evaluate`

```
evaluate(x, 0,5) = 0·2 + (30·2 − 0·2)·0,5 = 30   // multiplicar as chaves por k e interpolar
                 = 2·(0 + 30·0,5) = 30            // é o mesmo que interpolar e multiplicar: k é linear
evaluate(y, 0,5) = 2·(100 + 10·0,5) = 210
tronco: x = 30, y = 210, r = 22,5
  la = cos 22,5 = 0,923880  lb = cos 112,5 = −0,382683  lc = 0,382683  ld = 0,923880
  pai = root (identidade) → mundo (30, 210); a 0,923880  b −0,382683  c 0,382683  d 0,923880
cabeca: x = 120, y = 0, r = 0
  worldX = 0,923880·120 + (−0,382683)·0 + 30 = 110,865544 + 30 = 140,865544
  worldY = 0,382683·120 + 0,923880·0 + 210  = 45,922012 + 210 = 255,922012
  linear = tronco × identidade → a 0,923880  b −0,382683  c 0,382683  d 0,923880
```

### As duas batem

Sem `k` (o erro do 0.1, que copiava as timelines cruas): tronco em `(15, 105)` e cabeça em `(125,865544, 150,922012)`. Se `k` multiplicasse também a rotação, o tronco estaria a 45° em 0,5. Se `k` multiplicasse a posição da `cabeca` no pai, ela sairia em `(30 + 240·0,923880, …)`.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
