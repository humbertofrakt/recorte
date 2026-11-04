/**
 * O pivô de cada imagem, como conta (dono A) — lote 56, plano pivô.
 *
 * Mão fechada e mão aberta são desenhos diferentes, com o pulso em cantos
 * diferentes, e as duas têm que cair no mesmo pulso. Até este lote a troca de
 * imagem escrevia só o `path`: o `x/y` ficava o da imagem velha e, com
 * `width/height` gravados, a §7.3 esticava a nova no tamanho da velha. Era o
 * "pop".
 *
 * A saída (decisão do Humberto, 10/09/2026): **o rig é a fonte da verdade.**
 * O pivô de cada região do atlas (`pivotX`, `pivotY`, §10.3) sai de onde o
 * desenho já está montado no osso, e uma imagem nova é posta pelo pivô dela.
 * Um pivô por imagem; quem precisa de dois duplica a região.
 *
 * Puro: lê o `.bone` e as árvores de atlas e devolve números e árvores novas.
 * Nada aqui toca o DOM nem o documento vivo. A conta é a da §10.3.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { formatNumber } from '../../../runtime/src/index.js';
import type { AtlasJson, AtlasRegionJson } from '../../../ferramentas/src/atlas/packer.js';
// Os pivôs à mão — rodada 13, caso (b). A lista mora em `doc/hand-pivots.ts`,
// porque o documento também a lê ao receber atlas (conserto 1 da conferência);
// aqui ela é reexportada, para quem já a pedia deste módulo.
import { readHandPivots } from '../doc/hand-pivots.js';
export { HAND_PIVOTS, readHandPivots, writeHandPivots } from '../doc/hand-pivots.js';

/** O que a conta lê de uma região: o tamanho original e, se houver, o pivô. */
export interface PivotRegion {
  readonly width: number;
  readonly height: number;
  readonly originalWidth?: number;
  readonly originalHeight?: number;
  readonly pivotX?: number;
  readonly pivotY?: number;
}

/** O que a conta lê de um anexo `region` (§7.3). Ausente = o padrão do formato. */
export interface RegionPose {
  readonly x?: number;
  readonly y?: number;
  readonly rotation?: number;
  readonly scaleX?: number;
  readonly scaleY?: number;
  readonly width?: number;
  readonly height?: number;
}

/** Um desenho, pelo endereço completo: pele, slot e nome. */
export interface AttachmentRef {
  readonly skin: string;
  readonly slot: string;
  readonly attachment: string;
}

/** Dois pivôs mais perto que isto, em px do atlas, são o mesmo pivô. */
export const PIVOT_TOLERANCE = 0.5;

const RAD = Math.PI / 180;

/** Arredonda como o resto do editor, e nunca grava `-0`. */
export function roundPivot(value: number): number {
  const r = Math.round(value * 1e4) / 1e4;
  return r === 0 ? 0 : r;
}

/** `true` quando a região traz pivô gravado. */
export function hasPivot(region: PivotRegion): boolean {
  return region.pivotX !== undefined || region.pivotY !== undefined;
}

/** Tamanho original em px de esqueleto: px do atlas dividido por `scale` (§10.5). */
function originalOf(region: PivotRegion, scale: number): { ow: number; oh: number } {
  return {
    ow: (region.originalWidth ?? region.width) / scale,
    oh: (region.originalHeight ?? region.height) / scale,
  };
}

/**
 * A ida (§10.3): onde a origem do osso cai dentro da imagem, em px do atlas,
 * da esquerda e de baixo. `null` quando a escala do anexo é zero — um desenho
 * achatado não diz onde está o pivô.
 */
export function pivotOf(
  attachment: RegionPose, region: PivotRegion, scale = 1,
): { x: number; y: number } | null {
  const { ow, oh } = originalOf(region, scale);
  const W = attachment.width ?? 0;
  const H = attachment.height ?? 0;
  const kx = W !== 0 && ow !== 0 ? W / ow : 1;
  const ky = H !== 0 && oh !== 0 ? H / oh : 1;
  const sx = (attachment.scaleX ?? 1) * kx;
  const sy = (attachment.scaleY ?? 1) * ky;
  if (sx === 0 || sy === 0) return null;
  const angle = -(attachment.rotation ?? 0) * RAD;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const ax = -(attachment.x ?? 0);
  const ay = -(attachment.y ?? 0);
  const u = ax * c - ay * s;
  const v = ax * s + ay * c;
  return { x: (ow / 2 + u / sx) * scale, y: (oh / 2 + v / sy) * scale };
}

/**
 * A volta (§10.3): o `x/y` que põe o pivô da região na origem do osso, com o
 * giro e a escala do anexo, e sem `width/height` — a imagem no tamanho dela.
 * Região sem pivô = o centro, e a resposta é `(0, 0)`.
 *
 * Com `keepSize` o anexo guarda o `width/height` dele, e a conta os usa: é o
 * Definir pivô (lote 58), que muda o pivô sem trocar a imagem nem o tamanho.
 */
export function placeByPivot(
  region: PivotRegion, attachment: RegionPose = {}, scale = 1, keepSize = false,
): { x: number; y: number } {
  const { ow, oh } = originalOf(region, scale);
  const px = region.pivotX === undefined ? ow / 2 : region.pivotX / scale;
  const py = region.pivotY === undefined ? oh / 2 : region.pivotY / scale;
  const W = keepSize ? attachment.width ?? 0 : 0;
  const H = keepSize ? attachment.height ?? 0 : 0;
  const kx = W !== 0 && ow !== 0 ? W / ow : 1;
  const ky = H !== 0 && oh !== 0 ? H / oh : 1;
  const a = (attachment.scaleX ?? 1) * kx * (px - ow / 2);
  const b = (attachment.scaleY ?? 1) * ky * (py - oh / 2);
  const angle = (attachment.rotation ?? 0) * RAD;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: -(a * c - b * s), y: -(a * s + b * c) };
}

/**
 * **Onde o pivô da imagem cai no espaço do osso** — degrau 8, tarefa 8.1.
 *
 * A §10.3 tem a ida (onde o osso cai dentro da imagem) e a volta (o `x/y` que
 * põe o pivô no osso). Falta o par que a entidade precisa: **o ponto**, no
 * espaço do osso, em que a imagem está encaixada agora.
 *
 * É a `placeByPivot` ao contrário: ela devolve o deslocamento que leva o pivô
 * à origem, então o pivô está em `(x, y) - desse deslocamento`. Região sem
 * pivô = o centro, e a resposta é o `x, y` do anexo — que é exatamente o que a
 * §7.11 chama de "o mesmo par que a imagem do placeholder tinha".
 *
 * `keepSize` porque o `width/height` do anexo estica a imagem, e um pivô numa
 * imagem esticada anda junto.
 */
export function pivotInBone(
  region: PivotRegion, attachment: RegionPose, scale = 1,
): { x: number; y: number } {
  const place = placeByPivot(region, attachment, scale, true);
  return { x: roundPivot((attachment.x ?? 0) - place.x), y: roundPivot((attachment.y ?? 0) - place.y) };
}

/**
 * O `x, y` de um anexo `region` cujo pivô deve cair em `at` — a volta de
 * `pivotInBone`, para quando a entidade vira imagem de novo (8.1).
 */
export function placeAtPivot(
  at: { x: number; y: number }, region: PivotRegion, attachment: RegionPose = {}, scale = 1,
): { x: number; y: number } {
  const place = placeByPivot(region, attachment, scale);
  return { x: roundPivot(at.x + place.x), y: roundPivot(at.y + place.y) };
}

// ---------------------------------------------------------------------------
// Quem usa cada região
// ---------------------------------------------------------------------------

/** Onde uma região mora: o índice do atlas e o dela dentro dele. */
interface Where {
  readonly atlas: number;
  readonly region: number;
}

/** Nome → região, na ordem da §10.5: atlas por atlas, os nomes antes dos apelidos. */
function regionIndex(atlases: readonly AtlasJson[]): Map<string, Where> {
  const index = new Map<string, Where>();
  atlases.forEach((atlas, a) => {
    atlas.regions.forEach((region, r) => {
      if (!index.has(region.name)) index.set(region.name, { atlas: a, region: r });
    });
    atlas.regions.forEach((region, r) => {
      for (const alias of region.aliases ?? []) {
        if (!index.has(alias)) index.set(alias, { atlas: a, region: r });
      }
    });
  });
  return index;
}

interface SequenceLike { count?: number; frames?: string[]; start?: number; digits?: number }

/** As imagens que um anexo `region` pede: o `path`, ou uma por quadro da sequência (§7.10). */
export function imagesOf(name: string, def: Record<string, unknown>): string[] {
  const path = typeof def['path'] === 'string' ? def['path'] : name;
  const seq = def['sequence'] as SequenceLike | undefined | null;
  if (seq === undefined || seq === null || typeof seq !== 'object') return [path];
  if (Array.isArray(seq.frames)) return seq.frames.slice();
  const out: string[] = [];
  for (let i = 0; i < (seq.count ?? 0); i++) out.push(path + formatNumber((seq.start ?? 1) + i, seq.digits ?? 0));
  return out;
}

/** Um anexo `region` usando uma região do atlas. */
export interface RegionUse extends Where {
  readonly ref: AttachmentRef;
  readonly def: RegionPose;
}

/**
 * Todo anexo `region` de toda pele, com a região que ele usa. Uma sequência
 * entra uma vez por quadro. Malha fica de fora: ela tem vértices e UV, e o
 * pivô é de `region` (plano pivô, "o que fica de fora").
 */
export function regionUses(file: BoneFile, atlases: readonly AtlasJson[]): RegionUse[] {
  const index = regionIndex(atlases);
  const out: RegionUse[] = [];
  for (const skin of file.skins ?? []) {
    for (const [slot, map] of Object.entries(skin.attachments ?? {})) {
      for (const [attachment, raw] of Object.entries(map ?? {})) {
        if (raw === null || typeof raw !== 'object') continue;
        const def = raw as unknown as Record<string, unknown>;
        if ((def['type'] ?? 'region') !== 'region') continue;
        for (const image of imagesOf(attachment, def)) {
          const where = index.get(image);
          if (where === undefined) continue;
          out.push({ ...where, ref: { skin: skin.name, slot, attachment }, def: def as RegionPose });
        }
      }
    }
  }
  return out;
}

/** O anexo de um endereço, ou `null`. */
export function findAttachmentDef(file: BoneFile, ref: AttachmentRef): Record<string, unknown> | null {
  const skin = (file.skins ?? []).find((s) => s.name === ref.skin);
  const def = skin?.attachments?.[ref.slot]?.[ref.attachment];
  return def === undefined || def === null || typeof def !== 'object'
    ? null
    : def as unknown as Record<string, unknown>;
}

/**
 * Os endereços de `slot/attachment` que mostram a imagem `image`, em toda
 * pele. A seleção da Árvore não diz a pele; o mesmo nome em duas peles é a
 * mesma peça para a linha do tempo, então as duas vão juntas.
 */
export function refsUsing(file: BoneFile, slot: string, attachment: string, image: string): AttachmentRef[] {
  const out: AttachmentRef[] = [];
  for (const skin of file.skins ?? []) {
    const def = findAttachmentDef(file, { skin: skin.name, slot, attachment });
    if (def === null || (def['type'] ?? 'region') !== 'region' || def['sequence'] !== undefined) continue;
    const path = typeof def['path'] === 'string' ? def['path'] : attachment;
    if (path === image) out.push({ skin: skin.name, slot, attachment });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Carimbar
// ---------------------------------------------------------------------------

/** Uma imagem que o rig usa com pivôs diferentes. */
export interface PivotConflict {
  /** O nome da região no atlas. */
  readonly image: string;
  /** Quantos desenhos usam a imagem. */
  readonly count: number;
  /** Os desenhos, um grupo por pivô. O primeiro fica com a região; cada outro pede uma cópia. */
  readonly groups: ReadonlyArray<readonly AttachmentRef[]>;
}

export interface StampResult {
  /** As árvores, carimbadas. As de entrada não mudam. */
  readonly atlases: AtlasJson[];
  /** Um aviso por imagem com pivôs diferentes, em português. */
  readonly warnings: string[];
  readonly conflicts: PivotConflict[];
  /** Regiões que saíram com pivô. */
  readonly stamped: number;
  /** Delas, quantas mudaram de valor. */
  readonly changed: number;
  /**
   * Rodada 13: as imagens com pivô à mão — o carimbo não as recalculou, usou
   * o número da lista. Opcional para quem monta o resultado à mão.
   */
  readonly skipped?: readonly string[];
}

/** O aviso de uma imagem usada com pivôs diferentes. */
export function conflictWarning(image: string, count: number): string {
  return `imagem "${image}" é usada em ${count} lugares com pivôs diferentes; duplique no atlas`;
}

const refKey = (ref: AttachmentRef): string => `${ref.skin} ${ref.slot} ${ref.attachment}`;

/**
 * Carimba o pivô de cada região a partir do rig.
 *
 * Para cada região, junta todo anexo `region` que a usa, em toda pele. Um só,
 * ou todos concordando em até meio pixel → grava o pivô. Dois ou mais
 * discordando → não toca no pivô, e devolve o aviso: um pivô por imagem, e
 * quem quer dois duplica. Região que ninguém usa fica como estava — é assim
 * que a mão aberta guarda o pivô depois de ser trocada pela fechada.
 */
export function stampPivots(file: BoneFile, atlases: readonly AtlasJson[]): StampResult {
  const out = atlases.map((atlas) => JSON.parse(JSON.stringify(atlas)) as AtlasJson);
  const byRegion = new Map<string, RegionUse[]>();
  for (const use of regionUses(file, out)) {
    const key = `${use.atlas}:${use.region}`;
    const list = byRegion.get(key);
    if (list === undefined) byRegion.set(key, [use]);
    else list.push(use);
  }

  const warnings: string[] = [];
  const conflicts: PivotConflict[] = [];
  let stamped = 0;
  let changed = 0;
  const hand = readHandPivots(file);
  const skipped: string[] = [];
  for (const uses of byRegion.values()) {
    const tree = out[uses[0]!.atlas]!;
    const target = tree.regions[uses[0]!.region]!;
    const scale = tree.scale ?? 1;

    // Rodada 13, caso (b): o pivô à mão vale no lugar do recalculado.
    const mark = hand[target.name] ?? (target.aliases ?? []).map((a) => hand[a]).find((m) => m !== undefined);
    if (mark !== undefined) {
      const x = roundPivot(mark[0]);
      const y = roundPivot(mark[1]);
      if (target.pivotX !== x || target.pivotY !== y) changed++;
      target.pivotX = x;
      target.pivotY = y;
      stamped++;
      skipped.push(target.name);
      continue;
    }

    const groups: Array<{ pivot: { x: number; y: number }; refs: Map<string, AttachmentRef> }> = [];
    for (const use of uses) {
      const pivot = pivotOf(use.def, target, scale);
      if (pivot === null) continue;
      let group = groups.find((g) => Math.abs(g.pivot.x - pivot.x) <= PIVOT_TOLERANCE
        && Math.abs(g.pivot.y - pivot.y) <= PIVOT_TOLERANCE);
      if (group === undefined) {
        group = { pivot, refs: new Map() };
        groups.push(group);
      }
      group.refs.set(refKey(use.ref), use.ref);
    }
    if (groups.length === 0) continue;

    if (groups.length > 1) {
      const count = new Set(uses.map((use) => refKey(use.ref))).size;
      warnings.push(conflictWarning(target.name, count));
      conflicts.push({ image: target.name, count, groups: groups.map((g) => [...g.refs.values()]) });
      continue;
    }

    const x = roundPivot(groups[0]!.pivot.x);
    const y = roundPivot(groups[0]!.pivot.y);
    if (target.pivotX !== x || target.pivotY !== y) changed++;
    target.pivotX = x;
    target.pivotY = y;
    stamped++;
  }
  return { atlases: out, warnings, conflicts, stamped, changed, skipped };
}

/** A frase do rodapé depois de carimbar. */
export function stampNotice(result: Pick<StampResult, 'stamped' | 'changed' | 'conflicts' | 'skipped'>): string {
  if (result.stamped === 0 && result.conflicts.length === 0) {
    return 'Nenhum desenho montado usa imagem do atlas: não há pivô para carimbar';
  }
  // Rodada 13: as de pivô à mão não são recalculadas, e o rodapé diz.
  const pulei = result.skipped?.length ?? 0;
  const mao = pulei === 0 ? ''
    : `. ${pulei === 1 ? '1 imagem tem pivô à mão e ficou com ele' : `${pulei} imagens têm pivô à mão e ficaram com ele`}`
      + ': "Voltar o pivô para o osso" desfaz';
  const feitos = result.stamped === 1 ? '1 pivô carimbado' : `${result.stamped} pivôs carimbados`;
  const mudaram = result.changed === 0 ? 'nenhum mudou'
    : result.changed === 1 ? '1 mudou' : `${result.changed} mudaram`;
  const k = result.conflicts.length;
  const aviso = k === 0 ? ''
    : k === 1 ? '. 1 imagem tem pivôs diferentes: veja o painel Imagens'
      : `. ${k} imagens têm pivôs diferentes: veja o painel Imagens`;
  return `${feitos} (${mudaram})${mao}${aviso}`;
}

// ---------------------------------------------------------------------------
// Duplicar no atlas
// ---------------------------------------------------------------------------

/**
 * Copia a região `name` para `name_2` — mesma página, mesmo retângulo, mesmo
 * pivô, sem apelidos —, logo depois da original, para as duas ficarem vizinhas
 * no painel. O nome é único entre os nomes e apelidos da árvore e os de
 * `taken`: `mao_2` já existe, sai `mao_3`. `null` quando a região não existe.
 */
export function duplicateRegion(
  atlas: AtlasJson, name: string, taken: Iterable<string> = [],
): { atlas: AtlasJson; name: string } | null {
  const tree = JSON.parse(JSON.stringify(atlas)) as AtlasJson;
  let at = tree.regions.findIndex((r) => r.name === name);
  if (at < 0) at = tree.regions.findIndex((r) => (r.aliases ?? []).includes(name));
  if (at < 0) return null;

  const used = new Set(taken);
  for (const region of tree.regions) {
    used.add(region.name);
    for (const alias of region.aliases ?? []) used.add(alias);
  }
  let fresh = `${name}_2`;
  for (let i = 3; used.has(fresh); i++) fresh = `${name}_${i}`;

  const copy: AtlasRegionJson = { ...tree.regions[at]!, name: fresh };
  delete copy.aliases;
  tree.regions.splice(at + 1, 0, copy);
  return { atlas: tree, name: fresh };
}

// ---------------------------------------------------------------------------
// Trocar a imagem de um desenho
// ---------------------------------------------------------------------------

/** O anexo inteiro como estava, na ordem das chaves, para o `revert` dar o mesmo texto. */
export type DefSnapshot = ReadonlyArray<readonly [string, unknown]>;

export function snapshotDef(def: Record<string, unknown>): DefSnapshot {
  return Object.entries(def).map(([key, value]) => [key, value] as const);
}

export function restoreDef(def: Record<string, unknown>, snapshot: DefSnapshot): void {
  for (const key of Object.keys(def)) delete def[key];
  for (const [key, value] of snapshot) def[key] = value;
}

/**
 * Troca a imagem de um anexo e o põe no lugar pelo pivô da região nova.
 *
 * - `region` (tipo ausente ou `"region"`), sem sequência: com pivô, `x/y` por
 *   `placeByPivot`; sem pivô, `x/y` ficam. Nos dois casos `width/height`
 *   saem: a imagem nova sai no tamanho dela, sem esticar. Giro e escala ficam.
 * - Malha, malha ligada e sequência: só o `path`. Malha tem vértices e UV.
 */
export function swapImage(
  def: Record<string, unknown>, image: string, region: PivotRegion | null, scale = 1,
  /**
   * **A região da imagem que SAI** — H1, decisão P15 (29/09/2026). Opcional:
   * sem ela, a conta é a de antes (o pivô novo vai para a origem do osso).
   *
   * Com ela, a imagem nova entra *"no lugar da atual, pelos pivôs das duas"*,
   * como o Spriter diz: o pivô da nova cai ONDE ESTAVA o pivô da velha. Duas
   * mãos com o mesmo pivô trocam sem mexer um pixel. Antes, num desenho solto,
   * a mão pulava 12 px — o pivô velho estava longe da origem, e a conta o
   * ignorava. A forma: *pus o pivô na origem do osso, e não onde ele estava*.
   * `null` = a imagem velha não tem região: vale o centro dela.
   */
  oldRegion?: PivotRegion | null,
  oldScale = scale,
): void {
  if (oldRegion !== undefined && region !== null
    && (def['type'] ?? 'region') === 'region' && def['sequence'] === undefined) {
    const velha: PivotRegion = oldRegion ?? {
      width: typeof def['width'] === 'number' ? def['width'] as number : region.width,
      height: typeof def['height'] === 'number' ? def['height'] as number : region.height,
    };
    const at = pivotInBone(velha, def as RegionPose, oldScale);
    def['path'] = image;
    delete def['width'];
    delete def['height'];
    const place = placeAtPivot(at, region, def as RegionPose, scale);
    def['x'] = place.x;
    def['y'] = place.y;
    return;
  }
  def['path'] = image;
  if ((def['type'] ?? 'region') !== 'region' || def['sequence'] !== undefined) return;
  if (region !== null && hasPivot(region)) {
    const at = placeByPivot(region, def as RegionPose, scale);
    def['x'] = roundPivot(at.x);
    def['y'] = roundPivot(at.y);
  }
  delete def['width'];
  delete def['height'];
}

// ---------------------------------------------------------------------------
// O pivô à mão — lote 58, para a imagem que ainda não tem rig
// ---------------------------------------------------------------------------

/** Onde a imagem `image` mora nas árvores (§10.5), ou `null`. */
export function findRegion(atlases: readonly AtlasJson[], image: string): { atlas: number; region: number } | null {
  return regionIndex(atlases).get(image) ?? null;
}

/**
 * Os desenhos `region` que usam a imagem, e que um pivô novo recoloca.
 * Sequência fica de fora: um quadro não pode mover o anexo dos outros quadros.
 */
export function pivotUsers(file: BoneFile, atlases: readonly AtlasJson[], image: string): AttachmentRef[] {
  const where = findRegion(atlases, image);
  if (where === null) return [];
  const out = new Map<string, AttachmentRef>();
  for (const use of regionUses(file, atlases)) {
    if (use.atlas !== where.atlas || use.region !== where.region) continue;
    if ((use.def as Record<string, unknown>)['sequence'] !== undefined) continue;
    out.set(refKey(use.ref), use.ref);
  }
  return [...out.values()];
}

/** Os nove pontos da janela: cantos, meios e centro. */
export type NinePoint = 'nw' | 'n' | 'ne' | 'w' | 'c' | 'e' | 'sw' | 's' | 'se';

/** Na ordem da grade 3×3, com o nome por extenso para a dica. */
export const NINE_POINTS: ReadonlyArray<{ id: NinePoint; label: string; glyph: string }> = [
  { id: 'nw', label: 'Canto de cima, à esquerda', glyph: '↖' },
  { id: 'n', label: 'Meio de cima', glyph: '↑' },
  { id: 'ne', label: 'Canto de cima, à direita', glyph: '↗' },
  { id: 'w', label: 'Meio da esquerda', glyph: '←' },
  { id: 'c', label: 'Centro', glyph: '•' },
  { id: 'e', label: 'Meio da direita', glyph: '→' },
  { id: 'sw', label: 'Canto de baixo, à esquerda', glyph: '↙' },
  { id: 's', label: 'Meio de baixo', glyph: '↓' },
  { id: 'se', label: 'Canto de baixo, à direita', glyph: '↘' },
];

/** O pivô de um dos nove pontos, em px da imagem original, da esquerda e de baixo. */
export function ninePoint(id: NinePoint, ow: number, oh: number): { x: number; y: number } {
  const x = id.endsWith('w') ? 0 : id.endsWith('e') ? ow : ow / 2;
  const y = id.startsWith('n') ? oh : id.startsWith('s') ? 0 : oh / 2;
  return { x, y };
}

/**
 * O pivô de um clique na imagem da janela: `(x, y)` em px de tela, do canto de
 * cima; a imagem mostrada com `screenW × screenH`. O pivô conta de baixo.
 */
export function pivotFromClick(
  x: number, y: number, screenW: number, screenH: number, ow: number, oh: number,
): { x: number; y: number } {
  return {
    x: roundPivot(screenW === 0 ? 0 : (x / screenW) * ow),
    y: roundPivot(screenH === 0 ? 0 : oh - (y / screenH) * oh),
  };
}

/**
 * Colar um pivô de uma imagem em outra, como o Spriter: a **proporção** viaja
 * (0..1), porque px de uma imagem não querem dizer nada numa de outro tamanho.
 */
export function pastePivot(
  pivot: { x: number; y: number }, from: { ow: number; oh: number }, to: { ow: number; oh: number },
): { x: number; y: number } {
  return {
    x: roundPivot(from.ow === 0 ? to.ow / 2 : (pivot.x / from.ow) * to.ow),
    y: roundPivot(from.oh === 0 ? to.oh / 2 : (pivot.y / from.oh) * to.oh),
  };
}

/**
 * O desenho SOLTO: o slot mora no osso raiz — decisões P65 e P67 (29/09/2026).
 *
 * É onde o arrasto da aba Imagens põe a imagem (`dropPlace`), e é o que a
 * pessoa chama de "sem osso". Um desenho que o `.bone` não liga a slot nenhum
 * (o teste monta assim) não é solto: vale a conta de sempre.
 */
export function isLooseDrawing(file: BoneFile, ref: AttachmentRef): boolean {
  const root = file.bones?.[0]?.name;
  const slot = (file.slots ?? []).find((s) => s.name === ref.slot);
  return root !== undefined && slot !== undefined && slot.bone === root;
}

/**
 * Os que usam a imagem, separados: presos a um osso de verdade, e soltos (no
 * osso raiz) — decisão P67. Hoje o Definir pivô recoloca OS DOIS (plano de
 * 10/09). Os números existem para a janela do chat H poder dizer a diferença
 * quando o Humberto responder se o solto deve ficar parado.
 */
export function pivotUsersSplit(
  file: BoneFile, atlases: readonly AtlasJson[], image: string,
): { bound: AttachmentRef[]; loose: AttachmentRef[] } {
  const bound: AttachmentRef[] = [];
  const loose: AttachmentRef[] = [];
  for (const ref of pivotUsers(file, atlases, image)) (isLooseDrawing(file, ref) ? loose : bound).push(ref);
  return { bound, loose };
}

/** Um número do rodapé: uma casa depois da vírgula, e nunca `-0` — "30, 1,8381" não se lê. */
function shortNumber(v: number): string {
  const r = Math.round(v * 10) / 10;
  return String(r === 0 ? 0 : r).replace('.', ',');
}

/** O que o rodapé conta além do pivô — P67. Opcional: sem isso a frase é a de antes. */
export interface PivotNoticeExtra {
  /** Para onde cada desenho recolocado foi, no espaço do osso (`SetPivotCommand.moves`). */
  moves?: ReadonlyArray<{ from: { x: number; y: number }; to: { x: number; y: number } }>;
  /** Rodada 13: os desenhos que ficaram parados (o osso próprio foi para o pivô). */
  still?: number;
  /** Rodada 13: as animações com giro, onde entre as chaves a imagem gira em volta do pivô novo. */
  turning?: readonly string[];
  /** Rodada 13: o pivô ficou na lista dos pivôs à mão (o osso não está nele). */
  hand?: boolean;
}

/** O fim da frase do pivô — rodada 13: o que ficou parado, e o que muda entre as chaves. */
export function pivotStillTail(extra: PivotNoticeExtra): string {
  const still = extra.still ?? 0;
  let out = still === 0 ? '' : still === 1 ? '. 1 desenho ficou parado' : `. ${still} desenhos ficaram parados`;
  const turning = extra.turning ?? [];
  if (turning.length > 0) {
    out += `. Entre as chaves de "${turning[0]}"${turning.length > 1 ? ` e mais ${turning.length - 1}` : ''}, `
      + 'a imagem passa a girar em volta do pivô novo';
  }
  if (extra.hand === true) out += '. O pivô fica guardado à mão: o osso não está nele';
  return out;
}

/**
 * A frase do rodapé depois de definir ou colar um pivô.
 *
 * H2, decisão P67 (29/09/2026): diz PARA ONDE o desenho foi. Antes dizia "1
 * desenho recolocado", e a cabeça tinha ido de (150, 100) para (0, 28) sem
 * ninguém saber — *fez e não avisou*. Com vários, o primeiro por extenso e
 * "e mais N". Uma casa depois da vírgula: "30, 1,8381" não se lê.
 */
export function pivotNotice(
  image: string, pivot: { x: number; y: number }, moved: number, extra: PivotNoticeExtra = {},
): string {
  const p = (at: { x: number; y: number }): string => `(${shortNumber(at.x)}; ${shortNumber(at.y)})`;
  const moves = extra.moves ?? [];
  let quem = moved === 0 ? '' : moved === 1 ? '. 1 desenho recolocado' : `. ${moved} desenhos recolocados`;
  if (moved > 0 && moves.length > 0) {
    const primeiro = moves[0]!;
    quem += `, de ${p(primeiro.from)} para ${p(primeiro.to)}`;
    if (moved > 1) quem += ` e mais ${moved - 1}`;
  }
  return `Pivô de "${image}": ${shortNumber(pivot.x)}, ${shortNumber(pivot.y)}${quem}${pivotStillTail(extra)}`;
}
