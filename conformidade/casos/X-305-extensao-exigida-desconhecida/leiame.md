# X-305 — extensão exigida que o leitor não conhece

| Item | Valor |
|:---|:---|
| Nível | X (compatibilidade, obrigatório em todo nível) |
| Spec | 2.7 |
| Esperado | conferido à mão |

## O que este caso prova

Que um arquivo cujo `extensionsRequired` cita uma extensão que o leitor não
implementa é **recusado**, e que a mensagem diz **qual** extensão faltou.

É a metade severa de 2.7. Sem ela, um runtime abriria um personagem que depende
de uma extensão que ele não sabe calcular, desenharia algo errado e chamaria
aquilo de conformidade. O jeito honesto de errar é não abrir.

Este é o primeiro caso da suíte que exige uma **recusa** em vez de uma pose. O
`esperado.json` diz isso com o bloco:

```json
"recusa": { "contem": "VENDOR_malha_volumetrica" }
```

O executor então inverte o veredito: carregar é falhar, e recusar com essa
palavra na mensagem é passar. Um runtime de terceiro que rode a suíte por
`--adaptador` precisa fazer o mesmo — sair com erro, e o erro tem que citar a
extensão.

## O rig

```
extensionsUsed:     ["VENDOR_malha_volumetrica"]
extensionsRequired: ["VENDOR_malha_volumetrica"]

root
osso  parent root   x 40   y 10
```

O esqueleto é deliberadamente banal: se o leitor recusar por causa de outra
coisa, não é este caso que ele está passando. Nada aqui é difícil de carregar,
a não ser a exigência.

## Não há contas

Não há pose a conferir: o arquivo não deve chegar a virar esqueleto.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| ignora `extensionsRequired` e carrega | `o arquivo devia ter sido recusado, e carregou` |
| recusa, mas sem dizer qual extensão | `recusou, mas a mensagem não traz "VENDOR_malha_volumetrica"` |
| recusa qualquer arquivo com `extensions` | o **X-304** falha, e é ele o par deste caso |

## Nota sobre `allowMissingRequiredExtensions`

O runtime de referência aceita abrir em modo degradado quando quem chama pede
por escrito (`allowMissingRequiredExtensions: true`), o que 2.7 permite com um
**PODE**. A suíte roda sem essa opção, porque o padrão é o que está sendo
provado.
