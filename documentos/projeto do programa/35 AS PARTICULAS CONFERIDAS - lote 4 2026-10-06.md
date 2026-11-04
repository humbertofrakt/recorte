# As partículas conferidas — lote 4 (v30.7) — 06/10/2026

Rodada 38, lote 4, "as formas do emissor". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.7** (o "Sobre" diz v30.7) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 09h40 a 09h43, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-38-conferida/lote4/` (6) |
| Material | o herói de exemplo; nada trocado por falso, **exceto as duas cores da fumaça** (ver o objetivo, abaixo) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 3, 4) | **1** (5) | 0 | 5 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Todas as frases dizem "sai para cima"**, e a *Direção* só vale se for a forma de Ponto: com *Para fora (0–1)* = 1 a frase muda para *"sai para fora"*, mas com 0,5 não há frase para o meio; e *Linha* e *Osso* também dizem "sai para cima" com *Para fora* na ficha. Pequeno: a frase não conta o que muda entre 0 e 1 | 1, 2 | `G_formas_720` |
| 2 | *Pequeno.* Em **Arco**, a linha *Borda · trecho* mistura *esp.* e *°* num par só; a dica diz o que é cada um, mas o rótulo *"Borda · trecho"* não diz qual caixa é qual | 3 | `G_formas_720` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Na aba Forma, embaixo dos botões, uma frase por forma diz onde nasce e para onde sai; cabe inteira em 1280×720 | **vi funcionar** | Uma frase por forma, em letra pequena, abaixo dos botões: *Ponto: nasce num ponto, sai para cima* · *Retângulo: nasce na caixa, sai para cima* · *Círculo: nasce no disco, sai para cima* · *Anel: nasce na borda, sai para cima* · *Arco: nasce no arco, sai para cima* · *Linha: nasce na linha, sai para cima* · *Osso: nasce no osso, sai para cima* · *Caminho: nasce no caminho, sai para cima*. **Em 1280×720** cada frase cabe numa linha só (258 px de largura, nada corta) | `G_formas_720` |
| 2 | "Para fora (0–1)" está na aba Forma; com 1, o fogo sai em volta do círculo (e do anel, do retângulo) | **vi funcionar** | O campo *Para fora (0–1)* aparece em **Retângulo, Círculo, Anel, Arco, Linha e Osso** (no Ponto não). Círculo com raio 60 e *Para fora* = 1: a frase muda para *"Círculo: nasce no disco, sai para fora"* e, tocando, as faíscas **se espalham em todas as direções**, em volta do círculo. Não repeti com anel e retângulo | `R_circulo_fora_1` |
| 3 | O Arco nasce cheio (não herda a espessura do Anel) | **vi funcionar** | Anel com espessura **0,2**; ao trocar para Arco, o campo *esp.* mostra **1** (cheio) e *trecho* 90 | `G_formas_720` |
| 4 | O Ponto mostra um anel tracejado na cena, para se achar | **vi funcionar** | No Ponto, em volta da estrela do emissor aparece um **anel tracejado laranja** | `P_ponto_zoom` |
| 5 | Objetivo de usuário: faça uma fumaça do zero só pelo programa; conte os passos e os tropeços | **pela metade** | Cheguei a **uma nuvem cinza-escura em volta das pernas, que parece neblina, e não fumaça**: ver abaixo | `U1_vazio_tocando` · `U2_antes_da_cor` · `U4_fumaca_zoom` |

## Objetivo: uma fumaça do zero

**Caminho:** Partículas → *Novo emissor vazio* → ajustar a ficha.

| Passo | O que fiz | O que vi |
|:---:|:---|:---|
| 1 | Partículas → *Novo emissor vazio* | O emissor nasce no pé, com a imagem `fx/ponto-suave` já posta e *"Toque a animação para ver"* |
| 2 | Abri `idle` e toquei | **Quase nada à vista:** uns pontinhos brancos, miúdos e pálidos (selo *"leve · 10"*) |
| 3 | Nascer → Taxa por segundo = 25 | — |
| 4–5 | Nascer → Vida de 1,5 a 2,5 | — |
| 6–7 | Movimento → Velocidade de 15 a 35 | — |
| 8 | Forças → Gravidade Y = 30 | — |
| 9–10 | Tamanho e giro → Tamanho de 2 a 4 | Uma **nuvem branca** que cobre o herói (selo *"médio · 63"*) |
| 11–12 | Cor → Cor ao nascer: as duas cores para cinza (#4a4a4a e #6a6a6a) | Passou a **cinza-escuro**, mas com borda pesada |
| 13 | Cor → *Some na vida* → *aparece e some* | a nuvem ficou **cinza, com a borda macia** |

**Resultado:** uma nuvem cinza-escura em volta das pernas, **parada**, sem subir nem se desfazer em fiapos. Parece neblina ou sombra, não fumaça. **13 passos de ficha** (mais abrir `idle` e tocar).

**Os tropeços:**

1. **O emissor vazio quase não se vê** (pontinhos brancos pálidos): quem acaba de criá-lo acha que não funcionou.
2. **Tive de abrir uma animação e tocar** para ver; na base nada se mexe (o rodapé avisa, mas é preciso ler).
3. **Cliquei na cena e o emissor se desmarcou**: para voltar à ficha tive de clicar na estrela.
4. **As cores:** o seletor de cor é o do sistema; **não consegui abri-lo sem janela**. Troquei o valor das duas cores por uma linha de código, e **não sei como é escolher o cinza com o seletor de verdade**.
5. **A *Cor na vida* aparece como uma barra branca**, quase sem marcas. Não sei se ela deveria clarear a fumaça.
6. **A Gravidade com Y positivo puxa para cima** (a dica diz), ao contrário do que a palavra "gravidade" faz esperar.
7. A fumaça **não sobe**: a velocidade que escolhi (15 a 35) e a gravidade (30) são pequenas, e **nada na tela diz quanto é "muito"**: chutei.
8. Não existe a fumaça pronta no *Novo emissor vazio*; ela está no menu *Partículas → Fumaça*, que eu **ignorei de propósito** (era do zero).

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A frase por forma é curta e boa. O que falta: dizer **como mudar o "sai para cima"** (é na aba *Movimento*, em *Direção*) |
| C2 | O anel tracejado do Ponto aparece na cena **só com o emissor escolhido**; some se eu clicar fora |
| C3 | O selo **"leve · 10" → "médio · 63"** mudou de cor (verde → laranja) quando aumentei o tamanho: bom, mas ninguém explica de onde vem o 63 |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As duas cores da fumaça | escrevi o valor por uma linha de código, **porque o seletor de cor do sistema não abre sem janela** | como é escolher a cor com o seletor de verdade |
| "Cabe em 1280×720" | medi a largura e vi a foto | a frase com um nome de forma mais longo |
| Para fora com Anel e Retângulo | **não repeti** | que o fogo sai em volta do anel e do retângulo |
| "Parece fumaça" | **minha** leitura de uma foto | o que o Humberto acharia |
| Telas | 1920×1080 e 1280×720; 1440×900 não | — |
