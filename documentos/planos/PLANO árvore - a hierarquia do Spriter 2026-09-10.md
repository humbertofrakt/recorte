# PLANO árvore — a Hierarquia do Spriter · 10/09/2026

Planejador → executor. Um lote, **64**, médio, só bolo. Entra depois do 63a e do 63.

## O que o Humberto disse, 10/09/2026, com a foto da Árvore

> "Essa árvore horrorosa. Quero igual ao Spriter. **São três listas que não dizem nada: que osso manda em qual peça?** Não dá para saber, está tudo separado."

Ele tem razão. A Árvore de hoje (`buildTree`, `tree-model.ts` 247–253) são três seções: **Ossos**, **Slots (ordem de desenho)**, **Desenhos**. O desenho está numa lista, o osso dele noutra. A pergunta "quem manda em quem" não tem resposta na tela.

## Como o Spriter faz

Painel **Hierarchy** (pesquisa: "a árvore de pais e filhos", lateral esquerda). **Uma árvore só**: o osso tem por baixo os ossos filhos **e os sprites** dele, aninhados. Sprite sem pai fica no nível de cima. Cada linha tem o ícone (ossinho ou miniatura da imagem), o nome, olho e cadeado. Arrastar uma linha para cima de outra troca o pai. Duplo clique renomeia. A ordem de desenho é **outro** painel, o Z-Order (a nossa aba **Ordem**, que fica como está).

## Lote 64 — uma árvore só

**Modelo puro** `tree-model.ts`: `buildTree` deixa de devolver seções e passa a devolver **linhas aninhadas**, `hierarchyRows(file, skin)`:

| Regra | Como |
|:---|:---|
| Raiz | invisível (lote 60a). Os ossos filhos de `root` e os desenhos soltos ficam no **nível 0** |
| Osso | linha com ícone de osso e nome; por baixo, **primeiro os desenhos** dele, depois os ossos filhos, cada um com os seus. Recuo por nível |
| Desenho | **uma linha por slot** do osso, com a **miniatura** do anexo ativo na pele em edição, o nome do slot. Ponto, caixa, máscara e malha têm o ícone deles no lugar da miniatura. Slot vazio nesta pele: miniatura apagada, nome em cinza |
| Regras (IK, caminho…) | continuam na aba **Regras**. Somem da Árvore |
| Peles | continuam na aba **Peles**. Somem da Árvore |
| Contagens `Ossos 5` | somem |
| Dobrar | cada osso com filhos tem o triângulo; o estado de dobra fica no navegador, por arquivo |
| Busca | a caixa de hoje continua; ao buscar, a árvore abre até cada acerto |

**Gestos (todos já existem, só mudam de lugar):**

| Gesto | Faz | Onde já está |
|:---|:---|:---|
| Clique | escolhe o osso ou o desenho (o slot + anexo ativo), como hoje | `selectionForRow` |
| Arrastar linha para cima de um osso | vira filho dele, sem mover | `Reparent`, lote 34 |
| Arrastar desenho para cima de um osso | idem | lote 34 |
| Arrastar para o **vazio** no fim | vira solto (raiz) | novo caso do mesmo `Reparent` |
| Duplo clique no nome | renomeia | `renameBoneEverywhere` / `renameSlotEverywhere` |
| Olho e cadeado | ver e travar, como hoje | |
| Botão direito | o menu de hoje, menos **Virar filho de…** (lote 63a) | `openFloatingMenu` |
| P segurado + clique numa linha | vira filho do osso escolhido, igual à cena | lote 63a |

**O que a aba Ordem ganha:** nada. É o Z-Order do Spriter. A linha "Slots (ordem de desenho)" saiu da Árvore porque já mora lá.

| Teste | Esperado |
|:---|:---|
| `hierarchyRows(heroi, 'default')` | nenhuma linha `root`; `hips` no nível 0; `torso` sob `hips` (nível 1); o desenho do slot `torso` sob o osso `torso` (nível 2), **antes** de qualquer osso filho de `torso`; nenhuma linha de seção, regra ou pele |
| dois desenhos soltos na raiz | nível 0, depois dos ossos de nível 0 |
| slot `hand` com `mao_aberta` na pele `default` e `mao_fechada` em `armadura` | a linha mostra a miniatura da pele em edição; trocar a pele em edição troca a miniatura |
| slot sem anexo nesta pele | linha presente, em cinza |
| busca `mao` | só o caminho até `mao` fica aberto: `hips › torso › arm › forearm › hand` |
| arrastar `hand` (osso) para `torso` | `hand.parent = torso`, posição de mundo igual, um passo de desfazer |
| arrastar o desenho `cape` para o vazio | `slot.bone = root`, mundo igual; a linha vai para o nível 0 |
| `lote31`, `lote34`, `lote0` | expectativas ajustadas; contagem não cai |

**Pronto quando:** olhando a Árvore, dá para dizer que osso manda em qual peça, sem clicar em nada.

## Ordem de trabalho

Backup antes (a pasta `editor/src/panels` inteira); INDICE; contagem não cai; ícone com nome na dica; tecla tratada uma vez; `tsc`; `conformidade.mjs`; CHANGELOG; `versao.py`. Manual pausado. Três linhas ao Humberto.

## Desvios

### Lote 64 — v10.2

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| Teste com `mao_aberta` e `mao_fechada` | O herói não tem esses nomes | Um arquivo pequeno de teste com os dois. No herói, o que a `armadura` não tem vem da `default` (§4.4) |
| Busca `mao` → `hips › torso › arm › forearm › hand` | O herói não tem `mao`; `hand` casa também com `hand_target` e `hand_back` | Busca `blade` → `hips › torso › arm › forearm › sword_blade` |
| Arrastar `hand` (osso) para `torso` | No herói, `hand` é slot. `arm` e `forearm` estão numa regra de IK | Arrastado o osso `leg`, que não tem regra: o teste mede só a troca de pai |
| Arrastar o desenho `cape` para o vazio | A capa são dois slots | `cape_upper` |
| "Miniatura do anexo ativo na pele em edição" | Com nomes diferentes por pele, o `slot.attachment` só vale numa delas | `slotDrawing`: o desenho do slot nesta pele; senão o primeiro desenho do slot nesta pele; senão o da `default`; senão a linha fica cinza |
| Clique "escolhe o slot + anexo ativo" | — | `selectionForRow` escolhe os dois. A linha também acende quando só o desenho está escolhido, que é o que o clique na cena escolhe |
| Soltar em cima de outro desenho | Antes, slot sobre slot mudava a ordem de desenho | Na árvore única não faz nada: a ordem mora na aba Ordem. O `treeDropAction` puro continua como era (lote 63a) |
| P segurado + clique numa linha | O P só era ouvido pela cena | A Árvore ouve o P também (tecla tratada uma vez), e o clique com o P não tira o foco da cena. `selectTool.grabFromTree` faz o mesmo passo do clique na cena |
| A bolinha ●/○ de cada desenho | Não cabe em uma linha por slot | Saiu. Trocar o desenho do slot: campo Anexo das Propriedades, ou o botão direito na cena. O recado do Ponto e da Caixa num slot diz isso |
| Imagem do painel Imagens solta numa linha | — | Linha com desenho: troca a imagem dele. Linha cinza: entra no slot como desenho novo |
| `lote31`, `lote34`, `lote0` ajustados | Esses não liam a Árvore | Reescritos os que liam: `paineis`, `lote27`, `lote28`, `lote60a`, `lote63a` e `lote40`. Cópia em `backup/lote64_2026-09-11_antes/editor-testes/` |
| Pronto quando dá para ver quem manda em quem | — | Roteiro **14 de 14**: o passo 7, "Árvore: quem manda em quem", passou. 22 de 22 medições cabem. Fotos em `backup/fotos-lote64_2026-09-11/` |
