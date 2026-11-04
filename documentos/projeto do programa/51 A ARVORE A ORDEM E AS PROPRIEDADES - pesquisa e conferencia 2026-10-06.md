# A Árvore, a Ordem e as Propriedades — pesquisa e conferência — 06/10/2026

Rodada 43, parte 1. Chat: `PESQUISANDO · rodada 43 — Árvore, Ordem e Propriedades [8f8f2d]`.
**Nenhum código foi mexido.** Ficha: `rodadas/RODADA 43 - polimento da arvore ordem e propriedades 2026-10-06.md`.

| | |
|:---|:---|
| Versão montada | **v32.0** (`programa/` de 13h38), copiada para o rascunho e servida na porta **5500**: a cópia não muda se outra rodada remontar |
| Como | Chrome sem janela na porta **9500**, **1920×1080** (e uma foto 1280×720), mouse, teclado e arrasto nativo por protocolo. Roteiros **fora** da pasta (regra 29). Só leio a tela |
| Material | o herói de exemplo (17 ossos, 23 desenhos) e, para o objetivo, o herói com braço e perna duplicados: **22 ossos e 32 desenhos** |
| Hora | 17h01 a 17h20 do relógio da máquina |
| Fotos | `backup/fotos-obra/rodada-43/` (43) |
| Pesquisa | um ajudante, com fonte em cada fato (§1). PDFs da casa + manuais na web |

## O quadro

| # | Pergunta | Resposta curta |
|:---:|:---|:---|
| 1 | Dá para achar, renomear, trocar o pai, ordenar e ler a peça só pela tela? | **Dá**, em ~7 cliques, 3 digitações e 16 toques de Ctrl+↓ (§3). Com **cinco tropeços** |
| 2 | A Árvore escolhe várias peças? | **Não.** Ctrl e Shift não somam nada. As setas não andam. O foco some a cada escolha (`12`) |
| 3 | Os números da ficha dizem o que são? | **Não.** De 23 números, **2** em dia. A ficha mostra X, Y, Escala e Ângulo **duas vezes**. Nenhum número se arrasta. "90+15" e "abc" são recusados **em silêncio** (`22`) |
| 4 | Um nome para cada coisa? | **Não.** A mesma peça é **desenho** na Árvore, **"Anexo: face"** na ficha pela Árvore e **"Slot: head"** pela Ordem (`23`, `24`) |
| 5 | Cabe? | Em 1920×1080 a ficha mostra **187 de 1.056 px**. Em **1280×720** a Árvore mostra **uma linha e meia** (62 px) (`28`) |

---

## 1. Como os outros fazem

Fontes da casa: `documentos/pesquisa/nova pesquisa/` — **[SP]** `spine/Spine User Guide - manual completo 2026-09-08.pdf` · **[SR]** `spriter/Spriter Pro - manual oficial 1.4.pdf` · **[DB]** `dragonbones/DragonBones Pro - manual completo 2026-09-08.pdf` · **[PS]** Adobe helpx e o PDF oficial de atalhos do Photoshop. "p" é a página do PDF. Links no fim.

**Correção de uma fonte da casa.** `ONDE FICA CADA BOTAO 2026-09-29.md` dá "busca" na Árvore do DragonBones (linhas 274 e 504). O PDF (p.16) e o print `interface_sceneTreePanel_p1.png` não têm busca.

### 1.1 A Árvore

| Gesto | Spine | Spriter | DragonBones | Photoshop | **Nós** |
|:---|:---|:---|:---|:---|:---|
| Busca | caixa no alto; **destaca** o que casa, e só **esconde** com o filtro ligado; `Enter`/`F3` próximo, `Esc` limpa; aceita `*` e regex (SP p.232) | não confirmei | **não tem** (DB p.16) | filtro por **nome**, tipo, cor; **esconde** o resto; interruptor (PS) | lupa e **Ctrl+F**; **esconde** o resto e guarda os pais ✓ (`02`) |
| Renomear | **F2** ou duplo clique (SP p.225) | duplo clique em alguns itens (SR p.19) | duplo clique, botão, campo Nome (DB p.16) | **duplo clique**, Enter (PS) | **F2**, duplo clique, menu, botão direito ✓ (`04`) |
| Trocar o pai | **Set Parent** ou **P** e clicar; **arrastar** na Tree (SP p.21, p.226) | segurar **B** e clicar (SR p.8) | **arrastar**; pai no filho é **recusado** (DB p.16) | arrastar para o grupo (PS) | **arrastar** ✓ e **P segurado** ✓ (`08b`, `13`) |
| Dobrar | clique à esquerda; **botão direito dobra o ramo** (SP p.222) | não confirmei | triângulo | triângulo; **Alt+clique dobra o ramo** (PS) | triângulo ✓; **sem** gesto para o ramo (`07`) |
| Vários | **Ctrl** soma, **Shift** faixa (SP p.33) | Ctrl, retângulo; **Z** filhos, **Shift+Z** pais (SR p.37) | com vários, a ficha fica vazia (DB p.17) | **Ctrl** soma, **Shift** faixa (PS) | **não tem**; `]` filhos e `[` pais ✓ |
| Olho | ponto por item; botão direito vale para o ramo (SP p.224) | por tipo (SR p.9) | por tipo (DB p.15) | olho; **Alt+clique** deixa só um (PS) | olho e cadeado por linha ✓ |
| Apagar | pergunta, desligável (SP p.309) | `Delete`; `Shift+Delete` de todos os quadros (SR p.13) | **pergunta**; osso leva filhos, slots e imagens (DB p.5) | **pergunta**; lixeira com Alt pula (PS) | **não pergunta**; Ctrl+Z volta ✓ |

### 1.2 A Ordem de desenho

| Ponto | Spine | Spriter | DragonBones | Photoshop | **Nós** |
|:---|:---|:---|:---|:---|:---|
| Onde mora | nó **Draw Order** dentro da Tree; o de cima cobre (SP p.23) | aba **Z-order** ao lado da Hierarchy (SR p.7) | painel **Level**, só na montagem (DB p.19) | a própria lista de camadas | aba **Ordem** ao lado da Árvore ✓ |
| Arrastar | sim | sim | sim | sim, até a linha | sim ✓ (`20`) |
| Teclas | **`+`/`-`**, Shift pula 5 (SP p.24) | **Ctrl+↑/↓** uma casa, **Ctrl+←/→** fundo e topo (SR p.7) | **`[` `]`** (DB p.42) | **Ctrl+[ ]**, com Shift topo e fundo (PS p.27) | **Ctrl+↑/↓**, **Ctrl+←/→** ✓ — o modelo do Spriter |
| Anima | chave no nó (SP p.54) | **por quadro-chave** (SR p.7) | não no manual | — | (fora desta rodada: é da linha do tempo) |
| Pasta | — | — | — | grupo; a camada entra **no topo** do grupo fechado | **pasta** ✓; a peça que passa **parte a pasta** em duas (`19`) |

### 1.3 A ficha

| Ponto | Spine | Spriter | DragonBones | Photoshop | **Nós** |
|:---|:---|:---|:---|:---|:---|
| Onde ficam X, Y, giro, escala | na **barra de ferramentas**, uma vez (SP p.34) | **Object Properties**, uma vez | painel **Transform**, uma vez (DB p.17) | barra do Free Transform | **duas vezes**: "Ficha rápida" e "Posição e forma" (`22`) |
| Unidade | giro em graus (SP p.35); px não confirmei | **°** junto do ângulo; **alfa em %** | sem unidade, 2 casas | **%** na escala, **°** no giro | sem unidade à vista; o **°** só na dica do Ângulo |
| Arrastar o número | **arrastar sobre o número**, Shift mais fino; roda do mouse (SP p.34) | setinhas | setinhas | **arrastar o rótulo** (scrubby); Shift 10× (PS) | **não tem**; só ↑/↓ (+1) e Shift (+10) ✓ |
| Conta no campo | **`+123`, `*2`, `/2`** (SP p.34) | não confirmei | não confirmei | não confirmei | **recusa** "90+15" **sem dizer** |
| Local / Pai / Mundo | **muda o número mostrado** (SP p.34-36) | não confirmei | X, Y relativos ao pai | — | a barra tem Local/Pai/Mundo, mas **a ficha não muda**: só o local |
| Casas | 2 (131.79) | 5 no X, 3 no ângulo | 2 | — | até 2 (−66,18) ✓ |

**O que os quatro repetem:** renomear no **duplo clique** · trocar o pai **arrastando** na árvore · o triângulo dobra um, e **um gesto a mais dobra o ramo** · **Ctrl soma, Shift faz faixa** · a ordem é **uma lista vertical arrastável, a de cima cobre**, com **um par de teclas** e a variante topo/fundo · a ficha mostra X, Y, giro e escala **uma vez**, com o giro em graus · apagar **pergunta**, com jeito de pular.

---

## 2. O que o nosso faz hoje

**faz** · **pela metade** · **não faz** · **não tem porta**.

### 2.1 A Árvore

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Busca (lupa, Ctrl+F) | faz | filtra e guarda os pais; *"Nada com "zzz"."* ✓; Esc fecha ✓ | `02`, `03` |
| — o que casou | pela metade | o nome achado **não se destaca** dos pais | `02` |
| — fechar a busca | pela metade | o botão é uma **lixeira** ("Fechar a busca") | `02` |
| — renomear com a busca aberta | **não faz** | a peça renomeada **some**: *"Nada com "hand_2"."* | `31` |
| Renomear (duplo clique, F2, menu) | faz | campo com o nome escolhido ✓; Esc cancela ✓; Ctrl+Z volta ✓ | `04`, `05` |
| — rodapé | pela metade | só **"Renomear."**, sem o nome velho e o novo | — |
| — nome repetido | **não faz** | `forearm` → "arm" vira **`arm2` sem dizer** (regra 21) | `06` |
| — nome vazio | **não faz** | volta ao nome velho **sem dizer** | — |
| Dobrar (triângulo) | faz | dica *"Dobrar arm"* ✓ | — |
| Dobrar o ramo inteiro | **não faz** | Alt+clique dobra só um | `07` |
| Teclado (↑ ↓ ← →) | **não faz** | não anda nem dobra; **o foco some** depois de escolher | — |
| Arrastar para trocar o pai | faz | a linha-alvo acende ✓; *"1 item virou filho de torso"* ✓; **o desenho fica no mesmo pixel** (diferença zero) ✓ | `08b`, `09a`, `09b` |
| — rodapé | pela metade | **"1 item"**, não o nome | — |
| — depois de soltar | pela metade | **nada fica escolhido** | `33` |
| — pai sobre o próprio filho | pela metade | **troca os dois**: *"head e torso trocaram de lugar"*. O DragonBones recusa | `11` |
| — desenho sobre desenho do mesmo osso | **não faz** | nada acontece, **nada se diz** | `10a` |
| P segurado | faz | *"Segure P: o que está pintado já é filho de arm"* → *"hand_target virou filho de arm"* ✓ | `13` |
| `]` e `[` | faz | *"9 ossos e 17 desenho(s): o escolhido e os filhos"* ✓ | — |
| **Ctrl e Shift** | **não faz** | o 2º clique **troca** a escolha. No código, `selectionForRow` não lê tecla | `12` |
| Olho e cadeado | faz | dica *"Esconder hips. Escondido não aparece e não pega clique"* ✓ | — |
| Nomes longos | pela metade | **"hand_…"**, **"sw… blade"**, **"w… sword"** na coluna de 258 px | `02`, `10a` |
| Delete (desenho) | pela metade | apaga ✓; o rodapé diz só **"Apagar."** (recado da rodada 41) | `14` |
| Delete (osso com filhos) | pela metade | **2 ossos e 6 desenhos** somem **sem perguntar**; o rodapé fala das *"36 chaves guardadas"*, **não do que sumiu**, e corta em "Arqui…" | `15` |
| — a lixeira da barra | pela metade | dica = **"Apagar"** | — |
| Botão direito (osso) | pela metade | só **Substituir nomes** e **Renomear**. Sem Apagar, Duplicar, Osso filho | `16` |
| Botão direito (desenho) | faz | Copiar/Colar posição, Trocar a imagem em todas as skins, Substituir nomes, Renomear ✓ | `17` |

### 2.2 A Ordem

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| A lista | faz | miniatura, nome, imagem; dica em toda linha ✓; **6 botões com dica inteira** ✓ | `18` |
| — o tamanho | pela metade | **~52 px por linha**: só **8 peças** à vista de 32 | `18` |
| — onde é a frente | pela metade | nada na lista diz que **o de cima cobre**; só a dica dos botões | `18` |
| Ctrl+↓ / Ctrl+↑ | faz | **anda a cada toque** ✓; o foco fica ✓; a lista rola junto ✓ | `19`, `35` |
| — o rodapé | pela metade | só **"Mandar para trás."**, sem dizer onde a peça ficou | — |
| — atravessar uma pasta | pela metade | a peça **entra na pasta e a parte**: *"perna · 2 peças · pedaço 2 de 2"* | `19` |
| Ctrl+→ | faz | *"forearm na frente de tudo"* ✓ | — |
| Arrastar | faz | muda ✓; rodapé **"Mudar a ordem de desenho."**, sem nome | `20` |
| Abrir a Ordem com uma peça escolhida | **não faz** | a peça escolhida fica **1.289 px abaixo**, fora da vista | `21` |
| Busca | **não tem** | — | — |
| Pastas | faz | criar, tirar, renomear com duplo clique ✓ (dica) | — |

### 2.3 As Propriedades

| Ficha | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| **Osso** | pela metade | Ficha rápida (X, Y, Escala X/Y, Ângulo com disco, Alfa "—") **e de novo** em *Posição e forma* (Posição X/Y, Rotação, Escala, Inclinação). Os da ficha rápida têm dica; os de baixo, **nenhuma** | `22` |
| — Comprimento, Inclinação | **não faz** | sem unidade, sem dica | `22` |
| — Herda rotação/escala/espelhamento | pela metade | sem dica | — |
| — *Chave de evento* | **não faz** | a seção do **evento** aparece dentro da ficha do **osso** e do desenho | `22`, `23` |
| **Desenho** pela Árvore | pela metade | título **"Anexo: face"**; Alfa *"de 0 a 100"* sem %; **Largura, Altura sem px nem dica** | `23` |
| **Slot** pela Ordem | pela metade | título **"Slot: head"**; tem **Osso** (trocar o pai pela ficha ✓), Anexo, Visível, Cor escura, Mistura — **sem dica** | `24` |
| **Malha** | **não faz** | a mesma ficha do desenho. **X = 50: o campo aceita, o rodapé fica mudo, a cena não muda** (diferença zero) — regra 21 | `26`, `27a`, `27b` |
| **Emissor** | faz | da rodada 38. Outro desenho: abas de ícone, texto **encostado na borda esquerda**, unidade no rótulo *"Vida (s)"* | `25` |
| Arrastar o rótulo | **não faz** | cursor normal; nada muda | — |
| Arrastar o número / roda | **não faz** | nada muda | — |
| ↑ / Shift+↑ | faz | +1 / +10 ✓ (Ctrl+↑ também +1) | — |
| Conta "90+15" | **não faz** | volta a 90 **sem dizer** | — |
| "abc" | **não faz** | volta **sem dizer** | — |
| Vírgula "100,5" | faz | ✓ | — |
| O disco do Ângulo | faz | arrastar o disco gira ✓; **o disco não tem dica** | — |
| Local / Pai / Mundo (barra) | **não faz** na ficha | a ficha mostra **sempre o local**. A dica da barra diz que é para as alças, e é verdade | — |
| A ficha cabe | **não faz** | 1920×1080: **187 de 1.056 px**. O **Osso** do slot fica **87 px abaixo** da dobra | `22`, `35` |

### 2.4 As portas do menu

| Porta | Estado | Nota |
|:---|:---:|:---|
| Editar → Apagar (Delete), Renomear (F2), Buscar na Árvore (Ctrl+F), Os filhos (`]`) | faz | ✓ |
| Escolher vários na Árvore | **não tem porta** | nem tecla, nem menu |
| Dobrar tudo / abrir tudo | **não tem porta** | — |
| Ordem: Trazer, Mandar, Frente, Fundo | faz | botões da aba e Ctrl+setas; **não vi no menu** |

---

## 3. O caminho do objetivo

**Achar, renomear e ordenar 30 peças sem se perder.** Herói com braço e perna duplicados (Ctrl+D): *"2 ossos e 6 desenhos duplicados, 20 px à direita"* — **22 ossos, 32 desenhos** (`29`). Peça: `hand_2`. Como usuário.

| # | Passo | Gestos | Tropeço |
|:---:|:---|:---:|:---|
| 1 | Lupa → digitar `hand_2` → clicar a linha | 2 cliques + digitar | ✓ só ela e os pais (`30`). **T1** a ficha diz **"Anexo: hand"**: o nome da imagem, não o que escolhi |
| 2 | **F2** → `mao_nova` → Enter | 1 tecla + digitar | **T2** a peça **some**: *"Nada com "hand_2"."* (`31`). Tem de reescrever a busca |
| 3 | Busca `mao` → arrastar `mao_nova` para o `torso` | 1 clique + digitar + 1 arrasto | ✓ *"1 item virou filho de torso"*, mesmo pixel. **T3** depois de soltar, **nada fica escolhido** |
| 4 | Aba **Ordem** → clicar `mao_nova` → **Ctrl+↓ 16 vezes** até a frente do `body` | 2 cliques + 16 teclas | ✓ anda e rola junto (`35`). **T4** a peça atravessa duas pastas e o rodapé diz só *"Mandar para trás."*: não se sabe onde ela está sem olhar a lista |
| 5 | Ler na ficha o osso e o giro | rolar | **T5** a ficha rápida mostra **−140** sem °, e **não diz o osso**; o campo **Osso** mora 87 px abaixo. "Quanto gira" na tela não existe: só o local, nem com Mundo na barra |

**Resultado:** o objetivo se cumpre em **~7 cliques, 3 digitações, 16 teclas e uma rolagem**. **O que trava um usuário de verdade:** o T2 (a peça some), o T5 (a ficha não diz onde a peça está), e — antes de tudo — em **1280×720** a Árvore mostra **uma linha e meia** (`28`).

---

## 4. O padrão (régua do `26`)

| Número | Hoje | Unidade | Faixa | Dica | O que falta |
|:---|:---|:---:|:---:|:---:|:---|
| Ficha rápida X, Y (osso) | 0 | ✗ | — | ✓ "no espaço do osso pai" | **px** |
| Ficha rápida Escala X, Y | 1 | ✗ | — | ✓ | **×** |
| Ficha rápida Ângulo | 90 | ~ dica "graus" | — | ✓ | **°** à vista; dica no disco |
| Ficha rápida X, Y, Escala, Ângulo (desenho) | | ✗ | — | ✓ | idem |
| Ficha rápida Alfa (desenho) | 100 | ✗ | ✓ "de 0 a 100" | ✓ | **%** |
| Comprimento | 70 | ✗ | — | ✗ | **px**, dica |
| Posição X, Y · Rotação · Escala X, Y | | ✗ | — | ✗ | **sumir** (repetem a ficha rápida) ou ganhar unidade |
| Inclinação X, Y | 0 | ✗ | — | ✗ | **°**, dica |
| Largura, Altura | 64 · 66 | ✗ | — | ✗ | **px**, dica *"tamanho da imagem, só leitura"* se for |
| Cor do osso · Cor (opacidade) | 100 % | ✓ | ✓ | ✓ | em dia |

**Conta:** 23 números. **2** em dia · **11** com dica mas sem unidade à vista · **10** sem nada.

**Texto:** a Ordem é a mais escrita (toda linha e todo botão com frase inteira) · a ficha do osso tem dica só em cima · a ficha do emissor tem outro desenho e outra margem. **Nomes:** "desenho", "Anexo", "Slot" para a mesma peça. **Rodapé mudo ou vago:** Renomear, Mandar para trás, Mudar a ordem, Apagar, "1 item".

### O que rola, e por quê

| Tela | Árvore | Ficha |
|:---|:---|:---|
| 1920×1080 | ~13 linhas de 40 | **187 de 1.056 px**: só a ficha rápida |
| 1280×720 | **62 px: 1 linha e meia** | a ficha rápida inteira |

A coluna esquerda divide a altura entre a Árvore e a ficha. A ficha come a altura com **as duas cópias** dos números, a seção de **evento** que não é dela, e as seções de *Compensar* e *Marcação*. **A divisa entre os grupos é da casca**, não destas partes (ver "fica de fora").

---

## 5. O plano dos lotes

Uma versão por lote. Tudo nas partes **Árvore** (`panels/tree*`, `tree-actions.ts`), **Ordem** (`panels/draw-order*`) e **Ficha** (`panels/properties*`). **Nada toca `formato/` nem `runtime/`.** Tecla nova: uma linha em `ui/keys.ts`.

### Lote 1 — a ficha diz o que é, uma vez

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 1.1 | **Unidade à vista** em todo número: **px** (X, Y, Comprimento, Largura, Altura), **°** (Ângulo, Inclinação), **×** (Escala), **%** (Alfa). Dica com a frase inteira em todo campo, também no disco | régua do `26`; Spriter (° e %) |
| 1.2 | **X, Y, giro e escala uma vez só**: a ficha rápida fica; *Posição e forma* guarda só **Inclinação** (e o que a ficha rápida não tem) | os quatro mostram uma vez |
| 1.3 | **Um nome**: o título diz **"Desenho: mao_nova"**, com a imagem e **o osso** na linha de baixo (*"imagem hand · no osso torso"*), venha da Árvore ou da Ordem | `23`, `24`; T1, T5 |
| 1.4 | A seção **Chave de evento** só aparece com **evento** escolhido | `22` |
| 1.5 | **Malha não mostra X, Y, Escala, Ângulo** (não mudam nada) | regra 21; `27a`, `27b` |
| 1.6 | O emissor no **mesmo recuo** das outras fichas | régua 3 do `26` |

**Prova:** teste puro de que todo número da ficha (osso, desenho, slot) tem unidade e dica (falha hoje, regra 26); teste de que a ficha da malha não tem X; foto do título com o osso.

### Lote 2 — o número se mexe e fala

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 2.1 | **Arrastar o rótulo** muda o número (cursor ↔); **Shift** passo 10×, **Alt** passo fino; um passo de desfazer por arrasto | Photoshop scrubby; Spine arrasta o número |
| 2.2 | **Conta simples** no campo: `90+15`, `*2`, `/2`, `+-10` | Spine (SP p.34) |
| 2.3 | O que não é número **avisa**: *"'abc' não é número: Ângulo ficou 90°"* | regra 21 |
| 2.4 | **Giro no mundo** à vista no Ângulo, só leitura (*"no mundo: −50°"*), ou a ficha segue Local/Pai/Mundo da barra. **Suposição S2** | Spine: Local/Parent/World muda o número |

**Prova:** teste puro da conta e da recusa; foto do arrasto do rótulo com o número mudando.

### Lote 3 — a Árvore escolhe e anda

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 3.1 | **Ctrl+clique soma**, **Shift+clique faz faixa** | os quatro |
| 3.2 | **Setas**: ↑↓ andam, ← dobra (ou vai ao pai), → abre; **o foco fica na linha** depois de escolher | árvore de qualquer sistema; recado da rodada 38 (o foco que se perde) |
| 3.3 | **Alt+clique no triângulo** dobra o ramo inteiro | Photoshop; Spine (botão direito) |
| 3.4 | Busca: **o nome achado em negrito**; **a peça renomeada não some** (a busca segue o nome novo); fechar com **×**, não lixeira | Spine destaca; T2 |
| 3.5 | **Nome inteiro na dica** da linha quando corta | `02`, `10a` |
| 3.6 | Depois de arrastar, **a peça fica escolhida**; rodapé com o nome: *"mao_nova virou filho de torso"* | T3 |
| 3.7 | **Nome repetido avisa** (*"já existe arm: ficou arm2"*); **nome vazio avisa** | regra 21 |
| 3.8 | Desenho sobre desenho do mesmo osso **diz** *"Para mudar quem fica na frente, use a aba Ordem"* | regra 21 |

**Prova:** teste puro da escolha com Ctrl/Shift e das setas; foto de 3 peças escolhidas e da busca com o nome em negrito.

### Lote 4 — apagar e ordenar dizem o quê

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 4.1 | **Delete diz o que apagou**: *"Apaguei arm: 2 ossos e 6 desenhos. Ctrl+Z volta"*; a lixeira com dica inteira | recado da rodada 41; regra 21 |
| 4.2 | Osso **com filhos** pergunta antes, com **"não perguntar de novo"**. **Suposição S1** | Spine e DragonBones perguntam |
| 4.3 | Botão direito no osso: **Novo osso filho, Duplicar, Apagar** | `16` |
| 4.4 | A **Ordem rola até a peça escolhida** ao abrir e ao escolher na Árvore ou na cena | `21` |
| 4.5 | O rodapé da Ordem diz **onde ficou**: *"mao_nova: 19ª de 32, entre head e body"* | T4 |
| 4.6 | **Peça solta pula a pasta inteira** com Ctrl+↑/↓ (não parte a pasta); entrar na pasta é arrastando. **Suposição S3** | Photoshop: entra no grupo arrastando |
| 4.7 | A lista diz **"frente"** no alto e **"fundo"** no pé | Spine e Spriter: o de cima cobre |

**Prova:** teste puro da frase do Delete; foto da Ordem aberta com a peça à vista.

### Lote 5 — cabe

| # | O que tem de acontecer | A conta |
|:---:|:---|:---|
| 5.1 | **Ordem compacta**: uma linha por peça (~28 px), a imagem só na dica | hoje 8 de 32 à vista; alvo **15** em 1920×1080 |
| 5.2 | A ficha do desenho com **Osso** na ficha rápida (sem rolar) | `35`: 87 px abaixo |
| 5.3 | Medir no `npm run medir`: em 1920×1080, **Árvore ≥ 13 linhas e a ficha rápida inteira**; em 1280×720, **a ficha rápida inteira** | — |

**Prova do lote 5 (o objetivo da rodada):** no programa montado, com o mouse, o caminho do §3 com o herói de 32 desenhos: achar `hand_2`, renomear (não some), arrastar para o `torso` (fica escolhida), Ordem (já à vista) para a frente do `body`, e ler na ficha *"no osso torso"* e o giro com °. Foto de cada passo e a conta (hoje: ~7 cliques, 3 digitações, 16 teclas, 1 rolagem, 5 tropeços).

### O que fica de fora

| O quê | Por quê |
|:---|:---|
| **A Árvore com 62 px em 1280×720** | a divisa entre a Árvore e a ficha é da **casca** (`ui/panel-groups`, `layout`), não destas partes. **Vai ao Diretor**, para a rodada 46 (o padrão dos painéis). O lote 1 e o 5 encolhem a ficha, que é o que esta rodada pode |
| Ordem animada (chave de ordem) | é da linha do tempo |
| Busca na Ordem | a Árvore busca; com a Ordem rolando até a escolhida (4.4), achar na Árvore basta |
| Cor de etiqueta por peça (Photoshop) | ninguém dos três de animação tem; não pedido |
| Regex e `*` na busca (Spine) | ninguém pediu |
| `+`/`-` do Spine para a ordem | já seguimos o Spriter (Ctrl+setas) |
| Pai no próprio filho **troca os dois** | o rodapé já diz; o DragonBones recusa. Fica como está (**S4**) |

---

## Suposições (regra 23: nada subiu ao Humberto)

| # | Suposição | Quem decide se estiver errada |
|:---:|:---|:---|
| S1 | **Delete de osso com filhos pergunta**, com "não perguntar de novo"; desenho sozinho não pergunta | Diretor |
| S2 | O **giro no mundo** aparece **só para leitura** ao lado do Ângulo; a ficha continua gravando o local | Diretor |
| S3 | Ctrl+↑/↓ **pula a pasta inteira**; para entrar na pasta, arrasta-se | Diretor |
| S4 | O pai solto sobre o próprio filho **continua trocando os dois** (o rodapé avisa) | Diretor |
| S5 | **"Desenho"** é o nome na tela para slot e anexo; a palavra "slot" fica só onde há mais de uma imagem no mesmo lugar | Diretor |

## O que não conferi

| O quê | Por quê |
|:---|:---|
| A Ordem dentro de uma animação | conferi na base; a ordem animada é da linha do tempo |
| Arrastar na Ordem para dentro de uma pasta | só arrastei peça solta |
| O "3" na miniatura da Ordem | não li a dica dele |
| A ficha do evento, do parâmetro, da regra | fora da ficha desta rodada |
| Arrastar com a lista rolando sozinha | o arrasto nativo do protocolo não rola a lista |

## Um erro meu, pela forma (regra 27)

**Deixei um arrasto pela metade no navegador.** No primeiro roteiro liguei a interceptação do arrasto e não terminei o arrasto: o Chrome ficou esperando a soltura, e **todo clique seguinte foi engolido**. Vi pela escolha que não mudava e pelos eventos vazios, e cancelei o arrasto preso. Depois, **recarreguei a página dentro de uma conta**: a conta nunca respondeu e o roteiro ficou pendurado; reiniciei o **meu** Chrome (porta 9500, nenhum outro processo). E mais um, da mesma família do da rodada 41: **procurei o campo pelo ancestral comum**, e o primeiro campo do ancestral era o **X**, não o Ângulo; o rodapé disse *"Mudar X"* e me avisou. Desfiz com Ctrl+Z. Daí em diante: **campo pela dica exata**, nunca pelo vizinho; **arrasto sempre terminado ou cancelado**; **recarregar pela navegação**, não por conta.

## Links

| Programa | Link |
|:---|:---|
| Spine | https://esotericsoftware.com/spine-tree · https://esotericsoftware.com/spine-cheat-sheet · https://esotericsoftware.com/spine-keys |
| Spriter | https://www.brashmonkey.com/spriter_manual/ · https://www.brashmonkey.com/spriter_manual/creating%20and%20assigning%20bones.htm · https://www.brashmonkey.com/spriter_manual/placing%20a%20sprite.htm |
| DragonBones | site fora do ar; o PDF da casa, p.5, 15-19, 42 |
| Photoshop | https://helpx.adobe.com/photoshop/desktop/create-manage-layers/get-started-layers/work-with-the-layers-panel.html · https://helpx.adobe.com/photoshop/desktop/create-manage-layers/get-started-layers/organize-layers-in-the-layers-panel.html · https://helpx.adobe.com/photoshop/desktop/create-manage-layers/transform-manipulate-layers/reorder-and-move-layers.html · https://helpx.adobe.com/photoshop/desktop/create-manage-layers/transform-manipulate-layers/select-layers.html · https://helpx.adobe.com/photoshop/desktop/create-manage-layers/create-layer-compositions/show-and-hide-layers-and-groups.html · https://helpx.adobe.com/photoshop/using/panels-menus.html · https://helpx.adobe.com/photoshop/using/free-transformations-images-shapes-paths.html · https://helpx.adobe.com/content/dam/help/en/photoshop/using/default-keyboard-shortcuts/photoshop-keyboard-shortcuts.pdf (p.27-28) |

## Desvios (o executor, na parte 2)

| Lote | Desvio | Por quê |
|:---:|:---|:---|
| 1 | **O recuo do emissor (1.6) voltou** | com 10 px os rótulos "Taxa por segundo" e "Máximo de vivas" quebravam em duas linhas e a aba passava da altura medida pela rodada 38 |
| 1 | **X, Y, giro e escala uma vez só (1.2) é do painel, não do modelo** | o modelo continua com os campos (rótulos, comandos e testes dependem dele); o painel tira embaixo o que a ficha rápida mostra em cima (`belowQuick`) |
| 2 | **O giro no mundo vai inteiro ("mundo -77°")** | com casas decimais ele cortava na coluna de 258 px; o número exato fica na dica |
| 3 | **A busca seguia o nome novo; no lote 4 deixou de seguir** | a conferência (doc 62, a) viu que reescrever o texto sumia com os outros achados. Agora a busca fica como foi digitada e a peça renomeada fica à vista |
| 4 | **A pergunta do Delete não tem "não perguntar de novo"** | a janela (`askUser`) é da casca e só tem dois botões; Ctrl+Z volta tudo |
| 4 | **O passo que pula a pasta vale para Ctrl+↑/↓; Ctrl+←/→ (frente e fundo de tudo) já levava a pasta inteira** | — |
| 5 | **A Ordem compacta (5.1) ficou em 45 px por linha, não 28** | a miniatura de 40 px é decisão antiga, com teste (`ORDER_THUMB`): é ela que distingue a bota esquerda da direita. O nome e a imagem foram para uma linha só e o respiro caiu: 52 → 45 px; à vista, 8 → 9 peças em 1920×1080 |
| 5 | **O campo Osso não entrou na ficha rápida (5.2)** | o lote 1 já pôs o osso na linha de baixo do título ("imagem hand · no osso torso"); um campo a mais comeria altura de uma ficha que ainda não cabe |
| 5 | **A Árvore com 62 px em 1280×720 segue igual** | é a divisa da casca (aviso para a rodada 46), como o plano dizia |
