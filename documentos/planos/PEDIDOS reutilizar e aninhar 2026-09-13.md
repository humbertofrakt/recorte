# Pedidos do Humberto — reutilizar e aninhar — 13/09/2026

Anotado na conversa, para virar plano depois. **Ainda não é plano. Nada foi feito.**

## O que ele disse

> "o spriter é muito simples e eficiente, o spine tem algumas ferramentas a
> mais; eu quero juntar os 2. O spriter pode mudar o parentesco no meio da
> animação e a ordem de imagem também; imagino que a malha também poderia ter
> esse tipo de habilidade. Meu foco é um programa rápido e direto, para que ele
> se torne o padrão da indústria. O programa é focado em jogos, por isso quero
> um sistema de fazer uma animação base e poder usar ela em outros personagens,
> e animação aninhada: eu faço uma animação e depois troco a 'espada' do
> personagem por uma 'motoserra' animada."

## Onde cada pedido está hoje

| Pedido | Formato | Runtime | Editor |
|:---|:---:|:---:|:---|
| Trocar de pai no meio da animação | ✅ 9.4, decisão 69 | ✅ C-281, C-282, C-286 | ❌ não há porta nenhuma |
| Ordem de imagem animável | ✅ 9.5 | ✅ | ✅ Ctrl + setas vira chave em Animando |
| Animação base usada em outro personagem | ✅ `rig` 4.8 + `assets.animations` | ✅ | ❌ não há porta nenhuma |
| Animação aninhada (espada → motoserra) | ✅ attachment `skeleton` + `socket` + timeline `nested` | ✅ | ⚠️ abre e desenha o aninhado; não cria, não troca, não anima |
| Malha com troca de pai / de ordem | ver abaixo | — | — |

Os três primeiros são **trabalho de interface**. O formato e o runtime já fazem.

## A malha

Trocar o **osso** da malha no meio da animação já dá: troca-se o pai do osso
(9.4). Mudar os **pesos** no meio da animação seria campo novo no núcleo do
formato — regra 7, decisão do Humberto, e custa em todo runtime que ler o
formato. **Em aberto.**

## Os lotes, quando virar plano

| Lote | O que | Tamanho |
|:---|:---|:---|
| A | Trocar de pai na animação: o gesto na cena e na Árvore, a chave na linha do tempo | 1 lote |
| B | Animação aninhada: pôr esqueleto no slot, escolher a animação dele, animar o tempo | 2 a 3 lotes |
| C | Animação base entre personagens: salvar `.bone` só de animação com o contrato de rig, e aplicar em outro | 2 lotes |

Ele não escolheu a ordem ainda: *"vamos ver outras coisas e depois vamos fazer
um plano"*.

## Acrescentado em 13/09/2026 — a régua, e os dois modos

**A régua de tudo:** *"eu não quero fazer um Spine, eu quero um Spriter com as
ferramentas do Spine."* Primeiro: tudo abre como no Spriter. Depois: as
ferramentas do Spine se encaixam nesse fluxo — nunca o contrário.

**Os dois modos.** Ele perguntou por que existem Montagem e Animando, se o
Spriter tem um modo só. A resposta: o Spriter não tem pose de repouso (o
esqueleto vive dentro das animações); o nosso formato tem (5.1), e o runtime
precisa dela para misturar animações, trocar de pele e para toda propriedade
sem chave. Apagar a pose de repouso não está em questão.

O que está: **parar de barrar.** Hoje ainda exigem Montagem:

| O quê | Onde |
|:---|:---|
| Malha e pesos | `mesh/mesh-doc.ts` (`MESH_BLOCKED_HINT`) |
| Ligar osso à malha | `mesh/mesh-doc.ts` |
| Trocar o pai | `doc/reparent.ts` — este já faz certo: volta sozinho e avisa |

O modelo é o do trocar de pai: o gesto acontece, o editor troca de modo sozinho
e diz o que fez. Nada de recusar o clique. **Em aberto, sem plano.**

## Correção de rumo — 15/09/2026

Palavras dele: *"alguns casos, como o da motosserra, eu não vejo isso sendo
usado na animação — eu vejo isso sendo usado nos jogos."*

Isso muda o TAMANHO do lote B, e para menos. A troca da espada pela motoserra é
**coisa do jogo**, não do editor:

| Onde | O que acontece | Quem faz |
|:---|:---|:---|
| **No jogo** | o jogador troca a arma; a peça nova entra no mesmo encaixe e traz a animação dela | o **runtime**, pelo nome do encaixe. Já pronto: attachment `skeleton` + `socket` + timeline `nested` |
| **No editor** | marcar o ponto de encaixe, e uma prévia para conferir que a peça cabe e fica no lugar certo | o editor, e **só isso** |

**O que sai do lote:** uma interface de animação aninhada dentro do editor —
escolher a animação da peça filha, animar o tempo dela na nossa linha do tempo,
etc. Nada disso é o que ele quer ver; é o jogo que decide.

**O que fica, e é o que importa:** o ponto de encaixe (`point` com `socket`) bem
feito, visível, com nome, e a prévia mostrando a peça encaixada. Mais a
documentação de como o jogo troca a peça pelo nome.

**ATENÇÃO AO TAMANHO DISSO.** Ele disse *"em ALGUNS casos"*, e corrigiu quando
eu transformei a frase em régua geral. Não é regra: é uma **pergunta a fazer
caso a caso** — *este* caso é do jogo, e há outros que não são.

A interface de animação aninhada **não morreu**; ela deixou de ser justificada
pelo caso da motoserra. Quando aparecer um caso que só o editor resolve — uma
peça filha que precisa ser animada JUNTO com o pai, na mesma linha do tempo, e
conferida na tela —, ela volta à mesa com esse caso na mão.

O que ele recusou foi o argumento, não a função: a motoserra não prova que
precisamos da interface, porque a motoserra é o jogo trocando a peça.
