# Avaliação do Diretor — a linha do tempo em produção — 14/09/2026

O chat **Recursos de sprite animation tools** varreu os três manuais e entregou
**18 itens** em `PROPOSTAS linha do tempo - copiar e repetir 2026-09-13.md`.
A decisão escrita lá era *"a partir de 20/09"*. O Humberto mudou em 14/09:
**avaliar e pôr em produção**, pelo caminho Diretor → Planejador → Executores.

Esta é a avaliação. **Ela não escreve código.**

---

## 1. O veredito, item a item

| # | Item | Veredito | Por quê |
|:---:|:---|:---|:---|
| **11** | Copiar valendo a seleção da cena | **entra, primeiro** | O mais barato dos 18 e o que mais resolve. Só liga o que a Árvore e a folha já sabem fazer |
| **1** | Copiar o membro (o galho inteiro) | **entra** | É o pedido dele com todas as letras. Com o 11 pronto, encolhe |
| **2** | Colar espelhado | **entra** | As regras `_e/_d` já existem em `timeline-tools.ts`. Meio lote |
| **9** | Copiar a pose só do escolhido | **entra** | Mesmo gesto do `Ctrl+Shift+C`, com menos linhas |
| **6** | Ctrl ao arrastar clona | **entra** | Meio lote, e é gesto de Spriter |
| **4** | Empurrar por número | **entra** | Meio lote. Abrir espaço no meio é trabalho de todo dia |
| **8** | Limpar chaves repetidas | **entra** | Meio lote, e limpa o lixo que o gravar-sozinho deixa |
| **3** | Somar e escalar valores | **fica para depois** | Útil, mas é ferramenta de afinação: só vale com animação pronta na mão |
| **7** | Aparece daqui · Some daqui | **fica para depois, e já meio feito** | O lote 57 já faz a imagem nova entrar no meio da animação. Falta só a porta para um desenho **que já existe** |
| **5** | Repetir o trecho | **fica para depois** | Sugestão nossa, não pedido dele |
| **13** | Copiar a curva | **fica para depois** | Acréscimo: os 7 formatos já existem |
| **14** | Travar o conteúdo da folha | **fica para depois** | Acréscimo: o filtro já existe |
| **15** | Mover o 0,0 da animação | **fica para depois** | Só faz sentido depois de colar membro (1) |
| **17** | Alças da casca de cebola | **fica para depois** | Conforto, não função |
| **18** | Copiar o pivô entre imagens | **fica para depois** | Conforto |
| **16** | Chave de sequência de imagens | **fora desta rodada** | Abre uma porta do formato que ninguém abriu ainda (`sequence`). É decisão dele, não nossa |
| **12** | Juntar outro `.bone` no atual | **fora desta rodada** | Dois lotes, mexe em `io/`, e três modos de junção. Merece plano próprio |
| **10** | Levar a animação para outro personagem | **fora desta rodada** | Já tem lugar em `PEDIDOS reutilizar e aninhar`, lote C |

**Entram agora: 11, 1, 2, 9, 6, 4, 8.** Sete itens, que somam cerca de **quatro
lotes e meio** — e todos atendem a mesma frase dele: *"pego o braço inteiro e
colo."*

## 2. Por que não entra tudo

Não é orçamento: é foco. A semana foi declarada por ele — *"terminar o que já
tem no programa"*. Os sete que entram terminam **um** assunto (copiar e colar na
linha do tempo). Os outros onze abrem assuntos novos, e assunto novo aberto no
meio da semana é o que faz a pasta ficar cheia de meio-feito.

## 3. As duas frentes não se atropelam — menos num ponto

Pelo mapa de `documentos/PARTES.md`:

| Frente | Parte | Arquivos |
|:---|:---|:---|
| Linha do tempo (estes sete) | **Linha do tempo** | `panels/dopesheet*.ts`, `panels/graph.ts`, `anim/timeline-tools.ts` |
| Fluxo criar e animar, lote 1 (chave `parent`) | **Árvore** + **Cena** | `doc/reparent.ts`, `panels/tree-*.ts` |
| Fluxo criar e animar, lote 2 (malha sem expulsar) | **Malha e pivô** | `mesh/*`, `panels/mesh-panel.ts` |

**Três chats podem rodar ao mesmo tempo.** Partes diferentes, testes diferentes.

**O ponto de atrito, dito antes de acontecer:** o **lote 3 do fluxo** ("o tocador
nunca apaga") mexe em `panels/dopesheet-player.ts`, que é da parte Linha do
tempo. Ele **espera** o chat da linha do tempo fechar. Não é impedimento: é
ordem.

## 4. A ordem que o Diretor manda

| Ordem | Chat | O que faz |
|:---:|:---|:---|
| 1 | **Linha do tempo** | itens 11 → 1 → 2 → 9 → 6 → 4 → 8, nessa ordem. Uma versão por lote |
| 2 | **Chave `parent`** | lote 1 do fluxo criar e animar. Formato, runtime e C-281 já esperam |
| 3 | **Malha sem expulsar** | lote 2 do fluxo criar e animar |
| 4 | *(depois do chat 1)* | lote 3 do fluxo: o tocador nunca apaga |

## 5. O que o Planejador tem de resolver antes de soltar os executores

| # | |
|:---:|:---|
| 1 | A pergunta aberta do fluxo: trocar de pai em Animando grava chave **sempre**, ou pergunta *"só aqui, ou no arquivo todo?"* — **é do Humberto**, e o lote 2 da ordem não começa sem ela |
| 2 | Quantos chats abrir de uma vez (a régua da casa: 4 a 5 por rodada, com resumo) |
| 3 | O número de versão de cada fecho sai do `versao.py`, um de cada vez (regra 14 e 15) |

## 6. O que o Diretor NÃO autoriza sem falar com ele

| | |
|:---|:---|
| Item 16 (`sequence`) | abre porta nova do formato — regra 7 |
| Item 12 (juntar `.bone`) | plano próprio, semana própria |
| Tirar o interruptor Montagem\|Animando (lote 4 do fluxo) | só depois dos lotes 1, 2 e 3, e com ele vendo |
