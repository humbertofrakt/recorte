# P-015 — malha: `edge` e `triangle`, e a ordem da triangulação

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A e **B**) |
| Extensão | `BONE_particles` |
| Spec | §9.4.1 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

Três decisões de uma vez: a **lista de arestas** é a das arestas **únicas da
triangulação** (nunca o campo `edges`), a **ordem** dessa lista é a do par
`(a, b)` crescente (nunca a de descoberta), e o ponto uniforme no triângulo é a
fórmula de **dobrar** (nunca a da raiz quadrada).

**Sem elas:** um leitor que use o campo `edges` **não emite nada** num arquivo
normal (a §7 do núcleo o dá como opcional, padrão `[]`, "só editor"); um que
guarde a ordem de descoberta escolhe **outra aresta** para o mesmo `u12`, e nada
depois disso mostra o erro; e as duas fórmulas do triângulo dão pontos
**diferentes** para os mesmos dois `u`.

## O rig

Um quadrado, quatro vértices, **dois triângulos**, e **cinco arestas únicas** —
a diagonal é partilhada pelos dois triângulos e entra **uma vez**:

```
vertices   (0,0) (10,0) (10,10) (0,10)
triangles  [0,1,2, 0,2,3]
arestas    [[0,1],[0,2],[0,3],[1,2],[2,3]]
```

## Os três emissores, e o que cada um prova

| Slot | `meshMode` | Prova |
|:---|:---|:---|
| `fx/jato` | `edge` | a lista de arestas e o `u3` ao longo da escolhida |
| `fx2/jato2` | `edge` | **a mesma malha com `triangles` escrito noutra ordem e com os índices rodados** (`[2,3,0, 1,2,0]`): as posições têm de sair **idênticas** às de `fx/jato` |
| `fx3/jato3` | `triangle` | a fórmula de dobrar, e o sorteio por área acumulada |

O par `fx`/`fx2` é o coração do caso: **duas listas idênticas, campo a campo.**
Se um runtime guardar a ordem de descoberta, elas divergem — e sem este par
ninguém notaria, porque cada uma sozinha "parece" certa.

`speed: [0, 0]` de propósito: a partícula fica **onde nasceu**, então a posição
do dump **é** o ponto sorteado na malha, sem trajetória no meio.

## A fórmula do triângulo

```
s = u3;  w = u4
se s + w > 1:  s = 1 − s;  w = 1 − w         // DOBRAR
p0 = A + s·(B − A) + w·(C − A)
```

A outra usual — `s = 1 − sqrt(u3)`, `w = u4·sqrt(u3)` — também é uniforme e dá
um ponto **diferente**. Com os `u` deste caso as duas caem a mais de 1 px uma da
outra.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| usa o campo `edges` da malha | não emite nada: `edges` está ausente, padrão `[]` |
| guarda a ordem de descoberta das arestas | `fx` e `fx2` **divergem** |
| não deduplica a diagonal | 6 arestas em vez de 5; o `floor(u12·M)` escolhe errado |
| usa a fórmula da raiz quadrada | só `fx3` erra, e por mais de 1 px |

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
