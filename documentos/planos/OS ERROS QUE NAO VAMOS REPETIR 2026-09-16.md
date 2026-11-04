# Os erros que não vamos repetir — 16/09/2026

**Pesquisa 4 · endereço `Pesquisa 4: os erros que não vamos repetir`.** Encargo:
`OS ERROS QUE NAO VAMOS REPETIR - encargo 2026-09-15.md`.
Data da máquina: 16/09/2026 (regra 20). Código congelado: nada em `editor/src` foi escrito.

## Primeiro, o que mais importa

| # | Erro dos outros | O Recorte | Custa consertar agora |
|:---:|:---|:---|:---|
| 1 | **Alt para criar osso** brigou com o Linux no Spriter | decidido em 16/09: *"copia o Spriter"*, Alt | uma frase: escolher a tecla antes do lote |
| 2 | **Mexer na pose base muda todas as animações** (Spine) | é a nossa terceira regra da base, de propósito | uma seção: o aviso e o "ajustar" |
| 3 | **Perdi o trabalho** (Spriter, DragonBones) | o rascunho falha calado; "Cancelar" apaga | duas linhas de aviso |
| 4 | **Mesma semente em todas as partículas** (Unity) | a ideia das partículas fala de "uma semente fixa" | **saída proposta** pela Pesquisa 2 (16/09); falta a palavra do Humberto |
| 5 | **Botão direito com função escondida** (Spriter admitiu) | o botão direito na cena faz duas coisas, pelo pixel | uma porta no menu |

Os cinco estão **"a caminho"** — menos o rascunho que falha calado, que **já é nosso**.
É o que ainda sai barato.

## Os três vereditos

| Palavra | Quer dizer |
|:---|:---|
| **já cometemos** | o defeito está no programa hoje |
| **a caminho** | ainda não está, mas uma decisão ou um plano leva até ele |
| **não cometemos** | conferido no código ou na spec, com endereço |
| *não confirmei* | não deu para conferir. **Não vira verde** (regra 21) |

## Como se lê a fonte

| Marca | Quer dizer |
|:---|:---|
| **FATO** | a própria empresa confirmou, ou é uma página oficial |
| *opinião* | uma pessoa num fórum ou avaliação. Conta como sinal, não como prova |
| só título | vi o título da thread, não li o texto. Conta como sinal fraco |

**Limites desta busca, ditos antes:** Reddit não abriu para a busca; nenhuma fonte é
do Reddit. O fórum da BrashMonkey está **fora do ar** hoje ("conta suspensa").
O fórum do Construct recusou acesso. Onde a fonte é só o resumo da busca, está dito.

---

## 1. Perder o trabalho

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| Animação apagada ou partida ao meio; salva pelo autosave (Spriter) | 1 caso, *opinião*. [Steam](https://steamcommunity.com/app/332360/discussions/0/451848855008950848/) · 2015 | **a caminho.** Temos rascunho a cada 3 s (`doc/rascunho.ts`). Mas veja as duas linhas abaixo |
| DragonBones exige login para salvar; sem internet perde sem avisar | 1 issue, sem resposta. [GitHub Demos #6](https://github.com/DragonBones/Demos/issues/6) · 2018 | **não cometemos.** Roda na máquina, sem conta |
| — nosso: o rascunho **falha calado** | aba anônima ou cota cheia: `writeDraft` devolve `false` e `saveDraft` não avisa ninguém (`ui/shell-drop.ts:243-246`) | **já cometemos.** Regra 21: quem trabalha acha que tem rede, e não tem |
| — nosso: **"Cancelar" apaga o rascunho** | a janela de recuperar é um `confirm`; o botão errado joga fora a sessão (`main.ts:160-167`) | **a caminho.** Um clique distraído vira a queixa do Spriter |
| Mudou a pasta de imagens: tudo vira "Missing Image", sem troca em lote (Spriter) | 1 tópico, sem resposta. [Steam](https://steamcommunity.com/app/332360/discussions/0/351660338706124329/) · 2016 · FATO (a função não existe) | **em parte.** Avisa `imagem não encontrada` (`doc/document.ts:250`). Trocar a pasta em lote: *não confirmei* |

## 2. Travar, fechar sozinho, não abrir

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| Não abre: falta biblioteca do Visual C++ (Spriter) | tópico fixo, 11+ relatos, 2017 a 2025, sem conserto. [Steam](https://steamcommunity.com/app/332360/discussions/0/142260718949597797/) · FATO | **não cometemos.** Roda no navegador; não instala biblioteca |
| "Keeps crashing without reason" (Spriter) | 5 avaliações, 2021 a jan/2026. [Steam, negativas](https://steamcommunity.com/app/332360/negativereviews/?browsefilter=mostrecent) · *opinião* | *não confirmei.* Não há prova de sessão longa |
| Linux não abre ou fecha ao abrir (Spriter) | 3 avaliações e 1 tópico, 2018 a 2025. [Steam](https://steamcommunity.com/app/332360/discussions/0/805723028181886146/) · *opinião* | **não cometemos** no abrir. Ver Alt, seção 4 |
| Trava com imagem de 4000 px (Spriter) | 2 tópicos; o dev culpa o tamanho. [1](https://steamcommunity.com/app/332360/discussions/0/535151589888768536) [2](https://steamcommunity.com/app/332360/discussions/0/611703999963484956) · 2015 · FATO | *não confirmei.* Nenhuma prova com imagem grande |

## 3. Versão do arquivo contra versão do leitor

**O tema mais citado contra o Spine: 6 fontes.**

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| Runtime 4.1 não lê o exportado no 4.0: "quite a pain for large projects" | [GitHub #2106](https://github.com/EsotericSoftware/spine-runtimes/issues/2106) · [guia de versões](http://esotericsoftware.com/spine-versioning) · 2022 · FATO | **não cometemos.** Spec 2.4: minor nunca quebra; leitor não recusa por minor (`runtime/src/loader.ts`, `checkVersion`) |
| Exportar para versão velha perde todas as curvas | [guia de versões](http://en.esotericsoftware.com/spine-versioning) · FATO | **não cometemos.** `minVersion` diz o menor leitor sem perda |
| Projeto salvo na versão nova não abre na velha | [fórum 29712](https://esotericsoftware.com/forum/api/discussions/29712) · 2022, 2026 · FATO | **não cometemos.** Abre com aviso "leitura parcial" |
| Não dá para saber qual versão do runtime o projeto usa | [fórum 13838](https://esotericsoftware.com/forum/api/discussions/13838) · 2020 · FATO | **não cometemos.** `version`, `minVersion` e `generator` no cabeçalho |
| Aviso de versão sem dizer qual dos ~100 arquivos | [fórum 16522](https://esotericsoftware.com/forum/api/discussions/16522) · 2021 · *opinião* | *não confirmei* para lote de arquivos |

**Guardar isto:** é a única coisa em que **a spec já nasceu contra a queixa**.
Nenhum lote pode afrouxar a regra 2.4 sem decisão do Humberto (regra 7).

## 4. Interface e fluxo

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| **Alt para criar osso** briga com o Linux; pedem outra tecla (Spriter) | 1 tópico; **o dev confirma**. [Steam](https://steamcommunity.com/app/332360/discussions/0/142261027577275933/) · 2017 · FATO | **a caminho.** Decidido 16/09: Alt, como no Spriter (`QUADRO ABERTO`). E já usamos Alt em dois gestos: Alt + meio do lado inclina; Alt + clique na régua marca o laço (`panels/dopesheet.ts:1536`) |
| **Mexer na pose Setup muda todas as animações** (Spine) | 4 threads, 2017 a 2023. [fórum 18560](https://esotericsoftware.com/forum/api/discussions/18560) + 3 só título ([1](http://de.esotericsoftware.com/forum/Setup-Pose-Affects-All-Animations-9115) [2](https://esotericsoftware.com/forum/d/10691) [3](https://en.esotericsoftware.com/forum/d/24399)) · FATO de projeto; o remendo é o botão "Adjust" | **a caminho.** `AS REGRAS DA BASE`, linha 40: *"mexer no repouso muda todas as animações, menos onde há chave"*. E o modo Montar sai como lugar: a base fica mais perto da mão. Não temos o "Adjust" |
| **Auto Key grava chave** só de arrastar a agulha (Spine) | a equipe admitiu o bug. [fórum 7444](https://esotericsoftware.com/forum/api/discussions/7444) · 2016. Mais 5 threads de susto, 2016 a 2026 ([29780](https://esotericsoftware.com/forum/api/discussions/29780) e 4 só título) | **em parte.** Gravar sozinho nasce **ligado** (`anim/pose-mode.ts:46`), e trocar de pai grava chave sem perguntar. A barra diz *"Gravação automática ligada"* (`ui/shell.ts:2226`). O bug da agulha: *não confirmei* |
| Osso cinza, não seleciona; a trava estava ligada sem saber (Spine) | 3 fontes, 2018 a 2020. [fórum 15155](https://esotericsoftware.com/forum/api/discussions/15155) + 2 só título · FATO | **em parte.** A seleção em caixa avisa *"Travado e escondido ficaram de fora"* (`viewport/viewport.ts:476`). Clique simples num travado: *não confirmei* |
| Desfazer com bug; imagens somem ao desfazer (Spine 3.8.59; Spriter "randomly don't work") | Spine: 4 só título, 2014 a 2020, consertado. Spriter: 1 avaliação, jan/2026, *opinião* | **não cometemos**, pelo desenho: todo Command tem `apply` e `revert` exatos (regra 6). Sem prova de sessão longa |
| "Wrist destruction simulator", muito clique (Spriter) | 1 avaliação, 653 h de uso · jan/2026 · *opinião* | *não confirmei.* O Roteiro dos 30 minutos mede passos, não cliques |
| Editor de gráfico novo perdeu copiar curva e aplicar em vários ossos (Spine 4.0) | [fórum 16229](https://esotericsoftware.com/forum/api/discussions/16229) + 2 só título · 2021 a 2025 · *opinião*; a equipe: o velho não volta | *não confirmei.* **Lição:** trocar ferramenta que funciona tira gesto de quem já sabia |

## 5. Função escondida — a pergunta do encargo

**Resposta: é doença do ramo.** Os dois programas sofreram, e um admitiu.

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| **Quase tudo ficava escondido no botão direito** — palavra do dev do Spriter | tuíte da BrashMonkey, dez/2024. Só trecho da busca; a página deu erro. [x.com](https://x.com/Spriter2D/status/1863712354376020401) · FATO pela palavra, fonte fraca | **a caminho.** Na cena, o botão direito faz duas coisas **conforme o pixel**: em cima do desenho abre a grade; no transparente volta à ferramenta anterior (`viewport/viewport.ts:1132-1146`). Outra porta para a grade no menu: não achei |
| Malha no botão direito; ossos só por Alt-Shift-B (Spriter 2 alpha) | anúncios oficiais, 2020. [Steam](https://store.steampowered.com/news/posts/?feed=steam_community_announcements&appids=332360&enddate=1600379079) · FATO | ver a linha acima |
| A beta de jan/2026 promete "descoberta" melhor das funções (Spriter) | [Steam](https://store.steampowered.com/news/app/332360/view/497219150210400270) · só trecho · FATO | — |
| Não acha a lista de atalhos; ela mora num `hotkeys.txt` (Spine) | 4 fontes, 2013 a 2024. [fórum 9895](https://esotericsoftware.com/forum/api/discussions/9895) + 3 só título · FATO | **não cometemos.** Ajuda → *Atalhos do teclado* (Shift+F1), gerado da mesma lista das teclas (`ui/menus.ts:872`) |
| Ligou os nomes dos ossos e não sabia desligar: Ctrl+Shift+Alt+B (Spine) | [fórum 15477](https://esotericsoftware.com/forum/api/discussions/15477) · 2021 · FATO | *não confirmei* se toda tecla de exibição tem item no menu Exibir |
| Vídeos de tutorial ficaram privados (Spriter) | 2 tópicos, 2025 a 2026, sem resposta. [1](https://steamcommunity.com/app/332360/discussions/0/597402492208180679/) [2](https://steamcommunity.com/app/332360/discussions/0/804593328318344704/) | **não cometemos:** o manual mora na pasta. Mas o manual está pausado — ver a nossa linha |
| — nosso: **quatro comandos sem tecla e sem manual**; `rippleMove` semanas inalcançável | `QUADRO ABERTO`, 15/09 | **já cometemos**, na metade da palavra. **Conferido hoje:** as 91 ações registradas têm todas item de menu. A porta existe; a tecla e o manual, não |

Buscas literais por *"hidden feature"*, *"undocumented"* e *"no shortcut"* não acharam
thread própria do Spriter. A queixa aparece com outras palavras: *"can't find"*,
*"didn't know"*, *"right-click"*.

## 6. Runtimes que morrem

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| Spriter2UnityDX falha em ~80% das importações; repositório parado | [issue #10](https://github.com/Dharengo/Spriter2UnityDX/issues/10) (*opinião*) · [aviso no repositório](https://github.com/Dharengo/Spriter2UnityDX) (FATO) | **a caminho.** Não temos plugin de motor. Se ele vier da comunidade, repete o Spriter |
| Sem Godot oficial; "depende da comunidade" (Spriter) | [Steam](https://steamcommunity.com/app/332360/discussions/0/1326718197207320538/) · 2017 a 2024 · FATO | idem |
| Spine no Godot exige compilar o Godot | [fórum Godot 65393](https://forum.godotengine.org/t/state-of-skeleton2d-in-godot-bone-2d-rigging-cutout-animations/65393) · 2024 · *opinião* | idem |
| DragonBones no Unity e no Cocos: sem conserto; o mantenedor manda trocar pelo Spine | [Unity](https://discussions.unity.com/t/dead-dragonbones-usage-in-the-new-version-of-unity/280069) · [Cocos](https://forum.cocosengine.org/t/is-dragonbones-for-android-no-longer-being-maintained/58192) · 2023 a 2024 · FATO | idem |
| O runtime do Spriter não faz malha: motivo para ir ao Spine | [gamedev.net](https://gamedev.net/forums/topic/709997-looking-for-help-converting-spriter-to-spine/) · só trecho · *opinião* | **não cometemos.** Malha e pesos estão na spec e nos 53 casos de conformidade |

**A defesa que já temos:** dois runtimes (TypeScript e Python, o segundo só pelo texto)
e a conformidade. Um plugin de terceiro pode morrer; a prova fica.

## 7. A empresa que some

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| Site e fórum da BrashMonkey suspensos | [Steam](https://steamcommunity.com/app/332360/discussions/0/571549467877058588/) · 2024. Conferido hoje: [brashmonkey.com](https://brashmonkey.com/) "suspenso" · FATO | **não cometemos:** formato aberto, spec na pasta |
| Spriter 2: pré-venda 2018, beta só em 2026 ("4 years and counting") | [Steam](https://steamcommunity.com/app/332360/discussions/0/1761356057405436936/) + 2 avaliações + [comentários](https://steamcommunity.com/app/332360/eventcomments/3727323242810479005/) · FATO. **Contraprova:** betas em jan, fev, mar, abr e jul/2026 ([anúncios](https://steamcommunity.com/app/332360/announcements)) | — |
| DragonBones: dev sumiu, download não carrega | 7 fontes, 2020 a 2024. [GitHub #139](https://github.com/DragonBones/DragonBonesJS/issues/139) · [#85](https://github.com/DragonBones/DragonBonesCSharp/issues/85) · [AlternativeTo](https://alternativeto.net/software/dragonbones/about) e outras · FATO | **não cometemos:** quem tem o `.bone` e a spec não depende de nós |
| DragonBones virou **LoongBones**, com IA e planos pagos: resposta "mixed", incerteza sobre o futuro | 1 blog, abr/2026. [armanimation.com](https://www.armanimation.com/post/best-2d-skeletal-animation-software-in-2026-free-paid-options-compared) · *opinião*. O blog vende cursos e serviços, e não aponta nenhum defeito no Spine. Mandado pela Pesquisa 1 | **não cometemos:** trocar a licença não tira o arquivo de quem já tem a spec |
| "Spriter 2 development has reportedly stalled" | o mesmo blog · *opinião*, de ouvir dizer | — **Contradito** pelas betas de 2026, na linha acima |

## 8. Malha e pesos

| A reclamação | Quantas, onde | O Recorte |
|:---|:---|:---|
| Pesos à mão são tediosos — **a própria Esoteric diz** | [blog](http://en.esotericsoftware.com/blog/Mesh-weight-workflows) · FATO | *não confirmei.* Temos a pizza por vértice; não medi o tempo de pesar um braço |
| Pesos automáticos lentos e perdem volume nas dobras | [fórum 5050](https://esotericsoftware.com/forum/api/discussions/5050) · 2015 · *opinião*; a equipe admite o volume | *não confirmei* |
| A cor do pincel de peso tapa a imagem (Spine) | [fórum 13441](https://esotericsoftware.com/forum/api/discussions/13441) · 2020 · FATO | *não confirmei* |

## 9. Partículas — mandado pela Pesquisa 2

| A reclamação | Onde | O Recorte |
|:---|:---|:---|
| **Unity:** o Control Track força **a mesma semente** em todas as partículas filhas | [issuetracker.unity3d.com](https://issuetracker.unity3d.com/), "timelines-control-track-overrides-the-auto-random-seed" · FATO (issue registrada) | **a caminho, com saída proposta.** `COMO SE FAZ EFEITO 2026-09-16.md`, seção 4, "A semente: uma por emissor": cada emissor a sua · duplicar dá semente nova · "manter a semente" é gesto próprio. É **proposta**, não decisão: campo novo no formato é do Humberto (regra 7) |
| **Godot 4:** partícula não vai a um tempo exato (sem *seek*) | [proposta #4449](https://github.com/godotengine/godot-proposals/issues/4449) · FATO (proposta aberta) | **não cometemos**, pelo desenho: partícula como conta direta da idade |
| **Godot 4:** documentação de `seed` / `use_fixed_seed` errada | [godot#102291](https://github.com/godotengine/godot/issues/102291) · FATO (issue) | *ainda não existe.* Lição: a semente entra na spec com exemplo e caso de conformidade |

## 10. Preço — fora do nosso alcance, dito por completo

| A reclamação | Onde | O Recorte |
|:---|:---|:---|
| Malha, pesos e IK só na Professional (US$ 379) | [página de compra](https://esotericsoftware.com/spine-purchase) · FATO | não se aplica hoje |
| Receita acima de US$ 500 mil obriga Enterprise anual | [página de compra](https://esotericsoftware.com/spine-purchase) · [Hacker News](https://news.ycombinator.com/item?id=41268540) · FATO | não se aplica hoje |
| Estúdio desistiu do Spine pelo preço dos pesos | [fórum 28077](https://esotericsoftware.com/forum/api/discussions/28077) · 2025 · *opinião* | — |

---

## A lista curta, para quem planejar

Só o que é **a caminho** ou **já cometemos**. Nenhum pede código agora.

| # | O quê | Veredito | Onde decide |
|:---:|:---|:---|:---|
| 1 | Alt para criar osso: o próprio Spriter teve de ouvir que briga com o Linux | a caminho | Humberto, antes do lote das três diferenças |
| 2 | Mexer na base muda todas as animações, sem "ajustar" | a caminho | `AS REGRAS DA BASE` |
| 3 | O rascunho falha calado | já cometemos | regra 21 |
| 4 | "Cancelar" apaga o rascunho | a caminho | o executor da casca |
| 5 | Semente das partículas: cada emissor a sua, e ao duplicar | a caminho, saída proposta | `COMO SE FAZ EFEITO`, seção 4; decide o Humberto |
| 6 | Botão direito na cena com dois sentidos, sem porta no menu | a caminho | `QUADRO ABERTO` |
| 7 | Gravar sozinho nasce ligado; trocar de pai grava sem perguntar | em parte | já está na barra; o Humberto decide se basta |
| 8 | Comando com porta no menu, sem tecla e sem manual | já cometemos | o manual, que está andando |
| 9 | Plugin de motor feito por terceiro morre | a caminho | quando os motores entrarem |

**Mandado a outras pesquisas, não escrito aqui:** os pedidos que apareceram no
meio das queixas (copiar curva para vários ossos, pressão da caneta no pincel,
animar imagem sem osso, Godot oficial) foram para a **Pesquisa 3**.
