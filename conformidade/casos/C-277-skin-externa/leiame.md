# C-277-skin-externa — a pele vem de outro arquivo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 2.8 (assets.skins), 4.8, 7.1 |
| Esperado | conferido à mão (contas abaixo), sem rodar runtime nenhum |

## O que este caso prova

O hospedeiro só tem a skin `default` (corpo 10x10). A skin `inverno` (corpo 20x30) mora em `pele.bone`, com `rig.slots: [corpo]`, citada em `assets.skins`. A sonda põe na pilha só `inverno` (4.4, rascunho 0.2: a `default` não entra sozinha, e aqui não faz falta, porque `inverno` dá o único placeholder). É o par do A-025/A-026: só a geometria denuncia qual pele está ativa. O par deste caso com osso é o **C-294**.

## O rig

Hospedeiro: `root`, slot `corpo`, skin `default` com região 10x10. Pele: um osso raiz, `rig`, skin `inverno` com região 20x30 no slot `corpo`.

## Contas

```
inverno ativa: região 20x30 na raiz, sem atlas -> cantos (+-10, +-15)
vértices corpo/corpo = [-10,-15, 10,-15, 10,15, -10,15]
com default: seria [-5,-5, 5,-5, 5,5, -5,5]
```

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
