# Desvios do `P2` — partículas no runtime TypeScript — 18/09/2026

Escrito pelo `EXECUTANDO · particulas no runtime TS`, degrau 12, rodada R2.

**Este arquivo mora fora do encargo de propósito.** Ordem do `PLANEJADOR ·
dd3937`, 18/09: o `P2` e o `P3` leem o encargo, então uma suposição escrita lá
seria lida pelo outro — e o isolamento que dá sentido aos dois acabaria sem
ninguém perceber. Os Desvios do Python moram no arquivo irmão, e **este chat
não o lê** até o Planejador dizer que o confronto abriu.

Regra que vale em cada linha abaixo: **não adivinhei em silêncio.** Cada leitura
está escrita no código, presa por teste, e listada aqui com o motivo. Onde as
duas leituras baterem, a spec estava clara; onde discordarem, **o caso decide e
a spec ganha uma linha** — nunca se conserta o teste para o código passar.

---

## O que NÃO é desvio: os seis casos de 1ª fase batem campo a campo

Antes da lista, o que não precisou de leitura nenhuma. Seis dos oito casos são
de 1ª fase, e os seis saem **iguais ao `esperado.json`**, campo por campo, na
primeira rodada: P-001, P-003, P-004, P-005, P-007 e P-008. Os cinco números de
referência do hash (§3.2) também. A spec bastou para tudo isso.

---

## 1. `startDelay` com `prewarm` — a spec não diz qual manda

| Item | |
|:---|:---|
| A frase | §9.1: `startDelay` — *"Nascimentos só a partir daqui"*. §6: em `prewarm` *"os índices são negativos e nascem com a taxa da primeira chave"* |
| O choque | Lidas ao pé da letra, as duas se contradizem com `startDelay: 0`: se "só a partir daqui" for um piso absoluto em `t = 0`, **não existe índice negativo** e o `prewarm` do P-004 morre |
| **A minha leitura** | `startDelay` **desloca a origem** da emissão, não põe piso. `E(startDelay) = 0`, o índice `0` nasce ali, e o `prewarm` estende para trás a partir dessa origem |
| Por quê | É a única leitura em que as duas frases valem ao mesmo tempo. Com `startDelay: 0` — o padrão, e o de todos os oito casos — as duas leituras dão o **mesmo** resultado, então **nenhum caso separa as duas** |
| Onde | `runtime/src/particles/emission.ts`, `EmissionCurve.origin` |
| Risco | Baixo e **invisível hoje**: nenhum caso usa `startDelay` diferente de `0`. Se o `P3` tiver lido diferente, aparece só quando alguém escrever o caso |

---

## 2. A ordem da lista do dump: quem está na frente vem primeiro

| Item | |
|:---|:---|
| A frase | §14.1: a lista são *"as vivas, **na ordem de desenho**, já cortada por `maxParticles`"*. §7.1 ordena por `(t_i decrescente, fluxo crescente, índice decrescente)`. §9.9: `sortMode` padrão `youngestInFront` |
| O choque | "Ordem de desenho" costuma querer dizer **do fundo para a frente** (o último desenhado fica por cima). Com `youngestInFront`, isso poria a mais VELHA em primeiro — e os casos põem a mais **nova** em primeiro (P-001 começa no índice 10, P-005 em 11) |
| **A minha leitura** | A lista sai **da frente para o fundo**. Com `youngestInFront` ela é a própria ordem da §7.1; com `oldestInFront` é essa ordem invertida. Quem desenha percorre a lista **ao contrário** |
| Por quê | É o que os casos mostram, e **os casos são o contrato**. A alternativa faria P-001 e P-005 falharem na primeira linha |
| Onde | `runtime/src/particles/emitter.ts`, fim de `computeParticles` |
| Risco | O ramo `youngestInFront` está provado por seis casos. O ramo **`oldestInFront` não tem caso nenhum** — está preso só por teste meu, e é onde as duas leituras podem divergir sem ninguém ver |

---

## 3. `scale` no dump é um número, e a escala do osso é 2D

| Item | |
|:---|:---|
| A frase | §14.1: `scale` — *"O fator, já com a escala do osso (§7.2)"*. §7.2: *"A escala multiplica a escala do osso em `t`"* |
| O choque | O `scale` da partícula é **um** número (§9.6, fator da imagem), e a escala de um osso tem **duas** componentes. A spec não diz qual entra |
| **A minha leitura** | `matrixScaleX` da matriz do osso — a escala do eixo X, `sqrt(a² + c²)` (§3.2 da spec do formato) |
| Por quê | O eixo X é o eixo do osso, e é o que `region.scaleX` já usa como referência na §7.3. Em **todos os oito casos** a escala do osso é `1`, então nenhum caso separa as leituras |
| Onde | `runtime/src/particles/emitter.ts`, `boneScale` |
| Risco | Invisível hoje. Um osso com escala não uniforme separaria as duas na hora |

---

## 4. As rajadas e o laço: a rajada também volta na volta de trás?

| Item | |
|:---|:---|
| A frase | §6: com `looping: true` entram *"os nascimentos da volta atual **e** os das voltas anteriores, deslocados de −D"*. §4.3 descreve a rajada sem falar de volta |
| O choque | "Os nascimentos" inclui a rajada, ou só o fluxo contínuo? |
| **A minha leitura** | Inclui. Uma rajada **é** um nascimento, e tratá-la à parte faria a emenda aparecer justo no efeito que mais se nota — a explosão some ao virar a volta |
| Por quê | Leitura uniforme de "nascimento". O contrário exigiria a spec dizer "só o fluxo 0", e ela não diz |
| Onde | `runtime/src/particles/emission.ts`, o laço `lapsBack` das rajadas |
| Risco | **Nenhum caso cobre isto**: o P-007, o único com rajada, tem `looping: false`. É um candidato forte a caso novo |

---

## 5. `shape: "mesh"` com `meshMode` `edge` ou `triangle`: eu me recuso a adivinhar

| Item | |
|:---|:---|
| A frase | §9.4: *"Triângulo: área acumulada (canal 12) e ponto uniforme (canais 3, 4)"* |
| O buraco | **"Ponto uniforme" de dois `u` não é uma conta só.** As duas usuais — a da raiz (`sqrt(u3)`) e a da dobra (se `u3 + u4 > 1`, reflete) — dão pontos **diferentes** para os mesmos dois `u`. A spec não diz qual. O `meshMode: "edge"` tem o mesmo buraco duas vezes: qual lista de arestas (o campo `edges` da malha, ou o contorno?) e com qual canal se interpola |
| **O que eu fiz** | Implementei só o `meshMode: "vertex"`, que a spec prende (`k = floor(u12 · n)` sobre os vértices deformados em `t_i`). Para `edge` e `triangle` o emissor **não desenha e avisa**, dizendo que a conta ainda não está fechada na spec |
| Por quê | Desenhar um ponto escolhido por uma fórmula que a spec não nomeia é exatamente o C-299 esperando para acontecer, e é o palpite silencioso da regra 21 da casa. Um emissor que some calado engana o usuário; um que avisa diz a verdade |
| Onde | `runtime/src/particles/emitter.ts`, `meshSilence()` e `shapePosition()` |
| **Pedido ao Planejador** | Uma linha na §9.4 dizendo a fórmula do ponto uniforme no triângulo, e qual lista de arestas o `edge` usa. Enquanto não vier, `shape: "mesh"` só serve com `meshMode: "vertex"` |

---

## 6. O comparador do bloco `particles`: o `angle` NÃO leva distância circular

Isto não é leitura da spec: é decisão de ferramenta de aferição, e a fonte é o
leiame do P-001, que diz em letras que *"um leitor que reduza o ângulo a
−180..180 falha o caso"*.

| Item | |
|:---|:---|
| O perigo | O comparador do `pose-dump` já trata `arotation`, `ashearX/Y` e `rotation` por **distância circular** (`angleDistance`). Se o `angle` de partícula caísse nessa mesma regra, `251.145834` e `−108.854166` ficariam a **zero grau** um do outro, e um leitor errado passaria |
| **O que eu fiz** | O `angle` de partícula é comparado por diferença **absoluta**, `\|esperado − obtido\|`, e não pela circular |
| Onde | `ferramentas/src/conformidade/pose-dump.ts`, `compareParticles()` e `ANGLE_FIELDS` |

**São DUAS regras contra DOIS erros diferentes, e eu as tinha juntado numa razão
só. A correção é do chat do formato, e muda o motivo, não a decisão:**

| A regra | Contra qual erro | Por que a outra não pega |
|:---|:---|:---|
| A conta **simples**, nunca a circular | O erro de **360 graus** — o leitor que reduz o ângulo a `−180..180` | Nenhuma tolerância pegaria: 360 graus é **36 mil vezes** maior que `1e-2`. Só a conta circular o esconde, porque para ela 360 graus é zero |
| A tolerância **`1e-3`** | O erro **pequeno e constante** que ninguém procura | A conta simples sozinha aceitaria qualquer coisa dentro da folga |

**A tolerância é `1e-3`, e não a `1e-2` da §3.6 — decisão do Planejador,
18/09.** Eu tinha escolhido `1e-2`, o argumento do outro runtime era melhor, e o
motivo não é o erro de 360: é que **cada runtime tem o seu comparador**, e duas
réguas diferentes querem dizer que o mesmo caso é medido com folgas diferentes
conforme quem mede — a prova deixa de ser uma prova só. Os dois batem as seis
casas exatas nos oito casos, então a folga maior não compra nada hoje e só
serviria para esconder erro amanhã. Trocado, com teste.

**E um guarda a mais, pedido pelo chat do formato:** um teste que afirma que
`'angle'` **não está** em `ANGLE_FIELDS`. A frase na §14.2 é uma frase; o
`ANGLE_FIELDS` é um conjunto de **nomes de campo**, e pôr `angle` nele é o gesto
mais natural do mundo para quem passar por ali daqui a um ano — e é o gesto que
apaga a prova. Com o teste o vermelho aparece no mesmo minuto.

Uma prova frouxa é o terceiro rosto da regra 21: engana **a nós**, não ao
usuário.

---

## 7. O que este lote se recusou a fazer, e é de propósito

| O quê | Por quê |
|:---|:---|
| Taxa em rampa (o ramo `linear` da §4.2) | É **2ª fase**. A conta está escrita inteira na spec para o segundo leitor não inventar a dele; nenhum código a implementa, e uma timeline de `rate` é recusada com aviso |
| Preencher o `esperado.json` do P-002 | A lista vazia é **de propósito**, e há teste meu prendendo essa frase. Um runtime que "passasse" nele inventando a rampa quebrou a regra, não a cumpriu |
| Mover caso de `casos-pendentes/` para `casos/` | Quem move é o Planejador, e só quando os DOIS runtimes passarem e o `npm run conformidade:dois` confrontar campo a campo sem diferença |
| `shape` desconhecida cair para `point` | Mudaria o desenho inteiro sem o usuário ter como notar (§7.4, regra 21) |

---

## 8. O que o confronto com o runtime Python decidiu — 18/09/2026

O confronto está em `documentos/planos/CONFRONTO dos dois runtimes - particulas
2026-09-18.md`. **Os oito casos passam nos dois.** Cinco leituras bateram sem
combinação nenhuma — e essas cinco não precisam de linha na spec, porque dois
leitores cegos um para o outro chegaram ao mesmo lugar.

| # | O ponto | O que ficou |
|:---:|:---|:---|
| 1 | Tolerância do `angle` | **`1e-3`**. Eu tinha `1e-2`; o argumento do outro era melhor. Trocado |
| 2 | `meshMode` `triangle` | **A fórmula de dobrar** (se `u3 + u4 > 1`, usa `1 − u3` e `1 − u4`). Eu me recusei a escolher e avisei; o outro escolheu e escreveu a escolha para ser confrontada. **Nenhum dos dois errou — errou a spec**, que ficou calada numa conta que muda o desenho. Implemento quando a §9.4 sair |
| 3 | `meshMode` `edge` | **As arestas únicas da triangulação**, derivadas de `triangles`, uniformes pelo canal 12, com `u3` ao longo da aresta. **Nunca** o campo `edges` da malha: a §7 diz que ele é opcional, padrão `[]`, e "só editor" — um emissor amarrado a ele não emitiria nada num arquivo normal, e a pessoa não teria como saber por quê |
| 4 | **`spherizeDirection` com `spread`** | **Mistura primeiro, leque em volta da base misturada** — a ordem do outro runtime. Eu fazia ao contrário. Trocado, com teste |
| 5 | A rajada nas voltas de trás | **Inclui**, pelo meu argumento: senão a explosão some ao virar a volta. Mas o outro achou, dentro da minha leitura, um ponto que eu não tinha visto — **ciclos que passam de `D` põem partícula em cima da volta atual**, mesmo `t_i`, índice diferente. A volta leva só os ciclos em `[0, D)`, e avisa quantos ficaram de fora. Implemento quando a linha sair |

### O achado do ponto 4, que é o que importa nele

Eu abria o leque em volta de `direction` e misturava depois. Isso **encolhe o
`spread` por `(1 − spherize)`** sem ninguém pedir: com `spherize: 1` o leque
fecha de vez e toda partícula sai exatamente para fora. `spread` é
**meia-abertura** (§9.3), e meia-abertura se mede em volta da direção que vale —
um campo não pode mudar o tamanho de outro em silêncio. Chegaria na mão de quem
usa como *"o leque some quando eu aumento o spherize"*, e ninguém acharia a
causa sem medir.

**Eu não tinha notado que havia duas ordens.** Li *"mistura de ângulos pelo
caminho curto"* e apliquei a mistura no único ângulo que tinha na mão naquele
ponto do código. Quem viu foi o outro runtime — e é para isso que os dois foram
escritos sem se olhar.

### Duas correções minhas, registradas porque o motivo importa

1. **A tolerância nunca escondeu o erro de 360.** Eu e o Planejador tínhamos
   juntado as duas regras numa razão só. São duas regras contra dois erros
   diferentes; está separado na §6 acima.
2. **Onde o meu argumento perdeu, perdeu pelo argumento.** Troquei de posição
   olhando a razão, não a autoria. Um empate educado não teria dado decisão
   nenhuma ao Planejador.

---

## 9. O que está na fila, esperando a spec — 18/09/2026

O `P2` fechou os quatro lotes e **parou de pé**. Estes três itens não foram
adivinhados: esperam linha escrita na spec da extensão, e o Planejador chama
quando ela sair.

| # | O que implementar | Espera |
|:---:|:---|:---|
| 1 | `meshMode: "triangle"` — a fórmula de **dobrar** (`se u3 + u4 > 1`, usa `1 − u3` e `1 − u4`) | §9.4.1 |
| 2 | `meshMode: "edge"` — as **arestas únicas da triangulação**, derivadas de `triangles`, uniformes pelo canal 12, com `u3` ao longo da aresta escolhida. **NUNCA** o campo `edges` da malha, que o núcleo declara "só editor" | §9.4.1 |
| 3 | O corte dos ciclos de rajada no laço: a volta leva só os ciclos cujo instante cai em `[0, D)`, e **avisa quantos ficaram de fora** | §6 |

Hoje os itens 1 e 2 **não desenham e avisam** (`meshSilence()` em
`runtime/src/particles/emitter.ts`), que é a regra 21 e não um esquecimento.

### A fronteira do item 3, e por que ela merece uma linha própria

`[0, D)` tem o **`D` ABERTO**: um ciclo que caia exatamente em `D` é o primeiro
da volta **seguinte**, não o último desta. Um `<=` no lugar de um `<` põe duas
partículas no mesmo instante com índices diferentes, que é exatamente o defeito
que o corte existe para evitar.

**Conferir contra o TEXTO DA SPEC, e não contra a mensagem que trouxe a
decisão.** O runtime Python já está assim e pediu a conferência. Se os dois
discordarem da redação final, **manda a spec**, e o Planejador quer saber.

### E uma coisa que este chat aprendeu no caminho, para quem vier depois

Um teste caiu uma vez na suíte inteira e passou sozinho no minuto seguinte: o
arquivo estava sendo **gravado por outro chat enquanto a suíte o lia**. Não era
tempo, não era o código.

Quer dizer que, **com a casa cheia, qualquer número de fecho pode estar errado —
e para os dois lados**: pode acusar um vermelho que não existe, e pode esconder
um que existe. É a mesma doença da porta fixa do roteiro, numa parte da casa
onde ninguém esperava porta. **Número de fecho se mede com a casa vazia**, e
isso não vale só para o roteiro e a medição.

Antes de dizer de quem é um vermelho, **olhe a data do arquivo** (`ls -l`). Foi
assim que os quatro vermelhos do `editor/` desta rodada ganharam dono em dez
segundos: `actions-table.ts` e `prefs.ts` tinham três minutos de vida.

---

## 10. A fila da seção 9 acabou — v19.1, lote 5

As cinco linhas saíram na v18.8 e este runtime as implementou lendo **o texto
delas**, não a mensagem que as anunciou. Nenhuma discordou da minha leitura.

| § | O que entrou | Vinha da seção |
|:---|:---|:---:|
| 9.4.1 | `meshMode` `edge` e `triangle`, pela fórmula de **dobrar** | 5 |
| 9.4.1 | Arestas **únicas da triangulação**, ordenadas pelo par crescente | 5 |
| 6 | Corte dos ciclos fora de `[0, D)`, `D` **aberto**, com aviso | 9 |
| 4.3 | `startDelay` **toca a rajada**: `t_i = startDelay + time + c·interval` | nova |
| 14.2 | Tolerância `1e-3` para **todo** campo de `/particles/` | 6 |

### A que eu tinha lido errado, e a spec corrigiu

Ao implementar o corte, segui a §4.3 **ao pé da letra** e tirei o `startDelay`
do instante da rajada, porque a fórmula escrita era `time + c·interval`. O
raciocínio era "quando a spec escreve a fórmula, a fórmula é a lei" — e estava
certo como método e errado no resultado: a fórmula é que estava incompleta.

**E é pior do que "uma fórmula incompleta engana quem não sabe".** Eu **tinha** o
`startDelay` na conta da rajada **antes**, e o tirei ao implementar o corte. A
fórmula curta **desfez o acerto de quem já estava certo**: um leitor disciplinado
abandona a leitura boa dele para seguir o texto — que é exatamente o que se pede
a ele, e o que faz dele um bom leitor.

Por isso a forma da expressão importa tanto quanto a decisão, e por isso as três
seções (§4.2, §4.3 e §6) levaram a **mesma expressão por extenso**, com teste
contra a forma curta voltar. Quem vier depois vai copiar o que estiver escrito;
se estiver escrito pela metade, copia a metade — e pode estar copiando por cima
de um acerto seu.

A §4.3 agora escreve `startDelay + time + c·interval` **por extenso**, e diz por
quê: `startDelay` é propriedade do **emissor inteiro**, não de um fluxo; a §9.1
o define como *"nascimentos só a partir daqui"* e a §6 fixou que **rajada é
nascimento**. Ler "nascimento" de um jeito numa seção e de outro noutra seria a
mesma palavra valendo duas coisas no mesmo documento.

O caso que separa as duas leituras: `startDelay 0.3`, rajada em `time 0.8`,
`D = 1`. Com a linha, o instante é `1.1` e o ciclo fica **fora** da volta; sem
ela seria `0.8` e ficaria dentro. Nenhum dos oito casos o separa — todos têm
`startDelay 0`. Há teste prendendo os dois lados.

### A ordem da lista de arestas É a conta — achado do outro runtime

Como a escolha é `floor(u12 · M)`, a **ordem** da lista decide tanto quanto o
critério: a mesma malha escrita com os triângulos noutra sequência escolheria
outra aresta para o mesmo `u12`, e **nada a jusante mostraria**. Defeito
invisível, do tipo que só aparece quando dois arquivos "iguais" desenham
diferente. A §9.4.1 manda ordenar pelo par crescente, e há teste comparando
duas escritas da mesma triangulação.

### O teste do `spherizeDirection` foi conferido ao contrário

O primeiro teste que alguém escreveu para essa ordem **deu verde falso**: a
ordem errada foi modelada de um jeito errado, e o encolhimento não aparecia.

O meu foi provado **virando a ordem no código de propósito**: o teste ficou
vermelho, o código voltou ao certo, e o teste voltou ao verde. **Um teste que
nunca se viu falhar não é um teste** — é uma frase que se espera que seja
verdade.

### A segunda causa de intermitência, medida outra vez

Na conferência deste lote a suíte deu **nove** vermelhos numa rodada e **dois**
na seguinte, sem nada mudar do meu lado: `menus.ts` estava sendo gravado por
outro chat no minuto da primeira. É a mesma doença da seção 9, e agora está
medida duas vezes.

**Antes de dizer de quem é um vermelho, rode de novo e olhe a data do arquivo.**

---

## 11. O limite do método, dito no dia em que ele falhou comigo

Esta rodada inteira correu sobre um gesto: **antes de provar que consertou,
prove que o defeito existia.** Virei o código de propósito três vezes para ver o
teste ficar vermelho no ponto certo.

No P-016 esse gesto não me salvou, e o limite dele é este:

> **Um teste provado ao contrário prova que ele pega a coisa que ele olha. Não
> prova que está olhando para o lugar certo.**

A mutação que fiz no teste da nona frase trocava o **relógio da timeline** — e
esse eu já tinha certo. Ela não tocava no **deslocamento do nascimento**, que é
onde a divergência morava. O teste ficou vermelho, verde, e continuou cego para
o ponto ao lado.

**O que fecha esse buraco não é mais mutação: é o caso de conformidade.** Foi o
P-016 que apontou para o lugar que nenhum teste meu olhava — e foi por isso que
ele existiu.

### E a acusação que eu fiz cedo demais

Ao ver o P-016 falhar, li a §4.2 (`t_cont = startDelay + t_k + τ(i − E_k)`),
vi que a minha conta não era aquela, e **me dei por errado na hora**. O
Planejador decidiu ao contrário: a fórmula é que estava errada, e o meu número —
quatro nascimentos em `0.3`, `0.35`, `0.40`, `0.45` — é o certo.

O argumento decisivo estava à minha frente e eu não o usei. Sob a fórmula de
somar no fim, uma partícula nasce em `0.75` com `emitting(0.75)` **falso** — e a
§4.1 diz, normativa, `taxa_efetiva(t) = 0` quando `emitting(t)` é falso, lido
**no relógio do esqueleto, sem desconto nenhum**. A fórmula contradizia a linha
normativa da própria seção acima dela. Isso é conferível, e eu tinha as duas
frases em mãos.

**O que me desviou foi um argumento que eu mesmo inventei e não conferi:** achei
"visivelmente absurdo" que com `startDelay 0.6` e a torneira fechando em `0.5`
não saísse nada. Não é absurdo — é a resposta honesta: o emissor só liga depois
de a torneira fechar. Tratei "surpreendente" como "absurdo", e usei isso para
duvidar do meu próprio código em vez de duvidar da fórmula.

**A lição não é "não se acuse".** É: quando uma fórmula da spec discorda do seu
código, confira a fórmula contra **as outras frases da mesma spec** antes de
concluir de quem é o erro. Duas seções em contradição são um defeito da spec, e
é exatamente o que os três leitores independentes existem para achar.

