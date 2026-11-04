# A malha e os pesos — pesquisa e conferência — 06/10/2026

Rodada 41, parte 1. Chat: `PESQUISANDO · rodada 41 — o polimento da malha e dos pesos [668a31]`.
**Nenhum código foi mexido.** Ficha: `rodadas/RODADA 41 - polimento da malha e dos pesos 2026-10-06.md`.

| | |
|:---|:---|
| Versão montada | **v31.3** (`programa/`, servidor próprio na porta **5480**) |
| Como | Chrome sem janela na porta **9480**, **1920×1080** (e uma foto 1280×720), mouse e teclado por protocolo. Roteiros de rascunho **fora** da pasta (regra 29). Só leio a tela: o montado não expõe o documento |
| Material | o herói de exemplo: a imagem `cape_lower` (46×42 px), os ossos `cape1` e `cape2`, e uma animação nova, `capa` (1 s) |
| Hora | 12h31 a 12h46 do relógio da máquina |
| Fotos | `backup/fotos-obra/rodada-41/` (60) |
| Pesquisa | um ajudante, com fonte em cada fato (§1). PDFs da casa + manuais na web |

## O quadro

| # | Pergunta | Resposta curta |
|:---:|:---|:---|
| 1 | Dá para dobrar a capa só pela tela? | **Dá**, em ~25 cliques: Virar malha, Gerar, Ligar 2 ossos, Pesos automáticos, uma pincelada, girar o `cape2` (`48`). Com **seis tropeços** (§3) |
| 2 | Os números do Pincel dizem o que são? | **Não.** **Raio 11** e **Força 0,5** sem unidade, sem faixa, **sem dica nenhuma** — a mesma "caixa com (0.5)" do Humberto (`30`) |
| 3 | Dá para ler o peso de um vértice? | **Não.** Clicar num vértice não mostra nada; a lista mostra a **média da malha** (27%/73%) sem dizer que é média (`27`) |
| 4 | Dá para saber qual osso é qual na lista? | **Não.** Os nomes cortam: `cape1` e `cape2` viram **"ca…"** e **"cap…"** (`25`) |
| 5 | Cabe a aba? | **Não.** Em 1920×1080 mostra **365 de 725 px**; o Pincel e a malha ligada moram embaixo. Em 1280×720 mostra **o aviso azul e um título**, nenhum botão (`54`) |

---

## 1. Como os outros fazem

Fontes da casa: `documentos/pesquisa/nova pesquisa/` — **[SEQ]** `SEQUENCIA malha e pesos 2026-09-28.md` · **[REF]** `REFERENCIA arvore malha e linha do tempo 2026-09-28.md` · **[SP-PDF]** `spine/Spine User Guide - manual completo 2026-09-08.pdf` (Mesh attachments, Weights view, Mesh Tools view, Deform keys) · **[DB-PDF]** `dragonbones/DragonBones Pro - manual completo 2026-09-08.pdf`, cap. 30 (Grid) e 31 (Skin Weights) · **[SR-PDF]** `spriter/Spriter Pro - manual oficial 1.4.pdf`. O site do DragonBones segue fora do ar: ele vem só do PDF. Links no fim.

**O Spriter não tem malha.** O manual oficial não tem *mesh*, *deform*, *weight* nem *vertex*. Existe uma deformação **experimental**, "não suportada oficialmente" segundo um usuário no fórum da Steam, que nenhum leitor toca. Malha ficou prometida para o Spriter 2 (não confirmei). **Os modelos desta rodada são o Spine e o DragonBones.**

### 1.1 Criar a malha

| Gesto | Spine | DragonBones | **Nós** |
|:---|:---|:---|:---|
| Imagem vira malha | caixa **Mesh** no anexo: 4 cantos | **Convert to Grid** | **Virar malha** (aba e menu): 4 cantos ✓ (`08`) |
| Modo de edição | **Edit Mesh** | **edit grid** / Open Edit | a ferramenta **Malha (M)** entra sozinha ✓ |
| Gerar | **Trace** (contorno: Detail, Concavity, Refinement, Alpha, Padding) · **Generate** (miolo, repetível) | densidade 1–5: **não confirmei** | **Gerar automática** (contorno + miolo) · **Traçar contorno** · campo **Afastamento** ✓ (`09`, `16`) |
| Voltar | **Reset** (4 cantos). New/Trace/Generate/Reset **apagam pesos e chaves** | **Reset Grid** | Ctrl+Z ✓. Não há "voltar aos 4 cantos" |

### 1.2 Vértice e aresta

| Gesto | Spine | DragonBones | **Nós** |
|:---|:---|:---|:---|
| Ferramentas | **Modify · Create · Delete**, o botão direito troca | **Edit (Q) · Add (W) · Delete (E)** | **Criar vértice** (modo) · **Ctrl+clique** · **Apagar vértice** · **Criar/Apagar aresta** (L/K) ✓ |
| Aresta | arrastar entre vértices em Create; manual **laranja**, automática cinza | arrastar com Add; manual **amarela** | escolher 2 (Shift) e **Criar aresta** ✓. **Manual e automática da mesma cor** |
| Escolher vários | Ctrl + clique, **caixa** | — | Shift + clique ✓ · **caixa não existe** (`15`) |
| Apagar | Delete, **duplo clique** | Delete (E) | Delete ✓ · Apagar vértice ✓ |

### 1.3 Ligar os ossos

| Gesto | Spine | DragonBones | **Nós** |
|:---|:---|:---|:---|
| Porta | **Bind** na vista Weights, clicar os ossos; Bind, Espaço ou Esc fecha | **Bind Bone**, clicar os ossos | **Ligar ossos** (aba e menu), clique na cena **ou na Árvore**; Ligar de novo ou Esc fecha ✓ (`24`) |
| Peso inicial | **na 1ª ligação o peso sai sozinho** | botão direito no vazio calcula; osso somado depois **não** ganha | 1º osso: **peso 1 em tudo**; 2º: **peso 0** ("pinte, ou use Pesos automáticos") |
| Refazer | **Auto** (topologia), **Update** religa na pose atual | **auto weight** | **Pesos automáticos** ✓ (distância) |

### 1.4 Pintar os pesos

| Ponto | Spine | DragonBones | **Nós** |
|:---|:---|:---|:---|
| Pincel | **Add · Remove · Replace** | **não há pincel** | **Somar · Subtrair · Substituir · Suavizar** ✓ (os 4 conferidos) |
| Suavizar | **botão Smooth** (repete) | não achei | modo de pincel **e** botão **Suavizar tudo** ✓ |
| Ajuste exato | modo **Direct**: escolhe vértice e osso, arrasta para cima/baixo, ou campo **Weight** | **sliders** por osso com 1 vértice escolhido; **Alt+clique** = 100% | **não existe** |
| Tamanho e força | **Size** (unidade: **não confirmei**) · **Strength** em **%**, tecla de 10 em 10 · **Feather** em % | — | **Raio** 1–400 (px do esqueleto, só no código) · **Força** 0–1 · sem queda (feather) |
| Teclas do pincel | **`'`** maior · **`;`** menor | — | nenhuma. **`[` e `]` já são da Árvore** (escolhem filhos: `18 ossos e 23 desenhos`) |
| Travar | cadeado no quadrado de cor do osso | não achei | **Travar** por osso ✓ (conferido: o travado não muda) |
| Podar | **Prune**: Bones (máx. por vértice) e Threshold, com prévia | — | **Podar**: limiar **fixo de 2%**, sem campo |
| Normalizar | não existe: a soma é sempre 100% | — | idem ✓ |

### 1.5 Ver o peso

| Ponto | Spine | DragonBones | **Nós** |
|:---|:---|:---|:---|
| Cor por osso | sim, na lista e na cena | sim | sim ✓ (bolinha na lista, fatia na pizza) |
| Pizza | **Pies**, **maior no vértice escolhido** | pizza em cada vértice | pizza em cada vértice ✓, **~6 px**, igual para todos (`28`) |
| Pintura da malha | **Overlay** (a malha pintada nas cores); **Selected** | — | não existe |
| Peso de UM vértice | a lista mostra o peso de cada osso; `*` quando vários diferem | proporções e sliders | **não existe**: a lista mostra a **média da malha** |

### 1.6 Animar

| Spine | DragonBones | **Nós** |
|:---|:---|:---|
| **osso com peso** (o recomendado); **Deform key** ao arrastar vértice no Animate | camada própria na linha do tempo; mover vértice cria chave | osso com peso ✓ · arrastar vértice na animação ✓ (`52`) · **Chavear pesos** ✓ ("Chave em 0,50 s: Pesos de cape_lower") — **peso animado ninguém dos dois tem** |

**O que os dois repetem:** a malha nasce de 4 cantos e tem um modo de edição · três gestos de vértice (mover, somar, apagar) e a aresta manual com **outra cor** · ligar = um botão e clicar os ossos, **o peso inicial sai sozinho** · ver = **cor por osso + pizza**, e **o peso do vértice escolhido em número** · ajuste fino = **escolher vértice + osso e arrastar** (ou slider).

---

## 2. O que o nosso faz hoje

**faz** · **pela metade** · **não faz** · **não tem porta**.

### 2.1 A forma

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Virar malha | faz | *"cape_lower virou malha: 4 vértices. A ferramenta Malha (M) ligou"* | `08` |
| Gerar automática | pela metade | 35 vértices, 57 triângulos ✓ — o rodapé diz só **"Gerar malha."**; a conta mora na **dica do título** Forma | `09` |
| Traçar contorno | pela metade | 11 vértices ✓; rodapé **"Traçar contorno."**, sem número | `16` |
| Afastamento | faz | 0 → 33 vértices, contorno com 12 ✓ | `17` |
| Criar vértice (modo) | faz | *"Clique na malha para criar vértices…"*; clique cria ✓ | `11` |
| Ctrl + clique | faz | cria sem o modo ✓ | — |
| Clique no vazio | faz | *"Nenhum vértice aqui. Clique num quadrado branco e arraste; Ctrl+clique cria"* — **uma vez por malha** | — |
| Criar aresta (botão, L) | pela metade | cria ✓, o botão troca para **Apagar aresta** ✓; rodapé só **"Criar aresta."**; depois de soltar, **a aresta manual tem a cor das outras** | `13` |
| Apagar aresta (K) | faz | ✓ | — |
| Apagar vértice (Delete) | pela metade | apaga ✓ (37 → 36); **o rodapé fica mudo** ("Arquivo não salvo.") | — |
| Arrastar vértice | faz | *"Mover vértice"*; Ctrl+Z volta ✓ | `14` |
| **Caixa de escolha** | **não faz** | arrastar no vazio não escolhe nada, e não diz | `15` |
| Usar a forma de outra malha | pela metade | cria `cape_lower_ligada` ✓, a nota da aba explica ✓ — mas o **rodapé fica mudo**; a aba então diz *"Este anexo é do tipo **linkedmesh**. A malha só vale para desenhos"* (nome interno, e falso: é desenho); depois de **Ctrl+Z**, *"tipo **nenhum**"* — a escolha ficou num anexo que já não existe | `23` |
| — a lista "Malha de origem" | pela metade | traz **a própria malha escolhida** como origem | `18` |
| — o botão | pela metade | fica **abaixo da dobra**: só rolando a aba | `22` |

### 2.2 Os ossos

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Ligar ossos (botão, menu) | faz | modo aceso, recado na aba e no rodapé ✓; **clique na Árvore liga** ✓ | `24` |
| 1º osso | faz | *"cape1 entrou na malha, com **peso 1** em todos os pontos"* — a lista diz **100%**: duas unidades para a mesma coisa | — |
| 2º osso | pela metade | entra com **0%**; o rodapé manda usar Pesos automáticos ✓. O Spine reparte sozinho na 1ª ligação | — |
| **Os nomes na lista** | **não faz** | **"ca…"** e **"cap…"**: `cape1` e `cape2` iguais; a lixeira do 1º corta | `25` |
| Tirar da malha | faz | lixeira por osso, *"Tirar cape1 da malha"* ✓ | — |
| Travar | faz | `cape1` travado: pintar `cape2` com Substituir não mexeu nele (27% → 27%) ✓ | `37`, `38` |

### 2.3 Os pesos e o Pincel

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Pesos automáticos | faz | *"Pesos automáticos em 36 vértices. A ferramenta Pesos (G) ligou: cada vértice mostra a pizza"* ✓ (10% / 90%) | `26` |
| Suavizar tudo | faz | muda a média (27% → 54%) ✓; **dica = o próprio nome** | — |
| Podar | pela metade | *"Pesos abaixo de 2% foram apagados"* ✓ — limiar fixo, sem campo; **dica = o próprio nome** | — |
| Tirar pesos | (código) | não apertei: só a dica foi lida, igual ao nome | — |
| Pincel: Somar | faz | o alto da capa ficou laranja (`cape1`), 10% → 27% ✓ | `32`, `33` |
| Pincel: Subtrair | faz | 27% → 25% ✓ | — |
| Pincel: Substituir | faz | 27% → 55% ✓ | `34` |
| Pincel: Suavizar | faz | 27% → 31% ✓. Cada pincelada, um passo de desfazer ✓ | `36` |
| Raio · Força | **pela metade** | **11** e **0,5**, barra + caixa; **sem unidade, sem faixa, sem dica**. Os 4 botões de modo **também sem dica** (regra 12) | `30` |
| **O círculo do pincel** | **não faz** | **não segue o mouse parado** e **não muda com o Raio** até a próxima pincelada (`35`: Raio 30, círculo ainda de 11). Pelo código: `weights-tool.ts` não tem `onHover`; o centro só anda dentro de `paint` | `31`, `35` |
| **Pincel sem osso escolhido** | **não faz** | arrastar na malha sem osso na lista: **nada acontece, e nada se diz** (regra 21) | — |
| Pincel na animação | pela metade | pinta e vai para a base ✓; a aba avisa no alto ✓ — o **rodapé diz só "Pintar pesos."** | `50` |
| **O peso de um vértice** | **não faz** | clicar num vértice com Pesos na mão não mostra o peso dele | `27` |
| A lista "%" | pela metade | é a **média da malha**, e não diz | `26` |
| As pizzas | pela metade | ~6 px; a do vértice escolhido não cresce | `28` |
| Chavear pesos | faz | *"Chave em 0,50 s: Pesos de cape_lower"* ✓ (pela aba e pelo menu) | `51` |
| Vértice na animação | faz | *"Mover vértice"* ✓; a folha estava fechada: **não vi a linha da chave** | `52` |

### 2.4 As portas do menu (Malha e regras → Malha / Pesos)

| Porta | Estado | Nota |
|:---|:---:|:---|
| 12 itens | faz | cinza sem malha, com o porquê na dica ✓ (`03`, `04`); acesos com a malha ✓ (`53`) |
| As dicas do menu | faz | **melhores que as da aba**: *"Mistura os pesos dos vizinhos: a dobra fica mais macia"* no menu, **"Suavizar tudo"** na aba |
| Criar aresta | **não tem porta** no menu | só o botão da aba e a tecla L |
| Pincel, Raio, Força | **não tem porta** no menu | só na aba |

### 2.5 A cena

| Ponto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| A malha dobra | faz | o alto (laranja) fica, o baixo (roxo) gira ✓ | `44z`, `45z` |
| **Costuras dos triângulos** | **não faz** | com a capa dobrada, **linhas claras** entre os triângulos aparecem na imagem | `49` |
| Os ossos da capa | pela metade | o `cape2` fica **debaixo da malha**, quase invisível | `29` |

**As costuras não são da parte Malha:** quem desenha a imagem na malha é `runtime/src/render/canvas.ts` (o recorte por triângulo), e a ficha proíbe tocar `runtime/`. **Aviso ao Diretor**, para a rodada que puder (Fable). A forma conhecida do conserto é alargar cada triângulo meio pixel antes de recortar.

---

## 3. O caminho do objetivo

**Dobrar uma capa com pesos em dois ossos.** Como usuário, sem ler o código. Fotos `05` a `48`.

| # | Passo | Cliques | Tropeço |
|:---:|:---|:---:|:---|
| 1 | Abrir o herói; rolar a Árvore; clicar `cape_lower` | 2 | a capa mora **no fim da Árvore** |
| 2 | Aba **Malha e pesos** → **Virar malha** | 2 | ✓ a Malha (M) entra na mão |
| 3 | **Gerar automática** | 1 | ✓ 35 vértices (só a dica do título conta) |
| 4 | **Ligar ossos** → `cape1` → `cape2` (na Árvore) → **Ligar ossos** | 4 | **T1** os dois viram "ca…" e "cap…" na lista |
| 5 | **Pesos automáticos** | 1 | ✓ 10% / 90%, pizzas na cena. **T2** o `cape2` entrou com 0%: sem este passo a capa não dobra |
| 6 | Rolar a aba; **Pintar cape1**; uma pincelada no alto da capa | 2 + rolar | **T3** Raio 11 e Força 0,5 sem dizer o quê; o círculo não segue o mouse |
| 7 | Animações → **+** → `capa` | 1 | ✓ |
| 8 | Árvore `cape2` → **Chavear** → tempo `0,5` → Rotação `60` | 4 | **T4** *"cape2 não girou: a regra cape_follow manda nele. Desligue o olho dela na aba Regras"* — o rodapé ensina ✓, mas são **4 cliques** a mais: Regras → olho → Animações → `cape2` |
| 9 | Rotação `60` de novo | 1 | **T5** a capa do herói fica **atrás do corpo**: com +50° ela some inteira (`46_05s`). Com **−40°** ela sai para fora e a dobra aparece (`48`) |
| 10 | tempo `1` → **Chavear** | 2 | ✓ |
| 11 | Olhar | — | **T6** costuras claras entre os triângulos (`49`) |

**Resultado:** a capa dobra em **~25 cliques** (~21 sem o tropeço da regra). **O que trava um usuário de verdade** é o T1 (não sabe qual osso pinta), o T3 (não sabe o que é 0,5 nem onde o pincel vai bater) e o T2 (sem Pesos automáticos a capa não dobra, e só o rodapé diz). O T4 e o T5 são do herói, não do programa: o rodapé do T4 já ensina o caminho.

---

## 4. O padrão (régua do `26`)

| Número | Hoje | Unidade | Faixa | O que falta |
|:---|:---|:---:|:---:|:---|
| Afastamento | 2 | ~ dica ("pixels da imagem") | ✗ (0 a 30 só no campo) | "px" à vista; "de 0 a 30 px · 0 desliga" na dica |
| **Raio** | 11 | ✗ | ✗ (1 a 400) | **"px"** e a dica: *"Tamanho do pincel, em px do esqueleto, de 1 a 400"* |
| **Força** | 0,5 | ✗ | ✗ (0 a 1) | **em %**, de 0 a 100 (o Spine mostra %); dica |
| % na lista do osso | 27% | ✓ | — | dizer **"média"** (ou mostrar o peso do vértice escolhido) |
| Rodapé do 1º osso | "peso 1" | ✗ | — | **"peso 100%"**: a lista fala em % |
| Vértices · triângulos | 35 · 57 | — | — | no **rodapé** do Gerar e do Traçar, não só na dica do título |
| Limiar do Podar | 2% | ✓ | — | só no rodapé; fixo. Fica (o Spine tem campo; aqui ninguém pediu) |
| Peso de um vértice | — | — | — | **não existe** (§5, lote 2) |

**Conta:** 8 números. **1** em dia (o limiar do Podar) · **7** com falta (3 de unidade, 2 de faixa, 2 de leitura).

**Texto:** o menu tem dicas inteiras; **a aba repete o nome** em *Suavizar tudo, Podar, Tirar pesos*, e **não tem dica** nos 4 modos, no Raio e na Força. Defeitos de texto: *"tipo linkedmesh"*, *"tipo nenhum"*, rodapé mudo no Delete e no Usar forma, *"Gerar malha."* sem resultado.

### O que rola, e por quê

A aba Malha e pesos mora no grupo de cima da coluna direita, que divide a altura com o grupo das Animações.

| Tela | Grupo da aba | Conteúdo | À vista |
|:---|:---:|:---:|:---|
| 1920×1080, malha nova, Pincel aberto | 365 px | 725 px | até **"Ossos que influenciam"**; Pesos, Pincel e malha ligada embaixo (`08`) |
| 1280×720, na animação | 164 px | 296 px | o **aviso azul de 4 linhas** e o título **Desenho escolhido**; **nenhum botão** (`54`) |

Rola porque a aba tem **seis seções empilhadas** e três delas crescem com a malha (a lista de ossos, o Pincel aberto, a nota no fim). O que mais come: o **aviso azul** na animação (4 linhas em 1280), as **5 linhas do Afastamento + 5 botões em coluna** na Forma, e o **Pincel aberto** (2 barras com caixa).

---

## 5. O plano dos lotes

Uma versão por lote. Tudo na parte **Malha** (`panels/mesh-panel*.ts`, `panels/mesh-actions.ts`, `mesh/*`, `viewport/tools/mesh-tool.ts` e `weights-tool.ts`). **Nada toca `formato/` nem `runtime/`**: peso e malha já existem no `.bone`. Onde aparece outro arquivo, está dito.

### Lote 1 — o padrão e os nomes

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 1.1 | **Raio em px** e **Força em %** (0 a 100; o arquivo continua guardando 0–1, só a tela converte), cada um com dica de unidade e faixa | Spine: Strength em %. Régua do `26` |
| 1.2 | **Dica em todo botão da aba**, a mesma frase do menu (Suavizar tudo, Podar, Tirar pesos, os 4 modos) | regra 12; o menu já tem as frases |
| 1.3 | **O nome inteiro do osso** na lista (corta o texto do botão "Travar", não o nome; ou o nome em linha própria) | `25` |
| 1.4 | A lista diz **"média"**; o rodapé do 1º osso diz **"100%"** | §4 |
| 1.5 | **Rodapé com o resultado**: Gerar e Traçar dizem os vértices; Delete diz *"Vértice apagado"*; Usar forma diz o que criou | regra 21 |
| 1.6 | *"tipo linkedmesh"* vira **"malha ligada"**, e a malha ligada mostra a aba dela (imagem e origem), não "só vale para desenhos"; depois de desfazer, a aba **larga o anexo que sumiu** | `23` |
| 1.7 | A lista "Malha de origem" **não oferece a própria malha** | `18` |

**Prova:** teste puro de que todo número da aba tem unidade e faixa (falha hoje, regra 26); foto da lista com `cape1` e `cape2` inteiros.

### Lote 2 — o peso de um vértice

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 2.1 | Com a ferramenta **Pesos** e **um vértice escolhido**, a lista mostra **o peso daquele vértice** em cada osso; com vários e diferentes, **"vários"** | Spine (a lista, com `*`), DragonBones (proporções) |
| 2.2 | **Ajuste exato**: um campo de peso (%) por osso, para o vértice escolhido; somar num osso tira dos outros, o travado não mexe | Spine **Direct** / campo Weight; DragonBones **sliders** |
| 2.3 | **Escolher vértices com a caixa** (Malha e Pesos), e o **pincel só nos escolhidos** quando houver escolha | Spine: caixa; *"sem vértice escolhido, o pincel pega todos"* |
| 2.4 | A **pizza do vértice escolhido cresce** | Spine Pies |

**Prova:** teste puro do peso exato (somar 30% no `cape1` de um vértice que tinha 10% dá 40% / 60%); foto do vértice escolhido com os números.

### Lote 3 — o pincel na cena

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 3.1 | **O círculo segue o mouse** (`onHover` na ferramenta Pesos) e **muda na hora** com o Raio | Spine, DragonBones: o pincel se vê antes de pintar |
| 3.2 | **Pincel sem osso escolhido avisa**: *"Escolha o osso que vai pintar: na lista Ossos que influenciam ou na cena"* | regra 21 |
| 3.3 | **O osso que se pinta brilha** na cena (o `cape2` some debaixo da malha hoje) | `29` |
| 3.4 | O rodapé do pincel na animação diz **"foi para a base"** | `50` |
| 3.5 | A aresta **feita à mão tem outra cor** | Spine laranja, DragonBones amarelo |

**Prova:** foto do círculo de raio 30 sob o mouse parado; teste de que o pincel sem osso devolve a frase.

### Lote 4 — a aba cabe, e o 2º osso ganha peso

| # | O que tem de acontecer | A conta |
|:---:|:---|:---|
| 4.1 | Em **1280×720**, a seção **Forma** (ou Ossos, com Pesos na mão) **à vista sem rolar**; em 1920×1080, **Forma + Ossos + Pesos** sem rolar | hoje: 0 botões em 1280 (`54`). Medir no `npm run medir` |
| 4.2 | O **aviso azul** vira **uma linha** (o resto na dica) | é ele que come o 1280 |
| 4.3 | **Afastamento** na mesma linha do rótulo; os 5 botões da Forma em **ícones lado a lado** | memória da casa: botão novo em ícone, nome na dica |
| 4.4 | **Fechar o modo Ligar com 2 ou mais ossos e um deles em 0%** reparte os pesos sozinho (Pesos automáticos), e o rodapé diz | Spine: *"na 1ª ligação o peso sai sozinho"*. **Suposição S1** |
| 4.5 | **Criar aresta** ganha porta no menu Malha | §2.4 |

**Prova do lote 4 (o objetivo da rodada):** no programa montado, com o mouse, **dobrar a capa**: Virar malha → Gerar → Ligar `cape1` e `cape2` (os pesos saem sozinhos) → uma pincelada → girar o `cape2` → a dobra aparece. Foto de cada passo e o número de cliques (hoje: ~25).

### O que fica de fora

| O quê | Por quê |
|:---|:---|
| **Costuras dos triângulos** | moram em `runtime/src/render/canvas.ts`; a ficha proíbe. **Vai ao Diretor**, para uma rodada em Fable |
| A capa do herói atrás do corpo e a regra `cape_follow` | é o **exemplo**, não o programa; o rodapé já ensina a desligar a regra |
| Feather (queda) do pincel, Prune com campo, Weld, Swap | o Spine tem; ninguém pediu, e a aba já não cabe |
| Teclas de raio do pincel | `[` e `]` já são da Árvore; o `'` e o `;` do Spine são decisão de tecla (regra 17), não desta rodada |
| Overlay (malha pintada nas cores) | depois do lote 2: o peso em número resolve a leitura primeiro |
| "Voltar aos 4 cantos" | Ctrl+Z cobre; o Spine apaga pesos e chaves ao fazer isso |

---

## Suposições (regra 23: nada subiu ao Humberto)

| # | Suposição | Quem decide se estiver errada |
|:---:|:---|:---|
| S1 | **Fechar o Ligar reparte os pesos sozinho** quando há 2+ ossos e algum em 0%. O Spine faz na 1ª ligação; aqui, ao fechar o modo, para não refazer a cada clique | Diretor |
| S2 | **Força em %** na tela, 0–1 no arquivo | Diretor |
| S3 | O **peso exato** (2.2) mora na lista Ossos que influenciam, um campo por osso, e só aparece com **um** vértice escolhido | Diretor |
| S4 | As costuras ficam **fora** desta rodada (runtime) | Diretor |

## O que não conferi

| O quê | Por quê |
|:---|:---|
| A linha da chave de forma na folha | a folha mostrava só o Resumo; abrir os Detalhes fica para a parte 2 |
| Tirar pesos | não apertei; li só a dica |
| A pizza de perto em vértice misto | as pizzas têm ~6 px; a foto `28` mostra as cores, não a proporção |
| Tocar a animação inteira | fotografei 0 s, 0,25 s e 0,5 s pelo campo de tempo |
| Unidade do Size do Spine | o manual não diz |

## Um erro meu, pela forma (regra 27)

**Contei como "à vista" um botão que estava cortado pela borda do grupo.** Meu leitor da aba olhava só se o botão tinha tamanho, não se o ponto do clique caía nele. Três cliques caíram em outra coisa: na **divisa** entre os grupos da direita (a aba Malha encolheu para 117 px), no **"espada"** das Animações (a seleção pulou para a entidade), e no campo **Comprimento** em vez de Rotação (o índice do campo mudou quando a seleção mudou). Desfiz os três na hora (a divisa arrastada de volta, Ctrl+Z no Comprimento), e as fotos `20` e `21` são do conserto, não do programa. Daí em diante o roteiro **confere com `elementFromPoint` que o clique cai no alvo, rola até ele, e acha o campo pelo rótulo**. E um quarto, da mesma forma: procurei o botão **"Suavizar"** por pedaço de texto e peguei **"Suavizar tudo"**; o Ctrl+Y que veio depois o refez, e desfiz de novo. **Procurar por texto exato**, nunca por pedaço.

## Links

| Programa | Link |
|:---|:---|
| Spine | https://esotericsoftware.com/spine-meshes · https://esotericsoftware.com/spine-weights · https://esotericsoftware.com/spine-tools · https://esotericsoftware.com/spine-mesh-tools · https://esotericsoftware.com/spine-cheat-sheet · https://eu.esotericsoftware.com/blog/Mesh-weight-workflows |
| Spine, fórum | https://esotericsoftware.com/forum/d/28333 (Strength de 10 em 10) · https://esotericsoftware.com/forum/d/26320 (`'` e `;`) · https://esotericsoftware.com/forum/d/13621 |
| DragonBones | docs.egret fora do ar; o PDF da casa, cap. 30 e 31 |
| Spriter | https://www.brashmonkey.com/spriter_manual/ · https://steamcommunity.com/app/332360/discussions/0/1735462352481787011 |

## Desvios (o executor, na parte 2)

| Lote | Desvio | Por quê |
|:---:|:---|:---|
| 1 | **O item 1.7 saiu.** A lista "Malha de origem" oferecer a própria malha é o uso certo | escolher a própria malha cria uma gêmea ligada dela no mesmo slot (a outra imagem com a mesma forma). Eu tinha lido como defeito na parte 1 |
| 1 | **O item 3.5 saiu do lote 3.** A aresta feita à mão já tem cor própria (marrom, `#8a5a00`, 2 px) | na foto `13` ela estava escolhida, e laranja de escolhida; li errado |
| 1 | A palavra **"Travar"** saiu de cada linha de osso; a linha de cima explica a caixa, e a dica diz qual osso ela trava | era a palavra que espremia o nome até "ca…" |
