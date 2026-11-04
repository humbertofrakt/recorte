# A aba das entidades conferida — lote 4 (v30.6) — 06/10/2026

Rodada 39, lote 4, "ligar para cima". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.6** (o "Sobre" diz v30.6) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 09h34 a 09h39, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-39-conferida/lote4/` (8) |
| Material | o herói, a `espada`, o `mecha` e o `poder5` numa **pasta em memória** (seletor do Windows trocado por falso). Abri por *Novo projeto* → pasta → *Abrir heroi.bone* |
| Fora, como pedido | Prévia sem o mecha em volta, mecha parado, entidade duplicada (-2) sem aviso: **não contei** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (1, 3) | **3** (2, 4, 5) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 2 | a cena muda e segue a animação; não consegui ler "por trás e pela frente" |
| 4 | volta sem fim recusada com o porquê; "fundo demais" não consegui provar |
| 5 | mover o teste, a dica e o Salvar vistos; a linha vermelha não consegui provocar |



## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O painel *Animações* (embaixo, à direita) encolhe a quase nada** quando a aba *Entidades* fica comprida: com o herói, a espada, o `poder5` e o `mecha`, sobra só o cabeçalho (*Animações · Skins · Regras · Histórico*), sem a lista de animações. Antes (com a aba curta) a lista aparecia com `idle`, `walk` e `attack` | 5 | `B1_mover_teste` |
| 2 | *Pequeno.* A **espada reaparece como um segundo slot "espada"** depois de eu arrastá-la para a cena (era a minha intenção: "pôr a entidade na cena"), mas o cartão do projeto mostra os **dois slots com o mesmo nome de entidade** (`weapon` e `espada`), e quem lê rápido acha que o herói tem duas espadas | 5 | `B1_mover_teste` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Arrastar o cartão AQUI até um mecha da Prateleira pergunta o slot; o boneco entra nele em teste: o mecha aparece por fora, tracejado, EM VOLTA | **vi funcionar** | Arrastei o cartão `heroi` (marca `text/x-recorte-para-cima`) até o `mecha`: abre *"Em que slot de mecha entra?"* com cinco opções (*body, arm, hand, weapon, head*, cada uma com *"O de fora entra no lugar da imagem …"*). Escolhi `body`: *"Heroi entrou em mecha, no slot body: teste. Heroi não leva mecha."* A aba passa a mostrar o cartão **`mecha` de borda tracejada, TESTE, "anima: parada"** por fora, com `body` e dentro dele o cartão `heroi` (AQUI), com `weapon`/`espada`; o mecha ainda traz a sua própria linha `weapon · espada · "anima: a de quem recebe"` | `A1_em_teste` |
| 2 | Com Na cena, a cena desenha o mecha por trás e pela frente do boneco; o boneco se apoia no banco sem que as chaves dele mudem | **pela metade** | Com *Na cena* ligado a cena **muda**: o herói **sobe** (apoia no banco), aparecem **peças do mecha** (uma cabeça e uma espada grande) sobre e ao lado do herói; nos quadros 15 e 30 do `idle` o herói **gira junto** e o mecha continua no lugar. **Não consegui ler** com certeza o que é "por trás" e o que é "pela frente": as peças se sobrepõem. **As chaves do herói:** não nasceu linha nova na linha do tempo; *"A montagem de teste está na cena. Ela não entra na animação."* | `A2_na_cena` · `A2_comparacao` |
| 3 | Tirar de volta: botão direito ou menu Entidades; `Ctrl+Z` desfaz | **vi funcionar** | **Botão direito** no cartão `mecha`: item *Tirar de volta*; *"Heroi saiu de mecha (era teste)"*, a aba volta ao herói sozinho. **`Ctrl+Z`**: *"Desfeito: Tirar de volta, o teste"* e o `mecha` volta. **Menu Entidades**: *Tirar de volta* também existe e funcionou (*"Heroi saiu de mecha (era teste)"*). O menu traz *Pôr o projeto dentro de…* | `A3_tirou` |
| 4 | Volta sem fim e fundo demais são recusados no arrasto, com o porquê no rodapé | **pela metade** | **Volta sem fim:** arrastei o cartão `heroi` até a `espada` da Prateleira: *"espada já está dentro de heroi. Pôr heroi dentro de espada faria uma volta sem fim."*; nada mudou. **Fundo demais: não consegui provar** — não monto uma cadeia funda (só há três entidades: espada, mecha, poder5) | `A4_volta` · `B3_hero_sobre_espada` |
| 5 | As notas do doc 29: mover o teste de slot arrastando funciona; ao recusar, a linha fica vermelha com o porquê; a dica de "Pôr em teste neste slot…" fala de imagem OU entidade; Salvar com problemas avisa | **pela metade** | **Mover de slot: funciona.** Com `poder5` em teste no `weapon`, arrastei o cartão até a linha `espada`: *"Poder5 passou do slot weapon para o espada: teste."* **Linha vermelha: não consegui provocar** (tentei a espada sobre o próprio slot, o mecha sobre o `weapon` e o teste sobre o próprio slot; as linhas ficam sem cor de recusa). **A dica:** *"Com uma imagem **ou** uma entidade escolhida na cena: …"* ✓. **Salvar com problema:** abri o herói sem a `espada.bone` (1 aviso) e salvei: *"Salvar: parou antes de gravar, por 1 problema no arquivo: /skins/…/sword/uri: nested skeleton "espada.bone" was not provided… Nada foi gravado"* ✓ (avisa, e não grava) | `B1_mover_teste` · `C1_salvar_com_problemas` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O aviso do Salvar fala em inglês (*"nested skeleton … was not provided; placeholder treated as empty (spec 7.11)"*) e cita um caminho interno (`/skins/…/sword/uri`). Avisa, mas o Humberto não entende |
| C2 | *"Heroi não leva mecha."* no fim do rodapé de ligar para cima: lido de pressa parece uma recusa, e foi um sucesso |
| C3 | O cartão `mecha` de borda tracejada **engole o cartão do herói** (o AQUI vira filho do mecha): a aba fica muito mais alta, e a lista de Animações some (defeito 1) |
| C4 | O mecha mostra *"anima: parada"* e, dentro, a linha própria `weapon · espada · anima: a de quem recebe`: duas "espadas" na mesma aba |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo | pasta em memória | Salvar e abrir numa pasta de verdade |
| Arrasto | arrasto de verdade interceptado por protocolo | o arrasto com a mão |
| "Por trás e pela frente" | olhei fotos | que o mecha passa por trás **e** pela frente do herói, peça a peça |
| "Fundo demais" | **não conferi** | o limite de níveis |
| "Linha vermelha" | **não consegui provocar** | que a linha fica vermelha com o porquê |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
