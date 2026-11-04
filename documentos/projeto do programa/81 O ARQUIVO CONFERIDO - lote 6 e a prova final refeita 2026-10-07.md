# O arquivo conferido — lote 6, as quatro sobras e a prova final refeita (v34.6) — 07/10/2026

Rodada 45, lote 6. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.6** (o "Sobre" diz v34.6; servi o zip `recorte v34.6 2026-10-07.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 03h22 a 03h26, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-45-conferida/lote6/` (10) |
| Material | o mesmo do doc `78`: pastas no **armazenamento privado do Chrome** (handles reais, **não** do Windows): `p_heroi` (`heroi.bone`, atlas, png, `espada.bone`), `p_solto` (só o `heroi.bone`), `p_vazia` e `rino` (as **12 imagens** de `exemplo/game/rino`). Seletores de arquivo e de salvar devolvem essas pastas e arquivos. **Nada foi gravado no disco.** Instrumentei `alert`/`confirm`/`prompt`: **nenhuma** chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 3, 4) | 0 | 0 | 4 (+ a prova final, linha 5) |

## A PROVA FINAL, repetida — Novo projeto com 12 imagens → arrastar → `Ctrl+S` → fechar → Abrir recente → exportar a pose → pacote e reabrir

Como usuário novo, **só pela tela**. Pasta `rino`. **Lacuna** = a maior parada do relógio dentro da página (temporizador de 50 ms) naquele passo.

| # | Passo | Gestos | O que o programa disse | Lacuna |
|:---:|:---|:---:|:---|:---:|
| 1 | *Arquivo → Novo projeto…* (pasta `rino`) | **2** | ***"Projeto novo na pasta rino, com uma base vazia. 12 imagens na aba Imagens; o Salvar grava rino.bone ali"*** | 200 ms |
| 2 | **Arrastar 3 imagens** para a cena | **3** | cada uma ***"… entrou solta…"*** | 127 · 76 · 93 ms |
| 3 | `Ctrl+S` | **1** | ***"Salvo em rino.bone. Atlas da pasta gravado ao lado: rino.atlas.json, com 3 imagens em uso."*** | 84 ms |
| 4 | **Fechar** (recarreguei a página) | **1** | ***"sem nome — Recorte"*** | — |
| 5 | *Arquivo → Abrir recente…* → **`rino (pasta)`** (a 1ª, **já escolhida**) | **3** | ***"Pasta rino: rino.bone reaberto de onde parou"***; **Nenhum aviso**; as 3 imagens na árvore | 67 ms |
| 6 | **Exportar a pose:** *Arquivo → Exportar → GIF, PNG, folha, vídeo…*; formato **PNG** (2 gestos); *Exportar* | **6** | ***"Vai sair: rino_0000.png — recorte:base, 1 imagem"***; relatório ***"Tamanho de cada quadro: 1888 por 914 pixels… Arquivos: rino_0000.png… Pasta: exportar/, dentro da pasta do projeto rino"*** (225.004 bytes) | 97 ms |
| 7 | **Pacote:** *Arquivo → Exportar → Salvar como pacote…* | **3** | ***"Salvo em rino.bonez. 3 arquivos dentro, 162.349 bytes."*** | 138 ms |
| 8 | **Reabrir o pacote:** *Arquivo → Abrir projeto…* | **2** | ***"Pacote rino.bonez aberto, com o atlas com as imagens dentro."***; **Nenhum aviso**; as 3 imagens na árvore | 82 ms |

*(Os passos 7 e 8 foram feitos numa **segunda rodada** idêntica dos passos 1 a 3: na primeira, o meu roteiro perdeu os seletores de arquivo ao recarregar a página no passo 4. O que o programa fez nos passos 7 e 8 não depende disso.)*

### A conta

| O que | Quanto |
|:---|:---:|
| Gestos no total | **21** (2 + 3 + 1 + 1 + 3 + 6 + 3 + 2) |
| Em v34.3 | 24 (**21 sem o tropeço**): agora **21 e nenhum tropeço** |
| Tropeços **do programa** | **nenhum** (o *Abrir recente* trouxe a pasta **antes** do `.bone`) |
| Tropeços meus | **nenhum** pesando |
| O tempo de resposta | **a maior lacuna foi de 200 ms** (o *Novo projeto*, que cria a pasta e lê 12 imagens); **todo o resto abaixo de 140 ms** |
| Caixas nativas do navegador | **0** |

## Os defeitos

Nenhum que pare o uso. Só notas:

| # | Nota | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno, dúvida.* **O `Ctrl+O` de um `.bone` solto, com o mesmo nome do que está na pasta aberta, diz *"Pasta p_heroi: heroi.bone reaberto de onde parou"*.** Escolhi `p_solto/heroi.bone` (de **outra** pasta, sem atlas) com a pasta `p_heroi` aberta: o rodapé fala da pasta aberta e a barra diz *"Nenhum aviso"*. **Não sei qual dos dois arquivos o programa abriu**: os dois têm o mesmo conteúdo, então não distingui. Se abriu o da pasta, a frase está certa; se abriu o escolhido, ela afirma uma coisa que não aconteceu | 2 | `B0_ctrl_o_bone_solto` |
| 2 | *Pequeno.* **O resumo da janela de avisos agora diz *"Ver as 42 linhas, uma por imagem"*** (eram 21 no doc `78`): **creio** que o número soma as linhas curtas e as longas (não abri o item para contar); a frase continua dizendo *"uma por imagem"* | 3 | `D0_janela_de_avisos` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | `Esc` na janela *"A pasta tem 2 arquivos .bone"* cancela e o personagem continua aberto | **vi funcionar** | Herói aberto, *Abrir pasta do projeto…* → `p_heroi` (`espada.bone` e `heroi.bone`): a janela agora tem **quatro** saídas, a última ***Cancelar*** (***"Nada muda: o que está aberto continua aberto"***). **`Esc`:** rodapé ***"Nada mudou: a pasta p_heroi não foi aberta"***, a aba segue ***"heroi.bone — Recorte"*** e a árvore com as mesmas **44 linhas**. *(No doc `78` o `Esc` trocava o herói por um projeto vazio.)* | `A0_janela_dos_dois_bone` · `A1_depois_do_esc` |
| 2 | `Ctrl+O` com o atlas na pasta: nenhuma frase falsa sobre o atlas | **vi funcionar** | Com a pasta `p_heroi` (**tem** o atlas) aberta, `Ctrl+O` de um `.bone` solto: o rodapé ***não fala do atlas*** e a barra diz ***"Nenhum aviso"*** (no doc `78` dizia *"heroi.atlas.json não está na pasta "p_heroi""*, falso). **Quando o atlas não está:** com a pasta `p_vazia` aberta, o mesmo `Ctrl+O`: ***"heroi.atlas.json não está na pasta "p_vazia": as imagens de heroi.bone ficaram de fora. Ponha heroi.atlas.json e as imagens dele na pasta e aperte Recarregar"*** (**verdadeira**) e ***"42 avisos — ver"***. Nota 1 | `B0_ctrl_o_bone_solto` · `C0_ctrl_o_pasta_sem_atlas` |
| 3 | A janela de avisos: só o resumo; as 21 linhas curtas ficam recolhidas | **vi funcionar** | A janela ***"Problemas do arquivo"*** traz **só o resumo** (***"21 imagens não estão em atlas nenhum, e os desenhos delas ficam invisíveis: cape_upper, cape_lower, hair, arm_back, forearm_back, hand_back, thigh_back, shin_back e mais 13. Quase sempre é o atlas que não veio junto…"***), um item **recolhido** ***"Ver as 42 linhas, uma por imagem"*** (`details` fechado) e ***"42 problemas, 21 com conserto aqui. O resto é na mão."*** — **nenhuma** linha *"imagem não encontrada: X"* à vista. Nota 2 | `D0_janela_de_avisos` |
| 4 | *Abrir recente*: *"rino (pasta)"* vem antes do `rino.bone` solto (ou o `.bone` abre a pasta) | **vi funcionar** | A paleta ***"Abrir um arquivo recente"*** lista ***"rino (pasta)"*** **primeiro e já escolhida** (com o fundo azul), e ***"rino.bone"*** depois. O `Enter`/clique na primeira abre ***"Pasta rino: rino.bone reaberto de onde parou"*** **com as imagens**, sem aviso | `F0_abrir_recente` · `G0_reabriu_pela_pasta` |
| 5 | Repetir a prova final do Arquivo: conte os gestos | **feita** | Ver a prova acima: **21 gestos, nenhum tropeço, nada passou de 200 ms** | `E0_novo_projeto_salvo` · `G1_exportou_a_pose` · `H0_reabriu_o_pacote` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A janela dos dois `.bone` agora tem **a saída de cancelar escrita** (*"Nada muda: o que está aberto continua aberto"*): o `Esc` e o botão dizem a mesma coisa. É o padrão das outras janelas |
| C2 | A lista do *Abrir recente* põe **a pasta primeiro**: o caminho que abre tudo é o que se escolhe sem pensar |
| C3 | O rodapé do reaberto (*"Pacote rino.bonez aberto, com o atlas com as imagens dentro."*) **ficou mais curto** que na v34.3 (*"…com o atlas com as imagens de…"*, cortado): **cabe** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As pastas | **armazenamento privado do Chrome** (handles reais, **não** do Windows) | abrir e gravar numa pasta do disco pelo seletor do Windows |
| Os seletores de arquivo e de salvar | arquivos no mesmo armazenamento | as caixas do navegador; o nome sugerido |
| *"Fechar"* da prova | **recarreguei a página** (o menu não tem *"Fechar projeto"*) | fechar e reabrir o navegador |
| A prova do pacote | 2ª rodada dos passos 1 a 3, depois 7 e 8 | que uma rodada **só** teria o mesmo tempo |
| O `Esc` | com o herói **salvo** (sem mudança) | com mudança não salva (a pergunta *Salvar/Descartar* vem antes) |
| *Abrir recente* | **dois** itens | uma lista com muitos itens |
| O tempo de resposta | temporizador de 50 ms **dentro da página** | o tempo que o **olho** vê, a memória |
| A exportação da pose | **uma** (PNG, 1888 × 914 px) | outras animações e formatos |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
