# C-298-pilha-sem-default — a `default` só está ativa se estiver na pilha

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 4.4 (a pilha), 7.1, 12.4 (a sonda `skins` é a pilha) |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a resolução de 4.4 passo a passo, e a geometria. Nenhum runtime foi rodado |

## O que este caso prova

No rascunho 0.1 a `default` estava "sempre ativa, por baixo". No 0.2 (Q33, Apêndice A 73) ela é **uma pele como as outras**: só está ativa se estiver na pilha. Nenhum caso da suíte pegava a diferença — A-025, A-026, C-277 e C-293 dão o mesmo número com ou sem a `default` implícita, porque a pele de cima sempre veste o único placeholder. Este caso separa as duas leituras: a pilha é só `["armadura"]`, e a `armadura` veste o `corpo` mas **não** veste a `capa`. Com a regra do 0.2 a `capa` fica **vazia** (`attachment: null`, nenhum vértice). Com a regra do 0.1 ela mostraria a `capa` 6×6 da `default`.

O canal `slots` prende o `null`; o canal `vertices` só cita `corpo/corpo`; o `drawOrder` mostra que o slot continua existindo na ordem, vazio.

## O rig

`root`. Slots `corpo` e `capa`, os dois na raiz. Peles: `default` (corpo 10×10, capa 6×6) e `armadura` (só corpo, 20×30). Sonda: pilha `["armadura"]`, `t = 0`.

## Contas

### Conta 1 — a resolução de 4.4, passo a passo

```
pilha = [armadura]
lista = [armadura]                       (sem includes)
slot corpo, placeholder corpo: reversed(lista) = [armadura] → armadura tem corpo → região 20×30
slot capa,  placeholder capa:  reversed(lista) = [armadura] → armadura NÃO tem capa → "retornar nada" → null
(a default não entra: não está na pilha)
```

### Conta 2 — a geometria

```
corpo/corpo: região 20×30 na raiz, sem atlas (7.3): cantos (±10, ±15)
  BL (−10, −15)  BR (10, −15)  TR (10, 15)  TL (−10, 15)
capa: nenhum anexo → nenhum vértice; o slot continua na ordem: drawOrder = [corpo, capa]
```

### As duas batem

O erro que o caso pega: a `default` implícita por baixo. Com ela, `capa` resolve para a região 6×6 e o dump traz `capa: { attachment: "capa" }` e `capa/capa: [−3, −3, 3, −3, 3, 3, −3, 3]`.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
