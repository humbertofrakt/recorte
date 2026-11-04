# C-292-virada-e-entidade — a espada continua no slot de mesmo nome, e some no corpo que não o tem

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 9.13 (`body` e entidades), 7.11 (a entidade segue a imagem; o relógio do filho), 12.4 (canais prefixados `<slot>/`) |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

Três corpos. O homem e o lobisomem têm um slot `espada` com o **mesmo** anexo `skeleton` (`espada.bone`, `x: 5`, animação `girar` em laço), em ossos diferentes (`mao` e `garra`). O lobo não tem o slot. A animação vira para o lobisomem em 0,4 e para o lobo em 0,8. Três coisas presas:

1. **A entidade segue a imagem**: a raiz da espada cai em `M_ossoDoSlot × T(5, 0)`, sem socket. No homem é a mão, no lobisomem é a garra: mesma regra, outro osso.
2. **O relógio do filho não zera na virada** quando o corpo novo tem o slot de mesmo nome com a mesma `uri` (7.11): a lâmina gira 90°/s desde `t = 0`; em 0,6 está a **54°**, e não a 18° (que seria "recomeçou em 0,4").
3. **Sem o slot, sem desenho**: no lobo, nenhum canal traz `espada/…`, e `drawOrder` é `["corpo"]`. É o canal `drawOrder`, comparado como lista exata, que prova a ausência — os outros canais só comparam o que o esperado cita. O runtime avisa uma vez e **não inventa** (regra 21).

## O rig

`entrada.bone` (homem): `root` → `tronco (0, 100)` → `mao (30, 0)`. Slots `corpo` (tronco, 20×40) e `espada` (mao, `skeleton`).
`lobisomem.bone`: `root` → `tronco (0, 120)` → `garra (40, 10)`. Slots `corpo` (30×60) e `espada` (garra, o mesmo `skeleton`).
`lobo.bone`: `root` → `tronco (0, 80)`. Só o slot `corpo` (40×20).
`espada.bone`: `root` → `lamina (20, 0)`. Região `lamina` com `x: 15`, 20×10. Animação `girar`: `lamina/rotation` 0 → 90 em 1 s, laço.

Animação `transformar` do homem, 1 s: `body` = `"lobisomem.bone"` em 0,4 e `"lobo.bone"` em 0,8. Nenhuma outra timeline.

## Contas

### Conta 1 — geométrica

```
relógio da espada: começa em 0 quando o anexo fica ativo, em t = 0; anda com t
  lamina/rotation(t) = 90·t  →  0,2 → 18°   0,6 → 54°   (não zera em 0,4: mesmo slot, mesma uri)

t = 0,2 (homem)
  mao = tronco + (30, 0) = (30, 100)
  espada/root = mao + (5, 0) = (35, 100), sem giro
  espada/lamina = root da espada + (20, 0) = (55, 100), girada 18°
    (a posição do osso lamina é medida no espaço do pai, que não gira; só a lâmina gira)
  cantos da região (x 15, 20×10) no espaço da lâmina: (5, −5) (25, −5) (25, 5) (5, 5)
  girar 18° e somar (55, 100):  cos 18 = 0,951057  sin 18 = 0,309017
    (5, −5)  → (5·0,951057 + 5·0,309017, 5·0,309017 − 5·0,951057) = (6,300368, −3,210198) → (61,300368, 96,789802)
    (25, −5) → (23,776413 + 1,545085, 7,725425 − 4,755283)          = (25,321498, 2,970142)  → (80,321498, 102,970142)
    (25, 5)  → (23,776413 − 1,545085, 7,725425 + 4,755283)          = (22,231328, 12,480707) → (77,231328, 112,480707)
    (5, 5)   → (4,755283 − 1,545085, 1,545085 + 4,755283)           = (3,210198, 6,300368)   → (58,210198, 106,300368)
  corpo/corpo (20×40 em (0, 100)): [−10, 80, 10, 80, 10, 120, −10, 120]

t = 0,6 (lobisomem)
  garra = tronco + (40, 10) = (40, 130)
  espada/root = (45, 130);  espada/lamina = (65, 130), girada 54°
  cos 54 = 0,587785  sin 54 = 0,809017
    (5, −5)  → (2,938926 + 4,045085, 4,045085 − 2,938926) = (6,984011, 1,106159)   → (71,984011, 131,106159)
    (25, −5) → (14,694631 + 4,045085, 20,225425 − 2,938926) = (18,739716, 17,286499) → (83,739716, 147,286499)
    (25, 5)  → (14,694631 − 4,045085, 20,225425 + 2,938926) = (10,649546, 23,164351) → (75,649546, 153,164351)
    (5, 5)   → (2,938926 − 4,045085, 4,045085 + 2,938926)  = (−1,106159, 6,984011)  → (63,893841, 136,984011)
  corpo/corpo (30×60 em (0, 120)): [−15, 90, 15, 90, 15, 150, −15, 150]

t = 0,9 (lobo)
  tronco = (0, 80); sem slot espada → nenhum canal `espada/…`; drawOrder = ["corpo"]
  corpo/corpo (40×20 em (0, 80)): [−20, 70, 20, 70, 20, 90, −20, 90]
```

### Conta 2 — matrizes da §5.4 e §7.11

```
P = M_ossoDoSlot × T(5, 0)                           // 7.11, sem socket: x = 5, y = 0, rotation 0, escala 1
raiz da espada: pai = P, local identidade → mundo = P
lamina: pai = raiz, x = 20, r = 90·t
   worldX = 1·20 + 0·0 + P.x = P.x + 20;  worldY = P.y
   linear = [cos r  cos(r+90); sin r  sin(r+90)]

t = 0,2: M_mao = T(30, 100) → P = T(35, 100) → lamina em (55, 100)
   a 0,951057  b cos 108 = −0,309017  c 0,309017  d sin 108 = 0,951057
   vértices = a·px + b·py + 55,  c·px + d·py + 100   para os quatro cantos → os oito números da conta 1
t = 0,6: M_garra = T(40, 130) → P = T(45, 130) → lamina em (65, 130)
   a 0,587785  b cos 144 = −0,809017  c 0,809017  d sin 144 = 0,587785
   vértices → os oito números da conta 1
t = 0,9: corpoEm = lobo; o lobo não tem slot `espada` → a instância aninhada some (aviso), P não existe
```

### As duas batem

Confirmado número a número nas seis casas. Erros que o caso pega: relógio zerado na virada (lâmina a 18° em 0,6: `a 0,951057`, vértices começando em `(61,984011, …)`); lâmina posta em `raiz + R(18°)·(20, 0)` em vez de `raiz + (20, 0)` (posição do osso girando com ele — erro clássico, e foi o erro da primeira conta deste próprio leiame, pego pela segunda); o lobo desenhando uma espada que não tem.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
