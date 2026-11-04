# A ordem da obra — 04/10/2026

Palavra do Humberto, 04/10: *"eu quero que o projeto seja feito em pequenas partes, e que
eu possa passar cada nova rodada para um novo chat."*

**Uma rodada = um chat = uma parte pequena.** Um executor por vez.
A obra volta rodada a rodada: **cada rodada começa quando o Humberto a passa a um chat.**

## Os papéis

Palavra do Humberto, 04/10, noite: *"você é o diretor, orquestre o programa."*

| Papel | Quem | Faz |
|:---|:---|:---|
| **Diretor** | `DIRETOR · ed2cab` | fala com o Humberto · confere o que cada rodada entregou, **usando o programa** · ajusta esta ordem · escreve a ficha da rodada seguinte em `rodadas/`. Não escreve código |
| **Executor** | um chat novo por rodada | faz só a rodada dele e reporta ao Diretor |

Caminho: `Executor → DIRETOR → Humberto`. Não há Planejador.

## Como o Diretor fala com o Humberto

Ordens dele, 04/10, noite. Valem para **todo Diretor**, este e os próximos.

| # | Regra | Palavras dele |
|:---:|:---|:---|
| 1 | **As perguntas vão no FIM do texto**, juntas, numa tabela. Nunca no meio | *"colocar as perguntas no final do texto, para não se perder no meio do texto"* |
| 2 | **Toda pergunta leva uma sugestão de resposta do Diretor** | *"e sempre com uma sugestão de resposta sua"* |
| 3 | **Ele não fica olhando as janelas.** O Diretor troca os modelos, libera, acompanha e confere sozinho. Só vai a ele o que só ele decide | *"eu não vou ficar olhando, eu espero que você faça isso"* |
| 4 | Frases curtas, tabelas, poucas linhas. Ele é disléxico | |
| 5 | **Se o Spriter responde, o Diretor decide e avisa. Não pergunta.** A régua já está dada: o programa é uma cópia do Spriter. Só vai a ele o que o Spriter não tem (malha, entidade, partícula, skin com osso), ou o que contraria algo que ele disse | *"Cara, você tem a resposta do que eu [estou] perguntando. Eu não entendo isso."* (depois de três perguntas seguidas cuja resposta era "como no Spriter") |

O modelo da tabela de perguntas:

| # | A pergunta | A minha sugestão |
|:---:|:---|:---|
| 1 | … | … |

**A sugestão é do Diretor**, não do executor. Ele repetiu: *"uma sugestão de resposta do diretor"*.
A pergunta de um executor não vai direto ao Humberto: ela chega ao Diretor, que olha o todo,
escreve a **sua** sugestão, e só então a leva a ele, no fim do texto.

## Quantos chats ao mesmo tempo, e em que modelo

Palavra do Humberto, 04/10, noite: *"você pode criar mais de um chat, e lembre de controlar os modelos."*

| Régua | Por quê |
|:---|:---|
| **No máximo 3 chats de rodada ao mesmo tempo** | a conta cai no limite com muitos; em 29/09 foram 16 |
| **Só UM chat usa a máquina** (abre o programa, roda testes, roteiro, medição, monta o `programa/`) | 7,7 GB, e as portas são fixas |
| **Só UM chat escreve código** | o fecho se mede com a casa vazia (regra 24), e montar o `programa/` troca o chão de quem está conferindo nele |
| Rodada de **ler, pesquisar ou desenhar** roda junto com qualquer outra | não usa a máquina nem escreve código |

| Tipo de rodada | Modelo |
|:---|:---:|
| Conferir no uso | Sonnet |
| Pesquisa e desenho | Opus |
| Obra | Opus |
| Obra difícil (mexe no formato e nos dois runtimes), ou rodada que empacou | **Fable**, o mais forte. Só quando precisar |

**Quem escolhe o modelo é o Diretor, sem esperar o Humberto pedir.** Palavra dele, 04/10: *"não tem problema usar modelos como o Fable, mas é bom usar quando precisar. O outro diretor não ficava esperando eu pedir para organizar o modelo."*

**O chat abre no modelo errado.** Por isso todo chat de rodada, no primeiro turno, só assina e lê. Aí ele **avisa o Diretor por `SendMessage`** ("rodada N: li tudo, pronto") e para. O Diretor troca o modelo e manda "pode começar".

**O Diretor não acorda sozinho.** Ele só age quando chega uma mensagem: do Humberto, ou de outro chat. Abrir o chat pelo botão **não** o avisa. Em 04/10 a rodada 8d ficou três minutos parada por isso, e o Humberto teve de reclamar. É a mensagem do chat novo que acorda o Diretor: sem ela, o chat fica esperando para sempre.
O Diretor se troca a cada cinco rodadas, mais ou menos. O novo começa lendo o `02` e este arquivo.

---

## Para o Humberto: como passar uma rodada

O Diretor prepara a rodada e deixa um botão na conversa. Um clique abre o chat dela.

Se o botão não aparecer, abra um chat novo nesta pasta e cole esta frase:

```text
Leia documentos/projeto do programa/03 A ORDEM DA OBRA 2026-10-04.md e faça a próxima rodada aberta.
```

Nada mais. O chat lê o resto sozinho.

---

## Para o chat que chega: o que ler

| Ordem | Arquivo | Para quê |
|:---:|:---|:---|
| 1 | `CLAUDE.md` | as regras da casa |
| 2 | `documentos/projeto do programa/02 AS DECISOES do projeto 2026-10-04.md` | **o que o programa tem de ser.** É a fonte. Vale acima dos planos antigos |
| 3 | este arquivo, e a ficha da sua rodada em `rodadas/`, se houver | qual é a sua rodada, e o detalhe dela |
| 4 | `ESTADO.md`, só o quadro do topo | os números da última versão |
| 5 | `editor/src/contract.ts` | só se a sua rodada mexe em código |

Os 96 planos antigos em `documentos/planos/` são **história**. Não siga nenhum deles sem
a rodada mandar.

---

## As regras de toda rodada

| # | Regra |
|:---:|:---|
| 1 | Faça **só** a primeira rodada com estado **aberta**. Não adiante a seguinte |
| 2 | Assine `documentos/QUEM E QUEM.md` e ponha o título `EXECUTANDO · rodada N — nome` |
| 3 | Antes de construir, **confira no uso** se já existe. Muita coisa existe no código e nunca foi usada por ninguém |
| 4 | Gesto novo: olhe como o Spriter, o Spine e o DragonBones fazem (manuais em `documentos/pesquisa/nova pesquisa/`). **Leia o manual; não responda de memória** |
| 5 | Backup antes de escrever. Tudo listado em `backup/INDICE.md` |
| 6 | Toda função nova nasce **com porta no menu, no lugar dela** |
| 7 | **Lote sem foto não fecha.** A foto vai para `backup/fotos-obra/rodada-N/` |
| 8 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "o que mudou"`. A máquina tem 7,7 GB: **um processo de cada vez** |
| 9 | A rodada ficou grande demais para um chat? **Pare, parta em duas**, e escreva a segunda na tabela abaixo |
| 10 | Dúvida que só o Humberto resolve: escreva na seção "Perguntas para o Humberto", com a sua suposição, avise o Diretor por `SendMessage`, e siga pelo que não depende dela. Não abra painel de pergunta |
| 11 | No fim: mude o estado da rodada para **entregue**, com a versão e três linhas do que ele vai ver. Avise o Diretor por `SendMessage` (rode `ListAgents` antes: o endereço muda). Se o Diretor não responder, responda ao Humberto em poucas linhas, na sua janela |
| 13 | **Só o Diretor muda "entregue" para "feita"**, depois de conferir no programa. Dizer "feito" não é estar feito |
| 12 | Manual, nome novo e site: **não**. Só com a palavra dele |

---

## As rodadas

Estados: **aberta** · **entregue** (o executor terminou) · **feita** (o Diretor conferiu) · **espera** (depende de outra, ou de uma resposta dele).

| # | Rodada | O quê | Código? | Estado |
|:---:|:---|:---|:---:|:---:|
| 1 | **Conferir: conexão e skin** | usar o `programa/` e dizer, para cada regra das seções 2 e 3 das decisões: **já faz · pela metade · não faz**, com foto. Sai `04 O QUE JA FAZ` nesta pasta | não | **feita** (conferida pelo Diretor em 04/10) |
| 2 | **Conferir: tela, partículas e Spine** | o mesmo, para: soltar, recolher e expandir painéis · menu Janela · clicar, mover e prender partícula · achar malha, pesos, regras, física e caminho pelos menus. Acrescenta ao `04` | não | aberta |
| 3 | **O que perde trabalho** | roupa exportada não volta (M17) · digitar 90 no Ângulo não gira (J9) · projeto grande do Spriter trava (E6). Ids em `documentos/planos/FILA dos defeitos 2026-09-29.md` | sim | **feita** (v24.4 a v24.6). A rodada 21 viu o J9; M17 e E6 não dão para conferir sem janela: ficam para a mão do Humberto |
| 4 | **Os painéis do Photoshop** | consertar o que a rodada 2 achou: soltar da parede, recolher, expandir, menu Janela, contextos | sim | espera a 2 |
| 5 | **O desenho dos menus** | um desenho dos menus: Skins, Imagens, Entidades e Partículas com menu próprio; malha, pesos, regras, física e caminho com porta. **O Humberto risca.** Sem código | não | **feita** (conferida pelo Diretor em 04/10; espera o risco do Humberto) |
| 6 | **Os menus** | construir o desenho aprovado | sim | **feita** (v24.7 a v24.9). Conferida no uso pela rodada 21, em 05/10. Sobras: ver o fim |
| 7 | **Pedir a pasta ao começar** | o programa pede uma pasta ao começar o projeto, como o Spriter | sim | aberta |
| 8 | **Conexão: trocar e a faixa** | consertar e completar o que a rodada 1 achou em: grade com entidades · pôr direto · a entidade vira base na lista · a faixa (puxar a ponta, arrastar, botão direito) | sim | partida em tres: 8a, 8b, 8c (ver o fim deste arquivo). A 8a esta aberta |
| 9 | **Conexão: o slot vira base** | marcar a imagem como slot; ela vira base, com nome e animações | sim | espera a 8 |
| 10 | **O visualizador de montagem** | encaixar e desencaixar para testar, slots e skins. O botão "Aparecer na linha do tempo". Descartável | sim | espera a 8 |
| 11 | **"Este boneco"** | a peça em dois lugares da ordem de desenho. Mexe no **formato**, nos **dois runtimes** e no editor. A decisão do Humberto já está dada (decisões, seção 2). Provavelmente parte em duas | sim | espera a 8 |
| 12 | **Skin** | trocar, ignorar, esconder · apagar osso só na skin, com os filhos · clonar | sim | **feita** (v23.9). Conferida no uso pela rodada 21, em 05/10: 5 de 6 gestos |
| 13 | **Base e pivô** | peça tirada da base: as chaves ficam guardadas e voltam · acertar o pivô deixa o desenho parado | sim | aberta |
| 14 | **Partículas: a pesquisa** | o que as partículas do Construct e do Godot tocam. Proposta do que entra e do que pesa demais. **O Humberto aprova.** Sem código | não | **feita** (conferida pelo Diretor em 04/10; espera as respostas do Humberto) |
| 15 | **Partículas: usar** | lugar próprio com menu · clicar, mover e girar na cena · prender a osso | sim | **feita** (v24.0 a v24.3). Conferida no uso pela rodada 21, em 05/10: 6 de 7 gestos |
| 16 | **Partículas: o sistema** | o que a pesquisa aprovada pedir | sim | espera a 14 |
| 17 | **O resto da fila** | o que sobrou dos 78 itens da fila, por tarefa. Quem abrir esta rodada a parte em várias | sim | espera a 12 |
| 18 | **Leitor para o Godot** | o jogo lê o `.bone`, com encaixe e skin | sim | espera a 11 |
| 19 | **Leitor para o Construct** | o mesmo | sim | espera a 11 |
| 20 | **O fecho** | o Humberto faz o roteiro dos 30 minutos com a mão dele. O que ele achar vira a última rodada | — | espera todas |

A ordem pode mudar depois das rodadas 1 e 2: elas dizem quanto do trabalho já está feito.
Quem mudar a ordem escreve o porquê em "Desvios".

---

## O que cada rodada entregou

| # | Versão | Data | O que o Humberto vai ver |
|:---:|:---:|:---:|:---|
| 1 | sem versão (só conferência) | 04/10/2026 | `04 O QUE JA FAZ 2026-10-04.md`: 38 pontos, cada um com foto — **17 já faz · 7 pela metade · 10 não faz · 4 não achei** · a skin está quase toda de pé (8 de 13) · na conexão a entidade entra e tem faixa, mas **não se escolhe na cena, não volta, não vira base na lista** |
| 5 | sem versão (só desenho) | 04/10/2026 | `05 O DESENHO DOS MENUS 2026-10-04.md`: a barra com 12 menus — Imagens, Base, Malha e regras, Skins, Entidades e Partículas com menu próprio · os 232 itens de hoje com lugar (1 cabeça de submenu vazia sai) · o maior menu cai de 66 para 21 à vista |
| 8a | **v23.4** | 04/10/2026 | um clique na entidade a escolhe, e o botão direito abre a grade sobre ela · **"Tirar a entidade"** (botão direito ou menu Esqueleto) devolve a imagem de antes, como era · ela se move, gira e escala; Propriedades e Ordem dizem "espada", e o que não passa da imagem se diz em português. Fotos em `backup/fotos-obra/rodada-08a/` |
| 8d | **v23.5 a v23.8** | 04/10/2026 | **feita** (v23.5 a v23.8). Conferida no uso pela rodada 21, em 05/10: 8 de 9 gestos |
| 12 | **v23.9** | 04/10/2026 | com o lápis numa pele, o botão direito numa imagem tem **Esconder nesta pele** e **Ignorar nesta pele** (também em Esqueleto → Peles ▸), e a aba Peles ganha a lista **"Nesta pele"**, com o que ela troca, esconde e apaga · **tirar a pele, o osso dela some** da cena e da Árvore · **Delete num osso da base, com o lápis na pele, apaga só nela**, com os filhos; o rodapé diz os nomes, e a base não muda. Fotos em `backup/fotos-obra/rodada-12/` |
| 15 | **v24.0 a v24.3** | 04/10/2026 | o emissor tem uma **estrela na cena**, sempre, e um clique nela (ou numa partícula) o escolhe · o **painel Partículas**, com Novo ▾, Duplicar (semente nova) e Apagar; o emissor novo nasce no meio da cena, com imagem, apontando para cima · **Mover e Girar** agem nele (na animação, chave só dele); **prender** pela tecla P ou pelo campo Osso da ficha, sem sair do lugar. Por dentro: `x`, `y`, `rotation` no formato (§9.10), nos dois runtimes, três casos novos. Fotos em `backup/fotos-obra/rodada-15/` |
| 3 | **v24.4 a v24.6** | 05/10/2026 | **digitar 90 no Ângulo gira o osso**, com os desenhos (era só a ficha rápida); quando uma regra não deixa (o `arm` do herói é do `ik_arm`), o rodapé diz qual; Ctrl+A num campo seleciona o texto e não todos os ossos · **a pele e a animação exportadas voltam ao importar**: importar agora COPIA para dentro do corpo, e exportar → apagar → importar devolve o arquivo letra por letra (ela volta no fim da lista) · **o projeto pesado de outro programa diz quanto pesa aberto** (*"115 imagens: 7 MB no disco, e perto de 728 MB abertas"*) e pergunta antes: com as imagens, sem as imagens, ou não abrir. Fotos em `backup/fotos-obra/rodada-03/` |
| 6 | **v24.7 a v24.9** | 05/10/2026 | **a barra de doze menus**, na ordem do trabalho: Arquivo · Editar · Imagens · **Base** (era Esqueleto) · Malha e regras · Animação · **Skins** · Entidades · Partículas · Exibir · Janela · Ajuda; o Animação caiu de 35 linhas à vista para 21, e nenhum menu rola, nem em 1280×720 · **32 portas**: a malha e os pesos (eram zero itens de menu), apagar regra e parâmetro, as etiquetas, tirar a troca de base, as skins, pôr e promover entidade, copiar e colar pivô, prender o emissor; item cinza diz por quê · **"pele" virou "skin" e "corpo" virou "base"** na tela inteira (*Entregar uma base…*, a aba **Skins**). Fotos em `backup/fotos-obra/rodada-06/` |
| 8b | **v25.0 a v25.3** | 05/10/2026 | **feita** (v25.0 a v25.3). Conferida no uso pela rodada 21 |
| 8c | **v25.4 a v25.7** | 05/10/2026 | **feita** (v25.4 a v25.7). Conferida no uso pela rodada 21; a emenda e o salvar não foram vistos |
| 22 | sem versão (só pesquisa) | 05/10/2026 | `08 OS LEITORES - Godot e Construct 2026-10-05.md`: **Construct primeiro**, com o nosso `runtime/` inteiro dentro de um addon SDK v2 (é o que o Spine faz no plugin oficial; o dele pede r495 e não instala no r449) · **Godot em GDScript**, copiado do runtime Python; converter para nós do Godot perde demais (4 ossos por vértice, sem skin, sem regras) · os 90 casos rodam nas duas · a API: tocar, vestir, tirar skin, encaixar, desencaixar, animar e soltar a peça · Construct em 7 rodadas, Godot em 8; só a conexão espera a 11 · frase proposta para a briga da §2.8 · 6 páginas do Construct não lidas (verificação de robô) |
| K1 e K2 | sem versão ainda (a suíte inteira, o `tsc` e a versão esperam a máquina livre) | 05/10/2026 | a pasta nova **`leitor-construct/`**: o `runtime/` inteiro num `.js` só (454 KB, ES2021, sem o `render/canvas.ts`), e os **90 casos passam sobre esse arquivo** (90/90, 04h54) · `saida/Recorte.c3addon`: o objeto **Recorte**, SDK v2, mínimo **r449**, com as propriedades Arquivo, Animação inicial, Em laço e Escala, a ação **Tocar animação** (em laço ou uma vez) e as expressões **AnimacaoTocando** e **Avisos** · desenha com `drawMesh` (ossos, imagens, malha, ordem, cor, mistura, o aninhado); o Y vira num lugar só · `saida/heroi-andando.c3p`: o herói andando; Espaço ataca, W volta a andar · o que ainda não desenha avisa, na tela e no console: a máscara (K3), a cor escura, as partículas (K6) · **nada visto no Construct**: instalar e ver é a mão do Humberto (`leitor-construct/LEIA-ME.md`) · 48 testes novos |
| K3 | sem versão ainda (idem) | 05/10/2026 | **a máscara corta no Construct**: o leitor corta os triângulos na conta (o Construct não tem máscara), côncava ou não, por dentro ou invertida, e a do pai corta a entidade aninhada como um bloco · prova por amostragem contra o corte do editor: cada ponto desenhado ou não como o editor, com o mesmo uv, nunca duas vezes · a máscara que se cruza não corta e avisa · **a sequência** troca de quadro igual ao editor (o olho do B-105, a mão do herói) · 90/90 sobre o pacote, 05h02 · 61 testes |
| K4 | sem versão ainda (idem) | 05/10/2026 | **a skin no Construct**: ações **Vestir skin** e **Tirar skin**, expressão **Skins** (a pilha) · vestir põe no topo e a de cima vence; vestir de novo faz subir; tirar tira só aquela · a armadura esconde o cabelo e ele volta ao tirar · o mecha veste "inverno", de outro arquivo · o rabo do lobisomem (C-294) traz o osso, que aparece e some com a skin · cada pilha desenhada **bate com o editor**, peça a peça · o jogo salvo guarda a pilha · skin que não existe avisa · no exemplo: A veste a armadura, S tira · 90/90 sobre o pacote, 05h07 · 72 testes |
| K6 | sem versão ainda (idem) | 05/10/2026 | **as partículas no Construct**, pela mesma conta do editor (sem estado): todas as de um emissor num `drawMesh` só, cada uma com a sua cor nos vértices · **os 19 casos P e a fumaça do exemplo batem com o editor partícula a partícula**, em seis instantes; o mesmo instante pedido de novo dá o mesmo desenho · mais de **300** vivas num emissor: desenha todas e **avisa** com o número (o manual do Construct: "algumas centenas") · brilho pelo `setBlendMode("additive")`; se o Construct recusar, sai normal e avisa · condição nova **Está vestindo a skin** · no exemplo: **F** liga e desliga faíscas na mão (a skin "fogo" de `heroi-fogo.bone`) · 90/90 sobre o pacote, 05h15 · 106 testes |
| K7 | sem versão ainda (idem) | 05/10/2026 | **o herói aparece parado no editor de layout**, do tamanho certo, com as skins iniciais (a mesma conta do jogo; testado num editor de mentira) · propriedade nova **Skins iniciais** · ações **Mudar a velocidade**, **Pausar**, **Continuar**, **Espelhar** · condições **Está tocando a animação**, **Está espelhado** · gatilhos **Ao terminar a animação** (só sem laço) e **Ao evento** (as chaves de evento do `.bone`), com **EventoNome**, **EventoInteiro**, **EventoNumero**, **EventoTexto** · **a partícula com folha de quadros**, com a conta feita à mão antes (por segundo, pela vida e com quadro inicial), e contra o editor · no exemplo: o ataque termina e ele volta a andar sozinho, X espelha, P pausa, C continua, o painel mostra "step" e "hit" · 90/90 sobre o pacote, 05h25 · 129 testes |
| K5 | sem versão (idem) | 05/10/2026 | **a conexão no Construct**: o desenhador pelos três grupos de 7.11 (`collectDrawGroups`): C-310 a C-319 batem peça a peça e máscara a máscara com o `esperado.json` e com a `drawList` do runtime; X-307 em bloco, e avisa · ações **Encaixar** (com **em volta de**, opcional: o "Este boneco" pelo jogo), **Desencaixar**, **Encaixar todas** (as rodas), **Animar a peça**, **Soltar a peça** · gatilho **Ao encaixar**, condição **O slot mostra a peça**, expressões **Slots**, **Entidades**, **PecaDoSlot**, **SlotDoEncaixe**, **OssoX/OssoY/OssoAngulo** e **SlotX/SlotY/SlotAngulo** (conta à mão num osso girado e com escala, parado, girado e espelhado) · por dentro, uma skin feita na hora, no topo da pilha; a peça é lida da pasta Files no primeiro Encaixar · o `reset` da física agora dispara (o achado 2 da G6: o C-262 passo a passo; com o Tocador velho cai depois da chave) · o jogo salvo guarda os encaixes e o relógio da peça · no exemplo: **E** troca a espada pelo capacete, **Q** liga a aura **em volta**; o `.c3p` agora é montado pelo `montar.mjs` · **achados**: seis arquivos de teste do leitor rodavam o herói SEM as regras (física, ik: "noop"), e dois testes eram verdes só por isso; o teste "nenhuma chave desfaz o encaixe" usava o herói, que não tem chave de imagem na arma · 90/90 e os 14 novos sobre o pacote, 11h58 · 162 testes |
| G1 e G2 | sem versão (fecha no disco; a versão espera a casa vazia) | 05/10/2026 | a pasta nova **`leitor-godot/`**: um projeto do Godot 4.7 com o addon em `addons/recorte/`, GDScript copiado do runtime Python (cada `.gd` diz de qual `.py` veio) · o nó **Recorte**: Arquivo, Animação inicial, Em laço, Escala, Velocidade; **`tocar("walk")`** em laço ou uma vez, `tocando`, `parar`, `pausar`, `continuar`; sinais **`terminou`** e **`evento`** · desenha com `canvas_item_add_triangle_array`; o Y vira num lugar só · **casos A 13/13 e X 5/5 pelo Godot sem janela** (07h18), cada um visto vermelho antes · o desenho do herói parado **bate peça a peça** com o do Construct (17 peças) · o que não desenha avisa: o rosto e a máscara (G3), a espada (G5), as regras (G6) · **nada visto com janela**: abrir e ver é a mão do Humberto (`leitor-godot/LEIA-ME.md`) · 18 testes do Godot |
| G3 | sem versão (idem) | 05/10/2026 | **a malha no Godot**: com pesos, linkedmesh, deform, morph e o quadro da sequência · **a máscara corta na conta** (`corte.gd`, copiado do corte do Construct): côncava ou não, por dentro ou invertida; a que se cruza não corta e avisa · **o rosto do herói aparece** e respira no idle (tecla **I** no exemplo) · o herói sem regras, cortado, **bate peça a peça** com o do Construct parado e em 6 quadros das três animações · **casos A 13, B 7, X 5 pelo Godot** (07h25), cada caso B visto vermelho por um estrago na coisa que ele olha · 30 testes do Godot · a mistura additive e multiply está ligada no nó, mas **nenhum boneco do exemplo usa**: não provada |
| G4 | sem versão (idem) | 05/10/2026 | **a skin no Godot**: `vestir("armadura")` põe no topo e a de cima vence; vestir de novo faz subir; `tirar_skin` tira só aquela; `skins()`, `esta_vestindo`; propriedade **Skins iniciais** · a skin e a animação **de outro arquivo** (o mecha veste "inverno"; o rabo do lobisomem traz o osso) · skin que não existe avisa · **7 pilhas no herói (parado e andando) e 3 no mecha batem peça a peça com o Construct**, e o nó monta a mesma pilha que ele · no exemplo: **A** veste a armadura, **S** tira · o nó apagado não deixa nada na memória (achado e consertado nesta rodada) · suíte inteira pelo Godot, 07h31: **43 de 90** (A, B, X cheios; C 18 de 44: caem as 17 de regra, G6, e as 9 de entidade e corpo, G5; P 0 de 19, G7; BIN e ZIP, G8) · 51 testes do Godot |
| G6 | sem versão (idem) | 05/10/2026 | **as regras no Godot** (`regras.gd`, copiado de `constraints.py`): ik de 1 e 2 ossos, transform (mundo e local, absoluto e relativo), caminho, física e driver; a timeline de regra, o `reset` da física e o `applied_from_world` · **os 17 casos de regra passam**; suíte inteira pelo Godot, 10h17: **60 de 90** (A, B, X cheios; C 35 de 44, caem só as 9 de entidade e corpo, G5; P 0 de 19, G7; BIN e ZIP, G8) · regra 26 por tipo: estragada a conta de ik, transform, caminho, física e driver, cada um ficou vermelho e voltou; a física só ficou vermelha pela gravidade (os 3 casos dela usam `damping 1`, e o amortecimento nunca é olhado pela suíte: provado pelo cabelo do herói) · **o herói com as regras bate com o runtime Python em todos os canais** (até 7e-14) e **peça a peça com o desenhador do Construct** parado e em 12 quadros das três animações, pelo caminho de passos do jogo, inclusive o quadro pulado · **achado e consertado**: a referência "com regras" da G1 saía igual à "sem regras" (o gerador não importava as regras, que se registram por efeito colateral) · achado, não consertado: o JSON do Godot lê `0.016666666666666666` uma casa binária abaixo de 1/60 · 69 testes do Godot |
| G7 | sem versão (idem) | 05/10/2026 | **as partículas no Godot** (`particulas.gd`, copiado de `particles.py`): a extensão `BONE_particles` no carregador (anexo e timeline), o canal `particles` no dump, a pose do nascimento para `space: "world"` · **os 19 casos P passam**, nenhum com lista vazia; suíte inteira pelo Godot, 10h33: **79 de 90** (caem só as 9 de entidade e corpo, G5, e BIN e ZIP, G8) · o desenho: **todas as partículas de um emissor numa chamada só**, com a cor de cada uma nos vértices; o brilho (additive) pelo material do Godot; `screen` sai normal e avisa · **as faíscas da skin "fogo" batem peça a peça e vértice a vértice (lugar, uv, cor) com o desenhador do Construct**, em 7 quadros, e nas variantes folha de quadros por fps e pela vida e 347 vivas (desenha todas e avisa com o número) · **a fumaça do `particulas.bone` bate partícula a partícula** com o runtime de referência (137 partículas, parada e em laço) · o mesmo instante pedido de novo sai igual; em 61 passos ou num salto, as faíscas saem iguais · a folha de quadros com a conta à mão antes · regra 26: estragados a posição com arrasto, a ordem, a rajada, a matriz do `world`, o giro do desenho e o quadro da folha; cada um vermelho, e voltou · no exemplo, **F** liga e desliga as faíscas (o `heroi-fogo.bone` do Construct) · medido sem janela: walk 1,0 ms por quadro, com faíscas 3,5 ms · 103 testes do Godot |
| G8 | sem versão (idem) | 05/10/2026 | **a casca do leitor do Godot** · `.boneb` (`binario.gd`, copiado de `binary.py`) e `.bonez` (o zip lido na conta, pelo diretório central: o `ZIPReader` do Godot só abre por caminho) · **BIN-401 e ZIP-501 passam**; suíte inteira pelo Godot, 11h19: **81 de 90** (caem só as 9 de entidade e corpo, G5) · **o importador que só guarda** (`importador.gd`): `.bone`, `.bonez` e `.boneb` viram recurso com os MESMOS bytes; provado sem janela pelo `--import` do Godot (o atlas é recurso JSON do Godot e a imagem é textura; os dois vão junto) · **o nó no editor** (`@tool`): parado no editor, Inspetor com arquivo, animação inicial, laço, escala, skins; o editor sem janela abriu o exemplo e o nó desenhou · **o `physicsDt` exato**: a sonda relida do texto pelo caminho rápido de Clinger; o teste mostra o defeito e o conserto · **additive e multiply** provados contra o Construct, e o material de cada um · **a velocidade** (`testes/medir.gd`, máquina a 40% com outros chats): 1 herói 1,0 ms por quadro; com faíscas 3,1 ms; 10 heróis com faíscas 34 a 37 ms; a parte quente é a partícula (~50 µs cada), espalhada, sem ponto barato: só relatada · **achado**: mudar o importador não reimporta (só a origem conta; `_get_format_version` testado e não funcionou no 4.7.2) · exportar para a web: **não provado** (pede os modelos de exportação, que não se baixam aqui) · 121 testes do Godot |
| G5 | sem versão (idem) | 05/10/2026 | **a conexão no Godot**: o esqueleto aninhado e a virada de corpo copiados do Python (`ator.gd` de `actor.py`, `lista_desenho.gd` de `draw_list.py`; o carregador lê o filho, os corpos e o `around`, leitor 1.1) · o desenhador pelos três grupos de 7.11, pela mesma volta da `drawList`: C-310 a C-319 e X-307 batem peça a peça e máscara a máscara · **a espada do herói aparece** · `encaixar(slot, peça, em_volta)`, `desencaixar`, `encaixar_todas` (as rodas; as armas trocam separado), `animar_peca`, `soltar_peca`, o sinal `encaixado`, `slots()`, `entidades()`, `peca_do_slot`, `osso_posicao/angulo`, `slot_posicao/angulo` · por dentro, uma skin feita na hora, sempre no topo (também depois de uma virada de corpo) · no exemplo, **E** troca a espada pelo capacete, **Q** liga a aura em volta · **achado** (regra 26): nenhum caso nem teste prendia "o filho em bloco é cortado pela máscara do pai"; teste à mão novo · 90 de 90 e os 15 de `casos-pendentes/` pelo adaptador, 15h41 · **162 testes** do Godot (eram 121) · velocidade: um herói 1,05 → 1,36 ms; dez com faíscas 53,6 → 58,3 ms |
| G9 | sem versão (idem) | 05/10/2026 | **as partículas ao longo de um caminho no Godot** (`shape: "path"`, §9.4.2): `particulas.gd` e `carregador.gd` copiados do Python · **110 de 110** pelo adaptador, 18h56 · **179 testes** do Godot (eram 162) · seis estragos na cópia (por `t`, curva na amostra, sem a inversa, comprimento exato, sem a curva que volta, `spherize` no esqueleto): cada um derruba o caso dele, P-021 a P-026 · o desenho: as faíscas no caminho da capa (outro slot), em `world` e em `local`, batem com o desenhador do Construct em 5 quadros (`referencia/caminho.json`) · curva ausente ou que não é caminho: não desenha e avisa · **desvio do Python, pela spec**: a malha em `world` volta ao referencial do emissor (passo 7); o Python de 05/10 leva o ponto ao esqueleto duas vezes, e nenhum caso da suíte tem malha em `world` (teste à mão no Godot) · a tecla da capa no exemplo não coube sem mexer no `heroi-fogo.bone` do Construct |
| 21 | sem versão (só conferência) | 05/10/2026 | `07 A NOITE CONFERIDA 2026-10-05.md`: as sete rodadas da noite usadas no programa montado v25.7 (140 fotos) — **31 vi funcionar · 6 pela metade · 0 não funciona · 4 não deu sem janela** · o pior defeito: **`Delete` com uma chave selecionada apaga o osso ou a imagem, não a chave** (vale para toda chave) · a skin nova nasce com o nome "pele" e sobrou "esqueleto" em 6 textos · seleção fantasma depois de tirar a skin · em tela de 1080 de altura o Ângulo da ficha rápida cai fora do painel |
| 24 | sem versão (só conferência) | 05/10/2026 | `11 OS CONSERTOS E OS PAINEIS CONFERIDOS 2026-10-05.md`, no programa montado v27.3, em 1920×1080, 1440×900 e 1280×720, com mouse e teclado de verdade: **os painéis 11 de 12 vi funcionar** (soltar, recolher em ícones, dois cliques, o solto dentro da cena, Shift+Tab, o botão dos contextos; o `.bone` salvo não leva arranjo) · **os consertos da 23: 10 vi funcionar, 3 pela metade (a entidade entra deitada; o emissor ainda abre a seção "ANEXO"; sobra "esqueleto" no rodapé de abrir `.bone` sem atlas), 1 não funciona (o "Sobre" diz v27.2 com o programa v27.3), 1 não dá sem janela** · piores: Soltar pelo menu solta o painel errado · a Árvore vira fresta com a linha do tempo aberta · o canto do solto não segue um arrasto rápido. Fotos em `backup/fotos-obra/rodada-24/` |
| 14 | sem versão (só pesquisa) | 04/10/2026 | `06 AS PARTICULAS - pesquisa e proposta 2026-10-04.md`: o formato já tem quase tudo; falta a porta no editor · a régua "o que os dois tocam" corta demais (o Construct é pequeno): proposta de régua nova · por que ele não clicou, moveu nem prendeu, com a linha do código |

---

## Perguntas para o Humberto

| Rodada | A pergunta | A suposição de quem perguntou | A resposta |
|:---:|:---|:---|:---|
| 5 | cinco perguntas no fim do `05 O DESENHO DOS MENUS`: pele → skin · Esqueleto → Base · Malha e regras num menu só · importar e exportar ficam no Arquivo · corpo → base | sim, sim, um menu só, ficam no Arquivo, sim | |
| 14 | cinco perguntas no fim do `06 AS PARTICULAS`: régua nova · mover o emissor por campos (muda o formato) ou por osso próprio · trilha e sub-emissor depois · partícula-entidade · exportar para a partícula nativa | sim · campos · depois · depois · não agora | |

---

## Desvios

(vazio)

### 04/10/2026, noite — o Diretor conferiu as rodadas 5 e 14

| Rodada | Como conferi | O que achei |
|:---:|:---|:---|
| 5 | li o `05` inteiro; refiz as somas da conta dos 232 (fecham: 231 com lugar, 1 cabeça de submenu vazia sai); procurei dez itens por amostra em `ui/menus.ts` (os dez existem) | bom. Não recontei os 232 um a um |
| 14 | li o `06` inteiro | bom, e franco: **a régua que o Diretor propôs para as partículas estava errada** (cortava a cor ao longo da vida, o giro, a folha animada). A régua nova está na pergunta 1 do `06`. O Construct foi lido pelo índice de busca, não pela página: o que diz "não achei" não é certeza |

**O que muda na ordem:**

| Mudança | Por quê |
|:---|:---|
| A **rodada 2** não confere mais as partículas | a rodada 14 já achou, no código e com linha, por que ele não conseguiu clicar, mover nem prender |
| A **rodada 15** deixa de esperar a 2 | pelo mesmo motivo. Ela espera só a vez de escrever código (depois da rodada 1 soltar o `programa/`) |
| As **rodadas 18 e 19** crescem, se a régua nova for aceita | o nosso leitor passa a desenhar as partículas nas duas engines |

### 04/10/2026, noite — o Diretor conferiu a rodada 1, e a rodada 8 parte em três

| Como conferi | O que achei |
|:---|:---|
| li o `04` inteiro; abri duas fotos por amostra (`26_C12`, a faixa com o menu de animações; `62_S8`, o osso que fica depois de tirar a pele) | as fotos mostram o que o texto diz. O `04` separa o que foi provado do que não foi. Bom |

**O quadro da rodada 1:** de 38 pontos, **17 já faz · 7 pela metade · 10 não faz · 4 não achei.**
A skin está quase de pé. A conexão tem a entrada e a faixa, e **não tem o meio**: a entidade no lugar não se escolhe, não se move, não volta.

| # | Rodada | O quê | Código? | Estado |
|:---:|:---|:---|:---:|:---:|
| 8a | **Conexão: a entidade se escolhe, se move e volta** | C5, C16 e os achados 1, 3 e 4 do `04`. Ficha em `rodadas/` | sim | **feita** (v23.4; conferida pelo Diretor no programa em 04/10) |
| 8b | **Conexão: vira base na lista, e cai onde soltei** | C9, C10, C18 e o achado 2 | sim | **feita** (v25.0 a v25.3). Conferida no uso pela rodada 21 |
| 8c | **Conexão: a faixa de verdade** | puxar a ponta, arrastar, laço e tamanho: C13, C14, C15 | sim | **feita** (v25.4 a v25.7). Conferida no uso pela rodada 21; a emenda e o salvar não foram vistos |

**A ordem das rodadas de obra, uma por vez** (só uma escreve código e usa a máquina):
8a → 12 (skin: S3, S4, S8, S9) → 15 (partículas: usar) → 3 (o que perde trabalho) → 6 (os menus) → 8b → 8c → 13 → 7.
A rodada 2 (conferir a tela e os menus do Spine) entra num intervalo entre duas de obra.

**Um achado que liga duas rodadas:** a rodada 14 achou que o clique na cena **pula quem não tem contorno** (`viewport/picking.ts:298`) e que Mover e Girar **só agem em imagem** (`viewport/tools/attachment-edit.ts:75`). É por isso que o emissor não se clica. A rodada 1 achou o mesmo sintoma na **entidade**. Provavelmente é a mesma causa. A 8a conserta para a entidade de um jeito que a 15 reaproveite.

### 04/10/2026, noite — o Humberto respondeu as onze perguntas: "sim pra tudo"

As sugestões eram do Diretor. Com o "sim", viram decisão.

| # | Decisão | Vale para |
|:---:|:---|:---|
| 1 | A palavra **"pele" vira "skin"** no programa inteiro | rodada 6 |
| 2 | O menu Esqueleto passa a se chamar **"Base"** | rodada 6 |
| 3 | Onde o programa diz **"corpo", passa a dizer "base"** | rodada 6 |
| 4 | Malha, pesos, regras, física e caminho num menu só: **"Malha e regras"** | rodada 6 |
| 5 | Importar e exportar skin e animação ficam no **Arquivo** | rodada 6 |
| 6 | **A régua das partículas:** entra o que é função pura do tempo e o nosso leitor desenha barato no Godot e no Construct | rodadas 15, 16, 18, 19 |
| 7 | **O emissor ganha posição e giro próprios** (`x`, `y`, `rotation`), como a imagem. **Muda o formato**: a decisão do Humberto está dada | rodada 15 |
| 8 | Trilha e sub-emissor (nascer e morrer): **depois** do básico | rodada 16 |
| 9 | Partícula que é entidade inteira: **depois** | — |
| 10 | Exportar para a partícula própria da engine: **não agora** | — |
| 11 | Arquivar os chats das rodadas 5 e 14 | feito pelo Diretor |

**O desenho dos menus (`05`) está aprovado**, com as respostas 1 a 5. A rodada 6 deixa de esperar: está **aberta**.

**Uma lição do Diretor, pela forma:** *pus as perguntas no fim, e depois escrevi duas mensagens por cima delas.* O Humberto não as viu. Pergunta sem resposta **se repete no fim de cada mensagem seguinte**, inteira, até ele responder.

### 04/10/2026, noite — a imagem e a peça encaixada viram chave, como no Spriter

A rodada 8a achou, no código, que **a imagem não vira chave hoje**: mover uma imagem no meio da animação grava na base, e o rodapé avisa *"Posição do desenho é da montagem: ela não vira chave"* (`viewport/tools/attachment-edit.ts:145`). A ficha do Diretor dizia "vira chave, como a imagem": estava errada.

O Diretor perguntou ao Humberto. A resposta: ***"sim, como no Spriter."***

| Decisão | |
|:---|:---|
| Mover, girar ou mudar o tamanho de uma **imagem** ou de uma **peça encaixada** no meio da animação **cria chave**, sozinho | é o que o Spriter faz (a rodada 8a leu no manual) |
| Como, por dentro (sugestão aceita) | cada imagem ganha **um osso só dela**, escondido. Mover a imagem move esse osso, e a chave é dele. **Não muda o formato.** O importador do Spriter já faz assim (`ferramentas/src/importar/spriter.ts:466`) |
| O osso escondido **não aparece na Árvore** como osso | senão a Árvore enche, e o Humberto não quer tudo na árvore |

| # | Rodada | O quê | Código? | Estado |
|:---:|:---|:---|:---:|:---:|
| 8d | **A imagem e a peça viram chave, como no Spriter** | mover, girar e escalar a imagem ou a entidade na animação cria chave. Na base continua gravando na base | sim | **feita** (v23.5 a v23.8). Conferida no uso pela rodada 21, em 05/10: 8 de 9 gestos |

Na ordem das rodadas de obra, a 8d entra **logo depois da 8a**: 8a → 8d → 12 → 15 → 3 → 6 → 8b → 8c → 13 → 7.

**Nota do Diretor sobre a 8d, 04/10, mais tarde:** a rodada 8a provou com o mouse que **clicar na imagem (ou na entidade) na cena escolhe o osso dela junto**, e mover na animação **já cria chave**, no osso. O que continua sem chave é só mexer na imagem **sozinha**, sem o osso (escolhida pela Árvore ou pela Ordem), e a imagem que **divide o osso com outras** (mover uma move todas). A 8d fica menor: é só esse caso. A decisão do Humberto (*"como no Spriter"*) continua valendo para ele. Quem abrir a 8d confere primeiro, no uso, o que sobra.

### 04/10/2026 — a 8d, nas palavras do Humberto: como o Spriter faz

> *"No Spriter, quando você move o osso, ele cria uma chave. Quando você move a imagem, ela também cria uma chave. E ela não leva o osso. Se eu tenho duas imagens coladas no mesmo osso, se eu movo uma imagem, ela cria uma chave, mas não faz uma chave nem para o osso, nem para a outra imagem que estava colada no osso. Normalmente, eu pegava e bloqueava as imagens, para não correr o risco de clicar nelas e mover."*

| O gesto | No Spriter (é o alvo da 8d) | No nosso hoje (provado pela 8a) |
|:---|:---|:---|
| mover o **osso** | chave do osso | igual |
| mover a **imagem**, clicando nela na cena | chave **só da imagem**. O osso não se mexe, nem as outras imagens do osso | o clique pega o **osso junto**, e a chave vai para o osso: as outras imagens do osso vão junto |
| não mexer na imagem sem querer | ele **trava as imagens** | existe "Travar desenhos" na barra |

**A nota anterior do Diretor ("a 8d fica menor") estava errada.** A 8d **não é pequena**: ela muda o que o clique na imagem faz. E vale igual para a peça encaixada.

**Confirmado pelo Humberto (*"sim, como no Spriter"*):** o clique na imagem **deixa de pegar o osso junto**. Clicar na imagem move só a imagem, com chave só dela. Quem quer mover o osso clica no osso. "Travar desenhos" fica para quem não quer mexer nas imagens sem querer. Vale igual para a peça encaixada. **É a rodada 8d.**

### 04/10/2026, 21h30 — o Diretor conferiu a rodada 8a NO PROGRAMA: feita (v23.4)

Conferi no `programa/` montado (porta 5180), com o mouse, no herói de exemplo.

| # | A linha da ficha | Como conferi | Resultado |
|:---:|:---|:---|:---:|
| 1 | clicar na entidade a escolhe | cliquei na espada da mão: Propriedades diz *"Osso: forearm · entidade espada"* | **vi** |
| 2 | botão direito abre a grade sobre ela | troquei o rosto pela espada, botão direito em cima: a grade abre, com a ficha *"Entidade / espada"* | **vi** |
| 3 | a entidade volta a ser imagem | cliquei em **Tirar a entidade**, na grade: *"head volta a mostrar a imagem de antes, "face", como era"*. O rosto voltou, e os avisos zeraram | **vi** |
| 4 | mover, girar, escalar; números em Propriedades | **não conferi com a mão.** Vale a palavra e as fotos do executor (`backup/fotos-obra/rodada-08a/`) | não vi |
| 5 | Propriedades e Ordem dizem o nome | a Ordem diz *"weapon: entidade espada"*. A Árvore ainda diz o nome antigo (o executor avisou) | **vi**, com a ressalva |
| 6 | o aviso em português | *"Não passam para "espada": 3 chaves de deformação (animação idle), 1 malha ligada e 1 alvo de morph. "face" era malha, e a entidade não tem malha. Ficam no arquivo, sem efeito, e voltam a valer com a imagem."* | **vi** |

**Dois achados do Diretor, para uma rodada futura:**

| # | Achado |
|:---:|:---|
| 1 | Com a espada **original** do herói escolhida (ela nunca foi imagem), *Esqueleto → Tirar a entidade* fica **apagado e não diz por quê**. O certo: dizer "esta entidade não tem imagem de antes" |
| 2 | **A contagem de testes não bate.** O `ESTADO.md` de 29/09 diz 4.608. O executor da 8a mediu **4.514 antes de mexer** e 4.536 depois (+22 dele). Nenhum arquivo de teste mudou desde 29/09 (são 79 arquivos no zip da v23.3 e 79 hoje). **Ninguém sabe de onde vêm os 94 de diferença.** A regra 9 da casa diz que a contagem nunca cai: enquanto isto não for explicado, o número de referência é **4.536, medido em 04/10 às 21h05**. A próxima rodada de obra guarda a contagem **por arquivo** no fecho, para a comparação ser possível daqui em diante |

**O que a rodada 15 reaproveita** (dito pelo executor): o clique em anexo sem contorno é um ramo no `pickAll` de `viewport/picking.ts`; `attachmentWorldPoints` devolve uma caixa de 4 cantos; `pickedFor` em `tools/attachment-edit.ts` aceita o tipo por lista (`region`, `skeleton`): o emissor entra ali quando tiver `x`/`y`.

**Onde mora a imagem de antes:** no próprio anexo, em `extensions.RECORTE_editor_state.imagemDeAntes`. Sem campo novo no núcleo.

### 04/10/2026 — partículas: a forma "ao longo de um caminho" entra na rodada 16

O Humberto: *"uma coisa que eu acho interessante na partícula do Niagara é que lá tem várias formas de emissor."*

| Decisão | |
|:---|:---|
| A rodada 16 dá **controle na tela** a todas as formas que o formato já tem: ponto, retângulo, círculo, anel, arco, linha, osso, malha | com um seletor de forma que mostra o desenho de cada uma |
| Entra uma forma nova: **ao longo de um caminho** (a curva que o programa já tem) | valor novo no formato; o Humberto disse *"sim, na rodada 16"*. Tem de continuar função pura do tempo |

### 04/10/2026, 21h50 — rodada 8d, lote 1: v23.5 (o Diretor viu a foto; a conferência com a mão fica para o fim da rodada)

| O quê | |
|:---|:---|
| A imagem escolhida pela Árvore, movida na animação, cria **chave só dela** | foto `10`: a mão se afasta do antebraço, e a folha ganha a linha **"Imagem hand"** |
| `Ctrl+Z` tira a chave e o osso próprio, e o arquivo volta letra por letra | teste |
| **Quantas peças do herói ganham chave própria: 19 de 23.** Recusam 4: `head` (malha), `mask` (máscara), `hitbox` (caixa), `cape_path` (caminho) | o programa avisa |
| **A cabeça é malha.** No lote 2, a peça que recusa o osso próprio continua escolhendo o osso junto, como hoje, e o rodapé diz por quê | decisão do Diretor, reversível. **Vai para o Humberto de manhã**: o Spriter não tem malha |

**A contagem de testes está explicada.** O 4.608 de 29/09 foi a soma de três rodadas com filtro de caminho: `editor/testes/ferramentas.test.ts` (82) e `ferramentas/testes/dois-runtimes.test.ts` (11) foram contados duas vezes. **A contagem nunca caiu.** O número certo de 29/09 era perto de 4.515. Hoje, v23.5: **4.550**. A contagem por arquivo está em `backup/contagem-testes_2026-10-04_21-39_v23.5.tsv`. O `ESTADO.md` e a regra 9 do `CLAUDE.md` ainda dizem os números velhos: quem fechar a rodada 8d corrige o quadro do `ESTADO`.

### 04/10/2026, 22h — rodada 8d, lote 2: v23.6 (o clique). Conferência com a mão: no fim da rodada

| O quê | |
|:---|:---|
| Clicar na imagem escolhe **só a imagem**; mover cria chave só dela; a entidade faz igual | fotos `20` a `24` |
| Clicar no **corpo do osso** pega o osso, mesmo com imagem por cima (com "Ver ossos" ligado). A **ponta** do osso (os últimos 20%) não: a peça da ponta precisa continuar clicável | decisão do executor, para a linha 4 não quebrar. Aceita pelo Diretor |
| Travar desenhos: o clique passa. O sentido do botão não mudou | como no Spriter |
| Peça que não anda sozinha (malha, caixa, caminho, máscara) continua trazendo o osso | para o Humberto, de manhã |
| **Mudou de propósito:** clicar numa imagem e criar ponto ou caixa põe o ponto **dentro do slot da imagem** (antes ia para a raiz) | 5 testes reescritos, pelo nome, na mensagem do executor |
| Suíte 4.554 · roteiro 14/14, nenhum passo mudou | 21h53 a 21h56 |

**Achado para a rodada 8c:** a espada (entidade com animação própria) **salta ~1,8** na primeira chave criada em qualquer peça, e não volta com `Ctrl+Z`. É o relógio da animação dela. Roteiros em `backup/fotos-obra/rodada-08d/roteiros/checar-espada*.mjs`.

### 04/10/2026, 22h15 — rodada 8d entregue (v23.7). Conferida pelas fotos, NÃO pela mão

| O quê | |
|:---|:---|
| As oito linhas da ficha | o executor diz **feitas**. Vi as fotos `10` (a mão, chave só dela, linha "Imagem hand") e `22` (a espada movida sozinha, "Entidade: espada (em weapon)") |
| **Por que não conferi com a mão** | o Humberto está dormindo e a janela do programa **não desenha com a tela apagada**: sem foto da tela, clicar na cena seria às cegas. Não marco "feita" sem ver. **Fica para de manhã**, com a janela à vista |
| Pela metade, dito pelo executor | malha, caixa, caminho e máscara recusam o osso próprio, com aviso (4 de 23 no herói) · arquivo importado do Spriter **antes** de hoje ainda mostra o osso próprio na cena (reimportar resolve) · apagar, copiar e arrastar a chave da linha "Imagem …" não foram testados à parte |
| Números da v23.7 | suíte 4.560 · tsc limpo · 87/87 · roteiro 14/14 · medir 28/28 e 19/28 · 22h04 a 22h07 |
| A regra 9 do `CLAUDE.md` ainda diz "Hoje: 2.666" | número velho. O Diretor corrige de manhã, com o Humberto sabendo |

**A rodada 12 (skin) começou às 22h15**, no chat RESERVA 1, em Opus.

**22h20 — a 8d fechou ainda a v23.8:** clicar numa peça-malha (a cabeça) diz no rodapé *"head é uma malha: ela se move pelo osso dela"*, com teste. Suíte 4.561. **Um tropeço do Diretor, pela forma:** *mandei a rodada seguinte começar antes de a anterior ter lido a minha última mensagem.* A 8d ainda fechou uma versão com a 12 já aberta (a 12 estava só lendo; avisei-a do chão novo). Daqui em diante: a rodada seguinte só começa depois de a anterior dizer "larguei a máquina" **e** não ter mensagem minha na fila.

### 04/10/2026, 22h45 — rodada 12 entregue (v23.9). Conferida pelas fotos, não pela mão

| O quê | |
|:---|:---|
| S4 esconder · S3 ignorar · S8 o osso some com a skin · S9 apagar osso só na skin, com "Devolver o osso" | o executor diz **feitas**. Vi a foto `90`: a aba Peles lista *"osso arm_b apagado · arm_back escondida · forearm_back escondida · hand_back escondida"*, e o rodapé diz *"Saíram da pele "pele" 2 ossos (arm_b, forearm_b) e 3 imagens…"* |
| S11 a de cima vence · S12 a Visualização não muda o arquivo | provadas, com foto e teste |
| **Sem campo novo no formato.** Esconder usa o `null` que a spec já tem (§4.4, §7.1). A marca dos ossos apagados fica em `skin.extensions.RECORTE_editor_state.ossosApagados` | |
| O gesto de esconder e ignorar foi copiado do Spriter (manual 1.4, pág. 22: *Set Ignored*, *Set Hidden*). **O S9 é nosso**: nem o Spriter nem o Spine apagam osso da base só numa skin | |
| Números | suíte 4.596 · tsc limpo · 87/87 · roteiro 14/14 · medir 28/28 e 19/28 · 22h35 a 22h38 |
| **Achado para outra rodada** | na Visualização em tela cheia, com `default` e `armadura` desligadas, a cena ainda desenha cabeça e tronco (foto `81`) |
| Os textos ainda dizem "pele" | a troca por "skin" é da rodada 6 |

**Aprendido pelo Diretor nesta noite, para o próximo Diretor:** mensagem mandada a um chat que está no meio do trabalho **fica na fila até ele parar**. Três avisos meus à rodada 12 só chegaram no fim. O que tem de valer desde o começo vai **na ficha**, não em mensagem depois.

### 04/10/2026, 23h40 — rodada 15 entregue (v24.0 a v24.3). Conferida pelas fotos, não pela mão

| Versão | O quê |
|:---:|:---|
| v24.0 | a **marca** do emissor na cena (estrela de 4 pontas e o traço da direção); **clicar** nela, ou numa partícula viva, escolhe só o emissor |
| v24.1 | o **painel Partículas**: Novo (vazio e 4 modelos), Duplicar com semente nova, Apagar, a lista; o emissor **nasce onde se vê**; o vazio desenha; **os avisos aparecem** |
| v24.2 | **o formato**: `x`, `y`, `rotation` do emissor (§9.10 da extensão). Dois runtimes, escritos sem um olhar o outro, **bateram de primeira**. Casos P-018, P-019, P-020. Conformidade **90/90**. Arquivo sem os três campos sai byte a byte igual, provado por teste. O Diretor refez à mão as contas do P-018 e do P-019 antes de dar o "pode" |
| v24.3 | **mover e girar** o emissor (na base grava; na animação, chave só dele); **prender a osso** pela tecla P, pela Árvore ou pelo campo Osso; o emissor novo **aponta para cima no mundo** |

| | |
|:---|:---|
| Vi a foto `42` | a marca laranja ao lado do herói, a aba **Partículas** na coluna, e a ficha com *"Onde está: Osso torso"* |
| Números da v24.3 | suíte 4.654 · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · 23h32 a 23h34 |
| **Ficou de fora, dito pelo executor** | o emissor **ainda aparece na Árvore** também (além do painel) · Duplicar diz "20 px à direita" e a cópia fica no mesmo lugar · a ficha do emissor ficou mais alta e não foi medida de novo · Escalar o emissor recusa, e diz por quê |
| Intermitente, pelo nome | `ferramentas/testes/fatiar.test.ts` › "linha de comando grava o .bone…": caiu uma vez sob carga e passou sozinho (regra 24) |

### 05/10/2026, 00h35 — rodada 3 entregue (v24.4 a v24.6)

| Id | Estado | O que ele vai ver |
|:---:|:---|:---|
| **J9** | consertado (v24.4) | digitar 90 no Ângulo gira o osso. Se uma regra segura o osso, o rodapé diz qual. `Ctrl+A` num campo de número é do campo |
| **M17** | consertado (v24.5) | exportar a skin, apagar e importar: ela volta igual, com o que esconde e apaga. A animação importada, que aparecia e não tocava, também |
| **E6** | consertado pelo aviso (v24.6) | antes de abrir um projeto pesado, o programa diz o número (*"115 imagens: 7 MB no disco, e perto de 728 MB abertas"*) e dá três caminhos: com as imagens · sem as imagens · não abrir |

| | |
|:---|:---|
| **Mudou, e o Diretor aceitou:** Importar skin e Importar animação passam a **copiar** para dentro do boneco, em vez de citar o arquivo de fora | citar não funcionava no editor; copiar é o que o Spine faz (*Import Data*). Vai para o Humberto de manhã, como aviso |
| **Ficou de fora** | abrir o projeto grande **com** as imagens continua pesado · a Biblioteca de animações ainda cita por fora (a mesma forma do M17; não foi mexida) |
| **Pergunta de formato, para o Humberto** | malha com **pesos** numa skin exportada: duas regras da spec brigam (§2.8 e o `binding.bones`). Não foi mexido |
| Números da v24.6 | suíte 4.678 · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · 00h24 a 00h27 |
| A fila de 29/09 | J9, M17 e E6 passam a **fechados** (o Diretor anota aqui; a fila era de outro chat e não foi reescrita) |

### 05/10/2026, 01h35 — rodada 6 entregue (v24.7 a v24.9): os menus

| Versão | O quê |
|:---:|:---|
| v24.7 | **a barra de doze menus**, cada item no lugar do `05`. Esqueleto virou **Base**. Animação: de 35 linhas à vista para 21. Nenhum menu rola, nem em 1280×720. Item cinza diz o motivo |
| v24.8 | **32 portas**: funções que só existiam em botão de aba ou em gesto ganharam item de menu (Malha 6, Pesos 6, regras, skins, entidades, partículas, pivô). Sem porta nenhuma: de 14 para 9. As folhas `O QUE O PROGRAMA FAZ` e `O QUE NAO TEM PORTA` foram geradas de novo, com data de 05/10 |
| v24.9 | **as palavras**: "pele" virou **skin** e "corpo" virou **base** em 297 textos da tela. Ids, arquivos e campos do formato não mudaram |

| | |
|:---|:---|
| A tabela de ações | 236 → 275. Função nenhuma saiu |
| Testes reescritos de propósito | 78 (20 + 4 + 54), por arquivo, na mensagem do executor e no `CHANGELOG`. Nenhum apagado nem pulado. Novos: 18 |
| Números da v24.9 | suíte 4.696 · tsc limpo · 90/90 · roteiro 14/14, nenhum passo mudou · medir 30/30 e 21/30 · 01h25 a 01h27 |
| **Os (novo) que ficaram fora do menu, porque não existem** | pedir a pasta no Novo projeto (7) · Salvar como entidade · Para o Godot (18) · Para o Construct (19) · Clonar a base · Caminho ▸ · Testar no visualizador (10) · Marcar como slot (9) · Este boneco (11) · Visualizador de montagem e Aparecer na linha do tempo (10) · Soltar, Recolher e Expandir painel (4) |
| Sete portas do lote 2 | o teste só prova que ficam cinzas e dizem por quê (pedem imagem do disco ou projeto de várias bases). O efeito é o do botão da aba. **A mão confere** |
| Achado, sem mexer | a regra de caminho criada pela Árvore tem um **osso** como alvo, e não um slot (`tree-commands.ts:731`). Pode ser defeito |
| `CLAUDE.md` | ainda cita as folhas de 22/09 (linhas 7 e 8 da tabela) e diz "Hoje: 2.666" na regra 9. **O Diretor corrige de manhã, com o Humberto sabendo** |

### 05/10/2026, 02h40 — rodadas 8b e 8c entregues (v25.0 a v25.7), pelo executor

| Versão | Linha da ficha | Estado |
|:---:|:---|:---:|
| v25.0 | A2: a entidade cai onde foi solta, no osso mais perto, de pé | feita |
| v25.1 | C9: a entidade na lista de Animações, como base, com as animações dela | feita |
| v25.2 | C10: clicar numa animação da entidade a anima por dentro; a cena continua montada; clicar numa do herói volta | feita, com o que ficou de fora abaixo |
| v25.3 | C18: a entidade com entidade dentro entra inteira, e ganha cartão | feita |
| v25.4 | o salto da espada: provado, achada a causa (não era o runtime), consertado | feita |
| v25.5 | C13 e C14: puxar a ponta e arrastar a faixa | feita |
| v25.6 | C15: laço ou tamanho, o grude no fim, o aviso da emenda, esticar junto | feita |
| v25.7 | C11: a faixa à vista sem os Detalhes | feita, com um desvio |

| | |
|:---|:---|
| **Desvio (C11)** | a linha do tempo fechada tinha altura constante (régua do lote 14). Agora, quando a animação aberta tem entidade, ela ganha UMA linha (121 → 156 px), e a cena fica 35 px menor. Decisão do executor, reversível; vai ao Diretor |
| **Ficou de fora no C10** | a espada aberta por dentro é desenhada por cima do herói inteiro, e não no lugar dela na ordem · o herói fica parado (a agulha da espada não o move) · não conferi se o Salvar grava `espada.bone` com o exemplo aberto sem pasta (a espada mexida fica em Bases, e o título diz "não salvo") |
| **Achado antigo, sem mexer** | o `heroi.bone` de exemplo grava `"selection": ["hips"]` (lista), e quem abre a espalha na seleção como `{"0": "hips", …}` |
| **Manuais** | Spriter 1.4: não fala de sub-entidade (só a lista de entidades no Animation palette). DragonBones Pro, *Skeleton — basicConcept*: projeto de vários esqueletos; o esqueleto filho aparece no painel Repositório |
| Números da v25.7 | suíte 4.743 (só o vermelho antigo do manual) · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · 02h35 a 02h38 |

### 05/10/2026, 02h45 — o fecho da noite, pelo Diretor

O Humberto foi dormir às 21h40 de 04/10, com cinco chats de reserva abertos. **Os cinco foram usados.** A obra para aqui até ele abrir mais chats.

| Rodada | Versões | Estado |
|:---:|:---:|:---|
| 8a | v23.4 | **feita** (o Diretor conferiu com a mão) |
| 8d | v23.5 a v23.8 | **feita** (v23.5 a v23.8). Conferida no uso pela rodada 21, em 05/10: 8 de 9 gestos |
| 12 | v23.9 | entregue, conferida pelas fotos |
| 15 | v24.0 a v24.3 | entregue, conferida pelas fotos |
| 3 | v24.4 a v24.6 | entregue |
| 6 | v24.7 a v24.9 | entregue |
| 8b | v25.0 a v25.3 | **feita** (v25.0 a v25.3). Conferida no uso pela rodada 21 |
| 8c | v25.4 a v25.7 | **feita** (v25.4 a v25.7). Conferida no uso pela rodada 21; a emenda e o salvar não foram vistos |

**De v23.3 a v25.7: 24 versões numa noite.** Suíte: de 4.514 para **4.743**. Conformidade: de 87 para **90**. Roteiro 14/14 e `tsc` limpo em todos os fechos. Um vermelho só, o antigo do manual.

**Só a rodada 8a tem a mão do Diretor.** Com a tela apagada o programa não desenha, e as outras sete foram conferidas por foto e por relato. **Nenhuma delas é "feita" até alguém usar o programa.** É o primeiro trabalho da manhã.

**O desvio do lote 8 da 8c, aceito pelo Diretor:** a linha do tempo fechada ganha uma linha com a faixa quando a animação tem entidade, e a cena perde 35 px. Fica assim: a faixa é o que o Humberto pediu para ver.

**Para o Humberto decidir** (levado no resumo da manhã): a peça-malha (a cabeça) continua se movendo pelo osso · a pergunta de formato da malha com pesos em skin exportada · o `CLAUDE.md` com números velhos.

**As rodadas que faltam:** 2 (conferir a tela e os menus do Spine) · 4 (os painéis do Photoshop) · 7 (pedir a pasta) · 9 (o slot vira base) · 10 (o visualizador de montagem) · 11 ("Este boneco") · 13 (base e pivô) · 16 (partículas: o sistema) · 17 (o resto da fila) · 18 e 19 (Godot e Construct) · 20 (o fecho).

### 05/10/2026, 04h25 — rodada 22 entregue: a pesquisa dos leitores (`08 OS LEITORES`)

| | |
|:---|:---|
| **Construct primeiro** | um addon (SDK v2) com o nosso `runtime/` **inteiro** dentro; só o desenho é novo. É o que o Spine faz no plugin oficial dele. O do Spine pede o r495 e **não instala no r449 do Humberto**; o nosso mira o r449 |
| **Godot em GDScript** | copiado do runtime Python. C# não exporta para a web; GDExtension pede compilar por plataforma; converter para nós nativos perde demais (4 ossos por vértice, sem skin, sem regras) |
| Os 90 casos | rodam nas duas: Godot sem janela, por adaptador; Construct rodando o mesmo `.js` no Node |
| A API do jogo, igual nas duas | tocar · vestir · tirar skin · encaixar · desencaixar · animar a peça · soltar a peça |
| Rodadas | Construct 7 (K1 a K7) · Godot 8 (G1 a G8). **Só K5 e G5 (a conexão) esperam a rodada 11**; K1–K4 e G1–G4 podem andar antes |
| Formato | proposta para a briga da §2.8 (malha com pesos em skin exportada): o osso do corpo listado vira **âncora**. Sem campo novo. Espera o Humberto |
| **Não foi lido** (o construct.net pede verificação de robô) | o `IRenderer` do r449, as notas do r449, a página do plugin do Spriter, e outras. Lista com link no `08`. O Humberto pode colar |

### 05/10/2026, 04h45 — a rodada 21 conferiu no uso a 6 e a 8d: FEITAS

Conferidas por um chat que não as escreveu, no `programa/` v25.7, com mouse e teclado de verdade, em 1440×900 e 1280×720. Fotos em `backup/fotos-obra/rodada-21/`.

| Rodada | Quadro |
|:---:|:---|
| 8d | 9 gestos: **8 funcionam**, 1 pela metade (apagar a chave: a lixeira apaga; a tecla Delete não) |
| 6 | 5 pontos: **3 funcionam**, 2 pela metade (as sobras da palavra "esqueleto"; três portas não testáveis sem janela) |

**Defeitos achados, do pior para o menor. Viram a rodada de conserto 23:**

| # | Defeito | De quando |
|:---:|:---|:---|
| 1 | **`Delete` com uma chave escolhida na linha do tempo apaga o OSSO ou a IMAGEM escolhida, e não a chave.** Com `forearm`, apagou o osso e os filhos. Só a lixeira apaga a chave. Desfaz com `Ctrl+Z` | não é da noite: vale para toda chave. **Perde trabalho** |
| 2 | Sobras da palavra **"esqueleto"** na tela: o título e o grupo de Propriedades · a dica do botão Novo · a aba Skins · a aba Regras · a Árvore. E, no texto de avisos que só aparecem em erro: "pele", "corpo", "esqueleto" | rodada 6, lote 3 |
| 3 | Entidades → **Pôr entidade na cena** não pergunta qual, e põe deitada no osso `root` | rodada 6, lote 2 (a porta) e 8b (o arrasto foi consertado; o menu não) |
| 4 | O rodapé diz o nome de dentro: *"Posição Y de hand_osso"* | rodada 8d |
| 5 | A chave do quadro 0 fica meio escondida sob a coluna dos nomes | antigo |
| 6 | O "Sobre" diz versão 0.1.0 | antigo (J10 da fila) |

### 05/10/2026, 04h50 — o Humberto respondeu: "assim para tudo"

| # | Decisão |
|:---:|:---|
| 1 | **A malha continua se movendo pelo osso**, como no Spine. O Diretor leu no manual do Spine (pág. 67: a imagem comum **não** tem chave própria lá, só o osso; pág. 81 e 55: a malha se deforma por pesos, e chave de deformação se evita). O nosso faz a imagem como o Spriter e a malha como o Spine |
| 2 | **Os leitores começam pelo Construct.** K1 e K2 foram para a RESERVA 6 |
| 3 | Godot: o Diretor supôs o 4.7, e ele não contestou |
| 4 | O `CLAUDE.md` foi corrigido pelo Diretor: as folhas de 05/10 e a regra 9 sem número fixo |
| 5 | **A próxima frente no editor: os painéis do Photoshop** (soltar, recolher, expandir), depois dos consertos da rodada 21 |

A pergunta "o jogo vai sair no navegador?" foi retirada pelo Diretor: o caminho escolhido (GDScript no Godot, JavaScript no Construct) serve para os dois, e ela não mudava nada.

| # | Rodada | O quê | Código? | Estado |
|:---:|:---|:---|:---:|:---:|
| K1 | **Construct: o pacote** | o `runtime/` num `.js` só; os 90 casos sobre ele; um addon vazio que instala no r449 | sim, em pasta nova | **entregue** (sem versão: a suíte e a versão esperam a máquina livre; 05/10, 04h54). Falta a mão |
| K2 | **Construct: ver o boneco** | carregar, desenhar com `drawMesh`, tocar animação | sim | **entregue** (idem). Falta a mão |
| K3 | **Construct: malha e recorte** | o recorte da máscara por corte de triângulos na conta; a sequência | sim | **entregue** (sem versão; 05/10, 05h02). Falta a mão |
| K4 | **Construct: skin** | vestir, tirar, empilhar, a de cima vence, esconder, osso de skin, skin de outro arquivo | sim | **entregue** (sem versão; 05/10, 05h07). Falta a mão |
| K6 | **Construct: partículas** | todas as de um emissor num drawMesh, pela conta do formato; aviso de peso; brilho aditivo | sim | **entregue** (sem versão; 05/10, 05h15). Falta a mão |
| K7 | **Construct: a casca** | o boneco no editor de layout; as propriedades; velocidade, pausa, espelho; está tocando, ao terminar, os eventos do .bone; a partícula com folha de quadros | sim | **entregue** (sem versão; 05/10, 05h25). Falta a mão |
| K5 | conexão (espera a 11) | ver o `08` | sim | esperam |
| 23 | **Os consertos da rodada 21** | `Delete` na chave apaga o osso · as sobras de "esqueleto" · Pôr entidade na cena · o nome de dentro no rodapé · e o que a rodada 21 ainda achar | sim | **entregue** (v25.8 a v26.4; 05/10). Falta outra mão conferir |

### 05/10/2026, 05h — a rodada 21 conferiu no uso a 12 e a 15: FEITAS

| Rodada | Quadro |
|:---:|:---|
| 12 (skin) | 6 gestos: **5 funcionam**, 1 pela metade. Esconder, ignorar, apagar osso só na skin, devolver o osso, e "a de cima vence": vistos |
| 15 (partículas) | 7 gestos: **6 funcionam**, 1 pela metade. A marca, o clique, mover, girar, digitar, o painel, e **a agulha para trás devolve o mesmo desenho**: vistos |

**Mais defeitos para a rodada 23** (continuam a lista de cima):

| # | Defeito |
|:---:|:---|
| 7 | **A skin nova nasce com o nome "pele"** ("pele2"…). É a sobra de palavra mais vista: *Skin "pele" criada…* |
| 8 | Depois de tirar a skin, a **seleção fica num osso que já não existe**: Propriedades ainda diz o nome, e a cena desenha as alças, até clicar no vazio |
| 9 | Depois de "Devolver o osso", sobra um **ícone vermelho** ao lado dele na Árvore |
| 10 | **Prender o emissor pela tecla P**: o rodapé pede a ordem contrária à da ficha (osso primeiro), e na ordem da ficha nada acontece, sem aviso. Pelo campo Osso funciona |
| 11 | O rodapé diz "Mover desenho" quando o escolhido é o emissor; Propriedades diz "Anexo", e não "Emissor" |

### 05/10/2026, 04h48 — a rodada 21 fechou: a noite está conferida (`07 A NOITE CONFERIDA`)

**31 vi funcionar · 6 pela metade · 0 não funciona · 4 não deu sem janela.** 140 fotos em `backup/fotos-obra/rodada-21/`.

As sete rodadas da noite passam a **feitas**. Os 13 defeitos, do pior ao menor, estão no topo do `07`, e viram a **rodada 23** (ficha em `rodadas/`). Os dois que a lista de cima não tinha: o campo Ângulo da ficha rápida **cai fora do painel** em telas de 1080 de altura ou menos · a espada solta no antebraço **não acompanha** a edição de dentro, nem ganha faixa.

**O que só a mão do Humberto confere** (não dá sem janela): exportar e importar skin (M17) · soltar o projeto grande do Spriter (E6) · salvar e reabrir com a espada mexida por dentro · o aviso da emenda.

| # | Rodada | Chat | Estado |
|:---:|:---|:---|:---:|
| 23 | os consertos da noite | RESERVA 9, Opus | **entregue** 05/10, 05h48 (v25.8 a v26.4; ver a seção da 23 abaixo) |
| 4 | os painéis do Photoshop: **parte 1, conferir e planejar** | RESERVA 10, Opus | em obra desde 05/10, 04h50. A parte 2 (construir) espera a 23 soltar o editor |
| K1, K2 | o leitor do Construct | RESERVA 6, Opus | K1 fechada no disco (90 de 90 sobre o pacote, 04h44); K2 em obra |

**Erro do Diretor, pela forma (regra 20):** *datei três seções de cabeça, sem olhar o relógio.* As seções "a rodada 21 conferiu a 6 e a 8d" e "a 12 e a 15" dizem 04h45 e 05h; pelo relógio da máquina foram perto de **04h28** e **04h40**. A do fecho da 21 foi corrigida para 04h48. As horas dos fechos dos executores estão certas: eles olharam o relógio.

### 05/10/2026, 05h48 — rodada 23 entregue (v25.8 a v26.4): os consertos da noite, pelo executor

**O que o Humberto vai ver:**

1. `Delete` com uma chave escolhida apaga **a chave**, e não o osso. Sem chave escolhida, apaga o osso, como antes.
2. A espada solta no antebraço **toca e acompanha** o que se mexe nela por dentro. "Pôr entidade na cena" entra de pé, no meio da vista.
3. Depois de tirar uma skin ou desfazer um osso, **nada fica escolhido sem existir**. A skin nova nasce "skin", e o rodapé diz quando o Salvar não gravou.

| Versão | Lote · defeito do `07` | Estado |
|:---:|:---|:---:|
| v25.8 | 1 · #1 `Delete` numa chave apagava o osso (e o `Ctrl+D`, a mesma forma) | consertado |
| v25.9 | 2 · #6 a espada solta não acompanhava (nascia sem animação) | consertado |
| v26.0 | 3 · #3 a seleção fantasma (e os vizinhos: desfazer osso, apagar na skin) | consertado |
| v26.1 | 5 · #5 Pôr entidade na cena | consertado; "não pergunta qual" **não repetiu** (o herói só tem a espada) |
| v26.1 | 4 · #4 o Ângulo fora do painel | **não repetiu como descrito**: o painel rola. Repete a **altura** (29 a 95 px com os Detalhes abertos): é da rodada 4 |
| v26.2 | 6 · #7 a tecla P | consertado: uma ordem só (o osso primeiro), e a ordem trocada **diz** o passo que falta |
| v26.3 | 7 · #2 e #10 as palavras | consertado, menos dois avisos do `runtime/` (abaixo) |
| v26.4 | 8 · #8, #9, #11, #12, #13 | consertados. `programa/` montado às 05h48, o Sobre diz v26.4 |

| | |
|:---|:---|
| **Sobrou** | a altura de Propriedades com a linha do tempo aberta (rodada 4) · *"a pele … já existe aqui"* e *"Não deu para ler o corpo"* estão em `runtime/` (proibido nesta rodada) · Entidades → Caminho ▸ (não existe; é rodada própria) · a emenda da faixa (E9) e salvar e reabrir com a espada mexida (só com janela) · fechada, a linha do tempo mostra a faixa de **uma** entidade (C11, de propósito) |
| Testes | 4.743 → 4.970 na suíte inteira (o `leitor-construct` entrou no meio). Desta rodada: 26 novos. **Reescritos de propósito: 11** (10 em `peles`, o nome "pele"; 1 em `paineis`, o título) |
| Números do último fecho | suíte 4.970 (1 vermelho, o antigo do manual) · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · 05h45 a 05h47 |
| **Erro meu, pela forma** | *escrevi com uma ferramenta que reescreve o fim de linha sem dizer* (LF ↔ CRLF em 16 arquivos). Achado no lote 7, devolvido byte a byte |
| Fotos e roteiros | `backup/fotos-obra/rodada-23/` e `roteiros/` (o `contar.mjs` guarda a contagem por arquivo e compara com a última) |

### 05/10/2026, 05h49 — o Diretor: a rodada 23 entregou (v25.8 a v26.4); a rodada 4 liga os painéis; o Construct tem K1 a K7 menos a K5

| Rodada | Estado |
|:---|:---|
| **23**, os consertos | **entregue.** Dos 13 defeitos do `07`: 10 consertados; 2 **não repetiram como descritos** (o menu já perguntava qual entidade; o painel Propriedades já rolava, o defeito era a altura, e passou para a rodada 4); a ordem da tecla `P` estava errada **na ficha do Diretor**, não no programa. Suíte 4.970 · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · `programa/` montado às 05h48 com a v26.4. **Conferida só pelo executor**: falta outra mão |
| **4**, os painéis | parte 1 feita (`09 OS PAINEIS`). Parte 2: os modelos dos lotes 1, 2, 3, 4, 5, 6, 8 e 9 prontos em arquivos novos (72 testes). **A ligação na tela começou agora** |
| **K1 a K4, K6, K7**, o leitor do Construct | entregues **no disco** (129 testes, 90 de 90 sobre o pacote). Sem versão: o fecho espera a vez. **Nada foi visto dentro do Construct**: é a mão do Humberto. A K5 (a conexão) espera a rodada 11 |

**Duas formas de erro que se repetiram em chats diferentes, para todo executor ler:**

| Forma | Quem | O que fazer |
|:---|:---|:---|
| *"escrevi com uma ferramenta que reescreve o fim de linha sem dizer"* (Python em modo texto, `sed`): LF virou CRLF em dezenas de arquivos | rodada 15 e rodada 23 | editar pelo editor de arquivo; se usar script, abrir em binário e conferir os bytes antes e depois |
| *"o meu rascunho entre dois passos ficou no disco, e a suíte dos outros mediu o meio"* | o chat do Construct, duas vezes | regra 29: escrever e medir na mesma volta. Com mais de um chat, vale para a pasta nova também |

**Erro do Diretor, pela forma:** *escrevi na ficha de um conferente um gesto que eu não tinha feito* (a ordem da tecla P). O conferente seguiu a ficha, o gesto falhou, e virou "defeito". A ficha de conferência diz **o que tem de acontecer**, e deixa o conferente achar o gesto como um usuário acharia.

| Depois da entrega | **v26.5** (05h54): as duas palavras do `runtime/` (skin, base), por exceção do Diretor; 1 teste do runtime reescrito; 90/90 e os dois runtimes concordam. `programa/` **não** remontado: a rodada 4 estava gravando `ui/shell.ts` |

### 05/10/2026, 06h41 — o Humberto respondeu e saiu para o trabalho; o cargo de Diretor passa a um chat novo

| # | Decisão dele |
|:---:|:---|
| 1 | A tela dele é **1920×1080** |
| 2 | O tamanho dos painéis: *"se for como o sistema do Photoshop, o usuário escolhe como vai ficar"*. O chão do Propriedades fica como a rodada 4 fez (v26.9) |
| 3 | O nome de dentro do addon do Construct **fica `Recorte_Leitor`**: *"depois eu mudo, se precisar, antes de publicar"*. O chat do leitor do Construct foi arquivado |
| 4 | *"Se organize para passar o cargo para um novo diretor… instrua ele para continuar o trabalho."* A passagem está em `10 PASSAGEM DE CARGO do Diretor 2026-10-05.md`, nesta pasta. O novo Diretor abre por um botão próprio, lê a passagem, assina o `QUEM E QUEM` e avisa a rodada 4 do endereço dele |
| 5 | Dez chats novos: o do novo Diretor e as reservas 11 a 19 |

**Rodada 4, até aqui:** lotes 1, 2, 3, 9 e 4 fechados (v26.6 a v27.0). Faltam os lotes 5, 6 e 8.

**O `DIRETOR · ed2cab` para aqui.** Daqui em diante quem escreve neste arquivo é o novo Diretor.

### 05/10/2026, 06h45 — o cargo passou: o Diretor agora é `DIRETOR · 000da3`

Ordem do Humberto. A ficha do cargo é o `10 PASSAGEM DE CARGO do Diretor 2026-10-05.md`. O `DIRETOR · ed2cab` não é mais a porta.

**O que o `03` não tinha, e está no `ESTADO.md`:** a rodada 4 (os painéis), parte 2, fechou os lotes 1, 2, 3, 9 e 4, da **v26.6 à v27.0** (06h35). Faltam os lotes 5, 6 e 8. O lote 7 (empilhar) ficou de fora.

| # | Rodada | O quê | Chat | Modelo | Estado |
|:---:|:---|:---|:---|:---:|:---:|
| 4 | os painéis, parte 2 | lotes 5, 6 e 8 | `EXECUTANDO · rodada 4 — os painéis do Photoshop` | Opus | em obra. **É o único que escreve em `editor/` e fecha versão** |
| G1, G2 | **Godot: ler, desenhar parado, animar** | pasta nova `leitor-godot/`; GDScript copiado do runtime Python; casos A e X pelo adaptador sem janela | RESERVA 11 | Opus | **entregue** (07h18, no disco, sem versão). Ver "O que cada rodada entregou" |
| 24 | **conferir no uso a 23 e a 4** | os 13 consertos e os painéis, por quem não os escreveu. Sai o `11 OS CONSERTOS E OS PAINEIS CONFERIDOS` | RESERVA 12 | Sonnet | lendo. **Só abre o programa quando a rodada 4 disser "larguei a máquina"** |

| Decisão do Diretor, sem pergunta | Por quê |
|:---|:---|
| O chat do Godot pode **executar** o Godot 4.7.2 que está na Área de Trabalho do Humberto, sem janela. Nada mais de fora da pasta | sem rodar o Godot não há prova nenhuma. É executar uma ferramenta, como o `node`. **Vai ao Humberto como aviso**: se ele não quiser, a G1 fica só no disco |
| A ficha da 24 diz **o que tem de acontecer**, e não o gesto | o erro da ficha da 21 (a ordem da tecla P) não se repete |

**Só há duas reservas abertas (11 e 12).** As duas estão em uso. As rodadas 13, 7, 9, 10 e 11 esperam chat: ou o Humberto abre mais, ou um chat que terminou é reaproveitado.

**Erro do Diretor novo, pela forma (regra 20):** *escrevi a hora antes de olhar o relógio.* Datei a assinatura e o backup com 06h45, e o relógio dizia 06h42. Corrigido no mesmo minuto, nos três lugares.

### 05/10/2026, 06h48 — rodada 4, lote 5 fechado (v27.1); as reservas; a memória

**Rodada 4, lote 5 — v27.1** (06h44 a 06h45; relato do executor, repassado pelo `DIRETOR · ed2cab`):

| | |
|:---|:---|
| O que ele vai ver | puxar o **vão da tira** (à direita das abas) solta o **grupo inteiro**: a sombra segue a mão, o rodapé diz onde vai ficar, e o grupo flutua com as abas na barra · puxar a barra até uma tira cola **todas** as abas, na ordem · o × do grupo fecha todas, e o menu Janela traz cada uma · "Voltar ao padrão" traz o grupo inteiro |
| Arranjo antigo | o solto ganhou a lista `tabs`; sem a lista abre como antes; o programa de antes, lendo arranjo novo, ignora a lista (o executor diz provado) |
| Números | suíte 4.987 (+3; 1 vermelho, o antigo do manual) · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · `programa/` montado · 2 testes reescritos de propósito |
| Fotos | `backup/fotos-obra/rodada-04/lote-5/` |
| Falta | lote 6 (`Shift+Tab`) e lote 8 (o botão dos arranjos). Depois ela para. **Conferida só pelo executor**: a rodada 24 confere |

**As reservas eram nove (11 a 19), e não duas.** O Humberto ainda estava clicando quando eu listei. O `DIRETOR · ed2cab` já tinha posto 11 a 17 em Opus e 18 e 19 em Sonnet.

**Erro do Diretor, pela forma:** *listei uma vez, cedo demais, e tratei a lista como o estado.* Com "só duas reservas" na cabeça, criei quatro botões de reserva (13 a 16), e o Humberto clicou nos quatro: nasceram quatro chats duplicados, com a máquina em **0,64 GB livres** (06h46). Arquivei os quatro no mesmo minuto. A medida tem hora, e expira (regra 25): antes de agir sobre uma lista de chats, listar de novo.

| Reserva | Estado |
|:---|:---|
| 11 | é o chat do Godot (G1–G2), em obra |
| 12 | é o conferente da rodada 24 (Sonnet), leu tudo às 06h45 e espera |
| 13, 14 (Opus) · 18 (Sonnet) | abertas, paradas |
| 15, 16, 17, 19 | pedi ao `DIRETOR · ed2cab` que arquive (a minha tentativa foi recusada: têm cliente de Remote Control) |
| quatro duplicadas (13 a 16, de 06h46) | arquivadas por mim. São filhas desta janela: eu as reabro sem pedir aprovação |

**A régua da memória na ficha do Godot estava errada** ("menos de 1,5 GB: espere"): com 0,64 GB livres o chat esperaria para sempre. Corrigida na ficha e por mensagem: o Godot sem janela roda com 0,4 GB ou mais, um processo por vez.

**O `03` tem 14 fins de linha CRLF** numa seção de 06h41 (a da passagem de cargo), num arquivo que é LF. Não são meus e não mexi: quem regravar o arquivo inteiro acerta.

### 05/10/2026 — rodada 4, lote 6 fechado (v27.2, 06h50 a 06h51, hora do executor)

Relato do executor, repassado pelo `DIRETOR · ed2cab`. **Conferida só pelo executor**: a rodada 24 confere.

| | |
|:---|:---|
| O que ele vai ver | `Shift+Tab` esconde só as duas colunas e os painéis soltos; a linha do tempo **fica**; de novo, tudo volta · o `Tab` continua igual, e agora leva os soltos junto · porta: **Janela → Arrumar → Esconder só as colunas** |
| Números | suíte 4.989 (+2; 1 vermelho, o antigo do manual) · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · `programa/` montado |
| Fotos | `backup/fotos-obra/rodada-04/lote-6/` |
| Falta | o lote 8 (o botão dos arranjos na barra), o último. Depois ela para e avisa |

**Arquivar e desarquivar, testado pelo Diretor a pedido do Humberto:** um chat que nasceu de um botão **desta** janela se arquiva, desarquiva, troca de modelo e recebe mensagem **sem pedir aprovação**. As reservas 11 a 19 são filhas do `DIRETOR · ed2cab`: a 19 recusou o arquivo (Remote Control ligado), e o Diretor antigo não as arquiva sem a palavra do Humberto (ele mandou abri-las). **Daqui em diante, botão de reserva sai da janela do Diretor em cargo.**

### 05/10/2026 — rodada 4 ENTREGUE (v26.6 a v27.3); largou a máquina às 07h02; a rodada 24 recebeu o "pode"

| Versão | Lote | O que ele vê (palavra do executor) |
|:---:|:---:|:---|
| v26.6 | 1 | puxar a aba e o painel vem junto (sombra, linha azul, contorno); cola de volta pelo mesmo gesto; Janela → Arrumar → Soltar o painel da parede |
| v26.7 | 2 | a setinha dupla no topo da coluna: faixa de ícones de 40 px; o ícone abre o painel ao lado |
| v26.8 | 3 | o painel solto não sai da tela |
| v26.9 | 9 | o Propriedades nunca menor que a ficha rápida; cede a Árvore (em 1280 ela fica com 80 px) |
| v27.0 | 4 | dois cliques na aba recolhem o grupo; na barra do solto, o solto |
| v27.1 | 5 | puxar o vão da tira solta o grupo inteiro |
| v27.2 | 6 | `Shift+Tab` esconde só as colunas |
| v27.3 | 8 | o botão dos contextos no canto de cima: Montar · Animar · Pesos, Pivô, Visualização, os arranjos; também em Janela → Arranjos |

| | |
|:---|:---|
| Números da v27.3 | suíte 4.993 (1 vermelho, o antigo do manual) · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · `programa/` montado · 06h59 a 07h01 |
| Escolhas do lote 8 | o botão diz "Padrão" na primeira abertura, e não "Montar" (a tela de fábrica não é a do Montar) · em 1280×720 quem cede na barra é o nome do arquivo (reticências, nome inteiro na dica) |
| **Não provado por foto, dito por ela** | o canto de mudar o tamanho do solto · a ficha de uma imagem no Propriedades com a linha do tempo aberta · 1920×1080 só num lote |
| De fora | o lote 7 (empilhar na borda de baixo) |
| Os erros da ligação, pela forma | seção 9 do `09 OS PAINEIS` |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 4 | os painéis do Photoshop | **entregue** (v26.6 a v27.3). Falta outra mão: a rodada 24 |
| 24 | conferir a 23 e a 4 | "pode" mandado às 07h03. Parte B (painéis) primeiro, começando por 1920×1080 |

O `DIRETOR · ed2cab` se arquivou. A rodada 4 fica parada, de pé, para consertar o que a 24 achar nos painéis.

### 05/10/2026, 07h10 — a rodada 13 (base e pivô) começou, dentro de uma cerca; três decisões do Diretor

Chat: `EXECUTANDO · rodada 13 — base e pivô` (era a RESERVA 13), Opus. Ficha em `rodadas/`. **Cerca:** escreve em `editor/` e roda só os seus testes; não abre navegador, não roda suíte inteira, não monta nem fecha versão até a rodada 24 largar a máquina.

**O que o executor achou no código, antes de escrever (07h04):**

| A decisão do Humberto | O programa hoje |
|:---|:---|
| peça tirada da base guarda as chaves, e elas voltam | `Delete` **apaga** as linhas do tempo da peça em todas as animações (`doc/commands.ts:302`). Só o `Ctrl+Z` volta. Não há "guardar" nem "religar" |
| acertar o pivô deixa o desenho parado | o desenho **anda**: `SetPivotCommand` (`io/pivot-atlas.ts:284`) recalcula o x/y de todo desenho que usa a imagem. Vale para Definir pivô, Colar pivô, o painel Pivôs e Repetir para a pasta |
| o formato | a §4.7 diz que linha do tempo com alvo que não existe é arquivo inválido: as chaves guardadas **não** podem ficar nas linhas do tempo |

**Decisões do Diretor, sem pergunta ao Humberto** (o Spriter e a regra 6 da casa respondem):

| # | Decisão | Por quê |
|:---:|:---|:---|
| 1 | As chaves guardadas moram em `extensions.RECORTE_editor_state` do arquivo. Recriar a peça com o **mesmo nome** religa, e o rodapé diz quantas. Tipo diferente: não religa e avisa. Um item de menu mostra o que está guardado e joga fora de propósito | sem campo novo no núcleo; o arquivo continua válido para qualquer leitor |
| 2 | Mudar o pivô deixa a imagem **exatamente onde estava** (Spriter, manual 1.4). Imagem com osso próprio (8d): o osso vai para o pivô novo e cada chave é compensada. Imagem sem osso próprio: só o anexo é compensado, e o pivô fica numa lista **"pivôs à mão"** em `RECORTE_editor_state`, que o Salvar, o Exportar skin e o Carimbar respeitam (senão o Salvar devolvia o pivô velho, calado). O Carimbar pula essas imagens e diz quantas; "Voltar o pivô para o osso" é item à parte. Sem janela de pergunta | hoje "a verdade é o rig": o pivô é recalculado de onde a origem do osso cai na imagem |
| 3 | O **osso próprio novo nasce no pivô**, e não no centro da imagem (`attachment-edit.ts:183`). Muda a rodada 8d: a imagem passa a girar em volta do pivô, como no Spriter. Os ossos próprios que já existem em arquivo salvo não são migrados | no Spriter a imagem gira em volta do pivô dela |

**Custo, dito com o nome:** entre duas chaves com giro, a imagem passa a girar em volta do pivô novo. Em cada chave, na base e em quadro sem chave, fica exata. O rodapé avisa.

### 05/10/2026, 07h18 — dez reservas novas (21 a 30), arquivadas; G1 entregue

**Ordem do Humberto:** *"crie 10 chats para ficar de reserva; se quiser arquive eles, já que você disse que consegue desarquivar."* Criei dez botões, ele clicou nos dez, e eu arquivei os dez. **São filhas desta janela:** o Diretor as desarquiva (`unarchive_session`), troca o modelo e manda a tarefa **sem aprovação dele**. Testado às 06h56 com a reserva 13 duplicada. Abrem em Fable: trocar o modelo antes da tarefa.

| Reserva | `sessionId` |
|:---|:---|
| 21 | `local_d42de884-14e4-4246-81c4-aa28ecfcfc61` |
| 22 | `local_13c1fb4d-6fa1-472e-b411-ea3cddc64691` |
| 23 | `local_7f909349-cea2-41ec-b8c9-1ba9003f2bd3` |
| 24 | `local_3afdd592-c7c5-4413-8630-1a6d76c2bbd0` |
| 25 | `local_88166748-528b-4db5-9d85-4da59776b9f3` |
| 26 | `local_a76cdd18-393a-4494-a73c-40aedaee357f` |
| 27 | `local_fbd82195-c172-4479-b0a1-e51c22c5c4f1` |
| 28 | `local_e690ca99-f8e2-4e8e-8a3d-81e2568553a8` |
| 29 | `local_b2a42734-b5e3-476f-88c3-e938c7b6d83d` |
| 30 | `local_bcad112d-fdb9-4dc2-85a0-6c6026391931` |
| 13 a 16 duplicadas (de 06h46; a 13 em Sonnet) | `local_48cc1008-581f-4cc9-84a0-3077fac3e827` · `local_7d3c3f41-6591-4965-a9e5-f8641ef35c53` · `local_af684ad0-289f-4185-a224-7a9f0011e0fc` · `local_a5b77f76-d21a-47ab-86b3-59dfcd54f99d` |

As reservas 14 a 19 do Diretor antigo continuam abertas e paradas (14 a 17 em Opus, 18 e 19 em Sonnet). Não se arquivam enquanto o celular do Humberto estiver ligado nelas; **usar essas primeiro**, que já ocupam memória.

**G1 entregue (Godot: ler e desenhar parado), no disco, sem versão** — relato do executor, 07h05:

| | |
|:---|:---|
| O que existe | `leitor-godot/addons/recorte/`: carregador, esqueleto, atlas, animação, dump, desenhador (função pura), o nó `Recorte` · o adaptador sem janela (`adaptador.gd` + `adaptador.mjs`) · testes em `.gd`, fora do vitest |
| A prova | casos **A 13/13 e X 5/5** pela suíte oficial (07h01) · regra 26: três contas estragadas de propósito, três casos vermelhos, desfeito · o herói parado, 17 peças, bate com a referência |
| Não aparece ainda | o rosto (malha, G3) e a espada (conexão, G5). Avisam |
| **Não provado** | o herói andando com as regras ligadas (G6) · nada visto na janela do Godot (a mão do Humberto) |
| Suposições aceitas pelo Diretor | a animação foi copiada já na G1 (os casos A pedem) · o projeto do Godot é `leitor-godot/` inteiro |
| Segue | G2 (o nó toca, sinais, exemplo, LEIA-ME) e depois **G3** (malha), no mesmo chat. Fecha a G3 e para |

**Rodada 13, o pivô, caso (a): pronto no disco, 07h17, sem versão** (a cerca) — relato do executor:

| | |
|:---|:---|
| O que ele vai ver | mudar o pivô de uma imagem que **já tem chave própria**: o desenho não sai do lugar, na base nem em chave nenhuma. O rodapé diz quantos desenhos ficaram parados, e avisa quando há giro em chave |
| Todas as portas, a mesma conta | Definir pivô, Colar pivô, painel Pivôs, Repetir para a pasta (`pivotToUsers`; a conta em `io/pivot-still.ts`, novo) |
| Prova | `pivo.test.ts` 85/85, 8 novos; contra o código velho, 6 dos 8 falham (regra 26) · conta à mão no teste (osso girado 30°, escala 2×1, pai girado 90°) · `Ctrl+Z` letra por letra |
| **Medido entre chaves** | giro de 60°, escala de 1,5 a 2, pivô a 28 px do centro: nas chaves, 4e-7 px; no pior instante entre elas, **4,44 px**. Sem giro em chave: exato em todo instante |
| De fora, e o programa **diz** "Não ficou parado: …" | osso próprio que não herda giro ou escala, que troca de pai, ou que uma regra mexe · animações em arquivo externo |
| Falta | o caso (b) (imagem sem osso próprio: ainda anda), o osso próprio nascer no pivô, e a peça que volta |

| # | Rodada | Estado |
|:---:|:---|:---:|
| G1 | Godot: ler e desenhar parado | **entregue** (sem versão). Falta outra mão, e a mão do Humberto |
| G2 | Godot: animar (o nó toca, sinais, exemplo, LEIA-ME) | **entregue** às 07h18 (sem versão), pelo executor. A e X 18/18 pelo Godot; o exemplo rodou 180 quadros sem janela, sem erro. Falta a mão do Humberto (`leitor-godot/LEIA-ME.md`) |
| G3 | Godot: malha (pesos, linkedmesh, deform, sequência, cor, mistura, recorte) | **entregue** às 07h25 (sem versão), pelo executor. A 13, B 7, X 5 pelo Godot (25/25); o herói sem regras, cortado pela máscara, bate peça a peça com o do Construct parado e em 6 quadros das três animações; o rosto aparece. Falta a mão do Humberto |

### 05/10/2026, 07h24 — a rodada 24 conferiu os painéis no uso: a rodada 4 está FEITA (v26.6 a v27.3)

Conferida por um chat que não a escreveu (Sonnet), no `programa/` **v27.3**, em 1920×1080, 1440×900 e 1280×720, com mouse simples por protocolo. Fechada às 07h25. Tudo em `11 OS CONSERTOS E OS PAINEIS CONFERIDOS 2026-10-05.md`.

**Quadro da parte B (12 linhas): 11 vi funcionar · 1 pela metade · 0 não funciona.**

| Visto funcionar | |
|:---|:---|
| puxar a aba e o painel vir junto; colar; entrar em outro grupo | o arrasto funciona sem truque de protocolo |
| recolher a coluna em ícones, abrir pelo ícone, expandir; fica guardado ao recarregar | |
| o solto dentro da tela · dois cliques · o Ângulo à vista | |
| puxar o vão da tira · `Shift+Tab` · o botão dos contextos | os três lotes fechados depois da ficha |
| arranjo no formato antigo abre igual (fabricado; não havia um antigo de verdade) · o `.bone` salvo não leva arranjo · soltar um `.bone` no programa abre | |

| # | Defeito achado | Vai para |
|:---:|:---|:---|
| 1 | **Janela → Arrumar → Soltar o painel da parede solta o painel errado**: com Árvore ou Ordem em uso, sai um da coluna da direita | o chat da rodada 4, depois da 13 |
| 2 | O canto do painel solto **não segue um arrasto rápido para fora** (cresce 38 px e para; devagar vai) | idem |
| 3 | O **"Sobre" diz uma versão atrás** (v27.2 no programa v27.3): lê a maior versão guardada antes do montar | idem, com proposta antes |
| 4 | Sobra da palavra "esqueleto" no rodapé de abrir `.bone` sem atlas | entra na parte A |
| — | Com a linha do tempo aberta, a Árvore fica com uma linha e meia (1440×900) ou nenhuma (1280×720) | **não é conserto**: é o preço do chão do Propriedades, que o Humberto decidiu manter. Vai a ele como aviso, com o número |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 4 | os painéis do Photoshop | **feita** (v26.6 a v27.3). Conferida no uso pela rodada 24: 11 de 12. Três consertos na fila. O lote 7 (empilhar) continua de fora |

A rodada 24 segue na parte A (os consertos da 23), ainda com a máquina.

**A fila do editor, um por vez:** rodada 13 (escreve agora, na cerca) → fecho da 13 quando a 24 largar a máquina → consertos dos painéis (chat da rodada 4) → a 24 confere os dois.

### 05/10/2026, 07h33 — um caso novo do Humberto: a mesma entidade duas vezes (as armas e as rodas)

Palavras dele, pelo celular:

> *"Eu tenho um boneco com entidade arma 1, arma 2. São duas armas, mas elas podem ser iguais. Tenho uma moto com 2 entidades roda; elas são iguais. No primeiro caso cada uma mudaria separado. No segundo eu quero ter a possibilidade de mudar todas de uma vez."*

| Caso | O que ele quer | O que já está decidido |
|:---|:---|:---|
| As duas armas | cada uma troca **separado**, mesmo quando são a mesma entidade | `02`, seção 2, regra 8: *"a mesma entidade pode aparecer várias vezes: são objetos separados"*. É o padrão |
| As duas rodas | a **possibilidade** de trocar todas de uma vez | não estava escrito. **É novo** |

**Proposta do Diretor (vai a ele como sugestão; enquanto não disser não, vale):**

| Onde | Como |
|:---|:---|
| No editor, a grade do botão direito | trocar continua valendo **só para a peça clicada**. Quando o boneco tem outras peças com a **mesma entidade**, a grade ganha uma opção: **"Trocar todas as iguais (2)"**, com o número. Desligada por padrão: o padrão é separado |
| Por skin | uma skin que troca a entidade "roda" pela "roda larga" troca **em todo lugar** onde a roda aparece. É o Character Map do Spriter: a troca é pelo nome de origem, e vale para todos os usos (`02`, seção 3, regra 3: trocar pelos nomes iguais) |
| No jogo | `encaixar(slot, peça)` troca **um** slot (as armas). Para todas: vestir a skin, ou uma chamada a mais, `encaixar_todas(de, para)`, que troca todo slot que tem aquela entidade |
| Mexer na entidade **por dentro** | já vale para todas: as duas rodas são a mesma entidade, e salvar "Por cima" muda as duas (`02`, "Mudar a entidade por dentro") |

**Vai para:** a rodada 9 (o slot vira base, com nome) leva a opção da grade; as rodadas K5 e G5 (a conexão nos leitores) levam o `encaixar_todas`. **Não conferido no programa:** se hoje duas peças com a mesma entidade já trocam separadas na grade. A rodada 9 confere primeiro.

**No mesmo minuto — o Godot: G3 e G4 entregues; a G6 e a G7 passam a outro chat.**

| Rodada | Estado | A prova (palavra do executor) |
|:---:|:---:|:---|
| G3, a malha | **entregue** 07h25, sem versao | A 13, B 7, X 5 pelo Godot. O heroi, cortado, bate peca a peca com o desenhador do Construct, parado e em 6 quadros. Regra 26 nos 7 casos B. Nao provado: additive e multiply (nenhum boneco usa) |
| G4, a skin | **entregue** 07h31, sem versao | vestir, tirar, a pilha, skin de outro arquivo. 7 pilhas do heroi e 3 do mecha batem com o Construct. **43 de 90 casos** pela suite inteira. Conserto achado: o no apagado deixava o esqueleto na memoria (`liberar()`) |
| G6 e G7, regras e particulas | em obra, RESERVA 21 (Opus), ficha em `rodadas/` | o chat da G1 a G4 parou por contexto pesado, numa rodada fechada, com a passagem escrita; ela esta inteira na ficha |
| G5 e G8 | esperam | a G5 espera a rodada 11 |

A ficha da rodada 11 ("Este boneco") esta escrita em `rodadas/`: primeiro o plano, com as contas a mao; o codigo so depois do "pode". Comeca quando houver vaga (no maximo tres chats de rodada ao mesmo tempo).

### 05/10/2026, 10h02 — a conta bateu no limite de uso às 07h38: duas horas e vinte paradas

Às 07h38 **todos** os chats pararam no meio do turno, o Diretor incluído. O limite voltou perto das 10h. O vigia disparou cinco vezes no vazio.

| O que estava rodando às 07h38 | Modelo |
|:---|:---:|
| o Diretor (conversa já comprida) | Fable |
| rodada 11, o plano | Fable |
| rodada 13, o tsc | Opus |
| G6, as regras do Godot | Opus |
| rodada 24, a conferência | Sonnet |

**Erro do Diretor, pela forma:** *contei os chats pela memória da máquina, e não pela conta.* A régua do `03` já dizia "no máximo 3 chats de rodada ao mesmo tempo, a conta cai no limite". Eu tinha quatro, dois deles em Fable, mais eu. A máquina aguentou; a conta não.

| A régua, daqui em diante | |
|:---|:---|
| **No máximo DOIS chats de rodada trabalhando ao mesmo tempo** | e um só em Fable (o Diretor já é um) |
| A ordem de quem anda | primeiro o que fecha versão do editor (o ovo); depois o Godot; o plano da rodada 11 entra numa vaga |
| O Diretor fala curto | conversa comprida de Diretor é o que mais gasta |

**Retomado às 10h01:** a rodada 24 (parte A) e a G6. Esperam vaga: o fecho da rodada 13 (espera a 24 largar a máquina), os consertos dos painéis (esperam a 13), o plano da rodada 11.

**Rodada 13, o que ficou pronto no disco antes da parada** (07h26 a 07h37; sem versão, sem fotos): o pivô da imagem sem chave própria (lista `pivosAMao`, item "Voltar o pivô para o osso") · o osso próprio novo nasce no pivô (exceção aceita pelo Diretor: a imagem **solta**, sem pivô à mão, nasce no centro) · a peça que volta (`chavesGuardadas`, Base → Chaves guardadas…) · `tsc` limpo às 07h37. **Uma versão só** para os quatro itens.

### 05/10/2026, 10h08 — a rodada 24 fechou: a rodada 23 está FEITA; a máquina passou à rodada 13

A rodada 24 largou a máquina às 10h07. Documento: `11 OS CONSERTOS E OS PAINEIS CONFERIDOS 2026-10-05.md`; 113 fotos em `backup/fotos-obra/rodada-24/`. Conferido no `programa/` v27.3 por quem não escreveu.

| Parte | Vi funcionar | Pela metade | Não funciona | Não dá sem janela |
|:---|:---:|:---:|:---:|:---:|
| A, os consertos da rodada 23 (14 linhas) | 10 | 3 | 1 | 1 (metade de uma linha) |
| B, os painéis da rodada 4 (12 linhas) | 11 | 1 | 0 | 0 |
| **Soma** | **21** | **4** | **1** | **1** |

**Confirmados na parte A:** `Delete` numa chave tira a chave, e sem chave tira o osso; `Ctrl+D` com chave não mexe no osso · a espada solta toca e mostra a edição de dentro · nada fica escolhido sem existir · a tecla `P` nos dois sentidos · o osso devolvido sem marca de erro · a chave do quadro 0 · o rodapé diz quando o Salvar não gravou.

| # | O que sobrou | Vai para |
|:---:|:---|:---|
| 1 | Soltar o painel da parede solta o painel errado (B2) | lote de consertos, chat dos painéis, **depois do fecho da 13** |
| 2 | O canto do painel solto não segue um arrasto rápido | idem |
| 3 | O "Sobre" diz uma versão atrás (A11) | idem (`montar-programa.py <número>`) |
| 4 | Com o emissor escolhido, Propriedades ainda abre a seção "ANEXO" (A8) | idem |
| 5 | "esqueleto" no rodapé de abrir `.bone` sem atlas, e textos do `runtime/` no pacote que não apareceram na tela (A6) | idem; o que estiver em `runtime/` vem a mim antes |
| 6 | Pôr entidade na cena: entra no meio da vista, mas a espada fica **deitada** (osso `root`, ângulo 0) (A4) | **não é conserto, por ora:** a entidade entra como foi desenhada, com ângulo 0. Fica para a mão do Humberto dizer se "de pé" era outra coisa |
| — | A Árvore vira fresta com a linha do tempo aberta (B7) | decisão do Humberto mantida; vai a ele com o número |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 23 | os consertos da noite | **feita** (v25.8 a v26.5). Conferida no uso pela rodada 24: 10 de 14, e o resto na fila de consertos |
| 24 | conferir a 23 e a 4 | **feita** (é conferência). O chat fica de pé para conferir a 13 e o lote de consertos |
| 13 | base e pivô | **"pode fechar" às 10h08**: fotos do antes, o fecho inteiro, uma versão, fotos do depois |

Trabalhando agora, dois chats: o fecho da rodada 13 e a G6 do Godot.

### 05/10/2026, 10h18 — G6 entregue (as regras no Godot): 60 de 90 casos; três achados que saem da pasta dele

Relato do executor (10h17), no disco, sem versão. Os 17 casos de regra passam; a suíte inteira pelo Godot dá **60 de 90**. O herói **com as regras** bate peça a peça com o desenhador do Construct, parado e em 12 quadros de walk, idle e attack, e com o runtime Python até 7e-14. A dívida da G1 está paga. Segue para a G7 (partículas).

| # | Achado | O que é | Vai para |
|:---:|:---|:---|:---|
| 1 | **A suíte de conformidade nunca olha o amortecimento da física.** Os 3 casos de física usam `damping: 1`; estragar a conta não deixa nenhum vermelho (regra 28) | falta um caso, escrito por quem não escreveu runtime (regra 26) | uma rodada pequena de conformidade, junto com os casos novos da rodada 11 |
| 2 | **O `Tocador` do leitor do Construct não solta a chave `reset` da física** (o `applyResets` existe e ninguém chama). No herói não aparece: o `reset` dele está no tempo 0 | defeito do `leitor-construct/` | a rodada K5 |
| 3 | O gerador de referência do Godot importava `skeleton.ts` direto, e as regras do `runtime/` não se registravam: "com" e "sem" regras saíam **iguais**, e ninguém tinha comparado as duas. Consertado no gerador dele. O addon do Construct de verdade importa pelo `pacote.ts`: lá as regras funcionam | a forma: *a referência saiu de um caminho que não ligava a coisa medida, e o verde era de comparar o vazio com o vazio* | fica como aviso a todo chat que gerar referência |
| 4 | O JSON do Godot lê `0.016666666666666666` uma casa binária abaixo de 1/60; com `physicsDt` exatamente 1/60 o dump pula passos. No jogo não pesa | não consertado | a G8 |

**Não provado, dito por ele:** o driver por `animation` · a física em `x`, `y`, escala e inclinação no desenho (só nos casos) · caminho diferente até o mesmo instante muda o cabelo até 0,61 px (é da física em passos; medido).

| # | Rodada | Estado |
|:---:|:---|:---:|
| G6 | Godot: regras | **entregue** (sem versão). Falta outra mão, e a mão do Humberto |

### 05/10/2026, 10h22 — rodada 13 ENTREGUE: v27.4 (base e pivô); a conferência dela começou

| | |
|:---|:---|
| Versão | **v27.4**, `programa/` montado; o executor largou a máquina às 10h21 |
| 1. O pivô | definir o pivô deixa o desenho **parado**; rodapé *"1 desenho ficou parado. O pivô fica guardado à mão: o osso não está nele"*; no painel Pivôs, a bolinha laranja; **Imagens → Voltar o pivô para o osso**. Antes (v27.3): *"1 desenho recolocado, de (20; 0) para (24; -12)"* |
| 2. A peça que volta | `Delete` no `arm_b`: *"20 chaves de 2 peças guardadas em 3 animações. Crie de novo com o mesmo nome e elas voltam"*; **Base → Chaves guardadas…**; um osso novo com o nome `arm_b`: *"12 chaves guardadas voltaram, em 3 animações"* |
| 3. O osso próprio novo nasce no pivô | a imagem solta, sem pivô à mão, no centro |
| Números (casa vazia, 10h14 a 10h17) | suíte **5.020** (4.990 passam, 29 pulados, 1 vermelho: o antigo do manual; +27) · tsc limpo · 90/90 · roteiro 14/14 · medir 30/30 e 21/30 · contagem em `backup/contagem-testes_2026-10-05_10-16_v27.4.tsv` |
| De fora, dito por ele | projeto de várias bases: só as animações do arquivo da base · animação apagada ou renomeada depois: as chaves ficam guardadas e não voltam sozinhas · a peça refeita volta com as **chaves**, não com as imagens dela |
| Fotos | `backup/fotos-obra/rodada-13/` (antes e depois, três telas) |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 13 | base e pivô | **entregue** (v27.4). A conferência no uso começou às 10h22, pelo chat da rodada 24 (Sonnet); sai o `13 BASE E PIVO CONFERIDOS` |

**A fila do editor:** conferir a 13 (agora) → o lote de consertos (painéis, Sobre, emissor, palavra), pelo chat dos painéis → conferir o lote.

### 05/10/2026, 10h42 — G7 entregue (79 de 90 no Godot); o plano de "Este boneco" lido, conferido e aprovado

**G7, as partículas no Godot — entregue no disco, 10h33, sem versão.** Os 19 casos P passam; a suíte inteira pelo Godot dá **79 de 90** (caem só as 9 de entidade e corpo, G5, e BIN e ZIP, G8). As faíscas batem vértice a vértice com o desenhador do Construct em 7 quadros. Medido sem janela: 1,0 ms por quadro andando; 3,5 ms com as faíscas. **Erro contado pelo executor, pela forma, para todo chat:** *"escolhi o estrago pelo nome do caso, não pelo que ele mexe"* (o P-006, "space world", nasce na origem: estragar o ponto de nascimento não muda nada). A G8 (a casca) fica com o mesmo chat, à espera de vaga.

**Rodada 11, parte 1 — o plano: `12 ESTE BONECO - o plano 2026-10-05.md`.** O Diretor leu inteiro e refez as contas à mão.

| O plano | |
|:---|:---|
| O campo | **um só**: `around`, no anexo `skeleton` de **quem recebe**; o valor é o nome do slot **do filho** que marca o meio. `x-since 1.1`: o leitor velho desenha em bloco e avisa pela versão |
| De quem é a marca | do **encaixe**, não da entidade. O poder em outro boneco entra em bloco. As duas armas e as duas rodas têm cada uma a sua |
| O que muda nos runtimes | só a ordem da lista: atrás · o boneco · na frente. O corte é pela ordem do filho **no instante** |
| Achado (regra 28) | **nenhum dos 90 casos mede a ordem de desenho de dentro da peça.** Entra o canal de sonda `drawList` e 11 casos (C-310 a C-319, X-307). À parte, o **C-263**, o amortecimento da física |
| Os outros programas | nenhum tem peça em dois lugares (pelas listas da casa; o formato de arquivo deles foi dito de memória, e marcado). É nosso |

| Conta refeita pelo Diretor | Resultado |
|:---|:---|
| As listas de C-310, 311, 315, 316, 317, 318, 319 e X-307 | fecham com a regra |
| C-312 e C-313 (as ordens por chave, 9.5, e as três amostras de cada) | fecham |
| C-263, contra `runtime-python/recorte/constraints.py:816-864` | 1 · 2,5 · 4,25 · 6,125 fecham; 2 passos em 0,04 s e 4 em 0,07 s, pelos dois caminhos do arredondamento |

| Decisão do Diretor | |
|:---|:---|
| O nome `around` | segue. **Vai ao Humberto** (regra 7: o nome de campo do núcleo é dele) |
| Duas peças marcadas no mesmo boneco | **a cebola**: a de slot mais alto abraça a de baixo (mais na frente na frente, mais atrás atrás). O plano propunha "a ordem dos slots nas duas metades"; mudei, e o C-314 é refeito à mão. **Vai ao Humberto como pergunta, com a cebola de sugestão** |
| A máscara de quem recebe | não corta a peça marcada |
| O runtime Python | escrito por **outro chat**, só pela spec e pelos `leiame` (regra 26) |

**"Pode" do lote 1 (formato e casos) às 10h42, numa cerca:** `formato/` e `conformidade/casos-pendentes/`; sem versão, sem suíte inteira, sem montar, até o lote de consertos do editor fechar.

| # | Rodada | Estado |
|:---:|:---|:---:|
| G7 | Godot: partículas | **entregue** (sem versão) |
| 11 | "Este boneco" | plano aprovado; lote 1 em obra (Fable) |

### 05/10/2026, 10h55 — a rodada 13 está FEITA (v27.4), conferida no uso; o lote 1 de "Este boneco" no disco; o executor de conformidade consertado

**Rodada 13, conferida por outra mão** (o chat da rodada 24, Sonnet), no `programa/` v27.4; largou a máquina às 10h54. Documento: `13 BASE E PIVO CONFERIDOS 2026-10-05.md`; 68 fotos em `backup/fotos-obra/rodada-25/`.

**Quadro (13 linhas): 12 vi funcionar · 1 pela metade · 0 não funciona.** A peça que volta: as seis linhas vistas, inclusive apagar, salvar, fechar, reabrir e só então recriar (12 chaves voltaram, em 3 animações; o ângulo do `arm_b` idêntico antes e depois). O pivô: o desenho parado, medido por foto comparada byte a byte, na base e em três quadros; entre chaves com giro, diferente, como o aviso diz.

| # | Defeito achado | Vai para |
|:---:|:---|:---|
| 1 | **Depois de salvar, fechar e reabrir, "Definir pivô…" e o painel Pivôs mostram o pivô velho** (4,13, o do atlas), embora o arquivo guarde o novo (`pivosAMao`), o desenho não tenha andado e a bolinha "à mão" volte | o chat da rodada 13, lote de consertos do pivô |
| 2 | A janela "Definir pivô" ainda diz *"será recolocado pelo pivô novo"*: o contrário do que o programa faz | idem |
| 3 | O painel Pivôs muda o pivô da imagem **do painel**, e não da escolhida na cena ou na Árvore | idem (conferir primeiro se é antigo) |
| 4 | Digitar o Ângulo numa imagem sem chave própria, numa animação, muda a **base** em vez de criar chave; só o arrasto cria | idem; é sobra da rodada 8d |

**Não provado, dito pelo conferente:** o seletor de arquivo e o de pasta do Windows foram trocados por funções em memória; "Repetir para a pasta" não foi montado; os gestos de pivô e chave só em 1920×1080.

| # | Rodada | Estado |
|:---:|:---|:---:|
| 13 | base e pivô | **feita** (v27.4). Conferida no uso: 12 de 13. Quatro consertos na fila |

**Rodada 11, lote 1 (formato e casos): no disco, 10h47, sem versão.** A spec ganhou o `around` e os três grupos, **com a cebola** (7.11, 7.13, 7.7, 2.5, 12.4, Apêndice A); o schema, `x-since 1.1`; 12 casos em `conformidade/casos-pendentes/`, com `esperado.json` digitado do plano. O C-314 refeito com a cebola confere com a conta do Diretor. Os 90 de hoje: 90 de 90. **O C-263 (amortecimento) bate com a conta à mão** no runtime de referência (2,5 e 6,125), e reprova com 3 e 10.

**O executor de conformidade tinha um verde mudo, e foi consertado** (lote 2, passo 1): chave de amostra que **o próprio executor não conhece** passava calada. Só os 11 casos novos de `drawList` citavam uma. Agora reprova, com o nome (`ferramentas/src/conformidade/pose-dump.ts`; 2 testes vistos vermelhos antes). Medido de novo, 10h50 a 10h52: referência **90/90**, Python **90/90**, Construct **90/90**, Godot **79/90** (os 11 de sempre, nenhum por canal ausente). **Erro do Diretor, pela forma:** *repassei o alarme ao Humberto ("os números do Construct e do Godot podem estar inflados") antes de ter a medida.* Não estavam. O executor contou o dele: *"eu disse 'não compara canal que o runtime não devolve'; era 'pula chave que ele mesmo não sabe comparar'"*. Sobra, de outra forma: o `P-002`, em `casos-pendentes/`, passa com o esperado vazio de propósito.

**A fila do editor, um por vez:** o lote de consertos dos painéis (escrevendo agora, na cerca) → fecho, quando o lote 2 da rodada 11 parar num ponto limpo → os consertos do pivô (chat da 13) → o runtime Python de "Este boneco", por outro chat.

### 05/10/2026, 11h19 — v27.5 fechada: nove consertos, e "Este boneco" no formato e no runtime TypeScript

Fechada pelo chat dos painéis, com o trabalho de três chats. Largou a máquina às 11h18. O `programa/` está montado **na v27.5**, e o "Sobre" diz v27.5 (o montar agora recebe o número: `python ferramentas/montar-programa.py 27.5`).

| De quem | O que entrou |
|:---|:---|
| chat dos painéis | o painel certo sai da parede (o "lado em uso"), e o Fechar o grupo · o canto do solto segue o arrasto rápido · **o Sobre diz a versão certa** · "Emissor" em Propriedades · "base" no lugar de "esqueleto" em dois avisos (`io/open-save.ts`, `io/save-binary.ts`) |
| chat da rodada 13 | o pivô à mão lido depois de reabrir (`doc/hand-pivots.ts`, novo) · a frase da janela · o painel Pivôs segue a escolha (já era assim na v27.3) · digitar X, Y, Ângulo ou Escala de uma imagem numa animação cria a chave, como arrastar. **De fora, dito por ele:** o painel Propriedades de baixo pode ter o mesmo defeito do Ângulo |
| chat da rodada 11, lotes 1, 2 e 2b | o campo `around` na spec e no schema (`x-since 1.1`) · os três grupos e a cebola no runtime TypeScript (`render-list.ts`: `collectDrawGroups`, `collectDrawList`; a tela pelos três grupos) · **o relógio do filho continua** na troca de placeholder com a mesma `uri` (decisão do Diretor: sem isso, ligar "Este boneco" no meio da animação fazia o poder recomeçar) · o executor de conformidade reprova canal que não conhece · **14 casos novos em `casos-pendentes/`** (C-263, C-310 a C-321, X-307): 104 de 104 no TypeScript |

| Números da v27.5 (11h11 a 11h13, casa parada) | |
|:---|:---|
| Suíte | **5.043** (5.013 passam, 29 pulados, 1 vermelho: o antigo do manual). +23: 8 dos painéis, 4 do pivô, 11 da rodada 11 |
| tsc · conformidade (`casos/`) · roteiro · medir | limpo · 90/90 · 14/14 · 30/30 e 21/30 |
| Contagem | `backup/contagem-testes_2026-10-05_11-11_v27.5.tsv` |

**O fecho parou uma vez, e parou certo:** `leitor-construct/testes/pacote.test.ts` ficou vermelho porque o addon leva o `runtime/` dentro e o runtime mudou. Decisão do Diretor: remontar (`npm run leitor:construct`), com cópia do addon das 05h56 em `backup/`; **90 de 90 sobre o pacote novo** (11h10) e os 129 testes do leitor verdes. **O addon do Construct agora é o do runtime da v27.5**; um arquivo com `around` ele desenha em bloco, até a K5.

**Régua nova, para toda ficha de obra:** montar é `python ferramentas/montar-programa.py <o número que vai fechar>`. E quem mexer em `runtime/` remonta o pacote do Construct no mesmo fecho. (O `CLAUDE.md` ainda diz o comando velho: vai ao Humberto.)

**Do plano da rodada 11, não provado:** a física de dentro do filho continuando na troca de placeholder · a troca por skin entre dois anexos da mesma `uri`.

| # | Em obra desde 11h19 | Chat | Modelo |
|:---:|:---|:---|:---:|
| 26 | conferir no uso os nove consertos, na v27.5; sai o `14 OS NOVE CONSERTOS CONFERIDOS` | o conferente (era a rodada 24) | Sonnet |
| 11, lote 3 | "Este boneco" no runtime **Python**, só pela spec e pelos `leiame`, sem abrir o TypeScript nem o plano | RESERVA 23 | Opus |
| G8 | a casca do Godot (`.bonez`, `.boneb`, o importador, o nó no editor, a velocidade) | o chat da G6 e G7 | Opus |

São três chats, um deles em Sonnet. Espera vaga: o lote 4 da rodada 11 (o editor de "Este boneco"), em Fable.

### 05/10/2026, 11h31 — "Este boneco" nos DOIS runtimes, um sem olhar o outro; G8 entregue (81 de 90); a K5 começou

**Rodada 11, lote 3 — o runtime Python: feito, 11h29, no disco.** Escrito por outro chat (RESERVA 23, Opus), **só pela spec e pelos `leiame`**, sem abrir `runtime/src`, o plano nem os leitores.

| | |
|:---|:---|
| Os 14 casos novos | **verdes no Python** (15 de 15 com o P-002) |
| Os 90 de `casos/` | 90 de 90; os 90 dumps **idênticos byte a byte** ao runtime Python de antes |
| **O confronto TypeScript × Python** | **90 de 90 e 15 de 15, campo a campo.** O texto da spec bastou para dois runtimes concordarem |
| Mutações (regra 26) | 12 de 12 vistas vermelhas, cada uma num caso próprio |
| Testes do Python | 266 |
| Um erro do Diretor | eu disse que o C-321 já passava antes; **não passava** (ele também mede `drawList`) |
| O erro dele, pela forma | *"medi o fim de linha com uma régua que o shell reescrevia"* (`grep $'\r'` no Bash virou `grep 'r'`): "consertou" para LF arquivos que eram CRLF; pegou pelo diff contra o backup e devolveu |

| Onde a spec não bastou (três decisões dele, sem caso) | Vai para |
|:---|:---|
| 1. O slot marcado que é o `end` da máscara de quem recebe: a 7.7 manda a máscara acabar ali, e também diz que o filho "está fora da ordem" | o chat da rodada 11: fechar na spec, com um caso |
| 2. O slot do meio que mostra um filho com `around` próprio: tira só as peças do meio; o atrás e a frente do neto ficam | idem |
| 3. Emissor de forma desconhecida não entra na `drawList` | idem |

**Não provado, nos dois:** a física do filho continuando na troca de placeholder · a troca por skin · o C-313 não tem mutação só dele · o README do `runtime-python/` tem números velhos.

**Rodada 11, lote 4, parte 1 — o editor, no disco, 11h29, sem versão:** o comando `SetEntityAround` (na base, o campo no anexo; numa animação, um segundo placeholder e a chave na agulha), `minVersion` 1.1 só quando o campo existe, **Entidades ▸ Este boneco…** (lista dos slots, com "N atrás, M na frente") e **Tirar o Este boneco**, o rodapé, e o aviso quando o slot do meio some. 10 testes novos. **Nada visto na tela.** A parte 2 (o botão direito numa imagem de dentro, o clique pela ordem em volta, a aba Ordem, o contorno do meio) está em obra. **Achado dele, do lote 2:** o leitor TypeScript ainda dizia ser 1.0 e avisava "best effort" no próprio `around`; o Diretor deu o "pode" para `READER_VERSION` 1.1 (o Python já subiu sozinho, pela spec). **O pacote do Construct fica velho de novo: remontar no fecho.**

**G8 entregue (a casca do Godot), 11h19, sem versão.** `.boneb` e `.bonez` lidos; **81 de 90** pela suíte inteira (caem só as 9 da G5). O importador guarda os três formatos com os mesmos bytes (provado pelo `--import` sem janela). O nó é `@tool`, com arquivo, animação inicial, laço, escala, velocidade e skins no Inspetor. Additive e multiply batem com o Construct. O `physicsDt` exato consertado no dump.

| Velocidade, sem janela, máquina a 40% | |
|:---|:---|
| um herói · com armadura · com faíscas | 1,0 · 1,0 · 3,1 ms por quadro |
| **dez heróis com faíscas** | **34 a 37 ms** (o quadro mais caro: 81 a 90 ms). A parte quente é a partícula, ~50 µs cada |

**Não provado no Godot:** exportar de verdade (pede os modelos de exportação) · ver no editor e mexer no Inspetor. O Godot criou `.godot/`, 9 `.import` e 19 `.gd.uid` em `leitor-godot/`.

| # | Rodada | Estado |
|:---:|:---|:---:|
| 11, lotes 1 a 3 | "Este boneco": formato, casos, os dois runtimes | **entregue** (lotes 1, 2, 2b na v27.5; o lote 3 no disco). Os 14 casos saem de `casos-pendentes/` no próximo fecho |
| 11, lote 4 | o editor | parte 1 no disco; parte 2 em obra (Fable) |
| G8 | Godot: a casca | **entregue** (sem versão) |
| K5 | Construct: a conexão | em obra desde 11h31, RESERVA 24 (Opus). Ficha em `rodadas/` |
| G5 | Godot: a conexão | destravada (o Python tem a lista de desenho). Espera vaga |

### 05/10/2026, 11h51 — os nove consertos conferidos (v27.5); o editor de "Este boneco" escrito; o fecho da v27.6 começou

**Rodada 26 — os nove consertos, conferidos no uso** pelo conferente (Sonnet), no `programa/` v27.5; largou a máquina às 11h50. Documento: `14 OS NOVE CONSERTOS CONFERIDOS 2026-10-05.md`; 28 fotos em `backup/fotos-obra/rodada-26/`. **Só em 1920×1080.**

**Quadro (11 linhas): 9 vi funcionar · 2 pela metade · 0 não funciona.** Vistos: o Sobre diz v27.5 · soltar e fechar o grupo certo, dos dois lados · o canto segue o arrasto rápido e não gruda · "Emissor" · o aviso com "base" · o pivô novo lido depois de salvar e reabrir · a frase da janela · e, contra a v27.4 servida ao lado, **o herói e os 7 exemplos com 0 pixel de diferença na cena** (o runtime mudou por baixo sem mudar o desenho).

| # | O que sobrou | Vai para |
|:---:|:---|:---|
| 1 | **O painel Propriedades de baixo:** digitar Rotação, Posição ou Escala de uma imagem numa animação muda a **base**. A ficha rápida está certa (a chave nasce) | o chat da rodada 13, depois do fecho da v27.6 |
| 2 | O painel Pivôs não segue a imagem que é **sequência** (`hand`): mostra `body`. Com um osso escolhido, ora volta a `body`, ora fica na de antes | idem |
| 3 | "esqueleto" na dica do mini-ícone da Árvore ("esqueleto filho") e no aviso "O esqueleto aninhado … não foi aberto" | idem; se o texto morar em `runtime/`, o Diretor decide |
| 4 | Menores: depois de a imagem ganhar chave, a ficha lê a diferença (digitou X=25, leu 7) · a altura do solto para em 80% · "O manifesto do projeto baixados" no rodapé de Salvar | idem |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 26 | os nove consertos (v27.5) | **feita**: 9 de 11, e o resto na fila |

**Rodada 11, lote 4, parte 2 — no disco, 11h39:** `READER_VERSION` 1.1 · o clique pega o que está desenhado por cima (`pickAll` por `collectDrawGroups`) · o meio só pega o clique com a peça escolhida · o clique diz qual imagem de dentro; o botão direito nela traz **Este boneco** como primeiro item das opções (✓ na que já é o meio) · a aba Ordem com as duas linhas presas · o contorno tracejado do meio. **Não provado, dito por ele:** a tela (só a conta) · se as opções ficam acima ou abaixo das miniaturas · na aba Ordem a peça continua também na linha antiga dela.

**K5, parte 1 (itens 1 a 5) — no disco, 11h48:** o desenhador do Construct pelos três grupos; Encaixar (com "em volta de"), Desencaixar, Encaixar todas, Animar a peça, Soltar a peça, o gatilho Ao encaixar, as expressões. 90 de 90 e os 14 novos sobre o pacote; 155 testes do leitor. Erro contado por ele, pela forma: *"escolhi o boneco do teste pelo nome dele, não pelo que ele mexe"*. Supôs: peça sem pino cai na origem do osso · cor do anexo novo, branca · Encaixar todas olha o que o slot mostra agora. Segue na parte 2.

**"Pode fechar" a v27.6 às 11h51**, ao chat da rodada 11: o lote 4 inteiro, o leitor 1.1, o Python do lote 3, e **os 14 casos promovidos de `casos-pendentes/` para `casos/`** (a conformidade passa a 104; o Godot fica 81 de 104 até a G5). Regra 25 mandada na ficha do fecho: varrer todos os leitores da contagem antes de mover; o que for dos leitores vem ao Diretor como lista.

### 05/10/2026, 15h18 — v27.6 fechada ("Este boneco" no editor); a K5 entregue: o leitor do Construct está completo; a conta parou outra vez, das 12h14 às 15h16

**A conta bateu no limite de uso pela segunda vez, das 12h14 às 15h16** (três horas; no dia, 5h20). Desta vez eram só dois chats de rodada e o Diretor. **Não é a quantidade ao mesmo tempo: é o total gasto no período.** Três estavam em Fable de manhã; ao meio-dia, dois (o Diretor e o fecho da rodada 11). **Régua, daqui em diante:** as rodadas que faltam vão em Opus; Fable só para o que mexe no formato; o Diretor escreve menos (só entrega, defeito e decisão); conferência em Sonnet e numa tela só, salvo motivo.

**v27.6 — fechada às 12h01 pelo chat da rodada 11; largou a máquina (conferido às 15h17).**

| | |
|:---|:---|
| Leva | o lote 4 inteiro ("Este boneco" no editor), o leitor 1.1, o runtime Python do lote 3 |
| Suíte (11h59) | **5.096** em 91 arquivos · 5.066 verdes · 29 pulados · 1 vermelho, o antigo do manual |
| tsc · conformidade · roteiro · medir | limpo · **90 de 90** nos dois runtimes, confronto igual · 14 de 14 · 30/30 e 21/30 |
| Os 14 casos novos | passam nos dois runtimes, **ainda em `casos-pendentes/`** (decisão do Diretor: um teste da K5 lia só daquela pasta; a varredura da regra 25 pegou antes de mover). A K5 já trocou o teste e disse "pode mover os casos": **a promoção entra no próximo fecho** |
| Fotos | **só em 1920×1080** (a conta parou no meio), em `backup/fotos-obra/rodada-11/` |
| O erro dele, pela forma | *"medi só os meus arquivos nos lotes, e as réguas da casa moram em outros"*: a suíte inteira acusou as duas ações novas sem nome de tarefa e sem estado. Consertado antes de guardar |

| O que as fotos mostraram de diferente da conta | Vai para |
|:---|:---|
| **O item "Este boneco" NÃO é o primeiro da grade:** vem depois das miniaturas, de "fonte: pasta · objeto" e de "Em todas as skins" | o lote de consertos, agora |
| Na aba Ordem aparece uma linha presa de **zero** peças; a de trás fica fora da vista sem rolar | idem |
| O nome no contorno do meio fica por cima das alças do Transformar | idem |
| O herói de exemplo tem duas espadas no mesmo lugar (a imagem e a entidade); a `espada.bone` só tem duas peças: **falta um exemplo de poder com várias peças** | anotado; o conferente usa os arquivos do caso C-311 |
| As duas folhas geradas (`O QUE O PROGRAMA FAZ`, `O QUE NAO TEM PORTA`) continuam com a hora de 02h31: `npm run tarefas` e `portas` só imprimem | a conferir como a casa as regrava |

**K5 entregue às 11h58 (a conexão no Construct), sem versão. O leitor do Construct está completo: K1 a K7.** Encaixar (com "em volta de"), Desencaixar, Encaixar todas, Animar a peça, Soltar a peça, Ao encaixar, as expressões de osso e de slot (conta à mão antes), o jogo salvo com os encaixes, o `reset` da física (o achado da G6: consertado, com o teste que falha no Tocador velho), o exemplo (**E** troca a espada pelo capacete; **Q** liga uma aura em volta). 90 de 90 e os 14 novos sobre o pacote; **162 testes** (eram 129). **Achado dele (regra 28), pela forma:** *"o teste importava o módulo, não o que liga as regras"* — seis arquivos de teste do leitor rodavam o herói com as regras "noop"; dois testes eram verdes só por isso. No addon de verdade as regras sempre estiveram ligadas. **Fora do escopo, dito por ele:** o `reset` da física dentro de uma peça não dispara. **Nada visto no Construct.**

**G5 (a conexão no Godot):** o chat da G6 a G8 passou adiante por contexto pesado; ficha em `rodadas/`; RESERVA 25 (Opus), em obra, retomada às 15h16.

| # | Rodada | Estado |
|:---:|:---|:---:|
| 11 | "Este boneco" | **entregue** (v27.5 e v27.6). Conferência no uso em obra (rodada 27, Sonnet, 1920×1080): sai o `15 ESTE BONECO CONFERIDO` |
| K5 | Construct: a conexão | **entregue** (sem versão). Falta a mão do Humberto |
| 28 | consertos pequenos: o painel Propriedades de baixo · o painel Pivôs com sequência e com osso · três textos · a ficha que lê a diferença · **Este boneco como primeiro item da grade** · a linha de zero peças · o nome do contorno | em obra, na cerca: o chat da rodada 13 (Opus). O fecho dele leva a promoção dos 14 casos |

Chats arquivados pelo Diretor, por memória (são filhos desta janela; reabrem sem aprovação): o da G6 a G8, o do Python, o da K5.

### 05/10/2026, 15h41 — "Este boneco" conferido no uso (v27.6); o Godot passa nos 104; o fecho da v27.7 começou

**Rodada 27 — "Este boneco", conferido por outra mão** (Sonnet), no `programa/` v27.6, em 1920×1080; largou a máquina às 15h40. Documento: `15 ESTE BONECO CONFERIDO 2026-10-05.md`; 24 fotos em `backup/fotos-obra/rodada-27/`. O conferente fez um poder de cinco peças dele (`poder5.bone`, com as imagens do herói e um idle que gira), porque os arquivos do caso C-311 não têm atlas.

**Quadro (12 linhas): 8 vi funcionar · 3 pela metade · 0 não funciona.**

| Visto funcionar | |
|:---|:---|
| As três linhas do Humberto | o meio some; a capa e o cabelo vão para trás do herói inteiro; a lâmina e a bota ficam na frente. Peça por peça, com foto de antes e depois |
| O programa diz | *"2 atrás, 2 na frente… 'meio' marca o meio e não é desenhada"* |
| Ver | na aba Ordem, "na frente (2)" no topo e "atrás (2)" no fim; na cena, a caixa do meio com o nome |
| A porta no menu | Entidades → Este boneco…, com a conta de cada imagem |
| No meio da animação | de 0,33 s em diante: os quadros de antes idênticos, os de depois em volta |
| **O relógio** | ligando com o poder tocando: **0 px de diferença** nos 5 quadros. Não recomeça, não salta |
| O clique por cima · salvar e reabrir · mexer no boneco | funcionam. Projeto sem a marca: 0 px de diferença |

| # | O que sobrou | Vai para |
|:---:|:---|:---|
| 1 | **Pelo botão direito não há como desfazer:** com a marca ligada, a grade é a mesma, e escolher de novo só troca o meio. `Ctrl+Z` e o menu desfazem | o lote da v27.7 (item 8) |
| 2 | "Este boneco" não é o primeiro item da grade | já escrito no lote (item 5) |
| 3 | **Na base não foi visto:** a entidade arrastada entra sempre "nesta animação". Pode ser o gesto | a próxima conferência; e a rodada 9 |
| 4 | Depois de arrastar o poder apareceram **dois slots** (`poder5` e `poder52`) | o lote da v27.7 (item 9): provar primeiro |
| 5 | "Tirar a entidade" fica cinza para o poder arrastado (não substituiu imagem nenhuma); quem tira é Apagar | não é conserto: a dica diz por quê |

**O que confundiria o Humberto, dito pelo conferente:** o poder entra na animação aberta, não na base (e o herói abre dentro do idle) · depois de ligado, nada no botão direito diz que está ligado.

| # | Rodada | Estado |
|:---:|:---|:---:|
| 11 | "Este boneco" (formato, dois runtimes, editor) | **feita** (v27.5 e v27.6). Conferida no uso: 8 de 12. Consertos na v27.7. **Na base: não visto** |

**G5, parte 1 (15h26):** pelo Godot sem janela, **`casos/` 90 de 90 e os 14 novos**; 134 testes. A espada aparece. **Buraco achado por ele (regra 28):** o estrago "o bloco perde a máscara de quem recebe" passava verde em **todos** os casos; fechou com um teste dele; **falta um caso na suíte**. Também: o X-307 passa com o `around` desligado, e o C-316 com a cebola invertida (quem prova a cebola é só o C-314). Segue na parte 2 (a API, o exemplo, a velocidade).

**Casos de conformidade a escrever, numa rodada pequena, por quem não escreveu runtime:** a máscara de quem recebe sobre a peça em bloco · os três cantos do chat do Python (o slot marcado que é o `end` da máscara; o meio que mostra um filho com `around` próprio; emissor de forma desconhecida na `drawList`) · a física do filho na troca de placeholder · o `reset` da física dentro de uma peça.

**Régua nova do Diretor, depois de o Humberto cobrar os modelos:** *escolhi o modelo pela rodada, e não pelo lote.* A rodada 11 mexe no formato, e por isso ficou em Fable até o fim, inclusive no lote do editor e no fecho, que eram obra de Opus; era o chat que rodava nas duas paradas da conta. **O modelo se escolhe por lote; fecho de versão é sempre Opus.**

**Fecho da v27.7, "pode" às 15h41, pelo chat da rodada 13 (Opus):** os sete consertos escritos às 15h27 (o painel de baixo cria a chave · o painel Pivôs na sequência e com osso · três textos · a ficha lê o que se digitou · **Este boneco no alto da grade** · a linha de zero peças · o nome do meio), mais Tirar pelo botão direito, os dois slots do arrasto, "entidade" em quatro textos do `runtime/` (exceção do Diretor; o pacote do Construct é remontado), e **a promoção dos 14 casos** para `conformidade/casos/`.

### 05/10/2026, 16h00 — v27.7 fechada (conformidade 104 de 104); G5 entregue: o leitor do Godot está completo; o plano das partículas aprovado

**v27.7 — fechada pelo chat da rodada 13 (Opus); largou a máquina às 15h59.** `programa/` montado com `montar-programa.py 27.7`.

| | |
|:---|:---|
| Suíte (15h47 a 15h49) | **5.120** (5.090 passam, 29 pulados, 1 vermelho: o antigo do manual). Nenhum arquivo caiu de contagem (`backup/contagem-testes_2026-10-05_15-49_v27.7.tsv`) |
| **Conformidade** | **104 de 104** no TypeScript e no Python; confronto 104 de 104, campo a campo; **104 de 104 sobre o pacote do Construct**, remontado. Os 14 casos foram promovidos para `conformidade/casos/` |
| tsc · roteiro · medir | limpo · 14/14 · 30/30 e 21/30 |
| Leva | os sete consertos pequenos · **Tirar o Este boneco pelo botão direito** (e "o meio passa a ser esta") · "entidade" em quatro textos do `runtime/` · a promoção dos casos e as linhas datadas nos README |
| Os dois slots do arrasto | **não repete**, diz o executor: uma soltura, um slot; `poder52` é o nome da segunda soltura do mesmo arquivo. Suspeita: o arrasto por protocolo entregou a soltura duas vezes. Teste novo. O conferente confere |
| Sobrou | o nome do meio ainda começa sob uma alça quando a peça está girada (erro dele, pela forma: *"o teste mediu a régua que eu mesmo escrevi, e não o defeito que foi relatado"*) · dois textos "Esqueleto aninhado passou da profundidade máxima" em `runtime/src/file.ts:305` e `nested.ts:255` |
| Fotos | 6, em 1920×1080, `backup/fotos-obra/rodada-28/`, **tiradas pelo editor do disco**, e não pelo `programa/` montado |

**G5 entregue às 15h41, sem versão. O leitor do Godot está completo: G1 a G8.** Pelo Godot sem janela: 90 de 90 e os 14 novos (agora 104 em `casos/`); **162 testes**. A API: `encaixar(slot, peça, em_volta)`, `desencaixar`, `encaixar_todas`, `animar_peca`, `soltar_peca`, o sinal `encaixado`, as listas, a posição e o ângulo de osso e de slot. O exemplo: **E** troca a espada pelo capacete; **Q** liga a aura em volta. Velocidade (máquina carregada): um herói 1,36 ms; com a aura 2,33 ms; **dez heróis com faíscas 54 a 58 ms**. **Não tem, e o Construct tem:** o jogo salvo dos encaixes. **Não provado:** partícula de peça com `space: "world"` no nó. Erro dele, pela forma: *"escrevi um teste de 'nada muda' num estado em que não havia nada para mudar"*. **Nada visto numa janela.**

**Rodada 16, parte 1 — o plano das partículas: `16 AS PARTICULAS - o plano 2026-10-05.md`** (RESERVA 26, Opus; sem código; o programa não foi aberto). A ficha em **7 abas com ícone**, sem rolar (hoje: 12 grupos, 50 controles, 2.736 px em 343). Conferido no código, campo a campo: **sem controle nenhum** ficam `color`, `bursts`, `edge`, `scaleOverLifetime`, `colorOverLifetime`, `alphaOverLifetime`, `sequence`, e não há como pôr chave no `emitting`; a cena não desenha forma nenhuma. Seletor com 9 desenhos. O caminho: `shape: "path"` e um campo novo `curve` (`x-since 1.1`), com três casos (P-021 a P-023) calculados no plano. O selo de peso: verde até 60 vivas, amarelo até 150, vermelho acima; avisa, nunca impede. **9 lotes; só o 7 mexe no formato.** Aprovado pelo Diretor nas quatro sugestões; **a conta do caminho o Diretor refaz quando chegar o lote 7.**

| Perguntas para o Humberto (levadas a ele, com a sugestão do Diretor; enquanto não disser não, valem) | Sugestão |
|:---|:---|
| A ficha do emissor em 7 abas com ícone, sem rolar | sim |
| O caminho das partículas pode ser de outro slot (a capa do herói) | sim, de qualquer slot |
| O selo de peso: 60 / 150 por emissor (100 / 300 pelo boneco), só avisa | sim |
| Chave em velocidade, direção, raio: outra rodada; nesta só Emitindo ganha chave | sim, outra rodada |
| Duas peças em volta do mesmo boneco: a cebola | sim (feito) |
| O nome do campo `around` | sim |
| "Trocar todas as iguais" na grade, desligada por padrão | sim |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 28 | os dez consertos pequenos | **entregue** (v27.7). Conferência em obra (rodada 29, Sonnet, 1920×1080): sai o `17 A V27.7 CONFERIDA`; leva também o "na base vale em todas" que faltou ver |
| G5 | Godot: a conexão | **entregue** (sem versão). Falta a mão do Humberto |
| 16 | partículas: o sistema | plano aprovado; **lote 1 em obra desde 16h00**, na cerca (o mesmo chat, Opus) |

**Faltam, no editor:** a 7 (pedir a pasta), a 9 (o slot vira base; "trocar todas as iguais"), a 10 (o visualizador de montagem), a 16 (lotes 1 a 9), a 17 (a fila), os pequenos, e a 20 (a mão do Humberto). Fichas da 7, 9 e 10: a escrever.

### 05/10/2026, 16h29 — a v27.7 conferida no uso; o lote 1 das partículas no disco; o fecho da v27.8 começou

**Rodada 29 — a v27.7, conferida por outra mão** (Sonnet, 1920×1080); largou a máquina às 16h08. Documento: `17 A V27.7 CONFERIDA 2026-10-05.md`; 11 fotos em `backup/fotos-obra/rodada-29/`.

**Quadro (10 linhas): 7 vi funcionar · 2 pela metade · 1 não funciona.**

| Visto funcionar | |
|:---|:---|
| **"Na base vale em todas as animações"** (faltava) | o poder posto na base e marcado aparece em volta em walk, idle e attack. O caminho: aba Animações → "Base — montar" → Entidades → Pôr entidade na cena… (pergunta qual) → escolher pela aba Ordem → Entidades → Este boneco… |
| Este boneco no alto da grade · Tirar pelo botão direito (0 px de diferença do antes) · a aba Ordem sem a linha de zero | |
| O painel de baixo cria a chave · o painel Pivôs na mão e com osso | |
| **Os dois slots do arrasto: não é defeito do programa.** Contados os eventos: `dragstart` 1, `drop` 1, um slot, um passo no Histórico. Era o arrasto por protocolo das conferências antigas | |

| # | O que sobrou | Vai para |
|:---:|:---|:---|
| 1 | **O nome do meio, com a peça girada, fica sob a alça de girar** ("m… · o meio (…o é desenhado)") | lote pequeno, depois da v27.8 |
| 2 | Ao digitar **Escala X** de uma imagem com chave própria, o campo **X** muda sozinho (40 → 50,5). O desenho pode estar certo | idem: provar primeiro o que é |
| 3 | O aviso da entidade que não abriu: o conferente não conseguiu disparar; o texto não foi visto | idem |
| 4 | Arrastar da aba Entidades com a base aberta **pelo menu** Base → Abrir a base caiu na animação | a rodada 9 confere |
| 5 | Dois textos "Esqueleto aninhado passou da profundidade máxima" em `runtime/` | lote pequeno, com o pacote do Construct remontado |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 28 | os dez consertos pequenos (v27.7) | **feita**: 7 de 10, e o resto na fila |
| 11 | "Este boneco" | **feita**, agora com a base vista |

**Rodada 16, lote 1 — no disco às 16h09:** a ficha do emissor em **8 abas** (Nascer · Tempo · Lugar · Forma · Movimento · Giro e tamanho · Cor · Imagem), ícone com o nome na dica, `LINHAS_POR_ABA = 6`, só os campos da forma; nada some. `panels/particle-sheet.ts` (novo). **Achado dele:** `ferramentas/provas/medir-paineis.mjs` **não media a ficha do emissor** (só a malha `face` e a regra `look_driver`). Escreveu a terceira passada (emissor do modelo fogo, aba por aba, com conteúdo, nas três telas; `--so-emissor`). No fecho roda primeiro contra a ficha velha. **"Pode fechar" a v27.8 às 16h10**; depois, os lotes 2 e 3 em fila.

### 05/10/2026, 16h59 — partículas: três lotes, três versões (v27.8, v27.9, v28.0)

Rodada 16, pelo chat `EXECUTANDO · rodada 16 — partículas` (era a RESERVA 26; Opus). Cada lote com o fecho inteiro e fotos.

| Versão | Lote | O que ele vai ver | Números |
|:---:|:---:|:---|:---|
| **v27.8** (16h31) | 1 | a ficha do emissor em **9 abas**, 5 linhas por aba, sem rolar; ícone com nome curto, o inteiro na dica; a ficha rápida foi para dentro da aba Lugar | suíte 5.128 · 104/104 · roteiro 14/14 · medir **57/57** de lado e **48/57** de altura (as 27 medidas novas do emissor cabem; os 9 que rolam são os de antes) |
| **v27.9** (16h42) | 2 | o seletor de forma: nove botões com desenho; anel e arco gravam o círculo com valores; malha e caminho cinzas dizem por quê; a linha ganhou início e fim | suíte 5.133 · 104/104 · 14/14 |
| **v28.0** (16h53) | 3 | a forma na cena, com alças no raio, no anel, no fim do arco, no canto e nas pontas da linha. **Provado com o mouse:** raio 30 → 40, um desfazer volta a 30 | suíte 5.139 · 104/104 · 14/14 |

| | |
|:---|:---|
| **A ficha velha, medida** | pede **2.953 px**; o painel tem 309 (1440×900), **187** (1280×720), 431 (1920×1080). **Não bate com os 2.736 px** que o `ESTADO.md` citava (217 a mais; o antigo foi à mão, com outro emissor). Dito às claras no `ESTADO.md` |
| O medidor | `ferramentas/provas/medir-paineis.mjs` ganhou a terceira passada (o emissor, aba por aba, com conteúdo, nas três telas; `--so-emissor`). Rodou primeiro contra a ficha velha |
| O que a foto mostrou e a conta não | em 1280×720 o painel tem 187 px, e não 230 (por isso 5 linhas e 9 abas) · os ícones saíam vazios (o flex encolhia o desenho) · rótulos em duas linhas |
| Decisão do Diretor | o nome da forma escolhida passa a aparecer **escrito** (hoje só aceso no botão e na dica): entra no lote 4 |

**Em obra:** os lotes 4 (curvas e gradiente) e 5 (rajadas), na cerca; e a **rodada 30**, a conferência das partículas no uso (v28.0), pelo conferente (Sonnet): sai o `18 AS PARTICULAS CONFERIDAS`.

### 05/10/2026, 17h24 — as partículas conferidas no uso (v28.0); v28.1 fechada (lotes 4 e 5 e seis consertos)

**Rodada 30 — as partículas da v28.0, conferidas por outra mão** (Sonnet; 1920×1080, e 1280×720 na ficha); largou a máquina às 17h06. Documento: `18 AS PARTICULAS CONFERIDAS 2026-10-05.md`; 16 fotos em `backup/fotos-obra/rodada-30/`.

**Quadro (8 linhas): 6 vi funcionar · 2 pela metade · 0 não funciona.** Vistos: a ficha cabe nas duas telas e nada sumiu · o seletor de forma · as cinco alças puxadas com o mouse (o número acompanha, `Ctrl+Z` volta) · mover e girar continuam · preso a osso, a forma acompanha · salvar e reabrir.

| Defeito achado | Destino |
|:---|:---|
| Retângulo e Linha nasciam com tamanho zero: a cena não mostrava nada | consertado na v28.1 |
| `Ctrl+Z` juntava digitar e puxar num passo só | consertado; provado com teclado e mouse (80×40 → 100×50 → um desfazer → 80×40) |
| Círculo, Anel e Arco com os mesmos três campos | consertado: cada forma mostra os seus |
| Duas alças em cima da estrela, sem dizer o que puxam | consertado: dica, e o rodapé diz o número enquanto arrasta |
| A Taxa sozinha não mudava nada na cena | **não era o teto de vivas** (ver abaixo) |
| Fogo de novo cria outro emissor sem avisar · "Espaço" cortava a frase | consertados |

**O que confundiria o Humberto, dito pelo conferente:** duas fileiras de ícones sem texto ao lado (o nome só na dica) · o cabeçalho não dizia a forma escolhida (o nome escrito entrou na v28.1).

**v28.1 — fechada às 17h23:** o lote 4 (curva de tamanho e de sumir na vida; gradiente de cor na vida; cor do emissor; **o nome da forma escrito**), o lote 5 (rajadas, numa janelinha) e os seis consertos. A ficha tem **10 abas**, 5 linhas cada.

| Números da v28.1 (17h20 a 17h22) | |
|:---|:---|
| Suíte | **5.153** (5.123 passam, 29 pulados, 1 vermelho: o antigo do manual) |
| tsc · conformidade · roteiro | limpo · 104/104 · 14/14 |
| medir | **60/60** de lado, **51/60** de altura: as 30 medidas do emissor (10 abas × 3 telas) cabem; os 9 que rolam são os de sempre |

**Achado dele, medindo na tela (0 px contra 17.089 px):** a Taxa não mudava nada porque **o desenhador do `runtime/` guarda a curva de emissão pelo nome e nunca a esquece** (`runtime/src/render/canvas.ts:214`). Consertou do lado do editor (a cena troca de desenhador quando o arquivo muda). **O defeito de fundo continua no `runtime/`:** quem recarregar um arquivo no mesmo desenhador cai nele. Vai para o lote 7, que mexe no runtime. A ficha do Diretor apontava o teto como causa: estava errada, e o executor não a seguiu às cegas.

| # | Rodada | Estado |
|:---:|:---|:---:|
| 16, lotes 1 a 3 | a ficha em abas, o seletor de forma, a forma na cena | **feita** (v27.8 a v28.0), conferida no uso; os consertos na v28.1 |
| 16, lotes 4 e 5 | curvas, gradiente, rajadas | **entregue** (v28.1). Falta outra mão |
| 16, lotes 6 e 9 | o selo de peso; a folha de quadros e Emitindo na linha do tempo | em obra desde 17h24, o mesmo chat (Opus), com o fecho por conta dele (casa vazia) |
| 16, lote 7 | o caminho no formato e nos runtimes; mais `canvas.ts:214`, dois textos do runtime, e os casos de conformidade que faltam | a abrir; o Diretor refaz a conta do plano antes |
| 16, lote 8 | o caminho no editor | espera o 7 |

### 05/10/2026, 17h47 — partículas: v28.2 (o selo de peso) e v28.3 (Emitindo na linha do tempo, a folha de quadros); o lote 7 abriu

| Versão | Lote | O que ele vai ver | Números |
|:---:|:---:|:---|:---|
| **v28.2** (17h31) | 6 | o selo de peso na frente do título, com **palavra e número** (*leve · 40*, *médio · 100*, *pesado · 400*); a dica traz a conta; o pesado entra na barra de avisos | suíte 5.157 · 104/104 · 14/14 · medir 60/60 e 51/60 |
| **v28.3** (17h46) | 9 | **Emitindo** vira chave: a linha "Emissor … / Emitindo" na linha do tempo; a folha de quadros digitada no campo | suíte 5.161 · 104/104 · 14/14 · medir igual |

**Provado na tela, na v28.3:** desmarcar Emitindo em 0,5 s grava a chave no formato do P-016; em 0,9 s, 15 vivas (32 sem a chave); **0,9 → 0,3 → 0,9: as mesmas 15, a cena idêntica pixel a pixel**. Apagar, copiar, colar e arrastar a chave: por teste, não na tela. Nada no `runtime/`. Erro dele, contado: a primeira comparação deu 1.310 px de diferença, e era o script dele (o emissor escolhido numa foto e não na outra).

**A rodada 16 tem os lotes 1 a 6 e 9 fechados (v27.8 a v28.3).** O chat `EXECUTANDO · rodada 16 — partículas` parou, com a passagem no fim do plano.

**O lote 7 (o caminho no formato e no runtime) abriu às 17h47:** RESERVA 27, Opus, ficha em `rodadas/RODADA 16 lote 7 …`. **A conta do plano, refeita pelo Diretor:** os P-021, P-022 e P-023 fecham, número por número (não refiz o sorteio da §3.2; o executor confere). **Buraco achado pelo Diretor (regra 28):** os três casos são **retas**; um leitor que medisse o comprimento exato passaria nos três, e a regra é a poligonal de 10 segmentos. A ficha manda mais dois: o **P-024** (uma curva de verdade, com a conta à mão) e o **P-025** (caminho fechado). O lote leva junto: `runtime/src/render/canvas.ts:214` (o desenhador guarda a curva de emissão pelo nome), dois textos "Esqueleto aninhado", e o pacote do Construct remontado. **O Python fica para outro chat, só pela spec.** Escolha de modelo: Opus, e não Fable, com o plano e a conta prontos e os dois runtimes escritos em separado.

**Rodada 31, em obra:** o conferente (Sonnet) confere no uso a v28.3 — os seis consertos, curvas, gradiente, rajadas, o peso, Emitindo, a folha de quadros. Sai o `19 AS PARTICULAS CONFERIDAS - segunda parte`.

### 05/10/2026, 18h29 — partículas: a segunda conferência, o caminho nos dois runtimes (110 casos), o lote 8 no disco; o fecho da v28.4 começou

**Rodada 31 — a v28.3 conferida por outra mão** (Sonnet); largou a máquina às 18h03. Documento: `19 AS PARTICULAS CONFERIDAS - segunda parte 2026-10-05.md`; 19 fotos em `backup/fotos-obra/rodada-31/`. **Quadro (9 linhas): 7 vi funcionar · 2 pela metade · 0 não funciona.** Vistos: o nome da forma escrito · curva de tamanho e de sumir · gradiente e cor do emissor · rajadas · o selo, com palavra e número, e não impede · a folha de quadros · Emitindo (a agulha para trás e para a frente: 0 px) · salvar e reabrir · os seis consertos de antes.

| Defeito achado | O que era, e o conserto (no disco às 18h19, **provado na tela** pelo executor, com mouse, nas duas telas) |
|:---|:---|
| A janela das Rajadas translúcida e por baixo da linha do tempo | as cores `--painel-*` não existem no `<body>`. Agora opaca, por cima, inteira na tela |
| A chave de Emitindo não se arrastava | **o arrasto funcionava**; a linha nascia no fim da lista, fora da vista, e o mouse pegava o vazio. Agora a linha do tempo mostra a chave ao nascer |
| A alça não dizia o que puxa | o nome escrito ao lado (Raio · Trecho · Espessura); enquanto arrasta, "Raio: 40" **na cena** (o rodapé é apagado a cada quadro pela pose) |
| Em 1280×720, com animação aberta, a aba Lugar cortava | o medidor ganhou o modo `animação`: antes, Lugar pedia 175 de 163 e Cor 165 de 161; depois, 60 de 60. **O `npm run medir` passa a 90 medições** |
| A folha sem nome nos números · a curva sem dica · "Teto corta" | consertados |

**Rodada 16, lote 7 — o caminho no formato e no TypeScript** (RESERVA 27, Opus): extensão de partículas **1.1** (`shape: "path"`, `curve`), o validador (`REF_PARTICLE_CURVE`), os casos **P-021 a P-025** vistos vermelhos às 17h55 e verdes às 18h01; o `ParticleCache` por identidade (`canvas.ts:214`; visto: 3 vivas em vez de 11); dois textos; o pacote do Construct remontado.

| A conta | |
|:---|:---|
| **P-023: o plano e o Diretor estavam errados.** O dump é no espaço do esqueleto (§14.1): o esperado é o do P-021, em cima da curva; "menos (60, 0)" é o `p0` local. Erro do Diretor, pela forma: *conferi a subtração, e não em que espaço a sonda devolve o número* |
| P-024 (a curva de verdade, pedida pelo Diretor) | 10 segmentos somam 473,761373; o comprimento exato é 475,747299; o leitor exato erra de 0,13 a 2,05 px |
| P-025 (fechado) | total 1024,264069; um `u3` cai na curva que volta |

**Lote 7b — o caminho no Python** (RESERVA 28, Opus), só pela spec e pelos `leiame`: 5 de 5, os outros 104 **idênticos byte a byte**, **confronto dos dois runtimes 109 de 109** (18h21). Cinco mutações, cada uma derrubou o caso certo; a do comprimento exato só derrubou o P-024. **Onde a spec quase não bastou:** a §7.2 contra o passo 7 da §9.4.2 (o ponto levado ao esqueleto duas vezes), e o `spherizeDirection` com o caminho em `world`, **que nenhum caso cobria**. Erro dele, pela forma: *"mudei o espaço de um valor e não varri quem o lia"*.

**O que isso achou:** o lote 7 escreveu o **P-026** (caminho em `world`, emissor girado, `spherizeDirection 1`), com a conta à mão antes. **O Python passou de primeira; o TypeScript ficou vermelho, com dois erros juntos, e foi consertado.** E **a malha em `world` tinha o mesmo defeito no TypeScript**, sem caso que olhasse: mudou de número. Regra única no passo 7 da §9.4.2. Dois runtimes: **110 de 110**, campo a campo (18h26); 110 sobre o pacote do Construct.

**Lote 8 — o caminho no editor**, no disco às 18h24: o botão Caminho, a lista de caminhos de qualquer slot, o destaque na cena, o aviso quando o caminho some. Visto na tela: com velocidade 0, 26 partículas a no máximo 0,006 px da curva da capa.

**"Pode fechar" a v28.4 às 18h29**, ao chat do lote 7 (Opus): o lote 7, o 7b, os sete consertos e o lote 8. Conformidade 110; o Godot fica 104 de 110 até copiar o caminho do Python.

| # | Rodada | Estado |
|:---:|:---|:---:|
| 16, lotes 4, 5, 6, 9 | curvas, gradiente, rajadas, o selo, Emitindo, a folha | **feita** (v28.1 a v28.3), conferida no uso; os consertos na v28.4 |
| 16, lotes 7, 7b, 8 | o caminho: formato, dois runtimes, editor | no disco; fecho em obra |
| Falta no Godot | copiar o caminho do Python (5 casos + o P-026) | pequena |

### 05/10/2026, 18h47 — v28.4 fechada: partículas ao longo de um caminho; os nove lotes da rodada 16 estão escritos

**v28.4 — fechada às 18h38 pelo chat do lote 7 (Opus); largou a máquina.** `programa/` montado como v28.4.

| | |
|:---|:---|
| Leva | o lote 7 (o caminho no formato e no TypeScript; a regra do passo 7 da §9.4.2, com **a malha em `world` corrigida**; o `ParticleCache` por identidade; P-021 a P-026) · o lote 7b (o Python) · os sete consertos da segunda conferência · o lote 8 (o caminho no editor) |
| Suíte (18h30) | **5.248** em 91 arquivos: 5.218 verdes, 29 pulados, 1 vermelho (o antigo do manual). Nenhum arquivo caiu |
| **Conformidade** | **110 de 110** no TypeScript e no Python; confronto 110, campo a campo; **110 sobre o pacote do Construct** |
| tsc · roteiro | limpo · 14/14 |
| medir | **90 de 90** de lado, **81 de 90** de altura (eram 60 e 51: entraram as 30 medidas do emissor com a animação aberta) |
| Nenhum exemplo usa malha em `world` | nenhum desenho de exemplo mudou |
| Vermelho de passagem, pelo nome | `exportar-imagem.test.ts` e `fatiar.test.ts`, "linha de comando": os dois compilam o mesmo `ferramentas/dist/exportar` ao mesmo tempo quando o runtime muda. Sozinhos e na segunda passada: verdes. **Corrida de compilação**; dono: `ferramentas/exportar`. (É o intermitente que a rodada 15 já tinha visto) |
| Fotos | 3, em 1920×1080, `backup/fotos-obra/rodada-16/lote-7-e-8/` |
| De fora | o Godot fica 104 de 110 · no CHANGELOG, os sete consertos e o lote 8 estão só pelo nome · a janela das Rajadas ficou aberta em duas fotos (o executor do fecho não achou o × dela) |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 16 | partículas: o sistema (9 lotes, v27.8 a v28.4) | **entregue inteira.** Os lotes 1 a 6 e 9 conferidos no uso; o caminho e os sete consertos em conferência (rodada 32, Sonnet, até as 19h05): sai o `20 A V28.4 CONFERIDA` |
| 7 e 9 | pedir a pasta ao começar; o slot vira base, com "Trocar todas as iguais" | em obra desde 18h47: RESERVA 29 (Opus), ficha em `rodadas/RODADA 07 e 09 …`. Fecho por conta dele, depois das 19h05 |
| G9 | o caminho no Godot (104 → 110) | em obra: o chat da G5, reaberto (Opus) |

**Falta, depois destas:** a 10 (o visualizador de montagem) · a 17 (a fila de 29/09: primeiro um chat confere a fila contra o programa de hoje) · os consertos pequenos (o nome do meio sob a alça; a Escala X que muda o X; a corrida de compilação dos dois testes) · os casos de conformidade que faltam (a máscara de quem recebe sobre a peça em bloco; os três cantos do `around`; a física do filho; o caminho com pesos) · a 20 (a mão do Humberto).

### 05/10/2026, 18h59 — a rodada 16 está FEITA; G9 entregue (o Godot volta a 110 de 110) e acha um defeito no Python

**Rodada 32 — a v28.4 conferida por outra mão** (Sonnet, 1920×1080); largou a máquina às 18h58. Documento: `20 A V28.4 CONFERIDA 2026-10-05.md`; 21 fotos em `backup/fotos-obra/rodada-32/`. **Quadro (7 linhas): 5 vi funcionar · 2 pela metade · 0 não funciona.** Vistos: a chave de Emitindo à vista e arrastada com o mouse (0,33 → 0,50 s) · **partículas ao longo de um caminho** (a capa do herói; no walk, a curva e as partículas acompanham) · boneco sem caminho: botão cinza com o motivo; sem caminho escolhido: "sem caminho", nenhuma partícula, 1 aviso · salvar e reabrir.

| Sobrou, tudo pequeno | Vai para |
|:---|:---|
| O botão da janela das Rajadas diz "Fechar (Esc)" e **o Esc não fecha** | o lote de consertos pequenos |
| Ao arrastar o Raio, o marcador do centro do emissor cobre o meio do rótulo ("Rai ✳ 5") | idem |
| O último nome da folha de quadros fica cortado na borda · o aviso do teto em vermelho de 10 px | idem |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 16 | partículas: o sistema (9 lotes, v27.8 a v28.4) | **feita.** Conferida no uso em três rodadas (30, 31, 32). Sobras pequenas na fila |

**G9 entregue às 18h57 (o caminho no Godot), sem versão:** **110 de 110** pelo adaptador; 179 testes do Godot. Seis estragos, cada um derruba o caso dele. As faíscas no caminho da capa batem com o desenhador do Construct em 5 quadros.

| Achado da G9 | O que é | Vai para |
|:---|:---|:---|
| **1. A malha em `world` no PYTHON está errada** | o `particles.py` de hoje só traz o ponto da malha de volta em `local`; em `world` leva o ponto ao esqueleto **duas vezes**. O chat do lote 7 tinha dito "o Python já fazia certo": **não fazia**, e nenhum caso da suíte tem malha em `world`. O Godot seguiu a spec, e não o Python | **um caso P novo (malha em `world`, emissor girado)**, e o conserto do Python |
| **2. O `reset` da física: Godot × Construct** | o Construct (K5) solta o `reset` no primeiro passo (1/60 s); o Godot solta no `tocar` (t = 0), como o dump da suíte. O cabelo difere até 0,07 px | a spec decide, com um caso; o que perder, conserta |
| Erro dele, pela forma | *rodou o gerador de referências sem `&&` depois de uma troca que falhou*: regravou as 8 referências; devolveu pela cópia |

**Uma lição que se repete, três vezes hoje:** *"X já fazia certo"* dito sem caso que olhe. O TypeScript (a malha em `world`), o Python (a mesma), o Construct (as regras "noop" nos testes). **Onde não há caso, ninguém sabe.**

**A rodada de casos que falta (a abrir quando o editor não estiver fechando versão):** escritos pela spec, com a conta à mão, por quem não escreve runtime; depois rodados nos quatro leitores, e cada dono conserta o seu. A lista: a malha em `world` · o instante do `reset` da física · a máscara de quem recebe sobre a peça em bloco · os três cantos do `around` (o slot marcado que é o `end` da máscara; o meio que mostra um filho com `around`; emissor de forma desconhecida na `drawList`) · a física do filho na troca de placeholder · o `reset` dentro de uma peça · o caminho com pesos · o ramo do `minVersion` maior que o leitor.

### 05/10/2026, 19h29 — v28.5: o programa pede a pasta ao começar (rodada 7); a rodada 9 conferiu o chão

**v28.5 — fechada às 19h16** pelo chat `EXECUTANDO · rodadas 7 e 9 — a pasta e o slot` (RESERVA 29, Opus).

| | |
|:---|:---|
| O que ele vai ver | **Arquivo → Novo projeto…** pede a pasta antes; as imagens vão para a aba Imagens; o projeto ganha o nome da pasta; `Ctrl+S` grava `<pasta>.bone` ali · pasta que já tem projeto: Abrir · Começar um novo (ao lado, sem tocar no outro) · Cancelar · com o programa vazio, o primeiro `Ctrl+S` ou a primeira imagem solta pede a pasta; cancelar não muda nada e o rodapé diz |
| Números (19h09 a 19h13) | suíte **5.256** (5.226 passam, 29 pulados, 1 vermelho: o antigo do manual) · tsc limpo · 110/110 · roteiro 14/14 · medir 90/90 e 81/90 |
| **Só a mão do Humberto** | o seletor de pasta do Windows não abre sem janela: as fotos usam uma pasta de mentira na memória. A janela de verdade e a permissão de gravar não foram vistas |
| Limite | no Firefox (sem pasta com escrita) o Novo projeto fica como antes, e o rodapé diz que o projeto está sem pasta |
| Sobrou | o rodapé "Arquivo salvo." com o programa vazio intocado (texto antigo de "sem mudança") |
| Fotos | `backup/fotos-obra/rodada-07/` (22) |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 7 | pedir a pasta ao começar | **entregue** (v28.5). Falta outra mão, e a do Humberto para o seletor |

**Rodada 9, lote 0 — conferido no uso, antes de construir:** Marcar como slot **não faz** (não há o item) · a base no lugar da imagem: pela metade (o encaixe existe; falta criar a base a partir da imagem) · achar pelo nome dado: pela metade · clicar na base da lista e animá-la: pela metade ("Promover a base" recusa no herói de exemplo, que abre sem pasta) · **duas peças com a mesma entidade trocam separadas: já faz** (visto: a espada solta duas vezes, a segunda trocada, só ela mudou) · "Trocar todas as iguais": não faz · a entidade arrastada com a base aberta pelo menu **não repetiu** o defeito (entrou na base). **Plano dele, sem campo novo:** a base-slot vira um `.bone` do projeto, e no lugar da imagem fica um anexo `skeleton` (7.11); o nome e a imagem de antes em `RECORTE_editor_state`. Em obra.

### 05/10/2026, 20h29 — v28.6: marcar a imagem como slot (rodada 9, lote 1); a terceira parada da conta; duas palavras do Humberto

**A conta bateu no limite pela terceira vez, das 19h29 às 20h11** (40 min; no dia, 6 h). Só um chat de rodada estava trabalhando.

**O Humberto, pelo celular, à noite:**

| Palavra dele | O que fica |
|:---|:---|
| *"Os chats que não estão sendo usados podem ser arquivados se você quiser"* · *"se quiser criar novos chats é só pedir"* | o Diretor arquivou os chats das rodadas 11, 13 e do Godot (G1 a G4); o dos painéis o aplicativo recusou (fixado ou aberto). Ficam o do slot e o conferente |
| *"Foi discutido sobre a imagem ter keyframe; tem que lembrar que a imagem, além do tamanho, também muda a opacidade; por isso imagino que ela deveria ter keyframe."* | **decisão:** a opacidade da imagem é chave, como mover, girar e escalar (rodada 8d). O formato já tem a linha do tempo de cor e opacidade por slot, e os dois runtimes a leem. **A conferir no uso:** se o editor tem a porta (o campo de opacidade na ficha da imagem, que numa animação cria a chave sozinho). Sem a porta: conserto, na fila, com a régua da 8d |

**v28.6 — fechada às 20h22** (rodada 9, lote 1). Entidades → **Marcar como slot…** (e o botão direito) pede o nome; a imagem vira a base `<nome>.bone`; o slot passa a se chamar assim na Árvore, na Ordem e na lista ("cabelo · slot"); **nada muda no desenho, conferido pixel a pixel**; Desmarcar devolve a imagem e o nome; `Ctrl+Z` letra por letra; clicar no nome na lista abre a base por dentro, com o herói em volta.

| | |
|:---|:---|
| Números (20h21) | suíte **5.262** (5.232 passam, 29 pulados, 1 vermelho: o antigo do manual) · tsc limpo · 110/110 · roteiro 14/14 · medir 90/90 e 81/90 |
| O que a tela mostrou | o teste dizia "os cantos batem", e a cena **não** batia pixel a pixel: o `hair` tem `darkColor`, e a 7.11 passa ao filho só a cor clara. Consertado: `darkColor` e `blend` vão para o slot de dentro. Erro dele, pela forma: *"provei a conta pela geometria e chamei isso de 'nada muda no desenho'; o desenho também é cor"* |
| Limites | só imagem simples vira slot (malha, ponto, caixa e entidade recusam, e o item diz por quê) · chaves de cor escura do slot ficam no slot do herói · o rodapé genérico da 8b ainda chama o slot de entidade · não salvou numa pasta de verdade com a base nova |
| Fotos | `backup/fotos-obra/rodada-09/lote-1/`, 1920 e 1280 |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 9, lote 1 | marcar a imagem como slot | **entregue** (v28.6). Falta outra mão |
| 9, lote 2 | "Trocar todas as iguais (N)", desligada por padrão | em obra |

### 05/10/2026, 20h55 — v28.7 (trocar todas as iguais); as rodadas 7 e 9 FEITAS; os dez casos que faltavam acharam três defeitos; o fecho da v28.8 começou

**v28.7 — fechada às 20h31** (rodada 9, lote 2): na grade, com peças iguais no boneco, **"Trocar todas as iguais (N)"**, desligada ao abrir; ligada, as N trocam cada uma no lugar dela, um `Ctrl+Z` desfaz todas; o padrão (separadas) não mudou. Suíte 5.264 (1 vermelho, o antigo) · 110/110 · 14/14 · medir 90/90 e 81/90. Só as peças da mesma skin da clicada; o `encaixar_todas` dos leitores já existe (K5, G5).

**Rodada 33 — a pasta e o slot conferidos por outra mão** (Sonnet, 1920×1080, v28.7); largou a máquina às 20h47. Documento: `21 A PASTA E O SLOT CONFERIDOS 2026-10-05.md`; 25 fotos em `backup/fotos-obra/rodada-33/`. **Quadro (10 linhas): 8 vi funcionar · 2 pela metade · 0 não funciona.**

| Visto | |
|:---|:---|
| Novo projeto pede a pasta; cancelar avisa; Salvar grava na pasta; "A pasta já tem um projeto" | pasta em memória: a janela do Windows é a mão do Humberto |
| marcar como slot: o nome em três lugares; cena 0 px; desmarcar e `Ctrl+Z` devolvem | |
| peças iguais separadas · "Trocar todas as iguais (3)" | |
| **a opacidade da imagem (a palavra do Humberto de hoje): o campo Alfa existe; numa animação nasce a chave; na base grava na base** | **já faz** |
| salvar e reabrir a base-slot | |

| # | Sobrou | Vai para |
|:---:|:---|:---|
| 1 | Depois de `Ctrl+Z` no "Marcar como slot", **o nome fica preso**: marcar de novo com o mesmo nome diz "já existe" | lote de consertos pequenos |
| 2 | Clicar no nome do slot na lista de Bases abre só a peça, **sem o herói**; o caminho com o herói está abaixo da dobra | idem |
| 3 | Caixa e ponto não viram slot, e o motivo só está na dica; a malha não foi provada | idem |

| # | Rodada | Estado |
|:---:|:---|:---:|
| 7 | pedir a pasta ao começar | **feita** (v28.5); o seletor do Windows é a mão do Humberto |
| 9 | o slot vira base; trocar todas as iguais | **feita** (v28.6, v28.7); três sobras na fila |

**Rodada 34 — os casos de conformidade que faltavam** (RESERVA 30, Opus; ficha em `rodadas/`): dez casos escritos pela spec, com a conta à mão, **antes** de rodar qualquer leitor; rodados nos quatro às 20h46. **Cada vermelho deu exatamente o número do "leitor errado" previsto no `leiame`.**

| Caso | TS | Python | Construct | Godot |
|:---|:---:|:---:|:---:|:---:|
| C-324 o meio que mostra um filho com `around` | **vermelho** | verde | **vermelho** | verde |
| C-326 o `reset` da física dentro da peça | **vermelho** | **vermelho** | **vermelho** | **vermelho** |
| P-027 a malha em `world` | verde | **vermelho** | verde | verde |
| P-029 emissor de forma desconhecida na `drawList` | **vermelho** (desenhava) | verde | **vermelho** | verde |
| C-264, C-322, C-323, C-325, P-028, X-308 | verde | verde | verde | verde |

**Onde a spec não bastou, dito pelo chat dos casos:** a ordem do `physicsReset` e do `physicsApply` no mesmo quadro (§9.8) · a §7.11 "Clipping" contra o pseudocódigo (C-323) · o filho com `around` no próprio slot `m` (C-324) · a sonda não tem canal de avisos (P-029 e X-308 não veem o aviso; o X-308 passa até num leitor que nunca lê `minVersion`) · o C-264 **não** reproduz os 0,07 px entre Godot e Construct (a diferença está no "tocar" da engine, que o adaptador não exercita).

**Rodada 35 (TypeScript e spec; o chat do lote 7, Opus) e 35b (Python; o chat do lote 7b, Opus)**, cada um só pela spec: C-324 (a cebola por composição: só o meio de B some), C-326 (o `reset` do filho dispara, no relógio do filho, antes da física do quadro), P-029 (não entra na `drawList`), P-027 no Python (a malha volta uma vez). As três frases na spec (§9.8, §7.7, §7.11/7.13); o `leiame` do C-262 corrigido (o texto dizia a ordem contrária). **Dois runtimes: 110 + 11, confronto igual nos 121** (20h53). Erro do chat do Python, pela forma: *"pus a exceção em quem eu estava consertando, quando o defeito era da regra"*. Achado dele, para a §6.5: com `physicsDt` `1/60` exato um passo se perde na fronteira (0,082562 contra 0,162830).

**"Pode fechar" a v28.8 às 20h55:** a promoção dos 11 casos (121), os consertos, a spec. O Godot fica 120 de 121 (o C-326) até copiar o Python.

### 05/10/2026, 20h59 — palavra do Humberto: a aba das entidades, com o projeto como entidade

> *"Sobre 'Este boneco', estou imaginando que seria melhor uma aba que o usuário pudesse organizar as entidades, e nessa aba o projeto apareceria como uma entidade (lá teria as entidades, ex.: poder rosa, o boneco, a motosserra, e o usuário conectaria as entidades)."*

| O que fica | |
|:---|:---|
| A aba **Entidades** vira o lugar de **ver e ligar**: cada entidade um cartão com os slots dela; **o projeto (o herói) aparece como mais um cartão** | é a rodada 10 (o visualizador de montagem), com esta imagem |
| Ligar = arrastar um cartão para o slot de outro: a motosserra na mão do herói; **o herói no slot do meio do poder rosa** | "Este boneco" deixa de ser só um item do botão direito: vira o gesto natural, no mesmo lugar, nos dois sentidos |
| A decisão anterior continua (`02`, "os dois lugares"): ligação na linha do tempo faz parte do projeto; ligação no visualizador é teste, descartável, com "Aparecer na linha do tempo" | a aba mostra os dois tipos, marcados de jeito diferente |

| Perguntas levadas a ele, com a sugestão do Diretor | Sugestão |
|:---|:---|
| A aba é o visualizador da rodada 10, com o projeto como entidade? | sim; uma aba só |
| Ligar ali, por padrão, é teste ou entra no projeto? | teste, como decidido; um botão passa a ligação para o projeto |

A ficha da rodada 10 se escreve com isto.

**O Humberto, em seguida:** *"Dessa forma eu poderia ter outros encaixes acima deles, ex.: nave / mecha / boneco (que é a animação atual) / motosserra. Dessa forma também poderia testar coisas como uma arma para o mecha."*

| O que fica | |
|:---|:---|
| A cadeia vale para cima e para baixo: o boneco aberto entra no mecha, o mecha na nave; a motosserra entra no boneco; uma arma de teste entra no slot do mecha | encaixe sem limite de níveis (`02`, regra 8); o mecha em volta do piloto (`02`, "os dois lugares") |
| Tudo no visualizador é teste: o boneco não leva o mecha nem a arma junto ao salvar; "Aparecer na linha do tempo" mostra tudo montado enquanto ele anima o boneco | decisão de 04/10 mantida |

### 05/10/2026, 21h12 — v28.8 fechada (120 casos); a palavra do Humberto: foco total no programa

**v28.8 — fechada às 21h03** (rodada 35; o chat do lote 7, Opus). **10 casos promovidos** (o P-002 fica): conformidade **120 de 120** no TypeScript e no Python, confronto igual (C 63 · P 28 · X 7); **120 sobre o pacote do Construct**; o Godot em **119 de 120** (o C-326). Suíte **5.294** (5.264 verdes, 29 pulados, 1 vermelho: o antigo do manual) · tsc limpo · roteiro 14/14 · medir 90/90 e 81/90. Regra 25 varrida: `ferramentas/testes/particulas.test.ts` (P-027 e P-028 na lista; o P-029 conta só na pasta, porque a forma dele é recusada pelo schema de propósito), `medida-particulas` verde, os `leiame` com "onde este caso mora" (três fontes; quem caiu em quê), o README e o REGISTRY com a linha de hoje. De fora: a §6.5 (como comparar a fronteira do passo da física).

**Palavra do Humberto, 21h10:** *"Não devíamos estar perdendo tempo com Godot e Construct. O foco tem que ser total e absoluto em fazer o programa."*

| O que fica | |
|:---|:---|
| **Nenhuma rodada nova de leitor** (Godot, Construct) sem a palavra dele | o Godot fica em 119 de 120 (o C-326), anotado. Os dois leitores estão completos e passam nos casos; **nada foi visto numa janela** |
| Todo o esforço no editor | a rodada 10 (a aba das entidades: o plano em obra, RESERVA 16, Opus; depois o sim dele; depois o código) · a rodada 17 (a fila de defeitos: primeiro conferir a fila contra o programa de hoje) · os consertos pequenos |

**Os consertos pequenos na fila (sete):** o Esc não fecha a janela das Rajadas · o marcador do emissor cobre o rótulo do Raio · o último nome da folha cortado · depois de `Ctrl+Z` no "Marcar como slot" o nome fica preso · clicar no nome do slot na lista abre sem o herói · o motivo de caixa e ponto não virarem slot só na dica · o nome do meio sob a alça com a peça girada · a Escala X que muda o X.

### 05/10/2026, 21h13 — o plano da aba das entidades está escrito e lido pelo Diretor; espera o sim do Humberto. E uma régua do cargo, nas palavras dele

**Palavra do Humberto, pouco antes das 21h13 (hora do relógio ao anotar):** *"Anota lá também que ele [o Diretor] tem que controlar os chats e os modelos de cada chat baseado no esforço da tarefa."*

| Régua do cargo, para todo Diretor | |
|:---|:---|
| **O Diretor controla os chats e o modelo de cada chat pelo esforço da tarefa** | conferir = Sonnet · obra, pesquisa e desenho = Opus · só o que mexe no formato e nos dois runtimes, ou empacou = Fable · **por lote, não por rodada** (a rodada 11 ficou em Fable até o fim, e o lote do editor e o fecho eram de Opus: foi o chat que rodava nas duas paradas da conta) · fecho de versão sempre Opus · troca o modelo **antes** de mandar a tarefa · reservas abertas em Fable por padrão: trocar sempre · arquiva o que terminou; reabre o que precisar (as reservas desta janela reabrem sem aprovação) |

**Rodada 10 — o plano: `22 A ABA DAS ENTIDADES - o plano 2026-10-05.md`** (RESERVA 16, Opus; 345 linhas; sem código; o programa não foi aberto). **O Diretor leu inteiro.** Está bom: a pesquisa tem fonte em cada linha (e diz onde não tem: o Spriter não documenta a sub-entidade na tela; a documentação do DragonBones está fora do ar); o que já existe no código está conferido com arquivo e linha; cada gesto tem antes, faz, depois e o rodapé; os casos difíceis têm resposta; nada muda no formato.

| O plano, em cinco linhas | |
|:---|:---|
| A aba Entidades vira uma **árvore de cartões, caixa dentro de caixa**, lida de cima para baixo. Sem fio (fio cruza, vira "espaguete") | |
| **O projeto aberto é um cartão** (moldura dupla, a palavra AQUI). Pode estar no topo, ou dentro do slot do mecha ou da nave | |
| **Ligar = arrastar um cartão para a linha de um slot.** Ligação nova é **teste**: tracejada, a palavra TESTE, cor de aviso (três sinais, nunca só a cor). A do projeto: cheia, PROJETO. **"Pôr no projeto"** grava: é o *Bake Active To Entity* dos Character Maps do Spriter (manual 1.4) | |
| O teste **não vai para o `.bone`**: mora em `manifest.extras.RECORTE_projeto.montagem` (spec 2.9), que o jogo ignora. Nada muda no formato: é o `skeleton` e o `around` da 7.11 | |
| **Sete lotes**, um por versão: 1 só mostra (o projeto como cartão) · 2 o teste para baixo · 3 a montagem na cena · 4 o encaixe para cima · 5 Pôr no projeto · 6 anima, livre, skins, as rodas · 7 os casos difíceis e a medição | |

**O risco maior, escrito no plano:** o comando de teste. A regra 6 pede `Command` com `apply` e `revert`, e o projeto "não tem comando próprio" (`doc/projeto.ts:18`). O executor do lote 2 lê o `contract.ts` inteiro antes de começar, e diz ao Diretor.

| As perguntas para o Humberto (do plano; o Diretor concorda com todas as sugestões) | Sugestão |
|:---|:---|
| 1. A aba como caixa dentro de caixa, sem fio, com o projeto como cartão? | sim |
| 2. A peça de teste na cena: desenhada normal, com uma faixa no canto; ou meio transparente? | normal, com a faixa |
| 3. "Pôr no projeto" para cima (o boneco no mecha): o boneco passa a **levar** o mecha, pelo "Este boneco"? Ou é o mecha que leva o boneco (gravado no arquivo do mecha)? | o boneco leva: só se escreve no arquivo aberto. Para o mecha levar o boneco: abrir o mecha e pôr o boneco nele |
| 4. A montagem de teste volta ao reabrir o projeto? | sim |
| 5. Uma montagem por projeto, ou uma por animação? | por projeto |
| 6. O mecha em volta toca a animação dele no relógio da agulha? | sim; "parado" vem escolhido |
| 7. "Aparecer na linha do tempo" cabe mal em 260 px: escrever "Na cena", com a frase inteira na dica? | sim |

**Nenhum código desta aba antes do sim dele.** O chat do plano fica de pé para executar, em Opus, lote a lote, cada um conferido por outra mão.

### 05/10/2026, 21h59 — a fila de 29/09 conferida contra a v28.8 (rodada 17, parte 1); os consertos abriram

**Rodada 17, parte 1 — a fila de defeitos conferida por outra mão** (o conferente, Sonnet, 1920×1080, v28.8); largou a máquina às 21h35. Documento: `23 A FILA CONFERIDA 2026-10-05.md`; 46 fotos em `backup/fotos-obra/rodada-17/`. As 79 linhas, até o fim.

| Das 79 | |
|:---|:---:|
| **ainda existem** (26 inteiros, 2 em parte: G-Q4, M12a) | **28** |
| já não existem | 36 |
| não dá sem janela (PL-22, C2, E6, E3b, N-11, C3) | 6 |
| não entendi o item (J18, K18, H2+J6+H-Q9: este é pergunta ao Humberto) | 3 |
| não chegou a conferir (N-9, M12b, L7, L8, PL-14, PL-17) | 6 |

| Os cinco piores que ainda existem | |
|:---:|:---|
| 1 | **K13+K1b:** com os Detalhes da linha do tempo abertos, a lista de Animações fica com uma linha (walk e attack somem) e a aba Imagens com uma miniatura |
| 2 | **G-Q6:** a aba Curvas esconde o tocador |
| 3 | **K9+G-Q5:** os sete botões do formato da curva ficam abaixo do gráfico, fora da tela |
| 4 | **L2+L5:** "Pesos automáticos" não muda a cena e o rodapé só repete o nome do botão; o painel de pesos abaixo da dobra |
| 5 | **J2:** Base → "Virar filho de…" só diz "Segure P" e não age |

**Achado novo, fora da fila:** tirar a skin ativa pelo × da pilha **não entra no Desfazer**.

**Rodada 17, parte 2 — os consertos da fila**, em obra desde 21h59 (RESERVA 14, Opus; ficha em `rodadas/`): lote 1 o que some da vista e perde trabalho; lote 2 o que não age; lote 3 os oito pequenos de hoje; depois o resto por parte do programa. Um lote, uma versão; cada versão vai ao conferente.

### 05/10/2026, 22h59 — os consertos da fila: v28.9 a v29.2 (quatro lotes); decisões de desenho do Diretor

Rodada 17, parte 2, pelo chat `EXECUTANDO · rodada 17 — os consertos da fila` (RESERVA 14, Opus). Cada item repetido antes e provado na tela; cada lote com o fecho inteiro.

| Versão | Lote | Ids | O que ele vê |
|:---:|:---:|:---|:---|
| **v28.9** (22h09) | 1 | K13+K1b · G-Q6 · K9+G-Q5 · G-Q7 · a skin pelo × | a lista de Animações tem chão com os Detalhes abertos (1920: 3 linhas, era 1; 1280: 1, era 0) · a aba Curvas tem tocador · os 7 formatos da curva na barra de cima · tirar a skin pelo × entra no Desfazer |
| **v29.0** (22h27) | 2 | L2+L3 · L5 · L1a · L11b · J2 · M13 · M15 · I8 | Pesos automáticos põe a ferramenta Pesos na mão e mostra a pizza · Virar filho de… age sem segurar o P (Esc termina) · Em todas as skins e Trocar todas as iguais dizem o que mudou · os grupos da Exibição dobram |
| **v29.1** (22h45) | 3 | os oito pequenos de hoje | o Esc fecha as Rajadas · o rótulo do Raio fora da estrela · a folha não corta · o nome depois do `Ctrl+Z` do slot · a base-slot abre com o herói · **todo item cinza com motivo, clicado, diz o motivo no rodapé** (mudança na casca, em todo menu) · o nome do meio inteiro |
| **v29.2** (22h54) | 4 | N-16b · N-10 · N-5 · N-8 | a janela Exportar imagem abre no começo, lembra a escolha, diz o que vai sair e onde foi parar |

| Números da v29.2 | suíte **5.326** (1 vermelho, o antigo do manual) · tsc limpo · 120/120 · 14/14 · medir 90/90 e 81/90, igual desde a v28.8 |
|:---|:---|

| Decisão do Diretor (as regras da casa, o Spriter e o Photoshop respondem) | |
|:---|:---|
| O X e o Y da ficha de uma imagem são o **pivô** dela, como no Spriter (hoje é o centro, que anda ao escalar: 19 + 21×1,5 = 50,5) | lote seguinte |
| L12+PL-30: Malha e pesos junto de Imagens e Pivôs, **só no arranjo de fábrica** | idem; a medição decide |
| PL-31: um ícone de Prévia na barra de ações | idem |
| M10: as ações da aba Skins ficam ícones, com o nome na dica | não muda |
| Com os Detalhes abertos, quem cede é a aba Imagens; dar mais às duas tiraria altura da linha do tempo | **não**: o usuário arruma e guarda (Photoshop) |

**Erros contados pelo executor, pela forma:** *o primeiro conserto pôs o chão valendo sempre, e não só no caso do defeito* (a medição caiu de 81 para 78; pego antes do fecho) · *usou `sed` num `.ts` e no `ESTADO.md`* (tirou os CR; devolvido pelos bytes) · *apagou duas fotos novas por terem o nome das velhas* (limpar por nome sem olhar a data) · não fez a cópia de `editor/` antes dos lotes 2 e 4 (a base é o zip da versão anterior).

### 05/10/2026, 23h58 — a fila de 29/09 está consertada: v29.3 a v29.8; a conferência dos consertos começou

Rodada 17, parte 2, pelo mesmo chat (RESERVA 14, Opus), dez versões no dia, da v28.9 à v29.8. **Largou a máquina às 23h57 de 05/10.**

| Versão | Lote | O que ele vê |
|:---:|:---:|:---|
| **v29.3** | 5 | G-Q4: a Prévia segue a animação aberta (a camada 0 sem escolha da mão) · D2: o evento na Árvore abre a ficha dele |
| **v29.4** | 6 | J11: as boas-vindas dizem "Arquivo → Abrir pasta do projeto…", e mais 19 textos; um teste varre e não deixa voltar · PL-21: Ajuda → Atalhos com as teclas dos painéis (35) · PL-10: a aba Regras de 13 botões para 7 (Novo ▾, Apagar) · a lista do Novo ▾ não quebra mais a palavra |
| **v29.5** | 7 | M12a: apagar uma skin que outra inclui pergunta, citando quem depende, e avisa até ela voltar; renomear troca o nome em quem inclui |
| **v29.6** | 8 | **o X e o Y da ficha de uma imagem com osso próprio são o pivô**, como no Spriter (antes 50,5 ao escalar; agora 40 fica 40) |
| **v29.7** | 9 | L12+PL-30: Malha e pesos no grupo de cima, depois de Pivôs, **só no arranjo de fábrica** (o guardado não muda, teste) · PL-31: o ícone Prévia na barra, e Animação → Abrir a Prévia · M10: sem mudança |
| **v29.8** | 10 | PL-25: Editar → Pose ▸ **Meio-termo · Meio-termo → anterior · Meio-termo → seguinte** (a chave no meio, a 1/3 ou a 2/3; visto: 90 e 93 → 91,5) |

| Números da v29.8 (23h53 a 23h56) | suíte **5.345** (5.315 passam, 29 pulados, 1 vermelho: o antigo do manual) · tsc limpo · 120/120 · 14/14 · medir 90/90 e 81/90 (o mesmo conjunto de 9 desde a v28.8) |
|:---|:---|

**Da fila do `23` sobra só o N-4b** (o retângulo de recorte arrastável na cena): função nova, **depois da rodada 10**, por decisão do Diretor.

**Erros contados pelo executor, pela forma:** *consertou além do relatado* (tirou a inclusão da capa ao apagar a skin; o teste do M17, de setembro, pegou; desfez) · *esqueceu a régua 8* (ação nova sem nome de tarefa: o `tarefas.test.ts` pegou na primeira suíte) · *trocou o arranjo de fábrica sabendo que três testes o escreviam letra por letra, sem procurar "onde mais" antes* (regra 25) · *a foto de 1280 gravou por cima da de 1920 porque o nome era o mesmo*, duas vezes: o tamanho da tela vai no nome desde o primeiro disparo · nomes de menu com mais de 28 letras (a auditoria pegou) · *refez o estado e não o desenho* (o título da camada da Prévia ficaria velho: pego pela foto).

**O que ficou de fora, dito por ele:** uma imagem **sem** osso próprio ainda mostra o número do anexo na ficha; o primeiro X digitado numa animação faz nascer o osso no pivô, e dali em diante a ficha mostra o pivô · com a Malha no grupo de cima ela rola um pouco mais em 1440×900 (já rolava).

| # | Rodada | Estado |
|:---:|:---|:---:|
| 17 | a fila de 29/09 | **entregue** (v28.9 a v29.8): 26 itens da fila, os oito pequenos do dia, o achado do ×, e as quatro decisões. Conferência em obra (rodada 36, Sonnet, v29.8): sai o `24 OS CONSERTOS DA FILA CONFERIDOS` |

**Espera o Humberto:** o plano da aba das entidades (`22`), com as sete perguntas. Nenhum código dela antes do sim.

### 06/10/2026, 00h27 — a rodada 17 está FEITA (v28.9 a v29.9); a conferência dos consertos; o fim do primeiro dia do Diretor 000da3

**Rodada 36 — os consertos da fila conferidos por outra mão** (Sonnet, 1920×1080, v29.8); largou a máquina às 00h13. Documento: `24 OS CONSERTOS DA FILA CONFERIDOS 2026-10-06.md`; 29 fotos em `backup/fotos-obra/rodada-36/`.

| Dos 28 que ainda existiam (o N-4b de fora, de propósito) | |
|:---|:---:|
| **deixaram de existir** | **22** |
| mudaram de cara (K1b, L5, N-16b) | 3 |
| segue de propósito (M10, os ícones da aba Skins) | 1 |
| não chegou a conferir (M12a, L1a) | 2 |

Fora dos 28: o × da skin entra no Desfazer (visto) · os pequenos do dia: 6 de 7 vistos · as quatro decisões: vistas (o X não mexe ao escalar; Malha e pesos no grupo de cima; o ícone de Prévia; o Meio-termo dá 91,5 entre 90 e 93) · nada quebrou ao lado (painéis, partículas, conexão, por amostra). **A olhar, não confirmado:** marcar o slot, `Ctrl+Z`, marcar de novo, entrar e sair da base: a Árvore mostrou `peito` e `peito_2` uma vez.

**v29.9 — o último lote da rodada 17 (00h26):** o diálogo Exportar imagem com título em cima, só o meio rolando e o rodapé fixo (botões/fim da caixa: 878/900 · 788/810 · 626/648) · com os Detalhes abertos a Imagens tem chão (uma fileira inteira), e quem cede são os Detalhes, só abertos (1920: 380 → 337; em 1440 e 1280 os Detalhes já estão no chão deles e nada muda) · abrir o Pincel o traz ao alto · **o `peito_2` não repetiu** (o executor fez o caminho duas vezes; o `_2` só nasce no Duplicar e ao arrastar a mesma imagem para a cena). Suíte **5.351** (1 vermelho, o antigo) · tsc limpo · 120/120 · 14/14 · medir 90/90 e 81/90. Erro dele, pela forma: *dois testes antigos liam a linha exata que ele mudou; caíram na suíte, e não antes* (regra 25: "onde mais?").

| # | Rodada | Estado |
|:---:|:---|:---:|
| 17 | a fila de 29/09 | **feita** (v28.9 a v29.9). Conferida no uso: 22 de 28 deixaram de existir; o resto consertado na v29.9 e em conferência (rodada 37, a última da noite). Sobra o N-4b, para depois da rodada 10 |

---

## O primeiro dia do Diretor 000da3, em números (05/10, 06h41 → 06/10, 00h30)

| | |
|:---|:---:|
| versões fechadas | **35** (v26.6 → v29.9) |
| testes | 4.984 → **5.351** (1 vermelho, o antigo do manual, em todas) |
| conformidade | 90 → **120** casos, iguais nos dois runtimes; 120 sobre o pacote do Construct; o Godot em 119 |
| rodadas conferidas por outra mão | **14 conferências**, perto de 160 gestos vistos com mouse |
| rodadas feitas hoje | 4, 7, 9, 11, 13, 16, 17, 23, 24 a 37; K5; G1 a G9 |
| chats abertos pelo Humberto | 19 reservas; 10 arquivadas e reabertas por mim quando precisei |
| a conta parou | 3 vezes, 6 horas |

**Espera o Humberto:** o plano da aba das entidades (`22`), com as sete perguntas e as sugestões. **Nenhum código dela antes do sim.** Depois dela: o N-4b, e a rodada 20 (a mão dele: o roteiro dos 30 minutos; os leitores dentro do Construct e do Godot; o seletor de pasta do Windows; os painéis com a mão).

### 06/10/2026, 00h33 — a v29.9 conferida: a obra para e espera o Humberto

**Rodada 37 — a v29.9 conferida por outra mão** (Sonnet); largou a máquina às 00h32. Documento: `25 A V29.9 CONFERIDA 2026-10-06.md`; 9 fotos em `backup/fotos-obra/rodada-37/`. **4 vi funcionar · 1 não repete · 0 pela metade:** o diálogo Exportar inteiro na tela nas duas telas · a Imagens com a fileira inteira e as três animações com os Detalhes abertos · o Pincel no alto · o nome do meio inteiro com a peça inclinada. **O `peito_2` não repetiu** pelo caminho de ontem; se voltar, a pista: `peito` e `peito_2` ambos com `body`, e a ficha dizendo "Slot: peito_2 · entidade peito".

**Nada mais roda.** O vigia foi apagado às 00h33. O Diretor acorda quando o Humberto escrever ou um chat mandar mensagem.

| Espera o Humberto | |
|:---|:---|
| **O plano da aba das entidades** (`22 A ABA DAS ENTIDADES - o plano 2026-10-05.md`), com as sete perguntas e as sugestões | rodada 10; o chat do plano está arquivado e reabre para executar, em Opus, lote a lote |
| As perguntas abertas de ontem | a cebola (feita) · o nome `around` · "Trocar todas as iguais" (feito, conferido) · a aba das partículas em abas (feito, conferido) · o caminho de qualquer slot (feito) · o selo de peso (feito) · chave em velocidade etc. em outra rodada |
| A mão dele | o roteiro dos 30 minutos (rodada 20) · os painéis com a mão · o seletor de pasta do Windows · exportar e importar skin · o Construct e o Godot com janela (`leitor-construct/LEIA-ME.md`, 18 perguntas; `leitor-godot/LEIA-ME.md`, 15 passos) |
| O `CLAUDE.md` | números velhos ("46 casos", "90 casos", a regra 9) e o comando de montar sem número. Só com a palavra dele |
| O N-4b | o retângulo de recorte na cena, depois da rodada 10 |

### 06/10/2026, 07h09 — o cargo passa ao DIRETOR · 410edc

Ordem do Humberto, 07h08: *"passe o cargo para o novo diretor, ele já foi criado."* A ficha: `11 PASSAGEM DE CARGO do Diretor 2026-10-06.md`. O `DIRETOR · 000da3` fecha aqui: um dia, 35 versões (v26.6 → v29.9), 37 rodadas. A obra espera o sim do Humberto ao plano da aba das entidades (`22`).

## 06/10/2026, 07h40 — o polimento, parte por parte (Diretor 410edc)

O cargo passou ao `DIRETOR · Diretor com monitoramento de chats [410edc]`. Ordem do Humberto de manhã: **terminar o programa**, parte por parte, cada parte com pesquisa nos programas parecidos, conferência no uso, e um caminho de usuário de ponta a ponta; um padrão de texto, unidade e faixa em todo painel. Documento: `26 O POLIMENTO - parte por parte 2026-10-06.md`. Primeira rodada: **38, partículas** (`rodadas/RODADA 38 - polimento das particulas 2026-10-06.md`), parte 1 sem código. A aba das entidades (`22`) vira a rodada 39, com as sugestões como decisão: *"todas as suas perguntas provavelmente já têm respostas em outros programas."* Godot e Construct continuam parados.

## 07/10/2026, 09h12 — o polimento fechou as nove partes (Diretor 410edc)

Da v29.9 (06/10, 00h) à v35.7 (07/10, 09h): 58 versões, 10 rodadas (38 a 47), cada parte com pesquisa nos programas parecidos, conferência no uso por outra mão e uma prova de usuário feita de ponta a ponta. As provas finais, em gestos: fumaça/fogo/faísca do zero (9–10); o mecha com o boneco dentro (8); o andar com curva e espelho (22); a capa com pesos (26); achar/renomear/ordenar 54 peças (11, sem tropeço); trocar a arma e vestir a roupa (9, sem tropeço); salvar/reabrir/exportar/pacote (21, sem tropeço); posar o herói (16, sem tropeço). A régua dos painéis (doc `68`) vale para todo painel: unidade depois da caixa, faixa na dica, número que arrasta, só rola o que é lista; altura 82/90. Suíte 5.7xx; conformidade 120/120. O que fica: a **rodada 48** (os 4 achados da mão do Humberto, doc `89`, mais 2 ressalvas da 47); o que só a mão dele confirma (doc `89`); e os leitores (Construct, Godot) parados por ordem dele. Diário inteiro no doc `26`; a ficha do cargo no doc `11` (19 seções, uma por tropeço).

## 07/10/2026, 14h32 — a janela de verdade (rodadas 48 a 50)

O Humberto fez os itens do doc `89` com a mao e achou 4 coisas (a cor que nao mudava a barra; soltar a pasta que abria o seletor; 176 avisos; um nome de menu errado no documento). Depois disse: *"isso tudo e uma coisa que voce poderia resolver"*. Tinha razao: o navegador do aplicativo (`mcp__Claude_Browser__*`) tem mouse e janela de verdade. A rodada 49 refez o doc `89` com esse navegador e achou em uma hora 6 defeitos que dez conferencias por protocolo nao viram (a aba solta vazia; a barra que voltava ao grupo; "So este quadro" em GIF; abrir o heroi sem perguntar; Ctrl+V que esticava a animacao; o x da aba onde o olho procura o recolher). As rodadas 48 (v35.9-36.1) e 50 (v36.2-36.5) consertaram tudo; conferidas (docs `95`-`102`). Regua nova no `11` (secao 21): nenhuma rodada e "feita" sem uma passada com o mouse de verdade. Versao de agora: **v36.5**, suite 5.806, altura 83/90. Fica para a mao dele: o Windows (soltar pasta do Explorer, seletor de pasta e de cor) e o `pularmachini`.
