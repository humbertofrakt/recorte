# A Árvore, a Ordem e as Propriedades conferidas — lote 4, apagar pergunta e a Ordem fala (v33.2) — 06/10/2026

Rodada 43, lote 4. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.2**. **Atenção:** o `programa/` da pasta **já era a v33.3** quando comecei (22h11). Tirei a **v33.2 do zip** `recorte v33.2 2026-10-06.zip`, servi à parte, e o "Sobre" disse **v33.2** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 22h11 a 22h16, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-43-conferida/lote4/` (17) |
| Material | o herói de exemplo, aberto pelo próprio programa (*Arquivo → Abrir o herói (exemplo)*). Apaguei, dupliquei e renomeei para provar; **`Ctrl+Z` desfez cada passo**. **Nada foi salvo.** Instrumentei `alert`/`confirm`/`prompt`: nenhuma foi chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1 a 5) | 0 | 0 | 5 |

## Os defeitos

Nenhum que pare o uso. Só uma nota pequena:

| # | Nota | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno, dúvida.* **O foco do teclado fica na âncora depois do `Shift+clique`.** Li `document.activeElement` logo depois da faixa `torso`→`cape_path`: era a linha `torso`. **Mas a seta parte da linha clicada** (o que o pedido quer): `↓` foi para `head` (a que vem depois de `cape_path`) e `↑`, para `hitbox` (a de antes). Quem olha só o contorno de foco pode achar que as setas partem do `torso` | 5 | `G0_faixa` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | `Delete` num osso com filhos: pergunta e diz o que vai junto; `Esc` não apaga; ao confirmar, o rodapé diz *"Apaguei arm: …"* | **vi funcionar** | Escolhi o osso `arm`, `Delete`: janela ***"Apagar arm?"***: ***"Vão junto: 2 ossos, 6 desenhos e 1 regra. Ctrl+Z volta tudo."*** com a lista (osso `arm`, osso `forearm`, desenhos `arm`, `forearm`, `sword_blade`, `weapon`, `hand`, `hand_point`, regra `ik_arm`), o botão ***"Apagar 2 ossos, 6 desenhos e 1 regra"*** e ***"Deixar como está"***. **`Esc`:** a janela fechou e **`arm` continuou na Árvore** (rodapé sem mudança). **Confirmei:** rodapé ***"Apaguei arm: 2 ossos, 6 desenhos e 1 regra. Ctrl+Z volta. 36 chaves de 5 peças guardadas em 3 animações. Crie de novo com o mesmo nome e elas voltam."***; `arm` **sumiu** da Árvore. `Ctrl+Z`: ***"Desfeito: Apagar."*** e `arm` voltou. **Nenhuma caixa do navegador** | `B1_pergunta_apagar` · `B3_apagou` |
| 2 | Botão direito num osso da Árvore: *Novo osso filho*, *Duplicar*, *Apagar* | **vi funcionar** | Botão direito em `torso`: menu ***Novo osso filho · Duplicar · Substituir nomes… · Renomear · Apagar*** (os três pedidos **e mais dois**). ***Novo osso filho:*** ***"Osso "osso" criado, filho de "torso", na ponta dele. Arraste a ponta para esticar."*** ***Duplicar:*** ***"9 ossos e 17 desenhos duplicados, 20 px à direita. 4 regras ficaram de fora: ik_arm, head_lean, cape_follow, hair_physics."*** ***Apagar:*** a janela ***"Apagar torso? Vão junto: 9 ossos, 17 desenhos e 4 regras…"***. Desfiz os dois primeiros com `Ctrl+Z` (***"Desfeito: Novo osso."*** · ***"Desfeito: Duplicar."***) e cancelei o terceiro | `C0_menu_direito_osso` · `C3_apagar_pergunta` |
| 3 | Aba *Ordem*: abre rolada até a peça escolhida; o rodapé diz *"forearm: 8ª de 19, entre X e Y"*; `Ctrl+setas` pula a pasta inteira; *"frente"*/*"fundo"* na lista | **vi funcionar** | **Abre rolada:** escolhi o desenho `cape_upper` (o último da lista) na Árvore e fui à *Ordem*: a lista abriu **rolada até o fim** (rolagem 815 de 1245), com `cape_upper` **escolhida (linha azul)** à vista. **O rodapé:** com o desenho `forearm`, `Ctrl+↑` → ***"forearm: 3ª de 19, entre weapon e sword_blade."***; `Ctrl+↓` → ***"forearm: 5ª de 19, entre arm e foot_front."***; `Ctrl+↓` de novo → ***"forearm: 8ª de 19, entre leg_front e head."*** (**a frase do pedido, palavra por palavra**). **Pula a pasta:** `Ctrl+↑` pôs o `forearm` **acima da pasta `arma`** (a lista foi de `…weapon, [arma], sword_blade, forearm…` para `…weapon, forearm, [arma], sword_blade…`), **sem partir a pasta**; `Ctrl+↓` duas vezes o pôs **depois da pasta `perna` inteira** (`foot_front, shin_front, leg_front, forearm, head`). Cada passo desfeito com `Ctrl+Z` (a ordem voltou igual à de antes). ***Frente/Fundo:*** a lista tem o rótulo ***"FRENTE"*** no topo e ***"FUNDO"*** no fim, com as dicas ***"A frente: o de cima cobre os de baixo"*** e ***"O fundo: o de baixo fica atrás de todos"***; a barra tem *Trazer para a frente (Ctrl+↑)*, *Mandar para trás (Ctrl+↓)*, *Frente de tudo (Ctrl+→)*, *Fundo de tudo (Ctrl+←)* | `D0_ordem_abre` · `D1_ordem_cape_upper` · `E0_ctrl_cima` · `E2_ctrl_baixo_2x` |
| 4 | Busca: renomear a peça achada deixa o texto da busca como foi digitado e ela continua à vista com os outros achados | **vi funcionar** | Digitei `arm` na busca da Árvore: **10 linhas** (`hips, torso, arm, arm, forearm, forearm, arm_b, arm_back, forearm_b, forearm_back`). **F2** em `forearm_b` → `cotovelo_b`: rodapé ***"forearm_b agora se chama cotovelo_b."***; **o campo seguiu em `arm`** (era o defeito do lote 3: virava `cotovelo_b`); **a lista seguiu com as 10 linhas**, com `cotovelo_b` **no mesmo lugar**. Antes do conserto o texto virava o nome novo e os outros achados sumiam | `F0_busca_arm` · `F1_apos_renomear` |
| 5 | Depois de `Shift+clique`, as setas partem da linha clicada; a dica do campo preso por regra não fala de `Ctrl+Z` sem motivo; *"mundo −104°"* cabe | **vi funcionar** | **Setas:** `torso` + `Shift+clique` em `cape_path` → faixa ***[torso, mask, body, hitbox, cape_path]***; `↓` → **`head`** (a linha **depois** da clicada; antes ia para `mask`, logo abaixo da âncora); em outra rodada, `↑` → **`hitbox`** (a de antes). **Dica do campo preso:** no osso `head`, o *Ângulo* tem borda laranja de 2 px e a dica ***"head não girou: as regras head_lean, look_driver mandam nele. Desligue o olho delas na aba Regras. O número aqui é o guardado; a tela mostra o que a regra manda. Ângulo em graus (°)…"*** — **sem *"Ctrl+Z"***. **Digitando `30` no campo** o **rodapé** passou a dizer ***"…Ficou na base: Ctrl+Z desfaz."*** (agora **com motivo**: houve um passo); `Ctrl+Z` voltou o campo a `0`. **"mundo −104°":** no osso `cape2` o texto ***"mundo -104°"*** mede 70 px de largura (**sem transbordar**: `scrollWidth` = `clientWidth`) e termina a 242 px, **16 px antes da borda do painel (258)**; `cape1` (***"mundo -124°"***, mesma largura) e `hair` (***"mundo -105°"***) também cabem | `G0_faixa` · `G1_seta_baixo` · `H1_ficha_head` · `I0_digitou_preso` · `J1_mundo_104_tela` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O rodapé da Ordem **diz onde a peça ficou também ao passar uma pasta** (*"entre weapon e sword_blade"*, onde `sword_blade` **está dentro** da pasta `arma`): a conta é **na lista plana de 19 desenhos**, não na da tela, que tem pastas. Quem lê *"3ª de 19"* e conta as linhas da tela chega a outro número (a pasta ocupa uma linha) |
| C2 | A frase do rodapé de *Duplicar* **avisa o que ficou de fora** (*"4 regras ficaram de fora: ik_arm, head_lean, cape_follow, hair_physics"*): é a mais clara do menu |
| C3 | O sinal de menos nos graus é o **hífen** (*"-104°"*), não o sinal de menos (*"−104°"*) do pedido. Cabe do mesmo jeito; só aviso, para ninguém procurar o outro caractere |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A versão | **v33.2 tirada do zip**; o `programa/` já era a **v33.3** | a v33.3 |
| Teclas | `Delete`, `F2`, `Ctrl+↑/↓`, `↑/↓` mandadas por protocolo | outro teclado |
| O botão direito | clique direito de verdade por protocolo | o menu aberto pela tecla de menu |
| A escolha | lida pelo `aria-selected` de cada linha | a cor da linha (vi nas fotos que o azul bate) |
| *Frente de tudo* e *Fundo de tudo* (`Ctrl+→/←`) | **li as dicas**, **não** apertei | o salto até as pontas |
| *"abre rolada"* | **um caso** (`cape_upper`, a última); **não** vi com uma peça no meio da lista | a rolagem em outras posições, e com a lista ainda mais comprida |
| Só o herói de exemplo, só ossos e desenhos | — | pasta de ordem aninhada, slots, caixas |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
