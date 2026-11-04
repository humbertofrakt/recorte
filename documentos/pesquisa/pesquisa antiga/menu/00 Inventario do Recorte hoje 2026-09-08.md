# Inventário — como a tela do Recorte está hoje

Levantado em 08/09/2026, lendo o código em `editor/src` e a captura `editor/tela-final.png`.
Serve de linha de base para a proposta de reorganização (arquivo `05`).

## Resumo em 6 linhas

- A faixa de cima tem **3 linhas de botões** com texto. Ocupa cerca de **1/5 da altura**.
- A faixa de baixo tem **4 linhas de botões** mais a régua. Ocupa cerca de **1/3 da altura**.
- Sobra para a cena **menos da metade** da tela. É o que o Humberto reclamou.
- O botão **Laço** existe, mas está escondido: painel Animações, coluna da direita, abaixo da lista.
- A linha **Alvo** da linha do tempo só mostra tempos. Não mostra losango nenhum de chave.
- **Não há como criar um ponto** (`point`) no editor. O formato e os dois runtimes já leem e exportam ponto com posição e ângulo.

---

## 1. Barra de menus

| Menu | Entradas |
|:---:|:---:|
| Arquivo | Novo · Abrir · Salvar · Salvar como · Salvar como binário · Salvar como pacote · Exportar glTF · Exportar imagem · Exportar por pele · Importar de outro programa · Importar PSD · Importar imagens · Reempacotar atlas |
| Editar | Desfazer · Refazer |
| Ajuda | Manual (F1) |

Não existe menu **Exibir**, **Animação** nem **Janela**. O que seria deles está espalhado em botões.

## 2. Faixa de cima (acima da cena) — 3 linhas

| Linha | Botões | Largura que ocupa |
|:---:|:---:|:---:|
| 1 — Ferramentas | Selecionar Q · Mover W · Girar E · Escalar R · Criar osso N · Posar B · Malha M · Pesos G | toda a largura |
| 2 — Eixos e Compensar | Local · Pai · Mundo · Não mexer nos filhos · Não mexer nos desenhos · Não mexer nas caixas | toda a largura |
| 3 — Zoom | Aproximar · Afastar · Ajustar à tela | centro |

Todos são botões de texto. Nenhum é ícone. O zoom com nome ocupa uma linha inteira só para 3 botões.

## 3. Coluna da direita — 6 painéis empilhados

| Painel | Conteúdo | Estado na captura |
|:---:|:---:|:---:|
| Árvore | Novo: Osso · Slot · Regra (com lista) · Evento · Pele · Parâmetro · Apagar. Lista de ossos, slots, peles, regras | aberto, cortado |
| Propriedades | campos do item escolhido | aberto, cortado |
| Animações | Nova · Duplicar · Renomear · Apagar · Voltar à montagem · lista · **Tocar · Laço · Velocidade · tempo** | aberto, tocador escondido |
| Malha e pesos | ferramentas de malha | fechado |
| Exibição | 9 caixas (ossos, nomes, caixas, pontos, malhas, arestas, pesos, grade, eixos) + casca de cebola (6 campos) | fechado |
| Prévia | mistura de até 4 camadas | fechado |

Seis painéis na mesma coluna. Cada um abre e corta o de baixo. O tocador fica invisível na prática.

## 4. Faixa de baixo — abas Linha do tempo e Curvas

| Linha | Botões |
|:---:|:---:|
| 1 — Navegar | Início · Chave anterior · Quadro anterior · Quadro seguinte · Próxima chave · Fim · `0,32 s — quadro 10` |
| 2 — Chaves | Chavear · Apagar chave · Apagar seleção · Copiar · Colar · Esticar ×2 · Encolher ÷2 · Espelhar · Gravar sozinho |
| 3 — Bloco | Fator [2] · Esticar seleção · Espelhar no tempo · Fechar ciclo |
| 4 — Espelho | Pares de nome [campo] · Espelhar esquerda e direita · aviso |
| 5 — Régua | **Alvo** · tempos e quadros |

Quatro linhas de botões antes de chegar na régua. A linha **Alvo** deveria ser o resumo das chaves e hoje é só um rótulo.

## 5. Atalhos que já existem

| Tecla | Faz |
|:---:|:---:|
| Q W E R N B M G | ferramentas |
| Ctrl+Z / Ctrl+Y | desfazer / refazer |
| Ctrl+S / Ctrl+Shift+S / Ctrl+O / Ctrl+N | salvar / salvar como / abrir / novo |
| ← → | quadro anterior / seguinte (linha do tempo com foco) |
| ↑ ↓ | chave anterior / seguinte (linha do tempo com foco) |
| Home / End | início / fim |
| Delete · Ctrl+C · Ctrl+V | apagar, copiar, colar chaves |
| F1 | manual |
| Esc | fecha menu |

Não há atalho para: tocar/pausar (espaço), laço, zoom (Ctrl+roda, F para ajustar), chavear (K ou S), esconder painéis (Tab).

## 6. O que o formato já tem e a tela não mostra

| No formato | Na tela |
|:---:|:---:|
| `point` (§7.9): posição + rotação no mundo, exportado no canal `points` | sem botão para criar; só desenha se já vier no arquivo |
| `boundingbox` (caixa de colisão) | sem botão para criar |
| `path` (caminho) | sem botão para criar |
| `event` com campos | tem botão Evento na Árvore |
| `animation.loop` / laço no tocador | botão Laço escondido |

O que o Humberto chamou de "pivô da arma" do Spriter é, no nosso formato, o anexo **`point`** preso ao osso da arma. O jogo lê `x`, `y` e `rotation`. Falta só a ferramenta na tela.

## 7. Os problemas apontados pelo Humberto, conferidos

| Reclamação | Conferido? | Onde está |
|:---:|:---:|:---:|
| Zoom com botão de nome | sim | `viewport.ts` linhas 345–347 |
| Menus ocupam metade da tela | sim | 3 linhas em cima + 4 embaixo |
| Texto para pular de chave em chave | sim | botões Chave anterior / Próxima chave |
| Alvo podia mostrar as chaves | sim | `dopesheet.ts` linha 361, só rótulo |
| Botão laço / uma vez | existe, escondido | `animations.ts` linha 201 |
| Pivô da arma para bala e ângulo | falta ferramenta | formato §7.9 pronto |
| Não dá para selecionar vários arrastando | sim | `select.ts` só tem `onDown`; vários só com Shift+clique |
| Não tem botão para travar sprites ou ossos | sim | nenhum campo de trava; `picking.ts` pega tudo que está visível |

## 8. Como a seleção funciona hoje

| Gesto | Faz |
|:---:|:---:|
| Clique | escolhe um osso ou um desenho |
| Shift + clique | soma ou tira da seleção |
| Alt + clique no mesmo lugar | passa para o item de baixo (empilhados) |
| Esc | desmarca tudo |
| Arrastar em área vazia | **nada** |

Na linha do tempo o retângulo de seleção já existe (`dopesheet.ts`). Na cena, não.

---

**Assinado:** Pesquisador — sessão "Pesquisa de organização de menus" (Claude Fable 5.1; agentes de busca em Opus). 08/09/2026.
