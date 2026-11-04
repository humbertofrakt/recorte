# PLANO — peças e mechas: como as animações se conectam

Data: 10/09/2026. Escrito pelo planejador.

Pedido do Humberto, nas palavras dele:

> "planeje como as animações vão se conectar": espada que vira motosserra,
> cabeça que vira capacete, capa que vira asa ou pernas de aranha.
> "tenho uma animação bem trabalhada e um milhão de mechas montados. quero usar
> esses mechas como skin. quero aproveitar a animação base."

Estado na hora: **v6.3, 2.120 testes**. O formato do socket está pronto desde
a v3.5. O runtime do socket está **parado por ordem dele** (pendência 9,
"primeiro vamos finalizar o programa"). Este plano fica na gaveta até ele liberar.

---

## 0. A resposta em seis linhas

| # | A resposta |
|:---:|:---|
| 1 | Uma **peça** é um `.bone`. Motosserra, capacete, asa, perna de aranha: tudo peça. |
| 2 | A peça se conecta ao personagem por **quatro laços**: lugar, tempo, desenho, dados. |
| 3 | Três laços já estão no formato desde o lote socket. Falta o **runtime**. |
| 4 | O milhão de mechas tem **dois caminhos**. Os dois usam a animação base **sem tocar nela**. |
| 5 | Faltam **6 decisões** suas, todas pequenas, e **uma ferramenta** de vestir. |
| 6 | Nenhum tipo de anexo novo. Nenhuma timeline nova. Só o `rig` cresce. |

---

## 1. Os quatro laços

Toda conexão entre uma peça e um personagem responde a quatro perguntas.

| Laço | A pergunta | Como o formato responde | Formato | Runtime |
|:---|:---|:---|:---:|:---:|
| **Lugar** | Onde a peça pendura? | `socket` do pai ↔ `childSocket` da peça (§7.9, §7.11). Nome com nome. | pronto | falta |
| **Tempo** | Como ela se move? | Três canais: **responde** (`inheritAnimation`), **fundo** (`baseAnimation`), **mandado** (chaves `nested`) | pronto | falta |
| **Desenho** | O que ela esconde? Onde é desenhada? | Pele com `null` esconde. O slot dá a ordem. | pronto, com um buraco | falta |
| **Dados** | O que ela sabe do personagem? | Nada. Parâmetro e variável não atravessam o arquivo. | **falta** | falta |

O buraco do desenho: uma peça é desenhada **inteira** num lugar da ordem.
Perna de aranha tem quatro atrás do corpo e quatro na frente. Seção 2.3.

---

## 2. Os três exemplos, um por um

### 2.1 Espada → motosserra

| Parte | Como fica |
|:---|:---|
| O arquivo | `motoserra.bone`. Publica o socket `empunhadura`. Animações: `girar` (laço) e `attack`. |
| Pendurar | Pele `motoserra`: anexo `skeleton` no slot `weapon`, `socket: mao_direita`, `childSocket: empunhadura`. |
| Roda sempre | `baseAnimation: "girar"`. A corrente gira com o personagem parado. |
| Responde | `inheritAnimation: true`. O personagem toca `attack`; a motosserra toca o `attack` dela, no relógio dele. |
| O jogo vê | Evento `weapon/hit`. Caixa `weapon/lamina` no canal `boxes`, com o prefixo da §12.4. |
| Trocar em jogo | Ativar a pele `motoserra`, **ou** a API `pendurar(slot, uri, opções)` (lote R2). |

**A armadilha.** O `attack` do personagem dura 0,6 s. O da motosserra dura
0,4 s. Pela §9.10, depois da última chave vale a última chave: a motosserra
termina o golpe e **espera** 0,2 s. Não é erro. Mas quem faz a peça precisa
saber os nomes e as durações do personagem. Hoje isso não está escrito em lugar
nenhum. **Decisão 1.**

### 2.2 Cabeça → capacete

**Já existe.** `capacete.bone` entra no slot `head` pela pele
`mecha-pele-inverno.bone`. Troca a cabeça inteira.

A variante "capacete **por cima** da cabeça", sem tirar a cabeça, precisa de um
slot vago no osso `head`. O personagem tem que ter esse slot de antemão. É o
modelo do Dota 2: cada herói tem os encaixes fixos (cabeça, ombro, arma,
costas). Vira **slot reservado** da família de rig. Seção 3.1.

### 2.3 Capa → asa ou pernas de aranha

A capa do herói é: dois ossos (`cape1`, `cape2`), dois slots, uma regra de
caminho. Tirar a capa é a pele pôr `null` em `cape_upper` e `cape_lower`. Os
ossos e a regra continuam rodando, invisíveis. Custo zero que importa.

| Problema | Resposta | Novo? |
|:---|:---|:---:|
| A asa bate sozinha | `asas.bone` no socket `costas`. `baseAnimation: "planar"`. | não |
| A asa responde ao pulo | `inheritAnimation`. A asa tem `jump` e `fall` com os nomes do personagem. | não |
| As pernas andam junto | `inheritAnimation`. A peça tem `walk`. Mesmo nome, **mesmo relógio**: sincroniza sozinho. | não |
| Os pés ficam no chão | Pendurar no socket do **`root`**, não do `hips`. O quadril sobe e desce; o root não. O balanço vem da animação da própria peça. | não |
| Quatro atrás, quatro na frente | **Duas peças**: `aranha-tras.bone` em `costas_tras`, `aranha-frente.bone` em `frente_baixo`. As duas respondem ao mesmo `walk`, no mesmo relógio: sincronizadas por construção. | **Decisão 2** |
| O quadril ainda anda como gente | O pacote aranha traz também um `walk_aranha` **para o personagem**. Um arquivo só, listado em `assets.animations` **e** em `assets.skins`. O jogo toca `walk_aranha`. | não |

---

## 3. O milhão de mechas

O que o Dota 2 faz: **um** esqueleto por herói, e cada cosmético é uma malha
presa aos mesmos ossos, num slot fixo. O que o Mixamo faz: você traz um modelo
**diferente**, ele encaixa um esqueleto padrão dentro e toca animação pronta.

Em 2D por recorte, a imagem é a malha e o osso é a junta. Os dois modelos
existem, e servem para coisas diferentes.

| | **Caminho A — o mecha é uma PELE** | **Caminho B — o mecha é um ESQUELETO** |
|:---|:---|:---|
| Modelo | Dota 2 | Mixamo |
| O mecha traz | imagens, uma por slot | ossos próprios **e** imagens |
| Proporção | fixa: a da família | livre: braço mais longo, quatro braços, esteira |
| A animação base | intocada, **uma só**, no template | intocada, chega por `assets.animations` |
| Quando não bate | imagem maior que o osso: estica ou avisa | translação em pixel não bate: **decisão 3** |
| Misturar partes | **sim**: cabeça de A, braços de B. Várias peles ativas, §4.4 | não: um mecha é um todo |
| Custo por mecha | um `.bonez` pequeno: pele + atlas | idem, mais os ossos |
| Formato | nada novo | um campo no `rig` |
| Falta | template, ferramenta de vestir, runtime | runtime, régua de proporção |

**Recomendação: os dois.** O caminho A para o milhão. O caminho B para os
mechas fora do padrão. A animação base é a mesma nos dois, e ninguém a copia.

### 3.1 A família de rig: o template

Hoje o contrato `rig` é uma lista de nomes. A família precisa ser um
**arquivo**: `formato/rigs/humanoide-v1.bone`. Sem arte. Com:

| O que | Para quê |
|:---|:---|
| Ossos com **comprimento** | a régua do caminho A, e a referência do caminho B |
| Sockets publicados | `mao_direita`, `mao_esquerda`, `cabeca`, `costas`, `root` |
| **Slots reservados**, vazios | `arma_d`, `arma_e`, `cabeca_acessorio`, `costas_tras`, `costas_frente`, `frente_baixo` |
| **Vocabulário** de animação | `idle 2,0 s`, `walk 1,0 s`, `run 0,6 s`, `jump`, `fall`, `attack 0,6 s`, `hit`, `die` |
| As animações base | as que o Humberto já tem, bem trabalhadas |

Todo mecha e toda peça grava `rig.name: "humanoide-v1"`. O validador confere.
O editor abre o template como ponto de partida. **Decisão 6.**

### 3.2 A régua de proporção — decisão 3

Rotação viaja de graça: 30° é 30° em qualquer braço. **Translação não.** O
`walk` de `mecha-animacoes.bone` sobe o quadril de 90 para 94 px. Num mecha de
400 px o balanço fica pela metade.

| Opção | Como | Contra |
|:---:|:---|:---|
| a | Nada. Regra de estilo: animação base só com rotação. | Quadril, IK e alvo de mão são translação. Não dá. |
| **b** | `rig.reference: { bone, length }` no arquivo de animação. Fator = comprimento do osso no hospedeiro ÷ `length`. Multiplica as timelines `x` e `y` de osso. **Um fator por arquivo.** | Um campo novo no `rig`. |
| c | Fator por osso: cada osso escala pelo próprio comprimento. | Frágil. Nenhum programa 3D faz assim para o root. |

**Recomendo b.** É o que o retarget 3D faz com a altura do quadril. Caso de
conformidade `C-280-retarget-translacao`: o mesmo `walk` em dois hospedeiros,
um com `torso` de 70 e outro de 140, e o `hips.y` sai 94 num e 98 no outro.

### 3.3 Vestir: da arte ao mecha

É a metade "auto-rig" do Mixamo, em 2D. Uma **convenção** e uma **ferramenta**.

| Camada no PSD | O que é |
|:---|:---|
| `braco_d` | a imagem da peça, com o nome do slot |
| `braco_d.a` | um ponto: onde a junta **começa** |
| `braco_d.b` | um ponto: onde a junta **termina** |

`ferramentas/vestir.mjs`, entrada: template + PSD. Duas saídas:

| Saída | O que faz |
|:---|:---|
| `--pele` | Caminho A. Gira e desloca a imagem para `a` cair na origem do osso e `b` na ponta. Se `ab` ÷ comprimento do osso sair de 0,8 a 1,25, **avisa**, e escala. |
| `--esqueleto` | Caminho B. Cria o osso de `a` a `b`, com esse comprimento. Puxa as animações da família. |

Sem os pontos: o centro da imagem cai no meio do osso, e a ferramenta avisa.
Prova: `montar-psd.mjs` gera o PSD do herói **com os pontos**; vestir devolve o
herói; `conferir-arte.mjs` mede **0 px**.

### 3.4 Partes que a família não tem: rabo, quarto braço

A regra da §2.8: animação local com o mesmo nome **substitui** a externa
inteira. Um mecha com rabo não pode ter um `walk` local só do rabo.

| Opção | Como |
|:---:|:---|
| **tracks** | O jogo toca `walk` externo na faixa 0 e `rabo_walk` local na faixa 1. O `AnimationState` já faz isso hoje. |
| campo | `animation.over: "walk"`: a local se aplica **por cima** da externa. |

**Recomendo tracks agora.** O campo vai para o Apêndice B. **Decisão 4.**

### 3.5 Um milhão de verdade

| Cuidado | Regra |
|:---|:---|
| Não listar um milhão em `assets.skins` | O jogo carrega a pele externa **por API**, na hora, com as mesmas regras da §2.8. Lote R2. |
| Um atlas por mecha | Cada mecha é um `.bonez` com o atlas dele. O atlas do template é um só, compartilhado. |
| Resolver nome uma vez | §4.4 já manda. Trocar de mecha não custa por quadro. |
| Medir | Teste do R2: mil peles carregadas e trocadas, tempo por troca escrito no relatório. |

---

## 4. O quarto laço: dados — decisão 5

O jetpack quer a velocidade do personagem para o tamanho da chama. A asa quer
saber se está no ar. Hoje a peça não sabe nada.

| Opção | Como | Quando |
|:---:|:---|:---|
| **API** | `filho(slot).setParameter("forca", v)`. O jogo faz a ponte. | **agora**, lote R2 |
| campo | `skeleton.parameters: { "forca": "speed" }` no anexo: o runtime copia o valor do pai para o filho a cada quadro. | Apêndice B |

**Recomendo a API.** O campo é elegante, mas é o Humberto quem decide o que um
leitor precisa conhecer.

---

## 5. As seis decisões do Humberto

Regra 7 da casa: campo novo no núcleo é decisão dele.

| # | Decisão | Recomendo | Alternativa | Custo |
|:---:|:---|:---|:---|:---|
| 1 | `rig.animations: [{ name, duration }]`: o vocabulário. A peça diz a que responde; o personagem diz o que toca. O validador avisa nome sem par. | **sim** | deixar na documentação | 1 campo no `rig` |
| 2 | Frente e trás: duas peças, ou campo `layer` no filho | **duas peças** | `layer` no Apêndice B | zero |
| 3 | Régua de proporção: `rig.reference { bone, length }` | **sim** | animação só com rotação | 1 campo, 1 caso |
| 4 | Parte extra: tracks, ou `animation.over` | **tracks** | `over` no Apêndice B | zero |
| 5 | Dados: API, ou `skeleton.parameters` | **API** | campo no Apêndice B | zero no formato |
| 6 | Template publicado com a spec, em `formato/rigs/`, §14.5 | **sim** | só exemplo | 1 arquivo |

Com as seis como recomendadas: **dois campos** no `rig`, **zero** fora dele.

---

## 6. Os lotes, na ordem

Cada sub-lote: backup datado → editar → `npx vitest run` → `npx tsc --noEmit -p editor/tsconfig.json` → `node ferramentas/conformidade.mjs` → `python ferramentas/versao.py N.N "..."` → linha no `INDICE.md` e no `CHANGELOG.md`.

| Lote | Nome | Entrega | Prova | Pronto quando |
|:---:|:---|:---|:---|:---|
| **R1** | Runtime do socket | Já ordenado no `ESTADO.md`: prefixo `<slot>/` no dump; socket; dois canais; `assets.animations` e `assets.skins`. Nos **dois** runtimes. | C-270 a C-279 saem de `casos-pendentes/` | 56 de 56 nos dois runtimes, concordando campo a campo |
| **F1** | Formato: as decisões | Decisões 1, 3 e 6 na spec, no schema, no validador. `formato/rigs/humanoide-v1.bone`. Exemplos: `motoserra.bone`, `asas.bone`, `aranha-tras.bone`, `aranha-frente.bone`, `mecha-grande.bone` (torso 140). Apêndice B com as decisões 2, 4 e 5. | C-280 retarget; C-281 vocabulário sem par; validador confere `rig.name` | `validar --todos` limpo; casos verdes nos dois runtimes |
| **R2** | API de vestir e pendurar | `pendurar(slot, uri, opções)`, `vestir(uri)` em jogo, `filho(slot)`, régua de proporção aplicada. O `heroi.bone` passa a pendurar a espada **por socket**. | Teste de mil peles; `aninhado.test.ts` refeito | Motosserra, asa e aranha rodando no visualizador, PNG de prova de cada um |
| **T1** | Ferramenta vestir | `ferramentas/vestir.mjs`, `--pele` e `--esqueleto`, pontos `.a` e `.b`. `montar-psd.mjs` grava os pontos. | Volta do herói: **0 px** | `npm run vestir` no `package.json` e no `leiame.md` |
| **E1** | Editor | Peles: **várias visíveis** de uma vez; **Pele de fora…** e **Animações de fora…** no menu Arquivo, com ícone de "vem de fora" na lista; **Novo → Esqueleto** no slot; campo **Socket** no painel do ponto; painel **Contrato** listando cada `RIG_UNMET`; assistente **Vestir…** (template + PSD). | Testes sem navegador, como sempre | Manual: capítulo **Peças e mechas**, nas duas línguas; `hiddenFunctions` vazia; `auditMenus` vazia |

Ordem: **R1 → F1 → R2 → T1 → E1.** R1 não depende de decisão nenhuma. F1
espera as seis respostas. Os outros esperam F1.

---

## 7. O que não fazer

| Não | Por quê |
|:---|:---|
| Copiar a animação base para dentro de cada mecha | Um milhão de cópias. Corrigir uma chave vira um milhão de correções. |
| Tipo de anexo novo ("peça", "acessório") | `skeleton` já é a peça. Regra 7. |
| Retarget por osso | Frágil. Um fator por arquivo, como o 3D faz. |
| Misturar a ordem de desenho do filho com a do pai | Duas peças resolvem. Misturar quebra a regra "o filho é um bloco" da §7.11. |
| Pendurar as pernas de aranha no quadril | Sobem e descem com ele. Pendura no `root`. |

---

## 8. A prova de cada exemplo

| Exemplo | Caso | O que se mede |
|:---|:---|:---|
| Motosserra parada, girando | C-274 | `weapon/corrente.rotation` anda com o personagem em `idle` |
| Motosserra no golpe | C-273 | `weapon/lamina` sobe no `attack`, no relógio do pai |
| Capacete de fora | C-277, C-279 | `head/viseira` existe no dump com a pele `inverno`; some sem ela |
| Asa no pulo | C-273 | `costas/asa_d.rotation` muda entre `idle` e `jump` |
| Aranha atrás e na frente | novo | dois filhos, mesmo `walk`, `aranha-tras/perna1` e `aranha-frente/perna5` na mesma fase |
| Mecha grande, mesmo `walk` | C-280 | `hips.y` 94 no pequeno, 98 no grande |
| Mil peles | teste do R2 | tempo por troca, e a memória não cresce por quadro |

---

## Desvios

| O plano dizia | O código pediu | O que ficou |
|:---|:---|:---|
| | | |
