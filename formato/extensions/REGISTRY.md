# Registro de extensões — formato bone

Toda extensão do formato tem um prefixo, e todo prefixo está aqui. É o que
impede duas empresas de usarem o mesmo nome para coisas diferentes — o erro que
transforma um formato aberto num formato que só abre no programa de origem.

A regra de nomes está na §2.7 da especificação:

- `BONE_` é reservado ao comitê. Uma extensão `BONE_` é candidata a entrar no
  núcleo numa versão futura.
- `<FORNECEDOR>_` é de quem escreveu. `RECORTE_`, `ADOBE_`, `MEUESTUDIO_`.
  Escolha um prefixo que ninguém mais use e registre-o aqui.
- Um leitor que não conhece a extensão **ignora** o bloco e abre o arquivo do
  mesmo jeito — a menos que o nome esteja em `extensionsRequired`, e aí ele
  **recusa** e diz qual faltou (casos X-304 e X-305 da suíte).

---

## Prefixos em uso

| Prefixo | Dono | O que faz | Onde está descrita | Núcleo? |
|:---|:---|:---|:---|:---|
| `RECORTE_editor_state` | Recorte | Câmera, seleção e animação aberta no editor. Não muda o desenho. | `editor/README.md` | Não. É estado de ferramenta, e não pertence ao núcleo. |
| `BONE_param_grid` | Comitê | Grade de parâmetros multilinear, ao modo do Live2D. | ESPECIFICACAO, Apêndice B | **Decisão em aberto** — ver `ESTADO.md`, item 2. |
| `BONE_pendulum` | Comitê | Pêndulo com pseudocódigo próprio, sem depender do Cubism. | ESPECIFICACAO, Apêndice B | **Decisão em aberto** — ver `ESTADO.md`, item 3. |
| `BONE_particles` | Comitê | Emissor de partículas **sem estado**: o quadro em `t` é função pura do arquivo e de `t`. Anexo `"type": "BONE_particle"` num slot. | `BONE_particles.md` (aqui), schema em `BONE_particles.schema.json` | Ainda não. Candidata: promove quando os dois runtimes passarem os casos P-001 a P-008 (§12.8). |

---

## A convenção de arquivo — 18/09/2026

A §2.7 manda que o autor de uma extensão **publique o JSON Schema** dela, e a
§12.7 manda que o validador **aplique esse schema pelo nome**. Nenhuma das duas
dizia com que nome o arquivo é gravado, e sem um nome previsível o validador não
tem como achá-lo. A convenção, a partir de agora:

| Arquivo | Onde |
|:---|:---|
| A spec da extensão | `formato/extensions/<NOME_DA_EXTENSAO>.md` |
| O JSON Schema dela | `formato/extensions/<NOME_DA_EXTENSAO>.schema.json` |

`<NOME_DA_EXTENSAO>` é o nome exato que vai em `extensionsUsed`, com o prefixo:
`BONE_particles.md` e `BONE_particles.schema.json`.

**O schema diz de si mesmo o que descreve**, e é assim que uma extensão nova
entra no validador sem uma linha de código:

| Campo do schema | Para quê |
|:---|:---|
| `x-extension` | O nome da extensão. Vale mais que o nome do arquivo, se os dois diferirem |
| `x-attachment-types` | Os `attachment.type` prefixados que este schema descreve (`["BONE_particle"]`) |
| `x-timeline-types` | Os `timeline.type` prefixados da extensão |
| `$ref` na raiz | Aponta para a definição que vale para um anexo desse tipo |

**Quem chama o schema, hoje, no disco:**

| Onde | O quê |
|:---|:---|
| `ferramentas/validador/validar.mjs` | Lê `formato/extensions/*.schema.json`, compila cada um com Ajv e monta o registro **nome → schema** |
| `site/validador/construir-esquema.mjs` | Compila os mesmos schemas à frente do tempo e gera `site/validador/extensoes-compiladas.js`, para a página não precisar de Ajv |
| `site/validador/nucleo.js`, `checarExtensoes` | **A regra, num lugar só.** Aplica o schema sobre cada `extensions.<nome>` e sobre cada anexo de tipo prefixado. Erro: `EXT_SCHEMA` |

Antes disso o `definitions/extensions` do `bone.schema.json` conferia só o
**nome** da chave e que o valor era um objeto: o conteúdo de toda extensão
passava sem ser lido. Um emissor com `rate: -5` e `shape: "triangulo"` recebia
verde.

---

## Como registrar um prefixo

1. Confira que o prefixo não está na tabela acima.
2. Escreva o que a extensão guarda e o que um leitor que a ignora perde.
3. Grave a spec e o schema com os nomes da convenção acima.
4. Abra uma issue com a linha da tabela preenchida. Veja `CONTRIBUTING.md`.

Registrar um prefixo é gratuito, não passa por aprovação e não dá direito
nenhum sobre o formato: serve só para o nome não colidir.

## Como uma extensão vira núcleo

A §12.8 pede **duas implementações independentes** e uma proposta pública. Uma
extensão que já esteja na tabela com duas implementações que passem na suíte
pode ser proposta para a próxima `minor`.
