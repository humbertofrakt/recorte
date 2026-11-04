# Plano — peles em bloco, do jeito Dota 2

Rascunho escrito pela Pesquisa, a pedido direto do Humberto ("planejar,
planejar, planejar"), 16/09/2026. Junta os achados I3, I4, I5, I6 de
`O PROGRAMA NOVO - tudo junto 2026-09-16.md` num plano com lote, arquivo,
teste e "pronto quando". **Falta o Planejador dar número de lote, ordem e
mandar executar.** Código congelado — nada abaixo entra sem ordem dele.

---

## Objetivo, numa frase

Trocar uma pele troca um **bloco**: imagem, osso e regra, tudo que só existe
nela. Aplicar é um clique; construir o bloco (osso a mais, imagem a mais) é
tão fácil quanto montar o personagem base — porque é **o mesmo gesto**.

## O que já está de pé (não entra no plano, só a lembrança)

| Peça | Onde |
|:---|:---|
| Osso e regra só existem com uma pele | formato + `peles.test.ts`, funcionando |
| Pele traz desenho que o corpo não tinha | capítulo 3 |
| Peles empilham (armadura + capa) | capítulo 3 |
| Exportar só uma pele, atlas menor | `Exportar → Por pele…`, 50,6% menor medido |

O buraco não é o formato. É a **ferramenta** — como se chega lá.

**Legenda usada daqui pra baixo:** 🗣️ **palavra dele** (dito por ele, nesta
janela ou antes) · 💡 **proposta** (ideia da pesquisa, ainda não confirmada
por ele).

---

## Como os três fazem — com fonte

| | Trocar imagem (A) | Osso/regra só numa variação (B) | Aplicar e modificar (C) |
|:---|:---|:---|:---|
| **Spriter** | *Reload All Images*: relê do mesmo caminho no disco (`spriter/…todas as funcoes.md:167`). Character map troca imagem por imagem, mesma entidade (`:86-89`) | **não tem** — todo osso de toda variação já tem que existir na entidade base (achado 🗣️ do Humberto, seção 1 da `PESQUISA peles`) | não tem — só liga/desliga mapas prontos |
| **Spine** | não achado um "trocar pasta inteira" no manual lido; troca é por *skin*, anexo por anexo | **tem**: *Add to Skin* em osso e restrição — "ossos que só existem naquela skin" (`spine/…todas as funcoes.md:245-250`) | *Mix and match*: combina várias skins numa (`:257`). É manual, em painéis técnicos — não um modo guiado |
| **DragonBones** | não achado no manual lido (Internet Archive) | "Skin" no formato dele é o container de displays por slot, não achado um "osso só numa variação" na função avançada listada (`dragonbones/…todas as funcoes.md:290` é *skin weights* = peso de malha, **outra coisa**, mesmo nome) | não achado |
| **Recorte, hoje** | só relê a mesma pasta (`palette.ts:200-247`) | **tem, testado** (`peles.test.ts`), mas só por Propriedades, à mão — sem atalho, sem sinal (seção 4.1) | não existe; são dois gestos soltos (lápis, olho) |

Onde diz "não achado": é o que a pesquisa de 08/09 leu do manual oficial —
regra da casa, "o que não está na fonte oficial está marcado como não
confirmado" (`documentos/pesquisa/nova pesquisa/README.md:15`).

---

## Lote B — Um lápis só (base dos outros dois)

**O quê (🗣️ palavra dele, "o lápis não faz nada"):** hoje o lápis só marca
onde nasce **desenho** novo. Osso e regra exigem abrir Propriedades e
marcar **Só com a pele** à mão — testado ao vivo, confirmado que não tem
atalho nenhum (seção 4.1 da `PESQUISA peles`).

**Pedido (🗣️ dele):** osso e regra criados com o lápis aceso **já nascem**
com `skinRequired` e a pele do lápis em `skinMembers` — sem passo extra.
Igual já acontece pro desenho.

**Sinal na tela (💡 proposta):** todo osso, regra ou desenho que só existe
numa pele ganha uma marca **em ícone, com o nome na dica** (regra 4/12 da
casa) na Árvore **e** na cena — com o lápis aceso ou apagado, não só na
hora de criar. Hoje não existe nenhuma. O Humberto ainda não viu nem
aprovou o formato do sinal — só confirmou que precisa existir.

Regra 13 da casa (uma parte por lote — `fronteiras.test.ts` julga): dividido
em três, por arquivo/dono.

### B1 — o modelo, em `skins-model.ts`

Quem cria osso ou regra pergunta a pele do lápis (a mesma função que hoje
faz isso pro desenho), e marca na hora — um `Command` só, com `apply` e
`revert` exatos (regra 6 do `contract.ts`).

**Teste** (`editor/testes/peles.test.ts`, regra 16 — nunca arquivo novo por
lote): criar osso com o lápis em `armadura` → sai do `Criar osso` já com
`skinRequired: true, skinMembers: ['armadura']`, sem chamada separada a
`ToggleSkinBone`. Lápis na `default` (ou nenhuma) → osso nasce comum, igual
já vale pro desenho hoje.

**Pronto quando:** repetir o teste ao vivo de hoje (seção 4.1) e o osso já
nascer marcado, sem abrir Propriedades.

### B2 — o sinal na Árvore, em `panels/tree.ts`

O ícone (💡 proposta, formato a decidir) nas linhas de osso, regra e
desenho que só existem numa pele — reaproveitando o padrão que já existe
para "Este osso tem regra" (visto ao vivo, `ref_1078`/`1091` no teste desta
pesquisa).

**Teste** em `editor/testes/arvore.test.ts`.

### B3 — o sinal na cena, em `viewport/viewport.ts`

O mesmo sinal, desenhado sobre o osso na cena.

**Teste** em `editor/testes/cena.test.ts`.

---

## Lote C — Aplicar e modificar

**O quê (🗣️ palavra dele):** o fluxo que o Humberto descreveu: esqueleto
humano, sem rabo. Aplica a pele `rabo`. Puxa um osso de rabo, dentro do
próprio esqueleto humano. Põe a imagem. Tira a pele — o rabo some, volta a
ser só humano.

**Depende do Lote B** (senão puxar o osso do rabo ainda exigiria o passo
manual).

**Pedido (🗣️ dele):** um caminho guiado — hoje são dois cliques sem relação
um com o outro (lápis, depois olho).

**💡 Proposta da pesquisa, ainda sem confirmação dele:** uma linha de aviso
dizendo "editando a pele `rabo` — o que você criar aqui só existe nela", e
o lápis já ligar o olho junto (senão a pessoa monta o rabo sem ver o rabo).
Isto é jeito de resolver o pedido, não o pedido em si — o Humberto pode
querer outro jeito.

| Arquivo | O que muda |
|:---|:---|
| `panels/skins-model.ts` | lápis liga o olho da mesma pele, se já não estiver ligado |
| `panels/palette.ts` (o `banner`, que já existe para outro aviso) ou painel Peles | a linha de aviso "editando a pele X" |

**Pronto quando:** ligar o lápis em `rabo`, criar o osso e o desenho, tirar
o olho — o esqueleto volta a ser só humano, sem sobra na cena nem na Árvore
(nada de osso ou desenho do rabo à mostra).

---

## Lote A — Trocar a pasta inteira (independente dos outros dois)

**O quê:** hoje **Recarregar** relê a mesma pasta (`palette.ts:200-247`).
O Humberto quer apontar para uma pasta **nova** e trocar o acervo inteiro
por imagens de lá com o **mesmo nome** — o "Reload All Images" do Spriter,
mas apontando pra outro lugar.

**Reaproveita três peças que já existem:**

| Peça | Onde |
|:---|:---|
| Achar imagem pelo nome, numa pasta | `sameFolderImages` (`io/project-folder.ts`) |
| Trocar uma imagem em tudo que usa | "Trocar a imagem em todas as peles…" (cap. 3) |
| Pivô não se perde ao trocar | `pivot-atlas.ts`, por nome |

**Pedido:** um botão **Trocar pasta de origem…**: escolhe a pasta, o
programa casa por nome com o que o projeto já usa, troca tudo de uma vez, e
avisa quantas trocou e quantas não tinham correspondência.

| Arquivo | O que muda |
|:---|:---|
| `io/project-folder.ts` ou `io/folder-atlas.ts` | função nova: dado o acervo usado e uma pasta de origem escolhida, devolve o plano de troca (casadas e sem par) |
| `panels/palette.ts` | o botão, ao lado de Abrir pasta / Recarregar |

**Teste com valor esperado:** acervo com `mao.png` e `pe.png`; pasta nova
com `mao.png` (arte diferente) e `sapato.png`. O plano diz: `mao.png`
trocada, `pe.png` sem correspondência (fica como está), `sapato.png` da
pasta nova ignorado (ninguém usa esse nome).

**Regra 6 da casa — um só desfazer:** a troca da pasta inteira é **um**
passo de desfazer, não um por imagem — como "Colar posição no osso" já faz
com cinco mãos de uma vez.

**Regra 21 da casa — avisa, não escolhe:** se a pasta nova tem o mesmo nome
em duas subpastas (ex.: `mao.png` em `padrao/` e em `armadura/`), o programa
**não escolhe sozinho** qual vale. Avisa e deixa a pessoa decidir — nunca um
palpite silencioso.

**Relação com o PSD (Q29, em aberto):** o padrão sem-recorte desta mesma
janela (16/09) e a troca de pasta inteira mexem na mesma régua — casar pelo
nome do arquivo. Se um dia a origem for outro PSD em vez de uma pasta de
PNGs, é a mesma conta ou outra? Fica com a resposta de Q29, não decidido
aqui.

**Pronto quando:** trocar de pasta troca todo o acervo que bate por nome,
o rodapé diz quantas trocaram e quantas não, o pivô de cada uma continua
certo, e um nome repetido em duas subpastas gera aviso, não escolha muda.

---

## Ordem sugerida

1. **B1 → B2 → B3** primeiro — sem B1, B2/B3 não têm o que sinalizar.
2. **C** depois de B.
3. **A** pode entrar em qualquer ordem — não depende dos outros dois.

## Testes: no arquivo do assunto, nunca um novo por lote (regra 16)

| Lote | Arquivo de teste |
|:---|:---|
| B1 | `editor/testes/peles.test.ts` |
| B2 | `editor/testes/arvore.test.ts` |
| B3 | `editor/testes/cena.test.ts` |
| A | `editor/testes/pasta-do-projeto.test.ts` |

## Fora do escopo deste plano

- Formato do `.bone`: nada muda. Osso/regra "só com a pele" já existe.
- Runtime: nada muda — ele já lê `skinRequired`/`skinMembers`.
- Exportar por pele: já funciona, sem mudança.

## Estado, depois da revisão do Planejador (16/09/2026)

Itens 1, 2, 3, 6 e 7 da revisão feitos acima. Itens 4 e 5 viraram perguntas
Q30 e Q31 pro Humberto — não são meus para responder. **Segue rascunho**:
não vira lote enquanto o código estiver congelado e Q30–Q31 sem resposta.

---

## Revisão do Planejador — 16/09/2026

Rascunho **bom**: lote, arquivo, teste com valor e "pronto quando". Os nomes citados existem (`ToggleSkinBone`, `sameFolderImages`, `pivot-atlas.ts`, `skinRequired`) — conferido. Antes de virar plano, falta isto:

| # | Falta | Por quê |
|:---:|:---|:---|
| 1 | **Tabela "Como os três fazem"** para o lápis (B), o aplicar-e-modificar (C) e a troca de pasta (A): Spriter (character map, Reload All Images) · Spine (active skin, *Add to Skin*, placeholders) · DragonBones. Pode sair das seções 1–2 da `PESQUISA peles` | método do Humberto: tabela com fonte antes de proposta |
| 2 | **Uma parte por lote** (regra 13). O B toca Peles, Cena e Árvore. Dividir: **B1** modelo puro em `skins-model.ts` (quem cria osso/regra pergunta a pele do lápis; Command com `apply`/`revert`) · **B2** o sinal na Árvore · **B3** o sinal na cena | dois chats não escrevem a mesma parte; `fronteiras.test.ts` julga |
| 3 | Marcar o que é **palavra dele** e o que é **proposta**. "O lápis liga o olho junto" e "a linha *editando a pele X*" são propostas da pesquisa | regra 5 da casa; o manual já errou por isso |
| 4 | **"Volta à base"**: no modelo novo, *base* é o corpo (BASE §8). A pele é de um corpo ou do projeto inteiro? | pergunta Q30 no `O PROGRAMA NOVO` |
| 5 | **Quando entra.** B e C mexem na criação de osso, que muda no degrau 5 do `O PROGRAMA NOVO` (M7, G1). Fazer antes = refazer depois. O A não depende do modelo | pergunta Q31 no `O PROGRAMA NOVO` |
| 6 | Lote A: a troca inteira é **um só desfazer** (regra 6); nome repetido em duas subpastas **avisa, não escolhe** (regra 21); relação com o PSD pela guia (Q29) | regras da casa |
| 7 | Testes nos arquivos da parte: `peles`, `arvore`, `cena`, `pasta-do-projeto` (regra 16). Sinal novo em **ícone com nome na dica** | regras 4 e 16 |

**Estado:** rascunho aceito como base. Não vira lote enquanto o código estiver congelado e Q30–Q31 sem resposta.
