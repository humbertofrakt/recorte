# Rodada 17, parte 2 — os consertos da fila

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026, à noite.
**Escreve código em `editor/`.** Enquanto roda, é a única que escreve ali e fecha versão. Um lote = uma parte do programa = uma versão.

---

## O que consertar

| Fonte | O quê |
|:---|:---|
| `documentos/projeto do programa/23 A FILA CONFERIDA 2026-10-05.md` | **os 28 que ainda existem**, conferidos hoje no `programa/` v28.8 por outra mão, com foto (`backup/fotos-obra/rodada-17/`). Agrupados por parte, do pior para o menor. **A lista manda; esta ficha só dá a ordem** |
| A fila original, só para o id | `documentos/planos/FILA dos defeitos 2026-09-29.md` |
| Mais oito pequenos de hoje (no fim do `03`, "os consertos pequenos na fila") | o Esc não fecha a janela das Rajadas · o marcador do emissor cobre o rótulo do Raio · o último nome da folha de quadros cortado · depois de `Ctrl+Z` no "Marcar como slot" o nome fica preso · clicar no nome do slot na lista de Bases abre sem o herói (e o caminho certo fica abaixo da dobra) · o motivo de caixa e ponto não virarem slot só na dica · o nome do meio de "Este boneco" sob a alça com a peça girada · digitar Escala X de uma imagem com chave própria muda o X |
| Achado novo da conferência | **tirar a skin ativa pelo × da pilha não entra no Desfazer** (o `Ctrl+Z` desfaz o passo anterior e a skin continua desligada). Prove primeiro se repete |

## A ordem

| Lote | O quê | Por quê primeiro |
|:---:|:---|:---|
| 1 | **O que perde trabalho e o que some da vista:** K13+K1b (com os Detalhes da linha do tempo abertos, a lista de Animações fica com uma linha e a aba Imagens com uma miniatura) · G-Q6 (a aba Curvas esconde o tocador) · K9+G-Q5 (os botões do formato da curva fora da tela) · a skin tirada pelo × sem Desfazer | ele não vê o que tem, e perde o que fez |
| 2 | **O que não age:** L2+L5 (Pesos automáticos não muda a cena; o painel de pesos abaixo da dobra) · J2 (Base → Virar filho de… só diz "Segure P" e não age) · e os outros da lista que são "o botão não faz nada" | regra 21: ou faz, ou diz por quê |
| 3 | **Os oito pequenos de hoje** | |
| 4 em diante | **O resto da lista**, por parte do programa, na ordem do `23` | |

Pode juntar dois lotes pequenos numa versão; nunca uma versão sem fecho inteiro.

## As réguas

| # | |
|:---:|:---|
| 1 | Leia `CLAUDE.md`, o começo do `03` (as regras de toda rodada), `editor/src/contract.ts`, `documentos/PARTES.md`, e o `23` inteiro |
| 2 | **Regra 26 em cada item:** o teste que falha hoje, depois o conserto. **Prove na tela**, pelo editor do disco e um Chrome sem janela, pelo menos os do lote 1 e 2 (roteiros de exemplo em `backup/fotos-obra/rodada-16/`, `rodada-23/roteiros/`) |
| 3 | Item que você não conseguir repetir: diga, com o que tentou, e siga. Item que pede decisão de desenho (mudar onde um painel fica): **pare e me diga** antes |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-17/consertos/lote-N/`, em 1920×1080 (e 1280×720 quando o item for de altura) |
| 5 | Fecho de cada lote, um processo por vez: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (120) · `npm run roteiro` · `npm run medir` · CHANGELOG (cada item pelo id da fila) · o quadro do `ESTADO.md` · `python ferramentas/montar-programa.py <o número que vai fechar>` · `python ferramentas/versao.py <número> "…"` · a contagem por arquivo. O único vermelho esperado é o antigo do manual |
| 6 | **Não toque** `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/`. O Humberto mandou foco total no editor; se precisar do runtime, pare e me diga |
| 7 | Backup antes de escrever, com linha no `backup/INDICE.md` (CRLF): relógio primeiro, nome depois. Fim de linha nos bytes, sem `sed`, sem Python em modo texto, sem `grep $'\r'` no Bash |
| 8 | Ação nova pede nome de tarefa (`ferramentas/provas/tarefas.ts`) e estado (`existir-nao-e-funcionar.test.ts`, `acoes.test.ts`): as réguas da casa moram em outros arquivos |
| 9 | **Mensagem minha só chega quando o seu turno para.** Não pergunte nada ao Humberto; não abra painel de pergunta |
| 10 | Contexto pesado? Pare num lote fechado, com a passagem (o que ficou de fora, pelo id) |

## O que entregar

A cada versão: um aviso ao `DIRETOR · 000da3` com o número · os ids consertados e os que não repetiram · os números do fecho com a hora · o que viu na tela de diferente · o que ficou de fora · o seu erro, pela forma. No fim: **"larguei a máquina"**, e pare. Não escreva no `03`.
