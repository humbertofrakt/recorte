# Quadro aberto — 14/09/2026

Tudo o que está de pé e ninguém está tocando. Escrito para **não se perder**.
Pedido do Humberto, 14/09: *"anote tudo, vamos cuidar disso depois."*

Linha de base: **v12.5**, 2.793 testes, conformidade 53/53, roteiro 14/14,
painéis 22/22 de lado e 15/22 de altura.

A semana de 14/09 é de **terminar o que já existe no programa**. Palavras dele.

---

## A frente da semana: o fluxo criar e animar

**Decidido.** O modo Montar sai como lugar e vira arrumação de tela.

| Papel | Onde |
|:---|:---|
| O pedido, com as palavras dele | `PEDIDOS o fluxo criar e animar 2026-09-14.md` |
| A avaliação, com o custo e a ordem | `AVALIACAO o modo montar e preciso 2026-09-14.md` |

| Lote | O que é | Estado |
|:---:|:---|:---|
| 1 | **Chave `parent`** — trocar de pai em Animando grava chave em vez de expulsar. O formato (§9.4), o runtime (`animation.ts:174`) e a conformidade (C-281) já esperam por ela. Só o editor não faz | pronto para virar plano |
| 2 | **Malha e pesos param de expulsar** — a ferramenta mostra aquele desenho na forma de repouso, o resto do personagem apagado atrás, e o rodapé diz *"vale em todas as animações"* | pronto para virar plano |
| 3 | **O tocador nunca apaga** — sempre há uma animação aberta; o arquivo novo já nasce com uma | pronto para virar plano |
| 4 | **O interruptor sai da barra** — Construir e Animar viram arranjos no menu Janela, ao lado de *Voltar ao padrão* | depois dos três |

**A única pergunta que falta:** trocar de pai em Animando grava chave **sempre**,
ou pergunta *"só aqui, ou no arquivo todo?"*

---

## O que ficou pendente da v12.5

| # | O que | De onde vem |
|:---:|:---|:---|
| 1 | **A quina** — criar grupo novo arrastando a aba para a borda, com sombra da área onde vai nascer | fase 3 de `PEDIDOS a coluna do meu jeito 2026-09-13.md`; anotado no fim do `INDICE.md` |
| 2 | **A prova que falta** — pendurar no `roteiro-30` salvar, fechar e reabrir de verdade. É a única que pega a família de erros que mordeu cinco vezes em 13/09 | `INDICE.md`, fim |

---

## A altura dos painéis

Conhecido, medido, escrito. Não é dívida escondida.

| Aba | 1440×900 | 1280×720 |
|:---|:---|:---|
| Malha e pesos | cabe com o vizinho fechado, 128 px de folga | **faltam 78 px** |
| Propriedades | cabe com o vizinho fechado (0 px de sobra) | **faltam 88 px** |
| Exibição | cabe com o vizinho fechado (0 px de sobra) | **faltam 141 px** |
| Prévia | cabe | **faltam 13 px** — e a troca está dita: o `×` que fecha o painel custa esses 13 px |

A saída conhecida para a Prévia, se um dia quiser os dois: o palco encolher com
o painel.

---

## Pedido dele, ainda sem plano

| O que | Onde | Estado |
|:---|:---|:---|
| **Reutilizar e aninhar** | `PEDIDOS reutilizar e aninhar 2026-09-13.md` | anotado da conversa. Nada feito. Precisa virar plano |

---

## Propostas esperando escolha dele

| O que | Onde | Estado |
|:---|:---|:---|
| **Linha do tempo: copiar, colar e repetir** | `PROPOSTAS linha do tempo - copiar e repetir 2026-09-13.md` | nove propostas, agrupadas em três rodadas. **Proposta, não plano.** Ele escolhe quais entram |

---

## Parado por decisão dele — não começar sem ele pedir

| O que | Por quê |
|:---|:---|
| **O manual** | *"primeiro o programa, depois o manual"* (10/09). Os 29 testes do manual estão pulados em `editor/testes/manual-pausado.ts` |
| **Painel em janela própria (popup)** | mandou ignorar em 13/09. Flutuar dentro do programa é o que ele quer, e isso já está feito na v12.5 |
| **Renomear o Recorte para BONE BANANA** | fase própria, depois do domínio. O mapa está no fim do `ESTADO.md` |

---

## Já feito, para ninguém refazer por engano

| O que | Onde olhar |
|:---|:---|
| Pôr imagem nova no meio da animação | lote 57 — o slot nasce vazio em 0 e o desenho entra no tempo em que foi solto, como no Spriter |
| Criar osso, ponto e caixa em Animando | v12.x |
| Ordem de desenho vira chave em Animando | lote 66 |
| Descolar o painel da lateral e colar de volta | v12.5 |
| O arranjo dos painéis fora do `.bone`, na máquina | v12.5 |
| A caixa gira com o desenho; três alças no osso | `PLANO caixa ossos e malha 2026-09-13.md`, feito |
| O gesto do P | `PLANO o gesto do P 2026-09-13.md`, feito |
| O Transformar junta as cinco, com Alt para inclinar | feito |

---

## Onde o FLUXO ainda é do Spine — achado em 14/09

Ele, 14/09: *"Spine é muito ruim, Spriter é supremo."* A régua da casa é antiga
e continua: **o fluxo é do Spriter; do Spine vêm só as ferramentas.**

Varredura do Diretor atrás de fluxo copiado do Spine por engano:

| # | O que | Por que é do Spine | Estado |
|:---:|:---|:---|:---|
| 1 | O modo `Montagem \| Animando` | é o Setup/Animate do Spine, inteiro | decidido: sai (ver a avaliação de 14/09) |
| 2 | Malha e pesos trancados no repouso | regra do Spine | lote 2 do fluxo |
| 3 | **"Gravar sozinho" desligado RECUSA a edição** (`pose-mode.ts`, saída `'bloqueado'`) | no Spriter esse estado não existe: editar fora de uma chave **cria** a chave. Não há o que recusar | **achado em 14/09, sem plano** |
| 4 | **O Chavear com semáforo verde/vermelho** | o Spriter tem **Key all** e **Key selected** (cap. 15): dois botões, e o que eles decidem é *quais objetos* recebem a chave — nunca *se a edição vale* | **achado em 14/09, sem plano** |

Os itens 3 e 4 são o mesmo assunto visto de dois lados: **no Spriter, editar
sempre vale.** O que existe lá é escolher *o alcance* da chave, não um freio.

Antes de virar plano, é preciso o aval dele: o interruptor "Gravar sozinho" some
e vira **Key all / Key selected**, como no Spriter, ou fica?

---

# 15/09/2026 — o dia do modelo e do manual

O dia mudou o projeto de eixo. Não saiu função nova para o Humberto usar: saiu
**o modelo do programa**, ditado por ele, e o manual que o descreve.

## O que ele decidiu hoje

| # | Decisão | Onde está escrita |
|:---:|:---|:---|
| 1 | **A base é uma animação com o quadro 0.** Não é modo, não é tela | `AS REGRAS DA BASE`, seção 8 |
| 2 | **Cada corpo tem as animações dele.** Trocar o corpo troca a lista | seção 11 |
| 3 | **Base e entidade são a mesma matéria**, papéis diferentes. Uma vira a outra | seções 10 e 12 |
| 4 | **Base é animada na mão; entidade já vem animada** — você só escolhe qual animação dela toca | seção 12 |
| 5 | **A entidade segue a IMAGEM, nunca o osso.** *"Não se guarda a mão direita nas costas"* | seção 13 |
| 6 | **A peça em laço começa onde foi solta** | seção 14 |
| 7 | **A régua corrigida:** é lei a FLUIDEZ do Spriter, não a implementação dele onde falhou | seção 11 |
| 8 | **O manual é o guia da versão NOVA**, não auditoria do velho | `O MANUAL - encargo 2026-09-15.md` |

## O que o Diretor decidiu, por delegação dele

*"Você é o diretor e você que controla as coisas"* — 15/09.

| Decisão | Estado |
|:---|:---|
| Índice do manual: 11 capítulos, Corpos antes de Peles | aplicado |
| A aba Malha e pesos **rola** em tela pequena | mandado fazer |
| O ícone desconhecido vira **aviso**, não letra desenhada no personagem | mandado fazer |
| *"Gravar sozinho"* desligado **deixa de recusar** a edição | escrito no manual, selo falta |
| Regra 21 da casa: **onde o programa não entende, ele avisa — não improvisa** | escrita no `CLAUDE.md` |

## O que continua sendo DELE, e trava desenho

| # | Pergunta |
|:---:|:---|
| 1 | **Um corpo dono, ou uma caixa de corpos iguais?** Mexe no núcleo do formato — regra 7 |
| 2 | A cauda do lobisomem antes da virada: existe escondida (proposta: **presença**) ou nasce ali? |
| 3 | Compatibilidade: o leitor de hoje vê o homem e ignora o lobisomem, com aviso? |
| 4 | As partículas e a biblioteca entram antes, junto ou depois das bases? |
| 5 | A convenção de nomes de osso é nossa, publicada, ou seguimos uma existente? |

## O manual — onde está

| Capítulo | Estado |
|:---|:---|
| 0 Abrir · 1 Montar um corpo | auditados, com selo. **9 achados** |
| **2 Corpos e animações** | escrito do zero. **Publicado**: `claude.ai/artifact/2RV9DdzqbWEu5HUyxZgn9j` |
| 3 Peles · 6 Malha · 7 Regras · 8 Exportar | por auditar |
| 4 Animar | auditado, 6 achados |
| **5 Entidades** | escrito do zero. **Publicado**: `claude.ai/artifact/WVBzew8efQiin1SwUkCXYe` |
| 9 Vindo do Spriter | vira a tabela das 59 funções |
| 10 Partículas e biblioteca | por escrever |

**Densidade dos achados:** 3 no capítulo 02, 6 no 04. A regra que saiu disso:
**o manual apodrece onde o código mexeu** — as seções paradas há meses estavam
certas. A ordem da auditoria passou a ser a do CHANGELOG.

**Quatro comandos existem, funcionam, e não tinham nem tecla nem manual:** Colar
espelhado · Copiar a pose do escolhido · Empurrar as chaves… · Limpar chaves
repetidas. Some-se a `rippleMove`, que passou semanas verde e inalcançável.
**Entre nós, a função nasce; a porta e a palavra ficam para depois — e o depois
não vem.**

## Ideias novas escritas hoje

| O quê | Onde |
|:---|:---|
| **Partículas** — função pura do tempo, com semente. Nenhum dos três tem | `IDEIAS NOVAS - particulas e biblioteca 2026-09-15.md` |
| **O caminho do Mixamo** — convenção de nomes (já temos), biblioteca de animações (já especificada), auto-rig por nome de peça | idem |
| **A aba Peças** — de onde as entidades vêm | manual, capítulo 5 |

## Versões do dia

v12.6 a v13.0 saíram em 14/09. Em 15/09: **nenhuma versão nova** — dia de
modelo e manual. As duas peças de código mandadas (o ícone e a aba que rola)
estavam rodando ao fim do dia.

---

# A FASE DE AGORA — 15/09/2026: juntar e planejar. Programar depois.

Ordem do Humberto, textual:

> *"Só estamos juntando informações e planejando no manual. Depois disso é que
> vamos programar."*

**Nenhum lote de código novo é aberto nesta fase.** Quem chegar agora e quiser
"adiantar uma funçãozinha" está indo contra a ordem dele.

| Ordem | O quê |
|:---:|:---|
| 1 | Os quatro pesquisadores escrevem: o que falta no editor · como se faz efeito · o que os usuários pedem · do que reclamam |
| 2 | O manual absorve tudo, capítulo por capítulo, com selo |
| 3 | Ele lê o manual inteiro e diz o que está errado |
| 4 | **Só então** se volta a programar — com a lista pronta, ordenada e selada |

**A única exceção, autorizada pelo Diretor e contada a ele:** duas peças que já
estavam rodando quando a ordem chegou — a letra na mão do herói (defeito que ele
viu na tela) e a aba Malha e pesos passando a rolar. As duas terminam; nada
começa depois delas.

**O porquê da fase, e vale escrever:** decidir no texto custa uma frase; decidir
no código custa um lote. Em 15/09 ele apagou uma tela inteira (o painel de
encaixes) e um campo de formato (o "corpo principal") com duas frases.


# 16/09/2026 — decidido pelo Humberto

## As três diferenças de hábito com o Spriter: **copia o Spriter**

Palavra dele: *"copia o spriter"*. Vale para as três. **Código congelado:**
aplica quando ele mandar voltar a programar.

| # | Gesto | Hoje no Recorte | Vai ficar |
|:---:|:---|:---|:---|
| 1 | Criar osso | outro gesto | **Alt**, como no Spriter |
| 2 | Somar à seleção de chaves | Shift (`panels/dopesheet-pointer.ts:66-67`) | **Ctrl + clique**, como no Spriter |
| 3 | Copiar a ordem dos desenhos | Editar → Copiar a ordem na animação | **chave a chave**, como no Spriter |

**Atenção para o executor:** no Recorte, Ctrl + arrastar hoje **clona** a chave
(item 6 da linha do tempo). Se Ctrl passa a somar, o clonar precisa de outra
casa. Antes de escolher, ver como o Spriter clona — não inventar.
Fonte: `O QUE O SPRITER TEM E NOS FALTA 2026-09-14.md`, linha 84.
