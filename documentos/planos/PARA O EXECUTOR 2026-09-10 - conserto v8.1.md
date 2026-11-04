# Para o executor — conserto v8.1, 10/09/2026

Um chat que **não** era o executor consertou dois pedidos do Humberto e guardou
como **v8.1**. O Humberto liberou o que foi feito, e mandou: o que ficou
pendente vai para o executor. Este é o recado.

## O que já está feito (v8.1, não refazer)

| Pedido | O que mudou | Onde |
|:---|:---|:---|
| "Quando arrasto uma imagem para dentro as peças quebram" | O pacote importado entra **ao lado** dos atlas do arquivo, e não no lugar deles (`mergedAssets`). Vale em Importar imagens e no PSD | `editor/src/io/import-images.ts`, `import-psd.ts` |
| Nome do pacote | Nunca leva o nome de um atlas alheio: `heroi-imagens.atlas.json`, depois `heroi-imagens2` | `baseNameOf`, em `import-images.ts` |
| "E se o programa já começasse na primeira animação?" | `setFile` abre a primeira animação, em Animando. A lembrada no `RECORTE_editor_state` ganha se existir; sem animação, Montagem | `editor/src/doc/document.ts`, `openFirstAnimation` |
| Provas | 12 testes novos, 2.307 no total, 53/53, tsc limpo. `programa/` montado de novo | `editor/testes/conserto-atlas-e-primeira-animacao.test.ts` |

## O que ficou pendente

| # | Pendência | Por quê |
|:---:|:---|:---|
| 1 | **`ESTADO.md` não ganhou a linha da v8.1.** Falta a linha na tabela de versões e a contagem de testes (2.307) | Não foi escrito para não colidir com o lote 55, que estava em andamento |
| 2 | **Número de versão.** O lote 55 reservou v8.0; a v8.1 já está tomada por este conserto. Os lotes 50 a 52 pegam o próximo livre | O `versao.py` recusa número repetido; conferir o `INDICE.md` antes |
| 3 | **Em Animando as ferramentas de estrutura somem** (Criar osso, Ponto, Caixa). Como o programa agora **abre** em Animando, quem abre o herói não vê essas ferramentas até apertar `Ctrl+Tab` | O lote 57 do `PLANO pivô e Animando` já libera isso. Só ficou mais urgente |
| 4 | **Arquivo salvo e reaberto acumula pacotes**: `heroi-imagens`, `heroi-imagens2`, um por sessão de importação, porque ao reabrir o acervo em memória está vazio e todo atlas do disco é "alheio" | Funciona e não perde nada. Se incomodar: "Reempacotar atlas" poderia juntar os pacotes do próprio editor num só. Decidir com o Humberto |
| 5 | **Manual**: caps. 0 e 4 dizem que o programa abre na Montagem; cap. 1 fala de soltar imagem | Regra 11: só quando o Humberto pedir |

Cópias de antes: `backup/*_2026-09-10_antes-do-lote-49.*`, listadas no `INDICE.md`.
