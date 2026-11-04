# O que os usuários pedem — 16/09/2026

Pesquisa 3. Encargo: `O QUE OS USUARIOS PEDEM - encargo 2026-09-15.md`.
Data no nome é a da máquina (regra 20): 16/09, não 15/09.

## Antes de ler: o que deu e o que não deu

| Fonte | Deu? | O que aconteceu |
|:---|:---:|:---|
| Fórum da BrashMonkey (Spriter) | **não** | O site está fora do ar: *"Account Suspended"*. O arquivo da internet (web.archive.org) também estava fora hoje. Um título só apareceu pela busca |
| Steam do Spriter Pro | sim | 262 tópicos lidos pela lista; os de pedido, lidos por dentro. 168 notícias do Spriter 2, de 2014 a 07/2026 |
| Fórum do Spine | sim | Lido pela API do próprio fórum. **Não há votos** no fórum: o número é *posts / pessoas* |
| Rastreador do Spine no GitHub (`EsotericSoftware/spine-editor`) | sim | **É aqui que há apoio contado**: 👍 por pedido. 1.089 itens |
| GitHub do DragonBones | sim | O editor é fechado e parou. Quase tudo é pedido de runtime |
| r/gamedev, r/Unity2D | **não** | O Reddit recusa leitura automática. Nada entrou de lá |

**Os números de apoio são pequenos.** O maior 👍 do Spine é 9. Isso não quer
dizer pouco interesse: o fórum não tem voto, e o rastreador é pouco conhecido.
Leia *posts/pessoas* como "quanto se falou", e 👍 como "quantos apertaram".

Legenda da coluna **Recorte**: igual · diferente · em parte · falta · não confirmei.
Conferido no código em 16/09 (`editor/src`), sem escrever nada nele.

---

## 1. Spine — fórum (esotericsoftware.com/forum)

Link: `https://esotericsoftware.com/forum/d/<número>`.

| # | O que pediram (curto) | Quando | Apoio (posts/pessoas) | Spine atendeu? | Recorte |
|:---:|:---|:---:|:---:|:---:|:---:|
| [6973](https://esotericsoftware.com/forum/d/6973) | Editor de curvas "como o do Maya", todas as chaves no gráfico | 2016 | 65 / 33 | sim, 4.0 (2021) | igual |
| [1655](https://esotericsoftware.com/forum/d/1655) | Animação dentro de animação ("asas" dentro de "voar") | 2013 | 29 / 16 | **não** — equipe: "muito trabalho" | em parte |
| [2082](https://esotericsoftware.com/forum/d/2082) | Máscara (recorte) | 2014 | 27 / 20 | sim, 3.6 | igual |
| [25654](https://esotericsoftware.com/forum/d/25654) | Tocar uma animação pela posição/giro de um osso | 2024 | 23 / 8 | em parte — sliders, 4.3 | diferente (Parâmetro + regra) |
| [1514](https://esotericsoftware.com/forum/d/1514) | Ver valores de todos na folha de chaves, sem escolher um por um | 2013 | 21 / 6 | em parte | não confirmei |
| [28645](https://esotericsoftware.com/forum/d/28645) | Ligar/desligar restrição por chave | 2025 | 21 / 4 | não — equipe mostrou atalhos | não confirmei |
| [7959](https://esotericsoftware.com/forum/d/7959) | Malha ligada em outro slot | 2017 | 20 / 6 | fechado no GitHub ([#195](https://github.com/EsotericSoftware/spine-editor/issues/195)) | igual (malha ligada) |
| [1468](https://esotericsoftware.com/forum/d/1468) | Cadeado na Árvore: não pegar clique por engano | 2013 | 18 / 6 | não confirmei | igual |
| [9211](https://esotericsoftware.com/forum/d/9211) | Pastas/grupos na linha do tempo | 2017 | 18 / 7 | não | falta (pasta só na Ordem) |
| [1797](https://esotericsoftware.com/forum/d/1797) | Ver e editar o **trajeto** do movimento | 2013 | 17 / 9 | **não** ([#177](https://github.com/EsotericSoftware/spine-editor/issues/177) aberto) | falta |
| [2825](https://esotericsoftware.com/forum/d/2825) | Curva que atravessa várias chaves | 2014 | 17 / 10 | sim, 4.0 | igual |
| [1771](https://esotericsoftware.com/forum/d/1771) | "Deixem o Spine mais amigável": lembrar janela, renomear fácil | 2013 | 16 / 8 | em parte | não confirmei |
| [30115](https://esotericsoftware.com/forum/d/30115) | Várias figuras conversando numa cena (cutscene) | 2026 | 16 / 3 | não — "anime tudo junto" | não confirmei |
| [30603](https://esotericsoftware.com/forum/d/30603) | Inverter a face da malha (2.5D) | 2026 | 16 / 4 | prometido | não confirmei |
| [1538](https://esotericsoftware.com/forum/d/1538) | Dado livre (texto) em osso e imagem, para o programador | 2013 | 14 / 6 | não confirmei | em parte (`extras` no formato, sem tela) |
| [2283](https://esotericsoftware.com/forum/d/2283) | Botão "tirar chaves que não mudam nada" | 2014 | 13 / 5 | sim (Clean Up) | igual |
| [11440](https://esotericsoftware.com/forum/d/11440) | Deslocar chaves sem perder o original (movimento secundário) | 2019 | 13 / 6 | em parte (4.0) | em parte (Empurrar as chaves) |
| [9508](https://esotericsoftware.com/forum/d/9508) | Mostrar setas de velocidade no osso | 2017 | 13 / 5 | não confirmei | falta |
| [29501](https://esotericsoftware.com/forum/d/29501) | Trocar dois nomes que colidem | 2025 | 13 / 5 | "vamos estudar" | não confirmei |
| [1806](https://esotericsoftware.com/forum/d/1806) | Desenho de rascunho por cima, que anda com o tempo | 2013 | 12 / 5 | não confirmei | em parte (imagem de referência parada) |
| [10063](https://esotericsoftware.com/forum/d/10063) | Modo pixel art: não borrar meio pixel | 2018 | 12 / 4 | sim, 3.7 | falta |
| [1197](https://esotericsoftware.com/forum/d/1197) | Ímã na grade de pixel | 2013 | 11 / 6 | não confirmei | falta |
| [4351](https://esotericsoftware.com/forum/d/4351) | Uma ferramenta só: mover, girar e escalar | 2015 | 11 / 5 | não confirmei | **igual** (Transformar) |
| [30263](https://esotericsoftware.com/forum/d/30263) | Fantasma mostrar os **ossos** | 2026 | 11 / 4 | prometido para 4.3 | **igual** |
| [9814](https://esotericsoftware.com/forum/d/9814) | Isolar a malha ao editar | 2018 | 10 / 5 | não confirmei | não confirmei |
| [12568](https://esotericsoftware.com/forum/d/12568) | Salvar em versão antiga | 2019 | 10 / 3 | não — "não dá" | não confirmei |
| [1508](https://esotericsoftware.com/forum/d/1508) | Copiar e colar a pose de um osso no outro | 2013 | 9 / 4 | sim, 1.6 | igual |
| [1792](https://esotericsoftware.com/forum/d/1792) | Tecla para descer pai → filho → neto | 2013 | 9 / 4 | sim | em parte (`[` e `]`, sem irmão) |
| [3267](https://esotericsoftware.com/forum/d/3267) | **Trocar de pai no meio da animação** | 2014 | 9 / 5 | **não — "provavelmente nunca"** | **igual** |
| [3818](https://esotericsoftware.com/forum/d/3818) | Desenhar quadro a quadro dentro do programa | 2014 | 9 / 4 | não — "use o Photoshop" | falta |
| [9060](https://esotericsoftware.com/forum/d/9060) | Conta no campo de número (`45*2`) | 2017 | 9 / 5 | não confirmei | igual |
| [26207](https://esotericsoftware.com/forum/d/26207) | Escolher todos os ossos da mesma cor | 2024 | 9 / 5 | sim, 4.2.23 | falta |
| [13466](https://esotericsoftware.com/forum/d/13466) | Marcadores na linha do tempo | 2020 | 9 / 6 | **não** ([#531](https://github.com/EsotericSoftware/spine-editor/issues/531) aberto) | igual |
| [16807](https://esotericsoftware.com/forum/d/16807) + [13775](https://esotericsoftware.com/forum/d/13775) | **Emissor de partículas** | 2020–2021 | 8 / 5 + 2 / 2 | **não** — "precisa em todo runtime" | falta (há plano) |
| [286](https://esotericsoftware.com/forum/d/286) | Espelhar uma animação inteira | 2013 | 8 / 6 | não confirmei | igual |
| [16229](https://esotericsoftware.com/forum/d/16229) | Curvas 4.0: copiar uma curva para vários ossos; zoom | 2021 | 26 / 10 | em parte (dicas) | não confirmei · zoom falta |
| [13441](https://esotericsoftware.com/forum/d/13441) | Pressão da caneta no pincel de peso | 2020 | 6 / 3 | não — "not at the moment" | falta |
| [28041](https://esotericsoftware.com/forum/d/28041) | Animar imagem solta, sem osso; trajeto em Bézier | 2025 | 3 / 3 | não | falta (trajeto) |

As três últimas vieram da Pesquisa 4. Partículas veio da Pesquisa 2.

**Opinião (fórum, não número):** a equipe do Spine recusa quase tudo que
precisaria entrar em todos os runtimes — partículas, trocar de pai, máscara
por anos. Esse é o motivo mais repetido nas respostas deles.

---

## 2. Spine — rastreador no GitHub (apoio contado)

Link: `https://github.com/EsotericSoftware/spine-editor/issues/<número>`.
Ordenado por 👍. "Fechado" no GitHub **não prova** que saiu: marquei assim.

| # | O que pediram | Quando | 👍 / comentários | Estado | Recorte |
|:---:|:---|:---:|:---:|:---:|:---:|
| [17](https://github.com/EsotericSoftware/spine-editor/issues/17) | Várias peles ligadas ao mesmo tempo | 2016 | 9 / 9 | fechado | igual |
| [77](https://github.com/EsotericSoftware/spine-editor/issues/77) | **Digitar número no vértice** | 2016 | 7 / 2 | **aberto** | falta |
| [515](https://github.com/EsotericSoftware/spine-editor/issues/515) | Caminho de exportar relativo ao projeto | 2019 | 7 / 7 | fechado | não confirmei |
| [9](https://github.com/EsotericSoftware/spine-editor/issues/9) | Animação quadro a quadro | 2016 | 6 / 4 | fechado (sequência, 4.1) | igual (troca de imagem por chave) |
| [266](https://github.com/EsotericSoftware/spine-editor/issues/266) | **Vários monitores** | 2017 | 5 / 13 | **aberto** | em parte (painel solto, na mesma janela) |
| [604](https://github.com/EsotericSoftware/spine-editor/issues/604) | **Esconder tudo menos o escolhido** | 2021 | 5 / 12 | **aberto** | igual (solo) |
| [531](https://github.com/EsotericSoftware/spine-editor/issues/531) | **Marcadores na linha do tempo** | 2020 | 5 / 5 | **aberto** | igual |
| [635](https://github.com/EsotericSoftware/spine-editor/issues/635) | Pastas na ordem de desenho | 2022 | 4 / 6 | fechado | igual |
| [582](https://github.com/EsotericSoftware/spine-editor/issues/582) | Levar o rig de um esqueleto para outro | 2020 | 3 / 3 | **aberto** | não confirmei |
| [153](https://github.com/EsotericSoftware/spine-editor/issues/153) | Deslocar chaves sem destruir (secundário) | 2017 | 3 / 7 | **aberto** | em parte |
| [736](https://github.com/EsotericSoftware/spine-editor/issues/736) | Solo de um slot | 2023 | 3 / 1 | **aberto** | igual |
| [64](https://github.com/EsotericSoftware/spine-editor/issues/64) | Prévia de várias camadas tocando | 2016 | 3 / 4 | fechado | igual (Prévia com camadas) |
| [145](https://github.com/EsotericSoftware/spine-editor/issues/145) | **Régua e guias** | 2016 | 2 / 14 | **aberto** | igual |
| [165](https://github.com/EsotericSoftware/spine-editor/issues/165) | Copiar chave de imagem para outro slot | 2017 | 2 / 1 | **aberto** | não confirmei |
| [436](https://github.com/EsotericSoftware/spine-editor/issues/436) | Travar um esqueleto inteiro | 2019 | 2 / 4 | **aberto** | não confirmei |
| [475](https://github.com/EsotericSoftware/spine-editor/issues/475) | Alinhar e distribuir | 2019 | 2 / 1 | **aberto** | não confirmei |
| [554](https://github.com/EsotericSoftware/spine-editor/issues/554) | Ímã em número inteiro ou meio | 2020 | 2 / 6 | **aberto** | falta |
| [479](https://github.com/EsotericSoftware/spine-editor/issues/479) | Deslocar a textura dentro da malha | 2019 | 1 / 12 | **aberto** | não confirmei |
| [409](https://github.com/EsotericSoftware/spine-editor/issues/409) | Seleções guardadas | 2018 | 0 / 8 | **aberto** | falta |
| [371](https://github.com/EsotericSoftware/spine-editor/issues/371) | Prévia melhor (cena com vários) | 2018 | 0 / 8 | **aberto** (no roteiro deles) | não confirmei |
| [206](https://github.com/EsotericSoftware/spine-editor/issues/206) | Tela para trocar as teclas | 2017 | 0 / 4 | **aberto** | falta |
| [8](https://github.com/EsotericSoftware/spine-editor/issues/8) | Esqueleto dentro de esqueleto | 2016 | 0 / 7 | **aberto** (no roteiro deles) | em parte |
| [177](https://github.com/EsotericSoftware/spine-editor/issues/177) | Trajeto no fantasma | 2017 | 0 / 6 | **aberto** | falta |
| [35](https://github.com/EsotericSoftware/spine-editor/issues/35) | Primeira e última chave iguais no laço | 2016 | 0 / 4 | **aberto** | diferente (Fechar ciclo, uma vez) |
| [837](https://github.com/EsotericSoftware/spine-editor/issues/837) | Câmera | 2024 | 1 / 3 | **aberto** | não confirmei |

---

## 3. Spriter — Steam e notícias do Spriter 2

O fórum deles caiu. Sobrou o Steam: `steamcommunity.com/app/332360/discussions/0/<número>`.
"Mike" é da BrashMonkey.

| O que pediram | Quando | Apoio | Spriter atendeu? | Recorte |
|:---|:---:|:---:|:---:|:---:|
| **Deformação de malha** ([351660338690641338](https://steamcommunity.com/app/332360/discussions/0/351660338690641338/), [1617220671496114707](https://steamcommunity.com/app/332360/discussions/0/1617220671496114707/), [3288067088086478830](https://steamcommunity.com/app/332360/discussions/0/3288067088086478830/)) | 2016 → 2022 | 9 + 9 + 10 respostas | Pro: "não oficialmente". Spriter 2: só em **beta**, 2026 | igual |
| **Spriter 2 sair** ([1761356057405436936](https://steamcommunity.com/app/332360/discussions/0/1761356057405436936/), [1699415798772963737](https://steamcommunity.com/app/332360/discussions/0/1699415798772963737/)) | 2018 → 2026 | 33 + 14 respostas | ainda **beta** em 07/2026 | — |
| Interface escondida no botão direito: "volte ao Spriter 1" ([2966141980970705656](https://steamcommunity.com/app/332360/discussions/0/2966141980970705656/), [3727323242813718485](https://steamcommunity.com/app/332360/discussions/0/3727323242813718485/)) | 2020, 2022 | 8 + 9 respostas | sim, 12/2024: "todas as ferramentas à vista, como pediram" | igual (botão com nome na dica) |
| Alças fáceis de pegar; tamanho ajustável ([3034852313316374428](https://steamcommunity.com/app/332360/discussions/0/3034852313316374428/)) | 2021 | 3 respostas | prometido para o Spriter 2 | falta (tamanho fixo, 14 px) |
| Suporte oficial ao **Godot** ([1326718197207320538](https://steamcommunity.com/app/332360/discussions/0/1326718197207320538/)) | 2017 → 2024 | 7 respostas | não — só plugin da comunidade | falta |
| Exportar WebM ([3466100515574212227](https://steamcommunity.com/app/332360/discussions/0/3466100515574212227/)) | 2022 | 6 respostas | não; Spriter 2 fez MP4 e GIF em 2026 | igual (WebM, GIF) |
| Grupo de camadas fora dos ossos · trocar tecla de chave anterior/próxima ([1519260397776024274](https://steamcommunity.com/app/332360/discussions/0/1519260397776024274/)) | 2017 | 5 respostas | não confirmei | falta · falta |
| Juntar/apagar chaves vazias ([3193614254343964502](https://steamcommunity.com/app/332360/discussions/0/3193614254343964502/)) | 2022 | 3 respostas | não — "apague à mão" | igual (Limpar chaves repetidas) |
| Zoom melhor na linha do tempo ([fórum 22505](https://brashmonkey.com/forum/index.php?/topic/22505-feature-request-better-zoom-in-timeline/), só pela busca) | 2020 | não deu para ver | em parte (roteiro 2021) | **falta** |
| Onion skin ([619573787409046273](https://steamcommunity.com/app/332360/discussions/0/619573787409046273/)) | — | — | já tinha, escondido no botão direito | igual |

**O que o Spriter 2 entregou no beta de 2026** (fonte: notícias do Steam,
[26/04](https://store.steampowered.com/news/app/332360/view/1830797770240394) e
[26/07](https://store.steampowered.com/news/app/332360/view/1839041357034323)):
som com arrasto, onion skin clicável, curvas Bézier, **vídeo de referência
atrás do boneco com o tempo junto**, MP4 e GIF, copiar e colar (voltou só em
2025), escolher peça escondida com Ctrl + roda, arrastar o galho inteiro,
visibilidade como chave. Muito disso o Spriter Pro prometeu em 2019.

**Opinião (Steam):** a queixa que mais volta não é de ferramenta, é de
**espera**. "Cansei de esperar e comprei o Moho", 01/2023
([notícia 0.7.1](https://steamcommunity.com/app/332360/eventcomments/3727323242810479005/)).

---

## 4. DragonBones — GitHub

O editor é fechado e parado. Os pedidos são quase todos de runtime.

| O que pediram | Quando | Apoio | Atendeu? | Recorte |
|:---|:---:|:---:|:---:|:---:|
| [Versão para Linux](https://github.com/DragonBones/DesignPanel/issues/31) | 2016 | **45 👍** / 23 | fechado; não confirmei se saiu | em parte (roda no navegador; não testado em Linux) |
| ["Vocês pararam?"](https://github.com/DragonBones/dragonbones.github.io/issues/26) | 2020 | 3 👍 / 18 | sem resposta | — |
| [Phaser 3 e pacote npm](https://github.com/DragonBones/DragonBonesJS/issues/66) | 2018 | 0 / 30 | não | fora (é do jogo) |
| [Unreal Engine](https://github.com/DragonBones/DragonBonesCPP/issues/157) | 2017 | 7 👍 / 4 | não | falta |
| [Linha de comando](https://github.com/DragonBones/DesignPanel/issues/21) | 2014 | 3 👍 / 3 | não | igual (`ferramentas/`) |
| [Exportar para Live2D](https://github.com/DragonBones/Tools/issues/17) | 2020 | 3 👍 / 1 | não | falta |

---

## 5. Vindos da Pesquisa 1 — fora dos três programas

Mandados pela Pesquisa 1. Entram aqui porque são pedido de usuário. Todos
**opinião de fórum**; apoio com link.

| O que pediram | Onde | Quando | Apoio | Atendeu? | Recorte |
|:---|:---|:---:|:---:|:---:|:---:|
| Grade isométrica | [Aseprite](https://community.aseprite.org/t/is-there-a-way-to-set-up-a-isometric-grid/11510) | 2021 | 4 posts, 28 mil visitas | não — só script da comunidade | falta |
| Grade isométrica ou hexagonal | [LDtk #944](https://github.com/deepnight/ldtk/issues/944), repete o [#102](https://github.com/deepnight/ldtk/issues/102) de 2020 | 2023 | 5 reações | **não** — autor marcou "não vamos fazer" | falta |
| Misturar dois sliders (girar para os lados **e** para cima) | [Spine, beta 4.3, post 66](https://esotericsoftware.com/forum/d/28396-the-spine-43-beta-has-begun/66) | 2025 | 1 pessoa | não confirmei | não confirmei |
| Exportar animação "em camadas" para vídeo | [Spine, beta 4.3, post 63](https://esotericsoftware.com/forum/d/28396-the-spine-43-beta-has-begun/63) | 2025 | 1 pessoa | sim — sliders, 4.3 | não confirmei |

O tópico do beta 4.3 tem 132 posts e 35 pessoas; li do 59 ao 66.

---

## OURO — antigo, apoiado, nunca atendido

Ordenado por apoio. Só entra o que **o programa de origem ainda não entregou**
em 16/09/2026. O "apoio" é o número mais forte que o pedido tem, com link.

| # | Pedido | Desde | Apoio | Quem não entregou | Recorte hoje |
|:---:|:---|:---:|:---|:---|:---:|
| 1 | Versão para Linux | 2016 | [45 👍](https://github.com/DragonBones/DesignPanel/issues/31) | DragonBones | em parte |
| 2 | Animação dentro de animação | 2013 | [29 posts / 16 pessoas](https://esotericsoftware.com/forum/d/1655) + [#8](https://github.com/EsotericSoftware/spine-editor/issues/8) | Spine | em parte |
| 3 | Trajeto do movimento, visível e editável | 2013 | [17 / 9](https://esotericsoftware.com/forum/d/1797) + [#177](https://github.com/EsotericSoftware/spine-editor/issues/177) | Spine | **falta** |
| 4 | Deformação de malha (no Spriter) | 2016 | [3 tópicos, 28 respostas](https://steamcommunity.com/app/332360/discussions/0/351660338690641338/) | Spriter (só beta) | igual |
| 5 | Vários monitores | 2017 | [5 👍 / 13](https://github.com/EsotericSoftware/spine-editor/issues/266) | Spine | em parte |
| 6 | Esconder tudo menos o escolhido | 2021 | [5 👍 / 12](https://github.com/EsotericSoftware/spine-editor/issues/604) | Spine | **igual** |
| 7 | Marcadores na linha do tempo | 2020 | [5 👍](https://github.com/EsotericSoftware/spine-editor/issues/531) + [9 / 6](https://esotericsoftware.com/forum/d/13466) | Spine | **igual** |
| 8 | Emissor de partículas | 2018 | [8 / 5](https://esotericsoftware.com/forum/d/16807) + [2 / 2](https://esotericsoftware.com/forum/d/13775) | Spine | falta (há plano) |
| 9 | Digitar número no vértice | 2016 | [7 👍](https://github.com/EsotericSoftware/spine-editor/issues/77) | Spine | **falta** |
| 10 | Trocar de pai no meio da animação | 2014 | [9 / 5](https://esotericsoftware.com/forum/d/3267), "provavelmente nunca" | Spine | **igual** |
| 11 | Suporte oficial ao Godot | 2017 | [7 respostas, 7 anos](https://steamcommunity.com/app/332360/discussions/0/1326718197207320538/) | Spriter | falta |
| 12 | Régua e guias | 2016 | [2 👍 / 14](https://github.com/EsotericSoftware/spine-editor/issues/145) | Spine | **igual** |
| 13 | Deslocar chaves sem destruir | 2017 | [3 👍 / 7](https://github.com/EsotericSoftware/spine-editor/issues/153) + [13 / 6](https://esotericsoftware.com/forum/d/11440) | Spine | em parte |
| 14 | Pastas na linha do tempo | 2017 | [18 / 7](https://esotericsoftware.com/forum/d/9211) | Spine | **falta** |
| 15 | Seleções guardadas | 2018 | [8 comentários](https://github.com/EsotericSoftware/spine-editor/issues/409) | Spine | **falta** |
| 16 | Trocar as teclas numa tela | 2017 | [#206](https://github.com/EsotericSoftware/spine-editor/issues/206) + [Steam 2017](https://steamcommunity.com/app/332360/discussions/0/1519260397776024274/) | Spine e Spriter | **falta** |
| 17 | Zoom fino na linha do tempo | 2020 | [fórum Spriter](https://brashmonkey.com/forum/index.php?/topic/22505-feature-request-better-zoom-in-timeline/) + [Spine 16229](https://esotericsoftware.com/forum/d/16229) | Spriter | **falta** |
| 18 | Alças fáceis de pegar, tamanho ajustável | 2021 | [3 respostas](https://steamcommunity.com/app/332360/discussions/0/3034852313316374428/) | Spriter | **falta** |
| 19 | Pressão da caneta no pincel de peso | 2020 | [6 / 3](https://esotericsoftware.com/forum/d/13441) | Spine | **falta** |

### O que a tabela diz, em três linhas

| | |
|:---|:---|
| **Já temos, e o Spine não** | trocar de pai (10), marcadores (7), solo (6), régua e guias (12). Quatro "nunca atendidos" que o Recorte já faz |
| **Falta, e é barato de olhar** | número no vértice (9), zoom na linha do tempo (17), tamanho da alça (18), seleções guardadas (15) |
| **Falta, e é grande** | trajeto (3), animação dentro de animação (2), partículas (8), trocar teclas (16) |

**Não é recomendação.** A escolha é do Humberto, com o Diretor. Partículas
já tem plano próprio e é da Pesquisa 2. Godot e runtimes são do jogo
(memória *"o editor prepara, o jogo decide"*) — perguntar caso a caso.

## O que ficou para trás

| | |
|:---|:---|
| Fórum da BrashMonkey | fora do ar. Quando voltar, é o filão mais rico: dez anos de pedidos do Spriter |
| Reddit | recusou a leitura. Precisa de um humano com navegador |
| Conferência no Recorte | 12 itens ficaram "não confirmei". Não chutei |
| Rastreador do Spine | li os 100 mais apoiados e os 40 mais comentados, de 1.089 |
