# ZIP-501 — o pacote `.bonez` e o seu manifesto

| Item | Valor |
|:---|:---|
| Nível | ZIP |
| Spec | 2.8, 2.9, 12.6 |
| Esperado | conferido à mão |

## O que este caso prova

Que um runtime abre a embalagem **pacote**: acha o `manifest.json`, segue o
`main`, resolve o atlas listado **contra a pasta do esqueleto principal** (2.8)
e chega no mesmo desenho que chegaria com os arquivos soltos.

Antes deste caso, a categoria ZIP da §12.4 era um conjunto **vazio**, e a regra
5 — "todos os casos X, BIN e ZIP passando" — era satisfeita por qualquer
runtime que não abrisse pacote nenhum.

## O que tem dentro do pacote

```
mimetype              application/bone-package     (primeira entrada, sem compressão)
manifest.json         { "main": "esqueleto.bone", "atlases": ["entrada.atlas.json"] }
esqueleto.bone        o esqueleto
entrada.atlas.json    o atlas que o esqueleto pede
```

A pasta `fonte/` ao lado tem os mesmos arquivos soltos, para leitura humana e
para refazer o pacote com
`node ferramentas/converter.mjs fonte/esqueleto.bone entrada.bonez`.

## O rig e as contas

O rig é o do **B-102** — uma região de atlas com corte —, de propósito: o
esperado é **o mesmo `esperado.json`**, com os mesmos números. Se o pacote
levar ao mesmo desenho que os arquivos soltos, os dois casos passam com as
mesmas contas; se o runtime resolver o caminho do atlas errado, o B-102 passa e
este falha, e a diferença aponta direto para a leitura do pacote.

As contas estão no `leiame.md` do B-102. Em resumo:

```
região "recorte":  x 2  y 2  width 60  height 40
                   offsetX 10  offsetY 5   originalWidth 100  originalHeight 80
página:            128 × 128

geometria (7.3):   BL(−40, −35)  BR(20, −35)  TR(20, 5)  TL(−40, 5)
UVs (10.4):        (0,015625 · 0,328125) … (0,015625 · 0,015625)
```

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| não abre `.bonez` | o caso nem carrega |
| ignora `main` e pega o primeiro `.bone` do ZIP | pode dar certo por sorte aqui, e errado num pacote com dois esqueletos |
| resolve o `uri` do atlas contra a raiz do ZIP em vez da pasta do esqueleto (2.8) | o atlas não é achado; a região sai sem recorte e os quatro cantos mudam |
| aceita entrada de ZIP com `..` no nome (12.6) | não é medido aqui; ver a lista de casos que ainda faltam no `ESTADO.md` |
