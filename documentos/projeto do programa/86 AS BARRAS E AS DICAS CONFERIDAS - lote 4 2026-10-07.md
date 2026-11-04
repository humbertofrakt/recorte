# As barras e as dicas conferidas — lote 4 (v35.1) — 07/10/2026

Rodada 47, lote 4. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.1** (o "Sobre" diz v35.1; servi o zip `recorte v35.1 2026-10-07.zip`, extraído fora da pasta; o zip apareceu às 05h23) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 05h24 a 05h30, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote4/` (9) |
| Material | o herói de exemplo, a animação `idle`, as cinco regras dele. Para a linha 1 **mexi** na *Força* de `ik_arm` e `head_lean` (foram a 50) e na de `cape_follow` (foi a 97 e voltou a 100); a *Cor do osso* (opacidade) voltou a 100. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (2, 3) | **2** (1, 4) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | **com o foco na barra**, **3 teclas andam 3 casas** e o foco **fica** (Força da regra e Alfa); **mas pelo mouse a barra não fica com o foco** (nem a de velocidade do tocador), e **a tecla `Tab` esconde os painéis**: **não achei como um usuário chega na barra só com o teclado**. Eu pus o foco por programa (um falso, dito abaixo) |
| 4 | **só os nomes escritos** (menu, abas, linhas de animação, linhas do gráfico) **ficam sem dica**; **quatro barras da Prévia não têm nem nome** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A barra não segura o foco depois do clique.** Cliquei no meio da *Força* de `ik_arm` (foi de 100 a **50**: o clique **vale**), e **`document.activeElement` ficou `BODY`**, **já durante o botão apertado**; três setas depois a barra **continuava em 50**. A barra de **velocidade do tocador** (sem redesenho, para comparar) também deixou o foco num `DIV`. Quer dizer: **quem clica na barra e aperta setas não ajusta nada**. O conserto do lote (`lembrarFoco`) **atravessa o redesenho**, mas **o foco nunca chega a ficar na barra** pelo clique | 1 | `C0_barra_regras_apos_teclas` |
| 2 | **Sem a mão, a barra não se alcança.** `Tab` é *"Esconder painéis"* (menu *Janela*): apertei `Tab` 14 vezes depois de focar um botão, e o foco ficou em `BODY` **todas** as vezes (os painéis sumiam e voltavam a cada tecla). **Não achei outro caminho de teclado até a barra** | 1 | — |
| 3 | **Quatro barras da Prévia (*Quanto aparece*) sem nome nenhum**: sem `title`, sem `aria-label`, sem rótulo ligado (*SEM NOME* na minha varredura). Nas três de baixo, o mesmo. *(Repete o defeito 3 do doc `85`)* | 4 | `F1_previa` |
| 4 | **Botões e campos sem dica**, com o nome só escrito: **as abas** de painel e do menu; **as linhas da lista de animações** (*walk* e *attack*; a *idle* não conferi); **as três linhas do gráfico das Curvas** (*"head — Escala X … Vendo"*); o botão do rodapé *"Nenhum aviso"*; o seletor *Ícone* e a *Cor do osso* e a *Cor do fundo* (têm rótulo ao lado, nenhum tem dica); a caixa de busca *Buscar imagem pelo nome* (tem `aria-label`, não tem dica); na Prévia os seletores *Animação*, *Velocidade* e as caixas *Repetir* e *Todos os ossos* (têm rótulo, não têm dica). **Nenhum botão de ícone sem dica** apareceu | 4 | — |
| 5 | *Pequeno.* **O *Copiar para a linha do tempo* da Prévia ainda é um parágrafo de três linhas** (63 px em 234): *"Grava o resultado da mistura como uma animação nova, com uma chave por quadro."* A frase curta ficou só no recado de baixo do palco (*"Camada 0 segue idle"*) | 3 | `F1_previa` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | As barras da Regra e do Alfa: três teclas = três casas (o foco não cai) | **pela metade** | **Com o foco na barra** (posto por programa): *Força da regra* `cape_follow` **100 → 99 → 98 → 97** com `←`, e **98 → 99 → 100** com `→`, com **`activeElement` sempre a mesma barra** (`data-foco = forca-cape_follow`); `End` leva a 100. **Alfa** (*Cor do osso, opacidade*, ficha do osso `head`): **100 → 99 → 98 → 97 → 98 → 99 → 100**, foco **fica** (`opacidade-boneColor`). **Mas:** defeitos 1 e 2 (pelo mouse e pelo `Tab` o foco não chega) | `C0_barra_regras_apos_teclas` · `C2_barra_foco_por_js` · `C3_alfa_ficha` |
| 2 | As Curvas: os sete botões de formato têm dica | **vi funcionar** | Aba *Curvas* (abre pelo *Detalhes*): ***Suave***, ***Entrada suave***, ***Saída suave***, ***Linear***, ***Parada***, ***Passa do alvo***, ***Recua e passa***: **os sete com dica**, cada uma **diz o que faz** (*"Começa devagar e termina devagar…"*, *"Reta entre as duas chaves…"*, *"Segura o valor até a próxima chave. Sem meio-termo…"*, *"Vai além e volta. É o overshoot / "back out" do Spine e do Blender…"*, *"Recua antes de sair, passa do alvo e volta. É a antecipação / "back in-out"…"*) **e termina igual**: ***"Primeiro escolha uma chave: clique num ponto do gráfico, ou numa chave da linha do tempo"***. *Ajustar* e *Mostrar todas* também têm dica. Sem chave escolhida os sete aparecem **apagados** (desligados), e a linha de cima diz ***"Clique num ponto do gráfico (uma chave) para escolhê-la: o formato da curva vale dela até a próxima."*** | `D0_curvas` |
| 3 | Uma linha de ajuda por painel; o nome inteiro da regra | **vi funcionar** | **Histórico:** ***"Clique num passo para voltar a ele"*** (**uma** linha, 258 px, sem corte) e a dica traz a inteira (***"Clique num passo para voltar até ele. Os cinzas foram desfeitos."***). **Prévia:** ***"Camada 0 segue idle"*** (uma linha) e a dica traz ***"Camada 0: segue a animação aberta (idle). Escolha outra na camada 0 para misturar"***. **Regras:** os nomes saem **inteiros**: ***ik_arm***, ***head_lean***, ***cape_follow***, ***hair_physics***, ***look_driver*** (na v35.0 saíam *"head_l…"*, *"cape_f…"*, *"hair_p…"*). Defeito 5 | `F0_historico` · `F1_previa` · `B0_regras_painel` |
| 4 | Nenhum botão sem dica, em painel nenhum | **pela metade** | **Varri o programa inteiro**, painel por painel (as 14 abas do menu *Janela*: *Imagens, Entidades, Pivôs, Árvore, Ordem, Malha e pesos, Animações, Skins, Regras, Partículas, Propriedades, Exibição, Prévia, Histórico*; mais a *Linha do tempo* e as *Curvas*): todo **botão de ícone** tem dica. **Sem dica** ficam os de **nome escrito** e os **campos** do defeito 4 e as 4 barras **sem nome** (defeito 3) | `E0_menu_janela` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O conserto do foco **está no lugar certo**: a barra tem a marca (`data-foco`), e as três teclas andam três casas e **o foco fica**. O que ficou de fora é **como o foco chega lá** |
| C2 | A dica das Curvas **termina sempre com o que fazer primeiro** (*"Primeiro escolha uma chave…"*): quem cai nas Curvas sem chave sabe o passo |
| C3 | A dica curta **na tela** e a **inteira na dica** (Histórico, Prévia) é boa: o texto não ocupa a coluna e a explicação está a um passo |
| C4 | A lista do **Histórico**, com a ajuda e o grupo de baixo, **só mostra duas linhas e meia** nesta tela (o grupo da direita de baixo fica com ~100 px): as minhas três mexidas cabem, **uma sessão de verdade não** (não medi) |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O foco na barra | **pus o foco por programa** (`.focus()`) e apertei as setas de verdade | que um usuário chegue ali (defeitos 1 e 2) |
| O *Tab* | 14 vezes seguidas, com um botão de foco | se *Shift+Tab* ou outra tecla chega à barra |
| A varredura de dicas | olhei `title`, `aria-label` e rótulo de **tudo o que está à vista** em cada painel | elementos que só aparecem com um clique (menus, janelas) |
| Linha de animação *idle* | **não** conferi se tem dica | — |
| O *Histórico* | só com as minhas três mexidas | uma lista longa |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
