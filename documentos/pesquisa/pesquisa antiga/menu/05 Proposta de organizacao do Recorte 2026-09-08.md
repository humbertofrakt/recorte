# Proposta — como reorganizar a tela do Recorte

Escrita em 08/09/2026, depois de ler os relatórios `00` a `04` desta pasta.
Cada ideia diz de onde veio. Nada foi inventado sem fonte.

## O diagnóstico em 6 linhas

1. Hoje a cena fica com **menos da metade** da tela. Nos outros programas a cena é a **maior parte**.
2. Temos **7 linhas de botões com texto**. Os outros usam **ícone com dica** (nome + atalho ao passar o mouse).
3. O zoom com nome ocupa uma linha inteira. Em todos os programas o zoom é **roda do mouse** e um ícone no canto.
4. O tocador (Tocar, Laço, Velocidade) está escondido na coluna direita. Em todos os programas ele fica **colado na linha do tempo**.
5. A linha **Alvo** deveria ser a **linha de resumo** com todas as chaves. Spine, Spriter e Blender têm isso.
6. Falta a ferramenta **Ponto**. O formato já tem `point` com posição e ângulo. É o "pivô da arma" do Spriter.

---

## 1. A tela nova, em desenho

```
┌───────────────────────────────────────────────────────────────────────┐
│ Recorte   Arquivo  Editar  Exibir  Animação  Janela  Ajuda   heroi.bone│  ← 1 linha
├──────────────────────────────────────────────────┬────────────────────┤
│ [Montagem ▾]  ↖ ✥ ↻ ⤢ 🦴 🧍 ▦ 🖌 ◎ ▭   Eixos: Local▾│  Árvore │ Propriedades│  ← 1 linha
│                                                  │                    │
│                                                  │   (aba escolhida)  │
│                     C E N A                      │                    │
│                                                  │                    │
│                                       [−][100%][+][⛶]│               │  ← canto da cena
├──────────────────────────────────────────────────┴────────────────────┤
│ ⏮ ⏪ ◀ ▶ ▶▶ ⏭  🔁  0,32 s · q 10   Vel 1×   ● Gravar   [⋯ mais]    │  ← 1 linha
│ Resumo   ◆     ◆        ◆     ◆        ◆                              │
│ hips     ◆              ◆                                             │
│ torso          ◆                       ◆                              │
├───────────────────────────────────────────────────────────────────────┤
│ Arquivo salvo.   Animando: walk                         Nenhum aviso  │  ← 1 linha
└───────────────────────────────────────────────────────────────────────┘
```

| Região | Hoje | Proposta | De onde veio |
|:---:|:---:|:---:|:---:|
| Cima da cena | 3 linhas | 1 linha de ícones | Spine (toolbar única), DragonBones (4 ícones) |
| Zoom | 1 linha de botões | 4 ícones no canto da cena + `%` | Live2D (`[−] % [+]`), Spine (2 ícones no canto) |
| Tocador | escondido à direita | 1 linha colada na linha do tempo | Spriter, DragonBones, Moho, Live2D: todos |
| Linha do tempo | 4 linhas de botões | 1 linha + botão **⋯ mais** | Spriter 2: "tudo à vista", mas sem inchar |
| Coluna direita | 6 painéis empilhados | 2 grupos de abas | Spine (abas que se arrastam) |
| Cena | menos de 50% | perto de 65% | padrão dos cinco do relatório `04` |

---

## 2. Barra de menus — de 3 para 6 menus

Hoje o que seria de Exibir, Animação e Janela está espalhado em botões. Levar para o menu **não esconde**: o botão visível continua onde importa, e o menu vira o lugar onde se descobre o atalho.

| Menu | O que entra | Atalho |
|:---:|:---:|:---:|
| Arquivo | igual a hoje | igual |
| Editar | Desfazer · Refazer · Copiar · Colar · Apagar · **Renomear** | Ctrl+Z · Ctrl+Y · Ctrl+C · Ctrl+V · Del · **F2** |
| **Exibir** | Ossos · Nomes · Caixas · Pontos · Malhas · Arestas · Pesos · Grade · Eixos · Casca de cebola… · Aproximar · Afastar · 100% · Ajustar à tela · Enquadrar seleção | 7 · 8 · … · Ctrl+= · Ctrl+− · Ctrl+0 · Ctrl+Shift+F · **F** |
| **Animação** | Tocar/Pausar · Repetir · Chave anterior/seguinte · Chavear · Gravar sozinho · Esticar seleção… · Espelhar no tempo · Fechar ciclo · Espelhar esquerda e direita… · Mudar duração… | Espaço · L · ↑ ↓ · **K** · **A** · … |
| **Janela** | Árvore · Propriedades · Animações · Exibição · Prévia · Malha e pesos · Curvas · **Esconder painéis** · Voltar ao padrão | … · **Tab** · — |
| Ajuda | Manual · **Atalhos** (tabela) | F1 · **Shift+F1** |

Fonte: Blender (Exibir é o menu View com Frame All), Aseprite (Tab esconde a timeline), Spine (F9 minimiza tudo).

---

## 3. Ferramentas — uma linha, ícone com dica

| Ferramenta | Ícone | Tecla | Dica que aparece |
|:---:|:---:|:---:|:---:|
| Selecionar | ↖ | Q | "Selecionar (Q)" |
| Mover | ✥ | W | "Mover (W)" |
| Girar | ↻ | E | "Girar (E)" |
| Escalar | ⤢ | R | "Escalar (R)" |
| Criar osso | 🦴 | N | "Criar osso (N)" |
| Posar | 🧍 | B | "Posar (B)" |
| Malha | ▦ | M | "Malha (M)" |
| Pesos | 🖌 | G | "Pesos (G)" |
| **Ponto** (novo) | ◎ | **O** | "Ponto (O) — Alt+arrastar define posição e ângulo" |
| **Caixa** (novo) | ▭ | **X** | "Caixa de colisão (X)" |
| **Inclinar** (novo) | ⧄ | **Z** | "Inclinar (Z) — perspectiva falsa" (Spine: Shear) |
| Virar filho | — | segurar **P** + clique | "Pai (P): segure e clique no novo pai" (Spriter: B; Spine: P) |

Regras copiadas:

- **Arrastar em área vazia desenha um retângulo e seleciona o que ele toca.** Spine, Spriter, Blender, Unity, todos. Hoje a cena não tem; a linha do tempo já tem. Shift soma, Ctrl tira.
- **Botão direito na cena troca para a última ferramenta usada.** Spine. Vai e volta entre Girar e Mover sem sair do mouse.
- **Eixos** (Local · Pai · Mundo) vira **um seletor** no fim da linha, não três botões. Unity faz assim.
- **Compensar** (3 caixas) sai da barra. Vai para o painel Propriedades, só quando Mover/Girar/Escalar está ativo. Blender põe isso no cabeçalho, escondido num "popover".
- Texto dos botões pode voltar por opção em **Janela → Mostrar nome das ferramentas**. Spine tem essa opção. Bom para quem está começando.

---

## 4. Zoom — quatro ícones no canto da cena

| Controle | Como | De onde veio |
|:---:|:---:|:---:|
| Aproximar / Afastar | **roda do mouse** sobre a cena | todos os nove programas |
| Arrastar a cena (pan) | **botão do meio** ou **Espaço + arrastar** | Spriter, Live2D |
| `[−] 100% [+]` | canto inferior direito da cena, com o **percentual** editável | Live2D, Aseprite (barra de status) |
| `⛶` Ajustar à tela | ícone ao lado, atalho Ctrl+Shift+F | Spine (canto inferior esquerdo) |
| Enquadrar seleção | tecla **F** | Live2D, Unity |
| Voltar a 100% | Ctrl+0 | Live2D |

Os três botões de hoje somem da faixa de cima. Nada se perde: continua no menu Exibir com atalho ao lado.

---

## 5. Tocador — uma linha colada na linha do tempo

Ordem padrão dos cinco programas do relatório `04`: extremo → chave → quadro → tocar → quadro → chave → extremo.

| Botão | Ícone | Tecla | Observação |
|:---:|:---:|:---:|:---:|
| Início | ⏮ | Home | |
| Chave anterior | ⏪ | ↑ | Shift+↑ = só do osso escolhido (Spriter, Live2D) |
| Quadro anterior | ◀ | ← | |
| Tocar / Pausar | ▶ / ⏸ | **Espaço** | hoje não tem atalho |
| Quadro seguinte | ▶| | → | |
| Próxima chave | ⏩ | ↓ | |
| Fim | ⏭ | End | |
| **Repetir** | 🔁 | **L** | liga/desliga. **Aceso = laranja** (Spriter). **Grava em `animation.loop`** do arquivo (§4.6), como o Spriter grava no SCML |
| Tempo | `0,32 s · quadro 10` | clique para digitar | campo editável, como Blender e Unity |
| Duração | `1,00 s` | clique para digitar | ao mudar, **pergunta** se estica as chaves ou deixa no lugar (Spriter) |
| Velocidade | `1×` | | lista: ¼ ½ 1 2 |
| Gravar sozinho | ● | **A** | **vermelho aceso** quando ligado (DragonBones) |
| Chavear | ◆ | **K** | cor de semáforo: verde sem chave, laranja mudou, vermelho já tem chave (Spine) |

O botão Repetir vale para o tocador **e** para o arquivo. É a mesma coisa em um lugar só. O Live2D põe em dois lugares e os usuários reclamam.

---

## 6. Linha do tempo — resumo em cima, ferramentas no "mais"

### A linha Alvo vira a linha Resumo

| Nível | Mostra | De onde veio |
|:---:|:---:|:---:|
| **Resumo** (primeira linha) | um losango em cada tempo que tem chave em qualquer osso | Spine (summary), Spriter (mainline fechada), Blender (Timeline) |
| Osso | losango onde o osso tem chave; **branco** se tem mais de um tipo no mesmo quadro | Spine |
| Propriedade | aberto pelo triângulo, uma linha por propriedade | Spine, Spriter |

Arrastar um losango do Resumo move **todas** as chaves daquele tempo. Clicar nele seleciona todas.

### O que sai da faixa e vai para o botão **⋯ mais**

Esticar ×2 · Encolher ÷2 · Espelhar · Fator · Esticar seleção · Espelhar no tempo · Fechar ciclo · Pares de nome · Espelhar esquerda e direita.

Ficam também no menu **Animação**. São ferramentas de vez em quando. Hoje ocupam duas linhas permanentes.

### Outras coisas da linha do tempo

| Ideia | Como | De onde veio |
|:---:|:---:|:---:|
| Zoom da régua | Ctrl + roda | Spriter, Spine |
| Enquadrar todas as chaves | botão pequeno na régua | Spine ("Zoom Keys") |
| Interpolação pelo botão direito | botão direito no losango: Linear · Suave · Parada | Spriter |
| Colar em todas as chaves | Ctrl+Shift+V | Spriter |
| Esticar a seleção | arrastar a **borda** da seleção | Spine |
| Chave só do osso escolhido | Shift+↑ / Shift+↓ | Spriter, Live2D |
| Casca de cebola | ícone de cebola **na régua**, com ⋯ ao lado para os 6 campos | Godot, Moho, Aseprite |

---

## 7. Coluna da direita — abas em vez de pilha

Hoje seis painéis abrem um por cima do outro e cortam o de baixo.

| Grupo | Abas | Quando aparece |
|:---:|:---:|:---:|
| Em cima | **Árvore** · **Propriedades** | sempre |
| Embaixo | **Animações** · **Exibição** · **Prévia** | sempre |
| Flutuante | **Malha e pesos** | só quando a ferramenta Malha ou Pesos está ativa |

Regras copiadas do Spine:

- Cada aba se arrasta para o outro grupo. A borda entre os grupos se arrasta.
- **Tab** esconde a coluna inteira. Aperta de novo, volta. Aseprite faz com a timeline.
- **Janela → Voltar ao padrão** desfaz a bagunça.

O painel **Exibição** ganha três colunas por tipo de item: **ver · travar · nome**. Spine chama a do meio de "selecionável"; Spriter chama de "lock". Resolve "cliquei na coisa errada".

| Tipo | Ver | Travar | Nome |
|:---:|:---:|:---:|:---:|
| Ossos | ☑ | ☐ | ☐ |
| Desenhos | ☑ | ☐ | ☐ |
| Pontos | ☑ | ☐ | ☑ |
| Caixas | ☑ | ☑ | ☐ |

### Travar — o botão do Spriter que mais recebe elogio

| Onde | Como | De onde veio |
|:---:|:---:|:---:|
| Barra de ferramentas | 4 ícones: 👁 ossos · 🔒 ossos · 👁 desenhos · 🔒 desenhos | Spriter (botões show / lock) |
| Teclado | **7 8 9 0**: ver ossos · travar ossos · ver desenhos · travar desenhos | Spriter |
| Árvore | um cadeado pequeno em cada linha, para travar **um** osso ou **um** desenho | Spine (coluna por tipo), Moho, Blender (cadeado por objeto) |
| Na cena | item travado aparece, mas o clique e o retângulo **passam por ele** | Spriter, Spine |

Trava é estado do editor, não do arquivo. Vai em `EditorState` junto com câmera e seleção, nunca no `.bone`.

O fluxo do Spriter que o Humberto conhece: **trava os desenhos, anima só os ossos**. Sem isso, cada clique no braço pega a manga.

---

## 8. Ponto — o "pivô da arma" do Spriter

O que o Spriter chama de action point é, no nosso formato, o anexo **`point`** (§7.9). Já tem posição e rotação no mundo. Já sai no canal `points` para os dois runtimes. **Só falta a ferramenta na tela.**

| Passo | Como fica no Recorte | De onde veio |
|:---:|:---:|:---:|
| 1 | Escolher o osso da arma na Árvore | Spine |
| 2 | Ferramenta **Ponto** (O) ou **Novo → Ponto** na Árvore | Spine (`New… → Point`) |
| 3 | **Alt + arrastar** na cena: onde clica é a posição, para onde arrasta é o ângulo | Spriter |
| 4 | Clique seco cria com ângulo zero | Spriter |
| 5 | Na cena o ponto é um círculo **com uma seta** mostrando o ângulo | Spriter, Spine |
| 6 | Nome pelo duplo clique ou F2 | Spriter |
| 7 | Se tiver várias armas: um ponto por pele, com o mesmo nome | Spine |

O que o jogo lê, e já lemos hoje:

| Dado | Uso |
|:---:|:---:|
| nome | achar o ponto ("cano") |
| x, y | onde nasce a bala |
| rotation | para onde a bala vai |

Combina com o **Evento** que já existe: evento "atirar" na chave, ponto "cano" na arma. O manual do Spriter descreve exatamente essa dupla.

O mesmo gesto serve para **Caixa** (`boundingbox`): Alt+arrastar desenha o retângulo. Spriter deixa a caixa carregar variáveis (dano que sobe de 10 para 20 no auge do soco). Nosso formato já tem `variable`. Fica para depois.

---

## 9. Atalhos — a tabela completa proposta

| Grupo | Tecla | Faz |
|:---:|:---:|:---:|
| Ferramentas | Q W E R N B M G **O X Z** | como hoje, mais Ponto, Caixa e Inclinar |
| Ferramentas | segurar **P** + clique | vira filho do osso clicado (Spriter: B) |
| Ferramentas | botão direito na cena | volta para a ferramenta anterior |
| Tocar | **Espaço** | tocar / pausar |
| Tocar | **L** | repetir liga/desliga |
| Tempo | ← → | quadro |
| Tempo | ↑ ↓ | chave |
| Tempo | Shift+↑ Shift+↓ | chave só do osso escolhido |
| Tempo | Home End | início e fim |
| Chaves | **K** | chavear |
| Chaves | **A** | gravar sozinho liga/desliga |
| Chaves | Del · Ctrl+C · Ctrl+V · Ctrl+Shift+V | apagar, copiar, colar, colar em todas |
| Cena | roda · Ctrl+= · Ctrl+− · Ctrl+0 | zoom |
| Cena | **F** · Ctrl+Shift+F | enquadrar seleção · ajustar à tela |
| Cena | botão do meio · Espaço+arrastar | arrastar a cena |
| Ver e travar | 7 8 9 0 | ver ossos · travar ossos · ver desenhos · travar desenhos (Spriter) |
| Selecionar | arrastar em área vazia · Shift · Ctrl | retângulo · soma · tira |
| Janela | **Tab** | esconder painéis |
| Geral | F1 · Shift+F1 · F2 · Esc | manual · atalhos · renomear · desmarcar |

Regra: todo atalho aparece na dica do botão e no menu. Nielsen, heurística 7: acelerador para quem sabe, caminho visível para quem não sabe.

---

## 10. O que a pesquisa mostrou que falta, além dos menus

| Falta | Quem tem | Custo |
|:---:|:---:|:---:|
| Ferramenta Ponto e Caixa | Spriter, Spine | médio |
| Loop gravado no arquivo | Spriter, DragonBones, Live2D | pequeno (campo já existe) |
| Linha de resumo | Spine, Spriter, Blender | médio |
| Mudar duração perguntando o que fazer com as chaves | Spriter | pequeno |
| **Selecionar vários arrastando um retângulo** | todos os nove | pequeno |
| **Travar ossos / desenhos** para não mover sem querer | Spriter (muito elogiado), Spine (coluna "clicar") | pequeno |
| Chavear só o escolhido vs tudo | Spriter (Key selected / Key all) | pequeno |
| Ver a interpolação entre chaves como linha na linha do tempo | Spine | médio |
| Tocar para trás | Blender, DragonBones | pequeno |
| Modos de fim: parar · repetir · vai-e-volta | Blender (5 modos), formato já tem `pingpong` em sequência | pequeno |
| Variável presa a caixa, interpolando | Spriter | grande |
| Remapear atalhos | Spine, Live2D | médio |
| Buscar na Árvore | Spine (filtro fica vermelho) | pequeno |
| Histórico de seleção (Page Up/Down) | Spine | pequeno |
| Painel solto em outro monitor | ninguém faz bem; Spine admite que não faz | grande |

---

## 11. O que NÃO copiar

| Não copiar | Por quê |
|:---:|:---:|
| Função só no botão direito | Spriter 1 fez isso e a própria empresa voltou atrás no Spriter 2 |
| Tocar só por tecla, sem botão | Spine faz; iniciante não descobre |
| Repetir em dois lugares | Live2D faz; confunde |
| Ícone sem dica | Live2D: usuários abrem fórum para saber o nome do botão |
| Opções de exibição espalhadas | Spine tem em 3 lugares; um só (painel Exibição + menu Exibir) |
| Retorno visual fraco | Spriter: usuário repete o clique "por garantia" |

---

## 12. Ordem sugerida, em lotes pequenos

Cada lote é uma versão numerada, com backup, testável sozinha.

| Lote | O que faz | Ganho na tela |
|:---:|:---:|:---:|
| 0 | **Retângulo de seleção** na cena e **travar** ossos / desenhos (4 ícones, teclas 7 8 9 0, cadeado na Árvore) | dá para trabalhar |
| 1 | Zoom vira 4 ícones no canto + roda + `%` | some 1 linha em cima |
| 2 | Tocador vai para a linha do tempo. Repetir grava em `animation.loop`. Espaço e L | tocador visível |
| 3 | Linha Alvo vira Resumo com losangos | visão geral |
| 4 | Ferramentas viram ícone + dica. Eixos vira seletor. Compensar vai para Propriedades | some 1 linha em cima |
| 5 | Bloco e Espelho vão para o botão ⋯ e para o menu Animação | somem 2 linhas embaixo |
| 6 | Menus Exibir · Animação · Janela · Ajuda → Atalhos | tudo descobrível |
| 7 | Coluna direita em 2 grupos de abas. Tab esconde | painéis inteiros |
| 8 | Ferramenta Ponto (Alt+arrastar) e Caixa | o pivô da arma |
| 9 | Exibição em 3 colunas: ver · travar · nome | trava por tipo, num lugar só |
| 10 | Semáforo do Chavear, Gravar vermelho, duração que pergunta | retorno visual |

Depois do lote 5 a cena já passa de metade para perto de dois terços da tela.

Os fluxos do Spriter (virar filho, trocar imagem, espada animada, ossos da pele, inclinar) estão no arquivo `06`, com o lote de cada um na seção 8 dele.

---

**Assinado:** Pesquisador — sessão "Pesquisa de organização de menus" (Claude Fable 5.1; agentes de busca em Opus). 08/09/2026.
