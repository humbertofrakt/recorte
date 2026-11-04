# Avaliação — o modo Montar é preciso? — 14/09/2026

Pedido do Humberto, 14/09: *"tem que fazer uma avaliação sobre a necessidade do
modo montar. Minha visão atual é que vai virar um modo só, mas a ideia é muito
boa para ser jogada fora."*

**Isto é avaliação, não plano. Nada foi feito.**

---

## A resposta, em uma linha

**Como LUGAR, o modo Montar não é preciso — some.**
**Como ARRUMAÇÃO DA TELA, a ideia é boa e fica.**

---

## 1. Por que o Spriter tem uma tela só

Não é gosto dele: é o que ele guarda.

| | Spriter | Recorte |
|:---|:---|:---|
| O que um objeto tem | x, y, ângulo, escala, opacidade | o mesmo, **mais** malha, pesos, peles, IK |
| Malha (vértices) | **não existe no programa** | existe |
| Pesos (osso puxa vértice) | **não existe** | existe |
| Onde mora a pose | só na linha do tempo | na pose de repouso **e** na linha do tempo |

No Spriter **tudo** o que existe é animável. Não sobra nada para um segundo
lugar guardar — por isso a tela é uma só, e por isso é fluido.

Nós pegamos as ferramentas do Spine (malha, pesos, peles). Elas moram na
**forma de repouso**: o desenho parado, antes de qualquer animação. Isso é o
que criou o segundo lugar.

## 2. O que o modo Montar guarda hoje

| O que | Vive onde | Precisa de um lugar separado? |
|:---|:---|:---|
| Pose de repouso do osso (x, y, giro, escala) | arquivo | **não.** É um valor como outro qualquer; basta dizer onde a edição cai |
| Comprimento do osso, pivô da imagem | arquivo | **não** |
| Pai gravado no arquivo | arquivo | **não** — e a chave `parent` (§9.4) já existe para trocar no meio |
| Peles, slots, ordem base | arquivo | **não** — a ordem já vira chave em Animando (lote 66) |
| **Forma da malha (os vértices)** | arquivo | **sim, com cuidado** — ver abaixo |
| **Pesos (qual osso puxa qual vértice)** | arquivo | **sim, com cuidado** |

São **duas** coisas, não doze. O resto o modo segura sem motivo.

## 3. As duas que precisam de cuidado, e a saída

Desenhar vértice em cima de um personagem **posado** é mentira: você vê a
imagem girada e deformada, e está editando a forma parada. Por isso o Spine
tranca a malha no Setup, e o DragonBones tranca a pose enquanto você edita a
malha.

**A saída não é um modo: é a ferramenta falar.** Pegou a ferramenta Malha, com
um desenho escolhido:

| | |
|:---|:---|
| A cena | mostra **aquele desenho** na forma de repouso; o resto do personagem continua posado, apagado atrás |
| O rodapé | *"forma de repouso: vale em todas as animações"* |
| Largou a ferramenta | a cena volta ao quadro, no mesmo tempo |

Isso é fluido e honesto ao mesmo tempo. É a mesma ideia do modo, mas **por
ferramenta, não por tela**.

## 4. A ideia que não se joga fora

O que é bom no modo Montar não é o estado do documento: é a **tela mais
limpa**. Construindo, a linha do tempo não serve. Animando, criar caixa e ponto
atrapalha.

Isso o programa **já sabe fazer**: os painéis se arrastam, se fecham, se
recolhem, e o arranjo fica guardado na máquina (v12.0 a v12.5).

Então **Construir** e **Animar** viram dois arranjos de tela no menu Janela, ao
lado de *Voltar ao padrão*. Um clique arruma a tela. **Não** fecha a animação,
**não** para o tempo, **não** recusa nada. Custa pouco, porque a máquina toda já
está pronta.

## 5. O que custa tirar o modo

`doc.animation === null` é o interruptor de hoje: **124 lugares, em 39
arquivos**, e 8 arquivos de teste. Não se arranca num lote.

**A ordem segura é esvaziar antes de tirar:**

| # | Lote | Depois dele |
|:---:|:---|:---|
| 1 | Chave `parent`: trocar de pai em Animando grava chave em vez de expulsar | some o maior tranco, e é o caso da arma |
| 2 | Malha e pesos param de expulsar: a ferramenta mostra a forma de repouso e diz isso no rodapé | some o segundo tranco |
| 3 | O tocador nunca apaga; sempre há uma animação aberta (o arquivo novo já nasce com uma) | Montagem fica sem nada que só ela faça |
| 4 | O interruptor sai da barra; Construir e Animar viram arranjos no menu Janela | uma tela só |

Depois do lote 3, **Montagem já não faz nada que Animando não faça** — e o
lote 4 vira mudança de tela, não de motor. Se parar no 3, o programa já está
fluido; o 4 é o acabamento.

## 6. O que já funciona e ninguém precisa refazer

| | |
|:---|:---|
| Pôr imagem nova no meio da animação | **já funciona** (lote 57): o slot nasce vazio em 0 e o desenho entra no tempo em que você soltou, como no Spriter |
| Criar osso, ponto e caixa em Animando | já funciona |
| Ordem de desenho vira chave | já funciona (lote 66) |
| Trocar de pai no meio | **falta** — é o lote 1 |

## 7. O risco, dito como risco

Uma tela só significa que **toda edição precisa dizer onde caiu**: nesta chave,
ou no repouso (todas as animações). Hoje quem diz isso é o modo, e ele diz alto.
Sem ele, o rodapé e a ferramenta passam a ter esse trabalho — e se falharem, a
pessoa estraga a pose de repouso sem perceber.

É por isso que o lote 2 é "a ferramenta mostra a forma de repouso", e não
"deixa editar e pronto".

## Recomendação do Diretor

Fazer os lotes 1, 2 e 3 desta semana — é *terminar o que já existe*, que é o que
ele pediu para a semana. O lote 4 (tirar o interruptor) depois deles, com a
tela já vazia de motivo.
