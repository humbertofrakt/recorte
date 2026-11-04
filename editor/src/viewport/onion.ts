/**
 * Onion skin and the display settings store (owner D, requirement A4).
 *
 * Two things live here, and they live together on purpose: the onion skin is
 * the biggest reader of the display settings, and the settings must be
 * reachable from both the viewport and the "Exibição" panel without either
 * one importing the other.
 *
 *   1. `viewSettings()` — what the drawing area shows: bones, names, boxes,
 *      points, meshes, edges, weights, grid, axes, background, onion skin.
 *      Pure state plus listeners; nothing here touches the DOM.
 *   2. The onion skin itself: N ghosts before and N ghosts after the current
 *      time, drawn from a SECOND `Skeleton` instance posed at the ghost time.
 *      The document's own skeleton is never touched, so opening the onion
 *      skin can never damage the pose the user is editing.
 *
 * The X/Y offset exists for one job: dragging the ghosts sideways lines up a
 * walk cycle pass against itself, which is how a foot that slips is found.
 */

import {
  CanvasRenderer,
  pose,
  type AnimationData,
  type AtlasPageData,
  type AnimationDef,
  type Bone,
  type BoneFile,
  type Skeleton as RuntimeSkeleton,
  type SkeletonData,
  type Slot,
} from '../../../runtime/src/index.js';
import { Skeleton } from '../../../runtime/src/index.js';
import { corpoDe, readEditorState, writeEditorState, type EditorDoc, type EditorState, type Selection } from '../contract.js';
import { pruneSelection } from '../doc/prune-selection.js';
import { parseGuides, type Guide } from './guides-model.js';

// ---------------------------------------------------------------------------
// Display settings
// ---------------------------------------------------------------------------

/** Everything the onion skin needs to know. Times are seconds. */
export interface OnionSettings {
  /** `false` draws nothing at all. */
  enabled: boolean;
  /** How many ghosts before the current time. */
  before: number;
  /** How many ghosts after the current time. */
  after: number;
  /** Seconds between one ghost and the next, when `onlyKeys` is off. */
  step: number;
  /** `true` puts the ghosts on the animation's own key times instead. */
  onlyKeys: boolean;
  /** `true` fills the drawings instead of drawing the bones. */
  silhouette: boolean;
  /** Opacity of the NEAREST ghost, 0 to 1. The others fade from it. */
  opacity: number;
  /** Colour of the ghosts before the current time. */
  colorBefore: string;
  /** Colour of the ghosts after the current time. */
  colorAfter: string;
  /** World units each ghost is pushed sideways, multiplied by its order. */
  offsetX: number;
  /** World units each ghost is pushed up or down, multiplied by its order. */
  offsetY: number;
}

/**
 * O que "Ver só o resultado" desliga, guardado para poder religar.
 *
 * Só os interruptores que ele mexe, e não o `ViewSettings` inteiro: guardar o
 * todo faria o modo devolver também o que a pessoa mudou de propósito enquanto
 * ele estava ligado, e isso é desfazer o trabalho dela.
 */
export type CleanSnapshot = Partial<Record<CleanKey, boolean>>;

/** Os interruptores que "Ver só o resultado" desliga. */
export type CleanKey =
  | 'bones' | 'boneNames' | 'points' | 'boundingBoxes' | 'clippings'
  | 'meshes' | 'edges' | 'weights' | 'grid' | 'axes';

export const CLEAN_KEYS: readonly CleanKey[] = Object.freeze([
  'bones', 'boneNames', 'points', 'boundingBoxes', 'clippings',
  'meshes', 'edges', 'weights', 'grid', 'axes',
]);

/** What the drawing area shows. Every field is a checkbox in the panel. */
export interface ViewSettings {
  bones: boolean;
  boneNames: boolean;
  boundingBoxes: boolean;
  points: boolean;
  meshes: boolean;
  edges: boolean;
  weights: boolean;
  /**
   * Nomes escritos na cena, um interruptor por tipo — item 20.
   *
   * `boneNames` já existia. Os três de baixo entraram com a Exibição em três
   * colunas: a coluna "nome" não podia ter uma caixa que não acendesse nada,
   * então cada uma delas desenha mesmo o nome do seu tipo.
   *
   * Máscara e malha não têm caixa de nome: a máscara é um contorno tracejado
   * sem nome próprio na cena, e a malha é o desenho — o nome dela é o do slot,
   * que já tem interruptor. Caixa vazia é melhor que caixa morta.
   */
  slotNames: boolean;
  pointNames: boolean;
  boxNames: boolean;
  grid: boolean;
  /**
   * As réguas com números, em cima e à esquerda — lote 21, rodada 3.
   *
   * Padrão **ligado**. A grade diz "de quanto em quanto" e os eixos dizem onde
   * é o zero; nenhum dos dois diz **em que número eu estou**, e as posições do
   * formato são números que se digitam.
   */
  rulers: boolean;
  /**
   * As guias da cena — lote 42. `guides` é a lista; `showGuides` desenha e
   * imanta; `lockGuides` impede de criar outra pela régua.
   *
   * Moram aqui, em `RECORTE_editor_state.view`, e nunca no núcleo do `.bone`:
   * uma guia é de quem monta, não do personagem (regra 6 da casa).
   */
  guides: Guide[];
  showGuides: boolean;
  lockGuides: boolean;
  /**
   * De quantos pixels de tela a grade não pode chegar mais perto — item 106.
   *
   * A grade não tem um tamanho fixo em unidades do mundo: ela se refaz a cada
   * zoom para as linhas ficarem em 1, 2, 5, 10... e nunca virarem um borrão.
   * Este número é o que se pode ajustar: menor = grade mais fina.
   */
  gridPixels: number;
  axes: boolean;
  /** The drawings themselves (regions and meshes). Off = only the rig. */
  drawings: boolean;
  /**
   * Máscaras (`clipping`) desenhadas como polígono tracejado — item 47.
   *
   * Uma máscara não desenha nada no jogo: ela só recorta. Se o editor também
   * não a desenhasse, o artista veria o efeito e não veria a causa, e não teria
   * onde clicar para ajustá-la.
   */
  clippings: boolean;
  /**
   * Locks — the button Spriter users praise most. A locked thing is still
   * drawn, but the pointer passes through it: no click, no box, no drag.
   * `lockBones` and `lockDrawings` lock a whole kind; the two lists lock one
   * bone or one slot by name. Editor state only: never in the runtime.
   */
  lockBones: boolean;
  lockDrawings: boolean;
  lockedBones: string[];
  lockedSlots: string[];
  /**
   * Escondidos, um a um — item 57.
   *
   * **Escondido é diferente de travado.** Travado aparece e não pega clique;
   * escondido não aparece e também não pega. Os dois existem porque as duas
   * perguntas são diferentes: "não quero esbarrar nisto" e "isto está na
   * frente do que eu preciso ver".
   */
  hiddenBones: string[];
  hiddenSlots: string[];
  /**
   * O que estava ligado antes de "Ver só o resultado" — item 61.
   *
   * `null` quando o modo está desligado. Guardar o que estava ligado é o que
   * permite VOLTAR ao que era: um botão que desliga dez coisas e não sabe
   * religá-las é um botão que obriga a remarcar dez caixas à mão.
   */
  cleanView: CleanSnapshot | null;
  /** Etiqueta com o nome do que está sob o cursor, na cena — item 59. */
  hoverNames: boolean;
  /** Background of the drawing area, as `#rrggbb`. */
  background: string;
  /**
   * Clicar noutra animação tocando — lote 46: `terminar` deixa a atual chegar
   * ao fim; `na-hora` troca já. É do tocador, não do personagem, e por isso
   * mora aqui, no `RECORTE_editor_state`.
   */
  switchMode: 'terminar' | 'na-hora';
  onion: OnionSettings;
}

export const DEFAULT_ONION: Readonly<OnionSettings> = Object.freeze({
  enabled: false,
  before: 2,
  after: 2,
  step: 1 / 12,
  onlyKeys: false,
  silhouette: false,
  opacity: 0.5,
  // Warm for the past, cool for the future: two hues nobody confuses.
  colorBefore: '#c23a1b',
  colorAfter: '#1b5fc2',
  offsetX: 0,
  offsetY: 0,
});

export const DEFAULT_VIEW: Readonly<ViewSettings> = Object.freeze({
  bones: true,
  boneNames: false,
  boundingBoxes: true,
  points: true,
  meshes: true,
  edges: false,
  weights: false,
  slotNames: false,
  pointNames: false,
  boxNames: false,
  grid: true,
  rulers: true,
  guides: [],
  showGuides: true,
  lockGuides: false,
  gridPixels: 48,
  axes: true,
  drawings: true,
  clippings: true,
  lockBones: false,
  lockDrawings: false,
  lockedBones: [],
  lockedSlots: [],
  hiddenBones: [],
  hiddenSlots: [],
  cleanView: null,
  hoverNames: false,
  background: '#f2f2f0',
  switchMode: 'terminar',
  onion: DEFAULT_ONION,
});

let current: ViewSettings = { ...DEFAULT_VIEW, onion: { ...DEFAULT_ONION } };
const listeners = new Set<(settings: ViewSettings) => void>();

/** The settings in use. Never change the object; call `setViewSettings`. */
export function viewSettings(): Readonly<ViewSettings> {
  return current;
}

/** Changes some settings and tells everyone who is listening. */
export function setViewSettings(
  patch: Partial<Omit<ViewSettings, 'onion'>> & { onion?: Partial<OnionSettings> },
): void {
  const onion = patch.onion === undefined
    ? current.onion
    : { ...current.onion, ...patch.onion };
  current = { ...current, ...patch, onion };
  for (const listener of listeners) listener(current);
}

/** Puts every setting back to its default. */
export function resetViewSettings(): void {
  current = { ...DEFAULT_VIEW, onion: { ...DEFAULT_ONION } };
  for (const listener of listeners) listener(current);
}

/** Notifies on every change. Returns the function that stops it. */
export function onViewSettings(listener: (settings: ViewSettings) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------------------------------------------------------------------------
// Where the settings are kept between sessions
// ---------------------------------------------------------------------------

/**
 * Key of the display settings inside the `RECORTE_editor_state` extension.
 *
 * The settings ride inside the document, like the camera and the selection do:
 * a `.bone` opened again shows what its author was looking at. A reader that
 * does not know the extension ignores the whole thing (spec 12.1).
 */
export const VIEW_STATE_KEY = 'view';

/** Same key in the browser's storage, for a document that was never saved. */
export const VIEW_STORAGE_KEY = 'RECORTE_editor_state.view';

/** Reads one boolean out of loose JSON. */
function readBool(source: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = source[key];
  return typeof value === 'boolean' ? value : fallback;
}

/** Reads one finite number out of loose JSON. */
function readNumber(source: Record<string, unknown>, key: string, fallback: number): number {
  const value = source[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Reads a list of names out of loose JSON; anything else is an empty list. */
function readNames(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

/** Reads one `#rrggbb` out of loose JSON. */
function readColor(source: Record<string, unknown>, key: string, fallback: string): string {
  const value = source[key];
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

/**
 * Settings from loose JSON, with every missing or broken field replaced by its
 * default. Nothing here throws: a hand-edited file must still open.
 */
export function parseViewSettings(saved: unknown): ViewSettings {
  const source = (saved && typeof saved === 'object' ? saved : {}) as Record<string, unknown>;
  const onionSource = (source.onion && typeof source.onion === 'object'
    ? source.onion
    : {}) as Record<string, unknown>;
  return {
    bones: readBool(source, 'bones', DEFAULT_VIEW.bones),
    boneNames: readBool(source, 'boneNames', DEFAULT_VIEW.boneNames),
    boundingBoxes: readBool(source, 'boundingBoxes', DEFAULT_VIEW.boundingBoxes),
    points: readBool(source, 'points', DEFAULT_VIEW.points),
    meshes: readBool(source, 'meshes', DEFAULT_VIEW.meshes),
    edges: readBool(source, 'edges', DEFAULT_VIEW.edges),
    weights: readBool(source, 'weights', DEFAULT_VIEW.weights),
    grid: readBool(source, 'grid', DEFAULT_VIEW.grid),
    // Um `view` gravado antes do lote 21 não tem este campo, e um `"sim"` de
    // uma mão que editou o JSON não é `true`: os dois voltam ao padrão.
    rulers: readBool(source, 'rulers', DEFAULT_VIEW.rulers),
    // Campos do lote 42. Um `view` de antes não os tem: sem guia nenhuma, e as
    // caixas no padrão.
    guides: parseGuides(source['guides']),
    showGuides: readBool(source, 'showGuides', DEFAULT_VIEW.showGuides),
    lockGuides: readBool(source, 'lockGuides', DEFAULT_VIEW.lockGuides),
    axes: readBool(source, 'axes', DEFAULT_VIEW.axes),
    drawings: readBool(source, 'drawings', DEFAULT_VIEW.drawings),
    // Um `view` gravado antes do lote 6 não tem este campo: ele volta no padrão,
    // e um arquivo velho continua abrindo.
    clippings: readBool(source, 'clippings', DEFAULT_VIEW.clippings),
    lockBones: readBool(source, 'lockBones', DEFAULT_VIEW.lockBones),
    lockDrawings: readBool(source, 'lockDrawings', DEFAULT_VIEW.lockDrawings),
    lockedBones: readNames(source, 'lockedBones'),
    lockedSlots: readNames(source, 'lockedSlots'),
    // Campos do lote 7. Um `view` gravado antes dele não os tem: eles voltam
    // vazios, e o arquivo velho continua abrindo igual.
    hiddenBones: readNames(source, 'hiddenBones'),
    hiddenSlots: readNames(source, 'hiddenSlots'),
    cleanView: readClean(source['cleanView']),
    hoverNames: readBool(source, 'hoverNames', DEFAULT_VIEW.hoverNames),
    background: readColor(source, 'background', DEFAULT_VIEW.background),
    // Lote 46. Qualquer coisa que não seja `na-hora` volta ao padrão.
    switchMode: source['switchMode'] === 'na-hora' ? 'na-hora' : 'terminar',
    // Campos do lote 12. Um `view` gravado antes dele não os tem: voltam
    // desligados, e o arquivo velho continua abrindo.
    slotNames: readBool(source, 'slotNames', DEFAULT_VIEW.slotNames),
    pointNames: readBool(source, 'pointNames', DEFAULT_VIEW.pointNames),
    boxNames: readBool(source, 'boxNames', DEFAULT_VIEW.boxNames),
    // Fora de 8..400 não é grade: é uma tela preta de linhas, ou nenhuma linha.
    gridPixels: Math.min(400, Math.max(8, readNumber(source, 'gridPixels', DEFAULT_VIEW.gridPixels))),
    onion: {
      enabled: readBool(onionSource, 'enabled', DEFAULT_ONION.enabled),
      before: Math.max(0, Math.round(readNumber(onionSource, 'before', DEFAULT_ONION.before))),
      after: Math.max(0, Math.round(readNumber(onionSource, 'after', DEFAULT_ONION.after))),
      step: Math.max(1e-4, readNumber(onionSource, 'step', DEFAULT_ONION.step)),
      onlyKeys: readBool(onionSource, 'onlyKeys', DEFAULT_ONION.onlyKeys),
      silhouette: readBool(onionSource, 'silhouette', DEFAULT_ONION.silhouette),
      opacity: Math.min(1, Math.max(0, readNumber(onionSource, 'opacity', DEFAULT_ONION.opacity))),
      colorBefore: readColor(onionSource, 'colorBefore', DEFAULT_ONION.colorBefore),
      colorAfter: readColor(onionSource, 'colorAfter', DEFAULT_ONION.colorAfter),
      offsetX: readNumber(onionSource, 'offsetX', DEFAULT_ONION.offsetX),
      offsetY: readNumber(onionSource, 'offsetY', DEFAULT_ONION.offsetY),
    },
  };
}

/** The display settings saved inside `file`, or the defaults. */
export function readViewState(file: BoneFile): ViewSettings {
  const state = readEditorState(file) as EditorState & Record<string, unknown>;
  return parseViewSettings(state[VIEW_STATE_KEY]);
}

/** Writes the settings into the file's editor extension, keeping the rest. */
export function writeViewState(file: BoneFile, settings: ViewSettings = current): void {
  const state = readEditorState(file) as EditorState & Record<string, unknown>;
  state[VIEW_STATE_KEY] = {
    ...settings,
    lockedBones: [...settings.lockedBones],
    lockedSlots: [...settings.lockedSlots],
    guides: settings.guides.map((guide) => ({ ...guide })),
    onion: { ...settings.onion },
  };
  writeEditorState(file, state);
}

// ---------------------------------------------------------------------------
// Locks: one place to flip them, so the keyboard, the toolbar, the panel and
// the tree all agree, and the file and the browser both remember.
// ---------------------------------------------------------------------------

/** Which kinds of thing the pointer must pass through. */
export interface PickLocks {
  readonly lockBones: boolean;
  readonly lockDrawings: boolean;
  readonly lockedBones: ReadonlySet<string>;
  readonly lockedSlots: ReadonlySet<string>;
  /** Escondidos um a um: não desenham e não pegam clique — item 57. */
  readonly hiddenBones: ReadonlySet<string>;
  readonly hiddenSlots: ReadonlySet<string>;
  /**
   * Os ossos estão à vista ("Ver ossos") — rodada 8d. Aí o osso desenhado por
   * cima da imagem pega o clique antes dela, pelo corpo. Opcional: sem ele, a
   * ordem de sempre (desenhos primeiro), e é o que `NO_LOCKS` diz.
   */
  readonly bonesOnTop?: boolean;
  /**
   * Os ossos que a pilha de peles tira da cena — rodada 12 (S8, S9). Não
   * desenham e não pegam clique, como os escondidos. Opcional: sem ele, nenhum.
   */
  readonly goneBones?: ReadonlySet<string>;
  /**
   * Os slots das entidades em volta ("Este boneco", 7.11) que estão ESCOLHIDAS
   * — rodada 11. Só nelas a imagem do meio, que não é desenhada, pega o clique.
   * Opcional: sem ele, o clique passa por todo meio. Vem de `withChosen`.
   */
  readonly markersOf?: ReadonlySet<string>;
}

/** Lê o guardado de "Ver só o resultado". Qualquer lixo vira `null`. */
function readClean(saved: unknown): CleanSnapshot | null {
  if (saved === null || typeof saved !== 'object') return null;
  const raw = saved as Record<string, unknown>;
  const out: CleanSnapshot = {};
  for (const key of CLEAN_KEYS) {
    if (typeof raw[key] === 'boolean') out[key] = raw[key] as boolean;
  }
  return Object.keys(out).length === 0 ? null : out;
}

// ---------------------------------------------------------------------------
// Ver e travar um a um — itens 57, 58 e 61
// ---------------------------------------------------------------------------

/** Uma lista de nomes sem repetir, em ordem, para o arquivo ficar estável. */
function union(current: readonly string[], add: readonly string[]): string[] {
  const seen = new Set(current);
  const out = [...current];
  for (const name of add) {
    if (seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out.sort();
}

/** O que uma seleção tem de osso e de slot, contando o slot de cada desenho. */
export function namesOfSelection(
  selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
): { bones: string[]; slots: string[] } {
  const slots = new Set(selection.slots);
  for (const item of selection.attachments) slots.add(item.slot);
  return { bones: [...selection.bones], slots: [...slots] };
}

/** Esconde o que está escolhido — item 57, tecla `H`. */
export function hideSelected(
  view: Readonly<ViewSettings>,
  selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
): Partial<ViewSettings> {
  const names = namesOfSelection(selection);
  return {
    hiddenBones: union(view.hiddenBones, names.bones),
    hiddenSlots: union(view.hiddenSlots, names.slots),
  };
}

/**
 * Esconde TODO O RESTO — item 57, `Shift+H`.
 *
 * Os **ancestrais** do que ficou visível continuam visíveis: um osso escondido
 * cujo filho aparece deixaria o filho pendurado no nada, e a hierarquia é
 * justamente o que se está olhando quando se pede "só este".
 */
export function soloSelected(
  view: Readonly<ViewSettings>,
  file: BoneFile,
  selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
): Partial<ViewSettings> {
  const names = namesOfSelection(selection);
  const keepBones = new Set(names.bones);
  // O osso de cada slot escolhido também fica: sem ele o desenho não tem onde
  // se pendurar.
  for (const slot of (file.slots ?? [])) {
    if (names.slots.includes(slot.name)) keepBones.add(slot.bone);
  }
  const parentOf = new Map<string, string | undefined>();
  for (const bone of (file.bones ?? [])) parentOf.set(bone.name, bone.parent);
  for (const name of [...keepBones]) {
    let up = parentOf.get(name);
    while (up !== undefined && !keepBones.has(up)) {
      keepBones.add(up);
      up = parentOf.get(up);
    }
  }
  const keepSlots = new Set(names.slots);
  return {
    hiddenBones: (file.bones ?? []).map((b) => b.name).filter((n) => !keepBones.has(n)).sort(),
    hiddenSlots: (file.slots ?? []).map((s) => s.name).filter((n) => !keepSlots.has(n)).sort(),
  };
}

/** Mostra tudo de novo — item 57, `Ctrl+Alt+3`. */
export function showAll(): Partial<ViewSettings> {
  return { hiddenBones: [], hiddenSlots: [] };
}

/** Trava o que está escolhido — item 58, `Ctrl+2`. */
export function lockSelected(
  view: Readonly<ViewSettings>,
  selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
): Partial<ViewSettings> {
  const names = namesOfSelection(selection);
  return {
    lockedBones: union(view.lockedBones, names.bones),
    lockedSlots: union(view.lockedSlots, names.slots),
  };
}

/** Trava TODO O RESTO — item 58, `Ctrl+Shift+2`. */
export function lockOthers(
  file: BoneFile,
  selection: Pick<Selection, 'bones' | 'slots' | 'attachments'>,
): Partial<ViewSettings> {
  const names = namesOfSelection(selection);
  const keepBones = new Set(names.bones);
  const keepSlots = new Set(names.slots);
  return {
    lockedBones: (file.bones ?? []).map((b) => b.name).filter((n) => !keepBones.has(n)).sort(),
    lockedSlots: (file.slots ?? []).map((s) => s.name).filter((n) => !keepSlots.has(n)).sort(),
  };
}

/** Destrava tudo — item 58, `Ctrl+Alt+2`. */
export function unlockAll(): Partial<ViewSettings> {
  return { lockBones: false, lockDrawings: false, lockedBones: [], lockedSlots: [] };
}

/**
 * "Ver só o resultado" — item 61, `Ctrl+Shift+H`.
 *
 * Liga: guarda os dez interruptores e desliga todos. Desliga: devolve o que
 * estava guardado, campo a campo, e esquece o guardado.
 *
 * É o botão que se aperta para olhar o personagem como o jogador vai vê-lo, sem
 * osso, sem grade e sem alça — e é o botão que devolve tudo com um segundo
 * aperto, que é o que faz dele um botão e não um estrago.
 */
export function toggleCleanView(view: Readonly<ViewSettings>): Partial<ViewSettings> {
  if (view.cleanView !== null) {
    const back: Partial<ViewSettings> = { cleanView: null };
    for (const key of CLEAN_KEYS) {
      const was = view.cleanView[key];
      if (was !== undefined) (back as Record<string, unknown>)[key] = was;
    }
    return back;
  }
  const snapshot: CleanSnapshot = {};
  const off: Record<string, unknown> = {};
  for (const key of CLEAN_KEYS) {
    snapshot[key] = view[key];
    off[key] = false;
  }
  return { ...(off as Partial<ViewSettings>), cleanView: snapshot };
}

/** `true` enquanto "Ver só o resultado" está ligado. */
export function isCleanView(view: Readonly<ViewSettings> = current): boolean {
  return view.cleanView !== null;
}

/**
 * **Os ossos que a pilha de peles tira da cena** — rodada 12, S8 e S9.
 *
 * A conta é do `doc/skin-bones.ts`; a cena a refaz a cada quadro desenhado
 * (`setSkinGoneBones`) e o clique lê a mesma, por `currentLocks`. Não é uma
 * preferência da Exibição: muda quando a pilha muda, e não se grava.
 */
let skinGone: ReadonlySet<string> = new Set();

/** A cena diz quais ossos a pilha de agora tira. */
export function setSkinGoneBones(gone: ReadonlySet<string>): void {
  skinGone = gone;
}

/** The locks in force, as sets, for picking. */
export function currentLocks(settings: Readonly<ViewSettings> = current): PickLocks {
  return {
    lockBones: settings.lockBones,
    lockDrawings: settings.lockDrawings,
    lockedBones: new Set(settings.lockedBones),
    lockedSlots: new Set(settings.lockedSlots),
    hiddenBones: new Set(settings.hiddenBones),
    hiddenSlots: new Set(settings.hiddenSlots),
    bonesOnTop: settings.bones,
    goneBones: skinGone,
  };
}

/**
 * `true` quando este osso está escondido um a um — ou quando a pilha de peles o
 * tirou (rodada 12): o osso de uma skin que saiu não se desenha nem se clica.
 */
export function isBoneHidden(name: string, locks: PickLocks = currentLocks()): boolean {
  return locks.hiddenBones.has(name) || locks.goneBones?.has(name) === true;
}

/** `true` quando os desenhos deste slot estão escondidos um a um. */
export function isSlotHidden(name: string, locks: PickLocks = currentLocks()): boolean {
  return locks.hiddenSlots.has(name);
}

/**
 * `true` when this bone cannot be picked.
 *
 * Travado OU escondido: o que não se vê também não se clica, senão o ponteiro
 * pegaria uma coisa invisível e o painel encheria de campos de um osso que a
 * pessoa não está vendo.
 */
export function isBoneLocked(name: string, locks: PickLocks = currentLocks()): boolean {
  return locks.lockBones || locks.lockedBones.has(name) || isBoneHidden(name, locks);
}

/** `true` when the drawings of this slot cannot be picked. */
export function isSlotLocked(name: string, locks: PickLocks = currentLocks()): boolean {
  return locks.lockDrawings || locks.lockedSlots.has(name) || locks.hiddenSlots.has(name);
}

/** The document a lock change must be written into, if there is one. */
interface LockDoc {
  readonly file: BoneFile;
  readonly selection: Selection;
  select(selection: Selection): void;
}

/**
 * Applies a settings patch and makes it last: browser storage and, when a
 * document is given, its editor extension. A lock that goes ON also drops the
 * locked things from the selection, so a bone you just locked cannot keep
 * moving under the transform tools.
 */
export function changeViewSettings(
  patch: Partial<Omit<ViewSettings, 'onion'>> & { onion?: Partial<OnionSettings> },
  doc: LockDoc | null = null,
): void {
  setViewSettings(patch);
  storeViewSettings(current);
  if (doc === null) return;
  writeViewState(doc.file, current);
  const locks = currentLocks(current);
  const selection = doc.selection;
  const bones = selection.bones.filter((name) => !isBoneLocked(name, locks));
  const slots = selection.slots.filter((name) => !isSlotLocked(name, locks));
  const attachments = selection.attachments.filter((item) => !isSlotLocked(item.slot, locks));
  if (bones.length !== selection.bones.length || slots.length !== selection.slots.length
    || attachments.length !== selection.attachments.length) {
    doc.select({ ...selection, bones, slots, attachments });
  }
}

/** Esconde ou mostra um osso pelo nome — a bolinha de ver da Árvore. */
export function setBoneHidden(name: string, hidden: boolean, doc: LockDoc | null = null): void {
  const list = current.hiddenBones.filter((item) => item !== name);
  if (hidden) list.push(name);
  changeViewSettings({ hiddenBones: list.sort() }, doc);
}

/** Esconde ou mostra os desenhos de um slot pelo nome. */
export function setSlotHidden(name: string, hidden: boolean, doc: LockDoc | null = null): void {
  const list = current.hiddenSlots.filter((item) => item !== name);
  if (hidden) list.push(name);
  changeViewSettings({ hiddenSlots: list.sort() }, doc);
}

/** Locks or unlocks one bone by name. */
export function setBoneLocked(name: string, locked: boolean, doc: LockDoc | null = null): void {
  const list = current.lockedBones.filter((item) => item !== name);
  if (locked) list.push(name);
  changeViewSettings({ lockedBones: list }, doc);
}

/** Locks or unlocks the drawings of one slot by name. */
export function setSlotLocked(name: string, locked: boolean, doc: LockDoc | null = null): void {
  const list = current.lockedSlots.filter((item) => item !== name);
  if (locked) list.push(name);
  changeViewSettings({ lockedSlots: list }, doc);
}

/**
 * The four number keys of the top row, as Spriter has them: 7 shows or hides
 * the bones, 8 locks them, 9 shows or hides the drawings, 0 locks them.
 * Returns `true` when the key was one of those.
 */
export const VIEW_TOGGLE_KEYS: Readonly<Record<string, 'bones' | 'lockBones' | 'drawings' | 'lockDrawings'>> =
  Object.freeze({ '7': 'bones', '8': 'lockBones', '9': 'drawings', '0': 'lockDrawings' });

export function toggleViewKey(key: string, doc: LockDoc | null = null): boolean {
  const field = VIEW_TOGGLE_KEYS[key];
  if (field === undefined) return false;
  changeViewSettings({ [field]: !current[field] } as Partial<ViewSettings>, doc);
  return true;
}

/** Saves the settings in the browser, so a new document opens the same way. */
export function storeViewSettings(settings: ViewSettings = current): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Private window, or storage turned off: the settings simply do not last.
  }
}

/** The settings the browser remembers, or the defaults. */
export function loadStoredViewSettings(): ViewSettings {
  try {
    if (typeof localStorage === 'undefined') return parseViewSettings(null);
    const text = localStorage.getItem(VIEW_STORAGE_KEY);
    return parseViewSettings(text === null ? null : JSON.parse(text));
  } catch {
    return parseViewSettings(null);
  }
}

// ---------------------------------------------------------------------------
// Skins (spec 7.1): several at once, one of them the editable one
// ---------------------------------------------------------------------------

/** The `default` skin, which is always underneath and cannot be turned off. */
export const DEFAULT_SKIN = 'default';

/** One line of the skin list in the "Exibição" panel. */
export interface SkinChoice {
  /** Name as it is written in the file. */
  readonly name: string;
  /** `true` while the skin is drawn. `default` is always `true`. */
  readonly visible: boolean;
  /** `true` on the one skin a new attachment is created in. */
  readonly editable: boolean;
  /** `true` on `default`, whose checkbox is disabled. */
  readonly isDefault: boolean;
}

/** Every skin name of the file, in file order. */
export function skinNames(file: BoneFile): string[] {
  return (file.skins ?? []).map((skin) => skin.name);
}

/**
 * The visible skins that really exist, in the order they are applied.
 *
 * The order is the order the user chose, because the LAST skin wins where two
 * of them fill the same slot (spec 4.4). `default` is dropped: the runtime
 * always draws it underneath, and listing it would put it on top instead.
 * A name repeated, or a name left over from a skin that was deleted, is
 * dropped as well.
 */
export function combinedSkins(file: BoneFile, visible: readonly string[]): string[] {
  const known = new Set(skinNames(file));
  const out: string[] = [];
  for (const name of visible) {
    if (name === DEFAULT_SKIN || !known.has(name) || out.includes(name)) continue;
    out.push(name);
  }
  return out;
}

/**
 * The skin a new attachment goes into: the FIRST visible one, which is what
 * `EditorState.skins` has always meant. With nothing chosen it is `default`.
 */
export function editableSkin(file: BoneFile, visible: readonly string[]): string {
  return combinedSkins(file, visible)[0] ?? DEFAULT_SKIN;
}

/** The skin list the panel draws: every skin of the file, in file order. */
export function skinChoices(file: BoneFile, visible: readonly string[]): SkinChoice[] {
  const chosen = combinedSkins(file, visible);
  const editable = editableSkin(file, visible);
  return skinNames(file).map((name) => ({
    name,
    visible: name === DEFAULT_SKIN || chosen.includes(name),
    editable: name === editable,
    isDefault: name === DEFAULT_SKIN,
  }));
}

/** Turns one skin on or off, keeping the order of the others. */
export function toggleSkin(visible: readonly string[], name: string, on: boolean): string[] {
  if (name === DEFAULT_SKIN) return [...visible];
  const without = visible.filter((item) => item !== name);
  return on ? [...without, name] : without;
}

/** Makes `name` the editable skin, which means putting it first and showing it. */
export function setEditableSkin(visible: readonly string[], name: string): string[] {
  if (name === DEFAULT_SKIN) return visible.filter((item) => item !== DEFAULT_SKIN);
  return [name, ...visible.filter((item) => item !== name && item !== DEFAULT_SKIN)];
}

/**
 * Skins the document shows. `Doc` keeps them in `visibleSkins`, which is not in
 * the contract yet — see `PEDIDOS-FASE3B.md`, pedido 8.
 */
export function visibleSkinsOf(doc: EditorDoc): string[] {
  const held = (doc as EditorDoc & { visibleSkins?: string[] }).visibleSkins;
  if (Array.isArray(held)) return [...held];
  return [...(readEditorState(doc.file).skins ?? [])];
}

/** Changes the skins the document shows and re-poses it. */
export function setVisibleSkins(doc: EditorDoc, visible: readonly string[]): void {
  const holder = doc as EditorDoc & { visibleSkins?: string[] };
  if (Array.isArray(holder.visibleSkins)) holder.visibleSkins = [...visible];
  applyStack(doc, skinStackOf(doc));
  doc.repose();
}

// ---------------------------------------------------------------------------
// A pilha e o lápis, separados — degrau 9 (18/09/2026), E10, spec §4.4
// ---------------------------------------------------------------------------

/*
 * Até o D8 havia UMA lista: `visibleSkins`, com o lápis na frente e a `default`
 * embaixo por fora. Isso amarrava três coisas que o Humberto quis separadas:
 * ligar uma pele, escolher onde o desenho novo nasce, e dizer quem vence.
 *
 * Agora são duas:
 *
 * | O quê | O que é |
 * |:---|:---|
 * | **a pilha** | a lista de peles ATIVAS, de baixo para cima. A `default` está dentro dela, e pode sair (I10). **A de cima vence** (§4.4) |
 * | **o lápis** | a pele em que o que se cria nasce. Uma só, e pode ser qualquer uma |
 *
 * A pilha vai inteira para o runtime (`Skeleton.setSkinStack`), que é a conta
 * que a conformidade mede. O `setSkin` de compatibilidade não é mais chamado.
 */

/** A pilha do documento, de baixo para cima. */
export function skinStackOf(doc: EditorDoc): string[] {
  const held = (doc as EditorDoc & { pilha?: string[] }).pilha;
  if (Array.isArray(held)) return [...held];
  // Um documento de teste com a vista velha: a pilha é a conta de antes.
  const state = readEditorState(doc.file);
  if (Array.isArray(state.pilha)) return [...state.pilha];
  return [DEFAULT_SKIN, ...combinedSkins(doc.file, visibleSkinsOf(doc))];
}

/** A pele do lápis, ou `null` quando o que se cria nasce na `default`. */
export function editingSkinOf(doc: EditorDoc): string | null {
  const held = doc as EditorDoc & { emEdicao?: string | null; pilha?: string[] };
  if (Array.isArray(held.pilha)) return held.emEdicao ?? null;
  const first = visibleSkinsOf(doc)[0];
  return first === undefined || first === DEFAULT_SKIN ? null : first;
}

/** Põe a pilha no esqueleto que está na cena. Não repõe: quem chama repõe. */
function applyStack(doc: EditorDoc, stack: readonly string[]): void {
  const skeleton = doc.skeleton;
  if (skeleton === null) return;
  const known = new Set(skinNames(doc.file));
  const limpa: string[] = [];
  for (const name of stack) {
    if (!known.has(name) || limpa.includes(name)) continue;
    limpa.push(name);
  }
  try {
    skeleton.setSkinStack(limpa);
  } catch {
    // A skin that vanished between rebuilds: the default skin still draws.
  }
}

/**
 * Troca a pilha e repõe. A ordem é a da lista: **o último é o de cima**.
 *
 * Um nome repetido, ou de pele que não existe mais, sai — o ator recusa a
 * pilha inteira quando um nome não bate, e a cena ficaria vazia sem dizer
 * por quê.
 */
export function setSkinStack(doc: EditorDoc, stack: readonly string[]): void {
  const holder = doc as EditorDoc & { pilha?: string[] };
  const limpa: string[] = [];
  for (const name of stack) {
    if (limpa.includes(name)) continue;
    limpa.push(name);
  }
  if (Array.isArray(holder.pilha)) holder.pilha = limpa;
  else setVisibleSkins(doc, limpa.filter((name) => name !== DEFAULT_SKIN));
  applyStack(doc, limpa);
  doc.repose();
  // Rodada 23, defeito 3: o osso que só existia na skin que saiu sai da
  // seleção junto, e Propriedades e a cena param de falar dele.
  if (corpoDe(doc) === doc) {
    const pruned = pruneSelection(doc.file, limpa, doc.selection);
    if (pruned !== null) doc.select(pruned);
  }
}

/**
 * Acende o lápis numa pele — e **liga essa pele** (I6).
 *
 * Editar uma pele desligada seria pintar no escuro: o desenho novo nasceria
 * nela e não apareceria. Por isso acender o lápis põe a pele no topo da pilha,
 * se ela ainda não estiver ativa. `null` devolve o lápis à `default`.
 */
export function setEditingSkin(doc: EditorDoc, name: string | null): void {
  const holder = doc as EditorDoc & { emEdicao?: string | null; pilha?: string[] };
  if (!Array.isArray(holder.pilha)) {
    setVisibleSkins(doc, name === null ? [] : setEditableSkin(visibleSkinsOf(doc), name));
    return;
  }
  holder.emEdicao = name;
  if (name !== null && !holder.pilha.includes(name) && skinNames(doc.file).includes(name)) {
    setSkinStack(doc, [...holder.pilha, name]);
    return;
  }
  doc.repose();
}

// ---------------------------------------------------------------------------
// Which times the ghosts sit at
// ---------------------------------------------------------------------------

/** One ghost: when it is, which side it is on and how it is drawn. */
export interface Ghost {
  /** Time of the ghost, in seconds. */
  time: number;
  /** `-1` before the current time, `+1` after it. */
  direction: -1 | 1;
  /** 1 for the nearest ghost of its side, 2 for the next one, and so on. */
  order: number;
  /** Opacity, already faded by the order. */
  alpha: number;
  /** World offset applied to this ghost, so passes can be compared. */
  offsetX: number;
  offsetY: number;
}

/** Times are rounded here, so `0.5 - 0.1 * 2` is `0.3` and not `0.30000000000000004`. */
const TIME_DECIMALS = 6;
const TIME_EPSILON = 1e-9;

function roundTime(t: number): number {
  const factor = 10 ** TIME_DECIMALS;
  return Math.round(t * factor) / factor;
}

/**
 * Opacity of the ghost at `order` (1 = nearest) out of `total` on its side.
 * The nearest keeps the full opacity and the farthest keeps `1 / total` of it,
 * so a stack of ghosts still reads as a direction in time.
 */
export function ghostAlpha(opacity: number, order: number, total: number): number {
  if (total <= 0) return 0;
  const clamped = Math.min(Math.max(opacity, 0), 1);
  return clamped * ((total - order + 1) / total);
}

/** Every key time of an animation, sorted and without repeats. */
export function animationKeyTimes(animation: AnimationDef | null | undefined): number[] {
  if (animation === undefined || animation === null) return [];
  const seen = new Set<number>();
  for (const timeline of animation.timelines ?? []) {
    for (const key of timeline.keys ?? []) {
      if (typeof key.time === 'number' && Number.isFinite(key.time)) seen.add(roundTime(key.time));
    }
  }
  return [...seen].sort((a, b) => a - b);
}

/**
 * The ghosts to draw around `time`.
 *
 * Fixed step: `time - step`, `time - 2 * step`, ... and the same forwards. A
 * ghost outside `0 .. duration` is dropped, and dropping one does not shift
 * the ones behind it: the third ghost is always three steps away.
 *
 * `onlyKeys`: the nearest key times instead, which is what an animator wants
 * when the keys are not evenly spaced.
 */
export function ghostTimes(
  settings: OnionSettings, time: number, duration: number, keyTimes: readonly number[] = [],
): Ghost[] {
  if (!settings.enabled) return [];
  const before = Math.max(0, Math.floor(settings.before));
  const after = Math.max(0, Math.floor(settings.after));
  const now = roundTime(time);

  const back: number[] = [];
  const forward: number[] = [];

  if (settings.onlyKeys) {
    const sorted = [...keyTimes].sort((a, b) => a - b);
    for (let i = sorted.length - 1; i >= 0 && back.length < before; i--) {
      if (sorted[i] < now - TIME_EPSILON) back.push(sorted[i]);
    }
    for (let i = 0; i < sorted.length && forward.length < after; i++) {
      if (sorted[i] > now + TIME_EPSILON) forward.push(sorted[i]);
    }
  } else {
    const step = settings.step > 0 ? settings.step : DEFAULT_ONION.step;
    for (let order = 1; order <= before; order++) {
      const t = roundTime(now - step * order);
      if (t >= -TIME_EPSILON) back.push(t);
    }
    for (let order = 1; order <= after; order++) {
      const t = roundTime(now + step * order);
      if (t <= duration + TIME_EPSILON) forward.push(t);
    }
  }

  const ghosts: Ghost[] = [];
  const push = (times: number[], direction: -1 | 1): void => {
    for (let i = 0; i < times.length; i++) {
      const order = i + 1;
      ghosts.push({
        time: roundTime(times[i]),
        direction,
        order,
        alpha: ghostAlpha(settings.opacity, order, times.length),
        offsetX: settings.offsetX * order * direction,
        offsetY: settings.offsetY * order * direction,
      });
    }
  };
  push(back, -1);
  push(forward, 1);
  return ghosts;
}

/** Colour of a ghost, by the side it is on. */
export function ghostColor(settings: OnionSettings, ghost: Ghost): string {
  return ghost.direction < 0 ? settings.colorBefore : settings.colorAfter;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** Anything that can put its outline in world coordinates; see `picking.ts`. */
interface WorldVertices {
  computeWorldVertices(
    slot: Slot, out?: Float64Array | number[], offset?: number, stride?: number,
  ): Float64Array | number[];
  readonly vertexCount?: number;
  /** A mesh lists its outline vertices first; this is how many there are. */
  readonly hull?: number;
}

/** Thickness of the ghost bones, in screen pixels. */
const GHOST_LINE_PIXELS = 2;
/** Size of the little square on a ghost bone's root, in screen pixels. */
const GHOST_ROOT_PIXELS = 6;

/** Draws one ghost as bone lines. `scale` is screen pixels per world unit. */
export function drawGhostBones(
  ctx: CanvasRenderingContext2D, skeleton: RuntimeSkeleton, color: string, scale: number,
): void {
  const width = GHOST_LINE_PIXELS / scale;
  const dot = GHOST_ROOT_PIXELS / scale;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  for (const bone of skeleton.bones as Bone[]) {
    // A raiz é o mundo, invisível também no fantasma — lote 60a.
    if (bone === skeleton.bones[0]) continue;
    if (!bone.data.visible) continue;
    const length = bone.data.length;
    if (length > 0) {
      ctx.beginPath();
      ctx.moveTo(bone.worldX, bone.worldY);
      ctx.lineTo(bone.worldX + bone.a * length, bone.worldY + bone.c * length);
      ctx.stroke();
    }
    ctx.fillRect(bone.worldX - dot / 2, bone.worldY - dot / 2, dot, dot);
  }
}

/** Draws one ghost as filled outlines: the silhouette mode of requirement A4. */
export function drawGhostSilhouette(
  ctx: CanvasRenderingContext2D, skeleton: RuntimeSkeleton, color: string,
): void {
  ctx.fillStyle = color;
  for (const slot of skeleton.drawOrder as Slot[]) {
    const attachment = slot.attachment;
    if (attachment === null || !slot.visible) continue;
    if (attachment.type !== 'region' && attachment.type !== 'mesh' && attachment.type !== 'linkedmesh') continue;
    const shape = attachment as unknown as WorldVertices;
    if (typeof shape.computeWorldVertices !== 'function') continue;
    const hull = shape.hull ?? 0;
    const count = hull > 2 ? hull : (shape.vertexCount ?? 4);
    if (count < 3) continue;
    const vertices = shape.computeWorldVertices(slot) as Float64Array;
    ctx.beginPath();
    ctx.moveTo(vertices[0], vertices[1]);
    for (let i = 1; i < count; i++) ctx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
    ctx.closePath();
    ctx.fill();
  }
}

/** Quanto da cor do lado cobre a imagem do fantasma: 0 = a imagem pura. */
export const GHOST_TINT = 0.55;

/**
 * **O fantasma com as imagens** — I4, chat I, 29/09/2026.
 *
 * Até aqui o fantasma era só o risco fino de cada osso, desenhado POR BAIXO do
 * boneco: com a cebola ligada, a cena quase não mudava — só um fio nos pés.
 * O rodapé dizia *"Casca de cebola ligada"* e o arroz não aparecia. O Spine
 * desenha as imagens do fantasma, tingidas com a cor do lado (Ghosting →
 * Display → "Images"); é o que se faz aqui.
 *
 * O fantasma é desenhado numa folha à parte, do tamanho da cena, com a mesma
 * câmera; a cor do lado entra por cima só onde há desenho (`source-atop`); e a
 * folha vai para a cena com a transparência do fantasma. Sem a folha, a cor
 * pintaria o retângulo inteiro. O que está escondido um a um na Exibição
 * (item 57) também não aparece no fantasma.
 */
function drawGhostImages(
  ctx: CanvasRenderingContext2D,
  skeleton: RuntimeSkeleton,
  color: string,
  paper: CanvasRenderingContext2D,
  renderer: CanvasRenderer,
): void {
  const canvas = ctx.canvas;
  const { width, height } = canvas;
  if (paper.canvas.width !== width) paper.canvas.width = width;
  if (paper.canvas.height !== height) paper.canvas.height = height;
  paper.setTransform(1, 0, 0, 1, 0, 0);
  paper.globalCompositeOperation = 'source-over';
  paper.globalAlpha = 1;
  paper.clearRect(0, 0, width, height);
  paper.setTransform(ctx.getTransform());

  const hidden = currentLocks().hiddenSlots;
  const restore: Slot[] = [];
  for (const slot of skeleton.slots as Slot[]) {
    if (slot.visible && hidden.has(slot.data.name)) {
      slot.visible = false;
      restore.push(slot);
    }
  }
  try {
    renderer.draw(skeleton);
  } finally {
    for (const slot of restore) slot.visible = true;
  }

  paper.setTransform(1, 0, 0, 1, 0, 0);
  paper.globalCompositeOperation = 'source-atop';
  paper.globalAlpha = GHOST_TINT;
  paper.fillStyle = color;
  paper.fillRect(0, 0, width, height);
  paper.globalCompositeOperation = 'source-over';
  paper.globalAlpha = 1;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(paper.canvas, 0, 0);
  ctx.restore();
}

/**
 * Keeps the second skeleton the ghosts are posed on.
 *
 * One instance is enough: every ghost is drawn one after the other, and the
 * pose of a ghost is thrown away as soon as it is on the canvas.
 */
export class OnionSkin {
  private ghostFor: SkeletonData | null = null;
  private ghost: RuntimeSkeleton | null = null;

  /** The spare skeleton, rebuilt only when the document was reloaded. */
  skeletonFor(data: SkeletonData): RuntimeSkeleton {
    if (this.ghostFor !== data || this.ghost === null) {
      this.ghostFor = data;
      this.ghost = new Skeleton(data);
    }
    return this.ghost;
  }

  /** A folha à parte e o desenhador do fantasma com imagens — I4. */
  private paper: CanvasRenderingContext2D | null = null;
  private renderer: CanvasRenderer | null = null;
  private rendererFor: EditorDoc | null = null;

  /**
   * A folha e o desenhador, feitos na primeira vez. `null` fora do navegador
   * (os testes): aí o fantasma fica só nos riscos dos ossos.
   */
  private imagesFor(doc: EditorDoc): { paper: CanvasRenderingContext2D; renderer: CanvasRenderer } | null {
    if (this.paper === null) {
      if (typeof document === 'undefined') return null;
      this.paper = document.createElement('canvas').getContext('2d');
      if (this.paper === null) return null;
    }
    if (this.renderer === null || this.rendererFor !== doc) {
      this.renderer = new CanvasRenderer(this.paper, {
        images: (page: AtlasPageData) => doc.imageFor(page),
      });
      this.rendererFor = doc;
    }
    return { paper: this.paper, renderer: this.renderer };
  }

  /** Drops the spare skeleton, so a closed document is not held in memory. */
  clear(): void {
    this.ghostFor = null;
    this.ghost = null;
    this.renderer = null;
    this.rendererFor = null;
  }

  /**
   * Draws every ghost. Does nothing outside animation mode: without an open
   * animation there is no time to travel along.
   */
  draw(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const settings = viewSettings().onion;
    if (!settings.enabled) return;
    const data = doc.data;
    const name = doc.animation;
    if (data === null || name === null) return;
    const animation: AnimationData | null = data.findAnimation(name);
    if (animation === null) return;

    const definition = (doc.file.animations ?? []).find((a) => a.name === name) ?? null;
    const ghosts = ghostTimes(settings, doc.time, animation.duration, animationKeyTimes(definition));
    if (ghosts.length === 0) return;

    const skeleton = this.skeletonFor(data);
    // The ghosts wear the same skins as the pose being edited.
    const live = doc.skeleton;
    if (live !== null) {
      try {
        // Degrau 9: a pilha INTEIRA, e não só as de cima da `default` — um
        // fantasma que vestisse a `default` fora da pilha mostraria a arte que
        // a cena já não mostra.
        skeleton.setSkinStack(live.skinStack.map((skin) => skin.name));
      } catch {
        // A skin that vanished between rebuilds: the default skin still draws.
      }
    }

    for (const ghost of ghosts) {
      pose(skeleton, animation, ghost.time, ghost.time);
      ctx.save();
      ctx.globalAlpha = ghost.alpha;
      if (ghost.offsetX !== 0 || ghost.offsetY !== 0) ctx.translate(ghost.offsetX, ghost.offsetY);
      const color = ghostColor(settings, ghost);
      if (settings.silhouette) drawGhostSilhouette(ctx, skeleton, color);
      else {
        // I4: as imagens tingidas primeiro, e os riscos dos ossos por cima.
        const images = this.imagesFor(doc);
        if (images !== null) drawGhostImages(ctx, skeleton, color, images.paper, images.renderer);
        drawGhostBones(ctx, skeleton, color, scale);
      }
      ctx.restore();
    }
  }
}

/** The one onion skin the viewport uses. */
export const onionSkin = new OnionSkin();

/** Draws the onion skin of `doc`. The viewport calls this before the guides. */
export function drawOnionSkin(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
  onionSkin.draw(doc, ctx, scale);
}
