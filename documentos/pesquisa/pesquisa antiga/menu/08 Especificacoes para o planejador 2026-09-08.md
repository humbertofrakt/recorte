# Especificações para o planejador — interface do Recorte

Escrito em 08/09/2026 pelo pesquisador. Fecha a pesquisa dos arquivos `00` a `07`.
Cada item da lista mestra (`07`) vira aqui uma especificação curta: **o que faz, onde fica, que tecla, que dado, quando está pronto**.
O planejador decide a ordem e o tamanho dos lotes. O pesquisador não decide isso.

## Como ler

| Campo | Significado |
|:---:|:---:|
| Comportamento | o que o usuário faz e o que acontece |
| Tela | onde fica o controle |
| Teclas | atalho. Sempre com o nome escrito na dica |
| Dados | o que muda no arquivo, no estado do editor ou em nada |
| Pronto quando | o teste que prova que está feito |
| Fonte | programa de onde a ideia veio, e o arquivo desta pasta |

Códigos de custo: **P** pequeno (um dia), **M** médio (dois a três dias), **G** grande (uma semana ou mais).

---

## Regras que valem para todos os itens

Vêm da pesquisa (`04`, seção 8; `01`, seção 9; `02`, seção 9.3; `03`, B8).

| # | Regra | Por quê |
|:---:|:---:|:---:|
| R1 | Todo botão tem **nome escrito** na dica (`title` e `aria-label`), com o atalho entre parênteses | Live2D: usuários abrem fórum para saber o nome do botão |
| R2 | Nenhuma função vive **só** no botão direito ou **só** no teclado | Spriter 1 fez isso e voltou atrás no Spriter 2 |
| R3 | Toda edição é um `Command` com `revert` exato (`editor/src/contract.ts`) | o documento do editor **é** o arquivo `.bone` |
| R4 | Estado de editor (trava, zoom, painel aberto) vai em `RECORTE_editor_state`; nunca no núcleo do formato | spec §12.1: leitor que não conhece ignora |
| R5 | Um liga-desliga fica **aceso** quando ligado (`aria-pressed`, cor) | Spriter: loop laranja; DragonBones: gravar vermelho |
| R6 | O que muda de estado **diz na barra de baixo** o que fez, sem ponto final | Spriter: retorno fraco faz o usuário repetir o clique |
| R7 | Uma tecla tratada pela cena **não chega** à janela (`stopPropagation`) | bug achado no lote 0 |
| R8 | Cada lote é uma versão numerada pelo `ferramentas/versao.py`, com linha no `backup/INDICE.md` | regra do projeto |
| R9 | Manual, capítulo certo, nas duas línguas, no mesmo lote | regra do projeto |

---

## Nível 1 — funcional

### Item 1 · Virar filho com P — FEITO no lote 0 (v1.4)

Ver `CHANGELOG.md`. Ficou: escolher, `P`, clicar no osso ou no desenho dele. `ReparentMany` em `panels/tree-model.ts`.

### Item 3 · Retângulo de seleção — FEITO no lote 0 (v1.4)

`pickInRect` e `selectionForPicks` em `viewport/picking.ts`. `Shift` soma, `Ctrl` tira.

### Item 4 · Travar ossos e desenhos — FEITO no lote 0 (v1.4)

Botões acima da cena, teclas `7 8 9 0`, cadeado por linha na Árvore. Estado em `RECORTE_editor_state.view`.

### Item 2 · Mover a imagem sem mover o osso, com a âncora visível

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Com um **desenho** escolhido (não o osso), a ferramenta Mover arrasta o desenho em relação ao osso. Girar gira o desenho. Escalar escala o desenho. O osso fica parado. Com um **osso** escolhido, tudo como hoje |
| Tela | Na cena, uma **cruz pequena** na raiz do osso do desenho escolhido: é a âncora. O desenho escolhido ganha contorno laranja (já existe) |
| Teclas | as mesmas W E R. `Shift` prende ao eixo, como hoje |
| Dados | `x`, `y`, `rotation`, `scaleX`, `scaleY` do anexo `region`/`mesh` (§7.3). Um `Command` por arrasto, com `mergeWith` como o `SetProperty` de `tools/select.ts`. Em Animando: **não cria chave** (anexo não tem linha do tempo de posição); avisa na barra "Posição do desenho é da montagem" |
| Pronto quando | arrastar o desenho 40 px muda `attachment.x` em 40 (no espaço do osso) e o osso não muda; `Ctrl+Z` devolve; teste sem DOM |
| Custo | M |
| Fonte | Spriter (pivô), Moho (cruz), DragonBones (origin). `06` seção 4 |

### Item 5 · Números com setas e arrasto no rótulo

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Todo campo numérico do painel Propriedades e do Exibição: setas ↑ ↓ mudam 1 (`Shift` 10, `Ctrl` 0,1). Arrastar o **rótulo** para os lados muda o valor como um slider. Digitar continua valendo |
| Tela | cursor ↔ ao passar sobre o rótulo |
| Teclas | ↑ ↓, Shift, Ctrl |
| Dados | os mesmos comandos que o campo já dispara. Arrasto = um comando com `mergeWith` |
| Pronto quando | arrastar o rótulo de Rotação 100 px muda o valor e gera **um** passo de desfazer |
| Custo | P |
| Fonte | Spine, Moho, Blender, Unity. `ESTADO.md`, acabamento |

### Item 6 · Tocador visível, colado na linha do tempo

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Uma linha acima da régua da linha do tempo: ⏮ Início · ⏪ Chave anterior · ◀ Quadro anterior · ▶ Tocar/Pausar · ▶│ Quadro seguinte · ⏩ Próxima chave · ⏭ Fim · 🔁 Repetir · tempo `0,32 s · quadro 10` (clicável para digitar) · duração `1,00 s` (clicável) · Velocidade ¼ ½ 1 2 · ● Gravar sozinho · ◆ Chavear |
| Tela | substitui a linha 1 e o botão Chavear/Gravar da linha 2 de hoje (`panels/dopesheet.ts`). O tocador sai do painel Animações (`panels/animations.ts` linhas 197–233) |
| Teclas | **Espaço** tocar/pausar (anywhere, exceto campo de texto). Home End ← → ↑ ↓ como hoje. **K** chavear. **A** gravar sozinho. **L** repetir |
| Dados | nada no arquivo, exceto o item 7 |
| Pronto quando | Espaço toca e pausa com o foco na Árvore; a linha tem 13 controles com nome na dica; o painel Animações não tem mais Tocar |
| Custo | P |
| Fonte | os nove. `04` seção 2, `01` seção 4, `05` seção 5 |

### Item 7 · Repetir gravado no arquivo

| Campo | Especificação |
|:---:|:---:|
| Comportamento | O botão 🔁 do tocador liga e desliga o laço **da animação aberta**. Aceso = laranja. Vale para o tocador e para a Prévia e para o jogo |
| Tela | tocador (item 6) e campo **Repetir** nas propriedades da animação |
| Teclas | L |
| Dados | `animation.loop` (§4.6), já existe. Um `Command` "Repetir ligado/desligado" com `animationOnly` |
| Pronto quando | ligar, salvar, reabrir: continua ligado; o runtime lê `loop` e dá a volta; um só lugar para repetir (regra do Live2D, `03` B4) |
| Custo | P |
| Fonte | Spriter (laranja, gravado no SCML), DragonBones (por clipe) |

### Item 8 · Linha de resumo na linha do tempo

| Campo | Especificação |
|:---:|:---:|
| Comportamento | A linha **Alvo** vira **Resumo**: um losango em cada tempo que tenha chave em qualquer linha de baixo. Clicar escolhe todas as chaves daquele tempo. Arrastar move todas. Losango **branco** quando há mais de um tipo de chave no tempo |
| Tela | primeira linha da régua, sempre visível, mesmo com as linhas de baixo fechadas |
| Teclas | ↑ ↓ pulam pelos tempos do Resumo quando nenhuma linha está escolhida |
| Dados | só leitura de `allKeyTimes` (`anim/keying.ts`). Mover = `moveKeys` nas linhas todas |
| Pronto quando | animação com chaves em 0, 0,17 e 0,5 mostra 3 losangos; arrastar o do 0,17 para 0,2 move as chaves de todas as linhas daquele tempo, num passo de desfazer |
| Custo | M |
| Fonte | Spine (summary), Spriter (mainline), Blender. `02` seção 5.1 |

### Item 9 · Trocar o desenho por lista

| Campo | Especificação |
|:---:|:---:|
| Comportamento | O campo **Anexo** do slot vira uma lista com os anexos daquele slot nas peles visíveis, mais "(nenhum)". Na Árvore, cada anexo ganha uma **bolinha** de visível; clicar na bolinha troca o anexo do slot. Em Animando, a troca cria chave de Desenho se Gravar sozinho estiver ligado, senão o botão Chavear grava |
| Tela | `panels/properties-model.ts` linha 443 (`kind: 'text'` → `choice`); `panels/tree.ts` linhas dos anexos |
| Teclas | — |
| Dados | `slot.attachment` na montagem; linha do tempo `slot/attachment` em Animando (já existe: `SLOT_ANIMATABLE` em `anim/keying.ts`) |
| Pronto quando | trocar mão aberta por mão fechada em Animando com Gravar ligado cria uma chave "Desenho" parada; a lista mostra só os anexos do slot |
| Custo | P |
| Fonte | Spine (bolinha + chave), Spriter, DragonBones. `06` seção 7 |

### Item 10 · Semáforo do Chavear e Gravar em vermelho

| Campo | Especificação |
|:---:|:---:|
| Comportamento | O botão ◆ Chavear muda de cor: **verde** sem chave no tempo atual para o escolhido; **laranja** o escolhido mudou e não foi gravado; **vermelho** já tem chave. ● Gravar sozinho fica **vermelho aceso** quando ligado |
| Tela | tocador (item 6) |
| Teclas | K, A |
| Dados | leitura: `targetKey` e comparação valor atual × valor da chave (`anim/pose-mode.ts` já sabe o que mudou) |
| Pronto quando | mover um osso em Animando sem gravar deixa o botão laranja; Chavear deixa vermelho; ir a um quadro sem chave deixa verde. Teste sem DOM da função que decide a cor |
| Custo | P |
| Fonte | Spine (`02` seção 8.5), DragonBones (`03` A5) |

### Item 11 · Mudar a duração perguntando

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Clicar na duração no tocador abre um campo. Ao confirmar um valor diferente, pergunta: **"Esticar as chaves junto?"** Sim = `scaleKeys` por `nova/antiga`; Não = só muda `duration` (chaves além do fim ficam onde estão e a barra avisa quantas) |
| Tela | tocador (item 6) |
| Teclas | — |
| Dados | `animation.duration`, um `Command` com `animationOnly` |
| Pronto quando | 1,0 s → 2,0 s com "Sim" leva a chave de 0,5 para 1,0; com "Não" a chave fica em 0,5 |
| Custo | P |
| Fonte | Spriter (`01` seção 4, campo de tempo) |

### Item 12 · Ferramenta Ponto

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Ferramenta **Ponto** (tecla **O**). Com um osso escolhido: **Alt + arrastar** na cena cria um anexo `point` no slot novo `nome_ponto` preso ao osso; onde clicou é a posição, para onde arrastou é o ângulo. Clique seco = ângulo 0. Sem osso escolhido: avisa. Com a ferramenta ativa, arrastar um ponto que já existe move; arrastar a **seta** dele gira. Também **Novo → Ponto** na Árvore, com o osso escolhido |
| Tela | botão na barra de ferramentas; na cena o ponto é círculo + seta (já desenha: `viewport.ts` `drawPoints`). Propriedades: nome, x, y, rotação |
| Teclas | O; Alt + arrastar; F2 renomeia |
| Dados | anexo `point` (§7.9) na pele editável. `Command` de criar, mover, girar, apagar |
| Pronto quando | criar o ponto `cano` na ponta da espada, exportar, e o canal `points` do dump dá `x`, `y`, `rotation` iguais aos da cena. Caso de conformidade não muda (já existe) |
| Custo | M |
| Fonte | Spriter (`01` seção 6.4–6.5), Spine (`02` seção 6). `05` seção 8 |

### Item 13 · Ferramenta Caixa de colisão

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Ferramenta **Caixa** (tecla **X**). Alt + arrastar desenha um retângulo (4 vértices) num slot novo preso ao osso escolhido. Depois, vértices editáveis com a ferramenta Malha (já move vértices). **Novo → Caixa** na Árvore |
| Tela | botão na barra; a caixa já desenha (`drawBoundingBoxes`) |
| Teclas | X; Alt + arrastar |
| Dados | anexo `boundingbox` (§7.6) com `vertices` |
| Pronto quando | criar a caixa `soco` na mão, exportar, e o canal `boundingBoxes` do dump traz os 4 vértices no mundo |
| Custo | M |
| Fonte | Spriter (`01` 6.6), Spine (`02` 6.4) |

### Item 14 · Zoom pela roda, ícones no canto, percentual

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Roda do mouse dá zoom no ponto do cursor (já faz). Os três botões de texto saem da barra de cima. No **canto inferior direito da cena** ficam: `−` · `100%` (editável, digita e Enter) · `+` · `⛶` Ajustar à tela. Botão do meio e Espaço + arrastar continuam movendo a cena |
| Tela | camada HTML sobre o canvas, canto inferior direito, fundo semitransparente |
| Teclas | Ctrl+= aproximar, Ctrl+− afastar, Ctrl+0 100%, Ctrl+Shift+F ajustar, **F** enquadrar seleção |
| Dados | câmera em `RECORTE_editor_state.camera` (já existe) |
| Pronto quando | a barra de cima perde uma linha; digitar 200 no campo põe `zoom = 2`; F com um osso escolhido centra nele |
| Custo | P |
| Fonte | Live2D (`03` B3), Spine (`02` 3.2), Aseprite. `05` seção 4 |

### Item 15 · Cena maior: uma linha de ferramentas, uma linha na linha do tempo

| Campo | Especificação |
|:---:|:---:|
| Comportamento | Barra de cima vira **uma linha**: ferramentas como ícone + dica (nome e tecla), seletor **Eixos ▾** (Local · Pai · Mundo), e o grupo Travar. **Compensar** vai para o painel Propriedades, visível só com Mover/Girar/Escalar. Na linha do tempo, as linhas 3 e 4 (Fator, Esticar seleção, Espelhar no tempo, Fechar ciclo, Pares de nome, Espelhar esquerda e direita) vão para um botão **⋯ Mais** que abre um menu escrito, e para o menu Animação (item 16). Opção **Janela → Mostrar nome das ferramentas** devolve o texto para quem quer |
| Tela | `viewport.ts` `buildToolbar`, `dopesheet.ts` linhas 263–346 |
| Teclas | as mesmas |
| Dados | preferência "nome das ferramentas" em `localStorage` |
| Pronto quando | em 1440×900 a cena ocupa **pelo menos 60 % da altura** (hoje menos de 50 %); toda função das linhas retiradas continua acessível pelo ⋯ e pelo menu, com o mesmo nome |
| Custo | M |
| Fonte | Spine (toolbar única), Spriter 2 ("tudo à vista"), DragonBones. `05` seções 1 e 3 |

### Item 47 · Máscara de ocultar

| Campo | Especificação |
|:---:|:---:|
| Comportamento | **Novo → Máscara** na Árvore, com um osso escolhido: cria um slot com anexo `clipping` de 4 vértices. A ferramenta Malha edita os vértices. Propriedades da máscara: **Recorta até** (lista de slots, `end`), **Só estes** (lista de marcar, `slots`), **Inverter**. A cena desenha o polígono tracejado (cor própria) e o runtime já recorta |
| Tela | Árvore, Propriedades, cena. Caixa **Máscaras** no painel Exibição |
| Teclas | — |
| Dados | anexo `clipping` (§7.7): `end`, `slots`, `invert`, `vertices`. `Command` de criar, editar, apagar |
| Pronto quando | máscara elíptica no osso `portal` com `end` = último slot do herói: a parte do herói abaixo da borda some na cena e no `render-png`; o `deform` da máscara tem chave |
| Custo | M |
| Fonte | Spine (`New… → Clipping`), Live2D. `06` seção 9 |

---

## Nível 2 — bom de usar

| # | Item | Comportamento | Tela / Teclas | Dados | Pronto quando | Custo |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 16 | Menus Exibir · Animação · Janela · Ajuda → Atalhos | Menus escritos com o atalho ao lado, em `ui/menus.ts` (é dado, testável). Exibir = caixas do painel Exibição + zoom. Animação = tocador + bloco. Janela = painéis, Tab, Voltar ao padrão. Ajuda → Atalhos abre uma tabela | barra de menus; Shift+F1 | — | cada entrada de menu chama a mesma função do botão; teste lista as entradas | P |
| 17 | Ícone + dica em todo botão | SVG inline (nunca fonte externa), 20 px, com `title` e `aria-label` = nome + tecla | toda a barra | preferência texto/ícone | nenhum botão sem `aria-label`; teste varre o DOM | P |
| 18 | Botão direito alterna com a ferramenta anterior | na cena, botão direito troca entre a ferramenta atual e a anterior | cena | — | Girar → Mover → botão direito → Girar | P |
| 19 | Coluna direita em abas; Tab esconde | dois grupos: Árvore · Propriedades / Animações · Exibição · Prévia. Malha e pesos só com Malha ou Pesos ativa. Abas arrastáveis entre grupos. Borda entre grupos arrastável. **Tab** esconde a coluna e a faixa de baixo | `ui/shell.ts` | `RECORTE_editor_state.panels` | Tab dá a cena inteira; F9 do Spine equivalente | M |
| 20 | Exibição em 3 colunas: ver · travar · nome | uma linha por tipo (ossos, desenhos, pontos, caixas, máscaras, malhas) com três caixas | painel Exibição | `view` (já tem ver e travar; nome = `boneNames` e novos) | as caixas de travar são as mesmas do lote 0 | P |
| 21 | Ferramenta Inclinar (Z) | arrastar inclina `shearX`/`shearY` do osso, com alças próprias; em Animando cria chave | barra; Z | `bone.shearX/Y` (§4.2), já animável | inclinar 20° grava `shearX: 20`; chave "Inclinação X" aparece | M |
| 22 | Novo → Imagem num slot que existe | escolher o slot, Novo → Imagem, escolher PNG; entra no atlas (reempacotar) e vira anexo `region` do slot na pele editável | Árvore | `skins[].attachments[slot][nome]` | mão fechada entra no slot `mao` sem criar slot novo | P |
| 23 | Novo → Esqueleto num slot | escolher `.bone`/`.bonez`; cria anexo `skeleton` com `uri`, `animation` (lista do filho), `loop`, `timeScale`; Propriedades mostram os campos | Árvore, Propriedades | §7.11 | espada de fogo entra no slot `weapon` e anima na cena | M |
| 24 | Ossos desta pele | dentro de cada pele na Árvore, grupo **Ossos** com Adicionar/Tirar; marcar "Só com a pele" num osso pergunta a pele | Árvore | `skin.bones[]`, `bone.skinRequired` | validador sem `HINT_SKIN_BONE` depois de usar a tela | P |
| 25 | Chave só do osso escolhido | Shift+↑ / Shift+↓ pulam só pelas chaves das linhas escolhidas | linha do tempo | — | com `arm` escolhido, Shift+↓ ignora chaves só de `leg` | P |
| 26 | Interpolação pelo botão direito | menu escrito no losango: Linear · Suave · Parada · Curva… (abre o painel Curvas) | linha do tempo | `key.curve` | escolher Parada grava `stepped` | P |
| 27 | Esticar arrastando a borda | a seleção de chaves ganha alças nas pontas; arrastar estica com a outra ponta fixa | linha do tempo | `scaleKeys` | igual ao Fator, sem digitar | P |
| 28 | Casca de cebola na régua | ícone de cebola liga/desliga; ⋯ ao lado abre os 6 campos | régua | `view.onion` | o painel Exibição perde a seção | P |
| 29 | Zoom e deslocamento no painel Curvas | roda = zoom no tempo; Shift+roda = valor; botão **Enquadrar**; arrastar com botão do meio | Curvas | — | animação de 4 s dá para ver 0,5 s de perto | M |
| 30 | Prévia perto da linha do tempo | Prévia vira aba da faixa de baixo, ao lado de Curvas | faixa de baixo | painéis | abrir Prévia não rola a coluna direita | M |
| 31 | Colar em todas as chaves | Ctrl+Shift+V cola o valor copiado em todos os tempos de chave da linha | linha do tempo | chaves | um ponto colado em 5 chaves | P |
| 32 | Tocar para trás | botão ◀◀ e tecla Shift+Espaço | tocador | — | o relógio anda de 1,0 para 0 | P |
| 33 | Copiar / colar âncora | Copiar âncora do desenho escolhido; Colar âncora nos escolhidos (mesmo `x y rotation scale`) | menu Editar | anexo | 5 mãos alinhadas de uma vez | P |
| 34 | Buscar na Árvore | campo no topo; filtra por nome; `*` curinga; o campo fica **vermelho** com filtro ativo | Árvore | — | digitar `arm` mostra 4 linhas | P |
| 35 | Avisos com nome e botão Corrigir | `/skins/0/attachments/body` vira "desenho body, pele default"; botão leva ao item; quando houver correção óbvia, botão **Corrigir** | barra de avisos | — | R11 do manual de requisitos | M |
| 48 | Traçar silhueta gera a máscara | na máscara escolhida, botão **Usar a silhueta de…** (lista de desenhos): copia o contorno da Malha para os vértices da máscara | Propriedades da máscara | `clipping.vertices` | a máscara casa com a arma sem desenhar à mão | P |

---

## Nível 3 — completo

| # | Item | Uma linha de spec | Custo |
|:---:|:---:|:---:|:---:|
| 36 | Variável presa a caixa ou ponto | `variable` (já no formato) editável na linha do tempo do anexo, interpolando; Spriter `01` 6.7 | G |
| 37 | Som na linha do tempo | evento com `audio` (§4.5) desenhado como onda na régua; tocar junto | G |
| 38 | Tags de estado | `tag` (já no formato) com linha própria na linha do tempo: Ativa/Inativa por chave | M |
| 39 | Remapear atalhos | tabela em Ajuda → Atalhos com edição; salva em `localStorage` | M |
| 40 | Guardar osso numa tecla | Ctrl+1..0 guarda a seleção; 1..0 recupera | P |
| 41 | Histórico de seleção | Page Up / Page Down andam pelas últimas 20 seleções | P |
| 42 | Painel Métricas | ossos, slots, anexos, vértices, triângulos, área desenhada por quadro | P |
| 43 | Modos de fim | tocador: Parar · Repetir · Vai-e-volta (Blender); só editor | P |
| 44 | Caixa em polígono com pesos | caixa com N vértices e `binding` (§7.4) pintada com a ferramenta Pesos | M |
| 45 | Interface em inglês | tabela de textos; `lang` no `localStorage` | M |
| 46 | Vídeos por ferramenta | C5 do manual de requisitos; roteiro = capítulos 1 a 6 | G |

---

## Decisões de formato (não são de tela)

Vão para "Decisões em aberto" do `ESTADO.md`. O planejador **não** projeta estes sem a decisão do dono.

| # | O que | Proposta de spec | Efeito em runtime que não conhece |
|:---:|:---:|:---:|:---:|
| 49 | Clip mask | campo `clipTo: <slot>` em `region` e `mesh` (§7.3, §7.4): o anexo só desenha onde o slot citado tem alpha. Ou extensão `BONE_clip_alpha` com o mesmo campo | ignora e desenha inteiro; avisa uma vez |
| 50 | Mesclagens `overlay`, `hardlight`, `softlight` | três linhas na tabela da §7.12. Canvas 2D tem as três (`globalCompositeOperation`); WebGL precisa de shader | cai para `normal` e avisa (regra já existe) |
| 51 | Tela do clip mask | campo **Recortar pelo de baixo** no anexo; botão **Padrão por cima** que cria o slot do padrão com `clipTo` e `blend` | depois do 49 |
| 52 | Mapa de normais | extensão `BONE_material`: `page.maps: { normal, emissive, metallic }` no atlas, ou slot marcado `kind: "normal"` | desenha só a cor |

---

## O que o planejador precisa decidir

| Decisão | Opções | O pesquisador sugere |
|:---:|:---:|:---:|
| Ordem dos lotes | a do `07`, ou por custo | a do `07`: destrava o caminho mínimo primeiro |
| Tamanho do lote | 1 item ou 3 itens | 2 a 3 itens **P**, ou 1 item **M**, por versão |
| Ícones | desenhar SVG próprio ou usar um conjunto livre (Lucide, MIT) | conjunto livre, com licença citada no `NOTICE` |
| Tab esconde tudo ou só a direita | — | tudo: é o F9 do Spine e o Tab do Aseprite |
| Onde mora Compensar | Propriedades ou ⋯ da barra | Propriedades, só com ferramenta de transformar |
| Itens 49–52 | decidir agora ou depois | depois do nível 1; precisa do dono |

---

## Arquivos desta pasta

| Arquivo | O que é |
|:---:|:---:|
| `00` | inventário da tela de hoje, conferido no código |
| `01` a `04` | os programas: Spriter, Spine, DragonBones e Live2D, convenções de 5 outros |
| `05` | proposta de tela, menus e atalhos |
| `06` | fluxos do Spriter no Recorte: virar filho, espada animada, pivô, sub-animação, ossos da pele, trocar imagem, máscara, clip mask |
| `07` | lista mestra: 52 itens em 3 níveis, com lotes |
| `08` | este: as especificações |

---

**Assinado:** Pesquisador — sessão "Pesquisa de organização de menus" (Claude Fable 5.1; agentes de busca em Opus). 08/09/2026.
