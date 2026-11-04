# Rodada 8d — mover a imagem cria chave, como no Spriter

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada escreve código.** É a única que escreve código e usa a máquina agora.

---

## Para quê

O programa é uma cópia do Spriter. Hoje ele não faz o gesto mais básico do Spriter.

Palavras do Humberto, 04/10:

> *"No Spriter, quando você move o osso, ele cria uma chave. Quando você move a imagem, ela também cria uma chave. E ela não leva o osso. Se eu tenho duas imagens coladas no mesmo osso, se eu movo uma imagem, ela cria uma chave, mas não faz uma chave nem para o osso, nem para a outra imagem que estava colada no osso. Normalmente, eu pegava e bloqueava as imagens, para não correr o risco de clicar nelas e mover."*

E, perguntado se o clique na imagem deixa de pegar o osso junto: ***"sim, como no Spriter."***

---

## O que tem de funcionar no fim

| # | O gesto | Hoje (provado pela rodada 8a) | No fim |
|:---:|:---|:---|:---|
| 1 | Clicar numa **imagem** na cena | escolhe **o osso dela junto** | escolhe **só a imagem** |
| 2 | Mover, girar ou escalar a imagem, **numa animação** | a chave vai para o **osso**, e tudo o que está no osso vai junto | chave **só da imagem**. O osso não se mexe. As outras imagens do mesmo osso não se mexem |
| 3 | A mesma coisa, **na base** | grava na base | grava na base, só a imagem (como hoje, quando ela é escolhida sozinha) |
| 4 | Clicar num **osso** e mover | chave do osso; as imagens dele acompanham | igual |
| 5 | A **peça encaixada** (entidade) | igual à imagem de hoje | igual à imagem do fim: linhas 1 a 3 |
| 6 | **Travar desenhos** (existe na barra) | — | com ele ligado, o clique passa pela imagem e pega o osso. É o jeito dele de não mexer nas imagens sem querer. Confira que funciona assim |
| 7 | A linha do tempo | — | a chave da imagem **aparece** na folha, numa linha com o **nome da imagem**, e se apaga, copia e arrasta como as outras |
| 8 | Imagem escolhida pela Árvore ou pela Ordem, movida numa animação | grava na base e avisa "é da montagem" | cria chave, como a linha 2. O aviso antigo some |

---

## Como, por dentro — a sugestão que o Humberto aceitou

**Não muda o formato.** O formato não tem chave para a posição de um anexo, e não vai ganhar.

Cada imagem movida numa animação ganha **um osso só dela**, filho do osso em que ela está. Mover a imagem move esse osso, e a chave é dele. O nosso importador do Spriter **já faz assim**: veja `ferramentas/src/importar/spriter.ts`, perto da linha 466.

| Régua do desenho | Por quê |
|:---|:---|
| **O osso próprio não aparece na Árvore como osso.** A Árvore mostra a imagem, no lugar de sempre | o Humberto não quer tudo na árvore. Ele não deve nem saber que o osso existe |
| O osso próprio nasce **só quando precisa** (a primeira vez que a imagem é movida numa animação), e **num desfazer só** junto com a chave | arquivo que nunca anima a imagem não muda |
| A marca "este osso é o osso próprio de tal imagem" é estado **do editor**: `RECORTE_editor_state` (regra 6) | para o jogo, é um osso comum. O runtime não muda |
| Criar o osso próprio **não pode mover a imagem um pixel**, nem mudar a ordem de desenho, nem as chaves que já existem | senão o gesto estraga o que estava pronto |
| Um arquivo importado do Spriter **já tem** osso por sprite | reconheça-o, em vez de criar um segundo |

**Isto é uma sugestão de desenho, não uma ordem.** Se, lendo o código, você achar caminho melhor que também não mude o formato, proponha.

---

## PRIMEIRO, antes de escrever código: o plano, para o Diretor

Esta rodada muda o que o clique faz. Muita coisa do programa e dos testes se apoia no clique de hoje.

| Passo | |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro e `documentos/PARTES.md` |
| 2 | **Leia no manual do Spriter** (`documentos/pesquisa/nova pesquisa/spriter/Spriter Pro - manual oficial 1.4.pdf`; `pdftotext` funciona) como ele trata: clicar num sprite que é filho de um osso · mover esse sprite · *Key All* e *Key Selected* · travar (lock). **Não responda de memória.** Página e frase |
| 3 | Refaça no programa de hoje (v23.4) as linhas 1, 2 e 8 e **veja o defeito** (regra 26) |
| 4 | Levante **o que depende do clique de hoje**: o roteiro dos 30 minutos (`ferramentas/provas/roteiro-30.mjs`), os testes, a ficha rápida de Propriedades (a 8a fez dizer "Osso: head · entidade espada"), a seleção por retângulo, a tecla P, a casca de cebola |
| 5 | **Mande-me o plano por `SendMessage`, em uma tela:** o que achou no Spriter · onde o osso próprio nasce e onde fica a marca · o que acontece com cada coisa do passo 4 · em quantos lotes você parte · o que pode dar errado. **Espere o meu "pode"** antes de escrever código |

Enquanto espera, prepare o que não depende da resposta: as fotos de antes, os testes que provam o defeito.

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Um lote = uma mudança que se vê = um par de fotos em `backup/fotos-obra/rodada-08d/`. Se partir em lotes, **uma versão por lote** |
| 2 | Teste que muda **de propósito** (porque o clique mudou) se reescreve provando o comportamento novo, e você me diz **quais, pelo nome**. Nenhum teste é apagado nem pulado |
| 3 | **A contagem de testes.** O número de referência é **4.536**, medido em 04/10 às 21h05 (o `ESTADO.md` diz 4.608, e ninguém sabe explicar a diferença: veja o fim do `03`). No seu fecho, **guarde a contagem por arquivo** em `backup/` (a saída do `vitest` com um repórter que liste arquivo e número), com linha no `INDICE.md`. Se você descobrir de onde vêm os 94, diga |
| 4 | O roteiro tem de continuar **14 de 14**. Se um passo dele clicava na imagem para mover o osso, o passo muda para clicar no osso, e você me diz qual |
| 5 | Fecho, **um processo de cada vez** (7,7 GB; meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"` (o próximo livre; a última é a v23.4) · seção no `CHANGELOG.md` |
| 6 | Não toque em `runtime/`, `runtime-python/` nem `formato/`. Se achar que precisa, **pare e me avise** |
| 7 | Grande demais para um chat? Feche como versão o que está pronto e fotografado, e me diga o que sobrou |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, as fotos, a versão, o `programa/` montado |
| 2 | No `03`: a rodada 8d passa a **entregue**, com a versão e três linhas do que o Humberto vai ver |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes): as oito linhas da tabela, **feita / pela metade / não feita** · os números do fecho, com a hora · os testes reescritos, pelo nome |
| 4 | Eu vou **usar o programa montado** para conferir. Só então a rodada vira "feita" |

## O que NÃO fazer

| | |
|:---|:---|
| Não mude o formato nem os runtimes | a decisão é não mudar |
| Não faça a entidade virar base na lista, nem mexa na faixa | são a 8b e a 8c |
| Não troque "pele" por "skin" nem mexa nos menus | é a 6 |
| Não conserte o emissor de partículas | é a 15 |
| Não edite `documentos/manual/` | só com a palavra do Humberto |
