# Rodada 1 — conferir no uso: conexão e skin

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada não escreve código.** Só usa o programa, fotografa e escreve o que viu.

---

## Para quê

O Humberto decidiu como a conexão e a skin têm de ser (`02 AS DECISOES`, seções 2 e 3).
O código já tem pedaços disso, e **ninguém os usou**. Antes de construir, precisamos saber:

| Estado | Quer dizer |
|:---|:---|
| **já faz** | fiz o gesto no programa, e deu o resultado da decisão. Tem foto |
| **pela metade** | funciona em parte. Digo o que falta |
| **não faz** | não há porta, ou a porta não faz o que a decisão pede |
| **não achei** | procurei nos menus, na busca de comandos e na folha de tarefas, e não achei a porta. **É um achado, não um fracasso** |

Sem esta lista, a obra refaz o que está pronto e pula o que falta.

---

## Como

| # | |
|:---:|:---|
| 1 | Use o programa **montado**, em `programa/` (`servidor.mjs`), numa porta só sua (sugestão: 5320). **Um servidor, um navegador sem janela, um processo de cada vez.** A máquina tem 7,7 GB: meça a memória livre antes de abrir |
| 2 | Antes de procurar um gesto no código, procure como o **usuário** procuraria: os menus, a busca de comandos, o botão direito, `documentos/O QUE O PROGRAMA FAZ 2026-09-22.md`. Só depois leia o código para entender por que não achou |
| 3 | **Faça o gesto de verdade** e olhe a tela. Ler o código e concluir "existe" **não vale**: é exatamente o erro que esta rodada veio desfazer |
| 4 | Uma foto por linha da tabela, em `backup/fotos-obra/rodada-01/`. Liste a pasta no `backup/INDICE.md` |
| 5 | Material de teste: `formato/exemplos/` e `exemplo/`. Para a entidade, o herói e outro `.bone` qualquer servem (a "motosserra" pode ser qualquer boneco com duas animações) |
| 6 | Se o gesto não dá para fazer sem janela (arrastar de verdade, seletor de arquivo do Windows), **diga isso** na linha. Não troque por um atalho que o usuário não tem |

Os chats de uso de 28 e 29/09 deixaram o método deles em
`documentos/pesquisa/nova pesquisa/SEQUENCIA … 2026-09-28.md`. Vale ler um, para não
reinventar como se dirige o programa sem janela.

---

## O que conferir: conexão (decisões, seção 2)

| # | A decisão | O gesto a tentar |
|:---:|:---|:---|
| C1 | Trazer uma entidade para o projeto | Arquivo → Abrir uma entidade… Ela aparece na aba Entidades? |
| C2 | Trocar imagem por entidade | botão direito num desenho da cena → a grade lista entidades? Clicar troca? |
| C3 | A entidade herda lugar, ordem de desenho e chaves | depois de trocar: está no mesmo osso, mesma ordem? As chaves da imagem continuam valendo? |
| C4 | O pivô da entidade cai no pivô da imagem; o tamanho é o dela | olhar a posição depois da troca |
| C5 | A entidade sai, a imagem volta | trocar de volta pela grade |
| C6 | Pôr a entidade direto | arrastar da aba Entidades para a cena |
| C7 | Trocar na base vale em todas as animações | trocar com a base aberta, abrir duas animações |
| C8 | Trocar no meio da animação vale só dali em diante | trocar no meio, olhar antes e depois do quadro |
| C9 | A entidade adicionada vira base na lista, com as animações dela | olhar a aba Animações depois de adicionar |
| C10 | Clicar numa animação da lista troca a linha do tempo, e a cena continua montada | clicar numa animação da entidade |
| C11 | A faixa da entidade na linha do tempo | ela aparece? |
| C12 | Botão direito na faixa escolhe a animação | |
| C13 | Puxar a ponta da faixa: mais devagar, mais rápido | |
| C14 | Arrastar a faixa muda quando começa | |
| C15 | Em laço roda sozinha a partir de onde foi solta; sem laço é faixa com tamanho | |
| C16 | Mover, girar e escalar a entidade como imagem, e isso vira chave | |
| C17 | A mesma entidade duas vezes, cada uma com a sua faixa | |
| C18 | Entidade dentro de entidade | uma entidade que já tem outra encaixada |
| C19 | Ordem para uma animação que a peça não tem: fica parada, e o editor avisa | trocar a entidade por outra sem aquela animação |
| C20 | Marcar uma imagem como slot: ela vira base, com nome e animações | existe alguma porta? (pode ser "promover", "transformar em base") |
| C21 | Abrir a entidade, mexer, salvar: Novo ou Por cima | Arquivo → Salvar a entidade editada… |
| C22 | Um projeto vira entidade pelo menu Arquivo | |
| C23 | O visualizador de montagem: encaixar e desencaixar para testar | Janela → arranjo "Visualização", a tela cheia da Visualização. Dá para encaixar entidade ali? |
| C24 | O botão "Aparecer na linha do tempo" | |
| C25 | "Este boneco": a peça em volta do personagem, metade atrás, metade na frente | provavelmente **não faz**. Confirme, e diga o que o formato tem hoje (spec §7.11) em uma linha |

## O que conferir: skin (decisões, seção 3)

| # | A decisão | O gesto a tentar |
|:---:|:---|:---|
| S1 | Criar a skin e pôr em edição (o lápis) | aba Peles → Nova pele |
| S2 | **Trocar** uma imagem na skin | com o lápis aceso, trocar pela grade |
| S3 | **Ignorar**: a skin não mexe naquela imagem | é o estado natural? Dá para desfazer uma troca só naquela skin? |
| S4 | **Esconder**: a imagem não é desenhada naquela skin | existe porta? |
| S5 | Trocar uma pasta inteira pelos nomes iguais | "pele de uma pasta" |
| S6 | Imagem nova criada com a skin em edição é só dela | |
| S7 | **Osso** criado com a skin em edição é só dela, com sinal na Árvore e na cena | |
| S8 | Tirar a skin: o osso e a imagem dela somem | |
| S9 | **Apagar um osso da base só naquela skin**, com os filhos, avisando quantos | provavelmente **não faz**. Confirme |
| S10 | Clonar a skin: o clone usa os mesmos ossos | existe "duplicar pele"? |
| S11 | Ativar, empilhar várias, a de cima vence | Feitas e Ativas |
| S12 | Testar skins no visualizador, sem mexer no arquivo | a tela cheia da Visualização |
| S13 | A entidade entra com a skin dela | uma entidade que tem skin, encaixada |

Achou um defeito que não está na lista? Anote numa seção "Achados fora da lista". Não conserte.

---

## O que entregar

| # | |
|:---:|:---|
| 1 | `documentos/projeto do programa/04 O QUE JA FAZ 2026-10-04.md` (confira a data no relógio): as duas tabelas acima, com as colunas **estado · o que eu vi · foto · o que falta** |
| 2 | No topo dele, um quadro: quantos **já faz**, **pela metade**, **não faz**, **não achei** |
| 3 | No fim dele: **a sua sugestão de ordem** para as rodadas 8 a 12, em cinco linhas |
| 4 | No `03`: o estado da rodada 1 passa a **entregue**, e uma linha em "O que cada rodada entregou" |
| 5 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage`, com o quadro do topo. Rode `ListAgents` antes |

## O que NÃO fazer

| | |
|:---|:---|
| Não escreva em `editor/`, `runtime/`, `runtime-python/`, `formato/` | a rodada é só de olhar |
| Não rode `versao.py` | não há versão nova |
| Não conserte nada | anote |
| Não confira a tela, as partículas nem as ferramentas do Spine | é a rodada 2 |
