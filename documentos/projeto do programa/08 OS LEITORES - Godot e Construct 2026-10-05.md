# Os leitores — Godot e Construct — 05/10/2026

Rodada 22. Escrita pelo chat `PESQUISA · rodada 22 — os leitores: Godot e Construct`.
**Sem código. O programa não foi aberto. Nenhum teste rodou.** Só leitura e internet.

---

## Em seis linhas

| # | O achado |
|:---:|:---|
| 1 | **Construct: o plugin pode levar o nosso `runtime/` inteiro, sem mudar uma linha.** O Spine faz exatamente isso no plugin oficial dele |
| 2 | **Godot: não roda TypeScript.** O leitor é um terceiro runtime. O caminho barato é **GDScript**, copiado do runtime Python (6 mil linhas, sintaxe quase igual) |
| 3 | **Converter para os nós do Godot perde demais**: só 4 ossos por vértice, sem as regras, sem as partículas iguais. Não recomendo |
| 4 | **Os 90 casos rodam nas duas.** Godot: por um adaptador sem janela (`--headless`). Construct: o mesmo arquivo do plugin roda no Node |
| 5 | **Começar pelo Construct.** Menos trabalho, e o Humberto já usa |
| 6 | O plugin oficial do Spine para Construct pede **r495**: não instala no r449 dele. O nosso tem de mirar o **r449** |

---

## As fontes

| Fonte | Link | Como li |
|:---|:---|:---|
| Godot 4.7 — CanvasItem (desenho) | https://docs.godotengine.org/en/stable/classes/class_canvasitem.html | direto |
| Godot 4.7 — RenderingServer | https://docs.godotengine.org/en/stable/classes/class_renderingserver.html | direto (`canvas_item_add_triangle_array`) |
| Godot 4.7 — Polygon2D | https://docs.godotengine.org/en/stable/classes/class_polygon2d.html | direto |
| Godot — código do Polygon2D | https://github.com/godotengine/godot/blob/master/scene/2d/polygon_2d.cpp | direto: **4 ossos por vértice** (`bones.resize(vc * 4)`) |
| Godot — esqueleto 2D (tutorial) | https://docs.godotengine.org/en/stable/tutorials/animation/2d_skeletons.html | direto |
| Godot — Skeleton2D | https://docs.godotengine.org/en/stable/classes/class_skeleton2d.html | direto |
| Godot — GDExtension | https://docs.godotengine.org/en/latest/engine_details/engine_api/gdextension/what_is_gdextension.html | direto |
| Godot — C# | https://docs.godotengine.org/en/stable/tutorials/scripting/c_sharp/index.html | direto: *"projects written in C# cannot be exported to the web platform"* |
| Godot — exportar para a web | https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html | direto |
| Godot — GDScript avançado | https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_advanced.html | direto |
| Godot — EditorImportPlugin | https://docs.godotengine.org/en/stable/classes/class_editorimportplugin.html | direto |
| Godot — OS (stdin) e linha de comando | https://docs.godotengine.org/en/stable/classes/class_os.html · https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html | direto |
| Godot — ZIPReader · `clip_children` | https://docs.godotengine.org/en/stable/classes/class_zipreader.html · https://docs.godotengine.org/en/stable/classes/class_canvasitem.html | direto |
| spine-godot | https://en.esotericsoftware.com/spine-godot · https://github.com/EsotericSoftware/spine-runtimes/tree/4.2/spine-godot | direto (inclusive o importador: `SpineSkeletonFileResource`, `SpineAtlasAssetResource`) |
| DragonBones para Godot | https://github.com/Daylily-Zeleen/Godot-DragonBones | direto (README) |
| Spriter para Godot (importador) | https://github.com/wojtossfm/godot_scml_importer | direto (README) |
| Construct — Addon SDK (repositório oficial) | https://github.com/Scirra/Construct-Addon-SDK | direto: README, `drawingPlugin`, `customImporterPlugin` |
| Spine para Construct (oficial) | https://github.com/EsotericSoftware/spine-runtimes/tree/4.3-beta/spine-ts/spine-construct3 | direto: `addon.json`, `aces.json`, `instance.ts`, o desenhador, o carregador, `IRenderer.d.ts`, `IAssetManager.d.ts` |
| spine-ts README | https://github.com/EsotericSoftware/spine-runtimes/blob/4.3-beta/spine-ts/README.md | direto |
| Construct r441, r397, r449 | busca na web (só o trecho) | **não li a página**: o site pede verificação de robô |
| Spriter para Construct | busca na web (só o trecho) | **não li a página**: idem |
| Nosso | `runtime/README.md`, `runtime/src/` (index, file, nested, skeleton-attachment), `formato/ESPECIFICACAO 2026-09-17.md` (§2.8, §3.3, §4.8, §7.4, §7.11–7.13), `conformidade/como-provar-conformidade.md` | lido |

### O que NÃO consegui ler (o Humberto pode colar)

O site `construct.net` parou na *"verificação de segurança"*. Tentei pelo navegador; não passei. **Não tentei passar à força.**

| # | Página | Para quê |
|:---:|:---|:---|
| 1 | https://www.construct.net/en/make-games/manuals/addon-sdk/reference/graphics-interfaces/irenderer | o `drawMesh` como está no **r449** (eu li a versão do r495, no GitHub do Spine) |
| 2 | https://www.construct.net/en/make-games/releases/stable/r449 | o que o r449 trouxe |
| 3 | https://www.construct.net/en/make-games/addons/192/spriter | como o plugin do Spriter desenha e quais ações tem |
| 4 | https://www.construct.net/en/make-games/manuals/addon-sdk/guide/addon-metadata | o `min-construct-version` |
| 5 | o manual do Construct sobre **modos de mistura** (blend) | se tem `multiply` e `screen` |
| 6 | o manual sobre **minificação avançada** e addons | se ela quebra o nosso código |

---

## 1. Godot — as opções, lado a lado

**Godot de hoje: 4.7** (está no topo de toda página da documentação).

| | **A. Addon em GDScript** | **B. Addon em C#** | **C. GDExtension (C++ ou Rust)** | **D. Converter para nós do Godot** |
|:---|:---|:---|:---|:---|
| O que é | o leitor escrito na língua do Godot. Um nó `Recorte` desenha o boneco | o mesmo, em C# | o leitor compilado, carregado pelo Godot | um importador lê o `.bone` e cria `Skeleton2D`, `Bone2D`, `Polygon2D`, `AnimationPlayer` |
| Malha com pesos | **sim, sem limite** (a conta é nossa) | sim | sim | **só 4 ossos por vértice** (o código do Godot corta) |
| Conexão (entidade no slot) | **sim** | sim | sim | pela metade: cena dentro de cena; trocar no jogo é código à parte |
| Skin (pilha, esconder, osso de skin) | **sim** | sim | sim | **não**: o Godot não tem skin 2D. Vira código à parte |
| Partículas | **sim, a mesma conta** | sim | sim | só pela partícula do Godot: **nunca igual ao editor** |
| Regras (IK, caminho, física, driver) | sim | sim | sim | **não**: o IK 2D do Godot é outro; caminho, física e driver não existem |
| Funciona na web | **sim**, sem nada especial | **não**: *"cannot be exported to the web"* | só com *Extensions Support*, e o pré-compilado pede *threads* (cabeçalhos especiais no servidor) | sim |
| Funciona em celular | sim | experimental | sim, compilando para cada um | sim |
| Velocidade | a mais lenta das três (a doc diz: *"Less performance than statically typed languages"*) | rápida | a mais rápida | a do Godot |
| Trabalho | **médio**: copiar o runtime Python (6 mil linhas) para GDScript, que tem quase a mesma escrita | médio, mas perde a web | **grande**: compilar para 5 plataformas, toda versão | médio para começar, **sem fim** para tapar o que perde |
| Os 90 casos | **sim**, pelo adaptador sem janela | sim | sim | **não**: o que se mede é a cena do Godot, não a nossa conta |
| O que o Humberto digitaria | `$Heroi.encaixar("mao", "motosserra")` | `heroi.Encaixar("mao", "motosserra");` | igual à A | `$Heroi/mao.add_child(motosserra)`, e mais código para cada coisa |

### Como o Spine e o DragonBones fizeram no Godot

| | Spine (`spine-godot`) | DragonBones (`Godot-DragonBones`) | Spriter (`godot_scml_importer`) |
|:---|:---|:---|:---|
| Quem fez | **oficial** (Esoteric) | comunidade | comunidade |
| Como | **GDExtension** ou módulo do motor, em C++ | GDExtension em C++ | **converter**: importador em GDScript |
| Por quê | *"spine-godot is based on spine-cpp"*: eles **já tinham** o leitor em C++ | nasceu de um módulo C++ do Godot 3 (`gddragonbones`) | — |
| C# | só com o motor recompilado | — | — |
| Web | o GDExtension funciona | pede *Extensions Support* e *threads* | sim |
| O que perde | tint escuro e o blend `screen` | — | **curvas, eventos, som, variáveis, etiquetas; escala de osso "não funciona como esperado"** |
| Encaixe | `SpineSlotNode`: põe um nó do Godot **na ordem de desenho** de um slot | `DragonBonesSlot` | — |
| Skin | `custom_skin.add_skin(...)`, depois `set_skin` | — | character map, pouco testado |

**A lição:** o Spine e o DragonBones foram para C++ **porque já tinham um leitor em C++**. Nós temos TypeScript e Python. O nosso C++ é o GDScript. E o único que converteu (Spriter) **perdeu metade** do formato.

---

## 2. Construct — as opções, lado a lado

**Construct dele: r449 LTS.** O r449.3 saiu em 15/10/2025, com suporte até o **fim de 2026**. O SDK v2 existe desde o r397 (junho de 2024). O SDK v1 **some no r450**.

| | **A. Addon (SDK v2) com o nosso `runtime/` dentro** | **B. Script no projeto, sem addon** | **C. Converter para objetos do Construct** |
|:---|:---|:---|:---|
| O que é | um objeto **Recorte** no Construct. Ele carrega o `.bone` e desenha com `drawMesh` | um arquivo `.js` no projeto, que desenha numa camada pelo evento `afterdraw` | um importador cria um `Sprite` por imagem e anima pela Timeline do Construct |
| Malha com pesos | **sim** (`drawMesh`, desde antes do r441; cor por vértice no r441) | sim | **não**: o Sprite só tem a malha de distorção, sem ossos |
| Conexão | **sim** | sim | não |
| Skin | **sim** | sim | troca de quadro de Sprite, só |
| Partículas | **sim, a mesma conta** | sim | só a partícula do Construct (pequena, ver o `06`) |
| Recorte (clipping) | **pela conta**: o `IRenderer` **não tem** máscara (nem stencil nem tesoura). O leitor corta os triângulos antes de desenhar, como o Spine faz | idem | não |
| Eventos do Construct | **sim**: ações, condições, expressões, como qualquer objeto | **não**: só por "rodar script" | sim |
| Desenho no editor de layout | sim, com trabalho (o Spine faz) | não | sim |
| Trabalho | **pequeno no leitor** (é o nosso), médio na casca | o menor | grande, e perde quase tudo |
| Os 90 casos | **sim**: o mesmo arquivo `.js` do addon roda no Node com o adaptador de referência | sim | não |
| O que o Humberto digitaria | evento: `Heroi ▸ Encaixar "motosserra" no slot "mao"` | `runOnStartup(...)`, código | — |

### Como o Spine e o Spriter fizeram no Construct

| | Spine (`spine-construct3`, oficial) | Spriter (oficial, da BrashMonkey) |
|:---|:---|:---|
| Como | addon SDK v2, *"built on the core classes"*: o **spine-core em TypeScript inteiro** vai dentro | addon; o projeto vai num **zip** arrastado para o Construct |
| Versão mínima | **`"min-construct-version": "r495"`** — **não instala no r449** | portado para o SDK v2 em 20/03/2026; versão mínima **não li** |
| Desenho | `drawMesh(posições, uv, índices, cores)`, uma chamada por pedaço, com `setBlendMode` antes | **não li** |
| Arquivos | da pasta *Files* do projeto: `assets.getProjectFileUrl` e `fetchJson`, `fetchText`, `fetchBlob` | zip com o mesmo nome do `.scon` |
| No editor de layout | desenha também, por `SDK.Gfx.IWebGLRenderer` | **não li** |
| Skin | `Set skin`, `Create custom skin`, `Add custom skin`, `Set custom skin` | `Append Character Map` |
| Encaixe | `Attach object to bone`: um objeto do Construct **segue** o osso (por cima, fora da ordem de desenho) | **não li** |
| Animação | `Set animation (track, animação, laço)`, `Add animation`, `Set time scale` | **não li** |

**A lição:** o Spine fez **o que propomos**: o leitor em TypeScript vai inteiro dentro do addon, e só o desenho é novo.

### O nosso `runtime/` dentro do Construct: o que muda

Li `runtime/src/`. **Não depende de nada de fora.** Só o desenhador `render/canvas.ts` usa o navegador (`document.createElement`).

| O quê | O que fazer |
|:---|:---|
| O leitor (`loader`, `skeleton`, `animation`, regras, partículas, `actor`, `nested`) | **nada**. Entra como está, num arquivo `.js` só, feito por um empacotador (o Spine usa um `spine-construct3-lib.js`) |
| `render/canvas.ts` | **fica de fora**. No lugar, um desenhador novo de ~300 linhas, que chama `drawMesh` |
| Ler os arquivos | o `loadSkeletonFile` pede os arquivos **na hora** (`files`, síncrono). O addon **busca antes** (atlas, entidades, skins de fora) e entrega o mapa pronto |
| `.bonez` | já usa `DecompressionStream`, que o navegador tem |
| Y para baixo | converter **só a matriz final**, como manda a §3.3 |
| Clipping | escrever o corte de triângulos (o Construct não tem máscara) |
| Cor escura (tint black) | precisa de um efeito (shader). Fica para depois |
| Escrita do JavaScript | o SDK pede **ES2021** (o compilador do Construct ainda não aceita campos de classe). O nosso é ES2022: o empacotador converte |

---

## 3. A recomendação

| Engine | Recomendo | Por quê, em três linhas |
|:---|:---|:---|
| **Construct** | **A. Addon SDK v2 com o `runtime/` dentro** | 1. O leitor já existe e já passa os 90 casos: só falta o desenho. 2. É o que o Spine fez no plugin oficial. 3. É o único caminho que dá eventos ao Humberto sem perder a malha, a skin e a conexão |
| **Godot** | **A. Addon em GDScript**, copiado do runtime Python | 1. Roda em todo lugar, até na web, sem compilar nada. 2. GDScript se escreve quase como Python: é cópia, não invenção, e os 90 casos provam. 3. Se medir lento, passa-se **só a parte quente** para GDExtension depois |

**Por qual começar: Construct.** O leitor já está pronto; o primeiro boneco dançando no Construct sai em duas rodadas. O Humberto já usa o Construct. O Godot vem depois, com a experiência da API.

**No Godot, um detalhe que conta:** o `.bone` entra pelo **importador do Godot**, mas **sem converter**. O importador só guarda o arquivo como recurso. Assim o Godot o leva junto ao exportar o jogo (arquivo que não é recurso fica para trás, se ninguém marcar o filtro). É o que o Spine faz com o `SpineSkeletonFileResource`.

**No Godot, o desenho:** `RenderingServer.canvas_item_add_triangle_array(...)`, com os triângulos prontos. **Não** usar `draw_polygon`: ele triangula de novo. Um item de desenho por modo de mistura; ou um por slot, se o jogo quiser pôr um nó do Godot **entre** duas peças (como o `SpineSlotNode`).

---

## 4. A API do jogo — igual nas duas

As palavras do Humberto. O que está entre parênteses é o que existe por dentro.

| Palavra | O que faz | Por dentro |
|:---|:---|:---|
| **tocar** | toca uma animação do boneco | `AnimationState` (já existe) |
| **vestir** | põe uma skin no topo da pilha. A de cima vence | `setSkinStack` (já existe) |
| **tirar skin** | tira essa skin da pilha | idem |
| **encaixar** | põe uma entidade num slot. Ela cai no pino da imagem, com a ordem e as chaves dela | uma **skin feita na hora**, de um item só, no topo da pilha. Assim nenhuma chave da animação a desfaz |
| **desencaixar** | tira a entidade. A imagem de antes volta | tira essa skin |
| **animar a peça** | escolhe a animação da entidade encaixada | `NestedSkeleton.setAnimation` (já existe) |
| **soltar a peça** | a peça fica livre para o jogo; ninguém manda nela | animar a peça com nada |

**O limite do slot é do jogo.** O leitor não guarda lista do que cabe. Ele dá ao jogo: a lista dos slots, a lista das entidades carregadas, e um **aviso a cada encaixe** (sinal no Godot, condição no Construct). O jogo diz "não" com um `if`.

### Construct (eventos)

| Palavra | Ação no evento |
|:---|:---|
| tocar | `Heroi ▸ Tocar animação "correr" (em laço)` |
| vestir | `Heroi ▸ Vestir skin "armadura"` |
| tirar skin | `Heroi ▸ Tirar skin "armadura"` |
| encaixar | `Heroi ▸ Encaixar "motosserra.bone" no slot "mao"` |
| desencaixar | `Heroi ▸ Desencaixar o slot "mao"` |
| animar a peça | `Heroi ▸ Animar a peça do slot "mao": "ligada" (em laço)` |
| soltar a peça | `Heroi ▸ Soltar a peça do slot "mao"` |
| aviso | condição `Heroi ▸ Ao encaixar` · expressões `Heroi.PecaDoSlot("mao")`, `Heroi.OssoX("mao")` |

### Godot (GDScript)

```gdscript
$Heroi.tocar("correr")
$Heroi.vestir("armadura")
$Heroi.tirar_skin("armadura")
$Heroi.encaixar("mao", preload("res://motosserra.bone"))
$Heroi.desencaixar("mao")
$Heroi.animar_peca("mao", "ligada")
$Heroi.soltar_peca("mao")
$Heroi.encaixado.connect(func(slot, peca): print(slot, peca))
```

**Trocar a espada pela motosserra:** Construct, uma ação: `Encaixar "motosserra.bone" no slot "mao"`. Godot, uma linha: `$Heroi.encaixar("mao", preload("res://motosserra.bone"))`.

---

## 5. Em quantas rodadas

Cada rodada termina com **foto lado a lado** (o editor e a engine, o mesmo quadro) e, onde vale, os casos.

### Construct — 7 rodadas

| # | Rodada | Prova |
|:---:|:---|:---|
| K1 | **O pacote.** O `runtime/` num arquivo `.js`. Um addon vazio que instala no **r449** | os 90 casos rodam **sobre esse arquivo**, no Node · o addon aparece no Construct |
| K2 | **Ver o boneco.** Ler `.bone`, atlas e imagem da pasta *Files*. Ossos, imagens, ordem, cor, mistura, Y para baixo. **Tocar animação** | foto: o herói andando no Construct |
| K3 | **Malha e recorte.** Malha com pesos, sequência, o corte de triângulos do clipping | foto: a cabeça (malha) e a máscara |
| K4 | **Skin.** Vestir, tirar, empilhar, esconder, osso de skin, skin de outro arquivo | foto: a armadura e a águia |
| K5 | **Conexão.** Encaixar, desencaixar, animar e soltar a peça; carregar a entidade de outro arquivo; objeto do Construct seguindo um osso | foto: a espada vira motosserra |
| K6 | **Partículas.** Todas as de um emissor numa chamada `drawMesh` | foto: a fogueira igual à do editor |
| K7 | **A casca.** O boneco no editor de layout; arrastar um `.bonez` para dentro; caixa de colisão; eventos do `.bone` como gatilho; exportar com minificação | foto do layout · um jogo exportado |

### Godot — 8 rodadas

| # | Rodada | Prova |
|:---:|:---|:---|
| G1 | **Ler e desenhar parado.** Copiar do Python o carregador, os ossos, o atlas. O nó `Recorte`. O adaptador sem janela | casos **A** (os de repouso) · foto |
| G2 | **Animações.** Linhas do tempo, curvas, eventos, ordem, laço | casos **A** e **X** · foto |
| G3 | **Malha.** Pesos, linkedmesh, deform, sequência, cor, mistura, recorte | casos **B** · foto |
| G4 | **Skin** | os casos C de skin · foto |
| G5 | **Conexão.** Esqueleto aninhado, a API de encaixe, a virada de corpo | os casos C de entidade e corpo · foto |
| G6 | **Regras.** IK, transform, caminho, física, driver, parâmetros, morph. Talvez parta em duas | o resto dos casos **C** |
| G7 | **Partículas** | os **19** casos **P** · foto |
| G8 | **A casca.** O importador que só guarda; o nó no editor (arquivo, skin, animação no Inspetor); `.bonez` (o Godot tem `ZIPReader`) e `.boneb`; medir a velocidade | foto · um jogo exportado para a web |

**Quando:** K1–K4 e G1–G4 **não dependem** da rodada 11 ("Este boneco"). Só K5 e G5 dependem, porque "Este boneco" muda a ordem de desenho da peça. Isto adianta as rodadas 18 e 19: hoje o `03` diz que as duas esperam a 11 inteiras.

---

## 6. O que no formato atrapalha um leitor

### 6.1 Malha com pesos numa skin de outro arquivo (achada na rodada 3)

**O nó.** O `binding.bones` da malha é **número de osso** no arquivo da skin (§7.4). A §2.8 manda traduzir **pelo nome** para o osso do corpo. Mas o osso do corpo (o braço, sem `skinRequired`) **não pode** estar no `bones[]` do arquivo da skin: a §2.8 o chama de *"erro de quem gravou"* (L2 `EXTERNAL_BONE_NOT_SKIN`). Sem ele no `bones[]`, o número não tem nome. **As duas regras brigam.**

| Leitor | Como resolveria hoje |
|:---|:---|
| Construct (o nosso `runtime/`) | igual ao editor: o que o `runtime/` fizer, o addon faz. Pelo `CHANGELOG`, hoje o editor grava os números do corpo, e o leitor pode errar o osso |
| Godot | igual, porque copia o Python |

**A frase que proponho para a §2.8**, na tabela *"Do arquivo da pele entra no corpo"*:

> | `bones[]` **sem** `skinRequired` cujo nome está em `rig.bones` | **âncora**: não entra no corpo e não gera aviso. Serve só para dar nome ao número de `binding.bones` (7.4). Gravador **DEVE** gravar como âncora todo osso do corpo que uma malha pesada da pele usa |

E a linha de hoje passa a dizer: *"`bones[]` e `constraints[]` sem `skinRequired`, **e fora de `rig.bones`**: ignorados, L2 `EXTERNAL_BONE_NOT_SKIN`."*

**Por que esta e não outra:** não cria campo novo (regra 7). A tradução pelo nome já existe (Apêndice C, 8). O `rig` já diz quais ossos são do corpo. Os dois leitores fazem a mesma coisa sem pensar.

**Precisa de um caso de conformidade novo**, escrito por quem não mexer no runtime (regra 26).

### 6.2 A ordem do jogo para a peça

A §7.11 diz quem escolhe a animação do filho (a chave, o nome do pai, o anexo). **O jogo não está na tabela.** A decisão do Humberto já responde (`02`, "Quem dá as ordens"): se o editor escolheu na faixa, quem recebe manda; se não, a peça é livre para o jogo.

**Frase proposta para a §7.11**, entre as linhas 1 e 2 da tabela:

> | 1b | A ordem do jogo (API de runtime, 12.2) | Zera quando o jogo dá a ordem. Vale só onde não há chave `nested/animation` |

### 6.3 O que não é defeito do formato, mas cada leitor tem de saber

| O quê | Godot | Construct |
|:---|:---|:---|
| Mistura `screen` | o Godot 2D não tem (Mix, Add, Sub, Mul, Premult). Cai para `normal` e avisa, como a §7.12 manda | **não li** a lista do Construct |
| Cor escura (tint black) | precisa de shader | precisa de efeito |
| Clipping | cortar os triângulos na conta (o Godot tem `clip_children`, mas só pelo desenho do pai) | cortar na conta: o `IRenderer` não tem máscara |
| "Este boneco" (rodada 11) | o nosso desenhador faz fácil: é só ordem de lista. **Um conversor não faria** | idem |

---

## 7. Perguntas para o Humberto

| # | A pergunta | A minha suposição |
|:---:|:---|:---|
| 1 | Começamos pelo **Construct**? | **Sim.** O leitor já está pronto; é o que ele usa |
| 2 | O jogo vai sair **no navegador** (web)? | **Talvez.** Por isso GDScript no Godot: não fecha a porta da web. C# fecharia |
| 3 | O addon do Construct mira o **r449** como mínimo, e é testado também na versão estável do dia? | **Sim.** O r449 deixa de ter suporte no fim de 2026; quem quiser a nova não pode ficar de fora |
| 4 | Qual **Godot** ele usa? | **4.7**, a estável de hoje. O GDScript da 4.x muda pouco |
| 5 | Pode a rodada 22 **adiantar** K1–K4 e G1–G4, antes da rodada 11? | **Sim.** Só a conexão (K5, G5) espera "Este boneco" |

---

## 8. O que não foi conferido

| | |
|:---|:---|
| A velocidade do GDScript com o herói | **não medi**: esta rodada não roda nada. G8 mede |
| Se a minificação avançada do Construct quebra o nosso código | **não achei**. K7 confere exportando |
| O `drawMesh` **no r449** | li a definição do r495 (do GitHub do Spine) e o trecho de busca do r441. Não li a página do r449 |
| Como o plugin do Spriter desenha no Construct | **não li**: o site travou |
| Por que o DragonBones usa C++ | o README diz que nasceu de um módulo C++. Não li o código |
