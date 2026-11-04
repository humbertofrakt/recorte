/**
 * A chave de sequência de imagens — degrau 6, tarefa 6.6 (17/09/2026).
 *
 * Spec 7.10 (`Sequence`, dentro do anexo) e 9.6 (a timeline `sequence`).
 * `programa-novo/05`, **G12**, palavra do Humberto (RESPOSTAS lote 2, Q12):
 * *"chave de sequência de imagens (a boca: uma chave para cada vez que a
 * imagem muda) — **como opção**"*.
 *
 * "Como opção" é o que este módulo faz. A sequência já existia no formato e no
 * runtime, e o alvo `sequence` já existia em `keying.ts`: o que não existia era
 * **porta**. Quem quisesse fazer a boca falar tinha de escrever a timeline à
 * mão no `.bone`. Agora é um item no botão direito da linha do desenho.
 *
 * Por que uma chave só, e não uma por imagem: a sequência é uma **função do
 * tempo** (7.10), como tudo neste formato. Uma chave diz *"a partir daqui,
 * modo `loop`, começando no quadro 2, um quadro a cada 0,08 s"*, e o runtime
 * calcula o resto. Gravar uma chave por troca de imagem daria a mesma boca com
 * trinta chaves para arrastar — que é justamente o trabalho que a sequência
 * existe para tirar.
 *
 * Módulo do degrau 1 (`anim/`): puro, sem DOM.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { valueAt } from './keying.js';

// ---------------------------------------------------------------------------
// Os sete modos (7.10, 9.6)
// ---------------------------------------------------------------------------

/** Um modo de tocar a sequência, com o que se lê dele na tela. */
export interface SequenceMode {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
}

/**
 * Os sete modos da spec 9.6, na ordem em que se escolhem.
 *
 * `hold` é o padrão e o primeiro: ele é "nenhum movimento", e é o que a chave
 * faz quando alguém só quer **trocar a imagem** num instante — que é metade do
 * uso real (a boca de uma fala é uma fila de `hold`).
 */
export const SEQUENCE_MODES: readonly SequenceMode[] = Object.freeze([
  { id: 'hold', label: 'Segurar', hint: 'Fica na imagem escolhida, parada, até a próxima chave' },
  { id: 'once', label: 'Uma vez', hint: 'Anda até a última imagem e para nela' },
  { id: 'loop', label: 'Repetir', hint: 'Anda até o fim e recomeça da primeira, sem parar' },
  { id: 'pingpong', label: 'Vai e volta', hint: 'Anda até o fim, volta até o começo, e assim por diante' },
  { id: 'onceReverse', label: 'Uma vez, de trás', hint: 'Anda de trás para a frente e para na primeira' },
  { id: 'loopReverse', label: 'Repetir de trás', hint: 'Anda de trás para a frente, e recomeça do fim' },
  { id: 'pingpongReverse', label: 'Vai e volta, de trás', hint: 'Como o vai e volta, começando pelo fim' },
]);

/** O padrão de 9.6 quando a chave não escreve `mode`. */
export const DEFAULT_SEQUENCE_MODE = 'hold';

/** O rótulo de um modo, ou o próprio id quando ele é desconhecido. */
export function sequenceModeLabel(id: string): string {
  return SEQUENCE_MODES.find((mode) => mode.id === id)?.label ?? id;
}

// ---------------------------------------------------------------------------
// Achar o desenho e a sequência dele
// ---------------------------------------------------------------------------

/** Vista frouxa de um anexo com `sequence` (7.10). */
interface SequenceHolder {
  sequence?: { count?: number; frames?: string[]; start?: number; digits?: number; setup?: number };
}

/**
 * O placeholder que o slot está mostrando em `time`.
 *
 * Com uma animação aberta, a timeline `slot/attachment` manda; sem chave para
 * ela, vale o `attachment` do setup (5.1). `null` = o slot está vazio.
 */
export function activeAttachmentOf(
  file: BoneFile, animation: string | null, time: number, slot: string,
): string | null {
  if (animation !== null) {
    const keyed = valueAt(file, animation, time, { type: 'slot', target: slot, property: 'attachment' });
    if (keyed !== undefined) return typeof keyed === 'string' ? keyed : null;
  }
  const setup = (file.slots ?? []).find((s) => s.name === slot)?.attachment;
  return typeof setup === 'string' ? setup : null;
}

/** Quantas imagens uma sequência tem (7.10): `frames.length` manda sobre `count`. */
export function sequenceCount(sequence: SequenceHolder['sequence']): number {
  if (sequence === undefined) return 0;
  if (Array.isArray(sequence.frames)) return sequence.frames.length;
  return typeof sequence.count === 'number' ? sequence.count : 0;
}

/**
 * A sequência do placeholder, com a skin em que ele foi achado — ou `null`.
 *
 * Procura nas skins na ordem do arquivo, que é a ordem que 9.6 usa para casar
 * `deform` com skin quando as duas não batem. Um placeholder **sem**
 * `sequence` devolve `null`, e é isso que faz o menu dizer por que está cinza
 * em vez de gravar uma chave que o runtime recusaria (L1 de 9.6).
 */
export function findSequence(
  file: BoneFile, slot: string, attachment: string,
): { skin: string; count: number; setup: number } | null {
  for (const skin of file.skins ?? []) {
    const def = skin.attachments?.[slot]?.[attachment] as SequenceHolder | null | undefined;
    const sequence = def?.sequence;
    if (sequence === undefined) continue;
    const count = sequenceCount(sequence);
    if (count < 1) continue;
    return { skin: skin.name, count, setup: typeof sequence.setup === 'number' ? sequence.setup : 0 };
  }
  return null;
}

// ---------------------------------------------------------------------------
// O valor da chave
// ---------------------------------------------------------------------------

/** O `value` de uma chave `sequence` (9.6). */
export interface SequenceKeyValue {
  mode?: string;
  index?: number;
  delay?: number;
}

/**
 * O valor da chave, com os campos que valem o padrão deixados de fora.
 *
 * Um arquivo não deve carregar um campo que diz o que o padrão já diz: é
 * ruído para quem lê o `.bone` à mão, e o `mode: "hold"` escrito num arquivo
 * onde nada anda seria justamente isso. `index` é preso a `0..count-1`, e um
 * `delay` negativo vira zero — 9.6 diz que `0` equivale a `hold`.
 */
export function sequenceKeyValue(
  mode: string, index: number, delay: number, count: number,
): SequenceKeyValue {
  const value: SequenceKeyValue = {};
  if (mode !== DEFAULT_SEQUENCE_MODE) value.mode = mode;
  const limite = Math.max(0, count - 1);
  const frame = Math.min(limite, Math.max(0, Math.round(Number.isFinite(index) ? index : 0)));
  if (frame !== 0) value.index = frame;
  const espera = Math.max(0, Number.isFinite(delay) ? delay : 0);
  if (espera !== 0) value.delay = espera;
  return value;
}

/**
 * A frase do rodapé depois de gravar — o que a chave vai fazer, em palavras.
 *
 * O rodapé diz o que se gravou, e não só "pronto": uma chave de sequência é
 * invisível na cena até o tocador andar, e sem a frase não há como conferir
 * que o modo escolhido foi o que entrou.
 */
export function describeSequenceKey(
  attachment: string, value: SequenceKeyValue, count: number, time: number,
): string {
  const mode = value.mode ?? DEFAULT_SEQUENCE_MODE;
  const frame = value.index ?? 0;
  const delay = value.delay ?? 0;
  const quando = `${time.toFixed(2).replace('.', ',')} s`;
  const inicio = `${attachment}: ${sequenceModeLabel(mode).toLowerCase()} a partir da imagem `
    + `${frame + 1} de ${count}, em ${quando}`;
  if (mode === DEFAULT_SEQUENCE_MODE || delay === 0) {
    return `${inicio} — parada nessa imagem até a próxima chave`;
  }
  return `${inicio}, uma imagem a cada ${String(delay).replace('.', ',')} s`;
}

/** O recado quando o desenho escolhido não é uma sequência — regra 21. */
export function noSequenceNotice(attachment: string | null): string {
  if (attachment === null) {
    return 'Este slot não está mostrando desenho nenhum neste instante.';
  }
  return `O desenho "${attachment}" não é uma sequência de imagens: ele não tem o campo `
    + '`sequence` (spec 7.10). Uma chave de sequência num desenho comum seria recusada ao ler.';
}
