# Os painéis — a noite de 04 para 05/11/2026

Ramo: `obra/paineis`. Executor dos painéis (CSS, coluna, a prova `medir-paineis.mjs`).
Hora do relógio: começo 00:00 UTC, fim ~01:00 UTC de 05/11.

## O número

| Medição | Antes | Depois |
|:---|:---:|:---:|
| As 90 de sempre, na altura | **82 de 90** (no Linux) | **90 de 90** |
| De lado | 90 de 90 | 90 de 90 |
| Com a passada nova (Malha com Pesos) | — | **90 de 92** |

**Por que 82 e não 83.** O `ESTADO.md` diz 83, medido no Windows. Aqui é Linux,
com a fonte Inter, mais larga. Um a mais rolava: a aba Nascer do emissor, em
1280×720 com animação (19 px). Também foi consertado.

**O 90 de 92 é o número honesto.** A prova nunca tinha medido a Malha com a
ferramenta Pesos na mão. Medi. Não cabe. Está no fim, em "O que ficou".

## A Malha em 1280×720 — a escolha

| Saída | Fica? | Por quê |
|:---|:---:|:---|
| Nome mais curto | não | Vai contra "ícone sozinho não se lê" |
| Coluna mais larga | não | Tira espaço da cena, o dia inteiro, nas duas telas |
| **A aba rola, com régua própria** | **sim** | Ele já aceitou para a Prévia. Nenhum nome encurta. Nada some: Forma, Ossos, Pesos e Pincel ficam na aba |

A régua nova, em uma frase: **do topo até o fim da seção aberta da
ferramenta, inteira, e mais uma linha, à vista sem rolar.** O que rola são só
os títulos das seções dobradas.

| Peça | Como |
|:---|:---|
| A marca | `data-rolagem="ferramenta"` no corpo da Malha. **Troca a régua, nunca isenta** |
| Onde vale | Só até 800 px de altura. Em 1440×900 vale a régua de sempre |
| Para caber | Abaixo de 800 px, os botões da Forma vão **dois por linha**, com o nome inteiro em duas linhas ("Gerar / automática"). A Forma caiu de 233 para 165 px |
| Prova de que pega (regra 26) | Sem a grade dos botões, a régua acusa: *pede 339 px num painel de 272* |

## O que fiz

| Painel | Rolava (Linux) | O que fiz | Como provei | Ficou |
|:---|:---:|:---|:---|:---:|
| Malha, 1280 | 169 px | Régua da ferramenta; botões da Forma dois por linha | Medição; defeito provado antes | cabe |
| Exibição, 1440 | 91 px | Tabela em linhas de 20 px. "Travar guias" quebrava em duas linhas (45 px): colunas do tamanho do nome. Faixa do "Voltar ao padrão" mais baixa | Medição: 317 de 317 | cabe |
| Exibição, 1280 | 213 px | O mesmo, e **"A cena" nasce dobrada** na tela baixa, com o título à vista. Um clique abre. A grade, réguas e guias também estão no menu Exibir | Medição; teste do modelo | cabe |
| Ficha do desenho, 1440 | 13 px | Recheio dos grupos: 4/6 virou 2/3 px | Medição | cabe |
| Ficha do desenho, 1280 | 135 px | Na tela baixa, **com a Ficha rápida em cima**, a ficha completa nasce dobrada, grupo por grupo. Grupo com problema abre sempre. A mão manda | Medição; teste do modelo | cabe |
| Regra Comando, 1280 | 78 px | O "+" e a lixeira do título do alvo tinham 34 px; agora a altura da linha. Caixas de 24 px na tela baixa (a régua do emissor) | Medição | cabe |
| Emissor, Nascer, 1280 | 19 px | "Máximo de vivas" quebrava em duas linhas. O rótulo cresce até caber numa linha; as outras linhas não andam | Medição: 60 de 60 do emissor | cabe |
| Prévia, 1280 | 7 de 24 px | O palco encolhe com o painel (126 px, na proporção, no meio). Fora da tela cheia | Medição: sobram 31 px | cabe |

Nenhum campo, botão ou palavra saiu.

## A prova (`medir-paineis.mjs`)

| Mudança | Por quê |
|:---|:---|
| A janela "Havia trabalho não salvo" cobria **toda foto** | O editor regravava o rascunho ao sair da página. Agora a página sai primeiro e o Chrome limpa o armazenamento. Sem isso, nenhuma foto batia byte a byte (a hora estava escrita na janela) |
| `--so "Aba"` | Mede uma aba em 20 s. Diz "PARCIAL" no fim, para ninguém relatar como total |
| A régua da ferramenta | Ver acima |
| A passada da Malha com Pesos | O caso alto da aba. Conta no total |
| No Linux, o Chromium do Playwright | Sem `CHROME=` |

## As fotos, antes e depois

`npm run medir -- --fotos`, com a prova nova, antes e depois. As fotos são da
tela inteira, então cada uma mostra três painéis ao mesmo tempo.

| Onde mudou | É meu? |
|:---|:---|
| Coluna da esquerda, abaixo da aba Propriedades | sim (ficha do desenho) |
| Grupo de cima à direita, com Exibição, Malha ou Prévia na frente | sim |
| Uma risca de 1 px no alto de uma aba | **não é mudança**: aparece também entre duas rodadas do código igual |
| A cena, o meio da tela | nada mudou |
| Árvore, Ordem, Imagens, Entidades, Pivôs, Partículas, Animações, Skins, Regras, Histórico | **iguais**, fora a risca de 1 px |

## A régua de fecho (05/11, ~00:50 UTC, casa vazia)

| Régua | Resultado |
|:---|:---|
| `npx vitest run` | 1 vermelho, o conhecido (`ajuda.test.ts`, imagens do manual). **5.781 passam**; no ramo de partida, 5.774. **+7 testes novos**, nenhum vermelho novo |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 120 de 120 |
| `npm run roteiro` | 14 de 14 |
| `npm run medir` | 92 de 92 de lado · **90 de 92** de altura |

Um teste velho foi **reescrito**, não afrouxado: `paineis.test.ts`, "a ficha usa
a regra" procurava a chamada `groupsOpen(juntos, gruposDaMao)`. A chamada
ganhou um argumento; o teste procura a nova, e mais a linha que dobra.

## Erros meus, pela forma (regra 27)

| Forma | Onde |
|:---|:---|
| **Apertei uma classe sem olhar quem mais a usa.** O corpo da aba do emissor também é `.prop-grupo`, com recheio 0 de propósito; meu recheio 2/3 entrou nele | Duas abas do emissor passaram a rolar 3 e 4 px. A prova pegou; corrigido com `:not(.prop-aba-corpo)` |
| **Uma regra geral passou por cima de uma particular.** A coluna do rótulo do emissor esmagou a grade da faixa "de [ ] a [ ]" | Tamanho e giro passou a rolar. Corrigido com `:not(.prop-linha-faixa)` |
| **Fotografei depois de desfazer o estado.** A foto da Malha com Pesos saiu com a mão já de volta no Transformar | A foto agora vem antes de voltar |

## O que ficou

| Item | Número | Por quê, e a saída |
|:---|:---|:---|
| **Malha com a ferramenta Pesos** | pede 764 px em 452 (1440) e 688 em 272 (1280) | Com os Pesos na mão abrem Ossos, Pesos e Pincel juntos. Não é CSS: cada osso é uma linha de 40 px, cada botão de peso uma linha. Saídas: dobrar Ossos com os Pesos na mão (lógica da Malha, outro chat; e esbarra em "não esconda os pesos"), ou aceitar que esta aba rola na régua da ferramenta só com a seção de cima. **Decisão do Humberto** |
| Margens finas | Exibição em 1440: 317 de 317. Ficha do desenho em 1440: ~4 px de folga | Medido no Linux. No Windows a fonte é mais estreita (lá rolava menos), então deve sobrar mais. **Não medi no Windows** |
| A régua da ferramenta | só vale até 800 px de altura | Em 1440 a Malha com Transformar cabe sem ela |
| Dois arquivos de lógica tocados | `mesh-panel.ts` (1 linha: a marca) · `view-panel-actions.ts` e `properties-model.ts` (o que nasce dobrado na tela baixa) | Mudança mínima, só arranjo. A lógica da Malha não mudou |

## Depois de juntar o ramo da noite (00:55 UTC)

`git merge origin/obra/noite-2026-11-04` (afbdfc0), sem conflito. Remedido tudo:

| Régua | Resultado |
|:---|:---|
| `npm run medir` | 92 de 92 de lado · **90 de 92** de altura (o mesmo: só a Malha com Pesos rola) |
| `npx vitest run` | 5.898 passam · 1 vermelho, o conhecido do manual |
| `tsc` | limpo |
| Conformidade | 132 de 132 |
| Roteiro | 14 de 14 |

O aviso do Diretor (00:23): não mexi no CSS de Entidades, Skins nem Animações.
Toda dobra que fiz deixa o título à vista e diz o que tem dentro ("A cena",
"Desenho", "Tamanho da imagem").

## 05/11, 01:00 — a Malha com Pesos, pela decisão do Diretor

O Diretor decidiu, no lugar do Humberto: **a Malha com a ferramenta Pesos
segue a mesma saída 3.** A aba rola com a régua da ferramenta, e nada some.

| O que mudou | Como |
|:---|:---|
| A régua da ferramenta | Agora mede a aba **como ela se apresenta**: (1) nenhuma seção aberta cortada em cima; (2) a primeira seção aberta à vista aparece inteira, e mais uma linha. Vale nas duas telas |
| Para caber em 1280 | A linha de cada osso caiu de 41 para 25 px. O ícone da lixeira herdava o recheio do botão (5 px em cima e embaixo). E o vão do aviso azul e das seções |
| Prova de que pega (regra 26) | Sem o aperto: *pede 321 px num painel de 272*. Com a aba rolada para o meio de Ossos: *a aba abre no meio de uma seção aberta* |

**O número: 92 de 92** na altura, 92 de 92 de lado (01:05 UTC).

O que esta régua NÃO garante, para ninguém supor que garante:

| Item | Por quê |
|:---|:---|
| Pesos e Pincel ficam abaixo, rolando | É a saída 3. Ossos (onde se escolhe o osso) aparece inteira |
| Muitos ossos | A lista de Ossos cresce com o arquivo. Medido com o desenho `face`, 2 ossos |
| O recado do fim da aba (depois de um gesto) | Fica no fim, e pode estar abaixo da vista |

## 05/11, 01:10 — o painel cheio: a linha do tempo de Detalhes aberta

O Diretor pediu: medir com o herói e uma animação abertos, o painel cheio.
**A prova já fazia isso**: abre o herói e a animação `idle` antes de medir.
O que ela não fazia: abrir os **Detalhes** da linha do tempo. Aberta, a faixa
de baixo cresce e a coluna encolhe.

Nova opção: `npm run medir -- --detalhes`. É uma rodada à parte, com nome. Não
é o número de fecho.

| Tela | Altura de uma aba no grupo de cima à direita | Cabem |
|:---|:---:|:---:|
| 1440×900 | ~172 px (era 441) | |
| 1280×720 | ~123 px (era 272) | |
| **Total** | | **79 de 92** |

Os que rolam com os Detalhes abertos:

| Tela | Aba | Quanto |
|:---|:---|:---|
| 1440 | Propriedades (desenho) | 56 px |
| 1440 | Malha (Forma) | pede 339 em 172 |
| 1440 | Malha (Pesos) | pede 329 em 301 |
| 1440 | Exibição | 155 px |
| 1440 | Prévia | o palco (160) não cabe em 112 |
| 1280 | Árvore | 31 px (a barra da Árvore) |
| 1280 | Propriedades (desenho) | 6 px |
| 1280 | Malha (Forma) | pede 252 em 123 |
| 1280 | Malha (Pesos) | pede 267 em 202 |
| 1280 | Exibição | 94 px |
| 1280 | Prévia | o palco (136) não cabe em 63 |
| 1280 | Regra Comando | 19 px |
| 1280 | Imagens | VAZIO: a grade ficou tão baixa que a prova a viu como "Nenhuma pasta aberta" e não mediu |

**Não consertei, e o porquê.** Não é CSS de painel: é a casca. Com os
Detalhes abertos, 123 px não guardam nem o palco da Prévia. As saídas são de
desenho, e mexem na Linha do tempo (de outro chat esta noite):

| Saída | O que custa |
|:---|:---|
| As colunas vão até o rodapé; a linha do tempo fica só debaixo da cena | A linha do tempo perde ~520 px de largura |
| Abrir os Detalhes recolhe o grupo de baixo da coluna | Um gesto troca dois lugares da tela |
| Aceitar: com os Detalhes abertos, as abas rolam | É o que acontece hoje, agora medido e escrito |

Decisão do Humberto ou do Diretor.

FIM
