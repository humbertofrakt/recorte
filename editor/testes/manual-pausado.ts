/**
 * O manual foi PAUSADO em 10/09/2026 — ordem do Humberto: "primeiro vamos
 * terminar o programa, depois vamos fazer o manual".
 *
 * DESPAUSADO no degrau D13 (05/11/2026): o programa ficou pronto, o Humberto
 * pediu para terminar o projeto, e o manual foi refeito para a v36.5.
 *
 * Todo teste que lê `documentos/manual/` usa `describeManual` ou `itManual`.
 * Hoje eles são `describe` e `it` de verdade: o manual reprova quando
 * envelhece. Para pausar de novo (só por ordem do Humberto), troque as duas
 * linhas abaixo por `describe.skip` e `it.skip`.
 */

import { describe, it } from 'vitest';

export const describeManual = describe;
export const itManual = it;
