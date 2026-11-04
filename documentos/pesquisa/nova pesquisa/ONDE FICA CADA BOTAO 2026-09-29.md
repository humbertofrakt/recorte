# Onde fica cada botão — os três programas e o nosso — 29/09/2026

Escrito pelo chat **O** (`PESQUISA · onde fica cada botão`). Não escreve código.
Só leu `editor/`. Reporta ao `PLANEJADOR · 9f75b5`.

O pedido do Humberto, nas palavras dele:

> *"Tem muita coisa que não aparece no menu."*
> *"Partícula. Eu não sei onde é que acha partícula nesse programa."*
> *"Uma coisa não segue a outra. Não tem uma sequência."*

## Como este documento está montado

| Parte | O quê | Estado |
|:---:|:---|:---:|
| **A** | O nosso: os 7 menus, os painéis e as barras, lidos do código | pronta |
| **B** | A referência: Spriter, Spine e DragonBones, com link | pronta |
| **C** | A comparação: uma tabela por assunto (nove) | pronta |
| **D** | As três listas: só em painel · menu onde ninguém procura · a ordem | pronta |

**O que eu li do nosso:** `ui/menus.ts`, `ui/layout-model.ts`, `ui/toolbar-model.ts`,
`ui/action-bar-model.ts`, `ui/where-model.ts`, `ui/keys.ts` (cabeçalho),
`ui/actions-table.ts` (cabeçalho), a folha `O QUE O PROGRAMA FAZ 2026-09-22.md`,
a `O QUE NAO TEM PORTA 2026-09-22.md`, a `AUDITORIA POR BLOCO 2026-09-27.md` e o mapa
de `documentos/PARTES.md`. Os botões de dentro dos painéis vieram de leitura de
`panels/*.ts`. **Não abri o programa na tela.** O que só se vê na tela não está aqui.

---

# PARTE A — O nosso

## A.1 A tela, de cima para baixo

| # | Onde | O que é | Quem manda |
|:---:|:---|:---|:---|
| 1 | Topo | **Barra de menus**: 7 menus | `ui/menus.ts` |
| 2 | Logo abaixo, uma linha | **Barra de ações**: seis grupos de botões | `ui/action-bar-model.ts` |
| 3 | Centro | **A cena** (o palco), com zoom no canto | `viewport/` |
| 4 | Coluna da esquerda | dois grupos de abas | `ui/layout-model.ts` |
| 5 | Coluna da direita | dois grupos de abas | `ui/layout-model.ts` |
| 6 | Faixa de baixo | **Linha do tempo** e **Curvas** | `panels/dopesheet*`, `graph` |
| 7 | Rodapé | *"Base: homem"* ou *"Animação: andar"* e a dica da ferramenta | `ui/where-model.ts` |

## A.2 Os 7 menus, na ordem da barra

| # | Menu | O que mora nele, em blocos (a ordem é a do menu) |
|:---:|:---|:---|
| 1 | **Arquivo** | Novo · Abrir · Abrir pasta do projeto · Abrir outro corpo · Abrir uma entidade · Abrir recente · Reabrir o fechado · Abrir o herói ‖ Salvar · Salvar como · binário · pacote · Entregar um corpo · Salvar a entidade editada ‖ **Importar ▸** (outro programa, PSD, PSD com ossos) · **Exportar ▸** (glTF, Imagem, Por pele) ‖ Repetir a última exportação · Configurações do projeto ‖ Sair |
| 2 | **Editar** | Desfazer · Refazer ‖ Copiar · Colar · Copiar a pose · Colar em todas as chaves · Recortar chaves · Copiar a ordem na animação ‖ Duplicar · Apagar ‖ Selecionar tudo · Desmarcar · Renomear · Inverter · Substituir nomes · Buscar ‖ Escolher ▸ (filhos, pais) ‖ Copiar/Colar posição no osso ‖ Preferências |
| 3 | **Exibir** | Tema ▸ ‖ Ossos · Desenhos · Nomes · Pontos · Caixas · Máscaras ‖ Malhas · Arestas · Pesos ‖ Grade · Réguas · Eixos · Casca de cebola · Nome ao passar o mouse ‖ Guias (3) ‖ Esconder o escolhido · Só este · Mostrar tudo · Ver só o resultado · Cebola: opções · Imagem de referência ‖ Zoom (5) ‖ Nome das ferramentas · Ferramenta de antes |
| 4 | **Esqueleto** | **Novo ▸** (Osso · Imagem no slot · Ponto · Caixa · Ponto/Caixa neste slot · Máscara · **Emissor de partículas** · Regra · Evento · Pele · Parâmetro · Variável · Etiqueta) · Variáveis e etiquetas ▸ · Trocar imagem nas peles · Exportar pele · Importar pele · Promover pele ‖ **Física ▸** (4) ‖ Virar filho de · Opções do desenho · Frente/Trás/Frente de tudo/Fundo de tudo ‖ Nova pasta · Tirar da pasta · Limpar desenhos vazios ‖ Travar (5) ‖ Voltar ao repouso (2) ‖ Compensar ▸ · Eixos das alças ▸ |
| 5 | **Animação** | Abrir a base ‖ Nova · Duplicar · Renomear · Apagar · Mandar para o topo ‖ Exportar · Importar · Biblioteca de animações ‖ Duração · Repetir ‖ Tocar · Tocar para trás · Início · Fim · Quadro ± ‖ Chave ± (4) ‖ Chavear · Chavear tudo · Colar corpo aqui ‖ Apagar chave · linhas · Limpar tudo · **Curva da chave ▸** · Marcas ▸ · Trecho de laço ▸ ‖ **Efeitos ▸** (Flash, Pulso, Tremor) ‖ Selecionar chaves · Esticar · Espelhar no tempo · Fechar ciclo · Espelhar lados · Colar espelhado ‖ Copiar pose do escolhido · Empurrar chaves · Limpar chaves repetidas |
| 6 | **Janela** | 15 painéis em **três blocos**: montar (Árvore, Ordem, Propriedades, Imagens, Entidades, Pivôs) · animar (Animações, Peles, Regras, Histórico) · olhar (Exibição, Prévia, Malha e pesos, Linha do tempo, Curvas) ‖ Esconder painéis · Mover de coluna · Fechar o grupo · Detalhes da linha do tempo ‖ Arranjos ▸ · Voltar ao padrão |
| 7 | **Ajuda** | Manual · Atalhos · Problemas do arquivo · **Paleta de comandos** · Sobre |

Números que o próprio código diz em comentário (não contei item por item):
Esqueleto tem **~29 entradas** e Animação **perto de cinquenta**.
O teste da casca recusa grupo de mais de seis entre separadores.

## A.3 A barra de ações — os botões, na ordem

| # | Grupo | Botões |
|:---:|:---|:---|
| 1 | Arquivo | Novo · Abrir · Salvar |
| 2 | Editar | Desfazer · Refazer · Recortar chaves · Copiar · Colar · Apagar |
| 3 | Ferramentas (12) | Transformar (T) · Selecionar (Q) · Mover (W) · Girar (E) · Escalar (R) · Inclinar (Z) · Posar (Y) · Criar osso (B) · Ponto (O) · Caixa (X) · Malha (M) · Pesos (G) |
| 4 | Eixos | Local · Pai · Mundo (três palavras) |
| 5 | Exibir | Imagem de referência |
| 6 | Ver e travar | **em texto laranja**: Ver ossos (7) · Travar ossos (8) · Ver desenhos (9) · Travar desenhos (0) |
| 7 | **Partículas** | botão novo, em obra pelo chat B (o arquivo mudou às 23:53). Fora da lista de ações de propósito: é um menu com modelos prontos |

## A.4 Os painéis, onde nascem

| Coluna | Grupo | Abas, na ordem | O que responde |
|:---|:---:|:---|:---|
| Esquerda | 1 | Árvore · Ordem | *o que é esta coisa?* |
| Esquerda | 2 | Propriedades | *os campos do escolhido* |
| Direita | 1 | Imagens · Entidades · Pivôs · Exibição · Prévia | *o que eu trago e o que eu vejo* |
| Direita | 2 | Animações · Peles · Regras · Histórico · Malha e pesos | *o que eu faço no tempo* |
| Baixo | — | Linha do tempo · Curvas | *quando* |

Cinco abas em cada grupo da direita. O grupo 2 da direita mistura **tempo**
(Animações), **roupa** (Peles), **regra** (Regras), **passado** (Histórico) e
**forma** (Malha e pesos). Isto pesa na lista **c**.

## A.5 O que mora DENTRO de cada painel (botões que não têm item de menu)

| Painel | Botões e gestos de dentro | Tem item de menu? |
|:---|:---|:---:|
| Árvore | **Novo ▾** (osso, regra, evento, pele, parâmetro, emissor) · Buscar · Duplicar · Apagar · botão direito | em parte |
| Ordem | Juntar em pasta · arrastar para reordenar · Ctrl+setas | em parte |
| Imagens | Buscar · Abrir/Recarregar/Trocar origem · **Carimbar pivôs** · Trazer como sequência · botão direito | **não** |
| Pivôs | grade das imagens · nove pontos · repetir para a pasta | só o nome do painel |
| Animações | + · Duplicar · Renomear · Apagar · Topo · Pasta · o clique no corpo abre a base | sim, no menu Animação |
| Peles | + · Duplicar · Pasta · Importar · Exportar · Apagar · Lápis · arrastar liga | sim, algumas |
| Regras | Nova regra (janela em 2 passos) · Parâmetros · Física · Variáveis · Etiquetas | em parte |
| Malha e pesos | **Virar malha · Gerar automática · Traçar contorno · vértice · aresta · Ligar ossos · Pesos automáticos · Suavizar · Podar · Chavear pesos · Pincel (somar, subtrair, substituir, suavizar) · Malha ligada** | **nenhum** |
| Linha do tempo | Tocador (tocar, velocidade, tempo, duração, fim) · Detalhes · **⋯ Mais** (No fim, Fator, Esticar, Espelhar, Fechar ciclo, Pares de nome, Espelhar lados, Só os escolhidos, Tirar trecho) | sim, o ⋯ Mais repete o menu |
| Curvas | arrastar as alças | só pelo menu Curva… |
| Prévia | tela cheia (F11) · mistura de camadas | **não** |
| Histórico | clicar numa linha volta ou avança | **não** |
| Propriedades | ficha rápida (X, Y, escala, ângulo, alfa) · Imagem com miniatura · Compensar · grupos por tipo | **não** (é o painel) |
| Exibição | as mesmas caixas do menu Exibir | sim, é a mesma fonte |

## A.6 O que a nossa própria folha diz que não vê

Copiado de `O QUE O PROGRAMA FAZ`, fim: *"Estes assuntos não aparecem acima:
**Malha e pesos**. […] tudo neles se faz por botão dentro do painel, e botão de
painel não tem linha em tabela de menu, de tecla nem da barra."*

E a `AUDITORIA POR BLOCO`, bloco 8: o painel **Pivôs nunca foi auditado por dentro**.

Ainda **sem porta** (folha `O QUE NAO TEM PORTA`, 28/09 de manhã; os chats C, D e E
estão fechando estas): `SetRuleChain`, `KeyDriverTarget`, `DeleteTag`,
`RenameTag`, `removeBodyKey`, `ImportImagesCommand`.

---

# PARTE B — A referência, na internet

Lida em 29/09/2026, na fonte oficial de cada programa. **Cada afirmação tem link.**
Onde a fonte não diz: *"não achei"*.

## B.1 Spriter Pro (BrashMonkey) — o modelo da casa

Fontes: o manual 1.4, [índice](https://www.brashmonkey.com/spriter_manual/index.htm)
(37 capítulos, li 36 + 4 páginas fora do índice) e o
[PDF oficial](https://brashmonkey.com/spriter_manual/Spriter_Manual.pdf) (122 figuras olhadas).
Comparação Free × Pro: [brashmonkey.com/spriter-pro](https://brashmonkey.com/spriter-pro/).
`M:nome` = `https://brashmonkey.com/spriter_manual/nome.htm`.

**Aviso honesto:** o texto do manual **não descreve** os menus Edit, View, Window, Modes e Help.
O Edit veio de uma **figura** (PDF p.15). Window, View, Modes e Help: **não achei** os itens.

### B.1.1 O que muda o desenho (achados)

| # | Achado | Fonte |
|:---:|:---|:---|
| 1 | Barra de menus: **File · Edit · Window · View · Help** nos builds antigos; o build novo tem **seis**, com **Modes** | PDF p.3, p.25, p.27 |
| 2 | **Não há comando "importar imagens".** As imagens são as PNG da pasta do projeto: aparecem na Palette (aba Files) e se **arrastam para a cena** | [M:placing a sprite](https://brashmonkey.com/spriter_manual/placing%20a%20sprite.htm) |
| 3 | O **pivô** se define por **duplo clique na imagem** da Palette | [M:default pivot points](https://brashmonkey.com/spriter_manual/default%20pivot%20points.htm) |
| 4 | Um **seletor "Alt + Click"** na Palette decide o que Alt+arrastar cria: **osso · caixa · ponto** | [M:adding collision rectangles](https://brashmonkey.com/spriter_manual/adding%20collision%20rectangles%20to%20frames.htm) |
| 5 | A **ordem de desenho** tem painel próprio (Z-order) **e** quatro itens no menu Edit (`Ctrl+setas`) | PDF p.15 |
| 6 | Curva da chave: **clique direito na chave** → Instant · Linear · Custom | [M:setting the tweening mode](https://brashmonkey.com/spriter_manual/setting%20the%20tweening%20mode%20of%20a%20keyframe.htm) |
| 7 | **Variáveis, tags e eventos** moram na **linha do tempo** (a linha "meta data" e o clique direito nos nomes) | [M:adding variables](https://brashmonkey.com/spriter_manual/adding%20variables%20to%20an%20animation.htm) |
| 8 | Peles = **Character Maps**: uma janela própria, aberta pelo botão *Char Maps* do painel Animations | [M:create a character map](https://brashmonkey.com/spriter_manual/create%20a%20character%20map%20and%20assign%20effects.htm) |
| 9 | **Malha: não existe.** **Partículas: NÃO existe** (o manual só cita "particle effects" como coisa que o **jogo** faz quando um evento dispara). **Regras e física: não existe** | manual inteiro |
| 10 | **Exportar imagem** fica em **File**: *Export Animation To PNG/GIF…* | [M:exporting animations](https://brashmonkey.com/spriter_manual/exporting%20animations%20as%20images%20or%20gifs.htm) |

### B.1.2 O menu File e o menu Edit (só estes dois têm itens)

**File** (build novo; PDF p.27, p.35):

| Bloco | Itens |
|:---|:---|
| Projeto | New Project… (Ctrl+N) · Open Project… (Ctrl+O) · Open Recent Project… ▸ |
| Salvar | Save Project (Ctrl+S) · Save Project As… · Save New Version (Ctrl++) |
| Exportar e atlas | **Export Animation To PNG/GIF…** · **Generate spritesheets for project images** · Generate TexturePacker Spritesheet file (*.tps) |
| Resto | **Other File Actions… ▸** (Import Another Project Into Current · Batch Convert scml/scon · Custom Save Options… · Save As Resized Project) · Exit · Load and Fix Corrupt File |

**Edit** (só por figura, PDF p.15): Undo · Redo ‖ Cut · Copy · **Copy Current Frame** · Copy Selection To All Frames · Paste · **Paste To All Keys** · Delete · Delete From All Frames · Select All ‖ **Move Up / Down / To Top / To Bottom in Z-Order** · **Copy Z-Order to Other Frames** ‖ Settings…

**Window, View, Modes, Help: não achei os itens.**

### B.1.3 A tela

Confirmada pela figura da tela cheia (PDF p.34) e pelo [Quickstart](https://brashmonkey.com/spriter_manual/getting%20started.htm).

| Onde | Painel | O que tem |
|:---|:---|:---|
| Esquerda, em cima | **Hierarchy · Z-order** (abas) | a árvore de pais e filhos · a lista de ordem de desenho, arrastável |
| Esquerda, embaixo | **Object Properties** | x, y, escala, ângulo, alfa |
| Centro | **Canvas** | a cena. Acima dele, à direita: **Show Bones · Lock Bones · Show Sprites · Lock Sprites** (teclas 7 8 9 0) |
| Direita, em cima | **Palette** (abas Files · Objects) | as pastas e imagens · o seletor *Alt+Click* · *Copy/Paste Default Pivots* · *Reload All Images* |
| Direita, embaixo | **Animations** (abas History · Animations) | entidades e animações · botão **Char Maps** · ícone laranja de recorte |
| Embaixo, largura toda | **Timeline** | 5 botões de transporte · velocidade · nome · tempo · **key selected / key all** · linha "meta data" |
| Janelas soltas | **Character Maps** · **Edit MetaData** | aparecem por botão ou duplo clique |

Conteúdo das abas *Objects* e *History*: **não achei**.

### B.1.4 A ordem do trabalho — o Quickstart, passo a passo

Fonte: [M:getting started](https://brashmonkey.com/spriter_manual/getting%20started.htm) e o índice.

| # | Passo | Onde |
|:---:|:---|:---|
| 1 | Preparar pasta e PNG, uma subpasta por parte (**fora** do programa) | disco |
| 2 | **File → New Project**, escolher a pasta raiz | menu File |
| 3 | Renomear a entidade e a animação que já nascem prontas | Animations |
| 4 | **Pivô** de cada imagem (duplo clique) | Palette |
| 5 | **Arrastar** as imagens para a cena; acertar no Object Properties | Palette → Canvas |
| 6 | **Z-order** | painel Z-order |
| 7 | **Criar ossos** (Alt+arrastar, seletor em "create bone") | Canvas |
| 8 | **Prender os sprites aos ossos** (segurar `B` e clicar) | Canvas |
| 9 | **Animar**: mexer em outro tempo cria a chave sozinho | Canvas + Timeline |
| 10 | Trocar a imagem no meio da animação (clique direito na Palette) | Palette |
| 11 | Ajustar o tempo das chaves e a duração | Timeline |
| 12 | Copiar quadro inteiro; acrescentar sprite à animação pronta | Edit |
| 13 | Extras de jogo: som, caixas, pontos | Palette, Timeline |
| 14 | **Character Maps** (peles) | janela própria |
| 15 | Atlas, recorte | File, ícone laranja |
| 16 | **Exportar PNG/GIF** | File |
| 17 | Variáveis, tags, eventos | Edit MetaData |

**A ordem do manual, em uma linha:** preparar → projeto → pivô → sprites → ordem → ossos → animar → tempo → cópias → extras de jogo → peles → otimizar → **exportar** → dados de jogo.

### B.1.5 Onde fica cada função no Spriter

| Função | Onde |
|:---|:---|
| Novo projeto | File → New Project (pede a pasta raiz) |
| Importar imagens | **não há comando**: as PNG da pasta aparecem na Palette → Files |
| Pôr a imagem na cena | arrastar da Palette para o Canvas |
| Pivô | duplo clique na imagem, na Palette (nove atalhos de canto e centro) |
| Criar osso | Alt+arrastar no Canvas, com o seletor da Palette em "create bone" |
| Prender imagem ao osso | escolher o osso, segurar `B`, clicar no sprite |
| Hierarquia | painel Hierarchy (aba, esquerda) |
| Ordem de desenho | painel Z-order (arrastar) · Edit → Move … in Z-Order · `Ctrl+setas` |
| Criar animação | painel Animations (ícones no topo) |
| Chaves | editar em outro tempo cria a chave · **key selected / key all** na Timeline |
| Curvas | clique direito na chave → Instant / Linear / Custom |
| Copiar quadros | Edit → Copy Current Frame · Paste To All Keys · `Ctrl+Shift+C` |
| Papel de cebola | clique direito e arrastar na Timeline (vermelho = passado, verde = futuro) |
| Mostrar/travar | os quatro botões acima do Canvas · clique direito no Canvas |
| Peles | botão **Char Maps** (painel Animations) → janela Character Maps |
| Variáveis · tags | duplo clique na linha "meta data" da Timeline → Edit MetaData |
| Eventos | clique direito nos nomes da Timeline → *append event at time* |
| Caixa de colisão · ponto de ação | seletor Alt+Click = create box / create point |
| Som | WAV na pasta; clique direito no nome do som → põe na Timeline |
| Recorte | ícone laranja na Animations · campos no diálogo de exportação |
| Exportar imagem/GIF | **File → Export Animation To PNG/GIF…** |
| Atlas | File → Generate spritesheets… · Generate TexturePacker file |
| Malha · partículas · regras/física | **não existem** |
## B.2 DragonBones Pro (Egret)

**Aviso sobre a fonte.** `docs.egret.com` está fora do ar e `dragonbones.github.io`
leva a um site sem manual. O manual oficial em inglês foi lido nas **capturas do
Internet Archive** (2021 e 2022). Ele descreve até a versão 4.5/4.6; as notas de versão vão até a 5.6.1.
Padrão do link: `https://web.archive.org/web/2022/https://docs.egret.com/dragonbones/en/docs/<caminho>`.
Os caminhos citados abaixo (`dbPro/...`) seguem esse padrão.

### B.2.1 O que muda o desenho (achados)

| # | Achado | Fonte (`docs/…`) |
|:---:|:---|:---|
| 1 | **O manual NÃO tem página de menus.** Só cita, soltos: *File → Preferences*, compartilhar no File, *Help → Plugin Management*, e um item de resetar o layout no menu *Window*. O resto: **não achei** | `dbPro/interface/firstChoice` · `dbPro/plugin/pluginManager` · notas 4.6.1 |
| 2 | Quase tudo mora na **barra do sistema** (botões) e na **barra de modo**, não em menu | `dbPro/interface/systemToolbar` · `modeToolbar` |
| 3 | **Dois modos**, um controle só: **montagem do esqueleto ⇄ animação**. Cada painel aparece em um modo só | `dbPro/interface/modeToolbar` |
| 4 | **Partículas: NÃO existe.** Nenhuma página, botão ou campo no formato de dados. Busca por "particle": zero | manual inteiro |
| 5 | **Física: não achei.** Só IK e herança | manual inteiro |
| 6 | **Pivô da imagem: não achei.** Só diz que o centro de giro da malha é o da imagem original | `dbPro/advancedFeatures/grid` |
| 7 | **Painel de Skins: não achei** no editor (o formato de dados 5.0 tem lista `skin`) | `dbLibs/5foramt` |
| 8 | A malha se chama **Grid** no manual; os pesos só chegaram na 4.6.1 | `advancedFeatures/grid` · `skinWeights` |
| 9 | Exportar GIF e vídeo: **não achei** | `dbPro/export/exportAnimation` |

### B.2.2 As barras

| Barra | O que tem | Fonte |
|:---|:---|:---|
| **Sistema** (topo) | Novo · Abrir · Salvar · Desfazer · Refazer · Importar · Exportar · Prévia · Compartilhar | `interface/systemToolbar` |
| **Modo** | montagem ⇄ animação | `interface/modeToolbar` |
| **Cena principal** | ferramentas: Seleção (V) · Pose (P) · Mover (H) · Criar osso (N) | `interface/mainInterface` · `hotkey/hotkey` |
| **Mostrar · Selecionável · Herdar** | três chaves, para osso e slot | `interface/inheritToolbar` |
| **Linha do tempo**, 5 grupos | reprodução · edição de quadro (onion, copiar, recortar, colar, apagar) · barra (empurrar quadros, chave automática, adicionar chave, painel de curva) · zoom · faixas coloridas | `interface/timelinePanel` |
| **Editor de grade** (malha) | Edit (Q) · Add (W) · Delete (E) · Edge · Reset | `advancedFeatures/grid` |

### B.2.3 Os painéis, e em que modo aparecem

O manual dá a lista, **não a posição na tela** (não li os prints).

| Painel | O que tem | Modo | Fonte (`dbPro/interface/`) |
|:---|:---|:---:|:---|
| Cena principal | montar e animar | os dois | `mainInterface` |
| **Árvore da cena** | pai/filho de ossos e slots · criar osso · criar slot · renomear · apagar · busca | edita só em montagem | `sceneTreePanel` |
| Transformação | x, y, escala, ângulo | os dois | `transformPanel` |
| **Propriedades** | slot, osso, quadro do osso, IK, grade, pesos | os dois | `propertiesPanel` |
| **Hierarquia** (camadas) | ordem de desenho dos slots · Up/Down · `[` `]` | **só montagem** | `levelPanel` |
| **Recursos** | as imagens PNG · importar · abrir pasta · atualizar | **só montagem** | `resourcesPanel` |
| **Animações** | nova · clonar · renomear · apagar · tempo · repetições | **só animação** | `animationPanel` |
| **Linha do tempo** | as faixas e os botões acima | **só animação** | `timelinePanel` |
| Curva | predefinições: nenhuma, linear, entra suave, sai suave, entra e sai | só animação | `advancedFeatures/curveEditor` |

### B.2.4 A ordem do trabalho, pela ordem das páginas

O manual **não tem passo a passo**. A ordem sai da ordem das páginas (dedução marcada pela pesquisa).

| # | Passo | Modo |
|:---:|:---|:---:|
| 1 | Novo projeto ou Importar | — |
| 2 | Recursos: as imagens | Montagem |
| 3 | Criar ossos (a imagem liga sozinha ao osso) | Montagem |
| 4 | Slots e imagens | Montagem |
| 5 | Hierarquia e ordem de desenho | Montagem |
| 6 | Malha e pesos (opcional) | Montagem |
| 7 | IK (opcional) | Montagem |
| 8 | **Trocar para o modo Animação** | — |
| 9 | Criar animação | Animação |
| 10 | Chaves, curvas, onion skin, copiar e colar | Animação |
| 11 | Eventos e ações | Animação |
| 12 | Prévia (Ctrl+Enter, no navegador) | — |
| 13 | Exportar | — |

### B.2.5 Onde fica cada função no DragonBones

| Função | Onde | Fonte |
|:---|:---|:---|
| Novo · Abrir · Salvar | botões da barra do sistema (Ctrl+N/O/S) | `systemToolbar` |
| Importar imagens | painel **Recursos**: botão importar, ou arrastar PNG de fora | `resourcesPanel` |
| Criar osso | ferramenta de osso (N) ou botão na Árvore. Projeto novo já traz o osso `root` | `basicConcept/skeleton` |
| Ligar imagem ao osso | arrastar a imagem do Recursos **para a cena** ou **para um osso da Árvore**; ou botão *adicionar slot* | `basicConcept/slot` |
| Hierarquia | Árvore da cena: arrastar | `sceneTreePanel` |
| Ordem de desenho | painel **Hierarquia** (só montagem) | `levelPanel` |
| Criar animação | painel **Animações** → nova (só no modo Animação) | `animationPanel` |
| Chaves | botão *adicionar chave*, tecla K, *chave automática* | `timelinePanel` |
| Curvas | botão de curva na barra da linha do tempo | `curveEditor` |
| Copiar/colar quadros | botões na linha do tempo (Ctrl+C/V) | `timelinePanel` |
| Onion skin | botão na barra de edição de quadro | `advancedFeatures/yangCongPi` |
| Mostrar/travar | chaves *Display* e *Optional* na barra própria; arrastar na linha do tempo (4.7.4) | `inheritToolbar` · notas |
| Malha | *Convert to Grid* → editor de grade | `grid` |
| Pesos | *Bind Bone*, cálculo automático, ferramenta de pizza; **Alt+clique = 100%** | `skinWeights` |
| IK | 2 botões no painel de propriedades do osso | `advancedFeatures/IK` |
| Eventos | camada de evento na linha do tempo | `timelinePanel` |
| Partículas | **não existe** | — |
| Exportar | botão Exportar (Ctrl+E): DragonBones (json/xml), MovieClip, sequência de quadros; atlas com opções | `export/exportAnimation` |
| Importar de fora | botão Importar (Ctrl+I): pasta, PNG, Zip, PSD, Cocos, Spine (plug-in) | `import/*` |
| Preferências | File → Preferences | `interface/firstChoice` |

Lista completa do que **não achei**: painel de menus completo · posição de cada painel na tela ·
como editar pivô · painel de Skins · criar bounding box no editor · partículas (**não existe**) ·
física · GIF e vídeo · se o "speed format" é binário.

## B.3 Spine (Esoteric Software)

Guia oficial: [spine-user-guide](https://esotericsoftware.com/spine-user-guide), 50 páginas.
Li o texto de todas as que tratam de interface, mais os prints oficiais dos menus.

### B.3.1 O que muda o desenho (achados)

| # | Achado | Fonte |
|:---:|:---|:---|
| 1 | **O Spine NÃO tem barra de menu.** Tem **um menu só**, aberto no logo *Spine*, canto de cima à esquerda (ou `Alt+F`) | [spine-ui](https://esotericsoftware.com/spine-ui) |
| 2 | **O Spine NÃO tem sistema de partículas.** Só ganchos: *point attachment* (posição e giro "para spawnar partículas"), *evento* e *bounding box*. O efeito é feito no jogo | [spine-points](https://esotericsoftware.com/spine-points) · [spine-events](https://esotericsoftware.com/spine-events) |
| 3 | O Spine **tem física**: *Physics constraint* (só Professional). Não tem "assar em chaves" | [spine-physics-constraints](https://esotericsoftware.com/spine-physics-constraints) |
| 4 | **Draw Order, Constraints, Events, Skins, Animations, Images e Audio não são painéis: são NÓS dentro da Tree** | [spine-ui](https://esotericsoftware.com/spine-ui) · [spine-views](https://esotericsoftware.com/spine-views) |
| 5 | Não há ferramenta **Selecionar** (a seleção é inteligente) nem **Editar malha** na barra: a malha se edita pelo botão *Edit Mesh* nas propriedades do anexo | [spine-tools](https://esotericsoftware.com/spine-tools) · [spine-meshes](https://esotericsoftware.com/spine-meshes) |
| 6 | **Pivô da imagem: não achei.** O *region* é posto pelo centro da imagem; o pivô de giro é a origem do osso | [spine-regions](https://esotericsoftware.com/spine-regions) |
| 7 | **Espelhar pose: não achei** comando. Há escala −1 e copiar/colar transformações de ossos | [spine-tools](https://esotericsoftware.com/spine-tools) |
| 8 | A ordem *montar → pesos → animar → exportar* **não vem escrita numa frase** no guia. Vem da ordem das páginas (B.3.5). A leitura de que os pesos são passo de Setup é da pesquisa, marcada | [spine-user-guide](https://esotericsoftware.com/spine-user-guide) |

### B.3.2 O menu do Spine (o único) — logo *Spine*, canto de cima

Itens vistos no **print oficial** (v4.2.32) e cruzados com o texto. O texto do guia não lista o menu.

| Item | Atalho | Confirma |
|:---|:---:|:---|
| New Project | Ctrl+Shift+N | [spine-playback](https://esotericsoftware.com/spine-playback) |
| Open Project… · Recent Projects ▸ | Ctrl+O | [spine-ui](https://esotericsoftware.com/spine-ui) |
| Save Project · Save Project As… | Ctrl+S · Ctrl+Shift+S | só no print |
| New Skeleton | Ctrl+N | [spine-skeletons](https://esotericsoftware.com/spine-skeletons) |
| Import Project… · Import Data… · Import PSD… | — | [spine-import](https://esotericsoftware.com/spine-import) · [spine-import-psd](https://esotericsoftware.com/spine-import-psd) |
| Export… | Ctrl+E | [spine-export](https://esotericsoftware.com/spine-export) |
| Texture Packer… · Texture Unpacker… | Ctrl+P | [spine-texture-packer](https://esotericsoftware.com/spine-texture-packer) |
| Settings… | F12 | [spine-settings](https://esotericsoftware.com/spine-settings) |

Fora do menu, na barra de título: **Abrir · Salvar · Desfazer · Refazer** e o envelope da tela de boas-vindas.
No canto de cima à direita: a caixa **Views** (abre painéis fechados) e o botão de minimizar tudo (`F9`). [spine-ui](https://esotericsoftware.com/spine-ui)

### B.3.3 A tela e os painéis (*views*)

Padrão: **viewport à esquerda, Tree à direita.** Em modo Animate: **Graph embaixo, Dopesheet como aba** ao lado. [spine-ui](https://esotericsoftware.com/spine-ui)

| View | Para quê | Fonte |
|:---|:---|:---|
| **Tree** | a hierarquia de tudo. As propriedades do item escolhido moram **embaixo da Tree** | [spine-tree](https://esotericsoftware.com/spine-tree) |
| Animations | lista de animações, botão de nova | [spine-animations-view](https://esotericsoftware.com/spine-animations-view) |
| Dopesheet | o **tempo** das chaves | [spine-dopesheet](https://esotericsoftware.com/spine-dopesheet) |
| Graph | **tempo e valor**: curvas e alças | [spine-graph](https://esotericsoftware.com/spine-graph) |
| Timeline | só a régua de tempo | [spine-timeline](https://esotericsoftware.com/spine-timeline) |
| Ghosting | papel de cebola | [spine-ghosting](https://esotericsoftware.com/spine-ghosting) |
| Playback | FPS, velocidade, Stepped, Interpolated | [spine-playback](https://esotericsoftware.com/spine-playback) |
| Preview | toca animações com trilhas e mistura | [spine-preview](https://esotericsoftware.com/spine-preview) |
| Outline | vista limpa da pose | [spine-outline](https://esotericsoftware.com/spine-outline) |
| Skins | várias peles ao mesmo tempo | [spine-skins-view](https://esotericsoftware.com/spine-skins-view) |
| Slot Color | cor do slot | [spine-slot-color](https://esotericsoftware.com/spine-slot-color) |
| Weights | ligar ossos à malha, pesos, pincel | [spine-weights](https://esotericsoftware.com/spine-weights) |
| Mesh Tools | seleção suave de vértices | [spine-mesh-tools](https://esotericsoftware.com/spine-mesh-tools) |
| Metrics | contagens de ossos, vértices, triângulos | [spine-metrics](https://esotericsoftware.com/spine-metrics) |
| Audio | forma de onda dos eventos de áudio | [spine-audio-view](https://esotericsoftware.com/spine-audio-view) |

### B.3.4 A barra de ferramentas (embaixo do viewport) e os dois modos

Dois **modos**, por um ícone no canto de cima à esquerda do viewport: **Setup** (criar o esqueleto) e **Animate** (animar). [spine-ui](https://esotericsoftware.com/spine-ui)

| Grupo | Botões (tecla) |
|:---|:---|
| Ossos | **Pose** (B) · **Create** (N, só em Setup) · **Weights** (G) |
| Transformar | **Rotate** (C) · **Translate** (V) · **Scale** (X) · **Shear** (Z) |
| Eixos | Local · Parent · World |
| Compensação | Bones · Images |
| Chave | **Auto Key** |
| Opções do viewport | grade: Bones/Images/Others × selecionar · visível · nome |

Fonte: [spine-tools](https://esotericsoftware.com/spine-tools) e [spine-keys](https://esotericsoftware.com/spine-keys). Botão direito no viewport alterna entre a ferramenta e a última usada.

### B.3.5 A ordem do trabalho, pela ordem do guia

Índice oficial: *Getting started* (interface, esqueletos, ossos, slots, imagens, ferramentas, chaves, animar) → anexos → skins → constraints → eventos → views → exportar → importar. [spine-user-guide](https://esotericsoftware.com/spine-user-guide)

| # | Etapa | Modo | Fonte |
|:---:|:---|:---:|:---|
| 1 | Preparar as imagens fora do Spine. *"Spine is not an image editor"* | — | [spine-images](https://esotericsoftware.com/spine-images) |
| 2 | Nó **Images** na Tree: apontar a pasta; **arrastar a imagem para o viewport** cria slot e region | Setup | [spine-images](https://esotericsoftware.com/spine-images) |
| 3 | Montar a pose de montagem | Setup | [spine-images](https://esotericsoftware.com/spine-images) |
| 4 | **Create** (N): criar ossos e levar os slots para eles | Setup | [spine-tools](https://esotericsoftware.com/spine-tools) |
| 5 | Draw Order (nó da Tree), cor e blend do slot | Setup | [spine-slots](https://esotericsoftware.com/spine-slots) |
| 6 | Malha: marcar *Mesh*, *Edit Mesh* | Setup | [spine-meshes](https://esotericsoftware.com/spine-meshes) |
| 7 | Pesos: *Bind*, *Auto*, pincel | Setup | [spine-weights](https://esotericsoftware.com/spine-weights) |
| 8 | Constraints, skins, eventos | Setup | [spine-constraints](https://esotericsoftware.com/spine-constraints) |
| 9 | Trocar para **Animate**; nova animação; posar e pôr chaves | Animate | [spine-keys](https://esotericsoftware.com/spine-keys) |
| 10 | Curvas no Graph, tempo no Dopesheet, Ghosting, Preview | Animate | [spine-graph](https://esotericsoftware.com/spine-graph) |
| 11 | **Exportar** | — | [spine-export](https://esotericsoftware.com/spine-export) |

### B.3.6 Onde fica cada função no Spine

| Função | Onde |
|:---|:---|
| Novo projeto · abrir · salvar | menu *Spine*; Abrir e Salvar também na barra de título |
| Importar imagens | nó **Images** da Tree (pasta) · arrastar ao viewport · menu → Import PSD/Data |
| Criar osso | ferramenta **Create** (N); ou Tree → *New…* → Bone |
| Ligar imagem ao osso | **Create** com `Ctrl` + clique nos anexos; ou `Set Parent`/`P`; ou arrastar na Tree |
| Hierarquia | **Tree** |
| Ordem de desenho | nó **Draw Order** da Tree (arrastar, ou `+`/`-`) |
| Criar animação | modo Animate → nó **Animations** da Tree → *New…* ; ou ícone na view Animations |
| Chaves | botão de chave ao lado de cada propriedade · `K` · **Auto Key** na barra |
| Curvas | view **Graph** |
| Copiar/colar pose | `Ctrl+C`/`Ctrl+V` no viewport (World ou Local); chaves: Copy/Paste no Dopesheet |
| Papel de cebola | view **Ghosting** |
| Mostrar/esconder | ponto de visibilidade na **Tree** (só editor, sem chave) · `Ctrl+H` mostra tudo |
| Travar | não há. Equivalente: desmarcar a caixa **Select** do osso/anexo |
| Malha | propriedades do anexo → *Mesh* → *Edit Mesh* |
| Pesos | view **Weights** + ferramenta Weights (G) |
| IK e outras regras | Tree → *New…* → IK/Transform/Path/Physics/Slider |
| Peles | nó **Skins** → *New…* → Skin; view **Skins** |
| Eventos | nó **Events** → *New…* → Event |
| Ponto · caixa · máscara · caminho | Tree → *New…* → Point / Bounding Box / Clipping / Path |
| Partículas | **não existe** |
| Exportar dados | menu → Export (Ctrl+E): JSON ou Binary; *Pack* faz o atlas junto |
| Exportar imagem/vídeo | mesmo Export: GIF, PNG, APNG, PSD, JPEG, AVI, MOV |

Não consegui ler: `spine-tips` (carrega por JavaScript).

---

# PARTE C — A comparação, um assunto por vez

**Como ler.** `—` = o programa não tem a função. *não achei* = a fonte não diz.
*não pesquisado* = não pedi essa pergunta à fonte (não invento).
**A última coluna é minha leitura**, não fato da fonte: *"sim"* quer dizer que a função está
onde uma pessoa que abriu os outros programas não a procuraria.
Abreviações: **Sp** Spriter · **Sn** Spine · **DB** DragonBones.

## C.1 Começar

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Projeto novo | File → New Project. **Pede a pasta raiz** | menu *Spine* → New Project | botão Novo (Ctrl+N) | Arquivo → Novo projeto · botão Novo | não |
| Ligar a pasta de imagens | é o mesmo passo do New Project | nó **Images** da Tree → pasta | painel **Recursos** → importar / abrir pasta | Arquivo → **Abrir pasta do projeto…** (passo à parte) | **sim**: são dois passos, e o segundo é o 3º de sete itens de abrir |
| Abrir arquivo | File → Open Project | menu → Open Project · barra de título | botão Abrir | Arquivo → Abrir projeto… · botão Abrir | não |
| Abrir outro corpo · entidade · recente · o fechado · o herói | Open Recent | Recent Projects ▸ | — | **cinco** itens de Arquivo: Abrir outro corpo · Abrir uma entidade · Abrir recente · Reabrir o fechado · Abrir o herói | **sim**: sete itens de abrir no mesmo menu, com o Abrir projeto e o Abrir pasta |
| Salvar | File → Save (+ Save New Version) | menu · barra de título | botão Salvar | Arquivo → Salvar · botão Salvar | não |
| Configurações | Edit → Settings… | menu → Settings (F12) | File → Preferences | **duas**: Arquivo → Configurações do projeto · Editar → Preferências | **sim**: duas portas de "configurar" em dois menus |
| Tela de boas-vindas | — | envelope na barra de título | — | tela do documento vazio | não |
| Desfazer · refazer | Edit · ícones | barra de título | botões do sistema | Editar · botões da barra de ações | não |
| Ver o que o programa não entendeu | — | — | — | Ajuda → Problemas do arquivo… | não |
| **Achar um comando pelo nome** | — | — | — | Ajuda → **Paleta de comandos** (Ctrl+Shift+P) | não (só o nome é de programador) |

## C.2 Imagens e pivô

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Ver as imagens da pasta | **Palette → Files** (direita, em cima) | nó Images da Tree | painel Recursos (só em montagem) | aba **Imagens** (direita, 1ª aba) | não: bate com o Spriter |
| Pôr a imagem na cena | **arrastar** da Palette | **arrastar** ao viewport | **arrastar** ao viewport ou à Árvore | arrastar da aba Imagens · **Esqueleto → Novo → "Imagem no slot…"** | **sim**: a porta do menu usa a palavra *slot* e mora em "Novo" |
| Definir o pivô | **duplo clique** na imagem (Palette) | *não achei* | *não achei* | aba Imagens, botão direito → Definir pivô · aba **Pivôs** · janela de pivô · *Carimbar pivôs* · nenhum item de menu | **sim**: quatro caminhos, nenhum no menu |
| Copiar o pivô para várias imagens | Copy / Paste Default Pivots (Palette) | *não achei* | *não achei* | aba Imagens (botão direito → copiar/colar pivô) · "repetir para a pasta" na janela | não |
| Recarregar as imagens | Reload All Images (Palette) | *não pesquisado* | atualizar (Recursos) | aba Imagens → Recarregar | não |
| Trocar a imagem de um desenho | clique direito na Palette (vale dali para frente) | *não pesquisado* | *não pesquisado* | **quatro**: Esqueleto → Opções do desenho… · campo Imagem em Propriedades · botão direito no desenho · aba Imagens → Usar no desenho escolhido | **sim**: espalhado |
| Imagens numeradas viram sequência | no site (Pro): *não achei como* | — | — | aba Imagens, cabeçalho da subpasta → *Trazer como sequência* | não |
| Imagem de referência (papel atrás) | *não pesquisado* | *não pesquisado* | *não pesquisado* | botão da barra de ações · Exibir → Imagem de referência… | não |

## C.3 Ossos e montagem

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Criar osso | **Alt+arrastar**, seletor "create bone" na Palette | ferramenta **Create** (N), só em Setup | ferramenta de osso (N) | ferramenta **Criar osso (B)** na barra · Esqueleto → Novo → Osso | não |
| Prender a imagem ao osso | segurar **B** e clicar no sprite | **Create + Ctrl**, ou `P`, ou arrastar na Tree | arrastar a imagem para o osso na Árvore | criar osso com desenhos escolhidos (ele pega) · arrastar na Árvore | não |
| Trocar o pai de um osso | Hierarchy | `P` ou arrastar na Tree | Árvore (arrastar) | Esqueleto → *Virar filho de…* (P): **o item só diz a frase; o gesto é segurar P e clicar** | **sim**: item de menu que não faz, só ensina |
| Hierarquia | **Hierarchy** (aba, esquerda em cima) | **Tree** (direita) | **Árvore da cena** | **Árvore** (aba, esquerda em cima) | não |
| Ordem de desenho | **Z-order** (aba, esquerda) + **Edit** → Move Up/Down/Top/Bottom + Copy Z-Order to Other Frames | nó **Draw Order** da Tree | painel **Hierarquia** (só em montagem) | aba **Ordem** + Esqueleto → Trazer/Mandar/Frente/Fundo + **Editar** → Copiar a ordem na animação | **sim**: o Spriter junta as cinco no Edit; aqui quatro estão em Esqueleto e a quinta em Editar |
| Ver e travar ossos/desenhos | 4 botões em **texto** acima da cena (7 8 9 0) | ponto na Tree · caixa *Select* | chaves Display/Optional na barra | os mesmos 4 botões em texto (barra de ações) · **Ver** em Exibir · **Travar** em Esqueleto | **sim**: no menu, ver e travar estão em dois menus |
| Ponto · caixa de colisão | seletor Alt+Click (create point / box) | Tree → New… → Point / Bounding Box | não achei como criar caixa | ferramentas Ponto (O) e Caixa (X) · Esqueleto → Novo | não |
| Máscara (clipping) | — | Tree → New… → Clipping | — | Esqueleto → Novo → Máscara (só no menu) | não |
| Eixos e compensar | — | na **barra de ferramentas** (Local/Parent/World · Bones/Images) | — | barra de ações (Eixos) · Esqueleto → Compensar ▸ · Eixos das alças ▸ · Propriedades | não |
| Voltar à pose de repouso | — | *não pesquisado* | — | Esqueleto → Voltar à pose de repouso | não |
| Buscar na hierarquia | — | busca na Tree | busca na Árvore | Editar → Buscar na Árvore (Ctrl+F) · lupa na Árvore | não |

## C.4 Animar

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Trocar entre montar e animar | — (não há modo no texto) | ícone **Setup / Animate**, no viewport | **barra de modo** (montagem ⇄ animação) | **não há modo.** O rodapé diz *Base:* ou *Animação:*. A saída é clicar no corpo na aba Animações, ou Animação → *Abrir a base* | **sim**: o único degrau que os dois outros deixam à vista, aqui está escondido |
| Criar animação | ícones no painel **Animations** | nó Animations da Tree → New… | painel **Animações** (só em modo animação) | Animação → Nova animação · aba Animações (+) | não |
| Pôr chave | editar em outro tempo já cria a chave | botão de chave por propriedade · `K` · **Auto Key** | botão *adicionar chave* · `K` · chave automática | **editar sempre grava**. Animação → Chavear (K) · Chavear tudo | não |
| Chave só do escolhido × de tudo | **key selected / key all** (na Timeline) | *Key Shown* | — | Animação → Chavear · Chavear tudo | não |
| Curva da chave | **clique direito** na chave: Instant/Linear/Custom | view **Graph** | botão de curva na barra da timeline | Animação → Curva da chave ▸ · aba **Curvas** (faixa de baixo) · botão direito no losango | não |
| Tocar · voltar · quadro a quadro | 5 botões na Timeline | view Playback | botões de reprodução | Animação → Tocar… (Espaço) · tocador na linha do tempo | não |
| Copiar e colar pose | **Edit** → Copy Current Frame · Paste To All Keys | Ctrl+C/V no viewport · Copy/Paste no Dopesheet | botões copiar/recortar/colar | **Editar** (4 itens) + **Animação** → Copiar a pose do escolhido · Colar espelhado | **sim**: cópia de pose em dois menus |
| Papel de cebola | clique direito e arrastar na Timeline | view **Ghosting** | botão na barra de edição de quadro | Exibir → Casca de cebola (+ opções) · caixa na régua da linha do tempo | não (só o nome: *casca*, e não *papel*) |
| Prévia | — (não achei) | view **Preview** | botão Prévia (navegador) | aba **Prévia** (direita, grupo das Imagens) | **decisão do Humberto**: ele mandou a Prévia para lá (lote 25). Registro, não achado |
| Eventos | clique direito nos nomes da Timeline | nó **Events** da Tree | camada de evento na Timeline | Esqueleto → Novo → **Evento** (criar) · linha do tempo (pôr a chave) | **sim**: cria em "Esqueleto", usa em "Animação" |
| Variáveis e etiquetas (tags) | **Timeline**: linha "meta data" → Edit MetaData | — | — | Esqueleto → Novo → **Variável / Etiqueta** · Esqueleto → Variáveis e etiquetas ▸ · aba **Regras** | **sim**: no Spriter moram na animação; aqui, no Esqueleto e na aba de Regras |
| Marcas e trecho de laço | — | Dopesheet: Loop Start/End | — | Animação → Marcas ▸ · Trecho de laço ▸ | não |
| Efeitos de chave (Flash, Pulso, Tremor) | — | — | — | Animação → **Efeitos ▸** | **sim**: a palavra *Efeitos* leva quem procura partícula para o menu errado |
| Espelhar, fechar ciclo, esticar | — | *não achei* espelhar | — | Animação (menu) e **⋯ Mais** da linha do tempo | não |
| Som | WAV na Timeline | Audio (nó e view) | — | *não pesquisado no nosso* | — |

## C.5 Malha e pesos

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Virar malha | **— não existe** | propriedades do anexo → *Mesh* → **Edit Mesh** | slot → **Convert to Grid** | ferramenta **Malha (M)** na barra · aba **Malha e pesos** → *Virar malha* | **sim**: nenhum item de menu |
| Editar vértice e aresta | — | Edit Mesh: Modify/Create/Delete | editor de grade: Edit (Q) · Add (W) · Delete (E) · Edge | aba Malha e pesos · ferramenta Malha (L liga, K desliga, Delete apaga) | **sim**: só dentro do painel |
| Gerar malha automática | — | botões *Generate* e *Trace* | *não achei* | aba Malha e pesos → *Gerar automática* · *Traçar contorno* | **sim**: só dentro do painel |
| Ligar ossos e pesos | — | view **Weights** + ferramenta Weights (G): Bind, Auto, Smooth, Prune | *Bind Bone*, cálculo automático, ferramenta de pizza | ferramenta **Pesos (G)** · aba Malha e pesos → *Pesos automáticos · Suavizar · Podar · Chavear pesos · Pincel* | **sim**: só dentro do painel |
| Ver a malha na cena | — | opções do viewport | — | Exibir → **Malhas · Arestas · Pesos** (só ver) | não |
| Onde a aba mora | — | view aberta pela caixa **Views** | painel de Propriedades | direita, grupo 2, **5ª e última aba** (depois de Histórico) | **sim**: montagem no fim da fila do tempo |

## C.6 Peles

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Onde se cuida das peles | botão **Char Maps**, no painel Animations → janela | nó **Skins** da Tree + view **Skins** | *não achei* painel | aba **Peles** (direita, grupo 2, 2ª aba) | não |
| Criar pele | botão *Create New Character Map* | Tree → New… → Skin | — | Esqueleto → Novo → **Pele** · aba Peles (+) | leve: 1 de 13 itens de "Novo" |
| Vestir (ligar na pilha) | arrastar de *Available* para *Active* | ponto = skin ativa | — | arrastar de *Feitas* para *Ativas* (aba Peles) | não |
| Salvar / levar a outro boneco | salvar `.scms` (janela) | — | — | Esqueleto → **Exportar pele… · Importar pele… · Promover pele a base…** | **sim**: a pele tem aba, mas quatro portas no menu Esqueleto, e as de animação vão para o menu Animação |
| Trocar a imagem em todas as peles | — | — | — | Esqueleto → *Trocar imagem nas peles…* · botão direito na Árvore | não |

## C.7 Regras (física, IK, o que se mexe sozinho)

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| IK | Basic IK (grátis) / Full IK (Pro). Onde ligar: *não achei* | Tree → New… → **IK Constraint** | **dois botões** no painel de propriedades do osso | ferramenta **Posar (Y)** (dobra sem criar regra) · Esqueleto → Novo → **Regra…** (janela em 2 passos) · aba **Regras** | **sim**: Posar não cria regra, e isso só o rodapé diz |
| Outras regras (transformar, caminho) | — | Tree → New… → Transform / Path / Slider | — | aba Regras | não |
| Física | — | Tree → New… → **Physics constraint** | — | Esqueleto → **Física ▸** (simular, reiniciar, assar) · aba Regras | leve: *Física* em Esqueleto, campos em Regras |
| Parâmetros (o que o jogo manda de fora) | — | — | — | Esqueleto → Novo → Parâmetro · aba Regras · Árvore | não pesquisado nos outros |
| Onde a aba mora | — | nós da Tree | — | direita, grupo 2, 3ª aba | não |

## C.8 Efeitos e partículas

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Sistema de partículas | **— não existe**. O manual só cita *"particle effects"* como coisa do jogo | **— não existe**. Ganchos: *point attachment*, evento, bounding box | **— não existe** (nenhuma menção) | **existe** (extensão `BONE_particles`) | — |
| Criar o emissor | — | — | — | Esqueleto → Novo → **Emissor de partículas** (8ª de 13 entradas) · botão **Partículas** na barra da cena e **Novo** da Árvore (**novos, chat B, 23:53**) | **sim, e já em conserto** |
| Editar os campos do emissor | — | — | — | painel **Propriedades** | não |
| Ver o emissor na cena | — | — | — | a cena desenha o jorro; anel do emissor | não |
| "Ponto de onde sai" | *action point* (Alt+arrastar, create point) | *point attachment* | — | ferramenta Ponto (O) | não |
| Flash · Pulso · Tremor | — | — | — | Animação → Efeitos ▸ | **sim** (a palavra) |

**O que isto quer dizer.** Nenhum dos três programas de referência tem partícula.
Não há onde copiar a porta. A regra da casa (*"fluxo do Spriter primeiro"*) não dá resposta aqui.
A resposta tem que vir da **sequência**: o emissor é um **ponto preso ao osso** (como o *action point* do Spriter), então a porta natural é a
mesma do ponto: à vista, na barra da cena, com nome. É o que o chat B está fazendo.

## C.9 Exportar

| A função | No Spriter | No Spine | No DragonBones | No nosso | Lugar estranho? |
|:---|:---|:---|:---|:---|:---:|
| Onde fica "exportar" | **File → Export Animation To PNG/GIF…** | menu → **Export…** (Ctrl+E), **um diálogo só** | botão **Exportar** na barra do sistema (Ctrl+E) | Arquivo → **Exportar ▸** (glTF · Imagem · Por pele) · **e mais três lugares** | **sim**: ver abaixo |
| Exportar imagem / GIF / vídeo | File → Export… (diálogo com PNG, GIF, sprite sheet) | Export: GIF, PNG, APNG, JPEG, AVI, MOV | sequência de quadros (GIF e vídeo: *não achei*) | Arquivo → Exportar → **Imagem…** | não |
| Exportar dados para o jogo | o próprio Save é o `.scml` | Export: JSON ou Binary | Exportar: json/xml | Arquivo → **Salvar como binário… · Salvar como pacote… · Entregar um corpo…** (no bloco *Salvar*) | **sim**: "exportar" está no bloco *Salvar* |
| Atlas | File → Generate spritesheets… | menu → **Texture Packer** (Ctrl+P) | opções do atlas no Exportar | **nasce ao Salvar** (sem item) | não |
| Exportar uma pele | janela Character Maps | — | — | **Esqueleto** → Exportar pele… · Arquivo → Exportar → Por pele… | **sim**: duas portas, dois menus |
| Exportar uma animação | — | — | — | **Animação** → Exportar animação… | **sim**: um terceiro menu |
| Repetir a última | — | Ctrl+Shift+E | — | Arquivo → Repetir a última exportação | não |
| Importar de outro programa | — | menu → Import Project / Data / PSD | botão Importar (Ctrl+I): pasta, PNG, Zip, PSD, Spine, Cocos | Arquivo → **Importar ▸** (outro programa · PSD · PSD com ossos) | não |
| Botão de exportar à vista | — | — | **sim** (barra do sistema) | **não há** na barra de ações (só Novo · Abrir · Salvar) | leve |
| Prévia no jogo | — | view Preview | botão Prévia | aba Prévia | não |

---

# PARTE D — As três listas

Cada item: **o quê** · **por quê** (o que os outros programas fazem) · **PROPOSTA** em uma linha · **DONA**
(a parte, pelo mapa de `documentos/PARTES.md`; entre parênteses, o chat da rodada, quando há).

**Aviso sobre a dona `Casca e menus`:** `ui/menus.ts`, `ui/actions-table.ts`, `ui/keys.ts` e
`ui/layout-model.ts` são dessa parte. Quando comecei, **nenhum chat a tinha por cerca**; às 00h06 de
29/09 o `EXECUTANDO · a casca` (chat A2) assinou a tabela e assumiu a parte. Ele é a dona de todo
item "Casca e menus" abaixo. **Quem muda menu de lugar segue a ordem do Planejador; itens ⚑ esperam o Humberto.**

**Tudo aqui é proposta.** Nenhum item foi mudado. O que é decisão do Humberto está marcado ⚑.

---

## D.a — As que SÓ existem dentro de painel, sem item de menu

Sem item de menu, elas também **não têm id de ação**: a Paleta de comandos
(`Ctrl+Shift+P`) e a folha `O QUE O PROGRAMA FAZ` **não as veem**. É o caso da malha inteira.

| # | O quê | Por quê | PROPOSTA | DONA |
|:---:|:---|:---|:---|:---|
| a1 | **Malha e pesos**, ~15 botões: Virar malha · Gerar automática · Traçar contorno · vértice · aresta · Ligar ossos · Pesos automáticos · Suavizar · Podar · Chavear pesos · Pincel · Malha ligada | O Spine e o DragonBones também põem a malha em painel/ferramenta, **mas** a ferramenta está na barra e o painel abre por menu (Views / *Convert to Grid*). Aqui só a ferramenta (M, G) e a aba | Dar **id de ação** aos seis botões principais e um submenu **Esqueleto → Malha ▸** que chama as mesmas funções. Assim a Paleta e a folha os veem | Malha e pivô (chat D) + Casca e menus |
| a2 | **Pivô**: janela, aba Pivôs, *Carimbar pivôs*, "repetir para a pasta" | No Spriter é **duplo clique na imagem**. Aqui são quatro caminhos, e só a aba entra no menu Janela | Um item **"Definir pivô…"** (abre a janela para a imagem escolhida) e **"Carimbar pivôs"**, no menu Esqueleto ou Arquivo | Imagens e pasta (chat H) + Casca |
| a3 | Aba **Imagens**: Recarregar · Trocar origem · Trazer como sequência · Duplicar no atlas | O Spriter tem *Reload All Images* na Palette, sem item de menu. **Igual à referência** | Só o **Recarregar** e o **Trocar origem** merecem id de ação (a Paleta acha) | Imagens e pasta (chat H) |
| a4 | **"No fim"** da animação (parar · repetir · vai-e-volta · voltar ao início): só no **⋯ Mais** da linha do tempo. O menu tem só *Repetir* | O Spine põe Loop Start/End no Dopesheet, também sem menu | O menu Animação ganha **"No fim…"** ao lado de Repetir | Linha do tempo (chat D) + Casca |
| a5 | **Peles**: duplicar · apagar · renomear · fazer de uma pasta · o lápis | O Spriter faz tudo na janela Character Maps. Igual | Um submenu **Esqueleto → Peles ▸** reunindo as portas de pele que já estão no menu (ver b6) e as que faltam | Ficha, propriedades, exibição, peles, regras, histórico (chat I) + Casca |
| a6 | **Regras**: apagar regra · ligar/desligar (olho) · apagar parâmetro. As quatro sem porta estão com o chat C | O Spine cria e apaga na Tree | Conferir se **Editar → Apagar (Delete)** apaga a regra escolhida; se não, item próprio | Regras (chat C) |
| a7 | **Prévia** (tela cheia F11, mistura de camadas) e **Histórico** (clicar volta passos) | O DragonBones tem botão de Prévia na barra; o Spriter tem a aba History **só em painel** | Sem proposta para o Histórico (igual ao Spriter). ⚑ Um botão **Prévia** na barra de ações, como no DragonBones, é decisão do Humberto | Ficha… histórico (chat I) / Casca |
| a8 | **Gestos sem botão**: Alt+clique cicla os sobrepostos · Ctrl/Alt no Criar osso · segurar P | O Spriter também é assim (B+clique, Alt+arrastar) | Nada: já estão na dica da ferramenta e no rodapé. Conferir só se entram em **Ajuda → Atalhos** | Casca e menus |

---

## D.b — As que estão em MENU ONDE NINGUÉM PROCURARIA

| # | O quê | Onde está hoje | Por quê | PROPOSTA | DONA |
|:---:|:---|:---|:---|:---|:---|
| b1 | **Emissor de partículas** | Esqueleto → Novo (8ª de 13 entradas) | Nenhum dos três tem partícula: **não há modelo**. Quem procura *efeito* vai a **Animação → Efeitos** (que é outra coisa) | O **botão à vista na cena** (chat B, no código desde 23:53) e **uma linha em Animação → Efeitos** ("Partículas — emissor pronto") chamando o mesmo modelo | Ficha, propriedades… (chat B) + Casca |
| b2 | **"Imagem no slot…"** | Esqueleto → Novo | *Slot* é palavra do formato. No Spriter, Spine e DragonBones o gesto é **arrastar** | Renomear para **"Pôr imagem na cena…"**, mesmo id | Casca e menus |
| b3 | **Variável** e **Etiqueta** | Esqueleto → Novo, e Esqueleto → Variáveis e etiquetas ▸ | No Spriter moram na **animação** (linha "meta data" da Timeline) | Levar o grupo para **Animação → Variáveis e etiquetas ▸** | Casca e menus + Regras (chat C) |
| b4 | **Evento** | Esqueleto → Novo (cria); a chave se põe na linha do tempo | Spriter: clique direito na Timeline. DragonBones: camada de evento | Repetir **"Novo evento"** em Animação, ao lado das Marcas | Casca e menus + Linha do tempo (chat D) |
| b5 | **Efeitos ▸** (Flash · Pulso · Tremor) | Animação | A palavra *efeito* leva à partícula. São **atalhos de chaves** | Renomear **"Efeitos de chave"** e pôr na dica: *"Partículas: Esqueleto → Novo"* | Casca e menus |
| b6 | **Peles**: Nova pele em *Novo* · Exportar / Importar / Promover / Trocar imagem em *Esqueleto* · Exportar/Importar **animação** em *Animação* | dois menus | Spriter: peles e animações são **vizinhas** (botão Char Maps no painel Animations) | O submenu **Peles ▸** (a5). Animação → Exportar/Importar ficam onde estão | Casca e menus + peles (chat I) |
| b7 | **"Exportar" em quatro lugares**: Arquivo → Exportar ▸ · Arquivo → Salvar como binário / pacote / Entregar um corpo (no bloco *Salvar*) · Esqueleto → Exportar pele · Animação → Exportar animação | quatro menus | Spine: **um diálogo só**, Ctrl+E. DragonBones: **um botão**. Spriter: **um item** em File | ⚑ Um **Arquivo → Exportar ▸** único, com dois blocos (*Para o jogo* · *Para outro boneco*). Os itens antigos ficam **até o Humberto dizer** que podem sair | Casca e menus + Arquivo, exportar, importar (chat E) |
| b8 | **Sete itens de abrir** no Arquivo | Arquivo | Spriter e Spine: Open + Recent | Reunir *Abrir outro corpo* e *Abrir uma entidade* em **"Trazer para o projeto ▸"**; *Abrir recente* e *Reabrir o fechado* juntos | Casca e menus |
| b9 | **Duas configurações** | Arquivo → Configurações do projeto · Editar → Preferências | Spriter: **Edit → Settings**. Spine: **Settings (F12)**. Um só lugar | Uma janela **Configurações** com duas abas *(Projeto · Programa)*; um só item | Casca e menus |
| b10 | **Ver** e **Travar** em menus diferentes | Ver: Exibir. Travar: Esqueleto | Spriter: os quatro botões **juntos**. A nossa barra de ações já os junta | Mover os cinco *Travar* para **Exibir → Travar ▸** | Casca e menus |
| b11 | **Ordem de desenho**: quatro em Esqueleto, **"Copiar a ordem na animação" em Editar** | dois menus | Spriter: as cinco juntas em **Edit** | Pôr a quinta ao lado das outras quatro | Casca e menus |
| b12 | **Copiar pose**: Editar (4) e Animação (2: *Copiar a pose do escolhido*, *Colar espelhado*) | dois menus | Spriter: tudo em **Edit** | Levar os dois de Animação para Editar | Casca e menus |
| b13 | **"Virar filho de…"** | Esqueleto | O item **só ensina** ("segure P e clique"); não faz. É item de menu que não é porta | Fazê-lo **ligar o gesto** (o rodapé pede o clique no filho) | Cena (chat F) + Casca |
| b14 | **Novo ▸ com 13 entradas** misturadas: o que se vê na cena · o que se anima · roupa · regra | Esqueleto | Spine: cada tipo sai do nó da Tree onde ele mora | Partir em blocos por tarefa (ver c3) | Casca e menus |

---

## D.c — A ORDEM: os menus e painéis seguem a ordem do trabalho?

**A ordem do trabalho, pelo Spriter** (B.1.4): *arte → pivô → cena → ordem → ossos → animar → tempo → peles → exportar*.
O Spine e o DragonBones somam **malha e pesos entre ossos e animar** (B.3.5 e B.2.4).

| # | O que confere | Segue? | Onde não segue · a ordem certa · PROPOSTA | DONA |
|:---:|:---|:---:|:---|:---|
| c1 | **Ordem dos menus** (Arquivo · Editar · Exibir · Esqueleto · Animação · Janela · Ajuda) | **em parte** | *Esqueleto → Animação* segue o trabalho. **Exibir** (olhar) está **antes** de quem faz. Certa: Arquivo · Editar · Esqueleto · Animação · **Exibir** · Janela · Ajuda. **PROPOSTA:** mover Exibir para depois de Animação | Casca e menus |
| c2 | **Ordem dentro de Arquivo** | **não** | Hoje: 7 abrir · 6 salvar · Importar/Exportar · Repetir · Configurações · Sair. A arte **entra** por Importar, que vem depois de Salvar. Certa: abrir → **importar** → salvar → **exportar**. **PROPOSTA:** Importar logo depois de *Abrir pasta*; Exportar depois do bloco Salvar | Casca e menus |
| c3 | **Ordem dentro de Esqueleto** | **não** | Hoje: Novo · Peles · Física · Virar filho · Ordem · Pastas · Travar · Repouso · Compensar. Peles e física (**o fim** da montagem) vêm **antes** de hierarquia e ordem (**o meio**). Certa: **Novo (osso, imagem, ponto, caixa, máscara) · Virar filho · Ordem e pastas · Malha ▸ · Regras e física · Peles ▸ · Travar · Repouso · Compensar**. **PROPOSTA:** reordenar os blocos | Casca e menus |
| c4 | **Janela → blocos** (montar · animar · olhar) | **não** | Dentro de *montar*: Árvore, Ordem, Propriedades, **Imagens**, Entidades, **Pivôs** — a arte (Imagens, Pivôs) deveria abrir a lista. **Malha e pesos** está em *olhar* (é montagem). **Peles** está em *animar*, mas o menu Esqueleto a trata como montagem. Certa: **montar** = Imagens · Pivôs · Entidades · Árvore · Ordem · Malha e pesos · **animar** = Animações · Linha do tempo · Curvas · Peles · Regras · **olhar** = Propriedades · Exibição · Prévia · Histórico. **PROPOSTA:** trocar o `WINDOW_GROUPS` | Casca e menus |
| c5 | **Colunas: direita, grupo 2** (Animações · Peles · Regras · Histórico · **Malha e pesos**) | **não** | **Malha e pesos é a última aba**, depois de Histórico. É passo de **montar**, e o Spine/DragonBones a põem **antes** de animar. É também a aba que **não cabe** (faltam 150 a 450 px). **PROPOSTA:** ⚑ tirá-la do grupo 2 — para junto de Árvore/Ordem (esquerda) ou para a faixa de baixo. Decisão de lugar é do Humberto | Casca e menus (`layout-model.ts`) + Malha e pivô (chat D) |
| c6 | **Colunas: direita, grupo 1** (Imagens · Entidades · Pivôs · Exibição · Prévia) | **sim** | Imagens → Pivôs segue o Spriter (passos 4 e 5). A **Prévia** ali foi decisão do Humberto (lote 25): **não mexer** | — |
| c7 | **Coluna esquerda** (Árvore · Ordem / Propriedades) | **sim** | Igual ao Spriter (Hierarchy · Z-order / Object Properties) | — |
| c8 | **Barra de ações** (Arquivo · Editar · Ferramentas · Eixos · Exibir · Ver e travar) e a **ordem das 12 ferramentas** | **sim** | Igual ao Spriter (ícones · ferramentas · 4 botões de texto). Ferramentas por gesto: as que mexem, depois as que criam, depois malha e pesos | — |
| c9 | **Novo projeto → pasta de imagens** | **não** | No Spriter é **um passo só**: *New Project pede a pasta raiz*. Aqui são dois itens, no meio de sete de abrir | ver c10 |
| c10 | **PROPOSTA de c9** | — | Ao terminar **Novo projeto**, oferecer *"Abrir a pasta de imagens agora?"* (mesma porta de Abrir pasta do projeto) | Arquivo, exportar, importar (chat E) + Casca |
| c11 | **A saída da animação** (voltar a montar) | **não** | Spine e DragonBones têm um **controle de modo à vista**. Aqui o modo saiu (decisão M4). A saída é clicar no corpo na aba Animações, ou Animação → *Abrir a base*. **É a "panela" do Humberto.** **PROPOSTA:** ⚑ **sem** recriar modo: rotular na aba Animações a linha do corpo como *"Base — montar"* e a lista como *"Animações"*, e a dica do rodapé apontar a porta (já aponta) | Animações (chat G) |
| c12 | **Animação (menu) tem ~50 itens** | **em parte** | A ordem interna segue (lista → biblioteca → duração → tocar → chavear → apagar → curva → marcas → efeitos → espelhar). O tamanho é que cansa | **PROPOSTA:** juntar *Nova · Duplicar · Renomear · Apagar · Mandar para o topo · Exportar · Importar · Biblioteca* em **Animações ▸** | Casca e menus |

---

## Os cinco ⚑ que precisam do Humberto

| ⚑ | Pergunta, em uma linha |
|:---:|:---|
| 1 | **Exportar num lugar só** (b7): quer um único *Arquivo → Exportar ▸*, deixando os itens antigos até ele dizer? |
| 2 | **Malha e pesos** (c5): em que lugar a aba mora — com Árvore/Ordem, ou na faixa de baixo? |
| 3 | **Botão Prévia** na barra de ações (a7)? |
| 4 | **Rótulo *Base — montar*** na aba Animações (c11) no lugar do modo que saiu? |
| 5 | **Exibir para depois de Animação** (c1): a barra de menus troca de ordem? |

---

## Limites deste documento

| O quê | Como ficou |
|:---|:---|
| Não abri o programa na tela | "Estranho" é leitura do **código** e das folhas, não do que se vê. Nenhuma foto |
| Contagem de itens por menu | só onde o próprio código a diz (Esqueleto ~29, Animação ~50) |
| Spriter: Window, View, Modes, Help | **não achei** os itens: a comparação de Exibir e Janela usa o que há no Spine e no DragonBones |
| Perguntas que eu não fiz à fonte | marcadas *não pesquisado* (trocar imagem no Spine e no DragonBones, som, referência) |
| `menus.ts` mudou por outro chat? | Conferi às 00:18: sem mudança desde a leitura. O botão Partículas (chat B) é o único item novo |
