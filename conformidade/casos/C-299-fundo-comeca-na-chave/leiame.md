# C-299-fundo-comeca-na-chave — o relógio do filho começa quando a chave o mostra

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`tBase` "começa em 0 quando o attachment fica ativo"), Apêndice C 1 (como achar esse instante sem estado), 9.5 |
| Esperado | conferido à mão por **duas contas independentes** (abaixo). Nenhum runtime foi rodado |

## O que este caso prova

O slot `weapon` nasce **vazio** (sem `attachment` no setup). A animação `sacar` põe a espada nele por uma chave `slot/attachment` em 0,5 s. A espada tem `baseAnimation: girar` (a gema dá uma volta em 2 s, laço). A §7.11 diz que `tBase` começa em 0 **quando o anexo fica ativo**; o Apêndice C, 1, diz como achar esse instante sem guardar estado: é o início da corrida de chaves `slot/attachment` com o valor que vale em `t`. Aqui, 0,5.

Em `t = 1,0`: `tBase = 1,0 − 0,5 = 0,5` → a gema está a **90°**. Um runtime que conte o fundo do começo da animação do pai dá `tBase = 1,0` → 180°: é a diferença que este caso pega. Em `t = 0,25` não há espada nenhuma: o slot está vazio, e nenhum canal traz `weapon/`.

## O rig

Pai: `root` → `hand (100, 50)`. Slot `weapon` no `hand`, **sem** `attachment` de setup. Pele `default`: placeholder `sword` = `skeleton` `arma.bone`, `x: 5`, `baseAnimation: girar`. Animação `sacar`, 2 s: `weapon/attachment` = `null` em 0, `"sword"` em 0,5.
Filho `arma.bone` (o mesmo do C-274): `root` → `lamina (20, 0)` → `gema (10, 0)`; `girar`: `gema/rotation` 0 → 360 em 2 s, laço.

## Contas

### Conta 1 — o relógio (Apêndice C, 1) e a geometria

```
t = 0,25: última chave attachment <= 0,25 é a de 0 (null) → slot vazio → sem filho
t = 1,0:  última chave <= 1,0 é a de 0,5 ("sword"); a anterior é null → a corrida começa em 0,5
          tBase = 1,0 − 0,5 = 0,5
          girar em 0,5: gema/rotation = 0 + 360 · (0,5 / 2) = 90
          raiz do filho = hand + (5, 0) = (105, 50); lamina = (125, 50); gema = (135, 50), girada 90°
```

### Conta 2 — matrizes da §5.4

```
gema: pai = lamina (identidade em (125, 50)); x = 10, r = 90
  worldX = 1·10 + 125 = 135; worldY = 50
  a = cos 90 = 0; b = cos 180 = −1; c = sin 90 = 1; d = sin 180 = 0
```

### As duas batem

Com o erro (fundo desde o começo da animação do pai): `tBase = 1,0` → 180° → `a −1, b 0, c 0, d −1`, mesma posição. É só o sinal que separa, e é isso que o caso mede.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
