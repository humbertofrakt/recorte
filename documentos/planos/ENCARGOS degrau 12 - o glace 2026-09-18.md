# Encargos — degrau 12, o glacê — 18/09/2026

Escrito pelo **PLANEJADOR · dd3937**, por ordem do Humberto (*"continue até
terminar"*), enquanto o degrau 11 ainda fecha. **A peça vive neste arquivo.**

Quem perder o contexto lê, nesta ordem: `CLAUDE.md` · `documentos/QUEM E QUEM.md`
(as seções de 17 e 18/09) · `ESTADO.md` · **este arquivo** ·
`documentos/planos/ARQUITETO 4 - tarefas ordenadas 2026-09-17.md` (D12) ·
`documentos/PARTES.md` · e, conforme a sua parte,
`formato/ESPECIFICACAO 2026-09-17.md` ou `editor/src/contract.ts` inteiro.

**Nada começa antes de o degrau 11 fechar.** Enquanto a casca está em obra,
ninguém grava em `editor/src`. O Planejador abre as fichas quando o D11 fechar.

---

## O que é o glacê

O bolo (D0 a D11) é o programa. O glacê é o que a triagem marcou **PORTA** ou
**DEPOIS**: coisa que o formato já sabe e a tela ainda não oferece, mais o que
o Humberto pediu e ainda não existe em lugar nenhum.

A ordem é a do `ARQUITETO 4`, e ela não é gosto: é dependência e é o pedido dele.

| Ordem | O quê | Por que aqui |
|:---:|:---|:---|
| 1 | **Partículas**, extensão `BONE_particles`, 1ª fase | 🗣️ *"partícula é para ter no programa"*, depois de bases e peles. Nenhum dos três programas tem |
| 2 | **Biblioteca de animações** contra `formato/rigs/humanoide-v1.bone` | 🗣️ o pedido do Mixamo: levar a animação para outro personagem |
| 3 | **As portas do formato**: Caminho, Sliders, Áudio, Física (Simular, Reiniciar, **Assar em chaves**), Variáveis e tags | o runtime já faz; a tela não tem por onde |
| 4 a 6 | grade em perspectiva, trajeto do movimento, flash e pulso, tremor com semente, curvas, e os pequenos | conforto. Só depois dos três de cima |

**O degrau 13, o manual, não abre.** É regra do Humberto, acima do plano
(`CLAUDE.md` regra 11). Os 29 testes pulados e o 1 vermelho pré-existente de
15/09 (`exportar-e-ajuda.test.ts`, nomes de capítulo velhos) são dele: **não são
seus, não os conserte, não os apague.**

---

## As regras desta rodada

Valem para todo chat do D12, sem exceção. Cada uma custou caro antes de virar
frase; as fontes estão nos fechos de `ENCARGOS degraus 5 6 7 2026-09-17.md` e
`ENCARGOS degraus 8 9 10 2026-09-18.md` e na
`PASSAGEM DE BASTAO do planejador 2026-09-18.md`.

| # | Regra |
|:---:|:---|
| 1 | **Cerca por pasta e por parte.** A sua está na sua ficha. Fora dela, só arquivo de passagem (`contract.ts`, `main.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts`, `CHANGELOG.md`, `ESTADO.md`, `backup/INDICE.md`), **só acrescentando, relendo do disco antes de gravar** |
| 2 | **Asserção que prova comportamento de outro chat é do outro chat.** Vermelho de cerca no `fronteiras.test.ts` quer dizer que a mudança está na parte errada — não que o teste esteja errado |
| 3 | **Portas fixas.** `npm run roteiro` (5191) e `npm run medir` (9335): um chat de cada vez, **pelo "PODE" do Planejador**. E ninguém grava em `editor/src` enquanto alguém prova: o roteiro monta o código do disco na hora. `npx vitest run` e `npx tsc --noEmit` não abrem porta — à vontade |
| 4 | **Backup datado antes de escrever**, com o motivo no nome, e uma linha no `backup/INDICE.md`. A data é a do **relógio da máquina** (regra 20), não a do cabeçalho de um documento de ontem |
| 5 | **Uma versão por lote**, no fecho: `python ferramentas/versao.py N.N "o que mudou"`. Próximo livre pelo **número** no `INDICE.md` (o script só recusa nome de arquivo repetido, e o nome leva a data: virando o dia, o número escapa). **Grave a versão DEPOIS dos documentos do fecho, no mesmo comando encadeado com `&&`** |
| 6 | **A contagem de testes nunca cai.** Teste que prova o jeito antigo é **reescrito** para provar o novo, nunca apagado. Teste novo vai no arquivo da parte, nunca em `loteNN.test.ts` |
| 7 | **Botão novo nasce em ícone, com o nome na dica.** Painel novo precisa da linha em `RIGHT_GROUPS` do `ui/layout-model.ts` (senão a medição nem o mede). Campo novo no `RECORTE_editor_state` precisa da linha no `ESTADO_PERMITIDO` do `roteiro-30.mjs` **e** no `contract.ts`. Ação de menu é **um id**. Tecla nova é **uma linha** em `ui/keys.ts` |
| 8 | **Onde o programa não entende, ele avisa** (regra 21). Valor desconhecido vai para o validador ou para a barra de avisos: nunca para o desenho, nunca para um palpite silencioso, **nunca para um verde que não foi medido**. Vale também para as nossas provas |
| 9 | **Olhar os três programas antes** (Spriter, Spine, DragonBones) em cada gesto novo, e escrever nos Desvios o que cada um faz. Onde nenhum dos três serve, diga isso e siga o pedido do Humberto à letra |
| 10 | **Campo novo no NÚCLEO do formato é decisão do Humberto** (regra 7). Extensão `BONE_*` segue a §2.7 e a §12.8 da spec: schema próprio, fallback escrito, linha no `formato/extensions/REGISTRY.md`, caso de conformidade, e **os dois runtimes** antes de o caso entrar em `conformidade/casos/` |
| 11 | **Nenhum chat abre painel de pergunta** (`AskUserQuestion`): trava o chat, e o Humberto pode não estar perto. Dúvida sobe por `SendMessage` ao **`PLANEJADOR · dd3937`**. Enquanto espera, faça tudo o que não depende da resposta e **escreva a suposição nos Desvios** |
| 12 | Ao abrir: `ListAgents`, título da janela `EXECUTANDO · <o que executa>` (regra 22), e a sua linha em `documentos/QUEM E QUEM.md`. **Endereço morre da noite para o dia** |

## A linha de base do D12 é a **v16.9**

Medida pelo Planejador `dd3937` em 18/09, com a casa vazia — não é número
copiado de documento:

| Prova | Resultado |
|:---|:---|
| `npx vitest run` | **3.340** · 3.310 verdes · 29 pulados · **1 vermelho** |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| Conformidade | 71 de 71 nos dois runtimes |
| `npm run roteiro` | 14 de 14 |
| `npm run medir` | 26 de 26 de lado, 19 de 26 de altura, **com os painéis cheios** |

**O 1 vermelho não é seu.** É `editor/testes/exportar-e-ajuda.test.ts`, de
15/09: espera o capítulo `00-o-fluxo-de-trabalho.md` e acha
`00-abrir-o-recorte.md`. É do **manual**, degrau 13. Não conserte, não apague,
não o conte como queda.

**Os números da altura pioraram no lote 8 do D11, e isso é honesto**, não
regressão: a medição passou a medir o painel **cheio**, com desenho escolhido e
animação aberta. Faltam 265 px em Propriedades (a medição antiga dizia 68) e
567 px em Malha e pesos. Quem medir de novo vai achar esses números — **eles já
são o chão**.

---

## Como a rodada se divide

Três chats vivos por vez, nunca mais (régua do projeto, e o limite da conta).
A dependência manda a ordem: **a extensão do formato existe antes de qualquer
runtime lê-la, e os dois runtimes leem antes de o editor a escrever.**

| Rodada | Chats | Cerca de cada um | Depende de |
|:---:|:---|:---|:---|
| **R1** | `P1` a extensão no formato · `B` a biblioteca · `C` as portas (4 lotes) | `formato/`+`conformidade/` · `io/`+`panels/animations*` · `panels/properties*`+`rules*`+linha do tempo | o D11 fechado |
| **R2** | `P2` runtime TypeScript · `P3` runtime Python (**só pela spec**) · `A` o Caminho | `runtime/` · `runtime-python/` · `viewport/` | R1 (o `A` espera o lote 1 do `C`) |
| **R3** | `P4` o emissor na tela | a ficha sai quando o `P1` fechar | R2 |

As três cercas de cada rodada **não se cruzam em nenhum arquivo** — foi assim
que se escolheu a divisão, e é o que evita o vermelho de cerca.

Cada chat nasce em **Opus**: a ficha herda o modelo da janela que a criou, e
pedir "rode em Opus" no texto **não troca nada** — o Planejador troca com
`set_session_model` logo depois do clique. Três chats em Fable já derrubaram o
limite da conta em um minuto.

---

# 1 · Partículas — a extensão `BONE_particles`, 1ª fase

O desenho está escrito e não é para refazer:

| Onde | O quê |
|:---|:---|
| `documentos/programa-novo/07 efeitos e particulas.md` | o pedido, a régua, e **a 1ª fase fechada** |
| `documentos/planos/O QUE AINDA NAO TEMOS 2026-09-16.md`, **Parte 2** | o campo a campo: §1 a régua e as contas, §2 os campos (12 tabelas), §3 o que fica de fora, §4 como entra no formato, §5 exemplo JSON, §7 as decisões |
| `documentos/planos/COMO SE FAZ EFEITO 2026-09-16.md` | o porquê e o gesto |

## A régua, em uma frase

**Partícula é função pura do tempo.** Nasce em instante calculado, o acaso vem
de uma semente fixa, a posição é conta da idade. Arrastar a linha do tempo para
trás mostra **o mesmo quadro**, bit a bit. Nada de estado, nada de passo a passo.

O que não cabe nessa régua **fica de fora, com o nome certo** (Parte 2 §3):
colisão, fluido, partícula empurrando partícula, turbulência integrada, força
que depende da posição. A saída honesta para esses é **assar em folha**.

⚠️ A `physics` de hoje guarda estado. **Não serve de modelo para partícula.**

## O que é a 1ª fase, e o que não é

| Entra agora | Fica para depois |
|:---|:---|
| Extensão `BONE_particles`, **antes do núcleo** | entrar no núcleo |
| Taxa **só liga/desliga** | taxa animada por integral exata |
| Limite de vivas = **as mais novas** | — |
| Mistura só pelo slot | mais misturas |
| Gravidade padrão **zero** | — |
| **Uma semente por emissor**; duplicar dá semente nova | "manter a semente" como gesto próprio |
| — | sub-emissor, rastro, ruído |
| — | **nenhum campo de efeito novo**: grupo como imagem, ordem em pasta, UV que corre, dissolve, distorção |

Fonte: `07`, a tabela "A 1ª fase, fechada pelo Planejador"; `12` Q16 e Q26.
**Pode ser revisto quando mostrado a ele** — mas não por quem executa.

### A taxa: a conta vai escrita inteira, a 1ª fase usa metade

**Decidido pelo Planejador em 18/09**, a pedido do `P1`, que achou a
contradição e **não promoveu sozinho** — fez exatamente o certo.

A contradição era real: a ficha dizia *"nada de taxa por integral"*, e ao mesmo
tempo pedia o código `RANGE_PARTICLE_RATE_CURVE` (que só faz sentido se `rate`
tem chaves) e o caso **P-002, "taxa em rampa"** (`rate` de 0 a 40 linear,
`E(t) = 20·t²` — que **é** a integral, o ramo linear da §1.6).

**Vale a suposição do `P1`:**

| O quê | Como fica |
|:---|:---|
| Na 1ª fase, `rate` | **número fixo** no anexo. Quem anima é `emitting`, booleano, `stepped` |
| A conta da §1.6 | **escrita inteira na spec, os dois ramos**, com o ramo linear marcado **"2ª fase"** |
| Os cinco códigos do validador | saem **todos**, inclusive o `RATE_CURVE` |
| Os oito casos | saem **todos** em `casos-pendentes/`, com o P-002 marcado **"2ª fase"** |

**Por que a conta vai escrita inteira mesmo sem ser usada:** para o `P2` e o
`P3` não inventarem cada um a sua depois. Foi assim que nasceram o C-299 e o
C-300 — dois runtimes lendo a mesma spec de jeitos diferentes porque ela não
dizia. Spec que cala é spec que vai ser adivinhada.

**Um ponto onde a 1ª fase contraria a pesquisa, e está escrito de propósito:** a
Parte 2 §7 recomenda `rate` **animável por integral exata**; a 1ª fase ficou em
**liga/desliga**, porque o Humberto delegou com a palavra *"o mais simples"*.
Não é esquecimento nem erro da pesquisa: é a escolha mais simples que funciona,
e a integral é o primeiro item da 2ª fase. Quem executar **não promove sozinho**
— se a taxa animada parecer necessária, sobe ao Planejador.

## Rota A, e por quê

A Parte 2 §4.1 põe duas rotas, e a decisão é do Humberto (regra 7):

| Rota | O quê |
|:---|:---|
| **A** (esta) | extensão `BONE_particles`, anexo `"type": "BONE_particle"` (§2.7) |
| B | núcleo, `"type": "particle"` |

**Vai a A**, e não é escolha nossa: a regra 7 da casa e a §12.8 da spec dizem
que só entra no núcleo o que já rodou como extensão em **dois leitores
independentes**. O projeto tem os dois (TypeScript e Python). A promoção para o
núcleo é conversa para depois, com ele, e o nome antigo fica como alias.

**Ninguém escreve `"type": "particle"` sem prefixo em lugar nenhum.**

## `P1` — a extensão no formato e as provas

**Cerca:** `formato/` (a spec da extensão, o schema dela, o `REGISTRY.md`, os
exemplos), `conformidade/` (os casos), e **o validador inteiro**:
`ferramentas/validador/validar.mjs` **e** `site/validador/nucleo.js`.
**Não toca:** `editor/`, `runtime/`, `runtime-python/`, o resto de `site/`,
`documentos/manual/`.

⚠️ **Correção de endereço, pelo `P1` em 18/09:** a primeira versão desta ficha
dizia `ferramentas/src/validador/`. **Essa pasta não existe.** O validador é
`ferramentas/validador/validar.mjs` (que compila o schema) mais
`site/validador/nucleo.js` (que tem as regras semânticas, e é de onde o
`validar.mjs` importa o resto). **Regra semântica mora no `nucleo.js`** — sem
ele, os cinco códigos do lote 2 não teriam onde ser escritos sem fazer a página
e a linha de comando divergirem, que é contra o que o próprio cabeçalho do
`validar.mjs` avisa.

| Lote | O quê |
|:---|:---|
| 1 | **A spec da extensão**: um arquivo próprio em `formato/extensions/`, com os campos da Parte 2 §2 que a 1ª fase usa, as contas da §1 (nascimento, acaso `hash(semente, fluxo, i, canal)` PCG 32 bits, posição pela idade), o **fallback escrito** (§4.2: sem P, placeholder vazio **e aviso uma vez**), as linhas novas da tabela de §2.5 (`shape`, `space`, `sortMode`, `frameMode`/`meshMode` desconhecidos), e a linha no `formato/extensions/REGISTRY.md`. **JSON Schema da extensão** publicado junto (§2.7 exige) |
| 2 | **O validador**: `RANGE_PARTICLE_MINMAX` (L1), `RANGE_PARTICLE_RATE` (L1), `RANGE_PARTICLE_RATE_CURVE` (L2), `REF_PARTICLE_MESH` (L1), `LIMIT_PARTICLE_COUNT` (L2). Mais `extensionsUsed` / `extensionsRequired` conferidos (§2.7) |
| 3 | **Os casos**, escritos mas **em `conformidade/casos-pendentes/`**: P-001 (posição fechada, os números estão na §4.4 e foram calculados por dois scripts independentes, mesmo bit — **mas têm de ser refeitos pelos dois runtimes antes de virar caso**), P-002 (taxa em rampa), P-003 laço, P-004 pré-aquecimento, P-005 teto de vivas, P-006 `space world`, P-007 rajada com probabilidade, P-008 **arrastar para trás** (avaliar `t=0.9`, `0.3`, `0.9`: igual bit a bit) |

**A regra que decide empate**, e ela já custou dois casos (C-299, C-300): se os
dois runtimes lerem a spec de jeitos diferentes, **o caso decide e a spec ganha
uma linha** (Apêndice C). Nunca se conserta o teste para o código passar.

### Lote 4 do `P1` — acrescentado em 18/09, 13:00, pelo Planejador

**Achado pelo chat `B` no lote 1 dele, e conferido pelo Planejador no disco.**
Não estava no encargo: entra agora, com a cerca do `P1` ampliada.

A §4.8 da spec diz, com todas as letras: *"O validador (12.3) **DEVE** conferir
o `rig` de um arquivo externo contra o hospedeiro quando tem os dois em mãos, e
listar cada nome que falta."* **Ele não confere.**

| O que se achou | Onde |
|:---|:---|
| `RIG_UNMET` **não existe** no validador — nem no núcleo nem na linha de comando. Existe só nos dois runtimes e como comentário no `io/export-skin.ts` | `site/validador/nucleo.js`, `ferramentas/validador/validar.mjs` |
| `RIG_INCOMPLETE` (§4.8: rig que cita menos do que o arquivo usa é L2) **não existe em código vivo nenhum** — nem validador, nem runtime | relatado pelo `B`; **confirme antes de escrever** |
| O validador **carrega** arquivos externos, mas **só os corpos citados por chave `body`** (`carregarCorpos`). **`assets.animations` e `assets.skins` nunca são lidos** — então ele nunca chega a ter hospedeiro e externo em mãos ao mesmo tempo | `ferramentas/validador/validar.mjs` |
| O `rig` no núcleo do validador só é usado como **exceção** (um nome do rig conta como existente, §4.7), nunca como exigência conferida | `site/validador/nucleo.js` |

**Por que isso é grave, e não é detalhe:** quem valida pela linha de comando um
`.bone` que usa animação de fábrica recebe **verde** e nenhuma palavra sobre os
nomes que não batem. É a regra 21 outra vez, na cara que mais dói: **a prova
diz que está tudo bem quando não olhou.** As outras duas caras enganam quem usa;
esta engana a nós.

**A cerca do `P1` passa a incluir** `site/validador/nucleo.js` e
`ferramentas/validador/validar.mjs` — o núcleo mora em `site/`, o `validar.mjs`
o importa de lá, e **ninguém mais toca `site/` nesta rodada**. O `B` achou e
**não consertou, e fez certo**: não era a cerca dele.

| # | O quê |
|:---:|:---|
| 1 | O validador **lê** `assets.animations` e `assets.skins`, como já lê os corpos por `body` |
| 2 | Com os dois em mãos, confere o `rig` e **lista cada nome que falta**: `RIG_UNMET` (L2) |
| 3 | `RIG_INCOMPLETE` (L2), se a §4.8 o pedir e ele de fato não existir — **confirme os dois antes** |
| 4 | Caso de conformidade que prova o aviso, e teste no `ferramentas/testes` |

**Não invente código novo de validador que a spec não peça.** Se a §4.8 e o
código discordarem em algo além disto, **o caso decide e a spec ganha uma
linha** — e você sobe ao Planejador antes.

**Pronto quando:** a extensão tem spec, schema, fallback escrito e linha no
registro; o validador acusa os cinco códigos das partículas **e o `rig` que não
bate**; os oito casos estão escritos em `casos-pendentes/` com o número
esperado; nenhum runtime foi tocado; suíte sem queda, `tsc` limpo.

## `P2` e `P3` — os dois runtimes

Abrem **depois** do `P1`, na R2, e **um não olha o outro**.

| Chat | Cerca | Regra |
|:---|:---|:---|
| `P2` runtime TypeScript | `runtime/`, `runtime/testes/`, `ferramentas/src/conformidade/` | lê a spec da extensão |
| `P3` runtime Python | `runtime-python/` | **só pela spec da extensão.** Não lê `runtime/src`. É o que prova que a spec basta — foi assim nos degraus 2 e 3, e foi o que achou C-299 e C-300 |

### ⚠️ Os Desvios destes dois NÃO vêm para este arquivo

**Corrigido pelo Planejador em 18/09, no meio da rodada, e é falha de desenho
minha:** a regra geral manda escrever as suposições nos Desvios **deste**
encargo. Para o `P2` e o `P3` isso **mata a prova** — a ficha dos dois manda ler
este arquivo, então cada um leria a leitura do outro, e o isolamento que dá
sentido aos dois runtimes acabaria sem ninguém perceber.

| Chat | Escreve os Desvios em | Não lê |
|:---|:---|:---|
| `P2` | `documentos/planos/DESVIOS P2 - runtime TypeScript 2026-09-18.md` | o arquivo do `P3`, nem `runtime-python/` |
| `P3` | `documentos/planos/DESVIOS P3 - runtime Python 2026-09-18.md` | o arquivo do `P2`, nem `runtime/src/` |

**Os dois arquivos são cegos um ao outro até o confronto.** Quem os junta é o
Planejador, depois que os dois fecharem: onde as leituras baterem, a spec estava
clara; onde discordarem, **o caso decide e a spec ganha uma linha** (Apêndice C).
Ler o arquivo do outro antes disso não é atalho — é apagar a única prova de que
a spec basta.

O Planejador também **não repassa** a leitura de um para o outro, nem em
resumo, nem "só para confirmar".

Cada um implementa o módulo lateral **P (Partículas)**, que exige o nível A
(`shape: "mesh"` exige B; `space: "world"` exige C se o osso tiver constraints).
Quem não implementa P: placeholder vazio **e aviso uma vez**, com o nome do
emissor e do slot.

**Pronto quando:** os dois passam os oito casos, `npm run conformidade:dois`
confronta campo a campo **sem diferença**, e só então o Planejador move os casos
de `casos-pendentes/` para `casos/`. Diferença entre os dois = uma linha nova na
spec, não um teste consertado.

## `P4` — o emissor na tela

Abre na R3, depois dos dois runtimes. A ficha sai quando o `P1` fechar, com a
cerca fina escrita a partir do que ele tiver deixado no formato.

O que já se sabe: o emissor é um **anexo num slot**, preso ao osso, como um
`region`. Então ele encosta em quem cria anexo, em quem o lista na Árvore, em
quem o desenha na cena e em quem o mostra em Propriedades — e essas são partes
de donos diferentes no `documentos/PARTES.md`. **A ficha vai dizer exatamente
quais arquivos**, para não repetir os sete vermelhos de cerca da rodada 5/6/7.

Regras que já valem para ela: botão em ícone com nome na dica; a semente é
**uma por emissor** e **duplicar dá semente nova** (o defeito do Unity, escrito
em `OS ERROS QUE NAO VAMOS REPETIR` §9); o emissor que o runtime não desenha
**avisa**, não some em silêncio.

O mapa do encaixe, levantado em 18/09 e conferido no disco — é por onde a ficha
vai passar, e mostra que o emissor atravessa **quatro partes de donos
diferentes** do `PARTES.md`:

| Etapa | Onde o editor trata tipo de anexo hoje |
|:---|:---|
| Criar | `panels/tree-commands.ts` (ponto, caixa, máscara, caminho), `viewport/tools/box-tool.ts`, `mesh/mesh-doc.ts` |
| Árvore | `panels/tree-rows.ts` é **agnóstica de tipo**; quem olha o tipo é `panels/thumbnail-kind.ts` (o mapa `POR_TIPO`: ícone e nome) |
| Cena | `viewport/viewport-draw.ts`, `viewport/picking.ts`, `doc/world-math.ts`, `viewport/tools/attachment-edit.ts` |
| Propriedades | `panels/properties-model.ts`, um ramo por tipo; a tela em `panels/properties.ts` |
| Ordem | `panels/draw-order-model.ts` |

E nos runtimes, para o `P2` e o `P3`: o TypeScript resolve tipo em
`runtime/src/loader.ts`, `loadAttachment()`, com um `default:` que já avisa
*"unknown attachment type"* e trata como vazio — **o fallback da §4.2 já existe
e não precisa ser inventado**; as classes ficam em `runtime/src/attachments/` e
o que desenha está em `render-list.ts` (`DRAWABLE_TYPES`). No Python é
`runtime-python/recorte/loader.py`, `_load_attachment()`, com as classes em
`skeleton.py`.

**Dois pontos do schema que o `P1` tem de resolver no lote 1, e não pode
resolver no escuro:**

| Ponto | Resposta, conferida pelo `P1` em 18/09 |
|:---|:---|
| O `type` de anexo é um `enum` fechado com os 8 tipos do núcleo, dentro de um `anyOf`. Aceita `"BONE_particle"`? | **PASSA, e não há defeito.** O `attachmentType` é um `anyOf` de dois ramos: o enum fechado, e `coreOrExtensionType`, que é o `pattern ^[A-Z][A-Z0-9]{1,7}_[a-z0-9_]+$`. O `P1` prova com caso de validador mesmo assim, **para ninguém ter de reconferir** |
| O `extensions` valida só o nome e que o valor é objeto — **o conteúdo não é validado** | Confirmado: o schema da extensão **não é chamado de lugar nenhum hoje**. A §12.7 já manda que o validador o aplique pelo nome. Com a cerca ampliada, o `P1` liga isso: um registro nome → schema, aplicado pelo nome, e a **convenção de nome de arquivo** escrita no `REGISTRY.md` (ela não existia) |

---

# 2 · A biblioteca de animações

**O pedido dele:** *"o que você acha do Mixamo?"* — sair com **parado, andar,
correr, pular** prontos, caindo em qualquer personagem que siga a convenção de
nomes. Fonte: `documentos/programa-novo/07`, §"A biblioteca";
`IDEIAS NOVAS - particulas e biblioteca 2026-09-15.md` §2.

## O que já está pronto, e é quase tudo

Levantado no disco em 18/09. **Isto não se refaz:**

| Camada | O que já faz |
|:---|:---|
| Spec | §2.8 `assets.animations`: as `animations` de um `.bone` externo entram neste esqueleto pelo nome; `bones`, `slots`, `constraints` e `events` do arquivo externo são **ignorados**. §4.8 `rig`: `{name, bones[], slots[], reference}` é **o que o arquivo exige do hospedeiro** |
| Nome que não bate | um aviso **L2 `RIG_UNMET`** por nome; **o arquivo abre**, a timeline órfã é ignorada. Nunca fatal — é a regra 21 já escrita na spec |
| `rig.reference` (o "cair em qualquer personagem") | `k = comprimento do osso no hospedeiro / comprimento da referência`, multiplicando os `value` e `cy` das timelines de **translação** (`x`, `y`). Rotação, escala e shear não mudam. Sem `reference`, `k = 1` |
| Limites | sem encadeamento (profundidade 1, L1 `EXTERNAL_CHAIN`); nome externo igual a nome local → L2 `EXTERNAL_DUPLICATE`, **vale o local** |
| Runtime TypeScript | `runtime/src/externos.ts` (`checkRig`, `referenceFactor`), `data.ts`, `file.ts`. Pronto |
| Runtime Python | pronto, pela spec |
| Conformidade | **seis casos já passam nos dois**: C-275 animações externas · C-276 rig não atendido · C-277 skin externa · C-279 externa e local · C-294 pele externa com osso · C-297 retarget de translação |
| Os rigs | `formato/rigs/humanoide-v1.bone`: 17 ossos, 4 slots, `rig.name`, e `extras.convencao.referencia_para_rig_reference = {bone: "tronco", length: 70}`. **`animations` vazio** — o corpo existe, as animações não |

**O buraco é só um, e é na tela:** o editor **exporta e importa pele** (`io/export-skin.ts`, ids `exportar-pele-arquivo` e `importar-pele`), e **não exporta nem importa animação**. Nenhum arquivo em `editor/src/io/` escreve `assets.animations`; nenhuma tela de `panels/animations*` menciona `rig`.

## `B` — a biblioteca

**Cerca:** `editor/src/io/` (o arquivo novo de exportar/importar animação),
`editor/src/panels/animations*`, e `formato/rigs/` **só para acrescentar as
animações de fábrica**. Arquivos de passagem: `ui/actions-table.ts` (dois ids),
`ui/menus.ts`. **Não toca:** `runtime/`, `runtime-python/`, o resto de
`formato/`, `editor/src/viewport/`, `editor/src/panels/skins*`.

| Lote | O quê |
|:---|:---|
| 1 | **Exportar animação** e **Importar animação**, espelhando `io/export-skin.ts` linha a linha: o exportado leva o `rig` gerado do conteúdo (quais ossos e slots a animação usa) e o `rig.reference` da convenção; o importado põe o uri em `assets.animations` e **mostra na tela o que o hospedeiro não tem** — o `export-skin.ts` já faz isso para pele, e é o modelo exato. Dois ids novos em `actions-table.ts` |
| 2 | **As animações de fábrica**: parado, andar, correr, pular, num `.bone` contra o `humanoide-v1`. Onde elas aparecem na janela Animação, e o que acontece ao aplicá-las num corpo cujo nome de osso não bate: **a lista dos `RIG_UNMET` na tela, por extenso, antes de aplicar** |

**Onde elas entram na janela** é decisão de tela, e o executor escolhe olhando
os três programas (regra 9) — o Spine tem *Import Animation*, o Spriter não tem
biblioteca, o DragonBones traz exemplos prontos. **Escreva nos Desvios o que
cada um faz antes de decidir.**

**Um achado que veio junto, e que é do `P1`/`B` decidir a quem cabe:** o
`ferramentas/validador/validar.mjs` diz no cabeçalho que a conferência de `rig`
mora fora dele, e **não se achou a conferência L2 de `rig` implementada no
validador**. O runtime confere; o validador de linha de comando, pelo visto,
não. Se for verdade, é um aviso que não chega a quem valida um arquivo sem
abrir o editor — regra 21. **Confirme antes de consertar**, e diga o resultado
ao Planejador de qualquer jeito, mesmo que esteja tudo certo.

---

# 3 · As portas do formato

"Porta" quer dizer: **o formato e os dois runtimes já fazem, e a tela não tem
por onde a pessoa usar.** Levantado no disco em 18/09, arquivo por arquivo.

**Nenhuma das cinco precisa de campo novo no núcleo do formato** — está escrito
em uma linha no `documentos/programa-novo/10 formato - campos novos.md`. Então
a regra 7 não é acionada aqui: é trabalho de tela, e nada sobe ao Humberto.

| # | Porta | O runtime já faz | O editor tem hoje | Falta |
|:---:|:---|:---|:---|:---|
| D1 | **Caminho** | §6.4 a regra, §7.8 o anexo, §9.8 as chaves; `runtime/src/constraints/path.ts` e `attachments/path.ts` | só a **regra**: cria em `rules-model.ts`, campos em `properties-model.ts`, alça de posição em `viewport/handles.ts`. **Do anexo, nada** | criar e editar a curva na cena: âncora, alça, fechar, inverter, e **gerar `lengths`** (a spec diz que é o editor quem gera). Hoje um `path` escolhido cai no campo "Imagem" |
| D3 | **Sliders** (parâmetro e `driver`) | §8.1 e §8.2; `runtime/src/parameters.ts`, `constraints/driver.ts` | o parâmetro **nasce e só**; a regra `driver` nasce com um campo de texto | a ficha do parâmetro (mín., máx., padrão, repetição, a origem), os alvos do driver, e a barra de arrastar o valor |
| D5 | **Áudio de eventos** | §4.5 `audio`/`volume`/`balance`, §8.6 o disparo, §2.8 `audioBase` | o evento nasce só com nome; a **chave** edita volume e balanço, e o caminho do som aparece **só para ler** | a ficha da **definição** do evento (o som e os padrões), a pasta de sons, o som na linha do tempo, e tocar ao clicar. **Hoje o editor não toca som nenhum** |
| D6 | **Física** | §6.5 e `physicsReset`, §9.8 a chave `reset`; `runtime/src/constraints/physics.ts` | a regra está **completa**: cria, 14 campos, alças de vento e gravidade. **Simula sempre** | **Simular** (interruptor), **Reiniciar** (esta e todas) e **Assar em chaves**. Nenhum dos três existe |
| G9 P15 | **Variáveis e tags**, com desligar | §8.4, §8.5, §9.9; `runtime/src/animation.ts` | `anim/keying.ts` **já sabe** os alvos `variable` e `tag`, e já tem o rótulo "Marcas". **Nenhum comando cria** uma variável ou uma tag; não há painel | declarar a variável (nome, tipo, padrão) e a tag, chavear pela linha do tempo, e o **jeito de desligar** (pedido dele) |

**O que ficou de fora, com o nome:** a física "Global" (vento no esqueleto
inteiro) está **descartada** no `ARQUITETO 2` — é API do jogo, não do editor.

## O defeito que veio junto, e que não é falta de porta

> A regra `driver` criada pelo editor nasce com a lista de alvos **vazia**
> (`panels/rules-model.ts`), e o runtime **ignora** uma regra sem alvo.

Quem cria um driver hoje vê a regra na tela e **não vê efeito nenhum**, sem
aviso. É um verde silencioso — exatamente a regra 21. **Quem pegar o D3
conserta isso junto**, senão a tela nova mente melhor do que a velha.

⚠️ **E confira isto antes de dizer que está consertado.** O degrau 9 fechou uma
coisa que parece a mesma e não é: *"regra Comando vazia **avisa**"*. Avisar que
a regra está vazia é certo quando a pessoa a deixou vazia; **não é conserto para
uma regra que nasce vazia sozinha**. Se o aviso do D9 cobrir o driver, ele passa
a esconder o defeito de nascença atrás de uma mensagem que parece esperada.
As duas coisas têm de valer ao mesmo tempo: **o driver nasce com alvo**, e quem
esvaziar o alvo à mão **vê o aviso**. Dois testes, não um.

## `C` — as portas, um chat só, em lotes por parte

**Por que um chat só:** as cinco portas caem em **quatro partes diferentes** do
`PARTES.md` (Cena, Árvore, Linha do tempo, Ficha/regras). Dois chats aqui
brigariam em `properties-model.ts` e em `rules-model.ts` — foi assim que
nasceram os sete vermelhos de cerca da rodada 5/6/7. Um chat, em lotes.

**Cerca:** `panels/properties*.ts`, `panels/rules*.ts`, `panels/event-key-editor.ts`,
`anim/event-keys.ts`, `anim/keying.ts`, `panels/tree-commands.ts` (só para
acrescentar os comandos de criar), `ui/prefs.ts` (só o desligar).
**Não toca:** `runtime/`, `runtime-python/`, `formato/`, `viewport/`, `site/`,
`documentos/manual/`.

| Lote | O quê |
|:---:|:---|
| 1 | **D3 Sliders**: a ficha do parâmetro, os alvos do driver, a barra do valor — **e o conserto do driver sem alvo**, com teste que prova que a regra criada pelo editor roda de verdade |
| 2 | **D5 Áudio**: a ficha da definição do evento, a pasta de sons (`assets.audioBase`), o som na linha do tempo, tocar ao clicar |
| 3 | **D6 Física**: Simular (interruptor), Reiniciar (esta e todas), **Assar em chaves** — o assado grava chaves comuns pela `anim/keying.ts`, e o resultado tem de ser **tocável para trás** como qualquer animação |
| 4 | **G9/P15 Variáveis e tags**: criar, chavear, e o desligar |

## `A` — o Caminho, chat próprio

O D1 é o maior dos cinco e é **de outra natureza**: é ferramenta de cena (curva
Bézier), não campo em painel. Vai num chat próprio, na R2, com a cerca da parte
**Cena** (`viewport/tools/`, `viewport/handles.ts`) mais o comando de criar na
Árvore. Abre depois que o `C` fechar o lote 1, para não cruzar em
`properties-model.ts`.

O `lengths` é gerado pelo editor — a spec diz isso — e um `lengths` errado não
aparece na tela: aparece no jogo de outra pessoa. **Caso de conformidade não
cobre o que o editor gera**, então este lote precisa de teste próprio que
confira o comprimento contra a curva.

---

## O que este encargo NÃO manda fazer

Escrito para que ninguém o invente por conta:

| Não | Por quê |
|:---|:---|
| **O manual (D13)** | regra do Humberto, acima do plano. Os 29 testes pulados e o 1 vermelho de 15/09 são dele |
| **Promover `BONE_particles` ao núcleo** | §12.8: só depois de dois leitores independentes passarem, e é decisão dele |
| **Taxa animada por integral, sub-emissor, rastro, ruído** | 2ª fase, escrita acima |
| **Campo de efeito novo** (grupo como imagem, ordem em pasta, UV, dissolve, distorção) | campo novo no núcleo = decisão dele (regra 7). Estão na lista "Decisões que são do Humberto" da pesquisa de 16/09 |
| **Física Global** (vento no esqueleto todo) | descartado: é API do jogo |
| **Os itens 4 a 6 do D12** (grade em perspectiva, trajeto, flash e pulso, tremor, curvas, os pequenos) | só quando os três de cima fecharem. A grade tem duas decisões abertas dele |

---

## Apêndice — as fichas da R1, prontas para abrir

Escritas agora, **antes** de o D11 fechar, porque a peça vive no arquivo e não
na janela: se esta janela do Planejador morrer, a próxima abre as três fichas
sem reler nada. **Depois de cada clique, troque o modelo para Opus**
(`list_sessions` → `set_session_model(id, "claude-opus-5")`): a ficha herda o
modelo da janela que a criou, e pedir Opus no texto não troca nada.

### Ficha `P1` — a extensão `BONE_particles` no formato

> Você é o chat **`EXECUTANDO · particulas no formato`** do projeto Recorte
> (`C:\Users\F-rak\Desktop\animador`). Trabalhe só dentro da pasta.
>
> Leia, nesta ordem: `CLAUDE.md` · `documentos/QUEM E QUEM.md` (as seções de
> 18/09) · `documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md`
> (**o seu encargo é a parte 1, e a sua ficha é `P1`**) ·
> `documentos/programa-novo/07 efeitos e particulas.md` ·
> `documentos/planos/O QUE AINDA NAO TEMOS 2026-09-16.md` **Parte 2 inteira**
> (a régua, os campos, o que fica de fora, como entra no formato, o exemplo, os
> casos) · `formato/ESPECIFICACAO 2026-09-17.md` §2.5, §2.7 e §12.8.
>
> **A sua cerca:** `formato/` e `conformidade/` e
> `ferramentas/src/validador/`. **Não toca** `editor/`, `runtime/`,
> `runtime-python/`, `site/`, `documentos/manual/`.
>
> Três lotes, um por vez, cada um com backup datado antes de escrever, linha no
> `backup/INDICE.md`, subtítulo no `CHANGELOG.md` e **uma versão no fecho**
> (`python ferramentas/versao.py N.N "..."`, número livre pelo `INDICE.md`,
> **depois** dos documentos, no mesmo comando com `&&`): (1) a spec da extensão,
> o JSON Schema dela, o fallback escrito, as linhas novas de §2.5 e a linha no
> `formato/extensions/REGISTRY.md`; (2) os cinco códigos do validador; (3) os
> oito casos P-001 a P-008, escritos em **`conformidade/casos-pendentes/`** —
> eles só entram em `casos/` quando os dois runtimes passarem, e quem move é o
> Planejador.
>
> **Dois pontos para resolver no lote 1 e não no escuro:** o `extensions` do
> `bone.schema.json` valida só o nome e que o valor é objeto — o conteúdo não é
> validado, então diga de onde o schema da extensão é chamado; e o `type` de
> anexo é um `enum` fechado dos 8 tipos do núcleo dentro de um `anyOf` —
> confira se `"BONE_particle"` passa. Se não passar, é defeito do schema contra
> a §2.7, e o conserto é seu, com caso de validador provando.
>
> A 1ª fase é **só** o que está na tabela do `07`: taxa liga/desliga, uma
> semente por emissor, mistura pelo slot, gravidade zero. Nada de taxa por
> integral, sub-emissor, rastro ou ruído. Ninguém escreve `"type": "particle"`
> sem prefixo.
>
> `npx vitest run` e `npx tsc --noEmit` à vontade. **Não rode `npm run roteiro`
> nem `npm run medir`**: porta fixa, e é o Planejador que dá o "PODE".
> A contagem de testes nunca cai. Onde você não souber, **avise**: nunca um
> verde que não foi medido.
>
> Ao abrir: `ListAgents` (a primeira linha diz o seu endereço), ponha o título
> da janela `EXECUTANDO · particulas no formato`, e escreva a sua linha em
> `documentos/QUEM E QUEM.md`. **Nunca abra painel de pergunta**
> (`AskUserQuestion`): dúvida vai por `SendMessage` ao `PLANEJADOR · dd3937`, e
> enquanto espera você escreve a suposição nos Desvios do encargo e segue.
> No fim: mensagem curta ao Planejador com as versões e os números, e **pare**.

### Ficha `B` — a biblioteca de animações

> Você é o chat **`EXECUTANDO · biblioteca de animacoes`** do projeto Recorte
> (`C:\Users\F-rak\Desktop\animador`). Trabalhe só dentro da pasta.
>
> Leia: `CLAUDE.md` · `documentos/QUEM E QUEM.md` (18/09) ·
> `documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md` (**a parte 2 é
> sua**) · `editor/src/contract.ts` **inteiro** · `documentos/PARTES.md` ·
> `formato/ESPECIFICACAO 2026-09-17.md` §2.8 e §4.8 · e, como modelo exato,
> `editor/src/io/export-skin.ts`.
>
> **O formato e os dois runtimes já fazem tudo isto** — seis casos passando
> (C-275, C-276, C-277, C-279, C-294, C-297). **Não refaça nada disso.** O
> buraco é só a tela: o editor exporta e importa **pele** e não exporta nem
> importa **animação**.
>
> **A sua cerca:** `editor/src/io/` (o arquivo novo), `editor/src/panels/animations*`,
> e `formato/rigs/` **só para acrescentar as animações de fábrica**. Arquivos de
> passagem (`ui/actions-table.ts`, `ui/menus.ts`, `CHANGELOG.md`, `ESTADO.md`,
> `backup/INDICE.md`): **só acrescentando, relendo do disco antes de gravar**.
> **Não toca** `runtime/`, `runtime-python/`, o resto de `formato/`,
> `editor/src/viewport/`, `editor/src/panels/skins*`, `documentos/manual/`.
>
> Dois lotes, uma versão cada: (1) Exportar animação e Importar animação,
> espelhando o `export-skin.ts` — o exportado leva o `rig` gerado do conteúdo e
> o `rig.reference` da convenção (está em `extras.convencao` do
> `formato/rigs/humanoide-v1.bone`), o importado põe o uri em
> `assets.animations` e **mostra na tela, por extenso, o que o hospedeiro não
> tem** (os `RIG_UNMET`) antes de aplicar; (2) as animações de fábrica — parado,
> andar, correr, pular — contra o `humanoide-v1`, e onde elas aparecem na janela
> Animação.
>
> **Antes de decidir onde elas aparecem, olhe os três programas** (Spriter,
> Spine, DragonBones) e escreva nos Desvios o que cada um faz. Botão novo nasce
> em ícone com o nome na dica; ação de menu é **um id** em
> `ui/actions-table.ts`; tecla nova é **uma linha** em `ui/keys.ts`.
>
> **Confira e responda uma coisa ao Planejador, mesmo que esteja tudo certo:** o
> `ferramentas/validador/validar.mjs` parece **não** conferir o `rig` (L2), que
> o runtime confere. Se for verdade, é um aviso que não chega a quem valida sem
> abrir o editor — regra 21.
>
> `npx vitest run` e `npx tsc --noEmit` à vontade; **roteiro e medição só com o
> "PODE" do Planejador** (porta fixa, outro chat pode estar provando). A
> contagem de testes nunca cai; teste novo vai no arquivo da parte. Ao abrir:
> `ListAgents`, título `EXECUTANDO · biblioteca de animacoes`, e a sua linha no
> `QUEM E QUEM.md`. **Nunca abra painel de pergunta**: dúvida por `SendMessage`
> ao `PLANEJADOR · dd3937`. No fim, mensagem curta e **pare**.

### Ficha `C` — as portas do formato

> Você é o chat **`EXECUTANDO · as portas do formato`** do projeto Recorte
> (`C:\Users\F-rak\Desktop\animador`). Trabalhe só dentro da pasta.
>
> Leia: `CLAUDE.md` · `documentos/QUEM E QUEM.md` (18/09) ·
> `documentos/planos/ENCARGOS degrau 12 - o glace 2026-09-18.md` (**a parte 3 é
> sua**, e a tabela das cinco portas diz onde cada coisa está hoje) ·
> `editor/src/contract.ts` **inteiro** · `documentos/PARTES.md` ·
> `formato/ESPECIFICACAO 2026-09-17.md` §6.4, §6.5, §8.1, §8.2, §8.4, §8.5,
> §4.5, §8.6, §9.8, §9.9.
>
> **Nenhuma das portas precisa de campo novo no núcleo do formato.** O runtime
> já faz todas: o trabalho é só dar por onde a pessoa usar.
>
> **A sua cerca:** `editor/src/panels/properties*.ts`, `panels/rules*.ts`,
> `panels/event-key-editor.ts`, `anim/event-keys.ts`, `anim/keying.ts`,
> `panels/tree-commands.ts` (**só para acrescentar** os comandos de criar),
> `ui/prefs.ts` (só o desligar), e os arquivos de passagem, só acrescentando.
> **Não toca** `runtime/`, `runtime-python/`, `formato/`,
> `editor/src/viewport/` (o Caminho é de outro chat, na rodada seguinte),
> `site/`, `documentos/manual/`.
>
> Quatro lotes, uma versão cada: (1) **Sliders** — a ficha do parâmetro (mín.,
> máx., padrão, repetição, a origem), os alvos do driver, a barra do valor, **e
> o conserto do driver que nasce com `targets: []` em `panels/rules-model.ts`**,
> que o runtime ignora: hoje quem cria um slider vê a regra na tela e não vê
> efeito nenhum, sem aviso — é a regra 21, e o teste tem de provar que a regra
> criada pelo editor roda de verdade; (2) **Áudio** — a ficha da definição do
> evento (o som e os padrões), a pasta de sons (`assets.audioBase`), o som na
> linha do tempo, tocar ao clicar (hoje o editor não toca som nenhum);
> (3) **Física** — Simular (interruptor), Reiniciar (esta e todas) e **Assar em
> chaves**, e o assado tem de ser tocável para trás como qualquer animação;
> (4) **Variáveis e tags** — criar, chavear (a `anim/keying.ts` **já sabe** os
> alvos `variable` e `tag`), e o jeito de desligar.
>
> A física **Global** (vento no esqueleto inteiro) está descartada: é API do
> jogo. Não entra.
>
> Em cada gesto novo, **olhe os três programas** e escreva nos Desvios o que
> cada um faz. Botão novo em ícone com o nome na dica; ação de menu é um id;
> tecla nova é uma linha em `ui/keys.ts`; campo novo no `RECORTE_editor_state`
> precisa da linha no `ESTADO_PERMITIDO` do `roteiro-30.mjs` **e** no
> `contract.ts`.
>
> `npx vitest run` e `npx tsc --noEmit` à vontade; **roteiro e medição só com o
> "PODE" do Planejador**. A contagem de testes nunca cai. Ao abrir:
> `ListAgents`, título `EXECUTANDO · as portas do formato`, e a sua linha no
> `QUEM E QUEM.md`. **Nunca abra painel de pergunta**: dúvida por `SendMessage`
> ao `PLANEJADOR · dd3937`. No fim, mensagem curta e **pare**.

### As fichas da R2 e da R3

Não estão escritas de propósito: a cerca do `P2`, do `P3` e do `P4` depende do
que o `P1` deixar no formato (o nome do arquivo da spec da extensão, o nome do
schema, quais casos ficaram em `casos-pendentes/`), e a do `A` depende de onde
o `C` mexeu em `properties-model.ts`. **O Planejador as escreve no fecho da
R1**, com os caminhos na mão, e não antes.

---

## Desvios e suposições

*(Cada chat escreve aqui, uma tabela por lote: o que supôs, o que deixou de
fora, e o que os três programas fazem. Nunca invente por cima do plano — se
desviou, a linha vem para cá.)*


### `P1` — lote 1: a extensão `BONE_particles` no formato (v17.1)

| # | O quê | O que eu supus, e por quê |
|:---:|:---|:---|
| 1 | **A cerca da ficha aponta para uma pasta que não existe.** Ela diz `ferramentas/src/validador/` | O validador é `ferramentas/validador/validar.mjs` (o Ajv e a leitura de arquivo) **mais** `site/validador/nucleo.js` (a regra semântica, importada de lá pelos dois). Tratei os dois como a cerca. Subido ao Planejador e **corrigido por ele** na ficha, junto com a ordem que aumentou a cerca para incluir os dois |
| 2 | **A contradição da taxa.** A ficha diz "nada de taxa por integral", e manda o `RANGE_PARTICLE_RATE_CURVE` e o P-002 (taxa em rampa), que **são** a integral | Não promovi sozinho. Subi ao Planejador e segui com a suposição: `rate` fixo no anexo, `emitting` animável em degraus, e **a conta escrita inteira** com o ramo `linear` marcado "2ª fase". **Aprovada por ele** e escrita no encargo, seção "A taxa". Motivo dele, que ficou na spec: *spec que cala é spec que vai ser adivinhada* — foi assim que nasceram o C-299 e o C-300 |
| 3 | **A convenção de nome de arquivo de schema de extensão não existia escrita.** Eu escolhi | `formato/extensions/<NOME_DA_EXTENSAO>.md` para a spec e `<NOME_DA_EXTENSAO>.schema.json` para o schema, com o nome exato que vai em `extensionsUsed`. Escrito no `REGISTRY.md`, com a tabela do que o schema declara de si mesmo (`x-extension`, `x-attachment-types`) — assim uma extensão nova entra no validador **sem uma linha de código** |
| 4 | **`"BONE_particle"` passa no `bone.schema.json`. Não há defeito.** | O `attachmentType` é um `anyOf` de dois ramos: o `enum` fechado dos oito tipos do núcleo **e** o `coreOrExtensionType`, que é `^[A-Z][A-Z0-9]{1,7}_[a-z0-9_]+$`. Conferido no disco, não lido de documento. Provado mesmo assim, em `ferramentas/testes/particulas.test.ts`, com o teste irmão de que `"particle"` sem prefixo é **recusado** |
| 5 | **Toquei mais três arquivos do que a cerca nomeia**, e aviso aqui | Para o schema da extensão valer, ele tem de ser aplicado **nos dois lados**, senão a página e a linha de comando divergem — e o cabeçalho do `validar.mjs` avisa contra isso em letras. Além de `nucleo.js` e `validar.mjs`, mexi em `site/validador/construir-esquema.mjs` (compila os schemas de extensão à frente do tempo), `site/validador/validador.js` (uma linha: passa o registro) e os gerados `esquema-compilado.js`, `extensoes-compiladas.js` e os dois `.d.ts`. **Tudo dentro de `site/validador/`, que ninguém mais toca nesta rodada.** Avisado ao Planejador |
| 6 | **O buraco que isto fechou, escrito porque é a regra 21 outra vez** | A §12.7 manda o validador aplicar o schema de uma extensão pelo nome. Ninguém aplicava: o `definitions/extensions` conferia o **nome** da chave e que o valor era um objeto, e parava. Um emissor com `rate: -5`, `shape: "triangulo"`, `seed: -1` e `maxParticles: 99999` recebia **verde** nos dois validadores. Os quatro defeitos estão no teste, e o teste prova que sem o registro eles voltam a passar |
| 7 | **Os cinco números do hash foram REFEITOS na máquina**, não copiados da pesquisa | `pcg(0)`, `pcg(42)`, `pcg(0xFFFFFFFF)`, `acaso(42,0,7,0)` e `acaso(42,0,−3,0)`, mais os oito canais de `(42, 0, 7)`: **treze números, mesmo bit em Node e em Python**. Só depois foram para a spec. Um runtime que não os reproduza não implementa P |
| 8 | **O que os três programas fazem**, e onde o Recorte sai deles | Godot e Unity **simulam para frente** (`ParticleSystem.Simulate` roda os passos de novo; a proposta do Godot pedia **gravar o estado**). Os dois **bloqueiam o nascimento** quando lota — isso é estado, e aqui o limite desenha as mais novas (o espírito do "Ring Buffer Mode" do Unity). Os dois têm **semente automática**, que a régua proíbe. O Effekseer chama `space: "world"` de *"Only on create"* contra *"Always"* — é o conceito exato, e a palavra `world` ficou porque Godot e Unity usam. `shape: "bone"` é **palavra nova**: nenhum dos três tem osso |
| 9 | **O que NÃO entrou**, e não por esquecimento | Sub-emissor, rastro, ruído, aceleração angular, quadro por velocidade: cabem na régua e ficaram de fora **por tamanho**, com a nota escrita na spec (§12). Colisão, força que depende da posição, turbulência de campo, taxa por distância e herdar velocidade **não cabem**, e o motivo de cada um está na tabela |

### `B` — lote 1: Exportar animação e Importar animação (v17.0)

| # | O quê | O que eu supus, e por quê |
|:---:|:---|:---|
| 1 | **O achado do validador é verdadeiro, e é maior do que o encargo previa** | `RIG_UNMET` não existe em `ferramentas/validador/validar.mjs` nem em `site/validador/nucleo.js` — só nos dois runtimes e como comentário no editor. E `RIG_INCOMPLETE` (§4.8, *"um `rig` que cita menos do que o arquivo usa é L2"*) **não existe em lugar nenhum do código vivo**. Mais: o validador carrega arquivos externos, mas **só os corpos citados por chave `body`** (9.13, `carregarCorpos`); `assets.animations` e `assets.skins` nunca são lidos, então ele **nunca tem os dois em mãos**, que é a condição da §4.8. Subido ao Planejador; virou o lote 4 do `P1`. **Não consertei**: é cerca dele, e o núcleo mora em `site/` |
| 2 | **De onde sai o `rig.reference`, que o encargo não especifica** | Na ordem: (1) `extras.convencao.referencia_para_rig_reference.bone` do corpo — é o que o `humanoide-v1.bone` grava; (2) o `rig.reference.bone` que o arquivo já declare; (3) o `tronco` da convenção, **se o corpo tiver um osso com esse nome**. O `length` é sempre **o comprimento que o osso tem no corpo que está exportando** (§4.8: *"o comprimento que ele tinha no esqueleto em que a animação foi gravada"*). Sem nenhum dos três, ou com comprimento zero, o arquivo sai **sem `reference`** e a janela **diz** que a animação entra no tamanho em que foi gravada — nunca um palpite (regra 21) |
| 3 | **O arquivo exportado leva a raiz pelada, e só ela** | `bones` é obrigatório (§2.2) e um arquivo sem osso nenhum não carrega; mas a §2.8 **ignora** `bones`, `slots`, `constraints` e `events` de um arquivo de animações. Levar o esqueleto inteiro engordaria o arquivo e faria quem o abrisse pensar que ele traz um corpo |
| 4 | **Regra citada por timeline `constraint` NÃO entra no `rig`** | A §4.8 manda listar todo alvo de timeline `bone` e os alvos de `slot`, `deform`, `weights` e `sequence`. `constraint`, `parameter`, `morph` e `variable` apontam para coisas que a §2.8 ignora num arquivo externo: pedi-las ao hospedeiro seria exigir um nome que nunca vai ser usado. Elas aparecem, em vez disso, na lista **"fica de fora"** do relatório |
| 5 | **A pergunta de importar mora no painel, não no `io/`** | `io/` é o degrau 2 e `ui/dialog.ts` é o degrau 3 (`contract.ts`; o `fronteiras.test.ts` é o árbitro). O `io/` desenha a janela de exportar com o `el` de `ui/dom.ts`, que é a exceção escrita; a janela de **perguntar** ficou em `panels/animations-actions.ts` |
| 6 | **Toquei `editor/testes/acoes.test.ts`**, que é da parte "Casca e menus" | Duas contas fechadas (196→198 e 25→27) que toda parte que acrescenta uma ação de menu tem de acertar. Só acrescentando, relendo do disco antes de gravar, com a linha do motivo no comentário |

### `B` — lote 2: as quatro animações de fábrica (v17.1)

**Os três programas, olhados no disco antes de decidir** (regra 9 da casa;
fontes em `documentos/pesquisa/nova pesquisa/`):

| Programa | O que ele faz | Fonte |
|:---|:---|:---|
| **Spine** | `File → Import → Project`, e o seletor oferece **Skeleton** ou **Animation**, com *"Import into an existing skeleton"*. **Não há prateleira na tela**: a animação importada entra na lista normal de animações e fica igual às outras | `spine/Spine - todas as funcoes 2026-09-08.md` §20 |
| **Spriter** | **não tem biblioteca e não importa animação.** Tem a *Animation palette*, à direita embaixo do file palette, que lista as animações e as entidades **do projeto**. Reaproveitar é na mão: `Ctrl+C` e `Edit / Paste to all keys` | `spriter/Spriter - todas as funcoes 2026-09-08.md`, itens 14 e "Animation palette" |
| **DragonBones** | tem uma **biblioteca**, mas é a de **recursos** (imagens): uma pasta de verdade no disco, com *importar recurso · abrir a pasta da biblioteca · atualizar*. O painel **Animações** dele tem só *nova · clonar · renomear · apagar*. Os prontos que ele traz são **projetos de exemplo**, abertos por Abrir | `dragonbones/DragonBones - todas as funcoes 2026-09-08.md` §3.8 e §3.9 |

| # | O quê | O que eu decidi, e por quê |
|:---:|:---|:---|
| 1 | **Onde as de fábrica aparecem: segue o Spine** | É o único dos três que faz a coisa que o Humberto pediu. A porta é **um botão na janela Animação** (ícone `pasta`, nome na dica) mais o item **Animação → Biblioteca de animações…**, e o que chega aparece **na mesma janela**, numa seção **De fora**, com o nome do arquivo. Não se inventou prateleira nova: o DragonBones prova que uma biblioteca separada é lugar de *recursos*, e o Spriter prova que, sem porta nenhuma, a pessoa copia na mão |
| 2 | **O que é nosso, e não é de nenhum dos três** | A lista do que o corpo **não tem** aparece por extenso **antes** de trazer, e o fator de tamanho aparece como **número** (`k = 2,000`), não como promessa. O Spine deixa a timeline órfã cair calada |
| 3 | **As animações de fábrica foram para um arquivo NOVO, não para dentro do `humanoide-v1.bone`** | O `animations: []` daquele arquivo é vazio **de propósito** — o `extras.descricao` dele diz *"um corpo sem arte … e nenhuma animação"*, e ele é publicado com a spec (§14.4) como a convenção de nomes. O novo é `formato/rigs/humanoide-v1-animacoes.bone`, e o `extras` do velho já anunciava isto: *"as animações de fábrica … entram na biblioteca do degrau 12, **gravadas contra este rig**"* |
| 4 | **Trazer da biblioteca GRAVA o arquivo, e a janela diz isso** | O `assets.animations` é um caminho relativo ao `.bone` do projeto (§2.8): um uri apontando para dentro do editor não existe na máquina de quem for rodar o jogo. Então trazer é **gravar o arquivo onde a pessoa escolher e citar o nome com que ele foi gravado**. Fechar a janela de gravar não traz nada, e o rodapé conta |
| 5 | **A seção "De fora" mostra o uri, e diz quando não sabe os nomes** | `assets.animations` guarda **uris**; os nomes moram no arquivo de fora, e quem os copia é o leitor, ao carregar. O editor não resolve caminho de disco sozinho, então, de um `.bone` aberto que já citava um arquivo externo, ele **não sabe** que animações são aquelas. Os nomes do que passou pelas mãos dele nesta sessão ficam num **mapa de sessão**, como o `fromOutside` de `io/open-save.ts` — e **não** num campo novo do `RECORTE_editor_state`: gravar nomes no documento criaria uma segunda verdade, porque o arquivo de fora pode mudar no disco. O que ele não sabe, a linha **escreve que não sabe** (`?` e a palavra "não aberto"), em vez de mostrar zero e parecer uma importação que não pegou |
| 6 | **O `pular` não repete, e os outros três repetem** | Um pulo que volta ao começo sozinho vira um pula-pula. Está no `extras.o_que_cada_uma_e` do arquivo, e tem teste |
| 7 | **Os valores são locais e ABSOLUTOS, e por isso carregam a pose de setup da convenção** | §9.4: *"`value` é escrito **por cima** do valor de setup"*. Não há delta no formato. É exatamente por isso que a convenção de nomes existe, e é o mesmo comportamento do Spine. Um corpo com rotações de setup muito diferentes recebe a pose da convenção — o que o `rig.reference` conserta é o **tamanho**, não a pose |
| 8 | **Toquei `editor/testes/acoes.test.ts` outra vez** (198→199 e 27→28) e **reescrevi um teste do degrau 5** | O teste `'a janela tem as duas listas'` fixava a linha `body.append(tiraCorpos, corpos, tiraAnimacoes, list)`, que provava o jeito antigo. Reescrito para provar o novo, com as duas seções — nunca apagado (regra 6 da rodada) |
| 9 | **O que NÃO entrou, e não por esquecimento** | Não há **auto-rig** (o outro pedaço do Mixamo: soltar a pasta e o programa montar o esqueleto pelos nomes) — não está no encargo, e é um lote próprio. A seção "De fora" **não abre** as animações externas para editar: elas não são deste arquivo, e carregá-las é trabalho de quem lê, não de quem edita. E não há `cair`, `ataque`, `dano` nem `morrer`, que o `extras` do `humanoide-v1` menciona: o encargo pede **quatro**, e quatro foram |

### `P1` — lote 2: os cinco códigos do validador (v17.2)

| # | O quê | O que eu supus, e por quê |
|:---:|:---|:---|
| 1 | **O `EXT_REQUIRED_NOT_USED` existia como AVISO sem código, e a §12.3 diz L1** | Um aviso deixa o arquivo passar por **válido**. Troquei para erro, com o código. Nenhum exemplo nem caso de conformidade usava `extensionsRequired`, então nada ficou vermelho — conferido antes de mexer, não depois |
| 2 | **A metade que faltava do `EXT_REQUIRED_NOT_USED`**, e que ninguém tinha | A §12.3 diz "extensão usada e não listada", e só a primeira metade (`Required ⊄ Used`) existia. Escrevi a segunda: o uso é achado pelo anexo prefixado, pela timeline prefixada e por qualquer `extensions.<nome>` em qualquer objeto. É o caso que morde, porque o leitor decide o que consegue mostrar lendo essa lista |
| 3 | **De onde sai a lista de extensões registradas** | Do `formato/extensions/REGISTRY.md`, lendo a primeira célula das linhas da tabela. Ler Markdown parece frágil; uma lista de nomes dentro do código seria pior, porque divergiria do registro no primeiro dia — e o registro é o documento que a §2.7 cita. **Sem a lista em mãos, nenhum `EXT_UNREGISTERED` sai:** não ter o registro não é o mesmo que o nome não estar nele |
| 4 | **O `LIMIT_PARTICLE_COUNT` olha a maior taxa das CHAVES**, não só o campo | Um emissor com `rate: 1` no anexo e uma chave em 9 000 estouraria o teto e passaria batido. Está no teste |
| 5 | **O `RANGE_PARTICLE_RATE` também olha as chaves** | Mesmo motivo. A regra da §4.2 é "o runtime troca por 0 **na chave**, antes de integrar" — então a chave é onde o defeito mora |
| 6 | **As linhas de §2.5 entraram no lote 2, e não no 1** | A ficha as pedia no lote 1; eu as escrevi na §7.4 da spec da extensão e só depois vi que a §2.5 do **núcleo** também as queria. Entraram aqui, com um parágrafo dizendo que toda extensão prefixada traz as linhas dela e que elas valem como as do núcleo. Nenhum campo novo no núcleo: só uma tabela que aponta para a extensão |
| 7 | **Um teste da v17.1 foi REESCRITO, e a contagem não caiu** | Ele provava que `rate: -5` passava sem o registro de extensões. O `RANGE_PARTICLE_RATE` deste lote é regra semântica e não precisa de registro, então aquilo virou mentira. Reescrito para provar a mesma coisa — o buraco que o registro fecha — com um defeito que **só** o schema pega: um `space` que não existe. **Teste que prova o jeito antigo é reescrito, nunca apagado** |
| 8 | **O que o schema NÃO consegue dizer, e por isso é regra** | `min > max` compara dois itens do mesmo array; a referência da malha é um nome noutro objeto; o teto é um produto. São exatamente a camada L1/L2 da §12.7 (*"o schema é o mínimo de validação"*) |

### `P1` — lote 3: os oito casos P-001 a P-008 (v17.4)

| # | O quê | O que eu supus, e por quê |
|:---:|:---|:---|
| 1 | **O `pose-dump` não tinha como falar de partícula**, e a medida nova é da cerca do `P2` | Os oito casos precisam de `measure: "particles"`, e `ferramentas/src/conformidade/` é do chat do runtime TypeScript. **Não toquei.** Escrevi o formato do bloco na §14.1 da spec da extensão e nos casos: eles são o **contrato** que o `P2` cumpre. É o único jeito de a cerca ser respeitada e os casos existirem |
| 2 | **Três linhas novas na spec, e cada uma nasceu de escrever um caso** | (a) §6, **quantos nascimentos tem uma volta**: `0 <= i < E(D)`. Descoberto ao escrever o P-003, quando as duas amostras deram 24 e 23. (b) §7.2, **o que a matriz do osso leva junto e em que instante** — cinco linhas, porque o P-006 não tinha como ser calculado sem elas. (c) §14.1, **o formato do dump**. As três eram coisas que dois leitores teriam adivinhado diferente. É a regra de empate agindo **antes** de custar um caso |
| 3 | **`x` e `y` do dump são SEMPRE no espaço do esqueleto**, nos dois `space` | Sem isso o P-006 não é comparável: o contraste do caso é `(100, 0)` em `world` contra `(0, 100)` em `local`, e os dois números só podem ser comparados no mesmo espaço |
| 4 | **O ângulo sai NÃO reduzido** a `−180..180` | `251.145834`, e não `−108.854166`. Escolhi assim porque é o que a conta dá direto (`angle_i + av·a`), e reduzir seria um passo a mais que um leitor pode esquecer. Escrito na §14.1 e avisado no leiame do P-001, para ninguém perder meia hora procurando o erro na conta |
| 5 | **O tempo do laço dobra em `duration`** (§9.11 da spec do formato) | O P-003 mede `t = 0.02` e `t = 1.02` com `loop: true`: `1.02 mod 1 = 0.02`, então as duas amostras são **idênticas**, `birth` incluído. O gerador tem um `throw` que falha se deixarem de ser |
| 6 | **O P-002 é de 2ª fase, e o `esperado.json` dele está VAZIO de propósito** | Ele exercita o ramo `linear` da integral, que a decisão do Planejador deixou para a 2ª fase. Foi escrito agora porque a **conta** precisava ficar fechada na spec. O leiame diz em maiúsculas: **não mova para `casos/` antes disso**, e um teste prende essa frase |
| 7 | **Os números foram refeitos, e isso não basta** | Duas implementações independentes, JS e Python, escritas só pela spec: mesmo bit em tudo, e os cinco valores do hash também. **Escrevi no leiame da pasta que isso não basta:** as duas são do mesmo autor, e duas implementações do mesmo autor erram junto. Os `P2` e `P3` refazem, sem um olhar o outro |
| 8 | **O P-001 bate número a número com a pesquisa de 16/09** | `t_i 0.35` · vida `1.209542` · `p0 (0.918092, 2.815465)` · `v0 (18.280924, 110.481766)` · posição `(3.559924, 16.586731)` · ângulo `251.145834` · escala `0.700088`. Conferido depois de calcular, não antes: a pesquisa não foi a fonte, foi a testemunha |
| 9 | **O P-007 dá 6 de 10, e não 5** | `acaso(42, 1, i, 11) < 0.5` escolhe os índices 1, 3, 5, 6, 7, 8. Deixei isso em destaque no leiame porque "probabilidade 0.5" convida a esperar metade exata, e um leitor que arredonde falha |
| 10 | **O executor continua em 71 de 71** | Conferido depois de gravar os oito, não suposto. Há um teste que lê o `conformidade.mjs` e falha se alguém fizer o executor varrer `casos-pendentes/` |

### `P1` — lote 4: o validador confere o `rig` (v17.5)

| # | O quê | O que eu conferi, e o que supus |
|:---:|:---|:---|
| 1 | **Os quatro achados do `B`: confirmados, um a um, no disco** | `RIG_UNMET` só existe em `runtime/src/externos.ts` e no runtime Python — **nenhuma ocorrência** em `site/validador/nucleo.js` nem em `ferramentas/validador/validar.mjs`. O `carregarCorpos` do `validar.mjs` lê só os corpos das chaves `body`. O `rig` no `nucleo.js` aparece só como `rigBones`/`rigSlots` dentro de `temOsso`/`temSlot`, isto é, como exceção da §4.7 |
| 2 | **`RIG_INCOMPLETE`: confirmado, e é pior do que o relato** | Não existe em código vivo nenhum (a única ocorrência no projeto é um **comentário** em `editor/testes/exportar-e-importar.test.ts`). E **não está na tabela da §12.3**, embora a §4.8 o nomeie em letras. Pus a linha na §12.3 |
| 3 | **Um QUINTO achado, que o encargo não listava: `RIG_REFERENCE` também faltava no validador** | A §4.8 e a §12.3 o dão como **L1** (`rig.reference.length <= 0`), e ele só existia nos dois runtimes. É uma linha, a spec o pede em dois lugares, e deixar um L1 conhecido sem conferência seria o mesmo pecado que este lote conserta. Entrou |
| 4 | **Onde eu me segurei: o `RIG_INCOMPLETE` só vale para arquivo carregado como EXTERNO** | A §4.8 diz que um `rig` num esqueleto comum é *"permitido e inerte"* — documentação. Medir "cita menos do que usa" num arquivo solto encheria de aviso todo arquivo que traz a linha do contrato, e aviso que não vale nada é a mesma doença pelo avesso. Num externo não há dúvida: os `bones` locais dele são **ignorados** na importação (§2.8). **Isto é uma escolha minha, não uma linha da spec** — se o Planejador quiser o contrário, é uma condição |
| 5 | **Um falso positivo caçado antes de nascer** | A `rigs/lobisomem-rabo.bone` preenche os slots `rabo` e `rabo_ponta` e não os declara no `rig` — e está **certa**: ela **traz** esses slots (§2.8, "entram no corpo, no fim do array"). A regra só acusa o slot que a pele preenche e **não traz**. Teste para os dois lados |
| 6 | **Nenhum aviso sem os dois arquivos em mãos** | Sem o mapa de externos, ou com um externo que não abriu, o validador **cala**. Não ter o arquivo não é o mesmo que o nome faltar, e um aviso aí seria um palpite — que é o que a regra 21 proíbe |
| 7 | **O que NÃO inventei** | Só as três regras que a §4.8 e a §12.3 nomeiam. Nada de conferir `slot.bone` ou `parent` de osso contra o rig: a §4.8 enumera "os alvos das timelines" e "os slots das skins", e é essa a lista que implementei |
| 8 | **Onde o caso de conformidade ficou** | O item 4 do encargo pede "caso de conformidade que prova o aviso". Os **runtimes já emitem** `RIG_UNMET` (C-275, C-276, C-277, C-279, C-294, C-297 passam nos dois desde o degrau 2): o buraco era só do validador, e caso de conformidade não exercita validador. A prova ficou onde ela morde: `ferramentas/testes/rig-no-validador.test.ts`, com 25 testes, incluindo **a linha de comando rodando de verdade** sobre um par hospedeiro/externo gravado em disco |
| 9 | **O teste foi num arquivo próprio, e não no da parte** | `rig-no-validador.test.ts`, e não `particulas.test.ts`: o assunto é outro, o lote foi acrescentado à cerca depois, e juntar os dois num arquivo só faria o nome mentir |

### `P1` — o `RIG_INCOMPLETE` no arquivo solto (v17.6)

Decisão do Planejador em 18/09, **depois da medição**. A ordem dele: *"não
adivinhe a minha preferência: meça e responda."* Fica escrito o que foi medido,
para ninguém ter de refazer.

| # | O quê | O número |
|:---:|:---|:---|
| 1 | **A medição, antes de escrever uma linha** | `.bone` varridos no projeto (fora `backup/` e `node_modules/`): **110**. Com bloco `rig`: **12**. Acusados pela regra candidata: **ZERO** |
| 2 | **O zero só vale porque a regra pega o defeito** | Uma regra que nunca acusa nada também daria zero. Com o defeito **plantado** — tirar `tronco` do `rig` de `rigs/humanoide-v1-animacoes.bone` sem tirar a timeline que o anima — a conta acusa `tronco`. É o que o chat `B` conferiu à mão, e agora é automático |
| 3 | **O desconto, que é o que mata o falso positivo** | Osso `skinRequired`: descontado (viaja com a pele, §2.8). Slot local: descontado (entra no fim do array do corpo). **Osso comum: NÃO descontado** — os `bones` de um arquivo de animações são ignorados na importação, e é aí que mora o defeito: o arquivo parece são sozinho e chega quebrado no hospedeiro |
| 4 | **Um teste da v17.5 foi reescrito, não apagado** | Ele provava que o arquivo solto era poupado. A decisão mudou, e o teste passou a provar o contrário, com a razão e o número escritos dentro dele |
| 5 | **A medição ficou presa em teste** | Ele varre o projeto e falha dizendo **qual** arquivo, se alguém gravar um `rig` incompleto. Assim o número não envelhece num documento |
| 6 | **O que NÃO mudou** | A regra do arquivo **externo** (v17.5) continua como estava, e ela é mais estrita de propósito: ali sabemos que é um arquivo de animações, então nem os slots locais são descontados. No solto não dá para saber, e o desconto é o conservador |

### Chat `C`, lote 1 — sliders (v18.0, 18/09/2026)

| # | O que supus, ou deixei de fora | Por quê |
|:---:|:---|:---|
| 1 | **Os três programas.** Spriter: **não tem** parâmetro (tem variáveis, em janela à parte do objeto). DragonBones: **não tem**. Spine 4.3: o *Slider* é item de lista, com barra na própria linha e a ficha no painel da direita | Segui o Spine, o único dos três que tem a coisa |
| 2 | A lista de parâmetros ficou **dentro da aba Regras**, e não numa aba nova | Painel novo precisa de linha em `RIGHT_GROUPS` do `ui/layout-model.ts`, que **não é da minha cerca**; e é a regra Comando que lê o parâmetro, então as duas se leem juntas. A medição já acusa altura apertada: uma aba nova custaria mais coluna |
| 3 | A **barra do parâmetro escreve o `default`** (§8.1), e não um valor de sessão | É o que a setup pose usa, então o boneco anda na hora; e com uma animação aberta a mesma escrita vira chave, pela regra dos dois modos, sem caminho novo. A alternativa (escrever em `Skeleton.parameters`) seria apagada pelo `setToSetupPose` a cada pose, e exigiria mexer em `doc/` e `viewport/`, fora da cerca |
| 4 | O alvo com que a regra nasce varia **±30** (giro, passo e inclinação) ou **±0,3** (escala) | Duas chaves **iguais** dariam uma regra válida, rodando e **sem efeito** — o mesmo engano com outra cara. O número aparece no rodapé na hora, aparece escrito em Propriedades e se muda ali: não é palpite silencioso |
| 5 | Os `input` das duas chaves são o `min` e o `max` **daquele** parâmetro, lidos do arquivo | Nada suposto. Fora das chaves a §8.2 manda travar na primeira ou na última |
| 6 | A janela guiada só oferece alvo do tipo **`bone`** | A `ui/dialog.ts` não é da minha cerca e não tem campo de número; `slot`, `morph`, `deform`, `constraint`, `parameter`, `variable` e `nested` continuam editáveis **em Propriedades**, que mostra o que estiver no arquivo. Nenhum tipo desconhecido é escondido: o grupo mostra o `type` que estiver lá |
| 7 | **Renomear parâmetro** ganhou comando próprio (`RenameParameter`) em `rules-model.ts`, em vez de entrar no `panels/rename.ts` | O `rename.ts` é da parte Árvore, fora da cerca desta rodada. O efeito é o mesmo: arrasta `constraint.parameter` e a timeline `parameter` |
| 8 | Mexi em `rules.css` e `properties.css`, que a ficha não nomeia (ela diz `.ts`) | São os CSS dos dois painéis da minha cerca, e nenhum outro chat os toca. Fica dito aqui |
| 9 | O `mode` da constraint **saiu** da tela no modo alvos | §8.2: ele é do **modo contínuo**. No modo alvos quem tem modo é cada alvo. Um campo que não mexe em nada é a mentira mais barata que uma tela conta |
| 10 | **Achado fora da cerca, não consertado:** `npx tsc --noEmit -p editor/tsconfig.json` acusa `runtime/src/attachments/particle.ts(24,15)`, *"Module './sequence.js' has no exported member 'Sequence'"* | É de `runtime/`, da parte `P2`, em obra agora. Subido ao Planejador |


### `P1` — a §14.2: o comparador e o `angle` da partícula (v18.4)

Pedido do Planejador, sobre observação do chat do runtime Python.

| # | O quê | O que eu conferi, e o que escrevi |
|:---:|:---|:---|
| 1 | **O risco é mais concreto do que "alguém pode"** | Conferi o comparador (`ferramentas/src/conformidade/pose-dump.ts`, só leitura — é cerca do `P2`): `ANGLE_FIELDS` é um conjunto de **nomes de campo** (`arotation`, `ashearX`, `ashearY`, `rotation`), e `number()` usa `angleDistance` quando o nome está lá. O campo da partícula se chama `angle`. **Acrescentar `'angle'` a esse conjunto é o gesto mais natural do mundo**, e é exatamente ele que apaga a prova |
| 2 | **Uma correção à premissa do pedido, e ela está escrita na própria §14.2** | O erro de 360° **não** era escondido pelo tamanho da tolerância: ele é 36 000 vezes maior que `1e-2`. Nenhuma tolerância razoável o esconderia. Quem o esconde é a **conta circular**. Escrever na spec que "a folga a mais esconde o erro de 360" seria uma razão que não se sustenta — e spec com razão errada é pior que spec calada, que é justamente o defeito que esta seção conserta |
| 3 | **As duas regras entraram, separadas, porque valem contra coisas diferentes** | A **conta** (diferença simples, nunca circular) contra o erro de 360°. O **tamanho** (`1e-3`, não `1e-2`) contra o erro pequeno e constante que ninguém procura. A §14.2 diz isso em letras, para as duas não serem confundidas depois |
| 4 | **O `1e-3` não é um número inventado: é o que o comparador já aplica hoje** | Campo fora de `ANGLE_FIELDS` e de `MATRIX_FIELDS` cai em `tol.position`, que é `1e-3`. Então a spec passou a **escrever** o que o código já faz — e a dizer por quê, que é o que faltava. Nada mudou de comportamento; o que mudou é que agora está preso |
| 5 | **A razão do mais apertado, para ninguém afrouxar** | Nada acumula: toda saída é conta fechada de um `u` exato de 24 bits, sem passo e sem iteração. O dump arredonda a 6 casas, então dois leitores certos diferem no máximo **um passo de arredondamento** (`1e-6`). O `1e-3` deixa mil vezes de folga |
| 6 | **O que NÃO fiz, e por quê** | Não toquei em `conformidade/casos-pendentes/` (são contrato, e os oito já passam no Python) nem em `ferramentas/src/conformidade/` (cerca do `P2`, que está escrevendo agora). **O guarda de verdade — um teste que afirme que `'angle'` NÃO está em `ANGLE_FIELDS` — mora no arquivo do `P2`**, e subi isso ao Planejador em vez de escrever na cerca alheia |
| 7 | **O que prendi no meu lado** | Dois testes em `particulas.test.ts`: um lê a spec e falha se a §14.2 sumir ou se o `1e-3` virar outro número; outro prova que o P-001 ainda traz `251.145834` e que o valor reduzido dista exatamente 360 dele — o par que faz a regra ter prova, e não só texto |

### Chat `C`, lote 2 — áudio de eventos (v18.5, 18/09/2026)

| # | O que supus, ou deixei de fora | Por quê |
|:---:|:---|:---|
| 1 | **Os três programas.** **Spriter**: o som é um OBJETO próprio, com linha só dele na linha do tempo, volume e panning chaveáveis, e **toca** durante a reprodução. **Spine**: o som fica na **definição** do evento (`audio`, `volume`, `balance`) — de onde a nossa §4.5 veio — e toca quando o cursor cruza a chave. **DragonBones**: tem quadro de som na linha do tempo e **não toca**; só nomeia para o runtime | O formato já escolheu o modelo do Spine (som na definição, §4.5), então a ficha é a do Spine. O modelo do Spriter (som como objeto com linha própria) exigiria campo novo no núcleo — regra 7, não é nossa decisão |
| 2 | A ficha da definição mora **dentro do bloco "Chave de evento"**, que já aparece nos dois painéis (Propriedades e Linha do tempo) | Evento não é selecionável (não há `Selection.events`), e um painel novo precisaria de linha em `ui/layout-model.ts`, fora da cerca. O bloco já tinha o seletor de evento: a ficha entrou embaixo dele |
| 3 | A ficha da definição nasce **fechada** (`<details>`) | A medição de altura já acusa Propriedades faltando 265 px. Fechada, ela custa uma linha; aberta só quando se vai mexer no som |
| 4 | O bloco deixou de ser gatilhado pela animação aberta: passa a aparecer sempre que o arquivo tem evento | O som de um evento é do **arquivo**, não de uma animação. A parte de chavear continua dizendo "abra uma animação" |
| 5 | **O som na linha do tempo é uma LISTA**, e não uma onda desenhada na faixa | A faixa é `panels/dopesheet*.ts`, fora da cerca. A lista sai no mesmo bloco, que o painel Linha do tempo já hospeda: instante, evento, arquivo, e um ▶ por linha |
| 6 | **Não toca durante a reprodução**, só ao clicar | Tocar no cruzamento precisa do `panels/dopesheet-player.ts`, fora da cerca. É o que Spriter e Spine fazem, e fica anotado como o próximo passo desta porta |
| 7 | O **balanço** vai para o arquivo e para a tela, mas o ▶ toca no meio | O `<audio>` do navegador não faz panning sozinho; fazer exigiria WebAudio. Quando o balanço não é zero, o rodapé **diz** que aqui sai no meio e que o número vai para o jogo — não é silêncio |
| 8 | Mexi em `ui/icons.ts`, que não está na lista de arquivos de passagem, para acrescentar o ícone `play` | Só acrescentando, relendo do disco antes. A alternativa era um botão com a letra "O" no lugar do ícone, contra a regra da casa ("botão novo nasce em ícone") |
| 9 | O ▶ lê o arquivo pela pasta aberta do projeto (`io/project-folder.ts` + `io/folder-save.ts`) | `panels/` pode importar `io/` (degrau 3 importa degrau 2, `fronteiras.test.ts`). Nada de `io/` foi escrito |
| 10 | **A §8.6 diz que o runtime NÃO DEVE tocar o áudio**, e ela continua valendo | A leitura mora no painel, não em `runtime/` nem em `anim/`. O runtime entrega o caminho; o editor é o programa de autoria, e nele ouvir é o único jeito de conferir sem abrir o jogo |
| 11 | **Achado, não consertado:** `ferramentas/testes/conformidade.test.ts` (*"--adaptador roda outro runtime"*) fica vermelho na suíte inteira e **verde sozinho**: leva 33 s e estoura o tempo sob carga | É de `ferramentas/`, fora da cerca, e não é quebra — é lentidão. Subido ao Planejador |


### `P1` — as cinco linhas do confronto dos dois runtimes (v18.8)

Decisões do Planejador, tiradas de `documentos/planos/CONFRONTO dos dois runtimes - particulas 2026-09-18.md`. **Eu escrevi, não decidi** — e confiro tudo o que a spec passa a afirmar.

| # | O quê | O que eu conferi antes de escrever |
|:---:|:---|:---|
| 1 | **A §14 contradizia a §14.2, e ninguém tinha visto** | A frase de abertura da §14 ainda dizia *"Tolerâncias: as da §3.6 — posição `1e-3` px, **ângulo `1e-2` grau**"*, enquanto a §14.2 (v18.4) já mandava `1e-3`. Duas frases da mesma spec dizendo números diferentes é pior que uma calada. Corrigi a de cima e há teste que falha se ela voltar |
| 2 | **A razão do `edges`, conferida na fonte** | A §7 do núcleo diz, literalmente: `\| edges \| integer[] \| não \| [] \| Pares de índices. Só editor. \|`. Opcional, padrão vazio, só editor — então um emissor amarrado a ele não emitiria nada num arquivo normal. Há teste que lê essa linha do núcleo: **razão de spec tem de ser verificável, senão é opinião com voz de norma** |
| 3 | **As duas fórmulas do triângulo dão pontos diferentes: medido** | Com os `u3`/`u4` reais do P-001, a de dobrar e a da raiz quadrada caem a mais de 1 px uma da outra num triângulo 10×10. Se dessem o mesmo ponto, a linha 2 seria enfeite — o teste prova que não é |
| 4 | **O efeito colateral da ordem errada do `spherize`: medido, não repetido** | Refiz a conta: na ordem contrária o desvio do leque vira `δ·(1 − spherize)`, e com `spherize: 1` vira **zero** — todas as partículas saem no mesmo ângulo por mais que o autor abra o `spread`. **O meu primeiro teste modelou a ordem errada errada** (somei o leque também no alvo da mistura) e deu verde falso; refiz e ele passou a medir o encolhimento exato |
| 5 | **O exemplo do corte de ciclos: conferido na máquina** | `time 0.1, cycles 5, interval 0.5, D = 1` dá ciclos em `0.1, 0.6, 1.1, 1.6, 2.1`. Em `[0, D)` ficam **dois**; os **três** de fora, deslocados de `−D`, caem em `0.1`, `0.6` e `1.1` — os dois primeiros **em cima** de ciclos da volta atual. A conta do Planejador estava certa, e agora está presa em teste |
| 6 | **A fronteira em símbolos, e a mesma do fluxo contínuo** | A §6 já dava os índices do fluxo contínuo em símbolos (`0 <= i < E(D)`), então a linha da rajada aponta para ela e diz "a mesma fronteira". O caso que separa as duas leituras é o mais banal possível — rajada a cada `0.5` s em animação de `1` s —, e ele está escrito no texto e no teste |
| 7 | **O que NÃO toquei** | `conformidade/casos-pendentes/` (contrato), `ferramentas/src/conformidade/` e `runtime*/` (cerca do `P2` e do `P3`, com o código na mão agora). A ordem é **spec primeiro, runtime depois, caso prende** — ao contrário, conserta-se o caso e perde-se a prova |
| 8 | **Os vermelhos da suíte no fecho NÃO são meus** | Cinco, em `editor/testes/acoes.test.ts`, `menus.test.ts`, `regras.test.ts` e o antigo do manual. Os três primeiros são da cerca do chat `C` (`actions-table`, `menus`, `panels/rules*`), que estava gravando neste minuto — o `tsc` chegou a acusar `rules-physics.ts` e voltou limpo na segunda passada. **Não conferi como "meus" nem os contei como queda:** os meus dois arquivos estão 94 e 32, todos verdes, e a conformidade em 71/71 |

### Chat `C`, lote 3 — física (v18.9, 18/09/2026)

| # | O que supus, ou deixei de fora | Por quê |
|:---:|:---|:---|
| 1 | **Os três programas.** **Spriter**: não tem física nenhuma. **DragonBones**: não tem constraint de física. **Spine** 4.2+: tem o interruptor de física na barra de reprodução (com modos), o reiniciar e o bake de animação | Só um dos três tem a coisa, e a §6.5 é **porte do Spine**: a tela segue o Spine |
| 2 | **Simular** é preferência (`RECORTE_prefs.physicsSim`), e não campo do arquivo | Um `.bone` que carregasse o interruptor mandaria a escolha de quem edita junto com o personagem. Desligar é `active = false` na constraint **viva**, que é o campo que o `skeleton.ts` consulta — nunca `mix: 0`, que mora no arquivo |
| 3 | O vigia do interruptor mora no **documento**, e não no painel | Um painel some quando a aba dele não está à vista, e um `rebuild` monta constraints novas com `active = true`: sem o vigia, acrescentar um osso religaria a física **em silêncio**. Tem teste |
| 4 | O assado grava na **animação aberta**, e recusa com a base aberta | Física assada é chave, e chave é de uma animação. A recusa **fala**, e são cinco frases diferentes (base aberta, nome que não é de física, duração zero, osso que não existe, regra que não escreve em nada) |
| 5 | Assa a **pose aplicada** (§5.2), que é o que a animação pôs **mais** o que a física somou | É o total, e é o que tem de aparecer depois que a simulação se calar. Assar só o desvio da física exigiria somar de novo na leitura, e o formato não tem onde guardar isso |
| 6 | Mede a `fps` do esqueleto (§4.1, padrão 30), do zero para a frente, um quadro de cada vez | É como a §12.4 prova a física. Zera o estado antes de medir: sem isso, apertar o botão duas vezes daria dois assados diferentes — e tem teste disso |
| 7 | A regra assada fica com `mix: 0`, e **não é apagada** | Os catorze campos são o trabalho de quem ajustou o balanço, e reassar depois de mudar um quadro precisa deles. Ligada, o balanço entraria duas vezes: uma pelas chaves, outra pela simulação |
| 8 | A timeline velha daquele osso e daquela propriedade **sai** antes de a assada entrar | Duas timelines do mesmo alvo é L1 (§9.1), e manter a velha embaixo faria o assado depender de qual o leitor aplica por último |
| 9 | Assa **uma regra por vez**, a escolhida na lista | "Assar todas" é gesto que precisa de janela com lista e caixas, e a `ui/dialog.ts` é de outra cerca. O botão pede a regra escolhida e diz isso quando não há uma |
| 10 | Não usei a chave `reset` da §9.8 no botão Reiniciar | O botão é gesto de **tela** (zerar agora, para ver); a chave `reset` é gesto de **animação** (zerar em tal instante, no jogo). São coisas diferentes, e a segunda se chaveia pela linha do tempo, que é de outra parte. Fica anotado |
| 11 | Mexi em `ui/menus.ts` e `ui/actions-table.ts` (passagem, só acrescentando, relendo do disco) e atualizei a contagem em `acoes.test.ts` (199 → 203) e o `parsePrefs` em `tema-e-ficha.test.ts` | Os dois testes provavam o número de antes; foram **reescritos** para provar o de agora, com o motivo escrito ao lado (regra 6) |
| 12 | A física **Global** (vento no esqueleto inteiro) **não entra** | Descartada no `ARQUITETO 2`: é API do jogo, não do editor |


### `P1` — o `startDelay` na rajada, e nas outras duas contas (v19.2)

Decisão do Planejador, sobre achado do chat do runtime Python.

| # | O quê | O que eu conferi |
|:---:|:---|:---|
| 1 | **O relato do Python procede, e é MAIS LARGO do que ele disse** | Procurei `startDelay` na spec inteira: **uma ocorrência**, a linha da tabela de campos da §9.1. **Nenhuma fórmula** o trazia — nem a rajada da §4.3, nem o corte novo da §6, **nem o bloco do fluxo contínuo da §4.2**. O Planejador pediu para eu conferir a §4.2 "se o Python relata que sim": relata, e é verdade |
| 2 | **É a mesma doença da contradição da v18.4** | Uma frase omitindo o que outra manda. Mesmo conserto (a expressão por extenso nas três) e mesmo teste (falha se a forma **curta** voltar a qualquer uma) |
| 3 | **O exemplo, refeito na máquina** | `startDelay 0.3`, `time 0.8`, `D = 1`: com a decisão dá `1.1` e o ciclo fica **fora**; pela letra antiga dá `0.8` e fica **dentro**. As duas leituras dão desenhos diferentes, então a linha não é enfeite |
| 4 | **Os oito casos não separam as duas leituras** | Conferido, e virou teste: todos os oito têm `startDelay: 0`. Se um caso novo mudar isso, o teste cai e avisa que a cobertura mudou |
| 5 | **UMA PERGUNTA QUE EU NÃO DECIDI, e subo em vez de inventar** | A linha diz que o `startDelay` desloca a origem da emissão. Ela **não** diz em que relógio a timeline de `emitting` (e, na 2ª fase, a de `rate`) é lida: no relógio do esqueleto, ou no do emissor (`t − startDelay`)? Com `startDelay: 0` as duas coincidem — e é justamente o caso de todos os oito. Escrevi só o que foi decidido e **não inventei a terceira leitura**; ela fica para o Planejador |
| 6 | **Os vermelhos da suíte no fecho não são meus** | Três, e mudaram de lugar enquanto eu trabalhava (antes eram cinco): o antigo do manual e os do chat `C`, que está gravando. `tsc` limpo, conformidade 71/71, validador 10/10, e os meus 97 verdes |

### Chat `C`, lote 4 — variáveis e etiquetas (v19.3, 18/09/2026)

| # | O que supus, ou deixei de fora | Por quê |
|:---:|:---|:---|
| 1 | **Os três programas.** **Spriter**: tem variáveis (da entidade e do objeto), com linha própria na linha do tempo — é o modelo que a §8.4 cita pelo nome (*"varline do Spriter"*); **não tem tags**. **Spine**: não tem nenhuma das duas; o que chega perto são os eventos com `int`/`float`/`string`, que já temos. **DragonBones**: não tem nenhuma das duas | Seguimos o Spriter na variável, que é de onde a §8.4 veio. Nas etiquetas nenhum dos três serve, e aí vale o pedido dele à letra: declarar, chavear, e poder desligar |
| 2 | ⚠️ **`tag` virou "Etiqueta" na tela, e isso é palavra de tela — a decisão final é do Humberto.** "Marca" já era outra coisa no editor: o marcador da linha do tempo (menu Animação → Marcas, tecla `M`, id `nova-marca`). O id `nova-marca` **já estava tomado**, e o teste de menus acusou | Duas coisas diferentes com o mesmo nome fazem procurar no lugar errado. O `tag` da §8.5 é o nome **novo** na tela, então quem troca é ele — inclusive o rótulo da timeline em `anim/keying.ts`, que dizia "Marcas". **Subido ao Planejador** |
| 3 | O **desligar** esconde a seção mas **nunca em silêncio**: sobra uma linha dizendo que está desligada e, quando o arquivo tem alguma, **quantas** | Um interruptor que faz a coisa sumir sem dizer que existe é o defeito que a Janela de Problemas consertou no degrau 11 — e aqui seria pior, porque o jogo continuaria lendo a variável que a tela escondeu. Tem teste, e tem teste da singular |
| 4 | As **duas metades da §8.5** ficaram separadas: "inteira" (`animation.tags`) e "daqui" (a chave da timeline `tag`) | São caminhos diferentes, e juntá-los num interruptor só faria a tela mentir sobre qual dos dois foi escrito. A lista mostra por extenso **o que o jogo lê agora**, que é a união dos dois (§8.5 `activeTags`) |
| 5 | A chave de etiqueta grava a **lista inteira** daquele instante, e não só a clicada | §8.5: *"cada chave traz `value: string[]`: tags ativas daquele instante até a próxima chave"*. Gravar só a clicada apagaria as outras sem ninguém pedir |
| 6 | Trocar o **tipo** de uma variável leva o padrão junto, e só quando ele deixou de bater | Um `default: 0` dentro de uma variável "Sim ou não" é L1 (§8.4): seria o nosso editor escrevendo um arquivo que o runtime recusa. Um `0` que já era `int` continua `0` ao virar `float`, e o arquivo não muda à toa |
| 7 | Apagar uma etiqueta tira o nome dela de **toda animação e toda chave** | §8.5: *"Tag usada e não declarada: L2"*. Apagar só a declaração deixaria o arquivo acusando um aviso que a nossa própria tela teria criado |
| 8 | As **etiquetas não entraram em `Selection`**, só as variáveis | Uma etiqueta é um nome numa lista e não tem ficha a abrir; cria-se, renomeia-se e apaga-se na própria linha. Uma variável tem tipo e padrão, e esses querem a ficha |
| 9 | `Selection.variables` é opcional, como `parameters` e `pilha` | Um documento de teste que monta a seleção à mão continua sendo uma seleção; quem lê usa `?? []` |
| 10 | A lista passou a ouvir `time` | "Que etiquetas valem daqui em diante" é resposta do **instante**: uma lista que não acompanhasse o cursor mostraria o estado de um tempo que já passou |
| 11 | Os quatro da física e os dois das variáveis viraram **submenus** no Esqueleto | O menu já tem 29 entradas e o teste da casca recusa grupo de mais de seis entre separadores, e nome com mais de 28 letras. "Mostrar variáveis e etiquetas" (29) virou "Mostrar na aba Regras" |
| 12 | **Defeito meu, achado no navegador e consertado antes do fecho:** o `render()` do painel dava `return` quando não havia regra nenhuma, e a seção nova **não aparecia num arquivo novo** | Era o mesmo defeito que este lote existe para consertar — criar e ver sumir. Só apareceu porque conferi na tela, e não só no teste |
| 13 | Reescrevi três testes que provavam o número de antes: `acoes.test.ts` (203 → 209), o `parsePrefs` do `tema-e-ficha.test.ts`, e a suposição de um caso meu sobre a timeline `tag` do herói | Regra 6: teste do jeito antigo é **reescrito**, com o motivo ao lado |


### `P1` — o relógio do `emitting` (v19.5)

| # | O quê | Nota |
|:---:|:---|:---|
| 1 | **A régua entrou junto da decisão, e é ela que vale mais** | *O `startDelay` desloca **nascimentos**, que o programa gera; não desloca **chaves**, que uma pessoa põe à mão.* Com a tabela dos dois lados. É o que evita a décima frase calada quando aparecer o próximo campo animável |
| 2 | **A razão é a regra 21 da casa** | Se a timeline fosse lida no relógio do emissor, mudar o `startDelay` faria as chaves andarem **sem se moverem na tela**: o animador veria a chave onde a pôs e o efeito noutro instante. Programa fazendo uma coisa e mostrando outra |
| 3 | **Dois vermelhos assustaram e não eram meus** | No fecho, `ferramentas/testes/fatiar.test.ts` e `exportar-imagem.test.ts` apareceram vermelhos na suíte cheia. **Eu podia ter sido a causa** — o `fatiar` grava `.bone` e eu mexi no validador —, então fui conferir em vez de supor: rodados sozinhos, **33/33 e 40/40 verdes**. É flutuação de máquina com três chats gravando ao mesmo tempo, e não defeito. Conferir levou um minuto; supor teria custado a rodada |

### Chat `C`, fecho — a barra das Regras (v19.6, 18/09/2026)

| # | O que fiz, e o que deixei de fora | Por quê |
|:---:|:---|:---|
| 1 | **Medi antes de consertar**, no navegador em 1280×720, e achei os mesmos 10 px que a prova acusou (9 aqui, por um pixel de geometria da janela): barra **215 px**, painel 226, sobram 11 px para a lista | Antes de provar que consertou, prove que o defeito existia. Sem a medida de antes, o "cabe" de depois não diria de onde veio |
| 2 | Apertei **só o recheio**, no molde de `.arvore-barra`: `gap` 8→6, `padding` 10→8, botão `min-height` 30 e `padding` 4px 6px, ícone 3px 4px | Precedente da casa, pelo mesmo motivo. Barra **215 → 137 px**, aba passa a caber nas duas telas. Botão de 34 × 38 px, com o ícone de 18 px dentro — acima dos 30 px da Árvore |
| 3 | **Nenhum botão saiu, nenhum nome encurtou, nenhuma dica mudou** | Ordem do Planejador, e régua do Humberto: ícone sozinho não se lê, e esconder função para ganhar número é o oposto do que este degrau fez |
| 4 | A regra é escopada a `.regras .painel-barra` | Nenhuma outra barra do programa muda por causa desta |
| 5 | **Não mexi em Propriedades**, que piorou 25 px | É limite conhecido e escrito desde 13/09, e o que fazer com ela (nome mais curto, coluna mais larga, ou a aba rolar) é decisão do Humberto |
| 6 | **Observação, não ação:** doze botões numa tira só é muito para ler de relance, mesmo cabendo. A Árvore resolveu isso agrupando o criar num **Novo ▾** | Não fiz porque não foi pedido e é mudança de desenho, não de número. Fica escrito para quem pegar a aba depois |


### `P1` — os oito casos novos, P-009 a P-016 (v19.7)

| # | O quê | Nota |
|:---:|:---|:---|
| 1 | **A calculadora de referência foi conferida ANTES de gerar** | A v2 (com `startDelay`, `spherize`, matriz do osso, malha e `sortMode`) reproduz o **P-001 número a número** — `x`, `y`, ângulo e escala exatos. Sem essa conferência, os oito novos seriam oito números sem fiador |
| 2 | **DOIS ERROS MEUS, achados por comparar com a conta à mão** | O P-009 saiu com **5** partículas em vez de 25 (a calculadora cortava os índices negativos do `prewarm`, por um `Math.ceil(E0)` que não deixava passar de zero) e o P-016 com **15** em vez de 10 (eu não limitava os nascimentos ao fim do trecho de emissão). Eu tinha calculado 25 e 10 à mão **antes** de gerar; foi isso que os pegou. **Se eu tivesse escrito o leiame a partir do número gerado, os dois teriam passado** — e seriam dois casos errados servindo de referência a três implementações |
| 3 | **O P-015 tem um `throw` no gerador** | Se as duas malhas com `triangles` em ordens diferentes derem posições diferentes, a geração **falha** em vez de gravar. O caso não pode nascer contradizendo o que ele existe para provar |
| 4 | **Uma ambiguidade que eu NÃO resolvi, e está escrita no leiame do P-014** | O desempate da §7.1 é `(t_i, fluxo, índice)`, e a spec **não diz** em que sentido o `fluxo` desempata quando a ordem é invertida por `oldestInFront`. O caso usa **um fluxo só**, de propósito, para provar o campo sem depender do que a spec não fechou. Se alguém precisar do outro caso, **é linha nova antes de ser caso novo** |
| 5 | **Dois testes reescritos, não apagados** | O que listava "os oito" casos (agora dezesseis) e o que afirmava que nenhum exercita o `startDelay` (agora nomeia **quais** dos novos o exercitam). Os dois diziam a verdade até esta leva existir |
| 6 | **O que cada leiame carrega** | Uma seção *"A decisão que este caso prende"* com o contrafactual — o que aconteceria **sem** ela — e uma *"O que falha aqui"* ligando cada erro de runtime ao sintoma na suíte. Há teste que exige as duas nos oito |
| 7 | **Os números decisivos, todos conferidos** | P-009: `i` de −20 a 4, mais velha em `−0.7`. P-010: 3 ciclos escritos, **2** sobrevivem. P-011: `t = 0.05` com 3 vivas da volta anterior (sem a decisão, **zero**). P-012: **6 das 7** mudam de lugar. P-013: `scale` 2 em todas, e `y/x` na razão 3/2. P-014: ordem exatamente inversa. P-015: `fx` e `fx2` idênticos, 5 arestas. P-016: 10 nascimentos de `0.3` a `0.75` |

### `P1` — o `oldestInFront`, e o erro que ele me fez achar (v19.8)

| # | O quê | Nota |
|:---:|:---|:---|
| 1 | **A décima linha, em símbolos** | `oldestInFront = reverse(youngestInFront)`, com o desempate `(t_i, fluxo, índice)` invertendo nos **três**. Forma curta, como a fronteira `[0, D)`: é o que o próximo leitor copia |
| 2 | **ESCREVER A LINHA ME FEZ ACHAR UM ERRO MEU** | A minha calculadora de referência invertia e **só então** cortava por `maxParticles` — o que guardaria as **mais velhas**, o contrário do que a §7.1 manda. Corrigido, e virou a linha irmã da spec: **o corte vem antes da ordem de desenho**, e são duas etapas decididas em seções diferentes |
| 3 | **O defeito era LATENTE, e é por isso que ele merecia linha** | Só aparece com `oldestInFront` **e** `maxParticles` apertado juntos — o par que **nenhum dos dezesseis casos** tem (o P-014 não tem teto; o P-005 usa o `sortMode` padrão). Regerei os oito e comparei: **nenhum número gravado mudou** |
| 4 | **O que isso ensina, e vale mais que a correção** | Eu escrevi a regra do corte na spec na v17.1 e **achei que a seguia**. Só escrevê-la **por extenso, como sequência**, mostrou que não. É a mesma doença das outras nove — um ponto onde dois leitores atentos fariam coisas diferentes —, só que desta vez o leitor atento que errou fui eu |
| 5 | **O teste mede o defeito com números, não com texto** | Doze vivas, teto de 5, `oldestInFront`: cortar-depois-de-inverter dá `[0, 1, 2, 3, 4]` e o certo dá `[7, 8, 9, 10, 11]`. **Conjuntos diferentes**, não ordens diferentes |
| 6 | **O P-014 não precisou mudar** | Ele prova o campo com um fluxo só, de propósito, porque foi escrito **antes** desta linha. Não dependia dela e não depende agora — que era exatamente a razão de tê-lo escrito assim |

### `P1` — a origem da emissão, o P-017, e o conserto do P-010/P-011 (v20.1)

| # | O quê | Nota |
|:---:|:---|:---|
| 1 | **A frase errada da §4.2 era minha, e a conferi antes de trocar** | Medi as duas contas: a velha nascia em `0.5, 0.55, 0.6, 0.65, 0.7, 0.75` com o `emitting` **fechado**; a nova dá `0.3, 0.35, 0.40, 0.45`, que é o que os dois runtimes deram. Só então escrevi |
| 2 | **A mecânica de trechos NÃO foi tocada**, como o Planejador pediu | `E_k` continua sendo a soma das áreas dos trechos anteriores, e a busca do trecho `k` com `E_k <= i < E_{k+1}` continua palavra por palavra. Acrescentei só a linha que faltava e que a formulação nova já continha: **trecho de taxa zero tem área zero e não consome índice** |
| 3 | **Escrevi POR QUE as três expressões não têm a mesma forma** | Na §4.2 o `startDelay` é a origem de uma **integral**; na §4.3 e na §6 é somado a um instante **escrito pelo autor**. Sem essa tabela, o próximo leitor uniformiza as três e traz o defeito de volta — que é exatamente como ele entrou |
| 4 | **O P-017 mede IDENTIDADE, não contagem** | Conferi: pela conta errada a **contagem é a mesma** nas duas amostras (14 e 15), e só os **índices** mudam (`16..19` em vez de `10..13`). Um caso que conferisse o tamanho passaria os dois. Por isso ele mede índice a índice, e o teste prova que as duas contas dão o mesmo tamanho |
| 5 | **A fronteira do `t = 1.0`: eu medi 15 e o Planejador esperava 14** | Não escolhi em silêncio: gerei as **duas** amostras (`0.99` com 14 e `1.0` com 15) e ia subir a diferença. Ele corrigiu para 15 antes, pelo mesmo motivo — a §5 diz `t_i <= t`. As duas amostras ficaram, e agora a fronteira está **escrita** em vez de implícita |
| 6 | **Os três valores de `E` viraram teste** | `E(0.5) = 10`, `E(0.8) = 10` (**parada**), `E(1.0) = 14`. São o que separa um gerador certo de um errado, e estão no leiame para quem for conferir o seu antes de gravar |
| 7 | **A varredura achou um segundo caso sem animação** | O Python achou o P-011; a varredura que ele me fez fazer achou o **P-010** com a mesma omissão. Consertei **entrada e sonda**, nunca o esperado — os números não mudaram, e conferi isso comparando as amostras antes e depois |
| 8 | **A peneira ganhou o que lhe faltava** | Os meus dois erros anteriores eram de **contagem**, e a conta à mão os pegava. Este era de outra natureza: **a entrada não tinha o que o leiame afirmava que ela tinha**. Entraram três testes sobre os dezessete — sonda em laço exige animação; o `D` do leiame tem de existir na entrada com essa duração; e todo campo do bloco `json` do leiame tem de estar no emissor com o mesmo valor |

### `P1` — os testes seguem os casos, e o P-002 mudo (v20.4)

| # | O quê | Nota |
|:---:|:---|:---|
| 1 | **O conserto pedido era uma linha, e foi uma linha** | `casos-pendentes` → `casos`. A constante mudou de nome junto (`pendentes` passou a mentir). O `rig-no-validador.test.ts` não tinha nenhuma referência: varrido, como o Planejador pediu |
| 2 | **O guarda da 1224 ficou de pé, como ele mandou** | O teste que afirma que o executor não varre `casos-pendentes/` continua valendo **com a pasta vazia** — é ele que impede caso não confrontado de entrar na varredura oficial |
| 3 | **A varredura achou uma frase falsa na spec** | A §14 dizia "os oito casos vivem em `casos-pendentes/`". São dezessete e vivem em `casos/`. Reescrita, com a regra que de facto valeu: **três** fontes independentes, não duas |
| 4 | **E ACHOU UM DEFEITO DE DESENHO MEU: o P-002 passa sem exercitar nada** | Ele é o único de 2ª fase. O anexo tem `rate: 0`, a prova está numa timeline de `rate` que nenhum runtime de 1ª fase implementa, e o esperado é lista **vazia** de propósito. Um runtime de 1ª fase produz zero partículas, bate com a lista vazia e **passa**. Enquanto a 2ª fase não abrir, **`P: 17/17` quer dizer dezesseis provas e um caso mudo** |
| 5 | **É a terceira cara da regra 21, e desta vez veio do desenho do caso** | *A prova dizendo que está tudo bem quando não olhou.* Eu escrevi a lista vazia de propósito e disse isso no leiame — mas não previ que "passar" seria depois **contado como prova**. O leiame dele diz em maiúsculas "Não mova este caso para `casos/` antes disso", e ele foi movido |
| 6 | **O que eu fiz, e o que NÃO fiz** | Escrevi a ressalva na §14 e prendi por teste, para ninguém ler o `17/17` como dezessete. **Não movi o P-002 de volta:** quem move casos é o Planejador, e ele está com a bateria de fecho rodando. A recomendação subiu a ele |
| 7 | **Os 17 leiames ainda dizem "Estado: pendente"** | Ficou stale com a mudança de pasta. Os casos `C-*` ganharam, ao serem movidos, uma linha "Entrou em `casos/` em …". Ofereci fazer o mesmo nos dezessete; é convenção de quem move, e não toquei sem a palavra dele |

### `P1` — a linha de onde cada caso mora (v20.6)

| # | O quê | Nota |
|:---:|:---|:---|
| 1 | **O teste passou a afirmar a PASTA, e não só a existência** | `casos/` é o que a suíte oficial varre; `casos-pendentes/` é o que ela não varre. Um caso na pasta errada ou não é provado, ou é **contado como prova sem ser uma**. Três listas: `TODOS` (17), `PROVADOS` (16) e `MUDOS` (o P-002) |
| 2 | **A leitura resolve as DUAS pastas** | Um `ondeMora(nome)` que procura nas duas e estoura se não achar em nenhuma. Sem isso, mover um caso quebra o arquivo de teste inteiro — que é o que acabou de acontecer duas vezes hoje |
| 3 | **A linha dos dezesseis segue a convenção dos `C-*`** | *"Entrou em `casos/` em 18/09/2026…"*, com um acréscimo que os `C-*` não tinham: **três** fontes independentes, e não duas |
| 4 | **No P-002, o contrário, com data e motivo** | Que ele esteve em `casos/` por engano e voltou no mesmo dia; que **passar não é provar**; e **o que precisa acontecer para ele subir** — o ramo `linear` da §4.2 em serviço, `rate` animável, o esperado preenchido. A razão, do Planejador: um caso promovido uma vez por engano é candidato a sê-lo de novo pelo mesmo engano |
| 5 | **Uma fragilidade que fica escrita** | Os leiames dos dezessete são gerados por scripts que moram no **scratchpad**, fora da pasta do projeto. A linha "Onde este caso mora" foi posta **nos arquivos**, como nos `C-*` — se alguém regerar os casos a partir do scratchpad, ela se perde. Há teste que cai se isso acontecer, e é o aviso |
| 6 | **O número honesto** | `P: 16/16`, e não `17/17`. A §14 diz quantos entraram, quantos não, e que **quem mover o P-002 antes da 2ª fase repõe o número que mente** |
