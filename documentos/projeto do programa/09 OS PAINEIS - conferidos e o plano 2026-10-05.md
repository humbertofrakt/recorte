# Os painéis — conferidos e o plano — 05/10/2026

Rodada 4, parte 1. Pelo `EXECUTANDO · rodada 4 — os painéis do Photoshop` (ref `de6a44`).
Conferido no `programa/` montado **v25.7**, porta 5322, um Chrome sem janela, mouse e
teclado por protocolo, das **04h48 às 04h56** do relógio da máquina. Memória livre no início: 1,4 GB.
Fotos em `backup/fotos-obra/rodada-04/`. **Nada foi escrito em `editor/`.**

---

## 1. A resposta, em três linhas

| # | Por que ficam presos na parede |
|:---:|:---|
| 1 | **Soltar existe, mas parece proibido.** Só a aba solta, pelo arrasto do próprio navegador. Fora das tiras de abas ninguém aceita a soltura: em cima da cena o cursor mostra **"proibido"** o caminho todo (`ui/shell-drop.ts:56-66` só aceita arquivo; `ui/shell.ts:960` só a tira). O painel só solta **depois** que a mão larga, no `dragend` (`shell.ts:899`). Quem vê "proibido" não larga ali |
| 2 | **A coluna não recolhe.** Não há a setinha dupla nem o "recolher em ícones". O `▾` só encolhe o grupo na altura: a coluna continua com 260 px na parede. A única saída é `Tab`, que some com tudo |
| 3 | **Os gestos que o dedo tenta primeiro não fazem nada:** puxar o vão escuro da tira (o grupo inteiro), dois cliques na aba, dois cliques na barra do painel solto, `Shift+Tab` |

**Pelo código, sem ver:** o cursor "proibido" não aparece no Chrome sem janela. O que vi foi o
arrasto funcionar quando o evento chega; o cursor é leitura do código. **A mão do Humberto confirma.**

---

## 2. A tabela dos gestos

Estados: **igual** ao Photoshop · **outro gesto** · **quebrado** · **não existe**.

| # | O gesto do Photoshop | Como o Photoshop faz | O nosso hoje | Estado | Foto |
|:---:|:---|:---|:---|:---:|:---|
| 1 | Soltar um painel da parede | puxa a **aba** para fora do grupo; ele flutua com barra de título [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) [²](https://www.apogeephoto.com/photoshop-setting-up-your-workspace-with-panels/) | puxar a aba para a cena solta o painel, com barra, `×` e canto. **Mas** sobre a cena o cursor diz "proibido" (ver 1.1), e nada segue a mão até soltar | **quebrado** (funciona, e ensina o contrário) | `36`, `03` |
| 2 | Soltar o grupo inteiro | puxa a **barra escura** do grupo [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) | puxar o vão da tira: nada | **não existe** | — |
| 3 | Mover o painel solto | puxa a barra | puxar a barra move | **igual** | `08`, `09` |
| 4 | Colar de volta | solta a aba ou a barra num grupo; **realce azul** mostra onde [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) | soltar a barra na tira de abas cola; o rodapé diz *"colado de volta"*. A marca azul é um contorno fino na aba | **igual**, com o sinal fraco | `10`, `11` |
| 5 | Agrupar: aba para outro grupo | arrasta a aba para a tira do outro; realce azul [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) | aba solta na tira do outro grupo entra nele | **igual** | `33`, `34` |
| 6 | Empilhar: grupo novo | arrasta para a **borda de baixo** de um painel; linha azul horizontal [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) | a coluna tem **dois grupos fixos**. Solta sobre o corpo de outro painel, a aba **flutua** — e cai meio fora da tela, por cima da linha do tempo | **não existe**, e o erro **cobre a linha do tempo** | `37` |
| 7 | Recolher em ícones | a **setinha dupla** no topo da coluna; a coluna vira uma faixa de ícones [³](https://www.teachucomp.com/?p=31506) | não há | **não existe** | `00` |
| 8 | Abrir um ícone | clica no ícone: o painel abre ao lado, por cima [³](https://www.teachucomp.com/?p=31506) | — | **não existe** | — |
| 9 | Expandir | a mesma setinha, ou dois cliques na barra da coluna [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) | — | **não existe** | — |
| 10 | Recolher um painel só | **dois cliques na aba** (ou na barra do grupo) [²](https://www.apogeephoto.com/photoshop-setting-up-your-workspace-with-panels/) | dois cliques na aba: nada. O `▾` no fim da tira recolhe o grupo, e a dica diz *"Abrir: Árvore, Ordem"* | **outro gesto** (`▾`) | `12`, `13` |
| 11 | Recolher o painel solto | dois cliques na barra dele [²](https://www.apogeephoto.com/photoshop-setting-up-your-workspace-with-panels/) | nada | **não existe** | `40` |
| 12 | Esconder tudo | `Tab` [²](https://www.apogeephoto.com/photoshop-setting-up-your-workspace-with-panels/) | `Tab` esconde as duas colunas; de novo, voltam | **igual** | `14` |
| 13 | Esconder só os painéis | `Shift+Tab`: fica a barra de ferramentas [⁴](https://www.creativetechs.com/?p=241) | nada | **não existe** | `15` |
| 14 | Menu Janela | todos os painéis, com marca; **Área de trabalho ▸** (Nova, Redefinir) [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) [⁵](https://www.teachucomp.com/?p=31521) | 18 painéis com marca; **Arranjos ▸** e **Arrumar ▸** (Esconder painéis, Mover para a outra coluna, Fechar o grupo, Detalhes). **Faltam** Soltar · Recolher em ícone · Expandir | **igual**, menos os três | `16`, `17`, `18` |
| 15 | Trocar de área de trabalho | Janela → Área de trabalho, **ou o botão na barra de opções** [¹](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/) | só pelo menu Janela → Arranjos | **outro gesto** (sem botão) | `18` |
| 16 | Largura da coluna | arrasta a borda | arrastar a borda: de 260 para 396; o mínimo é 180 | **igual** | `38`, `39` |
| 17 | Mudar o tamanho do solto | canto de baixo à direita [²](https://www.apogeephoto.com/photoshop-setting-up-your-workspace-with-panels/) | o canto existe | **igual** (não puxei) | `03` |

**Somando:** 6 iguais · 2 com outro gesto · 1 quebrado · 7 não existem · 1 igual com sinal fraco.

**Na tela pequena (1280×720):** o painel solto no meio da cena desce **por cima dos botões da
linha do tempo** (foto `42`). A régua do código só guarda 48 px de barra à vista
(`clampFloat`, `ui/panel-groups.ts:681`): deixa o resto pendurar para fora da cena.

### Uma armadilha da prova, escrita pela forma

*Fiz o arrasto da aba com o mouse simples, e o arrasto do navegador não entrega a soltura assim.*
Deu "aba no outro grupo: não move" — falso. Refiz com o arrasto interceptado
(`Input.setInterceptDrags` + `dispatchDragEvent`), e o gesto 5 passou. As fotos `19` a `24`
e `02` a `06` são do mouse simples: **não valem para arrasto de aba.** Valem `25` em diante.

---

## 3. O plano, em lotes pequenos

Do que mais muda a vida dele para o que menos muda. Um lote = um gesto que se vê = uma versão =
um par de fotos nas duas telas. A arrumação mora no navegador (`RECORTE_…`), nunca no `.bone`.

| Lote | O que ele vai ver | Arquivos | O que pode quebrar |
|:---:|:---|:---|:---|
| **1** | **Puxar a aba e ver o painel vir junto.** Uma sombra do tamanho do painel segue a mão; sobre a cena, nada de "proibido"; sobre uma tira, a linha azul forte. Larga e ele fica ali. Feito com eventos de ponteiro, não com o arrasto do navegador: igual em qualquer navegador. **Janela → Arrumar → Soltar o painel da parede** solta o painel em uso | `ui/shell.ts` (abas: `dragstart`/`dragend`/`drop` → ponteiro), `ui/shell.css`, `ui/actions-table.ts`, `ui/menus.ts` | `medir-paineis.mjs` e 3 provas tocam `panel-tab`; `colunas-e-barra.test.ts` cita `dragstart` (2 vezes). O arrasto de arquivo para dentro (`shell-drop.ts`) não pode confundir |
| **2** | **Recolher em ícones.** A setinha dupla `«»` no topo de cada coluna. A coluna vira uma faixa de ícones de ~40 px, e a cena cresce. Clicar no ícone abre o painel ao lado, por cima da cena; clicar de novo fecha. A mesma setinha expande. **Janela → Arrumar → Recolher em ícone · Expandir** | `ui/layout-model.ts`, `ui/panel-groups.ts` (estado "em ícones" da coluna), `ui/shell.ts`, `ui/shell.css`, ícone por painel, `actions-table.ts`, `menus.ts` | `npm run medir` mede a coluna aberta: o painel aberto do ícone tem de ser medido também. Nada some: o painel continua no menu Janela |
| **3** | **O painel solto nunca cobre a linha do tempo nem sai da tela.** Inteiro dentro da cena; se não cabe, encolhe | `ui/panel-groups.ts` (`clampFloat`), `ui/shell.ts` (`newFloatBox`) | testes do `clampFloat` que provam a sobra de 48 px mudam **de propósito** |
| **4** | **Dois cliques na aba recolhem o grupo** (o mesmo que o `▾`). Dois cliques na barra do painel solto o recolhem até a barra | `ui/shell.ts`, `ui/panel-groups.ts` | o clique simples na aba tem de continuar só escolhendo |
| **5** | **Puxar o vão da tira solta o grupo inteiro**, com as abas dele, flutuando | `ui/panel-groups.ts` (o solto passa a guardar **várias** abas), `ui/shell.ts` | muda o dado guardado no navegador: o arranjo antigo tem de abrir igual |
| **6** | **`Shift+Tab`** esconde só as colunas; a barra de ferramentas fica | `ui/keys.ts` (uma linha), `ui/shell.ts` | o teste de conflito de teclas |
| **7** | **Empilhar:** soltar na borda de baixo de um grupo abre um grupo novo, com a linha azul deitada | `ui/panel-groups.ts` (sai o "dois grupos fixos"), `ui/shell.ts`, `ui/layout-model.ts` | o maior: a coluna deixa de ter dois grupos. `medir` e os arranjos de fábrica |
| **8** | **O botão dos arranjos na barra**, como o seletor de área de trabalho do Photoshop: Pivô · Visualização · os dele · Guardar · Voltar ao padrão | `ui/shell.ts` (barra), `ui/arrangements.ts`, `shell.css` | a barra já está cheia em 1280×720: medir antes |

**Os lotes 1 a 3 resolvem o "presos na parede".** O 4 e o 6 são pequenos. O 5 e o 7 mexem no
dado guardado: cada um sozinho.

---

## 4. O que **não** copiar do Photoshop

| O quê | Por quê |
|:---|:---|
| Painel solto **fora da janela**, em outro monitor | o programa roda no navegador: o painel não sai da página |
| A opção "Auto-Collapse Iconic Panels" nas preferências [⁶](https://photoshoptrainingchannel.com/tips/auto-collapse-panels/) | um interruptor a mais. Fica o padrão do Photoshop: o painel do ícone fecha no clique do ícone, não sozinho |
| A barra escura vazia em cima de cada grupo | come altura, e a medição já falta altura (19 de 26 cabem). O vão da tira faz o papel dela (lote 5) |

---

## 5. Perguntas para o Humberto

| # | A pergunta | A minha suposição |
|:---:|:---|:---|
| 1 | Você disse *"e contextos"*. É a **área de trabalho** do Photoshop — um arranjo de painéis por tarefa (Montar · Animar · Pesos), trocado por um botão na barra? | **sim**. É o lote 8. Os arranjos com nome já existem no menu Janela; falta o botão e os arranjos por tarefa |

O resto o Photoshop responde.


---

## 6. Parte 2, dentro da cerca — os modelos dos lotes 1 a 3 (05/10/2026, 05h04)

Só arquivos NOVOS. Nenhum arquivo que já existia em `editor/` foi tocado.

| Arquivo novo | Lote | O que decide |
|:---|:---:|:---|
| `editor/src/ui/float-fit.ts` | 3 | `fitFloat`: o painel solto inteiro dentro da camada; encolhe se não cabe. `floatInside` para a prova |
| `editor/src/ui/panel-drag.ts` | 1 | o arrasto por ponteiro: clique × arrasto (5 px), a linha azul, o contorno azul do grupo, a sombra do painel, colar de volta pelo mesmo gesto, a frase do rodapé |
| `editor/src/ui/icon-columns.ts` | 2 | a coluna em ícones: a setinha, o ícone abre ao lado e fecha no mesmo, `Esc`, a largura de 40 px, o desenho de cada painel, o que se guarda no navegador, os dois itens cinza do menu |
| `editor/testes/paineis-do-photoshop.test.ts` | 1 a 3 | **34 testes**, 34 verdes (05h04). O primeiro prova que o defeito existia (regra 26): o `clampFloat` de hoje deixa a caixa da foto `37` em `x = -10`, pendurada sobre a linha do tempo |

`npx tsc --noEmit -p editor/tsconfig.json`: limpo, 05h04.

**Uma decisão nova, pelo Photoshop:** a aba largada sobre o **corpo** de outro grupo **cola** nele,
com o contorno azul (o Photoshop realça o grupo inteiro). Hoje ela flutua ali e cai fora da tela.
Sobre o corpo do **próprio** grupo, nada acontece.

### O que falta ligar, arquivo por arquivo (espera o "pode ligar")

| Arquivo | O que muda |
|:---|:---|
| `ui/shell.ts` | **sai o arrasto do navegador** das abas e das tiras (`draggable`, `dragstart`, `drag`, `dragend`, `dragover`, `dragleave`, `drop`, `soltouNaTira`, `previewTabSnap`). Entra `pointerdown` na aba e na barra do solto → `startDrag`; `pointermove` → `moveDrag` + `dropTarget`, que desenha a linha, o contorno ou a sombra, e o rodapé (`dragHint`); `pointerup` → `endDrag`: `colar` reusa o código do `drop` de hoje (com `moveToOtherColumn`) ou `dockFloatingPanel`; `soltar` → `floatPanel` + `setFloatSnap`; `mover` → `setFloatBox`. `Esc` cancela. O `click` da aba continua escolhendo (as provas clicam pela aba); só é engolido depois de um arrasto de verdade. `newFloatBox` e `buildFloating` passam a usar `fitFloat`. Lote 2: a setinha dupla, a faixa de ícones e o painel aberto ao lado |
| `ui/panel-groups.ts` | `setFloatBox` passa a usar `fitFloat` (o `clampFloat` fica para os soltos guardados por versões antigas, ou sai) |
| `ui/shell.css` | a linha azul (3 px), o contorno azul, o cursor de mão fechada; a coluna em ícones (40 px), os botões da faixa, o painel ao lado |
| `ui/actions-table.ts` · `ui/menus.ts` | três ids no menu **Janela → Arrumar**: *Soltar o painel da parede* · *Recolher em ícone* · *Expandir*, cinza com o porquê |
| `ui/shell-drop.ts` | conferir: a aba deixa de ser arrasto do navegador; o `isInternalDrag` não pode passar a confundir |
| `editor/testes/colunas-e-barra.test.ts` | cita `dragstart` 2 vezes: reescrito **de propósito**, pelo nome |
| `ferramentas/provas/medir-paineis.mjs` (6) e mais 3 provas | tocam `.panel-tab`: conferir que só clicam. A coluna em ícones tem de ser medida também |
| **O risco maior** | a setinha `«»` na tira tira largura das abas: a tira pode quebrar em mais uma linha (33 px de altura). **Medir antes e depois** |

---

## 7. Mais modelos, a mesma cerca — lotes 4, 5, 6 e 8 (05/10/2026, 05h11)

Só arquivos novos (e os meus de hoje). **63 testes** em `paineis-do-photoshop.test.ts`, 63 verdes; `tsc` limpo, 05h11.

| Arquivo | Lote | O que decide |
|:---|:---:|:---|
| `ui/panel-fold.ts` | 4 | dois cliques na aba recolhem o grupo (o mesmo que o `▾`); o último grupo aberto não recolhe, e o rodapé diz o caminho. Dois cliques na barra do solto o encolhem até a barra (35 px); a caixa guardada não muda |
| `ui/float-groups.ts` + `ui/panel-drag.ts` | 5 | puxar o **vão** da tira solta o grupo inteiro; colar de volta traz todas as abas, na ordem; a da frente continua à frente. O grupo largado na própria tira ou no próprio corpo: nada |
| `ui/hide-panels.ts` | 6 | `Tab` esconde tudo (como hoje); `Shift+Tab` esconde só as colunas e os soltos, e a linha do tempo fica. Qualquer uma, com algo escondido, mostra tudo. Só o `Tab` se grava |
| `ui/contexts.ts` | 8 | Montar · Animar · Pesos, e o botão na barra (lista, nome em uso, Guardar, Voltar ao padrão do contexto). Pivô e Visualização continuam iguais, no mesmo botão |
| `ui/icon-columns.ts` | 2 | **a casa da setinha `«»`**: na tira de cima se couber nas DUAS colunas; senão, nas duas, na faixa fina do topo (14 px), como o Photoshop. Na tela de fábrica a direita não cabe (seis abas em três linhas): a resposta é **topo** |

### O dado guardado do grupo solto (lote 5)

O solto ganha uma lista: `{ id: 'entidades', tabs: ['imagens', 'entidades', 'pivos'], … }`.

| Quem lê | O que acontece |
|:---|:---|
| este programa, arranjo antigo (sem `tabs`) | solto de uma aba, como hoje |
| o programa de antes ("volta pra 0.5"), arranjo novo | ignora `tabs`; a da frente abre solta, e as outras voltam ao grupo de fábrica (regra 2 do `parseColumnState`). **Provado com o leitor de hoje**: todo painel aparece num lugar só |
| `tabs` torto | o desconhecido e o repetido saem; a da frente fica |

**Um defeito achado no caminho, provado antes do conserto:** o `dockAllFloating` de hoje
devolve só o `id` de cada solto. Com um grupo solto, o "Voltar ao padrão" **perderia** as outras
abas. A casca passa a chamar `dockAllFloatGroups`.

**A marca do solto recolhido** (`recolhido: true`) segue a mesma regra: o leitor de hoje a
ignora e o painel abre aberto (provado).

### Os contextos, painel por painel

| Contexto | Esquerda | Direita | Linha do tempo | Por quê |
|:---|:---|:---|:---:|:---|
| **Montar** | Árvore, Ordem · Propriedades | Imagens, Entidades, Pivôs, Partículas · Skins, Regras | fechada | arrastar a imagem, pendurar no osso, ordem e pivô; skins e regras são da base; na base não há chave |
| **Animar** | Árvore · Propriedades | Animações, Imagens, Entidades · Histórico, Exibição | **aberta** | escolher a animação, pegar o osso, digitar, chavear; Imagens atrás para a troca de imagem na chave, como no Spriter |
| **Pesos** | Árvore · Propriedades | Malha e pesos (75% da altura) · Exibição, Histórico | fechada | o painel mais alto do programa ganha o lugar; a Árvore para escolher o osso |

O que o contexto não cita fica **fechado no lado de fábrica dele**: o menu Janela o reabre em
casa. (O `layoutOf` de hoje põe todos os fechados na esquerda; os contextos não repetem isso.)

### O que falta ligar, a mais da seção 6

| Arquivo | O que muda |
|:---|:---|
| `ui/panel-groups.ts` | o tipo do item solto ganha `tabs?` e `recolhido?`; o `parseColumnState` lê os dois (`readFloatTabs`, `readFold`) |
| `ui/shell.ts` | `dblclick` na aba → `tabDoubleClick`; na barra do solto → `toggleFloatFold` + `drawnFloatBox`; o solto com várias abas desenha a tira dele; `pointerdown` no vão da tira → `startDrag({ kind: 'grupo' })`; "Voltar ao padrão" → `dockAllFloatGroups`; `Tab`/`Shift+Tab` → `hide-panels`; o botão dos contextos na barra |
| `ui/keys.ts` | uma linha: `Shift+Tab` |
| `ui/actions-table.ts` · `ui/menus.ts` | Janela → Arranjos passa a listar Montar · Animar · Pesos em cima |
| `ui/arrangements.ts` | conferir se os contextos entram nas receitas de lá, ou ficam em `contexts.ts` (hoje ficam aqui, para não tocar o arquivo) |
| **O risco maior** | o botão dos contextos na barra, em 1280×720: a barra já está cheia. Medir antes e depois |

---

## 8. Lote 9 — o Propriedades tem chão (05/10/2026, 05h23)

Passado pela rodada 23 (defeito #4 do `07`; K17 e J17 da fila). Modelo em `ui/props-floor.ts`,
9 testes no mesmo arquivo: **72 de 72** verdes, `tsc` limpo, 05h23.

**A causa:** a divisão da coluna é uma fração da altura. A linha do tempo abre, a coluna encolhe,
e o Propriedades encolhe junto, sem chão.

**A régua:** o grupo em que o Propriedades está **à frente** tem chão = tira (37) + ficha rápida.
Cede o **outro grupo da mesma coluna**, até 80 px. A cena e a linha do tempo não cedem nada.

| A ficha, medida nas fotos da 23 | Altura |
|:---|---:|
| com um osso | 190 px |
| com uma imagem (mais a linha Imagem) | 228 px |

| Tela (Detalhes abertos) | Coluna | Propriedades hoje | Com o chão | Árvore fica com |
|:---|---:|---:|---:|---:|
| 1920×1080 | 548 | 174 | **265**, inteira | 275 |
| 1440×900 | 440 | 142 | **265**, inteira | 167 |
| 1280×720 | 342 | 106 | **254** | **80** |

**O que cede em 1280×720** (265 + 8 + 80 = 353; a coluna tem 342):

| Cede | Quanto | Por quê |
|:---|---:|:---|
| a Árvore | de 228 para **80** px | com os Detalhes abertos se anima: o osso se escolhe na cena ou na linha do tempo. O `▾` recolhe a Árvore de vez |
| a ficha de **imagem** | **11 px** (meia linha Alfa, que rola) | o Ângulo fica à vista nas duas; a de osso cabe inteira |
| a linha do tempo | nada | já está abaixo do chão dela nessa tela (237 de 240) |
| a cena | nada | a altura da coluna não muda; o chão da cena (K13) fica intacto |

O chão vale também com a linha do tempo **fechada**: em 1440×900 o Propriedades tinha 198 px
(foto `00` da rodada 4), e a linha Alfa já ficava fora.

**Para ligar** (entra logo depois do lote 3): `ui/shell.ts`, onde a altura dos grupos é escrita
(`groupShares`), passa por `planColumn` com a ficha medida de verdade (o fim da ficha rápida no
painel); sem medida, `propsNeed()`. O `cutNotice` vai ao rodapé uma vez por abertura dos Detalhes.
A alça arrastada à mão não desce abaixo do chão. Fotos nas três telas, antes e depois.

---

## 9. A rodada 4 ligada e fechada — 05/10/2026, 07h03

Oito versões, uma por lote, cada uma com suíte, `tsc`, conformidade, roteiro, medição, `programa/` montado e fotos antes e depois nas duas telas (`backup/fotos-obra/rodada-04/lote-N/`).

| Versão | Lote | O que ele vê |
|:---:|:---:|:---|
| v26.6 | 1 | puxar a aba e o painel vem junto: sombra, linha azul, contorno; colar de volta pelo mesmo gesto; Janela → Arrumar → Soltar o painel da parede |
| v26.7 | 2 | a setinha dupla no topo da coluna: faixa de ícones de 40 px; o ícone abre o painel ao lado |
| v26.8 | 3 | o painel solto não sai da tela: ao soltar, ao mudar o tamanho, e quando a janela encolhe |
| v26.9 | 9 | o Propriedades nunca menor que a ficha rápida: o Ângulo à vista nas três telas; cede a Árvore |
| v27.0 | 4 | dois cliques na aba recolhem o grupo; dois cliques na barra do solto o recolhem |
| v27.1 | 5 | puxar o vão da tira solta o grupo inteiro; cola de volta inteiro |
| v27.2 | 6 | `Shift+Tab` esconde só as colunas; a linha do tempo fica |
| v27.3 | 8 | o botão dos contextos no canto de cima: Montar · Animar · Pesos, Pivô, Visualização, os arranjos |

Suíte: de 4.970 para **4.993**; um vermelho só, o antigo do manual. Medição igual do começo ao fim (30/30 e 21/30).

**Fora da rodada:** o lote 7 (empilhar na borda de baixo), por decisão do Diretor.

### Os defeitos que a minha ligação criou, vistos no uso antes de cada fecho (pela forma)

| Lote | A forma do erro |
|:---:|:---|
| 1 | pus a ação no menu e esqueci a folha de tarefas (`tarefas.test.ts` acusou) |
| 3 | troquei uma linha do `ESTADO.md` com `sed`, e ele reescreveu o fim de linha do arquivo inteiro; desfeito na hora |
| 9 | liguei o aviso de "faltam" pela conta de fábrica, e não pela ficha medida: falso aviso |
| 4 | liguei o `dblclick` sem pensar no `click` que vem antes dele: o segundo par não reabria |
| 5 | desenhei a sombra só para a aba, e não para o grupo |
| 8 | pus o botão sem medir a barra em 1280: o menu "Malha e regras" quebrou em duas linhas |

**O que não está provado por foto:** o canto de mudar o tamanho do solto (lote 3; só pelo teste) e a ficha de uma imagem (lote 9; a foto não trocou a seleção para a imagem).
