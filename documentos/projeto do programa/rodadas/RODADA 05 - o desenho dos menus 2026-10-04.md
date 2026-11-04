# Rodada 5 — o desenho dos menus

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada não escreve código e não abre o programa.** Só lê e desenha.
(A rodada 1 está usando o `programa/` agora, e a máquina tem 7,7 GB.)

---

## Para quê

Palavras do Humberto, 04/10:

> *"é pra tudo ficar e funcionar. O problema é que eu não entendi como usar isso, pois não tinha isso nos menus."*

> *"no Spine absolutamente tudo está dentro da árvore. O nosso tem as coisas organizadas: base e animação em um lugar próprio, e cada coisa em seu lugar. Skins tem que ter seu menu próprio. Imagens e entidades também."*

> *"não consegui usar as partículas (estava na árvore, em vez de um menu próprio)."*

Ele quer a filosofia do **Photoshop**: um menu Janela, painéis que se soltam, contextos.

Hoje: 7 menus, **232 itens**, 15 painéis. O menu Animação tem 66. A malha tem **zero** itens de menu.

**O que sai desta rodada:** um desenho dos menus para ele riscar. Depois que ele aprovar, a rodada 6 constrói.

---

## O que ler

| O quê | Onde |
|:---|:---|
| As decisões | `documentos/projeto do programa/02 AS DECISOES do projeto 2026-10-04.md`, inteiro. A seção 4 é a da tela |
| Os menus de hoje, item por item | `editor/src/ui/menus.ts` e `editor/src/ui/actions-table.ts` (só ler) |
| A foto dos menus | `documentos/projeto do programa/01 A FOTO do programa 2026-09-29.md` |
| Onde fica cada botão | `documentos/pesquisa/nova pesquisa/ONDE FICA CADA BOTAO 2026-09-29.md` |
| A última arrumação dos menus | `documentos/planos/A ORDEM DOS MENUS 2026-09-29.md` |
| O que não tem porta | `documentos/O QUE NAO TEM PORTA 2026-09-22.md` |
| Como o Spriter e o Spine organizam | `documentos/pesquisa/pesquisa antiga/menu/` e `…/manuais/`. **Leia; não responda de memória** |
| Como o Photoshop organiza | pesquise na internet a barra de menus e o menu Janela (Window) dele, com link |

---

## As réguas do desenho

| # | Régua |
|:---:|:---|
| 1 | **Nada sai.** Os 232 itens de hoje têm de estar no desenho novo, cada um num lugar. Faça a conta no fim: 232 entraram, 232 saíram. Se um item sumir, diga qual e por quê |
| 2 | **Cada coisa com menu próprio:** Skins · Imagens · Entidades · Partículas. E as ferramentas do Spine com porta: Malha e pesos · Regras · Física · Caminho |
| 3 | **A ordem dos menus segue o trabalho**, como no Spriter: trazer as imagens → montar → animar → vestir → encaixar → exportar |
| 4 | **Menu curto.** Nenhum menu com mais de ~20 itens à vista; o resto vai em submenu com nome claro |
| 5 | Os nomes são os do Humberto: **base**, **animação**, **entidade**, **slot**, **skin**. O programa hoje diz "pele": proponha a troca para "skin" como **pergunta para ele**, não como fato |
| 6 | As funções **novas** das decisões entram no desenho com a marca **(novo)**: visualizador de montagem · "Aparecer na linha do tempo" · marcar como slot · "Este boneco" · esconder imagem na skin · clonar skin · pedir pasta ao começar · salvar como entidade |
| 7 | O menu **Janela** como o do Photoshop: a lista de todos os painéis, os arranjos (contextos), voltar ao padrão |
| 8 | Não desenhe painel nem barra de ferramentas. Só a barra de menus e o que há dentro de cada menu |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | `documentos/projeto do programa/05 O DESENHO DOS MENUS <data do relógio>.md` |
| 2 | No topo: a barra de menus numa linha só, na ordem. Ex.: `Arquivo · Editar · Imagens · …` |
| 3 | Uma tabela por menu: **item · o que faz, em palavras dele · de onde veio (menu de hoje) ou (novo)** |
| 4 | Uma tabela "o que mudou de lugar", só com os itens que trocaram de menu |
| 5 | A conta dos 232 |
| 6 | "Perguntas para o Humberto": no máximo cinco, cada uma com a sua suposição |
| 7 | Frases curtas, tabelas alinhadas. Ele é disléxico e vai **riscar** este papel |
| 8 | No `03`: o estado da rodada 5 passa a **entregue**. Avise o `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes) |

## O que NÃO fazer

| | |
|:---|:---|
| Não escreva em `editor/` | é só desenho |
| Não abra o programa, nem rode testes, roteiro ou medição | a rodada 1 está usando a máquina |
| Não tire função nenhuma | nada sai |
