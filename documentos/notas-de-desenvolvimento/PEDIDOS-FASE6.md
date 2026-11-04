# Pedidos entre módulos — fase 6

Cada pedido é uma coisa que um dono precisa de outro. Quem pede contorna
enquanto espera; quem atende risca a linha e diz o que fez.

## ATENDIDO — 08/09/2026, no fechamento da fase 6

Tudo o que estava pedido aqui foi feito. Fica escrito o que aconteceu com cada
linha, para quem for ler isto depois:

| Pedido | O que foi feito |
|:---|:---|
| 1 — mover `preview.css` para o `main.ts` | Feito. O `import './preview.css'` saiu do `preview.ts` e entrou no topo do `main.ts`, junto com os outros cinco. `ensurePreviewStylesheet` ficou, e só cobre um painel montado fora da página. Conferido no `build`: `previa-canvas` continua no `index.css` gerado. |
| 2 — "Prévia" nascer dobrada | Feito, e escrito num lugar só: `export const CLOSED_PANELS = ['malha', 'exibicao', 'previa']` em `ui/shell.ts`, que é de onde o mapa `openPanels` nasce. Testado em `editor/testes/fase6.test.ts`. |
| PSD — um atlas só | Feito. `io/import-images.ts` passou a exportar `addImportedItems`, `importedItems`, `importedStock`, `restoreImportedStock`, `setImportedAtlas`, `packImportedStock` e `atlasBaseName`. O "Importar PSD" empacota no mesmo acervo, "Reempacotar atlas" passou a valer para as camadas e **Salvar** passou a gravar o `.atlas.json` e o `.png` do PSD — o que antes não acontecia, porque `atlasFileText` lê esse acervo. Camada de nome já usado é renomeada com aviso (`renameClashingLayers`), em vez de tomar a região de outro desenho. No modo **Substituir**, o acervo é esvaziado antes: trocar o personagem troca os desenhos dele. |
| PSD — as três linhas em `menus.ts`, `shell.ts` e `package.json` | Ficam como estão. São acréscimos, o item de menu funciona, e o requisito R3 pede um item de menu. |
| PSD — manual e `editor/README.md` | Feito: `editor/README.md` e `documentos/manual/02-montar-personagem.md` ganharam "Importar PSD…" e `npm run importar-psd`. |
| Eixos e chaves — manual e `editor/README.md` | Feito: o seletor **Eixos**, as três caixas de **Compensar**, a segunda barra da Linha do tempo e os campos **Cor do osso** e **Ícone** estão no `editor/README.md` e nos capítulos 2 e 3 do manual. |
| Eixos e chaves — `BoneKey` com `shearX` e `shearY` | Fica como está. Nada fora de `viewport/tools/` foi tocado. |
| `appliedFromWorld` com cisalhamento | **Não mexido no runtime, de propósito.** Virou a decisão **6b** do `ESTADO.md`, com a conta, a medição (~6% com `shearX = 20°`) e a fórmula exata. `runtime/src/skeleton.ts` é um porte palavra por palavra do Spine; trocar a fórmula mexe em casos de conformidade e afasta o runtime da referência que a §12.4 manda conferir. É decisão do dono do projeto, não de um lote de trabalho. |

Uma coisa a mais, que ninguém tinha pedido e apareceu clicando: a **janela
inteira rolava**. Um filho posicionado da régua da Linha do tempo passava da
borda e esticava a página, e bastava clicar num campo lá embaixo para a barra de
menus sumir para cima. `html, body { overflow: hidden }` em `shell.css`; cada
painel continua rolando dentro de si.

E outra: **"Espelhar esquerda e direita" usava `window.confirm`**, que escreve
"OK" e "Cancelar" — palavras que não dizem o que vai acontecer, contra a regra
de interface do projeto. Virou `askUser`, em `ui/dialog.ts`, com a lista dos
pares por extenso e dois botões que dizem o que fazem: **Trocar os lados** e
**Deixar como está**. Um teste garante que nenhum arquivo do editor volta a
chamar `window.confirm`.

---

## Pedido 1 — RESOLVIDO sem mexer em arquivo de outro dono

O painel novo `panels/preview.ts` traz o estilo `panels/preview.css`. Os outros
cinco CSS de painel entram por `import` no topo de `main.ts`, e por isso
bloqueiam a primeira pintura (o comentário grande do `main.ts` explica por quê).

Medido: um `<link>` criado por script, por `import.meta.url`, **não** é
empacotado pelo Vite — a folha simplesmente não saía no `build`. A saída foi
`import './preview.css'` dentro do próprio `preview.ts`, que cai no mesmo pacote
e no mesmo `index.css`. Conferido: `previa-canvas` está no CSS gerado.

Se o dono A preferir a linha junto com as outras cinco no `main.ts`, é só mover;
o `import` no `preview.ts` sai no mesmo dia.

---

## Pedido 2 — dono A (`editor/src/ui/shell.ts`): "Prévia" nasce dobrada

**Quem pede:** o mesmo.

A coluna da direita já tem cinco painéis, e "Malha" e "Exibição" nascem
dobradas justamente para a Árvore e as Propriedades terem altura de trabalho.
"Prévia" tem uma telinha de desenho e quatro camadas: aberta, ela come a
coluna inteira.

**Pedido:** acrescentar a linha ao mapa `openPanels`:

```ts
['previa', false],
```

**Contorno enquanto isso:** nenhum. O painel abre aberto.

---

## Observação — dois testes vermelhos que não são meus

`editor/testes/viewport.test.ts` falha em dois casos da ferramenta "Escalar"
("Shift keeps the proportions" e "reads the pointer in the bone axes").
São do trabalho de R7 (eixos local, pai e mundo), que está em andamento no
`viewport/`. Nenhum arquivo de `viewport/` foi tocado pelas camadas de
animação.

---

## Importar PSD (R3 / I1) — dono B

Arquivos novos: `ferramentas/src/importar/psd.ts`, `ferramentas/importar-psd.mjs`,
`editor/src/io/import-psd.ts`, `ferramentas/testes/psd.test.ts`.

### O que foi mexido fora dos meus arquivos, e por quê

Sem estas quatro linhas o item de menu não existe, e o requisito R3 pede um
item de menu. Todas são acréscimos, nenhuma troca nada que já estava lá.

1. `editor/src/ui/menus.ts` — `'importar-psd'` no tipo `FileAction`, e a
   entrada `{ label: 'Importar PSD…', action: 'importar-psd', enabled: true }`
   logo depois de "Importar de outro programa…".
2. `editor/src/ui/shell.ts` — `import { importPsd } from '../io/import-psd.js'`,
   a linha `'importar-psd': () => this.importPsdFile()` no mapa `fileRuns`, e o
   método `importPsdFile()`, que é uma cópia do formato de `importPictures()`.
3. `package.json` — o script `"importar-psd": "node ferramentas/importar-psd.mjs"`.

Se o dono A preferir escrever essas linhas de outro jeito, `importPsd(doc)` é a
única função que o menu precisa chamar; ela devolve `null` quando o usuário
cancela e joga um erro em português quando o arquivo não serve.

### Pedido de verdade — um atlas só, em vez de dois

`io/import-images.ts` guarda os pixels importados num `WeakMap` privado
(`stores`), que é o que faz "Reempacotar atlas" funcionar. Esse mapa não é
exportado, então "Importar PSD" empacota num atlas próprio e chama
`setAssets` com ele — ou seja, num documento que já tinha imagens importadas,
o atlas do PSD **substitui** o atlas das imagens.

**Pedido:** exportar de `io/import-images.ts` duas funções pequenas:

```ts
/** Acrescenta itens ao acervo do documento, sem empacotar nem criar comando. */
export function addImportedItems(doc: EditorDoc, items: readonly PackerItem[]): void;
/** Os itens que o documento tem hoje, para empacotar tudo de uma vez. */
export function importedItems(doc: EditorDoc): PackerItem[];
```

Com essas duas, "Importar PSD" põe as camadas no mesmo acervo e empacota uma
página só — e "Reempacotar atlas" passa a valer para o PSD também.

**Contorno enquanto isso:** o PSD tem atlas próprio. Quem importar imagens
soltas e depois um PSD no mesmo arquivo perde o atlas das imagens (basta
desfazer com Ctrl+Z).

### Documentação, para quem cuida do manual

O capítulo de importação e o `editor/README.md` ainda não citam "Importar PSD…"
nem `npm run importar-psd`. Os dois são de outro dono; ficam anotados aqui.

---

## Do lote "eixos e chaves" (dono C), 08/09/2026

### Para quem cuida do runtime: `appliedFromWorld` não fecha o ciclo com shear

**Onde:** `runtime/src/skeleton.ts`, `Bone.updateAppliedTransform`, e a §5.5 da
especificação (`appliedFromWorld`).

**O que foi medido.** A compensação do R7 precisa da volta exata: dada a matriz
de mundo que um osso tem que manter e a matriz nova do pai, qual é a pose local.
Portada palavra por palavra da §5.5, a volta **não** reproduz a matriz sempre
que existe qualquer shear. A conta:

Na ida (§5.4), com `shearX = 0`, as duas colunas da parte linear local são

```
coluna 1 = scaleX · (cos r, sin r)
coluna 2 = scaleY · (cos(r + 90 + shearY), sin(r + 90 + shearY))
```

`scaleY` é o **comprimento da segunda coluna**. Mas a §5.5 devolve
`scaleY = det / scaleX`, que é o comprimento da **projeção perpendicular** da
segunda coluna sobre a primeira — mais curto pelo fator `cos(shearY)` sempre que
as duas colunas não são perpendiculares. Regravar a pose devolve, então, uma
matriz diferente da que entrou, pelo mesmo fator.

Com um osso de `shearX = 20°` a diferença medida foi de cerca de 6% na segunda
coluna. Reproduz-se com `editor/testes/eixos-e-chaves.test.ts`, no caso
"localFromWorld desfaz a passada 5.4".

**A volta exata**, com `ψ = atan2(Rd, Rb)`:

```
scaleX   = |(Ra, Rc)|                rotation = atan2(Rc, Ra)
scaleY   =  |(Rb, Rd)|               shearY   = ψ − rotation − 90     se det ≥ 0
scaleY   = −|(Rb, Rd)|               shearY   = ψ − rotation + 90     se det < 0
```

Os quatro parâmetros (`rotation`, `scaleX`, `scaleY`, `shearY`) chegam para
qualquer matriz 2×2, então a decomposição **pode** ser exata; a fórmula da §5.5
é que perde a informação.

**Consequência, se confirmado.** Toda regra que chama `appliedFromWorld` —
transformar, caminho e física (§5.6, §6.3, §6.4, §6.5) — acumula esse erro num
osso com shear. Isso encosta na decisão 6 do `ESTADO.md` (conferir as fórmulas
portadas contra o runtime de referência em C++) e no ponto do sinal do `shearY`
na raiz (dúvida 10). **Não mexi no runtime**: é arquivo de outro dono e mudar
`appliedFromWorld` mexe em casos de conformidade.

**O que o editor faz enquanto isso.** `editor/src/viewport/tools/compensate.ts`
tem a sua própria `localFromWorld`, com a fórmula exata acima e o comentário
explicando por que ela não é a §5.5 palavra por palavra.

### Para quem cuida do contrato: `BoneKey` ganhou `shearX` e `shearY`

`editor/src/viewport/tools/select.ts` passou a aceitar as duas inclinações. A
compensação precisa delas: segurar um filho parado enquanto o pai é escalado
torto exige um shear, e a §5.5 sempre decompõe com `shearX = 0`, então quem tinha
shearX precisa perdê-lo. Nada fora de `viewport/tools/` foi tocado.

### Para quem cuida do manual

Faltam no manual e no `editor/README.md`:

- o seletor **Eixos: Local · Pai · Mundo** na barra do viewport;
- as três caixas de **Compensar**: "Não mexer nos filhos", "Não mexer nos
  desenhos", "Não mexer nas caixas" (as duas últimas só valem em Montagem —
  desenho não tem linha de tempo que carregue a posição dele);
- a segunda barra da Linha do tempo: **Esticar seleção** com campo de fator,
  **Espelhar no tempo**, **Fechar ciclo**, e **Espelhar esquerda e direita** com
  o campo **Pares**;
- os campos **Cor do osso** e **Ícone** no painel Propriedades.
