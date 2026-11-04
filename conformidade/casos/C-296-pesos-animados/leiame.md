# C-296-pesos-animados — um vértice passa do quadril para o tronco em 1 s

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 9.6 (`weights`), 7.4 (`worldVertices` com pesos), 5.1 |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

A timeline `weights` troca os **pesos** do `binding` no tempo, e só eles: a estrutura (dois ossos no vértice 0, um em cada um dos outros) e as `positions` não animam. O vértice 0 da malha `capa` é medido do `hips` (posição `(0, 50)` no quadril) e do `torso` (posição `(50, 0)` no tronco): na setup pose as duas contribuições caem no mesmo ponto do mundo, `(0, 150)`. O tronco gira de 90° para 180° ao longo da animação, e o peso passa de `hips 1, torso 0` para `hips 0, torso 1`. Em 0,5 s o vértice é a **média** das duas contribuições, com peso 0,5 cada; em 1 s é só o tronco. Sem renormalização (7.4): a soma já é 1 em cada chave. Os vértices 1 e 2 (peso 1 no quadril) não se mexem.

## O rig

`root` → `hips (0, 100)` → `torso`, girado 90° (aponta para cima). Slot `capa` no `hips`, malha de 3 vértices:

| Vértice | `counts` | ossos (índice → nome) | `positions` | `weights` no arquivo |
|:---:|:---:|:---|:---|:---|
| 0 | 2 | 1 → `hips`, 2 → `torso` | `(0, 50)` no hips, `(50, 0)` no torso | `1, 0` |
| 1 | 1 | 1 → `hips` | `(−20, 0)` | `1` |
| 2 | 1 | 1 → `hips` | `(20, 0)` | `1` |

Animação `dobrar`, 1 s: `torso/rotation` 90 → 180 · `weights` de `capa` `[1, 0, 1, 1]` → `[0, 1, 1, 1]`, linear.

## Contas

### Conta 1 — geométrica

```
t = 0,5: torso a 135°; pesos = média das duas chaves = [0,5, 0,5, 1, 1]
  contribuição do hips:  (0, 50) no hips → mundo (0, 150)
  contribuição do torso: (50, 0) no torso a 135° → hips + 50·(cos 135, sin 135) = (0 − 35,355339, 100 + 35,355339)
                         = (−35,355339, 135,355339)
  v0 = 0,5·(0, 150) + 0,5·(−35,355339, 135,355339) = (−17,677670, 142,677670)
  v1 = hips + (−20, 0) = (−20, 100);  v2 = (20, 100)

t = 1,0: torso a 180°; pesos = [0, 1, 1, 1]
  contribuição do torso: hips + 50·(cos 180, sin 180) = (−50, 100)
  v0 = 0·(0, 150) + 1·(−50, 100) = (−50, 100);  v1 = (−20, 100);  v2 = (20, 100)
```

### Conta 2 — `worldVertices` da §7.4 com as matrizes da §5.4

```
hips: identidade em (0, 100)
torso em t = 0,5: r = 135 → a = cos 135 = −0,707107, b = cos 225 = −0,707107, c = sin 135 = 0,707107, d = sin 225 = −0,707107; mundo (0, 100)
torso em t = 1,0: r = 180 → a = −1, b = cos 270 = 0, c = sin 180 = 0, d = sin 270 = −1; mundo (0, 100)

worldVertices, vértice 0 (j = 0 e j = 1), peso w do quadro:
  j = 0: osso hips, p = (0, 50):  (1·0 + 0·50 + 0, 0·0 + 1·50 + 100) = (0, 150)
  j = 1: osso torso, p = (50, 0):
     t = 0,5: (−0,707107·50 + (−0,707107)·0 + 0, 0,707107·50 + (−0,707107)·0 + 100) = (−35,355339, 135,355339)
     t = 1,0: (−1·50 + 0 + 0, 0·50 + 0 + 100) = (−50, 100)
  t = 0,5: w = [0,5, 0,5] → (0·0,5 + (−35,355339)·0,5, 150·0,5 + 135,355339·0,5) = (−17,677670, 142,677670)
  t = 1,0: w = [0, 1]     → (−50, 100)
vértices 1 e 2: hips × (−20, 0) = (−20, 100); hips × (20, 0) = (20, 100), peso 1
```

### As duas batem

Erros que o caso pega: ignorar a timeline (v0 fica em `(0, 150)` nas duas amostras); renormalizar (não muda aqui, de propósito: a soma é 1 — o caso da soma ≠ 1 é do validador, `RANGE_WEIGHT_SUM`); interpolar a estrutura em vez dos pesos; aplicar os pesos novos às `positions` erradas (trocar a ordem de `binding.bones`: em 0,5 daria `0,5·(0, 150) + 0,5·(hips × (50, 0))` = `(25, 125)`).

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
