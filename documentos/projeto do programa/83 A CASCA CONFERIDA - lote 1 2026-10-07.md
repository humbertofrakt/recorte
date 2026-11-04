# A casca conferida — lote 1, a tira de abas, a faixa de baixo e o rodapé (v34.8) — 07/10/2026

Rodada 47, lote 1. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.8** (o "Sobre" diz v34.8; servi o zip `recorte v34.8 2026-10-07.zip`, extraído fora da pasta; o zip apareceu às 04h12) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 04h13 a 04h30, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote1/` (12) |
| Material | o herói de exemplo e a animação `idle`. **Nada foi salvo.** Nenhuma caixa nativa foi chamada. **O `npm run medir` roda sobre o código-fonte do editor (`editor/`), não sobre o zip**: ver a linha 5 |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 2, 3) | **2** (4, 5) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 4 | a **ficha rápida cabe inteira** em 720 e o **botão devolve a Árvore** (de 80 para 282 px); **mas** com a ficha aberta a Árvore fica com **80 px: uma linha só, cortada**; e a **dica do botão** diz só ***"Recolher: Propriedades"*** (o que diz *"O espaço foi para o outro painel"* é o **rodapé**, depois do clique) |
| 5 | rodei o `npm run medir` **duas vezes**: a 1ª quebrou, a 2ª deu **81 de 90** na altura (**o mesmo número de antes, não subiu**); mas **não foi com a casa vazia**: as portas do `medir` estavam presas por outro processo. **O número não vale: peço que quem fecha a rodada o meça de novo** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A dica do botão de recolher não diz que devolve a Árvore.** Em 720 o botão da ficha tem a dica ***"Recolher: Propriedades"***; depois de recolhido, ***"Abrir: Propriedades"***. A frase que explica (***"Propriedades: recolhido. O espaço foi para o outro painel"***) **só aparece no rodapé, depois do clique**. O pedido era *"a dica diz"* | 4 | `G1_720_propriedades_recolhida` |
| 2 | **Em 720 a Árvore, com a ficha aberta, só mostra uma linha, cortada** (80 px de altura: a tira de abas, a barra *Novo / Duplicar / Apagar / Buscar* e meia linha). Para ver os ossos é preciso recolher a ficha. *(É o desenho pedido: a ficha rápida cabe inteira e a Árvore fica com o que sobra, que aqui é quase nada.)* | 4 | `G2_720_ficha_rapida_com_osso` |
| 3 | **`npm run medir` não é confiável com outro chat rodando.** A 1ª tentativa (04h17) **começou com as portas 5192 e 9336 ocupadas por outro processo** e a saída parou no meio da lista; a 2ª (04h26) **quebrou** com ***"A medição não rodou: ReferenceError: __m is not defined"*** (a queda ficou em `backup/provas-quedas/medir/2026-10-07_042739_a-medicao-nao-rodou/`); a 3ª (04h27 a 04h29) terminou (a que a linha 5 chama de *(2)*). Ver a linha 5 | 5 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | A tira de abas da coluna fica numa fileira só, com *»* para as que não cabem (não mais 3 fileiras de 103 px) | **vi funcionar** | Em **1920×1080** e em **1280×720**: **cada tira tem 37 px de altura e uma fileira só**. A da direita de cima mostra ***Imagens*** e ***Entidades*** e um ***»*** com a dica ***"Mais 5 abas: Pivôs, Malha e pesos, Partículas, Exibição, Prévia. Clique para escolher uma"***; a de baixo, ***Animações*** e ***Skins*** e ***"Mais 2 abas: Regras, Histórico…"***. **Clicando o *»*** abre a lista com as 5 e **escolhendo *Malha e pesos*** ela passa a ser a aba **ativa** e **aparece na tira** | `A0_tiras_1920` · `A1_tiras_1280` · `A2_menu_das_abas` · `A3_depois_de_escolher` |
| 2 | As abas da faixa de baixo ficam na linha do tocador: em 1080 a folha mostra 4 linhas de chave (eram 3); em 720, 1 (era 0) | **vi funcionar** | **As abas *Linha do tempo* e *Curvas*** estão **na mesma fileira dos botões do tocador** (⏮ ⏪ ◂ ▶ ▸ ⏩ ⏭ 🔁). Com a animação `idle` e *Detalhes* aberto, **contei as linhas de chave inteiras na folha**: **em 1080: 4** (*Rotação* do `torso`, *Posição Y* do `hips`, *Escala X* e *Escala Y* do `head`); **em 720: 1**. *(Sem *Detalhes* a folha mostra só o *Resumo* e a trilha da entidade.)* | `D0_detalhes_1080` · `D1_detalhes_720` · `B1_faixa_de_baixo_720` |
| 3 | O rodapé em 1280 não corta com *"…"*: as três partes se leem (ferramenta, estado, arquivo) | **vi funcionar** | Em 1280×720, **as 12 ferramentas** (Transformar a Pesos): a zona da ferramenta **não corta em nenhuma** (`796/796` px de texto e de faixa; no doc `80` cortavam **11**). As quatro partes (estado 245 px, modo 139, ferramenta 712, avisos 124) **se leem**. As frases **ficaram mais curtas**: ***"Apaguei arm: 2 ossos, 6 desenhos e 1 regra."*** (sem o *"Ctrl+Z volta…"*), ***"Pesos: escolha o osso na Árvore e pinte os vértices da malha. [ e ] mudam o raio."*** | `E0_rodape_1280_pesos` · `E2_rodape_1280_apagar` |
| 4 | Em 720 a ficha rápida cabe inteira e a Árvore fica com o que sobra; o botão de recolher o grupo da ficha devolve a Árvore, e a dica diz | **pela metade** | **Ficha rápida:** com o `head` escolhido, *X*, *Y*, *Escala X/Y*, *Ângulo* e *Alfa* aparecem **inteiros**, sem rolagem na ficha rápida (o grupo tem 239 px). **A Árvore:** **80 px** (defeito 2). **O botão** *Recolher: Propriedades*: a Árvore passa de **80 para 282 px**; o rodapé diz ***"Propriedades: recolhido. O espaço foi para o outro painel"*** (defeito 1) e o botão vira ***"Abrir: Propriedades"*** | `G2_720_ficha_rapida_com_osso` · `G1_720_propriedades_recolhida` |
| 5 | `npm run medir`: a altura SUBIU de 81/90 (diga o número novo) | **pela metade** | **Duas rodadas, às 04h26 e 04h27.** *(1)* quebrou: ***"A medição não rodou: ReferenceError: __m is not defined"***. *(2)* **terminou**: ***"90 de 90 medições sem nada passando da coluna. 81 de 90 medições cabem na altura, sem barra de rolagem. Console limpo."*** **81 de 90: o mesmo de antes**, **não subiu**. **Rolam** (9): *Propriedades*, *Malha e pesos*, *Exibição* e *Propriedades (regra Comando)* em 1440×900, e as mesmas **mais a *Prévia*** em 1280×720. **Limite:** **as portas do `medir` (5192 e 9336) estavam ocupadas por outro processo** quando comecei; **não sei se medi o meu servidor ou o do outro**, e a regra da casa pede a **casa vazia**. **O número é do código-fonte de agora (`editor/`), não do zip v34.8** | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A tira numa fileira só (37 px) devolveu uns 66 px de altura** a cada grupo (eram 3 fileiras de 103 px no total) e **o `»` tem dica com os nomes**: quem vê uma aba sumir sabe onde foi |
| C2 | **As abas *Linha do tempo* e *Curvas* subiram para a fileira do tocador** e **a folha ganhou chão**: de 3 para 4 linhas de chave em 1080 e de 0 para 1 em 720 (a conta do pedido **bate com a minha**) |
| C3 | O **rodapé mais curto** troca o texto longo por um **resumo**: *"Apaguei arm: 2 ossos, 6 desenhos e 1 regra."* perdeu o *"Ctrl+Z volta. 36 chaves…"* do v33.2. **Cabe**, mas **onde foi parar o resto**? (não achei: o `Ctrl+Z` ainda desfaz) |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O `npm run medir` | rodei duas vezes **com as portas ocupadas por outro** | o número com a casa vazia |
| A folha do tempo | só a animação `idle`, com *Detalhes* aberto | outras animações; folha com muitas chaves |
| O rodapé em 1280 | 12 ferramentas e 2 frases de estado | frases de arquivo longas (a de *Abrir pasta*, *Importar*) |
| A tira de abas | cliquei o *»* da direita de cima | os `»` dos outros grupos |
| Telas | 1920×1080 e 1280×720 | 1440×900 (que o `medir` mede, mas eu não vi a olho) |
