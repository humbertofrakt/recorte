# O que ainda não temos — encargo do pesquisador — 15/09/2026

Ordem do Humberto, hoje: *"vamos listar partículas e outras coisas que seria
interessante ter. Por favor liste todas as coisas que devíamos ter, como
partículas, e as outras ferramentas que não foram adicionadas do Spine. E outras
coisas: procure na internet o que seria interessante adicionar."*

E o momento, com as palavras dele: *"estamos só planejando; vamos fazer um
manual, e depois que tiver pronto é que voltamos a fazer o programa."*

**Nenhum lote de código nesta frente. Ninguém toca em `editor/src`.**
Documento, não versão: nada de `versao.py`, nada de `npm run roteiro`, nada de
`npm run medir` — as duas provas usam porta fixa e outras frentes precisam dela.

O resultado é **um** arquivo: `documentos/planos/O QUE AINDA NAO TEMOS 2026-09-15.md`.

---

## Parte 1 — o que falta do Spine

Fonte na pasta: `documentos/pesquisa/nova pesquisa/spine/Spine - todas as funcoes 2026-09-08.md`
e o PDF do guia oficial ao lado. **Não vá à internet nesta parte.**

Mesma disciplina do inventário do Spriter, que deu certo (59 linhas, zero
"não confirmei"): uma linha por função, cinco colunas —

| Função (como o Spine chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |

Veredito com cinco valores: **igual · diferente · falta · não se aplica · não confirmei**.

| Regra | |
|:---|:---|
| Todo "igual" aponta **arquivo e linha** do nosso código | sem isso, o veredito é "não confirmei" |
| "Não confirmei" vale mais que verde mentiroso | dez "não confirmei" honestos valem mais que dez mentiras verdes |
| A lista é **inteira**, não a memória de ninguém | física e molas, restrições de caminho, clipping, tint black, sequências de imagem, mixagem entre animações: sabemos que várias faltam — queremos todas, com o veredito conferido |

## Parte 2 — partículas

Base já escrita: `documentos/planos/IDEIAS NOVAS - particulas e biblioteca 2026-09-15.md`.
Leia primeiro.

**A regra que não se negocia:** o emissor é **função pura do tempo, com
semente**. Se arrastar o cursor para trás mostrar outra coisa, o formato morre
como padrão — nenhum estúdio adota um formato que não repete o mesmo quadro.

O que detalhar, campo por campo, de um emissor: taxa, vida, velocidade,
abertura, gravidade, tamanho e cor ao longo da vida, imagem, mistura.

E **nomeie como o mundo já nomeia**: olhe Effekseer, Godot e Unity e use as
palavras deles onde couber. Palavra nova só quando nenhuma das três servir — e
aí diga por quê.

## Parte 3 — a pesquisa de fora

**Esta é a única parte em que `WebSearch` e `WebFetch` estão autorizados.**

O que procurar: ferramentas de animação 2D esquelética modernas · o que os
artistas pedem e não têm · o que apareceu depois de 2024.

| Regra | |
|:---|:---|
| Tudo que vier de fora entra **citado, com a fonte** | link, e o que é |
| Opinião de fórum entra **marcada como opinião** | nunca como fato |

## Uma ideia dele, para entrar na lista

**Grade em perspectiva.** Palavras dele: *"se o jogo for top-down seria
interessante ter uma grade em perspectiva, em vez de uma quadrada — o usuário
poderia alinhar."*

Nenhum dos três programas tem isso. Veja como editores de **tilemap isométrico**
resolvem, e desenhe o gesto: como se define o ângulo da grade, e como se alinha
o personagem a ela.

## Três decisões de hoje que mudam o que vale propor

| # | Decisão | Consequência |
|:---:|:---|:---|
| 1 | **O rabo nasce na hora**, como no Spriter: o esqueleto é remontado na virada | A ideia de "união de ossos escondidos" morreu. Não proponha nada que dependa dela |
| 2 | **Não há projeto antigo no mundo**: ele mandou ignorar compatibilidade | O formato pode ser desenhado certo, sem remendo. Proponha o certo, não o compatível |
| 3 | **A convenção de nomes de osso é nossa**, e nós publicamos | Dá para propor nome e regra sem pedir licença a ninguém |
