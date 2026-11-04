# C-323 — a máscara cujo `end` é o slot marcado

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.7 (o algoritmo), 7.11 (`around`: o pseudocódigo da lista e a linha "Clipping"), 7.13 |
| Esperado | **digitado à mão**, da conta abaixo (rodada 34, 05/10/2026). Nenhum runtime foi consultado antes |

## O rig

```
heroi        slots: recorte · perna · aura · cabeca
             recorte = clipping, end "aura"; aura = poder.bone, around "meio"
poder.bone   slots: bola_a · anel · meio · brilho · bola_b
```

## A regra

A 7.11 escreve a lista assim: *"para cada slot L de S, na ordem de desenho atual
de S, **com o clipping de 7.7**"*. O laço da 7.7 termina cada slot com
`se clip != null e L.name == clip.fim: clip = null`. O slot `aura` continua no
laço (a linha "A posição do slot L" da 7.11: *"ela continua guardada"*); o que
muda é só para onde vão as peças dele. Então:

1. a máscara **acaba** em `aura`;
2. as peças da `aura` **não** são cortadas (7.7, última linha; caso C-319).

## A conta

| Slot | O que acontece |
|:---|:---|
| `recorte` | liga a máscara |
| `perna` | cortada |
| `aura` | as peças vão para trás e para a frente do herói, sem máscara. É o `end`: a máscara desliga |
| `cabeca` | **livre** |

```
atras  = aura/bola_a · aura/anel
meio   = perna [recorte] · cabeca []
frente = aura/brilho · aura/bola_b
```

Seis peças. Só a `perna` leva `["recorte/recorte"]`.

## O que o verde prova

Que o slot marcado ainda conta como `end` da máscara de quem o recebe.

## O que um runtime errado daria

| Erro | Diferença |
|:---|:---|
| tira o slot `aura` da volta do clipping ("ele não está mais naquele trecho da ordem") | a máscara nunca acaba: `cabeca` com `["recorte/recorte"]` |
| corta a peça marcada | as quatro peças da `aura` com `["recorte/recorte"]` |

## Onde a spec é fraca aqui

O pseudocódigo decide; a prosa puxa para o outro lado. A linha "Clipping" da 7.11
diz que o filho *"não está mais naquele trecho da ordem"*, e quem ler só isso tira
o slot da volta. Uma frase na 7.7 fecharia: "o slot com `around` conta como `end`".

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso passou de primeira nos dois runtimes; a frase que faltava entrou na 7.7 da spec.
