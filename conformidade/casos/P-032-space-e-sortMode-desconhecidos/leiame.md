# P-032 — `space` e `sortMode` desconhecidos caem no padrão, e não num palpite

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §7.4 da extensão (as linhas da tabela da §2.5 da spec) |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

A §7.4 dá o que o leitor faz com valor desconhecido:

| Campo | Valor no arquivo | O leitor usa |
|:---|:---|:---|
| `space` | `"galaxia"` | `"local"`, e avisa |
| `sortMode` | `"aleatorio"` | `"youngestInFront"`, e avisa |

Nenhum caso exercitava essas linhas. A entrada é a do **P-006** (o osso gira de
0° a 90° em `[0, 1]`) com três trocas: `space`, `sortMode` e `rate 2`, para ter
três partículas e a ordem importar.

A entrada **não** passa no schema (`enum` de `space` e de `sortMode`): é de
propósito, como no P-029. A §12.3 chama isso de L1 `RANGE_SCHEMA`, e o leitor
aplica o fallback.

## A conta

Nascimentos em `0`, `0.5` e `1` (`rate 2`). Em `local` a partícula anda no
espaço do osso, `p_local = (100·idade, 0)`, e é desenhada pela matriz do osso
**em `t`**. Em `t = 1` o osso está em 90°: `(x, y) → (−y, x)`, e o ângulo ganha
`90`.

| `t` | Lista, na ordem de desenho (a mais nova primeiro) |
|:---|:---|
| `0` | índice 0: `(0, 0)`, ângulo `0` |
| `1` | índice 2: `(0, 0)` · índice 1: `(0, 50)` · índice 0: `(0, 100)` — todos com ângulo `90` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| cai em `world` | o índice 1 vai para `(35.36, 35.36)` com ângulo `45`, e o 0 para `(100, 0)` |
| cai em `oldestInFront` | a lista de `t = 1` vem invertida |

## O que este verde NÃO prova (regra 28)

O **aviso**. A §7.4 manda cair no padrão **e avisar**; a sonda não tem canal de
avisos, então um leitor que cai calado também passa aqui. Os dois runtimes avisam
(conferido no código), mas o caso não mede.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
