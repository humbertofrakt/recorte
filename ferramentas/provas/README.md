# ferramentas/provas/

Os scripts que provam que o programa faz o que diz. Cada um sobe o próprio
servidor do editor e um Chrome sem janela, com um perfil novo.

| Script | Comando | Prova |
|:---|:---|:---|
| `roteiro-30.mjs` | `npm run roteiro` | Os 14 passos do Roteiro dos 30 minutos, com gestos de verdade. `--fotos <pasta>` guarda uma foto por passo |
| `medir-paineis.mjs` | `npm run medir` | Nenhuma aba passa da coluna, em 1440×900 e 1280×720. `--fotos <pasta>` guarda uma foto por aba (as fotos saem iguais byte a byte de uma rodada para a outra) |
| `conferir-editor.mjs` | `node ferramentas/provas/conferir-editor.mjs %TEMP%/perfil tela.png` | Toca a animação, mede quadros, lê o console e tira a foto. Precisa do `npm run editor` ligado |
| `fotos-manual.mjs` | `node ferramentas/provas/fotos-manual.mjs %TEMP%/perfil` | As fotos do manual, em `documentos/manual/imagens/`. O manual está pausado |

Moravam em `documentos/notas-de-desenvolvimento/` até o lote A7.
