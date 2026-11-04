# Peles: Spriter, Spine, e o que o Recorte já tem

Pedido do Humberto, 16/09/2026, na janela **PESQUISA · Alinhamento de imagens
com pivô**: entender character maps (Spriter) e skins (Spine), e como fazer
"pele em bloco" — troca uma pele, troca peças a mais, ossos a mais, física a
mais. Objetivo dele: como o Dota 2, uma pele pode trazer uma capa **ou** asas,
não só uma cor diferente.

**Achado principal, testado ao vivo em 16/09/2026 (`npm run editor`,
personagem exemplo): meio certo, meio errado.** O Humberto contestou — "o
lápis não faz nada" — e ele está certo para osso. Corrigido na seção 4.1.
A base (osso só existir com uma pele) é real e testada; o **lápis não ajuda
em nada a criar esse osso** — só ajuda pra desenho. Ver seção 4 e 4.1.

---

## 1. Spriter — Character Maps

| Passo a passo (uso) | |
|:---:|:---|
| 1 | Botão **CharMaps**, no alto do painel de animações |
| 2 | **Create New Character Map** |
| 3 | Coluna esquerda: a imagem original. Coluna direita: botão direito, escolhe a substituta |
| 4 | Arrastar o mapa de "available" para "active" — liga. Vários ao mesmo tempo, empilhados |
| 5 | **Merge Active to New** junta os mapas ativos; **Bake Active to Entity** grava fixo |

**A regra por trás:** um character map é uma tabela **imagem por imagem**, na
mesma entidade. Ele não cria sprite novo, não cria osso novo. Toda variação
tem que já existir como objeto na entidade — só a imagem muda de lugar.

**O problema que o Humberto apontou:** para ter "capa" e "asas" como opções,
a entidade base precisa ter, desde sempre, um objeto/osso pronto para
"asas", mesmo em quem nunca vai usar. **O Spriter obriga a somar todos os
ossos de toda variação na base**, usados ou não.

---

## 2. Spine — Skins

| Passo a passo (uso) | |
|:---:|:---|
| 1 | Criar um **slot** vazio (o "lugar" — *skin placeholder*) |
| 2 | Criar uma **skin**, escolher os anexos daquele slot que pertencem a ela |
| 3 | **Add to Skin**, no osso ou na restrição: aquele osso/regra passa a existir **só quando a skin está ativa** |
| 4 | **Mix and match**: combinar várias skins numa só, para o jogo trocar peça por peça |
| 5 | No jogo: `skeleton.setSkin(...)`, uma ou várias combinadas |

**Isto resolve o problema do Spriter:** um osso "de skin" não pesa na base
nem nas outras skins. Uma skin "asas" pode ter ossos e restrição de física
que a skin "capa" nunca viu.

**O preço:** no editor oficial isso fica em painéis técnicos (Propriedades do
osso, avisos separados de osso/anexo/restrição) — funciona, mas não é
"arrasta e já era" como o resto do Spine.

---

## 3. A régua de decisão que o Humberto deu

> "O Spriter tem um problema: exige que o programa tenha todos os ossos
> diferentes. Nisso vamos seguir o Spine — mas trazendo pra um modo intuitivo
> e simples."

Ou seja: **o modelo certo é o do Spine** (osso/regra só existe dentro da pele
que pede), **a entrega tem que ser simples como o resto do programa.**

---

## 4. O que o Recorte já tem (hoje, testado, sem pendência)

| Peça do Dota 2 | No Recorte |
|:---|:---|
| Trocar uma pele troca um **bloco** de peças | **Pele** = conjunto de anexos. Pode trazer desenho que o corpo nem tinha (slot novo) |
| Duas peças por vez (ex: armadura + capa) | **Peles empilhadas**: olho liga várias ao mesmo tempo, a de cima cobre a de baixo |
| Uma peça com **osso próprio** (ex: asa que balança) | Propriedades do osso → grupo **Peles** → caixa **Só com a pele**. O osso só existe quando aquela pele está ligada |
| Uma peça com **física própria** (ex: a asa balançando sozinha) | A mesma caixa, na regra: uma regra de física "só com a pele" roda só com a pele ligada |
| Trocar no jogo com uma linha | `skeleton.setSkin('asas')`, ou uma lista: `skeleton.setSkin(['default','armadura'])` |
| Entregar só o que aquele jogo usa | `Exportar → Por pele…`: sai só o `.bone` e o atlas daquela pele. Medido: fatiar por pasta deixa **50,6% menor** |

### Passo a passo — "capa OU asas", do jeito Dota 2

| Passo | O que fazer |
|:---:|:---|
| 1 | Aba **Peles** → **Nova pele** → nome `asas` |
| 2 | Lápis em `asas` — os próximos desenhos nascem nela |
| 3 | Ferramenta **Criar osso** (`N`): os ossos da asa, normais |
| 4 | Em **Propriedades** de cada osso da asa, marcar **Só com a pele** → `asas` |
| 5 | Aba **Imagens**: arrastar o desenho da asa **para a cena** (cria o slot, já nasce na pele `asas`) |
| 6 | Clicar nesse slot **na Árvore**. Em Propriedades, campo **Osso**: escolher o osso da asa criado no passo 3 — **este é o "prender", não é arrastar em cima do osso** |
| 7 | Acertar a posição com **Mover** (`W`), com **o desenho** escolhido |
| 8 | (se quiser balanço sozinho) regra de física no osso da ponta, e marcar **Só com a pele** nela também |
| 9 | Repetir 1-8 para `capa`, com os ossos e desenhos da capa |
| 10 | No jogo, ou no olho do editor: ligar `asas` **ou** `capa`. Nunca as duas ao mesmo tempo, se forem exclusivas — isso é escolha de jogo, não trava do editor |

Nenhum osso de `asas` existe quando `capa` está ligada, e vice-versa. A pele
`default` (o corpo nu) nunca carrega o peso de nenhuma das duas.

---

## 4.1 Testado ao vivo — o lápis não faz nada para osso

Passos feitos de verdade no editor rodando (`npm run editor`, personagem
exemplo, pele `armadura` com o lápis aceso):

| Passo | O que eu fiz | O que aconteceu |
|:---:|:---|:---|
| 1 | Lápis aceso em `armadura` | nada muda na tela — sem aviso, sem cor |
| 2 | Ferramenta **Criar osso** (`N`), arrastei um osso novo na cena | osso criado, normal |
| 3 | Abri Propriedades desse osso | caixa **Só com a pele**: **desmarcada**. O osso nasceu igual a qualquer outro, sem relação nenhuma com o lápis |
| 4 | Marquei **Só com a pele** à mão | aí sim: a lista **Peles que ativam** já veio com `armadura` marcada sozinha — a única parte que o lápis realmente ajuda |
| 5 | Procurei algum sinal na Árvore ou na cena dizendo "este osso é da pele armadura" | **não existe nenhum**. Nem cor, nem ícone, nem texto |

**Conclusão, sem meio-termo:** o Humberto está certo. Pra **desenho**, o
lápis funciona como o capítulo 3 descreve. Pra **osso**, o lápis não faz
nada visível, e o único elo com ele é um detalhe interno (a lista já vem
com o nome certo marcado) que ninguém vê sem já saber que a caixa existe.
A frase que eu tinha escrito antes — "já existe, hoje, sem pendência" — **foi
forte demais**. A peça de baixo (o formato aceitar osso só de uma pele)
existe e funciona. A peça de cima (o jeito de chegar lá, pelo lápis, visível)
**não existe**.

## 5. O que falta, agora com certeza

Nada no **formato** ou no **motor** — a conta de "osso só nesta pele" roda
certa (`peles.test.ts`). Falta a **ferramenta**, não a **regra**:

1. O lápis não pega osso nenhum sozinho — criar um osso com o lápis aceso
   deveria já nascer marcado, sem passo extra.
2. Não existe sinal nenhum, em lugar nenhum, dizendo "este osso é desta
   pele" — nem na Árvore, nem na cena.

Isto não é mais só ideia registrada (seção 6.2) — é **o pedido do
Humberto**, com o teste ao vivo confirmando o buraco. Fica para o Planejador
decidir a ordem do lote; código congelado agora.

---

## Conclusão para o Humberto

Você já tem o Dota 2. O capítulo 3 do manual ensina; o código já roda; os
testes já cobrem. O único trabalho real é **montar** as peles (`asas`,
`capa`) como o passo a passo acima — não é preciso planejar nada novo no
programa.

---

## 6. Duas ideias novas dele — para planejar, não implementadas

16/09/2026, depois do achado acima. **Código congelado**: isto é registro de
decisão, não um pedido de lote.

### 6.1 Trocar a pasta inteira, apontando pra outra

Hoje o botão **Recarregar** (`panels/palette.ts:200-247`) relê **a mesma**
pasta do disco — serve para quando você sobrescreve os arquivos com arte
nova, nos mesmos nomes. É o que o Spriter chama de **Reload All Images**: o
mesmo mecanismo, mesmo caminho.

O que o Humberto pede é diferente e **não existe ainda**: apontar para uma
**pasta nova**, em outro lugar, e trocar **todo o acervo do projeto** pelas
imagens de lá que têm **o mesmo nome**. Ele deu o exemplo do Spriter fazendo
isso com uma pasta inteira.

Como já pensar isso encaixado no que existe:

| Peça | Já existe | O que falta |
|:---|:---|:---|
| Achar imagem pelo nome, numa pasta | `sameFolderImages` (`io/project-folder.ts`) | escolher **outra** pasta como origem |
| Trocar uma imagem em tudo que a usa | "Trocar a imagem em todas as peles…" (cap. 3) | fazer isso pro **acervo inteiro**, de uma vez |
| Pivô não se perder ao trocar | pivô por nome, persistente (`pivot-atlas.ts`) | nada — já serve, casando pelo nome |

Ou seja: **os três blocos que essa função precisa já existem**, seria juntar
os três num botão "Trocar pasta de origem". Fica anotado.

### 6.2 Osso "desta pele" automático, com sinal na cena

Resolve a pendência que ficou em aberto: a caixa **Só com a pele** está
escondida em Propriedades, um osso de cada vez.

Ideia do Humberto: **enquanto o lápis de uma pele está aceso**, todo osso
**novo** (criado com `N`) já nasce marcado **Só com a pele** daquela pele
sozinho — sem abrir Propriedades. E esse osso ganha um **sinal visual** na
cena (cor ou ícone) avisando "isto é da pele X", do mesmo jeito que hoje o
lápis já sinaliza pra onde vai o **desenho** novo.

Meio caminho andado: o lápis **já** faz esse trabalho para desenho
(anexo). A ideia é **o mesmo gatilho, valendo também pra osso e pra regra**.

Nenhuma das duas entra em código agora. Ficam anotadas para quando o
Humberto mandar.

*(atualização: a ideia 6.2 acima virou pedido confirmado — seção 4.1 testou
ao vivo e achou o buraco de verdade.)*

---

## 7. O pedido fechado, depois do teste ao vivo — 16/09/2026

Nas palavras dele: copiar **exatamente** o character map do Spriter (a forma
de usar é a mesma; o menu é diferente), com um passo a mais que o Spriter
não tem — **modificar** a pele depois de aplicada: puxar osso, pôr imagem,
sem mexer no personagem base. Exemplo dele: esqueleto humano, sem rabo;
aplica a pele, puxa um osso de rabo **dentro do próprio esqueleto humano**,
põe a imagem do rabo; tira a pele, o rabo some e volta a ser só humano.

### O fluxo, em ordem

| Passo | Como o Spriter faz | Como o Humberto quer aqui |
|:---:|:---|:---|
| 1 | Character Map: tabela imagem-por-imagem | **Pele**: escolher, ou apontar uma pasta inteira (ideia 6.1) — troca as imagens de uma vez |
| 2 | *(não existe no Spriter)* | **Aplicar e modificar**: com a pele "aplicada" (lápis aceso), tudo que se cria — osso, desenho, regra — **já nasce só dela**, sem checkbox escondido |
| 3 | *(não existe)* | **Sinal na tela**: osso/desenho da pele aparece marcado (cor, por exemplo) enquanto o lápis dela está aceso, ou mesmo com o lápis apagado |
| 4 | Desligar o character map | Desligar a pele (olho) — tudo que só existe nela some, o esqueleto volta a ser só o `default` |

### O que isso muda, tecnicamente

Hoje são **dois mundos**: o lápis (só desenho) e a caixa "Só com a pele" (só
osso e regra, manual). O pedido é **um mundo só**: o lápis aceso vira
"estou editando a pele X" de verdade, valendo para osso, desenho e regra
igual, com o mesmo sinal visual nos três.

Isto fica escrito para o Planejador decidir a ordem do lote. Código
congelado agora — nada disto entra sem ordem dele.
