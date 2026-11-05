# Noite de 04/11/2026 — o leitor do Godot

Ramo: `obra/godot`. Parte: só `leitor-godot/`.

## Para o Humberto: 4 passos no seu PC

Abra o terminal na pasta do Recorte. Um comando por vez.

| # | Comando | Tem de dar |
|:---:|:---|:---|
| 1 | `godot --headless --path leitor-godot --import` | termina sem erro |
| 2 | `godot --headless --path leitor-godot --script res://testes/testes.gd` | última linha: "N de N testes passaram." |
| 3 | `godot --headless --path leitor-godot --script res://testes/roteiro.gd` | última linha: "N de N passos provados por código." |
| 4 | `node ferramentas/conformidade.mjs --adaptador "node leitor-godot/adaptador.mjs"` | **120 de 120** |

No Windows, `godot` é o caminho do `Godot_v4.7.2-stable_win64_console.exe` (o que tem **console** no nome). No passo 4, antes: `set RECORTE_GODOT=C:\caminho\do\Godot_v4.7.2-stable_win64_console.exe`.

Deu FALHOU? Tire a foto e mande. O roteiro nunca rodou: o erro pode ser dele.

## Primeiro, o mais importante

**O Godot não rodou nesta noite.**

| | |
|:---|:---|
| O que fiz | Baixei o Godot 4.7.2 para Linux. Conferi a soma SHA-512 com a do site oficial: bate |
| O que barrou | A sessão na nuvem **não deixa rodar** programa baixado da internet. Pedi duas vezes; as duas foram barradas |
| O que isso quer dizer | O conserto e o roteiro estão **escritos**, mas **não provados no Godot**. Não digo "120 de 120" sem ver |

## O que fiz · como provei · o que ficou

| O que fiz | Como provei | O que ficou |
|:---|:---|:---|
| **C-326**: copiei o conserto do Python para `addons/recorte/ator.gd`. A chave `reset` da animação da peça agora dispara, no relógio da peça, antes da física do quadro | Linha a linha contra `runtime-python/recorte/actor.py`. O Python passa o C-326 (diferença 3,3e-7) | Rodar no Godot. Primeiro com o `ator.gd` velho (tem de dar 119, o C-326 com 1,180874), depois com o novo (120) |
| **`testes/roteiro.gd`**: os passos 1 a 14 do `LEIA-ME.md` por código, na cena do exemplo, com as teclas apertadas à mão | Não rodou | Rodar. Pode cair por erro do próprio roteiro: ele nunca rodou |
| Uma linha nova no `LEIA-ME.md`: como rodar o roteiro | — | — |
| Passo 15, exportar para Web | Não tentei: sem Godot rodando, não há o que exportar | Fica para a mão |

## O que o roteiro confere em cada passo

| # | Confere | Não confere (só o olho) |
|:---:|:---|:---|
| 1 | a cena carrega; nenhum aviso além da cor escura do cabelo | o vermelho da aba Saída |
| 2 | o Inspetor tem os 5 campos | o herói parado no editor |
| 3 | Escala 3 põe o pino da espada 3 vezes mais longe | o tamanho na tela |
| 4 | toca walk; rosto e espada no desenho; tronco, capa e cabelo se mexem; a espada fica no pino em 30 quadros | |
| 5 | Espaço toca attack; o braço estica; no fim volta a walk | |
| 6 | A: o cabelo some; S: volta | |
| 7 | F: faíscas laranja, que somam a luz, fortes e fracas juntas; F de novo apaga | o brilho na tela |
| 8 | o emissor está no espaço do **mundo** | **fraco**: não prova que a faísca fica no ar ao apertar W |
| 9 | I: a cabeça respira; P: nada anda em 30 quadros; C: anda 1 quadro só | |
| 10–12 | E: capacete; o texto diz "Na mão: capacete.bone"; a luz troca de cor; o golpe não o tira; E volta a espada | |
| 13–14 | Q: aura; a primeira peça desenhada é a bola de trás, a última a da frente; ela gira; Q tira | a cor rosa |

## Como ver o defeito antes do conserto

Para ver o defeito antes do conserto (regra 26): `git show 9612e85~1:leitor-godot/addons/recorte/ator.gd > leitor-godot/addons/recorte/ator.gd`, rode o último comando, depois `git checkout leitor-godot/addons/recorte/ator.gd`.


## A régua desta noite (05/11/2026, 00h)

| Medida | Resultado |
|:---|:---|
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 120 de 120 |
| Com o adaptador do Python | 120 de 120 (C-326 passa) |
| Com o adaptador do Godot, sem Godot | 0 de 120, e ele **diz por quê**: "o Godot não rodou (godot): spawnSync godot ENOENT". Aviso honesto, como pede a regra 21 |
| `npx vitest run` (00h06) | 5774 passam, 31 pulados, **1 vermelho**: o conhecido do manual (`ajuda.test.ts`, as imagens do manual). Nenhum vermelho novo |

## Um erro meu, pela forma (regra 27)

**Criei uma pasta que um teste usa como sinal.** Fiz `backup/` no clone para guardar a cópia do `ator.gd`. Os testes do editor olham se `backup/` existe: se existe, procuram nela os arquivos do PC do Humberto. Deu **5 vermelhos falsos** (`arvore`, `paineis`, `folha-animada`, `validador-rascunho-0-2`, `conformidade`). Tirei a pasta: os 5 voltaram a verde. Nada disso subiu ao GitHub (`backup/` está no `.gitignore`).

## Fora da minha pasta (só descrevo)

| Onde | O quê |
|:---|:---|
| `ESTADO.md` | ainda diz "119 de 120". Trocar só **depois** que o Godot provar 120 |

FIM
