# Rodada 47 — o padrão dos painéis, o programa inteiro

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 06/10/2026, 22h07.
**A última do polimento.** Abre só quando as rodadas 43, 44, 45 e 46 tiverem largado a máquina. **Parte 1: nenhum código.** Parte 2 só com o "pode". Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5540, Chrome sem janela 9540. Nunca mate processo que não abriu.

**Leia antes:** `CLAUDE.md` · `26 O POLIMENTO - parte por parte 2026-10-06.md` inteiro (a régua do padrão **e o diário**: tudo o que diz "para a 47" é seu) · as oito pesquisas (`27`, `39`, `43`, `51`, `55`, `57`, `66`) e as conferências finais · `editor/src/contract.ts` · `documentos/PARTES.md` (a parte Casca: `ui/`, `panel-groups.ts`, `ui/layout-model.ts`, o CSS comum; e cada painel só para a régua).

## O objetivo que prova a rodada

**A mesma régua em todo painel**: um usuário novo abre qualquer aba e lê o mesmo tipo de rótulo, a mesma unidade, a mesma dica, o mesmo rodapé; nada rola que não seja lista; nada fica cortado em 1920×1080, e em 1280×720 tudo o que é fixo cabe.

## O que já está anotado para você (do diário do `26`)

| Onde | O quê |
|:---|:---|
| Casca | a altura da faixa da linha do tempo: 380 px em 1080 e 176 px em 720, onde não cabe linha de chave nenhuma; a Árvore com 62 px em 720; a coluna que deixa a Malha só com Forma em 1280 e Pesos abaixo em 1920 |
| Aba Entidades | a Montagem vira janelinha de 63 px em 1440 (a linha do slot fica no rolo interno) e 91 px com 3 níveis em 1920: a Montagem tem de ser legível; "2 avisos" na barra contra 1 problema; "skins ▾" não existe em cartão nenhum |
| Painéis | a barrinha mexida pelo teclado anda só uma casa: ao gravar, o painel redesenha e o foco se perde (a mesma forma do Ctrl+seta da Ordem, já consertado lá: copie o conserto) |
| Ficha rápida | sem °, px, × nos números (a 43 cobriu a ficha inteira; confira se a rápida ficou) |
| Linha do tempo | Colar espelhado mora em Editar → Pose, longe do Copiar; Empurrar/Deslocar fecham a janela ao errar o texto |
| Malha | a regra cape_follow segura o osso na animação: a mensagem é boa, mas são 3 gestos a mais |

## Parte 1 — a varredura (sem código)

| # | O que fazer |
|:---:|:---|
| 1 | **A régua, escrita.** Uma página: rótulo (quantas palavras), unidade (onde), faixa (onde), dica (o que diz, em que ordem), rodapé (quando fala), botão (ícone + nome na dica), número (arrasta? conta? passo?). Tire-a do que as rodadas 38 a 46 fizeram: o que a maioria faz vira a régua |
| 2 | **Cada painel contra a régua.** Todos os painéis do menu Janela, um por um, em 1920×1080 e 1280×720, com foto: o que foge da régua, o que corta, o que rola sem ser lista. Uma tabela por painel |
| 3 | **A casca.** A coluna, as faixas, a altura da linha do tempo, o rodapé, a barra de avisos: o que cada tela deixa para cada painel, e onde o fixo não cabe |
| 4 | **O plano dos lotes**: por painel ou por régua (o que for menos golpe), uma versão por lote. Os itens da tabela acima entram todos |

Entrega: `documentos/projeto do programa/68 O PADRAO DOS PAINEIS - a regua e a varredura 2026-10-06.md`, fotos em `backup/fotos-obra/rodada-47/`. Mande ao Diretor: o quadro em cinco linhas. **Pare e espere o "pode".**

## As réguas

| # | |
|:---:|:---|
| 1 | Semáforo com porta, como as outras: "quero fechar" → PODE → arquivo → medir → apagar ao dizer "fechei" |
| 2 | Regra 26 e 29: teste que falha antes; teste e função no mesmo golpe |
| 3 | Lote sem foto não fecha, nas duas telas |
| 4 | Fecho completo (suíte, tsc, conformidade 120, roteiro, medir, pesos, CHANGELOG, ESTADO, montar, versao.py, contagem). **A medição de altura só pode SUBIR**: o que esta rodada mexe é exatamente isso |
| 5 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/` |
| 6 | Backup antes de escrever, INDICE, relógio primeiro |
| 7 | **Não pergunte nada ao Humberto.** O Photoshop e o Spine respondem o que é padrão de painel |

## O que entregar

A cada versão, 6 linhas. No fim: **"larguei a máquina"**, e o número final da medição.
