/**
 * **O Guarda-roupa** — a grade *peça × skin* (noite de 04/11/2026, ramo
 * `obra/skins`). As contas; o desenho mora em `skins-wardrobe.ts` (regra 8).
 *
 * *"Eu pedia algo, o Claude dizia que programava, mas o que eu pedia não
 * aparecia na tela"* — o Humberto, 04/11, citando o sistema de skin.
 *
 * Trocar a imagem de uma peça numa skin só se fazia pela Árvore → Propriedades
 * → Imagem, com o lápis aceso na skin certa. Nada na aba Skins levava lá. A
 * grade é o *Character Maps* do Spriter e a tela de roupa dos jogos: as peças
 * de um lado, as skins do outro, uma miniatura em cada casa. **A coluna em
 * que se clica é a que muda** — uma ideia, e não duas (lápis e olho).
 *
 * O formato não muda (regra 7): a casa lê `skins[].attachments[slot][placeholder]`
 * com os três vereditos de §4.4 — troca, ignora (a chave não existe) e
 * esconde (`null`).
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { Command, EditorDoc } from '../contract.js';
import { DuplicateSkin, RenameSkin, imageOf } from './skins-model.js';

/** A skin de todos: a base. */
const BASE = 'default';

/** Uma linha da grade: uma peça (o slot) e o desenho de partida dela. */
export interface WardrobePiece {
  /** O slot. */
  slot: string;
  /** O nome do desenho de partida no slot (o placeholder de §4.4). */
  placeholder: string;
}

/**
 * **As peças da grade**: os slots, na ordem do arquivo, cujo desenho de
 * partida mostra uma IMAGEM em alguma skin. Máscara, ponto, caixa e caminho
 * não vestem nada, e por isso não entram — numa grade de roupa seriam linhas
 * vazias que ninguém sabe o que são.
 *
 * O desenho de partida é o `attachment` do slot; sem ele, o primeiro nome que
 * alguma skin dá ao slot.
 */
export function wardrobePieces(file: BoneFile): WardrobePiece[] {
  const out: WardrobePiece[] = [];
  for (const slot of file.slots ?? []) {
    const placeholder = typeof slot.attachment === 'string'
      ? slot.attachment
      : firstName(file, slot.name);
    if (placeholder === null) continue;
    const mostra = (file.skins ?? []).some((skin) => {
      const def = skin.attachments?.[slot.name]?.[placeholder];
      return def !== undefined && def !== null && imageOf(placeholder, def) !== null;
    });
    if (mostra) out.push({ slot: slot.name, placeholder });
  }
  return out;
}

function firstName(file: BoneFile, slot: string): string | null {
  for (const skin of file.skins ?? []) {
    const nomes = Object.keys(skin.attachments?.[slot] ?? {});
    if (nomes.length > 0) return nomes[0]!;
  }
  return null;
}

/** O que uma casa da grade mostra. */
export type WardrobeCell =
  /** A skin põe esta imagem na peça. */
  | { kind: 'imagem'; image: string }
  /** A skin não mexe na peça: vale a de baixo (§4.4, "ignora"). */
  | { kind: 'base' }
  /** A skin esconde a peça (`null`). */
  | { kind: 'escondida' }
  /** A skin põe ali um desenho que não é imagem (uma entidade, uma caixa). */
  | { kind: 'outro'; text: string };

/** A casa `piece × skin`. A skin de fora (não está no arquivo) lê de `extra`. */
export function wardrobeCell(
  file: BoneFile, skin: string, piece: WardrobePiece,
  extra: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> = [],
): WardrobeCell {
  const pele = (file.skins ?? []).find((s) => s.name === skin)
    ?? extra.find((s) => s.name === skin);
  const porSlot = pele?.attachments?.[piece.slot] as Record<string, unknown> | undefined;
  if (porSlot === undefined || !Object.prototype.hasOwnProperty.call(porSlot, piece.placeholder)) {
    return { kind: 'base' };
  }
  const def = porSlot[piece.placeholder];
  if (def === null) return { kind: 'escondida' };
  const imagem = imageOf(piece.placeholder, def);
  if (imagem !== null) return { kind: 'imagem', image: imagem };
  const tipo = (def as { type?: string } | undefined)?.type ?? '?';
  return { kind: 'outro', text: tipo };
}

/** O texto curto da casa, para quem lê a grade sem miniatura (e para o leitor de tela). */
export function cellText(cell: WardrobeCell): string {
  switch (cell.kind) {
    case 'imagem': return cell.image;
    case 'base': return '= base';
    case 'escondida': return 'escondida';
    case 'outro': return cell.text;
  }
}

/** A dica da casa: o que ela é, e o que o clique faz. */
export function cellHint(cell: WardrobeCell, piece: WardrobePiece, skin: string, external: boolean): string {
  const oQue = skin === BASE
    ? (cell.kind === 'imagem' ? `${piece.slot} mostra "${cell.image}" na base, a de todos` : `${piece.slot} na base`)
    : cell.kind === 'imagem' ? `Com a skin "${skin}", ${piece.slot} mostra "${cell.image}"`
      : cell.kind === 'base' ? `A skin "${skin}" não mexe em ${piece.slot}: vale a de baixo`
        : cell.kind === 'escondida' ? `Com a skin "${skin}", ${piece.slot} some`
          : `Com a skin "${skin}", ${piece.slot} mostra um desenho que não é imagem (${cell.text})`;
  if (external) return `${oQue}. Esta skin vem de outro arquivo: mude-a lá`;
  return `${oQue}. Clique para trocar`;
}

/** Uma coluna da grade: uma skin, e como ela está vestida agora. */
export interface WardrobeColumn {
  name: string;
  /** Está na pilha (desenhada). */
  worn: boolean;
  /** É a única vestida além da base: o "Vestir só esta" já está feito. */
  only: boolean;
  /** É a do lápis. */
  editing: boolean;
  isDefault: boolean;
  /** Vem de outro arquivo (`assets.skins`): só se olha. */
  external: boolean;
}

/** As colunas: a base primeiro, depois as do arquivo, depois as de fora. */
export function wardrobeColumns(
  file: BoneFile, stack: readonly string[], editing: string | null, external: readonly string[] = [],
): WardrobeColumn[] {
  const daqui = (file.skins ?? []).map((s) => s.name);
  const nomes = [...daqui, ...external.filter((n) => !daqui.includes(n))];
  const vestidas = stack.filter((n) => n !== BASE);
  const ordem = [...nomes.filter((n) => n === BASE), ...nomes.filter((n) => n !== BASE)];
  return ordem.map((name) => ({
    name,
    worn: stack.includes(name),
    only: name === BASE ? vestidas.length === 0 && stack.includes(BASE) : vestidas.length === 1 && vestidas[0] === name,
    editing: name === editing,
    isDefault: name === BASE,
    external: !daqui.includes(name),
  }));
}

/**
 * **Vestir só esta**: a base embaixo, e esta em cima — nada mais. A base sempre
 * fica: sem ela o boneco perde as peças que a roupa não troca.
 */
export function wearOnlyStack(name: string): string[] {
  return name === BASE ? [BASE] : [BASE, name];
}

/**
 * **Por cima**: liga a skin no topo da pilha (ela vence), ou tira se já estava.
 * A base nunca sai por aqui: tirar a base é coisa da aba, com aviso.
 */
export function toggleOnTopStack(stack: readonly string[], name: string): string[] {
  if (name === BASE) return [...stack];
  return stack.includes(name) ? stack.filter((n) => n !== name) : [...stack, name];
}

/** A pilha da prova: o que a cena mostra enquanto o mouse está na coluna. */
export function previewStack(name: string): string[] {
  return wearOnlyStack(name);
}

/** O título da escolha de imagem — diz a peça E a skin (o defeito T3 do diagnóstico). */
export function chooserTitle(piece: WardrobePiece, skin: string): string {
  return skin === BASE
    ? `Trocar ${piece.slot} na base (vale para toda skin que não troca esta peça)`
    : `Trocar ${piece.slot} na skin "${skin}"`;
}

/** As frases do rodapé do Guarda-roupa — o que aconteceu de verdade (regra 21). */
export const WARDROBE_NOTICES = {
  wearOnly: (name: string): string => name === BASE
    ? 'Vestida só a base: o boneco sem roupa'
    : `Vestida só a skin "${name}", por cima da base`,
  onTop: (name: string, on: boolean): string => on
    ? `Skin "${name}" vestida por cima: onde ela troca, ela vence`
    : `Skin "${name}" tirada. As outras continuam`,
  external: (name: string): string =>
    `A skin "${name}" vem de outro arquivo: aqui só se olha e se veste. Para mudar, abra o arquivo dela`,
  noPieces: 'Nenhuma peça com imagem neste boneco: arraste uma imagem para a cena primeiro',
} as const;

/** A frase de ajuda do topo da janela. */
export const WARDROBE_HELP =
  'Cada coluna é uma skin (uma roupa). Clique numa casa para trocar a imagem daquela peça naquela skin. '
  + 'Mouse em cima da coluna: prova na cena, sem mudar nada.';

/**
 * **A linha de estado da aba** — o que está vestido e onde está o lápis, em
 * palavras (diagnóstico T6: o lápis, o olho e o × eram três ícones para três
 * ideias, e nenhum dizia o estado).
 */
export function skinStateLine(stack: readonly string[], editing: string | null): string {
  const vestidas = [...stack].reverse().filter((n) => n !== BASE);
  const roupa = vestidas.length === 0
    ? (stack.includes(BASE) ? 'Vestida: só a base' : 'Nada vestido')
    : `Vestida: ${vestidas.join(' + ')}`;
  return `${roupa} · Lápis: ${editing ?? 'base'}`;
}

/**
 * A cópia de uma skin já com o nome escolhido — **um** passo do desfazer.
 * `DuplicateSkin` dá o nome sozinho; o `RenameSkin` de dentro põe o pedido.
 */
export class DuplicateSkinNamed implements Command {
  readonly label = 'Nova skin a partir desta';
  readonly kind = 'structure' as const;
  private readonly copy: DuplicateSkin;
  private rename: RenameSkin | null = null;

  constructor(doc: EditorDoc, from: string, private readonly wanted: string) {
    this.copy = new DuplicateSkin(doc.file, from);
  }

  /** O nome que a cópia ficou tendo. */
  get name(): string {
    return this.rename?.to ?? this.copy.name;
  }

  apply(doc: EditorDoc): void {
    this.copy.apply(doc);
    const pedido = this.wanted.trim();
    if (pedido === '' || pedido === this.copy.name) return;
    this.rename ??= new RenameSkin(doc.file, this.copy.name, pedido);
    this.rename.apply(doc);
  }

  revert(doc: EditorDoc): void {
    this.rename?.revert(doc);
    this.copy.revert(doc);
  }
}


/**
 * **As imagens que vieram junto com a skin de fora** — diagnóstico T9.
 *
 * Quem escolhe `capacete-skin.bone` E `capacete.png` no mesmo seletor espera
 * que a imagem entre junto. Ela entrava no mapa de imagens do arquivo aberto e
 * ficava lá: a skin pedia "capacete", o atlas não tinha, e a cabeça sumia com
 * dois avisos. Aqui se casa o que a skin pede (o `path` de cada desenho que
 * nenhum atlas tem) com o nome do arquivo escolhido: `capacete` casa com
 * `capacete.png`, e `elmos/capacete` também (pelo fim do caminho).
 *
 * Devolve os pares `{ path, key }`: `path` é o nome que a skin pede, `key` é a
 * chave do arquivo escolhido. O que a skin pede e não veio fica de fora —
 * quem diz isso é o carregador, imagem por imagem (regra 21).
 */
export function skinImagesToBring(
  file: BoneFile, inAtlas: (name: string) => boolean, picked: readonly string[],
): Array<{ path: string; key: string }> {
  const pedidas = new Set<string>();
  for (const skin of file.skins ?? []) {
    for (const porSlot of Object.values(skin.attachments ?? {})) {
      for (const [nome, def] of Object.entries(porSlot ?? {})) {
        const imagem = imageOf(nome, def);
        if (imagem !== null && !inAtlas(imagem)) pedidas.add(imagem);
      }
    }
  }
  const semExtensao = (key: string): string => key.replace(/\.[^./\\]+$/, '');
  const fim = (caminho: string): string => caminho.split('/').pop() ?? caminho;
  const out: Array<{ path: string; key: string }> = [];
  for (const path of pedidas) {
    const key = picked.find((k) => semExtensao(k) === path)
      ?? picked.find((k) => fim(semExtensao(k)) === fim(path));
    if (key !== undefined) out.push({ path, key });
  }
  return out;
}

/** A frase de quanto veio junto. Vazia quando não veio nada. */
export function broughtImagesNotice(made: readonly string[], missing: readonly string[]): string {
  const partes: string[] = [];
  if (made.length > 0) {
    partes.push(made.length === 1 ? `A imagem "${made[0]!}" entrou junto` : `${made.length} imagens entraram junto (${made.join(', ')})`);
  }
  if (missing.length > 0) {
    partes.push(`${missing.length === 1 ? 'uma imagem não abriu' : `${missing.length} imagens não abriram`}: ${missing.join(', ')}`);
  }
  return partes.join('; ');
}
