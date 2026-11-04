# C-279-externa-local-ganha — nome repetido: a animação local ganha

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 2.8 (L2 EXTERNAL_DUPLICATE) |
| Esperado | conferido à mão (contas abaixo), sem rodar runtime nenhum |

## O que este caso prova

Os dois arquivos têm `idle`. A regra de 2.8: L2, e a **local** vale. A local gira `hips` 45 graus; a externa mandaria `hips` para `y = 999`. Um runtime que deixe a externa sobrescrever a local reprova.

## O rig

Os mesmos arquivos do C-275.

## Contas

```
idle local em t = 0: hips.rotation = 45, y = 90
cos 45 = sin 45 = 0,707107
hips -> a=0,707107 b=-0,707107 c=0,707107 d=0,707107, worldX 0, worldY 90
```

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
