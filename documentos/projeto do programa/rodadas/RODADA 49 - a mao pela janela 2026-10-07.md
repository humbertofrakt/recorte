# Rodada 49 — a mão, pela janela de verdade

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 07/10/2026, 12h59.
Ordem do Humberto: *"isso tudo é uma coisa que você poderia resolver."* Ele tem razão na maior parte: o doc `89` mandou para a mão dele coisas que um **navegador com janela** prova. Esta rodada usa o **navegador do aplicativo** (as ferramentas `mcp__Claude_Browser__*`: `preview_start`, `computer`, `find`, `read_page`, `javascript_tool`): é um Chromium de verdade, com mouse e teclado de verdade, downloads e janela. Só não dirige o Windows (seletor de pasta, seletor de cor, arrastar do Explorer).

**Não escreve código.** Confere, fotografa, e escreve o que achou. Se achar defeito, a rodada 50 conserta. Reporta a `Diretor com monitoramento de chats [410edc]`.

**Leia antes:** `CLAUDE.md` · `89 A MAO DO HUMBERTO - o que so ele confirma 2026-10-07.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` (a régua) · `ferramentas/provas/roteiro-30.mjs` (os 14 passos) · `documentos/manual/` se existir o roteiro em texto.

## Como

| # | |
|:---:|:---|
| 1 | Abra o programa montado: `programa\Abrir o editor.bat` abre na porta 5180; ou `preview_start` com `url: http://localhost:5180` depois de subir o servidor (`npm run editor` sobe o de desenvolvimento em 5173 — prefira o montado). Confira o Sobre: v36.1 |
| 2 | **Mouse de verdade**: `computer` com `left_click`, `left_click_drag`, `type`, `key`. Nada de protocolo nem de `.focus()` por programa. Tela 1920×1080 (`resize_window`) |
| 3 | Fotos com `screenshot`, salvas por descrição em `backup/fotos-obra/rodada-49/` (o `screenshot` devolve a imagem; anote o que viu e guarde o que der) |

## O que provar

| # | Item do doc `89` | O que fazer | O que tem de acontecer |
|:---:|:---|:---|:---|
| A | **4 — Downloads** | sem pasta de projeto: Arquivo → Exportar → "GIF, PNG, folha, vídeo…" → Só este quadro → Exportar | o navegador do aplicativo recebe o download; o rodapé diz "Foi para Downloads (Ctrl+J mostra)"; diga se a janela de download apareceu e o nome do arquivo |
| B | **6 — O roteiro dos 30 minutos com a mão** | os 14 passos do `roteiro-30.mjs`, com o mouse, lendo o rodapé a cada passo | cada passo faz o que o roteiro diz; anote onde um usuário novo hesitaria (o rodapé não disse? a dica não ajudou?) |
| C | **7 — Os painéis com a mão** | arrastar uma aba para outro grupo; soltar da parede; arrastar a barra de volta; Janela → Voltar ao padrão; recolher um grupo pelo ▾; o » das abas | a sombra segue o mouse; a linha azul mostra onde entra; o contorno azul no corpo do grupo; tudo volta ao padrão |
| D | **9 — Exportar e importar skin** | Skins → Fazer a skin de uma pasta (inverno) → Exportar skin → (o arquivo vai para Downloads ou abre um seletor: diga qual) → Apagar → Importar skin | a skin volta vestida, com rosto; se o Importar abre o seletor do Windows, pare e diga: é a mão dele |
| E | **8 — A foto da aba Árvore** | abra a aba Árvore e olhe o `×` e o nome | diga o que você vê de estranho na aba (o Humberto circulou o `×` e o nome em 06/10 e não disse o quê): o `×` fecha a aba certa? o nome está cortado, sublinhado, com cor diferente? |
| F | **1 — Seletor de cor** | Partículas → Fogo → aba Cor → clique na cor "de" | se abrir o seletor nativo do Chromium, escolha vermelho e veja a faixa; se abrir um diálogo do Windows que você não alcança, diga |
| G | **Soltar uma pasta** (2) e **o seletor de pasta** (3) | NÃO tente: são do Windows | anote "mão do Humberto", só |

## As réguas

Nada em `editor/`, `programa/`, `runtime/`. Portas: 5180 (o montado) ou 5560 se subir outro; nunca 5191/9335 (roteiro) nem 5192/9336 (medir): **não rode `npm run roteiro` nem `medir`**; o roteiro aqui é com a MÃO. Não pergunte nada ao Humberto. Relatório: `documentos/projeto do programa/98 A MAO PELA JANELA 2026-10-07.md`, uma tabela (item · vi funcionar / pela metade / não / mão do Humberto · o que vi · foto), e 6 linhas para o Diretor.
