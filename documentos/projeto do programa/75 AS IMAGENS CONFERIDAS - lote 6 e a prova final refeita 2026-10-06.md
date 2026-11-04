# As imagens conferidas — lote 6 e a prova final refeita (v34.0) — 06/10/2026

Rodada 44, lote 6. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.0** (o "Sobre" diz v34.0; servi o zip `recorte v34.0 2026-10-06.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 23h20 a 23h25, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-44-conferida/lote6/` (15) |
| Material | **o mesmo do doc `71`**: pastas no **armazenamento privado do Chrome** (handles reais, **não** do Windows): `mao` (13 PNG de verdade), `mao-invertida` (as mesmas, invertidas, **menos `_0007_Camada-4`**) e `heroi-pasta` (19 peças do herói que **cortei do atlas** — sem a `arm` —, `armas/` com os **4 machados de verdade**, `inverno/` com **8 peças que pintei de azul**). Herói de exemplo. **Nada foi salvo no disco.** Instrumentei `alert`/`confirm`/`prompt`: **nenhuma** foi chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 3, 4) | **2** (2, 5) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 2 | a skin importada **veste sozinha** (*"está vestida, no topo de Ativas"*), **mas a cabeça some**: o rosto e o cabelo (`face`, `hair`) ficam **invisíveis**, sem aviso. Desligar e ligar a skin não conserta |
| 5 | o rodapé **diz o tamanho** (*"1275 × 1027 px"*) e **como ajustar** (*"mude a Escala na ficha"*), **mas a metade do "como ajustar" fica cortada na tela**: o rodapé mostra *"…Ela entra no tamanho dela, 127…"*; a frase inteira só está na dica (o texto de passar o mouse) |

## A PROVA FINAL, refeita — trocar a arma e vestir a roupa de inverno, só pela tela

Do herói de exemplo, `heroi-pasta` ligada (o preparo, **não contado**).

| # | Passo | Gestos | O que o programa disse |
|:---:|:---|:---:|:---|
| 1 | **A arma:** botão direito na espada → a grade abre em ***todas*** (com ***"Laranja: a de agora"***) → clique no machado | **2** | ***"weapon volta a mostrar a imagem "armas/_0000s_0001_Camada-634-copiar", pelo pivô dela (foi para a base). Ela entra no tamanho dela, 1275 × 1027 px, como no Spriter e no Spine: para caber, mude a Escala na ficha."*** (na tela o fim fica cortado). **O machado vem do tamanho da tela** (por desenho do programa, e explicado) |
| 2 | **O ajuste que o rodapé manda:** *Escala X* → `Ctrl+A`, `0,08`, `Enter`; *Escala Y* igual | **8** (2 cliques, 2 `Ctrl+A`, 2 digitações, 2 `Enter`) | ***"Chave em 0,00 s: Imagem weapon: Escala X."*** e ***"…Escala Y."***: **com a animação `idle` aberta o ajuste virou chave**, e **a Posição X da ficha passou de 35 para 0** (não sei dizer por quê). O machado coube na mão |
| 3 | **A roupa:** menu *Skins* → *Fazer a skin de uma pasta…* → **lista** com `armadura`, `armas`, `inverno` → escolher `inverno` → *Fazer a skin* | **5** (2 menus, **2** para escolher na lista, 1 *Fazer a skin*) | ***"Skin "inverno": A pasta "inverno" cobre 8 desenhos; 12 continuam os de baixo."*** A skin nasceu **ligada** e o **herói ficou azul**, **na hora** |

### A conta

| O que | Quanto |
|:---|:---:|
| Gestos no total | **15** (2 + 8 + 5) |
| **Sem o ajuste da escala** (a arma como entra) | **7** (2 + 5) |
| Em v33.6 | 13 gestos, **7 sem o tropeço**, e um tropeço **que fechava a janela** |
| Tropeços **do programa** | **1 que pesa** (o machado vem do tamanho da tela e o fim do aviso fica cortado), **1 dúvida** (a *Posição X* 35 → 0 depois de ajustar a escala numa animação aberta) |
| O tropeço do campo *Pasta* | **sumiu**: agora é uma lista, já com a pasta da peça escolhida (`armas`), **sem digitar nada** |
| Tropeços meus | nenhum |

*(Os 2 gestos da lista são o de abrir e o de escolher; o campo abre já em foco e eu **pus o valor** `inverno` sem abrir a caixa nativa da lista: a contagem é a de um usuário, o gesto foi o meu.)*

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A skin importada deixa a cabeça invisível.** *Exportar skin* (**4.095 bytes**) → *Apagar skin* → *Importar skin…*: o rodapé diz ***"inverno.bone: a skin "inverno" entrou nesta base, e está vestida, no topo de Ativas."*** e o corpo, as pernas e o antebraço vestem; **o rosto e o cabelo somem** (a cabeça fica sem desenho), **sem nenhum aviso** (a barra diz *"Nenhum aviso"*). A skin **recém-feita da pasta** tinha o rosto azul (`E2`). *Desligar* a skin traz o rosto de volta e *ligar* o tira de novo; *Recarregar a pasta* (*"A pasta heroi-pasta está igual"*) não mexe. A lista *"Nesta skin"* mostra as 8 (*face → inverno/face*, *hair → inverno/hair*…). **Não sei a causa** | 2 | `G0_vestido_antes_e_depois_de_importar` · `I3_ligada_desligada_religada` · `J0_depois_de_recarregar_a_pasta` |
| 2 | **O aviso do tamanho vem cortado na tela.** No rodapé aparece *"…Ela entra no tamanho dela, 127…"*; o *"para caber, mude a Escala na ficha"* só está na dica (o texto completo tem 230 caracteres para uma faixa de ~1.000 px). Quem não passa o mouse **não lê como ajustar** | 5 | `D0_rodape_cortado` |
| 3 | *Dúvida.* **Ajustar a escala com uma animação aberta cria chave** (*"Chave em 0,00 s: Imagem weapon: Escala X"*), **e a Posição X da ficha passou de 35 para 0** depois dos dois ajustes. O machado ficou **perto da mão**, não conferi se mudou de lugar. Pode ser o comportamento esperado de editar com uma animação aberta | prova | `D1_machado_ajustado` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Skins → Fazer a skin de uma pasta*: o campo Pasta é uma **LISTA** das pastas; escolher `inverno` → *"cobre 8 desenhos"*; o herói veste na hora. Sem digitar nada | **vi funcionar** | A janela traz uma **lista** (***armadura · armas · inverno***), com ***armas*** já escolhida (a pasta da peça que estava escolhida) e o foco no campo. Com `inverno`: ***"Skin "inverno": A pasta "inverno" cobre 8 desenhos; 12 continuam os de baixo."*** A skin ficou ligada (em *Feitas* e no topo de *Ativas*) e o **herói ficou azul na hora** | `E0_fazer_skin_lista` · `E1_escolheu_inverno` · `E2_heroi_vestido` |
| 2 | *Exportar skin*, apagar, importar: a skin importada **VESTE sozinha** (*"está vestida, no topo de Ativas"*) | **pela metade** | **Exportar:** ***"Skin "inverno" gravada com só os desenhos; ela exige de quem a usar 8 ossos e 8 slots com estes mesmos nomes. 8 imagens soltas não vão junto…"*** (`inverno.bone`, 4.095 bytes). **Apagar:** pergunta (***"Ela veste 8 slots… Ctrl+Z devolve tudo."***) e apaga; o herói voltou ao de antes (7.018 px de diferença). **Importar:** ***"inverno.bone: a skin "inverno" entrou nesta base, e está vestida, no topo de Ativas."*** — **veste sozinha** ✓ (sem o clique no olho que o v33.6 pedia; 6.998 px mudaram). **Mas a cabeça some:** defeito 1 | `F0_skin_apagada` · `F1_importada_vestida` · `G0_vestido_antes_e_depois_de_importar` |
| 3 | A dica do *Trocar pasta* não promete *"um só desfazer"*; o rodapé ensina a voltar | **vi funcionar** | **A dica:** ***"…As trocas de imagem voltam com Ctrl+Z; a pasta não: para voltar, aponte a pasta de antes…"*** (a promessa de antes sumiu). **O rodapé**, depois de trocar `mao` por `mao-invertida` (projeto novo com 3 imagens): ***"A pasta mao-invertida virou a origem: nenhuma imagem trocada; 2 de mesmo nome: a cena mostra as de lá; 1 não existe lá e ficou como estava (_0007_Camada-4). Para voltar, Trocar pasta de origem com a pasta de antes."*** A cena mudou **27.211 pixels** (como no doc `71`) | `A0_depois_de_trocar_pasta` |
| 4 | Grade *"todas"*: legenda escrita *"Laranja: a de agora"* | **vi funcionar** | Botão direito na espada: a grade abre em ***todas*** (aceso) com os cabeçalhos ***raiz · armadura/ · armas/ · inverno/ · entidades*** e **o texto *"Laranja: a de agora"*** (classe `grade-imagens-legenda`) **escrito dentro da grade**, não só na dica | `C1_grade_da_espada` |
| 5 | Trocar a espada pelo machado: a imagem entra no tamanho dela e o rodapé diz o tamanho e como ajustar (*Escala* na ficha) | **pela metade** | O rodapé diz ***"…Ela entra no tamanho dela, 1275 × 1027 px, como no Spriter e no Spine: para caber, mude a Escala na ficha."*** — **diz o tamanho e como ajustar** — e a imagem **entra do tamanho dela**: cobre a tela inteira (`C2`). **Na tela o rodapé mostra só "…Ela entra no tamanho dela, 127…"**: defeito 2. Com a escala `0,08` o machado coube | `C2_machado_na_mao` · `D0_rodape_cortado` · `D1_machado_ajustado` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A lista de pastas já abre na pasta da peça escolhida** (`armas`: **creio** que por causa da peça escolhida, que era o machado; não confirmei a regra): quem quer `inverno` ainda precisa escolher |
| C2 | O rodapé do **Trocar pasta** e o da **ligação da pasta** ganharam a frase ***"Para voltar, Trocar pasta de origem com a pasta de antes."***: o remédio **está escrito** |
| C3 | O tamanho que o rodapé fala (*"1275 × 1027 px"*) é o **da imagem**; o herói tem cerca de 110 × 241 px: nenhuma frase **compara** os dois, e é isso que mostra que **não cabe** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As pastas | **armazenamento privado do Chrome** (handles reais, **não** do Windows) | abrir uma pasta do disco pelo seletor do Windows |
| A arte da prova | **eu** cortei as peças do herói do atlas (sem a `arm`) e **pintei** as 8 de azul; machados reais de `exemplo/game/armas` | a roupa **verdadeira** do herói |
| A escolha na lista | pus o **valor** `inverno` no campo e disparei a mudança | o clique na lista nativa do navegador (o Chrome desenha a caixa da lista fora da página) |
| *Exportar/Importar skin* | seletores trocados por arquivos no mesmo armazenamento | a caixa de salvar do navegador |
| *Desfazer* | **não** conferi o `Ctrl+Z` desta vez | `Ctrl+Z` de *Fazer a skin*, de *Apagar skin* e do ajuste de escala |
| O rodapé inteiro | li o texto pela **dica** (o `title` do rodapé) | que a dica **aparece** com o mouse |
| A causa da cabeça sumida | **não** investiguei no código | por que só `face` e `hair` |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
