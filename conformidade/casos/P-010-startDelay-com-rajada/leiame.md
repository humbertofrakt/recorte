# P-010 — `startDelay` com rajada, e o ciclo que ele corta

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §4.3, §6 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

O `startDelay` toca **a rajada também** (§4.3:
`t_i = startDelay + time + c·interval`), e por isso ele **muda quem é cortado**
pelo laço (§6: só os ciclos em `[0, D)`).

**Sem ela:** os três ciclos caberiam na volta e **nasceriam três**; com ela, o
terceiro cai fora e nascem **dois**. É a diferença entre duas partículas e três
na tela, do mesmo arquivo, conforme o leitor.

## O emissor

```json
"startDelay": 0.3, "rate": 0, "looping": true,
"bursts": [{ "time": 0.3, "count": 2, "cycles": 3, "interval": 0.3 }]
```

`rate: 0` para não haver fluxo contínuo: o que se mede é só a rajada.
`D = 1` (a duração da animação).

## A conta

| | Instantes dos três ciclos | Em `[0, D)` |
|:---|:---|:---|
| **Com o `startDelay`** (a regra) | `0.6`, `0.9`, `1.2` | os dois primeiros; **o terceiro é cortado** |
| Sem ele (a letra antiga) | `0.3`, `0.6`, `0.9` | os três |

Em `t = 0.95`, com vida `0.5`, estão vivos os nascidos depois de `0.45`:
os ciclos de `0.6` e `0.9`, com `count 2` cada — **4** partículas,
índices 3, 2, 1, 0 (o índice é `c·count + j`).

As partículas das voltas de trás (deslocadas de `−D`) já morreram: nasceram em
`-0.4` e `-0.1`, e a vida é `0.5`.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `startDelay` só no fluxo contínuo | 3 ciclos em vez de 2; sobram partículas |
| sem o corte de ciclos do laço | ciclos sobrepostos, índices a mais |
| `probability` sorteada por ciclo | 0 ou todas |

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
