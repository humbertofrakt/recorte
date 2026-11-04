// SPDX-License-Identifier: Apache-2.0
/**
 * Onde este módulo mora agora: `runtime/src/binario/ler.ts`.
 *
 * O binário `.boneb` e o pacote `.bonez` são parte do formato, não da caixa
 * de ferramentas: um jogo que só lê precisa deles. Então o código foi para o
 * runtime, que não pode importar nada de fora de `runtime/src`. Este arquivo
 * fica como porta de entrada antiga, para quem já importava daqui.
 */

export * from '../../../runtime/src/binario/ler.ts';
