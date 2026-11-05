# B-120 — tags ativas: antes da primeira chave, só as da animação

| Item | Valor |
|:---|:---|
| Nível | **B** (timeline `tag`) |
| Spec | 8.5, 9.9, 9.10 |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

Até 05/11/2026 a §12.4 dizia: *nenhum caso exercita `tag`*, e o canal `tags`
não era medido por caso nenhum.

**Duas regras se cruzam, e a específica ganha.** A §9.10 diz que antes da
primeira chave vale a primeira chave. A §8.5 diz que `activeTags` antes da
primeira chave é **só** `animation.tags`. Para `tag`, vale a §8.5 — a frase
agora está escrita na §8.5.

**A ordem da união** (linha nova da §8.5): primeiro `animation.tags`, na ordem do
arquivo; depois os da chave, na ordem da chave, **sem repetir**. O dump compara
tags exatas (12.4), então a ordem é parte da resposta.

## A conta

`animation.tags = ["idle"]`. Chaves: `0.5 → ["ataque", "invulneravel"]`,
`0.75 → []`, `1 → ["fim", "idle"]`.

| `t` | `tags` | Por quê |
|:---|:---|:---|
| `0`, `0.25` | `["idle"]` | antes da primeira chave: só a animação |
| `0.5`, `0.6` | `["idle", "ataque", "invulneravel"]` | degrau |
| `0.75` | `["idle"]` | chave vazia |
| `1` | `["idle", "fim"]` | o `idle` da chave não repete |

## O que falha aqui

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| usa a regra geral da §9.10 antes da primeira chave | `t = 0` e `0.25` dão `["idle", "ataque", "invulneravel"]`. **O runtime Python dava isso até 05/11/2026** |
| repete a tag que está nos dois lugares | `t = 1` dá `["idle", "fim", "idle"]` |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python (este depois do
conserto).
