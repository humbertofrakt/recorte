/**
 * Editor contract — the shared surface every editor module codes against.
 *
 * CORE PRINCIPLE: the editor document IS the `.bone` file.
 *
 * There is no parallel "editor model" that later gets converted on export.
 * `EditorDoc.file` is a plain `BoneFile` (the JSON of the spec). Every edit is
 * a `Command` that mutates that JSON. Saving is `JSON.stringify`. This makes
 * round-trip fidelity structural rather than a feature that can regress, and
 * it means the editor can never author something the format cannot express.
 *
 * Editor-only state that must survive a save (camera, selection, panel sizes)
 * lives under the `RECORTE_editor_state` extension, which readers ignore.
 * Transient state (current tool, playback head) is NOT in the document.
 *
 * Quem pode importar quem — lote A4, plano arrumação (v10.7). Um degrau
 * importa o próprio e os de baixo, nunca os de cima. O teste `fronteiras`
 * confere, arquivo por arquivo:
 *
 *   0  contract.ts, ui/dom.ts     o contrato, e o `el` (não importam o editor)
 *   1  doc/, anim/, mesh/         a base: documento, comandos, tempo, malha
 *   2  io/                        abrir, salvar, importar, exportar
 *   3  viewport/, panels/, ui/    as partes: a cena, os painéis, os serviços
 *   4  ui/shell*.ts, main.ts      a casca, que monta tudo
 *
 * Mais duas: o painel da cena (`viewport/viewport.ts`) só o `main.ts` importa,
 * pelo `viewport/index.ts` — quem precisa da ferramenta na mão importa
 * `viewport/tools/registry.ts`; e ninguém importa a casca.
 */

import type {
  AtlasData, AtlasPageData, BoneFile, Skeleton, SkeletonData,
} from '../../runtime/src/index.js';

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

/** Name of the extension that carries editor-only state inside the file. */
export const EDITOR_EXTENSION = 'RECORTE_editor_state';

/** Editor state persisted inside the document, under `extensions`. */
export interface EditorState {
  camera?: { x: number; y: number; zoom: number };
  selection?: Selection;
  /** Last animation opened in the dopesheet. */
  animation?: string;
  /**
   * Skins visible in the viewport; the first one is the editable skin.
   *
   * **A vista velha, mantida para trás** — degrau 9 (18/09/2026). Quem grava
   * hoje escreve `pilha` e `emEdicao`, e isto junto, para um editor de antes
   * do degrau abrir o arquivo com as mesmas peles ligadas. Quem lê hoje só a
   * usa quando não há `pilha`.
   */
  skins?: string[];
  /**
   * **A pilha de peles**, de baixo para cima (spec §4.4) — degrau 9, E10.
   *
   * A lista inteira, com a `default` dentro: ela é uma pele como as outras e
   * **pode sair**. A de cima vence onde duas vestem o mesmo lugar.
   */
  pilha?: string[];
  /** **A pele do lápis**: onde o que se cria nasce. `null` = a `default`. */
  emEdicao?: string | null;
  /**
   * What the drawing area shows: the checkboxes of the "Exibição" panel, the
   * background colour and the onion skin. The shape is `ViewSettings` of
   * `viewport/onion.ts`; it is typed loosely here so the contract does not
   * have to depend on a viewport module.
   */
  view?: Record<string, unknown>;
}

/** What is selected. Empty arrays mean nothing of that kind is selected. */
export interface Selection {
  bones: string[];
  slots: string[];
  /** `slot/attachment` pairs, because an attachment name is unique per slot. */
  attachments: Array<{ slot: string; attachment: string }>;
  constraints: string[];
  /** Vertex indices, valid while a single mesh attachment is selected. */
  vertices: number[];
  /**
   * **Os parâmetros escolhidos** (spec 8.1) — degrau 12, porta D3 (18/09/2026).
   *
   * Um parâmetro não é osso, slot nem regra: é um número com nome e faixa, e
   * quem o escolhe quer a ficha dele em Propriedades (mín., máx., padrão,
   * repetição, a origem). Sem uma linha aqui o parâmetro nascia e sumia — o
   * editor o criava e não havia por onde vê-lo.
   *
   * **Opcional, como `endMerge` e `pilha`**: um documento de teste que monta a
   * seleção à mão continua sendo uma seleção. Quem lê usa
   * `selection.parameters ?? []`; quem escreve parte de `emptySelection()`,
   * que já traz a lista vazia.
   */
  parameters?: string[];
  /**
   * **As variáveis escolhidas** (spec 8.4) — degrau 12, porta G9/P15.
   *
   * Como `parameters`: uma variável não é osso, slot nem regra, e quem a
   * escolhe quer a ficha dela em Propriedades (nome, tipo, padrão). Opcional
   * pelo mesmo motivo; quem lê usa `selection.variables ?? []`.
   *
   * As **marcas** (8.5) não entram aqui: uma marca é só um nome numa lista, e
   * não tem ficha a abrir — ela se cria, se renomeia e se apaga na própria
   * linha da aba Regras.
   */
  variables?: string[];
}

export function emptySelection(): Selection {
  return { bones: [], slots: [], attachments: [], constraints: [], vertices: [], parameters: [], variables: [] };
}

/** Reason a document changed, so listeners can skip work they do not need. */
export type ChangeKind =
  | 'file'        // the whole document was replaced (open, new)
  | 'structure'   // bones/slots/skins/constraints/animations added or removed
  | 'transform'   // numeric values changed; skeleton needs a re-pose only
  | 'selection'
  | 'time'        // playhead moved
  | 'assets';     // atlases or images changed

export interface DocChange {
  kind: ChangeKind;
  /** Command label, for the undo menu and the status bar. */
  label?: string;
}

export type DocListener = (change: DocChange) => void;

/**
 * O que uma pilha de desfazer sabe dizer, só para ler — o painel Histórico.
 * Morava em `panels/history-model.ts`; veio para cá no lote A4, porque o
 * documento (base) a devolve e a base não importa painel.
 */
export interface UndoView {
  entries(): Array<{ label: string; index: number; undone: boolean }>;
  cursor(): number;
}

/**
 * A animação que está saindo, durante a mistura da troca — lote 46.
 *
 * Estado passageiro do tocador, como a agulha: não vai para o arquivo. O que
 * vai para o arquivo é o tempo da mistura, o `defaultMix` de cada animação.
 */
export interface Crossfade {
  /** Nome da animação que sai. */
  from: string;
  /** Onde ela está, em segundos. */
  fromTime: number;
  /** Quanto da mistura já passou, em segundos. */
  elapsed: number;
  /** A mistura inteira, em segundos. */
  duration: number;
}

/**
 * A single undoable edit. `apply` and `revert` must be exact inverses, and
 * both receive the live document so a command can capture what it needs.
 *
 * Commands mutate `doc.file` directly. They must leave the file valid against
 * the schema: the editor never holds an unsaveable state.
 *
 * **O comando do projeto** — rodada 39, lote 2 (06/10/2026). Um comando pode
 * mudar o estado do editor que mora no PROJETO, e não no `.bone`: a montagem
 * de teste da aba Entidades, em `manifest.extras.RECORTE_projeto.montagem`
 * (`doc/montagem.ts`). A regra é a mesma: `apply` e `revert` exatos, um
 * passo de desfazer por gesto, dado pelo `run` do documento em foco (é ele
 * que marca o projeto como não salvo). E uma a mais: **o `.bone` sai igual,
 * letra por letra** — o teste nunca escreve no arquivo que o jogo lê.
 */
export interface Command {
  /** Shown in the undo menu, in Portuguese, e.g. "Mover osso". */
  readonly label: string;
  /** What kind of change this is, so listeners can react cheaply. */
  readonly kind: ChangeKind;
  apply(doc: EditorDoc): void;
  revert(doc: EditorDoc): void;
  /**
   * Optional merge with the previous command, for drags that produce one
   * command per mouse move. Return `true` when `this` absorbed `previous`.
   */
  mergeWith?(previous: Command): boolean;
  /**
   * Name of the animation this command changed, when it changed NOTHING ELSE.
   *
   * A key is a `structure` change for everyone who listens — a new timeline is
   * a new thing in the file — but the document does not have to re-read the
   * whole `.bone` to see it: bones, slots, skins and attachments are untouched,
   * so only the timelines of this one animation have to be built again. During a
   * drag that is the difference between one full load per mouse move and one
   * cheap parse. See `PEDIDOS-FASE3B.md`, pedido 6.
   */
  readonly animationOnly?: string;
}

/** The document. One instance per open file. */
export interface EditorDoc {
  /** The `.bone` JSON. This is the single source of truth. */
  readonly file: BoneFile;
  /** Path on disk, or `null` for a document that was never saved. */
  path: string | null;
  /** `true` when there are edits since the last save. */
  readonly dirty: boolean;

  /** Runtime data rebuilt from `file`; `null` while the file does not load. */
  readonly data: SkeletonData | null;
  /** Live instance used by the viewport; `null` while `data` is `null`. */
  readonly skeleton: Skeleton | null;
  /** Atlases resolved for the document. */
  readonly atlases: readonly AtlasData[];
  /** Images per atlas page, for the renderer. */
  imageFor(page: AtlasPageData): CanvasImageSource | null;

  /** Current selection. Change it with `select`, never by mutating. */
  readonly selection: Selection;
  select(selection: Selection): void;

  /** Playhead in seconds, and the animation being edited. */
  time: number;
  animation: string | null;

  /**
   * Skins drawn in the viewport. The FIRST one is the editable skin: a new
   * attachment is created in it. An empty list means the default skin only.
   *
   * **A vista velha** — degrau 9 (18/09/2026). O estado de verdade passou a ser
   * `pilha` (a pilha inteira, de baixo para cima, com a `default` dentro) e
   * `emEdicao` (o lápis). Esta lista continua sendo o lápis primeiro e as
   * outras ligadas, calculada daquelas duas, enquanto os módulos que a leem
   * não mudarem. Módulo novo pede `skinStackOf(doc)` e `editingSkinOf(doc)`,
   * de `viewport/onion.ts`.
   */
  visibleSkins: string[];
  /**
   * **A pilha de peles**, de baixo para cima (spec §4.4) — degrau 9.
   *
   * Opcional, como `endMerge`: um documento de teste que só tem a vista velha
   * continua sendo um documento. Use `skinStackOf(doc)`, que cai na vista
   * velha quando a pilha não existe.
   */
  pilha?: string[];
  /** **A pele do lápis** — degrau 9. Opcional; use `editingSkinOf(doc)`. */
  emEdicao?: string | null;

  /** Runs a command and pushes it on the undo stack. */
  run(command: Command): void;
  /**
   * Writes one line on the status bar without changing the document: no undo
   * step, no dirty mark. For refusals like "the root bone cannot be deleted",
   * which must be said out loud instead of failing in silence.
   */
  notice(text: string): void;
  undo(): void;
  redo(): void;
  /**
   * Closes the run of commands a drag merged into one, so the next drag is its
   * own undo step. Optional: a document with no merging has nothing to close.
   */
  endMerge?(): void;
  /**
   * A mistura da troca de animação — lote 46. Enquanto ela vale, o esqueleto é
   * posado pelo `AnimationState` do runtime, o mesmo da Prévia e do jogo: a
   * animação que sai, no tempo dela, se apagando, e a aberta entrando por cima.
   * `null` desliga. Opcional: um documento de teste não precisa misturar.
   */
  crossfade?(mix: Crossfade | null): void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  /** Label of the next undo / redo, for the menu. */
  readonly undoLabel: string | null;
  readonly redoLabel: string | null;
  /**
   * A pilha de desfazer, **só para ler** — o painel Histórico, lote 19.
   *
   * `entries()` devolve nomes e posições, nunca comandos: um painel que
   * pudesse pegar um `Command` daqui poderia aplicá-lo fora de ordem, e a
   * pilha deixaria de ser uma pilha. Voltar até um passo é chamar `undo()` a
   * conta de vezes que `panels/history-model.ts` disser.
   *
   * Opcional, como o `endMerge`: um documento de teste que guarda os comandos
   * numa lista sua não precisa de uma pilha inteira para ser um documento. Sem
   * ela o painel Histórico mostra só "Arquivo aberto".
   */
  readonly history?: {
    entries(): Array<{ label: string; index: number; undone: boolean }>;
    cursor(): number;
  };

  /**
   * Rebuilds `data` and `skeleton` from `file`. Called automatically after a
   * `structure` command; call it by hand after editing `file` in bulk.
   */
  rebuild(): void;
  /**
   * Rebuilds ONLY the timelines, reusing the bones, slots, skins and
   * attachments already loaded. Called automatically after a command that
   * declares `animationOnly`. Much cheaper than `rebuild`.
   */
  rebuildAnimations(): void;
  /**
   * Re-poses `skeleton` at `time` without rebuilding. Cheap.
   *
   * Rodada 46, lote 1: `label` é o recado do gesto em curso. A cena chama o
   * `repose` a cada quadro com o botão apertado, e uma mudança sem nome
   * apagava o rodapé; com o recado, o número fica à vista enquanto arrasta.
   */
  repose(label?: string): void;

  on(listener: DocListener): () => void;
  /** Problems from the last rebuild, shown in the status bar. */
  readonly warnings: readonly string[];

  /**
   * **O corpo do instante** — degrau 4b (17/09/2026), spec 9.13.
   *
   * O documento é um `.bone`; o projeto tem vários (`doc/projeto.ts`), e uma
   * animação pode virar de corpo no meio (a chave `body`: o homem vira
   * lobisomem em 0,5 s). `body` é o uri do corpo que vale em `time` na animação
   * aberta, ou `null` = o arquivo. O `skeleton` já é o do corpo do instante: o
   * `Actor` do runtime troca qual esqueleto está vivo, e nada é remontado.
   *
   * `corpo()` devolve o documento desse corpo: este mesmo, sem virada; o `Doc`
   * do outro corpo, com ela. A Árvore, a Ordem e as Propriedades leem
   * `corpo().file`, e a **mexida estrutural** (osso novo, malha, pivô, trocar o
   * osso de um desenho) vai para `corpo().run`: é a base do corpo do instante
   * que muda, e o rodapé diz *"foi para a base do lobisomem"* (M7). As chaves
   * continuam indo para `run` deste documento: a animação é dele.
   *
   * Opcional, como `endMerge`: um documento de teste sem projeto é o próprio
   * corpo. Use `corpoDe(doc)`.
   */
  readonly body?: string | null;
  corpo?(): EditorDoc;

  /**
   * **As entidades aninhadas** (spec 7.11), pelo uri que o anexo `skeleton`
   * escreve — degrau 6 (17/09/2026), tarefa 6.4.
   *
   * A faixa da entidade na linha do tempo precisa saber **que animações o
   * filho tem**, para o botão direito poder oferecê-las (E12b). Esse dado não
   * está no `.bone` do pai: está no arquivo do filho, que o `io/` leu ao abrir
   * a pasta. Sem isto o menu do botão direito não teria o que listar, e ficaria
   * mudo — que é o que a regra 21 proíbe.
   *
   * Opcional, como `corpo` e `endMerge`: um documento de teste sem entidade
   * nenhuma não precisa do mapa. Use `skeletonsDe(doc)`, que devolve um mapa
   * vazio nesse caso.
   */
  readonly skeletons?: ReadonlyMap<string, SkeletonData>;
}

/** O documento do corpo do instante (9.13): `doc.corpo()`, ou o próprio `doc`. */
export function corpoDe(doc: EditorDoc): EditorDoc {
  return doc.corpo?.() ?? doc;
}

/** As entidades aninhadas que o documento abriu (7.11), ou um mapa vazio. */
const NO_SKELETONS: ReadonlyMap<string, SkeletonData> = new Map();
export function skeletonsDe(doc: EditorDoc): ReadonlyMap<string, SkeletonData> {
  return doc.skeletons ?? NO_SKELETONS;
}

/**
 * O sufixo do rodapé de uma mexida estrutural feita com uma animação aberta:
 * `' (foi para a base)'`, ou `' (foi para a base do lobisomem)'` quando o corpo
 * do instante é outro (M7). Vazio com a base aberta: aí é onde se está.
 */
export function wentToBase(doc: EditorDoc): string {
  if (doc.animation === null) return '';
  const corpo = corpoDe(doc);
  if (corpo === doc) return ' (foi para a base)';
  const name = corpo.file.skeleton?.name;
  return ` (foi para a base ${typeof name === 'string' && name.length > 0 ? `de ${name}` : 'da outra base'})`;
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

/** Pointer event already converted to world coordinates by the viewport. */
export interface ToolEvent {
  /** World position (Y up, pixels), the same space as the skeleton. */
  x: number;
  y: number;
  /** Movement since the last event, in world units. */
  dx: number;
  dy: number;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  button: number;
  /** Pixels per world unit, for hit radii that must feel constant on screen. */
  scale: number;
}

/**
 * A viewport tool. Exactly one is active. Tools read the document and push
 * commands; they never draw outside `drawOverlay`.
 */
/*
 * `EditorMode` saiu do contrato no degrau 11, lote 1 (18/09/2026), M4 de vez:
 * não há modo. `doc.animation === null` é a **base aberta**; com um nome, é a
 * animação aberta. O rodapé diz qual (`ui/where-model.ts`).
 */

export interface Tool {
  readonly id: string;
  /** Shown in the toolbar, in Portuguese. */
  readonly label: string;
  /** Single-key shortcut, or `null`. */
  readonly shortcut: string | null;
  /*
   * `modes` saiu no degrau 4a (17/09/2026, M4): nenhuma ferramenta some por
   * modo. Toda ferramenta vale com a base aberta e com uma animação aberta; o
   * que ela escreve vai para a base ou vira chave (`anim/pose-mode.ts`).
   */
  onEnter?(doc: EditorDoc): void;
  onExit?(doc: EditorDoc): void;
  onDown?(doc: EditorDoc, e: ToolEvent): void;
  onMove?(doc: EditorDoc, e: ToolEvent): void;
  onUp?(doc: EditorDoc, e: ToolEvent): void;
  /**
   * O ponteiro andou SEM botão apertado — lote 47. Só para a ferramenta saber
   * sobre o que ele está, e o cursor dizer o que o arrasto vai fazer. Nunca
   * edita nada. Ferramenta sem zonas não implementa.
   */
  onHover?(doc: EditorDoc, e: ToolEvent): void;
  onKey?(doc: EditorDoc, key: string): boolean;
  /**
   * A mesma tecla, quando ela SOBE. `true` = tratada, e o evento para aqui.
   *
   * Existe por causa dos gestos de segurar: o "pegar filhos" do lote 31 vale
   * enquanto o P estiver embaixo, como o B do Spriter. Ferramenta que não tem
   * gesto de segurar não implementa.
   */
  onKeyUp?(doc: EditorDoc, key: string): boolean;
  /**
   * Classe extra na cena enquanto este gesto estiver valendo, ou `null`.
   *
   * É como o cursor muda sem a ferramenta tocar no DOM: ela diz o nome, a cena
   * põe e tira a classe, e o desenho do cursor fica no CSS.
   */
  cursorClass?(): string | null;
  /** Draws handles in world space; the viewport sets the transform. */
  drawOverlay?(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void;
}

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

/**
 * A dockable panel. The shell creates the element and calls `refresh` on the
 * changes the panel asked for.
 */
export interface Panel {
  readonly id: string;
  /** Shown in the panel header, in Portuguese. */
  readonly title: string;
  /** Changes this panel cares about. Others are not delivered. */
  readonly listensTo: readonly ChangeKind[];
  mount(doc: EditorDoc, host: HTMLElement): void;
  refresh(change: DocChange): void;
  unmount?(): void;
}

// ---------------------------------------------------------------------------
// Registries, so modules wire themselves up without importing each other
// ---------------------------------------------------------------------------

const tools = new Map<string, Tool>();
const panels = new Map<string, Panel>();

export function registerTool(tool: Tool): void {
  tools.set(tool.id, tool);
}
export function getTools(): Tool[] {
  return [...tools.values()];
}
export function getTool(id: string): Tool | null {
  return tools.get(id) ?? null;
}

export function registerPanel(panel: Panel): void {
  panels.set(panel.id, panel);
}
export function getPanels(): Panel[] {
  return [...panels.values()];
}
export function getPanel(id: string): Panel | null {
  return panels.get(id) ?? null;
}

// ---------------------------------------------------------------------------
// Small helpers every module needs
// ---------------------------------------------------------------------------

/** Reads the editor state stored in the file, or an empty object. */
export function readEditorState(file: BoneFile): EditorState {
  const ext = (file as { extensions?: Record<string, unknown> }).extensions;
  const state = ext?.[EDITOR_EXTENSION];
  return (state && typeof state === 'object' ? state : {}) as EditorState;
}

/** Writes the editor state into the file, creating `extensions` if needed. */
export function writeEditorState(file: BoneFile, state: EditorState): void {
  const f = file as { extensions?: Record<string, unknown> };
  f.extensions ??= {};
  f.extensions[EDITOR_EXTENSION] = state;
}

/** A name not yet used in `taken`, as `base`, `base2`, `base3`, ... */
export function uniqueName(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let i = 2; ; i++) {
    const name = `${base}${i}`;
    if (!used.has(name)) return name;
  }
}
