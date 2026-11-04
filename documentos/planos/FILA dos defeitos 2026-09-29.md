# A fila dos defeitos — 29/09/2026

> **Hoje: 90 fechados · 2 em obra (0 já consertados, esperam a janela) · 78 faltam** — somando a fila de defeitos e os itens do plano. Fora da conta: 1 recusado, 2 adiado.

> **Obra parada desde 14:36** (diário do Planejador): o Humberto vai projetar o programa; nenhum chat grava em `editor/src` até ele mandar voltar. A fila fica como está, com a **v23.3** como última versão.

Escrita e mantida pelo chat **O** (`PESQUISA · onde fica cada botão`), por ordem do Planejador (P34).
**Só o chat O escreve neste arquivo.** Os donos avisam o fecho a ele ("fechei K15 na v23.2"); ele muda o estado.

Versões: 04:41 até agora. **Última: 15:20** (relógio da máquina). Fonte dos fechos: o `CHANGELOG.md`. **A v23.3 (fecho 3) fechou às 10:38 e é a versão que vai para a mão do Humberto:** os consertos do turno 1 estão aqui como "fechado na v23.3". Onde a seção diz "sem foto", a fila diz "(sem foto)". Relida a cada hora cheia.

## De onde veio cada id — as DUAS fontes

| Fonte | Arquivo | Ids | Marca na fila |
|:---:|:---|:---|:---|
| **1** | `documentos/planos/DEFEITOS achados no uso 2026-09-28.md` | A1–A5, B1–B3, D1–D2, E1–E3, F1–F7, G1, H1–H3, I-O1–I-O4, J1–J15, K1–K15, L1–L16, M1–M16, N-1–N-16, C1–C2 | o id como está lá |
| **2** | `documentos/pesquisa/nova pesquisa/SEQUENCIA animacoes previa e curvas 2026-09-28.md` (lote 2, "Onde a fila quebra") | Q1–Q8 do chat G | **`G-Q1` … `G-Q8`**. Q1 = K1, Q2 = K14, Q5 = K9, Q8 = G1 (juntados). Q3, Q4, Q6 e Q7 só existem aqui |
| **2** | `…/SEQUENCIA imagens e pivo 2026-09-28.md` (lote 2, "Onde a fila quebra") | Q1–Q10 do chat H | **`H-Q1` … `H-Q10`**. Q1 e Q6 = J7, Q8 = H1, Q9 = H2, Q10 = H3 (juntados). Q2, Q3, Q4, Q5 e Q7 só existem aqui |
| **2** | `…/SEQUENCIA cena e ferramentas 2026-09-28.md` (lote 2) | F1–F7 do chat F e a linha do passo 18 | os F1–F7 **já estavam** na fonte 1 (atenção: no arquivo do F, o F5 é o K11 e o F6 é a tela que pula; na fila valem os números da fonte 1). **`F-p18`** é do passo 18 da fila dele: só existe aqui |
| **2** | `…/SEQUENCIA exibicao peles e historico 2026-09-28.md` | I1–I8 do chat I | **`I1` … `I8`**; os `I-O1`–`I-O4` dele estão na fonte 1 |
| **—** | `SEQUENCIA` dos chats de uso (J, K, L, M, N) | as listas próprias deles | conferi: são as **mesmas** da fonte 1 |

Os ids **`K1a`/`K1b`**, **`K10a`/`K10b`**, **`L1a`/`L1b`**, **`L11a`/`L11b`**, **`N-4a`/`N-4b`**, **`E3a`/`E3b`** e **`M12a`/`M12b`** são um defeito da fonte partido em duas linhas, **uma por dono** (pedido do Planejador).

## Como ler

| Coluna | Quer dizer |
|:---|:---|
| **id** | o id do defeito. Com `+`: o **mesmo** defeito visto por mais de um chat, numa linha só |
| **tipo** | os cinco do encargo: não se acha · criei e sumiu · fez e não avisou · sequência quebra · deu erro |
| **chat dono** | uma LETRA, pela tabela de cercas de `ENCARGOS rodada final` e pelas decisões que mudaram cerca (P2, P7, P17, P20, P24, P25, P30, P31). Onde o texto diz um dono e a cerca diz outro, **vale a cerca**, e a célula traz *(conferir)* — o motivo está no fim |
| **achado também por** | os outros chats que viram o mesmo defeito |
| **decisão** | o número P do diário, se houver |
| **estado** | aberto · a medir · em obra · **consertado, espera a janela** · fechado na vN.N |
| **conferido no uso por** | o chat de uso que refez a fila no programa remontado e disse, defeito por defeito, **consertado**, **não consertado** ou **pela metade**. Um defeito só sai de vez quando o olho confirma |

**Estado "aberto"** = existe e ninguém o fechou. "a medir" = quem achou viu uma vez só. **Fechado** leva a versão que fechou (`fechado na v23.0`). **Regra do uso:** "pela metade" e "não consertado" no uso **reabrem** o defeito, mesmo que a versão o tenha fechado (nota: *reaberto pelo uso na v23.2*). Fechos lidos do `CHANGELOG.md` e das mensagens dos donos; "em obra" só quando o dono diz que está mexendo naquele id.

## O que você vai ver de diferente ao abrir o programa

Só o que o `CHANGELOG` da **v23.2** diz que está feito. **Nada disto foi conferido a olho ainda:** o chat de uso está refazendo a fila agora, e a coluna *conferido no uso por* diz, defeito por defeito.

| # | Onde | O que você vai ver | O que ainda não |
|:---:|:---|:---|:---|
| 1 | Ao abrir o programa | Os menus seguem o trabalho: Arquivo, Editar, Esqueleto, Animação, depois Exibir. Exportar mora num lugar só, e os nomes dizem o que sai (GIF, PNG, folha, vídeo). | Ainda falta ver isso na tela: os chats de uso conferem agora. |
| 2 | Na barra da cena | Um botão "Partículas", com a palavra sempre à vista: emissor vazio, fogo, fumaça, faísca e poeira já prontos. A cor da partícula sai certa, e não mais branca. | A ficha do emissor ainda é longa. |
| 3 | Na tela toda | Nada pula, nada encolhe sozinho, nada rola de lado. O que não cabe na barra de cima vai para um "Mais ▾". A cena fica com mais da metade da tela. | A faixa de baixo, com os Detalhes abertos, mostra as linhas por osso só rolando. |
| 4 | Na aba Animações | A animação nova aparece na lista, com o nome pronto para escrever, e já nasce repetindo. Dá para renomear na própria linha, ou com o botão direito. Uma linha "Base — montar" leva de volta à montagem. | Os botões de formato da curva ainda ficam abaixo do gráfico. |
| 5 | No rodapé | Depois de cada passo o rodapé diz "Próximo:" e o caminho de clique, na ordem do Spriter: trazer as imagens, pôr na cena, criar os ossos, ligar as imagens aos ossos, salvar, criar a animação, posar, tocar. Dá para desligar em Preferências. | Fica curto, em no máximo 80 letras; o caminho inteiro está na dica ao passar o mouse. |
| 6 | Ao mexer no boneco | Evento e Parâmetro aparecem na Árvore, e a Árvore rola até o que você escolhe. Cada gesto diz o que fez ao soltar. Se uma regra segura o osso e ele não gira, o rodapé diz qual regra. Clicar num desenho só escolhe: a ferramenta não troca sozinha. As setas empurram a imagem. | — |
| 7 | Ao animar | Posar ou arrastar um vértice diz "Chave em 0,53 s: …". O botão direito na chave do Resumo abre o menu, com "Apagar chave". A troca de imagem no meio vale só dali para frente. | A linha própria da troca de imagem ainda não foi vista na tela. |
| 8 | Nas imagens e no pivô | Dois cliques numa imagem abrem o pivô. As setas ajustam de 1 em 1 pixel. Copiar e colar pivô sempre dizem o que fizeram, e o pivô gravado aparece na miniatura. | O que o pivô faz ao ser acertado espera a sua resposta: o desenho pula para o osso, ou fica parado? |
| 9 | Nas peles | A troca de imagem vai para a roupa que está com o lápis. Desfazer volta a roupa e o lápis. "Ver ossos", "Só este" e "Limpar guias" dizem o que fizeram, e nunca ficam mudos. A cebola mostra as imagens. | A cebola e os nomes das peles ainda não foram vistos na tela. |
| 10 | Ao salvar e ao abrir | Salvar não perde mais os quadros de uma sequência. Abrir o .bone salvo traz as imagens, ou o aviso diz qual pasta abrir. O herói abre com o nome certo. "Agora não" guarda o rascunho à parte, e a janela mostra todos. Um projeto do Spriter e uma folha do Aseprite entram visíveis. | O aviso de "Próximo:" no rodapé ainda não foi conferido no uso. |

## Os três quadros

**Hoje: 90 fechados · 2 em obra (0 já consertados, esperam a janela) · 78 faltam** (de 173: 141 da fila de defeitos + 32 do plano). Fora da conta: 1 recusado, 2 adiado.

**Duas seções.** A **fila** (defeitos achados no uso) e a seção **Do plano** (o que o plano de finalizar e as fichas A a E pediram, com ids `PL-1`, `PL-2`…). Os fechos da v22.9 e da v23.0 estão quase todos na seção do plano. O **A5 não fechou**: a v22.9 diz que o teste antigo "fica avisado, não mexido".

**Total: 141 linhas.** Das duas fontes vieram 162 ids; 28 defeitos foram juntados (o mesmo defeito visto por mais de um chat) e 7 foram partidos em dois (dois donos de fato).

### 1 · Quantos por chat dono

| Chat | Parte | Defeitos | A conferir |
|:---:|:---|---:|---:|
| **A** | A · a casca: menus, janelas, arquivo, documento (ui/shell*, doc/*, dialog, prefs, ordem, inclinar, compensar) | 21 | 0 |
| **B** | B · partículas, Propriedades, ficha rápida, barra da cena | 7 | 0 |
| **C** | C · a aba Regras e `ferramentas/provas/` (P44) | 4 | 0 |
| **D** | D · Árvore, malha, linha do tempo, `keying` | 23 | 0 |
| **E** | E · arquivo, importar, exportar, pivô (io/*), `shell-drop` | 22 | 0 |
| **F** | F · a cena e as ferramentas | 14 | 0 |
| **G** | G · animações, prévia, curvas | 11 | 0 |
| **H** | H · imagens e pivô (os painéis) | 9 | 0 |
| **I** | I · exibição, peles, histórico | 18 | 0 |
| **P** | P · a tela que cabe: tamanho e lugar (shell.css, layout, barra de ações, toolbar-model) — P45 | 12 | 0 |
| **—** | sem dono | 0 | 0 |
| | **Soma** | **141** | **0** |

O **C** só tem o C1, o da prova: as portas das regras não quebraram na mão de ninguém. Com a divisão da casca (P45), **A** ficou com 21 e **P** com 12. **D** lidera com 23, seguido de **E** (22) e **A**.

### 2 · Quantos por tipo

| Tipo | Quantos | Na régua do arroz |
|:---|---:|:---|
| não se acha | 34 | a panela: **não se acha** |
| criei e sumiu | 11 | o arroz: **criei e sumiu** |
| fez e não avisou | 32 | a água ferveu: **fez e não avisou** |
| sequência quebra | 23 | a ordem: **a sequência quebra aqui** |
| deu erro | 41 | defeito de programa, fora da régua |
| **Soma** | **141** | |

### 3 · Por estado

| Estado | Quantos |
|:---|---:|
| aberto | 56 |
| a medir | 10 |
| em obra | 0 |
| consertado | 0 |
| fechado | 75 |

**Com decisão do diário:** 61 de 141. **Sem decisão:** 80.

### 4 · Os DEZ que mais doem — para o Humberto ler

**Hoje: 90 fechados · 2 em obra (0 já consertados, esperam a janela) · 78 faltam** (fila de defeitos + plano).

Pela ordem do estrago. O critério: perdem trabalho, ou quebram a **sequência de uma tarefa inteira**, e/ou foram achados por mais de um chat. Os que o uso já **confirmou consertados** saem daqui e vão para o quadro ao lado. A frase da terceira coluna é do jeito que ele diria. A quarta é **o que ele vai ver quando consertar**: é a intenção, não uma promessa, até o dono fechar.

| # | A tarefa | O que ele sente | O que ele vai ver quando consertar | Chats que viram | Ids (para o Planejador) |
|:---:|:---|:---|:---|:---:|:---|
| 1 | **levar uma roupa para outro boneco** | Exportei a roupa, apaguei, importei de volta, e ela não voltou. O programa disse só uma frase em inglês. | A roupa exportada entra de volta, igualzinha. Se não entrar, o programa diz em português por quê. | 1 | M17 |
| 2 | **girar um osso digitando o ângulo** | Digitei 90 no Ângulo do osso e nada mexeu: nem o osso, nem os desenhos dele. O programa não disse nada. | O osso gira até 90, com os desenhos junto. | 1 | J9 |
| 3 | **prender a imagem ao osso** | Não acho como prender a imagem ao osso: nada à vista diz. É o passo do meio de toda montagem. | Uma dica à vista diz que dá para arrastar a linha da imagem para cima do osso na Árvore. | 1 | J8 |
| 4 | **marcar o pivô — UMA PERGUNTA PARA VOCÊ** | Acertei o ponto de giro de uma imagem e o desenho se recolocou, sem me dizer para onde foi. | Por enquanto, só o rodapé diz de onde o desenho saiu e para onde foi. Nada mais muda até você responder: ao acertar o pivô, o desenho deve pular para o osso, ou ficar parado onde está? | 3 | H2 + J6 + H-Q9 |
| 5 | **trazer um projeto grande do Spriter** | Soltei um projeto grande do Spriter e o programa travou. | O projeto grande abre sem prender o programa, ou o programa avisa antes quanto ele pesa. | 1 | E6 |
| 6 | **animar com a linha do tempo aberta** | Abro os Detalhes da linha do tempo e a cena corta a cabeça e os pés do boneco. A lista de animações some. | A cena mostra o boneco inteiro, e a lista de animações continua à vista. | 1 | K13 |
| 7 | **trocar a imagem no meio da animação** | Troco a imagem e a faixa de baixo abre sozinha: as abas cobrem os botões de tocar, e ninguém me diz por que abriu. | A faixa abre sem cobrir o tocador, o rodapé diz por que abriu, e um clique fecha. | 2 | K16a + A2-2 + K16b |
| 8 | **achar a lista de animações e os campos do osso** | A lista de animações e o painel de Propriedades ficam com altura de três linhas. O Ângulo do osso fica escondido. | A lista mostra várias linhas, e o Ângulo aparece sem rolar. | 3 | K1b + K17 + J17 |
| 9 | **pôr uma imagem numa roupa** | As abas Imagens e Peles não cabem juntas: uma some quando a outra abre. E a faixa "pele vazia" piora. | As duas ficam à vista ao mesmo tempo. | 1 | M16 |
| 10 | **criar uma roupa** | Não acho "Nova pele" nem "Pele de uma pasta" nos menus, nem na busca de comandos. | Os dois aparecem em Esqueleto → Peles, e a busca os acha. | 1 | M18 |

#### Os que doíam e fecharam

Saíram dos dez porque o **uso já viu consertado**. A coluna diz quem viu.

| Ids | A tarefa | Quem viu | O que você vê agora |
|:---|:---|:---:|:---|
| K1a + G-Q1 | criar uma animação | K | A animação nova aparece na lista, com o nome pronto para escrever. |
| K11 + F6 | escolher e mexer | K | Clicar só escolhe: a ferramenta não troca sozinha. |
| K12 + M14 | trocar a imagem no meio | K e M | A troca aparece e vale só dali para frente. |
| K15 | trocar a imagem no meio | K | O rosto só muda no quadro em que você trocou; antes dele fica o de antes. |
| J4 + F5 | criar ossos | J | A tela não pula e o painel da direita não encolhe: a aba Imagens fica no mesmo lugar antes, durante e depois. |
| J3 | criar osso pelo menu | J | O rodapé diz: "Osso osso2 criado, filho de osso, na ponta dele". |
| J7 + H-Q1 + H-Q6 | marcar o pivô | J | Dois cliques na imagem abrem o pivô, e os botões aparecem. |
| J12 | achar a ferramenta | J | A ferramenta escolhida mostra o nome ao lado do ícone. |
| A3 + J13 | salvar e recarregar | J | Depois de salvar e recarregar, o programa não pergunta se quer recuperar nada. |
| I-O2 + M2 | vestir uma roupa | M | A troca de imagem vai para a roupa que está com o lápis; o rodapé diz qual. |

**Logo abaixo, também achados por mais de um chat:** A2 + N-12 (4 chats: o nome com lixo, herdado por todo arquivo exportado) · A3 + J13 (3 chats: o rascunho) · B2 + F7 (a Árvore não rola até o que se criou) · D1 + B3 (a ficha cai atrás de "Compensar") · I-O3 + L16 (a barra corta o último botão) · J10 + M9 (o "Sobre" diz 0.1.0). E os que ainda quebram uma tarefa inteira, com um chat só: K15 (a troca de imagem vale antes) · L1 + L2 + L3 (a cadeia dos pesos) · N-1 a N-3 (exportar não se acha).

---

## A fila

Ordem: por chat dono (A a I); dentro dele, agrupado por assunto.

| id | tipo | o defeito | chat dono | achado também por | decisão | estado | conferido no uso por |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **A1** | deu erro | Barra marrom vazia nas janelas de formulário | A | — | P2 | fechado na v23.2 (sem foto) | — |
| **A2-1** | sequência quebra | Recusar o rascunho e mexer grava por cima dele, calado | A | — | — | fechado na v23.3 (fotos antes e depois) | — |
| **A2 + N-12** | fez e não avisou | Nome do arquivo sai com lixo: heroi-DUlefYnW.bone | A | N, K, M | P25 | fechado na v23.2 (sem foto) | K: consertado, visto no uso (título heroi.bone no montado) |
| **A3 + J13** | fez e não avisou | Recuperar oferece "sem nome", ou oferece com tudo salvo | A | J, K | P17 | fechado na v23.2 (sem foto) | J: consertado, visto no uso (sem pergunta depois de salvar e recarregar) |
| **A5** | deu erro | Teste da compensação prova outra coisa (regra 28) | A | — | — | fechado na v23.2 | — |
| **E1** | deu erro | Desfazer Importar PSD reordena as chaves do arquivo | A | — | P11 | fechado na v23.2 | — |
| **J10 + M9** | deu erro | "Sobre" diz versão 0.1.0; o programa é a v22.8 | A | M | — | aberto | J: NÃO CONSERTADO (o Sobre diz 0.1.0) |
| **J11** | não se acha | Boas-vindas citam "Abrir pasta…"; o menu diz outro nome | A | — | — | aberto | J: NÃO CONSERTADO |
| **K4** | sequência quebra | Nada diz o passo seguinte: abrir o herói, posar | A | — | P19 | fechado na v23.3 (10 fotos; ainda NÃO conferido no uso na v23.3) | K: NÃO CONSERTADO na v23.2 (nada manda o passo seguinte) — conserto de 10:02 ainda não conferido |
| **L13** | deu erro | Mensagens do rodapé terminam com dois pontos | A | — | — | fechado na v23.2 (sem foto) | — |
| **N-1** | não se acha | Exportar fica escondido no fim de uma lista que rola | A | — | P33 | fechado na v23.2 (sem foto) | — |
| **N-2** | não se acha | Nomes de Exportar ▸ não dizem GIF, folha, vídeo | A | — | P33 | fechado na v23.2 (sem foto) | — |
| **N-3** | não se acha | Dois "exportar" com sentidos diferentes, nenhum diz para quê | A | — | P33 | fechado na v23.2 (sem foto) | — |
| **N-15** | sequência quebra | Primeiro clique em Arquivo só realça a palavra | A | — | — | a medir | — |
| **E3b** | não se acha | "Abrir pasta…" ignora o .scml e só procura .bone | A | — | P29 | fechado na v23.3 (sem foto: o seletor do Windows não se abre; o chat de uso confere) | — |
| **J14** | fez e não avisou | Projeto nunca pede um nome: grava "sem nome.bone" | A | — | — | aberto | J: NÃO CONSERTADO |
| **N-9** | fez e não avisou | "Repetir a última exportação" é mudo e nem sempre repete | A | — | — | aberto | — |
| **M12b** | deu erro | Aviso do arquivo em inglês; o editor traduz (prioridade baixa) | A | — | P46 | aberto | M: PELA METADE (o aviso segue em inglês) |
| **K18** | deu erro | Ctrl+V do teclado não colou; o menu colou | A | — | — | a medir | — |
| **R1a + J16** | deu erro | Rodapé com três campos cortados: a frase da dica | A | J | P66 | fechado na v23.3 (P66: a frase que se lê tem no máximo 80 letras; a foto p66_depois) | J: achou o mesmo (J16); o conserto da v23.3 ainda NÃO foi conferido |
| **J18** | não se acha | Reabrir: três itens no menu Arquivo, e o certo é o último | A | sem fonte (mensagem do Planejador) | — | aberto | — |
| **B1** | deu erro | Partícula sai branca: o desenhador ignora a cor | B | — | P7, P10 | fechado na v23.2 | — |
| **D1 + B3** | criei e sumiu | Ficha do parâmetro/emissor cai atrás de "Compensar" | B | B | P6 | aberto | — |
| **D2** | criei e sumiu | Ficha do evento mora no fim de Propriedades | B | — | — | a medir | — |
| **J9** | fez e não avisou | Digitar 90 em Ângulo não gira o osso na cena | B | — | — | aberto (medido pelo J sem janela; GRAVE) | J: NÃO CONSERTADO (Ângulo 90 digitado: osso e desenhos não se mexem; medido sem janela; GRAVE) |
| **J12** | não se acha | Botão de criar osso é ícone sem nome entre onze | B | — | P38 | fechado na v23.2 | J: consertado, visto no uso |
| **K8** | deu erro | Ficha rápida escreve no quadro mas mostra a base | B | — | P24 | aberto | K: PELA METADE (a Imagem segue o quadro; o Ângulo não deu para ver) |
| **L1b** | não se acha | Pincel de pesos é só um ícone sem nome na barra de cima | B | — | P38 | fechado na v23.2 | — |
| **C4** | deu erro | Botão "Assar a física" desenhava a letra A: faltava o ícone | C | — | — | fechado na v23.2 (sem foto de depois) | — |
| **C1** | deu erro | Passo 14 do roteiro cai por espera curta (a espera passou a 30 s) | C | — | P22, P39, P44 | fechado na v23.0 | — |
| **C3** | deu erro | O roteiro caiu uma vez no passo 14 sem dizer por quê | C | — | — | a medir | — |
| **FECHO-3** | deu erro | As cinco ações "No fim" sem nome de tarefa (teste vermelho) | C | — | P44 | fechado na v23.2 | — |
| **B2 + F7** | criei e sumiu | Árvore não rola até o osso ou emissor escolhido | D | F | — | fechado na v23.2 (sem foto) | — |
| **G1 + G-Q8** | não se acha | Botão direito no losango do Resumo não abre nada | D | G | P9, P26 | fechado na v23.2 (sem foto) | — |
| **I-O1** | fez e não avisou | Olho da Árvore esconde e não diz nada | D | — | P26 | fechado na v23.2 (sem foto) | — |
| **I-O4** | deu erro | "Opções da casca de cebola" abre cortada | D | — | P26 | fechado na v23.2 (sem foto) | — |
| **J3** | sequência quebra | "Novo → Osso" cria osso solto, de comprimento zero | D | — | — | fechado na v23.2 (sem foto) | J: consertado, visto no uso |
| **J8** | não se acha | Nada à vista diz como prender a imagem ao osso (arrastar na Árvore) | D | — | — | aberto | J: PELA METADE (retratação: arrastar linha não escolhida funciona sem janela; falta só a dica) |
| **K3** | fez e não avisou | Posar cria a chave sem dizer; caixa laranja sem legenda | D | — | P26 | aberto (reaberto pelo uso na v23.2: posar diz só "Girar -22,6°"; falta dizer que criou chave) | K: PELA METADE (posar diz só "Girar -22,6°") |
| **K5** | não se acha | Colar pose espelhada existe, mas ninguém acha | D | — | P21, P26 | fechado na v23.2 (sem foto) | K: consertado, visto no uso |
| **K12 + M14** | criei e sumiu | Troca de imagem no meio: sem linha na Linha do tempo | D | M | P12 | fechado na v23.2 (sem foto) | K e M: consertado, visto no uso |
| **K15** | deu erro | Troca de imagem vale antes do quadro em que foi feita | D | — | P20, P26 | fechado na v23.2 (sem foto) | K: consertado, visto no uso |
| **L1a** | não se acha | Grupo "Pincel" do painel abre e não liga o pincel; nada avisa | D | — | P32 | aberto | — |
| **L2** | sequência quebra | Depois de "Pesos automáticos" a cena não muda | D | — | P32 | aberto | — |
| **L3** | fez e não avisou | Resultado dos pesos fica abaixo da dobra do painel | D | — | P32 | aberto | — |
| **L4** | fez e não avisou | Virar malha, Traçar, Gerar dizem o botão, não o resultado | D | — | — | aberto | — |
| **L5** | sequência quebra | Painel Malha e pesos é uma lista longa numa janela baixa | D | — | — | aberto | — |
| **L6** | fez e não avisou | "Criar aresta" fica apagado sem dizer por quê | D | — | — | aberto | — |
| **L7** | criei e sumiu | Aresta feita à mão não se distingue das automáticas | D | — | — | a medir | — |
| **L8** | fez e não avisou | Pintar peso não avisa qual osso nem quantos pontos | D | — | — | aberto | — |
| **L9** | não se acha | Osso do pincel se escolhe pelo nome, longe da cena | D | — | — | aberto | — |
| **L17** | fez e não avisou | Arrastar vértice na animação cria a chave e não diz | D | — | — | fechado na v23.2 (sem foto) | — |
| **K10b** | não se acha | Árvore mostra ~9 linhas e o osso escolhido fica fora; Escolher não tem "irmão" | D | — | — | aberto | K: PELA METADE (a Árvore rola até o osso; o irmão não foi testado) |
| **L11b** | sequência quebra | O painel de pesos não tem o passo "testar" nem diz para desfazer | D | — | — | aberto | — |
| **K16b** | fez e não avisou | Criar uma chave abre os Detalhes sozinho, sem dizer | D | — | P12 | aberto | — |
| **E2** | deu erro | Projeto do Spriter entra invisível, com 176 avisos | E | — | P29 | fechado na v23.3 (foto com 10 imagens; o projeto inteiro trava: E6) | — |
| **E3a** | não se acha | Arrastar a pasta na janela não desce nas subpastas do projeto Spriter | E | — | P29 | fechado na v23.3 | — |
| **E4** | deu erro | Salvar perdia os quadros de toda sequência de imagens | E | — | P59 | fechado na v23.2 (sem seção própria no CHANGELOG; o Planejador confirma) | — |
| **H1 + H-Q8** | deu erro | Trocar a imagem de um desenho solto faz ele pular | E | H | P15 | fechado na v23.3 (sem foto) | — |
| **H2 + J6 + H-Q9** | criei e sumiu | Pergunta ao Humberto: o pivô recoloca o desenho, preso ou solto? | E | J, H | P15, P65, P67 | fechado na v23.3 (só o rodapé, de onde para onde; sem foto; o comportamento espera a resposta do Humberto) | J: NÃO CONSERTADO na v23.2 (o rodapé do pivô está no disco; espera o chat H ligar a chamada) |
| **J1** | sequência quebra | Abrir o .bone recém-salvo abre sem as imagens | E | — | — | fechado na v23.3 (ainda NÃO conferido no uso na v23.3) | J: NÃO CONSERTADO na v23.2 (já consertado no disco, entra na v23.3) |
| **J5 + M4** | deu erro | Arrastar miniatura mostra erro falso "Não sei o que fazer" | E | M | P40 | fechado na v23.3 | J: NÃO CONFERIDO (o arrasto de verdade não se faz sem janela) |
| **N-4a** | não se acha | O diálogo de exportar não diz onde fica a área de recorte | E | — | — | aberto | — |
| **N-5** | sequência quebra | Diálogo de exportar não mostra o que vai sair | E | — | — | aberto | — |
| **N-6** | fez e não avisou | "Tamanho de cada quadro" mente com "Todas as animações" | E | — | — | fechado na v23.3 | — |
| **N-7** | fez e não avisou | PNG diz "60 arquivos"; saiu 1 .zip sem nome | E | — | — | aberto | — |
| **N-8** | fez e não avisou | Aviso de exportar nunca diz onde o arquivo foi parar | E | — | — | aberto | — |
| **N-10** | sequência quebra | Diálogo de exportar não guarda a escolha da vez passada | E | — | — | aberto | — |
| **N-11** | deu erro | WebM saiu com 0,73 s em vez de 2 s | E | — | — | a medir | — |
| **N-13** | fez e não avisou | Avisos de exportar em jargão que ninguém entende | E | — | — | aberto | — |
| **N-14** | fez e não avisou | Toda exportação repete a dica do ffmpeg/MP4 | E | — | — | fechado na v23.3 | — |
| **N-16a** | deu erro | "De/Até" ligados com "Todas as animações" (não era defeito) | E | — | P65 | fechado: não era defeito (P65; o "De/Até com Todas" já estava certo) | — |
| **N-16b** | sequência quebra | O diálogo Exportar imagem abre rolado, com o título escondido | E | — | — | a medir | — |
| **C2** | deu erro | Abrir pasta do projeto leva 5 a 6 segundos | E | — | P39 | aberto | — |
| **E5** | deu erro | Salvar gravava a tira inteira em cada quadro da folha do Aseprite | E | — | — | fechado na v23.3 (fotos antes e depois) | — |
| **E6** | deu erro | Projeto grande do Spriter pesa ~680 MB e prende o programa | E | — | — | a medir | — |
| **M17** | sequência quebra | Importar pele recusa o arquivo da Exportar: o gravador esquece a lista de ossos (GRAVE) | E | — | — | aberto | — |
| **J2** | sequência quebra | "Virar filho de…" no menu não faz o que diz | F | — | — | aberto | J: NÃO CONSERTADO ("Virar filho de…" ainda só diz "Segure P") |
| **N-4b** | não se acha | Não há retângulo de recorte arrastável na cena | F | — | — | aberto | — |
| **A4** | deu erro | Desfazer deixa "shearX: 0" onde o campo não existia | F | — | P11 (mesma forma) | fechado na v23.2 | — |
| **F1** | fez e não avisou | Recado do rodapé é escrito e apagado no mesmo quadro | F | — | — | fechado na v23.2 | — |
| **F2** | fez e não avisou | Nenhum arrasto diz o que fez ao soltar | F | — | — | fechado na v23.2 | — |
| **F-p18** | fez e não avisou | Alt+arrastar caixa muda a ferramenta para Malha e não diz | F | — | — | aberto | — |
| **F3 + L10** | fez e não avisou | Girar osso segurado por regra: grava, tela parada, calado | F | L | — | fechado na v23.2 (foto só do texto longo) | — |
| **H3 + H-Q10** | não se acha | Setas não empurram o desenho escolhido na cena | F | H | P16 | fechado na v23.2 (sem foto) | — |
| **K10a** | não se acha | Clicar na perna pega o osso vizinho; o nome só sai em Propriedades | F | — | — | aberto | K: PELA METADE (o irmão não foi testado) |
| **K11 + F6** | fez e não avisou | Clicar no rosto liga a ferramenta Malha sozinha | F | F | P21 | fechado na v23.2 (sem foto) | K: consertado, visto no uso |
| **L11a** | sequência quebra | Girar um osso para testar pesos grava na base, sem aviso | F | — | — | fechado na v23.2 (sem foto) | — |
| **L15** | criei e sumiu | Abrir o herói deixa o boneco pequeno, cabeça fora | F | — | — | aberto | — |
| **M13** | fez e não avisou | "Em todas as peles" (botão direito) não muda nada | F | — | — | a medir | M: PELA METADE (dica ao passar o mouse; clicar segue mudo) |
| **M15** | deu erro | Botão direito no vazio diz "Não há ferramenta anterior" | F | — | — | a medir | M: NÃO CONSERTADO ("Não há ferramenta anterior para voltar") |
| **K1a + G-Q1** | criei e sumiu | Animação nova não aparece: a lista tem 17 px de altura | G | G | P14 | fechado na v23.2 | K: consertado, visto no uso |
| **K2** | fez e não avisou | Renomear animação diz "Abriu a animação" | G | — | P14 | fechado na v23.2 | K: consertado, visto no uso |
| **K6** | sequência quebra | Animação nova não repete, e nada avisa | G | — | P18 | fechado na v23.2 (sem foto) | K: consertado, visto no uso |
| **K7** | deu erro | Etiqueta "repete" não aparece ao ligar Repetir | G | — | — | fechado na v23.2 (sem foto) | K: consertado com ressalva (já nasce em laço; não repetiu o gesto de ligar) |
| **G-Q3** | não se acha | Botão direito no nome da animação não faz nada | G | — | P14 | fechado na v23.2 | — |
| **G-Q4** | criei e sumiu | A Prévia abre vazia com uma animação aberta e tocando | G | — | P14 | aberto | — |
| **G-Q6** | sequência quebra | Curvas ocupa a aba do tocador: não se toca olhando a curva | G | — | — | aberto | — |
| **G-Q7** | fez e não avisou | Curvas vazia só diz "Passe o cursor sobre a área" | G | — | P14 | aberto | — |
| **K9 + G-Q5** | não se acha | Botões do formato da curva ficam abaixo do gráfico | G | G | — | aberto | K: NÃO CONSERTADO (os botões da curva continuam abaixo do gráfico) |
| **K14 + G-Q2** | deu erro | Criar e renomear animação usam a caixa do navegador; duplo clique não renomeia | G | G | P14 | fechado na v23.2 | K: consertado, visto no uso |
| **FECHO-1** | deu erro | Reabrir a pasta abria o campo de nome como animação nova | G | C | — | fechado na v23.2 | — |
| **I-O2 + M2** | sequência quebra | Trocar imagem com o lápis aceso cai na base, não na pele | H | M | P27 | fechado na v23.2 | M: consertado, visto no uso (os três caminhos: grade, botão direito na cena, Esqueleto → Peles → Trocar imagem nas peles; o rodapé diz a pele) |
| **J7 + H-Q1 + H-Q6** | não se acha | Duplo clique na miniatura não abre o pivô; botões viram pontinho | H | H | P33 | fechado na v23.2 | J: consertado, visto no uso (duplo clique abre o pivô; os botões têm 54×42) |
| **J15** | não se acha | Aba Imagens mostra só uma linha e meia de miniaturas | H | — | — | aberto | J: NÃO CONSERTADO |
| **H-Q2** | não se acha | Setas não mexem a cruz do pivô, na janela nem no painel | H | — | P8, P16 | fechado na v23.2 | — |
| **H-Q3** | fez e não avisou | Copiar pivô cala; Colar diz "copie primeiro" mesmo copiado | H | — | — | fechado na v23.2 | — |
| **H-Q4** | criei e sumiu | O pivô gravado não aparece na miniatura da aba Imagens | H | — | — | fechado na v23.2 | — |
| **H-Q5** | sequência quebra | "Usar no desenho escolhido" fica apagado com o slot escolhido | H | — | — | fechado na v23.2 | — |
| **H-Q7** | não se acha | Painel Pivôs apertado em 1440×900: pontos sobre o texto | H | — | — | fechado na v23.2 | — |
| **M20** | fez e não avisou | "Trocar imagem nas peles" fica cinza sem dizer por quê | H | — | — | aberto | — |
| **I1** | deu erro | "H" conta errado: "2 escondido" para um desenho | I | — | — | fechado na v23.2 (sem foto) | — |
| **I2** | deu erro | Shift+H sem seleção esconde tudo e diz "o escolhido" | I | — | — | fechado na v23.2 (sem foto) | — |
| **I3** | fez e não avisou | Fechar a aba Exibição mata "Ver ossos" e o menu Exibir | I | — | P23, P28 | fechado na v23.2 (sem foto) | — |
| **I4** | deu erro | Cebola ligada quase não aparece: só riscos de osso | I | — | — | fechado na v23.2 (sem foto; não visto no navegador) | — |
| **I5** | deu erro | Desfazer "Nova pele" deixa o lápis numa pele inexistente | I | — | — | fechado na v23.2 (sem foto) | — |
| **I6 + M5** | não se acha | Nomes das peles cortados na aba Peles | I | M | — | fechado na v23.2 (sem foto; não visto no navegador) | M: consertado, visto no uso |
| **I7 + M3** | sequência quebra | Pele nova: nada diz como pôr imagem nela | I | M | — | fechado na v23.2 (sem foto; frase provisória) | M: consertado, visto no uso |
| **I8** | não se acha | Aba Exibição rola, mas os grupos não dobram | I | — | — | aberto | — |
| **M1** | deu erro | Renomear pele deixa aviso com o nome antigo | I | — | — | fechado na v23.2 (sem foto) | M: consertado, visto no uso |
| **M6** | não se acha | Renomear pele só por duplo clique, sem dica | I | — | — | fechado na v23.2 (visto no uso pelo M; sem menção no CHANGELOG) | M: consertado, visto no uso |
| **M7** | fez e não avisou | Tirar a pele da pilha (×): rodapé mudo | I | — | — | aberto | M: NÃO CONSERTADO (o × de despir: rodapé mudo) |
| **M8** | fez e não avisou | Soltar a pele sobre a linha default: nada, sem aviso | I | — | — | fechado na v23.2 (visto no uso pelo M; sem menção no CHANGELOG) | M: consertado, visto no uso |
| **M10** | não se acha | Sete ícones sem texto na aba Peles; exporta só com lápis | I | — | — | aberto | M: PELA METADE (Exportar/Importar pele no menu Arquivo com texto; os ícones da aba seguem sem texto) |
| **M11** | sequência quebra | Importar pele: seletor abre, pele não volta, mudo | I | — | — | aberto (reaberto pelo uso na v23.2: Importar diz o resultado, mas recusa o arquivo que a Exportar grava; ver M17) | M: PELA METADE (Importar diz o resultado, mas recusa o arquivo que a própria Exportar grava) |
| **M12a** | deu erro | Apagar pele não diz que outra pele depende dela | I | — | — | aberto | M: PELA METADE (um aviso em vez de dois; a pergunta não cita quem depende) |
| **FECHO-2** | deu erro | "Limpar guias" ficava cinza sem guia nenhuma | I | — | P58 | fechado na v23.2 | — |
| **M18** | não se acha | Esqueleto → Peles só tem dois itens; Nova pele fica fora do menu | I | — | — | aberto | — |
| **M19** | não se acha | A faixa "pele vazia" espreme Feitas e Ativas | I | — | — | aberto | — |
| **F4** | fez e não avisou | Caixa e Ponto não dizem o gesto ao pegar a ferramenta | P | — | P45 | fechado na v23.2 | — |
| **I-O3 + L16** | não se acha | Barra do alto corta o último botão, até em 1440×900 | P | L | P45 | fechado na v23.2 | — |
| **J4 + F5** | deu erro | Dica longa do rodapé empurra o painel da direita | P | F | P45 | fechado na v23.2 (par de fotos do dono, chat P; conferido no uso pelo J) | J: consertado, visto no uso (a aba Imagens fica em x=1168 antes, durante e depois) |
| **K13** | sequência quebra | Abrir Detalhes encolhe a cena a uma faixa | P | — | P45 | aberto (reaberto pelo uso na v23.2: a cena não encolhe a faixa, mas corta cabeça e pés, e o painel Animações perde a lista) | K: PELA METADE (a cena não encolhe a faixa, mas corta cabeça e pés) |
| **L12** | sequência quebra | Malha e Animações no mesmo grupo: nunca se veem juntas | P | — | P33, P45 | aberto | — |
| **L14** | sequência quebra | Rodapé longo passa a duas linhas e a tela pula | P | — | P45 | fechado na v23.2 | — |
| **M16** | não se acha | Imagens e Peles não cabem juntas na mesma coluna | P | — | P45 | aberto | M: NÃO CONSERTADO (Imagens e Peles não cabem juntas; a faixa nova "pele vazia" piora) |
| **K1b** | criei e sumiu | Painel da direita sem altura; divisor entre Imagens e Animações sem alça | P | — | P45 | aberto | — |
| **K16a + A2-2** | deu erro | Com a faixa de baixo aberta, as abas cobrem o tocador | P | A2 | — | aberto | — |
| **K17 + J17** | não se acha | Propriedades com 3 linhas de altura: o Ângulo fica escondido | P | J | — | aberto | J: achou o mesmo (J17) |
| **R1b + A2-4** | deu erro | Rodapé com três campos cortados: a largura dos campos | P | A2 | P66 | aberto | — |
| **A2-3** | deu erro | "Repetir a última exportação" quebra no meio da palavra no menu | P | — | — | aberto | — |

---

## Do plano

O que o plano pediu, e não só o que quebrou. Fontes: `documentos/planos/PLANO finalizar o programa 2026-09-28.md` (os lotes e a tabela A), as fichas A a E de `ENCARGOS rodada final 2026-09-28.md` e, de **PL-28** a **PL-32**, o diário do Planejador (P33 e P41: a ordem dos menus, que o Humberto pediu). Ids **`PL-n`**. A coluna *decisão* traz o **P** do diário ou o **D** do plano (a pergunta ao Humberto).

| Estado | Quantos |
|:---|---:|
| fechado | 15 |
| consertado | 0 |
| em obra | 2 |
| aberto | 12 |
| recusado | 1 |
| adiado | 2 |
| **Soma** | **32** |

| id | o item | fonte no plano | chat dono | decisão | estado | conferido no uso por |
|:---|:---|:---|:---:|:---:|:---|:---:|
| **PL-1** | Os 4 erros soltos do teste de ações | plano, lote 1 · ficha A | A | — | fechado na v22.9 | — |
| **PL-2** | Inclinar compensa ("Não mexer nos filhos" vale para Inclinar) | plano, lote 1 · ficha A | A | — | fechado na v22.9 | — |
| **PL-3** | Renomear pasta avisa antes de fundir duas | plano, lote 1 · ficha A | A | — | fechado na v22.9 | — |
| **PL-4** | A tecla que cala: a tecla sem ação diz por quê no rodapé | plano, lote 1 · ficha A | A | — | fechado na v22.9 | — |
| **PL-5** | Um arrasto = um Ctrl+Z (com "Não mexer nos filhos" pedia oito) | ficha A (achado do lote 1) | A | — | fechado na v22.9 | — |
| **PL-6** | Apagar etiqueta: porta na aba Regras | plano, tabela A · ficha C, lote 1 | C | D8 | fechado na v23.0 | — |
| **PL-7** | Renomear etiqueta: porta na aba Regras | plano, tabela A · ficha C, lote 1 | C | D8 | fechado na v23.0 | — |
| **PL-8** | Trocar os ossos de uma IK já feita | plano, tabela A · ficha C, lote 2 | C | D1, P4 | fechado na v23.2 | — |
| **PL-9** | Gravar a chave do alvo no valor de agora | plano, tabela A · ficha C, lote 3 | C | D1 | fechado na v23.2 (sem foto de depois) | — |
| **PL-10** | Os doze botões da aba Regras viram um "Novo ▾" | ficha C, lote 4 | C | D9 | aberto | — |
| **PL-11** | Tirar a chave de virada de corpo (Delete e botão direito) | plano, tabela A · ficha D, lote 2 | D | P9 | fechado na v23.2 (sem foto) | — |
| **PL-12** | Importar imagens vira UM passo de desfazer | plano, tabela A · ficha E, lote 1 | E | P3 | recusado: o Humberto vetou "Importar imagens" no lote 59; vai para a limpeza | — |
| **PL-13** | Evento e Parâmetro ganham linha na Árvore | plano, lote 3 · ficha D, lote 1 | D | D2 | fechado na v23.1 | — |
| **PL-14** | O caminho ganha e perde ponto pela cena | plano, lote 3 · ficha D, lote 3 | D | D2 | aberto | — |
| **PL-15** | Malha e pesos cabe: a aba rola, com grupos dobráveis | plano, lote 5 · ficha D, lote 4 | D | D5 | aberto | — |
| **PL-16** | As etiquetas do Aseprite viram animação, uma por etiqueta | plano, lote 3 · ficha E, lote 2 | E | D3 | fechado na v23.2 | — |
| **PL-17** | Usar cada item de importar e exportar do menu Arquivo, com arquivo de verdade | ficha E, lote 3 | E | P13 | em obra (lote 3 do E: E2 e E3 achados) | — |
| **PL-18** | Botão Partículas à vista e modelos prontos (fogo, fumaça, faísca, poeira) | ficha B, lote 1 | B | P5, P38 | fechado na v23.2 | — |
| **PL-19** | A ficha do emissor e Propriedades cabem (grupos dobráveis) | plano, lote 5 · ficha B, lote 2 | B | D5, P6 | aberto | — |
| **PL-20** | Campos só do arquivo ganham campo na tela: rajada e linha | ficha B, lote 3 | B | — | aberto | — |
| **PL-21** | Teclas de painel em Ajuda → Atalhos, numa seção dobrada | ficha A, lote 4 | A | D7 | aberto | — |
| **PL-22** | Janela de descarte própria, no lugar do confirm() do navegador | ficha A, lote 4 | A | P25 | aberto | — |
| **PL-23** | Trajeto do movimento | plano, lote 4 | — | D4 | adiado: "ficam para depois, o pedido é terminar" (segunda leva) | — |
| **PL-24** | Grade em perspectiva | plano, lote 4 | — | D4 | adiado: "ficam para depois, o pedido é terminar" (segunda leva) | — |
| **PL-25** | Breakdown | plano, lote 4 | — | D4 | aberto | — |
| **PL-26** | Limpeza: o código morto da auditoria (9 sobras) | plano, lote 6 | — | D6 | aberto | — |
| **PL-27** | O fecho: suíte, roteiro, medição, programa/ montado, folha de tarefas gerada de novo | plano, lote 7 | — | — | aberto | — |
| **PL-28** | A ordem dos menus segue o trabalho: Exibir depois de Animação, Exportar num lugar só, Importar pele e animação em Importar | diário P33, P41 (a parte D do mapa do chat O) | A | P33, P41 | fechado na v23.2 (sem foto) | — |
| **PL-29** | Malha, pivô, peles e "No fim" ganham id de ação e item de menu | diário P33 | A | P33 | em obra (pivô e "No fim" feitos; malha e peles esperam) | — |
| **PL-30** | A aba Malha e pesos vai para junto de Imagens e Pivôs, só no arranjo de fábrica | diário P33 (bandeira 2) | P | P33, P45 | aberto | — |
| **PL-31** | Botão Prévia na barra de ações | diário P33 (bandeira 3) | P | P33, P45 | aberto | — |
| **PL-32** | Rótulo "Base — montar" na aba Animações | diário P33 (bandeira 4) | G | P33 | fechado na v23.2 | — |

Ligações com a fila: **PL-15** é o conserto de **L5** (painel de malha longo) · **PL-19** (a ficha cabe) é vizinho de **D1 + B3** (a ficha cai atrás de "Compensar") · **PL-13** toca a mesma forma do **B2 + F7** sem fechá-lo (só Evento e Parâmetro).

---

## Donos a conferir — esperam o Planejador

Onde o texto do defeito diz um dono e a cerca diz outro, a fila segue a **cerca**. Cada linha diz o porquê.

| id | Dono na fila | Por que confere |
|:---|:---:|:---|

## Donos decididos pelo Planejador (V3, P45 e P46)

| id | Dono | Por quê |
|:---|:---:|:---|
| **A5** | A | a compensação é dela; já autorizada a reescrever só aquele teste |
| **F4** | P | `ui/toolbar-model.ts` passou ao chat P (P45) |
| **I-O3 + L16** | P | a barra de ações é `ui/action-bar-model.ts`, do P. Se o corte for na barra da cena, parte em duas linhas: P e B |
| **L13** | A | medido pela casca: `ui/shell.ts` põe o ponto sem olhar se a frase já tem |
| **J12** | B | `viewport-toolbar.ts`; decisão P38 |
| **J5 + M4** | E | decisão P40: o `armFileDrop` ignora arrasto de dentro do programa |
| **N-16** | E (e P se for altura) | o E confere se cabe em `io/export-image.ts`; a altura comum das janelas é CSS |
| **A4** | F | `viewport/tools/select.ts`; mesma forma da P11 |
| **M12b** | A | P46: não se mexe no `runtime/` por texto; o editor traduz os avisos conhecidos, prioridade baixa |
| **L12** | P (conferir) | não estava na lista do Planejador; pus no P por ser o lugar da aba no arranjo de fábrica (P33 e P45). **Confirmar** |

## Donos que eu decidi lendo o código — aceitos pelo Planejador, sem veto

| id | Dono na fila | O texto dizia | Por que |
|:---|:---:|:---:|:---|
| **J2** | F | A | a ação `virar-filho` é registrada em `viewport/viewport.ts` (`reparentHint`); o texto do menu é da A |
| **J3** | D | A | a ação `novo-osso` é registrada em `panels/tree-actions.ts` (cerca do D) |
| **J10 + M9** | A | — | o "Sobre" é `ui/shell-actions.ts` e lê a versão do `package.json` (0.1.0). A montagem (`ferramentas/montar-programa.py`) só carimba o nome do arquivo |
| **J14** | A | E | o nome "sem nome" nasce em `doc/new-file.ts` e `doc/document.ts`; Salvar é `ui/shell-file.ts` |
| **N-9** | A | E | `repetir-exportacao` é registrada em `ui/shell-actions.ts`, junto com a mensagem "Repetindo…" |
| **M11** | I | E | `importar-pele` é registrada em `panels/skins.ts` |
| **M12** | I + sem dono | — | a pergunta é do I; a frase em inglês vem de `runtime/src/loader.ts`, fora de cerca (a P7 só deu ao B a função `drawParticles`). Por isso duas linhas: M12a e M12b |
| **K1** | G + A | — | a lista é do G; a altura e o divisor sem alça são da A. Duas linhas: K1a e K1b |
| **K10** | F + D | — | o clique na cena é do F; a Árvore e o "Escolher" são do D. Duas linhas: K10a e K10b |
| **L1** | D + B | — | o grupo do painel é do D; o nome do ícone na barra é do B. Duas linhas: L1a e L1b |
| **L11** | F + D | — | o aviso ao girar é do F; o passo "testar" do painel é do D. Duas linhas: L11a e L11b |
| **N-4** | E + F | — | o diálogo é do E; o retângulo na cena é do F. Duas linhas: N-4a e N-4b |
| **E3** | E + A | — | o arrasto de pasta é do E; o "Abrir pasta…" é da A (P29). Duas linhas: E3a e E3b |

## O que o Planejador precisa saber

| # | O quê |
|:---:|:---|
| 1 | **`ferramentas/provas/` é do chat C** (P44). O C1 é dele; a espera do passo 14 foi alargada (P39) |
| 2 | **O chat A é o que mais tem** e é também o que mais depende de decisão de lugar (rodapé, painel, menus). A reordenação da P33 cai quase toda nele |
| 3 | **Sete defeitos têm dois donos de fato** e viraram duas linhas cada: K1, K10, L1, L11, N-4, E3, M12. Sem os dois donos, o conserto de um deixa o outro quebrado (o G corrige a lista de animações e o painel continua uma fatia, se o P não der altura) |
| 4 | **Três defeitos são a mesma FORMA** *("o desfazer devolve o VALOR, e não o LUGAR")*: E1, A4 e o `SnapshotCommand` da P11. A fila os separa (dono diferente), mas quem consertar um procura os outros dois |
| 5 | **A forma "aviso que não diz a verdade"** (regra 21) aparece em: N-6 (tamanho de cada quadro), N-7 (60 arquivos), K15 (a partir de 0,50 s), K2 (Abriu), J5+M4 (erro falso), M12b (em inglês). Seis linhas, quatro donos: A, E, G, D |
| 6 | **M12b** (a frase em inglês do leitor): resolvido pela P46, dono A, prioridade baixa. O editor traduz o que conhece e mostra o resto como veio |

## Como esta fila é mantida

- Dono avisa o fecho por mensagem ("fechei K15 na v23.2"). Eu mudo o **estado** para `fechado na v23.2`.
- Defeito novo entra numa das **duas fontes** (o arquivo de defeitos ou as `SEQUENCIA`). Releio as duas a cada hora cheia e acrescento.
- Defeito que vem por mensagem e não está em nenhuma fonte: entra aqui com a marca *(sem fonte)* até alguém o pôr lá.
- Junto os repetidos numa linha só, **com todos os ids**. Se dois donos discordarem do dono, vale a cerca.
- Cópia em `backup/` a cada virada grande, com linha no `INDICE.md`.
