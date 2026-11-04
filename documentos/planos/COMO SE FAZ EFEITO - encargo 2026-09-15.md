# Como se faz efeito — encargo do segundo pesquisador — 15/09/2026

Ordem do Humberto, hoje, e ela alarga o que o programa é:

> *"O programa também vai ser usado para fazer efeitos. Mande um executor olhar
> os programas e ferramentas que fazem efeitos, para ver ideias que podemos
> implementar."*

O resultado é **um** arquivo: `documentos/planos/COMO SE FAZ EFEITO 2026-09-15.md`.

**Documento, não versão.** Ninguém toca em `editor/src`; nada de `versao.py`,
`npm run roteiro` nem `npm run medir`. `WebSearch` autorizado nesta frente.

---

## As duas pesquisas não são a mesma. Leia isto antes de escrever uma linha

| Pesquisador | A pergunta que ele responde |
|:---|:---|
| O primeiro (`O QUE AINDA NAO TEMOS`) | **o que falta ao nosso editor** — funções do Spine, campos de emissor, varredura geral |
| **Este** | **como se faz efeito hoje no mundo**, e o que disso cabe num programa de animação esquelética |

Se você achar coisa da parte do outro, **mande para ele** em vez de escrever no
seu documento. Dois documentos com o mesmo conteúdo custam o dobro e valem menos
que um.

## O que olhar — a lista larga antes da funda

| Grupo | Quem |
|:---|:---|
| Editores dedicados a efeito | **Effekseer** (gratuito, muito usado em jogo 2D e 3D), EmberGen e afins que geram folha de sprites, os editores de partícula do **Godot**, do **Unity** e do **Phaser/Pixi** |
| Programas de animação vizinhos | **Rive** (o mais próximo do que estamos virando: malha, máquina de estados, efeito), **Live2D**, Adobe Animate, Cavalry, After Effects |
| O caminho real do artista de jogo 2D | muitos ainda desenham quadro a quadro no **Aseprite**, ou geram folha de sprite em 3D e importam |

**A pergunta que vale mais que a lista inteira:** *por que o artista de efeito
não usa ferramenta esquelética?* A resposta dela é o buraco que podemos ocupar.

## A régua que não se negocia

**Tudo tem de ser função pura do tempo.** A linha do tempo anda para trás.

Ideia que exige simulação acumulada (fluido, colisão, física com estado) só
entra se houver um jeito **determinístico** de fazer. Se não houver, escreva isso
como **limite**, com o nome certo — não esconda, e não proponha o que o formato
não pode cumprir.

## O que JÁ TEMOS, e você não pode ignorar

Senão você propõe o que existe. Muita coisa de efeito 2D se faz com estas peças,
e **falta só a porta na tela**:

| Já existe | |
|:---|:---|
| cor e tint por peça | animáveis |
| tint black | sim |
| quatro modos de mistura | normal, additive, multiply, screen |
| máscara de recorte | sim |
| eventos na linha do tempo | sim |
| malha com deformação e pesos | sim |

**Separar "falta a função" de "falta o botão" é metade do valor deste
documento.**

## O que interessa de verdade: o GESTO

Não a arquitetura. **Como o artista cria um efeito** nesses programas: em
quantos passos, o que ele vê enquanto faz, o que ele ajusta primeiro. Foi assim
que o inventário do Spriter ficou útil.

## As regras da fonte

| | |
|:---|:---|
| Tudo que vier de fora | entra **citado, com a fonte** |
| Opinião de fórum | entra **marcada como opinião**, nunca como fato |
