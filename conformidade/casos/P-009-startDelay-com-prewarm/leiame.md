# P-009 — `startDelay` com pré-aquecimento

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §4.2, §6, §9.1 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

O `startDelay` **entra na conta do nascimento** (§4.2:
`t_cont = startDelay + t_k + τ(i − E_k)`) e o `prewarm` estende para trás **a
partir da origem deslocada**, não a partir do zero absoluto.

**Sem ela:** os nascimentos sairiam `0.3` s cedo demais, e o `prewarm` mediria
de um zero que não é o do emissor. Um leitor que ignore o `startDelay` aqui dá
**outra lista inteira**, e nenhum dos oito primeiros casos o pega — todos têm
`startDelay: 0`.

## O emissor

`startDelay 0.3`, `prewarm 1`, `rate 20`, `lifetime [1.5, 1.5]`,
`looping false`, forma `point`, sem gravidade e sem arrasto: o que se mede
aqui é **quem existe e quando nasceu**, não a trajetória.

## A conta

```
t_i = startDelay + i / rate = 0.3 + i / 20
o prewarm de 1 s estende para trás a partir da origem: i >= −20
em t = 0.5, nasceram os de i até floor((0.5 − 0.3) · 20) = 4
```

São **25** partículas, de `i = −20` a `i = 4`. A mais velha nasceu em
`-0.7` — que é `0.3 − 1`, a origem deslocada menos o pré-aquecimento.

**O número que denuncia o erro:** sem o `startDelay` na conta, a mais velha
nasceria em `−1.0` e a lista iria até `i = 10`.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `startDelay` fora da conta de nascimento | todos os `birth` erram por `0.3`, e a lista tem outro tamanho |
| `prewarm` medido do zero absoluto | a ponta velha da lista erra |
| `startDelay` aplicado só à rajada | aqui não há rajada: passa batido, e o P-010 o pega |

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
