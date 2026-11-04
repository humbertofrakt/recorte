# programa/

O editor **montado**, pronto para usar. Sem Vite, sem internet. Só o Node.

Como abrir e como montar de novo: `LEIA-ME.txt`, ao lado.

| Arquivo | O que é |
|:---|:---|
| `Abrir o editor.bat` | dois cliques: liga o servidor e abre o navegador em `http://localhost:5180` |
| `servidor.mjs` | servidor local de arquivos, zero dependência |
| `index.html`, `assets/` | saída do `npm run editor:build`, copiada por `python ferramentas/montar-programa.py` |

Esta pasta é **gerada**. Mudou o código do editor? Rode o `montar-programa.py` de novo.
