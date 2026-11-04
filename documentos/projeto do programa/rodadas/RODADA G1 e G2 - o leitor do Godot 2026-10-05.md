# Rodadas G1 e G2 — o leitor do Godot: ler, desenhar parado, e animar

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Esta rodada escreve código, numa pasta NOVA: `leitor-godot/`.** Não mexe no editor, nem no `programa/`, nem nos runtimes.
Outra rodada (a 4, os painéis) está escrevendo em `editor/` e fechando versão: **não rode nada pesado junto** (veja as réguas).

---

## Para quê

O Humberto decidiu a entrega: *"bota para Construct e Godot."* O Construct já tem leitor (`leitor-construct/`, K1 a K7). Agora o Godot.

A pesquisa está feita: `documentos/projeto do programa/08 OS LEITORES - Godot e Construct 2026-10-05.md`. **Leia inteiro.** Esta ficha só diz o que fazer primeiro; o como está lá (seções 1, 3, 4 e 5).

Em uma frase: **um addon do Godot em GDScript, copiado do runtime Python** (`runtime-python/recorte/`, 6 mil linhas). Não é converter para nós do Godot: a conta é a nossa, e o Godot só desenha os triângulos.

| Dado | |
|:---|:---|
| O Godot do Humberto | **4.7.2 estável** |
| O modelo a copiar | `runtime-python/recorte/`: `loader.py`, `skeleton.py`, `atlas.py`, `animation.py`, `pose_dump.py`. E o adaptador `runtime-python/adaptador.py` e `conformidade.py` |
| O modelo de pasta | `leitor-construct/` (o `LEIA-ME.md`, os testes, o `montar.mjs`). Copie a **forma**, não o conteúdo |
| O desenho | `RenderingServer.canvas_item_add_triangle_array(...)`, com os triângulos prontos. **Não** `draw_polygon` (ele triangula de novo). Veja o `08`, seção 3 |

---

## G1 — ler e desenhar parado

| # | O que tem de existir no fim |
|:---:|:---|
| 1 | A pasta `leitor-godot/`, com o addon em `leitor-godot/addons/recorte/` (é a forma que o Godot pede) |
| 2 | Em GDScript, copiados do Python: o **carregador** (`.bone` em JSON; o `.boneb` e o `.bonez` ficam para a G8), os **ossos** (a pose de repouso, a matriz de mundo, a herança), o **atlas** |
| 3 | O nó **`Recorte`**: recebe o arquivo, e desenha o boneco parado. Ossos, imagens, ordem de desenho, cor. O Y do Godot aponta para baixo: a conta da virada fica **num lugar só** (§3.3 da especificação) |
| 4 | O **adaptador sem janela**: `godot --headless --script …` lê o caso e escreve a pose, no mesmo formato do `runtime-python/adaptador.py`. Leia `conformidade/como-provar-conformidade.md` |
| 5 | **Os casos A passam** pelo adaptador (são 13). Diga o número e a hora do relógio |
| 6 | O desenhador é **função pura**: recebe a pose e devolve as listas (pontos, uv, índices, cores). Testada sem janela: para o herói parado, as listas batem com as do desenhador de referência |

## G2 — animações

| # | O que tem de existir no fim |
|:---:|:---|
| 1 | Copiado de `animation.py`: linhas do tempo, curvas, eventos, ordem de desenho por chave, laço |
| 2 | No nó, com as palavras do Humberto: **`tocar("andar")`**, em laço ou uma vez; saber qual está tocando; um sinal ao terminar e um a cada evento do `.bone` |
| 3 | **Os casos A e X passam** (13 + 5). Se algum caso A ou X depender de malha, regra ou skin (que são G3, G4, G6), **diga qual pelo nome e por quê**: não force um verde (regra 21 e regra 28) |
| 4 | Um projeto de exemplo do Godot em `leitor-godot/exemplo/`, com o herói andando |
| 5 | `leitor-godot/LEIA-ME.md`: **cinco linhas** para o Humberto abrir o exemplo e ver. Português, frases curtas |

---

## O Godot na máquina

| | |
|:---|:---|
| Onde está | o executável do Godot 4.7.2 está na Área de Trabalho do Humberto: `C:\Users\F-rak\Desktop\Godot_v4.7.2-stable_win64_console.exe` |
| O que você pode | **executar esse arquivo**, com `--headless`, como se executa o `node` ou o `python`. Nada mais de fora da pasta do projeto: não leia, não liste, não copie outra coisa de lá (regra 9 do Humberto) |
| Se não rodar sem janela | escreva o que tentou e o erro, feche no disco o que der para provar por leitura, e me avise. **Não** instale nada, **não** baixe nada |
| Memória | meça a memória livre antes de abrir o Godot. A máquina tem 7,7 GB e a rodada 4 está usando. O Godot sem janela pode rodar com **0,4 GB livres ou mais** (corrigido às 06h48: a ficha dizia 1,5 GB, e a máquina estava com 0,64). Menos que isso: espere um minuto e meça de novo, até três vezes; se não subir, feche no disco e me avise. Um processo pesado seu por vez |
| Foto | com a tela do Humberto apagada o Godot **não desenha janela**. A prova desta rodada são os casos e as listas. Ver o herói andando é a mão do Humberto |

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | **Cópia, não invenção.** Cada arquivo `.gd` diz no topo de qual `.py` veio. Onde o GDScript obriga a mudar (inteiro e real, dicionário, ordenação estável), escreva a diferença num comentário curto |
| 2 | **Não toque** em `editor/`, `programa/`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/casos/`, `leitor-construct/`, `documentos/manual/`. Só a pasta nova. Se precisar de uma linha em `package.json` (um script `leitor:godot:conformidade`), **só acrescente**, com backup e linha no `backup/INDICE.md`, relendo do disco antes de gravar |
| 3 | **A máquina é da rodada 4.** Você **pode**: o Godot sem janela e os seus próprios testes. Você **não pode**: `npx vitest run` inteiro, `npm run roteiro`, `npm run medir`, `montar-programa.py`, `versao.py`. **Sem versão nesta rodada**: feche no disco e me avise; a versão sai quando eu disser que a casa está vazia |
| 4 | **Regra 29: escreva e meça na mesma volta.** Arquivo de teste seu que o `vitest` da casa enxerga não pode ficar meio escrito no disco: a rodada 4 mede a suíte inteira a cada lote. Se os seus testes forem `.gd` (rodados pelo Godot), melhor: a suíte da casa nem os vê |
| 5 | **Regra 26:** antes de dizer que um caso passa, veja-o falhar uma vez (troque um número, veja o vermelho, desfaça) |
| 6 | **Regra 21:** onde o leitor não entende, **avisa**. O nó guarda os avisos numa lista e escreve no console. Malha, skin, regra, partícula, entidade encaixada: nesta rodada **avisam** "ainda não desenho isto", não fingem |
| 7 | **Fim de linha:** nada de `sed` nem Python em modo texto em arquivo que já existe. Editor de arquivo, ou conferir os bytes |
| 8 | Regra 20: a data e a hora se conferem no relógio |
| 9 | **Mensagem minha só chega quando o seu turno PARA.** Precisa de resposta? Mande a pergunta por `SendMessage` e **termine o turno**. Não pergunte nada ao Humberto, e não abra painel de pergunta: ele está no trabalho |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | A pasta `leitor-godot/`: o addon, o adaptador, os testes, o exemplo, o `LEIA-ME.md` |
| 2 | No `03`: uma linha em "O que cada rodada entregou", e G1 e G2 como **entregue** (cópia em `backup/` antes, linha no INDICE; o `03` é LF) |
| 3 | Um aviso ao `DIRETOR · 000da3` por `SendMessage` (rode `ListAgents` antes), **a cada rodada fechada**: o que existe · quantos casos passam, com a hora · o que você supôs · o que só a mão do Humberto prova · pela forma, o erro que você cometeu, se houve (regra 27) |

## O que NÃO fazer

| | |
|:---|:---|
| Malha, skin, conexão, regras, partículas, o importador, `.bonez` | são G3 a G8 |
| Converter para `Skeleton2D` e `Polygon2D` | a pesquisa descartou: perde demais |
| Mexer no leitor do Construct | é outra frente |
| Seguir para a G3 sem o meu "pode" | fechou a G2, avise e pare |
