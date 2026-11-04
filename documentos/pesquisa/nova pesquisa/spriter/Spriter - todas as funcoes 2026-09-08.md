# Spriter Pro — todas as funções

Fontes, lidas em 08/09/2026:
- Manual oficial `brashmonkey.com/spriter_manual/index.htm`, versão 1.4, 37 capítulos
- Página de comparação Free × Pro, `brashmonkey.com/spriter-pro/`
- O PDF do manual está aqui na pasta: `Spriter Pro - manual oficial 1.4.pdf`
- Os prints estão em `prints/`, com o número do capítulo no nome

A **seção 5** é diferente das outras: não veio do texto do manual, veio de **olhar
dentro dos prints**, um a um. São os menus e diálogos como aparecem na tela.

Aviso: o site da BrashMonkey está com links de propaganda invadidos no rodapé.
Nada foi seguido. Só o manual em `/spriter_manual/` foi lido.

---

## 1. O que Spriter faz

Animação modular: o quadro não é um desenho inteiro, é montado com
imagens pequenas reaproveitadas — braço, cabeça, tronco. Cada peça pode
ser girada, escalada e trocada.
Arquivo: **`.scml`** (XML) ou **`.scon`** (JSON). Personagem salvo: **`.scms`**.

---

## 2. Free × Pro — a lista de funções do programa

| Função | Free | Pro |
|:---|:---:|:---:|
| Usar PNG ou spritesheet para animar | sim | sim |
| Animar por ossos ou movendo a imagem direto | sim | sim |
| Ponto de pivô por imagem | sim | sim |
| Escalar e girar qualquer objeto por quadro | sim | sim |
| Opacidade por quadro | sim | sim |
| Easing básico | sim | sim |
| **Curvas de easing avançadas** | não | sim |
| Várias "entities" (conjuntos de animação) por arquivo | sim | sim |
| **Onion skin** — ver quadros antes e depois | não | sim |
| IK básico | sim | sim |
| **IK completo e travamento de IK** (cinemática direta) | não | sim |
| Animação dentro de animação | sim | sim |
| **Controle automático da animação de dentro** | não | sim |
| **Character maps** — trocar conjuntos de imagem | não | sim |
| **Som na linha do tempo**, com prévia | não | sim |
| **Lip sync via Papagayo** | não | sim |
| Exportar como PNG, tira, folha ou GIF | sim | sim |
| **Marca d'água na exportação** | não | sim |
| Importar imagens em sequência como sprite animado | sim | sim |
| **Retângulos de colisão com nome, por quadro** | não | sim |
| **Action points com nome e ângulo, por quadro** | não | sim |
| **Guias horizontais e verticais na cena** | não | sim |
| **Travar ou esconder objeto** | não | sim |
| **Variáveis animadas** em qualquer ponto da linha do tempo | não | sim |
| **Triggers (eventos)** em qualquer ponto | não | sim |
| **Tags** para marcar mudança de estado | não | sim |
| **Juntar dois projetos Spriter num só** | não | sim |
| **Troca de paleta de cor** para imagem em cor indexada | não | sim |
| Aviso de atualização | sim | sim |
| Salvamento automático | sim | sim |

---

## 3. Os capítulos do manual, um a um

| # | Capítulo | O que ensina |
|:---:|:---|:---|
| 1 | What is Spriter | o método modular e por que ele economiza tempo |
| 2 | Quickstart | do zero à primeira animação, 12 passos |
| 3 | Starting a Project | `File / New Project` (Ctrl+N), escolher a pasta raiz. O `.scml` mora na pasta raiz; as imagens são procuradas a partir dele |
| 4 | Default Pivot Points | duplo clique na imagem no **file palette** abre o diálogo do pivô. Ícones de atalho põem o pivô em qualquer canto, centro ou meio de lado |
| 5 | Placing a Sprite | arrastar do file palette para a cena. Controles de transformação em volta. **Object properties**, canto inferior esquerdo, para digitar valor e opacidade |
| 6 | Adjusting Z-order | arrastar no **z-order palette** (canto superior esquerdo), ou Ctrl+setas. `Edit / Copy Z-order To All Keyframes` aplica em toda a animação |
| 7 | Creating and Assigning Bones | **Alt + arrastar** cria osso. O osso novo vira filho do osso selecionado. Segurar **B** + clicar num sprite prende o sprite ao osso |
| 8 | Animating Sprites and Bones | mover, girar, escalar, mudar alpha. Editar fora de um quadro-chave cria um quadro-chave. Botões **show** e **lock** para sprites e ossos |
| 9 | Copying Individual Attributes to All Frames | mudar um atributo (por exemplo o comprimento do antebraço) em todos os quadros de uma vez. Botão **reload images** no file palette |
| 10 | Swapping the Image of a Sprite | botão direito numa imagem do file palette troca a imagem do sprite selecionado, dali para frente |
| 11 | Editing Timing | arrastar quadro-chave; Ctrl para pegar vários. Clicar no número de tempo total muda a duração, com caixa "esticar as chaves". **Slider de velocidade de prévia** |
| 12 | Advanced Timeline Editing | cada objeto tem linha do tempo própria. Puxar o topo da janela da linha do tempo para cima mostra todas |
| 13 | Duplicating Entire Keyframes | Ctrl+Shift+C copia o quadro inteiro, mesmo entre chaves; Ctrl+V cola em outro ponto ou em outra animação |
| 14 | Adding Additional Sprites to Finished Animations | pôr o óculos no quadro 0, prender ao osso da cabeça, Ctrl+C, `Edit / Paste to all keys` (Ctrl+Shift+V) |
| 15 | Key All vs Key Selected | dois botões no alto da linha do tempo. **Key selected** só nos objetos escolhidos; **Key all** em tudo. Serve para "proteger" a pose |
| 16 | Adding Sound Effects | WAV na pasta do projeto. Clicar no som no file palette toca a prévia. Botão direito põe o som no ponto da linha do tempo |
| 17 | Papagayo Lip Sync | importar o arquivo do Papagayo e casar os fonemas com as imagens de boca |
| 18 | Collision Rectangles | trocar a **ferramenta ativa** no alto do palette para "create box", Alt+arrastar na cena. Cada retângulo ganha nome |
| 19 | Action Points | mesma ferramenta ativa, opção "create point". Alt+arrastar cria o ponto **e o ângulo**. Clique sem arrastar deixa o ângulo em zero |
| 20 | What are Character Maps | trocar peças para criar variações do personagem sem reanimar |
| 21 | Creating a Character Map | botão **CharMaps** no alto do palette de animações, depois "Create New Character Map". Coluna esquerda: a imagem a substituir; coluna direita: a substituta, com botão direito para atribuir |
| 22 | Activating and Stacking Character Maps | arrastar o nome do mapa da coluna "available" para a coluna "active". Vários mapas ao mesmo tempo, empilhados |
| 23 | Saving Character Map Stacks as Character Files | salvar a pilha ativa e a paleta escolhida num arquivo **`.scms`** |
| 24 | TexturePacker Support | dois caminhos de integração com o TexturePacker da CodeAndWeb |
| 25 | Clone with Texture Atlases | gerar uma cópia do projeto que usa atlas (`.json`) em vez de imagens soltas |
| 26 | Custom Trimming per Animation | ícone laranja de recorte, **Change Animation Export Box Size**. A área cortada fica magenta na cena. O recorte é salvo no arquivo |
| 27 | Custom Color Features | troca de paleta em imagens de cor indexada |
| 28 | Exporting as Images or GIFs | `File / Export Animation to PNG/GIF`. Escolhe FPS, escala, formato, recorte |
| 29 | Adding Variables | variáveis de jogo na linha do tempo. Numéricas podem interpolar entre chaves |
| 30 | Adding Tags | marcar estados ao longo da animação, vários ao mesmo tempo, por entidade, por animação, por milissegundo |
| 31 | Adding Event Triggers | disparar ação no motor do jogo num ponto exato |
| 32 | Scaled Clone of the Project | clonar o projeto inteiro, imagens e tudo, em outra escala |
| 33 | Color Customized Clone | clonar com as cores da paleta já "assadas" nas imagens |
| 34 | Batch Exporting from Character Files | exportar todas as variações `.scms` de uma vez, marcando a caixa "batch export" |
| 35 | Importing One Project Into Another | `File / Other File Actions / Import Another Project Into Current`, com três modos de junção |
| 36 | Mouse Controls and Shortcut Keys | ver a tabela abaixo |
| 37 | Acknowledgements | créditos |

---

## 4. Os painéis da tela

| Painel | Onde fica | Para quê |
|:---|:---|:---|
| **File palette** | direita, em cima | as pastas e imagens do projeto, e os sons. Duplo clique define o pivô. Botão **reload images** |
| **Animation palette** | direita, embaixo do file palette | lista de animações e entidades. Botão **CharMaps** |
| **Z-order palette** | esquerda, em cima | ordem de desenho, arrastando |
| **Hierarchy** | esquerda | a árvore de pais e filhos |
| **Object properties** | esquerda, embaixo | x, y, ângulo, escala, opacidade do objeto selecionado |
| **Canvas** | centro | a cena. Botões **show** e **lock** de sprites e ossos no alto à direita |
| **Timeline** | embaixo | linha do tempo. Botões **Key all** e **Key selected**. Slider de velocidade. Puxar para cima abre uma linha por objeto |

---

## 5. Os menus e os diálogos, item por item

Esta parte não está escrita no texto do manual. Foi **lida dentro dos prints**,
um por um. É o que aparece na tela do programa.

### 5.1 A barra de menu

**File · Edit · Window · View · Help**

### 5.2 Menu File — completo

| Item | Atalho |
|:---|:---|
| New Project… | Ctrl + N |
| Open Project… | Ctrl + O |
| Open Recent Project… ▸ | |
| Save Project | Ctrl + S |
| Save Project As… | |
| **Save New Version** | Ctrl + + |
| Save Project As Legacy | |
| Export To PNG… | |
| **Other File Actions… ▸** | |
| Exit | |
| **Load and Fix Corrupt File** | |

Submenu **Other File Actions**:

| Item |
|:---|
| Import Another Project Into Current |
| Batch Convert Between scml/scon |
| Custom Save Options… |
| Save As Resized Project (and images) |

Print: `35-juntar-projetos_269.jpg` · `03-comecar-projeto_207.jpg`

### 5.3 A ferramenta do Alt — três opções

Um seletor no alto do painel da direita decide o que o **Alt + arrastar** cria:

| Opção | Cria |
|:---|:---|
| **create bone** | osso |
| **create box** | retângulo de colisão |
| **create point** | action point |

No mesmo lugar: **Copy Default Pivots · Paste Default Pivots · Reload All Images**.
Print: `19-action-points_235.jpg`

### 5.4 Painel Character Maps — os quatro botões

| Botão | O que faz |
|:---|:---|
| **Create New Character Map** | cria um mapa novo |
| **Delete** | apaga o mapa escolhido |
| **Merge Active To New** | junta todos os mapas ativos num mapa novo |
| **Bake Active To Entity** | grava o resultado dos mapas ativos na própria entidade |

Duas colunas: **Available** (à direita) e **Active** (à esquerda). Arrastar de uma
para a outra liga o mapa.
Print: `21-criar-character-map_240.jpg` · `22-empilhar-character-maps_244.jpg`

### 5.5 Diálogo **Export Keyframes to PNG/GIF** — todos os campos

**source frames**

| Campo | O que é |
|:---|:---|
| batch export | exportar todos os `.scms` de uma vez |
| keyframes only | só os quadros-chave, não os interpolados |
| images | quantos quadros vão sair |
| interval | milissegundos entre quadros |
| fps | quadros por segundo (calculado) |
| choose scms files to batch export | escolhe os arquivos do lote |
| set animation intervals on export | grava o intervalo como padrão da animação |

**source rectangle** — o menu do recorte

| Opção | O que faz |
|:---|:---|
| trim rect to animation | ajusta ao tamanho da animação |
| set to animation preset | usa o recorte salvo daquela animação |
| custom rect… | recorte digitado à mão |
| trim rect to entity | ajusta à entidade inteira |
| trim rect to all entities | ajusta a todas as entidades |

**output file options**

| Opção | Saída |
|:---|:---|
| separate numbered image files | um PNG por quadro, numerado |
| sprite strip or sprite sheet | tira ou folha. Pede **horizontal frames** ou **vertical frames** |
| animated gif | um GIF animado |

Ainda: "0 extra (blank) frames on sprite sheet".

**output scale:** constrain proportions · width % · height %

**No pé:** Fill Background with Current Canvas Background (desmarcado = fundo
transparente) · **Watermark Output** · botão **Export** (ou **Batch Export**) · Cancel.
Prints: `28-exportar-png-gif_249.jpg` · `26-recorte-por-animacao_426.jpg` · `28-exportar-png-gif_248.jpg`

### 5.6 Diálogo **Edit MetaData** — variáveis e tags no mesmo lugar

| Parte | Campos |
|:---|:---|
| **Variáveis** | Find/Create Variable · botão **Create New Variable** |
| Tabela | active in key · name · current value · default value · **type** |
| **Tags** | Add Tag · caixa **Key Tags** |
| Duas colunas | **Active Tags** e **Available Tags** |
| Rodapé | current time |

Print: `30-tags_262.jpg` · `30-tags_263.jpg`

---

## 6. Mouse e teclado — a lista oficial completa

### Criar e selecionar

| Atalho | Função |
|:---|:---|
| **Alt + arrastar botão esquerdo** | criar e transformar osso, action point ou retângulo de colisão |
| **Segurar B** (com osso selecionado) | ligar ou desligar o sprite como filho do osso |
| **Segurar M + arrastar** | mover o ponto 0,0 da animação inteira |
| Clicar de novo num osso já selecionado | mostrar os controles de tamanho do osso |
| **Z** | selecionar todos os descendentes da seleção |
| **Shift + Z** | selecionar todos os ancestrais da seleção |

### Ver a cena

| Atalho | Função |
|:---|:---|
| Arrastar botão do meio, ou Espaço + arrastar | mover a vista |
| Roda do mouse | zoom normal |
| Ctrl + roda | zoom rápido |
| Ctrl + roda em painel | zoom no painel |
| Ctrl + Espaço · Ctrl + Alt + Espaço | zoom para dentro e para fora, sem roda |
| Ctrl + Alt + Shift + Espaço | voltar o zoom a 100% |

### Ordem de desenho

| Atalho | Função |
|:---|:---|
| Ctrl + Cima / Baixo | subir ou descer o sprite uma posição |
| Ctrl + Esquerda / Direita | mandar para o fundo ou para a frente de tudo |

### Copiar e apagar

| Atalho | Função |
|:---|:---|
| Ctrl + C | copiar o que está selecionado |
| **Ctrl + Shift + C** | copiar o quadro inteiro, mesmo entre chaves |
| **Ctrl + Shift + V** | colar em todos os quadros, mantendo o pai |
| Ctrl + D | copiar o objeto e colar em todos os quadros-chave |
| Shift + Delete | apagar o objeto de todos os quadros |
| **Segurar Ctrl ao arrastar, girar, escalar ou usar IK** | clonar, mantendo pai e ordem Z |
| Setas | empurrar 1 pixel |

### Andar na linha do tempo

| Atalho | Função |
|:---|:---|
| 1 · 2 | quadro-chave anterior · próximo |
| Shift + 1 · Shift + 2 | chave anterior · próxima **do objeto selecionado** |
| Ctrl + 1 · Ctrl + 2 | 1 milissegundo para trás · para frente, ou um passo de encaixe se o encaixe estiver ligado |
| 3 · 4 · 5 | voltar ao início · tocar · ir ao fim |

### Mostrar e travar

| Atalho | Função |
|:---|:---|
| 7 · 8 | mostrar ossos · travar ossos |
| 9 · 0 | mostrar sprites · travar sprites |
