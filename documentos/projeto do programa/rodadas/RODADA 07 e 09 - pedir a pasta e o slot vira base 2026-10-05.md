# Rodadas 7 e 9 — pedir a pasta ao começar; o slot vira base

Ficha escrita pelo `DIRETOR · 000da3` em 05/10/2026.
**Escreve código em `editor/`.** Enquanto roda, é a única que escreve ali e fecha versão. Duas rodadas pequenas no mesmo chat: a 7 primeiro, uma versão; depois a 9, uma versão por lote.

**Leia antes:** `CLAUDE.md` · `documentos/projeto do programa/02 AS DECISOES do projeto 2026-10-04.md` (**a seção 2 inteira**, e a linha "Começar" do quadro) · o começo do `03 A ORDEM DA OBRA` (as regras de toda rodada) e, no fim dele, "um caso novo do Humberto: a mesma entidade duas vezes (as armas e as rodas)" · `05 O DESENHO DOS MENUS` (os itens "(novo)" de Arquivo e de Entidades) · `editor/src/contract.ts` · `documentos/PARTES.md`.

---

## Rodada 7 — o programa pede uma pasta ao começar o projeto

| A decisão do Humberto | *"O programa pede uma pasta ao começar o projeto, como o Spriter."* |
|:---|:---|

| # | O que tem de acontecer |
|:---:|:---|
| 1 | **Arquivo → Novo projeto…** pede a pasta do projeto **antes** de abrir o projeto vazio. As imagens da pasta aparecem na aba Imagens; Salvar grava ali, sem perguntar de novo |
| 2 | Ao abrir o programa vazio, o primeiro gesto que precisa de pasta (arrastar uma imagem, Salvar) leva ao mesmo pedido, e não a um erro |
| 3 | Cancelar o pedido não quebra nada: o programa continua onde estava, e **diz** que o projeto está sem pasta |
| 4 | **Leia no manual do Spriter** como ele pede a pasta (`documentos/pesquisa/nova pesquisa/`; leia, não responda de memória) e siga. O que o programa já faz hoje (Arquivo → Abrir pasta…, a pasta guardada, reabrir continua de onde parou): **confira no uso antes de construir**; pode ser que falte só a ordem dos passos |
| 5 | O seletor de pasta do sistema **não abre sem janela**: separe a decisão (módulo puro, testado) do pedido ao navegador. Diga às claras o que só a mão do Humberto prova |

---

## Rodada 9 — marcar a imagem como slot: ela vira base

| A decisão do Humberto (`02`, seção 2, regra 2) | *"Slot: eu marco uma imagem como slot, e ela vira uma base dentro do projeto. Ganha nome (fácil de achar) e animações próprias. Não é o que permite a troca: é o que dá nome e animações."* |
|:---|:---|

**Lote 0 — conferir no uso, antes de construir.** A rodada 1 (`04 O QUE JA FAZ`) e a 8b já mexeram perto disto: a entidade na lista de Animações como base, Promover a base, Rebaixar a entidade. Diga, com foto: **já faz · pela metade · não faz**, para cada linha abaixo. Mande-me o quadro e siga.

| # | O que tem de acontecer |
|:---:|:---|
| 1 | **Entidades → Marcar como slot** (e o botão direito na imagem): a imagem escolhida vira uma **base** do projeto, com **nome** que eu dou. Aparece na lista de bases, com as animações dela (nasce sem nenhuma, ou com a de um quadro só: veja o que o modo Base já faz) |
| 2 | No boneco, no lugar da imagem, fica a base encaixada: **nada muda no desenho** (o mesmo lugar, a mesma ordem, as mesmas chaves). Desmarcar devolve a imagem como era; `Ctrl+Z` devolve o arquivo letra por letra |
| 3 | O slot se **acha pelo nome**: na aba Ordem, na Árvore e na lista de bases aparece o nome que eu dei |
| 4 | Clico na base-slot na lista: passo a animá-la (é o "clico numa base da lista, e ela passa a ser a que eu animo" do `02`); a cena continua mostrando o boneco montado |
| 5 | **O caso das armas e das rodas** (palavras do Humberto, no fim do `03`): duas peças com a **mesma** entidade trocam **separadas** por padrão (confira primeiro se já é assim). Na grade do botão direito, quando o boneco tem outras peças com a mesma entidade, aparece a opção **"Trocar todas as iguais (N)"**, com o número, **desligada por padrão**. Ligada, a troca vale para todas, num passo só de desfazer |
| 6 | O achado da conferência de hoje: com a base aberta **pelo menu** Base → Abrir a base, arrastar uma entidade da aba Entidades **caiu na animação**, e não na base. Prove se repete; se for defeito, conserte |
| 7 | Sem campo novo no núcleo do formato. O que for só do editor mora em `extensions.RECORTE_editor_state`. Se concluir que precisa de campo novo, **pare e me mande o plano** |

---

## As réguas

| # | |
|:---:|:---|
| 1 | Gesto novo: olhe como o Spriter, o Spine e o DragonBones fazem (manuais em `documentos/pesquisa/nova pesquisa/`). Leia o manual |
| 2 | Toda função nova nasce com porta no menu, no lugar dela, e botão com o nome na dica. Ação nova: `ui/actions-table.ts`, nome de tarefa em `ferramentas/provas/tarefas.ts`, estado em `existir-nao-e-funcionar.test.ts` e `acoes.test.ts` (**as réguas da casa moram em outros arquivos**: rode a suíte inteira no fecho) |
| 3 | Regra 26: o teste falha antes. **Prove na tela**, com mouse, pelo editor do disco e um Chrome sem janela (roteiros de exemplo em `backup/fotos-obra/rodada-16/` e `rodada-23/roteiros/`): teste verde não é a tela |
| 4 | Lote sem foto não fecha: `backup/fotos-obra/rodada-07/` e `rodada-09/`, em 1920×1080 (a tela do Humberto) e 1280×720 |
| 5 | Fecho de cada lote, um processo por vez, medindo a memória: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` (110) · `npm run roteiro` · `npm run medir` · CHANGELOG · o quadro do `ESTADO.md` · `python ferramentas/montar-programa.py <o número que vai fechar>` · `python ferramentas/versao.py <número> "…"` · a contagem por arquivo. O único vermelho esperado é o antigo do manual (`exportar-e-ajuda` › *carries every chapter*): não conserte |
| 6 | Não toque `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `leitor-*`, `documentos/manual/`. Se precisar do runtime, pare e me diga |
| 7 | Backup antes de escrever, com linha no `backup/INDICE.md` (CRLF): relógio primeiro, nome depois. Fim de linha conferido nos bytes, sem `sed`, sem Python em modo texto, **sem `grep $'\r'` no Bash** |
| 8 | **Mensagem minha só chega quando o seu turno para.** Não pergunte nada ao Humberto; não abra painel de pergunta. Dúvida: a suposição escrita, siga, e me diga |
| 9 | Contexto pesado? Pare num lote fechado, com a passagem |

## O que entregar

Um aviso ao `DIRETOR · 000da3` por `SendMessage` a cada versão: o número · o que ele vai ver, em três linhas · os números do fecho com a hora · o que viu na tela de diferente da conta · o que ficou de fora · o seu erro, pela forma. No fim de tudo: **"larguei a máquina"**, e pare. Não escreva no `03`.
