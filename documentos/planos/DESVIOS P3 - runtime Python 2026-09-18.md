# Desvios do `P3` — partículas no runtime Python — 18/09/2026

Escrito pelo chat `EXECUTANDO · particulas no runtime Python` (ref `1a0b5d`),
degrau 12, rodada R2, parte `P3`.

**Este arquivo existe por ordem do `PLANEJADOR · dd3937`, de 18/09/2026**, e o
motivo é a prova: a ficha do `P2` manda ler o encargo, então uma suposição minha
escrita lá seria lida por ele e o isolamento dos dois runtimes acabaria sem
ninguém perceber. Os Desvios do `P2` ficam em arquivo próprio, e **eu não os
leio** até o Planejador dizer que o confronto abriu.

**O que foi escrito, e como.** Só pela spec da extensão
`formato/extensions/BONE_particles.md`, o schema dela, a §2.5/§2.7/§12.8 da
`ESPECIFICACAO 2026-09-17.md` e os oito casos de `conformidade/casos-pendentes/`.
**Nenhuma linha de `runtime/src/` foi aberta**, nem para conferir, nem quando
travou. É esse isolamento que prova que a spec basta — foi assim que nasceram o
C-299 e o C-300.

| Lote | Versão | O quê |
|:---:|:---|:---|
| 1 | **v17.7** | o acaso (PCG de 32 bits) e o nascimento (taxa, rajada, pré-aquecimento, laço) |
| 2 | **v17.8** | a conta fechada da posição, as seis formas, os dois espaços, os campos lidos no nascimento |
| 3 | **v18.2** | o teto de vivas, a ordem de desenho e o bloco `particles` do `pose-dump` |
| 4 | **v18.6** | o confronto: a rajada volta nas voltas de trás, com o corte `[0, D)` e o aviso; o canal de tolerância próprio de `/particles/` |
| 5 | **v19.0** | as linhas novas da spec (v18.8): `meshMode` `edge` e `triangle` pela §9.4.1, e a conferência da §9.3.1, da §6 e da §14.2 |
| — | **v19.9** | os casos P-009 a P-016: 15 de 16, e os dois vermelhos levantados sem conserto |
| 6 | **v20.0** | **a emissão por trechos da §4.2** — um defeito meu, achado depois de dois confrontos me darem razão |
| 7 | **v20.2** | o guarda dos casos conta nas duas pastas e pula com frase escrita; os 17 casos entraram em `casos/` |

---

## O que a spec fechou em 18/09 (v18.8), e o que ficou do meu lado

Depois do confronto, a spec ganhou quatro linhas normativas. **Conferi as quatro
contra o código, uma a uma:**

| Linha nova | O meu código | Resultado |
|:---|:---|:---|
| **§9.4.1** `meshMode`, as contas por extenso | fórmula de **dobrar** e área acumulada: iguais. **A lista de arestas estava em ordem de descoberta**, e a §9.4.1 manda **ordenada pelo par `(a, b)` crescente** | **corrigido**, e é diferença de verdade: a ordem é o que o `floor(u12 · M)` indexa, então a mesma triangulação escrita noutra ordem escolhia outra aresta, **e nada a jusante mostraria isso**. Dois testes prendem |
| **§9.3.1** mistura primeiro, leque depois | já era assim | teste novo que mede o efeito colateral que a ordem contrária teria (o leque encolhendo por `1 − spherizeDirection`) |
| **§6** a rajada na volta, corte `0 <= instante < D` | já era assim, com o `D` aberto | conferido no texto; nada a mudar |
| **§14.2** `1e−3` reto em todo campo de `/particles/` | já era assim, com canal próprio | nada a mudar |

**As leituras 2, 3, 5 e 6 abaixo deixaram de ser minhas e viraram spec.** Ficam
escritas para o histórico: elas mostram onde o texto estava calado, e o que
custou descobrir.

---

## O atalho que estava certo quando foi tomado — o defeito da §4.2

**Achado por mim em 18/09/2026, depois de o P-016 me dar razão contra a spec.**
Não foi caso nenhum que o pegou: nenhum dos dezesseis o exercita.

| | |
|:---|:---|
| **O que eu escrevi** | `t_i = startDelay + i / rate` para todo `i`, e depois jogar fora quem cai onde `emitting` é falso |
| **O que a §4.2 manda** | o nascimento de `i` é o instante em que `E(t) = i` — a **inversa da integral**. Um trecho de taxa efetiva zero tem área zero e **não consome índice**: a numeração retoma inteira no trecho seguinte |
| **Quando as duas concordam** | enquanto a torneira só **fecha**. É o caso dos dezesseis |
| **Quando divergem** | quando ela **religa**. Com `rate 20`, ligado em `[0, 0.5)`, desligado em `[0.5, 0.8)`, ligado de novo: o meu dava índices `0..9` e depois `16..20`; a §4.2 dá `0..9` e depois `10..14`, seguidos |

**E o que importa não é a contagem: é a identidade.** A partícula que nasce em
`0.80` é o índice `10` pela spec e era o `16` no meu código. Índice diferente é
`hash` diferente — logo vida, velocidade, ângulo e cor diferentes. **A mesma
partícula com dois nomes desenha duas coisas**, e um caso que só contasse quantas
vivas há pegaria isso por acaso ou não pegaria.

**Por que o atalho passou por mim.** Ele estava **certo quando foi tomado**: na
1ª fase a taxa é constante, então `t_i = i/rate` é a inversa da integral. Ficou
errado quando o `emitting` entrou e a taxa efetiva passou a ter degraus — e eu
não voltei a olhar, porque um atalho que nunca falhou não é um lugar onde se vai
procurar. É a mesma forma do erro do Planejador no mesmo dia: **os dois somamos
em vez de integrar.**

**Virou o caso P-017**, com esse rig. A spec estava certa e escrita desde sempre;
quem estava errado era eu.

Quatro testes prendem, em `TestATorneiraQueReliga`, e mais três em
`TestAOrigemDaIntegral` — inclusive o que a §4.2 escreve por extenso: com
`startDelay 0.6` e a chave fechando em `0.5`, **não nasce nada**.

---

## A oitava, achada ao ler a §6 nova: `startDelay` vale para a rajada? — DECIDIDA

**Levantada em 18/09/2026, ao conferir o corte `[0, D)` contra o meu código, e
decidida no mesmo dia pelo `PLANEJADOR · dd3937`: o `startDelay` TOCA a rajada,
e o código já estava certo — nada mudou.**

As razões da decisão, e nenhuma delas é "quem escreveu primeiro": o confronto já
tinha fixado que o `startDelay` desloca a **origem** da emissão (é o que fez as
duas frases do `prewarm` valerem juntas), e o que desloca a origem do emissor
desloca tudo o que o emissor emite; e a §6 acabara de fixar que "nascimentos"
**inclui a rajada** — ler "nascimento" de um jeito numa seção e de outro na §9.1
seria a mesma palavra valendo duas coisas no mesmo documento.

A §4.3 passa a escrever `t_i = startDelay + time + c·interval` por extenso, e a
§6 usa **a mesma expressão** no corte, exatamente porque duas frases diferentes
para a mesma conta é o que quase me fez implementar as duas.

**O que estava em jogo, guardado:**

| | |
|:---|:---|
| **As frases** | §4.3: `t_i = time + c·interval` — **sem** `startDelay`. §9.1, `startDelay`: "Nascimentos só a partir daqui", sem dizer de qual fluxo. E a §6 nova escreve o corte como `0 <= time + c·interval < D`, também sem `startDelay` |
| **O choque** | o `startDelay` desloca a rajada, ou só o fluxo contínuo? E, se desloca, o corte da volta mede o instante deslocado ou o cru? |
| **O que o meu código faz** | desloca (`instante = startDelay + time + c·interval`) **e** corta no instante deslocado |
| **Por quê** | a §9.1 diz "nascimentos", sem qualificar, e é a mesma leitura uniforme de "nascimento" que decidiu a rajada no laço. O bloco de código da §4.3 omite o `startDelay` do mesmo jeito que o da §4.2 o omite para o fluxo contínuo, onde ele **vale** |
| **Onde separa** | `startDelay 0.3`, rajada em `time 0.8`, `D = 1`: pelo meu código o instante é `1.1` e o ciclo fica **fora** da volta; pela letra da §6 nova é `0.8` e fica **dentro** |
| **Risco** | nenhum caso separa: os oito têm `startDelay: 0` |

---

## Seis frases que a spec não fechava (quatro já viraram linha)

Nenhuma delas é exercitada por caso nenhum. **Não adivinhei em silêncio:** a
leitura está escrita no código com o motivo, num teste, e aqui. Se o `P2` ler
diferente, **o caso decide e a spec ganha uma linha** — nunca se conserta o
teste para o código passar.

### 1. `prewarm` com `startDelay` diferente de zero

| | |
|:---|:---|
| **As duas frases** | §6: sem laço, os nascimentos são os de `[−prewarm, t]`. §9.1: `startDelay` — "nascimentos só a partir daqui" |
| **Onde se cruzam** | com `startDelay: 0` — o caso P-004 — as duas dizem a mesma coisa. Com atraso, a primeira deixa nascer antes do `startDelay` e a segunda proíbe |
| **A leitura** | `prewarm` conta a partir do começo do **próprio emissor**, que é o `startDelay`: a janela é `[startDelay − prewarm, t]` |
| **Por quê** | é a única que deixa as duas frases verdadeiras ao mesmo tempo, e não mexe em nada do P-004 |
| **Onde está** | `runtime-python/recorte/particles.py`, `continuous_births()`; teste `test_prewarm_conta_a_partir_do_start_delay` |

### 2. Malha: como o canal 12 escolhe vértice e aresta

| | |
|:---|:---|
| **A frase** | §9.4, `meshMode`: "Vértices deformados em `t_i` (pose + deform). **Triângulo:** área acumulada (canal 12) e ponto uniforme (canais 3, 4)" |
| **O que falta** | a frase fecha só o triângulo. Para `vertex` e `edge` não diz como o canal 12 escolhe |
| **A leitura** | uniforme sobre a lista — um vértice entre os `n`, ou uma aresta entre as únicas dos triângulos —, e no `edge` o `u3` interpola ao longo da aresta escolhida |
| **Por quê** | a §9.4 nomeia a área acumulada **só** para o triângulo; a assimetria só faz sentido se as outras duas forem uniformes |
| **Onde está** | `ponto_da_malha()` |

### 3. O ponto uniforme dentro do triângulo

| | |
|:---|:---|
| **A frase** | §9.4: "ponto uniforme (canais 3, 4)" — e mais nada |
| **O que falta** | a fórmula. Há duas usuais, e elas dão **pontos diferentes** para os mesmos `u3` e `u4`: dobrar (se `u3 + u4 > 1`, usa `1 − u3` e `1 − u4`) e a da raiz quadrada (`s = 1 − sqrt(u3)`) |
| **A leitura** | dobrar |
| **Por quê** | gasta os dois canais como a spec diz e não chama uma raiz que a §9.4 não pede. Não é mais certa que a outra: é uma escolha, e está escrita para ser confrontada |
| **Onde está** | `ponto_da_malha()` |

### 4. Malha com `space: "local"`

| | |
|:---|:---|
| **O buraco** | os vértices deformados saem no espaço do **esqueleto** em `t_i` (§9.4 manda deformá-los em `t_i`). Em `local`, o desenho multiplica `p(a)` pela matriz do osso em `t` (§7.2). A spec não diz em que referencial o `p0` da malha entra |
| **A leitura** | trago o ponto de volta ao referencial do osso em `t_i` (a inversa de `M(t_i)`) antes de usá-lo como `p0`. Em `world` uso o vértice como está |
| **Por quê** | é a única que faz as duas regras conviverem sem aplicar uma matriz duas vezes |
| **Onde está** | `vivas()`, `_para_o_osso()` |

### 5. `spherizeDirection` junto com `spread`

| | |
|:---|:---|
| **As duas frases** | §9.3, `spread`: `θ = direction + spread·(2·u2 − 1)`, com a palavra `direction`. §9.3, `spherizeDirection`: "`0` usa `direction`; `1` sai para fora do centro da forma. Mistura de ângulos pelo caminho curto" |
| **O que falta** | a ordem. Misturar primeiro e abrir o leque em volta da base misturada, ou abrir o leque em volta de `direction` e misturar o resultado |
| **A leitura** | misturo `direction` com o ângulo de saída primeiro, pelo caminho curto, e aplico o `spread` em volta da base misturada |
| **Por quê** | `spread` é **meia-abertura**, e meia-abertura se mede em volta da direção que vale. Com `spherize: 0` — o caso dos oito — as duas leituras coincidem |
| **Onde está** | `avaliar()`, `mistura_de_angulos()` |

### 6. `emitting` nas voltas de trás

| | |
|:---|:---|
| **A frase** | §6: a volta anterior é a mesma lista com `t_i` deslocado de `−D`, e o acaso **não** inclui o número da volta |
| **O que falta** | em que instante se lê o `emitting` da volta de trás: no deslocado (negativo) ou no local |
| **A leitura** | no instante **local** da volta, o não deslocado |
| **Por quê** | a volta anterior é uma repetição da mesma volta. Ler no instante negativo congelaria toda volta passada na primeira chave da timeline (§9.10), e o efeito mudaria de cara conforme a volta — que é justamente o que a §6 evita |
| **Onde está** | `continuous_births()` |

---

## Duas leituras menores, pela mesma regra

| O quê | A leitura | Por quê |
|:---|:---|:---|
| §7.2, "a rotação do osso" e "a escala do osso" | a rotação e a escala **de mundo** da matriz: `atan2(c, a)` e `hypot(a, c)` | é o que se soma a um ângulo desenhado no espaço do esqueleto. Nos oito casos o osso é identidade ou gira 90°, e as duas leituras possíveis coincidem |
| §9.9, `sortMode: "oldestInFront"` | a **mesma** ordem da §7.1, lida do outro lado (a lista invertida) | "in front" diz de que ponta a lista começa, não uma ordem nova. O corte continua sendo o da §7.1: as `maxParticles` **mais novas**, sempre |

---

## A régua do canal `particles`: DUAS regras, contra DOIS erros

**Correção de premissa, 18/09/2026, vinda do chat do formato pelo Planejador.**
A primeira versão deste arquivo juntava as duas numa frase só, como se a
tolerância apertada protegesse do erro de 360. **Não protege, e a junção estava
errada:** 360 graus é dezenas de milhares de vezes maior que qualquer folga
razoável — nenhuma tolerância jamais escondeu esse erro. São duas regras
distintas, contra dois erros distintos, e cada uma tem o seu teste.

| A regra | Contra qual erro | Por que a outra não serve |
|:---|:---|:---|
| **Diferença reta**, nunca a distância circular | o erro de **360**: o leitor que reduz o ângulo para `−180..180`, que o leiame do P-001 manda falhar | a distância circular dá `0` para `251.145834` contra `−108.854166`. É a **conta** que esconde, não a folga |
| **`1e−3`**, mais apertada que os `1e−2` da §3.6 | o erro **pequeno e constante**, o que ninguém vai procurar | a diferença reta sozinha aceitaria uma deriva de `9e−3` para sempre |

**Decisão do Planejador, 18/09/2026, depois do confronto:** a §14.1 fixa o
número, e o número é `1e−3` — os dois runtimes batem as seis casas exatas, então
a folga maior não compra nada hoje e só teria serventia para esconder erro
amanhã. O comparador do TypeScript, que tinha escolhido `1e−2`, é que muda.

**E o canal de partícula é PRÓPRIO, não emprestado.** Ele pegava emprestada a
tolerância de `position`, e `position` é uma das três que a física afrouxa para
`1e−2` (`PHYSICS_TOLERANCES`). Um caso de partícula com `physicsDt` teria sido
medido com `1e−2` **sem ninguém pedir**. Régua que se mexe por causa de um campo
que não tem nada a ver é a mesma família do verde que não foi medido. Agora há a
chave `"particle": 1e−3`, fora do afrouxamento da física, e um teste que prova
que ela não se mexe quando as réguas da física entram.

Três testes prendem isso:
`test_o_angulo_dobrado_falha` · `test_o_erro_pequeno_e_constante_falha` ·
`test_a_regua_de_particula_nao_afrouxa_com_a_de_fisica`.

---

## A sétima, que eu NÃO levantei: a rajada no laço

**Achada pelo `P2`, não por mim, e o meu código estava do lado errado.** Fica
escrita aqui porque um ponto cego vale mais registrado do que um acerto.

| | |
|:---|:---|
| **A frase** | §6: com `looping: true` entram "os nascimentos da volta atual **e** os das voltas anteriores, deslocados de `−D`". A §4.3 descreve a rajada sem falar de volta |
| **O que eu fiz** | nada: `burst_births(emitter, t)` não recebia `duration` nem `loop`. **Eu não decidi — não vi que havia escolha**, e a assinatura da própria função entregava isso |
| **O que isso produzia** | com uma rajada em `0.1`, vida `2` e `D = 1`: 4 vivas em `t = 0.5`, **zero** em `t = 0.05` e **zero** em `t = 1.05`. A explosão aparecia, sumia ao virar a volta e reaparecia — a emenda que a §6 existe para tirar, no efeito em que ela mais se nota |
| **A decisão** | do Planejador, pela leitura do `P2`: a rajada **volta** também. Uma rajada é um nascimento, e a §6 diz "os nascimentos", não "os do fluxo 0" |

**E um segundo buraco, dentro da leitura nova, que eu achei ao implementá-la.**
A §6 diz quantos nascimentos tem uma volta **para o fluxo contínuo**
(`0 <= i < E(D)`); a rajada não tem esse corte escrito, e os ciclos dela podem
passar de `D`. Com `time 0.1`, `cycles 5`, `interval 0.5` e `D = 1`, os ciclos
caem em `0.1, 0.6, 1.1, 1.6, 2.1` — três fora da volta. A volta de trás,
deslocada de `−1`, põe o ciclo de `1.1` **exatamente em cima** do de `0.1`:
mesmo `t_i`, índice diferente, duas partículas onde o autor pediu uma.

**Decisão do Planejador: a volta leva só os ciclos cujo instante cai em
`[0, D)`, e o emissor AVISA quantos ficaram de fora.** É a regra do fluxo
contínuo aplicada palavra por palavra; o aviso responde à objeção de que o corte
descartaria em silêncio um ciclo que alguém escreveu. **Fora do laço nada muda:
todos os ciclos continuam valendo — é o laço que corta.**

Implementado com essa decisão **antes de a linha cair na spec**: conferi o
arquivo `formato/extensions/BONE_particles.md` e as §4.3 e §6 ainda não a traziam
quando escrevi. A decisão estava escrita e sem ambiguidade, e a ordem de fazer
foi do Planejador. **Quando a linha chegar, o texto dela manda:** se disser
outra coisa, o código muda, não o contrário.

Seis testes prendem tudo isto, em `TestARajadaNoLaco`.

---

## Onde o programa avisa em vez de improvisar (regra 21)

| Situação | O que faz |
|:---|:---|
| `shape` desconhecida | **não desenha o emissor** e avisa (§7.4). É a única que não cai para um padrão |
| `space`, `sortMode`, `frameMode`, `meshMode` desconhecidos | caem para o padrão declarado **e avisam** |
| `rate` com chaves | a timeline é **recusada** com aviso: é o ramo `linear` da §4.2, de **2ª fase**. Desenhar uma taxa que nunca mudou seria um verde falso |
| `prewarm` com `looping: true` | avisa que foi ignorado (§6) |
| ciclo de rajada fora de `[0, D)` no laço | avisa `BURST_OUT_OF_LAP` e diz **quantos**. O corte evita a partícula dobrada; o aviso evita o descarte calado |
| `space: "world"` ou `shape: "mesh"` sem a pose do nascimento à mão | **não desenha** e avisa (`PARTICLE_NO_POSE`). Usar a matriz de `t` é o erro de 90° que o P-006 caça |
| `mesh` que não aponta para uma malha do mesmo slot | avisa `REF_PARTICLE_MESH` e não desenha |
| mais vivas que `maxParticles` | avisa quantas ficaram de fora (`PARTICLE_CUT`), como a §7.1 pede |

---

## Os três programas de referência (regra 9)

Não há gesto novo nesta parte: é um **leitor**, sem uma tela. E os três
programas da régua da casa — Spriter, Spine e DragonBones — **não têm emissor de
partículas como anexo de osso**, então nenhum deles serve de modelo aqui. A
própria spec já registra quem foi olhado e por quê, e a comparação é com outra
família: a §1 contra Godot e Unity (que **simulam para frente**, e por isso
arrastar o cursor para trás não devolve o quadro), a §7.1 contra o bloqueio de
nascimento dos dois, a §7.2 contra o *"Only on create"* do Effekseer, e a §12
contra a lista inteira do que fica de fora. Não refiz essa pesquisa: ela é a
fonte desta parte, e refazê-la seria trocar a spec por um palpite meu.

---

## Uma correção de leitura, minha, no meio do caminho

O primeiro teste que escrevi para a conta fechada dizia que somar por passos daria
um ponto diferente de fazer a conta de uma vez. **Estava errado, e o teste pegou:**
a conta fechada da §8 compõe consigo mesma, então nove passos dela dão o mesmo
ponto que um passo só — e é exatamente por isso que o P-008 pode exigir o quadro
igual bit a bit. O que depende do ritmo de quadro é a **integração de Euler**
(`p += v·dt`), que é o que a §3.4 proíbe. O teste foi reescrito para medir as
duas coisas separadas, e as duas estão medidas:

| Teste | O que prova |
|:---|:---|
| `test_a_soma_de_passos_depende_do_ritmo_de_quadro` | Euler a 30 e a 60 quadros por segundo dá pontos diferentes, e nenhum deles é o certo |
| `test_a_conta_fechada_e_a_mesma_por_qualquer_caminho` | a conta da §8 dá o mesmo ponto por qualquer caminho |

---

## O que NÃO foi feito, e por quê

| O quê | Por quê |
|:---|:---|
| O ramo `linear` da integral da taxa (§4.2) e o caso **P-002** | é **2ª fase**. O `esperado.json` do P-002 tem lista vazia de propósito, e na 1ª fase a timeline de `rate` é recusada com aviso — então `rate` fica no número do anexo, que é `0`, e ninguém nasce. O caso passa pelo motivo certo, e há um teste que diz qual é |
| Mover casos de `casos-pendentes/` para `casos/` | quem move é o **Planejador**, e só quando os dois runtimes passarem e o confronto campo a campo não achar diferença |
| `npm run roteiro` e `npm run medir` | portas fixas, com outro chat no editor. O "PODE" é do Planejador |
| `npx vitest run` | o `vitest.config.ts` varre `runtime/`, `editor/` e `ferramentas/`, e **não** `runtime-python/`. Nada que eu toquei entra nessa suíte; o 1 vermelho antigo do manual continua sendo dele |
