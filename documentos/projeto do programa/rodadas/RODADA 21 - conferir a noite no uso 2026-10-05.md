# Rodada 21 — conferir a noite, no uso

Ficha escrita pelo `DIRETOR · ed2cab` em 05/10/2026.
**Esta rodada não escreve código.** Só usa o programa, fotografa e diz o que viu.
Ela é a única que usa a máquina enquanto roda.

---

## Para quê

Na noite de 04 para 05/10, sete rodadas de obra fecharam **24 versões** (v23.4 a v25.7) com o Humberto dormindo. O Diretor só conferiu **uma** com a mão (a 8a). As outras foram conferidas por foto e pelo relato **de quem as fez**.

> Dizer "feito" não é estar feito.

Você **não escreveu nada disto**. É por isso que é você quem confere: quem escreveu só testa o que lhe ocorreu olhar (regra 26 da casa).

O que cada rodada diz ter feito está no fim de `documentos/projeto do programa/03 A ORDEM DA OBRA 2026-10-04.md` (as seções de 04/10, 21h30 em diante, até "o fecho da noite"). **Leia essas seções inteiras antes de abrir o programa.**

---

## Como

| # | |
|:---:|:---|
| 1 | Use o programa **montado**, em `programa/` (`servidor.mjs`), numa porta só sua (sugestão: 5321). **Um servidor, um Chrome sem janela, um processo de cada vez.** A máquina tem 7,7 GB e está apertada: meça a memória livre antes de abrir |
| 2 | **Faça o gesto de verdade**, com mouse e teclado por protocolo, como um usuário faria. Ler o código e concluir "existe" **não vale** |
| 3 | Procure como o **usuário** procura: os doze menus, a busca de comandos, o botão direito. **Não use os roteiros dos executores para dirigir**: eles sabem os atalhos de quem escreveu. Pode lê-los só para aprender a dirigir o Chrome (`backup/fotos-obra/rodada-08d/roteiros/`, `rodada-15/`) |
| 4 | Uma foto por linha, em `backup/fotos-obra/rodada-21/`, com linha no `backup/INDICE.md` |
| 5 | Material: o herói de exemplo (Arquivo → Abrir o herói), e `formato/exemplos/` |
| 6 | Se um gesto não dá para fazer sem janela (o seletor de arquivo do Windows), **diga isso** na linha |
| 7 | **Achou defeito? Não conserte. Anote**, com a foto e o passo a passo para repetir |

---

## O que conferir

Cada linha: **vi funcionar · pela metade · não funciona · não achei a porta**.

### Rodada 8d — o clique na imagem, como no Spriter (v23.5 a v23.8)

| # | O gesto | O que tem de acontecer |
|:---:|:---|:---|
| D1 | Abrir uma animação. Clicar na **mão**, na cena | escolhe só a mão. Propriedades não diz o osso |
| D2 | Arrastar a mão | a mão sai do lugar; **o antebraço não se mexe**; nasce uma chave; na linha do tempo há uma linha **"Imagem hand"** |
| D3 | `Ctrl+Z` | a mão volta, a chave some |
| D4 | Clicar no **meio do antebraço** (no corpo do osso) e arrastar | o osso gira, e a mão vai junto |
| D5 | Clicar na **espada** e arrastar | só a espada se move |
| D6 | Tecla `0` (Travar desenhos) e clicar na mão | o clique passa por ela |
| D7 | Clicar na **cabeça** (ela é malha) | escolhe o osso junto, e o rodapé diz por quê |
| D8 | Na **base** (sem animação aberta), mover a mão | grava na base; vale em todas as animações |
| D9 | Apagar a chave da linha "Imagem hand"; copiar e colar essa chave; arrastá-la no tempo | funcionam como as outras chaves. **O executor não testou estes três** |

### Rodada 12 — a skin (v23.9)

| # | O gesto | O que tem de acontecer |
|:---:|:---|:---|
| S1 | Aba Skins → Nova skin. Botão direito numa imagem → **Esconder nesta skin** | a imagem some com a skin vestida; a base não muda |
| S2 | **Ignorar** uma troca feita na skin, só naquela imagem | a imagem volta a ser a da base |
| S3 | Com a skin em edição, criar um osso. Tirar a skin da pilha | o osso **some** da cena e da Árvore |
| S4 | Com a skin em edição, escolher um osso da base e apertar `Delete` | sai **só naquela skin**, com os filhos; o rodapé diz quantas peças saíram; tirando a skin, o osso está lá |
| S5 | **Devolver o osso**, na aba Skins | ele volta naquela skin |
| S6 | Duas skins empilhadas que mexem na mesma imagem | a de cima vence |

### Rodada 15 — partículas (v24.0 a v24.3)

| # | O gesto | O que tem de acontecer |
|:---:|:---|:---|
| P1 | Menu Partículas → Fogo (ou o painel Partículas → Novo) | o emissor nasce no meio da cena, **apontando para cima**, com uma marca visível |
| P2 | Clicar na marca | escolhe o emissor; Propriedades abre nele |
| P3 | Mover e girar o emissor com as ferramentas | ele se move e gira; o jato acompanha |
| P4 | Digitar X, Y e Giro na ficha | aplica |
| P5 | Prender a outro osso: segurar `P` e clicar no osso; e pelo campo **Osso** da ficha | prende, e o emissor não sai do lugar |
| P6 | O painel Partículas: Duplicar, Apagar | funcionam; a cópia tem partículas diferentes |
| P7 | Arrastar a agulha para a frente e **para trás** | as partículas voltam ao mesmo desenho |

### Rodada 3 — o que perdia trabalho (v24.4 a v24.6)

| # | O gesto | O que tem de acontecer |
|:---:|:---|:---|
| T1 | Escolher um osso, digitar 90 no Ângulo (ficha rápida), Enter | o osso gira |
| T2 | Exportar uma skin, apagá-la, importá-la | volta igual (o seletor de arquivo pode não abrir sem janela: diga) |
| T3 | Soltar um projeto grande do Spriter (`exemplo/game`) | **não solte de verdade se a memória livre for menor que 1,5 GB.** Confira só que a janela do peso aparece antes de abrir, e escolha "não abrir" |

### Rodada 6 — os menus (v24.7 a v24.9)

| # | O gesto | O que tem de acontecer |
|:---:|:---|:---|
| M1 | Abrir **cada um dos doze menus**, um por um, em 1280×720 | nenhum passa da altura da tela; nenhum item cortado; a ordem é a do `05 O DESENHO DOS MENUS` |
| M2 | Procurar na tela inteira as palavras **"pele"**, **"peles"**, **"corpo"**, **"Esqueleto"** (abrindo abas, janelas, dicas, rodapé, boas-vindas) | não deviam aparecer (salvo "corpo do osso" e as dicas "Era Esqueleto → …"). **Liste cada sobra, com o lugar** |
| M3 | Dez itens do menu **Malha e regras**, um por um, com uma imagem escolhida | cada um faz o que o nome diz, ou fica cinza e **diz por quê** na dica |
| M4 | As **sete portas** que o executor não exercitou: Imagens → Trazer como sequência · Imagens → Colar pivô · Malha → Gerar automática · Malha → Traçar contorno · Entidades → Pôr entidade na cena · Promover a base · Rebaixar a entidade | funcionam |
| M5 | A busca de comandos: digitar "malha", "skin", "pivô", "partícula" | acha os itens novos |

### Rodadas 8b e 8c — a entidade na lista, e a faixa (v25.0 a v25.7)

| # | O gesto | O que tem de acontecer |
|:---:|:---|:---|
| E1 | Arrastar a espada da aba Entidades e soltar em cima do **antebraço** | ela fica presa ao antebraço, onde foi solta |
| E2 | Aba Animações | a lista mostra **"espada · entidade"**, com idle, brilho e attack embaixo |
| E3 | Clicar em **attack da espada** | a linha do tempo vira a da espada; **o herói continua à vista**; a espada está no mesmo lugar |
| E4 | Mexer na espada ali, e clicar de volta numa animação do herói | o herói mostra a espada com o que foi mexido |
| E5 | Criar uma chave em qualquer peça do herói | a espada **não salta** |
| E6 | A faixa da espada na linha do tempo: **puxar a ponta** | a faixa mostra o número (×0,9…), e a espada toca mais devagar ou mais rápido |
| E7 | **Arrastar a faixa** | muda quando a espada entra; o rodapé diz |
| E8 | Entidades → **Em laço**, desligar | a faixa passa a ter fim |
| E9 | Fazer a emenda não bater | aparece o aviso com os dois números; puxando a ponta até o fim, o aviso some |
| E10 | A faixa aparece com a linha do tempo **fechada** (sem Detalhes) | sim |
| E11 | Salvar com a espada mexida por dentro, e reabrir | **o executor não conferiu.** Diga o que acontece |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | `documentos/projeto do programa/07 A NOITE CONFERIDA <data do relógio>.md`: as tabelas acima, com as colunas **estado · o que eu vi · foto · como repetir (se falhou)** |
| 2 | No topo: um quadro por rodada (quantas **vi funcionar**, **pela metade**, **não funciona**, **não achei**), e **os defeitos, do pior para o menor**, numa lista só |
| 3 | No `03`: uma linha em "O que cada rodada entregou" |
| 4 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes), com o quadro e os três piores defeitos. **Avise também no meio**, quando fechar cada rodada conferida: assim eu libero a obra antes do fim |

## O que NÃO fazer

| | |
|:---|:---|
| Não escreva em `editor/`, `runtime/`, `runtime-python/`, `formato/` | a rodada é só de olhar |
| Não rode `versao.py`, nem `montar-programa.py` | o `programa/` fica como está enquanto você confere |
| Não conserte nada | anote |
| Não pergunte nada ao Humberto | dúvida vem para mim. **Mensagem minha só chega quando o seu turno para** |
