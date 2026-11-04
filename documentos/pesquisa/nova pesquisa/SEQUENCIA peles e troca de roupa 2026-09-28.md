# SEQUÊNCIA — peles e troca de roupa — 28/09/2026

Escrito pelo chat M (`USO · peles e troca de roupa`, ref `8f01e9`). Não escreve código.
Páginas lidas em 28/09/2026, 23h58–00h05 (relógio da máquina). O que a fonte não diz, escrevo "não achei".

**A tarefa:** fazer uma pele · pôr imagens nela · vestir e despir · pele de uma pasta inteira · trocar a imagem de um desenho (botão direito) · trocar a imagem no meio da animação · exportar e importar uma pele.

---

## 1ª ENTREGA — A REFERÊNCIA

### 1.1 Spriter — a fila (o que o Spriter chama de *Character Map*)

Fontes (manual oficial da BrashMonkey, versão online):

| # | Página | Link |
|:---:|:---|:---|
| 20 | What are Character Maps | https://www.brashmonkey.com/spriter_manual/what%20are%20character%20maps.htm |
| 21 | Create a Character Map and Assign Effects | https://www.brashmonkey.com/spriter_manual/create%20a%20character%20map%20and%20assign%20effects.htm |
| 22 | Activating and Stacking Character Maps | https://www.brashmonkey.com/spriter_manual/activating%20and%20stacking%20character%20maps.htm |
| 23 | Saving Character Map Sets as Character Files | https://www.brashmonkey.com/spriter_manual/saving%20character%20map%20sets%20as%20character%20files.htm |
| 10 | Swapping the Image of a Sprite | https://www.brashmonkey.com/spriter_manual/swapping%20the%20image%20of%20a%20sprite.htm |
| — | Índice do manual | https://www.brashmonkey.com/spriter_manual/ |

**Antes de começar (pág. 20):** organizar as imagens em **pastas por grupo de troca** (ex.: uma pasta de cabeças) e dar às alternativas **o mesmo nome e o mesmo tamanho** (pastas `red` e `blue` com arquivos de nomes iguais). A página diz que é recomendação, não obrigação. Serve para o Spriter **automatizar** a ligação de imagem a imagem.

**A fila de passos:**

| Passo | O que fazer no Spriter | Onde fica | Fonte |
|:---:|:---|:---|:---:|
| S1 | Abrir a paleta de mapas | botão **CharMaps**, canto **superior direito** da paleta Animações | pág. 21 |
| S2 | Criar um mapa | botão **Create New Character Map**, canto **inferior direito** da paleta de mapas. Abre a paleta **Edit Character Map** | pág. 21 |
| S3 | Achar a imagem a trocar | coluna **esquerda** da paleta Edit Character Map: clicar (botão esquerdo) na imagem | pág. 21 |
| S4 | Dizer por qual trocar | coluna **direita**: achar a substituta e **clicar com o botão direito** nela. O par aparece na coluna esquerda | pág. 21 |
| S5 | Fazer uma **pasta inteira** de uma vez | esquerda: clicar na pasta · direita: botão direito na pasta substituta | pág. 21 |
| S6 | Desfazer um par por engano | selecionar a imagem na esquerda, botão **set ignored** (canto superior esquerdo da paleta) | pág. 21 |
| S7 | Esconder em vez de trocar | selecionar a imagem, botão **Set Hidden** (canto superior esquerdo) | pág. 21 |
| S8 | Várias de uma vez | **Ctrl + clique** seleciona várias; os botões valem para todas | pág. 21 |
| S9 | Fechar o mapa | **OK** na paleta Edit Character Map | pág. 22 |
| S10 | O mapa novo aparece na coluna **direita (available)** da paleta *Character Maps* | — | pág. 22 |
| S11 | **Vestir** | arrastar o nome do mapa da coluna direita (available) para a **esquerda (active)**. Vale na hora na tela, nas animações que usam aquelas imagens | pág. 22 |
| S12 | **Despir** | devolver o mapa da coluna *active* para *available* | pág. 23 (passo 1) |
| S13 | **Empilhar** | vários mapas ativos ao mesmo tempo (calça azul + óculos + boné) | pág. 22 |
| S14 | Guardar o conjunto | ícone do **disquete azul**, canto inferior esquerdo da paleta Character Maps. Escolhe pasta e nome | pág. 23 |
| S15 | Trazer o conjunto de volta | ícone da **pasta amarela** ("load file"), mesmo canto. Precisa abrir antes o projeto `.scml`/`.scon` | pág. 23 |
| S16 | **Trocar a imagem de UM sprite, no meio da animação** | (a) ir ao ponto do tempo · (b) clicar no sprite na tela · (c) **botão direito na imagem** da paleta de arquivos. Dali em diante o sprite usa a nova imagem | pág. 10 |

**Regras que a fonte dá:**

- A imagem nova entra **no mesmo lugar**, casando os **pivôs** (pág. 10). Para não dar salto: mesmo tamanho em pixels, pivô padrão no mesmo ponto, com margem transparente se preciso.
- Os efeitos do mapa ativo **persistem ao exportar** PNG (pág. 22).
- Os arquivos de personagem valem entre projetos, se os mapas tiverem os **mesmos nomes** (pág. 23).

**Não achei nas páginas lidas:** os botões "Merge Active to New" e "Bake Active to Entity", que a pesquisa antiga (16/09) cita. Nenhuma das páginas 20–23 os menciona. Conto como **não confirmado**; não uso na fila.
Também não achei: "mapa de pasta inteira" além do passo S5 acima, e exportar mapa **sem** o projeto (só o arquivo de personagem, S14).

### 1.2 Spine — a fila (*Skins* e *skin placeholders*)

Fonte (guia do usuário oficial, Esoteric Software):

| Página | Link |
|:---|:---|
| Skins | https://en.esotericsoftware.com/spine-skins |
| Slots (trocar o anexo visível, chavear) | https://en.esotericsoftware.com/spine-slots |
| Region attachments (caminho da imagem) | https://en.esotericsoftware.com/spine-regions |
| Guia inteiro | https://en.esotericsoftware.com/spine-user-guide |

A ideia do Spine: a animação mostra e esconde **marcadores de lugar** (*skin placeholders*); **qual imagem aparece** vem da **skin visível**. Assim a mesma animação serve a qualquer roupa. O marcador tem o nome **da peça** (`head`), não da roupa (`red head`).

| Passo | O que fazer no Spine | Onde fica | Fonte |
|:---:|:---|:---|:---:|
| P1 | Criar um marcador de lugar | escolher osso, slot ou anexo na árvore → **New… → Skin Placeholder** | Skins |
| P2 | Criar uma skin | escolher o nó **Skins** na árvore → **New… → Skin** | Skins |
| P3 | Dizer qual skin se edita | o **ponto** ao lado do nome da skin na árvore = skin **ativa** (só uma por vez). Clicar no ponto para ativar | Skins |
| P4 | Pôr a imagem na skin | com a skin ativa, **arrastar o anexo** até o marcador de lugar (ou usar "Set Parent"). Arrastar sobre um anexo que já existe **copia a transformação** dele | Skins |
| P5 | Fazer a skin a partir de um anexo que já existe | escolher o anexo → New… → Skin Placeholder. Abre uma janela: **Duplicate attachments for each skin**, com opções *Linked meshes*, *Inherit deform*, *Duplicate keys*, *Rename attachments* (põe o nome da skin na frente: `red/head`) | Skins |
| P6 | Ossos só de uma skin | osso → **Add to skin** nas propriedades da árvore; ou arrastar o osso sobre a skin; ou escolher a skin → Add to skin → clicar nos ossos. Sair do modo: espaço, Esc, ou clicar de novo | Skins |
| P7 | Restrições só de uma skin | igual aos ossos | Skins |
| P8 | **Vestir e despir** (várias skins à vista) | a **skins view**: "permite que muitas skins fiquem visíveis ao mesmo tempo, **fixando-as** (pin)". Só uma é ativa | Skins |
| P9 | Misturar peças | (editor) skins view com várias fixadas · (jogo) criar uma skin e somar várias nela | Skins |
| P10 | Duplicar uma skin | botão direito/menu na skin → duplicar; mostra a mesma janela do P5 | Skins |
| P11 | Organizar | **pastas** de skins (`hair/long/brown` no jogo) · caixa **Export** (desmarcada = a skin não sai no JSON/binário) · **Color** (só ajuda a distinguir) | Skins |
| P12 | Conferir antes de exportar | avisos: osso filho fora das skins do pai · anexo com pesos fora da skin · restrição fora da skin | Skins |
| P13 | **Trocar a imagem de um anexo** | propriedade **Image path** do anexo de região. Em branco: usa o nome do anexo. Preenchido: usa o caminho | Regions |
| P14 | **Trocar a imagem no meio da animação** | o anexo visível do slot **pode ser chaveado** na animação (chave de anexo). Esconder = chave de anexo, não alfa zero | Slots |

**Não achei:**

- Botão de menu exato para a chave de anexo (a página Slots diz que existe, não diz onde clicar).
- Exportar ou importar **uma skin sozinha** como arquivo próprio. A página Skins não fala disso; só do caixa **Export** (sai ou não sai no export do esqueleto).
- "Skin scenes" e um botão de olho para skin: a página **não** os cita.
- Fazer uma skin **a partir de uma pasta inteira**: não achei no Spine (é só do Spriter, S5).

### 1.3 Onde os dois se parecem, e onde não

| Fila | Spriter | Spine |
|:---|:---|:---|
| Criar | `CharMaps` → `Create New Character Map` | árvore → `Skins` → `New… → Skin` |
| Dizer o que muda | imagem por imagem, ou pasta por pasta (direita, botão direito) | arrastar o anexo até o marcador de lugar |
| Vestir | arrastar de *available* para *active* | ponto ao lado da skin (ativa) + skins view (fixar) |
| Despir | arrastar de volta | tirar o ponto / desafixar |
| Empilhar | vários ativos | skins view, várias fixadas |
| Trocar 1 imagem no meio da animação | selecionar sprite + botão direito na imagem | chave de anexo no slot |
| Guardar fora | arquivo de personagem (disquete) | não achei |

**Modelo da casa** (`CLAUDE.md`, memória "Spriter primeiro, Spine depois"): a fila é a do **Spriter**; as ferramentas do Spine se encaixam nela.
Referência antiga conferida: `documentos/planos/PESQUISA peles - Spriter Spine e o que ja temos 2026-09-16.md`. Confere com a fonte em tudo, **menos** nos botões "Merge Active to New" e "Bake Active to Entity", que não achei (ver acima).

---

## 2ª ENTREGA — A SEQUÊNCIA NO NOSSO

**Onde:** o programa **montado** (`programa/`, `node programa/servidor.mjs`), porta **5313** — o Planejador mandou usar o montado, porque o modo de desenvolvimento recarrega a página quando outro chat grava. Versão: o `programa/LEIA-ME.txt` diz **v22.7, montada em 22/09/2026**; o Planejador disse v22.8. **Ajuda → Sobre o Recorte diz "Versão 0.1.0"** (defeito M9). Fotos: `backup/fotos-rodada-final/uso-peles/`, todas da porta 5313, exceto `00`, `01` (porta 5213, modo de desenvolvimento, mesmo herói).
**Janela:** 1440×900 emulada. Sem olhar o código. **Uma exceção honesta:** para saber o NOME de cada ícone sem passar o mouse em todos, li a lista de botões da tela (a mesma que a dica de cada ícone mostra). Onde o ícone sozinho não diz o que faz, escrevo "ícone mudo".

As quatro perguntas: **1** achei a ferramenta sem procurar? · **2** o que criei apareceu? · **3** o programa disse o que aconteceu? · **4** ficou óbvio o passo seguinte?

### 2.1 A fila, passo a passo

| Passo | O gesto | 1 achei | 2 apareceu | 3 avisou | 4 próximo | Foto |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| N0 | Arquivo → Abrir o herói (exemplo) | **sim**: 9º item de um menu longo; a tela de boas-vindas também traz o botão | sim: o boneco entra | sim: rodapé *"Abriu a base."* | **não**: nada diz "agora vá às Peles" | `00`, `01` |
| N1 | Achar onde ficam as peles | **sim**: aba **Peles** no grupo de baixo à direita | sim | — | — | `04` |
| N1b | Ler a aba na largura de fábrica | — | **não**: os nomes saem cortados (`d 23`, `armad… 3`); só lê depois de arrastar a coluna da direita para a esquerda | — | — | `04`, `05` |
| N2 | Fazer uma pele nova: ícone **+** (Nova pele) | **em parte**: são sete ícones sem texto; o **+** se adivinha, os outros não | **sim**: entra em FEITAS e em ATIVAS, com o lápis aceso | **sim**: *"Pele 'pele' criada. Os anexos novos nascem nela."* | **não**: não diz como pôr imagem nela | `06` |
| N2b | Dar o nome: duplo clique no nome | **não se acha**: nada na tela diz que dá para renomear; só o duplo clique (adivinhado) | sim: abre *"Renomear a pele"* | sim: *"Pele 'pele' agora é 'camisa_azul'."* | — | `07` |
| N2c | (o que veio junto) Depois de renomear | — | — | **errado**: aparece "1 aviso" e a janela **Problemas do arquivo** diz *a pele "pele" está ligada e este corpo não a tem* — o nome **antigo**. Fica até a próxima troca | — | `08` |
| N3 | Pôr uma imagem **diferente** na pele, do jeito do Spriter: escolher o desenho `body` na Árvore, botão direito na imagem `armadura/body`, **Usar no desenho escolhido** | **sim** (só aparece o item com desenho escolhido; sem ele o item é cinza, sem dizer por quê) | **sim** na cena | **quase**: *"body/body agora mostra 'armadura/body'"* — **não diz que foi na BASE, e não na pele** | **não** | `10`–`12` |
| N3b | Conferir onde a troca caiu | — | **a pele `camisa_azul` continua com 0 desenhos**; a troca foi para `default` (23). Desligar `camisa_azul` **não** desfaz a troca | **não avisou** que a pele com o lápis aceso foi ignorada | **a sequência quebra aqui** | `13`, `14` |
| N4 | Pôr uma imagem na pele do outro jeito: lápis da pele aceso + **arrastar a imagem da aba Imagens para a cena** | **não se acha** (nada diz que arrastar cria um desenho na pele) | **sim**: aparece o desenho, no canto (200; −137), **longe do boneco** | **não**: o rodapé diz *"Não sei o que fazer com JCeMsCm…AAEIFTkSuQmCC. Solte um .bone…"* (um pedaço de texto de imagem), **junto** com o desenho criado; o **contador da pele sobe de 0 para 1** | **não**: não diz que agora é preciso posicionar nem prender a um osso | `15` |
| N5 | **Despir**: **×** ao lado da pele, na coluna ATIVAS | **sim** (o × se entende) | **sim**: o desenho some da cena | **não**: rodapé mudo. Ligar diz *"ligada"* (N5c); desligar não diz *"desligada"* | sim | `14`, `16` |
| N5b | Voltar a pele com um **clique** no nome, em FEITAS | tentei o clique: **só seleciona**, não veste | — | — | — | `18` |
| N5c | **Vestir**: arrastar o nome de FEITAS para o vão *"embaixo de todas"* em ATIVAS | **em parte**: só se sabe que é arrastar por vir do Spriter; a tela não diz | sim | **sim**: *'Pele "camisa_azul" ligada.'* | sim | `19` |
| N5d | Arrastar de FEITAS para **cima da linha `default`** (ativas) | — | **nada acontece** | **não avisou** | — | `17` |

| N6 | **Pele de uma pasta inteira**: ícone da pasta (3º da fila de ícones) → janela *"Fazer a pele de uma pasta"* → **Fazer a pele** | **em parte**: ícone mudo; achei pela ordem e porque o nome do botão diz "pasta" na dica | **sim**: entra `armadura2` no topo de ATIVAS, lápis aceso | **sim, e bem**: *'Pele "armadura2": A pasta "armadura" cobre 1 desenho; 18 continuam os de baixo.'* | **não**: o nome da pele saiu sozinho (o da pasta + 2); a janela não avisa que o nome será esse | `20`, `21` |
| N7 | **Botão direito no desenho, na cena** → grade de imagens → clicar numa imagem | **sim**: botão direito no boneco abre a grade (é o "botão direito" do Spriter) | **sim**: o desenho muda na cena | **sim**: *'shin_front/shin agora mostra "cape_lower"'* — **mas não diz que foi na BASE**; a pele com o lápis aceso (`armadura2`) continua com 1 desenho | **a sequência quebra aqui** (igual ao N3) | `22`, `23` |
| N7b | Item **"Em todas as peles"** do mesmo menu | **não se entende** o que ele faz | **nada** | **nada**: clicar não mostra efeito nem mensagem | — | `24` |
| N8 | **Trocar a imagem no meio da animação**: abrir `attack` (duplo clique na lista) · ir a 0,27 s na régua · botão direito no desenho · escolher a imagem | **sim**: o mesmo botão direito serve. Abrir a animação pela lista: **sim** | **em parte**: a foto a 0,33 s mostra a perna mudada. **Não provei o "antes"**: a 0,17 s a foto não se distingue, e o chat K mediu (K15) que a troca vale também ANTES de 0,27 s. **A linha do tempo não mostra fileira nem marca de "imagem"** (`31`) e a ficha *Imagem* de Propriedades continua a dizer `cape_lower` depois da chave (a medir) | **sim, e bem**: *'shin_front mostra "arm" a partir de 0,27 s, só nesta animação.'* | **sim** | `25`–`31` |
| N9 | **Exportar a pele**: ícone do disquete (5º) | **não**: ícone mudo; e **só exporta a pele com o LÁPIS aceso**, não a que se clica | com o lápis certo: grava `armadura.bone` (1 474 bytes) | **sim**: *'Pele "armadura" gravada com só os desenhos; ela exige 6 nomes de quem a usar.'* Sem o lápis: *"Escolha a pele a exportar: acenda o lápis nela, na aba Peles."* | **não**: não diz "agora vá ao outro projeto e Importe" | `32b`, `33` — **feito sem janela, com o seletor trocado** |
| N9b | Exportar **pelo menu**: Arquivo → Exportar → **Por pele…** | **sim**, mas fica no fim de um menu longo, dentro de um submenu | **sim**: janela com a tabela *"O que vai sair"* (Ossos 18/18, Peles 5/5…) e a caixa do pacote `.bonez` | **sim, e muito**: diz o que sai e o tamanho | **em parte**: a janela é mais alta que a tela; o botão **Exportar** só aparece depois de rolar | `36`, `37` |
| N10 | **Importar a pele**: ícone da pasta aberta (4º) com o arquivo que acabou de ser exportado, **com a pele original já apagada** | **não**: ícone mudo, quase igual ao da pasta | **NÃO**: a pele **não volta** (`armadura` não reaparece em FEITAS) | **NÃO**: o programa abre o seletor de arquivo (o mesmo do *Abrir*: `.bone/.json/.boneb/.bonez` e imagens, várias) e **fica mudo**: sem mensagem, sem aviso | **a sequência quebra aqui**: exportar e importar não fecham a volta | `34b` — **feito sem janela, com o seletor trocado** (duas rodadas) |
| N11 | **Apagar a pele** (lixeira, com o lápis aceso) | **sim** | sim | **em parte**: pergunta *"Ela veste 3 slot(s)… Ctrl+Z devolve tudo"*, e depois *'Pele "armadura" apagada.'*. **Não diz** que `armadura_capa` **depende** dela | — | `34a`, `34a2` |
| N11b | O que sobra depois de apagar | — | **"2 avisos — ver"** aparece no rodapé | **em inglês**: *pele "armadura_capa" › includes › 0: skin "armadura" does not exist; ignored* | — | `34a3` |

### 2.2 As quatro perguntas, por tarefa

| Tarefa | 1 achei? | 2 apareceu? | 3 avisou? | 4 próximo óbvio? |
|:---|:---:|:---:|:---:|:---:|
| Fazer uma pele | em parte | sim | sim | **não** |
| Pôr imagens nela | **não** | sim, mas longe do boneco | **errado** | **não** |
| Vestir e despir | em parte | sim | vestir sim, **despir não** | sim |
| Pele de uma pasta | em parte | sim | **sim** | não |
| Trocar a imagem (botão direito) | sim | sim | em parte | **não** — cai na base |
| Trocar no meio da animação | sim | em parte | **sim** | sim |
| Exportar a pele | **não** | sim | sim | não |
| Importar a pele | **não** | **NÃO** | **NÃO** | **NÃO** |

### 2.3 O que o Humberto sentiria (a panela e o arroz)

| No arroz | Aqui |
|:---|:---|
| A panela (a ferramenta) | Sete ícones sem texto na aba Peles: nova, duplicar, pasta, importar, exportar, promover, apagar. Só o **+** e a lixeira se adivinham |
| O arroz (o material) | A pele nasce **vazia** (0 desenhos). Para pôr algo nela: **arrastar** imagem para a cena, com o lápis aceso. Nada diz isso |
| A ordem | **Trocar a imagem de um desenho** (o gesto do Spriter) **não entra na pele**: cai na base. Quem faz "trocar a camisa" muda o boneco inteiro sem querer |
| A água ferveu | A maioria dos gestos **diz** o que fez (`ligada`, `criada`, `a partir de 0,27 s`). Faltam: **desligada**, **importada**, e o **nome antigo** que fica no aviso |

**A maior quebra da fila:** no Spriter, a troca de imagem é um *mapa* que se veste e se despe. Aqui a mesma troca (botão direito) é **permanente na base**; para ter "camisa azul que veste e despe" é preciso usar a pele de pasta (N6) ou arrastar um desenho novo (N4).




---

## 3ª PARTE — CONFERÊNCIA NA v23.2 — 29/09/2026, 10h (relógio da máquina)

**Onde:** `programa/` montado, **v23.2** (`programa/LEIA-ME.txt`), porta 5313, **um** servidor. Feito em **Chrome sem janela**, fechado ao fim de cada leva (11 levas), seletores de arquivo trocados (`showSaveFilePicker`, `showOpenFilePicker`, `showDirectoryPicker`), `prompt`/`confirm` respondidos pelo script. **Nenhuma janela do Windows.** Antes de cada leva medi a memória livre; abri só com mais de 450 MB.
**Sem olhar o código para achar botão.** Duas exceções honestas: (1) o script acha os botões pelo nome que a tela dá (o mesmo da dica); (2) o arrasto entre painéis é feito por eventos de arrasto (o mouse de verdade não dispara arrasto no Chrome sem janela), com o mesmo tipo de dado que o programa põe — como o roteiro dos 30 minutos faz.
**Fotos:** `backup/fotos-rodada-final/uso-peles/v23.2/`. A `45_vestir-sobre-default.png` é uma **tentativa falha do script** (alvo não achado) e **não vale como prova**; a prova do M8 é a `60`.

### 3.1 Defeito por defeito

| # | Era | Veredito na v23.2 | O que se vê | Foto |
|:---:|:---|:---:|:---|:---|
| M1 | renomear deixava aviso com o nome velho | **CONSERTADO** | *Pele "pele" agora é "camisa_azul".* e o rodapé segue em **"Nenhum aviso"** | `22` |
| M2 | trocar a imagem com o lápis aceso gravava na base | **CONSERTADO** nos três caminhos | **grade** (botão direito na imagem → *Usar no desenho escolhido*): *'leg_back/thigh_back agora mostra "armadura/body", na pele "camisa_azul".'* · **cena** (botão direito no boneco): *'body/body agora mostra "arm", na pele "camisa_azul".'* · **Esqueleto → Peles → Trocar imagem nas peles…**: *'armadura/body → arm no slot body2, em 1 pele.'* Em todos, a contagem da pele subiu (1→2→3) e a de `default` ficou em 23 | `33`, `36`, `41` |
| M3 | não havia como saber que se põe imagem arrastando | **CONSERTADO** | Ao criar: *'Pele "pele" criada, com o lápis nela. Agora arraste uma imagem da aba Imagens para a cena: ela nasce nesta pele.'* E dentro do painel Peles, uma faixa: *'A pele "camisa_azul" está vazia. Arraste uma imagem…'*. Ao soltar: *'armadura/body entrou solta, como body2. Para prender num osso: com ela escolhida, crie o osso — ele pega o desenho.'* | `20`, `22`, `31` |
| M4 | rodapé com texto de imagem ao arrastar | **CONSERTADO** | o arrasto (com o tipo de dado do programa) responde só com a frase do M3. Ressalva: arrasto por evento, não por mouse | `31` |
| M5 | nomes cortados no painel Peles | **CONSERTADO** | `default 23`, `armadura 3`, `armadura_capa 1` legíveis na largura de fábrica | `05` |
| M6 | renomear só por duplo clique, sem dica | **CONSERTADO** | ao passar o mouse no nome: *"pele — duplo clique renomeia"*. Só aparece **passando o mouse**: a tela parada continua sem dizer | `22` (o painel) |
| M7 | despir (×) deixava o rodapé mudo | **NÃO CONSERTADO** | clicar × tira a pele da pilha; o rodapé fica em *"Arquivo não salvo."* (ligar diz *"ligada"*, desligar não diz nada) | `43` |
| M8 | soltar a pele sobre a linha `default` não fazia nada | **CONSERTADO** | soltar `armadura` sobre a linha `default`: *'Pele "armadura" ligada.'* e ela entra **em cima** (`armadura 3 · default 23`) | `60` |
| M9 | "Versão 0.1.0" e nome do arquivo com lixo | **PELA METADE** | o título agora é **`heroi.bone`** (consertado, `02`); **Ajuda → Sobre o Recorte continua a dizer "Versão 0.1.0"**, com o programa em v23.2 | `02`, `06` |
| M10 | ícones sem texto; exportar só com lápis | **PELA METADE** | a aba Peles segue com **seis ícones sem texto** (`22`); **exportar e importar pele agora estão no menu Arquivo, com texto** (*Pele, para outro boneco…* / *Pele, de outro boneco…*) e também na Paleta de comandos (com a frase *"Era Esqueleto → Exportar pele…"*). Exportar sem o lápis: *"Escolha a pele a exportar: acenda o lápis nela, na aba Peles."* | `11`, `12`, `70`, `83` |
| M11 | Importar pele abria o seletor e ficava mudo; a pele não voltava | **PELA METADE** | agora **diz o resultado**: *"Importar pele parou: /bones: expected an array."* + "1 aviso". **Mas parou: o arquivo que a própria "Exportar pele" grava (1 474 bytes) é recusado pela "Importar pele"**. A volta continua sem fechar, e a mensagem é técnica, em inglês | `71`, `74` |
| M12 | apagar pele não dizia da dependência; aviso em inglês | **PELA METADE** | a pergunta é a mesma (*"Ela veste 3 slot(s)…"*, sem citar `armadura_capa`). Depois de apagar: **1 aviso** (eram 2) e a janela ganhou o botão *"Ir para pele "armadura_capa" › includes › 0"*. A frase segue em inglês: *skin "armadura" does not exist; ignored* | `72`, `73` |
| M13 | item "Em todas as peles" sem explicação | **PELA METADE** | ao passar o mouse: *"Ligado: a imagem que você clicar troca em toda pele que usa a mesma neste slot (o mesmo que Shift + clique)"*. Clicar nele continua sem dizer nada no rodapé (*"Arquivo salvo."*) | `51`, `52` |
| M14 | a troca no meio da animação não deixava fileira na linha do tempo | **CONSERTADO** | rodapé: *'head mostra "arm" a partir de 0,00 s, só nesta animação, na pele "armadura".'* e a linha do tempo tem a fileira **Slot head › Desenho**, com um **losango laranja** no tempo. (Ver K15: o "antes" do tempo não foi provado aqui) | `61` |
| M15 | botão direito no vazio dizia "Não há ferramenta anterior" | **NÃO CONSERTADO** | continua: *"Não há ferramenta anterior para voltar."* | `53` |
| M16 | Imagens e Peles não cabem juntas | **NÃO CONSERTADO** (e a faixa nova do M3 piora) | no padrão, a aba Imagens mostra **só o cabeçalho** e nenhuma imagem (`22`); com o divisor descido as imagens aparecem e **a lista de Peles sai da tela** (`30`). A faixa *"A pele … está vazia"* ocupa três linhas e espreme FEITAS/ATIVAS | `22`, `30` |

**Contagem:** CONSERTADO **8** (M1, M2, M3, M4, M5, M6, M8, M14) · PELA METADE **5** (M9, M10, M11, M12, M13) · NÃO CONSERTADO **3** (M7, M15, M16). Total 16.

### 3.2 A pergunta que mais importa: achei SEM procurar?

Os menus mudaram (decisão P33). O que fiz, sem olhar folha nem código:

| O que eu quis fazer | Onde achei | Sem procurar? |
|:---|:---|:---:|
| Fazer uma pele nova | ícone **+** da aba Peles (igual antes). **Não está** em Esqueleto → Peles, nem na Paleta de comandos. Está também em Árvore → **Novo ▾ → Pele** (com texto) | **sim**, pelo Novo ▾; o **+** só se adivinha |
| Fazer a pele de uma pasta inteira | só o ícone da pasta na aba Peles. **Não está** em nenhum menu nem na Paleta (só o *"Desfazer Fazer a pele de uma pasta"* depois de feita) | **não**: sem texto e sem menu |
| Trocar a imagem de um desenho | botão direito na cena · botão direito na imagem · Esqueleto → **Peles ▸ → Trocar imagem nas peles…** (banner azul: *"Clique na imagem nova… Esc cancela"*, com botão ×) | **sim**: é o melhor passo de toda a fila. Ressalva: com um **osso** escolhido o item fica cinza **sem dizer por quê** |
| Exportar a pele | Arquivo → Exportar → **Pele, para outro boneco…** | **sim** para quem procura em Arquivo; o *"para outro boneco"* faz quem só quer **guardar** a pele hesitar |
| Importar a pele | Arquivo → Importar → **Pele, de outro boneco…** | **sim**; mas o arquivo exportado **não entra** (M11) |
| Promover a pele a base | Esqueleto → Peles ▸ → **Promover pele a base…** | **sim** |
| Renomear, duplicar, apagar | só ícones e duplo clique; **Esqueleto → Peles ▸ tem só 2 itens** (Trocar imagem, Promover) | **não** por menu |
| Ver o que uma pele traz | a lista **FEITAS/ATIVAS** com a contagem de desenhos | **sim** |

**Resumo em uma linha para o Humberto:** *a panela ficou melhor (trocar a imagem, exportar e importar têm texto, e o programa diz onde a troca caiu); o arroz ainda pede um passo escondido (o + e a pasta), e a volta exportar → importar não fecha.*

### 3.3 Defeitos NOVOS da v23.2

Entraram em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, seção "Do chat M — v23.2": **M17** (Importar recusa o arquivo que a Exportar gera), **M18** (a porta "Esqueleto → Peles ▸" não tem Nova pele nem Pele de uma pasta), **M19** (a faixa "pele vazia" espreme a lista), **M20** (o item "Trocar imagem nas peles…" fica cinza sem dizer por quê com um osso escolhido).
