# C-333 — driver que escreve em morph, em deform e na ordem de desenho

| Item | Valor |
|:---|:---|
| Nível | **C** (drivers, morphs) |
| Spec | 8.2 (alvos `morph`, `deform`, `drawOrder`; `aplicarAlvo`), 8.3 (o peso é limitado a `[min, max]`), 9.5 (`drawOrder` por deslocamento) |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

A malha é a do **C-250** (triângulo `(0,0) (100,0) (0,100)`). O driver `dirige`
lê `p` (animado de `0` a `1`) e escreve em três alvos:

| Alvo | Chaves por `input` | Regra |
|:---|:---|:---|
| `morph inchar`, `weight` | `0 → 0`, `1 → 2` | o runtime limita o peso a `[0, 1]` (8.3): em `p = 0.75` o driver pede `1.5` e vale `1` |
| `deform malha/malha` | `0 → zeros`, `1 → +10` no `y` do vértice 2 | interpolável |
| `drawOrder` | `0 → []`, `0.5 → malha +2` | não interpolável: degrau, e `mix ≥ 0.5` escreve (8.2) |

## A conta

```
vértice 0:  x = 10 · clamp(2p, 0, 1)        (morph, offsets [10, 0, …])
vértice 2:  y = 100 + 10·p                  (deform)
ordem:      p < 0.5 → malha, s1, s2;   p ≥ 0.5 → s1, s2, malha
```

| `t` (= `p`) | vértices | ordem |
|:---|:---|:---|
| `0.25` | `[5, 0, 100, 0, 0, 102.5]` | `malha, s1, s2` |
| `0.75` | `[10, 0, 100, 0, 0, 107.5]` | `s1, s2, malha` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| não limita o peso do morph | `x = 15` em `0.75` |
| driver não escreve em deform | `y = 100` |
| driver não escreve na ordem | a ordem não muda |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
