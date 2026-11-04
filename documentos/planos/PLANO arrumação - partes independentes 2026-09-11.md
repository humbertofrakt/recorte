# PLANO arrumação — partes independentes · 11/09/2026

Planejador → executor. Oito lotes, **A1 a A8**, v10.4 em diante. Nenhum muda o
que o programa faz. Este plano não depende de conversa nenhuma: tudo está aqui.

**Ordem do Humberto (11/09):** executar até o fim, sem parar para perguntar.
Dúvida no caminho → o executor decide, escreve em Desvios e segue.

## O que o Humberto disse (11/09/2026, depois da v10.3)

> "Por que as mudanças demoram?"
> "Organizar o programa para só abrir a parte que vamos mexer. Mudei um botão;
> com o código organizado, ele não vai alterar outras coisas."
> "As teclas deveriam estar em um lugar para conferir de forma rápida, e não
> espalhadas no código."
> "Veja se há outras coisas que poderia arrumar. Se tudo estiver bem organizado,
> vários chats poderiam trabalhar ao mesmo tempo, em partes independentes."

## O que prende as partes hoje (medido no código da v10.3)

| # | O que | Medida | Por que pesa |
|:---:|:---|:---|:---|
| 1 | Teclas espalhadas | 30 ouvintes de `keydown` em 14 arquivos. Cinco decidem de verdade: `shell.onKeyDown`, `viewport.onKeyDown`, `dopesheet.onKeyDown`, `draw-order.orderKeys`, `tree.gestureKey` | Ctrl+↑ é "Marca anterior" e é a ordem na cena. Ninguém viu até ler os dois |
| 2 | Ações sem dono fixo | 87 `registerAction` em 11 arquivos; 108 ids no menu; **41 ações do menu moram em painel que pode estar desmontado** (Árvore 13, Linha do tempo 9, Exibição 9, Ordem 6, Animações 2, Peles 1, Regras 1) | Ação de menu que não existe quando a aba está fechada. Foi por isso que `copiar-ordem-animacao` teve de morar na cena |
| 3 | Arquivos grandes | `shell.ts` 2.864 · `dopesheet.ts` 2.780 · `viewport.ts` 2.527 · `tree-model.ts` 1.609 · `keying.ts` 1.414 · `tree.ts` 1.115 · `menus.ts` 947 | Mudar um botão obriga a ler 2.000 linhas para não quebrar o vizinho |
| 4 | Um CSS para dez painéis | `panels.css` 2.105 linhas. Árvore no começo (160) e no fim (2056). Ordem em 680 e em 1348 | Cinco painéis já têm CSS próprio (`dopesheet`, `graph`, `mesh-panel`, `preview`, `view-panel`). Os outros dez dividem um |
| 5 | Testes por lote | 88 arquivos; 66 chamados `loteNN`. 13 arquivos com o próprio documento falso | Para achar o teste da Árvore é preciso saber em que lote ela nasceu |
| 6 | Cópias | `el()` definida 6 vezes · "está digitando num campo" 8 vezes em 5 arquivos · `findAnimation` duas vezes (`anim/keying.ts` e `panels/animations-model.ts`) | Conserta num, esquece no outro |
| 7 | Importações contra o contrato | `doc/` importa `panels/` (2) · `anim/` importa `panels/` (1) · `mesh/` importa `panels/` (1) · `io/` importa `panels/` e `ui/` (2) · 9 painéis importam a cena (`onion.ts`, `viewport.ts`) | O contrato diz que `doc/`, `anim/` e `mesh/` são a base. Hoje a base puxa a interface. Ninguém importa a casca: isso está certo |
| 8 | Três arquivos que todo lote escreve | `CHANGELOG.md` 2.567 · `ESTADO.md` 814 · `backup/INDICE.md` 1.044 | Dois chats no mesmo dia batem nos mesmos três arquivos |
| 9 | Scripts de prova no meio das notas | `roteiro-30.mjs`, `medir-paineis.mjs`, `conferir-editor.mjs`, `fotos-manual.mjs` em `documentos/notas-de-desenvolvimento/` | Quem procura "como se prova" procura em `ferramentas/` |

## A regra de ouro de todo lote deste plano

**O comportamento não muda.** Só mover, nomear e juntar. Qualquer conserto que
apareça no caminho vai para a seção Desvios e para um lote próprio.

Prova, igual em todos: suíte inteira **≥ 2.600** (nunca cai), `tsc` limpo,
conformidade **53 de 53**, roteiro **14 de 14**, medição **22 de 22**, console
limpo. `programa/` remontado só no fecho.

## Ordem de trabalho (o Humberto aprovou em 11/09: "se não perde segurança, pode ser")

| Quando | O que rodar |
|:---|:---|
| Durante o lote | `npx tsc --noEmit -p editor/tsconfig.json` e só os testes dos arquivos mexidos: `npx vitest related <arquivos> --run` |
| No fecho, uma vez | `npx vitest run` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `node documentos/notas-de-desenvolvimento/medir-paineis.mjs` (do A7 em diante: `ferramentas/provas/`) |
| Sempre | Backup datado antes; linha no `INDICE.md`; `versao.py`; CHANGELOG; remontar `programa/`; Desvios no fim deste plano. Manual pausado |

## Quando, em relação ao teste do Humberto

A1 e A2 saem agora: são o pedido explícito dele e não mudam comportamento. O
`programa/` que ele testa continua sendo a v10.3 até o fecho de cada lote. As
anotações dele viram lotes de conserto, cada um com número próprio, intercalados
com os lotes A. Um lote de cada vez no mesmo arquivo.

---

## A1 · Teclas numa tabela — v10.4

**Nasce** `editor/src/ui/keys.ts`, módulo puro, sem DOM.

```ts
export type KeyScope = 'toda-parte' | 'cena' | 'linha-do-tempo' | 'arvore' | 'ordem';
export interface KeyBinding {
  key: string;        // como shortcutOfEvent escreve: 'ctrl+arrowup', 'p', ' '
  scope: KeyScope;    // onde a tecla vale
  action: string;     // id do registro de ações, ou 'local:<nome>' quando é gesto do painel
  label: string;      // o que aparece em Ajuda → Atalhos
  when?: string;      // condição escrita: 'desenho escolhido', 'sem campo de texto'
}
export const KEY_TABLE: readonly KeyBinding[];
```

| Função | Faz | Teste esperado |
|:---|:---|:---|
| `KEY_TABLE` | `fromMenus(allMenus())` (os atalhos do menu, escopo `toda-parte`) + `SCENE_KEYS` (7 8 9 0, setas, Shift+setas, Ctrl+setas da ordem, Espaço) + `TIMELINE_KEYS` (setas, Shift+setas, Ctrl+↑↓ marcas, Ctrl+C/V/X/K, Shift+Ctrl+C/V, Delete, Shift+Delete, M, Home, End) + `ORDER_KEYS` (Ctrl+setas, Ctrl+Shift+↑↓) + `TREE_KEYS` (P) + `TOOL_KEYS` (de `toolShortcutRows`) | tem pelo menos 60 linhas; toda linha tem `label` |
| `keyConflicts(table)` | as duplas (mesma `key`, mesmo `scope`, ação diferente) | `keyConflicts(KEY_TABLE)` → `[]`. Uma tabela de teste com `ctrl+arrowup` duas vezes em `cena` → 1 conflito |
| `bindingsFor(scope, key)` | as linhas daquela tecla naquele escopo, e depois as de `toda-parte` | `('cena','ctrl+arrowup')` → `[subir-ordem (when: desenho escolhido), chave-anterior]`, nessa ordem |
| `isTyping(target)` | o cheque único de "está num campo de texto" (INPUT, TEXTAREA, SELECT, contentEditable) | substitui as 8 cópias. Em `null` → `false` |
| `shortcutRows(table)` | as linhas de Ajuda → Atalhos, por escopo | igual ao que `shortcutTable + toolShortcutRows + SCENE_GESTURE_ROWS` dão hoje, mesma ordem, mesmos textos. O `lote68-roteiro-consertos` confere esse trecho e continua passando |

**Quem consulta a tabela** (a decisão continua onde está; só a tecla vem da tabela):
`shell.onKeyDown` (escopo `toda-parte`), `viewport.onKeyDown` (`cena`),
`dopesheet.onKeyDown` (`linha-do-tempo`), `draw-order.orderKeys` (`ordem`),
`tree.gestureKey` (`arvore`). `menus.ts` continua a fonte dos atalhos de menu:
`shortcutMap` passa a ler `KEY_TABLE` filtrada por `toda-parte`, para não haver
duas fontes. `SCENE_GESTURE_ROWS` some de `menus.ts`; vira linhas da tabela.

**Decisão do planejador:** Enter, Esc e setas das janelas (`dialog.ts`,
`floating-menu.ts`, `image-picker.ts`, `pivot-dialog.ts`, os três `export-*` e
`import-psd.ts`) **ficam locais**. São de uma janela modal, não do programa. A
tabela ganha um comentário dizendo isso, e só.

**Teste novo** `editor/testes/teclas.test.ts` (≥ 10 `it`): os cinco da tabela
acima, mais: Ctrl+↑ na cena com desenho escolhido mexe na ordem; sem desenho,
passa e vira marca anterior; num campo de texto, nada. Esses três já existem no
`lote66-ordem-spriter`; aqui só se conferem pela tabela.

**Pronto quando:** `keyConflicts(KEY_TABLE)` vazio; Ajuda → Atalhos igual à de
hoje; nenhuma tecla mudou de dono; 2.600 → ≥ 2.610.

## A2 · Ações com dono sempre — v10.5

**Nasce** `editor/src/ui/actions-table.ts`, puro.

```ts
export interface ActionRow {
  id: string;          // 'subir-ordem'
  label: string;       // 'Subir uma'
  owner: 'casca' | 'cena' | 'arvore' | 'ordem' | 'linha-do-tempo' | 'exibicao'
       | 'animacoes' | 'peles' | 'regras' | 'documento';
  needsPanel: boolean; // true = só faz sentido com o painel na tela (ex.: 'buscar')
  greyWhen?: string;   // por escrito: 'sem desenho escolhido', 'sem animação aberta'
}
export const ACTION_TABLE: readonly ActionRow[];  // as 108 ids do menu, mais as só de tecla
```

**A mudança de lugar:** toda ação com `needsPanel: false` cuja conta já está num
modelo puro passa a ser registrada uma vez, no arranque, por
`ui/register-actions.ts` → `registerCoreActions(doc)`, chamado em `main.ts` logo
depois do documento existir (é o mesmo caminho que `copiar-ordem-animacao` usa
hoje na cena). Candidatas, pelo que o código mostra: as 6 da Ordem
(`runOrderStep` já é do modelo), `novo-osso`, `novo-slot`, `novo-ponto`,
`novo-caixa`, `novo-mascara`, `novo-evento`, `novo-parametro`, `apagar`,
`duplicar`, `nova-animacao`, `nova-pele`, `alternar-modo`, `copiar-pose`,
`colar-todas-chaves`, `chave-anterior-escolhido`, `chave-seguinte-escolhido`.
O executor mede uma a uma: **só muda de lugar a que não lê nada do DOM do
painel.** As outras ficam no painel com `needsPanel: true`, e o painel continua
registrando (o `registerAction` substitui, então nada quebra).

| Teste (`acoes.test.ts`, ≥ 8 `it`) | Esperado |
|:---|:---|
| Toda `action` dos menus está na `ACTION_TABLE` | 108 de 108 |
| Toda linha tem `owner` e `label` não vazios | sim |
| Depois de `registerCoreActions(doc)` e **sem painel montado**, `registeredActions()` contém toda id com `needsPanel: false` | sim |
| Nenhuma id com `needsPanel: false` é registrada em `mount` de painel | conferido lendo os arquivos `panels/*.ts` (teste de texto, como o `menu-audit`) |
| `subir-ordem` com a aba Ordem **fechada**, pelo menu | roda; `slots` muda |
| `menu-audit` e `action-audit` de hoje | continuam iguais |

**Pronto quando:** fechar todas as abas e abrir os sete menus mostra as mesmas
entradas de hoje, e as de `needsPanel: false` funcionam. 2.610 → ≥ 2.620.

## A3 · Testes por assunto — v10.6

**Só mover.** Mesmos `describe`, mesmos `it`, mesma contagem (editor: 1.708 `it`
em 88 arquivos). Backup da pasta inteira:
`backup/editor-testes_DATA_antes-do-A3/`, uma linha no INDICE.

| Arquivo novo | Recebe os de hoje |
|:---|:---|
| `arvore.test.ts` | `lote31-pegar-filhos`, `lote34-trocar-de-pai`, `lote60a-raiz-invisivel`, `lote63a-um-gesto`, `lote64-arvore-unica`, a parte de árvore de `paineis` |
| `ordem.test.ts` | `lote25-ordem-e-previa` (a parte de ordem), `lote35-botoes-da-ordem`, `lote50-entre-linhas`, `lote66-ordem-spriter` |
| `malha.test.ts` (já existe) | `lote63-malha-p-liga`, `eventos-e-malha-ligada` (a parte de malha) |
| `pivo.test.ts` | `lote56-pivo-carimbo`, `lote58-pivo-a-mao`, `lote61-pivo-por-pasta` |
| `pasta-do-projeto.test.ts` | `lote59-pasta-do-projeto`, `lote60-lista-da-pasta`, `lote60b-*`, `lote60c-*`, `lote62-salvar-empacota` |
| `animando.test.ts` | `lote57-animando-livre`, `lote44-padrao`, `lote46-troca` |
| `linha-do-tempo.test.ts` | `lote9-laco-e-marcas`, `lote10-chaves-em-bloco`, `lote14-linha-limpa`, `lote15-tocador`, `lote2-tocador`, `chaves`, `eixos-e-chaves`, `curvas`, `lote13-inclinar-e-curvas` |
| `menus.test.ts` | `lote-menus`, `lote12-abas-e-tab`, `lote29-escondidas` |
| `teclas.test.ts` (do A1) | as partes de tecla que estiverem em `lote7-ver-e-travar`, `lote68-roteiro-consertos` |
| `cena.test.ts` | `viewport`, `lote0-selecao-e-trava`, `lote1-zoom`, `lote4-cena-maior`, `lote5-ponto-e-caixa`, `lote6-mascara-e-desenho`, `lote7-ver-e-travar`, `lote21-reguas`, `lote26-inclinar-e-escalar`, `lote47-transformar` |
| `paineis.test.ts` (já existe) | `lote16-duas-colunas`, `lote17-barra`, `lote18-tema`, `lote19-paineis-limpos`, `lote22-ficha-rapida`, `lote52-altura-dos-paineis`, `lote65-paineis-que-cabem`, `exibicao` |
| `peles-e-regras.test.ts` | `lote27-peles`, `lote28-regras`, `lote39-peles-na-tela`, `lote40-ponto-no-slot`, `lote42-clonar-guias-familia` |
| `arquivo.test.ts` | `lote11-arquivo-e-ajuda`, `documento`, `lote33-o-basico`, `lote36-chegar-no-programa`, `lote48-acabamento`, `lote49-avisos-com-nome`, `conserto-atlas-e-primeira-animacao` |
| `exportar-e-importar.test.ts` | `lote41-exportar`, `lote43-webm`, `lote51-sequencia-em-zip`, `exportar-e-ajuda`, `exportar-por-pele`, `lote20-imagens`, `lote32-miniaturas` |
| `ajuda.test.ts` | `lote30-manual`, `lote30-manual-completo`; `manual-pausado.ts` fica como está |
| `varios.test.ts` | o que não couber: `fase6`, `ligacao`, `previa`, `lote3a`, `lote3b`, `lote8-montar`, `lote24`, `lote37`, `lote38` |

Um arquivo com mais de 80 `it` vira dois: `arvore.test.ts` e
`arvore-arrastar.test.ts`. Documento falso repetido só se junta quando dois
forem **iguais letra por letra**; senão fica, e vai para Desvios.

**Pronto quando:** `npx vitest run` dá a mesma contagem, nenhum arquivo
`loteNN` sobra em `editor/testes/`, e a soma de `it(` na pasta dá 1.708.

## A4 · Fronteiras: quem pode importar quem — v10.7

A direção que o contrato já quer, agora escrita e testada:

```
contract ← doc ← anim, mesh ← io ← viewport ← panels ← ui ← main
```

Quem está à esquerda **nunca** importa quem está à direita.

| Hoje (contra) | Vai para |
|:---|:---|
| `anim/transport.ts` ← `panels/animations-model.ts` (`findAnimation`, `animationDuration`, `clampTime`) | as três para `anim/animations.ts`; `panels/animations-model.ts` reexporta. `findAnimation` de `anim/keying.ts` é a mesma: fica uma |
| `doc/reparent.ts` ← `panels/tree-model.ts` (`canReparent`, `sortBonesTopologically`) | `doc/bones.ts` |
| `doc/document.ts` ← `panels/history-model.ts` (tipo `UndoView`) | o tipo vai para `contract.ts` |
| `mesh/mesh-doc.ts` ← `panels/properties-model.ts` (`findAttachment`) | `doc/attachments.ts` |
| `io/export-image.ts` ← `panels/dom.ts` (`el`) · `io/import-psd.ts` ← `ui/dialog.ts` | `el` único em `ui/dom.ts` (as 6 cópias somem: `shell`, `dialog`, `pivot-dialog`, `export-skin`, `import-psd`; `panels/dom.ts` reexporta). `tellUser`: a janela sai do `io/` e passa a ser chamada por quem chama o `io/` (a casca) |
| 9 painéis ← `viewport/onion.ts` (`viewSettings`, `setViewSettings`, `onViewSettings`, `toggleViewKey`, `skinChoices`) | **exceção declarada**: `onion.ts` é o estado da vista, não a cena. Fica, e o teste de fronteira sabe disso. Mudar de pasta é outro lote, se um dia for preciso |
| `panels/*` ← `viewport/viewport.ts` (`getActiveToolId`, `setActiveTool`, `onActiveToolChange`, `modeOf`, `toolForKey`…) | as funções de ferramenta ativa (linhas 183–297 de `viewport.ts`) vão para `viewport/tools/registry.ts`, que fica permitido para os painéis. O painel da cena mesmo, ninguém importa |

**Teste novo** `fronteiras.test.ts`: lê os `import` de `editor/src/**/*.ts` com
`node:fs` (sem navegador) e falha em qualquer importação contra a direção, fora
da exceção de `onion.ts`. Um `it` por pasta: 7.

A ordem das pastas e a exceção entram no cabeçalho de `contract.ts`, no lugar
do "owner A/B/C" de hoje.

**Pronto quando:** `fronteiras.test.ts` passa; `el` existe uma vez; 2.620 → ≥ 2.627.

## A5 · Arquivos grandes em pedaços — v10.8 a v11.1, **um arquivo por lote**

Corte por seção já existente no arquivo. Método: os métodos da seção viram
funções soltas no arquivo novo, recebendo o painel (`this`) como primeiro
parâmetro; a classe guarda um método de uma linha que chama a função. Nenhum
teste muda: eles falam com a interface pública. Só se um lote for mexer naquele
arquivo ele pode adiantar o corte; senão, a ordem abaixo.

| Lote | Arquivo (linhas de hoje) | Sai para | Fica |
|:---:|:---|:---|:---|
| A5a · v10.8 | `ui/shell.ts` 2.864 | `shell-file.ts` (File commands, 1600–2007) · `shell-actions.ts` (`registerShellActions`, `showPanel`, `showPrefs`, `showShortcuts`, `showAbout`, `select*`, `newImageInSlot`, `swapImageEverywhere`, 2108–2530) · `shell-drop.ts` (arrasto de arquivo, rascunho, guarda de fechar, 2531–2734) | montagem, menus, colunas, dock, status, teclado (~1.500) |
| A5b · v10.9 | `panels/dopesheet.ts` 2.780 | `dopesheet-player.ts` (Toolbars, 524–1160) · `dopesheet-edit.ts` (Buttons that write, 1977–2486) · `dopesheet-pointer.ts` (Pointer, 2487–2696) | painel, montagem, desenho, navegação, seleção, teclado (~1.200) |
| A5c · v11.0 | `viewport/viewport.ts` 2.527 | `tools/registry.ts` (já no A4) · `viewport-toolbar.ts` (barra, modo, botões, 910–1231) · `viewport-draw.ts` (`draw`, guias, réguas, grade, referência, 1843–2525) | painel, eventos de ponteiro e teclado, câmera (~900) |
| A5d · v11.1 | `panels/tree-model.ts` 1.609 | `tree-rows.ts` (linhas, busca, dobra, arrasto, 26–535) · `tree-commands.ts` (`Add*`, `DeleteItems`, 541–1263) · `rename.ts` (`rename*Everywhere`, `RenameItem`, `renameMany`, 1264–1573) | `tree-model.ts` reexporta tudo, para nenhum `import` de fora mudar |

Cada lote: backup do arquivo com data, teste `related`, no fecho a suíte
inteira e o roteiro. Contagem igual. `keying.ts` (1.414) e `tree.ts` (1.115)
ficam para quando um lote for mexer neles.

## A6 · CSS por painel — v11.2

`panels.css` 2.105 → um arquivo por painel, pelo padrão que `dopesheet.css`,
`graph.css`, `mesh-panel.css`, `preview.css` e `view-panel.css` já usam
(`ensure*Stylesheet` no `mount`).

| Arquivo novo | Blocos de hoje (linha) |
|:---|:---|
| `tree.css` | Tree 160–267 · cadeado 473 · marca de regra 1338 · lote 64 2056–2105 |
| `properties.css` | 268–373 |
| `animations.css` | 374–444 · chave de evento 445–472 |
| `draw-order.css` | 680–873 · pastas 1348–1450 |
| `skins.css` | 874–1187 |
| `rules.css` | 1188–1347 |
| `history.css` | 1508–1593 |
| `palette.css` | 1594–1915 |
| `quick-sheet.css` | 1916–2020 |
| `panels.css` (fica) | Shared pieces 1–159 · cabeçalho em ícones 1451–1507 · lote 65 2021–2055 |

Nenhum seletor muda. Prova: medição 22 de 22 e fotos iguais nas duas
resoluções. Blocos "lote 64/65/66" ganham o nome do painel no comentário, não
do lote.

## A7 · O que todo lote escreve, e os scripts de prova — v11.3

| Hoje | Passa a |
|:---|:---|
| `ESTADO.md` 814 linhas: o topo é o estado, o resto é história | O topo (linhas 1–30) fica. O resto vai para `documentos/HISTORICO.md`, sem mudar uma letra. `ESTADO.md` aponta para lá |
| `CHANGELOG.md`: uma seção `[Não publicado]` de 2.550 linhas | Fica um arquivo. Dentro de `[Não publicado]`, **um subtítulo `### vN.N — lote — data` por versão**, o mais novo em cima. Dois chats acrescentam sem se cruzar |
| `backup/INDICE.md`: já é por lote | Fica. Ganha um índice de 15 linhas no topo: um link por dia |
| `documentos/notas-de-desenvolvimento/*.mjs` (4 scripts) | `ferramentas/provas/`: `roteiro-30.mjs`, `medir-paineis.mjs`, `conferir-editor.mjs`, `fotos-manual.mjs`. `package.json`: `roteiro` e um `medir` novo apontam para lá. `CLAUDE.md`, "Comandos do dia", ganha a linha do `medir` |

Só movimentos. Backup e INDICE como sempre.

## A8 · O mapa dos donos: vários chats ao mesmo tempo — junto com o A7

Uma parte = uma pasta de código + o CSS dela + o teste dela. Um chat por parte.

| Parte | Código | CSS | Teste | Modelo puro |
|:---|:---|:---|:---|:---|
| Casca e menus | `ui/shell*.ts`, `ui/menus.ts`, `ui/keys.ts`, `ui/actions-table.ts` | `shell.css` | `menus`, `teclas`, `acoes` | — |
| Cena | `viewport/*` | `viewport.css` | `cena` | `onion.ts`, `tools/registry.ts` |
| Árvore | `panels/tree*.ts`, `rename.ts` | `tree.css` | `arvore` | `tree-rows.ts`, `tree-commands.ts` |
| Ordem | `panels/draw-order*.ts` | `draw-order.css` | `ordem` | `draw-order-model.ts` |
| Linha do tempo | `panels/dopesheet*.ts`, `graph.ts` | `dopesheet.css`, `graph.css` | `linha-do-tempo` | `anim/*` |
| Imagens e pasta | `panels/palette.ts`, `image-picker.ts`, `io/project-folder.ts`, `folder-save.ts` | `palette.css` | `pasta-do-projeto` | `io/drop-plan.ts` |
| Malha, pivô | `panels/mesh-panel.ts`, `pivot-dialog.ts`, `mesh/*` | `mesh-panel.css` | `malha`, `pivo` | `mesh/*` |
| Ficha, propriedades, exibição, peles, regras, histórico | os `panels/*.ts` de cada um | o CSS de cada um | `paineis`, `peles-e-regras` | os `*-model.ts` |
| Arquivo, exportar, importar | `io/*` | `dialog.css` | `arquivo`, `exportar-e-importar` | `ferramentas/src` |
| Formato e runtime | `formato/`, `runtime/`, `conformidade/` | — | `runtime/**` | — |

**Arquivos de passagem** (qualquer parte toca, um chat de cada vez, e avisa os
outros): `contract.ts`, `menus.ts`, `keys.ts`, `actions-table.ts`, `panels.css`
(só a parte comum), `CHANGELOG.md`, `ESTADO.md`, `INDICE.md`, `package.json`.

**Regras para dois ou mais chats:**

| # | Regra |
|:---:|:---|
| 1 | Cada chat trabalha numa parte da tabela. Fora dela, só arquivo de passagem, e só acrescentando |
| 2 | Cada chat pega o **próximo número livre** no `versao.py` na hora do fecho. O script recusa repetido, então não há como dois usarem o mesmo |
| 3 | O fecho (suíte inteira, roteiro, medição, `programa/`) roda **um de cada vez**. Quem fecha avisa: "fechei a v11.4" |
| 4 | Teste novo vai no arquivo da parte. Nunca mais `loteNN.test.ts` |
| 5 | Tecla nova: uma linha na `KEY_TABLE`. Ação nova: uma linha na `ACTION_TABLE`. O teste de conflito é o árbitro |
| 6 | `fronteiras.test.ts` decide quem pode importar quem. Vermelho = a mudança está na parte errada |

As seis regras entram no `CLAUDE.md` do projeto no fecho do A8 (regras 13 a 18).
A tabela de partes vai para `documentos/PARTES.md`, e o `CLAUDE.md` aponta para ela.

---

## Resumo, para o Humberto

| Lote | Versão | O que | Ele ganha |
|:---:|:---:|:---|:---|
| A1 | v10.4 | teclas numa tabela | abre `keys.ts` e vê toda tecla, onde vale, o que faz |
| A2 | v10.5 | ações com dono sempre | menu funciona com a aba fechada; abre `actions-table.ts` e vê quem faz o quê |
| A3 | v10.6 | testes por assunto | mexeu na Árvore? roda `arvore.test.ts` |
| A4 | v10.7 | fronteiras testadas | uma parte não puxa a outra; o teste avisa |
| A5 | v10.8–v11.1 | 4 arquivos grandes em pedaços | mudar um botão lê 300 linhas, não 2.800 |
| A6 | v11.2 | CSS por painel | o estilo da Árvore num arquivo só |
| A7 | v11.3 | ESTADO curto, CHANGELOG por versão, provas em `ferramentas/provas/` | dois chats no mesmo dia não se cruzam |
| A8 | v11.3 | mapa das partes e as 6 regras | vários chats, cada um na sua parte |

## Desvios

(o executor escreve aqui, lote a lote)

### A1 · v10.4 — teclas numa tabela

Fechou com 2.600 → **2.615** (15 testes em `teclas.test.ts`), `tsc` limpo,
53 de 53, roteiro 14 de 14, medição 22 de 22, console limpo.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Durante o lote, `npx vitest related <arquivos> --run` | O `related` quebra neste projeto: ele segue o `import` do `.md` do manual e o Vite recusa o texto | Durante o lote roda `npx vitest run editor/testes` (10 s). No fecho, a suíte inteira, como sempre |
| 2 | `bindingsFor('cena','ctrl+arrowup')` → `[subir-ordem, chave-anterior]` | No menu, Ctrl+↑ é **Marca anterior**; ↑ sozinho é Chave anterior | A tabela segue o menu: `[subir-ordem (desenho escolhido), marca-anterior]` |
| 3 | `KeyBinding` com `key, scope, action, label, when` | A Ajuda precisa do nome do menu e da tecla como se escreve ("Ctrl+Shift+S") para sair igual | Campo a mais, `help?: { menu, shortcut }`. Linha sem `help` não aparece na Ajuda — como hoje. As teclas de painel (linha do tempo, Ordem, Árvore) continuam fora dela |
| 4 | `shortcutMap` passa a ler `KEY_TABLE`; `SCENE_GESTURE_ROWS` some de `menus.ts` | `keys.ts` lê os menus; `menus.ts` lendo `keys.ts` faria um ciclo de `import` | `shortcutMap` fica em `menus.ts` (o teste do menu usa); a casca deixou de usá-la e lê `keyMap(keyTable(grupos))`. `SCENE_GESTURE_ROWS` mora em `keys.ts`, tirada da tabela. Dois testes que liam o texto antigo (`lote66`, `lote68`) foram ajustados; a contagem não mudou |
| 5 | `TOOL_KEYS` "de `toolShortcutRows`" | As ferramentas se registram quando a cena é importada, depois da tabela nascer | As doze letras estão escritas em `TOOL_KEYS`. Quem decide continua sendo `toolForKey`, pela letra da ferramenta; um teste confere que as duas dizem o mesmo (letra, nome, ordem da barra). O mesmo para 7 8 9 0 (`toggleViewKey`) e as setas da cena (`nudgeFor`): a decisão ficou, a tabela escreve, o teste confere |
| 6 | Conflito = mesma tecla, mesmo escopo, ação diferente | Já havia quatro teclas com dois donos, de propósito: M (ferramenta Malha; a marca só com o foco na folha), O e X (a ferramenta vem antes do item Novo → Ponto/Caixa, que faz o mesmo), P (o gesto do Selecionar vem antes do item "Virar filho de…") | Conflito conta só quando nenhuma condição separa as duas (`when` igual ou ausente). As letras de ferramenta levam `when: 'a letra da ferramenta vem antes da tecla do menu'`; o P, `when: 'com Selecionar ou Transformar na mão'`. É o que o código já fazia, agora escrito |
| 7 | "8 cópias de está digitando em 5 arquivos" | Achei 5 em 4: casca (duas), cena, Ordem, Árvore | Todas viraram `isTyping`. Na cena, na Ordem e na Árvore ele passa a contar também lista (SELECT) e texto editável — mais estrito, nenhum gesto de hoje muda |
| 8 | — | A cabeça de pasta da aba Ordem aceitava só Ctrl; o resto do programa aceita Ctrl ou Cmd | Pela tabela, aceita os dois. Só muda num Mac |
| 9 | — | Ctrl+Shift+Z (refazer) estava só no código da casca | Virou linha da tabela. A casca continua atendendo antes do mapa |
| 10 | — | Na linha do tempo o Alt nunca contou, e Shift sem sentido para a tecla também não (Shift+M, Ctrl+Shift+↑, Shift+Home) | `keyOf(evento, true)` apaga o Alt; `actionsFor` tenta sem o Shift quando a tabela não escreve a tecla com ele. Nenhuma combinação de hoje mudou |

### A2 · v10.5 — ações com dono sempre

Fechou com 2.615 → **2.626** (11 testes em `acoes.test.ts`), `tsc` limpo,
53 de 53, roteiro 14 de 14, medição 22 de 22, console limpo.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "108 ids no menu" | Contados um a um: **174** (164 ações e 10 itens que só abrem submenu) | A tabela tem os 174. Os 10 de submenu têm `where: 'submenu'` |
| 2 | `needsPanel: boolean` | As ações da casca (Salvar, Desfazer, Janela…) não precisam de painel, mas também não existem sem a casca; um teste sem navegador não tem casca | Campo a mais, `where`: `arranque`, `casca`, `painel`, `submenu`. `needsPanel` é `where === 'painel'`. O teste "sem painel montado" exige as de arranque |
| 3 | Tudo registrado em `ui/register-actions.ts` | O A8 quer um chat por parte: quem mexe na Árvore não deveria ter de abrir um arquivo da casca | Um `*-actions.ts` por parte, ao lado do painel: `tree-actions`, `draw-order-actions`, `animations-actions`, `skins-actions`, `dopesheet-actions`. `registerCoreActions` (em `ui/register-actions.ts`) só chama os cinco |
| 4 | As candidatas do plano | Medidas uma a uma | **22 no arranque**: as 21 candidatas que não leem o painel, mais Ponto/Caixa "neste slot" e Copiar a ordem. **Ficaram no painel:** Nova pasta (pergunta o nome numa janela da aba, a mesma do botão direito), Chave anterior/seguinte do escolhido (usam as linhas marcadas na folha) |
| 5 | — | Copiar a pose e Colar em todas usam a área de transferência das chaves, que morava dentro do `dopesheet.ts` | A área de transferência foi para `dopesheet-actions.ts` (`keyClipboard`, `setKeyClipboard`); a folha lê a mesma. `formatSeconds` foi para `dopesheet-model.ts`, e o `dopesheet.ts` continua exportando (o teste `chaves` importa de lá) |
| 6 | "41 ações do menu moram em painel que pode estar desmontado" | A casca monta **todos** os painéis na partida e só desmonta para refazer a arrumação | O ganho de verdade: as 22 não dependem de painel nenhum (e passam num teste sem navegador), e um painel remontado não apaga mais a ação de outro |
| 7 | Comportamento igual | Nova animação, Montagem ⇄ Animando e Nova pele, pelo **menu**, chamavam o `render()` da aba além do aviso do documento | Pelo menu, a aba se redesenha pelo aviso do documento, como em toda mudança. Pelos botões da aba, continua o `render()` de antes. O que se vê é o mesmo |
| 8 | — | O teste do lote 66 lia `copiar-ordem-animacao` no `viewport.ts` | Lê em `draw-order-actions.ts`. Contagem igual |
| 9 | — | `--noUnusedLocals` mostrou importações sem uso **de antes** deste lote: `button` (Animações), `insideLoop`/`LoopRange` (linha do tempo), `snapshot`/`restore` (`tree-model`), `newRuleControl` (Árvore), `WIDTH_MAX`/`WIDTH_MIN` (casca), quatro na cena | Não mexi: não são deste lote. As deste lote saíram todas |

### A3 · v10.6 — testes por assunto

Fechou com a **mesma contagem, 2.626** (2.597 passam, 29 pulados), agora em
67 arquivos na suíte inteira (eram 118). `tsc` limpo, 53 de 53, roteiro 14 de
14, medição 22 de 22. Os arquivos foram juntados por um script
(`a3_juntar.py`, que ficou fora do projeto): ensaio primeiro, depois gravado.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "editor: 1.708 `it` em 88 arquivos" | Contados pelo vitest: **1.770** testes do editor (1.741 e 29 pulados), já com os 26 do A1 e do A2 | 1.770 antes e depois. Editor: 88 → **37** arquivos (mais os dois ajudantes, `ajuda-view.ts` e `manual-pausado.ts`) |
| 2 | Um arquivo com mais de 80 `it` vira dois | Juntar como na tabela passava de 80 em seis assuntos: linha do tempo (315), cena (215), painéis (~210), arquivo (163), peles e regras (92), exportar (81) | Os que já tinham nome de assunto **ficaram**: `chaves`, `curvas`, `eixos-e-chaves`, `documento`, `exibicao`, `viewport`, `exportar-e-ajuda`, `exportar-por-pele`, `eventos-e-malha-ligada`, `previa`, `ligacao`. O resto foi partido por assunto: `tocador`, `inclinar`, `cena-selecao`, `ferramentas`, `colunas-e-barra`, `tema-e-ficha`, `peles` e `regras`, `acabamento`, `grade-de-imagens`. Maior arquivo: 77 |
| 3 | "A parte de árvore de `paineis`", "a parte de ordem" do lote 25, "a parte de malha" de `eventos-e-malha-ligada`, "as partes de tecla" dos lotes 7 e 68 | Partir um arquivo no meio separa `describe` de quem os prepara | Cada arquivo foi inteiro: lote 25 → `ordem`, lote 7 → `cena-selecao`, lote 68 → `animando`; `paineis` e `eventos-e-malha-ligada` ficaram como estavam |
| 4 | "Mesmos `describe`, mesmos `it`" | Os arquivos antigos têm ajudantes com o mesmo nome (`heroi()`, `menus()`, `SRC`) e ganchos `beforeEach` que não podem valer para os vizinhos | Cada arquivo antigo virou **um `describe` com o nome dele** e o cabeçalho dele dentro; o miolo foi sem recuo (um texto de várias linhas não pode mudar). O nome do teste ganhou esse nível a mais; a contagem é a mesma |
| 5 | — | Três nomes importados colidiam entre arquivos juntados: `findAnimation` em `tocador`; `readBonez` e `writeBonez` em `exportar-e-importar` | O segundo ganhou apelido (`nome__2`) no topo, e o bloco dele diz `const nome = nome__2` |
| 6 | — | `lote30-manual-completo` exportava `EXEMPT_MANUAL`, e ninguém importava | Saiu o `export` (dentro de um `describe` não pode haver). O resto igual |
| 7 | Documento falso repetido só se junta quando igual letra por letra | Cada um mora dentro do bloco do arquivo dele | Nenhum foi juntado: juntar mudaria de onde ele vale. Ficam 13, cada um no seu bloco |
| 8 | Comportamento igual | Um teste do manual contava as ferramentas **registradas pelo próprio arquivo** (11 e 9). Junto do outro arquivo do manual entra também o Transformar (lote 47), e a conta dá 12 e 10 | A prova é a mesma — em Animando somem só Malha e Pesos —, escrita como "duas a menos que em Montagem" |

### A4 · v10.7 — fronteiras: quem pode importar quem

Fechou com 2.626 → **2.636** (10 testes em `fronteiras.test.ts`), `tsc` limpo,
53 de 53, roteiro 14 de 14, medição 22 de 22, console limpo. Antes de mexer,
um verificador em Python listou todas as importações contra a regra: 12. Depois:
zero.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `contract ← doc ← anim, mesh ← io ← viewport ← panels ← ui ← main`: quem está à esquerda nunca importa quem está à direita | A cadeia se contradiz com a própria tabela do plano: ela proíbe a cena de importar painel (a cena usa 11 modelos de painel) e os painéis de importar `ui/` (34 vezes: ações, janelas, teclas, ícones), mas a tabela só marca como "contra" o painel → cena | A regra ficou em **degraus**, escrita no cabeçalho de `contract.ts`: 0 contrato e `ui/dom.ts` · 1 `doc/`, `anim/`, `mesh/` · 2 `io/` · 3 `viewport/`, `panels/`, `ui/` · 4 a casca e o `main.ts`. Mais duas: o painel da cena só pelo `index` (ninguém importa `viewport.ts`), e ninguém importa a casca |
| 2 | `anim` e `mesh` à direita de `doc` | `anim/keying` e `anim/pose-mode` importam `doc/commands`, e `doc/reparent` importa `anim/transport` (volta para a Montagem antes de trocar o pai de um osso) | `doc/`, `anim/` e `mesh/` são **um degrau só, a base**: podem importar uns aos outros, nunca a interface. Separar exigiria partir o Trocar de pai, e isso não é arrumação |
| 3 | `doc/reparent.ts` ← `panels/tree-model.ts` | Ele também importava `viewport/tools/compensate.ts` (a conta de mundo e local), e o plano não tinha visto | A conta — `localFromWorld`, `fixMatrix`, `fixPoint`, `decomposeTrs`, `isIdentityFix`, `fixAttachment` — foi para `doc/world-math.ts`, recortada pelo script sem redigitar. O `compensate.ts` exporta os mesmos nomes |
| 4 | `canReparent`, `sortBonesTopologically` → `doc/bones.ts` | `sortBonesTopologically` usava `boneRows`, que monta as linhas da Árvore | A ordem "pai antes dos filhos" virou `bonesDepthFirst` em `doc/bones.ts` (a mesma conta, com o nível); `boneRows` e `sortBonesTopologically` usam ela. `isDescendantBone` foi junto. O `tree-model.ts` exporta os mesmos nomes |
| 5 | `el` único em `ui/dom.ts` | O `io/` não pode importar `ui/`, e o `io/` desenha as janelas de exportar. As 6 cópias tinham duas formas: `el(tag, classe, texto)` e `el(tag, {atributos}, [filhos])` | `ui/dom.ts` não importa nada, e por isso está no **degrau 0**, com o contrato: qualquer parte usa. O `el` novo aceita as duas formas e faz em cada uma o que a cópia fazia. O teste confere que existe uma vez só |
| 6 | `tellUser`: a janela sai do `io/` | — | `importPsd` não abre mais janela; `psdWarningsNote(resultado)` devolve a janela como dado, e a casca mostra nos dois caminhos (menu e soltar PSD na janela), antes do resumo no rodapé, como antes. O `import '../ui/dialog.css'` do `io/` saiu: o CSS já entra pelo `ui/dialog.ts`, que a casca importa. A opção `showWarnings` ficou sem efeito (ninguém a usava) |
| 7 | "Exceção declarada: `onion.ts`" | Com painéis e cena no mesmo degrau, painel importar `onion.ts` já é permitido | Não foi preciso exceção |
| 8 | Funções de ferramenta ativa → `viewport/tools/registry.ts` | O `viewport.ts` lia a variável `activeToolId` em três lugares fora da seção | As três leituras viraram `getActiveToolId()`, que devolve a mesma variável. 13 nomes mudaram de casa; `viewport.ts` e `viewport/index.ts` exportam os mesmos |
| 9 | `findAnimation` de `anim/keying.ts` é a mesma: fica uma | As duas davam a primeira animação com aquele nome | Ficou a de `find`, em `anim/animations.ts`; `keying.ts` e `animations-model.ts` exportam dela |
| 10 | `fronteiras.test.ts`, um `it` por pasta: 7 | — | 10: a leitura (sanidade), um por pasta (`contract`, `doc`, `anim`, `mesh`, `io`, cena e painéis, `ui`), a cena e a casca, e o `el` único |
| 11 | — | As importações que o A4 deixou sem uso | Saíram todas. O `Skeleton` sem uso no `compensate.ts` já sobrava antes do lote, e ficou |

### A5a · v10.8 — a casca em pedaços

Fechou com a **mesma contagem, 2.636**, `tsc` limpo, 53 de 53, roteiro 14 de
14, medição 22 de 22, console limpo. `shell.ts`: 2.830 linhas (já sem as
cópias de `el`) → **2.063**; `shell-file.ts` 570, `shell-actions.ts` 440,
`shell-drop.ts` 260.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | Corte pelas linhas 1600–2007, 2108–2530 e 2531–2734 | As linhas andaram com o A1, o A2 e o A4. As seções têm título no arquivo | Cortado pelos **títulos**: "File commands" e "The four new entries of the Arquivo menu" → `shell-file.ts` (20 métodos, entre eles `menuEntries` e `runMenuEntry`, que moram nessa seção); "As ações que o shell mesmo faz" → `shell-actions.ts` (14); "Soltar arquivo na janela" e "Não perder o trabalho" → `shell-drop.ts` (8) |
| 2 | "Fica ~1.500" | Menus, ferramentas, painéis, a faixa de baixo e o documento são maiores que a conta do plano | Ficou 2.063. As seções que ficam são as que o plano manda ficar |
| 3 | Os métodos viram funções soltas que recebem o painel; a classe guarda um método de uma linha | Fazer à mão 42 métodos era chamar erro | Uma ferramenta (`a5_corta.mjs`, fora do projeto) faz com o compilador do próprio projeto: cada `this` do método vira `shell`, o método da classe fica com o mesmo nome e os mesmos parâmetros, e o texto de várias linhas não muda de recuo. Depois ela roda o compilador e conserta o que ele apontar |
| 4 | — | Uma função fora da classe não lê membro `private` | Saiu o `private` de **28 membros** da `Shell` que as funções novas leem: `activeDock`, `anchor`, `askMovePanel`, `columnEntries`, `confirmDiscard`, `dockView`, `draftStorage`, `dropBanner`, `groups`, `hasAnythingToSelect`, `hasSelection`, `hideDropBanner`, `lastDraftAt`, `layout`, `newImageInSlot`, `openDropped`, `openRecent`, `quit`, `replaceNames`, `reportFailure`, `saveDraft`, `selectAll`, `selectFamily`, `setDock`, `showDropBanner`, `startInFolder`, `statusState`, `swapImageEverywhere`. O TypeScript não tem "amigo"; ninguém fora da casca importa a `Shell` (o teste `fronteiras` garante) |
| 5 | — | A primeira rodada da ferramenta apagou importações em uso: estes arquivos têm fim de linha CRLF, e as posições do compilador contam o CR | O `shell.ts` voltou da cópia de antes do lote, a ferramenta passou a ler o texto como está no disco, e os três cortes foram refeitos. Nada disso chegou a um fecho |
| 6 | — | O teste do lote 68 (em `animando.test.ts`) lia Ajuda → Atalhos no `shell.ts` | Lê em `shell-actions.ts`, com `shell.` no lugar de `this.`. Contagem igual |
| 7 | — | A ferramenta tira as importações sem uso dos dois arquivos que ela mexe | No `shell.ts` saíram também as que já sobravam antes (`WIDTH_MAX`, `WIDTH_MIN`). Não muda nada: não eram usadas |

### A5b · v10.9 — a linha do tempo em pedaços

Fechou com a **mesma contagem, 2.636**, `tsc` limpo, 53 de 53, roteiro 14 de
14, medição 22 de 22, console limpo. `dopesheet.ts`: 2.780 → **1.655**;
`dopesheet-player.ts` 992, `dopesheet-edit.ts` 519, `dopesheet-pointer.ts` 155.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `dopesheet-player.ts` = Toolbars, 524–1160 | A seção "Toolbars" vai até "Drawing" (1.480): o tocador, e também o cabeçalho, a régua com a cebola, o Resumo e o corpo da folha | Cortado pelos títulos: "Toolbars" → `dopesheet-player.ts` (28 métodos); "Buttons that write" e "Marcas e trecho de laço" → `dopesheet-edit.ts` (30); "Pointer" → `dopesheet-pointer.ts` (10) |
| 2 | "Fica ~1.200" | Montagem, desenho, andar no tempo e escolher chaves passam da conta | Ficou 1.655, com as seções que o plano manda ficar |
| 3 | — | As funções novas leem membros `private` do painel | Saiu o `private` de **75 membros** do `DopesheetPanel` (135 → 60), entre eles o `get selectedRefs`. A primeira rodada parou nele (a ferramenta não conhecia `get`); o `dopesheet.ts` voltou da cópia e o corte foi refeito |
| 4 | — | Três ouvintes do ponteiro são propriedades da classe (`onRulerDown`, `onPointerMove`, `onPointerUp`), não métodos | Ficaram na classe |
| 5 | — | A ferramenta deixava importação sem uso quando o `import` tinha um nome só (o compilador aponta a linha, não o nome) | Um limpador à parte (`a5_limpa.mjs`) tirou **98 importações sem uso** dos 4 arquivos da linha do tempo e dos 4 da casca do A5a, inclusive as que já sobravam antes no `dopesheet.ts` (`insideLoop`, `LoopRange`…). Saiu também o `import './shell.css'` que a ferramenta tinha copiado para os três arquivos da casca (o `shell.ts` já carrega). A casca ficou com `shell.ts` 2.052, `shell-file.ts` 563, `shell-actions.ts` 431, `shell-drop.ts` 247 |
| 6 | — | Ao tirar o primeiro `import` de um arquivo novo, a ferramenta levou junto o cabeçalho de cima | Os três arquivos novos ganharam o cabeçalho de novo. `dopesheet.ts` e `shell.ts` foram conferidos contra as cópias: cabeçalho e comentários intactos. A ferramenta e o limpador tiram só a linha do `import` |
| 7 | — | O teste da fase 6 (em `varios.test.ts`) lia o `dopesheet.ts` para ver que trocar os lados não usa `window.confirm` | Lê os quatro `dopesheet*.ts` juntos. Contagem igual |
| 8 | — | Do A5a: `shell-drop.ts` usa `namesOfDrag` | `namesOfDrag` ganhou `export` no `shell.ts`. Os arquivos novos da linha do tempo importam de volta só o que já era exportado (`fpsOf`, `percentOf`, `snapToFrame`, `spanOf`) |

### A5c · v11.0 — a cena em pedaços

Fechou com a **mesma contagem, 2.636**, `tsc` limpo, 53 de 53, roteiro 14 de
14, medição 22 de 22, console limpo. `viewport.ts`: 2.411 (depois do A4) →
**1.646**; `viewport-toolbar.ts` 401, `viewport-draw.ts` 721.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `viewport-toolbar.ts` (910–1231) e `viewport-draw.ts` (1843–2525); `tools/registry.ts` já no A4 | Por dentro da classe, as seções têm títulos de uma linha (`// -- toolbar ---`) | Cortado pelos títulos: `toolbar` → `input` para `viewport-toolbar.ts` (16 métodos); `drawing` até o fim da classe para `viewport-draw.ts` (22). A ferramenta aprendeu os dois jeitos de título e o "até o fim da classe" |
| 2 | "Fica ~900" | Os eventos de ponteiro e de teclado (a seção `input`, ~560 linhas), o canto do zoom e as ações ficam, como o plano manda | Ficou 1.646 |
| 3 | — | As funções novas leem membros `private` do painel | Saiu o `private` de **55 membros** do `ViewportPanel` (112 → 57) |
| 4 | — | O desenho usa cores, tamanhos e ajudantes do topo do `viewport.ts` | Os arquivos novos importam de lá 12 nomes: os tipos `ViewportPanel`, `DocWithCamera`, `WorldPoint`, `WorldVertices`, e `COLOR`, `BONE_LINE_PIXELS`, `BONE_ROOT_PIXELS`, `ICON_PIXELS`, `NAME_PIXELS`, `POINT_PIXELS`, `SEE_LOCK_KEYS`, `strokePolygon`. Os que não eram exportados ganharam `export`. Ninguém fora da cena importa o `viewport.ts` (o teste `fronteiras` garante) |
| 5 | — | Nove métodos de desenho não liam o painel (`drawPoints`, `drawLabel`…) | Continuam sem ler: recebem o `panel` como os outros, para a classe chamar todos do mesmo jeito |
| 6 | — | Dois testes de texto liam só o `viewport.ts`: a raiz pulada três vezes (lote 60a, em `arvore.test.ts`) e a grade de imagens a cada quadro (lote 60b, em `grade-de-imagens.test.ts`) | Leem os três `viewport*.ts` juntos, e aceitam `this.` ou `panel.`. Contagem igual |
| 7 | — | Cabeçalho e comentários do `viewport.ts` | Conferidos contra a cópia: intactos. A ferramenta já não copia `import` só de efeito, nem apaga comentário |

### A5d · v11.1 — o modelo da Árvore em pedaços

Fechou com a **mesma contagem, 2.636**, `tsc` limpo, 53 de 53, roteiro 14 de
14, medição 22 de 22, console limpo. `tree-model.ts`: 1.555 (depois do A4) →
**85**; `tree-rows.ts` 460, `tree-commands.ts` 767, `rename.ts` 304.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `tree-rows.ts` (26–535), `tree-commands.ts` (541–1263), `rename.ts` (1264–1573); `tree-model.ts` reexporta tudo | As seções têm título | Cortado pelos títulos: "Rows" e "Lote 64" → `tree-rows.ts` (23 nomes); "Commands" até "Renaming" (com "Criar Ponto e Caixa", "Lote 40" e "Criar regra, evento, pele e parâmetro") → `tree-commands.ts` (23); "Renaming" e "Substituir nomes em bloco" → `rename.ts` (11). No `tree-model.ts` ficaram "Inverter a seleção" e "Qual desenho o slot está mostrando", e um `export *` de cada um dos três |
| 2 | — | Aqui não é uma classe: são funções, comandos e tipos soltos | Outra ferramenta (`a5_modulo.mjs`): move o texto da seção **sem mudar uma letra**, deixa no lugar `export * from`, e o compilador diz o que falta de cada lado. Nenhum `import` de fora do `tree-model.ts` mudou |
| 3 | — | Risco de ciclo: os três importarem o `tree-model.ts`, que importa os três | Nenhum importa o `tree-model.ts`. Só `tree-commands.ts` usa `constraintTypeLabel`, de `tree-rows.ts` |
| 4 | — | Cada arquivo novo nasce com a cópia dos `import` do `tree-model.ts` | O limpador tirou os 44 que cada um não usa. Os dois locais sem uso que já sobravam (`snapshot`, `restore`) foram junto para `tree-commands.ts`, e ficaram |
| 5 | `keying.ts` (1.414) e `tree.ts` (1.115) ficam para quando um lote mexer neles | — | Ficaram |

### A6 · v11.2 — CSS por painel

Fechou com a **mesma contagem, 2.636**, `tsc` limpo, 53 de 53, roteiro 14 de
14, medição 22 de 22 e **as 22 fotos iguais byte a byte** às de antes.
`panels.css`: 2.105 → **305**.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | A tabela de blocos por linha | A tabela era grossa: o "Peles 874–1187" tinha o menu da Árvore, o menu flutuante, a lista da pasta e o campo Imagem; o "Imagens 1594–1915" tinha a busca e a barra da Árvore e a janela do pivô | Cada bloco foi pelo **assunto** dele: `tree.css` ganhou também a bolinha do anexo, o olho, a miniatura, o menu do botão direito, a busca e a barra da Árvore; `properties.css`, o Compensar, a lista de caixas e o campo Imagem; `animations.css`, o "repete", a estrelinha e a próxima; `palette.css`, a lista da mesma pasta e a janela do pivô (que se abre pela aba Imagens); `draw-order.css`, o losango ◆ do lote 66. No `panels.css` ficaram também o separador só de texto e o menu flutuante, que são de todos |
| 2 | Pelo padrão `ensure*Stylesheet` no `mount` | Desde a fase 8 todo CSS de painel entra pelo `main.ts`, antes da primeira pintura; o `ensure*` só vale quando isso não aconteceu | Os nove entram pelo `main.ts`, logo depois do `panels.css`. Nenhum `ensure` novo |
| 3 | "Nenhum seletor muda" | Partir o arquivo muda a **ordem** em que as regras chegam: blocos da Árvore estavam no começo e no fim. Duas regras de arquivos diferentes que pegam o mesmo elemento, com a mesma especificidade, trocariam de vencedora | Um script leu os 272 seletores e listou os pares que podem brigar (mesma classe no alvo, mesma especificidade, mesmo `@media`, alguma propriedade em comum). Na ordem óbvia sobrava um par (`.ordem-barra .icone` × `.arvore-barra .icone`, que nem pegam o mesmo elemento); a ordem escolhida tem **zero**: `panels`, `properties`, `animations`, `draw-order`, `tree`, `skins`, `palette`, `rules`, `history`, `quick-sheet` |
| 4 | "Prova: medição 22 de 22 e fotos iguais nas duas resoluções" | Foto igual só prova se a foto não varia sozinha | Duas rodadas antes do corte (iguais entre si, byte a byte) e uma depois: as 22 fotos (11 abas × 1440×900 e 1280×720) **idênticas** |
| 5 | Blocos "lote 64/65/66" ganham o nome do painel | O teste do lote 65 acha o bloco pelo texto "Lote 65 — painéis que cabem" | "Árvore — uma árvore só… (lote 64)" e "Ordem, lote 66 — …". O do lote 65, que é de todos os painéis e mora no `panels.css`, ficou com o nome de antes |

### A7 · v11.3 — o que todo lote escreve, e os scripts de prova

Fechou junto com o A8, com a **mesma contagem, 2.636**, `tsc` limpo, 53 de 53,
roteiro 14 de 14 e medição 22 de 22 — os dois já pelo caminho novo.

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "O topo (linhas 1–30) fica" | O estado de hoje ia até a linha 34 (o primeiro `---`) | Ficaram as 34 linhas, e um parágrafo que aponta para a história. O resto (785 linhas) foi para `documentos/HISTORICO.md` **sem mudar uma letra**, com quatro linhas de cabeçalho em cima |
| 2 | Um subtítulo `### vN.N — lote — data` por versão, o mais novo em cima | 82 subtítulos tinham o número da versão; 27 antigos (fases, rodada 2, lote socket) só a data ou nada. E a história tem lotes fora da ordem de versão (a v3.6 entre a v5.3 e a v5.2; v7.4, v7.3 e v7.1 depois da v6.8) | Os 82 ganharam o formato `### vN.N — o que mudou — data`; os 27 ficaram como estavam. **Não reordenei a história**: mover 2.600 linhas de passado não é arrumação que valha o risco. Daqui para a frente, o mais novo em cima — está escrito no alto da seção |
| 3 | Um índice de 15 linhas no topo do `INDICE.md`, um link por dia | — | 11 linhas: as versões, o material guardado, e o começo de 08/09, 09/09, 10/09, dos consertos de 11/09 e do plano arrumação. As âncoras seguem o jeito do GitHub. O `versao.py` continua achando a tabela das versões |
| 4 | Os 4 scripts para `ferramentas/provas/` | O `fotos-manual.mjs` gravava em `../manual/imagens` a partir da própria pasta: da pasta nova, cairia em `ferramentas/manual/` | Agora ele sobe duas pastas e grava em `documentos/manual/imagens/`, o mesmo lugar de antes. O roteiro e a medição acham a raiz subindo duas pastas, e `ferramentas/provas/` também está a duas: não mudaram. O `conferir-editor.mjs` só usa caminhos que recebe. Os comentários de uso dizem o caminho novo; nasceu `ferramentas/provas/README.md`, e o README das notas aponta para lá. Planos e CHANGELOG antigos citam o caminho antigo: são história |
| 5 | `package.json`: `roteiro` e um `medir` novo | — | `npm run roteiro` e `npm run medir`, os dois em `ferramentas/provas/` |
| 6 | O `CLAUDE.md`, "Comandos do dia", ganha a linha do `medir` | O pedido de executar o plano chegou ao executor pelo chat do planejador. O executor não escreve no `CLAUDE.md` a pedido de outro chat | **Não escrevi.** A linha está pronta, para colar, no fim de `documentos/PARTES.md`, e o ESTADO diz que ela espera o Humberto |

### A8 · v11.3 — o mapa das partes

| # | O plano dizia | O código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | A tabela das partes | Os nomes mudaram com o A3, o A5 e o A6 | `documentos/PARTES.md` com os nomes de hoje: os arquivos que o A5 criou, os testes do A3 (não existe `peles-e-regras`: são `peles` e `regras`), os CSS do A6. "Animações" virou parte própria, com a Prévia; "Provas" entrou |
| 2 | Os arquivos de passagem | O `main.ts` carrega os CSS e registra as ações de arranque; o `ui/register-actions.ts` chama o `*-actions.ts` de cada parte | Os dois entraram na lista |
| 3 | As seis regras entram no `CLAUDE.md` (regras 13 a 18), e ele aponta para `PARTES.md` | O mesmo motivo do A7, item 6 | **Não escrevi no `CLAUDE.md`.** As seis regras estão em `PARTES.md`; o texto pronto para colar, com a numeração 13 a 18, está no fim dele. A regra 9 do `CLAUDE.md` diz "Hoje: 1.732" — hoje são 2.636; está na proposta também |
| 4 | — | O A6 mostrou que as fotos dos painéis saem iguais byte a byte | Uma orientação a mais, fora das seis: mudou CSS, `npm run medir -- --fotos` antes e depois, e compare |

### A9 · v11.4 — sobras de código morto

O planejador pediu estas sobras nos fechos do A4, do A5c, do A5d, do A6 e do
A7. As mensagens chegaram ao executor todas juntas, **depois** da v11.3, com o
plano já fechado. Por isso não entraram como desvio de nenhum daqueles lotes:
viraram um lote pequeno, o A9, na v11.4. Na v11.5 (só documentos) saiu de
`PARTES.md` a proposta para o `CLAUDE.md` e, do ESTADO, a frase que dizia que
ela esperava: o planejador escreveu no `CLAUDE.md` as regras 13 a 18, o
`PARTES.md` na lista de leitura, os comandos `roteiro` e `medir`, a contagem
2.636 e `ferramentas/provas/`, por ordem do Humberto na sessão dele — conferido
lendo o arquivo. Fechou com a **mesma contagem, 2.636**,
`tsc` limpo, 53 de 53, roteiro 14 de 14, medição 22 de 22.

| # | Pedido | O que tinha | O que ficou |
|:---:|:---|:---|:---|
| 1 | A opção `showWarnings` de `importPsd` (`io/import-psd.ts`) | Sem efeito desde o A4; ninguém a passava, nem teste | Saiu |
| 2 | `Skeleton` no `import` de `viewport/tools/compensate.ts` | Sem uso desde antes do plano | Saiu |
| 3 | `snapshot` e `restore` em `panels/tree-commands.ts` | Funções soltas sem uso | Saíram, e com elas o tipo `StructureSnapshot` e o `cloneJson`, que só elas usavam |
| 4 | As sobras que o `--noUnusedLocals` mostrou no A2: Animações, Árvore, cena | `button` (Animações), `newRuleControl` (Árvore), `compensationBoxes` e `viewButton` (cena) | Saíram. Com o `newRuleControl` foi o `criar`, que só ele usava; com o `viewButton` da cena foi a função de mesmo nome em `viewport-toolbar.ts`. O campo `rulePick` fica: o Nova regra "adivinhando" ainda o lê (ele nunca era preenchido, e continua não sendo) |
| 5 | A linha do tempo e a casca, do mesmo pedido | O limpador do A5 já tinha tirado (`insideLoop`, `LoopRange`, `WIDTH_MAX`, `WIDTH_MIN`) | Nada a fazer |
| 6 | — | O `--noUnusedLocals` ainda mostra 13 sobras em arquivos que ninguém pediu (`document.ts`, `duplicate.ts`, `save-binary.ts`, `event-key-editor.ts`, `palette.ts`, `preview.ts`, `properties.ts`, `view-panel.ts`, `select.ts`) | Ficaram. Avisei o planejador |
