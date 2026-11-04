# P-006 — `space: "world"` — o osso solta a partícula

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §7.2 |
| Esperado | calculado à mão: a conta é de uma linha, e está escrita abaixo |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## O que este caso prova

Que em `space: "world"` o osso **solta** a partícula no instante do nascimento e
nunca mais a toca. O osso gira 90° entre `t_i` e `t`, e a partícula **não** gira
junto.

O Effekseer chama isto de herdar posição *"Only on create"* contra *"Always"*. É
o conceito exato; a palavra `world` ficou porque Godot e Unity usam.

## O rig

```
root
emissor   parent root   x 0   y 0
  rotation: 0 em t=0, 90 em t=1, linear
slot fx no osso emissor, com o emissor "jato"
```

## O emissor

`rate 0.5` (um nascimento a cada 2 s), `lifetime [2, 2]`, `speed [100, 100]`,
`direction 0` (para `+X`), sem gravidade, sem arrasto, `space: "world"`,
`looping false`. Em `t = 1` há **uma** partícula: a de índice 0, nascida em
`t_i = 0`.

## A conta

Em `t_i = 0` o osso está com rotação **0**: a matriz dele é a identidade.

```
p0 no espaço do esqueleto = M(0) × (0, 0)   = (0, 0)
v0 no espaço do esqueleto = R(0) × (100, 0) = (100, 0)
```

Sem gravidade e sem arrasto, `p(a) = p0 + v0·a`. Em `t = 1`, `a = 1`:

```
p(1) = (0, 0) + (100, 0) × 1 = (100, 0)
```

## O contraste — e é ele que faz o caso

Se este arquivo trocasse **uma palavra**, `space` para `"local"`, a mesma
partícula estaria em

```
p_local(1) = (100, 0)
M(t=1) = rotação de 90°
posição desenhada = M(1) × (100, 0) = (0, 100)
```

**`(100, 0)` contra `(0, 100)`.** Um leitor que confunda os dois erra por 90°, e
é o erro mais fácil de cometer aqui.

O `x` e o `y` do dump são **sempre no espaço do esqueleto**, nos dois `space` —
é o que torna essa comparação possível (§14.1 da extensão).

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| trata `world` como `local` | `(0, 100)` em vez de `(100, 0)` |
| usa a matriz do osso em `t` e não em `t_i` | `v0` girado; a partícula sai para cima |
| aplica a matriz duas vezes | `(0, 100)` girado de novo |

---

## Antes de qualquer caso

Um leitor que declara **P** tem de reproduzir os cinco números de referência da
§3.2 da extensão, exatos:

| Entrada | Saída |
|:---|:---|
| `pcg(0)` | `129708002` |
| `pcg(42)` | `1223963391` |
| `pcg(0xFFFFFFFF)` | `3861530882` |
| `acaso(42, 0, 7, 0)` | `0.4190843105316162` |
| `acaso(42, 0, −3, 0)` | `0.5181800723075867` |

Se algum deles não bater, **pare aqui**: nenhum caso de partícula vai passar, e
o defeito é o hash, não a conta.

## Onde este caso mora

Entrou em `casos/` em 18/09/2026, no fecho do degrau 12: os **dois** runtimes passaram (TypeScript e Python, este último escrito só pela spec da extensão), e o confronto campo a campo não achou diferença. Antes disso morou em `casos-pendentes/` (§12.4).

O `esperado.json` teve **três** fontes independentes, e não duas: a implementação de referência que escreveu o caso, o runtime TypeScript e o Python.
