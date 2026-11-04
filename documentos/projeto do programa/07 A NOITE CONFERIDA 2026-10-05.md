# A noite conferida — 05/10/2026

Rodada 21. Conferente: `CONFERINDO · rodada 21 — a noite, no uso` (era `RESERVA 8`).
**Nenhum código foi mexido.** Só usei o programa e fotografei.

| | |
|:---|:---|
| O que usei | `programa/` montado, **v25.7**, servido em `localhost:5321` (`programa/servidor.mjs`) |
| Como | Chrome sem janela, dirigido por protocolo: mouse, teclado e arrastar-e-soltar **de verdade** (também o arrastar nativo da espada, por `Input.dispatchDragEvent`) |
| Telas | 1280×720 (os menus) · 1440×900 · 1920×1080 · 1920×1500 (quando o painel não cabia) |
| Fotos | 140, em `backup/fotos-obra/rodada-21/`, uma por linha (o nome diz a linha) |
| Hora | 04h05 a 05h00 do relógio da máquina, 05/10/2026 |
| Material | o herói de exemplo (Arquivo → Abrir o herói) |
| O que **não** deu para fazer sem janela | o seletor de arquivo do Windows (abrir, salvar, importar, exportar), soltar uma pasta do Spriter, abrir o Manual (F1 abre outra aba) |

---

## O quadro, rodada por rodada

| Rodada | Versões | Vi funcionar | Pela metade | Não funciona | Não deu / não achei |
|:---|:---:|:---:|:---:|:---:|:---:|
| 8d — o clique na imagem | v23.5–23.8 | 8 | 1 | 0 | 0 |
| 12 — a skin | v23.9 | 5 | 1 | 0 | 0 |
| 15 — partículas | v24.0–24.3 | 6 | 1 | 0 | 0 |
| 3 — o que perdia trabalho | v24.4–24.6 | 1 | 0 | 0 | 2 (seletor de arquivo; soltar pasta) |
| 6 — os menus | v24.7–24.9 | 3 | 2 | 0 | 0 |
| 8b e 8c — a entidade e a faixa | v25.0–25.7 | 8 | 1 | 0 | 2 (a emenda; salvar e reabrir) |
| **Soma** | | **31** | **6** | **0** | **4** |

**Nenhum "não funciona".** Os seis "pela metade" são pequenos, menos um (o primeiro da lista abaixo) que é de outra causa.

---

## Os defeitos, do pior para o menor

| # | Defeito | Onde | Foto | Como repetir |
|:---:|:---|:---|:---|:---|
| **1** | **`Delete` com uma chave selecionada na linha do tempo apaga o OSSO ou a IMAGEM escolhida, e não a chave.** Com o `forearm`, saiu o osso e os filhos (4 avisos). Com a mão, saiu a imagem. Só a **lixeira** da linha do tempo apaga a chave. Dá para desfazer com `Ctrl+Z`. **Não é da 8d: vale para toda chave** | linha do tempo, tecla | `D9_02`, `D9_07`, `D9_09`, `D9_13` (o contrário certo: `D9_14`) | Abrir idle. Escolher o osso `forearm`. `K` (chavear). Clicar no losango da chave na linha **Posição X**. Apertar `Delete`. O osso some da Árvore |
| 2 | **A skin nova nasce com o nome "pele"** (e "pele2"): *"Skin "pele" criada…"*, *"NESTA SKIN: PELE"*. É a sobra de palavra que o usuário mais vê. Mais: **"esqueleto"** sobrou em 6 textos de tela (lista na tabela M2) | Skins → Nova skin | `S1_01`, `S6_00` | Menu Skins → Nova skin. Ler o rodapé e a aba Skins |
| 3 | **Seleção fantasma.** Tirar a skin da pilha (×) faz o osso sumir da Árvore, mas **Propriedades continua dizendo "Osso: osso"** e a cena desenha as alças do osso que já não existe, até clicar no vazio | aba Skins, ×  | `S3_03` (e `S3_04`, depois de clicar no vazio) | Skins → Nova skin. Base → Novo → Osso. Aba Skins, × na linha da skin nova |
| 4 | **Em telas de 1080 de altura ou menos, o campo Ângulo da ficha rápida cai fora do painel e não rola.** Em 1440×900 e 1920×1080 ele fica em y=640 e o painel acaba em y=628: o clique cai na linha do tempo. Só aparece inteiro em 1920×1500. É o gesto do T1 | Propriedades | `T1_00` (cortado) · `T1_02` (inteiro, em 1500) | Escolher um osso. Olhar o fim do painel Propriedades em 1920×1080 |
| 5 | **Pôr entidade na cena** (menu Entidades) **não pergunta qual**: pegou "espada", pôs no osso **root**, **deitada** no chão do herói (*"virou uma tomada no osso root"*) | menu Entidades | `M4_02` | Entidades → Pôr entidade na cena… |
| 6 | **A espada solta no antebraço não acompanha a edição de dentro.** Mexi a `lamina` da espada (idle por dentro, 45°) e voltei ao herói: a espada **original da mão** girou; a que eu soltei no antebraço (slot `espada`, mesma entidade) **ficou igual** na foto. Também não ganha linha de faixa na linha do tempo (só o `weapon` tem) | entidade, 8b/8c | `E4_03` (comparar com `E3`) | Arrastar a espada da aba Entidades para o antebraço. Abrir idle da espada na lista. Escolher `lamina`, Ângulo 45. Clicar num idle do herói |
| 7 | **Tecla `P` sem aviso na ordem da ficha.** A ficha diz: emissor escolhido, segurar P e clicar no osso. Apertar P diz o contrário (*"Escolha um osso. Depois segure P e clique em quem vira filho dele"*) e, com o emissor escolhido, P segurado + clique no osso **não faz nada e não diz nada**. Pelo campo **Osso** da ficha, prende (*"1 item virou filho de head"*). *Limite meu:* o "segurar" foi por protocolo | tecla P | `P5_01`, `P5_03`, `P5_04`; o campo: `P5_05` | Partículas → Fogo. Apertar P e clicar no osso. Rodapé |
| 8 | **Salvar, Salvar como e Exportar skin não dão sinal nenhum** (rodapé igual, nenhum erro). Pode ser só o seletor de arquivo que o Chrome sem janela não abre; **não consigo julgar** | Arquivo | `E11_salvar`, `T2_01` | Arquivo → Salvar com a espada mexida |
| 9 | Dois ícones vermelhos de "proibido" ficaram na Árvore ao lado de `shin_b` e `foot_b` **depois de Devolver o osso** (o osso voltou e a perna desenha) | Árvore | `S5` | Skins: apagar `shin_b` na skin, depois Devolver |
| 10 | Rodapé com nome interno: *"Posição Y de **hand_osso**"*, *"Imagem weapon"* para uma entidade, *"Mover desenho / Girar desenho"* quando o escolhido é o emissor; Propriedades diz "Anexo: torso_particulas", não "Emissor" | rodapé e Propriedades | `D9_05`, `D5_01`, `P3_02` | Os gestos das tabelas |
| 11 | A **chave do quadro 0** fica meio escondida sob a coluna dos nomes: o losango está em x=190, onde a coluna acaba | linha do tempo | `D2_01`, `D9_03` | Criar uma chave no quadro 0 e tentar clicar nela |
| 12 | Puxar a ponta da faixa **para dentro**, quando ela já ocupa a animação inteira, diz *"já está no limite: a faixa não passa da chave de antes nem do fim da animação"*. A frase confunde: o gesto era encurtar | faixa | `E6_01` | Abrir idle do herói. Puxar a ponta da faixa `weapon` para a esquerda |
| 13 | **Entidades → Caminho ▸** não existe (o executor da 6 já disse). **Sobre o Recorte diz "Versão 0.1.0"** com o programa em v25.7 | menus | `M2_ajuda_4` | Ajuda → Sobre |


---

## Rodada 6 — os menus (v24.7 a v24.9)

| # | O gesto | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| M1 | Abrir os doze menus, em 1280×720 | **vi funcionar** | Os 12, na ordem do `05`. **Nenhum rola, nenhum item cortado.** O maior é Animação (bottom 693 de 720). Os submenus vão até 712 de 720 (folga de 8 px). Contagens: Arquivo 14, Editar 18, Imagens 9, Base 17, Malha e regras 9, Animação 21, Skins 9, Entidades 7, Partículas 6, Exibir 17, Janela 18, Ajuda 5. Faltam só os "(novo)" que o executor já disse que não existem (Salvar como entidade, Clonar a base, Caminho, Testar no visualizador, Marcar como slot, Este boneco, Visualizador, Aparecer na linha do tempo) | `M1_01` a `M1_12` | |
| M2 | Procurar "pele", "peles", "corpo", "Esqueleto" | **pela metade** | Passei por todas as abas, os diálogos (Atalhos, Sobre, Paleta, Preferências, Configurações), as dicas dos itens, o rodapé e a tela de boas-vindas. **Sobras "esqueleto":** (a) título e grupo "Esqueleto" em Propriedades · (b) dica *"Começa um esqueleto vazio (Ctrl+N)"* · (c) aria da cena *"Área de desenho do esqueleto"* · (d) dica da Árvore *"…parâmetros do esqueleto"* · (e) aba Skins *"O esqueleto é o mesmo, só o desenho muda"* · (f) aba Regras *"Uma regra faz o esqueleto se mexer"*. **Sobra "pele":** o nome da skin nova ("pele", "pele2"). As dicas *"Era Esqueleto → … pele…"* são as permitidas. **Pelo texto do pacote (não vi na tela, só se disparar):** *"a pele "x" já existe aqui"*, *"Não deu para ler o corpo"*, *"Qual esqueleto abrir?"*, *"Já existe um esqueleto"*, *"Não achei uma das peles pedidas"*. O Manual (F1) abre noutra aba (não fotografei) e o pacote leva o manual inteiro com pele e corpo | `M2_*`, `S1_01` | Abrir cada aba e ler; Skins → Nova skin |
| M3 | Dez itens de Malha e regras, com uma imagem escolhida | **vi funcionar** | Virar malha (*"arm virou malha: 4 vértices"*) · Gerar automática (malha densa) · Traçar contorno (4 vértices) · Criar vértice · Apagar vértice (cinza; a dica diz *"Escolha um ou mais vértices"*) · Ligar ossos · Pesos automáticos · Suavizar · Podar · Tirar pesos. Sem imagem escolhida os itens ficam cinza e **dizem por quê**. *Aviso para quem repetir:* apertar `Esc` antes tira a escolha da imagem e o item fica cinza | `M3_01` a `M3_08` | |
| M4 | As sete portas | **pela metade** | **Colar pivô ✓** (*"Pivô de forearm: 3,4, 11. 1 desenho recolocado…"*) · Copiar pivô ✓ · Malha → Gerar automática ✓ · Malha → Traçar contorno ✓ · **Pôr entidade na cena ✓ com ressalva** (defeito 5) · Trazer como sequência: cinza, a dica diz bem *"Nenhuma subpasta é uma corrida numerada…"* (precisa pasta: **não deu sem janela**) · Promover a base: o rodapé diz *"Não há pasta de projeto aberta para procurar espada.bone"* (**efeito não testado**) · Rebaixar a entidade: cinza, *"Só há a base em foco: ela não se rebaixa. Outra base precisa estar na lista"*; ficou ativo quando a lista passou a ter duas bases (depois de abrir a animação da espada por dentro). Não testei o efeito | `M4_01` a `M4_03` | |
| M5 | Busca de comandos | **vi funcionar** | "malha" acha Virar malha, Gerar automática, Traçar contorno… · "skin" acha Skin de outro boneco, Uma imagem por skin… · "pivô" e "pivo" acham Definir, Copiar, Colar, Carimbar pivôs · "partícula" e "particula" acham Novo emissor vazio, Fogo, Fumaça, Faísca. **Sem acento também** | `M5_busca-malha` | |

## Rodada 8d — o clique na imagem (v23.5 a v23.8)

| # | O gesto | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| D1 | Clicar na mão | **vi funcionar** | Escolhe só `hand` (*"Anexo: hand"*). Não diz o osso | `D1_02` | |
| D2 | Arrastar a mão | **vi funcionar** | A mão sai (35 → 19,45), o antebraço fica, nasce chave, a folha ganha **"Imagem hand"** com Posição X e Y | `D2_00`, `D2_02` | |
| D3 | `Ctrl+Z` | **vi funcionar** | A mão volta (X de volta a 35), a linha some | `D3_ctrlz` | |
| D4 | Clicar no meio do osso e arrastar | **vi funcionar** | Pega o osso `forearm` mesmo com a mão por cima. **O osso anda (X 40 → 43,5; Y 0 → −16); não gira** (a ferramenta é a de Mover). A mão e a espada vão junto (2.149 amostras de pixel mudaram na região do braço) | `D4_01` a `D4_03` | |
| D5 | Clicar na espada e arrastar | **vi funcionar** | *"Entidade: espada (em weapon)"*. Só a espada anda; a mão não. Linha **"Imagem weapon"** (o nome diz "Imagem" para uma entidade: defeito 10) | `D5_01` | |
| D6 | Tecla `0` e clicar na mão | **vi funcionar** | O botão fica aceso; o clique na mão escolhe **"Osso: forearm"** (passa pela imagem) | `D6_*` | |
| D7 | Clicar na cabeça | **vi funcionar** | Escolhe "Osso: head" e o rodapé diz *"head é uma malha: ela se move pelo osso dela (head)"* | `D7_02` | |
| D8 | Mover a mão na base | **vi funcionar** | Na Base a mão vai para (20,92; 49,24) **sem chave**. Abrindo idle, a mão está lá | `D8_01`, `D8_03` | |
| D9 | Chave "Imagem hand": apagar, copiar e colar, arrastar | **pela metade** | **Colar ✓** (*"Chave em 1,37 s"*) · **Arrastar no tempo ✓** (1,37 → 1,13 s) · **Apagar pela lixeira ✓** (*"Apagar chave."*, a mão fica) · **Apagar pela tecla Delete ✗** (defeito 1) | `D9_05`, `D9_06`, `D9_14`; o defeito: `D9_02`, `D9_09`, `D9_10` | Defeito 1 |

## Rodada 12 — a skin (v23.9)

| # | O gesto | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| S1 | Nova skin; botão direito → Esconder nesta skin | **vi funcionar** | *"arm: escondida na skin "pele". Com ela vestida, não é desenhada. A base não muda."* A imagem some da cena; a Árvore mostra "escondida" | `S1_03` | |
| S2 | Trocar uma imagem na skin e **Ignorar** | **vi funcionar** | *"hand/hand agora mostra "face", na skin "pele""*; depois *"hand: a skin "pele" deixa de mexer nela. Vale o desenho de baixo, o da base."* | `S2_01`, `S2_02` | |
| S3 | Criar osso com a skin em edição; tirar a skin da pilha | **pela metade** | *"O osso "osso" nasceu na skin "pele": ele some quando ela sai da pilha."* Tirando a skin: *"saiu 1 osso que só existia nela"*, some da Árvore. **Mas fica a seleção fantasma** (defeito 3) | `S3_01`, `S3_03`, `S3_04` | Defeito 3 |
| S4 | Delete num osso da base com o lápis na skin | **vi funcionar** | *"Saíram da skin "pele" 2 ossos (shin_b, foot_b) e 2 imagens (shin_back, foot_back). Na base e nas outras skins continuam."* Tirando a skin, os dois voltam | `S4_00`, `S4_02` | |
| S5 | Devolver o osso | **vi funcionar** | *"O osso shin_b voltou à skin "pele", com os desenhos dele."* As duas pernas desenham. Sobra o ícone vermelho (defeito 9) | `S5` | |
| S6 | Duas skins empilhadas na mesma imagem | **vi funcionar** | Pilha: pele2, pele, default. `body` trocado nas duas (couraça em pele2, capa em pele): **desenha a couraça**, a de cima | `S6_03` | |

## Rodada 15 — partículas (v24.0 a v24.3)

| # | O gesto | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| P1 | Partículas → Fumaça (menu) | **vi funcionar** | Emissor `torso_particulas` no osso torso, no meio da cena, **marca laranja** (estrela e traço **para cima**), com a imagem `fx/ponto-suave` | `P1_00` | |
| P2 | Clicar na marca | **vi funcionar** | *"Anexo: torso_particulas"* e a ficha inteira do emissor abre (O emissor, Quando nasce, Vida, Para onde vai…) | `P2` | |
| P3 | Mover e girar com as ferramentas | **vi funcionar** | Mover: X 12,47 → 50,6; Y 0,22 → −91,82. Girar: −90 → −116,1, o traço gira. Escalar: *"O emissor não tem escala: ele se move e gira. O tamanho das partículas é "Tamanho"…"* | `P3_00` a `P3_02` | |
| P4 | Digitar X, Y e Giro | **vi funcionar** | 150, −60 e 45 aplicam; a marca anda e gira | `P4_01`, `P4_02` | |
| P5 | Prender a outro osso | **pela metade** | **Campo Osso ✓**: escolhi `head`, *"1 item virou filho de head"*, o emissor não saiu do lugar (X/Y se recalculam). **Tecla P: não consegui** (defeito 7) | `P5_05` (campo) · `P5_01`, `P5_03` (P) | Defeito 7 |
| P6 | Painel Partículas: Duplicar, Apagar | **vi funcionar** | Duplicar cria `torso_particulas_2` (semente **1**, a original 0); Apagar tira | `P6_00`, `P6_01` | |
| P7 | Agulha para a frente e para trás | **vi funcionar** | Mesmo instante, ida e volta: **10 amostras diferentes** de ~13.000. Instantes diferentes: 2.766 | `P7_a`, `P7_b`, `P7_c` | |

## Rodada 3 — o que perdia trabalho (v24.4 a v24.6)

| # | O gesto | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| T1 | Digitar 90 no Ângulo e `Enter` | **vi funcionar** | Osso `hair`: gira 90° com os desenhos. Osso `head`: *"head não girou: as regras head_lean, look_driver mandam nele. Desligue o olho delas na aba Regras. Ficou na base: Ctrl+Z desfaz."* — **o caso que a ficha pedia, e o aviso diz o que fazer**. O campo só se alcança em tela alta (defeito 4) | `T1_02`, `T1_04` | |
| T2 | Exportar uma skin, apagar, importar | **não deu sem janela** | Arquivo → Exportar → Skin, para outro boneco: nenhum diálogo, nenhum erro, rodapé igual (defeito 8). O seletor do Windows não abre sem janela | `T2_00`, `T2_01` | |
| T3 | Soltar o projeto grande do Spriter | **não deu sem janela** | Soltar pasta por protocolo não é possível. Memória livre na hora: 0,9 a 1,2 GB, **abaixo** do 1,5 GB que a ficha manda respeitar | | |

## Rodadas 8b e 8c — a entidade na lista e a faixa (v25.0 a v25.7)

| # | O gesto | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| E1 | Arrastar a espada da aba Entidades para o antebraço | **vi funcionar** | **Arrastar de verdade.** *"espada" virou uma tomada no osso forearm: a entidade inteira entra nela, com as animações dela.* A espada nova aparece ao lado da mão (ângulo 76,76) | `E1_01` | |
| E2 | Aba Animações | **vi funcionar** | **"Bases"**: *Base — montar · heroi* e *· espada*; **espada · entidade (3)** com idle, brilho, attack; **heroi · base (3)** com idle, walk, attack | `E2`, `E3` | |
| E3 | Clicar em attack da espada | **vi funcionar** | *"Animando espada por dentro: attack. heroi fica à vista, parado. Para voltar: clique numa animação de heroi."* A linha do tempo é a da espada (Osso lamina, Slot brilho). O herói e a espada soltos continuam onde estavam | `E3` | |
| E4 | Mexer na espada ali e voltar ao herói | **pela metade** | Mexi o idle da espada (lamina 45°) e cliquei idle do herói: *"espada voltou a ser entidade em heroi, dirigida pela faixa. O que você mexeu nela ainda não foi salvo: espada fica em Bases até o Salvar."* A espada **da mão** girou. A **solta no antebraço não** (defeito 6) | `E4_03` | Defeito 6 |
| E5 | Chave numa peça do herói: a espada não salta | **vi funcionar** | `K` no osso `hair`: **0 amostras diferentes** nas três regiões (espada solta, espada da mão, cabelo) | `E5_00`, `E5_01` | |
| E6 | Puxar a ponta da faixa | **vi funcionar** | *"espada toca brilho a 0,7826× a velocidade: uma volta dura 0,77 s"*; a faixa mostra **"×0,7826"**; depois 0,9× e 0,67 s | `E6_04` | |
| E7 | Arrastar a faixa | **vi funcionar** | *"espada entra em 0,07 s."*; a faixa começa em x=304 (era 190) | `E7` | |
| E8 | Entidades → Em laço, desligar | **vi funcionar** | Desligado: *"espada sem laço: toca uma volta e para no último quadro. A faixa passa a ter tamanho."* Ligado: *"espada em laço: roda sozinha, a partir de onde entra, sem fim."* O item tem ✓ quando ligado | `E8_01`, `E8_03` | |
| E9 | Fazer a emenda não bater | **não consegui** | Não achei como montar o caso com as animações de exemplo (o começo e o fim da `brilho` e da `idle` da espada não diferem). Com a ponta puxada para 0,9× a barra de avisos disse **"Nenhum aviso"** | `E9_01` | Quem repetir: precisa de uma animação da espada com começo ≠ fim |
| E10 | A faixa com a linha do tempo fechada | **vi funcionar** | *"Linha do tempo fechada. Detalhes abre de novo."* Uma linha **weapon** com a faixa verde *"espada: idle"* | `E10` | |
| E11 | Salvar com a espada mexida por dentro, e reabrir | **não deu sem janela** | Ctrl+S, Arquivo → Salvar e Salvar como: **sem sinal** (defeito 8). Não pude reabrir. O aviso de antes diz que a espada mexida fica em *Bases* até o Salvar | `E11_*` | |

---

## O que eu **não** conferi, para ninguém achar que conferi

| O quê | Por quê |
|:---|:---|
| Rodapé e dica de **cada** item cinza dos menus | li as dicas dos 10 de Malha e regras, dos de Imagens e de Entidades que toquei. Não percorri os 32 |
| Os ícones das barras e das abas | não é desta ficha |
| O que acontece **depois** de Promover a base, Rebaixar, Trazer como sequência | precisam de pasta de projeto e de arquivo: sem janela |
| A tecla `P` segurada de verdade | o "segurar" foi por protocolo; pode ter falhado no teste |
| O Manual (F1) | abre noutra aba; não fotografei |

## Notas de método (para quem conferir de novo)

| | |
|:---|:---|
| `Esc` antes de um item de menu **tira a escolha**. Quase conferi errado "Virar malha" e "Em laço" por isso: eles ficam cinza com a escolha vazia, e o rodapé diz *"Escolha uma imagem inteira primeiro"* | |
| O **arrastar nativo** funciona por protocolo (`Input.setInterceptDrags` + `dispatchDragEvent`). O roteiro de 8b usou `DragEvent` de mentira: não pega defeito de quem arrasta de verdade | |
| A comparação por pixel das fotos (amostras diferentes numa região) deu a prova de D4, E4, E5 e P7 | |
