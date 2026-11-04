# Plano — a linha do tempo: copiar e colar — 14/09/2026

Mandato: `AVALIACAO DO DIRETOR - linha do tempo em producao 2026-09-14.md`.
Propostas: `PROPOSTAS linha do tempo - copiar e repetir 2026-09-13.md`.

**Um chat só**, na parte **Linha do tempo**. Sete itens, ~4,5 lotes, **uma
versão por lote**.

A frase que manda em tudo: *"pego o braço inteiro e colo."* Sete itens, um
assunto só.

**A lei do projeto:** como o Spriter faz. Onde o Spriter tiver o gesto, é o
dele; onde não tiver, olhe Spine e DragonBones, nessa ordem, e escreva nos
Desvios o que escolheu e por quê.

## A ordem, que é a do Diretor e não se troca

| Ordem | # | O quê | Tamanho |
|:---:|:---:|:---|:---:|
| 1 | **11** | **Copiar valendo a seleção da cena.** Hoje `Copiar` só pega as chaves marcadas na folha, uma a uma. Escolher o ombro na cena ou na Árvore e copiar tem de bastar. `Escolher filhos` e `Escolher pais` já existem; o Spriter faz com `Z` e `Shift+Z` | ½ |
| 2 | **1** | **Copiar o membro**: as chaves do osso **e de todos os filhos**, para colar noutro tempo ou noutra animação. Com o 11 pronto, encolhe | 1 |
| 3 | **2** | **Colar espelhado**: o braço direito animado vira o esquerdo. As regras `_e/_d`, `_esq/_dir` já estão em `anim/timeline-tools.ts` | ½ |
| 4 | **9** | **Copiar a pose só do escolhido**. Hoje `Ctrl+Shift+C` leva a pose inteira | ½ |
| 5 | **6** | **Ctrl ao arrastar clona** a chave, deixando a original onde estava. Gesto de Spriter | ½ |
| 6 | **4** | **Empurrar por número**: mover as chaves escolhidas N quadros, e "empurrar tudo daqui para a frente" para abrir espaço no meio | ½ |
| 7 | **8** | **Limpar chaves repetidas**: tirar a chave que não muda nada — o lixo que o gravar-sozinho deixa | ½ |

**O 11 primeiro** porque é o mais barato dos dezoito e sozinho já atende o
pedido dele. Não comece pelo 1.

## Parte, arquivos e testes

`panels/dopesheet*.ts`, `panels/graph.ts`, `anim/timeline-tools.ts`,
`anim/keying.ts`. Testes: `linha-do-tempo.test.ts`, `chaves.test.ts` (**dividido** com o executor da chave `parent`: cada um só acrescenta o seu `describe`),
`curvas.test.ts`, `eixos-e-chaves.test.ts`.

**Não toque em:** `doc/reparent.ts` e `panels/tree-*.ts` (o executor da chave
`parent`) · `mesh/*` e `panels/mesh-panel.ts` (o executor da malha) ·
`ui/panel-groups.ts` e `ui/shell.*` (o executor da coluna).

`panels/dopesheet-player.ts` é seu: o lote 3 do fluxo criar e animar ("o tocador
nunca apaga") espera você fechar. Não é impedimento, é ordem.

## Fora desta rodada, e o Diretor não autoriza sem falar com o Humberto

Item 16 (chave `sequence`: abre porta nova do formato, regra 7) · item 12
(juntar outro `.bone`: plano próprio) · item 10 (animação para outro
personagem: já tem lugar em `PEDIDOS reutilizar e aninhar`, lote C) · itens
3, 5, 7, 13, 14, 15, 17, 18 (ficam para depois).

## As regras da casa

Backup datado antes de escrever, com linha no `backup/INDICE.md` · teste novo no
arquivo da parte · a contagem nunca cai · fecho com `npx vitest run`,
`npx tsc --noEmit -p editor/tsconfig.json`, `node ferramentas/conformidade.mjs`,
`npm run roteiro`, `npm run medir` · número do `versao.py` na hora do fecho,
**um fecho de cada vez**: avise o Planejador antes · desvio escrito abaixo.

## Desvios

**Item 11 — feito, fecho pendente.** `vitest`, `tsc` e `conformidade` verdes
(2.768 passam, 29 pulados, subiu 4 e nenhum caiu). `roteiro` e `medir`
quebram fora da minha parte, em `mesh/mesh-doc.ts` ("does not provide an
export named 'meshEditBlocked'", que `panels/mesh-panel.ts` importa) — parece
o executor da malha no meio de uma edição. Avisei o Planejador em 14/09/2026
e fico esperando a vez do fecho.

**Item 1 — feito.** "Copiar" sem chave marcada na folha agora vale o MEMBRO
inteiro: o osso escolhido e todos os filhos (`selectChildren`, de
`doc/duplicate.ts` — a mesma conta que o `Duplicar` já usava), não só o osso
sozinho. Não precisa mais apertar "Escolher filhos" antes. O planejador
mandou seguir sem esperar o fecho, e disse que o zip só sai com a árvore
parada — os itens ficam empilhados até lá. `vitest` da minha parte (345
testes: chaves, linha-do-tempo, tocador, curvas, eixos-e-chaves, fronteiras)
e `tsc` verdes; `conformidade` 53/53. A suíte inteira tem 4 a 5 quebras
instáveis em `arvore`/`arquivo`/`animando`/`ajuda`, todas sobre a ferramenta
Malha em Montagem×Animando — fora da minha parte, e mudam de teste a cada
rodada, sinal de outro chat salvando ao mesmo tempo.

**Item 2 — feito.** "Colar espelhado", no menu Animação, junto de "Espelhar
esquerda e direita…": cola o clipboard trocando o nome do osso/slot pelo par
(regra `_e/_d` da mesma caixa), sem tocar no valor — braço direito animado
vira o esquerdo. Função pura nova `mirrorClipboard` em `anim/timeline-tools.ts`.

Toquei três arquivos de passagem (`ui/keys.ts`, `ui/actions-table.ts`,
`ui/menus.ts`), só acrescentando. Primeira tentativa pôs o item no menu
Editar e estourou o limite de 6 itens por grupo (`auditMenus`); troquei para
o menu Animação, ao lado de Espelhar esquerda e direita, onde cabe. Também
mexi em `editor/testes/acoes.test.ts` (não é teste da minha parte, mas o
número `ACTION_TABLE.length` é mecânico e quebra com qualquer ação nova —
175 → 176, mesmo padrão do comentário que já estava lá para a v12.x).

Notei uma edição de outro chat no MEU `chaves.test.ts` (import de
`doc/reparent.ts`, de quem cuida da chave `parent`) — não é passagem
declarada em `PARTES.md`, mas não mexi nela, só avisei o Planejador.

Suíte inteira: **2.789 passam, 29 pulados (2.818)** — a malha estabilizou.
`tsc` limpo, `conformidade` 53/53. Tudo verde agora.

**Item 9 — começado e DESFEITO, 14/09/2026.** O Planejador mandou parar: a
conta da semana em 91%, reseta só amanhã de manhã. Tinha código em
`anim/keying.ts` (`poseAt` ganhando um filtro `targets`) e
`panels/dopesheet-actions.ts` (`copyPose` usando a seleção), mais três testes
em `linha-do-tempo.test.ts`. Tudo desfeito de volta ao backup de antes
(`backup/keying_2026-09-14_antes-do-item-9-pose-do-escolhido.ts`,
`backup/dopesheet-actions_2026-09-14_antes-do-item-9-pose-do-escolhido.ts`) —
árvore limpa vale mais que item a mais. Suíte, `tsc` e `conformidade`
conferidos depois de desfazer: **2.789 passam, 29 pulados**, iguais a antes —
nenhum resto. Fica na fila com 6, 4 e 8, para quando o crédito voltar.

## Para o CHANGELOG, quando o fecho rodar `versao.py`

Texto pronto para colar, faltando só o número da versão e a data de quem
fechar:

> ### vN.N — Copiar e colar na linha do tempo: a seleção da cena vale — 14/09/2026
>
> O Humberto, sobre o Spriter: *"pego o braço inteiro e colo."* Três passos
> desse pedido, prontos:
>
> - **Copiar vale a seleção da cena ou da Árvore.** Escolher o osso ou o slot
>   e apertar Copiar (`Ctrl+C`) basta — não precisa mais marcar chave por
>   chave na folha.
> - **Copiar leva o membro inteiro.** O osso escolhido leva as chaves dele E
>   as de todos os filhos, a mesma conta do Duplicar — sem precisar de
>   "Escolher filhos" antes.
> - **Colar espelhado**, novo no menu Animação: o braço direito animado vira
>   o esquerdo ao colar, pela regra de nome `_e/_d` (a mesma caixa de
>   "Espelhar esquerda e direita").

## Para o CHANGELOG da v12.9 (item 9 + item 6)

> ### vN.N — Copiar a pose do escolhido, um comando próprio; Ctrl clona a chave — 14/09/2026
>
> **O defeito que eu mesmo causei e consertei, escrito porque vale mais
> contado do que calado:** a primeira versão do item 9 fazia `Ctrl+Shift+C`
> ("Copiar a pose") mudar de sentido conforme a seleção — pose inteira sem
> nada escolhido, só o membro com um osso escolhido. Passou em todos os
> testes, e quebrou o Roteiro dos 30 minutos: o passo 11 tinha um osso
> escolhido e pedia a pose inteira, e levou só o braço. **Comando que muda de
> sentido conforme a seleção é armadilha** — a mão escolhe um osso para
> mexer nele, depois pede a pose inteira sem lembrar que algo ainda está
> selecionado, e leva menos do que pediu, sem aviso. A lei resolveu: no
> Spriter, "Key all" e "Key selected" são DOIS botões, nunca um só variando.
>
> - **Copiar a pose** (`Ctrl+Shift+C`) volta a ser SEMPRE a pose inteira.
> - **Copiar a pose do escolhido**, comando novo e próprio, no menu Animação:
>   só a pose do osso ou slot escolhido (e os filhos dele).
> - **`Ctrl` ao arrastar uma chave clona**, deixando a original onde estava —
>   gesto de Spriter. No caminho, achamos que `Ctrl` do arrasto de chave já
>   tinha dono ("empurrar as seguintes", item 89) e nunca funcionava: um
>   `return` antecipado no código matava a linha que ligaria o gesto, sem
>   ninguém notar — a função existia, tinha teste, passava verde, e o gesto
>   nunca chegava nela. **Teste de função não prova gesto** — é a lição que
>   faltava depois da prova de salvar/fechar/reabrir (v12.7). `Ctrl` agora
>   clona; o empurrar-ao-arrastar fica sem tecla por ora (função e teste
>   guardados), até o Humberto decidir uma porta própria para ele.

**Desvio — prova de salvar/fechar/reabrir, 14/09/2026.** Pedido à parte do
Planejador, fora dos sete itens: o passo 14 do `roteiro-30.mjs` recarregava a
página de mentira (limpava a memória, não fechava de verdade) e o diff de
"reaberto ≠ salvo" só citava o nome do campo, não o item da lista. Consertado
em `ferramentas/provas/roteiro-30.mjs`: recarregamento de verdade
(`Page.navigate`), recusa a janela de recuperação de rascunho para não
mascarar o teste, os bytes da pasta atravessam pelo Node, e o passo 13 confere
que o `.bone` salvo não leva arranjo de tela (só os cinco campos de
`EditorState`). 14 de 14 passos continuam passando. `vitest`, `tsc`,
`conformidade` e `medir` conferidos depois — nada mudou fora do esperado.
Fecho pendente, versão própria (regra nova da rodada: peça pequena, versão
sua) — avisei o Planejador antes do `versao.py`.

**Fechada como v12.7.** `tsc` e `vitest` verdes na hora do fecho (nada dos
outros dois chats vermelho); `versao.py`, `montar-programa.py`, CHANGELOG,
ESTADO e INDICE feitos.

**Item 9 — refeito e fechado, 14/09/2026.** Desta vez até o fim, com versão
própria. `poseAt` (`anim/keying.ts`) ganhou o parâmetro opcional `targets`,
puro e retrocompatível (omitido = pose inteira, como sempre). `copyPose`
(`panels/dopesheet-actions.ts`) usa `selectChildren(doc.selection)` — a mesma
conta dos itens 1 e 11 — para copiar só a pose do membro escolhido, quando há
seleção; sem nada escolhido, a pose inteira, sem mudança de comportamento.
Três testes novos em `linha-do-tempo.test.ts`. `vitest` (2.796 passam, 29
pulados, subiu 5 e nenhum caiu), `tsc` e `conformidade` (53/53) verdes.

**Conserto urgente, 14/09/2026 — o item 9 quebrou o passo 11 do roteiro.**
`copyPose` variando com a seleção pareceu certo (mesma conta dos itens 1 e
11), mas era um erro de DESENHO, não de código: o roteiro tinha um osso
escolhido quando pedia "a pose inteira", e levou só o braço. **Comando que
muda de sentido conforme a seleção é armadilha** — o Humberto escolhe um osso
para mexer nele, depois pede a pose inteira sem lembrar que algo continua
selecionado, e leva só o braço sem entender por quê. `copiar-pose`
(`Ctrl+Shift+C`) voltou a ser SEMPRE a pose inteira; a pose do membro virou
comando PRÓPRIO, `copiar-pose-escolhido`, "Copiar a pose do escolhido" no
menu Animação, sem tecla (o menu já basta). Dois comandos com nome diferente
custam uma linha de menu e poupam um defeito que ninguém consegue explicar.

**Por que o item 11 não tem esse problema:** lá a seleção da cena só vale
como FALLBACK, quando a folha não tem chave marcada — e fallback não muda o
sentido de nada que já funcionava. A diferença entre os dois é a lição.

Roteiro de volta a 14 de 14. `vitest` inteiro (2.796 passam), `tsc` verdes.

**Item 6 — feito, 14/09/2026.** `Ctrl` ao arrastar uma chave clona, deixando
a original onde estava — função pura nova `cloneKeys` (`anim/keying.ts`, a
mesma dupla `copyKeys`+`pasteKeys` do Colar, deslocada por `delta`).

**Achado no caminho, antes de escrever qualquer código:** `Ctrl` durante o
arrasto de uma chave já tinha dono — "empurrar as seguintes junto" (item 89,
`rippleMove`) — e `Alt` também (tira o encaixe do quadro, lido a cada
movimento do mouse). Não dava para dar `Ctrl` a duas coisas nem repetir
`Alt` sem as duas ligarem sempre juntas. Escrevi ao Planejador antes de
mexer; a decisão, pela lei do projeto (como o Spriter faz): `Ctrl` clona
(gesto que a mão do Humberto já tem, de outros programas), e o empurrar do
item 89 fica SEM GESTO por ora — a função e o teste continuam guardados,
prontos para quando o Humberto decidir a porta (um interruptor na folha,
como o Spine, é lote próprio). O item 4 ("empurrar por número") cobre a
necessidade por comando enquanto isso.

**Consertei o código morto encontrado junto:** em `dopesheet-pointer.ts`, a
linha `panel.rippling = event.ctrlKey` nunca rodava — o `if (event.ctrlKey)
{ ...; return; }` de cima sempre devolvia antes dela. O item 89 nunca teve
gesto de verdade, mesmo com a função pronta e testada; ninguém viu porque a
suíte só testa a função pura, nunca o gesto. Removido junto com o resto do
código do `rippling`.

`vitest` (2.800 passam, 29 pulados, subiu 4 e nenhum caiu), `tsc`,
`conformidade` (53/53) e `roteiro` (14/14) verdes.

## Itens 4 e 8 — rodada de 14/09/2026, em série, um chat só

Aprovado pelo Diretor. **Meio lote cada, versão própria cada**: item 4 → v13.1,
item 8 → v13.2. Em série no mesmo chat, porque os dois são da mesma parte: o
paralelo não compraria quase nada e compraria colisão de porta e de arquivo.

### Item 4 — Empurrar as chaves por número

**A porta É o lote, não a conta.** `rippleMove` (em `anim/keying.ts`) já existe,
tem teste e está verde há semanas — e **nenhum gesto chega nela**: as três teclas
do arrasto estão ocupadas (Ctrl clona, Shift soma à seleção, Alt tira o
encaixe). Foi assim que ela virou uma função órfã.

| # | O quê |
|:---:|:---|
| 4.1 | Comando **"Empurrar as chaves…"** no menu Animação, com número: quantos quadros, e para que lado |
| 4.2 | Duas contas, e a segunda é a que ele pediu: mover **as chaves escolhidas**, e **empurrar tudo daqui para a frente** — é assim que se abre espaço no meio de uma animação pronta |
| 4.3 | O comando dá porta à `rippleMove` que já existe. **Não escreva conta nova** antes de olhar o que ela faz |
| 4.4 | Um passo de desfazer só, e a barra de baixo diz quantas chaves andaram |

**Fora deste lote:** o gesto de arrasto (o interruptor na folha, como no Spine).
É decisão do Humberto, e está com o Diretor. Se a porta começar a crescer para
esse lado, **pare e suba** — meia peça não começada vale mais que uma função
verde que ninguém alcança.

### Item 8 — Limpar chaves repetidas

Tirar a chave que não muda nada — o lixo que o gravar-sozinho deixa. Do Spine
(**Clean Up**). Um passo de desfazer, e a barra diz quantas saíram. Nunca apagar
a primeira nem a última de uma timeline sem dizer, e **nunca** apagar uma chave
`stepped` que segura um valor de propósito: repetida no valor não quer dizer
inútil no tempo.

**Item 4 — feito e fechado como v13.1, 14/09/2026.** Comando **"Empurrar as
chaves…"**, no menu Animação (e na Paleta de comandos), fechando o pedido:
quantos quadros, para que lado, e a escolha entre as duas contas — "estas e
tudo o que vem depois" (abre espaço, usa a `rippleMove` que já existia) e "só
as chaves marcadas" (usa `moveKeys`, a mesma conta do arrasto do mouse). Sem
chave marcada na folha, o comando avisa e não abre a janela. Um passo de
desfazer só; a barra diz quantas chaves andaram, com o verbo no plural certo
(achado e corrigido na tela: a primeira versão escrevia "3 chaves andou").

Verificado com a mão, no herói, animação "walk": os dois caminhos movem as
chaves certas, a duração cresce quando `rippleMove` empurra para além do fim
(1,00 s → 1,17 s ao empurrar 5 quadros), e o número de quadros ≤ 0 é recusado
sem abrir passo de desfazer.

Arquivos da parte: `panels/dopesheet-edit.ts` (a função `askPushKeys`),
`panels/dopesheet.ts` (o método e o registro da ação). Arquivos de passagem,
só acrescentando: `ui/actions-table.ts`, `ui/menus.ts`,
`testes/acoes.test.ts` (o número mecânico, 177 → 178). `tsc` limpo; `vitest`
da parte (`linha-do-tempo`, `chaves`, `acoes`, `fronteiras`) verde.

Backup: `backup/*_2026-09-14_antes-do-item-4-empurrar.ts` (seis arquivos),
linha em `backup/INDICE.md`. Fechado como **v13.1**: `tsc` limpo, vitest
2.800/2.829, conformidade 53/53, roteiro 14/14 e medição estáveis (rodados
sozinho, na hora do fecho). `programa/` remontado, zip em
`backup/versoes/recorte v13.1 2026-09-14.zip`.

**Item 8 — feito, fecho pendente, 14/09/2026.** Comando **"Limpar chaves
repetidas"**, no menu Animação (e na Paleta de comandos): tira a chave que não
muda nada, o lixo do gravar-sozinho. Linha escolhida (marcada na folha, ou
pela seleção de linhas) limpa só ela; sem nenhuma, limpa a animação inteira —
a mesma conta de "Fechar ciclo". Um passo de desfazer só; a barra diz quantas
saíram, e quantas delas eram ponta de linha.

Função pura nova `cleanRepeatedKeys` (`anim/keying.ts`, ao lado da
`rippleMove`): uma chave sai quando a de antes e a de depois já valem o mesmo
que ela — o trecho já era constante, e ela não segurava nada que as vizinhas
não seguravam sozinhas. Nunca esvazia uma linha (fica ao menos uma chave, por
mais constante que a linha inteira seja). As duas cautelas do pedido:

- **Nunca uma chave `parada` (`stepped`), nem a que RECEBE um degrau parado**
  — protegida pelo próprio `curve` da chave e pelo da anterior. Repetida no
  valor não quer dizer inútil no tempo.
- **Linha não numérica** (`attachment`, `event`, `drawOrder`, `sequence`,
  `tag`…) nunca entra: já é sempre "parada" por natureza (9.3), mesmo sem o
  campo `curve` escrito.

Testado com a mão, no herói: chaveei sete propriedades do osso `hips` em
quatro tempos (três repetidas e uma diferente no fim, em `rotation` e `x`; as
outras cinco — `y`, `scaleX/Y`, `shearX/Y` — inteiramente constantes). O
comando tirou 19 chaves, 7 na ponta da linha, e as cinco linhas constantes
encolheram até UMA chave cada, nunca zero. Marquei uma chave como "Parada" e
rodei de novo: ela e o valor dela saíram intactos do outro lado, a única
mudada foi a vizinha sem marca (2 chaves saíram, 1 na ponta). Um `Ctrl+Z` só
devolveu tudo, nas duas rodadas.

Arquivos da parte: `anim/keying.ts` (`cleanRepeatedKeys`, `sameKeyValue`),
`panels/dopesheet-edit.ts` (`cleanRepeatedKeysNow`), `panels/dopesheet.ts` (o
método e o registro da ação). Arquivos de passagem, só acrescentando:
`ui/actions-table.ts`, `ui/menus.ts`, `testes/acoes.test.ts` (o número
mecânico, 178 → 179). Dez testes novos em `testes/linha-do-tempo.test.ts`
("limpar chaves repetidas (item 8)"). `tsc` limpo; `vitest` inteiro
2.810/2.839 (subiu 10, nenhum caiu).

Backup: `backup/*_2026-09-14_antes-do-item-8-limpar.ts` (sete arquivos),
linha em `backup/INDICE.md`. Fechado como **v13.2**: `tsc` limpo, vitest
2.810/2.839, conformidade 53/53, roteiro 14/14 e medição estáveis (rodados
sozinho, na hora do fecho). `programa/` remontado, zip em
`backup/versoes/recorte v13.2 2026-09-14.zip`.

**Com a v13.2, o plano "linha do tempo — copiar e colar" fecha inteiro**:
itens 11, 1, 2, 9, 6, 4 e 8, todos feitos. O que sobrou — o gesto de arrasto
para "empurrar as chaves" (um interruptor na folha, como no Spine) — é
decisão do Humberto, com o Diretor; não é mais fila deste chat.

## Para o CHANGELOG da v13.2

Texto pronto para colar, faltando só a data de quem fechar (deve ser
14/09/2026, salvo o Planejador dizer outra):

> ### v13.2 — Limpar chaves repetidas: tira o lixo do gravar-sozinho, sem tocar no que é de propósito — 14/09/2026
>
> Item 8 do pedido "pego o braço inteiro e colo". **Animação → Limpar chaves
> repetidas** (também pela Paleta de comandos): tira a chave que não muda
> nada — o rastro que o gravar-sozinho deixa quando se mexe num osso e se
> volta ao mesmo lugar. Linha escolhida limpa só ela; sem nenhuma, limpa a
> animação inteira. Um passo de desfazer, e a barra diz quantas saíram — e
> quantas delas eram a ponta da linha.
>
> **Duas cautelas, para o comando nunca comer o que é de propósito:**
> - Uma chave `parada` (`stepped`), e a que recebe um degrau parado, nunca
>   saem — repetida no valor não quer dizer inútil no tempo.
> - Linha não numérica (`attachment`, `event`, `drawOrder`…) nunca entra: já
>   é sempre "parada" por natureza, mesmo sem o campo escrito.
