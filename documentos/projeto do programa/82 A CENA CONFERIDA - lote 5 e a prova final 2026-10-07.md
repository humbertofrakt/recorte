# A cena conferida — lote 5 e a prova final (v34.7) — 07/10/2026

Rodada 46, lote 5. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.7** (o "Sobre" diz v34.7; servi o zip `recorte v34.7 2026-10-07.zip`, extraído fora da pasta; o zip apareceu às 03h33) |
| Como | porta própria (5360) · Chrome sem janela · mouse, teclado, `Alt` e a tecla `P` segurada por protocolo · 1920×1080 (e 1280×720 nos itens 3 e 9) |
| Hora | 03h34 a 03h39, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-46-conferida/lote5/` (22) |
| Material | o herói de exemplo, na base. **Cada gesto de criar ou mexer foi desfeito** com `Ctrl+Z` depois de lido (os `Ctrl+Z` **não** entram na conta). **Nada foi salvo.** Nenhuma caixa nativa foi chamada. **O cursor eu li no estilo da tela** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **8** (1, 2, 3, 5, 6, 7, 8, 9) | 0 | 0 | 8 (+ a prova final, linha 4) |

## A PROVA FINAL — escolher um osso → mover → girar pela bolinha → escalar pelo quadradinho → inclinar com `Alt` no meio do lado → `B` com dois desenhos → `P` para pendurar → Ponto → Caixa, lendo o rodapé

Como usuário novo, **só pela tela**, herói aberto (o preparo, **não contado**). Lacuna = a maior parada do relógio dentro da página (temporizador de 50 ms) no passo.

| # | Passo | Gestos | O que o rodapé disse | Lacuna |
|:---:|:---|:---:|:---|:---:|
| 1 | **Escolher o osso** `torso` (clique na Árvore) | **1** | a ficha *"Osso: torso"* | — |
| 2 | **Mover** (arrastar dentro da caixa) | **1** | ***"Mover X −4 px · Y −3,6 px."*** → ***"Mover X −7,5 px · Y −9 px."*** | 282 ms |
| 3 | **Girar** pela bolinha | **1** | ***"Girar −14,8° (agora 75,2° local)"*** → ***"Girar −26,9° (agora 63,1° local)"*** | 118 ms |
| 4 | **Escalar** pelo quadradinho | **1** | ***"Escalar Y × 1,31"*** → ***"Escalar Y × 1,62"*** | 120 ms |
| 5 | **Inclinar** com `Alt` no meio do lado | **1** | ***"Inclinar Y −4,1° (agora −4,1°)"*** → ***"Inclinar Y −8,4° (agora −8,4°)"*** | 181 ms |
| 6 | **`B` com dois desenhos:** clicar `hair`, `Ctrl+clicar` `cape_lower` na Árvore (2), `B` (1), arrastar (1) | **4** | ***"Osso novo pegou 2 desenhos, sem mover. O osso "hair2" nasceu solto, na raiz."*** | — |
| 7 | **`P` para pendurar:** osso `head` escolhido, **segurar `P`** e **clicar** na capa | **2** | segurando: ***"Segure P: o que está pintado já é filho de head. Clique para prender ou soltar."*** (e o cursor vira `alias`); ao clicar: ***"cape_lower virou filho de head."***; ao soltar: ***"head ficou com 1 filho novo."*** | — |
| 8 | **Ponto:** escolher o desenho `hair` (1), `O` (1), `Alt`+arrastar (1) | **3** | ao pegar: ***"Ponto: segure Alt e arraste para criar…"***; ao criar: ***"Ponto hair_ponto entrou no slot hair: escolha-o no campo Anexo das Propriedades, ou grave uma chave, para usá-lo."*** | — |
| 9 | **Caixa:** `X` (1), `Alt`+arrastar (1) | **2** | ***"Caixa: segure Alt e arraste, de um canto ao outro."***; ao criar: ***"Caixa hair_caixa entrou no slot hair: escolha-o no campo Anexo…"*** | — |

### A conta

| O que | Quanto |
|:---|:---:|
| Gestos no total | **16** (1 + 1 + 1 + 1 + 1 + 4 + 2 + 3 + 2) |
| Antes (pelo pedido do Diretor) | **~29, com 9 tropeços** |
| Tropeços **do programa** | **nenhum** que custasse gesto (as ressalvas estão nos defeitos) |
| Tropeços meus | nenhum |
| O tempo de resposta | **a maior lacuna foi de 282 ms** (o 1º arrasto, o *Mover*, depois de a página ficar parada); os outros arrastos **118 a 181 ms**. **nada passou de 300 ms**, mas o **1º arrasto passou de 200 ms** |
| Caixas nativas | **0** |

## Os defeitos

Nenhum que pare o uso. Só notas:

| # | Nota | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **O aviso de que a regra segura o osso só vem ao soltar.** Girando `head` ou `arm` o rodapé diz, durante o arrasto, ***"Girar 26,3° (agora 26,3° local)"***, que **parece funcionar**; só ao soltar vem ***"head não girou: as regras head_lean, look_driver mandam nele…"***. Quem olha o osso na cena **vê o número subir e o osso parado** | 1 | `B1_girar_head` |
| 2 | *Pequeno.* **Osso + desenho pela Árvore não falam; pela cena, sim.** *Árvore:* clicar `arm` (osso) e `Ctrl+clicar` `hair` (desenho) ⇒ rodapé ***"Arquivo salvo."*** (a soma **acontece**, ***"desenho hair, osso arm"***, mas **sem frase**); o mesmo com dois desenhos pela Árvore (`hair`, `cape_lower`): também **calado**. *Cena:* clicar o osso `forearm` e `Ctrl+clicar` a capa ⇒ ***"2 escolhidos: forearm, cape_lower."*** | 8 | `K0b_rodape` · `J1_osso_mais_desenho_na_arvore` |
| 3 | *Pequeno.* **As Inclinações X e Y ficam fora da *Ficha rápida*.** Estão na seção *"Posição e forma"* da ficha, **abaixo da dobra** (a 1.196 e 1.229 px, com a ficha da altura da janela); é preciso **rolar** | 2 | `D0_ficha_do_osso` |
| 4 | *Em 1280×720* **o rodapé da ferramenta continua cortando** (o doc `80` listou 11 das 12); é da rodada 47 e **não conta** | — | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | O herói de exemplo abre pronto para posar: braço e cabeça não ficam presos por regra sem aviso; quando uma regra segura o osso, o rodapé diz e dá a porta para desligar (o olho da aba *Regras*, ou um clique dali) | **vi funcionar** | **Cabeça:** escolhi `head`, a ferramenta *Girar*, arrastei e soltei: rodapé ***"head não girou: as regras head_lean, look_driver mandam nele. Desligue o olho delas na aba Regras. Ficou na base: Ctrl+Z desfaz (a aba Regras veio para a frente: o olho fica na linha da regra)."*** **Braço:** ***"arm não girou: a regra ik_arm manda nele. Desligue o olho dela na aba Regras…"***. **A aba *Regras* veio para a frente sozinha** (a aba ativa do painel da direita passou a ser *Regras*, com *ik_arm*, *head_lean*, *cape_follow*, *hair_physics* e os parâmetros). A Árvore marca esses ossos com um ícone (***"Este osso tem regra. Veja na aba Regras"***). Defeito 1 (só ao soltar) | `B0_head_com_regra` · `B1_girar_head` · `C0_aba_regras` · `C1_depois_de_girar_arm` |
| 2 | A ficha do osso mostra Inclinação X e Y (°) com dica | **vi funcionar** | A ficha tem ***Inclinação X*** e ***Inclinação Y***, com **° ao lado** e as dicas ***"Inclinação X, em graus (°): entorta o osso e o que ele leva; 0° é reto"*** e a do Y. Defeito 3 (abaixo da dobra) | `D0_ficha_do_osso` |
| 3 | Em 1280×720 a caixa do zoom cabe sem cobrir a cena | **vi funcionar** | **176 × 42 px**, em (828, 486), **dentro** da cena (268–1012 × 88–535) e **no canto**: **não cobre o herói** nem a árvore (com o herói aberto em 1280 o zoom foi a **154 %** e ele coube inteiro) | `E0_1280_com_o_heroi` · `F0_1280_heroi_reaberto` |
| 4 | **PROVA FINAL**, só pela tela, como usuário novo (conte os gestos e os tropeços; eram ~29 com 9) | **feita** | Ver a prova: **16 gestos, nenhum tropeço** | `H0_mover` · `H1_girar` · `H2_escalar` · `H3_inclinar` · `I0_B_com_dois_desenhos` · `M0_pegar_filhos` · `L_Ponto` · `L_Caixa` |
| 5 | O herói de exemplo abre ajustado à tela (zoom ~278 %) | **vi funcionar** | O campo do zoom foi de **100 %** (página recém-aberta) para ***278 %*** ao abrir o herói; o personagem **cabe** na cena (cabeça à vista, pés no chão). Em 1280×720 abriu em **154 %** (ajustado a **essa** tela) | `A0_heroi_aberto` · `F0_1280_heroi_reaberto` |
| 6 | `B` com um osso escolhido à mão junto de dois desenhos: o osso nasce FILHO desse osso; o nome é previsível e dito | **vi funcionar** | Escolhi `hair`, `arm` (osso) e `cape_lower` pela Árvore, `B`, arrastei: ***"Osso novo pegou 2 desenhos, sem mover. O osso "hair2" nasceu filho de arm."*** A Árvore mostra `hair2` **recuado sob o `arm`**. **Sem osso à mão** (só os dois desenhos): ***"…O osso "hair2" nasceu solto, na raiz."*** **O nome é o do 1º desenho escolhido (`hair`) com o `2`** porque `hair` já existia como osso: **previsível e dito** (no doc `80` saía o do desenho mais ao fundo) | `I0_B_com_dois_desenhos` · `I1_B_com_osso_a_mao` |
| 7 | Ponto/Caixa com desenho escolhido e sem osso: o rodapé diz onde nasceu ou ensina a escolher o osso | **vi funcionar** | Com `hair` (um **desenho**) escolhido e nenhum osso: ***"Ponto hair_ponto entrou no slot hair: escolha-o no campo Anexo das Propriedades, ou grave uma chave, para usá-lo."*** e ***"Caixa hair_caixa entrou no slot hair: escolha-o no campo Anexo…"***: **diz onde nasceu** (no slot do desenho) e o que fazer a seguir | `L_Ponto` · `L_Caixa` |
| 8 | Osso + desenho somados: o rodapé fala | **vi funcionar** | **Pela cena:** o osso `forearm` e `Ctrl+clique` na capa: ***"2 escolhidos: forearm, cape_lower. Arquivo salvo."*** *(no doc `80` esta soma ficava calada)*. **Pela Árvore:** defeito 2 (calada) | `K0_osso_mais_desenho` · `K0b_rodape` |
| 9 | A caixa do zoom em 1280 cabe (176×42) | **vi funcionar** | Medi **176 × 42** em 1280×720 (a mesma medida da linha 3) | `E0_1280_com_o_heroi` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A prova caiu de ~29 gestos e 9 tropeços para 16 gestos e nenhum**: cada passo tem **uma** frase que diz o número e o que fazer a seguir (*"Escalar Y × 1,31"*, *"Ponto … entrou no slot …"*, *"Segure P: …"*) |
| C2 | O `P` segurado **ensina enquanto está apertado** (*"o que está pintado já é filho de head. Clique para prender ou soltar"*) e **diz o resultado** ao clicar e ao soltar (*"head ficou com 1 filho novo"*): a mão não precisa adivinhar |
| C3 | O nome do osso criado de dois desenhos agora é **o do primeiro que se clicou**: quem clica `hair` e depois `cape_lower` encontra `hair2`, o que **se prevê** |
| C4 | O herói abrir **ajustado à tela** (278 %) **muda de lugar** a bolinha e os quadradinhos da caixa do osso em relação ao zoom de 100 %: **as coordenadas de antes não valem**; para o usuário, a caixa fica **maior e mais fácil de pegar** na tela grande |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O cursor | **li o `cursor` da tela** (`alias` no `P`) | a forma desenhada |
| A tecla `P` segurada | evento de teclado mantido apertado | outro teclado |
| *Inclinar* e o `Alt` | evento de `Alt` + movimento, por protocolo | `Alt` preso pelo sistema |
| O osso à mão no `B` | **uma** vez (`arm`) | outros ossos; osso à mão **sem** ser pai possível |
| *Mover/Girar/Escalar/Inclinar* | **um** osso (`torso`) | desenhos soltos, caixas, vários itens |
| A prova | **eu**, que conheço o programa; contei os gestos que um usuário precisaria | onde alguém de fora hesitaria |
| A cena em **animação** aberta | **não** testei | os mesmos gestos com uma animação aberta (cria chave) |
| Telas | 1920×1080; 1280×720 só no zoom | 1440×900 |
