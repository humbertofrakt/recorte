# Projeto das peles do Recorte — feito a partir do Spriter, do Spine e do que já temos

Escrito em 16/09/2026 pela Pesquisa, a pedido direto do Humberto: *"a gente
não vai implementar nada. A gente só tem que planejar como vai ser o uso de
pele no nosso programa."* Este documento **não é lote** — é o desenho final,
pra quando o código descongelar. O lote técnico (arquivo, teste,
"pronto quando") já está escrito à parte, em
`PLANO peles em bloco - rascunho 2026-09-16.md`, e segue este projeto.

**Legenda:** 🗣️ palavra dele (dito nesta janela) · 💡 proposta da pesquisa,
ainda sem confirmação dele.

---

## O que foi lido

| Programa | Fonte | Onde está |
|:---:|:---:|:---|
| Spriter Pro | manual oficial, seção Character Maps | `documentos/pesquisa/nova pesquisa/spriter/Spriter - todas as funcoes 2026-09-08.md:86-89, 170-178` |
| Spine | manual oficial, seção Skins | `documentos/pesquisa/nova pesquisa/spine/Spine - todas as funcoes 2026-09-08.md:237-257` |
| DragonBones | manual (Internet Archive) | `documentos/pesquisa/nova pesquisa/dragonbones/DragonBones - todas as funcoes 2026-09-08.md`. Não achado um recurso de costume/skin igual aos outros dois — marcado como **não confirmado**, não inventado |
| Recorte, hoje | manual + código, conferido ao vivo | `documentos/manual/03-peles.md`, `editor/src/panels/skins-model.ts`, teste ao vivo de hoje (`PESQUISA peles - Spriter Spine e o que ja temos 2026-09-16.md`, seção 4.1) |

---

## 1. Como os outros dois fazem

| | Spriter — Character Map | Spine — Skin |
|:---|:---|:---|
| **A troca** | tabela imagem-por-imagem, na mesma entidade | conjunto de anexos por *slot* |
| **Osso ou regra só numa variação** | **não dá.** Toda variação precisa que o osso já exista na entidade base, usado ou não | **dá.** *Add to Skin* num osso ou restrição: só existe com aquela skin ligada |
| **Empilhar peças** | pilha de mapas ativos | *Mix and match*: várias skins numa só |
| **Trocar tudo de uma vez** | *Reload All Images*: relê do mesmo caminho no disco | não achado um "trocar pasta inteira" |
| **Onde se mexe** | um painel próprio (CharMaps), simples: duas colunas | Propriedades do osso/restrição, técnico — sem um "modo pele" guiado |

🗣️ **O Humberto, sobre o Spriter:** *"ele tem um problema: exige que o
programa tenha todos os ossos diferentes."* — é a linha 2 da tabela acima.

🗣️ **A régua que ele deu:** *"nisso vamos seguir o Spine — mas trazendo pra
um modo intuitivo e simples."*

---

## 2. O que o Recorte já tem (não é deste projeto — é a base)

Testado, com teste automatizado, funcionando hoje:

| Peça | Onde |
|:---|:---|
| Pele = conjunto de anexos, pode trazer desenho que o corpo não tinha | capítulo 3 do manual |
| Osso e regra só existem com uma pele ligada | `peles.test.ts` |
| Peles empilham (armadura + capa, por exemplo) | capítulo 3 |
| Exportar só uma pele, atlas menor (medido: 50,6%) | `Exportar → Por pele…` |

O que falta **não é o formato — é o caminho até lá**. É disto que trata o
resto do documento.

---

## 3. O modelo que vamos seguir

Base: o modelo do Spine (osso e regra podem ser só de uma pele). Encaixe: o
jeito de usar do Spriter (duas colunas, simples, sem painel técnico). Em
cima dos dois, dois pedaços que **nenhum dos dois tem**:

1. **Trocar a pasta inteira** de uma vez, como character map, mas por nome
   de arquivo, não por objeto pré-existente.
2. **Aplicar e modificar**: depois de escolher a pele, dá pra **criar** —
   osso, desenho, regra — direto nela, sem sair do fluxo normal de montar.
   Nenhum dos dois programas tem isto.

---

## 4. O uso, item por item

"Hoje" diz se já existe (**pronto**) ou se é **novo**. O menu chama a mesma
função do botão — nunca uma cópia (mesma regra do `PROJETO DO MENU`).

### Criar e ver

| Item | Como se usa | Hoje |
|:---|:---|:---:|
| Nova pele | aba Peles → **Nova pele**, nomeia | pronto |
| Ver (olho) | liga o desenho daquela pele na tela; várias ao mesmo tempo | pronto |
| Editar (lápis) | escolhe onde nasce o que se cria a seguir | pronto **só pra desenho** |
| Empilhar | duas ou mais com o olho ligado, a de cima cobre a de baixo | pronto |
| Duplicar / Apagar | copia a pele inteira, ou apaga com as linhas de tempo dela | pronto |

### Aplicar e modificar 🗣️

| Item | Como se usa | Hoje |
|:---|:---|:---:|
| **Um lápis só** 🗣️ | lápis aceso em `X`: osso, desenho **e regra** novos já nascem só de `X`, sem passo extra | novo (Lote B1) |
| **Sinal na tela** | osso/regra/desenho que só existe numa pele ganha um ícone, com o nome na dica, na Árvore e na cena | novo (Lote B2/B3) |
| **Aviso ao editar** 💡 | ao acender o lápis numa pele, uma linha avisa "editando a pele X"; o olho liga junto | novo (Lote C), formato do aviso ainda não confirmado por ele |
| **Tirar a pele** 🗣️ | apaga o olho: tudo que só existia nela some da cena, da Árvore e da pose, volta ao normal | pronto no formato; falta confirmar que não sobra nada na tela |

**O exemplo dele, de ponta a ponta:** esqueleto humano, sem rabo → lápis
aceso em `rabo` → cria o osso do rabo (nasce já só do `rabo`) → arrasta a
imagem do rabo, prende no osso → olho desligado → volta a ser só humano,
sem sobra.

### Trocar o desenho

| Item | Como se usa | Hoje |
|:---|:---|:---:|
| Uma imagem por vez | campo Imagem (Propriedades), Ficha rápida, ou clique de novo no desenho na cena — mostra as imagens da mesma subpasta | pronto |
| Em toda pele que usa aquele slot | Árvore → botão direito → **Trocar a imagem em todas as peles…** | pronto |
| **Pasta inteira** 🗣️ | botão 💡 **Trocar pasta de origem…** (nome proposto): escolhe uma pasta nova, tudo que bate por nome troca de uma vez, 💡 um só desfazer | novo (Lote A) |
| Nome repetido em duas subpastas | avisa, não escolhe sozinho | novo, junto com a pasta inteira |
| Pivô ao trocar | continua certo, casado pelo nome (já existe, não muda) | pronto |

### Entregar

| Item | Como se usa | Hoje |
|:---|:---|:---:|
| Só uma pele | `Exportar → Por pele…`, ou `npm run fatiar` | pronto |
| Combinar várias no jogo | `skeleton.setSkin(['default', 'armadura'])` | pronto |

---

## 4.1 A pilha de peles — palavra dele, 17/09/2026 🗣️

🗣️ *"No lugar do olho, eu queria poder clicar na skin e arrastar para fazer
a pilha de skins que eu estou usando. Tipo character maps."*

🗣️ E: editar a pele **na mesma janela**. O Character Map do Spriter abre
uma janela separada; aqui não.

| Coluna | O que tem |
|:---|:---|
| **Feitas** | todas as peles do corpo |
| **Ativas** | a pilha em uso agora, em ordem |

| Gesto | O que faz |
|:---|:---|
| Arrastar de Feitas para Ativas | liga a pele (substitui o olho) |
| Arrastar para fora de Ativas | desliga; o que só existia nela some |
| Arrastar dentro de Ativas | muda a ordem da pilha |

Fonte Spriter: *Activating and Stacking Character Maps* — arrastar de
"available" para "active" (`spriter/…todas as funcoes.md:88, 179-180`).

O que já existe por baixo: a lista de peles ligadas já é uma lista em ordem
(`visible` em `skins-model.ts`). O arrastar é novo; o dado não.

💡 Em aberto, sem confirmação dele:

- Qual cobre qual: a de **cima** da pilha ganha? → pesquisado (Q32), abaixo

**Q32 — no Spriter, quem cobre quem na coluna Active** (pesquisa, 17/09/2026)

| Fonte | O que diz |
|:---|:---|
| Manual oficial, *Activating and Stacking Character Maps* (brashmonkey.com/spriter_manual) | só que empilha. **Não diz** quem ganha |
| Prints `22-empilhar-character-maps_244/245.jpg` | o mapa novo entra **embaixo** do anterior (Blue, depois No Wings). Os dois não trocam a mesma imagem, então o print **não mostra** quem ganha |
| Runtime SpriterDotNet (`Providers/DefaultAssetProvider.cs`, `PushCharMap` → `ApplyCharMap`) | cada mapa grava por cima do dicionário: **o último aplicado ganha** |

**Resposta: não confirmado no editor do Spriter.** Indício: se o editor
aplica na ordem da lista, como o runtime, **o de baixo ganha**. É runtime
de terceiros, não o editor — não fixar sem a palavra do Humberto.
- A `default` fica sempre no fundo da pilha, sem sair?
- O lápis continua, ou editar é clicar numa pele da coluna Ativas?

---

## 5. Perguntas em aberto (não são desta janela)

Levantadas na revisão do Planejador, esperando resposta dele — ver `O
PROGRAMA NOVO - tudo junto 2026-09-16.md`, Q30 e Q31:

- **Q30** — no modelo novo (corpos e bases), a pele é de **um corpo**, ou do
  **projeto inteiro**?
- **Q31** — quando isto entra: antes ou depois do degrau que muda como o
  osso nasce (M7/G1)?

---

## Estado

Projeto de referência, não lote. Segue `PLANO peles em bloco - rascunho
2026-09-16.md` para arquivo, teste e ordem — aquele fica parado até o
código descongelar e Q30/Q31 responderem. Este aqui pode ser lido, discutido
e mudado a qualquer hora — é o desenho, não a execução.
