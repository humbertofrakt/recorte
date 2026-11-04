# A malha e os pesos conferidos — lote 1 (v31.6) — 06/10/2026

Rodada 41, lote 1, aba *Malha e pesos*. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.6** (o "Sobre" diz v31.6) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 13h07 a 13h12, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-41-conferida/lote1/` (10) |
| Material | o herói de exemplo, aberto pelo próprio programa. A `face` (do `head`) já tem malha; o `cape_upper` **não** tinha, e eu o virei malha, gerei, tracei, apaguei vértices e liguei os ossos `cape1` e `cape2`. **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 3, 4, 5) | **1** (2) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 2 | quase toda dica é frase inteira; **algumas** ficam curtas ou só dizem *"Escolha dois vértices"* (ver defeito 2) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **O *Raio* não vai de 0 a 100: vai de 1 a 400.** O pedido dizia *"Raio (px) e Força (%) de 0 a 100"*. A *Força* é de 0 a 100, certo; o *Raio* é de **1 a 400 px**, e **a dica diz isso** (*"de 1 a 400 px"*). Se a intenção era 0 a 100 nos dois, **o Raio não obedece**; se não era, está certo e o pedido é que estava curto | 1 | `B0_pincel` |
| 2 | **Dicas curtas, que não dizem o que o botão faz:** ***"Pintar cape1"*** (o nome do osso na lista) · ***"Tirar cape1 da malha"*** (a lixeira ao lado) · ***"Escolha dois vértices"*** (no *Criar aresta*: só diz o que falta, não o que o botão faz) · **o *Raio* e a *Força*** têm a dica **na palavra** (*"Raio do pincel, em pixels…"*), **não nas caixas e barras** · o ***Pincel*** (a faixa que abre e fecha) **não tem dica** · a lista ***Malha de origem*** também não | 2 | `J1_ossos_ligados` |
| 3 | *Pequeno.* **Apertar *Delete* com o desenho escolhido (e nenhum vértice) apaga o desenho inteiro, e o rodapé diz só *"Apagar."*.** Sem dizer **o que** apagou (o `cape_upper` com a malha e os pesos). Com um vértice escolhido o rodapé é claro (*"Vértice apagado."*, linha 4). *Ctrl+Z* devolve (*"Desfeito: Apagar"*) | 4 | — |
| 4 | *Pequeno.* O rodapé do vértice apagado **não diz quantos** (*"Vértice apagado."*) nem quantos restam, e *Gerar malha*, *Traçar* e *Usar a forma* dizem **números** (vértices, triângulos) | 4 | `G1_delete_vertice` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Pincel: *Raio (px)* e *Força (%)* com faixa na dica; os 4 modos com dica | **vi funcionar** | **Raio:** dica ***"Raio do pincel, em pixels do esqueleto, de 1 a 400 px. O círculo azul na cena mostra o tamanho"***. Digitei **999 → fica 400**, **0 → 1**, **−5 → 1**, 30 → 30. **Força:** dica ***"Quanto cada passada empurra o peso, de 0 a 100 %. Com 100 % uma passada só já pinta tudo"***. Digitei **150 → 100**, **−5 → 0**, 0 → 0, 100 → 100. **Os 4 modos:** *Somar: "a passada dá mais peso ao osso escolhido, e os outros perdem o mesmo tanto"* · *Subtrair: "…tira peso do osso escolhido e devolve aos outros"* · *Substituir: "…leva o peso do osso escolhido até 100 %, no passo da Força"* · *Suavizar: "…mistura o peso de cada vértice com o dos vizinhos"*. **Raio de 1 a 400** (defeito 1) | `B0_pincel` |
| 2 | Todo botão da aba tem dica com frase inteira | **pela metade** | **Frase inteira:** *Gerar automática · Traçar contorno · Criar vértice · Apagar vértice · Ligar ossos · Pesos automáticos · Suavizar tudo · Podar · Chavear pesos · Tirar pesos · Usar forma* e os quatro modos do pincel; também *Travar cape1: o pincel, Suavizar e Podar não mexem no peso dele*, *Afastamento do contorno gerado, para fora, em pixels da imagem. 0 desliga* e a do *Avançado*. **Curtas ou ausentes:** defeito 2 | `J1_ossos_ligados` |
| 3 | Os nomes dos ossos na lista aparecem inteiros (*cape1*, *cape2*), não "ca…" | **vi funcionar** | No `cape_upper`, depois de *Ligar ossos*: ***cape1 · 100 %*** e ***cape2 · 0 %***, nomes **inteiros**, cada um com a caixa de trava e a lixeira. No `head`, ***torso · 8 %*** e ***head · 93 %***. **Em nenhuma linha achei "ca…"** (a árvore à esquerda corta *cape_up…*, mas é a árvore, não a lista) | `J1_ossos_ligados` |
| 4 | O rodapé diz o resultado de *Gerar malha*, *Traçar*, *Delete* e *Usar a forma de outra malha* | **vi funcionar** | ***Virar malha:*** *"cape_upper" virou malha: 4 vértices.* · ***Gerar:*** *"Malha gerada: 29 vértices, 50 triângulos."* · ***Traçar:*** *"Contorno traçado: 6 vértices, 4 triângulos."* · ***Delete** (com um vértice escolhido na ferramenta Malha):* *"Vértice apagado."* e o botão ***Apagar vértice*** diz o mesmo · ***Usar forma:*** *"cape_upper_ligada" criada, emprestando a forma de "cape_upper". Ela começa com a mesma imagem; troque em Propriedades, no campo Imagem.* · **Ligar ossos:** *"cape1" entrou na malha "cape_upper", com peso 100% em todos os pontos* e *"cape2" entrou… com peso 0%: pinte, ou use Pesos automáticos.* **Ressalva:** *Delete* com o **desenho** escolhido diz só ***"Apagar."*** (defeito 3) | `E1_tracar` · `G1_delete_vertice` · `J1_ossos_ligados` |
| 5 | A malha ligada é dita pelo nome ("tipo nenhum" não aparece) | **vi funcionar** | Escolhendo a ligada: ***"Malha ligada: usa a forma de "cape_upper". A forma e os pesos se mudam lá"***, e em *Avançado: malha ligada* a lista *Malha de origem* diz ***"cape_upper — 4 vértices"*** (nome e número). **Procurei "tipo nenhum", "nenhum tipo" e "tipo:" em toda a tela: não achei** | `I0_ligada_escolhida` · `H0_avancado` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **Abrir a faixa *Pincel* liga a ferramenta *Pesos* sozinho** (o rodapé diz *"Pincel na mão (ferramenta Pesos, G)…"*): bom, mas **muda o que o clique faz na cena** sem eu ter pedido |
| C2 | Para apagar **um vértice** é preciso estar na ferramenta ***Malha (M)***. Na *Pesos*, clicar num vértice **não o escolhe**: o *Delete* então vai para o desenho (defeito 3) |
| C3 | O painel é **baixo** em 1920×1080: *Forma*, *Ossos*, *Pesos*, *Pincel* e *Avançado* não cabem juntos; rola. A faixa *Pincel* fica **abaixo** de *Pesos* |
| C4 | Escolhi *Usar forma* com a **própria** malha como origem (a única que a lista tinha), e o programa fez a ligada: **não vi nenhuma recusa** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Malha do `cape_upper` | **fiz** pela tela (*Virar malha*, *Gerar*, *Traçar*); não veio pronta | uma malha feita à mão num boneco de verdade |
| Vértice escolhido | cliquei no ponto na cena | **dois vértices**: não consegui escolher dois, então **não vi o *Criar aresta* ligado** nem sua dica ligada |
| "Frase inteira" | minha leitura do **título** dos botões | o balão na tela, e o que o Humberto acharia |
| Pincel | só os **números**; **não pintei** nada na malha | que o pincel pinta com esse raio e essa força |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
