# Formato `.bone` — Especificação

**Rascunho 0.2 · 17/09/2026 · para revisão do Humberto**

Nome temporário do formato: **bone**. Versão do formato descrita: **1.0** (número provisório enquanto o rascunho estiver aberto).
Este texto funde os rascunhos A (runtime), B (animador) e C (longevidade), seguindo o parecer dos juízes. Em 17/09/2026 ele recebe o modelo novo do programa (`documentos/programa-novo/`, `documentos/planos/ARQUITETO 3`): projeto, corpo, base, a virada de corpo, a entidade sem socket, a pilha de peles, o desenho que troca de osso, os pesos animados, o recorte por animação, a pele de fora com osso e a animação de fora ajustada ao tamanho. O glossário de 1.6 liga a palavra do Humberto ao campo do arquivo.

**O rascunho 0.2 não abre arquivo do rascunho 0.1.** Decisão M13 (`programa-novo/02`): enquanto o formato é rascunho, nenhum leitor existe fora deste projeto, e não há compatibilidade entre rascunhos. O princípio 1 de 1.3 passa a valer a partir da 1.0 publicada. O que saiu, o que mudou de sentido e o que entrou está no Apêndice A, 72 a 80, e no `CHANGELOG.md` da raiz.

Palavras normativas: **DEVE**, **NÃO DEVE**, **DEVERIA**, **PODE**, no sentido da RFC 2119.
Chaves JSON em inglês. Prosa em português. Frases curtas.

Tipos usados nas tabelas: `string`, `number` (float 64 no JSON, float 32 no binário), `integer`, `boolean`,
`color4` (`[r, g, b, a]`, floats 0..1), `color3` (`[r, g, b]`), `name` (string que cita outro objeto pelo `name`),
`uri` (caminho relativo, 2.8), `T[]` (array), `object`, `any`.

Cada objeto tem uma tabela com as colunas: **nome | tipo | obrigatório | padrão | descrição**.
Todo objeto aceita `extensions` (object) e `extras` (any). Essas duas linhas ficam implícitas nas tabelas.

---

## 1. Visão geral e princípios

### 1.1 O que é

`.bone` é um formato aberto para animação 2D por ossos.
Um arquivo descreve **um esqueleto**: ossos, slots, attachments, skins, constraints, eventos, parâmetros, morphs e animações.
As imagens ficam num **atlas** (seção 10) e em arquivos de imagem. O contêiner `.bonez` junta tudo.

O padrão é o **arquivo**, não o programa. Qualquer editor grava. Qualquer runtime lê. Sem licença. Sem royalties.

### 1.2 Três encodings, um modelo

| Extensão | O que é | Uso |
|:---:|:---|:---|
| `.bone` | JSON UTF-8, legível | Edição, revisão, diff, ensino, validação |
| `.boneb` | Binário compacto, **mesmo modelo de dados** (seção 11) | Jogo em produção |
| `.bonez` | ZIP com `.bone` ou `.boneb` + atlas + imagens + áudio (2.9) | Distribuição num só arquivo |

Converter `.bone` ↔ `.boneb` **NÃO DEVE** perder informação. É a mesma árvore de objetos.

### 1.3 Princípios

| # | Princípio | Consequência |
|:---:|:---|:---|
| 1 | **Arquivo velho sempre abre em leitor novo.** | Versão 1.x só acrescenta. Nunca remove, nunca muda sentido. Nunca exige reexportar. |
| 2 | **Leitor velho abre arquivo novo o melhor que puder.** | Propriedade desconhecida é ignorada. Todo valor desconhecido tem fallback escrito (2.5). |
| 3 | **Determinístico.** | Dois runtimes conformes dão a mesma pose. Cada regra tem fórmula ou pseudocódigo. |
| 4 | **Tudo que o runtime precisa está no arquivo.** | Triangulação, hull, comprimento de path e atlas vêm prontos. Nada depende de segredo do editor. |
| 5 | **Referência por nome no JSON.** | Diff legível. Inserir um osso não renumera nada. O binário converte para índice na carga. Exceção: pesos de vértice usam índice de osso (7.4). |
| 6 | **Ordem no arquivo é a ordem de cálculo.** | Pai antes do filho. Constraints aplicadas na ordem do array. |
| 7 | **Valor ausente tem padrão fixo.** | Escrito na tabela. Nenhum padrão depende de outro campo. |
| 8 | **Extensível com governança.** | Extensões com prefixo, registro público, fallback declarado (2.7). Governança escrita (12.8). |
| 9 | **Validável por máquina.** | JSON Schema oficial e validador oficial. "Válido" tem definição exata (12.3). |
| 10 | **Só 2D. Aberto. Sem royalties, para sempre.** | Spec CC-BY 4.0. Schema, validador, suíte e runtime de referência Apache 2.0. |
| 11 | **O quadro é função pura do tempo (R1).** | `Pose(projeto, animação, t)` (9.10) dá o mesmo quadro para o mesmo `t`, para a frente e para trás, em qualquer leitor. Nada é guardado entre quadros. **Uma exceção, escrita:** a `physics` (6.5) é a única simulação do formato; um quadro dela depende dos anteriores. Quem precisa de quadro puro assa a física em chaves, e o editor oferece isso. |

### 1.4 O que o formato não define

- Como misturar animações (tracks, crossfade). Isso é do runtime. A spec define a **setup pose**, o valor de uma propriedade sem chave, e a função de referência `Pose(projeto, animação, t)` (9.10), inclusive a virada de corpo (9.13).
- Como desenhar (shader, batch, antialias). Define só o que desenhar, em que ordem, com que cor e que blend.
- Como tocar áudio. O evento entrega o caminho; o jogo toca.
- Cena, câmera, iluminação. É coisa da engine.

### 1.5 Papéis

| Papel | O que é | Exemplo |
|:---|:---|:---|
| **Leitor** | Abre `.bone` / `.boneb` / `.bonez` e produz pose, desenho ou dados. | Runtime de jogo, visualizador, conversor. |
| **Gravador** | Produz arquivos. | Editor, exportador, importador. |
| **Validador** | Diz se o arquivo é válido e em que nível. | `bone validate` (CLI e web). |

Um programa pode ser os três. Cada papel tem a sua lista de DEVE / DEVERIA / PODE (seção 12).

### 1.6 Glossário: a palavra do Humberto e o campo do arquivo

As chaves JSON ficam em inglês (2.1). A tela do editor e este texto falam português. Esta tabela é a ponte, e é **normativa** no sentido de que cada linha aponta para a seção que define o campo. Quem lê um plano do editor (`documentos/programa-novo/`) acha aqui o que cada palavra é no arquivo.

| Palavra do Humberto | O que é no arquivo | Onde |
|:---|:---|:---:|
| **Projeto** (a caixa) | um `.bonez` com vários `.bone` dentro; na pasta de trabalho, `manifest.json` + os `.bone` + o atlas | 2.9 |
| **Corpo** (homem, lobisomem, mecha) | um arquivo `.bone`: ossos, slots, peles, regras **e as suas animações** | 2.2 |
| **Base** | a setup pose do corpo: o quadro 0 que toda animação daquele corpo herda | 5.1 |
| **Animação** | uma entrada de `animations[]` do corpo em que nasceu | 4.6, 9 |
| **Virada** (colar o lobisomem no meio) | timeline `body`, só `stepped`, com a `uri` do outro corpo | 9.13 |
| **Entidade** (fogo, espada, explosão) | anexo `skeleton` num slot, sem socket: segue a imagem | 7.11 |
| **Tomada** | um slot | 4.3 |
| **Pino** | a raiz do filho, posta no osso do slot por `x, y, rotation, scaleX, scaleY` do anexo | 7.11 |
| **Pendurar** | criar um slot no osso e pôr o anexo `skeleton` nele | 7.11 |
| **Imagem**, **desenho** | anexo `region` ou `mesh` num placeholder de uma pele | 7.3, 7.4 |
| **Pele** | uma entrada de `skins[]` do corpo | 4.4 |
| **Pilha de peles** (Feitas / Ativas) | a lista de peles ativas, de baixo para cima; a de cima vence | 4.4 |
| **A `default`** | a pele que o editor cria primeiro; para o leitor, uma pele como as outras | 4.4, 7.1 |
| **Pele de fora** (Dota) | um `.bone` só de `skins` com `rig`, citado em `assets.skins`; pode trazer osso, slot e regra `skinRequired` | 2.8 |
| **Animação de fora** (Mixamo) | um `.bone` só de `animations` com `rig`, em `assets.animations`; `rig.reference` ajusta ao tamanho | 2.8, 4.8 |
| **Desenho troca de osso** | timeline `slot` / `bone`, com `transform` na chave | 9.5 |
| **Pesos animados** | timeline `weights` | 9.6 |
| **Área de recorte** da exportação | `animation.crop` | 4.6 |
| **Regra** | constraint (`ik`, `transform`, `path`, `physics`) | 6 |
| **Comando** | constraint `driver` | 8.2 |
| **Linha** (da linha do tempo) | `Timeline` | 9.1 |
| **Chave** | `Key` | 9.2 |
| **Quadro** | `Pose(projeto, animação, t)` num `t` | 9.10 |
| **Ordem de desenho** | ordem do array `slots`, mais `skin.drawOrder`, mais a timeline `drawOrder` | 4.4, 9.5 |
| **Pivô** | `x, y` do anexo (a pose) e `pivotX, pivotY` da região do atlas (informativo) | 7.3, 10.3 |
| **Malha** | anexo `mesh`; **pesos** são o `binding` dele | 7.4 |
| **Sequência** (de imagens) | `Sequence` dentro do anexo, timeline `sequence` | 7.10, 9.6 |
| **Evento** | `EventDef` e timeline `event` | 4.5, 9.7 |

O que **não** está no arquivo, de propósito: a lista Corpos / Entidades da janela e o corpo em foco (moram em `manifest.extras`, 2.9); a câmera, a seleção e a pele em edição (`RECORTE_editor_state`); a grade da cena (na máquina). Um leitor ignora tudo isso.

---

## 2. Arquivo, cabeçalho, versionamento, extensões, contêiner `.bonez`, resolução de caminhos

### 2.1 Regras do arquivo JSON (`.bone`)

- Codificação **UTF-8 sem BOM**. Leitores **DEVEM** aceitar BOM na leitura e **NÃO DEVEM** gravar BOM.
- Conforme RFC 8259. Sem comentários. Sem vírgula final.
- Chaves duplicadas no mesmo objeto tornam o arquivo **inválido** (L0).
- Números **DEVEM** ser finitos. `NaN` e `Infinity` não existem; número que não cabe em float 64 (`1e400`) é L0. Número de módulo maior que `3.4028235e38` é L1 `RANGE_FLOAT32`; um gravador `.boneb` **DEVE** recusar gravá-lo.
- A ordem das propriedades **não tem significado**. A ordem dos elementos nos arrays **tem** (ossos, slots, constraints, chaves).
- Todo `name` é string Unicode em forma NFC, com 1 a 255 caracteres (code points) e no máximo 1020 bytes em UTF-8, sem caracteres de controle. Comparação sensível a maiúsculas. O leitor compara `name` por code points, **sem** normalizar. Nome fora de NFC é L1 `NAME_NOT_NFC`; o gravador normaliza ao gravar.
- Um `name` **DEVE** ser único dentro da sua categoria (ossos entre ossos, slots entre slots, e assim por diante). Um osso e um slot podem ter o mesmo nome.
- Referências entre objetos usam **`name`**, nunca índice. Exceção: `binding.bones` (7.4) usa índice no array `bones`.
- Todo objeto **PODE** ter `extras` (any) e `extensions` (object cujas chaves são nomes de extensão).

### 2.2 Objeto raiz

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `bone` | object | sim | — | Cabeçalho (2.3). **DEVE** ser a primeira propriedade gravada, para leitores que espiam o início do arquivo. |
| `extensionsUsed` | string[] | não | `[]` | Nomes de todas as extensões que aparecem no arquivo. |
| `extensionsRequired` | string[] | não | `[]` | Subconjunto de `extensionsUsed` sem as quais o arquivo não faz sentido. |
| `skeleton` | object | não | `{}` | Metadados do esqueleto (4.1). |
| `assets` | object | não | `{}` | Onde estão atlas, imagens, áudio, esqueletos aninhados, animações e skins externas (2.8). |
| `rig` | object | não | — | Contrato de rig (4.8): os nomes que este arquivo **exige** de quem o usa. Vai num arquivo só de animações ou numa pele de fora. |
| `bones` | Bone[] | sim | — | Ossos (4.2). O primeiro é a raiz. Pai sempre antes do filho. Mínimo 1. |
| `slots` | Slot[] | não | `[]` | Slots (4.3). A ordem do array é a ordem de desenho do setup. |
| `constraints` | Constraint[] | não | `[]` | IK, transform, path, physics, driver (seções 6 e 8). Aplicadas na ordem do array. |
| `skins` | Skin[] | não | `[]` | Peles (4.4). A pele `"default"` é opcional e é uma pele como as outras: a que o editor cria primeiro. Só está ativa se estiver na pilha. |
| `events` | EventDef[] | não | `[]` | Definições de eventos (4.5). |
| `parameters` | Parameter[] | não | `[]` | Parâmetros numéricos (8.1). |
| `morphs` | Morph[] | não | `[]` | Morph targets (8.3). |
| `variables` | Variable[] | não | `[]` | Variáveis (8.4). |
| `tags` | string[] | não | `[]` | Tags declaradas (8.5). |
| `animations` | Animation[] | não | `[]` | Animações (seção 9). |
| `extensions` | object | não | — | Dados de extensões no nível raiz. |
| `extras` | any | não | — | Metadados livres. |

Um arquivo tem **um** esqueleto: é um **corpo**, com a sua base (5.1) e as suas animações. Um **projeto** (a caixa do editor) é um `.bonez` com um `.bone` por corpo e por entidade (2.9); uma animação de um corpo pode colar outro corpo do projeto no meio, pela timeline `body` (9.13). Esqueleto dentro de esqueleto = attachment `skeleton` com `uri` (7.11): é a **entidade**. Animações ou peles que servem a vários corpos = um `.bone` com um osso raiz, o bloco `rig` (4.8) e só `animations` ou só `skins`, citado em `assets.animations` ou `assets.skins` (2.8). Que arquivo é corpo e que arquivo é entidade **não é do formato**: é onde o editor o encaixou, e fica em `manifest.extras` (2.9).

### 2.3 Cabeçalho `bone`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `version` | string | sim | — | Versão do formato usada para gravar. Formato `"major.minor"`. Ex.: `"1.0"`. |
| `minVersion` | string | sim | — | Menor versão de leitor capaz de reproduzir o arquivo **sem perda**. Sempre `<= version`. |
| `generator` | string | sim | — | Programa que gravou, com versão. Ex.: `"Recorte 0.2.0"`. Só informativo. |
| `id` | string | não | — | Identificador estável do documento (UUID recomendado). Sobrevive a regravações. |
| `created` | string | não | — | Data e hora ISO 8601 / RFC 3339 (`date-time`) da criação, ex.: `"2026-09-06T12:00:00Z"`. Formato diferente: L2. |
| `modified` | string | não | — | Data e hora ISO 8601 / RFC 3339 (`date-time`) da última gravação. Formato diferente: L2. |
| `license` | string | não | — | Identificador SPDX ou texto curto. Ex.: `"CC-BY-4.0"`. |
| `copyright` | string | não | — | Titular dos direitos. |

Exemplo mínimo: `{ "bone": { "version": "1.0", "minVersion": "1.0", "generator": "Recorte 0.2.0" } }`.

### 2.4 Versionamento

**Forma.** `major.minor`. Sem `patch`: correção de texto na spec não muda o formato.

**Regras para `minor` (1.0 → 1.1 → 1.2):**

- **PODE** adicionar propriedades opcionais.
- **PODE** adicionar valores a enums, **desde que** o enum já tenha fallback (2.5).
- **PODE** adicionar tipos de attachment, constraint, timeline e alvo de driver. Todos têm fallback: ignorar.
- **NÃO DEVE** remover propriedade. **NÃO DEVE** mudar tipo, padrão ou significado.
- **NÃO DEVE** tornar obrigatório o que era opcional.
- Propriedade que ficou ruim vira **desaconselhada** na spec e continua lida para sempre.

**Regras para `major` (1.x → 2.0):**

- Só quando for impossível avançar sem quebrar. A meta é nunca.
- Um leitor 2.x **DEVE** ler todo arquivo 1.x. A spec 2.0 traz o capítulo "leitura de 1.x" com o mapeamento completo.
- Um arquivo 2.x pode não abrir em leitor 1.x. Só nesse caso o leitor tem permissão de recusar.

**Algoritmo obrigatório ao abrir:**

```
(fMajor, fMinor) = bone.version
(mMajor, mMinor) = bone.minVersion
(rMajor, rMinor) = versão que o leitor conhece

se fMajor < rMajor:        abrir, com o capítulo de compatibilidade da spec
se fMajor == rMajor:
    se (fMajor, fMinor) <= (rMajor, rMinor):        abrir normal
    senão se (mMajor, mMinor) <= (rMajor, rMinor):  abrir; ignorar o desconhecido; avisar "arquivo mais novo, leitura parcial"
    senão:                                          abrir em "melhor esforço"; avisar com destaque
                                                    (o leitor NÃO DEVE recusar por causa de minor)
se fMajor > rMajor:        PODE recusar; DEVE informar as duas versões na mensagem
```

**Como o gravador escolhe `minVersion`.** Cada propriedade da spec tem a nota `x-since` no schema (12.7). `minVersion` é a maior dessas notas entre as propriedades presentes no arquivo. Um gravador que não quer calcular grava `minVersion = version`.

### 2.5 Fallbacks obrigatórios para valores desconhecidos

Esta tabela é o coração da compatibilidade para frente. Leitor que encontra valor desconhecido **DEVE** fazer o que está aqui e **DEVERIA** avisar uma vez.

| Onde | Valor desconhecido | Leitor faz |
|:---|:---|:---|
| Qualquer objeto | Propriedade desconhecida | Ignora. Preserva se regravar (2.6). |
| `slot.blend` | Blend desconhecido | Usa `"normal"`. |
| `attachment.type` | Tipo desconhecido | Trata o placeholder como vazio. |
| `body` `key.value` | `uri` que não é um corpo carregado do projeto | Fica no corpo que valia antes da chave (9.13). Avisa uma vez. |
| `slot` / `bone` `key.value` | Osso que o corpo do instante não tem | Fica no osso que valia antes da chave (9.5). Avisa uma vez. |
| `skeleton.baseAnimation` | Animação que o filho não tem | Ignora a camada de fundo (7.11). |
| `skeleton.around` | Slot que o filho não tem | Desenha o filho em bloco, na posição do slot, como sem o campo (7.11). Avisa uma vez. |
| `constraint.type` | Tipo desconhecido | Ignora a constraint. |
| `timeline.type` | Tipo desconhecido | Ignora a timeline. |
| `timeline.property` | Propriedade desconhecida | Ignora a timeline. |
| `key.curve` | Curva desconhecida (string nova) | Usa `"linear"`. Em valor não numérico, `"stepped"`. |
| `driverTarget.type` | Tipo desconhecido | Ignora o alvo. |
| `sequence.mode` | Modo desconhecido | Usa `"hold"`. |
| `path` `positionMode`, `spacingMode`, `rotateMode` | Modo desconhecido | Usa o padrão da propriedade. |
| `boundingbox.shape` | Forma desconhecida | Ignora o attachment. |
| `variable.type` | Tipo desconhecido | Ignora a variável e as timelines dela. |
| `parameter.source.property` | Propriedade desconhecida | Ignora `source`; o parâmetro vale `default`. |
| `atlas.page.format` | Formato desconhecido | Usa `"rgba8"`. |
| `atlas.page.minFilter/magFilter/wrapU/wrapV` | Valor desconhecido | Usa o padrão. |
| `atlas.region.rotation` | Valor fora de `0` e `90` | Usa `0`. |
| `extensions.<nome>` | Extensão não suportada, não requerida | Ignora o objeto da extensão. |
| `extensionsRequired` | Extensão não suportada | Ver 2.7. |
| `driverTarget.mode`, `driver.mode` | Modo desconhecido | Usa `"replace"`. |
| `animation.blend` | Valor desconhecido | Usa `"replace"`. |
| `manifest.bonez.version` | `major` maior que o conhecido | Mesma regra de 2.4 (PODE recusar). |
| `.boneb` `layoutVersion` | Maior que o conhecido | Recusa (11.3). |

**Tipos de extensão.** Uma extensão prefixada traz as linhas dela na própria
spec, e elas valem como estas. As da `BONE_particles` (`formato/extensions/BONE_particles.md`, §7.4):

| Onde | Valor desconhecido | Leitor faz |
|:---|:---|:---|
| `BONE_particle.shape` | Forma desconhecida | **Não desenha o emissor.** Avisa uma vez. Cair para `point` seria um palpite silencioso |
| `BONE_particle.space` | Valor desconhecido | Usa `"local"`. Avisa. |
| `BONE_particle.sortMode` | Valor desconhecido | Usa `"youngestInFront"`. Avisa. |
| `BONE_particle.frameMode` | Valor desconhecido | Usa `"lifetime"`. Avisa. |
| `BONE_particle.meshMode` | Valor desconhecido | Usa `"vertex"`. Avisa. |

O `attachment.type` `"BONE_particle"` num leitor sem a extensão cai na linha de
`attachment.type` acima: placeholder vazio. O leitor **DEVERIA** avisar uma vez,
com o nome do emissor e do slot.

### 2.6 Preservação em regravação (round-trip)

Um gravador que abre um arquivo e grava de novo:

- **DEVE** preservar `extras` de todo objeto que manteve.
- **DEVERIA** preservar `extensions` que não entende e manter o nome em `extensionsUsed`.
- **DEVERIA** preservar propriedades desconhecidas do núcleo (arquivo mais novo que o editor).
- **NÃO DEVE** gravar `version` menor que o `minVersion` calculado do conteúdo (2.4). Se preservou dados que não entende, **DEVE** manter a `version` original.

Isso evita o ciclo "abriu no programa velho e perdeu tudo".

### 2.7 Extensões

Mesmo mecanismo do glTF, com governança escrita.

**Onde.** Todo objeto pode ter `extensions`: objeto cujas chaves são nomes de extensão e valores são objetos definidos pela extensão.

```json
"extensions": { "ACME_glow": { "radius": 4, "color": [1, 0.5, 0, 1] } }
```

**Nomes.** `PREFIXO_nome_em_snake_case`. Regex: `^[A-Z][A-Z0-9]{1,7}_[a-z0-9_]+$`.

| Prefixo | Quem | Como entra |
|:---:|:---|:---|
| `BONE_` | Comitê do formato | Ratificada. Tem spec, schema, arquivo de teste e dois leitores independentes. |
| `EXT_` | Dois ou mais fornecedores | Registrada no repositório com spec e schema. |
| `<MARCA>_` | Um fornecedor | Prefixo registrado (nome único). Spec pública recomendada, não exigida. |

**Registro.** O repositório oficial mantém `formato/extensions/REGISTRY.md` com todo prefixo e toda extensão. Nome não registrado é válido no arquivo, mas o validador avisa (L2).

**Regras para o autor da extensão:**

- **DEVE** publicar JSON Schema do objeto da extensão.
- **DEVE** dizer o que um leitor sem a extensão vê (o fallback). Extensão sem fallback só pode ser usada com `extensionsRequired`.
- **NÃO DEVE** mudar o significado de propriedade do núcleo.
- **PODE** adicionar novos tipos (attachment, constraint, timeline, alvo de driver) com nomes prefixados: `"type": "ACME_ribbon"`. Leitor sem a extensão aplica o fallback de 2.5.

**`extensionsUsed` e `extensionsRequired`:**

- Toda extensão que aparece em qualquer `extensions` ou em qualquer `type` prefixado **DEVE** estar em `extensionsUsed`.
- Se o arquivo não faz sentido sem ela, entra também em `extensionsRequired`.
- Leitor que não implementa uma extensão de `extensionsRequired` **NÃO DEVE** afirmar que carregou o arquivo corretamente. **DEVERIA** recusar com mensagem listando as extensões faltantes. **PODE** carregar em modo degradado se o usuário pedir.

**Promoção.** Extensão `EXT_` ou de marca com uso real pode virar `BONE_` e depois núcleo numa versão `minor`. Quando vira núcleo, o nome antigo continua aceito para sempre (alias).

**Extensões oficiais previstas** (nome reservado desde já; publicadas junto com a 1.0 ou depois; nenhuma faz parte do núcleo):

| Nome | Para quê | Fallback sem a extensão |
|:---|:---|:---|
| `BONE_param_grid` | Driver em grade multilinear com 2 a 4 parâmetros (keyforms 2-D do Live2D). | O gravador **DEVE** gravar também drivers 1-D aditivos ao longo dos eixos que passam pelo `default`. Perde os cantos. |
| `BONE_pendulum` | Física de pêndulo em cadeia (cabelo, saia; `physics3.json` do Live2D), com pseudocódigo próprio na spec da extensão. | Parâmetros de saída ficam no `default`. |
| `BONE_ik_chain` | IK de N ossos (CCD, FABRIK) com algoritmo completo. | Constraint ignorada; ossos ficam em FK. |
| `BONE_clip_alpha` | Máscara de clipping pelo alpha da textura (Live2D). | Usa o polígono do `clipping`. |
| `BONE_motors` | Motores procedurais tipo Creature (ciclo de andar, bater asas, piscar, corda). | Ignorado. Gravador **DEVERIA** gravar o resultado assado em animação. |
| `BONE_warp_deformer` | Deformador de grade Bézier como objeto editável (Live2D). | Ignorado; o efeito já está assado nos vértices. |
| `BONE_lipsync` | Visemas e mapeamento áudio → parâmetro. | Ignorado. |
| `BONE_editor_state` | Pastas, câmera, seleção, ossos escondidos, cores de UI. | Ignorado. |

### 2.8 `assets` e resolução de caminhos

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `atlases` | uri[] | não | `[]` | Atlas (seção 10). Consultados na ordem. |
| `imagesBase` | uri | não | `""` | Pasta base para imagens soltas sem atlas. |
| `audioBase` | uri | não | `""` | Pasta base para áudio de eventos. |
| `skeletonsBase` | uri | não | `""` | Pasta base para arquivos `.bone` externos: esqueletos aninhados (7.11), animações e skins externas (abaixo). |
| `animations` | uri[] | não | `[]` | Arquivos `.bone`, `.boneb` ou `.bonez` cujas `animations` entram neste esqueleto pelo nome. Relativos a `skeletonsBase`. Nível C. |
| `skins` | uri[] | não | `[]` | Arquivos cujas `skins` entram neste corpo pelo nome, **com os ossos, slots e regras `skinRequired` que elas trazem** (abaixo). Relativos a `skeletonsBase`. Nível C. |

**Junção `base + nome`.** Se `base` não é vazia e não termina em `/`, o leitor insere `/` entre os dois. `base` vazia = a base de resolução da tabela abaixo. Gravadores **DEVERIAM** gravar a base terminada em `/`.

**Regras de `uri`:**

1. Sempre **relativa**. Caminho absoluto (`C:/`, `/`, `file:`, `http:`, `https:`) torna o arquivo **inválido** (L1).
2. Separador é `/`. Barra invertida é inválida.
3. Segmentos `..` e `.` são **proibidos**. O arquivo não pode sair da pasta base.
4. Caracteres fora de ASCII não reservado **DEVEM** ser percent-encoded (RFC 3986). Leitor decodifica.
5. Comparação de caminho é **sensível a maiúsculas**. Gravadores **DEVERIAM** usar só minúsculas.
6. `data:` URI é permitida só em `page.image` de um atlas (10.3). Nunca em `assets`, eventos ou esqueletos aninhados. Máximo: 16 MiB decodificados.
7. Comprimento máximo: 1024 caracteres (code points).
8. Todas as regras acima são aplicadas **depois** de decodificar o percent-encoding. `%2F`, `%5C`, `%00`, `%3A` e qualquer byte de controle são inválidos mesmo codificados (L1 `URI_ENCODED_RESERVED`). `:` é inválido em qualquer posição.

**Base de resolução:**

| Situação | Base |
|:---|:---|
| `.bone` ou `.boneb` solto | Pasta onde o arquivo está. |
| Dentro de `.bonez` | Pasta do arquivo `main` dentro do ZIP — **não** a raiz do ZIP. Nunca sai do ZIP. |
| Carregado de memória, sem caminho | O runtime recebe uma função "resolver" do jogo. Sem ela, todo `uri` falha com erro claro. |

**A base dentro de um `.bonez`, com todas as letras.** Com `main: "personagens/heroi.bone"`, a base é `personagens/`. Um `uri` de `"heroi.atlas.json"` procura **só** a entrada `personagens/heroi.atlas.json`. Se o atlas estiver em `heroi.atlas.json`, na raiz do ZIP, ele **não** é achado, e o attachment fica invisível pela regra de arquivo faltando.

Um leitor **NÃO DEVE** tentar a raiz do ZIP como segunda chance. Um leitor que tenta abre pacotes que outro leitor recusa, e o autor do pacote nunca descobre que ele está errado — que é o pior dos dois mundos para um formato de troca. Quem quiser os arquivos na raiz grava `main` na raiz.

Um esqueleto **aninhado** (7.11) dentro do pacote resolve contra a **pasta dele**, não contra a pasta do `main`: cada esqueleto do pacote é uma base.

**Resolução de imagem de um attachment (`path`):**

```
nome = attachment.path  (ou o nome do placeholder, se path ausente)
para cada atlas em assets.atlases, na ordem:
    se atlas tem região com name == nome (ou alias): usar (página, região)
se nenhum atlas tem:
    tentar arquivo assets.imagesBase + nome + ".png"
    depois ".webp", ".jpg" (nessa ordem)
se nada existe: attachment invisível; avisar uma vez
```

**Áudio de evento:** `assets.audioBase + event.audio`. A extensão faz parte do valor.
**Esqueleto aninhado:** `assets.skeletonsBase + attachment.uri`. O arquivo apontado **DEVE** ser `.bone`, `.boneb` ou `.bonez`.

**Animações e skins externas:** `assets.skeletonsBase + uri`, para cada entrada de `assets.animations` e `assets.skins`, na ordem. Mesmos três tipos de arquivo. O leitor carrega o arquivo externo, confere o `rig` dele contra este esqueleto (4.8) e:

- de um arquivo em `assets.animations`, copia cada `animations[]` para o namespace de animações **deste** esqueleto, com o nome que ela tem lá;
- de um arquivo em `assets.skins`, copia cada `skins[]` para o namespace de skins deste esqueleto, idem. Os `assets` (atlas, imagens) de uma skin externa resolvem contra o **arquivo dela**, não contra este — a mesma regra do esqueleto aninhado. Uma skin externa pode pôr um attachment `skeleton` (7.11) em **qualquer** slot, e não só num slot de arma: a `uri` dele resolve contra o **arquivo da skin**, pelo `skeletonsBase` dela. É assim que um capacete com esqueleto e animações próprias chega de fora e substitui a cabeça, sem o personagem saber que esse arquivo existe.

A partir daí `slot.attachment`, `skin.includes`, `driver.animation` e a API do jogo veem essas animações e skins como se estivessem gravadas aqui.

**De um arquivo em `assets.animations`**, tudo o mais (`bones`, `slots`, `constraints`, `events`) é **ignorado**: o osso raiz que ele tem só existe porque `bones` é obrigatório (2.2). Uma exceção, o ajuste de tamanho:

- **`rig.reference` ajusta a animação ao tamanho do corpo (F24, normativo).** Se o arquivo de animações traz `rig.reference: { bone, length }` (4.8), o leitor calcula `k = hospedeiro.bones[bone].length / reference.length` e, **ao copiar** cada animação, multiplica por `k` todo `value` (e todo `cy` de curva Bézier) das timelines `bone` com `property` `x` ou `y`. Rotação, escala e cisalhamento não mudam. Sem `reference`, `k = 1`. Osso de `reference` que o hospedeiro não tem, ou com `length` zero: `k = 1` e L2 `RIG_UNMET`. `reference.length <= 0` é L1 `RIG_REFERENCE`. É a opção do Spine que o Humberto pediu (Q41). Caso **C-297**.

**De um arquivo em `assets.skins`, a pele pode trazer osso (F23, normativo).** Uma pele de fora que precisa de um osso que o corpo não tem, como o rabo do lobisomem, traz o osso junto:

| Do arquivo da pele entra no corpo | Regra |
|:---|:---|
| `skins[]` | pelo nome, como acima |
| `bones[]` com `skinRequired: true` | entram no corpo, **no fim** do array `bones`, na ordem do arquivo. O `parent` de cada um **DEVE** ser um nome de `rig.bones` ou outro osso `skinRequired` do mesmo arquivo (L1 `REF_BONE_MISSING` se não). Osso com o nome de um osso local: L2 `EXTERNAL_DUPLICATE`, o local vale |
| `slots[]` | entram no corpo, **no fim** do array `slots`, na ordem do arquivo (é onde a imagem do rabo mora). O `bone` do slot **DEVE** ser um osso do `rig` ou um osso trazido pela mesma pele. Slot não tem `skinRequired`: um slot só desenha o que alguma pele da pilha lhe dá |
| `constraints[]` com `skinRequired: true` | entram no corpo, no fim do array, na ordem do arquivo |
| `binding.bones` de uma malha pesada da pele | é **índice** no array `bones` do arquivo da pele (7.4). Ao entrar no corpo, o leitor **traduz pelo nome** do osso para o índice do corpo; nome que o corpo não tem vai para o índice 0 com L2 `RIG_UNMET` (Apêndice C, 8) |
| `bones[]` e `constraints[]` **sem** `skinRequired` | **ignorados**, L2 `EXTERNAL_BONE_NOT_SKIN`: um osso comum num arquivo de pele é erro de quem gravou. O osso raiz obrigatório do arquivo cai nesta regra sem aviso |
| slot da pele com o nome de um slot local | o local vale, L2 `EXTERNAL_DUPLICATE`, como o osso (Apêndice C, 9) |
| `events`, `animations`, `parameters`, `morphs`, `variables`, `tags` | ignorados |

O corpo é montado **uma vez**, com esses ossos dentro; um osso `skinRequired` é sempre calculado (7.1) e só aparece quando a pele que o lista está na pilha. Trocar de pele **não remonta** o esqueleto. Casos **C-277** (refeito) e **C-294**. Exemplo: `rigs/lobisomem-rabo.bone`, a pele com osso da convenção `humanoide-v1`.

Nome externo igual a um nome **local**: L2 `EXTERNAL_DUPLICATE`, e a local vale. Dois externos com o mesmo nome: vale o primeiro na ordem das listas.

**Sem encadeamento.** Um arquivo citado em `assets.animations` ou `assets.skins` **NÃO DEVE** ter `assets.animations` nem `assets.skins` próprios: L1 `EXTERNAL_CHAIN`, e o leitor ignora as listas dele. A profundidade é sempre 1. Um esqueleto **aninhado** (7.11) pode ter as suas listas: ele é um esqueleto completo, e as regras valem para ele como para qualquer outro.

**Arquivo faltando nunca é erro fatal.** Esqueleto abre, animação roda, o attachment fica invisível. O runtime **DEVE** expor a lista do que faltou.

### 2.9 Contêiner `.bonez`

ZIP (PKWARE APPNOTE 6.3.x), sem criptografia, sem multi-volume.

| Regra | Detalhe |
|:---|:---|
| Primeira entrada | Nome `mimetype`, método **Store**, extra field de comprimento 0, sem data descriptor (bit 3 = 0), conteúdo exato `application/vnd.bone+zip` sem newline. Assim os bytes 0–3 são `PK\x03\x04`, 30–37 são `mimetype` e 38–61 são o tipo MIME (truque do EPUB e do ODF). |
| Segunda entrada | `manifest.json` (abaixo). |
| Arquivo principal | Nomeado no manifesto. `.bone` ou `.boneb`. |
| Compressão | Só **Store** ou **Deflate**. Outros métodos tornam o contêiner inválido. |
| Nomes de entrada | A forma **decodificada** (UTF-8, NFC) da uri, obedecendo às regras 1–3, 5, 7 e 8 de 2.8. UTF-8 (flag bit 11 ligado). Ao resolver, o leitor decodifica a uri e compara bytes com o nome da entrada. |
| ZIP64 | Permitido. Leitores **DEVEM** suportar. |
| Entradas fora do manifesto | Permitidas. Toda uri resolvida dentro do `.bonez` (2.8) é procurada pelo nome da entrada, listada ou não; as listas `skeletons/atlases/images/audio` servem a pré-carga e integridade. Entrada citada por um esqueleto e ausente das listas: L2 `ZIP_UNLISTED`. |
| Nome repetido | Inválido (L1 `ZIP_DUPLICATE_ENTRY`); leitor usa a primeira ocorrência do diretório central. |
| Recomendação | Imagens e áudio em Store (já são comprimidos). JSON em Deflate. |
| Limites | Ver 12.6. |

`manifest.json`:

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `bonez` | object | sim | — | `{ "version": "1.0" }`. Versão do contêiner, independente do formato. |
| `main` | uri | sim | — | Entrada principal. Ex.: `"heroi.bone"`. |
| `skeletons` | uri[] | não | `[main]` | Todos os esqueletos no pacote (aninhados e personagens extras). |
| `atlases` | uri[] | não | `[]` | Atlas incluídos. |
| `images` | uri[] | não | `[]` | Imagens incluídas. |
| `audio` | uri[] | não | `[]` | Áudio incluído. |
| `hashes` | object | não | — | Mapa `uri → "sha256:<hex>"`. Integridade opcional. |
| `extras` | any | não | — | Livre. |

Um leitor **DEVE** conseguir abrir o `.bonez` lendo só `mimetype`, `manifest.json` e as entradas que o manifesto cita.

**O projeto do editor é um `.bonez`.** A pasta de trabalho do editor é o pacote aberto: `manifest.json`, um `.bone` por corpo e por entidade, um atlas. "Salvar como pacote" só zipa. `main` é o corpo em foco na hora de salvar: é o que um jogo toca sem perguntar. As duas listas da janela (Corpos e Entidades) e o corpo em foco moram em `manifest.extras.RECORTE_projeto = { "corpos": [uri], "entidades": [uri], "emFoco": uri }`: são estado do editor, e um leitor os ignora. Um corpo citado por uma chave `body` (9.13) de qualquer animação do pacote **DEVE** estar em `skeletons`.

Tipos MIME: `application/vnd.bone+json` (`.bone`), `application/vnd.bone` (`.boneb`), `application/vnd.bone+zip` (`.bonez`), `application/vnd.bone.atlas+json` (atlas).

---

## 3. Sistema de coordenadas e unidades

### 3.1 Convenções

| Item | Convenção |
|:---|:---|
| Eixo X | Cresce para a **direita**. |
| Eixo Y | Cresce para **cima**. |
| Origem | Ponto `(0, 0)` do esqueleto. O osso raiz normalmente fica aí. |
| Unidade de distância | **Pixel** da arte na escala 1. |
| Rotação | **Graus**, **anti-horário** positivo. Rotação 0 aponta para +X. |
| Escala | Fator. `1` = tamanho original. Negativo espelha. |
| Shear | Graus. `shearX` inclina o eixo X local; `shearY` inclina o eixo Y local. |
| Comprimento de osso | Ao longo do +X local. A ponta é `(length, 0)`. |
| Tempo | **Segundos**, float. `0` é o início da animação. |
| Cor | `[r, g, b, a]` floats 0..1, sRGB, **não premultiplicados** no arquivo. |
| UV | `u` para a direita, `v` para **baixo** (0 no topo). Igual ao glTF e a toda API de textura. |
| Atlas | Pixels da página. Origem no canto **superior esquerdo**, Y para baixo. É espaço de imagem. |
| Ordem de desenho | Índice menor desenha **antes** (fica atrás). |
| Triângulos | Enrolamento **anti-horário** no espaço do esqueleto. Leitores 2D não fazem culling. |

Compatível com Spine e com glTF. Não há flag para trocar a convenção. Um arquivo tem **uma** convenção, sempre.

**Ângulos.** Ângulos gravados PODEM ter qualquer valor real (por exemplo `720`). O runtime interpola o valor **cru** (permite giros completos entre duas chaves) e reduz para `(-180, 180]` só ao devolver valores ao usuário. A pose aplicada guarda o valor cru; só a saída (API do runtime e pose dump) reduz.

### 3.2 Matriz de mundo

Cada osso tem uma matriz afim 2×3:

```
| a  b  worldX |
| c  d  worldY |
```

Ponto local `(lx, ly)` vai para o mundo assim:

```
wx = a*lx + b*ly + worldX
wy = c*lx + d*ly + worldY
```

O eixo X do osso no mundo é o vetor `(a, c)`. O eixo Y é `(b, d)`. A rotação de mundo é `atan2(c, a)`. A escala X de mundo é `sqrt(a² + c²)`.

### 3.3 Tabela de conversão para engines Y-para-baixo

Godot, PixiJS, Phaser, HTML Canvas, Construct, GameMaker, LÖVE, Cocos e DragonBones usam Y para baixo com rotação horária positiva. Unity, Unreal, Defold, Bevy e Spine usam Y para cima: não convertem nada. O runtime converte **na hora de aplicar**, nunca no arquivo.

| Dado no `.bone` | No engine Y-para-baixo |
|:---|:---|
| Posição `(x, y)` de osso, vértice, ponto, path | `(x, -y)` |
| `rotation` | `-rotation` |
| `scaleX`, `scaleY` | Iguais |
| `shearX`, `shearY` | `-shearX`, `-shearY` |
| Matriz de mundo `[a b c d worldX worldY]` | `[a, -b, -c, d, worldX, -worldY]` |
| UV `(u, v)` | Iguais (já são Y-para-baixo) |
| Ordem de desenho | Igual |
| Enrolamento de triângulo | Passa a ser horário. Engine com culling: inverter índices `[a, b, c] → [a, c, b]`. |
| `bendPositive` do IK | Inverter (`!bendPositive`) |
| `gravity` da física | `-gravity` |
| `wind` da física | Igual |
| Curvas Bézier | Sem mudança. Tempo e valor não dependem do eixo. |
| Offset de região no atlas `(offsetX, offsetY)` | `offsetX` igual; `offsetY' = originalHeight - height - offsetY` (o formato mede `offsetY` de baixo, 10.3) |

**Forma segura e recomendada: não converter propriedade por propriedade.** Calcule tudo no espaço do `.bone` e converta só a matriz final:

```
F = | 1  0 |
    | 0 -1 |
M_engine = F · M_bone · F          (parte 2×2)
t_engine = (worldX, -worldY)
```

Todas as linhas da tabela decorrem disso.

### 3.4 Texturas com origem embaixo (OpenGL)

Se a engine amostra texturas com `v = 0` na base da imagem, use `v' = 1 - v`. Isso é detalhe de renderização, não do formato. O atlas sempre entrega `v = 0` no topo.

### 3.5 Escala de referência

`skeleton.referenceScale` (padrão `100`) diz quantos pixels valem 1 unidade de física. A física (6.5) usa isso para que o mesmo rig se comporte igual em arte 1x e 4x.

### 3.6 Precisão

- JSON: números como float 64. Gravadores **DEVERIAM** limitar a 6 casas decimais.
- Binário: float 32. Um gravador `.boneb` **DEVERIA** avisar se algum valor não cabe em float 32 sem perda relativa maior que `1e-5`.
- O runtime **PODE** calcular em float 32 ou float 64.
- Onde a spec compara com `0.0001` ou `0.00001` (inclusive as guardas de 5.5), o runtime **DEVE** usar exatamente esses limiares.
- `atan2(0, 0)` é definido como `0`.
- Tolerâncias de conformidade (12.4): posição e vértice `1e-3` px; ângulo `1e-2` grau; componente de matriz `1e-4`; cor `1e-3`; física `1e-2` px com `dt` fixo; `softness` do IK `1e-1` px.

---

## 4. Modelo de dados

Esta seção define os objetos estruturais. Constraints estão na seção 6, attachments na 7, parâmetros, morphs, variáveis e eventos na 8, animações na 9.

### 4.0 Mapa em uma tela

```
raiz
├── bone { version, minVersion, generator, id, created, modified, license, copyright }
├── extensionsUsed[], extensionsRequired[]
├── skeleton { name, x, y, width, height, fps, referenceScale, pixelArt, hash }
├── assets { atlases[], imagesBase, audioBase, skeletonsBase, animations[], skins[] }
├── rig { name, bones[], slots[], reference { bone, length } }
├── bones[]        { name, parent, length, x, y, rotation, scaleX, scaleY, shearX, shearY,
│                    inheritRotation, inheritScale, inheritReflection, skinRequired, color, icon, visible, folder }
├── slots[]        { name, bone, attachment, color, darkColor, blend, visible, folder }
├── constraints[]  { type, name, mix, skinRequired, ... }      type: ik | transform | path | physics | driver
├── skins[]        { name, displayName, includes[], bones[], constraints[], attachments { slot: { placeholder: attachment | null } } }
│                    attachment.type: region | mesh | linkedmesh | boundingbox | clipping | path | point | skeleton
│                    point { x, y, rotation }
│                    skeleton { uri, x, y, rotation, scaleX, scaleY, inheritAnimation, baseAnimation, animation, loop, timeScale, ... }
├── events[]       { name, int, float, string, audio, volume, balance }
├── parameters[]   { name, min, max, default, repeat, group, displayName, source }
├── morphs[]       { name, weight, min, max, group, targets[] }
├── variables[]    { name, type, default }
├── tags[]
└── animations[]   { name, duration, loop, blend, defaultMix, tags[], crop, timelines[] ── { type, target, property, skin, attachment, keys[] } }
                     timeline.type: bone | slot | drawOrder | deform | weights | sequence | event | constraint | parameter | morph | variable | tag | nested | body
```

### 4.1 `skeleton`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | não | — | Nome do personagem. |
| `x` | number | não | `0` | Canto inferior esquerdo da caixa envolvente do setup. Informativo. |
| `y` | number | não | `0` | Idem. |
| `width` | number | não | `0` | Largura da caixa do setup. `0` = desconhecida. |
| `height` | number | não | `0` | Altura. |
| `fps` | number | não | `30` | **Só dica** para o editor (grade da timeline). Não afeta o runtime. |
| `referenceScale` | number | não | `100` | Ver 3.5. |
| `pixelArt` | boolean | não | `false` | Dica: o runtime **DEVERIA** arredondar posições finais para inteiro e usar filtro `nearest`. |
| `hash` | string | não | — | Hash do conteúdo, definido pelo gravador. Para detectar mudança. |

### 4.2 `Bone`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre ossos. |
| `parent` | name | não | — | Osso pai. Ausente só no primeiro osso (raiz). Exatamente um osso sem pai. |
| `length` | number | não | `0` | Comprimento ao longo do +X local. Usado por IK, path, physics e editor. `>= 0`. |
| `x` | number | não | `0` | Posição local, no espaço do pai. Animável. |
| `y` | number | não | `0` | Animável. |
| `rotation` | number | não | `0` | Graus, anti-horário. Animável. |
| `scaleX` | number | não | `1` | Animável. Negativo espelha. |
| `scaleY` | number | não | `1` | Animável. |
| `shearX` | number | não | `0` | Graus. Animável. |
| `shearY` | number | não | `0` | Graus. Animável. |
| `inheritRotation` | boolean | não | `true` | Herda rotação do pai. Animável (stepped). |
| `inheritScale` | boolean | não | `true` | Herda escala e shear do pai. Animável (stepped). |
| `inheritReflection` | boolean | não | `true` | Herda espelhamento (determinante negativo) do pai. Animável (stepped). |
| `skinRequired` | boolean | não | `false` | Osso que pertence a skins. Ver 7.1. |
| `color` | color4 | não | `[0.61, 0.61, 0.61, 1]` | Cor no editor. Não afeta o runtime. |
| `icon` | string | não | — | Ícone no editor. |
| `visible` | boolean | não | `true` | Visível no editor. Não afeta o runtime. |
| `folder` | string | não | — | Pasta no editor, com `/`. Informativo. |

Regras:
- O array `bones` **DEVE** vir em ordem topológica: pai antes de filho. Isso permite calcular o mundo num passe só.
- Ciclo de `parent` torna o arquivo inválido (L1).
- As oito combinações de `inherit*` estão na tabela 5.3, e todas têm fórmula (5.4): as cinco do Spine e as três do F3.

### 4.3 `Slot`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre slots. |
| `bone` | name | sim | — | Osso ao qual o slot está preso. **Animável** (`stepped`, com `transform` na chave): o desenho troca de osso no meio da animação (9.5). |
| `attachment` | string | não | — | Nome do **placeholder** visível no setup. Ausente = slot vazio. Animável (stepped). |
| `color` | color4 | não | `[1, 1, 1, 1]` | Tint multiplicativo. Animável (4 componentes). |
| `darkColor` | color3 | não | — | "Tint black": `[r, g, b]`. Ausente = sem tint black. Fórmula em 7.12. Animável. |
| `blend` | string | não | `"normal"` | `"normal"`, `"additive"`, `"multiply"`, `"screen"`. Ver 7.12. |
| `visible` | boolean | não | `true` | `false` = não desenha e não recorta. Animável (stepped). |
| `folder` | string | não | — | Pasta no editor. Informativo. Parts do Live2D caem aqui. |

A posição no array `slots` é a ordem de desenho de setup. Índice 0 desenha primeiro. Um slot mostra no máximo um attachment por vez.

### 4.4 `Skin`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único. `"default"` é o nome da pele que o editor cria primeiro e a única que ele não deixa apagar. Para o leitor é **uma pele como as outras**: só está ativa se estiver na pilha. |
| `displayName` | string | não | — | Nome para o usuário. Informativo. |
| `includes` | name[] | não | `[]` | Skins que esta skin incorpora (composição no arquivo). Aplicadas antes, na ordem. Sem ciclos (L1). |
| `bones` | name[] | não | `[]` | Ossos com `skinRequired` que esta skin ativa. |
| `constraints` | name[] | não | `[]` | Constraints com `skinRequired` que esta skin ativa. |
| `attachments` | object | não | `{}` | Mapa `slotName → { placeholderName → Attachment ou null }`. `null` **esconde** o placeholder nesta skin. |
| `drawOrder` | `{slot, offset}[]` | não | `[]` | Deslocamentos na ordem de desenho **enquanto a skin está ativa**. Mesmo formato e mesma conta da timeline `drawOrder` (9.5). A capa vestida vai para a frente do braço sem precisar de animação. Slot inexistente: L1 `REF_SLOT_MISSING`, entrada ignorada. |

**Ordem base de desenho (normativo).** A ordem de desenho que vale "sem animação" não é só a ordem do array `slots`: é a ordem do array, e por cima dela o `drawOrder` de cada skin ativa, aplicado na mesma ordem em que as peles são listadas para a resolução de attachment abaixo (cada pele da pilha, de baixo para cima, com os `includes` dela expandidos antes dela). Cada skin aplica seus deslocamentos com o algoritmo de 9.5 **sobre a ordem que as skins anteriores deixaram**. O resultado é a **ordem base**. A timeline `drawOrder` de uma animação (9.5) mede seus deslocamentos a partir da ordem base, e a chave `[]` volta para ela. Trocar de skin recalcula a ordem base; sem `drawOrder` em skin nenhuma, ordem base = ordem do array, como sempre foi.

**A pilha (normativo).** As peles ativas formam uma **pilha**: uma lista, de baixo para cima, escolhida pelo jogo ou pelo editor. Onde duas peles dão anexo ao mesmo placeholder, **a de cima vence**. A `default` não tem lugar fixo: entra na pilha como qualquer outra, ou não entra. Um leitor recém-criado nasce com a pilha `["default"]`, para um arquivo sem escolha de pele abrir como sempre abriu. Não confundir com a ordem de desenho: a pilha decide **qual** anexo aparece num placeholder; a ordem de desenho decide **na frente de quê** ele é desenhado. (Palavra do Humberto, Q32 e Q33; Apêndice A, 73.)

Resolução de attachment em runtime (pilha `S1..Sn`, de baixo para cima, slot `L`, placeholder `P`):

```
lista = para cada Si da pilha, de baixo para cima: (Si.includes expandidos em ordem, depois Si)
para skin em reversed(lista):                       // a de CIMA da pilha vence
    se skin.attachments[L] tem a chave P:
        retornar skin.attachments[L][P]               // pode ser null = esconder
retornar nada
```

- `null` conta como definição. É o "character map de ocultar" do Spriter.
- `bones` e `constraints` das skins ativas (e das incluídas) formam uma **união**.
- O runtime **PODE** ter quantas peles quiser na pilha (mix and match). A regra é uma só: a de cima vence.
- O runtime **DEVE** resolver os nomes uma vez, ao mexer na pilha, e guardar ponteiros. Não a cada quadro.
- Na virada de corpo (9.13) a pilha **passa** para o corpo novo pelo nome, ou não passa: é a chave `body` que diz (`keepSkins`).

### 4.5 `EventDef`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre eventos. |
| `int` | integer | não | `0` | Valor padrão. |
| `float` | number | não | `0` | |
| `string` | string | não | `""` | |
| `audio` | uri | não | — | Relativo a `assets.audioBase`. Com extensão. |
| `volume` | number | não | `1` | 0..1. |
| `balance` | number | não | `0` | -1 (esquerda) .. 1 (direita). |

Uma chave de evento (9.7) pode sobrescrever `int`, `float`, `string`, `volume`, `balance`. O runtime entrega o evento; **nunca** toca o áudio sozinho.

### 4.6 `Animation`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre animações. |
| `duration` | number | não | maior `time` de todas as chaves | Segundos. Pode ser maior que a última chave (segura a pose). `>= maior time` (L1). |
| `loop` | boolean | não | `false` | Dica de reprodução para editor e visualizador. O runtime decide. |
| `blend` | string | não | `"replace"` | Dica de como esta animação **DEVERIA** entrar sobre a pose atual: `"replace"`, `"add"`, `"multiply"`. Expressões do Live2D usam `add`. |
| `defaultMix` | number | não | — | Dica: duração de crossfade em segundos. |
| `tags` | string[] | não | `[]` | Tags estáticas da animação inteira (8.5). |
| `crop` | object | não | — | **Área de recorte da exportação de imagem** desta animação: `{ "x", "y", "width", "height" }`, em unidades do esqueleto, canto inferior esquerdo, como `skeleton.x/y` (4.1). **Informativo**: nenhum leitor de pose o usa. O editor o desenha em magenta e a exportação oferece as duas opções: corte automático da borda (padrão) ou este retângulo (Q21). `width` e `height` **DEVEM** ser `>= 0` (L1 `RANGE_CROP`). Nível A. |
| `timelines` | Timeline[] | não | `[]` | Ver seção 9. Vazio é válido (animação "vazia", útil para voltar à setup pose). |

**A primeira animação de `animations` é a padrão.** É a que um visualizador **DEVERIA** abrir ao carregar o arquivo, e a que um jogo **PODE** tocar sem pedir nome. Não há campo para isso: um gravador que quer outra padrão **reordena** o array. Arquivo sem animação: setup pose.

### 4.7 Tabela de referência: quem aponta para quem

| Propriedade | Aponta para | Por |
|:---|:---|:---:|
| `bone.parent` | `bones[].name` | nome |
| `slot.bone` | `bones[].name` | nome |
| `slot.attachment` | placeholder em alguma skin | nome |
| `skin.includes[]` | `skins[].name` | nome |
| `skin.bones[]`, `skin.constraints[]` | osso, constraint | nome |
| `skin.drawOrder[].slot` | `slots[].name` | nome |
| `constraint.bones[]`, `constraint.target`, `constraint.bone` | osso ou slot (seção 6) | nome |
| `constraint.parameter` (driver) | `parameters[].name` | nome |
| `driver.animation` | `animations[].name` | nome |
| `attachment (linkedmesh).parent` | placeholder no mesmo slot | nome |
| `attachment (clipping).end`, `.slots[]` | `slots[].name` | nome |
| `rig.reference.bone` | `bones[].name` do **hospedeiro** (4.8, 2.8) | nome |
| `attachment (skeleton).baseAnimation`, `.animation` | `animations[].name` **do filho** | nome |
| `morph.targets[].slot / .attachment / .skin` | slot, placeholder, skin | nome |
| `parameter.source.bone` | `bones[].name` | nome |
| `timeline.target` | depende de `timeline.type` (9.1) | nome |
| `key.value` de `bone` / `parent` (9.4) | `bones[].name`, ou `null` | nome |
| `key.value` de `slot` / `bone` (9.5) | `bones[].name`, ou `null` | nome |
| `key.value` de `body` (9.13) | um corpo do projeto (`manifest.skeletons`, 2.9), ou `null` | uri |
| `timeline (weights)` `target`, `skin`, `attachment` | slot, pele, placeholder com `binding` (9.6) | nome |
| `key.event` | `events[].name` | nome |
| `drawOrder` `{slot}` | `slots[].name` | nome |
| `binding.bones[]` | posição em `bones` | **índice** |

Referência a nome inexistente torna o arquivo **inválido** (L1), mas o leitor **DEVERIA** carregar mesmo assim, ignorando o objeto órfão e avisando. Exceção: um osso nunca é removido nem reordenado. Osso com `parent` inexistente, ou cujo pai vem depois dele no array, é tratado como filho de `bones[0]`, com aviso. Slot cujo `bone` não existe é preso a `bones[0]`. Constraint com qualquer referência quebrada é ignorada por inteiro.

Numa animação que veio de fora (2.8), `timeline.target` aponta para o esqueleto **hospedeiro**, e um alvo que ele não tem **não** é L1: é o `rig` (4.8) que diz o que o hospedeiro precisa ter, e a timeline órfã é ignorada com o aviso de lá. Do mesmo modo, numa animação com chave `body` (9.13), um `target` que não existe neste arquivo mas existe num corpo citado por essa chave **não** é L1: a chave `body` é a declaração, e o validador confere quando tem os arquivos em mãos.

### 4.8 `rig` — o contrato de rig

O que este arquivo **exige** de quem o usa. É o mesmo bloco para os dois usos: um arquivo só de animações diz quais ossos o corpo precisa ter; uma pele de fora diz quais slots ela preenche e em que ossos ela pendura os seus. O contrato é **explícito e gravado**, e não uma coincidência de nomes. Um arquivo publicado com a spec, `formato/rigs/humanoide-v1.bone`, é a convenção de nomes do projeto (14.4): quem grava com esses nomes troca animação e pele com todo mundo.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | não | — | Nome do contrato. Ex.: `"mecha-humanoide-v1"`. Informativo: dois arquivos com o mesmo `name` **DEVERIAM** exigir a mesma lista. |
| `bones` | name[] | não | `[]` | Ossos que o hospedeiro **DEVE** ter, pelo nome. Um arquivo de animações lista aqui todo `target` de timeline `bone`. |
| `slots` | name[] | não | `[]` | Slots que o hospedeiro **DEVE** ter. Uma pele de fora lista aqui os slots que preenche; um arquivo de animações, os alvos das timelines `slot`, `deform`, `weights` e `sequence`. |
| `reference` | object | não | — | Só arquivo de animações: `{ "bone": name, "length": number }`. O osso do hospedeiro cujo `length` dá a escala da animação, e o comprimento que ele tinha no esqueleto em que a animação foi gravada. O leitor multiplica as translações por `hospedeiro.length / length` ao copiar (2.8). `length > 0` (L1 `RIG_REFERENCE`). |

Regras:
- **Quem confere é o leitor do hospedeiro**, ao carregar o arquivo externo (2.8). Cada nome de `bones` e `slots` que o hospedeiro não tem gera **um** aviso L2 `RIG_UNMET`, com o nome. O arquivo abre mesmo assim: timeline órfã é ignorada (4.7), slot que a pele cita e não existe é ignorado, osso trazido pela pele cujo pai falta pendura em `bones[0]` com o mesmo aviso (4.7).
- **Dentro de um arquivo com `rig`, um nome do `rig` conta como existente.** `timeline.target`, o slot de `skin.attachments`, o alvo de uma constraint, o `parent` de um osso `skinRequired`: se o nome não está no arquivo mas está em `rig.bones` ou `rig.slots`, **não** é L1 `REF_*_MISSING` (4.7, 7.1). É uma referência ao hospedeiro, e é o `rig` que a declara. Nome que não está nem no arquivo nem no `rig` continua L1.
- `reference` só faz sentido num arquivo de animações. Numa pele de fora é ignorado (L2).
- Um gravador **DEVERIA** gerar `rig` a partir do conteúdo: os alvos das timelines, os slots das skins. Um `rig` que cita menos do que o arquivo usa é L2 `RIG_INCOMPLETE`; que cita mais, é só uma exigência mais forte, e vale.
- `rig` num esqueleto comum, sem nada externo, é permitido e inerte: serve de documentação ("este mecha obedece ao contrato `mecha-humanoide-v1`") e de dica ao editor.
- O validador (12.3) **DEVE** conferir o `rig` de um arquivo externo contra o hospedeiro quando tem os dois em mãos, e listar cada nome que falta.

---

## 5. Setup pose e cálculo de world transform

### 5.1 O que é "setup pose": a base do corpo

A **setup pose** é a **base** do corpo. É o quadro 0 que toda animação deste corpo herda: o estado de todo objeto como está gravado no arquivo, sem nenhuma animação. Cada corpo tem a sua base; um projeto tem vários corpos (2.9), e uma animação pode trocar de corpo no meio (9.13): dali em diante a base que vale é a do corpo novo.

- osso: `parent, x, y, rotation, scaleX, scaleY, shearX, shearY, inheritRotation, inheritScale, inheritReflection` (o `parent` do arquivo volta mesmo que uma chave `parent` de 9.4 o tenha trocado);
- slot: `bone, attachment, color, darkColor, blend, visible` (o `bone` do arquivo volta mesmo que uma chave `slot/bone` de 9.5 o tenha trocado); ordem de desenho = a **ordem base** de 4.4 (ordem do array `slots`, mais o `drawOrder` das peles da pilha);
- constraint: todos os seus **valores animáveis** (`mix`, `position`, `bendPositive` …) — e **só** eles;
- mesh: `vertices` ou `binding` sem deform e **com os pesos do arquivo** (a timeline `weights` de 9.6 não sobrevive à setup pose); `sequence.setup`;
- parâmetro: `default`; morph: `weight`; variável: `default`; tags: nenhuma ativa.

Regra de valor ausente: **uma propriedade sem timeline fica na setup pose.** Uma timeline só toca a propriedade que ela nomeia. Vale para qualquer runtime, com ou sem mix. É a frase do Humberto (Q27): *"mexer na base vale em todas as animações, menos onde uma chave barra"*.

**O estado de simulação NÃO é setup pose.** Uma constraint de física guarda, por instância, um estado que não está no arquivo (6.5): `xOffset`, `yOffset`, `xVelocity`, `yVelocity`, `rotateOffset`, `scaleOffset`, `remaining`, `lastTime`, `tx`, `ty`. Voltar à setup pose **NÃO** toca nesse estado. Ele **atravessa** a função `Pose` (9.10) de um quadro para o outro, e só é zerado por:

| Quem zera | Onde |
|:---|:---|
| `physicsReset` | 6.5, chamado pelo jogo |
| Timeline de constraint com `property: "reset"` | 9.8 |

São duas coisas diferentes, e a spec precisa dizer as duas: "o estado não vai no arquivo" (6.5) **não** quer dizer "o estado volta ao zero a cada quadro". Um runtime que devolve a constraint inteira ao setup a cada quadro nunca acumula nada, e a haste da física fica colada no osso pai. É o caso de conformidade **C-260**.

*(Achado pelo segundo runtime, em Python. Apêndice A, 44.)*

### 5.2 Três estados por osso

| Estado | Campos | Quem escreve |
|:---:|:---|:---|
| **Local** | `x y rotation scaleX scaleY shearX shearY inherit*` | Setup pose, depois as animações (runtime). Nunca uma constraint, nem `driver`. |
| **Aplicada** | `ax ay arotation ascaleX ascaleY ashearX ashearY` | Cópia da local no início de cada `updatePose`. Depois, as constraints, inclusive `driver` (8.2). |
| **Mundo** | `a b c d worldX worldY` | Sempre calculado a partir da **aplicada**. |

Constraints **nunca** escrevem na pose local. Escrevem na aplicada e recalculam o mundo.
Assim recalcular um osso depois não desfaz o efeito de uma constraint, e um `mix` parcial não acumula entre quadros.
A pose aplicada é estado do runtime, não vai no arquivo. Todo runtime **DEVE** ter os três estados ou algo equivalente que produza o mesmo resultado.

### 5.3 Herança: três booleanos, oito modos

| `inheritRotation` | `inheritScale` | `inheritReflection` | modo | origem |
|:---:|:---:|:---:|:---|:---|
| true | true | true | `normal` | Spine |
| false | false | false | `onlyTranslation` | Spine |
| false | true | false | `noRotationOrReflection` | Spine |
| true | false | true | `noScale` | Spine |
| true | false | false | `noScaleOrReflection` | Spine |
| false | true | true | `noRotation` | bone 1.0 (F3, Humberto 10/09/2026) |
| true | true | false | `noReflection` | bone 1.0 (F3, Humberto 10/09/2026) |
| false | false | true | `onlyReflection` | bone 1.0 (F3, Humberto 10/09/2026) |

A translação **sempre** usa a matriz completa do pai. Só a parte linear é filtrada.
As oito combinações têm fórmula (5.4). Nenhuma é L1.

`mode(bone)` abaixo devolve o modo da tabela a partir dos três booleanos **aplicados** (as timelines `inherit*` mudam o modo na hora).

### 5.4 `updateWorld(bone)` — pose aplicada → mundo (normativo)

`cosd`, `sind`, `atan2d` trabalham em graus. `sx, sy, skX, skY` são a escala e a posição do esqueleto inteiro, dadas pelo runtime (padrão `1, 1, 0, 0`). O arquivo nunca as contém. Porte fiel do `Bone.updateWorldTransform` do Spine 4.2.

```
function updateWorld(bone):
  p = bone.applied
  rotY = p.rotation + 90 + p.shearY
  la = cosd(p.rotation + p.shearX) * p.scaleX
  lb = cosd(rotY) * p.scaleY
  lc = sind(p.rotation + p.shearX) * p.scaleX
  ld = sind(rotY) * p.scaleY

  parent = bone.parent
  if parent == null:
    bone.worldX = p.x * sx + skX
    bone.worldY = p.y * sy + skY
    bone.a = la * sx;  bone.b = lb * sx
    bone.c = lc * sy;  bone.d = ld * sy
    return

  pa = parent.a; pb = parent.b; pc = parent.c; pd = parent.d
  bone.worldX = pa * p.x + pb * p.y + parent.worldX
  bone.worldY = pc * p.x + pd * p.y + parent.worldY

  // A reflexão da cadeia, sem a do esqueleto inteiro. É o teste que o
  // noScale sempre fez; os três modos do F3 também o leem.
  flip = (pa*pd - pb*pc < 0) != ((sx < 0) != (sy < 0))

  switch mode(bone):
    case normal, noReflection:
      if mode(bone) == noReflection and flip:    // F3: o pai desrefletido
        pb = -pb;  pd = -pd
      bone.a = pa*la + pb*lc;  bone.b = pa*lb + pb*ld
      bone.c = pc*la + pd*lc;  bone.d = pc*lb + pd*ld
      return                                     // a escala do esqueleto já veio pelo pai

    case onlyTranslation, onlyReflection:
      if mode(bone) == onlyReflection and flip:  // F3: vira do avesso com o pai
        lb = -lb;  ld = -ld
      bone.a = la; bone.b = lb; bone.c = lc; bone.d = ld

    case noRotationOrReflection, noRotation:
      s = pa*pa + pc*pc
      if s > 0.0001:
        s = abs(pa*pd - pb*pc) / s
        if mode(bone) == noRotation and flip:    // F3: guarda o sinal do determinante
          s = -s
        pa = pa / sx;  pc = pc / sy
        pb = pc * s;   pd = pa * s
        prx = atan2d(pc, pa)
      else:
        pa = 0; pc = 0
        prx = 90 - atan2d(pd, pb)
      rx = p.rotation + p.shearX - prx
      ry = p.rotation + p.shearY - prx + 90
      la = cosd(rx) * p.scaleX;  lb = cosd(ry) * p.scaleY
      lc = sind(rx) * p.scaleX;  ld = sind(ry) * p.scaleY
      bone.a = pa*la - pb*lc;  bone.b = pa*lb - pb*ld
      bone.c = pc*la + pd*lc;  bone.d = pc*lb + pd*ld

    case noScale, noScaleOrReflection:
      cos = cosd(p.rotation); sin = sind(p.rotation)
      za = (pa*cos + pb*sin) / sx
      zc = (pc*cos + pd*sin) / sy
      s = sqrt(za*za + zc*zc)
      if s > 0.00001: s = 1 / s
      za = za * s;  zc = zc * s
      s = sqrt(za*za + zc*zc)
      if mode(bone) == noScale and flip:
        s = -s
      r = atan2(zc, za) + PI/2                   // radianos
      zb = cos(r) * s;  zd = sin(r) * s
      la = cosd(p.shearX) * p.scaleX;       lb = cosd(90 + p.shearY) * p.scaleY
      lc = sind(p.shearX) * p.scaleX;       ld = sind(90 + p.shearY) * p.scaleY
      bone.a = za*la + zb*lc;  bone.b = za*lb + zb*ld
      bone.c = zc*la + zd*lc;  bone.d = zc*lb + zd*ld

  bone.a = bone.a * sx;  bone.b = bone.b * sx
  bone.c = bone.c * sy;  bone.d = bone.d * sy
```

**Os três modos do F3.** `noRotation`, `noReflection` e `onlyReflection` são
construídos **sobre** as fórmulas do Spine. Cada um muda uma ou duas linhas de
um modo que já existe:

| Modo | Parte de | Muda |
|:---|:---|:---|
| `noRotation` | `noRotationOrReflection` | `s` guarda o sinal do determinante do pai. Tira a rotação; guarda escala, cisalhamento simétrico e reflexão |
| `noReflection` | `normal` | com `flip`, a segunda coluna do pai troca de sinal antes do produto. O eixo X do filho continua o do pai; só a mão troca |
| `onlyReflection` | `onlyTranslation` | com `flip`, a segunda coluna local troca de sinal. Sem rotação e sem escala, o filho vira do avesso junto com o pai |

Eles **não** saem de uma decomposição única do pai (`A = R·F·S`), porque as
cinco do Spine também não saem: medido, a decomposição difere do
`noRotationOrReflection` em até 1,39 e dos dois `noScale` em até 0,85
(Apêndice A, 70). Oito modos numa família só valem mais que três modos numa
família diferente.

`flip` não conta a virada do esqueleto inteiro (`sx` ou `sy` negativo): um
personagem que o jogo vira de lado não vira duas vezes. Com `sx = sy = 1`,
`flip` é só `pa*pd − pb*pc < 0`. Casos C-283 a C-285.

### 5.5 Mundo → local e mundo → aplicada

Usado pelas constraints que mexem direto na matriz (transform, path, physics).

**Determinante degenerado.** Em `worldToLocal`, se `|det| <= 0.0001`, devolver `(0, 0)`. Em `appliedFromWorld`, se `|pa*pd − pb*pc| <= 0.0001`, usar `pid = 0` (logo `ia = ib = ic = id = 0`); nos ramos `noRotationOrReflection` e `noRotation`, se `pa*pa + pc*pc <= 0.0001`, usar `s = 0`. Qualquer resultado de fórmula desta spec que seria NaN ou ±Infinity **DEVE** ser substituído por `0` antes de entrar na pose.

```
function worldToLocal(bone, wx, wy):
  det = bone.a * bone.d - bone.b * bone.c
  x = wx - bone.worldX;  y = wy - bone.worldY
  return ( (x * bone.d - y * bone.b) / det,
           (y * bone.a - x * bone.c) / det )

function localToWorld(bone, lx, ly):
  return ( bone.a * lx + bone.b * ly + bone.worldX,
           bone.c * lx + bone.d * ly + bone.worldY )

function appliedFromWorld(bone):
  p = bone.applied
  parent = bone.parent
  if parent == null:
    p.x = (bone.worldX - skX) / sx;  p.y = (bone.worldY - skY) / sy
    p.rotation = atan2d(bone.c, bone.a)
    p.scaleX = sqrt(bone.a² + bone.c²);  p.scaleY = sqrt(bone.b² + bone.d²)
    p.shearX = 0
    p.shearY = atan2d(bone.a*bone.b + bone.c*bone.d, bone.a*bone.d - bone.b*bone.c)
    return
    # ATENÇÃO — o sinal do `shearY` aqui é o OPOSTO do sinal usado no ramo com
    # pai, que faz `p.shearY = -atan2d(ra*rb + rc*rd, det)`. Não é erro de
    # digitação nesta linha: é o comportamento portado do Spine 4.2
    # (`updateAppliedTransform`), e está escrito aqui para que quem portar não
    # "conserte" um dos dois lados por conta própria e divirja do resto do
    # mundo. A consequência é que na raiz `mundo -> aplicada -> mundo` NÃO
    # fecha: uma raiz com rotation 0 e shearY 30 volta como shearY -30.
    #
    # DECISÃO EM ABERTO. A §12.4 já exige conferir as fórmulas portadas contra
    # o `spine-runtimes` em C++ antes de congelar a 1.0. Se a conferência
    # confirmar que o sinal está invertido também lá, os dois ramos passam a
    # usar `-atan2d(...)`, e o teste do runtime de referência que hoje
    # DOCUMENTA o sinal passa a EXIGIR o sinal corrigido. Enquanto a
    # conferência não acontecer, o comportamento normativo é o escrito acima —
    # e nenhum arquivo depende dele, porque um esqueleto só passa por
    # `appliedFromWorld` quando tem regra, e a raiz raramente tem.

  pa = parent.a; pb = parent.b; pc = parent.c; pd = parent.d
  pid = 1 / (pa*pd - pb*pc)
  ia = pd*pid; ib = pb*pid; ic = pc*pid; id = pa*pid
  dx = bone.worldX - parent.worldX;  dy = bone.worldY - parent.worldY
  p.x = dx*ia - dy*ib
  p.y = dy*id - dx*ic

  flip = (pa*pd - pb*pc < 0) != ((sx < 0) != (sy < 0))     // o mesmo de 5.4
  if mode(bone) == onlyTranslation or mode(bone) == onlyReflection:
    ra = bone.a; rb = bone.b; rc = bone.c; rd = bone.d
    if mode(bone) == onlyReflection and flip:                // F3: desfaz a coluna virada
      rb = -rb;  rd = -rd
  else:
    if mode(bone) == noReflection:
      if flip:                                               // F3: o pai desrefletido, como na ida
        pb = -pb;  pd = -pd
        pid = 1 / (pa*pd - pb*pc)
        ia = pd*pid; ib = pb*pid; ic = pc*pid; id = pa*pid
    else if mode(bone) == noRotationOrReflection or mode(bone) == noRotation:
      s = abs(pa*pd - pb*pc) / (pa*pa + pc*pc)
      if mode(bone) == noRotation and flip: s = -s           // F3
      sa = pa / sx;  sc = pc / sy
      pb = -sc * s * sx;  pd = sa * s * sy
      pid = 1 / (pa*pd - pb*pc)
      ia = pd*pid; ib = pb*pid
    else if mode(bone) == noScale or mode(bone) == noScaleOrReflection:
      cos = cosd(p.rotation); sin = sind(p.rotation)
      pa = (pa*cos + pb*sin) / sx
      pc = (pc*cos + pd*sin) / sy
      s = sqrt(pa*pa + pc*pc)
      if s > 0.00001: s = 1 / s
      pa = pa * s;  pc = pc * s
      s = sqrt(pa*pa + pc*pc)
      if mode(bone) == noScale and ((pid < 0) != ((sx < 0) != (sy < 0))): s = -s
      r = PI/2 + atan2(pc, pa)
      pb = cos(r) * s;  pd = sin(r) * s
      pid = 1 / (pa*pd - pb*pc)
      ia = pd*pid; ib = pb*pid; ic = pc*pid; id = pa*pid
    ra = ia*bone.a - ib*bone.c;  rb = ia*bone.b - ib*bone.d
    rc = id*bone.c - ic*bone.a;  rd = id*bone.d - ic*bone.b

  p.shearX = 0
  p.scaleX = sqrt(ra*ra + rc*rc)
  if p.scaleX > 0.0001:
    det = ra*rd - rb*rc
    p.scaleY = det / p.scaleX
    p.shearY = -atan2d(ra*rb + rc*rd, det)
    p.rotation = atan2d(rc, ra)
  else:
    p.scaleX = 0
    p.scaleY = sqrt(rb*rb + rd*rd)
    p.shearY = 0
    p.rotation = 90 - atan2d(rd, rb)
```

### 5.6 `updatePose` — algoritmo de referência por quadro

O resultado deste algoritmo **define** a pose correta.

```
function updatePose(skeleton, now):
  // 1. a pose local já está pronta: setup + animações (feito pelo runtime, 9.10)
  for bone in skeleton.bones:                  // ordem do array
    bone.applied = bone.local

  // 2. constraints, na ordem do array
  for c in skeleton.constraints:
    if c.skinRequired and c not in activeSkinConstraints: continue
    if c.mix == 0: continue
    for bone in skeleton.bones: updateWorld(bone)       // referência: recalcula tudo
    apply(c, now)                                       // escreve applied + world dos ossos afetados (seções 6 e 8)

  // 3. mundo final: SÓ os ossos sujos (ver a regra de sujeira abaixo)
  for bone in skeleton.bones:
    if bone.dirty: updateWorld(bone)

  // 4. pose dos attachments: vértices de mundo (7.4), ordem de desenho, clipping — seção 7
```

**Ordem de cálculo com troca de pai (normativa).** "Ordem do array", nos laços acima, é a ordem em que **pai vem antes de filho** — que é a ordem do array enquanto ninguém troca de pai. Quando uma chave `parent` (9.4) muda o pai aplicado de um osso, o runtime **DEVE** refazer a ordem naquele quadro: uma travessia da árvore atual a partir das raízes, filhos na ordem do array, e usar essa ordem nos passos 1 e 3 até o pai mudar de novo. Um runtime que continue no array lê a matriz do pai novo **antes** de ela ser calculada quando o pai novo vem depois do filho no array — é o que o caso **C-281** cobra, com o pai novo animado.

**Regra de sujeira (normativa).** Um osso cuja matriz de mundo **uma constraint escreveu** **NÃO DEVE** ser recalculado a partir da pose aplicada. Só os **descendentes** dele são recalculados.

A regra completa, que todo runtime **DEVE** seguir:

| Momento | Regra |
|:---|:---|
| Antes de aplicar a constraint `c` | Os ossos que `c` **lê** (alvo, ossos constrangidos e seus ancestrais) **DEVEM** ter a matriz de mundo em dia. |
| Depois de aplicar `c` | Os ossos cuja matriz `c` **escreveu** ficam **limpos**: a matriz que ela deixou é a matriz final. Todos os **descendentes** deles ficam **sujos** e **DEVEM** ser recalculados antes de serem lidos de novo. |
| No passo 3 | Recalcula só quem está sujo. |

**Por que isso é normativo, e não uma otimização.** Uma constraint escreve a matriz de mundo do osso e depois chama `appliedFromWorld` (5.5). Sob cisalhamento, a 5.5 **perde** informação: ela devolve `ascaleY = det / ascaleX`, que é menor que o comprimento real da coluna pelo fator `cos(shearY)`. Refazer `updateWorld` a partir dessa pose aplicada **não devolve a matriz que a constraint deixou**.

O caso de conformidade **C-230** mede exatamente isso. Recalcular tudo no passo 3 dá `b = −0,433013` e `d = 0,75`; a matriz que a constraint deixou, e que o caso cobra, é `b = −0,5` e `d = 0,866025`. A diferença é de 0,116, num campo com tolerância de 0,0001.

Enquanto a 5.5 for aproximada sob cisalhamento, "recalcular tudo" e "recalcular só o sujo" **não** dão o mesmo resultado. A leitura correta é a segunda.

*(Achado pelo segundo runtime, em Python, escrito só a partir deste texto. Apêndice A, 43.)*

**Ossos de skin.** Ossos com `skinRequired: true` que nenhuma skin ativa lista são calculados normalmente (ficam na pose local). Só constraints com `skinRequired: true` fora da skin ativa são puladas. Isso diverge do Spine (que não atualiza esses ossos); a diferença está registrada em 13.1 e é invisível quando o rig foi feito no editor, porque nada desenha neles.

### 5.7 Ordem dentro de um quadro (visão do runtime)

```
1. runtime: avança o tempo das animações; escreve pose local, slots, deform, morphs, parâmetros, variáveis, tags
2. updatePose(skeleton, now)                            // 5.6
3. runtime: dispara os eventos ocorridos no intervalo   // 8.6
4. runtime: calcula vértices de mundo dos attachments visíveis e desenha em ordem de draw order, com clipping (7.7)
```

Eventos nunca mudam a pose. São só notificação.

---

## 6. Constraints

### 6.1 Regras comuns

Todas ficam no array raiz `constraints`. O campo `type` diz qual é. A ordem do array é a ordem de aplicação (5.6).

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `type` | string | sim | — | `"ik"`, `"transform"`, `"path"`, `"physics"`, `"driver"`. Tipos de extensão: prefixados (2.7). |
| `name` | string | sim | — | Único entre constraints. |
| `mix` | number | não | `1` | `0` = desligada, `1` = total. Animável. |
| `skinRequired` | boolean | não | `false` | Só ativa quando uma skin ativa a lista em `skin.constraints`. |

Regras:

1. `mix` geral: `0` desliga, `1` aplica por inteiro. Constraints com mixes por propriedade multiplicam: `efetivo = mix × mixPropriedade`.
2. Toda constraint escreve na pose **aplicada** e no mundo dos ossos que altera. Nunca na pose local. Exceção: `driver` com alvo que não é osso (8.2) escreve no estado do alvo (slot, deform, parâmetro …).
3. Uma constraint só lê o estado como está no momento em que é aplicada (ordem do array). Sem look-ahead.
4. Ciclos não existem: a ordem do array resolve tudo. Um osso pode ser alvo de várias constraints.
5. Todos os ângulos internos das fórmulas abaixo estão em **radianos**, salvo quando marcado com `d` (graus). `normalize(r)` leva radianos para `(-π, π]`; `normalized(g)` leva graus para `(-180, 180]`.
6. Leitor de nível A ou B (12.2) ignora todas as constraints: os ossos ficam em FK.
7. O pseudocódigo desta spec é **normativo**. O Spine 4.2 é só a origem; onde divergirem, vale o texto e a divergência entra em 13.1 com perda ≈.

### 6.2 `ik`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `bones` | name[] | sim | — | 1 ou 2 ossos. Com 2, `bones[1].parent` **DEVE** ser `bones[0]` (L1). |
| `target` | name | sim | — | Osso alvo. Sua posição de mundo é o objetivo. Não pode ser um dos `bones` nem descendente deles (L1). |
| `bendPositive` | boolean | não | `true` | 2 ossos: lado da dobra. `true` = ângulo positivo (anti-horário). Animável (stepped). |
| `compress` | boolean | não | `false` | 1 osso: encolhe `scaleX` para a ponta chegar ao alvo mais perto. Animável (stepped). |
| `stretch` | boolean | não | `false` | Estica `scaleX` para a ponta chegar ao alvo mais longe. Animável (stepped). |
| `uniform` | boolean | não | `false` | Ao esticar ou comprimir, mexe também em `scaleY`. Animável (stepped). |
| `softness` | number | não | `0` | 2 ossos: pixels antes da extensão máxima em que o movimento amacia. Animável. |

Com 2 ossos, ambos **DEVEM** estar no modo `normal` (L1). IK de N ossos fica na extensão `BONE_ik_chain` (2.7).

**IK de 1 osso.** `bone = bones[0]`, `(tx, ty)` = posição de mundo do alvo, `mix` = efetivo.

```
function ik1(bone, tx, ty, compress, stretch, uniform, mix):
  p = bone.parent                         // a raiz não pode ser constrangida por IK (L1)
  pa = p.a; pb = p.b; pc = p.c; pd = p.d
  rot = -bone.applied.shearX - bone.applied.rotation         // graus

  flip = (pa*pd - pb*pc < 0) != ((sx < 0) != (sy < 0))     // o mesmo de 5.4
  switch mode(bone):
    case onlyTranslation, onlyReflection:   // onlyReflection (F3): só o eixo Y vira; a mira usa o X
      lx = (tx - bone.worldX) * sign(sx)
      ly = (ty - bone.worldY) * sign(sy)
    case noReflection:                      // F3: o pai desrefletido, medido do próprio osso
      if flip: pb = -pb; pd = -pd
      x = tx - bone.worldX;  y = ty - bone.worldY
      det = pa*pd - pb*pc
      if abs(det) <= 0.0001: lx = 0; ly = 0
      else:
        lx = (x*pd - y*pb) / det
        ly = (y*pa - x*pc) / det
    case noRotationOrReflection, noRotation:
      s = abs(pa*pd - pb*pc) / max(0.0001, pa*pa + pc*pc)
      if mode(bone) == noRotation and flip: s = -s           // F3
      sa = pa / sx;  sc = pc / sy
      pb = -sc * s * sx;  pd = sa * s * sy
      rot = rot + atan2d(sc, sa)
      // continua no caso geral
    default:
      x = tx - p.worldX;  y = ty - p.worldY
      det = pa*pd - pb*pc
      if abs(det) <= 0.0001: lx = 0; ly = 0
      else:
        lx = (x*pd - y*pb) / det - bone.applied.x
        ly = (y*pa - x*pc) / det - bone.applied.y

  rot = rot + atan2d(ly, lx)
  if bone.applied.scaleX < 0: rot = rot + 180
  rot = normalized(rot)

  scX = bone.applied.scaleX;  scY = bone.applied.scaleY
  if compress or stretch:
    if mode(bone) == noScale or mode(bone) == noScaleOrReflection:
      lx = tx - bone.worldX;  ly = ty - bone.worldY
    b = bone.length * scX
    if b > 0.0001:
      dd = lx*lx + ly*ly
      if (compress and dd < b*b) or (stretch and dd > b*b):
        s = (sqrt(dd) / b - 1) * mix + 1
        scX = scX * s
        if uniform: scY = scY * s

  bone.applied.rotation = bone.applied.rotation + rot * mix
  bone.applied.scaleX = scX;  bone.applied.scaleY = scY
  updateWorld(bone)
```

**IK de 2 ossos.** `P = bones[0]`, `C = bones[1]`. Tudo no espaço do pai de `P` (identidade se `P` é a raiz). Inclui o ramo de escala **não uniforme** do pai (interseção com elipse), portado do Spine 4.2. Não há aproximação.

```
function ik2(P, C, tx, ty, bendPositive, stretch, uniform, softness, mix):
  bendDir = bendPositive ? 1 : -1
  px = P.applied.x;  py = P.applied.y
  psx = P.applied.scaleX;  psy = P.applied.scaleY;  csx = C.applied.scaleX
  sxP = psx;  syP = psy                       // escalas finais de P (podem esticar)
  os1 = 0; s2 = 1; os2 = 0
  if psx < 0: psx = -psx; os1 = 180; s2 = -1
  if psy < 0: psy = -psy; s2 = -s2
  if csx < 0: csx = -csx; os2 = 180

  cx = C.applied.x
  u = abs(psx - psy) <= 0.0001
  if not u or stretch:
    cy = 0
    cwx = P.a*cx + P.worldX;  cwy = P.c*cx + P.worldY
  else:
    cy = C.applied.y
    cwx = P.a*cx + P.b*cy + P.worldX;  cwy = P.c*cx + P.d*cy + P.worldY

  pp = P.parent
  (a, b, c, d, ppx, ppy) = pp ? (pp.a, pp.b, pp.c, pp.d, pp.worldX, pp.worldY) : (1, 0, 0, 1, 0, 0)
  id = a*d - b*c
  id = (abs(id) <= 0.0001) ? 0 : 1 / id
  x = cwx - ppx;  y = cwy - ppy
  dx = (x*d - y*b) * id - px;  dy = (y*a - x*c) * id - py       // origem de C relativa a P
  l1 = sqrt(dx*dx + dy*dy)
  l2 = C.length * csx

  if l1 < 0.0001:                             // C nasce em cima de P: degenera em IK de 1 osso
    ik1(P, tx, ty, false, stretch, false, mix)
    C.applied.rotation = 0;  updateWorld(C)
    return

  x = tx - ppx;  y = ty - ppy
  ttx = (x*d - y*b) * id - px;  tty = (y*a - x*c) * id - py     // alvo relativo a P
  dd = ttx*ttx + tty*tty

  if softness != 0:
    softness = softness * psx * (csx + 1) / 2
    td = sqrt(dd)
    sd = td - l1 - l2*psx + softness
    if sd > 0:
      pz = min(1, sd / (softness * 2)) - 1
      pz = (sd - softness * (1 - pz*pz)) / td
      ttx = ttx - pz*ttx;  tty = tty - pz*tty
      dd = ttx*ttx + tty*tty

  if u:                                       // escala uniforme do pai
    l2 = l2 * psx
    cos = (dd - l1*l1 - l2*l2) / (2 * l1 * l2)
    if cos < -1:
      cos = -1;  a2 = PI * bendDir
    else if cos > 1:
      cos = 1;   a2 = 0
      if stretch:
        k = (sqrt(dd) / (l1 + l2) - 1) * mix + 1
        sxP = sxP * k
        if uniform: syP = syP * k
    else:
      a2 = acos(cos) * bendDir
    a = l1 + l2*cos;  b = l2 * sin(a2)
    a1 = atan2(tty*a - ttx*b, ttx*a + tty*b)
  else:                                       // escala não uniforme do pai: interseção com elipse
    a = psx * l2;  b = psy * l2
    aa = a*a;  bb = b*b;  ta = atan2(tty, ttx)
    c = bb*l1*l1 + aa*dd - aa*bb
    c1 = -2*bb*l1;  c2 = bb - aa
    d = c1*c1 - 4*c2*c
    solved = false
    if d >= 0:
      q = sqrt(d)
      if c1 < 0: q = -q
      q = -(c1 + q) / 2
      r0 = q / c2;  r1 = c / q
      r = (abs(r0) < abs(r1)) ? r0 : r1
      r0 = dd - r*r
      if r0 >= 0:
        y = sqrt(r0) * bendDir
        a1 = ta - atan2(y, r)
        a2 = atan2(y / psy, (r - l1) / psx)
        solved = true
    if not solved:                            // alvo fora do alcance: ponto mais perto ou mais longe da elipse
      minAngle = PI;  minX = l1 - a;  minDist = minX*minX;  minY = 0
      maxAngle = 0;   maxX = l1 + a;  maxDist = maxX*maxX;  maxY = 0
      c = -a*l1 / (aa - bb)
      if c >= -1 and c <= 1:
        c = acos(c)
        x = a*cos(c) + l1;  y = b*sin(c)
        d = x*x + y*y
        if d < minDist: minAngle = c; minDist = d; minX = x; minY = y
        if d > maxDist: maxAngle = c; maxDist = d; maxX = x; maxY = y
      if dd <= (minDist + maxDist) / 2:
        a1 = ta - atan2(minY * bendDir, minX);  a2 = minAngle * bendDir
      else:
        a1 = ta - atan2(maxY * bendDir, maxX);  a2 = maxAngle * bendDir

  os = atan2(cy, cx) * s2
  r1 = normalized( (a1 - os) * RAD2DEG + os1 - P.applied.rotation )
  P.applied.rotation = P.applied.rotation + r1 * mix
  P.applied.scaleX = sxP;  P.applied.scaleY = syP
  P.applied.shearX = 0;  P.applied.shearY = 0
  updateWorld(P)

  r2 = normalized( ((a2 + os) * RAD2DEG - C.applied.shearX) * s2 + os2 - C.applied.rotation )
  C.applied.rotation = C.applied.rotation + r2 * mix
  updateWorld(C)
```

### 6.3 `transform`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `bones` | name[] | sim | — | Ossos constrangidos. Mínimo 1. |
| `target` | name | sim | — | Osso fonte. |
| `local` | boolean | não | `false` | `true` = compara poses aplicadas (locais). `false` = compara mundo. |
| `relative` | boolean | não | `false` | `true` = soma o valor do alvo. `false` = vai em direção ao valor do alvo. |
| `offsetRotation` | number | não | `0` | Graus somados ao alvo. |
| `offsetX` | number | não | `0` | Deslocamento no espaço do alvo. |
| `offsetY` | number | não | `0` | |
| `offsetScaleX` | number | não | `0` | Somado à escala do alvo. |
| `offsetScaleY` | number | não | `0` | |
| `offsetShearY` | number | não | `0` | Graus somados ao shear Y do alvo. |
| `mixRotation` | number | não | `1` | Peso da rotação. Animável. |
| `mixX` | number | não | `1` | Animável. |
| `mixY` | number | não | `1` | Animável. |
| `mixScaleX` | number | não | `1` | Animável. |
| `mixScaleY` | number | não | `1` | Animável. |
| `mixShearY` | number | não | `1` | Animável. |

Mixes efetivos: `mR = mix×mixRotation`, `mX = mix×mixX`, `mY`, `mSX`, `mSY`, `mSH`. Se todos forem `0`, nada acontece.

**Modo mundo, absoluto** (`local: false, relative: false`):

```
function transformWorldAbsolute(c):
  t = c.target
  ta = t.a; tb = t.b; tc = t.c; td = t.d
  reflect = (ta*td - tb*tc > 0) ? DEG2RAD : -DEG2RAD
  offR = c.offsetRotation * reflect
  offSh = c.offsetShearY * reflect
  for bone in c.bones:
    if mR != 0:
      a = bone.a; b = bone.b; cc = bone.c; d = bone.d
      r = normalize( atan2(tc, ta) - atan2(cc, a) + offR ) * mR
      cos = cos(r); sin = sin(r)
      bone.a = cos*a - sin*cc;  bone.b = cos*b - sin*d
      bone.c = sin*a + cos*cc;  bone.d = sin*b + cos*d
    if mX != 0 or mY != 0:
      (wx, wy) = localToWorld(t, c.offsetX, c.offsetY)
      bone.worldX = bone.worldX + (wx - bone.worldX) * mX
      bone.worldY = bone.worldY + (wy - bone.worldY) * mY
    if mSX != 0:
      s = sqrt(bone.a² + bone.c²)
      if s != 0: s = (s + (sqrt(ta² + tc²) - s + c.offsetScaleX) * mSX) / s
      bone.a = bone.a * s;  bone.c = bone.c * s
    if mSY != 0:
      s = sqrt(bone.b² + bone.d²)
      if s != 0: s = (s + (sqrt(tb² + td²) - s + c.offsetScaleY) * mSY) / s
      bone.b = bone.b * s;  bone.d = bone.d * s
    if mSH > 0:
      b = bone.b; d = bone.d
      by = atan2(d, b)
      r = normalize( atan2(td, tb) - atan2(tc, ta) - (by - atan2(bone.c, bone.a)) )
      r = by + (r + offSh) * mSH
      s = sqrt(b*b + d*d)
      bone.b = cos(r) * s;  bone.d = sin(r) * s
    appliedFromWorld(bone)
```

**Modo mundo, relativo** (`local: false, relative: true`): mesma estrutura, trocando cada passo por:

```
rotação:  r = normalize( atan2(tc, ta) + offR ) * mR                        // soma, não aproxima
posição:  (wx, wy) = localToWorld(t, c.offsetX, c.offsetY)      // inclui a posição de mundo do alvo, como o Spine
          bone.worldX += wx * mX;  bone.worldY += wy * mY
escala X: s = (sqrt(ta² + tc²) - 1 + c.offsetScaleX) * mSX + 1;  a *= s; c *= s
escala Y: s = (sqrt(tb² + td²) - 1 + c.offsetScaleY) * mSY + 1;  b *= s; d *= s
shear Y:  r = normalize( atan2(td, tb) - atan2(tc, ta) )
          r = atan2(d, b) + (r - PI/2 + offSh) * mSH;  s = sqrt(b² + d²);  b = cos(r)*s; d = sin(r)*s
```

**Modo local, absoluto** (`local: true, relative: false`), tudo em graus, na pose aplicada:

```
for bone in c.bones:
  q = bone.applied;  tq = t.applied
  q.rotation += (tq.rotation - q.rotation + c.offsetRotation) * mR      // sem wrap, como 9.3
  q.x        += (tq.x - q.x + c.offsetX) * mX
  q.y        += (tq.y - q.y + c.offsetY) * mY
  q.scaleX   += (tq.scaleX - q.scaleX + c.offsetScaleX) * mSX
  q.scaleY   += (tq.scaleY - q.scaleY + c.offsetScaleY) * mSY
  q.shearY   += (tq.shearY - q.shearY + c.offsetShearY) * mSH
  updateWorld(bone)
```

**Modo local, relativo** (`local: true, relative: true`):

```
  q.rotation += (tq.rotation + c.offsetRotation) * mR
  q.x        += (tq.x + c.offsetX) * mX
  q.y        += (tq.y + c.offsetY) * mY
  q.scaleX   *= (tq.scaleX - 1 + c.offsetScaleX) * mSX + 1
  q.scaleY   *= (tq.scaleY - 1 + c.offsetScaleY) * mSY + 1
  q.shearY   += (tq.shearY + c.offsetShearY) * mSH
  updateWorld(bone)
```

Mapear uma propriedade em outra com faixas e limite (rotação do alvo virando escala do osso; `mappings` do Spine 4.3) **não** é função da transform. Isso é `parameter` com `source` + `driver` (seção 8).

### 6.4 `path`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `bones` | name[] | sim | — | Ossos distribuídos ao longo do caminho, na ordem. Mínimo 1. |
| `target` | name | sim | — | **Slot** cujo attachment atual é do tipo `path`. |
| `positionMode` | string | não | `"percent"` | `"fixed"` (px ao longo do caminho) ou `"percent"` (0..1 do comprimento). |
| `spacingMode` | string | não | `"length"` | `"length"`, `"fixed"`, `"percent"`, `"proportional"`. Tabela abaixo. |
| `rotateMode` | string | não | `"tangent"` | `"tangent"`, `"chain"`, `"chainScale"`. Tabela abaixo. |
| `offsetRotation` | number | não | `0` | Graus somados à rotação calculada. |
| `position` | number | não | `0` | Posição do primeiro osso. Unidade conforme `positionMode`. Animável. |
| `spacing` | number | não | `0` | Espaço entre ossos. Unidade conforme `spacingMode`. Animável. |
| `mixRotation` | number | não | `1` | Animável. |
| `mixX` | number | não | `1` | Animável. |
| `mixY` | number | não | `1` | Animável. |

| `spacingMode` | espaço entre o osso `i-1` e o osso `i` |
|:---:|:---|
| `"length"` | `bones[i-1].length × escalaMundoX + spacing`, em pixels de mundo. |
| `"fixed"` | `spacing`, em pixels de mundo (escalado pelo osso, ver algoritmo). |
| `"percent"` | `spacing × comprimento do caminho`. |
| `"proportional"` | Comprimentos de mundo dos ossos, reescalados para que a soma seja `m × spacing`, com `m = n` em `tangent` e `m = n + 1` em `chain`/`chainScale`. |

| `rotateMode` | rotação do osso |
|:---:|:---|
| `"tangent"` | Tangente do caminho no ponto. |
| `"chain"` | Aponta para a posição do próximo osso. |
| `"chainScale"` | Como `chain`, e ainda estica `scaleX` para a ponta encostar no próximo osso. |

Se o attachment ativo do slot não for `path`, a constraint não faz nada.

**Definição do caminho.** O attachment `path` (7.8) tem `K` âncoras e `3K` pontos: para a âncora `i`, os pontos `3i` (alça de chegada), `3i+1` (âncora) e `3i+2` (alça de saída). A curva `k` vai da âncora `k` à âncora `k+1`, com a alça de saída de `k` e a de chegada de `k+1`. Aberto: `K−1` curvas; a alça de chegada de 0 e a de saída de `K−1` são ignoradas. Fechado: `K` curvas; a última liga `K−1` a `0`. Ponto na curva em `t ∈ [0,1]`: `B(t) = (1−t)³A + 3(1−t)²t·H1 + 3(1−t)t²·H2 + t³B`.

**Comprimento.** Cada curva é dividida em **10 segmentos** lineares (`t = 0.1, 0.2 … 1`). A soma dos segmentos é o comprimento da curva. `constantSpeed: true` usa esses comprimentos calculados nos vértices **de mundo** do quadro atual e localiza `t` por arco (interpolação linear dentro do segmento). `constantSpeed: false` usa o array `lengths` gravado no attachment (setup pose) para escolher a curva e avalia `t` uniforme dentro dela.

**Qual comprimento é o `total`.** Um caminho tem dois comprimentos possíveis: o do array `lengths` gravado no attachment (setup pose) e o calculado nos vértices de mundo do quadro. O `total` é **o mesmo que localiza `t`**, e não outro: `constantSpeed: true` usa o **calculado**; `constantSpeed: false` usa o **gravado**. Vale para o `total` de `positionMode: "percent"` e para o de `spacingMode: "percent"`. Com um osso escalando o caminho, os dois divergem, e misturar os dois põe o osso fora do caminho.

**Fora de faixa (normativo).** Caminho fechado: `q = q mod total` (resultado em `[0, total)`).

Caminho aberto, as duas funções que o pseudocódigo chama:

| Função | Âncora | Direção da reta | Distância |
|:---|:---|:---|:---|
| `extrapolaAntes(W, q)`, com `q < 0` | âncora 0 | **da alça de saída para a âncora**: `dir = A0 − H_saída(0)`, normalizada | anda `|q|` ao longo de `dir` a partir de `A0` |
| `extrapolaDepois(W, r)`, com `r = q − total > 0` | última âncora `A_last` | **da alça de chegada para a âncora**: `dir = A_last − H_chegada(last)`, normalizada | anda `r` ao longo de `dir` a partir de `A_last` |

A tangente devolvida é o ângulo dessa reta: `atan2(dir.y, dir.x)` na ponta da frente, e o mesmo ângulo na ponta de trás (a tangente aponta sempre no sentido de crescimento de `q`, isto é, do começo para o fim do caminho).

**Alça em cima da âncora.** Se `dir` tem comprimento menor que `1e-5` — a alça está em cima da âncora —, a direção vem da **âncora vizinha** no lugar da alça: `A0 − A1` na frente, `A_last − A_{last−1}` atrás. Se essa também for degenerada, `dir = (1, 0)`.

*(Escrito depois do segundo runtime. As duas funções eram chamadas e nunca definidas; o sinal da direção muda o resultado em 180°. Apêndice A, 47.)*

**Algoritmo** (porte do `PathConstraint.update` do Spine 4.2):

```
function pathApply(c):
  slot = slots[c.target];  path = slot.attachmentAtual
  if path == null or path.type != "path": return
  mR = c.mix*c.mixRotation; mX = c.mix*c.mixX; mY = c.mix*c.mixY
  if mR == 0 and mX == 0 and mY == 0: return
  n = len(c.bones)
  scale = (c.rotateMode == "chainScale")
  tangents = (c.rotateMode == "tangent")
  spaces[0] = 0

  // 1. espaços
  for i in 0..n-1:
    bone = c.bones[i]; setupLength = bone.length
    worldLen = setupLength * sqrt(bone.a² + bone.c²)
    if scale: lengths[i] = (setupLength < 0.00001) ? 0 : worldLen
    switch c.spacingMode:
      "percent":       spaces[i+1] = c.spacing                       // vira pixels no passo 2
      "fixed":         spaces[i+1] = (setupLength < 0.00001) ? c.spacing : c.spacing * worldLen / setupLength
      "length":        spaces[i+1] = (setupLength < 0.00001) ? c.spacing : (setupLength + c.spacing) * worldLen / setupLength
      "proportional":  spaces[i+1] = (setupLength < 0.00001) ? c.spacing : worldLen
  if c.spacingMode == "proportional":
    m = tangents ? n : n + 1
    sum = Σ spaces[1..n];  if sum > 0: k = m / sum * c.spacing;  spaces[1..n] *= k

  // 2. posições no caminho
  W = worldVertices(path, slot)                          // 7.4, considera pesos
  L = comprimentos(W, path.closed, path.constantSpeed)   // tabela acumulada por curva e por segmento
  total = L.total
  pos = c.position;  if c.positionMode == "percent": pos = pos * total
  if c.spacingMode == "percent": spaces[1..n] *= total

  for i in 0..n:                        // n+1 amostras: origem de cada osso e a ponta do último
    pos = pos + spaces[i]
    q = pos
    if path.closed: q = q mod total; if q < 0: q += total
    else if q < 0:  P[i], T[i] = extrapolaAntes(W, q);  continue
    else if q > total: P[i], T[i] = extrapolaDepois(W, q - total);  continue
    (curva k, t) = localizar(L, q)      // constantSpeed: por arco; senão: por lengths de setup e t uniforme
    P[i] = Bezier(W, k, t)
    if tangents or (i == n and not scale): T[i] = ânguloDaTangente(W, k, t)   // radianos

  // 3. aplicar aos ossos
  bx = P[0].x; by = P[0].y
  offR = c.offsetRotation
  tip = false
  if offR == 0: tip = (c.rotateMode == "chain")
  else:
    pb = slot.bone
    offR = offR * ((pb.a*pb.d - pb.b*pb.c > 0) ? DEG2RAD : -DEG2RAD)
  for i in 0..n-1:
    bone = c.bones[i]
    bone.worldX += (bx - bone.worldX) * mX
    bone.worldY += (by - bone.worldY) * mY
    x = P[i+1].x; y = P[i+1].y; dx = x - bx; dy = y - by
    if scale and lengths[i] != 0:
      s = (sqrt(dx*dx + dy*dy) / lengths[i] - 1) * mR + 1
      bone.a *= s; bone.c *= s
    bx = x; by = y
    if mR > 0:
      a = bone.a; b = bone.b; cc = bone.c; d = bone.d
      if tangents: r = T[i]
      else if spaces[i+1] == 0: r = T[i+1]
      else: r = atan2(dy, dx)
      r = r - atan2(cc, a)
      if tip:
        cos = cos(r); sin = sin(r); len = bone.length
        bx += (len * (cos*a - sin*cc) - dx) * mR      // corrige a origem do PRÓXIMO osso, não a matriz deste
        by += (len * (sin*a + cos*cc) - dy) * mR
      else:
        r = r + offR
      r = normalize(r) * mR
      cos = cos(r); sin = sin(r)
      bone.a = cos*a - sin*cc;  bone.b = cos*b - sin*d
      bone.c = sin*a + cos*cc;  bone.d = sin*b + cos*d
    appliedFromWorld(bone)
```

### 6.5 `physics`

Movimento secundário: o osso "atrasa" e balança quando o esqueleto se move. Uma constraint por osso. Roda no jogo. Pode ser convertida em chaves pelo editor (bake). Modelo e algoritmo: porte do `PhysicsConstraint` do Spine 4.2, com passo fixo.

**A física é a única simulação do formato.** Um quadro dela depende dos anteriores; é a exceção escrita do princípio 11 (1.3). Arrastar a linha do tempo para trás não devolve o mesmo cabelo, e é por isso que a suíte só a prova andando de `physicsDt` em `physicsDt` desde `t = 0` (12.4). Quem precisa de quadro puro **assa a física em chaves**: o editor oferece o comando, e o resultado são timelines `bone` comuns. (Decisão A7 do Humberto, 17/09/2026; Apêndice A, 79.)

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `bone` | name | sim | — | Osso simulado. |
| `x` | number | não | `0` | 0..1. Quanto da simulação vai para a posição X de mundo. |
| `y` | number | não | `0` | 0..1. Idem Y. |
| `rotation` | number | não | `0` | 0..1. Idem rotação. |
| `scaleX` | number | não | `0` | 0..1. Idem escala X (estica/encolhe). |
| `shearX` | number | não | `0` | 0..1. Idem shear X. |
| `inertia` | number | não | `0.5` | 0..1. Quanto do movimento do osso vira atraso. Animável. |
| `strength` | number | não | `100` | Força da mola que puxa de volta. Animável. |
| `damping` | number | não | `1` | 0..1. Fator por 1/60 s que freia a velocidade. `1` = sem freio. Animável. |
| `mass` | number | não | `1` | `> 0`. A simulação usa `1 / mass`. Animável. |
| `wind` | number | não | `0` | Força constante em +X. Animável. |
| `gravity` | number | não | `0` | Força constante para baixo (−Y). Animável. |
| `limit` | number | não | `5000` | Pixels por segundo. Limita o deslocamento que entra na simulação. |
| `fps` | number | não | `60` | Passos de simulação por segundo. `step = 1 / fps`. |

Estado por instância (não vai no arquivo): `xOffset xVelocity yOffset yVelocity rotateOffset rotateVelocity scaleOffset scaleVelocity remaining lastTime ux uy cx cy tx ty reset`. Valor inicial: tudo `0`, `reset = true`, `lastTime = now` do primeiro `updatePose`.

**Este estado sobrevive à setup pose.** Voltar à setup pose (5.1) devolve só os **valores animáveis** da constraint (`mix`, `strength`, `damping`, `wind`, `gravity`, `inertia`…). O estado acima **atravessa** a função `Pose` (9.10) de um quadro para o outro, e só é zerado por `physicsReset` ou pela timeline `reset` (9.8). Sem isso, a física nunca acumula e o osso fica colado no pai — é o que o caso **C-260** mede.

`now` é o tempo do esqueleto em segundos, dado pelo runtime, monotônico. O runtime **DEVE** expor `physicsReset()` e **DEVERIA** chamá-lo ao teletransportar o personagem ou após pausa longa. A timeline `reset` (9.8) faz o mesmo em tempo de animação.

```
function physicsApply(c, now):
  mix = c.mix; if mix == 0: return
  bone = c.bone; l = bone.length; f = skeleton.referenceScale; step = 1 / c.fps
  massInverse = 1 / c.mass
  useX = c.x > 0; useY = c.y > 0; useRot = c.rotation > 0 or c.shearX > 0; useScale = c.scaleX > 0

  delta = max(now - lastTime, 0)
  remaining += delta;  lastTime = now
  bx = bone.worldX; by = bone.worldY

  if reset:
    reset = false;  ux = bx; uy = by;  remaining = 0
  else:
    a = remaining; i = c.inertia; d = -1
    qx = c.limit * delta;  qy = qx * abs(sy);  qx = qx * abs(sx)
    if useX or useY:
      if useX: xOffset += clamp((ux - bx) * i, -qx, qx);  ux = bx
      if useY: yOffset += clamp((uy - by) * i, -qy, qy);  uy = by
      if a >= step:
        d = pow(c.damping, 60 * step)
        m = massInverse * step;  e = c.strength;  w = c.wind * f;  g = c.gravity * f
        repeat:
          if useX: xVelocity += (w - xOffset*e) * m;  xOffset += xVelocity*step;  xVelocity *= d
          if useY: yVelocity -= (g + yOffset*e) * m;  yOffset += yVelocity*step;  yVelocity *= d
          a -= step
        while a >= step
    if useX: bone.worldX += xOffset * mix * c.x
    if useY: bone.worldY += yOffset * mix * c.y

    if useRot or useScale:
      ca = atan2(bone.c, bone.a);  mr = 0
      dx = clamp(cx - bone.worldX, -qx, qx)
      dy = clamp(cy - bone.worldY, -qy, qy)
      if useRot:
        mr = (c.rotation + c.shearX) * mix
        r = atan2(dy + ty, dx + tx) - ca - rotateOffset * mr
        rotateOffset += (r - ceil(r / (2*PI) - 0.5) * 2*PI) * i
        r = rotateOffset * mr + ca;  co = cos(r); si = sin(r)
        if useScale:
          r = l * sqrt(bone.a² + bone.c²)
          if r > 0: scaleOffset += (dx*co + dy*si) * i / r
      else:
        co = cos(ca); si = sin(ca)
        r = l * sqrt(bone.a² + bone.c²)
        if r > 0: scaleOffset += (dx*co + dy*si) * i / r
      a = remaining
      if a >= step:
        if d == -1: d = pow(c.damping, 60 * step)
        m = massInverse * step;  e = c.strength;  w = c.wind;  g = c.gravity;  h = l / f
        loop:
          a -= step
          if useScale:
            scaleVelocity += (w*co - g*si - scaleOffset*e) * m
            scaleOffset += scaleVelocity * step;  scaleVelocity *= d
          if useRot:
            rotateVelocity -= ((w*si + g*co) * h + rotateOffset*e) * m
            rotateOffset += rotateVelocity * step;  rotateVelocity *= d
            if a < step: break
            r = rotateOffset * mr + ca;  co = cos(r); si = sin(r)
          else if a < step: break
    remaining = a
  cx = bone.worldX;  cy = bone.worldY

  // aplica o resultado à matriz de mundo
  if useRot:
    o = rotateOffset * mix
    if c.shearX > 0:
      r = 0
      if c.rotation > 0:
        r = o * c.rotation;  si = sin(r); co = cos(r)
        b = bone.b;  bone.b = co*b - si*bone.d;  bone.d = si*b + co*bone.d
      r = r + o * c.shearX;  si = sin(r); co = cos(r)
      a = bone.a;  bone.a = co*a - si*bone.c;  bone.c = si*a + co*bone.c
    else:
      o = o * c.rotation;  si = sin(o); co = cos(o)
      a = bone.a;  bone.a = co*a - si*bone.c;  bone.c = si*a + co*bone.c
      b = bone.b;  bone.b = co*b - si*bone.d;  bone.d = si*b + co*bone.d
  if useScale:
    s = 1 + scaleOffset * mix * c.scaleX
    bone.a *= s;  bone.c *= s
  tx = l * bone.a;  ty = l * bone.c        // ponta APÓS a física; usada no próximo quadro
  appliedFromWorld(bone)

function physicsReset(c):
  reset = true; remaining = 0; lastTime = now
  xOffset = xVelocity = yOffset = yVelocity = 0
  rotateOffset = rotateVelocity = scaleOffset = scaleVelocity = 0
```

**O tempo que sobra volta sempre.** A linha `remaining = a` está **fora** do bloco `if useRot or useScale`: o tempo não consumido volta para `remaining` **em todos os caminhos**, inclusive quando a constraint não usa rotação nem escala. Está escrito em prosa porque a indentação do pseudocódigo não sobrevive a uma cópia, e essa linha sozinha decide se a física acumula ou não.

- Determinismo: com o mesmo `now` em passos fixos e o mesmo `fps`, dois runtimes **DEVEM** produzir a mesma trajetória dentro de `1e-2` px. A suíte usa `dt = 1/60` fixo. Outro `dt` dá outro resultado; isso é esperado.
- Bake: um gravador **PODE** converter a física em chaves de osso e gravar `mix = 0` na constraint. O arquivo continua válido e um runtime sem física mostra o mesmo.

### 6.6 `driver`

Definido em 8.2. Fica no mesmo array e obedece à mesma ordem.

---

## 7. Skins, attachments, meshes, pesos, linked mesh, sequências, esqueleto aninhado

### 7.1 Skins e placeholders

Um **placeholder** é um nome dentro de um slot. Cada skin pode dar um attachment diferente ao mesmo placeholder. O esqueleto fala em placeholders; a skin decide a arte.

| Conceito | Onde aparece | Regra |
|:---|:---|:---|
| Placeholder | Chave de `skin.attachments[slot]` | Único dentro do slot, por skin. Mesmas regras de `name` (2.1). |
| Attachment de setup | `slot.attachment` | Nome de placeholder. Ausente = slot vazio no setup. |
| Troca por animação | timeline `slot` / `attachment` (9.5) | O valor é um nome de placeholder, nunca um objeto. |
| Pele `default` | `skins[]` com `name == "default"` | A pele que o editor cria primeiro. Uma pele como as outras: só está ativa se estiver na pilha (4.4). Guarda o que não pertence a pele nenhuma. |
| Pilha | escolhida pelo runtime ou pelo editor | Zero, uma ou várias peles, de baixo para cima; a de cima vence. Resolução em 4.4. |

Regras:

- Slot citado em `skin.attachments` **DEVE** existir (L1) — no arquivo ou, numa skin externa, em `rig.slots` (4.8).
- Placeholder citado em `slot.attachment` ou em timeline **DEVERIA** existir em ao menos uma skin (L2). Não é erro: o jogo pode criar skins em runtime.
- Um placeholder sem attachment em nenhuma pele da pilha mostra **nada**.
- Ossos com `skinRequired` são sempre calculados (5.6). Constraints com `skinRequired` só rodam quando uma pele da pilha as lista. Um osso com `skinRequired: false` **NÃO DEVE** aparecer em `skin.bones` (L2).
- Osso, slot e regra que uma pele de fora traz (2.8) entram no corpo como se estivessem gravados aqui, com `skinRequired: true`. O editor marca o que nasce numa pele com `skinRequired` na pele do lápis, e a pele é do corpo (F15).

### 7.2 Attachment — propriedades comuns

Todo attachment é um objeto dentro de `skin.attachments[slot][placeholder]`. O nome do attachment **é a chave do placeholder**. Não existe propriedade `name` dentro do objeto.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `type` | string | sim | — | `"region"`, `"mesh"`, `"linkedmesh"`, `"boundingbox"`, `"clipping"`, `"path"`, `"point"`, `"skeleton"`. Tipos de extensão: prefixados (2.7). |
| `path` | string | não | nome do placeholder | Nome da região no atlas ou da imagem solta (2.8). Só `region`, `mesh`, `linkedmesh`; em outros tipos é ignorado (L2). Pode conter `/`. Quando usado como nome de arquivo (2.8), `path`, `sequence.frames[]` e o nome gerado em 7.10 **DEVEM** obedecer às regras 2, 3, 5, 7 e 8 de uri; leitor **DEVE** recusar o nome e tratar o attachment como invisível, avisando. |
| `color` | color4 | não | `[1, 1, 1, 1]` | Multiplica a cor do slot. Em `boundingbox`, `clipping`, `path` e `point` é só cor de editor. |

| `type` | Desenha | Colide | Nível de leitor (12.2) | Leitor sem suporte faz |
|:---:|:---:|:---:|:---:|:---|
| `region` | sim | não | A | — (obrigatório em todo leitor) |
| `mesh` | sim | não | B | Placeholder vazio |
| `linkedmesh` | sim | não | B | Placeholder vazio |
| `boundingbox` | não | sim | B | Ignora |
| `clipping` | não | não | B | Ignora (desenha sem máscara) |
| `path` | não | não | C | Ignora (constraint `path` que o usa fica desligada) |
| `point` | não | não | B | Ignora |
| `skeleton` | sim | sim | C | Placeholder vazio |

Os campos `inheritAnimation` e `baseAnimation` de `skeleton` (7.11) são nível C como o próprio attachment.

### 7.3 `region`

Imagem retangular presa ao osso do slot.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `x` | number | não | `0` | Posição do centro da imagem no espaço local do osso. |
| `y` | number | não | `0` | |
| `rotation` | number | não | `0` | Graus, anti-horário. |
| `scaleX` | number | não | `1` | |
| `scaleY` | number | não | `1` | |
| `width` | number | não | `0` | Largura da imagem **original** em px do esqueleto. `0` = usar o atlas (`originalWidth / atlas.scale`). |
| `height` | number | não | `0` | Idem. |
| `sequence` | Sequence | não | — | Ver 7.10. |

**Quatro cantos (normativo).** A imagem original tem `W × H`. Se o atlas cortou borda transparente (10.3), a região desenhada é menor e deslocada por `offsetX, offsetY` (medidos da esquerda e de **baixo**). Sem atlas: recorte = imagem inteira, offsets 0.

**`width: 0` sem atlas e sem imagem.** `width: 0` manda usar o tamanho do atlas. Se não há atlas **nem** imagem solta, o tamanho não existe em lugar nenhum: o attachment é tratado como **vazio** — sem geometria, sem UV, invisível, e o runtime avisa uma vez, como faz com arquivo faltando (2.8). Ele **não** é um erro de validação: um `.bone` sem os PNG ao lado continua válido (2.8), e o editor precisa abrir.

```
W, H = width, height (ou originalWidth/Height do atlas ÷ scale, se 0)
rw, rh = region.width / atlas.scale, region.height / atlas.scale
ox, oy = region.offsetX / atlas.scale, region.offsetY / atlas.scale
kx = W / (region.originalWidth / atlas.scale);  ky = H / (region.originalHeight / atlas.scale)

// cantos no espaço da imagem, origem no centro, Y para cima
x0 = (-region.originalWidth/atlas.scale/2 + ox) * kx      x1 = x0 + rw * kx
y0 = (-region.originalHeight/atlas.scale/2 + oy) * ky     y1 = y0 + rh * ky
cantos = [(x0,y0), (x1,y0), (x1,y1), (x0,y1)]        // BL, BR, TR, TL, anti-horário

// transform do attachment: T(x,y) · R(rotation) · S(scaleX, scaleY)
c, s = cosd(rotation), sind(rotation)
para cada canto (px, py):
    lx = px*scaleX*c - py*scaleY*s + x
    ly = px*scaleX*s + py*scaleY*c + y
    (wx, wy) = localToWorld(osso do slot, lx, ly)

triângulos: [0, 1, 2,  0, 2, 3]

// uvs dos cantos, na imagem ORIGINAL, com v para baixo. São os cantos do
// RECORTE dentro da imagem original — não os cantos da imagem inteira.
OW, OH = region.originalWidth, region.originalHeight
u0 = region.offsetX / OW                        u1 = (region.offsetX + region.width)  / OW
v1 = 1 - region.offsetY / OH                    v0 = 1 - (region.offsetY + region.height) / OH
uvs por canto: BL=(u0,v1)  BR=(u1,v1)  TR=(u1,v0)  TL=(u0,v0)
```

Os UVs dos cantos passam pela função de 10.4. O runtime **DEVERIA** pré-calcular os quatro pontos locais e os UVs ao carregar.

**Por que os UVs são os do recorte, e não `(0,1) (1,1) (1,0) (0,0)`.** Sem
`offsetX`/`offsetY` as duas leituras dão o mesmo resultado, e é por isso que a
forma curta enganava. Com `offsetX > 0`, porém, o ponto `(0, 1)` é o canto da
**imagem original**, que está **fora** do recorte guardado na página: a
função de 10.4 devolve `px = -offsetX`, um pixel na margem, e a geometria do
recorte recebe a textura da imagem inteira, encolhida. A geometria acima já é
a do recorte (`x0` sai de `-OW/2 + ox`), então o UV também tem que ser. Os
casos **B-102** e **B-103** da suíte prendem esses números, e o canal `uvs` do
pose dump (12.4) existe para que eles possam ser conferidos.

### 7.4 `mesh` e pesos

Polígono texturizado, deformável.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `vertices` | number[] | um dos dois | — | `2N` números: `x, y` de cada vértice no espaço local do **osso do slot**. Sem pesos. |
| `binding` | Binding | um dos dois | — | Com pesos. Tabela abaixo. Exatamente um de `vertices` ou `binding` (L1). |
| `uvs` | number[] | sim | — | `2N` números, `u, v` em 0..1 na **imagem original** (não no recorte, não na página). `v = 0` é o topo. |
| `triangles` | integer[] | sim | — | `3T` índices de vértice. Anti-horário no espaço do esqueleto. |
| `hull` | integer | não | `N` | Os primeiros `hull` vértices formam o contorno externo, em ordem. `1..N`. |
| `edges` | integer[] | não | `[]` | Pares de índices. Só editor. |
| `width` | number | não | `0` | Largura da imagem original em px. `0` = do atlas. |
| `height` | number | não | `0` | |
| `sequence` | Sequence | não | — | Ver 7.10. |

**`Binding`** — estrutura de arrays (SoA), sem limite de influências por vértice. Vale para `mesh`, `boundingbox`, `clipping` e `path`.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `counts` | integer[] | sim | — | Uma entrada por vértice: quantas influências ele tem. Mínimo 1. Tamanho `N`. |
| `bones` | integer[] | sim | — | **Índice** em `bones` por influência. Tamanho = soma de `counts`. |
| `positions` | number[] | sim | — | `[x, y]` por influência, no espaço **local daquele osso**, na setup pose. Tamanho = 2 × soma de `counts`. |
| `weights` | number[] | sim | — | Peso por influência, 0..1. Tamanho = soma de `counts`. |

Regras (L1 se violadas): `uvs.length == 2N`; todo índice de `triangles < N`; `hull <= N`; `N >= 3`; `T >= 1`; tamanhos do `binding` batem; `binding.bones[i] < bones.length`.

- A soma dos pesos de um vértice **DEVE** ser gravada normalizada (`|soma − 1| <= 1e-4`, L1). O leitor usa como está; **não renormaliza**.
- **Sem limite fixo** de influências. Leitor **DEVE** suportar pelo menos 16 por vértice (12.6).
- Não há matriz de bind inversa. A posição já está no espaço do osso. Isso é o que torna o cálculo barato e a importação do Spine bit a bit. Importadores de DragonBones e glTF convertem o bind na entrada (13.2).

**Vértices de mundo (normativo).** Vale para `mesh`, `boundingbox`, `clipping` e `path`. `deform` vem da timeline `deform` (9.6) ou de um driver; `morph` é a soma dos morph targets (8.3). Os dois têm o **mesmo layout** de `positions` (ou de `vertices`, sem pesos):

| attachment | layout de `positions` / `deform` / `offsets` de morph | tamanho |
|:---|:---|:---:|
| sem pesos | `[x, y]` por vértice | `2N` |
| com pesos | `[x, y]` por **influência**, na ordem de `binding.bones` | `2 × Σ counts` |

```
function worldVertices(att, slot, deform, morphSum):
  delta(j) = deform[j] + morphSum[j]            // 0 onde faltar
  if att.binding == null:
    bone = slot.bone
    for v in 0..N-1:
      lx = att.vertices[2v]   + delta(2v)
      ly = att.vertices[2v+1] + delta(2v+1)
      out[v] = localToWorld(bone, lx, ly)
  else:
    j = 0                                       // índice de influência
    for v in 0..N-1:
      wx = 0; wy = 0
      for k in 0..binding.counts[v]-1:
        bone = bones[binding.bones[j]]
        px = binding.positions[2j]   + delta(2j)
        py = binding.positions[2j+1] + delta(2j+1)
        w  = binding.weights[j]
        wx += (bone.a*px + bone.b*py + bone.worldX) * w
        wy += (bone.c*px + bone.d*py + bone.worldY) * w
        j += 1
      out[v] = (wx, wy)
  return out
```

Deform mais curto que o layout: as entradas que faltam valem 0. Mais longo: L1.

### 7.5 `linkedmesh`

Mesh que empresta a geometria de outra mesh e troca só a imagem. Serve para peças com a mesma forma (mãos, bocas).

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `parent` | string | sim | — | Placeholder, no **mesmo slot**, cujo attachment é do tipo `mesh`. |
| `skin` | name | não | `"default"` | Skin onde está o `parent`. |
| `inheritDeform` | boolean | não | `true` | `true`: timelines `deform` e morphs que apontam para o `parent` valem para esta mesh também. |
| `width` | number | não | `0` | Só editor. |
| `height` | number | não | `0` | |
| `sequence` | Sequence | não | — | Ver 7.10. |

Herdado do `parent` em tempo de carga: `vertices`, `binding`, `uvs`, `triangles`, `hull`, `edges`. Próprio: `path`, `color`, `sequence`. O runtime **DEVE** resolver `parent` ao carregar e apontar para os mesmos arrays. Nada é copiado.

- `parent` **NÃO DEVE** ser outro `linkedmesh` (L1). Sem cadeia.
- Com `inheritDeform: true`, uma timeline `deform` que aponte para o próprio linkedmesh é L1.
- Com `inheritDeform: false`, a linkedmesh tem deform próprio e ignora o do parent. Morphs (8.3) com alvo no `parent` são herdados só com `inheritDeform: true`.

### 7.6 `boundingbox`

Forma de colisão e hit test. Não desenha.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `shape` | string | não | `"polygon"` | `"polygon"`, `"rectangle"`, `"ellipse"`. |
| `vertices` / `binding` | ver 7.4 | só `polygon` | — | Contorno em ordem. `N >= 3`. |
| `x` | number | não | `0` | `rectangle` / `ellipse`: centro, no espaço do osso do slot. |
| `y` | number | não | `0` | |
| `width` | number | só `rectangle`/`ellipse` | — | Tamanho. |
| `height` | number | só `rectangle`/`ellipse` | — | |
| `rotation` | number | não | `0` | Graus. Só `rectangle` / `ellipse`. |

O runtime **DEVE** expor a forma em espaço de mundo (skinning de 7.4, sem deform e sem morph) para teste de ponto e de segmento. `rectangle` e `ellipse` são levados ao mundo pela matriz do osso do slot (uma elipse sob shear vira elipse girada; um retângulo vira paralelogramo). Um runtime **PODE** aproximar a elipse por 16 vértices.

### 7.7 `clipping`

Máscara poligonal. Não desenha; recorta o que vem depois.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `end` | name | não | — | Último slot recortado (inclusive), na ordem de desenho atual. |
| `slots` | name[] | não | — | Lista explícita de slots recortados. Se presente, `end` é ignorado. Modelo do Live2D. |
| `invert` | boolean | não | `false` | `true` = recorta o que está **dentro** da máscara. |
| `vertices` / `binding` | ver 7.4 | sim | — | Polígono, `N >= 3`. Pode ser côncavo. Não pode se cruzar (L2 se detectado). |

Se nem `end` nem `slots` existem, a máscara não recorta nada. Máscara pelo alpha da textura fica na extensão `BONE_clip_alpha` (2.7).

Algoritmo de desenho (normativo):

```
clip = null
para cada slot L na ordem de desenho atual:
    att = attachment ativo de L
    se att == null ou not L.visible: continuar
    se att.type == "clipping":
        clip = { polígono = worldVertices(att), fim = att.end, lista = att.slots, invert = att.invert }   // substitui a anterior
        continuar
    se clip != null e (clip.lista == null ou L.name in clip.lista):
        desenhar att recortado por clip (dentro, ou fora se invert)
    senão:
        desenhar att
    se clip != null e clip.lista == null e L.name == clip.fim: clip = null
```

- Referência: decompor o polígono em partes convexas e recortar cada triângulo desenhado contra cada parte (Sutherland–Hodgman), ou usar stencil. O resultado visual é o que conta.
- Se `end` vem **antes** do slot de clipping na ordem atual, a máscara recorta até o fim da lista.
- Máscara dentro de máscara não existe: uma `clipping` nova substitui a anterior. Gravador **DEVERIA** avisar.
- Esqueleto aninhado (7.11) é recortado como um bloco; a máscara não entra nele. Um aninhado com `around` (7.11) está fora da ordem de quem o recebe: a máscara de quem o recebe **não** o corta, e uma entrada de `slots` que cite o slot dele não tem efeito (gravador **DEVERIA** avisar).
- **O slot marcado continua na volta.** O slot `L` que mostra um aninhado com `around` continua no laço acima, no lugar dele: se ele é o `end` de uma máscara de quem o recebe, a máscara **acaba** nele, como acabaria sem a marca. Só as peças dele não são cortadas (a linha acima). É o que o pseudocódigo da 7.11 faz ("com o clipping de 7.7"). Caso **C-323**.

### 7.8 `path`

Curva Bézier cúbica que guia a constraint `path` (6.4). Não desenha. O jogo pode lê-la como trilha.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `closed` | boolean | não | `false` | Fecha a curva (última âncora → primeira). |
| `constantSpeed` | boolean | não | `true` | Reparametriza por comprimento de arco (6.4). |
| `lengths` | number[] | sim | — | Comprimento **acumulado** do início do caminho até o fim de cada curva, na setup pose. Uma entrada por curva. Gerado pelo editor. |
| `vertices` / `binding` | ver 7.4 | sim | — | `3K` pontos (`6K` números sem pesos): para cada âncora, `inX, inY, x, y, outX, outY`. Espaço local do osso do slot. Com pesos, cada um dos `3K` pontos é um vértice do `binding`. |

`K >= 2` (L1). `lengths.length` = número de curvas (`K−1` aberto, `K` fechado) (L1).

### 7.9 `point`

Posição e rotação nomeadas. Spawn, alvo de câmera, ponto de encaixe.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `x` | number | não | `0` | Espaço local do osso do slot. |
| `y` | number | não | `0` | |
| `rotation` | number | não | `0` | Graus. |

**Ponto não é encaixe.** No rascunho 0.1 um `point` publicava um `socket`, e o esqueleto filho o procurava pelo nome. Isso saiu (Apêndice A, 62, revogada): a entidade **segue a imagem** (7.11), e o lugar dela é o próprio anexo, no osso do slot. Um `point` volta a ser só o que era: uma posição e uma rotação nomeadas que o jogo lê. Um arquivo do rascunho 0.1 com `socket` num `point` tem uma propriedade desconhecida (L3), e nada mais.

```
pointWorld(att, bone):
  pos = localToWorld(bone, att.x, att.y)
  cos = cosd(att.rotation); sin = sind(att.rotation)
  rot = atan2d(cos*bone.c + sin*bone.d, cos*bone.a + sin*bone.b)
  return (pos, rot)
```

### 7.10 `Sequence` (sequência de imagens)

Dentro de `region`, `mesh` ou `linkedmesh`. Frame a frame misturado com ossos. Só a imagem troca; vértices, pesos e UVs ficam.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `count` | integer | um dos dois | — | Número de imagens. `>= 1`. |
| `frames` | string[] | um dos dois | — | Lista explícita de nomes de região/imagem. Se presente, `count`, `start` e `digits` são ignorados e `count = frames.length`. |
| `start` | integer | não | `1` | Número da primeira imagem. |
| `digits` | integer | não | `0` | Zeros à esquerda. `0` = nenhum. `2` → `01`. |
| `setup` | integer | não | `0` | Índice (0..count−1) mostrado na setup pose. |

Nome da imagem `i` (0..count−1): `frames[i]`, ou `path + formatar(start + i, digits)`. Ex.: `path = "olho_"`, `start = 1`, `digits = 2`, `i = 3` → `"olho_04"`. Cada nome é resolvido como em 2.8.

Todas as imagens **DEVERIAM** ter o mesmo tamanho original (L2). A troca de frame vem da timeline `sequence` (9.6). Sem timeline, mostra `setup`.

### 7.11 `skeleton` (esqueleto aninhado)

Um esqueleto completo dentro de um slot. **Qualquer slot serve, não só o da arma.** A cabeça vira um capacete animado. A mochila vira um jetpack que solta fogo. Um braço vira um braço mecânico com pistão próprio. Uma montaria carrega o personagem. É o mesmo mecanismo nos quatro casos: o slot deixa de mostrar uma imagem e passa a mostrar um esqueleto inteiro, com ossos e animações dele.

É a **entidade** do editor: uma imagem com relógio. A troca é **por pele**, ou por chave. O slot `head` mostra uma `region` na pele `default` e um `skeleton` na pele `capacete`: trocar de pele troca a cabeça. A chave `slot/attachment` (9.5) faz o mesmo no meio da animação: é assim que o editor pendura a entidade em `t`. E a pele pode vir **de outro arquivo** (2.8): o capacete chega de fora, com o esqueleto e as animações dele, sem o personagem saber que ele existe.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `uri` | uri | sim | — | Arquivo `.bone`, `.boneb` ou `.bonez`, relativo a `assets.skeletonsBase`. |
| `skins` | string[] | não | `[]` | Skins ativas no filho. Vazio = só `default`. |
| `animation` | string | não | — | Animação inicial do filho. Ausente = setup pose. |
| `loop` | boolean | não | `true` | |
| `timeScale` | number | não | `1` | Relógio do filho = relógio do pai × `timeScale`. |
| `x` | number | não | `0` | Posição da raiz do filho no espaço local do osso do slot: o **pino**. É o mesmo par que a imagem do placeholder tinha (7.3): trocar a imagem pela entidade põe a raiz do filho onde a imagem encaixava. |
| `y` | number | não | `0` | |
| `rotation` | number | não | `0` | |
| `scaleX` | number | não | `1` | |
| `scaleY` | number | não | `1` | |
| `inheritColor` | boolean | não | `true` | O `light` do slot pai (7.12, `slot.color × attachment.color`) multiplica o `light` de cada slot do filho; `darkColor` não é herdado. |
| `inheritAnimation` | boolean | não | `false` | **Canal de resposta.** O filho toca a animação com o **mesmo nome** da que o pai está tocando, se ele tiver uma. O pai toca `recarregar`; a arma toca o `recarregar` dela. |
| `baseAnimation` | name | não | — | **Canal de fundo.** Animação do filho que roda **sempre**, em laço, com relógio próprio, por baixo de qualquer outra. A motosserra gira mesmo com o personagem parado. |
| `around` | name | não | — | **Em volta de quem recebe.** Nome de um slot **do filho**: o que marca o meio. O filho deixa de ser desenhado em bloco: o que vem antes desse slot é desenhado atrás de quem o recebe **inteiro**, o que vem depois, na frente. Regra abaixo. Desde a 1.1. |

**A entidade segue a imagem.** Não há socket (Apêndice A, 62, revogada; palavra do Humberto, 15/09/2026: *"não se guarda a mão direita nas costas"*). O anexo `skeleton` ocupa o **mesmo placeholder** que uma imagem ocuparia, no **mesmo slot**, com o **mesmo** `x, y, rotation, scaleX, scaleY`. A tomada é o slot; o pino é esse par de números; pendurar é criar o slot no osso e pôr o anexo nele. A espada entra no slot `weapon` do herói do mesmo jeito que a imagem da espada entrava, e é o arquivo do personagem que diz onde. Uma arma que serve a vários personagens é uma **pele de fora** (2.8) que preenche o slot `weapon` de quem obedece ao mesmo `rig`, e o `rig` publicado com a spec (`rigs/humanoide-v1.bone`, 14.4) é o que faz os nomes baterem.

Regras:
- **Matriz do filho.** Seja `M` a matriz de mundo do osso do slot: `P = M × T(x, y) · R(rotation) · S(scaleX, scaleY)`. Só isso. Se o slot está sob uma chave `slot/bone` (9.5), `M` é a do osso aplicado, com o `transform` da chave multiplicado antes do anexo, como para qualquer outro anexo.
- O osso raiz do filho recebe `P` como "pai". Dentro do filho, `sx = sy = 1` e `skX = skY = 0`; o osso raiz do filho é calculado como no caso `normal` de 5.4, com `pa..pd, worldX, worldY` = `P`.
- O filho é desenhado **inteiro** na posição do slot na ordem de desenho. Sua ordem interna não se mistura com a do pai. A única exceção é o `around`, abaixo: o filho sai da posição do slot e vai para fora do pai inteiro, metade atrás, metade na frente. Caso **C-310**.
- Os `assets` do filho resolvem em relação ao **arquivo do filho**, não ao do pai.
- Eventos do filho **DEVEM** chegar ao jogo com o nome prefixado: `"<slot>/<evento>"`.
- Física e constraints do filho rodam normalmente e veem o movimento de mundo que o pai impõe.
- Ciclo (`A` contém `B` que contém `A`) é inválido (L1). O leitor **DEVE** detectar pela cadeia de `uri` resolvidas e parar. Profundidade máxima: 8 (12.6).
- A timeline `nested` (9.9) troca a animação, dirige o tempo e a velocidade do filho. A **faixa** da entidade na linha do tempo do editor é isto: começa na chave `slot/attachment` que mostra o `skeleton` (ou em 0), troca de animação por `nested/animation`, estica por `nested/timeScale`. Nenhum campo a mais.
- O relógio do filho começa em 0 quando o anexo fica ativo (a chave `attachment`, ou o começo da animação). Em laço, a entidade recomeça onde foi solta.
- **Trocar de placeholder com a mesma `uri` não é "ficar ativo".** Quando uma chave `slot/attachment` troca o anexo do slot por outro anexo `skeleton` de mesma `uri` resolvida (2.8), o filho **continua**: a mesma instância, o mesmo relógio, a mesma animação, a mesma física. Ele passa a ler os campos do anexo novo (`x`, `y`, `animation`, `timeScale`, `around`…), e nenhum aviso sai. É o que deixa ligar e desligar o `around` no meio da animação sem o filho dar um salto. `uri` diferente: a instância antiga some e a nova começa em 0 na chave, como sempre (Apêndice C, 1 e 16). Casos **C-320** e **C-321**.
- Na virada de corpo (9.13), o filho **continua** se o corpo novo tem um slot de mesmo nome com um anexo `skeleton` de mesma `uri` ativo: mesmo relógio, mesma animação. Sem o slot, ou com outra `uri`: a instância antiga some (aviso uma vez), e a nova, se houver, começa em 0. Caso **C-292**.
- Leitor de nível A ou B: placeholder vazio, aviso uma vez. Arquivo faltando: idem (2.8).

**Qual animação o filho toca (normativo).** Da fonte mais forte para a mais fraca; vale a primeira que existe:

| Ordem | Fonte | Relógio do filho |
|:---:|:---|:---|
| 1 | Chave `nested/animation` ativa em `t` (9.9) | Zera na troca de nome; `nested/time`, se houver, manda. |
| 2 | `inheritAnimation: true` e o filho tem uma animação com o nome da que o pai está tocando | Relógio do pai × `timeScale`. Trocou a animação do pai, zera. |
| 3 | `animation` do attachment | Relógio próprio × `timeScale`, em laço se `loop`. |
| 4 | Nada | Setup pose do filho. |
| sempre | `baseAnimation` | Relógio próprio, em laço, **por baixo** de 1 a 4. Não zera na troca de animação; `nested/time` não o afeta. |

"A que o pai está tocando", em 2, é a animação que a função `Pose` (9.10) está aplicando ao pai. Com tracks e mix (12.2), é a animação da track **0**. Se o filho não tem animação com esse nome, a fonte 2 não existe e cai para 3.

**Duas camadas, ordem fixa.** A pose do filho num instante é:

```
p = Pose(filho, baseAnimation, tBase)      // camada 1; sem baseAnimation: p = setup(filho)
se fonte 1..3 existe:
    aplicar as timelines dessa animação sobre p, em t_dela   // camada 2, substitui propriedade por propriedade
updatePose(filho, now)                      // constraints e física do filho, como em 5.6
```

A camada 2 só escreve as propriedades que **tem chave**: o que `baseAnimation` anima e a animação de cima não toca continua vindo do fundo. É a única mistura que esta spec torna obrigatória; a mistura por tracks continua livre (12.2). `tBase` é o acumulador do fundo: começa em 0 quando o attachment fica ativo e anda `delta × timeScale` a cada `updatePose` do pai.

**Em volta de quem recebe (`around`, normativo).** É o "Este boneco" do editor: a tomada ao contrário. O poder foi feito para receber o personagem no meio; mas quem está sendo animado é o personagem, e é nele que o poder é posto. O anexo `skeleton` **do personagem** diz qual slot **do poder** marca o meio (palavra do Humberto, 04/10/2026: *"o formato vai ter que aguentar"*; Apêndice A, 82).

```json
"aura": { "poder": { "type": "skeleton", "uri": "poder.bone", "around": "meio" } }
```

A lista de desenho de um esqueleto `S` passa a ter três grupos, desenhados nesta ordem:

```
lista(S) = atras(S) ++ meio(S) ++ frente(S)

para cada slot L de S, na ordem de desenho atual de S (9.5), com o clipping de 7.7:
  anexo comum                 -> entra no fim de meio(S)
  skeleton SEM around         -> lista(filho) inteira entra no fim de meio(S)
  skeleton COM around = m     -> F = lista(filho), sem a peça do slot m
                                 A = o que em F vem ANTES de m ; D = o que em F vem DEPOIS de m
                                 atras(S)  = A ++ atras(S)        // no INÍCIO
                                 frente(S) = frente(S) ++ D       // no FIM
```

| Regra | |
|:---|:---|
| "Antes" e "depois" de `m` | pela posição do slot `m` na ordem de desenho **atual do filho**, a do instante: a base dele, as peles dele, a timeline `drawOrder` da animação que ele toca. O `atras(filho)` vem antes de tudo; o `frente(filho)`, depois de tudo. Uma chave `drawOrder` do filho leva uma peça de trás para a frente, e leva a própria marca de lugar. Caso **C-312**. |
| O slot `m` | **não é desenhado** enquanto a marca vale, tenha o anexo que tiver. É um **slot**, não uma imagem: vazio, escondido (`visible: false`) ou trocado por pele, o lugar dele na ordem continua lá, e a marca continua valendo. Caso **C-317**. Na volta do clipping do filho (7.7) ele conta como contaria sem a marca; só não entra na lista. **O que some é só o `meio` do slot `m`:** se o anexo do slot `m` é ele mesmo um aninhado com `around` próprio (o poder em volta do herói, e a faísca em volta do poder, no slot do meio do poder), o `atras` e a `frente` dele **continuam**: vão para o início de `atras(filho)` e o fim de `frente(filho)` pela conta de cima, como de qualquer outro slot; só o meio dele não é desenhado. É a cebola, por composição. Caso **C-324**. |
| A posição do slot `L` na ordem do pai | não vale para o desenho enquanto a marca vale: uma chave `drawOrder` do pai não move o filho. Ela continua guardada, e o canal `drawOrder` do dump (12.4) continua citando `L`. Sem a marca, o filho volta para lá. Caso **C-313**. |
| Um nível só | "quem recebe" é o esqueleto dono do slot `L`, e só ele. Esse esqueleto, com o filho em volta, entra em bloco em quem o receber (caso **C-315**), ou é ele mesmo cortado no slot do meio dele, com a lista inteira (caso **C-316**). |
| Dois filhos com `around` no mesmo esqueleto | **a cebola.** O do slot mais alto na ordem do pai abraça o do slot mais baixo: fica mais na frente na metade da frente, e **mais atrás** na metade de trás. É o que a conta acima faz ao pôr `A` no início de `atras(S)`. Caso **C-314**. |
| `m` não é slot do filho | o filho é desenhado **em bloco**, como sem o campo. O leitor **DEVE** avisar uma vez (2.5). Validador: L2 `REF_SLOT_MISSING` quando o arquivo do filho está ao alcance. Caso **X-307**. |
| Clipping | a máscara **do filho** é resolvida na volta do filho, antes de partir a lista: cada peça leva a sua máscara para o grupo em que cair (caso **C-318**). A máscara **do pai** não corta um filho com `around`: ele não está mais naquele trecho da ordem (caso **C-319**). A máscara de quem recebe o pai em bloco corta tudo, como sempre. |
| O resto do filho | matriz, relógio, canais de animação, `inheritColor`, eventos, física: **nada muda**. O `around` só decide a ordem da lista. |
| Ligar e desligar no meio da animação | dois placeholders no mesmo slot, um com `around` e outro sem, e a chave `slot/attachment` (9.5). Nenhuma timeline nova. A `uri` é a mesma, então o filho **continua**: o relógio não zera na troca (regra acima; caso **C-320**). |
| De quem é a marca | do **encaixe**, não do filho. O mesmo arquivo posto em outro esqueleto, ou em outro slot do mesmo, sem o campo, entra em bloco. |
| Versão | o campo é da 1.1. Um gravador que o grava **DEVE** gravar `minVersion` 1.1 ou maior; sem o campo, `minVersion` não muda. Um leitor 1.0 abre, desenha em bloco e avisa com destaque (2.4): nunca desenha calado. |

### 7.12 Cor, dark color e blend

Cor final de um pixel, antes do blend, com `tex` = texel **não premultiplicado**. `light` e `dark` são limitados a `[0, 1]` por componente antes desta fórmula (uma curva com overshoot pode tirar `slot.color` da faixa):

```
light = slot.color × attachment.color            // componente a componente, inclusive alpha
dark  = slot.darkColor                           // ausente → (0, 0, 0)
out.rgb = tex.rgb × light.rgb + (1 − tex.rgb) × dark.rgb
out.a   = tex.a × light.a
```

Se a página do atlas for `premultiplied: true`, o texel já vem multiplicado. Fórmula equivalente:
`out.rgb = tex.rgb × light.rgb × light.a + (tex.a − tex.rgb) × dark.rgb × light.a`; `out.a = tex.a × light.a`.

Blend, como fatores de `glBlendFunc` (fonte, destino):

| `blend` | Página straight | Página premultiplicada |
|:---:|:---|:---|
| `normal` | `SRC_ALPHA, ONE_MINUS_SRC_ALPHA` | `ONE, ONE_MINUS_SRC_ALPHA` |
| `additive` | `SRC_ALPHA, ONE` | `ONE, ONE` |
| `multiply` | `DST_COLOR, ONE_MINUS_SRC_ALPHA` | `DST_COLOR, ONE_MINUS_SRC_ALPHA` |
| `screen` | `ONE, ONE_MINUS_SRC_COLOR` | `ONE, ONE_MINUS_SRC_COLOR` |

Um runtime que não tenha um blend **DEVE** cair para `normal` e avisar uma vez.

### 7.13 O que desenhar em um quadro

```
para cada slot na ordem de desenho atual (9.5), com o clipping de 7.7:
  att = attachment ativo
  se att == null ou not slot.visible: continuar
  switch att.type:
    "region", "mesh", "linkedmesh": desenhar(worldVertices, uvs (10.4), triangles, cor (7.12), blend, clip)
    "clipping":  atualizar clip
    "skeleton":  desenhar a instância aninhada, recursivo, como um bloco
                 (com `around`: ela sai daqui e vai para os grupos de trás e da frente, 7.11)
    outros:      nada
```

Com algum `around` no esqueleto, o quadro é `atras(S)`, depois a volta acima, depois `frente(S)` (7.11). Sem nenhum, é a volta acima e nada mais. O slot do meio de um filho com `around` não desenha nada **no meio**; um aninhado com `around` próprio dentro dele ainda manda a metade de trás e a da frente (7.11, linha "O slot `m`"; caso **C-324**).

---

## 8. Parâmetros (drivers), morph targets, variáveis, tags, eventos

### 8.1 `Parameter`

Um parâmetro é um número com nome e faixa. Ele não faz nada sozinho. Um `driver` (8.2) lê o parâmetro e escreve em propriedades. É o modelo do Live2D, dos Smart Bones do Moho e dos Sliders do Spine 4.3. O jogo pode mover o parâmetro direto (olhar, respiração, rastreamento facial), a animação pode (timeline `parameter`), ou um osso pode (`source`).

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre parâmetros. Ex.: `"angleX"`, `"mouthOpen"`. |
| `min` | number | não | `0` | Menor valor. |
| `max` | number | não | `1` | Maior valor. `max > min` (L1). |
| `default` | number | não | `0` | Valor na setup pose. Dentro de `[min, max]` (L1). Animável (`value`). |
| `repeat` | boolean | não | `false` | Cíclico: `max` emenda em `min`. Para giro contínuo. |
| `group` | string | não | — | Pasta no editor. Informativo. |
| `displayName` | string | não | — | Nome para o usuário. Informativo. |
| `source` | object | não | — | O parâmetro é dirigido por um osso (Smart Bone). Tabela abaixo. |

**`source`**

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `bone` | name | sim | — | Osso lido. |
| `property` | string | sim | — | `"x"`, `"y"`, `"rotation"`, `"scaleX"`, `"scaleY"`, `"shearX"`, `"shearY"`. Lido da pose **aplicada** no momento em que o driver roda. |
| `from` | number | não | `0` | Faixa lida. |
| `to` | number | não | `1` | `to != from` (L1). |

Valor do parâmetro, por ordem de precedência:

| Caso | Valor |
|:---|:---|
| `source` presente | `min + (osso.applied[property] − from) / (to − from) × (max − min)`, lido quando o driver é aplicado. Sem `repeat`: clamp em `[min, max]`. Com `repeat`: envolve. |
| Timeline `parameter` keyada na animação | Valor da timeline. |
| Definido pelo jogo pela API do runtime | Esse valor. |
| Nada disso | `default`. |

Envolver: `r = max − min; v = min + ((v − min) mod r + r) mod r` (resultado em `[min, max)`).

O valor é sempre limitado a `[min, max]` (ou envolvido, com `repeat`). Um parâmetro com `source` **NÃO DEVE** ter timeline (L1).

### 8.2 `driver`

Constraint que lê **um** parâmetro e escreve em propriedades. Fica em `constraints` e obedece à ordem do array (5.6). Por isso pode ler um osso já resolvido por IK (via `source`) e pode alimentar o `mix` de uma constraint seguinte. Tem dois modos, exclusivos:

- **modo alvos**: `targets` presente. Cada alvo tem chaves indexadas pelo valor do parâmetro. É o keyform 1-D do Live2D.
- **modo contínuo**: `animation` presente. O valor do parâmetro vira tempo numa animação. É o Slider do Spine 4.3 e o Smart Bone do Moho. Reaproveita a avaliação de timeline.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `parameter` | name | sim | — | Parâmetro de entrada. |
| `targets` | DriverTarget[] | um dos dois | — | Modo alvos. Mínimo 1. |
| `animation` | name | um dos dois | — | Modo contínuo: animação-controle. Exatamente um de `targets` ou `animation` (L1). |
| `from` | number | não | `parameter.min` | Modo contínuo: faixa do parâmetro que mapeia para `timeFrom..timeTo`. |
| `to` | number | não | `parameter.max` | `to != from` (L1 `RANGE_PARAM`); leitor ignora o driver. |
| `timeFrom` | number | não | `0` | Modo contínuo: trecho da animação. |
| `timeTo` | number | não | `animation.duration` | |
| `mode` | string | não | `"replace"` | Modo contínuo: `"replace"` (leva ao valor) ou `"add"` (soma `valor − setup`). |

**`DriverTarget`** — os mesmos campos de alvo de uma timeline (9.1), mais `mode` e chaves por `input`:

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `type` | string | sim | — | `"bone"`, `"slot"`, `"drawOrder"`, `"deform"`, `"morph"`, `"constraint"`, `"parameter"`, `"variable"`, `"nested"`. Como na 9.1. Não aceita `"event"`, `"sequence"`, `"tag"`. |
| `target` | name | condicional | — | Como na 9.1. |
| `property` | string | condicional | — | Como na 9.1. |
| `skin` | name | não | `"default"` | Só `deform`. |
| `attachment` | string | condicional | — | Só `deform`. |
| `mode` | string | não | `"replace"` | `"replace"` = leva a propriedade ao valor. `"add"` = soma o **desvio** do valor em relação ao setup do alvo: `cur + (val − setup)·mix`, como no pseudocódigo abaixo (caso C-330). |
| `keys` | DriverKey[] | sim | — | Ordenadas por `input` crescente, sem repetição (L1). Mínimo 1. |

**`DriverKey`** — igual a `Key` (9.2) trocando `time` por `input`:

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `input` | number | sim | — | Valor do parâmetro em que esta chave vale. Crescente e único dentro do alvo (L1). |
| `value` | depende do alvo | sim | — | Mesmos tipos da tabela 9.1. |
| `curve` | string \| number[] | não | `"linear"` | Como na 9.3, com `input` no lugar do tempo. Com `input_k <= cx1 <= cx2 <= input_{k+1}` (L1 `RANGE_KEY_CURVE`); mesmo clamp de 9.3. |
| `offset` | integer | não | `0` | Só alvo `deform`: como na 9.2. |

Fora da faixa das chaves: clamp (vale a primeira ou a última).

```
function driverApply(c):
  v = valorDoParametro(c.parameter)                     // 8.1
  if c.animation != null:                               // modo contínuo
    t = c.timeFrom + (v - c.from) / (c.to - c.from) * (c.timeTo - c.timeFrom);  t = clamp(t, min(timeFrom,timeTo), max(...))
    for tl in animations[c.animation].timelines:
      if tl.type in ("event", "sequence", "tag"): continue
      val = evaluate(tl.keys, t)                        // 9.10
      aplicarAlvo(tl, val, c.mode, c.mix)
    return
  for tg in c.targets:                                  // modo alvos
    val = evaluate(tg.keys, v)                          // 9.10, com input no lugar de time
    aplicarAlvo(tg, val, tg.mode, c.mix)

function aplicarAlvo(alvo, val, mode, mix):
  cur = ler(alvo)              // bone: pose APLICADA; slot, deform, morph, constraint, parâmetro, variável, aninhado: estado atual
  if valor interpolável:
    if mode == "replace": novo = cur + (val - cur) * mix
    else:                 novo = cur + (val - setup(alvo)) * mix        // "add" soma o desvio em relação ao setup
  else:                                                                 // string, bool, null, drawOrder
    novo = (mix >= 0.5) ? val : cur
  escrever(alvo, novo)
  // alvo bone: escreve em bone.applied, nunca em bone.local; nada persiste para o quadro seguinte
  if alvo.type == "bone": updateWorld(bone); marcar descendentes como sujos (5.6)
```

- `mode: "add"` é proibido em `slot.attachment`, `slot.visible`, `drawOrder`, `nested.animation`, `inherit*` e `variable` de tipo `string`/`bool` (L1).
- Alvo `parameter`: o driver escreve no valor corrente do outro parâmetro. A ordem do array evita ciclo. Um driver **NÃO DEVE** escrever no seu próprio parâmetro (L1).
- Alvo `constraint`: pode ser uma constraint anterior ou posterior no array. Posterior é o caso útil (dirigir o `mix` de um IK).
- Drivers com 2 a 4 parâmetros (grade multilinear) ficam na extensão `BONE_param_grid` (2.7).
- Leitor de nível A ou B ignora `parameters` e `driver` e mostra a setup pose. Um gravador **PODE** gravar, além dos drivers, uma animação com o resultado assado para leitores simples.

### 8.3 `Morph`

Morph target (blend shape): deslocamento de vértices com um peso e um nome. Um morph pode mover **várias** meshes de uma vez (um "sorriso" move boca e bochechas). Vários morphs se somam.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre morphs. |
| `weight` | number | não | `0` | Peso na setup pose. Animável. |
| `min` | number | não | `0` | Faixa do peso. O runtime limita o peso a `[min, max]`. |
| `max` | number | não | `1` | `max > min` (L1). |
| `group` | string | não | — | Pasta no editor. |
| `targets` | MorphTarget[] | sim | — | Meshes afetadas. Mínimo 1. |

**`MorphTarget`**

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `slot` | name | sim | — | Slot da mesh. |
| `attachment` | string | sim | — | Placeholder. O attachment **DEVE** ser `mesh` (L1). Linked meshes com `inheritDeform` herdam. |
| `skin` | name | não | `"default"` | Skin onde está a mesh. |
| `offsets` | number[] | sim | — | Deslocamentos. Comprimento e espaço iguais ao `deform` (7.4). Mais curto = zeros no fim; mais longo = L1. |

Aplicação: `morphSum[j] = Σ_m clamp(weight_m, min_m, max_m) × offsets_m[j]`, somado ao deform antes do skinning (7.4). O peso vem da timeline `morph` (9.9), de um driver (8.2) ou da API do jogo.

Diferença para `deform`: o morph é um bloco com nome, reutilizável, que vira slider. O `deform` é anônimo e por animação ("pano ondulando no quadro 12").

### 8.4 `Variable`

Valor com nome que a animação muda ao longo do tempo e o jogo lê. Não afeta o desenho. Modelo: `varline` do Spriter.

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre variáveis. Variável de objeto do Spriter vira `"<objeto>.<nome>"`. |
| `type` | string | sim | — | `"float"`, `"int"`, `"string"`, `"bool"`. |
| `default` | number \| string \| boolean | não | `0`, `0`, `""`, `false` | Tem que bater com `type` (L1). |

O runtime **DEVE** expor o valor atual de cada variável. Muda por timeline `variable` (9.9) ou driver (só `float` e `int`). `int` recebe o valor truncado em direção a zero.

### 8.5 Tags

Tags são strings ligadas a um trecho da animação. Uso: "janela de ataque", "invulnerável", "pé no chão".

| Onde | O quê |
|:---|:---|
| raiz `tags` | Lista de tags declaradas. Tag usada e não declarada: L2. |
| `animation.tags` | Tags da animação inteira. Estáticas. |
| timeline `tag` (9.9) | Cada chave traz `value: string[]`: tags ativas daquele instante até a próxima chave. Sempre stepped. |

O runtime **DEVE** expor `activeTags(animation, time)` = `animation.tags ∪ value da última chave <= time` (só `animation.tags` antes da primeira chave).

- **Esta regra ganha da borda geral da 9.10** ("antes da primeira chave vale a primeira chave"): para `tag`, antes da primeira chave valem só as da animação.
- **A ordem da união:** primeiro `animation.tags`, na ordem do arquivo; depois os da chave, na ordem da chave; **sem repetir**. O dump compara tags exatas (12.4), então a ordem faz parte da resposta. Caso B-120. *(Linha de 05/11/2026.)*

### 8.6 Eventos — disparo

A definição está em 4.5 e a chave em 9.7. Um evento dispara quando o tempo da animação **cruza** o `time` de uma chave.

```
function fireEvents(anim, prev, now, loop):
  // prev = tempo do quadro anterior, now = tempo atual, em segundos de animação, sem loop aplicado, crescentes
  D = anim.duration
  para cada chave k da timeline event, em ordem:
    se not loop or D == 0:
      se prev < k.time <= now: entregar(k)
    senão:
      para cada inteiro n >= 0 com prev < k.time + n*D <= now: entregar(k)
```

- Primeiro quadro: `prev = -∞`. Assim chave em `0` dispara ao começar.
- Com loop: chave em `duration` e chave em `0` disparam as duas a cada volta. Gravador **DEVERIA** evitar chave exatamente em `duration` em animação `loop` (L2).
- Reprodução para trás: o runtime **DEVERIA** disparar ao cruzar em qualquer direção. Não é testado pela suíte.
- Payload: cada campo da chave (`int`, `float`, `string`, `volume`, `balance`) presente sobrescreve o da definição; `audio` vem sempre da definição, resolvido por 2.8.
- Eventos são entregues **depois** de o quadro ser calculado, na ordem de tempo; empate mantém a ordem das chaves.
- Eventos não são interpolados nem misturados. Durante crossfade, o runtime **DEVERIA** disparar só os da animação que entra, salvo configuração.
- O runtime **NÃO DEVE** tocar o áudio. Entrega o caminho e o jogo decide.

---

## 9. Animações e timelines

### 9.1 Estrutura

Uma animação (4.6) é uma lista de **timelines**. Cada timeline toca **uma** propriedade de **um** alvo. Cada propriedade escalar tem a sua própria timeline: `x` e `y` são timelines separadas. Isso dá curva por componente de graça e **uma forma canônica só**. Não existem atalhos (`translate`, `rgb`, `alpha`): o importador converte.

**`Timeline`**

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `type` | string | sim | — | Tabela abaixo. Tipos de extensão: prefixados. |
| `target` | name | condicional | — | Nome do alvo. Ausente nos tipos sem alvo. |
| `property` | string | condicional | — | Propriedade do alvo. Ausente nos tipos com valor único. |
| `skin` | name | não | `"default"` | Só `deform`, `weights` e `sequence`: pele do attachment. |
| `attachment` | string | condicional | — | Só `deform`, `weights` e `sequence`: placeholder. Obrigatório nesses tipos. |
| `keys` | Key[] | sim | — | `>= 1`. `time` estritamente crescente (L1), exceto `event` (9.7). |

**Tabela de todas as timelines**

| `type` | `target` | `property` | tipo de `value` | C | curvas | nível |
|:---|:---|:---|:---|:---:|:---:|:---:|
| `bone` | osso | `x`, `y`, `rotation`, `scaleX`, `scaleY`, `shearX`, `shearY` | number | 1 | todas | A |
| `bone` | osso | `inheritRotation`, `inheritScale`, `inheritReflection` | boolean | — | stepped | A |
| `slot` | slot | `attachment` | string \| null | — | stepped | A |
| `slot` | slot | `color` | color4 | 4 | todas | A |
| `slot` | slot | `darkColor` | color3 \| null | 3 | todas (`null` = stepped) | A |
| `slot` | slot | `visible` | boolean | — | stepped | A |
| `slot` | slot | `bone` | name \| null, + `transform` na chave (9.5) | — | stepped | B |
| `drawOrder` | — | — | `{slot, offset}[]` | — | stepped | A |
| `deform` | slot (+`skin`, `attachment`) | — | number[] + `offset` na chave | 1 | todas (uma curva) | B |
| `weights` | slot (+`skin`, `attachment`) | — | number[]: os pesos do `binding` (9.6) | 1 | todas (uma curva) | B |
| `sequence` | slot (+`skin`, `attachment`) | — | `{mode, index, delay}` | — | stepped | B |
| `event` | — | — | campos de evento (9.7), sem `value` | — | — | A |
| `constraint` | constraint | ver 9.8 | number \| boolean | 1 | todas / stepped | C |
| `constraint` | constraint `physics` | `reset` | sem `value` | — | — | C |
| `parameter` | parâmetro | `value` | number | 1 | todas | C |
| `morph` | morph | `weight` | number | 1 | todas | C |
| `variable` | variável | `value` | number \| string \| boolean | 1 | todas se `float`/`int`; stepped se não | B |
| `tag` | — | — | string[] | — | stepped | B |
| `nested` | slot | `animation` | string \| null | — | stepped | C |
| `nested` | slot | `time`, `timeScale` | number | 1 | todas | C |
| `body` | — | — | uri \| null, + `keepSkins` na chave (9.13) | — | stepped | C |

`C` = número de componentes (para curvas Bézier). Uma animação tem no máximo **uma** timeline `body` (L1 `ORDER_TIMELINE_DUPLICATE`, como qualquer repetida). A mesma combinação `(type, target, property, skin, attachment)` **NÃO DEVE** aparecer duas vezes na mesma animação (L1). Leitor que encontra repetida usa a última.

### 9.2 `Key`

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `time` | number | sim | — | Segundos. `>= 0`. `<= animation.duration` se `duration` foi gravada (L1). |
| `value` | depende da timeline | condicional | — | Ausente só em `event` e `reset`. |
| `curve` | string \| number[] | não | `"linear"` | Interpolação **desta chave até a próxima**. Na última chave é ignorada. Ver 9.3. |
| `offset` | integer | não | `0` | Só `deform`: índice do primeiro número de `value` dentro do array de deform. |
| `transform` | object | não | identidade | Só `slot` / `bone`: a posição do anexo no osso novo, `{ "x", "y", "rotation", "scaleX", "scaleY" }` (9.5). Em qualquer outra timeline é ignorado (L2). |
| `keepSkins` | boolean | não | `true` | Só `body`: a pilha de peles passa para o corpo novo (9.13). |
| `event` | name | só `event` | — | Evento em `events[]` (L1 se não existir). |
| `int` | integer | não | da definição | Só `event`. |
| `float` | number | não | da definição | Só `event`. |
| `string` | string | não | da definição | Só `event`. |
| `volume` | number | não | da definição | Só `event`. |
| `balance` | number | não | da definição | Só `event`. |

### 9.3 Curvas

| `curve` | Significado |
|:---|:---|
| `"linear"` ou ausente | Reta entre as duas chaves. |
| `"stepped"` | Segura o valor desta chave até a próxima. |
| array de `4 × C` números | Bézier cúbica por componente. `C` = número de componentes do valor (1 para number, 4 para `color`, 3 para `darkColor`, **1 para `deform`**: uma curva para todos os vértices). |
| string desconhecida | `"linear"` (2.5). Em valor não numérico, `"stepped"`. |

Bézier por componente `j`, entre a chave `k` (tempo `t0`, valor `v0`) e a chave `k+1` (`t1`, `v1`):

```
[cx1, cy1, cx2, cy2] = curve[4j .. 4j+3]      // coordenadas ABSOLUTAS: cx em segundos, cy em unidades do valor
P0 = (t0, v0)   P1 = (cx1, cy1)   P2 = (cx2, cy2)   P3 = (t1, v1)
```

- Absoluto, não normalizado. Assim uma curva com `v0 == v1` ainda pode fazer barriga (overshoot). Mesma escolha do Spine 4.
- `t0 <= cx1 <= cx2 <= t1` (L1 se violado). Leitor **DEVE** corrigir assim, nesta ordem: `cx1 = clamp(cx1, t0, t1)`; depois `cx2 = clamp(cx2, cx1, t1)`. `cy` nunca é limitado. Isso garante `x(s)` monotônica com uma só raiz.
- Valor booleano, string ou `null`: só `stepped`. Qualquer outra `curve` é tratada como `stepped` (L2). O schema aceita qualquer `curve` nesses valores; a verificação é do validador (código `RANGE_KEY_CURVE`, L2).
- Tamanho diferente de `4 × C`: L1; leitor usa `"linear"`.

Amostragem (normativa, dentro da tolerância de 3.6):

```
function amostrar(k, n, t, j):                  // chaves k e k+1 = n, tempo t, componente j
    if k.curve == "stepped": return v0
    if k.curve == "linear" ou ausente: return v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    // Bézier: achar s em [0,1] tal que x(s) == t
    x(s) = (1-s)³ t0 + 3(1-s)² s cx1 + 3(1-s) s² cx2 + s³ t1
    s = resolver(x, t)                           // Newton ou bisseção até a FAIXA DE s ficar menor que 1e-9
    s = clamp(s, 0, 1)
    return (1-s)³ v0 + 3(1-s)² s cy1 + 3(1-s) s² cy2 + s³ v1
```

**A parada é medida em `s`, nunca em `x`.** Um runtime **DEVE** parar quando o intervalo que ainda pode conter a raiz for menor que `1e-9`, e **NÃO DEVE** parar por `|x(s) − t|`.

Por quê: o erro que sobra em `s` chega ao valor multiplicado por `|v'(s)| / |x'(s)|`, e essa razão **não tem limite superior**. Uma curva de aceleração forte amplifica um erro invisível em `x` num erro grande no valor.

Medido: dois runtimes independentes, os dois parando em `|x(s) − t| <= 1e-6 × (t1 − t0)` — o texto antigo desta seção —, divergiram em **8,5e-5** no caso **A-020**, contra uma tolerância de conformidade de `1e-4`. Ou seja: os dois obedeciam à spec ao pé da letra e chegaram a 85% do limite de reprovação. Com a parada medida em `s`, a divergência caiu para `5e-7`, que é só o arredondamento de 6 casas do dump.

A referência é a solução **exata** (dentro da tolerância). Um runtime **PODE** pré-tabelar a curva (como o Spine faz) se ficar dentro da tolerância de 3.6. Tabelas curtas em geral **não** ficam para movimentos grandes.

*(Achado pelo confronto dos dois runtimes. Apêndice A, 46.)*

**Rotação não faz wrap.** `rotation` de `350` para `10` gira `−340°`. Quem quer o caminho curto grava `350 → 370`. Regra explícita para o arquivo ser previsível. O editor guarda valores desenrolados.

**Presets de easing** (ease in, bounce, elastic) são coisa de editor. O arquivo só grava handles. Bounce e elastic viram várias chaves.

### 9.4 Timelines de osso

`value` é escrito **por cima** do valor de setup da propriedade (replace, alpha 1). O mix entre animações é do runtime (1.4).

| `property` | Unidade | Nota |
|:---|:---|:---|
| `x`, `y` | px | Local, no espaço do pai. |
| `rotation` | graus | Sem wrap. |
| `scaleX`, `scaleY` | fator | Negativo espelha. |
| `shearX`, `shearY` | graus | |
| `inheritRotation`, `inheritScale`, `inheritReflection` | boolean | Stepped. Muda o modo de 5.3 na hora. |
| `parent` | nome de osso, ou `null` | **Troca de pai no meio da animação.** Só stepped (qualquer outra `curve` é tratada como stepped, L2). `null` = o pai gravado no arquivo. Nível **B**. Semântica do Spriter, abaixo. |

**Trocar de pai (`parent`, normativo).** A partir da chave, o osso pendura no osso nomeado. Os valores locais das outras timelines do osso (`x`, `y`, `rotation`, …) passam a ser **medidos a partir do novo pai** — o runtime **não converte nada**; quem grava a chave grava também os locais no espaço do novo pai (é o que o editor faz, e o que o Spriter já gravava). Regras:

- O osso não pode virar filho de si mesmo nem de um descendente seu. A chave que faria isso é **ignorada** com aviso uma vez, L2 `PARENT_CYCLE`; o pai continua o de antes.
- Osso nomeado que não existe: L1, timeline ignorada (4.7).
- Quando o pai aplicado muda, o runtime **refaz a ordem de cálculo** de 5.6 naquele quadro (pai antes de filho, pela árvore atual) e guarda até mudar de novo.
- Voltar à setup pose (5.1) devolve o pai do arquivo. Constraints que apontam para o osso continuam apontando: o osso é o mesmo, só o pai mudou.
- Num alvo de driver (8.2), `mode: "add"` é proibido (L1; o driver usa `replace`), como em toda propriedade não interpolável.
- Casos: **C-281** (a mão troca de pai no meio, e a ordem de cálculo muda), **C-282** (laço: no fim volta ao pai do arquivo), **C-286** (ciclo ignorado).

### 9.5 Timelines de slot e `drawOrder`

**`slot`**

| `property` | `value` | Nota |
|:---|:---|:---|
| `attachment` | nome de placeholder, ou `null` | `null` = slot vazio. Stepped. |
| `color` | `[r, g, b, a]` | Straight alpha. 4 curvas. |
| `darkColor` | `[r, g, b]` ou `null` | Se o slot não tem `darkColor` no setup, a timeline liga o tint black. `null` desliga. Trecho que sai de ou chega em `null` é stepped. |
| `visible` | boolean | `false` = não desenha e não recorta. Stepped. |
| `bone` | nome de osso, ou `null` | **O desenho troca de osso.** `null` = o osso do arquivo. Stepped; qualquer outra `curve` é tratada como stepped (L2). Nível **B**. Regra abaixo. |

**O desenho troca de osso (`bone`, normativo).** É o que o Spriter grava no `object_ref` de cada chave, e o que o Humberto pediu (Q10, A4): a espada sai da mão e vai para as costas no meio da animação, **sem saltar**. O único jeito honesto de não saltar é a chave carregar a posição do anexo no osso novo; o runtime **não converte nada** (a mesma escolha de 9.4).

```json
{ "type": "slot", "target": "espada", "property": "bone",
  "keys": [ { "time": 0.5, "value": "costas",
              "transform": { "x": 10, "y": 0, "rotation": -90, "scaleX": 1, "scaleY": 1 } } ] }
```

| Campo | Regra |
|:---|:---|
| `value` | nome do osso, ou `null` = o osso do arquivo (e então `transform` é ignorado). Osso que o corpo do instante não tem: a chave é ignorada com aviso uma vez, L2 `SLOT_BONE_UNMET`, e vale o osso de antes; osso que não existe em corpo nenhum é L1 (4.7). |
| `transform` | opcional; padrão identidade (`x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1`). Enquanto a chave vale, a matriz do anexo é `M = M_ossoNovo × T(transform.x, transform.y) · R(transform.rotation) · S(transform.scaleX, transform.scaleY) × transformação do anexo` (7.3, 7.11). O nome é o da 7.3: é a transformação do anexo, só que medida do osso novo. Não se chama `offset` porque `offset` já é o inteiro do `deform` (9.2), e um schema não deve adivinhar pelo tipo. Vale para `region`, para `mesh` sem `binding`, para `point`, `boundingbox` retangular ou elíptico e para `skeleton`. |
| malha com pesos | os vértices pesados **não** mudam: já são medidos dos ossos do `binding` (7.4). O `transform` não os toca. |
| ordem de desenho | não muda: o slot continua no lugar dele. |
| setup pose | devolve o `bone` do arquivo (5.1). |
| a ordem de cálculo | não muda: o slot não entra na árvore de ossos (5.6). O slot lê a matriz do osso aplicado, que já está pronta no passo 4 de 5.6. |
| caso | **C-295**: a espada vai da mão às costas em 0,5 s; os quatro cantos em 0,49 e 0,51 batem com a conta, e a ordem `T` depois `R` do `transform` é o que o caso prende. |

**`drawOrder`** — sem `target`, sem `property`. `value` é um array de deslocamentos em relação à **ordem base** (4.4: a ordem do array `slots` com o `drawOrder` das skins ativas por cima; sem skin com `drawOrder`, é a ordem do array). "Índice de setup", no algoritmo abaixo, é a posição do slot **na ordem base**, e os buracos são preenchidos na ordem base. `value: []` volta para a ordem base. É o que o caso **C-280** cobra:

```json
{ "time": 0.2, "value": [ { "slot": "mao_d", "offset": -3 }, { "slot": "espada", "offset": 1 } ] }
```

Algoritmo (mesmo do Spine):

```
n = slots.length ; ordem = array de n com -1
// 1. coloca os slots deslocados
para cada {slot, offset} em value:
    i = índice de setup do slot
    ordem[i + offset] = i          // i + offset DEVE estar em 0..n-1 (L1)
// 2. preenche os buracos, na ordem de setup, com quem não foi citado
j = 0
para i em 0..n-1:
    se ordem[i] == -1:
        enquanto slot j já foi citado: j += 1
        ordem[i] = j ; j += 1
```

**Regras do leitor.** Entrada cujo `slot` não existe é ignorada. `i + offset` fora de `0..n−1` é clampado a `0..n−1`. Se duas entradas caem no mesmo índice, a **última** no array vence, e o slot que perdeu é **descitado**: ele volta a contar como não citado e entra no passo 2, junto com os slots que nenhuma entrada mencionou. Para o validador, colisão e índice fora de faixa são L1 `RANGE_KEY_TIME`.

Exemplo com três slots — `["corpo", "braco", "mao"]` — e as entradas `[{slot: "braco", offset: 0}, {slot: "mao", offset: -2}]`:

| Passo | O que acontece |
|:---|:---|
| 1 | `braco` (índice 1) vai para `1 + 0 = 1`. `mao` (índice 2) vai para `2 − 2 = 0`. Sem colisão até aqui. |
| 2 | Sobra `corpo`, não citado. Ele ocupa a primeira posição livre, que é a 2. |
| Resultado | `["mao", "braco", "corpo"]` |

Agora com `[{slot: "braco", offset: -1}, {slot: "mao", offset: -2}]`: as duas caem no índice 0. A última no array (`mao`) vence e fica no 0; `braco` é **descitado** e volta para a fila do passo 2, junto com `corpo`. A fila do passo 2 anda na ordem do array `slots`: `corpo` (índice 0) pega a primeira posição livre, que é a 1; `braco` (índice 1) pega a 2. Resultado: `["mao", "corpo", "braco"]`.

Sem a palavra "descitado", o passo 2 pula `braco` — ele "já foi citado" — e a posição 2 fica com `-1`, isto é, com um buraco. Um runtime que lê a frase antiga ao pé da letra desenha um slot a menos.

`value: []` = ordem de setup. Stepped sempre.

### 9.6 `deform` e `sequence`

**`deform`** — `target` = slot, `attachment` = placeholder, `skin`. O attachment **DEVE** ser `mesh`, `boundingbox`, `clipping` ou `path`, ou `linkedmesh` com `inheritDeform: false` (L1). `value` é um trecho do array de deform (layout de 7.4), começando em `offset`. Fora do trecho, zero. `value: []` = sem deform.

**Qual `skin` casa com qual `deform` (normativo).** O deform é guardado por `(slot, skin, placeholder)` — três chaves (9.10). O attachment que está na tela veio de **uma** skin, e a timeline nomeia **outra** no campo `skin`. Quando as duas não batem, o runtime procura nesta ordem, e para na primeira que achar:

| Ordem | Chave procurada |
|:---:|:---|
| 1 | `(slot, skin da timeline, placeholder)` |
| 2 | `(slot, "default", placeholder)` |
| 3 | Qualquer skin com o mesmo `slot` e o mesmo `placeholder`. Havendo mais de uma, vale a **primeira na ordem do array `skins`**. |

Sem essa ordem, um arquivo gravado por um editor que não escreve o campo `skin` (o padrão é `"default"`) perde o deform assim que o personagem troca de skin — e o bug aparece só no jogo do usuário. É a mesma chave de três partes que a 8.3 usa para morph.

*(Escrito depois do segundo runtime, que teve de adivinhar esta regra. Apêndice A, 49.)*

Interpolação entre duas chaves: elemento a elemento, com **uma** curva (4 números) para todos. Trechos de tamanhos ou `offset` diferentes são expandidos, ao carregar, para o comprimento do layout de 7.4 (`2N` ou `2 × Σ counts`), com zeros fora de `offset..offset+len`; a interpolação é elemento a elemento com a curva única da chave. A curva Bézier de deform usa `cy` como fator (normalmente em `[0, 1]`): ela interpola um fator `s` e `vértices = k.value + (n.value − k.value) × s`. `cy` fora de `[0, 1]` é permitido (overshoot); o fator `s` não é limitado.

**A expansão vem ANTES da interpolação, e `value: []` é uma fileira de zeros.** As duas metades desta frase quebram em silêncio se forem lidas ao contrário:

- Interpolar os **trechos crus** e só depois expandir alinha o índice 0 de uma chave com o índice 0 da outra. Com duas chaves de `offset` diferente, o movimento vai parar em **vértices errados** — a malha se mexe, só que na parte errada do desenho.
- A lista vazia é um **número**: zeros. Um leitor que a trate como valor não numérico cai na regra da 9.3 ("em valor não numérico, `stepped`"), a curva da chave vira `stepped`, e o deform **segura o zero até a chave seguinte**: a malha fica parada a animação inteira. É o jeito mais fácil de escrever um runtime que passa em toda a suíte e não anima nada.

É o que o caso **A-031** cobra. *(Apêndice A, 61.)*

**`weights`** — `target` = slot, `attachment` = placeholder, `skin`: o mesmo endereço de três partes do `deform`, com a mesma ordem de busca por pele acima. O attachment **DEVE** ter `binding` (7.4): `mesh`, `boundingbox`, `clipping` ou `path` com pesos, ou `linkedmesh` com `inheritDeform: false` (L1 `ORDER_TIMELINE_TARGET`). **Pesos animados** (F9, palavra do Humberto, Q11 e A5).

```json
{ "type": "weights", "target": "capa", "skin": "default", "attachment": "capa",
  "keys": [ { "time": 0, "value": [ 1, 0,  1,  1 ] },
            { "time": 1, "value": [ 0, 1,  1,  1 ] } ] }
```

| Regra | |
|:---|:---|
| `value` | os **pesos** do `binding`, na ordem de `binding.weights`, **todos**: tamanho = `Σ counts`. Só os pesos animam; a estrutura (quantos ossos por vértice, quais ossos, as `positions`) não. Tamanho diferente é L1 `RANGE_WEIGHTS_SIZE`, e o leitor ignora a chave. |
| curva | interpolável, elemento a elemento, com **uma** curva para o array inteiro, como `deform`. |
| renormalização | **nenhuma**, como em 7.4. O gravador grava soma 1 por vértice (L1 `RANGE_WEIGHT_SUM` em cada chave). |
| `linkedmesh` | com `inheritDeform: true`, os pesos do `parent` valem para ela também. |
| setup pose | devolve os pesos do arquivo (5.1). |
| runtime | `worldVertices` (7.4) lê `w = pesosDoQuadro[j]` no lugar de `binding.weights[j]` quando há chave para `(slot, skin, placeholder)`. |
| nível | **B**. |
| caso | **C-296**: um vértice passa de `hips 1` para `torso 1` em 1 s, com o `torso` girando; em 0,5 s a posição é a média das duas contribuições. |

**`sequence`** — `target` = slot, `attachment` = placeholder, `skin`. O attachment **DEVE** ter `sequence` (L1). `value`:

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `mode` | string | não | `"hold"` | `"hold"`, `"once"`, `"loop"`, `"pingpong"`, `"onceReverse"`, `"loopReverse"`, `"pingpongReverse"`. Desconhecido → `"hold"`. |
| `index` | integer | não | `0` | Frame inicial, 0..count−1. Nos modos reversos é um deslocamento contado a partir do último frame (igual ao Spine). |
| `delay` | number | não | `0` | Segundos por frame. `0` = fica em `index` (equivale a `hold`). |

Frame no tempo `t`, chave em `t0`, `count = n`:

```
se t < tempo da primeira chave: frame = sequence.setup ; parar     // antes da primeira chave: setup
se mode == "hold" ou delay == 0: frame = index ; parar
k = floor((t - t0) / delay + 0.00001)                              // k >= 0 sempre, porque t >= t0
once:            frame = min(index + k, n-1)
loop:            frame = (index + k) mod n
pingpong:        p = 2n - 2 ; se p == 0: frame = 0 senão: frame = (index + k) mod p ; se frame >= n: frame = p - frame
onceReverse:     frame = max(n-1 - (index + k), 0)
loopReverse:     frame = n-1 - ((index + k) mod n)
pingpongReverse: p = 2n - 2 ; se p == 0: frame = 0 senão: frame = (index + k + n - 1) mod p ; se frame >= n: frame = p - frame
```

### 9.7 `event`

Sem `target`, sem `property`, sem `value`. Cada chave tem `time`, `event` e os campos opcionais de 9.2. Várias chaves **PODEM** ter o mesmo `time` (eventos diferentes no mesmo instante: passo + som). É a única timeline em que isso vale. `time` é não decrescente (L1). Disparo em 8.6.

### 9.8 `constraint`

`target` = nome da constraint. `property` depende do `type` da constraint:

| Constraint | `property` numérica (todas as curvas) | `property` booleana (stepped) |
|:---|:---|:---|
| todas | `mix` | — |
| `ik` | `softness` | `bendPositive`, `compress`, `stretch`, `uniform` |
| `transform` | `mixRotation`, `mixX`, `mixY`, `mixScaleX`, `mixScaleY`, `mixShearY` | — |
| `path` | `mixRotation`, `mixX`, `mixY`, `position`, `spacing` | — |
| `physics` | `inertia`, `strength`, `damping`, `mass`, `wind`, `gravity` | — |
| `driver` | — | — |

**`reset`** — só `physics`. `property: "reset"`, chaves só com `time`. Ao cruzar a chave (mesma regra de 8.6), o runtime chama `physicsReset` (6.5). Serve para cortes de câmera e teleporte dentro da animação.

**A ordem no quadro (normativa).** O `physicsReset` de uma chave cruzada em `(anterior, now]` roda **antes** do `physicsApply` (6.5) do mesmo quadro: o quadro da chave já é o de ancoragem, e não simula; os seguintes simulam. Vale igual dentro de um esqueleto filho (7.11): a animação dele vale inteira, e as chaves `reset` dela disparam no relógio dele. Casos **C-262**, **C-264** e **C-326**.

Propriedade que não bate com o tipo da constraint: L1; leitor ignora a timeline.

### 9.9 `parameter`, `morph`, `variable`, `tag`, `nested`

| `type` | `target` | `property` | `value` | Nota |
|:---|:---|:---|:---|:---|
| `parameter` | parâmetro | `value` | number | Clampado (ou envolvido, com `repeat`) ao aplicar. |
| `morph` | morph | `weight` | number | Clampado a `[min, max]`. |
| `variable` | variável | `value` | conforme `type` da variável | Tipo errado: L1. `int` interpolado é truncado. |
| `tag` | — | — | string[] | Stepped. Ver 8.5. |
| `nested` | slot com attachment `skeleton` | `animation` | string \| null | Troca a animação do filho. `null` = setup pose do filho. Stepped. Ao trocar para um nome diferente, o tempo do filho volta a `0`. |
| `nested` | idem | `time` | number | Dirige o tempo do filho. Se a animação tem timeline `nested/time` para o slot, o tempo do filho é o valor da timeline durante toda a animação e `timeScale` é ignorado. Com curva = scrub. |
| `nested` | idem | `timeScale` | number | Multiplica o relógio do filho. |

Uma chave `nested/animation` **ganha** de `inheritAnimation` e de `animation` do attachment (tabela de precedência de 7.11). Uma chave com valor `null` também ganha: quer dizer "nenhuma animação de cima", e **não** cai para `inheritAnimation` nem para `animation`; o que sobra é só a `baseAnimation`, ou a setup pose do filho. Nenhuma das três propriedades toca a `baseAnimation`: o fundo continua rodando com o relógio dele, e `nested/time` dirige só a animação de cima.

### 9.10 Aplicação de uma animação — função `Pose` (normativa)

Este é o comportamento de referência, usado pela suíte de conformidade. Um runtime com tracks e mix **DEVE** reproduzir exatamente isto quando há uma só animação com alpha 1. Um esqueleto filho (7.11) não é posado por `Pose` de uma vez só: é posado em **duas camadas**, com a regra escrita em 7.11, e cada camada usa este mesmo `Pose`.

`Pose` recebe o **projeto** (2.9), e não um esqueleto: é a animação que diz, em cada `t`, qual corpo está vivo (`corpoEm`, 9.13). Num projeto de um corpo só, sem timeline `body`, `corpoEm` devolve sempre o arquivo, e a função é a de sempre.

```
function evaluate(keys, t):
    if t <= keys[0].time:     return keys[0].value        // antes da primeira chave: primeira chave
    if t >= keys[last].time:  return keys[last].value     // depois da última: última
    i = maior índice com keys[i].time <= t                 // busca binária
    k = keys[i];  n = keys[i+1]
    if k.value ou n.value não é interpolável (boolean, string, null, objeto, drawOrder) or k.curve == "stepped": return k.value
    return amostrar(k, n, t, j) por componente j (9.3)

function Pose(projeto, animation, t, now):
    corpo = corpoEm(animation, t)                         // 9.13: o arquivo, ou o corpo da última chave body
    skeleton = projeto.esqueletos[corpo]                  // um Skeleton por corpo, montado UMA vez ao carregar
    pose = setup(skeleton)                                // 5.1: a BASE daquele corpo
    for tl in animation.timelines:
        if tl.type == "event" or tl.type == "body" or tl.property == "reset": continue   // 8.6 / 9.13 / 9.8
        alvo = skeleton.acharPorNome(tl.type, tl.target, tl.skin, tl.attachment)
        if alvo == null: continue                         // 9.13: o rabo antes da virada; o braço depois dela. Aviso uma vez
        v = evaluate(tl.keys, t)
        switch tl.type:
          "bone":       pose.bones[tl.target].local[tl.property] = v
          "slot":       pose.slots[tl.target][tl.property] = v      // property "bone": v e o offset da chave ativa (9.5)
          "drawOrder":  pose.drawOrder = ordem(v)                       // 9.5
          "deform":     pose.deform[tl.target][tl.skin][tl.attachment] = v   // cada chave já expandida ao carregar (9.6)
          "weights":    pose.weights[tl.target][tl.skin][tl.attachment] = v  // 9.6
          "sequence":   pose.sequence[tl.target][tl.skin][tl.attachment] = (chave ativa, t)
          "constraint": pose.constraints[tl.target][tl.property] = v
          "parameter":  pose.parameters[tl.target] = v
          "morph":      pose.morphs[tl.target].weight = v
          "variable":   pose.variables[tl.target] = v
          "tag":        pose.tags = v
          "nested":     pose.nested[tl.target][tl.property] = v
    updatePose(skeleton, now)                             // 5.6: aplicada, constraints, drivers, mundo
    return pose
```

`drawOrder` sem `target` e `tag` sem `target` passam direto em `acharPorNome`. A ordem de desenho, as regras, os parâmetros e os morphs são os do corpo do instante; eventos, tags e variáveis são da animação, e não têm corpo.

Antes da primeira chave vale a **primeira chave**, não a setup pose. É a regra do glTF e de todo DCC. Quem importa do Spine insere uma chave em `t = 0` com o valor de setup quando a timeline não começa em 0 (13.1). Um runtime **PODE** guardar o último índice buscado por timeline e avançar a partir dele. O resultado tem que ser o mesmo.

### 9.11 Duração e loop

- `duration` ausente = maior `time` entre todas as chaves (0 se não há chaves).
- Chaves depois de `duration` são L1.
- Em loop (decisão do runtime), o tempo é `t mod duration`. Uma chave em `time == duration` vale só no fim de cada volta.
- Animação com `duration: 0` é uma pose. Vale só a primeira chave de cada timeline. A **base** de um corpo é isso na tela do editor: a entrada de quadro 0, duração 0 (5.1).
- Em laço, a virada de corpo obedece ao `t mod duration` como tudo o mais: no fim da volta a animação recomeça no corpo do arquivo (9.13, caso **C-291**).

### 9.12 Exemplo de uma timeline

```json
{ "type": "bone", "target": "braco", "property": "rotation",
  "keys": [
    { "time": 0.0, "value": 0,  "curve": [0.1, 0, 0.3, 45] },
    { "time": 0.5, "value": 45, "curve": "stepped" },
    { "time": 1.0, "value": 0 }
  ] }
```

### 9.13 A virada de corpo — timeline `body` (normativa)

O homem vira lobisomem no meio da animação. Palavra do Humberto (`AS REGRAS DA BASE` §9 e §16, 15 e 16/09/2026): a virada é **corte seco**, e o rabo **nasce** ali: não existia antes, existe depois. Não é uma pose nova do mesmo esqueleto: é **outro corpo**, com a base dele, os ossos dele, as peles dele.

```json
{ "type": "body",
  "keys": [ { "time": 0.5, "value": "lobisomem.bone", "keepSkins": true } ] }
```

| Campo | Tipo | Padrão | O que é |
|:---|:---|:---|:---|
| `type` | `"body"` | — | uma por animação (L1 se repetir). Sem `target`, sem `property`. |
| `key.value` | uri ou `null` | — | o corpo que vale **da chave em diante**. Relativa a `assets.skeletonsBase`, como em 7.11; **DEVE** estar em `manifest.skeletons` do projeto (2.9). `null` = o corpo do próprio arquivo. |
| `key.curve` | — | `stepped` | só `stepped`; outra curva é L2 e vira `stepped` (como `parent`, 9.4). |
| `key.keepSkins` | boolean | `true` | a pilha de peles (4.4) **passa** para o corpo novo, pelo nome (nome que o corpo novo não tem é ignorado, aviso uma vez), ou **não passa**: o corpo novo entra só com a pilha `["default"]`. Decisão de quem anima, por chave (Q39, A3). |

Nível **C**. Leitor de nível A ou B ignora a timeline (X-302) e mostra o corpo do arquivo o tempo todo.

**Qual corpo vale em `t`:**

```
corpoEm(animation, t):
    k = a última chave de `body` com time <= t          // nenhuma → o arquivo
    if k == null or k.value == null: return o arquivo
    return k.value
```

**Antes da primeira chave `body` vale o arquivo, e não a primeira chave.** É a única exceção à regra de 9.10 ("antes da primeira chave, a primeira chave"), e existe porque toda animação nasce no corpo em que foi gravada (M8: cada corpo tem as suas animações). Uma chave `body` em `time: 0` com `value != null` é permitida e avisa: L2 `BODY_AT_START`, *"esta animação é de outro corpo: guarde-a lá"*.

**Regras:**

| Regra | Por quê |
|:---|:---|
| O esqueleto **não é remontado**. Cada corpo citado por uma chave `body` é montado **uma vez**, ao carregar o projeto, e a virada **troca** qual está vivo. | É a tradução de "o rabo nasce" que mantém o runtime barato e puro (princípio 11). |
| As timelines casam com o corpo **por nome**, no instante: `acharPorNome` em 9.10. Nada é convertido. | É a semântica da `mainline` do Spriter e a mesma do `rig` (4.8). *"O que a animação disse continua dito"* (Q27). |
| Nome que o corpo do instante não tem: a timeline é **ignorada** naquele instante, com aviso **uma vez** por par (corpo, alvo), L2 `BODY_UNMET`. | Regra 21 do projeto: avisa, não improvisa. É igual a `RIG_UNMET`. |
| Um nome que não existe no arquivo mas existe num corpo citado por `body` **não é L1** (4.7). | A chave `body` é a declaração, como o `rig`. O validador confere quando tem os arquivos. |
| `drawOrder`, regras, parâmetros, morphs: os do corpo do instante. Eventos, tags e variáveis: da animação. | Os primeiros são do corpo; os outros não têm corpo. |
| Entidades (slots com `skeleton`): o corpo novo precisa ter o slot de **mesmo nome** com a mesma `uri` para a instância continuar (7.11). Slot que falta: aviso, nunca inventa. Peça a mais no corpo novo é esperada, e não avisa (M11b). | O rabo é peça a mais. A espada que some é peça que falta. |
| Física: o estado é de cada esqueleto. O esqueleto que entra começa como no primeiro `updatePose` dele (`reset`, 6.5). | Não há como carregar a velocidade de um osso que não existe no outro corpo. |
| Em laço, `corpoEm` recebe `t mod duration` (9.11). | Como tudo o mais. Caso C-291. |
| `value` que não é um corpo carregado do projeto: fica o corpo de antes, aviso uma vez (2.5). | Arquivo faltando nunca é fatal (2.8). |
| A **pilha** passa ou não passa conforme `keepSkins`. Ao voltar ao arquivo (`value: null`) a regra é a mesma. | Q39. Caso C-293. |

**Casos de conformidade:** **C-298** (a pilha sem a `default`, 4.4), **C-290** (corte seco: o braço do homem antes, o rabo do lobisomem depois, o corpo do instante nos canais `bones` e `vertices`), **C-291** (a virada em laço), **C-292** (a entidade continua no slot de mesmo nome; some num corpo sem o slot), **C-293** (`keepSkins` leva a `armadura`; sem ela o corpo entra só com `default`). O pose dump ganha o campo `body` por amostra (12.4): sem ele dois runtimes não têm como divergir na virada.

**O que a virada não é.** Não é `parent` (9.4): trocar de pai é dentro de um corpo. Não é `nested` (9.9): a entidade é um filho dentro de um slot; a virada troca o pai inteiro. Não é uma pele: a pele troca a arte e pode trazer osso (2.8), mas a base continua a mesma; a virada troca a base.

---

## 10. Atlas

### 10.1 Arquivo

O atlas é um JSON separado. Extensão: **`.atlas.json`**. MIME: `application/vnd.bone.atlas+json`. Mesmas regras de 2.1 (UTF-8, sem BOM, sem duplicata, `extras`/`extensions` em todo objeto, propriedade desconhecida ignorada).

O esqueleto aponta para ele em `assets.atlases` (2.8). Um atlas não sabe qual esqueleto o usa: pode ser compartilhado. Coordenadas em **pixels da página**, origem no canto **superior esquerdo**, Y para baixo. É espaço de imagem.

### 10.2 Objeto raiz

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `atlas` | object | sim | — | `{ "version": "1.0", "generator": "..." }`. Mesmas regras de versão de 2.4. Primeira propriedade. |
| `scale` | number | não | `1` | Quantos px do atlas valem 1 px do esqueleto. `0.5` = atlas de meia resolução. Todo valor em px deste arquivo é dividido por `scale` ao virar px de esqueleto. |
| `pages` | Page[] | sim | — | `>= 1`. |
| `regions` | Region[] | sim | — | |

### 10.3 `Page` e `Region`

**`Page`**

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre páginas. |
| `image` | uri | sim | — | Relativo à **pasta do atlas**. PNG, WebP, JPEG ou outro que o runtime aceite. `data:` permitida (2.8, regra 6). |
| `width` | integer | sim | — | Em px da página. |
| `height` | integer | sim | — | |
| `format` | string | não | `"rgba8"` | `"rgba8"`, `"rgb8"`, `"rgba4"`, `"rgb565"`, `"alpha8"`. Dica de upload. |
| `minFilter` | string | não | `"linear"` | `"nearest"`, `"linear"`, `"mipmap"`. |
| `magFilter` | string | não | `"linear"` | `"nearest"`, `"linear"`. Pixel art usa `"nearest"`. |
| `wrapU` | string | não | `"clamp"` | `"clamp"`, `"repeat"`, `"mirror"`. |
| `wrapV` | string | não | `"clamp"` | |
| `premultiplied` | boolean | não | `false` | A imagem já tem alpha pré-multiplicado (7.12). |

**`Region`**

| nome | tipo | obrigatório | padrão | descrição |
|:---|:---|:---:|:---|:---|
| `name` | string | sim | — | Único entre regiões. É o que `attachment.path` procura. Pode conter `/`. |
| `aliases` | string[] | não | `[]` | Outros nomes que resolvem para esta região (imagens idênticas). Únicos também. |
| `page` | integer | sim | — | Índice em `pages`. |
| `x` | integer | sim | — | Canto **superior esquerdo** na página, Y para baixo. |
| `y` | integer | sim | — | |
| `width` | integer | sim | — | Tamanho do recorte **como na imagem de origem** (antes de girar). |
| `height` | integer | sim | — | |
| `rotation` | integer | não | `0` | `0` ou `90`. `90` = o recorte foi girado 90° **horário** ao entrar na página; ocupa `height × width` px na página. |
| `offsetX` | integer | não | `0` | Px de borda transparente cortada à **esquerda** da imagem original. |
| `offsetY` | integer | não | `0` | Px cortados **embaixo** (Y para cima, como o resto do formato; igual ao Spine). |
| `originalWidth` | integer | não | `width` | Tamanho da imagem original, antes do corte. |
| `originalHeight` | integer | não | `height` | |
| `pivotX` | number | não | `originalWidth / 2` | Pivô: px da imagem **original**, da **esquerda**, como `offsetX`. Sem faixa. Informativo (abaixo). |
| `pivotY` | number | não | `originalHeight / 2` | Px da imagem original, de **baixo**, como `offsetY`. |

Regras (L1): `x + (rotation == 90 ? height : width) <= page.width`, idem para Y; `originalWidth >= offsetX + width`; `originalHeight >= offsetY + height`.

**Pivô (`pivotX`, `pivotY`).** O ponto da imagem que fica na origem do osso. É medido em px da imagem **original**, da esquerda e de baixo — a mesma origem de `offsetX/offsetY` —, então sobrevive ao corte da borda e ao reempacotar sem conta nenhuma. Não tem faixa: o cabo de uma espada pode ficar fora do desenho. Ausente = o centro, que é o que todo arquivo sem o campo já supõe. Como todo px do atlas, é dividido por `scale` (10.5).

**Informativo para quem calcula pose.** O runtime **NÃO DEVE** usar o pivô na conta: o anexo (7.3) já traz `x/y`, e a pose sai idêntica com ou sem ele. Editores e ferramentas usam o pivô para pôr uma imagem nova no lugar da velha. Para um anexo `region` com `x, y, rotation, scaleX, scaleY` e, se gravados, `width W, height H`, numa região de `ow = originalWidth`, `oh = originalHeight` (tudo já dividido por `scale`):

```
kx = W / ow   (1 se W ausente)          ky = H / oh   (1 se H ausente)
R(θ)(a, b) = (a·cosθ − b·sinθ, a·sinθ + b·cosθ)

ida, do anexo para o pivô:
    (u, v) = R(−rotation) · (−x, −y)
    pivotX = ow/2 + u / (scaleX·kx)          pivotY = oh/2 + v / (scaleY·ky)

volta, do pivô para um anexo novo, sem width/height:
    (x, y) = −R(rotation) · (scaleX·(pivotX − ow/2), scaleY·(pivotY − oh/2))
```

Exemplo: `x 10, y −20`, sem giro, `ow 100, oh 50` → pivô `(40, 45)`; com `rotation 90` → `(70, 35)`; com `W 200, H 100` → `(45, 35)`. Um pivô por região: uma imagem usada em dois lugares com pivôs diferentes é **duplicada** no atlas (outra região, mesmo retângulo), não ganha dois pivôs.

### 10.4 UV da imagem original para a página (normativo)

Dado `(u0, v0)` normalizado na **imagem original** (`(0,0)` topo-esquerda, `(1,1)` base-direita; é o espaço de `mesh.uvs` e dos cantos do `region`, 7.3):

```
px = u0 * originalWidth - offsetX                                   // pixel relativo ao recorte, da esquerda
py = v0 * originalHeight - (originalHeight - offsetY - height)      // pixel relativo ao recorte, do topo
se rotation == 0:
    U = (x + px) / page.width
    V = (y + py) / page.height
se rotation == 90:
    U = (x + height - py) / page.width
    V = (y + px) / page.height
```

Verificação: o canto superior esquerdo do recorte (`px = 0, py = 0`) com `rotation 90` cai em `(x + height, y)` — o canto superior **direito** do retângulo na página. É o que "girado 90° horário" significa.

Pixel fora do recorte (`px < 0` ou `px > width`) cai na margem da página; o empacotador **DEVERIA** deixar borda (bleed) para isso. Um runtime **DEVERIA** pré-calcular os UVs finais ao carregar. Leitor **DEVE** aceitar `rotation` 0 e 90. Outros valores: L1, tratar como 0.

### 10.5 Resolução, escala e variantes

- Nome procurado: `attachment.path` (ou placeholder). Procura em `regions[].name`, depois em `aliases`. Primeira ocorrência entre os atlas de `assets.atlases`, na ordem.
- Todo px do atlas (`x`, `width`, `offsetX`, `originalWidth` …) é dividido por `scale` para virar px de esqueleto. Um `region` gravado com `width 0` no `.bone` usa `originalWidth / scale`.
- Variantes de resolução: um atlas por escala (`heroi.atlas.json`, `heroi@0.5x.atlas.json`). O `.bone` lista **um** conjunto em `assets.atlases`; o jogo troca o caminho ao carregar se quiser outra escala. O formato não escolhe.
- Imagem solta (sem atlas): tratada como região única, `rotation 0`, sem offsets, `scale 1`. Se `width/height` do attachment não baterem com a imagem, o leitor usa a imagem e avisa.
- Se nada for encontrado, o runtime **DEVE** avisar uma vez e desenhar nada para esse attachment. Nunca abortar.

### 10.6 Exemplo

```json
{
  "atlas": { "version": "1.0", "generator": "Recorte 0.1.0" },
  "scale": 1,
  "pages": [
    { "name": "boneco", "image": "boneco.png", "width": 256, "height": 256, "magFilter": "linear", "premultiplied": false }
  ],
  "regions": [
    { "name": "corpo", "page": 0, "x": 0, "y": 0, "width": 80, "height": 120 },
    { "name": "braco", "page": 0, "x": 0, "y": 120, "width": 60, "height": 20, "rotation": 90 },
    { "name": "armadura/corpo", "page": 0, "x": 80, "y": 0, "width": 72, "height": 110,
      "offsetX": 4, "offsetY": 6, "originalWidth": 80, "originalHeight": 120 }
  ]
}
```

---

## 11. Binário `.boneb`

### 11.1 Princípio: auto-descritivo, com blocos canônicos

O `.skel` do Spine é um layout fixo: cada versão do editor muda o layout e o runtime velho não abre. É o erro que este formato existe para evitar.

Por isso o `.boneb` **não** é um layout fixo por objeto. É a **mesma árvore JSON**, codificada de forma compacta e **auto-descritiva**: nomes de propriedade via tabela de strings, valores com tag de tipo, arrays numéricos como blocos contíguos. Um leitor 1.0 abre um `.boneb` 1.7 e ignora o que não conhece, igual ao JSON. Toda regra das seções 2 a 10 vale sem mudança.

Para os dados pesados (chaves de timeline, pesos, vértices) existem **blocos canônicos** de layout fixo (11.6), em estrutura de arrays, mapeáveis em memória sem cópia. Eles são referenciados da árvore. O leitor sabe o tamanho de todo bloco, então bloco desconhecido é pulado.

Conversão `.bone` → `.boneb` → `.bone` **DEVE** devolver a mesma árvore, a menos de: precisão float 32 (3.6), ordem de propriedades e formatação de números.

### 11.2 Convenções

| Item | Regra |
|:---|:---|
| Ordem de bytes | **Little-endian** em tudo. |
| Inteiros | `u8`, `u16`, `u32`, `i32`, `u64`, `i64`. |
| Floats | `f32` (IEEE 754). `f64` existe na codificação; 1.0 não o grava. |
| Alinhamento | Toda seção e todo bloco começam em múltiplo de **16 bytes**. Preenchimento com zeros. |
| Strings | UTF-8, sem NUL, via tabela (11.4). |
| Sem compressão interna | Quem quiser, usa `.bonez` (deflate) por cima. |

### 11.3 Cabeçalho fixo (32 bytes)

| Offset | Tipo | Campo | Valor |
|:---:|:---:|:---|:---|
| 0 | `u8[8]` | `magic` | `89 42 4F 4E 45 0D 0A 1A` = `\x89BONE\r\n\x1a`. Truque do PNG: detecta transferência em modo texto e leitor que corta em Ctrl-Z. |
| 8 | `u16` | `layoutVersion` | `1`. Versão **deste layout binário**, independente da versão do formato. Muda só se a codificação de 11.5 mudar. |
| 10 | `u16` | `flags` | bit 0: tem seção `INDX`. Outros bits: 0. Leitor ignora bits desconhecidos. |
| 12 | `u16` | `formatMajor` | Cópia de `bone.version`. |
| 14 | `u16` | `formatMinor` | |
| 16 | `u16` | `minMajor` | Cópia de `bone.minVersion`. |
| 18 | `u16` | `minMinor` | |
| 20 | `u32` | `sectionCount` | Número de entradas na tabela de seções. |
| 24 | `u64` | `fileSize` | Tamanho total do arquivo em bytes. Leitor **DEVE** recusar se não bater. |

Os campos de versão são cópia do cabeçalho `bone` que está dentro da árvore. Servem para espiar sem decodificar. Se divergirem, vale a árvore (L1). `layoutVersion` maior que o conhecido: leitor **DEVE** recusar (L0 `BIN_LAYOUT_VERSION`), citando as duas versões.

**Fim do arquivo.** Um gravador **DEVE** terminar o arquivo no fim da última seção, **sem preenchimento de cauda**. Um leitor **DEVE** aceitar preenchimento de cauda: bytes depois do fim da última seção são ignorados, e `fileSize` conta o arquivo inteiro, preenchimento incluído. Sem esta frase, dois gravadores corretos produziam arquivos diferentes para o mesmo esqueleto, e um leitor mais estrito recusava o do outro.

### 11.4 Tabela de seções

Logo após o cabeçalho, `sectionCount` entradas de 24 bytes:

| Offset | Tipo | Campo |
|:---:|:---:|:---|
| 0 | `u32` | `tag` — 4 bytes ASCII, lidos como estão. |
| 4 | `u32` | `flags` — reservado, 0. |
| 8 | `u64` | `offset` — do início do arquivo. Múltiplo de 16. |
| 16 | `u64` | `length` — em bytes, sem o preenchimento. |

Regras: `offset + length <= fileSize` (leitor **DEVE** checar antes de ler). Seções não se sobrepõem. Tag desconhecida: **pular e preservar** se regravar. Tag repetida: inválido.

| `tag` | Obrigatória | Conteúdo |
|:---:|:---:|:---|
| `STRS` | sim | Tabela de strings: `u32 count`; `u32 offsets[count + 1]` (relativos ao início dos bytes); bytes UTF-8 concatenados. String `i` = bytes `[offsets[i], offsets[i+1])`. Índice `0` **DEVE** ser a string vazia. Strings **DEVERIAM** ser deduplicadas. `offsets[0] == 0`, não decrescente, `offsets[count] == length − 4 − 4×(count+1)`; bytes UTF-8 válidos sem NUL; senão L0. |
| `TREE` | sim | A árvore inteira (11.5). O valor raiz é o objeto raiz de 2.2. |
| `BLOB` | não | Blocos numéricos e blocos canônicos (11.6). |
| `INDX` | não | Índice para carga preguiçosa (11.7). |
| `JSON` | não | Cópia UTF-8 do `.bone` equivalente. Ferramenta de emergência. Se presente, **DEVE** ser idêntica à árvore. Se divergir da árvore, vale `TREE` (L1 `BIN_JSON_MISMATCH`). |

### 11.5 Codificação da árvore (`TREE`)

Cada valor é `1 byte` de tipo seguido do payload.

| Tipo | Nome | Payload | Vira em JSON |
|:---:|:---|:---|:---|
| `0x00` | null | — | `null` |
| `0x01` | false | — | `false` |
| `0x02` | true | — | `true` |
| `0x03` | int | `i32` | número inteiro |
| `0x04` | float | `f32` | número |
| `0x05` | double | `f64` | número (reservado; 1.0 não grava) |
| `0x06` | string | `u32` índice em `STRS` | string |
| `0x07` | array | `u32 count`, depois `count` valores | array misto |
| `0x08` | object | `u32 count`, depois `count` × (`u32` índice da chave, valor) | objeto |
| `0x09` | f32 array | `u32 count`, `f32 × count` | array de números |
| `0x0A` | u32 array | `u32 count`, `u32 × count` | array de inteiros |
| `0x0B` | i32 array | `u32 count`, `i32 × count` | array de inteiros |
| `0x0C` | u16 array | `u32 count`, `u16 × count` | array de inteiros |
| `0x0D` | u8 array | `u32 count`, `u8 × count` | array de inteiros |
| `0x0E` | blob ref | `u32` índice em `BLOB` | o valor que o bloco representa (11.6) |
| `0x0F` | int64 | `i64` | número inteiro |
| `0x10`–`0x1F` | reservados | — | Leitor **DEVE** recusar: layout novo. |
| `0x20`–`0xFF` | futuros com tamanho | `u32 byteLength`, depois `byteLength` bytes | Leitor **DEVE** pular e **DEVERIA** preservar como blob opaco. |

Regras do gravador:
- Chaves de objeto: índice de string. Chaves duplicadas no mesmo objeto: inválido.
- Todo `number` do JSON vira `0x04 f32`, exceto os declarados `integer` na spec (`triangles`, `hull`, `edges`, `counts`, `bones` do binding, `page`, `count`, `start`, `digits`, `setup`, `index`, `offset`, `int`, `x/y/width/height/offset*/original*` de atlas): `0x03`.
- Arrays numéricos homogêneos **DEVERIAM** virar `0x09`–`0x0D` ou blob. Arrays mistos ou de objetos: `0x07`.
- `keys` de uma timeline com valor numérico e `>= 64` chaves **DEVE** ir para um bloco canônico `TKEY` (11.6) **se** nenhuma chave tem `extras`, `extensions` ou propriedade fora de `time`, `value`, `curve`, **e** nenhuma chave traz `curve: "linear"` escrita; caso contrário usa a árvore. `binding` com `>= 64` influências: idem, para `BIND`. Abaixo disso, **PODE**.
  - **Por que a exceção do `"linear"` escrito.** O `TKEY` guarda a interpolação em `u8 curveType[]`, e `0` quer dizer *linear*. Em JSON, `linear` é o padrão de 9.2: a chave pode não ter `curve` nenhuma, ou ter `curve: "linear"` escrita, e as duas viram `0`. Na volta o leitor teria que escolher uma das duas, e 11.1 exige que a ida e a volta devolvam **a mesma árvore**. Sem esta exceção, um arquivo com `>= 64` chaves e um `"linear"` escrito não teria gravação legal nenhuma: o `DEVE` mandaria usar `TKEY`, e o `TKEY` perderia o dado. Com ela, a timeline fica na árvore, onde a diferença é preservada, e a promessa de 11.1 continua de pé. O caso **BIN-401** da suíte de conformidade é exatamente esse arquivo.
- Profundidade máxima da árvore: 64 (12.6).

Regras do leitor:
- Antes de alocar `count` elementos, checar `count × tamanho <= bytes restantes da seção`.
- Índice de string `>= STRS.count`: inválido, parar.
- Tipo `0x09`–`0x0D` é semanticamente igual a `0x07` com números dentro. Um leitor genérico pode expandir; um runtime usa direto.
- O valor raiz de `TREE` **DEVE** ser `0x08`. `0x0E` com índice `>= BLOB.count`, ou sem seção `BLOB`: L0. `TKEY`: `elemCount == keyCount`; `BIND`: `elemCount == vertexCount`; `F32..U8`: `elemCount × tamanho <= byteLength`; senão L0.

### 11.6 Seção `BLOB` e blocos canônicos

```
u32 count
count × { u32 kind, u32 elemCount, u64 offset, u64 byteLength }   // offset relativo ao início da seção, múltiplo de 16
bytes...
```

`byteLength` permite pular qualquer `kind` desconhecido (**DEVE** pular, **DEVERIA** preservar). Um `0x0E` na árvore é o mesmo que o valor decodificado no lugar.

| `kind` | Nome | Representa | Layout |
|:---:|:---|:---|:---|
| `1`–`5` | `F32`, `U32`, `I32`, `U16`, `U8` | Array numérico plano (`elemCount` elementos) | Os elementos, contíguos. |
| `16` | `TKEY` | O array `keys` de uma timeline de valor **numérico** (number, color4, color3) | Abaixo. |
| `17` | `BIND` | O objeto `binding` (7.4) | Abaixo. |
| `18` | `VERT` | O array `vertices` de um attachment | `f32 × elemCount`. Igual a `F32`; o nome ajuda ferramentas. |

**`TKEY`** (`elemCount` = número de chaves, `C` = componentes):

```
u32 keyCount
u32 components            // C: 1, 3 ou 4
u32 nullable              // 1 para darkColor (permite null), senão 0
f32 times[keyCount]
f32 values[keyCount × C]  // null (darkColor) = qualquer NaN no primeiro componente; o gravador escreve 0xFFFFFFFF, o leitor testa isNaN, não os bits
u8  curveType[keyCount]   // 0 = linear, 1 = stepped, 2 = bezier
(zeros até que o offset do próximo campo, contado do início do bloco, seja múltiplo de 16)
u32 bezierCount           // quantas chaves têm curveType == 2
f32 bezier[bezierCount × 4 × C]   // na ordem das chaves
```

**`BIND`** (`elemCount` = número de vértices `N`):

```
u32 vertexCount           // N
u32 total                 // Σ counts
u32 counts[N]
u32 bones[total]
(zeros até o próximo múltiplo de 16 contado do início do bloco)
f32 positions[2 × total]
f32 weights[total]
```

Um runtime **PODE** apontar `Float32Array` / `float*` direto para `times`, `values`, `positions`, `weights`.

### 11.7 Seção `INDX`

Carga preguiçosa: um jogo abre o esqueleto e carrega cada animação ou skin quando precisar.

```
u32 count
count × { u32 kind, u32 name (índice STRS), u64 offset (relativo ao início de TREE), u64 length }
kind: 1 = animação, 2 = skin, 3 = extensão raiz
```

`offset` aponta para o valor `0x08` do objeto dentro de `TREE`. O índice é redundante: um leitor sem `INDX` decodifica tudo e chega ao mesmo.

### 11.8 Exemplo (bytes do início)

```
89 42 4F 4E 45 0D 0A 1A   magic
01 00                     layoutVersion 1
01 00                     flags: tem INDX
01 00  00 00              format 1.0
01 00  00 00              min 1.0
04 00 00 00               4 seções
xx xx xx xx xx xx xx xx   fileSize
-- tabela de seções (4 × 24 bytes) --
53 54 52 53  00 00 00 00  80 00 00 00 00 00 00 00  ..    STRS @ 0x80
54 52 45 45  ...                                         TREE
42 4C 4F 42  ...                                         BLOB
49 4E 44 58  ...                                         INDX
```

### 11.9 O que muda entre `.bone` e `.boneb`

| | `.bone` | `.boneb` |
|:---|:---|:---|
| Propriedade desconhecida | Ignora | Ignora (tipo conhecido) ou pula (tipo `0x20+`, bloco de `kind` novo) |
| Extensão desconhecida | Preserva o objeto | Preserva a subárvore |
| Precisão | float 64 | float 32 (3.6) |
| Ordem de propriedades | Livre; `bone` primeiro | Livre. O cabeçalho fixo cobre o "espiar". |
| Validação | JSON Schema | Decodificar para árvore e aplicar o mesmo JSON Schema |
| Carga | Tudo | Árvore sem `animations`/`skins` primeiro; animações e skins sob demanda via `INDX` |

A ferramenta oficial `bone convert` faz ida e volta, e o caso de conformidade `BIN-401` (12.4) exige que a volta bata.

---

## 12. Conformidade

### 12.1 Níveis de leitor

Um leitor declara um nível. Cada nível inclui o anterior. A meta é que uma engine pequena consiga o nível A em um fim de semana.

| Nível | Nome | DEVE suportar |
|:---:|:---|:---|
| **A** | Básico | Cabeçalho e versionamento (2.3, 2.4), fallbacks (2.5), caminhos (2.8), `.bonez` (2.9), ossos com herança (5), slots, `region`, skins e placeholders (7.1), atlas (10), timelines `bone`, `slot`, `drawOrder`, `event`, curvas (9.3), eventos (8.6). |
| **B** | Malha | Nível A + `mesh`, pesos (7.4), `linkedmesh`, `boundingbox`, `clipping`, `point`, `sequence`, `deform`, `weights` (9.6), `slot/bone` (9.5), `variable`, `tag`, `.boneb` (11). |
| **C** | Completo | Nível B + todas as constraints (6), `path`, `skeleton` aninhado (7.11) com os dois canais de animação, a virada de corpo (`body`, 9.13), animações e peles de fora com osso e `reference` (2.8, 4.8), parâmetros e drivers (8.1, 8.2), morphs (8.3), timelines `constraint`, `parameter`, `morph`, `nested`. |

Arquivo que usa um nível acima do leitor **ainda abre**; as partes não suportadas seguem os fallbacks de 2.5 e 7.2.

### 12.2 O que todo leitor DEVE, DEVERIA e PODE

**Todo leitor, de qualquer nível, DEVE:**

1. Abrir qualquer arquivo com `bone.version` de `major` igual ao seu, mesmo com `minor` maior (2.4). Nunca recusar por `minor` nem por `minVersion`.
2. Ignorar propriedade, tipo, timeline, constraint, seção binária e extensão desconhecidos, com o fallback de 2.5.
3. Recusar ou avisar, com mensagem que cita as versões, só nos casos em que 2.4 e 2.7 permitem. Reportar erro para `extensionsRequired` desconhecida.
4. Aplicar exatamente os padrões das tabelas quando um campo falta.
5. Produzir `Pose(...)` (9.10) dentro da tolerância de 3.6 para os níveis que declara. Aplicar constraints na ordem do array, com a regra de sujeira de 5.6.
6. Não normalizar pesos. Não reordenar ossos, slots ou constraints.
7. Resolver nomes de attachment uma vez por troca de skin. Nunca por quadro.
8. Continuar funcionando com imagem, atlas, áudio, esqueleto aninhado, arquivo de animações ou de skins faltando (2.8): o resto abre. Um corpo citado por `body` (9.13) que não carregou, ou um contrato de rig (4.8) não atendido, também não fecha o arquivo.
9. Expor a lista de avisos (arquivo mais novo, extensão ignorada, recurso faltando, blend não suportado) por API, não só por log. Avisar uma vez, não uma vez por quadro.
10. Expor ao jogo: matriz de mundo dos ossos, `point`, `boundingbox`, eventos com todos os campos, variáveis, tags, parâmetros (ler e escrever), `physicsReset`.
11. Respeitar os limites de 12.6: parar com erro claro antes de estourar memória.
12. Nunca executar nada do arquivo, nunca acessar rede, nunca sair da pasta base (12.6). Tratar toda string como dado.
13. Aceitar `.bone`. Nível B ou acima: aceitar também `.boneb`. Aceitar `.bonez` ou dizer claramente que não.

**Todo leitor DEVERIA:**

- Passar a suíte de conformidade do seu nível (12.4) e publicar o relatório.
- Pré-calcular UVs, cantos de `region` e ponteiros de attachment ao carregar.
- Guardar o cache de sujeira de 5.6 por osso, em vez de varrer o esqueleto a cada constraint. A **regra** de sujeira é obrigatória (5.6); só a forma do cache é livre.
- Limitar `delta` da física e chamar `physicsReset` em teletransporte.
- Expor eventos como callbacks com os valores efetivos de 8.6.
- Carregar animações sob demanda no binário (`INDX`).
- Implementar `pixelArt` e `referenceScale`.
- Oferecer skins compostas em runtime e mix por track com crossfade; a spec não obriga o algoritmo.

**Todo leitor PODE:**

- Recusar arquivo com `major` maior que o seu.
- Carregar em modo degradado um arquivo com `extensionsRequired` não suportada, se o usuário pedir.
- Calcular em float 64. Truncar `number` do JSON para float 32.
- Aproximar curvas com tabelas, dentro da tolerância.
- Usar stencil para clipping. Aproximar elipse por polígono.
- Assar física em chaves ao carregar, se o jogo não simula.
- Implementar nível maior parcialmente, desde que declare só o nível completo que atinge.
- Pré-calcular, tabelar, mapear em memória, reordenar internamente — desde que o resultado bata com 12.4.

### 12.3 Validação

**Níveis de severidade**

| Nível | Nome | Significado | Exemplo |
|:---:|:---|:---|:---|
| **L0** | Erro de estrutura | Não é um `.bone`. | JSON mal formado, `bone.version` ausente, tipo errado no schema, magic errado, seção fora do arquivo. |
| **L1** | Erro semântico | É um `.bone`, mas quebra uma regra desta spec. | Referência a osso inexistente, ciclo de `parent`, `uvs.length != 2N`, `time` fora de ordem, `..` em uri. |
| **L2** | Aviso | Válido, mas suspeito ou fora da prática recomendada. | Extensão não registrada, chave em `duration` com loop, nome com maiúsculas em uri, tag não declarada. |
| **L3** | Informação | Fatos úteis. | Contagem de objetos, versão, recursos usados, `minVersion` calculado. |

**"Válido" = zero L0 e zero L1.** Um leitor **DEVERIA** abrir arquivo com L1 mesmo assim (ignorando o objeto quebrado, 4.7), mas **NÃO DEVE** chamá-lo de válido.

**Relatório do validador** — JSON, mesmo espírito do glTF-Validator:

```json
{
  "uri": "heroi.bone",
  "validatorVersion": "1.0.3",
  "formatVersion": "1.0",
  "level": "C",
  "issues": {
    "numErrors": 1, "numWarnings": 2, "numInfos": 4,
    "messages": [
      { "code": "REF_BONE_MISSING", "severity": 1,
        "message": "slot 'mao' aponta para osso 'braco_d', que não existe",
        "pointer": "/slots/7/bone" }
    ]
  },
  "info": { "bones": 42, "slots": 30, "animations": 12, "extensionsUsed": ["ACME_glow"] }
}
```

- `pointer` é um JSON Pointer (RFC 6901). No `.boneb`, o mesmo pointer sobre a árvore decodificada.
- `code` é estável entre versões do validador: uma vez publicado, nunca muda de significado. Lista completa em `validator/CODES.md`.
- `level` é o menor nível de leitor capaz de mostrar o arquivo sem perda.

**Etapas do validador (nesta ordem, parando em L0):**

1. Bytes: UTF-8 válido, sem NUL; ou magic e cabeçalho binário; ou `mimetype` e `manifest.json` do ZIP.
2. Sintaxe: JSON RFC 8259 sem duplicata; ou árvore binária decodificável.
3. Schema: JSON Schema da versão `bone.version` (12.7). Propriedade desconhecida **não** é erro.
4. Referências: toda tabela de 4.7. Unicidade de `name`. Ordem topológica de `bones`.
5. Faixas e comprimentos: tudo que as seções 4–10 marcam como L1.
6. Recursos externos, se acessíveis: atlas, imagens, áudio, aninhados. Faltando: L2, não L1.
7. Extensões: nomes em `extensionsUsed`, schemas registrados, `extensionsRequired ⊆ extensionsUsed`.
8. Cálculo de `minVersion` e de `level`; comparação com o gravado (L2 se o gravado for maior que o necessário; L1 se menor).

**Regras semânticas com código** (lista inicial; o repositório mantém a completa):

| Código | Regra | Sev. |
|:---|:---|:---:|
| `SCHEMA_*` | Qualquer violação do schema (tipo, obrigatório). **Exceção:** violação de `enum`, `minimum`, `maximum` é L1 (`RANGE_SCHEMA`); o leitor aplica o fallback de 2.5 ou clampa. | L0 / L1 |
| `VERSION_MIN_GT_VERSION` | `minVersion > version`. | L1 |
| `VERSION_MIN_WRONG` | `minVersion` menor que o exigido pelos recursos usados. | L1 |
| `ORDER_BONE_PARENT` | Pai depois do filho, ou ciclo de `parent`, ou raiz que não é o primeiro, ou mais de uma raiz. | L1 |
| `REF_*_MISSING` | Referência (`bone`, `slot`, `target`, `parent`, `skin`, `includes`, `animation`, `parameter`, `event`, `morph`, `variable`, `placeholder`) inexistente. | L1 |
| `REF_NAME_DUPLICATE` | Nome repetido na categoria. | L1 |
| `NAME_NOT_NFC` | `name` que não está em forma NFC. | L1 |
| `RANGE_FLOAT32` | Número de módulo maior que `3.4028235e38` (2.1). | L1 |
| `RANGE_MESH_SIZE` | `uvs != 2N`, `triangles` não múltiplo de 3 ou índice `>= N`, `hull > N`, `N < 3`, `edges` fora. | L1 |
| `RANGE_BINDING_SIZE` | Tamanhos do `binding` inconsistentes; `bones[i] >= bones.length`; `counts[i] < 1`. | L1 |
| `RANGE_WEIGHT_SUM` | Soma de pesos por vértice fora de `1 ± 1e-4`. | L1 |
| `RANGE_DEFORM_SIZE` | `deform`/`offsets` mais longos que o layout. | L1 |
| `RANGE_PARAM` | `max <= min`; `default` fora; `source.to == from`; parâmetro com `source` e timeline. | L1 |
| `RANGE_MORPH` | `max <= min`; alvo não é `mesh`. | L1 |
| `RANGE_KEY_CURVE` | `curve` com tamanho diferente de `4×C`; `cx` fora de ordem ou fora do intervalo. | L1 |
| `RANGE_KEY_TIME` | `time < 0`; `time > duration`; `drawOrder` com `i + offset` fora de `0..n-1`. | L1 |
| `ORDER_KEY_TIME` | `time` não crescente (não decrescente em `event`). | L1 |
| `ORDER_TIMELINE_DUPLICATE` | Duas timelines para o mesmo `(type, target, property, skin, attachment)`. | L1 |
| `ORDER_TIMELINE_TARGET` | Timeline sem sentido para o alvo (`deform` num `region`, `property` que não bate com o tipo da constraint, `mode add` proibido). | L1 |
| `ORDER_IK` | 2 ossos: `bones[1].parent != bones[0]`, modo diferente de `normal`, alvo na cadeia, raiz constrangida. | L1 |
| `ORDER_DRIVER` | Driver sem `targets` nem `animation`, ou com os dois; driver escreve no próprio parâmetro. | L1 |
| `ORDER_SKIN_CYCLE` | Ciclo em `skin.includes`. | L1 |
| `ORDER_NESTED_CYCLE` | Ciclo ou profundidade `> 8` em esqueleto aninhado. | L1 |
| `EXTERNAL_CHAIN` | Arquivo citado em `assets.animations` ou `assets.skins` que por sua vez cita outros (2.8). | L1 |
| `NESTED_ANIMATION_MISSING` | `baseAnimation` ou `animation` que o filho não tem (7.11). | L2 |
| `RIG_UNMET` | Osso ou slot exigido por `rig` (4.8) que o hospedeiro não tem; osso de `rig.reference` que falta ou tem `length` zero. | L2 |
| `RIG_REFERENCE` | `rig.reference.length <= 0` (4.8). | L1 |
| `RIG_INCOMPLETE` | `rig` de um arquivo externo que cita **menos** do que o arquivo usa: alvo de timeline ou slot de pele que ele não declara (4.8). O hospedeiro precisa desse nome e ninguém o declarou. | L2 |
| `BODY_UNMET` | Alvo de timeline que o corpo do instante não tem (9.13); a timeline é ignorada naquele trecho. | L2 |
| `BODY_AT_START` | Chave `body` em `time: 0` com `value != null` (9.13). | L2 |
| `BODY_MISSING` | `key.value` de `body` que não está em `manifest.skeletons` ou não abre (2.5, 9.13). | L2 |
| `SLOT_BONE_UNMET` | Chave `slot/bone` cujo osso o corpo do instante não tem (9.5). | L2 |
| `TARGET_MISSING` | Alvo de timeline que o esqueleto não tem, numa animação sem virada (Apêndice C, 14). | L2 |
| `NESTED_GONE` | A instância aninhada deixou de ser mostrada pelo slot: por chave, pele ou corpo (Apêndice C, 16). | L2 |
| `EXTERNAL_BONE_NOT_SKIN` | Osso ou regra sem `skinRequired` num arquivo de `assets.skins` (2.8); ignorado. | L2 |
| `RANGE_WEIGHTS_SIZE` | Chave `weights` com tamanho diferente de `Σ counts` do `binding` (9.6). | L1 |
| `RANGE_CROP` | `animation.crop` com `width` ou `height` negativo (4.6). | L1 |
| `EXTERNAL_DUPLICATE` | Animação ou skin externa com o nome de uma local (2.8); a local vale. | L2 |
| `PARENT_CYCLE` | Chave `parent` (9.4) que faria um osso virar filho de si mesmo ou de um descendente; a chave é ignorada. | L2 |
| `ORDER_LINKEDMESH` | `parent` não é `mesh` do mesmo slot; `deform` em linkedmesh com `inheritDeform: true`. | L1 |
| `ORDER_PATH_ATT` | `path` com `K < 2` ou `lengths` de tamanho errado. | L1 |
| `URI_*` | Absoluto, `..`, `\`, `data:` fora de página, comprimento. | L1 |
| `EXT_REQUIRED_NOT_USED` | `extensionsRequired ⊄ extensionsUsed`; extensão usada e não listada. | L1 |
| `EXT_UNREGISTERED` | Extensão não registrada. | L2 |
| `EXT_SCHEMA` | Objeto de extensão, ou anexo de tipo prefixado, que não bate com o JSON Schema que a extensão publica (2.7, 12.7). | L1 |
| `RANGE_PARTICLE_MINMAX` | `min > max` numa faixa de emissor (`BONE_particles`). | L1 |
| `RANGE_PARTICLE_RATE` | Taxa de nascimento negativa, no anexo ou numa chave (`BONE_particles`). | L1 |
| `RANGE_PARTICLE_RATE_CURVE` | Bézier numa chave de taxa: a integral só é exata com `linear` ou `stepped` (`BONE_particles`). | L2 |
| `REF_PARTICLE_MESH` | `mesh` de emissor que não aponta para um anexo `mesh` do mesmo slot (`BONE_particles`). | L1 |
| `LIMIT_PARTICLE_COUNT` | `rate × lifetime.max` acima do teto de 10 000 vivas (`BONE_particles`). | L2 |
| `ATLAS_*` | Região fora da página; `originalWidth < offsetX + width`; nome repetido; `rotation` fora de `0/90`. | L1 |
| `ATLAS_REGION_MISSING` | `path` sem região e sem imagem (se recursos acessíveis). | L2 |
| `BIN_*` | Magic, `fileSize`, seção fora do arquivo, sobreposição, string fora da tabela, `count` maior que a seção, tipo reservado, `layoutVersion` desconhecido. | L0 |
| `BIN_JSON_MISMATCH` | Seção `JSON` diverge de `TREE` (11.4). | L1 |
| `ZIP_*` | `mimetype` errado ou fora da primeira posição, sem manifesto, método de compressão inválido, razão de descompressão > 200:1, nome de entrada repetido. | L0 / L1 |
| `ZIP_UNLISTED` | Entrada citada por um esqueleto e ausente das listas do manifesto (2.9). | L2 |
| `LIMIT_*` | Qualquer limite duro de 12.6 estourado. | L1 |
| `HINT_PLACEHOLDER_MISSING` | Placeholder citado em `slot.attachment`/timeline sem attachment em skin alguma. | L2 |
| `HINT_TAG_UNDECLARED` | Tag usada e não declarada em `tags`. | L2 |
| `HINT_EVENT_AT_DURATION` | Chave de evento em `duration` com `loop: true`. | L2 |
| `HINT_SEQUENCE_SIZE` | Frames de sequência com tamanhos diferentes. | L2 |
| `HINT_SKIN_BONE` | Osso sem `skinRequired` em `skin.bones`. | L2 |
| `HINT_UNKNOWN_PROPERTY` | Propriedade desconhecida no núcleo (possível erro de digitação). | L3 |

### 12.4 Suíte de conformidade

É como um runtime **prova** que lê o formato certo. Mesmo papel dos testes de navegador para HTML.

A suíte oficial está em `conformidade/`, e os nomes de pasta são os reais do
repositório — em português, como o resto do projeto:

```
conformidade/
  casos/
    A-010-heranca-cinco-modos/
      entrada.bone         arquivo de entrada (.boneb ou .bonez num caso BIN/ZIP)
      entrada.atlas.json   (se precisar)
      probe.json           o que medir — opcional; sem ele vale a chave "probe"
                           do esperado.json
      esperado.json        resultado esperado (pose dump), e a sonda
      leiame.md            o que o caso prova, e a conta que produz o esperado
    A-011-shear/  A-020-curvas/  A-021-rotacao-sem-volta/  ...
    A-029-draworder-colisao/
    B-101-pesos-sem-normalizar/  B-102-atlas-regiao-com-corte/
    B-103-atlas-regiao-girada/   B-104-linkedmesh/
    B-110-sequencia-sete-modos/
    C-200-ordem-das-constraints/ ... C-224-transform-mix-parcial-mais-de-180/
    C-230-transform-com-shear/   C-231-raiz-com-coluna-zerada/
    C-250-deform-mais-morph/     C-260-fisica-passo-fixo/
    C-280-ordem-por-pele/        (skin.drawOrder e a ordem base, 4.4 e 9.5)
    C-281-trocar-de-pai/  C-282-trocar-de-pai-em-laco/  C-286-trocar-de-pai-ciclo/   (9.4 parent)
    C-283-heranca-noRotation/  C-284-heranca-noReflection/  C-285-heranca-onlyReflection/   (5.3, os modos do F3)
    C-270-aninhado-basico/  C-273-espelha-animacao/  C-274-animacao-de-fundo/   (7.11, a entidade e os dois canais)
    C-275-animacoes-externas/  C-276-rig-nao-atendido/  C-277-skin-externa/  C-279-externa-local-ganha/   (2.8, 4.8)
    C-290-virada-corte-seco/  C-291-virada-em-laco/  C-292-virada-e-entidade/  C-293-virada-e-pilha/   (9.13)
    C-294-pele-externa-com-osso/  C-295-desenho-troca-de-osso/  C-296-pesos-animados/  C-297-retarget-translacao/   (2.8, 9.5, 9.6)
    C-298-pilha-sem-default/   (4.4: a default só está ativa se estiver na pilha)
    C-299-fundo-comeca-na-chave/  C-300-evento-do-filho-no-relogio-do-pai/   (7.11, Apêndice C 1 e 6)
    C-263-fisica-amortecimento/   (6.5: o freio, com a conta à mão)
    C-310-aninhado-em-bloco/  C-311-este-boneco/  C-312-este-boneco-ordem-do-filho/
    C-313-este-boneco-ordem-do-pai/  C-314-este-boneco-dois/  C-315-este-boneco-niveis-bloco/
    C-316-este-boneco-niveis-marcado/  C-317-este-boneco-meio-some/
    C-318-este-boneco-mascara-do-filho/  C-319-este-boneco-mascara-do-pai/   (7.11 around, canal drawList)
    C-320-entidade-troca-de-placeholder-mesma-uri/  C-321-entidade-troca-de-placeholder-outra-uri/   (7.11, o relógio na troca)
    X-301-propriedade-desconhecida/     (X = compatibilidade, obrigatório em todo nível)
    X-302-tipo-desconhecido/
    X-303-minor-maior/
    X-304-extensao-nao-exigida/
    X-305-extensao-exigida-desconhecida/
    X-307-este-boneco-slot-que-nao-existe/
    BIN-401-roundtrip/                  (BIN = a embalagem binária)
    ZIP-501-manifesto/                  (ZIP = o pacote e o manifesto)
  casos-pendentes/           casos completos (entrada, esperado conferido à mão, leiame)
                             que NENHUM dos dois runtimes passa ainda. O executor não
                             varre esta pasta; cada caso é movido para casos/ no lote em
                             que os DOIS runtimes ficam verdes (12.8). Um recurso com caso
                             aqui está especificado, não provado. Vazia desde 17/09/2026:
                             os 18 casos do rascunho 0.2 entraram em casos/ nesse dia.
  adaptador-referencia.mjs   adaptador que passa nos casos, para ler e copiar
  como-provar-conformidade.md
  REGISTRY.md                registro público de quem passou
```

O executor é `ferramentas/conformidade.mjs`.

**O que a suíte AINDA NÃO cobre.** Um número de casos não é uma promessa de
cobertura, e esta lista existe para ninguém confundir as duas coisas. Nenhum
caso exercita, hoje: `blend`, o modo contínuo do `driver` (`animation`), o
`source` de parâmetro (Smart Bone), nem os alvos de `driver` fora de `bone`.
*(05/11/2026: entraram A-032 `darkColor`, B-120 `tag` e o canal `tags`, B-121
`variable` e o canal `variables`, C-330 `parameter`, o canal `parameters` e o
`driver` em modo alvos. `boundingbox` e o canal `boundingBoxes` já tinham caso;
`clipping` aparece em quatro casos de `drawList`. Até esta data a lista dizia
"nenhum caso exercita `boundingbox`, `clipping`, `tag`, `variable`,
`parameter`, `driver`, `darkColor` nem `blend`".)* (O `skeleton` aninhado, os dois canais de animação do
filho, o `rig`, as animações e peles de fora, a virada, `slot/bone`, `weights`,
a pele com osso, `rig.reference`, o `point` e o canal `points` **são** medidos
desde 17/09/2026: C-270 a C-300, em `casos/`, com os dois runtimes passando.) A família `R-` (renderização) e o caso `X-306` (arquivo da `minor`
anterior, congelado) estão previstos e ainda não existem. Também falta um caso
de `.bonez` com o `main` numa subpasta, que é o único jeito de separar "pasta
do main" de "raiz do ZIP" (2.8).

Consequência prática, e ela é séria: um runtime pode passar em 100% da suíte
de hoje e se declarar "bone 1.0 nível C" **sem** ter implementado nada dessa
lista. Enquanto os casos não existirem, um implementador honesto deve dizer
também o que não testou, e quem consome o registro deve ler a coluna "Casos"
como "passou nestes", não como "implementa tudo". Fechar essa lista é
pré-requisito para congelar a 1.0.

**`probe.json`** diz ao harness o que pedir ao runtime:

```json
{
  "skins": ["default"],
  "animation": "andar",
  "times": [0, 0.25, 0.5, 1.0],
  "loop": true,
  "physicsDt": 0.016666,
  "measure": ["bones", "slots", "drawOrder", "vertices", "uvs", "events", "points", "boundingBoxes", "tags", "variables", "parameters"]
}
```

**`expected.json`** (e a saída do runtime) — o **pose dump**:

```json
{
  "version": "1.0",
  "samples": [
    { "time": 0.5,
      "bones":  { "arm": { "a": 0.7071, "b": -0.7071, "c": 0.7071, "d": 0.7071, "worldX": 0, "worldY": 40,
                           "ax": 0, "ay": 40, "arotation": 45, "ascaleX": 1, "ascaleY": 1, "ashearX": 0, "ashearY": 0 } },
      "slots":  { "arm": { "attachment": "arm", "color": [1, 0.8, 0.8, 1], "visible": true } },
      "drawOrder": ["body", "arm"],
      "vertices": { "arm/arm": [3.536, 31.464, 47.376, 77.477, 33.234, 91.619, -3.536, 48.536] },
      "uvs":      { "arm/arm": [0.015625, 0.328125, 0.484375, 0.328125, 0.484375, 0.015625, 0.015625, 0.015625] },
      "events": [ { "time": 0.5, "event": "passo", "int": 2 } ],
      "tags": ["idle"]
    }
  ]
}
```

**`body`** por amostra: a `uri` do corpo do instante (9.13), ou `null` quando é o corpo do arquivo. **Sempre presente**, também num projeto de um corpo só. Os canais `bones`, `slots`, `drawOrder`, `vertices`, `uvs`, `points` e `boundingBoxes` da amostra são os do corpo do instante: um osso que só o lobisomem tem aparece só nas amostras em que `body` o cita.

Campos de `bones`: matriz de mundo `[a, b, c, d, worldX, worldY]` e pose aplicada. Os ângulos do dump (`arotation`, `ashearX`, `ashearY`) são gravados reduzidos a `(-180, 180]`. O harness compara ângulos pela distância circular: `|((a − b + 180) mod 360) − 180| <= 1e-2`. Tolerâncias: 3.6. Eventos, ordem de desenho, tags e strings: exatos.

**Campos de `slots`** — a lista completa, e quando cada um aparece:

| Campo | Tipo | Quando aparece |
|:---|:---|:---|
| `attachment` | string ou `null` | Sempre. |
| `color` | `[r, g, b, a]` | Sempre. |
| `visible` | booleano | Sempre. |
| `darkColor` | `[r, g, b]` ou `null` | Sempre. `null` quando o slot não tem dark color. |
| `sequenceIndex` | inteiro | Sempre. `-1` quando o attachment ativo não tem `sequence`. |
| `bone` | string | Sempre. O osso **aplicado** do slot: o do arquivo, ou o da chave `slot/bone` ativa (9.5). |

**`attachment`** é o nome do attachment que o placeholder **resolveu** (7.1), não o nome do placeholder. Quando o placeholder não resolve — não existe em skin ativa nenhuma, ou resolve para um tipo desconhecido que 2.5 manda tratar como vazio — o valor é `null`. É o que o caso **X-302** cobra.

**Presença de campo é normativa.** Todo campo desta tabela **DEVE** estar no dump, mesmo com o valor "vazio" (`null`, `-1`). Dois runtimes que omitem campos por critério próprio passam nos casos de hoje e mesmo assim **discordam**: o harness só compara o que o `esperado.json` cita, então a omissão nunca aparece. Foi assim que os dois runtimes do projeto divergiram em 10 dos 39 casos da fase 7 sem nenhum deles falhar. Um dump com campo faltando **NÃO** é conforme.

**`physicsDt` e o relógio.** Quando a sonda traz `physicsDt`, o runtime **DEVE** andar o relógio do esqueleto **de `physicsDt` em `physicsDt`, a partir de `t = 0`**, chamando `updatePose` em cada passo, e amostrar quando o relógio chega no tempo pedido. Os tempos pedidos são sempre múltiplos exatos do passo. Amostrar direto no tempo pedido, sem os passos intermediários, dá outro resultado: a física é um acumulador, não uma função do tempo. É o que o caso **C-260** mede.

**Janela de tempo do canal `events`.** Os eventos de uma amostra são os do intervalo **`(tempo da amostra anterior, tempo desta]`** — aberto no começo, fechado no fim. Na primeira amostra, o começo é `−∞`. É esse par que entra em `fireEvents(anim, prev, now, loop)` (8.6): `prev` é o tempo da amostra anterior do dump, `now` é o tempo desta. É o que o caso **A-027** mede.

**`loop` na sonda.** Vale para a **pose inteira**, não só para os eventos: o tempo de amostragem vira `t mod duration` antes de qualquer coisa (9.11), e os eventos usam a regra de laço de 8.6. Com `loop: false`, o tempo é limitado a `[0, duration]`.

**`uvs` sem atlas.** Uma `region` ou `mesh` cujo atlas não foi carregado tem UV **literal**: os quatro cantos `(0,1) (1,1) (1,0) (0,0)` numa região, e os `uvs` gravados no arquivo numa malha, sem o mapeamento de 10.4. O canal `uvs` de um caso sem atlas mede isso.

**`uvs`** — as coordenadas de textura de cada `region` e `mesh` na tela, já mapeadas para a página pela 10.4. Mesma chave de `vertices` (`"slot/attachment"`), e a mesma ordem de cantos numa região: BL, BR, TR, TL — oito números. Numa malha, `2N`, na ordem dos vértices. Tolerância própria: `1e-6`, porque um UV é uma **fração da página**, não uma distância em pixels de esqueleto.

Este canal não é enfeite. Sem ele a suíte não enxerga erro de textura nenhum: trocar os UVs do recorte da 7.3 pelos literais `(0,1) (1,1) (1,0) (0,0)` do texto passava em toda a suíte, porque o dump só comparava geometria — e dois runtimes podiam passar o nível B inteiro desenhando figuras completamente diferentes. Um caso que carrega atlas **DEVE** medir `uvs`.

**Quem entra em cada canal de geometria (normativo).** Um canal que ninguém escreve **nunca reprova**, porque o harness só compara o que o `expected.json` cita. Por isso a lista abaixo é obrigatória, do mesmo jeito que a presença dos campos de `slots`.

| Canal | Leva | Não leva |
|:---|:---|:---|
| `vertices` | `region`, `mesh`, `linkedmesh`, `clipping`, `path` | `boundingbox`, `point`, `skeleton` |
| `uvs` | `region`, `mesh`, `linkedmesh` | todo o resto — um clipping e um path não têm textura |
| `boundingBoxes` | `boundingbox`, e **só** ele | — |
| `points` | `point` | — |

**O filho aninhado entra nos mesmos canais, com a chave prefixada (normativo).** Um attachment `skeleton` (7.11) não tem geometria própria e por isso não entra em `vertices`; mas os objetos **do filho** entram, nos canais que já existem, com o nome do slot do pai na frente, separado por `/` — a mesma convenção que os eventos do filho já usam (`"<slot>/<evento>"`, 7.11):

| Canal | Chave de um objeto do filho | Exemplo |
|:---|:---|:---|
| `bones` | `"<slot>/<osso do filho>"` | `"weapon/lamina"` |
| `slots` | `"<slot>/<slot do filho>"` | `"weapon/lamina"` |
| `vertices`, `uvs` | `"<slot>/<slot do filho>/<anexo>"` | `"weapon/lamina/lamina"` |
| `points`, `boundingBoxes` | `"<slot>/<slot do filho>/<anexo>"` | `"weapon/punho/punho"` |
| `events` | `event: "<slot>/<evento>"` | `"weapon/disparo"` |

Filho dentro de filho: prefixo dentro de prefixo (`"montaria/cavaleiro/lamina"`). Sem esta regra nenhum canal enxerga dentro do filho, e um runtime que desenhe o filho no lugar errado passa no nível C inteiro. É o que os casos **C-270** a **C-274** cobram.

**O canal `drawList`: o que é desenhado, na ordem (normativo).** O canal `drawOrder` só cita os slots do corpo de fora: não enxerga dentro do filho, e por isso nenhum caso media a frase "o filho é desenhado inteiro na posição do slot" (7.11). O `drawList` é a lista de 7.13 já aberta, filho por filho, na ordem em que as peças vão para a tela:

```json
"drawList": [ { "piece": "aura/anel/anel", "clips": [] },
              { "piece": "perna/perna",    "clips": ["recorte/recorte"] } ]
```

| Campo | O que é |
|:---|:---|
| `piece` | `"<slot>/<anexo>"`, com o prefixo do filho como nos outros canais (`"<slot do pai>/<slot do filho>/<anexo>"`). |
| `clips` | as máscaras que cortam a peça, de fora para dentro, cada uma pelo mesmo nome (`"<slot>/<anexo>"` da `clipping`, prefixado). **Sempre presente**; lista vazia = nenhuma. |
| Quem entra | `region`, `mesh`, `linkedmesh` e o emissor `BONE_particle` (uma entrada por emissor), de slot visível e com anexo ativo. `clipping`, `point`, `boundingbox`, `path` e o próprio anexo `skeleton` não entram; as peças do filho, sim. Filho não carregado: nenhuma entrada. |
| Comparação | exata: os mesmos nomes, na mesma ordem, com as mesmas máscaras. |

É o canal que mede o `around` (7.11) e, de passagem, o clipping, que nenhum caso media. Casos **C-310** a **C-319** e **X-307**.

O `clipping` e o `path` entram em `vertices` porque a 7.4 dá vértices de mundo aos dois, e porque são eles que decidem **o que aparece na tela** e **onde uma regra de caminho põe os ossos**: um runtime que erre a forma dos dois desenha o personagem errado e passa no nível B inteiro. O `boundingbox` fica fora de `vertices` para não ser contado duas vezes.

**Forma do canal `points`.** Cada ponto é um **objeto** com três campos nomeados, nunca uma lista:

```json
"points": { "mao/mao_point": { "x": 32.526024, "y": 73.933459, "rotation": -62 } }
```

Dois runtimes que escrevam o mesmo número, um como `{"x": …}` e o outro como `[…]`, são **incomparáveis**: não existe harness que case `points.p.x` com `points.p[0]`.

**Os canais de geometria não olham `visible`.** Um slot invisível continua entrando em `vertices`, `uvs`, `boundingBoxes` e `points`. A visibilidade já é medida no canal `slots`; tirar a geometria junto esconderia os dois erros de uma vez, e faria o conjunto de chaves do dump depender do estado da animação.

É o que o caso **B-106** cobra.

**UV de uma `sequence`.** O canal `uvs` responde ao **quadro ativo**, não ao quadro da setup pose. A 7.10 diz que "só a imagem troca; vértices, pesos e UVs ficam": o que fica é o array `uvs` **do arquivo**; o que muda é o mapeamento da 10.4, porque cada quadro mora num retângulo diferente da página.

Um runtime que resolva a região **uma vez, pelo `path`**, ao carregar, erra sempre que o `path` é um prefixo — `"piscar_"`, `"hand_"` —, porque **não existe região com esse nome**. Ele cai então na regra do "sem atlas" e devolve os UV literais, com a geometria certa e a textura errada. É o que o caso **B-105** cobra.

**A física começa na PRIMEIRA `updatePose`.** A primeira amostra do dump é a primeira `updatePose` do esqueleto. O runtime **NÃO DEVE** ter andado o relógio da física antes dela — nem no construtor, nem num aquecimento para as matrizes de mundo nascerem válidas. Um construtor é invisível para o harness: quem simula nele nunca vai concordar com quem não simula, e a diferença é do tamanho do ângulo do osso vezes a `inertia`. Quem precisa do aquecimento chama `physicsReset` (6.5) depois dele. É o que o caso **C-261** cobra.

**A janela da chave `reset` é entre dois PASSOS.** Com `physicsDt`, cabem muitos passos entre duas amostras. A regra de cruzamento da 8.6 — `anterior < tempo <= agora` — usa o tempo do **passo anterior**, e não o da amostra anterior. Guardar só o tempo da amostra redispara o `reset` em todo passo depois do cruzamento, e como `physicsReset` zera o acumulador, a física fica **parada na pose de repouso para sempre**. É o que o caso **C-262** cobra.

*(Os cinco parágrafos acima entraram depois do confronto dos dois runtimes no `heroi.bone` inteiro, que divergiam em 135 campos sem nenhum caso reprovar ninguém. Apêndice A, 56 a 60.)*

**Casos de recusa.** Um caso pode exigir que o arquivo **não** carregue — é o que a 2.7 manda fazer com `extensionsRequired` que o leitor não conhece. O `expected.json` diz isso com um bloco `"recusa"` no lugar das amostras:

```json
{ "probe": { "times": [0] },
  "recusa": { "contem": "VENDOR_malha_volumetrica" },
  "version": "1.0", "samples": [] }
```

O veredito então inverte: carregar é **falhar**; recusar com esse trecho na mensagem é **passar**. Um adaptador prova a recusa saindo com código diferente de zero e escrevendo o motivo na saída de erro. É o caso X-305.

**Casos R (renderização).** Categoria opcional. Comparam `frames/<t>.png` com o **rasterizador de referência**: o visualizador oficial em modo software, sem antialias, filtro `nearest`, 1 amostra por pixel, sRGB. Tolerância: 1% dos pixels diferentes em mais de 8/255 por canal. Um runtime **PODE** declarar "R" além do nível.

**Como um runtime prova conformidade:**

1. Implementa um **adaptador** de 100–300 linhas: carrega o caso, aplica `probe.json`, escreve o pose dump.
2. Roda `bone conform --level C --adapter ./meu-adaptador`. O harness compara cada amostra com `expected.json`.
3. Sai `conformance-report.json`: caso a caso, passou/falhou, maior desvio, nível alcançado.
4. Publica o relatório no repositório do runtime e no registro oficial (`conformidade/REGISTRY.md`) com versão e data. É **auto-certificação pública**. Não há selo pago.
5. Um runtime só pode dizer "**bone 1.0 nível C**" com 100% dos casos A, B e C **e** todos os casos X, BIN e ZIP passando. Casos X são obrigatórios em todo nível: compatibilidade não é opcional.

**Regras da suíte:**

- Cada recurso da spec tem pelo menos um caso. Recurso sem caso não entra na spec (12.8).
- Cada versão `minor` acrescenta casos e **nunca remove** os antigos. Os casos de 1.0 passam para sempre.
- A cada `minor`, o arquivo de exemplo da versão anterior entra congelado como caso X-306.
- `expected.json` é conferido por **dois caminhos independentes**. O primeiro é o runtime de referência. O segundo é a **derivação escrita à mão no `leiame.md` do caso**: a aritmética que produz cada número, com as fórmulas desta spec, em português, passo a passo. Todo caso novo **DEVE** trazer essa conta; um caso cujo `leiame.md` só transcreve o resultado do runtime não conta como segundo caminho, e o `leiame.md` **DEVE** dizer isso na linha "Esperado" (é o que faz o C-260, cujo esperado veio do runtime e que por isso prova determinismo, não fórmula). Discordância entre os dois caminhos reabre a spec, não o teste.
- Antes de congelar a 1.0, os casos A e C **DEVEM** ser conferidos também contra o spine-runtimes (C++) nos recursos portados (5.4, 5.5, 6.2–6.5, 9.3).

### 12.5 Gravador

**DEVE:**

- Gravar `bone.version`, `bone.minVersion`, `bone.generator` (2.3). `minVersion` correto ou igual a `version` (2.4). `bone` como primeira chave.
- Gravar `extensionsUsed` completo e `extensionsRequired` só com o que é de fato exigido (2.7).
- Produzir arquivo válido (zero L0/L1) pelo validador oficial da mesma versão.
- Preservar `extras` ao regravar (2.6).
- Normalizar pesos (7.4), ordenar `bones` topologicamente (4.2), ordenar chaves por tempo (9.1), constraints na ordem de aplicação.
- Gravar uri só com `/`, sem `..`, sem absoluto (2.8).
- No binário: usar blocos canônicos acima dos limiares de 11.5.

**DEVERIA:**

- Omitir campos com valor padrão no JSON. Gravar só minúsculas em uri. Limitar números a 6 casas (3.6).
- Preservar `extensions` e propriedades desconhecidas ao regravar (2.6).
- Oferecer "gravar como 1.x" para a menor versão que o conteúdo permitir.
- Gravar `skeleton.hash` e `bone.id` estáveis.
- Avisar quando usa recurso de nível C, para quem mira leitores simples.

**PODE:**

- Gravar `.boneb` com seção `JSON` espelho (11.4).
- Fazer bake de física e de drivers em chaves, com a constraint mantida e `mix = 0`.

### 12.6 Limites e segurança

Um arquivo é dado que chega de fora. Todo limite aqui existe para que um leitor consiga dizer "não" antes de alocar.

**Limites duros (arquivo inválido acima, L1 `LIMIT_`):**

| Item | Máximo |
|:---|---:|
| Tamanho de `.bone` (JSON) | 256 MiB |
| Tamanho de `.boneb` | 1 GiB |
| Profundidade de aninhamento JSON / árvore binária | 64 |
| Comprimento de `name` | 255 caracteres (code points; no máximo 1020 bytes) |
| Comprimento de qualquer string | 1 MiB |
| Comprimento de uri | 1024 caracteres (code points) |
| Ossos, slots, constraints, skins, eventos, parâmetros, morphs, variáveis, animações (cada) | 1 048 576 |
| Profundidade da hierarquia de ossos | 1024 |
| Vértices por attachment | 1 048 576 |
| Influências por vértice | 256 |
| Chaves por timeline | 16 777 216 |
| Timelines por animação | 1 048 576 |
| Profundidade de esqueleto aninhado | 8 |
| Profundidade de arquivo de animações ou de skins externo (2.8) | 1 — não encadeia |
| Entradas em `assets.animations` + `assets.skins` | 4096 |
| Páginas por atlas / regiões por atlas | 4096 / 1 048 576 |
| Lado de imagem de página | 16 384 px |
| `data:` URI decodificada | 16 MiB |
| Entradas em `.bonez` | 65 535 |
| Tamanho total descomprimido de `.bonez` | 4 GiB |

**Garantias mínimas (todo leitor DEVE aguentar pelo menos):** 4096 ossos, 4096 slots, 65 536 vértices por attachment, 16 influências por vértice, 256 animações, 65 536 chaves por timeline, 4 níveis de esqueleto aninhado, páginas de 8192 px. Acima disso, o leitor **PODE** recusar com erro `LIMIT_` claro. Abaixo, tem que abrir. A suíte testa os mínimos.

**Regras de segurança do leitor:**

| Ameaça | Regra |
|:---|:---|
| Zip bomb | Ler o tamanho descomprimido declarado antes de inflar. Recusar razão > 200:1 por entrada ou total > limite. Conferir cabeçalho local com o diretório central. |
| Path traversal | Rejeitar entrada de ZIP e uri cujo **segmento** seja exatamente `..` ou `.`, ou que traga `\` ou `:` em qualquer segmento, ou que comece com `/`. É a leitura de **segmento** da 2.8, e não a de sequência de caracteres: um nome como `..oculto.png` é um segmento só, não é `..`, e é **válido** — proibi-lo recusaria arquivos que a 2.8 permite. Resolver e conferir que o resultado fica dentro da base. Vale para `.bonez`, `assets`, `event.audio`, `skeleton.uri`, `page.image`. |
| Offsets binários | Toda leitura checa `offset + length <= seção`. `count × tamanho` calculado em 64 bits antes de alocar. |
| Recursão | Profundidade da árvore, de ossos, de skins (`includes`), de drivers e de esqueletos aninhados: limitar e detectar ciclo. |
| Números | Rejeitar `NaN`/`Infinity` (2.1). No binário, `f32` com NaN ou ±Infinity fora do uso permitido (11.6) é L1; leitor substitui por 0 e avisa. |
| Strings | Validar UTF-8. Nunca interpretar como caminho, comando, expressão, formato de `printf`, HTML. |
| Imagens | Decodificar com decodificador que respeita o limite de lado. Conferir `page.width/height` contra a imagem real; se diferir, usar a imagem real e avisar. |
| Rede | `http:`, `https:`, `file:` em uri são inválidos (2.8). Um leitor **NUNCA** busca nada fora da base. |
| Áudio | O leitor nunca decodifica nem toca. Só entrega o caminho. |
| Tempo | Chaves com `time` gigante ou `duration` gigante são válidas; o leitor **NÃO DEVE** iterar quadro a quadro para chegar lá. |

### 12.7 JSON Schema

- Publicado em `schema/<version>/` no repositório: `bone.schema.json` (raiz, com `definitions` para cada objeto, para o atlas e para o `manifest.json`), `pose-dump.schema.json`, `validator-report.schema.json`.
- Dialeto desta versão: **JSON Schema draft-07**. `$id` canônico: `https://recorte.dev/schemas/bone-0.1.schema.json` (domínio provisório; o `$id` é identificador, não download — o validador embute os schemas).
- Todo objeto tem `"additionalProperties": true`. Desconhecido é permitido por desenho (2.5).
- Todo `extensions` é `object` com `patternProperties` `^[A-Z][A-Z0-9]{1,7}_[a-z0-9_]+$`. Extensões registradas trazem o seu schema e o validador o aplica pelo nome.
- Enums do núcleo aparecem no schema como `string` com `enum` **e** `"x-fallback"` dizendo o valor de 2.5. O validador oficial trata enum desconhecido como L1 quando o `minor` do arquivo é igual ao do schema e como L2 quando é maior.
- Enums do núcleo trazem `"x-enum-since": { "<valor>": "1.x" }` para todo valor acrescentado depois da 1.0; o gravador inclui os valores presentes no cálculo de `minVersion` (2.4).
- Toda propriedade com padrão na spec traz `default` no schema, com o mesmo valor.
- O validador oficial aplica `format` (`date-time`) como L2, nunca L0.
- Cada definição de objeto tem `"x-since": "1.0"` (usado para calcular `minVersion`) e `"x-level": "A" | "B" | "C"` (usado para calcular `level`). Uma propriedade que difira da sua definição repete as duas anotações.
- Uma versão `minor` nova publica um schema novo. O schema `1.0` **nunca** muda depois de publicado (só erratas de texto, com changelog).
- O schema é o **mínimo** de validação. Regras semânticas (L1) ficam no validador, com o `code` correspondente.

### 12.8 Governança e processo de mudança

Escrito agora, para não depender da boa vontade de ninguém depois.

| Item | Regra |
|:---|:---|
| Dono | Um **comitê do formato** público, com ata. Começa com o autor do Recorte e dois implementadores independentes. Cresce por convite dos implementadores que passam a suíte. |
| Licença da spec e ferramentas | Spec: CC-BY 4.0. Schema, validador, harness, casos de teste, runtime de referência: Apache 2.0. Sem patente, sem royalty. Cláusula escrita: **nunca** muda para licença mais restritiva. |
| Proposta | Issue pública com: problema, proposta em texto, schema, arquivo de exemplo, caso de conformidade, fallback para leitor antigo. |
| Entrada no núcleo | Só o que já rodou como extensão (`EXT_` ou de marca) em **dois leitores independentes**. Nada entra "porque seria bom". |
| Ciclo | `minor` no máximo uma vez por ano. Sem prazo mínimo entre `major`, mas a meta é nunca. |
| Veto | Qualquer proposta que quebre um caso de conformidade existente é recusada sem discussão. |
| Mudança de texto | Errata não muda o número. Muda o changelog. |
| Extinção | Se o comitê parar por 24 meses, qualquer implementador que passe a suíte pode continuar o repositório sob o mesmo nome e licença. |
| Norma | Quando houver 3 leitores independentes de nível C e 2 gravadores, submeter a organização de padrões (mesmo caminho de glTF → ISO/IEC 12113). |

---

## 13. Mapeamento de importação

Legenda da coluna **Perda**: **—** sem perda · **≈** aproximação documentada · **✗** não representável no núcleo 1.0 (vai para `extras` ou extensão, com aviso).

Regras gerais:

1. Nada é descartado em silêncio. Todo **✗** vira aviso no relatório e entra em `extras` sob a chave do formato de origem (`"spine"`, `"dragonbones"`, `"spriter"`, `"live2d"`).
2. O conversor **DEVE** gravar em `extras.import` do objeto raiz: `{ "from": "spine", "version": "4.2.33", "warnings": [...] }`.
3. Y-para-baixo converte pela tabela 3.3 **antes** de qualquer outra coisa.
4. Curvas normalizadas viram absolutas: `cx = t0 + x·(t1−t0)`, `cy = v0 + y·(v1−v0)`.
5. `bone.generator` recebe o nome e a versão do formato de origem.
6. Meta: Spine e DragonBones sem nenhuma ✗ visual; Spriter e Live2D só com as ✗ listadas em 13.5.

### 13.1 Spine (JSON 3.8 a 4.3)

Coordenadas iguais (Y para cima, graus anti-horário, pixels). Sem conversão de eixo.

| Spine | `.bone` | Perda |
|:---|:---|:---:|
| `skeleton.spine` | `bone.generator = "Spine <versão>"` | — |
| `skeleton.hash`, `x`, `y`, `width`, `height`, `fps`, `referenceScale` | `skeleton.*` mesmos nomes | — |
| `skeleton.images`, `skeleton.audio` | `assets.imagesBase`, `assets.audioBase` | — |
| `bones[]` (`name`, `parent`, `length`, `x`, `y`, `rotation`, `scaleX`, `scaleY`, `shearX`, `shearY`, `color`, `icon`, `visible`, `skin`) | `Bone` mesmos nomes; `skin` → `skinRequired`; `color` hex → float; `visible` → `visible` | — |
| `bone.inherit` (`normal`, `onlyTranslation`, `noRotationOrReflection`, `noScale`, `noScaleOrReflection`) | `inheritRotation/Scale/Reflection` = (t,t,t), (f,f,f), (f,t,f), (t,f,t), (t,f,f) | — |
| Osso `skin: true` fora da skin ativa | Spine não atualiza o osso; `.bone` calcula sempre (5.6). Invisível se nada desenha nele. | ≈ |
| `slots[]` (`name`, `bone`, `attachment`, `color` hex RGBA, `dark` hex RGB, `blend`, `visible`) | `Slot`; hex → floats; `dark` → `darkColor` | — |
| Ordem de `slots` | ordem de `slots` | — |
| Toda constraint: `order`, `skin` | `order` → posição em `constraints` (ordenado por `order` entre todos os tipos, empate pela ordem ik, transform, path, physics); `skin` → `skinRequired` | — |
| `ik[]` (`bones`, `target`, `bendPositive`, `compress`, `stretch`, `uniform`, `softness`, `mix`) | `constraint "ik"` mesmos nomes | — |
| `transform[]` (`bones`, `target`, `local`, `relative`, `mixRotate`, `mixX`…, `rotation`, `x`, `y`, `scaleX`, `scaleY`, `shearY`) | `"transform"`; `mixRotate` → `mixRotation`; `rotation` → `offsetRotation`, `x` → `offsetX`, `y` → `offsetY`, `scaleX` → `offsetScaleX`, `scaleY` → `offsetScaleY`, `shearY` → `offsetShearY` | — |
| `transform` 4.3 com mapeamento de propriedades (campos conforme `SkeletonJson` do spine-runtimes 4.3; nomes a confirmar antes da 1.0) | `parameter` com `source` (`from/to` = faixa de origem) + `driver` modo alvos com duas chaves (`input` = `min`/`max`, `value` = faixa de destino). Mapeamento linear com clamp: exato. | — |
| `path[]` (`bones`, `target`, `positionMode`, `spacingMode`, `rotateMode`, `rotation`, `position`, `spacing`, `mixRotate`, `mixX`, `mixY`) | `"path"`; `rotation` → `offsetRotation`; `mixRotate` → `mixRotation`; `"chain scale"` → `"chainScale"` | — |
| `physics[]` (`bone`, `x`, `y`, `rotate`, `scaleX`, `shearX`, `inertia`, `strength`, `damping`, `mass`, `wind`, `gravity`, `limit`, `fps`, `mix`) | `"physics"`; `rotate` → `rotation`; demais iguais. Algoritmo 6.5 é porte do 4.2. | — |
| `sliders[]` 4.3 (animação como constraint, manual ou por osso; campos conforme `SkeletonJson` 4.3, a confirmar) | `parameter` (+ `source` quando por osso) + `driver` modo contínuo (`animation`, `from`, `to`, `timeFrom`, `timeTo`) | — |
| `skins[]` (`name`, `bones`, `ik`, `transform`, `path`, `physics`, `attachments`, `color`) | `Skin`; `ik`+`transform`+`path`+`physics` → `constraints`; `color` hex → `extras.spine.color` | — |
| Todo attachment: `color` hex; `vertexCount` | `color` → `color` float (7.2); `vertexCount` descartado (é `N`, derivado de `vertices`) | — |
| attachment (todos) `name`, `type` ausente | `type` ausente → `"region"`. `name` não existe no `.bone`: se `path` ausente e `name` ≠ placeholder, gravar `path = name`; se `name` == placeholder, omitir `path`. Guardar `name` original em `extras.spine.name` quando diferir. | — |
| attachment `region` (`path`, `x`, `y`, `scaleX`, `scaleY`, `rotation`, `width`, `height`, `color`, `sequence`) | `region` mesmos nomes | — |
| attachment `mesh` (`uvs`, `triangles`, `vertices`, `hull`, `edges`, `width`, `height`, `color`, `sequence`) | `mesh`; `vertices` com pesos (`n, (bone, x, y, w)…`) → `binding` SoA (mesmos números, reorganizados); sem pesos → `vertices` | — |
| attachment `linkedmesh` (`path`, `skin`, `parent`, `timelines`, `width`, `height`) | `linkedmesh`; `timelines` → `inheritDeform` | — |
| attachment `boundingbox` (`vertexCount`, `vertices`) | `boundingbox` `shape: polygon` (pesos idem mesh) | — |
| attachment `clipping` (`end`, `vertexCount`, `vertices`) | `clipping` com `end` | — |
| attachment `path` (`closed`, `constantSpeed`, `lengths`, `vertexCount`, `vertices`) | `path`; mesma ordem `in, âncora, out` por âncora | — |
| attachment `point` (`x`, `y`, `rotation`) | `point` | — |
| `sequence` (`count`, `start`, `digits`, `setup`) | `Sequence` mesmos nomes | — |
| `events{}` (`int`, `float`, `string`, `audio`, `volume`, `balance`) | `EventDef` | — |
| animação `bones.<b>.rotate` (`value`) | timeline `bone/rotation` | — |
| `translate` (`x`, `y`, curva de 8 números) | duas timelines `bone/x` e `bone/y`, mesma lista de tempos, curva 4+4 | — |
| `translatex`, `translatey`, `scalex`, `scaley`, `shearx`, `sheary` | `bone/x`, `bone/y`, `bone/scaleX` … | — |
| `scale`, `shear` | duas timelines cada | — |
| `inherit` (string) | três timelines booleanas stepped | — |
| `slots.<s>.attachment` (`name`) | `slot/attachment` | — |
| `rgba` (`color` hex) | `slot/color` | — |
| `rgb` sozinha / `alpha` sozinha | `slot/color` com o canal ausente preenchido pelo setup em toda chave | — |
| `rgb` + `alpha` na mesma animação com tempos diferentes | `slot/color` com a união dos tempos; curvas reamostradas nos tempos novos | ≈ |
| `rgba2` (`light`, `dark`) / `rgb2` | `slot/color` + `slot/darkColor` | — |
| `attachments.<skin>.<slot>.<att>.deform` (`offset`, `vertices`, `curve`) | `deform` com `skin`, `attachment`, `offset` | — |
| `attachments…sequence` (`mode`, `index`, `delay`) | `sequence`; modos iguais | — |
| `drawOrder` (`offsets: [{slot, offset}]`) | `drawOrder` idêntico | — |
| `events` (`name`, `int`, `float`, `string`, `volume`, `balance`) | `event` (`name` → `event`) | — |
| `ik.<c>`, `transform.<c>`, `path.<c>`, `physics.<c>` (inclui `reset`) | `constraint` por propriedade (uma timeline cada); `mixRotate` → `mixRotation` | — |
| `physics.""` (nome vazio = todas as physics constraints, 4.2) | Uma timeline `constraint` por physics constraint do esqueleto, mesmas chaves, mesmo `property` (`reset` ou numérica). | — |
| Curva `"stepped"` / ausente / `[cx1, cy1, cx2, cy2]` absoluta | `"stepped"` / `"linear"` / array idêntico | — |
| Timeline que não começa em `t = 0` | Inserir chave em `0` com o valor de setup, `curve: "stepped"` até a primeira chave original (9.10) | — |
| Atlas `.atlas` (texto): `xy`, `size`, `orig`, `offset`, `index`, `pma`, `filter`, `repeat` | Copia direto: `x/y`, `width/height`, `originalWidth/Height`, `offsetX/Y` (já são da esquerda e de baixo), `page.premultiplied`, `minFilter/magFilter`, `wrapU/V` | — |
| Atlas `.atlas` (texto): `rotate: 90` | **Não copie o campo.** O `rotate: 90` do Spine é **anti-horário**; o `rotation: 90` de 10.4 é **horário**. As duas convenções estão a 180° uma da outra, e copiar o valor dá desenho de cabeça para baixo. Grave `rotation: 90` **e** espelhe o corte — `offsetX' = originalWidth − offsetX − width`, `offsetY' = originalHeight − offsetY − height` — depois compense o espelho no attachment: `region.rotation += 180`, e `mesh.uvs` espelhados. Ver nota abaixo. | — |
| `mesh.uvs` do Spine (relativos ao **recorte** empacotado) | `mesh.uvs` de 7.3 (relativos à **imagem original**). Converter com os `offset`/`orig` da região: `u0 = (offsetX + u·width) / originalWidth`, e o mesmo em V contando de cima. **Só é possível com o `.atlas` em mãos**; sem ele, avisar e deixar os uvs como vieram | uvs errados quando o `.atlas` não vem junto |
| Binário `.skel` | Converter via JSON do mesmo Spine (o `.skel` exige a versão exata) | — |
| Dados "nonessential" (cor de osso, pastas, ícones) | campos informativos + `extras` | — |
| Nomes 3.8: `bone.transform`, `rotateMix`, `translateMix`, `scaleMix`, `shearMix`, `linkedmesh.deform`, timeline `color` com `c2..c4`, `draworder` | `transform` → `inherit`; `rotateMix` → `mixRotation`; `translateMix` → `mixX` = `mixY`; `scaleMix` → `mixScaleX` = `mixScaleY`; `shearMix` → `mixShearY`; `deform` → `inheritDeform`; curva `[curve, c2, c3, c4]` normalizada → absoluta (regra 4) e repetida por componente; `draworder` = `drawOrder` | — |

**Nota sobre a rotação do atlas.** A documentação do Spine diz que uma região
com `rotate: 90` foi guardada na página girada 90° **no sentido anti-horário**.
A §10.4 define `rotation: 90` como girada 90° **no sentido horário** — a própria
seção confere isso: o canto superior esquerdo do recorte cai no canto superior
**direito** do retângulo na página. Um importador que copiasse o campo entregaria
todo desenho girado de cabeça para baixo.

A conversão de duas partes acima é exata. Girar a região 180° é o mesmo que
espelhá-la nos dois eixos, e espelhar o corte (`offsetX`, `offsetY`) faz a
fórmula de 10.4 cair no mesmo pixel da página que o Spine leria; os 180°
somados ao `region.rotation` do attachment devolvem o desenho à posição certa
na tela. O `spine-atlas.ts` do importador faz isso, e o teste "converte a
rotação anti-horária do Spine para a convenção da seção 10.4" confere pixel a
pixel.

### 13.2 DragonBones (JSON 5.5)

Coordenadas: Y para **baixo**, graus **horário**. Converter: `y → −y`, ângulo → `−ângulo`. Tempo em frames: `t = frame / frameRate`.

| DragonBones | `.bone` | Perda |
|:---|:---|:---:|
| raiz `name`, `version`, `compatibleVersion`, `frameRate`, `userData` | `skeleton.name`, `bone.generator = "DragonBones <version>"`, `skeleton.fps`, `extras` | — |
| `armature[]` (várias) | Um `.bone` por armature; o conjunto vai num `.bonez`. A primeira é `main`; `manifest.skeletons` lista todas. | — |
| `armature.aabb`, `canvas`, `defaultActions` | `skeleton.x/y/width/height`, `extras.dragonbones.canvas`, `extras.dragonbones.defaultActions` (runtime não executa) | — |
| `bone` (`name`, `parent`, `length`, `transform.x/y/skX/skY/scX/scY`, `inheritRotation/Scale/Reflection`) | `Bone`: `x`, `y → −y`, `rotation = −skX`, `shearY = −(skY − skX)`, `scaleX = scX`, `scaleY = scY`, `inherit*` | — |
| `bone.inheritTranslation = false` | Osso reparentado para a raiz com transform compensada por chave (bake) | ≈ |
| `slot` (`name`, `parent`, `displayIndex`, `blendMode`, `color` {aM,rM,gM,bM}, `zOrder`) | `Slot`: `bone`, `attachment` = display[displayIndex], `blend` (`normal`, `add` → `additive`, `multiply`, `screen`; outros → `normal` + aviso), `color = [rM, gM, bM, aM] / 100`, posição em `slots` por `zOrder` | — |
| `slot.color` offsets `aO rO gO bO` | `extras.dragonbones.colorOffset` | ✗ (visual, raro) |
| `skin[].slot[].display[]` | `Skin.attachments[slot][display.name]` | — |
| display `image` (`name`, `path`, `transform`, `pivot`) | `region`; `pivot` (0..1) → deslocamento `x/y` do centro; `transform` convertido | — |
| display `mesh` (`vertices`, `uvs`, `triangles`, `weights` [n, bone, w…], `bonePose`, `slotPose`, `edges`, `userEdges`) | `mesh`; `binding` calculado: posição por influência = `inv(bonePose[b]) × slotPose × v`; `edges` + `userEdges` → `edges`; `hull` calculado | — |
| display `mesh` com `share`, `inheritDeform` | `linkedmesh` com `parent`, `inheritDeform` | — |
| display `boundingBox` (`subType` rectangle/ellipse/polygon, `width`, `height`, `vertices`) | `boundingbox` com `shape` correspondente | — |
| display `armature` (`name`, `path`, `actions`, `inheritAnimation`) | `skeleton` aninhado com `uri` para o `.bone` da armature filha; `actions` → `animation` inicial | — |
| `ik[]` (`name`, `target`, `bone`, `chain`, `bendPositive`, `weight`) | `"ik"`: `bones` = [pai, bone] se `chain 1`, [bone] se `chain 0`; `mix = weight`; `bendPositive` invertido (eixo) | — |
| `path` constraint 5.5 (`positionMode`, `spacingMode`, `rotateMode`, `position`, `spacing`, `rotateOffset`, `rotateMix`, `translateMix`) | `"path"`: `rotateOffset → offsetRotation`, `rotateMix → mixRotation`, `translateMix → mixX = mixY` | — |
| `animation[]` (`name`, `duration` frames, `playTimes`, `fadeInTime`, `scale`) | `Animation`; `duration / frameRate`; `playTimes 0` → `loop true` (+ `extras.dragonbones.playTimes`); `fadeInTime` → `defaultMix`; `scale` → `extras` | — |
| `bone[].translateFrame` (`x`, `y`) | `bone/x`, `bone/y` (`y` negado) | — |
| `rotateFrame` (`rotate`, `clockwise`) | `bone/rotation` negado; `clockwise` → desenrolar ângulos (somar `±360 × clockwise`) | — |
| `scaleFrame` (`x`, `y`) | `bone/scaleX`, `bone/scaleY` | — |
| `slot[].displayFrame` (`value`) | `slot/attachment` (índice → nome) | — |
| `colorFrame` (`value` {aM…}) | `slot/color`; offsets ✗ (acima) | ≈ |
| `zOrderFrame` (`zOrder` [slotIndex, offset…]) | `drawOrder` | — |
| `ffd` (`skin`, `slot`, `name`, `offset`, `vertices`) | `deform` com `skin`, `attachment`, `offset` (deltas convertidos para o espaço de cada influência) | — |
| `ik[].frame` (`bendPositive`, `weight`) | `constraint/bendPositive`, `constraint/mix` | — |
| `frame[]` de armature com `events`/`actions`/`sounds` (`name`, `bone`, `slot`, `ints`, `floats`, `strings`) | `event`; um `EventDef` por nome; `ints[0]`, `floats[0]`, `strings[0]`; o resto em `extras`; `sounds` → `audio` | ≈ |
| `tweenEasing` `0` / `null`,`NaN` / outro | `"linear"` / `"stepped"` / Bézier aproximando a curva de easing (exato nas chaves, < 1% entre) | ≈ |
| `curve [x1, y1, x2, y2]` normalizado | absoluto (regra 4) | — |
| `curve` com mais de 4 números (vários segmentos) | Dividir em chaves intermediárias | ≈ |
| Atlas JSON (`imagePath`, `width`, `height`, `SubTexture[]` {`name`, `x`, `y`, `width`, `height`, `rotated`, `frameX`, `frameY`, `frameWidth`, `frameHeight`}) | `Page.image`, `Region`: `rotation = rotated ? 90 : 0`; `offsetX = −frameX`; `offsetY = frameHeight − height + frameY`; `originalWidth = frameWidth` | — |
| Binário `.dbbin` | Converter pelo runtime DragonBones para JSON antes | — |

### 13.3 Spriter (SCML / SCON)

Coordenadas: Y para **cima**, graus anti-horário. Tempo em **ms**. Pivô por imagem. Hierarquia e ordem definidos **por chave** na `mainline`.

| Spriter | `.bone` | Perda |
|:---|:---|:---:|
| `spriter_data` (`scml_version`, `generator`, `generator_version`) | `bone.generator = "Spriter <versão>"` | — |
| `folder/file` (`name`, `width`, `height`, `pivot_x`, `pivot_y`) | Regiões do atlas (ou `imagesBase`); pivô (0..1) vira `x/y` do `region`: `((0.5 − px)·w, (0.5 − py)·h)` | — |
| `entity[]` (várias) | Um **corpo** (`.bone`) por entity; o SCML inteiro vira um **projeto** (`.bonez`, 2.9) | — |
| `obj_info` `bone` (`name`, `w`, `h`) | `Bone`; `length = w`; `h` em `extras.spriter.h` | — |
| `obj_info` `sprite` | Osso auxiliar (filho do osso pai do sprite) + `Slot` + `region` por arquivo na skin `default`. O sprite do Spriter tem transform própria por chave; ela vai para o osso auxiliar. | — |
| `obj_info` `box` (`w`, `h`, pivô) | `boundingbox` `shape: rectangle` num osso auxiliar | — |
| `obj_info` `point` | `point` num osso auxiliar | — |
| `obj_info` `sound` | `EventDef` com `audio` | — |
| `obj_info` `entity` (sub-entidade) | `skeleton` aninhado (`uri` para o `.bone` da entity), num slot do osso pai da sub-entidade, com `x, y, rotation, scaleX, scaleY` da chave (a entidade segue a imagem, 7.11); timeline `nested/animation` e `nested/time` (com curva = scrub). A sub-entidade que toca a animação de mesmo nome do pai vira `inheritAnimation: true`. O manual 1.4 do Spriter não documenta sub-entidades; o mapeamento vem do SCML | ≈ |
| `character_map[]` (`map`: `folder/file` → `target_folder/target_file` ou nada) | Uma `Skin` por character map; mapeado → outro `path`; sem alvo → `null` (esconde) | — |
| `variable[]` de entidade e de objeto (`type`, `default`) | `Variable` (`"<objeto>.<nome>"` para os de objeto) | — |
| `tag_list` | raiz `tags` | — |
| `animation` (`length` ms, `looping`, `interval`) | `Animation`; `duration = length / 1000`; `loop`; `fps = 1000 / interval` | — |
| `mainline.key` (`time`, `bone_ref` {`parent`, `timeline`, `key`}, `object_ref` {`parent`, `timeline`, `key`, `z_index`}) | Hierarquia: o pai **mais frequente** vira `bone.parent` do arquivo; toda chave da mainline cujo `bone_ref.parent` é outro grava uma chave `bone/parent` (9.4) naquele tempo, e `null` quando volta ao pai do arquivo. Os locais do Spriter já são medidos do pai daquela chave, então nada é convertido. Um `object_ref.parent` (o osso de um **sprite**) que muda entre chaves grava uma chave `slot/bone` (9.5) naquele tempo, com o `x, y, angle, scale` da chave no `transform`. `--assar` mantém a conversão antiga nos dois casos | — |
| `z_index` por chave | `drawOrder` stepped em cada chave da mainline | — |
| `timeline.key` (`time`, `spin`, `curve_type`, `c1..c4`) + `bone` (`x`, `y`, `angle`, `scale_x`, `scale_y`) | `bone/x`, `bone/y`, `bone/rotation`, `bone/scaleX`, `bone/scaleY`; `spin` (−1, 0, 1) → desenrolar ângulos (somar ±360) | — |
| `object` (`x`, `y`, `angle`, `scale_x`, `scale_y`, `a`, `folder`, `file`) | `bone/*` no osso auxiliar; `a` → `slot/color` (alpha); `file` → `slot/attachment` | — |
| `object.pivot_x/y` variando entre chaves | Região fixa no pivô da primeira chave; diferença convertida em `bone/x,y` compensado no osso auxiliar. Exato nas chaves. | ≈ |
| `curve_type` `instant` / `linear` | `"stepped"` / `"linear"` | — |
| `curve_type` `bezier` (`c1..c4`, normalizado) | Bézier absoluta (regra 4) | — |
| `curve_type` `quadratic` (`c1`) | Bézier cúbica por elevação de grau: exata | — |
| `curve_type` `cubic` (`c1`, `c2`) | `cx1 = t0 + (t1−t0)/3`, `cy1 = v0 + c1·(v1−v0)`, `cx2 = t0 + 2(t1−t0)/3`, `cy2 = v0 + c2·(v1−v0)` | — |
| `curve_type` `quartic` / `quintic` (`c1..c4`) | Subdividido em 4 trechos Bézier cúbicos com chaves extras (< 0.2 % de erro) | ≈ |
| `eventline` | `event` | — |
| `soundline` (`file`, `volume`, `panning`) | `event` com `EventDef.audio`; `volume`; `balance = panning` | — |
| `meta.varline` (`def`, `key.val`) | `variable` timeline | — |
| `meta.tagline` (`key.tag[]`) | `tag` timeline | — |
| Sem mesh, sem pesos, IK só de editor | Nada a converter | — |

### 13.4 Live2D Cubism (`.model3.json` e satélites)

O `.moc3` é binário fechado. A conversão parte do que o Cubism Core expõe (drawables, parâmetros, keyforms) ou do `.cmo3` via ferramenta do editor. Coordenadas: Y para cima; converter para pixels com `canvasWidth × pixelsPerUnit`.

| Live2D | `.bone` | Perda |
|:---|:---|:---:|
| `model3.json` (`FileReferences.Moc`, `Textures`, `Physics`, `Motions`, `Expressions`, `Pose`) | `bone.generator`, `assets.atlases` (uma página por textura), animações, `extras.live2d` | — |
| Model (`canvasWidth`, `canvasHeight`, `pixelsPerUnit`) | `skeleton.width/height`; fator de escala global | — |
| Parameter (`Id`, `Min`, `Max`, `Default`, `Repeat`) | `Parameter` mesmos campos | — |
| `cdi3.json` (nomes e grupos) | `displayName`, `group` | — |
| Part (`id`, `opacity`, hierarquia) | `slot.folder = "<part>"`; opacidade do Part multiplica o alpha de cada slot filho (setup e chaves) | — |
| Rotation deformer (posição, ângulo, escala, pai) | `Bone` | — |
| Warp deformer (grade Bézier) | ✗ como objeto (extensão `BONE_warp_deformer`). O efeito é **assado**: cada keyform do warp vira `deform` dos meshes filhos, por parâmetro (driver alvo `deform`). Visual: sem perda. | ≈ |
| ArtMesh / Drawable (`vertices`, `uvs`, `indices`, `texture`, `blendMode`, `opacity`, `drawOrder`, `parent` deformer) | `Slot` (no osso do deformer-pai ou raiz) + `mesh` (sem pesos); `blend` (`Normal`/`Additive`/`Multiplicative` → `normal`/`additive`/`multiply`); opacidade → `slot.color.a`; ordem por `renderOrder` | — |
| `Drawable.masks[]`, `isInvertedMask` | Um `clipping` por drawable-máscara com o hull da ArtMesh, `slots` = lista dos mascarados, `invert`; máscara pelo alpha → extensão `BONE_clip_alpha` | ≈ |
| Keyform 1-D (valores do objeto em pontos do parâmetro) | `driver` modo alvos, `mode: "replace"`, uma `DriverKey` por keyform; bone → `x/y/rotation/scaleX/scaleY`; mesh → `deform`; opacidade → `slot/color` | — |
| Keyform 2-D a 4-D (grade) | Extensão `BONE_param_grid`. Sem ela: drivers 1-D aditivos ao longo dos eixos que passam pelo default; perde os cantos. | ✗ |
| Ordem de desenho dirigida por parâmetro | `driver` alvo `drawOrder` (stepped no keyform mais próximo; Live2D interpola o número de ordem) | ≈ |
| Blend Shape (parâmetro aditivo com limite) | `Morph` (`min`, `max`) + `driver` alvo `morph/weight` com `mode: "add"` | — |
| `motion3.json` (`Curves[]` {`Target` Parameter/PartOpacity/Model, `Id`, `Segments` linear/bezier/stepped/inverse-stepped}, `Meta.Duration`, `Loop`, `Fps`, `FadeInTime`, `UserData`) | `Animation`; `Parameter` → `parameter/value`; `PartOpacity` → `slot/color` dos slots do part; Bézier já é absoluta → cópia; `inverse-stepped` → `"stepped"` deslocada para o fim do segmento; `loop`; `defaultMix = FadeInTime`; `UserData` → `event` | — |
| `exp3.json` (`Parameters[]` {`Id`, `Value`, `Blend` Add/Multiply/Overwrite}, `FadeInTime`) | `Animation` de `duration 0` com uma chave `parameter` por entrada; `blend` = `add`/`multiply`/`replace`; `defaultMix`; `tags: ["expression"]` | — |
| `physics3.json` (`PhysicsSettings[]`: `Input`, `Output`, `Vertices`, `Normalization`; `Meta.Gravity/Wind/Fps`) | Extensão `BONE_pendulum`. Sem ela: cadeia de ossos por pêndulo + `physics` aproximada + `parameter` com `source` no osso; original em `extras.live2d.physics`. | ✗ |
| `pose3.json` (grupos de Parts exclusivos, `Link`) | Uma `Skin` por opção de cada grupo (Part visível = attachments presentes; os outros `null`); `Link` → `includes` | — |
| `userdata3.json` | `extras` no slot/attachment | — |
| `motionsync3.json`, lip sync | Extensão `BONE_lipsync`; até lá, `extras` | ✗ |
| Glue | ✗ (aviso; original em `extras`) | ✗ |
| Grupos `EyeBlink`, `LipSync` do model3 | `extras.live2d.groups`; o jogo escreve nos parâmetros | — |
| Texturas (`textures[]`) | Atlas: uma página por textura, uma região por drawable (`uvs` já são da página; região = página inteira) | — |

### 13.5 Resumo das perdas conhecidas

| Origem | O que | Tamanho |
|:---|:---|:---|
| Spine | `rgb` + `alpha` com tempos diferentes | curvas reamostradas; exato nas chaves |
| Spine | osso de skin fora da skin ativa | calculado em vez de congelado; invisível no rig normal |
| DragonBones | offset aditivo de cor (`aO rO gO bO`) | visual, raro; guardado em `extras` |
| DragonBones | easing por número (`tweenEasing ≠ 0`) | < 1 % entre chaves |
| DragonBones | `inheritTranslation: false` | bake exato nas chaves |
| Spriter | pai que muda por chave | bake exato nas chaves da mainline |
| Spriter | pivô animado | exato nas chaves; entre chaves, erro ≤ deslocamento interpolado do pivô |
| Spriter | `quartic` / `quintic` | < 0.2 % entre chaves |
| Live2D | warp deformer como objeto editável | só edição, não visual |
| Live2D | keyform 2-D a 4-D | núcleo perde os cantos; `BONE_param_grid` recupera |
| Live2D | `physics3.json` | núcleo aproxima; `BONE_pendulum` recupera |
| Live2D | draw order por parâmetro | ponto de troca aproximado |
| Live2D | glue, motionsync | guardado, não interpretado |

Creature fica fora desta tabela: malhas e pesos convertem como o DragonBones; motores procedurais convertem só **assados** em chaves (`extras.creature.motor` guarda o original) até a extensão `BONE_motors`.

---

## 14. Exemplo JSON completo e pequeno

Um personagem: 3 ossos (`root`, `arm`, `target`), 2 slots (`body` com `region`, `arm` com `mesh` ponderado), 1 IK de 1 osso, 1 skin extra (`armadura`), 1 evento com áudio, 1 animação (`acenar`). O atlas é o de 10.6.

### 14.1 `boneco.bone`

```json
{
  "bone": {
    "version": "1.0",
    "minVersion": "1.0",
    "generator": "Recorte 0.1.0",
    "id": "8f1d2c3a-5b6e-4a7f-9c0d-1e2f3a4b5c6d",
    "created": "2026-09-06T10:00:00Z",
    "license": "CC0-1.0"
  },
  "extensionsUsed": ["ACME_notes"],
  "skeleton": { "name": "boneco", "x": -40, "y": 0, "width": 120, "height": 160, "fps": 30 },
  "assets": { "atlases": ["boneco.atlas.json"], "audioBase": "audio/" },
  "bones": [
    { "name": "root" },
    { "name": "arm", "parent": "root", "x": 0, "y": 40, "length": 60, "color": [1, 0.5, 0, 1] },
    { "name": "target", "parent": "root", "x": 60, "y": 40, "icon": "ik" }
  ],
  "slots": [
    { "name": "body", "bone": "root", "attachment": "body" },
    { "name": "arm", "bone": "arm", "attachment": "arm" }
  ],
  "constraints": [
    { "type": "ik", "name": "ik_arm", "bones": ["arm"], "target": "target", "mix": 1 }
  ],
  "skins": [
    {
      "name": "default",
      "attachments": {
        "body": {
          "body": { "type": "region", "path": "corpo", "x": 0, "y": 60, "width": 80, "height": 120 }
        },
        "arm": {
          "arm": {
            "type": "mesh",
            "path": "braco",
            "width": 60, "height": 20,
            "binding": {
              "counts":    [2, 1, 1, 2],
              "bones":     [0, 1, 1, 1, 0, 1],
              "positions": [0, 30, 0, -10,   60, -10,   60, 10,   0, 50, 0, 10],
              "weights":   [0.5, 0.5, 1, 1, 0.5, 0.5]
            },
            "uvs": [0, 1, 1, 1, 1, 0, 0, 0],
            "triangles": [0, 1, 2, 0, 2, 3],
            "hull": 4,
            "edges": [0, 1, 1, 2, 2, 3, 3, 0]
          }
        }
      }
    },
    {
      "name": "armadura",
      "attachments": {
        "body": {
          "body": { "type": "region", "path": "armadura/corpo", "x": 0, "y": 60, "width": 80, "height": 120 }
        }
      },
      "extras": { "autor": "Humberto" }
    }
  ],
  "events": [
    { "name": "passo", "int": 1, "audio": "passo.ogg", "volume": 0.8 }
  ],
  "tags": ["idle"],
  "animations": [
    {
      "name": "acenar",
      "duration": 1.0,
      "loop": true,
      "tags": ["idle"],
      "timelines": [
        { "type": "bone", "target": "target", "property": "y",
          "keys": [
            { "time": 0,   "value": 40, "curve": [0.15, 40, 0.35, 80] },
            { "time": 0.5, "value": 80, "curve": [0.65, 80, 0.85, 40] },
            { "time": 1.0, "value": 40 }
          ] },
        { "type": "bone", "target": "target", "property": "x",
          "keys": [
            { "time": 0,   "value": 60 },
            { "time": 0.5, "value": 40 },
            { "time": 1.0, "value": 60 }
          ] },
        { "type": "slot", "target": "arm", "property": "color",
          "keys": [
            { "time": 0,   "value": [1, 1, 1, 1] },
            { "time": 0.5, "value": [1, 0.8, 0.8, 1] },
            { "time": 1.0, "value": [1, 1, 1, 1] }
          ] },
        { "type": "deform", "target": "arm", "attachment": "arm",
          "keys": [
            { "time": 0,   "value": [] },
            { "time": 0.5, "offset": 4, "value": [0, 3, 0, 3] },
            { "time": 1.0, "value": [] }
          ] },
        { "type": "constraint", "target": "ik_arm", "property": "mix",
          "keys": [ { "time": 0, "value": 1 } ] },
        { "type": "event",
          "keys": [ { "time": 0.5, "event": "passo", "int": 2, "volume": 0.5 } ] }
      ]
    }
  ],
  "extensions": { "ACME_notes": { "text": "exemplo da seção 14" } },
  "extras": { "projeto": "especificação 0.1" }
}
```

Leitura do exemplo:

- `binding` do braço: vértice 0 tem 2 influências (`root` em `(0, 30)` com 0.5, `arm` em `(0, −10)` com 0.5); vértices 1 e 2 são só `arm`; vértice 3 espelha o 0.
- A `deform` em `0.5` tem `offset 4`: mexe nos floats 4..7 do array de deform, que são as influências 2 e 3 (vértices 1 e 2, ambos em `arm`). Sobe a ponta do braço 3 px no espaço do osso.
- A animação não toca `arm.rotation`. Quem gira o braço é o IK, seguindo `target`.
- Um leitor sem suporte a `ACME_notes` ignora o objeto e continua.

### 14.2 Pose esperada em `t = 0.5` (o que a suíte compara)

`target` está em `(40, 80)`. O braço nasce em `(0, 40)`: `atan2(40, 40) = 45°`.

```json
{
  "version": "1.0",
  "samples": [
    { "time": 0.5,
      "bones": {
        "root":   { "a": 1, "b": 0, "c": 0, "d": 1, "worldX": 0, "worldY": 0 },
        "arm":    { "a": 0.7071, "b": -0.7071, "c": 0.7071, "d": 0.7071, "worldX": 0, "worldY": 40, "arotation": 45 },
        "target": { "a": 1, "b": 0, "c": 0, "d": 1, "worldX": 40, "worldY": 80 }
      },
      "slots": {
        "body": { "attachment": "body", "color": [1, 1, 1, 1], "visible": true },
        "arm":  { "attachment": "arm",  "color": [1, 0.8, 0.8, 1], "visible": true }
      },
      "drawOrder": ["body", "arm"],
      "vertices": { "arm/arm": [3.536, 31.464, 47.376, 77.477, 33.234, 91.619, -3.536, 48.536] },
      "events": [ { "time": 0.5, "event": "passo", "int": 2, "float": 0, "string": "", "volume": 0.5, "balance": 0 } ],
      "tags": ["idle"]
    }
  ]
}
```

Conferência do vértice 1: local `(60, −10) + deform (0, 3) = (60, −7)`; `x = a·60 + b·(−7) = 42.426 + 4.950 = 47.376`; `y = c·60 + d·(−7) + worldY = 42.426 − 4.950 + 40 = 77.477`.

### 14.3 O mesmo personagem em `.bonez`

```
boneco.bonez
├─ mimetype              (Store)   application/vnd.bone+zip
├─ manifest.json         (Deflate)
├─ boneco.bone           (Deflate)
├─ boneco.atlas.json     (Deflate)
├─ boneco.png            (Store)
└─ audio/passo.ogg       (Store)
```

`manifest.json`:

```json
{
  "bonez": { "version": "1.0" },
  "main": "boneco.bone",
  "atlases": ["boneco.atlas.json"],
  "images": ["boneco.png"],
  "audio": ["audio/passo.ogg"],
  "hashes": { "boneco.bone": "sha256:0000000000000000000000000000000000000000000000000000000000000000" }
}
```

### 14.4 Arquivos de exemplo publicados junto com esta spec

| Arquivo | O que cobre |
|:---|:---|
| `exemplos/minimo.bone` | O menor arquivo válido: cabeçalho, 1 osso, 1 slot, 1 `region`. |
| `exemplos/heroi.bone` | Personagem completo: 11 ossos, 10 slots, os 8 tipos de attachment (region, mesh com pesos, linkedmesh, boundingbox `polygon`, clipping, path, point, esqueleto aninhado), 3 skins (uma com `null`, uma com `includes`), IK de 2 ossos, transform, path, physics, driver, parâmetro, morph, 2 eventos, 3 animações com os 12 tipos de timeline, sequência com `frames`, variáveis, tags, extensão de marca, extras. O attachment `sword` aponta para `espada.bone`, ausente de propósito: testa a regra 2.8 de arquivo faltando. |
| `exemplos/heroi.atlas.json` | Atlas do herói, com região girada e região com corte. |
| `exemplos/espada.bone` | A **entidade** do herói e do mecha: dois ossos, dois slots, animações `idle`, `brilho` e `attack`. Sem socket, sem `rig`: quem a pendura diz onde. |
| `exemplos/mecha.bone` | O corpo que pendura a espada **pela imagem**: o slot `weapon` mostra o anexo `skeleton` com `x, y, rotation` no osso `hand`, com `inheritAnimation` e `baseAnimation`; puxa animações e pele de fora por `assets.animations` e `assets.skins`. |
| `exemplos/mecha-animacoes.bone` | Arquivo **só de animações**: um osso raiz, `rig` com os ossos exigidos, `walk`, `attack` e `falar`. |
| `exemplos/mecha-pele-inverno.bone` | **Pele de fora**: um osso raiz, `rig` com os slots que preenche, a pele `inverno` com atlas próprio. Ela também **troca a cabeça por um esqueleto animado**: o slot `head` recebe um anexo `skeleton` que aponta para `capacete.bone`, posto pela imagem (`x: 20`). |
| `exemplos/capacete.bone` | Um **capacete** com esqueleto e animações próprias, que entra no slot `head` de qualquer corpo pela pele. Prova que 7.11 não é só para arma. |
| `rigs/lobisomem-rabo.bone` | **Pele de fora com osso** (2.8, F23): traz os ossos `rabo` e `rabo_ponta` (`skinRequired`) pendurados em `quadril`, os dois slots e a pele `lobisomem`. Obedece ao `rig` `humanoide-v1`. O validador do 0.2 (degrau 1, 17/09) a aceita: um `parent` vindo do `rig` conta como existente (4.8). |
| `rigs/humanoide-v1.bone` | **A convenção de nomes** do projeto (4.8, 10 do ARQUITETO 3): um corpo sem arte, com os ossos, os comprimentos e os slots reservados. Quem grava com esses nomes troca animação e pele com todo mundo. Nomes em português, com o par `_e` / `_d`. |

---

## Apêndice A — Decisões desta versão

| # | Decisão | Origem |
|:---:|:---|:---|
| 1 | Um esqueleto por arquivo. Vários personagens = `.bonez` com `manifest.skeletons`. Aninhado por `uri`. | C |
| 2 | Referência por nome no JSON; índice só em `binding.bones` e no binário. | B, C |
| 3 | Herança em três booleanos. Cinco combinações do Spine com a fórmula do A. Três reservadas com fallback (L1 na 1.0) — fechadas pela decisão 70. | A, B, C, juízes |
| 4 | Pose local / aplicada / mundo. Constraints só na aplicada. Algoritmo de referência + regra de sujeira. | A |
| 5 | IK 1 e 2 ossos, transform (4 modos), path e physics: porte fiel do Spine 4.2, inclusive o ramo de escala não uniforme do IK2. Nenhum "versão futura pode mudar". | A, juízes |
| 6 | Pesos numa só representação: `binding` SoA no espaço do osso, sem renormalizar, mínimo 16 influências garantidas. | A, C |
| 7 | Timelines numa só forma canônica (um escalar por timeline; `color` e `darkColor` multi-componente). Bézier absoluta com `t0 ≤ cx1 ≤ cx2 ≤ t1`. Antes da primeira chave = primeira chave. | C, A |
| 8 | `drawOrder` por offsets com algoritmo escrito. Eventos com mesmo `time` permitidos. `slot.visible` e `inherit*` animáveis. | C, B |
| 9 | Parâmetro com `source` e `repeat`; driver como constraint no array ordenado, com modo alvos (keyforms 1-D) e modo contínuo (Sliders/Smart Bones). Grade, pêndulo e IK de N ossos em extensões `BONE_*` publicadas junto com a 1.0. | A, B, juízes |
| 10 | Morph como objeto raiz com `targets` em várias meshes. | C |
| 11 | Skins com `includes` e `null` para esconder. Clipping com `end`, `slots[]` e `invert`. `boundingbox` com `shape`. `sequence` com `frames` explícito opcional. | B, C |
| 12 | Atlas: offsets da esquerda e de baixo (como o Spine); UV de mesh na imagem original; função única de UV para a página (10.4). | A, C |
| 13 | Binário auto-descritivo (árvore + STRS + BLOB + INDX) com blocos canônicos SoA `TKEY` e `BIND`. Sem layout fixo por registro. Sem deflate interno. | C, A |
| 14 | Compatibilidade: tabela de fallback para todo valor desconhecido; round-trip; `minVersion` por `x-since`; casos X obrigatórios em todo nível. | C |
| 15 | Conformidade por pose dump (matriz de mundo + pose aplicada) gerado por dois caminhos; PNG só na categoria opcional R com rasterizador de referência definido. | C, A |
| 16 | Limites, segurança e governança escritos. Spec CC-BY 4.0; ferramentas Apache 2.0. | C |
| 17 | Ambiguidades fechadas: sequência antes da primeira chave = `setup`; clipping novo substitui o anterior; ossos de skin sempre calculados; `mode: "add"` do driver soma o desvio em relação ao setup. | juízes |
| 18 | Pseudocódigo da spec é normativo; o Spine 4.2 é só origem (6.1, regra 7). | crítica |
| 19 | `physics`: estado guarda `tx ty` da ponta após a física; `a` recarregado de `remaining` no laço de rotação; `scaleOffset` também no ramo sem rotação; `remaining = 0` no reset; `lastTime = now` no primeiro quadro (6.5). | crítica |
| 20 | `path`: no modo `chain` a correção da ponta vai para `bx/by` (origem do próximo osso); `proportional` usa `m = n` em `tangent` e `n + 1` nos outros modos (6.4). | crítica |
| 21 | `transform` mundo/relativo soma `localToWorld(alvo, offset)` inteiro, como o Spine; local/absoluto não faz wrap na rotação (6.3). | crítica |
| 22 | `sequence`: modos reversos começam no último frame e `index` é deslocamento, igual ao Spine (9.6). | crítica |
| 23 | Nenhuma constraint, nem `driver`, escreve na pose local; `driver` com alvo osso escreve na aplicada (5.2, 8.2). | crítica |
| 24 | uri: regras aplicadas depois de decodificar; `:` inválido em qualquer posição; `attachment.path`, `sequence.frames[]` e nomes gerados obedecem às regras de uri quando viram nome de arquivo (2.8, 7.2, 12.6). Junção `base + nome` insere `/`. | crítica |
| 25 | `.bonez`: nomes de entrada na forma decodificada NFC; entradas fora das listas do manifesto são resolvidas mesmo assim (L2); nome repetido é L1; `mimetype` sem extra field e sem data descriptor (2.9). | crítica |
| 26 | `.boneb`: alinhamento contado do início do bloco; raiz de `TREE` é `0x08`; conferências de `elemCount`, `STRS.offsets`, `blob ref`; `layoutVersion` maior recusa; `JSON` divergente perde para `TREE`; `TKEY`/`BIND` obrigatórios só sem `extras`/`extensions`; `null` de darkColor = qualquer NaN (11.3–11.6). | crítica |
| 27 | `drawOrder`: slot inexistente ignorado, índice clampado, última entrada vence na colisão (9.5). | crítica |
| 28 | Guardas de determinante em `worldToLocal` e `appliedFromWorld`; NaN/Infinity viram `0` antes de entrar na pose (5.5, 3.6). | crítica |
| 29 | Pose dump grava ângulos reduzidos e compara por distância circular; a pose aplicada guarda o valor cru (12.4, 3.1). | crítica |
| 30 | Clamp de curva: `cx1` primeiro, depois `cx2`; `cy` nunca limitado; `deform` aceita overshoot; `DriverKey` com a mesma regra (9.3, 9.6, 8.2). | crítica |
| 31 | Osso órfão vira filho de `bones[0]`; ossos nunca são removidos nem reordenados; slot órfão vai para `bones[0]`; constraint quebrada é ignorada inteira (4.7). | crítica |
| 32 | `x-enum-since` nos enums; `version` nunca menor que `minVersion` calculado; fallbacks para `driver.mode`, `animation.blend`, `manifest.bonez.version`, `layoutVersion` (2.5, 2.6, 12.7). | crítica |
| 33 | Violação de `enum`/`minimum`/`maximum` no schema é L1 (`RANGE_SCHEMA`), não L0; enum desconhecido é L1 no mesmo minor e L2 em minor maior (12.3, 12.7). | crítica |
| 34 | `light` e `dark` limitados a `[0, 1]` antes da fórmula de cor; trecho é stepped se qualquer das duas chaves não é interpolável (7.12, 9.10). | crítica |
| 35 | `name` comparado por code points sem normalizar; fora de NFC é L1 `NAME_NOT_NFC`. Limites de `name` e uri em code points (2.1, 2.8, 12.6). | crítica |
| 36 | Esqueleto aninhado: `nested/time` substitui o relógio durante toda a animação; trocar `animation` zera o tempo; raiz do filho usa `sx = sy = 1`; `inheritColor` só o `light` (7.11, 9.9). | crítica |
| 37 | Número fora de float 64 é L0; fora de float 32 é L1 `RANGE_FLOAT32` (2.1, 12.6). | crítica |
| 38 | `deform` expandido ao carregar para o layout de 7.4 (9.6, 9.10). Fórmula de `repeat` escrita; `driver.to != from` (8.1, 8.2). | crítica |
| 39 | Schema: chaves não numéricas aceitam qualquer `curve` (validador avisa); `curveName` com `x-fallback`; `DriverKey` validada por tipo de alvo; `x-fallback: "ignore"` em toda `property`; `default` em toda propriedade com padrão; `x-level` nos ramos de timeline; `driverKey` com `extensions`, `x-since`, `x-level`. | crítica |
| 40 | `header.created/modified` são `date-time` (RFC 3339); `format` é L2 no validador (2.3, 12.7). | crítica |
| 41 | 13.1 cobre Spine 3.8 a 4.3: nomes antigos, `name`/`type` ausente de attachment, `physics.""`, `order`/`skin` de toda constraint, `bone.visible`, `skin.color`; campos 4.3 de transform e slider a confirmar (Apêndice B, 9). | crítica |
| 42 | `heroi.bone` exercita os 8 tipos de attachment, 3 skins com `includes`, `sequence.frames`, `softness` e `wind` animados; 14.4 descreve o arquivo real (14.4). | crítica |
| 43 | **A regra de sujeira da 5.6 é normativa, não otimização.** Osso cuja matriz de mundo uma constraint escreveu não é recalculado a partir da pose aplicada; só os descendentes. Recalcular tudo reprova no C-230 por 0,116, com tolerância de 0,0001 (5.6, 12.2). | dois runtimes |
| 44 | **O estado da simulação de física atravessa a setup pose.** A setup pose devolve só os valores animáveis da constraint. `xOffset`, `xVelocity`, `remaining`, `lastTime` e os outros só são zerados por `physicsReset` ou pela timeline `reset` (5.1, 6.5, 9.8). | dois runtimes |
| 45 | **Presença de campo no pose dump é normativa.** A 12.4 passa a listar os cinco campos de `slots`, com `darkColor: null` e `sequenceIndex: -1` sempre presentes, e a dizer que `attachment` é `null` quando o placeholder não resolve. Sem isso, dois runtimes divergem em 10 de 39 casos sem nenhum deles falhar, porque o harness só compara o que o esperado cita (12.4). | dois runtimes |
| 46 | **A parada do solver de Bézier é medida em `s`, nunca em `x`.** O erro que sobra em `s` chega ao valor multiplicado por `|v'(s)| / |x'(s)|`, razão sem limite superior. Com a parada antiga, dois runtimes conformes divergiram 8,5e-5 no A-020, contra tolerância de 1e-4 (9.3). | dois runtimes |
| 47 | **`extrapolaAntes` e `extrapolaDepois` da 6.4 definidas:** âncora da ponta, direção da alça **para** a âncora, distância ao longo dessa reta, e o que fazer com alça degenerada. O sinal da direção mudava o resultado em 180° (6.4). | dois runtimes |
| 48 | **O `total` do caminho é o mesmo que localiza `t`:** calculado com `constantSpeed: true`, gravado com `false`. Vale para `positionMode` e `spacingMode` em `percent` (6.4). | dois runtimes |
| 49 | **Ordem de busca do `deform` por skin escrita:** `(slot, skin da timeline, placeholder)`, depois `(slot, "default", placeholder)`, depois qualquer skin com o mesmo par, a primeira do array (9.6). | dois runtimes |
| 50 | **`physicsDt`, janela de `events` e `loop` da sonda são normativos e saíram do `leiame.md` para a 12.4.** O relógio anda de `physicsDt` em `physicsDt` desde `t = 0`; os eventos de uma amostra são os de `(anterior, esta]`, com `−∞` na primeira; `loop` enrola a pose inteira, não só os eventos (12.4). | dois runtimes |
| 51 | **`uvs` sem atlas são os literais**, e uma `linkedmesh` também entra no canal `uvs` — ela tem imagem própria. O dump de referência a omitia (12.4, 7.5). | dois runtimes |
| 52 | **Colisão de `drawOrder`: o slot que perde é descitado** e volta para a fila do passo 2. Sem a palavra, o passo 2 pula ele e sobra buraco na ordem. Caso A-029 (9.5). | dois runtimes |
| 53 | **`width: 0` sem atlas e sem imagem = attachment vazio**, invisível, com aviso, e não é erro de validação (7.3). | dois runtimes |
| 54 | **A base dentro do `.bonez` é a pasta do `main`, sem segunda chance na raiz do ZIP.** Um leitor que tenta a raiz abre pacotes que outro recusa. Esqueleto aninhado usa a pasta dele (2.8). | dois runtimes |
| 55 | **`remaining = a` vale em todos os caminhos** do `physicsApply`, escrito em prosa: a indentação do pseudocódigo não sobrevive a uma cópia (6.5). | dois runtimes |
| 56 | **Quem entra em cada canal de geometria do dump** (`vertices` leva `clipping` e `path`; `boundingbox` só no canal dele; nenhum canal olha `visible`) (12.4). Caso B-106. | dois runtimes, arquivo inteiro |
| 57 | **O canal `points` é objeto com `x`, `y` e `rotation`**, nunca lista: duas formas do mesmo número são incomparáveis (12.4). Caso B-106. | dois runtimes, arquivo inteiro |
| 58 | **Os UV de uma `sequence` seguem o quadro ativo** — o `path` costuma ser um prefixo, e resolver a região uma só vez ao carregar dá textura errada com geometria certa (7.10, 10.4, 12.4). Caso B-105. | dois runtimes, arquivo inteiro |
| 59 | **A física começa na primeira `updatePose`**: nenhum aquecimento no construtor pode andar o relógio antes da primeira amostra (6.5, 12.4). Caso C-261. | dois runtimes, arquivo inteiro |
| 60 | **A janela da chave `reset` é entre dois passos**, não entre duas amostras: com o tempo da amostra, o `reset` redispara e a física congela na pose de repouso (9.8, 12.4). Caso C-262. | dois runtimes, arquivo inteiro |
| 61 | **Chave de `deform` com `value: []` é uma fileira de zeros**, e cada chave é expandida ao layout de 7.4 com o SEU `offset` ANTES da interpolação. Tratar a lista vazia como valor não numérico faz a curva virar `stepped` e a malha nunca sai do lugar (9.6, 9.3). Caso A-031. | dois runtimes, arquivo inteiro |
| 62 | ~~Encaixe por nome, e o socket mora no `point`.~~ **Revogada em 17/09/2026** (decisão 72). O socket saiu: `point.socket`, `skeleton.socket`, `skeleton.childSocket` e `rig.sockets` não existem no rascunho 0.2. A entidade **segue a imagem** (7.11): o pino é o `x, y, rotation, scale` do anexo, no osso do slot, como uma imagem. Motivo, com a palavra dele: *"não se guarda a mão direita nas costas"*: o encaixe por nome resolvia um problema que o fluxo do editor não tem, e custava dois campos, um algoritmo de busca e três casos de conformidade. | Humberto, 15/09/2026 (Q7) |
| 63 | **O filho tem dois canais de animação.** `inheritAnimation` responde ao pai pelo nome da animação; `baseAnimation` roda solto, em laço, por baixo de tudo (7.11). Nomes casam com `inheritColor` e `timeScale`, que já moram no mesmo objeto. | decisão do dono, 09/09/2026 |
| 64 | **A pose do filho é feita em duas camadas, ordem fixa, alpha 1** (7.11, 9.10). É a única mistura obrigatória da spec; a mistura por tracks continua livre (12.2). Sem isso, "a motosserra gira sempre" não teria número certo em dois runtimes. | decisão do dono, 09/09/2026 |
| 65 | **Um bloco `rig` para os três usos** — animação compartilhada, skin externa, arma que exige socket (4.8; o terceiro uso saiu com a decisão 72, e entrou o quarto: a pele que traz osso pendura no `rig`, 78). O contrato é gravado, e não uma coincidência de nomes como no Spine. Não atendido é L2: o arquivo abre e diz o que falta. | decisão do dono, 09/09/2026 |
| 66 | **Animações e skins externas entram por `assets.animations` e `assets.skins`, pelo nome, sem encadear** (2.8). Um arquivo externo é um `.bone` comum com um osso raiz e o `rig`; nenhum tipo de arquivo novo. A local ganha da externa. Profundidade 1: mata a recursão sem contador. | decisão do dono, 09/09/2026 |
| 67 | **A primeira animação da lista é a padrão** (4.6). Sem campo: o gravador reordena. É o que um visualizador abre e o que um jogo toca sem pedir nome. | Humberto, 10/09/2026 |
| 68 | **`skin.drawOrder`**: a skin desloca a ordem de desenho enquanto está ativa, com a conta da timeline `drawOrder`, e o resultado é a **ordem base** sobre a qual a timeline mede (4.4, 9.5, 5.1). A capa vestida vai para a frente sem animação. Caso C-280. | Humberto, 10/09/2026 |
| 69 | **Trocar de pai no meio da animação**: timeline `bone` / `parent`, só stepped, semântica do Spriter — os locais são medidos do pai novo, nada é convertido; a ordem de cálculo é refeita quando o pai muda; ciclo é ignorado com L2 (9.4, 5.6, 5.1). Reabre e fecha a decisão 7 do Apêndice B. Casos C-281, C-282, C-286. | Humberto, 10/09/2026 |
| 70 | **As três heranças reservadas ganharam fórmula**: `noRotation`, `noReflection`, `onlyReflection` (5.3, 5.4, 5.5 e a IK de 1 osso), na linha das cinco do Spine, cada uma mudando uma ou duas linhas de um modo que já existe. Não da decomposição `R·F·S`, porque ela não reproduz os cinco modos do Spine (medido: 0,37 a 1,39). A virada do esqueleto inteiro não conta como reflexão do pai (`flip`, o teste que o `noScale` já fazia). Nenhuma combinação é L1. Fecha a decisão 1 do Apêndice B. Casos C-283 a C-285. | Humberto, 10/09/2026, planejador |
| 72 | **A entidade segue a imagem; o socket sai** (7.9, 7.11, 4.8, 2.5, 12.3). Um anexo `skeleton` ocupa o placeholder e o par `x, y` que uma imagem ocuparia. A arma que serve a vários personagens é uma pele de fora sobre o mesmo `rig`. Exemplos `mecha`, `espada`, `capacete` e `mecha-pele-inverno` refeitos; casos C-271, C-272 e C-278 apagados e os outros sete de C-270 a C-279 refeitos sem socket, em 17/09 (degrau 1). | Humberto, 15/09/2026; ARQUITETO 3 §4 |
| 73 | **A pilha de peles: a de cima vence, e a `default` é uma pele como as outras** (2.2, 4.4, 7.1). A lista de peles ativas é uma pilha de baixo para cima; onde duas dão anexo ao mesmo placeholder, a de cima vence. A `default` só está ativa se estiver na pilha; um leitor nasce com `["default"]`. Casos A-025 e A-026 passam a listar a pilha inteira (D1). | Humberto, 17/09/2026 (Q32, Q33) |
| 74 | **A virada de corpo: timeline `body`** (9.13, 9.10, 2.9, 12.4). Uma animação troca de corpo no meio, corte seco, só `stepped`; cada corpo é montado uma vez e a virada troca qual está vivo; as timelines casam por nome com o corpo do instante; `keepSkins` diz se a pilha passa; antes da primeira chave vale o arquivo; o dump ganha `body`. `Pose` passa a receber o projeto. Casos C-290 a C-293. | Humberto, 15 e 16/09/2026 (BASE §9, §16; Q39; A1, A3) |
| 75 | **O desenho troca de osso por chave: `slot` / `bone` com `transform`** (4.3, 9.5, 5.1, 12.4). A chave carrega a posição do anexo no osso novo; o runtime não converte nada, como em 9.4. Só `region`, malha sem `binding`, `point`, caixas e `skeleton` recebem o `transform`; vértices pesados não mudam. O dump de `slots` ganha `bone`. Alternativa descartada: o runtime calcular a posição da pose em `t`, porque o runtime passaria a converter. O campo chamou-se `offset` por algumas horas em 17/09 e foi renomeado a pedido do Humberto: `offset` já era o inteiro do `deform`. Caso C-295. | Humberto, 17/09/2026 (Q10, A4) |
| 76 | **Pesos animados: timeline `weights`** (9.6, 7.4, 5.1). O mesmo endereço do `deform`; `value` são todos os pesos do `binding`, uma curva para o array; a estrutura não anima; nenhuma renormalização. O editor só grava por "Chavear pesos", nunca sozinho (A5). Caso C-296. | Humberto, 17/09/2026 (Q11, Q11b, A5) |
| 77 | **Recorte da exportação por animação: `animation.crop`** (4.6). Informativo, em unidades do esqueleto; a exportação oferece borda automática (padrão) ou o retângulo; magenta na cena, como o Spriter (cap. 26). Nível A. | Humberto, 17/09/2026 (Q21) |
| 78 | **A pele de fora traz osso** (2.8, 7.1, 4.8). De um arquivo em `assets.skins` entram, além das `skins`, os `bones` e `constraints` com `skinRequired` e os `slots`, no fim dos arrays do corpo; o `parent` de cada osso é do `rig` ou do mesmo arquivo; osso sem `skinRequired` é ignorado com L2. O corpo é montado uma vez, com eles dentro. Casos C-277 (refeito) e C-294; exemplo `lobisomem-rabo.bone`. | Humberto, 17/09/2026 (Q40) |
| 79 | **A física é a única simulação do formato, e fica** (1.3, 6.5). Princípio 11 (o quadro é função pura do tempo) com a exceção escrita; o editor ganha "Assar a física em chaves". Alternativas descartadas: simular de 0 até `t` a cada quadro (custo O(t)), ou tirar a física para uma extensão (quebra três casos e o `heroi.bone`). | Humberto, 17/09/2026 (A7; Q28) |
| 80 | **A animação de fora se ajusta ao tamanho: `rig.reference`** (4.8, 2.8). `k = length do hospedeiro / length de referência` multiplica as translações `bone/x` e `bone/y` ao copiar; rotação, escala e cisalhamento não mudam. É a opção do Spine. Caso C-297. Junto: a convenção de nomes publicada em `rigs/humanoide-v1.bone` (A6), e `inheritAnimation` fica no formato, fora da tela da 1.0 (A8). | Humberto, 17/09/2026 (Q41, A6, A8) |
| 81 | **O segundo runtime leu o 0.2 e achou 16 lugares em que a spec não bastava** (17/09/2026, degrau 3). Cada um ganhou uma leitura, a mais simples, e a leitura virou texto: Apêndice C. O runtime de referência segue o mesmo texto. Onde os dois runtimes viessem a divergir, a spec reabre, não o teste (12.4). | dois runtimes, 0.2 |
| 82 | **"Este boneco": o filho em volta de quem o recebe, `skeleton.around`** (7.11, 7.13, 7.7, 2.5, 12.4). Um campo opcional no anexo `skeleton` de quem recebe, com o nome do slot do filho que marca o meio: o que vem antes vai para trás do pai inteiro, o que vem depois, para a frente, e o slot do meio não é desenhado. A marca é do encaixe, não do filho; liga e desliga pela chave `slot/attachment`; dois filhos marcados fazem a cebola. Nenhuma conta de osso muda: só a ordem da lista. Alternativas descartadas: a marca dentro do arquivo do filho (valeria em todo esqueleto que o usa, e pediria timeline nova) e dois anexos da mesma `uri` (duas instâncias, dois relógios, e um leitor velho desenharia o filho duas vezes). É o primeiro campo da 1.1. O dump ganha o canal `drawList`. Casos C-310 a C-319 e X-307, em `casos-pendentes/` até os dois runtimes passarem. Nenhum dos três programas de referência tem isto. | Humberto, 04/10/2026 (`02 AS DECISOES`, seção 2); rodada 11 |
| 83 | **Trocar de placeholder com a mesma `uri` continua o filho** (7.11; Apêndice C, 1 e 16). A corrida de chaves `slot/attachment` que dá o zero do relógio recua enquanto a chave anterior mostrar um anexo `skeleton` de mesma `uri` resolvida, e a instância é a mesma. Sem isto, ligar ou desligar o `around` no meio da animação recomeçava a animação do filho no quadro da troca (medido: 15 onde se esperava 90). É a regra que a virada de corpo (9.13) já tinha. `uri` diferente zera, como sempre. Casos C-320 e C-321. | Diretor, 05/10/2026; rodada 11 |
| 71 | **Pivô por região do atlas**: `pivotX`, `pivotY` na `Region` (10.3), em px da imagem original, da esquerda e de baixo, como `offsetX/offsetY`. **Informativo**: a pose não muda e o anexo continua com `x/y`; é para o editor pôr uma imagem nova no lugar da velha sem esticar nem pular. O rig é a fonte da verdade: o editor calcula o pivô do personagem montado e grava no atlas. Um pivô por imagem; quem precisa de dois duplica a região. Não do anexo, como o Spine, nem por chave, como o Spriter: os dois exigem acerto à mão, imagem por imagem. | Humberto, 10/09/2026 |

## Apêndice B — A decidir antes de congelar a 1.0

Revisado em 17/09/2026 (D0.2 do ARQUITETO 4): para cada aberta, **fecha**, **adia** (continua aberta, sem travar a obra) ou **vira extensão** (sai do núcleo da 1.0).

| # | Ponto | Estado |
|:---:|:---|:---|
| 1 | Fórmulas exatas das três combinações reservadas de `inherit*` (5.3), verificadas numericamente contra as cinco do Spine. Se não houver tempo, ficam reservadas na 1.0 (já é o texto atual). | **fechada** em 10/09/2026: Apêndice A, 70 |
| 2 | Se `BONE_param_grid` (grade multilinear 2-D a 4-D) deve ser promovida ao núcleo antes da 1.0, por causa do Live2D. Exige pseudocódigo multilinear e casos de conformidade. | **vira extensão** (17/09/2026, Q26: nenhum campo de efeito novo na 1.0). Fica `BONE_param_grid`; volta ao núcleo por 12.8 se dois leitores a implementarem |
| 3 | Pseudocódigo próprio do `BONE_pendulum` (sem referência normativa ao Cubism). | **vira extensão** (17/09/2026, Q24: `BONE_pendulum` continua extensão). O pseudocódigo é da spec da extensão |
| 4 | Algoritmos completos de CCD e FABRIK para `BONE_ik_chain` (conversão de posições em rotações locais, `mix`, `stretch`). | **vira extensão** (17/09/2026, Q24: IK de dois ossos na 1.0; mais de dois depois) |
| 5 | Nome definitivo do formato e do domínio do `$id` (`recorte.dev` é provisório). | **adia**: renomear é fase própria, depois do domínio (`ESTADO.md`, regra 10). Não trava |
| 6 | Conferência das fórmulas portadas (5.4, 5.5, 6.2–6.5, 9.3) contra o spine-runtimes C++ com `expected.json` gerado por dois caminhos (12.4). | **adia** para antes de congelar a 1.0. Não trava a reforma |
| 7 | Timeline `parent` animável (Spriter). Ficou fora em 06/09 (o importador fazia bake). **Reaberta e fechada em 10/09/2026 pelo Humberto**: entrou como propriedade `parent` da timeline `bone` (9.4), só stepped, sem conversão, com a ordem de cálculo refeita (5.6). Decisão 69. | fechado, 10/09/2026 |
| 8 | Layout binário: confirmar os limiares de 64 chaves / 64 influências para blocos obrigatórios e o alinhamento de `positions` dentro de `BIND`. | **adia**: o `.boneb` ganha as timelines novas (`body`, `slot/bone`, `weights`) pela árvore genérica de 11.5, sem bloco canônico novo; os limiares ficam para a 1.0 |
| 9 | Confirmar nomes exatos dos campos 4.3 de transform (mapeamento) e slider contra `SkeletonJson` 4.3 e completar 13.1 com uma linha por campo. | **adia**: importador do Spine é glacê (D12) |
| 10 | Se a mistura em duas camadas do filho aninhado (7.11, decisão 64) fica normativa na 1.0 ou se `baseAnimation` sai para uma extensão até a mistura por tracks ter regra. Os casos C-273 e C-274 prendem a resposta de hoje. | **fechada em 17/09/2026: normativa.** A entidade depende dela: `baseAnimation` é o fundo em laço da "imagem com relógio" (E1, E12b, F18). `inheritAnimation` também fica, fora da tela da 1.0 (A8) |
| 11 | Se `assets.skins` (lista simétrica com `atlases` e `animations`) é melhor do que `skin.uri` (skin local que aponta para fora e ganha nome local de graça). Escolhida a simetria; reabrir só se aparecer um caso que precise renomear uma skin ao importar. | **fechada em 17/09/2026: `assets.skins` fica.** É o que "Exportar pele… / Importar pele…" (I12, Q30) e a pele com osso (F23) usam |
| 12 | Se `EXTERNAL_CHAIN` (2.8) fica L1 na 1.0 — proíbe biblioteca de animações que puxa outra biblioteca. Simples e seguro; não reabre sem contador de profundidade e caso de conformidade. | **fechada em 17/09/2026: fica L1.** A pele com osso e o `rig.reference` cabem na profundidade 1 |
| 13 | **Animação daqui por cima da de fora** (Q42): o andar do Mixamo nas pernas e um aceno próprio no braço, na mesma animação. Seria uma segunda camada como a do filho aninhado (7.11), mas no próprio corpo. | **aberto, não trava.** O Humberto achou interessante e ainda não disse sim. Enquanto não diz, a mistura entre animações continua do runtime (1.4) |
| 14 | Os sete casos de C-270 a C-279 que sobrevivem ao socket (C-270, C-273 a C-277, C-279) foram refeitos sem `socket` em 17/09 (degrau 1) e, junto com C-290 a C-300, entraram em `casos/` no mesmo dia, quando os dois runtimes passaram. | **fechada em 17/09/2026**: 71 casos, dois runtimes, confronto sem diferença |

## Apêndice C — Onde a spec não bastou: as leituras do segundo runtime (17/09/2026)

O runtime em Python (degrau 3 do `ARQUITETO 4`) foi escrito **só por este texto**, sem abrir o runtime de referência, e anotou os lugares em que precisou adivinhar. Cada linha abaixo é **normativa** a partir de agora: é a leitura mais simples, escolhida pelo Planejador com a delegação do Humberto (*"técnicas: escolha o mais simples"*). O runtime de referência (degrau 2) segue o mesmo texto. Um item que se mostrar errado reabre a spec, não o teste.

| # | Seção | O que faltava | A regra |
|:---:|:---|:---|:---|
| 1 | 7.11, relógio do filho | "começa em 0 quando o anexo fica ativo" não dizia como achar o instante sem guardar estado (princípio 11) | O instante em que o anexo ficou ativo é o **início da corrida** de chaves `slot/attachment` com o mesmo valor que vale em `t` (a última chave antes de `t` cujo valor é este anexo, recuando enquanto as chaves anteriores tiverem o mesmo valor). Sem timeline `slot/attachment` para o slot: 0. Uma troca de **pele** que passa a mostrar a entidade **não** zera o relógio. **Desde 05/10/2026 (rodada 11):** a corrida recua também enquanto a chave anterior mostrar, nas peles do instante, um anexo `skeleton` de **mesma `uri` resolvida** que o anexo em vigor, ainda que o nome do placeholder seja outro (7.11; casos C-320 e C-321) |
| 2 | 7.11, laço | não dizia se o filho usa o tempo do pai enrolado ou corrido | O tempo **enrolado** (`t mod duration`, 9.11): o filho recomeça a cada volta do pai |
| 3 | 7.11, fonte 1 (`nested/animation`) | não dizia se a animação escolhida pela chave toca em laço | Usa o `loop` do anexo |
| 4 | 7.11, fonte 2 (`inheritAnimation`) | idem | Usa o laço do pai (na suíte, o `loop` da sonda) |
| 5 | 9.9 `nested/time` | "dirige só a animação de cima" não dizia se vale para as fontes 2 e 3 | Vale para a animação de cima, venha da fonte 1, 2 ou 3; `timeScale` é ignorado enquanto houver `nested/time` |
| 6 | 7.11 e 12.4, evento do filho | dizia o nome (`<slot>/<evento>`), não o `time` do dump | O `time` é no relógio do **pai**: `tempo da amostra − (relógio do filho − tempo do evento no filho) / timeScale`. A janela do filho é desde a amostra anterior, no relógio dele; trocar a animação do filho reabre a janela em `−∞` |
| 7 | 7.11, `baseAnimation` | não dizia se os eventos do fundo chegam ao jogo | Chegam, prefixados, como os da animação de cima |
| 8 | 2.8, pele de fora com malha pesada | `binding.bones` é índice no arquivo da pele; no corpo os índices são outros | Traduzido pelo **nome** do osso do arquivo da pele para o índice do corpo; nome que o corpo não tem vai para o índice 0 com L2 `RIG_UNMET` (tabela de 2.8) |
| 9 | 2.8, slot de fora com nome local | a tabela dava a regra do osso repetido, não a do slot | A mesma do osso: o local vale, L2 `EXTERNAL_DUPLICATE` |
| 10 | 9.13 `keepSkins` | "nome que o corpo novo não tem é ignorado": tirado da pilha, ou ignorado na resolução? | **Fica na pilha** e é ignorado na resolução (aviso uma vez). Voltar a um corpo que tem a pele a faz valer de novo |
| 11 | 9.13, corpo dentro de corpo | não dizia se uma chave `body` num corpo carregado, ou num filho aninhado, carrega outro corpo | Não carrega: profundidade 1. Só as chaves `body` das animações do arquivo aberto trocam de corpo |
| 12 | 9.13, física do corpo que entra | "começa como no primeiro `updatePose`": um corpo nunca posado já está assim | `physicsReset` só quando o corpo **volta** (já tinha sido posado antes nesta reprodução) |
| 13 | 9.5 `transform` | a lista citava `region`, malha sem `binding`, `point`, caixa retângulo/elipse e `skeleton`; não citava caixa polígono, `clipping` e `path` sem `binding` | Vale para **todo** anexo sem pesos, pela mesma razão da malha sem `binding`: o que é medido do osso do slot segue o osso novo; o que é medido dos ossos do `binding` não |
| 14 | 4.7 e 9.10, alvo que falta | nomeava `BODY_UNMET` (na virada) e `RIG_UNMET` (na carga), mas não o aviso do instante numa animação **sem** virada | `BODY_UNMET` quando a animação tem timeline `body`; fora disso, L2 **`TARGET_MISSING`** (código novo; entra na tabela de 12.3) |
| 15 | 12.4, sonda sem `skins` | não dizia qual pilha vale | A de nascença, `["default"]` (4.4) — é o que `como-provar-conformidade.md` já dizia |
| 16 | 7.11 e 9.13, instância que some | "a instância antiga some" só estava dito para a virada | Some sempre que o slot deixa de mostrar a entidade (por chave, por pele ou por corpo), com aviso L2 **`NESTED_GONE`** uma vez; se voltar a mostrar, é instância nova, relógio pela regra 1. **Desde 05/10/2026 (rodada 11):** passar a mostrar outro anexo `skeleton` de mesma `uri` resolvida **não** é deixar de mostrar a entidade: a instância continua, sem aviso (7.11) |

Dois códigos entram na tabela de 12.3 por este apêndice: `TARGET_MISSING` (L2, alvo de timeline que o esqueleto não tem, fora da virada) e `NESTED_GONE` (L2, a instância aninhada deixou de ser mostrada).

*Fim do rascunho 0.2 da especificação.*

