# Rodada 23 — os consertos da noite

Ficha escrita pelo `DIRETOR · ed2cab` em 05/10/2026.
**Esta rodada escreve código no editor.** É a única que escreve em `editor/` e que fecha versão enquanto roda.

---

## Para quê

A rodada 21 usou o programa (v25.7) sem ter escrito nada dele, e achou **13 defeitos**. Nenhum "não funciona"; seis "pela metade".

A lista inteira, com foto e **como repetir**, está no topo de
`documentos/projeto do programa/07 A NOITE CONFERIDA 2026-10-05.md`. **Leia o `07` inteiro: ele é a sua ficha de trabalho.** Aqui só vai a ordem e as réguas.

---

## A ordem — um lote por defeito grave, os pequenos juntos

| Lote | Defeito do `07` | O que tem de acontecer no fim |
|:---:|:---|:---|
| **1** | **#1 — `Delete` com uma chave escolhida na linha do tempo apaga o OSSO ou a IMAGEM, e não a chave.** É antigo, vale para toda chave, e **perde trabalho** | com uma chave escolhida na linha do tempo, `Delete` apaga **a chave**, como a lixeira. Sem chave escolhida, apaga o que está escolhido na cena, como hoje. **Como no Spriter e no Spine**: a tecla age onde está o foco. Regra 12 da casa: tecla tratada uma vez. **Procure a mesma forma** (regra 27) em `Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Ctrl+D` e nas setas, com uma chave escolhida |
| **2** | **#6 — a espada solta no antebraço não acompanha a edição de dentro**, e não ganha faixa na linha do tempo (só a original da mão ganha) | toda cópia da mesma entidade mostra o que foi mexido por dentro, e **toda** entidade encaixada tem a sua faixa |
| **3** | **#3 — a seleção fantasma** depois de tirar a skin: Propriedades e a cena ainda mostram o osso que já não existe | o que deixa de existir sai da seleção, na hora. **A mesma forma** em: desfazer a criação de um osso escolhido; devolver e apagar osso na skin |
| **4** | **#4 — o campo Ângulo da ficha rápida cai fora do painel** em telas de 1080 de altura ou menos, e o painel não rola | em 1280×720 e 1440×900 o Ângulo se alcança: ou cabe, ou o painel rola. `npm run medir` diz o número. **Não esconda campo para caber** |
| **5** | **#5 — Entidades → Pôr entidade na cena** não pergunta qual, e põe deitada na raiz | com mais de uma entidade, **pergunta qual**. Entra **de pé**, no meio da cena, presa ao osso mais perto, como o arrasto já faz (rodada 8b, v25.0) |
| **6** | **#7 — a tecla `P`** com o emissor: a ficha ensina uma ordem, o rodapé pede a contrária, e na ordem da ficha nada acontece, calado | uma ordem só, dita igual nos dois lugares, e funcionando. **Refaça com o teclado de verdade antes de concluir** (o conferente avisou que o "segurar" dele foi por protocolo) |
| **7** | **As palavras** — #2: a skin nova nasce com o nome **"pele"**; **"esqueleto"** em 6 textos da tela (tabela M2 do `07`); "pele", "corpo" e "esqueleto" em avisos de erro. Mais: o rodapé diz o nome de dentro (*"Posição Y de hand_osso"*); diz "Mover desenho" para o emissor; Propriedades diz "Anexo", e não "Emissor" | a skin nova nasce **"skin"**, "skin2"… · "esqueleto" vira **"base"** ou **"boneco"** conforme o sentido (leia cada frase; não troque às cegas) · o rodapé diz **"Imagem hand"**, o mesmo nome da linha do tempo · "Mover emissor" · "Emissor: …" |
| **8** | **Os pequenos** — o ícone vermelho na Árvore depois de "Devolver o osso" · a chave do quadro 0 meio escondida sob a coluna dos nomes · o "Sobre" diz versão 0.1.0 · e os que sobrarem da lista do `07` | cada um consertado, ou dito **por que não** |

**O #8 do `07`** (Salvar, Salvar como e Exportar skin "não dão sinal") o conferente não soube julgar: pode ser só o seletor de arquivo que o Chrome sem janela não abre. **Descubra qual é**: se o programa cala quando o usuário **cancela** o seletor, ou quando o navegador **não deixa** abrir, isso é defeito (regra 21), e o rodapé tem de dizer.

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro, `documentos/PARTES.md`, o `07` inteiro, e o fim do `03` (o que oito rodadas mudaram desde 04/10) |
| 2 | **Antes de provar que consertou, prove que o defeito existia** (regra 26): refaça cada um na v25.7 pelo "como repetir" do `07`, com foto. **Se não repetir, diga, e não invente conserto** |
| 3 | **Descreva cada defeito pela forma** (regra 27) e procure a mesma forma nos vizinhos. Cada linha da tabela já aponta um vizinho |
| 4 | Se o Spriter ou o Spine respondem como deve ser, **faça igual e avise** (manuais em `documentos/pesquisa/nova pesquisa/`, lidos, com página). Não pergunte |
| 5 | Um lote = uma versão = um par de fotos em `backup/fotos-obra/rodada-23/`. Os lotes 7 e 8 podem ser uma versão cada |
| 6 | Teste novo no arquivo da parte. A contagem não cai: a referência por arquivo é o último `backup/contagem-testes_*.tsv`. Guarde a sua em cada fecho. Teste reescrito de propósito: diga quantos, por arquivo |
| 7 | Fecho de cada lote, **um processo de cada vez** (7,7 GB, apertados; meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"` (o próximo livre; a última é a v25.7) · seção no `CHANGELOG.md` |
| 8 | **Dois vizinhos trabalham agora.** (a) `leitor-construct/` é de outro chat (rodadas K1 e K2): **não toque**; os testes dele entram na suíte e têm de continuar verdes; se um deles ficar vermelho no seu fecho, **relate pelo nome** e não conserte (regra 24). (b) Outro chat está **conferindo os painéis no `programa/` montado**: **não rode `montar-programa.py` antes das 05h40** do relógio da máquina. Antes disso, feche os lotes no disco e meça; monte depois |
| 9 | Com a tela apagada o navegador embutido não desenha: para as fotos, Chrome sem janela por protocolo (roteiros de exemplo em `backup/fotos-obra/rodada-21/` e `rodada-08d/roteiros/`) |
| 10 | **Mensagem do Diretor só chega quando o seu turno para.** Pergunta vai com a sua suposição; siga pelo que não depende dela |
| 11 | Não é para caber tudo. **Feche na ordem, e diga o que sobrou** |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, as fotos, as versões, o `programa/` montado |
| 2 | No `03`: a rodada 23 passa a **entregue**, com as versões e três linhas do que o Humberto vai ver |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` a cada lote fechado (rode `ListAgents` antes): o defeito, **consertado / não repetiu / pela metade** · a forma, e onde mais a achou · os números do fecho, com a hora |

## O que NÃO fazer

| | |
|:---|:---|
| Não mexa nos painéis (soltar, recolher, expandir, tamanho das colunas) além do lote 4 | é a rodada 4, de outro chat |
| Não toque em `leitor-construct/`, `formato/` nem nos runtimes | |
| Não edite `documentos/manual/` | só com a palavra do Humberto |
| Não pergunte nada ao Humberto | dúvida vem para mim |
