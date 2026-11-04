# 03 — DragonBones Pro e Live2D Cubism Editor

Pesquisa de interface. 08/09/2026.

## O que dá para aprender com estes dois

1. DragonBones separa a tela em **dois modos**; Live2D em **três espaços de trabalho**.
2. Live2D tem **campo de zoom com número, slider de 2% a 3200% e botões [−] [+]** na tela.
3. DragonBones **não tem botão de loop** na barra: repetir é um número no painel do clipe.
4. Live2D troca "chaves de osso" por **parâmetros com slider** — o painel de parâmetros é o coração.
5. Live2D deixa o usuário **remapear todos os atalhos** por uma janela própria.

---

# PARTE A — DragonBones Pro

Editor livre, feito pela equipe Egret. Versão de referência: 5.6.

> Aviso: o site oficial `docs.egret.com` **recusou conexão** durante esta
> pesquisa. Os dados abaixo vêm de tutoriais, do blog oficial e de resumos de
> busca das páginas oficiais. Onde não deu para confirmar, está escrito
> "não confirmado".

## A1. Barra de menus

Confirmação parcial. Só alguns itens apareceram nas fontes.

|      Menu       |            Itens confirmados             |
|:---------------:|:----------------------------------------:|
|      File       | New, Open, Save, Close, Import Data, Export, Preview, Publish, Preference, Exit |
|      Edit       |    Undo, Redo, Cut, Copy, Paste, Delete   |
|      View       |          Rulers (réguas)                 |
|     Window      |            Reset Panel                    |
|      Help       |            não confirmado                 |

`File > Preference` é onde ficam as opções gerais (atalho F12).
`Window > Reset Panel` devolve o layout de painéis ao padrão.

A lista completa de itens de cada menu **não foi confirmada**.

## A2. Layout da tela

O programa tem **dois modos**, trocados no canto superior esquerdo:

|        Modo        |               Para que serve               |
|:------------------:|:------------------------------------------:|
| Armature (montagem)| Montar o esqueleto, ossos, slots, peso      |
|  Animation (animar)| Criar e editar os clipes; abre mais painéis |

Trocar de modo: `Ctrl + Tab`.

Painéis oficiais (nomes da documentação):

|       Painel        |    Onde fica    |               O que faz                |
|:-------------------:|:---------------:|:--------------------------------------:|
|   System Toolbar    |   topo, larga   | Novo, abrir, salvar, desfazer, refazer, importar, exportar, preview, share |
|    Mode Toolbar     | canto sup. esq. | Troca montagem / animação               |
|   Inherit Toolbar   |      topo       | Liga/desliga herança de translação, rotação, escala |
|  Scene Tree Panel   |    esquerda     | Árvore pai-filho de ossos e slots; arrasta para reordenar |
|    Level Panel      |    esquerda     | Ordem de camadas dos slots; botões para subir/descer |
|  Resources Panel    |    esquerda     | Todas as imagens PNG do projeto; pasta real no disco |
|      Palco          |     centro      | Área de trabalho, maior parte da tela   |
|  Transform Panel    |     direita     | X, Y (relativo ao pai), escala, rotação |
| Properties Panel    |     direita     | Propriedades do slot, do osso e do frame de osso |
|  Animation Panel    |     direita     | Lista de clipes: novo, clonar, renomear, apagar |
|  Timeline Panel     |     rodapé      | Só aparece no modo animação             |
|    Share Panel      | não confirmado  | Compartilhar o trabalho                 |

Barra de ferramentas do palco (lado esquerdo, ícones):
Selection tool, Pose tool, Hand tool (mão), Create bone tool.

**Docking**: não confirmado se os painéis podem ser arrastados livremente.
Existe `Window > Reset Panel`, o que sugere que dá para mexer neles.

**Proporção da tela por padrão**: não confirmado em números. Pelos tutoriais,
o palco fica no centro e ocupa a maior área; timeline no rodapé; colunas de
painéis à esquerda e à direita.

Properties Panel e Curve Editor **podem ser fechados** para ganhar espaço.

## A3. Controles da cena

|        Ação        |                Como se faz                 |
|:------------------:|:------------------------------------------:|
|       Zoom         | Roda do mouse. Também segurar botão do meio e empurrar/puxar |
|        Pan         | Tecla `H` (hand tool) e arrastar. Também botão direito arrastando |
|      Réguas        |            `View > Rulers`                 |
|  Ajustar à tela    |             não confirmado                 |
| Campo de zoom com % |            não confirmado                  |

Não achei confirmação de **botão de zoom com texto** (campo de porcentagem)
nem de "fit to screen". A navegação parece ser só mouse + tecla `H`.

Grade: no DragonBones a palavra "grid" se refere à **malha (mesh)** de
deformação, não a grade de fundo do palco. Grade de fundo: não confirmado.

## A4. Barra de reprodução

Fica dentro do Timeline Panel. **Seis botões, da esquerda para a direita:**

|  # |          Botão           |         O que faz          |
|:--:|:------------------------:|:--------------------------:|
| 1  |   Return to first frame  |     Volta ao início        |
| 2  |      Previous frame      |     Quadro anterior        |
| 3  |         Reverse          |   Toca de trás para frente |
| 4  |          Play            |          Toca              |
| 5  |        Next frame        |     Quadro seguinte        |
| 6  |       Last frame         |     Vai para o fim         |

Detalhe importante: **não há botão de loop na barra de reprodução.**
A repetição é **propriedade do clipe**, editada no Animation Panel:
"Animation time", "Over time" e "Played" (número de repetições).

Ou seja: repetir vs uma vez é um **valor numérico no painel do clipe**,
não um botão de alternar na barra.

Atalho de play: `Enter` ou `Espaço`.

Campo de frame numérico e controle de velocidade de reprodução na barra:
**não confirmado**.

## A5. Timeline

|      Recurso        |                  Como é                   |
|:-------------------:|:-----------------------------------------:|
| Chaves por objeto   | Uma linha (layer) por osso e por slot     |
| Cores das chaves    | Branca, azul, vermelha, amarela e cinza   |
| Marcador de tempo   | Linha verde vertical                      |
| Linha de resumo     | não confirmado                            |
| Navegação chave a chave | não confirmado (só quadro a quadro: T e G) |
|   Zoom da timeline  | Botões de mais/menos **e um slider**      |
|       Curvas        | Curve Editor Panel, botão na barra        |

Barra de ferramentas da timeline, da esquerda para a direita:

|  # |         Botão          |             O que faz              |
|:--:|:----------------------:|:----------------------------------:|
| 1  |       Fold list        |     Recolhe todas as linhas        |
| 2  |      Expand list       |      Abre todas as linhas          |
| 3  |   Move frame to right  |     Empurra quadros à direita      |
| 4  |   Move frame to left   |     Empurra quadros à esquerda     |
| 5  |    Auto key frame      | Liga/desliga chave automática      |
| 6  |     Add key frame      |     Cria chave                     |
| 7  |      Curve panel       |     Abre o editor de curvas        |

**Auto key frame** tem dois estados visuais claros:
branco = desligado, **vermelho = ligado**. Ligado, qualquer mudança no osso
ou slot cria chave sozinha, no quadro onde está a linha verde.

**Curve Editor** (desde a 4.1): selecione uma chave que tenha tween e clique
no botão de curva na timeline. A curva é definida por quatro números
`[x1, y1, x2, y2]`. Valor `0.0` = linear; nulo = sem suavização.

## A6. Pontos, caixas, pivô

**Pivô da imagem.** No DragonBones o pivô em execução é a **origem do osso**.
O slot tem propriedade `origin` (o antigo `pivotX / pivotY`), que é a posição
do conteúdo dentro do osso.

Na prática: você move a imagem dentro do osso pelo **Transform Panel**
(X, Y relativos ao pai). Onde o osso está é onde a imagem gira.

**Pontos que o jogo lê** (posição + ângulo, tipo ponta de arma):
o DragonBones **não tem** um tipo "point" separado como o Spine.
O equivalente é criar um **osso vazio** (sem imagem) na ponta da arma e ler a
transformação desse osso pelo runtime. É prática comum, mas **não é recurso
nomeado na interface** — não confirmado como oficial.

Caixas de colisão / bounding box: não confirmado.

## A7. Atalhos principais

Fonte: cheatsheet da comunidade (blog Getting Started DragonBones).

|        Ação          |     Tecla      |
|:--------------------:|:--------------:|
|      Desfazer        |   Ctrl + Z     |
|       Refazer        |   Ctrl + Y     |
|       Apagar         |    Delete      |
|    Novo projeto      |   Ctrl + N     |
|       Abrir          |   Ctrl + O     |
|       Salvar         |   Ctrl + S     |
|       Fechar         |   Ctrl + W     |
|      Exportar        |   Ctrl + E     |
|     Preferências     |      F12       |
|      Preview         |  Ctrl + Enter  |
|      Publicar        | Ctrl+Shift+Enter |
|        Sair          |   Alt + Q      |
| Trocar montagem/animação |  Ctrl + Tab |
|   Selecionar tudo    |   Ctrl + A     |
|    Desselecionar     |      ESC       |
|   Arrastar o palco   |       H        |
|    Mover objeto      |    Setas       |
|   Trazer à frente    |       =        |
|    Mandar atrás      |       -        |
|  Trazer para o topo  |   Ctrl + =     |
| Mandar para o fundo  |   Ctrl + -     |
| Ferramenta Selecionar |      Q        |
|   Ferramenta Pose    |       W        |
|     Criar osso       |       E        |
|        Peso          |       R        |
|        Mover         |       Z        |
|        Girar         |       X        |
|      Escalonar       |       C        |
| Transformação livre  |       V        |
|     Editar malha     |       B        |
| Adicionar ponto de malha |     N      |
|  Apagar ponto de malha |      M       |
|    Tocar / parar     | Enter ou Espaço |
|     Criar chave      |       K        |
|   Quadro anterior    |       T        |
|   Quadro seguinte    |       G        |
| Guardar osso numa tecla | Ctrl + 1..0 |

`Ctrl + 1..0` guarda um osso numa tecla, para selecionar rápido depois.

## A8. Elogios e críticas

**Elogios**

|              Ponto positivo               |
|:-----------------------------------------:|
| Gratuito e de código aberto               |
| Osso criado sobre uma imagem já pega o nome e o vínculo dela |
| Criar restrição de IK é um clique só      |
| Dois modos separados deixam a tela limpa em cada etapa |
| Auto key frame fica **vermelho** quando ligado — vê-se de longe |

**Críticas**

|              Ponto negativo               |
|:-----------------------------------------:|
| Comunidade e documentação bem menores que as do Spine |
| Site oficial de documentação instável (recusou conexão nesta pesquisa) |
| Menos controle fino de animação que o Spine |
| Sem botão de loop na barra — "repetir" escondido no painel de clipe |
| Projeto praticamente parado; última versão de referência é 5.6 |

Críticas específicas de "interface confusa" em fóruns: **não confirmado**.
As comparações achadas falam de recursos e ecossistema, não de layout.

## A9. URLs consultadas — Parte A

- http://getting-started-dragonbones.blogspot.com/2018/12/dragonbones-cheatsheet.html
- http://getting-started-dragonbones.blogspot.com/2018/12/dragonbones-tutorial-part-3.html
- http://getting-started-dragonbones.blogspot.com/2017/01/dragonbones-tutorial-part-i.html
- http://getting-started-dragonbones.blogspot.com/2018/12/how-hotkeys-will-speed-up-your.html
- https://topic.alibabacloud.com/a/a-tutorial-on-using-the-dragonbones-of-the-skeleton-animation-tool_8_8_31057239.html
- https://docs.egret.com/dragonbones/en/docs/dbPro/interface/timelinePanel (recusou conexão; lido por resumo de busca)
- https://docs.egret.com/dragonbones/en/docs/dbPro/interface/animationPanel (idem)
- https://docs.egret.com/dragonbones/en/docs/dbPro/interface/propertiesPanel (idem)
- https://docs.egret.com/dragonbones/en/docs/dbPro/hotkey/hotkey (idem)
- https://docs.egret.com/dragonbones/en/docs/dbPro/advancedFeatures/curveEditor (idem)
- http://blog.dragonbones.com/en/release/whats-new-in-dragonbones-pro-5-2.html
- http://blog.dragonbones.com/en/release/dragonbones-5-5-is-relesaed.html
- https://github.com/DragonBones/DragonBonesAS/wiki/Move-from-V2.2-to-V2.3
- https://www.slant.co/versus/1900/15725/~spine_vs_dragonbones-pro
- https://steamcommunity.com/sharedfiles/filedetails/?id=2200465472

---

# PARTE B — Live2D Cubism Editor

Manual oficial completo e acessível. Versão de referência: linha 5.x.

Aviso: o Live2D **não é um animador por ossos**. Ele deforma malhas por
**parâmetros**. Mesmo assim a organização de tela é muito instrutiva.

## B1. Barra de menus

Menus confirmados no manual oficial:

|      Menu       |               O que guarda                |
|:---------------:|:-----------------------------------------:|
|      File       | Novo modelo, nova animação, abrir, recentes, fechar, salvar, salvar como, exportar, atalhos de teclado, sair |
|      Edit       | Desfazer, refazer, recortar, copiar, colar, apagar, selecionar tudo, desselecionar, buscar e substituir |
|  Show (Exibir)  | Grade, réguas, guias, caixa delimitadora, onion skin, multiview |
|    Modeling     | Malha, texture atlas, deformers, cola (glue), formas |
|    Animation    | Cena, faixas (tracks), chaves, área de trabalho |
|     Window      | Mostrar/esconder cada palette; layout de tela |
|      Help       | Manual, comunidade, versão                 |

Detalhe importante: `File > Keyboard Shortcuts` abre a janela
**Shortcuts Settings**, onde **todo atalho pode ser remapeado**.
Atalho da própria janela: `Ctrl + Alt + Shift + K`.
O arquivo de configuração dá para compartilhar entre Windows e Mac.

A lista item a item de Edit, Show, Modeling e Animation **não foi conferida
inteira** — os nomes acima vêm de páginas do manual e podem faltar itens.

## B2. Layout da tela

**Três espaços de trabalho** (workspaces), trocados por um botão na barra
de ferramentas:

|      Workspace       |            Para que serve             |
|:--------------------:|:-------------------------------------:|
|      Modeling        | Montar o modelo, malha, deformers, parâmetros |
|      Animation       | Fazer a cena animada na timeline      |
| Form Animation (FA)  | Animar a forma; mesmas ferramentas do Modeling |

Painéis do Live2D chamam-se **palettes**. Todos são **dockáveis**.

|      Palette        |             O que faz              |
|:-------------------:|:----------------------------------:|
|    Tool Details     | Opções da ferramenta ativa         |
|      Inspector      | Propriedades do objeto selecionado |
|       Parts         | Organiza as partes do modelo       |
|      Deformer       | Hierarquia pai-filho dos deformers |
|     Parameter       | Todos os parâmetros, com slider    |
|      Timeline       | A linha do tempo                   |
|       Scene         | Gerencia as cenas                  |
|      Project        | Nível do projeto                   |
|        Log          | Mensagens do sistema               |

**Proporção padrão da tela**: não confirmada em números.
Pelo manual, a View fica no centro; palettes em colunas laterais;
Timeline no rodapé no workspace de animação.

**Abas**: a View tem **sistema de abas** — dá para ver vários modelos ao
mesmo tempo. Existe também **Multiview** (vários ângulos ao mesmo tempo).

Barra de ferramentas — itens comuns a todos os workspaces:

|  #  |          Botão          |            O que faz             |
|:---:|:-----------------------:|:--------------------------------:|
|  1  |  Select Target Version  | Versão-alvo do modelo            |
|  2  |   Switch Workspaces     | Troca Modeling / Animation / FA  |
|  3  |  Edit Level Switching   | Três níveis de detalhe de edição |
|  4  |         Home            | Volta à tela inicial             |
|  5  |      nizima Link        | Loja oficial de materiais        |

Ferramentas do Modeling: Edit Texture Atlas, Edit Mesh Manually,
Automatic Mesh Generator, Create Warp Deformer, Create Rotation Deformer,
Rotation Deformer Tool, Arrow Tool, Lasso Tool, Brush Selection Tool,
Deform Path Edit, Deform Brush Tool, Edit Glue, ArtPath Tools.

Ferramentas do Animation: Select/Edit Tool, Parameter Controller Tool.

No Form Animation os botões indisponíveis ficam **acinzentados**, não somem.

## B3. Controles da cena (View area)

Aqui o Live2D é **muito mais completo** que o DragonBones.

|         Controle          |               Como é               |
|:-------------------------:|:----------------------------------:|
|           Zoom            |     Roda do mouse                  |
|      Zoom no cursor       |    `Alt` + roda do mouse           |
| **Campo numérico de zoom**| **Sim — digita a porcentagem**     |
|     Slider de zoom        |   De **2% a 3.200%**               |
|   Botões `[−]` e `[+]`    | Sim, zoom em passos                |
|     Full scale display    | Mostra no tamanho original do PSD  |
|      Display all          | Enquadra a tela inteira            |
|      Resetar a vista      |          `Ctrl + 0`                |
|          Pan              |     `Espaço` + arrastar            |
|      Pan em linha reta    |  `Espaço` + `Shift` + arrastar     |
|   Zoom fino de 1% em 1%   |  `Ctrl` + `Espaço` + arrastar      |
|   Focar no selecionado    |  Tecla `F` (botão Focus display)   |
|     Girar a tela          |     `R` + arrastar                 |
|  Girar travado na grade   |  `R` + `Shift` + arrastar          |
|    Espelhar a tela        |         Tecla `R`                  |
|      Ver em 3D            |  `E` (e `W` para ordem de desenho) |
|         Grade             | Botão na tela; `Show > Grid > Show Grid (Modeling View)` |
|    Cor de fundo           | Controle na própria View           |

Resposta direta à pergunta: **sim, existe zoom com texto.**
O Live2D tem os três de uma vez: campo numérico, slider e botões `[−] [+]`.

Outros recursos da View: linhas-guia, função Solo, Snapshot (compara com um
retrato salvo), Onion Skin, Multiview e Random Pose.

## B4. Barra de reprodução

Fica no **topo da Timeline palette**.

|        Comando         |          Atalho          |
|:----------------------:|:------------------------:|
|      Tocar / parar     |         `Enter`          |
|      Ir ao início      |         `Home`           |
|        Ir ao fim       |          `End`           |
|    Quadro anterior     |        `Page Up`         |
|    Quadro seguinte     |       `Page Down`        |
|    Chave anterior      |          `J`             |
|    Chave seguinte      |          `K`             |
| Chave anterior (todas as faixas) |    `Shift + J` |
| Chave seguinte (todas as faixas) |    `Shift + K` |
|    Marcador anterior   |       `Ctrl + J`         |
|    Marcador seguinte   |       `Ctrl + K`         |
| Início da área de trabalho |     `Shift + Home`   |
|  Fim da área de trabalho   |     `Shift + End`    |
| Mostrar área de trabalho   |      `Shift + F`     |

Ponto forte: o Live2D separa **quadro** (Page Up/Down) de **chave** (J/K),
e ainda separa **chave da faixa atual** de **chave de todas as faixas**
(com `Shift`). O DragonBones não tem esse segundo nível.

**Loop.** O Live2D trata repetição em dois lugares distintos:

|        Onde         |               O que é                |
|:-------------------:|:------------------------------------:|
| Botão **Repeat**    | Fica à esquerda do botão de exibição **de cada faixa** — repete aquela faixa |
| **Loop editing support** | Caixa de marcar na **Inspector palette** — duplica as chaves antes e depois da cena, para editar loop sem emenda |

Ou seja: repetir é **botão de alternar por faixa**, não um botão global na
barra. É diferente do "loop ligado/desligado" que a maioria dos programas usa.

**Campo de frame atual** e **controle de velocidade de reprodução** na barra:
**não confirmado** pelas páginas lidas. Existe uma opção de
**Lightweight playback** (reprodução leve) no menu hambúrguer da palette,
para tocar mais rápido em modelos pesados.

## B5. Timeline

|        Recurso        |                Como é                 |
|:---------------------:|:-------------------------------------:|
|  Chaves por objeto    | Faixas (tracks) com grupos de propriedades, abre e fecha |
|   Abrir/fechar tudo   | `Shift` + clique no botão de abrir    |
|   Linha de resumo     | não confirmado como linha única; `Shift+J/K` faz o papel de "navegar por qualquer chave" |
|  Zoom da timeline     | `Alt` + roda do mouse (centro = cursor) |
| Rolagem horizontal    | Slider no rodapé, ou `Shift` + roda   |
| Rolagem livre         | Botão do meio arrastando, ou `Espaço` + arrastar |
|  Área de trabalho     | **Barra azul** = trecho que toca; arrasta as pontas |
|      Duração          | Área cinza marcada `[Duration]`; arrasta ou digita no Inspector |
|    Travar duração     | Botão direito na área cinza           |
|       Curvas          | **Graph Editor**, separado do **Dope Sheet** |
|    Bezier             | Modos de edição de bezier no menu da palette |
|   Snap na grade       | Opção no menu da palette              |

O Live2D tem **duas visões da timeline**: **Dope Sheet** (chaves em blocos) e
**Graph Editor** (curvas de valor). São páginas separadas no manual.

No menu hambúrguer (canto superior direito da palette) ficam:
lightweight playback, destaque de passo de quadro, autoscroll, o que o Graph
Editor mostra (valores, nomes), modo de bezier e snap.

## B6. Parâmetros, deformers e pivô

Aqui está a diferença de fundo: **o Live2D não tem "pivô de imagem" no
sentido do Spine ou do DragonBones**. Ele tem parâmetros e deformers.

### Parameter palette

É o painel mais importante do programa. Organização, de cima para baixo:

|    Zona     |                     Conteúdo                      |
|:-----------:|:-------------------------------------------------:|
|    Topo     | Botões de edição de chave + busca refinada         |
|    Meio     | Uma barra por parâmetro: nome + slider + valor     |
|   Rodapé    | Criar parâmetro novo; criar grupo de parâmetros    |

Cada barra de parâmetro tem:

|     Elemento      |                O que faz                 |
|:-----------------:|:----------------------------------------:|
| Ícone de corrente | Liga dois parâmetros (movimento X/Y junto) |
|   Nome            | Botão direito abre o menu do parâmetro   |
| Divisor ajustável | Move a fronteira entre nome e slider     |
|     Slider        | Do mínimo ao máximo                      |
|  Campo de valor   | Número do valor atual                    |
|  Marcas no slider | São as **chaves** (keyforms)             |

Os quatro botões de chave, no topo:

|  #  |         Botão          |                O que faz                 |
|:---:|:----------------------:|:----------------------------------------:|
|  1  |      Add 2 keys        | Cria chave no mínimo e no máximo         |
|  2  |      Add 3 keys        | Cria chave no mínimo, meio e máximo      |
|  3  |    Delete all keys     | Apaga todas as chaves do parâmetro       |
|  4  |  Edit keys manually    | Janela para digitar as chaves na mão     |

**Refine Search**: um botão que mostra **só os parâmetros ligados ao objeto
selecionado**. Ideia muito boa para lista longa.

**Grupos de parâmetros**: arrasta e solta para agrupar; grupos recolhem;
botão direito dá **cor** ao grupo, e essa cor aparece na timeline.

Chaves de Blend Shape aparecem como marca **quadrada**; as normais, redondas.

A Parameter palette **não tem controles de reprodução** — esses ficam só na
Timeline palette.

### Deformer palette

Mostra a **hierarquia pai-filho** dos deformers, em árvore.
Serve para selecionar, mostrar/esconder, travar e conferir a hierarquia.

Dois tipos principais de deformer:

|        Tipo         |             O que faz              |
|:-------------------:|:----------------------------------:|
|   Warp Deformer     | Grade que entorta o desenho        |
| Rotation Deformer   | Gira/pivota como se fosse um osso  |

**O Rotation Deformer é o que mais se parece com um osso.** Ele tem um ponto
de rotação que você posiciona — é o equivalente mais próximo de "definir o
pivô" no Live2D.

### Parts palette

Lista as partes do modelo. Tem **caixa de filtro por nome ou ID**: digita e
só aparece o que contém aquele trecho.

### Pontos que o jogo lê

O Live2D **não tem** pontos com posição + ângulo exportados para o jogo, como
os "points" do Spine. **Não confirmado nenhum recurso equivalente.**
O runtime lê parâmetros, não marcadores de cena.

## B7. Atalhos principais

Todos remapeáveis em `File > Keyboard Shortcuts`.
Aviso do manual: **os números de cima e os do teclado numérico são teclas
diferentes** para o Cubism.

### Arquivo

|         Ação          |        Tecla         |
|:---------------------:|:--------------------:|
|     Novo modelo       |      Ctrl + N        |
|    Nova animação      |  Ctrl + Shift + N    |
|        Abrir          |      Ctrl + O        |
|      Recentes         |  Ctrl + Shift + O    |
|       Fechar          |      Ctrl + W        |
|       Salvar          |      Ctrl + S        |
|    Salvar como        |  Ctrl + Shift + S    |
|        Sair           |      Alt + F4        |
| Janela de atalhos     | Ctrl + Alt + Shift + K |

### Exportar

|         Ação          |        Tecla         |
|:---------------------:|:--------------------:|
| Imagens em sequência  |      Ctrl + I        |
|     Imagem PSD        |      Ctrl + P        |
|        Vídeo          |  Ctrl + Shift + M    |
|    Arquivo MOC3       |   Ctrl + Alt + S     |
|  Arquivos de motion   | Ctrl + Alt + Shift + S |

### Editar

|         Ação          |        Tecla         |
|:---------------------:|:--------------------:|
|      Desfazer         |      Ctrl + Z        |
|       Refazer         | Ctrl + Y ou Ctrl+Shift+Z |
|      Recortar         |      Ctrl + X        |
|       Copiar          |      Ctrl + C        |
|        Colar          |      Ctrl + V        |
|       Apagar          | Delete ou Backspace  |
|  Selecionar tudo      |      Ctrl + A        |
|   Desselecionar       |        Esc           |
| Buscar e substituir   |      Ctrl + F        |

### Ver

|         Ação          |        Tecla         |
|:---------------------:|:--------------------:|
|  Focar no selecionado |          F           |
|    Mostrar tudo       |      Ctrl + 0        |
|   Espelhar a tela     |          R           |
|      Ver em 3D        |          E           |
| Ver ordem de desenho 3D |        W           |

### Modelagem

|         Ação          |        Tecla         |
|:---------------------:|:--------------------:|
|   Modo editar malha   |      Ctrl + E        |
|  Gerador de malha automático | Ctrl + Shift + A |
|   Texture Atlas       |      Ctrl + T        |
| Trocar fonte/textura  |          T           |
| Resetar parâmetros    |      Ctrl + 1        |
| Travar formas padrão  |  Ctrl + Shift + 1    |
|  Formas de 4 cantos   |      Ctrl + 4        |
| Selecionar deformer pai |    Ctrl + D        |
| Selecionar filhos do deformer | Ctrl + Alt + D |
| Apagar deformer e conteúdo |   Ctrl + Delete |
| Destacar filhos do deformer | Ctrl + Shift + D |
|    Copiar forma       |  Ctrl + Shift + C    |
|     Colar forma       |  Ctrl + Shift + V    |
|   Misturar formas     |  Ctrl + Shift + B    |
|  Conectar bordas auto |      Ctrl + R        |
|    Colar vértices     |      Ctrl + G        |
|  Descolar vértices    |  Ctrl + Shift + G    |
|  Confirmar traçados   |     Shift + E        |

### Objetos

|         Ação          |        Tecla         |
|:---------------------:|:--------------------:|
| Travar/destravar seleção |   Ctrl + 2        |
|  Travar o não selecionado | Ctrl + Shift + 2 |
|   Destravar tudo      |   Ctrl + Alt + 2     |
| Mostrar/esconder seleção |   Ctrl + 3        |
| Esconder o não selecionado | Ctrl + Shift + 3 |
|     Mostrar tudo      |   Ctrl + Alt + 3     |

### Ferramentas

|         Ação          |        Tecla         |
|:---------------------:|:--------------------:|
|    Ferramenta seta    |          A           |
|        Laço           |          L           |
|  Seleção por pincel   |          B           |
|  Editar caminho de deformação |      P       |
|   Exibição solo       |          S           |
|      Snapshot         |      Ctrl + 5        |
| Mostrar/esconder snapshot |        5         |
| Salvar guia do snapshot | Ctrl + Shift + 5   |
| Nível 1 (detalhe)     |          1           |
| Nível 2 (normal)      |          2           |
| Nível 3 (grosso)      |          3           |

### Animação

Ver a tabela da seção B4 — Enter, Home, End, Page Up, Page Down, J, K,
Shift+J, Shift+K, Ctrl+J, Ctrl+K, Shift+Home, Shift+End, Shift+F.
Mais: `C` troca o modo de edição; `Shift + B` marca início da faixa;
`Shift + N` marca fim da faixa; `Shift + M` move a faixa.

## B8. Elogios e críticas

**Elogios**

|                Ponto positivo                 |
|:---------------------------------------------:|
| Manual oficial completo, com página por painel |
| Zoom com número, slider e botões `[−] [+]` ao mesmo tempo |
| Todo atalho é remapeável, e a configuração viaja entre Windows e Mac |
| Refine Search no painel de parâmetros — some com o que não interessa |
| Grupos de parâmetros com cor, e a cor aparece na timeline |
| Navegação de chave separada de navegação de quadro (J/K vs Page Up/Down) |
| Botões indisponíveis ficam acinzentados em vez de sumir — a tela não "dança" |

**Críticas**

|                Ponto negativo                 |
|:---------------------------------------------:|
| Curva de aprendizado alta; muitos painéis de uma vez |
| Usuários pedem **mais atalhos atribuíveis** no fórum oficial |
| Usuários abrem discussão só para **descobrir o nome de botões** da interface — sinal de ícones pouco claros |
| "Repetir" aparece em dois lugares diferentes (botão Repeat por faixa e caixa Loop editing support no Inspector) — confunde |
| nizima Link só em japonês                     |

Nota: as duas críticas de fórum vêm de títulos de discussão da
Live2D Creators Forum ("More Assignable Keyboard Shortcuts" e
"Does anyone know the name of these buttons?"). O conteúdo interno das
discussões **não foi lido** — não confirmado além do título.

## B9. URLs consultadas — Parte B

- https://docs.live2d.com/en/cubism-editor-manual/top/
- https://docs.live2d.com/en/cubism-editor-manual/about-the-editor-title/
- https://docs.live2d.com/en/cubism-editor-manual/toolbar/
- https://docs.live2d.com/en/cubism-editor-manual/about-viewarea/
- https://docs.live2d.com/en/cubism-editor-manual/shortcut/
- https://docs.live2d.com/en/cubism-editor-manual/palametorpalatte/
- https://docs.live2d.com/en/cubism-editor-manual/deformerpalatte/
- https://docs.live2d.com/en/cubism-editor-manual/partspalatte/
- https://docs.live2d.com/en/cubism-editor-manual/inspector-palette/
- https://docs.live2d.com/en/cubism-editor-manual/detailed-toolpalatte/
- https://docs.live2d.com/en/cubism-editor-manual/timeline-basic-operation-timelinepalette/
- https://docs.live2d.com/en/cubism-editor-manual/timeline-basic-operation-dopesheet/
- https://docs.live2d.com/en/cubism-editor-manual/loop-editing-support/
- https://docs.live2d.com/en/cubism-editor-manual/lightweight-playback/
- https://docs.live2d.com/en/cubism-editor-manual/grid/
- https://docs.live2d.com/en/cubism-editor-manual/file-menu/
- https://docs.live2d.com/en/cubism-editor-manual/animation-menu/
- https://docs.live2d.com/en/cubism-editor-manual/window-menu/
- https://docs.live2d.com/en/cubism-editor-manual/help-menu/
- https://docs.live2d.com/en/cubism-editor-manual/edit-parameters/
- https://docs.live2d.com/en/cubism-editor-tutorials/animator/
- https://community.live2d.com/discussion/1249/more-assignable-keyboard-shortcuts
- https://community.live2d.com/discussion/1252/does-anyone-know-the-name-of-these-buttons

---

## Não confirmado — lista curta

Para não misturar com o que está confirmado:

|      Programa      |               O que não achei                |
|:------------------:|:--------------------------------------------:|
|    DragonBones     | Lista completa dos menus                     |
|    DragonBones     | Botão/campo de zoom com porcentagem          |
|    DragonBones     | "Ajustar à tela"                             |
|    DragonBones     | Grade de fundo do palco                      |
|    DragonBones     | Linha de resumo de chaves na timeline        |
|    DragonBones     | Campo de frame e velocidade na barra         |
|    DragonBones     | Docking livre dos painéis                    |
|      Live2D        | Lista item a item de Edit / Show / Modeling  |
|      Live2D        | Campo de frame atual na barra de reprodução  |
|      Live2D        | Controle de velocidade de reprodução         |
|      Live2D        | Proporção de tela dos painéis em números     |
|      Live2D        | Pontos exportados com posição + ângulo       |

---

**Assinado:** Pesquisador — sessão "Pesquisa de organização de menus" (Claude Fable 5.1; agentes de busca em Opus). 08/09/2026.
