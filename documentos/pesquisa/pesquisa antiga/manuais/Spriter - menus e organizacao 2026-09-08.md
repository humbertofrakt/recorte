# Spriter Pro — como o programa organiza suas funções

Pesquisa feita direto no manual oficial (BrashMonkey). Sem opinião: só o que o
manual diz. Onde o manual não fala algo, isso está marcado como "não
encontrado".

## 1. Fonte

Lido em 08/09/2026, todas as páginas do manual oficial do Spriter Pro
(versão 1.4), hospedado em brashmonkey.com:

| Página | URL |
|:---:|:---:|
| Índice do manual | https://brashmonkey.com/spriter_manual/index.htm |
| O que é o Spriter | https://brashmonkey.com/spriter_manual/what%20is%20spriter.htm |
| Começando (Quickstart) | https://brashmonkey.com/spriter_manual/getting%20started.htm |
| Iniciando um projeto | https://brashmonkey.com/spriter_manual/starting%20a%20project.htm |
| Pivôs padrão | https://brashmonkey.com/spriter_manual/default%20pivot%20points.htm |
| Colocar sprite na tela | https://brashmonkey.com/spriter_manual/placing%20a%20sprite.htm |
| Ajustar z-order | https://brashmonkey.com/spriter_manual/adjusting%20z%20orders.htm |
| Criar e atribuir ossos | https://brashmonkey.com/spriter_manual/creating%20and%20assigning%20bones.htm |
| Animar sprites e ossos | https://brashmonkey.com/spriter_manual/animating%20sprites%20and%20bones.htm |
| Trocar imagem do sprite | https://brashmonkey.com/spriter_manual/swapping%20the%20image%20of%20a%20sprite.htm |
| Editar tempo do keyframe | https://brashmonkey.com/spriter_manual/editing%20timing.htm |
| Timeline avançada | https://brashmonkey.com/spriter_manual/advanced%20timeline%20editing.htm |
| Duplicar keyframes inteiros | https://brashmonkey.com/spriter_manual/duplicating%20entire%20keyframes.htm |
| Adicionar sprites depois de pronto | https://brashmonkey.com/spriter_manual/adding%20additional%20sprites%20to%20an%20animation.htm |
| Key All vs Key Selected | https://brashmonkey.com/spriter_manual/key%20all%20vs%20key%20selected.htm |
| Efeitos sonoros | https://brashmonkey.com/spriter_manual/adding%20sound%20effects.htm |
| Papagayo (lip sync) | https://brashmonkey.com/spriter_manual/papagoyo%20support.htm |
| Caixas de colisão | https://brashmonkey.com/spriter_manual/adding%20collision%20rectangles%20to%20frames.htm |
| Action Points | https://brashmonkey.com/spriter_manual/adding%20spawning%20points%20to%20frames.htm |
| O que são Character Maps | https://brashmonkey.com/spriter_manual/what%20are%20character%20maps.htm |
| Criar um Character Map | https://brashmonkey.com/spriter_manual/create%20a%20character%20map%20and%20assign%20effects.htm |
| Ativar/empilhar Character Maps | https://brashmonkey.com/spriter_manual/activating%20and%20stacking%20character%20maps.htm |
| Salvar stack como arquivo de personagem | https://brashmonkey.com/spriter_manual/saving%20character%20map%20sets%20as%20character%20files.htm |
| Suporte a TexturePacker | https://brashmonkey.com/spriter_manual/texturepacker%20support.htm |
| Clone com atlas de textura | https://brashmonkey.com/spriter_manual/creating%20a%20clone%20of%20your%20project%20that%20uses%20texture%20atlases.htm |
| Recorte customizado por animação | https://brashmonkey.com/spriter_manual/creating%20custom%20trimming%20settings%20for%20each%20animation.htm |
| Cores customizadas (paleta indexada) | https://brashmonkey.com/spriter_manual/using%20spriters%20custom%20color%20features.htm |
| Exportar como imagens/GIF | https://brashmonkey.com/spriter_manual/exporting%20animations%20as%20images%20or%20gifs.htm |
| Variáveis na animação | https://brashmonkey.com/spriter_manual/adding%20variables%20to%20an%20animation.htm |
| Tags na animação | https://brashmonkey.com/spriter_manual/adding%20tags%20to%20an%20animation.htm |
| Gatilhos de evento | https://brashmonkey.com/spriter_manual/adding%20event%20triggers%20to%20an%20animation.htm |
| Clone em escala | https://brashmonkey.com/spriter_manual/creating%20a%20scaled%20clone%20of%20an%20entire%20project.htm |
| Clone colorido | https://brashmonkey.com/spriter_manual/colored%20clones%20of%20your%20project.htm |
| Exportação em lote | https://brashmonkey.com/spriter_manual/batch%20exporting%20animations%20from%20character%20files.htm |
| Importar projeto dentro de outro | https://brashmonkey.com/spriter_manual/importing%20one%20spriter%20project%20into%20another.htm |
| Mouse e atalhos de teclado | https://brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm |
| Agradecimentos | https://brashmonkey.com/spriter_manual/acknowlegements.htm |

Páginas com problema:
- `http://www.brashmonkey.com/spriter_manual/...` (com "www", sem "https")
  redirecionou errado para o site do Aseprite em pelo menos uma página
  (mouse and keyboard controls). A versão `https://brashmonkey.com/...`
  (sem "www") funcionou normal e foi a usada aqui.
- `https://brashmonkey.com/spriter_manual/` (a pasta, sem nome de arquivo)
  devolveu erro 403 pela ferramenta de leitura direta; o conteúdo foi lido
  pelo `index.htm` acima, que é a página de índice de fato.

Spriter 2: pesquisei se existe manual publicado do Spriter 2 (o sucessor,
ainda em Kickstarter/beta). Não encontrei site de documentação do Spriter 2
até 08/09/2026. Existe só um anúncio de que a interface dele vai mudar (sair
de menus escondidos em clique-direito para tudo visível na tela), mas sem
manual publicado para ler. Por isso este documento é 100% sobre o Spriter
Pro (o programa atual, versão 1.4).

## 2. Barra de menus

O manual do Spriter Pro **não tem uma página dedicada à barra de menus**.
Ele não lista File/Edit/View/Animation/Help com todos os itens. Os únicos
comandos de menu que aparecem são citados de passagem, dentro da explicação
de outras tarefas. Segue exatamente o que foi encontrado — não é lista
completa dos menus, é só o que o manual menciona.

### Menu File (Arquivo) — comandos citados

| Comando citado no manual | Atalho | Onde aparece |
|:---:|:---:|:---:|
| New Project (Novo Projeto) | Ctrl+N | Iniciando um projeto |
| Export To PNG (Exportar para PNG) | não citado | Exportar como imagens/GIF |
| Export Animation to PNG/GIF | não citado | Exportação em lote |
| Generate spritesheets for project images | não citado | Suporte a TexturePacker |
| Generate TexturePacker Spritesheet file (*.tps) | não citado | Suporte a TexturePacker |
| Other File Actions / Import Another Project Into Current | não citado | Importar projeto dentro de outro |

Nota: "Export To PNG" e "Export Animation to PNG/GIF" aparecem em duas
páginas diferentes do manual descrevendo aparentemente a mesma ação, com
nomes levemente diferentes. Isso é do próprio manual, não é erro desta
pesquisa.

### Menu Edit (Editar) — comandos citados

| Comando citado no manual | Atalho | Onde aparece |
|:---:|:---:|:---:|
| Paste to All Keys (Colar em Todas as Chaves) | Ctrl+Shift+V | Adicionar sprites depois de pronto |
| Copy Z-order To All Keyframes / Copy Z-Order to Other Frames | não citado | Ajustar z-order; Adicionar sprites depois de pronto |

### Menu View, Animation, Help

Não encontrado. Nenhuma das páginas lidas cita um comando desses três
menus pelo nome. Isso não significa que eles não existam no programa — só
que o manual não os documenta em texto.

## 3. Barra de ferramentas

O manual descreve uma seção chamada "Currently Equipped Tool" (Ferramenta
Atualmente Equipada), dentro do painel de arquivos, no canto superior
direito da tela.

| Ferramenta | O que faz | Onde fica |
|:---:|:---:|:---:|
| (padrão / seleção) | Selecionar, mover, girar e esticar sprites e ossos na tela | Ativa por padrão, sem nome citado |
| Create Box (Criar Caixa) | Muda o Alt+arrastar para criar caixa de colisão em vez de osso | Seção "Currently Equipped Tool", topo do painel de arquivos |
| Create Point (Criar Ponto) | Muda o Alt+arrastar para criar Action Point em vez de osso | Seção "Currently Equipped Tool", topo do painel de arquivos |
| Copy Default Pivots | Copia o pivô padrão de uma imagem selecionada | Seção "Currently Equipped Tool" |
| Paste Default Pivots | Cola o pivô padrão copiado nas imagens selecionadas | Seção "Currently Equipped Tool" |

Não encontrado: o manual não descreve uma "barra de ferramentas" separada
com ícones de câmera, régua, etc. Só essa seção de ferramenta equipada.

## 4. Painéis (palettes)

| Painel | Onde fica (padrão) | O que contém |
|:---:|:---:|:---:|
| File Palette (paleta de arquivos) | Canto superior direito | Pastas e imagens PNG do projeto; arrastar para a tela; clique direito troca imagem de um sprite selecionado; toca prévia de som (arquivos WAV) |
| Canvas (tela) | Centro | Área de montagem do quadro; cruz no centro marca o ponto 0,0 |
| Z-order Palette | Canto superior esquerdo | Lista de sprites/ossos em ordem de desenho; arrastar reordena; duplo-clique no nome renomeia (inclusive caixas de colisão e action points) |
| Object Properties (propriedades do objeto) | Canto inferior esquerdo | Atributos do item selecionado: posição, ângulo, escala, opacidade |
| Animations Palette (paleta de animações) | Canto inferior direito | Lista de entidades (personagens) e animações; duplo-clique renomeia; botão "CharMaps"; botões "Key All" e "Key Selected" |
| Character Maps Palette | Aberta pelo botão "CharMaps" | Coluna "Available" (disponível) e "Active" (ativo); arrastar entre colunas ativa/desativa um mapa; botão para criar novo mapa; ícone de disco salva o stack; ícone de pasta carrega arquivo de personagem (.scms) |
| Edit Character Map | Aberta ao criar/editar um Character Map | Coluna esquerda = imagens originais do personagem; coluna direita = imagens de troca; botões "Set Ignored" e "Set Hidden" |
| Color Palette Dialogue | Ícone de paleta de pintura, dentro do Character Maps | Lista de imagens de paleta de cor (pasta `_palettes`) para aplicar variações de cor indexada |
| Timeline (linha do tempo) | Parte de baixo da tela | Quadros-chave da animação; pode expandir para cima e mostrar uma linha por objeto e uma linha de "meta data" (variáveis, tags, eventos); ícone de alto-falante alterna mudo/toca-normal/toca-durante-arraste do som |
| Hierarchy (hierarquia) | Não descrito | Citado só na lista de atalhos, como um painel onde o zoom com Ctrl+roda funciona. O manual não descreve o conteúdo dele em nenhuma outra página lida |

## 5. Tocador (playback)

Fica na Timeline, embutido nela — não é uma janela separada.

| Tecla | Ação |
|:---:|:---:|
| 3 | Rebobinar até o início |
| 4 | Reproduzir (Play) |
| 5 | Avançar rápido até o fim |

Também na Timeline: um controle deslizante ("playback speed slider") do
lado esquerdo, para pré-visualizar a animação em velocidades diferentes.

Não encontrado: botão de loop/repetição. O manual não cita nenhum botão
ou tecla de "loop" ou "repeat" em nenhuma das páginas lidas.

## 6. Zoom e navegação da cena

| Ação | Tecla / mouse |
|:---:|:---:|
| Zoom normal na tela | Roda do mouse (sem Ctrl), na área de trabalho |
| Zoom rápido na tela | Ctrl + roda do mouse, na área de trabalho |
| Zoom nos painéis (Timeline, Hierarchy, Z-order, File Palette, Object Palette) | Ctrl + roda do mouse, dentro do painel |
| Aproximar zoom (sem roda) | Ctrl + Espaço |
| Afastar zoom (sem roda) | Ctrl + Alt + Espaço |
| Restaurar zoom para 100% | Ctrl + Alt + Shift + Espaço |
| Navegar (pan) na tela | Arrastar com o botão do meio, ou segurar Espaço + arrastar botão esquerdo |
| Mover o ponto 0,0 (offset) da animação inteira | Segurar M + arrastar botão esquerdo |

## 7. Lock (travar) e Show/Hide (mostrar/esconder)

O manual descreve botões "show" e "lock" no canto superior direito da
tela, acima da tela de montagem (canvas). Servem para não selecionar por
engano ossos ou sprites que já estão prontos.

| Tecla | Ação |
|:---:|:---:|
| 7 | Alternar mostrar ossos |
| 8 | Alternar travar ossos |
| 9 | Alternar mostrar sprites |
| 0 | Alternar travar sprites |

## 8. Tabela completa de atalhos de teclado

Vindos da página "Mouse Controls and Shortcut Keys", mais os poucos
citados em outras páginas (marcados na coluna Fonte).

### Ossos, sprites e transformação

| Atalho | Ação | Fonte |
|:---:|:---:|:---:|
| Alt + arrastar (botão esquerdo) | Criar e transformar osso (ou caixa de colisão / action point, se essa ferramenta estiver equipada) | Página de atalhos |
| Segurar B (com um osso selecionado) + clique num sprite | Ligar/desligar aquele sprite como filho do osso | Página de atalhos |
| Segurar M + arrastar botão esquerdo | Mover o ponto 0,0 (offset) da animação inteira | Página de atalhos |
| Clicar num osso já selecionado | Mostrar alças de redimensionar do osso | Página de atalhos |
| Segurar Ctrl + arrastar/girar/redimensionar um objeto | Clonar (clone mantém parentesco e z-order relativos) | Página de atalhos |
| Z | Selecionar todos os sprites e ossos descendentes da seleção atual | Página de atalhos |
| Shift + Z | Selecionar todos os sprites e ossos ancestrais da seleção atual | Página de atalhos |
| Setas do teclado (objeto selecionado) | Mover o objeto 1 pixel na direção da seta | Página de atalhos |
| Ctrl + A | Selecionar todos os objetos da tela | Começando (Quickstart) |
| Ctrl + Z | Desfazer | Adicionar sprites depois de pronto |

### Z-order

| Atalho | Ação | Fonte |
|:---:|:---:|:---:|
| Ctrl + Cima / Baixo (1 sprite selecionado) | Mover uma posição para cima/baixo no z-order | Página de atalhos |
| Ctrl + Esquerda / Direita (1 sprite selecionado) | Mandar para o topo/fundo absoluto do z-order | Página de atalhos |

### Copiar, colar e apagar

| Atalho | Ação | Fonte |
|:---:|:---:|:---:|
| Ctrl + N | Novo projeto | Iniciando um projeto |
| Ctrl + C | Copiar o item ou dado selecionado | Página de atalhos |
| Ctrl + Shift + C | Copiar um quadro inteiro (mesmo interpolado) | Página de atalhos |
| Ctrl + Shift + V | Colar em todos os quadros | Página de atalhos |
| Ctrl + D | Copiar o objeto selecionado e colar em todos os keyframes | Página de atalhos |
| Shift + Delete | Apagar os objetos selecionados de todos os quadros | Página de atalhos |

### Timeline (linha do tempo)

| Atalho | Ação | Fonte |
|:---:|:---:|:---:|
| 1 | Ir para o keyframe anterior | Página de atalhos |
| Shift + 1 | Ir para o keyframe anterior que tem chave do objeto selecionado | Página de atalhos |
| 2 | Ir para o próximo keyframe | Página de atalhos |
| Shift + 2 | Ir para o próximo keyframe que tem chave do objeto selecionado | Página de atalhos |
| Ctrl + 1 | Voltar 1 ms (sem encaixe) ou voltar ao encaixe anterior (com encaixe ligado) | Página de atalhos |
| Ctrl + 2 | Avançar 1 ms (sem encaixe) ou avançar ao próximo encaixe (com encaixe ligado) | Página de atalhos |
| 3 | Rebobinar até o início | Página de atalhos |
| 4 | Reproduzir (Play) | Página de atalhos |
| 5 | Avançar rápido até o fim | Página de atalhos |

### Zoom e navegação

| Atalho | Ação | Fonte |
|:---:|:---:|:---:|
| Roda do mouse | Zoom normal na tela | Página de atalhos |
| Ctrl + roda do mouse (na tela) | Zoom rápido na tela | Página de atalhos |
| Ctrl + roda do mouse (em Timeline/Hierarchy/Z-order/File Palette/Object Palette) | Zoom nesses painéis | Página de atalhos |
| Ctrl + Espaço | Aproximar zoom | Página de atalhos |
| Ctrl + Alt + Espaço | Afastar zoom | Página de atalhos |
| Ctrl + Alt + Shift + Espaço | Restaurar zoom para 100% | Página de atalhos |
| Arrastar botão do meio, ou Espaço + arrastar botão esquerdo | Navegar (pan) na tela | Página de atalhos |

### Mostrar / travar

| Atalho | Ação | Fonte |
|:---:|:---:|:---:|
| 7 | Alternar mostrar ossos | Página de atalhos |
| 8 | Alternar travar ossos | Página de atalhos |
| 9 | Alternar mostrar sprites | Página de atalhos |
| 0 | Alternar travar sprites | Página de atalhos |

Total: 34 atalhos de teclado/mouse registrados nesta tabela.

## 9. Regras de organização que o manual deixa claras

- O Spriter não é feito para desenhar do zero. É feito para montar quadros
  juntando imagens pequenas e reutilizáveis (as "partes do corpo"). O
  manual resume essa ideia central logo na primeira página, algo como:
  "Spriter is not used to draw images from scratch" — o Spriter não é
  usado para desenhar imagens do zero.
- Cada imagem tem um pivô padrão. Ele é definido uma vez, por imagem, e
  reaproveitado sempre que a imagem é usada — inclusive na troca de
  imagem (swap), onde a nova imagem entra exatamente na posição do pivô
  da antiga.
- O arquivo .scml do projeto precisa ficar sempre na pasta raiz do
  projeto, porque o Spriter procura as imagens a partir dessa mesma
  pasta.
- Ossos e sprites são duas camadas separadas de seleção: dá para travar
  e esconder cada uma independentemente, para não mexer sem querer numa
  enquanto trabalha na outra.
- Z-order pode ser diferente em cada ponto da timeline. Se o usuário
  ajustar o z-order num quadro e quiser aplicar em toda a animação,
  precisa escolher esse comando de menu manualmente — não é automático.
- Variáveis, tags e eventos ficam todos na mesma timeline de "meta data",
  por objeto ou pela animação inteira, sempre associados a um instante
  de tempo específico.
- Character Maps funcionam melhor quando as imagens alternativas têm o
  mesmo nome e mesmo tamanho das imagens originais, organizadas em
  pastas correspondentes — o manual chama isso de boa prática, não de
  obrigação.

## 10. Fluxos de uso descritos no manual

1. Criar osso: segurar Alt, arrastar do início ao fim do osso na tela.
2. Prender sprite num osso: selecionar o osso, segurar B, clicar no sprite.
3. Pivô: duplo-clique na imagem na paleta de arquivos define o pivô padrão.
4. Pivô alternativo: clicar no ponto do pivô na tela e escolher no menu
   suspenso "use default pivot point" ou "overwrite default pivot".
5. Action point: equipar "create point", segurar Alt e arrastar (a direção
   do arraste define o ângulo do ponto).
6. Caixa de colisão: equipar "create box", segurar Alt e arrastar na tela.
7. Trocar imagem do sprite: clique direito numa imagem da paleta de
   arquivos com o sprite selecionado; ou segurar o botão direito para ver
   uma fileira de miniaturas e soltar sobre a escolhida.
8. Criar Character Map: botão "CharMaps" na paleta de animações, depois
   "Create New Character Map".
9. Editar Character Map: arrastar imagem de troca da coluna direita sobre
   a imagem original na coluna esquerda, na janela "Edit Character Map".
10. Ativar Character Map: arrastar o nome do mapa da coluna "Available"
    para a coluna "Active".
11. Salvar o conjunto de mapas ativos: ícone de disco na paleta de
    Character Maps, gera um arquivo .scms.
12. Copiar pose entre animações: Ctrl+Shift+C no ponto de origem, criar
    a nova animação, ir para o tempo 0 e apertar Ctrl+V.
