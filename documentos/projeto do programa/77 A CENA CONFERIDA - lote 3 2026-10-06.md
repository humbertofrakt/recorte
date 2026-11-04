# A cena conferida — lote 3, a caixa do osso dá controle (v34.2) — 06/10/2026

Rodada 46, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.2** (o "Sobre" diz v34.2; servi o zip `recorte v34.2 2026-10-06.zip`, extraído fora da pasta; o zip apareceu às 23h43) |
| Como | porta própria (5360) · Chrome sem janela · mouse, teclado e `Alt` por protocolo · 1920×1080 e 1280×720 |
| Hora | 23h44 a 23h49, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-46-conferida/lote3/` (13) |
| Material | o herói de exemplo, na base; ossos `torso` (girado 90°), `hips` (0°). **Cada gesto foi desfeito** com `Ctrl+Z` depois de lido. **Nada foi salvo.** Nenhuma caixa nativa foi chamada. **O cursor eu li no estilo da tela** (o Chrome sem janela não o desenha nas fotos) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 4, 5) | **1** (3) | **1** (6) | 6 |

| Linha | Por que não está inteira |
|:---:|:---|
| 3 | **Inclinar ao longo do lado** inclina e **para fora dá 0°** com a frase certa **vi funcionar**; **a frase do `Alt` parado** nos lados esquerdo e direito **continua falando de "topo e base"** |
| 6 | **A dica do *Inclinar* não diz que se arrasta** (segue ***"Inclinar (Z). O topo anda, a base fica"***) e **o rodapé do *Criar osso* não cabe nem em 1920 nem em 1280** (160 letras: 1.154 px de texto numa faixa de 1.008 e de 630) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A frase do `Alt` sobre o meio do lado é a mesma nos quatro lados**: ***"Alt: este quadradinho inclina. Puxe ao longo do lado: o topo anda, a base fica."*** Conferi em **seis** quadradinhos, com o rodapé **limpo antes** (para não ler a frase velha): em cima, esquerda e direita do `torso`; em cima, embaixo e no meio da direita do `hips` (ossos com 90° e 0°). **Nenhum** trouxe frase diferente. O pedido era *"nos lados esquerdo/direito a frase fala do lado, não de topo e base"* | 3 | `E0_hover_lado_direito` |
| 2 | **A dica do *Inclinar* não mudou**: ***"Inclinar (Z). O topo anda, a base fica"***. Não diz que se **arrasta**. (O rodapé, ao pegar a ferramenta, diz: *"Inclinar: escolha um osso e arraste…"*) | 6 | — |
| 3 | **O rodapé do *Criar osso* é cortado.** O texto (***"Arraste para criar. Com desenhos escolhidos, o osso novo pega os desenhos, sem movê-los. Ctrl: cria sem pegar. Alt sobre um osso: redesenha sem mover os filhos."***, 160 letras) tem **1.154 px** e a faixa da ferramenta **1.008 px em 1920** e **630 px em 1280**: na tela termina em ***"…sem movê…"*** (1280). O fim, **onde estão o `Ctrl` e o `Alt`**, **não se lê** | 6 | `H_criar_osso_1280` · `H_criar_osso_1920` |
| 4 | *Pequeno.* **Em 1280 o rodapé da esquerda também corta**: ***"Girar 66,8° (agora 66,8° l…"***; o **"local"** que o lote pedia some (em 1920 **não conferi** o corte) | 5 | `H_barra_1280` |
| 5 | *Pequeno.* **O aviso *"perto do pivô a escala anda devagar, ou o eixo fica parado: comece mais longe"* aparece também quando o eixo que se mexe não tem problema** (arrastei o quadradinho do lado do `torso` e *Escalar Y × 1,63* saiu **com** a frase). Quem lê acha que o gesto falhou | 1 | `B0_escala_pelo_quadradinho` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | A caixa do osso tem meia largura 16 px: os quadradinhos do meio ficam a 32 px do eixo; 20 px de arrasto no meio do lado dá ~× 1,6 (não × 3) | **vi funcionar** | `torso` escolhido, *Transformar*, **quadradinho do lado direito**, arrasto de **10 px** e de **20 px**: ***"Escalar Y × 1,31"*** e ***"Escalar Y × 1,63"***: **× 1,63 para 20 px** (a conta de `(32 + 20) ÷ 32`). O de cima, a **71 px** do pivô, 10 px deu ***"× 1,14"*** e 20 px ***"× 1,28"*** (a conta de `(71 + 20) ÷ 71`). A ficha terminou em *Escala Y 1,63*. *(Medi as **razões**, não os 32 px da tela: vi os quadradinhos a 16 px do eixo na horizontal, e a razão **1,63** é a de 32 px.)* | `B0_escala_pelo_quadradinho` · `A0_gizmo_torso` |
| 2 | Escala livre com um eixo rente à linha do pivô: fica PARADA e o rodapé diz por quê (nada de *"× −79"*) | **vi funcionar** | `hips`, *Escalar* (`R`), botão apertado **na linha do pivô** (a mesma altura), subindo 40 e 60 px: o rodapé ficou em ***"Escalar X × 1 · Y × 1 · perto do pivô a escala anda devagar, ou o eixo fica parado: comece mais longe."***; **sem "× −79" nem "× −119"**; a **ficha ficou em Escala Y 1**. Defeito 5 | `C0_escalar_em_cima_da_linha` |
| 3 | `Alt` no meio do lado inclina nos eixos da CAIXA: puxar ao longo do lado inclina; puxar para fora dá 0° e o rodapé diz *"puxe ao longo do lado"*. Nos lados esquerdo/direito a frase fala do lado, não de *"topo e base"* | **pela metade** | **Ao longo:** quadradinho de cima do `torso`, `Alt`, arrasto de 15 e 30 px **ao longo do lado**: ***"Inclinar Y −12° (agora −12°)"*** e ***"Inclinar Y −23,1° (agora −23,1°)"***; o do lado esquerdo, arrasto vertical de 16 e 31 px: ***"Inclinar X 43,3°"*** e ***"X 61,3°"***. **Para fora:** em cima, arrasto vertical: ***"Inclinar Y 0°: puxe ao longo do lado, não para fora."***; no lado esquerdo, arrasto horizontal: ***"Inclinar X 0°: puxe ao longo do lado, não para fora."*** **Nos eixos da caixa** (o `torso` tem 90°: o de cima inclina Y e o do lado inclina X; no `hips`, de 0°, o de cima e o de baixo mostram `col-resize` e o do meio da direita, `row-resize`: o cursor segue os eixos da caixa). **A frase do `Alt` parado:** defeito 1 | `D0_inclinar_ao_longo_do_lado` · `D1_puxar_para_fora` · `D2_lado_esquerdo_ao_longo` · `E0_hover_lado_direito` · `F0_gizmo_hips` |
| 4 | Clique rente à caixa do osso conta como dentro | **vi funcionar** | **Li o cursor** com o mouse a **0, 2, 4 e 6 px fora da borda** da caixa do `torso` (esquerda, direita): **`move`** (dentro); a **8 px: `crosshair`** (fora). Em cima, a mesma margem de **6 px** (`ns-resize`, o do quadradinho, e a **8 px: `crosshair`**). **Um clique** em (965, 385), **perto** da caixa do `hips` (não medi a distância), **manteve** o `hips` escolhido (não o desmarcou) | `A0_gizmo_torso` |
| 5 | Setas: *"Andar 10 px para a esquerda com o osso"* (com o sentido). Giro: *"(agora 67,9° local)"* | **vi funcionar** | `Shift+←`, `Shift+→`, `Shift+↑`, `Shift+↓`: ***"Andar 10 px para a esquerda / para a direita / para cima / para baixo com o osso."***; `←` e `↑` sem Shift: ***"Andar 1 px para a esquerda / para cima com o osso."*** A ficha foi de (0, 90) para **(−1, 91)**: −10+10−1 e +10−10+1 ✓. **Girar** em `hips`: ***"Girar 19,8° (agora 19,8° local)"*** e ***"Girar 66,8° (agora 66,8° local)"*** (mirei 67; saiu 66,8 pelo pixel); a ficha terminou em **66,85** | `G0_setas` · `G1_girar` |
| 6 | A dica do *Inclinar* diz que se arrasta; o rodapé do *Criar osso* cabe em 1280 | **não funciona** | **A dica:** ***"Inclinar (Z). O topo anda, a base fica"*** (**sem** *arraste*). **O rodapé do *Criar osso*:** 160 letras, **1.154 px** de texto; faixa de **1.008 px em 1920** e **630 px em 1280**: **cortado nos dois**. Defeitos 2 e 3 | `H_criar_osso_1920` · `H_criar_osso_1280` · `H_barra_1280` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **O rodapé diz para onde andou e quanto**, com o sentido, em todos os gestos desta rodada (mover, girar, escalar, inclinar, setas): a **mesma regra** vale agora para todos. É a melhor coisa do lote |
| C2 | A frase *"puxe ao longo do lado, não para fora"* **é a primeira que explica o porquê de um 0°** em todo o programa: o número zero deixa de parecer defeito |
| C3 | O `torso` e o `hips` mostram **o mesmo comportamento com 90° e com 0°**: o cursor e a inclinação seguem os eixos **do osso**, não os da tela |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O cursor | **li o `cursor` da tela** (`move`, `crosshair`, `ns-resize`, `row-resize`, `col-resize`) | a forma desenhada |
| A distância "32 px" | **não medi em px**; medi as **razões** do escalar | que a caixa tem 16 px de meia largura (vi os quadradinhos a **16 px** do eixo na horizontal e **71 px** em cima) |
| O clique rente | li o cursor em vários pontos e **um** clique perto da caixa | o arrasto que **começa** ali |
| *Inclinar* com a base de uma animação aberta | **não** testei | o inclinar numa animação |
| O rodapé em 1280 | **medi** o texto e a faixa | outras larguras (1440) |
| Só `torso` e `hips`, só a base | — | caixa de desenho, de vários itens |
| Telas | 1920×1080 e 1280×720 (só o rodapé) | 1440×900 |
