# As quatro pesquisas — lista única — 16/09/2026

Escrito pelo PLANEJADOR (`Abrir o PLANEJADOR do Recorte`). Pedido no encargo de 16/09.
**Documento, não plano.** Código congelado. Nenhuma ordem de execução aqui: quem escolhe é o Humberto, com o Diretor.

## As fontes

| Sigla | Arquivo | Quem |
|:---:|:---|:---|
| **P1** | `O QUE AINDA NAO TEMOS 2026-09-16.md` | Pesquisa 1 |
| **P2** | `COMO SE FAZ EFEITO 2026-09-16.md` | Pesquisa 2 |
| **P3** | `O QUE OS USUARIOS PEDEM 2026-09-16.md` | Pesquisa 3 |
| **P4** | `OS ERROS QUE NAO VAMOS REPETIR 2026-09-16.md` | Pesquisa 4 |

**Como juntei:** um assunto = uma linha, mesmo que três pesquisas falem dele. A coluna "Fonte" diz quem falou, com a seção.
O detalhe, a fonte de fora e o endereço no código ficam **no arquivo de origem**. Aqui só o índice.

| Marca do "Custo" | Quer dizer |
|:---|:---|
| **porta** | a função já existe (formato ou editor); falta botão, tecla ou tela |
| **editor** | função nova, mas só no editor; vai ao arquivo como chave comum |
| **formato** | campo novo no `.bone` — **decisão do Humberto** (regra 7) |
| **jogo** | é do jogo, não do editor — perguntar caso a caso (memória *"o editor prepara, o jogo decide"*) |

---

## A. Defeitos que já estão no programa (regra 21)

O programa diz coisa errada ou falha calado. **Não é "falta": é conserto.**

| # | Defeito | Fonte |
|:---:|:---|:---|
| A1 | Rascunho **falha calado** (aba anônima, cota cheia) | P4 §1 |
| A2 | Na recuperação, **"Cancelar" apaga o rascunho** | P4 §1 |
| A3 | Caixa e máscara dizem *"arraste com a ferramenta Malha"*; a Malha não pega os cantos | P1, defeito 1 |
| A4 | Regra **Comando** (driver) nasce com `targets: []` e não faz nada, sem aviso | P1, defeito 2 |
| A5 | Física: **Inércia** mostra `1` quando falta o valor; o formato diz `0,5` | P1, defeito 3 |
| A6 | **Escala de referência** mostra `1` quando falta o valor; o formato diz `100` | P1, defeito 4 |
| A7 | Botão direito na cena faz **duas coisas conforme o pixel**, sem porta no menu | P4 §5 |
| A8 | Quatro comandos com menu, **sem tecla e sem manual** (Colar espelhado, Copiar a pose, Empurrar as chaves, Limpar chaves repetidas) | P4 §5 · QUADRO 15/09 |

---

## B. Erros dos outros que estão **a caminho** do Recorte

| # | Erro | Onde decide | Fonte |
|:---:|:---|:---|:---|
| B1 | **Alt para criar osso** brigou com o Linux no Spriter. E Alt já tem dois usos aqui | Humberto, antes do lote das três diferenças | P4 §4 |
| B2 | **Mexer na base muda todas as animações**, sem um "ajustar" (Spine) | `AS REGRAS DA BASE` | P4 §4 |
| B3 | Gravar sozinho nasce ligado; trocar de pai grava chave sem perguntar | Humberto: a barra basta? | P4 §4 |
| B4 | **Mesma semente** em todas as partículas (Unity) | junto com o emissor (E1) | P2 §4 · P4 §9 |
| B5 | Plugin de motor feito por terceiro morre (Spriter, DragonBones) | quando os motores entrarem | P4 §6 · P3 (Godot) |
| B6 | Trocar ferramenta que funciona tira gesto de quem já sabia (gráfico do Spine 4.0) | todo lote que refaz uma tela | P4 §4 |

**O que já protege, e ninguém afrouxa:** regra 2.4 da spec (minor nunca quebra), `minVersion`, dois runtimes + conformidade, formato aberto na pasta. P4 §3, §6, §7.

---

## C. Pedidos antigos, nunca atendidos pelos outros

Do "OURO" da P3, cruzado com P1 e P4. **Só o que o Recorte ainda não tem por inteiro.**

| # | Pedido | Recorte hoje | Custo | Fonte |
|:---:|:---|:---:|:---:|:---|
| C1 | **Animação dentro de animação** / esqueleto aninhado | em parte | porta (spec 7.11) | P3 OURO 2 · P2 §5 · P1 A |
| C2 | **Trajeto do movimento**, visível e editável | falta | editor | P3 OURO 3 |
| C3 | **Emissor de partículas** | falta | formato | ver E1 |
| C4 | Digitar número no vértice | falta | editor | P3 OURO 9 |
| C5 | Zoom fino na linha do tempo | falta | editor | P3 OURO 17 |
| C6 | Alças fáceis de pegar, tamanho ajustável (hoje 14 px fixo) | falta | editor | P3 OURO 18 |
| C7 | Seleções guardadas | falta | editor | P3 OURO 15 |
| C8 | Pastas na linha do tempo | falta (só na Ordem) | editor | P3 OURO 14 |
| C9 | Trocar as teclas numa tela | falta | editor | P3 OURO 16 |
| C10 | Pressão da caneta no pincel de peso | falta | editor | P3 OURO 19 · P4 §8 |
| C11 | Deslocar chaves sem destruir (secundário) | em parte (Empurrar) | editor | P3 OURO 13 |
| C12 | Vários monitores | em parte (painel solto) | — parado por ele em 13/09 | P3 OURO 5 |
| C13 | Suporte oficial a Godot / motores | falta | jogo | P3 OURO 11 · P4 §6 |
| C14 | Versão Linux | em parte (navegador; não testado) | — | P3 OURO 1 |

**Já temos e o Spine não** (não refazer): trocar de pai, marcadores, solo, régua e guias. P3.

---

## D. O que falta do Spine, por bloco

A P1 listou **470 funções**: igual 56 · diferente 211 · falta 163 · não se aplica 36. Aqui só os blocos. A linha a linha está na P1, Parte 1.

| # | Bloco | O que falta | Custo | Fonte |
|:---:|:---|:---|:---:|:---|
| D1 | **Caminho** (path) | criar, editar, fechar, velocidade constante, inverter | porta (spec 7.8, 6.4) | P1 §10.5 · P2 §5 (rastro) |
| D2 | Caixa e máscara | editar os cantos (ligado ao defeito A3) | porta (7.6, 7.7) | P1 §10.3–10.4 |
| D3 | **Sliders** | a regra que toca animação por um valor (ligado ao A4) | porta (6.6, 8.2) | P1 §13 · P3 (25654) |
| D4 | **Sequência de imagens** | criar a folha animada; chave na região e na malha | porta (7.10, 9.6) | P1 §10 · P2 §6 item 1 |
| D5 | Eventos de **áudio** | caminho, volume, painel, evento visível na cena | porta (8.6) | P1 §14, §15 Audio |
| D6 | Física | Simular, Reiniciar, Global; assar em chaves | porta (6.5) | P1 §12 Physics |
| D7 | **Peles** | pastas, cor, exportar, placeholders em lote, avisos de pele, apagar placeholder | porta + formato (cor, exportar) | P1 §11 · **conversa de agora** |
| D8 | Curvas (Graph) | presets, Favor, Store, alças que acompanham, "última curva", zoom, copiar curva para vários | editor | P1 §15 Graph (14) · P3 (16229) · P4 §4 |
| D9 | Pesos | Soldar, Trocar, copiar/colar pesos, ferramenta Direta, pintar várias malhas | editor | P1 §15 Weights (8) · P1 A.2 |
| D10 | Folha de chaves | Offset, Adjust, Sync, filtros, tocar sem interpolar | editor | P1 §15 Dopesheet (9) |
| D11 | Métricas | contagem de ossos, slots, vértices, área | editor | P1 §15 Metrics (10) |
| D12 | Fantasma e árvore | 5 + 5 faltas pequenas | editor | P1 §15 Ghosting, Tree |
| D13 | Exportar | APNG, PSD, JPEG, vídeo; HTML que toca | editor | P1 §18 · P1 A.2 |
| D14 | Atlas e importar | ninepatch, desempacotar; 6 faltas de importar | editor | P1 §19, §20 |
| D15 | Configurações, tela inicial, linha de comando | 7 faltas pequenas | editor | P1 §16, §21, §22 |

---

## E. Efeito e partícula

P2 é o **porquê e o gesto**; P1 Parte 2 é o **campo a campo**. Não se contradizem.

| # | Ideia | Custo | Fonte |
|:---:|:---|:---:|:---|
| E1 | **Emissor sem estado, com semente** — função pura do tempo, anda para trás. Extensão `BONE_particles` antes do núcleo | formato | P2 §4–5 · P1 Parte 2 · P3 (16807) |
| E2 | Semente: uma por emissor; duplicar dá semente nova; "manter a semente" é gesto próprio; filho = hash(semente, i do pai) | formato | P2 §4 · P4 §9 |
| E3 | **Folha animada entra arrastando** (pasta numerada ou Aseprite → sequência) | porta | P2 §6 item 1 · = D4 |
| E4 | **Flash** e **pulso** como gesto que grava chaves | porta | P2 §6 item 2 |
| E5 | **Efeito como arquivo próprio, encaixado no boneco** | porta | P2 §6 item 3 · = C1 |
| E6 | **Tremor com semente** que vira chaves comuns | editor | P2 §6 item 4 |
| E7 | UV que corre, dissolve, distorção | formato + shader; aviso onde o runtime não tiver | P2 §5–6 |
| E8 | Mais misturas (Live2D: 15 cor + 5 alfa) e **grupo desenhado como imagem só** | formato | P2 §1 · P1 A.2 |
| E9 | Tremor de câmera | jogo (evento avisa) | P2 §2 |
| — | **Fica fora:** colisão, fluido, partícula empurrando partícula, turbulência integrada. Saída: assar em folha (E3) | — | P2 §4 · P1 Parte 2 §3 |
| — | **Aviso:** a `physics` de hoje guarda estado; não serve de modelo para partícula | — | P2 §4 |

---

## F. Ideias de fora (não são pedido, não são falta do Spine)

| # | Ideia | Quem tem | Custo | Fonte |
|:---:|:---|:---|:---:|:---|
| F1 | **Janela de Problemas**, com "consertar" | Spine 4.3 | editor · casa com a regra 21 | P1 A.2, A.4 |
| F2 | Assar regra (IK, transform) em chaves | Spine 4.3 | editor | P1 A.2 |
| F3 | Breakdown que favorece uma chave | Harmony 25 | editor | P1 A.2 |
| F4 | Controle 2D na cena (joystick) | Rive, Live2D 5.2 | editor (parâmetro já existe) | P1 A.1–A.2 |
| F5 | Ordem de desenho animada dentro de pasta | Spine 4.3 | formato | P1 A.2 |
| F6 | Marionete com o mouse, gravada em chaves | Cartoon Animator | editor | P1 A.1 |
| F7 | Meio-termo por IA entre duas poses | Cascadeur (3D) | editor · longe | P1 A.3 |
| F8 | Malha espelhada; edição de laço; escolher a peça de trás | Live2D, Moho | editor | P1 A.2 |
| F9 | Partícula como camada copiada com atraso (gesto de animador) | Moho 14.4 | editor | P2 §1 |
| F10 | Rascunho que anda com o tempo; vídeo de referência atrás do boneco | Spriter 2, pedido Spine | editor | P3 §1, §3 |
| F11 | Modo pixel art; ímã na grade de pixel / meio pixel | Spine 3.7 | editor | P3 §1–2 |
| F12 | Desenhar quadro a quadro dentro do programa | pedido, recusado pelo Spine | editor · grande | P3 §1 |

---

## G. Grade em perspectiva (ideia do Humberto)

| # | O quê | Fonte |
|:---:|:---|:---|
| G1 | Presets: Quadrada · Isométrica 2:1 · Isométrica 30° · Dimétrica · Oblíqua · Livre. Campo em **L × A do losango** | P1 Parte 4 |
| G2 | Grade de tamanho fixo no mundo; réguas continuam retas; ímã nas interseções; **losango do pé** que fica vermelho fora da interseção | P1 Parte 4 |
| G3 | Projeção **paralela** primeiro; ponto de fuga fica fora | P1 Parte 4 |
| — | Pedido também de fora: Aseprite, LDtk recusou | P3 §5 |

---

## H. Tudo o que é decisão do Humberto — numa lista só

Juntei as perguntas das quatro. Repetidas viraram uma.

| # | Pergunta | Recomendação da pesquisa | Fonte |
|:---:|:---|:---|:---|
| H1 | Partículas: extensão `BONE_particles` antes do núcleo? | sim | P1 · P2 |
| H2 | Taxa de emissão animável por integral, ou só liga/desliga? | integral | P1 |
| H3 | Sub-emissor e rastro numa segunda fase? | sim | P1 |
| H4 | Limite de vivas: as mais novas ficam? · mistura só pelo slot? · gravidade padrão zero? · ruído depois? | sim · sim · sim · depois | P1 Parte 2 §7 |
| H5 | As regras da semente (E2) | como na P2 §4 | P2 · P4 |
| H6 | Grupo desenhado como imagem só + mais misturas (Live2D) | — | P1 · P2 |
| H7 | Ordem de desenho animada dentro de pasta (Spine 4.3) | — | P1 |
| H8 | Grade: o tipo vai com o boneco ou fica na máquina? | com o boneco | P1 |
| H9 | Grade isométrica: Shift trava nas diagonais? (muda gesto que existe) | — | P1 |
| H10 | Alt para criar osso, sabendo do Linux e dos dois usos de Alt | — | P4 |
| H11 | Gravar sozinho ligado + trocar de pai sem perguntar: a barra basta? | — | P4 |
| H12 | Base muda todas as animações: precisa de um "ajustar"? | — | P4 |
| H13 | Peles: cor e "não exportar" são campo novo | — | P1 §11 |

---

## O que ficou para trás, dito pelas pesquisas

| Buraco | Quem disse |
|:---|:---|
| Fórum da BrashMonkey fora do ar — o filão de 10 anos de pedidos do Spriter | P3 · P4 |
| Reddit recusou leitura | P3 · P4 |
| 12 linhas "não confirmei" na P3; 4 na P1; várias na P4 — **não viraram verde** | P1 · P3 · P4 |
| Nenhum depoimento direto de estúdio sobre efeito com esqueleto | P2 |

---

## Acréscimo — 16/09/2026: PESQUISA · Alinhamento de imagens com pivô

Conversa direta do Humberto com essa janela. Nenhum código escrito.

| # | Achado | Estado |
|:---:|:---|:---|
| I1 | Pivô automático pelo alinhamento do PSD: o osso é a fonte da verdade, a imagem nova entra pelo pivô do osso (`pivot-model.ts`, lote 56) | **já existe**; o Humberto confirmou que é o que faltava |
| I2 | "Mãos numa pasta, troca pelo clique": clique no campo Imagem, na Ficha rápida ou de novo no desenho (botão direito é atalho) abre as miniaturas da mesma subpasta; outro clique troca pelo pivô (`panels/image-picker*.ts`, lote 60). Só vira chave em Animando com Gravar ligado | **já existe**. Só está no comentário do código: mesma família do A8 |
| — | Para o manual (cap. 1 ou 9), **quando o Humberto mandar voltar ao manual** | anotado, não escrito |

## Acréscimo — 16/09/2026: peles em bloco (mesma janela)

| # | Achado | Estado |
|:---:|:---|:---|
| I3 | Pele como bloco, estilo Dota 2 (capa **ou** asas, com peça e osso próprios): osso e regra marcados "Só com a pele" existem só com aquela pele ligada. É o *skin bones/constraints* do Spine, e resolve o limite do Spriter (todo osso de toda variação na base) | **já existe**, com manual (cap. 3). Detalhe: `PESQUISA peles - Spriter Spine e o que ja temos 2026-09-16.md` |
| — | Proposta, não pedido: a caixa "Só com a pele" está enterrada em Propriedades do osso | anotado |

## Correção — 16/09/2026: o lápis das peles

O I3 acima dizia "já existe". **Só em parte.** Teste ao vivo da PESQUISA · peles em bloco: com o lápis aceso, o osso novo nasce comum, sem marca e sem sinal. Funciona o formato e a caixa marcada à mão. O Humberto fechou o pedido: um lápis só para osso, desenho e regra, com sinal visual. Ver `O PROGRAMA NOVO - tudo junto 2026-09-16.md`, I5 e I6.
