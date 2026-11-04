# C-300-evento-do-filho-no-relogio-do-pai — o `time` do evento do filho é no relógio do pai

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (eventos do filho, `timeScale`), 8.6 e 12.4 (a janela de eventos), Apêndice C 6 |
| Esperado | conferido à mão por **duas contas independentes** (abaixo). Nenhum runtime foi rodado |

## O que este caso prova

A espada toca `fire` (1 s, laço, evento `disparo` em 0,5 s do relógio **dela**) com `timeScale: 2`: o relógio dela anda duas vezes mais depressa que o do pai. O Apêndice C, 6, fixa: o `time` do evento no dump é no relógio do **pai**, `tempo da amostra − (relógio do filho − tempo do evento no filho) / timeScale`. Um runtime que escreva o relógio do filho dá `0,5` onde a resposta é `0,25`. O C-270 não separava as duas leituras (`timeScale` 1, e o pai em 0,6 com o evento em 0,5 do filho).

Três amostras: em 0,2 nada ainda; em 0,3 o primeiro disparo, em `0,25` do pai; em 0,8 o segundo (o laço do filho deu a volta em 0,5 do pai), em `0,75`.

## O rig

Pai: `root` → `hand (100, 50)`. Slot `weapon` no `hand`, `attachment: sword` desde o setup. Pele `default`: `sword` = `skeleton` `arma.bone`, `x: 5`, `animation: fire`, `loop: true`, `timeScale: 2`. Animação `esperar` do pai, 2 s, com uma chave inerte.
Filho `arma.bone` (o mesmo do C-274): `fire`, 1 s, laço, evento `disparo` em 0,5.

## Contas

### Conta 1 — os dois relógios

```
relógio do filho = t_pai · timeScale = 2·t  (o anexo está ativo desde t = 0)
disparo acontece quando o relógio do filho passa por 0,5, 1,5, 2,5, …  →  t_pai = 0,25, 0,75, 1,25, …

amostra 0,2: janela do pai (−∞, 0,2] → filho (−∞, 0,4] → nenhum disparo
amostra 0,3: janela do pai (0,2, 0,3] → filho (0,4, 0,6] → disparo em 0,5 do filho
             time no pai = 0,3 − (0,6 − 0,5) / 2 = 0,25
amostra 0,8: janela do pai (0,3, 0,8] → filho (0,6, 1,6] → o laço passa por 1,0 e o disparo em 1,5 do filho (0,5 da segunda volta)
             time no pai = 0,8 − (1,6 − 1,5) / 2 = 0,75
```

### Conta 2 — pelo laço do filho, sem a fórmula

```
fire dura 1 s no relógio do filho = 0,5 s no relógio do pai (timeScale 2)
o disparo cai na metade de cada volta → a cada 0,5 s do pai, deslocado de 0,25: 0,25; 0,75; 1,25 …
(−∞, 0,2]: nenhum;  (0,2, 0,3]: 0,25;  (0,3, 0,8]: 0,75  (o 1,25 fica fora)
campos do evento: os da definição (8.6): int 0, float 0, string "", volume 1, balance 0; nome "weapon/disparo"
```

### As duas batem

O erro que o caso pega: `time` no relógio do filho (0,5 e 1,5), ou janela contada sem `timeScale` (o disparo apareceria só na amostra 0,8, em 0,5).

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
