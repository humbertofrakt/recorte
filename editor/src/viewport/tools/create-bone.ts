/**
 * Tool "Criar osso" (owner B).
 *
 * Click puts the root of the new bone; dragging sets its length and its
 * direction; releasing creates it. The new bone becomes a child of the bone
 * the person chose by hand; with nothing chosen it is born loose, hanging from
 * the root — see `newBoneParent` (item 3.1, 13/09/2026).
 *
 * Position, angle and length are written in the PARENT's own axes, because
 * that is what the file stores. Dragging over a parent turned by 90 degrees
 * therefore produces the angle the person actually drew.
 */

import {
  emptySelection,
  registerTool,
  uniqueName,
  type ChangeKind,
  type Command,
  type EditorDoc,
  type Tool,
  type ToolEvent,
  corpoDe,
  wentToBase,
} from '../../contract.js';
// Degrau 9 (I5): o osso novo nasce na pele do lápis.
import { editingSkinOf } from '../onion.js';
import { bornInSkinNotice, runBornInSkin } from '../../panels/skins-model.js';
import {
  atan2Deg,
  inverseTransformPoint,
  transformPoint,
  type BoneDef,
  type Matrix2x3,
  type Skeleton,
} from '../../../../runtime/src/index.js';
import { HANDLE, fillHandle, strokeLine } from './select.js';
import { Reparent } from '../../doc/reparent.js';
import { firstChosenSlot, handPickedBones, newBoneNotice } from './creation-words.js';

/** Shorter than this on screen and the bone is created without a length. */
export const MIN_LENGTH_PIXELS = 6;

/**
 * O rodapé de um osso criado com uma animação aberta — lote 57; degrau 4a
 * (17/09/2026): "entra na Montagem" virou "foi para a base".
 */
export const NEW_BONE_IN_ANIMATION = 'Osso novo foi para a base e vale em todas as animações';

/** O sufixo do rodapé quando o gesto, feito com uma animação aberta, foi para a base. */
export const WENT_TO_BASE = ' (foi para a base)';
const PREVIEW_HANDLE = 9;

/** Frame a new child of `parentName` is placed in. */
function frameOf(skeleton: Skeleton, parentName: string | null): Matrix2x3 {
  const parent = parentName === null ? null : skeleton.findBone(parentName);
  if (parent !== null) {
    return {
      a: parent.a, b: parent.b, c: parent.c, d: parent.d,
      worldX: parent.worldX, worldY: parent.worldY,
    };
  }
  return {
    a: skeleton.scaleX, b: 0, c: 0, d: skeleton.scaleY,
    worldX: skeleton.x, worldY: skeleton.y,
  };
}

/*
 * **Achar o seu pelo NOME, nunca pelo objeto** — defeito 1 (19/09/2026).
 *
 * `revert` fazia `bones.indexOf(this.def)`: procurava a **mesma referência**.
 * Basta que outro comando reponha a lista com CÓPIAS — o `Duplicate` faz isso
 * (`doc/duplicate.ts`) — para a referência morrer, o `indexOf` devolver `-1` e
 * o osso **ficar no arquivo** com a pilha de desfazer vazia. Refazer empurra o
 * mesmo osso outra vez, e nasce um gêmeo de mesmo nome: o arquivo fica
 * inválido, e quem usa não tem como saber.
 *
 * O gesto que o achou: criar osso (`B`) → `Ctrl+D` → desfazer duas vezes.
 *
 * **E "achar por nome" sozinho NÃO BASTA** — achado pelo teste de par, no
 * mesmo lote. `this.def` é o próprio objeto que foi empurrado no arquivo, e o
 * `renameEverywhere` troca o nome **por dentro dele**. Renomear o osso e
 * desfazer duas vezes deixava o comando procurando "osso_x" num arquivo que já
 * tinha voltado a "osso".
 *
 * > **A forma, e ela vale para qualquer comando: guardei uma CHAVE que o
 * > próprio programa pode reescrever.** Não importa se a chave é uma
 * > referência de objeto ou um nome lido do objeto: importa se ela é
 * > **imutável desde que foi guardada**. Por isso o nome é copiado para um
 * > `string` no CONSTRUTOR e nunca mais lido do objeto vivo.
 *
 * Isto **substitui** a receita da varredura de 19/09 (*"trocar `indexOf`
 * por busca por nome"*), que conserta o par que o defeito mostrou e deixa o
 * par com renomear de pé.
 */

/** Tira do arquivo o osso que este comando criou, **pelo nome**. */
function removeBoneByName(doc: EditorDoc, name: string): void {
  const index = doc.file.bones.findIndex((bone) => bone.name === name);
  if (index >= 0) doc.file.bones.splice(index, 1);
}

/** Adds one bone to the file. Removing it again is the exact inverse. */
export class CreateBone implements Command {
  readonly label = 'Criar osso';
  readonly kind: ChangeKind = 'structure';
  /** O nome de quando o osso nasceu. O do objeto vivo pode ser reescrito. */
  private readonly boneName: string;

  constructor(readonly def: BoneDef) {
    this.boneName = def.name;
  }

  apply(doc: EditorDoc): void {
    doc.file.bones.push(this.def);
  }

  revert(doc: EditorDoc): void {
    removeBoneByName(doc, this.boneName);
  }
}

/** The bone entry a drag from one world point to another describes. */
export function describeBone(
  skeleton: Skeleton,
  parentName: string | null,
  taken: Iterable<string>,
  fromX: number, fromY: number,
  toX: number, toY: number,
  minLength: number,
  baseName = 'osso',
): BoneDef {
  const frame = frameOf(skeleton, parentName);
  const origin = inverseTransformPoint(frame, fromX, fromY);
  const tip = inverseTransformPoint(frame, toX, toY);
  const dx = tip.x - origin.x;
  const dy = tip.y - origin.y;
  const length = Math.hypot(dx, dy);
  const long = length > minLength;
  const def: BoneDef = {
    // Rodada 46, lote 4: pegando desenhos, o osso ganha o nome do primeiro (Spine).
    name: uniqueName(baseName, taken),
    x: round(origin.x),
    y: round(origin.y),
  };
  if (parentName !== null) def.parent = parentName;
  if (long) {
    def.length = round(length);
    def.rotation = round(atan2Deg(dy, dx));
  }
  return def;
}

/**
 * Cria o osso E prende o desenho escolhido nele, num passo só — item 66.
 *
 * O caminho de montagem mais comum é: trouxe a imagem, agora quer um osso para
 * ela. Eram três gestos — criar o osso, escolher o slot, trocar o campo "Osso"
 * — e agora é `Ctrl` + arrastar.
 *
 * Um passo de desfazer para os dois: um osso criado com o slot ainda apontando
 * para o osso velho é um estado que ninguém pediu, e sair dele exigiria um
 * segundo `Ctrl+Z` que a pessoa não sabe que precisa dar.
 */
export class CreateBoneForSlots implements Command {
  readonly label = 'Criar osso para o desenho';
  readonly kind: ChangeKind = 'structure';
  private readonly before: Array<{ slot: string; bone: string }> = [];
  /** O nome de quando o osso nasceu — ver `CreateBone`. */
  private readonly boneName: string;

  constructor(readonly def: BoneDef, private readonly slots: readonly string[]) {
    this.boneName = def.name;
  }

  apply(doc: EditorDoc): void {
    doc.file.bones.push(this.def);
    this.before.length = 0;
    for (const name of this.slots) {
      const slot = (doc.file.slots ?? []).find((s) => s.name === name);
      if (slot === undefined) continue;
      this.before.push({ slot: name, bone: slot.bone });
      slot.bone = this.def.name;
    }
  }

  revert(doc: EditorDoc): void {
    for (const item of this.before) {
      const slot = (doc.file.slots ?? []).find((s) => s.name === item.slot);
      if (slot !== undefined) slot.bone = item.bone;
    }
    removeBoneByName(doc, this.boneName);
  }
}

/**
 * **Primeiro a arte, depois os ossos** — acréscimo ao lote 60, plano pasta do
 * projeto.
 *
 * O Humberto, 10/09/2026: *"quero montar como no Spriter: a arte das peças
 * para dentro, e depois faço os ossos."* A imagem solta na cena fica livre, na
 * raiz; o osso vem depois e **pega** os desenhos escolhidos. Eles viram filhos
 * dele **sem sair do lugar**: é o `Reparent` do lote 34 (`L' = P'⁻¹ · W`), e
 * não o `CreateBoneForSlots` acima, que só troca o `slot.bone` e deixa o
 * desenho pular.
 *
 * Um passo de desfazer para os dois: o osso e os desenhos que ele pegou.
 */
export class CreateBoneAndGrab implements Command {
  readonly label = 'Criar osso e pegar os desenhos';
  readonly kind: ChangeKind = 'structure';
  /** Quantos desenhos o osso pegou na última aplicação. */
  grabbed = 0;
  /** Algum desenho entortou (escalas diferentes nos dois eixos, lote 34). */
  distorted = false;
  private reparent: Reparent | null = null;
  /** O nome de quando o osso nasceu — ver `CreateBone`. */
  private readonly boneName: string;

  constructor(readonly def: BoneDef, private readonly slots: readonly string[]) {
    this.boneName = def.name;
  }

  apply(doc: EditorDoc): void {
    doc.file.bones.push(this.def);
    // Depois do osso entrar: o `Reparent` mede o mundo com ele no arquivo.
    this.reparent = new Reparent(
      doc.file, { bones: [], slots: [...this.slots], attachments: [] }, this.def.name, this.label,
    );
    this.reparent.apply(doc);
    this.grabbed = this.reparent.slots.length;
    this.distorted = this.reparent.distorted;
  }

  revert(doc: EditorDoc): void {
    this.reparent?.revert(doc);
    removeBoneByName(doc, this.boneName);
  }
}

/** O rodapé depois de o osso novo pegar os desenhos. */
export function grabNotice(count: number, distorted: boolean): string {
  const quantos = count === 1 ? '1 desenho' : `${count} desenhos`;
  const entortou = distorted ? '. O desenho entortou um pouco: os dois ossos têm escalas diferentes' : '';
  return `Osso novo pegou ${quantos}, sem mover${entortou}`;
}

/**
 * O que o arrasto do Criar osso faz com os desenhos escolhidos. Puro.
 *
 * - `pegar`: há desenhos escolhidos — o osso pega os desenhos. Com a base ou
 *   com uma animação aberta: degrau 4a, nada mais recusa. Com a animação
 *   aberta, a troca de osso dos desenhos vai para a base, e o rodapé diz.
 * - `sozinho`: nenhum desenho escolhido, ou `Ctrl` (cria sem pegar).
 */
export function createBonePlan(slots: number, ctrl: boolean): 'pegar' | 'sozinho' {
  return slots === 0 || ctrl ? 'sozinho' : 'pegar';
}

/**
 * O pai do osso novo — item 3.1, 13/09/2026.
 *
 * O Humberto: *"quando crio objetos, as coisas ficam se enganchando; vira
 * parente de coisa que não estava selecionada. Não quero parentesco sem eu ter
 * selecionado antes."*
 *
 * Duas regras, e só:
 *
 * - **Um osso escolhido com a mão** é o pai. Osso atrás de osso continua
 *   fazendo cadeia — braço, antebraço, mão —, que é o gesto do Spriter e do
 *   Spine e que ele quer manter.
 * - **Qualquer outra coisa**: o osso nasce **solto**, pendurado na raiz. A raiz
 *   é o mundo (lote 60a): solto quer dizer no nível de cima da Árvore, sem
 *   ninguém puxando. O formato pede exatamente um osso sem pai (§4.2), então
 *   "solto" no arquivo é `parent = bones[0]` — não há um segundo lugar.
 *
 * **Clicar num desenho não escolhe osso.** Clicar numa imagem na cena põe o
 * osso dela na seleção junto com o slot e o anexo (`selectionFor`), e era daí
 * que vinha o enganchar: o osso novo entrava debaixo do osso do desenho que a
 * pessoa tinha clicado para outra coisa. Ele, em 13/09: *"por que uma imagem
 * escolhe um osso? o que um novo osso tem a ver com isso?"* Com anexo na
 * seleção, o osso que veio de carona não conta como escolhido — e os desenhos
 * continuam sendo **pegos** pelo osso novo, que é outro gesto (`CreateBoneAndGrab`).
 */
export function newBoneParent(
  selection: { bones: readonly string[]; slots?: readonly string[]; attachments?: ReadonlyArray<{ slot: string }> },
  file: { bones: ReadonlyArray<{ name: string }>; slots?: ReadonlyArray<{ name: string; bone: string }> },
): string | null {
  // Rodada 46, lote 5 (nota (a) do doc `80`): com desenhos na escolha, o osso
  // escolhido com a mão continua sendo o pai — só o osso de carona do desenho
  // clicado (o de mesmo nome, `clickKeepsBone`) não conta. Antes, qualquer
  // desenho na escolha mandava o osso novo para a raiz.
  const boneOfSlot = (slot: string): string | null => file.slots?.find((s) => s.name === slot)?.bone ?? null;
  const escolhido = (selection.attachments?.length ?? 0) > 0
    ? handPickedBones(selection, boneOfSlot)[0]
    : selection.bones[0];
  return escolhido ?? file.bones[0]?.name ?? null;
}

/**
 * Redesenha um osso que já existe — item 67, `Alt` + arrastar.
 *
 * Refaz posição, ângulo e comprimento a partir do arrasto. O osso estava torto
 * ou curto demais e agora está certo, **sem** apagar nada do que já foi
 * animado com ele: as chaves continuam onde estavam.
 *
 * Os FILHOS ficam no lugar do mundo: mexer no pai arrastaria a cadeia inteira,
 * e redesenhar um osso é justamente o gesto de quem já montou o resto. A conta
 * é a de `compensate.ts`, guardada aqui como uma lista de valores locais.
 */
export class RedrawBone implements Command {
  readonly label = 'Redesenhar osso';
  readonly kind: ChangeKind = 'structure';
  private before: Partial<BoneDef> = {};
  /** Cada filho, como ele fica e como ele estava. `was` é preenchido no apply. */
  private readonly children: Array<{
    name: string; pose: Partial<BoneDef>; was: Partial<BoneDef>;
  }>;

  constructor(
    private readonly name: string,
    private readonly next: Partial<BoneDef>,
    /** Como os filhos têm que ficar depois, no espaço do pai novo. */
    childPoses: ReadonlyArray<{ name: string; pose: Partial<BoneDef> }>,
  ) {
    this.children = childPoses.map((item) => ({
      name: item.name, pose: { ...item.pose }, was: {},
    }));
  }

  apply(doc: EditorDoc): void {
    const bone = doc.file.bones.find((b) => b.name === this.name);
    if (bone === undefined) return;
    this.before = {};
    for (const key of ['x', 'y', 'rotation', 'length'] as const) {
      this.before[key] = bone[key];
      const value = this.next[key];
      if (value === undefined) delete bone[key];
      else bone[key] = value;
    }
    for (const child of this.children) {
      const target = doc.file.bones.find((b) => b.name === child.name);
      if (target === undefined) continue;
      for (const key of ['x', 'y', 'rotation'] as const) {
        child.was[key] = target[key];
        const value = child.pose[key];
        if (value === undefined) delete target[key];
        else target[key] = value;
      }
    }
  }

  revert(doc: EditorDoc): void {
    const bone = doc.file.bones.find((b) => b.name === this.name);
    if (bone !== undefined) {
      for (const key of ['x', 'y', 'rotation', 'length'] as const) {
        const value = this.before[key];
        if (value === undefined) delete bone[key];
        else bone[key] = value;
      }
    }
    for (const child of this.children) {
      const target = doc.file.bones.find((b) => b.name === child.name);
      if (target === undefined) continue;
      for (const key of ['x', 'y', 'rotation'] as const) {
        const value = child.was[key];
        if (value === undefined) delete target[key];
        else target[key] = value;
      }
    }
  }
}

/**
 * O que `Alt` + arrastar escreve no osso e nos filhos dele — item 67.
 *
 * Puro: recebe o esqueleto posado e os dois pontos do arrasto, e devolve os
 * valores a gravar. Sem isto a conta viveria dentro do `onUp` da ferramenta, e
 * seria a única parte do editor que só dá para conferir com o mouse na mão.
 *
 * Os filhos ficam onde estão **no mundo**: a posição e o giro deles são
 * recalculados no espaço do pai novo.
 */
export function redrawPlan(
  skeleton: Skeleton,
  name: string,
  fromX: number, fromY: number,
  toX: number, toY: number,
  minLength: number,
): { next: Partial<BoneDef>; children: Array<{ name: string; pose: Partial<BoneDef> }> } | null {
  const bone = skeleton.findBone(name);
  if (bone === null) return null;
  const parentName = bone.parent?.data.name ?? null;
  const frame = frameOf(skeleton, parentName);
  const origin = inverseTransformPoint(frame, fromX, fromY);
  const tip = inverseTransformPoint(frame, toX, toY);
  const dx = tip.x - origin.x;
  const dy = tip.y - origin.y;
  const length = Math.hypot(dx, dy);
  const long = length > minLength;

  const next: Partial<BoneDef> = { x: round(origin.x), y: round(origin.y) };
  next.length = long ? round(length) : undefined;
  next.rotation = long ? round(atan2Deg(dy, dx)) : undefined;

  // O pai novo, como matriz, para pôr os filhos de volta no lugar do mundo.
  const angle = long ? atan2Deg(dy, dx) : 0;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const world = transformPoint(frame, origin.x, origin.y);
  const newFrame = {
    a: frame.a * cos + frame.b * sin,
    b: frame.b * cos - frame.a * sin,
    c: frame.c * cos + frame.d * sin,
    d: frame.d * cos - frame.c * sin,
    worldX: world.x,
    worldY: world.y,
  };

  const children: Array<{ name: string; pose: Partial<BoneDef> }> = [];
  for (const child of skeleton.bones) {
    if (child.parent?.data.name !== name) continue;
    const local = inverseTransformPoint(newFrame, child.worldX, child.worldY);
    // O giro do filho no mundo menos o giro do pai novo: é o que o arquivo
    // guarda, e é o que faz o filho não virar junto com o pai.
    const worldAngle = atan2Deg(child.c, child.a);
    const parentAngle = atan2Deg(newFrame.c, newFrame.a);
    children.push({
      name: child.data.name,
      pose: {
        x: round(local.x),
        y: round(local.y),
        rotation: round(worldAngle - parentAngle),
      },
    });
  }
  return { next, children };
}

/** Three decimals is finer than any screen and keeps the file readable. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

interface Drag {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

/** Os slots que a seleção alcança: os escolhidos, mais o de cada desenho. */
export function slotsOfSelection(doc: EditorDoc): string[] {
  const names = new Set(doc.selection.slots);
  for (const item of doc.selection.attachments) names.add(item.slot);
  return (corpoDe(doc).file.slots ?? []).map((s) => s.name).filter((name) => names.has(name));
}

class CreateBoneTool implements Tool {
  readonly id = 'create-bone';
  readonly label = 'Criar osso';
  // G1 (degrau 7, 17/09/2026): a tecla passou de `N` para **`B`**, de *bone*,
  // como no Spriter. O Posar foi para `Y`; o `N` fica livre. `ui/keys.ts` tem
  // a mesma troca, e o teste `teclas` confere que as duas dizem o mesmo.
  readonly shortcut = 'b';
  // Sem `modes`: vale nos dois modos desde o lote 57 (plano pivô). Em
  // Animando o osso é medido contra a pose ANIMADA do pai, que é a que a cena
  // mostra, e nasce onde foi desenhado; a Montagem recebe o mesmo valor local.

  private drag: Drag | null = null;

  onExit(): void {
    this.drag = null;
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    if (doc.skeleton === null) return;
    this.drag = { fromX: e.x, fromY: e.y, toX: e.x, toY: e.y };
  }

  onMove(_doc: EditorDoc, e: ToolEvent): void {
    if (this.drag === null) return;
    this.drag.toX = e.x;
    this.drag.toY = e.y;
  }

  onUp(doc: EditorDoc, e: ToolEvent): void {
    const drag = this.drag;
    this.drag = null;
    const skeleton = doc.skeleton;
    if (drag === null || skeleton === null) return;
    const minLength = MIN_LENGTH_PIXELS / (e.scale > 1e-9 ? e.scale : 1e-9);

    // Alt: REDESENHA o osso escolhido — item 67. Os filhos ficam no lugar.
    const chosen = doc.selection.bones[0];
    // Degrau 4a: nenhum gesto recusa mais mandando voltar à Montagem. Com uma animação
    // aberta, redesenhar e pegar os desenhos vão para a base — medidos contra a
    // pose que a cena mostra, como o osso novo —, e o rodapé diz isso. O
    // destino certo por corpo vem no D7.
    // Degrau 4b: com a virada, o osso vai para a base do corpo do instante, e o rodapé diz qual.
    const sufixo = wentToBase(doc);
    if (e.alt && chosen !== undefined) {
      const plan = redrawPlan(
        skeleton, chosen, drag.fromX, drag.fromY, e.x, e.y, minLength,
      );
      if (plan === null) return;
      corpoDe(doc).run(new RedrawBone(chosen, plan.next, plan.children));
      doc.notice(`Osso ${chosen} redesenhado${sufixo}. Os filhos ficaram no lugar`);
      return;
    }

    // Acréscimo ao lote 60: com desenhos escolhidos, o osso novo os PEGA, sem
    // movê-los. Era o `Ctrl` do item 66 (que deixava o desenho pular); agora é
    // o gesto de sempre, e o `Ctrl` virou "cria sem pegar".
    const slots = slotsOfSelection(doc);
    const plano = createBonePlan(slots.length, e.ctrl);
    const raiz = corpoDe(doc).file.bones[0]?.name ?? null;
    const def = describeBone(
      skeleton, newBoneParent(doc.selection, corpoDe(doc).file), corpoDe(doc).file.bones.map((bone) => bone.name),
      drag.fromX, drag.fromY, e.x, e.y, minLength,
      plano === 'pegar' ? (firstChosenSlot(doc.selection) ?? slots[0] ?? 'osso') : 'osso',
    );
    // Rodada 46, lote 4 (doc `66`, §2.5): o rodapé diz onde o osso nasceu.
    const onde = newBoneNotice(def.name, def.parent, raiz);
    // Degrau 9 (I5): com o lápis aceso numa pele, o osso nasce DENTRO dela —
    // `skinRequired` e listado nela, num passo de desfazer só. Vale para os
    // dois caminhos, o que pega desenhos e o que não pega.
    const lapis = editingSkinOf(doc);
    if (plano === 'pegar') {
      const command = new CreateBoneAndGrab(def, slots);
      const skin = runBornInSkin(corpoDe(doc), command, 'bones', def.name, lapis);
      doc.select({ ...emptySelection(), bones: [def.name] });
      doc.notice(skin === null
        ? `${grabNotice(command.grabbed, command.distorted)}. ${onde}${sufixo}`
        : bornInSkinNotice(`O osso "${def.name}"`, skin));
      return;
    }
    const skin = runBornInSkin(corpoDe(doc), new CreateBone(def), 'bones', def.name, lapis);
    doc.select({ ...emptySelection(), bones: [def.name] });
    if (skin !== null) doc.notice(bornInSkinNotice(`O osso "${def.name}"`, skin));
    else if (sufixo !== '') doc.notice(`${NEW_BONE_IN_ANIMATION}${corpoDe(doc) === doc ? '' : sufixo}`);
    else doc.notice(onde);
  }

  onKey(_doc: EditorDoc, key: string): boolean {
    if (key !== 'Escape' || this.drag === null) return false;
    this.drag = null;
    return true;
  }

  drawOverlay(_doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const drag = this.drag;
    if (drag === null) return;
    strokeLine(ctx, scale, HANDLE.free, 3, drag.fromX, drag.fromY, drag.toX, drag.toY);
    fillHandle(ctx, scale, HANDLE.free, PREVIEW_HANDLE, drag.fromX, drag.fromY);
    fillHandle(ctx, scale, HANDLE.guide, PREVIEW_HANDLE, drag.toX, drag.toY);
  }
}

export const createBoneTool: Tool = new CreateBoneTool();
registerTool(createBoneTool);
