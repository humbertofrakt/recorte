# Rodada G5 — a conexão no leitor do Godot

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Esta rodada escreve código só em `leitor-godot/`.** É a última do leitor do Godot. Dois chats fizeram as anteriores (G1 a G4; G6 a G8) e pararam, cada um numa rodada fechada, com a passagem escrita.

---

## Onde a obra está

| | |
|:---|:---|
| Feito | ler (`.bone`, `.bonez`, `.boneb`), desenhar, animar, malha, máscara, skin, regras, partículas, o importador, o nó no editor. **81 de 90 casos** pelo Godot sem janela; 121 testes do Godot |
| Falta, e é seu | os 9 de entidade e corpo (C-270, 273, 274, 290 a 293, 299, 300) e **14 novos em `conformidade/casos-pendentes/`** (C-263, C-310 a C-321, X-307), com `leiame.md` e a conta à mão |

**O que mudou no chão hoje:**

| | |
|:---|:---|
| "Este boneco" | campo `around` no anexo `skeleton` (spec 7.11, 7.13, 7.7): o filho é desenhado **em volta** de quem o recebe — atrás · o boneco · na frente — com a cebola quando há duas peças marcadas. O relógio do filho **continua** na troca de placeholder com a mesma `uri`. O leitor passa a ser 1.1 |
| O modelo a copiar | `runtime-python/recorte/draw_list.py` (novo, escrito hoje só pela spec); o que mudou em `loader.py`, `pose_dump.py` (o canal `drawList`) e `actor.py` (`_run_start`, `_same_entity`); e `actor.py` inteiro, o `nested` do `pose_dump.py` (prefixo `slot/` nos canais, `nested_events`) |
| Os 14 casos vão mudar de pasta | de `casos-pendentes/` para `conformidade/casos/`, num fecho próximo. **O seu adaptador e os seus testes têm de achar um caso nas duas pastas** |
| O executor | reprova canal que ele não conhece; `drawList` é canal novo do dump |
| O leitor do Construct fez a mesma rodada hoje (K5) | leia `leitor-construct/LEIA-ME.md` e `leitor-construct/src` só para a **forma** da API e das suposições. A conta vem do Python |

**Leia antes:** `CLAUDE.md` · `08 OS LEITORES - Godot e Construct 2026-10-05.md` (seções 1, 3, 4, 5) · `02 AS DECISOES`, seção 2 inteira · `leitor-godot/LEIA-ME.md` · a spec 7.11 a 7.13 e 7.7 · os 14 `leiame.md` · no `03`: "um caso novo do Humberto: a mesma entidade duas vezes (as armas e as rodas)".

---

## A passagem de quem fez a G6 à G8 (palavra dele)

| # | |
|:---:|:---|
| 1 | Rodar: `RECORTE_GODOT=C:/Users/F-rak/Desktop/Godot_v4.7.2-stable_win64_console.exe`. O projeto já está importado (`.godot/` existe). Testes: `"$RECORTE_GODOT" --headless --path leitor-godot --script res://testes/testes.gd` (121). Suíte: `node ferramentas/conformidade.mjs --adaptador "node leitor-godot/adaptador.mjs"` (81 de 90; para os pendentes, `--casos conformidade/casos-pendentes`). Velocidade: `--script res://testes/medir.gd` |
| 2 | Onde ligar: `carregador.gd` tem `SkeletonAttachment` só com os números e avisa "ainda nao leio entidade encaixada"; o `_finish` não tem o `_Context`/`chain` do Python, nem `_load_children`/`_load_bodies`. O `dump.gd` usa `E.Skeleton` direto (não há `Actor`): `body` sai sempre `null`, e o `pose_em` das partículas e o `_pose_at` são o lugar do `Actor.pose`. O `desenhador.gd` avisa a entidade em `_juntar`. O nó (`recorte.gd`) posa em `_posar` e guarda a pose do nascimento das partículas em `_pose_no_nascimento` |
| 3 | Armadilhas do GDScript já pagas: classe interna não chama função estática de fora (ponha dentro da classe, ou num arquivo pré-carregado como `const`) · `sort_custom` não é estável (desempate pela posição) · `Vector2` é float32 (conta em `Array`) · o JSON lê todo número como float, e lê `0.016666666666666666` uma casa abaixo (`D.numero_exato`) · laço de `RefCounted` vaza: **todo esqueleto novo precisa de `liberar()`, o filho aninhado também**, e o `_posador` · `@tool` em todo `.gd` novo do addon · `var x := a.b` com `a` sem tipo não compila: escreva `var x: float =` · `Key` é nome do Godot (use `KeyData`) |
| 4 | Armadilhas de prova já pagas: (a) o gerador de referência (`testes/gerar-referencia.mjs`) tem de importar `runtime/src/constraints/*.ts`, senão as regras viram "noop"; se o filho tiver regras, confira que a referência as aplica · (b) **escolha o estrago pelo que o caso MEXE, não pelo nome dele** · (c) mudar o importador não reimporta: apague `.godot/imported/*.bone*` |
| 5 | O que já existe e você reaproveita: `carregar_bytes`, `bytes_de` (recurso primeiro, depois disco), a pilha de skins do nó (`vestir`, `_trocar_pilha`, que também atualiza o `_posador`), `E.Frame.times_trs` (a 9.5; a mesma conta do `P = M × T·R·S` da 7.11), `parent_frame` já previsto no `Skeleton` e no `Bone.mode()` |
| 6 | A ordem que funcionou: copiar o carregador → o esqueleto → o dump → rodar os casos → só então o desenhador e o nó → a referência do Construct → os testes |

---

## O que tem de existir no fim

| # | |
|:---:|:---|
| 1 | O esqueleto aninhado e a virada de corpo, copiados do Python. **Os 9 casos antigos passam: 90 de 90.** E os 14 novos: **104 de 104**, pela suíte e pelo adaptador |
| 2 | O desenhador com os três grupos; a máscara do filho viaja com a peça; a de quem recebe não corta a peça marcada. A lista do desenhador bate com a `drawList` nos casos C-310 a C-319. **A espada do herói aparece** |
| 3 | A API, com as palavras do Humberto (`08`, seção 4): `encaixar(slot, peça)`, com o slot do meio opcional ("em volta") · `desencaixar(slot)` · `encaixar_todas(de, para)` (as rodas da moto; e encaixar num slot só não mexe nos outros iguais: as duas armas) · `animar_peca(slot, animação, em_laço)` · `soltar_peca(slot)` · o sinal `encaixado(slot, peça)` · a lista dos slots e das entidades · a posição e o ângulo de um osso e de um slot, no espaço do nó. Por dentro, uma skin feita na hora, no topo da pilha: nenhuma chave da animação desfaz o encaixe |
| 4 | Peça, slot ou animação que não existe: **avisa**, e nada muda (regra 21) |
| 5 | O exemplo: uma tecla troca a espada por outra peça e volta; outra liga uma peça em volta do herói (pode copiar o `aura.bone` de `leitor-construct/exemplo/`). No `LEIA-ME.md`: as perguntas novas, **na mesma lista única, em ordem** |
| 6 | Medir de novo a velocidade, com a espada e com a peça em volta, e dizer o número |

Se ficar grande, **parta** (1 e 2 · depois 3 a 6) e avise ao fechar a primeira parte, sem esperar resposta.

---

## As réguas

| # | |
|:---:|:---|
| 1 | **Só `leitor-godot/`.** Mais a sua linha no `03` ("O que cada rodada entregou") e no `backup/INDICE.md`, relendo do disco antes de gravar (o `03` é LF, o INDICE é CRLF). Não toque na tabela do fim do `03`: é do Diretor |
| 2 | **Cópia, não invenção.** Cada `.gd` diz de qual `.py` veio |
| 3 | **Regra 26, por tipo de caso**, pelo que o caso mexe. **Regra 28:** diga quando um verde já existia, e quando um caso passa sem provar o que o nome diz. Um achado de hoje, em outro leitor, para você procurar em casa: *"o teste importava o módulo, não o que liga as regras"* |
| 4 | **A máquina:** Godot sem janela com **0,4 GB livres ou mais**, um por vez. Nada de suíte da casa, roteiro, medição, montagem ou versão. **Sem versão nesta rodada** |
| 5 | Executar o Godot da Área de Trabalho é a única coisa de fora da pasta do projeto |
| 6 | Relógio primeiro, nome depois, no mesmo comando. Nada meio escrito no disco. Fim de linha conferido nos bytes, **sem `grep $'\r'` no Bash** (ele come a barra) |
| 7 | **Mensagem minha só chega quando o seu turno para.** Não pergunte nada ao Humberto; não abra painel de pergunta. Dúvida: a suposição escrita, siga, e me diga |
| 8 | Contexto pesado antes do fim? Pare numa parte fechada, com a passagem no aviso |

## O que entregar

Um aviso ao `DIRETOR · 000da3` por `SendMessage` (rode `ListAgents` antes): o que existe · quantos casos passam pela suíte inteira, com a hora · regra 26 e 28 · o que você supôs · o que não foi provado · o que só a mão do Humberto prova · o seu erro, pela forma. No fim, **pare**.
