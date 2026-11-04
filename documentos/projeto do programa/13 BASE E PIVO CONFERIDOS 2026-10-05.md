# Base e pivô conferidos — 05/10/2026

Rodada 25. Conferente: `CONFERINDO · rodada 24 — os consertos e os painéis` (o mesmo chat da 24, com a ficha do Diretor de 10h22).
**Nenhum código foi mexido.** Só usei o programa e fotografei.

| | |
|:---|:---|
| Versão montada | **v27.4** (o "Sobre" diz **v27.3**, pela mesma causa de antes: fica uma versão atrás) |
| Como | `programa/` por `servidor.mjs` na porta 5324 · Chrome sem janela (9424) · mouse e teclado por protocolo, mais o arrasto de verdade (`Input.setInterceptDrags`) para tirar a imagem da aba |
| Telas | 1920×1080 (tudo) · 1440×900 e 1280×720 (os menus novos e o diálogo; **os gestos de pivô e de chave só no 1920×1080**) |
| Fotos | `backup/fotos-obra/rodada-25/`, uma por linha |
| Hora | 10h22 a 10h53 do relógio da máquina, 05/10/2026 |
| Material | o herói de exemplo (Arquivo → Abrir o herói), e o mesmo herói aberto **com o atlas** (veja "O que troquei por um falso") |
| Como medi "o desenho não saiu do lugar" | **foto da região do desenho, antes e depois, comparada byte a byte** (uma região pequena em volta da peça, porque a malha de física do cabelo e da capa mexe a imagem inteira). Testei antes que a medida é estável: quatro fotos seguidas do mesmo estado dão o mesmo número, e Ctrl+Z devolve o número de antes |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Não achei a porta | Não dá sem janela |
|:---:|:---:|:---:|:---:|:---:|
| **12** | **1** (P3) | 0 | 0 | 0 |

13 linhas da ficha. **Nada "não funciona".**

## Os defeitos, do pior para o menor

| # | Defeito | Linha | Foto | Como repetir |
|:---:|:---|:---:|:---|:---|
| 1 | **Depois de salvar, fechar e reabrir, o pivô à mão volta a ser lido como o de antes.** Mudei o pivô de `arm` para 27, 17 e salvei. O `.bone` gravado **tem** o pivô novo (`pivosAMao: {arm: [27, 17]}`), o desenho **ficou onde estava** (foto idêntica), e a bolinha laranja "à mão" **voltou**. Mas **Imagens → Definir pivô…** e o painel Pivôs, depois de reabrir, dizem **4, 13** (o pivô do atlas), e não 27, 17. Antes de salvar diziam 27, 17 | P3 | `P3_06_pivos_reaberto` · `P3_07_dialogo_apos_reabrir` | Abrir o herói com atlas. Escolher `arm`. Imagens → Definir pivô…, clicar noutro ponto, Gravar. Arquivo → Salvar. Arquivo → Novo projeto. Abrir de novo. Imagens → Definir pivô… e ler "X · Y" |
| 2 | **A janela "Definir pivô" ainda diz *"1 desenho usa esta imagem e será recolocado pelo pivô novo."*** O que o programa faz agora é o contrário (o desenho fica parado, e o rodapé diz isso). O texto do diálogo ficou do comportamento antigo | P1 | `P1_00_dialogo_definir_pivo` | Imagens → Definir pivô… |
| 3 | **O painel Pivôs muda o pivô da imagem do PAINEL, não da que está escolhida na cena.** Escolhi a coxa (`thigh`) na Árvore, fui ao painel Pivôs e cliquei "pivô no centro": mudou o pivô de **`body`** (o que o painel mostrava). O rodapé diz o nome (*"Pivô de "body"…"*), mas quem acabou de escolher outra imagem não espera isso | P5 | | Escolher uma imagem na Árvore. Aba Pivôs, clicar um dos nove pontos. Ler o rodapé |
| 4 | Numa animação, **digitar o Ângulo de uma imagem que ainda não tem chave própria muda o ângulo na BASE** (o Histórico diz *"Mudar Ângulo"*, e vale em todas as animações), em vez de criar a chave própria. Para a mesma imagem, **arrastar** primeiro cria a chave (*"Mover imagem"*), e daí o Ângulo vira chave (*"Chave em 0,33 s: Imagem forearm: Rotação"*). A faixa do rodapé diz *"Mexer grava chave"* o tempo todo | P7 | `P7_00_forearm_antes` · `P7_01_forearm_depois_giro_q10` | Abrir idle. Escolher a imagem `forearm`. Quadro 10. Digitar 60 em Ângulo. Ler o rodapé e o Histórico |
| 5 | O "Sobre" diz **v27.3** com o programa montado v27.4 (a mesma causa do defeito 5 do `11`) | — | | Ajuda → Sobre o Recorte |
| 6 | *Não vi:* o texto cinza de **Base → Chaves guardadas…** quando não há nada guardado. O item não abre diálogo (bom), mas **não li a dica** que diz por quê | V3 | | Base → Chaves guardadas… sem nada guardado, ler a dica |

## A tabela

### Pivô

| # | O que tem de acontecer | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| P1 | Muda o pivô de uma imagem presa a um osso, sem chave própria: o desenho **não sai do lugar** (base e três quadros). O programa diz o que fez. Se vê que o pivô é à mão | **vi funcionar** | `arm` (presa ao osso `arm`), Imagens → Definir pivô…: cliquei outro ponto, Gravar o pivô. **Rodapé:** *"Pivô de "arm": 27, 17. 1 desenho ficou parado. O pivô fica guardado à mão: o osso não está nele."* **Medi:** na base, a região do braço tem o mesmo número antes e depois (e Ctrl+Z/Ctrl+Y não mexem); no idle, **quadros 0, 10 e 20: iguais antes e depois**. **Onde se vê o "à mão":** no painel Pivôs a miniatura de `arm` ganha uma **bolinha laranja**, a prévia diz **"arm · pivô à mão"**, e a dica diz *"Pivô à mão: o osso não está nele, e o desenho ficou parado. Imagens → Voltar o pivô para o osso desfaz"*. *(Ver defeito 2, o texto do diálogo)* | `P1_00_dialogo_definir_pivo` · `P1_03_depois_de_gravar` · `P1_05_braco_antes` · `P1_05_braco_depois` · `P1_07_painel_pivos` · `P1_08_previa_pivo_a_mao` | |
| P2 | Existe um jeito de voltar o pivô para o osso; nada anda; Ctrl+Z devolve | **vi funcionar** | Imagens → **Voltar o pivô para o osso** com `arm` escolhida: *"Pivô de "arm" de volta ao osso. Nenhum desenho andou."* A região do desenho **igual** antes e depois; a marca "à mão" **sumiu** (2 marcas → 0). `Ctrl+Z`: *"Desfeito: Voltar o pivô para o osso"*, a marca **voltou**, desenho igual | `P2_00_voltar_pivo` | |
| P3 | Salvo, fecho e reabro: o pivô é o novo, e o desenho está onde estava | **pela metade** | **O desenho está onde estava ✓** (foto da região igual antes de mudar e depois de reabrir). **O arquivo tem o pivô novo ✓** (`pivosAMao` no estado do editor). **Mas o pivô lido depois de reabrir é o de antes ✗** (4, 13, não 27, 17), com a marca "à mão" ainda ligada. *O seletor de arquivo e o de pasta do Windows foram trocados por falsos em memória: veja "O que troquei por um falso"* | `P3_04_pivo_mudado` · `P3_05_reaberto` · `P3_06_pivos_reaberto` · `P3_07_dialogo_apos_reabrir` | Defeito 1 |
| P4 | Imagem que já tem chave própria: o desenho fica parado na base e em cada chave; com giro entre as chaves o programa avisa | **vi funcionar** | Dei à coxa (`thigh`, "Imagem leg_front") chaves próprias: Posição X em 0,33 s, Rotação 40° em 0,67 s (e a chave do começo). Mudei o pivô. **Rodapé:** *"Pivô de "thigh": 26, 18. 1 desenho ficou parado. Entre as chaves de "idle", a imagem passa a girar em volta do pivô novo."* **Medi:** base **igual**; idle **quadros 0, 10 e 20 (as chaves) iguais**; **quadros 5 e 15 (entre as chaves, com giro) diferentes** — como o programa avisou | `P4_01_chaves_criadas` · `P4_04_dialogo_pivo_thigh` · `P4_05_apos_pivo` | |
| P5 | Todas as portas que mudam pivô dão o mesmo resultado | **vi funcionar** | Mesmo resultado (*"ficou parado"*, mais o aviso do giro quando cabe) por: **Imagens → Definir pivô…** · **Imagens → Copiar pivô / Colar pivô** (*"Pivô de "thigh": 26, 18,3. 1 desenho ficou parado. Entre as chaves de "idle"…, colado de "arm""*) · **o painel Pivôs** (nove pontos; desenho igual) · **o botão direito numa imagem da aba Imagens** (Definir pivô…, Copiar pivô, Colar pivô; colar: *"Pivô de "arm_back": 3,7, 12. 1 desenho ficou parado…"*). **Não achei como montar:** "Repetir para a pasta" (as imagens do herói estão na raiz; a pasta `armadura` tem uma imagem só). O botão direito **na cena** e **na Árvore** não têm item de pivô. *(Ver defeito 3)* | `P5_01_apos_colar` · `P5_04_botao_direito_imagens` · `P5_05_colar_pelo_botao_direito` | |
| P6 | "Carimbar pivôs" não desfaz o pivô à mão e diz que pulou | **vi funcionar** | Com `arm` à mão (27, 17), Imagens → Carimbar pivôs: *"20 pivôs carimbados (nenhum mudou). 1 imagem tem pivô à mão e ficou com ele: "Voltar o pivô para o osso" desfaz."* O pivô de `arm` continuou 27, 17 | `P6_00_carimbar` | |
| P7 | A chave própria numa imagem presa a um osso gira em volta do pivô; a imagem solta, em volta do centro | **vi funcionar** | **Presa a osso:** `forearm`; arrastei (cria a chave própria: *"Mover imagem"*) e, no quadro 10, Ângulo 60 (*"Chave em 0,33 s: Imagem forearm: Rotação"*). A imagem girou em volta da **ponta de cima (o cotovelo, onde está o pivô)**: o centro dela andou (365,333 → 434,267 na foto) e a ponta ficou. **Solta (`blade`, sem osso):** arrastei da aba Imagens para uma área vazia, girei pela alça (*"Girar 54,9°"*): ela girou **em volta do centro** (o ponto vermelho ficou parado no meio). *(Ver defeito 4 sobre como criar a chave)* | `P7_04_q10_antes_giro` · `P7_05_q10_depois_giro` · `P7_10_solta_antes` · `P7_11_solta_depois` | |

### Peças tiradas da base

| # | O que tem de acontecer | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| V1 | Apago da base uma peça com chaves em várias animações: o programa diz quantas guardou; as animações tocam sem erro; o arquivo salvo abre sem aviso de erro | **vi funcionar** | Escolhi o osso `arm_b` na Árvore e apertei `Delete` (o braço de trás do herói: sai com `forearm_b`, `arm_back`, `forearm_back` e `hand_back`). **Rodapé:** *"Apagar: 20 chaves de 2 peças guardadas em 3 animações. Crie de novo com o mesmo nome e elas voltam."* Abri **idle, walk e attack** e toquei cada uma (Espaço): **"Nenhum aviso"** e nenhuma exceção no console. **Salvei no atlas, fechei e reabri com o atlas:** **"Nenhum aviso"**. (Reabrir o `.bone` **sozinho**, sem atlas, dá 36 avisos; **são as imagens que faltam, não as chaves**: o mesmo número aparece abrindo qualquer `.bone` sem atlas) | `V1_01_arm_b_escolhido` · `V1_02_depois_de_apagar` · `V1_03_tocando` · `V1_04_reaberto_com_atlas` | |
| V2 | Crio de novo uma peça com o mesmo nome: diz quantas chaves voltaram; a animação mexe a peça como antes | **vi funcionar** | Base → Novo → Osso, e **Renomear** para `arm_b`: *"12 chaves guardadas voltaram de "arm_b", em 3 animações."* **Comparei o Ângulo de `arm_b`** com o do herói de antes de apagar (leitura do campo Ângulo nos quadros 0, 10 e 20): **walk −178 / −163,33 / −192,67** e **idle −185 / −183,67 / −182,33**, **iguais** nos dois. *Limite:* comparei o ângulo; não comparei o desenho (as imagens-filhas tinham saído junto) | `V2_02_renomeado_arm_b` · `V2_03_walk_arm_b` | |
| V3 | Existe um lugar onde se vê o que está guardado, e um jeito de jogar fora de propósito; Ctrl+Z devolve | **vi funcionar** | **Base → Chaves guardadas…** abre a lista: *osso "arm_b": 12 chaves, em 3 animações* e *osso "forearm_b": 8 chaves, em 2 animações* (12 + 8 = as 20 do rodapé), com **Jogar fora todas** e **Guardar**. *Jogar fora todas:* *"8 chaves guardadas jogadas fora. Ctrl+Z devolve."*; o item não abre mais diálogo. `Ctrl+Z`: *"Desfeito: Jogar fora as chaves guardadas"* e a lista volta com as 8. *Não li* a dica do item cinza (defeito 6) | `V3_00_chaves_guardadas` · `V3_01_apos_jogar_fora` · `V3_02_apos_ctrl_z` | |
| V4 | Apago, salvo, fecho, reabro, e só então recrio: as chaves voltam | **vi funcionar** | Apaguei `arm_b`, **salvei, fechei (Novo projeto), reabri** (as chaves guardadas estavam no arquivo: 5 linhas na lista), e **só então** criei e renomeei: *"12 chaves guardadas voltaram de "arm_b", em 3 animações."* (a conta é a de V2) | `V4_00_reaberto` · `V2_02_renomeado_arm_b` | |
| V5 | Recrio com o mesmo nome de **outro tipo**: não religa, e o programa avisa | **vi funcionar** | Arrastei a imagem `blade` para a cena e a renomeei **`forearm_b`** (as chaves guardadas eram de um osso): *"**"forearm_b" tem chaves guardadas de um osso: com outro tipo elas não voltam.**"* As 8 chaves continuaram guardadas | `V5_00_outro_tipo` | |
| V6 | `Ctrl+Z` depois de apagar devolve tudo, como sempre | **vi funcionar** | Apaguei `arm_b` (*"20 chaves de 2 peças guardadas"*), `Ctrl+Z` (*"Desfeito: Apagar"*): o osso **voltou na Árvore**, os ângulos de walk **iguais** (−178 / −163,33 / −192,67), e **Base → Chaves guardadas…** não abre lista (nada ficou guardado) | `V6_00_apos_ctrl_z` | |

## Parte C — o que notei fora da lista

| # | O que | Foto |
|:---:|:---|:---|
| C1 | Menus novos nas três telas: **Imagens → Voltar o pivô para o osso** e **Base → Chaves guardadas…** cabem sem rolar em 1440×900 (item mais baixo em y=548) e em 1280×720 (y=455) | `P_menu_imagens_1440` · `P_menu_imagens_1280` |
| C2 | Ao **recarregar a página** com o herói e edições abertas, o programa **volta com as edições** (rascunho) sem perguntar; foi útil para mim, mas significa que "recarregar" não limpa o estado numa prova | |
| C3 | O rodapé de **Salvar** ainda diz *"O manifesto do projeto baixados"* (concordância), mesmo gravando só o `.bone` | |
| C4 | A pergunta da ficha "ver onde a imagem tem pivô à mão" também aparece na dica da bolinha laranja, que **aponta o caminho de volta** (Imagens → Voltar o pivô para o osso). Bom | `P1_08_previa_pivo_a_mao` |

## O que troquei por um falso, para ninguém achar que conferi mais

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O seletor de arquivo do Windows (Salvar como, Abrir projeto) | `showSaveFilePicker` e `showOpenFilePicker` trocados por funções minhas que guardam e devolvem o texto | que o seletor de verdade funciona |
| A pasta do projeto com o atlas (P3, V1) | uma **pasta em memória** com `heroi.bone`, `heroi.atlas.json` e `heroi.png` (de `formato/exemplos/`), no lugar do seletor de pasta; **Arquivo → Abrir projeto** com os três arquivos juntos | que o Salvar grava certo numa pasta de verdade do Windows. Vi o que ele escreveu na pasta em memória (o `.bone` e um `manifest.json`; **o atlas não foi reescrito**) |
| "Repetir para a pasta" | não achei como montar o caso | — |
| P1 a P7 em 1440×900 e 1280×720 | só os menus e o diálogo nessas telas | os gestos de pivô e chave nelas |
