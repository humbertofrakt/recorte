# Rodada 10 — a aba das entidades (o visualizador de montagem): o plano

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026, à noite.
**Esta rodada, nesta parte, não escreve código.** Pesquisa e plano, por escrito. **O Humberto lê e aprova o plano antes de qualquer código.** Ele pediu: *"isso tem que ser bem planejado."*

---

## O que o Humberto quer, nas palavras dele

Decidido em 04/10 (`02 AS DECISOES`, seção 2, "Os dois lugares: adicionar ou testar") e hoje, 05/10, à noite, pelo celular:

> *"Sobre 'Este boneco', estou imaginando que seria melhor uma aba que o usuário pudesse organizar as entidades, e nessa aba o projeto apareceria como uma entidade (lá teria as entidades, ex.: poder rosa, o boneco, a motosserra, e o usuário conectaria as entidades)."*
>
> *"Dessa forma eu poderia ter outros encaixes acima deles, ex.: nave / mecha / boneco (que é a animação atual) / motosserra. Dessa forma também poderia testar coisas como uma arma para o mecha."*

| O que já está decidido, e vale | Onde |
|:---|:---|
| Dois lugares: **a linha do tempo** adiciona (vira parte da animação); **o visualizador** testa (encaixar e desencaixar; descartável). O visualizador tem o botão **"Aparecer na linha do tempo"**: mostra o teste enquanto ele anima, sem adicionar | `02`, seção 2 |
| O exemplo dele: o mecha em volta do piloto, montado no visualizador; ele anima "pilotar" vendo o mecha; o piloto não leva o mecha junto | `02` |
| Qualquer imagem pode receber uma entidade; encaixe sem limite de níveis; a mesma entidade várias vezes são objetos separados; quem recebe manda na animação da peça se escolheu na faixa, senão a peça fica livre para o jogo | `02`, seção 2, regras |
| As skins se testam no visualizador | `02`, seção 3, regra 8 |
| "Este boneco": o boneco entra no slot do meio do poder, e é desenhado no meio dele | `02`, seção 2; feito nas v27.5 a v27.7 |
| As duas armas trocam separadas; as rodas com "Trocar todas as iguais" | `03`, 05/10 |
| A entidade encaixada aparece na lista de Animações como base, com as animações dela; clicar numa anima por dentro, com o boneco à vista | rodadas 8b e 9, feitas |

**A régua desta rodada:** a aba Entidades deixa de ser só uma lista e vira o lugar de **ver e ligar**. Cada entidade é um cartão com os slots dela; **o projeto aberto (o herói) é mais um cartão**. Ligar = arrastar um cartão para o slot de outro. Para baixo (a motosserra na mão do herói) e **para cima** (o herói no mecha; o mecha na nave; o herói no meio do poder rosa). Ligação feita ali é **teste**, com aparência própria; um botão passa a ligação para o projeto.

---

## Parte 1 — a pesquisa (sem código, sem abrir o programa)

Leia os manuais em `documentos/pesquisa/nova pesquisa/` e a internet, **com link em cada linha**. Nunca de memória.

| # | O que olhar | Em quem |
|:---:|:---|:---|
| 1 | Como se **vê** uma peça aninhada dentro de outra, e a cadeia de níveis | Spine (o Skeleton Viewer, a árvore de slots, o `SpineSlotNode` no Godot) · Spriter (sub-entidades, o Animation palette) · DragonBones (o Repositório de esqueletos, o `DragonBonesSlot`) |
| 2 | Como se **liga** uma coisa a outra por arrasto, com teste antes de valer | Unity (prefab aninhado; arrastar para o slot de um script) · Godot (a árvore de cena: arrastar uma cena para dentro de outra; instanciar) · Unreal/Niagara (ligar por fio) · o Photoshop (os grupos: arrastar para dentro) |
| 3 | Como se mostra a diferença entre o que **é** e o que é **teste** | editores que têm "preview" separado do documento (o Unity em Play, o Godot com "Run"; o Spine com o Preview) |
| 4 | O que o nosso programa **já tem** disso (conferir no código, com arquivo e linha; não no uso) | a aba Entidades (`panels/entities*`), a lista de bases, a grade, a faixa, Pôr entidade na cena, Promover e Rebaixar, a Visualização em tela cheia (que já testa skins), "Este boneco" |

---

## Parte 2 — o plano, por escrito

Entregue `documentos/projeto do programa/22 A ABA DAS ENTIDADES - o plano <data do relógio>.md`. Frases curtas, tabelas, desenhos em caixas de texto. **O Humberto é disléxico: ele vai ler isto.** Responda, nesta ordem:

| # | A pergunta | O que eu quero ler |
|:---:|:---|:---|
| 1 | **O desenho da aba**, em caixas, nas três telas (1920×1080 é a dele; 1280×720 é a pior) | os cartões, os slots de cada um, as ligações, onde fica o projeto, onde fica a cadeia para cima (nave > mecha > boneco). Como se lê quem está dentro de quem sem fio cruzado. Ícone com o nome na dica; **nada só de ícone sem nome em lugar nenhum** |
| 2 | **Cada gesto, um por um** | ligar (arrastar cartão para slot) · desligar · trocar a peça de um slot · ligar o projeto a um slot de outra entidade (para cima; e "Este boneco" é isso quando o slot é o do meio) · escolher a animação da peça · soltar a peça para o jogo · testar skins · **"Aparecer na linha do tempo"** · **passar a ligação para o projeto** (e desfazer isso) · a mesma entidade duas vezes (as armas; as rodas com "todas as iguais") · subir e descer um nível. Para cada gesto: o que ele vê antes, o que faz, o que vê depois, o que o rodapé diz, como desfaz |
| 3 | **Teste contra projeto** | como se vê a diferença (cor, traço, um selo, uma coluna?). O que acontece ao salvar (o teste **não** vai para o `.bone`; onde fica guardado, se fica: `RECORTE_editor_state`?). Ao fechar e reabrir. Ao trocar de animação. Ao exportar para o jogo |
| 4 | **A cena enquanto ele anima** | com "Aparecer na linha do tempo" ligado: o herói dentro do mecha dentro da nave, tudo desenhado, enquanto ele anima o herói. O que se escolhe e se move na cena, e o que não (a nave não se move pela animação do herói). O que acontece com a faixa da linha do tempo para as peças de teste |
| 5 | **Os casos difíceis**, cada um com resposta | ligar uma entidade a um slot dela mesma (ciclo) · a entidade que não existe mais no disco · dois níveis com "Este boneco" · a peça de teste com animação que o boneco não tem · a ligação de teste que vira projeto quando o slot já tem uma peça do projeto · o que acontece à ligação de teste quando a base-slot é desmarcada · 10 entidades, 30 slots: a aba ainda se lê? |
| 6 | **O que o jogo recebe** | nada muda no `.bone`? Confirme pela spec (7.11). Se algo precisar ir ao formato, **pare e me diga**: é decisão do Humberto |
| 7 | **O que não copiar** dos outros, e por quê | |
| 8 | **Os lotes**, pequenos, um por versão, do que mais muda a vida dele para o que menos | cada lote com o que ele vai ver, os arquivos, o que pode quebrar |
| 9 | **As perguntas para o Humberto**, cada uma com a sua sugestão de resposta | só o que o Spriter, as decisões dele e esta ficha não respondem |
| 10 | **O que você não sabe** | às claras |

**Réguas:** não escreva em `editor/`, `runtime*/`, `formato/`, `conformidade/`, `leitor-*`. Não rode a suíte. Não abra o programa (o que já existe se confere no código, com linha; a conferência no uso é de outra rodada). `CLAUDE.md` inteiro. Relógio primeiro, nome depois. Gaste o necessário para ser minucioso, e nada mais: o plano é lido por um disléxico, e a conta bateu no limite três vezes hoje.

Terminou: avise-me por `SendMessage` com as cinco linhas principais e as perguntas, e **termine o turno**. Eu leio o plano inteiro antes de ele ir ao Humberto.
