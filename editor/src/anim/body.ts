/**
 * A virada de corpo — a timeline `body` (spec 9.13) — degrau 4b (17/09/2026).
 *
 * O homem vira lobisomem no meio da animação. Palavra do Humberto: a virada é
 * **corte seco**, e o rabo **nasce** ali. Não é uma pose nova do mesmo
 * esqueleto: é outro corpo, com a base dele. No arquivo é uma chave:
 *
 *     { "type": "body", "keys": [ { "time": 0.5, "value": "lobisomem.bone" } ] }
 *
 * Uma timeline `body` por animação; `value` é o uri do corpo (o que o projeto
 * lista em Corpos), ou `null` = o corpo do próprio arquivo; só `stepped`;
 * `keepSkins` diz se a pilha de peles passa (o padrão) ou não.
 *
 * **Antes da primeira chave vale o arquivo**, e não a primeira chave — a única
 * exceção à regra de 9.10, porque toda animação nasce no corpo em que foi
 * gravada. Uma chave em `0` com outro corpo é permitida e avisa (`BODY_AT_START`).
 *
 * Puro: lê e escreve o JSON. O comando **Colar corpo aqui** (M10) é um
 * `EditKeys` de `pose-mode.ts`, com o mesmo desfazer de toda chave.
 */

import type { AnimationDef, BoneFile } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { animationIndexOf, removeKey, roundTime, sameTime } from './keying.js';
import type { KeyRef } from './keying.js';
import { EditKeys } from './pose-mode.js';

/** Uma chave da timeline `body`, como está no arquivo. */
export interface BodyKeyDef {
  time: number;
  /** O uri do corpo que vale da chave em diante; `null` = o arquivo. */
  value: string | null;
  /** A pilha de peles passa para o corpo novo (`true`, o padrão) ou não. */
  keepSkins?: boolean;
  curve?: 'stepped';
}

interface BodyTimelineDef {
  type: 'body';
  keys: BodyKeyDef[];
}

function timelinesOf(animation: AnimationDef): Array<{ type?: string }> {
  const a = animation as unknown as { timelines?: Array<{ type?: string }> };
  a.timelines ??= [];
  return a.timelines;
}

/** A timeline `body` da animação, ou `null`. */
export function bodyTimeline(file: BoneFile, animation: string): BodyTimelineDef | null {
  const index = animationIndexOf(file, animation);
  if (index < 0) return null;
  const owner = (file.animations ?? [])[index]!;
  const found = ((owner as unknown as { timelines?: Array<{ type?: string }> }).timelines ?? [])
    .find((line) => line.type === 'body');
  return (found as BodyTimelineDef | undefined) ?? null;
}

/** As chaves `body` da animação, em ordem de tempo. Vazio sem timeline. */
export function bodyKeys(file: BoneFile, animation: string): BodyKeyDef[] {
  return [...(bodyTimeline(file, animation)?.keys ?? [])].sort((a, b) => a.time - b.time);
}

/**
 * `corpoEm(animation, t)` de 9.13, lido do arquivo: o uri do corpo que vale
 * em `t`, ou `null` = o arquivo. Sem animação, o arquivo.
 */
export function bodyAt(file: BoneFile, animation: string | null, time: number): string | null {
  if (animation === null) return null;
  let body: string | null = null;
  for (const key of bodyKeys(file, animation)) {
    if (key.time <= time + 1e-6) body = key.value;
  }
  return body;
}

/**
 * Grava (ou troca) a chave `body` em `time`. Uma timeline por animação: se ela
 * não existe, nasce; chave no mesmo tempo é atualizada, nunca duplicada. A
 * lista fica em ordem de tempo. Devolve a chave escrita.
 */
export function setBodyKey(
  file: BoneFile, animation: string, time: number, value: string | null, keepSkins = true,
): BodyKeyDef {
  const index = animationIndexOf(file, animation);
  if (index < 0) throw new Error(`animação não encontrada: ${animation}`);
  const owner = (file.animations ?? [])[index]!;
  const timelines = timelinesOf(owner);
  let timeline = timelines.find((line) => line.type === 'body') as BodyTimelineDef | undefined;
  if (timeline === undefined) {
    timeline = { type: 'body', keys: [] };
    timelines.push(timeline);
  }
  const t = Math.max(0, roundTime(time));
  const existing = timeline.keys.find((key) => sameTime(key.time, t));
  const key: BodyKeyDef = existing ?? { time: t, value };
  key.time = t;
  key.value = value;
  if (keepSkins) delete key.keepSkins;
  else key.keepSkins = false;
  if (existing === undefined) {
    timeline.keys.push(key);
    timeline.keys.sort((a, b) => a.time - b.time);
  }
  const duration = (owner as { duration?: number }).duration;
  if (typeof duration === 'number' && duration < t) (owner as { duration?: number }).duration = t;
  return key;
}

/**
 * Tira a chave `body` de `time`. A timeline que ficou vazia sai junto (uma
 * timeline sem chave quebra L1 de 9.1), e a animação que ficou sem timeline
 * perde o campo. Devolve `true` quando havia chave ali.
 */
export function removeBodyKey(file: BoneFile, animation: string, time: number): boolean {
  const index = animationIndexOf(file, animation);
  if (index < 0) return false;
  const owner = (file.animations ?? [])[index]! as unknown as { timelines?: Array<{ type?: string }> };
  const timelines = owner.timelines ?? [];
  const at = timelines.findIndex((line) => line.type === 'body');
  if (at < 0) return false;
  const timeline = timelines[at] as BodyTimelineDef;
  const t = Math.max(0, roundTime(time));
  const before = timeline.keys.length;
  timeline.keys = timeline.keys.filter((key) => !sameTime(key.time, t));
  if (timeline.keys.length === before) return false;
  if (timeline.keys.length === 0) timelines.splice(at, 1);
  if (timelines.length === 0) delete owner.timelines;
  return true;
}

/** O tempo escrito como o rodapé escreve: `0,50 s`. */
function segundos(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

/**
 * **Colar corpo aqui** (M10): grava a chave `body` em `doc.time` na animação
 * aberta. Dali em diante a cena, a Árvore, a Ordem e as Propriedades mostram
 * o corpo colado. Devolve a frase do rodapé, ou `null` sem animação aberta.
 * `nome` é como o corpo se chama na frase.
 */
export function pasteBodyHere(
  doc: EditorDoc, uri: string | null, nome: string, keepSkins = true,
): string | null {
  const animation = doc.animation;
  if (animation === null) return null;
  if (animationIndexOf(doc.file, animation) < 0) return null;
  const time = doc.time;
  doc.run(new EditKeys(animation, 'Colar base aqui', (file, name) => {
    setBodyKey(file, name, time, uri, keepSkins);
  }));
  return uri === null
    ? `De ${segundos(time)} em diante vale a base do arquivo`
    : `Base ${nome} colada em ${segundos(time)}: dali em diante a cena mostra ela`;
}

/**
 * **Tirar uma chave, qualquer uma** — lote 2a do chat D (29/09/2026), P9.
 *
 * A virada de corpo sai pelo `removeBodyKey`, que é o dono dela (9.13); as
 * outras, pelo `removeKey` de sempre. O `Delete` da linha do tempo, o duplo
 * clique e o botão direito passam todos por aqui: uma função, um dono.
 *
 * O `removeBodyKey` era "função sem porta" desde 21/09 — e a chave saía mesmo
 * assim, pelo `removeKey` genérico. O vigia media quem chama a função, não se a
 * pessoa conseguia fazer (Desvios do encargo, chat D, item 7).
 */
export function removeKeyRef(file: BoneFile, animation: string, ref: KeyRef): boolean {
  if (ref.target.type === 'body') return removeBodyKey(file, animation, ref.time);
  return removeKey(file, animation, ref.time, ref.target, ref.event);
}

/** O rodapé da virada tirada: *"Tirada a virada para lobisomem, em 0,50 s"*. */
export function bodyKeyRemovedNotice(value: string | null, time: number, nome: (uri: string) => string): string {
  const para = value === null ? 'a base do arquivo' : nome(value);
  return `Tirada a virada para ${para}, em ${segundos(time)}`;
}
