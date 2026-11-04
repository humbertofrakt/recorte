# 07 · Efeitos e partículas

Fontes: `documentos/planos/COMO SE FAZ EFEITO 2026-09-16.md` (**EFEITO**) · `O QUE AINDA NAO TEMOS 2026-09-16.md`, Parte 2 (**PART**, o campo a campo) · `IDEIAS NOVAS - particulas e biblioteca 2026-09-15.md` (**IDEIAS**).
EFEITO é o porquê e o gesto; PART é o campo a campo. Não se contradizem.

## O pedido dele

| O quê | Fonte |
|:---|:---|
| *"eu estava pensando em sistema de partícula"*. **Nenhum dos três programas tem**: mandam evento e o jogo solta a partícula | IDEIAS §1 |
| *"o que você acha do Mixamo?"* — daí a **biblioteca de animações** que cai em qualquer personagem, e o **auto-rig por nome de peça** | IDEIAS §2 |
| A convenção de nomes de osso é **nossa e publicada** (respondido) | `AS REGRAS DA BASE` §16 |
| 🗣️ **Partícula é para ter no programa.** Ordem de produção: **primeiro bases e peles, depois partículas** | RESPOSTAS lote 2, Q15 |

## A regra que decide tudo

| O quê | Fonte |
|:---|:---|
| **Partícula é função pura do tempo**: nasce em instante calculado, acaso de uma semente fixa, posição é conta da idade. Arrastar para trás mostra o mesmo quadro | IDEIAS §1 · PART §1 · arquivo `01` R1 |
| O buraco que ninguém ocupa: **o efeito que o animador afina na mesma linha do tempo do boneco, e que qualquer runtime toca igual, para frente e para trás** | EFEITO §3 |
| Fica fora: colisão, fluido, partícula empurrando partícula, turbulência integrada, força que depende da posição. Saída honesta: **assar em folha** | EFEITO §4 · PART §3 |
| **Aviso:** a `physics` de hoje guarda estado. Não serve de modelo para partícula | EFEITO §4 |
| **Ordem: depois das bases**, por dependência — partícula é anexo dentro do molde que as bases mudam | IDEIAS §1 |

## O emissor (proposta com recomendação, esperando ele)

| O quê | Fonte |
|:---|:---|
| Anexo novo `particle` num slot, preso ao osso; extensão `BONE_particles` antes do núcleo | PART §0, §4 |
| Acaso `hash(semente, fluxo, i, canal)`, PCG 32 bits inteiro; taxa animada por integral exata; limite de vivas = as mais novas | PART §1 |
| Campos: emissão, vida, velocidade e abertura, forma, gravidade e arrasto, rotação, tamanho, cor e alfa, imagem/folha, espaço, semente, pré-aquecimento, laço, ordem | PART §2 (12 tabelas) |
| **Semente:** uma por emissor · duplicar dá semente nova (o defeito do Unity) · "manter a semente" é gesto próprio · filho = `hash(semente do filho, i do pai)` | EFEITO §4 · `OS ERROS QUE NAO VAMOS REPETIR` §9 |
| Semente entra na spec **com exemplo e caso de conformidade** (lição da documentação errada do Godot) | `OS ERROS` §9 |
| Sub-emissor e rastro cabem sem estado, numa segunda fase | PART §7 |

## A 1ª fase, fechada pelo Planejador (17/09, delegado: "o mais simples")

| Escolha | Fica para a 2ª fase |
|:---|:---|
| Extensão `BONE_particles`, antes do núcleo | entrar no núcleo |
| Taxa **só liga/desliga** | taxa animada por integral |
| Limite de vivas = as mais novas | — |
| Mistura só pelo slot | — |
| Gravidade padrão zero | — |
| Uma semente por emissor; duplicar dá semente nova | "manter a semente" como gesto |
| — | sub-emissor, rastro, ruído |
| **Nenhum campo de efeito novo** (grupo como imagem, mais misturas, ordem em pasta, UV, dissolve, distorção) | todos, no glacê |

Fonte: `12`, Q16 e Q26. Pode ser revisto quando mostrado a ele.

## Efeito sem partícula — o que já dá, em ordem de custo

| # | Ideia | Custo | Fonte |
|:---:|:---|:---|:---|
| 1 | **Folha animada entra arrastando** (pasta numerada ou Aseprite → `sequence`) | só porta (formato §7.10) | EFEITO §6 |
| 2 | **Flash** e **pulso** (escala + alfa + aditivo) como gesto que grava chaves | só porta | EFEITO §6 |
| 3 | **Efeito como arquivo próprio, encaixado no boneco** (esqueleto aninhado §7.11) | só porta | EFEITO §6 · pedido antigo "animação dentro de animação" (Spine nunca fez) |
| 4 | **Tremor com semente** que vira chaves comuns | só editor | EFEITO §6 |
| 5 | Emissor sem estado | campo novo — ver `10` | EFEITO §6 |
| 6 | UV que corre · dissolve · distorção | campo novo + shader; aviso onde o runtime não tiver | EFEITO §5–6 |
| — | Tremor de câmera | **do jogo** (evento avisa) | EFEITO §2 |

## A biblioteca (proposta do Diretor, sem aval)

| O quê | Fonte |
|:---|:---|
| Sair com **andar, correr, parado, pular** prontos, caindo em qualquer personagem com a convenção de nomes (`assets.animations` §2.8, especificado, sem porta) | IDEIAS §2 |
| Auto-rig: soltar a pasta, o programa reconhece `braco_esq`, `perna_dir` e monta o esqueleto | IDEIAS §2 |
| Liga ao pedido dele "levar a animação para outro personagem" — 🗣️ **definir agora**, encaixando nas peles (`02` E18) | IDEIAS §2 · RESPOSTAS Q14 |

## Perguntas deste assunto

Nenhuma aberta. Respondidas: Q12 (sequência como opção), Q15 (depois de bases e peles). Fechadas pelo Planejador: Q16, Q26 (tabela acima).
