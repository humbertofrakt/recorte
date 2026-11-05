# ZIP-502 — o `main` numa subpasta: a base é a pasta do `main`, não a raiz

| Item | Valor |
|:---|:---|
| Nível | ZIP |
| Spec | 2.8 (*"A base dentro de um `.bonez`, com todas as letras"*), 2.9 |
| Esperado | **o mesmo do ZIP-501** (e do B-102), conferido à mão lá |

## O que este caso prende

A §12.4 dizia: *"falta um caso de `.bonez` com o `main` numa subpasta, que é o
único jeito de separar 'pasta do main' de 'raiz do ZIP'"*. É este.

```
mimetype                          application/vnd.bone+zip   (Store, primeira)
manifest.json                     main: "personagens/esqueleto.bone"
personagens/esqueleto.bone        pede o atlas "entrada.atlas.json"
personagens/entrada.atlas.json    o atlas CERTO (o do ZIP-501)
entrada.atlas.json                a ISCA: mesmo nome, na raiz, outra região
```

Pela §2.8, com `main: "personagens/esqueleto.bone"` a base é `personagens/`, e
o `uri` `"entrada.atlas.json"` procura **só** `personagens/entrada.atlas.json`.

## O que falha aqui (visto em 05/11/2026)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| resolve contra a raiz do ZIP | pega a isca: o primeiro vértice dá `−15` em vez de `−40` (provado numa cópia com os dois atlas trocados de lugar: os dois runtimes reprovam) |
| não acha nada | o slot fica sem desenho, e `vertices` vem vazio |

As listas do manifesto (`skeletons`, `atlases`) estão escritas como **nomes de
entrada** — relativas à raiz do ZIP, como o `main`. A §2.9 ganhou essa linha.

A pasta `fonte/` tem os mesmos arquivos soltos, para leitura humana. O pacote
foi montado à mão (Python `zipfile`) e o bit 11 (UTF-8) ligado nos nomes, como
a §2.9 pede.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026.** Os dois runtimes e o pacote do Construct
passam.
