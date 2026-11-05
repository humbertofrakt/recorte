# Entidades e tomadas — relatório da noite

05/11/2026. Executor das entidades (`recorte-54`), ramo `obra/entidades`.
Para o Humberto, pelo Diretor.

## Em cinco linhas

| # | |
|:---:|:---|
| 1 | **A espada de um, o boneco de outro funciona, pela tela.** `npm run espada`: 18 de 18 |
| 2 | **As tomadas existem na tela.** Ícone no osso, botão direito, menu e aba **Tomadas**. `npm run tomadas`: 11 de 11, só clicando no que se vê |
| 3 | **As duas direções são o mesmo gesto:** o herói segura a espada; o herói entra na cabine do mecha |
| 4 | Oito defeitos consertados, cada um com teste visto vermelho antes |
| 5 | O formato `.bone` não mudou. Só a tela |

## O que fiz · como provei · o que ficou

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| Pessoa A desenha e anima a espada; pessoa B a põe na mão, liga "mexe junto", anima o golpe; A muda a cor, B reabre | `npm run espada`, 18 de 18; o validador; o runtime (a espada no pino da mão, tocando o `attack` dela) | a espada nova chega por cópia dos três arquivos: o navegador não relê a pasta de outra pessoa sozinho |
| **Tomada** na cena: um ícone por tomada, com dica. Clique: o menu dela | `npm run tomadas`, passos a3, b3, b4 | — |
| **Encaixar um projeto…** no botão direito do osso (cena e Árvore) e no menu **Tomadas**. Num osso sem tomada, ela nasce junto | passos a2, b3; testes do modelo | — |
| **Pôr uma tomada aqui…** pergunta o nome (cabine, mão, costas) | passo b2 | — |
| Arrastar uma peça da lista **Peças** (ou um `.bone` do disco) até o ícone | passo a4 (a lista); o disco só no código | o `.bone` do disco solto na tomada não tem prova de tela: o Playwright não arrasta arquivo do sistema |
| **Mexe junto com a animação de quem segura** e **Animação própria, sempre ligada** no menu da tomada | passo b4; testes | — |
| O menu **Entidades** e a aba viram **Tomadas**; Montagem e Prateleira viram **Encaixes** e **Peças**; "Pôr o projeto dentro de…" vira **Este boneco entra em…** | as réguas da casa (menus, ações, tarefas) atualizadas, com o motivo | o capítulo 5 do manual ainda diz "Entidades" (é da sessão do manual, 00-10) |
| O mecha salvo com o herói dentro | passo d: validador aceita; o runtime monta herói e espada | — |
| Manual: capítulo **11**, a espada e as tomadas, com 16 fotos | `ajuda.test.ts`: toda imagem nova citada | — |

## Os defeitos consertados

| # | Forma do erro | Teste |
|:---:|:---|:---|
| 1 | a imagem da entidade morava só no documento dela: a espada de fora não se desenhava | `pasta-do-projeto`, "a espada de um" |
| 2 | trazer só o `.bone` deixava o atlas para trás, sem dizer o que fazer. Agora pede a pasta | idem |
| 3 | o Salvar levava o `.bone` da entidade e não o atlas dela | idem |
| 4 | "mexe junto" só existia na peça de teste | rodada 39b |
| 5 | a página de ontem era tomada por arte: nascia `espada-atlas2.png` a cada salvar (`io/folder-save.ts`, parte Imagens) | "a espada de um" |
| 6 | a peça encaixada nascia deitada no eixo do osso (o herói deitado na cabine). Agora nasce em pé | "as tomadas" |
| 7 | **apagar um campo e, na volta, pô-lo no fim do objeto**: tirar, trocar, desligar o mexer junto e Pôr no projeto voltavam com o arquivo em outra ordem | "as tomadas", a volta exata |
| 8 | um `backup/` criado no clone ligava cinco testes do PC do Humberto. Não é defeito do programa: é cuidado da noite | — |

## Decisões tomadas no lugar do Humberto

| Decisão | Por quê |
|:---|:---|
| Tomada vazia = slot sem imagem em pele nenhuma | não precisa de campo novo no formato (regra 7) |
| Encaixar já liga **mexe junto** | é o que se espera: o herói ataca, a espada ataca. É o que a espada de exemplo faz |
| A peça nasce em pé no mundo | como o arrasto da prateleira; o Unreal faz o socket no eixo do osso, mas em pé é o que a pessoa espera ver |
| Encaixar um arquivo que já está no projeto usa ele, e não cria cópia | trazer duas vezes a mesma espada não deve virar `espada-2` |
| A entidade é cópia na pasta do projeto | o navegador não deixa reler a pasta de outra pessoa sem pedir |

## O que só a mão do Humberto confere

| O quê | Onde |
|:---|:---|
| o ícone da tomada é claro? (⊞ cheio, ⊡ vazio) | a cena, com o herói aberto |
| as palavras: Tomada, Peça, Encaixes, "mexe junto com quem segura" | aba e menu **Tomadas** |
| montar o `programa/` | `python ferramentas/montar-programa.py` na máquina dele: aqui o build apagava imagens |

## A régua

`npx vitest run` (com o `obra/noite-2026-11-04` juntado, 01:35 UTC): **6.010 passam, nenhum vermelho**. `tsc` limpo. Conformidade 138 de 138. `npm run espada` 18/18. `npm run tomadas` 11/11.

FIM
