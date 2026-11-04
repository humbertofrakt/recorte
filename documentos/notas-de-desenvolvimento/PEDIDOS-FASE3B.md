# Pedidos da fase 3B

O que um dono precisou de outro e como contornou enquanto não chega.
Uma linha por pedido. Quem atender, apaga o contorno junto.

## 1. `pose-mode.ts` — ATENDIDO

**Quem pediu:** dono B (painel Curvas, `src/panels/graph.ts`).
**Quem atendeu:** dono A. Resposta no pedido 3b abaixo.

`graph.ts` já escreve só por `pose-mode.ts`. A classe local `MoveKey` foi
apagada. O que ficou:

- **Curva** (alça arrastada e botão de formato):
  `new SetKey(animação, chave.time, alvo, valor, { curve, label, mergeable })`.
  O valor vai de volta como está no arquivo; só a curva muda.
- **Arrastar a chave** (tempo + valor juntos): `class DragKey extends EditKeys`,
  em `graph.ts`. É o `EditKeys` do dono A com a regra de junção do `SetKey`:
  `EditKeys` sozinho não junta, e um arrasto viraria cinquenta passos de
  desfazer. Cada comando move a chave de **onde ela está agora** para onde o
  cursor está, então juntar é só guardar a foto mais velha (`adopt`).

**Se um dia `EditKeys` ganhar junção própria**, `DragKey` some e vira
`new EditKeys(animação, 'Mover chave', …)` direto.

## 2. Registrar o painel Curvas em `src/panels/index.ts` — ATENDIDO

**Quem pede:** dono B. **Quem atendeu:** onda 1 da fase 3B.

`src/panels/index.ts` importa e exporta `graphPanel`. O painel aparece na aba
**Curvas** da faixa de baixo, não na coluna da direita — ver o pedido 5.

## 3. `endMerge` no contrato — ATENDIDO

**Quem pede:** dono B (já pedido antes em `PEDIDOS-CONTRATO.md`, pedido 3).
**Quem atendeu:** onda 2 da fase 3B.

`EditorDoc` declara `endMerge?(): void`. Opcional de propósito: um documento que
não junta comandos não tem nada para fechar. Os moldes de `graph.ts`,
`panels/properties.ts` e `viewport/viewport.ts` podem cair quando der.

## 3b. Resposta ao pedido 1: `pose-mode.ts` está pronto

**Quem responde:** dono A. **Para:** dono B.

`src/anim/pose-mode.ts` existe. A ordem dos argumentos ficou diferente da que o
pedido 1 chutou, porque `time` anda sempre junto de `animation`:

```ts
new SetKey(animation, time, target, value?, options?)
// options: { curve?, offset?, event?, keepCurve?, label?, mergeable? }
```

- Junta sozinho durante um arrasto: mesma animação, mesmo tempo, mesma timeline
  viram **um** passo de desfazer. `doc.endMerge()` fecha o arrasto.
- `keepCurve` é `true` por padrão: rechavear um valor **não** apaga a curva que
  o usuário desenhou no painel Curvas. Para trocar a curva, passe `curve`.
- Para escrever vários campos numa tacada (mover chave + mudar valor), há
  `EditKeys(animation, label, (file, animation) => { ... })`: qualquer função de
  `keying.ts` roda lá dentro e vira um passo de desfazer exato.

Ou seja, a classe local `MoveKey` de `graph.ts` pode virar
`new EditKeys(animação, 'Mover chave', (f, a) => moveKeys(f, a, [ref], delta))`.

## 4. Altura do painel na coluna — ATENDIDO

**Quem pede:** dono B. **Quem atendeu:** onda 1 da fase 3B.

As duas regras saíram de `graph.css` e de `dopesheet.css`. Os dois painéis agora
moram na faixa de baixo, cuja altura o usuário **arrasta com o mouse** (a barra
`.dock-grip`, que também anda com as setas do teclado). O piso é 220 px e a área
de desenho nunca fica com menos de 150 px.

## 5. Registrar o painel Linha do tempo em `src/panels/index.ts` — ATENDIDO

**Quem pede:** dono A. **Quem atendeu:** onda 1 da fase 3B.

Registrado, e a casca ganhou a faixa de baixo que o pedido descreve:
`ui/shell.ts` agora tem `.shell-center` (área de desenho **em cima**, faixa
**embaixo**, na largura toda) com abas entre *Linha do tempo* e *Curvas*. A
lista `DOCK_PANELS` diz quais painéis vão para lá; os outros três continuam na
coluna da direita, e os três cabem numa tela de 900 px com rolagem por painel.

## 6. A linha do tempo pede `rebuild` para uma animação só — ATENDIDO

**Quem pede:** dono A. **Quem atendeu:** onda 2 da fase 3B.

Como ficou:

- `Command` ganhou `animationOnly?: string` no contrato: "mudei só as timelines
  desta animação, e mais nada". `AnimationEdit` (logo `SetKey`, `RemoveKey` e
  `EditKeys`) devolve o nome da animação nesse campo.
- `Doc.after` olha esse campo antes do `kind` e chama `rebuildAnimations()`, que
  lê **só** `/animations` e troca as animações dentro do `SkeletonData` que já
  existe. Ossos, slots, peles e anexos ficam como estão, e o `Skeleton` que está
  na tela continua o mesmo objeto.
- No runtime: `loadAnimationsFor(data, json)` monta as timelines contra um
  `SkeletonData` já carregado, e `SkeletonData.replaceAnimations` as troca no
  lugar. Nenhum dos dois é usado por um jogo; existem para um editor.
- O `kind` continua `'structure'`, de propósito: quem escuta precisa saber que
  uma timeline pode ter nascido. O que mudou foi o **preço**, não o aviso.

Três testes novos em `documento.test.ts` seguram o contrato: o valor novo
aparece, o objeto de dados é o mesmo, e uma timeline nova também entra.

O texto original do pedido:

Toda chave é um comando de `kind: 'structure'`, porque o `Doc` só enxerga uma
timeline nova depois de recarregar o arquivo inteiro pelo runtime
(`loadSkeletonData`). Num arrasto isso é um `loadSkeletonData` por movimento do
mouse. Funciona e está correto, mas num esqueleto grande vai pesar.

O conserto é o `Doc` saber recarregar **uma** animação: algo como
`doc.rebuildAnimation(nome)`, e aí `SetKey` volta a ser `'transform'`.

**Dono B assina embaixo.** O painel Curvas tem o mesmo problema: arrastar uma
alça de Bézier é um `SetKey` por movimento do mouse, e cada um recarrega o
arquivo inteiro. Hoje passa; num esqueleto grande, não.

## 7. Onde as ferramentas devem chamar `setPropertyOrKey` — ATENDIDO

**Quem pede:** dono A. **Quem atendeu:** onda 1 da fase 3B.

Como ficou:

- `src/viewport/tools/select.ts` ganhou `writeBoneValues(doc, rótulo, chave de
  junção, valores)`. Em montagem ela roda o `SetProperty` do viewport, como
  antes; com animação aberta ela chama `keyValuesNow` de `pose-mode.ts`, que
  grava **x e y (ou escala X e Y) numa chave só** e junta o arrasto inteiro num
  passo de desfazer. `translate.ts`, `rotate.ts` e `scale.ts` passam por ela, e
  partem de `readBoneNow`, que lê o valor que a animação mostra no tempo atual.
- `src/panels/properties.ts` traduz o ponteiro do campo para o alvo da timeline
  (`targetForPointer`, novo em `keying.ts`) e chama `setPropertyOrKey`. Campo que
  nenhuma timeline carrega — nome, comprimento, pai — continua escrevendo o
  arquivo nos dois modos, que é o certo.
- `select.ts` e `create-bone.ts` **não** mudaram: um só escolhe, o outro cria um
  osso novo, e nenhum dos dois escreve um valor animável.
- A barra de estado diz em que modo está: **Montagem** ou **Animando: walk**, com
  a gravação automática escrita ao lado.

O texto original do pedido:

A regra dos dois modos só vale se **todo** lugar que escreve um valor animável
passar por `setPropertyOrKey(doc, alvo, valor, opções)`. Hoje ainda escrevem
`SetProperty` direto, e por isso mexer num osso com uma animação aberta continua
estragando a pose de repouso:

- `src/viewport/tools/translate.ts`, `rotate.ts`, `scale.ts`;
- `src/panels/properties.ts`, nos campos de osso, slot e regra.

A troca é pequena: em vez do ponteiro, monte o alvo
(`boneTarget('braco', 'rotation')`, `slotTarget('corpo', 'color')`,
`constraintTarget('braco-ik', 'mix')`) e chame `setPropertyOrKey`. Ele decide
sozinho entre pose e chave, e devolve `'montagem' | 'chave' | 'bloqueado'`.

## 8. Registrar a ferramenta Posar e o painel Exibição — ATENDIDO

**Quem pede:** dono D. **Quem atendeu:** onda 2 da fase 3B.

`viewport/viewport.ts` importa as três ferramentas novas (Posar, Malha e Pesos)
junto das cinco antigas, e `panels/index.ts` importa o painel Exibição. Os oito
botões aparecem na barra da área de desenho, cada um com o rótulo escrito e a
tecla ao lado.

O texto original do pedido:

Os dois arquivos novos se registram sozinhos, mas ninguém os importa, então na
tela ainda não aparecem:

- `src/viewport/tools/pose-tool.ts` — ferramenta **Posar** (`B`).
  Falta `import './tools/pose-tool.js';` em `src/viewport/index.ts`.
- `src/panels/view-panel.ts` — painel **Exibição** (`exibicao`).
  Falta `import './view-panel.js';` em `src/panels/index.ts`. A casca já põe
  todo painel que não está em `DOCK_PANELS` na coluna da direita, então só o
  import basta.

**Contorno enquanto isso:** nenhum. `npx vitest run editor/testes/exibicao.test.ts`
exercita as duas coisas sem a tela.

## 9. A casca de cebola e as alças precisam de um gancho em `viewport.ts` — ATENDIDO

**Quem pede:** dono D. **Quem atendeu:** onda 2 da fase 3B.

`viewport.ts` agora chama `drawOnionSkin` **antes** do renderizador (o fantasma
fica atrás do desenho) e `resolveHandles` + `drawHandles` depois dele, em
qualquer ferramenta. Também lê `viewSettings()`: grade, eixos, ossos, nomes dos
ossos, caixas, pontos e a cor do fundo obedecem às caixas do painel Exibição, e
o desenho se refaz sozinho quando uma delas muda (`onViewSettings`).

A ferramenta Posar deixou de desenhar as duas coisas; só marca com um anel a
alça que está sendo arrastada.

O texto original do pedido:

`drawOnionSkin(doc, ctx, scale)` de `viewport/onion.ts` tem de ser chamada
**antes** do renderizador (o fantasma fica atrás do desenho), e
`resolveHandles` + `drawHandles` de `viewport/handles.ts` **depois** dele, em
qualquer ferramenta — não só na Posar.

`viewport.ts` também ainda não lê `viewSettings()`: grade, eixos, ossos, nomes,
caixas, pontos e cor de fundo estão presos no `COLOR` e no `drawGrid`. Cada
caixa do painel Exibição já guarda a opção; falta o desenho obedecer.

**Contorno de agora:** a ferramenta **Posar** desenha a casca de cebola e as
alças dentro do próprio `drawOverlay`. Funciona, mas só com ela ativa, e a
casca sai por cima do desenho em vez de por baixo.

## 10. `EditorState` precisa guardar as opções de exibição — ATENDIDO

**Quem pede:** dono D. **Quem atendeu:** onda 2 da fase 3B.

Foi o conserto 2: `Doc.captureEditorState` começa por `readEditorState(file)` e
escreve por cima só o que é dele (câmera, seleção, animação, peles). Qualquer
chave que outro dono tenha posto na extensão continua lá depois de salvar —
`view` inclusive. `EditorState` ganhou o campo `view?` para documentar isso.
O painel Exibição agora abre um arquivo com as opções que ele traz, e só cai na
cópia do navegador quando o arquivo não traz nenhuma.

O texto original do pedido:

`Doc.captureEditorState()` monta um objeto novo a cada salvamento e grava por
cima de `extensions.RECORTE_editor_state`. Qualquer chave que outro dono tenha
escrito ali some — inclusive `view`, onde o painel Exibição guarda o que
mostrar, a casca de cebola e a cor do fundo.

Dois consertos, qualquer um serve:

1. `EditorState` ganha `view?: ViewSettings` e `captureEditorState` copia o que
   `viewport/onion.ts` tem no momento; ou
2. `captureEditorState` preserva as chaves que já estavam na extensão
   (`{ ...readEditorState(file), ...state }`).

**Contorno de agora:** `view-panel.ts` grava as opções em duas casas —
`writeViewState(doc.file)` na extensão (que se perde ao salvar) e uma cópia no
`localStorage`, na chave `RECORTE_editor_state.view`, que é a que realmente
dura.

## 11. `visibleSkins` no contrato — ATENDIDO

**Quem pede:** dono D. **Quem atendeu:** onda 2 da fase 3B.

`EditorDoc` tem `visibleSkins: string[]`, com a regra escrita ao lado: a
primeira da lista é a pele editável. O molde some quando `onion.ts` quiser.

O texto original do pedido:

`Doc` já tem `visibleSkins: string[]`, mas `EditorDoc` não. O painel Exibição
lê e escreve por um molde (`doc as EditorDoc & { visibleSkins?: string[] }`),
o mesmo contorno que `viewport.ts` usa para `camera`. Pedimos o campo no
contrato, junto de `editableSkin` — a pele em que um anexo novo é criado é a
**primeira** da lista.

## 12. Registrar as ferramentas Malha e Pesos em `viewport/viewport.ts` — ATENDIDO

**Quem pede:** dono C. **Quem atendeu:** onda 2 da fase 3B.

As duas linhas estão lá, junto de `import './tools/pose-tool.js'`.

O texto original do pedido:

`viewport.ts` importa as cinco ferramentas pelo efeito colateral. As duas novas
(`viewport/tools/mesh-tool.ts` e `viewport/tools/weights-tool.ts`) precisam das
mesmas duas linhas:

```ts
import './tools/mesh-tool.js';
import './tools/weights-tool.js';
```

**Contorno de agora:** `panels/mesh-panel.ts` importa as duas, e o painel
"Malha e pesos" está em `panels/index.ts`, que `main.ts` carrega. Funciona, mas
o lugar certo das ferramentas é o barril do viewport.

## 13. Altura dos painéis da direita: agora são cinco — ATENDIDO EM PARTE

**Quem pede:** dono C. **Quem atendeu:** onda 2 da fase 3B.

Virou um acordeão, não uma altura arrastável: o título de cada painel é um
botão que dobra o painel e devolve a altura dele para os outros. As alturas
mínimas foram refeitas para os cinco caberem numa tela de 900 px (medido no
navegador: coluna de 803 px, painéis de 223 + 150 + 190 + 120 + 120), e a
coluna passou a rolar numa tela mais baixa, para o último painel nunca ficar
fora de alcance.

**Falta** a altura arrastável painel a painel, como a da faixa de baixo.

O texto original do pedido:

Com "Malha e pesos" a coluna da direita tem quatro painéis de altura fixa e o
último fica espremido. O painel rola por conta própria, então nada some, mas
numa tela de 900 px sobra pouco. Pedimos altura arrastável (ou um acordeão) para
os painéis da coluna, como já existe na faixa de baixo.

## 14. README do editor: a malha já se edita — ATENDIDO

**Quem pede:** dono C. **Quem atendeu:** onda 2 da fase 3B.

O README foi refeito: ferramentas Posar, Malha e Pesos, painéis "Malha e pesos"
e "Exibição", casca de cebola, alças das regras, a chave de `deform` e a foto
`tela-malha.png` da malha com os pesos pintados.

O texto original do pedido:

A seção "O que ainda não funciona" diz **"Não há edição de malha"**. Já há:
ferramentas Malha (`M`) e Pesos (`G`), painel "Malha e pesos", chave de
`deform` ao mover vértice com uma animação aberta. Não mexi no README por ser
de outro dono.

## 15. Atlas com região girada — ATENDIDO

**Quem pede:** dono C. **Quem atendeu:** onda 2 da fase 3B.

`panels/mesh-panel.ts` ganhou `cropPlacement(region)`, que devolve o retângulo a
ler na página do atlas e a matriz de canvas que devolve o recorte ao lugar dele
dentro da imagem original — desvirando quando `rotation: 90`. A matriz sai da
conta normativa de `AtlasRegionData.computeUV` (spec 10.4) lida ao contrário, e
três testes em `malha.test.ts` conferem canto a canto. "Gerar automática" e
"Traçar contorno" já não recusam nada: no herói, a região `arm` é girada no
atlas e a malha sai certa.

O texto original do pedido:

"Gerar automática" e "Traçar contorno" leem os pixels da imagem original. Se o
atlas gravou a região girada (`rotation: 90`, spec 10.3), o painel **recusa** e
avisa: "a imagem está girada no atlas: grave o atlas sem girar". Desgirar sem um
teste seria uma resposta errada em silêncio. Falta o caso girado.
