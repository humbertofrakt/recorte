# 04 · Peles

**O desenho inteiro, item por item:** `documentos/planos/PROJETO DAS PELES 2026-09-16.md` (com §4.1 de 17/09).
**O lote técnico:** `documentos/planos/PLANO peles em bloco - rascunho 2026-09-16.md` (B1, B2, B3, C, A — parado até Q30, Q31 e o código descongelar).

## A régua das peles

| O quê | Fonte |
|:---|:---|
| **Segue o Spine** (osso e regra podem ser só de uma pele), **num modo intuitivo e simples** como o Spriter. *"nisso vamos seguir o Spine — mas trazendo pra um modo intuitivo e simples"* | `PROJETO DAS PELES` §1 (Humberto, 16/09) |
| O limite do Spriter que ele apontou: *"exige que o programa tenha todos os ossos diferentes"* | idem |
| Objetivo: **pele como bloco, estilo Dota 2** — uma pele traz capa **ou** asas, com peça e osso próprios | `PESQUISA peles - Spriter Spine e o que ja temos 2026-09-16.md` |

## Decidido

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| I3 | Osso e regra **"Só com a pele"**: existem só com aquela pele ligada | `PESQUISA peles` §3 | Ficha/peles · Formato | **formato e teste sim** (`peles.test.ts`); **na tela, só a caixa marcada à mão** |
| I5 | **Um lápis só.** Lápis aceso numa pele: **osso, desenho e regra** novos nascem dela, **com sinal visual** (ícone com nome na dica) na Árvore e na cena. Teste ao vivo em 16/09: *"o lápis não faz nada"* para osso e regra | `PROJETO DAS PELES` §4 · `PESQUISA peles` §4.1, §7 | Ficha/peles · Cena · Árvore | a fazer |
| I6 | **Aplicar e modificar.** Com a pele ligada, puxar osso e pôr imagem só dela; tirar a pele e o personagem volta ao normal. O exemplo dele: **homem → lobisomem**, com o rabo a mais. Nenhum dos três programas tem | `PROJETO DAS PELES` §3–4 | Ficha/peles · Cena | a fazer (depende de I5) |
| I7 | **A pilha, como o Character Map do Spriter.** O olho sai. Duas colunas: **Feitas** e **Ativas**. Arrastar para Ativas liga, para fora desliga, dentro muda a ordem. *"No lugar do olho, eu queria poder clicar na skin e arrastar"* | `PROJETO DAS PELES` §4.1 (17/09) | Ficha/peles | a fazer (a lista em ordem já existe: `visible` em `skins-model.ts`) |
| I7b | **Editar a pele na mesma janela** (o Spriter abre outra) | `PROJETO DAS PELES` §4.1 (17/09) | Ficha/peles | a fazer |
| I7c | 🗣️ **A pele de CIMA de Ativas vence** onde duas trocam a mesma peça. Exemplo dele: esqueleto em cima (tronco) + anjo embaixo (pernas, armadura) → tronco do esqueleto e pernas do anjo. **Não é ordem de desenho** (asa atrás da armadura é ordem de desenho). **Muda a spec §4.4** — ver `10` F22 | RESPOSTAS lote 2, Q32 | Formato · Ficha/peles | a fazer |
| I7d | 🗣️ **Editar a pele = apertar o lápis** (o lápis continua, sem o olho) | RESPOSTAS lote 2, Q34 | Ficha/peles | a fazer |
| — | 🗣️ **Sem cor na pele e sem pele "de teste"** que não vai ao jogo: quem não quer, apaga. O que ele queria era **cor nos ossos ao pintar pesos — já existe** (modo Pesos) | RESPOSTAS lote 2, Q19, Q19b | — | nenhum campo novo |
| I12 | 🗣️ **A pele é do corpo** (o Character Map do Spriter). A **pele de fora** (Dota 2) é a mesma pele salva em arquivo (`rig` §2.8). A **animação reaproveitada** (Mixamo) **não é pele**. As três convivem | RESPOSTAS lote 3, Q30 · `PELE DO CORPO, PELE EXTERNA…` 17/09 | Formato · Ficha/peles | a fazer |
| I13 | 🗣️ **Lobisomem: os dois.** Pode ser pele do homem **e** pode virar base: faz a base do homem, anima, faz a pele lobisomem e **transforma a pele numa base** (promover pele → base) | RESPOSTAS lote 3, Q38 | Ficha/peles · Animações | a fazer |
| I14 | 🗣️ **Na virada de corpo, a pilha de peles passa ou não: quem faz decide.** Vira opção, por projeto | RESPOSTAS lote 3, Q39 | Formato · Ficha/peles | a fazer |
| I15 | 🗣️ **A pele de fora traz osso próprio** (o rabo) — campo novo aprovado, `10` F23 | RESPOSTAS lote 3, Q40 | Formato · Ficha/peles | a fazer |
| I4 | Trocar a **pasta inteira** — ver `03 imagens e pivo.md` | `PROJETO DAS PELES` §4 | Imagens e pasta | a fazer |
| I9 | 🗣️ **Seguir o Spriter para fazer a pele**: clicar na pele → fazer o character map dela. Trocar **uma imagem por vez ou a pasta inteira** de uma vez. **PSD aceito: grupo do PSD = pasta** | RESPOSTAS Q17/Q18 | Ficha/peles · Imagens e pasta | a fazer |
| I10 | 🗣️ A `default` **não fica sempre no fundo**: há peles que substituem muito (Dota, lobisomem). **Muda o formato**: hoje a spec §2 diz "a `default`, se existe, está sempre ativa, por baixo" — ver `10` F19 | RESPOSTAS Q33 | Formato · Ficha/peles | a fazer |
| I11 | 🗣️ A **animação para outro personagem** tem de **encaixar no sistema de peles** — ver `02` E18 | RESPOSTAS Q14 | Formato · Peles | a fazer |

## O que já existe e fica

| O quê | Fonte |
|:---|:---|
| Pele traz desenho que o corpo não tinha · peles empilham · duplicar e apagar · trocar a imagem em todas as peles | `PROJETO DAS PELES` §2, §4 · MAN 3 |
| Exportar **por pele** (atlas 50,6% menor, medido) · `npm run fatiar` · o jogo combina com `setSkin([...])` | `PROJETO DAS PELES` §4 |
| No formato: `includes`, `drawOrder` por pele, **a última adicionada manda** (a `default` sempre por baixo **muda** — I10) | `formato/ESPECIFICACAO 2026-09-06.md` §2, §4.4 |

**Atenção:** o capítulo 3 do manual diz *"tudo funciona hoje"*. **Não vale para o lápis** (I5).

## Propostas, sem palavra dele (💡)

| O quê | Fonte |
|:---|:---|
| Ao acender o lápis, uma linha avisa "editando a pele X", e o olho liga junto | `PROJETO DAS PELES` §4 |
| Nome do botão "Trocar pasta de origem…" | idem |
| Aviso "N ossos só desta pele" no painel | `PESQUISA peles` §5 |
| Peles em arquivo próprio (`.scms` do Spriter) · juntar peles ativas · gravar no corpo (Merge / Bake) | `O QUE O SPRITER TEM E NOS FALTA` faltas #2–3 |

## Perguntas deste assunto

**Q30 — pesquisa pronta** (`documentos/planos/PELE DO CORPO, PELE EXTERNA OU ANIMACAO REAPROVEITADA 2026-09-17.md`). 💡 Recomendação: **a pele é do corpo**; a pele de fora (Dota) é a mesma pele em arquivo com `rig`; a animação reaproveitada (Mixamo) não é pele; as três convivem sem campo novo. Esperando a palavra dele, com Q38–Q42. Respondidas em 17/09: Q17, Q18, Q19, Q32, Q33, Q34, Q35. Fechada pelo Planejador: **Q31 — lotes B e C no degrau 8; lote A a qualquer hora**.
Q32: **a de cima vence** (I7c). O indício do Spriter era o contrário (o de baixo cobre, não confirmado) — vale a palavra dele.
