# A mão pela janela — rodada 49

Escrito pelo `CONFERINDO · rodada 49 — a mão pela janela [0abe3f]` em 07/10/2026, a partir das 13h01.
Ficha: `rodadas/RODADA 49 - a mao pela janela 2026-10-07.md`. Sem código.

**Como.** O programa montado (`programa/`, porta 5180, Sobre: **v36.1**), no navegador do aplicativo, em 1920×1080. Mouse e teclado de verdade (`computer`: clique, arrasto, tecla). Nada por protocolo, nada de `.focus()`. Fotos em `backup/fotos-obra/rodada-49/`, pelo nome do item.

**Um limite do navegador do aplicativo**, para ler as fotos: ele não segura uma tecla enquanto clica (o **P segurado** do passo 6), não tem lista de downloads (Ctrl+J não abre nada), e não alcança janela do Windows.

## A tabela

| Item | Resultado | O que vi | Foto |
|:---:|:---:|:---|:---|
| A — Downloads | **pela metade** | Herói aberto, sem pasta. Arquivo → Exportar → "GIF, PNG, folha, vídeo…" → Só este quadro → Exportar. A janela "Imagem exportada" diz **Arquivo: heroi.gif** e "Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)". O rodapé diz **"GIF animado: 1 quadro de 110x241, 1 arquivo(s), 10.789 bytes. Foi para Downloads (Ctrl+J mostra)."** Nenhuma janela de download apareceu: o navegador do aplicativo não mostra download, e Ctrl+J não abre nada nele. O arquivo no disco não foi conferido (a pasta Downloads é fora do projeto). **Onde hesitaria:** marcar "Só este quadro" deixa o formato em **GIF animado**: sai um `heroi.gif` de 1 quadro, não um PNG. O doc `89` esperava "o PNG aparece em Downloads" | `A1`, `A2`, `A3` |
| B — Roteiro com a mão | **9 funcionam, 2 pela metade (6 e 11), 3 da mão dele (2, 13, 14)** | ver a tabela B | `B0` a `B13` |
| C — Os painéis | **pela metade: 1 defeito, 1 desvio** | **Arrastar aba para outro grupo:** Ordem → grupo das Imagens: *"Ordem: colado neste grupo"*, e o » aparece. **Soltar da parede (DEFEITO):** a Ordem solta no meio da cena vira janela com barra, `×` e canto — **mas a janela nasce VAZIA** (o corpo dela está com `display: none`), e aparece **uma aba "Ordem" a mais no grupo das Propriedades**, que não era o grupo dela. Clicar nessa aba enche a janela solta com a lista e **esvazia o grupo de baixo** (`C2`, `C3`). O rodapé diz *"Ordem solto. Arraste a barra dele até uma tira de abas para colar de volta"*. **Arrastar a barra de volta (desvio):** soltei a barra na tira da **Árvore**; ela voltou para o grupo da **direita**, de onde veio: *"Ordem: colado de volta"*. O lugar onde se solta não conta (`C4`). **Voltar ao padrão** (Janela → Arranjos → Voltar ao padrão): *"Painéis de volta ao padrão"*, tudo no lugar, a aba a mais some (`C5`). **Recolher pelo ▾:** o ▾ do fim da tira recolhe: *"Árvore, Ordem: recolhido. O espaço foi para o outro painel."*; de novo, volta (`C7`). **O »:** *"Mais 5 abas: Pivôs, Malha e pesos, Partículas, Exibição, Prévia"*; escolher Partículas põe a aba no grupo (`C8`, `C9`). **A sombra e a linha azul durante o arrasto não se fotografam**: o arrasto do navegador do aplicativo é um gesto só, do aperto ao solto. Ficam para a mão dele. **Meu tropeço, que é o item E:** quis recolher Propriedades e cliquei no sinal logo depois do nome: era o `×`, e o painel fechou (*"Propriedades fechado"*, `C6`) | `C1` a `C9` |
| D — Exportar e importar skin | **pela metade; o resto é mão do Humberto** | O herói não tem pasta "inverno": a janela **"Fazer a skin de uma pasta"** (do programa, não do Windows) oferece só **armadura** — *"Pastas com imagem aqui: armadura."* Fazer a skin → *"Skin "armadura2": A pasta "armadura" cobriu 1 desenho; 18 continuam os de baixo."* O herói veste a armadura, com rosto (`D3`). **Exportar e Importar não estão no menu Skins**: estão em Arquivo → Exportar → "Skin, para outro boneco…" e Arquivo → Importar → "Skin, de outro boneco…" (quem procurar no menu Skins não acha). **Exportar a skin abre o seletor do Windows** — aqui ele se fechou sozinho, e o rodapé disse a verdade: *"Exportar a skin: a janela foi fechada sem escolher onde. Nada foi gravado."* (`D4`). Não cai em Downloads, como cai a imagem do item A. Parei ali: Importar é seletor de arquivo do Windows, **mão dele**. Não apaguei a skin, porque sem o arquivo exportado não haveria como trazê-la de volta | `D1` a `D5` |
| E — A aba Árvore | **vi; o que acho que ele circulou** | De perto (`E1`, numa janela de 800×450 para a foto não encolher): **o `×` só existe na aba ATIVA**, colado no nome ("Árvore ×"); a aba de trás ("Ordem") não tem. Embaixo da ativa, **uma linha azul de 2,4 px** corre sob o nome e o `×` — é a marca de "aba à frente", mas lida como **sublinhado**. O nome não está cortado (45 de 45 px) nem tem cor diferente. **O `×` fecha a aba certa**: *"Árvore fechado. Janela → Árvore traz de volta"*; a Ordem passa à frente e **herda o `×`** (`E3`). Com o mouse em cima, o `×` ganha um quadradinho claro; a dica ("Fechar: Árvore") não apareceu na foto (`E2`). **O que estranho, e que pode ser o que ele circulou:** (1) o `×` fica **no lugar onde o olho espera o ▾** — eu mesmo, querendo recolher Propriedades, cliquei nele e **fechei o painel** (`C6`); o ▾ de verdade fica longe, no fim da tira; (2) o `×` aparece e some conforme a aba está à frente — a mesma aba muda de largura; (3) o rodapé diz **"Árvore fechado"**, **"Propriedades fechado"**, **"Ordem solto"**: o masculino com nome feminino | `E1` a `E3` |
| F — Seletor de cor | **mão do Humberto** | Partículas → Fogo: *"Fogo: emissor torso_particulas no osso torso (o mais perto do meio da cena), semente 0."* Aba Cor: "Cor ao nascer" com «de» e «até» brancos; "Cor na vida" com a barra e as duas faixas finas embaixo; "Cor do emissor" (`F1`). **Clique na cor «de»: nada abre dentro da página** (`F2`); o foco fica no campo, a página responde. O seletor de cor deste navegador é uma **janela do Windows**, fora do meu alcance. Apertei Esc. Escolher o vermelho e ver a faixa fina mudar fica para a mão dele | `F1`, `F2` |
| G — Soltar uma pasta · seletor de pasta | **mão do Humberto** | não tentei, como a ficha manda | — |

## Achado fora da ficha — o trabalho não salvo some sem pergunta

| O que fiz | O que aconteceu | Foto |
|:---|:---|:---|
| Com a animação "aceno" feita e **não salva** (título `heroi.bone •`), Arquivo → Abrir o herói (exemplo) | o herói abriu **sem perguntar nada**, e o meu trabalho sumiu. O rodapé disse *"Abriu a base. Arquivo salvo."* — "salvo" fala do herói que abriu, mas lido depois de perder trabalho, parece que o meu foi salvo. Ctrl+Z não traz de volta | `X1` |
| Arquivo → Reabrir o fechado | a janela *"Guardado hoje às 13:13: heroi.bone. Isto substitui o que está aberto agora."* → Reabrir: a "aceno" e os ossos voltam, **sem as imagens** — e o rodapé diz a verdade: *"Reaberto o de hoje às 13:13. As imagens não vêm no guardado"*, 13 avisos | `X2`, `X3` |

No Spriter, abrir outro projeto com mudança não salva pergunta antes. **Para a rodada 50**, se o Diretor quiser: perguntar antes de trocar o que está aberto quando há `•`.

## O que fica para a mão do Humberto

| # | O quê | Por quê |
|:---:|:---|:---|
| 1 | Ver o arquivo `heroi.gif` em Downloads (Ctrl+J no Chrome) | o navegador do aplicativo não mostra download |
| 2 | Roteiro, passo 2 (Abrir pasta), 13 (Salvar na pasta), 14 (reabrir) | seletor de pasta do Windows |
| 3 | Roteiro, passo 6 com o **P segurado** | não seguro tecla enquanto clico |
| 4 | Ver a sombra e a linha azul **durante** o arrasto de uma aba | o meu arrasto é um gesto só |
| 5 | Exportar a skin num arquivo e importar de volta | seletor de arquivo do Windows |
| 6 | Cor «de» vermelha no Fogo → a faixa fina muda | seletor de cor do Windows |
| 7 | Soltar a pasta do Explorer; o seletor de pasta | Windows |

## Para a rodada 50 — o que vi errado, pela forma

| # | Onde | A forma do erro |
|:---:|:---|:---|
| 1 | Painéis: soltar uma aba da parede | **a janela solta nasce sem o conteúdo** (o corpo fica escondido) e a aba fica **presa num grupo que não era o dela**; o conteúdo só vem quando se clica nessa aba, e aí o grupo fica vazio |
| 2 | Painéis: arrastar a barra da janela solta | **o lugar onde se solta não conta**: volta sempre para o grupo de origem |
| 3 | Animar: Ctrl+C / Ctrl+V com o boneco escolhido | **copia as chaves de todos os tempos, não a pose do tempo atual**; colar estica a animação; o rodapé conta só parte do que colou |
| 4 | Abrir outro arquivo com `•` | **troca sem perguntar**; o rodapé diz "Arquivo salvo" |
| 5 | A aba à frente | o `×` mora onde o olho procura o ▾ |
| 6 | Exportar skin sem pasta | **não cai em Downloads**, ao contrário do exportar imagem: abre o seletor |
| 7 | Exportar "Só este quadro" | o formato fica GIF animado: sai um `.gif` de 1 quadro |
| 8 | O botão direito abre a grade de imagens | **nada na tela diz isso**; e o clique esquerdo na peça escolhe o osso que passa por cima |
| 9 | O rodapé | "Árvore fechado", "Propriedades fechado", "Ordem solto" |

Fotos: `backup/fotos-obra/rodada-49/`, 47 arquivos, nome pelo item. Servidor da porta 5180 desligado no fim.

## B — o roteiro dos 30 minutos, passo a passo

O passo 2 é o seletor de pasta do Windows. Para ter peças sem ele, abri o herói (Abrir o herói), escolhi tudo na cena (Ctrl+A) e apaguei (Delete): o rodapé disse *"Apaguei root, hips e mais 35: 17 ossos, 23 desenhos e 4 regras"*, e as 21 imagens ficaram na aba Imagens. Daí em diante, quatro peças: `body`, `arm_back`, `arm`, `face`.

| # | Passo | Resultado | O que vi · onde hesitaria |
|:---:|:---|:---:|:---|
| 1 | Abre o programa: corpo vazio, base aberta | **funciona** | Ao abrir: cena vazia, Base — montar, Transformar na mão, tocador em 0,00 s, as boas-vindas com os quatro cartões (`00`) |
| 2 | Arquivo → Abrir pasta… | **mão do Humberto** | seletor de pasta do Windows |
| 3 | Arrasta as peças e arruma | **funciona** | Arrastar da aba Imagens para a cena: cada peça cai solta onde soltei. O rodapé ensina: *"body entrou solta, como body. Para prender num osso: com ela escolhida, crie o osso — ele pega o desenho."* Arrastar a peça com o Transformar move: *"Mover X 11,4 px · Y -6,6 px"*. **Hesitaria:** a busca da aba Imagens não acha "head": o nome da cabeça é `face`, e só achei digitando "fa" |
| 4 | Ordem: braço de trás para trás | **funciona** | Aba Ordem, botão ↓ (Mandar para trás): *"arm_back: 4º de 4, atrás de tudo."* O braço some atrás do tronco |
| 5 | Cria os ossos (B e arrastar) | **funciona** | B põe "Criar osso" na mão; o rodapé diz *"Com desenhos escolhidos, o osso novo pega os desenhos. Ctrl: sem pegar."* Com o `body` escolhido: *"Osso novo pegou 1 desenho, sem mover. O osso "body" nasceu solto, na raiz."* O segundo, com o osso escolhido: *"O osso "osso" nasceu filho de body."* **Hesitaria:** o primeiro osso ganhou o nome da peça (`body`); o segundo, sem peça, ficou `osso` |
| 6 | Associa: osso, P, clique nas peças | **pela metade** (limite meu) | O navegador do aplicativo não segura P enquanto clica. P apertado e solto: *"Terminou sem pegar ninguém."* — o rodapé diz a verdade. **Pela Árvore funciona**: arrastar `face` para cima do `osso` → *"face virou filho de osso"*, sem sair do lugar; o mesmo com `arm` e `arm_back` no `body`. Nenhuma janela. O P segurado fica para a mão dele |
| 7 | Árvore: quem manda em quem | **funciona** | Uma árvore só: `body` → `arm_back`, `body`, `arm`; `osso` → `face`; cada desenho com a miniatura |
| 8 | Troca a imagem (a grade) | **funciona, com uma hesitação** | **Clique esquerdo na cara escolhe o OSSO que passa por cima, não o desenho** (`B8a`). Escolhi a `face` pela Árvore. O clique esquerdo de novo não abre nada; a grade abre no **botão direito** (`B8b`), com "fonte: pasta \| todas \| objeto" — o rodapé do Transformar não diz que o direito abre a grade. Troquei a cara por `hand_01`: *"face: entrou no tamanho dela, 24 × 24 px. Para caber: Imagens → Caber no lugar da antiga."* A mão caiu uns 30 px ao lado (outro pivô: troquei cara por mão, não é o teste justo). Ctrl+Z: *"Desfeito: Trocar o desenho do slot"* |
| 9 | Nova animação | **funciona** | O + da aba Animações cria "animação" com o nome aberto para escrever; escrevi `aceno` + Enter: *"Renomeou a animação "animação" para "aceno"."* A barra diz **"Animação: aceno — Mexer grava chave"**, 0,00 s |
| 10 | Em 0,5 s, gira o tronco e o braço | **funciona** | Clique na régua em 0,50 s; ferramenta Girar; arrasto: *"Girar 25,6° (agora 115,6° local)"*. Nasceram os losangos em **0 e 0,5** no Resumo: a chave do começo vem sozinha. O braço também: *"Girar 24,9°"* |
| 11 | Em 1,0 s, volta à pose do começo | **pela metade** | **Primeiro jeito (o que um usuário tenta): em 0 s, Ctrl+A e Ctrl+C → "4 chaves copiadas"; em 1,0 s, Ctrl+V → o rodapé diz "2 chaves em 1,50 s", a animação estica de 1,00 para 1,50 s, e em 1,5 s está a pose GIRADA.** O Ctrl+C copiou as chaves de 0 **e** de 0,5, e o Ctrl+V colou as duas, guardando o espaço entre elas. O rodapé fala só das de 1,50 s (`B11a`, `B11b`). Ctrl+Z: *"Desfeito: Colar chaves"*. **Segundo jeito: Editar → Pose → Copiar a pose inteira (Ctrl+Shift+C)** → *"Pose de 0,00 s copiada: 2 valores"*; em 1,0 s, Ctrl+V → *"2 chaves em 1,00 s"*, 1,00 s de animação, a pose do começo. Certo. **Para a rodada 50:** o Ctrl+C com o boneco escolhido copia chaves de todos os tempos, e não a pose do tempo em que se está — no Spriter, Ctrl+C na cena copia a pose. E o rodapé do Ctrl+V tem de contar as que colou, todas |
| 12 | Espaço: toca em laço | **funciona** | Espaço com a cena em foco: o botão vira pausa; 0,06 s → 0,60 s (girado) → volta: laço. Espaço de novo para |
| 13 | Salvar na pasta do projeto | **mão do Humberto** | Sem pasta, Salvar abre a janela **"O projeto ainda não tem pasta"**: "Escolher a pasta do projeto…" ou "Salvar só o arquivo .bone…" (as duas levam a uma janela do Windows) ou Cancelar. A janela é clara. Cancelei (`B13`) |
| 14 | Fecha, reabre, continua | **mão do Humberto** | depende do 13 |
