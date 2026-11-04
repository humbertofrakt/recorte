# Referência — arquivo e importar — 28/09/2026

Chat E (`EXECUTANDO · arquivo e importar`), às 23h50 (relógio da máquina).
Régua 1 da rodada final: referência primeiro, código depois.

---

## 1. Aseprite — o JSON da folha e as etiquetas

| Fonte | Link |
|:---|:---|
| Linha de comando (`--data`, `--format`, `--list-tags`) | https://www.aseprite.org/docs/cli/ |
| Etiquetas: as direções de tocar | https://www.aseprite.org/docs/tags/ |
| API: os quatro valores de direção | https://www.aseprite.org/api/anidir |
| API: a etiqueta, e o `repeats` | https://www.aseprite.org/api/tag |
| Código que ESCREVE o JSON (`frameTags`, `duration`, `repeat`) | https://github.com/aseprite/aseprite/blob/main/src/app/doc_exporter.cpp |
| Código que dá o TEXTO de cada direção | https://github.com/aseprite/aseprite/blob/main/src/doc/anidir.cpp |

### O que o JSON traz

| Campo | Onde | O que é |
|:---|:---|:---|
| `frames` | raiz | lista (`json-array`) ou objeto (`json-hash`, o padrão) |
| `duration` | cada quadro | milissegundos, **por quadro** — podem ser diferentes |
| `meta.frameTags` | `meta` | lista de etiquetas |
| `name`, `from`, `to` | cada etiqueta | `from` e `to` contam **do zero**, e as duas pontas entram |
| `direction` | cada etiqueta | texto: `forward`, `reverse`, `pingpong`, `pingpong_reverse` |
| `repeat` | cada etiqueta | **texto** com um número (`"3"`). Só aparece quando é maior que zero |

### As quatro direções

| Texto no JSON | Como toca (etiqueta de 0 a 3) |
|:---|:---|
| `forward` | 0 1 2 3, e recomeça |
| `reverse` | 3 2 1 0, e recomeça |
| `pingpong` | 0 1 2 3 2 1, e recomeça |
| `pingpong_reverse` | 3 2 1 0 1 2, e recomeça |

A página das etiquetas cita só três modos. A **API** e o **código** têm quatro:
o `pingpong_reverse` existe e é escrito no JSON.

**O `repeat`:** a API diz, sobre o zero, *"plays infinite in UI, once on export"*.
Ausente = sem número = repete sempre na tela do Aseprite.

**O vai-e-volta, pelo código que TOCA** (`src/doc/playback.cpp`,
https://github.com/aseprite/aseprite/blob/main/src/doc/playback.cpp):

| Achado | Linha do código, em resumo |
|:---|:---|
| a ponta **não se repete** na virada: 0 1 2 3 2 1 0 | vira o sentido quando chega no último quadro da etiqueta |
| no vai-e-volta, **cada sentido** gasta uma repetição | `decrementRepeat` é chamado a cada virada |
| `repeat` zero no vai-e-volta vale **2** — uma ida e uma volta | `repeat = 2` quando a direção é `PING_PONG` ou `PING_PONG_REVERSE` |

Bate com a API: *"for ping-pong it plays once in each direction"*. E bate
com a nossa spec 9.6 (`p = 2n − 2`), a mesma conta do Spine.

---

## 2. Como os três programas trazem imagem e folha

| Programa | Pasta de imagens | Folha de sprites | Onde fica o botão | Entra no desfazer? |
|:---|:---|:---|:---|:---|
| **Spriter** | a pasta do projeto É a paleta. A imagem fica na paleta e vira peça ao **arrastar** para a tela | **não importa folha**. Só lê a folha feita pelo TexturePacker no formato do Spriter, *"as though they are typical sub folders"* | paleta de arquivos, ao lado da tela | **não achei** |
| **Spine** | o nó `Images` da árvore aponta uma pasta; o Spine a **vigia** e recarrega sozinho. Arrastar a imagem para a tela cria slot e anexo | **não importa folha**. Quadro a quadro é a `Sequence` do anexo: imagens numeradas soltas (`nome_01`, `nome_02`) | nó `Images` → `Browse`; `Import Data` no menu principal | **não achei** |
| **DragonBones** | `File → Import Assets to Library`, ou arrastar para a biblioteca | não achei como folha de sprite; a biblioteca recebe imagens | biblioteca | **não achei** |

| Fonte | Link |
|:---|:---|
| Spine — imagens | https://esotericsoftware.com/spine-images |
| Spine — importar dados | https://esotericsoftware.com/spine-import |
| Spine — sequência no anexo | https://esotericsoftware.com/spine-regions |
| Spine — chave de sequência (modos, FPS) | https://esotericsoftware.com/spine-keys |
| Spriter — começar um projeto (a pasta) | https://www.brashmonkey.com/spriter_manual/starting%20a%20project.htm |
| Spriter — TexturePacker | https://www.brashmonkey.com/spriter_manual/texturepacker%20support.htm |
| Spriter — fórum: *"only supports importing a specific format of texturepacker created sprite sheets"* | https://brashmonkey.com/forum/index.php?/topic/4018-is-it-possible-to-import-a-spritesheet/ |
| DragonBones — o que importa | https://dragonbones.github.io/en/animation.html |

**Desfazer e importar:** procurei nos manuais dos três e no fórum do Spine.
**Não achei** nenhuma frase que diga se importar entra no desfazer. Não invento.

Nos manuais completos baixados em `documentos/pesquisa/nova pesquisa/` (00h10):

| Manual | O que diz do desfazer | Diz algo de importar? |
|:---|:---|:---|
| Spine User Guide (PDF, p. 14) | *"Nearly any action in Spine can be undone"* | não |
| DragonBones Pro (PDF) | a barra tem *"Undo, Redo, Import, Export"*, lado a lado; *"Undo is used to undo the last time edit operation"* | não |
| Spriter Pro 1.4 (PDF) | só o `Ctrl+Z` num exemplo de girar osso | não |

Um achado de passagem: o Spine tem o **Texture Unpacker**, que faz o caminho
contrário do empacotador — *"Any rotation in the atlas is undone and any
stripped whitespace is restored in the individual images"*. Ou seja: o Spine
não usa folha dentro do projeto; ele a **desmonta em imagens soltas**. O
Recorte usa a folha como página de atlas, sem desmontar.

---

## 3. Lote 1 — importar como passo de desfazer

### O que o código diz hoje (medido às 23h49)

| O encargo diz | O código diz |
|:---|:---|
| a pasta entra pelo `setImportedAtlas` solto | `setImportedAtlas` só é chamado **dentro** do `ImportPsd`, que já é comando |
| importar imagem não entra no desfazer | "Importar → Imagens…" **saiu** no lote 59. Palavra do Humberto: *"no Spriter não existe importar imagens"* (`documentos/planos/PLANO pasta do projeto 2026-09-10.md`) |
| — | a imagem solta vai para a **aba Imagens**, e não para o `.bone`. Vira peça ao arrastar para a cena — e esse arrasto (`DropImageAsSlot`) **já é** um passo de desfazer |

### O modelo que seguimos, e por quê

**Spriter e Spine:** a pasta de imagens é **disco**, não documento. A imagem
só entra no personagem quando alguém a arrasta. É exatamente o que o Recorte
faz desde o lote 59. **Ligar o `ImportImagesCommand` traria de volta o
"Importar imagens" que o Humberto tirou.** Não ligo sem ordem dele.

O `ImportImagesCommand` é **resto antigo**, não função sem porta. O texto do
vigia (`ui/command-audit.ts`, 21/09) ficou para trás do lote 59. Subido ao
Planejador às 23h49.

---

## 4. Lote 2 — a etiqueta vira animação

### O que o nosso formato já tem

| Spec | O que dá |
|:---|:---|
| 7.10 | o anexo com `sequence` — a folha já entra assim desde a v22.5 |
| 9.6 | a timeline `sequence`, chave `{mode, index, delay}`, sete modos |
| 4.6 | a animação tem `duration` e `loop` próprios |

### Duas formas de escrever, e a escolhida

| Forma | Como | Serve? |
|:---|:---|:---|
| A. Uma chave só (o modelo do Spine: modo + FPS) | `mode: loop`, `delay` | **não**: o modo anda pela sequência INTEIRA (0 a n−1). A etiqueta é um **trecho** (quadros 4 a 6). E o Aseprite deixa cada quadro com duração diferente; `delay` é um só |
| **B. Uma chave por quadro (o modelo do Spriter: uma chave a cada troca de imagem)** | `mode: hold`, `index` = o quadro, no tempo somado das durações | **sim**: trecho certo, duração de cada quadro certa, as quatro direções certas |

**Seguimos B.** Spriter primeiro (a casa). E é a única exata.

### A tradução

| Aseprite | Recorte |
|:---|:---|
| etiqueta `name` | animação de mesmo nome (repetido ganha `2`, `3`) |
| `from`…`to` | as chaves, na ordem da direção |
| `duration` de cada quadro (ms) | o tempo da chave seguinte (somado em ms inteiros, e só então dividido por 1000) |
| soma das durações da volta | `duration` da animação |
| `repeat` ausente | uma volta, `loop: true` — repete sempre, como na tela do Aseprite. Vai-e-volta: 0 1 2 3 2 1 |
| `repeat: "N"`, ida ou volta | o trecho escrito N vezes, `loop: false` |
| `repeat: "N"`, vai-e-volta | N **sentidos**, sem repetir a ponta: `"3"` dá 0 1 2 3 2 1 0 1 2 3. `loop: false` |
| etiqueta com `from`/`to` fora da folha, ou `from > to` | **não vira nada**, e o rodapé diz qual e por quê (regra 21) |
| direção desconhecida | **não vira nada**, e o rodapé diz (regra 21) — nunca um palpite de `forward` |

### O gesto

O mesmo de hoje: soltar `folha.png` + `folha.json` na janela. Sem botão novo.
O desenho E as animações entram como **UM** passo de desfazer: um `Ctrl+Z`
tira tudo.

**Quando a animação aberta é de outro corpo** (a virada, spec 9.13): o
desenho vai para a base desse corpo, e a animação não pode apontar para um
slot de outro arquivo. Aí as etiquetas **não viram animação**, e o rodapé diz.
