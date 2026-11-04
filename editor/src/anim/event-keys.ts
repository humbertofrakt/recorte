/**
 * Which event a key fires, and what it carries (requisito A3, owner C).
 *
 * THE HOLE THIS CLOSES
 * --------------------
 * Every property of the format could already be keyed, `event` included — but
 * an event key has no `value`. What it has is a NAME (`key.event`, spec 9.7)
 * saying which of `file.events` fires, plus five optional fields that override
 * the definition for this one firing (spec 8.6):
 *
 * | Campo    | Rótulo na tela | O que é                                     |
 * |:---------|:---------------|:--------------------------------------------|
 * | `int`    | Inteiro        | Um número inteiro para o jogo ler.           |
 * | `float`  | Decimal        | Um número com vírgula.                       |
 * | `string` | Texto          | Uma palavra ou frase.                        |
 * | `volume` | Volume         | Volume do som, de 0 a 1 (a definição manda). |
 * | `balance`| Balanço        | Da esquerda (−1) para a direita (1).         |
 *
 * `audio` NÃO se sobrescreve por chave: ele vem sempre da definição do evento
 * (8.6), e por isso aparece aqui só para ler, nunca para editar.
 *
 * Everything in this file is pure: it turns a `BoneFile` into rows to draw, and
 * gives back commands. No DOM, so the panels are testable without a browser.
 */

import type { BoneFile, EventDef, KeyDef } from '../../../runtime/src/index.js';
import type { Command, EditorDoc } from '../contract.js';
import { eventTarget, findAnimation, roundTime, sameTime, timelinePointerFor } from './keying.js';
import { RemoveKey, SetKey } from './pose-mode.js';

// ---------------------------------------------------------------------------
// The five fields, and how each one is drawn
// ---------------------------------------------------------------------------

/** Name of a field an event key may carry. */
export type EventFieldKey = 'int' | 'float' | 'string' | 'volume' | 'balance';

export interface EventFieldDef {
  key: EventFieldKey;
  /** Shown to the user, in Portuguese, written out. */
  label: string;
  kind: 'inteiro' | 'decimal' | 'texto';
  min?: number;
  max?: number;
  /** Rodada 47, lote 3 (R7 do doc 68): a dica no molde da casa, a unidade e a escala da tela. */
  hint?: string;
  unit?: string;
  /** O número na tela é o do arquivo vezes isto (volume e balanço: de 0 a 1 viram %). */
  scale?: number;
}

/**
 * The five fields, in the order of the table of 9.2 — which is the order the
 * specification reads, so the panel and the JSON on disk agree.
 */
export const EVENT_FIELDS: readonly EventFieldDef[] = [
  { key: 'int', label: 'Inteiro', kind: 'inteiro', hint: 'Inteiro: um número sem vírgula que o jogo lê junto com o evento (o dano, a vez do passo). Vazio: vale o da definição' },
  { key: 'float', label: 'Decimal', kind: 'decimal', hint: 'Decimal: um número com vírgula que o jogo lê junto com o evento. Vazio: vale o da definição' },
  { key: 'string', label: 'Texto', kind: 'texto', hint: 'Texto: uma palavra que o jogo lê junto com o evento (o nome do golpe, uma fala). Vazio: vale o da definição' },
  {
    key: 'volume', label: 'Volume', kind: 'decimal', min: 0, max: 1, unit: '%', scale: 100,
    hint: 'Volume do som, em %, de 0 a 100: 0 calado, 100 cheio. Vazio: vale o da definição',
  },
  {
    key: 'balance', label: 'Balanço', kind: 'decimal', min: -1, max: 1, unit: '%', scale: 100,
    hint: 'Balanço do som, em %, de −100 a 100: −100 só à esquerda, 0 no meio, 100 só à direita. Vazio: vale o da definição',
  },
];

/** The values one event key (or one event definition) carries. */
export interface EventValues {
  int?: number;
  float?: number;
  string?: string;
  volume?: number;
  balance?: number;
}

// ---------------------------------------------------------------------------
// Reading the file
// ---------------------------------------------------------------------------

/** Names of every event declared in the file, in the order they were written. */
export function eventNames(file: BoneFile): string[] {
  return (file.events ?? []).map((event) => event.name);
}

/** The declaration of one event, or `null` when the file has no such event. */
export function eventDefinition(file: BoneFile, name: string): EventDef | null {
  return (file.events ?? []).find((event) => event.name === name) ?? null;
}

/** What the DEFINITION says, which is what a key that writes nothing inherits. */
export function eventDefaults(file: BoneFile, name: string): EventValues {
  const found = eventDefinition(file, name);
  if (found === null) return {};
  const out: EventValues = {};
  if (typeof found.int === 'number') out.int = found.int;
  if (typeof found.float === 'number') out.float = found.float;
  if (typeof found.string === 'string') out.string = found.string;
  if (typeof found.volume === 'number') out.volume = found.volume;
  if (typeof found.balance === 'number') out.balance = found.balance;
  return out;
}

/** The sound file the definition names, or `null`. Never keyed (8.6). */
export function eventAudio(file: BoneFile, name: string): string | null {
  const found = eventDefinition(file, name);
  return typeof found?.audio === 'string' ? found.audio : null;
}

/** One event key, as the panel draws it. */
export interface EventKeyRow {
  time: number;
  /** Which event of `file.events` fires. Empty when the key names none. */
  event: string;
  /** `true` when `event` does not exist in the file — a key pointing nowhere. */
  unknownEvent: boolean;
  /** What THIS key writes. A field missing here falls back to `defaults`. */
  values: EventValues;
  /** What the definition says, so the field can show the inherited value. */
  defaults: EventValues;
  audio: string | null;
}

/** Reads the values a key writes, ignoring anything that is not a field of 9.2. */
function valuesOf(key: KeyDef): EventValues {
  const out: EventValues = {};
  if (typeof key.int === 'number') out.int = key.int;
  if (typeof key.float === 'number') out.float = key.float;
  if (typeof key.string === 'string') out.string = key.string;
  if (typeof key.volume === 'number') out.volume = key.volume;
  if (typeof key.balance === 'number') out.balance = key.balance;
  return out;
}

/** The keys of the `event` timeline of an animation, in time order. */
export function eventKeys(file: BoneFile, animation: string): EventKeyRow[] {
  const owner = findAnimation(file, animation);
  if (owner === null) return [];
  const rows: EventKeyRow[] = [];
  const names = new Set(eventNames(file));
  for (const timeline of owner.timelines ?? []) {
    if (timeline.type !== 'event') continue;
    for (const key of timeline.keys ?? []) {
      const name = typeof key.event === 'string' ? key.event : '';
      rows.push({
        time: key.time,
        event: name,
        unknownEvent: name !== '' && !names.has(name),
        values: valuesOf(key),
        defaults: eventDefaults(file, name),
        audio: eventAudio(file, name),
      });
    }
  }
  return rows.sort((a, b) => a.time - b.time);
}

/**
 * The event keys sitting exactly at `time`.
 *
 * There can be more than one: `event` is the ONE timeline where several keys
 * share an instant (9.7) — a footstep and its sound fire together — and the
 * name is what tells them apart.
 */
export function eventKeysAt(file: BoneFile, animation: string, time: number): EventKeyRow[] {
  return eventKeys(file, animation).filter((row) => sameTime(row.time, time));
}

/** `true` when this exact event already has a key at this instant. */
export function hasEventKey(
  file: BoneFile, animation: string, time: number, event: string,
): boolean {
  return eventKeysAt(file, animation, time).some((row) => row.event === event);
}

/** JSON Pointer of the `event` timeline, or `null` when there is none yet. */
export function eventTimelinePointer(file: BoneFile, animation: string): string | null {
  return timelinePointerFor(file, animation, eventTarget());
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

/**
 * A field the user cleared comes back as `null`, meaning "take it off the key
 * and let the definition answer". `undefined` means "leave it alone".
 */
export type EventValueEdit = number | string | null | undefined;

export interface EventKeyEdit {
  int?: EventValueEdit;
  float?: EventValueEdit;
  string?: EventValueEdit;
  volume?: EventValueEdit;
  balance?: EventValueEdit;
}

/**
 * Which fields to write, as `SetKey` wants them.
 *
 * `SetKey` keeps a field it is not told about, so clearing one cannot go
 * through it — that is what `clearEventFields` below is for.
 */
function writable(edit: EventKeyEdit): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const field of EVENT_FIELDS) {
    const value = edit[field.key];
    if (value === undefined || value === null) continue;
    if (field.kind === 'texto') out[field.key] = String(value);
    else if (typeof value === 'number' && Number.isFinite(value)) {
      out[field.key] = field.kind === 'inteiro' ? Math.round(value) : value;
    }
  }
  return out;
}

/** The fields set to `null`: the ones to take off the key. */
function cleared(edit: EventKeyEdit): EventFieldKey[] {
  return EVENT_FIELDS.filter((field) => edit[field.key] === null).map((field) => field.key);
}

/**
 * Creates or updates the key of ONE event at `time`.
 *
 * The event name is part of the address, not of the value: keying "passo" at
 * 0,4 s twice updates that key, and keying "som" at the same 0,4 s makes a
 * second one next to it (9.7).
 */
export function keyEvent(
  animation: string, time: number, event: string, edit: EventKeyEdit = {},
  label?: string,
): Command {
  const clearing = cleared(edit);
  const set = new SetKey(animation, roundTime(time), eventTarget(), undefined, {
    event, ...writable(edit),
    label: label ?? `Chavear evento ${event}`,
    mergeable: false,
  });
  if (clearing.length === 0) return set;
  return new ClearAfterSet(set, animation, roundTime(time), event, clearing);
}

/** Removes the key of one event at one instant. */
export function unkeyEvent(animation: string, time: number, event: string): Command {
  return new RemoveKey(animation, roundTime(time), eventTarget(), {
    event, label: `Apagar chave do evento ${event}`,
  });
}

/**
 * `SetKey` plus the fields the user emptied.
 *
 * A field taken OFF a key is not the same as a field written as zero: without
 * it, the value of the definition answers (8.6). `SetKey` alone cannot express
 * that — it keeps what it is not told about, on purpose, so that re-keying a
 * value never wipes the rest of the key — so the removal rides along here, in
 * the same undo step.
 */
class ClearAfterSet implements Command {
  readonly kind = 'structure' as const;
  readonly label: string;

  constructor(
    private readonly set: SetKey,
    private readonly animation: string,
    private readonly time: number,
    private readonly event: string,
    private readonly fields: readonly EventFieldKey[],
  ) {
    this.label = set.label;
  }

  get animationOnly(): string {
    return this.animation;
  }

  apply(doc: EditorDoc): void {
    this.set.apply(doc);
    const key = findEventKey(doc.file, this.animation, this.time, this.event);
    if (key === null) return;
    for (const field of this.fields) delete key[field];
  }

  revert(doc: EditorDoc): void {
    this.set.revert(doc);
  }
}

/** The key object itself, so a field can be taken off it. */
function findEventKey(
  file: BoneFile, animation: string, time: number, event: string,
): KeyDef | null {
  const owner = findAnimation(file, animation);
  if (owner === null) return null;
  for (const timeline of owner.timelines ?? []) {
    if (timeline.type !== 'event') continue;
    for (const key of timeline.keys ?? []) {
      if (sameTime(key.time, time) && key.event === event) return key;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Showing a value
// ---------------------------------------------------------------------------

/**
 * What one field shows, and where the number came from.
 *
 * `origem` is the half people forget: a volume of 1 that came from the
 * DEFINITION and a volume of 1 written on this key look the same on screen and
 * behave differently the day the definition changes. So the panel writes which
 * one it is next to the field, in words.
 */
export interface EventFieldView {
  field: EventFieldDef;
  /** The value in force: the key's, or the definition's when the key is silent. */
  value: number | string | undefined;
  origem: 'chave' | 'definição' | 'vazio';
}

/** The five fields of a row, ready to draw. */
export function eventFieldViews(row: EventKeyRow): EventFieldView[] {
  return EVENT_FIELDS.map((field) => {
    const own = row.values[field.key];
    if (own !== undefined) return { field, value: own, origem: 'chave' as const };
    const inherited = row.defaults[field.key];
    if (inherited !== undefined) return { field, value: inherited, origem: 'definição' as const };
    return { field, value: undefined, origem: 'vazio' as const };
  });
}

// ---------------------------------------------------------------------------
// D5 — a DEFINIÇÃO do evento, e o som (§4.5, §2.8, §8.6)
// ---------------------------------------------------------------------------

/*
 * Degrau 12, porta D5 (18/09/2026). O formato tinha `audio`, `volume` e
 * `balance` na definição do evento desde sempre (§4.5), a junção
 * `assets.audioBase + event.audio` está escrita na §2.8, e o
 * `runtime/src/animation.ts` já **entrega** o evento no instante certo (§8.6).
 *
 * A tela tinha metade: a CHAVE editava volume e balanço, e o caminho do som
 * aparecia **só para ler**. A definição — que é onde o som mora — não tinha
 * campo nenhum, a pasta de sons não tinha campo nenhum, e **o editor não
 * tocava som nenhum**.
 *
 * Os três programas, antes de decidir a tela (regra do Humberto):
 *
 * | Programa | O que faz com som de evento |
 * |:---|:---|
 * | **Spriter** | o som é um OBJETO próprio, com linha só dele na linha do tempo, e volume e panning chaveáveis. Toca durante a reprodução |
 * | **Spine** | o som fica na DEFINIÇÃO do evento (`audio`, `volume`, `balance`), que é de onde o nosso formato copiou a §4.5. Toca quando o cursor cruza a chave |
 * | **DragonBones** | tem quadro de som na linha do tempo, mas **não toca**: só nomeia para o runtime |
 *
 * O formato já escolheu o modelo do Spine (o som na definição), e é o que a
 * ficha desenha. O que fica de fora nesta porta está nos Desvios.
 */

/** A pasta base dos sons (§2.8 `assets.audioBase`), ou `''`. */
export function audioBaseOf(file: BoneFile): string {
  const base = (file as { assets?: { audioBase?: unknown } }).assets?.audioBase;
  return typeof base === 'string' ? base : '';
}

/**
 * O caminho do som, já juntado — §2.8: *"se `base` não é vazia e não termina
 * em `/`, o leitor insere `/` entre os dois"*. `null` quando o evento não tem
 * som.
 *
 * É a **mesma** conta do runtime. Mostrar a junção na tela é o que evita a
 * pergunta de sempre: *"o caminho está certo?"* — dá para ler o resultado.
 */
export function resolvedEventAudio(file: BoneFile, name: string): string | null {
  const audio = eventAudio(file, name);
  if (audio === null || audio === '') return null;
  const base = audioBaseOf(file);
  if (base === '') return audio;
  return base.endsWith('/') ? `${base}${audio}` : `${base}/${audio}`;
}

/** Os campos da DEFINIÇÃO, na ordem da tabela da §4.5. */
export const EVENT_DEF_FIELDS: readonly EventFieldDef[] = [
  { key: 'int', label: 'Inteiro', kind: 'inteiro', hint: 'Inteiro: um número sem vírgula que o jogo lê junto com o evento (o dano, a vez do passo). Vazio: vale o da definição' },
  { key: 'float', label: 'Decimal', kind: 'decimal', hint: 'Decimal: um número com vírgula que o jogo lê junto com o evento. Vazio: vale o da definição' },
  { key: 'string', label: 'Texto', kind: 'texto', hint: 'Texto: uma palavra que o jogo lê junto com o evento (o nome do golpe, uma fala)' },
  {
    key: 'volume', label: 'Volume', kind: 'decimal', min: 0, max: 1, unit: '%', scale: 100,
    hint: 'Volume do som, em %, de 0 a 100: 0 calado, 100 cheio. Vazio: vale o da definição',
  },
  {
    key: 'balance', label: 'Balanço', kind: 'decimal', min: -1, max: 1, unit: '%', scale: 100,
    hint: 'Balanço do som, em %, de −100 a 100: −100 só à esquerda, 0 no meio, 100 só à direita. Vazio: vale o da definição',
  },
];

/**
 * O que está errado na definição de um evento, em português, ou `[]`.
 *
 * Regra 21: um caminho de som sem extensão, um volume fora de 0..1 ou um
 * evento que **nenhuma chave dispara** não dão erro em lugar nenhum — dão
 * silêncio no jogo, e ninguém sabe por quê.
 */
export function eventDefProblems(file: BoneFile, name: string): string[] {
  const def = eventDefinition(file, name);
  if (def === null) return [`o evento "${name}" não existe neste arquivo`];
  const problems: string[] = [];
  const audio = typeof def.audio === 'string' ? def.audio : '';
  // §4.5: "Relativo a `assets.audioBase`. **Com extensão.**"
  if (audio !== '' && !/\.[A-Za-z0-9]+$/.test(audio)) {
    problems.push('o som precisa do nome com extensão (por exemplo `passo.ogg`)');
  }
  const volume = def.volume;
  if (typeof volume === 'number' && (volume < 0 || volume > 1)) {
    problems.push(`o volume ${lerNumero(volume)} está fora de 0 a 1`);
  }
  const balance = def.balance;
  if (typeof balance === 'number' && (balance < -1 || balance > 1)) {
    problems.push(`o balanço ${lerNumero(balance)} está fora de −1 a 1`);
  }
  if (eventFirings(file, name).length === 0) {
    problems.push('nenhuma chave dispara este evento: ele não vai tocar nunca');
  }
  return problems;
}

/**
 * Um número como ele se lê em português: vírgula, e o sinal de menos de
 * verdade (−, U+2212). Um hífen no meio de uma frase vira travessão aos olhos,
 * e "o balanço -9" se lê pior que "o balanço −9".
 */
function lerNumero(value: number): string {
  return String(Math.round(value * 1000) / 1000).replace('.', ',').replace('-', '−');
}

/** Onde um evento é disparado: a animação e o tempo de cada chave. */
export interface EventFiring {
  animation: string;
  time: number;
}

/** Todos os disparos de um evento, em todo o arquivo, na ordem de leitura. */
export function eventFirings(file: BoneFile, name: string): EventFiring[] {
  const out: EventFiring[] = [];
  // `file.animations` é um ARRAY de `{ name, timelines }` (§4.6), e não um
  // objeto por nome: o nome da animação vem de dentro dela.
  for (const body of file.animations ?? []) {
    const timelines = (body as { timelines?: Array<{ type?: string; keys?: KeyDef[] }> })
      .timelines ?? [];
    for (const tl of timelines) {
      if (tl.type !== 'event') continue;
      for (const key of tl.keys ?? []) {
        if ((key as { event?: string }).event !== name) continue;
        out.push({ animation: body.name, time: typeof key.time === 'number' ? key.time : 0 });
      }
    }
  }
  return out;
}

/** Uma linha da lista "os sons desta animação". */
export interface AnimationSoundRow {
  time: number;
  event: string;
  /** O caminho já juntado com a `audioBase`, ou `null` quando o evento é mudo. */
  audio: string | null;
  /** O volume que vale nesta chave: o dela, ou o da definição, ou 1. */
  volume: number;
  /** O balanço que vale nesta chave. */
  balance: number;
  /** `true` quando a chave aponta para um evento que não existe. */
  unknownEvent: boolean;
}

/**
 * **Os sons desta animação, em ordem de tempo** — a porta que faltava.
 *
 * É o que dá para ver da linha do tempo sem desenhar onda nenhuma: quais
 * instantes tocam alguma coisa, qual arquivo, e com que volume. Uma chave de
 * evento sem som entra na lista assim mesmo, com `audio: null`, porque ela
 * **existe** — esconder a muda faria parecer que ela não está lá.
 */
export function animationSounds(file: BoneFile, animation: string | null): AnimationSoundRow[] {
  if (animation === null) return [];
  const body = findAnimation(file, animation);
  if (body === null) return [];
  const out: AnimationSoundRow[] = [];
  for (const tl of (body as { timelines?: Array<{ type?: string; keys?: KeyDef[] }> })
    .timelines ?? []) {
    if (tl.type !== 'event') continue;
    for (const key of tl.keys ?? []) {
      const event = typeof (key as { event?: string }).event === 'string'
        ? (key as { event: string }).event : '';
      const def = eventDefinition(file, event);
      const volume = typeof key.volume === 'number' ? key.volume
        : typeof def?.volume === 'number' ? def.volume : 1;
      const balance = typeof key.balance === 'number' ? key.balance
        : typeof def?.balance === 'number' ? def.balance : 0;
      out.push({
        time: typeof key.time === 'number' ? key.time : 0,
        event,
        audio: def === null ? null : resolvedEventAudio(file, event),
        volume,
        balance,
        unknownEvent: def === null,
      });
    }
  }
  return out.sort((a, b) => a.time - b.time);
}

/**
 * **O quadro "Chave de evento" da Linha do tempo nasce fechado** — rodada 40,
 * lote 2 (doc 39, §2.4).
 *
 * Aberto, ele comia 115 px da faixa em 1920×1080 e sobrava UMA linha de chave
 * para o osso escolhido. Fechado, é uma linha de título, e quem o abriu uma vez
 * o encontra aberto no redesenho seguinte (`previous`).
 */
export function eventFoldOpen(previous: boolean | undefined): boolean {
  return previous ?? false;
}

// Rodada 47, lote 6d (doc 90; o detalhe do conferente): nada dizia o que é um evento.
/** A dica do rótulo Evento: o que É um evento, para quem chega. */
export const EVENT_HINT =
  'Evento: um aviso com nome que a animação dá ao jogo num instante (um passo, um golpe). O jogo ouve e faz o resto: toca o som, tira a vida';

/** A dica do Som do evento. */
export const SOUND_HINT = 'Som: o arquivo que toca quando o evento chega, dentro da pasta dos sons. Vazio: o evento é mudo';

/** A dica da Pasta dos sons. */
export const SOUND_BASE_HINT = 'Pasta dos sons: onde o jogo procura o som de todos os eventos, a partir do arquivo';
