# QA do Arquivo — o que entra e sai do programa

Noite de 04 para 05/11/2026. Ramo `obra/qa-arquivo`.
Executor: `EXECUTANDO · QA arquivo`. Quem coordena: o DIRETOR.

## Como provei

| Coisa | Como |
|:---|:---|
| O editor | servidor `vite-quieto` na porta 5291, Chromium sem janela (Playwright) |
| Mouse e teclado | de verdade: menus, botões, `Ctrl+S`, `Ctrl+O`, `Ctrl+N`, arrasto HTML5 da aba Imagens para a cena |
| Os seletores do Windows | trocados por um "disco de mentira" ligado ao disco de verdade: o que o editor grava cai numa pasta, e eu valido com `npm run validar` |
| Telas | 1920×1080 e 1280×720 |
| O que sai | `npm run validar`, `npm run converter -- --validar`, `render-png`, PIL (tamanho e quadros do GIF) |

## Os defeitos

| # | O quê | Onde | Como repetir | Consertado |
|:---:|:---|:---|:---|:---:|
| D1 | `validar --help` não mostra ajuda: valida os exemplos. Opção errada passa calada | `ferramentas/validador/validar.mjs` | `npm run validar -- --help` | sim |
| D2 | `converter` sem nada sai com 0; opção errada passa calada; "Saida", "Reducao" sem acento | `ferramentas/converter.mjs` | `npm run converter`; `echo $?` | sim |
| D3 | Salvar como → "Só o arquivo .bone…" fora da pasta: o atlas vai para Downloads, e o rodapé só diz "Salvo em copia.bone." (o aviso era cortado). A dica prometia "o atlas continua na pasta" | `io/open-save.ts`, `io/pedir-pasta.ts`, `ui/shell-file.ts` | pasta aberta → Salvar como → Só o .bone → outra pasta | sim |
| D4 | Rascunho recuperado abre "Sem mudanças por salvar.": o Abrir pasta seguinte o troca sem perguntar | `main.ts`, `doc/document.ts` | mexer, recarregar, "Recuperar este trabalho" | sim |
| D5 | Salvar como sem pasta pergunta a pasta e logo pergunta de novo "Onde vai a cópia?" | `ui/shell-file.ts` | herói aberto → Salvar como → Escolher a pasta | sim |
| D6 | PNG em `.zip`: a janela diz "60 arquivo(s) gravado(s)" e lista 60 nomes; saiu 1 `.zip` | `io/export-image.ts` | Exportar → "GIF, PNG…" → Sequência de PNG | sim |
| D7 | Importar do Spriter (`bcp.scml`): abre como "salvo", com `bcp.bone` que não existe no disco | `ui/shell-file.ts`, `ui/shell-drop.ts` | Importar → De outro programa → `exemplo/game` | sim |
| D8 | Abrir `.boneb` sozinho: o rodapé em inglês (`image "cape_upper" not found in any atlas…`) | `io/open-save.ts` | `Ctrl+O` → `heroi.boneb` | sim |
| D9 | Partículas: trocar só a cor «de» grava `startColor: [[1,0,0,1]]` — UMA cor. O schema pede duas: **o `.bone` salvo dá ERRO no validador**. Trocar «a» gravava `[null, cor]` | `panels/properties-model.ts` | Partículas → Fogo → aba Cor → «de» vermelho → Salvar → validar | sim |
| D10 | `render-png` e `exportar-imagem` não desenham partículas: "3 sem imagem", GIF vazio de 729 bytes | `ferramentas/render-png.mjs`, `exportar-imagem.mjs` | `render-png animação 0.4 x.png --bone fogo.bone` | sim |
| D11 | `render-png --bone X` diz "Nenhum esqueleto passado" | `ferramentas/render-png.mjs` | o mesmo comando | sim |
| D12 | Exportar imagem de um arquivo só de partículas: sai "1 quadro de 1x1" (a caixa não contava partículas — a mesma forma do D10, dentro do editor) | `io/export-image.ts` | `fogo.bone` → Só este quadro (0,4 s) | sim |
| D13 | Exportar animações do herói sugere `animacoes-animacoes.bone` | `io/export-animation.ts` | Exportar → Animações, para outra base… | sim |
| D14 | **(provavelmente os 176 avisos do `pularmachini` do Humberto, doc 89)** Abrir (ou soltar) a pasta `exemplo/game`: reabre `bcp 2026-09-09.bone` com **176 avisos** — 88 imagens "não encontradas" que **estão na pasta** (os mesmos 176 do doc 89). Agora: 2 avisos (a 1 que falta de verdade é uma pasta no disco) | `io/folder-save.ts` | Arquivo → Abrir pasta → `exemplo/game` | sim |
| D15 | O menu diz **"Uma imagem por skin…"**, mas a janela fatia o `.bone` por skin; não sai imagem nenhuma (o manual já avisa: *"o nome do menu está errado"*) | `ui/menus.ts` (passagem) | Arquivo → Exportar → Uma imagem por skin… | **não** (ver abaixo) |
| D16 | "Exportar por skin", tudo marcado: "Tamanho 48.326 / 48.319" — o recorte maior que o inteiro (anotado desde o doc 57) | `io/export-skin.ts` | a mesma janela | sim |
| D17 | Entregar uma base depois de importar do Spine: sai só o `.bone`, citando `heroi-spine.atlas.json` que não existe em lugar nenhum; a janela dizia "o atlas que ele já citava vale" | `io/open-save.ts`, `ui/shell-file.ts` | Importar Spine → Exportar → Entregar uma base… | sim |
| D18 | Reabrir o fechado: o guardado abre "Sem mudanças por salvar." (a forma do D4, na outra porta) | `ui/shell-file.ts` | Arquivo → Reabrir o fechado | sim |
| D19 | Rascunho recuperado (sem imagens) → Salvar → Escolher a pasta → "Faltam 2 imagens", que **estão** na pasta recém-escolhida. E o rodapé do Recuperar não dizia como trazer as imagens | `ui/shell-file.ts`, `main.ts` | mexer, recarregar, Recuperar, Salvar | sim |
| D20 | Exportar GIF do projeto do Spriter (30 quadros de 2837×1197): a página fica **64 s sem responder**, o Andamento parado. Agora responde em até 1,9 s, o Andamento anda, e o arquivo sai com os mesmos bytes | `ferramentas/src/exportar/quadros.ts`, `io/export-image.ts` | `exemplo/game` → bcp → Exportar → GIF | sim |
| D21 | A janela "Imagem exportada" mostra avisos do desenhador em inglês (`attachment "…" has no atlas region; not drawn`) | `io/export-image.ts` | a mesma exportação | sim |
| D22 | Salvar o projeto do Spriter (91 imagens, 3 páginas de atlas): 8 s de página parada e o rodapé mudo. Agora: "Salvando: lendo as imagens do atlas, 56 de 91…", e a página responde em até 0,4 s | `io/folder-save.ts`, `io/open-save.ts`, `ui/shell-file.ts` | `exemplo/game` → bcp → Ctrl+S | sim |
| D23 | Soltar só o `bcp.scml` (sem as imagens): 184 avisos, e o rodapé só "Importado do Spriter: bcp.bone." — sem imagem nenhuma junto, a frase das imagens nem existia; com algumas faltando, vinha depois e era cortada. Agora: "0 de 92 imagens do boneco estão na cena." primeiro | `io/import-foreign.ts`, `ui/shell-*.ts` | soltar `exemplo/game/bcp.scml` sozinho | sim |
| — | A mesma forma, achada na varredura: abrir um projeto com manifesto e aviso punha o aviso depois da notícia | `ui/shell-file.ts` | — | sim |
| — | Linha de comando: opção errada saía com 1 em `empacotar`, `exportar`, `exportar-imagem`, `fatiar`, `render-png` (os outros com 2); `fatiar --animacoes X` não dizia quais há | `ferramentas/*.mjs` | `npm run fatiar -- a.bone x --bobagem` | sim |
| — | Importar PSD: com a janela de avisos aberta, o rodapé dizia "Importar PSD." | `ui/shell-file.ts`, `ui/shell-drop.ts` | Importar → PSD… | sim |

Cada conserto: um commit, com teste no arquivo da parte, visto **vermelho antes** (regra 26).

## O que passou sem tropeço

| Passo | Resultado |
|:---|:---|
| Novo projeto (pasta) | "Projeto novo na pasta novo1"; Salvar grava `novo1.bone` |
| Abrir pasta | `exemplo/game/mao`: 13 imagens na aba (a subpasta `_tmp` é pasta, não imagem) |
| Arrastar peça para a cena | 2 slots; Salvar grava `.bone` + atlas + página; `validar` OK |
| Salvar como → Numa pasta nova | leva `.bone`, atlas e página |
| Rascunho | a janela "Havia trabalho não salvo" volta; o recuperado é igual ao mexido. Depois do D4 e do D19, o caminho inteiro: Recuperar → Abrir pasta → Salvar e continuar → a pasta reabre com o trabalho recuperado no disco e "Nenhum aviso" |
| Exportar imagem, sem pasta | GIF 60 quadros 114×242 · PNG em `.zip` (60) · folha + JSON · WebM 1,97 s · um quadro 110×241 · as 3 animações em 3 GIF |
| Exportar imagem, com pasta | tudo em `exportar/`; nome repetido ganha "(2)" |
| Editor × linha de comando | o herói em `render-png` e o GIF do editor: o mesmo desenho (1 px de diferença na borda) — foto 04 |
| `.bonez` e `.boneb` | salvam; o `.bonez` reabre inteiro, com a espada e o atlas; `converter --validar` ida e volta: igual |
| PSD e PSD com ossos | 19 slots; com ossos, 17 ossos (18 com a raiz) |
| Spriter `bcp.scml` | pergunta qual projeto (scml × scon), avisa o peso (801 MB), 2 avisos, 91 imagens — como o doc 89 diz |
| Skin: exportar e importar | a armadura apagada volta **idêntica** |
| Trocar imagem nas skins | troca, e `Ctrl+Z` desfaz |
| Partículas | Fumaça, Fogo, Faísca nascem; tocando, emitem (foto 01); a chave "Emitindo" nasce na linha do tempo; Salvar + `validar` OK |
| Cor ao nascer × Cor na vida | a faixa fina de baixo fica vermelha ao trocar «de» (foto 02) |
| Biblioteca | exportar as 3 animações → importar noutra base (PSD com ossos): a janela lista os 14 nomes que não batem; a biblioteca de fábrica abre |
| Soltar pasta na cena | `mao` abre como projeto ("pelo arrasto: 13 imagens"); `game` reabre o `.bone` dela (e, depois do D14, desenha) |
| Spine pela tela | a pasta com `.json` + `.atlas` + `.png`: entra inteiro, "Nada se perdeu" |
| Repetir a última exportação | `Ctrl+Shift+E` repete o GIF sem perguntar |
| Fazer a skin de uma pasta | a subpasta `inverno/` vira a skin "inverno" (2 desenhos); Salvar + `validar` OK; `fatiar --peles inverno` OK |
| glTF | `heroi.glb`, 77.640 bytes, e a lista do que o glTF não leva |
| 1280×720 | todos os passeios fecham; as janelas grandes (Exportar imagem, animação, por skin, biblioteca) cabem, os botões à vista |

## A linha de comando

| Comando | `--help` | sem nada | opção errada | caso real |
|:---|:---:|:---:|:---:|:---|
| `validar` | 0 (era: validava os exemplos) | 0 (valida os exemplos, de propósito) | 2 (era 0) | `.bone`, `.bonez`, `manifest.json` do editor: OK |
| `importar` | 0 | 2 | 2 | `bcp.scml`: 2.456 recursos, 2 avisos |
| `importar-psd` | 0 | 2 | 2 | `heroi.psd`: 19 slots; `--ossos`: 18 ossos |
| `empacotar` | 0 | 2 (era 1) | 2 (era 1) | `exemplo/game/mao`: 785×521, 73% |
| `converter` | 0 | 2 (era 0) | 2 (era 0) | `.bone → .bonez → .boneb → .bone`: igual |
| `exportar` | 0 | 2 | 2 (era 1) | `heroi.glb`, com a lista do que o glTF não leva |
| `exportar-imagem` | 0 | 2 | 2 (era 1) | GIF de 30 quadros; agora com partículas |
| `fatiar` | 0 | 2 | 2 (era 1) | `--animacoes` errada: "não achei…; há: walk, attack, falar" |

Todas as mensagens em português.

## A forma que mais se repetiu

**"A notícia na frente, o aviso atrás."** O rodapé mostra a primeira frase que
cabe; tudo o que vem depois só se lê passando o mouse. Quatro vezes nesta
noite o aviso importante estava atrás e sumia: D3 (o atlas baixado), D23 (as
imagens que faltam), o projeto com manifesto, e o rascunho recuperado. **Quem
escreve uma frase de rodapé: o aviso primeiro.**

A segunda: **"o trabalho pesado num pedaço só"** — D20 (GIF, 64 s parado) e
D22 (Salvar, 8 s). Quem faz laço longo no editor: uma pausa por volta, e o
andamento no rodapé.

## Decisões que tomei no lugar do Humberto

| Decisão | Por quê |
|:---|:---|
| Salvar fora da pasta: o aviso **vem primeiro** no rodapé | o rodapé corta na 1ª frase; o aviso é o que importa |
| Rascunho recuperado e projeto importado nascem **"não salvo"** | como Word, Photoshop e o "Import" do Spine: o que não está no disco não é "salvo" |
| Salvar como sem pasta: a pasta escolhida já é a resposta | perguntar duas vezes a mesma coisa; o Spriter também não pergunta |
| Cor ao nascer: a ponta que falta entra **branca** | é o que o leitor usa na falta dela, e o que a ficha já mostrava |
| Pergunta errada na linha de comando sai com **2** | como `importar` e `importar-psd` já faziam |

## O que ficou

| O quê | Por quê |
|:---|:---|
| **D15, o nome "Uma imagem por skin…"** | o rótulo mora em `ui/menus.ts` (arquivo de passagem) e o manual (outra sessão desta noite) escreve sobre ele. **Recomendo**: "Um arquivo por skin…", dica *"Corta o .bone: só as skins e as animações marcadas"*. É uma linha; o Diretor decide junto com o manual |
| "Salvar como pacote" do projeto do Spriter prende a tela 3,2 s | aceitável; o D20/D22 mostram como fazer se incomodar |
| Exportar skin grava só o `.bone` da skin, sem atlas | é o desenho (o arquivo de skin exige o rig e os nomes); noutro boneco as imagens vêm do atlas dele |
| Rascunho recuperado vem **sem as imagens** (avisa 4) | o navegador só devolve a licença da pasta com um clique. O rodapé agora diz o remédio, e o remédio funciona (D19) |
| O rodapé do Importar PSD diz "Importar PSD." até fechar a janela | cosmético |

## O que só a mão do Humberto confere

Do doc `89`, nada disto se prova num Chrome sem janela:

| # | O quê |
|:---:|:---|
| 1 | o seletor de cor do Windows (Cor ao nascer). A faixa fina muda — provado pelo valor, não pelo seletor |
| 2 | soltar a pasta do Explorer na cena (provei só o caminho por dentro: a pasta de mentira entra pela mesma porta) |
| 3 | o seletor de pasta do Windows (Novo projeto, Abrir pasta, Salvar como) |
| 4 | a pasta Downloads de verdade (`Ctrl+J`) |
| 5 | o `bcp` contra o Spriter, lado a lado |
| 9 | exportar e importar skin com o seletor de arquivo do Windows |

## Fotos

## A régua, na última medida (05/11, 01h28 pelo relógio da máquina, casa parada)

| Medida | Resultado |
|:---|:---|
| `npx vitest run` | 5.828 verdes (eram 5.774 na partida), 1 vermelho: o conhecido do manual (`ajuda.test.ts`) |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 120 de 120 |

Em `fotos-qa-arquivo/`:
01 partículas na linha do tempo · 02 a faixa fina da Cor ao nascer · 03 o fogo no editor × na linha de comando · 04 o herói no `render-png` × no editor · 05 o rodapé do Salvar fora da pasta · 06 o Spriter importado · 07 trocar imagem nas skins · 08 a pasta `game` aberta depois do D14 (2 avisos, o bcp desenhado).

FIM
