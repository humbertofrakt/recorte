# A pasta e o slot conferidos (v28.5 a v28.7) — 05/10/2026

Rodada 33. Conferente: `CONFERINDO · rodada 24 — os consertos e os painéis`.
**Nenhum código foi mexido.** Só usei o programa e fotografei.

| | |
|:---|:---|
| Versão montada | **v28.7** (o "Sobre" diz v28.7) |
| Como | `programa/` na porta 5324 · Chrome sem janela · mouse e teclado por protocolo |
| Tela | só 1920×1080 |
| Hora | 20h31 a 20h47 do relógio da máquina, 05/10/2026 |
| Fotos | `backup/fotos-obra/rodada-33/` (25) |
| Material | o herói com atlas, mais `espada.bone` e `poder5.bone` numa pasta em memória |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Não achei a porta | Não dá sem janela |
|:---:|:---:|:---:|:---:|:---:|
| **8** (S1, S2, S3, S5, S7, S8, S9, S10) | **2** (S4, S6) | 0 | 0 | 0 |

## Os defeitos, do pior para o menor

| # | Defeito | Linha | Foto | Como repetir |
|:---:|:---|:---:|:---|:---|
| 1 | **Depois de `Ctrl+Z` no "Marcar como slot", o nome fica preso.** O desfazer devolve a imagem (*body*) e some a base, mas ao marcar de novo com o **mesmo** nome o programa diz *"Marcar como slot: Já existe peito.bone no projeto. Nada mudou."* Nenhuma base peito aparece na lista. Com outro nome (*tronco*) marcou na hora. Quem desfaz e refaz fica sem entender por que o nome é recusado | S5 | `S3_depois_do_slot` (antes) | Marcar `body` como slot "peito" · `Ctrl+Z` · marcar de novo "peito" |
| 2 | **O nome do slot na lista de Bases abre só o slot, sem o herói.** Clicar em *"Base — montar · peito"* mostra **só o colete**, sozinho na cena. O caminho que deixa o herói à vista é a linha **"peito · slot"** debaixo das animações do herói, que no 1920×1080 fica **abaixo da dobra** do painel (preciso rolar). Quem espera "clico no nome e vejo o herói" cai no primeiro | S4 | `S4_dentro_do_peito` · `S4_lista_heroi` | Marcar o slot · clicar no nome na lista de Bases |
| 3 | **A recusa do slot só se lê na dica.** Para caixa, ponto e caminho o item *Marcar como slot…* fica apagado, e o motivo (*"hitbox não mostra uma imagem: só imagem vira slot"*) está na **dica**; o rodapé não diz nada | S6 | `S6_caixa_menu` | Escolher `hitbox` na Árvore · menu Entidades |
| 4 | **A chave da opacidade se chama "Cor".** Mudei o Alfa de uma imagem na animação: rodapé *"Chave em 0,00 s: Cor de body"*; o Histórico diz *"Chavear alfa"*. Na linha do tempo (só duas linhas à vista) **não vi a linha nova** sem rolar. O rótulo ao lado do controle, *"base 10…"*, fica cortado pela borda do painel | S9 | `S9_alfa_animacao` | Idle · escolher `body` · Alfa = 50 |
| 5 | *Pequeno:* o rodapé segue dizendo **"Arquivo salvo."** num programa vazio e depois de um `Ctrl+S` que ainda não salvou nada (só abriu a pergunta da pasta) | S2 | `S2_soltar_imagem` | Abrir o programa e olhar o rodapé |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| S1 | Novo projeto pede uma pasta **antes**; as imagens da pasta na aba Imagens; Salvar grava ali sem perguntar; cancelar não muda nada e o programa diz | **vi funcionar** | **Cancelar:** o seletor abriu **uma vez**; rodapé *"Novo projeto: nenhuma pasta escolhida. Nada mudou, e o projeto continua sem pasta"*; a aba Imagens segue *"Nenhuma pasta aberta"*. **Escolher:** como a minha pasta já tinha `heroi.bone`, abriu a pergunta *"A pasta heroi-pasta já tem um projeto"* com **Abrir heroi.bone / Começar um novo: heroi-pasta.bone / Cancelar** (cada um com uma linha do que faz). Escolhi *Começar um novo*: *"Projeto novo na pasta heroi-pasta, com uma base vazia. 1 imagem na aba Imagens; o Salvar grava heroi-pasta.bone ali"*; a aba mostra *"Pasta heroi-pasta · 1 imagem"*. **Salvar** pelo botão do alto: *"Salvo em heroi-pasta.bone."*, criou e gravou o arquivo na pasta, e **o seletor de arquivo não abriu** (contei: 0) | `S1_cancelar` · `S1_pasta_aberta` (a pergunta) · `S1_novo_ao_lado` | |
| S2 | Programa vazio: soltar uma imagem ou `Ctrl+S` pede a pasta | **vi funcionar** | **`Ctrl+S`:** abriu *"O projeto ainda não tem pasta"* com **Escolher a pasta do projeto… / Salvar só o arquivo .bone… / Cancelar**. Cancelar: *"Nenhuma pasta escolhida: nada foi salvo, e o projeto continua sem pasta"*. Escolher: *"Salvo em heroi-pasta.bone."*. **Soltar uma imagem** (soltura de arquivo de verdade por protocolo, `heroi.png`): abriu *"O projeto ainda não tem pasta"* com **Escolher a pasta do projeto… / Agora não: as imagens ficam soltas / Cancelar** | `S2_soltar_imagem` | |
| S3 | Marcar uma imagem do herói como slot, dando nome: vira base; o nome aparece em Animações, Árvore e Ordem; nada muda no desenho | **vi funcionar** | Botão direito em `body` na cena → **Marcar como slot…** → janela *"Marcar como slot"* com o nome (já vem *body*), a frase *"Nasce body.bone, na lista de bases"* e **Marcar como slot / Desistir**. Dei **"peito"**: *"body virou a base peito… Nada mudou no desenho"*. **Cena antes e depois: o mesmo número** (hash do desenho idêntico, **0 px de diferença**; refiz na base com outro nome: de novo idêntico). **Animações:** *"Base — montar · peito"* na lista de bases e a linha *"peito · slot"*. **Árvore:** *"peito · body"*. **Ordem:** *"tronco · entidade tronco"* (no teste com o nome tronco) | `S3_pede_nome` · `S3_depois_do_slot` · `S3_ordem` | |
| S4 | Clicar no nome dela na lista: animo por dentro, com o herói à vista; clicar numa animação do herói: volto | **pela metade** | **A linha "peito · slot"** (debaixo das animações do herói; preciso rolar até ela): *"A base de peito, por dentro. heroi fica à vista, parado. Para voltar: clique numa animação de heroi"*; a cena mostra o herói parado e a Árvore só o *peito*. **Voltar:** clicar em `idle`: *"peito voltou a ser entidade em heroi, dirigida pela faixa"*; a Árvore volta inteira e a linha do tempo traz *"peito: (nenhuma)"*. **Mas** o nome na lista de **Bases** (*"Base — montar · peito"*) abre o colete **sozinho**, sem o herói (defeito 2) | `S4_peito_na_lista` · `S4_dentro_do_peito` (colete só) · `S4_lista_heroi` · `S4_voltei` | Defeito 2 |
| S5 | Desmarcar o slot: a imagem e o nome voltam; `Ctrl+Z` também | **vi funcionar** | Com o slot *tronco*: Entidades → **Desmarcar o slot**: *"tronco voltou a ser a imagem de antes, no slot body. A base tronco saiu do projeto."*; Árvore: *body*; cena **idêntica** ao antes de marcar. `Ctrl+Z` do desmarcar: *"Desfeito: Desmarcar o slot"* e o slot volta. **`Ctrl+Z` do próprio marcar:** *"Desfeito: Marcar como slot"*, nome *body* de volta, cena igual. **O nome ficou preso depois disso** (defeito 1) | — | Defeito 1 |
| S6 | Malha, ponto, caixa: não viram slot, e o programa diz por quê | **pela metade** | **Caixa** (`hitbox`), **ponto** (`hand_point`) e **caminho** (`cape_path`): *Marcar como slot…* e *Desmarcar o slot* ficam **apagados** com a dica *"hitbox não mostra uma imagem: só imagem vira slot"* / *"…não é um slot marcado"* (só na dica, defeito 3). **Malha: não consegui provar.** Tentei fazer uma malha a partir do cabelo pelo menu Malha e regras → Malha → *Virar malha*: o Histórico não registrou passo nenhum, e o cabelo seguiu como imagem comum, então não havia malha para testar | `S6_caixa_menu` | Defeito 3 |
| S7 | Duas peças com a mesma entidade: trocar uma pela grade não mexe na outra | **vi funcionar** | Pus `espada` duas vezes (Entidades → Pôr entidade na cena…): nasceram **espada** e **espada2**, além da **weapon** que o herói já trazia. Clique na grade (com *Trocar todas as iguais (3)* **desligada**) e a entidade `poder5`: *"weapon mostra a entidade "poder5""*. Li a ficha de cada slot: **weapon = poder5; espada = espada; espada2 = espada** | `S7_dois_espada` · `S7_grade_espada` · `S7_trocou_uma` | |
| S8 | A grade tem "Trocar todas as iguais (N)", desligada ao abrir; ligada troca as N, cada uma no lugar; um `Ctrl+Z` desfaz todas; o rodapé diz quais | **vi funcionar** | **Ao abrir:** *"Trocar todas as iguais (3)"*, `aria-pressed` **falso** (desligada); a dica diz *"Ligado: o que você clicar troca nas 3 peças que mostram esta mesma entidade (weapon, espada, espada2), num passo só de desfazer. Desligado: só esta"*. Depois da primeira troca o número caiu para **(2)**. **Ligada** (`pressed` verdadeiro) e a entidade `poder5`: rodapé *"2 peças iguais trocadas por poder5: espada, espada2"*; as fichas leem **espada = poder5** e **espada2 = poder5**. **Um `Ctrl+Z`:** *"Desfeito: Trocar todas as iguais (2)"*; as **duas** voltaram a *espada* e a weapon seguiu *poder5* | `S8_grade_iguais` · `S8_ligado` · `S8_depois` · `S8_desfeito` | |
| S9 | A opacidade da imagem: numa animação, mudar pela ficha nasce uma chave; na base, grava na base | **vi funcionar** | **Há campo:** *Alfa* na ficha rápida da imagem (caixa de número e barra). **Animação (idle):** Alfa de `body` = 50: rodapé *"Chave em 0,00 s: Cor de body"* e Histórico *"Chavear alfa"*; a cena ficou com o colete esmaecido. **Base:** Alfa = 70: rodapé *"Mudar Alfa"* (sem chave). `Ctrl+Z` desfez. Defeito 4 (o nome "Cor" e a linha fora da vista) | `S9_alfa_animacao` · `S9_alfa_base` | |
| S10 | Salvo, fecho, reabro: a base-slot e os encaixes continuam | **vi funcionar** | **Salvar** (pasta aberta): *"Salvo em heroi.bone. 3 corpos e o manifesto do projeto gravados na pasta."*; o que gravou: `heroi.bone`, **`tronco.bone`**, `espada.bone`, `poder5.bone`, `manifest.json`. **Reabri** (Novo, depois Abrir projeto com o `heroi.bone` que o programa gravou): *"Base — montar · tronco"* e *"tronco · slot"* na lista; Árvore *"tronco · body"*; as entidades `poder5` (1 animação) e `espada` (3) e a `weapon` = poder5 continuam; cena igual à de antes de salvar | `S10_salvou` · `S10_reaberto` | |

## Parte C — o que notei

| # | O que |
|:---:|:---|
| C1 | **Respondeu um achado antigo.** Na rodada 29 eu não conseguia ver o aviso da entidade que não abriu. Agora, ao abrir o herói sem `espada.bone`, o rodapé diz *"A entidade espada.bone não foi aberta; esse slot fica vazio."* e o botão do rodapé mostra *"1 aviso — ver"* |
| C2 | O rodapé diz **"(foi para a base)"** ao trocar uma entidade com uma animação aberta (*"weapon mostra a entidade "poder5"… (foi para a base)"*). Quem estava dentro do `idle` não espera ouvir "base" |
| C3 | Na aba Ordem da base, as peças `espada` e `espada2`, postas **só no idle**, aparecem como *"sem imagem nesta skin"*. Faz quem olha a base achar que há peça quebrada |
| C4 | A pergunta *"A pasta já tem um projeto"* é boa: três botões, cada um com uma linha. Deixa o Humberto escolher sem medo de apagar o que já havia |
| C5 | O programa **não deixa fechar a página** com mudança sem salvar (o navegador segura). É esperado, e me custou três tentativas para recarregar a página de prova |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O seletor de pasta e os de arquivo do Windows | pasta em memória (`heroi.bone`, atlas, png, `espada.bone`, `poder5.bone`) | que o Salvar grava certo numa pasta de verdade |
| "Fechar e reabrir" (S10) | Novo + Abrir projeto dentro da mesma página, lendo o arquivo gravado na pasta em memória; **não recarreguei a página** (a pasta em memória morre quando recarrega) | que fechar o navegador e abrir de novo traz a mesma coisa. Também não vi com certeza se o Novo limpou a tela antes de reabrir |
| Recarregar a página | tirei o aviso de "mudanças não salvas" do navegador com uma linha de código, só para reiniciar | só de reiniciar a prova |
| Soltar imagem (S2) | soltura de arquivo de verdade por protocolo (não foi falso) | — |
| Malha (S6) | não consegui criar uma malha para testar | o texto do motivo para malha |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
