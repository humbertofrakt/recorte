# C-274-animacao-de-fundo — a motosserra gira por baixo do golpe

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (canal de fundo, duas camadas), 9.9 |
| Esperado | conferido à mão (contas abaixo), sem rodar runtime nenhum |

## O que este caso prova

`baseAnimation: girar` (gema 0 a 360 graus em 2 s, laço) roda **sempre**. O pai toca `esperar`, que tem uma chave `nested/animation`: `null` até 1,0 s, `attack` a partir daí. Em 0,5 s só há o fundo: gema a 90. Em 1,5 s o `attack` do filho está por cima (lâmina a 90, começou em 1,0 s) **e o fundo continua com o relógio dele**: `tBase = 1,5` -> 270. Se a troca de animação zerasse o fundo, `tBase` seria 0,5 -> 90, e a gema sairia com rotação total 180 em vez de 360. É a única mistura obrigatória da spec, e este caso é o que a prende.

## O rig

Pai como no C-270 (sem socket), animação `esperar` (2 s) com a timeline `nested/animation` no slot `weapon`. Attachment com `x: 5` e `baseAnimation: girar`.

## Contas

Convenções (5.4, `sx = sy = 1`, sem cisalhamento): matriz `[a b; c d]` com `a = cos r`, `b = -sin r`, `c = sin r`, `d = cos r`; ponto de mundo `x' = a*x + b*y + worldX`, `y' = c*x + d*y + worldY`. Região sem atlas (7.3): cantos BL, BR, TR, TL em `(x +- W/2, y +- H/2)`; a lâmina tem `x = 15`, `W = 20`, `H = 10`, então `(5,-5) (25,-5) (25,5) (5,5)` no osso `lamina`.

Chaves do dump para o filho (12.4): `"<slot>/<osso>"` em `bones`, `"<slot>/<slot do filho>/<anexo>"` em `vertices` e `points`, evento `"<slot>/<evento>"`.

```
t = 0,5:  fundo -> gema 90; topo = null (nenhuma animação de cima)
  lamina = (125, 50) identidade
  gema   = lamina x T(10,0).R(90) -> (135, 50), a=0 b=-1 c=1 d=0
  vértices: [130.0, 45.0, 150.0, 45.0, 150.0, 55.0, 130.0, 55.0]

t = 1,5:  fundo -> tBase 1,5 -> 270; topo = attack (t_attack = 0,5) -> lamina 90
  lamina = P x T(20,0).R(90) -> (125, 50), a=0 b=-1 c=1 d=0
  gema   = lamina x T(10,0).R(270) -> (125, 60); rotação total 90 + 270 = 360 -> identidade
  vértices: [130.0, 55.0, 130.0, 75.0, 120.0, 75.0, 120.0, 55.0]
```

A regra de que `nested/time` não mexe no fundo não está neste caso; fica para um caso próprio.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
