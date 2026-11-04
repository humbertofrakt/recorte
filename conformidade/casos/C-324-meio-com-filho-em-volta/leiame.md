# C-324 — o slot do meio mostra um filho que tem `around` próprio

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: o pseudocódigo; as linhas "Antes e depois de m", "O slot m" e "Um nível só"), 7.13 |
| Esperado | **digitado à mão**, da conta abaixo (rodada 34, 05/10/2026). Nenhum runtime foi consultado antes |

## O rig

```
heroi         slots: perna · aura · cabeca          aura = poder.bone, around "meio"
poder.bone    slots: bola_a · meio · bola_b         meio = faisca.bone, around "centro"
faisca.bone   slots: fagulha_a · centro · fagulha_b
```

O poder está em volta do herói. O slot do meio do poder mostra a faísca, que está
em volta **do poder**.

## A conta

**A faísca** (sem marca dentro dela): `fagulha_a · centro · fagulha_b`.

**O poder.** No slot `meio`, a faísca com `around "centro"`: `F = fagulha_a · fagulha_b`
(sem o `centro`); `A = fagulha_a` vai para o **início** de `atras(poder)`;
`D = fagulha_b` vai para o **fim** de `frente(poder)`. O slot `meio` não põe nada
em `meio(poder)`.

```
lista(poder) = meio/fagulha_a · bola_a · bola_b · meio/fagulha_b
```

**O herói.** No slot `aura`, o poder com `around "meio"`. `F` = a lista do poder
"sem a peça do slot `meio`". O slot `meio` não tem peça no `meio(poder)`: as
duas fagulhas estão em `atras(poder)` e `frente(poder)`. A linha "Antes e depois
de m" diz: *"O `atras(filho)` vem antes de tudo; o `frente(filho)`, depois de tudo."*

```
A (atrás do herói)      = aura/meio/fagulha_a · aura/bola_a
meio do herói           = perna · cabeca
D (na frente do herói)  = aura/bola_b · aura/meio/fagulha_b
```

Seis peças, todas com `clips: []`. Some só o `centro` da faísca.

## A decisão que este caso prende

Foi a leitura do chat do Python: **tira só o meio da faísca; o atrás e a frente
dela ficam.** A spec sustenta pela linha "Antes e depois de m", que fala do
`atras(filho)` sem excluir o que veio do slot `m`.

## O que um runtime errado daria

| Erro | Lista |
|:---|:---|
| "o slot `m` não é desenhado" lido como "nada que venha do slot `m`" | `aura/bola_a · perna · cabeca · aura/bola_b` (quatro) |
| ignora o `around` da faísca (em bloco no `meio`) e então tira o `meio` | as mesmas quatro |
| põe o `atras(poder)` depois de `bola_a` | `aura/bola_a · aura/meio/fagulha_a · perna · …` |

## Onde a spec é fraca aqui

Nenhuma linha fala do filho com `around` **no próprio slot do meio**. A regra sai
por composição de duas linhas, e a linha "O slot m" (*"não é desenhado, tenha o
anexo que tiver"*) lida sozinha dá a outra resposta. Uma frase na 7.11 fecharia.

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso derrubou o **TypeScript** (tirava a peça B inteira: 4 peças a menos); consertado em `runtime/src/render-list.ts`, e a linha "O slot `m`" da 7.11 ganhou a frase do filho com `around` próprio.
