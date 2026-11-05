/**
 * **Marcar a imagem como slot: ela vira uma base** — rodada 9 (05/10/2026).
 *
 * A decisão do Humberto (`02`, seção 2, regra 2): *"eu marco uma imagem como
 * slot, e ela vira uma base dentro do projeto. Ganha nome (fácil de achar) e
 * animações próprias. Não é o que permite a troca: é o que dá nome e
 * animações."*
 *
 * Por dentro, nada de novo no formato:
 *
 * | O quê | Como |
 * |:---|:---|
 * | a base nova | um `.bone` do projeto (`<nome>.bone`), com a raiz e UM slot com a imagem dentro |
 * | no boneco | o anexo vira `skeleton` com o `uri` dela (7.11), pelo `SwapForEntity`: o mesmo lugar, a mesma ordem, as mesmas chaves |
 * | o nome | o slot do boneco passa a se chamar como a base (`renameSlotEverywhere`, que leva as chaves junto) |
 * | o que é só do editor | a marca, com o nome de antes do slot, no `RECORTE_editor_state` do anexo, ao lado da imagem de antes |
 *
 * **Nada muda no desenho.** A raiz da base nova cai no pivô da imagem
 * (`T(pino) R S`, como o `SwapForEntity` escreve), e a imagem, dentro dela,
 * fica em `S⁻¹ R⁻¹ (xy − pino)`, sem giro nem escala: a conta composta dá o
 * mesmo ponto para cada canto.
 */

import { findAtlasRegion } from '../../../runtime/src/index.js';
import type { AtlasData, BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { EDITOR_EXTENSION, corpoDe } from '../contract.js';
import { createEmptyFile } from '../doc/new-file.js';
import { Doc } from '../doc/document.js';
import { projetoDe } from '../doc/projeto.js';
import { renameSlotEverywhere } from './rename.js';
import { SwapForEntity, TakeOutEntity, gridTarget, imageBeforeOf, pickerTarget } from './image-picker-model.js';
import type { PickerTarget } from './image-picker-model.js';
import { imageOf } from './skins-model.js';

/** A chave da marca dentro de `RECORTE_editor_state` do anexo. */
export const SLOT_MARK = 'slotMarcado';

/** A marca: o nome que a base ganhou, e o nome do slot antes de marcar. */
export interface SlotMark {
  nome: string;
  slotDeAntes: string;
}

type Def = Record<string, unknown>;
type SkinsFile = { skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> };

/** A marca do anexo, ou `null`. */
export function slotMarkOf(def: Def | null | undefined): SlotMark | null {
  const ext = (def?.['extensions'] as Def | undefined)?.[EDITOR_EXTENSION] as Def | undefined;
  const mark = ext?.[SLOT_MARK] as Partial<SlotMark> | undefined;
  return mark !== undefined && typeof mark.nome === 'string' && typeof mark.slotDeAntes === 'string'
    ? { nome: mark.nome, slotDeAntes: mark.slotDeAntes }
    : null;
}

/** O `.bone` da base que nasce do slot. */
export function slotBaseUri(nome: string): string {
  return `${nome}.bone`;
}

/**
 * Onde a imagem fica dentro da base nova: `S⁻¹ R⁻¹ (xy − pino)`, sem giro e
 * sem escala. `null` quando a escala é zero (não há volta).
 */
export function innerImageDef(def: Def, pin: { x: number; y: number }): Def | null {
  const sx = typeof def['scaleX'] === 'number' ? def['scaleX'] : 1;
  const sy = typeof def['scaleY'] === 'number' ? def['scaleY'] : 1;
  if (sx === 0 || sy === 0) return null;
  const rot = typeof def['rotation'] === 'number' ? def['rotation'] : 0;
  const dx = (typeof def['x'] === 'number' ? def['x'] : 0) - pin.x;
  const dy = (typeof def['y'] === 'number' ? def['y'] : 0) - pin.y;
  const r = (-rot * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const inner = JSON.parse(JSON.stringify(def)) as Def;
  for (const key of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'extensions']) delete inner[key];
  const x = (dx * cos - dy * sin) / sx;
  const y = (dx * sin + dy * cos) / sy;
  const limpo = (v: number): number => (Math.abs(v) < 1e-9 ? 0 : Math.round(v * 1e6) / 1e6);
  if (limpo(x) !== 0) inner['x'] = limpo(x);
  if (limpo(y) !== 0) inner['y'] = limpo(y);
  return inner;
}

/**
 * O arquivo da base nova: a raiz, um slot com o nome dela, a imagem dentro.
 *
 * `slotDeAntes` é o slot do boneco: o `darkColor` e o `blend` dele vêm para o
 * slot de dentro, porque a spec (7.11, `inheritColor`) passa ao filho só a cor
 * CLARA do slot pai — sem isto, o contorno escuro do cabelo do herói sumia.
 */
export function slotBaseFile(nome: string, attachment: string, inner: Def, assets: unknown, slotDeAntes: Def | null = null): BoneFile {
  const file = createEmptyFile(nome);
  const slot: Def = { name: nome, bone: 'root', attachment };
  for (const key of ['darkColor', 'blend']) {
    if (slotDeAntes?.[key] !== undefined) slot[key] = JSON.parse(JSON.stringify(slotDeAntes[key]));
  }
  file.slots = [slot as never];
  file.skins = [{ name: 'default', attachments: { [nome]: { [attachment]: inner } } } as never];
  const atlases = (assets as { atlases?: unknown } | undefined)?.atlases;
  if (Array.isArray(atlases) && atlases.length > 0) {
    (file as { assets?: unknown }).assets = { atlases: JSON.parse(JSON.stringify(atlases)) };
  }
  return file;
}

/** O desenho que o gesto pega na seleção: um desenho só, ou um slot só. */
export function shownOfSelection(doc: EditorDoc): { slot: string; attachment: string } | null {
  const corpo = corpoDe(doc);
  const one = doc.selection.attachments.length === 1 ? doc.selection.attachments[0]! : null;
  if (one !== null) return one;
  if (doc.selection.slots.length !== 1) return null;
  const slot = doc.selection.slots[0]!;
  const daBase = (corpo.file.slots ?? []).find((s) => s.name === slot)?.attachment ?? null;
  const att = corpo.skeleton?.findSlot(slot)?.attachment?.name ?? daBase;
  return att === null || att === undefined ? null : { slot, attachment: att };
}

function defAt(file: SkinsFile, t: PickerTarget): Def | null {
  const d = (file.skins ?? []).find((s) => s.name === t.skin)?.attachments?.[t.slot]?.[t.attachment];
  return d === undefined || d === null || typeof d !== 'object' ? null : d as Def;
}

/**
 * **Por que "Marcar como slot" não age agora** (régua 3), ou `null` quando age.
 * Só a imagem simples (região): a malha tem vértices e pesos presos aos ossos
 * DO BONECO, e levá-la para dentro de outra base é outra conta, não esta.
 */
export function whyCannotMark(doc: EditorDoc): string | null {
  if (projetoDe(doc) === null) return 'Fazer da imagem uma base precisa de um projeto aberto';
  const shown = shownOfSelection(doc);
  if (shown === null) return 'Escolha uma imagem na cena primeiro (clique nela)';
  const file = corpoDe(doc).file as SkinsFile;
  const target = pickerTarget(file, doc.visibleSkins, shown.slot, shown.attachment);
  if (target === null) {
    const grid = gridTarget(file, doc.visibleSkins, shown.slot, shown.attachment);
    const def = grid === null ? null : defAt(file, grid);
    if (slotMarkOf(def) !== null) return `${shown.slot} já é uma imagem-base`;
    return `${shown.slot} não mostra uma imagem: só imagem vira base`;
  }
  const def = defAt(file, target);
  const tipo = (def?.['type'] as string | undefined) ?? 'region';
  if (tipo !== 'region') return `${shown.slot} é uma ${tipo === 'mesh' ? 'malha' : tipo}: por enquanto só a imagem simples vira base`;
  return null;
}

/** O alvo do gesto, quando ele age. */
export function markTarget(doc: EditorDoc): PickerTarget | null {
  if (whyCannotMark(doc) !== null) return null;
  const shown = shownOfSelection(doc)!;
  return pickerTarget(corpoDe(doc).file as SkinsFile, doc.visibleSkins, shown.slot, shown.attachment);
}

/** O alvo do Desmarcar: um slot marcado, escolhido. */
export function unmarkTarget(doc: EditorDoc): (PickerTarget & { mark: SlotMark }) | null {
  const shown = shownOfSelection(doc);
  if (shown === null) return null;
  const file = corpoDe(doc).file as SkinsFile;
  const grid = gridTarget(file, doc.visibleSkins, shown.slot, shown.attachment);
  const mark = grid === null ? null : slotMarkOf(defAt(file, grid));
  return grid === null || mark === null ? null : { ...grid, mark };
}

/** Por que "Desmarcar o slot" não age agora, ou `null`. */
export function whyCannotUnmark(doc: EditorDoc): string | null {
  const shown = shownOfSelection(doc);
  if (shown === null) return 'Escolha a imagem-base primeiro (clique nela na cena, ou na Árvore)';
  return unmarkTarget(doc) === null ? `${shown.slot} não é uma imagem-base` : null;
}

/** O nome sugerido: o da imagem, sem a pasta. */
export function suggestedSlotName(attachment: string, def: Def | null): string {
  const image = (def === null ? null : imageOf(attachment, def)) ?? attachment;
  return image.split('/').pop() ?? image;
}

/**
 * O nome serve? `null` quando sim; senão a frase do porquê. Não pode bater com
 * outro slot do boneco (menos o próprio), nem com uma base ou entidade do
 * projeto.
 */
export function whyBadName(nome: string, slots: readonly string[], ownSlot: string, uris: readonly string[]): string | null {
  const limpo = nome.trim();
  if (limpo === '') return 'O nome não pode ficar vazio';
  if (/[\\/:*?"<>|]/.test(limpo)) return 'O nome vira nome de arquivo: sem \\ / : * ? " < > |';
  if (limpo !== ownSlot && slots.includes(limpo)) return `Já existe um desenho chamado ${limpo} no boneco`;
  if (uris.includes(slotBaseUri(limpo))) return `Já existe ${slotBaseUri(limpo)} no projeto`;
  return null;
}

/**
 * **Os nomes de base que já estão tomados** — rodada 17 (sobra da rodada 9).
 *
 * Depois de `Ctrl+Z` no Marcar como slot, a base desfeita fica em `guardados`
 * (para o refazer) e o esqueleto dela no mapa das entidades; marcar de novo
 * com o MESMO nome dizia *"Já existe … no projeto"*, e o nome ficava preso.
 * O que está guardado só para o refazer — não é corpo nem entidade do projeto
 * — não toma o nome: marcar de novo é um passo novo, que apaga o refazer.
 */
export function takenBaseUris(
  corpos: Iterable<string>, entidades: Iterable<string>, guardados: Iterable<string>, nested: Iterable<string>,
): string[] {
  const vivos = new Set<string>([...corpos, ...entidades]);
  const soDoRefazer = new Set<string>([...guardados].filter((uri) => !vivos.has(uri)));
  for (const uri of nested) if (!soDoRefazer.has(uri)) vivos.add(uri);
  return [...vivos];
}

/**
 * **Marcar como slot** — um passo de desfazer. O arquivo do boneco muda (o
 * nome do slot, o anexo `skeleton`, a marca), e a base nova entra no projeto;
 * o `revert` devolve o arquivo letra por letra e tira a base do projeto.
 */
export class MarkAsSlot implements Command {
  readonly label = 'Fazer da imagem uma base';
  readonly kind: ChangeKind = 'structure';
  /** A base nova; nasce no primeiro `apply` e é a mesma no refazer. */
  child: Doc | null = null;
  private swap: SwapForEntity | null = null;

  constructor(
    private readonly target: PickerTarget,
    private readonly nome: string,
    private readonly atlases: readonly AtlasData[],
    private readonly images: ReadonlyMap<string, CanvasImageSource>,
  ) {}

  get uri(): string {
    return slotBaseUri(this.nome);
  }

  apply(doc: EditorDoc): void {
    const { slot, attachment, skin } = this.target;
    const before = defAt(doc.file as SkinsFile, this.target);
    if (before === null) return;
    const copia = JSON.parse(JSON.stringify(before)) as Def;
    if (this.nome !== slot) renameSlotEverywhere(doc.file, slot, this.nome);
    this.swap = new SwapForEntity(this.nome, attachment, skin, this.uri);
    this.swap.apply(doc);
    const def = defAt(doc.file as SkinsFile, { slot: this.nome, attachment, skin })!;
    const ext = ((def['extensions'] as Def | undefined) ?? {}) as Def;
    const state = ((ext[EDITOR_EXTENSION] as Def | undefined) ?? {}) as Def;
    state[SLOT_MARK] = { nome: this.nome, slotDeAntes: slot } satisfies SlotMark;
    ext[EDITOR_EXTENSION] = state;
    def['extensions'] = ext;
    if (this.child === null) {
      const inner = innerImageDef(copia, this.swap.pin) ?? copia;
      const slotDeAntes = (doc.file.slots ?? []).find((s) => s.name === this.nome) as unknown as Def | undefined;
      const file = slotBaseFile(this.nome, attachment, inner, (doc.file as { assets?: unknown }).assets, slotDeAntes ?? null);
      const projeto = projetoDe(doc);
      this.child = new Doc(file, {
        atlases: this.atlases, images: this.images, path: this.uri,
        ...(projeto === null ? {} : { undo: projeto.undo }),
      });
    }
    // O esqueleto dela ANTES de ela entrar no projeto: o `adicionarCorpo` avisa
    // quem ouve, e a lista de Animações tem de achá-la já aberta.
    if (doc instanceof Doc && this.child.data !== null) doc.setNestedQuiet(this.uri, this.child.data);
    const projeto = projetoDe(doc);
    if (projeto !== null) projeto.adicionarCorpo(this.uri, this.child);
  }

  revert(doc: EditorDoc): void {
    const { slot } = this.target;
    this.swap?.revert(doc);
    this.swap = null;
    if (this.nome !== slot) renameSlotEverywhere(doc.file, this.nome, slot);
    projetoDe(doc)?.tirarCorpo(this.uri);
  }
}

/**
 * **Desmarcar o slot** — a imagem de antes volta, como era, o slot volta ao
 * nome de antes, e a base sai do projeto (fica guardada para o refazer).
 */
export class UnmarkSlot implements Command {
  readonly label = 'Desfazer a base da imagem';
  readonly kind: ChangeKind = 'structure';
  private takeOut: TakeOutEntity | null = null;
  private child: Doc | null = null;

  constructor(private readonly target: PickerTarget & { mark: SlotMark }) {}

  apply(doc: EditorDoc): void {
    const { slot, attachment, skin, mark } = this.target;
    const def = defAt(doc.file as SkinsFile, { slot, attachment, skin });
    if (def === null || imageBeforeOf(def) === null) return;
    this.takeOut = new TakeOutEntity(slot, attachment, skin);
    this.takeOut.apply(doc);
    if (mark.slotDeAntes !== slot) renameSlotEverywhere(doc.file, slot, mark.slotDeAntes);
    const projeto = projetoDe(doc);
    const uri = slotBaseUri(mark.nome);
    this.child = projeto?.docOf(uri) ?? null;
    projeto?.tirarCorpo(uri);
  }

  revert(doc: EditorDoc): void {
    const { slot, mark } = this.target;
    if (mark.slotDeAntes !== slot) renameSlotEverywhere(doc.file, mark.slotDeAntes, slot);
    this.takeOut?.revert(doc);
    this.takeOut = null;
    const projeto = projetoDe(doc);
    if (projeto !== null && this.child !== null) projeto.adicionarCorpo(slotBaseUri(mark.nome), this.child);
  }
}

/**
 * **Este uri é uma base que nasceu de um slot marcado** deste boneco? —
 * rodada 17 (sobra da rodada 9). A lista de Bases tem uma linha para ela
 * (*"Base — montar · peito"*), e o clique abria o colete SOZINHO na cena; o
 * caminho com o herói à vista era a linha *"peito · slot"*, abaixo da dobra.
 * Agora as duas portas fazem o mesmo.
 */
export function isMarkedSlotBase(doc: EditorDoc, uri: string): boolean {
  const file = corpoDe(doc).file as SkinsFile;
  return (file.skins ?? []).some((skin) => Object.values(skin.attachments ?? {}).some((porNome) => Object.values(porNome ?? {})
    .some((def) => def !== null && typeof def === 'object' && (def as Def)['uri'] === uri && slotMarkOf(def as Def) !== null)));
}

/**
 * A linha da lista de Animações é um slot marcado? — rodada 9. Basta um dos
 * slots dela ter a marca: a lista mostra "slot", e o clique no nome abre a
 * base dela por dentro.
 */
export function isSlotBaseRow(doc: EditorDoc, row: { uri: string; slots: readonly string[] }): boolean {
  const file = corpoDe(doc).file as SkinsFile;
  return row.slots.some((slot) => (file.skins ?? []).some((skin) => Object.values(skin.attachments?.[slot] ?? {})
    .some((def) => def !== null && typeof def === 'object' && (def as Def)['uri'] === row.uri && slotMarkOf(def as Def) !== null)));
}
