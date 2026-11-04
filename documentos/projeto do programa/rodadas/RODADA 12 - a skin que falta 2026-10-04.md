# Rodada 12 — a skin: o que falta

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada escreve código.** É a única que escreve código e usa a máquina enquanto roda.

---

## Para quê

A rodada 1 conferiu a skin no uso: **8 de 13 já funcionam** (`04 O QUE JA FAZ 2026-10-04.md`, tabela "Skin"; leia inteira). Faltam quatro coisas. Esta rodada faz as quatro, e só elas.

As decisões (`02 AS DECISOES`, seção 3). O sistema é o **Character Map do Spriter**, com ossos a mais:

| # | Decisão |
|:---:|:---|
| 2 | Para cada imagem, a skin diz: **trocar** · **ignorar** (a skin não mexe nela) · **esconder** (não é desenhada) |
| 4 | Com a skin em edição, o que eu crio é dela: imagens **e ossos** |
| 5 | O osso que eu apago sai **só daquela skin**. Os filhos saem junto, e o programa avisa quantos |

---

## O que tem de funcionar no fim

| # | O quê | Hoje (rodada 1) | Foto de hoje |
|:---:|:---|:---|:---|
| S4 | **Esconder** uma imagem na skin em edição: ela não é desenhada com aquela skin vestida. A base não muda | não há porta nenhuma | `55`, `56` |
| S3 | **Ignorar**: desfazer uma troca **só naquela skin**, por imagem. A imagem volta a ser a da base | só `Ctrl+Z` | `53`, `56` |
| S8 | **Tirar a skin: o osso dela some junto**, da cena e da Árvore | a imagem some; o **osso fica** | `61`, `62` |
| S9 | **Apagar um osso da base com a skin em edição apaga só naquela skin**, com os filhos, e o rodapé diz quantas peças saíram. Na base e nas outras skins ele continua | **apaga da base**, sem aviso (`default` 23 → 22) | `63` |

E duas provas que a rodada 1 não conseguiu fazer. Faça-as, com foto:

| # | Prova |
|:---:|:---|
| S11 | Duas skins empilhadas que mexem **na mesma imagem**: a de cima vence |
| S12 | Vestir e tirar skin na Visualização **não muda o arquivo** (comece com o arquivo limpo, sem o ponto de "não salvo") |

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro e `documentos/PARTES.md` |
| 2 | **Leia no manual do Spriter** o capítulo de Character Maps (`documentos/pesquisa/nova pesquisa/spriter/Spriter Pro - manual oficial 1.4.pdf`; `pdftotext` funciona): os botões **Set Hidden** e **Set Ignored**. E no manual do Spine (`…/spine/Spine User Guide - manual completo 2026-09-08.pdf`, pág. 115 a 119) os **Skin bones**. O gesto de esconder e ignorar segue o Spriter. **Não responda de memória** |
| 3 | **Onde ficam as portas:** na grade do botão direito (com a skin em edição, a grade ganha "Esconder nesta skin" e "Ignorar nesta skin"), e na aba Peles. E com item de menu: hoje em Esqueleto → Peles ▸ (o menu Skins é da rodada 6; não o crie) |
| 4 | **Antes de inventar campo:** veja o que o formato já tem para "este slot fica vazio nesta skin" e para "este osso não existe nesta skin" (a spec, as seções de skin; `skinRequired`, `skin.bones`). Campo novo no núcleo é decisão do Humberto (regra 7): se precisar, **pare e me avise** com a proposta. Estado só do editor vai em `RECORTE_editor_state` (regra 6) |
| 5 | **S9 é o difícil.** "O osso da base não existe nesta skin" pode não caber no formato de hoje (o formato sabe dizer "este osso só existe com tal skin", não o contrário). Levante primeiro, e **mande-me o plano do S9 por `SendMessage` antes de escrevê-lo**. Enquanto espera, faça S4, S3 e S8 |
| 6 | Regra 21: onde o programa não entende, **avisa**. Apagar na skin diz *"saíram 3 peças desta skin: braço, mão, espada. Na base continuam"* |
| 7 | **Antes de provar que consertou, prove que o defeito existia** (regra 26): refaça S8 e S9 na versão de hoje |
| 8 | Teste novo no arquivo da parte. A contagem não cai: a referência é a do último fecho, por arquivo, em `backup/contagem-testes_*.tsv`. Guarde a sua no fecho, do mesmo jeito |
| 9 | Fotos de antes e de depois, por linha, em `backup/fotos-obra/rodada-12/` |
| 10 | Fecho, **um processo de cada vez** (7,7 GB; meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"` (o próximo livre no `backup/INDICE.md`) · seção no `CHANGELOG.md` |
| 11 | Grande demais? Feche como versão o que está pronto e fotografado, e me diga o que sobrou |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, as fotos, a versão, o `programa/` montado |
| 2 | No `03`: a rodada 12 passa a **entregue**, com a versão e três linhas do que o Humberto vai ver |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes): as seis linhas, **feita / pela metade / não feita** · os números do fecho, com a hora · o que achou nos dois manuais, com a página |

## O que NÃO fazer

| | |
|:---|:---|
| Não troque "pele" por "skin" nos textos do programa, nem crie o menu Skins | é a rodada 6 |
| Não mexa na conexão (entidade, faixa) nem no clique na imagem | são as rodadas 8 |
| Não toque em `runtime/`, `runtime-python/` nem `formato/` sem me avisar | |
| Não edite `documentos/manual/` | só com a palavra do Humberto |
| **O Humberto está dormindo.** Não pergunte nada a ele | dúvida vem para mim |
