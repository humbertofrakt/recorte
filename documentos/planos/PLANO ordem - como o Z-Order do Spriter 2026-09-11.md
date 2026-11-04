# PLANO ordem — como o Z-Order do Spriter · 11/09/2026

Planejador → executor. Um lote, **66**, pequeno, só bolo. Entra depois do 64.

## O que o Humberto disse, 11/09/2026

> "ORDEM: olha o manual do Spriter."

## O que a aba Ordem já tem do Spriter (lote 16)

Lista plana, miniatura, o de cima na frente, arrastar muda, pastas. Só desenho entra.

## O que falta, pelo manual do Spriter (pesquisa: `01 Spriter Pro`, seção "Z-order"; `todas as funcoes`, linha 72)

| Spriter | Recorte hoje | Passa a |
|:---|:---|:---|
| **Ctrl + ↑ / ↓**: sobe ou desce o sprite uma posição, **na cena**, sem abrir painel | só arrastando na aba Ordem, ou pelos botões dela | as quatro teclas valem na cena e na aba, com desenho escolhido |
| **Ctrl + ← / →**: manda para o fundo / para a frente | idem | idem |
| A ordem é **por quadro-chave**: mudar a ordem em Animando muda só a partir daquela chave | a aba Ordem mexe sempre no `slots` (setup), mesmo em Animando (`MoveSlot`) | em Animando com Gravar sozinho ligado, a mudança vira **chave `drawOrder`** no tempo atual (§9.5, o alvo `drawOrder` do `keying.ts` já existe). Gravar desligado: recusa por escrito, como toda propriedade. Em Montagem, o array, como hoje |
| **Edit → Copy Z-order To All Keyframes** | não existe | **Editar → Copiar a ordem para toda a animação**: a ordem de agora vira a única chave `drawOrder`, em 0; as outras chaves de ordem da animação saem. Um passo de desfazer |
| A aba mostra a ordem **do quadro atual** | mostra o setup | em Animando mostra a ordem posada no tempo atual; linha movida por chave ganha um losango pequeno na dica |

## Funções puras, com teste

| Função | Esperado |
|:---|:---|
| `stepOrder(order, names, dir)` em `draw-order-model.ts`: `order = [a, b, c, d]` (o último na frente) | `(['b'], 'frente-1')` → `[a, c, b, d]`; `(['b'], 'fundo-1')` → `[b, a, c, d]`; `(['b'], 'frente')` → `[a, c, d, b]`; `(['b'], 'fundo')` → `[b, a, c, d]`; dois escolhidos vizinhos sobem juntos e mantêm a ordem entre si; já no topo → igual, e a função devolve `moved: false` |
| `offsetsFor(base, wanted)`: a chave `drawOrder` a partir da ordem base (§4.4) e da desejada | `base [a,b,c,d]`, `wanted [a,c,b,d]` → `[{slot:'c', offset:-1}]` (ou o equivalente mínimo que o runtime devolve a mesma ordem); ida e volta pelo runtime: `applyDrawOrder(base, offsets) === wanted` |
| Ctrl+↑ em Montagem | `slots` muda; nenhuma animação muda |
| Ctrl+↑ em Animando, `walk`, t = 0,4, Gravar ligado | `slots` **não** muda; `walk` ganha timeline `drawOrder` com uma chave em 0,4; a pose em 0,4 tem a ordem nova e em 0 a antiga; `revert` por texto |
| Gravar desligado | recusa; rodapé com o motivo; nada muda |
| Copiar a ordem para toda a animação | `walk` fica com uma chave `drawOrder` em 0, igual à ordem atual; outras chaves de ordem somem; `idle` intocada; um passo de desfazer |
| Tecla | `Ctrl+↑` num campo de texto **não** mexe na ordem (tecla tratada uma vez); na cena e na aba Ordem sim |

Botões da aba Ordem ganham as teclas na dica: *Subir uma (Ctrl+↑)*. Ajuda → Atalhos lista as quatro.

**Pronto quando:** com o braço de trás escolhido na cena, Ctrl+→ traz para a frente; em Animando, só daquela chave em diante; e Editar → Copiar a ordem para toda a animação deixa a animação inteira com essa ordem.

## Ordem de trabalho

Backup antes; INDICE; contagem não cai; `tsc`; `conformidade.mjs`; CHANGELOG; `versao.py`; remontar programa/. Manual pausado. Depois, rodar o **ROTEIRO dos 30 minutos** e anotar.

## Desvios

### Lote 66 — v10.3

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| `Editar → Copiar a ordem para toda a animação` | Nome de menu tem no máximo 28 letras (a auditoria dos menus) | **Copiar a ordem na animação**. A frase inteira fica na dica |
| As quatro teclas valem na cena | Ctrl+↑ e Ctrl+↓ já eram as marcas da linha do tempo (menu Animação) | Na cena, com desenho escolhido, a tecla é da ordem. Sem desenho escolhido, ela passa e continua sendo das marcas |
| Ctrl+← / → para fundo e frente | Frente e fundo de tudo eram Ctrl+Shift+↑ / ↓ desde o lote 35 | Os botões da aba dizem Ctrl+→ e Ctrl+←. Ctrl+Shift+↑ / ↓ continuam valendo |
| "Com o braço de trás escolhido, Ctrl+→ traz para a frente" | No herói, `arm_back` está na pasta `atras`; frente de tudo leva o pedaço da pasta inteiro (lote 35) | A pasta `atras` inteira vai para a frente, na ordem dela. Ctrl+↑ e Ctrl+↓ andam uma casa, sozinhos |
| "`walk` ganha timeline drawOrder com uma chave em 0,4" | O `walk` já tem linha de ordem (0 · 0,25 · 0,75) | Ganha a chave em 0,4; em 0 fica a antiga. O "começo se guarda sozinho" foi testado no `idle`, que não tinha linha de ordem: ganha `[]` em 0 e a chave nova |
| `offsetsFor` mínimo | — | Uma entrada por slot que mudou de casa; depois sai cada uma que não faz falta. Conferido contra o algoritmo do runtime e contra a pose do runtime |
| A ordem base (§4.4) | O runtime põe por cima a `drawOrder` das peles | `baseOrder` aplica a da `default` e a das peles visíveis. O `includes` de pele não entra (o herói não tem) |
| Arrastar na aba Ordem em Animando | Antes mexia no array, mesmo em Animando | Em Animando, o arrasto faz a mesma conta sobre a ordem do quadro e vira chave. Em Montagem, `MoveSlot` e `MoveFolder`, como sempre |
| Onde a ação Copiar mora | A aba Ordem só existe quando montada | A cena registra a ação (ela está sempre montada). A conta fica no modelo (`runCopyOrderToAnimation`) |
| Roteiro dos 30 minutos | — | **14 de 14**. Prova na cena, com teclas de verdade num Chrome sem janela: **8 de 8**. 22 de 22 medições; console limpo. Foto e script em `backup/fotos-lote66_2026-09-11/` |
