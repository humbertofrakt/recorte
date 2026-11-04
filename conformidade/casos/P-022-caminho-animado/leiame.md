# P-022 — ao longo de um caminho: lido em `t_i`

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` **1.1** |
| Spec | §9.4.2, §4.2, §14.1; o `deform` da spec |
| Esperado | **calculado à mão antes do código** (rodada 16, lote 7) |

## A decisão que este caso prende

O caminho é lido **no nascimento** `t_i`, e não no quadro `t`. Caminho animado muda
**onde nascem as novas**; as já nascidas não pulam.

## O rig

```
root
trilha   osso root   anexo "caminho" (path, aberto, lengths [300])
         A0 = (0,0), saída (100,0)    A1 = (300,0), chegada (200,0)   // alças nos terços
fx       osso root   "jato": shape path, curve "trilha/caminho", rate 10 (fluxo 0),
         lifetime [2,2], speed [0,0], seed 42, space local, looping false
animação "sobe" (1 s): deform de "caminho", de 0 (em 0 s) a y + 100 nos 6 pontos (em 1 s), reta
```

Alças nos terços: a reta tem velocidade uniforme, então `x = 300·u3`. O deform
sobe tudo junto: em `t_i` o caminho está em `y = 100·t_i`.

Taxa fixa 10/s, sem `explosiveness` nem `randomness` (§4.2, §4.4): `t_i = i/10`.
Avaliado em `t = 0,55`: vivas `i = 0 a 5`.

## A conta

| i | `t_i` | `u3 = acaso(42, 0, i, 3)` | **x** | **y** | lido em `t` (errado) |
|:---:|:---:|:---|:---:|:---:|:---:|
| 0 | 0,0 | 0,37800759077072144 | 113,402277 | **0** | y = 55 |
| 1 | 0,1 | 0,6948435306549072 | 208,453059 | **10** | y = 55 |
| 2 | 0,2 | 0,34377390146255493 | 103,132170 | **20** | y = 55 |
| 3 | 0,3 | 0,7216458320617676 | 216,493750 | **30** | y = 55 |
| 4 | 0,4 | 0,25121110677719116 | 75,363332 | **40** | y = 55 |
| 5 | 0,5 | 0,2359306812286377 | 70,779204 | **50** | y = 55 |

Ordem do dump: 5, 4, 3, 2, 1, 0. `life 2`, `age = 0,55 − t_i`, `angle 0`, `scale 1`.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| lê o caminho em `t` | `y = 55` nas seis |
| lê o caminho da pose de repouso (sem o deform) | `y = 0` nas seis |
| não conhece `path` (leitor 1.0) | **0 partículas** contra 6. Visto às 17h55 de 05/10/2026 |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, na rodada 16, lote 7, por ordem da ficha do Diretor (`DIRETOR · 000da3`), com **três** fontes independentes que deram o mesmo número: a conta à mão (escrita antes do código), o runtime TypeScript e o runtime Python — este escrito só pela §9.4.2 e por estes `leiame`, sem abrir o TypeScript. O confronto fechou às 18h21 de 05/10/2026: os dois runtimes concordam campo a campo.

Antes do código, o caso foi visto **falhando** no leitor de antes da 1.1: 0 partículas, às 17h55 de 05/10/2026.
