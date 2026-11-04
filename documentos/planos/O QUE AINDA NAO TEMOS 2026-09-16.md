# O que ainda não temos — 16/09/2026

Pesquisador 1 · `PESQUISA 1 · pesquisa-1` · responde ao DIRETOR · animador-f6.
Encargo: `documentos/planos/O QUE AINDA NAO TEMOS - encargo 2026-09-15.md`.
Data da máquina: 16/09/2026 — por isso o nome do arquivo (regra 20).

**Documento, não código.** Nada foi escrito em `editor/src`. Nenhuma versão.

---

## Resumo em uma tela

| Parte | O que tem aqui | Número |
|:---|:---|:---|
| 1 · O que falta do Spine | 470 funções, uma por linha, veredito conferido no código | igual **56** · diferente **211** · falta **163** · não se aplica **36** · não confirmei **4** |
| 2 · Partículas | o emissor campo por campo, com nomes de Godot, Unity e Effekseer | 12 tabelas · 1 caso de conformidade com número exato · 7 decisões |
| 3 · De fora | funções de outros programas que não temos, com fonte | Spine 4.3, Rive, Live2D 5, Harmony, Moho, IA |
| 4 · Grade em perspectiva | como os editores de tilemap fazem, e o gesto para nós | presets, ímã, losango do pé |

**"Diferente" é o maior número, e isso é bom sinal:** a função existe, o caminho
é outro (quase sempre porque seguimos o Spriter). Cada linha diz em que difere.

### Os buracos grandes do Spine, em blocos

| Bloco | O que falta | Formato já tem? |
|:---|:---|:---|
| Anexo **caminho** (path) | tudo: criar, editar, fechar, velocidade constante, inverter | sim (§7.8, §6.4) — falta porta |
| Caixa e máscara (clipping) | editar os cantos: criar, apagar vértice | sim (§7.6, §7.7) — falta porta |
| **Sliders** | a regra que toca uma animação por um valor | sim (§6.6, §8.2) — falta porta, e há defeito (abaixo) |
| **Sequência de imagens** | chave de sequência, na região e na malha | sim (§7.10, §9.6) — falta porta |
| Eventos de **áudio** | caminho, volume, painel de áudio, evento visível na cena | sim (§8.6) — falta porta |
| Física | Simular, Reiniciar, Global | sim (§6.5) — falta porta |
| Curvas (Graph) | presets Automático/Plano/Quicar, Favor, Store, alças, caixa de seleção | em parte |
| Pesos | Soldar, Trocar, copiar e colar pesos, ferramenta Direta | não precisa de campo novo |
| Métricas | contagem de ossos, slots, vértices, área | só editor |
| Linha do tempo | Offset, Adjust, Sync, filtros; tocar **sem interpolar** (pose a pose) | só editor |
| Exportar | APNG, PSD, JPEG, vídeo | só editor |
| Atlas | ninepatch, desempacotar | ver §10 do formato |

---

## Defeitos achados no caminho (regra 21)

Não são "falta": são o programa **dizendo coisa errada**. Conferi os quatro no
código nesta rodada.

| # | Defeito | Onde |
|:---:|:---|:---|
| 1 | Propriedades da **caixa** e da **máscara** dizem *"arraste com a ferramenta Malha"*. A Malha só pega `mesh`: os cantos não se mexem | `editor/src/panels/properties-model.ts:798,828` · `editor/src/mesh/mesh-doc.ts:80` |
| 2 | A regra **Comando** (driver) criada pela janela nasce com `targets: []` e não faz nada. Com "Animação" preenchida, o runtime a ignora. A lista não avisa | `editor/src/panels/rules-model.ts:321` · `runtime/src/loader.ts:1515-1517` |
| 3 | Física: **Inércia** mostra `1` quando o arquivo não tem o valor. Formato e runtime usam `0,5` | `editor/src/panels/properties-model.ts:1007` · `runtime/src/data.ts:359` |
| 4 | **Escala de referência** mostra `1` quando o arquivo não tem o valor. O formato diz `100` (§4.1) | `editor/src/panels/properties-model.ts:1052` · `formato/ESPECIFICACAO 2026-09-06.md:489` |

---

## Parte 1 — o que falta do Spine

Fonte: `documentos/pesquisa/nova pesquisa/spine/Spine - todas as funcoes 2026-09-08.md`,
gesto conferido no PDF oficial ao lado. Sem internet nesta parte.
Caminhos curtos (`panels/…`, `ui/…`, `io/…`) moram em `editor/src/`.

| Valor | Quer dizer |
|:---|:---|
| **igual** | existe, e o gesto é o mesmo |
| **diferente** | existe, o caminho é outro |
| **falta** | não existe |
| **não se aplica** | e o porquê |
| **não confirmei** | procurei e não achei com certeza |

**Regra da tabela:** todo "igual" e todo "diferente" aponta arquivo e linha,
abertos nesta rodada. Onde não deu, está escrito "não confirmei" ou "não conferi".

Nota comum da §8: no Recorte **não há botão de chave ao lado do campo**. A chave nasce pelo Gravar sozinho (A) ou por Chavear (K). Isso vale para quase toda linha "diferente" da §8.

### §1 Começar

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Trying and purchasing | §1 Começar (spine-getting-started) | Baixar a versão de teste; comprar na loja; e-mail com a licença | não se aplica | Compra e teste pago são do Spine. O Recorte é aberto, não tem loja |
| Activation | §1 Começar (spine-getting-started) | Digitar o código de ativação na primeira vez; precisa de internet | não se aplica | Licença do Spine. O Recorte não tem ativação |
| Running Spine | §1 Começar (spine-getting-started) | Lançador: escolhe idioma e versão, clica Start; "Start automatically" | diferente | Dois cliques em `programa/Abrir o editor.bat` (linha 15, `node servidor.mjs`). Sem lançador, sem escolher idioma nem versão |
| Spine editor versions | §1 Começar (spine-getting-started) | No lançador: Latest stable, Latest beta, ou versão específica | falta | Não há escolha de versão do editor. `ferramentas/versao.py` só guarda cópias em `backup/versoes/`, não abre versão antiga |
| Welcome to Spine | §1 Começar (spine-getting-started) | Tela de boas-vindas: exemplos, abrir/criar, notícias, dicas | diferente | Botões no meio da cena vazia: Abrir pasta, Importar PSD, Abrir o herói, Começar vazio — `viewport/welcome-model.ts:36-60`. Somem no primeiro osso. Sem notícias nem dicas |
| Finding help | §1 Começar (spine-getting-started) | Fórum, documentação, contato | diferente | Ajuda → Manual (F1), Atalhos (Shift+F1) — `ui/menus.ts:871-872`. Só o manual local; sem fórum |
| Keeping up-to-date | §1 Começar (spine-getting-started) | O Spine avisa quando há versão nova | falta | Nenhum aviso de versão nova no editor |

### §2 Interface

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Main menu | §2 Interface (spine-ui) | Clicar no logo do Spine, canto superior esquerdo, ou Alt+F | diferente | Barra de sete menus: Arquivo, Editar, Exibir, Esqueleto, Animação, Janela, Ajuda — `ui/menus.ts:892-898`. Não é um logo; Alt+F não conferido |
| Titlebar buttons | §2 Interface (spine-ui) | Botões ao lado do logo: abrir, salvar, desfazer, refazer, boas-vindas. Arrastar "abrir" mostra os recentes. Shift+salvar = salvar como | diferente | Barra de ações: Novo, Abrir, Salvar — `ui/action-bar-model.ts:137-141`; Desfazer, Refazer, Recortar, Copiar, Colar, Apagar — `action-bar-model.ts:150-158`. Falta: arrastar Abrir para recentes, Shift+Salvar, botão de boas-vindas |
| Opening projects | §2 Interface (spine-ui) | Ctrl+O, recentes no menu, arrastar o arquivo para a janela, exemplo da tela inicial | igual | Abrir Ctrl+O `ui/menus.ts:199`; Abrir recente `menus.ts:212`; Abrir o herói `menus.ts:225`; soltar arquivo na janela `ui/shell-drop.ts:41-60` |
| File dialogs | §2 Interface (spine-ui) | Caixa de arquivo própria: recentes, estrela, filtro por digitação, colar caminho | diferente | Usa a caixa do navegador/sistema: `showOpenFilePicker`, ou `<input type="file">` — `io/open-save.ts:172-209`. Sem estrela nem filtro próprio |
| Views | §2 Interface (spine-ui) | Arrastar a aba move o painel; borda muda tamanho; caixa "Views" no canto reabre | diferente | Arrastar a aba move e descola — `ui/shell.ts:788-800`. Reabrir é pelo menu Janela — `ui/menus.ts:755-768`, não por caixa no canto |
| Tree | §2 Interface (spine-ui) | Árvore de tudo; propriedades do item embaixo da árvore, com duplicar/renomear/apagar | diferente | Árvore em `panels/tree.ts`. Propriedades é aba separada (`menus.ts:758`), não fica embaixo da Árvore |
| Viewport | §2 Interface (spine-ui) | A cena; barra de ferramentas embaixo | diferente | A cena em `viewport/viewport.ts`; a barra fica em cima — `viewport/viewport-toolbar.ts:1-8` |
| Panning | §2 Interface (spine-ui) | Botão direito arrastando; ou J + arrastar | diferente | Botão do meio, ou Espaço + arrastar — `viewport/viewport.ts:1160-1162`. O botão direito volta à ferramenta anterior — `viewport.ts:1130-1137` |
| Zooming | §2 Interface (spine-ui) | Roda do mouse; slider; Ctrl+F = 100%; Ctrl+Shift+F = caber o esqueleto | diferente | Roda igual — `viewport/viewport.ts:900,1282-1288`. 100% é Ctrl+0 (`ui/menus.ts:448`); Ajustar Ctrl+Shift+F igual (`menus.ts:449`). Campo de zoom digitável em vez de slider — `viewport/zoom-model.ts:26-33` |
| Setup/animate mode | §2 Interface (spine-ui) | Clicar no ícone do canto superior esquerdo da cena | igual | Interruptor "Montagem \| Animando" na ponta esquerda da barra — `ui/action-bar-model.ts:98-106`; também Ctrl+Tab — `ui/menus.ts:641-646`. Regra do modo em `anim/pose-mode.ts:1-28` |
| Undo/redo | §2 Interface (spine-ui) | Ctrl+Z; Ctrl+Shift+Z ou Ctrl+Y; botões na barra de título | igual | Ctrl+Z e Ctrl+Y — `ui/menus.ts:278-288`; Ctrl+Shift+Z — `ui/keys.ts:146`; botões — `ui/action-bar-model.ts:151-152` |

### §3 Esqueleto

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Properties | §3 Esqueleto (spine-skeletons) | Escolher o esqueleto na Árvore mostra as propriedades | diferente | Aparece com nada escolhido: nome, fps, arte em pixel, área de desenho, escala de referência — `panels/properties-model.ts:1034-1055`. Sem caixa "Export" nem hash |
| Export | §3 Esqueleto (spine-skeletons) | Desmarcar Export: o esqueleto não sai em nenhuma exportação | não se aplica | Um `.bone` tem **um** esqueleto só (spec §2.2). Não há outro esqueleto no projeto para deixar de fora |
| Reference scale | §3 Esqueleto (spine-skeletons) | Campo nas propriedades do esqueleto, usado pela física | igual | Campo "Escala de referência" — `panels/properties-model.ts:1052`; spec §3.5. **Atenção:** o campo usa padrão `1` quando o arquivo não escreve o valor, mas a spec §4.1 diz `100` (e `doc/new-file.ts:36` grava 100). Arquivo sem o campo mostra número errado |
| Skeleton draw order | §3 Esqueleto (spine-skeletons) | Arrastar esqueletos na Árvore muda quem desenha na frente | não se aplica | Um esqueleto por arquivo (spec §2.2). Esqueleto dentro de esqueleto vai como anexo, na ordem dos slots (§7.11) |
| Hiding skeletons | §3 Esqueleto (spine-skeletons) | Bolinha de visibilidade ao lado do esqueleto | não se aplica | Um esqueleto por arquivo (spec §2.2). Não há outro para esconder |

### §4 Ossos

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Bone transforms | §4 Ossos (spine-bones) | Posição, rotação, escala, cisalhamento; mexer pelas ferramentas; o filho herda | igual | Campos X, Y, Rotação, Escala X/Y, Inclinação X/Y — `panels/properties-model.ts:651-661` (grupo "Posição e forma", linha 652); ferramentas em `viewport/tools/` |
| Creating bones | §4 Ossos (spine-bones) | Ferramenta Create; ou escolher o pai e "New… Bone", que nasce na PONTA do pai | diferente | Ferramenta Criar osso (N) — `viewport/tools/create-bone.ts:397-473`. "Novo → Osso" nasce na ORIGEM do pai, não na ponta — `panels/tree-commands.ts:59-78`, `ui/menus.ts:485` |
| Transform inheritance | §4 Ossos (spine-bones) | Caixas Inherit: Rotation, Scale, Reflection | igual | "Herda rotação / escala / espelhamento" — `panels/properties-model.ts:663-669` |
| Length | §4 Ossos (spine-bones) | Campo de comprimento, ou a ferramenta de comprimento | igual | Campo "Comprimento" — `panels/properties-model.ts:627`. A ferramenta de arrastar a ponta está na §7 |
| Icon | §4 Ossos (spine-bones) | Escolher o ícone do osso | igual | Campo "Ícone" — `panels/properties-model.ts:645-648`, lista em `viewport/bone-icons.ts` |
| Name | §4 Ossos (spine-bones) | Caixa Name: o nome DESTE osso sempre aparece na cena; clicar no nome escolhe | diferente | Não há caixa por osso. "Nomes dos ossos" liga para todos — `ui/menus.ts:412`; "Nome ao passar o mouse" — `menus.ts:428` |
| Select | §4 Ossos (spine-bones) | Desmarcar Select: o osso não é escolhido na cena, só pela Árvore | diferente | Cadeado por osso na Árvore — `panels/tree.ts:821-852`; travado não pega clique na cena. Também Travar o escolhido Ctrl+2 — `ui/menus.ts:567` |
| Color | §4 Ossos (spine-bones) | Cor do osso; vários ossos de uma vez | diferente | Campo "Cor do osso" — `panels/properties-model.ts:640-643`. Com vários escolhidos o painel mostra "Vários itens" e nenhum campo — `properties-model.ts:1066-1079` |
| Parent | §4 Ossos (spine-bones) | Escolher o FILHO, P, clicar no pai; ou arrastar na Árvore | diferente | Ao contrário: escolher o PAI, segurar P, clicar em cada filho — `viewport/parent-gesture.ts:1-12`. Arrastar na Árvore é igual — `panels/tree.ts:974-990` |
| Add to Skin | §4 Ossos (spine-bones) | Botão que põe o osso na pele ativa | diferente | Caixa "Só com a pele" e a lista "Peles que ativam" — `panels/properties-model.ts:561-578,670-673`. Não usa a pele ativa sozinho |
| Split | §4 Ossos (spine-bones) | Botão Split: divide um osso em vários; Nested; Fibonacci | falta | Nenhum comando de dividir osso em `editor/src` |
| Separate X and Y | §4 Ossos (spine-bones) | Em Animando, caixa Separate: X e Y em chaves separadas nesta animação | diferente | Não precisa de caixa: X e Y já são sempre linhas separadas — `anim/keying.ts:144`; spec §9.4 |
| Hiding bones | §4 Ossos (spine-bones) | Bolinha na Árvore; Ctrl+H mostra tudo; botão direito na bolinha esconde os filhos | diferente | Olho na Árvore — `panels/tree.ts:866-890`; H esconde o escolhido — `ui/menus.ts:436`. Mostrar tudo é Ctrl+Alt+3 — `menus.ts:438`. Botão direito no olho não esconde os filhos |
| Bone draw order | §4 Ossos (spine-bones) | Não muda: o último osso criado desenha por cima | igual | Os ossos são desenhados na ordem do array — `viewport/viewport-draw.ts:515-520`; osso novo entra no fim — `panels/tree-commands.ts:76`, `viewport/tools/create-bone.ts:167` |
| Attachments | §4 Ossos (spine-bones) | Anexos ficam num slot, e o slot fica no osso | igual | Slot com campo Osso e campo Anexo — `panels/properties-model.ts:686-704`; spec §4.3 |

### §5 Slots

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Draw order | §5 Slots (spine-slots) | Lista de slots dentro da Árvore, debaixo do esqueleto | diferente | Aba própria "Ordem", o de cima fica na frente — `panels/draw-order.ts:1-22` |
| Changing the draw order | §5 Slots (spine-slots) | Arrastar o slot; + e − no teclado; Shift pula 5 | diferente | Arrastar — `panels/draw-order.ts:507-520`; + e − — `ui/menus.ts:544-545`. Shift não pula 5: Ctrl+Shift+↑/↓ vai à frente/fundo de tudo — `ui/keys.ts:179-180` |
| Tree filter | §5 Slots (spine-slots) | Botões no canto da Árvore escondem ossos e anexos; fica só a ordem | diferente | Não há filtro por tipo. A aba Ordem já mostra só os desenhos — `panels/draw-order.ts:16-18`. A Árvore só busca por nome — `panels/tree.ts:331-359` |
| Color | §5 Slots (spine-slots) | Botão de cor do slot, com alfa; animável | igual | Campo "Cor" RGBA — `panels/properties-model.ts:709`; animável — `anim/keying.ts:613` |
| Tint black | §5 Slots (spine-slots) | Caixa Tint Black liga a segunda cor, a escura | diferente | Campo "Cor escura" sempre à mostra, sem caixa que liga — `panels/properties-model.ts:710`; animável — `anim/keying.ts:613` |
| Blending | §5 Slots (spine-slots) | Normal, Additive, Multiply, Screen | igual | Campo "Mistura": normal, aditiva, multiplicar, clarear — `panels/properties-model.ts:514-519,711` |
| Separate color and alpha | §5 Slots (spine-slots) | Em Animando, caixa Alpha: cor e alfa em chaves separadas | falta | A cor é uma linha só, de quatro números — spec §9.5. Não há linha de alfa no formato: é campo novo, decisão do Humberto |
| Hiding slots | §5 Slots (spine-slots) | Bolinha na Árvore; não vira chave; Ctrl+H mostra tudo | diferente | Olho na Árvore, não vira chave — `panels/tree.ts:866-890`. Mostrar tudo é Ctrl+Alt+3 — `ui/menus.ts:438` |
| Folders | §5 Slots (spine-slots) | Escolher slot, "New… Folder"; arrastar entre pastas | diferente | Pasta mora na aba Ordem, não na Árvore — `panels/draw-order.ts:115-124`; menu Nova pasta / Tirar da pasta — `ui/menus.ts:553-554`; campo `folder` da spec §4.3 |

### §6 Imagens

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Images path | §6 Imagens (spine-images) | Nó Images na Árvore com o caminho da pasta; Browse; o Spine vigia a pasta | diferente | Arquivo → Abrir pasta… — `ui/menus.ts:203`; `io/project-folder.ts:1-27`. A pasta NÃO vai para o `.bone`; o Recarregar é à mão — `panels/palette.ts:230` |
| Creating region attachments | §6 Imagens (spine-images) | Arrastar imagem para a cena, ou para osso/slot/anexo na Árvore; P na imagem; ícone laranja = sem uso | diferente | Arrastar para a cena — `panels/palette.ts:709-715`; imagem sem uso marcada — `palette.ts:644`. Na Árvore só vale soltar em linha de slot — `panels/tree.ts:796`. P na imagem não existe |
| Image file lookup | §6 Imagens (spine-images) | Caminho da pasta + nome do anexo; tenta .png, .jpg, .jpeg | diferente | Procura pela região do atlas, com `path ?? nome` — `panels/thumbnail-kind.ts:80`; spec §2.8 manda atlas primeiro, depois `imagesBase` + .png/.webp/.jpg. A busca por `imagesBase` dentro do editor não conferi |
| Import PSD | §6 Imagens (spine-images) | Importar um PSD: camadas viram imagens no lugar | igual | Arquivo → Importar → PSD… e PSD com ossos… — `ui/menus.ts:241-243`; `io/import-psd.ts` |
| Scripts | §6 Imagens (spine-images) | Roteiros para Photoshop, Illustrator, GIMP etc. exportam imagens + JSON | falta | Nenhum roteiro para editor de imagem no projeto. O caminho é o PSD |

### §7 Ferramentas

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Selection | §7 Ferramentas (spine-tools) | Clicar escolhe; Ctrl+clique soma; Ctrl+arrastar = caixa; botão do meio = caixa | diferente | Shift soma, não Ctrl; caixa no vazio, Ctrl tira — `viewport/tools/select.ts:432-437,510,515`. Botão do meio move a vista — `viewport/viewport.ts:1160-1161` |
| Deselect | §7 Ferramentas (spine-tools) | Espaço, Esc, ou duplo clique na cena | diferente | Esc — `ui/menus.ts:308`. Espaço é mover a vista / tocar — `ui/keys.ts:153-156`. Duplo clique na cena não conferido |
| Selection history | §7 Ferramentas (spine-tools) | Page Up / Page Down andam pelas seleções anteriores | falta | Nenhuma tecla PageUp/PageDown em `ui/keys.ts`; nenhum histórico de seleção |
| Selection groups | §7 Ferramentas (spine-tools) | Ctrl+número guarda; número chama de volta | falta | Não existe. Ctrl+1 já é "Voltar à pose de repouso" — `ui/menus.ts:571` |
| Numeric entry | §7 Ferramentas (spine-tools) | Número na barra; +123 soma ao atual; *2; roda e arrasto; setas, Shift = passo menor | diferente | Campo nas Propriedades aceita conta `+ - * /` — `panels/properties-model.ts:155-165`, mas "+123" vira 123, não soma. Setas: Shift = dez passos, Alt = um décimo — `properties-model.ts:269-275` |
| Axes | §7 Ferramentas (spine-tools) | Local, Parent, World | igual | Eixos das alças: Local, Pai, Mundo — `ui/menus.ts:600-607`; grupo Eixos na barra — `ui/action-bar-model.ts:261` |
| Rotate tool | §7 Ferramentas (spine-tools) | Tecla C; arrastar no vazio; Shift = 15° | diferente | Tecla E — `viewport/tools/rotate.ts:100`. Shift 15° igual — `rotate.ts:57,79` |
| Translate tool | §7 Ferramentas (spine-tools) | Tecla V; alças X/Y prendem num eixo | diferente | Tecla W — `viewport/tools/translate.ts:156`. Prender eixo é com Shift — `translate.ts:136-150` |
| Scale tool | §7 Ferramentas (spine-tools) | Tecla X; alças X/Y | diferente | Tecla R — `viewport/tools/scale.ts:101`. Shift mantém proporção — `scale.ts:10` |
| Shear tool | §7 Ferramentas (spine-tools) | Tecla Z; arrastar as alças X/Y | diferente | Mesma tecla Z — `viewport/tools/shear.ts:107`. Sem alças: horizontal = shearX, vertical = shearY, Alt prende eixo — `shear.ts:14-21` |
| Pose tool | §7 Ferramentas (spine-tools) | Tecla B; origem move, resto gira mirando; vários ossos = IK | diferente | Mesma tecla B — `viewport/tools/pose-tool.ts:258`. Arrasta a ponta da cadeia e grava só rotação — `pose-tool.ts:1-10`; não move pela origem |
| Bone length tool | §7 Ferramentas (spine-tools) | Com Girar/Mover/Escalar, arrastar a ponta do osso; Alt leva os filhos | diferente | Sem arrasto de ponta. Campo Comprimento — `panels/properties-model.ts:627`; ou Alt+arrastar com Criar osso redesenha, filhos ficam — `viewport/tools/create-bone.ts:440-447` |
| Weights tool | §7 Ferramentas (spine-tools) | Tecla G, junto com a vista Weights | igual | Ferramenta Pesos, tecla G — `viewport/tools/weights-tool.ts:188-191`; aba "Malha e pesos" — `ui/menus.ts:766` |
| Create tool | §7 Ferramentas (spine-tools) | Tecla N; clique = osso sem comprimento; arrasto = com comprimento; Alt refaz; Shift mantém o pai; Ctrl pega anexos | diferente | Tecla N, clique/arrasto e Alt iguais — `viewport/tools/create-bone.ts:397-450`. Diferença: desenhos escolhidos são pegos SEM Ctrl, e Ctrl cria sem pegar — `create-bone.ts:199-202,454`. Shift não mantém o pai |
| Compensation | §7 Ferramentas (spine-tools) | Botões Bones e Images na barra | diferente | Menu Esqueleto → Compensar: filhos, desenhos e caixas — `ui/menus.ts:574-598`; `viewport/tools/compensate.ts`. Não fica na barra |
| Pixels | §7 Ferramentas (spine-tools) | Liga o encaixe da imagem no pixel da tela (.0 ou .5) | falta | Não há encaixe no pixel ao mover. "Arte em pixel" é só dica para o runtime — `panels/properties-model.ts:1042`; spec §4.1 |
| Auto key | §7 Ferramentas (spine-tools) | Botão Auto Key na barra principal | diferente | "Gravar sozinho" (A), ligado por padrão — `anim/pose-mode.ts:46-60`; no menu Animação — `ui/menus.ts:678` e na linha do tempo — `panels/dopesheet.ts:324` |
| Viewport options | §7 Ferramentas (spine-tools) | Painel de três colunas: pode escolher, visível, nome — por osso, imagem, outros | diferente | Menu Exibir: Ossos, Desenhos, Nomes dos ossos… — `ui/menus.ts:410-428`; Travar ossos/desenhos — `menus.ts:565-566`. Sem coluna "nome" para imagens |
| Rulers | §7 Ferramentas (spine-tools) | Botão de régua acima do slider; linha vermelha na posição do mouse | diferente | Liga em Exibir → Réguas — `ui/menus.ts:425`; conta das marcas em `viewport/rulers.ts`. Tem guias, que o Spine não tem — `menus.ts:432-434`. A linha do mouse não conferi |
| Copy/paste | §7 Ferramentas (spine-tools) | Ctrl+C / Ctrl+V: transformação de osso, de anexo, posição de vértices | diferente | Só a posição do desenho no osso: Copiar/Colar posição no osso — `ui/menus.ts:340-350`, `panels/anchor-clipboard.ts`. Ctrl+C/V são das chaves — `panels/dopesheet.ts:354-361`. Falta copiar osso e vértices |

### §8 Chaves

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Animations | §8 Chaves (spine-keys) | Nó Animations na Árvore, "New… Animation"; ativar pela bolinha ou pela vista Animations | diferente | Aba Animações própria — `panels/animations.ts:1-5`; Nova animação — `ui/menus.ts:651` |
| Folders | §8 Chaves (spine-keys) | Pastas de animação; o nome sai "pasta/animação" | falta | A `Animation` não tem campo de pasta — spec §4.6. Não há pasta de animação no editor |
| Timeline position | §8 Chaves (spine-keys) | Clicar ou arrastar na régua; botão direito move; roda dá zoom | diferente | Clicar/arrastar na régua — `panels/dopesheet-pointer.ts:40-46`. Sem roda nem botão direito na folha (nenhum `wheel` em `panels/dopesheet*.ts`) |
| Frames | §8 Chaves (spine-keys) | 30 quadros por segundo; muda na vista Playback | diferente | fps nas propriedades do esqueleto — `panels/properties-model.ts:1041`; spec §4.1 diz que é só dica |
| Frame snapping | §8 Chaves (spine-keys) | Shift ao clicar ou arrastar a régua solta do quadro | diferente | A régua sempre encaixa no quadro — `panels/dopesheet-pointer.ts:45`. Soltar do quadro só ao arrastar CHAVE, com Alt — `panels/dopesheet.ts:1593-1595` |
| Repeat | §8 Chaves (spine-keys) | Liga o laço; guardado por animação, não vai para a exportação | diferente | Repetir (L) — `ui/menus.ts:660`; grava `loop` no arquivo — `panels/dopesheet-edit.ts:177-184`; spec §4.6 |
| Setting keys | §8 Chaves (spine-keys) | Botão de chave ao lado de cada campo (verde/laranja/vermelho); K chaveia o que mudou | diferente | Chavear (K) grava o escolhido — `panels/dopesheet-edit.ts:186-200`, `ui/menus.ts:676`. Sem botão de chave nos campos nem cor de estado |
| Auto key | §8 Chaves (spine-keys) | Auto Key na barra: toda mudança vira chave | diferente | Gravar sozinho (A), ligado por padrão — `anim/pose-mode.ts:46-60`, `ui/menus.ts:678`. Desligado, recusa a edição em vez de escrever a montagem — `pose-mode.ts:20-23` |
| Key shown | §8 Chaves (spine-keys) | Ctrl+Shift+L chaveia as linhas à mostra na folha | diferente | Chavear tudo (Ctrl+K) chaveia TODO osso e slot, à mostra ou não — `panels/dopesheet-edit.ts:565-589`, `ui/keys.ts:211` |
| Bone transforms | §8 Chaves (spine-keys) | Botão de chave ao lado do número na barra; botão laranja na Árvore | diferente | Chave de osso por Gravar sozinho ou K — `anim/keying.ts:643-647`. Ver nota comum |
| Setup pose | §8 Chaves (spine-keys) | Chave de osso é RELATIVA à montagem; mudar a montagem muda a animação | diferente | A chave é valor ABSOLUTO, escrito por cima da montagem — spec §9.4; `anim/keying.ts:144` |
| Separate X and Y | §8 Chaves (spine-keys) | Caixa Separate por osso, por animação | diferente | X e Y sempre em linhas separadas — `anim/keying.ts:144`; spec §9.4 |
| Transform inheritance | §8 Chaves (spine-keys) | Botão de chave ao lado de "inherit" | diferente | Animável — `anim/keying.ts:145`; chave por Gravar sozinho ou K. Ver nota comum |
| Slot attachment | §8 Chaves (spine-keys) | Bolinha do anexo na Árvore + botão de chave do slot | diferente | Trocar a imagem com Gravar sozinho grava chave — `panels/image-picker.ts:89-96`; `attachment` animável — `anim/keying.ts:613` |
| Slot color | §8 Chaves (spine-keys) | Botão de chave ao lado da cor | diferente | Cor animável — `anim/keying.ts:613`; chave por Gravar sozinho ou K. Ver nota comum |
| Draw order | §8 Chaves (spine-keys) | Botão de chave ao lado do nó Draw Order | diferente | Em Animando, mudar a ordem vira chave `drawOrder` — `panels/draw-order-actions.ts:39-42`, `panels/draw-order-model.ts:726` |
| Events | §8 Chaves (spine-keys) | Botão de chave ao lado de cada evento na Árvore | diferente | Botão "Chavear evento" no bloco das Propriedades — `panels/event-key-editor.ts:14,130` |
| Sequence keys | §8 Chaves (spine-keys) | Botão de chave no campo Sequence: Hold, Once, Loop, Pingpong…, FPS, Frame | falta | Formato tem (§7.10, §9.6), falta porta no editor: `sequenceTarget` (`anim/keying.ts:103`) não é chamado por nenhum painel nem ferramenta |
| Deform keys | §8 Chaves (spine-keys) | Botão de chave ao lado do anexo: malha, caminho, caixa, máscara | diferente | Mover vértice em Animando grava chave `deform` — `mesh/mesh-doc.ts:406-421`, `mesh-doc.ts:387-393`. Só para malha; sem botão |
| Deform highlight | §8 Chaves (spine-keys) | Vértice deformado em rosa; Ctrl+duplo clique escolhe os deformados | falta | Nenhum destaque de vértice deformado em `mesh/` nem em `viewport/` |
| IK, Transform, Path constraints | §8 Chaves (spine-keys) | Botão de chave ao lado da regra na Árvore | diferente | Campos da regra nas Propriedades viram chave — `anim/keying.ts:654-659`; alças na cena também — `viewport/handles.ts:400`. Sem botão |
| Clipboard buttons | §8 Chaves (spine-keys) | Copiar, Recortar, Apagar, Colar; duplo clique apaga; colar em OUTRO osso escolhido | diferente | Botões na barra — `ui/action-bar-model.ts:153-157`; teclas — `ui/keys.ts:205-213`; duplo clique apaga — `panels/dopesheet.ts:925-931`. Colar volta à mesma linha — `anim/keying.ts:1011-1036`; não cola em outro osso (só "Colar espelhado", `ui/menus.ts:734`) |
| Shift | §8 Chaves (spine-keys) | Botão Shift, ou Alt+arrastar: as chaves depois andam junto | diferente | Comando "Empurrar as chaves…", com janela — `ui/menus.ts:742`, `panels/dopesheet-edit.ts:303-330`, `anim/keying.ts:1183`. Alt no arrasto solta do quadro, não empurra |
| Offset | §8 Chaves (spine-keys) | Botão Offset, ou Ctrl+Alt+arrastar: chaves dão a volta no laço | falta | Nenhum arrasto que dá a volta no fim da animação. Ctrl no arrasto clona — `panels/dopesheet-pointer.ts:61-64` |
| Clean Up | §8 Chaves (spine-keys) | Nas propriedades da animação; tira chave inútil, inclusive igual à montagem; várias animações de uma vez | diferente | "Limpar chaves repetidas" — `ui/menus.ts:746`, `panels/dopesheet-edit.ts:476-499`. Só tira a chave igual às vizinhas, nunca a parada; só a animação aberta — `anim/keying.ts:1236-1260` |

### §9 Animar

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Straight ahead | §9 Animar (spine-animating) | Técnica: posar quadro a quadro, do começo ao fim | não se aplica | É modo de trabalhar, não botão. As peças (Gravar sozinho, quadro seguinte) estão nas §7 e §8 |
| Pose to pose | §9 Animar (spine-animating) | Poses-chave primeiro; liga Stepped na vista Playback para ver só as poses | falta | A técnica não é função, mas o interruptor "tocar sem interpolar" falta: nenhum em `panels/dopesheet-player.ts` nem `anim/transport.ts`. Só dá chave a chave: curva Parada — `ui/menus.ts:695` |
| Layered | §9 Animar (spine-animating) | Técnica: esconder partes e animar por camadas | não se aplica | É modo de trabalhar. Esconder partes existe: H e Shift+H — `ui/menus.ts:436-437` |
| Combined | §9 Animar (spine-animating) | Técnica: misturar os três métodos | não se aplica | É modo de trabalhar, não função |
| Curves | §9 Animar (spine-animating) | Curvas mudam a velocidade entre chaves, na vista Graph | igual | Aba Curvas — `panels/graph.ts:1-23`; menu Curva da chave: Linear, Suave, Parada, Curva… — `ui/menus.ts:689-697` |

### §10 Anexos · propriedades comuns

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Select | §10 Anexos · comuns | Caixa por anexo: desmarcada, o anexo não se escolhe na cena | diferente | Cadeado por osso e por slot na Árvore, não por anexo; mora no estado do editor — `editor/src/panels/tree.ts:821-846` |
| Export | §10 Anexos · comuns | Caixa por anexo: desmarcada, não vai no JSON nem na exportação | falta | Não há marca de "não exportar" por anexo. O formato não tem o campo |
| Name | §10 Anexos · comuns | Caixa por anexo: o nome sempre na cena, clicável | diferente | Liga por TIPO (nomes de pontos, de caixas), não por anexo — `editor/src/viewport/onion.ts:105-106`, `editor/src/viewport/viewport-draw.ts:104` |
| Color | §10 Anexos · comuns | Cor do anexo; tinge região e malha, só visual nos outros | igual | Campo "Cor" por tipo — `editor/src/panels/properties-model.ts:757,805,835,860,880` |
| Set Parent | §10 Anexos · comuns | Botão Set Parent ou P, depois clicar o novo pai; ou arrastar na árvore | diferente | P vai do pai para o filho (gesto do Spriter) e troca o OSSO do slot, não o slot do anexo — `editor/src/viewport/parent-gesture.ts:34-37,40-43`; arrastar na Árvore — `editor/src/panels/tree-rows.ts:409` |
| Hiding attachments | §10 Anexos · comuns | Clipe ao lado de cada anexo na árvore escolhe o visível | diferente | Lista "Anexo" nas Propriedades do slot, com "(nenhum)" — `editor/src/panels/properties-model.ts:698-702` |

### §10.1 Region

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Image path | §10.1 Region | Campo; vazio usa o nome do anexo | igual | Campo "Imagem", com o nome como padrão — `editor/src/panels/properties-model.ts:733` |
| Mesh (virar malha) | §10.1 Region | Caixa "Mesh" nas propriedades da região | diferente | Botão "Virar malha" na aba Malha e pesos, seção Forma — `editor/src/panels/mesh-panel.ts:356-371` |
| Sequence | §10.1 Region | Caixa Sequence, faixa de números, Frame; pode chavear | falta | Formato tem (§7.10), runtime calcula (`runtime/src/attachments/sequence.ts:9`, `runtime/src/sequence-frame.ts:50`). O editor só mostra a contagem na miniatura (`editor/src/panels/thumbnail-kind.ts:81-84`). Falta porta no editor |
| Translation | §10.1 Region | Posição do centro da imagem | igual | Campos X/Y — `editor/src/panels/properties-model.ts:846-850`; arrastar o desenho — `editor/src/viewport/tools/attachment-edit.ts:56-61` |

### §10.2 Mesh

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Image path | §10.2 Mesh | Campo; vazio usa o nome | igual | Mesmo campo "Imagem" da região — `editor/src/panels/properties-model.ts:733,866-869` |
| Mesh (voltar a região) | §10.2 Mesh | Desmarcar Mesh volta a region | falta | Só existe a ida (`mesh-panel.ts:366`). Não há malha → região |
| Wireframe | §10.2 Mesh | Caixa: vértices e arestas à vista sem escolher a malha | falta | A malha só aparece com a ferramenta Malha e ela escolhida — `editor/src/viewport/tools/mesh-tool.ts:203-208` |
| Sequence | §10.2 Mesh | Igual à da região | falta | Formato tem (§7.10), runtime calcula (`runtime/src/attachments/sequence.ts:9`). O editor só preserva ao virar malha (`editor/src/mesh/mesh-edit.ts:186`). Falta porta |
| Edit Mesh | §10.2 Mesh | Botão abre o modo de edição; Espaço/Esc sai | diferente | Não há modo: é a ferramenta Malha (M), ligada sozinha ao escolher uma malha — `editor/src/panels/mesh-panel.ts:292-302`, `editor/src/viewport/tools/mesh-tool.ts:120-123` |
| Freeze | §10.2 Mesh | Zera giro e escala "de conveniência" da malha | não se aplica | A malha no Recorte não mostra giro nem escala próprios (`properties-model.ts:866-884`); não há o que congelar |
| Reset | §10.2 Mesh | Leva vértices às UVs, tira pesos e chaves de deform | falta | Não há botão. Formato tem vértices e UVs (§7.4) |
| Modify tool | §10.2 Mesh · edição | Arrastar move; duplo clique apaga | diferente | Arrastar move (`mesh-tool.ts:162-173`); apagar é Delete ou botão, não duplo clique (`mesh-tool.ts:186-191`, `mesh-panel.ts:495`) |
| Create tool | §10.2 Mesh · edição | Clique cria vértice; arrastar cria aresta | diferente | Ctrl+clique ou modo "Criar vértice" (`mesh-tool.ts:149-159`, `mesh-panel.ts:489`); aresta é L com dois vértices escolhidos (`mesh-tool.ts:192-195`) |
| Delete tool | §10.2 Mesh · edição | Clique apaga vértice ou aresta; Ctrl ou caixa escolhe vários | diferente | Delete apaga vértices; K apaga aresta; Shift soma à escolha; sem caixa de seleção — `mesh-tool.ts:162-165,186-199` |
| New vertices mode | §10.2 Mesh · edição | "New" apaga tudo e clica o contorno | falta | O modo "Criar vértice" só acrescenta vértice por dentro (`editor/src/mesh/mesh-doc.ts:453-459`); não redesenha o contorno |
| Reset vertices | §10.2 Mesh · edição | Volta a 4 vértices nos cantos | falta | Não há botão. Só o "Virar malha" de uma região dá 4 cantos (`mesh-edit.ts:114-126`) |
| Generate | §10.2 Mesh · edição | Acrescenta vértices por dentro sem mover os que há; repetir adensa | diferente | "Gerar automática" REFAZ a malha inteira pela silhueta — `editor/src/panels/mesh-panel.ts:467,770-818`, `editor/src/mesh/mesh-edit.ts:1219` |
| Trace | §10.2 Mesh · edição | Contorno automático; Detail, Concavity, Refinement, Alpha, Padding, Refresh | diferente | "Traçar contorno" com um ajuste só, "Afastamento" (o Padding) — `mesh-panel.ts:468,534-556`, `mesh-edit.ts:1233` |
| Triangles | §10.2 Mesh · edição | Caixa: mostra os triângulos tracejados | diferente | Triângulos sempre desenhados, sem caixa — `mesh-tool.ts:220-234` |
| Dim | §10.2 Mesh · edição | Caixa: escurece a imagem | falta | Não achei |
| Isolate | §10.2 Mesh · edição | Caixa: esconde os outros anexos | diferente | "Esconder o resto" (Shift+H) vale para tudo, não é caixa da malha — `editor/src/viewport/onion.ts:462-489`, `editor/src/panels/view-panel.ts:256` |
| Deformed | §10.2 Mesh · edição | Alterna editar posição deformada ou UV | falta | Mover no repouso recalcula a UV sempre (`mesh-edit.ts:354-369`); `keepUv` existe mas nenhum botão usa (`mesh-doc.ts:423`) |
| Edge loop selection | §10.2 Mesh · arestas | Shift + clique na aresta escolhe a linha inteira | falta | Não há escolha de aresta |
| Hull size | §10.2 Mesh · vértices | Conselho: contorno justo à imagem | não se aplica | É conselho do manual, não função. O "Afastamento" do traçado é a porta mais perto (`mesh-panel.ts:534`) |
| Hull edges | §10.2 Mesh · vértices | Conselho: MSAA para borda serrilhada | não se aplica | Conselho de desenho e de engine, não função do editor |
| Holes | §10.2 Mesh · vértices | Conselho: malha não tem furo; use duas | não se aplica | Conselho; o formato também não tem furo (§7.4) |
| Vertex count | §10.2 Mesh · vértices | Conselho: poucos vértices | não se aplica | Conselho. A aba mostra a contagem na dica (`mesh-panel.ts:462`) |
| Deformation | §10.2 Mesh · vértices | Conselho: pesos, e não chaves de deform | não se aplica | Conselho de uso |
| Image resize | §10.2 Mesh | Imagem cresceu: pergunta se reescala as UVs | falta | "Recarregar" relê as imagens sem perguntar nada das UVs |
| Linked meshes | §10.2 Mesh | New… Linked Mesh na malha de origem; caixa Inherit timelines | diferente | Na aba, seção "Avançado: malha ligada", escolhendo a origem do mesmo slot — `editor/src/panels/mesh-panel.ts:388-453`. Sem a caixa Inherit: `inheritDeform` existe (`editor/src/mesh/linked-mesh.ts:144,193`) mas a aba não passa (`mesh-panel.ts:442`). Runtime: `runtime/src/attachments/linkedmesh.ts:21` |

### §10.3 Bounding box

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Edit Bounding Box | §10.3 Bounding box | Botão abre o modo de edição dos vértices | falta | Não se editam os cantos. A tela manda usar a Malha (`properties-model.ts:828`), mas a Malha só pega `mesh` (`mesh-doc.ts:80`). Runtime calcula a caixa: `runtime/src/attachments/boundingbox.ts:17` |
| Freeze | §10.3 Bounding box | Zera giro e escala de conveniência | não se aplica | A caixa não mostra giro nem escala próprios (`properties-model.ts:812-838`) |
| Create tool | §10.3 Bounding box | Clique na aresta cria vértice | falta | Não há |
| Delete tool | §10.3 Bounding box | Clique apaga vértice | falta | Não há |
| New vertices mode | §10.3 Bounding box | Clicar os vértices um a um; nasce aberto ao criar | diferente | Ferramenta Caixa (X): Alt + arrastar desenha um RETÂNGULO de 4 cantos — `editor/src/viewport/tools/box-tool.ts:205-270`, `editor/src/panels/tree-commands.ts:468` |

### §10.4 Clipping

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| End slot | §10.4 Clipping | Lápis, clicar o slot final | diferente | Lista "Recorta até" nas Propriedades, e ainda "Só estes" — `properties-model.ts:775-786`; nasce com o último slot — `tree-commands.ts:444` |
| Edit Clipping | §10.4 Clipping | Botão abre o modo de edição | falta | Mesmo problema da caixa: a tela diz Malha (`properties-model.ts:798`), a Malha não pega máscara (`mesh-doc.ts:80`) |
| Freeze | §10.4 Clipping | Zera giro e escala de conveniência | não se aplica | A máscara não mostra giro nem escala próprios (`properties-model.ts:764-808`) |
| Create | §10.4 Clipping | Clique na aresta cria vértice | falta | Não há |
| Delete | §10.4 Clipping | Clique apaga vértice | falta | Não há |
| New vertices mode | §10.4 Clipping | Clicar os vértices; nasce aberto ao criar | diferente | Nasce quadrado de 100 (`tree-commands.ts:451-459`), ou "Copiar a silhueta" de um desenho (`editor/src/panels/properties.ts:447`) |
| Draw order | §10.4 Clipping | Recorta do slot dela até o End slot, na ordem de desenho | igual | Mesma regra (§7.7) — `runtime/src/render-list.ts:44-64`, `runtime/src/render/canvas.ts:438` |
| Self-intersection | §10.4 Clipping | Aviso: polígono não pode se cruzar | falta | Formato manda avisar (L2, §7.7). Não achei o aviso no editor nem no loader |
| Performance | §10.4 Clipping | Conselho sobre CPU nos runtimes | não se aplica | Conselho de uso, não função |

### §10.5 Path

Nada desta seção tem porta no editor. O formato tem o anexo `path` (§7.8), e o runtime calcula (`runtime/src/attachments/path.ts:10`, `runtime/src/constraints/path.ts:246-254`). Não há como criar um caminho: a regra de caminho só aponta para um slot que já tenha um. Um `path` escolhido cai no campo "Imagem", que não vale para ele (`properties-model.ts:886`).

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Length | §10.5 Path | Mostra o comprimento total | falta | Formato tem `lengths` (§7.8), "gerado pelo editor"; o editor não gera. Falta porta |
| Closed | §10.5 Path | Caixa: liga a última âncora à primeira | falta | Formato tem `closed` (§7.8), runtime calcula (`runtime/src/constraints/path.ts:246`). Falta porta |
| Constant speed | §10.5 Path | Caixa: velocidade constante | falta | Formato tem `constantSpeed` (§7.8), runtime calcula (`runtime/src/constraints/path.ts:251-254`). Falta porta |
| Edit Path | §10.5 Path | Botão abre o modo de edição | falta | Não há |
| Freeze | §10.5 Path | Zera giro e escala de conveniência | não se aplica | O `path` não tem giro nem escala próprios no formato (§7.8) |
| Reverse | §10.5 Path | Inverte o sentido do caminho | falta | Não há. Seria inverter os vértices (§7.8) |
| Create | §10.5 Path | Clique entre âncoras cria âncora | falta | Não há |
| Delete | §10.5 Path | Clique apaga vértice | falta | Não há |
| New vertices | §10.5 Path | Clicar e arrastar cria âncora com alças | falta | Não há como criar um `path` |
| Angle lock | §10.5 Path | Shift trava o ângulo da alça | falta | Não há |
| Cusps | §10.5 Path | Alt move uma alça sem a outra | falta | Não há |

### §10.6 Point

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Point: posição e rotação, marcador | §10.6 Point | New… Point na árvore; campos de posição e giro | diferente | Ferramenta Ponto: Alt + arrastar cria apontando; arrastar move; Shift gira — `editor/src/viewport/tools/point-tool.ts:11-16`; campos X, Y, Rotação — `properties-model.ts:743-760`; runtime `runtime/src/attachments/point.ts:11` |

### §11 Skins

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Skin placeholders | §11 Skins | New… Skin Placeholder num osso, slot ou anexo | diferente | Não há "placeholder" à parte: o anexo novo nasce na pele do lápis — `editor/src/viewport/onion.ts:741`, `editor/src/panels/tree-commands.ts:356` |
| Selected attachments | §11 Skins | Vários anexos → placeholders, com janela: duplicar, malha ligada, renomear | falta | Não há |
| Export | §11 Skins | Caixa: pele não exportada | falta | Não há. O formato não tem o campo (§4.4) |
| Color | §11 Skins | Cor da pele na árvore | falta | Não há. O formato não tem o campo (§4.4) |
| Add to Skin | §11 Skins | Modo: clicar ossos e regras para pôr na pele | diferente | Caixa "Só com a pele" e lista "Peles que ativam" nas Propriedades do osso e da regra — `properties-model.ts:561-579,671-674,904`; `editor/src/panels/skins-model.ts:275,332` |
| Folders | §11 Skins | Pastas de pele | falta | Não há |
| Active skin | §11 Skins | Ponto na árvore: a pele ativa (editada), só uma | diferente | Aba Peles: lápis "Editar aqui" (só uma) e olho "Mostrar" (várias) — `editor/src/panels/skins.ts:223-255` |
| Skin attachments | §11 Skins | Arrastar o anexo para o placeholder da pele ativa | diferente | Sem arrastar para placeholder: o anexo nasce na pele do lápis (`onion.ts:741`); trocar a imagem em todas as peles — `skins-model.ts:465` |
| Skin bones | §11 Skins | Add to skin no osso, ou arrastar o osso na pele | diferente | Caixa "Só com a pele" no osso — `properties-model.ts:671-674`; runtime `runtime/src/loader.ts:892` |
| Skin constraints | §11 Skins | Add to skin na regra, ou arrastar | diferente | Caixa "Só com a pele" na regra — `properties-model.ts:904`; runtime `runtime/src/skeleton.ts:799` |
| Constrained bones | §11 Skins | Aviso quando os ossos da regra estão em pele e ela não | falta | A lista de problemas da regra não olha peles — `editor/src/panels/rules-model.ts:154-195` |
| Warnings | §11 Skins | Avisos de osso, anexo e regra na árvore | falta | Só o aviso de carga "não é skinRequired" (`runtime/src/loader.ts:892,1585`). Os três avisos do Spine não existem |
| Duplicating a skin | §11 Skins | Duplicar abre janela: malha ligada, herdar deform, chaves, renomear | diferente | "Duplicar pele" copia direto, sem janela — `editor/src/panels/skins.ts:122-131`, `skins-model.ts:96-117` |
| The first skin | §11 Skins · fluxos | Roteiro: filtrar anexos e criar placeholders em lote | não se aplica | É roteiro de uso; a peça que falta está em "Selected attachments" |
| Similar skins | §11 Skins · fluxos | Roteiro: duplicar e achar-e-trocar nomes | não se aplica | É roteiro de uso; as peças estão em "Duplicating a skin" |
| Programmatic skins | §11 Skins · fluxos | Pele montada em código no jogo | não se aplica | É código do jogo. O runtime aceita pele montada: `runtime/src/skeleton.ts:889` |
| Removing skin placeholders | §11 Skins | Apagar placeholder com "Keep current attachment" | falta | Não há |
| Mix and match | §11 Skins | Várias peles visíveis ao mesmo tempo | igual | Olho em várias peles, empilhadas — `editor/src/panels/skins.ts:223-238`; runtime `runtime/src/skeleton.ts:889,920` |

### §12 Restrições · geral

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Ordem | §12 Restrições · geral | Arrastar a regra na árvore; Reset calcula uma ordem | falta | A aba Regras só lista na ordem do arquivo (`rules-model.ts:154-157`). O runtime aplica nessa ordem (`runtime/src/skeleton.ts:799`). Falta arrastar |
| Bone transforms | §12 Restrições · geral | Explica: a regra recalcula o mundo dos ossos | não se aplica | É nota de cálculo, não função. O formato diz o mesmo (§6.1, regras 2 e 3) |
| Mix | §12 Restrições · geral | Barra 0–100; algumas aceitam negativo e mais de 100 | diferente | Barra 0–100 na lista (`editor/src/panels/rules.ts:310-321`) e campo "Força" (`properties-model.ts:903`). Corta em 0..1, sem negativo nem exagero — `rules-model.ts:426` |
| Folders | §12 Restrições · geral | Pastas de regra | falta | Não há |
| Viewport bones | §12 Restrições · geral | Osso sob regra desenhado oco | falta | Todo osso é preenchido igual — `editor/src/viewport/viewport-draw.ts:557-558` |
| Tree annotations | §12 Restrições · geral | Ícone na árvore no osso da regra e no alvo; clicar escolhe a regra | diferente | Marca só nos ossos da cadeia, sempre com o ícone de IK, e não escolhe a regra — `editor/src/panels/tree.ts:646-654` |
| Copy/paste | §12 Restrições · geral | Ctrl+C numa regra, Ctrl+V noutras do mesmo tipo | falta | Não há |

### §12 Restrições · IK

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Parent | §12 Restrições · IK | Mostra o 1º osso; lápis troca | diferente | Caixas "Ossos da cadeia" (ordem pai→filho sozinha) — `properties-model.ts:921-931`; na criação, janela "Que ossos dobram?" — `rules.ts:152-163` |
| Child | §12 Restrições · IK | Mostra o 2º osso; lápis troca, X limpa | diferente | A mesma lista de caixas, até dois — `properties-model.ts:921-931`, `rules-model.ts:235-237` |
| Target | §12 Restrições · IK | Clicar osso na cena, ou no vazio para criar um | diferente | Lista na janela e nas Propriedades (`rules.ts:164-170`, `properties-model.ts:932`); não cria osso no vazio. Alça do alvo arrastável — `editor/src/viewport/handles.ts:504-516` |
| Positive | §12 Restrições · IK | Caixa, só na IK de 2 ossos | diferente | Caixa aparece também na IK de 1 osso (`properties-model.ts:933`); a mais, alça de dobra na cena (`handles.ts:518-530`) |
| Compress | §12 Restrições · IK | Caixa, só na IK de 1 osso | diferente | Caixa aparece também na IK de 2 ossos — `properties-model.ts:934`; runtime `runtime/src/constraints/ik.ts:189` |
| Stretch | §12 Restrições · IK | Caixa | igual | `properties-model.ts:935`; runtime `ik.ts:189` |
| Uniform | §12 Restrições · IK | Caixa | igual | `properties-model.ts:936`; runtime `ik.ts:189` |
| Softness | §12 Restrições · IK | Número, só na IK de 2 ossos | diferente | Campo aparece também na IK de 1 osso — `properties-model.ts:937`; runtime `ik.ts:247` |
| Mix | §12 Restrições · IK | Barra | igual | Barra na lista e campo Força — `rules.ts:310-321`, `properties-model.ts:903` |

### §12 Restrições · Path

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Bones | §12 Restrições · Path | Lista; arrastar muda a ordem no caminho | diferente | Caixas; a ordem é a do arquivo, não se arrasta — `properties-model.ts:915-925` |
| Target | §12 Restrições · Path | Lápis, clicar slot ou caminho | diferente | Lista de slots — `properties-model.ts:975`, `rules.ts:164-168` |
| Spacing | §12 Restrições · Path | Modo (Length, Fixed, Percent, Proportional) e barra | igual | Modo e número — `properties-model.ts:977,981`; runtime `runtime/src/constraints/path.ts:192` |
| Position | §12 Restrições · Path | Modo (Fixed, Percent) e barra | igual | `properties-model.ts:976,980` |
| Position handle | §12 Restrições · Path | Arrastar a alça no caminho | igual | Alça `pathPosition` — `editor/src/viewport/handles.ts:197-214,532-543` |
| Rotate Offset | §12 Restrições · Path | Número | igual | `properties-model.ts:979`; runtime `path.ts:123` |
| Rotate Mix | §12 Restrições · Path | Modo (Tangent, Chain, Chain Scale) e barra | igual | `properties-model.ts:978,986`; runtime `path.ts:110-126` |
| Translate Mix | §12 Restrições · Path | Uma barra | diferente | Dois campos, X e Y — `properties-model.ts:987-988` |
| Color | §12 Restrições · Path | Alça e ícone com a cor do 1º osso | diferente | Cor fixa da alça — `handles.ts:567` |

### §12 Restrições · Transform

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Bones | §12 Restrições · Transform | Lista; lápis limpa e escolhe de novo | diferente | Caixas — `properties-model.ts:921-925,946` |
| Local | §12 Restrições · Transform | Caixa | igual | `properties-model.ts:948`; runtime `runtime/src/constraints/transform.ts:81` |
| Relative | §12 Restrições · Transform | Caixa | igual | `properties-model.ts:949`; runtime `transform.ts:82` |
| Target | §12 Restrições · Transform | Clicar osso, ou vazio para criar | diferente | Lista (`properties-model.ts:947`); alça do alvo arrastável (`handles.ts:181,504-516`) |
| Offset | §12 Restrições · Transform | Barras de deslocamento | diferente | Seis campos numéricos — `properties-model.ts:950-955` |
| Match | §12 Restrições · Transform | Botão: copia a pose do 1º osso para os deslocamentos | falta | Não há |
| Mix | §12 Restrições · Transform | Barras por parte, com "Link sliders" | diferente | Seis campos de força, sem ligar as barras — `properties-model.ts:960-965` |

### §12 Restrições · Physics

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Bone | §12 Restrições · Physics | Lápis, escolher o osso | diferente | Lista na janela "Que osso balança?" e nas Propriedades — `rules.ts:140`, `properties-model.ts:997` |
| Translate X | §12 Restrições · Physics | Barra 0–100 | igual | "Força em X" — `properties-model.ts:998`; runtime `runtime/src/constraints/physics.ts:121` |
| Translate Y | §12 Restrições · Physics | Barra 0–100 | igual | "Força em Y" — `properties-model.ts:999`; runtime `physics.ts:122` |
| Rotation | §12 Restrições · Physics | Barra | igual | `properties-model.ts:1000`; runtime `physics.ts:123` |
| Shear X | §12 Restrições · Physics | Barra | igual | `properties-model.ts:1002`; runtime `physics.ts:123` |
| Scale X | §12 Restrições · Physics | Barra | igual | `properties-model.ts:1001`; runtime `physics.ts:124` |
| Limit | §12 Restrições · Physics | Barra | igual | `properties-model.ts:1013`; runtime `physics.ts:141` |
| FPS | §12 Restrições · Physics | Número | igual | `properties-model.ts:1014` |
| Inertia | §12 Restrições · Physics | Barra; pode chavear | diferente | Campo existe (`properties-model.ts:1007`), mas mostra 1 quando ausente; runtime usa 0,5 (`runtime/src/data.ts:359`, formato §6.5) |
| Strength | §12 Restrições · Physics | Barra | igual | `properties-model.ts:1008` |
| Damping | §12 Restrições · Physics | Barra | igual | `properties-model.ts:1009` |
| Mass | §12 Restrições · Physics | Barra | igual | `properties-model.ts:1010` |
| Wind | §12 Restrições · Physics | Barra | igual | Campo e alça na cena — `properties-model.ts:1011`, `handles.ts:545-549`; runtime `physics.ts:158` |
| Gravity | §12 Restrições · Physics | Barra | igual | Campo e alça — `properties-model.ts:1012`, `handles.ts:550-557`; runtime `physics.ts:159` |
| Global | §12 Restrições · Physics | Caixa: uma linha do tempo para várias regras | falta | Não há. O formato não tem |
| Mix | §12 Restrições · Physics | Barra | igual | `properties-model.ts:903`, `rules.ts:310-321` |
| Simulate | §12 Restrições · Physics | Liga e desliga a simulação no editor | falta | O editor sempre simula ao andar o tempo (`editor/src/doc/document.ts:332`); sem interruptor |
| Deterministic | §12 Restrições · Physics | Recalcula desde o quadro 0 a cada quadro | falta | Só a exportação faz isso (`editor/src/io/export-image.ts:361-375`); na cena não há o modo |
| Reset | §12 Restrições · Physics | Botão: reinicia esta regra e chaveia o reset | falta | Runtime tem (`runtime/src/constraints/physics.ts:85`); o rótulo da chave existe (`editor/src/anim/keying.ts:186,255`); não há botão |
| Reset All | §12 Restrições · Physics | Botão: reinicia todas | falta | Runtime tem (`runtime/src/skeleton.ts:878`); não há botão |

### §13 Sliders

O equivalente no formato é a regra `driver` no modo contínuo (§8.2) mais o parâmetro com `source` (§8.1). O runtime calcula os dois (`runtime/src/constraints/driver.ts:88-110`, `runtime/src/parameters.ts:62-74`). Mas a regra criada pelo editor nunca roda (achado 2), e o parâmetro não tem Propriedades. Por isso tudo aqui é "falta".

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Animation | §13 Sliders | Escolher a animação controlada | falta | Campo de texto "Animação" existe (`properties-model.ts:1023`), mas com `targets: []` já gravado (`rules-model.ts:321`) o runtime ignora a regra (`runtime/src/loader.ts:1515-1517`) |
| Loop | §13 Sliders | Caixa: repete além do fim | falta | O formato não tem; o runtime prende no trecho (`driver.ts:93`) |
| Additive | §13 Sliders | Caixa: soma à pose | falta | Formato tem `mode: "add"` (§8.2), runtime calcula (`driver.ts:103-109`); o campo "Modo" existe (`properties-model.ts:1028`) mas a regra não roda |
| Frame | §13 Sliders | Barra do quadro; chaveável noutras animações | falta | Formato: valor do parâmetro e timeline `parameter` (§8.1, §9.9). O parâmetro não tem Propriedades; só nasce (`tree-commands.ts:627`) |
| Bone | §13 Sliders | Osso fonte, lápis | falta | Formato tem `source.bone` (§8.1), runtime calcula (`parameters.ts:69-74`). Falta porta |
| Local | §13 Sliders | Caixa: local ou mundo | falta | O formato só lê a pose aplicada, local (§8.1). Não há opção mundo |
| Property | §13 Sliders | Propriedade do osso e faixa → quadros | falta | Formato tem `source.property`, `from`, `to` (§8.1), runtime calcula (`parameters.ts:71-74`). Falta porta |
| Mix | §13 Sliders | Barra | falta | A barra de força existe para toda regra (`rules.ts:310-321`), mas este tipo de regra não roda (achado 2) |

### §14 Eventos

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Integer | §14 Eventos | Valor padrão no evento; chave pode trocar | diferente | Só na chave, no bloco "Chave de evento" — `editor/src/panels/event-key-editor.ts:172-221`, `editor/src/anim/event-keys.ts:52`. O padrão da definição (§4.5) não tem campo: evento nasce só com nome (`tree-commands.ts:578-597`) |
| Float | §14 Eventos | Valor padrão; chave pode trocar | diferente | Só na chave — `event-keys.ts:53` |
| String | §14 Eventos | Valor padrão; chave pode trocar | diferente | Só na chave — `event-keys.ts:54` |
| Audio path | §14 Eventos | Campo; ou arrastar som no evento | falta | Formato tem `audio` (§4.5). O editor só mostra o que já está escrito (`event-key-editor.ts:168-170`). Falta porta |
| Volume | §14 Eventos | Valor padrão; chave pode trocar | diferente | Só na chave — `event-keys.ts:55` |
| Balance | §14 Eventos | Valor padrão; chave pode trocar | diferente | Só na chave — `event-keys.ts:56` |
| Audio node | §14 Eventos | Nó Audio: pasta dos sons, vigiada | falta | Formato tem `assets.audioBase` (§2.8). Falta porta |
| Audio events | §14 Eventos | Evento com som; criar evento a partir do som; ícone verde/vermelho | falta | Não há |
| Audio file lookup | §14 Eventos | Procura .wav, .mp3, .ogg sem extensão | não se aplica | O formato pede o caminho COM extensão (§4.5); não há busca |
| Audio formats | §14 Eventos | Toca WAV, MP3, OGG no editor | falta | O editor não toca som nenhum. O runtime também não toca, por regra (§8.6) |
| Viewport events | §14 Eventos | Nome do evento aparece na cena ao disparar | falta | Runtime dispara (`runtime/src/animation.ts:382`); o editor não usa `fireEvents` |
| Folders | §14 Eventos | Pastas de evento | falta | Não há |

### §15 Painéis

#### §15 Views

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Open | Cap. 25 Views, p.156 | Caixa "Views" no alto; painel já aberto aparece cinza e o clique traz à frente | diferente | Menu **Janela** — `ui/menus.ts:794-812`. Difere: o item é interruptor; marcado e à frente, o clique FECHA |
| Tabs | Cap. 25, p.156 | Arrastar a aba; retângulo laranja mostra onde cai | igual | `ui/panel-groups.ts:287-293` (`moveTab`), `ui/panel-groups.ts:413-462` (`dropIndex`), `ui/shell.ts:884` |
| Focus | Cap. 25, p.157 | Nome da aba sublinhado no painel com foco; atalho muda conforme o foco | não confirmei | Não achei marca de foco na aba. A folha só trata tecla com foco (`panels/dopesheet.ts:32`), mas sem sinal visível |
| Resize | Cap. 25, p.157 | Arrastar a borda do painel | igual | `ui/panel-groups.ts:395-404` (`resizeSplit`), `ui/shell.ts:1011`; a faixa de baixo também, `panels/dock-model.ts:82-88` |
| Minimize | Cap. 25, p.158 | Menu da aba → Minimize vira ícone ao lado da caixa Views; F9 minimiza todos | diferente | Recolher o GRUPO deixa só a tira de abas — `ui/panel-groups.ts:341-353`, `ui/shell.ts:1559`. "Todos" é a tecla Tab, que esconde as colunas — `ui/panel-groups.ts:314` |
| Close | Cap. 25, p.158 | Menu da aba → Close, ou duplo clique no ícone; volta pela caixa Views | diferente | `×` na própria aba — `ui/shell.ts:777,1133-1146`; volta pelo menu Janela — `ui/panel-groups.ts:45-56,574` |
| Multiple monitors | Cap. 25, p.158 | Não descola; estica a janela do Spine por dois monitores | diferente | Descola o painel e ele FLUTUA dentro da janela do editor — `ui/panel-groups.ts:57-70,708` (`floatPanel`). Janela do sistema: vetado pelo Humberto |

#### §15 Animations

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Lista de animações | Cap. 26 Animations view, p.160 | Clique ativa; duplo clique renomeia; botão direito escolhe na árvore; ícone ao lado da aba cria | diferente | Clique abre — `panels/animations.ts:308`; criar é botão na barra — `panels/animations.ts:75`. Difere: sem duplo clique para renomear (é botão, `animations.ts:77`) e sem botão direito |
| Vários esqueletos (caixa de escolha) | Cap. 26, p.160 | Caixa escolhe de que esqueleto é a lista | não se aplica | Um `.bone` tem um esqueleto só (formato §4.1); a importação avisa quando a origem tinha vários — `ui/shell-file.ts:489-496` |

#### §15 Audio

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Eventos de áudio (lista com onda) | Cap. 27 Audio view, p.162 | Lista colorida das chaves de áudio com a forma de onda; clique leva a agulha à chave | falta | formato tem (§4.5 `audio`, §2.8 `audioBase`), falta porta. O editor não toca nem desenha som |
| Volume | Cap. 27, p.163 | Barra de volume do editor, com mudo | falta | Não há volume de tocar. Existe só o número `volume` de cada chave de evento — `anim/event-keys.ts:55` — que é dado do arquivo, não controle de ouvir |
| Audio device | Cap. 27, p.163 | Caixa escolhe a saída de som | falta | O editor não toca som |

#### §15 Dopesheet

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Overview row | Cap. 28 Dopesheet, p.164 | Primeira linha com o nome da animação e TODAS as chaves; mexer nela mexe em tudo | igual | Linha **Resumo** — `panels/dopesheet.ts:684-691`; arrastar o losango do Resumo — `panels/dopesheet.ts:779` |
| Bone rows | Cap. 28, p.165 | Grupo por osso; `-`/`+` recolhe; clique no nome escolhe o osso; arrastar reordena | diferente | O grupo existe, mas é só um título — `panels/dopesheet.ts:866-870`. Sem recolher, sem clicar, sem arrastar |
| Property rows | Cap. 28, p.165 | Uma linha por propriedade; clique no nome escolhe o item na cena e a ferramenta | diferente | Linha por propriedade existe — `panels/dopesheet.ts:872-895`. Clique no nome só MARCA a linha na folha — `panels/dopesheet.ts:882,1242-1254` |
| Interpolation | Cap. 28, p.166 | Traço entre chaves: reta = linear, curva = Bézier, pontilhado = degrau | falta | A folha não desenha traço entre chaves (`panels/dopesheet.ts:897-933` só põe o losango). A curva se troca pelo botão direito no losango — `panels/dopesheet.ts:916-947` |
| Contents: unlocked | Cap. 28, p.166 | Destravada, a folha mostra só as linhas dos ossos escolhidos; nada escolhido mostra tudo | diferente | Mostra TUDO por padrão; "Mostrar só os escolhidos" é interruptor no ⋯ Mais — `panels/dopesheet-model.ts:331-336`, `anim/keying.ts:1360-1376` |
| Contents: locked | Cap. 28, p.167 | Cadeado guarda as linhas; trocar a escolha não muda a folha | falta | Sem cadeado de linhas |
| Refresh | Cap. 28, p.167 | Botão refaz as linhas pela escolha de agora | falta | Sem o botão |
| Select | Cap. 28, p.168 | Botão escolhe na cena os ossos das linhas mostradas | falta | Sem o botão |
| Order | Cap. 28, p.168 | Linhas na ordem em que os ossos foram escolhidos; arrastar reordena | falta | Ordem é a do arquivo — `anim/keying.ts:1355-1359`. Sem arrastar |
| Visibility | Cap. 28, p.168 | Linha de osso de pele só com a pele ativa | não confirmei | Não achei regra de pele nas linhas da folha |
| Filters | Cap. 28, p.168 | Botão de filtro por tipo de propriedade; fica vermelho ligado | falta | Sem filtro por tipo. O único filtro é por escolha (linha acima) |
| Timeline position | Cap. 28, p.169 | Campo com o QUADRO; digitar e Enter leva a agulha | diferente | Campo "Tempo" em SEGUNDOS no tocador — `panels/dopesheet-model.ts:141-147` |
| Loop | Cap. 28, p.169 | Botões Loop Start/End no quadro atual; não fica na animação | diferente | `Alt` + clique na régua marca começo, `Alt` + direito marca fim — `panels/dopesheet.ts:1535-1541`. Fica guardado no estado do editor — `panels/dopesheet-edit.ts:139-158` |
| Box selection | Cap. 28, p.170 | Arrastar no vazio faz caixa; bordas da caixa esticam as chaves; `Shift` tira o encaixe | diferente | Arrastar no vazio faz caixa — `panels/dopesheet-pointer.ts:84-122`. Difere: as alças de esticar ficam na linha Resumo — `panels/dopesheet.ts:742-770`; `Shift` soma à seleção |
| Clipboard | Cap. 8 Keys · Cap. 28, p.171 | Botões Copiar, Recortar, Apagar, Colar; Ctrl+C/X/V | igual | Botões na barra — `panels/dopesheet-player.ts:551-558`; teclas no menu Editar — `ui/menus.ts:290-294` |
| Shift | Cap. 8 Keys · Cap. 28, p.171 | Botão liga o modo: mover uma chave move as de depois; ou `Alt` ao arrastar | diferente | Janela "Empurrar as chaves…", com a escolha "estas e tudo o que vem depois" — `panels/dopesheet-edit.ts:303-330`. `Alt` no arrasto tira o encaixe |
| Offset | Cap. 8 Keys · Cap. 28, p.172 | Botão liga: chave que passa do fim volta pelo começo, laço mantido | falta | Sem o modo. "Fechar ciclo" é outra coisa (copia a 1ª chave no fim) — `panels/dopesheet-edit.ts:437` |
| Adjust | Cap. 28, p.172 | Ligado, girar/mover o osso soma o mesmo tanto em TODAS as chaves escolhidas | falta | Sem o modo |
| Key shown | Cap. 8 Keys · Cap. 28, p.173 | Botão / Ctrl+Shift+L chaveia todas as linhas mostradas | diferente | "Chavear tudo" chaveia todas as linhas que a animação TEM, mostradas ou não — `panels/dopesheet-model.ts:176-181`, `panels/dopesheet-edit.ts:565` |
| Sync | Cap. 28, p.173 | Folha mostra as linhas das curvas visíveis no gráfico; zoom casado | falta | Folha e Curvas são abas da mesma faixa; não há casamento |
| View settings | Cap. 28, p.174 | Esconder a barra; esconder as linhas | diferente | Faixa fechada (tocador, régua, Resumo) e botão **Detalhes** abre o resto — `panels/dock-model.ts:10-20` |

#### §15 Ghosting

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Frames | Cap. 29 Ghosting, p.175 | Antes/Depois/Atual; barras de alcance em quadros e passo | diferente | Quantos antes, quantos depois e passo em SEGUNDOS — `viewport/onion.ts:40-50,876-885`. Sem fantasma do quadro atual |
| Key Frames | Cap. 29, p.175 | Seção própria: fantasma só em quadro com chave, junto com Frames | diferente | Interruptor "Só nas chaves" que TROCA o modo — `viewport/onion.ts:867-874`, `panels/dopesheet-player.ts:810` |
| Motion Vectors | Cap. 29, p.176 | Linhas de movimento dos vértices, com limiar | falta | Sem vetores |
| Display | Cap. 29, p.176 | Cor antes/depois; imagem tingida ou sólida; contorno silhueta ou raio-X | diferente | Cor antes/depois igual — `viewport/onion.ts:908-910`. Desenho: só ossos ou silhueta cheia — `viewport/onion.ts:931-975,1030-1031`. Sem imagem tingida, sem raio-X |
| Anchor | Cap. 29, p.177 | Fantasma preso a intervalos a partir do quadro 0 | falta | Fantasma sempre relativo à agulha — `viewport/onion.ts:876-885` |
| On top | Cap. 29, p.177 | Fantasma por cima do esqueleto | falta | Sempre por baixo — `viewport/viewport-draw.ts:81-82` |
| Loop | Cap. 29, p.177 | Com Repeat, fantasma passa do começo e do fim | falta | Corta em 0 e na duração — `viewport/onion.ts:879,883` |
| Offset | Cap. 29, p.178 | X/Y em pixels POR QUADRO, para achar pé que escorrega | diferente | X/Y existem, mas multiplicados pela ORDEM do fantasma, não por quadro — `viewport/onion.ts:896-897` |
| Selection | Cap. 29, p.180 | Botão: fantasma só dos ossos escolhidos; cadeado e refazer | falta | Fantasma sempre do esqueleto inteiro — `viewport/onion.ts:1025-1033` |

#### §15 Graph

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Stepped | Cap. 30 Graph, p.186 | Escolher chaves, clicar no botão da curva | diferente | Botão "Degrau" — `anim/curves.ts:382-387`, `panels/graph.ts:356-360`. Difere: vale para UMA chave. Para várias, botão direito na folha — `panels/dopesheet.ts:936-947` |
| Linear | Cap. 30, p.186 | Idem | diferente | Botão "Linear" — `anim/curves.ts:375-380`. Mesma diferença: uma chave só |
| Bezier | Cap. 30, p.186 | Botão Bezier; clicar de novo zera as alças | diferente | Sem botão "Bézier" puro: arrastar a alça transforma a reta em Bézier — `panels/graph.ts:1010-1022` |
| Automatic | Cap. 30, p.187 | Alças automáticas (triângulo), recalculadas pelos vizinhos | falta | Sem alça automática |
| Separate | Cap. 30, p.187 | Separa as duas alças da chave; `Alt` ao arrastar | diferente | As alças já são sempre soltas: cada segmento tem as suas — `panels/graph.ts:13-18` |
| Flat | Cap. 30, p.187 | Alças na horizontal | falta | Sem o preset |
| Bounce | Cap. 30, p.187 | Separa e aponta as alças para as chaves vizinhas | falta | Sem o preset. "Passa do alvo" e "Recua e passa" são outra conta (overshoot) — `anim/curves.ts:388-401` |
| Ease out | Cap. 30, p.187 | Mais devagar perto da chave | diferente | Existe como **"Entrada suave"** — `anim/curves.ts:360-366`. Difere o nome: o "out" do Spine é a "Entrada" daqui |
| Ease in | Cap. 30, p.187 | Mais devagar perto da chave seguinte | diferente | Existe como **"Saída suave"** — `anim/curves.ts:367-373`. Nome trocado, como acima |
| Repeat | Cap. 30, p.185 | Curva apagada antes e depois da animação | falta | O gráfico vai de 0 à duração — `panels/graph.ts:460-467` |
| Separate properties | Cap. 30, p.185 | X/Y e cor/alfa separáveis em chaves próprias | diferente | X e Y já nascem separados no formato (§9.4). Cor: 4 curvas numa chave só — `panels/graph.ts:82-84`, sem separar |
| Frame | Cap. 30, p.189 | Botão enquadra todas as curvas, ou só as escolhidas | diferente | Botão "Ajustar" refaz só a escala VERTICAL — `panels/graph.ts:515-520`. O tempo é sempre a animação inteira |
| Auto | Cap. 30, p.189 | Interruptor: zoom automático inteligente | diferente | Sem interruptor: reenquadra sozinho quando muda o conjunto de linhas — `panels/graph.ts:540-549` |
| Sync | Cap. 30, p.190 | Folha mostra as linhas do gráfico | falta | Sem casamento folha–gráfico |
| Box selection | Cap. 30, p.190 | Arrastar no vazio seleciona chaves; bordas esticam | falta | Uma chave por vez — `panels/graph.ts:862-872` |
| New keys | Cap. 30, p.190 | Chave nova no meio de Bézier herda o tipo e não muda a curva | não confirmei | Não achei a divisão da Bézier na chave nova |
| Axes | Cap. 30, p.191 | Botões prendem o arrasto só em cima/baixo ou só lado | falta | O arrasto mexe tempo e valor juntos — `panels/graph.ts:977-1004` |
| Snapping | Cap. 30, p.191 | Encaixe no quadro; ímã no valor de outras chaves (Shift+Alt) | diferente | Só o encaixe no quadro; `Alt` solta — `panels/graph.ts:990-994`. Sem ímã de valor |
| Clipboard | Cap. 30, p.191 | Botões copiar/colar chaves | falta | O gráfico não copia. Copiar é na folha |
| Shift | Cap. 30, p.191 | Mover uma chave move as de depois | falta | Não no gráfico |
| Offset | Cap. 30, p.191 | Chave dá a volta pelo laço | falta | Não no gráfico |
| Handle modes: Value | Cap. 30, p.192 | Mover chave no tempo escala as alças, mantendo máximos | falta | Sem o modo |
| Handle modes: Shape | Cap. 30, p.192 | Mover chave no tempo mantém a forma da curva | falta | Sem o modo |
| Favor | Cap. 30, p.192 | Barra leva as chaves para perto da anterior ou da seguinte (pose de passagem) | falta | Sem a barra |
| Store | Cap. 30, p.194 | Guarda as curvas ao fundo; Swap troca guardada e atual | falta | Sem o botão |

#### §15 Mesh Tools

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Size | Cap. 31 Mesh Tools, p.202 | Barra: raio da seleção suave de vértices | falta | Sem seleção suave de vértices |
| Feather | Cap. 31, p.202 | Barra: queda da seleção suave | falta | Idem |
| Hull vertices | Cap. 31, p.203 | Desligado, o contorno não entra na seleção suave | falta | Idem |

#### §15 Metrics

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Bones | Cap. 32 Metrics, p.204 | Número na tela | falta | Sem painel de métricas |
| Constraints | Cap. 32, p.204 | Número na tela | falta | Idem |
| Slots | Cap. 32, p.205 | Número na tela | falta | Idem |
| Attachments: Total | Cap. 32, p.205 | Número na tela | falta | Idem |
| Attachments: Visible | Cap. 32, p.205 | Número na tela | falta | Idem |
| Attachments: Vertices | Cap. 32, p.205 | Soma dos vértices visíveis | diferente | Só da malha escolhida, na dica do título do painel Malha — `panels/mesh-panel.ts:456-462` |
| Attachments: Vertex transforms | Cap. 32, p.205 | Número na tela | falta | Idem |
| Attachments: Triangles | Cap. 32, p.206 | Soma dos triângulos visíveis | diferente | Só da malha escolhida, na mesma dica — `panels/mesh-panel.ts:458-462` |
| Attachments: Area | Cap. 32, p.206 | Pixels desenhados | falta | Sem a conta |
| Attachments: Clipping polygons | Cap. 32, p.206 | Número na tela | falta | Idem |
| Attachments: Clipped triangles | Cap. 32, p.206 | Número na tela | falta | Idem |
| Timelines | Cap. 32, p.206 | Linhas de tempo das animações ativas | falta | Sem a contagem |
| CPU usage | Cap. 32, p.207 | Texto de orientação | não se aplica | É explicação do manual sobre gargalo, não número nem gesto |
| Fill rate | Cap. 32, p.208 | Texto de orientação | não se aplica | Idem |
| Draw calls | Cap. 32, p.208 | Texto de orientação | não se aplica | Idem |

#### §15 Outline

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Contorno (segunda vista limpa da cena) | Cap. 33 Outline, p.209 | Painel com a pose sem ossos nem seleção; clique centra a cena ali | falta | Sem o painel. A Prévia toca animação, não mostra a pose de agora |
| Ghosting (ajuste da vista) | Cap. 33, p.210 | Liga ou tira o fantasma nesta vista | falta | Idem |

#### §15 Playback

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Timeline FPS | Cap. 34 Playback, p.211 | Barra no painel; chaves ficam no mesmo QUADRO e a velocidade muda | diferente | Campo em Arquivo → Configurações do projeto — `ui/shell-file.ts:353-364`, e nas Propriedades do esqueleto — `panels/properties-model.ts:1041`. Difere: as chaves são em segundos (§4.1: fps é só dica), então a velocidade não muda |
| Speed | Cap. 34, p.212 | Barra de velocidade e botões de porcentagem | diferente | Barra de 10% a 200% no tocador — `panels/dopesheet-model.ts:133-140,191-210`. Sem os botões de porcentagem (eram lista, virou barra — `panels/dopesheet-player.ts:234`) |
| Stepped | Cap. 34, p.212 | Tocar tudo em degrau, sem interpolar | falta | Sem o modo |
| Interpolated | Cap. 34, p.212 | Desligado, toca arredondando ao quadro | falta | Sem o modo |

#### §15 Preview

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Animations | Cap. 35 Preview, p.213 | Lista à direita; clique põe na trilha ativa; clicar de novo tira | diferente | Lista suspensa por camada — `panels/preview.ts:336-363` |
| Tracks | Cap. 35, p.214 | Botões de trilha; até 15, aparecem conforme se usa | diferente | 4 camadas fixas — `panels/preview-model.ts:24`, `panels/preview.ts:336` |
| Speed | Cap. 35, p.214 | Barra, com botão de 100% | diferente | Lista de valores por camada — `panels/preview.ts:374-385` |
| Mix | Cap. 35, p.215 | Barra de tempo de mistura | diferente | Campo numérico de 0 a 5 s — `panels/preview.ts:401-413` |
| Repeat | Cap. 35, p.215 | Vale para a PRÓXIMA animação da trilha | diferente | Caixa "repetir" que vale na hora — `panels/preview.ts:366-372` |
| Alpha | Cap. 35, p.215 | Barra mistura a trilha com as de baixo | igual | Barra 0 a 1 por camada — `panels/preview.ts:387-399` |
| Hold previous | Cap. 35, p.215 | Botão segura a anterior inteira durante a mistura | falta | Sem o botão |
| Additive | Cap. 35, p.216 | Botão soma a animação à pose de baixo | falta | formato tem (§4.6 `blend: "add"`, e o runtime lê `MixBlend 'add'`), falta porta na Prévia |
| Show bones | Cap. 35, p.216 | Ajuste mostra os ossos na prévia | falta | Sem o ajuste |

#### §15 Skins

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Lista de skins | Cap. 36 Skins view, p.218 | Clique ativa; duplo clique renomeia; botão direito escolhe na árvore; ícone cria | diferente | Painel **Peles**: lápis marca onde nasce o desenho, duplo clique no nome renomeia, `+` cria — `panels/skins.ts:70,242-262`. Sem botão direito |
| Pins | Cap. 36, p.219 | Alfinete na linha (ao passar o mouse) põe a pele na lista fixa | diferente | O olho de cada linha liga a pele na cena, várias ao mesmo tempo — `panels/skins.ts:225-238` |
| Pinned skins | Cap. 36, p.219 | Lista embaixo; arrastar muda a ordem de aplicar | diferente | A ordem é a ordem em que se ligou; sem lista própria e sem arrastar — `viewport/onion.ts:720-737` |

#### §15 Slot Color

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Cor do slot em painel próprio | Cap. 37 Slot Color, p.220 | Seletor de cor sempre aberto; escolher o anexo já pinta o slot dele | diferente | Campo "Cor" (RGBA) no grupo Cor das Propriedades do slot — `panels/properties-model.ts:707-712` |

#### §15 Timeline

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Linha do tempo em painel próprio | Cap. 38 Timeline view, p.221 | A régua vira painel, posto onde se quiser | diferente | A régua mora sempre na faixa de baixo, com o tocador e o Resumo — `panels/dock-model.ts:10-20` |

#### §15 Tree

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Tree nodes | Cap. 39 Tree view, p.222 | Árvore com tudo: ossos, slots, anexos, skins, animações, eventos | diferente | Árvore de ossos e desenhos; animações e peles em abas próprias — `panels/tree.ts:1-9`, `ui/panel-groups.ts:84-87` |
| Expand and collapse | Cap. 39, p.222 | Clique à esquerda do ícone; botão direito abre/fecha com os filhos; botões no topo | diferente | Seta por osso — `panels/tree.ts:734-752`. Sem botão direito recursivo, sem botões de topo |
| Selection | Cap. 39, p.222 | Clique; Ctrl soma; Shift faixa; PageUp/PageDown no histórico | diferente | Clique escolhe UM — `panels/tree-rows.ts:428-447`, `panels/tree.ts:661-674`. Sem Ctrl, Shift nem histórico |
| Auto scroll | Cap. 39, p.223 | Escolher na cena abre e rola a árvore até o item | falta | Não achei rolagem na Árvore |
| Visibility | Cap. 39, p.223 | Ponto de visibilidade na borda esquerda | igual | Olho por linha — `panels/tree.ts:857-883` |
| Keying | Cap. 39, p.223 | Botão de chave na linha, no modo animar | falta | Sem chave na Árvore |
| Annotations | Cap. 39, p.223 | Ícones à direita (pele, restrição), clicáveis | diferente | Marca de regra no osso, só de aviso, sem clique — `panels/tree.ts:643-654` |
| Properties | Cap. 39, p.224 | Propriedades embaixo da árvore | diferente | Aba **Propriedades** separada, no mesmo grupo da Árvore — `ui/panel-groups.ts:84-86` |
| Drag and drop | Cap. 39, p.224 | Arrastar para outro pai | igual | `panels/tree.ts:694-716` |
| Image preview | Cap. 39, p.224 | Parar o mouse mostra a imagem num balão; F1 na hora | diferente | Miniatura fixa na própria linha — `panels/tree.ts:633-637,902` |
| Shortcuts | Cap. 39, p.224 | F2 renomeia; duplo clique renomeia; duplo clique em Animations cria; direito no ponto afeta filhos | diferente | F2 — `ui/menus.ts:309`; duplo clique renomeia — `panels/tree.ts:675-679`. Sem os outros |
| Filters | Cap. 39, p.225 | Botão filtra por tipo de nó | falta | Sem filtro por tipo |
| Filter buttons | Cap. 39, p.225 | Botões rápidos: ossos, slots, anexos | falta | Sem os botões |
| Find and replace | Cap. 39, p.226 | Janela: texto, regex, escopo, tipos, lista para marcar | diferente | "Substituir nomes…" troca pedaço de nome em ossos, slots e regras — `panels/rename.ts:236-270`, `ui/menus.ts:311`. Sem regex, escopo, tipos ou lista para desmarcar |
| Text search | Cap. 39, p.228 | Caixa de busca; Enter/F3 próximo; curinga `*` `?` | diferente | Lupa abre caixa que FILTRA a árvore — `panels/tree.ts:356-410`, `panels/tree-rows.ts:336-349`. Sem próximo/anterior, sem curinga |
| View settings | Cap. 39, p.229 | Esconder nome do esqueleto, pastas de slot, anexos de todas as peles… | falta | Sem ajustes de vista da Árvore |

#### §15 Weights

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Bind | Cap. 40 Weights, p.236 | Escolher a malha, clicar Bind, clicar nos ossos; ou ossos antes e a malha depois | igual | Botão "Ligar ossos" e clique nos ossos — `panels/mesh-panel.ts:666`, `panels/mesh-panel-model.ts:67-133`. O caminho "ossos antes" não confirmei |
| Bones list | Cap. 40, p.236 | Peso de cada osso NO VÉRTICE escolhido; `*` quando varia; Remove | diferente | Lista com cor e média de peso da malha INTEIRA — `panels/mesh-panel.ts:680-715` |
| Triangle order | Cap. 40, p.237 | Arrastar osso na lista muda que triângulo fica por cima | falta | Sem ordem de triângulos |
| Pies | Cap. 40, p.237 | Caixa liga as pizzas por vértice | diferente | Pizza sempre desenhada com a ferramenta Pesos, sem caixa — `viewport/tools/weights-tool.ts:151,285-294` |
| Overlay | Cap. 40, p.237 | Caixa pinta a malha com a cor dos ossos | falta | Sem o preenchimento |
| Selected | Cap. 40, p.237 | Pizza só do escolhido; outros ossos em preto | falta | Sem o ajuste |
| Weights tool: Direct | Cap. 40, p.238 | Arrastar para cima/baixo muda o peso dos vértices escolhidos; barra de valor exato | falta | Sem o modo direto |
| Weights tool: Brushes | Cap. 40, p.239 | Add, Remove, Replace; força, tamanho, queda | diferente | Somar, Subtrair, Substituir e mais Suavizar — `panels/mesh-panel.ts:165-168`; raio e força — `viewport/tools/weights-tool.ts:39-48`. Queda não é barra |
| Copiar e colar pesos | Cap. 40, p.240 | Ctrl+C / Ctrl+V entre vértices escolhidos | falta | Não achei |
| Auto | Cap. 40, p.241 | Botão; só nos vértices ou ossos escolhidos, se houver | diferente | Botão "Pesos automáticos" — `panels/mesh-panel.ts:570,819-834`. Sempre na malha inteira |
| Smooth | Cap. 40, p.241 | Botão; só nos vértices escolhidos; repetir espalha mais | diferente | "Suavizar tudo" — `panels/mesh-panel.ts:575,836-842`. Sempre a malha inteira |
| Prune | Cap. 40, p.241 | Barras de limiar e de máximo de ossos, com prévia viva | diferente | "Podar" com limiar fixo de 2% — `panels/mesh-panel.ts:576,844-850`. Sem barras. `limitInfluences` existe sem porta — `mesh/weights.ts:320` |
| Weld | Cap. 40, p.242 | Iguala pesos entre duas malhas | falta | Não achei |
| Swap | Cap. 40, p.242 | Troca pesos entre dois ossos da lista | falta | Não achei |
| Lock | Cap. 40, p.242 | Cadeado no quadrado de cor, ao passar o mouse | diferente | Caixa "Travar" sempre à vista na lista — `panels/mesh-panel.ts:699-705` |
| Update bindings | Cap. 40, p.243 | Botão refaz a ligação na pose de agora | falta | Não achei |

---

### §16 Tela inicial

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Projects | Cap. 41 Welcome, p.246 | Novo, Abrir, Recentes com busca por digitação, Exemplos | diferente | Botões no meio da cena vazia: Abrir pasta, PSD, o herói, Começar vazio — `viewport/welcome-model.ts:36-61`. Recentes no menu Arquivo — `ui/menus.ts:211-216`. Sem busca |
| News | Cap. 41, p.247 | Posts do blog | não se aplica | Programa local, sem blog e sem internet |
| Tips | Cap. 41, p.247 | Uma dica por abertura | falta | Sem dicas |
| Learn | Cap. 41, p.247 | Links para manual e fórum | diferente | Ajuda → Manual (F1) — `ui/menus.ts:871` |
| Changelog | Cap. 41, p.247 | Últimas mudanças na tela | falta | O `CHANGELOG` existe na raiz, sem porta no programa |

### §17 Versões

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Editor version numbers | Cap. 42 Versioning, p.248 | `major.minor.patch` do editor | diferente | O editor grava `generator: "Recorte 0.1.0"` — `editor/src/doc/new-file.ts:14-15`. É só informação (§2.3) |
| Runtime version numbers | Cap. 42, p.248 | Runtime `major.minor` casa com o editor | diferente | O runtime casa com o FORMATO `major.minor`, não com o editor — `runtime/src/loader.ts:306-327` |
| Stable | Cap. 42, p.248 | Canal estável | não se aplica | Sem canais de distribuição |
| Beta | Cap. 42, p.248 | Canal beta | não se aplica | Idem |
| Choosing a version | Cap. 42, p.249 | Lançador escolhe a versão do editor | não se aplica | Sem lançador; `programa/` é um só |
| Synchronizing versions | Cap. 42, p.249 | Versão do editor TEM que casar com a do runtime | diferente | `minor` novo abre em leitor velho com leitura parcial e aviso — `runtime/src/loader.ts:319-326`, formato §2.4 |
| Project files | Cap. 42, p.250 | Projeto abre em editor mais novo; aviso antes de salvar em versão nova | diferente | O projeto É o `.bone`; arquivo mais novo abre com aviso — `runtime/src/loader.ts:316-326`. Aviso antes de salvar: não achei |
| Recovering work from a newer version | Cap. 42, p.250 | Exportar JSON numa versão antiga e importar | não se aplica | `minor` nunca quebra e arquivo novo abre em "melhor esforço" (§2.4) |
| File storage | Cap. 42, p.251 | Guardar o projeto; exportação perde dado | diferente | Projeto e dado são o mesmo `.bone`; o estado do editor viaja em `RECORTE_editor_state` — `editor/src/contract.ts:13,40` |

### §18 Exportar

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| JSON | Cap. 43 Export, p.253 | Ctrl+E, janela: pasta, extensão, formato, pretty print, versão, nonessential, limpeza, pack | diferente | O `.bone` já é o JSON: Arquivo → Salvar — `ui/menus.ts:229`. Sem janela de opções |
| Binary | Cap. 43, p.254 | Janela de exportação binária | diferente | "Salvar como binário…" (`.boneb`) — `ui/menus.ts:231`, `io/save-binary.ts:126` |
| GIF | Cap. 43, p.255 | Cores, dither, limiar de alfa, fundo, matte, qualidade, FPS, laço, último quadro | diferente | Exportar → Imagem…, GIF com cores, laço, fundo, FPS — `io/export-image.ts:47,57-98`. Sem dither, matte, qualidade, último quadro |
| PNG | Cap. 43, p.256 | Sequência de PNG; compressão; pack | diferente | Sequência de PNG em `.zip` e folha de sprites — `io/export-image.ts:5-8,93-97` |
| APNG | Cap. 43, p.256 | PNG animado | falta | Não sai |
| PSD | Cap. 43, p.257 | Uma camada por quadro | falta | Não sai |
| JPEG | Cap. 43, p.257 | Sequência JPEG com qualidade | falta | Não sai |
| AVI | Cap. 43, p.258 | Vídeo com codec | falta | Não sai (decisão de 10/09). No lugar sai WebM — `io/export-image.ts:10-18` |
| MOV | Cap. 43, p.258 | Vídeo QuickTime | falta | Idem |
| Common settings | Cap. 43, p.259 | Animação/todas, esqueletos, peles, saída, bounds, ossos, suavização, MSAA, recorte, tamanho, trecho, warm up | diferente | Animação ou todas, FPS, escala, fundo, corte automático, ossos, trecho de/até — `io/export-image.ts:57-98`. Sem pele, bounds, suavização, recorte manual |
| Preview panel | Cap. 43, p.260 | Prévia com barra de quadros, caixa de corte e tamanho estimado | falta | Tamanho só DEPOIS de exportar — `io/export-image.ts:692-703` |
| Additive blending | Cap. 43, p.261 | Aditivo sobre fundo transparente não soma | não confirmei | A exportação usa o mesmo desenhador da cena (`io/export-image.ts:20-25`), que conhece `additive` (`runtime/src/color.ts:64,71`). Sobre fundo transparente não conferi |
| Salvar e carregar preset de exportação | Cap. 43, p.261 | Save/Load grava as opções num JSON | diferente | Ctrl+Shift+E repete a última, guardada no navegador — `io/last-export.ts:1-20`, `ui/menus.ts:259`. Sem arquivo |
| Disabling export | Cap. 43, p.261 | Propriedade Export desligada tira o item da saída | falta | Não achei a propriedade no formato nem no editor |

### §19 Atlas de textura

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Texture atlas files | Cap. 44 Texture packing, p.271 | `.atlas` de texto e páginas PNG | diferente | `.atlas.json` (§10) — `ferramentas/src/atlas/packer.ts:30-64` |
| Packing during data export | Cap. 44, p.272 | Caixa Pack na exportação JSON/binária | diferente | O atlas nasce no **Salvar**, só com as imagens em uso — `io/folder-save.ts:1-20` |
| Running the packer separately | Cap. 44, p.273 | Menu Texture Packer, janela | diferente | Só na linha de comando — `ferramentas/empacotar.mjs:1-13` |
| Settings: Regions | Cap. 44, p.274 | Corte, rotação, apelidos, ignorar vazias, limiar de alfa | diferente | Opções de linha de comando `--sem-corte`, `--sem-rotacao`, `--sem-apelidos` — `ferramentas/empacotar.mjs:40-42`. Limiar de alfa só no código — `packer.ts:106-107` |
| Settings: Region padding | Cap. 44, p.274 | Padding X/Y, borda, padding duplicado | diferente | `--padding`, `--sangria` — `ferramentas/empacotar.mjs:33-34`. Borda só no código — `packer.ts:100-101` |
| Settings: Pages | Cap. 44, p.275 | Mín/máx, potência de 2, múltiplo de 4, quadrado | diferente | `--max`, `--pot`, `--multiplo-de-4`, `--quadrado` — `ferramentas/empacotar.mjs:32-37`. Mínimo só no código — `packer.ts:94-97` |
| Settings: Runtime | Cap. 44, p.275 | Filtro, wrap, formato | falta | formato tem (§10.3 `minFilter`, `wrapU`…), e o empacotador aceita — `packer.ts:131-135` — falta porta |
| Settings: Output | Cap. 44, p.275 | PNG/JPG, grade/retângulos/polígonos, pré-multiplicado, bleed, escalas, sufixo | diferente | `--grade`, `--premultiplicado`, `--escala` — `ferramentas/empacotar.mjs:38-43`. Sem JPG, polígonos, sufixo |
| Settings: Options | Cap. 44, p.276 | Extensão, juntar subpastas, achatar caminhos, índices, legado, debug, auto escala… | falta | Sem essas opções |
| Settings: Other | Cap. 44, p.276 | `ignore`, `bleedIterations`, `separator` no JSON | falta | Idem |
| Folder structure | Cap. 44, p.276 | Cada pasta vira seu grupo de páginas | diferente | Lê subpastas, mas junta tudo nas mesmas páginas; a subpasta vai no nome — `ferramentas/empacotar.mjs:126,187` |
| JSON Configuration | Cap. 44, p.277 | `pack.json` por pasta, herdado | falta | Não achei |
| Texture atlas name | Cap. 44, p.278 | Nome vira `nome.atlas`, `nome.png`, `nome2.png` | igual | `<saida>` vira `saida.atlas.json`, `saida.png`, `saida2.png` — `ferramentas/empacotar.mjs:9-13`, `packer.ts:785` |
| Ninepatches | Cap. 44, p.278 | Arquivo `.9` guarda divisão | falta | Não achei |
| Image indexes | Cap. 44, p.278 | `nome_23` guarda o índice na região | diferente | `mao_01` vira quadro de SEQUÊNCIA (§7.10) — `ferramentas/src/atlas/packer.ts:173-180` |
| Texture Unpacker | Cap. 44, p.279 | Desmonta o atlas em imagens soltas | falta | Não achei |

### §20 Importar

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Project: Skeleton | Cap. 45 Import, p.282 | Import Project traz um esqueleto de outro projeto | falta | Não há importar de outro `.bone` para o aberto |
| Project: Animation | Cap. 45, p.282 | Traz animações para outro esqueleto, casando nomes | falta | Idem |
| Data: Scale | Cap. 45, p.283 | Escala todo o dado ao importar | falta | `importar.mjs` não tem escala — `ferramentas/importar.mjs:11-16` |
| Data: New project | Cap. 45, p.284 | Marcado, importa num projeto novo | diferente | Importar de outro programa SEMPRE troca o documento, e pergunta antes — `ui/shell-file.ts:475-483` |
| Data: Create a new skeleton | Cap. 45, p.284 | Importa como esqueleto novo no projeto atual | não se aplica | Um `.bone` tem um esqueleto só (§4.1) |
| Data: Import into an existing skeleton | Cap. 45, p.284 | Traz ossos, slots, peles para esqueleto existente | falta | Só o PSD acrescenta (linha do PSD abaixo); dado de outro programa, não |
| Data: Existing attachments | Cap. 45, p.284 | Ignorar ou Substituir o que já existe | falta | Idem |
| Data: Nonessential data | Cap. 45, p.284 | Sem ele, reimportar perde cor, arestas… | não se aplica | O `.bone` é o projeto; o estado do editor vai sempre junto (`RECORTE_editor_state`) |
| Import PSD: Import PSD File | Cap. 46 Import PSD, p.288 | Janela: caminho, escala, padding, cortar, ignorar ocultas | diferente | Escolhe o `.psd`/`.psb` sem janela de opções — `io/import-psd.ts:83`. Oculta ENTRA desligada — `io/import-psd.ts:364`. Padding e corte só na linha de comando — `ferramentas/importar-psd.mjs:34-38` |
| Import PSD: Output PNG Files | Cap. 46, p.288 | Pasta de PNG soltos; confirmar sobrescrever | diferente | As camadas vão para um atlas empacotado, não PNG soltos — `io/import-psd.ts:4-7,213` |
| Import PSD: Import Data | Cap. 46, p.289 | Mesma janela do Import Data | diferente | Pergunta Substituir ou Acrescentar — `io/import-psd.ts:489-530` |
| Import PSD: Origin | Cap. 46, p.289 | Primeira guia do PSD, ou tag `[origin]` | diferente | Sempre o centro da tela do PSD — `ferramentas/src/importar/psd.ts:712-722` |
| Import PSD: Tags de grupo e de camada | Cap. 46, p.289 | `[bone]`, `[slot]`, `[skin]`, `[mesh]`, `[merge]`… | diferente | Só a camada `ossos`, desenhada, vira esqueleto — `ferramentas/src/importar/psd-bones.ts:1-20`. Sem as tags |
| Import PSD: Attachment properties | Cap. 46, p.291 | Slot, pele, placeholder e caminho saem das tags | diferente | Um slot e uma região por camada; grupo vira pasta no nome — `ferramentas/src/importar/psd.ts:15-18`, `io/import-psd.ts:6-8` |
| Import PSD: Slashes | Cap. 46, p.291 | `/` no começo ignora os grupos de cima | falta | Não achei |
| Import PSD: Blending Modes | Cap. 46, p.292 | Normal, Multiply, Screen, Linear Dodge viram a mistura do slot | igual | `ferramentas/src/importar/psd.ts:724-732`, `io/import-psd.ts:259-266,365-366`; modo desconhecido avisa — `io/import-psd.ts:367-368` |
| Import PSD: Draw order | Cap. 46, p.292 | Ordem das camadas vira ordem de desenho | igual | `io/import-psd.ts:8-9,252` |
| Import PSD: Limitations | Cap. 46, p.292 | Estilo, máscara em gradiente, camada de ajuste não entram | diferente | Avisa camada por camada: máscara, camada desligada — `ferramentas/src/importar/psd.ts:593,620` |

### §21 Linha de comando

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Editor | Cap. 47 CLI, p.293 | `Spine --help`, `--version`, `projeto.spine` abre | diferente | Não há um programa só: cada ferramenta responde `--ajuda` — `ferramentas/empacotar.mjs:44`, `ferramentas/converter.mjs:53`. Sem `--version` |
| Export | Cap. 47, p.294 | `-e json\|binary[+pack]` ou JSON de ajustes | diferente | `exportar-imagem.mjs` (opções soltas) — `ferramentas/exportar-imagem.mjs:34-54`; binário por `converter.mjs` — `ferramentas/converter.mjs:42-53`. Sem arquivo de ajustes |
| Import | Cap. 47, p.295 | `-i dado -o projeto -r nome` | diferente | `importar.mjs entrada saida.bone` — `ferramentas/importar.mjs:7-16`; PSD — `ferramentas/importar-psd.mjs:34-42`. Sem juntar em projeto existente |
| Clean up | Cap. 47, p.295 | `-m` limpa animações e salva | diferente | Só no editor: "Limpar chaves repetidas", na animação aberta — `panels/dopesheet-edit.ts:470-480` |
| Pack | Cap. 47, p.295 | `-i imagens -o saida -p nome\|pack.json` | diferente | `empacotar.mjs pasta saida [opções]` — `ferramentas/empacotar.mjs:31-44`. Sem `pack.json` |
| Unpack | Cap. 47, p.296 | `-c atlas` desmonta | falta | Não achei |
| Info | Cap. 47, p.296 | `-i` mostra versão e contagens do projeto | falta | O validador diz só válido ou erro — `ferramentas/validador/validar.mjs:194-198` |
| Advanced | Cap. 47, p.296 | Memória, servidor, licença, escala de interface… | não se aplica | São opções do lançador e da licença, que o Recorte não tem |
| Unknown parameters | Cap. 47, p.297 | `--ignore-unknown` deixa passar | diferente | Opção desconhecida PARA com erro — `ferramentas/empacotar.mjs:76`, `ferramentas/importar.mjs:42`, `ferramentas/exportar-imagem.mjs:89` |

### §22 Configurações

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Application: Launcher | Cap. 48 Settings, p.299 | Versão e início automático | não se aplica | Sem lançador |
| Application: Files | Cap. 48, p.299 | Botões abrem pasta de backups, arquivo de teclas, log | diferente | Rascunho automático no navegador, "Reabrir o fechado" — `editor/src/doc/rascunho.ts:1-16`, `ui/menus.ts:217-221`. Sem arquivo de teclas nem log |
| Application: General | Cap. 48, p.300 | Cor gerenciada, taxa de quadros, reusar instância, FPS, tela inicial | falta | Nenhum desses ajustes |
| User interface | Cap. 48, p.301 | Idioma, fonte, tamanho, FPS padrão, escala, altura de linha, barra, rótulos, recuo da árvore | diferente | Editar → Preferências: tema e nome das ferramentas — `ui/prefs.ts:22-45`, `ui/menus.ts:352`. O "nome ao lado do ícone" é o Toolbar text labels |
| Viewport | Cap. 48, p.302 | Fundo, backface, escala de osso, bleed, destaque, imagem faltando, MSAA, pixel, suavização | diferente | Cor de fundo e grade em Configurações do projeto — `ui/shell-file.ts:340-348`; "Arte em pixel" no esqueleto — `panels/properties-model.ts:1042`. O resto falta |
| Behavior | Cap. 48, p.303 | Backup automático, confirmar apagar, duplo clique, animações, botão do meio, zoom no mouse… | diferente | Só o rascunho automático — `editor/src/doc/rascunho.ts:1-16`. O resto falta |
| Behavior: Dopesheet | Cap. 48, p.304 | Pausa da caixa, pular ao quadro, pular à chave | falta | Sem os ajustes |
| Behavior: Graph | Cap. 48, p.304 | Arrastar no vazio edita, pular ao quadro, pular à chave | falta | Sem os ajustes |

---

## Parte 2 — partículas

Base: `documentos/planos/IDEIAS NOVAS - particulas e biblioteca 2026-09-15.md`.
**Correção a essa base:** ela dizia que sub-emissor e rastro ficam de fora. Cabem,
sem estado — ver 3 e 7 abaixo. O que fica de fora de verdade: colisão, força que
depende da posição, taxa por distância.

Os nomes extras que a Pesquisa 2 mandou (Cavalry, SpineFX, EffekseerForUnity)
estão marcados "não conferi" onde não foram abertos.

### 0. Resumo em uma tela

| Pergunta | Resposta |
|:---|:---|
| O que é | Um anexo novo, tipo `particle`, dentro de um slot, preso ao osso do slot |
| A régua | Quadro no tempo `t` = **função pura** de (arquivo, animação, `t`). Nada guardado entre quadros |
| Quem nasce | Partícula `i` nasce em `t_i`, calculado pela integral da taxa |
| O acaso | `u = hash(semente, fluxo, i, canal)`, hash PCG de 32 bits, inteiro exato |
| Onde está | Conta fechada da idade `a = t − t_i`, com gravidade e arrasto linear |
| Animar campo | O valor é lido **no nascimento** `t_i` e fica congelado na partícula |
| Taxa animada | Chaves só `linear` ou `stepped`; integral exata por trecho |
| Espaço mundo | Nascimento usa a pose do osso **em `t_i`**, que também é função pura |
| Limite de vivas | Desenha as `maxParticles` **mais novas** vivas. Sem estado |
| Fora | Colisão, força que depende da posição, taxa por distância, herdar velocidade |
| Leitor sem suporte | Placeholder vazio (§2.5) **e aviso uma vez** (regra 21) |

---

### 1. A régua: por que função pura, e como

#### 1.1 O problema

Godot e Unity **simulam para frente**. Unity oferece `ParticleSystem.Simulate(t, withChildren, restart, fixedTimeStep)`: a doc diz que ele *"Fast-forwards the Particle System"*, ou seja, roda os passos de novo.
Fonte: https://docs.unity3d.com/ScriptReference/ParticleSystem.Simulate.html (conferido).

Godot não tinha "seek" de partícula; a proposta pedia **gravar o estado** na primeira passada.
Fonte: https://github.com/godotengine/godot-proposals/issues/4449 (conferido; marcada arquivada).

A semente do Godot só garante repetição em `restart()`, não no laço.
Fonte: https://github.com/godotengine/godot/issues/102291 (conferido; Godot 4.4 beta 2).

Nenhum dos três é função pura. **O Recorte precisa ser.** Arrastar o cursor para trás tem de dar o mesmo quadro.

#### 1.2 Identidade de uma partícula

Cada partícula tem uma chave de três inteiros: `(fluxo, ciclo, índice)`.

| Fluxo | O que é |
|:---:|:---|
| `0` | Emissão contínua (taxa) |
| `1 + b` | Rajada número `b` da lista `bursts` |

O acaso de uma partícula **só depende da chave e da semente**. Nunca do número do quadro, do `dt`, da ordem de cálculo.

#### 1.3 O hash: PCG de 32 bits

Proposta: o hash `pcg` de Jarzynski e Olano, *"Hash Functions for GPU Rendering"*, JCGT 2020 (não conferi na web: fora das três documentações permitidas).

```
// todas as contas em inteiro sem sinal de 32 bits, mod 2^32
function pcg(v):
    state = v * 747796405 + 2891336453
    word  = ((state >> ((state >> 28) + 4)) ^ state) * 277803737
    return (word >> 22) ^ word

function acaso(semente, fluxo, indice, canal):          // devolve u em [0, 1)
    h = pcg(semente)
    h = pcg(h ^ fluxo)
    h = pcg(h ^ indice)          // índice negativo: complemento de 2 em 32 bits
    h = pcg(h ^ canal)
    return (h >> 8) / 16777216   // 24 bits: exato em float32 e em float64
```

Como escrever em cada linguagem:

| Linguagem | Multiplicação | Deslocamento |
|:---|:---|:---|
| JavaScript / TS | `Math.imul(a, b) >>> 0` | `>>>` |
| Python | `(a * b) & 0xFFFFFFFF` | `>>` |
| C / C# / GLSL / HLSL | `uint32_t` / `uint` já dá a volta | `>>` |

**Provado nesta pesquisa**, JS (Node 24) e Python 3.12 dão o mesmo bit:

| Entrada | Saída |
|:---|:---:|
| `pcg(0)` | `129708002` |
| `pcg(42)` | `1223963391` |
| `pcg(0xFFFFFFFF)` | `3861530882` |
| `acaso(42, 0, 7, 0)` | `0.4190843105316162` |
| `acaso(42, 0, −3, 0)` | `0.5181800723075867` |

Por que `(h >> 8) / 2^24`: um número de 24 bits cabe **exato** em float32. Um runtime em float32 (permitido por §3.6) tira o mesmo `u`.

#### 1.4 Por que NÃO `Math.random` nem float acumulado

| Proibido | Por quê |
|:---|:---|
| `Math.random`, `rand()`, `Random.value` | Sem semente, ou semente com algoritmo diferente em cada linguagem e versão. Dois leitores nunca batem |
| Gerador com estado (`next()`) | O número da partícula 7 depende de quantas vezes chamaram antes. Pular quadro muda tudo |
| Hash em float (`fract(sin(x) * 43758.5)`) | `sin` muda entre bibliotecas e GPUs. Não é bit a bit |
| Posição acumulada `p += v * dt` | Depende do `dt`. 30 fps e 60 fps dão lugares diferentes. Voltar o cursor não desfaz |
| Contador acumulado de nascimentos | Mesma coisa: `acumulador += taxa * dt` erra diferente em cada ritmo de quadro |

A única soma permitida é **por chave**, na carga do arquivo (1.6). Ela tem ordem fixa e número fixo de parcelas. Não depende do quadro.

#### 1.5 Tabela de canais (congelada)

Número de canal nunca muda de sentido. Canal novo só no fim (princípio 1 de §1.3).

| Canal | Usado por |
|:---:|:---|
| 0 | `lifetime` |
| 1 | `speed` |
| 2 | direção dentro do `spread` |
| 3 | forma: primeira coordenada |
| 4 | forma: segunda coordenada |
| 5 | `angle` |
| 6 | `angularVelocity` |
| 7 | `scale` |
| 8 | `startColor` |
| 9 | `startFrame` |
| 10 | `randomness` (tremor do instante de nascimento) |
| 11 | `probability` da rajada |
| 12 | forma `mesh`: escolha do vértice/aresta/triângulo |
| 13–15 | reservados para `noise` (§6) |

Campo com faixa `[min, max]`: `valor = min + (max − min) × u`.

#### 1.6 Quando nasce: a taxa é integral

`E(t)` = número de nascimentos até `t` = integral da taxa efetiva.
Taxa efetiva = `rate(t)` se `emitting(t)` for verdadeiro, senão `0`.

**Decisão proposta:** chaves de `rate` só `linear` ou `stepped`. Com isso a integral é fechada e a inversa também.

| Curva da chave | `E` no trecho | Inversa |
|:---|:---|:---|
| `stepped` | reta | `τ = d / r0` |
| `linear` | parábola | `τ = 2d / (r0 + sqrt(r0² + 2·s·d))` |

Onde: trecho começa em `t0` com `E0 = E(t0)`, taxa `r0`, inclinação `s = (r1 − r0)/(t1 − t0)`, e `d = i − E0`.
A forma `2d / (r0 + sqrt(...))` é a estável: não divide por `s` e vale com `s = 0`.

```
na carga:  E_k = soma das áreas dos trechos 0..k−1, em float64, nesta ordem     // único "acumulado": por chave
partícula i (fluxo 0):
    achar o trecho k com E_k <= i < E_{k+1}       // busca binária
    t_cont = t_k + τ(i − E_k)
    t_i    = aplicar explosiveness e randomness (tabela 2.1)
viva em t  se  t_i <= t < t_i + life_i
idade      a = t − t_i
```

Regras:

- Taxa negativa na chave: L1. O runtime troca por `0` **na chave**, antes de integrar.
- Bézier em `rate`: L2. O runtime usa `linear` e **avisa** (regra 21). O editor não oferece Bézier nesse campo.
- Antes da primeira chave vale a primeira chave (§9.10). Por isso a taxa em tempo negativo é conhecida.

**Alternativa mais simples (B)**, se o Humberto preferir: `rate` não animável, só `emitting` liga e desliga (`stepped`). Perde rampa de taxa. Ganha conta de uma linha.

**Recomendo A.** A rampa de taxa (fumaça que engrossa) é pedido comum, e a conta ainda é exata.

#### 1.7 Quais partículas olhar

Sem estado, o runtime precisa de uma janela. Ela vem de um campo **não animável**: `lifetime.max`.

```
candidatos contínuos:  i de ceil(E(t − lifetime.max)) − 1  até  floor(E(t)) + 1
filtro:                t_i <= t < t_i + life_i          // t_i manda; o E só escolhe candidatos
```

Por isso `lifetime` **não é animável**: com chaves, a janela exigiria varrer a curva (e a Bézier faz barriga).

#### 1.8 Onde está: conta fechada

Arrasto linear `k` (1/s), gravidade `g` (px/s²), velocidade inicial `v0`, posição inicial `p0`:

```
v' = g − k·v
se k < 0.00001:
    p(a) = p0 + v0·a + ½·g·a²
senão:
    F    = −expm1(−k·a) / k            // = (1 − e^(−k·a)) / k, sem perder precisão com k·a pequeno
    p(a) = p0 + (g/k)·a + (v0 − g/k)·F
    v(a) = g/k + (v0 − g/k)·e^(−k·a)   // usado só por alignToVelocity
```

`expm1` existe em JS (`Math.expm1`), Python (`math.expm1`), C (`expm1`). O limiar `0.00001` segue §3.6.

Rotação: `θ(a) = angle_i + angularVelocity_i · a` (graus).

#### 1.9 Laço e pré-aquecimento

§9.11 diz que laço é decisão do runtime. O arquivo não sabe se a animação repete. Então o emissor declara.

| `looping` | O que entra em `t` | Efeito |
|:---:|:---|:---|
| `true` | nascimentos da volta atual **e** das voltas anteriores, deslocados de `−D`, `−2D`… enquanto couberem na janela `lifetime.max` | Emenda perfeita. Em `t = 0` já há partículas (é o "Prewarm" do Unity) |
| `false` | nascimentos em `[−prewarm, t]` | `prewarm = 0`: começa vazio. `prewarm = 2`: começa como se tivesse rodado 2 s (é o `preprocess` do Godot) |

`D` = duração da animação que toca (§9.11).
Nas voltas anteriores o acaso **não** inclui o número da volta. Se incluísse, `t` sozinho não bastaria para saber a volta, e a função deixaria de ser pura.
Em `prewarm`, índices negativos nascem com a taxa da primeira chave. O hash aceita índice negativo (1.3).

#### 1.10 Limite de vivas sem estado

Unity e Godot **bloqueiam nascimento** quando lotou. Isso é estado: quem nasce depende de quem estava vivo antes.

Proposta: **desenhar as `maxParticles` mais novas vivas.**

```
vivas = todas com t_i <= t < t_i + life_i
ordenar por (t_i decrescente, fluxo crescente, índice decrescente)
desenhar as primeiras maxParticles
```

É o mesmo espírito do "Ring Buffer Mode" do Unity: recicla a mais velha.
Fonte: https://docs.unity3d.com/Manual/PartSysMainModule.html (conferido).

Preço: com limite baixo, partícula velha some de repente. O editor **avisa** quando o limite corta ("12 partículas cortadas neste quadro").

#### 1.11 Espaço mundo sem estado

| `space` | Conta |
|:---|:---|
| `"local"` | Tudo no referencial do osso. Em `t`, multiplica pela matriz de mundo do osso **em `t`**. O efeito anda junto, rígido |
| `"world"` | `p0` e `v0` são levados ao espaço do esqueleto pela matriz do osso **em `t_i`**. Depois a partícula segue sozinha. `g` fica no espaço do esqueleto |

A matriz em `t_i` vem de `Pose(esqueleto, animação, t_i)` (§9.10). É função pura. Um runtime **PODE** guardar em cache por `t_i` exato: cache não muda o resultado.

Três cuidados escritos:

1. **"Mundo" no arquivo é o espaço do esqueleto.** O jogo move o personagem por fora; o arquivo não conhece isso. O runtime de jogo PODE compor com a matriz do objeto em `t_i`, se ele tiver o histórico. Isso fica fora da conformidade.
2. **Custo:** uma pose por nascimento. O editor avisa se passar de um teto (ex. 256 poses por quadro).
3. **Osso com `physics` (§6.5):** a pose em `t_i` herda a regra de `dt` fixo da física. Continua determinístico, mas caro.

Effekseer chama isso de herdar posição **"Only on create"** contra **"Always"**. É o conceito exato; a palavra `world` fica porque Godot e Unity usam.
Fonte: https://effekseer.github.io/Help_Tool/en/ToolReference/common.html (conferido).

---

### 2. Os campos, um por tabela

Convenções da spec valem: Y para cima, graus anti-horário, 0 aponta para +X, segundos, px (§3.1).

**Dois sentidos de "animável":**

| Marca | Sentido |
|:---:|:---|
| **N** | Animável, lido **no nascimento** `t_i`. Fica congelado na partícula |
| **T** | Animável, lido **em `t`**. Vale para todas as vivas de uma vez |
| **I** | Animável por integral (só `rate`, 1.6) |
| não | Fixo no anexo |

Campo animável entra numa timeline nova: `{ "type": "particle", "target": slot, "skin", "attachment", "property": "<campo>" }`. Faixa `[min, max]` anima como valor de 2 componentes (§9.3, `C = 2`).

Fontes conferidas (todas abertas nesta pesquisa):

| Sigla | URL |
|:---|:---|
| G-GPU | https://docs.godotengine.org/en/stable/classes/class_gpuparticles2d.html |
| G-CPU | https://docs.godotengine.org/en/stable/classes/class_cpuparticles2d.html |
| G-PPM | https://docs.godotengine.org/en/stable/classes/class_particleprocessmaterial.html |
| G-CIM | https://docs.godotengine.org/en/stable/classes/class_canvasitemmaterial.html |
| U-Main | https://docs.unity3d.com/Manual/PartSysMainModule.html |
| U-Emis | https://docs.unity3d.com/Manual/PartSysEmissionModule.html |
| U-Shape | https://docs.unity3d.com/Manual/PartSysShapeModule.html |
| U-Col | https://docs.unity3d.com/Manual/PartSysColorOverLifeModule.html |
| U-Size | https://docs.unity3d.com/Manual/PartSysSizeOverLifeModule.html |
| U-Rot | https://docs.unity3d.com/Manual/PartSysRotOverLifeModule.html |
| U-Limit | https://docs.unity3d.com/ScriptReference/ParticleSystem.LimitVelocityOverLifetimeModule-drag.html |
| U-Tex | https://docs.unity3d.com/Manual/PartSysTexSheetAnimModule.html |
| U-Rend | https://docs.unity3d.com/Manual/PartSysRendererModule.html |
| U-Noise | https://docs.unity3d.com/Manual/PartSysNoiseModule.html |
| E-Com | https://effekseer.github.io/Help_Tool/en/ToolReference/common.html |
| E-Gen | https://effekseer.github.io/Help_Tool/en/ToolReference/locationGene.html |
| E-Loc | https://effekseer.github.io/Help_Tool/en/ToolReference/location.html |
| E-Force | https://effekseer.github.io/Help_Tool/en/ToolReference/locationAbs.html |
| E-Rot | https://effekseer.github.io/Help_Tool/en/ToolReference/rotation.html |
| E-Scale | https://effekseer.github.io/Help_Tool/en/ToolReference/scale.html |
| E-Rend | https://effekseer.github.io/Help_Tool/en/ToolReference/rendererCommon.html |
| E-Sprite | https://effekseer.github.io/Help_Tool/en/ToolReference/rendererSprite.html |
| E-Glob | https://effekseer.github.io/Help_Tool/en/ToolReference/global.html |

#### 2.1 Emissão: taxa, rajada, explosividade, tremor

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Emitindo / `emitting` | `emitting` (G-GPU) | Play/Stop por script (não conferi nome de campo) | Spawn Count "infinite" (E-Com) | boolean | N (`stepped`) | `true` | Desligado zera a taxa efetiva. Partículas já nascidas continuam |
| Taxa / `rate` | `amount` por ciclo (G-GPU) | Rate over Time (U-Emis) | Spawn Rate, em quadros entre nascimentos (E-Com) | number, partículas/s, `>= 0` | I | `10` | Nome do Unity: é por segundo, como aqui. Godot é "por ciclo"; na importação `rate = amount / lifetime` |
| Rajadas / `bursts` | — (usa `explosiveness`) | Bursts: Time, Count, Cycles, Interval, Probability (U-Emis) | Spawn Count finito (E-Com) | lista de `{time, count, cycles, interval, probability}` | não | `[]` | Rajada `b`, ciclo `c`, partícula `j`: nasce em `time + c·interval`; chave `(1+b, c·count + j)`. `probability` sorteia com canal 11: nasce se `u < probability` |
| Explosividade / `explosiveness` | `explosiveness` (G-GPU) | — | — | number 0..1 | não | `0` | Janela de ciclo = `duration`. `t_i = início_do_ciclo + (1 − e)·(t_cont − início_do_ciclo)`. Monotônica, pura |
| Duração do ciclo / `duration` | ciclo = `lifetime` (G-GPU) | Duration (U-Main) | — | number, s, `> 0` | não | `1` | Só para `explosiveness`. O laço usa a duração da animação (1.9) |
| Tremor do nascimento / `randomness` | `randomness` (G-GPU) | — | — | number 0..1 | não | `0` | `t_i += randomness · u10 / taxa_local`. Fica dentro da própria vaga: não troca a ordem |
| Atraso inicial / `startDelay` | — | Start Delay (U-Main) | Initial Delay (E-Com) | number, s | não | `0` | Nascimentos só a partir de `startDelay`. Poderia ser só uma chave de `emitting`; fica por ser o nome que as três ferramentas têm |

#### 2.2 Vida

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Vida / `lifetime` | `lifetime` + `lifetime_randomness` (G-GPU, G-PPM) | Start Lifetime (U-Main) | Time to live, em quadros (E-Com) | `[min, max]`, s, `> 0` | **não** | `[1, 1]` | Canal 0. Não animável porque `max` define a janela de busca (1.7). Godot: `[lifetime·(1−r), lifetime]` |
| Máximo de vivas / `maxParticles` | `amount` (G-GPU) | Max Particles (U-Main) | — | integer `>= 1` | não | `1000` | Regra das mais novas (1.10). Teto do formato em §12.6 (ex. 10 000) |

#### 2.3 Velocidade, direção e abertura

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Velocidade / `speed` | `initial_velocity_min/max` (G-PPM) | Start Speed (U-Main) | Pos. PVA: Velocity (E-Loc) | `[min, max]`, px/s | N | `[100, 100]` | Canal 1. Palavra do Unity: aqui é escalar, a direção vem à parte |
| Direção / `direction` | `direction`, vetor (G-PPM) | rotação da Shape (U-Shape) | Velocity vetor (E-Loc) | number, graus | N | `90` (para cima) | Ângulo em vez de vetor: segue §3.1 e anima com uma curva só |
| Abertura / `spread` | `spread`, ± graus (G-PPM) | Angle do Cone (U-Shape) | Random da Velocity (E-Loc) | number, graus, 0..180 | N | `0` | Meia-abertura, como Godot. `θ = direction + spread·(2·u2 − 1)` |
| Direção da forma / `spherizeDirection` | — | Spherize Direction (U-Shape) | Set angle on spawn (E-Gen) | number 0..1 | não | `0` | 0 = usa `direction`; 1 = sai para fora do centro da forma. Mistura de ângulos pelo caminho curto. Nome do Unity; "sphere" soa 3D, mas é a única das três com a palavra para isso |
| Alinhar à velocidade / `alignToVelocity` | `particle_flag_align_y` (G-CPU, conferi só a descrição) | — | Rotate in the direction of movement (E-Rot) | boolean | não | `false` | Usa `v(a)` fechada (1.8). Soma `angle` por cima |

#### 2.4 Forma do emissor

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Forma / `shape` | `emission_shape`: POINT, SPHERE, SPHERE_SURFACE, BOX, POINTS, DIRECTED_POINTS, RING (G-PPM) | Shape: Circle, Edge, Rectangle, Sprite, Mesh… (U-Shape) | Spawning Method: Point, Line, Circle, Sphere, Model (E-Gen) | string: `point`, `circle`, `rectangle`, `edge`, `bone`, `mesh` | não | `"point"` | Desconhecida: **não desenha o emissor e avisa**. Cair para `point` seria palpite silencioso |
| Raio / `radius` | `emission_sphere_radius`, `emission_ring_radius` (G-PPM) | Radius (U-Shape) | Circle radius (E-Gen) | number, px | N | `0` | `circle` |
| Espessura / `radiusThickness` | `emission_ring_inner_radius` (G-PPM) | Radius Thickness (U-Shape) | — | number 0..1 | N | `1` | 0 = só a borda; 1 = disco cheio. Área uniforme: `r = R·sqrt((1−T)² + u3·(1 − (1−T)²))` |
| Arco / `arc` | — | Arc (U-Shape) | Angle Start/End (não conferi o rótulo exato) | number, graus | N | `360` | `φ = u4 · arc`, a partir de +X do osso |
| Tamanho / `size` | `emission_rect_extents`, meia medida (G-CPU) | Scale da Rectangle (U-Shape) | — | `[w, h]`, px, medida inteira | N | `[0, 0]` | `rectangle`: `p0 = ((u3 − ½)·w, (u4 − ½)·h)` |
| Segmento / `edge` | — | Edge (U-Shape) | Line: init/final (E-Gen) | `[x0, y0, x1, y1]`, px | N | `[0,0,0,0]` | `p0 = lerp(a, b, u3)` |
| Ao longo do osso / `shape: "bone"` | — | — | — | sem campos: usa `(0,0)`→`(length,0)` do osso | — | — | **Palavra nova.** Nenhuma das três tem osso. É `edge` com os pontos do próprio osso (comprimento animado lido em `t_i`) |
| Da malha / `shape: "mesh"` + `mesh`, `meshMode` | `emission_points` (G-PPM) | Mesh / Skinned Mesh Renderer; vertex, edge, triangle (U-Shape) | Model: Random, Vertex, Random Vertex, Surface, Random Surface (E-Gen) | `mesh`: nome do placeholder de um `mesh` no mesmo slot; `meshMode`: `vertex`, `edge`, `triangle` | não | `"vertex"` | Vértices deformados **em `t_i`** (pose + deform). Triângulo: sorteio por área acumulada (canal 12) e ponto uniforme (canais 3, 4). Nível mais alto (ver 5) |

#### 2.5 Forças: gravidade e arrasto

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Gravidade / `gravity` | `gravity`, 2D padrão `(0, 980)` Y-baixo (G-CPU, G-PPM) | Gravity Modifier × gravidade do projeto (U-Main) | Pos. PVA: Acceleration (E-Loc); Gravity (E-Force) | `[x, y]`, px/s² | N | `[0, 0]` | Padrão zero: nada cai sem o autor pedir. Importar do Godot: `(0, −980)`. Em `world`, no espaço do esqueleto |
| Arrasto / `drag` | `damping_min/max` (G-PPM) | Drag, módulo Limit Velocity over Lifetime (U-Limit) | Drag (E-Force) | number, 1/s, `>= 0` | N | `0` | **Linear**: `v' = −k·v`. Nome do Unity e do Effekseer. O `damping` do Godot tira velocidade constante (não proporcional); importa com aviso |

Nota honesta sobre N em forças: a gravidade animada é lida no nascimento. Uma chave que muda a gravidade **não** entorta partículas já no ar. É o preço da conta fechada.

#### 2.6 Rotação

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Ângulo inicial / `angle` | `angle_min/max` (G-PPM) | Start Rotation (U-Main) | Rotation PVA: angle (E-Rot) | `[min, max]`, graus | N | `[0, 0]` | Canal 5 |
| Giro / `angularVelocity` | `angular_velocity_min/max` (G-PPM) | Angular Velocity, Rotation over Lifetime (U-Rot) | Rotation PVA: rotational speed (E-Rot) | `[min, max]`, graus/s | N | `[0, 0]` | Canal 6. Constante na vida. Aceleração angular do Effekseer caberia na conta; fica para depois |

#### 2.7 Tamanho

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Escala inicial / `scale` | `scale_min/max` (G-PPM) | Start Size (U-Main) | Scale (E-Scale) | `[min, max]`, fator da imagem | N | `[1, 1]` | Canal 7. Fator, como `region.scaleX` (§7.3). Unity é tamanho absoluto; importa dividindo pelo tamanho da imagem |
| Tamanho na vida / `scaleOverLifetime` | `scale_curve` (G-PPM) | Size, módulo Size over Lifetime (U-Size) | Scale Easing / F-Curve (E-Scale) | chaves `{time, value, curve}` com `time` em **0..1 da vida** | não | ausente = `1` | **Reusa §9.2–9.3 inteiro**, só troca segundos por fração da vida `a / life_i` |

#### 2.8 Cor e alfa

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Cor inicial / `startColor` | `color`, `color_initial_ramp` (G-PPM) | Start Color (U-Main) | Color All: Random (E-Sprite, não conferi o rótulo do modo) | `[color4, color4]` | N | `[[1,1,1,1],[1,1,1,1]]` | Canal 8. Uma só `u` para os 4 componentes: `lerp(c1, c2, u8)` |
| Cor na vida / `colorOverLifetime` | `color_ramp` (G-PPM) | Color, módulo Color over Lifetime (U-Col) | Color All: Easing / F-Curve (não conferi) | chaves de `color4` com `time` 0..1 da vida | não | ausente = branco | É o **gradiente**. Mesmo formato de chave de §9.2 |
| Alfa na vida / `alphaOverLifetime` | `alpha_curve` (G-PPM) | (alfa vai dentro do gradiente, U-Col) | Fade-In / Fade-Out (E-Rend) | chaves de number 0..1, `time` 0..1 da vida | não | ausente = `1` | Multiplica o alfa do gradiente. Existe para importar Godot e Effekseer sem perder |

Cor final, antes de §7.12:

```
cor_particula = startColor_i × colorOverLifetime(a/life) × (1,1,1, alphaOverLifetime(a/life))
light         = slot.color × attachment.color × cor_particula       // slot e attachment lidos em t (T)
```

Depois é **exatamente** a fórmula de §7.12, com `darkColor` do slot. Nenhuma regra de cor nova.

#### 2.9 Imagem e folha de quadros

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Imagem / `path` | `texture` (G-GPU) | material do Renderer (U-Rend) | textura do Basic Render Settings (E-Rend) | string, região do atlas (§7.2, §2.8) | não | nome do placeholder | Mesmo `path` de `region` |
| Sequência / `sequence` | `particles_anim_h_frames`, `_v_frames` (G-CIM) | Tiles / Sprites (U-Tex) | UV Animation (E-Rend) | objeto `Sequence` de §7.10 | não | ausente | **Reusa §7.10.** Sem grade: lista de regiões do atlas |
| Modo de quadro / `frameMode` | `anim_speed` (G-PPM) | Time Mode: Lifetime, Speed, FPS (U-Tex) | UV Animation Frame Length (não conferi o rótulo) | `"lifetime"` ou `"fps"` | não | `"lifetime"` | `Speed` do Unity fica fora (depende de velocidade; cabe na conta, mas adia) |
| Voltas na vida / `cycles` | `particles_anim_loop` (G-CIM) | Cycles (U-Tex) | — | number `> 0` | não | `1` | Modo `lifetime`: `k = floor((a/life)·cycles·n + 0.00001) mod n` |
| Quadros/s / `fps` | `anim_speed_min/max` (G-PPM) | FPS (U-Tex) | — | number | não | `12` | Modo `fps`: `k = floor(a·fps + 0.00001) mod n` |
| Quadro inicial / `startFrame` | `anim_offset_min/max` (G-PPM) | Start Frame (U-Tex) | Start Frame (não conferi) | `[min, max]`, índice | N | `[0, 0]` | Canal 9. `floor(lerp) mod n` somado a `k` |

O guarda `+ 0.00001` é o mesmo de §9.6.

#### 2.10 Mistura

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Mistura / **`slot.blend`** (sem campo novo) | `blend_mode`: Mix, Additive, Subtractive, Multiplicative, Premultiplied Alpha (G-CIM) | shader do material (U-Rend; não há campo no ParticleSystem) | Blend: translucidez, adição, subtração (E-Rend; não conferi a lista exata de rótulos) | `normal`, `additive`, `multiply`, `screen` (§7.12) | não | `"normal"` | **Proposta: não criar campo.** O emissor usa o blend do slot, como todo anexo. Fumaça aditiva mora num slot aditivo. `Subtractive` do Godot e subtração do Effekseer não existem em §7.12: importar vira `normal` **com aviso** |

#### 2.11 Espaço, semente, pré-aquecimento, laço

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Espaço / `space` | `local_coords` (G-GPU) | Simulation Space: Local, World (U-Main) | Inherit Position: Always, Only on create (E-Com) | `"local"` ou `"world"` | não | `"local"` | Ver 1.11. Padrão `local`: não exige pose em `t_i` |
| Semente / `seed` | `seed` + `use_fixed_seed` (G-GPU) | Random Seed + Auto Random Seed (U-Main) | Random Seed (E-Glob) | integer 0..4294967295 | não | `0` | **Sempre fixa.** Não existe "semente automática": ela quebra a régua. `0` é semente válida (Effekseer trata `<= 0` como "varia"; aqui não) |
| Laço / `looping` | `one_shot` invertido (G-GPU) | Looping (U-Main) | — | boolean | não | `true` | Ver 1.9 |
| Pré-aquecimento / `prewarm` | `preprocess`, s (G-GPU) | Prewarm, boolean (U-Main) | — | number, s, `>= 0` | não | `0` | Só com `looping: false`. Segundos, como o Godot: o Unity é só sim/não e amarrado a Looping |

A Pesquisa 2 citou `Random Seed` também no plugin Unity do Effekseer (github.com/effekseer/EffekseerForUnity). **Não conferi.** O mesmo para o "Seed por propriedade" do Cavalry e o SpineFX (spinefx.io): fora das três documentações permitidas nesta tarefa. A ideia do Cavalry (semente por campo) já sai de graça aqui: os canais da 1.5 são sementes independentes por campo.

#### 2.12 Ordem de desenho

| Campo (tela / JSON) | Godot | Unity | Effekseer | Tipo e unidade | Animável? | Padrão | Observação |
|:---|:---|:---|:---|:---|:---:|:---|:---|
| Ordem / `sortMode` | `draw_order`: INDEX, LIFETIME, REVERSE_LIFETIME (G-GPU) | Sort Mode: None, By Distance, Oldest in Front, Youngest in Front, By Depth (U-Rend) | Rendering Order: normal / invertida (E-Sprite) | `"youngestInFront"` ou `"oldestInFront"` | não | `"youngestInFront"` | Nome do Unity: é o mais claro. O padrão bate com INDEX do Godot e o normal do Effekseer (a primeira nasce, a primeira desenha). Empate: `(t_i, fluxo, índice)`. Desconhecido → padrão + aviso |

Entre anexos: o emissor inteiro desenha na posição do seu slot na `drawOrder` (§9.5). `clipping` vale como para qualquer anexo.

---

### 3. O que fica DE FORA (limites, com o nome certo)

| Limite | Nome nas ferramentas | Por que sai |
|:---|:---|:---|
| **Colisão** | `collision_mode` RIGID / HIDE_ON_CONTACT (G-PPM); Collision (E, página `collisions.html`, não abri) | Depende de onde a partícula estava a cada passo. Sem conta fechada |
| **Sub-emissor por colisão** | `sub_emitter_mode` AT_COLLISION (G-PPM) | Depende da colisão |
| **Força que depende da posição** | `radial_accel`, `tangential_accel`, `orbit_velocity` (G-PPM); Vortex, Attraction (E-Force) | Vira equação diferencial sem solução fechada. Integrar passo a passo = estado |
| **Aceleração na direção da velocidade** | `linear_accel` (G-PPM) | Com gravidade junto, sem forma fechada |
| **Turbulência como campo de força** | `turbulence_*` (G-PPM); Turbulence (E-Force); Noise (U-Noise) | O ruído é lido na posição **atual**, que depende do ruído anterior. Estado. Ver 6 para a versão que cabe |
| **Taxa por distância** | Rate over Distance (U-Emis) | Exige o comprimento do caminho do osso: integral numérica, não exata |
| **Herdar velocidade do emissor** | `inherit_velocity_ratio` (G-PPM); Emitter Velocity (U-Main) | Derivada da pose com constraints não tem conta fechada. Diferença finita normativa seria possível; adiado |
| **Semente automática** | `use_fixed_seed = false` (G-GPU); Auto Random Seed (U-Main); seed `<= 0` (E-Glob) | É exatamente o que a régua proíbe |
| **Pausar fora da tela** | Culling Mode (U-Main) | Pausa = estado |
| **Mundo do jogo** | Simulation Space: World (U-Main) | O arquivo só conhece o espaço do esqueleto (1.11). O jogo PODE fazer por fora |

**O que parece fora, mas cabe na régua (adiado só por tamanho, não por princípio):**

| Função | Nome | Por que cabe |
|:---|:---|:---|
| Sub-emissor no nascimento e na morte | `sub_emitter_mode` AT_START, AT_END (G-PPM) | A morte é em `t_i + life_i`, número conhecido. A posição é `p(life_i)`. Tudo puro. Custo: emissor dentro de emissor |
| Rastro | `trail_enabled` (G-GPU); Trails (Unity, não abri); Ribbon/Track (E, não abri) | Rastro = `p(a − j·Δ)` para `j = 1..n`. A conta fechada dá o passado sem histórico |
| Aceleração angular, escala PVA | Rotation/Scale PVA (E-Rot, E-Scale) | Polinômio da idade |
| Quadro por velocidade | Time Mode: Speed (U-Tex) | `v(a)` é fechada |

Isso corrige o plano de 15/09 num ponto: ele diz *"sem partícula que gera partícula"*. Gerar **por colisão** é impossível; gerar **no nascimento ou na morte** é possível. Fica como decisão futura.

---

### 4. Como entra no formato

#### 4.1 Tipo de anexo

`skin.attachments[slot][placeholder] = { "type": "particle", ... }`. Preso ao osso do slot, como `region`.

Duas rotas. **Decisão do Humberto** (regra 7 da casa: campo novo no núcleo é dele).

| Rota | Nome | Prós | Contras |
|:---|:---|:---|:---|
| A | extensão `BONE_particles`, tipo `"BONE_particle"` (§2.7) | Entra sem mexer no núcleo. O projeto já tem os dois leitores que a ratificação exige (TS e Python) | Nome prefixado no arquivo |
| B | núcleo, `"type": "particle"` | Nome limpo, como no plano de 15/09 | Muda a tabela de §7.2 e a versão `minor` |

**Recomendo A primeiro**, promovendo a B quando os dois runtimes passarem (é o caminho de "Promoção" em §2.7; o nome antigo fica como alias).

#### 4.2 Nível de leitor

Partícula **não entra na escada A → B → C**. É um módulo lateral: **P (Partículas)**, que exige A.
`shape: "mesh"` e `space: "world"` exigem também o que eles consultam (B para malha; C se o osso tiver constraints).

| Leitor | Faz |
|:---|:---|
| Sem P | Placeholder vazio (fallback já escrito em §2.5) **e aviso uma vez**: "emissor de partículas ignorado: `fumaca` no slot `boca`" |
| Com P, campo desconhecido | Ignora o campo (§2.5), avisa |
| Com P, `shape` desconhecida | **Não desenha o emissor**, avisa. Não inventa ponto |
| Com P, `rate` com Bézier | Usa `linear`, avisa (L2) |
| Com P, blend fora de §7.12 | `normal`, avisa (já é §7.12) |

Linhas novas para a tabela de §2.5:

| Onde | Valor desconhecido | Leitor faz |
|:---|:---|:---|
| `particle.shape` | Forma desconhecida | Não desenha o emissor. Avisa uma vez |
| `particle.space` | Valor desconhecido | Usa `"local"`. Avisa |
| `particle.sortMode` | Valor desconhecido | Usa `"youngestInFront"` |
| `particle.frameMode`, `meshMode` | Valor desconhecido | Usa o padrão. Avisa |

#### 4.3 Validador

| Código proposto | Nível | Quando |
|:---|:---:|:---|
| `RANGE_PARTICLE_MINMAX` | L1 | `min > max` em qualquer faixa |
| `RANGE_PARTICLE_RATE` | L1 | chave de `rate` negativa |
| `RANGE_PARTICLE_RATE_CURVE` | L2 | Bézier em `rate` |
| `REF_PARTICLE_MESH` | L1 | `mesh` não aponta para um `mesh` do mesmo slot |
| `LIMIT_PARTICLE_COUNT` | L2 | `rate × lifetime.max` passa do teto de §12.6 |

#### 4.4 Casos de conformidade

**Caso P-001 — posição fechada, sem pose.** Calculado nesta pesquisa por dois scripts independentes (JS e Python), **mesmo bit**. Tem de ser refeito pelos dois runtimes antes de virar caso.

Entrada: emissor na origem, osso identidade.

| Campo | Valor |
|:---|:---|
| `seed` | `42` |
| `rate` | `20` (constante) |
| `lifetime` | `[1, 1.5]` |
| `speed` | `[100, 150]` |
| `direction` / `spread` | `90` / `30` |
| `shape` | `circle`, `radius 10`, `radiusThickness 1`, `arc 360` |
| `gravity` | `[0, −200]` |
| `drag` | `0.5` |
| `angle` / `angularVelocity` | `[0, 360]` / `[−90, 90]` |
| `scale` | `[0.5, 1]` |
| `space` | `local` |

Pergunta: partícula `(fluxo 0, índice 7)` em `t = 0.5`.

| Grandeza | Esperado | Tolerância (§3.6) |
|:---|:---:|:---:|
| `u` canais 0..7 | `0.419084 · 0.239680 · 0.343411 · 0.087697 · 0.199832 · 0.678222 · 0.758740 · 0.400175` | exato (24 bits) |
| `t_i` | `0.35` | — |
| idade `a` | `0.15` | — |
| `life_i` | `1.209542` | — |
| viva? | sim | — |
| `p0` | `(0.918092, 2.815465)` | `1e-3` px |
| `v0` | `(18.280924, 110.481766)` | `1e-3` px/s |
| **posição** | **`(3.559924, 16.586731)`** | `1e-3` px |
| **ângulo** | **`251.145834°`** (saída reduzida: `−108.854166°`) | `1e-2` grau |
| **escala** | **`0.700088`** | `1e-4` |

Nota do cálculo da forma: com `radiusThickness 1`, `r = 10·sqrt(u3)`, `φ = u4·360°` (canal 3 raio, canal 4 ângulo).

**Caso P-002 — taxa em rampa.** `rate` com chaves `0 → 40` de `t = 0` a `t = 1`, `linear`. Então `E(t) = 20·t²`. Partícula 7 nasce em `τ = 2·7 / (0 + sqrt(2·40·7)) = 14 / sqrt(560) = 0.591608`. Prova a inversa estável.

**Casos a escrever depois:**

| Caso | Prova |
|:---|:---|
| P-003 | laço: `t = 0.02` com `looping` mostra partículas da volta anterior; `t` e `t + D` dão o mesmo quadro |
| P-004 | `prewarm 1`: índice `−3` existe e tem o `u` de `acaso(42, 0, −3, 0) = 0.518180` |
| P-005 | `maxParticles 5` com 12 vivas: lista exata das 5 desenhadas |
| P-006 | `space world`: osso gira 90° entre `t_i` e `t`; a partícula **não** gira junto |
| P-007 | rajada com `probability 0.5`: lista exata de quem nasceu |
| P-008 | **arrastar para trás**: avaliar `t = 0.9`, depois `0.3`, depois `0.9`; igual bit a bit ao primeiro |

---

### 5. Exemplo JSON

```json
{
  "bone": { "version": "1.1", "extensionsUsed": ["BONE_particles"] },
  "skins": [{
    "name": "default",
    "attachments": {
      "cachimbo_fumaca": {
        "fumaca": {
          "type": "BONE_particle",
          "path": "fx/fumaca",
          "seed": 42,
          "rate": 20,
          "lifetime": [1, 1.5],
          "maxParticles": 200,
          "looping": true,
          "shape": "circle",
          "radius": 10,
          "speed": [100, 150],
          "direction": 90,
          "spread": 30,
          "gravity": [0, -200],
          "drag": 0.5,
          "angle": [0, 360],
          "angularVelocity": [-90, 90],
          "scale": [0.5, 1],
          "scaleOverLifetime": [
            { "time": 0, "value": 0.2 },
            { "time": 1, "value": 1.5 }
          ],
          "colorOverLifetime": [
            { "time": 0,   "value": [1, 1, 1, 0] },
            { "time": 0.1, "value": [1, 1, 1, 0.8] },
            { "time": 1,   "value": [0.6, 0.6, 0.6, 0] }
          ],
          "space": "world",
          "sortMode": "youngestInFront"
        }
      }
    }
  }],
  "animations": [{
    "name": "fumar",
    "timelines": [{
      "type": "particle", "target": "cachimbo_fumaca", "skin": "default",
      "attachment": "fumaca", "property": "rate",
      "keys": [
        { "time": 0, "value": 0, "curve": "linear" },
        { "time": 1, "value": 40 }
      ]
    }]
  }]
}
```

O slot `cachimbo_fumaca` tem `"blend": "screen"` na lista de slots (§7.12). Nenhum campo de mistura no emissor.
(Com a rota A, o tipo de timeline também seria prefixado: `"BONE_particle"`. Detalhe a fechar com a rota.)

---

### 6. Ruído que cabe na régua (proposta, não recomendação imediata)

Turbulência de verdade é campo de força: fora (3). Mas um **deslocamento** com semente cabe:

```
// ruído de valor 1D, x = idade × noiseFrequency
function N(fluxo, i, canal, x):
    base = hash_bruto(seed, fluxo, i, canal)          // os 4 pcg de 1.3, sem o /2^24
    j = floor(x);  f = x − j
    n0 = (pcg(base ^ j)     >> 8) / 16777216 × 2 − 1  // −1..1
    n1 = (pcg(base ^ (j+1)) >> 8) / 16777216 × 2 − 1
    s  = f·f·(3 − 2f)                                 // smoothstep
    return n0 + (n1 − n0)·s

p_final(a) = p(a) + noiseStrength × ( N(fluxo, i, 13, a·f), N(fluxo, i, 14, a·f) )
```

O inteiro da lattice entra por `^ j` depois do hash do canal. Não é somado ao canal, para não colidir com os outros canais.

| Campo | Unity (U-Noise) | Godot (G-PPM) | Diferença honesta |
|:---|:---|:---|:---|
| `noiseStrength` px | Strength | `turbulence_noise_strength` | Aqui empurra a **posição**, não a velocidade. O desenho da trilha é outro |
| `noiseFrequency` 1/s | Frequency | `turbulence_noise_scale` | Aqui é na **idade**, não no espaço. Partículas vizinhas não ondulam juntas |

É função pura de `(semente, i, idade)`. Importar turbulência do Godot ou Noise do Unity vira isso **com aviso** "aproximado".

---

### 7. Decisões para o Humberto

| # | Pergunta | Recomendo |
|:---:|:---|:---|
| 1 | Extensão `BONE_particles` antes do núcleo? | Sim (4.1) |
| 2 | `rate` animável por integral (A) ou só liga/desliga (B)? | A (1.6) |
| 3 | Limite de vivas: as mais novas ficam? | Sim (1.10) |
| 4 | Mistura só pelo slot, sem campo no emissor? | Sim (2.10) |
| 5 | Gravidade padrão zero? | Sim (2.5) |
| 6 | Sub-emissor no nascimento/morte e rastro: entram numa segunda fase? | Sim, depois da primeira passar na conformidade (3) |
| 7 | Ruído de deslocamento (6)? | Só depois; não é pedido |

---

## Parte 3 — a pesquisa de fora

**A régua:** o formato é função pura do tempo. A linha do tempo volta e repete
o quadro. Três marcas:

| Marca | Quer dizer |
|:---|:---|
| **passa** | cabe no `.bone` e repete o quadro |
| **não passa** | depende de história, de entrada do jogo ou de sorteio |
| **só no editor** | é gesto ou ajuda de tela; o que vai ao arquivo são chaves comuns |

**Como li "o Recorte talvez não tenha":** conferi os títulos e trechos da
`formato/ESPECIFICACAO 2026-09-06.md` e fiz busca por palavra em `editor/src`.
Muita coisa que parecia nova **já está na spec**: slider (driver modo contínuo,
8.2), smart bone (8.1 `source`), giro 360 (`repeat`), clipping invertido
(7.7 `invert`), IK `uniform`, física com `wind`/`gravity` e bake (6.5),
`pixelArt`, blend `additive/multiply/screen`, eventos com áudio,
esqueleto aninhado, lipsync (extensão `BONE_lipsync`), deformador de grade
(`BONE_warp_deformer`), grade de parâmetros 2–4D (`BONE_param_grid`).
Essas **não entram** nas tabelas abaixo. Onde a busca no editor não achou nada,
escrevi "não achei" — não é prova de ausência.

---

#### A.1 Antes de 2025 (ou sem data nova)

| Função | Quem tem | O que faz | Fonte | Régua |
|:---|:---|:---|:---|:---|
| Máquina de estados | Rive | animações viram estados; entradas trocam de estado | https://rive.app/features (página oficial) · https://rive.app/docs/editor/state-machine/states (manual) | **não passa**: depende da entrada do jogo. No máximo o arquivo leva a *dica* (como `defaultMix`) |
| Camadas de estado somadas | Rive | corpo, rosto e roupa em camadas que tocam juntas | https://rive.app/docs/editor/state-machine/states (manual) | **não passa** como máquina; a mistura em si é do runtime (spec 1.4) |
| Blend 1D | Rive | um número mistura duas animações | https://rive.app/docs/editor/state-machine/states (manual) · https://rive.app/changelog/capture-base-state (changelog) | **passa** se o número é parâmetro keyado; já quase coberto pelo driver 8.2 |
| Joystick | Rive | alça 2D que percorre uma animação em X e outra em Y | https://rive.app/docs/editor/manipulating-shapes/joysticks (manual) | **passa** (é parâmetro 2D = `BONE_param_grid`); o **gesto na cena** é só no editor — não achei no editor |
| Listeners (clique, passar o mouse) | Rive | o desenho reage ao ponteiro | https://rive.app/features (página oficial) | **não passa**: é entrada do jogo |
| Texto dinâmico | Rive | texto vetorial trocado no runtime | https://rive.app/features (página oficial) | **não passa** como texto vivo; texto fixo virado imagem passa |
| Trim path / feather vetorial | Rive | cortar traço, borrar borda de vetor | https://rive.app/features (página oficial) | passa em teoria (valor keyado), mas **fora do escopo**: o Recorte é imagem, não vetor |
| BlendSpace2D | Godot 4 AnimationTree | dois números misturam várias animações num plano | https://docs.godotengine.org/en/stable/classes/class_animationnodeblendspace2d.html (manual) | **passa** se os dois números são parâmetros; cabe em `BONE_param_grid` |
| StateMachine com `travel()` | Godot 4 AnimationTree | vai de um estado a outro passando pelos do meio | https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html (manual) | **não passa**: é do jogo |
| Motores (andar, bater asa, piscar automático) | Creature (Kestrel Moon) | movimento procedural gerado por "motor" | https://kestrelmoon.com/creaturedocs/Animation/Animation_Overview.html (manual) | **passa** só o motor que é função do tempo (onda, ciclo). **Não passa** o que simula (ver abaixo). Bake em chaves: só no editor |
| Soft body / corda / física de malha | Creature | a malha balança como pano ou gelatina | https://kestrelmoon.com/creaturedocs/Animation_Samples_And_Examples/Samples_And_Videos.html (manual) | **não passa** ao vivo (tem história); **passa** assado em `deform` |
| Pesos automáticos "inteligentes" | Creature; Unity 2D Animation (Auto Weights) | pesos gerados sem pintar | https://www.kestrelmoon.com/creature/more_info_2.html (oficial) · https://docs.unity3d.com/Packages/com.unity.2d.animation@4.0/manual/CharacterRig.html (manual) | só no editor. **O Recorte já tem** algo parecido (`mesh/weights.ts`) — conferir qualidade |
| Captura de movimento → ossos | Creature Pro | vídeo/mocap vira animação | https://kestrelmoon.com/creature/purchase.html (oficial) | só no editor (sai chave) |
| Motion Pilot (marionete com o mouse, gravada) | Cartoon Animator 5.2 (Reallusion, 11/2023) | arrastar o boneco ao vivo grava chaves; "Wave" balança sozinho | https://magazine.reallusion.com/2023/11/29/anyone-can-create-professional-animations-with-cartoon-animator-5-2-motion-pilot/ (revista oficial) | só no editor (sai chave) |
| Spring bones | Cartoon Animator 5 (12/2022) | cabelo e roupa balançam sem chave | https://digitalproduction.com/2022/12/13/reallusion-veroeffentlicht-cartoon-animator-5/ (imprensa) | já temos física (6.5). Mesma nota da física: estado atravessa quadros |
| Puppet Stage / câmera ao vivo | Cartoon Animator 5.3 (09/2024) | vários bonecos controlados ao vivo | https://magazine.reallusion.com/2024/09/20/control-diverse-characters-for-live-performances-with-cta5-3/ (revista oficial) | **não passa** (ao vivo); gravado vira chave |
| Motion sync (boca pelo áudio, vira chave) | Live2D Cubism 5.0 | voz gera movimento de boca na linha do tempo | https://docs.live2d.com/en/cubism-editor-manual/new-function5-0/ (manual) | só no editor (sai chave). Spec já tem `BONE_lipsync` |
| Gerar rosto automático | Live2D Cubism 5.0 | cria deformadores e movimento do rosto com sliders | https://docs.live2d.com/en/cubism-editor-manual/new-function5-0/ (manual) | só no editor |
| Blendshape em tudo (ordem, opacidade, cor) | Live2D Cubism 5.0 | forma somada vale para qualquer propriedade | https://docs.live2d.com/en/cubism-editor-manual/new-function5-0/ (manual) | **passa**; o driver 8.2 modo `add` já cobre quase tudo — conferir `drawOrder` com `add` (spec proíbe) |
| Sprite Library / Sprite Swap | Unity 2D Animation | troca a imagem de uma parte por categoria/rótulo | https://docs.unity3d.com/Packages/com.unity.2d.animation@10.1/changelog/CHANGELOG.html (changelog) | **passa**; já coberto por skins e chave de attachment |
| PSD → personagem montado ("Character Rig") | Unity PSD Importer | camadas do PSD viram prefab montado | https://docs.unity3d.com/Packages/com.unity.2d.psdimporter@10.1/manual/index.html (manual) | só no editor. **O Recorte já importa PSD** |
| Modificadores de esqueleto (LookAt, Aim, cópia de transform, mola) | Godot 4.4 / 4.5 (só 3D) | olhar para um alvo, torcer, mola | https://godotengine.org/article/inverse-kinematics-returns-to-godot-4-6/ (blog oficial) | LookAt/Aim **passa** (constraint sem história); mola **não passa**. No 2D do Godot ainda é o `SkeletonModification2D` antigo: https://docs.godotengine.org/en/stable/classes/class_skeletonmodification2d.html |

#### A.2 O que apareceu depois de 2024

| Função | Quem tem | O que faz | Fonte | Régua |
|:---|:---|:---|:---|:---|
| Sliders | Spine 4.3 (beta 04/04/2025) | constraint que aplica uma animação; dirigida à mão ou por osso | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) · https://en.esotericsoftware.com/blog/The-4.3-beta-is-now-available (blog oficial) | **passa**. Já na spec (8.2). Falta conferir o **painel** no editor |
| Transform constraint "mapa de propriedade" | Spine 4.3 | mover um osso faz outro girar; clamp; mundo/local | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | **passa**. Conferir se a 6.3 da spec tem mapa X→rotação; os títulos não dizem |
| Escala volumétrica em IK e física | Spine 4.3 | ao esticar, afina (preserva volume) | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | IK **passa**; na física, mesma nota da física. Spec tem `uniform`, **não achei "volume"** |
| Chaves na pasta da ordem de desenho | Spine 4.3 | a ordem dentro de uma pasta anima separada da ordem geral | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | **passa**. Não achei "pasta de ordem" na spec |
| Linked mesh em outro slot | Spine 4.3 | a cópia da malha pode morar em slot diferente | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | **passa**. Conferir 7.5 |
| "Key constrained values" (assar o que a regra fez) | Spine 4.3 | converte o movimento da constraint em chaves | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | só no editor (sai chave). Spec permite bake da física; **não achei** o comando para IK/transform no editor |
| Contorno de várias malhas de uma vez | Spine 4.3 | traça muitas imagens num gesto | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | só no editor |
| Pintar pesos em várias malhas | Spine 4.3 | um pincel, várias malhas | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | só no editor |
| Janela de Problemas (com "consertar") | Spine 4.3 | lista avisos do projeto e oferece correção | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | só no editor. **Casa com a regra 21 da casa** (avisar, não improvisar) |
| Conta nos campos numéricos | Spine 4.3 | digitar `120/2` num campo | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | só no editor. Não achei no editor |
| Curva: alça que acompanha ao mover chave; "última curva usada" | Spine 4.3 | a curva não entorta ao mover a chave | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | só no editor |
| Exportar HTML / Web Components | Spine 4.3 | uma página que já toca a animação | https://esotericsoftware.com/blog/Spine-4.3-released (blog oficial) | só no editor (exportação). Não achei no editor |
| Vento e gravidade no esqueleto inteiro | spine-runtimes 4.3 | um vento para todas as físicas | https://github.com/EsotericSoftware/spine-runtimes/blob/4.3/CHANGELOG.md (changelog) | **não passa** ao vivo (física); é API do jogo |
| Data Binding | Rive (15/04/2025) | propriedades ligadas a um "view model" de dados | https://rive.app/blog/data-binding-in-rive-a-shared-language-for-designers-and-developers (blog oficial) | **não passa** como ligação viva; o que ele liga já é parâmetro/variável na spec |
| Data Binding: listas, imagens, artboards | Rive (2025) | trocar imagem ou artboard inteiro pelo dado | https://rive.app/blog/data-binding-supercharged-lists-images-and-artboards (blog oficial) | **não passa** (entrada do jogo); troca de imagem por skin **passa** |
| Layouts responsivos (Yoga) | Rive | o artboard se ajeita ao tamanho da caixa | https://rive.app/features (página oficial) | **não passa**: depende do tamanho da tela, não do tempo. É de interface, não de boneco |
| Scripting Luau no editor | Rive (13/01/2026; porquê: 20/11/2025) | código dentro do arquivo | https://rive.app/blog/scripting-is-live-in-rive (blog oficial) · https://rive.app/blog/why-scripting-runs-on-luau (blog oficial) | **não passa**: código arbitrário não garante repetir o quadro |
| Parameter Controller (arrastar na cena; segue alvo) | Live2D Cubism 5.2 (5.2.03 em 05/2025) | um controle move vários parâmetros; mão e pé grudam num alvo | https://docs.live2d.com/en/cubism-editor-manual/new-function5-2/ (manual) · https://x.com/Live2D/status/1928013601996259444 (conta oficial) | só no editor (sai chave). Parece o **joystick** do Rive |
| Colar forma espelhada | Live2D Cubism 5.2 | copia o lado esquerdo para o direito, invertido | https://docs.live2d.com/en/cubism-editor-manual/new-function5-2/ (manual) | só no editor. Temos "Colar espelhado" de chaves; **malha espelhada não achei** |
| Edição de laço | Live2D Cubism 5.2 | duplica a chave na borda para o laço emendar | https://docs.live2d.com/en/cubism-editor-manual/new-function5-2/ (manual) | só no editor (sai chave) |
| 15 modos de cor + 5 de alfa | Live2D Cubism 5.3 (20/01/2026) | blend por objeto além de normal/somar/multiplicar | https://docs.live2d.com/en/cubism-editor-manual/new-function5-3/ (manual) | **passa** (é propriedade fixa ou stepped). Spec tem 4 modos |
| Desenho fora da tela por grupo (offscreen) | Live2D Cubism 5.3 | o grupo vira uma imagem só; opacidade sem sobreposição | https://docs.live2d.com/en/cubism-editor-manual/new-function5-3/ (manual) · https://docs.live2d.com/en/cubism-editor-manual/cubism5-3-notes/ (manual) | **passa** (é regra de desenho). Não achei na spec |
| Deformador que cresce com o filho | Live2D Cubism 5.3 | a grade pai se estica sozinha | https://docs.live2d.com/en/cubism-editor-manual/new-function5-3/ (manual) | só no editor |
| Smart Bone 360° | Moho 14.4 (11/11/2025) | o desenho muda a cada ângulo de um giro inteiro | https://moho.lostmarble.com/blogs/news/free-update-export-to-video-game-engines-with-the-moho-14-4-side-quest (blog oficial) | **passa**. Spec cobre (`repeat` em 8.1) |
| Exportar glTF para motores | Moho 14.4 | rig e animação para Unity/Unreal/Godot/Blender | mesma URL acima | **passa**. **O Recorte já exporta glTF** |
| Desfazer agrupado por controle | Moho 14.4 | um arrasto de slider = um desfazer | mesma URL acima | só no editor |
| Escolher camada atrás da escolhida (Alt+botão direito) | Moho 14.4 | pega o que está por baixo | mesma URL acima | só no editor |
| Breakdown Pose Assistant | Harmony 25 (06/2025) | o meio-termo "favorece" uma das chaves; antecipação e overshoot | https://www.cartoonbrew.com/sponsored-by-toon-boom/with-harmony-25-toon-boom-animation-introduces-helpful-tools-across-the-2d-animation-pipeline-247741.html (texto patrocinado) · https://docs.toonboom.com/help/harmony-25/advanced/getting-started/deformation.html (manual) | só no editor (sai chave). Não achei no editor |
| Travar a régua da linha do tempo | Harmony 25 | não muda o tempo sem querer ao arrastar | mesma URL da Cartoon Brew | só no editor |
| Attribute Controller "treinado" com chaves | Harmony 27 (16/06/2026) | converte chaves prontas em controle de pose | https://docs.toonboom.com/help/harmony-27/premium/release-notes/harmony/harmony-27-release-notes.html (notas oficiais) · https://cinemaengineer.com/news/toon-boom-harmony-27-released-with-new-tools-for-2d-animation-workflows (imprensa) | **passa** o resultado (vira driver 8.2); o "treinar" é só no editor |
| Travar seleção por camada | Harmony 27 | a camada aparece mas não se clica | mesma URL das notas | só no editor |
| Espelhar a referência | Harmony 27 | vira a imagem de referência sem tocar no arquivo | mesma URL das notas | só no editor. Temos `viewport/reference.ts` — conferir se espelha |
| Spriter 2 beta (ordem animável, ver ossos, vários personagens) | Spriter 2 (beta 14/02/2026; alpha 0.9.7.9 em 27/01/2025) | ainda em beta | https://x.com/Spriter2D/status/1883686807453503592 (conta oficial) · https://brashmonkey.com/forum/index.php?/topic/40419-spriter-2-beta-release-20260214/ (fórum oficial; **fora do ar** quando abri) | nada novo para nós; ordem animável já temos |
| DragonBones | Egret | parado; download oficial fora do ar | https://github.com/DragonBones/dragonbones.github.io/issues/26 [OPINIÃO] · https://docs.egret.com/dragonbones/en (manual; **recusou conexão** quando abri) | — (estado: morto) |
| Deformação com cálculo por sprite e caixa por osso | Unity 2D Animation 15 | desempenho | https://docs.unity3d.com/Packages/com.unity.2d.animation@15.0/changelog/CHANGELOG.html (changelog) | é de runtime; nada para o formato |

#### A.3 IA e tendências (depois de 2024)

| Função | Quem | O que faz | Fonte | Produto ou pesquisa? | Régua |
|:---|:---|:---|:---|:---|:---|
| AI Inbetweening entre duas poses | Cascadeur 2025.1 | gera o meio entre duas poses | https://cascadeur.com/blog/general/cascadeur-20251-released-faster-animation-workflows-with-ai-inbetweening (blog oficial) | **produto, só 3D** | só no editor (sai chave). Ideia aproveitável no 2D |
| AutoPosing | Cascadeur | mexe um ponto, o corpo acompanha natural | https://cascadeur.com/blog/view/cascadeur-2025-3-new-inbetweening-quadrupeds (blog oficial) · https://cascadeur.com/help/faq (FAQ) | **produto, só 3D, só humanoide/quadrúpede** | só no editor |
| Motion-In-Betweening | Animaj (03/04/2025) | IA faz o meio entre poses de rig | https://www.animaj.com/post/animaj-sketch-to-motion-workflow-part-2-2 (blog da empresa) | **ferramenta interna, 3D** | só no editor |
| Uma imagem → pedaços → rig → Spine | GodMode AI | corta o personagem em partes, põe ossos, exporta Spine 3.5–4.2 | https://www.godmodeai.co/ai-spine-animation (página do produto; **pausado** quando abri) | produto (pausado) | só no editor (sai `.bone` comum) |
| Skill de IA para Spine (rig, animação, prévia) | GenielabsOpenSource | gera JSON de esqueleto e animação | https://github.com/GenielabsOpenSource/spine-animation-ai (repositório) | projeto aberto, pequeno | só no editor |
| ToonCrafter | Xing et al., SIGGRAPH Asia 2024 | IA de vídeo desenha o meio entre dois quadros de desenho | https://arxiv.org/abs/2405.17933 (artigo) · https://github.com/Doubiiu/ToonCrafter (código) | **pesquisa** | **não passa**: gera pixels por quadro, não ossos |
| Animate Anyone / Animate Anyone 2 | Alibaba (11/2023; 02/2025) | uma foto + pose → vídeo do personagem | https://arxiv.org/abs/2311.17117 · https://arxiv.org/abs/2502.06145 (artigos) | **pesquisa** | **não passa**: vídeo gerado. Só a *pose de entrada* poderia virar chave |

#### A.4 O que eu tiro disso (curto)

| Tema | Por quê olhar |
|:---|:---|
| Janela de Problemas | Spine 4.3 fez; é a regra 21 da casa com tela |
| Assar constraint em chave | Spine 4.3; spec já deixa, falta o comando |
| Breakdown que favorece | Harmony 25; é chave comum, gesto barato |
| Controle 2D na cena (joystick / parameter controller) | Rive e Live2D 5.2; o formato já tem o parâmetro |
| Offscreen por grupo e mais blends | Live2D 5.3; decisão de formato — **é do Humberto** (regra 7) |
| Ordem de desenho por pasta keyada | Spine 4.3; decisão de formato — **é do Humberto** |

---

## Parte 4 — grade em perspectiva

Ideia do Humberto: *"se o jogo for top-down seria interessante ter uma grade em
perspectiva, em vez de uma quadrada — o usuário poderia alinhar."*

### B.1 Os três de referência

| Programa | Grade em perspectiva? | Fonte | Honestidade |
|:---|:---|:---|:---|
| Spine | não encontrei. O manual da interface fala de pan e zoom, sem grade isométrica. Tem "Pixels" (encaixe no pixel) | http://esotericsoftware.com/spine-ui (manual) · http://en.esotericsoftware.com/spine-settings (manual) | ausência não confirmada por texto; só não aparece |
| Spriter Pro | não encontrei | http://www.brashmonkey.com/spriter_manual/index.htm (manual; **site suspenso** quando abri) | **não consegui conferir** |
| DragonBones Pro | não encontrei. A página "Grid" do manual parece ser a malha, não guia | https://docs.egret.com/dragonbones/en/docs/dbPro/advancedFeatures/grid (manual; **recusou conexão**) | **não consegui conferir** |

Conclusão: nenhum dos três mostra isso na documentação que abriu. Dois sites estavam fora do ar.

### B.2 Como os outros resolvem

| Programa | Como se define | Detalhe útil | Fonte |
|:---|:---|:---|:---|
| Tiled | `orientation`: orthogonal, isometric, staggered, hexagonal, **oblique** (`skewx`/`skewy`). Ângulo sai de `tilewidth` × `tileheight` (2:1 comum) | objeto de tile em mapa isométrico se alinha pelo **meio de baixo** (`objectalignment` padrão `bottom`) — é o "pé" | https://doc.mapeditor.org/en/stable/reference/tmx-map-format/ (referência oficial) · https://doc.mapeditor.org/en/stable/manual/maps/ (manual) |
| LDtk | só grade quadrada; isométrico marcado "não vai fazer" | recomenda o Tiled | https://github.com/deepnight/ldtk/issues/944 (issue oficial) |
| Godot 4 TileSet | `tile_shape`: square, **isometric** (losango), half-offset, hexagon. `tile_layout`: stacked, stairs, **diamond right/down** | isométrico pede Y-sort ligado | https://docs.godotengine.org/en/stable/classes/class_tileset.html (manual) · https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html (manual) |
| Unity Tilemap | Cell Layout: Rectangle, Hexagon, **Isometric**, **Isometric Z as Y**. Célula padrão **(1, 0,5, 1)** = dimétrica; isométrica "verdadeira" = Y **0,57735** | "Z as Y": a altura vira deslocamento em Y — o chão e a altura separados | https://docs.unity3d.com/2022.3/Documentation/Manual/Tilemap-Isometric-CreateIso.html (manual) · https://docs.unity3d.com/6000.5/Documentation/Manual/tilemaps/work-with-tilemaps/isometric-tilemaps/renderer/tilemap-renderer-isometric-modes.html (manual) |
| Aseprite | tipo de grade ortogonal/**isométrica**; ângulo sai só da largura × altura da célula; encaixe na grade | juntado em 05/2026 (PR #5793); versão estável não confirmada | https://github.com/aseprite/aseprite/pull/4818 (PR oficial) · https://github.com/aseprite/aseprite/issues/5612 (issue) |
| Krita | assistentes: ponto de fuga, **perspectiva de 2 pontos com grade** e "densidade", régua paralela, olho de peixe; "encaixar nos assistentes" | ponto de fuga com 4 pontos de ajuda | https://docs.krita.org/en/user_manual/painting_with_assistants.html (manual) · https://docs.krita.org/en/reference_manual/tools/assistant.html (manual) |
| Clip Studio Paint | régua de perspectiva: pontos de fuga + **linha do olho**; encaixe liga/desliga por ponto | o ponto de fuga pode andar **preso na linha do olho** | https://help.clip-studio.com/en-us/manual_en/510_ruler/Perspective_Rulers.htm (manual) · https://www.clip-studio.com/site/gd_en/csp/userguide/csp_userguide/740_pers_ruler/740_pers_ruler_snap_howto_shoushitsu.htm (manual) |
| Photoshop | Vanishing Point: 4 cantos formam um plano com grade; plano azul = válido, **vermelho/amarelo = inválido** | avisa quando o plano não faz sentido | https://helpx.adobe.com/photoshop/using/vanishing-point.html (manual) |
| Illustrator | grade de perspectiva com **presets** de 1, 2 e 3 pontos; salvar preset próprio | presets nomeados | https://helpx.adobe.com/illustrator/using/perspective-drawing.html (manual) · https://helpx.adobe.com/ca/illustrator/desktop/manage-objects/reshape-transform-objects/define-object-or-document-perspective.html (manual) |

**Lição:** jogo top-down usa **projeção paralela** (Tiled, Godot, Unity, Aseprite). Ponto de fuga (Krita, CSP, Photoshop) é de ilustração: as linhas convergem, e um personagem de jogo não encolhe ao subir na tela. Para o Recorte, **paralela primeiro**; ponto de fuga fica para depois, se ele pedir.

### B.3 O que o Recorte já tem (lido na pasta)

| Arquivo | O que faz hoje |
|:---|:---|
| `editor/src/viewport/camera.ts` `gridStep` | passo da grade muda com o zoom (1, 2, 5, 10…); a grade **não tem tamanho fixo no mundo** |
| `editor/src/viewport/viewport-draw.ts` `drawGrid` | só linhas em pé e deitadas, mais os dois eixos coloridos |
| `editor/src/viewport/rulers.ts` | réguas em cima e à esquerda, **com o mesmo `gridStep`** da grade ("duas escalas na mesma tela é pior que nenhuma") |
| `editor/src/viewport/guides-model.ts` | guias em pé (`x`) e deitadas (`y`); ímã de 6 px de tela; moram em `RECORTE_editor_state.view.guides`, nunca no núcleo |
| `editor/src/viewport/tools/translate.ts` | Mover imanta nas guias; **Shift trava o eixo** (horizontal/vertical) e **desliga o ímã** |
| `editor/src/viewport/onion.ts` `DEFAULT_VIEW` | onde moram `grid`, `gridPixels`, `showGuides` |

### B.4 O gesto proposto para o Recorte

**Onde mora:** é guia do editor. **Nunca vai ao núcleo do `.bone`** (regra 6).
Proposta: o tipo e o ângulo em `RECORTE_editor_state.view` (junto das guias —
o boneco de um jogo isométrico abre isométrico em qualquer máquina); liga/desliga
e cor como preferência da máquina. **Decisão do Humberto:** se ele preferir
tudo na máquina, basta mudar de lugar.

**Como se define o ângulo**

| Preset | Proporção do losango | Ângulo da linha | Para quê | Base |
|:---|:---:|:---:|:---|:---|
| Quadrada (hoje) | — | 0° / 90° | lado, plataforma | o que temos |
| Isométrica 2:1 (padrão de jogo) | 2 : 1 | 26,57° | pixel art isométrica | Tiled 2:1; Unity (1; 0,5) |
| Isométrica verdadeira | 1 : 0,577 | 30° | arte desenhada, não pixel | Unity 0,57735 |
| Dimétrica | livre, ex. 3 : 1 | ex. 18,43° | câmera mais baixa | Aseprite (ângulo = largura × altura) |
| Oblíqua / top-down ¾ | chão deitado + linha em pé | 0° e inclinação livre | Zelda-like, RPG de cima | Tiled `oblique` (`skewx`) |
| Livre | digitar **graus** ou **L × A** | qualquer | caso raro | — |

Campo principal: **largura × altura do losango em pixels** (ex. `64 × 32`).
Os graus aparecem ao lado, só para ler. Motivo: quem faz o jogo sabe o tamanho
do tile, não o ângulo — é assim no Tiled, Unity, Godot e Aseprite.

**Tabela de gestos**

| Gesto | O que acontece | Parecido com |
|:---|:---|:---|
| Exibir → Grade → **Quadrada / Isométrica 2:1 / Isométrica 30° / Dimétrica / Oblíqua / Livre…** | troca o desenho da grade | Illustrator (presets) |
| Botão direito na grade → "Tamanho do losango…" | janela pequena: L × A em px, graus ao lado | Tiled `tilewidth/tileheight` |
| A grade em perspectiva tem **tamanho fixo no mundo** | não muda com o zoom (diferente da quadrada de hoje) | Tiled, Godot — um tile é um tile |
| Régua de cima e da esquerda | continuam retas, em pixels; **não viram isométricas** | Tiled, Unity |
| **Linha de chão** | uma guia deitada comum (`guides-model.ts`), já existe | Spriter / nossa guia |
| Mover o pivô do osso raiz perto de uma **interseção** | imanta nela, 6 px de tela, igual às guias | Aseprite "snap to grid" |
| Mover **com Shift** em grade isométrica | trava no eixo **da grade** (as duas diagonais), não em horizontal/vertical | CSP "encaixe no ponto de fuga" |
| Alt enquanto move | desliga o ímã por um instante | regra comum de ímã |
| **Losango do pé** | desenha um losango do tamanho de um tile no pivô do osso raiz | Tiled `objectalignment = bottom` |
| Losango do pé fica **vermelho** se o pivô não está numa interseção | aviso, não conserto | Photoshop (plano vermelho) · regra 21 |
| Guias e grade juntas | a guia imanta primeiro; depois a interseção | ordem fixa, uma tecla só (regra 12) |

**Cuidados**

| Cuidado | Por quê |
|:---|:---|
| Shift hoje **desliga** o ímã e trava horizontal/vertical | com grade isométrica, o Shift passa a travar nas diagonais — **muda um gesto que já existe**; perguntar ao Humberto |
| `gridStep` é o mesmo da régua | a grade isométrica não pode usar esse passo (muda com zoom); precisa de um passo próprio, e a régua fica como está |
| Ponto de fuga (2 ou 3 pontos) | não vale para jogo top-down; deixar fora da primeira versão |
| Tecla nova | uma linha em `ui/keys.ts`; menu, um id em `ui/actions-table.ts` (regra 17) |

**Não consegui abrir:** manual do Spriter (site suspenso), docs do DragonBones (conexão recusada), "What's new in Harmony 27" do Help Centre (403; usei as notas oficiais no lugar). **Data exata do Spine 4.3 final:** não achei; só o beta (04/04/2025).

---

## Decisões que são do Humberto

| # | De onde | Pergunta |
|:---:|:---|:---|
| 1 | Partículas | Extensão `BONE_particles` primeiro, núcleo depois? (recomendo sim) |
| 2 | Partículas | Taxa animável por integral, ou só liga/desliga? (recomendo integral) |
| 3 | Partículas | Sub-emissor e rastro numa segunda fase? (recomendo sim) |
| 4 | De fora | Desenhar um grupo como imagem só (Live2D 5.3) — campo novo no formato (regra 7) |
| 5 | De fora | Ordem de desenho animada dentro de pasta (Spine 4.3) — campo novo no formato |
| 6 | Grade | O tipo da grade vai com o boneco (`RECORTE_editor_state`) ou fica na máquina? |
| 7 | Grade | Com grade isométrica, o Shift trava nas diagonais em vez de em pé/deitado? |

As outras quatro decisões menores das partículas estão na Parte 2, seção 7.

## Mandado a outros pesquisadores (não escrito aqui)

| Para | O quê |
|:---|:---|
| Pesquisa 2 · efeitos | partículas em curva do Moho 14.4; feathering e trim paths do Rive; offscreen e 15 misturas de cor + 5 de alpha do Live2D 5.3 |
| Pesquisa 3 · pedidos | grade isométrica pedida no Aseprite; LDtk isométrico recusado; fórum do beta do Spine 4.3 |
| Pesquisa 4 · erros | DragonBones "descontinuado?"; comparação de programas 2026 (blog de terceiro) |
