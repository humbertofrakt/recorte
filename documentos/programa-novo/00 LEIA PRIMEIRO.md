# 00 · Leia primeiro — o programa novo

> **17/09/2026, fim do dia — PRONTO PARA COMEÇAR.** As perguntas foram respondidas (3 lotes, aplicados). Nenhuma trava o começo. Os chats foram fechados; o próximo Planejador abre pelo `13`, degrau 1.

Montada pelo PLANEJADOR em 17/09/2026. **Esta pasta é a fonte** do programa novo. O manual não tem tudo isto.

## É uma REFORMA, não um recomeço

🗣️ Decisão do Humberto, 17/09: *"já temos muita coisa feita, só algumas mudanças necessárias"*.

O programa novo é **a v13.2 reformada**. O que funciona fica (`11`); o que muda está nos arquivos `02` a `10`; a obra está em `13`, degrau por degrau, **em cima do que existe**. Ninguém reescreve do zero uma parte que já funciona.

## O programa novo, em 10 linhas

| # | |
|:---:|:---|
| 1 | O editor de animação 2D por ossos **que já temos**, com **a fluidez do Spriter e as ferramentas do Spine** |
| 2 | O quadro é **função pura do tempo**: para trás mostra o mesmo quadro, em qualquer leitor |
| 3 | **O projeto é a caixa**: corpos, entidades e animações. Não há corpo principal |
| 4 | **A base é uma animação com o quadro 0.** Cada corpo tem as suas animações |
| 5 | **O modo Montar sai.** Tudo acontece dentro da animação, e editar sempre vale |
| 6 | Uma animação pode **virar de corpo** no meio (homem → lobisomem) |
| 7 | **Entidade** é imagem com relógio: segue a imagem, nunca o osso |
| 8 | **Peles em bloco**: um lápis só, e a pilha Feitas/Ativas do Spriter |
| 9 | **Sem compatibilidade** com projetos antigos: o formato está livre |
| 10 | Onde o programa não entende, **avisa — não improvisa** |

## O mapa da pasta

| Arquivo | O que tem |
|:---|:---|
| `01 a regua e o metodo.md` | função pura · Spriter → Spine → DragonBones · regra 21 · como os chats trabalham |
| **`11 o que fica do programa atual.md`** | **leia antes dos assuntos**: a base da reforma — o que já funciona e não se refaz |
| `02 modelo - projeto, bases, corpos, entidades.md` | **o coração**: projeto, bases, corpos, entidades |
| `03 imagens e pivo.md` | padrão sem recorte · pivô · PSD pela guia · trocar a pasta |
| `04 peles.md` | lápis único · aplicar e modificar · Feitas/Ativas |
| `05 gestos e linha do tempo.md` | copia o Spriter · B cria osso (o Alt sai) · Ctrl como no Photoshop · trocar teclas · chave de pai |
| `06 casca e paineis.md` | o interruptor sai · quina · a régua dos painéis |
| `07 efeitos e particulas.md` | partícula com semente · efeito sem partícula · biblioteca |
| `08 o que falta do Spine.md` | o cardápio, por bloco |
| `09 correcoes - erros que nao vamos repetir.md` | defeitos nossos · queixas dos outros |
| `10 formato - campos novos.md` | o que é campo novo: decisão do Humberto |
| `12 perguntas abertas.md` | **1 aberta** (Q42, não trava). Todas as outras respondidas, com onde entraram |
| `RESPOSTAS do Humberto - lote 3 2026-09-17.md` | o lote 3 — já aplicado (pelo Diretor) |
| `RESPOSTAS do Humberto - lote 2 2026-09-17.md` | o lote 2 — já aplicado |
| `RESPOSTAS do Humberto 2026-09-17.md` | o lote 1 de respostas dele, anotado pelo Diretor — já aplicado |
| `13 ordem de producao.md` | a reforma, degrau por degrau: o que muda em cima do que existe |
| `fontes.md` | de onde veio cada coisa |

## Como usar

| Quem | Faz |
|:---|:---|
| **O Humberto** | lê `00`, depois `12` (as 🔒 primeiro), e responde |
| **Chat novo** | lê `CLAUDE.md` · `documentos/QUEM E QUEM.md` · este `00` · **`11`** · o arquivo do seu assunto · `13` |
| **Planejador** | escreve o plano de cada degrau do `13` em `documentos/planos/`, citando o item (`M6`, `I5`…) **e o código da v13.2 que ele reforma** |
| **Quem descobre algo novo** | acrescenta uma linha no arquivo do assunto, com fonte. Pergunta nova vai para `12` com o próximo número |

Legenda usada: **🗣️** palavra dele · **💡** proposta, sem aval · **🔒** trava o começo · "não confirmei" = não conferido, **não vira verde**.

## O que ficou de fora — de propósito

| O quê | Por quê |
|:---|:---|
| Pendências do programa antigo que o modelo novo apaga: lotes 1–4 do "fluxo criar e animar" como estavam planejados; a avaliação do modo Montar como modo; a janela de encaixes | substituídos por `AS REGRAS DA BASE` (15–16/09) |
| Compatibilidade com `.bone` antigo (a pergunta "o que o leitor antigo vê") | decidido: sem compatibilidade (BASE §16) |
| Painel em janela do sistema (popup) | fora por decisão dele, 13/09 |
| Renomear para BONE BANANA | fase própria, depois (`ESTADO.md`) |
| O manual | só quando ele pedir |
| Mobile, IA gerando pixels (ToonCrafter), máquina de estados do Rive, scripting | não passam na régua da função pura, ou são do jogo (`O QUE AINDA NAO TEMOS` Parte 3) |

**Os documentos de origem continuam onde estavam.** Nada foi movido nem apagado. Lista em `fontes.md`.

## 17/09/2026, noite — o ARQUITETO leu tudo e escreveu o plano da reforma

Quatro documentos em `documentos/planos/`, para ler **antes** do `13`:

| Arquivo | O que tem |
|:---|:---|
| `ARQUITETO 1 - diagnose da heranca do Spine 2026-09-17.md` | onde o programa ainda é o Spine: formato, runtime, editor, provas |
| `ARQUITETO 2 - triagem do que veio do Spine e dos outros 2026-09-17.md` | item por item: traduz, só porta, descarta, depois |
| `ARQUITETO 3 - spec da atualizacao 2026-09-17.md` | o modelo novo escrito: a virada (`body`), a entidade sem socket, a pilha, `slot/bone`, `weights`, `crop`, pele com osso. **Oito perguntas (A1–A8) para o Humberto** |
| `ARQUITETO 4 - tarefas ordenadas 2026-09-17.md` | a obra em 13 degraus, com dependência e paralelismo. Substitui a ordem do `13` onde discorda, dizendo por quê |
