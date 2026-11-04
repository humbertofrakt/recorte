# A aba das entidades conferida — lote 2 (v30.1) — 06/10/2026

Rodada 39, lote 2. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.1** (o "Sobre" diz v30.1) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 08h33 a 08h48, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-39-conferida/lote2/` (8) |
| Material | o herói, a `espada` e o `poder5` numa **pasta em memória** (o seletor do Windows trocado por um falso). A abertura foi pelo caminho do programa: *Novo projeto* → pasta → *Abrir heroi.bone* |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1, 3, 4, 5, 6) | **1** (2) | 0 | 6 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Mudar o teste de slot, arrastando o cartão para a linha de outro slot, não funciona.** O programa **não aceita a soltura** (o `dragover` da linha não é aceito; a soltura nem dispara). Vi nas duas situações: com o herói numa animação e com a base aberta, com o slot `poder5` como alvo. A mesma linha também **não aceitou uma entidade da Prateleira** (só a linha `weapon` aceitou). Pode ser de propósito (o slot `poder5` nasceu de um "pendurar", não é um slot do herói), mas nada diz isso | 2 | `W1_teste_cartao` |
| 2 | *Pequeno.* O texto de ajuda da *Pôr em teste neste slot…* diz **"Com uma imagem escolhida"**, e o item funcionou com a entidade `weapon` escolhida na Árvore | 4 | `W4_menu_entidades` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Arrastar uma entidade da Prateleira até a linha de um slot do cartão AQUI = TESTE: tracejado, cor de aviso, "teste" | **vi funcionar** | Arrastei `poder5` da Prateleira para a linha `weapon`: rodapé *"Poder5 no slot weapon: teste. A animação não muda."* Dentro do cartão do herói, sob o `espada` PROJETO, nasceu um cartão **`poder5` · TESTE · "anima: parada"**, de **borda tracejada** em laranja-aviso | `W1_teste_cartao` |
| 2 | Trocar a entidade do teste, mudar de slot, desligar; `Ctrl+Z` desfaz cada um | **pela metade** | **Trocar:** arrastar `espada` sobre o teste: *"Espada no lugar de poder5, no slot weapon: teste"*; `Ctrl+Z`: *"Desfeito: Trocar a peça de teste"*. **Desligar:** pelo botão direito (*Desligar*): *"Espada saiu do slot weapon (era teste)"*, e arrastando o cartão de volta à Prateleira: *"Poder5 saiu do slot weapon (era teste)"*; `Ctrl+Z`: *"Desfeito: Desligar o teste"* (e *"Ligar em teste"* na outra ponta). **Mudar de slot: não funciona** (defeito 1) | `W1_teste_cartao` |
| 3 | A Prévia desenha a peça de teste; a cena ainda não (lote 3) | **vi funcionar** | Com `poder5` em teste no `weapon` (a `espada` fica no herói): a **Prévia** mostra o herói com a peça vermelha e dourada (a de `poder5`) na mão; a **cena** segue com a espada. Não contei a cena como defeito | `W5_previa_zoom` · `W5_cena_zoom` |
| 4 | Menu Entidades: "Pôr em teste neste slot…" e "Desligar o teste deste slot" existem e funcionam | **vi funcionar** | Os dois itens estão no menu, com dica. *Pôr em teste neste slot…* abre a janela *"Qual entidade?"* (`poder5.bone`, `espada.bone`); com Enter: *"Poder5 no slot weapon: teste"*. *Desligar o teste deste slot* fica apagado com a dica *"O slot weapon não tem peça de teste"* e acende quando há teste | `W4_menu_entidades` |
| 5 | Salvar: o teste vai para o `manifest.json`; o `.bone` não muda. Reabrir a pasta: o teste volta | **vi funcionar** | **Salvei** (botão do alto): *"Salvo em heroi.bone. 2 corpos e o manifesto do projeto gravados na pasta."* O `manifest.json` ganhou `RECORTE_projeto.montagem.ligacoes: [{host: heroi.bone, slot: weapon, uri: poder5.bone}]` (573 bytes; **sem** teste, 391). O **`heroi.bone` gravou o mesmo tamanho (48525 bytes) com e sem o teste**. **Reabri** (Novo projeto → *Abrir heroi.bone*): *"projeto com 1 base e 3 entidades reaberto"* e o cartão **`poder5` · TESTE** voltou no `weapon` | `W6_reaberto` |
| 6 | As duas notas do 28: a Prateleira mostra as outras bases depois de Promover; o tracejado é só do teste | **vi funcionar** | **Promover** a `espada`: *"espada entrou em Bases"*; a Prateleira continuou com cartões e, abrindo a base `espada` por dentro, mostra **`poder5`, `poder5` e `heroi`** (o herói como base). **Tracejado:** nenhuma borda tracejada na aba fora do cartão de teste (nem com a espada por dentro, nem na Prateleira) | `W8_prateleira_depois_de_promover` · `W8_espada_por_dentro` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **Dois `poder5` na Prateleira** (e `poder5-2.bone` na pasta): trazer a mesma entidade duas vezes cria uma segunda cópia com outro nome. Fui eu que trouxe duas vezes; mas o programa não avisa que já havia uma |
| C2 | O cartão de teste chama-se só `poder5`; o do projeto também. Quem lê rápido não distingue o teste do projeto senão pelo tracejado e pela palavra TESTE (que estão ali) |
| C3 | Ao abrir uma base **por dentro** (`espada`), a Prateleira passa a mostrar o `heroi` como cartão; clicar nele **ligaria o herói em teste dentro da espada**? Não tentei |
| C4 | **Salvar não fez nada** numa tentativa em que eu tinha aberto a pasta e **depois** o projeto por *Abrir projeto* com arquivos soltos: nenhum aviso, nenhum arquivo gravado, rodapé parado em "Arquivo não salvo." Repeti 4 vezes (botão, menu, *Salvar como*). Pelo caminho *Novo projeto → Abrir heroi.bone* salvou sempre. **Não sei se é do programa ou do meu jeito de abrir**; fica como nota |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo do Windows | pasta em memória (`heroi`, `espada`, `poder5`) | Salvar e reabrir numa pasta de verdade |
| "Reabrir" (item 5) | Novo projeto → Abrir heroi.bone, **na mesma página** | fechar o navegador e abrir de novo |
| Arrasto | arrasto de verdade interceptado por protocolo, com a soltura mandada por mim | o arrasto com a mão |
| Mudar de slot (item 2) | só com o slot `poder5` como alvo (o herói só tem o slot `weapon` em sua base) | mudar o teste entre dois slots do herói |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
| Roteiro e medição | não rodei | — |
