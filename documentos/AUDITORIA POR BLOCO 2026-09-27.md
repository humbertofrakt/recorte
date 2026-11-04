# Auditoria por bloco — o que o programa tem, faz e não tem — 2026-09-27

Escrito à mão, lendo o código, a pedido do Humberto: *"eu não sei exatamente o
que tem e como está organizado"*. Não é gerado — pode ficar velho. Se o
programa mudar muito, peça um refazimento.

**As três folhas irmãs, para o detalhe:**

| Pergunta | Onde | Como é feita |
|:---|:---|:---|
| Qual o caminho de clique de uma tarefa? | `documentos/O QUE O PROGRAMA FAZ 2026-09-22.md` | `npm run tarefas`, do código |
| O que o programa sabe fazer e não tem botão? | `documentos/O QUE NAO TEM PORTA 2026-09-22.md` | `npm run portas`, do código |
| **O que cada parte TEM, por dentro?** | **este arquivo** | lido à mão, por 10 chats em paralelo |

Cada bloco abaixo tem três perguntas: **o que tem** (os tipos de coisa que
moram ali), **o que dá para fazer** (resumido — o caminho de clique exato está
na folha de tarefas), **o que falta** (visto no código: pendência, decisão
parada, limitação conhecida).

---

## 1. Árvore

A lista de ossos e desenhos — uma árvore só, o osso com os desenhos dele
embaixo, depois os filhos.

**O que tem**
- Linha de **osso** — ícone de osso; avisa "por chave" quando o pai de agora
  vem de uma chave de animação; a raiz aparece como "raiz" se estiver
  escondida.
- Linha de **slot/desenho**, com a miniatura da imagem na pele em edição.
  Fica cinza ("vazio") sem imagem nesta pele. Ponto, caixa, máscara, malha e
  emissor de partícula são o MESMO tipo de linha (slot), só o ícone muda.
- Ícone de engrenagem no osso que tem regra (aponta para Regras); losango no
  osso que só existe numa pele.
- Cadeado e olho por linha (trava/esconde só aquele item).
- **Regra e pele não viram linha aqui** — moram nas abas Regras e Peles.
- **Evento e Parâmetro nascem pelo "Novo ▾" da Árvore, mas não viram linha
  nenhuma** — depois de criados, não há onde vê-los ali.
- Não existe pasta (agrupamento livre) na Árvore — só a hierarquia de ossos.

**O que dá para fazer**
- Criar osso, ponto (solto ou preso a um desenho), caixa (solta ou presa),
  máscara, evento, parâmetro, emissor de partículas; virar filho de (P);
  renomear (F2 ou duplo clique); substituir nomes em lote; duplicar; apagar;
  buscar (Ctrl+F, abre o caminho até o achado); selecionar tudo/inverter/
  filhos/pais; copiar e colar posição no osso; limpar desenhos vazios; voltar
  à pose de repouso (um osso ou tudo); compensar ao mover (não arrastar
  filhos/desenhos/caixas); eixo das alças (local/pai/mundo); travar/destravar.
- Arrastar um slot sobre outro muda a ordem de desenho, direto na Árvore.
- Arrastar um osso sobre um descendente TROCA os dois de lugar, em vez de
  recusar.
- Soltar no vazio do fim da lista tira o pai (fica solto), sem mover no mundo.
- Arrastar uma imagem do painel Imagens direto para uma linha: cria o
  desenho (slot vazio) ou troca a imagem (slot ocupado).
- Segurando P, clicar na Árvore vale como clicar na cena. No modo Ligar
  (malha) ou nas ferramentas Malha/Pesos, clicar num osso na Árvore troca só
  o osso, mantém o resto da seleção.
- A dobra de cada osso fica guardada no navegador (não no `.bone`).

**O que falta**
- Evento e Parâmetro sem linha na Árvore depois de criados (acima).
- Resto antigo em `doc/commands.ts` (`RemoveBone` :531, `RemoveSlot` :550,
  `RenameNode` :677) — código morto, substituído por `DeleteItems`/
  `RenameItem`. Não atrapalha, mas está para trás.

---

## 2. Ordem de desenho

Quem fica na frente de quem, entre os desenhos.

**O que tem**
- Lista de cima para baixo: o de cima é quem desenha por CIMA.
- Só slots que desenham (região, malha, malha ligada, esqueleto aninhado) —
  caixa, ponto, caminho e máscara não aparecem aqui, ficam só na Árvore.
- Slot sem imagem nesta pele entra apagado, com aviso, sem sumir da lista.
- Pastas: agrupam peças vizinhas com o mesmo `folder`; fechada vira uma linha
  só; se uma peça de fora cai no meio, a pasta fica "quebrada" com aviso e
  botão **Juntar**.
- Em Animando, mostra a ordem posada do quadro atual (lida da chave); quem
  saiu do lugar de Montagem por uma chave ganha um losango (◆) na linha.

**O que dá para fazer**
- Trazer/mandar um passo (+/−, Ctrl+setas na cena ou na aba), frente/fundo de
  tudo, nova pasta, tirar da pasta, copiar a ordem de agora para toda a
  animação (grava em TODAS as chaves de ordem já existentes, e na de tempo 0).
- Arrastar uma linha (peça ou pasta inteira) para reordenar — soltar no terço
  de cima/baixo insere antes/depois, no meio troca de lugar.
- Botão direito: pôr numa pasta, tirar da pasta, renomear a pasta. Duplo
  clique no nome da pasta renomeia. Clique na cabeça dobra/abre.
- A janela "Pôr numa pasta" mostra ANTES quantas peças vão mudar.

**O que falta**
- Nada incompleto encontrado. Único ponto sem aviso: renomear uma pasta para
  o nome de outra já existente FUNDE as duas sem avisar
  (`draw-order-model.ts:495-496`).

---

## 3. Cena e ferramentas

O palco onde o boneco é desenhado e mexido, e a barra de ferramentas.

**O que tem, desenhado ali**
- Fundo, imagem de referência (opacidade e escala, guardada na máquina, não
  no `.bone`), grade (passo automático conforme o zoom), eixos, réguas,
  guias (travável, imã de 6px), papel de cebola (fantasmas antes/depois, por
  passo ou só nas chaves, traço ou silhueta, cor e deslocamento próprios).
- O esqueleto de verdade — o MESMO desenhista do jogo, então o editor mostra
  exatamente o que o jogo mostraria.
- Ossos (cor própria, anel tracejado se só existe numa pele, apagado se
  travado), contorno do escolhido, caixas, máscaras (tracejada), pontos,
  aviso de emissor de partículas (não desenha nada sozinho — só um anel),
  retângulo da área de exportação, cruz de onde a imagem solta vai cair,
  etiqueta com o nome do que está sob o mouse.

**O que dá para fazer, por ferramenta**
- **Selecionar (Q)**: clique escolhe, Alt+clique cicla sobrepostos, arrastar
  faz caixa (Shift soma/Ctrl tira), Esc limpa; segurar P entra no gesto
  "pegar filhos".
- **Transformar (T)**: um botão faz tudo — mover dentro, girar na bolinha,
  escalar no quadrado, Alt+meio do lado inclina.
- **Mover/Girar/Escalar (W/E/R)**: eixo local/pai/mundo, Shift encaixa
  ângulo ou mantém proporção, funciona em grupo e em desenho solto sem osso.
- **Inclinar/Shear (Z)**: só com osso escolhido (o anexo não tem esse campo
  no formato); Shift encaixa 15°, Alt trava um eixo.
- **Criar osso (B)**: arrasto define raiz/ângulo/tamanho; pega os desenhos
  escolhidos sem mover; Alt+arrasto num osso já escolhido REDESENHA ele
  mantendo os filhos no lugar.
- **Ponto (O)** e **Caixa (X)**: Alt+arrasto cria.
- **Posar/IK (Y)**: arrastar a ponta de uma cadeia de 1-2 ossos dobra para
  alcançar, sem criar regra nenhuma — é só um teste de pose.
- **Malha (M)** e **Pesos (G)**: ver bloco 7.

**O que falta**
- **Inclinar não compensa** — diferente de Mover/Girar/Escalar, sempre
  arrasta filhos/desenhos/caixas junto, mesmo com "Não mexer..." ligado
  (`viewport/tools/shear.ts` não usa `compensate.ts`).
- Compensação de escala não-uniforme é aproximada para região/ponto —
  limite do formato, documentado no código como "o mesmo limite do Spine".

---

## 4. Linha do tempo

As chaves, o tempo, as curvas, as marcas e o trecho de laço.

**O que tem (o que pode ganhar chave)**
- Osso: posição, rotação, escala, inclinação (numéricas); pai, herança
  (paradas).
- Slot: desenho mostrado, cor, cor escura, visível, osso do desenho.
- Regra: força e todos os campos próprios dela (dobra, inércia, mola,
  vento, gravidade...), e "reiniciar física" (dispara, sem valor).
- Malha (deformação) e pesos — uma curva só para o vetor inteiro.
- Sequência de imagem, ordem de desenho, etiqueta, evento (som/número/texto),
  virada de corpo (troca de boneco no meio da animação), parâmetro, variável,
  animação de entidade aninhada.

**O que dá para fazer**
- Tocar/pausar/para trás, ir a início/fim/quadro/chave (geral ou só do
  escolhido), repetir em laço, chavear (K/Ctrl+K), apagar chave/linha,
  limpar animação, copiar/colar/recortar chaves, copiar/colar pose inteira,
  colar espelhado, esticar seleção no tempo, espelhar, fechar ciclo, empurrar
  chaves (só por número, sem arrastar — decisão deixada para o Humberto),
  limpar chaves repetidas, curva da chave (linear/suave/parada/desenhada),
  efeitos (flash/pulso/tremor), marca (M), trecho de laço.
- Arrastar o losango: Ctrl clona, Shift no clique tira sem arrastar, Alt
  solta do encaixe de quadro. Botão direito muda a curva de várias de vez.
  Duplo clique apaga uma só.
- Painel Curvas separado: arrastar a chave e as duas alças da Bézier.

**O que falta**
- Empurrar chaves só por caixa de número, sem gesto de arrastar (decisão
  deixada para o Humberto, `anim/keying.ts:1350`).
- Onda de áudio das chaves de evento não é desenhada — só lista de texto.
- Balanço (pan) do som não toca de verdade na pré-escuta — sempre no centro.
- Malha e Pesos não aparecem no painel Curvas (de propósito).
- Só um trecho de laço por animação; marcas só têm nome, sem cor/categoria.

---

## 5. Animações e prévia

A lista de corpos e animações de cada um; o painel que toca como no jogo.

**O que tem**
- Lista de **Corpos**, cada um com as próprias animações; seção "De fora"
  para animação citada de outro arquivo (só leitura).
- **Prévia**: um palco à parte (não mexe na cena real), até 4 camadas
  misturadas ao vivo (animação, repetir, velocidade, peso, mistura em
  segundos, máscara de ossos); tela cheia com lista de animações e peles
  (trocar ali é só teste).
- Chave de **virada de corpo** (`anim/body.ts`): grava quando o boneco muda
  (o homem vira lobisomem), corte seco, com opção de levar a pilha de peles
  ou não.

**O que dá para fazer**
- Abrir a base, nova/duplicar/renomear/apagar animação, mandar para o topo
  (ordem que o jogo abre primeiro), biblioteca de animações prontas
  (parado/andar/correr/pular), exportar/importar animação entre bonecos,
  colar corpo aqui, abrir outro corpo/entidade, entregar um corpo, salvar a
  entidade editada.
- Fila "terminar a atual antes" de trocar de animação tocando.
- Mistura automática (crossfade) ao trocar de animação tocando.
- "Copiar para a linha do tempo": grava a mistura das camadas da Prévia como
  animação nova (uma chave por quadro).

**O que falta**
- O tocador de verdade não mora mais nesta aba — foi para a linha do tempo;
  esta aba só lista.
- A Prévia é sempre um esqueleto à parte — não dá para "tocar no boneco
  real" de dentro da janela Animações.

---

## 6. Imagens e pasta

A pasta de arte do projeto.

**O que tem**
- Busca por nome; linha da pasta (nome, contagem, Abrir/Recarregar/Trocar
  origem); lista por subpasta, dobrável; miniatura com cruz laranja se já
  tem pivô carimbado; contador de uso por imagem (esmaece sem uso); imagem
  que sumiu do disco mas ainda é usada fica marcada, sem desaparecer.
- Avisos: pivôs conflitantes (com botão "Duplicar no atlas"), troca em
  todas as peles armada (com cancelar).

**O que dá para fazer**
- Botão direito: usar no desenho escolhido, definir/copiar/colar pivô,
  duplicar no atlas. No cabeçalho da subpasta: "Trazer como sequência" (nomes
  numerados viram sequência já na cena).
- Trocar pasta de origem (troca o acervo por nome de arquivo, avisa
  ambíguos); Recarregar (diz o que mudou); Carimbar pivôs; Definir pivô
  (clique ou grade de 9 pontos, com "repetir para a pasta").
- Na grade de troca da cena: trocar em todas as peles, trocar por entidade
  inteira, escolher a fonte da grade.

**O que falta**
- Pasta aberta sem `showDirectoryPicker` (navegador mais antigo) não
  recarrega nem grava sozinha — avisa a limitação.
- Sem permissão de escrita, o atlas não vai para a pasta — baixa à parte
  (limitação do navegador, com aviso).
- Só reconhece PNG/WEBP/JPG/JPEG/GIF/BMP.
- Nome de arquivo ambíguo ao trocar pasta de origem fica sem resolver até o
  Humberto renomear algo na origem.
- Janela de pivô: só clique, sem ajuste fino por teclado.

---

## 7. Malha e pesos

Deformar a imagem por vértices; pintar quanto cada osso puxa cada vértice.
**Não aparece na folha de tarefas** — tudo aqui é botão dentro do painel.

**O que tem**
- Contorno: vértices, arestas, triângulos, quantos vértices são a borda.
- Pesos por osso: tabela osso→peso por vértice; cada vértice é uma "pizza"
  (fatia colorida por osso influente).
- Edita 4 tipos, não só malha: malha, caixa em polígono, máscara e caminho.
- Malha ligada: empresta a forma de outra malha do mesmo slot, sem copiar.
- Regra dos dois modos: forma/pesos/ossos sempre vão para a base; só
  arrastar vértice com animação aberta grava chave de deformação.

**O que dá para fazer**
- Virar malha, gerar automática/traçar contorno (com afastamento ajustável,
  nasce 2px longe da arte), criar vértice, criar/apagar aresta (um botão só,
  L/K), apagar vértice, usar a forma de outra malha, ligar ossos (clique na
  cena ou na Árvore, lista com % e travar), pesos automáticos, suavizar
  tudo, podar (corta pesos abaixo de 2%), chavear pesos (F9), tirar pesos.
- Pincel de pesos: somar/subtrair/substituir/suavizar, raio e força.
- Entra sozinho no modo Malha ao abrir uma malha nova.

**O que falta**
- Caminho (path) não ganha/perde ponto pela cena — sem porta ainda.
- Caixa em retângulo/elipse não entra aqui — só a de polígono; a outra edita
  pela ficha.
- Mudar a forma de uma malha que já tem chaves de deformação não realoca as
  chaves — só avisa quantas ficam "na parte errada".
- Altura do painel: faltam ~150px (1440×900) a ~450px (1280×720), mesmo
  com o vizinho fechado — decisão pendente do Humberto (nome mais curto,
  coluna mais larga, ou a aba rolar).

---

## 8. Pivôs

Onde o osso segura a imagem. **É um painel separado da Malha** — os dois não
se tocam no código. O clique e a grade de 9 pontos ficam descritos no bloco 6
(Imagens), porque é onde o diálogo de pivô foi lido. Não houve tempo de
auditar o painel "Pivôs" (`ui/menus.ts` → Janela → Pivôs) por dentro nesta
rodada — fica em aberto para uma próxima.

---

## 9. Propriedades

A ficha do que está escolhido.

**O que tem**
- Ficha rápida no topo: X, Y, escala, ângulo (disco), alfa.
- Campo Imagem com miniatura (clique troca).
- Bloco Compensar (mover/girar/escalar/transformar).
- Grupos de campos conforme o tipo escolhido: texto, número (arrasto lateral
  + setas), checkbox, lista de marcação, seletor, cor+alfa.
- "Usar a silhueta de..." para máscara — copia contorno de outro desenho.
- Ficha da chave de evento e da virada de corpo.

**O que dá para fazer**
- Arrastar o número lateralmente muda o valor; setas ↑/↓ andam 1 passo
  (Shift=10x, Alt=0,1x). Nos dois modos: campo grava pose de repouso ou cria
  chave, conforme o campo anima ou não.

**O que falta**
- Nada encontrado.

---

## 10. Exibição

As caixas de ver, travar e a "cena".

**O que tem**
- Tabela Ver/Travar/Nome para ossos, desenhos, pontos, caixas, máscaras,
  malhas. Grupo "A cena": arestas, pesos, grade, réguas, eixos, guias,
  travar guias, cor de fundo. Papel de cebola (a lista de números — a caixa
  fica na régua da linha do tempo).
- Esconder escolhido, só este, mostrar tudo, travar escolhido/resto,
  destravar tudo, ver só resultado, nome ao passar o mouse, voltar ao padrão.
- Guardado no próprio `.bone` (com reserva na máquina) — sobrevive a reabrir.

**O que falta**
- `skinGroup()` (linhas 512-564 de `view-panel.ts`) é código morto — a
  função de peles saiu daqui para a aba Peles e ficou uma sobra sem chamada.
  Não é porta faltando, é limpeza pendente.

---

## 11. Peles

As roupas do boneco.

**O que tem**
- Duas colunas: Feitas / Ativas (a pilha) — arrastar liga, desliga, reordena.
- Lápis: escolhe onde nasce desenho/osso/regra novo.
- Avisa peles "perdidas" (citadas mas o arquivo não tem mais) e peles "de
  fora" (importadas — bloqueia apagar/renomear nelas).

**O que dá para fazer**
- Nova, duplicar, fazer de uma pasta, importar, exportar, promover a base,
  apagar (com confirmação e contagem de slots afetados), renomear (duplo
  clique). Soltar no vazio da coluna Ativas liga no topo; zona no fundo
  liga embaixo da pilha.

**O que falta**
- Nada encontrado — as 3 ações do arquivo de ações todas têm botão.

---

## 12. Regras

O que se mexe sozinho: física, IK, variáveis, etiquetas.

**O que tem**
- Lista de regras com ícone por tipo (IK, Transformar, Caminho, Física,
  Comando), força em barra, olho (liga/desliga sem apagar o valor).
- Parâmetros (lista com barra do valor padrão), Física (simular, reiniciar
  uma/todas, assar em chaves), Variáveis, Etiquetas — seção que se pode
  esconder inteira (sempre avisando quantas ficam escondidas).
- Linha fica vermelha com a frase do problema quando o alvo dela sumiu
  (osso apagado, por exemplo).

**O que dá para fazer**
- Nova regra (janela guiada em 2 passos), apagar; novo/apagar parâmetro;
  simular física; nova/apagar variável; nova etiqueta (com "vale a animação
  inteira" ou "vale a partir daqui").
- Regra Comando já nasce "mandando" (com alvo e propriedade escolhidos).

**O que falta — os 4 sem porta confirmados no código**
- **SetRuleChain** (`rules-model.ts:487`) — trocar a cadeia de ossos de uma
  IK já criada. Hoje só dá para apagar e criar outra.
- **KeyDriverTarget** (`rules-model.ts:850`) — gravar a chave de alvo do
  Comando no valor atual do parâmetro.
- **DeleteTag** e **RenameTag** (`rules-vars.ts:415` e `:451`) — a aba cria
  etiqueta mas não apaga nem renomeia.
- Todas as quatro: decisão pendente, subida ao Planejador em 21/09.

---

## 13. Histórico

Voltar vários passos de uma vez.

**O que tem**
- Uma linha por passo, com o nome que o próprio comando carrega. Linha
  atual marcada (●), desfeitas em cinza (○). Rola sozinho até o mais recente.

**O que dá para fazer**
- Clicar numa linha volta ou avança até ela.

**O que falta**
- Nada marcado como pendência — é um painel pequeno de propósito, sem busca
  nem agrupamento.

---

## 14. Arquivo, exportar e importar

**O que tem — formatos que lê**
- `.bone`, `.boneb` (binário), `.bonez` (zip com atlas), `.atlas.json`,
  imagens soltas (PNG/WEBP/JPG/JPEG/GIF/BMP), pasta de imagens, PSD/PSB (com
  ou sem camada de ossos), folha do Aseprite, projetos de Spine/DragonBones/
  Spriter, pele ou animação avulsa (por referência, não copiada), biblioteca
  de animações de fábrica, manifesto de projeto com vários corpos/entidades.

**O que tem — formatos que escreve**
- `.bone`, `.boneb`, `.bonez`, `.atlas.json` + páginas PNG, glTF (`.glb` e
  `.gltf`), exportar por pele, exportar animação, exportar imagem (PNG em
  sequência, spritesheet, GIF, vídeo WebM), entregar um corpo.

**O que dá para fazer**
- Importar PSD detecta camada de ossos sozinho; importar entra AO LADO dos
  atlas existentes (não substitui); detecta o formato de outro programa pelo
  CONTEÚDO, não pela extensão; "trocar a pasta de origem" troca o acervo por
  nome de arquivo; exportar imagem recorta por área da animação ou por
  trecho; "repetir última exportação" (Ctrl+Shift+E) guardado por tipo;
  arrastar arquivo para a janela decide sozinho o que fazer com ele.

**O que falta**
- Importar imagens direto da pasta ainda não é um passo de desfazer de
  verdade (`io/import-images.ts:356`, decisão pendente desde 21/09) — só o
  PSD tem esse cuidado.
- Não existe exportar DE VOLTA para Spine/DragonBones/Spriter — só importar.
- glTF com troca de corpo no meio da animação exporta só o corpo do começo
  ao fim; a troca vira aviso, nunca é representada (decisão documentada).
- MP4/AVI não saem do editor — sempre sugere a linha de comando do ffmpeg.

---

## 15. Casca, menus e ajuda

A moldura do programa.

**O que tem**
- 7 menus (Arquivo, Editar, Exibir, Esqueleto, Animação, Janela, Ajuda),
  todos gerados de uma fonte única que também alimenta a tabela de teclas e
  a paleta de comandos.
- Duas colunas de painéis, cada uma com até 2 grupos que se recolhem; uma
  faixa de baixo só para Linha do tempo e Curvas.
- Tabela única de teclas, em 5 escopos (toda-parte, cena, linha do tempo,
  árvore, ordem) — teclado repetido é arbitrado por `keyConflicts`.
- Arrasto de arquivo solto em qualquer canto: abre `.bone`, importa PSD ou
  de outro programa, solta imagem na aba Imagens, reconhece Aseprite pelo
  conteúdo. Rascunho automático guardado, mesmo sem salvar em disco.

**O que dá para fazer**
- Trocar a tecla de qualquer atalho (Shift+F1), vale na hora, avisa
  conflito. Paleta de comandos busca também na DICA do item, não só no nome.
- Fechar painel (×) ou grupo inteiro (botão direito na tira); mover para a
  outra coluna; arrastar aba para fora descola o painel (flutua, com barra
  de título e canto de redimensionar), arrastar de volta cola.
- Guardar/apagar arranjo de tela com nome; dividir altura entre 2 grupos
  (2 cliques volta ao automático); recolher grupo sem fechar as abas.
- A arrumação de painéis fica na MÁQUINA (não no `.bone`) — arquivo entregue
  não impõe nem carrega a tela de quem abre.
- Reabrir o fechado recupera o rascunho automático, mesmo sem ter salvo.

**O que falta**
- Fechar o último painel ou o último grupo de uma coluna é sempre recusado
  ("Tab esconde a coluna inteira") — não há atalho para esvaziar de vez.
- A janela de confirmar descarte usa o `confirm()` do navegador, não uma
  janela própria do programa.
- Duas sobras de código mortas, sem efeito hoje: `canRepack` no estado do
  menu Arquivo (`menus.ts:100`) e "Esqueleto filho..." que saiu do menu de
  propósito, esperando o encaixe por nome (`menus.ts:70`).

---

## O que este arquivo NÃO diz

| Não diz | Por quê |
|:---|:---|
| que o botão funciona certo | isso só se vê usando |
| o caminho de clique exato | está na folha de tarefas, `documentos/O QUE O PROGRAMA FAZ` |
| tudo o que não tem porta | a lista completa e sempre atual é `documentos/O QUE NAO TEM PORTA` (gerada do código) |
| o painel Pivôs por dentro | não deu tempo nesta rodada — bloco 8 ficou em aberto |
