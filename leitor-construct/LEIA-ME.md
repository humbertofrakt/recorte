# O Recorte no Construct

## Ver o herói andando — cinco passos

1. Abra o Construct 3 **r449**.
2. Arraste `saida/Recorte.c3addon` para dentro da janela do Construct e confirme. Feche e abra o Construct.
3. Arraste `saida/heroi-andando.c3p` para dentro da janela do Construct. **O herói já aparece parado no layout.**
4. Aperte **Visualizar** (o triângulo, ou F5).
5. O herói anda. **Espaço**: ataca, e volta a andar sozinho. **W**: anda. **A** / **S**: veste e tira a armadura. **F**: fogo na mão. **X**: espelha. **E**: troca a espada pelo capacete, e volta. **Q**: liga e desliga a aura rosa **em volta** do herói. **P**: pausa. **C**: continua.

## O que só a sua mão prova

| # | Pergunta | Se der errado |
|:---:|:---|:---|
| 1 | O addon instala no r449? | tire uma foto da mensagem |
| 2 | O projeto abre, e o herói aparece **parado no layout**, do tamanho dele? | foto do layout |
| 3 | No layout, mudar **Skins iniciais** para `armadura` tira o cabelo dele? | foto |
| 4 | Na Visualização, o herói aparece e anda, **de pé**? | F12, e copie as linhas com **[Recorte]** |
| 5 | Espaço ataca e, no fim do golpe, ele volta a andar sozinho? | conte o que viu |
| 6 | A veste a armadura (o cabelo some), S tira (o cabelo volta)? | conte o que viu |
| 7 | F acende faíscas laranja que brilham, sobem e somem? F de novo apaga? | foto |
| 8 | X vira o herói para o outro lado, e X de novo desvira? | foto |
| 9 | P congela o herói; C continua de onde parou? | conte o que viu |
| 10 | O texto de cima mostra "step" a cada passo, e "hit" no golpe? | foto |
| 11 | O jogo fica liso com o fogo aceso? | conte se travou |
| 12 | **E**: a espada some e o **capacete** aparece **na mão**, no lugar dela, piscando? | foto |
| 13 | **E** de novo: a espada volta, do mesmo jeito de antes? | foto |
| 14 | Com o capacete na mão, **Espaço**: o golpe sai, e o capacete continua na mão? | conte o que viu |
| 15 | **Q**: uma bola rosa gira **atrás** do herói inteiro e outra **na frente** dele? | foto |
| 16 | **Q** de novo: as bolas somem? | foto |
| 17 | O texto de cima mostra **Arma: capacete.bone** depois do E, e **espada.bone** depois de voltar? | foto |
| 18 | Os avisos do texto de cima ficam **sem** linha nova depois de E e Q? (o do cabelo, "cor escura", é velho) | foto do texto |

## As propriedades do objeto, no layout

| Propriedade | O que faz |
|:---|:---|
| Arquivo .bone | o boneco, na pasta Files. O atlas e a imagem ficam ao lado |
| Animação inicial | a que toca ao começar. Vazio: parado |
| Em laço | se a inicial volta ao começo |
| Escala | 1 é o tamanho do editor do Recorte |
| Skins iniciais | as vestidas ao começar, separadas por vírgula. A última vence |

## As palavras nos eventos

| Tipo | Nome |
|:---|:---|
| Ações | Tocar animação · Mudar a velocidade · Pausar · Continuar · Vestir skin · Tirar skin · Espelhar |
| Ações da conexão | **Encaixar** a peça no slot (em volta de: opcional) · **Desencaixar** · **Encaixar todas** · **Animar a peça** · **Soltar a peça** |
| Condições | Está tocando a animação · Está vestindo a skin · Está espelhado · **O slot mostra a peça** |
| Gatilhos | **Ao terminar a animação** (só sem laço) · **Ao evento** (as chaves de evento do `.bone`) · **Ao encaixar** |
| Expressões | AnimacaoTocando · Velocidade · Skins · EventoNome · EventoInteiro · EventoNumero · EventoTexto · Avisos |
| Expressões da conexão | Slots · Entidades · PecaDoSlot · SlotDoEncaixe · **OssoX · OssoY · OssoAngulo** · SlotX · SlotY · SlotAngulo |

## A conexão, em uma tabela

| Palavra | O que faz |
|:---|:---|
| Encaixar | põe uma entidade (um `.bone` da pasta Files) num slot. Ela cai no lugar da imagem, com a ordem e as chaves dela. Só aquele slot muda (as duas armas iguais) |
| Em volta de | o nome de um slot **da peça**: o que ela tem antes dele fica atrás do boneco inteiro, o que tem depois, na frente. Vazio: a peça entra inteira |
| Desencaixar | a imagem de antes volta |
| Encaixar todas | troca a peça em todo slot que a mostra agora (as rodas) |
| Animar a peça | a peça toca uma animação dela. Se a animação do boneco escolhe a da peça (no editor, na faixa), a do boneco manda, e o leitor avisa |
| Soltar a peça | ninguém manda nela: fica na pose de repouso dela |
| Ao encaixar | dispara a cada encaixe. O leitor não recusa nada: o jogo diz "não" aqui, desencaixando |
| OssoX, OssoY, OssoAngulo | para um objeto do Construct seguir um osso: ponha-o ali a cada tique. O ângulo é em graus, como o do Construct |

Peça, slot ou animação que não existe: **nada muda, e vira aviso** (no texto e no console). O jogo salvo guarda os encaixes.

## O que ele ainda não faz

| O quê | Quando |
|:---|:---|
| A cor escura do cabelo | depois (precisa de efeito) |
| Preparar a peça antes (sem encaixar) | a peça é lida da pasta Files no primeiro Encaixar; numa máquina lenta pode faltar um quadro |
| Ao terminar a animação **da peça** | — |
| No layout, o boneco aparece **parado** (não toca a animação ali) | — |

Tudo o que ele não faz, **ele avisa**: no texto da tela e no console, com **[Recorte]**.

## O que eu supus (o site do Construct pediu verificação de robô)

Li tudo na versão **r495** (o plugin do Spine) e no exemplo oficial que pedia **r401**. A página do **r449** não abriu. Se uma destas falhar, o console diz qual, com **[Recorte]**. No layout, a caixa fica **vermelha**. Você pode colar a página para mim.

| # | Suposição | Página |
|:---:|:---|:---|
| 1 | `drawMesh` recebe x, y, z por ponto, e a cor já multiplicada pela transparência | https://www.construct.net/en/make-games/manuals/addon-sdk/reference/graphics-interfaces/irenderer |
| 2 | `setBlendMode` aceita normal, additive (o brilho das faíscas), multiply e screen. Se recusar algum, o lote sai normal e o console diz qual | a mesma |
| 3 | a textura se faz com `createDynamicTexture` e `updateTexture`; o arquivo se lê com `getProjectFileUrl` e `fetchArrayBuffer` | a mesma, e https://www.construct.net/en/make-games/manuals/construct-3/scripting/scripting-reference/interfaces/iassetmanager |
| 4 | o objeto de addon dentro do `.c3p` se grava como no exemplo do Spine | https://github.com/EsotericSoftware/spine-runtimes/tree/4.3/spine-ts/spine-construct3/example |
| 5 | **no layout**: o arquivo vem de `GetProject().GetProjectFileByExportPath` (ou o antigo `GetProjectFileByName`) e se desenha com `DrawMesh`, com inicial maiúscula | https://www.construct.net/en/make-games/manuals/addon-sdk/reference/sdk-interfaces/iworldinstance |
| 6 | os gatilhos disparam por `_trigger` | https://www.construct.net/en/make-games/manuals/addon-sdk/reference/runtime-interfaces/isdkinstancebase |
| 7 | **K5:** uma expressão pode ter parâmetro (`PecaDoSlot("mao")`, `OssoX("braco")`), escrito no `aces.json` como nas ações | https://www.construct.net/en/make-games/manuals/addon-sdk/guide/configuring-aces |
| 8 | **K5:** o ângulo da instância (`angle`) vem em radianos, e o que o jogo lê (`Angle`) em graus: o `OssoAngulo` devolve graus | https://www.construct.net/en/make-games/manuals/addon-sdk/reference/runtime-interfaces/iworldinstance |

## As faíscas do exemplo

O herói do exemplo é `heroi-fogo.bone`: o herói de sempre com uma skin **"fogo"**, que põe faíscas na mão. Elas usam a imagem da mão, pequena e pintada de laranja (o atlas não tem imagem de faísca). Quem faz: `node leitor-construct/exemplo/fazer-heroi-fogo.mjs`.

Mais de **300** partículas vivas num emissor: o leitor desenha todas e **avisa**. O manual do Construct diz que passar de "algumas centenas" pode travar o quadro.

---

## Para quem programa

| | |
|:---|:---|
| Montar | `npm run leitor:construct` → o pacote (`addon/c3runtime/recorte-runtime.js`), a prova e `saida/Recorte.c3addon`. **Mexeu em `src/`? Monte na mesma volta**: a pasta entra na suíte de todos, e o teste do pacote velho fica vermelho para todo mundo |
| Os casos de `conformidade/casos/` sobre o pacote | `npm run leitor:construct:conformidade` |
| Testes | `npx vitest run leitor-construct` · tipos: `npx tsc --noEmit -p leitor-construct` |
| `src/pacote.ts` | o `runtime/src/index.ts` inteiro, menos o `render/canvas.ts`. Não mexe em `runtime/` |
| `src/desenhador.ts` | puro: pose → listas do `drawMesh`, partículas incluídas. A virada do Y mora só em `paraConstruct` |
| `src/recorte.ts` | puro: a máscara (7.7) cortando os triângulos na conta (o Construct não tem máscara) |
| `src/carregar.ts` · `src/tocador.ts` | ler da pasta Files (assíncrono) · tocar, velocidade, pausa, skins, o fim e os eventos, o `reset` da física · **a conexão** (K5): os encaixes são uma skin feita na hora, no topo da pilha; as ordens da peça vão pelo canal `nested/animation` + `nested/time` |
| Teste novo | **importe `../src/pacote.js`** (ou o `runtime/src/index.ts`): sem ele as regras (ik, física, caminho) ficam "noop", e o herói do teste não é o do jogo (achado na K5) |
| `exemplo/fazer-aura.mjs` | faz o `aura.bone` (a peça em volta do exemplo). O `montar.mjs` refaz o `.c3p` do exemplo junto com o addon |
| `id.mjs` | o id do objeto, num lugar só. Trocar: muda a linha e roda `npm run leitor:construct` |
| `testes/ajuda-editor.ts` | a régua: o desenhador do editor num Canvas de mentira, para comparar peça a peça |
| `addon/instance.js` · `addon/c3runtime/instance.js` | o objeto no editor de layout (parado) · no jogo |
| `addon/` | o addon (SDK v2, mínimo r449). O id `Recorte_Leitor` **nunca muda** depois de publicado |
| `exemplo/heroi-andando/` | o projeto de exemplo, em pasta. A parte nativa foi montada pela skill `construct3-suprema-lts` |
