# C-273-espelha-animacao — o pai toca attack, o filho toca o attack dele

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (canal de resposta, fonte 2) |
| Esperado | conferido à mão (contas abaixo), sem rodar runtime nenhum |

## O que este caso prova

`inheritAnimation: true`. O pai toca `attack`; o filho **tem** uma animação chamada `attack` (lâmina a 90 graus), então ela toca, com o relógio do pai. Sem o canal, a lâmina ficaria a 0 e os vértices sairiam os do C-270.

## O rig

Pai como no C-270 (sem socket), com duas animações inertes (`attack` 0,6 s e `andar` 1 s, uma chave constante em `hand.y`). Attachment com `x: 5` e `inheritAnimation: true`.

## Contas

Convenções (5.4, `sx = sy = 1`, sem cisalhamento): matriz `[a b; c d]` com `a = cos r`, `b = -sin r`, `c = sin r`, `d = cos r`; ponto de mundo `x' = a*x + b*y + worldX`, `y' = c*x + d*y + worldY`. Região sem atlas (7.3): cantos BL, BR, TR, TL em `(x +- W/2, y +- H/2)`; a lâmina tem `x = 15`, `W = 20`, `H = 10`, então `(5,-5) (25,-5) (25,5) (5,5)` no osso `lamina`.

Chaves do dump para o filho (12.4): `"<slot>/<osso>"` em `bones`, `"<slot>/<slot do filho>/<anexo>"` em `vertices` e `points`, evento `"<slot>/<evento>"`.

```
P = M_hand x T(5,0) -> raiz (105, 50), identidade
lamina = P x T(20,0) . R(90) -> (125, 50), a=0 b=-1 c=1 d=0
gema   = lamina x T(10,0)     -> (125, 60), mesma rotação
vértices: x' = -y + 125, y' = x + 50 -> [130.0, 55.0, 130.0, 75.0, 120.0, 75.0, 120.0, 55.0]
```

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
