# O padrão dos painéis — a régua e a varredura — 07/10/2026

Rodada 47, parte 1. Chat: `PESQUISANDO · rodada 47 — o padrão dos painéis [e1b767]`.
**Nenhum código foi mexido.** Ficha: `rodadas/RODADA 47 - o padrao dos paineis 2026-10-06.md`.

| | |
|:---|:---|
| Versão montada | a de `programa/` (v34.4). Servidor próprio na porta **5540** |
| Como | Chrome sem janela na porta **9540**, tela exata **1920×1080** e **1280×720**, clique e tecla por protocolo. Roteiros de rascunho **fora** da pasta (regra 29) |
| Material | o herói (**Abrir o herói**), animação **idle**, osso **head** escolhido; para a Malha, o desenho **face**; para a ficha do emissor, **Partículas → Fumaça** |
| Hora | 03h01 a 03h16 do relógio da máquina |
| Fotos | `backup/fotos-obra/rodada-47/` (63). Prefixo `1920-` e `1280-` = tela exata. Prefixo `janela-1902x984-` = a primeira volta, numa janela de navegador de 1920×1080 com a barra do navegador (sobra 1902×984 para a página) |
| Leitura | os docs `26`, `27`, `39`, `43`, `51`, `55`, `57`, `66`, as conferências finais (`38` a `77`), `09`, `11`; o código das 16 abas (dois ajudantes, só leitura) |

## O quadro

| # | Pergunta | Resposta curta |
|:---:|:---|:---|
| 1 | Há uma régua só? | **Não: há quatro jeitos de fazer um número.** Só a Propriedades arrasta pelo rótulo e aceita conta. A unidade vem **depois da caixa** em 31 campos e **dentro do rótulo** em 26. Cerca de **79 campos** da ficha completa não têm unidade nem dica |
| 2 | Onde a régua falha mais? | **Linha do tempo** (chave de evento: 4 números sem unidade e sem dica), **Prévia** (8 de 12 sem unidade, 2 botões sem dica), **Curvas** (7 botões sem dica, eixo sem unidade, rodapé mudo) e **Regras** (nomes cortados mesmo em 1920) |
| 3 | O que rola sem ser lista? | **Malha: 451 px em 1920** e 695 px em 1280 (o Pincel fica a 840 px do topo). **Exibição**: 15 px em 1920, 260 px em 1280. **Propriedades** do osso: 296 px em 1920. **Entidades** em 1280: três rolos um dentro do outro |
| 4 | O que a casca deixa em 1280×720? | **Árvore com 1 linha** (0 com Detalhes aberto). **Imagens sem nenhuma miniatura inteira.** Linha do tempo com **1 linha de chave** fechada e **0** aberta. Rodapé **corta as três partes** com "…" |
| 5 | Quem come a altura? | A **tira de abas** do grupo de cima à direita: **8 abas em 3 fileiras = 103 px**, um quarto do grupo em 720. E os dois pisos fixos: Propriedades **265 px** e a faixa de baixo **156 px** |

---

## 1. A régua, escrita

Tirada do que as rodadas 38 a 46 fizeram. Onde a casa se divide, o que decidiu está na última coluna.

| # | Peça | A régua | De onde vem |
|:---:|:---|:---|:---|
| R1 | **Rótulo** | **1 a 3 palavras**. Nada de frase no rótulo. A frase inteira vai para a dica | 91 de 134 rótulos da ficha têm 1 ou 2 palavras; régua 3 do `26` |
| R2 | **Unidade** | **Depois da caixa**, em cinza: `[ 40 ] px`, `[ 1 ] ×`, `[ 0 ] °`, `[ 100 ] %`, `[ 1,8 ] s`. Nunca dentro do rótulo | **31** campos já fazem assim (ficha rápida, `med`, pivô, velocidade) contra **26** no rótulo (partículas, malha, exportar). É o mais novo, e é o do Photoshop (% e ° ao lado do valor), do Spriter (° ao lado do ângulo) e do Godot (sufixo no campo) — doc `51` §1.3, `27` §1.4 |
| R3 | **Faixa** | **Na dica**, sempre com "de X a Y" ou "de X para cima". À vista só no **par**: `de [ 1,8 ] a [ 2,6 ] s` | Rodada 38 (`31` L1, `33`), 41 (`43`), 45 (`70`), 44 (`55`) |
| R4 | **Dica do campo** | `Nome, em UNIDADE, de X a Y: o que faz. Típico: …`. A mesma dica **no rótulo e na caixa** | A da Abertura (`48` L1); `52` L7 |
| R5 | **Dica do botão** | `Nome (tecla): o que faz.` Botão apagado diz **por quê** | `draw-order.ts:238`, ferramentas (`76` L1); `43` §2.4 |
| R6 | **Botão** | **Ícone**, nome na dica (`iconButton`). Texto só para a ação principal de uma janela ("Exportar") e para escolha entre formatos | Memória da casa; `43` L4.3; `55`, `57`, `70` |
| R7 | **Número** | Caixa de texto que **arrasta pelo rótulo** (Shift ×10, Alt fino, um Ctrl+Z por arrasto), **aceita conta** (`90+15`, `*2`), **setas** ±1 e Shift ±10, e **"abc" fala** sem apagar o valor | Rodada 43 na ficha (`59` L1–L3); Spine e Photoshop (`51` §1.3) |
| R8 | **Barrinha** | Mostra **o número com a unidade** ao lado. Mexida pelo teclado, **anda a cada tecla** (o foco volta depois de redesenhar) | `38` L4; o conserto da Ordem, `draw-order.ts:331-364` |
| R9 | **Rodapé** | Toda ação que muda o arquivo **fala**, com **nome e número com unidade**. Gesto fala **durante**. Nunca cortado com "…": curto no rodapé, o resto na dica | Rodadas 40, 43, 46 (`54`, `65`, `73`); `57` L4.3 |
| R10 | **Linha de ajuda** | No máximo **uma linha** cinza no topo do painel. O resto na dica | `43` L4.2 (o aviso azul encolheu para uma linha) |
| R11 | **Rolar** | Só rola **lista** (`data-rolagem="lista"`) ou **palco**. Texto fixo nunca rola. **Lista nunca dentro de lista** | `medir-paineis.mjs`, cabeçalho |
| R12 | **Altura** | Em 1280×720, a aba à frente mostra **todo o fixo + 3 linhas da lista**. Em 1920×1080, nada cortado | Ficha da 47; `67` L4 (Skins com 3 linhas em 720) |
| R13 | **Nome** | Um nome por coisa: **desenho** (não slot), **skin**, **Parada**, **Clonar** | `39` L1.5, `55` L5.5, `58` L2 |

---

## 2. Cada painel contra a régua

Medido com o painel **à frente** (o grupo em uso ganha a altura maior). "Corpo" = a altura que sobra para o painel debaixo das abas. Fotos: `1920-<aba>.png` e `1280-<aba>.png`.

### 2.1 O resumo

| Aba | Corpo 1920 | Corpo 1280 | Números | Sem unidade | Botões sem dica | Foge da régua |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| Árvore | 447 | **87 (1 linha)** | 0 | — | 0 | R12 |
| Ordem | 447 | **87 (1 linha)** | 0 | — | 0 | R12 |
| Propriedades — base | 228 | 228 | 6 | **6** | — | R2, R3, R4, R7 (nenhuma dica, rótulo não arrasta) |
| Propriedades — osso | 472 · **rola 296** | 228 · rola 540 | 9 | 0 | 0 | R11 |
| Propriedades — desenho | 472 | 228 · rola 135 | 5 | 0 | 0 | "Imagem" duas vezes |
| Propriedades — emissor | 472 | 228 | 4 | 0 | 0 | R2 (unidade no rótulo "Vida (s)"), título cortado |
| Imagens | 406 | **162: 0 miniaturas inteiras** | 0 | — | 0 | R12 |
| Entidades | 406 | 162 · **3 rolos aninhados** | 0 | — | 0 | R11, R12 |
| Pivôs | 406 | 162 | 0 | — | 0 | ok |
| Malha e pesos | 406 · **rola 451** | 162 · **rola 695** | 5 | 1 | 0 | R2 (unidade no rótulo), R7, R11, R12; aviso azul cortado nas duas telas |
| Partículas | 406 | 162 | 0 | — | 0 | ok |
| Exibição | 406 · rola 15 | 162 · **rola 260** | 0 | — | 1 | R6, R11 |
| Prévia | 406 (palco) | 162 (palco) | 12 | **8** | 1 | R2, R4, R6, R10 (3 linhas de ajuda) |
| Animações | 439 | 195 | 0 | — | 2 | R5 |
| Skins | 439 | 195 | 0 | — | 0 | ok |
| Regras | 439 | 195 | 6 | **6** | 0 | R8 (teclado), nomes cortados em 1920 ("head_l…") |
| Histórico | 439 | 195 | 0 | — | 0 | R10 (2 linhas) |
| Linha do tempo | 379 aberta | 155 fechada · 225 aberta | 8 | **4** | **4** | R2, R4, R7; **0 linha de chave** em 720 aberta |
| Curvas | 379 aberta | 225 · gráfico rola 266 | 0 | — | **7** | R5, R6, R9 (0 falas próprias), eixo sem unidade |

### 2.2 O que cada um tem de errado, com a prova

| Aba | Achado | Foto |
|:---|:---|:---|
| Propriedades — base | "Posição X", "Largura", "Escala de referência", "Quadros por segundo": **sem unidade, sem dica, sem arrastar**. O rótulo "Quadros por segundo" quebra em duas linhas | `janela-1902x984-01-heroi-1920.png` |
| Propriedades — osso | **Ficha rápida em dia**: X/Y em px, escala em ×, ângulo em °, "mundo 95°". O item do diário *"ficha rápida sem °, px, ×"* **está resolvido** | `1920-propriedades.png` |
| Propriedades — emissor | Rótulos maiores e mais brancos que os da ficha do osso; "Vida (s)" com a unidade no rótulo; o título "Nascer · Emissor: head_…" cortado | `1920-fumaca-propriedades.png` |
| Malha | O painel tem **857 px** de texto fixo: aviso 39 · Desenho 62 · Forma 249 · Ossos 197 · Pesos 222 · Pincel 33 · Avançado 33. Em 1920 sobram 406. O Pincel mora a **840 px** do topo | `1920-face-malha-e-pesos.png`, `1280-face-malha-e-pesos.png` |
| Entidades | Em 1280: o cartão rola, a Montagem rola dentro dele (60 de 140 px), a Prateleira rola dentro dele (65 de 105 px). Três rodas de mouse no mesmo lugar | `1280-entidades.png` |
| Imagens | Em 1280 a busca (55 px) e a linha da pasta (52 px) levam tudo: **nenhuma miniatura inteira** | `1280-02-imagens-depois-de-clicar-dentro.png` |
| Regras | Barrinha da Força pelo teclado: **3 teclas, andou 1** (100 → 99), e o foco caiu no `BODY`. Nomes "head_l…", "cape_f…" cortados em 1920: a barrinha come a largura | `1920-regras.png` |
| Ficha rápida | A barrinha do **Alfa**: o mesmo, 3 teclas → 99, foco no `BODY` | — (medido) |
| Prévia | "Tela cheia" e "Copiar para a linha do tempo" em **texto**; "Mistura em segundos" com a unidade escrita por extenso; 3 linhas de ajuda debaixo do palco | `1920-previa.png` |
| Exibição | "Voltar ao padrão" e "Editar aqui" em texto e **sem dica** | `1920-exibicao.png` |
| Curvas | "Ajustar", "Mostrar todas" e os 7 formatos em texto; 7 sem dica; o eixo diz "1, 0, −1, −2" sem unidade; o gráfico tem **90 px** de altura em 1920 | `1920-curvas.png` |
| Linha do tempo | A chave de evento: Inteiro, Decimal, Volume, Balanço **sem unidade, sem faixa à vista, sem dica**; os 2 botões dela sem dica | `1920-linha-do-tempo.png` |
| Histórico | Duas linhas de ajuda para um painel de uma lista | `1920-historico.png` |

---

## 3. A casca

### 3.1 O que cada tela deixa

| Peça | 1920×1080 | 1280×720 |
|:---|:---:|:---:|
| Menu + barra de ferramentas | 88 | 88 |
| Coluna (as duas) | **772** | **412** |
| Faixa de baixo, **fechada** | 156 | 156 |
| Faixa de baixo, **Detalhes aberto** | 380 | 226 |
| Rodapé | 54 | 54 |
| Cena, faixa fechada | 1384×772 | 744×412 |
| Cena, Detalhes aberto | 1384×548 | **744×342** |
| Tira de abas do grupo de cima à direita (8 abas) | **103** (3 fileiras) | **103** |
| Tira de abas do grupo de baixo à direita (4 abas) | 70 (2 fileiras) | 70 |
| Grupo em uso / o outro, na coluna | 484 / 265 | **265 / 124** |
| Piso da Propriedades | 265 | 265 |
| Linhas de chave na folha, fechada | 1 | 1 |
| Linhas de chave na folha, Detalhes aberto | 3 | **0** (só o Resumo) |
| Árvore, linhas à vista | 11 | **1** (0 com Detalhes) |

### 3.2 Onde o fixo não cabe

| # | Onde | Conta |
|:---:|:---|:---|
| C1 | **A tira de abas** | 8 abas em 258 px fazem 3 fileiras: **103 px**. Numa fileira seriam **37**. São **66 px** devolvidos ao grupo de cima e 33 ao de baixo, nas duas telas. No Photoshop as abas que não cabem vão para o menu do grupo (`09` §2); a casa já tem o "▾" no canto |
| C2 | **Os dois pisos em 720** | Coluna 412 = Propriedades 265 + o outro grupo 124 + 23 de bordas. O outro grupo fica com 87 de corpo: a ferramenta da Árvore (50) e **uma** linha. Régua R12 pede 3 linhas: 37 + 50 + 3×32 = **183**. Então o piso da Propriedades em 720 é 412 − 183 − 23 = **206**: a ficha rápida (148) mais o título (40) cabe, sem sobra |
| C3 | **A faixa de baixo em 720** | Aberta: abas 48 + tocador 44 + segunda fileira de botões 40 + régua 32 + Resumo 36 = **200 px antes da primeira linha de chave**. Em 1280 os 7 botões do Detalhes descem para uma **segunda fileira** (cabem na do tocador em 1920). Juntar as abas no tocador e os 7 botões numa fileira devolve **88 px = 2 linhas de chave** |
| C4 | **O rodapé em 1280** | As três partes saem cortadas: "Arquivo s…", "Mexer grava…", "…Alt no quadradi…". Fere R9. Em 1920 cabe |
| C5 | **A janela de verdade** | No navegador de verdade, com a barra de endereço, uma tela de 1920×1080 dá **1902×984** à página (a primeira volta das fotos). A medição da casa usa a página exata: os números dela são **96 px mais otimistas** que a tela do Humberto |

---

## 4. O plano dos lotes

**Por régua**, não por painel: os 16 painéis usam os mesmos 4 ajudantes, e consertar o ajudante conserta todos de uma vez. Um lote é uma versão. A medição de altura **só sobe**.

| Lote | Nome | O que entra | Prova |
|:---:|:---|:---|:---|
| **1** | **A casca** | C1: a tira de abas numa fileira, o resto no "▾". C2: piso de 3 linhas para a lista, piso da Propriedades em 206 px em 720. C3: abas da faixa no tocador, os 7 botões do Detalhes na mesma fileira. C4: o rodapé em 1280 sem "…" (curto à vista, inteiro na dica). A medição ganha **1920×1080** e a régua das **3 linhas** | Em 720: Árvore com 3 linhas; Imagens com 1 fileira de miniaturas; folha aberta com 2 linhas de chave; rodapé sem "…". Em 1080: folha aberta com 5 linhas |
| **2** | **O número da casa** | O campo da ficha (`renderNumber` + arrastar + conta + setas + "abc" fala) sai da Propriedades para um módulo comum (`panels/dom.ts`). Os ~79 `num()` sem dica da ficha viram `med()` com unidade e dica (R2, R4). A ficha da base ganha unidade e dica. A unidade sai do rótulo e vai para depois da caixa nas partículas ("Vida (s)" → `Vida [ ] a [ ] s`) | Toda caixa da Propriedades: arrasta, conta, unidade, dica. Contagem: **0 número sem unidade** na ficha |
| **3** | **Os números fora da ficha** | O campo comum entra na Malha (Afastamento, Raio, Força, Peso exato), na Linha do tempo (tempo, duração, Fator, Empurrar, a chave de evento), na Prévia (Mistura), no Pivô, na cebola. Empurrar/Deslocar **não fecham** a janela ao errar o texto | Os 16 painéis: **0 número sem unidade**; "abc" fala em todos |
| **4** | **A barrinha e o botão** | R8: toda barrinha devolve o foco depois de redesenhar (Regras Força e parâmetro, Alfa da ficha, cor do osso, Raio e Força do Pincel), **o conserto da Ordem copiado**, e mostra o número. R6/R5: Exibição, Prévia, Curvas, chave de evento em ícone com dica; Animações com as 2 dicas que faltam. R10: uma linha de ajuda (Histórico, Prévia). Curvas: eixo com unidade e rodapé que fala. Regras: o nome inteiro em 1920 | Teclado: 3 teclas = 3 casas em toda barrinha. **0 botão sem dica** |
| **5** | **Os que não cabem** | Malha: as seções dobram e **só a da ferramenta em uso fica aberta** (Forma, Ossos, Pesos, Pincel) — R11. Exibição: não rola em 1280. Entidades: **um rolo só**, Montagem legível (63 px em 1440 e 91 px com 3 níveis, do `52`), "2 avisos" contra 1 problema, "skins ▾" que não existe. Ordem: arrastar para a frente de uma peça não parte a pasta; Ordem com 3 linhas em 720 com a ficha aberta. Linha do tempo: **Colar espelhado** ao lado do Copiar. Malha: a regra `cape_follow` com **um botão de saída** no rodapé (3 gestos para 1). Propriedades: "Imagem" uma vez só | Medição: **0 painel rolando texto fixo**, nas duas telas |
| **6** | **A prova final** | Um usuário novo abre as 16 abas, nas duas telas, com foto, e conta o que foge da régua | **"Toda aba lê igual"**: 0 fora da régua, nas duas telas |

### 4.1 Os itens da ficha, um por um

| Item da ficha | Lote |
|:---|:---:|
| Casca: faixa da linha do tempo (380 / 176 px) | 1 |
| Casca: Árvore com 62 px em 720 (hoje 87 fechada, 43 aberta) | 1 |
| Casca: a coluna que deixa a Malha só com Forma em 1280 e Pesos abaixo em 1920 | 1 e 5 |
| Entidades: Montagem de 63 px em 1440 e 91 px com 3 níveis | 5 |
| Entidades: "2 avisos" contra 1 problema | 5 |
| Entidades: "skins ▾" que não existe em cartão nenhum | 5 |
| A barrinha pelo teclado anda uma casa | 4 |
| Ficha rápida sem °, px, × | **já resolvido** (foto `1920-propriedades.png`); o Alfa dela entra no lote 4 |
| Colar espelhado longe do Copiar | 5 |
| Empurrar/Deslocar fecham a janela ao errar | 3 |
| `cape_follow`: 3 gestos a mais | 5 |

### 4.2 O que fica de fora

| Item | Por quê |
|:---|:---|
| A janela de verdade (1902×984) | A medição continua na página exata, para não mudar o sentido dos números de antes. Fica escrito aqui |
| Painel solto (flutuante): abre no mesmo lugar, altura em 80% | Achados de casca do `11` e `14`, sem queixa nova |
| O seletor de cor do sistema | Mão do Humberto (rodada 20) |

## 5. Suposições

| # | Suposição | Se estiver errada |
|:---:|:---|:---|
| S1 | A unidade vai **depois da caixa** (R2), e os 26 campos com unidade no rótulo mudam | A régua vira "no rótulo", e o lote 2 muda os 31 do outro lado. O trabalho é o mesmo |
| S2 | Abas que não cabem numa fileira vão para o "▾" (C1) | Alternativa: abas mais estreitas, só com ícone. Pior para quem não conhece o ícone |
| S3 | O piso de 3 linhas vale para toda lista (R12) | Sem ele, 720 continua com 1 linha na Árvore |

## Desvios (parte 2, rascunho fora de editor/)

| Data | Desvio | Por quê |
|:---|:---|:---|
| 07/10, 03h40 | **C2 sai do lote 1.** O chão de 3 linhas da lista não entra | Em 1280×720 a coluna tem 397 px abaixo do topo: a ficha rápida inteira (265) e 3 linhas de Árvore (183) não cabem juntas. A ficha da rodada diz "em 720 tudo o que é fixo cabe": o fixo vence, e a lista fica com o que sobra (como hoje). Medido no rascunho: com o chão, a ficha perdia Escala e Ângulo com os Detalhes abertos. Avisado ao Diretor |
| 07/10, 03h55 | **R6 corrigida.** Botão: ícone **quando o desenho é universal** (ou já é da casa); senão palavra; a dica **sempre** | A regra já estava escrita em `panels/preview.ts` (*"ícone só quando o desenho é universal"*), com o porquê: "Criar aresta" não tem desenho que se leia. O lote 4 não troca palavra por ícone: põe a dica que faltava |
| 07/10, 03h50 | **R2 tem exceção**: o número sem grandeza física (Força da mola, Massa, Vento, Gravidade da física) não leva unidade; a dica diz o que é e o típico | A especificação não dá unidade a eles (§6.5) |
| 07/10, 03h52 | **O pivô fica como está** no lote 3 | A janela do pivô já é texto com px, faixa na dica e "abc" que fala (rodada 44, lote 3). Só se confere que não há caixa crua |
| 07/10, 04h00 | **Pequenos do lote 4 que ficam**: as linhas walk/attack da Animações sem dica (são linhas de lista, não botões); os nomes de variável cortados nas Regras ("vulnerable") | A linha da variável tem dois botões escritos ("inteira", "daqui"); mexer nela é desenho novo, não régua |

## O rascunho dos lotes (parte 2) — estado às 04h00

Tudo numa cópia do editor **fora da pasta** (regra 29), medido ali; nada em `editor/`. Ao "a casa é sua", cada lote é refeito sobre o código vivo (a 45 e a 46 terão mexido em `shell.ts`, `properties.ts`, `quick-model.ts`), com cópia antes, e fecha uma versão.

| Lote | O que o rascunho faz | Prova no rascunho |
|:---:|:---|:---|
| 1 | Abas numa fileira com » (`ui/tab-strip-model.ts`, novo); abas da faixa na linha do tocador (`data-faixa-linha`); rodapé com versões curtas (`versoesDaFrase`), sem "…" | 1280: abas numa fileira; folha aberta com 1 linha de chave (era 0); rodapé inteiro. 1920: 4 linhas de chave (eram 3) |
| 2 | `panels/regua-numeros.ts` (novo): unidade, escala e dica de cada número de regra, física, base, ponto; 0 a 1 vira 0 a 100 %; todo número arrasta pelo rótulo; partículas com a unidade depois da caixa | Física: Inércia 50 %, Amortecimento 90 %, Limite px/s, "Passos /s" numa linha. 15 provas antigas das partículas reescritas de propósito (os rótulos sem unidade) |
| 3 | `panels/campo-numero.ts` (novo): o número da casa fora da ficha — Malha (Afastamento, Raio, Força, Peso exato), Mistura da Prévia, chave de evento (Volume e Balanço em %), cebola. Empurrar e Deslocar não fecham a janela errada (`askForm` com `validate`) | 0 caixa `type=number` crua nesses painéis |
| 4 | `lembrarFoco` (em `panels/dom.ts`): a barrinha volta a ter o foco depois do redesenho (Regras, Propriedades, Malha); dicas nos botões que não tinham; uma linha de ajuda (Histórico, Prévia); a barra da força das Regras 44 px | Regra e Alfa: 3 teclas = 3 casas, foco na barrinha (eram 1 casa e foco no BODY) |
| 5 | Em curso: Colar espelhado ao lado do Colar (Editar); "Imagem" duas vezes vira "Imagem" + "Arquivo" | — |

Suíte da cópia: nenhum vermelho novo; 31 testes a mais nos lotes 1 a 4.

## A obra (parte 2) — sete versões

| Versão | Lote | O que fez |
|:---:|:---:|:---|
| v34.8 | 1 | A casca: abas numa fileira com »; as abas da faixa na linha do tocador; o rodapé sem "…" |
| v34.9 | 2 | Todo número da ficha com unidade depois da caixa e dica; 0 a 1 vira %; arrasta pelo rótulo; partículas sem unidade no rótulo |
| v35.0 | 3 | O número da casa fora da ficha (Malha, Prévia, chave de evento, cebola); Empurrar e Deslocar não fecham errados; "de X a Y" em toda dica; trava na faixa; o Comando "Em −1"; o zoom faz conta |
| v35.1 | 4 | A barrinha anda a cada tecla; todo botão com dica; uma linha de ajuda; o nome da regra inteiro; o rodapé do gesto diz que a regra manda; a Árvore fala ao somar |
| v35.2 | 5 | A Malha abre a seção da ferramenta; o Colar espelhado ao lado do Colar; "Arquivo"; a Cebola legível e com unidade |
| v35.3 | 5b | O clique na barrinha leva o foco a ela; as dicas que faltavam (abas, animações, Curvas, Prévia…) |
| v35.4 | 6 | A Malha com chão quando à frente (cabe em 1440); a Montagem cresce e a aba rola; a Ordem não parte pasta; avisos contados igual; a prova final |

## A prova final (v35.4, 07/10, 08h31)

As 16 abas do menu Janela, no programa **montado**, em 1920×1080 e 1280×720, com o herói aberto (fotos em `backup/fotos-obra/rodada-47/prova-final/`, 38). O medidor conta, em cada aba: número sem unidade, número sem faixa na dica, botão sem dica, caixa que rola sem ser lista.

| O que se conta | v34.4 (a varredura) | v35.4 |
|:---|:---:|:---:|
| Números sem unidade, nas 16 abas (1920) | 18 | **3** — os dois do evento que não têm grandeza (Inteiro, Decimal) e a barrinha do parâmetro (o parâmetro não tem unidade) |
| Botões sem dica (1920) | 15 (Exibição 1, Prévia 1, Animações 2, Linha do tempo 4, Curvas 7) | **0** |
| Painéis que rolam texto fixo em 1920 | 3 (Malha 385 px, Propriedades do osso, Exibição) | **0 fora da ficha completa** |
| Medição de altura (`npm run medir`) | 81 de 90 | **82 de 90** |
| Linhas de chave com os Detalhes abertos, 1280×720 | 0 | 1 |
| A barrinha pelo teclado (3 teclas) | 1 casa, o foco cai | **3 casas, o foco fica** (provado no montado) |

### O que ainda rola, painel por painel, e por quê

O que a medição conta como "altura": em 1440×900 e 1280×720, para cada uma das 14 abas da coluna (mais a ficha da regra Comando e a do emissor em 3 telas), o corpo do painel **não pode ter barra de rolagem**, a não ser numa caixa marcada como lista (`data-rolagem="lista"`: cresce com o arquivo) ou palco (a Prévia: o palco inteiro e uma linha depois dele). São 90 medições; 8 rolam.

| # | Tela | Painel | Sobra | Por quê | O que resolveria |
|:---:|:---|:---|---:|:---|:---|
| 1 | 1440 | Propriedades (desenho `face`) | 13 px | a ficha completa (Desenho, Tamanho da imagem, Cor) debaixo da ficha rápida; o grupo da ficha tem o chão da ficha RÁPIDA, não da completa | dobrar os grupos da ficha completa como a Malha (abre o do que está escolhido) |
| 2 | 1280 | Propriedades (desenho) | 135 px | o mesmo, com 228 px de corpo | o mesmo |
| 3 | 1440 | Propriedades (regra Comando) | 402 px | um grupo de 6 campos por alvo do Comando: cresce com o arquivo, é uma lista que não leva a marca | marcar a lista de alvos como lista (é o que ela é), ou dobrar cada alvo |
| 4 | 1280 | Propriedades (regra Comando) | 524 px | o mesmo | o mesmo |
| 5 | 1440 | Exibição | 72 px | três grupos de interruptores (Mostrar na tela, A cena, Skins) sempre abertos | os grupos já têm ▾: nascer com só o primeiro aberto |
| 6 | 1280 | Exibição | 194 px | o mesmo | o mesmo |
| 7 | 1280 | Malha e pesos | 169 px | a seção Forma sozinha tem 233 px; o grupo tem 272 | opção A do Diretor: em 720 o resto dobra; a Forma inteira não cabe sem desenho novo (dois botões por linha não cabem em 258 px) |
| 8 | 1280 | Prévia | 7 px de 24 | o palco tem proporção fixa e toma o grupo; sobra menos de uma linha depois dele | o palco menor em 720, ou a Prévia no grupo de baixo |

### As sobras do plano

| Item | Fim |
|:---|:---|
| A Ordem: arrastar para a frente partia a pasta | **feito** (v35.4): a peça entra na pasta onde cai, ou sai da sua; o rodapé diz |
| "2 avisos" contra 1 problema | **feito em parte** (v35.4): a barra e a janela contam a mesma lista, sem frase repetida, no mesmo instante. Não reproduzi o caso exato do conferente (a ligação para um slot sumido) |
| "skins ▾" que não aparece | **não é defeito**: só aparece no cartão de teste de uma entidade com skin além da default (teste em `pasta-do-projeto.test.ts`, 2736). Nenhuma entidade de exemplo (espada, capacete) tem uma. O relatório que dizia "nos de teste" é que estava errado |
| A Ordem com 3 linhas em 720 com a ficha aberta | **decisão C2** (Diretor): a ficha vence, e a dica do ▾ diz que recolher devolve a altura à Árvore e à Ordem |
| Malha: um clique a mais para ligar ossos com o Transformar | **custo aceito** da opção A: a dobra dos Ossos fecha com o Transformar; com o modo Ligar ou com os Pesos, abre sozinha |

### Erros meus, pela forma (regra 27)

| Forma | Onde |
|:---|:---|
| **Fotografei o servidor errado sem conferir qual respondia**: a porta 5540 tinha dois donos (o montado em IPv4, o meu rascunho em IPv6) e o Chrome pegava o rascunho | as fotos do lote 1 (v34.8); refeitas do montado, com nome que diz isso |
| **Parei a tarefa e não os processos filhos**: uma medição minha ficou órfã nas portas da medição | 04h27–04h38; achada pela cadeia de processos, encerrada só a minha |
| **Gravei o arquivo de teste sem preservar o fim de linha** (CRLF virava LF) | `colunas-e-barra.test.ts` na v34.8; desfeito, e todo script seguinte preserva |
| **Pus unidade de palpite** num alvo que não é osso ("px" no `weight`) | v35.0, visto na foto antes de guardar |
| **A etiqueta da regra em todo gesto**, quando a regra só segura uma parte do osso | v35.1, a prova do Mover acusou; agora por parte (giro, posição, escala, inclinação) |

## Depois da prova final — v35.5 e v35.6 (08h57)

| Versão | O que fez | Altura |
|:---:|:---|:---:|
| v35.5 | Com o foco na barra de velocidade, as setas mexem a barra (não a agulha); a frase do Copiar numa linha (doc `88`) | 82 de 90 |
| v35.6 | A ficha completa dobra os grupos (abre o do nome; Compensar aberto só com caixa ligada); as Curvas sem jargão; a Ordem compacta abaixo de 800 px de altura (doc `90`) | **83 de 90** |
| v35.7 | As seções da aba Regras dobram no título (abre Regras, a vazia, a com escolha e a com problema); a Prévia diz o que é camada e fala sem "slot/morphs/tags"; Evento, Som, Pasta dos sons e Texto com dica (doc `92`, defeitos 3, 4 e 5) | 83 de 90 |
| v35.8 | A Ordem mostra três linhas inteiras em 1280×720: abaixo de 800 px de altura, miniatura de 20, linha de 22, ponta "frente" de 12 (doc `92`, defeito 1). A C2 continua valendo para a ficha; a Ordem coube sem tirar nada dela | 83 de 90 |

**O que ficou do doc `92`:** o defeito 2, a Prévia em 1920 que "dobra, mas rola". É a regra do palco: o palco e uma linha depois dele precisam caber; o resto pode rolar, e é o que a medição aceita. Com a Camada 0 aberta (como ela nasce) são 665 px de conteúdo; com tudo dobrado, 425 em 412. Fazer a Camada 0 nascer dobrada desfaz uma decisão antiga ("a camada 0 é a de todo dia"). Fica para o Diretor.

Na tabela "O que ainda rola", as linhas 1 (ficha do osso, que nem estava lá: agora cabe em 1920) e 3 (Comando em 1440) saíram. **Ficam 7**: ficha do desenho 13 e 135 px (só dois grupos: não dobra), Comando em 1280 (78 px), Exibição 72 e 194 px, Malha em 1280 (169 px), Prévia em 1280 (o palco).

A Ordem em 720: os 47 px que comiam a lista eram a barra de botões dela. Com a barra e a linha compactas, cabem 2 linhas; 3 não cabem com a ficha inteira embaixo (C2).

## Fontes

Da casa: os docs da rodada (§1). Photoshop: `09` §2 e `51` §1.1–1.3. Spine: `51` §1.3, `66` §1.2. Spriter e DragonBones: `51` §1.3. Godot, Unity, Construct: `27` §1.4.

**Nota do doc `93` (conferência da v35.7), para a rodada 48:**

| Ressalva | Causa e estado |
|:---|:---|
| A Ordem em 720 com 2 linhas | já resolvida na **v35.8**, fechada depois da conferência (3 linhas no montado, no estado do conferente) |
| O campo Texto do evento sem dica | **erro meu, pela forma: pus a dica no dado e não conferi que o desenho a lê.** O `hint` do Texto está em `EVENT_FIELDS`, mas o ramo `texto` de `event-key-editor.ts` (linhas 320 e 518) não aplica `field.hint`; só o ramo dos números aplica. O teste olhou o dado, não a tela (regra 28). Conserto: uma linha em cada ramo |
