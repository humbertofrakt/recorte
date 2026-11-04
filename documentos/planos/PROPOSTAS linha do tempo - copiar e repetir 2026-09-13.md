# Propostas — a linha do tempo: copiar, colar e repetir — 13/09/2026

Pedido do Humberto: *"no Spriter eu pego um braço inteiro e colo na animação;
ponho um óculos no começo e mando ele se repetir pela animação toda; copio um
frame inteiro e colo, e o desenho copia a posição do frame."*

Fonte: `documentos/pesquisa/nova pesquisa/` (Spriter cap. 9, 13, 14, 15, 36 ·
Spine `spine-keys` e `spine-dopesheet` · DragonBones §3.10). O que não está no
manual oficial vai marcado **(sugestão)**.

---

## 1. O que os três fazem

| O gesto | Spriter | Spine | DragonBones |
|:---|:---|:---|:---|
| Copiar o quadro inteiro, mesmo entre chaves | **Ctrl+Shift+C**, cola em outro ponto ou em **outra animação** | copiar chaves escolhidas (Clipboard) | copiar quadro / recortar / colar |
| Colar em todas as chaves | **Ctrl+Shift+V**, mantendo o pai | — | — |
| Pôr uma peça nova numa animação pronta | **Ctrl+D**: o objeto entra em todos os quadros-chave | a peça vive na pose de repouso; entra sozinha | idem |
| Tirar a peça de tudo | **Shift+Delete** | apagar a linha | apagar quadro |
| Um atributo só em todos os quadros | cap. 9: muda o comprimento do antebraço em todos de uma vez | Offset / Adjust | — |
| Clonar ao arrastar | **segurar Ctrl** ao mover, girar, escalar | — | — |
| Empurrar chaves | arrastar, Ctrl pega várias | **Shift** (no tempo) e **Offset** (no valor) | empurrar quadro ← → |
| Tirar chave que não muda nada | — | **Clean Up** | — |
| Repetir uma curva | — | **Repeat**, no painel de curvas | número de repetições da animação |
| Chave de tudo × chave do escolhido | **Key all** e **Key selected** | Auto key, Key shown | chave automática |
| Uma faixa mestra com losango | — | — | **losango na primeira faixa**: pega todas as chaves do tempo |

---

## 2. O que o Recorte já faz

Três dos pedidos dele já existem, no todo ou em parte:

| Pedido | Hoje no Recorte |
|:---|:---|
| Copiar o frame inteiro e colar | **já faz.** `Ctrl+Shift+C` copia a pose (mesmo entre chaves, valor interpolado) e `Ctrl+V` cola no tempo de agora — inclusive em outra animação |
| O óculos valer pela animação toda | **já faz, e melhor.** O Spriter precisa do Ctrl+D porque não tem pose de repouso; o nosso formato tem (§5.1). Óculos posto na Montagem vale em **todas** as animações, sem chave nenhuma |
| Valor repetido em todas as chaves | **já faz.** `Ctrl+Shift+V` — "a mão fechada em todas as poses" |
| O losango do DragonBones | **já faz.** A linha **Resumo**: clicar pega todas as chaves do tempo, arrastar move todas juntas |
| Duplicar um membro inteiro | **já faz na Montagem.** `Duplicar` leva o osso, os filhos e os desenhos |
| Chavear tudo × chavear o escolhido | **já faz.** `Chavear` e `Chavear tudo` |
| Espelhar no tempo · espelhar os lados · fechar o ciclo · esticar | **já faz** |

**O buraco de verdade:** copiar o **braço inteiro já animado** (as chaves dele
e dos filhos) e colar em outro lugar. Hoje só marcando as chaves na folha com o
mouse, uma a uma.

---

## 3. As propostas

Ordem: o que ele pediu primeiro, depois o resto. Tamanho em lotes.

| # | Proposta | O que resolve | De onde | Tamanho |
|:---:|:---|:---|:---|:---:|
| **1** | **Copiar o membro** | escolher o osso do ombro na cena ou na Árvore e copiar **as chaves dele e de todos os filhos**. Colar em outro tempo, em outra animação | o pedido dele; Spriter cap. 13 levado ao galho | 1 |
| **2** | **Colar espelhado** | o braço direito animado vira o esquerdo ao colar. As regras `_e/_d`, `_esq/_dir` já existem em `timeline-tools.ts` | Spine (mirror) **(sugestão)** | ½ |
| **3** | **Somar e escalar valores** | "+10° na rotação em todas as chaves escolhidas"; "80% de tudo" para acalmar, "130%" para exagerar a animação inteira | Spine **Offset** e **Adjust** | 1 |
| **4** | **Empurrar por número** | mover as chaves escolhidas N quadros, e "empurrar tudo daqui para a frente" para abrir espaço no meio | Spine **Shift** · DragonBones ← → | ½ |
| **5** | **Repetir o trecho** | marcar um ciclo de passada e emendar 4 vezes, num comando | Spine **Repeat** **(sugestão)** | 1 |
| **6** | **Ctrl ao arrastar clona** | arrastar a chave com Ctrl deixa a original onde estava | Spriter (Ctrl ao arrastar) | ½ |
| **7** | **Aparece daqui · Some daqui** | o óculos que só entra no meio da animação. O formato já tem a chave de anexo e de `visible`; **não há porta na tela** | Spine (slot attachment) · Spriter cap. 10 | 1 |
| **8** | **Limpar chaves repetidas** | tira a chave que não muda nada — o lixo que o gravar-sozinho deixa | Spine **Clean Up** | ½ |
| **9** | **Copiar a pose só do escolhido** | hoje `Ctrl+Shift+C` leva a pose inteira. Copiar só o braço escolhido é o mesmo gesto, com menos linhas | Spriter **Key selected** | ½ |
| **10** | **Levar a animação para outro personagem** | o pedido de rig já anotado em `PEDIDOS reutilizar e aninhar 2026-09-13.md`, lote C | o pedido dele | 2 |

---

## 4. Se ele quiser o caminho curto

Três lotes, na ordem, e o pedido dele fica inteiro atendido:

| Lote | O que entra |
|:---:|:---|
| 1 | Copiar o membro (1) + Colar espelhado (2) |
| 2 | Somar e escalar (3) + Empurrar por número (4) + Ctrl clona (6) |
| 3 | Aparece daqui (7) + Limpar repetidas (8) + Pose do escolhido (9) |

Repetir o trecho (5) e a animação entre personagens (10) são conversa à parte —
o 10 já tem lugar no plano de reutilizar e aninhar.

**Nada foi feito. Isto é proposta, não plano.**

---

## 5. Acrescentado — segunda varredura, 13/09/2026

Ele perguntou: *"faltou alguma coisa?"* Faltou. Oito itens, todos do mesmo
assunto — copiar, reutilizar e repetir.

| # | O quê | De onde | Hoje |
|:---:|:---|:---|:---|
| **11** | **Copiar valendo a seleção da cena** — hoje `Copiar` só funciona com as chaves marcadas na folha, uma a uma. Escolher o ombro e copiar o galho inteiro devia bastar. `Escolher filhos` e `Escolher pais` já existem | Spriter **Z** e **Shift+Z** | encurta a proposta 1 |
| **12** | **Juntar outro arquivo no atual** — trazer o personagem e as animações de outro `.bone`. Hoje só há "De outro programa…" | Spriter **Import Another Project Into Current** (3 modos) · DragonBones "somar ao projeto atual" | falta |
| **13** | **Copiar a curva** — pegar a suavização de uma chave e colar em vinte. Os 7 formatos prontos já existem no Gráfico; guardar **a minha** curva e repetir, não | Spine **Store** e **Favor** · DragonBones (editor de curva) | falta |
| **14** | **Travar o conteúdo da folha** — um cadeado para as linhas não trocarem quando a seleção troca. Sem ele, copiar de uma animação para outra é perder as linhas no meio do caminho. O filtro já existe | Spine **Contents** / **Sync** | parcial |
| **15** | **Mover o 0,0 da animação inteira** — depois de colar um membro, empurrar tudo de uma vez, sem tocar em chave | Spriter **M + arrastar** | falta |
| **16** | **Chave de sequência de imagens** — o flipbook: boca falando, fumaça, fogo. O formato já tem `sequence`; **a tela não abre** | Spine **Sequence keys** | falta |
| **17** | **Alças da casca de cebola** — arrastar na régua quantos quadros antes e depois aparecem, em vez de número fixo | DragonBones §6.1 | parcial |
| **18** | **Copiar o pivô de uma imagem para outra** — hoje há "repetir para a pasta"; copiar de uma imagem escolhida para outra, não | Spriter **Copy / Paste Default Pivots** | parcial |

**O mais barato e o mais útil é o 11**: ele sozinho já atende *"pego o braço
inteiro e colo"*, e reaproveita o que a Árvore e a folha já sabem fazer.

---

## 6. Decisão — 13/09/2026

**Humberto: fazer na próxima semana (a partir de 20/09/2026).** Hoje não.
Nada começa antes do aval dele. Quando começar: o caminho curto da seção 4,
com o item **11** entrando no lote 1.

**Substituída em 14/09/2026.** O Humberto mandou pôr em produção. O Diretor
avaliou item a item em `AVALIACAO DO DIRETOR - linha do tempo em producao
2026-09-14.md`: entram agora **11 → 1 → 2 → 9 → 6 → 4 → 8**; o mandato está com
o Planejador.
