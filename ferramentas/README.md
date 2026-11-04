# `ferramentas/` — as ferramentas de linha de comando

Tudo aqui roda com `node`, sem dependência nenhuma além do que já está em
`node_modules` (Ajv, só no validador).

Cada ferramenta tem um atalho no `package.json`. Os dois jeitos dão o mesmo
resultado:

```bash
npm run validar -- --todos
node ferramentas/validador/validar.mjs --todos
```

Com `npm run`, as opções vêm depois de `--`. Sem ele, não.

---

## As onze ferramentas

| Ferramenta | Atalho | O que faz |
|:---|:---|:---|
| `validador/validar.mjs` | `npm run validar` | Confere um `.bone`, `.atlas.json` ou manifesto contra o esquema. |
| `importar.mjs` | `npm run importar` | Traz um arquivo do Spine, DragonBones ou Spriter. |
| `importar-psd.mjs` | `npm run importar-psd` | Traz um `.psd` ou `.psb` em camadas do Photoshop. |
| `empacotar.mjs` | `npm run empacotar` | Junta um monte de PNG numa página de atlas. |
| `converter.mjs` | `npm run converter` | Troca entre as três embalagens: `.bone`, `.boneb` e `.bonez`. |
| `exportar.mjs` | `npm run exportar` | Grava glTF (`.glb` ou `.gltf`). |
| `exportar-imagem.mjs` | `npm run exportar-imagem` | Grava PNG, sequência de PNG, folha de sprites ou GIF. |
| `fatiar.mjs` | `npm run fatiar` | Corta o arquivo por pele, por animação ou por pasta de slot. |
| `render-png.mjs` | — | Grava um PNG de um quadro, sem navegador. |
| `conformidade.mjs` | `npm run conformidade` | Roda os 46 casos da suíte. |
| `comparar-runtimes.mjs` | `npm run conformidade:dois` | Põe os dois runtimes frente a frente, campo por campo. |

Toda ferramenta responde `--ajuda` com a lista completa de opções. É a fonte
que vale: esta tabela é o mapa, não o manual.

---

## Exemplos que rodam como estão

Copie e cole. Todos usam o herói de exemplo, que já está no projeto.

**Validar os cinco exemplos**

```bash
node ferramentas/validador/validar.mjs --todos
```

**Desenhar um quadro**

```bash
node ferramentas/render-png.mjs formato/exemplos/heroi.bone walk 0.5 saida.png
```

Sem o primeiro argumento ele usa `formato/exemplos/heroi.bone` e avisa.

**Trocar de embalagem**

```bash
node ferramentas/converter.mjs formato/exemplos/heroi.bone saida.boneb
node ferramentas/converter.mjs formato/exemplos/heroi.bone saida.bonez
```

**Exportar glTF**

```bash
node ferramentas/exportar.mjs formato/exemplos/heroi.bone saida.glb
```

**Exportar um GIF**

```bash
node ferramentas/exportar-imagem.mjs formato/exemplos/heroi.bone walk saida --formato gif --fps 20
```

**Fatiar por pasta de slot**

```bash
node ferramentas/fatiar.mjs formato/exemplos/heroi.bone saida.bone --pasta capa
```

O fatiador lê `.bone` e `.boneb`. Para um `.bonez`, converta antes com
`npm run converter`.

**Rodar a conformidade, nos dois runtimes**

```bash
node ferramentas/conformidade.mjs
python runtime-python/conformidade.py
node ferramentas/comparar-runtimes.mjs
```

---

## O que tem dentro

```
ferramentas/
  validador/        o validador de esquema, e o esquema compilado
  src/              o código TypeScript que as ferramentas .mjs usam
    conformidade/   o pose dump da §12.4
    importar/       Spine, DragonBones, Spriter e PSD
    ...
  testes/           os testes das ferramentas
    exemplos-de-fora/  arquivos de outros programas, para os importadores
  visualizador/     um tocador em Canvas, para abrir por servidor
  dist/             saída compilada, gerada; pode apagar
  versao.py         a versão do formato, para o runtime de Python
```

`dist/` é **gerado**. O `conformidade.mjs` recompila sozinho quando algum
`.ts` do runtime fica mais novo que a saída. Apagar a pasta não quebra nada.

---

## O visualizador

Um tocador em Canvas 2D, com botões para ossos, caixas de colisão, malha e
recorte. Tem que ser aberto **por servidor**: o navegador bloqueia a leitura
do `.bone` num arquivo aberto direto.

```bash
npx tsc -p ferramentas/visualizador/tsconfig.json
python -m http.server 8000
```

Depois abra `http://localhost:8000/ferramentas/visualizador/`.

---

## Onde ficam as outras coisas

| Assunto | Onde |
|:---|:---|
| O que cada comando faz, com todas as opções | [`../README.md`](../README.md) |
| O portão que toda mudança tem que passar | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| A suíte de conformidade e como um runtime prova conformidade | [`../conformidade/README.md`](../conformidade/README.md) |
| O manual do usuário | [`../documentos/manual/README.md`](../documentos/manual/README.md) |
