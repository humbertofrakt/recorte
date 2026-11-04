# P-014 — `sortMode: "oldestInFront"`

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §9.9, §7.1, §14.1 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

A ordem da lista do dump é **a ordem de desenho**, e `oldestInFront` a inverte:
a mais velha vem primeiro.

**Sem ela:** os oito primeiros casos usam o padrão `youngestInFront`, então um
leitor que ignore o campo passa em todos eles e desenha a pilha ao contrário —
o que, com mistura aditiva, muda o que se vê.

## O emissor

O mesmo do P-005 (`rate 20`, `lifetime [1, 1]` fixa), com
`"sortMode": "oldestInFront"` e **sem** teto: as 12 vivas entram todas.

## A conta

```
vivas em t = 0.55: i de 0 a 11 (t_i = 0 … 0.55)
youngestInFront: 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
oldestInFront:   0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
```

**Os mesmos números, na ordem inversa.** É de propósito que o caso não meça mais
nada: quem falha aqui falha só na ordem, e isso aponta direto para o campo.

## Uma nota honesta sobre o desempate

Este caso usa **um fluxo só** (não há rajada). O desempate da §7.1 é
`(t_i, fluxo, índice)`, e a spec **não diz** em que sentido o `fluxo` desempata
quando a ordem é invertida. Com um fluxo só a pergunta não aparece, e o caso foi
escrito assim **de propósito**, para provar o campo sem depender de algo que a
spec não fechou. Se alguém precisar do outro caso, é linha nova antes de ser
caso novo.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| ignora `sortMode` | a lista sai ao contrário, inteira |
| inverte também o corte de `maxParticles` | aqui não há teto: o P-005 pega esse |

---

## Por que este caso existe

**Toda decisão da rodada de 18/09/2026 foi tomada num ponto que nenhum dos oito
primeiros casos exercita.** Os dois runtimes passavam os oito e desenhariam
coisas diferentes na mão de quem usasse. Cada caso de P-009 a P-016 fecha um
desses pontos.

**Se os três resultados não baterem**, a spec ainda está calada ali: sobe ao
Planejador **antes** de qualquer conserto. Nunca se conserta o caso para o
código passar — foi assim que se decidiu o C-299 e o C-300.

## Onde este caso mora

Entrou em `casos/` em 18/09/2026, no fecho do degrau 12: os **dois** runtimes passaram (TypeScript e Python, este último escrito só pela spec da extensão), e o confronto campo a campo não achou diferença. Antes disso morou em `casos-pendentes/` (§12.4).

O `esperado.json` teve **três** fontes independentes, e não duas: a implementação de referência que escreveu o caso, o runtime TypeScript e o Python.
