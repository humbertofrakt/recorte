# Recorte — manual simples

**O que o programa tem, e como se faz cada coisa.**

Feito em 18/09/2026, lendo o **código** do editor (menus, teclas e painéis).
Não foi copiado dos manuais antigos. Onde o programa ainda não tem a porta, está dito no fim (parte 18).

**Conferido em 19/09/2026 com o programa aberto.** O resultado está na parte 19: o que funciona, o que não deu para testar, e **três defeitos achados**.

### Cuidado — três defeitos de hoje

| Onde | O que acontece | Como fugir |
|:---|:---|:---|
| **Desfazer** depois de **Duplicar** um osso recém-criado | Criar osso → `Ctrl+D` → desfazer duas vezes: **o osso criado não sai**. Refazer cria um segundo com o mesmo nome, e o arquivo ganha um aviso | Não duplique logo depois de criar. Se acontecer, apague o osso na mão |
| **Esqueleto → Novo → Regra…** com a aba **Regras** na frente | **Fecha a aba Regras** e não abre a janela. O mesmo com **Novo → Pele**: cria a pele, mas fecha a aba Peles | Use o botão **Nova regra** da própria aba. Ou deixe outra aba na frente |
| **Chavear tudo** (`Ctrl+K`) no meio de um trecho com **curva** | Aparecem avisos no rodapé: a curva fica com as alças fora do trecho novo | Desfazer limpa. `K` sozinho não dá o problema |

Também: com a aba **Regras fechada**, os itens **Regra…** e **Física** do menu Esqueleto **não fazem nada e não avisam**. Abra a aba antes (**Janela → Regras**).

| Escrito assim | Quer dizer |
|:---|:---|
| **Arquivo → Salvar** | caminho de menu |
| `K` | tecla |
| *botão direito* | clique com o botão direito do mouse |

## Índice

| # | Parte | # | Parte |
|:---:|:---|:---:|:---|
| 1 | A tela | 10 | Animar |
| 2 | Começar, abrir e salvar | 11 | Peles |
| 3 | Imagens e pivô | 12 | Regras, física, variáveis |
| 4 | As ferramentas da cena | 13 | Malha e pesos |
| 5 | Ossos e a Árvore | 14 | Prévia |
| 6 | Ordem de desenho | 15 | Importar e exportar |
| 7 | Propriedades | 16 | Arrumar a tela e o programa |
| 8 | Ver, esconder e travar | 17 | Todas as teclas |
| 9 | Corpos, animações e entidades | 18 | O que ainda não tem porta |

---

## 1. A tela

| Lugar | O que é |
|:---|:---|
| Barra de menus | Arquivo · Editar · Exibir · Esqueleto · Animação · Janela · Ajuda |
| Barra de ações | Novo, Abrir, Salvar, Desfazer, Refazer, Copiar, Colar, Apagar, as ferramentas, Eixos, Imagem de referência, Ver e Travar |
| Cena | o meio. Onde se monta e anima |
| Coluna esquerda | Árvore · Ordem · Propriedades |
| Coluna direita | Imagens · Entidades · Pivôs · Exibição · Prévia · Animações · Peles · Regras · Histórico · Malha e pesos |
| Faixa de baixo | Linha do tempo · Curvas |
| Rodapé | diz onde você está, o último passo, e os avisos |

**O rodapé diz onde você está:**

| Rodapé diz | Mexer faz o quê |
|:---|:---|
| **Base: nome do corpo** | grava na base. Vale em todas as animações |
| **Animação: nome** | grava chave |

Não achou um comando? **Ajuda → Paleta de comandos** (`Ctrl+Shift+P`). Digite um pedaço do nome.

---

## 2. Começar, abrir e salvar

| Quero | Faço |
|:---|:---|
| Começar do zero | **Arquivo → Novo projeto** (`Ctrl+N`) |
| Começar pelas imagens | **Arquivo → Abrir pasta do projeto…** As imagens vão para a aba Imagens. Nada entra na cena sozinho |
| Abrir um arquivo | **Arquivo → Abrir projeto…** (`Ctrl+O`). Aceita `.bone`, `.boneb`, `.bonez` |
| Abrir soltando | Arraste o arquivo para a janela. Uma faixa diz antes o que vai acontecer |
| Ver o exemplo | **Arquivo → Abrir o herói (exemplo)** |
| Abrir um recente | **Arquivo → Abrir recente…** |
| Recuperar o que fechou sem salvar | **Arquivo → Reabrir o fechado**. As imagens não voltam, só o `.bone` |
| Salvar | **Arquivo → Salvar** (`Ctrl+S`). Grava a pasta inteira: um `.bone` por corpo e entidade, o `manifest.json` e o atlas |
| Salvar em outro lugar | **Arquivo → Salvar como…** (`Ctrl+Shift+S`) |
| Salvar menor | **Arquivo → Salvar como binário…** (`.boneb`) |
| Salvar tudo num arquivo só | **Arquivo → Salvar como pacote…** (`.bonez`) |
| Mandar um corpo para o jogo | **Arquivo → Entregar um corpo…** Sai só com as imagens que ele usa |
| Trazer outro `.bone` como corpo | **Arquivo → Abrir outro corpo…** |
| Trazer outro `.bone` como entidade | **Arquivo → Abrir uma entidade…** |
| Salvar entidade que veio de fora | **Arquivo → Salvar a entidade editada…** Escolha: Por cima, ou Novo neste projeto |
| Quadros por segundo, cor de fundo, grade, mistura | **Arquivo → Configurações do projeto…** |
| Desfazer / Refazer | `Ctrl+Z` / `Ctrl+Y` (ou `Ctrl+Shift+Z`) |
| Voltar vários passos | Aba **Histórico**: clique no passo |

O programa guarda rascunho sozinho. Ao fechar com mudança, ele pergunta.

**Tela de boas-vindas** (cena vazia): Abrir pasta · Importar PSD · Abrir o herói · Começar vazio.

---

## 3. Imagens e pivô

### Aba Imagens

| Quero | Faço |
|:---|:---|
| Pôr imagem na cena | Arraste da aba Imagens para a cena |
| Pôr imagem num slot | Arraste para a linha do slot, na Árvore |
| Achar imagem | Campo **Buscar imagem** |
| Recarregar depois do Photoshop | Botão **Recarregar a pasta** |
| Trocar a arte inteira por outra pasta | Botão **Trocar pasta de origem…** Usa os mesmos nomes de arquivo |
| Dobrar subpasta | Clique no nome da subpasta |
| Pasta numerada (`olho_01`…`olho_08`) vira animação de imagem | *Botão direito* na subpasta → **Trazer como sequência** |
| Opções da imagem | *Botão direito* na imagem: Usar no desenho escolhido · Definir pivô… · Copiar pivô · Colar pivô · Duplicar no atlas |

### Trocar a imagem de um desenho

| Quero | Faço |
|:---|:---|
| Trocar a imagem | *Botão direito* no desenho, na cena. Abre a grade. Clique na nova |
| Mesma coisa, pelo menu | **Esqueleto → Opções do desenho…** |
| Trocar em todas as peles | `Shift` + clique na grade. Ou **Esqueleto → Trocar imagem nas peles…** |
| Ver só as imagens que o slot já usou | Na grade, **fonte: objeto** (em vez de **pasta**) |
| Pôr uma entidade no lugar da imagem | Na grade, clique na entidade. Osso, pivô, ordem e chaves ficam |

Com animação aberta, trocar imagem **grava chave** de Desenho.

### Pivô (onde o osso segura a imagem)

| Quero | Faço |
|:---|:---|
| Definir o pivô | Aba **Pivôs**: clique na miniatura, depois clique na articulação na imagem grande |
| Pivô num canto ou no centro | Os **nove botões** da aba Pivôs |
| Mesmo pivô na pasta toda | Caixa **Repetir para a pasta** |
| Copiar pivô de uma imagem para outra | *Botão direito* na imagem → Copiar pivô / Colar pivô |
| Gravar os pivôs do personagem já montado | Aba Imagens → **Carimbar pivôs** |
| Tela arrumada para pivô | **Janela → Arranjos → Pivô** |

---

## 4. As ferramentas da cena

| Tecla | Ferramenta | Como usa |
|:---:|:---|:---|
| `T` | **Transformar** | Dentro: move · bolinha: gira · quadradinho do canto: escala · meio do lado: escala um eixo · `Alt` + meio do lado: inclina |
| `Q` | **Selecionar** | Clique escolhe · `Shift` soma · arrastar no vazio faz retângulo · `Alt` + clique de novo pega o de baixo |
| `W` | **Mover** | Arraste · `Shift` trava num eixo · `Ctrl` + arrastar clona (só na base) |
| `E` | **Girar** | Arraste · `Shift` de 15 em 15 graus |
| `R` | **Escalar** | Arraste · `Shift` mantém a proporção |
| `Z` | **Inclinar** | Arraste (precisa de osso) · `Shift` de 15 em 15 · `Alt` prende o eixo |
| `Y` | **Posar** | Arraste a ponta do osso: dobra a cadeia de 2 ossos · `Alt` vira o cotovelo. Não cria regra |
| `B` | **Criar osso** | Arraste. Com desenhos escolhidos, o osso pega os desenhos sem mover · `Ctrl` cria sem pegar · `Alt` sobre um osso redesenha sem mover os filhos |
| `O` | **Ponto** | `Alt` + arrastar cria · arrastar move · `Shift` + arrastar gira |
| `X` | **Caixa** (colisão) | `Alt` + arrastar desenha. Os cantos se editam com a Malha |
| `M` | **Malha** | Ver parte 13 |
| `G` | **Pesos** | Ver parte 13 |

### Gestos que valem sempre, na cena

| Quero | Faço |
|:---|:---|
| Zoom | Roda do mouse. Ou `Ctrl+=` e `Ctrl+−` |
| 100% | `Ctrl+0` |
| Ver tudo | `Ctrl+Shift+F` (Ajustar à tela) |
| Ir até o escolhido | `F` (Enquadrar seleção) |
| Mover a vista | `Espaço` + arrastar. Ou botão do meio |
| Tocar / pausar | `Espaço` apertado e solto |
| Andar 1 px / 10 px | Setas / `Shift` + setas |
| Voltar à ferramenta de antes | *Botão direito* fora de desenho |
| Opções do desenho | *Botão direito* em cima do desenho |
| Criar guia | Arraste a partir da régua. O Mover gruda nela |
| Apagar as guias | **Exibir → Limpar guias** |
| Eixos das alças | Lista **Eixos** na barra: Local · Pai · Mundo |
| Imagem atrás, para copiar por cima | **Exibir → Imagem de referência…** |
| Mexer no pai sem mexer no resto | **Esqueleto → Compensar**: Não mexer nos filhos / nos desenhos / nas caixas |
| Voltar o osso ao repouso | `Ctrl+1` · tudo: `Ctrl+Shift+1` |

---

## 5. Ossos e a Árvore

| Quero | Faço |
|:---|:---|
| Criar osso | Ferramenta **Criar osso** (`B`), arraste. Ou **Esqueleto → Novo → Osso** |
| Prender desenho num osso | Escolha os desenhos, e crie o osso por cima: ele pega sem mover |
| Virar filho | Escolha o osso pai, **segure `P`** e clique em quem vira filho. Vale na cena e na Árvore. Verde = já é filho |
| Virar filho arrastando | Na Árvore, arraste a linha para cima do osso |
| Soltar do osso | Na Árvore, arraste para o fim da lista (**Solte aqui para deixar solto**) |
| Trocar de pai no meio da animação | O mesmo gesto, com a animação aberta: **vira chave** |
| Renomear | `F2`, ou duplo clique no nome |
| Trocar pedaço de nome em vários | **Editar → Substituir nomes…** Tem prévia |
| Duplicar | `Ctrl+D`. O osso vem com filhos e desenhos |
| Apagar | `Delete` |
| Buscar | `Ctrl+F` |
| Escolher os filhos / os pais | `]` / `[` |
| Escolher tudo / nada / o contrário | `Ctrl+A` / `Esc` / `Ctrl+Shift+I` |
| Dobrar um osso na lista | Triângulo ao lado do nome |
| Esconder um item | O **olho** na linha |
| Travar um osso | O **cadeado** na linha |
| Criar coisa nova | Botão **Novo ▾** da Árvore: Osso · Regra… · Evento · Pele · Parâmetro |
| Menu da linha | *Botão direito*: Copiar/Colar posição no osso · Trocar a imagem em todas as peles… · Substituir nomes… · Renomear |

**Esqueleto → Novo** também cria: Imagem no slot… · Ponto · Caixa de colisão · Ponto neste slot · Caixa neste slot · Máscara · Regra… · Evento · Pele · Parâmetro · Variável · Etiqueta.

| Quero | Faço |
|:---|:---|
| Copiar onde o desenho fica no osso | **Editar → Copiar posição no osso**, escolha os outros, **Colar posição no osso** |
| Limpar slots sem desenho | **Esqueleto → Limpar desenhos vazios** |

---

## 6. Ordem de desenho (quem fica na frente)

| Quero | Faço |
|:---|:---|
| Um passo à frente / atrás | `Ctrl+↑` / `Ctrl+↓` (desenho escolhido). Ou `+` / `−` |
| Frente de tudo / fundo de tudo | `Ctrl+→` / `Ctrl+←` |
| Arrastar | Aba **Ordem**: arraste a linha |
| Juntar em pasta | Aba Ordem → **Nova pasta** |
| Tirar da pasta | **Tirar da pasta** |
| Renomear pasta | Duplo clique no nome da pasta |
| Pasta ficou em pedaços | Botão **Juntar**, no aviso |
| Mudar a ordem no meio da animação | O mesmo gesto, com a animação aberta: vira chave (aparece um `◆`) |
| A ordem de agora vale na animação toda | **Editar → Copiar a ordem na animação** |

---

## 7. Propriedades

Escolha uma coisa. A aba **Propriedades** mostra os campos dela.

| Escolhido | Campos |
|:---|:---|
| **Ficha rápida** (topo) | X · Y · Escala X · Escala Y · Ângulo (com disco de girar) · Alfa · Imagem |
| **Osso** | Nome · Comprimento · Cor e Ícone · Posição, Rotação, Escala, Inclinação · Herda rotação / escala / espelhamento · Peles que ativam |
| **Slot / desenho** | Nome · Osso · Anexo · Visível · Cor · Cor escura · Mistura (normal, aditiva, multiplicar, clarear) · posição e tamanho da imagem |
| **Máscara** | Recorta até · Só estes · Inverter · **Copiar a silhueta** de outro desenho |
| **Ponto** | Nome · Posição · Rotação |
| **Caixa** | Nome · cantos (edita com a Malha) |
| **Regra** | os campos da regra (parte 12) |
| **Virada de corpo** | caixa **A pilha de peles passa** |

| Truque no campo de número | |
|:---|:---|
| `↑` `↓` | um passo · `Shift` dez · `Alt` um décimo |
| Arrastar de lado no campo | muda o valor |
| Conta | aceita `10+5`, `100/3` |

---

## 8. Ver, esconder e travar

| Quero | Faço |
|:---|:---|
| Ver / esconder ossos | `7` |
| Travar ossos (o clique passa) | `8` |
| Ver / esconder desenhos | `9` |
| Travar desenhos | `0` |
| Esconder o escolhido | `H` |
| Só este, esconde o resto | `Shift+H` |
| Mostrar tudo | `Ctrl+Alt+3` |
| Ver só o resultado (limpo) | `Ctrl+Shift+H` |
| Travar o escolhido / o resto / destravar tudo | `Ctrl+2` / `Ctrl+Shift+2` / `Ctrl+Alt+2` |
| O resto das caixas | Aba **Exibição**, ou menu **Exibir**: Nomes dos ossos · Pontos · Caixas · Máscaras · Malhas · Arestas · Pesos · Grade · Réguas · Eixos · Guias · Nome ao passar o mouse |
| Cor do fundo da cena | Aba Exibição → **Cor do fundo** |
| Tema claro ou escuro | **Exibir → Tema** |

---

## 9. Corpos, animações e entidades

| Palavra | O que é |
|:---|:---|
| **Corpo** | um boneco, com a **base** dele (a pose de montagem) e as animações dele |
| **Base** | onde se monta. Mexer na base vale em todas as animações |
| **Entidade** | um boneco pendurado em outro: a espada, o fogo |

### Aba Animações

| Quero | Faço |
|:---|:---|
| Abrir a base de um corpo | Clique no corpo, na lista **Corpos**. Ou **Animação → Abrir a base** |
| Abrir uma animação | Clique no nome dela |
| Nova animação | Botão **Nova animação** |
| Duplicar · Renomear · Apagar | Botões da barra da aba |
| Escolher a que o jogo abre primeiro | **Mandar para o topo** (ganha a ★) |
| Corpo novo a partir da pose de agora | **Salvar como base nova** |
| Corpo vira entidade | **Rebaixar a entidade** |
| Entidade vira corpo | Aba **Entidades** → *botão direito* → **Promover a corpo** |
| O boneco vira outro no meio da animação (homem → lobisomem) | **Animação → Colar corpo aqui** |
| Animações prontas (parado, andar, correr, pular) | **Animação → Biblioteca de animações…** Pede ossos com os nomes do `humanoide-v1`. A janela diz o que falta antes |
| Levar animação para outro corpo | **Animação → Exportar animação…** e, no outro, **Importar animação…** |

### Entidades

| Quero | Faço |
|:---|:---|
| Pendurar uma entidade | Aba **Entidades**: arraste para a cena |
| Escolher a animação dela | Linha do tempo, grupo **Entidades**: *botão direito* na faixa |

---

## 10. Animar

**Regra de ouro: com a animação aberta, mexer já grava chave.** Não tem botão de gravar.

### O tocador

| Quero | Faço |
|:---|:---|
| Tocar / pausar | `Espaço` |
| Tocar para trás | `Shift+Espaço` |
| Início / fim | `Home` / `End` |
| Quadro anterior / seguinte | `←` / `→` (`Shift` = dez quadros). **Clique na linha do tempo antes**: na cena, as setas andam com o osso |
| Chave anterior / seguinte | `↑` / `↓`. Mesma coisa: foco na linha do tempo |
| Repetir (laço) | `L`. Fica gravado no arquivo |
| Velocidade | Barra **Velocidade**, de 10% a 200% |
| Ir a um tempo | Clique no campo **Tempo** e digite. Ou arraste na régua |
| Mudar a duração | Campo **Duração**. Para esticar as chaves junto: **Animação → Mudar duração…** |

### Chaves

| Quero | Faço |
|:---|:---|
| Gravar chave | Mexa no osso ou desenho. Pronto |
| Gravar sem mexer (proteger a pose) | **Chavear** `K` (só o escolhido) · **Chavear tudo** `Ctrl+K` |
| Escolher chave | Clique no losango · `Ctrl` soma · `Shift` tira · arrastar no vazio faz retângulo |
| Escolher todas de um tempo | Clique no losango da linha **Resumo** |
| Mover chave | Arraste o losango (`Alt` solta do quadro) |
| Clonar chave | `Ctrl` + arrastar |
| Apagar chave | `Delete`. Ou duplo clique no losango |
| Apagar a linha inteira | `Shift+Delete` |
| Limpar a animação | **Animação → Limpar a animação inteira…** |
| Copiar / colar / recortar | `Ctrl+C` / `Ctrl+V` / `Ctrl+X`. Com osso escolhido, leva o membro inteiro |
| Copiar a pose inteira | `Ctrl+Shift+C` |
| Copiar a pose só do escolhido | **Animação → Copiar a pose do escolhido** |
| Colar em todas as chaves | `Ctrl+Shift+V` |
| Colar espelhado (braço `_e` → `_d`) | **Animação → Colar espelhado** |
| Esticar ou encolher no tempo | Escolha 2+ chaves: puxe as alças do Resumo. Ou **Animação → Esticar seleção…** |
| Inverter a ordem | **Animação → Espelhar no tempo** |
| Fechar o ciclo (fim = começo) | **Animação → Fechar ciclo** |
| Trocar esquerda e direita | **Animação → Espelhar esquerda e direita…** |
| Abrir espaço no tempo | **Animação → Empurrar as chaves…** |
| Tirar chave que não muda nada | **Animação → Limpar chaves repetidas** |
| Ver as linhas uma a uma | Botão **Detalhes** |
| Opções de vez em quando | Botão **⋯ Mais**: No fim · Fator · Pares de nome · Mostrar só os escolhidos · Tirar trecho |

### Curva da chave (como vai de uma pose à outra)

| Quero | Faço |
|:---|:---|
| Linear · Suave · Parada | *Botão direito* no losango. Ou **Animação → Curva da chave** |
| Desenhar a curva | **Curva…** abre a aba **Curvas**. Arraste as alças |
| Formatos prontos | Aba Curvas: Suave · Entrada suave · Saída suave · Linear · Degrau · Passa do alvo |

### Marcas e trecho de laço

| Quero | Faço |
|:---|:---|
| Pôr ou tirar marca | `M` (foco na linha do tempo). Ou o botão `⚑` |
| Dar nome à marca | Duplo clique no triângulo dela |
| Pular de marca em marca | `Ctrl+↑` / `Ctrl+↓` (foco na linha do tempo) |
| Tocar só um trecho | `Alt` + clique na régua = começo · `Alt` + *botão direito* = fim. Ou os botões `[` e `]` |
| Tirar o trecho | **Animação → Trecho de laço → Tirar o trecho** |

### Casca de cebola (ver os quadros vizinhos)

| Quero | Faço |
|:---|:---|
| Ligar | Ícone `◍` no canto da régua. Ou **Exibir → Casca de cebola** |
| Opções | Botão `⋯` ao lado, ou **Exibir → Casca de cebola: opções…**: quadros antes e depois, passo, cores, silhueta, só nas chaves, deslocar |

### Imagem em sequência, eventos e som

| Quero | Faço |
|:---|:---|
| Chave de sequência de imagens | *Botão direito* no nome da linha **Desenho** → escolha como andar e os segundos por imagem |
| Criar evento | **Esqueleto → Novo → Evento** |
| Pôr o evento no tempo | Bloco **Chave de evento** (pé da linha do tempo) → **Chavear evento em…** |
| Dar som ao evento | No mesmo bloco: campos **Som** e **Pasta dos sons**. `▶` ouve |
| Volume e balanço | Campos do mesmo bloco, por chave |

---

## 11. Peles (trocar a roupa)

Aba **Peles**. Duas colunas: **Feitas** (todas) e **Ativas** (a pilha ligada; a de cima vence).

| Quero | Faço |
|:---|:---|
| Criar pele | **Nova pele**. O lápis já acende nela |
| Desenhar dentro de uma pele | Acenda o **lápis ✎** dela. O que nascer, nasce nela |
| Ligar uma pele | Arraste de Feitas para Ativas |
| Desligar | O `×` da linha, ou arraste de volta |
| Mudar quem vence | Arraste dentro de Ativas |
| Renomear | Duplo clique no nome |
| Duplicar · Apagar | Botões da barra |
| Fazer pele a partir de uma pasta de imagens | **Fazer a pele de uma pasta…** |
| Levar a pele para outro corpo | **Exportar pele…** e, no outro, **Importar pele…** |
| A pilha vira um corpo novo | **Promover pele a base…** |
| Osso que só existe com a pele | Propriedades do osso → **Peles que ativam** |
| Testar peles sem mexer no arquivo | Prévia em tela cheia (parte 14) |

---

## 12. Regras, física, variáveis

Aba **Regras**.

### As cinco regras

| Regra | O que faz |
|:---|:---|
| **Cinemática inversa (IK)** | os ossos dobram sozinhos para alcançar um alvo |
| **Transformação** | um osso copia posição, giro ou escala de outro |
| **Caminho** | os ossos deslizam por um caminho desenhado |
| **Física** | o osso balança sozinho: peso, vento, gravidade |
| **Comando** | um parâmetro (número de fora) mexe em outra coisa |

| Quero | Faço |
|:---|:---|
| Criar regra | **Nova regra** (ou **Esqueleto → Novo → Regra…**). A janela pergunta o tipo e os ossos |
| Ligar / desligar regra | O olho da linha |
| Força da regra | A barra da linha |
| Mexer nos detalhes | Clique na regra: os campos abrem em Propriedades |
| Mexer no alvo na cena | Ferramenta **Posar** (`Y`): arraste a alça da regra |
| Apagar regra | **Apagar regra** |

### Parâmetros

| Quero | Faço |
|:---|:---|
| Criar | **Novo parâmetro** |
| Testar o valor | A barra da linha dele |
| Ligar a um osso | Crie uma regra **comando** |

### Física

| Quero | Faço |
|:---|:---|
| Ver / parar o balanço na tela | **Simular a física** |
| Zerar o balanço | **Reiniciar esta física** · **Reiniciar todas as físicas** |
| Trocar a simulação por chaves | **Assar a física em chaves…** |

Também em **Esqueleto → Física**.

### Variáveis e etiquetas (o jogo lê)

| Quero | Faço |
|:---|:---|
| Criar variável | **Nova variável** |
| Criar etiqueta | **Nova etiqueta** |
| Etiqueta na animação inteira / a partir daqui | Botões **inteira** / **daqui**, na linha |
| Apagar variável | **Apagar variável** |
| Mostrar ou esconder a seção | **Esqueleto → Variáveis e etiquetas → Mostrar na aba Regras** |

---

## 13. Malha e pesos

Aba **Malha e pesos**. Escolha um desenho primeiro.

### Forma

| Quero | Faço |
|:---|:---|
| Imagem vira malha | **Virar malha** |
| Malha automática | **Gerar automática** |
| Só o contorno | **Traçar contorno** |
| Folga do contorno | Campo **Afastamento** |
| Criar vértice | `Ctrl` + clique na malha. Ou ligue **Criar vértice** e clique |
| Mover vértice | Ferramenta **Malha** (`M`): arraste |
| Apagar vértice | `Delete` |
| Ligar / desligar dois vértices | `L` / `K` |
| Mesma forma, outra imagem | **Avançado: malha ligada** → **Usar forma** |

Na base, mover vértice muda a forma. Com animação aberta, **grava chave**.
A ferramenta Malha também edita **caixa, máscara e caminho**.

### Pesos (quanto cada osso puxa)

| Quero | Faço |
|:---|:---|
| Dizer quais ossos puxam | **Ligar ossos**, e clique nos ossos (cena ou Árvore). Clique de novo no botão para terminar |
| Repartir sozinho | **Pesos automáticos** |
| Pintar | Ferramenta **Pesos** (`G`). Clique no nome do osso na lista, e pinte. `Alt` = pincel fraco |
| Trocar o osso pintado | Clique num osso fora da malha |
| Pincel | **Somar · Subtrair · Substituir · Suavizar**, com Raio e Força |
| Não deixar o pincel mexer num osso | Caixa **Travar** na linha dele |
| Alisar tudo | **Suavizar tudo** |
| Tirar peso muito pequeno | **Podar** |
| Tirar um osso da malha | **Tirar** na linha dele |
| Pesos mudam no meio da animação | **Chavear pesos** |
| Tirar todos os pesos | **Tirar pesos** |
| Ver os pesos | **Exibir → Pesos**. Cada vértice é uma pizza de cores |

---

## 14. Prévia (testar como no jogo)

| Quero | Faço |
|:---|:---|
| Tocar | `▶` · `■` para · `⏮` reinicia |
| Misturar animações | Cada **Camada** tem: Animação · Repetir · Velocidade · Quanto aparece · Mistura em segundos |
| Camada só em alguns ossos | Desmarque **Todos os ossos** e marque os que valem |
| Guardar a mistura como animação | **Copiar para a linha do tempo** |
| Tela cheia | Botão **Tela cheia** (`F11` com o foco na Prévia). `Esc` volta |
| Testar animações e peles | Na tela cheia: lista de animações à esquerda, peles à direita. Não mexe no arquivo |
| Tela arrumada para isso | **Janela → Arranjos → Visualização** |

---

## 15. Importar e exportar

### Importar

| De onde | Faço |
|:---|:---|
| Spriter, Spine, DragonBones | **Arquivo → Importar → De outro programa…** Uma janela lista o que não veio igual |
| Photoshop | **Arquivo → Importar → PSD…** Cada camada vira um desenho, no lugar |
| Photoshop com ossos | **Arquivo → Importar → PSD com ossos…** Desenhe linhas numa camada chamada `ossos`: cada linha vira um osso |
| Qualquer um | Solte o arquivo na janela |

### Exportar

| Para quê | Faço |
|:---|:---|
| GIF, PNG em sequência, folha de sprites, vídeo WebM | **Arquivo → Exportar → Imagem…** Opções: animação, de/até, quadros por segundo, escala, fundo, recorte, desenhar ossos |
| Arquivo menor, só com algumas peles e animações | **Arquivo → Exportar → Por pele…** |
| Programas 3D e engines | **Arquivo → Exportar → glTF…** Um corpo por vez. A janela diz o que o glTF não guarda |
| Repetir com as mesmas opções | `Ctrl+Shift+E` |
| Para o jogo | **Entregar um corpo…** (parte 2) |

MP4 não sai do programa. A janela final dá o comando do ffmpeg.

---

## 16. Arrumar a tela e o programa

A arrumação fica **na sua máquina**, nunca dentro do `.bone`.

| Quero | Faço |
|:---|:---|
| Esconder todos os painéis | `Tab` |
| Abrir ou fechar um painel | Menu **Janela**: clique no nome. Fechado volta no mesmo lugar |
| Fechar painel | O `×` da aba |
| Fechar o grupo | *Botão direito* no vão da tira de abas. Ou **Janela → Fechar o grupo** |
| Recolher o grupo | O `▾` no fim da tira de abas |
| Mudar a aba de lugar | Arraste a aba. A barra azul mostra onde entra |
| Mandar para a outra coluna | *Botão direito* na aba. Ou **Janela → Mover para a outra coluna** |
| Painel flutuando | Arraste a aba para fora. Perto de uma quina da cena, ele gruda nela |
| Colar de volta | Arraste a barra dele até uma tira de abas |
| Altura dos grupos | Arraste a alça entre eles. Dois cliques voltam ao automático |
| Abrir as linhas da linha do tempo | **Janela → Detalhes da linha do tempo** |
| Guardar a tela com nome | **Janela → Arranjos → Guardar este arranjo…** (até 12) |
| Apagar um arranjo | **Janela → Arranjos → Apagar um arranjo…** |
| Voltar tudo ao de fábrica | **Janela → Voltar ao padrão** |
| Nome ao lado do ícone das ferramentas | **Exibir → Mostrar nome das ferramentas** |
| Ver todas as teclas | **Ajuda → Atalhos do teclado** (`Shift+F1`) |
| **Trocar uma tecla** | Na mesma janela: clique no **lápis** da linha e aperte a tecla nova. A seta desfaz. Se a tecla já tem dono, ele recusa e diz de quem é |
| Ver o que o programa não entendeu no arquivo | **Ajuda → Problemas do arquivo…** Ou o botão de avisos no rodapé. Tem **Ir para** e, onde dá, o conserto |
| Manual antigo | `F1` |

---

## 17. Todas as teclas

### Ferramentas

| `T` | `Q` | `W` | `E` | `R` | `Z` |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Transformar | Selecionar | Mover | Girar | Escalar | Inclinar |

| `Y` | `B` | `O` | `X` | `M` | `G` |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Posar | Criar osso | Ponto | Caixa | Malha | Pesos |

### Arquivo e editar

| Tecla | Faz | Tecla | Faz |
|:---|:---|:---|:---|
| `Ctrl+N` | Novo projeto | `Ctrl+C` / `Ctrl+V` | Copiar / Colar |
| `Ctrl+O` | Abrir | `Ctrl+X` | Recortar chaves |
| `Ctrl+S` | Salvar | `Ctrl+D` | Duplicar |
| `Ctrl+Shift+S` | Salvar como | `Delete` | Apagar |
| `Ctrl+Shift+E` | Repetir exportação | `F2` | Renomear |
| `Ctrl+Z` | Desfazer | `Ctrl+A` | Selecionar tudo |
| `Ctrl+Y` ou `Ctrl+Shift+Z` | Refazer | `Esc` | Desmarcar |
| `Ctrl+F` | Buscar na Árvore | `Ctrl+Shift+I` | Inverter a seleção |
| `]` / `[` | Escolher filhos / pais | `P` segurado + clique | Virar filho |

### Ver

| Tecla | Faz | Tecla | Faz |
|:---|:---|:---|:---|
| `7` / `8` | Ver / Travar ossos | `H` | Esconder o escolhido |
| `9` / `0` | Ver / Travar desenhos | `Shift+H` | Só este |
| `Ctrl+=` / `Ctrl+−` | Aproximar / Afastar | `Ctrl+Alt+3` | Mostrar tudo |
| `Ctrl+0` | 100% | `Ctrl+Shift+H` | Ver só o resultado |
| `Ctrl+Shift+F` | Ajustar à tela | `Tab` | Esconder painéis |
| `F` | Enquadrar seleção | `F11` | Prévia em tela cheia |
| `Ctrl+2` | Travar o escolhido | `Ctrl+Shift+2` | Travar o resto |
| `Ctrl+Alt+2` | Destravar tudo | `Ctrl+1` / `Ctrl+Shift+1` | Repouso: osso / tudo |

### Cena

| Tecla | Faz |
|:---|:---|
| `Espaço` + arrastar | Mover a vista |
| Setas · `Shift` + setas | Andar 1 px · 10 px |
| `Ctrl+↑` / `Ctrl+↓` | Frente / trás (desenho escolhido) |
| `Ctrl+→` / `Ctrl+←` | Frente de tudo / fundo de tudo |
| `+` / `−` | Frente / trás |

### Animação

| Tecla | Faz | Tecla | Faz |
|:---|:---|:---|:---|
| `Espaço` | Tocar / pausar | `K` | Chavear |
| `Shift+Espaço` | Tocar para trás | `Ctrl+K` | Chavear tudo |
| `Home` / `End` | Início / fim | `L` | Repetir |
| `←` / `→` | Quadro anterior / seguinte | `M` | Marca (foco na linha do tempo) |
| `Shift+←` / `Shift+→` | Dez quadros | `Ctrl+↑` / `Ctrl+↓` | Marca anterior / seguinte (foco na linha do tempo) |
| `↑` / `↓` | Chave anterior / seguinte | `Ctrl+Shift+C` | Copiar a pose inteira |
| `Shift+↑` / `Shift+↓` | Chave do escolhido | `Ctrl+Shift+V` | Colar em todas as chaves |
| `Delete` | Apagar chaves | `Shift+Delete` | Apagar as linhas |

### Malha

| `Ctrl` + clique | `Delete` | `L` | `K` |
|:---:|:---:|:---:|:---:|
| Criar vértice | Apagar vértice | Ligar aresta | Desligar aresta |

### Ajuda

| `F1` | `Shift+F1` | `Ctrl+Shift+P` |
|:---:|:---:|:---:|
| Manual | Atalhos (e trocar teclas) | Paleta de comandos |

**Atenção:** `Ctrl+↑` e `Ctrl+↓` fazem duas coisas. Com o foco na **cena** e um desenho escolhido: ordem. Com o foco na **linha do tempo**: marcas.

---

## 18. O que ainda não tem porta

Achado lendo o código. Não é defeito do manual: é o programa.

| O quê | Situação |
|:---|:---|
| Trocar os ossos de uma IK depois de criada | o comando existe, nenhum botão chama. Hoje: apagar e criar de novo |
| Apagar ou renomear uma **etiqueta** | idem |
| Tirar a chave de **virada de corpo** | idem |
| Gravar chave do alvo de um parâmetro | idem |
| Mover ou apagar **uma guia só** | não achei gesto. Só **Limpar guias**, que apaga todas |
| Alinhar pela guia do PSD | o leitor de PSD lê as guias; o editor não usa |
| Soltar uma **pasta** na janela | não achei. Use **Abrir pasta do projeto…** |
| Esqueleto filho pelo menu Novo | saiu do menu. Entra arrastando da aba **Entidades** |

Os quatro primeiros estão em `documentos/pesquisa/O QUE O CODIGO TEM E O MENU NAO 2026-09-18.md`.

---

## 19. A conferência de 19/09/2026

Abri o editor (o de desenvolvimento, com o código de hoje), carreguei o herói e testei.
A janela do Claude estava escondida: não pude ver a tela, então mandei os gestos e **li o resultado dentro do arquivo**.

### Existe e funcionou

| O quê | Como conferi |
|:---|:---|
| Os 7 menus, item por item (cerca de 190) | li o menu na tela: todo item do manual está lá, com a mesma tecla |
| Os botões das abas e da barra (cerca de 170) | li as dicas na tela: batem com o manual |
| Letras das ferramentas `T W E B Y G` | apertei, a ferramenta trocou |
| Criar osso arrastando · `Ctrl+D` · `Delete` · `Ctrl+Z` · `Ctrl+Y` | contei os ossos antes e depois |
| Na base, mexer grava na base. Na animação, **mexer grava chave** | girei um osso nos dois casos; o rodapé e o arquivo confirmam |
| `K` · `Ctrl+K` · `L` · `Home` · `End` | o arquivo e o tempo mudaram |
| Na linha do tempo: `←` `→` · `Shift+→` · `↑` `↓` · `M` · `Ctrl+↑` `Ctrl+↓` | o tempo andou certo: quadro, dez quadros, chave, marca |
| `7` `8` `9` `0` | a marca no menu ligou e desligou |
| `Ctrl+↑` `Ctrl+→` `Ctrl+←` na ordem | o desenho andou 1 casa, foi ao topo, foi ao fundo |
| Setas e `Shift` + setas | o osso andou 1 e 10 |
| Escolher filhos `]` · pais `[` · tudo · inverter · desmarcar | conferi a seleção |
| Esconder · Só este · Mostrar tudo · Ver só o resultado | o rodapé confirmou |
| `Tab` · Tema · Arranjo Pivô · Voltar ao padrão | as colunas sumiram e voltaram; o rodapé confirmou |
| Rascunho automático e a janela de recuperar | apareceu sozinha ao recarregar |
| Janelas: Preferências · Configurações do projeto · Atalhos (com o lápis) · Paleta · Problemas · Substituir nomes · Imagem de referência · Exportar imagem · Por pele · Biblioteca · Guardar arranjo · Mudar duração · Colar corpo · Nova regra | abriram, com os campos que o manual diz |
| Esticar, Empurrar, Espelhar lados sem chave escolhida | não fazem nada e **avisam no rodapé** o que falta |

### Não deu para testar

| O quê | Por quê |
|:---|:---|
| **Tocar** (`Espaço`) e a Prévia | com a janela escondida o navegador não desenha quadro nenhum |
| A **grade de trocar imagem** (botão direito no desenho) | ela abre no próximo quadro desenhado. Mesmo motivo |
| Abrir, Salvar, Importar, Exportar, Entregar | o seletor de arquivo do Windows só abre com clique de gente |
| Arrastar aba, flutuar, colar na quina, arrastar pele, pintar pesos, editar malha | são gestos finos de mouse. Não forcei |
| Trocar uma tecla pelo lápis | a janela e o lápis existem; não apertei para não mudar suas teclas |

Esses continuam valendo **só pelo código**. Quando você usar e um deles falhar, me diga qual.

### Os três defeitos

Estão no quadro **Cuidado**, no começo. Vi cada um falhar, e vi o estado limpo antes.

| # | A forma do erro |
|:---:|:---|
| 1 | O desfazer do **Duplicar** troca a lista de ossos por uma cópia. O desfazer do **Criar osso**, que vem depois, procura o osso dele e não acha mais |
| 2 | **Regra…** e **Pele** chamam o item do menu Janela para "trazer a aba à frente". Mas esse item virou **interruptor** em 13/09: com a aba já na frente, ele **fecha** |
| 3 | **Chavear tudo** põe uma chave no meio de um trecho curvo e não reparte a curva: as alças ficam fora do trecho novo |

Não consertei nada: código não é a minha parte. Avisei o Planejador.
