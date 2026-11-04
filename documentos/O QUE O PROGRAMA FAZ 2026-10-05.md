# O que o programa faz, e por onde se chega — 2026-10-05

**Por TAREFA, e não por menu.** A pergunta não é *"o que tem no menu Animação?"*;
é *"como eu faço a arma trocar de mão?"*. Procure a tarefa na primeira coluna.

Gerado por `npm run tarefas`, às 02:31. **Não escrever à mão:** o arquivo é
lido do código a cada vez, e o que se escrever aqui se perde na próxima medição. A
régua é `ferramentas/provas/tarefas.ts`, a mesma do teste.

> **Leia isto antes de confiar na folha.** Ela diz que **existe um caminho**. Ela
> **não** diz que o botão faz o que o nome dele diz, **não** enxerga o que só se
> faz com a mão (arrastar, segurar `P`), e **"tem porta" não é "se acha"**. O
> quadro do fim explica cada uma das três.

## Em números

| Medida | Número |
|:---|---:|
| Coisas que o programa sabe fazer (ações) | 276 |
| Delas, **com nome de tarefa** nesta folha | 250 |
| Que **não são tarefa**, com o motivo escrito | 26 |
| **Sem nome e sem motivo** (o teste fica vermelho) | 0 |
| Ações que uma prova **prova**, clicando de verdade | 6 |
| Delas, com nome de tarefa nesta folha | 6 |
| Ações de que uma prova só **aperta a tecla** (não é prova) | 3 |

**O número de provadas é pequeno de propósito.** Ele só conta o que uma prova abre o
editor e faz, chamando a ação pelo nome ou clicando numa porta com nome. Uma tarefa
com "não" na coluna Provado **não está quebrada** — está **sem prova**, e é coisa
diferente.

**E tecla apertada não conta como prova:**

- quem responde a uma tecla é decidido na hora — a ferramenta na mão, o foco, o painel montado.
- Duas linhas da tabela de teclas podem declarar a mesma tecla, e só uma atende.
- Um medidor sem navegador não sabe qual.

## A folha

| Na coluna Provado | Quer dizer |
|:---:|:---|
| **sim** | uma prova abre o programa e faz isto, de verdade |
| não | ninguém provou ainda. **Não quer dizer que está quebrado** |
| ~ | a prova aperta a tecla, e não se sabe quem atendeu. Explicado no fim |

### Começar, abrir e salvar

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Começar um boneco do zero | Arquivo → Novo projeto (Ctrl+N) · Barra de ações: Novo | não |
| Abrir um boneco que já existe (.bone, .boneb, .bonez) | Arquivo → Abrir projeto… (Ctrl+O) · Barra de ações: Abrir | não |
| Começar pelas imagens: abrir a pasta de trabalho. Nada entra na cena sozinho | Arquivo → Abrir pasta do projeto… | **sim** |
| Voltar a um dos últimos arquivos abertos | Arquivo → Abrir recente… | não |
| Recuperar o que fechei sem salvar | Arquivo → Reabrir o fechado | não |
| Ver um boneco pronto, para entender o programa | Arquivo → Abrir o herói (exemplo) | não |
| Salvar o trabalho | Arquivo → Salvar (Ctrl+S) · Barra de ações: Salvar | **sim** |
| Salvar noutro lugar, ou com outro nome | Arquivo → Salvar como… (Ctrl+Shift+S) | não |
| Salvar num arquivo menor, que o jogo lê mais rápido | Arquivo → Exportar → Salvar como binário… | não |
| Salvar tudo — imagens e mais — num arquivo só, para mandar a alguém | Arquivo → Exportar → Salvar como pacote… | não |
| Mudar os quadros por segundo, a cor de fundo e a grade deste projeto | Arquivo → Configurações do projeto… | não |
| Mudar o jeito do programa: o que ele faz sozinho e como ele avisa | Editar → Preferências… | não |
| Voltar um passo | Editar → Desfazer (Ctrl+Z) · Barra de ações: Desfazer | não |
| Refazer o passo que desfiz | Editar → Refazer (Ctrl+Y) · Barra de ações: Refazer · Ctrl+Shift+Z | não |
| Fechar o programa | Arquivo → Sair | não |

### As imagens e o pivô

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Pôr uma imagem na cena escolhendo na lista, em vez de arrastar | Imagens → Pôr imagem na cena… | não |
| Trocar a imagem de um desenho por outra | Imagens → Opções do desenho… | não |
| Trocar a imagem de um desenho em TODAS as peles de uma vez | Skins → Trocar imagem nas skins… · Árvore, botão direito num desenho | não |
| Dizer onde o osso segura a imagem do desenho escolhido: o pivô | Imagens → Definir pivô… | não |
| Gravar o pivô de todas as imagens de uma vez, tirado do boneco montado | Imagens → Carimbar pivôs | não |
| Trazer de novo a imagem que eu mudei no Photoshop | Imagens → Recarregar a pasta | não |
| Vestir o boneco inteiro com as imagens de outra pasta, de mesmo nome | Imagens → Trocar pasta de origem… | não |
| Trazer uma subpasta numerada como um desenho só, que troca de quadro | Imagens → Trazer como sequência | não |
| Copiar o pivô de uma imagem para usar em outra | Imagens → Copiar pivô | não |
| Pôr numa imagem o pivô copiado de outra, na mesma proporção | Imagens → Colar pivô | não |

### Montar o boneco: ossos e peças

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Criar um osso | Base → Novo → Osso | não |
| Criar um ponto — a marca de onde sai o tiro, ou onde a mão segura | Base → Novo → Ponto (O) | não |
| Criar um ponto preso a um desenho, e não ao osso | Base → Novo → Ponto neste slot | não |
| Criar uma caixa de colisão — a área que o jogo mede | Base → Novo → Caixa de colisão (X) | não |
| Criar uma caixa de colisão presa a um desenho | Base → Novo → Caixa neste slot | não |
| Criar uma máscara: o desenho só aparece dentro dela | Base → Novo → Máscara | não |
| Criar um evento: o aviso que a animação manda ao jogo (o som do passo) | Animação → Novo evento | não |
| Criar um parâmetro: o número que o jogo manda de fora para mexer no boneco | Malha e regras → Novo parâmetro | não |
| Criar um emissor de partículas — fumaça, faísca, poeira | Partículas → Novo emissor vazio | não |
| Prender um osso a outro, para andar junto com ele | Base → Virar filho de… (P) | ~ |
| Trocar o nome de uma coisa | Editar → Renomear (F2) | não |
| Trocar um pedaço do nome em várias coisas de uma vez, com prévia antes | Editar → Substituir nomes… · Árvore, botão direito em qualquer linha | não |
| Fazer uma cópia do que está escolhido, com os filhos e os desenhos | Editar → Duplicar (Ctrl+D) | não |
| Apagar o que está escolhido | Editar → Apagar (Delete) · Barra de ações: Apagar | não |
| Achar um osso ou um desenho pelo nome, na Árvore | Editar → Buscar na Árvore… (Ctrl+F) | não |
| Escolher todos os ossos e desenhos de uma vez | Editar → Selecionar tudo (Ctrl+A) | não |
| Deixar de escolher: nada fica marcado | Editar → Desmarcar (Esc) | ~ |
| Escolher justamente o que NÃO estava escolhido | Editar → Inverter a seleção (Ctrl+Shift+I) | não |
| Escolher os ossos que vêm depois deste — o braço inteiro | Editar → Escolher → Os filhos (]) | não |
| Escolher os ossos que vêm antes deste, até a raiz | Editar → Escolher → Os pais ([) | não |
| Copiar onde o desenho fica em cima do osso, para repetir noutro | Editar → Copiar posição no osso · Árvore, botão direito num desenho | não |
| Colar em outros desenhos o lugar copiado | Editar → Colar posição no osso · Árvore, botão direito num desenho | não |
| Limpar os desenhos que ficaram sem imagem nenhuma | Base → Limpar desenhos vazios | não |
| Devolver este osso à pose de montagem | Base → Voltar à pose de repouso (Ctrl+1) | não |
| Devolver o boneco inteiro à pose de montagem | Base → Voltar tudo ao repouso (Ctrl+Shift+1) | não |
| Mexer num osso sem arrastar os filhos dele | Base → Compensar → Não mexer nos filhos | não |
| Mexer num osso sem arrastar os desenhos dele | Base → Compensar → Não mexer nos desenhos | não |
| Mexer num osso sem arrastar as caixas de colisão dele | Base → Compensar → Não mexer nas caixas | não |
| Pôr as alças no eixo do próprio osso | Base → Eixos das alças → Local | não |
| Pôr as alças no eixo do osso pai | Base → Eixos das alças → Pai | não |
| Pôr as alças sempre de pé, como a tela | Base → Eixos das alças → Mundo | não |
| Transformar uma imagem inteira em malha, para dobrar | Malha e regras → Malha → Virar malha | não |
| Fazer a malha sozinha, pelo contorno da imagem | Malha e regras → Malha → Gerar automática | não |
| Fazer só o contorno da malha, pela silhueta | Malha e regras → Malha → Traçar contorno | não |
| Pôr pontos novos na malha, clicando nela | Malha e regras → Malha → Criar vértice | não |
| Tirar pontos da malha | Malha e regras → Malha → Apagar vértice | não |
| Usar a forma de outra malha, trocando só a imagem | Malha e regras → Malha → Usar a forma de outra malha | não |
| Dizer que ossos puxam a malha | Malha e regras → Pesos → Ligar ossos | não |
| Deixar o programa decidir quanto cada osso puxa a malha | Malha e regras → Pesos → Pesos automáticos | não |
| Deixar a dobra da malha mais macia | Malha e regras → Pesos → Suavizar tudo | não |
| Tirar da malha os pesos pequenos demais | Malha e regras → Pesos → Podar | não |
| Fazer a malha voltar a seguir só o osso dela | Malha e regras → Pesos → Tirar pesos | não |
| Prender o emissor de partículas a um osso, sem sair do lugar | Partículas → Prender ao osso escolhido | não |

### Ordem de desenho

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Trazer um desenho um passo para a frente dos outros | Base → Trazer para a frente (+) · Ctrl+↑ — com o foco na cena, desenho escolhido · Ctrl+↑ — com o foco na aba Ordem, desenho escolhido | não |
| Mandar um desenho um passo para trás dos outros | Base → Mandar para trás (−) · Ctrl+↓ — com o foco na cena, desenho escolhido · Ctrl+↓ — com o foco na aba Ordem, desenho escolhido | **sim** |
| Pôr um desenho na frente de todos | Base → Frente de tudo (Ctrl+Shift+↑) · Ctrl+→ — com o foco na cena, desenho escolhido · Ctrl+→ — com o foco na aba Ordem, desenho escolhido | não |
| Pôr um desenho atrás de todos | Base → Fundo de tudo (Ctrl+Shift+↓) · Ctrl+← — com o foco na cena, desenho escolhido · Ctrl+← — com o foco na aba Ordem, desenho escolhido | não |
| Juntar vários desenhos numa pasta, para andarem juntos na ordem | Base → Nova pasta… | não |
| Tirar um desenho da pasta em que ele está | Base → Tirar da pasta | não |
| Fazer a ordem de agora valer na animação inteira | Base → Copiar a ordem na animação | não |

### Ver, esconder e travar

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Mostrar ou esconder os ossos | Exibir → O boneco → Ossos (7) · Barra de ações: Ver ossos | não |
| Mostrar ou esconder os desenhos | Exibir → O boneco → Desenhos (9) · Barra de ações: Ver desenhos | não |
| Mostrar o nome de cada osso na cena | Exibir → O boneco → Nomes dos ossos | não |
| Mostrar ou esconder os pontos | Exibir → O boneco → Pontos | não |
| Mostrar ou esconder as caixas de colisão | Exibir → O boneco → Caixas | não |
| Mostrar ou esconder as máscaras | Exibir → O boneco → Máscaras | não |
| Mostrar ou esconder as malhas | Exibir → O boneco → Malhas | não |
| Mostrar os fios que ligam os pontos da malha | Exibir → O boneco → Arestas | não |
| Mostrar quanto cada osso puxa cada ponto da malha, em cores | Exibir → O boneco → Pesos | não |
| Mostrar ou esconder a grade do fundo | Exibir → A cena → Grade | não |
| Mostrar ou esconder as réguas da borda | Exibir → A cena → Réguas | não |
| Mostrar ou esconder o cruzamento dos eixos | Exibir → A cena → Eixos | não |
| Mostrar ou esconder as guias | Exibir → A cena → Guias | não |
| Travar as guias, para não arrastá-las por engano | Exibir → A cena → Travar guias | não |
| Apagar todas as guias | Exibir → A cena → Limpar guias | não |
| Ver os quadros vizinhos por trás, como papel de cebola | Exibir → A cena → Casca de cebola | não |
| Escolher quantos quadros vizinhos aparecem, e em que cor | Exibir → Casca de cebola: opções… | não |
| Ver o nome da peça só ao passar o mouse por cima | Exibir → A cena → Nome ao passar o mouse | não |
| Esconder o que está escolhido | Exibir → Esconder o escolhido (H) | não |
| Ver só este, e esconder todo o resto | Exibir → Só este: esconde o resto (Shift+H) | não |
| Trazer de volta tudo o que estava escondido | Exibir → Mostrar tudo (Ctrl+Alt+3) | não |
| Ver a cena limpa, como no jogo: sem osso, sem alça, sem caixa | Exibir → Ver só o resultado (Ctrl+Shift+H) | não |
| Travar os ossos, para o clique passar por eles | Exibir → Travar → Travar ossos (8) · Barra de ações: Travar ossos | não |
| Travar os desenhos, para o clique passar por eles | Exibir → Travar → Travar desenhos (0) · Barra de ações: Travar desenhos | não |
| Travar o que está escolhido | Exibir → Travar → Travar o escolhido (Ctrl+2) | não |
| Travar tudo MENOS o que está escolhido | Exibir → Travar → Travar o resto (Ctrl+Shift+2) | não |
| Destravar tudo o que estava travado | Exibir → Travar → Destravar tudo (Ctrl+Alt+2) | não |
| Deixar o programa claro | Exibir → Tema → Claro | não |
| Deixar o programa escuro | Exibir → Tema → Escuro | não |

### A cena: olhar e enquadrar

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Chegar mais perto | Exibir → Aproximar (Ctrl+=) | não |
| Afastar-se, para ver mais em volta | Exibir → Afastar (Ctrl+−) | não |
| Ver o boneco inteiro, cabendo na tela | Exibir → Ajustar à tela (Ctrl+Shift+F) | não |
| Ver no tamanho de verdade, sem aumento | Exibir → Tamanho real (100%) (Ctrl+0) | não |
| Ir até o que está escolhido | Exibir → Enquadrar seleção (F) | não |
| Pôr um desenho de papel atrás da cena, para copiar por cima | Exibir → Imagem de referência… · Barra de ações: Imagem de referência | não |
| Voltar à ferramenta que eu estava usando antes | Exibir → Ferramenta de antes | não |

### Corpos, animações e entidades

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Voltar à montagem: mexer aqui vale em TODAS as animações | Base → Abrir a base | não |
| Tirar a entidade do lugar e ter de volta a imagem que estava ali antes | Entidades → Tirar a entidade | não |
| Começar uma animação nova | Animação → Nova animação | **sim** |
| Fazer uma cópia de uma animação, para mudar a partir dela | Animação → Animações → Duplicar animação | não |
| Trocar o nome de uma animação | Animação → Animações → Renomear animação | não |
| Apagar uma animação | Animação → Animações → Apagar animação | não |
| Escolher qual animação o jogo toca primeiro | Animação → Animações → Mandar para o topo | não |
| Pegar animações prontas — parado, andar, correr, pular | Animação → Animações → Biblioteca de animações… | não |
| Levar uma animação deste boneco para outro boneco | Arquivo → Exportar → Animações, para outra base… | não |
| Trazer para este boneco uma animação feita noutro | Arquivo → Importar → Animações, de outra base… | não |
| Trocar o boneco inteiro no meio da animação — o homem vira lobisomem | Animação → Troca de base → Colar outra base aqui | não |
| Trazer outro boneco para dentro deste projeto | Base → Trazer uma base de fora… | não |
| Trazer um boneco de fora para pendurar neste — a espada, o fogo | Entidades → Trazer entidade de fora… | não |
| Entregar um boneco ao jogo, só com as imagens que ele usa | Arquivo → Exportar → Entregar uma base… | não |
| Salvar a entidade que eu editei: por cima, ou como nova | Arquivo → Salvar a entidade editada… | não |
| Fazer uma base nova com a pose deste instante | Base → Salvar como base nova… | não |
| Fazer uma base voltar a ser entidade | Entidades → Rebaixar a entidade | não |
| Desfazer a troca de base num quadro da animação | Animação → Troca de base → Tirar a troca daqui | não |
| Pôr uma entidade na cena, presa ao osso escolhido | Entidades → Pôr entidade na cena… | não |
| Escolher qual animação da entidade toca daqui em diante | Entidades → Escolher a animação dela… | não |
| Fazer a entidade rodar em laço, ou tocar uma volta e parar | Entidades → Em laço | não |
| Fazer uma entidade virar base, com as animações dela | Entidades → Promover a base | não |

### Animar: chaves e tempo

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Tocar a animação, ou parar | Animação → Tocar / Pausar (Espaço) | ~ |
| Tocar a animação de trás para a frente | Animação → Tocar para trás (Shift+Espaço) | não |
| Ir para o começo da animação | Animação → Ir para → Início (Home) | não |
| Ir para o fim da animação | Animação → Ir para → Fim (End) | não |
| Andar um quadro para trás | Animação → Ir para → Quadro anterior (←) | não |
| Andar um quadro para a frente | Animação → Ir para → Quadro seguinte (→) | não |
| Pular para a chave de antes | Animação → Ir para → Chave anterior (↑) | não |
| Pular para a chave seguinte | Animação → Ir para → Chave seguinte (↓) | não |
| Pular para a chave de antes só do que está escolhido | Animação → Ir para → Chave anterior do escolhido (Shift+↑) | não |
| Pular para a chave seguinte só do que está escolhido | Animação → Ir para → Chave seguinte do escolhido (Shift+↓) | não |
| Fazer a animação repetir em laço, sem parar | Animação → Repetir (L) | não |
| Tocar como o jogo vai tocar: o fim obedece ao Repetir da animação | Animação → No fim → Como o arquivo diz | não |
| Olhar a animação uma vez só: o tocador para no fim | Animação → No fim → Parar no fim | não |
| Olhar a animação em laço, mesmo sem Repetir no arquivo | Animação → No fim → Repetir | não |
| Olhar a animação indo e voltando, de trás para a frente no fim | Animação → No fim → Vai e volta | não |
| Olhar a animação uma vez e voltar ao começo | Animação → No fim → Voltar ao início | não |
| Mudar quanto a animação dura, esticando as chaves junto | Animação → Mudar duração… | não |
| Gravar a pose de agora sem mexer em nada — só do escolhido | Animação → Chavear (K) | não |
| Gravar a pose de agora sem mexer em nada — do boneco inteiro | Animação → Chavear tudo (Ctrl+K) | não |
| Apagar as chaves escolhidas | Animação → Apagar chave | não |
| Apagar a linha inteira da linha do tempo, com todas as chaves dela | Animação → Apagar as linhas (Shift+Delete) · Shift+Backspace — com o foco na linha do tempo | não |
| Esvaziar a animação: tirar todas as chaves dela | Animação → Limpar a animação inteira… | não |
| Copiar as chaves escolhidas | Editar → Copiar (Ctrl+C) · Barra de ações: Copiar | não |
| Colar as chaves copiadas neste tempo | Editar → Colar (Ctrl+V) · Barra de ações: Colar | **sim** |
| Tirar as chaves escolhidas e guardá-las para colar noutro lugar | Editar → Recortar chaves (Ctrl+X) · Barra de ações: Recortar chaves | não |
| Copiar a pose inteira do boneco | Editar → Pose → Copiar a pose inteira (Ctrl+Shift+C) | **sim** |
| Copiar a pose só do que está escolhido | Editar → Pose → Copiar a pose do escolhido | não |
| Colar isto em todas as chaves da animação de uma vez | Editar → Pose → Colar em todas as chaves (Ctrl+Shift+V) | não |
| Colar do outro lado: o braço esquerdo vira o direito | Editar → Pose → Colar espelhado | não |
| Escolher todas as chaves da animação | Animação → Chaves → Selecionar todas as chaves | não |
| Esticar ou encolher no tempo as chaves escolhidas | Animação → Chaves → Esticar seleção… | não |
| Pôr as chaves na ordem de trás para a frente | Animação → Chaves → Espelhar no tempo | não |
| Fazer o fim ficar igual ao começo, para o laço não dar salto | Animação → Chaves → Fechar ciclo | não |
| Trocar esquerda e direita na animação inteira | Animação → Chaves → Espelhar esquerda e direita… | não |
| Abrir espaço no meio da animação, empurrando as chaves para a frente | Animação → Chaves → Empurrar as chaves… | não |
| Tirar as chaves que não mudam nada | Animação → Chaves → Limpar chaves repetidas | não |
| Fazer a passagem de uma pose à outra ser reta, na mesma velocidade | Animação → Curva da chave → Linear | não |
| Fazer a passagem de uma pose à outra sair devagar e chegar devagar | Animação → Curva da chave → Suave | não |
| Fazer a pose pular de uma para a outra, sem passagem nenhuma | Animação → Curva da chave → Parada | não |
| Desenhar eu mesmo a curva da passagem, arrastando as alças | Animação → Curva da chave → Curva… | não |
| Dar um clarão no boneco — o golpe que acerta | Animação → Efeitos de chave → Flash… | não |
| Fazer o boneco pulsar, crescendo e voltando | Animação → Efeitos de chave → Pulso… | não |
| Fazer o boneco tremer | Animação → Efeitos de chave → Tremor… | não |
| Pôr fogo saindo de um osso, já pronto para ver | Partículas → Fogo | não |
| Pôr fumaça saindo de um osso, já pronta para ver | Partículas → Fumaça | não |
| Pôr um estouro de faíscas num osso — o golpe que bate | Partículas → Faísca | não |
| Pôr poeira levantando do pé | Partículas → Poeira | não |
| Gravar os pesos da malha como chave na animação | Malha e regras → Pesos → Chavear pesos | não |

### As marcas e o trecho

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Pôr uma marca neste tempo, para achá-lo depois | Animação → Marcas → Pôr ou tirar marca aqui (M) | não |
| Pular para a marca de antes | Animação → Marcas → Marca anterior (Ctrl+↑) | não |
| Pular para a marca seguinte | Animação → Marcas → Marca seguinte (Ctrl+↓) | não |
| Dizer onde começa o trecho que eu quero tocar em laço | Animação → Trecho de laço → Começo do trecho aqui | não |
| Dizer onde acaba o trecho que eu quero tocar em laço | Animação → Trecho de laço → Fim do trecho aqui | não |
| Voltar a tocar a animação inteira, e não só o trecho | Animação → Trecho de laço → Tirar o trecho | não |

### Peles: trocar a roupa

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Criar uma roupa nova para o boneco | Skins → Nova skin | não |
| Levar uma roupa deste boneco para outro boneco | Arquivo → Exportar → Skin, para outro boneco… | não |
| Trazer para este boneco uma roupa feita noutro | Arquivo → Importar → Skin, de outro boneco… | não |
| Fazer da roupa ligada um boneco novo, por si | Skins → Promover skin a base… | não |
| Fazer uma peça sumir quando esta roupa está vestida | Skins → Esconder esta imagem | não |
| Fazer esta roupa deixar uma peça em paz: volta a peça de baixo | Skins → Ignorar esta imagem | não |
| Fazer uma cópia da roupa, com os mesmos ossos | Skins → Clonar skin | não |
| Fazer uma roupa inteira de uma pasta, pelos nomes iguais | Skins → Fazer a skin de uma pasta… | não |
| Apagar uma roupa | Skins → Apagar skin | não |
| Escolher em qual roupa nasce o que eu crio agora | Skins → Editar esta skin… | não |

### Regras, física e variáveis

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Fazer o boneco se mexer sozinho: dobrar o braço para alcançar, copiar de outro osso, deslizar num caminho, balançar | Malha e regras → Nova regra… | não |
| Ver na tela o osso balançando sozinho, ou parar de ver | Malha e regras → Física → Simular a física | não |
| Zerar o balanço deste osso | Malha e regras → Física → Reiniciar esta física | não |
| Zerar o balanço de todos os ossos | Malha e regras → Física → Reiniciar todas as físicas | não |
| Virar o balanço em chaves de verdade, para não depender da conta | Malha e regras → Física → Assar a física em chaves… | não |
| Criar um número que o jogo lê — a vida, a munição | Animação → Variáveis e etiquetas → Nova variável | não |
| Apagar uma variável | Animação → Variáveis e etiquetas → Apagar a variável | não |
| Pôr uma etiqueta na animação, para o jogo saber o que ela é | Animação → Variáveis e etiquetas → Nova etiqueta | não |
| Mostrar ou esconder a parte das variáveis, na aba Regras | Animação → Variáveis e etiquetas → Mostrar na aba Regras | não |
| Trocar os ossos de uma regra sem apagar e fazer de novo | Malha e regras → Trocar os ossos da regra… | não |
| Apagar uma regra | Malha e regras → Apagar regra | não |
| Gravar onde o alvo fica neste valor do parâmetro | Malha e regras → Chave do parâmetro aqui | não |
| Apagar um parâmetro | Malha e regras → Apagar parâmetro | não |
| Dar outro nome a uma etiqueta, em todo lugar | Animação → Variáveis e etiquetas → Renomear etiqueta | não |
| Apagar uma etiqueta, e tirá-la de toda animação | Animação → Variáveis e etiquetas → Apagar etiqueta | não |

### Importar e exportar

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Trazer um boneco feito no Spriter, no Spine ou no DragonBones | Arquivo → Importar → De outro programa… | não |
| Trazer um desenho do Photoshop: cada camada vira uma peça, no lugar | Arquivo → Importar → PSD… | não |
| Trazer do Photoshop já com os ossos, desenhados numa camada chamada ossos | Arquivo → Importar → PSD com ossos… | não |
| Fazer um GIF, um vídeo, uma folha de sprites ou PNG em sequência | Arquivo → Exportar → GIF, PNG, folha, vídeo… | não |
| Salvar um arquivo menor, só com as roupas e as animações que eu marcar | Arquivo → Exportar → Uma imagem por skin… | não |
| Levar o boneco para um programa 3D ou para uma engine | Arquivo → Exportar → glTF, para programa 3D… | não |
| Exportar de novo, com as mesmas opções da última vez | Arquivo → Repetir a última exportação (Ctrl+Shift+E) | não |

### Arrumar a tela

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Esconder todos os painéis e ficar só com a cena | Janela → Arrumar → Esconder painéis (Tab) | não |
| Abrir ou fechar a Árvore — a lista de ossos e desenhos | Janela → Árvore | não |
| Abrir ou fechar a Ordem — quem fica na frente de quem | Janela → Ordem | não |
| Abrir ou fechar Propriedades — os campos do que está escolhido | Janela → Propriedades | não |
| Abrir ou fechar as Imagens — a pasta de arte | Janela → Imagens | não |
| Abrir ou fechar as Entidades — os bonecos pendurados | Janela → Entidades | não |
| Abrir ou fechar as Partículas — os emissores, com Novo, Duplicar e Apagar | Janela → Partículas | não |
| Abrir ou fechar os Pivôs — onde o osso segura a imagem | Janela → Pivôs | não |
| Abrir ou fechar a Exibição — as caixas de ver e travar | Janela → Exibição | não |
| Abrir ou fechar a Prévia — testar como fica no jogo | Janela → Prévia | não |
| Abrir ou fechar as Animações — os corpos e as animações de cada um | Janela → Animações | não |
| Abrir ou fechar as Peles — as roupas | Janela → Skins | não |
| Abrir ou fechar as Regras — o que se mexe sozinho | Janela → Regras | não |
| Abrir ou fechar o Histórico — voltar vários passos de uma vez | Janela → Histórico | não |
| Abrir ou fechar a Malha e pesos — entortar a imagem | Janela → Malha e pesos | não |
| Abrir ou fechar a Linha do tempo | Janela → Linha do tempo | não |
| Abrir ou fechar as Curvas — desenhar a passagem entre poses | Janela → Curvas | não |
| Abrir as linhas da linha do tempo uma a uma, em vez do resumo | Janela → Arrumar → Detalhes da linha do tempo | não |
| Mandar esta aba para a outra coluna | Janela → Arrumar → Mover para a outra coluna | não |
| Fechar de uma vez todas as abas deste grupo | Janela → Arrumar → Fechar o grupo | não |
| Guardar a tela de agora com um nome, para voltar a ela depois | Janela → Arranjos → Guardar este arranjo… | não |
| Apagar um arranjo de tela guardado | Janela → Arranjos → Apagar um arranjo… | não |
| Pôr a tela do jeito bom para marcar pivô | Janela → Arranjos → Pivô | não |
| Pôr a tela do jeito bom para olhar o resultado | Janela → Arranjos → Visualização | não |
| Devolver a tela ao arranjo de fábrica | Janela → Arranjos → Voltar ao padrão | não |
| Escrever o nome ao lado do ícone de cada ferramenta | Exibir → Mostrar nome das ferramentas | não |

### Achar as coisas e pedir ajuda

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| Achar um comando digitando um pedaço do nome dele — quando não sei em que menu está | Ajuda → Paleta de comandos (Ctrl+Shift+P) | não |
| Ver todas as teclas, e trocar uma por outra | Ajuda → Atalhos do teclado (Shift+F1) | não |
| Ver o que o programa não entendeu no arquivo, e onde | Ajuda → Problemas do arquivo… | não |
| Abrir o manual | Ajuda → Manual (F1) | não |
| Ver que versão do programa é esta | Ajuda → Sobre o Recorte | não |

### O que não tem uma linha nesta folha

Estes assuntos não aparecem acima: **Malha e pesos**. Não é esquecimento —
é que tudo neles se faz por **botão dentro do painel**, e botão de painel não tem
linha em tabela de menu, de tecla nem da barra. A folha não os vê. O
`MANUAL SIMPLES` conta esses, escrito à mão.

## As que NÃO são tarefa, e por quê — 26

| A ação | O nome no menu | Por que não é tarefa |
|:---|:---|:---|
| `animacoes` | Animações | só abre um submenu: não faz nada por si |
| `arranjos` | Arranjos | só abre um submenu: não faz nada por si |
| `arrumar` | Arrumar | só abre um submenu: não faz nada por si |
| `chaves` | Chaves | só abre um submenu: não faz nada por si |
| `compensar` | Compensar | só abre um submenu: não faz nada por si |
| `efeitos` | Efeitos de chave | só abre um submenu: não faz nada por si |
| `eixos` | Eixos das alças | só abre um submenu: não faz nada por si |
| `escolher` | Escolher | só abre um submenu: não faz nada por si |
| `exportar` | Exportar | só abre um submenu: não faz nada por si |
| `fisica` | Física | só abre um submenu: não faz nada por si |
| `importar` | Importar | só abre um submenu: não faz nada por si |
| `interpolacao` | Curva da chave | só abre um submenu: não faz nada por si |
| `ir-para` | Ir para | só abre um submenu: não faz nada por si |
| `malha` | Malha | só abre um submenu: não faz nada por si |
| `marcas` | Marcas | só abre um submenu: não faz nada por si |
| `no-fim` | No fim | só abre um submenu: não faz nada por si |
| `novo-item` | Novo | só abre um submenu: não faz nada por si |
| `pesos` | Pesos | só abre um submenu: não faz nada por si |
| `pose` | Pose | só abre um submenu: não faz nada por si |
| `tema` | Tema | só abre um submenu: não faz nada por si |
| `travar` | Travar | só abre um submenu: não faz nada por si |
| `trecho` | Trecho de laço | só abre um submenu: não faz nada por si |
| `troca-de-base` | Troca de base | só abre um submenu: não faz nada por si |
| `variaveis-e-etiquetas` | Variáveis e etiquetas | só abre um submenu: não faz nada por si |
| `ver-a-cena` | A cena | só abre um submenu: não faz nada por si |
| `ver-o-boneco` | O boneco | só abre um submenu: não faz nada por si |

## O que esta folha NÃO diz

| Não diz | Por quê |
|:---|:---|
| que o botão **faz o que o nome dele diz** | ela lê as tabelas de menu, tecla e barra. Se o item existir e chamar a coisa errada, ela não vê. Só alguém usando vê |
| o que se faz **só com a mão** | arrastar a imagem para a cena, segurar `P` e clicar, arrastar a alça da curva: gesto não tem linha em tabela nenhuma, e por isso não tem linha aqui. O `MANUAL SIMPLES` conta esses; esta folha não |
| que alguém **acha** a porta | *"tem porta" não é "se acha"*. A folha prova que existe caminho; que ele seja encontrável é a mão do Humberto, e nenhum teste a substitui |
| que a tarefa **funciona** | a coluna Provado diz que o roteiro passa por ali. Um "não" é falta de prova, não defeito |
| que a lista de ações está **completa** | ela sai do `ACTION_TABLE`, dos menus, da barra e do botão direito. Comando que nunca virou ação nenhuma não chega aqui — quem conta esses é a folha irmã, `O QUE NAO TEM PORTA` |

## Como a coluna Provado é medida, e o que ela não vê

A prova é o `roteiro-30.mjs`, que abre o editor de verdade e clica. Esta folha lê o
**texto dele**, pelo nome do arquivo, e reconhece 3 formas:

| A forma | O que é |
|:---|:---|
| `runAction('id')` | a prova chama a ação pelo id, direto |
| `.menu-item … 'Nome'` | a prova abre o menu e clica no item pelo nome |
| `aria-label') === 'Nome'` | a prova clica num botão pelo nome dele |

**A tecla apertada não está nessa lista, e é de propósito.** Ela sai como `~` na
coluna Provado, e nunca como `sim`, porque:

- quem responde a uma tecla é decidido na hora — a ferramenta na mão, o foco, o painel montado.
- Duas linhas da tabela de teclas podem declarar a mesma tecla, e só uma atende.
- Um medidor sem navegador não sabe qual.

Contava como prova na primeira versão desta régua, e deu **três verdes falsos de
dez**: `novo` (o `runAction` estava dentro de um COMENTÁRIO do roteiro), `desmarcar`
(o `Esc` é comido pela ferramenta na mão) e `virar-filho` (o `P` segurado é o gesto
`pegar-filhos`, não a ação do menu que declara a mesma tecla). A forma do erro:
**tomei "a tecla foi apertada" por "a ação rodou"**.

O que ela **não** reconhece vira "não" na coluna Provado: um arrasto, um clique por
coordenada, um `__r.soltar(…)`. Então **um "não" pode ser cegueira do medidor**, e não
falta de prova. Está escrito aqui em vez de escondido num número.

**E a folha não se mede a si mesma.** O que ela lê para a coluna Provado é uma lista
de arquivos com nome (`AS_PROVAS`), nunca a pasta `ferramentas/provas/` — que é onde
ela mora. Varrer a pasta faria o `runAction(…)` escrito nos comentários do próprio
medidor contar como prova. O teste confere que nenhum arquivo do medidor está na
lista das provas. É a armadilha que pegou o vigia da parte 1, com a porta fechada.

