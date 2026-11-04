/**
 * A janela **Definir pivô…** (dono C) — lote 58, plano pivô.
 *
 * Para a imagem que ainda não tem rig: desenhada fora do quadro, solta, sem
 * nenhum desenho que diga onde ela encaixa. Mostra a imagem inteira, com a
 * cruz no pivô de hoje; um clique na articulação põe a cruz ali, e os nove
 * pontos (cantos, meios, centro) acertam de uma vez os casos comuns.
 *
 * Mesmo jeito das janelas de `ui/dialog.ts`: título em palavras, cada botão
 * diz o que faz, `Esc` e clique fora valem por "não", `Enter` grava. As duas
 * teclas param aqui (tecla tratada uma vez).
 */

import { NINE_POINTS, ninePoint, pivotFromClick, roundPivot } from '../io/pivot-model.js';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4.
import { el } from '../ui/dom.js';

export interface PivotDialogOptions {
  /** O nome da imagem, para o título. */
  image: string;
  /** Tamanho da imagem original, em px do atlas. */
  ow: number;
  oh: number;
  /** O pivô de hoje (o centro, quando a região não tem). */
  pivot: { x: number; y: number };
  /** Quantos desenhos usam a imagem (e ficam parados: rodada 13). */
  users: number;
  /** Os pixels da imagem original, ou `null` quando ela não carregou. */
  picture: { width: number; height: number; data: ArrayLike<number> } | null;
  /**
   * A caixa **Repetir para a pasta** — lote 61. `folder` vazio é a raiz: a
   * caixa aparece desligada, dizendo por quê. Ausente, a caixa não aparece.
   */
  repeat?: { folder: string; count: number };
  host?: HTMLElement;
}

/** A resposta da janela: o pivô, e se ele vai para a pasta inteira. */
export interface PivotAnswer {
  x: number;
  y: number;
  repeat: boolean;
}

/**
 * A frase da caixa Repetir para a pasta, e se ela pode ser ligada — lote 61.
 * Puro, para o teste sem navegador.
 */
export function repeatLabel(repeat: { folder: string; count: number }): { text: string; enabled: boolean } {
  if (repeat.folder === '') {
    return { text: 'Repetir para a pasta: esta imagem está na raiz, sem subpasta. A raiz não é um grupo', enabled: false };
  }
  if (repeat.count <= 1) {
    return { text: `Repetir para a pasta ${repeat.folder}: ela é a única imagem da pasta`, enabled: false };
  }
  return {
    text: `Repetir para a pasta ${repeat.folder} (${repeat.count} imagens): `
      + 'mesmo tamanho, mesmo pixel; tamanho diferente, mesma proporção',
    enabled: true,
  };
}

/**
 * **O ajuste fino por teclado** — lote 3 da rodada final (29/09/2026).
 *
 * A auditoria de 27/09 achou a janela só de clique. O Spriter não diz se a
 * dele tem teclado; o Spine tem, em todo campo de número: setas, e Shift para
 * o passo menor (*Tools, Numeric entry*). Aqui o passo é em **px da imagem**,
 * e o Shift é o passo GRANDE — a cruz já nasce no pixel, e o que falta é
 * atravessar a imagem sem cem toques. Suposição aceita pelo Planejador.
 */
export const NUDGE_STEP = 1;
export const NUDGE_BIG = 10;
export const NUDGE_HINT = 'Setas: 1 px · Shift+setas: 10 px';

/**
 * A cruz depois de uma seta, ou `null` quando a tecla não é seta. O y do pivô
 * conta de BAIXO: a seta para cima SOMA. Não prende na borda: o pivô pode
 * cair fora do desenho (o ombro de uma manga curta), como no clique.
 */
export function nudgePivot(
  pivot: { x: number; y: number }, key: string, shift: boolean,
): { x: number; y: number } | null {
  const step = shift ? NUDGE_BIG : NUDGE_STEP;
  switch (key) {
    case 'ArrowLeft': return { x: pivot.x - step, y: pivot.y };
    case 'ArrowRight': return { x: pivot.x + step, y: pivot.y };
    case 'ArrowUp': return { x: pivot.x, y: pivot.y + step };
    case 'ArrowDown': return { x: pivot.x, y: pivot.y - step };
    default: return null;
  }
}

/**
 * O clique cai no pixel inteiro. A prévia mostra a imagem ampliada, e o clique
 * de tela dava `1,8381` no rodapé — um número que ninguém lê e que nenhum
 * pixel tem. Os nove pontos não passam por aqui: o meio de 25 px é 12,5.
 */
export function snapPivot(pivot: { x: number; y: number }): { x: number; y: number } {
  return { x: Math.round(pivot.x), y: Math.round(pivot.y) };
}

/**
 * **A linha do tamanho** — rodada 44, lote 3 (06/10/2026). A janela dizia
 * "X 35 · Y 16,5 — px da imagem", sem dizer o tamanho da imagem: não se
 * sabia onde ficava o meio nem a borda. Agora a faixa está escrita.
 */
export function pivotSizeLine(ow: number, oh: number): string {
  const n = (v: number): string => String(roundPivot(v)).replace('.', ',');
  return `Imagem de ${n(ow)} × ${n(oh)} px. X de 0 a ${n(ow)}, Y de 0 a ${n(oh)}, contados da esquerda e de baixo; `
    + `fora disso também vale (o ombro de uma manga curta). ${NUDGE_HINT}`;
}

/**
 * O aviso do campo que não é número — rodada 44, lote 5 (doc 63): "abc" no X
 * e Gravar fechava a janela com o pivô de antes, sem dizer nada. Agora a
 * janela fica aberta e diz, como a ficha faz. `null` = os dois campos valem.
 */
export function pivotFieldProblem(x: string, y: string): string | null {
  const ruins = ([['X', x], ['Y', y]] as const).filter(([, v]) => parsePivotField(v) === null);
  if (ruins.length === 0) return null;
  const quais = ruins.map(([eixo, v]) => `${eixo} "${v.trim()}"`).join(' e ');
  return `${quais} não ${ruins.length === 1 ? 'é número' : 'são números'}. Escreva em px, como 12 ou 12,5`;
}

/** Um campo de pivô digitado: aceita vírgula; `null` quando não é número. */
export function parsePivotField(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (t === '' || t === '-' ) return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}

/**
 * O fim do rodapé depois de gravar o pivô — rodada 44, lote 3. O desenho fica
 * parado (rodada 13), e por isso parecia que nada tinha acontecido: o pivô vale
 * na **próxima troca**, quando esta imagem entra no lugar de outra.
 */
export const PIVOT_NEXT_SWAP = '. Quando esta imagem entrar numa troca, ela cai com este ponto no osso';

/** O maior quadro em que a imagem é mostrada, em px de tela. */
const MAX_W = 320;
const MAX_H = 240;

/**
 * A frase de baixo do título.
 *
 * Rodada 13, conserto 2 da conferência: dizia *"será recolocado pelo pivô
 * novo"* — o comportamento de antes. Desde a rodada 13 nenhum desenho anda:
 * só o ponto do pivô muda de lugar.
 */
export function pivotLead(users: number): string {
  if (users === 0) return 'Nenhum desenho usa esta imagem ainda. O pivô fica gravado para quando ela entrar.';
  return users === 1
    ? '1 desenho usa esta imagem. Ele fica parado: só o ponto do pivô muda de lugar.'
    : `${users} desenhos usam esta imagem. Eles ficam parados: só o ponto do pivô muda de lugar.`;
}

/** Pergunta o pivô e espera. `null` quando a pessoa desiste. */
export function askPivot(options: PivotDialogOptions): Promise<PivotAnswer | null> {
  const host = options.host ?? document.body;
  const { ow, oh, picture } = options;
  let current = { ...options.pivot };

  const zoom = Math.min(MAX_W / Math.max(1, ow), MAX_H / Math.max(1, oh), 8);
  const canvas = el('canvas', 'pivo-quadro');
  canvas.width = Math.max(1, Math.round(ow * zoom));
  canvas.height = Math.max(1, Math.round(oh * zoom));
  const dica = `Clique na articulação: é ali que o osso segura esta imagem. ${NUDGE_HINT}`;
  canvas.title = dica;
  canvas.setAttribute('aria-label', dica);

  const leitura = el('p', 'pivo-leitura dialog-lead');
  const texto = (v: number): string => String(roundPivot(v)).replace('.', ',');
  // Rodada 44, lote 3: os números se digitam, em px, com a faixa na dica.
  const campos = el('div', 'pivo-campos');
  const campo = (eixo: 'X' | 'Y', max: number): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.className = 'pivo-campo';
    input.title = `${eixo} do pivô, em px da imagem, de 0 a ${texto(max)}, contado da ${eixo === 'X' ? 'esquerda' : 'base'}. `
      + 'Fora da faixa também vale';
    input.setAttribute('aria-label', input.title);
    input.addEventListener('input', () => {
      const v = parsePivotField(input.value);
      if (v === null) return;
      current = eixo === 'X' ? { x: v, y: current.y } : { x: current.x, y: v };
      draw();
    });
    const rotulo = el('label', 'pivo-campo-rotulo');
    rotulo.append(el('span', '', eixo), input, el('span', '', 'px'));
    campos.append(rotulo);
    return input;
  };
  const campoX = campo('X', ow);
  const campoY = campo('Y', oh);

  // A imagem vai uma vez para um canvas fora da tela; cada redesenho só amplia.
  let art: HTMLCanvasElement | null = null;
  if (picture !== null) {
    art = document.createElement('canvas');
    art.width = picture.width;
    art.height = picture.height;
    art.getContext('2d')?.putImageData(
      new ImageData(new Uint8ClampedArray(picture.data), picture.width, picture.height), 0, 0,
    );
  }

  const draw = (): void => {
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (art !== null) {
      ctx.imageSmoothingEnabled = zoom < 1;
      ctx.drawImage(art, 0, 0, w, h);
    }
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.9)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    // O pivô pode cair fora do desenho: a cruz fica na borda, do lado dele.
    const at = {
      x: Math.min(w - 4, Math.max(4, (current.x / Math.max(1, ow)) * w)),
      y: Math.min(h - 4, Math.max(4, h - (current.y / Math.max(1, oh)) * h)),
    };
    const arm = 10;
    ctx.lineCap = 'round';
    for (const [color, width] of [['rgba(0, 0, 0, 0.85)', 4], ['#ff9a1f', 2]] as const) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(at.x - arm, at.y);
      ctx.lineTo(at.x + arm, at.y);
      ctx.moveTo(at.x, at.y - arm);
      ctx.lineTo(at.x, at.y + arm);
      ctx.stroke();
    }
    leitura.textContent = pivotSizeLine(ow, oh);
    // Quem está digitando não tem o texto trocado debaixo do cursor.
    if (document.activeElement !== campoX) campoX.value = texto(current.x);
    if (document.activeElement !== campoY) campoY.value = texto(current.y);
  };

  canvas.addEventListener('click', (event) => {
    const box = canvas.getBoundingClientRect();
    current = snapPivot(pivotFromClick(event.clientX - box.left, event.clientY - box.top, box.width, box.height, ow, oh));
    draw();
  });

  const grade = el('div', 'pivo-grade');
  grade.setAttribute('role', 'group');
  grade.setAttribute('aria-label', 'Os nove pontos da imagem');
  for (const point of NINE_POINTS) {
    const botao = el('button', 'pivo-ponto', point.glyph);
    botao.type = 'button';
    botao.title = `Pivô no ${point.label.toLowerCase()}`;
    botao.setAttribute('aria-label', botao.title);
    botao.addEventListener('click', () => {
      current = ninePoint(point.id, ow, oh);
      draw();
    });
    grade.append(botao);
  }

  const corpo = el('div', 'pivo-corpo');
  corpo.append(canvas, grade);

  // Lote 61: Repetir para a pasta, ligada por padrão quando a imagem está numa
  // subpasta com outras. Na raiz, desligada, e a frase diz por quê.
  let caixa: HTMLInputElement | null = null;
  let linhaPasta: HTMLElement | null = null;
  if (options.repeat !== undefined) {
    const como = repeatLabel(options.repeat);
    linhaPasta = el('label', 'pivo-pasta');
    caixa = document.createElement('input');
    caixa.type = 'checkbox';
    caixa.className = 'prop-marca';
    caixa.checked = como.enabled;
    caixa.disabled = !como.enabled;
    linhaPasta.title = como.text;
    linhaPasta.append(caixa, el('span', 'pivo-pasta-texto', como.text));
  }

  const yes = el('button', 'dialog-close', 'Gravar o pivô');
  yes.type = 'button';
  // Rodada 44, lote 3: o caminho que não grava não tem a cor do que grava.
  const no = el('button', 'dialog-close dialog-secundario', 'Deixar como está');
  no.type = 'button';
  const buttons = el('div', 'dialog-buttons');
  buttons.append(yes, no);

  const title = `Definir pivô de "${options.image}"`;
  const box = el('div', 'dialog-box pivo-janela');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', title);
  box.append(
    el('h2', 'dialog-title', title),
    el('p', 'dialog-lead', pivotLead(options.users)),
    corpo, campos, leitura,
  );
  if (linhaPasta !== null) box.append(linhaPasta);
  box.append(buttons);
  const root = el('div', 'dialog-veil');
  root.append(box);
  draw();

  return new Promise((resolve) => {
    let open = true;
    const answer = (): PivotAnswer => ({ ...current, repeat: caixa?.checked === true });
    const finish = (value: PivotAnswer | null): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(value);
    };
    function onKey(event: KeyboardEvent): void {
      // As setas andam a cruz, e param aqui: com a janela aberta elas não são
      // do quadro da linha do tempo (tecla tratada uma vez).
      const nudged = nudgePivot(current, event.key, event.shiftKey);
      if (nudged !== null) {
        event.preventDefault();
        event.stopPropagation();
        current = nudged;
        draw();
        return;
      }
      if (event.key !== 'Escape' && event.key !== 'Enter') return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Enter') gravar();
      else finish(null);
    }
    // Rodada 44, lote 5 (doc 63): campo que não é número não grava calado.
    function gravar(): void {
      const problema = pivotFieldProblem(campoX.value, campoY.value);
      if (problema === null) {
        finish(answer());
        return;
      }
      leitura.textContent = problema;
      leitura.classList.add('pivo-leitura-erro');
      (parsePivotField(campoX.value) === null ? campoX : campoY).focus();
    }
    yes.addEventListener('click', () => gravar());
    no.addEventListener('click', () => finish(null));
    root.addEventListener('pointerdown', (event) => {
      if (event.target === root) finish(null);
    });
    document.addEventListener('keydown', onKey, true);
    host.append(root);
    yes.focus();
  });
}
