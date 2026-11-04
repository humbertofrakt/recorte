# PLANO malha — o P liga o osso à malha · 10/09/2026

Planejador → executor. Um lote, **63**, pequeno, só bolo. Entra agora: a fila está vazia.

## O que o Humberto perguntou, 10/09/2026

> "Eu já disse: escolhe o osso que vai ser pai, e **P**, para virar pai de quem for selecionado. Pergunta: como faz para **associar um osso à malha**?"

## Como é hoje

| Passo | Onde | O que faz |
|:---|:---|:---|
| Virar malha | aba Malha e pesos | botão **Virar malha** |
| Ligar ossos | botão **Pesos automáticos** (`mesh-panel.ts` 599–607) | usa **todos** os ossos com comprimento (`view.frames`), 4 por ponto, por distância. Ninguém escolhe |
| Um osso só | ferramenta **Pesos** (`G`) | pinta o osso escolhido na Árvore, ponto a ponto |
| Tirar um osso | — | não existe. Só zerando o peso no pincel |

**O buraco:** não há "este osso entra nesta malha, aquele não". O Spriter faz com o mesmo gesto de prender: osso escolhido, **B**, clique no sprite. O Recorte já tem o gesto, é o **P** (lote 31, `select.ts`, `targetOf`): falta ele valer para malha.

## Lote 63 — P liga e desliga o osso da malha

| Gesto | Faz |
|:---|:---|
| Osso escolhido, **P** segurado, clique numa **malha** | o osso entra na lista **Ossos que influenciam** da malha. Se a malha ainda não tem peso nenhum, ele recebe **peso 1 em todos os pontos**. Se já tem, entra com peso 0 e a lista o mostra: pinte, ou aperte Pesos automáticos, que agora usa **só os ossos da lista** |
| O mesmo clique num osso que **já está** na lista | sai da lista: os pesos dele são redistribuídos aos outros da lista, por ponto, mantendo soma 1. Rodapé diz *"tronco" saiu da malha "capa"* |
| **P** + clique numa **imagem inteira** (não malha) | continua o de hoje: troca o pai do slot |
| Painel Malha e pesos, lista **Ossos que influenciam** | cada linha ganha um botão **tirar** (ícone, nome na dica), o mesmo comando do P |
| **Pesos automáticos** | com lista não vazia, só entre os ossos da lista. Lista vazia: como hoje, todos, e a dica diz isso |

Módulo puro: `editor/src/mesh/weights.ts` ganha `bindBone(table, boneIndex, vertexCount)` e `unbindBone(table, boneIndex)`; `autoWeights` já aceita `options.bones`.

| Teste | Esperado |
|:---|:---|
| `bindBone` em tabela vazia, 4 pontos | 4 entradas `{ bone, weight 1 }`; soma 1 por ponto |
| `bindBone` em tabela com `hips` a 1 em 4 pontos | `capa` entra com 0; soma continua 1; `influencingBones` lista os dois |
| `unbindBone` de `hips` numa tabela `hips 0.6 · torso 0.4` | `torso 1`; ponto que só tinha `hips` fica **sem** entrada e a função devolve o aviso `1 ponto ficou sem osso` |
| P + clique na malha `capa` com `hips` escolhido, duas vezes | entra, depois sai; **um** passo de desfazer cada; o arquivo volta por texto |
| P + clique num desenho que é `region` | `Reparent` do slot, como hoje (teste do lote 31 intocado) |
| `autoWeights` com lista `[hips, torso]` e um terceiro osso mais perto | o terceiro **não** recebe peso |

Dica do painel, no lugar de *"Nenhum osso ainda"*: *Escolha um osso, segure P e clique na malha. Ou Pesos automáticos.*

**Pronto quando:** dá para dizer, osso a osso, quem puxa a capa, sem pintar; e tirar um que entrou por engano.

## Ordem de trabalho

Backup antes; INDICE; contagem não cai; `tsc`; `conformidade.mjs`; CHANGELOG; `versao.py`. Manual pausado: a frase vai para a dica. Três linhas ao Humberto.

## Desvios

### Lote 63 — v9.5

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| "Entra com peso 0 e a lista o mostra" | `influencingBones` e `tableToBinding` jogavam fora o peso 0: o osso sumiria ao gravar | Peso 0 conta na lista e vai para o `binding` (a §7.4 aceita `0..1`). Nenhum campo novo. O pincel que leva um osso a 0 apaga a entrada, como antes |
| `unbindBone` redistribui com soma 1 | Se os outros do ponto tinham 0 (entraram pelo P e ninguém pintou), a proporção dá 0/0 | Dividem por igual |
| Tirar um osso | Tirar o último deixaria todo ponto sem osso, e `tableToBinding` poria cada um na `root` com peso 1 | Tirar o último devolve a malha **sem pesos**, no mesmo lugar |
| "Um passo de desfazer cada; o arquivo volta por texto" | `writeWeightTable` troca `vertices` por `binding` em dois campos, e o desfazer devolve `vertices` no fim do objeto: a ordem das chaves muda | O P grava o anexo inteiro num `SetProperty` só: o desfazer devolve letra por letra |
| — | Soltar P depois de clicar só em malha dizia *Terminou sem pegar ninguém* e apagava o recado da malha | O gesto conta as malhas (`ChildGrab.meshes`). Só malha: o recado dela fica |
| — | Em Animando, peso é da forma de repouso | P numa malha em Animando só avisa: *Ligar osso à malha é da Montagem*. O botão tirar fica apagado |
| Pesos automáticos só com a lista | A conta pode dar 0 a um osso da lista, e a poda o tiraria | Quem estava na lista volta com 0 depois da conta |
| Conferência na cena | O painel do navegador está escondido neste chat | Provado pelos testes (a mesma ferramenta Selecionar e o mesmo `Doc` da cena), não na tela |

### Lote 63a

Os Desvios do 63a moram no plano dele: `PLANO consertos do teste - 63a e 60b 2026-09-11.md`.
