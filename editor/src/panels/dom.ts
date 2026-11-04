/**
 * Tiny DOM helpers shared by the panels.
 *
 * No framework: a panel is a function that builds elements. These helpers only
 * remove the repetition of `createElement` + `className` + `textContent`.
 */

import { campoNumero } from './campo-numero.js';
import { paintIcon } from '../ui/icons.js';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4.
import { el } from '../ui/dom.js';
export { el } from '../ui/dom.js';

/**
 * Um separador que só existe para o TEXTO, nunca para os olhos.
 *
 * Quando o espaço entre duas palavras vem só do `gap` do flex ou de um `<br>`,
 * o `textContent` cola as duas: o DOM lê "Ossos18", "idle2,00 s",
 * "0,00 squadro 0". Isso é o que sai ao copiar e é o que um leitor de tela
 * fala. O elemento abaixo é retirado do fluxo (não mexe em nada na tela) e
 * continua no texto e na árvore de acessibilidade.
 */
export function separador(texto = ' · '): HTMLSpanElement {
  return el('span', 'so-texto', texto);
}

/** Removes every child of a host element. */
export function clear(host: HTMLElement): void {
  while (host.firstChild) host.removeChild(host.firstChild);
}

/**
 * **O foco atravessa o redesenho** — Rodada 47, lote 4 (R8 do doc `68`).
 *
 * A forma do defeito, que é a do Ctrl+seta da Ordem (rodada 38, lote 4b):
 * gravar redesenha o painel, a barrinha que tinha o foco sai da página, e a
 * tecla seguinte cai no `BODY`. Medido no programa montado (v34.4): na Regra e
 * no Alfa da ficha, três teclas andavam UMA casa.
 *
 * Chame antes de limpar o painel; a função que volta, depois de desenhar. O
 * elemento é achado de novo pelo `id` ou pela marca `data-foco`, que quem
 * desenha a barrinha põe nela. Sem marca, nada muda.
 */
export function lembrarFoco(raiz: HTMLElement | null): () => void {
  const ativo = typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null;
  if (raiz === null || ativo === null || !raiz.contains(ativo)) return () => {};
  const id = ativo.id;
  const marca = ativo.dataset?.['foco'];
  if (id === '' && (marca === undefined || marca === '')) return () => {};
  return () => {
    const novo = (id !== ''
      ? document.getElementById(id)
      : raiz.querySelector(`[data-foco="${CSS.escape(marca!)}"]`)) as HTMLElement | null;
    if (novo !== null && novo !== document.activeElement && raiz.contains(novo)) novo.focus();
  };
}

/** A button that always carries a written label, never an icon alone. */
/**
 * Um botão de barra de painel com ÍCONE e sem palavra — lote 19.
 *
 * A palavra continua no `title` e no `aria-label`, com a tecla quando há uma:
 * um ícone sem nome é uma adivinhação, e o Humberto é disléxico. O que muda é
 * que a palavra deixa de ocupar a linha.
 *
 * O cabeçalho da Árvore tinha oito botões de palavra em TRÊS linhas, e as três
 * linhas empurravam o título "Ossos 18" para fora da vista. É o terceiro
 * defeito da tela que o Humberto mandou.
 */
export function iconButton(
  icon: string, name: string, onClick: () => void,
): HTMLButtonElement {
  const node = el('button', 'painel-botao painel-botao-icone') as HTMLButtonElement;
  node.type = 'button';
  const glyph = el('span', 'painel-botao-icone');
  if (!paintIcon(glyph, icon, 18)) glyph.textContent = name.slice(0, 1);
  const palavra = el('span', 'painel-botao-nome', name);
  node.append(glyph, palavra);
  node.title = name;
  node.setAttribute('aria-label', name);
  node.addEventListener('click', onClick);
  return node;
}

export function button(label: string, onClick: () => void, className = 'painel-botao'): HTMLButtonElement {
  const node = el('button', className, label);
  node.type = 'button';
  node.addEventListener('click', onClick);
  return node;
}

/**
 * `true` once `index.html` has already loaded every panel stylesheet up front.
 *
 * The page links `src/estilos.css`, which BLOCKS the first paint, so no panel
 * is ever drawn without its style. The lazy links below stay for the case of a
 * panel mounted outside the page (a test, a harness) and simply stand down
 * when the blocking sheet is there — otherwise every sheet loaded twice.
 */
let stylesPreloaded = false;
export function markStylesheetsPreloaded(): void {
  stylesPreloaded = true;
}
export function stylesheetsPreloaded(): boolean {
  return stylesPreloaded;
}

/**
 * Links `panels.css` once, the first time a panel mounts.
 *
 * The stylesheet is referenced through `import.meta.url` instead of a bare
 * `import './panels.css'` so the project needs no ambient module declaration
 * for CSS — one less file shared between owners.
 */
let styleLinked = false;
export function ensureStylesheet(): void {
  if (stylesPreloaded || styleLinked || typeof document === 'undefined') return;
  styleLinked = true;
  const href = new URL('./panels.css', import.meta.url).href;
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/** Turns a `[r, g, b]` in 0..1 into `#rrggbb` for an `<input type="color">`. */
export function toHex(color: readonly number[]): string {
  const part = (value: number | undefined): string => {
    const byte = Math.max(0, Math.min(255, Math.round((value ?? 0) * 255)));
    return byte.toString(16).padStart(2, '0');
  };
  return `#${part(color[0])}${part(color[1])}${part(color[2])}`;
}

/** Turns `#rrggbb` back into three numbers in 0..1. */
export function fromHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  if (!Number.isFinite(value)) return [1, 1, 1];
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

// ---------------------------------------------------------------------------
// Linhas de formulário — usadas pela Exibição e pela cebola da régua
// ---------------------------------------------------------------------------
//
// Estavam dentro de `view-panel.ts` até o lote 12. A casca de cebola saiu do
// painel e foi para a régua da linha do tempo (item 28), e os dois lugares
// precisam das mesmas linhas. Copiar as cinco funções seria criar dois campos
// de número que se parecem e não se comportam igual.

/** A titled group of rows, the same shape the Propriedades panel uses. */
export function group(title: string): HTMLFieldSetElement {
  const box = el('fieldset', 'prop-grupo');
  const legend = el('legend', 'prop-grupo-titulo', title);
  box.append(legend);
  return box;
}

/** One line: the written name on the left, the control on the right. */
export function row(label: string, control: HTMLElement, prefix = 'exibicao'): HTMLElement {
  const line = el('div', 'prop-linha');
  const text = el('label', 'prop-rotulo', label);
  // O prefixo separa dois lugares que usam a mesma linha: dois `id` iguais no
  // documento fariam o rótulo de um apontar para o campo do outro.
  const id = `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  control.id = id;
  text.htmlFor = id;
  line.append(text, control);
  return line;
}

/** A checkbox big enough to hit, with `accent-color` for a visible tick. */
export function checkbox(checked: boolean, onChange: (on: boolean) => void): HTMLInputElement {
  const input = el('input', 'prop-marca') as HTMLInputElement;
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  return input;
}

/**
 * A number field. Steps and limits come from the row that asked for it.
 *
 * Rodada 47, lote 3 (R7 do doc 68): é o número da casa (`campo-numero.ts`): conta, setas,
 * e o "abc" volta ao valor. Quem chama ganha a mesma caixa da ficha.
 */
export function numberField(
  value: number, min: number, max: number, step: number, onChange: (value: number) => void,
  nome = '', dica = '',
): HTMLInputElement {
  let atual = value;
  const { input } = campoNumero({
    nome, dica: dica === '' ? `${nome || 'Número'}, de ${min} a ${max}` : dica, min, max, passo: step,
    ler: () => atual,
    gravar: (v) => { atual = v; onChange(v); },
  });
  input.classList.add('prop-campo', 'prop-numero');
  return input;
}

/** A colour picker. */
export function colorField(value: string, onChange: (value: string) => void): HTMLInputElement {
  const input = el('input', 'prop-campo') as HTMLInputElement;
  input.type = 'color';
  input.value = value;
  input.addEventListener('input', () => onChange(input.value));
  return input;
}
