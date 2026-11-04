# A linha do tempo conferida — lote 5 e a prova final (v32.3) — 06/10/2026

Rodada 40, lote 5, o último. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.3** (o "Sobre" diz v32.3; o zip `recorte v32.3 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 17h18 a 17h22, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-40-conferida/lote5/` (4) |
| Material | o herói de exemplo, aberto pelo próprio programa; **uma animação nova, `andar`, feita do zero**. **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **6** (1, 2, 3, 4, 5, 6) | 0 | 0 | 6 |

## Os defeitos

Nenhum que pare o uso. Só pequenos:

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **O *Empurrar* e o *Deslocar* fecham a janela quando o texto não é entendido** (*"Não entendi "0,2"…"*): a mensagem é boa, mas quem digitou errado **tem de abrir o menu de novo**; e, se no meio apertar `Ctrl+Z`, **a escolha das chaves se perde** (*"Marque uma ou mais chaves na folha para empurrar"*) | 3 | — |
| 2 | *Pequeno.* **O *Colar espelhado* mora em *Editar → Pose ▸***, não em *Animação* nem na barra da folha. Quem copia as chaves na folha **não o acha sozinho** (foi o 1.º tropeço da prova final) | 6 | — |
| 3 | *Pequeno.* **Para pôr a agulha em 0,5 s e em 1 s eu usei 15 e 30 cliques no *Quadro seguinte*** (o roteiro da minha ferramenta). **Não testei** o campo de tempo nem a régua: um usuário novo tem outros caminhos, mas **eu não os provei** | 6 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | A régua diz 0,00 · 0,10 · 0,20 s; o eixo do gráfico tem "°" e o tempo "s"; "%" na velocidade; o gráfico cabe na faixa em 1920 | **vi funcionar** | **Régua:** *0,00 s · 0,10 s · 0,20 s · 0,30 s … 1,00 s* (na v31.x diziam *0,17 · 0,33 · 0,50*). **Gráfico (*Curvas*):** o eixo do alto diz ***−60° · −80° · −100°*** e o de baixo ***0,00 s · 0,50 s · 1,00 s***: **° e s presentes**. **Velocidade:** o campo do tocador mostra ***"100 %"*** (o número vem com o **%**). **Cabe na faixa:** em 1920×1080, com a faixa na altura de abertura, o gráfico mostra **a curva inteira, os três valores e o eixo do tempo embaixo**, sem corte | `G0_curvas` · `E3_depois_de_empurrar` |
| 2 | `Ctrl+Z` de uma chave apagada diz *"Desfeito: Apagar chave"* | **vi funcionar** | Apaguei a chave de 0,70 s da `leg_b` com **duplo clique** (*"Chave de 0,70 s apagada."*) e apertei `Ctrl+Z`: ***"Desfeito: Apagar chave."*** e a chave **voltou** com o mesmo valor (−60°) e a mesma curva (*Linear*). *(No lote 3 o rodapé dizia a frase de gravar.)* | — |
| 3 | *Empurrar* e *Deslocar* aceitam **"6"** (quadros) e **"0,2 s"** (segundos); **"0,2" sozinho é recusado** e a mensagem diz como escrever | **vi funcionar** | **Empurrar:** `6` → *"3 chaves andaram 6 quadros (0,20 s) para a frente. A animação cresceu de 1,20 s para 1,40 s."*; `0,2 s` → *"4 chaves andaram 6 quadros (0,20 s) para a frente. A animação cresceu de 1,00 s para 1,20 s."* **Deslocar:** `6` e `0,2 s` → ambos *"1 linha deslocada 6 quadros = 0,20 s, dando a volta no fim."* **`0,2` sozinho** (no Empurrar): ***"Não entendi "0,2". Quadros inteiros (6) ou segundos com "s" (0,2 s)."*** e **nada andou**. **A dica da caixa** agora diz: *"Quadros inteiros (6) ou segundos com "s" (0,2 s). 6 quadros = 0,20 s."* (o rótulo é *"Quadros ou segundos"*). No *Deslocar* a **meia volta se ajusta à duração** (*"18 quadros = 0,60 s"* numa animação de 1,20 s) | `E3_depois_de_empurrar` |
| 4 | *Colar espelhado* diz quantas chaves e em que tempos foram para a perna de trás | **vi funcionar** | ***"Colado espelhado: 3 valores trocados de lado. **3 chaves: leg_b em 0,00 · 0,50 · 1,00 s.** Deu a volta no fim do laço: a duração não mudou."*** | `D0_colado_espelhado` |
| 5 | O menu *Chaves* não mostra mais *"Abra uma animação primeiro"* com a animação aberta | **vi funcionar** | Li o **título** de cada item de *Animação → Chaves ▸* (*Selecionar todas · Esticar seleção… · Espelhar no tempo · Fechar ciclo · Espelhar esquerda e direita… · Empurrar as chaves… · Deslocar em laço… · Limpar chaves repetidas*) com a animação `andar` aberta: **todos vazios**, **nenhum "Abra uma animação primeiro"** | — |
| 6 | **PROVA FINAL:** animar um andar de 1 s com curva de aceleração, copiar o membro para o outro lado espelhado e empurrar as chaves para abrir espaço — só pela tela, como usuário novo. Passos, tropeços, foto | **vi funcionar** | **Chegou ao fim em 22 gestos** (abaixo). **Resultado:** a `leg` com *−60° → −110° (*Entrada suave*) → −60°*, a `leg_b` **com a volta** (*−110° → −60° → −110°*, com a *Entrada suave* no 0 s), e, depois do empurrão, **a animação com 1,20 s** (`leg` e `leg_b` com chaves em **0,00 · 0,70 · 1,20 s**): o espaço de 0,20 s **aberto** entre o 0 s e o resto | `E3_depois_de_empurrar` |

## A prova final — os 22 gestos

| # | O que fiz | O que vi |
|:---:|:---|:---|
| 1 | *Animação → Nova animação* | nasce *"animação"*, **1,00 s**, em laço, com o nome pronto para escrever |
| 2 | digitar *andar* e `Enter` | *"Renomeou a animação "animação" para "andar""* |
| 3 | clicar o osso `leg` na Árvore | *"Osso: leg"* |
| 4 | agulha em 0 s | — |
| 5 | digitar **−60** no *Ângulo* | *"Chave em 0,00 s: Rotação de leg"* (a chave **nasce sozinha**) |
| 6 | agulha em 0,5 s | *(15 cliques no Quadro seguinte, o meu roteiro)* |
| 7 | **−110** | *"Chave em 0,50 s…"* |
| 8 | agulha em 1 s | *(30 cliques)* |
| 9 | **−60** | *"Chave em 1,00 s…"* |
| 10 | botão *Detalhes* | a folha abre com as linhas de osso |
| 11 | botão direito na chave de 0,5 s | menu *Linear · Suave · Entrada suave · Saída suave · Parada · Curva à mão… · Apagar chave* |
| 12 | *Entrada suave* | *"1 chave(s) agora em Entrada suave."* |
| 13–15 | escolher as 3 chaves no *Resumo* (clique, `Ctrl+clique` ×2) | os três losangos marcados |
| 16 | *Copiar* | ***"3 chaves copiadas. Ctrl+V cola na agulha."*** |
| 17 | agulha em 0,5 s | *(15 cliques)* |
| 18 | *Editar → Pose ▸ → Colar espelhado* | ***"…3 chaves: leg_b em 0,00 · 0,50 · 1,00 s. Deu a volta no fim do laço: a duração não mudou."*** |
| 19–20 | escolher as chaves de 0,5 e 1 s no *Resumo* (clique + `Ctrl+clique`) | *"4 chaves marcadas"* no diálogo (duas linhas) |
| 21 | *Animação → Chaves ▸ → Empurrar as chaves…* | diálogo *"Quadros ou segundos"*, *Lado*, *O que anda* (*"Estas e tudo o que vem depois — abre espaço"*) |
| 22 | digitar `0,2 s` e *Empurrar* | ***"4 chaves andaram 6 quadros (0,20 s) para a frente. A animação cresceu de 1,00 s para 1,20 s."*** |

**Tropeços de um usuário novo:** **(T1)** o *Colar espelhado* está em *Editar → Pose*, **fora de onde se copiou** (defeito 2). **(T2)** o texto errado fecha a janela (defeito 1). **(T3)** a agulha em tempo exato: **eu não tentei o campo de tempo** (defeito 3). **(T4)** o `Ctrl+Z` na hora errada **perde a escolha de chaves**: é preciso escolher de novo. **(T5)** as chaves do *Colar espelhado* vêm **com a mesma curva** (*Entrada suave* foi para `leg_b` em **0,00 s**, não em 0,5 s): faz sentido pela volta do laço, mas **surpreende** quem espera a curva no mesmo tempo.

## A rodada 40 está FEITA?

**Sim.** As seis coisas pedidas **funcionam** e a prova final **chega ao fim só pela tela**, com **22 gestos**, sem recusa, sem texto em inglês e sem erro. O que sobra são três **pequenos** (a janela que fecha ao errar o texto, o *Colar espelhado* escondido em *Editar*, e o que eu **não** provei: o campo de tempo e a régua para pôr a agulha).

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A agulha em 0,5 s e 1 s | **15 e 30 cliques** no *Quadro seguinte* | o campo de tempo, a régua |
| O andar | **uma perna só** (`leg`) por ângulo digitado; a de trás veio do *Colar espelhado* | um andar completo (braços, corpo) |
| O ciclo tocando | só fotos **paradas** | o movimento em tempo real |
| "%" na velocidade | li o campo do tocador (*100 %*); **não** achei outro lugar de velocidade | outra velocidade em outra tela |
| Dica velha do menu *Chaves* | li o texto do **título** | que o balão apareça assim |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
