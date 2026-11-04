# 02 · O modelo — projeto, bases, corpos, entidades

O coração do programa novo. Ditado pelo Humberto de 14 a 16/09.
Fonte principal: `documentos/planos/AS REGRAS DA BASE 2026-09-14.md` (sigla **BASE**). Manual: capítulos 2 e 5 (**MAN**).

**Quando dois lugares discordam, vale o mais novo** — a linha diz o que foi substituído.

## O projeto é a caixa

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| P1 | **O projeto é a caixa**: corpos, entidades, animações. Não há corpo principal. *"Mecha não é um corpo, é um projeto"* | BASE §15 · chat MANUAL 15/09 | Arquivo | a fazer (pacote `.bonez` §2.9 existe) |
| P2 | Salvar grava o projeto inteiro; **entregar ao jogo pode levar só um corpo** | BASE §15 · MAN 2 | Arquivo | a fazer |
| P3 | Novo, Abrir e importar PSD falam de **projeto e corpo** | MAN 0, 1, 2 | Arquivo · Casca | a fazer |

## Bases e corpos

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| M1 | **A base é uma animação com só o quadro 0.** Não é modo nem tela | BASE §8 · MAN 2 | Formato · Animações · Linha do tempo | a fazer |
| M2 | **Uma pose por base** (homem, lobisomem). Não existe "a pose padrão". *Substitui* "a pose de repouso fica" (`PEDIDOS o fluxo`, 14/09) | BASE §8 | Formato e runtime | a fazer |
| M3 | Toda animação herda a base; o que não tem chave vem dela. 🗣️ **Sem "ajustar"**: a base vem antes do quadro 0; mexer na base (pôr óculos) vale em **todas** as animações, **menos onde uma chave barra** (a cabeça que explode); mexer no quadro 0 de uma animação vale nela até a próxima chave daquela peça | BASE §1, linha 40 · RESPOSTAS Q27 | Formato · Linha do tempo | existe com 1 pose; várias, a fazer |
| M4 | **O modo Montar sai**; o interruptor Montagem/Animando sai da barra. 🗣️ **Tudo sempre disponível**: nenhuma ferramenta some ao animar | BASE §8 · `QUADRO` 14/09 · RESPOSTAS Q5 | Casca e menus | a fazer |
| M5 | **O tocador nunca apaga**: sempre há base ou animação aberta; arquivo novo nasce com uma | `AVALIACAO o modo montar` §5 · MAN 2 | Linha do tempo | a fazer |
| M6 | 🗣️ **Editar sempre grava**: *mexeu o braço, grava a chave do braço*. Sai o "recusa" do Gravar sozinho desligado (`anim/pose-mode.ts`, saída `bloqueado`). Chave à mão só quando precisa: **Key all / Key selected** como botões extras, para proteger a pose (Spriter cap. 15) | BASE §8 · RESPOSTAS Q1 | Linha do tempo | a fazer |
| M7 | Mexida que não se anima (osso novo, malha) vai **para a base daquela animação**, e a tela diz onde foi, sem barrar. *Substitui* "vai para o repouso" (`PLANO fluxo` lote 2, 14/09) | BASE §8 · MAN 2 | Cena · Malha e pivô | a fazer |
| M8 | **Cada corpo tem as suas animações.** Janela Animação: Corpos em cima, Animações embaixo; trocar o corpo troca a lista | BASE §10–11 · MAN 2 · chat MANUAL | Animações | a fazer |
| M9 | Salvar como **base nova**, com nome, de dentro da animação | BASE §1 · MAN 2 | Animações · Arquivo | a fazer |
| M10 | **Colar uma base no meio da animação**: a virada é corte seco | BASE §1, §9 · MAN 2 | Formato · Linha do tempo | a fazer |
| M11 | Osso que só existe na base nova **nasce na virada** (não "presença") | BASE §16 | Formato e runtime | a fazer |
| M11b | 🗣️ O corpo novo ter peça que o antigo não tem (o rabo do lobisomem) **é esperado**: a entidade que não acha slot de mesmo nome **não é recusada**, e não há erro — só informa, se for útil | RESPOSTAS Q6 | Cena · Animações | a fazer |
| M12 | Depois da virada, cena, Árvore e Propriedades mostram **o corpo daquele instante** | MAN 2 · chat MANUAL | Cena · Árvore · Ficha | a fazer |
| M13 | **Sem compatibilidade** com projetos antigos; o formato fica livre | BASE §16 | Formato e runtime | a fazer |
| M14 | Convenção de nomes de osso é **nossa e publicada** | BASE §16 | Formato (bloco `rig` §4.8 existe) | a fazer |

## Entidades

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| E1 | Base se anima à mão; **entidade já vem animada** — só se escolhe qual animação toca | BASE §12 · chat MANUAL | Animações · Linha do tempo | a fazer |
| E2 | **Base vira entidade e entidade vira base**; as animações vêm junto | BASE §19 · MAN 5 | Animações | a fazer |
| E3 | Entidade é projeto finalizado: abrir mostra as bases e animações dela; fechar devolve à aba | BASE §19 | Animações · Imagens e pasta | a fazer |
| E4 | Salvar entidade editada pergunta **"Novo" ou "Por cima"**, e o aviso diz o que acontece | BASE §19 | Arquivo | a fazer |
| E5 | **A entidade segue a IMAGEM, nunca o osso.** *"Não se guarda a mão direita nas costas"*. **O socket (encaixe por nome de osso) sai**; `mecha.bone` e `capacete.bone` são refeitos pela imagem; a espada é trocada por entidade | BASE §13 · MAN 5 · RESPOSTAS Q7 (decidido 15/09) | Cena · Formato | a fazer (formato permite, §7.11) |
| E6 | **Sem tela de encaixes.** A grade do botão direito passa a listar entidades | BASE §13 · `QUADRO` 15/09 | Imagens e pasta · Cena | a fazer (a grade existe) |
| E7 | **Imagem parada primeiro**, depois troca pelo movimento (hélice); herda osso, pivô, ordem, chaves | chat MANUAL 15/09 · MAN 5 | Imagens e pasta | a fazer |
| E8 | Todo corpo é **adaptador com pino e tomadas**; um só tipo de peça; o anel é tomada entre duas partes | BASE §18 (substitui §12 e §17) | Formato · Cena · Ordem | a fazer |
| E9 | **Pendurar cria uma tomada** na hora, onde a peça foi solta | BASE §20 | Cena · Árvore | a fazer |
| E10 | Entidade é **imagem com relógio**: tem o que a imagem tem, nem mais nem menos | BASE §21 | Árvore · Ordem · Cena | a fazer |
| E11 | Entidade tem **lugar na ordem de desenho**, pode ficar acima de tudo | BASE §12 · MAN 5 | Ordem | a fazer |
| E12 | **Uma animação dirige corpos e entidades** ao mesmo tempo | BASE §12 · MAN 5 | Linha do tempo | a fazer |
| E12b | 🗣️ **Escolher a animação da entidade**: na linha do tempo, **botão direito** abre a lista das animações dela; clicar escolhe | RESPOSTAS Q8 | Linha do tempo | a fazer |
| E17 | 🗣️ **Abrir outro `.bone`** traz o projeto **como base** (editável) ou **como entidade** (fechado, sem editar) | RESPOSTAS Q13 | Arquivo · Animações | a fazer |
| E18 | 🗣️ **Animação para outro personagem** (`rig`): **definir agora**, e tem de **encaixar no sistema de peles** | RESPOSTAS Q14 · `PEDIDOS reutilizar` lote C | Formato · Animações · Peles | a fazer — entra no degrau 1 |
| E13 | Sem laço: **faixa** — arrastar = `origin`, esticar = `timeScale` | BASE §10–11 · MAN 5 | Linha do tempo | a fazer (runtime já faz a conta) |
| E14 | Em laço: **roda sozinha, começando onde foi solta** | BASE §11, §14 · MAN 5 | Linha do tempo | a fazer |
| E15 | Painel **Entidades** ao lado do Imagens. *Substitui* "aba Peças" do MAN 5 | BASE §21 | Imagens e pasta | a fazer |
| E16 | Miniatura da entidade **parada**. *Substitui* "miniatura animada" do MAN 5 | BASE §21 (veto dele) | Imagens e pasta | a fazer |

## Perguntas deste assunto

Q30 — texto no `12 perguntas abertas.md`. Respondidas em 17/09: Q5, Q6, Q7, Q8, Q13, Q14, Q27 (`RESPOSTAS do Humberto 2026-09-17.md`).
