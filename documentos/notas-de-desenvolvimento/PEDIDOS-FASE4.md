# Pedidos da fase 4

Um pedido por bloco. Quem for dono do arquivo resolve. Quem pediu contornou.

**Situacao em 2026-09-07: os quatro pedidos estao ATENDIDOS.** O que foi feito
esta escrito no fim de cada bloco, depois de "Feito".

---

## 1. O validador não valida atlas — dono do validador

De: dono B (empacotador de atlas).

`node ferramentas/validador/validar.mjs saida.atlas.json` recusa um atlas
correto, porque só conhece o esqueleto:

```
ERRO  saida.atlas.json
      - / must have required property 'bone'
      - / must have required property 'bones'
```

O empacotador (`ferramentas/empacotar.mjs`) grava `.atlas.json` da §10 e não
tem como conferir o próprio trabalho pela ferramenta oficial.

**Pedido:** o validador reconhecer a extensão `.atlas.json` e validar contra a
§10 (raiz `atlas`, `pages`, `regions`, e as regras L1 de 10.3).

**Como contornei:** os testes em `ferramentas/testes/atlas.test.ts` carregam o
atlas gerado com `loadAtlas` do runtime e exigem zero avisos.

**Feito.** O validador agora escolhe o esquema pelo nome do arquivo:
`.atlas.json` vai contra `definitions/atlas` (§10), `manifest.json` contra
`definitions/manifest` (§2.9), o resto contra a raiz. As opções `--atlas`,
`--manifesto` e `--esqueleto` forçam o tipo quando o nome não ajuda, e a linha
de saída passou a dizer qual foi: `OK  saida.atlas.json  (atlas)`. As regras L1
de 10.3 que o JSON Schema não expressa entraram à mão: região que passa da
borda da página (contando a rotação), `originalWidth < offsetX + width` e o par
em Y, nome de página repetido, nome de região repetido contando os `aliases`, e
`rotation` fora de 0 e 90. `--todos` agora valida também os `.atlas.json` de
`formato/exemplos/`.

---

## 2. Menu e salvamento das imagens importadas — dono A (io, ui, main)

De: dono B (empacotador de atlas).

`editor/src/io/import-images.ts` está pronto e exporta o que o menu precisa:

| função | para quê |
|:---|:---|
| `importImages(doc, opções?)` | "Importar imagens": abre o seletor, empacota e escreve tudo num passo desfazível. Devolve `null` se o usuário cancelar. |
| `repackAtlas(doc, opções?)` | "Reempacotar atlas": refaz a página com outras opções, sem pedir os arquivos de novo. |
| `hasImportedImages(doc)` | ligar ou desligar o item "Reempacotar atlas" no menu. |
| `atlasFileText(doc)` | o texto do `.atlas.json` para gravar junto do `.bone`. |
| `atlasPageBlobs(doc)` | um PNG por página, com o nome que o atlas espera. |
| `packSummary(atlas)` | uma linha curta para a barra de estado. |
| `forgetImportedImages(doc)` | esquecer as imagens ao abrir ou criar outro documento. |

**Pedido:**

1. Dois itens no menu Arquivo: **Importar imagens** e **Reempacotar atlas**.
2. Salvar gravar também o `.atlas.json` e as páginas, quando houver.
3. `Novo` e `Abrir` chamarem `forgetImportedImages(doc)`.

**Como contornei:** as funções rodam sem menu; quem chamar, funciona.

**Feito.** Os dois itens estão no menu Arquivo, e "Reempacotar atlas" fica
apagado até `hasImportedImages(doc)` ser verdadeiro. `Salvar` grava o
`.atlas.json` e as páginas junto do `.bone` (pela pasta do arquivo quando o
navegador entrega o diretório, senão um download por arquivo). `Novo` e `Abrir`
chamam `forgetImportedImages(doc)`.

Dois defeitos apareceram ao clicar de verdade no navegador, e foram corrigidos:

1. `decodeImage` lia `bitmap.width` **depois** de `bitmap.close()`, e um
   `ImageBitmap` fechado devolve zero. Toda importação morria em "a imagem X
   tem largura ou altura zero". O tamanho passou a ser lido antes de fechar.
2. `writeImportIntoFile` procurava a região só por `name`, então a segunda de
   duas imagens iguais — que o empacotador guarda como `aliases` (§10.5) — não
   ganhava slot. Seis PNGs viravam quatro slots. Agora a busca olha os apelidos
   também: um braço direito e um esquerdo são duas coisas na tela mesmo quando
   o desenho é o mesmo arquivo.

---

## 3. O runtime só abre `.bone` — dono do runtime (loader)

De: dono C (binário `.boneb` e pacote `.bonez`).

`loadSkeletonData` recebe a árvore JSON já parseada, então ele **já serve** para
o binário: basta passar a saída de `readBoneb`. Mas não existe um caminho de
entrada único para o jogo, que é quem vai receber `.boneb` e `.bonez` de fato.

Pronto para usar, sem dependência nova e sem importar Node:

| função | arquivo | o que faz |
|:---|:---|:---|
| `readBoneb(bytes)` | `ferramentas/src/binario/ler.ts` | bytes de `.boneb` -> árvore `BoneFile` |
| `readBonez(bytes, codec)` | `ferramentas/src/binario/bonez.ts` | bytes de `.bonez` -> pacote, com `read(nome)` por entrada |
| `writeBoneb(arvore)` | `ferramentas/src/binario/escrever.ts` | árvore -> bytes de `.boneb` |
| `writeBonez(entrada, codec)` | `ferramentas/src/binario/bonez.ts` | pacote a partir de um manifesto e uma lista de arquivos |

O `codec` é injetado (`deflateRaw` / `inflateRaw`), para o mesmo código servir
no Node e no navegador. Sem ele, o pacote ainda abre em modo Store.

**Pedido:** o runtime expor `loadSkeletonFile(bytes)` que detecte pela
assinatura (`PK\x03\x04` = `.bonez`, `\x89BONE` = `.boneb`, `{` = `.bone`) e
resolva as `uri` de dentro do pacote pela regra de 2.8 ("pasta do arquivo
principal dentro do ZIP").

**Como contornei:** `ferramentas/converter.mjs` faz a detecção pela extensão e
o `readBonez` já entrega qualquer entrada pelo nome, que é o que a resolução de
`uri` precisa.

**Feito.** `runtime/src/file.ts` expõe `loadSkeletonFile(bytes, opções)` e
`detectEncoding(bytes)`. A escolha é pelos primeiros bytes, nunca pelo nome do
arquivo — que um download ou um upload podem trocar. Num `.bonez` ele lê o
esqueleto principal (que pode estar em `.bone` ou em `.boneb`), acha os atlas
pelo `assets.atlases` e pelo manifesto, e resolve cada nome pela regra de 2.8:
a pasta do esqueleto principal dentro do ZIP. Devolve `data`, `encoding`,
`file`, `atlases`, `archive` e `warnings`.

Para isso os três módulos do binário **mudaram de casa**: agora moram em
`runtime/src/binario/`. O motivo é de camada, não de gosto: o runtime não pode
importar nada de fora de `runtime/src` (a compilação do visualizador tem
`rootDir` ali), e o binário é parte do formato, não da caixa de ferramentas —
um jogo que só lê precisa dele. Os caminhos antigos em `ferramentas/src/binario/`
continuam funcionando: viraram arquivos de uma linha que reexportam.

Falta uma coisa, e é do navegador, não do código: ler um `.bonez` **comprimido**
precisa de um descompactador síncrono, e o navegador só tem
`DecompressionStream`, que é assíncrono. No Node (`zlib.inflateRawSync`) funciona
inteiro. Escrever funciona nos dois: no editor o pacote é comprimido antes, com
`CompressionStream`, e o gravador recebe as respostas prontas.

---

## 4. §13.1: a rotação do atlas do Spine é o contrário da nossa — dono da spec

De: dono A (importadores).

A tabela da §13.1 diz que `rotate: 90` do `.atlas` vira `Region.rotation 90`
"sem perda". Não é bem assim.

- A doc do Spine diz, com estas palavras: a região foi guardada na página
  **girada 90° no sentido anti-horário**.
- A §10.4 define `rotation: 90` como girada 90° **no sentido horário** (a
  própria seção confere: o canto superior esquerdo do corte cai no canto
  superior **direito** do retângulo na página).

As duas convenções estão a 180° uma da outra. Copiar o campo dá desenho de
cabeça para baixo.

**Como contornei** (em `ferramentas/src/importar/spine-atlas.ts`):

1. A região sai com `rotation: 90` e o corte **espelhado**:
   `offsetX' = originalWidth − offsetX − width` e
   `offsetY' = originalHeight − offsetY − height`.
2. O importador do esqueleto compensa o espelho: `region` ganha
   `rotation + 180`; a `mesh` tem os uvs espelhados.
3. Com isso a fórmula da §10.4 cai no mesmo pixel do Spine. O teste
   "converte a rotação anti-horária do Spine para a convenção da seção 10.4"
   em `ferramentas/testes/importar.test.ts` prova ponto a ponto.

**Pedido:** corrigir a linha da §13.1 para descrever essa conversão, ou mudar a
§10.4 para o sentido anti-horário (aí o campo copia direto). Enquanto a spec
não decidir, o importador segue a §10.4 como está escrita hoje.

**Segundo ponto, menor:** os `mesh.uvs` do Spine são relativos ao **corte**
(região empacotada) e os da §7.3/10.4 são relativos à **imagem original**. O
importador converte quando recebe o `.atlas`; sem o atlas, os uvs ficam como
vieram e sai um aviso.

**Feito, e a §10.4 ficou como estava.** Mudar a §10.4 para o sentido
anti-horário mexeria no runtime, no empacotador e em todo arquivo já gravado;
descrever a conversão custa uma linha de tabela. Então a §13.1 foi reescrita: a
linha do atlas virou três — uma para o que copia direto, uma só para o
`rotate: 90` explicando que **não se copia o campo** e dando as duas fórmulas do
espelho, e uma para os `mesh.uvs`, com a conta e com a perda anotada na coluna
de perdas ("uvs errados quando o `.atlas` não vem junto"). Depois da tabela
entrou uma nota curta dizendo por que a conversão de duas partes é exata: girar
180° é o mesmo que espelhar nos dois eixos.
