# Pedidos do Humberto — ferramentas, ossos e seleção — 13/09/2026

Anotado da conversa, com a causa achada no código. **Ainda não é plano. Nada foi
feito.** A régua é a de sempre: *"um Spriter com as ferramentas do Spine"*.

## Os sete

| # | O que ele disse | Onde está a causa |
|:---:|:---|:---|
| 1 | *"temos 6 ferramentas; no Spriter só tem uma. A que está selecionada tem que ser a junção das outras 5, e podia ser a primeira"* | `ui/toolbar-model.ts`: `TOOL_ORDER` põe `select` antes de `transform`; o Transformar junta Mover, Girar e Escalar (`tools/transform-tool.ts`) mas **não** o Inclinar, e as quatro continuam na barra |
| 2 | *"os bones não tá legal; a bolinha de girar podia estar na outra metade do bone"* | `viewport/transform-box.ts`: `knob = pivô + eixo do osso × 60px`. A bolinha sai da base **na direção do osso**, e cai em cima dele |
| 3 | *"um sprite, quando vira, a caixa não está virando junto"* | `transform-box.ts:193`: com um desenho escolhido, `frame` é a identidade — os eixos da TELA. A caixa é sempre reta, mesmo com o desenho girado |
| 4 | *"criei um bone na diagonal e a caixa dele ficou torta"* | Mesma função, o outro ramo: com osso escolhido, `frame` são os eixos do osso, e a caixa sai inclinada. **É o contrário do item 3** — os dois casos seguem regras diferentes, e é isso que confunde |
| 5 | *"quando crio objetos, as coisas ficam se enganchando; vira parente de coisa que não estava selecionada. Não quero parentesco sem eu ter selecionado antes"* | `tools/create-bone.ts`, `newBoneParent`: o pai é o osso escolhido **ou, se não houver nenhum, o primeiro osso do arquivo**. É esse "ou" que enfia o osso novo debaixo da raiz sem ninguém pedir |
| 6 | *"mandei um osso filho virar o pai do pai dele e ele não virou"* | `doc/bones.ts`, `canReparent`: recusa quando o novo pai é descendente do osso — seria ciclo. Falta o gesto que os editores fazem nesse caso: **trocar os dois de lugar** (o pai vira filho), em vez de recusar |
| 7 | *"seleciono vários objetos e eles viram bagunça quando movo"* | `tools/translate.ts`: cada osso escolhido recebe o deslocamento. Com pai e filho na mesma seleção, o filho anda **duas vezes** — uma pelo pai, outra por ele mesmo. Falta filtrar: move só quem não tem ancestral na seleção |

## O que já está certo e não deve ser mexido

- O Transformar já é a ferramenta que abre (`START_TOOL`).
- O botão direito volta à ferramenta anterior (gesto do Spine).
- Trocar de pai já guarda a pose de mundo: o filho não pula de lugar (`doc/reparent.ts`).

## A perguntar antes de fazer

| # | Pergunta |
|:---:|:---|
| 3 e 4 | A regra única: a caixa acompanha o objeto (gira com o sprite, acompanha o osso)? É o que o Spriter faz |
| 1 | Inclinar entra no Transformar por qual gesto? (No Spriter não há Inclinar) |

## Decidido em 13/09/2026

**Item 2, a bolinha de girar.** Ele marcou o lugar na imagem, em verde: a
bolinha vai na **metade de cima do osso**, do lado da ponta. Hoje ela nasce na
base, colada no pivô vermelho, e as duas se atrapalham. Longe do pivô, o giro
fica com alavanca e os dois pontos não se confundem.

Na conta: `knob` deixa de ser `pivô + eixo × 60px de tela` e passa a medir pelo
**comprimento do osso** (a metade de cima, perto da ponta), com um mínimo em
pixels de tela para o osso curto não perder a bolinha.

**Item 4, os quadradinhos do osso.** Ele marcou em vermelho, na imagem, os
quadradinhos a tirar quando o escolhido é um **osso**. Fechado por ele em
13/09: saem **cinco** — os quatro cantos e o do meio de baixo. Ficam **três**:
os dois dos lados e o de cima.

| Alça | Osso | O que ela faz |
|:---|:---:|:---|
| `w`, `e` (meio dos lados) | fica | a espessura |
| `n` (meio de cima) | fica | o comprimento, puxando pela ponta |
| `s` (meio de baixo) | **sai** | puxaria pela base, que é onde está o pivô |
| `nw`, `ne`, `sw`, `se` (cantos) | **saem** | canto não quer dizer nada numa linha |

O desenho continua com os oito.

## Sobra do chat 2 (13/09/2026)

O chat "As ferramentas" consertou o item 7 nas quatro ferramentas de arrastar,
e achou a **mesma bagunça nas setas do teclado**: `nudge`, em
`viewport/tools/select.ts`, ainda anda com todos os ossos escolhidos, então pai
e filho na mesma seleção fazem o filho andar duas vezes. Uma linha: trocar
`selectedBones` por `draggedBones`. Fora da parte dele; **pendente**, para quem
pegar o `select.ts`.

## Pendência para o fecho limpo (13/09/2026)

O chat 1 deixou a caixa com `visibleHandles` (só três alças no osso), mas **quem
desenha a caixa é `transform-tool.ts`, do chat 2**. No chamado do fecho, o chat 2
tem que usar `visibleHandles` ao desenhar — senão o osso continua mostrando as
oito na tela, mesmo com o clique já ignorando os cantos.

## Afinado pelo Humberto durante o lote (13/09/2026)

| O quê | Como ficou |
|:---|:---|
| 3.1 | O incômodo é só quando **nada** está escolhido: aí o osso novo vira filho de coisa aleatória. Osso atrás de osso (a cadeia) ele **quer manter** |
| 3.1, novo | Clicar numa **imagem** na cena não conta como escolher osso — *"por que uma imagem escolhe um osso?"*. Nesse caso o osso novo nasce solto |
| 3.2 | Confirmado, e vale também **arrastando na Árvore**: hoje nem lá o filho vira pai |

## Próximo lote, já pedido e ainda sem dono

**O `P` mostra os filhos.** Com um osso escolhido, segurar `P` deve **mostrar na
cena quais são os filhos dele** — cor e opacidade leve, como o Spriter —, e o
clique vira filho ou desafilha. Hoje o `P` já afilha, mas às cegas.

Encosta em `viewport/viewport-draw.ts` e `viewport/tools/select.ts`, que não são
do chat 3. **Vai para o chat 1 (A caixa) depois do fecho limpo**, junto com a
sobra das setas do teclado (`nudge`, no mesmo `select.ts`). Fora agora para a
árvore não se mexer de novo antes do fecho.
