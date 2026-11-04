# Rodada 34 — os casos de conformidade que faltam

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Esta rodada escreve casos, não runtime.** Regra 26 da casa: quem escreve o caso não escreveu o que ele mede. Você escreve cada caso **pela especificação**, com a conta à mão no `leiame.md`, **antes** de rodar qualquer leitor. Depois roda os quatro leitores e diz quem cai. **Você não conserta leitor nenhum.**

---

## Por quê

Hoje, três vezes, alguém disse *"isso já fazia certo"* sem caso que olhasse, e estava errado: o TypeScript na malha em `world`; o Python na mesma malha; o Construct com as regras desligadas nos próprios testes. **Onde não há caso, ninguém sabe.** Estes são os cantos achados hoje sem caso.

**Leia antes:** `CLAUDE.md` · `conformidade/como-provar-conformidade.md` e `README.md` · dois casos prontos de cada letra que você for escrever (a forma) · a especificação em `formato/` nas seções de cada caso · `ferramentas/conformidade.mjs --help` (os adaptadores).

| Leitor | Como rodar |
|:---|:---|
| TypeScript (referência) | `node ferramentas/conformidade.mjs` |
| Python | `--adaptador "python runtime-python/adaptador.py"` (veja o `conformidade/dois-runtimes.md`) |
| Construct | `npm run leitor:construct:conformidade` |
| Godot | `--adaptador "node leitor-godot/adaptador.mjs"`, com `RECORTE_GODOT=C:/Users/F-rak/Desktop/Godot_v4.7.2-stable_win64_console.exe` (só executar; 0,4 GB livres ou mais; um por vez) |

---

## Os casos

| # | Caso | O que olha | Onde está a regra | A conta |
|:---:|:---|:---|:---|:---|
| 1 | **P-027 — malha em `world`** | o ponto do nascimento numa malha, com o emissor **girado e deslocado**, em `space: "world"`: a volta ao referencial do emissor **uma** vez (o passo 7 da §9.4.2, que vale para a malha); e `spherizeDirection` medido da origem do emissor | `extensions/BONE_particles.md`, §7.2, §9.4.2, §9.10 | a posição de duas partículas, à mão. Diga o número de quem leva o ponto duas vezes |
| 2 | **C-264 — o instante do `reset` da física** | quando o `reset` dispara ao começar uma animação: no `tocar` (t = 0) ou no primeiro passo (1/60 s). Hoje o Godot faz um e o Construct outro, e o cabelo difere 0,07 px. **A spec decide; se ela não diz, pare e me pergunte com os dois números** | a física (§6.5) e a chave `reset` | `haste.worldX` em três instantes, com e sem o `reset` |
| 3 | **C-322 — a máscara de quem recebe sobre a peça em bloco** | uma peça encaixada **sem** `around`, dentro de uma máscara de quem recebe: cada peça dela sai **cortada** (`clips`) na `drawList`. (Hoje, estragar isso passa verde em todos os casos) | §7.7, §7.11, §7.13 | a `drawList` à mão, peça a peça |
| 4 | **C-323 — o slot marcado que é o `end` da máscara** | o slot com `around` é o `end` de uma máscara de quem recebe: a máscara acaba ali? a peça marcada fica fora da máscara? O chat do Python decidiu pelo texto: a máscara acaba em L, e a peça marcada **não** é cortada (está fora do boneco). **Confira na spec; se ela não diz, pare e me pergunte** | §7.7, §7.13 | a `drawList` |
| 5 | **C-324 — o meio que mostra um filho com `around` próprio** | a peça A está em volta do boneco; o slot do meio dela mostra uma peça B que está em volta de A. Decisão do Python: tira só o meio de B; o atrás e a frente de B ficam. **Confira na spec** | §7.13 | a `drawList` |
| 6 | **C-325 — a física do filho na troca de placeholder** | dois anexos `skeleton` com a mesma `uri`, trocados por chave; o filho tem física; o relógio e a física **continuam** (não zeram) | §7.11 | `worldX` do osso com física, antes e depois da troca |
| 7 | **C-326 — o `reset` dentro de uma peça** | a animação do filho tem uma chave `reset` de física: ela dispara | §7.11, §6.5 | idem |
| 8 | **P-028 — o caminho com pesos** | `shape: "path"` numa curva com `binding` (nível B): os vértices em `t_i` pelo peso dos ossos | §9.4.2, §7.4 | o `p0` de duas partículas |
| 9 | **X-308 — `minVersion` maior que o leitor** | o arquivo pede 1.2 e o leitor é 1.1: abre em melhor esforço **e avisa** (hoje só o ramo "igual" tem caso) | §2.4 | o aviso esperado, e a pose |
| 10 | **drawList — emissor de forma desconhecida** | um emissor com `shape` que o leitor não conhece: não entra na `drawList` e **avisa** (decisão do Python pela 2.5; a 12.4 só diz "uma entrada por emissor") | §12.4, §2.5, §7.4 | a `drawList` e o aviso |

Se um caso não couber na sonda de hoje (um canal que ela não tem), diga qual canal faltaria e **não** force.

---

## O que entregar

| # | |
|:---:|:---|
| 1 | Os casos em `conformidade/casos-pendentes/` (não em `casos/`: a promoção é no fecho de versão, por quem fechar), cada um com `entrada.bone`, `esperado.json` **digitado da conta**, e `leiame.md` com: a regra, a conta, o que o verde prova, o número que o leitor errado daria |
| 2 | **A tabela dos quatro leitores**, caso a caso: verde · vermelho (com o número obtido) · a sonda não tem o canal. Com a hora |
| 3 | Onde a spec **não bastou** para escrever o caso: a lista, com a seção. É o achado mais útil |
| 4 | Um aviso ao `DIRETOR · 000da3` com os três itens acima, e **pare**. Não escreva no `03`; uma linha sua em "O que cada rodada entregou" pode |

## Réguas

Só `conformidade/casos-pendentes/` e o `leiame` da pasta. **Não toque** `runtime/`, `runtime-python/`, `leitor-*`, `formato/`, `editor/`, `ferramentas/`. Nada de suíte inteira, roteiro, medição, montagem, versão (outro chat usa o `programa/`; meça a memória antes de cada processo: 0,5 GB livres ou mais; o Godot, 0,4). Backup antes de escrever em arquivo que existe, com linha no `backup/INDICE.md` (CRLF); relógio primeiro, nome depois; fim de linha nos bytes, **sem `grep $'\r'` no Bash**. Regra 28: diga quando um caso passa sem provar o que o nome diz. Mensagem minha só chega quando o seu turno para; não pergunte nada ao Humberto; dúvida de spec que trave um caso: escreva a suposição, pule o caso, siga, e me diga.
