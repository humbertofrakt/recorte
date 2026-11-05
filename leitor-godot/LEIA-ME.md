# O Recorte no Godot

**Esta pasta inteira, `leitor-godot/`, é um projeto do Godot 4.7.** O addon está em `addons/recorte/`; o exemplo, em `exemplo/`.

## O que só a sua mão prova — em ordem

Faça de cima para baixo. Deu errado? Pare ali, tire a foto e mande.

| # | Faça | Tem de acontecer |
|:---:|:---|:---|
| 1 | Abra o Godot 4.7 › **Importar** › escolha `leitor-godot/project.godot` › abra o projeto | abre sem erro vermelho na aba **Saída** |
| 2 | Na árvore da cena, clique no nó **Heroi** | o herói aparece **parado** no editor; no Inspetor: Arquivo, Animação inicial, Em laço, Escala, Skins iniciais |
| 3 | No Inspetor, mude a **Escala** para 3 | o herói cresce na hora, ainda no editor |
| 4 | Aperte **F5** | o herói **anda**, com o rosto; a **capa** ondula; o **cabelo** balança; a **espada** está na mão e anda junto |
| 5 | **Espaço** | ataca, o **braço** estica até o alvo, e ele volta a andar sozinho |
| 6 | **A**, depois **S** | veste a armadura (o cabelo some), e tira |
| 7 | **F** | saem **faíscas laranja** da mão, que **brilham**, caem e somem; **F** de novo apaga |
| 8 | **W** com as faíscas ligadas | as faíscas que já saíram **ficam no ar**, não seguem a mão |
| 9 | **I**, depois **P** e **C** | parado, o rosto respira; P congela; C continua de onde parou |
| 10 | **W**, depois **E** | a espada vira um **capacete** na mão, que **pisca**; o texto de cima diz "Na mão: capacete.bone" |
| 11 | **Espaço** com o capacete na mão | o golpe inteiro, e o capacete **continua** na mão |
| 12 | **E** de novo | volta a **espada** |
| 13 | **Q** | uma **aura rosa** gira **em volta** do herói: uma bola passa **atrás** dele e outra **na frente** |
| 14 | **Q** de novo | a aura some |
| 15 | **Projeto › Exportar › Web** (o Godot pede os modelos de exportação na primeira vez) | o jogo abre no navegador; o herói anda igual, e **E** e **Q** funcionam |

## Ainda falta, e ele avisa

A aba **Saída** (com **[Recorte]**) e o texto de cima dizem o que ele ainda não faz.

| O que falta | Quando |
|:---|:---:|
| A cor escura do cabelo | depois (precisa de shader) |

## No seu jogo

```gdscript
$Heroi.tocar("walk")             # em laço
$Heroi.tocar("attack", false)    # uma vez
$Heroi.tocando                   # qual está tocando
$Heroi.vestir("armadura")        # a de cima vence
$Heroi.tirar_skin("armadura")
$Heroi.terminou.connect(func(animacao): print(animacao))
$Heroi.evento.connect(func(nome, dados): print(nome))
$Heroi.carregar_bytes(bytes, "res://bonecos/")  # o arquivo já lido; o atlas vem da pasta

# A conexão (G5): pôr e tirar peças (entidades) nos slots.
$Heroi.encaixar("weapon", preload("res://motosserra.bone"))   # só este slot muda
$Heroi.encaixar("aura", preload("res://aura.bone"), "meio")    # EM VOLTA: atrás e na frente
$Heroi.desencaixar("weapon")                     # a imagem de antes volta
$Heroi.encaixar_todas("res://roda.bone", preload("res://roda-larga.bone"))  # todas as rodas
$Heroi.animar_peca("weapon", "ligada")           # em laço; ("weapon", "ligada", false) uma vez
$Heroi.soltar_peca("weapon")                     # ninguém manda nela
$Heroi.encaixado.connect(func(slot, peca): print(slot, peca))  # o jogo diz "não" aqui
$Heroi.peca_do_slot("weapon")                    # o caminho da peça, ou o nome da imagem
$Heroi.slots()                                   # os slots do boneco
$Heroi.entidades()                               # as peças carregadas
$Heroi.osso_posicao("forearm")                   # Vector2, no espaço do nó
$Heroi.osso_angulo("forearm")                    # graus, como o rotation_degrees
$Heroi.slot_posicao("weapon")                    # o pino da peça do slot
$Heroi.slot_angulo("weapon")
```

| A conexão | O que faz |
|:---|:---|
| Encaixar | a peça cai no lugar da imagem do slot, com a ordem e as chaves dela. Nenhuma chave da animação a desfaz |
| Em volta de | o nome de um slot **da peça**: o que ela tem antes dele fica atrás do boneco inteiro, o que tem depois, na frente. Vazio: a peça entra inteira |
| Animar a peça | se a animação do boneco escolhe a da peça (no editor, na faixa), a do boneco manda, e o leitor avisa |
| O que não existe | slot, peça ou animação que não existe: **nada muda, e vira aviso** |

Ponha um nó **Recorte** na cena e escolha o **Arquivo** no Inspetor: `.bone`, `.bonez` ou `.boneb`. O atlas e a imagem ficam na mesma pasta. O Godot guarda o arquivo como recurso, **sem converter**, e o leva junto ao exportar.

As **regras** e as **partículas** andam sozinhas. A física conta em passos fixos de 1/60 s: se o jogo pular um quadro, ela faz de uma vez os passos que faltaram.

## Para quem programa

| | |
|:---|:---|
| O addon | `addons/recorte/`. Cada `.gd` diz no topo de qual `.py` do `runtime-python/` veio |
| Importar sem janela | `godot --headless --path leitor-godot --import` (uma vez, antes dos testes) |
| Os testes, sem janela | `godot --headless --path leitor-godot --script res://testes/testes.gd` |
| Os 15 passos, por código | `godot --headless --path leitor-godot --script res://testes/roteiro.gd` (o que só o olho vê fica para a mão) |
| A velocidade | `godot --headless --path leitor-godot --script res://testes/medir.gd` |
| Os casos da suíte | com `RECORTE_GODOT` apontando para o Godot: `node ferramentas/conformidade.mjs --adaptador "node leitor-godot/adaptador.mjs"` |
| A referência do desenho | `npx vite-node leitor-godot/testes/gerar-referencia.mjs` (roda o desenhador do Construct) |
| Mudou o importador? | apague os `*.bone*` de `.godot/imported/` e importe de novo: o Godot só reimporta quando a ORIGEM muda |
