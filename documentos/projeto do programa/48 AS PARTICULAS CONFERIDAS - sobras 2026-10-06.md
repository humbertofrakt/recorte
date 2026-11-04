# As partículas conferidas — as sobras (v31.8) — 06/10/2026

Rodada 42, lote 1, "as sobras das partículas". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.8** (o "Sobre" diz v31.8) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 13h28 a 13h34, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-42-conferida/lote1/` (4) |
| Material | o herói de exemplo, aberto pelo próprio programa; o emissor no `foot_b`. **O fundo escuro** pus em *Arquivo → Configurações do projeto → Cor de fundo* (`#16161c`) e **devolvi** a `#f2f2f0`. **As cores** do vazio escrevi por código (o seletor do sistema não abre sem janela). **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 2, 4) | **1** (3) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 3 | **quase todos** os passos estão ditos; **falta dizer como se escurece** a cor até o vermelho (a barra *Cor na vida*), e **não consegui** terminar essa parte sem o seletor do sistema |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A receita não diz *como* escurecer a faísca.** A dica diz *"laranja que escurece até vermelho-escuro no fim da vida"*, mas **não** que isso se faz na barra ***Cor na vida*** (clicar põe duas pontas brancas; **duplo clique** numa ponta troca a cor). Quem faz pela receita fica com a faísca **toda laranja** (foto) | 3 | `V_vazio_tres` · `S_cor_na_vida` |
| 2 | *Pequeno.* **O campo *Abertura* só tem dica na palavra** (*"Abertura p/ cada lado — em graus, de 0 a 180…"*), **não na caixa**: ao passar o mouse na caixa de número, nada. A palavra e as caixas das outras linhas fazem igual: é o jeito da aba, mas aqui o pedido era *"o campo Abertura tem dica"* | 1 | — |
| 3 | *Pequeno.* O fundo **escuro** (*Cor de fundo*) só se muda **no diálogo de configurações do projeto**; não há botão na cena nem em *Exibir*. Para conferir a faísca nos dois fundos foi preciso achar isso | 2 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | A *Abertura (°)* está na receita: dica da porta, do botão, da *Velocidade* e do *Tamanho* dizem "Abertura 180"; o campo *Abertura* tem dica com unidade, faixa e típico | **vi funcionar** | **Porta (menu Partículas → Faísca):** *"…rápida (180 a 320 px/s), **Abertura 180 (para todos os lados; sem ela sai numa coluna)**, tamanho 0,7 a 1,1, laranja que escurece até vermelho-escuro (branco e amarelo-claro somem no fundo claro), cai"*. **Botão (painel Partículas → Novo: faísca):** a receita inteira, com *"taxa 0 e dois estouros (0 e 0,5 s) de 40"*, *"Abertura 180 (…)"*, *"cai (gravidade −400) e vira com o voo"*. **Velocidade:** *"…faísca 180 a 320 **(com Abertura 180: sem ela sai numa coluna só)**"*. **Tamanho:** *"…faísca 0,7 a 1,1 **(com Abertura 180)**, poeira 0,5 a 0,9"*. **Campo Abertura (°):** ***"Abertura p/ cada lado — em graus, de 0 a 180, para cada lado da Direção: 180 solta para todos os lados; com 0 todas saem na mesma linha, numa coluna. Típico: fogo 12, fumaça 20, poeira 60, faísca 180"*** (**unidade, faixa e típico**: ✓; só na palavra, defeito 2) | — |
| 2 | A *Faísca* pronta se vê no fundo **claro** e no **escuro** (escurece até vermelho no fim da vida); foto nos dois fundos | **vi funcionar** | **Claro** (`#f2f2f0`): pontos **laranja vivos** que se espalham em volta do pé e **escurecem para marrom-avermelhado** nos últimos quadros. **Escuro** (`#16161c`): os mesmos pontos **brilham** em laranja e, no fim, ficam **vermelho-escuros**, ainda visíveis (mais apagados no quadro 15). **Nos dois fundos se vê**, em três quadros (4, 9 e 15). Bem melhor que o *"pálido"* do lote 6 | `L_claro_tres` · `L_escuro_tres` |
| 3 | Faísca do vazio pela receita: conte os passos; todos estão ditos nas dicas? | **pela metade** | **Contagem:** *Novo emissor vazio* (0) e depois **20 gestos**: **9 de ficha** (taxa 0 · vida 0,3 e 0,6 · velocidade 180 e 320 · **Abertura 180** · tamanho 0,7 e 1,1 · gravidade −400) + **1** (ligar *Vira com o voo*, que **no vazio nasce desligado**) + **5 de rajada** (abrir *Rajadas*, **+**, **+**, *Quantas* 40, *Quantas* 40; a **2.ª rajada já nasce em 0,5 s**, não precisei digitar) + **2** (as duas cores de *Cor ao nascer*) + **3** (*Cor na vida*: clicar a barra, duplo clique na ponta de 100 %, escolher a cor). **Todos os números da ficha e da rajada estão na dica *Novo: faísca***; faltam os da cor (defeito 1). **Resultado** (o do vazio, sem terminar a *Cor na vida*): **laranja, em leque, igual à pronta**, mas **sem escurecer** | `V_vazio_tres` · `S_cor_na_vida` |
| 4 | A dica da *Poeira* diz a cor | **vi funcionar** | **Menu Partículas → Poeira:** *"…nasce numa faixa (40 × 4), vida (0,6 a 1 s), devagar (10 a 30 px/s), tamanho 0,5 a 0,9, **bege-claro a pardo**, cresce e assenta"*. **Painel → Novo: poeira:** *"…nasce numa faixa (retângulo 40 × 4), devagar (10 a 30 px/s), **bege-claro a pardo**, cresce e assenta. Bom no pé"* | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **O vazio já tem *Abertura* 0 e *Vira com o voo* desligado**: são dois passos que a receita **diz**, mas que quem nunca viu a ficha **não adivinha** que precisa |
| C2 | A **barra *Cor na vida*** põe as duas pontas **brancas**; branco **não muda** a cor de nascer, então só se vê o efeito depois de trocar uma ponta. A dica da barra diz isso (*"duplo clique troca a cor"*) |
| C3 | O **peso** do emissor muda no selo (*leve · 20 → médio · 80*) conforme a receita: das dicas, a melhor parte para saber se não vai pesar no jogo |

## A rodada 38 (partículas) está FEITA, fora o seletor de cor?

**Sim, com uma ressalva só.** O que **falta** é uma frase na receita: ***como* escurecer** (a barra *Cor na vida*, clicar e duplo clique). O resto: o vazio nasce visível; a fumaça sobe; o fogo sai; a faísca pronta se vê nos dois fundos; a receita da faísca traz a *Abertura*; a *Poeira* diz a cor; a rajada se monta só pela tela; a dica de cada porta traz os números.

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As cores (*Cor ao nascer*) | escritas por código | como é escolher a cor com o seletor |
| A cor do **fim da vida** | cliquei a barra e dei o duplo clique; **não consegui** pôr o vermelho (tentei por código no seletor da ponta, e a barra não mudou) | que a faísca do vazio **escurece** como a pronta |
| Fundo escuro | pus em *Configurações do projeto → Cor de fundo* e **devolvi** | outro modo de fundo escuro |
| "Se vê" / "escurece" | **minha** leitura das fotos | o que o Humberto acharia |
| Quadros | fotografei **parados** em 4, 9 e 15 (a simulação dá o mesmo a cada vez); **não** vi tocando | o movimento em tempo real |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
