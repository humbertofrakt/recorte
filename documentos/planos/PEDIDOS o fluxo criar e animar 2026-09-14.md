# Pedidos do Humberto — o fluxo criar e animar — 14/09/2026

Anotado da conversa com o Diretor. **Ainda não é plano. Nada foi feito.**

Semana de 14/09: **terminar o que já existe no programa.** Este é o primeiro
pedido da semana.

## As palavras dele

> *"a animação vai mudando durante o processo, o personagem também. O personagem
> está segurando uma arma, ele guarda nas costas: a arma vai mudar de ordem de
> desenho e de parentesco de osso. O personagem não fica para sempre na pose
> inicial — por isso modo montagem como é hoje não faz sentido."*

> *"poderia fazer sentido em separar ferramentas: tipo, só estou construindo, por
> isso não preciso ver o menu de animação e a timeline; e quando tiver animando
> poderia reduzir as ferramentas de construção. Seria mais um modo de
> ORGANIZAÇÃO, pois você sempre pode animar e montar. E montar não iria para uma
> tela separada como é hoje: ela seria o modo montar, mas na mesma animação que
> você está."*

## A régua

**O modo é arrumação da tela. Não é estado do documento.**

| | Hoje | O pedido |
|:---|:---|:---|
| O que o modo muda | o documento: Montagem escreve a pose de repouso, Animando grava chave | **a tela**: quais ferramentas e painéis estão à vista |
| Onde você está | Montagem fecha a animação e o tempo some | **sempre dentro da animação aberta**, no tempo em que você estava |
| Montar | uma tela separada | a **mesma** animação, com as ferramentas de construção à mão |
| Animar | outra tela | a mesma cena, com a linha do tempo à mão |

## O caso que decide tudo: a arma

O personagem segura a arma; no meio da animação guarda nas costas. Mudam duas
coisas ao mesmo tempo:

| O que muda | Formato `.bone` | Runtime | Conformidade | Editor |
|:---|:---:|:---:|:---:|:---:|
| **Parentesco** (a arma passa da mão para as costas) | §9.4, chave `parent`, "semântica do Spriter" | `animation.ts:174`, `bone.parent` | **C-281-trocar-de-pai** | **não existe** |
| **Ordem de desenho** | chave `drawOrder` | sim | sim | sim, lote 66 |

**O arquivo já sabe. O runtime já sabe. Só a tela recusa.** Hoje o editor
responde *"estrutura muda na Montagem, e voltei para ela"*
(`doc/reparent.ts:370`) e te tira de onde você estava.

## O que hoje te empurra para fora, um a um

| Onde | O que faz hoje |
|:---|:---|
| `ui/action-bar-model.ts:36` | o interruptor `Montagem \| Animando`, duas metades numa peça |
| `doc/reparent.ts:370, 432, 458` | trocar pai em Animando **volta** para Montagem |
| `mesh/mesh-doc.ts:242, 269` | malha e pesos: *"Volte à Montagem (Ctrl+Tab)"* |
| `panels/mesh-panel.ts:274` | a ferramenta Malha **nem existe** em Animando |
| `panels/dopesheet-player.ts:522` | em Montagem o tocador inteiro apaga |
| `panels/dopesheet-player.ts:535` | em Montagem os dois botões de Chavear ficam cinza |
| `anim/transport.ts:49, 450` | `animation = null` é "voltar à Montagem": o tempo deixa de existir |
| `anim/pose-mode.ts` | `doc.animation === null` é a chave de tudo: é o modo morando no documento |

## O que o Spriter faz (a fonte)

`documentos/pesquisa/nova pesquisa/spriter/`, capítulos 2 a 8 do manual oficial:

| | |
|:---|:---|
| Modo | **não existe.** O projeto novo já abre dentro de uma animação |
| Pôr sprite na cena | arrastar do file palette **para dentro da animação** |
| Criar osso | Alt + arrastar, dentro da animação |
| Editar fora de um quadro-chave | **cria** o quadro-chave |
| Proteger a pose | `Key all` × `Key selected`, dois botões no alto da linha do tempo |
| Hierarquia | mora na linha do tempo — por isso trocar de pai no meio é natural lá |

## O que NÃO muda

| | Por quê |
|:---|:---|
| A pose de repouso continua no `.bone` | malha, pesos, IK e o runtime todo dependem dela. Ela é o esqueleto em descanso, não uma "tela" |
| A hierarquia do arquivo continua uma só | no Spriter ela é por animação; no `.bone` é uma, e a chave `parent` troca por cima dela. Já está escrito assim na spec, e o C-281 já cobra |
| Nenhum campo novo no núcleo | tudo o que a arma precisa já está no formato |

## As perguntas abertas (para o Humberto)

| # | Pergunta |
|:---|:---|
| 1 | Montar e Animar viram dois **botões de arrumação da tela** (como o menu Janela), ou some tudo e a tela é uma só? |
| 2 | Em Montar, a linha do tempo some da tela ou só recolhe? |
| 3 | Em Animar, quais ferramentas de construção saem da barra? (criar osso? criar ponto? criar caixa?) |
| 4 | Trocar de pai em Animando: grava chave `parent` **sempre**, ou pergunta "só aqui, ou no arquivo todo?" |

## Os lotes, quando virar plano

| # | Lote |
|:---|:---|
| 1 | **A chave `parent` no editor.** Trocar pai em Animando grava chave em vez de expulsar. O formato e o runtime já esperam por ela |
| 2 | **Malha e pesos deixam de expulsar.** A ferramenta fica na mão; o que ela escreve continua indo para a forma de repouso, e isso se diz na tela |
| 3 | **O modo vira arrumação.** `doc.animation` deixa de ser o interruptor: Montar e Animar passam a escolher painéis e ferramentas, dentro da mesma animação |
| 4 | **O tocador nunca apaga.** Tempo sempre existe, porque sempre há uma animação aberta |

## Desvios

(a preencher pelo executor)

---

## As respostas dele — 14/09/2026

As quatro perguntas do fim da seção anterior foram feitas a ele. As respostas,
com as palavras dele:

| # | Pergunta | Resposta |
|:---:|:---|:---|
| 1 | Dois botões de arrumação, ou uma tela só? | *"no Spriter é uma tela só; me parece que uma tela só é melhor, mas eu me pergunto se dá para aproveitar"* |
| 2 | Em Montar, a linha do tempo some ou recolhe? | *"atualmente o modo montar parece desnecessário. Eu queria poder aproveitar, mas parece desnecessário"* |
| 3 | Quais ferramentas saem da barra em Animar? | *"pois é, eu não pensei direito"* |
| 4 | Trocar de pai: chave sempre, ou pergunta? | (não respondida — continua aberta) |

E o pedido que fechou o assunto:

> *"devia poder colocar novas imagens e criar, trocar de pai durante a animação,
> como no Spriter. Lá tudo isso é muito fluido."*

> *"minha visão atual é que vai virar um modo só, mas a ideia é muito boa para
> ser jogada fora."*

## A decisão, e onde ela está escrita

Ele pediu uma avaliação da necessidade do modo Montar. Ela está em
**`AVALIACAO o modo montar e preciso 2026-09-14.md`**, na mesma pasta.

O que ela conclui:

| | |
|:---|:---|
| O modo Montar como **lugar** | sai. Não guarda nada que Animando não possa guardar |
| A ideia como **arrumação da tela** | fica: Construir e Animar viram dois arranjos no menu Janela |
| Por que o Spriter pode ter uma tela só | lá não existe malha nem pesos. Tudo é animável, e não sobra nada para um segundo lugar |
| As duas únicas coisas com cuidado real | a forma da malha e os pesos — e a saída é a **ferramenta** mostrar a forma de repouso, não um modo |
| O custo | `doc.animation === null` está em **124 lugares, 39 arquivos**, e 8 de teste |
| A ordem | esvaziar antes de tirar: lotes 1, 2, 3 e só então o 4 |

**A pergunta 4 continua aberta** e é a única que falta para o plano poder ser
escrito.
