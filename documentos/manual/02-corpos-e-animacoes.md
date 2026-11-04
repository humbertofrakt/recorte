# 2. Bases e animações

Atualizado em 07/10/2026, na v36.5. O que era "corpo" no programa agora se
chama **base** (decisão de 04/10: *"corpo" vira base*).

## O que você vai conseguir fazer no fim

1. Montar o personagem na **base** e ver a mudança valer em todas as animações.
2. Ter **várias bases** no mesmo projeto, cada uma com as animações dela.
3. Fazer uma base nova a partir de um quadro de animação.
4. Fazer o homem **virar lobisomem** no meio da animação.

---

## Este é o capítulo mais importante do manual

Quem entende este capítulo entende o resto do programa.

O teste é uma frase do Humberto: *"quero que se possa criar e gerar malha no
meio da animação"*. O [lobisomem](#a-virada-corte-seco), mais abaixo, é a
prova de que entendemos.

---

## A base é uma animação com um quadro só

As palavras dele:

> *"o modo montar provavelmente vai deixar de existir (...) cada base é uma
> pose — homem, lobisomem. Eu imagino que na base a barra de timeline vai
> estar aparecendo, mas só vai ter o keyframe 0."*

**A base não é um modo, não é uma tela.** É uma linha na janela Animação.
Abrir a base mostra a cena e a linha do tempo de sempre, com um quadro só.

| Pergunta | Como é hoje |
|:---|:---|
| Onde a base mora | na janela **Animações**, na linha **Base — montar** |
| Como abro a base | clique em **Base — montar**, ou **Base → Abrir a base** |
| Como sei que estou na base | a linha **Base — montar** fica acesa; o rodapé diz onde se está |
| Mexer na base | vale em **todas** as animações, menos onde a animação tem chave própria |
| Quantas poses de montagem | **uma por base**. Homem é uma, lobisomem é outra |
| O tocador | **nunca some**. Na base: relógio em `0,00 s`, um losango, botões cinza com a dica *"a base tem um quadro só"* |
| Chavear na base (`K`) | não grava chave: o rodapé diz *"Com a base aberta, a pose de repouso já é esta"* |

---

## A janela Animações: cada base tem as animações dela

> *"na aba animações vai aparecer a base fogo e as animações dela em lista,
> como a do mecha. **Um menu parecido com o da entidade do Spriter.**"*

**Janela → Animações.** De cima para baixo:

```
Animações
├── Bases            Base — montar · homem   2
│                    Base — montar · lobisomem   1
├── Animações        as da base em foco
├── as entidades     cada uma com as animações dela, recuadas
└── De fora          arquivos de animação citados (só aparece se houver)
```

| Com… | A janela mostra |
|:---|:---|
| **uma base só** | uma linha, **Base — montar**, com os dois botões ao lado |
| **mais de uma** | a tira **Bases**, uma linha por base: *Base — montar · nome* e a conta de animações |

| Gesto | O que faz |
|:---|:---|
| Clique numa base | ela passa a ser a base em foco, e a base dela abre |
| Clique numa animação | abre a animação daquela base na linha do tempo |
| Duplo clique numa animação | renomeia ali mesmo. `Enter` grava, `Esc` desiste |
| Botão direito numa animação | Renomear · Duplicar · Mandar para o topo · Exportar animação… · Apagar |
| A estrela ★ | marca a primeira da lista: é a que o jogo abre |
| A palavra *repete* | a animação volta ao começo. Liga-se no tocador (`L`) |

**Os ícones da tira Animações** (o nome está na dica):

| Ícone | Faz | Também em |
|:---|:---|:---|
| + | Nova animação | Animação → Nova animação |
| cópia | Duplicar | Animação → Animações → Duplicar animação |
| lápis | Renomear | Animação → Animações → Renomear animação |
| topo | Mandar para o topo | Animação → Animações → Mandar para o topo |
| lixeira | Apagar | Animação → Animações → Apagar animação |
| pasta | Biblioteca de animações | Animação → Animações → Biblioteca de animações… |

**Os dois botões da base** (na tira Bases, ou ao lado de *Base — montar*):

| Botão | Faz | Também em |
|:---|:---|:---|
| Salvar como base nova | o quadro de agora vira uma base nova, com o nome que você der. A animação não muda | Base → Salvar como base nova… |
| Rebaixar a entidade | a base escolhida sai da lista Bases e vai para o painel Entidades. A base em foco não se rebaixa | Entidades → Rebaixar a entidade |

**Nada disto trava a edição.** Osso novo, malha nova, imagem nova: tudo
funciona no meio de uma animação. O que não é animável vai para a base, e o
rodapé diz: *"(foi para a base)"*.

| Função | Selo | Gesto |
|:---|:---:|:---|
| A lista Bases, e as Animações trocando com ela | existe | Janela → Animações; clique na base |
| Abrir a base | existe | clique em **Base — montar** · Base → Abrir a base |
| Fazer uma base nova de um quadro de animação | existe | Base → Salvar como base nova… · botão na tira Bases |
| Trazer outra base de fora para o projeto | existe | Base → Trazer uma base de fora… |
| O tocador nunca some | existe | com a base aberta, fica em `0,00 s`, cinza, com a dica |
| Clonar uma base **com** as animações dela (decisão 2 do modo Base) | falta | não achei porta no menu nem na janela. Não confirmei outro caminho |

---

## Peça tirada da base: as chaves ficam guardadas

Decisão 5 do modo Base: *"como dois saves: um não apaga o outro"*.

| Passo | O que acontece |
|:---:|:---|
| 1 | Apague da base um osso que tem chaves nas animações (`Delete`) |
| 2 | O rodapé diz quantas chaves guardou: *"20 chaves de 2 peças guardadas em 3 animações"* |
| 3 | As animações tocam sem erro. O arquivo salvo abre sem aviso |
| 4 | Crie de novo uma peça **com o mesmo nome e do mesmo tipo**: as chaves voltam |
| 5 | Outro tipo com o mesmo nome: não volta, e o rodapé avisa |

**Base → Chaves guardadas…** mostra quantas, de quem. Ali há **Jogar fora
todas** e **Guardar**. `Ctrl+Z` devolve.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Guardar as chaves da peça tirada | existe | `Delete` na base |
| Ver e jogar fora as guardadas | existe | Base → Chaves guardadas… |

---

## Por que não é a entidade do Spriter

Ele: *"o Spriter começou essa ideia, mas não foi eficiente em fazer isso. Por
isso o nosso não pode se basear 100% no dele."*

A lista parece a do Spriter. A diferença está na **chave**.

| | Spriter (entidade) | Recorte (base) |
|:---|:---|:---|
| A lista | cada entidade com as animações dela | igual — cada base com as dela |
| Uma animação sai da base dela? | **nunca** | **sim**, colando outra base no meio |
| Transformar no meio | duplicar a animação noutra entidade | a mesma animação, com uma chave, troca de base e segue |

### A régua

> **O que é lei é a FLUIDEZ do Spriter — não a implementação dele onde ela
> falhou.**

Onde o Spriter é rápido, copiamos o gesto ([capítulos 1](01-montar-um-corpo.md)
e [4](04-animar.md)). Onde ele emperrou, o Recorte faz diferente.

---

## A virada: corte seco

Ele: *"no keyframe passado ele era humano, no seguinte ele é lobisomem."*

| Passo | O que fazer |
|:---:|:---|
| 1 | O projeto precisa de **duas bases** ou mais (Base → Salvar como base nova…, ou Base → Trazer uma base de fora…) |
| 2 | Abra a animação e ponha a agulha no quadro da virada |
| 3 | **Animação → Troca de base → Colar outra base aqui** |
| 4 | Com várias bases, a janela pergunta qual. Ela traz também **A base do arquivo**: é a volta |
| 5 | A linha do tempo abre os Detalhes e mostra a chave nova |

Para desfazer: agulha na chave, **Animação → Troca de base → Tirar a troca
daqui**. Ou `Ctrl+Z`.

Com uma base só, o item avisa: *"Este projeto tem uma base só: não há outra
base para colar"*. Na base, avisa: *"Abra uma animação primeiro"*.

| Pergunta | Resposta |
|:---|:---|
| A virada tem caminho? | **não: corte seco** (chave `stepped`, como a de trocar o pai) |
| As chaves de antes mudam? | **não.** O que a animação disse continua dito. O que ela não disse vem da base nova |
| O rabo do lobisomem existe antes da virada? | **não: nasce na virada.** Cada base é montada uma vez; a virada troca qual está viva (spec §9.13) |
| As skins vestidas passam para a base nova? | quem anima decide. Agulha na chave da virada → **Propriedades**: caixa **A pilha de skins passa** |
| Um leitor que não conhece a virada vê o quê? | a base do arquivo o tempo todo. Nada quebra (spec §9.13, nível C) |

---

## O caso completo do lobisomem, com as palavras dele

> *"Criei uma animação 'transformar': ela começa com a base do mecha; na
> metade ele se abaixa; eu colo a base do lobisomem, coloco ele abaixado
> também; e a outra metade da animação é o lobisomem se levantando (...) Eu
> poderia ter colocado uma entidade explosão de 3 ms na timeline, entre o
> mecha e o lobisomem, em cima deles na draw order."*

| Trecho da animação `transformar` | O que está lá | Gesto |
|:---|:---|:---|
| primeira metade | base **mecha**, se abaixando — animada na mão | chaves de sempre |
| o quadro da virada | a base **lobisomem**, também abaixada | Animação → Troca de base → Colar outra base aqui |
| segunda metade | o lobisomem se levantando — animado na mão | chaves de sempre |
| por cima de tudo | a **explosão**: entidade, só dirigida | ver [capítulo 5](05-entidades.md) |

**Dali em diante tudo fala do lobisomem**: a cena, a Árvore, a Ordem e
Propriedades leem a base que vale naquele instante. Osso novo criado depois
da virada vai para a base do lobisomem, e o rodapé diz: *"(foi para a base de
lobisomem)"*.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Colar outra base no meio da animação | existe | Animação → Troca de base → Colar outra base aqui |
| Tirar a virada | existe | Animação → Troca de base → Tirar a troca daqui · `Ctrl+Z` |
| Cena, Árvore, Ordem e Propriedades seguindo a base do instante | existe | mova a agulha para depois da virada |
| A pilha de skins passa, ou não | existe | Propriedades, com a agulha na chave da virada |
| Entidade de mesmo slot segue para a base nova; slot que falta avisa | existe | `runtime/src/actor.ts:183-193` (`NESTED_GONE`); o editor junta os avisos da virada em `doc/document.ts:395-398`, e eles vão para os avisos do rodapé (`ui/shell.ts:3374`). Lido no código, não visto na tela |
| A explosão acima das duas bases, na ordem de desenho | existe diferente | a entidade entra num slot e ocupa o lugar dele na ordem. Ver [capítulo 5](05-entidades.md) |

---

## O que já era isto, e não sabíamos chamar assim

| Hoje | Selo | No modelo |
|:---|:---:|:---|
| A **pose de repouso** do `.bone` | existe | é a base |
| *"o que a animação não disser vem do repouso"* | existe | é a regra: mexer na base muda todas as animações, menos onde há chave própria |
| A chave **`parent`** — a arma que vai para as costas | existe | troca um pedaço do rig no meio da animação. [Capítulo 1](01-montar-um-corpo.md) |
| As **skins** | existe | trocam imagem e podem trazer osso. A base troca tudo. [Capítulo 3](03-peles.md) |

---

## O projeto é a caixa

> *"Mecha não é um corpo, é um projeto. (Caixa)"*

```
Projeto: "mecha"
├── Bases        mecha · lobisomem
├── Entidades    fogo · espada · motosserra
└── Animações    as de cada base
```

**Não existe "base principal".** Quem dá nome ao conjunto é o projeto.

| | Como é hoje | Gesto |
|:---|:---|:---|
| **Começar** | o programa **pede a pasta** primeiro, como o Spriter | Arquivo → Novo projeto… (`Ctrl+N`) |
| **Salvar** | grava a pasta inteira: um `.bone` por base e por entidade, e o `manifest.json` | Arquivo → Salvar (`Ctrl+S`) |
| **Um arquivo só** | um `.bonez` com tudo dentro | Arquivo → Exportar → Salvar como pacote… |
| **Entregar ao jogo** | só a base que o jogo precisa, com as imagens dela | Arquivo → Exportar → Entregar uma base… |
| **Formato** | zero campo novo para a caixa: é o `manifest.json` do `.bonez` (§2.9) | — |

---

## O selo — o que este capítulo confirma

| Função | Selo | Gesto ou onde |
|:---|:---:|:---|
| A base como linha da janela Animações | existe | Janela → Animações · **Base — montar** |
| Abrir a base | existe | clique na base · Base → Abrir a base |
| Várias bases, cada uma com as animações dela | existe | tira **Bases**, na janela Animações |
| Base nova a partir de um quadro | existe | Base → Salvar como base nova… |
| Trazer uma base de fora | existe | Base → Trazer uma base de fora… |
| Rebaixar uma base a entidade | existe | Entidades → Rebaixar a entidade · botão na tira Bases |
| Clonar uma base com as animações | falta | não achei porta |
| O tocador nunca some | existe | linha do tempo, com a base aberta |
| Chaves guardadas da peça tirada | existe | Base → Chaves guardadas… |
| A virada (colar outra base no meio) | existe | Animação → Troca de base → Colar outra base aqui |
| Tirar a virada | existe | Animação → Troca de base → Tirar a troca daqui |
| A pilha de skins passa na virada, ou não | existe | Propriedades, caixa **A pilha de skins passa** |
| Tudo seguindo a base do instante | existe | cena, Árvore, Ordem, Propriedades |
| Chave `parent` | existe | [capítulo 1](01-montar-um-corpo.md) |
| Skins | existe | [capítulo 3](03-peles.md) |
| O projeto como caixa, que pede a pasta | existe | Arquivo → Novo projeto… |
| Salvar a pasta inteira (bases, entidades, manifesto) | existe | Arquivo → Salvar |
| Entregar só uma base ao jogo | existe | Arquivo → Exportar → Entregar uma base… |

---

Próximo: [3. Skins](03-peles.md)
