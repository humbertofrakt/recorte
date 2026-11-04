# Possibilidades novas — o que os manuais mostraram e ainda não está na nossa lista

Escrito em 08/09/2026 pelo planejador, a pedido do Humberto.
Fonte: os cinco relatórios em `documentos/pesquisa/manuais/` (Spine, Spriter, Live2D, Moho, Aseprite) e as convenções do `documentos/pesquisa/menu/04` (Blender, Unity, Godot).
A lista de 52 do pesquisador está no `documentos/pesquisa/menu/07`. **Aqui só entra o que não está lá.**
A numeração continua a dela: começa no **53**.

## Como ler

| Coluna | Significado |
|:---:|:---|
| Formato | **cabe** = o `.bone` de hoje já guarda. **muda** = precisa de campo novo, decisão do Humberto. **tela** = não toca no arquivo |
| Custo | **P** um dia · **M** dois a três dias · **G** uma semana ou mais |
| Quem tem | programa cujo manual descreve |

Nada aqui é decisão. É o cardápio. O Humberto marca o que quer.

---

## A. Selecionar e navegar na cena

| # | Possibilidade | Como funciona | Quem tem | Formato | Custo |
|:---:|:---|:---|:---:|:---:|:---:|
| 53 | **Setas movem 1 pixel** | com um osso ou desenho escolhido, ← → ↑ ↓ empurram 1 px. Shift = 10 | Spine, Spriter | cabe | P |
| 54 | **Selecionar os descendentes** | tecla escolhe o osso e tudo abaixo dele. Shift = os ancestrais | Spriter (Z, Shift+Z) | tela | P |
| 55 | **Andar na hierarquia pelo teclado** | ↑ vai para o osso pai, ↓ para o primeiro filho, sem o mouse | Moho | tela | P |
| 56 | **Inverter a seleção** | o que estava fora entra, o que estava dentro sai | Aseprite, Moho, Live2D | tela | P |
| 57 | **Esconder o escolhido / Só este** | H esconde o escolhido. "Só este" esconde todo o resto. "Mostrar tudo" desfaz | Spine (H), Live2D (Ctrl+3, Solo S) | tela, vai em `view` | P |
| 58 | **Travar o escolhido / Travar o resto / Destravar tudo** | além do travar por tipo que já temos (7 8 9 0), travar um a um por tecla | Live2D (Ctrl+2, Ctrl+Shift+2, Ctrl+Alt+2) | tela, já tem `lockedBones` | P |
| 59 | **Nome do item ao passar o mouse** | uma etiqueta pequena com o nome do osso ou desenho sob o cursor | Live2D | tela | P |
| 60 | **Mapa da cena (Outline)** | um painel pequeno com a silhueta inteira. Clicar nele centra a cena ali | Spine | tela | M |
| 61 | **Ver só o resultado** | um botão esconde ossos, alças, grade, tudo. Fica só o desenho, como no jogo | Moho (Show Output Only), Spine (Outline) | tela | P |
| 62 | **Imagem de referência atrás** | carregar um PNG de guia, com transparência, só para desenhar por cima. Não vai para o jogo | Moho (Tracing Image), Live2D (Guide Image) | tela, em `RECORTE_editor_state` | P |
| 63 | **Zoom com número fixo** | teclas 1 a 6 = 100 %, 200 %, 400 %… | Aseprite | tela | P |
| 64 | **Guias e imã** | linhas-guia arrastáveis e "grudar na grade" ao mover | Live2D, Aseprite | tela | M |
| 65 | **Qualidade de exibição** | desenhar a cena em ½ ou ¼ para máquina fraca | Live2D | tela | P |

## B. Ossos e montagem

| # | Possibilidade | Como funciona | Quem tem | Formato | Custo |
|:---:|:---|:---|:---:|:---:|:---:|
| 66 | **Criar osso já preso à imagem** | com um desenho escolhido, Ctrl na ferramenta Criar osso: o osso nasce e o desenho vira dele | Spine (Ctrl em Create) | cabe | P |
| 67 | **Redesenhar o osso** | Alt na ferramenta Criar osso: refaz o comprimento e o ângulo do osso escolhido sem criar outro | Spine (Alt em Create) | cabe | P |
| 68 | **Alt + arrastar cria osso em qualquer ferramenta** | sem trocar de ferramenta: segurar Alt e arrastar já cria | Spriter | cabe | P |
| 69 | **Clonar arrastando** | Ctrl + arrastar copia o osso ou desenho, com pai e ordem iguais | Spriter | cabe | M |
| 70 | **Girar em passos de 15°** | Shift na ferramenta Girar trava o ângulo | Spine | tela | P |
| 71 | **Mover a origem da animação inteira** | segurar M e arrastar move o ponto 0,0 de tudo | Spriter | cabe (raiz) | P |
| 72 | **Voltar à pose de repouso** | um osso, ou todos, volta ao valor da montagem. Em Animando grava a chave | Moho (Reset Bone), Live2D (Ctrl+1) | cabe | P |
| 73 | **Buscar E substituir nomes** | além de buscar (item 34): trocar `_esq` por `_e` em todos os ossos de uma vez | Live2D (Ctrl+F) | cabe | P |
| 74 | **Redimensionar o esqueleto inteiro** | multiplicar tudo por um fator: ossos, desenhos, chaves. Para trocar a resolução da arte | Live2D (Resize Model), Spriter (Scaled clone) | cabe | M |
| 75 | **Miniaturas na lista de desenhos** | ao trocar o desenho do slot (item 9), a lista mostra a imagem, não só o nome | Spriter (segurar botão direito), Spine | tela | P |
| 76 | **Pilha de peles gravada** | escolher várias peles ligadas e salvar o conjunto com nome ("armadura de ferro + espada") | Spriter (Character Map stack, `.scms`) | muda, ou extensão | M |
| 77 | **Malha automática** | gerar a malha da imagem com um clique, por densidade | Live2D (Ctrl+Shift+A) | cabe | M |
| 78 | **Colar vértices de duas malhas** | dois desenhos vizinhos com a borda costurada, para não abrir fresta | Live2D (Glue) | muda | G |
| 79 | **Seleção macia de vértices** | mover um vértice puxa os vizinhos, com raio e suavidade | Spine (Mesh Tools: Size, Feather) | tela | M |
| 80 | **Pesos: Auto · Suavizar · Podar** | calcular pesos sozinho, suavizar, tirar influências fracas | Spine (Weights) | cabe. **Conferir** o que `mesh/weights.ts` já faz | M |

## C. Animar

| # | Possibilidade | Como funciona | Quem tem | Formato | Custo |
|:---:|:---|:---|:---:|:---:|:---:|
| 81 | **Trecho de laço** | marcar início e fim na régua. Tocar só repete o trecho. Alt + clique marca | **todos**: Spine (Loop Start/End), Blender (Preview Range), Moho (região sombreada), Aseprite (Loop section), Live2D (Work Area) | tela | P |
| 82 | **Marcadores na régua** | marcas com nome em tempos ("pé no chão"). Pular de marca em marca | Live2D (Ctrl+J/K), Godot, Blender | tela, ou `event` sem disparar | P |
| 83 | **Chavear em três níveis** | K = tudo que mudou · L = só a ferramenta ativa · Ctrl+L = todas as transformações do escolhido | Spine | cabe | P |
| 84 | **Chavear tudo × só o escolhido** | dois botões: "Chavear tudo" grava todos os ossos, "Chavear escolhido" só a seleção | Spriter (Key All / Key Selected) | cabe | P |
| 85 | **Copiar a pose inteira** | Ctrl+Shift+C copia o quadro inteiro, mesmo interpolado. Ctrl+V cola em outra animação | Spriter, Live2D (Copy parameter values), Moho (Copy Current Frame) | cabe | P |
| 86 | **Colar o objeto em todos os quadros** | Ctrl+D: o valor do escolhido vai para toda chave | Spriter | cabe | P |
| 87 | **Apagar de todos os quadros** | Shift+Delete tira o objeto de todas as chaves | Spriter | cabe | P |
| 88 | **Limpar a animação do osso** | apaga todas as chaves de um osso, ou da animação inteira, num comando | Moho (Clear Animation From Layer) | cabe | P |
| 89 | **Mover com as seguintes** | Alt + arrastar uma chave empurra também todas as que vêm depois (ripple) | Spine | cabe | P |
| 90 | **Duplo clique apaga a chave** | na linha do tempo | Spine | cabe | P |
| 91 | **Cortar chaves** | Ctrl+X: copia e apaga | Spine | cabe | P |
| 92 | **Arrastar sem encaixe** | Shift ao arrastar a chave ou a agulha: livre, sem grudar no quadro | Spine | tela | P |
| 93 | **Pular 10 quadros** | Shift + ← → | Spine | tela | P |
| 94 | **Deslocar quadros** | "mover quadro para a direita/esquerda": empurra tudo a partir da agulha | DragonBones | cabe | P |
| 95 | **Linha do tempo só do escolhido** | opção: mostrar só as linhas dos ossos escolhidos, para não rolar | Blender (Only Show Selected), Moho | tela | P |
| 96 | **Assar a física em chaves** | rodar a regra de física e gravar o resultado como chaves normais, para o jogo que não tem física | Live2D (Animation baking) | cabe | M |
| 97 | **Rastro do movimento** | desenhar o caminho que um osso faz ao longo da animação (motion vectors) | Live2D (Track Trajectory), Spine (Ghosting: Motion Vectors) | tela | M |
| 98 | **Foto da pose** | guardar a pose atual como fantasma fixo para comparar depois, sem ser a casca de cebola | Live2D (Snapshot, Ctrl+5) | tela | P |
| 99 | **Casca de cebola por marcas clicáveis** | até 8 quadros, cada um liga e desliga com um clique na régua | Moho | tela | P |
| 100 | **Modos de fim no tocador** | Parar · Repetir · Vai-e-volta · Voltar ao quadro de partida | Blender (Loop, Bounce, Restore Frame) | tela (item 43 tem parte) | P |
| 101 | **Sincronia do tocador** | "cada quadro" (lento mas exato) ou "pular quadros" (tempo real) | Blender (Sync), Moho (Allow Frame Skipping) | tela | P |
| 102 | **Prévia em tela cheia** | tocar a animação ocupando a tela toda, sem interface | Aseprite (Full Screen Preview), Live2D (Preview) | tela | P |

## D. Arquivo e projeto

| # | Possibilidade | Como funciona | Quem tem | Formato | Custo |
|:---:|:---|:---|:---:|:---:|:---:|
| 103 | **Repetir a última exportação** | Ctrl+Shift+E exporta de novo com as mesmas opções, sem janela | Spine, Aseprite | tela | P |
| 104 | **Importar de outro `.bone`** | trazer um esqueleto ou só uma animação de outro arquivo nosso | Spine (Import Project), Spriter (Import Another Project) | cabe | M |
| 105 | **Reabrir o fechado** | volta o último arquivo fechado | Aseprite | tela | P |
| 106 | **Configurações do projeto** | FPS, tamanho, cor de fundo, num lugar só | Moho (Project Settings), Live2D (Canvas settings) | cabe (`fps` já existe) | P |
| 107 | **Tela de boas-vindas** | ao abrir: recentes, exemplo, manual, novidades | Spine, Aseprite (Home) | tela | P |
| 108 | **Exportar em lote** | várias animações e peles de uma vez, pela janela | Spriter (Batch Export), Moho | tela (a linha de comando já faz) | P |
| 109 | **Salvar em lote por CSV** | exportar e importar os valores de todos os ossos como tabela | Live2D (Bulk setting) | cabe | P |

## E. Interface e ajuda

| # | Possibilidade | Como funciona | Quem tem | Formato | Custo |
|:---:|:---|:---|:---:|:---:|:---:|
| 110 | **Paleta de comandos** | uma caixa de busca que acha qualquer função pelo nome e roda | Aseprite (Run Command) | tela | P |
| 111 | **Dicas instantâneas** | F1 segurado mostra a dica de tudo que está na tela ao mesmo tempo | Spine (F1) | tela | P |
| 112 | **Duplicar a vista** | duas cenas do mesmo arquivo, uma de perto e uma de longe | Aseprite, Live2D | tela | M |
| 113 | **Abas: próxima, anterior, duplicar** | atalhos para andar entre os painéis | Live2D | tela | P |
| 114 | **Barra de ferramentas muda com o modo** | em Montagem aparece Criar osso; em Animando some. O que não vale no modo não aparece | Live2D (toolbar por área), Spine (views por modo) | tela | P |
| 115 | **Ícone que avisa novidade** | o botão do manual muda quando há versão nova | Spine (envelope) | tela | P |
| 116 | **Menu do assunto só quando cabe** | o menu Esqueleto muda de conteúdo em Montagem e em Animando | Moho (Bone só com camada de osso) | tela | P |
| 117 | **Nome do passo no Desfazer** | já temos. Confirmado como padrão | Live2D, Spine | — | — |

## F. Coisas que os manuais têm e que **não** cabem

| O que | Por quê não |
|:---|:---|
| Scripts em Lua (Moho), paleta indexada (Spriter), simetria de desenho (Aseprite), modo ladrilho (Aseprite) | são de programa de desenho, não de esqueleto |
| Deformadores de Live2D (Warp, Rotation), parâmetros com 4 cantos | é outro modelo de animação. Nosso `parameter` cobre o caso simples |
| Lip-sync por áudio (Live2D), Papagayo (Spriter) | precisa de análise de som. Fora da regra "zero dependência" |
| Efeitos de partícula (Moho Scripts) | fora do formato |
| Painel solto em outro monitor | nem o Spine faz. Já estava no `07` |

---

## Resumo em números

| Grupo | Novas |
|:---:|:---:|
| A. Selecionar e navegar | 13 |
| B. Ossos e montagem | 15 |
| C. Animar | 22 |
| D. Arquivo | 7 |
| E. Interface | 8 |
| **Total** | **65** |

Das 65: **56 cabem** no formato de hoje ou são só tela. **2 mudam o formato** (76 pilha de peles, 78 colar malhas). O resto é "conferir".

## As que aparecem em mais de um manual

Quando quatro programas fazem igual, é padrão. Estas são as mais fortes:

| # | O que | Em quantos |
|:---:|:---|:---:|
| 81 | trecho de laço na régua | 5 |
| 85 | copiar a pose inteira | 3 |
| 57 | esconder o escolhido / só este | 2 |
| 58 | travar um a um por tecla | 2 (e o 7 8 9 0 já temos) |
| 62 | imagem de referência | 2 |
| 66 | osso já preso à imagem | 1, mas resolve o passo 6 do manual |
| 72 | voltar à pose de repouso | 2 |
| 82 | marcadores na régua | 3 |
| 97 | rastro do movimento | 2 |
| 103 | repetir a última exportação | 2 |
| 110 | paleta de comandos | 1, mas resolve "cadê a função" de vez |

---

## O que fazer com esta lista

1. O Humberto lê e marca o que quer. Pode escrever o número na frente: "quero 81, 85, 66".
2. O que ele marcar entra no `07` como itens 53 em diante, no nível que ele disser.
3. Eu encaixo nos lotes do `PLANO`. Nada começa antes disso.
