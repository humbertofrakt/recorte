# 03 · Imagens e pivô

## Decidido

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| I1 | **Padrão da arte: sem recorte.** Mesma tela, encaixe no mesmo pixel; desenho já recortado alinha à mão uma vez. *"isso e o padrao que vamos seguir"* | `PADRAO sem recorte - pivo automatico sem PSD 2026-09-16.md` · chat PESQUISA peles 16/09 | Imagens e pasta · Malha e pivô | existe (é padrão de arte) |
| I1b | **O osso é a fonte da verdade**: a imagem nova entra pelo pivô do osso | `AS QUATRO PESQUISAS - lista unica`, acréscimo I1 (lote 56, `pivot-model.ts`) | Malha e pivô | existe |
| I1c | **Pivô guardado por nome** no atlas; não se perde ao trocar a imagem | `PLANO peles em bloco - rascunho`, lote A (`io/pivot-atlas.ts`) | Malha e pivô | existe |
| G6 | Trocar mão, boca, olho **por pasta, no botão direito**: miniaturas da mesma subpasta, outro clique troca pelo pivô. *"troca por chave me parece ruim vamos seguir o sistema do spriter"* | chat PESQUISA peles 16/09 · lista única acréscimo I2 (lote 60, `image-picker*.ts`) | Imagens e pasta | existe — **só está no comentário do código**, sem manual. 🗣️ **Trocar a imagem grava a chave** (RESPOSTAS Q9); hoje só grava com Gravar ligado — muda com M6 |
| I4 | **Trocar a pasta inteira**: apontar para outra pasta e trocar todo o acervo pelas imagens de mesmo nome. Hoje "Recarregar" só relê a mesma. Um só desfazer; nome repetido em duas subpastas **avisa, não escolhe** | `PROJETO DAS PELES` §4 · `PLANO peles em bloco`, lote A (ideia dele 16/09) | Imagens e pasta | a fazer |
| E6 | A grade do botão direito **lista também entidades** | arquivo `02` | Imagens e pasta | a fazer |

## O PSD e a guia

| O quê | Fonte |
|:---|:---|
| Ele gostou do pivô automático do plugin do Spine: *"pivo altomatico com o psd isso OURO"*. O plugin lê a guia do PSD como 0,0 e grava o deslocamento real | chat PESQUISA peles 16/09 · chat DIRETOR 16/09 |
| **O nosso não lê a guia**: `psdPlacement` usa o meio da tela (`ferramentas/src/importar/psd.ts:712`) — conferido pelo Diretor | chat DIRETOR 16/09 |
| Proposta do Diretor: PSD pela guia; sem guia, pela tela; tamanho diferente avisa. 🗣️ Resposta dele: **criar também um sistema de alinhar a imagem** — não só o PSD | RESPOSTAS Q29 |
| 🗣️ **PSD aceito como pele: grupo do PSD = pasta** | RESPOSTAS Q17/Q18 |

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| I8 | 🗣️ **Sistema de alinhar a imagem** (qualquer imagem, não só PSD): pela guia quando houver; sem guia, pela tela; tamanho diferente avisa. O gesto: tabela dos três antes de desenhar | RESPOSTAS Q29 | Imagens e pasta · Malha e pivô | a fazer |

## Pasta como pele

A pasta inteira trocando o acervo (I4) é o **character map por nome de arquivo**. 🗣️ Seguir o Spriter: uma imagem por vez **ou** a pasta inteira; **grupo do PSD = pasta**. O desenho completo está em `04 peles.md`.

## Perguntas deste assunto

Nenhuma aberta. Respondidas em 17/09: Q9, Q12 (chave de sequência como opção — `05` G12), Q18, Q29.
**Pesquisa em curso:** o **Modo Pivô** (tela para acertar o pivô de todos os desenhos e pôr em pasta) — ver `06`.
