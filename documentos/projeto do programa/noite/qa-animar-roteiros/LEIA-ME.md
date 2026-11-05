# Os roteiros do QA da noite (04/11/2026)

Dirigem o editor num Chromium sem janela (Playwright), com mouse e teclado
de verdade. Precisam do editor servindo:

```
npx vite editor --port 5293 --strictPort
node "documentos/projeto do programa/noite/qa-animar-roteiros/c4.mjs" 1440 900
```

| Arquivo | O que faz |
|:---|:---|
| `c4.mjs` | o roteiro dos 30 minutos, passos 3 a 14, à mão |
| `c11.mjs` | ponta a ponta: PSD com ossos, IK, malha, andar, troca de pai, desfazer e refazer tudo, salvar e reabrir |
| `d9.mjs` | renomear os 17 ossos do herói por duplo clique (o D14) |
| `c29.mjs` | o Espaço com o foco em cada aba (o D16) |
| `c30.mjs` | Duplicar e depois Espaço (o D17) |

Tamanho da tela: os dois números no fim (1920 1080, 1440 900, 1280 720).
As fotos vão para `FOTOS` (ou `fotos-qa`, ao lado da raiz).
