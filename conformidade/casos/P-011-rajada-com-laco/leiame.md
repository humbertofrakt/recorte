# P-011 — rajada com laço — a explosão que sumia ao virar a volta

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §6 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

Duas decisões de uma vez: **"nascimentos" inclui a rajada** nas voltas de trás,
e **os ciclos que passam de `D` são cortados**.

**Sem a primeira:** em `t = 0.05` a tela estaria **vazia** — a explosão da volta
anterior sumiria ao virar a volta, e a emenda que o laço existe para esconder
apareceria justo no efeito que mais se nota.
**Sem a segunda:** os ciclos de `1.3` e `1.8`, deslocados de `−D`, cairiam em
cima dos da volta atual.

## O emissor

```json
"rate": 0, "looping": true,
"bursts": [{ "time": 0.8, "count": 3, "cycles": 3, "interval": 0.5 }]
```

`D = 1`, `lifetime [0.5, 0.5]` fixa.

## A conta

Os três ciclos cairiam em `0.8`, `1.3` e `1.8`. **Só o primeiro está em
`[0, D)`** — os outros dois são cortados (§6), e o leitor **DEVERIA** avisar
que dois ficaram de fora.

| Amostra | O que está vivo |
|:---|:---|
| `t = 0.05` | a rajada da **volta anterior**, nascida em `-0.2` (que é `0.8 − D`). Morre em `0.3`. São **3** |
| `t = 0.9` | a rajada **desta** volta, nascida em `0.8`. São **3** |

As duas amostras têm o mesmo tamanho e os mesmos índices: é a **mesma** rajada,
uma volta antes e uma volta depois. É isso que faz a emenda não aparecer.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| rajada tratada à parte do laço | `t = 0.05` **vazio**: a explosão sumiu |
| sem o corte de ciclos | 9 partículas em vez de 3, com índices sobrepostos |
| ciclo cortado sem aviso | passa no caso e engana quem escreveu os 3 ciclos |

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
