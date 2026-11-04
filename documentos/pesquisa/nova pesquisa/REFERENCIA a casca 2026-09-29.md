# Referência — a casca: menus, atalhos e janelas de aviso — 29/09/2026

Escrito pelo chat **A2** (`EXECUTANDO · a casca`), às 00h25 (relógio da máquina).
Lote 1 da parte: **a referência antes do código**.

**O mapa dos menus não está aqui.** É do chat O, em
`ONDE FICA CADA BOTAO 2026-09-28.md`. Este documento só cobre três coisas:

| # | Assunto | Serve ao lote |
|:---:|:---|:---:|
| 1 | Onde fica a **lista de atalhos**, e como ela se divide | 3 |
| 2 | A **janela de descarte** (mudanças não salvas) | 3 |
| 3 | As **janelas de aviso** e de confirmar | 2 e 3 |

---

## As fontes

| Programa | Fonte | Link |
|:---|:---|:---|
| Spriter | Manual oficial, versão 1.4 (PDF) | [Spriter_Manual.pdf](https://brashmonkey.com/spriter_manual/Spriter_Manual.pdf) |
| Spriter | Manual oficial, página dos atalhos | [Mouse Controls and Shortcut Keys](http://www.brashmonkey.com/spriter_manual/mouse%20controls%20and%20shortcut%20keys.htm) |
| Spine | Guia do usuário, Configurações | [spine-settings](https://en.esotericsoftware.com/spine-settings) |
| Spine | Guia do usuário, Interface | [spine-ui](https://en.esotericsoftware.com/spine-ui) |
| Spine | Guia do usuário, índice | [spine-user-guide](https://en.esotericsoftware.com/spine-user-guide) |

---

## 1. A lista de atalhos

### Spriter

| Pergunta | O que achei |
|:---|:---|
| Onde fica a lista? | **No manual**, capítulo 36, *Mouse Controls and Shortcut Keys*. **Não achei** em que menu do programa ela aparece |
| Como se divide? | **Uma lista só, sem títulos**, perto de 45 linhas. A ordem agrupa sozinha: criar e mexer na cena · zoom e vista · copiar e colar · selecionar · andar no tempo · tocar · ver e travar |
| Forma de cada linha | `tecla = o que faz`, e **quando vale** entre parênteses: *"(While Bone is Selected)"*, *"(While in Work Area)"* |
| Troca de tecla? | **Não achei** |

O que importa para nós: a mesma tecla vale coisas diferentes **conforme onde
está o mouse** (a roda do mouse na cena ou na linha do tempo), e o manual diz
isso **na própria linha**, entre parênteses.

### Spine

| Pergunta | O que achei |
|:---|:---|
| Onde fica a lista? | **Configurações** (`F12`, ou o logo → Settings) → grupo *Files* → **Hotkeys**. Abre um **arquivo de texto**, `hotkeys.txt`, com **todas** as teclas |
| Como se divide? | **Não achei** a divisão do arquivo descrita no guia |
| Troca de tecla? | Sim: edita-se o texto. Apagar o conteúdo e reabrir volta às teclas de fábrica |
| A tecla na dica | A dica de cada botão aparece ao passar o mouse; desligada nas Configurações, ainda sai com `F1` |

### O que seguimos

| Decisão | Por quê |
|:---|:---|
| A lista **continua** em Ajuda → Atalhos, com a troca de tecla que já existe | é onde a casa já pôs, e é mais fácil de achar que um arquivo de texto |
| As teclas de painel entram **na mesma janela**, numa **seção dobrada** por lugar: *Cena*, *Linha do tempo*, *Árvore*, *Ordem* (D7) | o Spriter põe o **lugar** dentro da linha. Com ~45 linhas cabe; com as nossas não cabe, então o lugar vira o título da seção |
| O "quando vale" fica escrito na linha | modelo do Spriter: *"(While Bone is Selected)"*. A nossa tabela já tem o campo `when` |

---

## 2. A janela de descarte — mudanças não salvas

| Programa | O que achei |
|:---|:---|
| Spriter | **Não achei** no manual. O PDF não fala de salvar antes de fechar |
| Spine | **Não achei** no guia oficial. Um tópico de fórum diz que o Spine pergunta antes de fechar, mas o texto não carregou: **não confirmado** |
| Spine | O que o guia diz: **cópia de segurança automática** (*Automatic backup*), gravada de tempos em tempos quando há mudanças desde o último salvar |

**Não há modelo escrito para copiar.** O que seguimos é o modelo **da casa**,
que já vale para o rascunho (degrau 11, lote 7, A2): **janela nossa**, e **cada
botão diz o que faz**. O `confirm()` do navegador só tem **OK** e **Cancelar**.

| Botão | O que faz |
|:---|:---|
| **Salvar e continuar** | salva, depois segue |
| **Continuar sem salvar** | segue, e o trabalho não salvo se perde (em cor de perigo) |
| **Voltar** | não faz nada. É o que `Esc` e clicar fora fazem |

---

## 3. As janelas de aviso e de confirmar

| Programa | O que achei |
|:---|:---|
| Spine | **Confirmar ao apagar** é uma opção (*Delete confirmation*). Desligada, o Spine apaga sem perguntar, e `Ctrl+Z` desfaz |
| Spriter | Aviso **escrito no manual**, em maiúsculas, antes de uma função que muda arquivos sem volta (juntar dois projetos): *"ALWAYS make backup copies"*. **Não achei** a janela que o programa mostra |

O que seguimos: **pergunta só quando não há volta.** O que o `Ctrl+Z` desfaz
não precisa de janela; o rodapé diz o que aconteceu. É a régua do arroz: a
água ferveu, o programa **diz**.

---

## O que NÃO achei — em uma tabela

| O quê | Onde procurei |
|:---|:---|
| em que menu do Spriter fica a lista de atalhos | manual 1.4, PDF inteiro |
| a divisão do `hotkeys.txt` do Spine | guia, Configurações e Interface |
| a janela de "salvar antes de fechar", nos dois | manual do Spriter; guia do Spine |
| DragonBones | **não pesquisei**: a ficha pede Spriter e Spine |

## Dois achados para o Planejador, fora da referência

| # | Achado | Dono |
|:---:|:---|:---|
| 1 | O `confirm()` do descarte mora em `ui/shell-drop.ts:276`, que é do chat E | a decidir |
| 2 | Há um segundo `confirm()` em `io/open-save.ts:859` (*"O arquivo tem avisos… Salvar mesmo assim?"*) | chat E |

---

## 4. A cena e a faixa de baixo — para o K13 (acrescentado às 05h)

O defeito: abrir **Detalhes** encolhe a cena a ~190 px em 1440×900 (chat K).

| Programa | O que achei | Fonte |
|:---|:---|:---|
| Spine | Em modo de animar, o **Graph** fica embaixo e o **Dopesheet** é aba ao lado dele. As vistas mudam de tamanho **arrastando a borda**. O guia **não diz** se há tamanho mínimo da cena | [spine-ui](https://en.esotericsoftware.com/spine-ui) |
| Spriter | A linha do tempo cresce **puxando a borda de cima para cima**. O manual **não diz** o que acontece com a área de trabalho | [Advanced Timeline Editing](https://brashmonkey.com/spriter_manual/advanced%20timeline%20editing.htm) |

**Nos dois, quem decide a altura é a pessoa, arrastando a borda.** Nenhum dos
dois documenta a faixa crescendo sozinha. Não achei regra de mínimo escrita.

| Decisão | Por quê |
|:---|:---|
| A cena tem **altura mínima**; abrir Detalhes **não** passa dela | é o pedido do Planejador (K13), e nenhum dos dois programas encolhe a cena sozinho |
| Quem cede é a faixa de baixo: ela **rola** por dentro | o conteúdo dos Detalhes continua todo lá, só que rolando |
| A borda continua arrastável, como no Spine e no Spriter | a pessoa ainda pode dar mais espaço à faixa, se quiser |
