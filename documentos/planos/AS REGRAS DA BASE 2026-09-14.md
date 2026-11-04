# As regras da base — 14/09/2026

Ditadas pelo Humberto em 14/09/2026. **Isto não é plano: é o modelo.** Nada
foi feito. Nenhuma linha de código, nenhum campo de formato.

---

## 1. As regras, com as palavras dele

> O programa começa pela base. A pessoa monta o personagem uma vez, e isso é a
> base — ossos, imagens, pose de repouso, malhas.
>
> Toda animação escolhe uma base. Ao ser criada, ela herda essa base num quadro
> invisível antes do zero. Do zero em diante, o que a animação fizer é dela.
>
> O que a animação não disser continua vindo da base. Mudou a base depois, todas
> as animações que a usam herdam a mudança, exceto onde já tinham chave própria.
>
> Bases novas podem nascer de dentro da animação. Você edita o personagem no
> meio da linha do tempo — troca imagens, muda ossos, acrescenta malha — e salva
> aquilo como base nova, com nome.
>
> Uma base pode ser colada no meio de uma animação. O personagem se transforma
> em lobisomem ao longo da animação, e no quadro da virada você cola a base
> lobisomem. Dali pra frente, aquela animação usa a base lobisomem.
>
> E a base nova fica disponível como qualquer outra. A próxima animação você cria
> escolhendo a base lobisomem direto, e ela nasce lobisomem.

---

## 2. O que já é isto, e não sabíamos chamar assim

Três coisas que o programa já faz são casos particulares destas regras. Isso é o
sinal de que o modelo está certo: ele **junta** o que hoje está espalhado.

| Hoje | Nas regras da base |
|:---|:---|
| A **pose de repouso** do `.bone` | é a base — só que uma só, sem nome |
| *"o que a animação não disser vem do repouso"* | é a terceira regra, já funcionando: mexer no repouso muda todas as animações, menos onde há chave |
| A chave **`parent`** (§9.4), a arma que vai para as costas | é um pedacinho de "colar base no meio": troca uma parte do rig no meio da animação |
| As **peles** | trocam imagem por slot. A base troca imagem **e osso e malha** |

**A diferença é o número e o nome.** Hoje: uma base, anônima, implícita. As
regras pedem: várias bases, com nome, escolhíveis, colávei no meio.

E a decisão de hoje — *o modo Montar sai como lugar* — continua valendo e fica
melhor: montar é editar a base de dentro da animação, que é exatamente a quarta
regra.

## 3. O que nenhum dos três programas tem

Régua da casa: olhar Spriter, Spine e DragonBones antes.

| Programa | O que tem de mais parecido | O que falta nele |
|:---|:---|:---|
| **Spriter** | *character maps*: pilhas de troca de imagem, e salvar a pilha num `.scms` | troca só imagem. Osso e hierarquia, não |
| **Spine** | *skins*: conjuntos de anexos por slot | idem: anexo, não osso. O esqueleto é um só |
| **DragonBones** | trocar peça e "somar projeto" | idem |

**Nenhum troca o esqueleto no meio da animação.** A chave `parent` do nosso
formato já é mais que os três nisso. As regras da base são um passo além de
todos eles — e é por isso que precisam de spec escrita antes de código.

## 4. As perguntas que o plano não pode contornar

Cada uma muda o desenho. Nenhuma é detalhe.

| # | Pergunta | Por que importa |
|:---:|:---|:---|
| 1 | **O que entra numa base?** Ossos (nome, pai, comprimento, pose de repouso), slots e qual imagem em cada um, malhas, pesos, restrições, pivôs — tudo isso? Ou só uma parte? | é a definição. Sem ela não há campo, nem tela, nem prova |
| 2 | **Osso que existe numa base e não na outra.** O lobisomem tem cauda; o humano não. Colada a base no meio: a cauda nasce ali? E as chaves da cauda antes da virada, se houver? | é o caso mais difícil, e é o coração do lobisomem |
| 3 | **A virada é instantânea ou interpolada?** *"se transforma ao longo da animação"* sugere um caminho; *"no quadro da virada você cola"* sugere um corte | muda o formato: chave stepped como o `parent`, ou dois estados com mistura |
| 4 | **As chaves de antes da virada.** Ficam medidas da base velha? (foi exatamente o defeito que a v12.8 consertou no `parent`) | meia entrega apodrece: melhor decidir agora |
| 5 | **Compatibilidade.** Um leitor que não conhece bases abre o arquivo e vê o quê? | o formato é para virar padrão: não pode quebrar quem já lê |

## 5. O caminho de compatibilidade que eu já vejo — e é bom

Proposta do Diretor, para a spec discutir:

**A base 0 é a pose de repouso de hoje.** O arquivo continua com `bones`,
`slots`, `skins` como estão; as bases seguintes entram numa lista nova,
`bases[]`, cada uma dizendo **só o que difere** da base 0. A animação ganha um
campo `base` (ausente = base 0) e, para o lobisomem, uma timeline `base` —
stepped, como a `parent`.

Assim:

| Quem lê | O que vê |
|:---|:---|
| Leitor de hoje, sem bases | o personagem na base 0, todas as animações rodando. Ignora a lista e a timeline nova, com aviso |
| Leitor novo | o lobisomem inteiro |

É o mesmo caminho que a spec já usou para extensão (§X) e o que fez a chave
`parent` entrar sem quebrar nada.

## 6. O tamanho, dito sem maquiar

| Camada | O que muda |
|:---|:---|
| **Formato** | campo novo no núcleo. **Regra 7: decisão do Humberto** — e ele está decidindo agora, ao ditar estas regras |
| **Runtime** | hoje o esqueleto é montado **uma vez**, ao carregar. Trocar rig no meio da animação (osso que nasce, osso que morre) é a mudança mais funda que este projeto já fez na runtime |
| **Conformidade** | casos novos, e eles são a prova de que outro programa consegue ler |
| **Editor** | a tela de escolher base, salvar base de dentro da animação, colar base no meio |

Não é lote. É **fase** — do tamanho da fase do formato, não do tamanho de um dia.

## 7. O que o Diretor recomenda

| Ordem | O quê |
|:---:|:---|
| 1 | Ele responde as cinco perguntas da seção 4. Sem isso, qualquer código é aposta |
| 2 | **Spec escrita primeiro** — formato, não editor. Uma seção nova na especificação, com o caminho de compatibilidade da seção 5, e **os casos de conformidade antes do código** |
| 3 | Só então runtime, e só então editor |
| 4 | Nada disso entra nesta semana: a semana é de terminar o que já existe. Isto abre a **próxima fase** |

E uma coisa que não muda por causa disto: a lista do Spriter (59 funções, 9
faltas) continua valendo, e as nove faltas são pequenas ao lado desta fase.

---

## 8. Acrescentado por ele, 14/09 — e uma frase que resolve o desenho

> *"o Spriter deixa criar ossos no meio da animação e copiar partes inteiras de
> outras animações, tipo um braço inteiro de outra animação. Atualmente o modo
> animar trava a edição: isso tem que mudar, para deixar o usuário poder
> modificar tudo que ele quiser, pois cada animação tem suas próprias regras. O
> modo montar provavelmente vai deixar de existir, mas vamos criar esse sistema
> de modo base; ele vai ficar junto com a janela Animação. Observe também que
> atualmente não existe somente 1 pose 'padrão', pois cada base é uma pose —
> homem, lobisomem. Eu imagino que na base a barra de timeline vai estar
> aparecendo, mas só vai ter o keyframe 0."*

### A frase que resolve: a base É uma animação com uma chave só

**"Na base a linha do tempo aparece, mas só tem o quadro 0."** Isso desfaz o nó
que sobrou da avaliação do modo Montar: a base não é um lugar, não é um modo, não
é uma tela — é uma **entrada na lista de animações** cujo conteúdo é uma chave
no tempo 0.

Consequências, e todas simplificam:

| | |
|:---|:---|
| Onde a base mora | na **janela Animação**, junto com as animações. Ordem dele |
| O que a tela faz ao abrir uma base | o mesmo de sempre: cena, linha do tempo, um quadro no 0 |
| O que "montar" passa a ser | abrir a base e editar. Nada de modo |
| Quantas poses existem | **uma por base.** Não há "a pose padrão": homem é uma pose, lobisomem é outra |
| O tocador | nunca apaga, porque sempre há algo aberto — a base ou uma animação (isto era o lote 3 do fluxo, e ele morre de graça aqui) |

### O que já está feito, dos pedidos desta mensagem

| O pedido | Estado |
|:---|:---|
| **copiar um braço inteiro de outra animação** | **já funciona**: `pasteHere` aceita outro tempo e outra animação (`panels/dopesheet-edit.ts:612`), entrou na v12.6 |
| criar osso no meio da animação | **já funciona** desde a v12.x (criar osso, ponto, caixa e imagem em Animando) |
| trocar de pai no meio da animação | **já funciona**, v12.6 e v12.8 |
| malha e pesos em Animando | **já funciona**, v12.6 |

### O que AINDA trava, e é o que ele mandou mudar

| Onde | O freio |
|:---|:---|
| `anim/pose-mode.ts` | **"Gravar sozinho" desligado RECUSA a edição** (saída `'bloqueado'`). É o maior freio que sobrou, e já estava anotado como achado do Diretor |
| `ui/action-bar-model.ts` | o interruptor `Montagem \| Animando` ainda existe |
| `doc.animation === null` | 124 lugares, 39 arquivos: é o modo morando no documento |

**A régua dele, textual:** *cada animação tem suas próprias regras* — então a
tela não recusa. Se a pessoa mexe, a animação aberta registra. Onde a mexida não
é animável (malha, peso, osso novo), ela vai para a base daquela animação, e a
tela **diz** onde foi, sem barrar e sem expulsar.

### Pergunta 1 da seção 4: respondida por ele

*"O que entra numa base?"* — **ossos, imagens, pose de repouso, malhas.** As
palavras dele, na primeira regra. Ficam a confirmar: pesos, restrições (IK) e
pivôs, que andam junto com malha e osso.

### As perguntas que continuam abertas

| # | |
|:---:|:---|
| 2 | O lobisomem tem cauda e o humano não. Colada a base no meio, o osso novo nasce ali? E as chaves dele antes da virada? |
| 3 | A virada é corte seco (chave stepped, como a `parent`) ou tem caminho? |
| 4 | As chaves de antes da virada continuam medidas da base velha? (foi o defeito que a v12.8 consertou) |
| 5 | Compatibilidade: leitor que não conhece bases vê o quê? (proposta na seção 5: base 0 = a pose de repouso de hoje) |

---

## 9. A virada, respondida por ele — 14/09

> *"no keyframe passado ele era humano, no seguinte ele é lobisomem."*

**Corte seco entre dois quadros.** Responde as perguntas 3 e 4 de uma vez:

| # | Pergunta | Resposta |
|:---:|:---|:---|
| 3 | a virada é instantânea ou tem caminho? | **instantânea**. Chave stepped, como a `parent` |
| 4 | as chaves de antes ficam medidas da base velha? | **não há conversão a fazer.** O que a animação disse continua dito; o que ela não disse passa a vir da base nova — e é isso que transforma o corpo. Ao contrário da `parent`, aqui o salto **é** o efeito desejado |

### As duas últimas dúvidas do Diretor

**1. Antes da virada, a cauda existe escondida ou não existe?**

| Saída | Como | Custo na runtime |
|:---|:---|:---|
| **Presença** (recomendada) | o arquivo guarda a UNIÃO dos ossos de todas as bases; cada base diz **quem está em cena**. É o que a chave de anexo já faz com imagem | baixo: o esqueleto continua montado uma vez |
| Nascimento | o osso passa a existir na virada | alto: o esqueleto cresceria no meio da animação — a mudança mais funda que a runtime já teria |

Na tela o resultado é idêntico. **Recomendo Presença.**

**2. Compatibilidade — o que um leitor de hoje vê?**

Proposta: vê o **homem**, com todas as animações rodando, e ignora o lobisomem
com aviso (o caminho da seção 5: base 0 = a pose de repouso de hoje). O formato
continua aberto de verdade: quem já implementou não quebra. O preço é que o
lobisomem só aparece em leitor novo. **Decisão dele.**

---

## 10. Corpos e animações — duas listas, uma janela — 15/09/2026

Ele, descrevendo o fogo do mecha:

> *"o fogo entrou no meio da animação, eu escolhi a animação dele 'ligar'. Essa
> animação tem um tamanho e dá para controlar na linha do tempo. Na outra
> animação, 'voando', eu mudei o fogo para a animação 'ligado' — ela é em laço,
> e eu vou juntar no mecha para rodar em laço com o mecha voando. Entenda que eu
> vou esticar para controlar isso."*

### A animação de dentro é uma FAIXA, não uma chave

| O que a pessoa faz | O que é por baixo |
|:---|:---|
| escolhe qual animação do fogo toca | `nested`: qual animação |
| arrasta para escolher quando começa | `origin` |
| **estica a ponta** | `timeScale` |
| troca `ligar` por `ligado` (laço) | outra animação do filho |

Na linha do tempo isso **não pode ser um pontinho**: é uma faixa com
comprimento, como um clipe de vídeo. O formato e a runtime já têm a peça
(`runtime/src/nested.ts`); **falta a faixa na tela.**

### Base NÃO é entidade do Spriter — e é por isso que o lobisomem funciona

Ele: *"estou pensando em entidade do Spriter. Observe que o Spriter começou essa
ideia, mas não foi eficiente em fazer isso. Por isso o nosso não pode se basear
100% no dele."*

| | Spriter (entidade) | Recorte (base) |
|:---|:---|:---|
| O que é | dona das animações dela | **só o corpo**: ossos, imagens, malhas, pose |
| As animações | **presas** dentro da entidade | do lado de fora, e **escolhem** um corpo |
| Transformar no meio | obriga a duplicar a animação noutra entidade | a mesma animação troca de corpo |

**É a separação que dá o lobisomem.** Juntar as duas listas numa só seria virar
entidade, e perder exatamente o caso que ele quer.

### A janela, como ele pediu

```
Janela Animação
├── Corpos      homem · lobisomem · mecha
└── Animações   parado · andar · voando · virar
```

Uma janela, **duas listas**. Escolhe o corpo em cima, a animação embaixo.

### A régua corrigida, e ela vale acima da anterior

Até 14/09 a lei era *"como o Spriter faz é lei"*. Ele afinou em 15/09:

> **O que é lei é a FLUIDEZ do Spriter — não a implementação dele onde ela
> falhou.**

Onde o Spriter é rápido e direto, copiamos o gesto. Onde ele emperrou (a
entidade dona das animações), fazemos melhor e escrevemos por quê.

---

## 11. Trocar de corpo, e a faixa da peça — 15/09/2026

### CORREÇÃO do que o Diretor escreveu na seção 10

A seção 10 diz que as animações ficam soltas e **escolhem** um corpo. Ele
descreveu outra coisa, e a dele é melhor:

> *"para mexer no fogo eu transformo a entidade em uma base. Estou animando um
> mecha — base + animações. Puxei para dentro do programa outros `.bone`:
> espada, fogo, lobisomem. Opa, tem um detalhe desse fogo que eu quero mudar:
> transformo ele em base — logo, na aba animações vai aparecer a base fogo e as
> animações dela em lista, como a do mecha. Um menu parecido com o da entidade
> do Spriter."*

**Cada corpo tem as animações dele.** Trocar o corpo de cima troca a lista de
baixo:

| Corpo escolhido | A lista de animações mostra |
|:---|:---|
| `mecha` | parado · voar |
| `fogo` | ligar · ligado |
| `lobisomem` | as dele |

É o menu de entidade do Spriter — e ele pediu assim, com essas palavras.

**A diferença nossa continua, e não é a lista: é a chave.** No Spriter a
animação nunca sai da entidade dela. Aqui, uma animação do homem pode **colar o
corpo lobisomem no meio** e seguir (seção 9). A transformação não vem de listas
soltas: vem da chave de corpo dentro da animação.

### Promover e rebaixar é trocar de contexto

| Gesto | O que acontece |
|:---|:---|
| Puxar um `.bone` para dentro | entra como **entidade**: peça pendurável |
| **Transformar entidade em base** | a lista de cima passa para ela; as animações dela aparecem embaixo; a cena mostra ela |
| Voltar ao mecha | a lista de baixo volta a ser a do mecha |

É o mesmo arquivo o tempo todo — muda o papel, não a matéria (seção 10).

### A faixa: laço ou tamanho

> *"uma base moto poderia puxar uma entidade pneu, e o pneu já iria vir trazendo
> a animação da roda em loop. Uma animação em loop roda em loop. Uma animação
> sem loop teria um tamanho no timeline, e o usuário poderia esticar ou reduzir
> para funcionar na animação moto dele."*

| A animação da peça | Na linha do tempo |
|:---|:---|
| **em laço** (a roda, o fogo `ligado`) | entra já rodando sozinha, sem fim. Nada a fazer |
| **sem laço** (`ligar`, uma explosão) | **faixa com tamanho**: esticar e encolher para caber |

Esticar é `timeScale`; arrastar é `origin`; qual animação toca é a escolha do
`nested`. **A peça chega com o movimento dela pronto** — é o caso bom do pneu.

Selo de tudo nesta seção: **falta**. Formato e runtime prontos; editor sem porta.

---

## 12. Base × entidade — a definição afiada — 15/09/2026

Ele, e esta é a frase que separa as duas de vez:

> *"importante: entidade tem um sistema de animação na timeline."*

> *"observe que a explosão, ela é uma entidade, não tem a intenção de ser
> animada. Com o lobisomem como entidade, ela já foi animada na animação; eu
> controlo ela, troco as animações da explosão. Observe que no momento em que o
> lobisomem virou uma base, ele veio trazendo as próprias animações, que estão
> na lista de animações, como andar, pular."*

| | **Base** | **Entidade** |
|:---|:---|:---|
| Quem anima | **você, na mão** | **ela mesma** — já vem animada |
| O que você faz | poses, chaves, malha, osso | escolhe **qual** animação dela toca, e controla a faixa |
| Lista de animações | as animações dela aparecem lá | não aparecem: não é o que você está animando |
| Na cena | é o personagem | ocupa um lugar na **ordem de desenho**, como qualquer peça |
| Virar a outra | vira entidade quando alguém a pendura | vira base quando você quer animá-la na mão — **e traz as animações dela junto** |

**A explosão é o exemplo que fecha o conceito:** ninguém anima a explosão. Ela
já foi animada. Põe-se entre o mecha e o lobisomem, por cima dos dois, e
troca-se qual animação dela roda.

### O caso completo do lobisomem, com as palavras dele

> *"peguei a entidade lobisomem e transformei em uma base. Criei uma animação
> 'transformar': ela começa com a base do mecha; na metade ele se abaixa; eu
> colo a base do lobisomem, coloco ele abaixado também; e a outra metade da
> animação é o lobisomem se levantando, fazendo pose de lobisomem. Imagino que o
> programa deveria conseguir saber que, naquela parte pra frente, ele está com
> outra base. Observe: eu animei o lobisomem se levantando na mão, pois é uma
> base. Eu poderia ter colocado uma entidade explosão de 3 ms na timeline, entre
> o mecha e o lobisomem, em cima deles na draw order."*

| Trecho da animação `transformar` | O que está lá |
|:---|:---|
| primeira metade | corpo **mecha**, se abaixando — animado na mão |
| o quadro da virada | cola o corpo **lobisomem**, também abaixado |
| segunda metade | o lobisomem se levantando — animado na mão |
| por cima de tudo | a faixa da **explosão**: entidade, não animada por ele, na ordem de desenho acima dos dois |

**"O programa deveria saber que dali pra frente ele está com outra base"** — é a
chave de corpo. Dali em diante a cena, a Árvore, a lista de ossos, as
propriedades: tudo fala do lobisomem.

### O que isto acrescenta ao desenho

| # | |
|:---:|:---|
| 1 | A entidade ocupa **lugar na ordem de desenho**, e pode estar acima de tudo. Não é só um anexo preso a um osso |
| 2 | Promover entidade → base **traz as animações dela** para a lista (seção 11) |
| 3 | Uma animação pode ter **as duas coisas ao mesmo tempo**: corpos que ela anima e entidades que ela só dirige |

---

## 13. A entidade segue a IMAGEM, não o osso — 15/09/2026

**Correção de uma proposta errada do Diretor.** Eu propus prender a entidade a
um encaixe com nome de osso (`mao_direita`). Ele derrubou em sete palavras:

> *"Guardei a espada nas costas. **Não se guarda a mão direita nas costas.**"*

> *"eu acho que espada deveria pedir espada. Eu tenho o mecha, ele está usando
> uma imagem de espada; a motosserra deveria substituir a imagem de espada. (…)
> As entidades deviam seguir as imagens, como no Spriter."*

| Quem manda | A espada vai para as costas |
|:---|:---|
| Encaixe por osso (proposta do Diretor, **errada**) | a motosserra fica na mão. O elo quebra |
| **Seguir a imagem (a dele)** | a motosserra vai junto. Nada quebra |

### O caso que prova sozinho

> *"O personagem tem 2 espadas, uma azul e uma vermelha. A vermelha foi trocada
> por uma tocha e está na mão do personagem. A azul, trocada por uma motosserra,
> está nas costas. Agora cada uma está em uma mão."*

Duas trocas, três lugares, e **ninguém precisou dizer nada ao programa**: cada
entidade seguiu a sua imagem. Com encaixe por osso, isso exigiria remendo a cada
movimento.

> *"Observe: o lobisomem não tem arma. Peguei a espada do mecha e coloquei na mão
> do lobisomem — agora ele também tem uma motosserra."*

A entidade viaja junto com a imagem, inclusive entre corpos.

### O formato já permite, e o gesto já existe

| | |
|:---|:---|
| Formato | a spec (§2.8, §7.11) já diz que um esqueleto aninhado pode ocupar **qualquer slot**, e não só um slot de arma. **Onde cabe uma imagem, cabe uma entidade** |
| Gesto | **botão direito no desenho** → a grade para trocar, que já existe (v12.x). A grade passa a listar também as entidades |

```
Trocar "espada"
  [espada_azul]  [espada_vermelha]  [tocha]  [motosserra ▸]
```

**Nada de tela nova.** O "controle dos sockets" que ele pediu na mensagem
anterior **deixa de ser necessário**: o controle é a grade que ele já usa.

### O que ainda precisa de nome

Quando o corpo troca (a virada), o programa procura **o slot de mesmo nome** no
corpo novo. Tem `espada` no lobisomem? A entidade vai junto. Não tem? **Avisa** —
regra 21, não inventa.

---

## 14. A peça em laço começa onde foi solta — 15/09/2026

Pergunta do Diretor: a roda do pneu, em laço, começa a girar no quadro em que foi
solta, ou desde o começo da animação?

**Resposta dele: onde ela foi solta.**

Então `origin` é o quadro do gesto, e não o zero da animação de fora. A peça
existe a partir dali; antes disso, não está em cena.

---

## 15. RESPONDIDA: o projeto é a caixa — 15/09/2026

O Diretor perguntou se o arquivo tem um **corpo principal** (dono dos demais,
como hoje) ou se é uma **caixa de corpos iguais**. Ele respondeu, e de um jeito
que corrige o vocabulário de todos nós:

> *"Mecha não é um corpo, é um projeto. (Caixa)"*

```
Projeto: "mecha"
├── Corpos       mecha · lobisomem
├── Entidades    fogo · espada · motosserra
└── Animações    as de cada corpo
```

**Não existe "corpo principal".** O que manda é o **projeto**, e ele é a caixa.
O mecha-corpo é só mais um corpo lá dentro; quem dá nome ao conjunto é o
projeto. **Você abre um projeto, não um personagem.**

| | |
|:---|:---|
| **Salvar** | salva o projeto inteiro, com tudo dentro. Não há como esquecer o fogo ou a espada |
| **Entregar ao jogo** | continua podendo levar **só o corpo** que o jogo precisa |
| **Formato** | a caixa já existe: o pacote guarda vários esqueletos (§2.9). **Não é campo novo** — é usar o que está lá |

Com isto, a pergunta 1 da seção 4 está **fechada**. E ela era a maior: mexia no
núcleo do formato. A resposta gastou zero campo novo.

### O que ainda espera ele

| # | |
|:---:|:---|
| 2 | A cauda do lobisomem antes da virada: presença ou nascimento? |
| 3 | Compatibilidade: o leitor de hoje vê o homem e ignora o lobisomem, com aviso? |
| 4 | Partículas e biblioteca: antes, junto ou depois das bases? |
| 5 | A convenção de nomes de osso é nossa, publicada, ou seguimos uma existente? |

---

## 16. RESPONDIDAS: o rabo nasce, e não há passado a respeitar — 15/09/2026

> *"1 — rabo nasce na hora, como no Spriter. 2 — não tem projetos antigos para
> nós se adequar; podemos ignorar projetos antigos. 4 — nosso: nós que estamos
> criando o projeto."*

| # | Pergunta | Resposta dele | O que muda no desenho |
|:---:|:---|:---|:---|
| 2 | a cauda antes da virada | **NASCIMENTO** — o osso passa a existir na virada, como no Spriter | O esqueleto é **remontado** na virada. A proposta "presença" (união de ossos escondidos) está **descartada** |
| 3 | compatibilidade com leitor de hoje | **ignorar** — não há projeto antigo no mundo | O formato fica **livre**. Some o remendo do "corpo 0" fingindo ser a pose de repouso. O modelo de bases pode ser **nativo** |
| 5 | a convenção de nomes de osso | **nossa** — nós criamos e publicamos | É a peça que faz a biblioteca de animações funcionar (Mixamo) |

**A resposta 3 é a maior das três.** Todo o desenho até aqui foi feito com uma
mão amarrada: "como não quebrar quem já lê". Ninguém lê ainda. O formato pode
ser desenhado certo de primeira, e é exatamente o que ele disse em 14/09 —
*"ninguém está usando o programa"*.

**Consequência do nascimento (resposta 2), dita sem maquiar:** hoje o esqueleto
é montado **uma vez**, ao carregar (`runtime/src`). Osso que nasce no meio da
animação obriga a remontar no corte. É a mudança mais funda que a runtime já
teve — e ele escolheu sabendo, porque é o que o Spriter faz e é o que a cabeça
dele já esperava.

**Nenhuma pergunta da seção 4 continua aberta.** As cinco foram respondidas.

---

## 17. O terceiro tipo de peça: a que ENVOLVE — 15/09/2026

Ele mandou um desenho: um personagem segurando uma placa laranja (a imagem que
vira motosserra), um círculo de energia em volta, e a cena final com a
motosserra na mão e o círculo abraçando o personagem inteiro.

A motosserra já estava resolvida — a entidade **substitui** a imagem (seção 13).
O círculo é outra coisa, e ele explicou como funciona:

> *"imagina que esse círculo é feito de duas partes, uma na frente e uma atrás,
> mas o quadrado laranja fica no meio."*

```
anel — parte de trás
   ↑
   o que ele abraça      ← o quadrado laranja, ou o personagem
   ↓
anel — parte da frente
```

### Os três tipos, agora fechados

| Tipo | O que faz | Exemplo dele |
|:---|:---|:---|
| **substitui** | toma o lugar da imagem | a motosserra no lugar do quadrado laranja |
| **pendura** | entra num osso, como peça nova | o fogo nas costas do mecha |
| **envolve** | nasce em **dois** lugares da ordem de desenho e abraça o que está no meio | o círculo de energia |

**O gesto:** na lista ele vê **um anel**. Ao soltar, nasce em dois — atrás e na
frente — e o que estava ali fica no meio. Move um, move os dois: andam colados.
O mesmo anel abraça o quadrado ou o personagem inteiro; muda só o que está no
vão.

### O que isto exige, e é honesto dizer

| # | |
|:---:|:---|
| 1 | Um anexo vive em **um** slot. "Envolve" é, na prática, **dois slots que nascem juntos e andam juntos** — e isso não existe hoje |
| 2 | O que falta é o **gesto de criar o par**, não o desenho: hoje já dá para pôr duas imagens com o personagem entre elas, uma a uma, na mão |
| 3 | **É o primeiro lugar do programa em que a ordem de desenho deixa de ser uma lista e vira uma pergunta** — *"o que está dentro deste anel?"* |

### Se é entidade ou partícula, e a resposta importa

| Se as bolinhas forem | Então é |
|:---|:---|
| **contadas** — seis, sempre as mesmas, girando juntas | **entidade**: seis pecinhas, animadas uma vez |
| **um jorro** — nascem e morrem, muitas, sem número certo | **partícula**, com emissor e semente |

Pelo desenho parece o primeiro caso. Se for, **este efeito não precisa de
partículas** — precisa da peça que envolve. Cada bolinha sabe em que metade
está pelo ângulo dela, que é conta direta do tempo: sem estado, sem acumular, e
funciona com o cursor andando para trás.

Selo: **falta**, nos três pontos da tabela acima.

---

## 18. O ADAPTADOR — todo corpo tem pino e tomadas — 15/09/2026

**Correção de um erro do Diretor.** Eu havia escrito a regra *"você nunca
transforma o personagem em entidade"*, e inventado que o programa decidiria
sozinho quem recebe quem. **Falso, e ele desfez com uma imagem** — a foto de um
adaptador de tomada (o pino com duas tomadas no corpo):

> *"você não entendeu. O anel, a motosserra e o mecha são a mesma coisa. Eu
> estou animando um piloto; depois estou animando um mecha; eu posso querer que
> o piloto entre dentro do mecha."*

### O modelo, com a imagem dele

**Todo corpo é um adaptador: tem um pino e tem tomadas.**

| | |
|:---|:---|
| **Pino** | ele pode entrar em outro corpo |
| **Tomada** | ele pode receber outro corpo |

Não existe "isto é base, aquilo é entidade" por natureza (seção 12 já dizia
isso; aqui fica completo). Existe **onde você encaixou**.

| Você encaixa | Em quem | E é o mesmo gesto |
|:---|:---|:---|
| a motosserra | na mão do personagem | sim |
| o personagem | no meio do anel | sim |
| **o piloto** | **dentro do mecha** | sim |

**O anel não é caso especial.** É uma tomada que por acaso fica entre duas
partes — e é por isso que o terceiro tipo de peça (seção 17) deixa de existir
como tipo: vira um corpo com uma tomada no meio.

### O que isto desfaz do que estava escrito

| Estava escrito | Passa a ser |
|:---|:---|
| "você nunca transforma o personagem em entidade" | **falso.** O piloto que ele animou vira entidade ao entrar no mecha, e isso é o funcionamento normal |
| "o programa resolve a direção sozinho" | **falso.** **Ele** escolhe onde encaixar. O programa não adivinha |
| três tipos de peça: substitui · pendura · envolve | **um só**: encaixar um corpo numa tomada de outro. O "envolve" é uma tomada entre duas partes |

### O que continua, e agora com o nome certo

- **Em foco** é só onde ele está olhando agora: o corpo que ele anima na mão.
- Um corpo encaixado **continua inteiro**, com as animações dele: lá dentro ele
  é dirigido (escolhe-se qual animação toca), não desenhado. Quer mexer de
  verdade? Põe em foco, anima, volta.
- **Imagem primeiro, movimento depois** (seção 13) continua valendo: a tomada
  nasce como um desenho parado — o quadrado laranja — e depois recebe o corpo.

**Quinta vez em um dia que o modelo encolhe.** Já caíram: a tela de encaixes, o
campo do corpo principal, o modo Montagem, o terceiro tipo de peça, e agora a
regra de direção.

---

## 19. Entidade é um PROJETO FINALIZADO — abrir e fechar — 15/09/2026

As definições, com as palavras dele:

| | |
|:---|:---|
| **Projeto** | pode ter várias bases |
| **Base** | um corpo montado, que serve para animar |
| **Entidade** | **um projeto já finalizado**, que serve de material (asset) para a animação |

> *"Estou com uma entidade (= projeto finalizado): posso abrir no meu projeto
> atual? Sim — ela vai abrir junto com o projeto aberto e vai mostrar as bases e
> as animações dela. Terminei de editar, posso transformar a base novamente em
> entidade (= projeto finalizado)? Sim, ela volta para a aba Entidades, e no
> projeto ela vai ser controlada pelas animações dela, pois uma entidade é um
> projeto finalizado."*

| Gesto | O que acontece |
|:---|:---|
| **Abrir** a entidade dentro do projeto atual | as **bases e as animações dela** aparecem nas listas, e ele edita |
| **Fechar** de volta em entidade | volta para a aba Entidades e passa a ser **dirigida pelas animações dela** |

**Isto é maior do que estava escrito nas seções 10 a 12:** uma entidade não é um
corpo — é um **projeto inteiro**, com as bases e as animações dele. O fogo, o
mecha, o piloto: cada um é um projeto que alguém terminou. Por isso "abrir" e
"fechar" bastam, e não há conversão de dado nenhuma: aberta, vê-se o miolo;
fechada, só se usa.

### A pergunta do original × cópia — RESPONDIDA, e do jeito simples

O Diretor levantou o problema clássico (editar a entidade muda o arquivo
original, e portanto todos os projetos que a usam, ou só a cópia local?). A
resposta dele:

> *"É só perguntar. Vai abrir uma cópia? Vai salvar? Novo / por cima do antigo →
> vai substituir o antigo, tem certeza? É o sistema de todos os programas."*

```
Salvar "fogo"
  ○ Novo        — cria outro fogo, só deste projeto
  ○ Por cima    — substitui o fogo original

  [Por cima] → "Outros projetos usam este fogo. Tem certeza?"
```

**Nada se decide antes; pergunta-se na hora de salvar.** E o aviso do "por cima"
tem de **dizer o que vai acontecer** — quantos projetos usam aquele arquivo, se
der para saber —, não só perguntar: regra 21 da casa.

**Sexta simplificação do dia.** O Diretor tratou como problema de arquitetura o
que é uma caixa de diálogo que todo mundo já sabe usar.

---

## 20. Pendurar é criar uma tomada na hora — 15/09/2026

Ele conferiu o que estava escrito e achou o buraco:

> *"tem um ponto que não sei se você anotou: além do sistema de tomadas, temos o
> pendurado — 'fogo animado' pendurado no mecha."*

Estava certo: o fogo aparece nas seções 8, 10 e 11, mas a **diferença** entre
plugar e pendurar não estava escrita em lugar nenhum.

| | Quando |
|:---|:---|
| **Tomada** | o lugar **já existe** no corpo — a mão do personagem, o meio do anel, a cabine do mecha. Ele troca o que está lá |
| **Pendurar** | **não existe lugar nenhum** ali. Ele solta o fogo nas costas e o lugar **nasce** |

**Pendurar é criar uma tomada nova na hora.** Depois de pendurado, vira tomada
como qualquer outra: troca-se a peça, guarda-se, move-se. A diferença só existe
no momento de pôr.

### E isso casa com "imagem primeiro, movimento depois" (seção 13), pelo outro lado

| | |
|:---|:---|
| Ele **planejou** a peça | montou com uma imagem parada no lugar e depois trocou → **tomada** |
| Ele **não planejou** | soltou onde deu vontade, e o lugar nasceu ali → **pendurar** |

**O segundo é o que faz o programa ser fluido: não é preciso ter previsto tudo
na montagem.** O mecha não precisava ter um lugar de fogo nas costas para
receber fogo nas costas.

É a mesma liberdade que ele pediu para a malha e para o osso — criar no meio da
animação, sem voltar para lugar nenhum.

---

## 21. A entidade é uma IMAGEM COM RELÓGIO — 15/09/2026

> *"a entidade seria como uma 'imagem' — ela poderia estar ligada a um osso, por
> exemplo."*

**Sim, e isto vale como definição.** A entidade é uma imagem com relógio.

Tudo o que o editor já sabe fazer com uma imagem vale para ela:

| | |
|:---|:---|
| Presa a um osso | sim — e anda com ele |
| Na Árvore | aparece embaixo do osso, como os desenhos |
| Na ordem de desenho | é uma linha, como qualquer peça |
| Trocar | botão direito, a mesma grade |
| Aparecer e sumir no meio da animação | igual a uma imagem (chave de anexo) |
| Guardar nas costas, passar de mão | igual (seção 13) |

**A única coisa a mais é o relógio**: ela tem animações próprias, e escolhe-se
qual toca (a faixa, seção 11).

### A regra que isto cria, e ela protege o programa de inchar

**Não existe "sistema de entidades" separado.** Existe a mesma lista, a mesma
grade, o mesmo osso, a mesma ordem de desenho — com uma peça que por acaso se
mexe sozinha.

> **Se para imagem não precisa, para entidade também não.**

Quem propuser painel novo, aba nova ou gesto novo só para entidade tem de
responder primeiro por que a imagem não precisa disso.

O formato já concorda: o anexo de um slot pode ser de oito tipos, e `skeleton` é
um deles, em qualquer slot (§7.11 e a lista de tipos). **Onde cabe uma imagem,
cabe uma entidade.**

### Correção, no mesmo dia: a entidade TEM painel

O Diretor escreveu *"sem caixa nova na sua tela"* e aplicou a regra ao
contrário. Ele corrigiu:

> *"pois é, tem o painel Imagem, como também tem que ter o Entidade."*

**A imagem tem painel** — é de lá que se arrasta. Pela mesma regra, a entidade
precisa do dela.

| Painel | De onde vem |
|:---|:---|
| **Imagens** | as pastas e os desenhos |
| **Entidades** | os projetos finalizados — fogo, motosserra, anel, piloto |

Um do lado do outro, iguais: pastas de um lado, miniaturas do outro.

**MINIATURA PARADA.** O Diretor propôs miniatura mexendo — a hélice girando, a
fumaça fumegando — e ele vetou na hora: *"nada de entidades tocando direto, isso
vai pesar o programa."* Está certo: uma pasta com trinta entidades tocando são
trinta esqueletos calculando a cada quadro, só para enfeitar um painel.

E segue a própria regra: a miniatura da imagem não se mexe, então a da entidade
também não. Para ver a peça mexer, o lugar já existe — a **Prévia** —, e aí é
uma só, quando ele pedir.

**Nome:** o manual tinha escrito "aba Peças". Passa a ser **Entidades** — painel
se chama pelo que guarda, como o Imagens. É a palavra dele.

A regra, dita direito:

> **A entidade tem o que a imagem tem. Nem mais, nem menos.**

| Imagem tem | Entidade tem |
|:---|:---|
| painel de origem | **sim** |
| lugar na Árvore e na Ordem | sim |
| a grade de trocar | sim |
| painel próprio de propriedades | **não** — a imagem também não tem |
