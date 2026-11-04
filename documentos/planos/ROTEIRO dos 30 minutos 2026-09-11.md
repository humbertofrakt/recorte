# ROTEIRO dos 30 minutos — o boneco como no Spriter · 11/09/2026

**Humberto, 11/09/2026:** *"Eu quero, em 30 minutos, conseguir montar um boneco exatamente como eu fazia no Spriter: abro o programa, arrasto as peças, crio os ossos, associo e faço uma animação."*

Este é o **critério de pronto do programa**. Nenhum lote novo entra na frente dele. O executor roda o roteiro inteiro depois de cada lote (63a, 65, 64) e só devolve o programa quando **todos os passos passam sem ajuda, sem tecla escondida e sem susto**. Cada passo que trava vira uma linha na tabela do fim, e a linha vira conserto **antes** de qualquer outra coisa.

## O roteiro, passo a passo

| # | O que o Humberto faz | O que tem de acontecer | Gesto no Spriter |
|:---:|:---|:---|:---|
| 1 | Abre o programa (`Abrir o editor.bat`, F5) | cena vazia, Montagem, ferramenta Transformar | abrir |
| 2 | **Arquivo → Abrir pasta…**, escolhe a pasta das peças | as imagens aparecem na aba **Imagens**, por subpasta. Nada na cena | File Palette |
| 3 | Arrasta cada peça para a cena e arruma (cabeça, tronco, braços, pernas) | cada uma cai **livre** onde soltou. Mover, girar, escalar com a caixa do Transformar, sem trocar de ferramenta. Nada de raiz, nada de osso surpresa | arrastar do File Palette |
| 4 | **Ordem**: manda o braço de trás para trás | aba Ordem, arrastar entre linhas ou os botões | Z-Order |
| 5 | Cria os ossos: **N**, arrasta do quadril ao tronco, do tronco à cabeça, os braços, as pernas | cada osso novo nasce filho do osso escolhido; sem osso escolhido, solto. Com peças escolhidas, o osso **pega** as peças | Alt+arrastar |
| 6 | Associa: escolhe o osso, segura **P**, clica nas peças dele | cada peça vira filha **sem sair do lugar**. Nenhuma janela, nenhuma lista | B + clique |
| 7 | Confere na **Árvore** quem manda em quem | uma árvore só: osso, e por baixo as peças e os ossos filhos, com miniatura | Hierarchy |
| 8 | Troca a mão pela mão fechada | clique no desenho já escolhido, ou no campo Imagem: lista da **mesma pasta**, botão esquerdo. A mão cai no pulso | campo de imagem |
| 9 | Aba **Animações**, nova animação `idle` | abre em Animando, tempo 0, Gravar sozinho ligado | nova animação |
| 10 | Move a régua para 0,5 s, gira o tronco e o braço com Transformar | as chaves nascem sozinhas; a linha do tempo mostra os losangos | keyframes automáticos |
| 11 | Vai para 1,0 s, volta à pose do começo | **Copiar chave** em 0 e colar em 1,0, ou `Chavear tudo` | copiar/colar keys |
| 12 | Aperta **Espaço** | toca em laço, suave | play |
| 13 | **Salvar** na pasta do projeto | `.bone` + `.atlas.json` + páginas na pasta, atlas empacotado, só o que está em uso | salvar |
| 14 | Fecha, abre de novo pelo **recente** | tudo igual, animação toca | reabrir |

**Tempo:** 30 minutos para quem conhece o Spriter, com um boneco de 10 peças e 8 ossos.

## Como o executor roda

Sem o navegador na tela, o executor roda o roteiro em **Chrome headless** com um script (como as fotos do manual e a medição da rodada 3): cada passo vira uma ação de código e uma conferência (arquivo por texto, seleção, posição de mundo). Dois passos não têm como ser headless (o `showDirectoryPicker` do 2 e o recente do 14): para esses, o script injeta a pasta por `webkitdirectory`/arquivos, e a conferência do 14 é abrir o `.bone` salvo e comparar por texto.

O script fica em `documentos/notas-de-desenvolvimento/roteiro-30.mjs` e roda com `npm run roteiro`. Cada passo imprime **passou** ou o que faltou. O resultado inteiro vai para a tabela abaixo, a cada lote.

## O que trava hoje (v9.5), pelo que o Humberto já viu

| Passo | O que travou | Conserto |
|:---:|:---|:---|
| 6 | janela "Virar filho de qual osso?" | 63a-1 |
| 6 | prender moveu a peça | 63a-2 |
| 7 | Árvore em três listas, e arrastar não troca o pai | 63a-3, lote 64 |
| 6, 7 | `root` aparece em lista | 63a-4 |
| extra | virar malha fez a peça fugir | 63a-5 |
| todos | painel mais largo que a coluna | lote 65 |
| 8 | a troca de imagem não é a do Spriter: lá é uma **faixa de miniaturas na cena**, embaixo do desenho escolhido, com "fonte: pasta \| objeto" (foto de 11/09) | 60b |

(o executor acrescenta aqui o que o roteiro achar, a cada rodada)

### Rodada 1 do `npm run roteiro` — v9.7, 11/09/2026: 9 de 14

| Passo | Resultado | O que o roteiro viu |
|:---:|:---:|:---|
| 1 | faltou | O programa abre com o **herói**, em Animando, e não com a cena vazia: o `main.ts` abre o exemplo ao começar, e o exemplo vai junto no programa montado |
| 2 | passou | Arquivo → Abrir pasta…: as 10 imagens por subpasta, nada na cena |
| 3 | passou | 9 peças soltas onde caíram; o Transformar move a peça sem escolher osso e sem mexer na raiz |
| 4 | passou | Mandar para trás põe o braço de trás atrás do tronco |
| 5 | passou | 8 ossos com N e arrasto, cada um filho do escolhido |
| 6 | passou | P + clique: cada peça vira filha sem sair do lugar; nenhuma janela |
| 7 | faltou | A Árvore ainda é de três listas (Ossos, Slots, Desenhos): é o lote 64 |
| 8 | passou | A grade aparece embaixo da mão; a mão fechada troca no mesmo lugar |
| 9 | passou | Nova animação: Animando, tempo 0, Gravar ligado |
| 10 | faltou | Girar em 0,5 s grava só a chave de 0,5: em 0 a pose já é a de 0,5, e a animação não anda. O Spriter guarda o começo sozinho |
| 11 | faltou | Depende do 10: não há volta para provar |
| 12 | faltou | Com o foco na cena, o Espaço arrasta a vista e não toca (decisão de um lote antigo: "quem está com o foco decide"); fora da cena, toca |
| 13 | passou | `.bone`, `.atlas.json` e a página na pasta; o atlas só com as 9 imagens em uso |
| 14 | passou | Novo, e Abrir pasta de novo: o documento volta igual ao salvo (fora a hora do `modified`), e a animação toca |

## Rodada 1 do roteiro (v9.8): 9 de 14. Os consertos — lote 68

Decididos pelo planejador em 11/09. Entram **antes** do 65.

| Passo | O que falhou | Decisão | Teste |
|:---:|:---|:---|:---|
| 1 | O programa abre com o herói em Animando (`main.ts` abre o exemplo; o montado também) | **Abre vazio, em Montagem, com Transformar na mão**, como o Spriter abre um projeto novo. O herói continua em **Arquivo → Abrir exemplo** e nos recentes. Cena vazia mostra uma frase discreta no meio: *Arquivo → Abrir pasta… e arraste as peças* | ao abrir sem arquivo: `doc.file` vazio (um `root`, zero slots), `doc.animation === null`, ferramenta `transform`; Abrir exemplo carrega o herói em Montagem |
| 10 | Girar em 0,5 s grava só a chave de 0,5; em 0 a pose já é a de 0,5 e a animação não anda | **Como o Spriter: o começo se guarda sozinho.** Quando o Gravar sozinho cria a **primeira** chave de uma propriedade de uma linha (osso, slot, anexo) num tempo `t > 0`, ele grava junto uma chave em `0` com o valor **de antes** da mudança (o setup). No mesmo passo de desfazer. Se já existe timeline daquela propriedade, nada muda. Mesma regra que o `appearKeys` do lote 57 | `walk` sem timeline de `rotation` em `torso`; girar em 0,5 s para 30° → duas chaves: `0 → 0` (valor de setup) e `0.5 → 30`; a pose em 0 é a de setup e em 0,25 é 15° (linear); desfazer apaga as duas; girar de novo em 0,8 s → só a chave de 0,8 |
| 12 | Com o foco na cena, Espaço arrasta a vista e não toca | **Espaço toca e pausa em toda parte.** Segurar Espaço **e arrastar** continua sendo pan: o toque sem arrasto é tocar; o toque com arrasto é pan. A decisão antiga sai; Ajuda → Atalhos lista *Espaço: tocar/pausar · Espaço + arrastar: mover a vista* | função pura `spaceGesture(downAt, upAt, moved)`: solto sem mover → `'tocar'`; solto depois de arrastar 4 px → `'pan'`; com a cena em foco, `keyup` de Espaço sem arrasto alterna `playing` |
| 7 | Árvore em três listas | lote 64 | — |
| 11 | depende do 10 | — | — |

Depois do 68, rodar o roteiro de novo: a meta é **12 de 14** (só o 7 e o 11 podem faltar até o 64).

### Rodada 2 do `npm run roteiro` — v9.9, 11/09/2026: 13 de 14

| Passo | Resultado | O que o roteiro viu |
|:---:|:---:|:---|
| 1 | passou | Vazio, em Montagem, com o Transformar; as boas-vindas com a frase nova |
| 2 a 6 | passou | Como na rodada 1 |
| 7 | faltou | A Árvore ainda é de três listas: lote 64 |
| 8 e 9 | passou | Como na rodada 1 |
| 10 | passou | A chave de 0 nasce junto com a de 0,5: a animação anda |
| 11 | passou | Em 1,0 s a pose volta à de 0 |
| 12 | passou | Espaço com o foco na cena toca, e volta ao começo em laço |
| 13 e 14 | passou | Como na rodada 1 |

## Desvios

### Lote 67 — o script do roteiro — v9.8

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| O script "no molde das fotos do manual" | O molde pede o editor já servindo na porta 5173 | O script sobe o próprio servidor (5191) e o próprio Chrome (9335), com perfil novo, e desliga os dois no fim. `npm run roteiro` roda sozinho |
| Passo 2: "injeta a pasta por `webkitdirectory` ou arquivos" | O `<input webkitdirectory>` não é o caminho do Humberto, que abre a pasta com escrita | Uma pasta de mentira, em memória, entregue pelo `showDirectoryPicker`: roda o Abrir pasta de verdade, com a varredura das subpastas, e o Salvar grava nela |
| Passo 14: "abrir o `.bone` salvo e comparar por texto" | O recente guarda a pasta no IndexedDB, e a pasta de mentira não atravessa | Arquivo → Novo, e Abrir pasta de novo na mesma pasta: o programa acha o `.bone` que salvou lá (lote 62) e reabre. A comparação deixa de fora `bone.modified`, que é a hora da escrita |
| Os gestos | Soltar da aba Imagens é arrastar do navegador, que o CDP não faz por mouse | O soltar é o `drop` com o tipo da aba. Mandar para trás, Nova animação, Copiar pose, Colar, Salvar e Novo são as ações do menu (`runAction`). Clique, arrasto e tecla na cena são eventos de verdade |
| Passo 10: "move a régua para 0,5 s" | Arrastar a régua é um gesto a mais, sem nada a provar | O tempo vai por conta (`doc.time`); o giro é o arrasto de verdade da bolinha do Transformar |
| Passo 1 | O servidor de desenvolvimento abre o herói, e o programa montado também | Fica como achado do roteiro, e não como ajuste do script |
| Passo 12 | O Espaço na cena é arrastar a vista, por decisão escrita num lote antigo | O script tenta os dois focos e relata os dois. A decisão é do Humberto |
| Conferir | O documento não tem porta pública para quem está de fora | O script lê o documento pela cena exportada (`viewportPanel`), no servidor de desenvolvimento, só para conferir |
| Achado no próprio script | Na primeira versão, o passo 7 passava porque o título da seção começa com a seta, e o 11 passava sem provar nada | Os dois foram corrigidos antes de a tabela acima ser escrita |

### Lote 68 — os consertos da rodada 1 — v9.9

| O plano dizia | O que o código pediu | O que ficou |
|:---|:---|:---|
| Passo 1: "Abrir exemplo carrega o herói em Montagem" | Abrir um arquivo entra na primeira animação, por pedido do Humberto de 10/09 (`openFirstAnimation`, conserto v8.1) | Só o exemplo cai em Montagem (`switchAnimation(doc, null)` depois de carregar). Abrir um arquivo seu continua entrando na primeira animação |
| "O herói continua … nos recentes" | O recente guarda o que a pessoa abriu do disco; o herói vem de dentro do programa | O herói fica em Arquivo → Abrir o herói (exemplo) e nas boas-vindas. Não entra nos recentes sozinho |
| "Cena vazia mostra uma frase discreta no meio" | Já havia as boas-vindas do lote 36, com os quatro botões | A frase virou o título das boas-vindas; os botões ficam (o primeiro é Abrir pasta) |
| — (achado no roteiro) | Sem o herói entrando, nada chamava o `syncWelcome`, e a cena vazia abria **sem** as boas-vindas | A cena acerta as boas-vindas ao montar, e de novo no primeiro quadro, quando o "Abrir o herói" já está registrado |
| Passo 10: "a primeira chave de uma propriedade grava junto a chave em 0" | O Gravar sozinho tem duas portas: `setPropertyOrKey` (um campo) e `keyValuesNow` (as ferramentas da cena) | `keepStartKey` em `keying.ts`, chamado nas duas, dentro do mesmo comando. Chave sem valor (evento) fica de fora. Chavear e Chavear tudo, que não são o Gravar sozinho, não mudam |
| — (achado nos testes) | Três testes antigos (`chaves.test.ts`, e dois em `exibicao.test.ts`) exigiam uma chave só em t > 0 numa linha nova | Reescritos para provar a chave do começo junto; nenhum apagado. Os originais estão em `backup/lote68_2026-09-11_antes/editor-testes/` |
| Passo 12: "a decisão antiga sai; anote qual lote a tinha" | Era da rodada 1, lote 2 (o tocador, v1.8): a seção "Espaço em qualquer lugar" do plano da rodada 1 | Saiu. `spaceGesture` puro; a cena mede o arrasto com o Espaço embaixo e, sem arrasto, chama a ação `tocar` do menu. A dica do botão Tocar mudou junto |
| `spaceGesture(downAt, upAt, moved)` | Só o arrasto decide | Os dois tempos ficam na assinatura, sem uso hoje: segurar parado e soltar ainda é tocar |
| Ajuda → Atalhos | A tabela é gerada dos menus, e "Espaço + arrastar" não é menu | `SCENE_GESTURE_ROWS` em `menus.ts`, somada na tabela como as teclas das ferramentas. "Espaço: Tocar / Pausar" já vinha do menu Animação |
| Meta: 12 de 14, só o 7 e o 11 podem faltar | O 11 passou junto com o 10 | Rodada 2: 13 de 14. Só o 7 (lote 64) |
| Conferência na cena | O roteiro roda num Chrome sem janela e tira foto de cada passo | Conferido pelo roteiro: boas-vindas na cena vazia, animação andando, Espaço tocando com o foco na cena |
