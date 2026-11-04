/**
 * A lista da pasta, como conta (dono C) — lote 60, plano pasta do projeto.
 *
 * O Humberto, 10/09/2026: *"quero trocar as imagens como no Spriter: com o
 * botão esquerdo ele abre as imagens que estão na pasta; mostra a imagem que
 * está na mesma pasta."* A troca da mão mostra as mãos. Este arquivo decide
 * quais imagens a lista mostra, quando o clique na cena abre a lista, e o
 * comando da troca em Animando. O desenho da lista mora em `image-picker.ts`.
 */

import { findAtlasRegion } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc, Selection } from '../contract.js';
import { EDITOR_EXTENSION, corpoDe, uniqueName, wentToBase } from '../contract.js';
import { keepStartKey, setKey } from '../anim/keying.js';
import { baseOf, folderOf, naturalCompare, sameFolderImages } from '../io/project-folder.js';
import {
  placeAtPivot, pivotInBone, restoreDef, snapshotDef, swapImage, type DefSnapshot,
} from '../io/pivot-model.js';
import { SwapSlotImage, attachmentNameFor, fold, isEntityDef, outgoingRegion } from './palette-model.js';
import { imageOf } from './skins-model.js';

/** Uma imagem da lista. */
export interface PickerEntry {
  /** O nome inteiro, que é o da região: `maos/mao_aberta`. */
  name: string;
  /** O que a lista escreve: o nome sem a subpasta. */
  label: string;
  /** `true` para a imagem que o desenho mostra agora. */
  current: boolean;
  /**
   * O que esta linha é — degrau 8, tarefa 8.1 (E6). Ausente é `imagem`: as
   * listas de antes não sabem de entidade, e continuam valendo como estavam.
   * Numa linha `entidade`, `name` é o **uri** do `.bone`.
   */
  kind?: 'imagem' | 'entidade';
}

export interface PickerList {
  entries: PickerEntry[];
  /** A frase de cima quando a lista não é de uma subpasta, ou `null`. */
  hint: string | null;
  /** A subpasta da lista. Vazia = a raiz, ou todas. */
  folder: string;
}

/** A dica quando a imagem não está em subpasta nenhuma e não há pasta aberta. */
export const NO_FOLDER_HINT = 'Abra a pasta do projeto para agrupar as imagens: Arquivo → Abrir pasta do projeto…';

/** A dica da lista: o que o clique, o Shift e as teclas fazem. */
export const PICKER_HINT = 'Clique para trocar. Shift + clique troca em todas as skins. '
  + 'Setas andam, Enter escolhe, Esc fecha';

/**
 * As imagens que a lista mostra para o desenho que hoje mostra `current`.
 *
 * - `current` numa subpasta: as da **mesma subpasta**, em ordem natural.
 * - `current` na raiz, com a pasta do projeto aberta: as da raiz.
 * - `current` sem subpasta e sem pasta aberta (um atlas importado de nomes
 *   soltos): **todas**, com a dica de abrir a pasta para agrupar.
 */
export function pickerEntries(
  names: readonly string[], current: string | null, options: { folderOpen?: boolean } = {},
): PickerList {
  const folder = current === null ? '' : folderOf(current);
  let chosen: string[];
  let hint: string | null = null;
  if (folder !== '' || options.folderOpen === true) {
    chosen = sameFolderImages(names, current ?? '');
  } else {
    chosen = [...new Set(names)].sort(naturalCompare);
    hint = NO_FOLDER_HINT;
  }
  return {
    entries: chosen.map((name) => ({ name, label: baseOf(name), current: name === current })),
    hint,
    folder,
  };
}

/** A lista filtrada pela busca, sem acento e sem caixa. */
export function filterPicker(entries: readonly PickerEntry[], text: string): PickerEntry[] {
  const alvo = fold(text.trim());
  return alvo === '' ? [...entries] : entries.filter((entry) => fold(entry.name).includes(alvo));
}

/** O desenho que a lista troca: slot, desenho e a pele onde ele mora. */
export interface PickerTarget {
  slot: string;
  attachment: string;
  skin: string;
}

/**
 * Onde mora o desenho `slot/attachment`: a pele do lápis (a primeira visível)
 * quando ela o tem, senão a primeira pele que o tem. `null` quando o desenho
 * não existe, ou não tem imagem (ponto, caixa, caminho e máscara).
 */
export function pickerTarget(
  file: { skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> },
  visibleSkins: readonly string[],
  slot: string,
  attachment: string,
): PickerTarget | null {
  const skins = file.skins ?? [];
  const has = (skin: (typeof skins)[number]): boolean => {
    const def = skin.attachments?.[slot]?.[attachment];
    return def !== undefined && imageOf(attachment, def) !== null;
  };
  const first = skins.find((skin) => skin.name === visibleSkins[0] && has(skin)) ?? skins.find(has);
  return first === undefined ? null : { slot, attachment, skin: first.name };
}

/**
 * O desenho de um **slot** escolhido sozinho — lote 3 da rodada final (Q5).
 * `shown` é o que o slot mostra agora (o esqueleto na cena sabe); sem ele, o
 * desenho da Montagem. `null` quando o slot está vazio ou não desenha imagem.
 */
export function targetOfSlot(
  file: {
    slots?: ReadonlyArray<{ name: string; attachment?: string | null }>;
    skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }>;
  },
  visibleSkins: readonly string[],
  slot: string,
  shown: string | null,
): PickerTarget | null {
  const name = shown ?? (file.slots ?? []).find((s) => s.name === slot)?.attachment ?? null;
  return name === null || name === undefined ? null : pickerTarget(file, visibleSkins, slot, name);
}

/**
 * O mesmo que `pickerTarget`, mas a grade também aceita o desenho que já é uma
 * **entidade** — degrau 8, tarefa 8.1. Sem isto, trocar por entidade fechava a
 * porta: a grade não abria mais naquele desenho.
 */
export function gridTarget(
  file: { skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> },
  visibleSkins: readonly string[],
  slot: string,
  attachment: string,
): PickerTarget | null {
  const skins = file.skins ?? [];
  const has = (skin: (typeof skins)[number]): boolean => gridNow(file, skin.name, slot, attachment) !== null;
  const first = skins.find((skin) => skin.name === visibleSkins[0] && has(skin)) ?? skins.find(has);
  return first === undefined ? null : { slot, attachment, skin: first.name };
}

/** Quantos pixels o ponteiro pode andar e o clique continuar sendo clique. */
export const PICKER_CLICK_SLOP = 4;

/**
 * O clique na cena abre a lista? — lote 60.
 *
 * Só o **clique parado**, com o botão esquerdo, no desenho que **já estava**
 * escolhido antes do clique. Arrastar continua movendo: a partir de
 * `PICKER_CLICK_SLOP` pixels é arrasto, e a lista não abre. Clicar num desenho
 * que não estava escolhido só escolhe, como sempre.
 */
export function opensPicker(
  before: Selection,
  hit: { kind: string; slot: string | null; attachment: string | null } | null,
  moved: number,
  button = 0,
): { slot: string; attachment: string } | null {
  if (button !== 0 || moved >= PICKER_CLICK_SLOP) return null;
  if (hit === null || hit.kind !== 'attachment' || hit.slot === null || hit.attachment === null) return null;
  if (before.attachments.length !== 1) return null;
  const was = before.attachments[0]!;
  return was.slot === hit.slot && was.attachment === hit.attachment
    ? { slot: hit.slot, attachment: hit.attachment }
    : null;
}

/** Arredonda como o resto do editor. */
function round(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}

// ---------------------------------------------------------------------------
// A grade lista entidades, e a troca herda o lugar — degrau 8, tarefa 8.1
// ---------------------------------------------------------------------------

/*
 * E6 e E7, palavra do Humberto: *"a grade do botão direito lista entidades, e
 * trocar imagem por entidade herda osso, pivô, ordem e chaves"*.
 *
 * Os três programas, antes de desenhar (regra da casa):
 *
 * | Programa | Como troca uma imagem por um objeto inteiro |
 * |:---|:---|
 * | Spriter | o campo de imagem do objeto lista a pasta; um objeto de outra entidade entra como *sub-entity* NO MESMO slot, herdando o lugar |
 * | Spine | arrastar um `.skel` para um slot cria um attachment novo no slot que já existe; ordem e chaves do slot ficam |
 * | DragonBones | *display* trocado dentro do mesmo slot, pela lista do slot |
 *
 * Os três trocam **dentro do slot**. Nós também: o anexo muda de tipo e
 * **guarda o nome**. Guardar o nome é o que herda as chaves — toda chave
 * `slot/attachment` que apontava para ele continua apontando —, e guardar o
 * slot é o que herda o osso e o lugar na ordem de desenho.
 *
 * O pino (§7.11) sai do **pivô** da imagem que saiu: a raiz do filho cai onde
 * a imagem encaixava no osso (`pivotInBone`), e não no centro dela. Sem pivô
 * carimbado os dois pontos são o mesmo, e a conta devolve o `x, y` do anexo,
 * que é o que a §7.11 pede em letra.
 */

/** O que um desenho mostra agora: uma imagem do atlas, ou uma entidade. */
export interface GridNow {
  kind: 'imagem' | 'entidade';
  /** O nome da imagem, ou o uri do `.bone` da entidade. */
  name: string;
}

/**
 * O que o desenho `slot/attachment` da pele `skin` mostra hoje, ou `null`
 * quando ele não mostra nem imagem nem entidade (ponto, caixa, caminho).
 *
 * A grade precisa disto, e não do `swapPickFor` das peles: aquele só conhece
 * imagem, e um slot que já virou entidade devolvia `null` — a grade não abria
 * mais, e não havia caminho de volta. Um gesto sem volta é um gesto que
 * engana (regra 21).
 */
export function gridNow(
  file: { skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> },
  skin: string, slot: string, attachment: string,
): GridNow | null {
  const def = (file.skins ?? []).find((s) => s.name === skin)?.attachments?.[slot]?.[attachment];
  if (def === undefined || def === null || typeof def !== 'object') return null;
  const d = def as { type?: string; uri?: string };
  if (d.type === 'skeleton') {
    return typeof d.uri === 'string' && d.uri !== '' ? { kind: 'entidade', name: d.uri } : null;
  }
  const image = imageOf(attachment, def);
  return image === null ? null : { kind: 'imagem', name: image };
}

/** Uma entidade do projeto, como a grade a lista. */
export interface GridEntity {
  uri: string;
  /** O nome que se lê: `espada`. */
  name: string;
}

/**
 * As linhas de entidade da grade, com a de agora marcada. `current` é o que o
 * desenho mostra hoje — só bate quando ele já é uma entidade.
 */
export function entityEntries(
  entities: readonly GridEntity[], current: GridNow | null,
): PickerEntry[] {
  const agora = current !== null && current.kind === 'entidade' ? current.name : null;
  return entities.map((entity) => ({
    name: entity.uri,
    label: entity.name,
    current: entity.uri === agora,
    kind: 'entidade' as const,
  }));
}

/** Os campos que viajam de um anexo para o outro na troca: giro e escala. */
type Pose = { rotation?: number; scaleX?: number; scaleY?: number };

function poseOf(def: Record<string, unknown>): Pose {
  const out: Pose = {};
  for (const key of ['rotation', 'scaleX', 'scaleY'] as const) {
    const value = def[key];
    if (typeof value === 'number') out[key] = value;
  }
  return out;
}

/** O anexo de um desenho numa pele, ou `null`. */
function defOf(doc: EditorDoc, skin: string, slot: string, attachment: string): Record<string, unknown> | null {
  const found = (doc.file.skins ?? []).find((s) => s.name === skin)?.attachments?.[slot]?.[attachment];
  return found === undefined || found === null || typeof found !== 'object'
    ? null
    : found as unknown as Record<string, unknown>;
}

/**
 * **Trocar a imagem por uma entidade** — E7. O anexo vira `skeleton` no mesmo
 * slot, com o mesmo nome: osso, lugar na ordem e chaves ficam onde estão, e a
 * raiz do filho cai no pivô da imagem que saiu.
 */
export class SwapForEntity implements Command {
  readonly label = 'Trocar por entidade';
  readonly kind: ChangeKind = 'structure';
  /** Onde a raiz do filho ficou, para a frase do rodapé. Vale depois do `apply`. */
  pin: { x: number; y: number } = { x: 0, y: 0 };
  private before: DefSnapshot | null = null;

  constructor(
    private readonly slot: string,
    private readonly attachment: string,
    private readonly skin: string,
    private readonly uri: string,
  ) {}

  apply(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    if (def === null) return;
    this.before = snapshotDef(def);
    const image = imageOf(this.attachment, def);
    const region = image === null ? null : findAtlasRegion(doc.atlases ?? [], image);
    const pose = poseOf(def);
    this.pin = region === null
      ? { x: round((def['x'] as number | undefined) ?? 0), y: round((def['y'] as number | undefined) ?? 0) }
      : pivotInBone(region, def as never, region.scale ?? 1);
    // Rodada 8a: a imagem que sai fica guardada, para voltar inteira. Trocar
    // uma entidade por outra carrega a mesma imagem de antes adiante.
    const antes = def['type'] === 'skeleton' ? imageBeforeOf(def) : JSON.parse(JSON.stringify(def));
    for (const key of Object.keys(def)) delete def[key];
    def['type'] = 'skeleton';
    def['uri'] = this.uri;
    def['x'] = this.pin.x;
    def['y'] = this.pin.y;
    if (pose.rotation !== undefined && pose.rotation !== 0) def['rotation'] = pose.rotation;
    if (pose.scaleX !== undefined && pose.scaleX !== 1) def['scaleX'] = pose.scaleX;
    if (pose.scaleY !== undefined && pose.scaleY !== 1) def['scaleY'] = pose.scaleY;
    if (antes !== null) def['extensions'] = { [EDITOR_EXTENSION]: { [IMAGE_BEFORE]: antes } };
  }

  revert(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    if (def === null || this.before === null) return;
    restoreDef(def, this.before);
    this.before = null;
  }
}

/**
 * **Trocar a entidade por uma imagem** — a volta de `SwapForEntity`. O anexo
 * vira `region` de novo, e a imagem entra pelo pivô: onde estava a raiz do
 * filho fica o pivô da imagem nova. Mesmo slot, mesmo nome, mesmas chaves.
 */
export class SwapForImage implements Command {
  readonly label = 'Trocar a entidade pela imagem';
  readonly kind: ChangeKind = 'structure';
  private before: DefSnapshot | null = null;

  constructor(
    private readonly slot: string,
    private readonly attachment: string,
    private readonly skin: string,
    private readonly image: string,
  ) {}

  apply(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    if (def === null) return;
    this.before = snapshotDef(def);
    const pose = poseOf(def);
    const pin = {
      x: (def['x'] as number | undefined) ?? 0,
      y: (def['y'] as number | undefined) ?? 0,
    };
    const region = findAtlasRegion(doc.atlases ?? [], this.image);
    const at = region === null
      ? { x: round(pin.x), y: round(pin.y) }
      : placeAtPivot(pin, region, pose, region.scale ?? 1);
    for (const key of Object.keys(def)) delete def[key];
    def['type'] = 'region';
    def['path'] = this.image;
    def['x'] = at.x;
    def['y'] = at.y;
    if (pose.rotation !== undefined && pose.rotation !== 0) def['rotation'] = pose.rotation;
    if (pose.scaleX !== undefined && pose.scaleX !== 1) def['scaleX'] = pose.scaleX;
    if (pose.scaleY !== undefined && pose.scaleY !== 1) def['scaleY'] = pose.scaleY;
  }

  revert(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    if (def === null || this.before === null) return;
    restoreDef(def, this.before);
    this.before = null;
  }
}

/**
 * **A troca certa para o desenho** — rodada 44, lote 1 (06/10/2026).
 *
 * Soltar uma imagem na linha de um slot cujo desenho é uma **entidade**
 * gravava `path` no anexo `skeleton`: o leitor ignora, a cena não mudava, e o
 * rodapé dizia *"agora mostra"* — a regra 21. Agora a entidade vira imagem,
 * pelo pivô dela, como na grade (`SwapForImage`); um desenho de imagem troca
 * como sempre (`SwapSlotImage`). `entidade` diz qual foi, para o rodapé.
 */
export function swapCommandFor(
  doc: EditorDoc, slot: string, image: string, skin: string, attachment: string,
): { command: Command; entidade: boolean } {
  const def = defOf(doc, skin, slot, attachment);
  if (def !== null && isEntityDef(def)) {
    return { command: new SwapForImage(slot, attachment, skin, image), entidade: true };
  }
  return { command: new SwapSlotImage(slot, image, skin, attachment), entidade: false };
}

// ---------------------------------------------------------------------------
// Caber no lugar da antiga — rodada 44, lote 7 (doc 75)
// ---------------------------------------------------------------------------

/*
 * O machado de 1275 × 1027 px entrava no lugar da espada, e acertar a escala
 * custava oito gestos. O Spriter tem o "fit" da imagem trocada; aqui, ao
 * trocar, o programa guarda o tamanho do desenho que SAIU (imagem ou
 * entidade), e "Caber no lugar da antiga" muda a escala do desenho novo para
 * o lado maior dele ficar igual ao da antiga. Vale na base (a escala do
 * desenho não é chave), e o rodapé diz.
 */

/** O lado maior de cada slot ANTES da última troca, nas unidades do osso. */
const sizeBefore = new Map<string, number>();

/** O lado maior do desenho `def` do slot, nas unidades do osso, ou `null`. */
export function sideOfDef(
  doc: EditorDoc, slot: string, name: string, def: Record<string, unknown> | null,
): number | null {
  if (def === null) return null;
  const sx = Math.abs((def['scaleX'] as number | undefined) ?? 1);
  const sy = Math.abs((def['scaleY'] as number | undefined) ?? 1);
  if (def['type'] === 'skeleton') {
    const vivo = corpoDe(doc).skeleton?.findSlot(slot) as unknown as
      { nested?: { skeleton?: { getBounds(): { width: number; height: number } } } } | null;
    const caixa = vivo?.nested?.skeleton?.getBounds();
    if (caixa === undefined || caixa.width <= 0 || caixa.height <= 0) return null;
    return Math.max(caixa.width * sx, caixa.height * sy);
  }
  const imagem = (def['path'] as string | undefined) ?? name;
  const r = findAtlasRegion(doc.atlases ?? [], imagem);
  if (r === null) return null;
  return Math.max((r.originalWidth ?? r.width) * sx, (r.originalHeight ?? r.height) * sy);
}

/** Guarda o tamanho do desenho que vai sair — chamado ANTES de cada troca. */
export function rememberSizeBefore(doc: EditorDoc, target: PickerTarget): void {
  const lado = sideOfDef(doc, target.slot, target.attachment, defOf(corpoDe(doc), target.skin, target.slot, target.attachment));
  if (lado === null) sizeBefore.delete(target.slot);
  else sizeBefore.set(target.slot, lado);
}

/** O fator que faz o desenho de agora caber no tamanho da antiga, ou `null`. */
export function fitFactor(antes: number | null | undefined, agora: number | null): number | null {
  if (antes === null || antes === undefined || agora === null || agora <= 0) return null;
  const f = antes / agora;
  return Math.abs(f - 1) < 0.02 ? null : Math.round(f * 10000) / 10000;
}

/** O plano do "Caber" para o desenho escolhido, ou `null` quando não há o que caber. */
export function fitPlan(doc: EditorDoc, target: PickerTarget | null): number | null {
  if (target === null) return null;
  const def = defOf(corpoDe(doc), target.skin, target.slot, target.attachment);
  if (def === null || def['type'] === 'skeleton') return null;
  return fitFactor(sizeBefore.get(target.slot), sideOfDef(doc, target.slot, target.attachment, def));
}

/** Por que "Caber no lugar da antiga" está cinza. */
export const FIT_WHY = 'Troque a imagem de um desenho primeiro (botão direito na peça): '
  + '"Caber" usa o tamanho do desenho que saiu';

/** A escala do desenho, vezes `factor`, num passo de desfazer. */
export class FitToPrevious implements Command {
  readonly label = 'Caber no lugar da antiga';
  // A escala do DESENHO mora no anexo, que só se relê no rebuild: 'transform'
  // só repunha a pose, e o machado continuava enorme na cena.
  readonly kind: ChangeKind = 'structure';
  private before: { scaleX?: unknown; scaleY?: unknown } | null = null;

  constructor(
    private readonly slot: string, private readonly attachment: string,
    private readonly skin: string, private readonly factor: number,
  ) {}

  apply(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    if (def === null) return;
    this.before = { scaleX: def['scaleX'], scaleY: def['scaleY'] };
    const r = (v: number): number => Math.round(v * 10000) / 10000;
    def['scaleX'] = r(((def['scaleX'] as number | undefined) ?? 1) * this.factor);
    def['scaleY'] = r(((def['scaleY'] as number | undefined) ?? 1) * this.factor);
  }

  revert(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    if (def === null || this.before === null) return;
    for (const k of ['scaleX', 'scaleY'] as const) {
      if (this.before[k] === undefined) delete def[k];
      else def[k] = this.before[k];
    }
    this.before = null;
  }
}

/** **Caber no lugar da antiga** — a ação: pelo menu Imagens e pela grade. */
export function fitToPrevious(doc: EditorDoc, target: PickerTarget | null): boolean {
  const f = fitPlan(doc, target);
  if (target === null || f === null) {
    doc.notice(FIT_WHY);
    return false;
  }
  corpoDe(doc).run(new FitToPrevious(target.slot, target.attachment, target.skin, f));
  doc.notice(`${target.slot} cabe no lugar da antiga: escala × ${String(f).replace('.', ',')}${wentToBase(doc)}`);
  return true;
}

/**
 * **O tamanho da imagem trocada** — rodada 44, lote 6 (doc 71).
 *
 * Decisão pelo Spriter e pelo Spine (suposição S5 do doc 55): a imagem nova
 * entra **no tamanho dela**. O Spriter põe a nova "in the exact location…
 * based on their respective pivot points" e pede o mesmo tamanho; o Spine
 * desenha o anexo pela região dele. Nenhum dos dois estica para caber. O que
 * faltava era DIZER: o machado de 1275 × 1027 px entrava num herói de 241 px
 * sem uma palavra. O rodapé fala quando o lado maior muda mais que o dobro,
 * ou quando não há imagem de antes (a entidade) e a nova passa de 256 px.
 */
export function swapSizeTail(
  antes: number | null, agora: number | null, tamanho: { width: number; height: number } | null,
): string {
  // Rodada 44, lote 7 (doc 75): a frase é CURTA — a de antes saía cortada
  // na barra ("…tamanho dela, 127…"). Ela é o rodapé inteiro, sem a frase da
  // troca na frente, e diz onde está o "Caber".
  if (tamanho === null || agora === null) return '';
  if (antes === null ? agora <= 256 : (agora / Math.max(1, antes) <= 2 && agora / Math.max(1, antes) >= 0.5)) return '';
  return `entrou no tamanho dela, ${Math.round(tamanho.width)} × ${Math.round(tamanho.height)} px. `
    + 'Para caber: Imagens → Caber no lugar da antiga';
}

/** O mesmo, lendo o tamanho guardado da antiga e o da imagem nova no atlas. */
export function swapSizeNote(doc: EditorDoc, target: PickerTarget, image: string): string {
  const r = findAtlasRegion(doc.atlases ?? [], image);
  const tamanho = r === null ? null : { width: r.originalWidth ?? r.width, height: r.originalHeight ?? r.height };
  const agora = sideOfDef(doc, target.slot, target.attachment, defOf(corpoDe(doc), target.skin, target.slot, target.attachment));
  return swapSizeTail(sizeBefore.get(target.slot) ?? null, agora, tamanho);
}

/** O rodapé depois de trocar um desenho por uma entidade. */
export function entitySwapNotice(
  slot: string, name: string, pin: { x: number; y: number }, base: string,
): string {
  const n = (v: number): string => String(v).replace('.', ',');
  return `${slot} mostra a entidade "${name}": a raiz dela caiu no pivô da imagem `
    + `(${n(pin.x)}, ${n(pin.y)})${base}`;
}

// ---------------------------------------------------------------------------
// A imagem de antes volta — rodada 8a (04/10/2026), decisão 6 da conexão
// ---------------------------------------------------------------------------

/*
 * *"Quando a entidade sai, a imagem de antes volta."* A troca apagava a
 * imagem do anexo — ela só sobrevivia na pilha de desfazer, e o único jeito
 * de tê-la de volta era `Ctrl+Z` (C5 da rodada 1).
 *
 * Onde ela fica: no próprio anexo da entidade, em
 * `extensions.RECORTE_editor_state.imagemDeAntes` — estado só do editor (regra
 * 6 da casa), que os leitores ignoram (§2.7), e que anda junto com o anexo:
 * renomear o slot, duplicar, copiar para outra pele, e ela vai junto. Nenhum
 * campo novo no núcleo do formato.
 */

/** A chave dentro de `RECORTE_editor_state` do anexo. */
export const IMAGE_BEFORE = 'imagemDeAntes';

/** A imagem que a entidade substituiu, como era, ou `null`. */
export function imageBeforeOf(def: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  const ext = (def?.['extensions'] as Record<string, unknown> | undefined)?.[EDITOR_EXTENSION];
  const antes = (ext as Record<string, unknown> | undefined)?.[IMAGE_BEFORE];
  return antes !== null && typeof antes === 'object' && !Array.isArray(antes)
    ? antes as Record<string, unknown>
    : null;
}

/** O que o gesto "Tirar a entidade" sabe do desenho escolhido. */
export interface TakeOutTarget extends PickerTarget {
  /** A imagem que volta. */
  image: string;
}

/**
 * O desenho escolhido é uma entidade **que substituiu uma imagem**? Então o
 * gesto tem o que devolver. `null` em qualquer outro caso — e quem chama diz
 * por quê (regra 21), em vez de o botão ficar mudo.
 */
export function takeOutTarget(
  file: { skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> },
  visibleSkins: readonly string[],
  slot: string,
  attachment: string,
): TakeOutTarget | null {
  const target = gridTarget(file, visibleSkins, slot, attachment);
  if (target === null) return null;
  const def = (file.skins ?? []).find((s) => s.name === target.skin)?.attachments?.[slot]?.[attachment];
  if (def === undefined || (def as { type?: string }).type !== 'skeleton') return null;
  const antes = imageBeforeOf(def as Record<string, unknown>);
  const image = antes === null ? null : imageOf(attachment, antes);
  return image === null ? null : { ...target, image };
}

/**
 * **Tirar a entidade** — a imagem de antes volta, **como era**: o mesmo
 * caminho, o mesmo lugar, o mesmo giro, a mesma malha. Mesmo slot, mesmo
 * nome: as chaves que apontavam para o desenho continuam apontando.
 */
export class TakeOutEntity implements Command {
  readonly label = 'Tirar a entidade';
  readonly kind: ChangeKind = 'structure';
  private before: DefSnapshot | null = null;

  constructor(
    private readonly slot: string,
    private readonly attachment: string,
    private readonly skin: string,
  ) {}

  apply(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    const antes = imageBeforeOf(def);
    if (def === null || antes === null || def['type'] !== 'skeleton') return;
    this.before = snapshotDef(def);
    const volta = JSON.parse(JSON.stringify(antes)) as Record<string, unknown>;
    for (const key of Object.keys(def)) delete def[key];
    for (const [key, value] of Object.entries(volta)) def[key] = value;
  }

  revert(doc: EditorDoc): void {
    const def = defOf(doc, this.skin, this.slot, this.attachment);
    if (def === null || this.before === null) return;
    restoreDef(def, this.before);
    this.before = null;
  }
}

/**
 * O desenho que o gesto "Tirar a entidade" pega na seleção: um desenho só, ou
 * um slot só (o da Ordem), pelo que ele mostra agora.
 */
function shownOfSelection(doc: EditorDoc): { slot: string; attachment: string | null } | null {
  const corpo = corpoDe(doc);
  const one = doc.selection.attachments.length === 1 ? doc.selection.attachments[0]! : null;
  if (one !== null) return { slot: one.slot, attachment: one.attachment };
  if (doc.selection.slots.length !== 1) return null;
  const slot = doc.selection.slots[0]!;
  // O que a cena mostra; sem o filho carregado ela não mostra nada, e vale o
  // desenho da base.
  const daBase = (corpo.file.slots ?? []).find((s) => s.name === slot)?.attachment ?? null;
  return { slot, attachment: corpo.skeleton?.findSlot(slot)?.attachment?.name ?? daBase };
}

/** `true` quando a seleção é uma entidade com imagem de antes: o gesto acende. */
export function canTakeOutEntity(doc: EditorDoc): boolean {
  const shown = shownOfSelection(doc);
  if (shown === null || shown.attachment === null) return false;
  return takeOutTarget(corpoDe(doc).file as never, doc.visibleSkins, shown.slot, shown.attachment) !== null;
}

/**
 * **Por que "Tirar a entidade" está cinza agora** — rodada 6, régua 3. O
 * Diretor achou na rodada 8a: com a espada ORIGINAL do herói escolhida (ela
 * nunca foi imagem), o item ficava cinza com a dica de sempre, *"com uma
 * entidade escolhida"* — e ela ESTAVA escolhida. A frase certa diz o que
 * falta. `null` quando o item pode agir.
 */
export function whyCannotTakeOutEntity(doc: EditorDoc): string | null {
  const shown = shownOfSelection(doc);
  if (shown === null) return 'Escolha uma entidade na cena primeiro (clique nela)';
  const { slot, attachment } = shown;
  const def = attachment === null ? undefined : (corpoDe(doc).file.skins ?? [])
    .map((skin) => skin.attachments?.[slot]?.[attachment] as { type?: string } | undefined)
    .find((d) => d !== undefined);
  if (attachment === null || def?.type !== 'skeleton') return `${slot} não mostra uma entidade: não há o que tirar`;
  if (takeOutTarget(corpoDe(doc).file as never, doc.visibleSkins, slot, attachment) === null) {
    return `Esta entidade não tem imagem de antes: ela entrou em ${slot} sem substituir imagem nenhuma`;
  }
  return null;
}

/**
 * **Tirar a entidade** — rodada 8a, decisão 6: a imagem de antes volta. O
 * gesto do botão direito na entidade e do menu. Sem imagem guardada (a
 * entidade entrou direto, arrastada da aba), ele diz o que fazer em vez de
 * ficar mudo (regra 21).
 */
export function takeOutEntity(doc: EditorDoc): boolean {
  const corpo = corpoDe(doc);
  const shown = shownOfSelection(doc);
  if (shown === null) {
    doc.notice('Escolha a entidade na cena (clique nela) para tirá-la');
    return false;
  }
  const { slot, attachment } = shown;
  const def = attachment === null ? undefined : (corpo.file.skins ?? [])
    .map((skin) => skin.attachments?.[slot]?.[attachment] as { type?: string } | undefined)
    .find((d) => d !== undefined);
  if (attachment === null || def?.type !== 'skeleton') {
    doc.notice(`${slot} não mostra uma entidade: não há o que tirar`);
    return false;
  }
  const alvo = takeOutTarget(corpo.file as never, doc.visibleSkins, slot, attachment);
  if (alvo === null) {
    doc.notice(`A entidade de ${slot} não substituiu imagem nenhuma: não há imagem de antes. `
      + 'Para pôr uma imagem no lugar, botão direito nela e escolha na grade');
    return false;
  }
  corpo.run(new TakeOutEntity(alvo.slot, alvo.attachment, alvo.skin));
  doc.notice(`${slot} volta a mostrar a imagem de antes, "${alvo.image}", como era${wentToBase(doc)}`);
  return true;
}

// ---------------------------------------------------------------------------
// O que não passa da imagem para a entidade — rodada 8a, achado 4
// ---------------------------------------------------------------------------

/**
 * O que apontava para o desenho **como malha**, e que a entidade não tem como
 * receber: a deformação dos vértices (chaves `deform`), as malhas ligadas que
 * tinham este desenho por pai, e os alvos de morph.
 *
 * O leitor avisava isso em inglês, um aviso por linha, depois da troca. Aqui o
 * editor conta ANTES, e o rodapé diz em português quantas e de quem.
 */
export interface EntityLosses {
  /** Chaves de deformação, somadas em todas as animações. */
  deformKeys: number;
  /** As animações que tinham deformação neste desenho. */
  deformAnimations: string[];
  /** Malhas ligadas (de qualquer pele) que tinham este desenho como pai. */
  linked: number;
  /** Alvos de morph que deformavam este desenho. */
  morphTargets: number;
}

export function entityLosses(
  file: {
    animations?: ReadonlyArray<{ name: string; timelines?: ReadonlyArray<Record<string, unknown>> }>;
    skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }>;
    morphs?: ReadonlyArray<{ targets?: ReadonlyArray<Record<string, unknown>> }>;
  },
  slot: string, attachment: string,
): EntityLosses {
  const out: EntityLosses = { deformKeys: 0, deformAnimations: [], linked: 0, morphTargets: 0 };
  for (const animation of file.animations ?? []) {
    let keys = 0;
    for (const t of animation.timelines ?? []) {
      if (t['type'] !== 'deform' || t['target'] !== slot || t['attachment'] !== attachment) continue;
      keys += Array.isArray(t['keys']) ? (t['keys'] as unknown[]).length : 0;
    }
    if (keys > 0) {
      out.deformKeys += keys;
      out.deformAnimations.push(animation.name);
    }
  }
  for (const skin of file.skins ?? []) {
    for (const def of Object.values(skin.attachments?.[slot] ?? {})) {
      const d = def as { type?: string; parent?: string } | undefined;
      if (d?.type === 'linkedmesh' && d.parent === attachment) out.linked += 1;
    }
  }
  for (const morph of file.morphs ?? []) {
    for (const t of morph.targets ?? []) {
      if (t['slot'] === slot && t['attachment'] === attachment) out.morphTargets += 1;
    }
  }
  return out;
}

/**
 * A frase do que não passou, ou `''` quando tudo passou.
 *
 * *"Não passam para a espada: 1 chave de deformação (animação idle), 1 malha
 * ligada e 1 alvo de morph — o rosto era malha, e a espada não tem malha.
 * Ficam guardadas no arquivo."*
 */
export function entityLossNotice(losses: EntityLosses, from: string, to: string): string {
  const partes: string[] = [];
  const plural = (n: number, um: string, varios: string): string => `${n} ${n === 1 ? um : varios}`;
  if (losses.deformKeys > 0) {
    partes.push(`${plural(losses.deformKeys, 'chave de deformação', 'chaves de deformação')} `
      + `(${losses.deformAnimations.length === 1 ? 'animação' : 'animações'} ${losses.deformAnimations.join(', ')})`);
  }
  if (losses.linked > 0) partes.push(plural(losses.linked, 'malha ligada', 'malhas ligadas'));
  if (losses.morphTargets > 0) partes.push(plural(losses.morphTargets, 'alvo de morph', 'alvos de morph'));
  if (partes.length === 0) return '';
  const lista = partes.length === 1 ? partes[0]! : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]!}`;
  return `Não passam para "${to}": ${lista}. "${from}" era malha, e a entidade não tem malha. `
    + 'Ficam no arquivo, sem efeito, e voltam a valer com a imagem';
}

/**
 * **Trocar a imagem em Animando, com Gravar ligado** — uma chave de Desenho.
 *
 * O caminho do campo Anexo: a troca vale **a partir deste tempo, nesta
 * animação**, e a Montagem não muda. O slot ganha um desenho com a imagem nova
 * (copiado do de agora, posto pelo pivô dela) — ou reaproveita o que já
 * mostra essa imagem —, e a animação ganha a chave. O desfazer devolve o slot
 * e a animação por texto.
 *
 * **A imagem de antes fica até o quadro da troca** — K15 (rodada final,
 * 29/09/2026). A chave única em `t` valia também para trás: o runtime segura a
 * primeira chave desde o começo, e o rosto já era o novo em 0 s, com o rodapé
 * dizendo "a partir de 0,50 s". O Spriter: a imagem *muda naquele momento*.
 * Então, na primeira troca do slot nesta animação, grava-se antes a imagem da
 * Montagem em 0 s (`keepStartKey`, o do lote 68) — no mesmo passo de desfazer.
 *
 * **A pele do lápis** — P27 (M2, I-O2). Com `into`, o desenho novo nasce
 * NAQUELA pele; o de origem só é lido. O desfazer devolve o mapa do slot da
 * pele do lápis como estava, ou o tira, se não havia.
 */
export class SwapImageAsKey implements Command {
  readonly label = 'Trocar a imagem nesta animação';
  readonly kind: ChangeKind = 'structure';
  /** O desenho para o qual a chave aponta. Vale depois do `apply`. */
  name = '';
  private saved: {
    slotMap: string | null; hadAttachments: boolean; index: number; animation: string;
  } | null = null;

  constructor(
    private readonly slot: string,
    private readonly attachment: string,
    private readonly skin: string,
    private readonly image: string,
    private readonly animation: string,
    private readonly time: number,
    /** A pele do lápis. Ausente = a mesma de `skin`. */
    private readonly into: string = skin,
  ) {}

  apply(doc: EditorDoc): void {
    const file = doc.file;
    const origem = (file.skins ?? []).find((s) => s.name === this.skin);
    const destino = (file.skins ?? []).find((s) => s.name === this.into) ?? origem;
    const deOrigem = origem?.attachments?.[this.slot] as Record<string, unknown> | undefined;
    const index = (file.animations ?? []).findIndex((a) => a.name === this.animation);
    if (destino === undefined || index < 0) return;
    const jaHavia = destino.attachments?.[this.slot] as Record<string, unknown> | undefined;
    if (jaHavia === undefined && deOrigem === undefined) return;
    this.saved = {
      slotMap: jaHavia === undefined ? null : JSON.stringify(jaHavia),
      hadAttachments: destino.attachments !== undefined,
      index,
      animation: JSON.stringify(file.animations![index]),
    };
    const attachments = destino.attachments ?? (destino.attachments = {});
    const porSlot = (attachments[this.slot] ?? (attachments[this.slot] = {})) as Record<string, unknown>;
    const reuse = Object.entries(porSlot).find(([name, def]) => imageOf(name, def) === this.image);
    if (reuse !== undefined) {
      this.name = reuse[0];
    } else {
      const base = porSlot[this.attachment] ?? deOrigem?.[this.attachment];
      const def = (base !== null && typeof base === 'object'
        ? JSON.parse(JSON.stringify(base))
        : { type: 'region' }) as Record<string, unknown>;
      const region = findAtlasRegion(doc.atlases ?? [], this.image);
      // H1 (P15a): o pivô da nova cai onde estava o da velha.
      const velha = outgoingRegion(doc.atlases ?? [], def, this.attachment);
      swapImage(def, this.image, region, region?.scale ?? 1, velha.region, velha.scale);
      const nomes = new Set([...Object.keys(porSlot), ...Object.keys(deOrigem ?? {})]);
      this.name = uniqueName(attachmentNameFor(this.image), nomes);
      porSlot[this.name] = def;
    }
    const target = { type: 'slot', target: this.slot, property: 'attachment' };
    // K15: antes da primeira troca, a imagem da Montagem fica gravada em 0 s.
    keepStartKey(file, this.animation, round(this.time), target as never);
    setKey(file, this.animation, round(this.time), target as never, this.name as never);
  }

  revert(doc: EditorDoc): void {
    const saved = this.saved;
    if (saved === null) return;
    const file = doc.file;
    const destino = (file.skins ?? []).find((s) => s.name === this.into)
      ?? (file.skins ?? []).find((s) => s.name === this.skin);
    if (destino !== undefined) {
      if (saved.slotMap === null) {
        delete destino.attachments?.[this.slot];
        if (!saved.hadAttachments) delete (destino as { attachments?: unknown }).attachments;
      } else if (destino.attachments !== undefined) {
        destino.attachments[this.slot] = JSON.parse(saved.slotMap);
      }
    }
    if (file.animations !== undefined) file.animations[saved.index] = JSON.parse(saved.animation);
    this.saved = null;
  }
}

/**
 * **As peças iguais** — rodada 9, lote 2 (as armas e as rodas). As peças do
 * boneco que mostram a MESMA entidade que a clicada, na mesma skin, a clicada
 * junto. Vazia quando a clicada não é entidade.
 */
export function sameEntityTargets(
  file: { skins?: ReadonlyArray<{ name: string; attachments?: Record<string, Record<string, unknown> | undefined> }> },
  target: PickerTarget,
): PickerTarget[] {
  const skin = (file.skins ?? []).find((s) => s.name === target.skin);
  const def = skin?.attachments?.[target.slot]?.[target.attachment] as { type?: string; uri?: string } | undefined;
  if (skin === undefined || def?.type !== 'skeleton' || typeof def.uri !== 'string' || def.uri === '') return [];
  const out: PickerTarget[] = [];
  for (const [slot, bag] of Object.entries(skin.attachments ?? {})) {
    for (const [attachment, d] of Object.entries(bag ?? {})) {
      const peca = d as { type?: string; uri?: string } | null;
      if (peca?.type === 'skeleton' && peca.uri === def.uri) out.push({ slot, attachment, skin: target.skin });
    }
  }
  return out;
}

/** Vários comandos num passo só de desfazer: aplica na ordem, desfaz ao contrário. */
export class Steps implements Command {
  readonly kind: ChangeKind = 'structure';
  constructor(readonly label: string, private readonly steps: readonly Command[]) {}
  apply(doc: EditorDoc): void {
    for (const step of this.steps) step.apply(doc);
  }
  revert(doc: EditorDoc): void {
    for (const step of [...this.steps].reverse()) step.revert(doc);
  }
}

/**
 * **Trocar todas as iguais** — rodada 9, lote 2. Cada peça troca pelo mesmo
 * comando da troca de uma (`SwapForEntity` ou `SwapForImage`): o lugar, a
 * ordem e as chaves de cada uma ficam onde estão. Um passo de desfazer.
 */
export function swapAllSame(targets: readonly PickerTarget[], to: { kind: 'entidade' | 'imagem'; name: string }): Command {
  return new Steps(`Trocar todas as iguais (${targets.length})`, targets.map((t) => (to.kind === 'entidade'
    ? new SwapForEntity(t.slot, t.attachment, t.skin, to.name)
    : new SwapForImage(t.slot, t.attachment, t.skin, to.name))));
}

/**
 * O que o rodapé diz ao ligar e desligar **Em todas as skins** — rodada 17,
 * M13 (05/10/2026). O botão é um interruptor: acendia e apagava, e o rodapé
 * ficava no que estava (*"Arquivo salvo."*), como se o clique não tivesse feito
 * nada. A dica explicava ao passar o mouse; o clique seguia mudo.
 */
export function everywhereNotice(on: boolean): string {
  return on
    ? 'Em todas as skins: ligado. A imagem que você clicar troca em toda skin que usa a mesma neste slot'
    : 'Em todas as skins: desligado. A imagem que você clicar troca só na skin do lápis';
}

/** O mesmo, para **Trocar todas as iguais** (rodada 9). */
export function allSameNotice(on: boolean, count: number): string {
  return on
    ? `Trocar todas as iguais: ligado. O que você clicar troca nas ${count} peças iguais, num passo só`
    : 'Trocar todas as iguais: desligado. O que você clicar troca só nesta peça';
}
