# A Árvore, a Ordem e as Propriedades conferidas — lote 2, o número se mexe e fala (v32.6) — 06/10/2026

Rodada 43, lote 2. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.6** (o "Sobre" diz v32.6; o zip `recorte v32.6 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 18h13 a 18h16, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-43-conferida/lote2/` (4) |
| Material | o **herói de exemplo já aberto** (sem *Novo projeto*, como pedido), ossos `leg`, `shin`, `forearm`. Puxei o divisor para a ficha caber. **Nada foi salvo**; desfiz o que mexi |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1 a 4) | 0 | 0 | 4 |

## Os defeitos

Nenhum que pare o uso. Só pequenos:

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **O "mundo" só aparece quando difere do local.** No `leg` (pai sem giro) **não há leitura**; em `shin`, `foot` e `forearm` há. Faz sentido, mas **quem procura "mundo" no `leg` não acha** e não sabe se é defeito. A dica do disco **não diz** *"só aparece quando o osso tem pais girados"* | 4 | `G0_mundo_forearm` |
| 2 | *Dúvida, não afirmo defeito.* **Em animação aberta o texto ao lado do disco é *"base 3,5"*** (o valor da base) no `leg`; **não vi o "mundo" junto**. Como o `leg` **não tem pais girados**, o mundo não apareceria de qualquer jeito: **não provei** se, num osso como o `forearm`, a animação aberta mostra o *"base"* **e** o *"mundo"* ou só um dos dois | 4 | `E0_arrastando_disco` |
| 3 | *Pequeno.* **Digitar numa regra de IK deixa o campo com o valor "recusado".** No `forearm`, a regra `ik_arm` manda no osso: digitei *50* e o rodapé disse *"forearm não girou: a regra ik_arm manda nele. Desligue o olho dela na aba Regras"* (**boa mensagem**), **mas o campo ficou com *50*** mesmo depois de escolher outro osso e voltar (*Ctrl+Z* devolveu o 20). O número gravado é **50**; o osso, segurado pela regra, **não o mostra** | 3 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Arrastar o **rótulo** de um número da ficha (X, Ângulo…) muda o valor; `Shift` anda 10×, `Alt` fino; **um `Ctrl+Z` desfaz o arrasto inteiro** | **vi funcionar** | Os rótulos (**X, Y, Escala X, Escala Y, Ângulo, Comprimento, Inclinação X e Y**) têm o cursor ***ew-resize*** (setas para os lados) e a dica diz *"Arraste o disco ou o rótulo"*. **Arrastei o rótulo *X* do `leg` 40 px para a direita, 3 vezes:** **sem tecla: 4 → 44** (1 por px) · ***Shift*: 44 → 444** (**10×**, +400) · ***Alt*: 444 → 448** (**fino**, +4: 0,1 por px). Rodapé: *"Mudar X"*. **Histórico: três passos** (*Mudar X* ×3, **um por arrasto**, não um por pixel). **`Ctrl+Z`**: 448 → **444** → **44** → **4**: **cada `Ctrl+Z` desfez um arrasto inteiro** | `B0_depois_dos_arrastos` |
| 2 | A *Ficha rápida* **aceita conta**: `90+15` dá 105; `*2` dobra; `+-10` | **vi funcionar** | No *Ângulo* (−85): `90+15` → **105** · `*2` → **210** · `+-10` → **200**. No *X*: `10*3` → **30** · `/2` → **15** · `-5` → **−5** (**troca o valor**, não subtrai; só `+-` e `*`/`/` são relativos). **A vírgula brasileira vale:** `1,5+2` → **3,5**. Cada conta virou **um passo** (*Mudar Ângulo*, *Mudar X*). A dica do campo diz: *"…ou digite (aceita conta: 90+15)"* | `C0_contas` |
| 3 | Digitar `"abc"` num número: o rodapé diz que não é número e o valor **fica como estava** | **vi funcionar** | `abc` no *X* (−5): ***"abc" não é número: X ficou -5 px.*** e o campo voltou a **−5**. `3x` no *Y* (−4): ***"3x" não é número: Y ficou -4 px.*** e o campo voltou a **−4**. **Nenhum passo no histórico** (nada gravou) | `C0_contas` |
| 4 | Ao lado do disco do *Ângulo* aparece o **giro no mundo** (*"mundo −77°"*), **só leitura** | **vi funcionar** | No `forearm`: ***"mundo −77°"*** ao lado do disco (o campo diz **20°**), com a dica ***"Giro no mundo: −76,76° (o deste osso somado ao dos pais). Só para ler: o campo grava o giro local, em relação ao pai"***. É um ***span*** (texto), **não** um campo. Outros: `shin` *"mundo −1°"* (local −5), `foot` *"mundo 94°"* (local 95). **Acompanha a edição:** no `shin` digitei **30** (local) e o mundo foi de **−1,5° para 33,5°** (+35, como deve ser); `Ctrl+Z` voltou a −1,5° | `G0_mundo_forearm` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **disco** do ângulo também se arrasta (*"Arraste o disco ou o rótulo"*). Puxei o disco no `leg`: o ângulo virou **−160,97°** e **gravou uma chave** (*"Chave em 0,00 s: Rotação de leg"*, com `idle` aberto): **funciona**, mas **pega pesado** num puxão curto (11 px → 164°) |
| C2 | Quando dois números seguidos mudam **o mesmo campo**, o histórico **funde** (vi *Mudar Ângulo · Mudar X · Mudar Ângulo*, e não cinco passos): bom |
| C3 | O texto da conta **não aparece** no campo depois: só o resultado (*105*). Para ver como se chegou lá é preciso o histórico |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Os arrastos | **mouse e teclado por protocolo**: apertei, movi em 10 passos e soltei, com a tecla pedida | o arrasto com a mão, e a **sensação** de 10× e fino |
| `Alt` e `Shift` | mandei os modificadores no evento do mouse | outra tecla que o sistema roube (`Alt` no Windows pode abrir o menu) |
| O "mundo" do `forearm` com regra | **não consegui girar** (a regra de IK segura) | que o mundo acompanha **o IK**; vi no `shin`, que não tem regra |
| Só `leg`, `shin`, `foot`, `forearm`, `hips`, `torso` | — | desenho, caixa, ponto, emissor |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
