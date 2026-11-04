# Os consertos da fila conferidos (v29.8) — 06/10/2026

Rodada 36. Conferente: `CONFERINDO · rodada 36 — os consertos da fila`.
**Nenhum código foi mexido** e **não li os testes**. Só usei o programa e fotografei.

| | |
|:---|:---|
| Versão montada | **v29.8** (o "Sobre" diz v29.8) |
| Como | `programa/` na porta 5324 · Chrome sem janela · mouse e teclado por protocolo |
| Tela | 1920×1080; 1280×720 só no diálogo de exportar |
| Hora | 23h58 do dia 05 a 00h15 do dia 06, relógio da máquina |
| Fotos | `backup/fotos-obra/rodada-36/` (29) |
| Material | o herói de exemplo, aberto pelo próprio programa; para o Meio-termo e o resto, o `idle` dele |

## O quadro

Dos **28 que ainda existiam** no `23 A FILA CONFERIDA` (o N-4b ficou de fora de propósito):

| Deixou de existir | Mudou de cara | Ainda existe | Não cheguei a conferir | Total |
|:---:|:---:|:---:|:---:|:---:|
| **22** | **3** (K1b, L5, N-16b) | **1** (M10) | **2** (M12a, L1a) | **28** |

Fora dos 28:

| Grupo | Resultado |
|:---|:---|
| Achado novo: tirar a skin pelo × entra no Desfazer | **deixou de existir** |
| Os pequenos do dia | **6 de 7 deixaram de existir**; o *nome do meio com a peça girada* **não conferi** (não consegui montar o material) |
| Decisão: X e Y da ficha são o pivô | **vi funcionar** |
| Decisão: Malha e pesos junto de Imagens e Pivôs | **vi funcionar**; o *arranjo guardado não muda* **não conferi** |
| Decisão: ícone de Prévia na barra | **vi funcionar** |
| Decisão: Pose ▸ Meio-termo | **vi funcionar** (91,5 entre 90 e 93) |
| Nada quebrou ao lado (painel, partículas, conexão) | **nada quebrou** nos três gestos |

## Os defeitos que sobraram, do pior para o menor

| # | Defeito | Item | Foto | Como repetir |
|:---:|:---|:---:|:---|:---|
| 1 | **Com os Detalhes da linha do tempo abertos, a aba Imagens continua baixa:** só o cabeçalho e uma fileira de miniaturas cortada (y 206 a 395). A lista de Animações já cabe (três linhas) | K1b | `K1b_imagens_com_detalhes` | Abrir `idle` · Detalhes · aba Imagens |
| 2 | **O diálogo *Exportar imagem* abre com o título à vista, mas os botões *Exportar* e *Fechar sem exportar* ficam abaixo da borda** (y 974 numa caixa que acaba em 900; em 1280×720, y 866 com a caixa até 648). Só aparecem rolando a caixa. Antes era o contrário: título escondido, botões à vista | N-16b | `N16b_dialogo` · `N16b_720` | Arquivo → Exportar → GIF, PNG, folha, vídeo… |
| 3 | **O painel *Malha e pesos* ainda é uma janela baixa:** 254 px no alto da coluna, abre já nos *Pesos*, mas o grupo *Pincel* fica abaixo da dobra | L5 | `L2_pesos_v298` | Malha e pesos · escolher um desenho com malha |
| 4 | **As sete ações da aba Skins são ícones sem texto** (a dica ao passar o mouse diz o nome: *Exportar skin…, Promover skin a base…, Apagar skin…*) | M10 | `M10_skins` | Aba Skins |

## A tabela

| # | O que era | Estado | O que vi hoje | Foto |
|:---:|:---|:---:|:---|:---|
| J11 | Boas-vindas citam "Abrir pasta…"; o menu diz outro nome | **deixou de existir** | As boas-vindas dizem *"Arquivo → Abrir pasta do projeto…"*, igual ao menu | `J11_boas_vindas` |
| K13 | Detalhes abertos: a lista de animações some | **deixou de existir** | Com os Detalhes abertos, a lista mostra `idle`, `walk` e `attack` (três linhas); a cena mede 548 px | `K13_detalhes_abertos` |
| K1b | Painel da direita sem altura | **mudou de cara** | A lista de Animações cabe; **a aba Imagens segue baixa** com os Detalhes abertos (defeito 1) | `K1b_imagens_com_detalhes` |
| I8 | Exibição não dobra os grupos | **deixou de existir** | *MOSTRAR NA TELA* e *A CENA* têm seta; clicar dobra (o texto da lista caiu de 20 itens para 8) | `I8_exibicao_v298` |
| G-Q4 | Prévia aberta e tocando mostra o boneco parado | **deixou de existir** | A Prévia diz *"Camada 0: segue a animação aberta (idle)"* e o boneco acompanha o tocar (quadro 42, 1,42 s) | `GQ4_tocando_a` |
| M10 | Sete ícones sem texto na aba Skins | **ainda existe** | Seguem só ícones, com dica | `M10_skins` |
| L2 (+L3) | Pesos automáticos: a cena não muda e o resultado fica abaixo da dobra | **deixou de existir** | O rodapé diz *"Pesos automáticos em 4 vértices. A ferramenta Pesos (G) ligou: cada vértice mostra a pizza dos ossos que o puxam"*; a cena mostra as pizzas | `L2_pesos_v298` |
| L5 | Painel Malha e pesos: lista longa numa janela baixa | **mudou de cara** | Defeito 3 | `L2_pesos_v298` |
| M15 | Botão direito no vazio diz "Não há ferramenta anterior" | **deixou de existir** | Diz *"O botão direito volta à ferramenta de antes, e ainda não houve outra: segue Transformar"* | `M13_em_todas_v298` |
| J2 | "Virar filho de…" só diz "Segure P" | **deixou de existir** | O item entra no modo: *"Virar filho de torso: clique em quem vira filho (clicar de novo solta). Esc termina."* **Não completei a troca de pai** | `J2_v298` |
| G-Q6 | A aba Curvas esconde o tocador | **deixou de existir** | A aba traz ⏮ ◂ ▶ ▸ e *"0,67 s · quadro 20"* | `GQ6_curvas_v298` |
| G-Q7 | Curvas vazia só diz "Passe o cursor" | **deixou de existir** | Diz *"Clique num ponto do gráfico (uma chave) para escolhê-la: o formato da curva vale dela até a próxima."* | `GQ6_curvas_v298` |
| K9 + G-Q5 | Botões do formato da curva fora da tela | **deixou de existir** | Os sete botões ficam na barra de cima, ao lado de *"Formato da curva"* | `GQ6_curvas_v298` |
| N-16b | O diálogo Exportar abre rolado, com o título escondido | **mudou de cara** | Defeito 2 | `N16b_dialogo` · `N16b_720` |
| N-10 | O diálogo não guarda a escolha da vez passada | **deixou de existir** | Escolhi *Sequência de imagens PNG*, fechei sem exportar, reabri: guardou | `N10_reaberto` |
| N-5 | O diálogo não mostra o que vai sair | **deixou de existir** | Diz *"Vai sair: heroi.gif — idle, 60 quadros a 30 por segundo"* | `N10_reaberto` |
| N-8 | O aviso final não diz onde o arquivo foi parar | **deixou de existir** | Diz *"Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)"* | `N8_exportou_v298` |
| PL-10 | Doze botões soltos na aba Regras | **deixou de existir** | Um *Novo ▾* e oito ícones | `PL10_regras_v298` |
| PL-25 | Pose sem Breakdown | **deixou de existir** | Pose tem *Meio-termo, Meio-termo → anterior, Meio-termo → seguinte* | `PL25_pose` |
| PL-21 | Atalhos sem a seção das teclas de painel | **deixou de existir** | Seção dobrada *"Teclas dos painéis (35): Linha do tempo, Ordem e Árvore — valem com o foco no painel"* | `PL21_atalhos_v298` |
| L12 | Malha e Animações no mesmo grupo | **deixou de existir** | Malha e pesos está em cima, junto de Imagens, Entidades e Pivôs; Animações fica embaixo e as duas aparecem juntas | `L2_pesos_v298` |
| PL-30 | Malha e pesos longe de Imagens e Pivôs | **deixou de existir** | Mesmo grupo (lido na lista de abas: *Imagens, Entidades, Pivôs, Malha e pesos, Partículas, Exibição, Prévia*) | `L2_pesos_v298` |
| PL-31 | Sem botão Prévia na barra de ações | **deixou de existir** | O ícone *"Prévia: abre a aba Prévia…"* abriu a aba | `GQ4_tocando_a` |
| D2 | Ficha do evento no fim de Propriedades | **deixou de existir** | Escolher `step` abre *"Evento: step"* no alto, com a Chave de evento | `D2_v298` |
| M12a | Apagar skin não cita quem depende | **não cheguei a conferir** | Não repeti o gesto | — |
| M13 | "Em todas as skins": o clique é mudo | **deixou de existir** | O rodapé diz *"Em todas as skins: ligado. A imagem que você clicar troca em toda skin que usa a mesma neste slot."* | `M13_em_todas_v298` |
| L1a | Grupo Pincel abre e não liga o pincel | **não cheguei a conferir** | Não abri o grupo Pincel nesta rodada. Vi só que *Pesos automáticos* liga a ferramenta Pesos | — |
| L11b | Pesos sem passo "testar" | **deixou de existir** | O painel traz *"Testar: gire um osso ligado e veja a malha seguir. Ctrl+Z volta o último passo dos pesos"* | `L2_pesos_v298` |
| — | **Achado novo:** a skin tirada pelo × entra no Desfazer | **deixou de existir** | × em `default`: *"Skin "default" desligada…"*; `Ctrl+Z`: *"Desfeito: Desligar a skin "default""* e a skin voltou | `skin_x_depois_z` |

## Os pequenos do dia, as decisões e o que não quebrou

| O que | Estado | O que vi | Foto |
|:---|:---:|:---|:---|
| Esc fecha as Rajadas | **deixou de existir** | Janela aberta, `Esc`: fechou | — |
| Rótulo do Raio fora da estrela | **vi funcionar** | Arrastando a alça do Círculo: *"Raio: 40"* à esquerda da alça, inteiro | `raio_zoom` |
| A folha não corta | **vi funcionar** | *qtd. · 1º · díg.* cabem dentro do painel (o último termina na borda, x 258) | `folha_campos` |
| Marcar como slot de novo depois do `Ctrl+Z` | **vi funcionar** | Marquei "peito", `Ctrl+Z`, marquei "peito": marcou | `slot_de_novo` |
| Base-slot na lista abre com o herói | **vi funcionar** | *"A base de peito, por dentro. heroi fica à vista, parado."* | `base_slot_lista` |
| Item cinza clicado diz o motivo | **vi funcionar** | `hitbox` + *Marcar como slot…* (cinza): o rodapé diz *"hitbox não mostra uma imagem: só imagem vira slot"* | `item_cinza` |
| Nome do meio inteiro com a peça girada | **não conferi** | Não consegui montar o poder de cinco peças depois de recarregar a página | — |
| X e Y da ficha são o pivô | **vi funcionar** | Base, `hair`: X = 12, depois Escala X = 1,5: o X seguiu 12 | `pivo_escalaX_hair` |
| Malha e pesos junto de Imagens e Pivôs; arranjo guardado não muda | **vi funcionar / não conferi** | O arranjo de fábrica está certo. **Não conferi** o arranjo guardado: a página abriu limpa, sem um arranjo meu de antes | — |
| Ícone de Prévia na barra | **vi funcionar** | Abre a aba Prévia | `GQ4_tocando_a` |
| Pose ▸ Meio-termo | **vi funcionar** | Em 0,67 s: *"Meio-termo em 0,67 s: 9 chaves, na pose inteira"*; o Ângulo do `torso` ficou **91,5**, o meio de 90 (0 s) e 93 (1,00 s) | `Meio_termo_torso` |
| Nada quebrou: painel | **nada quebrou** | Exibição dobra e a aba Curvas traz tocador e botões | `I8_exibicao_v298` |
| Nada quebrou: partículas | **nada quebrou** | Fogo no herói, forma Caminho: traz `cape_path` e a curva fica realçada | `side_particulas_caminho` |
| Nada quebrou: conexão | **nada quebrou** | Botão direito na espada: *"Trocar todas as iguais (2)"*, desligada ao abrir | `side_conexao_iguais` |

## Parte C — o que confundiria o Humberto

| # | O que |
|:---:|:---|
| C1 | **Uma segunda linha "peito_2" na Árvore.** Depois de marcar o slot, `Ctrl+Z`, marcar de novo, entrar e sair da base do slot, a Árvore mostrou duas linhas (*peito* e *peito_2*, ambas com `body`). Logo depois de marcar de novo só havia uma. **Não repeti para confirmar** |
| C2 | **O rodapé repete, sem parar, "A ficha rápida não cabe inteira nesta tela (faltam 32 px)…"** em 1280×720 (e aparece em 1920×1080 depois de criar um emissor). É um aviso de layout que fica no lugar do que se fez |
| C3 | Em 1280×720 com a aba Curvas aberta, os painéis da direita ficam de uma linha cada (a lista de Animações some de novo) |
| C4 | **O botão direito não oferece "Marcar como slot…" dentro de uma animação**; só na base (o item de menu diz por quê) |
| C5 | O arquivo exportado diz *"Pasta: a de downloads do navegador"*, mas na máquina de prova o seletor era um falso: não sei o que o Humberto vê com o seletor de verdade |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo do Windows | pasta em memória | o texto *"Pasta: a de downloads"* com o seletor de verdade |
| Recarregar a página com mudança não salva | tirei o aviso do navegador com uma linha de código | só o reinício |
| Telas | 1920×1080; 1280×720 só no diálogo de exportar | 1440×900 e os itens de altura nos outros painéis |
| `N-4b` | de fora de propósito | — |
| `M12a`, `L1a`, nome do meio, arranjo guardado | não conferi | — |
| `J2` | entrei no modo de *Virar filho de…*, sem completar a troca de pai | que a troca de pai funciona |
