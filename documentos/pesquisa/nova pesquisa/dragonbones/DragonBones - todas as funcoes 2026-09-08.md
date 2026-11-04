# DragonBones Pro — todas as funções

Fonte: manual oficial do DragonBones Pro, `docs.egret.com/dragonbones/en/docs/dbPro/`,
34 páginas, lidas em 08/09/2026.

**Aviso importante:** o site oficial da Egret **saiu do ar** (o servidor recusa conexão)
e `dragonbones.github.io` agora redireciona para outro domínio. O manual foi lido pela
cópia arquivada do **Internet Archive** (`web.archive.org`, captura de 2021–2022).
É o texto oficial, mas o programa está parado: última versão **5.6.2**, e o manual
descreve até a **4.5.0**. Vários trechos dizem "a versão atual ainda não suporta".

Os prints estão em `prints/`, com o caminho da seção no nome.

---

## 1. O que é

Editor de animação por ossos, feito pela equipe Egret. Grátis. Nasceu como
extensão do Flash Pro e virou programa próprio.
Formatos de saída: **DragonBones** (JSON ou XML), **MovieClip**, **sequência de quadros**.

---

## 2. Os conceitos (`basicConcept`)

| Conceito | O que é |
|:---|:---|
| **Framework** — esqueleto | um projeto pode ter **vários esqueletos**, cada um com sua pasta de imagens. A partir da 4.3. Passar o mouse sobre o filho mostra a prévia |
| **Skeleton** — osso | gira, escala e move. Dois modos de criar: ferramenta de osso arrastando na cena, ou botão no painel da árvore. **Liga a imagem sozinho** (4.3): o começo e o fim do osso têm de cair dentro da figura. Segurar **Ctrl** desliga a ligação automática e passa para ligação manual |
| **Slot** — encaixe | a ponte entre o osso e a imagem. Três modos de criar: arrastar do painel de recursos para a cena, arrastar para um osso da árvore, ou botão "adicionar slot" |
| **Image** — imagem | material do projeto, no painel de recursos. Precisa de um slot para grudar no osso |
| **Inherit** — herança | pai e filho: mover, escalar, girar. Cada um pode ser desligado |

**Regras do slot, do manual:**
- pode estar vazio, sem imagem
- um osso pode ter vários slots
- slots do mesmo osso podem ter camadas diferentes; a ordem é só a do painel de hierarquia
- **várias imagens em um slot, mas só uma aparece por vez** — as outras ficam escondidas
- apagar o slot apaga as imagens dentro dele
- nome de slot é único no projeto
- slot não aceita outro slot nem osso dentro
- se todas as imagens do slot estão escondidas, a posição, escala e rotação do slot ficam nulas

**Regras da imagem:** não pode ser renomeada · a mesma imagem pode entrar na cena
várias vezes · imagem em subpasta mostra o nome com a subpasta.
Dois modos de organizar: **conjunto de textura** (um arquivo com tudo) ou **arquivos soltos**.

---

## 3. A tela (`interface`)

| Parte | O que é |
|:---|:---|
| **Main scene** | a cena: montar o esqueleto e animar |
| **System toolbar** | as operações do projeto |
| **Main scene toolbar** | trocar o modo do mouse |
| **Mode toolbar** | trocar entre montar esqueleto e animar |
| **Inherit toolbar** | mostrar / selecionável / herdar, para osso e slot |
| **Outros painéis** | árvore da cena, hierarquia, transformação, animações, propriedades, recursos |
| **Timeline** | linha do tempo |

Print: `interface_mainInterface_p1.png`

### 3.1 Barra do sistema

Da esquerda para a direita: **Novo projeto · Abrir · Salvar · Desfazer · Refazer ·
Importar · Exportar · Prévia · Compartilhar**.
O botão salvar acende quando há mudança e apaga depois de salvar.
A prévia abre a animação no navegador; com várias animações, troca-se clicando.
Print: `interface_systemToolbar_p1.png`

### 3.2 Barra de modo

Só um controle: alternar entre **montagem do esqueleto** e **produção da animação**.
Print: `interface_modeToolbar_p1.png`

### 3.3 Barra mostrar / selecionável / herdar

| Chave | Ligada | Desligada |
|:---|:---|:---|
| **Display** | osso ou slot visível na cena | invisível |
| **Optional** | pode ser selecionado na cena | não pode |
| **Inheritance** | herda o movimento do pai | não herda |

Regra: no modo animação, **osso vem selecionável, slot não**. A herança vem ligada
e não é editável no modo animação.
Print: `interface_inheritToolbar_5576b6120294c.png`

### 3.4 Árvore da cena

Mostra e edita a relação pai-filho de ossos e slots.
Botões no canto superior direito: **criar osso-ponto · criar slot · renomear · apagar**.
Duplo clique renomeia (só no modo montagem). Arrastar muda o pai.
O pai não pode ser arrastado para dentro do próprio filho.
Print: `interface_sceneTreePanel_p1.png`

### 3.5 Transformação

x, y (relativos ao pai), escala, ângulo, e o tamanho da imagem (só para slot ou imagem).
Painel diferente para osso e para slot. Setas ↑↓ ajustam fino.
Aparece nos dois modos.

### 3.6 Propriedades

| Alvo | Propriedades |
|:---|:---|
| **Slot** | nome · imagem em exibição (lista com todas as do slot, ou "Empty") · cor sobreposta (branco = sem cor) · transparência (100% = opaco, 0% = invisível) |
| **Osso** | nome · comprimento (nenhum dos dois editável no modo animação) |
| **Quadro do osso** | nome (não editável) · **ação**: evento, jump e som |

Print: `interface_propertiesPanel_p1.png` · `_p2.png` · `_p3.png`

### 3.7 Hierarquia (camadas)

Ordem de cima e de baixo dos slots na cena. Arrastar, ou botões Up/Down, ou atalho.
**Só existe no modo montagem.**
Print: `interface_levelPanel_p1.png`

### 3.8 Recursos

Botões: **importar recurso · abrir a pasta da biblioteca · atualizar**.
A biblioteca de cada projeto é uma pasta de verdade no disco. Arrastar um PNG de fora
copia o arquivo para dentro dessa pasta. Só no modo montagem.
Print: `interface_resourcesPanel_p1.png`

### 3.9 Animações

Botões: **nova animação · clonar · renomear · apagar**.
Três valores: **tempo da animação** (não editável, calculado por quadros ÷ taxa) ·
**tempo de transição** entre animações no jogo · **número de repetições** (0 = infinito).
Só no modo animação.
Print: `interface_animationPanel_p1.png`

### 3.10 Linha do tempo — a parte mais detalhada do manual

**a) Controle de reprodução**, da esquerda para a direita:
voltar ao primeiro quadro · quadro anterior · tocar de trás para frente · tocar ·
próximo quadro · último quadro · **slider de velocidade (0,1× a 10×)** ·
quadro atual (editável) · tempo atual (calculado) · **taxa de quadros (padrão 24 fps)**.

**b) Barra de edição de quadro**, da esquerda para a direita:
**onion skin · copiar quadro · recortar quadro · colar quadro · apagar quadro**.
Regra do colar: quadro de osso e quadro de slot **não se colam entre si**.

**c) Barra da linha do tempo**, da esquerda para a direita:
recolher lista · expandir lista · empurrar quadro para a direita · para a esquerda ·
**chave automática** (branco = desligado, vermelho = ligado) · adicionar chave ·
**abrir o painel de curva**.

**d) Zoom da linha do tempo**: botão "caber na tela", − e +, e um slider.

**e) A linha do tempo em si** — as cores:

| Cor da chave | O que é |
|:---|:---|
| branca | camada de osso |
| amarela | camada de slot |
| vermelha | camada de evento |
| rosa | quadro de osso com evento, jump ou som |

A primeira faixa é a da animação inteira, não editável: um losango aparece nela quando
há chave em alguma camada abaixo. Selecionar o losango pega todas as chaves daquele quadro
— dá para mover, copiar, recortar, colar e apagar tudo junto.
Uma linha vermelha na régua marca onde há chave, e a régua nunca rola para fora da vista.
Prints: `interface_timelinePanel_p1.png` a `_p6.png`

### 3.11 Compartilhar

Envia o trabalho para a galeria da Egret. Pede login de conta do fórum Egret.
(Esse serviço provavelmente já não existe.)
Prints: `interface_sharePanel_p1.png` a `_p3.png`

### 3.12 Preferências — `File → Preferences`

| Grupo | Opção |
|:---|:---|
| **General** | confirmar antes de apagar (ligado) · imagem com suavização (ligado) · **osso liga a imagem sozinho** (ligado) |
| **Color / Size** | cor do fundo da cena · cor do osso · tamanho do quadriculado do fundo · tamanho do osso na tela |
| **Account** | login do fórum Egret |
| **Restore Defaults** | volta tudo ao padrão |

Print: `interface_firstChoice_56664a7fcc767.png`

---

## 4. Importar (`import`)

| De onde | Como |
|:---|:---|
| **Pasta** | escolhe o arquivo de dados (json, xml ou amf). Detecta sozinho se é conjunto de textura ou imagens soltas. Aceita **vários conjuntos de textura** desde a 4.3. Pode importar num projeto novo ou **somar ao projeto atual** |
| **PNG com dados juntos** | só para projeto novo |
| **PSD** | roda o script `PSExportDB.jsx` que vem com o programa. No Photoshop: `File → Scripts → Browse`. Opções: exportar PNGs · exportar JSON · ignorar camadas escondidas · escala geral. Depois importa o JSON gerado. **Posição, tamanho e camada saem iguais aos do PS** |
| **Zip** | só para projeto novo |
| **Cocos e Spine** | por plug-in, que já vem instalado. Aceita imagens soltas ou conjunto de textura |
| **Linha de comando** | desde a 4.3, para lote |

Comando de linha:
`DragonBonesPro import dbdata="..." texturefolder="..." textureatlas="..." texturedata="..." dbdatapack="..." plugin="auto" projectname="..." projectpath="..."`

Prints: `import_importFolder_*.png` · `import_importPNG_*.png` · `import_importPSD_*.png` · `import_importZip_*.png`

---

## 5. Exportar (`export`)

Três formatos: **DragonBones**, **MovieClip** e **sequência de quadros**.

| Opção | O que faz |
|:---|:---|
| Local de saída | padrão: "meus documentos" + nome do projeto |
| Textura | conjunto de textura (com prévia à direita) ou arquivos soltos |
| Formato de dados | **json** ou **xml** |
| Escala de saída | padrão 1. Limite de 4096×4096 por conjunto de textura |
| Cor de fundo | desligado por padrão |
| Zip | desligado por padrão; ligado empacota o projeto |
| Conteúdo (sequência) | todas as animações ou só a atual |

**Ajustes do conjunto de textura** (botão "set…"):
recorte da área transparente · potência de 2 · quadrado ·
cor de fundo · espaçamento horizontal · espaçamento vertical ·
**tamanho automático**, ou largura e altura máximas (que geram **vários conjuntos**,
com um arquivo de configuração para cada) · tamanho de saída, só de leitura.

---

## 6. Funções avançadas (`advancedFeatures`)

### 6.1 Onion skin — papel de cebola (4.1)

Botão na barra da linha do tempo. Mostra **N quadros antes e depois**, padrão 3.
Azul = quadros seguintes, vermelho = quadros anteriores.
Alças na linha do tempo: a vermelha à esquerda, a azul à direita — arrastar muda quantos
quadros aparecem. A área acompanha o cursor verde.
Durante a reprodução, as sombras tocam junto: a azul adiantada, a vermelha atrasada.
Prints: `advancedFeatures_yangCongPi_p1.png` a `_p3.png`

### 6.2 Editor de curva (4.1)

Selecionar uma chave com tween e clicar no botão de curva na linha do tempo.
Alças em cima e embaixo para desenhar à mão.
**Predefinições:** nenhuma · linear · entrar suave · sair suave · entrar e sair suave.
Eixo Y: de −100% a 200%.
Vale para: rotação, movimento e escala de osso; cor e transparência de slot.
Só no modo animação. Fica em branco se: a chave está travada, é a última da camada,
é chave de evento, ou nada está selecionado.
Prints: `advancedFeatures_curveEditor_p1.png` a `_p6.png`

### 6.3 IK — cinemática inversa (4.5.0)

Dois botões no painel de propriedades com o osso selecionado:
- **criar alvo na ponta** — cria o osso-alvo sozinho e amarra
- **escolher alvo à mão**

Propriedades: **Name · Bone · Target · Bending** (direção da dobra) · **IK weights**.

**Regras, do manual:**
- osso com IK aparece com o contorno vermelho; o osso-alvo aparece todo vermelho
- vale para **um osso**, ou **dois ossos pai e filho seguidos**
- **três ou mais ossos não podem**, nem pai e filho separados, nem ossos sem parentesco
- filho direto ou indireto do osso escolhido não pode ser o alvo
- osso com herança "invertida" desligada não aceita IK, e vice-versa
- mudar a dobra e o peso do IK **durante a animação ainda não é suportado**

Prints: `advancedFeatures_IK_*.png`

### 6.4 Grid — malha (4.5.0)

Botão **"Convert to Grid"** no painel de propriedades do slot ou da imagem.
Depois: **edit grid · reset grid · convert to image**.

Ferramentas do editor de malha, da esquerda para a direita:

| Ferramenta | Atalho | O que faz |
|:---|:---:|:---|
| número de vértices | — | mostra a contagem |
| **Edit** | Q | mover vértice |
| **Add** | W | somar vértice |
| **Delete** | E | apagar vértice |
| **Edge** | — | desenhar as arestas. **Apaga os vértices e arestas antigos** |
| **Reset** | — | volta aos 4 vértices dos cantos |

Ligações automáticas saem cinza; ligações desenhadas à mão saem amarelas.

**Regras:** a imagem esticada não passa de 2048×2048 · a borda tem de fechar (fecha
sozinha se não for desenhada) · o centro de rotação continua o da imagem original ·
**esta versão não liga vértice a osso por peso dentro do grid** ·
no modo animação a malha ganha camada própria na linha do tempo, e mover vértice cria chave.
Prints: `advancedFeatures_grid_*.png`

### 6.5 Skin weights — pesos

Primeiro converter a imagem em malha. Depois marcar **"Open Edit"** no painel
(ou escolher a ferramenta de peso, que abre a edição sozinha).

1. Botão **"Bind Bone"**, depois clicar nos ossos. Cada osso ganha uma cor.
2. Botão direito no vazio: calcula o peso sozinho pela distância.
3. Somou um osso depois? Botão **"auto weight"** recalcula.
4. Selecionar **um vértice** mostra a proporção de cada osso, com sliders.

**Ferramenta de peso:** mostra o peso de cada vértice como **gráfico de pizza**, nas cores
dos ossos. Escolher um osso, escolher um vértice, segurar o botão esquerdo e arrastar
para cima ou para baixo muda o peso daquele osso naquele vértice.
Prints: `advancedFeatures_skinWeights_*.png`

---

## 7. Atalhos — a tabela oficial

| Função | Atalho | Segundo atalho |
|:---|:---|:---|
| Desfazer | Ctrl + Z | |
| Refazer | Ctrl + Y | Ctrl + Shift + Z |
| Apagar osso, slot, imagem ou chave | Delete | Backspace |
| Ferramenta de seleção | **V** | |
| Ferramenta de pose | **P** | |
| Ferramenta de mover | **H** | |
| Ferramenta de criar osso | **N** | |
| Subir o slot uma camada | **[** | |
| Descer o slot uma camada | **]** | |
| Novo projeto | Ctrl + N | |
| Abrir projeto | Ctrl + O | |
| Salvar projeto | Ctrl + S | |
| Importar | Ctrl + I | |
| Exportar | Ctrl + E | |
| Tocar a animação | **Enter** | |
| Prévia no navegador | Ctrl + Enter | |
| Pôr ou atualizar chave | **K** | |
| Copiar chave | Ctrl + C | |
| Colar chave | Ctrl + V | |
| Mover o cursor da linha do tempo | ← → | |

---

## 8. Plug-ins

`Help → Plugin Management`. Botões: **abrir a pasta de plug-ins · instalar · desinstalar**.
Cada plug-in liga e desliga na lista.
Já vêm instalados: importador de **Cocos 1.x** e de **Spine 2.x**.

**Formato do plug-in:** arquivo `.expl`, que é um zip com pelo menos três arquivos —
`*.excfg` (configuração em JSON: name, path, description, author, version, icon),
`*.png` (ícone 32×32) e `*.js` (o script; o importador herda a classe `DBImportTemplate`
de `egretPluginSdk.js`).
Prints: `plugin_pluginManager_*.png`
