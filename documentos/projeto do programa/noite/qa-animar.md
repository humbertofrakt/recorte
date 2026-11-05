# QA · animar um boneco do zero — noite de 04/11/2026

Ramo: `obra/qa-animar`. Parte: Árvore, Ordem, Linha do tempo, Animações,
Malha e pesos, Propriedades.

Relatório em andamento. A versão final fica no fim da noite.

## Como foi feito

| O quê | Como |
|:---|:---|
| Navegador | Chromium sem janela, Playwright, mouse e teclado de verdade |
| Telas | 1920×1080, 1440×900, 1280×720 |
| Editor | servidor de desenvolvimento, porta 5293 |
| Leitura | o documento só é LIDO por fora, para conferir; quem muda é o gesto |
| Fotos | `fotos-qa-animar/`, escala 1 |

## O roteiro dos 30 minutos, à mão

| Passo | 1920 | 1440 | 1280 |
|:---:|:---:|:---:|:---:|
| 1 a 14 | passou | passou | passou |

## De ponta a ponta, com o herói do PSD (1920, 1440 e 1280: passou nas três)

| Passo | Resultado |
|:---|:---|
| Importar `heroi.psd` com ossos | passou: 19 desenhos, 17 ossos |
| Renomear os ossos na Árvore (duplo clique) | passou |
| Criar osso novo (B + arrastar) | passou |
| P + clique na linha da Árvore | passou |
| Ordem: Ctrl+↑, e arrastar com a lista rolando | passou |
| Andar com curvas (Suave) | passou |
| Copiar e Colar espelhado `_e`→`_d` | passou |
| Trocar de pai no meio (arrastar na Árvore, e P) | passou: vira chave em 0,50 s |
| Malha com pesos em dois ossos, pintar, suavizar, podar | passou |
| Arrastar vértice em Animando | **consertado** (D9) |
| IK (Nova regra… → cinemática inversa) | passou: o alvo puxa a perna |
| Espaço toca | passou |
| Desfazer tudo / refazer tudo | passou: volta ao vazio, volta ao fim, igual |
| Salvar, fechar, reabrir | passou: 0 diferenças |

## Os defeitos — na minha parte (consertados)

| # | O quê | Onde | Como repetir | Foto | Conserto |
|:---:|:---|:---|:---|:---|:---|
| D1 | Linha da Ordem dizia "forearm_b… forearm_b…": o detalhe repetia o nome | Ordem | PSD com ossos → aba Ordem | `03` antes, `06` depois | só mostra o detalhe quando é outro nome |
| D2 | "weapon" (6 letras) e "forearm" cortavam na Árvore: o recuo de 16 px por nível | Árvore | PSD com ossos → Árvore aberta | `08` depois | recuo encolhe no fundo (16, 16, 12, 10, 8, 6) |
| D3 | Ângulo "-166,03" aparecia "-166,0": número lido errado | Propriedades | PSD → escolher osso_9 | `03` antes, `07` depois | o campo cresce com o número; "mundo" vai para a dica |
| D4 | "4 chave(s) agora em Suave", com 6 escolhidas e sem razão | Linha do tempo | Selecionar todas as chaves → Curva → Suave | — | "4 chaves… As outras 2 são a última da linha" |
| D5 | Título "Animaçõ…" cortado por meio pixel | Animações | abrir o programa | `01` | folga da direita 8 → 4 px |
| D6 | Nome repetido virava "andar2" sem dizer por quê | Animações | duas animações com o mesmo nome | — | "Já existe "andar": … ficou "andar2"" |
| D7 | Apagar animação dizia só "Abriu a animação andar2" | Animações | apagar a aberta | — | "Apagou a animação … (Ctrl+Z volta). Aberta agora: …" |
| D8 | Esc não fechava o menu do botão direito no losango | Linha do tempo | Detalhes → botão direito numa chave → Esc | `09` | clique fora ou Esc fecham |
| D9 | **Vértice arrastado em 0,5 s: a malha já começava deformada em 0, a animação não andava** | Malha (a regra é da Linha do tempo) | malha → Animando → 0,5 s → arrastar vértice | `10` | a chave do começo `[]` nasce junto, como nos ossos (lote 68) |
| D10 | Esc num campo de número deixava o texto digitado; a seta seguinte o gravava; o Ctrl+Z ia para o texto | Propriedades | X: digitar 77, Esc, ↑ | — | Esc devolve o número e sai do campo |
| D11 | Tab depois de gravar perdia o foco | Propriedades | X: digitar 12, Tab | — | Tab vai ao campo seguinte (Shift+Tab, ao anterior) |
| D12 | Cadeado da Árvore travava sem dizer nada (o olho diz) | Árvore | clicar no cadeado de uma linha | — | "O desenho … está travado: aparece, mas o clique passa por ele" |
| D13 | **"Suave" virava "passa do alvo" ao mudar o valor de uma chave**: a alça ficava no valor velho | Linha do tempo | Suave em 0 → arrastar a chave de 0,5 de −54,7 para −64 (Curvas, cena ou campo) | — | as alças andam com o valor, como já andavam com o tempo (rodada 40) |
| D14 | **Duplo clique renomeava a linha de CIMA** (em 1920: clicar "osso_16" renomeou "leg_front") | Árvore | 1920 → rolar a Árvore até o fim → duplo clique num nome | — | a lista se monta inteira antes de focar; o clique não rola |
| D15 | Na Ordem, clicar numa peça com a lista rolada a fazia voltar a 0 e saltar; o duplo clique caía em outra | Ordem | rolar a Ordem → clicar numa peça | — | a rolagem é guardada e devolvida; o clique não rola |
| D16 | Com o foco numa linha da Árvore ou da lista de Animações, o Espaço não tocava (apertava a linha de novo) | Árvore, Animações | clicar num osso → Espaço | — | a tabela de teclas diz: Espaço nessas linhas é Tocar |
| D17 | **Clicar "Duplicar" e depois Espaço duplicava de novo** (o foco ficava no botão) | Animações, Árvore, Ordem, Malha, Propriedades | Animações → Duplicar → Espaço | — | o clique do mouse num botão de barra não leva o foco; Tab continua |
| D18 | Clicar "Suave" na aba Curvas e depois Espaço reaplicava a curva | Curvas (Linha do tempo) | Detalhes → Curvas → Suave → Espaço | — | a mesma regra do D17 |

## Os defeitos — fora da minha parte (só descritos)

| # | O quê | Onde (dono) | Como repetir | Foto |
|:---:|:---|:---|:---|:---|
| F1 | Em 1280×720 a Árvore mostra 2 linhas: a Propriedades toma a coluna | Casca (a altura da coluna) | 1280 → escolher um osso | `02` |
| F2 | `hand_back` entra preso ao osso da PERNA (osso_12) | Importar PSD | PSD com ossos → ver hand_back na Árvore | — |
| F3 | Com a malha escolhida, o rodapé da ferramenta diz "Malha: escolha um desenho com malha" | Cena | Virar malha → a frase do rodapé | — |
| F4 | Janela Nova regra: o tipo escolhido sai cortado ("…sozinhos") | Regras | Malha e regras → Nova regra… | `04` |
| F5 | Janela da regra IK: o aviso vermelho "Escolha o osso…" aparece antes de tentar; "`ik_arm`" com crases à vista | Regras | Nova regra… → cinemática inversa → Continuar | — |
| F6 | Em 1440, a dica do rodapé fica com a frase curta, e não a inteira: some "A animação cresceu de 1,00 para 1,20 s" (Empurrar), "As outras 2 são a última da linha" (Suave). **Causa:** `ui/shell.ts:489`, um `MutationObserver` da rodada 45 copia o texto CURTO visível para o `title`, por cima da frase inteira que o `falarPorUmLugar` (rodada 47) acabou de pôr. Tirar o observador basta | Casca (`shell.ts`) | Animação → Chaves → Empurrar as chaves… com a animação crescendo | — |
| F7 | "sem no…" (nome do documento) e "Pasta boneco · 1…" cortados | Casca, Imagens | abrir a pasta em 1440 | `01` |
| F8 | Depois de trocar a imagem pela grade, o rodapé diz só "Arquivo não salvo." | Imagens (a grade) | Animando → botão direito na mão → mão fechada | — |
| F9 | **Em 1280×720 com Detalhes aberto, a Árvore some inteira** (só a barra de botões) | Casca (a altura da coluna) | 1280 → animação → Detalhes → escolher um osso | — |
| F10 | A lista de Animações tem ~70 px: com 10 animações, vê-se 2 | Casca (a altura da coluna direita) | 1440 → criar 10 animações | — |
| F11 | Modo Criar vértice numa malha automática: todo clique cai a 4–6 px de um vértice e o escolhe, sem dizer nada | Cena (a ferramenta Malha) | Gerar automática no body → Criar vértice → clicar no meio | — |

## Achados pequenos que deixei como estão

| O quê | Por quê ficou |
|:---|:---|
| Colar a POSE espelhada numa animação em laço grava a mesma chave em 0, no meio e no fim | o resultado na tela é o mesmo do colar comum (chave explícita não guarda o começo, lote 68); são 2 chaves a mais, não um movimento errado |
| Na Ordem, o clique na cabeça da pasta dobra a pasta; no fim da lista, o duplo clique para renomear pode cair noutra linha | mudar o que o clique na cabeça faz é decisão de desenho (Photoshop dobra pela seta); fica para o Humberto |
| Seleção por caixa na folha não diz quantas chaves escolheu (o "Selecionar todas" diz) | o número aparece nos losangos acesos |

## Os roteiros

Em `qa-animar-roteiros/`, com um `LEIA-ME.md`. Rodam com o editor na porta 5293.

## Desvios das regras desta noite

| O quê | Por quê |
|:---|:---|
| Uma linha em `ui/key-swaps.ts` (Casca): a palavra do escopo novo `animacoes` | o tipo `Record<KeyScope, string>` exige; sem ela o `tsc` não fecha |
| Arquivo novo `panels/sem-foco.ts` | uma regra só para as seis abas da parte; o `panels/dom.ts` é de todos, não mexi nele |

## Decisões que tomei no lugar do Humberto

| Decisão | Por quê |
|:---|:---|
| Recuo da Árvore: 16 px nos dois primeiros níveis, menos no fundo | árvore rasa não muda; o doc `51` (3.5) aceitou o corte com dica, mas não de 6 letras |
| No Ângulo, número longo manda o "mundo" para a dica | o número que se edita nunca corta; a rodada 43 já fazia isso com a base ao lado |
| Esc no campo: devolve e sai (Photoshop) | o Ctrl+Z seguinte volta a ser do documento |
| A chave do começo também na malha | a regra do lote 68 (Spriter) vale para toda chave; §9.6 diz que `[]` é sem deform |
| Mudar o valor de uma chave leva as alças junto, proporcionalmente | é o que o Spine faz; a curva do arquivo é absoluta (9.3) |
| Clique de mouse numa linha não rola a lista (Árvore e Ordem) | quem clicou está apontando para a linha; seta e escolha de fora rolam |
| Espaço toca com o foco numa linha da Árvore ou das Animações | lote 68: "Espaço toca em toda parte"; Enter continua apertando a linha |
| Botão de barra não guarda o foco do clique do mouse | o Espaço seguinte é Tocar; quem usa Tab continua apertando o botão com Espaço (regra da casca) |

FIM
