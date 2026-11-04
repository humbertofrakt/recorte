# Os nove consertos conferidos — 05/10/2026

Rodada 26. Conferente: `CONFERINDO · rodada 24 — os consertos e os painéis` (o mesmo chat, com a ficha do Diretor de 11h18).
**Nenhum código foi mexido.** Só usei o programa e fotografei.

| | |
|:---|:---|
| Versão montada | **v27.5**; o "Sobre" diz **v27.5** (K1) |
| Como | `programa/` por `servidor.mjs` na porta 5324 · Chrome sem janela (9424) · mouse e teclado por protocolo; o arrasto de arquivo por `Input.dispatchDragEvent` |
| Telas | 1920×1080 (todas as linhas). Não repeti em 1440×900 e 1280×720: a ficha mandou começar pela do Humberto e eu não voltei |
| Fotos | `backup/fotos-obra/rodada-26/` (28) |
| Hora | 11h19 a 11h49 do relógio da máquina, 05/10/2026 |
| Material | o herói de exemplo e `formato/exemplos/` |
| Para o K11 (o "como antes") | extraí o `programa/` da **v27.4**, do zip em `backup/versoes/`, e o servi numa segunda porta (5325) **só para comparar**; desliguei no fim. É a única forma de ter o "antes" de verdade |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Não achei a porta | Não dá sem janela |
|:---:|:---:|:---:|:---:|:---:|
| **9** | **2** (K8, K9) | 0 | 0 | 0 |

11 linhas. **Nenhum "não funciona".**

## Os defeitos, do pior para o menor

| # | Defeito | Linha | Foto | Como repetir |
|:---:|:---|:---:|:---|:---|
| 1 | **No painel Propriedades de baixo, digitar Rotação, Posição X/Y ou Escala X/Y de uma imagem numa animação muda a BASE.** O rodapé diz *"Mudar Rotação"* (e não *"Chave em 0,33 s: Imagem forearm: …"*) e o Histórico diz *Mudar Rotação*. Conferi o desenho: com Rotação 60 digitada no quadro 0,33 s, **na base** o antebraço aparece girado (foto). Um `Ctrl+Z` desfaz. É o que o executor disse (só mexeu na ficha rápida); aqui está a prova de que o painel de baixo continua errado | K9 | `K9_08_lower_panel_base_mudou` · `K9_09_base_apos_edicao_painel_baixo` · `K9_10_base_apos_undo` | Abrir idle. Quadro 0,33 s. Escolher a imagem `forearm` (clicar nela na cena). Rolar **Propriedades** (o painel de baixo, a seção da imagem) até **Rotação**; digitar 60 e `Enter`. Ler o rodapé; abrir a Base e olhar o antebraço |
| 2 | **Escolher a imagem `hand` na cena e o painel Pivôs mostra `body`; o pivô que se muda ali é o de `body`.** `hand` é uma sequência (`hand_01…`): a imagem escolhida não tem célula no painel, e ele cai em `body`. Também: com um **osso** escolhido o painel às vezes volta a `body` (osso `arm`, `cape1`, `torso`), às vezes fica na imagem de antes (osso `cape2`, `leg`) | K8 | `K8_cena` · `K8_painel_pivos_segue` | Pivôs aberto. Clicar a mão do herói na cena (Anexo: hand). Ler o nome no painel e clicar um dos nove pontos |
| 3 | **Sobras de "esqueleto" na tela, depois do K5:** a **dica** (`title`) do mini-ícone da Árvore diz *"esqueleto filho"* (num `.bone` com entidade, `capacete.bone`) · o aviso ao abrir um projeto sem a entidade diz *"O esqueleto aninhado espada.bone não foi aberto; esse slot…"* | C (K5) | `K5_lista_de_avisos` | Soltar `capacete.bone` na tela e passar o mouse no ícone das linhas da Árvore · abrir `heroi.bone` com o atlas **sem** `espada.bone` junto |
| 4 | **Depois de a imagem ganhar chave, a ficha rápida mostra o valor da chave como diferença, e não o que se digitou.** Digitei X = 25 e a ficha leu **7** (25 − 18, a posição da base); digitei 40, leu 22. Y e Escala idem. O desenho vai para onde se pediu; o número é que fica outro | K9 | | Quadro 0,33 s, escolher `forearm`, digitar 25 em X, olhar o campo |
| 5 | A altura do painel solto pára em **80 % da camada** (645 de 807 px, em 1920×1080), embora a tela deixe mais. A largura vai até a borda | K3 | `K3_canto_ate_a_borda` | Soltar um painel e puxar o canto até o fundo da tela |
| 6 | O rodapé de Salvar ainda diz *"O manifesto do projeto baixados"* (concordância) | C | | Salvar como… |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| K1 | O "Sobre" diz v27.5 | **vi funcionar** | Ajuda → Sobre o Recorte: *"Versão v27.5"* | `K1_sobre` | |
| K2 | Soltar o painel da parede solta o painel em uso, dos dois lados; Fechar o grupo fecha o grupo em uso, dos dois lados | **vi funcionar** | **Soltar:** cliquei a aba e usei Janela → Arrumar → Soltar o painel da parede, para as oito abas `Árvore · Ordem · Propriedades · Imagens · Entidades · Animações · Skins · Regras`: **saiu sempre a que eu tinha escolhido** (três à esquerda, cinco à direita; antes saía sempre uma da direita). **Fechar o grupo:** com a aba em uso de cada um dos **quatro** grupos (esquerda cima e baixo, direita cima e baixo), **fechou o grupo dela**, e o rodapé nomeou quem fechou | `K2_ultimo_solto` | |
| K3 | O canto do painel solto segue um arrasto rápido para fora, até onde a tela deixa; encolher continua; depois de largar o canto não gruda na mão | **vi funcionar** | Solto `Imagens` (280×320). Arrasto do canto: **3 passos de 100 px** → 580 de largura (+300) · **8 passos de 37 px** → 880 (+300) · **um salto de 400 px** → 1.100 (**pára na borda da tela**, 820 + 1.100 = 1.920) · **diagonal em 6 passos** → 1.100 × 460. **Encolher** 320 × 160: 780 × 300. **Depois de largar**, mexi o mouse pela tela inteira e a caixa **não mudou** (não ficou grudada). Até o fundo: pára em **645 de altura** (defeito 5) | `K3_canto_ate_a_borda` | |
| K4 | Com o emissor escolhido, Propriedades fala de emissor | **vi funcionar** | Partículas → Fogo. Seções de Propriedades: **EMISSOR** · ONDE ESTÁ · O EMISSOR · QUANDO NASCE · VIDA E TETO · … (antes a primeira era **ANEXO**). Varredura de palavras na tela: nada | `K4_emissor_propriedades` | |
| K5 | Abrir um `.bone` sem atlas: o aviso não diz "esqueleto" | **vi funcionar** | Soltei `capacete.bone`: *"**Esta base** usa heroi.atlas.json, que mora na pasta do projeto, e **ela** veio sozinha: as imagens ficaram de fora…"*. *(Ver defeito 3: ainda sobra "esqueleto" em duas outras frases)* | `K5_bone_sem_atlas` · `K5_lista_de_avisos` | |
| K6 | Mudo o pivô, salvo, fecho e reabro: janela e painel mostram o pivô novo; o desenho não andou | **vi funcionar** | Abri o herói **com o atlas** (a pasta do projeto em memória: ver "O que troquei por um falso"). Mudei o pivô de `arm` (27, 17). Salvei, fechei (Novo projeto), reabri com `heroi.bone`, atlas, png e `espada.bone`. **A janela Definir pivô lê "X 27 · Y 17"** e **o painel Pivôs diz "arm: pivô em 27, 17" com a marca "à mão"**. **O desenho:** a foto da região é **idêntica** antes de mudar, depois de mudar e depois de reabrir | `K6_dialogo_apos_reabrir` · `K6_painel_pivos_apos_reabrir` | |
| K7 | A janela de definir pivô diz a verdade | **vi funcionar** | Imagens → Definir pivô…: *"1 desenho usa esta imagem. **Ele fica parado: só o ponto do pivô muda de lugar.**"* (antes: *"será recolocado pelo pivô novo"*). O rodapé depois de gravar diz o mesmo (*"1 desenho ficou parado"*) | `K7_dialogo_definir_pivo` | |
| K8 | Escolho uma imagem na cena ou na Árvore: o painel Pivôs passa a mostrar aquela imagem, e o pivô que eu mudar ali é o dela | **pela metade** | **Árvore:** `thigh` → o painel mostra `thigh`. **Cena:** cliquei, uma a uma, `hair`, `body`, `arm`, `cape_upper`, `forearm`, `cape_lower`, `shin_back`, `foot_back`, `foot`: **o painel mostrou cada uma**. Mudei o pivô de `foot` pelo painel: *"Pivô de "foot"…"* ✓. **Mas** a **mão** (`hand`, uma sequência) o painel não segue: mostra `body`, e o pivô mudado é o de `body`. E ao escolher um osso o painel volta a `body` ou fica na imagem de antes, sem regra que eu veja (defeito 2) | `K8_cena` · `K8_painel_pivos_segue` | Defeito 2 |
| K9 | Numa animação, digito Ângulo (e X, Y, Escala) de uma imagem sem chave própria: nasce a chave, a base não muda, um Ctrl+Z desfaz tudo; com a base aberta, vai para a base. Nos dois lugares onde se digita | **pela metade** | **Ficha rápida ✓.** Idle, 0,33 s, `forearm` (sem chave própria). **Ângulo 60:** *"Chave em 0,33 s: Imagem forearm: Rotação"*; a linha "Imagem forearm · Rotação" nasce na linha do tempo; no quadro 0 o valor continua 0; **a base continua 0**; **um** `Ctrl+Z` (*"Desfeito: Mudar Ângulo"*) e o valor volta a 0. **X, Y, Escala X e Escala Y:** cada um deu *"Chave em 0,33 s: Imagem forearm: Posição X / Posição Y / Escala X / Escala Y"*, e um `Ctrl+Z` voltou. **Com a base aberta**, digitar o Ângulo vai para a base (*"Mudar Ângulo"*, o campo fica 30; `Ctrl+Z` desfaz). **Mas o painel Propriedades de baixo não faz isso** (defeito 1): ali vai para a base. *(O defeito 4: a ficha lê a diferença)* | `K9_01_apos_digitar_angulo` · `K9_04_angulo60` · `K9_08_lower_panel_base_mudou` · `K9_09_base_apos_edicao_painel_baixo` | Defeito 1 |
| K10 | Nada quebrou ao lado: três linhas que eu já tinha visto | **vi funcionar** | **Painéis:** puxar a aba (sombra, `grabbing`, solta com barra) · recolher em ícones e expandir · dois cliques na aba. **Pivô:** mudar, *Voltar o pivô para o osso*, `Ctrl+Z`: a região do desenho **igual** nos quatro momentos. **Peça que volta:** apagar `arm_b` (*"20 chaves de 2 peças guardadas em 3 animações"*), criar e renomear para `arm_b` (*"12 chaves guardadas voltaram de "arm_b", em 3 animações"*): o Ângulo em **walk** é **−178 / −163,33 / −192,67**, **igual** ao de antes | `K10_paineis` · `K10_pivo_antes` | |
| K11 | O herói e os exemplos com entidade encaixada desenham como antes | **vi funcionar** | Comparei a **v27.4** (do zip, na porta 5325) com a **v27.5** (porta 5324), mesma tela, mesma câmera (botão Ajustar), mesmo gesto: o herói (Abrir o herói) e os sete `.bone` de `formato/exemplos/` (`capacete`, `espada`, `mecha`, `mecha-animacoes`, `mecha-pele-inverno`, `minimo`, `particulas`). **Diferença de pixel na cena: 0 em todos os oito.** Os avisos e o número de linhas da Árvore **também iguais** (herói: nenhum aviso, 52 linhas; `capacete`: 6; `espada`: 2; `mecha`: 8…). *Limite:* só o herói tem imagens (é o único com atlas); nos outros a comparação é dos ossos, entidades e avisos, que é o que o editor desenha sem atlas | `K11_heroi_antes_v27.4` · `K11_heroi_agora_v27.5` · `K11_mecha_antes_v27.4` · `K11_mecha_agora_v27.5` | |

## Parte C — o que notei fora da lista

| # | O que |
|:---:|:---|
| C1 | Ao abrir o herói **com atlas** e sem `espada.bone` junto, o programa diz que a entidade não foi aberta, em frase com "esqueleto" (defeito 3), e o herói aparece **sem a espada** |
| C2 | **Navegar entre duas versões do programa no mesmo Chrome** deixa a tela da segunda no que a primeira gravou (cada porta tem o seu navegador-armazém; o `Voltar ao padrão` resolveu) |
| C3 | O programa recusa abrir um projeto novo com a pergunta do navegador quando há mudança não salva (`confirm`). Em robô, quem não responder cancela. Em uso normal está certo |

## O que troquei por um falso, para ninguém achar que conferi mais

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O seletor de pasta e o de arquivo do Windows (K6) | uma **pasta em memória** com `heroi.bone`, `heroi.atlas.json`, `heroi.png`, `espada.bone` (de `formato/exemplos/`), no lugar do seletor; **Arquivo → Abrir pasta do projeto…** e depois **Abrir projeto** com os arquivos juntos | que o Salvar grava certo numa pasta de verdade |
| A segunda versão do programa (K11) | o `programa/` da v27.4 tirado do zip e servido na porta 5325, depois desligado | — |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
