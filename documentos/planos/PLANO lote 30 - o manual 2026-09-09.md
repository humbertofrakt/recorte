# Plano do lote 30 — o manual, reescrito

**Pedido do Humberto, 09/09/2026: "quero um manual".** Aprovado por ele.
Entrega: **v5.3**.

O manual de `documentos/manual/` existia, mas tinha sido remendado vinte e nove
vezes. Metade das vinte e cinco imagens era de 07/09, no tema claro, com os
painéis no lugar de antes de nove lotes de interface. Ele não se lia de uma
sentada. O trabalho era **reescrever, não remendar**.

---

## O que o plano pediu

| # | O que |
|:---:|:---|
| 1 | **Oito capítulos do zero**, na ordem em que ele usa o programa: 01 abrir e a tela · 02 montar o personagem · 03 peles · 04 animar · 05 regras · 06 malha e pesos · 07 exportar e usar no jogo · 08 **vindo do Spriter**. O 08 é novo, com uma tabela por assunto. O antigo 07 (Spine, DragonBones) vira seção do 08. O antigo 08 (perguntas) vira a última seção de cada capítulo, "O que ainda não funciona" |
| 2 | **Uma imagem por tela, todas novas**, v5.2, tema escuro, 1440×900, do editor rodando. As antigas saem para `backup/` com linha no INDICE. Toda imagem com legenda de uma frase |
| 3 | **Como ele lê:** frases curtas, uma ideia por frase, tabela onde couber. Cada capítulo abre com "O que você vai conseguir fazer no fim" em três linhas. Todo botão citado com o nome exato da dica e a tecla entre parênteses |
| 4 | **Inglês junto**, `manual/en/`, os mesmos oito, mesmas imagens, rótulo inglês com o português entre parênteses |
| 5 | Ajuda → Manual continua funcionando; o README lista os oito e diz por onde começar |
| 6 | Um teste que já existe deve continuar valendo (toda imagem citada existe); e um novo: **todo rótulo de botão citado no manual existe** em `actions.ts` / `toolbar-model.ts` / menus |
| 7 | Backup da pasta inteira antes, linha no INDICE, CHANGELOG, versão v5.3 |

---

## O que ficou

| # | Estado | Onde |
|:---:|:---|:---|
| 1 | **feito** | `documentos/manual/01-abrir-o-recorte.md` … `08-vindo-do-spriter.md` |
| 2 | **feito** — 25 imagens novas | `documentos/manual/imagens/`, e `documentos/notas-de-desenvolvimento/fotos-manual.mjs` |
| 3 | **feito** | os oito abrem com a promessa em três linhas e fecham com o que falta |
| 4 | **feito** | `documentos/manual/en/` |
| 5 | **feito** | `editor/src/io/manual.ts` monta a página com os arquivos novos; teste em `exportar-e-ajuda.test.ts` |
| 6 | **feito, e mais três** | `editor/testes/lote30-manual.test.ts`, 15 testes |
| 7 | **feito** | `backup/manual_2026-09-09_antes-da-reescrita/`, `backup/manual-imagens_2026-09-09_antes-da-reescrita/`, INDICE, CHANGELOG, `backup/versoes/recorte v5.3 2026-09-09.zip` |

**Fecho:** 2.018 testes (eram 2.003), `tsc --noEmit` limpo, 46/46 de
conformidade nos dois runtimes, console do editor limpo, cena em 69% da altura.

---

## Desvios

Sete. Nenhum bloqueante; dois são correções de código num lote que era de
documentação, e estão explicados.

### 1. O antigo capítulo 8 (perguntas) não coube só em "o que não funciona"

**O plano dizia:** o antigo 08 vira a última seção de cada capítulo, "O que
ainda não funciona".

**O que o código pedia:** essa seção **já existia** nos oito capítulos antes da
reescrita. O antigo capítulo 8 tinha outra coisa dentro, e ela não é lista de
pendência: preço e licença, "por que mais um formato", os níveis A/B/C, os dois
runtimes independentes, a regra de sucessão de 24 meses. Jogar isso fora
apagaria a resposta para quem chega perguntando se pode usar no jogo dele.

**O que ficou:** a lista de pendências continua sendo a última seção de cada
capítulo, como o plano pediu. O resto virou **"Perguntas que todo mundo faz"**,
no `README.md` do manual, que é o primeiro arquivo que se abre.

O apêndice de atalhos do antigo capítulo 8 **foi apagado de propósito**: era uma
tabela escrita à mão, e **Ajuda → Atalhos do teclado** monta a mesma tabela a
partir dos próprios menus. Duas listas da mesma coisa é onde uma envelhece.

### 2. "Uma imagem por tela" virou 21 do editor mais 4 do herói

**O plano dizia:** uma imagem por tela, todas novas, do editor rodando.

**O que ficou:** 21 fotos do editor, mais os 4 quadros do herói
(`exemplo-walk-000/025/050`, `exemplo-attack-030`), que não são tela de editor:
saem do `render-png.mjs`. Foram **regeradas hoje**, e as antigas foram para o
backup junto com as outras. Total: 25.

### 3. Nasceu um programa para tirar as fotos

**O plano não pedia.** Mas tirar vinte e uma fotos à mão, em vinte e uma
sessões, é exatamente como as antigas envelheceram: uma de cada vez.

`documentos/notas-de-desenvolvimento/fotos-manual.mjs` tem a lista escrita — o
que arrumar na tela antes de cada foto, e que pedaço recortar — e tira **todas**
num comando, num Chrome headless em 1440×900. Um passo que não consegue entrar
no estado pedido **derruba o programa**: foto de uma tela errada é pior que foto
nenhuma.

### 4. Defeito achado ao fotografar: as cinco ferramentas não sumiam em Animando

**O manual dizia isso desde a fase 6.** Ao fotografar o capítulo 6 a foto saiu
com Criar osso, Ponto, Caixa, Malha e Pesos na barra, com uma animação aberta.

Medido: o `syncToolModes` marca `hidden` nos cinco desde o lote 17, mas
`.viewport-button { display: inline-flex }` é regra de autor e vence o
`[hidden] { display: none }` do navegador. **É o mesmo defeito dos lotes 14 e
16**, agora na barra de ações — o terceiro da mesma família.

**Por que foi corrigido num lote de manual:** as duas saídas eram escrever no
manual que os cinco botões ficam lá e não fazem nada, ou consertar. Documentar
um defeito como se fosse desenho é pior que o defeito. Uma linha de CSS, com o
motivo escrito ao lado, e dois testes.

### 5. Defeito achado ao fotografar: "Exibir → Réguas" cinza desde o lote 21

A foto do menu Exibir saiu com **Réguas** cinza e **marcado**. A ação
`ver-reguas` nunca foi registrada, e não havia caixa nenhuma no painel Exibição:
as réguas ficavam ligadas para sempre, sem jeito de desligar. É o mesmo tipo do
defeito 11 da rodada 3 (os quatro itens de Interpolação, cinzas desde o lote
12).

`rulers` entrou em `SHOW_ROWS`, que é quem registra a ação, e em `SCENE_ROWS`,
que é quem desenha a caixa no grupo "A cena". Dois testes que pinavam essas
listas foram atualizados, com linha de base no backup.

### 6. Duas linhas do `ESTADO.md` estavam velhas, e o manual as teria copiado

- *"Esticar arrastando a borda da seleção — pegar a borda do bloco com o mouse,
  não [existe]"*. **Existe**: `renderEdgeHandles`, no `dopesheet.ts`, põe uma
  alça em cada ponta da seleção, na linha Resumo, com a dica *"Puxe para
  esticar, com o fim parado"*.
- *"Não dá para exportar por pele nem por pasta"*, no antigo capítulo 6.
  **Dá**: `Arquivo → Exportar → Por pele…` e `npm run fatiar`.

As duas foram corrigidas no `ESTADO.md` e escritas certas no manual.

### 7. Um rótulo do editor entrou no manual como pendência

**Buscar na Árvore** (`Ctrl+F`), no cabeçalho da Árvore, está cinza: a dica diz
*"vem no lote seguinte"*. O manual antigo o descrevia como se funcionasse. Agora
ele aparece como botão cinza no capítulo 2 e como linha em "o que ainda não
funciona".

---

## O que este lote deixa para o seguinte

| O que | Por quê |
|:---|:---|
| **Buscar na Árvore** (`Ctrl+F`) | está cinza desde sempre, e é a única porta cinza do painel mais usado |
| Rodar `fotos-manual.mjs` a cada rodada de interface | é um comando, e é o que impede o manual de envelhecer de novo |
| Aumentar a lista `ROTULOS` do teste do manual | hoje ela tem os rótulos que o manual promete. Quanto mais linhas, menos silêncio |

---

# Acréscimo: a parte 2 do lote 30 — v5.4

**Nas palavras do Humberto:** *"faça um manual do programa com prints
explicando TUDO que o programa é capaz de fazer, e uma parte explicando qual é
o fluxo de trabalho padrão."*

## O que o acréscimo pediu

| # | O que |
|:---:|:---|
| 1 | **Capítulo 00 — o fluxo de trabalho padrão**, antes do 01. Uns dez passos numerados, **um print por passo**, uma frase por passo: importar o PSD → conferir a ordem → criar ossos → prender os desenhos → regra de IK → pele → nova animação → chaves → tocar e ajustar → exportar |
| 2 | **Completude, provada.** Toda ação, toda ferramenta, todo painel, todo item dos sete menus e toda tecla no manual, com o nome exato da tela. O teste passa a conferir **nos dois sentidos**, com `EXEMPT` e motivo por linha |
| 3 | **Print em toda função**: onde é botão, o print mostra o botão; onde é gesto, o print mostra o antes e o depois |

## O que ficou

| # | Estado | Onde |
|:---:|:---|:---|
| 1 | **feito** | `documentos/manual/00-o-fluxo-de-trabalho.md` e `en/00-the-standard-workflow.md`, com os dez prints `00-1-…` a `00-10-…` |
| 2 | **feito** | `editor/testes/lote30-manual-completo.test.ts`, 9 testes, `EXEMPT_MANUAL` com 10 linhas e motivo em cada |
| 3 | **feito** | 7 prints de menu (todo item à vista) + 4 prints de gesto, antes e depois |

**Fecho:** 2.027 testes (eram 2.018), `tsc` limpo, 46/46, console limpo,
41 imagens, `programa/` montado de novo.

## Desvios da parte 2

### 8. "Print em toda função" virou "print em todo menu"

**O plano dizia:** print em toda função, não só uma por tela.

**O que a conta pedia:** o programa tem mais de cem itens de menu. Cento e
poucos prints de item, cada um mostrando uma linha de menu destacada, seriam
cento e poucas imagens quase idênticas — e o manual ficaria mais difícil de ler,
não mais fácil.

**O que ficou:** **um print por menu, com todos os itens à vista.** Um item de
menu *é* um botão, e o print mostra o botão — com o nome, a tecla, a marca do
que está ligado e o cinza do que ainda não existe, tudo junto e no contexto.
Sete prints cobrem os cento e poucos itens. Onde a função **não** é um botão, aí
sim vai o antes e o depois: retângulo de seleção e `Ctrl` + arrastar no Criar
osso.

### 9. Os menus foram fotografados com uma animação aberta

Um menu fotografado em Montagem sai com o menu Animação **inteiro cinza**, e
cinza no manual se lê como "não existe". As fotos são tiradas com a `walk`
aberta, que é o estado em que aqueles itens têm sentido.

### 10. Os menus altos crescem a janela só para a própria foto

O menu Animação tem vinte e nove itens e não cabe em 900 pixels. Fotografar um
menu cortado seria esconder justamente os últimos. O `fotos-manual.mjs` ganhou o
campo `alturaJanela`: a janela cresce para aquela foto e volta depois. Todas as
outras continuam em 1440×900.

### 11. Trinta e dois itens de menu entraram no manual por escrito

A auditoria do sentido novo achou trinta e dois itens que o manual descrevia em
paráfrase, e não pelo nome exato: *Preferências…*, *Desmarcar*, *Só este:
esconde o resto*, *Mostrar tudo*, *Voltar tudo ao repouso*, *Marca anterior*,
*Mover para a outra coluna*, *Sobre o Recorte*, e outros. Todos entraram, com o
nome da tela, na seção "Os sete menus, item por item" do capítulo 1.

Também apareceram dois itens cinzas que o manual não citava: **Novo → Imagem no
slot…** (lote 7) e **Novo → Esqueleto filho…** (lote 9). Os dois estão agora na
tabela, marcados como cinza, e o segundo é ligado ao capítulo 8.


---

# O básico que falta

**Pedido do Humberto:** *"Primeiro vamos finalizar o programa. O programa está
muito ruim, não temos o básico."*

O capítulo 00 do manual — o fluxo padrão, dez passos — foi **percorrido de
verdade no editor rodando**, em 1440×900, como um usuário novo faria: só pela
tela, sem atalho que não estivesse escrito, sem tocar no código para destravar
nada. Documento novo, depois o `heroi.bone`. Cada tropeço virou uma linha.

**Nada aqui foi consertado.** É lista, para o planejador virar anotações da
rodada 4.

| # | Passo | O que aconteceu | O que devia acontecer |
|:---:|:---:|:---|:---|
| 1 | 1 · trazer a arte | **Arrastar um arquivo da área de trabalho para a janela não faz nada.** A cena só aceita o arrasto que vem do painel Imagens (`viewport.ts`, `onDrop` → `isImageDrag`); `dataTransfer.files` não é lido em lugar nenhum do editor | soltar `.psd`, `.png` ou `.bone` na janela abre ou importa. É o primeiro gesto de quem chega de qualquer programa de arte |
| 2 | 1 | **Não existe um `.psd` de exemplo no projeto.** O passo 1 do manual não pode ser percorrido nem por quem escreveu o programa: o único caminho é o seletor de arquivos do sistema, com um PSD que o dono tenha | um PSD pequeno em `formato/exemplos/`, e um teste que o importa de ponta a ponta |
| 3 | 1 · documento novo | **A tela vazia não diz o que fazer.** Arquivo → Novo deixa a cena com a grade e o canto do zoom, e só. A Árvore diz "Nada aqui ainda." três vezes | a cena vazia convida, com o botão junto: "Traga a arte — Arquivo → Importar → PSD…" |
| 4 | 2 · ordem de desenho | **A aba Ordem não tem um único botão.** Medido: zero `<button>` no painel. Mudar a ordem é arrastar a linha, ou `Ctrl+↑` / `Ctrl+↓` — que estão escritos **só na dica de cada linha**. O menu Esqueleto tem "Trazer para a frente" e "Mandar para trás", e eles funcionam | duas setas na linha, ou dois botões no cabeçalho do painel. Ordem de desenho é o passo 2 do fluxo: é cedo demais para depender de arrasto |
| 5 | 2 | **`hand` e `weapon` aparecem com a miniatura vazia** — quadrado sem nada, sem dica que explique | já é a **anotação 18**. Nunca caixa vazia: o quadro `setup` da sequência, a imagem do `path` da malha, o esqueleto filho desenhado, ou o ícone do tipo |
| 6 | 3 · criar os ossos | **A tecla fura o modo.** Com a `walk` aberta (Animando), os cinco botões de estrutura somem da barra — mas apertar `N` põe **Criar osso** na mão, e o arrasto **criou um osso com a animação aberta**. Medido: 19 → 20 ossos, e só o próximo desenho da barra devolveu a ferramenta Selecionar. `toolForKey` não olha `tool.modes` | a tecla obedece ao mesmo modo que o botão. Se a ferramenta não existe ali, a tecla diz isso no rodapé e não faz nada |
| 7 | 3 e 4 | **Não há como duplicar um osso, um slot ou um membro inteiro.** `Copiar` (`Ctrl+C`) e `Colar` ficam **cinzas** com um osso ou um desenho escolhido: eles são só de chaves. Não existe "Duplicar" para osso nem para slot em menu nenhum — só animação e pele têm | duplicar o braço com os filhos e os desenhos, e espelhar, é o gesto que monta a metade de trás de qualquer personagem |
| 8 | todos | **Dez itens de menu estão cinzas para sempre**, prometendo lotes que já passaram (`soon()`, em `menus.ts`): **Abrir recente** (lote 4), **Selecionar tudo `Ctrl+A`** (6), **Buscar na Árvore `Ctrl+F`** (6), **Selecionar todas as chaves** (6), **Novo → Imagem no slot…** (7), **Novo → Esqueleto filho…** (9), **Tocar para trás `Shift+Espaço`** (12), **Chave anterior / seguinte do escolhido `Shift+↑` `Shift+↓`** (12), e **Sair** (4, que num navegador não faz sentido) | `Abrir recente`, `Ctrl+A` e `Ctrl+F` são de todo programa que existe. Ou eles funcionam, ou saem do menu: porta cinza é promessa quebrada toda vez que se abre o menu |
| 9 | 10 · exportar | **A janela de exportar imagem está com o texto quebrado**: "AnimaÃ§Ã£o", "VÃ­deo MP4 nÃ£o sai daqui", "RepetiÃ§Ãµes do GIF", "sequÃªncia". Cinco frases em `editor/src/io/export-image.ts`, e mais em `ferramentas/src/exportar/quadros.ts`. É o último passo do fluxo, e é a tela que o usuário mostra para os outros | texto certo. É troca de cinco linhas, e nenhum teste pega isso hoje — vale um teste que recusa `Ã` no código do editor |

**O que funcionou sem tropeço, e vale dizer:** o fluxo inteiro do 3 ao 10 anda.
Criar osso com o rodapé explicando os três gestos; prender o desenho pelo campo
**Osso**, que é uma lista e não um campo de digitar; **Nova regra**, **Nova
pele**, **Nova animação**, **Renomear** e **Apagar** todos com botão à vista;
clicar na animação entra em Animando; girar o osso com gravação automática
criou a chave e o passo no Histórico; o botão de tocar liga e desliga; e
**Arquivo → Exportar → Imagem…** gravou o `heroi.gif` de 30 quadros,
154×242, 280 kB, na primeira tentativa.

**Duas ressalvas honestas sobre este teste:**

1. Os passos que abrem o **seletor de arquivos do sistema** — importar PSD,
   importar imagens, salvar — não podem ser percorridos por automação: a janela
   é do Windows, não da página. O que foi conferido neles foi o caminho até a
   janela e o que o programa faz depois.
2. O arrasto de linha da aba **Ordem** e o da **Árvore** usam o arrasto do
   HTML, que evento sintético não dispara. Eles não foram testados aqui — o que
   está na lista é a **falta de um botão**, que é o que se vê na tela.
