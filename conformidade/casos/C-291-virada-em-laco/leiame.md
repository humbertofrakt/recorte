# C-291-virada-em-laco — a virada obedece ao `t mod duration`

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 9.13 (`body`), 9.11 (laço), 12.4 (`loop` na sonda) |
| Esperado | conferido à mão por **duas contas independentes** (abaixo): a geométrica e a das matrizes da §5.4. Nenhum runtime foi rodado |

## O que este caso prova

O mesmo par de corpos do C-290, com a animação em **laço** (`ciclo`, 1 s, `loop: true`) e a sonda pedindo 0,25, 0,75, 1,25 e 1,75 s. Em laço o tempo é `t mod duration` **antes de qualquer coisa** (9.11, 12.4), e `corpoEm` recebe esse tempo: em 1,25 o corpo é o **homem** de novo, e em 1,75 o lobisomem de novo. Um runtime que guarde "já virei" como estado (e não como função de `t`) mostra o lobisomem em 1,25. É a régua R1 (1.3, princípio 11) medida na virada: para trás e para a frente, o mesmo quadro.

## O rig

Igual ao C-290: `entrada.bone` é o homem (`tronco (0, 100)`, `braco`, região 20×40); `lobisomem.bone` (`tronco (0, 120)`, `rabo (−10, 0)`, região 30×60). Animação `ciclo`: `body` = `"lobisomem.bone"` em 0,5 · `tronco/x` 0 → 40 · `braco/rotation` 0 → 90 · `rabo/rotation` 0 → 60.

## Contas

### Conta 1 — o laço

```
duration = 1,0
t = 0,25 → 0,25 mod 1 = 0,25 → antes da chave body → homem
t = 0,75 → 0,75             → depois da chave       → lobisomem
t = 1,25 → 1,25 mod 1 = 0,25 → homem
t = 1,75 → 1,75 mod 1 = 0,75 → lobisomem
```

As poses em 0,25 e 0,75 são, número por número, as do C-290 (a conta geométrica está lá): homem com `tronco (10, 100)` e `braco` a 22,5°; lobisomem com `tronco (30, 120)` e `rabo` em `(20, 120)` a 45°. As amostras 1,25 e 1,75 **repetem** as de 0,25 e 0,75.

### Conta 2 — matrizes da §5.4

Idêntica à conta 2 do C-290, aplicada ao tempo já enrolado. O que este caso acrescenta não é aritmética de matriz: é a **ordem** das operações, `t mod duration` primeiro, `corpoEm` depois, `Pose` por último. Escrita assim para o segundo runtime não a adivinhar:

```
Pose(projeto, ciclo, 1.25) == Pose(projeto, ciclo, 0.25)   // porque corpoEm(ciclo, 0.25) = arquivo
Pose(projeto, ciclo, 1.75) == Pose(projeto, ciclo, 0.75)   // porque corpoEm(ciclo, 0.75) = lobisomem.bone
```

### As duas batem

Quatro amostras, duas poses. Um runtime que **não** enrole o tempo antes de `corpoEm` dá lobisomem em 1,25 (`tronco (10, 120)`, região 30×60) — e é esse o erro que o caso pega.

## Onde este caso mora

Entrou em `casos/` em 17/09/2026, no fecho da rodada dos degraus 2 e 3: os **dois** runtimes passaram (TypeScript v13.7, Python v13.4, este último escrito só pela spec), e o confronto campo a campo (`ferramentas/comparar-runtimes.mjs`) não achou diferença acima de 1e-6. Antes disso morou em `casos-pendentes/` (§12.4).
