# O programa novo — tudo junto — 16/09/2026

Escrito pelo PLANEJADOR (`Abrir o PLANEJADOR do Recorte`). Encargo: `O PROGRAMA NOVO - encargo do planejador 2026-09-16.md`.
**Documento, não código.** Código congelado. Data da máquina: 16/09/2026.

**A suposição do Diretor confere.** "Programa novo" = o editor que começa quando o código descongelar, no modelo de `AS REGRAS DA BASE` (15/09). A leitura reforça: §16 diz *sem compatibilidade com projetos antigos, o formato fica livre*.

## De onde veio

| Sigla | Fonte |
|:---:|:---|
| **BASE** | `AS REGRAS DA BASE 2026-09-14.md` (o modelo ditado por ele, 14 a 16/09) |
| **QUADRO** | `QUADRO ABERTO 2026-09-14.md`, inteiro |
| **PED-…** | os `PEDIDOS … 2026-09-13/14.md` (coluna, ferramentas, malha, fluxo, reutilizar) |
| **PLANO-…** | os `PLANO … 2026-09-13/14.md` (caixa, fluxo, linha do tempo, gesto do P) |
| **SPRITER** | `O QUE O SPRITER TEM E NOS FALTA 2026-09-14.md` |
| **AVAL** | `AVALIACAO DO DIRETOR - linha do tempo…` e `AVALIACAO o modo montar…` |
| **PELES** | `PESQUISA peles…`, `PADRAO sem recorte…`, `DIRETOR - peles em aberto` (16/09) |
| **LISTA** | `AS QUATRO PESQUISAS - lista unica 2026-09-16.md` |
| **MAN n** | `documentos/manual/`, capítulo n |
| **chat X** | conversa lida em 16/09: DIRETOR, MANUAL · 7d, PESQUISA · peles em bloco, CHAVE PARENT, PESQUISA · d4, LINHA DO TEMPO 47 e 97 |

**Regra de conflito:** quando dois lugares discordam, vale o mais novo, e a linha diz o que foi substituído.

---

## 1. Decidido

### 1.1 A régua — vale para todo item

| # | O quê | De onde |
|:---:|:---|:---|
| R1 | É lei a **fluidez** do Spriter, não o jeito dele onde falhou | BASE §10 · chat MANUAL 15/09 |
| R2 | Todo gesto: **1 Spriter** · **2 Spine** dá a ferramenta que falta · **3 DragonBones** só se inovou. Tabela "como os três fazem" antes de propor | chat DIRETOR 16/09 · PED-reutilizar |
| R3 | Onde não entende, **avisa — não improvisa** (regra 21) | QUADRO 15/09 · CLAUDE.md |
| R4 | Botão novo nasce em **ícone, com nome na dica**; rolar só palco e lista que cresce | PED-malha #3 · PED-coluna |
| R5 | Arranjo dos painéis fica **na máquina**, nunca no `.bone`; sem janela do sistema (popup) | PED-coluna · QUADRO |
| R6 | "O editor prepara, o jogo decide" — **caso a caso**, nunca régua | PED-reutilizar, correção 15/09 |

### 1.2 O modelo: bases, corpos, animações

| # | O quê | De onde | Parte | Estado |
|:---:|:---|:---|:---|:---|
| M1 | **A base é uma animação com só o quadro 0.** Não é modo nem tela | BASE §8 · MAN 2 | Formato · Animações · Linha do tempo | a fazer |
| M2 | **Uma pose por base** (homem, lobisomem). Não existe "a pose padrão". *Substitui* "a pose de repouso fica" (PED-fluxo, 14/09) | BASE §8 | Formato e runtime | a fazer |
| M3 | Toda animação herda a base; o que não tem chave vem dela | BASE §1 | Formato · Linha do tempo | existe com 1 pose; várias, a fazer |
| M4 | **O modo Montar sai**; o interruptor Montagem/Animando sai da barra | BASE §8 · QUADRO 14/09 · chat PESQUISA d4 | Casca e menus | a fazer |
| M5 | **O tocador nunca apaga**: sempre há base ou animação aberta; arquivo novo nasce com uma | AVAL modo montar §5 · MAN 2 | Linha do tempo | a fazer |
| M6 | **Editar sempre vale**: Gravar sozinho desligado deixa de recusar | BASE §8 · QUADRO 15/09 (Diretor por delegação) · MAN 4 | Linha do tempo (`anim/`) | a fazer |
| M7 | Mexida que não se anima (osso novo, malha) vai **para a base daquela animação**, e a tela diz onde foi, sem barrar. *Substitui* "vai para o repouso" (PLANO-fluxo lote 2, 14/09) | BASE §8 · MAN 2 | Cena · Malha e pivô | a fazer |
| M8 | **Cada corpo tem as suas animações.** Janela Animação: lista Corpos em cima, Animações embaixo; trocar o corpo troca a lista | BASE §10–11 · MAN 2 · chat MANUAL | Animações | a fazer |
| M9 | Salvar como **base nova**, com nome, de dentro da animação | BASE §1 · MAN 2 | Animações · Arquivo | a fazer |
| M10 | **Colar uma base no meio da animação**: a virada é corte seco (stepped) | BASE §1, §9 · MAN 2 | Formato · Linha do tempo | a fazer |
| M11 | Osso que só existe na base nova **nasce na virada** (não "presença") | BASE §16 | Formato e runtime | a fazer |
| M12 | Depois da virada, cena, Árvore e Propriedades mostram **o corpo daquele instante** | MAN 2 · chat MANUAL | Cena · Árvore · Ficha | a fazer |
| M13 | **Sem compatibilidade** com projetos antigos; o formato fica livre | BASE §16 | Formato e runtime | a fazer |
| M14 | Convenção de nomes de osso é **nossa e publicada** | BASE §16 | Formato (bloco `rig` §4.8 já existe) | a fazer |

### 1.3 O projeto é a caixa

| # | O quê | De onde | Parte | Estado |
|:---:|:---|:---|:---|:---|
| P1 | **O projeto é a caixa**: corpos, entidades, animações. Não há corpo principal | BASE §15 · MAN 2, 5 · chat MANUAL | Arquivo | a fazer (pacote `.bonez` §2.9 existe) |
| P2 | Salvar grava o projeto inteiro; **entregar ao jogo pode levar só um corpo** | BASE §15 · MAN 2 | Arquivo | a fazer |
| P3 | Novo, Abrir e importar PSD falam de **projeto e corpo** | MAN 0, 1, 2 | Arquivo · Casca | a fazer |

### 1.4 Entidades

| # | O quê | De onde | Parte | Estado |
|:---:|:---|:---|:---|:---|
| E1 | Base se anima à mão; **entidade já vem animada** — só se escolhe qual animação toca | BASE §12 · chat MANUAL | Animações · Linha do tempo | a fazer |
| E2 | **Base vira entidade e entidade vira base** (promover/rebaixar); as animações vêm junto | BASE §19 · MAN 5 · chat MANUAL | Animações | a fazer |
| E3 | Entidade é projeto finalizado: abrir mostra as bases e animações dela; fechar devolve à aba | BASE §19 | Animações · Imagens e pasta | a fazer |
| E4 | Salvar entidade editada pergunta **"Novo" ou "Por cima"**, e o aviso diz o que acontece | BASE §19 | Arquivo | a fazer |
| E5 | **A entidade segue a IMAGEM, nunca o osso.** *"Não se guarda a mão direita nas costas"* | BASE §13 · MAN 5 · chat MANUAL | Cena · Formato | a fazer (formato permite, §7.11) |
| E6 | **Sem tela de encaixes.** A grade do botão direito (trocar imagem) passa a listar entidades | BASE §13 · QUADRO 15/09 | Imagens e pasta · Cena | a fazer (a grade existe) |
| E7 | Método: **imagem parada primeiro**, depois troca pelo movimento (hélice); herda osso, pivô, ordem, chaves | chat MANUAL 15/09 · MAN 5 | Imagens e pasta | a fazer |
| E8 | Todo corpo é **adaptador com pino e tomadas**; um só tipo de peça; o anel é tomada entre duas partes | BASE §18 (substitui §12 e §17) | Formato · Cena · Ordem | a fazer |
| E9 | **Pendurar cria uma tomada** na hora, onde a peça foi solta | BASE §20 | Cena · Árvore | a fazer |
| E10 | Entidade é **imagem com relógio**: tem o que a imagem tem, nem mais nem menos | BASE §21 | Árvore · Ordem · Cena | a fazer |
| E11 | Entidade tem **lugar na ordem de desenho**, pode ficar acima de tudo | BASE §12 · MAN 5 | Ordem | a fazer |
| E12 | **Uma animação dirige corpos e entidades** ao mesmo tempo | BASE §12 · MAN 5 | Linha do tempo | a fazer |
| E13 | Sem laço: **faixa** — arrastar = `origin`, esticar = `timeScale` | BASE §10–11 · MAN 5 | Linha do tempo | a fazer (runtime já faz a conta) |
| E14 | Em laço: **roda sozinha, começando onde foi solta** | BASE §11, §14 · MAN 5 | Linha do tempo | a fazer |
| E15 | Painel **Entidades** ao lado do Imagens. *Substitui* "aba Peças" do MAN 5 | BASE §21 (correção dele) | Imagens e pasta | a fazer |
| E16 | Miniatura da entidade **parada**. *Substitui* "miniatura animada" do MAN 5 | BASE §21 (veto dele) | Imagens e pasta | a fazer |

### 1.5 Gestos

| # | O quê | De onde | Parte | Estado |
|:---:|:---|:---|:---|:---|
| G1 | Criar osso com **Alt**, como o Spriter | QUADRO 16/09 · chat DIRETOR | Cena | a fazer |
| G2 | Somar chave à seleção com **Ctrl + clique** (não Shift) | QUADRO 16/09 | Linha do tempo | a fazer |
| G3 | Copiar a ordem de desenho **chave a chave** | QUADRO 16/09 | Ordem · Linha do tempo | a fazer |
| G4 | Em Animando, **trocar de pai grava chave**, sem perguntar; a barra diz o que fez; as chaves seguintes passam ao pai novo | PLANO-fluxo lote 1 + Desvios · chat CHAVE PARENT | Árvore · Cena · Linha do tempo | existe (v12.6, v12.8) |
| G5 | Criar osso, ponto, caixa, pôr imagem, malha e pesos **no meio da animação** | BASE §8 · PED-fluxo · chat MANUAL | Cena · Malha e pivô | existe (v12.6–12.8); **"gerar malha no meio" não confirmei** |
| G6 | Trocar mão, boca, olho **por pasta, no botão direito** — não "troca por chave" | chat PESQUISA peles 16/09 | Imagens e pasta | existe (lote 60, `image-picker`) |

### 1.6 Imagens, pivô e peles

**O desenho das peles, item por item:** `PROJETO DAS PELES 2026-09-16.md`. O lote técnico: `PLANO peles em bloco - rascunho 2026-09-16.md` (parado até Q30, Q31 e o código descongelar).

| # | O quê | De onde | Parte | Estado |
|:---:|:---|:---|:---|:---|
| I1 | **Padrão da arte: sem recorte**, mesma tela, encaixe no mesmo pixel; desenho já recortado alinha à mão uma vez | PELES (`PADRAO sem recorte`) · chat PESQUISA peles | Imagens e pasta · Malha e pivô | existe (é padrão de arte) |
| I2 | Ele gostou do pivô automático do plugin do Spine (*"isso OURO"*), que lê a guia do PSD como 0,0. **O nosso não lê a guia:** `psdPlacement` usa o meio da tela (`ferramentas/src/importar/psd.ts:712`) — conferido pelo Diretor, 16/09. O que vale é I1; o gesto novo é a pergunta Q29 | chat PESQUISA peles · chat DIRETOR 16/09 | Arquivo · Malha e pivô | falta |
| I3 | **Pele em bloco** (estilo Dota 2): osso e regra "Só com a pele", modelo do Spine | PELES §3 · chat PESQUISA peles | Ficha/peles · Formato | **existe no formato e no teste** (`peles.test.ts`); **na tela, só a caixa marcada à mão** — ver I5. O MAN 3 diz "tudo funciona hoje": não vale para o lápis |
| I4 | **Trocar a pasta inteira**: apontar para outra pasta e trocar todo o acervo pelas imagens de mesmo nome. Hoje "Recarregar" só relê a mesma. Os três pedaços existem; falta juntar num botão | PELES §6 (ideia dele, 16/09; sem ordem de lote) | Imagens e pasta | a fazer |
| I5 | **Pedido fechado: um lápis só.** Com o lápis de uma pele aceso, **osso, desenho e regra** nascem já dessa pele, **com sinal visual nos três**. Teste ao vivo em 16/09: o osso nasceu comum, caixa desmarcada, sem sinal — *"o lápis não faz nada"* | PELES §4.1, §7 (Humberto, 16/09) | Ficha/peles · Cena · Árvore | a fazer |
| I7 | **A pilha de peles, como o Character Map do Spriter**: o olho sai; duas colunas **Feitas** e **Ativas**; arrastar para Ativas liga, para fora desliga, dentro muda a ordem. Editar a pele **na mesma janela** (o Spriter abre outra) | `PROJETO DAS PELES` §4.1 (Humberto, 17/09) | Ficha/peles | a fazer (a lista em ordem já existe: `visible` em `skins-model.ts`) |
| I6 | **Aplicar a pele e modificar**: com a pele ligada, puxar osso e pôr imagem só dela; tirar a pele e o personagem volta à base. Passo que o Spriter não tem, somado ao character map (I4) | PELES §7 (Humberto, 16/09) | Ficha/peles · Cena | a fazer (depende de I5) |

### 1.7 O que já existe e o programa novo mantém

Agrupado. Detalhe e versão nos planos de 13–14/09 e no MAN 0–9.

| Tema | O quê | De onde |
|:---|:---|:---|
| Ferramentas | Transformar primeiro e único (mover, girar, escalar, inclinar, escolher); bolinha de girar a 3/4, mín. 30 px; caixa gira com o objeto; três alças no osso; mover vários só pelo topo; osso novo na raiz sem escolhido; cadeia; filho vira pai; `P` mostra e desafilha filhos | PED-ferramentas · PLANO-caixa · PLANO-P |
| Malha | Contorno afastado (0–30 px); modo de criar vértice; nomes únicos; painel em ícone; aba liga a Malha; malha ligada; pesos com pincel | PED-malha · PLANO-caixa · MAN 6 |
| Painéis | Recolher, arrastar aba entre grupos, fechar e reabrir, voltar ao padrão, descolar e flutuar | PED-coluna (v12.2–12.5) |
| Linha do tempo | Copiar o membro; colar espelhado; copiar a pose do escolhido; Empurrar chaves; Limpar repetidas; esticar, espelhar, fechar ciclo; marcas, laço, casca de cebola, curvas, eventos, Prévia em camadas | PLANO-linha do tempo · PROPOSTAS §2 · MAN 4 |
| Ordem | Ordem de desenho vira chave; pastas na Ordem | PED-reutilizar · MAN 1 |
| Regras e arquivo | As cinco regras; exportar glTF, imagem, WebM, por pele; importar Spriter/Spine/DragonBones/PSD; linha de comando e validador | MAN 7, 8, 9 |

### 1.8 Casca

| # | O quê | De onde | Parte | Estado |
|:---:|:---|:---|:---|:---|
| C1 | **Colar na quina**: arrastar a aba à borda cria grupo, com sombra antes de soltar | PED-coluna fase 3 · QUADRO | Casca e menus | a fazer (espera o teste dele) |
| C2 | A aba comprida **rola** em tela pequena (Malha e pesos) | QUADRO 15/09 (Diretor por delegação) · MAN 6 | Malha e pivô | não confirmei se terminou |

---

## 2. Esperando o Humberto

| # | Pergunta | De onde |
|:---:|:---|:---|
| Q1 | Gravar sozinho: vira **Key all / Key selected** do Spriter? Onde fica o botão, qual tecla? | QUADRO 14/09 #3 · MAN 4 |
| Q2 | O Chavear com **semáforo** verde/vermelho sai? | QUADRO 14/09 #4 |
| Q3 | Se Ctrl passa a somar, **onde vai o clonar** (hoje Ctrl + arrastar)? Ver o Spriter antes | QUADRO 16/09 |
| Q4 | **Alt** briga com o Linux e já tem dois usos aqui (inclinar, laço na régua). Mantém? | LISTA B1 · chat DIRETOR |
| Q5 | Sem o modo Montar, que ferramentas de construção **somem ao animar**? (*"não pensei direito"*) · o que sobra do `Ctrl+Tab` | PED-fluxo #3 · MAN 0 × MAN 2 |
| Q6 | Na virada, a entidade não acha **slot de mesmo nome** no corpo novo: só avisa, ou recusa? | BASE §13 · MAN 5 |
| Q7 | O **socket** (point+socket, PED-reutilizar 15/09) morre com "segue a imagem"? E os exemplos `mecha.bone`, `capacete.bone`? | MAN 5 · PED-reutilizar × BASE §13 |
| Q8 | Onde se escolhe **qual animação da entidade** toca, quando é laço? Onde se vê o `baseAnimation`? | MAN 5 |
| Q9 | A troca de imagem pela pasta, **em animação**, grava chave de desenho? (hoje só com Gravar ligado) | chat PESQUISA peles × `image-picker` |
| Q10 | Desenho **troca de osso por chave**, como o Spriter? (campo novo) | PLANO-fluxo Desvios · chat LEVANTAMENTOS |
| Q11 | **Pesos animáveis**? (campo novo) | PED-reutilizar |
| Q12 | Abrir a **chave de sequência** (boca, fogo, fumaça)? | AVAL item 16 · LISTA D4 |
| Q13 | **Juntar outro `.bone`** no atual? | AVAL item 12 · SPRITER #5 |
| Q14 | **Animação para outro personagem** (`rig`): exportar à parte e aplicar — quando? | PED-reutilizar lote C · MAN 5 |
| Q15 | **Partículas e biblioteca** (Mixamo): antes, junto ou depois das bases? | BASE §15 #4 · IDEIAS NOVAS |
| Q16 | As 7 perguntas das **partículas** (extensão antes do núcleo, taxa por integral, semente…) | LISTA H1–H5 |
| Q17 | **Peles**: por onde começar — grade de 2 colunas · salvar conjunto · juntar peles · pastas · aviso de imagem faltando? | `DIRETOR - peles em aberto` · chat DIRETOR |
| Q18 | **Pele por pasta e por PSD**: entra como pele nova? (a guia do PSD é a Q29) | chat DIRETOR 16/09 |
| Q19 | Pele com **cor** e pele que **não vai ao jogo** (campos novos). ("Só com a pele" à vista: respondido por I5) | LISTA H13 · PELES §5 |
| Q20 | **Empurrar chaves arrastando**: interruptor na folha, como no Spine? | PLANO-linha do tempo 4 e 6 · chats LINHA DO TEMPO |
| Q21 | **Recorte de exportação** por animação? (campo novo) | SPRITER faltas #6 |
| Q22 | Os "diferente" do Spriter: `Z`/`Shift+Z`, `B`, duplo clique abre pivô, `1`/`2`, Ctrl+D em todas as chaves — igualar? | SPRITER pedaços 1 e 3 |
| Q23 | Variáveis e tags **pela tela**? | SPRITER "o que não entrou" |
| Q24 | IK com **mais de dois ossos** (CCD ou FABRIK)? `BONE_pendulum` no núcleo? — travam a 1.0 | MAN 7 |
| Q25 | Grade em perspectiva: vai com o boneco ou na máquina? Shift trava nas diagonais? | LISTA H8–H9 |
| Q26 | Grupo desenhado como imagem só + mais misturas · ordem animada dentro de pasta (campos novos) | LISTA H6–H7 |
| Q27 | Base muda todas as animações: precisa de um **"ajustar"**, como o Spine? | LISTA B2, H12 |
| Q28 | **Física vira chaves** (bake) no editor? | MAN 7 |
| Q30 | A **pele é de um corpo** ou do **projeto inteiro**? ("tirar a pele volta à base", no modelo de vários corpos) | `PLANO peles em bloco - rascunho`, revisão #4 |
| Q31 | Os lotes de peles B e C (lápis, aplicar e modificar) entram **antes** do modelo novo, sabendo que a criação de osso muda no degrau 5, ou **no degrau 8**? O lote A (trocar a pasta) não depende | `PLANO peles em bloco - rascunho`, revisão #5 |
| Q32 | **Quem cobre na pilha?** O formato §4.4 já diz *"a última adicionada tem prioridade"*. Na coluna Ativas, a última é a **de cima** ou a **de baixo**? Spriter: **não confirmado** no editor. **Indício: o de baixo cobre** — o runtime SpriterDotNet aplica em ordem e o último ganha, e os prints mostram o mapa novo entrando embaixo (fontes no `PROJETO DAS PELES` §4.1, 17/09) | `PROJETO DAS PELES` §4.1 · spec §4.4 |
| Q33 | A `default` fica **sempre no fundo, sem poder sair** de Ativas? (o formato §2 já diz: se existe, está sempre ativa, por baixo) | `PROJETO DAS PELES` §4.1 · spec §2 |
| Q34 | Sem o olho, **o lápis continua**, ou editar = clicar numa pele de Ativas? | `PROJETO DAS PELES` §4.1 |
| Q29 | Proposta do Diretor: **PSD pela guia; sem guia, pela tela; tamanho diferente avisa**. Aceita? | chat DIRETOR 16/09 |

**Contradições no manual, para ele saber** (não são perguntas novas): `Ctrl+↑/↓` tem dois sentidos (MAN 0/4 × MAN 1) · "as onze ferramentas" sem o Transformar (MAN 0) · ferramentas de estrutura "somem em Animando" (MAN 0) × "já funciona no meio da animação" (MAN 2). Resolvem-se com Q5 e M4.

---

## 3. Proposta, não aprovada

| # | O quê | De onde |
|:---:|:---|:---|
| X1 | Ordem de trabalho: **spec → conformidade → runtime → editor** | BASE §7 (Diretor) |
| X2 | Construir e Animar como **arranjos** no menu Janela | AVAL modo montar §4 |
| X3 | Com a ferramenta Malha, desenho em repouso e resto apagado atrás | AVAL modo montar §3 |
| X4 | Toda função nasce **com tecla ou menu e com palavra no manual** | QUADRO 15/09 (lição do Diretor) · LISTA A8 |
| X5 | Partícula: função pura do tempo, semente por emissor, anexo `particle`, depois das bases | IDEIAS NOVAS · LISTA E1–E2 |
| X6 | Auto-rig pelo nome das peças; andar/correr/parado/pular prontos | IDEIAS NOVAS §2 |
| X7 | Inclinar com Alt no meio do lado (já feito, sem aval dele) | PLANO-caixa Desvio |
| X8 | Chavear não grava o pai · osso e desenho juntos: só o osso ganha chave · ciclo checado na árvore do instante · linha "Pai" na folha | PLANO-fluxo Desvios · LEVANTAMENTO §2, §5 |
| X9 | Linha do tempo: somar/escalar valores · repetir trecho N vezes · aparece/some daqui · copiar curva · cadeado na folha · mover a origem (M+arrastar) · alças da cebola na régua · copiar pivô | PROPOSTAS #3, 5, 7, 13–15, 17–18 |
| X10 | Peles em arquivo · juntar peles ativas · clonar em outra escala · paleta de cor · som e lip sync | SPRITER faltas #2–4, 7–9 |
| X11 | Tudo da lista única que não está acima: pedidos antigos (C), faltas do Spine (D), efeitos (E3–E9), ideias de fora (F), grade (G) | LISTA |
| X12 | Aviso "N ossos só desta pele" no painel Peles (pode sobrar depois de I5) | PELES §5 |

---

## 4. Ordem sugerida para programar

Do bolo ao glacê, pelas partes de `documentos/PARTES.md`. **Sugestão do Planejador, não decisão.** Cada degrau depende do anterior.

| Degrau | Parte | O que entra | Espera |
|:---:|:---|:---|:---|
| 1 | **Formato e runtime** | M1–M3, M10–M11, M13–M14, P1, E5, E8, E13–E14 escritos na spec, com casos de conformidade e runtime | Q6, Q7, Q10, Q11 (campos novos, regra 7) |
| 2 | **Animações** | M8, M9, E2, E3 — a janela com Corpos e Animações; promover e rebaixar | degrau 1 |
| 3 | **Linha do tempo** | M5, M6, E1, E12–E14, G2, G3 — tocador sempre aceso, editar sempre vale, faixa da entidade | Q1, Q2, Q3 |
| 4 | **Casca e menus** | M4 (o modo Montar sai) — só com 1–3 prontos, e ele vendo | Q5 |
| 5 | **Cena · Árvore · Malha e pivô** | M7, M12, G1, E9, E10 — mexida vai para a base, corpo do instante, Alt, tomada ao pendurar | Q4 |
| 6 | **Ordem · Imagens e pasta** | E6, E7, E11, E15, E16 — painel Entidades, grade lista entidades | degrau 1 |
| 7 | **Arquivo, exportar, importar** | P2, P3, E4 — projeto-caixa na tela, salvar Novo/Por cima, entregar um corpo | Q14 |
| 8 | **Ficha, peles** · importar PSD | **I5 e I6 primeiro** (pedido fechado); I4; o que ele escolher em Q17–Q19; o PSD pela guia (I2) | Q17–Q19, Q29 |
| 9 | Casca | C1 (quina) | teste dele |
| 10 | **Glacê** | partículas, biblioteca, efeitos, grade, pedidos antigos, **manual** | Q15, Q16, Q25; manual só quando ele pedir |

**Provas de cada degrau:** suíte, `tsc`, conformidade, roteiro, medição — um fecho de cada vez (regras 9 e 15).

---

## Estado dos chats (lido em 16/09)

| Chat | Terminou? | Algo só na conversa? |
|:---|:---|:---|
| MANUAL · 7d | sim, parado | não |
| LINHA DO TEMPO · 97 | sim (v13.2) | não |
| LINHA DO TEMPO · 47 | sim (v12.9) | não |
| CHAVE PARENT · c1 | sim (v12.8) | não |
| PESQUISA · d4 | sim | não |
| PESQUISA · peles em bloco | **não**: o Humberto segue conversando nela (duas ideias novas, I4 e I5) | não; está em PELES §6 |
| LEVANTAMENTOS · 4b | sim | **talvez**: 3 respostas do Planejador (linha "Pai", seleção mista, shear) — estão em X8, mas não confirmei se há mais |
| 4 · A malha · 1 · A caixa | vazias (0 mensagens) | não |
| DIRETOR | ativo | não: a dúvida do PSD foi conferida e está em I2 e Q29 |
