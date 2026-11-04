# Rodadas G6 e G7 — o leitor do Godot: regras e partículas

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Esta rodada escreve código só em `leitor-godot/`.** Continua o trabalho do chat que fez a G1 à G4 (ele parou por contexto pesado, numa rodada fechada).

---

## Onde a obra está

| | |
|:---|:---|
| Feito (G1 a G4) | ler, desenhar parado, animar, malha, máscara, skin. **43 dos 90 casos** passam pelo Godot sem janela: A 13, B 7, X 5, C 18 de 44 |
| Falta, e é seu | **G6**: as 17 de regra (C-200, 210 a 213, 220 a 224, 230, 240 a 242, 260 a 262). **G7**: as 19 de partícula (P) |
| Falta, e **não** é seu | as 9 de entidade e corpo (C-270, 273, 274, 290 a 293, 299, 300: G5, espera a rodada 11) · BIN-401 e ZIP-501 (G8). **Não force esses verdes** |

**Leia antes, nesta ordem:** `CLAUDE.md` · `documentos/projeto do programa/08 OS LEITORES - Godot e Construct 2026-10-05.md` (seções 1, 3, 4, 5) · a ficha `rodadas/RODADA G1 e G2 - o leitor do Godot 2026-10-05.md` (as réguas valem iguais) · `leitor-godot/LEIA-ME.md` · no `03`, as linhas G1 a G4 de "O que cada rodada entregou".

---

## A passagem de quem fez a G1 à G4 (palavra dele, 07h31)

| # | |
|:---:|:---|
| 1 | Cada `.gd` diz no topo de qual `.py` veio. O projeto do Godot é `leitor-godot/` inteiro |
| 2 | Rodar: `RECORTE_GODOT=C:/Users/F-rak/Desktop/Godot_v4.7.2-stable_win64_console.exe`. Testes: `"$RECORTE_GODOT" --headless --path leitor-godot --script res://testes/testes.gd`. Casos: `node ferramentas/conformidade.mjs --adaptador "node leitor-godot/adaptador.mjs" --nivel C` |
| 3 | Referência do desenho: `npx vite-node leitor-godot/testes/gerar-referencia.mjs` (roda o desenhador do Construct). Hoje ela **tira o bloco `constraints`** do herói, porque as regras faltam. Na G6, gere quadros **com** regras e compare |
| 4 | G6, onde ligar: `esqueleto.gd` tem `constraints = []` (vazio de propósito) e um `update_pose` que não chama regra nenhuma (veja o `update_pose` do `skeleton.py`) · `animacao.gd` pula a timeline `constraint` e não tem driver nem `fire_physics_resets` · `carregador.gd` só guarda o `raw` da regra e avisa "ainda nao aplico": troque pelo `_load_constraint` do `loader.py` inteiro, e tire o aviso · `dump.gd`: o `physicsDt` já anda em passos |
| 5 | Armadilhas do GDScript: `Key` é nome do Godot (virou `KeyData`) · classe interna chama função estática de outro arquivo pré-carregado como `const` (`mat.gd`) · `sort_custom` **não é estável** (use `_ordenar_estavel`) · o JSON lê todo número como float · `Vector2` é float32: faça a conta em `Array` de float · `_ready` dentro do `_initialize` só roda no quadro seguinte · laço de `RefCounted` vaza: libere (`liberar()`) |

---

## G6 — regras

| # | O que tem de existir no fim |
|:---:|:---|
| 1 | Copiados de `runtime-python/recorte/constraints.py` (e do que o `loader.py`, o `skeleton.py` e o `animation.py` têm delas): IK, transform, caminho, física, driver, parâmetros, morph |
| 2 | **Os 17 casos de regra passam** pela suíte oficial. Diga o número e a hora do relógio |
| 3 | **A dívida da G1:** o herói **andando, com as regras ligadas** (o `ik_arm`, a capa), bate peça a peça com a referência, em vários quadros de `walk`, `idle` e `attack`. A referência passa a ser gerada **com** o bloco `constraints` |
| 4 | A física depende do relógio: o mesmo instante, pedido pelo mesmo caminho de passos, dá o mesmo desenho. Diga como o nó anda o relógio da física no jogo (passo fixo?) e o que acontece quando o jogo pula quadros |
| 5 | Se ficar grande, **parta em duas** (por exemplo: IK, transform e caminho · depois física, driver e morph) e avise ao fechar a primeira |

## G7 — partículas

| # | O que tem de existir no fim |
|:---:|:---|
| 1 | Copiado de `runtime-python/recorte/particles.py`. **Os 19 casos P passam** |
| 2 | O desenho: todas as partículas de um emissor **numa chamada só** (`canvas_item_add_triangle_array`), cada uma com a sua cor. O brilho (additive) pelo material; se não der, sai normal **e avisa** |
| 3 | A fumaça do exemplo (e as faíscas da skin "fogo" de `heroi-fogo.bone`, se o exemplo do Construct a usa) bate com a referência **partícula a partícula**, em vários instantes; **o mesmo instante pedido de novo dá o mesmo desenho** |
| 4 | Mais de 300 vivas num emissor: desenha todas e **avisa** com o número, como o leitor do Construct |
| 5 | A partícula com folha de quadros (por segundo, pela vida, com quadro inicial): a conta à mão antes, e contra a referência |
| 6 | No exemplo: uma tecla liga e desliga as faíscas. No `LEIA-ME.md`: a pergunta para o Humberto conferir |

---

## As réguas (as mesmas da ficha G1 e G2; as que mais custaram)

| # | |
|:---:|:---|
| 1 | **Só `leitor-godot/`.** Mais a sua linha no `03` ("O que cada rodada entregou") e no `backup/INDICE.md`, **relendo do disco antes de gravar** (eu também escrevo no `03`; ele é LF, o INDICE é CRLF). Não toque na minha tabela do fim do `03` |
| 2 | **Regra 26, por tipo de regra:** estrague a conta que o caso olha, veja o vermelho no canal certo, desfaça. **Regra 28:** diga quando um verde já existia antes de você, e quando um caso passa sem provar o que o nome diz |
| 3 | **Cópia, não invenção.** Onde o GDScript obriga a mudar, um comentário curto |
| 4 | **A máquina:** o Godot sem janela com **0,4 GB livres ou mais**, um Godot por vez. Nada de suíte da casa (`npx vitest run` inteiro), roteiro, medição, montagem ou versão. **Sem versão nesta rodada** |
| 5 | Executar o Godot da Área de Trabalho é a **única** coisa de fora da pasta do projeto. Não leia, não liste, não copie mais nada de lá |
| 6 | Regra 20: relógio primeiro, nome do arquivo depois, **no mesmo comando**. Regra 29: escreva e meça na mesma volta |
| 7 | Fim de linha: nada de `sed` nem Python em modo texto em arquivo que já existe |
| 8 | **Mensagem minha só chega quando o seu turno para.** Não pergunte nada ao Humberto; não abra painel de pergunta. Dúvida: escreva a suposição, siga, e me diga |
| 9 | Contexto pesado antes do fim? **Pare numa rodada fechada**, escreva a passagem no aviso, como o chat anterior fez |

## O que entregar

Um aviso ao `DIRETOR · 000da3` por `SendMessage` (rode `ListAgents` antes) ao fechar a G6 e outro ao fechar a G7: o que existe · quantos casos passam pela suíte inteira, com a hora · regra 26 e regra 28 · o que não foi provado · o que só a mão do Humberto prova · o seu erro, pela forma, se houve. Entre a G6 e a G7 **não espere resposta**. Fechou a G7: avise e **pare**.
