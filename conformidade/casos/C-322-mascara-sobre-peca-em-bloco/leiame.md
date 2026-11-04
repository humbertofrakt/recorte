# C-322 — a máscara de quem recebe corta a peça em bloco

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.7 (a última linha: "esqueleto aninhado é recortado como um bloco"), 7.11, 7.13, 12.4 (`clips`) |
| Esperado | **digitado à mão**, da conta abaixo (rodada 34, 05/10/2026). Nenhum runtime foi consultado antes |

## O rig

```
heroi        slots: recorte · perna · aura · cabeca · chapeu
             recorte = clipping, end "cabeca"; aura = poder.bone, SEM around
poder.bone   slots: bola_a · anel · meio · brilho · bola_b   (uma region em cada)
```

## O que este caso prova

Uma peça encaixada **sem** `around`, dentro de uma máscara de quem a recebe, é
cortada **inteira**: cada peça dela sai com a máscara do pai em `clips`. Até
hoje nenhum caso olhava isto: o C-319 olha a peça **com** `around` (não cortada)
e o C-318, a máscara **do filho**. Estragar este ramo passava verde em tudo.

## A conta (7.7, na ordem do herói)

| Slot | O que acontece |
|:---|:---|
| `recorte` | liga a máscara. Não é desenhado |
| `perna` | cortada |
| `aura` | o bloco do poder, inteiro, no lugar do slot (7.11). As cinco peças cortadas |
| `cabeca` | cortada. É o `end`: a máscara desliga |
| `chapeu` | livre |

Oito peças: `perna`, as cinco da `aura` (com o `meio`: sem marca, ele é
desenhado), `cabeca` com `clips: ["recorte/recorte"]`; `chapeu` com `clips: []`.

## O que o verde prova

Que o bloco herda a máscara do trecho em que está, e que a máscara acaba no
`end` depois do bloco (o `chapeu` livre).

## O que um runtime errado daria

| Erro | `clips` das cinco peças da `aura` |
|:---|:---|
| não leva a máscara para dentro do bloco ("a máscara não entra nele" lido como "não corta") | `[]` nas cinco |
| desliga a máscara ao entrar no filho | `[]` nas cinco e na `cabeca` |
| não desliga no `end` | o `chapeu` com `["recorte/recorte"]` |

## O que este caso NÃO prova

A lista com **duas** máscaras (a do pai e a do filho, "de fora para dentro", 12.4).

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso passou de primeira nos dois runtimes.
