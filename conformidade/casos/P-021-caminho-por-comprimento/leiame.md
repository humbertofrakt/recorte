# P-021 — ao longo de um caminho: por comprimento

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` **1.1** |
| Spec | §9.4.2 (rodada 16, 05/10/2026), §3.2, §4.3, §14.1 |
| Esperado | **calculado à mão antes do código** (rodada 16, lote 7); os `u` conferidos contra os cinco números de referência da §3.2 |

## A decisão que este caso prende

O ponto sobre o caminho é tirado **por comprimento** (`s = u3 · total`), e **não**
por `t = u3`. O caminho tem `constantSpeed: false` de propósito: a §9.4.2 manda
ignorá-lo, e um leitor que o obedecesse cairia no erro.

## O rig

```
root
trilha   osso root   anexo "caminho" (path, aberto, constantSpeed false, lengths [300])
         A0 = (0,0), saída (0,0)     A1 = (300,0), chegada (300,0)      // alças juntas
fx       osso root   anexo "jato" (BONE_particle, shape path, curve "trilha/caminho")
         rate 0 · rajada única em 0 s, 4 partículas · seed 42 · speed [0,0] · lifetime [1,1]
         space local · looping false
```

Avaliado em `t = 0,5`. É uma **reta**, mas a velocidade não é uniforme:
`x(t) = 300·(3t² − 2t³)`. A poligonal de 10 segmentos cai em cima da reta,
`total = 300`, e `p0 = (300·u3 ; 0)` **exato**.

## A conta

Fluxo 1 (a rajada 0), índice `j`, canal 3:

| j | `u3 = acaso(42, 1, j, 3)` | **x esperado** (por comprimento) | leitor errado (`t = u3`) |
|:---:|:---|:---:|:---:|
| 0 | 0,10603183507919312 | **31,809551** | 9,403221 |
| 1 | 0,41712987422943115 | **125,138962** | 113,049908 |
| 2 | 0,9260824918746948 | **277,824748** | 295,324904 |
| 3 | 0,1838092803955078 | **55,142784** | 26,681175 |

`y = 0` nas quatro. Ordem do dump (as quatro nascem juntas; empate pelo índice,
a mais nova primeiro, como no P-007): 3, 2, 1, 0. `birth 0`, `life 1`, `age 0,5`,
`angle 0`, `scale 1`.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `t = u3` (uniforme no parâmetro, ou obedece `constantSpeed: false`) | x de 12 a 28 px fora (coluna da direita) |
| não conhece `path` (leitor 1.0) | **0 partículas** contra 4: vermelho, nunca verde mudo. Visto às 17h55 de 05/10/2026 |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, na rodada 16, lote 7, por ordem da ficha do Diretor (`DIRETOR · 000da3`), com **três** fontes independentes que deram o mesmo número: a conta à mão (escrita antes do código), o runtime TypeScript e o runtime Python — este escrito só pela §9.4.2 e por estes `leiame`, sem abrir o TypeScript. O confronto fechou às 18h21 de 05/10/2026: os dois runtimes concordam campo a campo.

Antes do código, o caso foi visto **falhando** no leitor de antes da 1.1: 0 partículas, às 17h55 de 05/10/2026.
