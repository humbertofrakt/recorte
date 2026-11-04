# Rodada 22 — a pesquisa dos leitores: Godot e Construct

Ficha escrita pelo `DIRETOR · ed2cab` em 05/10/2026.
**Esta rodada não escreve código, não abre o programa e não roda testes.** Só lê, pesquisa na internet e propõe.
(Outra rodada está usando a máquina.)

---

## Para quê

O Humberto decidiu a entrega: *"bota para Construct e Godot."*

O jogo vai ler o arquivo `.bone` pelo **nosso leitor** dentro de cada engine (rodadas 18 e 19). Antes de construir, precisamos saber **como se faz um leitor em cada uma**, e quanto custa.

O que o leitor tem de fazer está decidido (`02 AS DECISOES do projeto 2026-10-04.md`, inteiro; e o fim do `03`):

| O quê | |
|:---|:---|
| Tocar o boneco | ossos, imagens, malha com pesos, ordem de desenho, as animações |
| **Conexão** | uma imagem (ou slot) **recebe uma entidade**; o jogo escolhe qual, e escolhe a animação dela, ou a deixa solta |
| **Skin** | vestir, empilhar; a de cima vence; a skin pode esconder imagem e ter ossos |
| **Partículas** | o nosso leitor **desenha** as partículas, pela conta do formato (função pura do tempo). Régua: barato nas duas engines |
| O programa não limita o que entra num slot | **o limite é do jogo**: o leitor tem de dar ao jogo o jeito de dizer |

Já existem dois leitores de referência: `runtime/` (TypeScript) e `runtime-python/`. E 90 casos de conformidade em `conformidade/` que qualquer leitor roda para provar que lê certo.

---

## O que pesquisar

| # | O quê | Onde |
|:---:|:---|:---|
| 1 | **Godot 4**: as maneiras de fazer um leitor — um addon em GDScript · um addon em C# · uma GDExtension (C++/Rust) · importar e **converter** para nós nativos (`Skeleton2D`, `Bone2D`, `Polygon2D` com pesos, `AnimationPlayer`). O que cada uma aguenta, e o que **perde** | a documentação oficial do Godot, com link |
| 2 | Como o **Spine** e o **DragonBones** fizeram os leitores deles para o Godot (o spine-godot é um módulo/GDExtension; por quê?) | os repositórios e a documentação oficiais, com link |
| 3 | **Construct 3**: como se faz um plugin (o Addon SDK, v2), o que um plugin pode desenhar (quads, malha com `IWorldInstance`/mesh, WebGL direto?), limites de desempenho, e se um plugin pode **carregar um arquivo do projeto** | o manual do Addon SDK, com link. **O site do Construct pede verificação de robô**: a rodada 14 só conseguiu ler por trechos da busca. Se travar, **diga o que não conseguiu ler**; o Humberto pode colar a página, como fez ontem |
| 4 | Como o **Spine** fez o plugin dele para o Construct 3 (existe um, da comunidade/oficial?) e como o **Spriter** fez (o Spriter tem plugin oficial para o Construct: o `.scml`/`.scon` entra como objeto) | com link |
| 5 | O Humberto usa o **Construct 3 LTS r449** (há uma skill dele para isso). Confira o que vale para essa versão | |
| 6 | O nosso `runtime/` é **TypeScript**. O Construct roda JavaScript: dá para o plugin **reaproveitar o `runtime/` inteiro**? O que precisaria mudar | `runtime/src/` (só ler) |
| 7 | Quanto dos **90 casos** dá para rodar dentro de cada engine, e como | `conformidade/README`, `como-provar` |

**Leia a fonte; não responda de memória.** Onde não achou, escreva "não achei".

---

## O que entregar

`documentos/projeto do programa/08 OS LEITORES - Godot e Construct <data do relógio>.md`, com:

| # | Parte |
|:---:|:---|
| 1 | **Godot: as opções, lado a lado**, numa tabela: o que aguenta (malha, conexão, skin, partícula) · o que perde · quanto trabalho · como o jogo usa (o que o Humberto digitaria para trocar a espada pela motosserra) |
| 2 | **Construct: as opções, lado a lado**, igual |
| 3 | **A sua recomendação para cada engine**, com o porquê em três linhas, e **por qual engine começar** |
| 4 | **A API do jogo**, igual nas duas, em palavras do Humberto: *encaixar · desencaixar · escolher a animação da peça · vestir skin · tirar skin · tocar animação*. Um exemplo curto de cada, na língua de cada engine (eventos do Construct; GDScript) |
| 5 | **Em quantas rodadas pequenas** cada leitor se parte, e a ordem (ex.: 1, ossos e imagens · 2, animações · 3, malha · 4, skin · 5, conexão · 6, partículas) |
| 6 | **O que no formato atrapalha um leitor**, se alguma coisa. A rodada 3 achou uma: malha com **pesos** numa skin exportada, onde duas regras da spec brigam (§2.8 e o `binding.bones`). Diga como cada leitor a resolveria, e proponha a frase da spec |
| 7 | "Perguntas para o Humberto": no máximo cinco, cada uma com a sua suposição. **Se o Spriter ou uma decisão já gravada responde, não pergunte** |
| 8 | Frases curtas, tabelas alinhadas. Ele é disléxico |

No `03`: uma linha em "O que cada rodada entregou". Avise o `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes).

## O que NÃO fazer

| | |
|:---|:---|
| Não escreva código, nem abra o programa, nem rode testes | outra rodada usa a máquina |
| Não decida pelo Humberto | proponha |
| Não pergunte nada ao Humberto | dúvida vem para mim. **Mensagem minha só chega quando o seu turno para** |
