# Plano — finalizar o programa — 28/09/2026

Escrito pelo `EXECUTANDO · finalizar o programa`, a pedido do Humberto:
*"Você consegue finalizar esse programa?"*

**Resposta: sim.** O que falta é pouco, e está todo escrito abaixo.

---

## A linha de base, medida hoje

Medida em 28/09/2026, das 23h24 às 23h25, com a casa vazia.
Nenhum arquivo de código mudou desde a v22.8 (22/09).

| Prova | Resultado |
|:---|:---|
| `tsc` | limpo |
| `npx vitest run` | **4.182** · 4.152 verdes · 29 pulados · **1 vermelho** (o do manual) |
| Erros soltos na suíte | **4** — ver abaixo. **Não estavam escritos em lugar nenhum** |
| Conformidade | **87 de 87** |
| Roteiro e medição | não rodados ainda: ficam para o fecho do lote 1 |

**Os 4 erros soltos.** O teste `acoes.test.ts` (*"toda ação de arranque…"*)
roda ações que abrem janela — Nova regra, Importar animação — e elas chamam
`document` num teste sem navegador. O teste passa, e o erro estoura depois, fora
dele. A forma: *o teste pulou a conferência e não pulou a chamada*. Dono: lote 1.

---

## O que é "pronto"

| Camada | O que é | Quando |
|:---|:---|:---|
| **Bolo** | o editor sem defeito conhecido, sem função sem botão, sem decisão parada | **este plano** |
| Glacê | o manual (D13), os 29 testes pulados, o vermelho do manual | só com a palavra dele |
| Decoração | o nome novo, o site, os runtimes de engine | depois do glacê |

---

## Os lotes

Um lote, uma versão, um par de fotos quando há o que ver.

| Lote | O quê | Precisa de decisão dele? |
|:---:|:---|:---:|
| **1** | **O que cala ou engana.** Os 4 erros soltos · Inclinar não compensa · renomear pasta funde duas sem avisar · a tecla que cala | não |
| **2** | **As seis funções sem botão** (tabela A) | sim — D1 |
| **3** | **O que se cria e não se vê.** Evento e Parâmetro sem linha na Árvore · o caminho não ganha ponto pela cena · as etiquetas do Aseprite viram animação | sim — D2, D3 |
| **4** | **Os pequenos do degrau 12.** Trajeto do movimento · grade em perspectiva · breakdown | sim — D4 |
| **5** | **Os painéis que não cabem.** Malha e pesos · a ficha do emissor (pede 2.736 px, tem 343) · Propriedades | sim — D5 |
| **6** | **Limpeza.** O código morto que a auditoria listou (9 sobras) | sim — D6 |
| **7** | **O fecho.** Suíte, roteiro, medição, `programa/` montado, a folha de tarefas gerada de novo | não |

### Tabela A — as seis funções sem botão, e onde eu poria cada uma

| Função | O que faz | Onde eu poria |
|:---|:---|:---|
| `SetRuleChain` | troca os ossos de uma IK já feita | campo "Cadeia" na ficha da regra |
| `KeyDriverTarget` | grava a chave do alvo no valor de agora | botão-losango ao lado do alvo, na ficha |
| `DeleteTag` | apaga uma etiqueta | botão direito na etiqueta, aba Regras |
| `RenameTag` | renomeia uma etiqueta | duplo clique no nome |
| `removeBodyKey` | tira a chave de virada de corpo | `Delete` na chave, e botão na ficha dela |
| `ImportImagesCommand` | importar imagens vira UM passo de desfazer | sem botão novo: o mesmo gesto, agora com `Ctrl+Z` |

---

## As decisões que são dele

Cada uma com a minha sugestão. **"Sim a tudo" basta.**

| # | A pergunta | A minha sugestão |
|:---:|:---|:---|
| **D1** | As seis portas entram onde a tabela A diz? | sim |
| **D2** | Evento e Parâmetro ganham linha na Árvore? | sim, num grupo "Eventos e parâmetros" no fim |
| **D3** | Etiqueta do Aseprite vira animação sozinha ao importar? | sim, uma animação por etiqueta, com aviso no rodapé |
| **D4** | Grade em perspectiva: o tipo vai com o boneco ou fica na máquina? `Shift` trava nas diagonais? | fica na máquina; trava |
| **D5** | Malha e pesos e a ficha do emissor: nome curto, coluna larga, ou a aba rola? | a aba rola, com os grupos dobráveis |
| **D6** | Apago o código morto? | sim, com cópia em `backup/` |
| **D7** | As teclas de painel entram em Ajuda → Atalhos? | sim, numa seção dobrada |
| **D8** | A palavra "Etiqueta" fica? | fica |
| **D9** | Os doze botões da aba Regras viram um `Novo ▾`? | sim, como na Árvore |
| **D10** | Empurrar as chaves ganha gesto de arrastar? | não: o Spriter não tem, e o comando por número já existe |

---

## O que eu faço sem esperar

O **lote 1** não depende de decisão nenhuma. Começa agora.
Os lotes 2 a 6 esperam a palavra dele em cada `D`.

---

## Desvios

(vazio — o executor escreve aqui o que sair diferente do plano)
