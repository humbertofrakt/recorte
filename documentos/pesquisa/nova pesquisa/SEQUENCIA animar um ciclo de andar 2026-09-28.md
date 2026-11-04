# SEQUÊNCIA — animar um ciclo de andar — 28/09/2026

Chat K, `USO · animar um ciclo de andar`. Não escreve código. Reporta ao `PLANEJADOR · 9f75b5`.

Feito em 28/09/2026, madrugada. Cada passo abaixo foi **lido da página oficial**
(link ao lado). O que a página não diz está marcado **"não achei"**. Nada foi inventado.

---

## PARTE 1 — A REFERÊNCIA (1ª entrega)

### 1.1 Spriter Pro — manual oficial da BrashMonkey

Índice do manual: <https://www.brashmonkey.com/spriter_manual/>

Ordem que o manual dá, em fila:

| # | Passo | O que o manual diz | Fonte |
|:---:|:---|:---|:---|
| 1 | Nome da animação | Na paleta de animações (canto inferior direito) renomear a entidade e a animação padrão (ex.: "hero", "idle") | [Quickstart](https://www.brashmonkey.com/spriter_manual/getting%20started.htm) |
| 2 | Posar o primeiro quadro | Editar o quadro inicial: mover, girar, esticar sprites ou ossos; mudar transparência. Travar/esconder peças pelos botões no alto à direita da tela, para não pegar sem querer | [Animating Sprites and Bones](https://www.brashmonkey.com/spriter_manual/animating%20sprites%20and%20bones.htm) |
| 3 | Andar no tempo | Clicar em outro ponto da linha do tempo | idem |
| 4 | Posar o segundo quadro | Ajustar sprites/ossos ali. *"Editando qualquer sprite ou osso num ponto novo da linha do tempo cria a chave automaticamente"* | idem |
| 5 | Criar chave à mão | Botão **"key all"** (chaveia tudo) ou selecionar e clicar **"key selected"** (chaveia só o selecionado), perto do canto inferior direito / alto-direita da linha do tempo | idem · [Key All vs Key Selected](https://www.brashmonkey.com/spriter_manual/key%20all%20vs%20key%20selected.htm) |
| 6 | Copiar e colar a pose inteira | Pôr o cursor no ponto de origem → **Ctrl+Shift+C** (copia o quadro inteiro; funciona mesmo onde não há chave) → ir ao ponto de destino → **Ctrl+V**. Sugestão do manual: começar animação nova colando uma pose no tempo 0 | [Duplicating Entire Keyframes](https://www.brashmonkey.com/spriter_manual/duplicating%20entire%20keyframes.htm) |
| 7 | Ajustar o tempo das chaves | Clicar e arrastar a chave na linha do tempo (embaixo da tela). **Ctrl** seleciona várias chaves para mover juntas | [Editing Timing](https://www.brashmonkey.com/spriter_manual/editing%20timing.htm) |
| 8 | Mudar a duração toda | Clicar na segunda caixa de número de "current time"; digitar a duração; marcar (ou não) a caixa que estica as chaves na mesma proporção | idem |
| 9 | Velocidade da prévia | Controle deslizante de velocidade à esquerda da linha do tempo | idem |
| 10 | Tempo por objeto | Ampliar a linha do tempo puxando o alto dela; arrastar as chaves de **um objeto** para deslocá-lo do resto; apagar chaves = selecionar e **Delete**. O Spriter guarda linha do tempo e chaves **separadas por objeto** | [Advanced Timeline Editing](https://www.brashmonkey.com/spriter_manual/advanced%20timeline%20editing.htm) |
| 11 | Trocar a imagem no meio | Ir ao ponto da animação → clicar no sprite na tela → **botão direito numa imagem da paleta de arquivos**. A imagem nova cai no mesmo lugar pelo pivô. Para não pular: mesmo tamanho em pixels, mesmo pivô padrão, sobra transparente | [Swapping the Image](https://www.brashmonkey.com/spriter_manual/swapping%20the%20image%20of%20a%20sprite.htm) |
| 12 | Teclas de andar no tempo | **1** chave anterior · **2** próxima · **3** voltar ao início · **4** tocar · **5** ir ao fim · Shift+1 / Shift+2 = chave anterior/próxima **do objeto selecionado** · Ctrl+1 / Ctrl+2 = 1 ms (ou um intervalo de encaixe) | [Mouse and Keyboard Controls](https://www.brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm) |
| 13 | Outros atalhos de colar | Ctrl+C copia o item · Ctrl+Shift+V cola em todos os quadros · Ctrl+D copia o objeto e cola em todas as chaves | idem |

**Não achei** nas páginas oficiais consultadas do Spriter:

| O quê | Situação |
|:---|:---|
| Como criar uma animação nova (botão exato) | não achei. A página só manda renomear a padrão e diz "crie uma animação nova e cole a pose no tempo 0" |
| Fechar o laço / marcar o loop | não achei (o manual diz que os atalhos não trazem loop) |
| Mudar a curva de uma chave | não achei no manual. Só uma página de loja diz que o Spriter tem "curvas de suavização" — sem passo a passo, sem link de manual |
| Colar a pose **espelhada** | não achei. Nenhuma página do manual fala disso |

### 1.2 Spine — guia do usuário oficial (Esoteric Software)

Índice: <https://esotericsoftware.com/spine-user-guide>

| # | Passo | O que o guia diz | Fonte |
|:---:|:---|:---|:---|
| 1 | Criar a animação | O **ícone de nova animação, à direita da aba "Animations"**, cria a animação. Clicar numa animação a ativa (igual ao pontinho de visibilidade dela na árvore). Duplo clique renomeia | [Animations view](https://esotericsoftware.com/spine-animations-view) |
| 2 | Posar | Com a animação ativa, posar o esqueleto no quadro | [Keys](https://esotericsoftware.com/spine-keys) |
| 3 | Chavear | Clicar o **botão de chave** de cada propriedade (rotação, translação, escala, cisalhamento) ao lado dos campos numéricos, **ou** apertar **K** ("Key Edited": chaveia tudo que mudou) | idem |
| 4 | O programa avisa por cor | Botão de chave **verde** = sem chave neste quadro · **laranja** = mudou, ainda não chaveado · **vermelho** = há chave neste quadro para essa propriedade | idem |
| 5 | Auto Key | Botão **Auto Key** na barra principal: com ele ligado, toda mudança cria chave sozinha | idem |
| 6 | Chavear a pose inteira | Chavear tudo que já tem chave = chaves que formam a pose atual. **Ctrl+Shift+L** ("Key Shown") chaveia todas as curvas do gráfico ou todas as linhas do dopesheet. Depois a coluna pode ser movida ou copiada | idem |
| 7 | Escolher chaves | Clique seleciona (e leva o cursor à chave, se "jump to key" estiver ligado). Ctrl+clique soma. Ctrl+A seleciona a linha toda. Arrastar no vazio faz caixa de seleção | [Dopesheet](https://esotericsoftware.com/spine-dopesheet) |
| 8 | Mover chaves no tempo | Arrastar para os lados. Shift = sem encaixe no quadro. **Ctrl+Shift ao começar o arrasto duplica** | idem |
| 9 | Esticar o tempo | Arrastar a borda esquerda ou direita da caixa de seleção; cruzar as bordas inverte a ordem | idem |
| 10 | Apagar chave | Duplo clique, ou **Delete** | idem · [Keys](https://esotericsoftware.com/spine-keys) |
| 11 | Copiar / colar | Botões **Copy · Cut · Delete · Paste** (nessa ordem, da esquerda). **Ctrl+C / Ctrl+X / Ctrl+V**. Cola **na posição atual da linha do tempo**. Chave de osso pode ser colada em **outro** osso selecionando-o antes | [Keys — Clipboard buttons](https://esotericsoftware.com/spine-keys) |
| 12 | Copiar pose de osso | Ctrl+C / Ctrl+V nas ferramentas: "colar transformação de osso" define rotação, translação, escala e cisalhamento | [Tools](https://esotericsoftware.com/spine-tools) |
| 13 | Espelhar | Não há botão "colar espelhado" na página de chaves. O **Tools** diz: espelhar = ferramenta **Escala (X)** com o eixo em **-1** | [Tools](https://esotericsoftware.com/spine-tools) |
| 14 | Fechar o laço (deslocar chaves) | Botão **Offset**: move chaves e as reenrola ao início se passarem do fim. Atalho: segurar **Ctrl+Alt** ao arrastar | [Keys — Offset](https://esotericsoftware.com/spine-keys) |
| 15 | Empurrar o resto | Botão **Shift**: ao mover uma chave, todas as depois dela vão junto. Atalho: **Alt** ao arrastar | [Keys — Shift](https://esotericsoftware.com/spine-keys) |
| 16 | Início e fim do laço | Pôr o cursor no quadro e clicar **Loop Start** ou **End**, ou digitar o número | [Dopesheet](https://esotericsoftware.com/spine-dopesheet) |
| 17 | Ajuste relativo | Com **Adjust** ligado, mexer nos ossos ajusta todas as chaves selecionadas pelo mesmo tanto | idem |
| 18 | Curva da chave | Selecionar chaves e clicar um tipo: **Stepped** (segura o valor até a próxima), **Linear**, **Bezier** (duas alças arrastáveis). Presets: **Automatic · Separate · Flat · Bounce · Ease out/in** (também põem a curva em Bezier). Alça: Alt separa · Shift só o comprimento · Ctrl+Shift o comprimento das duas | [Graph](https://esotericsoftware.com/spine-graph) |
| 19 | Velocidade e FPS | Cursor de velocidade na Playback view; **Stepped** toca sem interpolar; FPS da linha do tempo (30 padrão) deve ser escolhido **antes** de animar | [Playback](https://esotericsoftware.com/spine-playback) |
| 20 | Método (pose a pose) | O guia descreve: **straight ahead**, **pose to pose** (poses principais primeiro, depois o tempo), em camadas, combinado | [Animating](https://esotericsoftware.com/spine-animating) |

**Não achei** nas páginas do Spine consultadas:

| O quê | Situação |
|:---|:---|
| Botão/atalho exato para entrar no modo Animar | não achei (o Tools só diz que Setup e Animate são modos; a página `spine-modes` deu 404) |
| Trocar a imagem de um slot no meio da animação | não consegui ler a página do Spine sobre isso; **não achei** |
| Diálogo de nome da animação nova | não achei; só que duplo clique renomeia |
| "Paste flipped" / colar espelhado | **não existe** na página de chaves. Só o espelhar por Escala -1 |
| Tutorial em vídeo "Animating with Spine" | o guia o cita ([getting started](https://esotericsoftware.com/spine-getting-started)), sem título nem link; **não achei** |
| Ciclo de andar oficial passo a passo | a busca só trouxe posts de fórum ([exemplo](https://en.esotericsoftware.com/forum/d/24628-improve-your-walk-cycle-animations-with-these-steps)) cujo corpo não veio; **não li**. Poses de andar: contato · passagem · baixo · alto (resumo de resultado de busca, não confirmado na fonte) |

### 1.3 A FILA que uso no nosso (Spriter primeiro, Spine encaixado)

| # | Passo da fila | Vem de |
|:---:|:---|:---|
| 1 | Criar a animação e dar nome | Spriter 1 · Spine 1 |
| 2 | Posar o primeiro quadro | Spriter 2 |
| 3 | Andar no tempo | Spriter 3 |
| 4 | Posar o segundo quadro (a chave nasce) | Spriter 4 · Spine 3–4 |
| 5 | Copiar a pose e colar noutro ponto | Spriter 6 · Spine 11 |
| 6 | Colar espelhada (o outro pé à frente) | Spine 13 (Escala -1). No Spriter: não achei |
| 7 | Fechar o laço (voltar ao 1º quadro no fim) | Spine 14 e 16. No Spriter: não achei |
| 8 | Tocar | Spriter 12 · Spine 19 |
| 9 | Ajustar o tempo das chaves | Spriter 7 · Spine 8 |
| 10 | Mudar a curva de uma chave | Spine 18. No Spriter: não achei |
| 11 | Trocar a imagem no meio da animação | Spriter 11 |

---

## PARTE 2 — A SEQUÊNCIA NO NOSSO (2ª entrega)

**Como foi feito.** Com a mão, no navegador do app, como usuário. Não li código para achar botão. Não abri
a folha `O QUE O PROGRAMA FAZ`. Li os **nomes das dicas** (tooltips) pela árvore de acessibilidade
em dois momentos, e digo onde.

| Item | Valor |
|:---|:---|
| Programa | o **montado**, `programa/servidor.mjs`, porta **5311**. `LEIA-ME.txt` diz **v22.7**, de 22/09 (o Planejador disse v22.8: conferir) |
| Tela | 1440×900 emulados |
| Fotos | `backup/fotos-rodada-final/uso-animar/`. As três de prefixo `00`, `01`, `xx` vieram da **5211** (modo de desenvolvimento). **Todas as outras, da 5311** |
| Boneco | o herói de exemplo, `Arquivo → Abrir o herói` |
| Um truque de teste | o nome da animação nova se pede numa caixa **nativa** do navegador (`prompt`), que o painel de teste não mostra. Troquei a caixa por uma resposta fixa ("andar"). **Não é defeito do programa**; num Chrome de verdade a caixa aparece |

Os passos são os da fila 1.3. A pergunta de cada coluna é a da régua do arroz:
**P1** achei a ferramenta sem procurar? · **P2** o que criei apareceu? · **P3** o programa disse o que aconteceu? · **P4** ficou óbvio o passo seguinte?

### Passo a passo

| # | Passo | P1 achei? | P2 apareceu? | P3 disse? | P4 próximo óbvio? | Foto |
|:---:|:---|:---|:---|:---|:---|:---:|
| 0 | Abrir o herói | **Sim.** `Arquivo → Abrir o herói (exemplo)`, e um cartão igual na tela de boas-vindas | Sim, o boneco veio | Sim: rodapé "Abriu a base. Arquivo salvo." | **Não.** A tela diz "Base: heroi — Mexer grava na base". Nada manda "crie uma animação" | 02 |
| 1 | Criar a animação | **Sim.** Duas portas: botão **+** no painel Animações, e `Animação → Nova animação`. O menu Animação é o lugar certo | **Só em parte.** A linha do tempo abriu (quadro 0 / 1,00 s), mas **o nome novo não se vê**: a lista do painel Animações mostra só uma fatia de uma linha, e não rola. Só achei a lista arrastando um divisor sem alça à vista | Sim: rodapé "Abriu a animação 'animação'" e a etiqueta laranja "Animação: animação · Mexer grava chave." | **Sim.** A etiqueta diz o que fazer: mexer grava chave | 04 · 06 · 07 |
| 1b | Dar nome | **Sim.** Lápis do painel, ou `Animação → Renomear` | Sim, o nome mudou na lista | **Pouco:** ao renomear, o rodapé diz "**Abriu** a animação 'andar'". O verbo está errado | Sim | 05 · 08 |
| 2 | Posar o 1º quadro (girar a coxa) | **Em parte.** Clicar no boneco pega o osso, mas **nem sempre o que eu quis**: pedi a coxa de trás e veio a canela. O nome do osso só aparece em Propriedades ("Osso: shin"). A bolinha do gizmo gira, e a dica dela diz isso | **Sim.** O boneco mexeu, e um losango nasceu na linha Resumo em 0,00 s | **Não.** O rodapé continua "Mexer grava chave.". Nenhuma frase diz "chave criada em 0,00 s". A prova é um losango pequeno e a caixa do tempo ficar laranja. **A cor não é explicada** | **Não.** Nada indica "agora vá a outro ponto do tempo" | 10 · 11 · 12 |
| 3 | Andar no tempo | **Sim.** Clicar na régua. Também as teclas Início/Fim (estão no menu Animação) | Sim: marcador vermelho "0,27 s · q 8" na régua e "quadro 8 / 1,00 s" | Sim, o marcador diz o tempo e o quadro | Sim | 13 · 25 |
| 4 | Posar o 2º quadro | **Difícil.** Escolher o osso certo: pelo boneco, errei duas vezes; pela Árvore, a janela mostra ~9 linhas e o `leg_b` só apareceu **depois de dobrar o torso**. `Editar → Escolher` só tem "os filhos / os pais" (`]` `[`): **não tem "irmão"** | Sim, o boneco mexeu | Sim: "Mudar ângulo." | **Não** | 19 · 20 · 21 · 22 · 23 |
| 4b | Digitar o ângulo | **Sim.** Propriedades → Ficha rápida → Ângulo | Sim, a perna foi | Rodapé "Mudar ângulo." | — | 24 · 31 |
| 5 | Copiar a pose e colar | **Sim, e é o passo melhor do programa.** `Editar → Copiar a pose inteira` e a tecla **Ctrl+Shift+C** (a mesma do Spriter). Cola com **Ctrl+V** | **Sim.** Novo losango em 0,50 s | **Sim, muito bom:** "Pose de 0,00 s copiada: 2 valores." e depois "Colar chaves." | **Sim** | 14 · 16 · 17 |
| 6 | Colar **espelhada** | **Não se acha.** Não há `Colar espelhado` em nenhum menu (`Editar`, `Esqueleto`, `Animação`). `Inverter a seleção` (Ctrl+Shift+I) **não** espelha: inverte quem está escolhido. `Copiar / Colar posição do osso` copia **um** osso, sem espelhar | — | — | **Não.** Tive que girar cada perna à mão, a olho | 14 · 15 · 18 |
| 7 | Fechar o laço | **Em parte.** Para o **fim da animação**: tecla **End**, depois Ctrl+V (a pose do início fica igual no fim). Sem instrução, sem botão "fechar o laço". O botão **Repetir (L)** existe no tocador e **vem desligado** numa animação nova | Sim: losango em 1,00 s | O rodapé disse "Repetir ligado em andar." ao ligar. **Mas a lista de animações só mostrou a etiqueta "repete" depois de eu escolher outra animação e voltar** | **Não.** Nada avisa que uma animação nova **não repete** e que um ciclo precisa disso | 25 · 26 · 28 · 29 · 30 |
| 8 | Tocar | **Sim.** Botão Tocar no tocador, Espaço no menu | **Sim.** Vi as pernas cruzando em 0,33 s | Sim: o botão vira Pausar, o marcador anda | Sim | 27 |
| 9 | Ajustar o tempo das chaves | **Sim, e é como no Spriter.** Arrastar o losango na linha do tempo. Botão **Detalhes** abre a linha do tempo grande | Sim: a chave foi de 0,50 s para ≈0,43 s | Sim: "Mover chaves." | Sim | 32 · 33 |
| 10 | Mudar a curva de uma chave | **Não se acha.** A aba **Curvas** abre com um gráfico e **nenhum botão de formato à vista**. Os botões (Suave, Entrada suave, Saída suave, Linear, Degrau, Passa do alvo, Recua e passa) estão **abaixo do gráfico, e só aparecem rolando a aba**. Achei porque rolei | Sim: o gráfico mudou para um S | **Sim:** "Curva Linear." / "Curva Suave." e o texto "Chave em 0,43 s de leg_b — Rotação. As alças vão até a próxima chave." | Sim | 34 · 35 · 36 · 37 · 38 |

| 11 | Trocar a imagem no meio da animação | **Em parte.** O caminho existe: escolher o rosto → Propriedades → Ficha rápida → **Imagem** abre a janela *"Trocar a imagem de head"*, com a grade das imagens. Mas **clicar no rosto ligou a ferramenta Malha sozinha** (o gizmo do osso sumiu) | **Sim, a imagem trocou.** Só que ela vale **também antes** do quadro: em 0,00 s e em 0,23 s o rosto já é o novo. O Spriter troca **naquele momento** | **Sim, bem dita, e errada:** *"head mostra 'cape_upper' a partir de 0,50 s, só nesta animação."* O "a partir de" **não é o que a tela faz** | **Não.** O campo Imagem continua "face". Na Linha do tempo só há um losango no **Resumo** em 0,50 s, sem linha "head · imagem" | 39 · 41 · 42 · 43 · 46 · 47 |

---

## O RESUMO DA RÉGUA DO ARROZ

| Passo | Panela (achei?) | Arroz (apareceu?) | Água (avisou?) | Ordem (próximo óbvio?) |
|:---|:---:|:---:|:---:|:---:|
| 0 Abrir o herói | sim | sim | sim | **não** |
| 1 Criar a animação | sim | **não** (lista cortada) | sim | sim |
| 1b Dar nome | sim | sim | **pouco** (verbo errado) | sim |
| 2 Posar o 1º quadro | em parte | sim | **não** | **não** |
| 3 Andar no tempo | sim | sim | sim | sim |
| 4 Posar o 2º quadro | **difícil** | sim | sim | **não** |
| 5 Copiar e colar a pose | sim | sim | **sim, muito bem** | sim |
| 6 Colar espelhada | **não se acha** | — | — | **não** |
| 7 Fechar o laço | em parte | sim | pouco (a lista não atualiza) | **não** |
| 8 Tocar | sim | sim | sim | sim |
| 9 Ajustar o tempo das chaves | sim | sim | sim | sim |
| 10 Mudar a curva | **não se acha** | sim | sim | sim |
| 11 Trocar a imagem no meio | em parte | **errado** (vale antes) | diz e não cumpre | **não** |

**Onde a fila quebra, em uma frase:** o programa **grava** bem e **fala** bem depois do gesto,
mas **não conduz**. Três degraus não têm porta (colar espelhada, o laço, a curva à vista) e
em cinco lugares ninguém diz o passo seguinte.

## Defeitos deste documento, por tipo

Os 15 (K1 a K15) estão em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, seção *Do chat K*.

| Tipo | Quantos | Quais |
|:---|:---:|:---|
| NÃO SE ACHA | 3 | K5 colar espelhada · K9 botões da curva · K10 escolher o osso irmão |
| CRIEI E SUMIU | 1 | K1 a lista de animações cortada |
| FEZ E NÃO AVISOU | 4 | K2 verbo errado ao renomear · K3 chave sem frase · K11 ferramenta muda sozinha · K12 a troca sem linha própria |
| A SEQUÊNCIA QUEBRA AQUI | 3 | K4 sem próximo passo · K6 animação nova não repete · K13 Detalhes encolhe a cena |
| DEU ERRO | 4 | K7 etiqueta "repete" velha · K8 campos que não seguem o quadro · K14 caixa nativa · K15 a troca vale para trás |
| **Total** | **15** | |

## O que não consegui ver

| O quê | Por quê |
|:---|:---|
| A janela de renomear de verdade | é caixa nativa do navegador; troquei por resposta fixa |
| Salvar e reabrir o `.bone` com a animação | a ordem de hoje do Humberto: nenhum chat abre janela do sistema. **Não fiz** |
| Se `Colar em todas as chaves` (Ctrl+Shift+V) serve ao ciclo | não usei |
| A **Prévia** (aba) e o **Tocar para trás** | não usei nesta fila |
| A versão exata do `programa/` | o `LEIA-ME` diz v22.7, o Planejador disse v22.8. Não achei um "Sobre" à vista para conferir na tela |


---

## CONFERÊNCIA NA v23.2 — 29/09/2026

Chat K, refazendo a fila inteira no programa **montado v23.2** (`programa/LEIA-ME.txt`: "v23.2, montada em 29/09/2026").

| Item | Valor |
|:---|:---|
| Como | servidor `programa/servidor.mjs` na 5311 (um só, parado pelo PID ao fim) e **Chrome sem janela**, 1440×900, dirigido por um script meu (mouse, teclado, roda, foto). Sem painel de navegador do aplicativo. Nenhuma janela do Windows |
| Fotos | `backup/fotos-rodada-final/uso-animar/v23.2/`, **34 fotos** (`00` a `33`), em tamanho inteiro |
| Caixas nativas | o script conta as caixas do navegador (`prompt`, `confirm`): **nenhuma** apareceu, em nenhum passo |
| Memória | medi antes de abrir: 340 MB (esperei), 532 MB, 842 MB. Abri com 842 MB |

### A fila, passo a passo, na v23.2

| # | Passo | Achei sem procurar? | Apareceu? | Disse o que aconteceu? | Próximo óbvio? | Foto |
|:---:|:---|:---|:---|:---|:---|:---:|
| 0 | Abrir o herói | **Sim.** `Arquivo → Abrir o herói (exemplo)` e o cartão da tela de boas-vindas | Sim. O título agora é **`heroi.bone`** (o lixo `heroi-DUlefYnW` sumiu) | "Abriu a base. Arquivo salvo." | **Não.** Continua "Base: heroi — Mexer grava na base" sem apontar uma animação. Mas na lista há uma linha nova, **"Base — montar"**, e o menu `Animação` abre com **Abrir a base**, **Nova animação** | 02 · 03 |
| 1 | Criar a animação | **Sim.** `Animação → Nova animação` é o 2º item do menu | **Sim.** A linha nova aparece na lista, **com o campo do nome aberto e o texto escolhido** | **Sim:** *"Animação "animação" criada, em laço. Escreva o nome e aperte Enter."* | **Sim, para o nome.** Depois de nomear: não | 04 |
| 1b | Dar nome | **Sim.** Digitar e Enter, ali mesmo, na lista | Sim | **Sim:** *"Renomeou a animação "animação" para "andar"."* | Sim | 05 |
| 2 | Posar o 1º quadro | **Sim.** Clicar na perna pegou o osso certo (`leg_b`), e a **Árvore rolou até ele** | Sim. Losango em 0,00 s | **Pouco:** *"Girar -22,6°."*. Nada diz que nasceu uma chave | **Não** | 07 · 08 · 09 · 10 |
| 3 | Andar no tempo | Sim (régua; Início/Fim no menu) | Sim | Sim ("0,50 s · q 15") | Sim | 12 |
| 4 | Posar o 2º quadro | — (feito pelo passo 6) | — | — | — | — |
| 5 | Copiar a pose e colar | **Sim.** `Editar → Copiar a pose inteira` (Ctrl+Shift+C) | Sim | **Sim:** *"Pose de 0,00 s copiada: 2 valores."*. Ao colar em 1,00 s: *"2 chaves em 1,00 s: Rotação de leg_b, Rotação de leg."* | Sim | 11 · 16 |
| 6 | Colar **espelhada** | **Sim.** `Editar → Colar espelhado`, logo abaixo de *Colar em todas as chaves* | **Sim.** As pernas trocaram de lado em 0,50 s | **Sim:** *"Colado espelhado: 2 valores trocados de lado."* | Sim | 13 · 14 |
| 7 | Fechar o laço | **Sim.** End, depois `Editar → Colar` | Sim, losango em 1,00 s | Sim (a frase acima) | Em parte: nada diz "o laço está fechado" | 15 · 16 |
| 8 | Tocar | Sim | Sim | Sim | Sim | 17 · 18 · 19 |
| 9 | Ajustar o tempo das chaves | Sim (arrastar o losango; não repeti nesta volta) | — | — | — | — |
| 10 | Mudar a curva | **Não.** Em `Detalhes → Curvas`, os botões (Suave, Entrada suave, Saída suave, Linear, Degrau, Passa do alvo, Recua e passa) **continuam abaixo do gráfico**: só aparecem rolando a aba | Sim: a curva virou uma "saída suave" (25) | **Sim:** *"Curva Saída suave."* | Sim | 20 · 21 · 22 · 23 · 24 · 25 |
| 11 | Trocar a imagem no meio | **Sim.** Escolher o rosto → Ficha rápida → **Imagem** → grade "Trocar a imagem de head" | **Sim, e certo.** Em 0,00 s o rosto é **`face`**; em 0,50 s, `cape_upper` | **Sim, e agora é verdade:** *"head mostra "cape_upper" a partir de 0,50 s, só nesta animação, na pele default (a de todos)."* | Sim: a linha "Slot head · Desenho" mostra as duas chaves | 26 · 27 · 28 · 29 |

### K1 a K15, um por um

| # | O defeito de antes | Na v23.2 | Foto | O que vi |
|:---:|:---|:---:|:---:|:---|
| K1 | A animação nova não aparece na lista | **CONSERTADO** | 04 · 05 · 33 | A linha nasce visível, com o nome aberto para digitar. **Ressalva:** a lista continua com só **2 linhas de altura** (rola com a roda, 33) |
| K2 | Renomear dizia "Abriu…" | **CONSERTADO** | 05 | *"Renomeou a animação "animação" para "andar"."* |
| K3 | A chave nasce sem uma frase | **PELA METADE** | 08 · 16 | Colar diz *"2 chaves em 1,00 s: Rotação de leg_b, Rotação de leg."*. **Posar diz só *"Girar -22,6°."***, e a caixa do tempo continua laranja sem legenda |
| K4 | Nada manda o passo seguinte | **NÃO CONSERTADO** | 04 · 08 | A criação manda *"Escreva o nome e aperte Enter"*, e é só isso. Depois de posar e de colar nada aponta adiante |
| K5 | Colar espelhado não se acha | **CONSERTADO** | 13 · 14 | Está em **`Editar`**, no lugar onde se procura, com a frase *"Colado espelhado: 2 valores trocados de lado."* |
| K6 | Animação nova não repete | **CONSERTADO** | 04 · 05 | *"…criada, em laço."*, botão Repetir aceso, etiqueta "repete" na linha |
| K7 | Etiqueta "repete" só acende depois | **CONSERTADO, com ressalva** | 05 | A animação **já nasce em laço**, com a etiqueta. **Não repeti o gesto exato** (desligar e ligar de novo) |
| K8 | Campos da Ficha não seguem o quadro | **PELA METADE** | 28 · 29 · 32 | **Imagem segue**: `cape_upper` em 0,50 s e `face` em 0,00 s. **Ângulo: não consegui conferir**, porque o painel Propriedades tem 3 linhas de altura e o Ângulo fica escondido (ver K17) |
| K9 | Botões da curva abaixo do gráfico | **NÃO CONSERTADO** | 21 · 22 · 23 | Só aparecem rolando. **Melhorou o eixo:** agora traz o sinal de menos ("-60,00"). E o gráfico ficou maior |
| K10 | Escolher o osso certo é difícil | **PELA METADE** | 07 · 09 · 26 | Clicar na perna, na outra perna e no rosto pegou o osso certo nas três vezes, e a **Árvore rola até o osso escolhido**. **Não testei** o "irmão" (`Editar → Escolher`) |
| K11 | Clicar no rosto liga a ferramenta Malha | **CONSERTADO** | 26 | Cliquei no rosto e escolheu o osso `head`. A ferramenta seguiu **Transformar**. *O Planejador disse "ainda não": no meu gesto, funcionou* |
| K12 | A troca de imagem não tem linha própria | **CONSERTADO** | 28 · 29 | Linha **"Slot head · Desenho"**, com chave em 0,00 s e em 0,50 s |
| K13 | Detalhes encolhe a cena a uma faixa | **PELA METADE** | 20 | A cena caiu de ~600 para **~420 px** de altura: **não é mais uma faixa**, mas a cabeça e os pés ficam cortados. E o painel **Animações perde a lista** com os Detalhes abertos |
| K14 | Renomear com caixa do navegador | **CONSERTADO** | 04 · 05 | Nenhuma caixa nativa. O campo é do programa |
| K15 | A troca de imagem vale para trás | **CONSERTADO** | 28 · 29 | Em 0,00 s o rosto é `face`. A troca começa em 0,50 s, como a frase diz |

**Placar:** CONSERTADOS **8** (K1, K2, K5, K6, K11, K12, K14, K15) · consertado com ressalva **1** (K7) · PELA METADE **4** (K3, K8, K10, K13) · NÃO CONSERTADOS **2** (K4, K9). Total 15.

### A pergunta que mais importa: achei SEM procurar? (menus na nova ordem)

| O que eu queria | Onde achei | Sem procurar? |
|:---|:---|:---:|
| Criar uma animação | `Animação → Nova animação` (2º item) | **Sim** |
| Dar o nome | o campo abre sozinho na lista | **Sim** |
| Colar a pose espelhada | `Editar → Colar espelhado`, ao lado de Colar | **Sim** |
| Repetir (laço) | já nasce ligado; `Animação → Repetir (L)` | **Sim** |
| Trocar a imagem no meio | Ficha rápida → Imagem | **Sim** |
| Mudar a curva | `Detalhes → Curvas`, e os botões **rolando** | **Não** |
| Fechar os Detalhes | o botão fica escondido atrás da barra do tocador depois da troca de imagem (K16) | **Não** |
| Ver o Ângulo do osso | Propriedades, rolando um painel de 3 linhas | **Não** |

### Defeitos novos (também em `DEFEITOS achados no uso 2026-09-28.md`)

| # | Tipo | O defeito | Foto |
|:---:|:---|:---|:---:|
| K16 | **DEU ERRO** | Ao trocar a imagem, os **Detalhes abrem sozinhos e cobrem o tocador**: os botões Chavear e Chavear tudo aparecem cortados pela metade | 28 · 29 |
| K17 | **NÃO SE ACHA** | O painel **Propriedades tem 3 linhas de altura** em 1440×900. O Ângulo, a Escala e a Posição do osso ficam escondidos, e só aparecem rolando | 31 · 32 |
| K18 | **a medir** | Ctrl+V pelo teclado **não colou** (o menu `Editar → Colar` colou). Pode ser só o meu Chrome sem janela, que não envia o evento de colar do navegador. **Não conte como defeito antes de outro olho** | 15 · 16 |
