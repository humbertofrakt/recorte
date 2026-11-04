# 09 · Correções — erros que não vamos repetir

Dois tipos: **defeitos nossos** que o programa novo não pode herdar, e **queixas dos outros programas** que não podemos cometer.
Fontes: `documentos/planos/OS ERROS QUE NAO VAMOS REPETIR 2026-09-16.md` (**P4**) · `O QUE AINDA NAO TEMOS 2026-09-16.md`, "Defeitos" (**P1**) · `AS QUATRO PESQUISAS - lista unica 2026-09-16.md` (**LISTA**).

## Defeitos nossos — o programa novo nasce sem eles (regra 21)

| # | Defeito | Onde hoje | Fonte |
|:---:|:---|:---|:---|
| A1 | O **rascunho falha calado** (aba anônima, cota cheia): `writeDraft` devolve `false`, ninguém avisa | `ui/shell-drop.ts:243-246` | P4 §1 |
| A2 | Na recuperação, **"Cancelar" apaga o rascunho** (é um `confirm`) | `main.ts:160-167` | P4 §1 |
| A3 | Caixa e máscara dizem *"arraste com a ferramenta Malha"*; a Malha não pega os cantos | `panels/properties-model.ts:798,828` | P1, defeito 1 |
| A4 | Regra **Comando** (driver) nasce com `targets: []` e não faz nada; a lista não avisa | `panels/rules-model.ts:321` · `runtime/src/loader.ts:1515` | P1, defeito 2 |
| A5 | Física: **Inércia** mostra `1` quando falta o valor; formato e runtime usam `0,5` | `panels/properties-model.ts:1007` | P1, defeito 3 |
| A6 | **Escala de referência** mostra `1` quando falta; o formato diz `100` (§4.1) | `panels/properties-model.ts:1052` | P1, defeito 4 |
| A7 | Botão direito na cena faz **duas coisas conforme o pixel**, sem outra porta no menu | `viewport/viewport.ts:1132-1146` | P4 §5 |
| A8 | **Função sem porta nem palavra**: Colar espelhado, Copiar a pose, Empurrar, Limpar repetidas sem tecla nem manual; `rippleMove` semanas inalcançável; trocar imagem pela pasta só no comentário do código | `QUADRO ABERTO` 15/09 | P4 §5 · LISTA acréscimo I2 |
| A9 | **O manual diz "funciona" onde não funciona**: o lápis das peles não marca osso nem regra (MAN 3) | teste ao vivo 16/09 | `PESQUISA peles` §4.1 |
| A10 | **A prova mediu o painel vazio e disse "cabe"** (13/09) | — | `CLAUDE.md` regra 21 |

## Queixas dos outros — "a caminho" se não cuidarmos

| # | Erro dos outros | O risco no programa novo | Fonte |
|:---:|:---|:---|:---|
| B1 | **Alt para criar osso** brigou com o Linux (Spriter; dev confirmou) | **evitado**: 🗣️ o Alt sai, criar osso vai para o B (`05` G1) | P4 §4 · RESPOSTAS Q4 |
| B2 | **Mexer na pose base muda todas as animações**, sem "ajustar" (Spine, 4 threads) | 🗣️ é o modelo dele, de propósito: vale em todas, **menos onde uma chave barra**; sem "ajustar" (`02` M3) | P4 §4 · RESPOSTAS Q27 |
| B3 | **Auto Key assusta**: grava chave só de arrastar a agulha (Spine admitiu) | 🗣️ editar sempre grava (`02` M6). Cuidar: **arrastar a agulha nunca grava**; Key all / Key selected protegem a pose | P4 §4 · RESPOSTAS Q1 |
| B4 | **Mesma semente** em todas as partículas (Unity) | semente por emissor (`07`) | P4 §9 |
| B5 | **Plugin de motor feito por terceiro morre** (Spriter, DragonBones) | não temos plugin; Godot oficial é pedido de 7 anos | P4 §6 · `O QUE OS USUARIOS PEDEM` OURO 11 |
| B6 | **Trocar ferramenta que funciona** tira gesto de quem já sabia (gráfico do Spine 4.0) | o programa novo troca muita tela | P4 §4 |
| B7 | **Função escondida no botão direito** (Spriter admitiu, dez/2024) | ver A7 | P4 §5 |
| B8 | Osso cinza, não seleciona — **trava ligada sem saber** (Spine) | seleção em caixa avisa; clique simples: não confirmei | P4 §4 |
| B9 | Mudou a pasta de imagens: tudo "Missing Image", **sem troca em lote** (Spriter) | resolve com I4 (`03`) | P4 §1 |

## O que já protege — ninguém afrouxa

| Proteção | Contra | Fonte |
|:---|:---|:---|
| Spec §2.4: minor nunca quebra; `minVersion`; `generator` no cabeçalho | o tema mais citado contra o Spine (6 fontes) | P4 §3 |
| Dois runtimes (TS e Python pelo texto) + conformidade | runtime que morre | P4 §6 |
| Formato aberto, spec na pasta | empresa que some (BrashMonkey suspensa, DragonBones parado) | P4 §7 |
| Roda no navegador, sem conta, sem biblioteca | não abre, exige login | P4 §1–2 |
| Todo Command com `apply` e `revert` | desfazer com bug | P4 §4 |

**Atenção ao M13** (sem compatibilidade, `02`): a regra de minor continua valendo **dali para frente**.

## Não confirmado

Travar em sessão longa · imagem de 4000 px · pesos à mão tediosos · pesos automáticos que perdem volume · cor do pincel tapando a imagem. Fonte: P4 §2, §8.
