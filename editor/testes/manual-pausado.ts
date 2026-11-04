/**
 * O manual está PAUSADO — ordem do Humberto, 10/09/2026: "primeiro vamos
 * terminar o programa, depois vamos fazer o manual".
 *
 * Todo teste que lê `documentos/manual/` usa `describeManual` ou `itManual`
 * no lugar de `describe` e `it`. Enquanto a pausa vale, eles aparecem como
 * PULADOS no vitest: não somem, e não reprovam o programa por falta de texto.
 *
 * Para voltar a conferir o manual, tire o `.skip` das duas linhas abaixo.
 */

import { describe, it } from 'vitest';

export const describeManual = describe.skip;
export const itManual = it.skip;
