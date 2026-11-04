# As decisões do projeto — 04/10/2026

Passo 3 do projeto do programa. Decidido pelo Humberto em 03 e 04/10/2026, na janela
`EXECUTANDO · plano para terminar o programa`. **Só texto: nenhum código foi mexido.**

A peneira acabou, e a resposta foi: **nada sai do programa.** Tudo fica.
O trabalho é dar a cada coisa o seu lugar, e fazer funcionar.

---

## O quadro

| Parte | Decisão |
|:---|:---|
| A frase do programa | cópia do Spriter, com a malha do Spine e o sistema de conexão |
| Modo Base | seção 1 |
| Sistema de conexão | seção 2 |
| Sistema de skin | seção 3 |
| Do Spine | **tudo fica**: malha, pesos, regras, física, caminho. Faltava a porta no menu |
| Só nosso | **tudo fica**: partículas, variáveis e etiquetas, efeitos, biblioteca de animações |
| Pivô | acertei o pivô de uma imagem presa a um osso: o desenho fica **parado** |
| A tela | seção 4 |
| Começar | o programa **pede uma pasta** ao começar o projeto, como o Spriter |
| A entrega | **Construct** e **Godot** |
| Partículas | seção 5 |
| Depois, não agora | seção 6 |

---

## 1. O modo Base

**O problema.** Eu monto o personagem dentro de uma animação e crio as outras a partir
dela. Monto algo errado, ou esqueço uma peça, e tenho de consertar em todas.

**A solução.** A base é uma animação de um quadro só. É nela que eu monto o personagem.
Criar uma animação: ela nasce da base. Mudar algo em todas: mudo na base.

| # | Regra |
|:---:|:---|
| 1 | Cada base tem as suas próprias animações |
| 2 | Dá para clonar uma base, com as animações dela |
| 3 | Dá para pegar um quadro de uma animação e criar uma base a partir dele |
| 4 | Dá para colar outra base no meio de uma animação: o homem vira lobisomem |
| 5 | Peça tirada da base: as chaves dela nas animações **ficam guardadas**, sem fazer nada. Se a peça volta, as chaves voltam. Como dois saves: um não apaga o outro |

---

## 2. O sistema de conexão

### A ideia

Todo corpo é um adaptador de tomada: tem um pino e tem tomadas. Não existe um tipo de
peça que só recebe e outro que só entra. O que muda é onde eu encaixei.

### As palavras

| Palavra | O que é |
|:---|:---|
| Animação | o que eu estou trabalhando agora |
| Base | o corpo montado. Cada base tem as animações dela |
| Entidade | o projeto finalizado. Já vem animada e pronta. Pode ser usada como base |

**Base ou entidade depende de onde eu estou.** Base é o que eu animo na mão. Entidade é
o que está encaixado, e eu só dirijo pela faixa. Clico numa base da lista, e ela passa a
ser a que eu animo.

### As regras

| # | Regra |
|:---:|:---|
| 1 | **Qualquer imagem pode receber uma entidade.** Onde cabe uma imagem, cabe uma entidade |
| 2 | **Slot**: eu marco uma imagem como slot, e ela **vira uma base** dentro do projeto. Ganha nome (fácil de achar) e animações próprias. Não é o que permite a troca: é o que dá nome e animações |
| 3 | Não há separação entre "lugar" e "conteúdo". É base dentro de base, e base que recebe entidade. O mesmo gesto do homem que vira lobisomem |
| 4 | A entidade herda o lugar, a ordem de desenho e as chaves da imagem que substitui |
| 5 | Quem manda no tamanho é a entidade. O pivô dela cai no pivô da imagem |
| 6 | Quando a entidade sai, a imagem de antes volta |
| 7 | A entidade entra inteira, com tudo o que já está encaixado nela (roupa, arma) |
| 8 | Encaixe sem limite de níveis. A mesma entidade pode aparecer várias vezes e em vários níveis: são objetos separados |
| 9 | A entidade se comporta como uma imagem: mover, girar, mudar o tamanho, e isso vira chave |
| 10 | **O programa não limita o que entra.** Limite é da engine, no jogo |
| 11 | **Cozinhar não existe.** Decidido que não precisa |

### Como trocar, no editor

Botão direito na imagem → a grade, com imagens e entidades → clico na entidade.

| Troquei… | Vale… |
|:---|:---|
| na base | em todas as animações |
| no meio de uma animação | só naquela, daquele quadro em diante |

Também dá para pôr a entidade direto, arrastando da aba Entidades, sem imagem antes.

A entidade adicionada na animação **passa a fazer parte do projeto, como uma base**:
aparece na lista, com as animações dela. Clicar numa animação da lista troca a linha do
tempo; a cena continua mostrando tudo montado.

### Os dois lugares: adicionar ou testar

| Lugar | O que eu faço | Vira parte da animação? |
|:---|:---|:---:|
| **A linha do tempo** (base e animações) | adiciono | **sim** |
| **O visualizador de montagem** | testo slots e skins: encaixo, desencaixo | **não**: descartável |

O visualizador tem um botão **"Aparecer na linha do tempo"**: mostra o teste enquanto eu
animo. Mesmo assim não é adicionado à animação. A montagem de teste fica guardada
enquanto eu edito.

Exemplo: o mecha em volta do piloto, montado no visualizador. Eu animo "pilotar" vendo o
mecha. O piloto não leva o mecha junto.

### "Este boneco": a tomada ao contrário

O poder rosa foi feito para receber o personagem. Mas eu estou animando o personagem e
quero pôr o poder nele. Ponho o poder na animação; botão direito na imagem do meio do
poder; na grade, o primeiro item é **Este boneco**.

| O que o programa faz |
|:---|
| A imagem do meio não é desenhada. Só marca o meio |
| O que está atrás dela é desenhado atrás do personagem inteiro |
| O que está na frente dela é desenhado na frente do personagem inteiro |

**O formato tem de aguentar isto.** Decisão do Humberto: *"vai ter que aguentar"*.

### Quem dá as ordens

| O que eu fiz | Quer dizer |
|:---|:---|
| escolhi a animação da entidade na faixa | quem recebe manda nela (a motosserra; o piloto no mecha) |
| não escolhi nada | ninguém manda. Ela fica livre para o jogo (o personagem no poder rosa) |

Não há botão de "presa" ou "solta": o uso diz. Ordem para uma animação que a peça não
tem: ela fica parada, e o editor avisa.

### A faixa na linha do tempo

A entidade já chega animada. Ela aparece como uma faixa, e eu só ajusto a faixa.

| Gesto | Efeito |
|:---|:---|
| puxar a ponta para fora / para dentro | toca mais devagar / mais rápido |
| arrastar a faixa | muda quando começa |
| botão direito | escolhe qual animação toca |

Em laço: roda sozinha, a partir do quadro em que foi solta. Sem laço: faixa com tamanho.
Duração diferente dá salto na emenda: puxa-se a ponta até o fim. Esticar a animação de
quem recebe estica junto a faixa em que eu escolhi a animação.

### Mudar a entidade por dentro

Abrir, mexer, salvar. Ao salvar: **Novo** ou **Por cima** (avisa que outros projetos a usam).
Um projeto vira entidade por um item do menu Arquivo.

### No jogo

Cada entidade vai separada; o jogo monta. Os quatro exemplos do Humberto: a motosserra
(parada, funcionando, recarregando) · o personagem (espada na mão e nas costas) · o poder
rosa (bolinhas pela frente e por trás) · o mecha (o personagem customizado entra de piloto).

---

## 3. O sistema de skin

**Skin não é slot.** A skin veste o personagem. O slot encaixa outra peça nele.

A skin é uma **versão alternativa salva** do personagem. É o Character Map do Spriter
(conferido no manual oficial, em 04/10), com uma coisa a mais: ossos.

| # | Regra |
|:---:|:---|
| 1 | Edita-se **uma skin por vez**. Depois se **empilham** várias. Igual ao Spriter |
| 2 | Para cada imagem: **trocar** · **ignorar** (a skin não mexe) · **esconder** (não é desenhada) |
| 3 | Dá para trocar uma pasta inteira de uma vez, pelos nomes iguais |
| 4 | Com a skin em edição, o que eu crio é dela: imagens **e ossos** |
| 5 | O osso que eu apago sai **só daquela skin**. Os filhos saem junto, e o programa avisa quantos |
| 6 | Clonar a skin: o clone usa os **mesmos** ossos |
| 7 | Empilhadas: a de cima vence |
| 8 | As skins se testam no visualizador de montagem |

Exemplo: a skin "águia". Apago os braços e crio as asas. A base não muda.

---

## 4. A tela

| # | Decisão |
|:---:|:---|
| 1 | **A filosofia do Photoshop.** Painéis que se soltam da parede, recolhem e expandem. Um menu Janela. Contextos |
| 2 | **Cada coisa no seu lugar**, e não tudo na árvore, como no Spine. Base e animações num lugar. **Skins, imagens, entidades e partículas, cada uma com menu próprio** |
| 3 | **Toda função tem porta no menu, no lugar dela.** O Humberto não entendeu como usar regras, física e caminho porque não estavam nos menus |

**Atenção, para a obra:** o `ESTADO.md` diz que recolher, soltar da lateral, colar na
quina e arranjos com nome **já existem**. Na mão do Humberto os painéis ficam presos na
parede. Ou está quebrado, ou está escondido. **Ninguém conferiu no uso.**

---

## 5. Partículas

O Humberto não conseguiu usar. Os defeitos viram régua:

| O que não funcionou | Como tem de ser |
|:---|:---|
| estava na árvore | lugar próprio, com menu |
| não dava para clicar nela na cena | clica-se e escolhe-se, como uma imagem |
| não dava para mover | move-se e gira-se, como uma imagem |
| não dava para prender a um osso | prende-se como qualquer peça |

Ele quer um **sistema completo** (viu o Niagara), e pediu balanceamento: o que é bom
ter, e o que pesa demais.

**Régua proposta, ainda não confirmada por ele:** o sistema tem o que o Construct e o
Godot conseguem tocar. **Falta uma pesquisa** das partículas das duas engines.

---

## 6. Depois, não agora

| O quê | A ideia |
|:---|:---|
| Modo de alinhar pivôs | aba Imagens, botão direito numa **pasta** → Editar pivôs. Abrem todas as imagens da pasta. Pasta de dentro = grupo; grupo criado = pasta. Ferramentas como as do Photoshop: mover, girar, opacidade. Ao dar OK, o programa calcula o deslocamento do 0,0 ao centro de cada imagem, como o script do Spine |
| Photoshop | os grupos viram pastas e skins |

---

## 7. Como a obra vai ser feita

Palavra do Humberto, 04/10: *"eu quero que o projeto seja feito em pequenas partes, e que
eu possa passar cada nova rodada para um novo chat."*

A ordem e as fichas estão em `03 A ORDEM DA OBRA 2026-10-04.md`, nesta pasta.

---

## O que não foi conferido

| | |
|:---|:---|
| O que o código já faz do que está aqui | a grade com entidades, a aba Entidades, a faixa e o lápis da skin existem no código. **Nenhum foi conferido no uso** |
| O que não sei se existe | esticar a faixa pela ponta · o visualizador com encaixes · "Aparecer na linha do tempo" · apagar osso só na skin · pedir pasta ao começar |
| O DragonBones | não foi olhado nesta conversa |

---

## 8. Decisões depois de 04/10, noite

As respostas do Humberto às perguntas das rodadas estão no fim de `03 A ORDEM DA OBRA 2026-10-04.md`. Em resumo:

| Decisão | |
|:---|:---|
| "pele" vira **skin** · Esqueleto vira **Base** · "corpo" vira **base** | o desenho dos menus (`05`) está aprovado |
| Um menu só, **Malha e regras** · importar e exportar ficam no **Arquivo** | |
| A régua das partículas | entra o que é função pura do tempo e o nosso leitor desenha barato no Godot e no Construct (`06`) |
| O emissor ganha posição e giro próprios, como a imagem | muda o formato; decisão dada |
| **Mover a imagem ou a peça encaixada na animação cria chave, como no Spriter** | por dentro, um osso só dela, escondido. Corrige a regra 9 da seção 2: hoje a imagem **não** vira chave |
