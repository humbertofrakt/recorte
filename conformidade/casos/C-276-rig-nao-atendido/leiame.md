# C-276-rig-nao-atendido — o contrato pede um osso que não existe

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 4.8 (L2 RIG_UNMET), 4.7 |
| Esperado | conferido à mão (contas abaixo), sem rodar runtime nenhum |

## O que este caso prova

O `rig` da biblioteca exige `hips` **e** `cauda`; o hospedeiro só tem `hips`. É L2, o arquivo abre, a timeline de `cauda` é ignorada e a de `hips` roda. Um runtime que recuse a biblioteca inteira por causa do osso que falta reprova.

## O rig

Hospedeiro: `root` -> `hips (0, 90)`, sem animação local. Biblioteca: `rig.bones: [hips, cauda]`, `walk` anima os dois.

## Contas

```
walk em t = 0,5: hips.y = 95;  cauda não existe -> timeline ignorada
hips = T(0, 95)
```

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
