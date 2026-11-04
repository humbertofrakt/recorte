# Rodada 13 — base e pivô

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Esta rodada escreve código em `editor/`.** Enquanto roda, é a única que escreve ali e fecha versão.

---

## Para quê

Duas decisões do Humberto que ninguém conferiu se o programa cumpre (`02 AS DECISOES`, seção 1, regra 5, e o quadro, linha "Pivô"):

| # | A decisão, nas palavras dele | O que tem de acontecer |
|:---:|:---|:---|
| 1 | *"Peça tirada da base: as chaves dela nas animações ficam guardadas, sem fazer nada. Se a peça volta, as chaves voltam. Como dois saves: um não apaga o outro."* | Tiro uma peça (osso ou imagem) da base. Nas animações ela some, e **nada quebra, nada avisa erro**. Ponho a peça de volta na base: as animações voltam a mexê-la **como antes**, chave por chave. Salvar, fechar e reabrir no meio do caminho **não perde** as chaves guardadas |
| 2 | *"Acertei o pivô de uma imagem presa a um osso: o desenho fica parado."* | Mudo o pivô de uma imagem que está presa a um osso. **Na cena o desenho não sai do lugar**, nem na base, nem em nenhum quadro de nenhuma animação. Só o ponto do pivô muda de lugar |

---

## Lote 0 — conferir no uso, antes de construir (regra 3 de toda rodada)

**Muita coisa existe no código e nunca foi usada.** Antes de escrever uma linha:

| # | |
|:---:|:---|
| 1 | Abra o programa (o do disco, `npm run editor`, ou o montado) e **faça os dois gestos**, como um usuário faria: pelos menus, pelo botão direito, pela tecla de apagar. Herói de exemplo |
| 2 | Para cada decisão, diga: **já faz · pela metade · não faz**, com foto do antes |
| 3 | No caso 1, olhe o que acontece hoje com as chaves: são apagadas? ficam no arquivo? `Ctrl+Z` é a única volta? E "voltar" a peça: existe um gesto de devolver, ou só refazer do zero? |
| 4 | No caso 2, meça: a posição do desenho na cena antes e depois, na base e em **três quadros** de uma animação. O número, não o olho |
| 5 | **Mande-me o quadro do lote 0 por `SendMessage` e siga**: não espere resposta, a não ser que a resposta mude o formato (abaixo) |

## Os lotes de obra

Um lote por decisão, uma versão por lote. A ordem é sua, pelo que o lote 0 mostrar.

| Régua de cada um | |
|:---|:---|
| Caso 1: onde moram as chaves guardadas | **no arquivo**, de um jeito que um leitor de fora (os dois runtimes, o Construct, o Godot) **ignore sem errar**. Primeiro veja se o formato já tem lugar para isso (chave de linha do tempo cujo alvo não existe: o que a especificação manda o leitor fazer?). Se já tem: use. Se **não** tem, o lugar é `extensions.RECORTE_editor_state` (regra 6 da casa). **Campo novo no núcleo do formato: não.** Se você concluir que só com campo novo dá, **pare e me mande o plano** |
| Caso 1: como a peça "volta" | o Humberto falou de peça que **volta**. Olhe como o Spriter trata o objeto removido e recolocado (manual em `documentos/pesquisa/nova pesquisa/`; **leia, não responda de memória**). O mínimo: criar de novo uma peça com o **mesmo nome** na base religa as chaves guardadas, e o programa **diz** que religou e quantas |
| Caso 1: avisar | com chaves guardadas no arquivo, o programa diz em algum lugar quantas há e de quem (regra 21: nada escondido). E tem de haver um jeito de jogá-las fora de propósito |
| Caso 2: a conta | mudar o pivô compensa a posição do desenho, para ele ficar parado. Faça a conta **à mão** para um caso com o osso girado e com escala, **antes** do código, e ponha a conta no teste |
| Caso 2: onde vale | pelo painel de pivô, pelo "Definir pivô…", pelo "Copiar e colar pivô", e pelo arrasto do pivô na cena, se existir. **Todas as portas, a mesma conta** |
| Caso 2: a imagem com chave própria | desde a rodada 8d a imagem pode ter chave só dela (um osso escondido). O desenho tem de ficar parado **também** nesses quadros |
| Toda edição | é um `Command` com `apply` e `revert` exatos. `Ctrl+Z` devolve o arquivo letra por letra, com teste |

---

## As réguas da casa, as que mais custaram

| # | |
|:---:|:---|
| 1 | Leia `CLAUDE.md`, `02`, o `03` (as regras de toda rodada, e o fim), `editor/src/contract.ts` inteiro, `documentos/PARTES.md` |
| 2 | **Regra 26:** antes de provar que consertou, prove que o defeito existia: o teste novo falha antes e passa depois |
| 3 | **Lote sem foto não fecha.** Antes e depois, em `backup/fotos-obra/rodada-13/`. Com a tela do Humberto apagada, fotos por Chrome sem janela (roteiros de exemplo em `backup/fotos-obra/rodada-23/roteiros/`) |
| 4 | Backup antes de escrever, com linha no `backup/INDICE.md`. Fim de linha: **nada de `sed` nem Python em modo texto**; confira os bytes |
| 5 | Fecho de cada lote, um processo por vez, medindo a memória antes: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"`. O próximo número livre está no `backup/INDICE.md`. Guarde a contagem por arquivo (`backup/contagem-testes_*.tsv`) |
| 6 | O vermelho antigo do manual (`exportar-e-ajuda` › *carries every chapter*) **não é para consertar** |
| 7 | **Não toque** em `runtime/`, `runtime-python/`, `formato/`, `leitor-construct/`, `leitor-godot/`, `documentos/manual/`. Outro chat escreve em `leitor-godot/`: se um arquivo dele aparecer vermelho na sua suíte, relate pelo nome (regra 24) |
| 8 | Função nova nasce **com porta no menu, no lugar dela**, e com o nome na dica |
| 9 | **Mensagem minha só chega quando o seu turno para.** Precisa de resposta? Pergunte e termine o turno. Não pergunte nada ao Humberto; não abra painel de pergunta |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | Um aviso ao `DIRETOR · 000da3` por `SendMessage` a cada lote fechado: a versão · o que ele vai ver, em três linhas · os números do fecho, com a hora do relógio · o que ficou de fora · o seu erro, pela forma, se houve |
| 2 | No fim: **"larguei a máquina"**, com a hora e a versão montada. **Não escreva no `03`**: eu anoto |
| 3 | Você marca **entregue**. "Feita" só depois de outra mão conferir no programa |
