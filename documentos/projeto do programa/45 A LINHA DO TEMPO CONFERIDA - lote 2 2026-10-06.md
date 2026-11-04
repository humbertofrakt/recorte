# A linha do tempo conferida — lote 2 (v31.5) — 06/10/2026

Rodada 40, lote 2, "a folha cabe". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido** (li o código só para achar onde ficam *Colar espelhado* e *Empurrar as chaves*).

| | |
|:---|:---|
| Versão montada | **v31.5** (o "Sobre" diz v31.5) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080, e 1280×720 na linha 4 |
| Hora | 12h56 a 13h00, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-40-conferida/lote2/` (13) |
| Material | o herói de exemplo, aberto pelo próprio programa, animação `idle`. Colei, espelhei e empurrei chaves de verdade: **nada foi salvo**, mas a animação ficou mexida (agora com 2,13 s) até eu largar a máquina |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 3, 4) | 0 | 0 | 4 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **Copiar não diz nada.** Apertei *Copiar* (botão da barra) e o rodapé ficou em *"Arquivo salvo."* (a frase de antes). Só se sabe que copiou quando se cola. *(O *Copiar a pose inteira* do menu diz: "Pose de 1,53 s copiada: 20 valores".)* | 3 | — |
| 2 | *Dúvida, não afirmo defeito.* **A lista do botão *Mais* não saiu na foto.** Em quatro tentativas (clique e foto) o botão ficou apertado e a lista **existia na página** (*Esticar seleção · Espelhar no tempo · Fechar ciclo · Espelhar esquerda e direita · Tirar trecho de laço*), mas **nunca apareceu na imagem**. Pode ser da minha foto | — | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Em 1920×1080, com os *Detalhes* abertos, a folha mostra pelo menos 2 linhas de chave inteiras (antes, 1) | **vi funcionar** | O botão *Detalhes* abre a folha, sem mexer em divisor: **duas linhas de osso inteiras**, ***Osso torso › Rotação*** e ***Osso hips › Posição Y***, mais a *Resumo* fixa e a chave de evento embaixo. Rolando, **sempre duas** (*Morph smile › Peso* e *Regra hair_physics › Gravidade*; *Gravidade* e *Variável speed*). A altura útil do corpo da folha: **207 px** | `A1_detalhes_abertos` · `P0_linha_smile` |
| 2 | O quadro *Chave de evento* nasce fechado | **vi funcionar** | Ao abrir os *Detalhes*, o rodapé da folha mostra ***▸ CHAVE DE EVENTO*** (seta para o lado = **fechado**), uma faixa fina, sem o quadro de *Chavear evento* que a v31.4 mostrava aberto | `A1_detalhes_abertos` |
| 3 | *Colar*, *Colar espelhado*, *Empurrar as chaves*: depois do gesto a folha rola até as chaves novas | **vi funcionar** | **Colar:** copiei a chave de `Peso de smile` (1,00 s), **voltei ao topo** (rolagem 0), pus a agulha em 0,50 s e colei: rodapé *"Chave em 0,50 s: Peso de smile"*; **a folha rolou de 0 para 792** e a chave nova (laranja) ficou à vista, **sem eu rolar** · **Colar espelhado** (*Editar → Pose → Colar espelhado*): copiei a pose inteira, fui para 0,67 s no topo (rolagem 0 → **13**, as chaves novas aparecem). **Prova mais dura:** rolei **até o fim (1258)**, pus a agulha em 1,20 s e colei espelhado: **a folha voltou para 13** e as chaves de 1,20 s do torso e do hips ficaram à vista · **Empurrar** (*Animação → Chaves → Empurrar as chaves…*): marquei a chave de `Gravidade de hair_physics`, **voltei ao topo**, empurrei **4 quadros para a frente**: *"4 chaves andaram 4 quadros para a frente"*; **a folha rolou de 0 para 857** e a linha *Gravidade* apareceu com as chaves marcadas | `C1_depois_de_colar` · `E3_depois_no_fim` · `X3_depois_de_empurrar` |
| 4 | Em 1280×720: quantas linhas cabem (esperado: nenhuma) | **vi funcionar** | **Nenhuma.** Só a linha ***Resumo*** aparece; o corpo da folha tem 150 px, mas **começa em 589 e termina em 739** numa janela de 720: parte dele **fica por baixo da barra de baixo**. Nenhuma linha de osso se vê, mesmo rolando. É da casca, como você disse; **não conto como defeito** | `Z_720_detalhes_fechados` |

## Onde estão os gestos (para quem procurar)

| Gesto | Onde |
|:---|:---|
| Copiar · Colar | botões da barra da folha (*Copiar: copia as chaves escolhidas* · *Colar: cola as chaves no tempo atual*), e *Ctrl+C* / *Ctrl+V* |
| **Colar espelhado** | ***Editar → Pose ▸ → Colar espelhado*** (não está em *Animação*, nem no botão *Mais*). Cola a **pose** copiada, trocando esquerda e direita pelo nome. No herói: *"4 valores trocados de lado. Sem par, colados iguais: torso, hips, head, hand e mais 6. Procurei _e/_d, _l/_r, _esq/_dir, _front/_back, /_b"* |
| **Empurrar as chaves** | ***Animação → Chaves ▸ → Empurrar as chaves…***. Abre *"1 chave marcada. Quantos quadros, e para que lado — em 30 quadros por segundo"*, com *Quadros*, *Lado* (*Para a frente / Para trás*) e *O que anda* (*Estas e tudo o que vem depois — abre espaço / Só as chaves marcadas*) |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **Colar espelhado** diz quais ossos ficaram **sem par** e **por que nome procurou**: boa frase. Ela corta no rodapé em 1920 (termina em *"…/_b. Arquivo não …"*) |
| C2 | Depois de **Empurrar**, a duração da animação **cresceu** (2,00 → **2,13 s**) e a barra de avisos disse *"espada dura 1 s e idle dura 2,13 s: ela dá um salto na emenda. Puxe a ponta até o fim"*. É verdade e útil, mas **o rodapé do Empurrar não avisa** que a animação ficou mais longa |
| C3 | O **Colar** da barra **cola numa linha só**; o **Colar espelhado** mexe em **todas as linhas** (20 valores). Só o primeiro dá para provar a rolagem com uma chave; o segundo mostra bem que rola **até a primeira linha mexida**, e não até a última |
| C4 | Ao colar a chave de `Peso de smile` (uma *Parada*) a nova também veio ***Parada***: a curva **vai junto** com a chave |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Pasta e seletor | o herói de exemplo, aberto pelo próprio programa | abrir um arquivo de verdade |
| Rolar a folha | pelo código da página (`scrollTop`) **e** pela roda do mouse; a **leitura** foi sempre por `scrollTop` | o gesto de rolar com a mão |
| Linhas "inteiras" | medi por posição na tela e olhei a foto | uma régua de pixels exata |
| *Colar espelhado* | o herói **quase não tem pares** (4 valores trocados), então **não** vi um braço virar o outro | o espelho completo em um boneco com `_e/_d` |
| Botão *Mais* | li a lista na página; ela **não saiu** na foto | que ela abre para o usuário |
| Telas | 1920×1080 e 1280×720; 1440×900 não | — |
