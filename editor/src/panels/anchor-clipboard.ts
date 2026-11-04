/**
 * Copiar e colar a âncora de um desenho (dono C) — item 33.
 *
 * A âncora é onde o desenho fica dentro do osso: `x`, `y`, `rotation`, `scaleX`
 * e `scaleY` do anexo (§7.1). Cinco números que se acertam de olho, arrastando,
 * e que depois precisam ser IGUAIS em cinco desenhos diferentes — as cinco mãos
 * de uma pele, as três cabeças de três peles, o mesmo cabelo em quatro roupas.
 *
 * Sem isto, igualar cinco mãos é ler cinco números de uma e digitar vinte e
 * cinco nas outras, com vinte e cinco chances de errar uma casa decimal.
 *
 * Não copia o TAMANHO da imagem (`width`, `height`), e é de propósito: duas
 * imagens diferentes têm tamanhos diferentes, e igualar isso deformaria o
 * desenho em vez de alinhá-lo. O que se quer repetir é a POSE do desenho no
 * osso, não a forma dele.
 *
 * Sem tela nenhuma aqui: o que este arquivo faz é ler cinco números e escrever
 * cinco números.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { findAttachment } from './properties-model.js';

/** Os cinco campos que viajam. Nesta ordem, que é a do painel. */
export const ANCHOR_FIELDS = Object.freeze([
  'x', 'y', 'rotation', 'scaleX', 'scaleY',
] as const);

export type AnchorField = typeof ANCHOR_FIELDS[number];

/** A âncora copiada: os cinco números, e de onde eles vieram. */
export interface Anchor {
  values: Record<AnchorField, number>;
  /** Só para a frase da barra de baixo: "âncora de mao_esq copiada". */
  from: string;
}

/** O valor de fábrica de cada campo, quando o anexo não escreve o campo. */
const DEFAULTS: Readonly<Record<AnchorField, number>> = Object.freeze({
  x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
});

/**
 * Lê a âncora de um desenho, ou `null` quando ele não existe.
 *
 * Campo ausente vira o valor de fábrica (§7.1): um anexo sem `rotation` está em
 * zero grau, e copiar dele tem de colar zero — e não "não mexa nisso".
 */
export function readAnchor(file: BoneFile, slot: string, attachment: string): Anchor | null {
  const found = findAttachment(file, slot, attachment);
  if (found === null) return null;
  const def = found.def as unknown as Record<string, unknown>;
  const values = {} as Record<AnchorField, number>;
  for (const field of ANCHOR_FIELDS) {
    const raw = def[field];
    values[field] = typeof raw === 'number' && Number.isFinite(raw) ? raw : DEFAULTS[field];
  }
  return { values, from: attachment };
}

/**
 * Escreve a âncora num desenho. Devolve `false` quando ele não existe.
 *
 * Escreve os cinco SEMPRE, inclusive os que valem o padrão. Um `rotation: 0`
 * escrito é maior no arquivo do que um `rotation` ausente, e é a única forma de
 * "colar" querer dizer a mesma coisa em todo desenho: se o campo padrão fosse
 * omitido, colar por cima de um desenho que já tinha 30 graus deixaria os 30.
 */
export function writeAnchor(
  file: BoneFile, slot: string, attachment: string, anchor: Anchor,
): boolean {
  const found = findAttachment(file, slot, attachment);
  if (found === null) return false;
  const def = found.def as unknown as Record<string, unknown>;
  for (const field of ANCHOR_FIELDS) def[field] = anchor.values[field];
  return true;
}

/** Cola a mesma âncora em vários desenhos. Devolve quantos aceitaram. */
export function pasteAnchor(
  file: BoneFile,
  targets: ReadonlyArray<{ slot: string; attachment: string }>,
  anchor: Anchor,
): number {
  let written = 0;
  for (const target of targets) {
    if (writeAnchor(file, target.slot, target.attachment, anchor)) written += 1;
  }
  return written;
}

/** A frase da barra de baixo, com os números que foram copiados. */
export function anchorLine(anchor: Anchor): string {
  const n = (value: number): string => (Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace('.', ','));
  const v = anchor.values;
  return `Âncora de ${anchor.from}: x ${n(v.x)} · y ${n(v.y)} · giro ${n(v.rotation)}°`
    + ` · escala ${n(v.scaleX)} × ${n(v.scaleY)}`;
}

// ---------------------------------------------------------------------------
// O passo de desfazer
// ---------------------------------------------------------------------------

/**
 * Colar a âncora, como um passo de desfazer — item 33.
 *
 * Guarda o que cada desenho tinha ANTES, um por um, e devolve exatamente isso
 * no desfazer. Guardar só "os cinco de antes" de um deles não serviria: cada
 * desenho tinha os seus, e cinco mãos desalinhadas estavam desalinhadas cada
 * uma do seu jeito.
 */
export class PasteAnchor implements Command {
  readonly label = 'Colar âncora';
  readonly kind: ChangeKind = 'structure';

  /**
   * O que cada desenho tinha antes, campo a campo — `undefined` para o campo
   * que NÃO existia no arquivo.
   *
   * Guardar os cinco números lidos não bastava: um anexo sem `rotation` está em
   * zero grau, e devolver `rotation: 0` no desfazer deixaria o arquivo
   * diferente do que era. Igual no jogo, diferente no disco — e desfazer tem de
   * devolver o arquivo, não um equivalente dele.
   */
  private before: Array<{
    slot: string; attachment: string; fields: Partial<Record<AnchorField, unknown>>;
  }> = [];

  constructor(
    private readonly targets: ReadonlyArray<{ slot: string; attachment: string }>,
    private readonly anchor: Anchor,
  ) {}

  /** Quantos desenhos este passo alinha. Para a frase da barra de baixo. */
  get count(): number {
    return this.targets.length;
  }

  apply(doc: EditorDoc): void {
    // Relido a cada `apply`, e não só no primeiro: refazer depois de desfazer
    // tem de guardar o estado de agora, que é o que o desfazer devolveu.
    this.before = [];
    for (const target of this.targets) {
      const found = findAttachment(doc.file, target.slot, target.attachment);
      if (found === null) continue;
      const def = found.def as unknown as Record<string, unknown>;
      const fields: Partial<Record<AnchorField, unknown>> = {};
      for (const field of ANCHOR_FIELDS) {
        if (field in def) fields[field] = def[field];
      }
      this.before.push({ ...target, fields });
    }
    pasteAnchor(doc.file, this.targets, this.anchor);
  }

  revert(doc: EditorDoc): void {
    for (const item of this.before) {
      const found = findAttachment(doc.file, item.slot, item.attachment);
      if (found === null) continue;
      const def = found.def as unknown as Record<string, unknown>;
      for (const field of ANCHOR_FIELDS) {
        if (field in item.fields) def[field] = item.fields[field];
        else delete def[field];
      }
    }
  }
}
