# Pele do corpo, pele externa ou animação reaproveitada — 17/09/2026

Pesquisa pedida pelo Humberto (Q30). Encargo: `PELE DO CORPO, PELE EXTERNA OU ANIMACAO REAPROVEITADA - encargo 2026-09-17.md`.
Da PESQUISA para o PLANEJADOR. Só documento; código congelado. Data conferida na máquina.

**Legenda:** 🗣️ palavra dele · 💡 proposta, sem aval · "não confirmei" = não conferido, **não vira verde**.

---

## Resposta curta

| Pergunta | Resposta |
|:---|:---|
| A pele é de um corpo ou do projeto? | **Do corpo.** Pele de projeto = pele de corpo **salva em arquivo próprio, com contrato `rig`**. Não é um lugar novo |
| As três convivem? | **Sim.** São três coisas diferentes: 1 é o dado, 2 é o pacote do dado, 3 é outra coisa (animação, não pele) |
| Campo novo? | Para 1: **nenhum** além de F19 e F22 (já decididos). Para 2 e 3: **um ou dois**, abaixo — decisão dele |

---

## 1. Como fazem

| Programa | Onde a pele mora | Pode trazer osso? | Animação vem junto? | Fonte |
|:---|:---|:---|:---|:---|
| **Spriter** | Character Map **dentro da entidade** (no SCML, `character_map` é filho de `entity`) | **não**: só troca ou esconde imagem que a entidade já tem | não; usa as animações da entidade | manual oficial, *What are Character Maps* (brashmonkey.com/spriter_manual); leitor SCML de terceiros `Trixt0r/spriter`, `SCMLReader.java`; nossa pesquisa `spriter/…todas as funcoes.md:86-89` |
| **Spriter** — levar a pilha para fora | arquivo `.scms` guarda **a pilha ativa** de um personagem | — | — | `spriter/…todas as funcoes.md:89, 100` |
| **Spine** | Skin **dentro do esqueleto**. Nada no manual diz que uma skin passa para outro esqueleto | **sim**: *Add to Skin* em osso e restrição | não | esotericsoftware.com/spine-skins (lido hoje) |
| **Spine** — animação em outro esqueleto | Importar projeto: *"An animation can be imported into a completely different skeleton, as long as it uses the same name for at least some bones"*. O que falta vira aviso, sem a chave | — | **sim, por nome de osso** | esotericsoftware.com/spine-import, seção *Animation* (lido hoje) |
| **DragonBones** | Skin por armadura. Runtime tem `replaceSlotDisplay` (troca a imagem de um slot por outra, até de outra armadura) e `replaceSkin` | não confirmei | várias instâncias **dividem o mesmo dado** de esqueleto e animação | docs.cocos.com, componente DragonBones 3.8 (lido hoje). **Site oficial da Egret fora do ar hoje** (conexão recusada) — `replaceSkin` só pelo resumo da busca: **não confirmei** |
| **Dota 2** — item comum | O item é **do herói**: cada herói tem os seus encaixes (arma, cabeça, costas…). A malha do item é **pesada nos ossos do esqueleto padrão daquele herói** | **não mexe nos ossos**: *"Valve is unable to ship hero items… that require the joints… to be positioned differently"*. Até 60 ossos **do esqueleto do herói**. Pano da fita usa ossos que o herói já tem (`ropeR_R0C0`…) | não; o item roda com as animações do herói | Steam Support, *Dota 2 Workshop – Item Model Requirements* (pelo resumo da busca; a página não abriu); guia Steam 149270397 (lido hoje) |
| **Dota 2** — item com esqueleto próprio | Em alguns encaixes, caixa **Custom Skeleton**: esqueleto novo, e as animações padrão **não** são aplicadas nele | **sim**, mas só com esqueleto inteiro próprio | traz as suas | mesma página Steam Support (pelo resumo da busca) — **não confirmei** a página inteira |
| **Dota 2** — Persona / Arcana | **Troca o modelo e as animações do herói inteiros** | é outro modelo | **sim, todas** | dota2.fandom.com/wiki/Persona (pelo resumo da busca) — **não confirmei** na página |
| **Dota 2** — item que muda animação | "Cosmetic modifiers": certos itens trocam animações específicas | — | troca algumas | Liquipedia/Fandom *Cosmetic Modifiers* (páginas não abriram; só o resumo) — **não confirmei** o mecanismo |
| **Mixamo** | Não tem pele. Você sobe **o boneco inteiro**; ele **monta o esqueleto** (auto-rig: marcadores em queixo, pulsos, cotovelos, joelhos, virilha) | o esqueleto é **o dele**, padrão (ex.: 65 ossos, ou 25 sem dedos) | **sim**: a animação cai em qualquer boneco com o esqueleto padrão | Medium, *How To Use Mixamo's Auto Rigging* · schoolofmotion.com (resumo da busca). Página da Adobe recusou (403): **não confirmei** na fonte oficial |
| **Mixamo** — boneco já com ossos | Aceita **se reconhece os nomes** dos ossos (`mixamorig:Hips`…). Senão: *"Unable to map your existing skeleton"* | — | — | fórum community.adobe.com, Mixamo (resumo da busca) |

**O que os cinco dizem juntos:**

| Achado | Quem |
|:---|:---|
| A pele **mora no personagem**, nunca solta no projeto | Spriter, Spine, DragonBones, Dota 2 |
| Levar para fora = **arquivo à parte** que conhece os nomes do personagem | Spriter `.scms` · Dota (item por herói) · nosso `assets.skins` + `rig` |
| Item que **muda os ossos** de verdade = **outro esqueleto**, não pele | Dota (Custom Skeleton, Persona) |
| Animação em outro boneco = **nome de osso igual** | Spine (import) · Mixamo |

---

## 2. Cada abordagem no nosso modelo

Modelo: `02` (P1 projeto é a caixa · M2 várias bases por corpo · M8 cada corpo tem as suas animações · E5 entidade segue a imagem · E18 animação para outro personagem).

### 2.1 Pele do corpo (Character Map do Spriter)

| O quê | Como fica | Fonte |
|:---|:---|:---|
| Onde mora | `skins[]` **do corpo**. Todas as bases e animações daquele corpo veem as mesmas peles | spec §4.4, §7.1 · `02` M2, M8 |
| Por que não do projeto | placeholder é **nome dentro de um slot** do corpo. Outro corpo não tem esses slots | spec §7.1 |
| Osso só da pele (rabo) | **já existe**: `skinRequired` + `skin.bones` | spec §4.4, §7.1 · `04` I3 |
| Pilha Feitas/Ativas | a lista de ativas é do corpo; a de **cima vence** | `04` I7, I7c |
| Já no formato | `skins`, `includes`, `bones`, `constraints`, `attachments`, `drawOrder` | spec §4.4 |
| Muda no formato (já decidido) | F22: "a última adicionada" → "a de cima da pilha" · F19: `default` deixa de estar sempre por baixo | `10` F19, F22 |
| **Campo novo** | **nenhum** | — |
| Limite | pele **não tem chave**: não há timeline de skin (§9 não tem). Ligar pele é escolha do jogo | spec §7.1 "Skin ativa: escolhida pelo runtime" · §9.1 (conferi pela lista de seções) |

### 2.2 Pele externa (Dota 2)

| O quê | Como fica | Fonte |
|:---|:---|:---|
| O que é | a **mesma pele do 2.1**, salva num `.bone` à parte, com `rig.slots` dizendo o que ela exige | spec §2.8, §4.8 |
| Como entra | o corpo cita em `assets.skins`; a pele entra no namespace dele **como se fosse local** | spec §2.8 |
| Serve a vários corpos | sim, a todo corpo que cumpre o `rig` (mesmos nomes de slot). É a "pele do projeto" que existe de verdade | spec §2.2 linha 111, §4.8 |
| Troca a cabeça por algo animado | **já existe**: pele externa põe `skeleton` (entidade) em **qualquer** slot | spec §2.8, §7.11 · exemplo `mecha-pele-inverno.bone` |
| **Não faz hoje** | **trazer osso próprio**: do arquivo externo, `bones`, `slots`, `constraints` são **ignorados** | spec §2.8 |
| "Muda muito o corpo" | se muda **imagem e ordem**: pele externa basta. Se muda **ossos**: no Dota isso é **outro esqueleto** (Custom Skeleton / Persona). Aqui = **entidade no slot** ou **outro corpo** | Dota: Steam Support (resumo) · spec §7.11 |
| No projeto-caixa | 💡 pele externa pode ser **um arquivo dentro do projeto** (`.bonez`), usada por vários corpos. Não precisa sair do projeto | spec §2.9 · `02` P1 |
| **Campo novo, se ele quiser** | 💡 **N1** — pele externa **trazendo osso e regra "só com a pele"** (hoje ignorados). Sem N1, o rabo de fora só vem como entidade | spec §2.8 |

### 2.3 Animação reaproveitada (Mixamo)

| O quê | Como fica | Fonte |
|:---|:---|:---|
| O que é | **não é pele.** É animação num `.bone` à parte, com `rig.bones`, citada em `assets.animations` | spec §2.8, §4.8 · `10` "Biblioteca de animações" |
| Convenção de nomes | **nossa e publicada** — decidido, **ainda não escrito** | `02` M14 · `10` F6 · BASE §16 |
| Osso que falta | timeline órfã é ignorada, com aviso `RIG_UNMET` (igual ao Spine) | spec §4.7, §4.8 · spine-import |
| Osso a mais (rabo) | sem chave, fica na base | spec §9.10 (M3 em `02`) |
| Casar com a pele | a animação fala de **osso e slot**; a pele troca **o que está no slot**. Não brigam. Só `deform`/`sequence` citam `skin` — e já há regra de busca | spec §9.6 "Qual skin casa com qual deform" |
| Auto-rig (montar esqueleto pelo nome da peça) | ferramenta, não formato. Não existe | `IDEIAS NOVAS` §2 · `PLANO peças e mechas` §3.3 |
| **Campo novo, se ele quiser** | 💡 **N2** — `rig.reference {bone, length}`: escala a **translação** para boneco de outro tamanho. Rotação já viaja de graça | `PLANO peças e mechas 2026-09-10` §3.2 ("decisão 3", nunca respondida) |
| **Campo novo, se ele quiser** | 💡 **N3** — animação local **por cima** da externa (`walk` de fora + rabo daqui). Alternativa sem campo: duas faixas no jogo | idem §3.4 |

---

## 3. Os casos dele

### 3.1 Homem → lobisomem com rabo

| Jeito | Funciona? | Como | Fonte |
|:---|:---|:---|:---|
| 1 · pele do corpo | **sim, hoje no formato** | pele `lobisomem` no corpo `homem`; osso `rabo` "só com a pele". Tirar a pele: volta a homem | spec §4.4 · `PROJETO DAS PELES` §4 · `04` I6 |
| 2 · pele externa | **só a imagem** | o rabo não vem (osso ignorado). Rabo só como **entidade** num slot, ou com **N1** | spec §2.8 |
| 3 · animação reaproveitada | **sim** | o `walk` de homem roda no lobisomem; o rabo fica parado na base. Rabo animado: **N3** ou faixa 2 no jogo | spec §4.8 · `PLANO peças e mechas` §3.4 |
| Virar **no meio** da animação | **não é pele** | pele não tem chave. É a **virada**: colar a base lobisomem, corte seco; o rabo nasce ali | `02` M10, M11, M11b · spec §9 (sem timeline de skin) |

⚠️ **Dois caminhos para o mesmo lobisomem**: pele (liga/desliga, escolha do jogo) e virada de base (acontece no tempo). 💡 Suposição, sem aval: **pele** para "este personagem É lobisomem"; **virada** para "ele SE TRANSFORMA agora". Precisa da palavra dele.

### 3.2 Esqueleto em cima + anjo embaixo (a de cima vence)

| Jeito | Funciona? | Como | Fonte |
|:---|:---|:---|:---|
| 1 · pele do corpo | **sim, com F22** | Ativas: `esqueleto` (cima), `anjo` (baixo). Slot a slot, quem tem a peça no de cima vence. Tronco = esqueleto; pernas = anjo, porque o esqueleto não define pernas | `04` I7c · `10` F22 · spec §4.4 |
| 2 · pele externa | **igual ao 1** | depois de carregada, a externa é igual à local | spec §2.8 |
| 3 · animação | não se aplica | não é pele | — |
| Cuidado | se o esqueleto pôr `null` nas pernas, ele **esconde** as do anjo (`null` conta como definição) | spec §4.4, §7.1 |
| Cuidado | ossos "só com a pele" dos dois somam (união), mesmo onde a peça perdeu | spec §4.4 |
| Hoje | a spec diz o contrário (**a última** ganha) — muda com F22 | spec §4.4 linha 554, 562 |

### 3.3 Espada trocada por entidade

| Jeito | Funciona? | Como | Fonte |
|:---|:---|:---|:---|
| 1 · pele do corpo | **sim** | slot da imagem da espada mostra `region` numa pele e `skeleton` (entidade) em outra | spec §7.11 "A troca é por skin" · `02` E5 |
| 2 · pele externa | **sim, é o caso do Dota** | pele de fora põe a entidade no slot da espada; `rig.slots` pede esse slot | spec §2.8 · §4.8 |
| 3 · animação | **sim** | a entidade toca a animação de mesmo nome (`inheritAnimation`) ou a escolhida (`02` E12b) | spec §7.11 · `10` F18 |
| Sem socket | segue a imagem: pendura no **osso do slot**, com `x, y, rotation` | spec §7.11 ("Sem socket") · `10` F7 |

---

## 4. Recomendação

**A pele é do corpo. A pele "de fora" é a mesma pele, salva em arquivo com `rig`. A animação reaproveitada é outra peça e convive com as duas.**

| Porquê | Fonte |
|:---|:---|
| Os quatro programas guardam a pele **no personagem** | tabela 1 |
| Placeholder é nome de slot **de um corpo**; pele solta no projeto não teria onde cair | spec §7.1 |
| A "pele do projeto" já existe e tem contrato: `assets.skins` + `rig` | spec §2.8, §4.8 |
| Quem muda **os ossos** de verdade, no Dota, é **outro esqueleto** — aqui, entidade ou outro corpo | Dota (resumo da busca) · spec §7.11 |
| Mixamo não é pele; o Spine faz o mesmo por nome de osso | spine-import · `02` E18 |
| Nenhum campo novo para decidir Q30 | seção 2.1 |

**Convivem assim:**

| Camada | Abordagem | Estado |
|:---|:---|:---|
| O dado | 1 · pele do corpo | formato pronto; falta F19, F22 e a tela (`04`) |
| O pacote | 2 · pele externa | formato pronto; falta a porta no editor; N1 se ele quiser osso de fora |
| A animação | 3 · Mixamo | formato pronto; falta M14 escrito, a porta, N2 e N3 se ele quiser |

---

## 5. Para o Humberto decidir (o Planejador leva)

| # | Pergunta | Suposição enquanto isso |
|:---:|:---|:---|
| a | Q30: pele **do corpo**, com pele externa por arquivo — de acordo? | sim (recomendação) |
| b | Lobisomem: pele (é lobisomem) **ou** virada de base (vira lobisomem)? Os dois? | os dois, cada um no seu caso |
| c | Numa virada para **outro corpo**, a pilha de peles ativas passa? | não: cada corpo, a sua pilha. **Não confirmei** em fonte nenhuma; é suposição |
| d | **N1** — pele externa traz osso próprio? | não; rabo de fora vem como entidade |
| e | **N2** — escala de translação para boneco de outro tamanho? | adiada |
| f | **N3** — animação local por cima da externa? | não; faixa 2 no jogo |

---

## Não confirmei

| O quê | Por quê |
|:---|:---|
| DragonBones `replaceSkin` | site oficial da Egret recusou conexão hoje; só resumo de busca |
| Dota 2: páginas da Steam Support e das wikis | 403/402 ou página vazia; usei o resumo da busca. "Custom Skeleton", limite de 60 ossos e Persona **não lidos na fonte** |
| Dota 2: como o "cosmetic modifier" troca animação | nenhuma página técnica abriu |
| Mixamo: auto-rig e esqueleto padrão | página da Adobe recusou (403); só guias de terceiros |
| Spine: skin passar para outro esqueleto | o manual não fala; ausência não é prova |
| Spriter: character map fora da entidade | só o `.scms` (pilha salva); o manual não diz se abre em outra entidade |
| A pilha na virada de corpo (5c) | suposição minha |
