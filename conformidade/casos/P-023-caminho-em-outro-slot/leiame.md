# P-023 — ao longo de um caminho: o caminho em outro slot

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` **1.1** |
| Spec | §9.4.2, §9.10, §7.2, §14.1 |
| Esperado | **calculado à mão antes do código** (rodada 16, lote 7) |

## A decisão que este caso prende

O caminho mora no slot **dele** (`trilha`, osso `root`), e o emissor noutro slot,
num osso deslocado. Em `space: "local"` o ponto do caminho (que vem no espaço do
esqueleto) **volta pela inversa de `M_emissor(t_i)`**, e depois vai pela
`M_emissor(t)`: a partícula fica **em cima da curva**.

## O rig

```
root
emissor  parent root   x 50
trilha   osso root     "caminho": o mesmo do P-021 (reta de (0,0) a (300,0), alças juntas)
fx       osso emissor  "jato": x 10, shape path, curve "trilha/caminho"; o resto igual ao P-021
```

`M_emissor = T(50, 0) · T(10, 0) = T(60, 0)`. Avaliado em `t = 0,5`.

## A conta

| j | `u3` | ponto no esqueleto | `p0` local (`− (60, 0)`) | **dump** (`x`, `y` no esqueleto, §14.1) |
|:---:|:---|:---:|:---:|:---:|
| 0 | 0,10603183507919312 | (31,809551 ; 0) | (−28,190449 ; 0) | **(31,809551 ; 0)** |
| 1 | 0,41712987422943115 | (125,138962 ; 0) | (65,138962 ; 0) | **(125,138962 ; 0)** |
| 2 | 0,9260824918746948 | (277,824748 ; 0) | (217,824748 ; 0) | **(277,824748 ; 0)** |
| 3 | 0,1838092803955078 | (55,142784 ; 0) | (−4,857216 ; 0) | **(55,142784 ; 0)** |

**O dump dá o mesmo número do P-021, e isso é o certo:** a §14.1 diz que `x`, `y`
saem **sempre no espaço do esqueleto**. O "menos (60, 0)" do plano é o `p0` local,
que o dump não mostra. O que este caso separa é o leitor que esquece a inversa.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| não volta pela inversa (trata os pontos do caminho como locais do emissor) | x **+ 60** |
| lê o caminho com o osso do **emissor** em vez do osso do slot do caminho | x **+ 50** |
| procura o caminho só no slot do emissor | **0 partículas** (não acha: não desenha e avisa) |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, na rodada 16, lote 7, por ordem da ficha do Diretor (`DIRETOR · 000da3`), com **três** fontes independentes que deram o mesmo número: a conta à mão (escrita antes do código), o runtime TypeScript e o runtime Python — este escrito só pela §9.4.2 e por estes `leiame`, sem abrir o TypeScript. O confronto fechou às 18h21 de 05/10/2026: os dois runtimes concordam campo a campo.

Antes do código, o caso foi visto **falhando** no leitor de antes da 1.1: 0 partículas, às 17h55 de 05/10/2026.
