# Plano — o gesto do P — 13/09/2026

Um chat só (o 3, Criar e parentesco). Sobra do lote da v12.0 mais o pedido novo
do Humberto. Régua: *"um Spriter com as ferramentas do Spine"*.

| # | O que fazer | Onde |
|:---:|:---|:---|
| P1 | **O `P` mostra os filhos.** Com um osso escolhido, segurar `P` pinta na cena quais são os filhos dele — cor e opacidade leve, como o Spriter. Hoje o `P` afilha às cegas. Clicar vira filho; clicar de novo desafilha | `viewport/parent-gesture.ts`, `viewport/viewport-draw.ts` |
| P2 | **O `P` troca pai e filho.** O arrasto na Árvore já troca (`SwapBones`, v12.0). O `P` ainda pergunta ao `canReparent` e para antes da porta única. Os dois gestos têm que dar no mesmo lugar. O "soltar" do `P` guarda o pai de um osso só, e uma troca mexe em dois: é aí que está o trabalho | `viewport/parent-gesture.ts`, `doc/reparent.ts` |
| P3 | **As setas do teclado.** `nudge`, em `viewport/tools/select.ts`, ainda anda com todos os ossos escolhidos: pai e filho juntos fazem o filho andar duas vezes. Uma linha — trocar `selectedBones` por `draggedBones`, que o chat 2 deixou pronto em `translate.ts` | `viewport/tools/select.ts` |

**Ordem:** P3 primeiro (é uma linha e fecha um buraco conhecido), depois P1, depois P2.

**Testes:** parentesco em `arvore.test.ts`; o que é desenho e seleção, em `cena.test.ts`.

**Ninguém mais está trabalhando.** Os outros três chats estão parados, então a
árvore é sua: o fecho é seu e sai sozinho, na **v12.1**.

## Desvios

### Chat 3 — o gesto do P (P1, P2, P3), 13/09/2026

**P3 — a conta mudou de casa.** O plano dizia *"uma linha: trocar
`selectedBones` por `draggedBones`"*. Não dava em uma linha: `draggedBones`
mora em `tools/translate.ts`, e o `translate.ts` **importa** o `tools/select.ts`,
que é onde a seta vive — pedir de volta faria um círculo de importação. Então a
conta pura (`topLevelBones`) subiu para `doc/bones.ts`, que é o arquivo de
"quem é pai de quem", e os dois a chamam de lá. O `translate.ts` continua
exportando o nome para quem já o importava, e o `draggedBones` continua onde
estava. Resultado igual, sem círculo, e sem uma segunda cópia da conta.

**P1 — o que o Spriter faz, e o que não está escrito.** Os manuais do Spriter
descrevem o `B` (*"segurar B com um osso selecionado: ligar ou desligar o
sprite como filho do osso"*) e o `Z` (*"selecionar todos os descendentes"*),
mas **não descrevem a pintura**: a cor e a opacidade leve são o que o Humberto
viu na tela e pediu. Então a pintura é a do pedido dele. Escolhas:

| O quê | Como | Por quê |
|:---|:---|:---|
| Cor | verde, opacidade 0,45 | cheia, a cena de um personagem montado vira mancha e some o desenho |
| Quem entra | só os filhos **diretos** | pintar a árvore inteira diria que tudo depende deste osso |
| O que se pinta | traço no osso, contorno no desenho | é o que já distingue osso de desenho no resto da cena |

O "ligar ou desligar" do Spriter virou o **desafilhar**: clicar em quem já era
filho antes do gesto solta ele na raiz. Antes, esse clique só dizia *"já é
filho"* e não fazia nada — era a metade que faltava do interruptor.

**P2 — sem bagunçar o "soltar".** O `soltar` do `P` (clicar de novo no que este
gesto prendeu) continua igual: ele guarda o pai de antes e devolve. A **troca**
não entra nessa conta — quem trocou de lugar não fica marcado como "preso neste
gesto", e um segundo clique nele encontra um filho e o desafilha, que é um passo
para a frente e não um desfazer pela metade. `Ctrl+Z` continua desfazendo a
troca inteira de uma vez.
