# Plano da rodada 1 — lotes 1, 2 e 3 da interface

Escrito em 08/09/2026 pelo planejador. Para o executor.
Fonte: `documentos/pesquisa/menu/07` (ordem) e `08` (especificações).
Ponto de partida: **v1.5**, 1.370 testes, 46/46 na conformidade.

## Resumo em uma tabela

| Versão | Lote | Itens | O que o Humberto vai ver |
|:---:|:---:|:---:|:---:|
| v1.6 | **menus** | 16, 18 | os 7 menus: Arquivo · Editar · Exibir · Esqueleto · Animação · Janela · Ajuda. Ajuda → Atalhos. Botão direito volta à ferramenta anterior |
| v1.7 | 1 | 14 | zoom no canto da cena. A barra de cima perde 3 botões |
| v1.8 | 2 | 6, 7 | tocador colado na linha do tempo. Espaço toca. Repetir grava no arquivo |
| v1.9 | 3a | 9, 10 | trocar o desenho por lista. Chavear verde ou vermelho |
| v2.0 | 3b | 8 | linha Resumo na linha do tempo |

O lote **menus** veio na frente por ordem do Humberto (08/09/2026), depois da leitura dos manuais.
O projeto do menu, item por item, está em `documentos/planos/PROJETO DO MENU 2026-09-08.md`. **Ele manda.** Este plano só diz como construir.

Uma versão por lote. **Nunca duas versões com o mesmo número.**
O `ferramentas/versao.py` recusa sobrescrever. Se recusar, o número já está em uso: use o seguinte.

---

## Regras que valem para os cinco lotes

| # | Regra | Como cumprir |
|:---:|:---|:---|
| 1 | Backup antes de escrever | Copiar `editor/src` inteiro para `backup/editor-src_2026-09-08_antes-do-lote-N/`. Linha no `backup/INDICE.md`, tabela "Material guardado" |
| 2 | Decisão em módulo puro, DOM só desenha | Não há jsdom. Todo cálculo vai num arquivo `*-model.ts` ou em `anim/`, testado sem navegador. Ver `editor/testes/paineis.test.ts`, cabeçalho |
| 3 | Toda edição é um `Command` | `apply` e `revert` exatos. Teste compara o JSON antes e depois por texto |
| 4 | Chave só por `anim/pose-mode.ts` | `setPropertyOrKey`, `keyValuesNow`, `keyTargetsNow`. Nunca mexer no JSON da animação direto |
| 5 | Comando que só mexe em animação | Declarar `animationOnly`. Sem isso o arquivo inteiro recarrega |
| 6 | Tecla tratada uma vez | Quem trata chama `stopPropagation`. Cena e janela ouvem a mesma tecla |
| 7 | Botão com nome na dica | `title` e `aria-label` = nome + tecla entre parênteses. No tocador, só o símbolo aparece: decisão do Humberto, 08/09/2026 |
| 8 | Liga-desliga aceso quando ligado | `aria-pressed="true"` e cor |
| 9 | Barra de baixo diz o que fez | `doc.notice('...')`, sem ponto final |
| 10 | Manual no mesmo lote, duas línguas | `documentos/manual/0N-*.md` e `documentos/manual/en/0N-*.md` |
| 11 | `CHANGELOG.md` no mesmo lote | Seção "Acrescentado — lote N" em "Não publicado", como o lote 0 |
| 12 | Nada de renomear Recorte | A troca para BONE BANANA é outra fase |
| 13 | Nada de campo novo no núcleo do formato | Se precisar, parar e perguntar ao Humberto |

**Conferência que fecha cada lote, nesta ordem:**

```
npx vitest run
npx tsc --noEmit -p editor/tsconfig.json
node ferramentas/conformidade.mjs
node documentos/notas-de-desenvolvimento/conferir-editor.mjs %TEMP%/perfil editor/tela-final.png
python ferramentas/versao.py 1.N "uma linha dizendo o que mudou"
```

O `conferir-editor.mjs` precisa de `npm run editor` rodando em outra janela.
O navegador da automação não compõe quadros: **usar o Chrome headless do script.**
Contagem de testes nunca cai. Sobe a cada lote.

---

## Lote menus → v1.6 · Itens 16 e 18 · Os sete menus

### O que muda na tela

A barra de menus passa de 3 para 7: **Arquivo · Editar · Exibir · Esqueleto · Animação · Janela · Ajuda**.
As entradas, os atalhos e a ordem estão no `PROJETO DO MENU`, seção 3. Copiar de lá. Não inventar.
Nenhum botão sai da tela neste lote. O menu **chama a mesma função** do botão.

Entrada cuja função ainda não existe: aparece **cinza**, com a dica "Vem no lote N". Assim o Humberto vê o mapa inteiro já agora.

### Como construir

| Peça | Como |
|:---|:---|
| `ui/menus.ts` | continua **dado puro**. Uma função por menu: `fileMenu`, `editMenu`, `viewMenu`, `skeletonMenu`, `animationMenu`, `windowMenu`, `helpMenu`. Cada uma recebe um `state` e devolve entradas |
| Entrada | `{ label, shortcut?, action, enabled, checked?, hint?, children? }`. `checked` para liga-desliga (Exibir, Janela). `children` para submenu (Novo, Importar). Separador = `{ separator: true }` |
| `ui/actions.ts` **novo** | registro de ações: `registerAction(id, { run, enabled?, checked? })`, `runAction(id)`, `hasAction(id)`, `actionState(id)`. Cada painel registra as suas ao montar. A cena registra zoom e ferramentas. A linha do tempo registra tocador e chaves. A Árvore registra Novo |
| Menu → ação | o `shell` só faz `runAction(entry.action)`. Se `hasAction` é falso, a entrada fica cinza com a dica |
| Atalhos | `shortcutMap(allMenus)` devolve um `Map` de tecla para ação. `shell.onKeyDown` consulta o mapa **depois** das teclas que os painéis já tratam (setas na linha do tempo, letras das ferramentas na cena). Tecla tratada uma vez: regra 6 |
| Ajuda → Atalhos | janela com a tabela gerada de `allMenus`: menu, item, tecla. É a mesma fonte, nunca uma lista à parte |
| Ajuda → Sobre | nome, versão do `package.json`, licença, um link para o manual |
| Botão direito na cena | `viewport.ts`: no `pointerdown` com `button === 2`, `setActiveTool(anterior)`. Guardar `previousToolId` em `setActiveTool`. Barra de baixo: "Ferramenta: Girar" |
| Marcado | `checked` lê o mesmo dado do painel: `viewSettings()` para Exibir, painel aberto para Janela, `animation.loop` para Repetir |

Ações que já existem e só precisam ser registradas: Novo Osso/Slot/Regra/Evento/Pele/Parâmetro (`tree-model`), Apagar, Nova/Duplicar/Renomear/Apagar animação (`animations-model`), Voltar à montagem, Chavear, Apagar chave, Copiar/Colar chaves, Esticar/Espelhar/Fechar ciclo/Espelhar esquerda e direita (`dopesheet`), Aproximar/Afastar/Ajustar (`viewport`), ver e travar (`onion.ts`), Compensar, Eixos, Reempacotar, Manual.

Ações que **ficam cinza** neste lote, com a dica: Abrir recente, Sair, Colar em todas as chaves, Selecionar tudo, Buscar, Copiar/Colar âncora, Tamanho real, Enquadrar seleção, Mostrar nome das ferramentas, Novo Imagem/Ponto/Caixa/Máscara/Esqueleto filho, Subir/Descer na ordem, Travar o escolhido, Destravar tudo, Mudar duração, Tocar para trás, Chave do escolhido, Interpolação, Esconder painéis, Voltar ao padrão.

**Renomear (F2)** e **Desmarcar (Esc)** já existem por gesto. Registrar como ação e ligar.

### Arquivos

| Arquivo | O que fazer |
|:---|:---|
| `ui/menus.ts` | os 7 menus como dado. Tipos de entrada acima |
| `ui/actions.ts` **novo** | o registro |
| `ui/shell.ts` | `groups()` vira um laço sobre os 7 menus. Submenu no `fillMenu`. `checked` desenha a marca. Atalhos pelo mapa. Janela Atalhos e Sobre |
| `ui/shell.css` | submenu, item marcado, item cinza com dica |
| `viewport/viewport.ts` | registra ações de zoom e ferramentas. Botão direito. `previousToolId` |
| `panels/tree.ts`, `panels/animations.ts`, `panels/dopesheet.ts`, `panels/view-panel.ts` | registram as suas ações ao montar. Nenhuma lógica nova: só `registerAction('acao', { run: () => this.oQueJaExiste() })` |
| `ui/dialog.ts` | uma janela de tabela para os Atalhos, se a de mensagem não servir |

### Testes — `editor/testes/lote-menus.test.ts`

| Caso | Espera |
|:---|:---|
| os 7 menus existem, nesta ordem | Arquivo, Editar, Exibir, Esqueleto, Animação, Janela, Ajuda |
| toda entrada tem `label` e `action` | nenhuma vazia |
| `action` é único em todos os menus | sem repetição |
| `shortcut` é único em todos os menus | sem repetição. A mensagem lista os dois em conflito |
| toda entrada de Exibir com `checked` reflete `viewSettings()` | ligar Ossos dá `checked: true` |
| `shortcutMap` | `F1` dá `manual`, Espaço dá `tocar`, `k` dá `chavear` |
| tabela de Atalhos gerada | uma linha por entrada com atalho. Mesma contagem que os menus |
| registro: `registerAction` + `runAction` | roda uma vez. `hasAction` de id inexistente é falso |
| botão direito: `previousToolFor(atual, anterior)` puro | Girar, Mover, direito: Girar. Direito de novo: Mover |
| entradas do `PROJETO DO MENU` | o teste lê a seção 3 do arquivo `.md` e confere que **cada item com atalho** está no `menus.ts` com o mesmo atalho. Se o projeto mudar, o teste avisa |

### Manual

Capítulo 1, "Abrir o editor": o desenho da tela ganha a barra com 7 menus.
Capítulo 8 (perguntas): "Onde está X?" vira "No menu Y, com o atalho ao lado".
Um apêndice do capítulo 8: **a tabela de atalhos**. É a mesma da janela Ajuda → Atalhos.
Inglês igual.

### Pronto quando

- Os 7 menus abrem. Cada entrada viva chama a mesma função do botão. Cada entrada cinza tem a dica do lote.
- Ajuda → Atalhos mostra a tabela. Shift+F1 abre.
- Botão direito na cena troca Girar e Mover.
- Testes acima passando. `npx tsc` limpo.

---

## Lote 1 → v1.7 · Item 14 · Zoom no canto

### O que muda na tela

| Antes | Depois |
|:---:|:---:|
| Barra de cima: Aproximar · Afastar · Ajustar à tela | Esses três saem da barra |
| Nada no canto da cena | Canto inferior direito: `−` · `100%` · `+` · `Ajustar` |

O `100%` é um campo. Digitar `200` e Enter põe zoom 2. Aceita `200` e `200%`.
Fundo semitransparente, por cima do canvas. Nunca cobre o desenho: fica no canto.

### Teclas

| Tecla | Faz | Onde é tratada |
|:---:|:---:|:---:|
| Ctrl+= | aproximar | `ui/shell.ts`, bloco das teclas Ctrl |
| Ctrl+− | afastar | idem |
| Ctrl+0 | 100 % | idem |
| Ctrl+Shift+F | ajustar à tela | idem |
| F | enquadrar a seleção | cena e janela, com `stopPropagation` |

`F` está livre. Ferramentas usam n m b e r q w g. Trava usa 7 8 9 0. Virar filho usa P.
Ctrl+= no navegador é zoom da página: `preventDefault`.
Sem nada escolhido, `F` faz o mesmo que Ajustar à tela.

### Arquivos

| Arquivo | O que fazer |
|:---|:---|
| `viewport/zoom-model.ts` **novo** | `parseZoomPercent(texto)` → zoom ou `null`. `formatZoomPercent(zoom)` → `"150%"`. `selectionBounds(skeleton, selection)` → `WorldBounds` ou `null`. Puro |
| `viewport/viewport.ts` | tirar `viewport-view-buttons` de `buildToolbar`. Criar a camada do canto no `mount`. Expor `zoomIn()`, `zoomOut()`, `zoomTo(1)`, `fitToScreen()`, `frameSelection()`. Atualizar o `100%` em `cameraChanged` |
| `viewport/viewport.css` | estilo da camada do canto |
| `ui/shell.ts` | nada novo: as entradas de Exibir já existem desde o lote menus. A cena só registra as ações `aproximar`, `afastar`, `tamanho-real`, `ajustar`, `enquadrar` e elas deixam de ficar cinza |
| `viewport/picking.ts` | reaproveitar o cálculo de vértices no mundo para `selectionBounds`. Não duplicar |

`selectionBounds`: ossos pela raiz (`worldX`, `worldY`) e pela ponta (`length`). Desenhos pelos vértices no mundo.
`frameSelection` usa `camera.fit(bounds, 0.2)`. Um osso só, sem comprimento: centra nele, zoom não muda.

### Testes — `editor/testes/lote1-zoom.test.ts`

| Caso | Espera |
|:---|:---|
| `parseZoomPercent('200')` | `2` |
| `parseZoomPercent('200%')` | `2` |
| `parseZoomPercent('abc')` | `null` |
| `parseZoomPercent('0')` | `null`. Zoom zero não existe |
| `formatZoomPercent(1.5)` | `'150%'` |
| `selectionBounds` com o osso `braco` do esqueleto do lote 0 | caixa contém (200, 0) e (240, 0) |
| `selectionBounds` com seleção vazia | `null` |
| `camera.fit` no resultado | o centro da câmera é o centro da caixa |

### Manual

Capítulo 2, seção nova antes de "Escolher": **"Ver de perto e de longe"**. Cinco linhas. Tabela das teclas.
Capítulo 1, passo 3, se citar os botões da barra: trocar pela frase do canto.
Inglês igual.

### Pronto quando

- A barra de cima perde uma linha em 1440×900. Medir no headless: altura da `.viewport-toolbar` antes e depois.
- Digitar 200 no campo põe `camera.zoom = 2`.
- `F` com o `hips` escolhido centra a câmera nele.
- Testes: os 8 acima passando. Total sobe.

---

## Lote 2 → v1.8 · Itens 6 e 7 · Tocador e Repetir

### O que muda na tela

O tocador sai do painel Animações e vai para a **primeira linha da linha do tempo**.
O painel Animações fica só com a lista e os botões Nova, Duplicar, Apagar.

Primeira linha da linha do tempo, da esquerda para a direita:

| Controle | Texto no botão | Dica | Tecla |
|:---:|:---:|:---|:---:|
| Início | ⏮ Início | Vai para o começo (Home) | Home |
| Chave anterior | ⏪ Chave | Vai para a chave anterior (seta para cima) | ↑ |
| Quadro anterior | ◀ Quadro | Volta um quadro (seta para a esquerda) | ← |
| Tocar / Pausar | ▶ Tocar · ❚❚ Pausar | Toca e pausa (Espaço, fora da cena) | Espaço |
| Quadro seguinte | Quadro ▶ | Avança um quadro (seta para a direita) | → |
| Próxima chave | Chave ⏩ | Vai para a próxima chave (seta para baixo) | ↓ |
| Fim | Fim ⏭ | Vai para o fim (End) | End |
| Repetir | 🔁 Repetir | Volta ao começo no fim. Fica gravado no arquivo (L) | L |
| Tempo | `0,32 s · quadro 10` | Clique para digitar o tempo | — |
| Duração | `1,00 s` | Duração da animação | — |
| Velocidade | lista ¼ ½ 1 2 | Velocidade de tocar | — |
| Gravar sozinho | ● Gravar | Ligado: mexer já cria a chave (A) | A |
| Chavear | ◆ Chavear | Grava uma chave no tempo atual (K) | K |

**Só o símbolo no botão.** Decidido pelo Humberto em 08/09/2026. O nome e a tecla ficam na dica (`title`, `aria-label`).
A coluna "Texto no botão" acima vale só para a dica: no botão fica o símbolo.

A segunda linha perde Chavear e Gravar sozinho. Ficam: Apagar chave · Apagar seleção · Copiar · Colar · Esticar ×2 · Encolher ÷2 · Espelhar.
A duração entra só como leitura. Mudar a duração é o item 11, lote 10. **Não fazer agora.**

### Repetir (item 7)

| O que | Como |
|:---|:---|
| Dado | `animation.loop`, §4.6. Já existe no schema. O editor não gravava |
| Comando | `SetAnimationLoop(animação, ligado)` em `panels/animations-model.ts`. `kind: 'transform'`, `animationOnly` = nome da animação. `revert` devolve o valor anterior, inclusive `undefined` |
| Tocador | lê `animation.loop` do arquivo. Aceso = laranja, `aria-pressed` |
| Painel Animações | cada linha mostra `repete` depois da duração, só leitura. Um lugar só para ligar: o tocador |
| Prévia | a camada 1 da Prévia nasce com o `loop` da animação escolhida. O campo da Prévia continua, é de sessão |
| Barra de baixo | "Repetir ligado em walk" · "Repetir desligado em walk" |
| Campo `looping` de sessão | apagar de `panels/animations.ts` |

O runtime já lê `loop` (`runtime/src/data.ts` linha 854). Nada a fazer lá.

### O motor de tocar

Sai de `panels/animations.ts` (linhas 130–180) e vai para `anim/transport.ts` **novo**.
Modelo puro, com relógio injetado, para o teste não esperar de verdade:

```
createTransport({ now: () => ms, schedule: (fn) => id, cancel: (id) => void })
  .play(doc) .pause() .toggle(doc) .isPlaying()
  .setSpeed(n) .speed()
  .tick(doc, stampMs)          → avança doc.time; respeita animation.loop e duration
  .onChange(listener)          → o tocador redesenha
```

`tick` com `loop` falso e `next >= duration`: `doc.time = duration`, para.
`tick` com `loop` verdadeiro: `clampTime` dá a volta.
Trocar de animação pausa.

### Espaço em qualquer lugar

`ui/shell.ts`, `onKeyDown`: se não está digitando e a tecla é `' '`, `transport.toggle(doc)`, `preventDefault`.
**Conflito:** a cena usa Espaço segurado para arrastar a vista (`spaceHeld`, `viewport.ts` linha 641).
Solução: a cena continua tratando o `keydown` de Espaço **quando ela tem o foco** e passa a chamar `stopPropagation` ali. Espaço na cena = arrastar. Espaço fora da cena = tocar.
Está na dica do botão Tocar: "(Espaço, fora da cena)".

`K`, `A`, `L`: tratadas na janela, não digitando. Nenhuma ferramenta usa essas letras hoje. Conferir antes.

### Arquivos

| Arquivo | O que fazer |
|:---|:---|
| `anim/transport.ts` **novo** | o motor, acima |
| `panels/animations-model.ts` | `SetAnimationLoop`. `listAnimations` já devolve `loop` |
| `panels/animations.ts` | tirar `buildPlayer`, `attachScrub`, `play`, `stop`, `looping`, `speed`. Linha da lista ganha `repete` |
| `panels/dopesheet.ts` | `buildNavigationGroup` vira o tocador inteiro. `buildKeyGroup` perde Chavear e Gravar. `buildRecordBox` vira botão `● Gravar` com `aria-pressed` |
| `panels/dopesheet.css` | os botões novos. Repetir aceso laranja. Gravar aceso vermelho |
| `ui/shell.ts` | Espaço, K, A, L |
| `panels/panels.css` | tirar o estilo do tocador antigo, se ficar órfão |

### Testes — `editor/testes/lote2-tocador.test.ts`

| Caso | Espera |
|:---|:---|
| `SetAnimationLoop('walk', true)` apply + revert | JSON igual ao de antes, por texto |
| `SetAnimationLoop` em animação com `loop` ausente, revert | `loop` volta a ausente, não a `false` |
| `SetAnimationLoop.animationOnly` | `'walk'` |
| transport: play, dois ticks de 100 ms, velocidade 1 | `doc.time` = 0,2 |
| transport: velocidade 0,5, tick de 100 ms | `doc.time` avança 0,05 |
| transport: `loop` falso, tick passa do fim | `doc.time` = duração, `isPlaying()` falso |
| transport: `loop` verdadeiro, tick passa do fim | `doc.time` deu a volta, ainda tocando |
| transport: `toggle` duas vezes | tocando, depois parado |
| lista do tocador: função pura que devolve os 13 controles com nome, dica e tecla | 13 itens, nenhum sem dica, nenhuma tecla repetida |

### Manual

Capítulo 3, "A linha do tempo → Os botões": reescrever a tabela com a linha do tocador.
Capítulo 3, "Laço": o botão Repetir agora fica no tocador e **grava no arquivo**. Tirar "Ligue o laço no painel Animações".
Capítulo 1, passo 10 "Tocar": onde está o botão agora, e o Espaço.
Capítulo 3, "Camadas", tabela com "Repetir": dizer que a camada nasce com o Repetir da animação.
Inglês igual.

### Pronto quando

- Espaço com o foco na Árvore toca e pausa. Espaço com o foco na cena arrasta a vista.
- A primeira linha tem 13 controles com `aria-label`. O painel Animações não tem Tocar.
- Ligar Repetir, salvar, reabrir: `"loop": true` no arquivo e o botão aceso.
- Testes acima passando.

---

## Lote 3a → v1.9 · Itens 9 e 10 · Trocar o desenho por lista, semáforo

### Item 9 · Trocar o desenho por lista

| O que | Como |
|:---|:---|
| Campo Anexo do slot | `panels/properties-model.ts` linha 443: `kind: 'text'` vira `choice`. Opções = anexos do slot nas peles visíveis (`doc.visibleSkins`; vazio = `default`) mais `(nenhum)` com valor `''` |
| Função pura | `attachmentOptions(file, slot, visibleSkins)` → `[{value, label}]` no `properties-model.ts` |
| Montagem | o mesmo `setFieldCommand` de hoje escreve `slot.attachment` |
| Animando | vai por `setPropertyOrKey` como qualquer campo. Conferir que `targetForPointer` entende `/slots/i/attachment`. Se não entender, acrescentar em `anim/keying.ts` e escrever o teste |
| Gravar desligado | a mensagem de hoje: "Gravação automática desligada…". Depois, Chavear com o slot escolhido grava a chave de Desenho |
| Árvore | cada linha de anexo ganha uma bolinha `○` antes do nome. `●` = é o anexo do slot agora. Clicar chama o mesmo caminho do campo. `title`: "Usar este desenho no slot" |
| Bolinha em Animando | mesma regra do campo |

Chave de Desenho: valor é texto, a curva é sempre parada. Não oferecer curva.

### Item 10 · Semáforo do Chavear, Gravar em vermelho

| Cor | Quando | De onde vem |
|:---:|:---|:---|
| verde | não há chave no tempo atual para o escolhido | `isKeyed` falso para todos os alvos |
| vermelho | já há chave no tempo atual | `isKeyed` verdadeiro para ao menos um |
| cinza | Montagem, ou nada escolhido | `doc.animation === null` |

**Laranja não entra neste lote.** O `08` diz "o escolhido mudou e não foi gravado". Hoje isso não existe: com Gravar desligado o arrasto é recusado (`bloqueado`) e nada muda. Pintar laranja seria mentir. Decisão do Humberto, na seção do fim.

| O que | Como |
|:---|:---|
| Função pura | `keyButtonState(doc, alvos)` → `'sem-chave'`, `'com-chave'` ou `'inativo'`, em `anim/pose-mode.ts` |
| Alvos | os mesmos que `targetsToKey()` do dopesheet usa. Extrair para função pura se ainda não for |
| Botão | classe `dope-chavear-verde`, `-vermelho`, `-inativo`. A dica muda junto: "Grava uma chave no tempo atual (K)" · "Já tem chave aqui. Apertar grava por cima (K)" |
| Gravar sozinho | aceso = vermelho, `aria-pressed="true"` |
| Quando recalcular | em toda `refresh` do dopesheet: `time`, `selection`, `structure` |

### Arquivos

| Arquivo | O que fazer |
|:---|:---|
| `panels/properties-model.ts` | `attachmentOptions`, campo Anexo vira `choice` |
| `panels/tree.ts` | bolinha por anexo |
| `panels/tree-model.ts` | `isCurrentAttachment(file, slot, nome)`, puro |
| `anim/keying.ts` | `targetForPointer` para `attachment`, se faltar |
| `anim/pose-mode.ts` | `keyButtonState` |
| `panels/dopesheet.ts` | cores e dica do Chavear. Gravar vermelho |
| `panels/dopesheet.css` | as três classes |

### Testes — `editor/testes/lote3a-desenho-e-semaforo.test.ts`

| Caso | Espera |
|:---|:---|
| `attachmentOptions(heroi, 'weapon', [])` | os anexos do slot na pele default, mais `(nenhum)` primeiro |
| `attachmentOptions` com duas peles visíveis | união, sem repetir nome |
| campo Anexo em `slotFields` | `kind === 'choice'` |
| trocar anexo em Montagem, apply + revert | JSON igual por texto |
| trocar anexo em Animando com Gravar ligado | uma chave na linha `slot/attachment` no tempo atual, valor = nome novo |
| `keyButtonState` em Montagem | `'inativo'` |
| `keyButtonState` no tempo 0 do `walk` com `hips` escolhido | `'com-chave'` |
| `keyButtonState` num tempo sem chave | `'sem-chave'` |

### Manual

Capítulo 2, onde fala de prender a imagem no osso: a lista e a bolinha.
Capítulo 3, "Chaves → Criar uma chave": as cores do Chavear.
Inglês igual.

### Pronto quando

- Trocar mão aberta por mão fechada em Animando com Gravar ligado cria uma chave de Desenho.
- A lista mostra só os anexos daquele slot.
- Ir a um quadro sem chave deixa o Chavear verde. Chavear deixa vermelho.
- Testes acima passando.

---

## Lote 3b → v2.0 · Item 8 · Linha Resumo

### O que muda na tela

A linha **Alvo** do cabeçalho vira **Resumo**.
Um losango em cada tempo que tenha chave em qualquer linha. Branco quando há mais de um tipo de chave naquele tempo.
Sempre visível, mesmo com os grupos de baixo fechados.

| Gesto | Faz |
|:---|:---|
| clicar no losango | escolhe todas as chaves daquele tempo. Shift soma, Ctrl tira |
| arrastar o losango | move todas as chaves daquele tempo. Preso ao quadro. Alt solta |
| ↑ ↓ sem linha escolhida | pulam pelos tempos do Resumo. Já é assim: `stepKey` usa `allKeyTimes` |

### Modelo puro — `anim/summary.ts` **novo**

```
summaryTimes(file, animação)            → number[]        (é allKeyTimes)
refsAtTime(file, animação, tempo)       → KeyRef[]        (toda chave naquele tempo)
isMixedTime(file, animação, tempo)      → boolean         (mais de um `type` de alvo)
```

Mover = `EditKeys` com `moveKeys(file, nome, refs, delta)`. Um passo de desfazer. `mergeWith` durante o arrasto, `endMerge` no solto.
O arrasto do dopesheet já faz isso para chaves escolhidas. Reaproveitar: escolher as `refs` do tempo e cair no mesmo caminho.

### Arquivos

| Arquivo | O que fazer |
|:---|:---|
| `anim/summary.ts` **novo** | as três funções |
| `panels/dopesheet.ts` | `buildHeader`: a linha Resumo com os losangos. Clique e arrasto caem em `selectKeys` e no arrasto de chave que já existe |
| `panels/dopesheet.css` | losango do Resumo, losango branco |

### Testes — `editor/testes/lote3b-resumo.test.ts`

| Caso | Espera |
|:---|:---|
| animação com chaves em 0, 0,17 e 0,5 | `summaryTimes` = `[0, 0.17, 0.5]` |
| `refsAtTime(…, 0.17)` | todas as chaves de 0,17, de todas as linhas |
| `isMixedTime` num tempo só com ossos | falso |
| `isMixedTime` num tempo com osso e evento | verdadeiro |
| mover as refs de 0,17 para 0,2 com `EditKeys` + `moveKeys` | todas em 0,2; nenhuma em 0,17; `revert` devolve; JSON igual |

### Manual

Capítulo 3, "A linha do tempo → O que se faz com o mouse": a linha Resumo.
Inglês igual.

### Pronto quando

- Animação com chaves em 0, 0,17 e 0,5 mostra 3 losangos.
- Arrastar o do 0,17 para 0,2 move as chaves de todas as linhas daquele tempo, num passo de desfazer.
- Testes acima passando.

---

## O que fica para depois, de propósito

| Item | Motivo |
|:---:|:---|
| 11, duração perguntando | lote 10 na ordem do `07` |
| 15, uma linha só na barra | lotes 4 e 5 |
| 17, ícones | lote 4. Precisa da decisão sobre ícone sem palavra |
| laranja do semáforo | precisa de pose transitória, que não existe |

---

## Decisões para o Humberto

Nenhuma trava o começo. O executor começa pelo lote 1 enquanto ele responde.

| # | Pergunta | O que eu recomendo |
|:---:|:---|:---|
| 1 | Botão do tocador: símbolo + palavra, ou só símbolo com dica? | **Respondido: só símbolo.** Já aplicado no lote 2 |
| 2 | Chavear laranja ("mexeu e não gravou"): deixar para depois? | deixar. Hoje não há estado para pintar |
| 3 | Repetir só no tocador, e a lista do painel Animações só mostra? | sim. Um lugar para ligar, como o Live2D |
| 4 | Mudar a duração pelo tocador já neste lote? | não. É o item 11, lote 10 |

---

## Ordem de trabalho para o executor

1. Ler este plano inteiro. Ler `editor/src/contract.ts` inteiro.
2. Lote menus. Backup, código, testes, tsc, manual, CHANGELOG, conferir no headless, versão v1.6.
3. Responder ao Humberto em poucas linhas: o que entrou, quantos testes, o que ficou.
4. Só depois o lote 1. Mesmo ciclo. E assim até o 3b.
5. No fim da rodada: `ESTADO.md`, seção "Conferido de novo", uma tabela por lote, como a do lote 0.
6. Depois de cada lote: uma mensagem curta ao Humberto e ao chat de progresso. O que entrou, quantos testes, o que ficou.
7. Acabou a rodada 1: abrir o `PLANO rodada 2 - funcional e possibilidades 2026-09-08.md` e seguir.

Se algo do plano não bater com o código, **parar e escrever** no fim deste arquivo, seção "Desvios". Não inventar por cima.
Se um lote precisar de runtime, ferramentas, formato ou conformidade: chamar a sessão que construiu o Recorte. Ela se ofereceu.

---

## Desvios

Escrito pelo executor, no fim de cada lote. O que o plano dizia e o código não
batia, e o que foi feito no lugar. Nada aqui foi inventado por cima: cada linha
diz o motivo.

### Lote menus → v1.6

| # | O que o plano ou o projeto dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | `PROJETO DO MENU`, seção 3: `Ctrl+A` em **Editar → Selecionar tudo** e também em **Animação → Selecionar todas as chaves** ("Ctrl+A na linha do tempo") | O teste do plano exige `shortcut` **único** nos sete menus. Duas entradas com a mesma tecla escrita ao lado é o que a tabela de atalhos existe para não deixar acontecer | Só "Selecionar tudo" carrega `Ctrl+A`. "Selecionar todas as chaves" fica **sem tecla escrita** até as duas existirem e serem a mesma ação. As duas estão cinzas neste lote |
| 2 | "Nenhum botão sai da tela neste lote" | Três testes do editor e dois das ferramentas liam `fileMenu()` como lista **plana**, e agora Importar e Exportar são submenu e "Reempacotar atlas" mudou para Esqueleto | As cinco provas foram reescritas para abrir os submenus com `flatEntries`. **Nenhum teste foi apagado** e a contagem subiu: 1.370 → 1.401 |
| 3 | O conflito do `Espaço` (arrastar a vista × tocar) estava marcado para o **lote 2** | O mapa de atalhos deste lote já torna `Espaço` global, então o conflito chegou junto | Resolvido como o lote 2 manda: a cena trata o `Espaço` quando tem o foco e chama `stopPropagation`. Fora da cena, `Espaço` toca. A dica do menu diz isso |
| 4 | O projeto escreve "Importar PSD…", "Exportar glTF…" | Dentro de um submenu chamado **Importar**, repetir a palavra em cada filho é ruído | Os filhos ficaram curtos: **Importar ▸ PSD…**, **Exportar ▸ glTF…**. A ação (`importar-psd`, `exportar-gltf`) não mudou |
| 5 | O plano lista o que já existe e o que fica cinza. **"Virar filho de… (P)"** e **"Preferências…"** não estão em nenhuma das duas listas | `P` existe: é a ferramenta Selecionar quem responde. "Preferências…" não existe em lugar nenhum | "Virar filho de…" foi ligado (a ação escolhe Selecionar e bate na mesma porta do `P`). "Preferências…" ficou cinza, com a dica do lote 4 |
| 6 | O plano manda o pai de submenu ter `action` como qualquer entrada | Um pai não roda nada: o que ele faz é abrir | O pai tem `action` (para a prova de unicidade valer para ele também) e abre sempre, mesmo com todos os filhos cinzas — é assim que se vê que **Interpolação** vem no lote 12 em vez de não existir |

### Lote 1 → v1.7

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "Pronto quando: **a barra de cima perde uma linha em 1440×900**. Medir no headless" | Medido: a barra tem **três** linhas com e sem os três botões. Eles dividiam a última linha com "Travar" (915px de ferramentas, 279+689 de Eixos e Compensar, 281 de Travar): tirá-los encurtou essa linha, não apagou nenhuma. Em 1100×800 são quatro linhas dos dois jeitos | Os três botões saíram assim mesmo — ver de perto é coisa da cena, não da barra —, mas o lote **não** ganhou a linha. Ganhar a linha é o item 15, lotes 4 e 5, que junta ferramentas em ícones. Está escrito no CHANGELOG com o número medido, para ninguém contar essa vitória duas vezes |
| 2 | `documentos/notas-de-desenvolvimento/conferir-editor.mjs` procura um botão cujo texto é exatamente "Ajustar à tela" | No canto o botão mostra só "Ajustar" — o plano manda `− · 100% · + · Ajustar` —, e o script passou a devolver `ajustouATela: false` | O script passou a procurar pelo `aria-label` ("Ajustar à tela (Ctrl+Shift+F)"), com o texto como segunda tentativa, para continuar servindo numa versão anterior do editor. Cópia do original em `backup/conferir-editor_2026-09-08_antes-do-lote-1.mjs` |
| 3 | "`selectionBounds`: ossos pela raiz e pela ponta. Desenhos pelos vértices no mundo" | Uma caixa de colisão **não** está em `collectDrawables`, que só lista o que é desenhado, e o esqueleto de teste tem um slot que é só caixa | `selectionBounds` passa também pela `drawOrder` atrás do que não é desenhado. Enquadrar uma caixa de colisão escolhida agora enxerga a caixa |
| 4 | O campo do zoom mostra o valor | Escrevendo o valor a cada mudança de câmera, a roda do mouse apagava o "20" de quem estava digitando "200" | `showZoom()` não reescreve enquanto o campo tem o foco; `showZoom(true)` reescreve no Enter, no Esc e quando o texto é recusado, que é quando a pessoa terminou. Sem isso, um "abc" recusado ficava escrito no campo |

### Lote 2 → v1.8

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | A lista dos treze controles é "uma função pura", sem dizer onde ela mora; a tabela de Arquivos só cria `anim/transport.ts` | `transport.ts` é o motor de tocar, e Chavear e Gravar sozinho não são do motor: eles estão na mesma LINHA, não no mesmo assunto | A lista foi para `panels/dopesheet-model.ts`, arquivo novo. É a convenção da regra 2 do próprio plano — "todo cálculo vai num `*-model.ts` ou em `anim/`" — e deixa `transport.ts` sendo só o motor |
| 2 | A tabela do plano dá `◀ Quadro` ao quadro anterior e `Quadro ▶` ao seguinte, e `▶ Tocar` a tocar | Com só o símbolo no botão, `▶` ficaria em dois controles diferentes, e dois botões iguais ninguém distingue sem passar o mouse | Quadro anterior e seguinte ficaram `◂` e `▸`; `▶` é só de tocar; `⏪` e `⏩` pulam para a chave. Há um teste que recusa símbolo repetido |
| 3 | "Mudar a duração é o item 11, lote 10. **Não fazer agora**" | O plano também manda a duração aparecer na primeira linha | A duração entrou como **texto**, sem campo e sem clique. Em Montagem ela mostra `—` |
| 4 | O `conferir-editor.mjs` clica em `.anim-controles button` e lê o relógio pelo texto `0,00 s — quadro 0` | Os dois saíram do painel Animações neste lote | O script passou a usar `.dope-toc-tocar` e a montar o relógio do campo de tempo mais a etiqueta do quadro. Cópia do original em `backup/conferir-editor_2026-09-08_antes-do-lote-2.mjs` |
| 5 | "Testes: `SetAnimationLoop` apply + revert, JSON igual ao de antes, **por texto**" | `doc.serialize()` também escreve a câmera e a seleção dentro de `extensions`, que mudam por conta própria: o teste falhava por causa delas, não do comando | O teste compara `JSON.stringify(doc.file, null, 2)`, que é o arquivo em si. A prova continua sendo por texto, e continua sendo exata |
| 6 | A Prévia: "a camada 1 nasce com o `loop` da animação escolhida" | Não há uma camada 1 diferente das outras: são quatro iguais | Vale para **qualquer** camada: escolher uma animação traz o `loop` dela. Ler só a camada 1 seria uma regra que ninguém adivinharia |

### Lote 3a → v1.9

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "Montagem: o mesmo `setFieldCommand` de hoje escreve `slot.attachment`" | `setFieldCommand` só monta um `SetProperty`: quem sabe a regra dos dois modos é o método `write` **privado** do painel Propriedades, e a Árvore não alcança um método privado de outro painel | `writeFieldValue(doc, field, value)` saiu de dentro do painel e foi para `properties-model.ts`. Os dois painéis chamam a mesma função, e a regra dos dois modos existe em um lugar só |
| 2 | "Conferir que `targetForPointer` entende `/slots/i/attachment`. **Se não entender**, acrescentar" | Ele já entendia: `attachment` está em `SLOT_ANIMATABLE` desde antes | Nada a fazer. O plano previa os dois casos; ficou registrado aqui para ninguém procurar de novo |
| 3 | "Alvos: os mesmos que `targetsToKey()` do dopesheet usa. **Extrair para função pura se ainda não for**" | Não era: a lista estava escrita dentro do painel | `targetsForSelection` foi para `anim/pose-mode.ts`, junto de `keyButtonState`, e o painel passou a chamá-la. As duas contas — a que grava e a que pinta — leem a mesma lista |
| 4 | "Árvore: cada linha de anexo ganha uma bolinha `○` antes do nome" | A linha de anexo já é um `<button>`, e um `<button>` dentro de outro é HTML inválido: o Tab percorreria a mesma linha duas vezes | A bolinha é um `<span>` com `role="button"` que engole o clique. Quem chega pelo teclado usa o campo "Anexo" do painel Propriedades, que é a mesma coisa escrita em palavras |
| 5 | "Quando recalcular: em toda `refresh` do dopesheet: `time`, `selection`, `structure`" | A folha já ouvia `selection`, mas nesse caso ela redesenhava a folha INTEIRA, o que num arquivo grande é caro e faz a rolagem pular | `refresh` com `selection` agora só chama `syncPlayer()` e volta. A cor muda, a folha não pisca |
| 6 | Nenhuma menção às classes dos botões do tocador | O botão Chavear não tinha classe própria, e a conferência automática teria que contar posições numa linha que ainda vai mudar | Todo botão do tocador leva `dope-toc-<id>` na classe, e não só os liga-desliga |

### Lote 3b → v2.0

| # | O que o plano dizia | O que o código pedia | O que ficou |
|:---:|:---|:---|:---|
| 1 | "A linha **Alvo** do cabeçalho vira **Resumo**" | "Alvo" é o título da COLUNA dos nomes, e vale para todas as linhas da folha, não só para a de cima | O cabeçalho passou a ter duas linhas: a régua com "Alvo" à esquerda, e o Resumo embaixo dela com "Resumo" à esquerda. As duas ficam presas no topo — um Resumo que rolasse para fora da vista seria inútil justamente no caso para o qual ele existe |
| 2 | "Mover = `EditKeys` com `moveKeys(file, nome, refs, delta)`. Reaproveitar o arrasto de chave que já existe" | O arrasto reaproveitado descartava a chave de EVENTO. A folha identificava uma chave por alvo e tempo, e uma chave de evento precisa também do nome: duas no mesmo instante são legais no formato. `dropMissingSelection` apagava a do Resumo no desenho seguinte, e o arrasto a deixava para trás em silêncio | A folha passou a montar as chaves de cada linha por `allKeyRefs`, que carrega o nome do evento. É correção de um defeito que já existia antes deste lote, e sem ela o item 8 entregaria um arrasto que perde chave |
| 3 | Três funções em `anim/summary.ts`: `summaryTimes`, `refsAtTime`, `isMixedTime` | Desenhar a linha chamando `refsAtTime` uma vez por losango percorre todas as chaves da animação uma vez por tempo — e o Resumo se redesenha a cada tecla | Entrou uma quarta, `summaryMarks`, que faz a linha inteira numa passada. As três do plano continuam existindo e são as que os testes provam |
| 4 | Nada sobre o parâmetro de `onTrackDown` | Ele recebia um alvo e nunca o usava: o laço pega o que a caixa toca, venha da linha que vier | O parâmetro saiu. Um parâmetro que ninguém lê é um parâmetro que um dia alguém preenche errado |
