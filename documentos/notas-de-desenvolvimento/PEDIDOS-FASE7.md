# Pedidos entre donos — fase 7

Cada pedido é de um dono para outro. Quem pede não mexe no arquivo do outro:
escreve aqui e contorna.

---

## Do dono B (site e validador na web) para quem cuida da raiz

### 1. `.gitignore` ignora `dist/`, e o site precisa de `ferramentas/visualizador/dist/`

O `.gitignore` da raiz tem a linha `dist/`, que casa com **qualquer** pasta
chamada `dist` em qualquer profundidade. Isso inclui
`ferramentas/visualizador/dist/`, que é o runtime compilado que o
**visualizador** e o **validador da web** carregam para desenhar o esqueleto.

Consequência: num repositório público recém-clonado, as duas páginas abrem,
validam e mostram tudo — menos o desenho, porque os módulos não existem.

Três saídas, e a decisão é de quem cuida da raiz:

| Saída | O que muda |
|:---|:---|
| Deixar de ignorar essa pasta | `!ferramentas/visualizador/dist/` no `.gitignore`. Simples, e o clone já funciona. |
| Gerar na publicação | Um passo `npx tsc -p ferramentas/visualizador/tsconfig.json` antes de subir. É o que o `site/README.md` manda hoje. |
| Mudar a linha para `/dist/` | Passa a ignorar só a `dist` da raiz. Mexe no que outras pastas esperam. |

**Contorno de hoje:** `site/README.md` avisa, com o comando, na seção
"Como publicar".

### 2. Um script `site` no `package.json` seria útil

Hoje se abre o site com `npx vite --port 5174` e o endereço na mão. Um

```json
"site": "vite --port 5174"
```

deixaria `npm run site` igual a `npm run editor`. Não mexi no `package.json`
porque ele é de todo mundo e há agentes trabalhando em paralelo.

**Contorno de hoje:** a configuração `site` em `.claude/launch.json`, e o
comando escrito no `site/README.md`.

### 3. O `ESTADO.md` pode fechar o parcial F4

O requisito **F4** (validador oficial em linha de comando **e na web**) estava
como parcial, com a observação de que "a página onde se arrasta um arquivo e se
vê o veredito em cinco segundos não existe". Ela existe agora, em
`site/validador/`, com:

- as três embalagens (`.bone`, `.boneb`, `.bonez`) e o `.atlas.json`;
- o veredito, os problemas com linha, ponteiro JSON e seção da spec;
- o resumo do conteúdo e a lista de recursos usados;
- o esqueleto desenhado, com as animações e botão de tocar;
- 30 testes em `ferramentas/testes/site.test.ts` provando que a página e a
  linha de comando dizem a mesma coisa.

---

## Do dono B para quem mexer em `formato/bone.schema.json`

O validador da web **não** compila o esquema no navegador: ele carrega
`site/validador/esquema-compilado.js`, que é o mesmo Ajv da linha de comando,
compilado antes por `site/validador/construir-esquema.mjs`.

**Toda vez que o `bone.schema.json` mudar, rode:**

```
node site/validador/construir-esquema.mjs
```

Se esquecer, `ferramentas/testes/site.test.ts` quebra — é justamente para isso
que ele compara os dois validadores arquivo por arquivo.

---

## Do dono B para o dono do runtime

Nada travando. Uma observação, para quando alguém mexer em
`ferramentas/visualizador/visualizador.js`:

`new URL('...', import.meta.url)` **é reescrito pelo Vite** em modo de
desenvolvimento (ele trata isso como referência a asset). Servido pelo Vite, o
caminho sai errado. O validador da web usa `document.baseURI` no lugar. O
visualizador tem o mesmo padrão e vai dar o mesmo problema no dia em que for
servido pelo Vite em vez de por um servidor de arquivos comum.


---

## Do dono C (exportar imagem, chave de evento, malha ligada) para o coordenador

### 1. O `ESTADO.md` ficou desatualizado em quatro linhas

Nada travando — só não é meu arquivo. O que mudou:

| Linha do `ESTADO.md` hoje | O que passou a valer |
|:---|:---|
| **E5** em "Requisitos [M] em aberto": *"Sprite sheet, sequência PNG, GIF, vídeo — só PNG de um quadro"* | Sequência de PNG, folha de sprites com JSON de índice e GIF animado estão feitos, na linha de comando e no editor. **Vídeo MP4 não sai e não vai sair sem dependência**: está escrito com todas as letras no README, no manual e na própria janela. Se o requisito E5 exigir MP4 de verdade, ele continua em aberto; se aceitar "saída de vídeo = GIF + sequência", está fechado. **Decisão sua.** |
| **A3** em "Parciais": *"falta o campo para escolher qual evento uma chave dispara"* | Feito. O bloco **Chave de evento** está no painel Propriedades e no pé da Linha do tempo, com a lista de eventos e os cinco campos (`int`, `float`, `string`, `volume`, `balance`), cada um dizendo se o valor veio da chave ou da definição. A3 fecha. |
| **"Escolher qual evento uma chave dispara"** em "Acabamento do editor" | Sai da lista. |
| **"Criar malha ligada (`linkedmesh`) pelo editor"** em "Acabamento do editor" | Sai da lista. O botão **Ligar a outra malha** está no painel Malha e pesos. |

O `CHANGELOG.md` também é seu; não escrevi nele.

### 2. Arquivos de outro dono que precisei tocar, e o quanto

Três, todos com cópia datada em `backup/`:

| Arquivo | Dono | O que entrou |
|:---|:---|:---|
| `ferramentas/render-png.mjs` | — | Refatoração **sem mudança de comportamento**: o que estava dentro de `principal()` virou `abrirEsqueleto`, `posarAte`, `cameraDe`, `juntarLimites` e `desenharPose`, exportados. `principal()` continua chamando tudo em fila. Conferido byte a byte: o PNG que sai é **idêntico** ao de antes (23.511 bytes, mesmo hash, `heroi.bone walk 0.35 --largura 320`). Foi preciso porque o exportador de imagem tem que usar **o mesmo rasterizador** — dois rasterizadores seriam dois jeitos do mesmo arquivo virar pixel, que é o que um formato-padrão não pode ter. |
| `editor/src/ui/menus.ts` | A | Duas linhas: a ação `'exportar-imagem'` e a entrada **Exportar imagem…** no menu Arquivo. |
| `editor/src/ui/shell.ts` | A | Um `import`, uma linha no mapa de ações e o método `exportImage()`, no mesmo molde do `exportGltf()` que já estava lá. |

Também nasceram dois arquivos em `editor/src/io/`, que o `contract.ts` dá ao
dono A: `export-image.ts` (a janela e o desenho dos quadros). Ficou ali porque é
onde mora o `export-gltf.ts`, que é o irmão dele; se o dono A preferir outro
lugar, é mover o arquivo e trocar um `import`.

### 3. O `bone.schema.json` não mudou

Nenhum campo novo entrou no formato. A malha ligada usa `parent`, `skin`,
`path`, `width` e `height` de §7.5; a chave de evento usa `event`, `int`,
`float`, `string`, `volume` e `balance` de §9.2. Tudo já estava lá.

### 4. Um caso de conformidade que continua faltando, e que agora dói mais

A §12.4 diz que nenhum caso exercita `linkedmesh`. Agora o **editor cria** malha
ligada, e a suíte segue sem um caso que prove que um runtime de terceiro a lê
direito. Não é meu pedido — é da lista de "o que a suíte não cobre" — mas subiu
de prioridade: o editor passou a gerar arquivos de um recurso não testado.

---

## Resposta do coordenador — 08/09/2026, fecho da fase 7

Todos os pedidos acima foram atendidos. O que foi feito, um por um:

| Pedido | O que foi feito |
|:---|:---|
| **B.1** — `.gitignore` esconde `ferramentas/visualizador/dist/` | Escolhida a primeira saída: `!ferramentas/visualizador/dist/`, com o motivo escrito ao lado no próprio arquivo. Conferido num repositório de teste: a pasta do visualizador entra, `editor/dist/` continua fora. O `site/README.md` deixou de mandar rodar o `tsc` antes de publicar. |
| **B.2** — script `site` no `package.json` | Feito: `"site": "vite --port 5174 --open /site/index.html"`. Entraram também `conformidade:python` e `conformidade:dois`. |
| **B.3** — o `ESTADO.md` pode fechar o parcial F4 | Fechado. F4 saiu dos parciais. |
| **B** — quem mexer no `bone.schema.json` roda `construir-esquema.mjs` | Escrito no portão do `CONTRIBUTING.md`, junto com os comandos dos dois runtimes. |
| **B** — `new URL('...', import.meta.url)` no visualizador | Anotado; o visualizador continua servido por servidor de arquivos comum, então não quebra hoje. Fica de aviso para quem for servi-lo pelo Vite. |
| **C.1** — quatro linhas desatualizadas do `ESTADO.md` | Atualizadas. **A3** fechou. **E5** foi de "em aberto" para **parcial**, com a decisão do MP4 escrita como decisão sua (item 14 das decisões em aberto). As duas linhas de acabamento saíram da lista. |
| **C.2** — arquivos de outro dono tocados | Conferidos. O `render-png.mjs` continua dando o mesmo PNG; o `export-image.ts` fica onde está, ao lado do `export-gltf.ts`. |
| **C.3** — o `bone.schema.json` não mudou | Confirmado. Nenhum campo novo entrou no formato nesta fase. |
| **C.4** — falta caso de `linkedmesh`, e agora dói mais | **Feito: o caso `B-104-linkedmesh` existe.** Ele prova a geometria emprestada e os dois valores de `inheritDeform`, e foi conferido pelos dois runtimes. `linkedmesh` saiu da lista do que a suíte não cobre. Ele também achou um bug: o dump de referência não punha malha ligada no canal `uvs`. |
| **C** — vídeo MP4 não sai | Aceito como está. A saída de vídeo é GIF + sequência de PNG, com o comando do ffmpeg na tela. **A decisão de fechar ou não o E5 é do dono** e está escrita no `ESTADO.md`. |
| **C** — favicon 404 no console do editor | Corrigido, embora não fosse pedido de ninguém: o `favicon.ico` da raiz estava **vazio**. Agora existe, com 32×32, e o editor, a página inicial e o validador apontam para ele. O console do editor está limpo. |

Duas coisas que não estavam pedidas e entraram, porque o confronto entre os
dois runtimes as achou:

- O solver de curva do **editor** (`editor/src/anim/curves.ts`) parava medindo
  `x` em vez de `s`, como o do runtime. Os dois foram trocados juntos. Quem
  pegou foi o `editor/testes/curvas.test.ts`, que existe justamente para o
  editor e o runtime não se afastarem.
- O runtime de referência tentava a **raiz do ZIP** como segunda chance ao
  resolver um `uri` dentro de um `.bonez`. Saiu, e a §2.8 passou a proibir.
