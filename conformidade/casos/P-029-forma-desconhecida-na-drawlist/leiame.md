# P-029 — o emissor de forma desconhecida não entra na `drawList`

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §7.3 e §7.4 da extensão ("forma desconhecida: **não desenha o emissor**. Avisa uma vez"), spec 2.5, 12.4 (`drawList`: "o emissor `BONE_particle` (uma entrada por emissor)") |
| Esperado | **digitado à mão**, da conta abaixo (rodada 34, 05/10/2026). Nenhum runtime foi consultado antes |

## O rig

```
slots, na ordem: corpo · fx_bom · fx_mau · cabeca
corpo, cabeca   region
fx_bom          "jato":  BONE_particle, shape "point"
fx_mau          "nevoa": BONE_particle, shape "nuvem"   (não existe)
```

## A conta

| Slot | Entra? |
|:---|:---|
| `corpo` | sim |
| `fx_bom` | sim: uma entrada por emissor |
| `fx_mau` | **não**: forma desconhecida, o emissor não é desenhado |
| `cabeca` | sim |

`drawList = corpo/corpo · fx_bom/jato · cabeca/cabeca`, todos com `clips: []`.

## O que o verde prova

Metade da regra: o emissor **não é desenhado**. O `fx_bom` está aí para o caso não
passar num leitor que não põe emissor nenhum na lista (regra 28).

## O que o verde NÃO prova

**O aviso.** A sonda não tem canal de avisos. Um leitor que some com o emissor
**calado** passa aqui. Faltaria um canal `warnings` no dump (12.4): a lista dos
avisos emitidos, por código.

## O que um runtime errado daria

| Erro | Lista |
|:---|:---|
| cai para `point` (palpite silencioso) | `corpo · fx_bom/jato · fx_mau/nevoa · cabeca` |
| não põe emissor nenhum na `drawList` | `corpo · cabeca` |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso derrubou o **TypeScript** (o emissor de forma desconhecida entrava na `drawList`); consertado em `runtime/src/render-list.ts`.
