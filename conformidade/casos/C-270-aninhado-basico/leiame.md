# C-270-aninhado-basico — a entidade: esqueleto aninhado segue a imagem

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11, 9.10, 12.4 |
| Esperado | conferido à mão (contas abaixo), sem rodar runtime nenhum. Refeito sem socket em 17/09/2026: os números não mudaram, porque o anexo já pendurava no osso do slot |

## O que este caso prova

O caso que a suíte não tinha: um attachment `skeleton`, a **entidade** (7.11). Prende (1) a matriz da raiz do filho, `M_ossoDoSlot x T(x, y)` — a entidade segue a imagem, sem socket; (2) que os ossos, vértices e pontos do filho entram nos canais existentes com a chave prefixada pelo slot; (3) que o evento do filho chega como `"weapon/disparo"`, com o relógio do filho começando em 0 quando o attachment fica ativo.

## O rig

Pai: `root` -> `hand (100, 50)`. Slot `weapon` no osso `hand`, attachment `skeleton` com `uri: arma.bone`, `x: 5`, `animation: fire` (1 s, laço, evento `disparo` em 0,5 s).

Filho `arma.bone`: `root` -> `lamina (x 20)` -> `gema (x 10)`. Região `lamina` (`x 15`, 20x10). Pontos `punho` (na raiz) e `gema`, pontos comuns que o jogo lê (7.9). O pai tem também um ponto `hand_point` no osso `hand`, `(10, 0)` girado 90, que só existe para o canal `points` medir um ponto do pai ao lado dos pontos do filho.

## Contas

Convenções (5.4, `sx = sy = 1`, sem cisalhamento): matriz `[a b; c d]` com `a = cos r`, `b = -sin r`, `c = sin r`, `d = cos r`; ponto de mundo `x' = a*x + b*y + worldX`, `y' = c*x + d*y + worldY`. Região sem atlas (7.3): cantos BL, BR, TR, TL em `(x +- W/2, y +- H/2)`; a lâmina tem `x = 15`, `W = 20`, `H = 10`, então `(5,-5) (25,-5) (25,5) (5,5)` no osso `lamina`.

Chaves do dump para o filho (12.4): `"<slot>/<osso>"` em `bones`, `"<slot>/<slot do filho>/<anexo>"` em `vertices` e `points`, evento `"<slot>/<evento>"`.

```
M_hand  = T(100, 50)                       a=1 b=0 c=0 d=1
P       = M_hand x T(5, 0)  -> raiz do filho em (105, 50), identidade
lamina  = P x T(20, 0)      -> (125, 50)
gema    = lamina x T(10, 0) -> (135, 50)

vértices da lâmina: (5,-5)->(130,45)  (25,-5)->(150,45)  (25,5)->(150,55)  (5,5)->(130,55)
pontos: hand_point = M_hand.(10,0), rot 0+90 -> (110, 50, 90)
        punho = raiz do filho -> (105, 50, 0);  gema -> (135, 50, 0)

eventos em (-inf, 0,6]: `fire` do filho tem `disparo` em 0,5 -> chega como "weapon/disparo", time 0,5, campos padrão da 8.6
```

`inheritColor` não é medido aqui: o canal `slots` mede a cor do slot, não o produto com o pai. Fica para um caso próprio quando a 12.4 disser qual dos dois o dump grava.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
