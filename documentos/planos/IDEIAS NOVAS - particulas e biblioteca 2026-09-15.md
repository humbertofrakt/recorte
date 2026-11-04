# Ideias novas — partículas e a biblioteca de animações — 15/09/2026

Ditadas pelo Humberto em 14 e 15/09, na conversa com o Diretor. **Não é plano.
Nada foi feito.** Escrito porque só existia na conversa, e conversa se perde.

---

## 1. Sistema de partículas

Pedido dele: *"eu estava pensando em sistema de partícula."*

**Nenhum dos três programas tem.** Spriter, Spine e DragonBones mandam um evento
e o motor do jogo solta a partícula. Ter partícula dentro do editor, desenhada
pelo próprio programa, seria coisa nossa.

### A regra que decide tudo

**A partícula tem de ser função pura do tempo.**

Na linha do tempo a pessoa arrasta o cursor **para trás**. Um sistema comum
simula para frente e guarda estado: arrasta para trás e a fumaça não volta
igual, e dois leitores mostram coisas diferentes. Isso mataria o formato como
padrão.

A saída conhecida é **partícula analítica com semente**: cada partícula nasce
num instante calculado, tira o aleatório de uma semente fixa, e a posição é
conta direta da idade — sem acumular.

| | |
|:---|:---|
| Arrastar o tempo para trás | mostra o mesmo quadro, exato |
| Dois leitores diferentes | desenham o mesmo pixel |
| Conformidade | dá para provar com número exato, como os 53 casos de hoje |

**O preço, dito como preço:** sem colisão, sem partícula que gera partícula, sem
física de verdade. É justamente isso que torna a prova possível.

### Como encaixa no que já existe

| Peça | Onde |
|:---|:---|
| O emissor | tipo de anexo novo (`particle`), preso a um osso como qualquer peça |
| Os campos | taxa, vida, velocidade, abertura, gravidade, tamanho e cor ao longo da vida, imagem, mistura — **todos animáveis**, pela máquina de chaves que já existe |
| Mistura e atlas | já estão no formato: `additive`, `screen`, e o atlas (§7.12, §10.3) |
| O nível | opcional: leitor que não desenhar partícula ignora e avisa |

**Ordem recomendada: depois das bases.** Não por valer menos — por dependência.
As bases mexem no modelo do arquivo inteiro; partícula é um anexo dentro do
modelo. Fazer antes é escrever no molde que vai mudar.

---

## 2. O que dá para pegar do Mixamo

Pergunta dele: *"o que você acha do Mixamo? Eu sei que é 3D, quero saber se dá
para usar algo de lá."*

O Mixamo tem três coisas, e só uma é 3D de verdade:

| O que ele faz | Dá para nós | Onde já está |
|:---|:---|:---|
| **Convenção de nomes de osso** — todo personagem usa os mesmos nomes | **já temos** | bloco `rig` (§4.8): o arquivo de animação declara os nomes que exige, e o leitor confere contra o esqueleto |
| **Biblioteca de animações prontas** que caem em qualquer personagem | **dá** | `assets.animations` (§2.8), especificado, **sem porta no editor** |
| **Auto-rig** — marcar queixo, pulso, joelho e receber esqueleto e pesos | **dá, e mais fácil que em 3D**: as peças já vêm separadas e nomeadas. Solta a pasta, o programa reconhece `braco_esq`, `perna_dir` e monta o esqueleto | falta |
| Captura de movimento | **não.** É dado 3D, sem equivalente aqui | — |

### O que o Mixamo realmente vende

**Não é a tecnologia: é a biblioteca.** Ninguém volta lá pelo auto-rig; volta
pelas mil animações prontas. Se o Recorte sair com **andar, correr, parado,
pular** prontos, caindo em qualquer personagem que siga a convenção de nomes,
é isso que faz um formato virar padrão — mais que qualquer função.

E liga direto num pedido antigo dele, que está na fila com dois lotes de
tamanho: *"levar a animação para outro personagem"*. É a mesma coisa vista de
outro lado.

### As duas perguntas para ele

| # | |
|:---:|:---|
| 1 | Entra na lista de fases? Antes, junto ou depois das partículas? |
| 2 | A convenção de nomes é **nossa** — a gente define e publica — ou seguimos uma existente? |
