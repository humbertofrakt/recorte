# Rodada 3 — o que perde trabalho

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada escreve código.** É a única que escreve código e usa a máquina enquanto roda.

---

## Para quê

Três defeitos antigos, achados no uso em 28 e 29/09, dos piores da fila: o usuário **perde trabalho**, ou faz o gesto e **nada acontece, calado**.

A fila está em `documentos/planos/FILA dos defeitos 2026-09-29.md`. Ela é de 29/09 (v23.3). **O programa mudou muito desde então** (v23.4 a v23.9, e as da rodada 15): confira cada defeito **na versão de hoje** antes de mexer. Pode já ter sumido, ou mudado de cara.

---

## Os três

| Id | O que o Humberto sente | O que ele tem de ver no fim | Pista (de 29/09; **confira**) |
|:---:|:---|:---|:---|
| **M17** | *"Exportei a roupa, apaguei, importei de volta, e ela não voltou. O programa disse só uma frase em inglês."* | a skin exportada entra de volta, **igualzinha**: imagens, ossos, o que ela esconde e o que ela apaga (rodada 12). Se não entrar, o programa diz em português por quê | a fila diz: *"o gravador esquece a lista de ossos"*. `editor/src/io/export-skin.ts`; a importação é registrada em `panels/skins.ts`. A fonte: `documentos/pesquisa/nova pesquisa/SEQUENCIA peles e troca de roupa 2026-09-28.md` |
| **J9** | *"Digitei 90 no Ângulo do osso e nada mexeu: nem o osso, nem os desenhos dele. O programa não disse nada."* | o osso gira até 90, com os desenhos junto. Vale para **todo campo de número** da ficha: X, Y, giro, escala, comprimento | a ficha de Propriedades (`panels/properties*.ts`). A fonte: `…/SEQUENCIA do zero ao boneco montado 2026-09-28.md`. Foi medido "sem janela": **confira se o defeito existe com o mouse e o teclado de verdade**, digitando e apertando Enter, e digitando e saindo do campo com Tab e com um clique fora |
| **E6** | *"Soltei um projeto grande do Spriter e o programa travou."* | o projeto grande abre sem prender o programa, **ou** o programa avisa antes quanto ele pesa e pergunta se continua | a fila diz: *"pesa ~680 MB"*. `ferramentas/src/importar/spriter.ts`, `editor/src/ui/shell-drop.ts`, `io/drop-plan.ts`. **Cuidado com a máquina: 7,7 GB.** Não reproduza o travamento às cegas: meça a memória de um projeto pequeno e de um médio primeiro, e faça a conta |

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro, `documentos/PARTES.md`, e o fim do `03` (o que as rodadas 8a, 8d, 12 e 15 mudaram: o clique na cena escolhe só a peça; a skin esconde e apaga) |
| 2 | **Antes de provar que consertou, prove que o defeito existia** (regra 26), na versão de hoje, com foto. **Se o defeito não existir mais, diga, com a foto, e não invente conserto** |
| 3 | **Descreva cada defeito pela forma** (regra 27), e procure a mesma forma nos vizinhos. O M17 é *"o que eu gravo, eu não consigo ler"*: a Exportar e a Importar **animação** (`io/export-animation.ts`) foram escritas linha a linha contra a de skin. Confira a ida e volta dela também. O J9 é *"o campo aceita o número e não aplica"*: confira os outros campos |
| 4 | **Ida e volta é o teste**: exportar → apagar → importar → o arquivo volta **letra por letra** (ou a diferença é dita). Um teste para a skin, um para a animação |
| 5 | Regra 21: aviso em português, dizendo o que fazer. O editor traduz os avisos que conhece; não mexa no texto do `runtime/` (decisão P46) |
| 6 | E6: se a saída for avisar antes, o aviso diz o **número** (*"este projeto tem 412 imagens e vai ocupar perto de 680 MB; a sua máquina tem 2,1 GB livres"*) e deixa escolher. Não diga "pode demorar" |
| 7 | Um defeito = um lote = uma versão = um par de fotos em `backup/fotos-obra/rodada-03/`. Ordem: **J9 → M17 → E6** (do mais simples ao mais arriscado para a máquina) |
| 8 | Teste novo no arquivo da parte. A contagem não cai: a referência por arquivo é o último `backup/contagem-testes_*.tsv`. Guarde a sua em cada fecho |
| 9 | Fecho de cada lote, **um processo de cada vez** (meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"` (o próximo livre no `backup/INDICE.md`) · seção no `CHANGELOG.md` |
| 10 | Com a tela do Humberto apagada, o navegador embutido **não desenha**. Para as fotos, Chrome sem janela por protocolo (roteiros de exemplo em `backup/fotos-obra/rodada-08d/roteiros/`) |
| 11 | **Mensagem do Diretor só chega quando o seu turno para.** Se precisar de uma resposta minha, mande a pergunta com a sua suposição, siga pelo que não depende dela, e **termine o turno** quando só restar esperar |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, as fotos, as versões, o `programa/` montado |
| 2 | Na fila (`FILA dos defeitos 2026-09-29.md`): **não escreva** (ela era de outro chat). Diga-me os três estados, e eu anoto |
| 3 | No `03`: a rodada 3 passa a **entregue**, com as versões e três linhas do que o Humberto vai ver |
| 4 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` a cada lote fechado (rode `ListAgents` antes): o defeito, **consertado / não existia mais / pela metade** · a forma, e onde mais você a achou · os números do fecho, com a hora |

## O que NÃO fazer

| | |
|:---|:---|
| Não conserte outros defeitos da fila | é a rodada 17 |
| Não troque "pele" por "skin" nem mexa nos menus | é a rodada 6 |
| Não toque em `formato/` nem nos runtimes sem me avisar | |
| Não edite `documentos/manual/` | só com a palavra do Humberto |
| **O Humberto está dormindo, ou longe.** Não pergunte nada a ele | dúvida vem para mim |
