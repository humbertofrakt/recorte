# Plano — o fluxo criar e animar, lotes 1 e 2 — 14/09/2026

Mandato: `AVALIACAO DO DIRETOR - linha do tempo em producao 2026-09-14.md`.
Pedidos: `PEDIDOS o fluxo criar e animar 2026-09-14.md`.

**A LEI DESTE PLANO, dada pelo Humberto em 14/09:** *"como o Spriter faz? Isso
é lei. Como o Spriter faz, pra ele isso é muito fluido."*

A pergunta 4 — trocar de pai em Animando grava chave sempre, ou pergunta? —
**está fechada por essa lei**. No Spriter a hierarquia é *"definida por chave na
`mainline`"* (nossa própria especificação, na tabela de importação do SCML, e o
resumo do Spriter em 3336). Lá não existe pose de repouso, então **não existe
pergunta**: trocar o pai é gravar aquela chave, e pronto.

| Onde você está | O que o gesto faz |
|:---|:---|
| **Animando** | grava chave `parent` naquele tempo. **Sem janelinha, sem pergunta** |
| **Montagem** | muda o pai no arquivo, como hoje |
| A barra de baixo | diz o que foi feito, numa linha. Só isso |

Nada de diálogo. Nada de "só aqui ou no arquivo todo?". Quem quer mexer na
estrutura do arquivo vai à Montagem, que é onde ela mora.

---

## Lote 1 — A chave `parent` no editor

**Parte:** Árvore + Cena. **Arquivos:** `doc/reparent.ts`, `panels/tree-*.ts`,
`viewport/parent-gesture.ts`, `anim/keying.ts`, `anim/pose-mode.ts` (só a porta).
**Testes:** `arvore.test.ts` (seu) e `chaves.test.ts` (**dividido** com o executor da linha do tempo: cada um só ACRESCENTA o seu `describe`; ninguém reescreve o do outro).

| # | O quê |
|:---:|:---|
| 1.1 | Trocar de pai com uma animação aberta **grava chave `parent`** (§9.4, só stepped) em vez de devolver a pessoa à Montagem. As três saídas de `doc/reparent.ts` (linhas 370, 432, 458) que hoje dizem *"estrutura muda na Montagem, e voltei para ela"* somem |
| 1.2 | Os **três caminhos** dão no mesmo lugar: a tecla `P`, o arrasto na Árvore e o campo do painel. É a porta única que já existe |
| 1.3 | **Semântica do Spriter, sem conversão:** os locais são medidos a partir do pai novo; quem grava a chave grava também os locais no espaço do pai novo. O runtime não converte nada (§9.4) |
| 1.4 | A **Árvore mostra o pai do tempo de agora**, não só o do arquivo. No quadro 12 a arma está nas costas: a Árvore tem de dizer isso |
| 1.5 | A ordem de cálculo é refeita quando o pai muda (§5.6). Ciclo é ignorado com L2 |
| 1.6 | Um teste com o caso da arma: mão → costas no meio da animação, e o desenho **não salta** |

**O que não muda:** a hierarquia do arquivo continua uma só; a chave troca por
cima dela. Nenhum campo novo no núcleo do formato (regra 7).

**Insumo:** `LEVANTAMENTO trocar de pai na animação 2026-09-14.md`, do executor
que o está escrevendo. Leia antes de começar.

---

## Lote 2 — Malha e pesos deixam de expulsar

**Parte:** Malha e pivô. **Arquivos:** `mesh/mesh-doc.ts`,
`panels/mesh-panel.ts`. **Teste:** `malha.test.ts`.

| # | O quê |
|:---:|:---|
| 2.1 | A ferramenta Malha **existe em Animando** (hoje `panels/mesh-panel.ts:274` a esconde) |
| 2.2 | As duas recusas de `mesh/mesh-doc.ts` (242, 269) saem: nada de *"Volte à Montagem (Ctrl+Tab)"* |
| 2.3 | **O que a malha escreve continua indo para a forma de repouso** — e a tela diz isso, numa linha, enquanto a ferramenta está na mão. Ver a forma de repouso é trabalho da FERRAMENTA, não de um modo |
| 2.4 | Ligar osso à malha idem: acontece, e a linha do rodapé conta onde foi parar |

**O cuidado real, e é o único:** a deformação (`deform`) é animável e vai para a
chave; a FORMA e os PESOS são da pose de repouso. A ferramenta tem de deixar
claro qual das duas a pessoa está mexendo. Essa distinção é o lote inteiro.

---

## As regras da casa (valem para os dois)

Backup datado antes de escrever, com linha no `backup/INDICE.md` · teste novo no
arquivo da parte · a contagem nunca cai · fecho com `npx vitest run`,
`npx tsc --noEmit -p editor/tsconfig.json`, `node ferramentas/conformidade.mjs`,
`npm run roteiro`, `npm run medir` · número de versão do `versao.py` na hora do
fecho, **um fecho de cada vez** · desvio escrito na seção "Desvios".

## Desvios


### Lote 1 — a chave `parent` (executor do chat 3), 14/09/2026

**Dois defeitos achados na TELA, não nos testes.** Os dois passavam verdes: o
valor final estava certo, o caminho é que estava errado.

| # | O que aparecia | Por quê | Conserto |
|:---:|:---|:---|:---|
| 1 | A espada saía da mão **antes da hora**, deslizando para as costas desde o começo da animação | Os locais rampavam do valor velho para o novo, e o trecho de antes é medido do pai **velho**: a reta entre os dois passa por lugar nenhum | Cada local ganha, no **quadro anterior**, uma chave `stepped` com o valor que a animação já tinha ali. O trecho de antes segura, e a troca vira o evento seco que ela é |
| 2 | A Árvore mostrava *"por chave"* em qualquer quadro | O painel não ouvia `time`: desenhava a hierarquia do instante em que tinha sido desenhado pela última vez | A Árvore passa a ouvir o tempo, e só se redesenha quando a animação tem chave de pai — arrastar o cursor não pode redesenhar a Árvore inteira quadro a quadro à toa |

**O `shearX` não se perde.** A decomposição de §5.5 devolve sempre `shearX = 0`,
e escrevê-lo por cima entortaria a pose calada. A saída é exata e não custa
nada: com o `shearX` do osso valendo `s`, a mesma matriz se escreve com
`rotation' = rotation − s` e `shearY' = shearY + s`, porque a primeira coluna é
construída com `rotation + shearX` e a segunda com `rotation + 90 + shearY`
(§5.4). O teste prende a matriz inteira (`a`, `b`, `c`, `d`), não só a posição.

**Desenho não troca de osso por chave.** A §9.5 não tem timeline para o osso
dono de um slot: só um OSSO troca de pai numa chave. Com osso e desenho na
mesma seleção, em Animando, o osso ganha a chave e o desenho fica onde está,
com a linha na barra de baixo. **É uma diferença real para o Spriter**, onde o
objeto também troca de pai por chave (`object_ref.parent`). Fazer igual é campo
novo no núcleo do formato (regra 7) e decisão do Humberto — fora desta rodada.

**O Chavear não grava o pai.** `BONE_KEY_PROPERTIES` continua sem `parent`: o
que o botão Chavear escreve é a **pose**, e pôr `parent` na lista encheria de
linha de pai todo osso que nunca trocou de pai. A chave de pai é escrita pelo
**gesto**, que é onde ela nasce.

**Chaves depois da troca — FEITO, 14/09/2026 (peça própria, depois da v12.6).**
As chaves de pose posteriores passaram a ser **convertidas** para o espaço do
pai novo no mesmo comando e no mesmo passo de desfazer, e a barra diz **quantas
foram**. O critério é o do Spriter e é simples de conferir: a pose de cada chave
fica onde estava na tela — provado com a matriz inteira, e não só com a
posição. A conversão para na **próxima chave de pai**: dali em diante quem manda
é ela. Todas as seis propriedades ganham chave no instante convertido, mesmo as
que não tinham — uma que faltasse seguiria interpolando um valor escrito para o
pai velho, que é justamente o defeito a consertar. O parágrafo abaixo é o que
valia na v12.6, guardado para quem for ler o histórico:

**Chaves depois da troca — o aviso era provisório.** As chaves de pose que já
existam depois do instante da troca continuam medidas do pai **antigo**, e a
barra de baixo avisa: *"As chaves depois desta continuam medidas do pai
antigo"*. Pela lei do Spriter nada devia saltar — lá cada chave da `mainline`
carrega o pai dela, e as seguintes já nascem medidas do pai daquela chave. Para
chegar no mesmo resultado, o certo é **converter as chaves posteriores** para o
espaço do pai novo ao gravar a troca, num passo de desfazer, dizendo quantas
foram convertidas. Não é para hoje: reescrever chaves que a pessoa criou é a
coisa mais séria que um editor faz, e a conta é da mesma família que deu os dois
defeitos silenciosos acima. Decisão do planejador, 14/09/2026: fica para um
lote próprio, com teste próprio e cabeça descansada.
