# A cena e as ferramentas — pesquisa e conferência — 06/10/2026

Rodada 46, parte 1. Chat: `PESQUISANDO · rodada 46 — Cena e ferramentas [d01269]`.
**Nenhum código foi mexido.** Ficha: `rodadas/RODADA 46 - polimento da cena e das ferramentas 2026-10-06.md`.

| | |
|:---|:---|
| Versão montada | a de `programa/` às 22h31 (o `ESTADO.md` diz **v33.5**). Servidor próprio na porta **5530** |
| Como | Chrome sem janela na porta **9530**, 1920×1080 e 1280×720, mouse, teclado e arrasto por protocolo. Roteiros de rascunho **fora** da pasta (regra 29) |
| Material | o herói de exemplo (botão **Abrir o herói** do aviso de abertura) |
| Hora | 22h31 a 22h40 do relógio da máquina |
| Fotos | `backup/fotos-obra/rodada-46/` (33) |
| Pesquisa | um ajudante, com fonte em cada fato (§1). PDFs da casa e manuais na web |

## O quadro

| # | Pergunta | Resposta curta |
|:---:|:---|:---|
| 1 | Dá para posar o herói com o Transformar? | **Dá, com tropeços.** Mover, girar pela bolinha, escalar pelo quadradinho e inclinar com Alt **funcionam**. Mas o **braço e a cabeça são segurados por regras** (`ik_arm`, `head_lean`, `look_driver`): o gesto parece pegar e o rodapé diz *"não girou"*. A caixa de um osso é **fina**: três quadradinhos em ~20 px, e 20 px de mouse no meio do lado escalam **3×** |
| 2 | O rodapé ensina? | **Pela metade.** Durante o arrasto o rodapé fica **mudo**: o número só chega **ao soltar**. E chega sem unidade: *"Mover."* sem px, *"Escalar X 1,34"* sem ×. **7 de 12** ferramentas não dizem nada no rodapé; **9 de 12** têm só o nome na dica |
| 3 | B, P, Ponto e Caixa? | **Fazem.** B com dois desenhos escolhidos cria o osso e **pega os dois** (*"Osso novo pegou 2 desenhos, sem mover"*). P é o melhor gesto da parte: pinta de verde quem já é filho, rodapé claro. Ponto e Caixa nascem com **Alt+arrastar**, e sem Alt o rodapé ensina. Tropeços: o osso nasce na raiz com o nome *"osso"*; a caixa caiu no `root` porque o ponto recém-criado ficou escolhido |
| 4 | Zoom e vista? | **Fazem.** Roda pelo mouse, Ctrl+= e Ctrl+−, Ctrl+0, F, Ajustar, Espaço+arrastar e botão do meio. Mas **Espaço só vale com o foco na cena**: com o foco na Árvore ele desmarcou tudo e fez um retângulo. A posição do mouse **não tem número** em lugar nenhum |
| 5 | Cabe? | Em **1280×720** a cena fica com **744×342 px** e a caixa do zoom tapa um canto dela; o rodapé **corta 2 das 4 partes** em 1280 e corta a frase do Criar osso em 1920 |

---

## 1. Como os outros fazem

Fontes da casa, em `documentos/pesquisa/nova pesquisa/`: **[SG]** `spine/Spine User Guide - manual completo 2026-09-08.pdf` · **[SP]** `spriter/Spriter Pro - manual oficial 1.4.pdf` · **[DB]** `dragonbones/DragonBones Pro - manual completo 2026-09-08.pdf` · **[SEQ]** `SEQUENCIA cena e ferramentas` · **[ONDE]** `ONDE FICA CADA BOTAO` · **[print]** figura oficial em `<programa>/prints/`. "p." é a página do PDF. Links no fim. O `web.archive.org` do manual do DragonBones estava bloqueado: valeu o PDF da casa.

### 1.1 As alças

| Programa | Como | Fonte |
|:---|:---|:---|
| Spine | **Ferramentas separadas**: Rotate (C), Translate (V), Scale (X), **Shear (Z)**. Não há caixa: cada ferramenta desenha um ícone com alça **X** e alça **Y**; o arrasto pode começar **no vazio**, *"without requiring precise interaction with small control handles"* | SG p.33–39 |
| Spriter | **Uma caixa só**: clicou, aparecem as alças. Pelo print: caixa tracejada, **8 quadradinhos**, **bolinha vermelha** no pivô, haste até um **círculo branco** (girar). O que cada quadradinho faz: não confirmei por texto | SP p.6 · [print] `05-por-sprite-na-cena_204.jpg` |
| Spriter | Osso: clicar de novo no osso escolhido mostra os **controles de tamanho** | SP p.37 |
| Spriter | **Inclinar não existe** | SP p.6 · [ONDE] B.1.3 |
| DragonBones | No osso escolhido: seta vermelha (X), seta verde (Y), ponto amarelo (pelo print). Ponta do osso: um **círculo verde** que muda o comprimento | [print] `interface_mainInterface_p1.png` · DB p.5 |
| DragonBones | Inclinar: o formato tem `skX`/`skY`; ferramenta no editor: não confirmei | formato 5.5 · DB p.17 |

### 1.2 O número durante o gesto

| Programa | Como | Fonte |
|:---|:---|:---|
| Spine | **Mostrador numérico** de cada ferramenta na barra de baixo, conforme o eixo (Local, Parent, World); aceita `+123`, `*2` | SG p.13, p.34 |
| Spine | As **réguas** mostram uma linha vermelha e **o número da posição do mouse** | SG p.45 |
| Spriter | Painel **Object Properties**: x, y, escala, ângulo, alfa. Se atualiza durante o arrasto: não confirmei | SP p.6 |
| DragonBones | Painel **Transformação**: x, y, escala, ângulo, tamanho. Durante o arrasto: não confirmei | DB p.17 |

### 1.3 Teclas modificadoras

| Programa | Como | Fonte |
|:---|:---|:---|
| Spine | **Shift ao girar = 15°**. Alt ao mudar o comprimento leva os filhos | SG p.35, p.42 |
| Spriter | **Ctrl** ao arrastar, girar ou escalar = **clonar**. Setas = 1 px | SP p.37 |
| DragonBones | Ctrl no criar osso (ver 1.5) | DB p.5 |

### 1.4 Seleção

| Programa | Como | Fonte |
|:---|:---|:---|
| Spine | Arrastar um item não escolhido já o escolhe e mexe. **Ctrl+clique soma**; Ctrl+arrastar faz caixa; **botão do meio sempre faz caixa**. Espaço, Esc ou duplo clique desmarcam | SG p.33 |
| Spriter | Ctrl+A ou retângulo. **Z** escolhe os descendentes, **Shift+Z** os ancestrais. **7 8 9 0** mostram e travam | SP p.3, p.37 |
| DragonBones | Chave **Optional** por osso ou slot | DB p.15 |
| Os três | Clique no transparente, Alt-clique entre peças empilhadas: não confirmei | — |

### 1.5 Criar osso, pendurar, ponto e caixa

| Gesto | Spine | Spriter | DragonBones |
|:---|:---|:---|:---|
| Criar osso | **Create (N)**: escolher o pai, clicar ou arrastar. Nasce escolhido; Shift não escolhe. **Adota imagens**: Ctrl+clique nelas antes, e **o osso ganha o nome do primeiro slot**. Alt refaz sem mexer nos filhos (SG p.42–43) | **Alt+arrastar**; se um osso está escolhido, o novo vira **filho** e a cadeia sai em sequência (SP p.3, p.8) | **Criar osso (N)**: arrastar. **Liga as imagens sozinho** se começo e fim caem nelas; **Ctrl** desliga (DB p.5) |
| Pendurar | **P** (Set Parent), clicar o pai (SG p.21, p.66) | escolher o osso, **segurar B** e clicar nos sprites; tudo fica translúcido e o preso, mais opaco (SP p.3, p.8) | arrastar na Árvore (DB p.7) |
| Ponto | New… → Point, no osso escolhido (SG p.108) | seletor **create point** → **Alt+arrastar**: posição e ângulo (SP p.20) | não existe no formato |
| Caixa | New… → Bounding Box, polígono por clique (SG p.86–88) | seletor **create box** → **Alt+arrastar**; depois as alças da imagem (SP p.19) | formato tem `boundingBox`; gesto: não confirmei |

### 1.6 Zoom e vista

| Programa | Como | Fonte |
|:---|:---|:---|
| Spine | Vista: **botão direito** arrastando ou J. Zoom: **roda**, pelo mouse. Régua de zoom; **Ctrl+F** = 100%, **Ctrl+Shift+F** = caber | SG p.13 |
| Spriter | Vista: **botão do meio** ou **Espaço+arrastar**. Zoom: roda; Ctrl+roda rápido; Ctrl+Alt+Shift+Espaço = 100% | SP p.37 |
| DragonBones | Ferramenta Mover (H); roda e %: não confirmei | DB p.42 |
| Cebola | Spine: **Ghosting** (SG p.175). Spriter Pro: arrastar na Timeline ([ONDE] B.1.5). DragonBones: botão na linha do tempo, 3 quadros (DB p.32) | — |

**O que os três repetem:** criar osso é **arrastar do começo ao fim**, e o pai é o osso escolhido · prender imagem tem **um gesto na cena** (B+clique, Ctrl+clique antes de criar, ligação automática) · **o número mora num painel fixo**, não num balão · **travar por tipo** (7 8 9 0) · **vista e zoom sem ferramenta**: roda, botão do meio ou Espaço.

---

## 2. O que o nosso faz hoje

**faz** · **pela metade** · **não faz** · **não tem porta**.

### 2.1 O Transformar (T), num osso

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Clicar no desenho escolhe o **osso** dele | faz | clicar no braço escolheu `forearm` ✓ — o gesto do Spriter | `04` |
| A caixa do osso | **pela metade** | tracejado **fino**, 3 quadradinhos e a bolinha cabem em ~20 × 85 px a 245%. Um clique um pouco fora vira **retângulo de seleção** (meu erro de mira caiu nisso: `10`) | `05`, `10` |
| Mover (dentro) | faz | anda ✓; rodapé **"Mover."**, sem px | `16` |
| Girar (bolinha) | faz | anda ✓; rodapé **"Girar −32,7°"**, relativo, só ao soltar | `12` |
| **Shift** ao girar | faz | **−30°**: passos de 15° ✓ (como o Spine) | `17` |
| Escalar pela ponta | faz | *"Escalar X 1,34"* — **sem ×** | `13` |
| Escalar pelo meio do lado | **pela metade** | **20 px de mouse = 3,03×**: o lado está a ~10 px do osso, então todo arrasto é um salto | `14` |
| **Inclinar com Alt** no meio do lado | **pela metade** | puxando **para o lado**: *"Inclinar X 21,6°"* ✓. Puxando **para cima**: *"Inclinar X 0°"* e nada acontece, sem dizer por quê. O cursor **não muda** com o Alt (segue `ew-resize`) | `15`, `18` |
| A ficha mostra a inclinação | pela metade | a **Ficha rápida** não tem Inclinação; está nas Propriedades de baixo (código: `properties-model.ts`, *"Inclinação X, em graus (°)"*) | `18` |
| **Osso segurado por regra** | pela metade | braço (`ik_arm`) e cabeça (`head_lean`, `look_driver`): o gesto parece pegar, a ficha muda (−32,7°), e o rodapé diz *"head não girou: as regras … mandam nele. Desligue o olho delas na aba Regras"* ✓ honesto — mas **não há porta** no próprio rodapé para desligar | — |
| O pivô (bolinha vermelha) | **não faz** | passar o mouse não muda o cursor; arrastar o pivô não é gesto (no Spriter também não, para osso) | — |

### 2.2 O cursor

| Onde | Cursor | Estado |
|:---|:---|:---:|
| Dentro da caixa · bolinha · meio do lado · ponta | `move` · `grab` · `ew-resize` · `ns-resize` | faz |
| Segurando **P** | `alias` | faz |
| Segurando **Espaço** | `grab` | faz |
| **Botão do meio** arrastando | `crosshair` (não vira mão) | pela metade |
| **Cada ferramenta** da barra | sempre `crosshair` | não faz |
| Alt sobre o meio do lado (inclinar) | o mesmo do escalar | não faz |

### 2.3 A barra: dica e rodapé de cada ferramenta

| Ferramenta | Tecla | Dica | Frase no rodapé ao escolher |
|:---|:---:|:---|:---|
| Transformar | T | frase inteira ✓ | **nada** (fica o "Próximo:") |
| Selecionar | Q | **só o nome** | **nada** |
| Mover | W | **só o nome** | **nada** |
| Girar | E | **só o nome** | **nada** |
| Escalar | R | **só o nome** | **nada** |
| Inclinar | Z | *"O topo anda, a base fica"* ✓ | ✓ |
| Posar | Y | **só o nome** | ✓ |
| Criar osso | B | frase inteira ✓ | ✓ (cortada em 1920: *"Alt sobre um osso: r…"*) |
| Ponto | O | **só o nome** — não diz o Alt | ✓ *"segure Alt e arraste"* |
| Caixa | X | **só o nome** — não diz o Alt | ✓ |
| Malha | M | **só o nome** | **nada** |
| Pesos | G | **só o nome** | **nada** |
| — | N | livre (nada acontece) ✓ como diz o `keys.ts` | — |

**Conta:** dica com frase **3 de 12**; rodapé ao escolher **5 de 12**.

### 2.4 Seleção

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Clique no desenho | faz | escolhe o osso dele; na capa (que não tem osso de mesmo nome) escolhe o **desenho** | `19` |
| **Alt+clique** no mesmo ponto | faz | passa à peça de baixo: do osso `arm` para o desenho `arm` ✓ | — |
| **Ctrl+clique** | **pela metade** | **troca** a escolha (o Spine soma com Ctrl) | `19` |
| **Shift+clique** | faz | soma: `cape_upper, cape_lower` ✓ | `20` |
| Retângulo no vazio | faz | escolhe vários (*"Vários itens"*, caixa de 8 quadradinhos) | `10` |
| O rodapé ao escolher | **não faz** | mudo em todo clique de escolha | — |
| Clique no transparente passa | (código) | `picking.ts`, *"The transparent part of an image lets the click through — lote 60c"*; não fotografei | — |
| Passar o mouse sobre uma peça | não faz | nada no rodapé; existe **Exibir → A cena → Nome ao passar o mouse**, desligado de fábrica | `28` |

### 2.5 Criar osso, pendurar, ponto e caixa

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| **B** com 2 desenhos escolhidos, arrastar | faz | *"Osso novo pegou 2 desenhos, sem mover"* ✓; Histórico: *"Criar osso e pegar os desenhos"* | `21` |
| — onde nasce | pela metade | na **raiz**, não no osso dos desenhos; nome **"osso"** (o Spine dá o nome do primeiro slot) | `21` |
| — rodapé durante o arrasto | não faz | mudo | — |
| **P** segurado + clique | **faz** | *"Segure P: o que está pintado já é filho de osso"*, os filhos **contornados de verde**, cursor `alias`; clique: *"hair virou filho de osso"*; soltar: *"osso ficou com 1 filho novo"* ✓ | `22`, `23` |
| **Ponto (O)** sem Alt | faz | arrastar e clicar: *"Segure Alt e arraste para criar um ponto"* ✓ | — |
| Ponto com Alt+arrastar | faz | *"Ponto osso_ponto criado no osso osso"* ✓ — o ângulo do arrasto não é dito | `24` |
| **Caixa (X)** com Alt+arrastar | pela metade | *"Caixa root_caixa criada no osso root"*: caiu no `root` porque **o ponto recém-criado ficou escolhido** e ponto não é osso. A ficha diz *"4 cantos — arr…"*, cortado | `25`, `26` |

### 2.6 Vista, zoom, cebola, grade

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Roda do mouse | faz | 245 → 282 → 324 → 373%, **pelo ponto do mouse** ✓ | `06` |
| Ctrl+= · Ctrl+− · Ctrl+0 · F · Ctrl+Shift+F | faz | 267 · 232 · 100 · 647 · 203% ✓; **o rodapé não diz nada**, só o campo muda | — |
| Caixa do zoom (−, %, +, Ajustar) | faz | canto de baixo à direita ✓; em 1280×720 tapa ~225×60 px da cena de 744×342 | `31` |
| **Espaço + arrastar** | **pela metade** | com o foco **na cena**: anda ✓, cursor `grab`. Com o foco **na Árvore** (eu tinha acabado de clicar nela): **nada**, e o arrasto virou retângulo e **desmarcou o escolhido** | `11` |
| Botão do meio | faz | a vista anda ✓ (comparei as fotos); cursor não muda | `32` |
| Botão direito | (dica) | volta à ferramenta de antes; não testei | — |
| Posição do mouse | **não faz** | a régua marca o mouse com um **traço laranja sem número**; nada no rodapé | `18` |
| Réguas | pela metade | números **sem "px"** | `01` |
| Grade, réguas, eixos, guias | faz | **Exibir → A cena**, ligados ✓ | `28` |
| **Casca de cebola** | faz | Exibir → A cena → Casca de cebola: *"Casca de cebola ligada"* ✓; também o botão da linha do tempo. O rastro é **fraco** no fundo claro | `30` |
| Abrir o herói | pela metade | ele abre a **100%**, pequeno (~140 px de altura numa cena de 1366×711); o Ajustar resolve em 1 clique | `01`, `02` |

### 2.7 As teclas

| Tecla | Estado | Rodapé |
|:---|:---:|:---|
| Setas (na animação) | faz | *"2 chaves em 0,50 s: … Posição X, … Posição Y"* — não diz quantos px |
| Shift+setas | pela metade | *"Andar com o desenho."* — **sem os 10 px** |
| Ctrl+↑ / Ctrl+↓ | faz | *"cape_lower: 17ª de 19, entre arm_back e hair (chave em 0,50 s)"* ✓ |
| H | faz | esconde; de novo: *"Nada escolhido. Escolha uma peça…"* |
| 7 8 9 0 | faz (barra) | botões Ver/Travar ossos e desenhos, com dica inteira ✓ |
| Alt (criar no Ponto e na Caixa) | faz | ver §2.5 |

---

## 3. O caminho do objetivo

**Posar o herói com o Transformar, criar um osso com B pegando dois desenhos, pendurar com P, criar ponto e caixa.** Como usuário, lendo só a tela.

| # | Passo | Gestos | Tropeço |
|:---:|:---|:---:|:---|
| 1 | Abrir o herói | 1 | **T1** abre pequeno, a 100% (`01`) |
| 2 | Ajustar | 1 | ✓ (`02`) |
| 3 | Clicar no braço | 1 | ✓ escolhe o osso (`04`) |
| 4 | Girar o antebraço pela bolinha | 1 arrasto | **T2** *"forearm não girou: a regra ik_arm manda nele"* — e a cabeça também. O herói é segurado nos dois lugares que um usuário mexe primeiro |
| 5 | Aproximar com a roda, para pegar a caixa | 3 | **T3** a caixa do osso é fina: errei a mira uma vez e virou retângulo, com "Vários itens" (`10`) |
| 6 | Espaço+arrastar para ver a cabeça | 1 | **T4** com o foco na Árvore, nada: o arrasto desmarcou tudo (`11`) |
| 7 | Clicar na cena, Espaço+arrastar de novo | 2 | ✓ |
| 8 | Mover, girar, escalar pela ponta | 3 arrastos | **T5** rodapé **mudo** enquanto arrasta; ao soltar, *"Mover."* sem px, *"Escalar X 1,34"* sem × |
| 9 | Escalar pelo meio do lado | 1 | **T6** 20 px = 3×: não há controle fino |
| 10 | Alt + meio do lado | 2 arrastos | **T7** puxei para cima, como quem "estica": 0°, calado. Só puxando para o lado inclina |
| 11 | Escolher 2 desenhos | 2 | **T8** Ctrl+clique troca; Shift+clique soma — e nada na tela diz qual é (`19`, `20`) |
| 12 | B, arrastar | 2 | ✓ *"Osso novo pegou 2 desenhos"*; nasce na raiz com o nome "osso" (`21`) |
| 13 | T, segurar P, clicar no rabo de cavalo | 3 | ✓ o melhor gesto da parte (`22`) |
| 14 | O, arrastar | 2 | o rodapé ensina o Alt ✓ — a dica do botão não |
| 15 | Alt+arrastar | 1 | ✓ ponto no osso novo (`24`) |
| 16 | X, Alt+arrastar | 2 | **T9** a caixa caiu no `root`, não no osso novo (`26`) |

**O objetivo se cumpre em ~29 gestos**, com 9 tropeços. Os que **travam** de verdade: o **T2** (o herói resiste e parece defeito), o **T5** (sem número durante o gesto, não se pousa um valor) e o **T6/T7** (a caixa do osso não dá controle).

---

## 4. O padrão (régua do `26`)

| Número | Onde | Hoje | Unidade | Faixa | O que falta |
|:---|:---|:---|:---:|:---:|:---|
| Mover | rodapé | "Mover." | ✗ | — | **quanto**: "Mover 12 px, −4 px" |
| Girar | rodapé | "Girar −32,7°", só ao soltar | ✓ | — | **durante** o gesto, e o ângulo final |
| Escalar | rodapé | "Escalar X 1,34" | ✗ | — | **×** |
| Inclinar | rodapé | "Inclinar X 21,6°", só ao soltar | ✓ | — | durante o gesto |
| Shift+seta | rodapé | "Andar com o desenho." | ✗ | — | "10 px" |
| Zoom | caixa | "203%" | ✓ | ✗ | o rodapé não diz; a faixa não está na dica |
| Posição do mouse | — | não existe | — | — | **o número na régua ou no rodapé**, em px (Spine) |
| Régua | réguas | "−160 … 180" | ✗ | — | "px" uma vez, no canto |
| Ficha rápida X · Y · Escala · Ângulo · mundo | painel | "40 px", "1 ×", "20 °", "mundo −77°" | ✓ | — | ✓ (rodada 43) |
| Inclinação | Ficha rápida | ausente | — | — | o campo, em ° |
| Caixa nova | rodapé e ficha | "criada no osso root"; "4 cantos — arr…" | ✗ | — | o tamanho em px |
| Ponto novo | rodapé | "criado no osso osso" | — | — | o ângulo em ° |

**Conta:** 12 números. **2** em dia (a Ficha rápida e o zoom na caixa) · **10** com falta (5 sem unidade, 3 só ao soltar, 2 que não existem).

**Texto:** a **dica** do Transformar é o modelo (*"Dentro: move · bolinha: gira · quadradinho: escala · …"*); **9 ferramentas** só dizem o nome. O **rodapé** fala bem quando fala (P, B, regras, Ctrl+setas), mas **se cala durante o arrasto** — o lugar onde o Spine põe o número.

### O rodapé que se cala

Lido 300 ms depois do último movimento, com o botão ainda apertado: só *"Arquivo não salvo."* em **todos** os gestos (Mover, Girar, Escalar, Inclinar, Criar osso, Ponto, Caixa). O Transformar chama `doc.notice` a cada movimento (`tools/transform-tool.ts`, `footer()`), e o rodapé reescreve a frase a cada mudança do documento (`ui/shell.ts`, `refreshStatus`). **Hipótese**, não conferida: a mudança do gesto chega depois do aviso e apaga a frase. O lote 1 prova antes de consertar (regra 26).

### O que cabe

| Tela | Cena | Caixa do zoom | Rodapé | Foto |
|:---|:---:|:---|:---|:---|
| 1920×1080 | 1366×711 | 225×60, no canto | a frase do Criar osso cortada | `21` |
| 1280×720 | **744×342** | tapa um canto da cena | **2 de 4 partes cortadas** | `31` |

A barra de ferramentas **cabe** nas duas (em 1280, os botões de exibição vão para **Mais** ✓).

---

## 5. O plano dos lotes

Uma versão por lote. Tudo na parte **Cena** (`viewport/*`, `viewport/tools/*`, `viewport.css`). Fora dela, está dito. **Nada toca `formato/` nem `runtime/`.**

### Lote 1 — o número durante o gesto (regra 21)

| # | O que tem de acontecer | Onde | Fonte |
|:---:|:---|:---|:---|
| 1.1 | **O rodapé fala enquanto o botão está apertado**, e a frase fica depois de soltar. Primeiro provar a causa (§4, hipótese) | `transform-tool.ts`; se for `ui/shell.ts` (passagem), só acrescentando | Spine: mostrador na barra (SG p.13, p.34) |
| 1.2 | **Mover** diz quanto: *"Mover 12 px · −4 px"*; **Escalar** diz *"× 1,34"*; **Girar** e **Inclinar** dizem o quanto andou e o valor final (*"Girar −32,7° (agora 57,3°)"*) | idem, e `translate.ts`, `rotate.ts`, `scale.ts`, `shear.ts` quando usados sozinhos | régua do `26` |
| 1.3 | As ferramentas sozinhas (W, E, R, Z) dizem a mesma frase do Transformar | idem | — |
| 1.4 | Shift+seta diz *"10 px"*; seta, *"1 px"* | `tools/select.ts` (`nudge`) | §2.7 |

**Prova:** teste puro das frases do rodapé com unidade (falha hoje: *"Mover"*, *"Escalar X 1,34"*); teste de que o aviso do gesto **sobrevive** à mudança do documento no mesmo movimento; foto com o botão apertado e o número no rodapé.

### Lote 2 — toda ferramenta se explica

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 2.1 | **Dica com frase** nas 9 que só têm o nome. Ponto e Caixa dizem **"Alt+arrastar cria"** na dica | regra 12; Spriter: Alt+arrastar (SP p.19–20) |
| 2.2 | **Frase no rodapé** ao escolher as 7 caladas (Transformar, Selecionar, Mover, Girar, Escalar, Malha, Pesos) | o modelo das 5 que já falam |
| 2.3 | **Alt sobre o meio do lado** troca o cursor (o de inclinar) e diz *"Alt: inclina — puxe para o lado"* | §2.1 |
| 2.4 | O botão do meio arrastando mostra o cursor de mão, como o Espaço | §2.2 |

**Prova:** teste de que toda ferramenta registrada tem frase de rodapé e dica com mais que o nome (falha hoje 9 e 7).

### Lote 3 — a caixa do osso dá controle

| # | O que tem de acontecer | A conta |
|:---:|:---|:---|
| 3.1 | A caixa de um osso tem **largura mínima em px de tela** (ex.: 12 px de cada lado do osso), para os 3 quadradinhos e a bolinha não se encostarem | hoje: ~10 px; 3 alças e a bolinha em ~20 × 85 px a 245% |
| 3.2 | **Escalar pelo meio do lado** mede pela distância **desde o osso, com um mínimo**, para 20 px de mouse não darem 3× | hoje: 20 px = 3,03× |
| 3.3 | **Inclinar com Alt** pela direção que o usuário puxa: puxar ao longo do lado inclina, puxar para fora **diz** *"puxe para o lado"* em vez de 0° calado | hoje: para cima = 0° sem aviso |
| 3.4 | Um clique **perto** da caixa (a menos de meio quadradinho) não vira retângulo | `10` |

**Prova:** teste puro de `transformBox` com um osso estreito (largura mínima) e de escala pelo meio (fator limitado); foto a 245% com as alças separadas.

### Lote 4 — escolher, criar e ver

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 4.1 | **Ctrl+clique também soma** (o Spine soma com Ctrl); Shift continua. O rodapé diz *"2 escolhidos: cape_upper, cape_lower"* | SG p.33 |
| 4.2 | **Espaço+arrastar vale com o mouse sobre a cena**, mesmo com o foco em outro painel (o Spriter não pede foco). Ou, se a tecla é do painel com foco: o Espaço na Árvore **não desmarca** | SP p.37; §2.6 |
| 4.3 | **B com desenhos**: o osso nasce **filho do osso dos desenhos** (quando todos têm o mesmo) e com **o nome do primeiro desenho** | Spine: o osso ganha o nome do primeiro slot (SG p.43); suposição S2 |
| 4.4 | **Ponto e Caixa** nascem no osso **do ponto, da caixa ou do desenho escolhido**, não no `root`: o "osso de quem está escolhido" | §2.5, T9 |
| 4.5 | A posição do mouse em **px** aparece: número na régua junto do traço laranja (Spine) | SG p.45 |
| 4.6 | Zoom pelo teclado diz o % no rodapé | §2.6 |

**Prova:** testes puros do pai e do nome do osso novo, e do osso do ponto/caixa; foto da régua com o número.

### Lote 5 — o herói se deixa posar, e a prova

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 5.1 | **Abrir o herói** já ajustado à cena | `01` |
| 5.2 | O rodapé do *"não girou: a regra X manda nele"* ganha **a porta**: um clique desliga o olho da regra (ou leva à aba Regras com ela escolhida) | regra 21: avisar com o caminho |
| 5.3 | A Ficha rápida mostra a **Inclinação** em ° quando ela não é 0 | §2.1 |
| 5.4 | Em **1280×720**, a caixa do zoom não tapa a cena (mais estreita, ou fora da área do desenho) | `31`; a altura da cena é da rodada 47 |

**Prova do lote 5 (o objetivo da rodada):** no programa montado, com o mouse: abrir o herói, girar o antebraço (desligando a regra pelo rodapé), mover, girar com Shift, escalar pela ponta e pelo meio, inclinar com Alt, B com dois desenhos, P, ponto, caixa. Foto de cada passo, o número no rodapé **durante** cada arrasto, e a conta de gestos (hoje: ~29, com 9 tropeços).

### O que fica de fora

| O quê | Por quê |
|:---|:---|
| A altura da cena em 1280×720 (744×342) | é da casca: rodada 47 (padrão dos painéis) |
| O rodapé que corta em 1280 | idem |
| Ferramentas separadas com alça X/Y no estilo do Spine | o Transformar é a caixa do Spriter, decisão da casa (lote 47 antigo); Mover/Girar/Escalar/Inclinar continuam na barra |
| Arrastar o pivô do osso na cena | nenhum dos três faz para osso |
| Grupos de seleção (Ctrl+1..9), histórico de seleção (PageUp) do Spine | ninguém pediu |
| Clique no transparente | o código diz que passa; conferir na parte 2, com foto |

---

## Suposições (regra 23: nada subiu ao Humberto)

| # | Suposição | Quem decide se estiver errada |
|:---:|:---|:---|
| S1 | **Ctrl soma** e Shift continua somando (os dois). O Ctrl do Mover que **clona** continua só no arrasto, não no clique | Diretor |
| S2 | O osso do B nasce **filho do osso comum dos desenhos**, e com **o nome do primeiro desenho** (Spine). Se os desenhos têm ossos diferentes, nasce no pai comum mais próximo | Diretor |
| S3 | O número durante o gesto fica **no rodapé** (o lugar fixo, como os três), não num balão junto ao mouse | Diretor |
| S4 | O lote 1.1 pode tocar `ui/shell.ts` (passagem), **só acrescentando**; aviso às outras rodadas antes | Diretor |

## O que não conferi

| O quê | Por quê |
|:---|:---|
| Clique no transparente | só no código (`picking.ts`) |
| Botão direito volta à ferramenta | só pela dica |
| Selecionar, Mover, Girar, Escalar sozinhos (Q W E R) na cena | o Transformar repassa o gesto a eles (`transform-tool.ts`); conferi a frase e a dica, não o arrasto |
| Posar (Y) numa cadeia | o objetivo é o Transformar |
| Malha e Pesos | rodada 41 |
| O campo do zoom digitado | não digitei |
| Ctrl ao mover (clonar) | código; não arrastei com Ctrl |
| Se o cursor `ew`/`ns` gira junto com a caixa | só vi um ângulo |

## Um erro meu, pela forma (regra 27)

**Mirei a segunda alça pela conta, depois de um arrasto, sem fotografar de novo.** Calculei onde a bolinha estaria somando os 40 px do Mover, e o osso não andou 40 px (ele estava preso pela regra `ik_arm`). O clique caiu fora da caixa, virou retângulo e escolheu vários itens (`10`). A rodada 44 tinha escrito a mesma lição (*"todo arrasto confere o alvo antes"*) e eu a apliquei só no primeiro gesto. Daí em diante, **foto da região antes de cada mira**, e a mira tirada da foto.

## Links

| Programa | Link |
|:---|:---|
| Spine | https://esotericsoftware.com/spine-tools · https://esotericsoftware.com/spine-ui |
| Spriter | https://brashmonkey.com/spriter_manual/placing%20a%20sprite.htm · https://brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm · https://brashmonkey.com/spriter_manual/adding%20collision%20rectangles%20to%20frames.htm · https://brashmonkey.com/spriter_manual/adding%20spawning%20points%20to%20frames.htm · https://brashmonkey.com/spriter_manual/creating%20and%20assigning%20bones.htm |
| DragonBones | formato 5.5: https://unpkg.com/dragonbones-tools@0.1.2/doc/dragonbones_json_format_5.5.md · o resto no PDF da casa |

## Desvios (o executor, na parte 2)

| Lote | Desvio | Por quê |
|:---:|:---|:---|
| 1 | A causa do rodapé mudo era outra que a hipótese: o `repose` de **cada quadro** com o botão apertado apagava o recado | o quadro agora leva o recado (`repose(label?)`, opcional no contrato e no documento) |
| 1 | O "Mover" diz os campos X e Y da **ficha** (no pai), não o arrasto na tela | é o número que a pessoa lê ao lado; os dois batem (44 → 32 = −12 px) |
| 2 | Uma linha de `colunas-e-barra.test.ts` (parte da casca) mudou: "o Mover não põe linha no rodapé" virou o contrário | o item 2.2 pede; com o sim do Diretor, dito no `versao.py` |
| 3 | A escala com mínimo de partida vale só no **meio do lado** (32 px). Na escala livre, um eixo que parte a menos de 4 px da linha do pivô **fica parado** | amortecer a escala livre mudava o canto ("dobro da distância = 2") — eu fiz isso primeiro e quebrei 6 testes; a forma do erro: apliquei a régua do caso estreito ao caso largo |
| 3 | O Inclinar do Transformar passou a medir nos **eixos da caixa** | antes era no mundo: num osso em pé, puxar ao longo do lado dava 0°; dois testes antigos mandavam puxar na direção do mundo e seguiram passando |
| 4 | **S2 caiu.** O osso do B, o Ponto e a Caixa **não** vão para o osso dos desenhos: pai = osso escolhido com a mão, ou raiz | decisão do Humberto de 13/09/2026, escrita no código (*"não quero parentesco sem eu ter selecionado antes"*); o Diretor confirmou. O rodapé diz onde nasceu e ensina a escolher o osso antes |
| 4 | O rodapé de 1280×720 corta (a largura é dividida pelo texto: a parte do estado fica com 220–280 px) | é da casca: rodada 47, já na ficha dela. A frase do Criar osso ficou curta e cabe em 1920 |
| 5 | A "porta" da regra que segura o osso é trazer a **aba Regras** para a frente, com o olho a um clique | sem ação nova de menu; o olho é o mesmo `ToggleRule` de sempre |
| 5 | **Notas do doc `80`**: com um osso escolhido à mão **junto** dos desenhos, o osso do B (e o Ponto e a Caixa) nasce nele; só o osso de carona do desenho clicado (o de mesmo nome) não conta. O nome do osso novo é o do **primeiro** desenho escolhido, e a dica diz. Osso e desenho somados: o rodapé fala dos dois | a regra de 13/09 é "pai = osso escolhido"; antes, qualquer desenho na escolha mandava para a raiz, até com um osso escolhido de propósito. `shapeTarget` (parte Árvore) mudou só acrescentando a mesma conta |

## A prova final (parte 2), 07/10, 03:25

No editor do disco (a v34.5 + o lote 5), Chrome sem janela, 1920×1080, mouse e teclado. Fotos `backup/fotos-obra/rodada-46/PF-01` a `PF-10`.

| # | Passo | Gestos | O que o rodapé disse |
|:---:|:---|:---:|:---|
| 1 | Abrir o herói | 1 | abre **ajustado**, 278%: *"Abriu a base"* (`PF-01`) |
| 2 | Clicar no antebraço | 1 | escolhe o osso `forearm` |
| 3 | Girar pela bolinha | 1 | durante: *"Girar 32,9° (agora 52,9° local)"*; ao soltar: *"forearm não girou: a regra ik_arm manda nele…"* e **a aba Regras vem para a frente** (`PF-02`) |
| 4 | Clicar no olho do `ik_arm` | 1 | *"Ligar e desligar a regra"*: o antebraço gira |
| 5 | Shift + girar | 1 | *"Girar −30° (agora 22,9° local)"* (`PF-03`) |
| 6 | Escalar pela ponta | 1 | *"Escalar X × 1,22"* |
| 7 | Escalar pelo meio | 1 | *"Escalar Y × 1,45"* (`PF-04`) |
| 8 | Alt + meio do lado, ao longo | 1 | *"Inclinar X 56,4° (agora 56,4°)"*; a Ficha rápida mostra **Inclinação X** (`PF-05`) |
| 9 | Mover | 1 | *"Mover X −9,4 px · Y 3,4 px"* (`PF-06`) |
| 10 | Clicar numa capa, Ctrl+clique na outra | 2 | *"2 escolhidos: cape_lower, cape_upper"* |
| 11 | B, arrastar | 2 | *"Osso novo pegou 2 desenhos, sem mover. O osso "cape_upper" nasceu solto, na raiz"* (`PF-07`) |
| 12 | T, segurar P, clicar no cabelo | 3 | *"hair virou filho de cape_upper"* (`PF-08`) |
| 13 | O, Alt+arrastar | 2 | *"Ponto cape_upper_ponto criado no osso cape_upper"* |
| 14 | X, Alt+arrastar | 2 | *"Caixa root_caixa criada no osso root. Ficou solta, na raiz: para pôr num osso, escolha o osso antes"* (`PF-09`) |

**O objetivo se cumpre em 20 gestos, e todo número tem unidade enquanto a mão arrasta.** Na parte 1 eram ~29 gestos com 9 tropeços. Dos 9: o T1 (herói pequeno), o T2 (regra sem porta), o T3 (caixa fina), o T5 (rodapé mudo), o T6 (escala aos saltos), o T7 (Alt calado) e o T8 (Ctrl não somava) **saíram**; o T4 (Espaço com o foco fora) saiu e não precisou aparecer; o T9 (caixa na raiz) **fica de propósito** (decisão de 13/09), e agora a tela ensina. Em 1280×720 a caixa do zoom tem 176×42 px (era 225×60) (`PF-10`).

**O que fica:** o rodapé de 1280 cortando (rodada 47); a frase do "não girou" é longa e corta também em 1920.
