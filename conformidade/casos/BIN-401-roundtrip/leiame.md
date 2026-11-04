# BIN-401 — o `.boneb` carrega, e a ida e volta é exata

| Item | Valor |
|:---|:---|
| Nível | BIN |
| Spec | 2.9, 11.1, 11.3, 11.5, 11.6 |
| Esperado | conferido à mão |

## O que este caso prova

Que um runtime lê a embalagem **binária** e chega no mesmo lugar que chegaria
com o texto.

Antes deste caso, a categoria BIN da §12.4 era um conjunto **vazio**. A regra 5
diz que um runtime só pode se dizer "bone 1.0 nível C" com "todos os casos X,
BIN e ZIP passando" — e um conjunto vazio qualquer runtime satisfaz. As 943
linhas do `.bonez` e o leitor do `.boneb` não tinham um único caso.

O arquivo de entrada deste caso é o `entrada.boneb`. O `fonte.bone` ao lado é
o mesmo esqueleto em texto: está aqui para ser lido por gente, e para quem
quiser refazer a conversão com
`node ferramentas/converter.mjs fonte.bone entrada.boneb --validar`.

## O rig

```
root
osso  parent root

animação "anda", duração 2,15625 s, fps 32
  timeline bone / osso / rotation, com 70 chaves
    chave i:  time = i/32     value = 2·i
    chave  5: curve "linear"  ESCRITA
    chave 10: curve "stepped"
```

Os tempos andam de 1/32 em 1/32 de segundo de propósito: `1/32` é exato em
`f32`, e o `.boneb` grava tempo em `f32` (11.5). Com `1/30` o tempo da chave 11
sai do binário como `0,36666700…` e uma amostra pedida em `0,366667` cai
**antes** dela — a chave `stepped` anterior ainda vale, e a leitura dá 20 em
vez de 22. Não é erro de ninguém: é a precisão de `f32`. Um caso de
conformidade não deve depender dela, então as amostras aqui caem em números
que as duas embalagens escrevem igual.

## O ponto do caso: `curve: "linear"` escrita com 70 chaves

A timeline tem 70 chaves numéricas, ou seja `>= 64`, e nenhuma chave tem
`extras`, `extensions` nem propriedade fora de `time`/`value`/`curve`. Pela
primeira metade da regra de 11.5 isso mandaria usar `TKEY`.

Mas a chave 5 traz `curve: "linear"` **escrita**. O `TKEY` guarda a
interpolação em `u8 curveType[]`, e `0` quer dizer linear — o mesmo `0` de
"sem `curve` nenhuma". Passar por `TKEY` apagaria a diferença, e 11.1 exige que
a ida e a volta devolvam a mesma árvore.

Por isso 11.5 tem a exceção escrita: com um `"linear"` escrito, a timeline fica
na árvore. Confere no arquivo:

```
$ node -e "const b=require('fs').readFileSync('entrada.boneb'); \
           console.log('BLOB:', b.includes(Buffer.from('BLOB')))"
BLOB: false
```

Sem a exceção no texto normativo, um segundo gravador seguiria o `DEVE` ao pé
da letra, usaria `TKEY`, e o `"linear"` escrito sumiria — sem nenhum caso para
pegar isso.

## Contas

Entre duas chaves a interpolação é linear, e as chaves andam `1/32 s` e `2°`
por vez, então dentro da faixa linear `rotation = 64 · t`.

| Amostra | i | Por quê | `arotation` |
|---:|---:|:---|---:|
| 0 | 0 | primeira chave | 0 |
| 0,15625 | 5 | chave com `"linear"` escrita | 10 |
| 0,1875 | 6 | chave seguinte | 12 |
| 0,3125 | 10 | chave com `"stepped"` | 20 |
| 0,328125 | — | meio do degrau: o valor **segura** | 20 |
| 0,34375 | 11 | fim do degrau | 22 |
| 2,15625 | 69 | última chave: `2 · 69` | 138 |

O 0,328125 é o que separa `stepped` de `linear`: um runtime que interpole ali
devolve 21.
