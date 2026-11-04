/**
 * **Mudar o pivô e o desenho ficar parado** — rodada 13 (05/10/2026).
 *
 * O Humberto: *"acertei o pivô de uma imagem presa a um osso: o desenho fica
 * parado."* Até aqui o Definir pivô punha o pivô novo na origem do osso, e o
 * desenho ANDAVA até lá (`placeByPivot`).
 *
 * Para a imagem que tem o osso próprio (rodada 8d) a conta é esta: o osso
 * próprio vai para o pivô novo, e todo anexo do slot volta a mesma distância,
 * no espaço do osso. Na base é exato. Numa animação, o osso próprio tem chaves
 * de `x` e `y` escritas POR CIMA do valor da base (spec 9.4); cada uma ganha o
 * mesmo deslocamento, medido com o giro, a escala e a inclinação daquele
 * instante — o `L·q` abaixo. Onde há giro, escala ou inclinação com chave, as
 * chaves de `x` e `y` passam a existir em TODOS os instantes em que alguma
 * propriedade do osso tem chave, partidas sem mudar a curva de antes: em cada
 * chave o desenho fica exato. Entre duas chaves com giro ele gira em volta do
 * pivô novo, e isso é o sentido do pivô, não um defeito (Diretor, 05/10).
 *
 * A conta de um ponto `p` do anexo, no espaço do pai do osso próprio, é
 * `t + L·p`, com `L` a parte linear da §5 (`skeleton.ts`, `updateWorldTransform`):
 *
 *   L = | cos(r+shX)·sX   cos(r+90+shY)·sY |
 *       | sin(r+shX)·sX   sin(r+90+shY)·sY |
 *
 * O pivô novo, no espaço do osso próprio, é `q`. Depois da mudança o anexo
 * está em `p − q` e o osso em `t' = t + L·q`: `t' + L·(p − q) = t + L·p`. O pai
 * não entra na conta, desde que o osso herde giro, escala e reflexo (o modo
 * normal da §5.3) — o osso próprio nasce assim, e o outro caso se recusa.
 *
 * Puro: lê e escreve o `.bone`. Nada de DOM, nada de documento vivo.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { normalizeCurve, sampleCurve, solveBezierParameter } from '../../../runtime/src/index.js';
import { slotOfOwnBone } from '../doc/own-bone.js';

type Def = Record<string, unknown>;
interface KeyLike { time: number; value?: unknown; curve?: unknown; [k: string]: unknown }
interface TimelineLike { type?: unknown; target?: unknown; property?: unknown; keys?: KeyLike[]; [k: string]: unknown }

/** As propriedades que mudam a parte linear `L` do osso. */
const LINEAR_PROPS = ['rotation', 'scaleX', 'scaleY', 'shearX', 'shearY'] as const;
type LinearProp = typeof LINEAR_PROPS[number];
const SETUP_DEFAULT: Readonly<Record<string, number>> = {
  x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0,
};

/** Os tipos de anexo que têm `x` e `y` no osso. */
const MOVABLE = new Set(['region', 'skeleton', 'point', 'BONE_particle']);

const RAD = Math.PI / 180;
/** Seis casas, como o osso próprio (`doc/own-bone.ts`), e nunca `-0`. */
function round(v: number): number {
  const r = Math.round(v * 1e6) / 1e6;
  return r === 0 ? 0 : r;
}

function boneDef(file: BoneFile, name: string): Def | undefined {
  return file.bones.find((b) => b.name === name) as unknown as Def | undefined;
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/** `L·q`: o deslocamento do osso para o pivô `q` cair onde estava. */
export function linearTimes(
  r: number, sx: number, sy: number, shx: number, shy: number, q: { x: number; y: number },
): { x: number; y: number } {
  const a = Math.cos((r + shx) * RAD) * sx;
  const c = Math.sin((r + shx) * RAD) * sx;
  const b = Math.cos((r + 90 + shy) * RAD) * sy;
  const d = Math.sin((r + 90 + shy) * RAD) * sy;
  return { x: a * q.x + b * q.y, y: c * q.x + d * q.y };
}

/** As timelines do osso nesta animação, por propriedade. */
function boneTimelines(animation: Def, bone: string): Map<string, TimelineLike> {
  const out = new Map<string, TimelineLike>();
  for (const tl of (animation['timelines'] as TimelineLike[] | undefined) ?? []) {
    if (tl.type === 'bone' && tl.target === bone && typeof tl.property === 'string') out.set(tl.property, tl);
  }
  return out;
}

/**
 * Por que o osso próprio NÃO pode ir para o pivô com o desenho parado, ou
 * `null`. Regra 21: a conta só vale no modo normal da §5.3 e sem regra
 * mexendo no osso; fora disso o programa diz, e não chuta.
 */
export function pivotStillRefusal(file: BoneFile, bone: string): string | null {
  const def = boneDef(file, bone);
  if (def === undefined) return `o osso "${bone}" não está no arquivo`;
  for (const flag of ['inheritRotation', 'inheritScale', 'inheritReflection']) {
    if (def[flag] === false) return `o osso de "${slotOfOwnBone(file, bone) ?? bone}" não herda tudo do pai`;
  }
  for (const animation of (file.animations ?? []) as unknown as Def[]) {
    const lines = boneTimelines(animation, bone);
    for (const prop of ['inheritRotation', 'inheritScale', 'inheritReflection', 'parent']) {
      if (lines.has(prop)) {
        return `o osso de "${slotOfOwnBone(file, bone) ?? bone}" troca ${prop === 'parent' ? 'de pai' : 'de herança'} na animação "${String(animation['name'])}"`;
      }
    }
  }
  for (const constraint of (file.constraints ?? []) as unknown as Def[]) {
    const names: unknown[] = [];
    if (Array.isArray(constraint['bones'])) names.push(...(constraint['bones'] as unknown[]));
    if (typeof constraint['bone'] === 'string') names.push(constraint['bone']);
    if (typeof constraint['target'] === 'string') names.push(constraint['target']);
    if (names.includes(bone)) {
      return `a regra "${String(constraint['name'])}" mexe no osso de "${slotOfOwnBone(file, bone) ?? bone}"`;
    }
  }
  return null;
}

/** O valor da timeline no instante `t` (spec 9.3 e 9.10), ou `fallback` sem chave. */
function sampleAt(tl: TimelineLike | undefined, t: number, fallback: number): number {
  const keys = tl?.keys ?? [];
  if (keys.length === 0) return fallback;
  if (t <= keys[0]!.time) return num(keys[0]!.value, fallback);
  const last = keys[keys.length - 1]!;
  if (t >= last.time) return num(last.value, fallback);
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1]!.time <= t) i++;
  const k0 = keys[i]!;
  const k1 = keys[i + 1]!;
  const curve = normalizeCurve(k0.curve as never, 1, true, k0.time, k1.time);
  return sampleCurve(curve, 0, k0.time, k1.time, num(k0.value, fallback), num(k1.value, fallback), t);
}

/**
 * Põe uma chave em cada instante de `times` sem mudar a curva de antes: reta
 * continua reta, degrau continua degrau, e a Bézier é partida em duas por de
 * Casteljau, no `s` em que ela passa por aquele instante — o mesmo desenho,
 * com um ponto a mais. Devolve quantas chaves nasceram.
 */
function splitAt(tl: TimelineLike, times: readonly number[]): number {
  const keys = tl.keys!;
  let added = 0;
  for (const t of times) {
    if (keys.some((k) => k.time === t)) continue;
    if (t < keys[0]!.time) {
      // Antes da primeira chave vale a primeira (9.10): um trecho parado.
      keys.unshift({ time: t, value: keys[0]!.value });
      added++;
      continue;
    }
    const last = keys[keys.length - 1]!;
    if (t > last.time) {
      const curve = last.curve;
      keys.push({ time: t, value: last.value });
      // O trecho novo, depois da última, é parado: uma curva ali não faria nada.
      if (curve !== undefined) delete last.curve;
      added++;
      continue;
    }
    let i = 0;
    while (keys[i + 1]!.time < t) i++;
    const k0 = keys[i]!;
    const k1 = keys[i + 1]!;
    const v0 = num(k0.value, 0);
    const v1 = num(k1.value, 0);
    const curve = normalizeCurve(k0.curve as never, 1, true, k0.time, k1.time);
    const mid: KeyLike = { time: t, value: round(sampleCurve(curve, 0, k0.time, k1.time, v0, v1, t)) };
    if (curve.kind === 'stepped') {
      mid.value = k0.value;
      mid.curve = 'stepped';
    } else if (curve.kind === 'bezier' && curve.controls !== null) {
      const [cx1, cy1, cx2, cy2] = curve.controls as unknown as number[];
      const s = solveBezierParameter(k0.time, cx1!, cx2!, k1.time, t);
      const lerp = (a: number, b: number): number => a + (b - a) * s;
      // de Casteljau, nas duas coordenadas (tempo e valor) ao mesmo tempo.
      const p01x = lerp(k0.time, cx1!); const p01y = lerp(v0, cy1!);
      const p12x = lerp(cx1!, cx2!); const p12y = lerp(cy1!, cy2!);
      const p23x = lerp(cx2!, k1.time); const p23y = lerp(cy2!, v1);
      const a1x = lerp(p01x, p12x); const a1y = lerp(p01y, p12y);
      const b1x = lerp(p12x, p23x); const b1y = lerp(p12y, p23y);
      k0.curve = [p01x, p01y, a1x, a1y];
      mid.curve = [b1x, b1y, p23x, p23y];
    }
    keys.splice(i + 1, 0, mid);
    added++;
  }
  return added;
}

/** Soma `off(t)` em cada chave, e na Bézier o da chave em `cy1` e o da próxima em `cy2`. */
function shiftKeys(tl: TimelineLike, off: (t: number) => number): void {
  const keys = tl.keys!;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]!;
    const here = off(k.time);
    k.value = round(num(k.value, 0) + here);
    if (Array.isArray(k.curve) && k.curve.length === 4 && i + 1 < keys.length) {
      const next = off(keys[i + 1]!.time);
      const c = k.curve as number[];
      k.curve = [c[0]!, round(c[1]! + here), c[2]!, round(c[3]! + next)];
    }
  }
}

/** O que a mudança fez numa animação, para o rodapé. */
export interface PivotStillResult {
  /** Chaves de `x` e `y` que nasceram para o desenho ficar parado em cada chave. */
  keysAdded: number;
  /** As animações em que o osso tem giro, escala ou inclinação com chave. */
  turning: string[];
}

/**
 * Leva o osso próprio `bone` ao ponto `q` (espaço dele), e todo anexo do slot
 * para trás a mesma distância. Nenhum pixel anda na base, nem em chave nenhuma.
 * Quem chama confere antes `pivotStillRefusal`.
 */
export function moveOwnBoneToPoint(file: BoneFile, bone: string, q: { x: number; y: number }): PivotStillResult {
  const result: PivotStillResult = { keysAdded: 0, turning: [] };
  const def = boneDef(file, bone);
  if (def === undefined || (q.x === 0 && q.y === 0)) return result;
  const setup = (prop: string): number => num(def[prop], SETUP_DEFAULT[prop]!);
  const setupLinear = {
    rotation: setup('rotation'), scaleX: setup('scaleX'), scaleY: setup('scaleY'),
    shearX: setup('shearX'), shearY: setup('shearY'),
  };

  // As animações primeiro: elas leem o valor de base de ANTES.
  const oldX = setup('x');
  const oldY = setup('y');
  for (const animation of (file.animations ?? []) as unknown as Def[]) {
    const lines = boneTimelines(animation, bone);
    const linear = LINEAR_PROPS.filter((p) => (lines.get(p)?.keys?.length ?? 0) > 0);
    const at = (t: number): { x: number; y: number } => {
      const v = (p: LinearProp): number => sampleAt(lines.get(p), t, setupLinear[p]);
      return linearTimes(v('rotation'), v('scaleX'), v('scaleY'), v('shearX'), v('shearY'), q);
    };
    if (linear.length === 0) {
      // Sem giro nem escala com chave: o `L` é o da base, e o mesmo
      // deslocamento serve em todo instante, exato também entre as chaves.
      const d = at(0);
      const tx = lines.get('x');
      const ty = lines.get('y');
      if (tx !== undefined && (tx.keys?.length ?? 0) > 0) shiftKeys(tx, () => d.x);
      if (ty !== undefined && (ty.keys?.length ?? 0) > 0) shiftKeys(ty, () => d.y);
      continue;
    }
    result.turning.push(String(animation['name']));
    const times = new Set<number>();
    for (const p of [...linear, 'x', 'y']) for (const k of lines.get(p)?.keys ?? []) times.add(k.time);
    const sorted = [...times].sort((a, b) => a - b);
    for (const [prop, base] of [['x', oldX], ['y', oldY]] as const) {
      let tl = lines.get(prop);
      if (tl === undefined || (tl.keys?.length ?? 0) === 0) {
        // Sem chave de posição, a posição é a da base: nasce uma timeline com o
        // valor da base em cada instante, e o deslocamento entra por cima.
        tl = { type: 'bone', target: bone, property: prop, keys: sorted.map((time) => ({ time, value: base })) };
        const list = (animation['timelines'] as TimelineLike[] | undefined) ?? [];
        list.push(tl);
        animation['timelines'] = list;
        result.keysAdded += sorted.length;
      } else {
        result.keysAdded += splitAt(tl, sorted);
      }
      shiftKeys(tl, (t) => at(t)[prop]);
    }
  }

  // A base.
  const d = linearTimes(setupLinear.rotation, setupLinear.scaleX, setupLinear.scaleY,
    setupLinear.shearX, setupLinear.shearY, q);
  const nx = round(oldX + d.x);
  const ny = round(oldY + d.y);
  if (nx === 0) delete def['x']; else def['x'] = nx;
  if (ny === 0) delete def['y']; else def['y'] = ny;

  // Os anexos do slot, em toda skin, voltam `q` no espaço do osso.
  for (const slot of file.slots ?? []) {
    if (slot.bone !== bone) continue;
    for (const skin of file.skins ?? []) {
      const map = (skin.attachments ?? {})[slot.name] as Record<string, Def | null> | undefined;
      for (const attachment of Object.values(map ?? {})) {
        if (attachment === null || attachment === undefined) continue;
        const type = typeof attachment['type'] === 'string' ? attachment['type'] : 'region';
        if (!MOVABLE.has(type)) continue;
        const ax = round(num(attachment['x'], 0) - q.x);
        const ay = round(num(attachment['y'], 0) - q.y);
        if (ax === 0) delete attachment['x']; else attachment['x'] = ax;
        if (ay === 0) delete attachment['y']; else attachment['y'] = ay;
      }
    }
  }
  return result;
}
