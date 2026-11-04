# Pedidos ao contrato

Coisas que faltam em `src/contract.ts`. Ninguém edita o contrato sem combinar.
Enquanto isso, cada item traz o contorno que está em uso.

## 1. Ferramenta ativa

O contrato diz que a ferramenta ativa não fica no documento — certo. Mas também
não existe lugar nenhum para ela. Hoje quem guarda é a casca (`ui/shell.ts`), em
`shell.tool`, `shell.setTool(id)` e `shell.onToolChange(cb)`.

O viewport precisa saber qual é a ferramenta ativa e não pode importar
`ui/shell.ts` (dono diferente).

**Contorno:** `main.ts` publica `globalThis.recorte = { doc, shell }`.

**Pedido:** um registro no contrato, tipo `setActiveTool(id)` / `getActiveTool()`
/ `onActiveTool(cb)`, do mesmo jeito que `registerTool`.

## 2. Onde o viewport se monta

Não existe `registerViewport`. A casca cria a área central e o `main.ts` chama
`mountViewport(doc, host)` se o módulo `src/viewport/index.ts` exportar isso.

**Pedido:** ou um `registerViewport({ mount })`, ou deixar escrito no contrato
que `viewport/index.ts` exporta `mountViewport(doc, host)`.

## 3. Fim de arrasto (quebrar a fusão de comandos)

`Command.mergeWith` junta os comandos de um arrasto num passo só. Falta dizer
quando o arrasto acabou, senão o próximo arrasto engole o anterior.

**Contorno:** `Doc.endMerge()` (em `doc/document.ts`). O viewport chama no
`pointerup`.

**Pedido:** `endMerge()` no `EditorDoc`.

## 4. Câmera e skins visíveis

`EditorState` guarda `camera` e `skins`, mas o `EditorDoc` não tem onde
guardá-los enquanto o editor está aberto.

**Contorno:** campos públicos `doc.camera` e `doc.visibleSkins` na classe `Doc`.
Gravados no arquivo por `doc.serialize()`.

**Pedido:** os dois no `EditorDoc`.

## 5. Nome do arquivo e bytes para salvar

**Contorno:** `doc.name` e `doc.serialize()` na classe `Doc`.

**Pedido:** ambos no `EditorDoc`, para os painéis não dependerem da classe.

## 6. Comandos comuns (SetProperty, renomear, apagar)

O contrato define a interface `Command`, mas nenhum comando concreto. Os painéis
da direita precisavam de `SetProperty` (escrever um valor num JSON Pointer),
`RenameItem`, `ReparentBone`, `MoveSlot`, `AddBone`, `AddSlot`, `DeleteItems`,
`AddAnimation`, `DuplicateAnimation` e `DeleteAnimation`.

**Contorno:** estão em `src/panels/properties-model.ts`, `src/panels/tree-model.ts`
e `src/panels/animations-model.ts`. São puros e testados.

**Pedido:** decidir se esses comandos sobem para `doc/comandos.ts` (dono A). Se
subirem, os painéis passam a importar de lá e as cópias saem daqui. Enquanto
isso ninguém deve criar um segundo `SetProperty` em outro lugar.

## 7. Fim de arrasto também nos campos numéricos

Ligado ao pedido 3. Arrastar um campo numérico no painel de propriedades gera um
comando por pixel; eles se fundem por `mergeWith`.

**Contorno:** `properties.ts` chama `doc.endMerge?.()` por checagem em tempo de
execução, porque `endMerge` ainda não está no tipo `EditorDoc`.

**Pedido:** o mesmo do item 3 — `endMerge()` no `EditorDoc`.

## 8. CSS sem declaração de módulo

`import './panels.css'` só compila com um `declare module '*.css'` em algum
`.d.ts`. Como esse arquivo seria compartilhado entre donos (e declarar duas
vezes dá erro), os painéis não usam esse import.

**Contorno:** `src/panels/dom.ts` tem `ensureStylesheet()`, que injeta um
`<link>` para `new URL('./panels.css', import.meta.url)` no primeiro `mount`.

**Pedido:** se o dono A criar um `env.d.ts` com `declare module '*.css'`, avise
que os painéis voltam ao `import` normal.

---

# Pedidos do viewport (dono B)

## 9. Existem dois `SetProperty` — precisa juntar

O item 6 pede que ninguém crie um segundo `SetProperty`. Aconteceu, e por um
motivo: o dos painéis escreve por JSON Pointer no arquivo. O do viewport
(`src/viewport/tools/select.ts`) escreve a **pose local de um osso** e precisa
gravar o mesmo número em **três lugares no mesmo instante**:

1. `doc.file` — o documento, que é o que é salvo;
2. o `BoneData` já carregado — que é a pose de repouso que um `repose()` devolve;
3. o `Bone` vivo — para o quadro seguinte já sair certo.

Sem o passo 2 e o passo 3, arrastar um osso não move nada na tela: o comando é
do tipo `transform`, que segundo o contrato só pede um `repose()`, e um
`repose()` reconstrói a pose a partir do `BoneData`, que ainda tem o valor
velho. Escrever só no arquivo exigiria um `rebuild()` por pixel de arrasto.

**Pedido:** ao juntar os dois comandos em `doc/comandos.ts`, **manter a escrita
tripla**. Ou, melhor: dar ao `EditorDoc` um método
`setBoneLocal(nome, propriedade, valor)` que faça as três escritas, e os dois
`SetProperty` passam a chamá-lo.

## 10. `endMerge()` (item 3): o viewport não depende dele

As ferramentas de arrasto do viewport dão a cada arrasto uma chave própria
(`newMergeKey`), e `mergeWith` só funde comandos com a mesma chave. Então um
arrasto novo nunca engole o anterior, mesmo sem `endMerge()`.

Continua sendo bom ter `endMerge()` no `EditorDoc` — só não é bloqueante aqui.
O `Doc` do dono A já tem o método, e o viewport chama no `pointerup` por
checagem em tempo de execução, do mesmo jeito que os painéis.

## 11. Ferramenta ativa (item 1): o viewport também publica a sua

Enquanto o contrato não tem registro de ferramenta ativa, `viewport.ts` exporta
`getActiveToolId()`, `setActiveTool(id, doc)` e `onActiveToolChange(cb)`. A
casca pode chamar essas funções direto (`import` de `viewport/viewport.js`) em
vez de passar pelo `globalThis`.

Se o contrato ganhar o registro do item 1, essas três funções viram um repasse
de uma linha cada.

## 12. Onde o viewport se monta (item 2)

O viewport foi feito como `Panel` do contrato, com id `viewport` e título
"Cena", registrado por `registerPanel`. Ele só precisa que a casca lhe dê um
`host` que ocupe a área central e que possa crescer (`flex: 1`, altura
definida) — não é um painel de barra lateral.

Se a casca preferir `mountViewport(doc, host)`, é só criar
`src/viewport/index.ts` com uma linha chamando `viewportPanel.mount`. Avise
antes de criar esse arquivo, para não colidir.

## 13. CSS: o `import` funciona com `@ts-ignore`

Sobre o item 8: `viewport.ts` faz `import './viewport.css'` com um
`// @ts-ignore` em cima e um comentário dizendo por quê. `npx tsc --noEmit -p
editor/tsconfig.json` passa limpo assim, sem precisar de `env.d.ts`. Se o dono
A criar o `env.d.ts`, é só apagar a linha do `@ts-ignore`.

---

## Respostas do dono A (documento, casca, entrada/saída)

**Sobre o item 8 (CSS).** Feito. `src/env.d.ts` existe e tem
`declare module '*.css'`. Os painéis podem voltar ao `import './panels.css'`
normal. Esse é o único arquivo com essa declaração — ninguém repita, porque
declarar duas vezes dá erro de compilação.

**Sobre o item 6 (comandos repetidos).** Os comandos comuns já existem em
`src/doc/commands.ts` (dono A), com desfazer exato testado em
`testes/documento.test.ts`:

| O que faz                          | Classe                            |
| ---------------------------------- | --------------------------------- |
| escrever um valor num JSON Pointer | `SetProperty`                     |
| escrever vários de uma vez         | `SetProperties`                   |
| renomear e consertar referências   | `RenameNode(kind, de, para)`      |
| trocar o pai de um osso            | `ReparentBone`                    |
| criar                              | `AddBone`, `AddSlot`, `AddAnimation` |
| apagar em cascata                  | `RemoveBone`, `RemoveSlot`, `RemoveAnimation` |

Também exporta `getAtPointer`, `setAtPointer`, `pointerOf` e `parsePointer`.

`RenameNode` cobre osso, slot, skin, restrição, animação, evento, parâmetro,
morph e variável, e conserta: `bone.parent`, `slot.bone`, `constraint.bones`,
`constraint.target` (osso no ik e no transform, **slot** no path),
`constraint.bone` do physics, `skin.bones`, `skin.includes`,
`skin.constraints`, chaves de `skin.attachments`, `clipping.slots`,
`clipping.end`, `morph.targets`, `parameter.source.bone`, o `parameter` e o
`animation` do driver, e o alvo de toda timeline — inclusive as que ficam
dentro de `driver.targets` e as entradas de `drawOrder`.

**Sugestão:** os painéis passarem a importar daqui, para não existirem dois
`SetProperty` com regras de fusão diferentes. Combinamos quando der.

**Sobre o item 3 e 7 (fim de arrasto).** `doc.endMerge()` existe e está
testado. Chamar no `pointerup`.

---

# Como ficou depois de ligar tudo (07/09/2026)

O editor abre no navegador. Nada disso mudou `contract.ts`.

## Itens 1 e 11 — ferramenta ativa

Existem duas: `shell.tool` / `shell.setTool(id)` e `setActiveTool(id, doc)` do
viewport. `main.ts` liga uma na outra nos dois sentidos (`bridgeTools`), e cada
lado ignora um valor que já é o dele, então não há laço infinito. Clicar no
botão do viewport muda a da casca e vice-versa.

**O pedido continua de pé:** um registro de ferramenta ativa no contrato
apagaria a ponte.

## Item 2 — onde o viewport se monta

Feito dos dois jeitos, sem colidir de arquivo:

- `src/viewport/index.ts` (novo) exporta `mountViewport(doc, host)`;
- a casca, que é quem decide o desenho da tela, **não** usa essa função: ela
  procura o painel de id `viewport` (constante `STAGE_PANEL` em `ui/shell.ts`)
  e o monta no centro, sem cabeçalho; os outros painéis vão para a coluna da
  direita, cada um com o seu título.

Quem quiser embutir só a área de desenho em outro lugar usa `mountViewport`.

## Item 6 e 9 — os dois `SetProperty`

Ficaram os dois, de propósito, porque fazem coisas diferentes:

| Onde | O que escreve | Tipo de mudança |
|:---|:---|:---|
| `viewport/tools/select.ts` | pose local de osso, nos **três** lugares (arquivo, `BoneData`, `Bone` vivo) | `transform` — só re-aplica a pose |
| `panels/properties-model.ts` | qualquer valor, por JSON Pointer, **só no arquivo** | `structure` — reconstrói |

O segundo passou de `transform` para `structure`. Sem isso o desenho não
acompanhava o número: `transform` só chama `repose()`, e `repose()` monta a
pose a partir do `BoneData` já carregado, que ainda tinha o valor velho.
Reconstruir um `heroi.bone` de 28 kB leva poucos milésimos, então dá para
arrastar o campo sem engasgo. Está preso por teste em
`testes/ligacao.test.ts`.

As chaves de fusão não brigam: as do viewport são únicas por arrasto
(`newMergeKey`) e as dos painéis são o próprio JSON Pointer.

## Itens 3 e 7 — fim de arrasto

`doc.endMerge()` existe e os dois lados chamam por checagem em tempo de
execução. Sem mudança.

## Item 8 — CSS

`src/env.d.ts` tem `declare module '*.css'`. `shell.ts` e `viewport.ts` usam
`import` normal. Os painéis continuam com o `<link>` de `dom.ts`, porque assim
o arquivo `panels.css` sai como asset próprio também no build — funciona nos
dois modos e não custa nada trocar depois.

## Painel de propriedades: quem ganha a seleção

Um clique na área de desenho seleciona **osso + slot + anexo** de uma vez (é o
que `picking.selectionFor` faz). Antes o painel chamava isso de "vários itens"
e não mostrava campo nenhum. Agora:

- dois itens **do mesmo tipo** = "vários itens";
- um clique só = mostra o **osso**, para o painel falar dos mesmos números que
  as ferramentas Mover, Girar e Escalar escrevem;
- uma linha de anexo ou de slot na árvore seleciona só ela, e aí o painel abre
  os campos daquele anexo ou slot.

## Ainda faltando (não é do contrato)

Linha do tempo, edição de malha, alça do alvo de IK, troca de pele na tela.
