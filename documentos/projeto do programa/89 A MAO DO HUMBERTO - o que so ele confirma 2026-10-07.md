# A mão do Humberto — o que só ele confirma

Escrito pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 07/10/2026, 04h50.
Tudo o que os chats não conseguem provar num Chrome sem janela, juntado das nove rodadas do polimento (`26`). Uma linha por item, com o que ele tem de ver. **Vinte minutos bastam.**

| # | O quê | Onde | O que tem de acontecer |
|:---:|:---|:---|:---|
| 1 | **O seletor de cor do sistema** (rodada 38) | Partículas → ficha do emissor → Cor ao nascer → clique na cor | abre o seletor do Windows; a cor escolhida entra na barrinha e na cena |
| 2 | **Soltar uma pasta do Explorer na janela** (rodada 45) | arraste a pasta `exemplo/game/mao` do Explorer para a cena | abre como projeto, com as imagens; o rodapé diz |
| 3 | **O seletor de pasta do Windows** (rodadas 45 e 7) | Arquivo → Novo projeto… · Abrir pasta do projeto… · Salvar como… → Numa pasta nova… | o seletor abre; a pasta escolhida vira a do projeto; Salvar grava nela |
| 4 | **A pasta Downloads** (rodada 45) | sem pasta de projeto, Arquivo → Exportar → **"GIF, PNG, folha, vídeo…"** → Só este quadro → Exportar | o PNG aparece em Downloads |
| 5 | **O bcp contra o Spriter** (rodada 45) | Importar → De outro programa… → `exemplo/game` → `bcp.scml`; abra o mesmo no Spriter | a base mostra todas as peças; cada animação mostra só as dela, como no Spriter; 2 avisos, 91 de 92 imagens |
| 6 | **O roteiro dos 30 minutos com a mão** (rodada 20) | `documentos/manual/` ou `ferramentas/provas/roteiro-30.mjs`, os 14 passos | cada passo com o mouse de verdade; anote onde hesitou |
| 7 | **Os painéis com a mão** (rodada 20) | arrastar uma aba para outro grupo, soltar da parede, Janela → Voltar ao padrão | a sombra segue o mouse; a linha azul mostra onde entra |
| 8 | **A aba Árvore** (a foto de 06/10, 07h) | o `×` da aba e o nome sublinhado | diga o que queria mostrar: ficou para a rodada 47 como régua das abas |
| 9 | **Exportar e importar skin** (rodada 20) | Skins → Exportar skin → arquivo no disco → Importar skin | a skin volta vestida, com rosto (rodada 44, v34.4) |
| 10 | **O Construct com janela** (rodada K) | `leitor-construct/LEIA-ME.md`, 18 perguntas | o addon `saida/Recorte.c3addon` instala; `heroi-andando.c3p` anda |
| 11 | **O Godot com janela** (rodada G) | `leitor-godot/LEIA-ME.md`, 15 passos | o addon lê o `.bone` e toca "andar" |

Os três últimos não são do polimento: estão parados por ordem dele (*"foco total no programa"*), e esperam a palavra.

## Como relatar

Uma linha por item: **funcionou · pela metade · não funcionou**, e o que viu. O Diretor abre a rodada de conserto com o que não funcionou.

## 07/10, de manhã — o que ele já fez

| # | Resultado |
|:---:|:---|
| 1 | **defeito**: Cor ao nascer não muda a barrinha de Cor na vida → rodada 48 |
| 2 | **não funcionou**: soltar a pasta abre o seletor do Windows em vez de abrir a pasta → rodada 48 |
| 3 | **funcionou**: Novo projeto pediu a pasta e gravou o .bone nela |
| 4 | **o nome estava errado nesta lista** (não há "Exportar imagem"; é "GIF, PNG, folha, vídeo…"): refazer |
| + | **176 avisos** no projeto dele → rodada 48 |

## 07/10 — a rodada 48 (v35.9 e v36.0), pelo `EXECUTANDO · rodada 48 [e973b5]`

| # | O que a rodada fez | O que só a mão dele fecha |
|:---:|:---|:---|
| 1 | **feito** (v35.9): a barra Cor na vida tem embaixo duas faixas finas com a cor que se vê (Cor ao nascer × Cor na vida, como no Unity e no Godot). «de» vermelho no Fogo → a faixa de baixo fica vermelha. Os seletores brancos estão certos: o fogo é branco × o degradê | trocar a cor «de» e ver a faixa fina mudar |
| 2 | **feito** (v36.0): a pasta solta abre como projeto pela alça do arrasto, sem o seletor. Provado no Chrome sem janela com uma pasta de verdade (a do navegador): 0 seletores, "A pasta mao abriu como projeto, pelo arrasto: 2 imagens". Antes (v35.9): a janela "O projeto ainda não tem pasta", que leva ao seletor | arrastar a pasta `exemplo/game/mao` do Explorer **para a cena** e soltar: o seletor do Windows **não** abre; a aba Imagens mostra "Pasta mao", e o rodapé diz "A pasta mao abriu como projeto, pelo arrasto". Se o Chrome pedir "permitir editar?" ao Salvar, é a licença de gravar: uma vez só |
| 3 | **funcionou** (Novo projeto pediu a pasta e gravou o `.bone` nela) | — |
| 4 | o nome certo é **Arquivo → Exportar → "GIF, PNG, folha, vídeo…"**. Sem pasta de projeto, o arquivo sai pelo download do navegador: provado no Chrome sem janela (o `.zip` caiu na pasta de download) | sem pasta, exportar; **Ctrl+J** mostra o arquivo, e "Mostrar na pasta" abre Downloads. Se o Chrome estiver em "Perguntar onde salvar", ele pergunta |
| + | **176 avisos** (v35.9): a barra junta os iguais ("176 avisos (170 iguais) — ver"); a dica e a janela contam os tipos, o pior primeiro. O projeto `pularmachini` não está na pasta do Recorte: a rodada não viu os 176 | abrir a janela de Problemas e dizer a **primeira linha** (é o tipo pior) |

## 07/10, 09h50 — depois da rodada 48 (v36.1), o que refazer com a mao

| # | O que | Onde (programa/ em v36.1, `Abrir o editor.bat`) | O que tem de acontecer |
|:---:|:---|:---|:---|
| 1 | Cor ao nascer x Cor na vida | Particulas -> Fogo -> aba Cor -> troque "de" | a faixa fina de baixo muda; a dica diz que multiplica |
| 2 | Soltar a pasta do Explorer | arraste `exemplo/game/mao` do Explorer **para a cena** | abre como projeto, sem seletor; se o Chrome pedir licenca ao Salvar, e uma vez |
| 3 | Os 176 avisos | abra o `pularmachini` -> clique em "N avisos (M iguais) — ver" | a janela abre com um paragrafo, o pior tipo primeiro: diga qual e |
| 4 | Exportar sem pasta | Arquivo -> Exportar -> "GIF, PNG, folha, video..." -> So este quadro -> Exportar | o rodape diz "Foi para Downloads (Ctrl+J mostra)" e o arquivo esta la |
