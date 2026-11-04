# Retomada do Planejador — 17/09/2026, noite

Para quem assumir o papel de PLANEJADOR se esta janela (`animador-5e`) perder
o contexto ou morrer. **Tudo o que importa está no disco; nada vive só na
conversa.** Cinco minutos bastam.

## Onde o projeto está

| O quê | Onde ler |
|:---|:---|
| O estado do dia, versão por versão | `ESTADO.md` (cabeçalho e as duas últimas seções de 17/09) |
| O que cada versão mudou | `CHANGELOG.md`, v13.3 a v13.9 |
| Quem é quem, endereços, o que está vivo | `documentos/QUEM E QUEM.md`, as seções de 17/09 |
| O plano da obra, degrau por degrau | `documentos/planos/ARQUITETO 4 - tarefas ordenadas 2026-09-17.md` |
| A spec | `formato/ESPECIFICACAO 2026-09-17.md` (rascunho 0.2, com o Apêndice C) |

Feitos em 17 e 18/09: D0, D1 (esta janela), D2 (v13.6/13.7), D3 (v13.4), D4a (v13.5),
D4b (v13.9), D5 (v14.3/14.5), D6 (v14.0/14.2/14.4), D7 (v14.1/14.6). Fechos: v13.8 e v14.7.

## O que está rodando agora

**Nada, desde as 03:00 de 18/09.** A rodada D5/D6/D7 fechou na v14.7 (ver `ESTADO.md`). A tabela abaixo é a da rodada fechada, guardada como modelo da próxima:

| Chat | Degrau | Encargo |
|:---|:---:|:---|
| `EXECUTANDO · janela Animação` | D5 | `documentos/planos/ENCARGOS degraus 5 6 7 2026-09-17.md`, seção D5 |
| `EXECUTANDO · linha do tempo` | D6 | idem, seção D6 |
| `EXECUTANDO · cena, árvore e malha` | D7 | idem, seção D7 |

Eles reportam por `SendMessage` a `animador-5e`. Se esse endereço morrer, o
novo Planejador escreve o seu em `QUEM E QUEM.md` e manda uma linha a cada
chat: *"o Planejador agora é X"*.

## O que o Planejador faz nesta rodada

| Quando | Faz |
|:---|:---|
| Um chat pede "vou rodar o roteiro" ou "a medição" | responde **"pode"** a um de cada vez; o próximo só depois de o anterior dizer que terminou (portas fixas 5191 e 9335) |
| Um chat manda dúvida | responde curto; decisão de campo do formato ou de gesto que o Humberto não decidiu **sobe ao Humberto** |
| Um chat fecha | confere no disco (versão em `backup/versoes/`, `CHANGELOG`, a seção de desvios do encargo); anota no `ESTADO.md` |
| Os três fecharam | roda a suíte inteira, `tsc`, `npm run conformidade`, roteiro e medição; `python ferramentas/montar-programa.py`; fecha a versão do fecho; escreve o fecho em `ENCARGOS degraus 5 6 7`, `ESTADO`, `QUEM E QUEM`; **avisa o Humberto e para** |

## O que vem depois (só com a palavra do Humberto)

D8 ∥ D9 ∥ D10 (Imagens · Ordem · Entidades; Peles; Arquivo), depois D11 (casca,
com ele vendo), D12 (glacê), D13 (manual, só quando ele pedir). Tudo no
`ARQUITETO 4`. Os degraus D8 a D10 herdam as suposições escritas em
`DEGRAU 4b` (1, 2, 12) e no `ENCARGOS degraus 5 6 7` (seções de desvios).

## Lições do dia, para não repetir

- Chat aberto por ficha herda o **modelo** da janela que o criou. Trocar para
  Opus logo depois do clique (`set_session_model`), antes da primeira mensagem.
- Endereço de chat no `ListAgents` é o título da ficha, não o título novo da
  janela.
- Três chats em `editor/src` ao mesmo tempo só funciona com cerca por parte,
  arquivos de passagem só acrescentando, e o "pode" das portas.
- Quando dois runtimes leem a spec de jeitos diferentes, o caso decide e a spec
  ganha uma linha (Apêndice C). Não o teste.

## 18/09/2026, 07:55 — o aplicativo reiniciou no meio da rodada 8/9/10

Os endereços mudaram todos: agora o endereço **é o título da janela**.

| Papel | Endereço de agora |
|:---|:---|
| Planejador | `PLANEJADOR · animador-5e` (o `animador-5e` sozinho morreu) |
| D8 | `EXECUTANDO · imagens, ordem e entidades` |
| D9 | `EXECUTANDO · peles` |
| D10 | `EXECUTANDO · arquivo` |

Os três continuam em Opus (conferido) e continuaram o trabalho sozinhos. Estado na hora do reinício: D8 v15.0 (lote 1), D9 v14.9 e v15.1 (no lote 3), D10 v14.8 e v15.2 (fechando; pediu a segunda volta do roteiro). Encargo: `documentos/planos/ENCARGOS degraus 8 9 10 2026-09-18.md`.

## 18/09/2026, 08:30 — a rodada 8/9/10 fechou na v15.8

**Nada rodando.** Feitos D0 a D10. Falta D11 (casca, com o Humberto vendo), D12 (glacê) e D13 (manual, só quando ele pedir). Encargo e regras aprendidas: `documentos/planos/ENCARGOS degraus 8 9 10 2026-09-18.md`, seção do fecho. O D11 é **um chat só** (a casca é de todo mundo: `shell.ts`, `menus.ts`, `keys.ts`, `layout-model.ts`), e pede o Humberto na frente da tela a cada lote.
