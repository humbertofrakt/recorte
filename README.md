# Recorte

Animação 2D por ossos para jogos, com **formato de arquivo aberto**.

O PDF virou padrão porque o formato é aberto, estável e qualquer programa lê.
O glTF fez o mesmo pelo 3D. Não existe equivalente para animação 2D por ossos:
Spine, DragonBones, Live2D e Creature usam formato próprio e fechado.

É esse buraco que o Recorte preenche.

> **O padrão é o arquivo, não o programa.**
> O programa é só a melhor forma de criar esse arquivo.

---

## O que tem aqui

| Pasta | O que é |
|:---|:---|
| `formato/` | A especificação do formato `.bone`, o JSON Schema e os exemplos. É o coração do projeto. |
| `runtime/` | Biblioteca de referência em TypeScript que lê um `.bone` e calcula a pose a cada quadro. |
| `runtime-python/` | **Segundo runtime**, em Python, escrito a partir do texto da especificação, sem olhar o primeiro. Só biblioteca padrão. |
| `site/` | A página inicial e o **validador na web**: arraste um arquivo e veja o veredito. Estático, sem servidor. |
| `editor/` | O programa de animação. Roda no navegador. |
| `ferramentas/` | Validador, gerador de imagem e utilitários de linha de comando. |
| `documentos/` | Manual de uso, pesquisa e notas de desenvolvimento. |
| `conformidade/` | A suíte de casos que qualquer runtime pode rodar. O guia de quem escreve um runtime está em [`conformidade/como-provar-conformidade.md`](conformidade/como-provar-conformidade.md), e em inglês em [`conformidade/how-to-prove-conformance.md`](conformidade/how-to-prove-conformance.md). |
| `programa/` | O editor **montado**, pronto para abrir com dois cliques. Veja `programa/LEIA-ME.txt`. |
| `contribuição/` | Assinaturas de quem trabalhou nas rodadas. |
| `backup/` | Versões guardadas. Veja `backup/INDICE.md`. |

`ESTADO.md` diz, numa página, onde o projeto está hoje.
O manual de requisitos está em `documentos/MANUAL DE REQUISITOS 2026-09-06.md`.
`CLAUDE.md` tem as regras da casa e a lista das pastas, para quem chega agora.

---

## O manual

O manual de uso está em `documentos/manual/`. No editor ele abre pelo menu
**Ajuda → Manual**.

| # | Capítulo | Para quê |
|:---:|:---|:---|
| 1 | `01-comecar.md` | O que é o Recorte. O primeiro personagem em dez passos. |
| 2 | `02-montar-personagem.md` | Imagens, ossos, ordem de desenho, peles. |
| 3 | `03-animar.md` | Os dois modos, chaves, linha do tempo, curvas, casca de cebola. |
| 4 | `04-malha-e-pesos.md` | Quando dobrar o desenho por dentro. Como pintar peso. |
| 5 | `05-constraints.md` | IK, transformar, caminho, física e comando. |
| 6 | `06-exportar-e-usar-no-jogo.md` | As três embalagens. Código que roda. |
| 7 | `07-vindo-de-outro-programa.md` | Spine, DragonBones e Spriter. |
| 8 | `08-perguntas.md` | Licença, preço e outras dúvidas. |

---

## As três extensões

| Extensão | O que é |
|:---|:---|
| `.bone` | JSON legível. Abre em qualquer editor de texto. |
| `.boneb` | Binário compacto, mesmo modelo de dados. Para o jogo carregar rápido. |
| `.bonez` | Pacote ZIP com o `.bone`, o atlas e as imagens juntos. |

---

## Comandos

Instalar (uma vez):

```bash
npm install
```

Abrir o editor:

```bash
npm run editor
```

Rodar os testes:

```bash
npm test
```

Validar um arquivo. O validador conhece os três tipos e escolhe pelo nome:
`.bone` é esqueleto, `.atlas.json` é atlas, `manifest.json` é manifesto.

```bash
npm run validar meu-personagem.bone
npm run validar meu-personagem.atlas.json
npm run validar -- --todos
```

Gerar uma imagem de um quadro da animação, sem abrir navegador:

```bash
node ferramentas/render-png.mjs formato/exemplos/heroi.bone walk 0.5 saida.png
node ferramentas/render-png.mjs formato/exemplos/heroi.bone walk 0.5 saida.png --largura 320 --sem-ossos
```

| Argumento | Para quê |
|:---|:---|
| `esqueleto` | O `.bone`, `.boneb` ou `.bonez`. Sem ele, usa `formato/exemplos/heroi.bone` e diz qual usou. |
| `animação` | Nome da animação. `-` desenha a pose de montagem. |
| `tempo` | Segundos dentro da animação. |
| `saída` | O `.png` a gravar. |
| `--largura N` | Largura da imagem em pixels. A altura acompanha. |
| `--sem-ossos` | Não desenha os ossos por cima, só o desenho. |

Rodar a suíte de conformidade (46 casos: A, B, C, X, BIN e ZIP):

```bash
npm run conformidade
npm run conformidade -- --json
npm run conformidade -- --adaptador ./meu-runtime.mjs
```

---

## Dois runtimes, e o que isso prova

Um formato com **um** runtime só não é um formato: é um programa. E uma suíte
de conformidade que só rodou contra o runtime que a gerou prova que o runtime
concorda consigo mesmo.

O `.bone` tem dois.

| | Runtime de referência | Segundo runtime |
|:---|:---|:---|
| Linguagem | TypeScript | Python 3.12 |
| Onde | `runtime/` | `runtime-python/` |
| Escrito a partir de | a spec e o porte do Spine 4.2 | **só o texto da spec**, sem abrir o outro |
| Dependências | nenhuma | nenhuma |
| Conformidade | 53 de 53, nível C | 53 de 53, nível C |

```bash
npm run conformidade            # o de TypeScript
npm run conformidade:python     # o de Python
npm run conformidade:dois       # os dois frente a frente, campo por campo
```

O terceiro comando é o que importa. A suíte compara cada runtime com o
`esperado.json`, e por isso **não vê** um campo que um runtime escreve e o
outro omite. O confronto compara os dois dumps inteiros.

Na primeira rodada, **10 dos 39 casos divergiam — e os dois passavam em 39 de
39.** Foram seis divergências no total. Duas eram erro de runtime, quatro eram
buraco na especificação. Uma delas: os dois solvers de curva, os dois
obedecendo ao texto ao pé da letra, divergiam **8,5e-5** contra uma tolerância
de `1e-4`.

Treze correções entraram na especificação por causa disso. O relatório
completo, com a tabela dos dois lado a lado e o veredito de cada divergência,
está em **[`conformidade/dois-runtimes.md`](conformidade/dois-runtimes.md)**.

---

## Validador na web

Arraste um arquivo numa página e veja o veredito. Sem instalar nada, sem
servidor, sem rede: o arquivo é lido dentro do navegador e não sai do seu
computador.

```bash
npm run site      # http://localhost:5174/site/
```

| Página | O que faz |
|:---|:---|
| `site/index.html` | A página inicial do formato. |
| `site/validador/index.html` | Arraste `.bone`, `.boneb`, `.bonez` ou `.atlas.json`. |

Ela mostra o veredito, a lista de problemas com **linha do arquivo, ponteiro
JSON e seção da especificação**, a ficha do conteúdo, oito contas, a lista de
recursos que o arquivo usa, e o **esqueleto desenhado**, com as animações e
botão de tocar. A embalagem é decidida pelos bytes, nunca pelo nome.

A página e a linha de comando dizem a mesma coisa, e 30 testes provam isso
arquivo por arquivo, inclusive num lote de 21 defeitos plantados um a um.

---

## Exportar para glTF

glTF é o formato que Blender, three.js, Babylon, Godot e Unity já leem. Sai um
arquivo só (`.glb`) ou o JSON (`.gltf`) com um `.bin` ao lado.

```bash
npm run exportar -- heroi.bone saida.glb
npm run exportar -- heroi.bone saida.gltf --formato gltf
npm run exportar -- heroi.bonez saida.glb --animacoes walk,attack
```

| Opção | Para quê |
|:---|:---|
| `--formato gltf\|glb` | Força o formato. Padrão: pela extensão da saída. |
| `--animacoes LISTA` | Só estas animações, separadas por vírgula. |
| `--peles LISTA` | Peles ativas na pose de setup. Padrão: só a `default`. |
| `--sem-imagens` | Não põe as imagens das páginas dentro do arquivo. |
| `--passo-z N` | Distância no eixo z entre dois desenhos. Padrão 0,1. |
| `--quadros N` | Amostras por segundo ao converter curva Bezier. |

glTF não tem constraint, ordem de desenho nem cisalhamento. Cada coisa que não
cabe vira um aviso em português, na saída do comando e na janela do editor.

No editor o mesmo caminho é **Arquivo → Exportar glTF…**.

---

## Exportar imagem: sequência, folha de sprites e GIF

Três saídas, todas sem dependência nenhuma:

| Formato | O que sai |
|:---|:---|
| `png` | Um arquivo por quadro, numerado: `walk_0000.png`, `walk_0001.png`, … |
| `folha` | Uma imagem com a grade dos quadros, mais o JSON de índice ao lado. |
| `gif` | Um GIF animado, com atraso por quadro e laço. |

```bash
npm run exportar-imagem -- heroi.bone walk saida --formato gif --fps 30
npm run exportar-imagem -- heroi.bone walk saida --formato folha --colunas 8
npm run exportar-imagem -- heroi.bone walk saida --formato png --escala 2
npm run exportar-imagem -- heroi.bone --todas saida --formato gif
```

| Opção | Para quê |
|:---|:---|
| `--formato png\|folha\|gif` | Qual das três saídas. Padrão: `png`. |
| `--fps N` | Quadros por segundo. Padrão: 30. |
| `--escala N` | Pixels por unidade de mundo. Padrão: 1. |
| `--largura N` | Largura em pixels. Manda mais que `--escala`. |
| `--margem F` | Folga em volta do desenho. Padrão: 0,12. |
| `--fundo RRGGBB` | Cor de fundo opaca. Padrão: transparente. |
| `--sem-recorte` | Não corta a borda vazia. O padrão é cortar. |
| `--de N` / `--ate N` | Trecho da animação, em segundos. |
| `--todas` | Exporta todas as animações do arquivo. |
| `--colunas N` | Quadros por linha na folha de sprites. |
| `--cores N` | Cores do GIF, no máximo 256. Padrão: 256. |
| `--laco N` | Quantas vezes o GIF repete. 0 = para sempre. |
| `--com-ossos` | Desenha também as linhas dos ossos. |

O JSON da folha diz onde cada quadro está, para um carregador não ter que
adivinhar a grade:

```json
{
  "image": "walk.png",
  "animation": "walk",
  "fps": 30,
  "count": 30,
  "columns": 6,
  "rows": 5,
  "frameWidth": 128,
  "frameHeight": 192,
  "padding": 0,
  "frames": [{ "index": 0, "time": 0, "x": 0, "y": 0, "width": 128, "height": 192 }]
}
```

No editor o mesmo caminho é **Arquivo → Exportar imagem…**, com uma janela de
opções e barra de andamento.

### Vídeo (MP4, AVI): a saída é o GIF e a sequência de PNG

**Não sai MP4 daqui, e não é esquecimento.** Um codificador de vídeo não cabe
sem dependência, e este projeto não tem nenhuma — nem em JavaScript, nem em
Python. A saída de vídeo do Recorte é o **GIF** e a **sequência de PNG**.

Para virar MP4, passe a sequência para uma ferramenta de fora. O comando está
pronto, e a própria exportação o escreve na tela ao terminar:

```bash
npm run exportar-imagem -- heroi.bone walk quadro --formato png --fps 30
ffmpeg -framerate 30 -i quadro_%04d.png -c:v libx264 -pix_fmt yuv420p saida.mp4
```

---

## Trazer trabalho de outro programa

Converte um projeto de **Spine**, **DragonBones** ou **Spriter** para `.bone`.
O formato de origem é descoberto sozinho, pelo conteúdo do arquivo.

O `--` depois do nome do script é obrigatório quando há opções: sem ele o npm
come as opções antes de o programa vê-las.

O primeiro comando abaixo roda **como está**: os três arquivos que ele usa
acompanham o projeto, em `ferramentas/testes/exemplos-de-fora/`. Os outros dois
usam nomes genéricos — troque pelos seus.

```bash
npm run importar -- ferramentas/testes/exemplos-de-fora/heroi-spine.json heroi.bone   --atlas ferramentas/testes/exemplos-de-fora/heroi.atlas
npm run importar boneco_ske.json boneco.bone
npm run importar -- boneco.scml boneco.bone --relatorio avisos.txt
```

Sem `--atlas`, um projeto do Spine ainda importa: as regiões saem sem recorte, e
o programa avisa isso em português.

| Opção | Para quê |
|:---|:---|
| `--atlas <arquivo>` | O atlas de origem: `.atlas` de texto do Spine, `.json` do DragonBones. |
| `--formato <nome>` | Força o formato: `spine`, `dragonbones` ou `spriter`. |
| `--relatorio <arquivo>` | Grava os avisos também num arquivo de texto. |
| `--sem-validar` | Não chama o validador no fim. |

O que não veio igual sai em avisos, em português, um por linha. No fim ele
valida a saída sozinho.

### Trazer a arte de um PSD

Um `.psd` ou `.psb` **em camadas**, do Photoshop, entra direto — cada camada
vira um slot **na posição em que ela estava na tela**, que é justamente o que se
perde ao exportar PNG por PNG.

```bash
npm run importar-psd -- personagem.psd saida
```

Saem `saida.bone`, `saida.atlas.json` e `saida.png`. No editor, o mesmo está em
**Arquivo → Importar PSD…**, num passo de desfazer.

---

## Empacotar imagens soltas num atlas

Pega uma pasta de PNGs e devolve `saida.atlas.json` mais `saida.png`.

```bash
npm run empacotar imagens/ heroi
npm run empacotar imagens/ heroi -- --pot --max 1024
npm run empacotar imagens/ heroi -- --escala 1,0.5
```

| Opção | Para quê |
|:---|:---|
| `--max N` | Lado maior da página, em pixels. Padrão 2048. |
| `--padding N` | Espaço entre as imagens. Padrão 2. |
| `--sangria N` | Pixels de borda duplicada. Padrão: metade do padding. |
| `--pot` | Lados da página em potência de dois. |
| `--quadrado` | Página quadrada. |
| `--escala LISTA` | Uma ou mais escalas, separadas por vírgula: um atlas por resolução. |
| `--premultiplicado` | Grava a página com alfa pré-multiplicado. |
| `--sem-rotacao` | Não gira nenhuma imagem 90 graus. |
| `--sem-corte` | Não corta a borda transparente. |
| `--sem-apelidos` | Não junta imagens iguais numa região só. |

Ele corta a borda transparente, gira o que couber melhor deitado e junta
imagens idênticas numa região com apelido. O resumo sai em colunas alinhadas.

---

## Converter entre os três encodings

O mesmo esqueleto, em outra embalagem. A direção é escolhida pela extensão.

```bash
npm run converter heroi.bone heroi.boneb           # texto  -> binário
npm run converter heroi.boneb heroi.bone           # binário -> texto
npm run converter heroi.bone heroi.bonez           # texto  -> pacote
npm run converter heroi.bonez heroi.bone -- --validar
```

Com `--validar` ele relê a saída, compara com a entrada e chama o validador.
Voltando do binário para o texto, cada número é escrito na forma mais curta
que devolve o **mesmo** float de 32 bits: `0.6` volta como `0.6`.

O pacote `.bonez` leva o esqueleto, o atlas e as imagens das páginas juntos.

---

## Ler qualquer um dos três, no jogo

O runtime tem uma porta de entrada só. Ela olha os primeiros bytes e resolve:

```js
import { loadSkeletonFile } from './ferramentas/visualizador/dist/index.js';
import { inflateRawSync } from 'node:zlib';

const { data, encoding, atlases } = loadSkeletonFile(bytes, {
  codec: { inflateRaw: (d) => inflateRawSync(d) },
});
```

O `dist/` é gerado por `npx tsc -p ferramentas/visualizador/tsconfig.json`. O
runtime é escrito em TypeScript, e `import './runtime/src/file.js'` **não**
funciona: o Node não troca `.js` por `.ts` sozinho. Um exemplo inteiro, que
roda como está, está em
[`documentos/manual/06-exportar-e-usar-no-jogo.md`](documentos/manual/06-exportar-e-usar-no-jogo.md).

Num `.bonez` ela ainda acha o atlas dentro do pacote e resolve os caminhos pela
regra da §2.8 — a pasta do esqueleto principal dentro do ZIP.

---

## Regras que o projeto se impôs

Cada uma corrige um erro que travou um concorrente.

1. **O runtime nunca depende de licença do editor.** Qualquer pessoa usa, sem comprar nada.
2. **Nada de recurso básico pago.** Ossos com peso, malha e IK são o mínimo, não são "profissional".
3. **Arquivo velho sempre abre em programa novo.** Nunca exigir reexportar.
4. **Leitor ignora o que não conhece.** Propriedade desconhecida não quebra a leitura.
5. **Tudo que o editor faz cabe no arquivo.** O documento do editor é o próprio `.bone`.

---

## Licença

Duas licenças, e este é o mapa de qual arquivo está sob qual:

| Parte | Licença | Arquivo |
|:---|:---|:---|
| `runtime/`, `editor/`, `ferramentas/` — o código | Apache License 2.0 | [`LICENSE`](LICENSE) |
| `formato/` — especificação, JSON Schema e exemplos | CC BY 4.0 | [`formato/LICENSE`](formato/LICENSE) |
| `conformidade/` — a suíte, os casos e o guia | CC BY 4.0 | [`formato/LICENSE`](formato/LICENSE) |
| `documentos/manual/` — o manual do usuário | CC BY 4.0 | [`formato/LICENSE`](formato/LICENSE) |

O resumo de quem é o quê está em [`NOTICE`](NOTICE). Todo `.ts` e `.mjs` de
`runtime/` e `ferramentas/` traz `SPDX-License-Identifier: Apache-2.0` na
primeira linha.

Uso comercial livre, sem royalties. A **cláusula 3 da Apache 2.0** é uma
outorga expressa de patente: é ela que faz o jurídico de um estúdio conseguir
aprovar o uso sem escrever contrato, e é por isso que o código não está sob
MIT.

---

## Contribuir, e onde abrir uma issue

[`CONTRIBUTING.md`](CONTRIBUTING.md) diz como propor uma mudança no formato,
como escrever um caso de conformidade e qual é o portão que toda mudança de
código passa. As mudanças por versão ficam em
[`CHANGELOG.md`](CHANGELOG.md).

**O repositório público ainda não existe** — é o requisito C4, e é o buraco
mais sério que o projeto tem em aberto. Enquanto ele não existir, os cinco
lugares que mandam "abra uma issue" não têm para onde apontar. Está anotado em
[`ESTADO.md`](ESTADO.md).
