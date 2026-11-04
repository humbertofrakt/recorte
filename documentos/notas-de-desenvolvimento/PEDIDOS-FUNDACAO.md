# Pedidos à fundação do runtime

O que falta na base (`loader.ts`, `data.ts`, `skeleton.ts`, `index.ts`) para os
módulos seguintes. Cada item traz o que falta, quem precisa e o contorno em uso.

> **Situação em 2026-09-07: os dois pedidos foram atendidos** no fechamento da
> fase 2. Nada aberto. O texto abaixo fica como registro do que foi pedido; o
> que ficou no lugar está em "Como foi atendido", no fim de cada item.

## 1. `loader.ts` — alvo `constraint` de um driver não enxerga constraint posterior

**Quem precisa.** `constraints/driver.ts` (spec 8.2).

**O que acontece.** `loadConstraints` preenche `b.constraintMap` conforme
percorre o array, e `loadTimeline` (caso `constraint`) resolve o nome no mapa na
hora. Um driver no índice 0 que aponte para a constraint do índice 1 recebe
`constraint "x" does not exist; timeline ignored` e o alvo é descartado.

A spec 8.2 diz o contrário: *"Alvo `constraint`: pode ser uma constraint
anterior ou posterior no array. **Posterior é o caso útil** (dirigir o `mix` de
um IK)."* Ou seja, hoje o caso que a spec chama de útil é justamente o que não
carrega.

**Pedido.** Resolver os alvos `constraint` dos drivers numa segunda passada,
depois de `loadConstraints` (do mesmo jeito que `bindDriverAnimations` faz com
`animation`). Bastaria adiar a criação das `ConstraintNumberTimelineData` /
`ConstraintBooleanTimelineData` de alvos de driver.

**Contorno.** O driver funciona com referência para trás (constraint declarada
antes dele): o novo `mix` vale a partir do quadro seguinte, porque a constraint
já rodou neste. `testes/constraint-driver.test.ts` ("writes the mix of another
constraint") fixa esse comportamento.

**Como foi atendido.** `loadConstraints` passou a ter duas passadas: primeiro
todos os tipos menos `driver`, depois os drivers, na ordem do arquivo. A ordem
do array (que é a ordem de aplicação de §5.6) não muda; `index` é corrigido no
fim porque um driver descartado desloca quem vem depois. Novo teste: "writes
the mix of a constraint declared after it (spec 8.2)". Continua sem resolver
um driver que aponte para **outro driver** declarado depois dele — caso sem uso
prático conhecido, anotado em comentário no código.

## 2. `index.ts` — as constraints reais não são exportadas

**Quem precisa.** Qualquer consumidor da biblioteca.

**O que acontece.** `index.ts` exporta `constraints/constraint.js` (a interface
e o registro), mas não `ik.js`, `transform.js`, `physics.js` nem `driver.js`.
Como o registro é feito por efeito colateral de importação, quem consumir só o
`index.ts` fica com os cinco tipos em `NoopConstraint`. O mesmo vale para
`parameters.ts` (novo, spec 8.1).

**Pedido.** O agente de integração acrescenta ao `index.ts`:

```ts
export * from './parameters.js';
export { IkConstraint } from './constraints/ik.js';
export { TransformConstraint } from './constraints/transform.js';
export { PhysicsConstraint } from './constraints/physics.js';
export { DriverConstraint } from './constraints/driver.js';
```

**Contorno.** Os testes importam os módulos direto (`../src/constraints/driver.js`).
Atenção: importar só o **tipo** (`import { X } from ...` usado apenas em
`as X`) é apagado pelo compilador e o registro não acontece — é preciso um uso
de valor (`instanceof`) ou um `import '...'` de efeito colateral.

**Como foi atendido.** `index.ts` agora traz cinco `import './constraints/*.js'`
de efeito colateral (justamente por causa da armadilha acima), reexporta as
cinco classes, `parameters.js` e `render/canvas.js`. `testes/heroi.test.ts`
importa **só** o `index.ts` e verifica que nenhuma constraint do exemplo é
`NoopConstraint` — é o teste que guarda este pedido.
