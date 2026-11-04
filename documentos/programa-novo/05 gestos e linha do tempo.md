# 05 · Gestos e linha do tempo

## Decidido — "copia o Spriter"

Palavra dele, 16/09: *"copia o spriter"*. Vale para as três.

| # | Gesto | Hoje no Recorte | Vai ficar | Fonte | Parte |
|:---:|:---|:---|:---|:---|:---|
| G1 | Criar osso | **N** (`ui/keys.ts:128`) | ~~Alt~~ → 🗣️ **B** (de *bone*). **O Alt sai**: *não repetir o erro do Spriter*. **Posar vai de B para Y** (livre; fila Q W E R T Y das ferramentas de mexer) · **N fica livre** — decisão do Diretor, delegada por ele | `QUADRO ABERTO` 16/09 · RESPOSTAS Q4 · lote 2 Q36 | Cena · `ui/keys.ts` |
| G2 | Selecionar chaves | Shift (`panels/dopesheet-pointer.ts:66-67`) | 🗣️ **como no Photoshop: Ctrl + clique seleciona · Ctrl + arrastar duplica** | `QUADRO ABERTO` 16/09 · RESPOSTAS Q3 | Linha do tempo |
| G3 | Copiar a ordem dos desenhos | Editar → Copiar a ordem na animação | **chave a chave** | `QUADRO ABERTO` 16/09 | Ordem · Linha do tempo |

## Decidido em 17/09 — teclas

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| G7 | 🗣️ **Sistema de trocar as teclas** (atalhos remapeáveis) — *"já devia existir"*. Também pedido antigo de usuários do Spine e do Spriter | RESPOSTAS Q3 · `O QUE OS USUARIOS PEDEM` OURO 16 | Casca e menus (`ui/keys.ts`) | a fazer |
| G8 | 🗣️ **Igualar ao Spriter os gestos "diferente"** (`Z`/`Shift+Z`, duplo clique abre pivô, `1`/`2`, Ctrl+D em todas as chaves…) **se fizer sentido** — o Planejador decide caso a caso, com a tabela dos três | RESPOSTAS Q22 · `O QUE O SPRITER TEM` pedaços 1 e 3 | várias | a fazer |
| G9 | 🗣️ **Variáveis e tags pela tela**, provavelmente — **com um jeito de desligar** | RESPOSTAS Q23 | Ficha · Linha do tempo | a fazer |

## Avisos antes de programar G1 e G2

| Aviso | Fonte |
|:---|:---|
| **Troca de três teclas**: `b` Posar → `y`; `n` Criar osso → `b`; `n` livre (`ui/keys.ts:127-128`). O teste de conflito julga; o manual e a dica mudam junto | conferido no código em 17/09 · lote 2 Q36 |
| Alt continua com dois usos: Alt + meio do lado **inclina**; Alt + clique na régua **marca o laço** (`panels/dopesheet.ts:1536`). Com G7 o usuário pode trocar | `OS ERROS QUE NAO VAMOS REPETIR` §4 |
| Ctrl + arrastar já **clona** a chave hoje (v12.9): G2 confirma. O que muda é Ctrl + clique, que hoje não soma | RESPOSTAS Q3 |

## Decidido — gravar e trocar de pai

| # | O quê | Fonte | Parte | Estado |
|:---:|:---|:---|:---|:---|
| G4 | Em animação, **trocar de pai grava chave**, sem perguntar; a barra diz o que fez; as chaves seguintes passam ao pai novo; um desfazer. *"como o Spriter faz? Isso é lei."* | `PLANO fluxo criar e animar - lotes 1 e 2` + Desvios · chat CHAVE PARENT | Árvore · Cena · Linha do tempo | existe (v12.6, v12.8) |
| G10 | 🗣️ **O desenho troca de osso por chave**, como no Spriter (campo novo aprovado — `10` F8) | RESPOSTAS Q10 · `PLANO fluxo` Desvios | Árvore · Cena · Linha do tempo · Formato | a fazer |
| G13 | 🗣️ **O semáforo do Chavear sai** (verde sem chave, vermelho com chave). Com "editar sempre grava", perdeu o motivo; a marca de chave fica na linha do tempo | RESPOSTAS Q2 · palavra dele via Diretor, 17/09 | Linha do tempo | a fazer |
| G11 | 🗣️ **Arrastar uma chave move só ela** — nada de empurrar as seguintes. **Conferir no Spriter e seguir** | RESPOSTAS lote 2, Q20 | Linha do tempo | a fazer (conferir o de hoje) |
| G12 | 🗣️ **Chave de sequência de imagens** (a boca: uma chave para cada vez que a imagem muda) — **como opção** | RESPOSTAS lote 2, Q12 · formato §7.10, §9.6 | Linha do tempo · Imagens | a fazer (só porta) |
| G5 | Criar osso, ponto, caixa, pôr imagem, malha e pesos **no meio da animação**. *"quero a liberdade do Spriter"* | `AS REGRAS DA BASE` §8 · chat MANUAL | Cena · Malha e pivô | existe (v12.6–12.8); **"gerar malha no meio" não confirmei** |
| M6 | 🗣️ **Editar sempre grava** (*mexeu o braço, grava a chave do braço*); **Key all / Key selected** como botões extras para proteger a pose — ver `02` | RESPOSTAS Q1 | Linha do tempo | a fazer |
| E12b | 🗣️ Botão direito na linha do tempo escolhe **a animação da entidade** — ver `02` | RESPOSTAS Q8 | Linha do tempo | a fazer |
| E12–E14 | Faixa da entidade, laço onde foi solta — ver `02` | `AS REGRAS DA BASE` §10–14 | Linha do tempo | a fazer |

## O que a linha do tempo já tem e fica

Copiar o membro (osso e filhos) · colar espelhado · copiar a pose do escolhido (`Ctrl+Shift+C` é sempre a pose inteira) · copiar pela seleção da cena · Ctrl + arrastar clona (confirmado por G2) · Empurrar as chaves · Limpar chaves repetidas (nunca esvazia linha) · esticar, espelhar no tempo, fechar ciclo · marcas, laço, casca de cebola · sete curvas · eventos · Prévia em camadas.
Fonte: `PLANO linha do tempo - copiar e colar - 2026-09-14.md` · `PROPOSTAS linha do tempo` §2 · MAN 4. Detalhe em `11`.

**Aviso da pesquisa 4:** quatro desses comandos (Colar espelhado, Copiar a pose, Empurrar, Limpar) **não têm tecla nem manual** — ver `09`.

## Propostas, sem palavra dele (💡)

| O quê | Fonte |
|:---|:---|
| Somar e escalar valores em várias chaves · repetir trecho N vezes · aparece/some daqui · copiar a curva · cadeado na folha · mover a origem (M + arrastar, do Spriter) · alças da cebola na régua · copiar pivô entre imagens | `PROPOSTAS linha do tempo - copiar e repetir` #3, 5, 7, 13–15, 17–18 |
| Chavear não grava o pai · osso e desenho juntos: só o osso ganha chave · ciclo checado na árvore do instante · **linha "Pai" na folha**: igual à linha de Desenho, uma célula em degrau com o nome do pai, sem desenho novo | `PLANO fluxo` Desvios · `LEVANTAMENTO trocar de pai` §2, §5 |
| Comando nunca muda de sentido conforme a seleção | `PLANO linha do tempo` Desvios item 9 |
| Construir e Animar como **arranjos** no menu Janela | `AVALIACAO o modo montar` §4 |
| Menu de contexto como o do Photoshop — 🗣️ **para depois** | RESPOSTAS Q5 |

## Pedidos de usuários de fora (não são dele)

| O quê | Fonte |
|:---|:---|
| **Trajeto do movimento**, visível e editável (Spine nunca fez) | `O QUE OS USUARIOS PEDEM` OURO 3 |
| Zoom fino na linha do tempo · pastas na linha do tempo · seleções guardadas · deslocar chaves sem destruir | idem, OURO 17, 14, 15, 13 |
| Curvas: presets, Favor, Store, alças que acompanham, "última curva", copiar curva para vários ossos | `O QUE AINDA NAO TEMOS` §15 Graph · lista única D8 |
| Folha: Offset, Adjust, Sync, filtros, tocar sem interpolar | `O QUE AINDA NAO TEMOS` §15 Dopesheet · lista única D10 |
| Breakdown que favorece uma chave (Harmony 25) · assar regra em chaves (Spine 4.3) · marionete gravada com o mouse | `O QUE AINDA NAO TEMOS` Parte 3 |

## Perguntas deste assunto

Nenhuma aberta. Respondidas em 17/09: Q2 (semáforo sai), Q12, Q20, Q36 (lote 2) · Q1, Q2, Q3, Q4, Q10, Q13, Q22, Q23, Q27 (`RESPOSTAS do Humberto 2026-09-17.md`).
