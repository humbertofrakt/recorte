# Pivô em skins — como Spriter e Spine resolvem, e o que o Recorte faz

Pesquisa de 10/09/2026. Pergunta do Humberto: quando troco a imagem da mão,
ou desenho outro personagem com os mesmos ossos, **quem diz onde a imagem
fica?** Hoje é trabalho manual e cansativo.

Resposta curta: **nenhum dos dois programas resolve com o pivô.** Os dois
resolvem com a **regra do quadro**: toda variação de uma peça é desenhada no
mesmo quadro, com a articulação no mesmo pixel. O Recorte já tem o formato
para isso. Falta o editor fazer o trabalho por nós.

---

## 1. O que o Spriter faz

| Onde mora o pivô | **Na imagem.** Cada arquivo de imagem tem um pivô padrão (0..1). Duplo clique na paleta de arquivos abre o diálogo. Nove atalhos: cantos, centro, meio dos lados. |
|:---|:---|
| Ao trocar imagem | "a new image will be placed in the exact location of the current image **based on their respective pivot points**". |
| Tamanho diferente | O manual manda **evitar**: "insure that each image to be swapped has the **same exact pixel-dimensions** ... all images are **buffered with enough transparent pixels** ... so the exact same default pivot-point coordinates can be set for all ... no jarring 'pop'". |
| Muitas imagens | **Copy Default Pivots / Paste Default Pivots**: define numa, cola em todas. |
| Character map | Troca por nome. Conselho: mesma pasta espelhada, **mesmo nome e mesmo tamanho** de imagem. Aí se troca a pasta inteira de uma vez. |
| Pivô na tela | Existe, mas o manual **desaconselha**: vira pivô animado, "might not be well supported by certain Spriter run-times". |

Ou seja: o pivô por imagem existe, mas o Spriter só funciona bem quando
**todas as imagens têm o mesmo tamanho**. O pivô não resolve o tamanho.

## 2. O que o Spine faz

| Onde mora o pivô | **Não existe pivô de imagem.** "The region attachment's translation is the location of the **center** of the image." O `x/y` é por anexo, e cada skin tem o seu anexo. |
|:---|:---|
| Ao trocar imagem | Arrastar a imagem **em cima do anexo antigo** copia o transform: "dropping them on an existing attachment will **copy its transform**, while dropping them on the skin placeholder will not". |
| Skin parecida | "duplicate the existing skin, which also duplicates all its attachments, then modify the new skin". |
| Tamanho diferente | Reconhece o problema: "When images are a different sizes, they will need to be positioned differently." Solução: "outfit the skeleton with **template images that have enough whitespace** ... Since every image is the same size as the corresponding template image, they attach to the bone in the same position." |
| Photoshop | O script exporta cada camada com a posição **relativa à origem da régua** ("The Photoshop ruler origin corresponds to 0,0 in Spine"). Recorta o transparente e **mesmo assim** a posição fica certa. Tag `[skin]` põe camadas em skins diferentes, no mesmo slot. |

Ou seja: o Spine também vive da **regra do quadro**. A diferença é que o
script do Photoshop faz a conta por você.

## 3. Os dois lado a lado, e o Recorte hoje

| | Spriter | Spine | Recorte hoje |
|:---|:---|:---|:---|
| Pivô mora em | imagem (0..1) | anexo (`x/y` do centro) | anexo (`x/y` do centro), igual ao Spine |
| Troca de imagem usa | pivô da imagem nova | transform do anexo antigo | **`path` só**: mantém `x/y/width/height` antigos |
| Tamanho diferente | evitar: mesmo tamanho + transparente | evitar: template com espaço em branco | atlas já recorta transparente e compensa (§10.3, `offsetX/offsetY`) |
| Quem faz a conta | você, imagem por imagem | script do Photoshop | `psdPlacement`: PSD já cai no lugar certo |
| Copiar pivô em lote | Copy/Paste Default Pivots | duplicar skin | — |

**Achado no código.** `SwapImageEverywhere` (`editor/src/panels/skins-model.ts`)
troca só o `path`. Se o anexo tem `width/height` gravados e a imagem nova tem
outro tamanho, a §7.3 **estica** a imagem nova para o tamanho antigo
(`kx = W / originalWidth`). É isso que faz a mão "sair do lugar".

## 4. As três perguntas, respondidas

**Pivô só nos ossos?** No arquivo, sim: o osso gira na raiz dele e a imagem
tem `x/y`. Igual ao Spine. Não precisa de campo novo. O que falta é o editor
**calcular** o `x/y`, em vez de a gente arrastar.

**Trocar a mão: onde a imagem nova fica?** No mesmo lugar da antiga, se as
duas foram desenhadas no mesmo quadro. Se não foram, alguém tem que dizer
onde a articulação está na imagem nova. Uma vez, com um clique.

**Outro personagem, mesmos ossos, outro tamanho?** Dois caminhos.

| Caso | Caminho |
|:---|:---|
| Mesmas proporções, desenho diferente | é **uma pele**: desenhe no mesmo quadro, importe como pele |
| Proporções diferentes (braço mais longo) | é **outro `.bone`**, que reaproveita as animações pelo `assets.animations` + `rig` (§2.8, §4.8). Já existe |

## 5. Proposta: três degraus, nenhum campo novo no formato

| Degrau | O que é | Custo |
|:---:|:---|:---|
| **1. Troca esperta** | Ao trocar ou soltar imagem num placeholder que já tem anexo: copiar `x/y/rotation/scale` do anexo antigo (Spine) e **zerar `width/height`** para o tamanho da imagem nova (corrige o esticamento). Tamanho diferente alinha pelo **centro**, e uma caixinha oferece os **nove pontos** do Spriter: canto, centro, meio de lado. Uma escolha em vez de arrastar | pequeno; um lote |
| **2. PSD como pele** | Hoje "Importar PSD" cria esqueleto. Ganha a opção **"como pele de: …"**: cada camada com o mesmo nome vira anexo no mesmo slot, com o `x/y` que `psdPlacement` já calcula. Skin nova = outro PSD no mesmo quadro. Zero trabalho manual | médio; um lote |
| **3. Âncora** | Clicar na imagem onde está a articulação. O editor converte em `x/y` com a fórmula que o importador do Spriter já usa: `((0.5 − px)·W, (0.5 − py)·H)`. A âncora (0..1) fica em `RECORTE_editor_state` (regra 6 da casa), **não** no núcleo. **Copiar / colar âncora** entre imagens, como o Spriter. Toda imagem nova que cai no placeholder herda a âncora dele | médio; um lote |

Ordem sugerida: 1, depois 2, depois 3. O degrau 1 sozinho já tira o
"pop" da troca de mão. O 2 elimina o trabalho manual para quem desenha em
PSD. O 3 é para imagem solta, desenhada fora do quadro.

**Misturar animações e peles** já existe: mistura por faixas na Prévia
(`AnimationState`), várias peles ativas e `skin.includes` (§4.4). O que
falta é só o pivô, e a resposta é: **quadro, não pivô**.

## 6. Regra de arte para o manual (capítulo 2)

Uma frase: **desenhe cada variação no quadro da original, com a articulação
no mesmo pixel.** O atlas recorta o transparente. A posição fica certa
sozinha.

## Fontes

- Spriter, [What are character maps](http://www.brashmonkey.com/spriter_manual/what%20are%20character%20maps.htm)
- Spriter, [Swapping the image of a sprite](http://www.brashmonkey.com/spriter_manual/swapping%20the%20image%20of%20a%20sprite.htm)
- Spriter, [Default pivot points](http://www.brashmonkey.com/spriter_manual/default%20pivot%20points.htm)
- Spriter, [Create a character map](http://www.brashmonkey.com/spriter_manual/create%20a%20character%20map%20and%20assign%20effects.htm)
- Spine, [Skins](https://esotericsoftware.com/spine-skins)
- Spine, [Region attachments](https://esotericsoftware.com/spine-regions)
- Spine, [Runtime skins — template images](https://esotericsoftware.com/spine-runtime-skins)
- Spine, [Photoshop to Spine script](https://github.com/EsotericSoftware/spine-scripts/tree/master/photoshop)

---

# Rodada 2 — enfrentar o tamanho diferente

Humberto, 10/09: "os dois programas mandam evitar tamanhos diferentes, mas
nós vamos enfrentar. Um humano não troca de osso para vestir uma fantasia do
Mickey." As ideias dele: 9 pontos + manual; duas pastas alinhadas; dois PSD
com as mesmas camadas como referência de pivô; o atlas leva os pivôs.

## 7. Como o script do Photoshop resolve a mão maior

Ele **não usa pivô**. Ele mede cada camada a partir da origem da régua.
O centro da camada vai para o JSON como `x/y`. O osso não se mexe. A camada
pode ter qualquer tamanho e estar em qualquer lugar: a conta é sempre
"centro da camada menos origem". Dois PSD no mesmo quadro, com os mesmos
nomes de camada, dão duas peles no mesmo esqueleto, cada peça no lugar em
que foi desenhada.

O Recorte **já tem essa conta**: `psdPlacement` em
`ferramentas/src/importar/psd.ts`, e o encaixe em osso (`rig.placements`)
que o lote 45 trouxe com a camada de ossos. E já tem o inverso:
`montar-psd.mjs` gera o PSD do herói montado, com `--ossos`. O caminho de ida
e volta existe na linha de comando. O que **não** existe: importar o segundo
PSD **como pele** de um esqueleto que já está aberto. Hoje ele vira esqueleto
novo.

## 8. A ideia que organiza tudo: um pivô por imagem, no atlas

A pergunta "onde a mão nova fica?" tem uma só resposta: **onde está o pulso
dentro da imagem**. Isso é o pivô do Spriter. O que o Spriter erra é fazer
o artista marcar na mão; o Spine erra por não guardar. A proposta junta os
dois: **toda região do atlas tem um pivô, e o editor calcula quase todos.**

| Onde | Campo | Unidade | Quem lê |
|:---|:---|:---|:---|
| `Region` do atlas (§10.3) | `pivotX`, `pivotY` | px da imagem **original**, da esquerda e de **baixo**, como `offsetX/offsetY` | só o editor e as ferramentas. Runtime ignora |

Por que no atlas e não no `.bone`: o pivô é da **imagem**, e a imagem viaja
com o atlas. A mão do Mickey num atlas de outro projeto já chega sabendo onde
é o pulso. Por que em px e não 0..1: 0..1 muda quando a imagem é recortada;
px da original sobrevive ao recorte, igual aos `offset`.

O anexo continua só com `x/y`: `x = W/2 − pivotX`, `y = H/2 − pivotY`,
depois girado e escalado. **Nenhum campo novo no `.bone`.** O runtime não
muda. Campo novo no atlas: **decisão do Humberto** (regra 7).

## 9. De onde o pivô vem: quatro portas, da mais barata para a mais manual

| Porta | Entrada | Como o pivô nasce | Cliques |
|:---:|:---|:---|:---:|
| 1 | **PSD como pele** (dois PSD, mesmas camadas) | onde a raiz do osso cai dentro da camada. `montar-psd --ossos` gera o quadro; o artista pinta o Mickey por cima; o editor importa como pele | 0 |
| 2 | **PNG no quadro inteiro** (mesmo tamanho do quadro de referência) | o editor recorta o transparente e faz a mesma conta da porta 1 | 0 |
| 3 | **Pasta pareada por nome** (as duas pastas do Spriter) | herda o pivô da imagem antiga **por proporção** como chute; os 9 pontos ou um clique corrigem a que ficou torta | 0 ou 1 por imagem |
| 4 | **Imagem solta** | diálogo do pivô: **9 pontos** + **clique na articulação** + **copiar/colar pivô** nas selecionadas (Spriter inteiro) | 1 por imagem |

Portas 1 e 2 são o Spine feito pelo editor. Portas 3 e 4 são o Spriter. Tudo
cai no mesmo campo do atlas. A partir daí:

- **Trocar a imagem** (em uma pele ou em todas) posiciona a nova **pelo pivô
  dela**: recalcula `x/y`, zera `width/height`. Tamanho e posição diferentes,
  sem esticar, sem "pop". É o "based on their respective pivot points" do
  Spriter, com o pivô de graça nas portas 1 e 2.
- **Reempacotar atlas** preserva o pivô: ele é da imagem original.
- **Fantasia do Mickey**: mesmos ossos. A mão maior é uma camada maior no
  mesmo quadro. Porta 1, zero cliques. Braço mais comprido é osso, não
  imagem: aí é outro `.bone` que reaproveita as animações (§2.8).

## 10. Ordem de entrega

| Lote | O que entra | Destrava |
|:---:|:---|:---|
| A | `pivotX/pivotY` no atlas (spec §10.3, schema, packer); troca de imagem pelo pivô; diálogo do pivô com 9 pontos, clique e copiar/colar | portas 3 e 4; o "pop" da troca acaba |
| B | "Importar PSD **como pele de…**" no editor e em `importar-psd.mjs`; `montar-psd --ossos` vira botão "Exportar quadro de referência" | porta 1: o Mickey sem clique |
| C | pasta de PNG no quadro inteiro como pele; pareamento por nome com chute por proporção | portas 2 e 3 em lote |

Cada lote: manual nas duas línguas, `CHANGELOG`, versão numerada.
