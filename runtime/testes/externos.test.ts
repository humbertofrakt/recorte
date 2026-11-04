/**
 * Animations and skins from other files (spec 2.8), and the reader of a loose
 * `.bone` that follows them (`LoadFileOptions.files`).
 *
 * What is proved here:
 *   1. A skin file brings its `skinRequired` bones, its slots and its
 *      `skinRequired` constraints to the END of the host arrays; a bone
 *      without `skinRequired` is ignored with a warning (the root, silently);
 *      a local name always wins.
 *   2. An animations file: local name wins, the first external wins over a
 *      later one, `rig` names the host lacks are `RIG_UNMET`, and
 *      `rig.reference` scales `x` / `y` values and Bezier `cy`, nothing else.
 *   3. Depth is 1 (`EXTERNAL_CHAIN`), a missing file is listed, never fatal,
 *      and the input tree is never mutated.
 *   4. Through `loadSkeletonFile` with `files`: a timeline of an external
 *      animation whose target the host lacks is not L1 even in strict mode;
 *      the bodies of `body` keys come back loaded once; a nested child is read
 *      next to the file.
 */

import { describe, expect, it } from 'vitest';

import {
  composeExternals, referenceFactor, scaleTranslations, loadSkeletonFile, Skeleton,
  type TreeReader,
} from '../src/index.js';
import { translateBindings } from '../src/index.js';

const header = { version: '1.0', minVersion: '1.0', generator: 'teste externos' };
const encoder = new TextEncoder();

function reader(files: Record<string, unknown>): TreeReader {
  return (name) => (name in files ? files[name] : null);
}

function bytesOf(files: Record<string, unknown>): (path: string) => Uint8Array | null {
  return (path) => (path in files ? encoder.encode(JSON.stringify(files[path])) : null);
}

const host = (assets: Record<string, unknown>, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  bone: header,
  assets: { skeletonsBase: '', ...assets },
  bones: [{ name: 'root' }, { name: 'tronco', parent: 'root', y: 100, length: 120 }],
  slots: [{ name: 'corpo', bone: 'tronco', attachment: 'corpo' }],
  skins: [{ name: 'default', attachments: { corpo: { corpo: { type: 'region', width: 20, height: 40 } } } }],
  animations: [{ name: 'idle', timelines: [] }],
  ...extra,
});

describe('pele de fora com osso (2.8, F23)', () => {
  const pele = {
    bone: header,
    rig: { bones: ['tronco'], slots: ['corpo'] },
    bones: [
      { name: 'root' },
      { name: 'rabo', parent: 'tronco', x: -10, skinRequired: true },
      { name: 'ponta', parent: 'rabo', x: 20, skinRequired: true },
      { name: 'solto', parent: 'root' },
      { name: 'tronco', parent: 'root', skinRequired: true },
    ],
    slots: [{ name: 'rabo', bone: 'rabo', attachment: 'rabo' }, { name: 'corpo', bone: 'root' }],
    constraints: [
      { name: 'segue', type: 'transform', bones: ['ponta'], target: 'tronco', skinRequired: true },
      { name: 'comum', type: 'transform', bones: ['ponta'], target: 'tronco' },
    ],
    skins: [
      { name: 'lobisomem', bones: ['rabo', 'ponta'], constraints: ['segue'], attachments: { rabo: { rabo: { type: 'region', width: 20, height: 6 } } } },
      { name: 'default', attachments: {} },
    ],
  };

  it('ossos, slots e regras skinRequired entram no FIM, na ordem do arquivo', () => {
    const r = composeExternals(host({ skins: ['rabo.bone'] }), '', reader({ 'rabo.bone': pele }));
    const tree = r.tree as { bones: { name: string }[]; slots: { name: string }[]; constraints: { name: string }[]; skins: { name: string }[] };
    expect(tree.bones.map((b) => b.name)).toEqual(['root', 'tronco', 'rabo', 'ponta']);
    expect(tree.slots.map((s) => s.name)).toEqual(['corpo', 'rabo']);
    expect(tree.constraints.map((c) => c.name)).toEqual(['segue']);
    expect(tree.skins.map((s) => s.name)).toEqual(['default', 'lobisomem']);
    expect(r.skinOrigins.get('lobisomem')?.entry).toBe('rabo.bone');
  });

  it('osso comum é ignorado com aviso; a raiz obrigatória, em silêncio; o nome local vence', () => {
    const r = composeExternals(host({ skins: ['rabo.bone'] }), '', reader({ 'rabo.bone': pele }));
    expect(r.warnings.some((w) => w.startsWith('EXTERNAL_BONE_NOT_SKIN') && w.includes('"solto"'))).toBe(true);
    expect(r.warnings.some((w) => w.includes('"root"'))).toBe(false);
    expect(r.warnings.some((w) => w.startsWith('EXTERNAL_DUPLICATE') && w.includes('osso "tronco"'))).toBe(true);
    expect(r.warnings.some((w) => w.startsWith('EXTERNAL_DUPLICATE') && w.includes('slot "corpo"'))).toBe(true);
    expect(r.warnings.some((w) => w.startsWith('EXTERNAL_DUPLICATE') && w.includes('skin "default"'))).toBe(true);
    expect(r.warnings.some((w) => w.startsWith('EXTERNAL_BONE_NOT_SKIN') && w.includes('"comum"'))).toBe(true);
  });

  it('o corpo é montado uma vez com o rabo, e a pele o mostra sem remontar', () => {
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(host({ skins: ['rabo.bone'] }))), {
      files: bytesOf({ 'rabo.bone': pele }),
    });
    const skeleton = new Skeleton(file.data);
    const bones = skeleton.bones;
    expect(skeleton.findBone('rabo')).not.toBeNull();
    expect(skeleton.findSlot('rabo')!.attachment).toBeNull();
    skeleton.setSkinStack(['default', 'lobisomem']);
    expect(skeleton.bones).toBe(bones);
    expect(skeleton.findSlot('rabo')!.attachment).not.toBeNull();
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform(0);
    expect(skeleton.findBone('rabo')!.worldX).toBeCloseTo(-10, 9);
    expect(skeleton.findBone('rabo')!.worldY).toBeCloseTo(100, 9);
  });

  it('pai que não é do rig nem da pele: REF_BONE_MISSING', () => {
    const torta = { bone: header, rig: { bones: [] }, bones: [{ name: 'root' }, { name: 'x', parent: 'tronco', skinRequired: true }] };
    const r = composeExternals(host({ skins: ['p.bone'] }), '', reader({ 'p.bone': torta }));
    expect(r.warnings.some((w) => w.startsWith('REF_BONE_MISSING') && w.includes('"x"'))).toBe(true);
  });
});

describe('animações de fora (2.8, 4.8)', () => {
  const biblioteca = (name: string, y: number, rig: Record<string, unknown> = { bones: ['tronco'] }) => ({
    bone: header,
    rig,
    bones: [{ name: 'root' }],
    animations: [
      { name, duration: 1, timelines: [{ type: 'bone', target: 'tronco', property: 'y', keys: [{ time: 0, value: y }] }] },
      { name: 'idle', timelines: [] },
    ],
  });

  it('a local vence a de fora; entre duas de fora vale a primeira', () => {
    const r = composeExternals(host({ animations: ['a.bone', 'b.bone'] }), '',
      reader({ 'a.bone': biblioteca('andar', 1), 'b.bone': biblioteca('andar', 2) }));
    const anims = (r.tree as { animations: { name: string; timelines: { keys: { value: number }[] }[] }[] }).animations;
    expect(anims.map((a) => a.name)).toEqual(['idle', 'andar']);
    expect(anims[1].timelines[0].keys[0].value).toBe(1);
    expect(r.externalAnimations.has(anims[1])).toBe(true);
    expect(r.externalAnimations.has(anims[0])).toBe(false);
    expect(r.warnings.filter((w) => w.startsWith('EXTERNAL_DUPLICATE'))).toHaveLength(3);
  });

  it('rig que pede osso ausente: RIG_UNMET por nome, e o arquivo abre', () => {
    const r = composeExternals(host({ animations: ['a.bone'] }), '',
      reader({ 'a.bone': biblioteca('andar', 1, { bones: ['tronco', 'cauda'], slots: ['asa'] }) }));
    expect(r.warnings.filter((w) => w.startsWith('RIG_UNMET'))).toHaveLength(2);
    expect((r.tree as { animations: unknown[] }).animations).toHaveLength(2);
  });

  it('rig.reference multiplica valor e cy de x e y, e só deles', () => {
    const anim = {
      name: 'andar',
      timelines: [
        { type: 'bone', target: 'tronco', property: 'x', keys: [{ time: 0, value: 10, curve: [0.2, 1, 0.8, 3] }, { time: 1, value: 30 }] },
        { type: 'bone', target: 'tronco', property: 'rotation', keys: [{ time: 0, value: 10, curve: [0.2, 1, 0.8, 3] }] },
        { type: 'slot', target: 'corpo', property: 'color', keys: [{ time: 0, value: [1, 1, 1, 1] }] },
      ],
    };
    const scaled = scaleTranslations(anim, 2) as typeof anim;
    expect(scaled.timelines[0].keys[0]).toEqual({ time: 0, value: 20, curve: [0.2, 2, 0.8, 6] });
    expect(scaled.timelines[0].keys[1].value).toBe(60);
    expect(scaled.timelines[1]).toBe(anim.timelines[1]);
    expect(scaled.timelines[2]).toBe(anim.timelines[2]);
    expect(anim.timelines[0].keys[0].value).toBe(10);
  });

  it('referenceFactor: k do comprimento, e k = 1 com aviso nos casos ruins', () => {
    const bones = [{ name: 'tronco', length: 120 }, { name: 'zero', length: 0 }];
    expect(referenceFactor('a', { reference: { bone: 'tronco', length: 60 } }, bones)).toBe(2);
    expect(referenceFactor('a', {}, bones)).toBe(1);
    const avisos: string[] = [];
    expect(referenceFactor('a', { reference: { bone: 'tronco', length: 0 } }, bones, avisos)).toBe(1);
    expect(referenceFactor('a', { reference: { bone: 'falta', length: 10 } }, bones, avisos)).toBe(1);
    expect(referenceFactor('a', { reference: { bone: 'zero', length: 10 } }, bones, avisos)).toBe(1);
    expect(avisos.map((w) => w.split(':')[0])).toEqual(['RIG_REFERENCE', 'RIG_UNMET', 'RIG_UNMET']);
  });

  it('pela porta do arquivo: alvo que o hospedeiro não tem não é L1 nem em modo estrito', () => {
    const lib = {
      bone: header, rig: { bones: ['tronco', 'cauda'] }, bones: [{ name: 'root' }],
      animations: [{ name: 'andar', duration: 1, timelines: [
        { type: 'bone', target: 'tronco', property: 'y', keys: [{ time: 0, value: 90 }, { time: 1, value: 100 }] },
        { type: 'bone', target: 'cauda', property: 'rotation', keys: [{ time: 0, value: 0 }] },
      ] }],
    };
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(host({ animations: ['lib.bone'] }))), {
      strict: true, files: bytesOf({ 'lib.bone': lib }),
    });
    const andar = file.data.findAnimation('andar')!;
    expect(andar.timelines).toHaveLength(1);
    expect(file.data.warnings.some((w) => w.message.startsWith('RIG_UNMET') && w.message.includes('"cauda"'))).toBe(true);
  });
});

describe('arquivos de fora: profundidade, falta, pureza (2.8)', () => {
  it('arquivo com listas próprias: EXTERNAL_CHAIN, e as listas dele são ignoradas', () => {
    const encadeado = { bone: header, assets: { animations: ['outro.bone'] }, bones: [{ name: 'root' }], animations: [{ name: 'x', timelines: [] }] };
    const r = composeExternals(host({ animations: ['e.bone'] }), '', reader({ 'e.bone': encadeado }));
    expect(r.warnings.some((w) => w.startsWith('EXTERNAL_CHAIN'))).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('arquivo faltando nunca é fatal e fica listado', () => {
    const r = composeExternals(host({ animations: ['nao.bone'], skins: ['tambem.bone'] }), 'personagens', reader({}));
    expect(r.missing).toEqual(['personagens/tambem.bone', 'personagens/nao.bone']);
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(host({ skins: ['falta.bone'] }))), { files: () => null });
    expect(file.missingFiles).toEqual(['falta.bone']);
  });

  it('a árvore de entrada não é mexida', () => {
    const tree = host({ animations: ['a.bone'] });
    const antes = JSON.stringify(tree);
    composeExternals(tree, '', reader({ 'a.bone': { bone: header, bones: [{ name: 'root' }], animations: [{ name: 'andar', timelines: [] }] } }));
    expect(JSON.stringify(tree)).toBe(antes);
  });

  it('sem assets.animations nem assets.skins devolve a mesma árvore', () => {
    const tree = host({});
    expect(composeExternals(tree, '', reader({})).tree).toBe(tree);
  });
});

describe('o leitor de um .bone solto (LoadFileOptions.files)', () => {
  const lobo = { bone: header, bones: [{ name: 'root' }, { name: 'tronco', parent: 'root', y: 120 }] };

  it('carrega uma vez cada corpo citado por chave body e devolve em bodies', () => {
    const tree = host({}, { animations: [{ name: 'virar', timelines: [{ type: 'body', keys: [
      { time: 0.2, value: 'lobo.bone' }, { time: 0.4, value: null }, { time: 0.6, value: 'lobo.bone' },
    ] }] }] });
    let leituras = 0;
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(tree)), {
      files: (p) => { if (p === 'lobo.bone') leituras++; return bytesOf({ 'lobo.bone': lobo })(p); },
    });
    expect([...file.bodies.keys()]).toEqual(['lobo.bone']);
    expect(file.bodies.get('lobo.bone')!.findBone('tronco')!.y).toBe(120);
    expect(leituras).toBe(1);
  });

  it('corpo que não está lá: BODY_MISSING e a lista do que faltou', () => {
    const tree = host({}, { animations: [{ name: 'virar', timelines: [{ type: 'body', keys: [{ time: 0.2, value: 'fantasma.bone' }] }] }] });
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(tree)), { files: () => null });
    expect(file.bodies.size).toBe(0);
    expect(file.missingFiles).toEqual(['fantasma.bone']);
    expect(file.warnings.some((w) => w.startsWith('BODY_MISSING'))).toBe(true);
  });

  it('a entidade é lida ao lado do arquivo, pelo skeletonsBase', () => {
    const arma = { bone: header, bones: [{ name: 'root' }, { name: 'lamina', parent: 'root', x: 20 }] };
    const tree = host({ skeletonsBase: 'armas/' }, {
      slots: [{ name: 'corpo', bone: 'tronco', attachment: 'arma' }],
      skins: [{ name: 'default', attachments: { corpo: { arma: { type: 'skeleton', uri: 'arma.bone', x: 5 } } } }],
    });
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(tree)), { files: bytesOf({ 'armas/arma.bone': arma }) });
    const skeleton = new Skeleton(file.data);
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform(0);
    const child = skeleton.findSlot('corpo')!.nestedSkeleton();
    expect(child).not.toBeNull();
    expect(child!.skeleton.findBone('lamina')!.worldX).toBeCloseTo(25, 9);
    expect(child!.skeleton.findBone('lamina')!.worldY).toBeCloseTo(100, 9);
  });

  it('sem files, nada de fora é lido e nada muda (o comportamento de antes)', () => {
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(host({ skins: ['rabo.bone'] }))));
    expect(file.bodies.size).toBe(0);
    expect(file.missingFiles).toEqual([]);
    expect(file.data.findSkin('lobisomem')).toBeNull();
  });
});

describe('pele de fora com malha pesada (Apêndice C, regra 8)', () => {
  it('binding.bones é traduzido pelo nome do osso; nome que falta vai ao índice 0 com RIG_UNMET', () => {
    const skin = { name: 'p', attachments: { s: {
      m: { type: 'mesh', binding: { counts: [2], bones: [1, 2], positions: [0, 0, 0, 0], weights: [0.5, 0.5] } },
      r: { type: 'region' },
    } } };
    const avisos: string[] = [];
    const out = translateBindings(skin, ['root', 'rabo', 'asa'], ['root', 'tronco', 'rabo'], 'p.bone', avisos) as typeof skin;
    expect(out.attachments.s.m.binding.bones).toEqual([2, 0]);
    expect(out.attachments.s.r).toBe(skin.attachments.s.r);
    expect(skin.attachments.s.m.binding.bones).toEqual([1, 2]);
    expect(avisos).toHaveLength(1);
    expect(avisos[0].startsWith('RIG_UNMET') && avisos[0].includes('"asa"')).toBe(true);
  });

  it('pela porta do arquivo: a malha pesada da pele puxa pelos ossos certos do corpo', () => {
    const pele = {
      bone: header, rig: { bones: ['tronco'] },
      bones: [{ name: 'root' }, { name: 'rabo', parent: 'tronco', x: 7, skinRequired: true }],
      slots: [{ name: 'capa', bone: 'rabo', attachment: 'capa' }],
      skins: [{ name: 'lobisomem', bones: ['rabo'], attachments: { capa: { capa: {
        type: 'mesh', uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2], hull: 3,
        binding: { counts: [1, 1, 1], bones: [1, 1, 1], positions: [0, 0, 1, 0, 0, 1], weights: [1, 1, 1] },
      } } } }],
    };
    const file = loadSkeletonFile(encoder.encode(JSON.stringify(host({ skins: ['rabo.bone'] }))), { files: bytesOf({ 'rabo.bone': pele }) });
    const sk = new Skeleton(file.data);
    sk.setSkinStack(['default', 'lobisomem']);
    sk.setToSetupPose();
    sk.updateWorldTransform(0);
    const slot = sk.findSlot('capa')!;
    const v = (slot.attachment as unknown as { computeWorldVertices(s: unknown): Float64Array }).computeWorldVertices(slot);
    expect(Array.from(v, (n) => Math.round(n * 1e9) / 1e9)).toEqual([7, 100, 8, 100, 7, 101]);
  });
});
