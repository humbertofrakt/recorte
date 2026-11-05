/**
 * The document (owner A).
 *
 * `Doc.file` is the `.bone` JSON and nothing else. Commands mutate it, saving
 * is `JSON.stringify`, and the live `Skeleton` the viewport draws is rebuilt
 * from it by the runtime loader — the same loader a game would use. When the
 * editor can show it, the format can express it.
 *
 * Two costs, kept apart on purpose:
 *   - `rebuild()` re-reads the whole file. Needed after a structural change.
 *   - `repose()` only re-applies the animation at `time`. Cheap, per frame.
 *
 * **O projeto e a virada** — degrau 4b (17/09/2026, spec 9.13). O documento
 * continua sendo UM `.bone`. O projeto (`doc/projeto.ts`) tem vários, e este
 * documento é posto na cena pelo `Actor` do runtime: cada corpo do projeto é
 * montado uma vez, e uma chave `body` da animação aberta troca qual esqueleto
 * está vivo. `skeleton` é o do corpo do instante; `corpo()` é o documento
 * dele. Um projeto de um corpo só, sem chave `body`, é o que sempre foi.
 */

import {
  Actor, AnimationState, Skeleton, loadAnimationsFor, loadSkeletonData,
} from '../../../runtime/src/index.js';
import { SAVED_LABEL } from './rascunho.js';
import { pruneSelection } from './prune-selection.js';
import type {
  AnimationData, AtlasData, AtlasPageData, BoneFile, Matrix2x3, SkeletonData,
} from '../../../runtime/src/index.js';
import {
  emptySelection, readEditorState, writeEditorState,
} from '../contract.js';
import type {
  ChangeKind, Command, Crossfade, DocChange, DocListener, EditorDoc, EditorState, Selection,
} from '../contract.js';
import { UndoStack } from './undo.js';
import { RelinkGuarded, WithRelink, readGuarded, relinkNotice, relinkPlan } from './guarded-keys.js';
import { applyHandPivots } from './hand-pivots.js';
import type { UndoView } from '../contract.js';
import { aroundWarnings } from './around-warnings.js';
import { createEmptyFile } from './new-file.js';
import { composeShared, sharedUrisOf, sharedWarnings, withSharedAnimations } from './shared-animations.js';

/** Camera the viewport owns; the document only stores it between sessions. */
export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface DocOptions {
  /** Atlases already loaded for this file. */
  atlases?: readonly AtlasData[];
  /** Page image, keyed by `AtlasPageData.image`. */
  images?: ReadonlyMap<string, CanvasImageSource>;
  /**
   * The nested skeletons of spec 7.11, keyed by the `uri` written in the
   * attachment. Without them a `skeleton` attachment draws nothing, so the
   * sword in the hero's hand would simply be missing from the screen.
   */
  skeletons?: ReadonlyMap<string, SkeletonData>;
  path?: string | null;
  /** Undo depth. Default 200. */
  undoLimit?: number;
  /**
   * A pilha de desfazer a usar — degrau 4b. O projeto dá a MESMA pilha a
   * todos os corpos: um `Ctrl+Z` desfaz o último passo, em qualquer corpo.
   */
  undo?: UndoStack;
  /**
   * `true` = o que entra NÃO está no disco: o rascunho recuperado — QA de
   * 04/11/2026 (D4). Nasce sujo, e nem desfazer o limpa: só o Salvar.
   */
  unsaved?: boolean;
}

/**
 * O que o documento sabe do projeto em que está — degrau 4b (9.13).
 *
 * É a vista estreita de `doc/projeto.ts`: os outros corpos, pelo uri, para
 * montar o `Actor`; o documento de um corpo, para `corpo()`; e o aviso de que
 * o arquivo inteiro foi trocado (Novo, Abrir), que zera o projeto.
 */
export interface BodyProvider {
  /** Os outros corpos do projeto, pelo uri das chaves `body`: o dado de cada um. */
  bodies(self: Doc): ReadonlyMap<string, SkeletonData>;
  /** O documento do corpo `uri`, ou `null`. */
  docOf(uri: string): Doc | null;
  /** O nome de um corpo para o rodapé: o `skeleton.name`, ou o uri. */
  nameOf(uri: string): string;
  /** `true` quando algum OUTRO corpo do projeto tem mudança não salva. */
  dirtyBeyond(self: Doc): boolean;
  /** `setFile` em `self`: abriu-se outra coisa, e o projeto volta a ser um corpo só. */
  fileReplaced(self: Doc): void;
  /**
   * O uri do corpo que `self` segura agora, ou `null` — degrau 5 (17/09/2026).
   *
   * O foco troca de corpo sem trocar de objeto (a janela Animação), e a pilha
   * de desfazer anota o uri para poder reverter no corpo certo depois da
   * troca. Opcional: um projeto de antes deste degrau não o tem, e a pilha
   * volta a anotar só o objeto, como no 4b.
   */
  uriOf?(self: Doc): string | null;
  /**
   * **A página de outro documento do projeto** — 05/11/2026, a espada de um,
   * o boneco de outro. Uma entidade com atlas próprio (a espada da pessoa A)
   * pendurada neste corpo traz as páginas DELA, e este documento não as tem.
   * Procura pela IDENTIDADE da página, nunca pelo nome: dois atlas podem ter
   * páginas de mesmo nome. Opcional; `null` = ninguém tem.
   */
  pageImage?(self: Doc, page: AtlasPageData): CanvasImageSource | null;
}

export class Doc implements EditorDoc {
  private currentFile: BoneFile;
  private skeletonData: SkeletonData | null = null;
  private live: Skeleton | null = null;
  /** O ator: os corpos do projeto montados uma vez, e a virada (9.13). */
  private actor: Actor | null = null;
  private loadedAtlases: readonly AtlasData[] = [];
  private images: ReadonlyMap<string, CanvasImageSource> = new Map();
  private nestedSkeletons: ReadonlyMap<string, SkeletonData> = new Map();
  /**
   * **A âncora da entidade aberta por dentro** — rodada 8b, C10.
   *
   * Animando a espada com o herói à vista, a espada é posada como o runtime a
   * posaria dentro do herói (spec 7.11): a raiz dela tem por pai a matriz do
   * slot do herói (`parentMatrix`). Assim a cena, o clique e o arrasto falam
   * do mesmo mundo que se vê — a espada fica na mão, e não na origem. `null`
   * = um documento de topo, como sempre foi. Viaja com o corpo na troca.
   */
  private anchorFn: (() => Matrix2x3 | null) | null = null;
  private currentSelection: Selection = emptySelection();
  private currentWarnings: string[] = [];
  private listeners = new Set<DocListener>();
  private readonly undoStack: UndoStack;
  private dirtyFlag = false;
  /**
   * Onde a pilha estava quando o arquivo foi salvo — rodada 45, lote 5 (doc `74`, e).
   * Desfazer até aqui limpa o "•"; `-2` = o ponto salvo não existe mais na pilha.
   */
  private savedCursor = -1;
  private currentTime = 0;
  private currentAnimation: string | null = null;
  /** A mistura da troca, enquanto ela dura — lote 46. */
  private currentMix: Crossfade | null = null;

  path: string | null;
  /** Camera, written into the file when it is saved. The viewport keeps it. */
  camera: CameraState | null = null;
  /**
   * **A pilha de peles**, de baixo para cima — degrau 9 (18/09/2026), spec §4.4.
   *
   * É a lista inteira, e a `default` é uma pele como as outras: ela começa na
   * pilha porque é o corpo, mas **pode sair** (I10: o lobisomem troca quase
   * tudo, e a arte do homem não deve continuar por baixo). Onde duas peles
   * vestem o mesmo lugar, **a de cima vence** — a de cima é a ÚLTIMA da lista.
   */
  pilha: string[] = ['default'];
  /**
   * **A pele do lápis**, onde o que se cria nasce — degrau 9, E10.
   *
   * Separada da pilha de propósito: até o D8 ela era `visibleSkins[0]`, e por
   * isso não havia como ligar uma pele sem passar a editar nela, nem editar
   * uma pele sem ligá-la. `null` = nasce na `default`.
   */
  emEdicao: string | null = null;

  /**
   * A lista velha: o lápis primeiro, depois as outras ligadas, sem a `default`.
   *
   * **Compatibilidade.** Meia dúzia de módulos ainda lê `doc.visibleSkins[0]`
   * como "a pele em que o desenho novo nasce" e a lista como "as que estão
   * ligadas". Enquanto eles não mudarem, esta vista os atende a partir da
   * pilha e do lápis, que são o estado de verdade. Quem quer a pilha pede
   * `skinStackOf(doc)`; quem quer o lápis, `editingSkinOf(doc)`.
   */
  get visibleSkins(): string[] {
    const acima = this.pilha.filter((name) => name !== 'default');
    const lapis = this.emEdicao;
    if (lapis === null || lapis === 'default') return acima;
    return [lapis, ...acima.filter((name) => name !== lapis)];
  }

  set visibleSkins(value: string[]) {
    const acima: string[] = [];
    for (const name of value) {
      if (name === 'default' || acima.includes(name)) continue;
      acima.push(name);
    }
    this.pilha = ['default', ...acima];
    this.emEdicao = acima[0] ?? null;
  }
  /** O projeto em que este documento está, ou `null` — degrau 4b. */
  project: BodyProvider | null = null;

  constructor(file: BoneFile = createEmptyFile(), options: DocOptions = {}) {
    this.currentFile = file;
    this.path = options.path ?? null;
    this.loadedAtlases = options.atlases ?? [];
    this.images = options.images ?? new Map();
    this.nestedSkeletons = options.skeletons ?? new Map();
    this.undoStack = options.undo ?? new UndoStack(options.undoLimit);
    // Rodada 13, conserto 1: o pivô à mão do arquivo vale sobre o do atlas.
    applyHandPivots(this.currentFile, this.loadedAtlases);
    this.restoreEditorState();
    this.rebuildQuiet();
  }

  // -------------------------------------------------------------------------
  // The file
  // -------------------------------------------------------------------------

  get file(): BoneFile {
    return this.currentFile;
  }

  /**
   * `true` when there are edits since the last save — neste corpo, ou em
   * qualquer outro do projeto (degrau 4b): o que se salva é o projeto.
   */
  get dirty(): boolean {
    return this.dirtyFlag || (this.project?.dirtyBeyond(this) ?? false);
  }

  /** Só a marca DESTE corpo, sem olhar o projeto: é o que `dirtyBeyond` lê. */
  get dirtyOwn(): boolean {
    return this.dirtyFlag;
  }

  /** Replaces the whole document: "Novo" and "Abrir" both land here. */
  setFile(file: BoneFile, options: DocOptions = {}): void {
    this.currentFile = file;
    if (options.path !== undefined) this.path = options.path;
    if (options.atlases !== undefined) this.loadedAtlases = options.atlases;
    if (options.images !== undefined) this.images = options.images;
    applyHandPivots(this.currentFile, this.loadedAtlases);
    // A new document always brings its own children, even when there are none:
    // keeping the old ones would put the last file's sword in this one's hand.
    this.nestedSkeletons = options.skeletons ?? new Map();
    this.undoStack.clear();
    this.dirtyFlag = options.unsaved === true;
    // -2: nenhum ponto da pilha é o salvo (o mesmo truque do passo novo além do salvo).
    this.savedCursor = options.unsaved === true ? -2 : this.undoStack.cursor();
    this.currentSelection = emptySelection();
    this.currentTime = 0;
    this.currentAnimation = null;
    this.camera = null;
    this.pilha = ['default'];
    this.emEdicao = null;
    // Abriu-se outra coisa: os outros corpos do projeto anterior saem.
    this.project?.fileReplaced(this);
    this.restoreEditorState();
    this.openFirstAnimation();
    this.rebuildQuiet();
    this.emit({ kind: 'file' });
  }

  /**
   * O programa começa na primeira animação — pedido do Humberto, 10/09/2026.
   *
   * Abrir um arquivo caía sempre na Montagem, e Montagem é o modo em que mexer
   * num osso muda a pose de repouso: o passo errado para quem abriu o programa
   * para animar. O arquivo que lembra a animação aberta (`RECORTE_editor_state`)
   * ganha, desde que ela ainda exista; sem animação nenhuma fica a Montagem,
   * porque não há onde entrar. Só no `setFile`: é a porta de "Abrir" e "Novo".
   */
  private openFirstAnimation(): void {
    const names = (this.currentFile.animations ?? []).map((animation) => animation.name);
    if (this.currentAnimation !== null && names.includes(this.currentAnimation)) return;
    this.currentAnimation = names[0] ?? null;
  }

  /** Called by the save code once the bytes reached the disk. */
  markSaved(path: string | null = this.path): void {
    this.path = path;
    this.dirtyFlag = false;
    // O próximo arrasto não se funde no passo salvo: senão o ponto salvo mudaria calado.
    this.savedCursor = this.undoStack.cursor();
    this.undoStack.breakMerge();
    // A3: `SAVED_LABEL` é o que diz ao rascunho que o arquivo foi salvo.
    this.emit({ kind: 'file', label: SAVED_LABEL });
  }

  /** File name shown in the title bar. */
  get name(): string {
    if (this.path !== null && this.path.length > 0) {
      const parts = this.path.split(/[\\/]/);
      return parts[parts.length - 1];
    }
    return this.currentFile.skeleton?.name ?? 'sem nome';
  }

  // -------------------------------------------------------------------------
  // Editor state kept inside the file
  // -------------------------------------------------------------------------

  /**
   * Copies camera, selection and animation into the file's extension.
   *
   * Whatever else is already in there is KEPT. Other parts of the editor write
   * their own keys under the same extension — `view`, from the "Exibição"
   * panel — and a save that built the object from scratch erased them
   * (PEDIDOS-FASE3B, pedido 10).
   */
  captureEditorState(): void {
    const state: EditorState = {
      ...readEditorState(this.currentFile),
      selection: this.currentSelection,
      animation: this.currentAnimation ?? undefined,
    };
    if (this.camera !== null) state.camera = { ...this.camera };
    // Degrau 9 (E10): a pilha e o lápis, cada um no seu campo. `skins` continua
    // sendo escrito, com a vista velha, para um editor de antes deste degrau
    // abrir o arquivo e mostrar as mesmas peles ligadas.
    // O padrão não se escreve: a pilha só com a `default` e nenhum lápis é o
    // estado de um arquivo que nunca mexeu em pele, e gravar isso encheria de
    // ruído todo `.bone` do mundo.
    const padrao = this.pilha.length === 1 && this.pilha[0] === 'default';
    if (padrao) delete state.pilha;
    else state.pilha = [...this.pilha];
    if (this.emEdicao === null) delete state.emEdicao;
    else state.emEdicao = this.emEdicao;
    const velho = this.visibleSkins;
    if (velho.length > 0) state.skins = velho;
    else delete state.skins;
    writeEditorState(this.currentFile, state);
    const used = this.currentFile.extensionsUsed ?? [];
    if (!used.includes('RECORTE_editor_state')) {
      this.currentFile.extensionsUsed = [...used, 'RECORTE_editor_state'];
    }
  }

  private restoreEditorState(): void {
    const state = readEditorState(this.currentFile);
    if (state.camera !== undefined) this.camera = { ...state.camera };
    if (state.selection !== undefined) {
      this.currentSelection = { ...emptySelection(), ...state.selection };
    }
    if (state.animation !== undefined) this.currentAnimation = state.animation;
    // Degrau 9: `pilha` manda quando existe; um arquivo de antes só tem
    // `skins`, e aí vale a conta velha (a `default` embaixo, o primeiro nome é
    // o lápis). Ler `skins` por cima de uma `pilha` escrita apagaria uma
    // `default` que saiu de propósito.
    if (state.pilha !== undefined) {
      this.pilha = [...state.pilha];
      this.emEdicao = state.emEdicao ?? null;
    } else if (state.skins !== undefined) {
      this.visibleSkins = [...state.skins];
    }
  }

  /** The bytes to write to disk. Editor state goes in first. */
  serialize(): string {
    this.captureEditorState();
    const header = this.currentFile.bone;
    if (header !== undefined) header.modified = new Date().toISOString();
    return JSON.stringify(this.currentFile, null, 2);
  }

  // -------------------------------------------------------------------------
  // Runtime side
  // -------------------------------------------------------------------------

  get data(): SkeletonData | null {
    return this.skeletonData;
  }

  /** The live skeleton: the one of the body of the instant (9.13). */
  get skeleton(): Skeleton | null {
    return this.live;
  }

  /** The nested skeletons of spec 7.11 this document was opened with. */
  get skeletons(): ReadonlyMap<string, SkeletonData> {
    return this.nestedSkeletons;
  }

  /**
   * As páginas do atlas já carregadas — degrau 5, para um **corpo novo** nascer
   * com o mesmo atlas do projeto (*"um atlas"*, spec 2.9). Só para ler: quem
   * troca de atlas usa `setAssets`.
   */
  get pageImages(): ReadonlyMap<string, CanvasImageSource> {
    return this.images;
  }

  get atlases(): readonly AtlasData[] {
    return this.loadedAtlases;
  }

  imageFor(page: AtlasPageData): CanvasImageSource | null {
    return this.ownImageFor(page) ?? this.project?.pageImage?.(this, page) ?? null;
  }

  /** A página pelas imagens DESTE documento só — sem perguntar ao projeto. */
  ownImageFor(page: AtlasPageData): CanvasImageSource | null {
    return this.images.get(page.image) ?? this.images.get(page.name) ?? null;
  }

  /** New atlases and images, after the user picked an `.atlas.json`. */
  setAssets(atlases: readonly AtlasData[], images: ReadonlyMap<string, CanvasImageSource>): void {
    this.loadedAtlases = atlases;
    this.images = images;
    applyHandPivots(this.currentFile, this.loadedAtlases);
    this.rebuildQuiet();
    this.emit({ kind: 'assets' });
  }

  /**
   * Os avisos do carregador e, depois deles, os da virada (9.13): um corpo que
   * a chave `body` cita e o projeto não tem (`BODY_MISSING`), um nome que o
   * corpo do instante não tem (`BODY_UNMET`), uma pele que não passa
   * (`SKIN_UNMET`). Regra 21: avisa, não improvisa.
   */
  get warnings(): readonly string[] {
    const virada = this.actor?.warnings ?? [];
    return virada.length === 0 ? this.currentWarnings : [...this.currentWarnings, ...virada];
  }

  /** The animation being edited, as runtime data, or `null`. */
  get animationData(): AnimationData | null {
    if (this.skeletonData === null || this.currentAnimation === null) return null;
    return this.skeletonData.findAnimation(this.currentAnimation);
  }

  // -------------------------------------------------------------------------
  // O corpo do instante — degrau 4b (9.13)
  // -------------------------------------------------------------------------

  /** O uri do corpo que vale em `time` na animação aberta; `null` = o arquivo. */
  get body(): string | null {
    return this.actor?.body ?? null;
  }

  /**
   * O documento do corpo do instante: este mesmo sem virada; o `Doc` do outro
   * corpo do projeto com ela. É onde a mexida estrutural vai (M7).
   */
  corpo(): EditorDoc {
    const uri = this.body;
    if (uri === null || this.project === null) return this;
    return this.project.docOf(uri) ?? this;
  }

  /**
   * O ator, montado de novo com os corpos de agora. Chamado pelo projeto
   * quando OUTRO corpo mudou de base (a pilha é uma só: desfazer um osso do
   * lobisomem tem de trocar o lobisomem que este ator segura). Não avisa
   * ninguém: quem avisa é `reflect`.
   */
  refreshBodies(): void {
    const data = this.skeletonData;
    if (data === null) return;
    this.actor = new Actor(data, this.project?.bodies(this) ?? new Map());
    this.live = this.actor.skeleton;
    this.reposeQuiet();
  }

  /**
   * O projeto repassa a mudança de outro corpo a quem ouve este documento — a
   * cena, a Árvore, a barra de estado —, já com o ator refeito. `label` traz o
   * *"(na base do lobisomem)"*.
   */
  reflect(change: DocChange): void {
    this.refreshBodies();
    this.emit(change);
  }

  /**
   * **Troca o corpo que este documento segura pelo de outro** — degrau 5.
   *
   * A casca, a cena e os painéis seguram UM objeto `Doc`, e o guardam desde o
   * arranque. Trocar o corpo em foco (clicar em Corpos, na janela Animação)
   * não pode, por isso, trocar o objeto: o que troca é o **conteúdo**. Os dois
   * documentos trocam de arquivo, de atlas, de ator, de agulha e de caminho;
   * o lobisomem passa a morar aqui, e o homem, lá.
   *
   * Três coisas NÃO trocam, e é por elas que isto funciona:
   *
   *   - **quem ouve** (`listeners`): a cena continua ouvindo este objeto, e por
   *     isso vê o corpo novo sem se remontar;
   *   - **a pilha** (`undoStack`): ela é uma só no projeto desde o 4b;
   *   - **o projeto** (`project`): os dois continuam no mesmo.
   *
   * O ator de cada um já está certo depois da troca: ele foi montado com "os
   * OUTROS corpos do projeto", e o projeto troca as duas chaves do mapa no
   * mesmo instante. Quem chama avisa quem ouve (`reflect`): aqui nada é
   * emitido, para a cena não desenhar um estado pela metade.
   */
  trocarCorpoCom(other: Doc): void {
    if (other === this) return;
    // A lista é explícita de propósito: um campo esquecido aqui seria um
    // pedaço do homem dentro do lobisomem, e isso não dá erro — dá desenho
    // errado. `listeners`, `undoStack` e `project` ficam, e só eles.
    const campos = [
      'currentFile', 'skeletonData', 'live', 'actor', 'loadedAtlases', 'images',
      'nestedSkeletons', 'currentSelection', 'currentWarnings', 'dirtyFlag',
      'currentTime', 'currentAnimation', 'currentMix', 'path', 'camera',
      // Rodada 8b, C10: a âncora é da entidade, e vai com ela.
      'anchorFn',
      // Degrau 9: a pilha e o lápis são o estado; `visibleSkins` é vista deles,
      // e trocar a vista não trocaria nada.
      'pilha', 'emEdicao',
    ];
    const aqui = this as unknown as Record<string, unknown>;
    const la = other as unknown as Record<string, unknown>;
    for (const campo of campos) {
      const guarda = aqui[campo];
      aqui[campo] = la[campo];
      la[campo] = guarda;
    }
  }

  /**
   * A pilha que o ator recebe: **a pilha, como ela é** — degrau 9, spec §4.4.
   *
   * Até o D8 esta conta punha a `default` embaixo por fora, porque o editor
   * ainda falava pelo `setSkin` de compatibilidade. Agora a pilha é a da tela,
   * e uma `default` que saiu sai de verdade: a arte do homem some por baixo do
   * lobisomem, que é o pedido I10.
   *
   * Nome que o arquivo não tem fica fora — o ator recusaria a pilha inteira, e
   * uma pele apagada entre dois redesenhos deixaria a cena preta.
   */
  private skinStackNames(): string[] {
    const known = new Set((this.currentFile.skins ?? []).map((skin) => skin.name));
    const out: string[] = [];
    for (const name of this.pilha) {
      if (!known.has(name) || out.includes(name)) continue;
      out.push(name);
    }
    return out;
  }

  /**
   * As peles da pilha que este corpo não tem — degrau 9, regra 21.
   *
   * Acontece de verdade: o arquivo foi salvo vestindo `armadura`, alguém
   * apagou a pele, e ao reabrir a pilha cita um nome que não existe. Sem aviso,
   * o personagem aparece pelado (ou invisível, se a `default` também tinha
   * saído) e nada na tela explica. A aba Peles já diz; a barra de avisos diz
   * mesmo com a aba fechada.
   */
  private skinsFaltando(): string[] {
    const known = new Set((this.currentFile.skins ?? []).map((skin) => skin.name));
    const doRuntime = new Set((this.skeletonData?.skins ?? []).map((skin) => skin.name));
    return this.pilha.filter((name) => !known.has(name) && !doRuntime.has(name));
  }

  private rebuildQuiet(): void {
    const warnings: string[] = [];
    try {
      // The loader keeps references into what it is given, so it reads a copy:
      // the document must never be changed behind the commands' back.
      // Reaproveitar (04/11/2026): as animações de `assets.animations` entram
      // na cópia, pela conta do runtime — senão a compartilhada não tocava.
      const copy = withSharedAnimations(JSON.parse(JSON.stringify(this.currentFile)) as unknown);
      const data = loadSkeletonData(copy, {
        atlases: this.loadedAtlases, skeletons: this.nestedSkeletons,
      });
      for (const warning of data.warnings) warnings.push(`${warning.pointer}: ${warning.message}`);
      for (const image of data.missingImages) warnings.push(`imagem não encontrada: ${image}`);
      // Reaproveitar (05/11): o que as compartilhadas deixam de fora, uma frase por arquivo.
      for (const aviso of sharedWarnings(this.currentFile)) warnings.push(aviso);
      this.skeletonData = data;
      // Degrau 9 (regra 21): pele ligada que este corpo não tem é DITA na barra
      // de avisos, e não só na aba Peles — com a aba fechada, o personagem
      // apareceria pelado e nada explicaria por quê.
      for (const pele of this.skinsFaltando()) {
        warnings.push(`a skin "${pele}" está ligada e esta base não a tem`);
      }
      // Rodada 11 (regra 21): "Este boneco" cujo slot do meio não existe mais
      // na entidade. O runtime a desenha em bloco; a barra de avisos diz por quê.
      for (const aviso of aroundWarnings(this.currentFile, this.nestedSkeletons)) warnings.push(aviso);
      // Degrau 4b: o ator monta o arquivo E os outros corpos do projeto, uma vez.
      this.actor = new Actor(data, this.project?.bodies(this) ?? new Map());
      this.live = this.actor.skeleton;
      this.live.setToSetupPose();
      this.live.updateWorldTransform(this.currentTime);
      this.currentWarnings = warnings;
      this.reposeQuiet();
    } catch (error) {
      this.skeletonData = null;
      this.actor = null;
      this.live = null;
      warnings.push(error instanceof Error ? error.message : String(error));
      this.currentWarnings = warnings;
    }
  }

  rebuild(): void {
    this.rebuildQuiet();
    this.emit({ kind: 'structure' });
  }

  /**
   * Reads `/animations` again and nothing else.
   *
   * Bones, slots, skins and attachments are left exactly as they are — the same
   * objects, so the `Skeleton` on screen stays alive — and only the timelines
   * are built again. This is the path every key takes: a drag writes one key per
   * mouse move, and a full `rebuild` there would re-read the whole file, and
   * every attachment in it, sixty times a second.
   */
  private rebuildAnimationsQuiet(): void {
    const data = this.skeletonData;
    if (data === null) {
      // Nothing loaded to patch: the file itself has to be read.
      this.rebuildQuiet();
      return;
    }
    try {
      const copy = JSON.parse(JSON.stringify({
        animations: sharedUrisOf(this.currentFile).length === 0
          ? this.currentFile.animations ?? []
          : composeShared(this.currentFile).animations,
      })) as unknown;
      const loaded = loadAnimationsFor(data, copy);
      data.replaceAnimations(loaded.animations);
      // The old timeline warnings are about timelines that no longer exist.
      const kept = this.currentWarnings.filter((w) => !w.startsWith('/animations'));
      this.currentWarnings = [
        ...kept,
        ...loaded.warnings.map((w) => `${w.pointer}: ${w.message}`),
      ];
      this.reposeQuiet();
    } catch {
      // A malformed animation: fall back to the honest, complete answer.
      this.rebuildQuiet();
    }
  }

  rebuildAnimations(): void {
    this.rebuildAnimationsQuiet();
    this.emit({ kind: 'structure' });
  }

  private reposeQuiet(): void {
    const actor = this.actor;
    if (actor === null) return;
    // A pilha de peles da tela vai para o ator ANTES de posar: é ele que a põe
    // no corpo do instante (e tira, com aviso, a pele que aquele corpo não tem).
    actor.setSkinStack(this.skinStackNames());
    const animation = this.animationData;
    const mix = this.currentMix;
    const from = mix === null || this.skeletonData === null
      ? null
      : this.skeletonData.findAnimation(mix.from);
    if (animation !== null && mix !== null && from !== null && mix.elapsed < mix.duration) {
      // Lote 46: a troca com mistura passa pelo `AnimationState` do runtime —
      // a mesma conta da Prévia e do jogo, com o `defaultMix` do arquivo. A
      // mistura é do corpo do arquivo: a virada não mistura (corte seco, 9.13).
      const skeleton = actor.esqueletos.get(null)!;
      this.live = skeleton;
      const state = new AnimationState();
      const out = state.setAnimation(0, from, false, 0);
      out.trackTime = mix.fromTime;
      const entry = state.setAnimation(0, animation, false, mix.duration);
      entry.trackTime = this.currentTime;
      entry.mixTime = mix.elapsed;
      state.apply(skeleton);
      skeleton.updateWorldTransform(this.currentTime);
      this.applyAnchor();
      return;
    }
    // `Pose(projeto, animação, t)` de 9.10: o corpo do instante, a base dele, a
    // animação casada com ele por nome, e o mundo em `t`.
    this.live = actor.pose(animation, this.currentTime);
    this.applyAnchor();
  }

  /**
   * Põe a raiz na âncora e refaz o mundo — rodada 8b, C10. Sem âncora, tira a
   * que tiver ficado: um documento de topo não tem pai.
   */
  private applyAnchor(): void {
    const live = this.live;
    if (live === null) return;
    const matrix = this.anchorFn === null ? null : this.anchorFn();
    if (matrix === null) {
      if (live.parentMatrix === null) return;
      live.parentMatrix = null;
    } else {
      live.parentMatrix = { ...matrix };
    }
    live.updateWorldTransform(this.currentTime);
  }

  /**
   * Prende (ou solta, com `null`) a raiz deste documento a uma matriz de fora —
   * rodada 8b, C10. Quem chama é a abertura da entidade por dentro.
   */
  setAnchor(anchor: (() => Matrix2x3 | null) | null): void {
    this.anchorFn = anchor;
    this.reposeQuiet();
  }

  /** `true` quando este documento está preso a uma âncora (C10). */
  get anchored(): boolean {
    return this.anchorFn !== null;
  }

  /**
   * Troca o esqueleto montado de uma entidade — rodada 8b, C10. Depois de
   * animar a espada por dentro, o herói passa a desenhar a espada nova, sem
   * reabrir nada. Refaz o ator e avisa quem ouve.
   */
  replaceNested(uri: string, data: SkeletonData): void {
    const next = new Map(this.nestedSkeletons);
    next.set(uri, data);
    this.nestedSkeletons = next;
    this.rebuildQuiet();
    this.emit({ kind: 'structure' });
  }

  /**
   * O mesmo, **sem refazer nem avisar** — rodada 9. Para um comando que cria a
   * entidade e a encaixa no mesmo passo (Marcar como slot): o `run` refaz o
   * ator depois do `apply`, uma vez só.
   */
  setNestedQuiet(uri: string, data: SkeletonData): void {
    const next = new Map(this.nestedSkeletons);
    next.set(uri, data);
    this.nestedSkeletons = next;
  }

  repose(label?: string): void {
    this.reposeQuiet();
    // Rodada 46, lote 1: o recado do gesto viaja com o quadro, e o rodapé o mantém.
    this.emit(label === undefined ? { kind: 'transform' } : { kind: 'transform', label });
  }

  crossfade(mix: Crossfade | null): void {
    if (mix === null && this.currentMix === null) return;
    this.currentMix = mix === null ? null : { ...mix };
    this.reposeQuiet();
    this.emit({ kind: 'transform' });
  }

  // -------------------------------------------------------------------------
  // Selection, time, animation
  // -------------------------------------------------------------------------

  get selection(): Selection {
    return this.currentSelection;
  }

  select(selection: Selection): void {
    this.currentSelection = selection;
    this.emit({ kind: 'selection' });
  }

  get time(): number {
    return this.currentTime;
  }

  set time(value: number) {
    if (value === this.currentTime) return;
    this.currentTime = value;
    this.reposeQuiet();
    this.emit({ kind: 'time' });
  }

  get animation(): string | null {
    return this.currentAnimation;
  }

  set animation(name: string | null) {
    if (name === this.currentAnimation) return;
    this.currentAnimation = name;
    this.currentTime = 0;
    this.reposeQuiet();
    // A full sentence, not the bare animation name: the status bar slot says
    // what just happened, and "walk." alone is not a thing that happened.
    this.emit({
      kind: 'time',
      label: name === null ? 'Abriu a base' : `Abriu a animação "${name}"`,
    });
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  run(command: Command): void {
    // Rodada 13: a peça que volta com o mesmo nome traz as chaves guardadas
    // dela. A religação entra NO MESMO passo de desfazer do comando que fez a
    // peça voltar: um Ctrl+Z tira a peça e as chaves juntas. O que NÃO pode
    // voltar (outro tipo, linha já ocupada) o rodapé diz uma vez, quando
    // aparece — não a cada mexida depois.
    const watch = command.kind === 'structure' && readGuarded(this.currentFile).length > 0;
    const before = watch ? relinkPlan(this.currentFile) : null;
    command.apply(this);
    let step: Command = command;
    let aviso = '';
    if (before !== null) {
      const plan = relinkPlan(this.currentFile);
      const otherKind = plan.otherKind.filter((o) => !before.otherKind.some((b) => b.nome === o.nome && b.tipo === o.tipo));
      const taken = Math.max(0, plan.taken - before.taken);
      if (plan.back.length > 0) {
        const relink = new RelinkGuarded();
        relink.apply(this);
        step = new WithRelink(command, relink);
        aviso = relinkNotice({ ...relink.summary, otherKind, taken });
      } else {
        aviso = relinkNotice({ keys: 0, animations: 0, names: [], otherKind, taken });
      }
    }
    // O uri vai junto: o foco troca de corpo sem trocar de objeto (degrau 5),
    // e sem ele o desfazer procuraria os ossos do homem dentro do lobisomem.
    // Um passo novo depois de desfazer além do ponto salvo: ele não volta mais.
    if (this.undoStack.cursor() < this.savedCursor) this.savedCursor = -2;
    this.undoStack.push(step, this, this.project?.uriOf?.(this) ?? undefined);
    this.dirtyFlag = true;
    this.after(step, step.label);
    if (aviso !== '') this.notice(aviso);
  }

  /**
   * Desfaz o último passo da pilha — que, num projeto, pode ter sido dado em
   * OUTRO corpo (degrau 4b). A pilha reverte no dono; o dono põe o lado do
   * runtime em dia e avisa quem o ouve, e o projeto repassa a este documento.
   */
  undo(): void {
    const command = this.undoStack.undo(this);
    if (command === null) return;
    this.ownerOf(command).afterStep(command, `Desfeito: ${command.label}`);
  }

  redo(): void {
    const command = this.undoStack.redo(this);
    if (command === null) return;
    this.ownerOf(command).afterStep(command, `Refeito: ${command.label}`);
  }

  /** O documento em que o comando foi aplicado: outro corpo do projeto, ou este. */
  private ownerOf(command: Command): Doc {
    const owner = this.undoStack.ownerOf(command);
    return owner instanceof Doc ? owner : this;
  }

  /** Um passo desfeito ou refeito NESTE documento: suja, põe em dia, avisa. */
  afterStep(command: Command, label: string): void {
    this.dirtyFlag = this.undoStack.cursor() !== this.savedCursor;
    this.after(command, label);
  }

  /** Closes the current drag, so the next one is its own undo step. */
  endMerge(): void {
    this.undoStack.breakMerge();
  }

  /**
   * A pilha deste documento, para o projeto dar a mesma aos outros corpos
   * (degrau 4b). Só `doc/projeto.ts` chama: quem mais precisa da pilha lê
   * `history`, que é só para ler.
   */
  stackForProject(): UndoStack {
    return this.undoStack;
  }

  /**
   * Brings the runtime side up to date after a command, by the cheapest road
   * that is still exact:
   *   - `animationOnly`: only that file's timelines are read again;
   *   - `structure`, `file`, `assets`: the whole file is read again;
   *   - anything else: the skeleton is only posed again.
   * Listeners are told the kind the command declared, whichever road was taken.
   */
  private after(command: Command, label: string): void {
    const kind = command.kind;
    if (command.animationOnly !== undefined) this.rebuildAnimationsQuiet();
    else if (kind === 'structure' || kind === 'file' || kind === 'assets') this.rebuildQuiet();
    else this.reposeQuiet();
    // Rodada 23, defeito 3: o que o comando fez sumir sai da seleção, na hora.
    // Só quando este documento é o próprio corpo: com a virada de corpo, a
    // seleção fala dos ossos do OUTRO arquivo, e esta conta os apagaria.
    const pruned = kind === 'structure' && this.corpo() === this
      ? pruneSelection(this.currentFile, this.skinStackNames(), this.currentSelection)
      : null;
    // A seleção avisa ANTES: o rodapé fica com a frase do comando
    // ("Desfeito: Novo osso"), e não com a do aviso que veio depois.
    if (pruned !== null) {
      this.currentSelection = pruned;
      this.emit({ kind: 'selection' });
    }
    this.emit({ kind, label });
  }

  get canUndo(): boolean {
    return this.undoStack.canUndo;
  }

  get canRedo(): boolean {
    return this.undoStack.canRedo;
  }

  /**
   * A pilha de desfazer, **só para ler** — o painel Histórico, lote 19.
   *
   * O tipo devolvido só tem `entries()` e `cursor()`: quem receber isto não
   * consegue empurrar nem tirar um comando. Voltar até um passo é chamar
   * `undo()` a conta de vezes que `panels/history-model.ts` disser.
   */
  get history(): UndoView {
    return this.undoStack;
  }

  get undoLabel(): string | null {
    return this.undoStack.undoLabel;
  }

  get redoLabel(): string | null {
    return this.undoStack.redoLabel;
  }

  // -------------------------------------------------------------------------
  // Listeners
  // -------------------------------------------------------------------------

  on(listener: DocListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  /** Status-bar-only message: no command, no undo step, no dirty mark. */
  notice(text: string): void {
    this.emit({ kind: 'selection', label: text });
  }

  private emit(change: DocChange): void {
    for (const listener of [...this.listeners]) listener(change);
  }
}
