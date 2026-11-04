# As partes do programa — vários chats ao mesmo tempo

Lote A8, plano arrumação (v11.3, 11/09/2026). O Humberto: *"se tudo estiver bem
organizado, vários chats poderiam trabalhar ao mesmo tempo, em partes
independentes"*.

**Uma parte = o código dela + o CSS dela + o teste dela. Um chat por parte.**

## O mapa

| Parte | Código | CSS | Teste | Modelo puro |
|:---|:---|:---|:---|:---|
| Casca e menus | `ui/shell.ts`, `ui/shell-file.ts`, `ui/shell-actions.ts`, `ui/shell-drop.ts`, `ui/menus.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/register-actions.ts`, `ui/palette.ts` | `ui/shell.css` | `menus`, `teclas`, `acoes`, `fronteiras`, `colunas-e-barra`, `tema-e-ficha` | `ui/keys.ts`, `ui/actions-table.ts` |
| Cena | `viewport/viewport.ts`, `viewport/viewport-toolbar.ts`, `viewport/viewport-draw.ts`, `viewport/tools/*` | `viewport/viewport.css` | `viewport`, `cena`, `cena-selecao`, `ferramentas`, `inclinar` | `viewport/onion.ts`, `viewport/tools/registry.ts` |
| Árvore | `panels/tree.ts`, `panels/tree-actions.ts`, `panels/tree-model.ts`, `panels/tree-rows.ts`, `panels/tree-commands.ts`, `panels/rename.ts` | `panels/tree.css` | `arvore` | `tree-rows.ts`, `tree-commands.ts`, `rename.ts` |
| Ordem | `panels/draw-order.ts`, `panels/draw-order-actions.ts` | `panels/draw-order.css` | `ordem` | `panels/draw-order-model.ts` |
| Linha do tempo | `panels/dopesheet.ts`, `panels/dopesheet-player.ts`, `panels/dopesheet-edit.ts`, `panels/dopesheet-pointer.ts`, `panels/dopesheet-actions.ts`, `panels/graph.ts`, `panels/event-key-editor.ts` | `panels/dopesheet.css`, `panels/graph.css` | `linha-do-tempo`, `tocador`, `chaves`, `curvas`, `eixos-e-chaves` | `anim/*`, `panels/dopesheet-model.ts` |
| Animações | `panels/animations.ts`, `panels/animations-actions.ts`, `panels/preview.ts` | `panels/animations.css`, `panels/preview.css` | `animando`, `previa` | `panels/animations-model.ts`, `anim/animations.ts` |
| Imagens e pasta | `panels/palette.ts`, `panels/image-picker.ts`, `io/project-folder.ts`, `io/folder-save.ts` | `panels/palette.css` | `pasta-do-projeto`, `grade-de-imagens` | `io/drop-plan.ts`, `panels/palette-model.ts` |
| Malha e pivô | `panels/mesh-panel.ts`, `panels/pivot-dialog.ts`, `mesh/*` | `panels/mesh-panel.css` (a janela do pivô: `palette.css`) | `malha`, `pivo`, `eventos-e-malha-ligada` | `mesh/*` |
| Ficha, propriedades, exibição, peles, regras, histórico | `panels/properties.ts`, `panels/view-panel.ts`, `panels/skins.ts`, `panels/skins-actions.ts`, `panels/rules.ts`, `panels/history.ts` | `properties.css`, `quick-sheet.css`, `view-panel.css`, `skins.css`, `rules.css`, `history.css` | `paineis`, `exibicao`, `peles`, `regras`, `acabamento` | `properties-model.ts`, `quick-model.ts`, `skins-model.ts`, `rules-model.ts`, `history-model.ts` |
| Arquivo, exportar, importar | `io/*` | `ui/dialog.css` | `arquivo`, `documento`, `exportar-e-importar`, `exportar-e-ajuda`, `exportar-por-pele`, `ajuda` | `ferramentas/src` |
| Formato e runtime | `formato/`, `runtime/`, `runtime-python/`, `conformidade/` | — | `runtime/**`, `ferramentas/testes` | — |
| Provas | `ferramentas/provas/` | — | `npm run roteiro`, `npm run medir` | — |

Os caminhos de código são a partir de `editor/src/`; os testes, em
`editor/testes/<nome>.test.ts`. O que sobra (`varios`, `ligacao`) é de quem
precisar.

## Arquivos de passagem

Qualquer parte toca, **um chat de cada vez**, e avisa os outros:

`contract.ts` · `main.ts` · `ui/menus.ts` · `ui/keys.ts` · `ui/actions-table.ts` ·
`ui/register-actions.ts` · `panels/panels.css` (só a parte comum) ·
`CHANGELOG.md` · `ESTADO.md` · `backup/INDICE.md` · `package.json`

## As seis regras para dois ou mais chats

| # | Regra |
|:---:|:---|
| 1 | Cada chat trabalha numa parte da tabela. Fora dela, só arquivo de passagem, e só acrescentando |
| 2 | Cada chat pega o **próximo número livre** no `versao.py` na hora do fecho. O script recusa repetido: não há como dois usarem o mesmo |
| 3 | O fecho (suíte inteira, roteiro, medição, `programa/`) roda **um de cada vez**. Quem fecha avisa: "fechei a v11.4" |
| 4 | Teste novo vai no arquivo da parte. Nunca mais `loteNN.test.ts` |
| 5 | Tecla nova: uma linha na `KEY_TABLE` (`ui/keys.ts`). Ação nova de menu: o id no grupo do dono (`ui/actions-table.ts`). O teste de conflito é o árbitro |
| 6 | `fronteiras.test.ts` decide quem pode importar quem (os degraus estão no cabeçalho de `contract.ts`). Vermelho = a mudança está na parte errada |

Mudou CSS? `npm run medir -- --fotos <pasta>` antes e depois, e compare: as
fotos saem iguais byte a byte de uma rodada para a outra, então qualquer
diferença é da mudança.

As seis regras estão também no `CLAUDE.md` do projeto, como regras 13 a 18.
