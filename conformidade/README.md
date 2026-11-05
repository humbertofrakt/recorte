# Suíte de conformidade do formato `.bone`

Esta pasta é o que separa uma especificação de um **padrão**.

Qualquer pessoa pode escrever um runtime `.bone` na linguagem que quiser. A
suíte é como essa pessoa **prova** que o runtime está certo — e como você
descobre que o seu não está.

Mesmo papel dos testes de conformidade do navegador para o HTML.

---

## Como rodar

Da raiz do projeto:

```
node ferramentas/conformidade.mjs
```

Sai uma tabela:

```
Caso                           Nível  Resultado  Maior diferença
-----------------------------  -----  ---------  ---------------
A-010-heranca-cinco-modos      A      passou     nenhuma
A-011-shear                    A      passou     nenhuma
...
71 de 71 passaram.   A: 13/13   B: 7/7   BIN: 1/1   C: 44/44   X: 5/5   ZIP: 1/1
```

**05/10/2026 (v27.7): 104 de 104** nos dois runtimes — `A 13/13 · B 7/7 · BIN 1/1 · C 57/57 · P 19/19 · X 6/6 · ZIP 1/1`. Os 14 casos `C-263`, `C-310` a `C-321` e `X-307` saíram de `casos-pendentes/` para `casos/`; lá ficou só o `P-002`. `node ferramentas/comparar-runtimes.mjs`: 104 de 104 concordando campo a campo.

**05/10/2026, noite (v28.8): 120 de 120** nos dois runtimes — `A 13/13 · B 7/7 · BIN 1/1 · C 63/63 · P 28/28 · X 7/7 · ZIP 1/1` (20:58). Na v28.4 entraram `P-021` a `P-026` (a forma `path` da extensão de partículas 1.1): 110. Na v28.8, os 10 casos da rodada 34 (`C-264`, `C-322` a `C-326`, `P-027` a `P-029`, `X-308`), escritos à mão pela spec por quem não escreveu runtime: três derrubaram o TypeScript (C-324, C-326, P-029) e dois o Python (C-326, P-027), e foram consertados. `node ferramentas/comparar-runtimes.mjs`: **120 de 120 concordando campo a campo**. Em `casos-pendentes/` ficou só o `P-002`. **O leitor do Godot dá 119 de 120** até copiar o conserto do C-326 do Python.

**05/11/2026: 135 de 135** nos dois runtimes — `A 14/14 · B 9/9 · BIN 1/1 · C 66/66 · P 32/32 · X 11/11 · ZIP 2/2` (01h UTC). O `P-002` (taxa em rampa) saiu de `casos-pendentes/`: a 2ª fase de `rate` abriu (`BONE_particles` 1.2, §4.2), o esperado foi preenchido por conta à parte, e os dois runtimes passaram. `node ferramentas/comparar-runtimes.mjs`: **135 de 135 concordando campo a campo**. O pacote do Construct: 135 de 135. Entraram também, escritos pela spec: `A-032` (dark color), `B-120` (tags), `B-121` (variáveis), `C-330` (parâmetro e driver), `C-331` (driver contínuo e `source`), `C-332` (driver em parâmetro, variável e constraint), `X-309` (BOM na leitura), `X-310` a `X-312` (fallbacks da §2.5: driver, parâmetro, `sequence.mode`, `atlas.region.rotation`), `ZIP-502` (o `main` numa subpasta), `P-030` (rampa com torneira), `P-031` (dois emissores no mesmo slot) e `P-032` (`space` e `sortMode` desconhecidos) — quatro deles derrubaram alguém (B-120 o Python; P-030 e P-031 o TypeScript; X-309 o executor da suíte), consertados. **`casos-pendentes/` está vazia.** O leitor do Godot ainda recusa o `rate` animado: reprova P-002, P-030 e B-120 até copiar os consertos do Python.

O programa sai com código diferente de zero se algum caso falhar.

### Opções

| Opção | O que faz |
|:---|:---|
| `--caso NOME` | Roda só um caso. Pode repetir. |
| `--nivel A` | Roda só os casos de um nível. Pode repetir. |
| `--json` | Imprime o relatório em JSON, para máquina. |
| `--gerar` | Regrava os `esperado.json` a partir do runtime atual. |
| `--adaptador CMD` | Roda contra outro runtime, e não contra o de referência. |
| `--casos PASTA` | Usa outra pasta de casos. |
| `--ajuda` | Mostra a ajuda. |

---

## Os níveis

Um leitor declara **um** nível. Cada nível inclui o anterior.

| Nível | Nome | O que o leitor tem que aguentar |
|:---:|:---|:---|
| **A** | Básico | Cabeçalho, versões, fallbacks, caminhos, `.bonez`, ossos com herança, slots, `region`, skins, atlas, timelines de osso, slot, `drawOrder` e evento, curvas. |
| **B** | Malha | Tudo de A, mais `mesh`, pesos, `linkedmesh`, `boundingbox`, `clipping`, `point`, `sequence`, `deform`, variáveis, tags e o binário `.boneb`. |
| **C** | Completo | Tudo de B, mais todas as constraints, `path`, esqueleto aninhado, parâmetros, drivers, morphs e as timelines que faltam. |

Além desses, existe uma categoria que **não é opcional em nível nenhum**:

| Prefixo | O que é |
|:---:|:---|
| **X** | Compatibilidade. Arquivo mais novo, propriedade desconhecida, tipo desconhecido, extensão exigida que o leitor não conhece. Todo leitor, de qualquer nível, tem que passar em todos. |
| **BIN** | A embalagem binária `.boneb`. Exigida para o nível C. |
| **ZIP** | O pacote `.bonez` e o manifesto. Exigido para o nível C. |

Um arquivo que usa um nível acima do leitor **ainda abre**. As partes que o
leitor não conhece somem, e o resto funciona. É isso que os casos X medem.

### Os casos pendentes — `casos-pendentes/`

**Vazia desde 17/09/2026, fim da tarde.** Os 18 casos que moravam aqui
entraram em `casos/` no fecho da rodada dos degraus 2 e 3: os dois runtimes
passaram e o confronto campo a campo não achou diferença. O que segue é a
história de como eles chegaram lá, e a regra continua valendo para o próximo
caso que chegar antes do runtime.

Um caso **completo** (entrada, esperado conferido à mão, leiame com a conta)
que o runtime de referência **ainda não passa** mora em `casos-pendentes/`.
O executor não varre essa pasta, e o teste `ferramentas/testes/conformidade.test.ts`
tampouco. É o meio-termo entre duas regras que brigam: a §12.8 diz que recurso
sem caso não entra na spec, e o teste diz que todo caso em `casos/` tem que
passar.

| Caso | O que prende | Espera |
|:---|:---|:---|
| `C-270-aninhado-basico` | a entidade: matriz da raiz do filho pela imagem, canais prefixados `<slot>/`, evento `weapon/disparo` | prefixo no dump |
| `C-273-espelha-animacao` | `inheritAnimation`: o pai toca `attack`, o filho toca o `attack` dele | dois canais |
| `C-274-animacao-de-fundo` | `baseAnimation` continua com o relógio dele por baixo de uma troca `nested/animation` | dois canais, duas camadas |
| `C-275-animacoes-externas` | `assets.animations` traz `walk` pelo nome | loader de externos |
| `C-276-rig-nao-atendido` | `rig` pede osso que não existe: L2, o resto roda | idem |
| `C-277-skin-externa` | `assets.skins` traz `inverno` pelo nome, com a pilha só com `inverno`; a geometria denuncia | idem |
| `C-279-externa-local-ganha` | animação local com o mesmo nome da externa: a local vale | loader de externos |

Os sete acima foram **refeitos sem socket em 17/09/2026** (degrau 1 do
`documentos/planos/ARQUITETO 4`): a entidade segue a imagem (spec §7.11). Os
três casos que só existiam por causa do socket — `C-271-socket-encaixe`,
`C-272-socket-ausente` e `C-278-espelha-sem-par` — foram **apagados** no mesmo
dia. É a única vez em que a suíte perdeu caso, e está escrita: o recurso que
eles provavam saiu do formato (spec Apêndice A, 62 e 72). As versões com socket
estão em `backup/degrau-1_2026-09-17_antes/casos-pendentes/`.

Quando os **dois** runtimes passarem num caso, ele é **movido** para `casos/`
no mesmo lote, e o total da suíte sobe.

**Os casos do rascunho 0.2**, escritos no degrau 0 (17/09/2026), com o
esperado calculado por **duas contas independentes** no `leiame.md` de cada um
(a geométrica e a das matrizes da §5.4), sem rodar runtime nenhum:

| Caso | O que prende | Spec |
|:---|:---|:---|
| `C-290-virada-corte-seco` | a timeline `body`: antes da chave vale o arquivo; as linhas casam por nome com o corpo do instante; a base é a do corpo vivo | 9.13 |
| `C-291-virada-em-laco` | `t mod duration` antes de `corpoEm`: em 1,25 s o homem de novo | 9.13, 9.11 |
| `C-292-virada-e-entidade` | a espada continua no slot de mesmo nome, com o relógio sem zerar; some no corpo que não tem o slot | 9.13, 7.11 |
| `C-293-virada-e-pilha` | `keepSkins`: a pilha passa (a de cima vence no corpo novo) ou o corpo entra só com `default` | 9.13, 4.4 |
| `C-294-pele-externa-com-osso` | a pele de fora traz o osso `rabo`, o slot no fim da ordem, a região girada | 2.8, 7.1 |
| `C-295-desenho-troca-de-osso` | `slot/bone` com `transform`: `T` antes de `R`; o dump de `slots` ganha `bone` | 9.5 |
| `C-296-pesos-animados` | `weights`: o vértice é a média das duas contribuições em 0,5 s | 9.6, 7.4 |
| `C-297-retarget-translacao` | `rig.reference`: `k = 2` multiplica `x` e `y` da animação de fora, não a rotação | 2.8, 4.8 |
| `C-298-pilha-sem-default` | a `default` só está ativa se estiver na pilha: um slot que só ela veste fica vazio com a pilha `["armadura"]` | 4.4 |
| `C-299-fundo-comeca-na-chave` | o relógio do filho (e o do fundo, `baseAnimation`) começa na chave `slot/attachment` que o mostra, achado sem estado | 7.11, Ap. C 1 |
| `C-300-evento-do-filho-no-relogio-do-pai` | o `time` do evento do filho no dump é no relógio do pai, com `timeScale` 2 | 7.11, Ap. C 6 |

Mais três, escritos durante a rodada: `C-298-pilha-sem-default` (a `default`
fora da pilha, §4.4), `C-299-fundo-comeca-na-chave` e
`C-300-evento-do-filho-no-relogio-do-pai` (o relógio do filho, Apêndice C 1 e
6 — os dois runtimes tinham lido a spec de jeitos diferentes, e o caso decidiu).

**Todos entraram em `casos/` em 17/09/2026**: TypeScript v13.7 e Python v13.4
(escrito só pela spec) passam nos 71, e `node ferramentas/comparar-runtimes.mjs`
dá 71 de 71 concordando campo a campo.

**05/10/2026 (v27.7):** os 14 casos `C-263`, `C-310` a `C-321` e `X-307` entraram em `casos/`. Os dois runtimes passam nos **104**, e o confronto dá **104 de 104** concordando campo a campo.

**O validador já os entende.** Desde o degrau 1 (17/09/2026), `npm run validar`
aceita `body`, `weights`, `slot/bone` com `transform`, `animation.crop` e
`rig.reference`, e aplica as duas exceções da §4.7: um nome que vem do `rig`,
e um nome que existe num corpo citado por uma chave `body` (o validador abre o
corpo, do disco ou de dentro do `.bonez`). O que ele ainda não faz é **rodar** a
pose; isso é do runtime.

### O que "71 de 71" NÃO quer dizer

Esta é a parte honesta, e ela vem antes de qualquer número.

Um número de casos **não é uma promessa de cobertura**. Hoje, nenhum caso
exercita: `boundingbox`, `clipping`, `tag`, `variable`, `parameter`, `driver`,
`darkColor` nem `blend` — e a tabela de níveis acima promete vários desses.
Quatro canais da sonda (`boundingBoxes`, `tags`, `variables`, `parameters`)
não são medidos por caso nenhum. (Desde 17/09/2026 o `skeleton` aninhado, o
`point` e o canal `points` **são** medidos: C-270 e os casos da virada.) Falta também um `.bonez` com o `main` numa subpasta, que é o
único jeito de separar "pasta do `main`" de "raiz do ZIP" (§2.8).

Consequência prática: **um runtime pode passar em 71 de 71 e se declarar "bone
1.0 nível C" sem ter implementado nada dessa lista.** É o oposto do que a suíte
existe para fazer, e está anotado em `ESTADO.md` e na §12.4 da especificação
como pré-requisito para congelar a 1.0.

*(05/10/2026: com 104 de 104 a frase vale igual — o número cresceu, a lista do que nenhum caso exercita não foi revista nesta promoção.)*

Enquanto essa lista não fechar: se você implementou um runtime e passou na
suíte, diga também **o que não testou**. E se você lê o registro, leia a coluna
"Casos" como "passou nestes", não como "implementa tudo".

---

## O que tem dentro

```
conformidade/
  README.md                    este arquivo
  como-provar-conformidade.md  o passo a passo para quem escreve um runtime
  how-to-prove-conformance.md  o mesmo guia em inglês
  adaptador-referencia.mjs     um adaptador que roda e passa nos 71 casos
  dois-runtimes.md             o confronto entre os dois runtimes do formato
  REGISTRY.md                  o registro público de quem passou
  casos/
    A-010-heranca-cinco-modos/
      entrada.bone             o arquivo de entrada
      esperado.json            a sonda e o pose dump esperado
      leiame.md                o que o caso prova, com as contas
    A-011-shear/
    ...
    BIN-401-roundtrip/
      entrada.boneb            a entrada é o BINÁRIO
      fonte.bone               o mesmo esqueleto em texto, para leitura humana
    ZIP-501-manifesto/
      entrada.bonez            a entrada é o PACOTE
      fonte/                   os mesmos arquivos soltos
```

Alguns casos trazem também um `entrada.atlas.json`. Um caso de nível BIN ou ZIP
traz `entrada.boneb` ou `entrada.bonez` no lugar do `entrada.bone`; o executor
descobre a embalagem pelos primeiros bytes.

---

## Como um runtime de terceiro se declara conforme

Resumo. O passo a passo detalhado está em
[`como-provar-conformidade.md`](como-provar-conformidade.md), e em inglês em
[`how-to-prove-conformance.md`](how-to-prove-conformance.md).

1. **Escreve um adaptador** de 100 a 300 linhas: ele carrega o caso, aplica a
   sonda e imprime o pose dump.
2. **Roda a suíte** contra o adaptador:
   `node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py"`.
3. **Guarda o relatório**: `node ferramentas/conformidade.mjs --json --adaptador ... > conformance-report.json`.
4. **Publica o relatório** no repositório do runtime e no registro oficial, com
   versão e data.

É **auto-certificação pública**. Não há selo, não há taxa, não há comitê para
pedir permissão. O relatório fica exposto e qualquer pessoa refaz a conta.

Um runtime só pode dizer "**bone 1.0 nível C**" com **100% dos casos A, B e C
mais todos os casos X, BIN e ZIP** passando. Nível B: todos os A, B e X. Nível
A: todos os A e X.

O relatório `--json` já traz esse nível calculado, no campo `"level"`, e lista
em `"missingCategories"` as categorias obrigatórias que não têm caso nenhum —
para o número nunca parecer melhor do que é.

O adaptador que você vai ler quando o seu divergir é
[`adaptador-referencia.mjs`](adaptador-referencia.mjs). Confira que ele passa:

```
node ferramentas/conformidade.mjs --adaptador "node conformidade/adaptador-referencia.mjs"
```

---

## De onde vêm os números esperados

Um caso cujo `esperado.json` saiu do próprio runtime de referência não prova
nada: prova que o runtime concorda consigo mesmo.

Por isso, **todos os casos, menos três, têm os números calculados à mão a
partir do texto da especificação**, e a conta está escrita no `leiame.md` de
cada um, passo a passo. Os 18 que entraram em 17/09/2026 (C-270 a C-300) têm
**duas contas independentes** cada um, e nenhum runtime foi rodado para
escrevê-las. Quem quiser conferir não precisa rodar nada: lê a conta.

Nos outros três — **B-106**, **C-261** e **C-262** — a **regra** que o caso
prova é derivada à mão e está escrita no `leiame.md`, e parte dos números vem
de rodar o pseudocódigo da spec passo a passo. Os três dizem, no próprio
`leiame.md`, qual número saiu de qual caminho. Os três também foram conferidos
pelo segundo runtime, que os calcula por conta própria.

Desde a fase 7 existe um **terceiro caminho**, e ele é o mais forte de todos: um
**segundo runtime**, em Python, escrito a partir do texto da especificação sem
olhar o primeiro. Ele passa nos mesmos 46 casos, e a ferramenta
`ferramentas/comparar-runtimes.mjs` põe os dois dumps lado a lado, campo por
campo. Leia `dois-runtimes.md`: das seis divergências que ela achou, **quatro
eram buraco na especificação**, não bug de runtime.

É essa conta escrita que a §12.4 chama de "segundo caminho independente". Não
existe um script separado que reimplemente as fórmulas: existe a aritmética
humana no `leiame.md`, e a regra de que todo caso novo tem que trazê-la.

Os casos com esperado **gerado** dizem isso na primeira tabela do `leiame.md`,
e explicam por quê. Hoje é um só:

| Caso | Por que é gerado |
|:---|:---|
| `C-260-fisica-passo-fixo` | Cinquenta passos de integração encadeados. À mão seria copiar a máquina errando mais. O que o caso garante é o **determinismo** com passo fixo, que é o que a 6.5 promete — **não** a fórmula. A §6.5 inteira (inércia, mola, amortecimento, vento, gravidade) segue sem oráculo externo até a conferência contra o `spine-runtimes` em C++ que a §12.4 exige antes de congelar a 1.0. |

---

## Regras da suíte

- **Cada recurso da spec tem pelo menos um caso.** Recurso sem caso não entra
  na spec.
- **Nenhuma versão remove casos.** Os casos da 1.0 passam para sempre. (A
  regra vale a partir da 1.0 publicada: o rascunho 0.2 apagou três casos de
  `casos-pendentes/` cujo recurso saiu do formato, e isso está escrito acima.)
- **Uma proposta que quebre um caso existente é recusada sem discussão.**
- A cada `minor` novo, o arquivo de exemplo da versão anterior entra congelado
  como caso `X-306`.

---

## Ver também

- `formato/ESPECIFICACAO 2026-09-17.md`, seção 12 — conformidade, validação e
  governança. A §9.13 é a virada de corpo, e o pose dump ganhou o campo `body`.
- `ferramentas/validador/validar.mjs` — o validador de arquivo. Coisa
  diferente: ele diz se o **arquivo** está certo; a suíte diz se o **runtime**
  está certo.
