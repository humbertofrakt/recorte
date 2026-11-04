# ARQUITETO 2 — Triagem: o que entra traduzido, o que é só porta, o que sai — 17/09/2026

Escrito pelo ARQUITETO (`animador-8b`). **Documento, não código.**

A régua, nas palavras do Humberto: *"nada do Spine entra copiado — tudo
precisa ser traduzido para a nossa lógica, e o que não traduzir, descarte com
justificativa."* A nossa lógica é a de `programa-novo/02`: projeto, corpo,
base, virada, entidade, pilha de peles.

## 0. Os quatro vereditos

| Veredito | Quer dizer |
|:---|:---|
| **TRADUZ** | a ideia entra, mas com a nossa forma. A coluna "Tradução" diz qual |
| **PORTA** | o formato já tem (e já cabe no modelo novo); falta botão, tecla ou tela |
| **DESCARTA** | não entra, e a coluna diz por quê |
| **DEPOIS** | cabe, é ferramenta, não depende do modelo novo; vai para o glacê (degrau 12) |

E uma pergunta extra em toda linha: **"depende do modo Setup/Animate, da pose
de repouso única ou da `default` por baixo?"** Se sim, a linha não pode entrar
como está — é repensada na tradução.

---

## 1. A arquitetura do Spine — item por item

| # | Do Spine | Veredito | Tradução, ou por quê sai |
|:---:|:---|:---:|:---|
| S1 | Modo **Setup / Animate** (o nosso `Montagem \| Animando`) | **DESCARTA** | M4. A **base aberta** é um estado (o quadro 0 do corpo), não um lugar; nada some, nada recusa. A `O QUE AINDA NAO TEMOS` L100 marcou "igual" — pela régua nova esse "igual" é o erro a corrigir |
| S2 | **Setup pose** única | **TRADUZ** | uma **base por corpo**; vários corpos por projeto; a animação herda a base do corpo do instante (ARQUITETO 3 §2–§3) |
| S3 | Botão **Adjust** (mexer no setup sem mexer nas animações) | **DESCARTA** | Q27: 🗣️ *"não precisa de ajustar"*. A base vale em todas, menos onde uma chave barra |
| S4 | **Auto Key** ligado/desligado; desligado escreve o setup | **TRADUZ** | M6: editar sempre grava. O que se escolhe é o **alcance** (Chavear / Chavear tudo = Key selected / Key all do Spriter), nunca um freio. `'bloqueado'` sai |
| S5 | **Semáforo** do botão de chave (verde/laranja/vermelho) | **DESCARTA** | G13, palavra dele. A marca de chave fica na linha do tempo |
| S6 | Skin **`default` sempre ativa por baixo**; "a última adicionada ganha" | **TRADUZ** | a **pilha** Feitas/Ativas: a `default` é uma pele comum; a de cima vence (F19, F22) |
| S7 | **Skin bones / skin constraints** ("Add to Skin") | **fica** e cresce | é a ferramenta do Spine que resolve o limite do Spriter (🗣️ *"nisso vamos seguir o Spine"*). Ganha o lápis único (I5) e a pele de fora com osso (F23) |
| S8 | **`skin.drawOrder`** (F1, 10/09) | **fica** | pedido dele; é o que faz a capa vestida ir para a frente sem chave |
| S9 | Slot mostra **um anexo por vez**; troca por chave | **fica** | é como a boca fecha. G12 acrescenta a sequência como opção |
| S10 | Os **8 tipos de anexo** (region, mesh, linkedmesh, boundingbox, clipping, path, point, skeleton) | **fica** | são as ferramentas. `point` fica sem `socket`; `skeleton` é a entidade |
| S11 | **Socket** por nome de osso (nosso, apoiado no `point` do Spine) | **DESCARTA** | F7. 🗣️ *"não se guarda a mão direita nas costas"*. A entidade segue a imagem |
| S12 | **Linked mesh** | **fica** | ferramenta. "Linked mesh em outro slot" (Spine 4.3): DEPOIS, é regra 7 |
| S13 | **Tint black e 4 blends** | **fica** | F11: nenhum campo de efeito novo na 1.0. 15 blends do Live2D: DESCARTA por ora |
| S14 | As **5 regras** (IK 1–2 ossos, transform, path, physics, driver) | **fica** | ferramenta. IK de N ossos: **DEPOIS**, extensão (Q24). Pêndulo: extensão |
| S15 | **Sliders** (Spine 4.3) | **PORTA** | é o `driver` contínuo + `parameter.source` (§8.2, §8.1). Conserta o defeito A4 junto. Degrau 12 |
| S16 | **Física com estado** entre quadros | **fica**, com aviso | ARQUITETO 3 §12: é a única simulação do formato; a spec diz isso; o editor ganha **Assar em chaves** |
| S17 | **AnimationState**: tracks, mix, `AnimationStateData`, máscara de ossos | **fica no runtime** | é do jogo e da Prévia (§1.4). Não vai ao arquivo. Q42 (animação por cima) é a única porta possível para o arquivo, e está aberta |
| S18 | **`inheritAnimation` / `baseAnimation`** do filho (decisão 63) | **fica no formato** | a entidade depende do `baseAnimation` (a hélice gira sozinha). `inheritAnimation` fica opcional, fora da tela da 1.0. A decisão 16 do Apêndice B **fecha como normativa** |
| S19 | **Compensation**; eixos Local · Pai · Mundo | **fica** | ferramenta que o Spriter não tem |
| S20 | Botão direito **volta à ferramenta anterior** | **fica**, consertado | defeito A7: o mesmo botão faz duas coisas conforme o pixel. Ganha porta no menu |
| S21 | **`+` / `−`** na ordem; `Ctrl+↑↓` | **fica** | as teclas já são as do Spriter |
| S22 | **Ver · Travar · Nome** em três colunas | **fica** | — |
| S23 | **Pastas** de slot e de osso (`folder`) | **fica** | pasta de **animação**: DEPOIS, é campo novo (regra 7) |
| S24 | **Separate X and Y** | **não se aplica** | já são linhas separadas |
| S25 | **Separate color and alpha** | **DESCARTA** | campo novo sem pedido dele |
| S26 | **Split bone** | **DEPOIS** | ferramenta pequena, não depende do modelo |
| S27 | **Selection history / groups** | **DEPOIS** | OURO 15 (seleções guardadas) |
| S28 | **Pixels** (encaixe da ferramenta no pixel) | **DEPOIS** | junto com o modo pixel art (F11 da lista única) |
| S29 | **Vários monitores** / painel em janela do sistema | **DESCARTA** | vetado por ele em 13/09 (C3) |
| S30 | Vocabulário do JSON (`slot`, `attachment`, `skin`) | **fica** | mudar as chaves não compra nada; a tela já fala português |
| S31 | Importador do Spine (§13.1) | **fica** | Setup → base; skins → peles. Sliders 4.3: conferir nomes (Apêndice B 9) |
| S32 | **Um esqueleto por arquivo** | **TRADUZ** | continua um esqueleto por `.bone`; o **projeto** é o `.bonez`. Os quatro "não se aplica" da L108–111/L472 da `O QUE AINDA NAO TEMOS` voltam a valer: **Export** (entregar só um corpo, P2), **esconder esqueleto**, **vários esqueletos**, **importar esqueleto de outro `.bone`** (E17) |

---

## 2. Os quinze blocos do Spine (`programa-novo/08`, `O QUE AINDA NAO TEMOS`)

| # | Bloco | Veredito | Tradução / justificativa | Degrau |
|:---:|:---|:---:|:---|:---:|
| D1 | **Caminho** (path): criar, editar, fechar, velocidade constante, inverter | **PORTA** | §7.8, §6.4 já têm. Um caminho é um anexo num slot do corpo: cabe. Ferramenta **Caminho** na barra, ícone com nome | 12 |
| D2 | **Caixa e máscara**: editar os cantos | **PORTA** | §7.6, §7.7. Conserta A3 (a tela manda usar a Malha). A ferramenta Malha passa a pegar os três tipos com vértices | 7 |
| D3 | **Sliders** | **PORTA** | ver S15. Conserta A4 | 12 |
| D4 | **Sequência de imagens**: criar, chave na região e na malha | **PORTA + TRADUZ** | §7.10, §9.6. O gesto é do Spriter/Aseprite: **arrastar a pasta numerada** (ou a folha) vira uma imagem animada (`COMO SE FAZ EFEITO` #1). 🗣️ como opção (G12) | 8 |
| D5 | **Eventos de áudio**: caminho, volume, painel, evento na cena | **PORTA + TRADUZ** | §8.6, §4.5, §2.8 já têm. O Spriter põe o som **na linha do tempo**: aqui o som **é** a chave de evento com ícone de alto-falante e prévia ao clicar. Resolve a contradição do `PLANO pasta do projeto:197` | 12 |
| D6 | **Física**: Simular, Reiniciar, Global, assar | **PORTA** (Simular, Reiniciar, assar) · **DESCARTA** (Global) | §6.5 e `physicsReset` existem; assar é Q28 🗣️ *"provavelmente sim"*. **Global** (vento no esqueleto inteiro) é API do jogo, não do arquivo | 12 |
| D7 | **Peles**: pastas, placeholders em lote, avisos, cor, não exportar | **TRADUZ** (lote, avisos) · **DESCARTA** (pastas, cor, não exportar) | "placeholders em lote" **é** o trocar a pasta inteira (I4). "Avisos" **é** a Janela de Problemas (regra 21). Pastas: a pilha Feitas/Ativas é lista plana, como o Character Map. Cor e não exportar: 🗣️ não (Q19) | 9 |
| D8 | **Curvas**: presets (Automático, Plano, Quicar), Favor, Store, alças que acompanham, zoom, copiar curva | **DEPOIS** | ferramenta pura, por chave; não depende do modelo. Quicar de verdade já está na lista de faltas desde a v8 | 12 |
| D9 | **Pesos**: Soldar, Trocar, copiar/colar, Direta, várias malhas | **DEPOIS** | ferramenta; pesos animáveis (F9) entram antes, no degrau 1 | 12 |
| D10 | **Folha**: Offset, Adjust, Sync, filtros, tocar sem interpolar, cadeado | **DEPOIS** | ferramenta. Adjust = `PROPOSTAS` #3; cadeado = #14 | 12 |
| D11 | **Métricas** | **DEPOIS** | pequeno; um painel só de leitura | 12 |
| D12 | **Fantasma e Árvore**: 5 + 5 faltas | **DEPOIS** (a maioria) · **DESCARTA** ("Keying" na Árvore) | o botão de chave na linha da Árvore é o semáforo de novo (S5): a chave nasce do gesto | 12 |
| D13 | **Exportar**: APNG, PSD, JPEG, vídeo, HTML que toca | **DEPOIS** (APNG, HTML) · **DESCARTA** (MP4/AVI, PSD) | MP4 já decidido: sem dependência, `ffmpeg` por fora. PSD de saída não é pedido. HTML que toca é o requisito E7 | 12 |
| D14 | **Atlas e importar**: ninepatch, desempacotar, importar projeto, importar dentro de esqueleto | **TRADUZ** (importar projeto) · **DEPOIS** (desempacotar, fundir) · **DESCARTA** (ninepatch) | "Import project" do Spine **é** E17: abrir outro `.bone` como corpo ou entidade. Fundir dois esqueletos num só: DEPOIS (Spriter cap. 35). Ninepatch é de interface de jogo, não de boneco | 10 |
| D15 | **Configurações, tela inicial, linha de comando** (unpack, info) | **DEPOIS** | pequeno | 12 |

### O que o Spine 4.3 trouxe

| O quê | Veredito | Tradução |
|:---|:---:|:---|
| **Janela de Problemas** com "consertar" | **TRADUZ** | é a **regra 21 com tela**: a barra de avisos que já existe (v8.5, com "Ir para") ganha o botão de consertar quando houver conserto. Degrau 11 |
| Assar regra (IK, transform) em chaves | **DEPOIS** | junto com assar a física |
| Conta no campo numérico (`120/2`) | **já existe** | `evalNumberExpression` |
| Pintar pesos em várias malhas | **DEPOIS** | ferramenta |
| Ordem de desenho animada **dentro de pasta** | **DESCARTA** na 1.0 | F11 (Q26): nenhum campo de efeito novo. A Ordem já tem pasta; a chave é por slot |
| Malha ligada em outro slot | **DESCARTA** na 1.0 | regra 7; sem pedido |
| Escala volumétrica no IK | **DESCARTA** | Q24: a IK fica como está |

---

## 3. O que o Spriter tem e ainda falta

Da lista das nove faltas (`O QUE O SPRITER TEM E NOS FALTA`) e dos "diferente" que G8 manda igualar *se fizer sentido*.

| # | Do Spriter | Veredito | Tradução / justificativa | Degrau |
|:---:|:---|:---:|:---|:---:|
| P1 | **Entity** (dona das animações) | **TRADUZ** | **corpo** com as suas animações (M8), **mais** a virada que o Spriter não tem (BASE §10: 🗣️ *"o Spriter começou essa ideia, mas não foi eficiente"*) | 4–5 |
| P2 | **Sub-entity** | **TRADUZ** | **entidade**: anexo `skeleton` que segue a imagem | 5–8 |
| P3 | **Character Map** (tabela imagem → imagem; pilha available/active) | **TRADUZ** | **pele** + colunas **Feitas/Ativas** (I7). Mais que o Spriter: a pele traz osso e regra (S7) | 9 |
| P4 | **Salvar a pilha num `.scms`** | **TRADUZ** | pele de fora = `.bone` só de `skins` com `rig` (I12). Botões **Exportar pele…** / **Importar pele…** | 9 |
| P5 | **Merge Active to New** · **Bake Active to Entity** | **TRADUZ** | Bake = **Promover pele → base** (I13). Merge = juntar as Ativas numa pele nova: DEPOIS | 9 / 12 |
| P6 | **Key All / Key Selected** | **TRADUZ** | Chavear tudo / Chavear já existem; viram **os** botões de proteger a pose (M6) | 6 |
| P7 | **Hierarquia por chave** na `mainline` (`bone_ref.parent`, `object_ref.parent`) | **TRADUZ** | chave `parent` (feita) + chave **`slot/bone`** com `offset` (F8, ARQUITETO 3 §6). O importador para de assar | 1, 7 |
| P8 | **Alt + arrastar** cria osso | **DESCARTA** | briga com o Linux (o dev do Spriter admitiu). 🗣️ **B** cria osso; Posar → Y; N livre (G1) | 7 |
| P9 | **Recorte por animação** (cap. 26) | **TRADUZ** | `animation.crop` (F16); magenta na cena; as duas opções na exportação (Q21) | 1, 10 |
| P10 | **Importar um projeto dentro de outro** (cap. 35) | **TRADUZ** | E17: abrir `.bone` como corpo ou entidade — o modo "entra como entity nova" do Spriter. Fundir dois esqueletos: DEPOIS | 10 |
| P11 | **Clone em outra escala** (cap. 32) | **DEPOIS** | ferramenta de linha de comando; o empacotador já escala imagem | 12 |
| P12 | **Paleta indexada** e **clone colorido** (caps. 27, 33) | **DESCARTA** | é de programa de desenho; Cor e Cor escura tingem o slot. Fora desde `POSSIBILIDADES:114` | — |
| P13 | **Papagayo lip sync** (cap. 17) | **DESCARTA** | dependência de programa de fora; a boca é troca de desenho ou sequência (D4). Se um dia entrar, é importar o `.dat` como chaves de anexo | — |
| P14 | **M + arrastar** move o 0,0 da animação | **DEPOIS** | `PROPOSTAS` #15; pequeno | 12 |
| P15 | **Variáveis e tags pela tela** (caps. 29, 30) | **PORTA** | §8.4, §8.5 já têm. 🗣️ G9: pela tela, com um jeito de desligar | 12 |
| P16 | **Som na linha do tempo** (cap. 16) | **PORTA** | ver D5 | 12 |
| P17 | **Action point com chave própria** (cap. 19) | **DESCARTA por ora** | 🗣️ *"vejo depois"* (D4, 10/09). No nosso modelo o ponto anda com o osso; quem precisa de ponto que anda sozinho põe um osso. Reabre se ele pedir |
| P18 | **`Z` / `Shift+Z`** (descendentes / ancestrais) | **igualado** | são `]` e `[` desde a v6.7. Trocar a tecla vira G7 |
| P19 | **`1` / `2`** chave anterior / seguinte | **DESCARTA** | `↑`/`↓` já fazem e não brigam com Q W E R T Y. Quem quiser troca em G7 |
| P20 | **Ctrl+D** cola o objeto em todas as chaves | **DESCARTA** | não precisa: o que nasce na base vale em todas (M3/M7). É o Spriter compensando não ter base |
| P21 | **Duplo clique na imagem abre o pivô** | **TRADUZ** | painel **Pivôs** (C4): a pasta inteira em grade, sem janela que tranca | 8 |
| P22 | **Reload All Images** | **existe** e cresce | Recarregar + **Trocar pasta de origem…** (I4) | 8 |
| P23 | **Copy/Paste Default Pivots** | **existe** | v8.4 |
| P24 | **Ctrl + clique** soma chave · **Ctrl + arrastar** clona | **TRADUZ** | G2: 🗣️ como no Photoshop | 6 |
| P25 | **Copy Z-order to all keyframes** | **TRADUZ** | G3: chave a chave, e não "apaga e grava em 0" | 8 |
| P26 | Arrastar uma chave move **só ela** | **TRADUZ** | G11: 🗣️ conferir no Spriter e seguir | 6 |
| P27 | **Spriter 2**: vídeo de referência com o tempo junto; Ctrl + roda escolhe a peça escondida; visibilidade como chave | **DEPOIS** | ferramentas; a visibilidade já é chave (`slot/visible`) | 12 |

---

## 4. Os pedidos de usuários nunca atendidos (OURO, `O QUE OS USUARIOS PEDEM`)

| # | Pedido | Veredito | Onde cabe |
|:---:|:---|:---:|:---|
| 2 | Animação dentro de animação | **TRADUZ** | é a **entidade** (degraus 1–8). O Spine disse "muito trabalho" em 2013; aqui é o coração |
| 3 | **Trajeto do movimento**, visível e editável | **DEPOIS** | ferramenta pura: o caminho de um osso ao longo de `t` é função das chaves. Ver: sim. Editar o trajeto arrastando: 1 lote |
| 8 | Emissor de partículas | **DEPOIS** | F10, degrau 12, 1ª fase fechada |
| 9 | Digitar número no vértice | **DEPOIS** | pequeno |
| 10 | Trocar de pai no meio | **já temos** | v12.6–v12.8 |
| 11 | Godot oficial | **DESCARTA por ora** | é runtime de motor: "programa primeiro" desde 09/09 |
| 13 | Deslocar chaves sem destruir | **DEPOIS** | Empurrar já faz metade |
| 14 | Pastas na linha do tempo | **DEPOIS** | junto com D10 |
| 15 | Seleções guardadas | **DEPOIS** | S27 |
| 16 | Trocar as teclas | **TRADUZ** | G7, degrau 11: tabela de troca na máquina, `keys.ts` lê dela |
| 17 | Zoom fino na linha do tempo | **DEPOIS** | pequeno |
| 18 | Alças de tamanho ajustável | **DEPOIS** | pequeno; preferência |
| 19 | Pressão da caneta no pincel | **DEPOIS** | `PointerEvent.pressure`, pequeno |
| 1, 5 | Linux; vários monitores | navegador já roda; monitores vetado | — |
| 6, 7, 12 | solo, marcadores, régua e guias | **já temos** | — |

---

## 5. Efeitos (`COMO SE FAZ EFEITO`, `07`)

| # | Ideia | Veredito | Tradução |
|:---:|:---|:---:|:---|
| 1 | Folha animada entra arrastando | **PORTA** | = D4 |
| 2 | Flash e pulso como gesto que grava chaves | **DEPOIS** | dois comandos no menu Animação |
| 3 | Efeito como arquivo próprio, encaixado | **TRADUZ** | **é a entidade**. Nada a mais |
| 4 | Tremor com semente que vira chaves | **DEPOIS** | só editor; anda para trás porque são chaves |
| 5 | Emissor sem estado | **DEPOIS** | F10, `BONE_particles`. O emissor **é** "uma imagem com relógio" num slot — cabe no modelo sem retoque |
| 6 | UV que corre, dissolve, distorção | **DESCARTA** na 1.0 | F11; pedem shader que nem todo runtime tem |
| — | Tremor de câmera | **DESCARTA** | é do jogo (evento avisa) |
| — | Colisão, fluido, partícula empurrando partícula | **DESCARTA** | não são função pura do tempo (R1). Saída: assar em folha |

---

## 6. Ideias de fora (Rive, Live2D, Harmony, Cascadeur, Moho)

| Ideia | Veredito | Por quê |
|:---|:---:|:---|
| Máquina de estados, listeners, data binding, scripting, layouts (Rive) | **DESCARTA** | dependem da entrada do jogo ou de código: não passam em R1. São do jogo |
| Joystick / Parameter Controller (Rive, Live2D 5.2) | **DEPOIS** | o parâmetro já existe; o controle na cena é só editor; a grade 2D é `BONE_param_grid` (Apêndice B 2) |
| Breakdown que favorece uma chave (Harmony 25) | **DEPOIS** | gesto barato; sai chave comum |
| Marionete gravada com o mouse (Cartoon Animator) | **DEPOIS** | sai chave |
| Partícula como camada copiada com atraso (Moho 14.4) | **DEPOIS** | é gesto de animador: copiar o membro com atraso; sai chave |
| Offscreen por grupo; 15 blends + 5 alfas (Live2D 5.3) | **DESCARTA** na 1.0 | F11; regra 7 |
| IA: inbetweening, autoposing, ToonCrafter, Animate Anyone | **DESCARTA** | pixels por quadro não são ossos; e não é pedido dele |
| Grade em perspectiva (ideia dele) | **DEPOIS** | F21: na máquina, não no arquivo; Shift trava nas diagonais (Q25b) |

---

## 7. Os defeitos (não são triagem: são conserto)

| # | Defeito | Degrau |
|:---:|:---|:---:|
| A1, A2 | rascunho falha calado; "Cancelar" apaga | 11 |
| A3 | caixa e máscara citam a ferramenta errada | 7 |
| A4 | regra Comando nasce vazia sem aviso | 9 |
| A5, A6 | Inércia `1` (é `0,5`); Escala de referência `1` (é `100`) | 9 |
| A7 | botão direito com dois sentidos | 7 |
| A8 | função sem tecla nem manual | em todos |
| A9 | o manual diz "funciona" onde não funciona (lápis) | 9, 13 |
| A10 | prova que mede painel vazio | 11 (medição) |
| novo | `clipping` com auto-interseção: a spec manda avisar (L2, §7.7) e ninguém avisa (`O QUE AINDA NAO TEMOS` L294) | 2 |

---

## 8. A conta

| Veredito | Quantos | Onde estão |
|:---|---:|:---|
| **TRADUZ** | 27 | S2, S4, S6, S32; D4, D5, D7, D14; P1–P7, P9, P10, P21, P24–P26; OURO 2, 16; Efeito 3; Janela de Problemas |
| **PORTA** | 8 | D1, D2, D3, D4, D5, D6; P15, P16 |
| **fica** (ferramenta do Spine) | 18 | S7–S10, S12–S14, S16–S23, S30, S31 |
| **DESCARTA** | 22 | S1, S3, S5, S11, S25, S29; D6 Global, D7 (pastas, cor, exportar), D12 Keying, D13 (MP4, PSD), D14 ninepatch; 4.3 (ordem em pasta, linked em outro slot, IK volumétrica); P8, P12, P13, P17, P19, P20; OURO 11; Efeito 6, câmera, colisão; Rive, Live2D 5.3, IA |
| **DEPOIS** | 30 | D8–D13, D15; S26–S28; P5 Merge, P11, P14, P27; OURO 3, 8, 9, 13, 14, 15, 17, 18, 19; Efeito 2, 4, 5; joystick, breakdown, marionete, Moho, grade |
| **já existe** | 8 | conta no campo, P18, P22, P23, OURO 6, 7, 10, 12 |

**O que a triagem diz, em três linhas:**

1. **Nada do Spine entra copiado.** As seis peças de fluxo que eram cópia
   (modo, pose única, Adjust, Auto Key, semáforo, `default` por baixo) saem ou
   viram outra coisa. As ferramentas ficam, e é isso que a régua R3 pede.
2. **O Spriter entra traduzido, não copiado.** Entity vira corpo **com
   virada**; character map vira pele **com osso**; `mainline` vira duas
   chaves (`parent`, `slot/bone`). Em cada uma o nosso faz mais que o dele —
   🗣️ *"melhor que os dois"*.
3. **Trinta itens são ferramenta pura e esperam o glacê.** Nenhum deles
   depende do modelo novo, e nenhum deles deve entrar na frente dele.
