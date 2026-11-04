# Plano — como terminar o programa — 03/10/2026

Pedido do Humberto: *"como vamos terminar esse programa? crie um plano e me passe."*

**Resposta curta:** em cinco fases. As três primeiras são de **decidir**. As duas últimas são de **obra**.
Quanto mais a peneira cortar, menor fica a obra.

---

## Onde estamos hoje

| O quê | Número | De quando |
|:---|:---:|:---:|
| Versão | **v23.3**, obra parada | 29/09 |
| Testes | 4.608 · 1 vermelho (o do manual) | 29/09, 10h38 |
| Conformidade | 87 de 87, nos dois runtimes | 29/09 |
| Roteiro dos 30 minutos | 14 de 14 | 29/09 |
| Fila | **90 fechados · 78 faltam** (de 173) | 29/09, 15h20 |
| Painéis que não cabem na altura | 9 de 28 | 29/09 |
| Projeto do programa | passos 1 e 2 feitos (parar · a foto) | 29/09 |

Os números são de 29/09. Ninguém mexeu no código desde então. Serão medidos de novo antes da obra voltar (regra 25).

---

## O que é "terminado"

| # | A régua |
|:---:|:---|
| 1 | **Você** monta e anima um boneco do zero até exportar, sem travar e sem perguntar a ninguém |
| 2 | Nenhum defeito aberto nas áreas que **ficam** |
| 3 | Toda função que fica tem botão. Toda função que sai, saiu de verdade |
| 4 | Nenhum painel pede mais altura do que tem, ou rola por decisão sua |
| 5 | Suíte, roteiro e medição verdes, e `programa/` montado |

Fora deste plano: o manual · o nome novo · o site · os runtimes de engine. Vêm **depois**, com a sua palavra.

---

## As cinco fases

| Fase | O quê | Quem | Sai dela |
|:---:|:---|:---:|:---|
| **1** | **A peneira.** As 17 áreas da foto: fica · sai · esconde · muda | **você** | `02 A PENEIRA` |
| **2** | **A tela desenhada.** Um desenho da tela como ela vai ficar: menus, barras, painéis | você, com desenho meu | `03 A TELA` |
| **3** | **A ordem da obra.** A peneira cruzada com a fila dos 78 | eu | `04 A ORDEM DA OBRA` |
| **4** | **A obra.** Rodadas pequenas, uma versão e uma foto por lote | executores, pelo Planejador | versões |
| **5** | **O fecho.** Você faz o roteiro com a sua mão | você e quem fecha | a versão final |

Os documentos das fases 1 a 3 moram em `documentos/projeto do programa/`.

---

## Fase 1 — a peneira

Um bloco por conversa. Uma pergunta por vez, sempre com desenho.

| Conversa | Bloco | Áreas | Tamanho |
|:---:|:---|:---:|:---:|
| 1 | **A** — o caminho do Spriter | 1 a 8 | 120 tarefas |
| 2 | **B** — ferramentas do Spine (malha, pesos, regras, física) | 9 e 10 | ~20 |
| 3 | **C** — só nosso (corpos e entidades, variáveis, partículas) | 11 a 13 | ~10 |
| 4 | **D** — a tela em si | 14 a 17 | 66 tarefas |

Três decisões antigas entram junto, cada uma no seu bloco:

| Decisão parada | Bloco |
|:---|:---:|
| Acertar o pivô: o desenho pula para o osso, ou fica parado? | A |
| Malha e pesos na tela pequena: nome curto, coluna larga, ou a aba rola? | B |
| A ficha do emissor de partículas (pede 2.736 px, tem 343) | C |

---

## Fase 2 — a tela desenhada

| Passo | O quê |
|:---:|:---|
| 1 | Os 7 menus (232 itens hoje), só com o que ficou na peneira |
| 2 | As barras e as duas colunas: o que nasce aberto, o que nasce fechado |
| 3 | A faixa de baixo e o rodapé |

Você risca, eu redesenho. Sem código.

---

## Fase 3 — a ordem da obra

| Regra | Efeito |
|:---|:---|
| Defeito em área que **sai** | não se conserta: sai junto |
| Defeito em área que **esconde** | vai para o fim |
| Defeito em área que **fica** | entra na ordem abaixo |

---

## Fase 4 — a obra

No máximo **4 chats por rodada**. Em 29/09 foram 16, e a máquina (7,7 GB) travou.

| Rodada | O quê | Exemplos da fila |
|:---:|:---|:---|
| **R1** | **Tirar e esconder** o que a peneira cortou. A tela fica menor antes de qualquer conserto | — |
| **R2** | **O que perde trabalho ou engana** | roupa exportada não volta (M17) · digitar 90 no Ângulo não gira (J9) · projeto grande do Spriter trava (E6) |
| **R3** | **O que quebra a sequência** | a cena corta o boneco com os Detalhes abertos (K13) · Propriedades com 3 linhas (K17) · Imagens e Peles não cabem juntas (M16) · nada diz como prender a imagem ao osso (J8) |
| **R4** | **O que cala** e **o que não se acha** | os avisos de exportar · a cadeia dos pesos (L1 a L9) · Nova pele fora do menu (M18) |
| **R5** | **A tela nova** da fase 2, e os painéis que não cabem | Malha e pesos · a ficha do emissor |
| **R6** | **Limpeza** do código morto, com cópia em `backup/` | 9 sobras |

Régua de cada lote: backup antes · uma versão · uma foto · conferido no uso. **Lote sem foto não fecha.**
Um defeito só sai da fila quando o uso confirma.

---

## Fase 5 — o fecho

| Passo | O quê |
|:---:|:---|
| 1 | Casa vazia: suíte · `tsc` · conformidade · roteiro · medição |
| 2 | `programa/` montado · a folha "o que o programa faz" gerada de novo |
| 3 | **Você** abre o `programa/` e faz o roteiro dos 30 minutos |
| 4 | O que a sua mão achar vira a última rodada |
| 5 | Versão de fecho, com número do `versao.py` |

---

## O que eu não sei

| Não sei | Por quê |
|:---|:---|
| Quantos dias leva | depende da peneira. Mede-se em rodadas, não em dias |
| Quantos dos 78 sobram | só depois da fase 3 |
| Se os 10 "a medir" são defeito | foram vistos uma vez só |

---

## O próximo passo

**A peneira do bloco A.** Você diz "começa", e eu trago a área 1 (Começar e salvar), com desenho.

---

## Desvios

(vazio)

**04/10/2026 — este plano foi trocado.** A fase 1 (a peneira) acabou no dia seguinte, e a resposta do Humberto foi: nada sai, tudo fica. As fases 2 a 5 viraram rodadas pequenas, um chat por rodada. Vale agora: `documentos/projeto do programa/02 AS DECISOES do projeto 2026-10-04.md` e `03 A ORDEM DA OBRA 2026-10-04.md`.
