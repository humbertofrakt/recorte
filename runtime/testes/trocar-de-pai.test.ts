// SPDX-License-Identifier: Apache-2.0
/**
 * The `parent` timeline (spec 9.4): re-parenting mid-animation with Spriter
 * semantics, the recomputed update order (spec 5.6) and the once-only cycle
 * warning (L2 PARENT_CYCLE). The numbers are pinned by C-281, C-282 and
 * C-286 across runtimes; this file proves the parts a pose dump cannot see.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { pose } from '../src/animation.js';

const CASOS = join(__dirname, '..', '..', 'conformidade', 'casos');
const load = (caso: string) => loadSkeletonData(JSON.parse(readFileSync(join(CASOS, caso, 'entrada.bone'), 'utf8')));

describe('timeline bone/parent (spec 9.4, 5.6)', () => {
  it('troca o pai, refaz a ordem de cálculo e volta na setup pose', () => {
    const data = load('C-281-trocar-de-pai');
    const sk = new Skeleton(data);
    const hand = sk.findBone('hand')!;
    const pack = sk.findBone('pack')!;
    const torso = sk.findBone('torso')!;
    const anim = data.findAnimation('trocar')!;

    pose(sk, anim, 0.75);
    expect(hand.parent).toBe(pack);
    expect(pack.children).toContain(hand);
    expect(torso.children).not.toContain(hand);
    // pack (index 3) now comes before hand (index 2) in the update order.
    const order = sk.updateOrder.map((b) => b.data.name);
    expect(order.indexOf('pack')).toBeLessThan(order.indexOf('hand'));
    expect(hand.worldX).toBeCloseTo(25, 6);
    expect(hand.worldY).toBeCloseTo(30, 6);

    sk.setToSetupPose();
    expect(hand.parent).toBe(torso);
    expect(hand.setupParent).toBe(torso);
    sk.updateWorldTransform();
    expect(sk.updateOrder.map((b) => b.data.name)).toEqual(['root', 'torso', 'hand', 'pack']);
    expect(sk.warnings).toEqual([]);
  });

  it('um ciclo é ignorado com um aviso só (L2 PARENT_CYCLE)', () => {
    const data = load('C-286-trocar-de-pai-ciclo');
    const sk = new Skeleton(data);
    const anim = data.findAnimation('ciclo')!;
    pose(sk, anim, 0.75);
    pose(sk, anim, 0.9);
    expect(sk.findBone('torso')!.parent).toBe(sk.findBone('root'));
    expect(sk.warnings).toHaveLength(1);
    expect(sk.warnings[0]).toMatch(/PARENT_CYCLE/);
    expect(sk.findBone('hand')!.worldY).toBeCloseTo(150, 6);
  });

  it('o loader recusa um pai que não existe e guarda null como pai do arquivo', () => {
    const doc = JSON.parse(readFileSync(join(CASOS, 'C-281-trocar-de-pai', 'entrada.bone'), 'utf8'));
    doc.animations[0].timelines[0].keys[1].value = 'nao_existe';
    const data = loadSkeletonData(doc);
    const kinds = data.findAnimation('trocar')!.timelines.map((t) => t.kind);
    expect(kinds).not.toContain('bone.parent');
    expect(data.warnings.some((w) => /nao_existe/.test(w.message))).toBe(true);
  });
});
