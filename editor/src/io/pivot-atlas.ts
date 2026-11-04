/**
 * O pivô no atlas do documento (dono A) — lote 56, plano pivô.
 *
 * `pivot-model.ts` é a conta; aqui ela encontra o documento vivo: os atlas que
 * a cena está desenhando, o acervo das imagens importadas, e o que vai para o
 * disco. Três portas:
 *
 *   Carimbar pivôs      um `Command`, para o painel mostrar já e o desfazer valer;
 *   Duplicar no atlas   um `Command`: a região copiada, os desenhos apontando
 *                       para a cópia, e cada uma carimbada pelo seu lado;
 *   salvar e exportar   `atlasFilesForDisk`, que carimba antes de gravar, sem
 *                       passo de desfazer: o atlas em disco é derivado do rig.
 */

import type { AtlasData, AtlasPageData, BoneFile } from '../../../runtime/src/index.js';
import { loadAtlas } from '../../../runtime/src/index.js';
import type { AtlasJson, AtlasRegionJson, PackerItem } from '../../../ferramentas/src/atlas/packer.js';
import { ownBoneOfSlot } from '../doc/own-bone.js';
import { moveOwnBoneToPoint, pivotStillRefusal } from './pivot-still.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import {
  atlasFileText, importedAtlas, importedStock, restoreImportedStock, type ImportedStock,
} from './import-images.js';
import {
  duplicateRegion, findAttachmentDef, findRegion, isLooseDrawing, pivotInBone, pivotUsers, readHandPivots, restoreDef, roundPivot,
  writeHandPivots,
  snapshotDef, stampPivots,
  type AttachmentRef, type DefSnapshot, type RegionPose, type StampResult,
} from './pivot-model.js';
import { FOLDER_PIVOTS, isProvisionalAtlas, readFolderPivots } from './project-folder.js';
import type { PivotPlanItem } from './project-folder.js';
import { EDITOR_EXTENSION, readEditorState, writeEditorState } from '../contract.js';
import type { EditorState } from '../contract.js';

/**
 * Writes an atlas the runtime already read back out as a `.atlas.json` tree
 * (spec 10.2 and 10.3). Only properties that differ from the spec default are
 * written, which is what the packer does too, so the file stays readable.
 *
 * Moved here from `save-binary.ts` in lote 56, next to the stamp, which is its
 * main reader now; `save-binary.ts` still exports it.
 */
export function atlasToJson(atlas: AtlasData): Record<string, unknown> {
  const pages = atlas.pages.map((page) => {
    const out: Record<string, unknown> = {
      name: page.name, image: page.image, width: page.width, height: page.height,
    };
    if (page.format !== 'rgba8') out.format = page.format;
    if (page.minFilter !== 'linear') out.minFilter = page.minFilter;
    if (page.magFilter !== 'linear') out.magFilter = page.magFilter;
    if (page.wrapU !== 'clamp') out.wrapU = page.wrapU;
    if (page.wrapV !== 'clamp') out.wrapV = page.wrapV;
    if (page.premultiplied) out.premultiplied = true;
    return out;
  });

  const regions = atlas.regions.map((region) => {
    const out: Record<string, unknown> = { name: region.name };
    if (region.aliases.length > 0) out.aliases = [...region.aliases];
    out.page = region.page.index;
    out.x = region.x;
    out.y = region.y;
    out.width = region.width;
    out.height = region.height;
    if (region.rotation !== 0) out.rotation = region.rotation;
    if (region.offsetX !== 0) out.offsetX = region.offsetX;
    if (region.offsetY !== 0) out.offsetY = region.offsetY;
    if (region.originalWidth !== region.width) out.originalWidth = region.originalWidth;
    if (region.originalHeight !== region.height) out.originalHeight = region.originalHeight;
    if (region.pivotX !== undefined) out.pivotX = region.pivotX;
    if (region.pivotY !== undefined) out.pivotY = region.pivotY;
    return out;
  });

  const tree: Record<string, unknown> = {
    atlas: { version: '1.0', generator: 'Recorte editor 0.1.0' },
  };
  if (atlas.scale !== 1) tree.scale = atlas.scale;
  tree.pages = pages;
  tree.regions = regions;
  return tree;
}

/** As árvores dos atlas do documento, como iriam para o disco hoje. */
export function atlasTreesOf(doc: EditorDoc): AtlasJson[] {
  return doc.atlases.map((atlas) => atlasToJson(atlas) as unknown as AtlasJson);
}

// ---------------------------------------------------------------------------
// Os atlas do documento, trocados por árvores novas
// ---------------------------------------------------------------------------

/** Atlas que nasceram de um Carimbar ou de um Duplicar: têm que ir para o disco. */
const edited = new WeakSet<AtlasData>();

/** `true` quando este atlas saiu de um Carimbar ou de um Duplicar no atlas. */
export function isAtlasEdited(atlas: AtlasData): boolean {
  return edited.has(atlas);
}

/** A mesma vista estreita do `import-images.ts`: só o `Doc` concreto troca os atlas. */
interface AssetHolder extends EditorDoc {
  setAssets(atlases: readonly AtlasData[], images: ReadonlyMap<string, CanvasImageSource>): void;
}

function holderOf(doc: EditorDoc): AssetHolder | null {
  const holder = doc as AssetHolder;
  return typeof holder.setAssets === 'function' ? holder : null;
}

/** As imagens das páginas, pelo nome, para a troca não perder nenhuma. */
function pageImages(doc: EditorDoc): Map<string, CanvasImageSource> {
  const images = new Map<string, CanvasImageSource>();
  for (const atlas of doc.atlases) {
    for (const page of atlas.pages as readonly AtlasPageData[]) {
      const image = doc.imageFor(page);
      if (image !== null) images.set(page.image, image);
    }
  }
  return images;
}

interface AssetState {
  readonly atlases: readonly AtlasData[];
  readonly images: Map<string, CanvasImageSource>;
  readonly stock: ImportedStock;
}

function captureAssets(doc: EditorDoc): AssetState {
  return { atlases: doc.atlases, images: pageImages(doc), stock: importedStock(doc) };
}

function restoreAssets(doc: EditorDoc, state: AssetState): void {
  restoreImportedStock(doc, state.stock);
  holderOf(doc)?.setAssets(state.atlases, state.images);
}

/** A imagem importada com o pivô da região, em px da imagem de origem. */
function withPivot(item: PackerItem, region: { pivotX?: number; pivotY?: number } | undefined, scale: number): PackerItem {
  const out: PackerItem = { ...item };
  delete out.pivotX;
  delete out.pivotY;
  if (region?.pivotX !== undefined) out.pivotX = region.pivotX / scale;
  if (region?.pivotY !== undefined) out.pivotY = region.pivotY / scale;
  return out;
}

/**
 * Põe `trees` no lugar dos atlas do documento, com as mesmas páginas.
 *
 * O acervo importado acompanha: o pivô vai para a imagem de onde a região
 * sai, e uma região copiada ganha a sua imagem — senão o próximo "Reempacotar
 * atlas" apagaria as duas coisas.
 */
function installTrees(
  doc: EditorDoc, trees: readonly AtlasJson[], copies: ReadonlyArray<{ from: string; to: string }> = [],
): void {
  const images = pageImages(doc);
  const loaded = trees.map((tree) => {
    const data = loadAtlas(JSON.parse(JSON.stringify(tree)));
    edited.add(data);
    return data;
  });

  const current = importedAtlas(doc);
  const at = current === null ? -1 : doc.atlases.indexOf(current.data);
  if (current !== null && at >= 0) {
    const tree = trees[at]!;
    const scale = current.packed.scale || 1;
    const byName = new Map<string, { pivotX?: number; pivotY?: number }>();
    for (const region of tree.regions) {
      for (const name of [region.name, ...(region.aliases ?? [])]) byName.set(name, region);
    }
    const stock = importedStock(doc);
    const items = stock.items.map((item) => withPivot(item, byName.get(item.name), scale));
    for (const { from, to } of copies) {
      const source = stock.items.find((item) => item.name === from);
      if (source !== undefined) items.push(withPivot({ ...source, name: to }, byName.get(to), scale));
    }
    restoreImportedStock(doc, {
      items,
      current: {
        ...current,
        packed: { ...current.packed, atlas: tree, regions: tree.regions },
        data: loaded[at]!,
      },
    });
  }
  holderOf(doc)?.setAssets(loaded, images);
}

// ---------------------------------------------------------------------------
// Os dois comandos
// ---------------------------------------------------------------------------

/**
 * **Carimbar pivôs** — o botão da aba Imagens.
 *
 * O atlas não mora no `.bone`, então não há snapshot do arquivo: o que se
 * guarda são os atlas e o acervo de antes, e o `revert` devolve os dois.
 */
export class StampPivotsCommand implements Command {
  readonly label = 'Carimbar pivôs';
  readonly kind: ChangeKind = 'assets';
  /** O que a última aplicação fez: para a frase do rodapé e os avisos do painel. */
  result: StampResult | null = null;
  private before: AssetState | null = null;

  apply(doc: EditorDoc): void {
    this.before = captureAssets(doc);
    const result = stampPivots(doc.file, atlasTreesOf(doc));
    this.result = result;
    installTrees(doc, result.atlases);
  }

  revert(doc: EditorDoc): void {
    if (this.before !== null) restoreAssets(doc, this.before);
  }
}

/**
 * **Duplicar no atlas** — um pivô por imagem, e quem quer dois duplica.
 *
 * Cada grupo de desenhos ganha a sua cópia da região (`mao_2`, `mao_3`…) e
 * passa a apontar para ela; um grupo vazio é só a cópia. Depois disso as
 * cópias são carimbadas na hora, cada uma pelo seu desenho. Um passo de
 * desfazer, e ele devolve os caminhos e os atlas.
 */
export class DuplicateInAtlasCommand implements Command {
  readonly label = 'Duplicar no atlas';
  readonly kind: ChangeKind = 'structure';
  /** Os nomes das cópias, na ordem dos grupos. Valem depois do `apply`. */
  names: string[] = [];
  private before: AssetState | null = null;
  private paths: Array<{ ref: AttachmentRef; before: DefSnapshot }> = [];

  constructor(
    private readonly image: string,
    private readonly groups: ReadonlyArray<readonly AttachmentRef[]>,
  ) {}

  apply(doc: EditorDoc): void {
    this.before = captureAssets(doc);
    this.names = [];
    this.paths = [];
    const trees = atlasTreesOf(doc);
    const at = trees.findIndex((tree) => tree.regions.some(
      (r) => r.name === this.image || (r.aliases ?? []).includes(this.image),
    ));
    if (at < 0) return;

    const taken = trees.flatMap((tree) => tree.regions.flatMap((r) => [r.name, ...(r.aliases ?? [])]));
    const copies: Array<{ from: string; to: string }> = [];
    for (const group of this.groups.length === 0 ? [[]] : this.groups) {
      const made = duplicateRegion(trees[at]!, this.image, [...taken, ...this.names]);
      if (made === null) break;
      trees[at] = made.atlas;
      this.names.push(made.name);
      copies.push({ from: this.image, to: made.name });
      for (const ref of group) {
        const def = findAttachmentDef(doc.file, ref);
        if (def === null || def['sequence'] !== undefined) continue;
        this.paths.push({ ref, before: snapshotDef(def) });
        def['path'] = made.name;
      }
    }
    installTrees(doc, stampPivots(doc.file, trees).atlases, copies);
  }

  revert(doc: EditorDoc): void {
    for (const { ref, before } of [...this.paths].reverse()) {
      const def = findAttachmentDef(doc.file, ref);
      if (def !== null) restoreDef(def, before);
    }
    if (this.before !== null) restoreAssets(doc, this.before);
  }
}

/**
 * **Definir pivô** e **Colar pivô** — lote 58, para a imagem que ainda não
 * tem rig (desenhada fora do quadro, porta 4 da pesquisa).
 *
 * Grava o pivô na região e, no mesmo passo, recoloca pelo pivô novo todo
 * desenho que usa a imagem, **mantendo o tamanho** de cada um. O rig continua
 * sendo a verdade: carimbar de novo dá o mesmo número.
 */
export class SetPivotCommand implements Command {
  readonly kind: ChangeKind = 'structure';
  /** Quantos desenhos a última aplicação recolocou. */
  moved = 0;
  /**
   * **Rodada 13: o que ficou parado** — todo desenho que usa a imagem. Com
   * osso próprio, o osso vai para o pivô novo e o anexo volta a mesma
   * distância (`pivot-still.ts`); sem, o anexo fica e o pivô vai para a lista
   * dos pivôs à mão (`hand`). `keysAdded`: as chaves de posição que nasceram;
   * `turning`: as animações com giro, onde entre as chaves a imagem passa a
   * girar em volta do pivô novo. `moved` e `moves` ficam em zero: nenhum
   * desenho é recolocado desde a rodada 13.
   */
  still = 0;
  keysAdded = 0;
  turning: string[] = [];
  hand = false;
  private savedFile: string | null = null;
  /**
   * De onde para onde cada recolocado foi, no espaço do osso — H2, decisão P67
   * (29/09/2026). O comportamento é o do plano de 10/09 (todo desenho que usa a
   * imagem é recolocado, o solto também); o que faltava era DIZER: o rodapé
   * contava "1 desenho recolocado", e a cabeça tinha ido de (150, 100) para
   * (0, 28) sem ninguém saber. Se o solto deve ficar parado é pergunta ao
   * Humberto, e até ele responder nada muda.
   */
  moves: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = [];
  private before: AssetState | null = null;
  private paths: Array<{ ref: AttachmentRef; before: DefSnapshot }> = [];

  constructor(
    private readonly image: string,
    private readonly pivot: { x: number; y: number },
    readonly label = 'Definir pivô',
  ) {}

  apply(doc: EditorDoc): void {
    this.before = captureAssets(doc);
    this.savedFile = JSON.stringify(doc.file);
    this.paths = [];
    this.moved = 0;
    this.moves = [];
    const trees = atlasTreesOf(doc);
    const where = findRegion(trees, this.image);
    if (where === null) return;
    const tree = trees[where.atlas]!;
    const region = tree.regions[where.region]!;
    region.pivotX = roundPivot(this.pivot.x);
    region.pivotY = roundPivot(this.pivot.y);
    const done = pivotToUsers(doc.file, trees, this.image, region, tree.scale ?? 1);
    this.moves = done.moves;
    this.moved = done.moves.length;
    this.still = done.still;
    this.keysAdded = done.keysAdded;
    this.turning = done.turning;
    this.hand = done.hand;
    this.paths = done.paths;
    installTrees(doc, trees);
  }

  revert(doc: EditorDoc): void {
    // O arquivo inteiro, por texto: o osso próprio, as chaves e os anexos do
    // slot também mudam agora, não só os desenhos que usam a imagem.
    if (this.savedFile !== null) restoreFileText(doc, this.savedFile);
    this.savedFile = null;
    if (this.before !== null) restoreAssets(doc, this.before);
  }
}

/**
 * **Voltar o pivô para o osso** — rodada 13, caso (b). A imagem sai da lista
 * dos pivôs à mão, e o pivô dela volta a ser o que o rig diz: onde a origem do
 * osso cai na imagem. Nenhum desenho anda. `images = null`: todas as marcadas.
 */
export class ResetPivotToBone implements Command {
  readonly kind: ChangeKind = 'structure';
  readonly label = 'Voltar o pivô para o osso';
  /** As imagens que voltaram. */
  done: string[] = [];
  private savedFile: string | null = null;
  private before: AssetState | null = null;

  constructor(readonly images: readonly string[] | null = null) {}

  apply(doc: EditorDoc): void {
    this.before = captureAssets(doc);
    this.savedFile = JSON.stringify(doc.file);
    const hand = readHandPivots(doc.file);
    this.done = (this.images ?? Object.keys(hand)).filter((name) => hand[name] !== undefined);
    for (const name of this.done) delete hand[name];
    writeHandPivots(doc.file, hand);
    // O carimbo de agora, só para estas: as outras imagens não mudam aqui.
    const trees = atlasTreesOf(doc);
    const stamped = stampPivots(doc.file, trees).atlases;
    let mexeu = false;
    for (const name of this.done) {
      const where = findRegion(trees, name);
      if (where === null) continue;
      const from = stamped[where.atlas]!.regions[where.region]!;
      const to = trees[where.atlas]!.regions[where.region]!;
      if (from.pivotX === undefined || from.pivotY === undefined) continue;
      to.pivotX = from.pivotX;
      to.pivotY = from.pivotY;
      mexeu = true;
    }
    if (mexeu) installTrees(doc, trees);
  }

  revert(doc: EditorDoc): void {
    if (this.savedFile !== null) restoreFileText(doc, this.savedFile);
    this.savedFile = null;
    if (this.before !== null) restoreAssets(doc, this.before);
  }
}

/**
 * **Onde o osso próprio de uma imagem nasce: no PIVÔ dela** — rodada 13, ponto 3.
 * Morava em `viewport/tools/attachment-edit.ts`; desceu para cá no conserto 4
 * da conferência, porque a ficha rápida (que não importa ferramenta) também
 * cria o osso próprio ao digitar, e as duas portas têm de dar o mesmo.
 *
 * O pivô, no espaço do osso do slot: com **pivô à mão**, onde ele cai (§10.3);
 * sem, numa imagem **presa a um osso**, a origem do osso `(0, 0)`, que é o que
 * o rig diz. `null` = nasce no `x, y` do próprio anexo, como antes: a imagem
 * **solta** sem pivô à mão (girar em volta do canto da cena não serve a
 * ninguém — aceito pelo Diretor), e entidade, ponto e emissor, cujo `x, y` já
 * é o pivô (§7.11).
 */
export function ownBoneBirthAt(corpo: EditorDoc, slot: string, attachment: string): { x: number; y: number } | null {
  let def: Record<string, unknown> | null = null;
  for (const skin of corpo.file.skins ?? []) {
    const found = (skin.attachments?.[slot] as Record<string, unknown> | undefined)?.[attachment];
    if (found !== undefined && found !== null && typeof found === 'object') { def = found as Record<string, unknown>; break; }
  }
  if (def === null || (def['type'] ?? 'region') !== 'region' || def['sequence'] !== undefined) return null;
  const path = typeof def['path'] === 'string' ? def['path'] : attachment;
  const trees = atlasTreesOf(corpo);
  const where = findRegion(trees, path);
  const hand = readHandPivots(corpo.file);
  if (where !== null) {
    const tree = trees[where.atlas]!;
    const region = tree.regions[where.region]!;
    const mark = hand[region.name] ?? hand[path];
    if (mark !== undefined) {
      return pivotInBone({ ...region, pivotX: mark[0], pivotY: mark[1] }, def as RegionPose, tree.scale ?? 1);
    }
  }
  if (isLooseDrawing(corpo.file, { skin: '', slot, attachment })) return null;
  return { x: 0, y: 0 };
}

/** Devolve `doc.file` ao texto `saved`, no lugar, chave por chave. */
function restoreFileText(doc: EditorDoc, saved: string): void {
  const target = doc.file as unknown as Record<string, unknown>;
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, JSON.parse(saved));
}

/** O que um pivô novo fez com quem usa a imagem. */
interface PivotUsersDone {
  moves: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>;
  paths: Array<{ ref: AttachmentRef; before: DefSnapshot }>;
  still: number;
  keysAdded: number;
  turning: string[];
  /** Algum desenho ficou parado sem osso próprio: o pivô virou "à mão". */
  hand: boolean;
}

/**
 * **Um pivô novo, e quem usa a imagem** — a mesma conta para todas as portas
 * (Definir, Colar, o painel Pivôs, Repetir para a pasta). Rodada 13.
 *
 * NENHUM desenho anda. Por slot:
 *
 * - (a) com osso próprio: o osso vai para o pivô novo e o anexo volta a mesma
 *   distância (`moveOwnBoneToPoint`). O pivô, no espaço do osso próprio, é
 *   `pivotInBone` do anexo que o slot mostra na base (ou do primeiro que usa a
 *   imagem). O rig continua dizendo o pivô.
 * - (b) sem osso próprio (ou com um que a conta não sabe mover — não herda do
 *   pai, troca de pai, uma regra mexe nele): o anexo fica onde está, e o pivô
 *   entra na lista dos pivôs à mão (`HAND_PIVOTS`), porque o rig deixou de
 *   dizê-lo. Sem a lista, o próximo Salvar o desfaria.
 *
 * Todos os desenhos da imagem em (a): a imagem sai da lista, se estava.
 */
function pivotToUsers(
  file: BoneFile, trees: readonly AtlasJson[], image: string, region: AtlasRegionJson, scale: number,
): PivotUsersDone {
  const done: PivotUsersDone = { moves: [], paths: [], still: 0, keysAdded: 0, turning: [], hand: false };
  const bySlot = new Map<string, AttachmentRef[]>();
  for (const ref of pivotUsers(file, trees, image)) {
    const list = bySlot.get(ref.slot);
    if (list === undefined) bySlot.set(ref.slot, [ref]);
    else list.push(ref);
  }
  for (const [slot, refs] of bySlot) {
    const own = ownBoneOfSlot(file, slot);
    if (own !== null && pivotStillRefusal(file, own) === null) {
      const shown = (file.slots ?? []).find((s) => s.name === slot)?.attachment;
      const ref = refs.find((r) => r.attachment === shown) ?? refs[0]!;
      const def = findAttachmentDef(file, ref);
      if (def === null) continue;
      const q = pivotInBone(region, def as RegionPose, scale);
      const result = moveOwnBoneToPoint(file, own, q);
      done.still += refs.length;
      done.keysAdded += result.keysAdded;
      for (const name of result.turning) if (!done.turning.includes(name)) done.turning.push(name);
      continue;
    }
    // (b): o desenho fica onde está; quem guarda o pivô é a lista.
    done.still += refs.length;
    done.hand = true;
  }
  if (bySlot.size > 0) {
    const hand = readHandPivots(file);
    // Pelo nome da região: é o que o carimbo procura (o apelido também vale lá).
    if (image !== region.name) delete hand[image];
    if (done.hand) hand[region.name] = [region.pivotX ?? 0, region.pivotY ?? 0];
    else delete hand[region.name];
    writeHandPivots(file, hand);
  }
  return done;
}

/**
 * **Repetir o pivô para a pasta** — lote 61, plano pasta do projeto.
 *
 * Um passo de desfazer para o plano inteiro (`folderPivotPlan`). Cada imagem
 * que tem região ganha o pivô na região, e todo desenho que a usa FICA PARADO
 * — a conta do Definir pivô desde a rodada 13 (`pivotToUsers`). A
 * imagem que ainda está só na pasta ganha o pivô em
 * `RECORTE_editor_state.folderPivots`, para quando entrar na cena.
 *
 * O `revert` devolve os atlas, os desenhos e o estado do editor por texto.
 */
export class SetFolderPivotCommand implements Command {
  readonly kind: ChangeKind = 'structure';
  /** Quantos desenhos a última aplicação recolocou. */
  moved = 0;
  /** Quantas imagens ganharam o pivô. */
  count = 0;
  /** Rodada 13: como no `SetPivotCommand`. */
  still = 0;
  keysAdded = 0;
  turning: string[] = [];
  hand = false;
  private savedFile: string | null = null;
  private before: AssetState | null = null;
  private paths: Array<{ ref: AttachmentRef; before: DefSnapshot }> = [];
  private savedState: { extensions: string | null; used: string | null } | null = null;

  constructor(
    private readonly plan: readonly PivotPlanItem[],
    readonly label = 'Repetir o pivô para a pasta',
  ) {}

  apply(doc: EditorDoc): void {
    const file = doc.file as { extensions?: Record<string, unknown>; extensionsUsed?: string[] };
    this.before = captureAssets(doc);
    this.savedState = {
      extensions: file.extensions === undefined ? null : JSON.stringify(file.extensions),
      used: file.extensionsUsed === undefined ? null : JSON.stringify(file.extensionsUsed),
    };
    this.savedFile = JSON.stringify(doc.file);
    this.paths = [];
    this.moved = 0;
    this.count = 0;
    this.still = 0;
    this.keysAdded = 0;
    this.turning = [];
    this.hand = false;

    const trees = atlasTreesOf(doc);
    const pivots = readFolderPivots(doc.file);
    let pasta = false;
    let regioes = false;
    for (const item of this.plan) {
      const x = roundPivot(item.x);
      const y = roundPivot(item.y);
      this.count++;
      const where = findRegion(trees, item.name);
      if (where === null) {
        pivots[item.name] = [x, y];
        pasta = true;
        continue;
      }
      const tree = trees[where.atlas]!;
      const region = tree.regions[where.region]!;
      region.pivotX = x;
      region.pivotY = y;
      regioes = true;
      // Rodada 13: a mesma conta do Definir pivô — com osso próprio, parado.
      const done = pivotToUsers(doc.file, trees, item.name, region, tree.scale ?? 1);
      this.paths.push(...done.paths);
      this.still += done.still;
      this.keysAdded += done.keysAdded;
      for (const name of done.turning) if (!this.turning.includes(name)) this.turning.push(name);
      this.hand ||= done.hand;
    }
    this.moved = this.paths.length;
    if (pasta) {
      const state = { ...readEditorState(doc.file), [FOLDER_PIVOTS]: pivots } as EditorState;
      writeEditorState(doc.file, state);
      const used = file.extensionsUsed ?? [];
      if (!used.includes(EDITOR_EXTENSION)) file.extensionsUsed = [...used, EDITOR_EXTENSION];
    }
    if (regioes) installTrees(doc, trees);
  }

  revert(doc: EditorDoc): void {
    // Rodada 13: o arquivo inteiro, por texto — o osso próprio e as chaves
    // também mudam. O estado do editor vai junto. O ARQUIVO PRIMEIRO, os atlas
    // depois: quem recebe os atlas passa para eles a lista dos pivôs à mão do
    // arquivo (`doc/hand-pivots.ts`), e ela tem de ser já a de antes.
    if (this.savedFile !== null) {
      restoreFileText(doc, this.savedFile);
      if (this.before !== null) restoreAssets(doc, this.before);
      this.savedFile = null;
      this.savedState = null;
      return;
    }
    if (this.before !== null) restoreAssets(doc, this.before);
    for (const { ref, before } of [...this.paths].reverse()) {
      const def = findAttachmentDef(doc.file, ref);
      if (def !== null) restoreDef(def, before);
    }
    const saved = this.savedState;
    if (saved === null) return;
    const file = doc.file as { extensions?: Record<string, unknown>; extensionsUsed?: string[] };
    if (saved.extensions === null) delete file.extensions;
    else file.extensions = JSON.parse(saved.extensions);
    if (saved.used === null) delete file.extensionsUsed;
    else file.extensionsUsed = JSON.parse(saved.used);
    this.savedState = null;
  }
}

// ---------------------------------------------------------------------------
// O que vai para o disco
// ---------------------------------------------------------------------------

export interface DiskAtlas {
  /** Como o `.bone` chama o arquivo, em `assets.atlases`. */
  readonly name: string;
  readonly text: string;
  /** `true` quando o arquivo em disco ficou velho: carimbo novo, ou Carimbar/Duplicar desde que abriu. */
  readonly changed: boolean;
  /** É o pacote do acervo importado: as páginas dele só existem na memória. */
  readonly fromImport: boolean;
}

export interface DiskAtlases {
  /** Um por atlas do documento, na ordem de `doc.atlases`. */
  readonly files: DiskAtlas[];
  /** Algum deles é o pacote importado. */
  readonly fromImport: boolean;
  /** As imagens com pivôs diferentes, em português. */
  readonly warnings: string[];
}

const treeText = (tree: unknown): string => `${JSON.stringify(tree, null, 2)}\n`;

/**
 * Os atlas do documento como vão para o disco, carimbados pelo rig antes —
 * todos juntos, porque um nome de imagem se procura atlas por atlas (§10.5).
 *
 * Desde o conserto de 10/09 o pacote das imagens importadas mora **ao lado**
 * dos atlas que vieram com o arquivo, com nome próprio. Então cada atlas sai
 * com o seu nome: o pacote com o do acervo, e cada um dos outros com o seu
 * nome em `assets.atlases`, na ordem. O pacote sai no texto exato do
 * empacotador quando o carimbo não muda nada; os outros saem de `atlasToJson`
 * e dizem em `changed` se o arquivo que está no disco ficou velho.
 */
export function atlasFilesForDisk(doc: EditorDoc, base = 'atlas'): DiskAtlases {
  const imported = importedAtlas(doc);
  const own = imported !== null && atlasFileText(doc) !== null ? imported : null;
  const foreignNames = (doc.file.assets?.atlases ?? []).filter((name) => name !== own?.fileName);
  // Lote 60: o atlas provisório da pasta não vai para o disco assim. As
  // imagens dele em uso são empacotadas ao salvar (lote 62).
  const atlases = doc.atlases.filter((atlas) => !isProvisionalAtlas(atlas));
  const trees = atlases.map((atlas) => (atlas === own?.data
    ? own.packed.atlas
    : atlasToJson(atlas) as unknown as AtlasJson));
  const result = stampPivots(doc.file, trees);

  let foreign = 0;
  const files = atlases.map((atlas, index): DiskAtlas => {
    const text = treeText(result.atlases[index]);
    const changed = edited.has(atlas) || text !== treeText(trees[index]);
    if (own !== null && atlas === own.data) {
      return { name: own.fileName, text, changed, fromImport: true };
    }
    const name = foreignNames[foreign++] ?? `${base}${index === 0 ? '' : `-${index + 1}`}.atlas.json`;
    return { name, text, changed, fromImport: false };
  });
  return { files, fromImport: files.some((file) => file.fromImport), warnings: result.warnings };
}
