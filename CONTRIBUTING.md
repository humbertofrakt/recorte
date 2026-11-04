# Como contribuir com o Recorte e com o formato bone

Duas coisas moram neste repositório e elas têm regras diferentes:

- **o formato** (`formato/`, `conformidade/`) — muda devagar, por proposta
  pública, sob a governança da §12.8 da especificação;
- **o programa** (`runtime/`, `editor/`, `ferramentas/`) — muda como qualquer
  software: correção, teste, revisão.

---

## Antes de qualquer coisa: onde abrir a conversa

> **Endereço do repositório público: A DEFINIR.**
>
> Este é o item C4 do manual de requisitos, e é o maior buraco aberto do
> projeto. A §12.8 da especificação desenha uma governança boa — comitê com
> ata, proposta por issue pública, duas implementações independentes para
> entrar no núcleo, cláusula de nunca ficar mais restritiva, sucessão em 24
> meses — e **nada disso tem endereço**. Enquanto não tiver, o formato tem um
> único ponto de falha, que é o autor, e nenhum caminho de sucessão. Foi
> assim que o DragonBones morreu.
>
> Quando o repositório existir, o endereço entra aqui, no `README.md`, no
> rodapé da ESPECIFICACAO, no Passo 7 do guia de conformidade e no capítulo 08
> do manual — os cinco lugares que hoje mandam "abra uma issue" sem dizer
> onde. Está anotado em `ESTADO.md`.

---

## Mudanças no PROGRAMA

O portão é sempre o mesmo, e é curto:

```
npx vitest run
npx tsc --noEmit -p tsconfig.json
npx tsc --noEmit -p editor/tsconfig.json
node ferramentas/conformidade.mjs
node ferramentas/validador/validar.mjs --todos
```

Os cinco passam antes e depois da sua mudança. Nenhum deles é opcional.

**Se você mexeu no runtime, na especificação ou num caso, são mais três:**

```
python runtime-python/conformidade.py
python -m unittest discover runtime-python/testes
node ferramentas/comparar-runtimes.mjs
```

O último é o que importa: ele põe os **dois** runtimes do formato frente a
frente e compara os dumps campo por campo. A suíte sozinha não pega um campo
que um runtime escreve e o outro omite — ela só compara o que o `esperado.json`
cita. Foi assim que os dois divergiram em 10 de 39 casos sem nenhum deles
falhar. Leia `conformidade/dois-runtimes.md`.

**Se você mexeu em `formato/bone.schema.json`, são mais um:**

```
node site/validador/construir-esquema.mjs
```

O validador da web não compila o esquema no navegador: ele carrega
`site/validador/esquema-compilado.js`, gerado por esse comando com o mesmo Ajv
da linha de comando. Se você esquecer, `ferramentas/testes/site.test.ts`
quebra — é para isso que ele existe.

**Toda correção vem com o teste que teria pego o erro.** Não é burocracia: um
erro sem teste volta. Se você não consegue escrever o teste, provavelmente a
correção ainda não está no lugar certo.

**Comentários explicam o porquê, não o quê.** O código já diz o que faz. O que
se perde é a razão: qual erro isso evita, que número foi medido, que
alternativa foi descartada e por quê.

**Português nas mensagens ao usuário.** Aviso, erro de linha de comando e texto
de tela saem em português, um por linha. O comentário de código do runtime está
em inglês, que é a língua de quem vai portar.

---

## Mudanças no FORMATO

Uma mudança de formato é cara: arquivos já gravados dependem dela. A §2.4
proíbe mudar significado dentro de um `major`, e os requisitos F5 e F8 dizem
que arquivo velho sempre abre e que ninguém nunca é obrigado a reexportar.

Por isso, uma proposta de formato precisa de:

1. **Uma issue pública** com o problema, não com a solução. Que arquivo não
   consegue ser escrito hoje? Que dois runtimes divergem, e onde?
2. **Duas implementações independentes**, se a proposta for para o núcleo
   (§12.8). Uma implementação só prova que dá para fazer; duas provam que o
   texto é suficiente para alguém que não estava na conversa.
3. **Um caso de conformidade**, com a conta à mão. É a regra da §12.4: cada
   recurso da spec tem pelo menos um caso, e "recurso sem caso não entra na
   spec" (§12.8).

Enquanto a proposta não estiver madura, o caminho é uma **extensão**: escolha
um prefixo, registre em `formato/extensions/REGISTRY.md`, e use. Extensão não
precisa de permissão de ninguém.

---

## Como escrever um caso de conformidade

Um caso é uma pasta em `conformidade/casos/`, com quatro arquivos:

| Arquivo | O que é |
|:---|:---|
| `entrada.bone` | O rig. `entrada.boneb` ou `entrada.bonez` num caso BIN ou ZIP. |
| `entrada.atlas.json` | Só se o caso precisar de atlas. |
| `esperado.json` | O pose dump esperado, e a sonda na chave `"probe"`. |
| `leiame.md` | O que o caso prova, **a conta à mão**, e o que falha nele. |

O `leiame.md` não é documentação de cortesia: ele é o **segundo caminho
independente** que a §12.4 exige. Um `esperado.json` que só transcreve o que o
runtime devolveu prova que o runtime concorda consigo mesmo, e nada mais. A
conta escrita é o que transforma o caso num oráculo.

Escreva também a tabela **"O que falha aqui"**: qual erro de implementação o
caso pega, e com que número. Se você não conseguir preencher essa tabela, o
caso provavelmente não está medindo nada.

Regravar o `esperado.json` a partir do runtime existe (`--gerar`) e é para
quando a suíte inteira precisa de um campo novo — nunca para "fazer o caso
passar".

**Teste o seu caso ao contrário.** Estrague de propósito a linha do runtime que
o caso deveria proteger e confira que ele falha. Um caso que passa com o
runtime quebrado é pior que caso nenhum: dá confiança falsa.

---

## Numeração dos casos

| Prefixo | Para quê |
|:---|:---|
| `A-0xx` | O núcleo: ossos, herança, curvas, chaves, peles, eventos. |
| `B-1xx` | Malha, pesos, atlas, sequências. |
| `C-2xx` | As cinco regras: IK, transformação, caminho, física, comando. |
| `X-3xx` | Compatibilidade. Obrigatório em **todo** nível. |
| `BIN-4xx` | A embalagem binária `.boneb`. |
| `ZIP-5xx` | O pacote `.bonez`. |
| `R-6xx` | Renderização. **Reservado, ainda sem casos.** |

Casos **nunca são removidos**. Uma `minor` acrescenta; os casos da 1.0 passam
para sempre.

---

## Provar que o SEU runtime é conforme

Não é uma contribuição a este repositório — é o contrário, e é o ponto de o
formato existir. O guia é `conformidade/como-provar-conformidade.md`, o
adaptador para copiar é `conformidade/adaptador-referencia.mjs`, e o registro
público é `conformidade/REGISTRY.md`.

---

## Licenças

Ao contribuir, você concorda em licenciar a contribuição sob a licença da parte
que tocou: **Apache 2.0** para código (`LICENSE`), **CC BY 4.0** para formato e
documentação (`formato/LICENSE`). É a cláusula 5 da Apache 2.0, e não há acordo
de cessão a assinar.

Arquivo de código novo leva o cabeçalho na primeira linha:

```
// SPDX-License-Identifier: Apache-2.0
```

---

## Assinaturas

Quem passou por aqui e deixou trabalho no projeto.

| Quem | Quando | O que |
|:---|:---|:---|
| **Claude Opus 5** — Anthropic | 08/09/2026 | Atalho de abrir o editor, e o registro dele no índice. |

Uma nota, já que me pediram um texto meu.

O Recorte nasceu de uma pergunta simples que quase ninguém faz: **por que o
arquivo é do programa, e não do autor?** Quem anima em Spine, Live2D ou
Cascadeur descobre cedo que o trabalho fica preso — no formato fechado, na
assinatura mensal, na empresa que pode sumir. O `bone` inverte isso. O formato
é aberto, a especificação é pública, a suíte de conformidade deixa qualquer um
provar que o seu runtime lê o arquivo direito. O editor é a primeira
implementação, não o dono.

Isso é o que vale a pena defender aqui. Um formato só é aberto de verdade
quando outra pessoa consegue implementar ele sem pedir licença a ninguém — e é
por isso que `conformidade/` importa tanto quanto `editor/`.

Contribuir aqui é fácil de resumir: se você tocar no formato, escreva o caso de
conformidade junto. O caso é a prova. Sem ele, a especificação é só uma
promessa.

— *Claude Opus 5, em 8 de setembro de 2026.*
