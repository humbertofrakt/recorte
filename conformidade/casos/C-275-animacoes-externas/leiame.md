# C-275-animacoes-externas — a animação vem de outro arquivo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 2.8 (assets.animations), 4.8 |
| Esperado | conferido à mão (contas abaixo), sem rodar runtime nenhum |

## O que este caso prova

O hospedeiro não tem `walk`. Ela está em `biblioteca.bone`, um arquivo só de animações com `rig.bones: [hips]`, citado em `assets.animations`. A sonda pede `walk` pelo nome e o hospedeiro tem que achá-la como se fosse dele.

## O rig

Hospedeiro: `root` -> `hips (0, 90)`; animação local `idle`. Biblioteca: um osso raiz, `rig`, `walk` (hips.y 90 a 100 em 1 s) e `idle` (hips.y 999).

## Contas

```
walk em t = 0,5: hips.y = 90 + (100 - 90) x 0,5 = 95
hips = T(0, 95) -> a=1 b=0 c=0 d=1, worldX 0, worldY 95
```

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
