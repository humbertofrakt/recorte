# Rodada 11 — "Este boneco": a tomada ao contrário

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Esta rodada mexe no FORMATO, nos DOIS RUNTIMES e no editor.** É a mais difícil da obra.
**Por isso ela tem duas partes, e a primeira não escreve código: é o PLANO.** O código só começa com o meu "pode", depois de eu ler o plano inteiro e refazer as contas à mão.

---

## Para quê

A decisão do Humberto (`02 AS DECISOES`, seção 2, "Este boneco: a tomada ao contrário"). Leia-a inteira, com os quatro exemplos de "No jogo". Em resumo, com as palavras dele:

> O poder rosa foi feito para receber o personagem. Mas eu estou animando o personagem e quero pôr o poder nele. Ponho o poder na animação; botão direito na imagem do meio do poder; na grade, o primeiro item é **Este boneco**.

| O que o programa faz |
|:---|
| A imagem do meio **não é desenhada**. Só marca o meio |
| O que está **atrás** dela é desenhado atrás do personagem **inteiro** |
| O que está **na frente** dela é desenhado na frente do personagem **inteiro** |

> **O formato tem de aguentar isto.** *"Vai ter que aguentar."*

Ou seja: uma peça encaixada (uma entidade) passa a ocupar **dois lugares** da ordem de desenho de quem a recebe: uma parte no fundo, outra na frente, com o boneco no meio.

---

## Parte 1 — o plano (sem código)

Entregue **um documento**: `documentos/projeto do programa/12 ESTE BONECO - o plano <data do relógio>.md`. Frases curtas, tabelas. Ele responde, nesta ordem:

| # | A pergunta | O que eu quero ler |
|:---:|:---|:---|
| 1 | **O que o formato já tem?** | O que a especificação (`formato/ESPECIFICACAO …`) diz hoje sobre: a ordem de desenho (base e por chave), o esqueleto aninhado (§7.11 a §7.13), a peça encaixada num slot, e a ordem de desenho **de dentro** da peça. Com o número da seção. E o que os dois runtimes fazem hoje: onde a peça aninhada entra na lista de desenho (um bloco só?) |
| 2 | **Como os outros fazem?** | Spine, Spriter e DragonBones: existe peça em dois lugares da ordem? (Manuais em `documentos/pesquisa/nova pesquisa/`. **Leia; não responda de memória.** Se nenhum faz, diga: então é nosso, e a régua é a decisão do Humberto) |
| 3 | **As opções de formato**, lado a lado | No mínimo duas. Para cada uma: o que se grava · quem lê · o que um leitor velho faz com um arquivo novo (tem de **avisar ou ignorar sem errar**, nunca desenhar errado calado: regra 21) · o que um arquivo velho faz num leitor novo (sai **byte a byte igual**) · o custo nos dois runtimes · o custo no Construct e no Godot (`leitor-construct/`, `leitor-godot/`: é "só ordem de lista", como disse a pesquisa `08`?) |
| 4 | **A sua recomendação**, e por quê | Uma. A menor mudança de formato que cumpre as três linhas do Humberto. Campo novo no núcleo é decisão dele, e **a decisão já está dada** para este caso: mas só o campo que for preciso, nem um a mais |
| 5 | **Os casos difíceis**, cada um com a resposta | a peça com "Este boneco" **dentro de outra** peça (níveis) · **duas** peças com "Este boneco" no mesmo boneco (quem fica mais atrás?) · a marca numa imagem que **some** (trocada por skin, escondida, apagada, com chave de visibilidade) · a ordem de desenho da peça **animada por chave**: a marca muda de lugar no meio da animação? · a ordem de desenho de **quem recebe** animada por chave · máscara (clipping) que começa atrás e acaba na frente · modo de mistura · a peça **solta para o jogo** (ninguém manda nela) · "Tirar a entidade": tudo volta · a mesma entidade usada em outro boneco **sem** a marca: a marca é da entidade, ou de onde ela foi encaixada? (O Humberto pôs o gesto na **imagem do meio do poder**, estando na animação do **personagem**: pense no que isso quer dizer, e diga) |
| 6 | **Os casos de conformidade novos** | A lista, com o nome e o que cada um olha. **O número esperado de cada um, calculado à mão, no próprio plano**: a lista de desenho, na ordem, peça por peça. Sem isso eu não dou o "pode". Regra 26: quem escreve o caso não é quem escreve o runtime: diga como vai separar (o caso e a conta à mão **antes** do código; os dois runtimes escritos sem um olhar o outro, como na rodada 15) |
| 7 | **O gesto no editor** | botão direito na imagem → a grade → o primeiro item, **Este boneco**; a porta no menu Entidades; como se vê na cena e na aba Ordem que a peça está nos dois lugares; como se desfaz; o que o rodapé diz |
| 8 | **Os lotes**, pequenos | formato e casos · runtime TypeScript · runtime Python · editor · e o que os leitores do Construct e do Godot precisam (só a lista; quem faz são as rodadas K5 e G5) |
| 9 | **O que você não sabe** | às claras |

**Régua da parte 1:** não abra o programa, não rode a suíte, não escreva em `editor/`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/`. Só ler, e escrever o plano. Pode rodar coisa leve para **ler** o que os runtimes devolvem hoje (um caso, um script de leitura), medindo a memória antes.

Terminou o plano: avise-me por `SendMessage`, com as cinco linhas principais, e **termine o turno**.

---

## Parte 2 — a obra (só com o meu "pode")

Pelos lotes do plano aprovado. As réguas de sempre valem (leia `CLAUDE.md`, o começo do `03`, `editor/src/contract.ts`): backup antes de escrever, com linha no INDICE · um lote, uma versão, fotos · o fecho inteiro, um processo por vez · conformidade nos **dois** runtimes, e eles concordam (`npm run conformidade:dois`, se existir; senão diga como provou) · arquivo sem o campo novo sai byte a byte igual, provado por teste · regra 26 e regra 28 em cada caso novo · fim de linha conferido nos bytes · mensagem minha só chega quando o seu turno para · não pergunte nada ao Humberto.

Enquanto você estiver na parte 2, você é o **único** que escreve em `editor/`, `runtime/`, `runtime-python/` e `formato/`.
