# SEQUÊNCIA — exportar e entregar — 28/09/2026

Escrito pelo chat N, `USO · exportar e entregar`. Não escreve código.

Este documento tem duas partes:

| Parte | O quê | Estado |
|:---:|:---|:---:|
| 1 | **A referência**: a fila de passos do Spriter e do Spine, com link | pronta |
| 2 | **A sequência no nosso programa**: a mesma fila, com foto e as quatro perguntas | pronta (abaixo) |

---

# PARTE 1 — A REFERÊNCIA

Só está aqui o que a página diz. Onde a página não diz: **"não achei"**.

## 1.1 Spriter (BrashMonkey) — o manual oficial, versão 1.4

Índice: <http://www.brashmonkey.com/spriter_manual/index.htm>
(o manual também sai em PDF: <https://brashmonkey.com/spriter_manual/Spriter_Manual.pdf>)

### A fila: exportar como sequência de PNG (e GIF)

Fonte: <http://www.brashmonkey.com/spriter_manual/exporting%20animations%20as%20images%20or%20gifs.htm>
(o título da página diz "Sequential Images or GIFs"; o passo a passo do corpo da página fala só de PNG — veja "não achei" abaixo)

| Passo | O que o manual manda |
|:---:|:---|
| 1 | Animação pronta e **selecionada na Paleta de Animações** |
| 2 | Menu **File → Export To PNG** (na página de lote: **File → Export Animation to PNG/GIF**) |
| 3 | Abre um **seletor de arquivo**: escolher a pasta e digitar o **nome** das imagens; Enter ou Save |
| 4 | Abre o diálogo **Export Keyframes To PNG** |
| 4a | **Quadros**: só as chaves · ou N quadros por segundo · ou o total de quadros da animação inteira · ou uma imagem a cada N milissegundos |
| 4b | **Recorte (trim)**: o padrão não corta nada. Para controlar, clicar no retângulo cinza **"trim rect to animation"**: aparecem as coordenadas exatas |
| 4c | **Escala**: padrão 100 % (tamanho real) |
| 5 | **OK**: a exportação começa, na pasta escolhida |
| 6 | Caixa **"batch export"** (canto superior esquerdo do diálogo): exporta várias animações de uma vez, com as mesmas configurações e o mesmo recorte |

### A fila: a área de recorte (a caixa de exportação)

Fonte: <https://www.brashmonkey.com/spriter_manual/creating%20custom%20trimming%20settings%20for%20each%20animation.htm>

| Passo | O que o manual manda |
|:---:|:---|
| 1 | Selecionar a animação e clicar no ícone **"Change Animation Export Box Size"** |
| 2 | Arrastar as bordas do **retângulo cinza** na cena. As teclas **1** e **2** andam pelas chaves, para ver se nada é cortado |
| 3 | Ou digitar os números no diálogo |
| 4 | Escolher o alcance: **só esta animação · todas da Entity · todas as entities** |
| 5 | **Apply** (canto inferior direito) |
| 6 | **Salvar o arquivo do Spriter**, para o recorte ficar guardado |
| 7 | Ao exportar, no diálogo **Export Keyframes to PNG/GIF**, mudar **"source rectangle"** para **"set to animation preset"** |

### A fila: lote

Fonte: <https://brashmonkey.com/spriter_manual/batch%20exporting%20animations%20from%20character%20files.htm>

| Passo | O que o manual manda |
|:---:|:---|
| 1 | Pôr todos os arquivos de personagem (`.scms`) numa pasta |
| 2 | **File → Export Animation to PNG/GIF** |
| 3 | Marcar **batch export**, na seção "source frames" |
| 4 | Ajustar recorte, FPS, escala e formato |
| 5 | **Choose scms files to batch export**: escolher os arquivos |
| 6 | Botão **Batch Export**, escolher pasta e nome base, Save |
| 7 | Conferir a pasta |

### A fila: folha de sprites (atlas) — outra coisa

Fonte: <http://www.brashmonkey.com/spriter_manual/creating%20a%20clone%20of%20your%20project%20that%20uses%20texture%20atlases.htm>

Atenção: no Spriter isto **não** é a folha de quadros da animação. É a folha das **imagens do projeto** (atlas de textura).

| Passo | O que o manual manda |
|:---:|:---|
| 1 | Menu **File → Generate spritesheets for project images** |
| 2 | Escolher pasta e prefixo do nome |
| 3 | Diálogo **pack images**: marcar **"save spritesheeted project"** se quiser também o projeto clonado que usa os atlas |
| 4 | Agrupamento: um atlas · vários atlas conforme precisar · um por pasta · um por pasta mais extras |
| 5 | Tamanho máximo do atlas (padrão 1024 px); o OK só liga se tudo couber |
| 6 | "heuristic rules": uma opção mais rápida, se demorar |
| 7 | OK. Saem as imagens do atlas, os `.json` com as posições, e (opcional) o projeto clonado |

### Spriter — o que **não achei**

| Item | Estado |
|:---|:---|
| GIF: as opções do GIF (cores, laço, atraso) | **não achei**. A página cita GIF no título e no menu, mas o texto só descreve PNG |
| Folha de **quadros** da animação (uma imagem só com todos os quadros) | **não achei** no manual. Uma discussão em fórum (<https://devforums.toucharcade.com/threads/spriter-the-2d-modular-game-animation-tool.229596>) diz que sai sequência, tira ou folha; **não é o manual**, não vale como fonte do passo |
| Vídeo | **não achei** |
| **Repetir a última exportação** | **não achei** |
| Salvar como **binário** | **não achei**. O manual só fala de `.scms` (personagem) e `.json` (atlas) |
| Entregar um corpo / entregar por peça | **não achei** (o mais perto: "Saving Character Map Stacks as Character Files", página 23 do índice — não li) |

## 1.2 Spine (Esoteric Software) — o guia do usuário, página Export

Página: <https://esotericsoftware.com/spine-export> (a mesma em texto: <https://esotericsoftware.com/spine-export.md>)
Empacotar as imagens: <https://esotericsoftware.com/spine-texture-packer>

### A fila: abrir e repetir

| Passo | O que o guia manda |
|:---:|:---|
| 1 | Menu **Export**, ou `Ctrl+E`: abre o diálogo de exportação |
| 2 | Escolher o tipo: **dados** (JSON, Binary) · **imagens** (GIF, PNG, APNG, PSD, JPEG) · **vídeo** (AVI, MOV) |
| 3 | Ajustar as opções (abaixo) |
| 4 | Exportar |
| 5 | **Repetir a última exportação: `Ctrl+Shift+E`** (`Cmd+Shift+E` no Mac) |
| 6 | **Save** e **Load** (canto inferior esquerdo do diálogo): guarda as opções num arquivo JSON e traz de volta |

### As opções comuns de imagem e vídeo, na ordem em que a página as lista

| # | Opção | O que faz |
|:---:|:---|:---|
| 1 | **Defaults** | volta tudo ao padrão |
| 2 | **Preview** | abre o painel de prévia |
| 3 | **Export type** | animações, ou só a pose atual |
| 4 | **Skeletons** | todos juntos · separados · só o escolhido |
| 5 | **Animations** | a atual · todas · a escolhida |
| 6 | **Skins** | as visíveis · todas · todas mais o esqueleto sem pele |
| 7 | **Output type** | um arquivo · um por quadro · um por animação · um com camadas · um com um quadro |
| 8 | **Output file / folder / prefix** | onde gravar e como começa o nome |
| 9 | **Maximum bounds** | todos os arquivos com o mesmo tamanho |
| 10 | **Animation repeat**, **Pause after** | quantas vezes toca; pausa depois de cada uma |
| 11 | **Bones / Images / Others** | o que entra no desenho |
| 12 | **Smoothing**, **Multisample AA** | suavização de 0 a 11; antisserrilhado |
| 13 | **Crop** | exporta a área escolhida, não a do esqueleto. Quatro números: X, Y, largura, altura. Os cantos laranja se arrastam na prévia |
| 14 | **Size** (Scale · Fit · Enlarge · Pad) | tamanho da saída |
| 15 | **Range** | só uma faixa de quadros |
| 16 | **Warm Up** | toca N vezes antes, para a física andar |

### O painel de prévia

Quadro a quadro, com o controle deslizante · caixa branca = a área que sai · cantos laranja arrastáveis quando **Crop** está marcado · mostra o tamanho em pixels e o **tamanho estimado do arquivo**.

### As saídas, uma por uma

| Saída | Página | O que o guia diz |
|:---|:---|:---|
| **PNG** (sequência) | <https://esotericsoftware.com/spine-export#PNG> | sem perda, com transparência. Opções: **Background**, **Compression**, **FPS**, **Include last frame** (desmarcar em laço, para o primeiro e o último quadro iguais não saírem duas vezes), **Pack** |
| **Pack** (a "folha") | <https://esotericsoftware.com/spine-texture-packer#Packing> | marcado, as imagens exportadas saem **empacotadas num atlas de textura** |
| **GIF** | <https://esotericsoftware.com/spine-export#GIF> | 256 cores; sem translucidez (pixel opaco ou transparente); tem FPS e "Include last frame". O guia sugere FPS 50 |
| **APNG** | <https://esotericsoftware.com/spine-export#APNG> | animado, sem perda, melhor que o GIF |
| **AVI / MOV** (vídeo) | <https://esotericsoftware.com/spine-export#Video> | vários codecs; transparência opcional |
| **JSON** (dados) | <https://esotericsoftware.com/spine-export#JSON> | Output folder · Extension · Format · Pretty print · Version · Nonessential data · Animation clean up · Export all · Warnings · **Pack** |
| **Binary** (dados) | <https://esotericsoftware.com/spine-export#Binary> | menor e mais rápido de ler; não se lê a olho. Output folder · Extension · Nonessential data · Animation clean up · Warnings · **Pack** |

Com **Pack** marcado nos dados, saem **três coisas**: o arquivo do esqueleto (`.json` ou `.skel.bytes`), o `.atlas.txt`, e um ou mais `.png` (as páginas do atlas).

Os dados saem **um arquivo por esqueleto**. O guia diz que não é possível exportar só um esqueleto, parte dele, nem animações soltas.

**Desligar da exportação:** cada esqueleto, animação, anexo e pele tem a caixa **Export**; desmarcada, fica de fora (serve para um fundo ou uma referência).

### Spine — o que **não achei**

| Item | Estado |
|:---|:---|
| "Salvar como pacote" (um arquivo único com tudo) | **não achei** na página Export. O mais perto é **Pack** (atlas + dados, três arquivos) |
| "Entregar um corpo" | **não achei**. O guia diz que os dados saem um por esqueleto |

## 1.3 Onde os dois concordam — o que o nosso deve poder fazer

| # | Tarefa | Spriter | Spine |
|:---:|:---|:---:|:---:|
| 1 | Sequência de PNG, por quadro | sim | sim |
| 2 | Pasta e nome escolhidos antes de exportar | sim | sim |
| 3 | Quadros por segundo à escolha | sim | sim |
| 4 | Escala da saída | sim | sim |
| 5 | **Área de recorte, à vista na cena, arrastável, com números** | sim | sim |
| 6 | Todas as animações de uma vez | sim (batch) | sim (Animations: all) |
| 7 | GIF | sim (opções: não achei) | sim |
| 8 | Folha (atlas) | sim (das imagens) | sim (Pack) |
| 9 | Vídeo | não achei | sim |
| 10 | Dados binários | não achei | sim |
| 11 | **Repetir a última exportação** | não achei | sim, `Ctrl+Shift+E` |
| 12 | Guardar as opções de exportação | não achei | sim, Save / Load |
| 13 | **Prévia do que vai sair** (com tamanho estimado) | não achei | sim |

**O modelo a seguir** (regra da casa: fluxo do Spriter, ferramentas do Spine encaixadas nele): um caminho só, **Arquivo → Exportar…** → um diálogo → a pasta e o nome → as opções → OK → **o programa diz onde gravou e quantos arquivos**. E o Spine nos dá o resto: prévia com a área de recorte à vista, repetir a última, guardar as opções.

---

# PARTE 2 — A SEQUÊNCIA NO NOSSO PROGRAMA

**Programa usado:** o `programa/` montado (v22.8, de 22/09), pela porta **5314** (`PORTA=5314 node programa/servidor.mjs --sem-navegador`), por ordem do Planejador. As fotos são todas da 5314. Herói de exemplo aberto por **Arquivo → Abrir o herói (exemplo)**. Janela do navegador em 1440×900.
**Como conferi o que saiu:** o navegador só baixa; um receptor local (`scratchpad/receptor.mjs`) recebeu cada arquivo baixado e o gravou em `saidas/`. Depois abri cada um com Pillow, zip e o `<video>` do navegador.
**Fotos:** `backup/fotos-rodada-final/uso-exportar/` (`NN_nome_5314.jpg`). **Saídas:** `.../uso-exportar/saidas/`.

*(Notas de trabalho — a tabela final das quatro perguntas vem no fim, quando a fila terminar.)*

| Foto | Passo | O que vi |
|:---:|:---|:---|
| 01 | Abrir o herói | Cartão de boas-vindas → "Abrir o herói": entrou. Título da janela: `heroi-DUlefYnW.bone` (o nome ganhou um sufixo estranho) |
| 02, 02a | Menu **Arquivo** | O primeiro clique só realça a palavra; a lista abriu só no clique seguinte. A lista é comprida e **rola**: em 1440×900 a parte de baixo (Exportar…) fica escondida |
| 03 | Rolar o menu | Depois de rolar: **Importar ▸ · Exportar ▸ · Repetir a última exportação (Ctrl+Shift+E) · Configurações do projeto… · Sair** |
| 04 | **Exportar ▸** | Três itens: **glTF…** · **Imagem…** · **Por pele…**. Não diz "PNG", "GIF", "folha", "vídeo" |
| 05, 05a | **Imagem…** | Um diálogo "Exportar imagem" com: Animação · Todas as animações · De/Até (s) · Formato (**GIF animado · Sequência de imagens PNG · Folha de sprites com índice JSON · Vídeo WebM**) · Quadros por segundo · Escala · Fundo transparente · Cor do fundo · Recorte · Cortar a borda vazia · Desenhar os ossos · (opções que mudam com o formato) · Andamento. Texto de cima: "Vídeo sai em WebM; MP4 não sai daqui" |
| 06 | Exportar o **GIF** | Aviso do que aconteceu: animação, trecho, 60 quadros a 30/s, 114×242, nome do arquivo. Barra de baixo: "GIF animado: 60 quadros de 114×242, 534.284 bytes" |
| 07 | Abrir o GIF | **Abre.** 114×242, 60 quadros, laço infinito, fundo transparente, é o herói |
| 08, 08a | Exportar **PNG** | Barra de andamento com texto ("Gravando os PNG: 22 de 60"). Aviso: **"60 arquivo(s) gravado(s)"** e lista os 60 nomes — mas o que saiu foi **1 arquivo .zip** (o marcador "Um arquivo só (.zip)" vem ligado). O aviso **não diz o nome do .zip** |
| 09 | Exportar **folha** | Sai `.png` + `.json`. **Abre**: 912×1936 (8×8 quadros de 114×242); o JSON traz 60 quadros com x, y, largura, altura, tempo |
| 10 | Exportar **WebM** | **Abre** (VP9, 114×242). 1ª vez: **0,73 s** em vez de 2 s. Repetida: 1,97 s. O diálogo avisa que "o tempo é o do relógio do navegador" |
| — | **Ctrl+Shift+E** (repetir) | Funcionou: repetiu o WebM sem abrir o diálogo. Só disse "Repetindo a exportação de imagem…" na barra de baixo, e depois o resumo dela. **Nenhum aviso de que arquivo saiu, nem onde** |
| — | Abrir o diálogo de novo | Volta sempre em **GIF animado**: não guarda o formato da vez passada |
| 11 | Área de recorte | Ver "A área de desenho" no fim: não há retângulo na cena; o diálogo só oferece dois modos de **Recorte** (borda vazia automática · área desenhada nesta animação) e o segundo diz que a animação "não tem área desenhada" |
| 12 | **Todas as animações** | Saem 3 GIFs (`-idle`, `-walk`, `-attack`): 60 + 30 + 18 = 108 quadros, como o aviso diz. **Mas** o aviso dá o mesmo tamanho para os três; os arquivos têm 114×242, 156×242 e 295×281 |
| 13 | **Salvar como binário…** | Barra de baixo: *"Salvo em heroi-….boneb. 17.900 bytes, 63,1% menor que o .bone."* **Abre**: reli com o conversor da casa: 18 ossos, 3 animações |
| 14 | **Salvar como pacote…** | Barra de baixo: *"Salvo em heroi-….bonez. 3 arquivos dentro, 35.924 bytes."* **Abre**: `.bone` + atlas + PNG 256×256; o conversor validou "ida e volta: igual" |
| 15 | **Entregar um corpo…** | Janela "Corpo entregue": *"Saiu heroi-….bone, sozinho. Não havia imagem da pasta para fatiar: o atlas que ele já citava vale."* Grava o `.bone` (48 KB) |
| 16 | Animação → **Exportar animação…** | Janela: as 3 animações marcadas, o que o arquivo exige de quem o usar (14 ossos, 4 slots, 197 chaves, 30 KB). Grava `animacoes-animacoes.bone`, que abre: 3 animações |
| 17 | Arquivo → Exportar ▸ **glTF…** | Janela "glTF exportado": arquivo `.glb` de 77 KB e uma lista do que o glTF não tem (constraints, máscaras, sequências…). **Abre**: 37 nós, 3 animações |
| 18 | Arquivo → Exportar ▸ **Por pele…** | Janela com peles, animações e a tabela "agora / arquivo inteiro"; sai `.bonez` de 35 KB. Aviso: "Arquivo fatiado. Nada saiu: ele já era só isto" |

**Tudo o que mexe com arquivo foi feito sem janela do Windows, com o seletor de arquivo trocado** (o navegador só recebe o arquivo; um receptor local o grava). **O que o seletor de verdade do Windows faz fica SEM prova.**

## As quatro perguntas, passo a passo

Legenda: **sim** · **não** · **em parte**. "n/a" = a pergunta não se aplica ao passo.

| # | Passo | 1. Achei a ferramenta sem procurar? | 2. O que criei apareceu na tela? | 3. O programa disse o que aconteceu? | 4. Ficou óbvio o passo seguinte? |
|:---:|:---|:---|:---|:---|:---|
| 1 | Abrir a animação pronta (herói) | **sim**: cartão de boas-vindas → "Abrir o herói" | **sim** | **sim**: "Abriu a base. Arquivo salvo." | **não**: nada diz "agora exporte"; a barra de cima não tem Exportar |
| 2 | Achar **Exportar** | **não se acha**: fica no fim de uma lista comprida que rola (foto 03); a barra de cima não tem botão. Só achei pela lista | n/a | n/a | **sim**: o diálogo abre e guia |
| 3 | Escolher **o quê** (glTF · Imagem · Por pele) | **em parte**: "Imagem…" esconde GIF, PNG, folha e vídeo | n/a | n/a | **em parte**: o nome do item não diz que ali se escolhe o formato |
| 4 | Escolher animação, trecho, formato, quadros/s, escala | **sim**: tudo num diálogo só | **em parte**: nenhuma prévia; só "Nada foi desenhado ainda" | **sim**: o texto do topo diz "Vídeo sai em WebM; MP4 não sai daqui" | **sim**: botão **Exportar** no fim |
| 5 | Exportar **GIF** | **sim** (vem marcado) | **sim**: aviso e arquivo `.gif` (abriu: 60 quadros, transparente) | **em parte**: diz animação, trecho, quadros, tamanho, nome; **não diz onde** gravou | **em parte**: fecha e fica no editor, sem dizer o que fazer com o arquivo |
| 6 | Exportar **sequência de PNG** | **sim**: 2ª opção do formato | **em parte**: saiu **1 .zip**; o aviso diz "60 arquivos" | **não**: diz 60 arquivos e não cita o .zip | **em parte** |
| 7 | Exportar **folha de sprites** | **sim**: 3ª opção, com o "índice em JSON" no nome | **sim**: `.png` + `.json`, abriram (912×1936, 8×8) | **em parte**: cita os dois arquivos; não diz onde | **em parte** |
| 8 | Exportar **vídeo** | **sim**: 4ª opção | **sim**: `.webm` abriu; **1ª vez com 0,73 s em vez de 2 s** | **em parte**: avisa que o tempo é do relógio do navegador; não avisa que saiu curto | **em parte** |
| 9 | Escolher a **área de recorte** | **não se acha**: nem na cena, nem no diálogo | **não**: nada aparece na cena | **em parte**: diz que "idle não tem área desenhada", sem dizer como criar | **não**: a sequência **quebra aqui** |
| 10 | **Todas as animações** de uma vez | **sim**: caixa no diálogo | **sim**: 3 GIFs | **não**: o aviso dá o mesmo tamanho para os três, e é errado | **em parte** |
| 11 | **Repetir a última exportação** | **em parte**: só no fim do menu Arquivo, com o atalho `Ctrl+Shift+E` ao lado | **sim**: gerou o arquivo | **não**: só "Repetindo a exportação de imagem…" na barra, sem aviso de arquivo. Depois de "Por pele…" **reabre o diálogo** em vez de repetir | **em parte** |
| 12 | **Salvar como binário** | **em parte**: item do menu Arquivo, sem botão | **sim**: `.boneb` abriu (18 ossos, 3 animações) | **sim**: "17.900 bytes, 63,1% menor que o .bone" | **em parte** |
| 13 | **Salvar como pacote** | **em parte**: idem | **sim**: `.bonez` abriu e validou | **sim**: "3 arquivos dentro, 35.924 bytes" | **em parte** |
| 14 | **Entregar um corpo** | **não se acha**: o nome não diz nada a quem não conhece o jargão | **sim**: `.bone` de 48 KB | **em parte**: diz "Saiu … sozinho… fatiar… atlas": jargão | **não**: não diz para quê entregar, nem o que fazer depois |
| 15 | Conferir que o arquivo **abre** | n/a | **sim**: todos abriram (fora o WebM curto) | n/a | n/a |

**Resumo em uma linha:** as saídas funcionam e são o que se pediu. O que falta é **a panela**: Exportar não se acha e não diz o que faz, a área de recorte não existe à vista, e os avisos ora calam (onde gravou, o .zip), ora erram (o tamanho de cada quadro).

**Programa e ambiente:** `programa/` v22.8 (22/09), porta 5314, navegador do aplicativo em 1440×900, sem janela do Windows. Fotos 01–19 em `backup/fotos-rodada-final/uso-exportar/`. Saídas em `.../saidas/`.
