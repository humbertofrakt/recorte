# O confronto dos dois runtimes — partículas — 18/09/2026

Feito pelo **PLANEJADOR · dd3937**, lendo os dois arquivos de Desvios lado a
lado. Os dois runtimes foram escritos **ao mesmo tempo, cada um cego para o
outro**, só pela spec `formato/extensions/BONE_particles.md`.

| Fonte | |
|:---|:---|
| TypeScript | `documentos/planos/DESVIOS P2 - runtime TypeScript 2026-09-18.md` |
| Python | `documentos/planos/DESVIOS P3 - runtime Python 2026-09-18.md` |

**Os oito casos passam nos dois.** Isso é bom e não basta: as divergências
abaixo **não são exercitadas por nenhum caso** — por isso os dois podem passar
e ainda assim desenhar coisas diferentes na mão de quem usar.

---

## 1. Onde os dois leram igual — a spec bastou

Cinco pontos. **Nenhum deles precisa de linha nova**: dois leitores
independentes chegaram ao mesmo lugar, e está provado em código dos dois lados.

| # | O ponto | A leitura que os dois tiveram |
|:---:|:---|:---|
| 1 | **`startDelay` com `prewarm`** | O `startDelay` **desloca a origem** da emissão; o `prewarm` estende para trás **a partir dessa origem**, não a partir do zero absoluto. É a única leitura em que as duas frases da spec valem ao mesmo tempo |
| 2 | **A escala do osso no `scale` do dump** | A escala do eixo X da matriz — `sqrt(a² + c²)` de um lado, `hypot(a, c)` do outro: **a mesma conta, escrita duas vezes** |
| 3 | **A ordem da lista do dump** | Da **frente para o fundo**; `oldestInFront` é a mesma ordem lida do outro lado, e o corte continua sendo as `maxParticles` **mais novas** |
| 4 | **O instante, nas voltas de trás do laço** | Os dois recusaram o instante negativo: um envolve o `t_i` em `[0, D)` para a pose do osso, o outro lê o `emitting` no instante **local** da volta. Mesma conclusão, por caminhos diferentes |
| 5 | **A régua do `angle` no comparador** | **Diferença absoluta, nunca distância circular** — senão um leitor que reduz a `−180..180` passaria, e o leiame do P-001 manda que ele falhe |

O ponto 5 merece uma ressalva honesta: **eu avisei os dois do risco**, cada um
por sua vez. Então isso não conta como duas leituras independentes — conta como
dois chats seguindo o mesmo aviso meu. O que prende a armadilha de verdade é o
teste que cada um deixou no código, e a linha que agora vai para a §14.1.

---

## 2. Onde discordaram — a spec ganha uma linha

### 2.1 A tolerância do `angle`: `1e−2` contra `1e−3`

| Runtime | Escolheu | Argumento |
|:---|:---:|:---|
| TypeScript | **`1e−2`** | é a da §3.6 para ângulo. *"O que muda não é o tamanho da folga: é a régua"* |
| Python | **`1e−3`** | a de posição, reta e mais apertada. *"Este runtime bate as seis casas exatas, então a folga a mais não compraria nada — e esconderia o erro de 360 graus"* |

**Os dois estão certos no que importa** (nada de distância circular) e cada um
escolheu um número. **Mas cada runtime tem o seu próprio comparador** — o do
TypeScript em `ferramentas/src/conformidade/pose-dump.ts`, o do Python em
`runtime-python/recorte/pose_dump.py`. Dois comparadores com réguas diferentes
querem dizer que **o mesmo caso é medido com folgas diferentes conforme quem
mede**, e a prova deixa de ser uma prova só.

**Decisão do Planejador: a §14.1 fixa o número, e o número é `1e−3`.** Razão: os
dois runtimes batem as seis casas exatas nos oito casos, então a folga maior não
compra nada hoje e só teria serventia para esconder erro amanhã. Onde os dois
podem passar apertado, aperta-se.

### 2.2 `meshMode` `edge` e `triangle`: um implementou, o outro se recusou

A §9.4 diz *"ponto uniforme (canais 3, 4)"* e **não escreve a fórmula**. Há duas
usuais, e elas dão pontos **diferentes** para os mesmos dois `u`.

| Runtime | Conduta |
|:---|:---|
| TypeScript | **Recusou-se a escolher.** Implementou só `meshMode: "vertex"`, que a spec prende. Para `edge` e `triangle`, **não desenha e avisa** que a conta não está fechada na spec |
| Python | **Escolheu**: a fórmula de *dobrar* (se `u3 + u4 > 1`, usa `1 − u3` e `1 − u4`), e escreveu que *"não é mais certa que a outra: é uma escolha, e está escrita para ser confrontada"* |

**Nenhum dos dois errou.** O TypeScript seguiu a regra 21 ao pé da letra — onde
não entende, avisa, não improvisa. O Python não improvisou em silêncio: escreveu
a escolha para ser confrontada, que é exatamente o que este documento está
fazendo. **Quem errou foi a spec**, que ficou calada numa conta que muda o
desenho.

**Decisão do Planejador: a §9.4 escreve a fórmula, e é a de dobrar.** Razão: ela
gasta os dois canais que a §9.4 já nomeia (`3` e `4`) e não chama uma raiz
quadrada que a §9.4 não pede — é a que se encaixa no estilo da própria seção. A
mesma linha diz qual lista de arestas o `edge` usa. **Depois disso os dois
implementam, e um caso novo prende.**

---

## 3. O que o confronto NÃO conseguiu confrontar

Três pontos em que **um levantou e o outro não**. Silêncio não é acordo: quem
não levantou pode ter implementado de um jeito **sem notar que havia dois**.

| # | O ponto | Quem levantou | O que falta saber |
|:---:|:---|:---|:---|
| 1 | **`spherizeDirection` junto com `spread`** — mistura-se o ângulo primeiro e abre-se o leque em volta da base misturada, ou abre-se o leque em volta de `direction` e mistura-se depois? | só o Python | como o TypeScript fez, e se percebeu a escolha |
| 2 | **A rajada volta na volta de trás do laço?** | só o TypeScript | como o Python fez |
| 3 | **Malha com `space: "local"`** — em que referencial entra o vértice deformado | só o Python | não comparável hoje: o TypeScript não implementou malha além de `vertex` |

Com `spherizeDirection: 0` e sem laço — o caso de todos os oito — as leituras
coincidem. **É por isso que nenhum caso os separa, e é por isso que eles são
perigosos:** passam despercebidos até alguém, um dia, usar o campo.

---

## 4. O que fica combinado

| # | O quê | De quem |
|:---:|:---|:---|
| 1 | A §14.1 fixa a tolerância dos campos de `/particles/` em **`1e−3`**, e diz que o comparador **não pode** medir o `angle` por distância circular | a parte do formato |
| 2 | A §9.4 escreve a **fórmula do ponto uniforme** (dobrar) e **qual lista de arestas** o `edge` usa | a parte do formato |
| 3 | Os dois runtimes acertam o comparador para `1e−3` e implementam `edge` e `triangle` depois da linha nova | os dois runtimes |
| 4 | **Casos novos** para prender o que nenhum caso cobre hoje: `startDelay` diferente de zero · rajada com laço · `spherizeDirection` diferente de zero · osso com escala não uniforme · `oldestInFront` · malha `edge` e `triangle` | o Planejador escreve a entrada; os dois runtimes produzem e confrontam |
| 5 | **Os oito casos só saem de `casos-pendentes/` para `casos/`** quando o item 3 estiver feito e o confronto campo a campo não achar diferença | o Planejador |

**A ordem é sempre a mesma, e não se inverte:** a linha entra na **spec**
primeiro, o **runtime** depois, o **caso** prende. Ao contrário, conserta-se o
caso e perde-se a prova — foi assim que se decidiu o C-299 e o C-300.

---

## 4b. O que veio DEPOIS do confronto — e foi ele que fez aparecer

As três divergências da seção 2 e 3 não foram o fim. Escrever as linhas que elas
pediram, e depois escrever os casos que prendem essas linhas, destapou **mais
seis**. Nenhuma aparecia em teste nenhum.

| # | O que estava calado | Quem achou | Como ficou |
|:---:|:---|:---|:---|
| 4 | **A rajada volta nas voltas de trás?** | TypeScript | Volta. Uma rajada é um nascimento |
| 5 | **E se os ciclos dela passarem da duração?** Duas partículas no mesmo instante, índices diferentes | Python, **medindo a consequência da decisão 4** | Corta em `[0, D)`, `D` aberto, com aviso de quantos ficaram de fora |
| 6 | **O `startDelay` vale para a rajada?** A palavra aparecia **uma vez** na spec inteira, em nenhuma fórmula | Python; o chat do formato respondeu pelo documento, não pela pergunta | Vale. As três contas passaram a trazê-lo por extenso |
| 7 | **Em que relógio se lê a timeline de `emitting`?** | chat do formato, ao escrever a 6 | No do **esqueleto**, onde o animador pôs a chave. Régua geral: **o `startDelay` desloca nascimentos, que o programa gera; não desloca chaves, que uma pessoa põe à mão** |
| 8 | **A ORDEM da lista de arestas** — não só o critério | Planejador, ao mandar escrever a linha; o Python achou o defeito no próprio código | Par crescente. Como a escolha é `floor(u12 · M)`, **a ordem É a conta**: a mesma malha escrita noutra sequência escolhia outra aresta, e nada a jusante mostraria |
| 9 | **`oldestInFront` inverte também o desempate?** | chat do formato, ao escrever o caso; deixou o caso com um fluxo só para não depender do que a spec não fechou | Inverte a lista inteira: `oldestInFront = reverse(youngestInFront)` |
| 10 | **Cortar e ordenar: qual vem antes?** | o chat do formato, **ao escrever a linha 9 e conferir a própria calculadora** | Corta primeiro (as `maxParticles` **mais novas**), ordena depois. O `sortMode` decide **de que ponta a lista começa**, nunca **quem fica** |

A décima é a mais reveladora: **quem a errou foi quem escreveu a regra**, na
v17.1, e achava que a seguia. Só escrevê-la **por extenso, como duas etapas em
sequência**, mostrou que não. A regra que fica:

> **Escrever a conta por extenso é o que revela que não se estava fazendo assim.**

E o defeito era **latente**: só aparece com `oldestInFront` **e** um
`maxParticles` apertado juntos — o par que nenhum dos dezesseis casos tem.

---

## 4c. A décima primeira: a spec errou, e a ordem errada foi minha

**O caso P-016 reprovou os DOIS runtimes.** Os dois deram quatro nascimentos; o
caso esperava dez. E os dois estavam certos.

| O que eu mandei | O que saiu |
|:---|:---|
| *"escreva o `startDelay` por extenso nas três expressões"* | `t_cont = startDelay + t_k + τ(i − E_k)`, com a integral correndo desde `0` e o `startDelay` somado **no fim** |

**Somar no fim não é deslocar a origem.** São contas diferentes, e elas só
divergem quando há timeline de `emitting` junto — que é o P-016, o único dos
dezesseis que as separa. A fórmula contradizia, dentro do mesmo documento, o que
a **decisão 1 do confronto** já tinha fixado e que os dois runtimes leram igual:
`E(startDelay) = 0`, a origem deslocada.

A prova de qual estava errada é o que a fórmula produzia: com a chave fechando a
torneira em `0.5`, nasciam partículas em `0.55`, `0.6`, `0.65`, `0.7` e `0.75`
— **instantes em que `emitting` é falso no relógio do esqueleto**, que a §4.1
tinha acabado de nomear como o relógio que vale. O animador fecha em `0.5`, a
chave fica onde ele a pôs, e o efeito continua nascendo até `0.75`.

**A formulação certa:** a origem é `o = startDelay`; a integral corre no relógio
do esqueleto a partir de `o`, com `emitting(t)` lido sem desconto; `E(o) = 0`; e
o nascimento do índice `i` é o instante em que `E(t) = i` — **a inversa da
integral, sem soma aplicada depois**.

**A lição é do Planejador, e vai escrita:** eu mandei *"escreva por extenso"* e
**não disse o que a expressão devia significar**. Uma ordem de forma sem a
semântica junto produz uma frase bem escrita e errada — e ela passou por mim,
por quem a escreveu, e pelos dois runtimes, até um caso separá-la.

**O que isso prova a favor de escrever caso para o que nenhum caso cobre:** sem
o P-016, as três implementações teriam concordado na leitura certa **por acaso**,
e a spec continuaria dizendo outra coisa, esperando o quarto leitor — que não
teria com quem confrontar.

---

## 5. O que este confronto prova sobre o método

A spec da extensão tem **35 KB escritos com cuidado**, revisados por quem a
escreveu, e ainda assim **dois leitores atentos acharam dois buracos e três
pontos cegos**. Não por descuido de ninguém: porque **um texto só mostra onde
está calado quando alguém tenta segui-lo sem poder perguntar**.

É exatamente para isso que este projeto escreve dois runtimes às cegas, e é o
que já tinha custado o C-299 e o C-300. Desta vez os buracos foram achados
**antes** de o programa chegar na mão de alguém.
