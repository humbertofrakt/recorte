# Rodada 15 — partículas: usar o emissor

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada escreve código**, e mexe no **formato** e nos **dois runtimes**. É a única que escreve código e usa a máquina enquanto roda.

---

## Para quê

Palavras do Humberto, 04/10:

> *"não consegui usar as partículas (estava na árvore, em vez de um menu próprio), e também não conseguia mover elas, não conseguia clicar nela, ou associar a um osso na árvore."*

A rodada 14 achou a causa de cada um, no código, com linha:
`documentos/projeto do programa/06 AS PARTICULAS - pesquisa e proposta 2026-10-04.md`, **seção 5**. Leia o `06` inteiro.

Esta rodada faz o emissor **se usar**: achar, clicar, mover, girar, prender. Não faz o sistema completo: isso é a rodada 16.

---

## As decisões que já estão dadas

| # | Decisão do Humberto | Onde |
|:---:|:---|:---|
| 1 | **O emissor ganha posição e giro próprios** (`x`, `y`, `rotation`), como a imagem. **Muda o formato.** Ele disse sim | `03`, "sim pra tudo", linha 7 |
| 2 | A régua do que entra: função pura do tempo, e o nosso leitor desenha barato nas duas engines. **Arrastar a agulha para trás dá o mesmo quadro** | `03`, linha 6; `06`, seção 3 |
| 3 | Partículas têm **lugar próprio, com menu**. Não moram na árvore | `02`, seção 5 |
| 4 | O clique na cena escolhe **só a peça**, como no Spriter (rodada 8d). O emissor é uma peça | fim do `03` |

---

## O que tem de funcionar no fim

| # | O quê | Hoje | A causa (do `06`; **confira antes de confiar**) |
|:---:|:---|:---|:---|
| 1 | **O emissor tem uma marca sempre visível** na cena, na origem dele, mesmo parado e sem partícula | emissor sadio não tem marca nenhuma | `viewport-draw.ts`, perto de 786 |
| 2 | **Clicar na marca (ou nas partículas) escolhe o emissor.** Propriedades mostra a ficha dele | o clique pula quem não tem contorno | `viewport/picking.ts`. A rodada 8a abriu o caminho: um ramo no `pickAll` para anexo sem contorno, e `attachmentWorldPoints` devolvendo uma caixa |
| 3 | **Mover e girar o emissor** com as ferramentas e pela ficha (X, Y, giro, com número digitado). Na base grava na base; na animação cria chave só dele, pelo **osso próprio** da rodada 8d | Mover e Girar só agem em `region` e `skeleton`; o emissor não tem posição | `tools/attachment-edit.ts` (`pickedFor` aceita o tipo por lista); o formato |
| 4 | **Prender a um osso** pelo mesmo gesto da imagem, e por um campo **Osso** na ficha do emissor | só arrastando na Árvore, pela tecla P, ou no campo do slot; na ficha é só leitura | `properties-model.ts`, perto de 974 |
| 5 | **Um painel Partículas próprio**, com a lista dos emissores e os botões: Novo · os modelos (fogo, fumaça, faísca, poeira) · Duplicar (com semente nova) · Apagar. Aparece no menu Janela e nasce no arranjo de fábrica | não existe | **lembre:** painel novo precisa de uma linha no `RIGHT_GROUPS` de `ui/layout-model.ts`, senão não nasce na coluna e a medição nem o mede |
| 6 | **Sem nada escolhido, o emissor novo nasce onde se vê**: no meio da cena, preso a um osso que se clica, e já escolhido | nasce na raiz, invisível | `panels/tree-actions.ts`, perto de 138 |
| 7 | **O emissor "vazio" desenha alguma coisa** (um ponto padrão), ou a ficha diz em português *"falta a imagem: escolha uma"* | nasce sem imagem e não desenha nada | `panels/tree-commands.ts`, perto de 391 |
| 8 | **Os avisos do emissor aparecem** (*"12 partículas cortadas"*) no botão de avisos | existem no runtime e a cena não mostra | `viewport/particles-view.ts`, perto de 20 |

---

## O formato: `x`, `y`, `rotation` no emissor

É a parte difícil, e a que não se desfaz depois. **Faça primeiro, e me mande o plano antes de escrever.**

| Régua | |
|:---|:---|
| A extensão é `BONE_particles` | `formato/extensions/BONE_particles.md` e `.schema.json`. Leia inteira, até a §12 |
| Os três campos são **opcionais**, com padrão 0 | um arquivo de hoje continua válido e desenha **igual**: nenhum caso de conformidade muda de resultado |
| A conta | a origem do emissor deixa de ser a do osso: passa a ser a do osso, deslocada e girada por `x`, `y`, `rotation`, **do mesmo jeito que a imagem** (veja como o anexo `region` faz). Tem de continuar função pura do tempo |
| **Os dois runtimes** | `runtime/` (TypeScript) e `runtime-python/` leem os três campos e dão o mesmo resultado. O de Python é escrito **pela spec**, não copiando o de TypeScript |
| **Casos de conformidade novos** | pelo menos dois, com o número esperado **calculado à mão antes** (régua "o número esperado vem da conta, nunca do gerador"): um com `x`/`y`, um com `rotation`. E o confronto dos dois runtimes: `npm run conformidade:dois` |
| O validador | aceita os três campos; recusa texto no lugar de número, com o código de erro da extensão |
| A spec | uma linha nova na extensão, escrita por extenso. E a nota de versão no `CHANGELOG` |

**O plano, por `SendMessage`, em uma tela, antes de escrever código:** a frase da spec · a conta · os dois casos com o número à mão · o que muda em cada runtime · em quantos lotes você parte. **Espere o meu "pode".** Enquanto espera, faça o que não depende do formato: a marca (1), o clique (2), o painel (5), o nascer (6, 7), os avisos (8).

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro, `documentos/PARTES.md`, o `06` inteiro, e o fim do `03` (o que as rodadas 8a e 8d deixaram pronto para você) |
| 2 | Nem o Spriter, nem o Spine, nem o DragonBones têm partícula (o `06` conferiu). **Onde não há modelo, o emissor imita a imagem**: mesmo clique, mesma caixa, mesmo gesto de prender |
| 3 | **Antes de provar que consertou, prove que o defeito existia** (regra 26): refaça as linhas 1 a 4 na versão de hoje, com foto |
| 4 | Um lote = uma mudança que se vê = um par de fotos em `backup/fotos-obra/rodada-15/`. **Uma versão por lote.** Sugestão: lote 1, marca e clique · lote 2, o painel e o nascer · lote 3, o formato e os runtimes · lote 4, mover, girar e prender |
| 5 | O menu Partículas na barra é da **rodada 6**. Aqui o emissor entra no menu que existe hoje, e o painel entra no menu Janela |
| 6 | Teste novo no arquivo da parte. A contagem não cai: a referência por arquivo é o último `backup/contagem-testes_*.tsv`. Guarde a sua em cada fecho |
| 7 | Fecho de cada lote, **um processo de cada vez** (7,7 GB; meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (e `npm run conformidade:dois` no lote do formato) · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"` (o próximo livre no `backup/INDICE.md`) · seção no `CHANGELOG.md` |
| 8 | A medição vai ganhar um painel novo. Se ele não couber na altura, **diga o número**, não esconda |
| 9 | Com a tela do Humberto apagada, o navegador embutido **não desenha**. Para as fotos, use o Chrome sem janela por protocolo, como as rodadas 1, 8a e 8d (roteiros em `backup/fotos-obra/rodada-08d/roteiros/`) |
| 10 | Grande demais? Feche como versão o que está pronto e fotografado, e me diga o que sobrou |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, os casos, as fotos, as versões, o `programa/` montado |
| 2 | No `03`: a rodada 15 passa a **entregue**, com as versões e três linhas do que o Humberto vai ver |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` a cada lote fechado (rode `ListAgents` antes): as oito linhas, **feita / pela metade / não feita** · os números do fecho, com a hora |

## O que NÃO fazer

| | |
|:---|:---|
| Não faça o sistema: rajadas, curvas, gradiente, formas, trilha, sub-emissor | é a rodada 16 |
| Não crie o menu Partículas na barra, nem troque "pele" por "skin" | é a rodada 6 |
| Não mude nada no formato além de `x`, `y`, `rotation` do emissor | campo novo é decisão do Humberto, e só esses três estão decididos |
| Não edite `documentos/manual/` | só com a palavra do Humberto |
| **O Humberto está dormindo, ou longe.** Não pergunte nada a ele | dúvida vem para mim |
