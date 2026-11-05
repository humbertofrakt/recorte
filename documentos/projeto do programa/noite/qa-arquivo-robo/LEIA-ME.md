# O robô do QA do Arquivo

Usado na noite de 04/11/2026 (`../qa-arquivo.md`). Dirige o editor num
Chromium sem janela, com mouse e teclado de verdade, e liga os seletores de
arquivo do navegador a pastas **reais** do disco: o que o editor grava cai numa
pasta, e dá para rodar `npm run validar` em cima.

| Arquivo | O que passeia |
|:---|:---|
| `harness.mjs` | sobe o editor (`vite-quieto`, porta 5291 ou 5292), o Chromium, o disco de mentira, `menu()`, `rodape()`, `foto()` |
| `pA` | Novo projeto · Abrir pasta · arrastar · Salvar · Salvar como · rascunho |
| `pB` | Exportar imagem, cada formato (`node pB.mjs 1920 1080 pasta` para com pasta) |
| `pC` | PSD · PSD com ossos · Spriter (`exemplo/game`) |
| `pD` | skin: exportar, apagar, importar, trocar imagem |
| `pE` | `.bonez` e `.boneb`: salvar e reabrir |
| `pF`, `pF2`, `pF3` | partículas: fumaça, fogo, faísca; cor ao nascer; chave "Emitindo" |
| `pH` | biblioteca de animações |
| `pI`, `pI3` | soltar pasta na cena; a pasta `game` |
| `pL` | Spine pela tela; Repetir; Entregar uma base |
| `pM` | skin de uma pasta |
| `pO` | folha do Aseprite |
| `pP` | o caminho inteiro do rascunho recuperado |
| `pQ`, `pS` | o projeto grande: exportar GIF, Salvar (mede se a página responde) |
| `pU` | soltar `.psd`, `.bonez`, `.boneb`, `.scml` na cena |

Rodar, da raiz do Recorte: `QA_SAIDA=/tmp/qa node "documentos/projeto do programa/noite/qa-arquivo-robo/pA.mjs"`.
As saídas e as fotos vão para `QA_SAIDA`. Precisa do `playwright` e do Chromium.
