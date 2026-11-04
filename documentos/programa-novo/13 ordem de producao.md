# 13 · Ordem de produção — a reforma

🗣️ *"já temos muita coisa feita, só algumas mudanças necessárias"* (17/09). **Reforma da v13.2, não recomeço.**
Cada degrau diz **o que já existe** (base, ver `11`), **o que muda** e **onde mexe**. Pelas partes de `documentos/PARTES.md`.
**Sugestão do Planejador, não decisão.** Nenhuma pergunta trava o começo (17/09). A única aberta, Q42, está em `12`.

**Onde mexe** é ponto de partida para o plano do degrau: arquivos citados nos documentos de origem. Quem planejar confere no código antes (regra: testar antes de dizer "existe").

| Degrau | Parte | Já existe (fica) | O que muda | Onde mexe | Espera |
|:---:|:---|:---|:---|:---|:---|
| 1 | **Formato e runtime** | spec, runtimes TS e Python, 53 casos · `.bonez`, `rig`, `assets`, esqueleto aninhado §7.11, `origin`/`timeScale` no runtime | **acrescenta** F1–F6: várias bases, corpos com animações, a virada, entidade que segue a imagem, pino e tomadas, nomes de osso · **e** F8 desenho troca de osso por chave · F9 pesos animáveis · F18 animação escolhida da entidade · F19 a `default` sai do fundo fixo · F20 animação para outro personagem · F16 área de recorte por animação · F22 a pele de cima vence · F15 a pele mora no corpo · F23 pele de fora com osso · F24 animação de fora ajusta o tamanho · F25 pele vira base e opção da pilha na virada · **tira** o socket (F7). Sem compatibilidade antiga (M13) | `formato/` · `runtime/` · `runtime-python/` · `conformidade/` | nada — pode começar |
| 2 | **Animações** | janela Animação, nova, duplicar, mistura, Prévia | **ganha** a lista Corpos em cima (M8); salvar como base nova (M9); promover e rebaixar entidade (E2, E3) | `panels/animations*.ts` · `anim/animations.ts` | degrau 1 |
| 3 | **Linha do tempo** | toda a folha de chaves de hoje (`05`, "o que já tem") | **muda**: tocador nunca apaga (M5) · **editar sempre grava**, sai o `bloqueado` (M6, `anim/pose-mode.ts`) · Ctrl + clique seleciona, Ctrl + arrastar duplica (G2, `panels/dopesheet-pointer.ts:66`) · ordem chave a chave (G3) · **ganha** Key all / Key selected · a faixa da entidade e o botão direito que escolhe a animação dela (E12–E14, E12b) · chave de troca de osso do desenho (G10) | `panels/dopesheet*.ts` · `anim/*` | degrau 1 · **sai** o semáforo do Chavear (G13) · **ganha também**: arrastar chave move só ela (G11), chave de sequência como opção (G12) |
| 4 | **Casca e menus** | barra, menus, paleta, painéis que flutuam | **sai** o interruptor Montagem/Animando (M4); **tudo sempre disponível**. Só com 1–3 prontos, **e ele vendo** · **ganha** o sistema de trocar as teclas (G7) · variáveis e tags pela tela, com desligar (G9) | `ui/shell.ts` (não confirmei a linha) · `ui/keys.ts` (`Ctrl+Tab`) | degraus 1–3 |
| 5 | **Cena · Árvore · Malha e pivô** | criar osso/ponto/caixa/malha no meio da animação (v12.6–12.8) · chave `parent` · Transformar · `P` | **muda**: a mexida vai para a base da animação, não para o repouso (M7) · **B cria osso** (G1) e o Posar muda de tecla · **ganha** corpo do instante na tela (M12), tomada ao pendurar (E9) | `viewport/tools/*` · `panels/tree*.ts` · `mesh/*` · `ui/keys.ts:127` | — (B cria osso, Posar → Y, N livre) |
| 6 | **Ordem · Imagens e pasta** | Ordem com pastas e chave · painel Imagens · a grade do botão direito (lote 60) | **ganha** painel Entidades (E15, E16) · a grade lista entidades (E6, E7) · entidade na ordem (E11) | `panels/image-picker*.ts` · `panels/palette.ts` · `panels/draw-order*.ts` | degrau 1 |
| 7 | **Arquivo, exportar, importar** | `.bone`/`.boneb`/`.bonez`, exportar e importar | **muda** para projeto-caixa na tela (P1–P3) · salvar entidade Novo/Por cima (E4) · entregar um corpo só · **abrir outro `.bone` como base ou como entidade** (E17) · **exportar com as duas opções de recorte**: borda automática (padrão) ou área desenhada por animação, magenta na cena (F16) | `io/*` · `ui/shell-file.ts` · exportar imagem | degrau 1 (F16 entra na spec) |
| 8 | **Ficha, peles** · imagens | peles, "Só com a pele" à mão, exportar por pele · pivô por nome · import PSD | **conserta** o lápis (I5) · **ganha** fazer a pele como o Spriter, uma imagem ou a pasta, grupo do PSD = pasta (I9, I4) · aplicar e modificar (I6) · Feitas/Ativas no lugar do olho (I7) · `default` fora do fundo fixo (I10) · **sistema de alinhar a imagem** (I8) · trocar imagem grava chave (Q9) | `panels/skins*.ts` · `io/project-folder.ts` · `ferramentas/src/importar/psd.ts:712` · `panels/image-picker*.ts` | pele do corpo, pele vira base, opção da pilha, osso da pele de fora (I12–I15) · **B e C aqui, não antes** (Q31) · a de cima de Ativas vence (I7c) |
| 9 | Casca | painéis que descolam e flutuam | **ganha** a quina (C1) · **arranjos com nome** (C6) · **painel Pivôs** (C4) · **tela cheia de Visualização** com animações e peles (C5) | `ui/shell.ts` | teste dele |
| 10 | **Glacê** | sequência, caminho, sliders, eventos com áudio **no formato** | **ganha** portas para o que o formato já tem (`08`, `07` #1–4) · partículas e biblioteca (campos novos) · grade em perspectiva | conforme o item | 🗣️ **partículas depois de bases e peles** (Q15) · 1ª fase fechada (`07`) |
| 11 | **Manual** | capítulos 0–9 | **reescreve** onde a reforma mexeu (os 6 lugares de "personagem"; MAN 3 do lápis) | `documentos/manual/` | a palavra dele |

## As correções — cada uma no degrau da sua parte, nunca no fim

| # | Defeito (`09`) | Onde mexe | Degrau |
|:---:|:---|:---|:---:|
| A1 | rascunho falha calado | `ui/shell-drop.ts:243-246` | 4 |
| A2 | "Cancelar" apaga o rascunho | `main.ts:160-167` | 4 |
| A3 | caixa e máscara citam a ferramenta errada | `panels/properties-model.ts:798,828` | 8 |
| A4 | regra Comando nasce vazia sem aviso | `panels/rules-model.ts:321` | 8 |
| A5 | Inércia mostra `1` em vez de `0,5` | `panels/properties-model.ts:1007` | 8 |
| A6 | Escala de referência mostra `1` em vez de `100` | `panels/properties-model.ts:1052` | 8 |
| A7 | botão direito na cena com dois sentidos | `viewport/viewport.ts:1132-1146` | 5 |
| A8 | função sem tecla nem manual | `ui/keys.ts` · `ui/actions-table.ts` | em todos |

## Como cada degrau fecha

| Passo | Regra |
|:---|:---|
| Plano do degrau em `documentos/planos/`, com a tabela "Como os três fazem" e **o código que ele reforma** | `01` |
| **Não reescrever o que funciona**: mudar o mínimo, com os testes da parte continuando verdes | 🗣️ reforma, 17/09 |
| Uma parte por chat; `fronteiras.test.ts` julga | `CLAUDE.md` 13, 18 |
| Toda função nasce com tecla ou menu, nome na dica (contra A8) | `CLAUDE.md` 12, 17 |
| **Testar ao vivo** antes de escrever "funciona" (contra A9) | `09` |
| A contagem de testes **nunca cai** (2.839 na v13.2) | `CLAUDE.md` 9 |
| Suíte · `tsc` · conformidade · roteiro · medição — um fecho de cada vez; versão numerada; `CHANGELOG` no lote | `CLAUDE.md` 3, 9, 14, 15 |

## O que pode começar sem esperar ninguém

| O quê | Por quê |
|:---|:---|
| Escrever na spec, em texto, o que já está decidido em F1–F6 | decidir no texto antes do código (`01` R5) |
| Corrigir A5 e A6 quando o código descongelar | dois números errados; não dependem do modelo |
| Plano do lote A das peles (trocar a pasta) | não depende do modelo (`04`) |
| Conferir no código as linhas "não confirmei" deste arquivo | preparo do plano de cada degrau |
