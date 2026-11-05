/**
 * Model behind the "Animações" panel.
 *
 * Pure helpers: the list of animations, how long each one lasts, how the
 * playhead maps to the progress bar, and the commands that create, copy and
 * delete an animation. Playback itself (playing, speed) is transient state and
 * lives in the panel, not in the document — the contract says so.
 */

import type { AnimationDef, BoneDef, BoneFile, SkinDef, SlotDef } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { EDITOR_EXTENSION, corpoDe, skeletonsDe, uniqueName } from '../contract.js';
// Rodada 8b, C9: as entidades encaixadas entram na lista como bases.
import { entityShortName, entitySlots } from '../anim/entity-band.js';
// Degrau 5: a lista Corpos vem do projeto (`doc/projeto.ts`, degrau 1).
import { bodyLabel, projetoDe } from '../doc/projeto.js';
import { evalNumberExpression } from './properties-model.js';
// `animationDuration`, `findAnimation` e `clampTime` moram em `anim/animations.ts` desde o lote A4.
import { animationDuration, findAnimation } from '../anim/animations.js';
// Degrau 12, parte `B`, lote 2: as animações de fora (2.8 `assets.animations`).
import { importedAnimationUris, knownAnimationNames } from '../io/export-animation.js';
export { animationDuration, clampTime, findAnimation } from '../anim/animations.js';

export interface AnimationRow {
  name: string;
  index: number;
  /** Seconds. */
  duration: number;
  loop: boolean;
  /** How many timelines it has, shown as secondary text. */
  timelines: number;
}

/** Every animation of the file, in file order. */
export function listAnimations(file: BoneFile): AnimationRow[] {
  return (file.animations ?? []).map((animation, index) => ({
    name: animation.name,
    index,
    duration: animationDuration(animation),
    loop: animation.loop ?? false,
    timelines: (animation.timelines ?? []).length,
  }));
}

/**
 * **As animações de fora** — degrau 12, parte `B`, lote 2 (18/09/2026).
 *
 * Uma linha por arquivo citado em `assets.animations` (2.8). Elas não estão em
 * `file.animations`: quem as copia para cá é o LEITOR, ao carregar, e o editor
 * não resolve caminho de disco. Então a lista mostra o que ele sabe, e **diz o
 * que não sabe** (regra 21), em vez de mostrar uma lista vazia que faria a
 * pessoa achar que a importação não funcionou.
 */
export interface ExternalAnimationRow {
  /** O uri, como está em `assets.animations`. */
  uri: string;
  /**
   * As animações que o arquivo traz, ou `null` quando o editor ainda não o
   * abriu nesta sessão — e aí a linha diz isso, por extenso.
   */
  names: string[] | null;
}

/** Os arquivos de animação de fora que este corpo cita, na ordem do arquivo. */
export function listExternalAnimations(file: BoneFile): ExternalAnimationRow[] {
  return importedAnimationUris(file).map((uri) => ({ uri, names: knownAnimationNames(uri) }));
}

/** A dica de uma linha de fora: o que ela traz, ou por que ainda não se sabe. */
export function externalHint(row: ExternalAnimationRow): string {
  if (row.names === null) {
    return `${row.uri}: o jogo carrega as animações deste arquivo pelo nome (assets.animations). `
      + 'O editor ainda não o abriu nesta sessão, e por isso não sabe dizer quais são — '
      + 'use Arquivo → Importar → Animações, de outra base… para trazê-lo de novo e ver os nomes';
  }
  if (row.names.length === 0) return `${row.uri}: este arquivo não traz animação nenhuma`;
  return `${row.uri}: ${row.names.length === 1 ? 'traz' : 'traz as'} `
    + `${row.names.length === 1 ? '1 animação' : `${row.names.length} animações`} `
    + `${row.names.join(', ')}. Elas entram nesta base pelo nome, ao carregar (2.8)`;
}

/** O que a linha mostra à direita: quantas animações, ou uma interrogação. */
export function externalCount(row: ExternalAnimationRow): string {
  return row.names === null ? '?' : String(row.names.length);
}

/** Shows a time the way a Portuguese reader expects: `1,25 s`. */
export function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? seconds : 0;
  return `${safe.toFixed(2).replace('.', ',')} s`;
}

/** Reads a time the user typed. Accepts a comma and simple arithmetic. */
export function parseTime(text: string): number | null {
  const value = evalNumberExpression(text.replace(/\s*s\s*$/i, ''));
  if (value === null) return null;
  return value < 0 ? 0 : value;
}

/** Position of the playhead on the bar, from 0 to 1. */
export function progressOf(time: number, duration: number): number {
  if (duration <= 0) return 0;
  return Math.max(0, Math.min(1, time / duration));
}

/** Time under a point of the bar, from a fraction of its width. */
export function timeAt(fraction: number, duration: number): number {
  if (duration <= 0) return 0;
  return Math.max(0, Math.min(1, fraction)) * duration;
}

/** Speeds the panel offers, as multipliers of real time. */
export const SPEED_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 0.25, label: '1/4 da velocidade' },
  { value: 0.5, label: 'metade da velocidade' },
  { value: 1, label: 'velocidade normal' },
  { value: 2, label: 'dobro da velocidade' },
];

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/** Adds an empty animation. */
export class AddAnimation implements Command {
  readonly label = 'Nova animação';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile) {
    this.name = uniqueName('animação', (file.animations ?? []).map((a) => a.name));
  }

  apply(doc: EditorDoc): void {
    const animations = doc.file.animations ?? (doc.file.animations = []);
    // Nasce EM LAÇO — decisão P18, K6. No Spriter a animação nasce em laço
    // (SCML Reference: `loopType=LOOPING`), e num ciclo de andar o primeiro
    // erro era tocar e ver parar no fim, sem aviso. `loop` já é campo do
    // formato (schema, `animation.loop`): nenhum campo novo.
    animations.push({ name: this.name, duration: 1, loop: true, timelines: [] });
  }

  revert(doc: EditorDoc): void {
    const animations = doc.file.animations ?? [];
    const at = animations.findIndex((a) => a.name === this.name);
    if (at >= 0) animations.splice(at, 1);
  }
}

/** Copies an animation, timelines and all. */
export class DuplicateAnimation implements Command {
  readonly label = 'Duplicar animação';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;

  constructor(file: BoneFile, private readonly source: string) {
    this.name = uniqueName(`${source} cópia`, (file.animations ?? []).map((a) => a.name));
  }

  apply(doc: EditorDoc): void {
    const animations = doc.file.animations ?? (doc.file.animations = []);
    const source = animations.find((a) => a.name === this.source);
    if (!source) return;
    const copy = JSON.parse(JSON.stringify(source)) as AnimationDef;
    copy.name = this.name;
    animations.push(copy);
  }

  revert(doc: EditorDoc): void {
    const animations = doc.file.animations ?? [];
    const at = animations.findIndex((a) => a.name === this.name);
    if (at >= 0) animations.splice(at, 1);
  }
}

/**
 * Liga e desliga o Repetir da animação — o campo `loop` da §4.6.
 *
 * O campo já existia no formato e no runtime desde sempre; o editor é que
 * nunca o gravava, e o botão "Laço" do painel Animações era uma caixinha de
 * sessão que morria ao fechar a aba. Agora ele vai para o arquivo: quem abre a
 * animação amanhã encontra o laço que quem animou escolheu, e o jogo também.
 *
 * `revert` devolve o valor de ANTES, inclusive a ausência. Uma animação que não
 * dizia nada sobre `loop` não pode voltar dizendo `false`: seriam dois arquivos
 * diferentes, e desfazer tem que devolver o arquivo, não algo parecido com ele.
 */
export class SetAnimationLoop implements Command {
  readonly label: string;
  readonly kind: ChangeKind = 'transform';
  readonly animationOnly: string;
  private before: boolean | undefined;
  private had = false;

  constructor(private readonly name: string, private readonly on: boolean) {
    this.label = on ? 'Ligar repetir' : 'Desligar repetir';
    this.animationOnly = name;
  }

  apply(doc: EditorDoc): void {
    const animation = findAnimation(doc.file, this.name);
    if (animation === null) return;
    this.had = Object.prototype.hasOwnProperty.call(animation, 'loop');
    this.before = animation.loop;
    animation.loop = this.on;
  }

  revert(doc: EditorDoc): void {
    const animation = findAnimation(doc.file, this.name);
    if (animation === null) return;
    if (this.had) animation.loop = this.before;
    else delete animation.loop;
  }
}

/**
 * O tempo de mistura comum a todas as animações — lote 46. `null` quando
 * diferem ("vários"). Animação sem o campo conta zero, como o runtime faz.
 */
export function commonDefaultMix(file: BoneFile): number | null {
  const values = (file.animations ?? []).map((a) => (typeof a.defaultMix === 'number' ? a.defaultMix : 0));
  if (values.length === 0) return 0;
  return values.every((v) => v === values[0]) ? values[0]! : null;
}

/** O que o campo "Tempo de mistura" mostra: o número, com vírgula, ou "vários". */
export function formatMix(file: BoneFile): string {
  const value = commonDefaultMix(file);
  return value === null ? 'vários' : String(value).replace('.', ',');
}

/**
 * O que gravar depois da janela, ou `null` para não gravar nada: o campo não
 * mudou, o número é o mesmo, ou não é um número de zero para cima.
 */
export function parseMixAnswer(file: BoneFile, typed: string): number | null {
  const text = typed.trim();
  if (text === formatMix(file)) return null;
  const value = Number(text.replace(',', '.'));
  if (text === '' || !Number.isFinite(value) || value < 0) return null;
  const common = commonDefaultMix(file);
  if (common !== null && value === common) return null;
  return value;
}

/**
 * "Tempo de mistura" — lote 46. Grava `defaultMix` (§4.6, campo que já existia)
 * em **todas** as animações, num passo de desfazer só. `revert` devolve cada
 * uma ao que tinha, inclusive a ausência do campo.
 */
export class SetDefaultMixAll implements Command {
  readonly label = 'Tempo de mistura';
  readonly kind: ChangeKind = 'structure';
  private before: Array<{ had: boolean; value: number }> = [];

  constructor(private readonly seconds: number) {}

  apply(doc: EditorDoc): void {
    const animations = doc.file.animations ?? [];
    this.before = animations.map((a) => ({
      had: Object.prototype.hasOwnProperty.call(a, 'defaultMix'),
      value: a.defaultMix ?? 0,
    }));
    for (const animation of animations) animation.defaultMix = this.seconds;
  }

  revert(doc: EditorDoc): void {
    const animations = doc.file.animations ?? [];
    animations.forEach((animation, i) => {
      const before = this.before[i];
      if (before === undefined) return;
      if (before.had) animation.defaultMix = before.value;
      else delete animation.defaultMix;
    });
  }
}

/**
 * A animação padrão: a **primeira** de `animations` (§4.6, F4). `null` sem
 * nenhuma. Não há campo no formato: quem quer outra padrão reordena.
 */
export function defaultAnimation(file: BoneFile): string | null {
  return file.animations?.[0]?.name ?? null;
}

/**
 * "Mandar para o topo" — lote 44. Leva a animação para o primeiro lugar da
 * lista, que é a que o jogo abre; as outras ficam na ordem em que estavam.
 *
 * `revert` devolve ao lugar exato de antes, e o arquivo volta igual, texto
 * contra texto. Já sendo a primeira, ou não existindo, não faz nada — nem na
 * ida, nem na volta.
 */
export class MoveAnimationToTop implements Command {
  readonly label = 'Mandar para o topo';
  readonly kind: ChangeKind = 'structure';
  private from = -1;

  constructor(private readonly name: string) {}

  apply(doc: EditorDoc): void {
    const animations = doc.file.animations ?? [];
    this.from = animations.findIndex((a) => a.name === this.name);
    if (this.from <= 0) return;
    const [moved] = animations.splice(this.from, 1);
    animations.unshift(moved!);
  }

  revert(doc: EditorDoc): void {
    if (this.from <= 0) return;
    const animations = doc.file.animations ?? [];
    if (animations[0]?.name !== this.name) return;
    const [moved] = animations.splice(0, 1);
    animations.splice(this.from, 0, moved!);
  }
}

/** Removes an animation. Undo puts it back where it was. */
export class DeleteAnimation implements Command {
  readonly label = 'Apagar animação';
  readonly kind: ChangeKind = 'structure';
  private removed: AnimationDef | null = null;
  private at = -1;

  constructor(private readonly name: string) {}

  apply(doc: EditorDoc): void {
    const animations = doc.file.animations ?? [];
    this.at = animations.findIndex((a) => a.name === this.name);
    if (this.at < 0) return;
    this.removed = animations.splice(this.at, 1)[0] ?? null;
  }

  revert(doc: EditorDoc): void {
    if (this.removed === null || this.at < 0) return;
    const animations = doc.file.animations ?? (doc.file.animations = []);
    animations.splice(this.at, 0, this.removed);
  }
}

// ---------------------------------------------------------------------------
// A janela Animação: a lista Corpos, e a base nova — degrau 5 (17/09/2026)
// ---------------------------------------------------------------------------

/**
 * Uma linha da lista **Corpos** — M8: *"cada corpo tem as suas animações;
 * Corpos em cima, Animações embaixo, e trocar o corpo troca a lista"*.
 */
export interface BodyRow {
  /** O uri do corpo — o valor que uma chave `body` escreve (9.13). */
  uri: string;
  /** O nome que se lê: o `skeleton.name`, ou o arquivo sem a pasta. */
  name: string;
  /** Quantas animações aquele corpo tem. A base não conta: ela não é uma delas. */
  animations: number;
  /** `true` para o corpo em foco — o que a cena está mostrando. */
  focused: boolean;
}

/**
 * Os corpos do projeto, na ordem do manifesto.
 *
 * Um documento **sem projeto** (um teste, ou o editor antes de abrir uma pasta)
 * é um corpo só: ele mesmo. A lista nunca vem vazia — a janela sempre tem o que
 * mostrar, e M8 vale para um corpo como vale para três.
 */
export function listBodies(doc: EditorDoc): BodyRow[] {
  const projeto = projetoDe(doc);
  if (projeto === null) {
    return [{
      uri: docUri(doc),
      name: bodyLabel(docUri(doc), null) === '' ? 'corpo' : nameOfDoc(doc),
      animations: (doc.file.animations ?? []).length,
      focused: true,
    }];
  }
  const foco = projeto.emFocoUri;
  return [...projeto.corpos.entries()].map(([uri, body]) => ({
    uri,
    name: bodyLabel(uri, body),
    animations: (body.file.animations ?? []).length,
    focused: uri === foco,
  }));
}

/** Uma animação de uma entidade, lida do arquivo dela. */
export interface EntityAnimationRow {
  name: string;
  duration: number;
  loop: boolean;
}

/**
 * **A entidade na lista, como uma base** — rodada 8b, C9.
 *
 * O Humberto: *"adicionar uma entidade na animação faz ela fazer parte do
 * projeto como uma base."* Nos desenhos dele a lista é *piloto-base: andar,
 * pular, atacar, pilotar · motosserra-base: parado, ativo*. Cada entidade
 * encaixada na base em foco ganha uma linha de base, com as animações dela
 * embaixo. É o painel Repositório do DragonBones (*Skeleton — basicConcept*:
 * o esqueleto filho aparece na lista do projeto).
 */
export interface EntityBaseRow {
  /** O uri do arquivo da entidade, como o anexo `skeleton` escreve (7.11). */
  uri: string;
  /** O nome curto: `armas/espada.bone` vira `espada`. */
  name: string;
  /** Os slots da base em foco em que ela está encaixada. */
  slots: string[];
  /** As animações dela, ou `null` quando o editor não abriu o arquivo (regra 21). */
  animations: EntityAnimationRow[] | null;
}

/**
 * As entidades encaixadas na base em foco, uma linha por arquivo, na ordem dos
 * slots. A mesma espada em dois slots é uma linha só: é o mesmo arquivo, com
 * as mesmas animações. Todas as skins contam: a espada que só aparece na skin
 * `inverno` continua fazendo parte do projeto.
 */
export function listEntityBases(doc: EditorDoc): EntityBaseRow[] {
  const out = new Map<string, EntityBaseRow>();
  const filhos = skeletonsDe(doc);
  for (const entity of entitySlots(corpoDe(doc).file)) {
    if (entity.uri === '') continue;
    const row = out.get(entity.uri);
    if (row !== undefined) {
      if (!row.slots.includes(entity.slot)) row.slots.push(entity.slot);
      continue;
    }
    const data = filhos.get(entity.uri) ?? null;
    out.set(entity.uri, {
      uri: entity.uri,
      name: entityShortName(entity.uri),
      slots: [entity.slot],
      animations: data === null ? null
        : data.animations.map((a) => ({ name: a.name, duration: a.duration, loop: a.loop })),
    });
  }
  return [...out.values()];
}

/**
 * **A base de onde a entidade aberta saiu** — rodada 8b, C10. Enquanto se anima
 * a espada por dentro, a lista mostra o herói e as animações dele: clicar numa
 * delas é voltar. `null` fora da cena montada.
 */
export function hostOfEntityView(doc: EditorDoc): EntityBaseRow | null {
  const projeto = projetoDe(doc);
  const cena = projeto?.cenaMontada ?? null;
  if (projeto === null || cena === null || projeto.emFocoUri !== cena.entity) return null;
  const host = projeto.docOf(cena.host);
  if (host === null) return null;
  return {
    uri: cena.host,
    name: projeto.nameOf(cena.host),
    slots: [cena.slot],
    animations: listAnimations(host.file).map((row) => ({ name: row.name, duration: row.duration, loop: row.loop })),
  };
}

/** A dica da linha de uma entidade na lista. */
export function entityBaseHint(row: EntityBaseRow): string {
  const onde = row.slots.length === 1 ? `no slot ${row.slots[0]}` : `nos slots ${row.slots.join(', ')}`;
  if (row.animations === null) {
    return `${row.name}: entidade encaixada ${onde}. O editor não abriu ${row.uri}, `
      + 'então não sabe que animações ela tem. Abra a pasta do projeto para a lista aparecer';
  }
  const quantas = row.animations.length === 0 ? 'sem animação'
    : row.animations.length === 1 ? '1 animação' : `${row.animations.length} animações`;
  return `${row.name}: entidade encaixada ${onde}, ${quantas}. Ela entra pronta: `
    + 'a faixa da linha do tempo escolhe qual animação toca';
}

/** As entidades listadas no projeto, pelo uri, na ordem em que entraram. */
export function listEntityUris(doc: EditorDoc): string[] {
  const projeto = projetoDe(doc);
  return projeto === null ? [] : [...projeto.entidades];
}

/** O uri que um documento sem projeto tem: o caminho, ou o nome do esqueleto. */
function docUri(doc: EditorDoc): string {
  const path = (doc as { path?: string | null }).path ?? null;
  if (typeof path === 'string' && path.length > 0) return path;
  const name = doc.file.skeleton?.name;
  return typeof name === 'string' && name.length > 0 ? `${name}.bone` : 'sem nome';
}

function nameOfDoc(doc: EditorDoc): string {
  const name = doc.file.skeleton?.name;
  if (typeof name === 'string' && name.length > 0) return name;
  return docUri(doc).split(/[\/]/).pop() ?? 'corpo';
}

/** O arquivo que um corpo novo ganha na pasta: `lobisomem` vira `lobisomem.bone`. */
export function bodyUriFor(name: string, taken: Iterable<string>): string {
  const limpo = name.trim().replace(/[\/:*?"<>|]/g, '').replace(/\.bone$/i, '');
  const base = limpo === '' ? 'corpo' : limpo;
  const usados = new Set(taken);
  if (!usados.has(`${base}.bone`)) return `${base}.bone`;
  for (let i = 2; ; i++) {
    if (!usados.has(`${base}${i}.bone`)) return `${base}${i}.bone`;
  }
}

/** Os valores que um osso tem quando o arquivo não diz nada (§5.1). */
const BONE_DEFAULTS: ReadonlyArray<readonly [keyof BoneDef, number]> = [
  ['x', 0], ['y', 0], ['rotation', 0], ['scaleX', 1], ['scaleY', 1], ['shearX', 0], ['shearY', 0],
];

/** Arredonda como o resto do editor, para o arquivo não encher de casas. */
function round(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}

/**
 * **Salvar como base nova** — M9, tarefa 5.2.
 *
 * Devolve o `.bone` de um **corpo novo**: uma cópia do corpo do instante com a
 * pose de `doc.time` gravada como **base** (a setup pose de §5.1). O que é
 * assado:
 *
 *   - **ossos**: `x, y, rotation, scaleX, scaleY, shearX, shearY` do osso posado.
 *     Valor igual ao de fábrica sai do arquivo, em vez de entrar escrito: um
 *     `.bone` não fica mais verdadeiro por repetir `"scaleX": 1` em cada osso;
 *   - **slots**: o `attachment` que está à vista naquele instante, e a cor;
 *   - **deform**: os desenhos deformados entram com os números somados em
 *     `vertices` (malha solta) ou em `binding.positions` (malha com pesos) —
 *     as duas listas casam índice a índice com o `deform` (§7.4). A chave
 *     `deform` não vem junto: ela virou forma.
 *
 * **A animação de origem não muda.** Este arquivo é novo, e o corpo de onde ele
 * saiu não é tocado — quem chama nem lhe passa um comando.
 *
 * As animações vêm na cópia, como todo o resto: o pedido é *"cópia do corpo"*,
 * e apagá-las aqui seria decidir por quem clicou. Elas passam a herdar a base
 * nova (M3), e o rodapé diz quantas vieram.
 */
export function bakeBaseAt(doc: EditorDoc, name: string): BoneFile {
  const corpo = corpoDe(doc);
  const file = JSON.parse(JSON.stringify(corpo.file)) as BoneFile;
  const skeleton = doc.skeleton;
  file.skeleton = { ...(file.skeleton ?? {}), name } as BoneFile['skeleton'];
  // O arranjo de tela, a câmera e a seleção são de quem estava editando o outro
  // corpo. O corpo novo abre limpo.
  const ext = (file as { extensions?: Record<string, unknown> }).extensions;
  if (ext !== undefined) delete ext[EDITOR_EXTENSION];

  if (skeleton === null) return file;

  for (const bone of (file.bones ?? []) as BoneDef[]) {
    const live = skeleton.findBone(bone.name);
    if (live === null) continue;
    for (const [campo, padrao] of BONE_DEFAULTS) {
      const valor = round(live[campo as 'x'] as number);
      if (valor === padrao) delete bone[campo as 'x'];
      else (bone as unknown as Record<string, number>)[campo as string] = valor;
    }
  }

  for (const slot of (file.slots ?? []) as SlotDef[]) {
    const live = skeleton.findSlot(slot.name);
    if (live === null) continue;
    if (live.attachmentName === null || live.attachmentName === '') delete slot.attachment;
    else slot.attachment = live.attachmentName;
    const cor = [...live.color].map(round);
    if (cor.some((canal, i) => canal !== 1)) slot.color = cor as SlotDef['color'];
    else delete slot.color;
    bakeDeform(file, live);
  }
  return file;
}

/** Soma o `deform` do slot na forma do desenho, no arquivo copiado (§7.4). */
function bakeDeform(file: BoneFile, live: { deform: Float64Array | null; deformAttachment: { name: string } | null }): void {
  const deform = live.deform;
  const alvo = live.deformAttachment;
  if (deform === null || alvo === null) return;
  for (const skin of (file.skins ?? []) as SkinDef[]) {
    for (const porSlot of Object.values(skin.attachments ?? {})) {
      const def = (porSlot ?? {})[alvo.name] as unknown;
      if (def === null || def === undefined || typeof def !== 'object') continue;
      const anexo = def as { vertices?: number[]; binding?: { positions?: number[] } };
      const lista = anexo.binding?.positions ?? anexo.vertices;
      if (!Array.isArray(lista) || lista.length !== deform.length) continue;
      for (let i = 0; i < lista.length; i++) lista[i] = round(lista[i]! + deform[i]!);
    }
  }
}

/** O rodapé do Salvar como base nova. Diz o instante e o que veio junto. */
export function newBaseNotice(name: string, time: number, animations: number): string {
  const quando = `${Math.max(0, time).toFixed(2).replace('.', ',')} s`;
  const trazidas = animations === 0
    ? 'sem animação nenhuma'
    : animations === 1 ? 'com 1 animação copiada' : `com ${animations} animações copiadas`;
  return `Base nova "${name}" criada com a pose de ${quando}, ${trazidas}. `
    + 'Ela entrou em Bases; a animação de origem não mudou';
}

// ---------------------------------------------------------------------------
// A fila do arroz — chat G, lote 3 (29/09/2026)
// ---------------------------------------------------------------------------

/**
 * **Quando o campo de nome abre** — Q1/K1, e o passo 14 do roteiro.
 *
 * A animação criada pela **Nova animação** nasce à vista com o campo de nome
 * aberto. O pedido vem de quem criou (`asked`, de `takeNameRequest`), e não de
 * olhar a lista: a primeira versão deste lote tomava *"a lista ganhou um
 * nome"* por *"alguém criou"*, e reabrir a pasta — a lista ia de `[]` a
 * `['animação']`, com ela aberta — abria o campo no lugar da linha. O roteiro
 * caiu no passo 14 com ZERO linhas na lista (chat C, 29/09, 09:43).
 *
 * - `file` — o documento foi trocado (abrir, reabrir a pasta): **nunca** é
 *   criar, e um pedido de antes morre com o arquivo velho.
 * - o pedido espera até a criada ser a aberta: o comando entra com a VELHA
 *   ainda aberta, e só depois a nova abre (dois avisos).
 * - a lista crescer sem pedido (desfazer um Apagar, importar) não abre nada.
 */
export function renameAfter(
  kind: ChangeKind, waiting: string | null, asked: string | null, open: string | null,
): { renaming: string | null; waiting: string | null } {
  if (kind === 'file') return { renaming: null, waiting: null };
  const esperando = asked ?? waiting;
  if (esperando !== null && open === esperando) return { renaming: esperando, waiting: null };
  return { renaming: null, waiting: esperando };
}

/**
 * A lista Corpos só aparece com **mais de um corpo** — Q1, decisão P33.
 *
 * Com um corpo só ela era uma caixa de 68 px que não escolhia nada, e roubava a
 * altura da lista que se usa o dia inteiro. O corpo único não some: vira UMA
 * linha, "Base — montar", e o clique nela abre a base, como antes.
 */
export function showBodiesList(bodies: number): boolean {
  return bodies > 1;
}

/**
 * O nome da linha do corpo — decisão P33, a "panela" de voltar a montar.
 *
 * O interruptor `Montagem | Animando` saiu da barra no degrau 11, e com ele a
 * porta visível de sair da animação. A linha do corpo passa a dizer o que o
 * clique faz. Com mais de um corpo, o nome dele vai junto.
 */
export function baseLineLabel(body: string, many: boolean): string {
  return many ? `Base — montar · ${body}` : 'Base — montar';
}

/** O que o renomear no lugar faz com o que foi digitado — Q2/K14. Puro. */
export type RenameAnswer = { kind: 'cancelar' } | { kind: 'renomear'; to: string };

export function renameAnswer(from: string, typed: string, save: boolean): RenameAnswer {
  const wanted = typed.trim();
  if (!save || wanted === '' || wanted === from) return { kind: 'cancelar' };
  return { kind: 'renomear', to: wanted };
}

/**
 * O rodapé do renomear — K2. O verbo é "renomeou": o documento escreve
 * *"Abriu a animação"* a cada troca do nome aberto, e quem renomeou não abriu
 * nada. O painel escreve esta frase **depois**, por cima.
 */
export function renamedNotice(from: string, to: string, wanted: string = to): string {
  // QA da noite (04/11/2026): o nome digitado já existia e ganhou um número;
  // a frase dizia só "para andar2", sem a razão. A Árvore já diz "Já existe".
  if (wanted !== to) return `Já existe "${wanted}": a animação "${from}" ficou "${to}"`;
  return `Renomeou a animação "${from}" para "${to}"`;
}

/**
 * O rodapé do apagar — QA da noite de 04/11/2026. Dizia só "Abriu a animação
 * andar2" (a frase do abrir, que vem depois): a que sumiu não aparecia em
 * lugar nenhum, nem o caminho de volta.
 */
export function deletedNotice(name: string, opened: string | null): string {
  return `Apagou a animação "${name}" (Ctrl+Z volta). Aberta agora: ${opened === null ? 'a base' : `"${opened}"`}`;
}

/** Um item do menu do botão direito numa animação — Q3. */
export interface AnimationMenuEntry {
  id: 'renomear' | 'duplicar' | 'topo' | 'exportar' | 'apagar';
  label: string;
  hint: string;
  enabled: boolean;
}

/**
 * **O botão direito no nome** — Q3. O que os ícones fazem, na mesma ordem,
 * mais o Exportar, que só morava no menu Animação. É o Spriter (guia do beta,
 * "The Animations Window"): botão direito → renomear, apagar, clonar.
 */
export function animationRowMenu(file: BoneFile, name: string): AnimationMenuEntry[] {
  const primeira = file.animations?.[0]?.name === name;
  return [
    { id: 'renomear', label: 'Renomear', hint: 'Troca o nome aqui mesmo, na linha. Duplo clique faz o mesmo', enabled: true },
    { id: 'duplicar', label: 'Duplicar', hint: 'Faz uma cópia desta animação, já aberta', enabled: true },
    {
      id: 'topo', label: 'Mandar para o topo',
      hint: primeira ? `${name} já é a primeira: é a que o jogo abre` : 'A primeira da lista é a que o jogo abre',
      enabled: !primeira,
    },
    { id: 'exportar', label: 'Exportar animação…', hint: 'Leva esta animação para outro boneco', enabled: true },
    { id: 'apagar', label: 'Apagar', hint: 'Apaga esta animação. Ctrl+Z desfaz', enabled: true },
  ];
}

/**
 * O rodapé da animação nova — K6, decisão P18. Diz que nasceu, que nasceu em
 * laço (desligar é no Repetir do tocador) e o passo seguinte: o campo de nome
 * já está aberto na lista.
 */
export function createdNotice(name: string): string {
  return `Animação "${name}" criada, em laço. Escreva o nome e aperte Enter`;
}
