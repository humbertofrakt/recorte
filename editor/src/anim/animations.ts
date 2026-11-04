/**
 * Achar uma animação, a duração dela e o tempo dentro dela — lote A4 (v10.7).
 *
 * Moravam em `panels/animations-model.ts`, e `anim/transport.ts` (o tocador,
 * que é base) importava de um painel. `findAnimation` tinha uma segunda cópia
 * em `anim/keying.ts`, com a mesma resposta: ficou uma. Os dois arquivos
 * continuam exportando os mesmos nomes, daqui.
 */

import type { AnimationDef, BoneFile } from '../../../runtime/src/index.js';

/**
 * Length of an animation in seconds: the declared duration, or the last key
 * when the file leaves it out.
 */
export function animationDuration(animation: AnimationDef): number {
  if (typeof animation.duration === 'number' && animation.duration >= 0) {
    return animation.duration;
  }
  let last = 0;
  for (const timeline of animation.timelines ?? []) {
    for (const key of timeline.keys ?? []) {
      if (typeof key.time === 'number' && key.time > last) last = key.time;
    }
  }
  return last;
}

/** Finds an animation by name: the first one with that name, or `null`. */
export function findAnimation(file: BoneFile, name: string | null): AnimationDef | null {
  if (name === null) return null;
  return (file.animations ?? []).find((animation) => animation.name === name) ?? null;
}

/** Keeps the playhead inside the animation: wraps when it loops, stops if not. */
export function clampTime(time: number, duration: number, loop: boolean): number {
  if (duration <= 0) return 0;
  if (!loop) return Math.max(0, Math.min(time, duration));
  const wrapped = time % duration;
  return wrapped < 0 ? wrapped + duration : wrapped;
}
