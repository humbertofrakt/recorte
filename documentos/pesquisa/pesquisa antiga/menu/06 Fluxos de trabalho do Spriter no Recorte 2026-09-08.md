# Fluxos de trabalho — como o Spriter faz, como o Recorte faz hoje, o que falta

Escrito em 08/09/2026, a partir das perguntas do Humberto. Cada fluxo tem três colunas:
**Spriter / Spine**, **Recorte hoje** (conferido no código e no manual) e **o que falta**.

## Resumo em 7 linhas

1. **Virar filho pelo clique** (B do Spriter): hoje só arrastando na Árvore. Falta o gesto na cena.
2. **Girar "em Z" para perspectiva**: o formato tem Inclinação (shear). Falta a ferramenta na cena. 3D de verdade não existe.
3. **Espada de fogo animada no lugar da espada parada**: o formato faz (esqueleto dentro de esqueleto). O editor não cria isso pela tela.
4. **Pivô da imagem**: no Recorte não é um campo. É a posição da imagem em relação ao osso.
5. **Sub-animação**: dois jeitos, esqueleto filho com animação própria e camadas na Prévia.
6. **Osso só de uma pele**: o osso tem a caixa "Só com a pele". Falta a lista de ossos dentro da pele.
7. **Mão aberta e mão fechada**: dois anexos no mesmo slot, chave de Desenho. Funciona, mas o campo é de digitar.

---

## 1. Virar filho de um osso (o "B" do Spriter)

| Spriter | Spine | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|
| Escolhe o osso, **segura B**, clica no sprite ou osso. Vira filho. Solta B, acabou | Escolhe os filhos, aperta **P**, clica no pai | **Osso**: arrasta o nome por cima do pai, no painel Árvore. **Desenho**: escolhe o osso no campo **Osso** do slot, em Propriedades | O gesto na cena |

Proposta: **segurar P + clique** (P de pai, igual ao Spine). Vale para osso e para desenho.
Enquanto P está apertado, os candidatos a pai ficam realçados e o cursor vira uma seta com o nome.
A letra B continua sendo Posar.

---

## 2. A "perninha" no desenho e girar em Z

O que aparece no desenho escolhido é a **linha do osso** (da raiz à ponta) e as alças da ferramenta ativa. Não é um eixo Z.

| Pergunta | Resposta |
|:---:|:---:|
| Dá para girar o desenho "em Z", como uma carta virando? | Não. O formato é 2D (§4.2: x, y, rotação, escala, inclinação). |
| Como se faz perspectiva então? | **Inclinação** (`shearX`, `shearY`) mais **escala X** encolhendo. É o que Spine e Live2D fazem. |
| Existe no formato? | Sim. Animável. A linha do tempo já chama de "Inclinação X" e "Inclinação Y". |
| Existe na tela? | Só como número, em Propriedades. **Não tem ferramenta.** |

| Spriter | Spine | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|
| Não tem inclinação. Só gira e escala | Ferramenta **Shear**, tecla **Z**, arrasta na cena | Campos Inclinação X e Y em Propriedades | Ferramenta **Inclinar** na cena, tecla Z |

3D de verdade (girar a carta) é a pergunta em aberto do manual de requisitos, seção 6: "2D ou 2D+3D". Não é bug. É decisão sua.

---

## 3. Espada de fogo animada no lugar da espada parada

O formato já resolve isso. O exemplo `heroi.bone` **já faz**: o slot `weapon` tem o anexo `sword`, que é um esqueleto inteiro (`espada.bone`) com animação `idle` própria.

Como fica a troca, no arquivo:

| Slot `weapon` | Tipo | O que é |
|:---:|:---:|:---:|
| `espada` | `region` | a imagem parada |
| `espada_fogo` | `skeleton` | o arquivo `espada-fogo.bone`, com as chamas animadas |

Os dois anexos têm os mesmos `x`, `y` e `rotation` no osso da mão. Por isso ficam alinhados: **é a mesma âncora**. É isso que você imaginou que o pivô fazia, e é isso mesmo.

Trocar entre os dois:

| Jeito | Como | Quando usar |
|:---:|:---:|:---:|
| Chave de Desenho | Na animação `ataque`, chave no slot `weapon` trocando `espada` por `espada_fogo` | a troca é parte da animação |
| Pele | Pele `normal` traz `espada`; pele `fogo` traz `espada_fogo`. O jogo chama `setSkin` | o jogador ganhou a espada de fogo |

| Spriter | Spine | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|
| Sub-entity (o manual 1.4 não explica onde fica) ou character map | **Não tem esqueleto dentro de esqueleto.** Usa peles e um segundo esqueleto no jogo | O formato tem (§7.11). O runtime desenha. O editor **abre e mostra** | Botão **Novo → Esqueleto** no slot, escolhendo o arquivo `.bone`. Hoje só escrevendo no arquivo à mão |

---

## 4. O pivô da imagem

No Spriter o pivô é um campo da imagem: o ponto da imagem que gruda no osso e em volta do qual ela gira.

No Recorte não existe esse campo. O mesmo efeito vem de dois números:

| Coisa | Onde | O que faz |
|:---:|:---:|:---:|
| Raiz do osso | o osso | o ponto que gira. Regra do manual: **na articulação** |
| `x`, `y` da imagem | o anexo, em Propriedades | onde o **centro** da imagem fica em relação à raiz do osso |

Ou seja: o pivô do Spriter = "onde a raiz do osso cai dentro da imagem". Mover a imagem em relação ao osso é mover o pivô.

Para alinhar a espada de fogo com a espada parada: mesmos `x`, `y`, `rotation` nos dois anexos. Nada mais.

| Spriter | Spine | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|
| Duplo clique na imagem, caixa com 9 ícones (cantos, centro, meios). Pivô no canvas é animado e o manual desaconselha | Sem pivô por imagem. Move-se a imagem em relação ao osso, igual ao nosso | `x`, `y`, `rotação`, `escala` do anexo em Propriedades. Importar PSD já põe cada imagem onde estava no Photoshop | Mover a imagem **arrastando na cena** sem mover o osso (hoje a ferramenta Mover mexe no osso). Uma marca visível da âncora. Botão **Copiar âncora / Colar âncora** entre imagens do mesmo tamanho (o Spriter tem) |

---

## 5. Sub-animação

Duas coisas diferentes recebem esse nome.

### 5a. Um pedaço com animação própria (a espada com chamas)

É o esqueleto filho da seção 3. Ele tem as **próprias animações**, no próprio arquivo. O pai diz qual toca:

| Campo do anexo `skeleton` | Faz |
|:---:|:---:|
| `animation` | qual animação do filho toca |
| `loop` | repete ou não |
| `timeScale` | relógio do filho em relação ao pai |

Esses campos têm chave na linha do tempo (linha "Esqueleto"). Dá para trocar a animação da espada no meio do golpe.

### 5b. Duas animações ao mesmo tempo no mesmo boneco (andar e atirar)

Painel **Prévia**: até 4 camadas, cada uma com animação, lista de ossos e mistura. Manual 03, seção "Camadas".
"Copiar para a linha do tempo" grava o resultado como animação nova.

| Spriter | Spine | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|
| Sub-entity para 5a. Não tem 5b no editor | Não tem 5a. Para 5b, tracks no runtime e prévia no editor | 5a no formato e no runtime. 5b no painel Prévia | 5a: criar pela tela. 5b: está longe da linha do tempo, na coluna da direita |

---

## 6. Ossos que só existem numa pele

Exemplo: o rabo do cavaleiro-lagarto. Só a pele `lagarto` tem osso de rabo.

| No formato | Faz |
|:---:|:---:|
| `bone.skinRequired: true` | o osso pertence a peles |
| `skin.bones: ["rabo", "rabo2"]` | esta pele liga esses ossos |

| Spriter | Spine | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|
| Não tem. Character map só troca imagem | Tem: ossos e regras "de pele", listados dentro da skin na Tree | O osso tem a caixa **Só com a pele** em Propriedades | A **lista de ossos dentro da pele**. Hoje só escrevendo `skin.bones` no arquivo à mão. O validador avisa se esquecer (`HINT_SKIN_BONE`) |

Proposta: na Árvore, dentro de cada pele, um grupo **Ossos desta pele** com botão **Adicionar**. Marcar "Só com a pele" num osso pergunta em qual pele ele entra.

---

## 7. Trocar a imagem de uma peça (mão aberta, mão fechada)

Três jeitos, do mais simples ao mais forte.

| Jeito | Como | Exemplo no `heroi.bone` |
|:---:|:---:|:---:|
| **Dois anexos, chave de Desenho** | Slot `mao` tem `mao_aberta` e `mao_fechada`. Na animação, chave trocando um pelo outro (a chave é "parada", sem interpolar) | slot `hand`: `hand` e `hand_fist` |
| **Sequência** | Um anexo só, com lista de quadros. Toca `hand_01`, `hand_02`, `hand_03` como um GIF | anexo `hand`, `sequence.frames` |
| **Pele** | Pele `luva` troca todas as mãos de uma vez | peles do herói |

Como fazer a chave de Desenho hoje: modo Animando → escolher o slot na Árvore → digitar o nome no campo **Anexo** → **Chavear**.

| Spriter | Spine | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|
| Troca o arquivo do sprite na chave, pela File Palette. Character map para trocar em tudo | Bolinha de visível na Tree, com botão de chave ao lado. Só um anexo visível por slot | Funciona, mas o campo Anexo é **de digitar** o nome | Campo Anexo vira **lista** com os anexos do slot. Bolinha na Árvore, com chave ao lado, como o Spine. Botão **Novo → Imagem** num slot que já existe (hoje Importar imagens cria slot novo) |

---

## 9. Máscara: o personagem saindo do portal

A máscara esconde uma parte do desenho. Só o que está **dentro** do polígono aparece (ou fora, se invertida).

O formato já tem: anexo `clipping` (§7.7). É um polígono preso a um osso, com três campos:

| Campo | Faz |
|:---:|:---:|
| `end` | recorta todos os slots até este, na ordem de desenho |
| `slots` | ou uma lista exata de slots recortados (modelo do Live2D) |
| `invert` | `true` = esconde o que está **dentro** |

O portal, passo a passo:

| Passo | Como |
|:---:|:---:|
| 1 | Osso `portal`, parado no chão |
| 2 | Slot `mascara_portal` nesse osso, com um anexo `clipping` em forma de elipse |
| 3 | `end` = último slot do personagem. Tudo do personagem fica dentro da elipse |
| 4 | Animar o personagem subindo. O que está abaixo da borda some sozinho |
| 5 | A elipse pode ter chave de `deform` para o portal pulsar |

| Spriter | Spine | Live2D | Recorte hoje | O que falta |
|:---:|:---:|:---:|:---:|:---:|
| **Não tem máscara** | `New… → Clipping`, desenha o polígono na cena, escolhe o `end` | máscara por malha, em cada ArtMesh. Crítica: máscara dentro de máscara "vaza" | Formato e runtime prontos. O editor **não cria, não mostra, não edita** | **Novo → Máscara** no slot, desenhar o polígono na cena (a ferramenta Malha já traça polígono), campo `end` por lista, caixa **Inverter**, e "Máscaras" no painel Exibição |

Máscara pelo alpha da imagem (sem polígono) está prevista como extensão `BONE_clip_alpha` na §7.7, mas **ainda não foi escrita** no registro. Vale registrar.

---

## 10. Clip mask com mesclagem, como as skins do CS2

**É outra coisa, não a máscara da seção 9.** A máscara de ocultar esconde um pedaço da cena. O clip mask é o do Photoshop: o desenho de cima **só aparece onde o de baixo tem pixel**, e **mescla** com ele.

| | Máscara de ocultar (seção 9) | Clip mask com mesclagem (esta) |
|:---:|:---:|:---:|
| Para quê | esconder parte da animação. Portal, água, porta | pôr um padrão por cima de uma peça. Skin do CS2, tatuagem, sujeira, luz |
| O que recorta | um polígono desenhado à mão | o **alpha do desenho de baixo**, pixel a pixel |
| Mescla? | não. Só esconde | sim: multiplicar, sobrepor, clarear… |
| Formato hoje | **tem** (`clipping`, §7.7) | **não tem** |
| Editor hoje | não cria | não cria |

Como o CS2 faz: a arma é a base. O padrão é uma imagem por cima, recortada pela forma da arma, com um modo de mesclagem. Cada skin troca o padrão. A base fica.

### O que o formato precisa para isso

Um campo no anexo, ou no slot, dizendo "recorto pelo de baixo":

| Campo novo | Onde | Faz |
|:---:|:---:|:---:|
| `clipTo` | no anexo `region` ou `mesh` | nome do slot de baixo. O desenho só aparece onde aquele slot tem alpha |
| `blend` | já existe no slot | como mescla com o que está embaixo |

Com isso a skin do CS2 fica em dois slots no mesmo osso:

| Slot | Anexo | Campos |
|:---:|:---:|:---:|
| `arma` | imagem base | — |
| `arma_padrao` | imagem do padrão | `clipTo: "arma"`, `blend: "overlay"` |

Cada pele traz um padrão diferente em `arma_padrao`. O jogo chama `setSkin("dragao")`.

O mesmo mecanismo serve para **mapa de normais**: um slot `arma_normais` com `clipTo: "arma"` e um marcador dizendo "isto não é cor, é normal". O runtime que não entende ignora e desenha só a cor.

### Quebra-galho até o formato mudar

Dá para imitar com o que existe: polígono `clipping` na silhueta da arma com `slots: ["arma_padrao"]`, e `blend: "multiply"`. Funciona, mas o recorte é por polígono (borda dura) e sem `overlay`. Serve para testar a ideia, não para entregar.

### O que falta, item por item

| Coisa | Formato hoje | O que falta | Mexe no formato? |
|:---:|:---:|:---:|:---:|
| Recortar pelo de baixo | não | campo `clipTo` (ou a extensão `BONE_clip_alpha`, citada na §7.7 e nunca escrita) | **sim** |
| Mesclagens | `normal`, `additive`, `multiply`, `screen` | **`overlay`** (sobrepor), `hardlight`, `softlight`. As que o Photoshop e o CS2 mais usam. Três linhas a mais na §7.12 | **sim** |
| Mapa de normais | não | extensão `BONE_material`: slot ou página marcada como `normal`, `emissive`, `metallic` | **sim** |
| Tinta sem padrão | `color` e `darkColor` (§7.12) | nada. Já faz tinta de duas cores, como o Spine | não |
| Na tela | lista Mistura no slot | campo **Recortar pelo de baixo** no anexo, com lista de slots | não |

Isto é a primeira mudança de **formato** desta pesquisa. Vai para as decisões em aberto do `ESTADO.md`.

Quem tem: Photoshop (clip mask), Live2D (máscara por ArtMesh, com alpha), Unity e Godot (shader com normais). Spine só tinge; padrão por cima o Spine faz com polígono, igual ao nosso quebra-galho.

---

## 11. O que entra na proposta por causa destas perguntas

| Item | Custo | Lote sugerido |
|:---:|:---:|:---:|
| Segurar P + clique = virar filho | pequeno | 0 |
| Campo Anexo vira lista; bolinha com chave na Árvore | pequeno | 3 |
| Ferramenta Inclinar (Z) | médio | 4 |
| Novo → Imagem num slot que existe | pequeno | 8 |
| Novo → Esqueleto (arquivo `.bone`) num slot | médio | 8 |
| Mover a imagem sem mover o osso, com a âncora visível | médio | 8 |
| Ossos desta pele, na Árvore | pequeno | 9 |
| Copiar / colar âncora entre imagens | pequeno | 10 |
| Prévia (camadas) perto da linha do tempo | médio | 7 |
| Máscara de ocultar: Novo → Máscara, desenhar na cena, `end`, Inverter, mostrar no Exibição | médio | 8 |
| Traçar silhueta gera a máscara | pequeno | 8 |
| Clip mask com mesclagem: campo `clipTo` + `overlay`, `hardlight`, `softlight` | médio, **mexe no formato** | decisão |
| Mapa de normais: `BONE_material` | médio, **extensão** | decisão |

Só as duas últimas linhas mexem no formato. O resto já cabe no `.bone` de hoje.

---

**Assinado:** Pesquisador — sessão "Pesquisa de organização de menus" (Claude Fable 5.1; agentes de busca em Opus). 08/09/2026.
