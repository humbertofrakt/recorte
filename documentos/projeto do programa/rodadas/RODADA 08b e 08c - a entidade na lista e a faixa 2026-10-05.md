# Rodadas 8b e 8c — a entidade na lista, e a faixa de verdade

Ficha escrita pelo `DIRETOR · ed2cab` em 05/10/2026.
**Esta rodada escreve código.** É a única que escreve código e usa a máquina enquanto roda.
São duas rodadas num chat só, porque sobrou um chat. **Um lote por vez, uma versão por lote.**

---

## Para quê

A rodada 1 conferiu a conexão no uso (`04 O QUE JA FAZ 2026-10-04.md`; leia a tabela "Conexão" inteira). As rodadas 8a e 8d fecharam o meio: a peça encaixada se escolhe, se move, volta, e ganha chave própria. **Falta o resto do que o Humberto decidiu** (`02 AS DECISOES`, seção 2):

> *"acho que ficou claro que adicionar uma entidade na animação faz ela fazer parte do projeto como uma base."*

> *"a intenção é que as entidades já venham animadas e finalizadas, por isso na linha do tempo elas já devem estar finalizadas. Talvez o usuário vá só mexer em alguns keyframes."*

> *"e se ela aparecer na linha do tempo e o usuário esticar ou encolher a animação"*

Os desenhos dele (a lista com *piloto-base: andar, pular, atacar, pilotar · motosserra-base: parado, ativo · mecha-base: andar, pular, atacar*) estão descritos na seção 2 das decisões, em "A entidade passa a fazer parte do projeto".

---

## O que tem de funcionar no fim

### 8b — a entidade na lista, e onde ela cai

| # | O quê | Hoje (rodada 1) | Foto de hoje |
|:---:|:---|:---|:---|
| C9 | A entidade adicionada **aparece na lista da aba Animações, como uma base**, com as animações dela embaixo do nome | a lista só mostra a base e as animações do herói | `22` |
| C10 | **Clicar numa animação da entidade** troca a linha do tempo para aquela animação. **A cena continua mostrando tudo montado** (o herói com a espada), e eu animo a espada vendo a mão | não há o que clicar | `22` |
| — | Clicar de volta numa animação do herói: a espada volta a ser entidade, dirigida pela faixa | — | — |
| A2 | **A entidade arrastada cai onde eu soltei**, presa ao osso mais perto do ponto, e não no `root` | cai no `root` | `33` |
| C18 | **Entidade que tem outra entidade dentro** entra inteira, com a de dentro, e ganha cartão na aba Entidades | *"O esqueleto aninhado … não foi aberto; esse slot fica vazio"*, e o cartão não aparece | `38`, `39` |

**O ponto difícil do C10** é o dos desenhos dele: *"base ou entidade depende de onde eu estou"*. Animando o herói, a espada é entidade. Animando a espada, **a espada é a base**, e o herói em volta é só o que se vê. O programa já sabe trocar o corpo em foco (degrau 5: `doc/projeto.ts`, `trocarFoco`; `panels/animations-actions.ts`, `openBody`). **Veja o que existe antes de construir.** O que falta é a cena continuar montada. Se a cena montada for grande demais, **feche o C9 e a lista, e me diga**: a cena montada vira lote próprio.

### 8c — a faixa de verdade

A faixa já existe (Linha do tempo → Detalhes → grupo "Entidades"), com o botão direito escolhendo a animação. `editor/src/anim/entity-band.ts`. Falta:

| # | O quê | Hoje | Foto de hoje |
|:---:|:---|:---|:---|
| C13 | **Puxar a ponta** da faixa: para fora, a entidade toca mais devagar; para dentro, mais rápido | a faixa não muda | `28` |
| C14 | **Arrastar a faixa inteira** muda quando ela começa | não muda | `29` |
| C15 | **Em laço**: entra rodando sozinha, a partir do quadro em que foi solta, sem fim. **Sem laço**: é uma faixa com tamanho, que termina | a faixa sempre vai até o fim; não há laço nem tamanho | `31`, `32` |
| — | Soltar a ponta **perto do fim da animação gruda no fim**, para a emenda do laço bater. Se a entidade não couber um número inteiro de vezes, o programa **avisa** que há salto na emenda | — | — |
| — | Esticar a animação de quem recebe (Mudar duração…) **estica junto** a faixa em que eu escolhi a animação | — | — |
| C11 | A faixa aparece **sem precisar abrir os Detalhes** | só com Detalhes aberto | `24`, `25` |
| **O salto** | Achado da rodada 8d: a espada **salta ~1,8** na primeira chave criada em **qualquer** peça, e não volta com `Ctrl+Z`. É o relógio da animação dela. Roteiros em `backup/fotos-obra/rodada-08d/roteiros/checar-espada*.mjs`. **Comece a 8c por aqui: prove, ache a causa, conserte** | — | — |

O formato já tem os campos: `timeScale` (esticar), `origin` (quando começa), a animação escolhida (spec §7.11). **Não invente campo.** Se faltar um, pare e me avise.

---

## Os lotes

| Lote | O quê |
|:---:|:---|
| 1 | A2: a entidade cai onde eu soltei |
| 2 | C9: a entidade na lista, com as animações dela |
| 3 | C10: clicar na animação da entidade, com a cena montada (ou o aviso de que virou lote próprio) |
| 4 | C18: a entidade com entidade dentro |
| 5 | o salto da espada |
| 6 | C13, C14: puxar a ponta e arrastar a faixa |
| 7 | C15, o grude no fim, o aviso da emenda, e esticar junto |
| 8 | C11: a faixa à vista sem os Detalhes |

A ordem é sugestão. **Feche o que couber, na ordem, e diga o que sobrou.** Não é para caber tudo num chat.

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro, `documentos/PARTES.md`, e o fim do `03` (o que as rodadas desta noite mudaram: o clique escolhe só a peça; o osso próprio da imagem; os menus novos, se a rodada 6 já tiver fechado) |
| 2 | **Olhe os três programas antes**, lendo o manual (`documentos/pesquisa/nova pesquisa/`): como o **Spriter** mostra e ajusta a animação de uma sub-entidade na linha do tempo; como o **DragonBones** faz com o boneco dentro do boneco. O manual do Spriter 1.4 pode não falar de sub-entidade (a rodada 8a não achou): se não falar, **diga, e siga a decisão do Humberto**, que está escrita. Não responda de memória |
| 3 | **Se o Spriter responde, faça como o Spriter e avise.** Não pergunte. Só me pergunte o que ele não tem |
| 4 | **Antes de provar que consertou, prove que o defeito existia** (regra 26), na versão de hoje, com foto |
| 5 | Regra 21: o aviso da emenda diz o número (*"a espada dura 0,7 s e o andar dura 1,0 s: ela dá um salto na emenda. Puxe a ponta até o fim"*) |
| 6 | Um desfazer por gesto. Arrastar a faixa é **um** passo de `Ctrl+Z` |
| 7 | Um lote = uma versão = um par de fotos em `backup/fotos-obra/rodada-08b/` e `rodada-08c/`. Com a tela apagada o navegador embutido não desenha: Chrome sem janela por protocolo |
| 8 | Teste novo no arquivo da parte. A contagem não cai: a referência por arquivo é o último `backup/contagem-testes_*.tsv`. Guarde a sua em cada fecho |
| 9 | Fecho de cada lote, **um processo de cada vez** (7,7 GB, apertados; meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"` (o próximo livre no `backup/INDICE.md`) · seção no `CHANGELOG.md` |
| 10 | Não toque em `formato/` nem nos runtimes sem me avisar. O salto da espada **pode** ser do runtime: se for, pare, mande-me a causa e a proposta, e siga por outro lote |
| 11 | **Mensagem do Diretor só chega quando o seu turno para.** Pergunta vai com a sua suposição; siga pelo que não depende dela; termine o turno quando só restar esperar |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, as fotos, as versões, o `programa/` montado |
| 2 | No `03`: as rodadas 8b e 8c passam a **entregue** (ou "entregue em parte", dizendo o que sobrou), com as versões e três linhas do que o Humberto vai ver |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` a cada lote fechado (rode `ListAgents` antes): a linha, **feita / pela metade / não feita** · os números do fecho, com a hora · o que achou nos manuais, com a página |

## O que NÃO fazer

| | |
|:---|:---|
| Não faça o slot virar base, nem o visualizador de montagem, nem "Este boneco" | são as rodadas 9, 10 e 11 |
| Não mexa nos menus | é a rodada 6 |
| Não edite `documentos/manual/` | só com a palavra do Humberto |
| **O Humberto está dormindo, ou longe.** Não pergunte nada a ele | dúvida vem para mim |
