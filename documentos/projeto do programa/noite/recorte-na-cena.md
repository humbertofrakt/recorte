# O recorte na cena (N-4b) — 05/11/2026

Ramo `obra/recorte-na-cena`, sobre `obra/noite-2026-11-04`.

## O que era

O `animation.crop` (spec 4.6) só **aparecia**: um retângulo magenta, se o arquivo já o trouxesse.
Criar ou mudar era escrever JSON à mão. Não havia botão nem menu.

## Onde achar

| Porta | O que faz |
|:---|:---|
| **Animação → Recorte na cena** (tecla **C**) | liga o modo. Sem recorte, ele nasce em volta do desenho, com 10 px de margem |
| **Animação → Tirar o recorte** | apaga o recorte; a exportação volta a cortar pela borda |
| Aba **Animações**, linha abaixo do título | *"Recorte 300 × 283 px"* ou *"Recorte: nenhum"*, com o botão do modo e a lixeira |
| Na **cena**, com o modo ligado | 8 puxadores, o meio move, fora traça um novo. O fora escurece |
| Caixa no **canto de baixo à esquerda** da cena | X, Y, L, A em px. Botão **Pronto** termina. Enter ou Esc também |

## O que fiz · como provei · o que ficou

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| O modelo puro: puxadores, arrasto, traço, o comando `SetCrop` (`viewport/crop-model.ts`) | 18 testes em `cena.test.ts`. O primeiro prova o defeito: o herói não tem recorte, e a cena não desenha nada | — |
| Cada arrasto é **um** passo de desfazer; o `revert` devolve o objeto antigo letra por letra | teste: 3 passos do arrasto + 1 → dois Ctrl+Z voltam ao começo | — |
| Os puxadores na cena, o cursor de cada um, o fora escurecido | prova no navegador, foto `03-arrastando` | — |
| A caixa dos números na cena (`viewport/crop-box.ts`) | prova: arrasta o canto, os números mudam; Ctrl+Z volta | — |
| A linha na aba Animações (`panels/animations-crop.ts`) | prova: mostra o tamanho; some com a base aberta | — |
| A exportação respeita o recorte | prova: Arquivo → Exportar → GIF com *"A área desenhada nesta animação"* sai **300 × 286**, o tamanho do recorte | — |
| Salvar e reabrir | prova: Salvar como…, Abrir projeto…, a linha diz o mesmo recorte | — |
| Base aberta: nada de palpite (regra 21) | prova: a linha some, o item do menu fica cinza | — |

**A prova no navegador só clica no que está à vista** (menus, botões, cena, teclado):
`ferramentas/provas/recorte-na-cena.mjs`. Nenhum `page.evaluate` mexe no documento;
a única leitura por dentro é a câmera, para saber onde fica o canto na tela.
Resultado: **16 de 16** (05/11, 00h33 UTC).

## Decisões (pelo Photoshop e pelo Spine)

| Decisão | Por quê |
|:---|:---|
| O recorte é um **modo** (liga e desliga), como o recorte do Photoshop | sempre ligado, o meio do retângulo roubaria o clique no osso do tronco |
| Os 4 números moram **na cena**, não na aba Animações | em 1440×900 a aba tem 145 px de altura; os números ficavam escondidos |
| Um lado puxado além do outro **para a 1 px** | virar do avesso faz a mão perder o puxador |
| Sem desenho na cena, o modo liga **sem inventar** tamanho | regra 21: o rodapé pede o traço |
| Tecla **C** | é a do recorte no Photoshop, e estava livre |

## A régua de fecho

| Prova | Resultado |
|:---|:---|
| `npx vitest run` (00h35 UTC) | 5.791 verdes, 31 pulados, 1 vermelho: o conhecido (`ajuda.test.ts`, manual). Nenhum novo |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 120 de 120 |
| `npm run medir` (antes, na base velha) | 82/90 antes e depois: nada caiu |
| `npm run roteiro` (antes, na base velha) | 14/14 antes e depois |

## Achado para outro dono (regra 28)

`cena.test.ts`, *"a ordem é a do trabalho: escolher vem antes de criar"*: passa só porque
a ferramenta Transformar **não está carregada** naquele arquivo de teste. No programa o
primeiro botão é o Transformar. Não mexi.

FIM
