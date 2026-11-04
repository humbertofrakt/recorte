# Mapa da próxima rodada — 14/09/2026

Escrito pelo Planejador. **O que vem depois da v12.6**, com ordem e motivo.
Não é ordem de execução: é o mapa para o Humberto escolher por onde ir.

## O que está de pé, e quanto custa

| # | Assunto | Tamanho | Depende de | Por que importa |
|:---:|:---|:---:|:---|:---|
| 1 | **Linha do tempo, o resto**: itens 9, 6, 4, 8 | 2 lotes | nada | Já planejado e no meio do caminho. O mais barato de retomar |
| 2 | **Animação aninhada** — a espada vira motoserra animada | 3 lotes | nada | O pedido mais antigo dele ainda aberto. Formato e runtime prontos (`skeleton` + `socket` + timeline `nested`); só o editor não tem porta |
| 3 | **Animação base entre personagens** | 2 lotes | nada | O outro pedido antigo. `rig` (4.8) e `assets.animations` prontos no formato |
| 4 | **O modo vira arrumação** (lote 3 do fluxo) | 2 lotes | lotes 1 e 2, que fecham na v12.6 | *"o modo Montagem como é hoje não faz sentido"*. `doc.animation === null` está em 124 lugares, 39 arquivos |
| 5 | **O tocador nunca apaga** (lote 4 do fluxo) | 1 lote | item 1 (mexe em `dopesheet-player.ts`) | Tempo sempre existe, porque sempre há animação aberta |
| 6 | **A coluna: colar na quina** | 1 lote | ele testar o descolar da v12.5 | Ficou órfão quando o chat da coluna sumiu |
| 7 | **Prova salvar-fechar-reabrir no roteiro-30** | ½ lote | nada | A única prova que pega a família "ninguém confere a volta" — seis defeitos desse tipo em dois dias |
| 9 | **Converter as chaves posteriores à troca de pai** | 1 lote | a v12.6, já fechada | **Ponta solta dentro do que já entregamos.** Depois da troca, as chaves de pose seguintes continuam medidas do pai velho: quem animar depois da troca vê o braço saltar e não sabe por quê. Hoje só há um aviso na barra. O certo é converter, num passo de desfazer, dizendo quantas chaves foram convertidas |
| 8 | **Gravar sozinho deixa de RECUSAR** | 1 lote | — | Achado do Diretor. No Spriter editar sempre vale; o que se escolhe é o alcance da chave, nunca um freio. **Precisa do aval dele** |

## A ordem que eu recomendo, e por quê

| Ordem | O quê | Motivo |
|:---:|:---|:---|
| 1º | **Item 7**, a prova de salvar-fechar-reabrir | Meio lote, e é rede. Seis defeitos em dois dias eram todos "ninguém confere a volta". Fazer isto antes de abrir assunto grande é o que impede o sétimo |
| 2º | **Item 9**, converter as chaves posteriores à troca de pai | Meia entrega apodrece mais rápido que assunto não começado (palavras do Diretor, e ele tem razão). É a única ponta solta dentro da v12.6 |
| 3º | **Item 1**, a linha do tempo que sobrou | Barato, já planejado, e fecha um assunto inteiro em vez de deixar quatro pontas |
| 4º | **Item 2**, a animação aninhada | O maior salto de valor que sobrou. É o que ele descreveu com mais vontade, e nada o bloqueia |
| 5º | **Itens 4 e 5**, o modo virando arrumação | Só depois da v12.6 provar que a chave `parent` e a malha funcionam sem o modo. Mexer em 124 lugares antes disso é apostar |
| 6º | **Item 3**, animação base entre personagens | Vale mais quando já houver animação boa para reaproveitar |
| — | **Itens 6 e 8** | Esperam ele: o 6 depende do teste do descolar, o 8 é decisão de fluxo |

## O que eu NÃO recomendo abrir agora

| | Por quê |
|:---|:---|
| Item 16 das propostas (chave `sequence`) | Abre porta nova do formato — regra 7, decisão dele |
| Item 12 (juntar outro `.bone`) | Plano próprio, semana própria |
| Descolar em janela do sistema (popup) | Ele mesmo vetou por enquanto |
| O manual | Pausado por ordem dele até pedir |

## A conta de chats

Três executores por rodada, não mais. Ontem, com quatro em partes vizinhas,
metade do meu tempo foi decidir quem toca qual arquivo — e um fecho saiu sujo
por isso. Três partes distantes umas das outras rendem mais que quatro coladas.

**A regra que ficou dos dois dias:** quem apaga uma função arruma os testes que
morrem com ela, mesmo nos arquivos de outro, avisando o dono.

## Correção — 14/09/2026, depois da v12.6

O item 9 (converter as chaves posteriores) **não estava neste mapa** quando ele
foi escrito, e o Diretor cobrou. O motivo não é bom nem ruim: é cronológico — o
defeito foi descoberto pelo executor da chave `parent` na conferência de TELA,
cerca de meia hora depois de eu escrever o mapa, e eu registrei a decisão nos
Desvios e no `ESTADO.md`, mas não voltei aqui.

A lição vale para mim: **mapa que não é relido depois de cada fecho envelhece em
horas.** O lugar de olhar o que ficou pendente é o `ESTADO.md`, que o executor
atualiza no fecho; este mapa tem de ser acertado contra ele, e não o contrário.
