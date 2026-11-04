# PLANO rodada 4 — os buracos, conferidos

Data: 10/09/2026. Planejador. Ponto de partida: **v6.3, 2.120 testes, 46/46**.

Entrada: a lista de 27 linhas do Humberto, tirada do manual e dos manuais do Spine e do Spriter.
Cada linha foi conferida no código, na spec e no manual. O resultado está na tabela 1.
Os lotes para o executor estão na seção 3. As decisões que só o Humberto toma, na seção 4.

**Regra que manda neste plano:** campo novo no núcleo do formato é decisão do Humberto (regra 7 da casa).
O executor faz só o que **não** mexe no formato. O resto espera um "sim" dele.

---

## 1. A conferência, linha por linha

| Lista | # | O buraco | Conferido | Veredito |
|:---|:---:|:---|:---|:---|
| Spine | 1 | Malha ligada | §7.5 `linkedmesh`; caso B-104; `editor/src/mesh/linked-mesh.ts` | **Já existe.** Sai da lista |
| Spine | 2 | Ordem de desenho por pele | §4.4: `skin` não tem `drawOrder`. O Spine também não tem: lá é pedido de fórum | **Decisão** D1 |
| Spine | 3 | `skin.bones` só à mão | Manual cap. 3 confirma. `properties-model.ts:767` só marca "Só com a pele" no osso | **Lote 39** |
| Spine | 4 | Caixa e ponto como anexo de slot | No formato **já são** anexos (§7.1, tabela 7.2) e trocam por chave `slot/attachment` e por pele. O editor é que cria **um slot novo** por ponto ou caixa (`AddSlotWithAttachment`) | **Lote 40**, só editor |
| Spine | 5 | Runtimes C, C++, C#, Unity, Godot, Unreal | Compilador não instalado. Ordem dele: "programa primeiro" | **Parado** |
| Spine | 6 | Vídeo direto | Humberto, 10/09: MP4 não; **WebM sim**, pelo `MediaRecorder` do navegador, sem dependência | **Lote 43** |
| Spine | 7 | Exportar trecho ou todas pela janela | Manual cap. 7 confirma. `frameTimes` já tem `from` e `to` | **Lote 41** |
| Spine | 8 | Herança com os cinco modos | §5.3: três combinações reservadas, L1. Apêndice B, decisão 1. Trava a 1.0 | **Decisão** D3 |
| Spine | 9 | Tabela de mistura por par no arquivo | §4.6 só tem `defaultMix` por animação. O runtime tem `AnimationStateData` no jogo | **Decisão** D2 |
| Spriter | 1 | Ponto e caixa animados por quadro | Tabela §9.2: **caixa** anima por `deform`; **ponto** não tem timeline nenhuma | Caixa: já existe. Ponto: **Decisão** D4 |
| Spriter | 2 | Novo → Esqueleto num slot | Passo 5 do runtime do socket | **Parado** |
| Spriter | 3 | Trocar de pai no meio da animação | Apêndice B, decisão 7: **fechada**, fora da 1.0. O importador assa | Nada a fazer |
| Spriter | 4 | Pivô animado por imagem | Mesma família da 3: assado no importador | **Decisão** D5 |
| Spriter | 5 | Pilha de peles em arquivo separado | §2.8 `assets.skins[]` **já existe** desde a v3.2. Falta o runtime (parado) e o editor exportar uma pele como arquivo | Formato: já existe. Editor: **Lote 41** |
| Spriter | 6 | Vários personagens num arquivo | §1: "um arquivo descreve um esqueleto". É escolha | **Decisão** D6 |
| Spriter | 7 | Trocar a imagem em todas as peles | Manual cap. 3 confirma | **Lote 39** |
| Spriter | 8 | Ctrl+arrastar clona, guias, escolher filhos e pais | Duplicar existe (`Ctrl+D`), sem gesto. Guias não existem. Escolher descendentes não existe; `Z` já é Inclinar | **Lote 42** |
| Spriter | 9 | Lip sync do Papagayo, paleta indexada | Nicho | Fora |
| Nenhum | 1 | Fim de animação no arquivo | §4.6 `loop` **já existe** e o editor grava desde a v1.8 | **Já existe.** Sai da lista. Modos a mais (segurar, vai-e-volta) seriam D8 |
| Nenhum | 2 | Animação padrão | Não existe campo nem regra | **Decisão** D7 |
| Nenhum | 3 | Encaixe por nome | §7.9 `point.socket`, §7.11 `socket`, `childSocket`. Formato pronto na v3.1–v3.5. 10 casos em `casos-pendentes/` | Formato: feito. Runtime: **Parado** |
| Nenhum | 4 | Contrato de nomes de animação pai → filho | §7.11 `inheritAnimation`, `baseAnimation` | Formato: feito. Runtime: **Parado** |
| Nenhum | 5 | Animação em arquivo separado, com contrato de rig | §4.8 `rig`, §2.8 `assets.animations[]` | Formato: feito. Runtime: **Parado** |
| Nenhum | 6 | Exportar por pele grava só o `.bone` | `export-skin.ts` confirma. Mas o editor **já grava `.bonez`** (`save-binary.ts`): um arquivo só resolve | **Lote 41** |
| Nenhum | 7 | `fatiar` não lê `.bonez` | `fatiar.mjs:156` recusa de propósito | **Lote 41** |
| Nenhum | 8 | PSD não traz esqueleto | O PSD não tem ossos. Só uma convenção de nome de camada traria | **Decisão** D9 |
| Nenhum | 9 | Assistente e vídeo por passo | Requisito C5 [I] | Fora |

**Placar:** 3 já existem · 4 lotes para o executor (9 linhas) · 9 decisões do Humberto · 6 paradas por ordem dele · 5 fora.

**Atualizado 10/09, depois das respostas dele:** ver a seção 7. Viraram lotes 43 a 45 (editor) e F1 a F4 (formato).

---

## 2. Os que mexem no formato ou no jogo, por esforço

Sem conforto de editor e sem nicho. Do mais barato ao mais caro.

| Esforço | Linha | O que | Quem decide |
|:---:|:---|:---|:---|
| P | Nenhum 7 | `fatiar` ler `.bonez` | executor, lote 41 |
| P | Spine 7 | trecho e todas as animações pela janela | executor, lote 41 |
| P | Nenhum 2 | animação padrão | Humberto, D7 |
| P | Spine 3 | `skin.bones` na tela | executor, lote 39 |
| P | Spriter 7 | trocar imagem em todas as peles | executor, lote 39 |
| M | Nenhum 6 | exportar por pele em `.bonez` com atlas | executor, lote 41 |
| M | Spine 4 | ponto e caixa dentro de um slot | executor, lote 40 |
| M | Spine 2 | ordem de desenho por pele | Humberto, D1 |
| M | Spine 9 | tabela de mistura por par | Humberto, D2 |
| M | Spriter 1 | ponto animado | Humberto, D4 |
| M | Spriter 4 | pivô animado | Humberto, D5 |
| G | Spine 8 | as três heranças reservadas | Humberto, D3, depois uma fase |
| G | Nenhum 3, 4, 5 · Spriter 2, 5 | runtime do socket, dois canais, rig, externos | parado por ordem dele; uma fase nos dois runtimes |
| G | Nenhum 8 | esqueleto do PSD | Humberto, D9 |
| G | Spine 5 | runtimes nas engines | parado; precisa de compilador |

---

## 3. Lotes para o executor

Quatro lotes, um por versão, **v6.4 a v6.7**. Nada aqui toca `formato/`, `runtime/`, `runtime-python/` nem `conformidade/`.
Cada lote: backup antes · testes · `tsc` · conformidade · manual nas duas línguas · `CHANGELOG` · `versao.py`.

### Lote 39 — Peles: `skin.bones` na tela e trocar a imagem em todas (Spine 3, Spriter 7) · v6.4

**O que o Humberto vê**

- Osso ou regra com **Só com a pele** marcada ganha, em Propriedades, a linha **Peles que ativam**: uma caixa por pele. Marcar entra em `skin.bones` ou `skin.constraints`; desmarcar sai.
- Marcar **Só com a pele** com uma pele em edição (o lápis da aba Peles) já entra nessa pele. Sem pele em edição, o rodapé diz: "Marque em que pele, em Propriedades".
- Na Árvore, botão direito num desenho: **Trocar a imagem em todas as peles…** Abre a aba Imagens com a busca no foco; a imagem escolhida troca em toda pele que tiver o mesmo `path` naquele slot.

**Arquivos**

| Arquivo | O que muda |
|:---|:---|
| `editor/src/panels/properties-model.ts` | linha "Peles que ativam" para osso e regra com `skinRequired` |
| `editor/src/panels/skins-model.ts` | `ToggleSkinBone`, `ToggleSkinConstraint`, `SwapImageEverywhere` — três `Command` com `apply` e `revert` exatos |
| `editor/src/panels/tree.ts`, `ui/menus.ts` | a entrada no botão direito e no menu Esqueleto |
| `documentos/manual/03-peles.md` e `en/` | some as duas linhas de "O que ainda não funciona"; entra o passo |

**Funções puras e testes, com valor esperado**

| Teste | Esperado |
|:---|:---|
| `ToggleSkinBone('inverno', 'cape1')` no herói | `skins[inverno].bones` contém `cape1`; `revert` devolve o array de antes, igual texto contra texto |
| Marcar duas vezes | segunda vez tira; nunca duplica o nome |
| `SwapImageEverywhere('body', 'body', 'body_armor')` | toda pele com `attachments.body.*.path == 'body'` passa a `body_armor`; peles sem o slot ficam intactas; `revert` igual |
| Validador depois de `ToggleSkinBone` | zero avisos `skinRequired` sem pele |

**Pronto quando:** as duas linhas saem do manual, cap. 3, e o teste do manual (função citada) passa com os dois itens novos.

### Lote 40 — Ponto e caixa dentro de um slot que já existe (Spine 4) · v6.5

**O que o Humberto vê**

- Com um **slot** escolhido, Novo → Ponto e Novo → Caixa oferecem **"neste slot"**. O anexo nasce no slot, na pele em edição, com a bolinha `○`: não vira o ativo. Sem slot escolhido, faz o de hoje (slot novo).
- A bolinha da Árvore já troca o anexo; a chave `slot/attachment` já grava a troca. Assim ponto e caixa passam a trocar por chave e por pele, como o formato sempre permitiu.

**Arquivos**

| Arquivo | O que muda |
|:---|:---|
| `editor/src/panels/tree-model.ts` | `AddAttachmentToSlot(slot, skin, name, def)`; `AddPoint` e `AddBoundingBox` ganham o caminho "neste slot" |
| `editor/src/viewport/tools/point-tool.ts`, `box-tool.ts` | escolhem o caminho pela seleção |
| `ui/menus.ts` | os dois itens |
| `documentos/manual/02-montar-o-personagem.md` e `en/` | a seção de Ponto e Caixa diz os dois caminhos |

**Testes, com valor esperado**

| Teste | Esperado |
|:---|:---|
| `AddAttachmentToSlot('hand', 'default', 'hand_ponto', point)` no herói | `skins[default].attachments.hand` tem uma chave a mais; `slot.attachment` continua `hand_open`; `slots.length` não muda; `revert` igual |
| Nome repetido no slot | `hand_ponto_2` |
| Chave `slot/attachment` em `hand` com valor `hand_ponto`, runtime de referência | o canal `points` do dump traz `hand/hand_ponto` naquele tempo, e não antes |

**Pronto quando:** um ponto num slot existente troca por chave na linha do tempo, com a tela mostrando a bolinha certa.

### Lote 41 — Exportar: trecho, todas, pacote por pele e `fatiar .bonez` (Spine 7, Nenhum 6, Nenhum 7) · v6.6

**O que o Humberto vê**

- Janela **Exportar imagem…** ganha **De** e **Até** (segundos; nascem `0` e a duração) e a caixa **Todas as animações**. Com a caixa, sai um arquivo por animação: `heroi-walk.gif`, `heroi-attack.gif`.
- Janela **Exportar por pele…** ganha a opção **Pacote `.bonez` com o atlas**: um arquivo só, com o `.bone` fatiado, o `.atlas.json` e o `.png` reempacotados. A frase "meia exportação é pior que nenhuma" deixa de valer, porque é um arquivo.
- `npm run fatiar` aceita `.bonez` na entrada e grava `.bonez` na saída.

**Arquivos**

| Arquivo | O que muda |
|:---|:---|
| `editor/src/io/export-image.ts` | os três campos; `exportPlan(options)` pura, devolve a lista de tarefas |
| `editor/src/io/export-skin.ts` | a opção; monta o pacote com `sliceBoneFile` + `ferramentas/src/atlas/packer.ts` + `png.ts` + `writeBonez` |
| `ferramentas/fatiar.mjs` | lê `.bonez` por `ferramentas/src/binario/ler.ts`; grava `.bonez` se a entrada era |
| `documentos/manual/07-exportar-e-usar-no-jogo.md`, `03-peles.md` e `en/` | somem três linhas de "O que ainda não funciona" |

**Testes, com valor esperado**

| Teste | Esperado |
|:---|:---|
| `exportPlan({ animation: 'walk', from: 0.2, to: 0.5, fps: 10 })` | 3 quadros: `0,2 · 0,3 · 0,4` |
| `exportPlan({ all: true })` no herói | 3 tarefas, nomes `heroi-walk`, `heroi-attack`, `heroi-idle` (os nomes reais das três) |
| `De` maior que `Até` | recusado por escrito; o campo volta |
| Pacote por pele `inverno` | o `.bonez` tem `manifest`, um `.bone`, um `.atlas.json`, um `.png`; regiões do atlas = só as que os anexos que sobraram citam; abre no runtime de referência sem aviso |
| `fatiar heroi.bonez saida --pele inverno` | mesmas contagens de osso, slot e animação que a partir do `heroi.bone`; saída `.bonez` válida no validador |

**Pronto quando:** as três linhas saem do manual e `npm run fatiar -- x.bonez` roda sem a mensagem de recusa.

### Lote 42 — Conforto do Spriter: clonar arrastando, guias, escolher filhos e pais (Spriter 8) · v6.7

**O que o Humberto vê**

- **Ctrl + arrastar** um osso ou desenho escolhido, na ferramenta Mover: clona (o Duplicar do lote 37) e move o clone. Ctrl + arrastar no vazio continua sendo o retângulo que tira da seleção; são dois alvos diferentes.
- **Guias:** arrastar a partir da régua de cima cria guia horizontal; da esquerda, vertical. Mover imanta na guia a 6 px de tela. Exibir → **Guias** (mostrar), **Travar guias**, **Limpar guias**. Vivem em `RECORTE_editor_state.view.guides`, nunca no núcleo.
- Editar → Escolher → **Os filhos** e **Os pais**. A tecla `Z` é de Inclinar: o executor escolhe uma tecla livre na tabela Ajuda → Atalhos e escreve em Desvios qual foi.

**Arquivos**

| Arquivo | O que muda |
|:---|:---|
| `editor/src/viewport/tools/translate.ts` | o `Ctrl` com item embaixo do ponteiro |
| `editor/src/viewport/rulers.ts`, novo `guides-model.ts` | `addGuide`, `snapToGuides(pos, guides, tolerance)` puras; desenho na cena |
| `editor/src/doc/duplicate.ts` | `descendantsOf` já existe; nasce `ancestorsOf` |
| `ui/menus.ts`, `ui/actions.ts`, `panels/view-panel.ts` | itens e caixas |
| `documentos/manual/02-montar-o-personagem.md` e `en/` | gestos e guias |

**Testes, com valor esperado**

| Teste | Esperado |
|:---|:---|
| `snapToGuides(103, [100], 6)` | `100`; com `108` devolve `108` |
| Ctrl + arrastar `arm` 40 px | nasce `arm_2` com o membro, mundo = mundo do `arm` + (40, 0); um passo de desfazer; `arm` não se mexe |
| Escolher os filhos de `arm` | `forearm`, `hand` e os desenhos deles, `arm` incluído |
| Escolher os pais de `hand` | `forearm`, `arm`, `torso`, `hips`, `root` |
| Guias no arquivo | `RECORTE_editor_state.view.guides` tem as guias; o núcleo do `.bone` não muda um byte |

**Pronto quando:** os três gestos estão no manual e em Ajuda → Atalhos, e `auditMenus` continua vazio.

---

## 4. Decisões do Humberto — cada uma em uma frase

Nenhuma destas entra sem um "sim". Cada linha tem a recomendação do planejador.

| # | Linha | A decisão | Recomendação |
|:---:|:---|:---|:---|
| D1 | Spine 2 | Criar `skin.drawOrder` no núcleo? | **Não agora.** O Spine também não tem. Uma timeline `drawOrder` na animação resolve a capa. Reabrir se doer no uso |
| D2 | Spine 9 | Tabela de mistura por par dentro do arquivo? | **Não.** `defaultMix` já é a dica; a tabela por par é do jogo (`AnimationStateData`). Quem vem do Spine põe a tabela no código, como lá |
| D3 | Spine 8 | Fórmula das três heranças reservadas (§5.3) | **Decidir antes da 1.0.** É a decisão 1 do Apêndice B. Depois de escolhida, uma fase: spec, dois runtimes, três casos |
| D4 | Spriter 1 | Timeline para `point` (x, y, rotação)? | **Não.** Sem campo: o editor cria um osso `_ponto` e anima o osso. Se disser sim, é campo novo, dois runtimes e um caso |
| D5 | Spriter 4 | Pivô (âncora) animado por imagem? | **Não.** Mesma família da decisão 7, já fechada. O importador assa |
| D6 | Spriter 6 | Vários personagens num arquivo? | **Não.** Um esqueleto por arquivo é o que o glTF e o Spine fazem. O `.bonez` já embala um personagem com os filhos |
| D7 | Nenhum 2 | Como o visualizador sabe a animação padrão? | **Sem campo:** uma frase na §4.6, "a primeira da lista é a padrão", e a aba Animações ganha "Mandar para o topo". Zero campo, zero caso novo. Se preferir campo, é `skeleton.defaultAnimation` |
| D8 | Nenhum 1 | Modos de fim além de `loop` (segurar, vai-e-volta)? | **Não.** `loop` já cobre "uma vez ou em laço". O resto é do jogo |
| D9 | Nenhum 8 | Convenção no nome da camada do PSD para virar osso (`braço@osso`)? | **Não agora.** É invenção nossa que nenhum Photoshop conhece. O passo 3 do manual é o caminho |

---

## 5. Parado por ordem do Humberto

**MP4 não entra nunca.** WebM entra (lote 43): o navegador grava sozinho. O requisito E5 fecha com GIF, sequência de PNG, folha de sprites e WebM.

"Primeiro vamos finalizar o programa" (09/09/2026). Nenhum chat pergunta de novo até ele liberar.

| Linha | O que | Onde está o que já existe |
|:---|:---|:---|
| Nenhum 3, 4, 5 · Spriter 2, 5 | Runtime do socket, dois canais, rig, animações e peles externas; depois Novo → Esqueleto no slot | Formato pronto (v3.1–v3.5). 10 casos em `conformidade/casos-pendentes/`. Ordem dos passos em `ESTADO.md`, "O que o lote socket fez" |
| Spine 5 | Runtimes nas engines | Precisa de compilador nesta máquina |

Ele diz **"libera o socket"** → o chat de runtime faz a fase pela ordem escrita no `ESTADO.md`.

---

## 6. Ordem de trabalho para o executor

1. Ler `CLAUDE.md`, `editor/src/contract.ts` inteiro, e este plano.
2. Um lote por versão, **39 → 42**, v6.4 → v6.7. Backup antes, com o motivo no nome. Linha no `INDICE.md`.
3. Fecho de cada lote: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · manual nas duas línguas · `CHANGELOG` · `python ferramentas/versao.py N.N "o que mudou"`.
4. A contagem de testes não cai de **2.120**.
5. Botão novo nasce em ícone, com o nome na dica. Tecla tratada uma vez.
6. Item que não bater com o código: parar, escrever em **Desvios**, seguir. Precisou de campo no formato: **não faz**; escreve em Desvios e segue.
7. No fim de cada lote, avisar o Humberto em três linhas: versão, o que entrou, testes.

---

## Desvios

O executor escreve aqui. O que o plano dizia, o que o código pedia, o que ficou.

### Lote 39

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| `properties-model.ts:767` marca "Só com a pele" no osso | A linha 767 é da **regra**. O osso não tinha a caixa | O osso ganhou o grupo **Peles** com a caixa. A regra ganhou a lista embaixo da dela |
| Testes com a pele `inverno` do herói | O herói tem `default`, `armadura`, `armadura_capa` | Os testes usam `armadura` (tem `bones: []` escrito) e `armadura_capa` (sem o campo): os dois casos do `revert`. `inverno` só aparece no teste de várias peles, criada no próprio teste |
| "Validador: zero avisos `skinRequired` sem pele" | O validador não tem esse aviso. O que existe é o contrário: `HINT_SKIN_BONE`, osso **sem** `skinRequired` numa `skin.bones` | O teste confere esse, antes e depois de marcar e de desmarcar. Por isso desmarcar tira o nome de toda pele |
| Menu Esqueleto: "Trocar a imagem em todas as peles…" | 33 letras; a auditoria dos menus aceita 28 | No menu: **Trocar imagem nas peles…**. No botão direito da Árvore, o nome inteiro |
| — | A `default` está sempre ligada | Ela não conta como "pele em edição" e não aparece em **Peles que ativam**, a menos que o arquivo já a cite |

### Lote 40

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| "Com um slot escolhido, Novo → Ponto oferece *neste slot*" | Clicar num desenho na cena escolhe **osso + slot + desenho** juntos. Se "slot escolhido" bastasse, o gesto de todo dia (escolher pela cena e criar) passaria a entrar no slot sem ninguém pedir | A regra é **slot escolhido e nenhum osso** (`shapeTarget`). E nasceram dois itens à vista, **Ponto neste slot** e **Caixa neste slot**, que deixam escolhido só o slot e pegam a ferramenta |
| `AddPoint` e `AddBoundingBox` ganham o caminho "neste slot" | Os dois são "slot novo + anexo" por desenho | Ficaram como estavam. O caminho mora nas ferramentas; o anexo sai de `pointAttachment` / `boxAttachment`, puras, que os dois comandos também usam |
| Teste: `slot.attachment` continua `hand_open` | No herói o slot `hand` mostra `hand` | O teste confere `hand` |
| — | A ferramenta Ponto desenha a alça de **todo** ponto das peles visíveis, ativo ou não (desde o lote 5) | Ficou como estava: é o que deixa arrastar o ponto novo antes de chaveá-lo. Anotado aqui para quem estranhar a alça de um ponto `○` |
| Fecho: `versao.py 6.5` | **Pulado por engano** no fecho do lote 40; visto só ao conferir o `INDICE.md` no fim da rodada | A v6.5 foi **reconstruída depois do lote 42**, das linhas de base "antes do lote 41" (e do cap. 2 "antes do lote 42"), sem os testes dos lotes 41 e 42. Conferido: tem o lote 40, não tem o 41. Única diferença do original: o texto dos Desvios 41 e 42 deste plano |

### Lote 41

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| Saída `.bonez` do `fatiar` "válida no validador" | **O validador de linha de comando não abre `.bonez` nenhum** — nem o `heroi.bonez` que o `converter` grava: lê os bytes do ZIP como JSON e dá "JSON inválido". O validador da web abre | Não mexi no validador: não está no plano. O teste tira o `.bone` e o `.atlas.json` de dentro do pacote e passa os dois pelo validador (2 válidos, 0 com erro). Fica como tarefa à parte: o `validar.mjs` aceitar `.bonez`, como o da web |
| Pacote por pele `inverno` | O herói não tem `inverno` | O teste usa `armadura`. Com `default` junto, as 21 regiões ficam todas — o que o teste confere é que o atlas tem **só** as regiões que os anexos citam, nos dois sentidos |
| O pacote monta com `png.ts` | No navegador não há deflate síncrono, e o `png.ts` pede um | A montagem é pura (`skinPackageFiles`) e recebe quem grava o PNG: no navegador é o **canvas**; no teste, o `png.ts` com o zlib do Node. O corte do atlas é o `repackAtlas` do fatiador, o mesmo da linha de comando |
| `exportPlan({ animation, from, to, fps })` | O plano precisa das animações e do nome base | `exportPlan(opções, animações, base)`. Com **Todas as animações**, De e Até não valem: cada animação sai inteira, e os dois campos ficam cinzas |
| — | A barra da janela Exportar imagem mostrava `quadroâ€¦` (UTF-8 lido como Latin-1) | Consertado para `quadro…`, já que a linha foi reescrita |

### Lote 42

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| "A tecla `Z` é de Inclinar: escolha uma tecla livre" | Letras quase todas tomadas (ferramentas e menus) | **Os filhos = `]`**, **Os pais = `[`**: os colchetes do Photoshop para descer e subir nas camadas. Conferido: nenhum menu, ferramenta ou tratador de tecla usava os dois. Estão em Ajuda → Atalhos, que sai dos menus |
| Editar → Escolher → Os filhos / Os pais | O menu Editar não tinha submenu Escolher | Nasceu, num degrau próprio: a auditoria dos menus aceita no máximo 6 itens entre separadores, e o bloco de seleção já tinha 6 |
| Exibir → Guias, Travar guias, Limpar guias | O bloco "Grade · Réguas · Eixos…" passaria de 6 | As três num degrau próprio do Exibir. No painel Exibição, um grupo **Guias** próprio, e não duas linhas a mais em "A cena": dois testes fixam as listas da cena, e guia não é coisa que a cena mostra sozinha |
| Ctrl + arrastar: "um passo de desfazer" | A pilha **aplica antes de juntar**: juntar dois Duplicar deixaria dois clones | A cada movimento, o clone de antes é desfeito e entra um `CloneDrag` no lugar novo. No fim sobra um passo só. Só na Montagem |
| "Ctrl + arrastar no vazio continua sendo o retângulo que tira" | O retângulo é da ferramenta **Selecionar** (`Q`); o Mover nunca teve retângulo | Nada mudou lá. No Mover, Ctrl em cima de algo **não** escolhido é o arrasto de sempre |
| `descendantsOf` já existe | Existia, mas privado (`subtree`) | Exportado como `descendantsOf`; nasceu `ancestorsOf` |
| Escolher os pais de `hand` | `hand` é um **slot** no herói, no osso `forearm` | De um slot ou desenho, a corrente começa no osso dele. Os pais incluem o próprio osso escolhido, como Os filhos incluem — a lista sai na ordem do arquivo |
| — | Guia já criada não se arrasta sozinha | Fica assim: cria-se pela régua e apaga-se tudo com Limpar guias. Mover uma guia é conforto de outra rodada |

---

## 7. Respostas do Humberto, 10/09/2026

| # | Ele disse | O que vira |
|:---:|:---|:---|
| D1 | "Quero essas duas coisas": ordem de desenho por pele **e** trocar de pai no meio da animação, como o Spriter | **F1** e **F2**, formato. A decisão 7 do Apêndice B **reabre** |
| D2 | Não entendeu | Perguntar de novo, mais simples. Espera |
| D3 | "Se você está dizendo sim, então é sim" | **F3**, formato. O planejador escolhe as fórmulas |
| D4 | Não entendeu | Espera |
| D5 | Não entendeu | Espera |
| D6 | "Qual o sentido? Por que limitar?" | Explicar. Espera |
| D7 | "1 da lista" | **F4** (uma frase na spec) + **lote 44** (editor: Mandar para o topo) |
| D8 | Quer que no jogo a animação sem laço toque uma vez e espere | **Já é assim.** `animation-state.ts:532` segura a última pose e avisa `isComplete`. O tocador do editor repete de propósito (v4.8) |
| D9 | PSD com uma camada de linhas por cima, e as linhas viram ossos | **Lote 45**, ferramentas + editor. Sem campo novo |
| — | WebM sim, MP4 não | **Lote 43** |

### Lotes 43 a 45 — executor, depois do 42

#### Lote 43 — WebM pela janela Exportar imagem · v6.8

- Formato novo na lista: **Vídeo WebM**. O editor toca a animação num canvas fora da tela e o `MediaRecorder` grava; sai um `.webm`. Chrome, Edge e Firefox. Sem dependência.
- A janela diz: "O tempo é o do relógio do navegador, não quadro a quadro. Para quadro exato, use a sequência de PNG."
- Navegador sem `MediaRecorder`: o item fica cinza com o motivo na dica.
- Só no editor: a linha de comando não tem navegador, e a mensagem do `ffmpeg` continua lá.
- Teste puro: `webmPlan({ duration: 1.0, fps: 30, loops: 2 })` → grava 2,0 s; `canRecordWebm(env)` devolve `false` sem `MediaRecorder` e `true` com `video/webm` suportado. Manual cap. 7 e `CHANGELOG`.

#### Lote 44 — a primeira da lista é a padrão · v6.9

- Aba Animações: botão em ícone **Mandar para o topo** (e Editar → no menu), com a dica "A primeira da lista é a que o jogo abre". `Command` `MoveAnimationToTop` com `revert` exato.
- A aba marca a primeira com um sinal discreto e a palavra "padrão" na dica.
- Teste: `MoveAnimationToTop('attack')` → `animations[0].name == 'attack'`, a ordem das outras não muda; `revert` igual texto contra texto.
- A frase na spec é F4, do chat do formato. O executor não toca `formato/`.

#### Lote 45 — ossos desenhados no PSD · v7.0

A convenção, que vai para o manual cap. 2 com uma imagem:

| O que ele desenha | O que vira |
|:---|:---|
| Uma camada chamada **`ossos`** (ou dentro de um grupo `ossos`), por cima de tudo | Só esta camada é lida como esqueleto; ela **não** vira desenho |
| Cada **linha** dessa camada | Um osso: da base à ponta |
| Uma **bolinha** gorda numa das pontas da linha | A base do osso (onde ele gira). Sem bolinha: a ponta mais perto do osso pai |
| Uma linha cuja base **encosta** noutra linha (até 12 px) | Filho daquela |
| A linha que ninguém encosta | Raiz. Duas raízes: as duas viram filhas de `root` |
| Nome do osso | `osso_1`, `osso_2`… de cima para baixo; ele renomeia depois |
| Cada camada de desenho | Presa ao osso cuja linha mais **cobre** o desenho; nenhuma cobre: o mais perto do centro |

- Puro, em `ferramentas/src/importar/psd-bones.ts`: `strokesFromLayer(pixels, w, h)` → componentes conexos → esqueletizar → dois extremos → segmento com base; `hierarchyFromStrokes(segments)`; `assignLayersToBones(layers, segments)`. `psdToBoneFile` ganha a opção `bonesLayer`.
- Pelo menu e pela linha de comando (`--ossos`), com o mesmo módulo.
- Testes com valor esperado: camada sintética com três linhas em cadeia (quadril → tronco → cabeça) e bolinhas na base → 3 ossos, `osso_2.parent == osso_1`, `osso_3.parent == osso_2`, ângulos até 1°; uma camada de desenho sobre o tronco → `slot.bone == osso_2`; a camada `ossos` não vira slot; PSD sem camada `ossos` → o de hoje, byte a byte.
- `heroi.psd` ganha a camada `ossos` gerada por `montar-psd.mjs` a partir dos ossos do herói, e `conferir-arte.mjs` mede a volta: pai igual em 18 ossos, ângulo até 2°.

### Lotes F1 a F4 — o chat do formato

Ordem: **F4 → F1 → F3 → F2**, do menor para o maior. Cada um: spec, schema, runtime TypeScript, runtime Python, casos de conformidade, `comparar-runtimes`, Apêndice A com origem "Humberto 10/09", versão. **Nenhum número de versão repete**: olhar o `INDICE.md` antes de cada `versao.py`, porque o executor grava versões ao mesmo tempo.

#### F4 — animação padrão, sem campo

§4.6, uma frase normativa: "A **primeira** animação de `animations` é a padrão: é a que um visualizador **DEVERIA** abrir e a que um jogo **PODE** tocar sem pedir nome." Gravador que quer outra padrão reordena. Zero campo, zero caso. Apêndice A.

#### F1 — `skin.drawOrder`

| nome | tipo | obrig. | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `drawOrder` | `{slot, offset}[]` | não | `[]` | Deslocamentos sobre a ordem de setup enquanto a skin está ativa. Mesmo formato e mesma conta da timeline `drawOrder` (§9.5) |

- Ordem de aplicação: setup → `drawOrder` das skins ativas, na ordem de ativação (`includes` antes) → timeline `drawOrder` da animação, por cima. Slot que a skin cita e não existe: L1 `REF_SLOT_MISSING` (§4.7).
- Schema, os dois runtimes, caso **C-280** (capa vestida vai para a frente; timeline por cima; troca de skin devolve).
- Editor, depois (executor): na aba Ordem com uma pele em edição (lápis), mover grava na pele e a aba diz "Ordem da pele X".

#### F3 — as três heranças reservadas

Fórmulas propostas pelo planejador, a partir da parte linear `A` do pai, decomposta em `A = R(θ) · F · S`, com `θ` a rotação do pai, `F = diag(1, sinal(det A))` a reflexão e `S` o resto (escala e cisalhamento):

| `inheritRotation` | `inheritScale` | `inheritReflection` | o filho herda | modo novo |
|:---:|:---:|:---:|:---|:---|
| false | true | true | `F · S` (tira só a rotação) | `noRotation` |
| true | true | false | `R(θ) · S` (tira só a reflexão) | `noReflection` |
| false | false | true | `F` (só a reflexão) | `onlyReflection` |

- Conferir que os cinco modos do Spine saem da mesma decomposição, com a mesma `θ`; se não sair igual até 1e-6, parar e escrever em Desvios. Três casos, **C-283 a C-285**, com pai refletido e cisalhado. A tabela 5.3 perde a palavra "reservada"; o validador para de marcar L1. Apêndice B, decisão 1: fechada.

#### F2 — trocar de pai no meio da animação

- Timeline `bone`, propriedade **`parent`**, valor `string` (nome do osso) ou `null` (= pai de setup), **só `stepped`**, `mode: "add"` proibido (L1). Entra na tabela §9.2 com nível B.
- Semântica, a do Spriter: a partir da chave, os valores locais das outras timelines do osso (`x`, `y`, `rotation`, …) são **medidos a partir do novo pai**. O runtime não converte nada.
- Ordem de cálculo: quando um `parent` aplicado muda, o runtime refaz a ordem pai-antes-de-filho (§5.6) **naquele quadro**, e guarda até mudar de novo. Ciclo (osso vira pai de um ancestral): a chave é ignorada, aviso uma vez, L2 `PARENT_CYCLE`.
- Volta ao setup (§5.1) devolve o pai de setup. Constraints que apontam para o osso continuam apontando.
- Casos: **C-281** (mão troca de pai no meio, mundo conferido antes e depois), **C-282** (laço: no fim volta ao pai de setup), **C-286** (ciclo ignorado).
- Importador do Spriter: para de assar; grava a chave `parent`. O `--assar` fica como opção.
- Apêndice B, decisão 7: **reaberta e fechada** em 10/09 pelo Humberto.
- Editor, depois (executor): em Animando, o `Reparent` grava a chave `parent` + as chaves locais convertidas (`L' = P'⁻¹ · W`) em vez de voltar para a Montagem. A Árvore mostra o pai daquele tempo.

### Respostas do Humberto, segunda rodada, 10/09/2026

| # | Ele disse | O que vira |
|:---:|:---|:---|
| D8 | Ao clicar numa animação enquanto toca, a atual **roda até o fim** e a nova começa do começo. Duas opções, em Configurações, para não confundir com o laço | **Lote 46** |
| D2 | Trocar de animação é do jogo, sem tabela por par. Mas quer uma caixa **"Tempo de mistura"** em Configurações | **Lote 46**. Sem campo novo: a caixa grava o `defaultMix` (§4.6) de todas as animações |
| D4 | "Está envolvido com o pivô. Ignora por enquanto, vejo depois. Anota para não esquecer" | **Adiada**, junto com D5. Anotada em `PENDENCIAS 2026-09-09.md`. Ninguém implementa ponto animado até ele voltar nisso |
| D5 | Pediu a outro chat | **Fechada, 10/09/2026.** Decisão 19: pivô por região do atlas. Feita nos lotes 55 e 56 (v8.0 e v8.2), `PLANO pivô e Animando 2026-09-10.md` |
| D6 | "1 personagem por arquivo" | **Fechada.** Fica como a §1 diz. Nada muda |
| — | "Quem executa é o chat executor" | Confirmado. F3 e lote 46 vão para ele |

#### Lote 46 — Configurações: ao trocar de animação, e o tempo de mistura · v7.3 ou o próximo livre

**O que o Humberto vê**

Na janela **Arquivo → Configurações do projeto…**, dois campos novos:

| Campo | Opções | Onde mora |
|:---|:---|:---|
| **Ao trocar de animação tocando** | `Terminar a atual antes` (padrão) · `Trocar na hora` | `RECORTE_editor_state`: é do tocador, não do personagem |
| **Tempo de mistura**, em segundos | número; `0` = troca seca | grava `defaultMix` em **todas** as animações, um `Command` só. O campo mostra o valor comum, ou "vários" quando diferem |

- Com **Terminar a atual antes**: clicar noutra animação enquanto toca marca ela como **próxima** (a aba Animações mostra "próxima" na dica e um sinal na linha). Quando a atual chega ao fim, a próxima entra em `0` e segue tocando. Parado: troca na hora, como hoje.
- O tocador do editor passa a **misturar** na troca, pelo tempo de mistura, nos dois modos: usa o `AnimationState` do runtime, o mesmo da Prévia. Assim a caixa se vê na cena, e o jogo lê o mesmo número do arquivo.
- A dica dos dois campos diz: "Isto é do tocador e da mistura. Repetir é outra coisa: é o botão Repetir e o `loop` do arquivo."

**Arquivos**

| Arquivo | O que muda |
|:---|:---|
| `editor/src/anim/transport.ts` | `switchPlan(state, playing, current, next, mode)` pura; a fila da próxima; a mistura na troca |
| `editor/src/panels/animations-model.ts` | `SetDefaultMixAll(seconds)`, `apply` e `revert` exatos |
| `editor/src/ui/shell.ts` | os dois campos em `projectSettings()` |
| `documentos/manual/01-abrir-o-recorte.md` (configurações) e `04-animar.md`, e `en/` | os dois campos |

**Testes, com valor esperado**

| Teste | Esperado |
|:---|:---|
| `switchPlan` modo `terminar`, tocando `walk` em 0,4 s, clique em `attack` | `{ queued: 'attack' }`; `walk` continua; ao passar de `duration` → `{ switchTo: 'attack', time: 0 }`, ainda tocando |
| `switchPlan` modo `na-hora`, tocando | `{ switchTo: 'attack', time: 0 }` na hora |
| `switchPlan` parado, qualquer modo | troca na hora |
| `SetDefaultMixAll(0.2)` no herói | as três animações com `defaultMix == 0.2`; `revert` devolve cada uma ao que tinha, inclusive a que não tinha o campo |
| Campo com valores diferentes | mostra "vários"; aplicar sem mexer não grava nada |

**Pronto quando:** os dois campos estão no manual e o Repetir continua fazendo o que fazia.

#### Lote 47 — Transformar: mover, girar e escalar numa ferramenta só, como o Spriter · próximo número livre

Pedido do Humberto, 10/09: *"projeta um sistema para mover, girar e escalar como é no Spriter. Pode ser o 4º botão, que liga os outros ao mesmo tempo."*

**Como o Spriter faz** (print `pesquisa/nova pesquisa/spriter/prints/05-por-sprite-na-cena_204.jpg`): o objeto escolhido ganha uma **caixa tracejada** com **quadradinhos** nos quatro cantos e no meio dos quatro lados, o **pivô** (bolinha vermelha) e uma **haste** que sai do pivô com uma **bolinha branca** na ponta. Arrastar por dentro move. Arrastar a bolinha da haste gira. Arrastar um quadradinho escala. Não se troca de ferramenta.

**O que o Humberto vê**

| Gesto | Faz | Mesma conta de |
|:---|:---|:---|
| Arrastar **dentro** da caixa | Mover | `translate.ts` |
| Arrastar a **bolinha da haste** | Girar em volta do pivô. `Shift`: passos de 15° | `rotate.ts` |
| Arrastar um **canto** | Escalar nos dois eixos. `Shift`: proporção | `scale.ts` |
| Arrastar o **meio de um lado** | Escalar num eixo só | `scale.ts` |
| Clicar | Escolher. `Shift` soma, `Ctrl` tira | `select.ts` |
| Arrastar **fora** da caixa | Retângulo de seleção | `select.ts` |
| Botão direito | Continua como está: volta à ferramenta anterior | — |

- Ferramenta nova **Transformar**, ícone com nome na dica, tecla **`T`** (livre: `Q W E R Z B N O X M G` estão tomadas). Entra em `TOOL_ORDER` logo depois de `select`, e passa a ser a **ferramenta de partida** ao abrir o programa. Mover, Girar, Escalar e Inclinar continuam na barra, para quem prefere o jeito do Spine.
- A caixa é o contorno de **mundo** do que está escolhido: de um desenho, os quatro cantos da região ou da malha; de um osso, o comprimento por uma espessura fixa de tela; de vários, a caixa que envolve todos, com o pivô no **primeiro** escolhido, como o Girar já faz. A haste sai do pivô no sentido do eixo X do objeto, com 60 px de tela.
- Os quadradinhos e a bolinha têm **14 px** de tela (`HANDLE_PIXELS`), como as alças que já existem. O cursor muda por zona (`cursorClass`): mover, girar, escalar.
- O rodapé diz o gesto enquanto arrasta: "Mover", "Girar 37°", "Escalar X 1,4".
- Eixos (Local · Pai · Mundo) e as três caixas de Compensar valem igual, porque a conta é a das três ferramentas.
- Um passo de desfazer por arrasto, com o nome do gesto.

**Arquivos**

| Arquivo | O que muda |
|:---|:---|
| novo `editor/src/viewport/tools/transform-tool.ts` | a ferramenta; guarda as três de dentro e **repassa** `onDown/onMove/onUp` para a que o gesto escolheu |
| novo `editor/src/viewport/transform-box.ts` | puro: `transformBox(doc, selection)` → caixa, pivô, haste, oito alças, em mundo; `transformHit(point, box, tolerance)` → `'move' \| 'rotate' \| { scale: 'n' \| 'ne' \| … } \| 'outside'` |
| `translate.ts`, `rotate.ts`, `scale.ts` | nada de conta nova; se precisar, o começo do arrasto ganha um ponto de entrada que a ferramenta nova chama |
| `ui/toolbar-model.ts`, `ui/icons.ts` | ordem e ícone |
| `viewport.ts` | ferramenta de partida |
| `documentos/manual/02-montar-o-personagem.md`, `04-animar.md` e `en/` | o gesto vira o primeiro que o manual ensina; foto antes e depois, como as outras seis |

**Testes, com valor esperado**

| Teste | Esperado |
|:---|:---|
| `transformHit` numa caixa (0,0)–(100,50), pivô (0,25), haste até (60,25)+60 | `(50,25)` → `move`; ponta da haste ±7 px → `rotate`; `(100,50)` → `{ scale: 'se' }`; `(100,25)` → `{ scale: 'e' }`; `(300,300)` → `outside` |
| Arrastar por dentro de (50,25) a (70,25) no `arm` | o arquivo fica **igual, texto contra texto**, ao que Mover deixa com o mesmo arrasto |
| Arrastar a bolinha da haste 90° | igual ao Girar: `rotation` +90 |
| Arrastar o canto para o dobro da distância do pivô | igual ao Escalar: `scaleX` 2, `scaleY` 2; com `Shift`, proporção |
| Meio do lado direito | só `scaleX` muda |
| Arrastar fora | retângulo de seleção, mesma seleção que Selecionar dá |
| Cada arrasto | **um** comando no histórico, com o nome do gesto |
| Abrir o programa | a ferramenta ativa é `transform`; `auditMenus` vazio; Ajuda → Atalhos lista `T` |

**Pronto quando:** mover, girar e escalar o herói sem trocar de ferramenta, e o manual mostra a caixa com as alças.

### Desvios dos lotes 43 a 45 e F1 a F4

#### Lote 43

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| `webmPlan({ duration, fps, loops })` | As voltas precisam de um lugar na janela | Nasceu o campo **Voltas no vídeo** (1 a 100), só à vista com WebM. Não é o `loop` do GIF: o GIF repete ao tocar, o vídeo grava as voltas |
| "O editor toca a animação num canvas fora da tela e o `MediaRecorder` grava" | Posar o esqueleto no relógio faria a física (§6.5) e o corte da borda dependerem do engasgo da máquina | Os quadros saem prontos antes, como no GIF. O canvas **toca a sequência**, e o quadro da vez sai do relógio: um tique atrasado pula quadro, não estica o vídeo |
| `canRecordWebm(env)` | O motivo tem de ir para a dica | `webmSupport(env)` devolve o tipo (vp9, depois vp8, depois `video/webm`) ou o motivo. `canRecordWebm` é o `ok` dele. Canvas sem `captureStream` também é não |
| — | O `Ctrl+Shift+E` repete as últimas opções | Repete o WebM também. Sem gravador, a recusa escrita sai na barra de estado |
| — | O vitest roda sem navegador | A gravação de verdade não tem teste automático. Conferida à mão no navegador do app: `idle`, 2 voltas, saiu `heroi.webm` de 530.309 bytes, `video/webm` |
| Lote 43 = v6.8 | O chat do formato gravou a **v6.8** (F4) antes | O lote 43 é a **v6.9**. Os lotes 44 e 45 pegam o próximo número livre na hora |

#### Lote 44

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| "e Editar → no menu" | As ações da lista de animações moram no menu **Animação** (Nova, Duplicar, Renomear, Apagar) | **Animação → Mandar para o topo**, logo depois de Apagar. O menu Editar não ganhou nada |
| — | O bloco Nova…Repetir já tinha 6 itens; a auditoria dos menus aceita no máximo 6 | Um separador novo: Mudar duração e Repetir ganharam um degrau próprio |
| "um sinal discreto" | — | Uma estrelinha **★** na frente do nome, cor fraca. A dica da linha diz "padrão" e a frase do botão |
| — | Clicar com a primeira já aberta | Não empilha passo de desfazer: a barra diz "já é a primeira" |
| O ícone | — | O `ordem-topo` da aba Ordem (a seta que bate no teto): o mesmo gesto, a mesma figura |
| Lote 44 = v6.9 | A v6.9 foi o lote 43 (a v6.8 foi do F4). A v7.0 o chat do formato gravou segundos antes: o `versao.py` recusou, como devia | O lote 44 é a **v7.1**. O lote 45 pega o próximo livre na hora |

#### Lote 47

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| `transformHit`: `(100,50)` → `{ scale: 'se' }` | O plano contou y para baixo; no mundo do `.bone` y sobe (§3.3) | `(100,50)` → `{ scale: 'ne' }`. Os nomes seguem o mundo: `n` é o lado de cima. Os outros quatro valores da tabela batem |
| `transformBox(doc, selection)` | A espessura da caixa de um osso e a haste de 60 px são medidas de tela: precisa do zoom | `transformBox(doc, scale)`, que lê a seleção do documento. `boxFromCorners` monta uma caixa com números, para o teste |
| "A caixa é o contorno de mundo" | O Escalar mede o ponteiro nos eixos do osso (Eixos: Local · Pai · Mundo). Uma caixa reta na tela com o Escalar em eixos girados daria "canto" e "lado" que não batem com o que escala | A caixa é medida nos mesmos eixos do Escalar: em Local, ela gira com o osso. Com um desenho sozinho, os eixos da tela, que é como o Escalar mede um desenho. Um desenho escolhido junto com o osso entra na caixa |
| Meio de lado = um eixo, "nenhuma conta nova" | O Escalar sempre escrevia os dois eixos | O Escalar ganhou a trava de eixo (`setAxisLock`), o "ponto de entrada" que o plano previa: com ela, só a chave daquele eixo é gravada. Sem ela, nada muda |
| Clicar = escolher; fora = retângulo | Descer em algo não escolhido, fora da caixa | Escolhe e já move, o gesto do Spriter. No vazio, o retângulo |
| Cursor por zona | A cena só avisava a ferramenta com o botão apertado | O contrato ganhou `onHover?`, opcional; a cena chama sem botão, e o cursor muda |
| Ajuda → Atalhos lista `T` | A tabela saía só dos menus, e nenhuma ferramenta mora em menu: `W`, `E` e `R` também não apareciam | A tabela ganhou as linhas das ferramentas, no grupo "Ferramentas" (`toolShortcutRows`) |
| — | `lote26-inclinar-e-escalar.test.ts` fixava os cinco primeiros da barra | Agora os seis, com o Transformar em segundo |
| "Um passo de desfazer", texto contra texto | Desfazer um Escalar num osso sem `scaleX` escrito grava o `1` que valia. É o Escalar de antes, sozinho também | O teste confere os números nesse caso. O texto contra texto vale para cada gesto contra a ferramenta de sempre |
| Foto antes e depois | O script de fotos tira todas de uma vez | Ganhou um filtro no terceiro argumento. Só as duas do Transformar foram tiradas |

#### Lote 46

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| `switchPlan(state, playing, current, next, mode)` | A conta só precisa de: tocando, a atual, a clicada, o modo | `switchPlan(playing, current, next, mode)`. A chegada ao fim é outra conta pura, `arrivalPlan` |
| "Mora em `RECORTE_editor_state`" | As opções de ver já moram lá, e já viajam no arquivo e no navegador | Campo `switchMode` nas opções de ver (`view.switchMode`) |
| Dois campos em `projectSettings()` | A janela de campos só tinha caixa de texto | O `askForm` ganhou campo de lista (`choices`). A troca é uma lista de duas opções escritas |
| "misturar usando o `AnimationState`" | Quem posa o esqueleto do editor é o `Doc` | `EditorDoc.crossfade?`, opcional, no contrato. Durante a mistura o `Doc` posa por um `AnimationState` com as duas entradas; fora dela, como sempre. A que sai continua andando enquanto se apaga |
| — | Clicar na própria atual, tocando em "terminar" | Tira a fila |
| — | Tocando para trás (`Shift+Espaço`) | A fila espera: a próxima só entra tocando para a frente |
| — | Pausar com uma próxima na fila | Pausar tira a fila e a mistura: parado, a troca é na hora |
| — | Voltar à Montagem e Trocar de pai também chamam `switchAnimation` | Sem dizer o modo, troca na hora, como sempre. Só a aba Animações passa o modo das Configurações |
| Manual cap. 1 nas duas línguas | O cap. 1 em inglês não tem a tabela do menu Arquivo | Só a linha em português ganhou os dois campos. O cap. 4 e o cap. 7 têm os dois nas duas línguas |

#### Lote 45

| O plano dizia | O código pedia | O que ficou |
|:---|:---|:---|
| `heroi.psd` ganha a camada `ossos`, gerada pelo `montar-psd.mjs` | O `heroi.psd` mora em `formato/exemplos/`, pasta do chat do formato (aviso de 10/09: o executor não toca). E o teste do lote 36 lê esse arquivo | **Não regravei.** O `montar-psd.mjs --ossos` grava `heroi-ossos.psd`; o teste grava numa pasta temporária. Sem `--ossos`, o `montar-psd` ainda dá o `heroi.psd` igual, byte a byte (conferido). Para gravar o exemplo: `node ferramentas/montar-psd.mjs --ossos`, quando o Humberto liberar |
| `conferir-arte`: "pai igual em 18 ossos" | Dois não voltam pelo desenho. O cabelo nasce a 24 px da linha da cabeça (a regra é 12). O `hand_target` é alvo de IK e mora na ponta do antebraço: pelo desenho, é filho dele | **16 de 18**, e o teste diz quais são os dois. Ângulo: pior 1,64° (o pé de trás), dentro dos 2° |
| "esqueletizar → dois extremos" | Uma linha por mancha: o eixo principal dos pixels é mais exato que um esqueleto de 1 px | Mancha que é uma faixa reta: eixo principal. Mancha com linhas que se tocam: Hough, com o eixo refeito pelos pixels de cada trecho. Bolinha no meio de uma reta corta a reta |
| "Duas raízes: as duas viram filhas de root" | — | Uma raiz só também vira filha de `root`: o arquivo sempre tem `root` na origem, como o importador sempre fez. A corrente dá `root`, `osso_1`, `osso_2`, `osso_3` |
| "`osso_1`, `osso_2`… de cima para baixo" | O teste do plano chama o quadril, que fica embaixo, de `osso_1` | Da raiz para as pontas; irmãos de cima para baixo, depois da esquerda para a direita |
| — | Na bacia do herói, quadril, tronco e pernas nascem no mesmo ponto, e o braço de trás passa a 10 px dela | Regra nova, no manual: bases juntas com uma **bem mais curta** (metade ou menos) — a curta é o pai. Sem uma curta, são irmãs e procuram o pai fora. O centro só aceita pai pela ponta de outra linha |
| "Pelo menu" | O **PSD…** de sempre não pode mudar: sem a camada `ossos`, o arquivo sai igual | Item novo **Arquivo → Importar → PSD com ossos…**. O PSD… de sempre avisa quando acha uma camada `ossos` |
| — | Osso de comprimento zero (alvo de IK) não tem linha | O `montar-psd --ossos` desenha 16 px na direção dele. A raiz na origem não é desenhada: é o `root` do importador |
| — | Acrescentar com ossos mexe em `bones` | O desfazer do Importar PSD guarda `bones` também nesse caso |
| — | `lote-menus.test.ts` conta os filhos dos submenus do Arquivo: "+ 6" | Agora "+ 7" (Importar 4, Exportar 3), com a conta escrita no comentário. O que o teste prova — separador não é entrada — não mudou |
| Lote 45 = v7.0 | A v7.0 e a v7.2 são do chat do formato (F1 e F2); a v7.1 é o lote 44 | O lote 45 é a **v7.3** |

**Executor, 10/09/2026: o PSD… de sempre pula a camada `ossos`, v7.8.** Pedido do planejador, pela regra do lote 45 ("ela não vira desenho"). Sem a opção, a camada fica de fora do atlas e dos slots, com um aviso. O `heroi.psd` pelo importador de sempre: 19 slots, zero da camada `ossos`, um aviso. O efeito anotado na v7.7, logo abaixo, deixou de existir.

**Executor, 10/09/2026, depois do lote 47: `heroi.psd` regravado, v7.7.** 36 camadas (19 desenhos, 17 ossos), 5 grupos, mesma tela. Teste do lote 36 passa; PSD com ossos: 0 px na arte, 16 de 18 pais, 1,64°. Efeito que o plano não previa: o **PSD…** de sempre agora traz as 17 linhas como desenho (com o aviso). O manual cap. 00 e o `leiame.md` passaram a mandar usar **PSD com ossos…** para o exemplo.

**Planejador, 10/09: o `heroi.psd` pode ser regravado pelo executor.** É arquivo gerado, não do Humberto, e o chat do formato parou: a regra "não toca `formato/`" era para não colidir. Backup datado antes, linha no `INDICE.md`, `conferir-arte` depois. Os 16 de 18 ficam: os dois que faltam estão explicados e o manual diz a regra da base encostada. Os dois desvios do F3 (virada do esqueleto e os três ramos na IK de 1 osso) estão aprovados: seguem o teste que a §5.4 já fazia.

#### F4

| O plano dizia | O que ficou |
|:---|:---|
| v6.8 | v6.8, como previsto. Só a frase na §4.6 e o Apêndice A 67. |

#### F1

| O plano dizia | O código pediu | O que ficou |
|:---|:---|:---|
| Versão seguinte | O executor gravou a v6.9 no meio; o script recusa número repetido | F1 é a **v7.0** |
| "aplicada entre a ordem de setup e a timeline" | Faltava dizer de onde a timeline mede depois que a skin mexeu | Nasceu o nome **ordem base** (§4.4): array + skins ativas. A timeline mede da base, e `[]` volta para a base. O C-280 prende os dois |
| Caso C-280 com "troca de skin devolve" | A sonda ativa as skins uma vez por caso; não dá para trocar no meio | Provado em `runtime/testes/ordem-por-pele.test.ts` (4 testes), não no caso |
| Runtime TypeScript | `applyDrawOrder` recebia um `Int32Array` calculado no loader sobre a ordem do array; não servia para a base | Recebe a lista `{slot, offset}` e aplica sobre `Skeleton.baseDrawOrder`. Um teste antigo de `animation.test.ts` chamava a assinatura velha e foi ajustado (mesma expectativa, contagem não caiu) |

#### F3 — PARADO, esperando o planejador

**A conferência pedida reprovou.** Os cinco modos do Spine **não** saem da decomposição `A = R(θ)·F·S` do plano, com `θ` o ângulo da primeira coluna e `F = diag(1, sinal det)`. Medido com um pai de rotação 35°, escala (2, −0,7), cisalhamento (20°, −10°), e um filho com rotação 30°, escala (1,3, 0,8), cisalhamento (5°, 7°):

| Modo | Spine (§5.4) vs. decomposição do plano | Maior diferença |
|:---|:---|---:|
| `normal` | igual | 2e-16 |
| `onlyTranslation` | igual | 0 |
| `noRotationOrReflection` | `S` do plano é triangular superior e guarda o cisalhamento; o Spine constrói uma matriz **simétrica** `R(θ)·diag(‖c₁‖, |det|/‖c₁‖)·R(−θ)` e joga o cisalhamento fora | **1,39** |
| `noScale` | o Spine normaliza a coluna `A·(cos r, sin r)` **depois** de aplicar a rotação do filho: a rotação herdada depende do cisalhamento do pai e da rotação do filho, não é `R(θ)` | **0,37** |
| `noScaleOrReflection` | idem, sem a reflexão | **0,85** |

Sem cisalhamento e sem reflexão no pai (escala 2 × 0,7), as diferenças continuam: 0,97 / 0,37 / 0,37. Só com escala uniforme as duas contas coincidem. Ou seja: **as fórmulas do Spine não vêm de uma decomposição única**, e adotar `R·F·S` para as três reservadas daria uma família de oito modos em que cinco seguem uma regra e três seguem outra.

O que este chat propõe ao planejador, para fechar a decisão 1 do Apêndice B sem trair a §5.4 (toda fórmula ali é porte do Spine, e o C-230 e o A-010 já prendem os números):

| Modo novo | Construção, na linha das cinco que existem | Mudança na fórmula |
|:---|:---|:---|
| `noRotation` (f, t, t) | O `noRotationOrReflection` do Spine **com o sinal do determinante**: `s = (pa·pd − pb·pc) / (pa² + pc²)` em vez de `|…|`. Tira a rotação, guarda escala, cisalhamento simétrico e reflexão | uma linha |
| `noReflection` (t, t, f) | O `normal` com o pai **desrefletido**: se `det(pai) < 0`, usa `[pa, −pb; pc, −pd]` (nega a segunda coluna, como o `noRotationOrReflection` já faz com a coluna reconstruída). O eixo X do filho continua colado ao do pai; só a mão troca | duas linhas |
| `onlyReflection` (f, f, t) | O `onlyTranslation` com a reflexão do pai: se `det(pai) < 0`, `lb = −lb`, `ld = −ld`. Sem rotação, sem escala, o filho vira do avesso junto com o pai | duas linhas |

As três são conferíveis à mão e caem no mesmo A-010 estendido (mesmo pai `[0 1; 2 0]`, três ossos a mais). Se o planejador aprovar, o F3 é um lote curto: §5.3 e §5.4, `inheritMode` nos dois runtimes, o validador e o loader param de marcar reservada, casos C-283 a C-285, Apêndice B 1 fechada. Se preferir a decomposição `R·F·S` mesmo assim, a §5.4 precisa ganhar um parágrafo dizendo que os três modos novos **não** são da família do Spine, e o C-230 continua valendo para os cinco antigos.

**Nada do F3 foi escrito na spec, no schema nem nos runtimes.** A reserva (§5.3, L1) continua como estava.

**Planejador, 10/09/2026: aprovada a opção (a).** Os três modos novos nascem na linha das cinco fórmulas do Spine, como na tabela acima. A decomposição `R·F·S` do plano fica anulada: a medição provou que ela não é a família da §5.4. O F3 segue: §5.3 e §5.4, `inheritMode` nos dois runtimes, validador e loader sem a reserva, casos C-283 a C-285, Apêndice B 1 fechada.

**Humberto, 10/09: quem executa é o chat executor, em tudo.** O F3 passa para o executor, depois do lote 45. É a **única exceção** à regra "o executor não toca `formato/`" deste plano, e vale só para o F3.

**Executor, 10/09/2026: F3 feito, v7.5.** 53 de 53 nos dois runtimes; os dois concordam campo a campo.

| O brief dizia | O código pedia | O que ficou |
|:---|:---|:---|
| Reflexão do pai = "`pa·pd − pb·pc < 0`" | Com o esqueleto virado pelo jogo (`sx` ou `sy` negativo), o pai sai com determinante negativo sem ser refletido. Os três modos desvirariam o personagem inteiro | `flip = (det < 0) != ((sx < 0) != (sy < 0))`: o teste que o `noScale` já fazia na §5.4. Com `sx = sy = 1` é a conta do brief. Testado: esqueleto com `scaleX` −1 não desvira ninguém |
| IK: o brief não citava | A `ik1` (§6.2) escolhe o ramo pelo modo, e os três caíam no fallback | Os três ganharam ramo na IK de 1 osso, na spec e nos dois runtimes. `onlyReflection` mira como `onlyTranslation` (só o eixo Y vira); `noReflection` usa o pai desrefletido, medido do próprio osso; `noRotation` usa o `s` com sinal. Testado nos dois runtimes: `noReflection` e `onlyReflection` acertam a mira até 1e-6 |
| A volta (5.5) dos três | `noRotation` herda a volta do `noRotationOrReflection` do Spine, que não é inversa exata com o pai refletido | Ficou assim, porque é a mesma família. `noReflection` e `onlyReflection` voltam exatos (testado; com cisalhamento no filho nem o `normal` volta exato — é a decomposição da 5.5) |
| "Validador e loader param de marcar reservada" | O validador de linha de comando e o do site nunca tiveram o código `RANGE_INHERIT_RESERVED`; só o loader avisava | Saiu o aviso do loader e a linha da §12.3. O schema não citava a reserva: não mudou, e o validador do site não precisou ser montado de novo |
| Caso com cisalhamento "se couber" | Coube | O C-284 tem um segundo pai com `shearY` 30 e reflexão |
| — | Dois testes antigos conferiam o fallback (`runtime/testes/loader.test.ts` e `runtime-python/testes/test_esqueleto.py`), e um terceiro a lista dos oito (`skeleton.test.ts`) | Viraram testes dos modos novos, com os valores do C-283 a C-285 |
| — | `runtime/testes` não entrou no backup de antes | Editei `skeleton.test.ts` e `loader.test.ts` sem cópia antes. A linha de base foi tirada do zip da v7.4 para `backup/runtime-testes_2026-09-10_antes-do-F3/` |
| — | O manual cap. 5 dizia "as três ainda não têm fórmula" | A linha saiu, nas duas línguas |

#### F2

| O plano dizia | O código pediu | O que ficou |
|:---|:---|:---|
| Ordem F4 → F1 → F3 → F2 | O F3 parou na conferência (acima); o executor gravou a v7.1 no meio | F2 feito antes do F3. Versão **v7.2** |
| "o importador do Spriter para de assar" | O importador nunca converteu nada: escolhia o pai mais usado e avisava (`spriter.ts`, `buildRig`). Não havia bake para tirar | Nasceu `collectParentKeys` em `mainlineTimelines`: cada chave da mainline cujo `bone_ref.parent` (ou `object_ref.parent`) não é o pai do arquivo vira uma chave `parent`; `null` quando volta. `--assar` mantém o comportamento antigo, com o aviso antigo. A linha da §13.3 foi corrigida junto: dizia "convertida para o espaço do pai fixo", e isso não acontecia |
| Só spec, schema, runtimes, casos | `AnimationState` (mistura por tracks) e o driver também percorrem as timelines de osso | Os dois ganharam o caso `bone.parent`: com alpha ≥ 0,5 aplica; `blend: setup` devolve o pai do arquivo. `gltf.ts` só ganhou o nome do tipo na lista de "não exporta" |
| Casos C-281, C-282, C-286 | O C-281 precisava provar a ordem de cálculo, não só o pai | O pai novo (`pack`) vem **depois** da mão no array e está animado: sem refazer a ordem, a mão sai com o `pack` velho. Está no leiame |
| — | Nenhum aviso de runtime existia no `Skeleton` (só `nestedWarnings`) | `Skeleton.warnings` + `warnOnce` nos dois runtimes, para o `PARENT_CYCLE`. Testado em `trocar-de-pai.test.ts` |
