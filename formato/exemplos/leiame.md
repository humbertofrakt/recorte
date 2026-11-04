# Arquivos de exemplo

Estes arquivos acompanham a especificação do formato `.bone`.

Servem para três coisas:

1. Mostrar o formato funcionando de verdade, e não só descrito.
2. Dar um caso concreto para quem está escrevendo um leitor novo.
3. Servir de teste: o projeto carrega estes arquivos do disco nos testes.

---

## Os arquivos

| Arquivo | O que é |
|:---|:---|
| `minimo.bone` | O menor arquivo válido possível. |
| `heroi.bone` | O personagem completo. Exercita quase tudo do formato. |
| `heroi.atlas.json` | O atlas do herói: onde cada imagem está na página. |
| `manifest.json` | O manifesto de um pacote `.bonez`, tirado do `heroi.bonez`. |
| `heroi.png` | A página de imagens do atlas. |
| `heroi.psd` | **A arte solta**, em camadas, uma por desenho, com as pastas dos slots virando grupos, e **os ossos desenhados** por cima, no grupo `ossos` (lote 45). É o arquivo que o passo 1 do manual abre. Gerado do `heroi.bone` por `node ferramentas/montar-psd.mjs --ossos --saida formato/exemplos/heroi.psd`. |
| `espada.bone` | A **entidade**: um segundo esqueleto, usado **dentro** do herói e do mecha. Sem socket. |
| `mecha.bone` | O corpo que pendura a espada **pela imagem** e puxa animações e pele de fora. |
| `mecha-animacoes.bone` | Um arquivo **só de animações**, com contrato de rig. |
| `mecha-pele-inverno.bone` | Uma **pele que vem de fora**, com contrato de rig. Troca a cabeça do mecha por um esqueleto. |
| `capacete.bone` | Um **capacete** com esqueleto e animações próprias. Entra no slot `head`. Não é arma. |
| `../rigs/lobisomem-rabo.bone` | Uma **pele de fora que traz osso**: o rabo do lobisomem, para qualquer corpo do rig `humanoide-v1`. |
| `../rigs/humanoide-v1.bone` | **A convenção de nomes** do projeto: um corpo sem arte, com os ossos, os comprimentos e as tomadas reservadas. |
| `heroi-idle.png` | Quadro pronto da animação `idle`. |
| `heroi-walk-025.png` | Quadro pronto da animação `walk`, em 0,25 s. |
| `heroi-walk-050.png` | Quadro pronto da animação `walk`, em 0,5 s. |
| `heroi-attack.png` | Quadro pronto da animação `attack`. |
| `heroi-attack-aninhado.png` | O mesmo golpe, com a espada aninhada desenhada. |

Os PNG de quadro são gerados por `ferramentas/render-png.mjs`. Não são fonte:
são resultado.

---

## `minimo.bone`

O menor arquivo que um leitor tem que aceitar. 407 bytes.

| Tem | Não tem |
|:---|:---|
| O cabeçalho `bone` com a versão | Animação |
| Um osso, `root` | Regra |
| Um slot, `corpo` | Malha |
| A pele `default` com um anexo de imagem | Atlas |

### Para que serve

É o primeiro teste de qualquer leitor novo.

Se ele abre este arquivo e desenha um retângulo, o esqueleto do seu carregador
está de pé.

Também prova a regra dos valores padrão: quase nenhum campo está escrito, e o
leitor tem que preencher todos com os padrões da especificação.

---

## `heroi.bone`

O personagem completo. É o exemplo principal.

| Número | Quanto |
|:---|---:|
| Ossos | 18 |
| Slots | 23 |
| Peles | 3 |
| Regras | 5 |
| Animações | 3 |
| Eventos | 2 |

### O que ele exercita, item por item

| Recurso do formato | Onde está no arquivo |
|:---|:---|
| Hierarquia de ossos | `root` → `hips` → `torso` → `head`, `arm`, `leg` |
| Herança desligável | nos ossos da capa e do cabelo |
| Ordem de desenho | 23 slots, do braço de trás ao braço da frente |
| Anexo de imagem | 19 anexos do tipo `region` |
| Malha com pesos | `face`, no slot `head`, com 4 vértices em 2 ossos |
| Malha ligada | `face` da pele `armadura`, que reusa a malha da pele `default` |
| Caixa de colisão | `hitbox`, um polígono de 4 pontos |
| Máscara de recorte | `mask`, que recorta até o slot `head` |
| Ponto | `hand_point`, para o jogo saber onde a mão está |
| Caminho | `cape_path`, com 3 âncoras |
| Sequência de imagens | slot `hand`, com os quadros `hand_01`, `hand_02`, `hand_03` |
| Esqueleto dentro de esqueleto | slot `weapon`, que carrega o `espada.bone` |
| Peles combináveis | `default`, `armadura`, `armadura_capa` |
| Cinemática inversa | `ik_arm`: `arm` e `forearm` perseguem `hand_target` |
| Transformação | `head_lean`: a cabeça acompanha o tronco em 5% |
| Caminho como regra | `cape_follow`: `cape1` e `cape2` seguem o `cape_path` |
| Física | `hair_physics`: o cabelo balança, com gravidade 20 |
| Comando | `look_driver`: o parâmetro `lookX` gira a cabeça e abre o sorriso |
| Parâmetro | `lookX`, de −1 a 1 |
| Morph | `smile`, que muda a forma do rosto |
| Variáveis | `speed` (número) e `grounded` (sim ou não) |
| Marcas | `vulnerable`, `attacking`, `idle` |
| Eventos | `step`, com som; `hit`, com dano 10 e o texto `sword` |
| Extensão | `RECORTE_editor_state`, o estado da tela do editor |

### As três animações

| Nome | Duração | Laço | O que faz |
|:---|---:|:---:|:---|
| `idle` | 2,00 s | sim | Respiração parada. Movimento pequeno. |
| `walk` | 1,00 s | sim | Ciclo de andar. Dispara o evento `step`. |
| `attack` | 0,60 s | não | Golpe de espada. Dispara o evento `hit`. |

---

## `espada.bone`

Um esqueleto pequeno: dois ossos (`cabo` e `lamina`), dois slots e três
animações (`idle`, `brilho` e `attack`).

Ele **não é um personagem**. É a **entidade** (§7.11): um esqueleto dentro de
um slot de outro esqueleto, uma imagem com relógio.

O `heroi.bone` o carrega no slot `weapon`, pelo anexo do tipo `skeleton`, e o
`mecha.bone` também. A espada tem vida própria: toca a animação `idle` dela em
laço, dentro da mão de quem a segura.

Ele usa o mesmo atlas do herói. Um esqueleto aninhado não precisa de página
própria.

**A espada não sabe onde vai ser pendurada.** Desde o rascunho 0.2
(17/09/2026) não há socket: quem a pendura diz o `x, y, rotation` do anexo no
osso do slot, do mesmo jeito que diria para a imagem de uma espada. Por isso
ela não tem `rig` nem o antigo slot `punho`. A espada do 0.1, com socket, está
em `backup/exemplos_2026-09-17_antes-de-tirar-o-socket/`.

A terceira animação, `attack`, existe para responder ao `attack` do hospedeiro
(`inheritAnimation`, §7.11). A `brilho` é o fundo em laço (`baseAnimation`).

---

## `mecha.bone`

O corpo que pendura a espada **pela imagem**. Cinco ossos, cinco slots, uma
animação local. Exercita, de uma vez:

| Recurso | Onde está no arquivo |
|:---|:---|
| A entidade segue a imagem | slot `weapon`, no osso `hand`: `"type": "skeleton"`, `"uri": "espada.bone"`, `"x": 20` — a raiz da espada cai onde a imagem cairia |
| Canal de resposta | `"inheritAnimation": true` — o `attack` do mecha toca o `attack` da espada |
| Canal de fundo | `"baseAnimation": "brilho"` — a espada brilha sempre, por baixo |
| Animações de fora | `assets.animations: ["mecha-animacoes.bone"]` traz `walk`, `attack` e `falar` |
| Pele de fora | `assets.skins: ["mecha-pele-inverno.bone"]` traz a pele `inverno` |
| Contrato, como documentação | `rig` com o nome `mecha-humanoide-v1` — num hospedeiro, é inerte |

A animação `idle` é local. As outras chegam pelo nome, e o jogo as vê como se
estivessem gravadas aqui. O mecha do 0.1, com `hand_socket` e `head_socket`,
está em `backup/exemplos_2026-09-17_antes-de-tirar-o-socket/`.

---

## `mecha-animacoes.bone`

Um `.bone` **sem personagem**: um osso raiz, que só existe porque `bones` é
obrigatório, e duas animações. O `rig` diz quais ossos o hospedeiro precisa
ter: `hips`, `torso`, `arm`, `hand`.

É o caso do jogo de mecha: cem esqueletos diferentes, **um** conjunto de
animações. As timelines apontam para nomes que **não estão neste arquivo** —
e isso não é erro, porque o `rig` os declara (§4.8).

---

## `mecha-pele-inverno.bone`

Uma pele que vem de fora. Um osso raiz, um `rig` com os três slots que ela
preenche (`body`, `arm`, `head`) e a pele `inverno`. Ela tem **atlas próprio** em
`assets`: as imagens de uma pele externa resolvem contra o arquivo dela, não
contra o hospedeiro (§2.8).

Ela também **troca a cabeça**. Na pele `default` o slot `head` mostra uma
imagem. Na pele `inverno` ele recebe um anexo `skeleton` que aponta para
`capacete.bone`, posto **pela imagem** (`"x": 20` no osso `head`, o mesmo par
que a imagem da cabeça usa): a cabeça vira um esqueleto animado inteiro, vindo
de outro arquivo. O mecha toca `falar` e o capacete toca o `falar` dele
(`inheritAnimation`); a luz do capacete pisca sempre, por baixo
(`baseAnimation: "piscar"`).

É a prova de que 7.11 não é só para arma, e de que o capacete pode chegar de
fora sem o personagem saber que ele existe.

---

## `capacete.bone`

Um capacete com esqueleto próprio: dois ossos (`root` e `viseira`), três
slots e duas animações (`falar` e `piscar`).

Ele **não é arma**. É o exemplo de entidade num slot comum.

Entra no slot `head` de qualquer corpo, pela pele, posto pela imagem: a pele
diz o `x, y` do anexo no osso `head`. Sem socket (rascunho 0.2).

O slot `luz` é uma luzinha em `blend: "additive"`, apagada em repouso. A
animação `piscar` acende e apaga em laço; o `falar` gira a viseira.

Quem o traz para dentro do mecha é o `mecha-pele-inverno.bone`, pela pele.

---

## `../rigs/lobisomem-rabo.bone`

Uma **pele de fora que traz osso** (§2.8, F23; Apêndice A, 78). O rabo do
lobisomem para qualquer corpo que obedeça ao rig `humanoide-v1`. Mora em
`formato/rigs/`, ao lado do rig que ela serve. Desde o degrau 1 (17/09/2026) o
validador a aceita: um `parent` que vem do `rig` conta como existente (§4.8).
Na manhã do mesmo dia, com o validador do 0.1, ela era recusada (*"pai
inexistente `quadril`"*), e por isso ficou fora de `exemplos/`; ficou em
`rigs/` porque é onde faz sentido, ao lado do contrato que ela serve.

| O que traz | Onde |
|:---|:---|
| Dois ossos com `skinRequired: true` | `rabo` (pendurado em `quadril`, que o `rig` declara) e `rabo_ponta` |
| Dois slots | `rabo` e `rabo_ponta`, que entram no **fim** da ordem de desenho do corpo |
| Uma pele | `lobisomem`, que lista os dois ossos em `bones` e dá uma imagem a cada slot |

O corpo que a cita em `assets.skins` é montado **uma vez**, com o rabo dentro:
os ossos são calculados sempre e desenhados só quando a pele `lobisomem` está
na pilha. O osso `root` do arquivo só existe porque `bones` é obrigatório;
sem `skinRequired`, o leitor o ignora. O caso de conformidade que prende a
conta é o **C-294** (`conformidade/casos-pendentes/`).

---

## `../rigs/humanoide-v1.bone`

**A convenção de nomes do projeto** (§4.8, §14.4; ARQUITETO 3 §10, decisão A6
do Humberto). Um corpo **sem arte**: 17 ossos com os comprimentos de
referência, quatro tomadas reservadas e nenhuma animação.

| Parte | Nomes |
|:---|:---|
| Eixo | `raiz` · `quadril` · `tronco` · `pescoco` · `cabeca` |
| Braços | `braco_e` · `antebraco_e` · `mao_e` · `braco_d` · `antebraco_d` · `mao_d` |
| Pernas | `coxa_e` · `canela_e` · `pe_e` · `coxa_d` · `canela_d` · `pe_d` |
| Tomadas | `arma_d` · `arma_e` · `costas` · `cabeca_acessorio` |

`_e` é o lado esquerdo **do personagem**, `_d` o direito; é o par que o editor
espelha. Quem grava um personagem com estes nomes recebe qualquer animação de
fora (`assets.animations`, com `rig.reference` apontando para o `tronco` de
70) e qualquer pele de fora (`assets.skins`, como `lobisomem-rabo.bone`) sem
acertar nome nenhum. As animações de fábrica (`parado`, `andar`, `correr`,
`pular`, `cair`, `ataque`, `dano`, `morrer`) entram na biblioteca do degrau
12, gravadas contra este rig.

---

## `heroi.atlas.json` e `heroi.png`

O atlas diz onde cada imagem está dentro da página.

| Número | Quanto |
|:---|---:|
| Páginas | 1 |
| Tamanho da página | 256 × 256 |
| Regiões | 21 |
| Regiões giradas 90 graus | 1 |
| Regiões com apelido | 1 |

### O que ele exercita

| Recurso | Onde |
|:---|:---|
| Região girada | uma região gravada deitada, para caber melhor |
| Apelido | `armadura/body` é a mesma imagem de `body`, com outro nome |
| Corte de borda transparente | quase todas as regiões |
| Nome com barra | `armadura/body`, um nome com pasta dentro |

O apelido é o que evita gravar a mesma imagem duas vezes quando duas peles usam
o mesmo desenho.

---

## Conferir os exemplos

Todos passam no validador, sem um erro:

```
npm run validar -- --todos
```

Resposta esperada:

```
OK    capacete.bone   (esqueleto)
OK    espada.bone   (esqueleto)
OK    heroi.atlas.json   (atlas)
OK    heroi.bone   (esqueleto)
OK    manifest.json   (manifesto)
OK    mecha-animacoes.bone   (esqueleto)
OK    mecha-pele-inverno.bone   (esqueleto)
OK    mecha.bone   (esqueleto)
OK    minimo.bone   (esqueleto)

9 válido(s), 0 com erro.
```

O rig da convenção fica em outra pasta e se valida à parte:

```
npm run validar -- formato/rigs/humanoide-v1.bone
```

```
npm run validar -- formato/rigs/humanoide-v1.bone formato/rigs/lobisomem-rabo.bone
```

Os dois passam. O schema e o validador são os do **rascunho 0.2** desde o
degrau 1 (17/09/2026): conhecem `body`, `weights`, `slot/bone` com
`transform`, `animation.crop` e `rig.reference`, e não conhecem mais o socket.
Um arquivo do 0.1 com `socket` ainda abre, com aviso.
Os campos novos (`body`, `slot/bone`, `weights`, `crop`, `rig.reference`)
aparecem nos casos `C-290` a `C-297` de `conformidade/casos-pendentes/`, que o
validador não varre.

Os **três** tipos que o validador conhece estão aqui: esqueleto, atlas e
manifesto. O `manifest.json` é o mesmo que vai dentro de um pacote `.bonez` —
foi tirado de `heroi.bonez` e gravado solto, para quem for implementar leitura
de pacote ter um manifesto de referência sem precisar abrir um ZIP.

---

## Gerar um quadro qualquer

```
node ferramentas/render-png.mjs formato/exemplos/heroi.bone walk 0.5 saida.png
```

| Argumento | O que é |
|:---|:---|
| `walk` | O nome da animação. |
| `0.5` | O instante, em segundos. |
| `saida.png` | Onde gravar. |

Opções úteis: `--largura N`, `--sem-ossos`, `--fundo RRGGBB`, `--bone CAMINHO`.

---

## Converter entre as três embalagens

```
npm run converter heroi.bone heroi.boneb           # texto  -> binário
npm run converter heroi.bone heroi.bonez           # texto  -> pacote
npm run converter heroi.bonez heroi.bone -- --validar
```

Tamanhos, com o herói (números redondos; o exemplo ainda cresce):

| Arquivo | Tamanho | Redução |
|:---|---:|---:|
| `heroi.bone` | cerca de 28 KB | — |
| `heroi.boneb` | cerca de 18 KB | cerca de 37% |
| `heroi.bonez` | cerca de 22 KB | cerca de 22% |

O `.bonez` leva **também** o atlas e a página de imagens.

---

## Licença destes exemplos

O cabeçalho do `heroi.bone` traz:

```json
"license": "CC0-1.0",
"copyright": "Exemplo da especificação bone 0.2"
```

**CC0** quer dizer domínio público. Use em teste, em documentação, em jogo, no
que quiser. Sem pedir e sem citar.


---

## `heroi.psd`

O caminho de entrada do programa é **Arquivo → Importar → PSD…**, e o manual
manda começar por ele — mas não havia um `.psd` no projeto, e o passo 1 não
podia ser percorrido nem por quem escreveu o editor. Este arquivo fecha esse
buraco.

Ele é o **inverso do importador**: `ferramentas/montar-psd.mjs` abre o
`heroi.bone`, desenha um slot de cada vez com o mesmo rasterizador da prova
visual (`render-png.mjs`), recorta o que ficou opaco e grava uma camada por
desenho, no lugar em que ela aparece na tela. As pastas dos slots — `capa`,
`atras`, `perna`, `arma` — viram grupos de camada.

| Conta | Valor |
|:---|---:|
| Tela | 162 × 284 px |
| Camadas | 36: 19 desenhos e 17 ossos |
| Grupos | 5: os quatro das pastas e `ossos` |

**Os ossos, desenhados** (lote 45, regravado em 10/09/2026). Por cima de tudo,
o grupo `ossos` tem uma camada por osso: a linha da base à ponta e uma bolinha
na base. **Arquivo → Importar → PSD com ossos…** (ou `importar-psd --ossos`)
lê esse grupo e monta o esqueleto junto com a arte. O **PSD…** de sempre traz
só a arte: o grupo `ossos` fica de fora, com um aviso.

**A volta é exata.** Importar este PSD e desenhar o resultado põe cada peça no
mesmo lugar, com o mesmo tamanho, até o pixel — a menos do deslocamento comum,
que é inevitável: um PSD não guarda onde fica a origem do mundo, e o importador
centraliza a tela. O teste que prova isso é
`editor/testes/lote36-chegar-no-programa.test.ts`.

**O que um PSD não guarda:** giro, escala e malha entram nos **pixels** e não
voltam como números. A arte volta no lugar. Pelo **PSD com ossos…**, o
esqueleto volta também: 18 ossos, 16 com o pai certo, ângulo até 1,64°. Os dois
que não voltam são o cabelo (nasce a 24 px da linha da cabeça) e o alvo do IK
(mora na ponta do antebraço), e as regras (IK, transformação, caminho, física)
não vêm do PSD. O teste que mede isso é `ferramentas/testes/psd-ossos.test.ts`.
