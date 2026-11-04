# O manual — encargo do Diretor — 15/09/2026

Ordem do Humberto, 15/09: *"o objetivo atual é criar um manual do programa.
Vamos pegar todas as funções e ideias e padronizar lá; dessa forma podemos
entender o que está faltando, ver o que não está se encaixando. Depois que tudo
estiver bem construído, aí voltamos a trabalhar no programa."*

**Isto libera o manual.** A regra antiga — *manual só quando ele pedir* — está
cumprida: ele pediu. Os 29 testes pulados em `editor/testes/manual-pausado.ts`
voltam a valer quando o manual existir.

## Para que serve este manual

Não é documentação de programa pronto. É **a régua**: escrever "como se faz"
obriga a decidir o gesto, e é lendo isso que o Humberto confere se entendemos o
que ele quer. As palavras dele:

> *"lá no manual eu poderia ver se você entendeu que eu quero a liberdade do
> Spriter — como por exemplo, quero que se possa criar e gerar malha no meio da
> animação."*

## As três regras do manual

| # | Regra |
|:---:|:---|
| 1 | **Toda função tem o GESTO escrito.** Que tecla, quantos cliques, onde. "É possível editar a malha" não é manual; "com a malha na mão, clique simples cria vértice" é |
| 2 | **Toda função leva um selo**, e são só quatro: **existe** · **existe diferente** · **falta** · **muda com as bases**. Sem selo, a linha não entra |
| 3 | **Nada se inventa.** O que existe se confere no código, com arquivo e linha. O que falta vem dos documentos, citados pelo nome. Quem não achar escreve **não confirmei** — e isso vale mais que um verde mentiroso |

## O material já está na pasta — não comece do zero

| Fonte | O que dá |
|:---|:---|
| `documentos/planos/O QUE O SPRITER TEM E NOS FALTA 2026-09-14.md` | 59 funções do Spriter, com o veredito e o arquivo do nosso código. **É o esqueleto do manual** |
| `documentos/planos/AS REGRAS DA BASE 2026-09-14.md` | o modelo novo: bases, herança, o lobisomem, a base é uma animação com o quadro 0 |
| `ESTADO.md` | o que o programa faz hoje, função por função |
| `CHANGELOG.md` | o gesto exato de cada coisa que entrou, com o porquê |
| `documentos/pesquisa/nova pesquisa/` | os manuais dos três programas |
| `ferramentas/provas/roteiro-30.mjs` | os 14 passos do caminho inteiro: é o capítulo "começar" pronto, e provado |

## A forma

**HTML**, decisão dele. Régua da casa para a leitura dele: frases curtas,
tabelas com colunas alinhadas, nada encostado num lado só, e o texto no meio da
página. Uma página por assunto, e um índice que cabe numa tela.

Mora em `documentos/manual/`.

## A prova de que o manual está certo

O Humberto lê e reconhece o programa que pediu. O teste dele, textual: **"criar
e gerar malha no meio da animação"** tem de estar escrito lá, com o gesto — e
com o selo certo. Quem escrever o capítulo da malha confere no código se isso
funciona HOJE (a v12.6 tirou a expulsão para a Montagem; gerar malha em Animando
é o que precisa ser verificado, não presumido).

## O que o manual NÃO faz

| | |
|:---|:---|
| Não mexe em `editor/src` | é documento |
| Não fecha versão no `versao.py` | não é código |
| Não roda `npm run roteiro` nem `npm run medir` | porta fixa; ficam livres para quem fecha |
| Não decide sozinho | função sem gesto decidido vira pergunta ao Diretor, que leva ao Humberto |

## O caminho

`Manual → Diretor (animador-01) → Humberto`. Regra 19 antes de tudo: rode
`ListAgents`, ponha `MANUAL · <endereço>` no título e assine
`documentos/QUEM E QUEM.md`.
