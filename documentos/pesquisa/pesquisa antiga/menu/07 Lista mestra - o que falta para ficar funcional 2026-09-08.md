# Lista mestra — o que os outros têm e falta no Recorte

Escrita em 08/09/2026. Junta os arquivos `00` a `06` desta pasta numa lista só.
O objetivo é este: **o que faz sentido copiar para o Recorte ficar funcional.**

## A situação em 5 linhas

1. O formato, os dois runtimes e a suíte de testes estão de pé. 1.347 testes.
2. O editor abre, mostra e salva. Mas **montar e animar um boneco do zero pela tela ainda trava** em vários pontos.
3. O que trava não é falta de formato. **48 dos 52 itens já cabem no `.bone` de hoje.** É tela. Os que mexem no formato (clip mask, sobrepor, normais) estão separados no fim do nível 3.
4. Os nove programas pesquisados concordam em quase tudo. O que eles têm em comum é o que falta aqui.
5. A lista está em três níveis: **funcional**, **bom de usar**, **completo**. O primeiro nível é o que importa agora.

---

## Nível 1 — Para ficar funcional

O caminho mínimo de quem abre o programa: **trazer imagens → criar ossos → prender → posar → animar → tocar → exportar.**
Cada linha abaixo é um lugar onde esse caminho trava hoje.

| # | Passo | O que falta | Quem tem | Recorte hoje | Custo |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Prender | **Virar filho pelo clique**: segurar P + clicar no pai | Spriter (B), Spine (P) | só arrastando na Árvore; todo slot do PSD nasce na raiz | pequeno |
| 2 | Prender | **Mover a imagem sem mover o osso**, com a âncora visível | Spriter (pivô), DragonBones (origin), Moho (cruz) | só digitando x, y em Propriedades | médio |
| 3 | Selecionar | **Retângulo de seleção** na cena | todos os nove | só Shift + clique | pequeno |
| 4 | Selecionar | **Travar ossos / desenhos** (4 ícones, teclas 7 8 9 0, cadeado na Árvore) | Spriter (o botão mais elogiado), Spine | não existe | pequeno |
| 5 | Posar | **Números com setas e arrasto** sobre o rótulo | Spine, Moho, Blender, Unity | apagar e digitar | pequeno |
| 6 | Animar | **Tocador visível**, colado na linha do tempo. Espaço toca | todos os nove | escondido na coluna direita | pequeno |
| 7 | Animar | **Repetir** como botão aceso, gravado em `animation.loop` | Spriter, DragonBones, Live2D | só no tocador, não grava | pequeno |
| 8 | Animar | **Linha de resumo** com um losango por tempo | Spine, Spriter, Blender | linha "Alvo" vazia | médio |
| 9 | Animar | **Trocar o desenho por lista**, não digitando o nome | Spriter, Spine, DragonBones | campo de texto | pequeno |
| 10 | Animar | **Chavear com semáforo** (verde · laranja · vermelho) e Gravar em vermelho | Spine, DragonBones | botão azul sempre igual | pequeno |
| 11 | Animar | **Mudar a duração** perguntando o que fazer com as chaves | Spriter | só escrevendo `duration` no arquivo | pequeno |
| 12 | Jogo | **Ferramenta Ponto** (Alt + arrastar = posição e ângulo) | Spriter, Spine | o formato tem, a tela não cria | médio |
| 13 | Jogo | **Ferramenta Caixa** de colisão | Spriter, Spine | idem | médio |
| 14 | Ver | **Zoom pela roda**, ícones no canto, percentual | todos os nove | 3 botões de texto numa linha | pequeno |
| 15 | Ver | **Cena maior**: ferramentas em 1 linha de ícones, linha do tempo em 1 linha + "mais" | Spine, Spriter 2, DragonBones | 7 linhas de botões, cena com menos de metade | médio |
| 47 | Cena | **Máscara de ocultar** (`clipping`): Novo → Máscara, desenhar o polígono, `end`, Inverter, e "Máscaras" no Exibição. Personagem saindo do portal | Spine, Live2D | formato e runtime prontos; o editor não cria nem mostra | médio |

Sem os itens 1 a 4 não se monta um boneco sem sofrer. Sem 6 a 10 não se anima com conforto. Sem 12 o jogo não sabe de onde sai a bala. Sem 47 não se esconde nada.

---

## Nível 2 — Para ficar bom de usar

| # | O que | Quem tem | Recorte hoje | Custo |
|:---:|:---:|:---:|:---:|:---:|
| 16 | Menus **Exibir · Animação · Janela** e **Ajuda → Atalhos** | Blender, Aseprite, Live2D | 3 menus | pequeno |
| 17 | **Ícone + dica** com nome e atalho em todo botão | Spriter 2, Live2D (e a crítica de quem não tem) | texto só | pequeno |
| 18 | **Botão direito** volta à ferramenta anterior | Spine | — | pequeno |
| 19 | **Coluna direita em abas**; Tab esconde tudo | Spine, Aseprite | 6 painéis empilhados | médio |
| 20 | **Exibição em 3 colunas**: ver · travar · nome | Spine | 9 caixas | pequeno |
| 21 | **Ferramenta Inclinar** (Z), para perspectiva falsa | Spine, Live2D | só número | médio |
| 22 | **Novo → Imagem** num slot que já existe | Spine, Spriter | Importar imagens cria slot novo | pequeno |
| 23 | **Novo → Esqueleto** (`.bone` filho) num slot | só o nosso formato tem; Spriter tem sub-entity | só escrevendo no arquivo | médio |
| 24 | **Ossos desta pele** na Árvore | Spine | só escrevendo `skin.bones` | pequeno |
| 25 | **Chave só do osso escolhido** (Shift + ↑ ↓) | Spriter, Live2D | — | pequeno |
| 26 | **Interpolação pelo botão direito** no losango | Spriter | só no painel Curvas | pequeno |
| 27 | **Esticar arrastando a borda** da seleção | Spine | só por fator | pequeno |
| 28 | **Casca de cebola na régua**, com ⋯ | Godot, Moho, Aseprite | painel Exibição, dobrado | pequeno |
| 29 | **Zoom e deslocamento no painel Curvas** | Spine (Frame, Auto zoom), Live2D | mostra a animação inteira | médio |
| 30 | **Prévia perto da linha do tempo** | Spine (Preview em aba) | coluna direita | médio |
| 31 | **Colar em todas as chaves** (Ctrl + Shift + V) | Spriter | — | pequeno |
| 32 | **Tocar para trás** | Blender, DragonBones | — | pequeno |
| 33 | **Copiar / colar âncora** entre imagens | Spriter | — | pequeno |
| 34 | **Buscar na Árvore**, filtro fica vermelho | Spine | — | pequeno |
| 35 | Avisos com **nome do item e botão Corrigir**, não `/skins/0/…` | Spine, Live2D | endereço de máquina (R11) | médio |
| 48 | **Traçar silhueta gera a máscara** com um clique | — (junta duas coisas que já temos) | a silhueta existe só na Malha | pequeno |

---

## Nível 3 — Para ficar completo

| # | O que | Quem tem | Custo |
|:---:|:---:|:---:|:---:|
| 36 | Variável presa a caixa ou ponto, interpolando (dano 10 → 20) | Spriter | grande |
| 37 | Som na linha do tempo, com a onda desenhada | Spriter, Spine (Audio) | grande |
| 38 | Tags de estado (vulnerável, invencível) editadas na linha do tempo | Spriter | médio |
| 39 | Remapear atalhos | Spine, Live2D | médio |
| 40 | Guardar osso numa tecla (Ctrl + 1..0) | DragonBones | pequeno |
| 41 | Histórico de seleção (Page Up / Down) | Spine | pequeno |
| 42 | Painel Métricas: ossos, vértices, triângulos, área | Spine | pequeno |
| 43 | Modos de fim: parar · repetir · vai-e-volta | Blender | pequeno |
| 44 | Caixa de colisão em polígono, com pesos | Spine | médio |
| 45 | Interface em inglês | todos | médio |
| 46 | Vídeos curtos por ferramenta (C5) | Spine, Live2D | grande |

### Os que mexem no formato

Estes são os únicos desta lista que não cabem no `.bone` de hoje. São decisão sua, e vão para o `ESTADO.md`.

| # | O que | Como entraria | Quem tem |
|:---:|:---:|:---:|:---:|
| 49 | **Clip mask**: o desenho de cima só aparece onde o de baixo tem pixel. Skin do CS2, tatuagem, sujeira | campo `clipTo` no anexo (ou extensão `BONE_clip_alpha`, citada na §7.7 e nunca escrita). Detalhe no arquivo `06`, seção 10 | Photoshop, CS2, Live2D |
| 50 | Mesclagens **sobrepor** (`overlay`), `hardlight`, `softlight`, para o clip mask mesclar | §7.12, mais três linhas de fatores. Runtime sem ela cai para `normal` e avisa, regra que já existe | Photoshop, CS2, Live2D (parcial) |
| 51 | Na tela: campo **Recortar pelo de baixo** no anexo, e um botão "Padrão por cima" que monta os dois slots | tela, depois do 49 | — |
| 52 | **Mapa de normais** e outros mapas | extensão `BONE_material`: slot ou página marcada `normal`, `emissive`, `metallic`. Leitor que não conhece desenha só a cor | Spine (só no shader do Unity, fora do formato), Unity, Godot |

Até o formato mudar, dá para imitar o clip mask com o polígono do item 47 e `multiply`. Serve para testar, não para entregar.

---

## O que NÃO fazer agora

| Não fazer | Por quê |
|:---:|:---:|
| Girar em Z, 3D | é a decisão "2D ou 2D+3D" do manual de requisitos, seção 6. Decide você, não a pesquisa |
| Painel solto em outro monitor | nem o Spine faz. Custo grande, ganho pequeno |
| Função só no botão direito | o Spriter voltou atrás disso |
| Ícone sem dica | Live2D: usuários abrem fórum para saber o nome do botão |
| Docking livre de painéis | primeiro abas; docking só se sobrar tempo |

---

## A ordem de trabalho

Junta os lotes do arquivo `05` (seção 12) e do `06` (seção 8). Cada lote é uma versão numerada, com backup e teste.

| Lote | Itens | O que destrava |
|:---:|:---:|:---:|
| 0 | 3, 4, 1 | selecionar, travar, virar filho. Montar sem sofrer. **Feito em 08/09/2026, v1.4** |
| 1 | 14 | zoom no canto. Some 1 linha |
| 2 | 6, 7 | tocador visível, repetir grava |
| 3 | 8, 9, 10 | resumo, lista de desenhos, semáforo |
| 4 | 15, 17, 18, 21 | ferramentas em ícone, Inclinar, botão direito |
| 5 | 15 | bloco e espelho vão para o "mais". Somem 2 linhas |
| 6 | 16 | menus novos, tabela de atalhos |
| 7 | 19, 28, 30 | abas na direita, Tab, cebola na régua, Prévia perto |
| 8 | 12, 13, 47, 48, 2, 22, 23 | Ponto, Caixa, **Máscara**, silhueta vira máscara, mover imagem, Novo → Imagem, Novo → Esqueleto |
| 9 | 20, 24, 5 | Exibição em 3 colunas, ossos da pele, números com setas |
| 10 | 11, 25, 26, 27, 31, 33 | duração, chave do osso, interpolação, borda, colar em todas, âncora |
| 11+ | nível 2 restante, depois nível 3 | |
| decisão | 49, 50, 52 | clip mask, sobrepor, mapa de normais. **Mexem no formato**. Depois deles, o 51 na tela |

Depois do lote 3 dá para animar com conforto. Depois do lote 8 o jogo tem ponto e caixa. Aí o programa é funcional.

---

**Assinado:** Pesquisador — sessão "Pesquisa de organização de menus" (Claude Fable 5.1; agentes de busca em Opus). 08/09/2026.
