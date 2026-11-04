# Pendências — 09/09/2026

Escrito pelo planejador a pedido do Humberto: "deixa lá tudo anotado que eu vejo depois".
Estado do projeto na hora: **v5.2**, 2.003 testes, cena em 69% nos dois modos.

**Atualizado no fim do dia: v6.3, 2.120 testes.** Os itens 1 a 4 e o 14 estão **feitos** (lotes 30 a 38). A lista "O básico que falta" fechou. O executor parou; o Humberto testa.

## Em andamento

| # | O que | Quem |
|:---:|:---|:---|
| 1 | Manual novo: 8 capítulos + capítulo 00 "fluxo de trabalho padrão", print de toda função, teste de completude nos dois sentidos. Lote 30, v5.3 | executor |
| 2 | Lista **"O básico que falta"**: cada passo do fluxo padrão que trava, exige tecla secreta ou não tem botão à vista. Sai nos Desvios do lote 30 | executor |

## Na fila do executor

| # | O que | Lote |
|:---:|:---|:---:|
| 3 | **Pai pega os filhos**: escolhe o pai, segura P, clica em cada filho, como o B do Spriter. Anotação 17 do plano da rodada 3 | 31 |
| 4 | O que sair da lista "O básico que falta". O planejador transforma em anotações da rodada 4 | 32 em diante |

## Anotadas para depois, sem urgência

| # | O que | Por quê espera |
|:---:|:---|:---|
| 5 | Alt+arrastar cria osso em qualquer ferramenta, como no Spriter | colide com o Alt de outras ferramentas; precisa escolher tecla |
| 6 | Régua do tempo em milissegundos, como opção | o formato grava segundos; é só conta na tela |
| 7 | Atalhos remapeáveis | primeiro a tabela de atalhos |
| 8 | Contorno laranja nos candidatos a pai com P apertado | a lista com busca resolveu o problema; o contorno é enfeite |
| 15 | **Ponto animado por quadro** (D4 da rodada 4, 10/09). Spriter: o ponto tem chaves próprias. Spine: preso ao osso. O Humberto disse "está envolvido com o pivô, ignora por enquanto, vejo depois". Sem campo novo até ele decidir | **A D5 (pivô) foi decidida em 10/09** e **está feita**: lotes 55 e 56, v8.0 e v8.2 (`PLANO pivô e Animando 2026-09-10`). O ponto animado continua esperando ele voltar nisso |
| 14 | **Regra geral para o `hidden`**: `[hidden]{display:none !important}` e um teste que recusa exceção. O defeito voltou quatro vezes | **feito**, lote 38, v6.3 |

## Paradas por ordem do Humberto: "primeiro vamos finalizar o programa"

| # | O que | Onde está o que já existe |
|:---:|:---|:---|
| 9 | **Runtime do socket** (espada por encaixe de nome, arma com animação própria, pele que vem de fora). Depois dele o editor ganha Novo → Esqueleto no slot | formato pronto desde a v3.5; 10 casos em `conformidade/casos-pendentes/`; ordem dos passos no `ESTADO.md`, "O que o lote socket fez". Quem faz: o chat de runtime |
| 10 | Repositório público, canal de conversa, licença MIT ou Apache, nome do domínio | `ESTADO.md`, "Requisitos [M] em aberto", seção A |
| 11 | Backup automático pelo gancho | script em `~/.claude/backup-antes-de-escrever.ps1`; falta registrar em `settings.json`. Até lá a cópia é à mão |

## Fora do foco

| # | O que | Por quê |
|:---:|:---|:---|
| 12 | Vídeo MP4 | não foi pedido pelo Humberto; veio da pesquisa dos 12 programas. O foco é animação para jogos. GIF, sequência PNG e folha de sprites já saem |
| 13 | Runtime em C/C++, Unity, Godot, Unreal | software não instalado nesta máquina; e programa primeiro |

## Glacê — só depois do programa (10/09/2026, v7.9)

**"Primeiro o bolo, depois o glacê. E decora."** — Humberto.

O **bolo** é o programa: o editor funcionando. Nada desta seção se faz antes de
ele dizer "o programa está pronto". Os itens 9 a 13 acima também são glacê.

**Como colar:** achou glacê num plano, numa conversa ou no código? Uma linha
nesta tabela. Não apague linha: risque quando for feita.

| # | O que | Onde está o que já existe |
|:---:|:---|:---|
| 16 | Manual em português e inglês. **Pausado** desde a v7.9 | `documentos/manual/`. Os testes que leem o manual estão **pulados** por `editor/testes/manual-pausado.ts` |
| 17 | Fotos do manual e manual em PDF | `fotos-manual.mjs`; `npm run manual-pdf` |
| 18 | Vídeos curtos por ferramenta (C5) | nada ainda |
| 19 | Interface do editor em inglês | nada ainda |
| 20 | Lote 53: o confronto dos dois leitores contra uma pasta | saiu da rodada 5 em 10/09; o texto do lote continua no plano |
| 21 | Lote 54: 11 casos de prova novos para a suíte | saiu da rodada 5 em 10/09; o texto do lote continua no plano |
| 22 | Leitor em Python | `runtime-python/` |
| 23 | As 18 decisões abertas da especificação | `ESTADO.md`, "Decisões em aberto" |
| 24 | Filtro da página do atlas (`minFilter`, `magFilter`), que ninguém lê | Desvio 8 do lote 48 |
| 25 | Troca de nome para BONE BANANA | mapa no fim do `ESTADO.md` |
| 26 | Site e validador na web | `site/`. Ainda desenham sem a Arte em pixel do lote 48 |
| 30 | `pivot_x/pivot_y` no runtime Python | `PLANO pivô e Animando`, lote 55. Só leitura; a pose não muda |
| 31 | Caso de conformidade A-036: pivô no atlas não mexe na pose | `PLANO pivô e Animando`, lote 55 |
| 32 | Manual: pivô, Carimbar, Duplicar no atlas, Montar enquanto anima, Definir pivô (caps. 2, 3, 4 e 8) | `PLANO pivô e Animando`, lotes 56 a 58 |
| 33 | §10.3 (`pivotX/pivotY`) no validador do site | `PLANO pivô e Animando`, lote 55. O de linha de comando entra no lote |

### Ainda não decidido: bolo ou glacê?

O Humberto decide. Enquanto não decidir, **ninguém mexe**.

| # | O que |
|:---:|:---|
| 27 | As ferramentas de linha de comando (`npm run fatiar`, `exportar-imagem` e as outras) |
| 28 | Exportar glTF |
| 29 | Importar do Spine, DragonBones e Spriter |

## Onde mais está escrito

- `ESTADO.md`: requisitos em aberto e a nota "programa primeiro".
- `documentos/planos/PLANO rodada 3 - a cara do Spriter 2026-09-09.md`: as 16 anotações feitas, a tabela da rodada 4, os Desvios de cada lote.
- `backup/INDICE.md`: toda versão, v0.1 a v5.2, uma linha cada.
