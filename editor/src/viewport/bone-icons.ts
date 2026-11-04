/**
 * The short list of bone icons — requirement R2.
 *
 * The `.bone` format already has the field: `bones[].icon`, a string, spec 4.2
 * ("Ícone no editor"). So nothing new is invented here and nothing is hidden in
 * an `extensions` block: the icon the artist picks is a first-class field of the
 * file, and any other editor reading the format sees it.
 *
 * WHY A SHORT LIST AND NOT FREE TEXT
 * A free string would let two files disagree about what "hand" means and would
 * put a spelling task in front of a dyslexic user. Eleven entries, each with a
 * word the user reads and one glyph the viewport draws, is a menu — no typing,
 * no abbreviation, and the word is always there next to the picture.
 *
 * The glyph is drawn with `fillText`, so it needs no image file and no atlas.
 * An icon the file names but this list does not know is drawn as its own first
 * letter, which is better than drawing nothing.
 */

/** One entry of the menu. `id` is what goes in the file. */
export interface BoneIcon {
  readonly id: string;
  /** What the user reads, in Portuguese. */
  readonly label: string;
  /** One character drawn next to the bone. */
  readonly glyph: string;
}

/** The menu, in the order it is shown. The first entry means "no icon". */
export const BONE_ICONS: readonly BoneIcon[] = Object.freeze([
  { id: '', label: 'Nenhum', glyph: '' },
  { id: 'raiz', label: 'Raiz', glyph: '⌂' },
  { id: 'quadril', label: 'Quadril', glyph: '▬' },
  { id: 'coluna', label: 'Coluna', glyph: '│' },
  { id: 'cabeca', label: 'Cabeça', glyph: '☺' },
  { id: 'braco', label: 'Braço', glyph: '╱' },
  { id: 'mao', label: 'Mão', glyph: '✋' },
  { id: 'perna', label: 'Perna', glyph: '╲' },
  { id: 'pe', label: 'Pé', glyph: '▄' },
  { id: 'alvo', label: 'Alvo de IK', glyph: '✚' },
  { id: 'ik', label: 'Regra de IK', glyph: '◈' },
  { id: 'auxiliar', label: 'Auxiliar', glyph: '◇' },
] as const);

/** The glyph an icon name draws, or its first letter, or `''` for none. */
export function boneIconGlyph(icon: string | null | undefined): string {
  if (icon === null || icon === undefined || icon === '') return '';
  const known = BONE_ICONS.find((entry) => entry.id === icon);
  if (known !== undefined) return known.glyph;
  return icon.slice(0, 1).toUpperCase();
}

/** The word the user reads for an icon name, or the name itself. */
export function boneIconLabel(icon: string | null | undefined): string {
  if (icon === null || icon === undefined || icon === '') return 'Nenhum';
  return BONE_ICONS.find((entry) => entry.id === icon)?.label ?? icon;
}

/** The colour the format assumes for a bone with no `color` (spec 4.2). */
export const DEFAULT_BONE_COLOR: readonly [number, number, number, number] =
  Object.freeze([0.61, 0.61, 0.61, 1] as const);

/**
 * A bone colour as a CSS string.
 *
 * The alpha is deliberately floored: a bone painted with alpha 0 would vanish
 * from the viewport and the artist would have no way to select it again. The
 * colour is an editor guide, never a pixel of the drawing.
 */
export function boneColorCss(color: readonly number[] | null | undefined): string {
  const c = color ?? DEFAULT_BONE_COLOR;
  const byte = (value: number | undefined): number =>
    Math.max(0, Math.min(255, Math.round((value ?? 0) * 255)));
  const alpha = Math.max(0.35, Math.min(1, c[3] ?? 1));
  return `rgba(${byte(c[0])}, ${byte(c[1])}, ${byte(c[2])}, ${alpha})`;
}
