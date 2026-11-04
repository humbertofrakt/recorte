# As imagens conferidas — lote 7 e a prova final refeita de novo (v34.4) — 07/10/2026

Rodada 44, lote 7. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.4** (o "Sobre" diz v34.4; servi o zip `recorte v34.4 2026-10-07.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 03h05 a 03h07, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-44-conferida/lote7/` (14) |
| Material | **o mesmo dos docs `71` e `75`**: `heroi-pasta` no **armazenamento privado do Chrome** (handles reais, **não** do Windows): 19 peças do herói **cortadas por mim do atlas** (sem a `arm`), `armas/` com os **4 machados de verdade** e `inverno/` com **8 peças que pintei de azul**; herói de exemplo. Os seletores de salvar e abrir arquivo devolvem arquivos no mesmo armazenamento. **Nada foi gravado no disco.** Nenhuma caixa nativa do navegador foi chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (1, 3) | **1** (2) | 0 | 3 (+ a prova final, linha 4) |

| Linha | Por que pela metade |
|:---:|:---|
| 2 | o rodapé **ensina inteiro** (*"entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga"*): essa parte **cabe na tela**; **só o fim** (*"(foi para a base). Arquivo não salvo."*) é cortado. *"Cabe inteiro"* **não** se confirma ao pé da letra |

## A PROVA FINAL, refeita de novo — trocar a arma e vestir a roupa de inverno, só pela tela

Do herói de exemplo, `heroi-pasta` ligada (o preparo, **não contado**).

| # | Passo | Gestos | O que o programa disse |
|:---:|:---|:---:|:---|
| 1 | **A arma:** botão direito na espada → a grade abre em *todas* → clique no machado | **2** | ***"weapon: entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga (foi para a base)."*** — a imagem **entra enorme** (como é) e o rodapé **diz o remédio** |
| 2 | **Caber:** menu *Imagens* → *Caber no lugar da antiga* | **2** | ***"weapon cabe no lugar da antiga: escala × 0,0615 (foi para a base)."*** O machado **ficou do tamanho da espada**, na mão |
| 3 | **A roupa:** menu *Skins* → *Fazer a skin de uma pasta…* → lista → `inverno` → *Fazer a skin* | **5** (2 menus, 2 para escolher na lista, 1 *Fazer a skin*) | ***"Skin "inverno": A pasta "inverno" cobre 8 desenhos; 12 continuam os de baixo."*** A skin ligada e o herói **azul, na hora** |

### A conta

| O que | Quanto |
|:---|:---:|
| Gestos no total | **9** (2 + 2 + 5) |
| Em v34.0 | 15 (e **7** sem o ajuste da escala, que eram **8** gestos: agora o ajuste é **2**) |
| Em v33.6 | 13 |
| Tropeços **do programa** | **nenhum** |
| Tropeços meus | nenhum |

*(Os 2 gestos de escolher na lista são o de abrir e o de escolher; eu pus o valor `inverno` no campo, sem abrir a caixa nativa da lista: a contagem é a de um usuário, o gesto foi o meu.)*

## Os defeitos

Nenhum que pare o uso. Só notas:

| # | Nota | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **O rodapé do machado ainda é cortado no fim**: 132 letras = **955 px** para uma faixa de **777 px**: na tela termina em ***"…Caber no lugar da antiga (foi para…"***. O que ensina **está à vista**; o *"Arquivo não salvo."* e o fim do parênteses, **não** | 2 | `B2_rodape` |
| 2 | *Pequeno.* **O aviso do *Importar* é cortado e começa com letra minúscula.** Com a base **sem o slot `hair`** (apaguei o desenho `hair` antes), o rodapé diz ***"inverno.bone: a skin "inverno" entrou nesta base, e está vestida, no topo de Ativas. esta base não tem slot "hair": o que de…"***: **"esta"** em minúscula depois do ponto, e o **"o que depender disso não aparece"** **não se lê** (168 letras: 1.177 px numa faixa de 870). **O que ficou de fora (o slot) está à vista**; a consequência, não | 1 | `G1_rodape_importar` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Skin feita da pasta `inverno` → exportar → apagar → importar: o herói veste **COM rosto e cabelo**; se algo fica de fora, a frase do *Importar* avisa | **vi funcionar** | Fiz a skin da pasta `inverno` (***"cobre 8 desenhos"***) e o herói **vestiu** (***inverno8*** ligada). **Exportar** (***"Skin "inverno" gravada com só os desenhos; ela exige… 8 imagens soltas não vão junto…"***) → **Apagar** (pergunta e apaga; o herói voltou ao de antes: **7.699 px** mudaram) → **Importar:** ***"inverno.bone: a skin "inverno" entrou nesta base, e está vestida, no topo de Ativas."*** **Comparei o herói de depois com o de antes de exportar: 0 pixels de diferença** (60.000 px de recorte): **o rosto e o cabelo voltam**, a malha igual. **Era o defeito do doc `75` (a cabeça sumia): resolvido.** Barra ***"Nenhum aviso"***. **Quando algo fica de fora:** apaguei o desenho `hair`, apaguei a skin e importei de novo: ***"…e está vestida, no topo de Ativas. esta base não tem slot "hair": o que depender disso não aparece."*** e a barra ***"1 aviso — ver"*** (a janela de apagar já dizia ***"Ela veste 7 slots"***, um a menos). Defeito 2 | `E0_heroi_vestido` · `F0_importada_vestida` · `G0_importar_sem_o_cabelo` · `G1_rodape_importar` |
| 2 | Trocar a espada pelo machado: o rodapé cabe inteiro (*"entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga"*) | **pela metade** | Botão direito na espada → *todas* → `armas/_0000s_0001_Camada-634-copiar`: rodapé ***"weapon: entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga (foi para a base). Arquivo não salvo."*** (**a frase pedida, e mais**). **Na tela** aparece ***"weapon: entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga (foi para…"***: **a instrução inteira cabe**; só o fim é cortado (defeito 1). A imagem **entra enorme**, como era a intenção | `B1_machado_na_mao` · `B2_rodape` |
| 3 | *Imagens → Caber no lugar da antiga* (menu e grade): o machado fica do tamanho da espada; um `Ctrl+Z` desfaz | **vi funcionar** | **Pelo menu *Imagens*** (a dica diz ***"Muda a escala do desenho escolhido para ele ficar do tamanho do que saiu na última troca"***): ***"weapon cabe no lugar da antiga: escala × 0,0615 (foi para a base)."*** A ficha foi de **Escala 1 / 1** para **0,0615 / 0,0615**; **a Posição X ficou em 35** (**não** mexeu no lugar, ao contrário do ajuste à mão do doc `75`); o machado ficou do tamanho da espada, **na mão**. **Pela grade do botão direito** (num desenho do machado): o item ***"Caber no lugar da antiga"*** está lá (entre *Em todas as skins* e *Marcar como slot…*) e dá **o mesmo número** (× 0,0615). **`Ctrl+Z`**: ***"Desfeito: Caber no lugar da antiga."*** e a escala **volta a 1 / 1**; **`Ctrl+Y`** refaz (0,0615) | `C0_depois_de_caber` · `C1_rodape_caber` · `D0_grade_do_machado` · `D1_depois_de_caber_pela_grade` |
| 4 | PROVA FINAL: trocar a arma e vestir a roupa de inverno; conte os gestos | **feita** | Ver a prova acima: **9 gestos, nenhum tropeço** | `B1_machado_na_mao` · `C0_depois_de_caber` · `E1_tela_vestido` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O ajuste da escala passou de **8 gestos** (digitar `0,08` em X e em Y, que ainda **gravava chave** numa animação aberta, doc `75`) para **2** (um item de menu) **que escreve o número e grava na base** (*"foi para a base"*): o rodapé diz *"foi para a base"* (e **não** *"Chave em 0,00 s"*), e a **Posição X** não mudou |
| C2 | O `Ctrl+Z` desfaz **o *Caber* inteiro** (as duas escalas num passo) |
| C3 | O rodapé **do *Importar*** agora **diz o que fica de fora** (*"esta base não tem slot "hair""*), com o número no *Apagar* (*"veste 7 slots"*): é o que o pedido pedia |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As pastas | **armazenamento privado do Chrome** (handles reais, **não** do Windows) | abrir uma pasta do disco pelo seletor do Windows |
| A arte da prova | **eu** cortei as peças do herói do atlas e **pintei** as 8 de azul; machados reais de `exemplo/game/armas` | a roupa **verdadeira** do herói |
| A escolha na lista | pus o **valor** `inverno` no campo e disparei a mudança | o clique na lista nativa do Chrome |
| *Exportar/Importar skin* | seletores trocados por arquivos no mesmo armazenamento | a caixa de salvar do navegador |
| *Caber* | só **um** machado (`…634-copiar`) | outras imagens; imagens **menores** que a antiga (crescer?) |
| O que fica de fora | **um** caso (o slot `hair`) | um osso que falta, uma imagem que falta |
| A malha com pesos | **não** abri a aba *Malha e pesos* (a igualdade pixel a pixel é do herói **desenhado**) | que os pesos voltam |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
