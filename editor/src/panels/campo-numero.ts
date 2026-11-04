/**
 * **O número da casa, fora da ficha** — rodada 47, lote 3 (07/10/2026).
 *
 * Só a ficha (Propriedades) tinha o número que a régua R7 do doc `68` pede:
 * arrasta pelo rótulo, aceita conta (`90+15`, `*2`), anda com as setas (Shift
 * dez, Alt um décimo) e, com "abc", fala no rodapé sem apagar o valor. A Malha,
 * a Prévia, a chave de evento e a janela do pivô tinham `<input type=number>`
 * cru: sem conta, sem arrasto, e o "abc" sumia calado.
 *
 * Este é o mesmo número, para quem não é a ficha. As contas são as dela
 * (`properties-model.ts`: `evalFieldInput`, `stepValue`, `scrubValue`,
 * `notNumberSays`, `formatNumberField`), e não uma cópia: um número só na casa.
 *
 * O painel diz o valor e onde gravar, **na escala da tela** (o Peso exato é de
 * 0 a 100 % na tela e de 0 a 1 no arquivo; quem converte é o painel).
 */

import { el } from './dom.js';
import {
  arrowDirection, evalFieldInput, evalNumberExpression, formatNumberField, notNumberSays, scrubValue, stepValue,
} from './properties-model.js';

export interface CampoNumero {
  /** O nome curto, para o rodapé ("'abc' não é número: Raio ficou 40 px"). */
  nome: string;
  /** A dica inteira, no molde da casa (R4): nome, unidade, faixa, o que faz. */
  dica: string;
  /** A unidade, escrita depois da caixa. Sem, nada. */
  unidade?: string;
  /** O valor de agora, na escala da tela. */
  ler: () => number;
  /** Grava, na escala da tela. A conta já veio presa entre `min` e `max`. */
  gravar: (valor: number) => void;
  /** Um passo das setas e um pixel de arrasto. Padrão: 1. */
  passo?: number;
  min?: number;
  max?: number;
  /** Fala no rodapé (o `doc.notice` do painel). Sem, o "abc" só volta o valor. */
  falar?: (frase: string) => void;
  /** Um id estável: depois de gravar o painel redesenha, e o foco volta ao campo novo. */
  id?: string;
  /**
   * Caixa VAZIA quer dizer "tirar o valor do arquivo" (a chave de evento: o
   * valor sai e a definição volta a responder). Sem isto, vazio é "não é número".
   */
  apagar?: () => void;
  /** Só números inteiros (o Inteiro do evento): a conta é truncada. */
  inteiro?: boolean;
  /** O texto da caixa quando o valor não existe. */
  vazio?: string;
}

/** O valor preso na faixa do campo. */
export function prender(valor: number, min?: number, max?: number): number {
  let v = valor;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  return v;
}

/**
 * A caixa do número, e a unidade depois dela. `ligarRotulo` faz o rótulo
 * arrastar o número (o *scrubby* do Photoshop, o arrasto do Spine).
 */
export function campoNumero(op: CampoNumero): { caixa: HTMLElement; input: HTMLInputElement; ligarRotulo: (rotulo: HTMLElement) => void } {
  const passo = op.passo ?? 1;
  const input = el('input', 'campo-numero') as HTMLInputElement;
  input.type = 'text';
  input.inputMode = 'decimal';
  if (op.id !== undefined) input.id = op.id;
  const inicial = op.ler();
  input.value = Number.isFinite(inicial) ? formatNumberField(inicial) : '';
  if (op.vazio !== undefined) input.placeholder = op.vazio;
  input.title = op.dica;
  input.setAttribute('aria-label', op.dica);

  const gravar = (valor: number): void => {
    const preso = prender(op.inteiro === true ? Math.trunc(valor) : valor, op.min, op.max);
    input.value = formatNumberField(preso);
    op.gravar(preso);
    voltarFoco();
  };
  const voltarFoco = (): void => {
    if (op.id === undefined) return;
    const novo = document.getElementById(op.id) as HTMLInputElement | null;
    if (novo !== null && novo !== input && document.activeElement !== novo) { novo.focus(); novo.select(); }
  };

  input.addEventListener('change', () => {
    if (input.value.trim() === '' && op.apagar !== undefined) { op.apagar(); return; }
    const lido0 = op.ler();
    const agora = Number.isFinite(lido0) ? lido0 : 0;
    const lido = evalFieldInput(input.value, agora);
    if (lido === null) {
      op.falar?.(notNumberSays(input.value, op.nome, formatNumberField(agora), op.unidade));
      input.value = formatNumberField(agora);
      return;
    }
    gravar(lido);
  });
  input.addEventListener('keydown', (event) => {
    const direcao = arrowDirection(event.key);
    if (direcao === 0) return;
    event.preventDefault();
    event.stopPropagation();
    const lido0 = op.ler();
    const atual = evalNumberExpression(input.value) ?? (Number.isFinite(lido0) ? lido0 : 0);
    gravar(stepValue(atual, direcao, passo, { shift: event.shiftKey, alt: event.altKey }));
  });

  const ligarRotulo = (rotulo: HTMLElement): void => {
    rotulo.classList.add('rotulo-arrasta');
    rotulo.title = op.dica;
    rotulo.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const x0 = event.clientX;
      const v0 = op.ler();
      let andou = false;
      const mexe = (e: PointerEvent): void => {
        const dx = e.clientX - x0;
        if (!andou && Math.abs(dx) < 3) return;
        andou = true;
        e.preventDefault();
        gravar(scrubValue(v0, dx, passo, { shift: e.shiftKey, alt: e.altKey }));
      };
      const solta = (): void => {
        window.removeEventListener('pointermove', mexe);
        window.removeEventListener('pointerup', solta);
        window.removeEventListener('pointercancel', solta);
      };
      window.addEventListener('pointermove', mexe);
      window.addEventListener('pointerup', solta);
      window.addEventListener('pointercancel', solta);
    });
  };

  if (op.unidade === undefined || op.unidade === '') return { caixa: input, input, ligarRotulo };
  const caixa = el('span', 'campo-numero-com-unidade');
  const unidade = el('span', 'campo-numero-unidade', op.unidade);
  unidade.title = op.dica;
  caixa.append(input, unidade);
  return { caixa, input, ligarRotulo };
}
