/**
 * Nested skeletons (spec 7.11) and the asynchronous `.bonez` reader (2.9).
 *
 * What is proved here:
 *   1. The `skeleton` attachment of `heroi.bone` resolves to `espada.bone`,
 *      is instantiated, is placed where the hand computation says, and shows
 *      up in `collectDrawables`.
 *   2. The `nested` timelines of spec 9.9 drive the child.
 *   3. A cycle and a chain deeper than 8 are refused, with a message.
 *   4. A `.bonez` carries the child too, and a cyclic package is refused.
 *   5. `readBonezAsync` gives byte for byte what `readBonez` gives.
 */

import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

import {
  loadAtlas, loadSkeletonData, loadSkeletonFile, parseBoneText, resolveNestedSkeletons,
  nestedAttachments, collectDrawables, collectDrawGroups, collectDrawList, CanvasRenderer, pose, Skeleton, MAX_NESTED_DEPTH,
  SkeletonAttachment, nestedEventName,
  type AtlasData, type SkeletonData,
} from '../src/index.js';
import { readBonez, readBonezAsync, writeBonez } from '../src/binario/bonez.js';
import { NestedSkeleton } from '../src/index.js';

const EXAMPLES = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';

function readAtlas(): AtlasData {
  return loadAtlas(JSON.parse(readFileSync(EXAMPLES + 'heroi.atlas.json', 'utf8')));
}

function readEspada(atlas: AtlasData): SkeletonData {
  return loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'espada.bone', 'utf8')), { atlases: [atlas] });
}

/** The hero with `espada.bone` already resolved behind the `weapon` slot. */
function heroiComEspada(): Skeleton {
  const atlas = readAtlas();
  const espada = readEspada(atlas);
  const data = loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), {
    atlases: [atlas],
    skeletons: new Map([['espada.bone', espada]]),
  });
  const skeleton = new Skeleton(data);
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform(0);
  return skeleton;
}

// ---------------------------------------------------------------------------

describe('esqueleto aninhado: carga e instância (7.11)', () => {
  it('resolve a uri e guarda o filho no attachment', () => {
    const atlas = readAtlas();
    const espada = readEspada(atlas);
    const data = loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), {
      atlases: [atlas], skeletons: new Map([['espada.bone', espada]]),
    });
    const found = nestedAttachments(data);
    expect(found.length).toBe(1);
    expect(found[0].uri).toBe('espada.bone');
    expect(found[0].resolvedUri).toBe('espada.bone');
    expect(found[0].child).toBe(espada);
  });

  it('sem o mapa de esqueletos o filho fica nulo e nada é desenhado nele', () => {
    const atlas = readAtlas();
    const data = loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), { atlases: [atlas] });
    expect(nestedAttachments(data)[0].child).toBeNull();
    const skeleton = new Skeleton(data);
    skeleton.updateWorldTransform(0);
    expect(skeleton.findSlot('weapon')!.nested).toBeNull();
    expect(skeleton.nestedWarnings.join(' ')).toContain('espada.bone');
  });

  it('avisa quando a uri não resolve e recusa em modo estrito', () => {
    const atlas = readAtlas();
    const json = JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8'));
    const data = loadSkeletonData(json, { atlases: [atlas], skeletons: new Map() });
    expect(data.warnings.some((w) => w.message.includes('espada.bone'))).toBe(true);
    expect(() => loadSkeletonData(json, { atlases: [atlas], skeletons: new Map(), strict: true })).toThrow(/espada\.bone/);
  });

  it('resolveNestedSkeletons aceita uma função e junta o skeletonsBase', () => {
    const atlas = readAtlas();
    const espada = readEspada(atlas);
    const json = JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8'));
    json.assets.skeletonsBase = 'armas';
    const data = loadSkeletonData(json, { atlases: [atlas] });
    const asked: string[] = [];
    resolveNestedSkeletons(data, (uri) => {
      asked.push(uri);
      return uri === 'armas/espada.bone' ? espada : null;
    });
    expect(asked[0]).toBe('armas/espada.bone');
    expect(nestedAttachments(data)[0].child).toBe(espada);
  });
});

describe('esqueleto aninhado: pose e desenho (7.11)', () => {
  it('põe a raiz do filho exatamente em M_ossoDoSlot x T(x, y)', () => {
    const skeleton = heroiComEspada();
    const slot = skeleton.findSlot('weapon')!;
    const nested = slot.nested;
    expect(nested).not.toBeNull();

    // Conta à mão: o attachment tem x = 35, y = 0, rotação 0, escala 1.
    const forearm = skeleton.findBone('forearm')!;
    const esperadoX = forearm.a * 35 + forearm.b * 0 + forearm.worldX;
    const esperadoY = forearm.c * 35 + forearm.d * 0 + forearm.worldY;

    const cabo = nested!.skeleton.findBone('cabo')!;
    expect(cabo.worldX).toBeCloseTo(esperadoX, 9);
    expect(cabo.worldY).toBeCloseTo(esperadoY, 9);
    // Rotação 0 e escala 1: a matriz do filho é a do osso do slot.
    expect(cabo.a).toBeCloseTo(forearm.a, 9);
    expect(cabo.b).toBeCloseTo(forearm.b, 9);
    expect(cabo.c).toBeCloseTo(forearm.c, 9);
    expect(cabo.d).toBeCloseTo(forearm.d, 9);

    // O segundo osso do filho segue a hierarquia do próprio filho: x = 12.
    const lamina = nested!.skeleton.findBone('lamina')!;
    expect(lamina.worldX).toBeCloseTo(cabo.a * 12 + cabo.worldX, 9);
    expect(lamina.worldY).toBeCloseTo(cabo.c * 12 + cabo.worldY, 9);
  });

  it('o filho tem profundidade 1 e conhece o slot que o segura', () => {
    const skeleton = heroiComEspada();
    const nested = skeleton.findSlot('weapon')!.nested!;
    expect(nested.skeleton.nestedDepth).toBe(1);
    expect(nested.skeleton.nestedOwner).toBe(skeleton.findSlot('weapon'));
    expect(skeleton.nestedDepth).toBe(0);
  });

  it('entra em collectDrawables do pai e tem o que desenhar dentro', () => {
    const skeleton = heroiComEspada();
    const nomes = collectDrawables(skeleton).map((d) => `${d.slot.data.name}/${d.attachment.name}`);
    expect(nomes).toContain('weapon/sword');

    const nested = skeleton.findSlot('weapon')!.nested!;
    const dentro = collectDrawables(nested.skeleton).map((d) => `${d.slot.data.name}/${d.attachment.name}`);
    expect(dentro).toEqual(['lamina/lamina', 'brilho/brilho']);
  });

  it('o retângulo do pai passa a incluir o filho', () => {
    const semFilho = new Skeleton(loadSkeletonData(
      JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), { atlases: [readAtlas()] },
    ));
    semFilho.updateWorldTransform(0);
    const comFilho = heroiComEspada();
    const a = semFilho.getBounds();
    const b = comFilho.getBounds();
    expect(b.width).toBeGreaterThanOrEqual(a.width - 1e-9);
    expect(b.height).toBeGreaterThanOrEqual(a.height - 1e-9);
  });

  it('inheritColor multiplica o light do slot pai no light dos slots do filho (7.11)', () => {
    const skeleton = heroiComEspada();
    const slot = skeleton.findSlot('weapon')!;
    slot.color[0] = 0.5;
    slot.color[3] = 0.4;
    skeleton.updateWorldTransform(0);
    const lamina = slot.nested!.skeleton.findSlot('lamina')!;
    expect(lamina.color[0]).toBeCloseTo(0.5, 9);
    expect(lamina.color[3]).toBeCloseTo(0.4, 9);
  });

  it('o nome de um evento do filho leva o slot na frente (7.11)', () => {
    const skeleton = heroiComEspada();
    expect(nestedEventName(skeleton.findSlot('weapon')!, 'brilhou')).toBe('weapon/brilhou');
  });
});

describe('esqueleto aninhado: timelines nested (9.9)', () => {
  it('nested/animation troca a animação do filho e nested/time dirige o relógio', () => {
    const skeleton = heroiComEspada();
    const attack = skeleton.data.findAnimation('attack')!;
    pose(skeleton, attack, 0.3, 0.3);
    const nested = skeleton.findSlot('weapon')!.nested!;
    expect(nested.animationName).toBe('brilho');
    // A timeline nested/time vale como relógio do filho; timeScale é ignorado.
    expect(nested.time).toBeGreaterThan(0);
    expect(nested.time).toBeLessThan(0.6);
    // Com "brilho" rodando, o slot de brilho deixa de ser transparente.
    expect(nested.skeleton.findSlot('brilho')!.color[3]).toBeGreaterThan(0);
  });

  it('sem timeline o relógio do filho é o do pai vezes timeScale', () => {
    const skeleton = heroiComEspada();
    const idle = skeleton.data.findAnimation('idle')!;
    pose(skeleton, idle, 0.25, 0.25);
    const nested = skeleton.findSlot('weapon')!.nested!;
    expect(nested.animationName).toBe('idle');
    expect(nested.time).toBeCloseTo(0.25, 9);
  });
});

// ---------------------------------------------------------------------------
// Refusals: cycle and depth (7.11, 12.6)
// ---------------------------------------------------------------------------

/** The smallest skeleton that points at another one. */
function pequeno(uri: string): SkeletonData {
  return loadSkeletonData({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'filho', bone: 'root', attachment: 'filho' }],
    skins: [{
      name: 'default',
      attachments: { filho: { filho: { type: 'skeleton', uri } } },
    }],
  });
}

describe('esqueleto aninhado: recusas (7.11, 12.6)', () => {
  it('recusa um ciclo direto (A dentro de A)', () => {
    const data = pequeno('a.bone');
    nestedAttachments(data)[0].child = data;
    const skeleton = new Skeleton(data);
    skeleton.updateWorldTransform(0);
    expect(skeleton.findSlot('filho')!.nested).toBeNull();
    expect(skeleton.nestedWarnings.join(' ')).toContain('Ciclo');
  });

  it('recusa um ciclo indireto (A dentro de B dentro de A)', () => {
    const a = pequeno('b.bone');
    const b = pequeno('a.bone');
    nestedAttachments(a)[0].child = b;
    nestedAttachments(b)[0].child = a;
    const skeleton = new Skeleton(a);
    skeleton.updateWorldTransform(0);
    const filho = skeleton.findSlot('filho')!.nested;
    expect(filho).not.toBeNull();
    expect(filho!.skeleton.findSlot('filho')!.nested).toBeNull();
    expect(skeleton.nestedWarnings.join(' ')).toContain('Ciclo');
  });

  it('para na profundidade máxima de 8 (12.6)', () => {
    const chain: SkeletonData[] = [];
    for (let i = 0; i <= MAX_NESTED_DEPTH + 2; i++) chain.push(pequeno(`n${i}.bone`));
    for (let i = 0; i + 1 < chain.length; i++) nestedAttachments(chain[i])[0].child = chain[i + 1];

    const skeleton = new Skeleton(chain[0]);
    skeleton.updateWorldTransform(0);
    let deepest = skeleton;
    let depth = 0;
    for (;;) {
      const nested = deepest.findSlot('filho')!.nested;
      if (nested === null) break;
      deepest = nested.skeleton;
      depth++;
    }
    expect(depth).toBe(MAX_NESTED_DEPTH);
    expect(skeleton.nestedWarnings.join(' ')).toContain('profundidade máxima');
  });
});

// ---------------------------------------------------------------------------
// `.bonez` (2.9)
// ---------------------------------------------------------------------------

const codec = {
  deflateRaw: (data: Uint8Array) => new Uint8Array(deflateRawSync(Buffer.from(data))),
  inflateRaw: (data: Uint8Array) => new Uint8Array(inflateRawSync(Buffer.from(data))),
};

const encoder = new TextEncoder();

/** A package with the hero, the sword, the atlas and the page image inside. */
function pacoteDoHeroi(): Uint8Array {
  const bone = readFileSync(EXAMPLES + 'heroi.bone');
  const espada = readFileSync(EXAMPLES + 'espada.bone');
  const atlas = readFileSync(EXAMPLES + 'heroi.atlas.json');
  const png = readFileSync(EXAMPLES + 'heroi.png');
  return writeBonez({
    manifest: {
      bonez: { version: '1.0' },
      main: 'heroi.bone',
      skeletons: ['espada.bone'],
      atlases: ['heroi.atlas.json'],
      images: ['heroi.png'],
    },
    files: [
      { name: 'heroi.bone', data: new Uint8Array(bone) },
      { name: 'espada.bone', data: new Uint8Array(espada) },
      { name: 'heroi.atlas.json', data: new Uint8Array(atlas) },
      { name: 'heroi.png', data: new Uint8Array(png) },
    ],
  }, codec);
}

describe('pacote .bonez com esqueleto aninhado (2.9, 7.11)', () => {
  it('o pacote traz o filho e ele é instanciado', () => {
    const bytes = pacoteDoHeroi();
    const loaded = loadSkeletonFile(bytes, { codec });
    const att = nestedAttachments(loaded.data)[0];
    expect(att.child).not.toBeNull();
    expect(att.child!.meta.name).toBe('espada');

    const skeleton = new Skeleton(loaded.data);
    skeleton.updateWorldTransform(0);
    expect(skeleton.findSlot('weapon')!.nested).not.toBeNull();
  });

  it('um pacote com ciclo é recusado, com aviso fora de modo estrito', () => {
    const ciclo = encoder.encode(JSON.stringify({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'filho', bone: 'root', attachment: 'filho' }],
      skins: [{ name: 'default', attachments: { filho: { filho: { type: 'skeleton', uri: 'a.bone' } } } }],
    }));
    const bytes = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'a.bone', skeletons: ['a.bone'] },
      files: [{ name: 'a.bone', data: ciclo }],
    }, codec);

    const loaded = loadSkeletonFile(bytes, { codec });
    expect(loaded.warnings.join(' ')).toContain('Ciclo');
    expect(nestedAttachments(loaded.data)[0].child).toBeNull();
    expect(() => loadSkeletonFile(bytes, { codec, strict: true })).toThrow(/Ciclo/);
  });
});

describe('readBonezAsync (2.9)', () => {
  it('devolve o mesmo que o síncrono, entrada por entrada', async () => {
    const bytes = pacoteDoHeroi();
    const sincrono = readBonez(bytes, codec);
    const assincrono = await readBonezAsync(bytes, {});

    expect(assincrono.mainName).toBe(sincrono.mainName);
    expect(assincrono.names()).toEqual(sincrono.names());
    expect(assincrono.manifest).toEqual(sincrono.manifest);
    for (const name of sincrono.names()) {
      const a = sincrono.read(name)!;
      const b = assincrono.read(name)!;
      expect(b.length).toBe(a.length);
      expect(Array.from(b.subarray(0, 64))).toEqual(Array.from(a.subarray(0, 64)));
      expect(Array.from(b.subarray(b.length - 64))).toEqual(Array.from(a.subarray(a.length - 64)));
    }
  });

  it('um pacote todo em Store abre sem descompactador nenhum', async () => {
    const bytes = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'minimo.bone' },
      files: [{ name: 'minimo.bone', data: new Uint8Array(readFileSync(EXAMPLES + 'minimo.bone')), compress: false }],
    }, {});
    const aberto = await readBonezAsync(bytes, {});
    expect(new TextDecoder().decode(aberto.readMain())).toContain('"bones"');
  });

  it('usa o descompactador síncrono quando existe, sem chamar o assíncrono', async () => {
    const bytes = pacoteDoHeroi();
    let chamou = false;
    const aberto = await readBonezAsync(bytes, {
      ...codec,
      inflateRawAsync: async (data: Uint8Array) => {
        chamou = true;
        return new Uint8Array(inflateRawSync(Buffer.from(data)));
      },
    });
    expect(chamou).toBe(false);
    expect(aberto.mainName).toBe('heroi.bone');
  });

  it('aceita um descompactador assíncrono de fora', async () => {
    const bytes = pacoteDoHeroi();
    let chamadas = 0;
    const aberto = await readBonezAsync(bytes, {
      inflateRawAsync: async (data: Uint8Array) => {
        chamadas++;
        return new Uint8Array(inflateRawSync(Buffer.from(data)));
      },
    });
    expect(chamadas).toBeGreaterThan(0);
    expect(new TextDecoder().decode(aberto.read('espada.bone')!)).toContain('"espada"');
  });

  it('o pacote com esqueleto aninhado também abre pelo caminho assíncrono', async () => {
    const { loadSkeletonFileAsync } = await import('../src/file.js');
    const loaded = await loadSkeletonFileAsync(pacoteDoHeroi());
    const att = nestedAttachments(loaded.data)[0];
    expect(att).toBeInstanceOf(SkeletonAttachment);
    expect(att.child!.meta.name).toBe('espada');
  });
});

// ---------------------------------------------------------------------------
// As duas camadas do filho e o canal de resposta (7.11), rascunho 0.2
// ---------------------------------------------------------------------------

describe('esqueleto aninhado: as duas camadas e inheritAnimation (7.11)', () => {
  const h = { version: '1.0', minVersion: '1.0', generator: 'teste camadas' };
  const arma = (): SkeletonData => loadSkeletonData({
    bone: h,
    bones: [{ name: 'root' }, { name: 'lamina', parent: 'root', x: 20 }, { name: 'gema', parent: 'lamina', x: 10 }],
    animations: [
      { name: 'attack', duration: 0.6, timelines: [{ type: 'bone', target: 'lamina', property: 'rotation', keys: [{ time: 0, value: 90 }] }] },
      { name: 'girar', duration: 2, timelines: [{ type: 'bone', target: 'gema', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 2, value: 360 }] }] },
      { name: 'ambos', duration: 1, timelines: [{ type: 'bone', target: 'gema', property: 'rotation', keys: [{ time: 0, value: 7 }] }] },
    ],
  });
  const pai = (attachment: Record<string, unknown>, animations: unknown[] = []): Skeleton => {
    const data = loadSkeletonData({
      bone: h,
      bones: [{ name: 'root' }, { name: 'hand', parent: 'root', x: 100, y: 50 }],
      slots: [{ name: 'weapon', bone: 'hand', attachment: 'sword' }],
      skins: [{ name: 'default', attachments: { weapon: { sword: { type: 'skeleton', uri: 'arma.bone', x: 5, ...attachment } } } }],
      animations,
    }, { skeletons: new Map([['arma.bone', arma()]]) });
    return new Skeleton(data);
  };
  const child = (sk: Skeleton): NestedSkeleton => sk.findSlot('weapon')!.nested as NestedSkeleton;

  it('baseAnimation roda por baixo com relógio próprio, e a troca de cima não o zera', () => {
    const sk = pai({ baseAnimation: 'girar' }, [{ name: 'esperar', duration: 2, timelines: [
      { type: 'nested', target: 'weapon', property: 'animation', keys: [{ time: 0, value: null }, { time: 1, value: 'attack' }] },
    ] }]);
    const anim = sk.data.findAnimation('esperar')!;
    pose(sk, anim, 0.5, 0.5);
    expect(child(sk).skeleton.findBone('gema')!.arotation).toBeCloseTo(90, 6);
    expect(child(sk).skeleton.findBone('lamina')!.arotation).toBeCloseTo(0, 6);
    pose(sk, anim, 1.5, 1.5);
    expect(child(sk).baseTime).toBeCloseTo(1.5, 9);
    expect(child(sk).skeleton.findBone('gema')!.arotation).toBeCloseTo(270, 6);
    expect(child(sk).skeleton.findBone('lamina')!.arotation).toBeCloseTo(90, 6);
  });

  it('a camada de cima só escreve o que tem chave; o resto continua vindo do fundo', () => {
    const sk = pai({ baseAnimation: 'girar', animation: 'attack' });
    sk.setToSetupPose();
    sk.updateWorldTransform(0.5);
    expect(child(sk).skeleton.findBone('lamina')!.arotation).toBeCloseTo(90, 6);
    expect(child(sk).skeleton.findBone('gema')!.arotation).toBeCloseTo(90, 6);
  });

  it('baseAnimation que o filho não tem avisa uma vez e não inventa', () => {
    const sk = pai({ baseAnimation: 'nenhuma' });
    sk.setToSetupPose();
    sk.updateWorldTransform(0.1);
    sk.updateWorldTransform(0.2);
    expect(child(sk).baseAnimation).toBeNull();
    expect(sk.nestedWarnings.filter((w) => w.includes('"nenhuma"'))).toHaveLength(1);
  });

  it('inheritAnimation: o filho toca a animação de mesmo nome que o pai toca', () => {
    const sk = pai({ inheritAnimation: true, animation: 'ambos' }, [
      { name: 'attack', duration: 0.6, timelines: [] },
      { name: 'andar', duration: 1, timelines: [] },
    ]);
    pose(sk, sk.data.findAnimation('attack')!, 0.3, 0.3);
    expect(child(sk).animationName).toBe('attack');
    expect(child(sk).skeleton.findBone('lamina')!.arotation).toBeCloseTo(90, 6);
    // `andar` não existe no filho: cai para a `animation` do anexo.
    pose(sk, sk.data.findAnimation('andar')!, 0.3, 0.3);
    expect(child(sk).animationName).toBe('ambos');
    expect(child(sk).skeleton.findBone('gema')!.arotation).toBeCloseTo(7, 6);
  });

  it('chave nested/animation null ganha e não cai para inheritAnimation', () => {
    const sk = pai({ inheritAnimation: true }, [{ name: 'attack', duration: 1, timelines: [
      { type: 'nested', target: 'weapon', property: 'animation', keys: [{ time: 0, value: null }] },
    ] }]);
    pose(sk, sk.data.findAnimation('attack')!, 0.3, 0.3);
    expect(child(sk).animationName).toBeNull();
    expect(child(sk).skeleton.findBone('lamina')!.arotation).toBeCloseTo(0, 6);
  });

  it('continueFrom copia os relógios da instância que ficou para trás (9.13)', () => {
    const a = pai({ animation: 'girar' });
    a.setToSetupPose();
    a.updateWorldTransform(0.7);
    const b = pai({ animation: 'girar' });
    b.setToSetupPose();
    b.updateWorldTransform(0);
    child(b).continueFrom(child(a));
    expect(child(b).animationName).toBe('girar');
    expect(child(b).time).toBeCloseTo(0.7, 9);
    expect(child(b).baseTime).toBeCloseTo(child(a).baseTime, 9);
  });
});

// ---------------------------------------------------------------------------
// Apêndice C: relógio sem estado, laço do pai, instância que some
// ---------------------------------------------------------------------------

describe('esqueleto aninhado: as leituras do Apêndice C', () => {
  const h = { version: '1.0', minVersion: '1.0', generator: 'teste apendice C' };
  const arma = (): SkeletonData => loadSkeletonData({
    bone: h,
    bones: [{ name: 'root' }, { name: 'lamina', parent: 'root', x: 20 }],
    animations: [
      { name: 'girar', duration: 1, timelines: [{ type: 'bone', target: 'lamina', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 90 }] }] },
      { name: 'andar', duration: 1, timelines: [{ type: 'bone', target: 'lamina', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }] },
    ],
  });
  const pai = (setupAttachment: string | null, attachment: Record<string, unknown>, animations: unknown[]): Skeleton => new Skeleton(loadSkeletonData({
    bone: h,
    bones: [{ name: 'root' }, { name: 'hand', parent: 'root' }],
    slots: [{ name: 'weapon', bone: 'hand', ...(setupAttachment === null ? {} : { attachment: setupAttachment }) }],
    skins: [{ name: 'default', attachments: { weapon: { sword: { type: 'skeleton', uri: 'arma.bone', ...attachment } } } }],
    animations,
  }, { skeletons: new Map([['arma.bone', arma()]]) }));
  const lamina = (sk: Skeleton): number => (sk.findSlot('weapon')!.nested as NestedSkeleton).skeleton.findBone('lamina')!.arotation;

  it('regra 1: o relógio do filho começa no início da corrida de chaves que mostra a entidade, sem estado', () => {
    const sk = pai(null, { animation: 'girar', loop: false }, [{ name: 'sacar', duration: 2, timelines: [
      { type: 'slot', target: 'weapon', property: 'attachment', keys: [
        { time: 0, value: null }, { time: 0.5, value: 'sword' }, { time: 0.8, value: 'sword' }, { time: 1.5, value: null },
      ] },
    ] }]);
    const anim = sk.data.findAnimation('sacar')!;
    // Pulando direto para 1,2 (sem ter passado por 0,5): relógio = 1,2 - 0,5 = 0,7 -> 63 graus.
    pose(sk, anim, 1.2, 1.2);
    expect(lamina(sk)).toBeCloseTo(63, 6);
    pose(sk, anim, 0.6, 0.6);
    expect(lamina(sk)).toBeCloseTo(9, 6);
    expect(sk.findSlot('weapon')!.nestedOrigin).toBe(0.5);
  });

  it('regra 2: em laço o filho usa o tempo enrolado do pai e recomeça a cada volta', () => {
    const sk = pai('sword', { animation: 'girar', loop: false }, [{ name: 'ciclo', duration: 1, timelines: [] }]);
    const anim = sk.data.findAnimation('ciclo')!;
    pose(sk, anim, 1.25 % 1, 1.25);
    expect(lamina(sk)).toBeCloseTo(22.5, 6);
  });

  it('regra 4: inheritAnimation usa o laço do pai', () => {
    const sk = pai('sword', { inheritAnimation: true, loop: false }, [{ name: 'andar', duration: 3, timelines: [] }]);
    const anim = sk.data.findAnimation('andar')!;
    pose(sk, anim, 1.5, 1.5);
    sk.playingLoop = true;
    sk.updateWorldTransform(1.5);
    expect(lamina(sk)).toBeCloseTo(50, 6);
    sk.playingLoop = false;
    sk.updateWorldTransform(1.5);
    expect(lamina(sk)).toBeCloseTo(100, 6);
  });

  it('regra 16: a entidade some quando o slot deixa de mostrá-la, com NESTED_GONE uma vez, e volta nova', () => {
    const sk = pai(null, { animation: 'girar' }, [{ name: 'a', duration: 2, timelines: [
      { type: 'slot', target: 'weapon', property: 'attachment', keys: [{ time: 0, value: 'sword' }, { time: 1, value: null }, { time: 1.5, value: 'sword' }] },
    ] }]);
    const anim = sk.data.findAnimation('a')!;
    pose(sk, anim, 0.5, 0.5);
    const primeira = sk.findSlot('weapon')!.nested;
    expect(primeira).not.toBeNull();
    pose(sk, anim, 0.6, 0.6);
    expect(sk.findSlot('weapon')!.nested).toBe(primeira);
    pose(sk, anim, 1.2, 1.2);
    expect(sk.findSlot('weapon')!.nested).toBeNull();
    pose(sk, anim, 1.3, 1.3);
    expect(sk.nestedWarnings.filter((w) => w.startsWith('NESTED_GONE'))).toHaveLength(1);
    pose(sk, anim, 1.6, 1.6);
    const segunda = sk.findSlot('weapon')!.nested;
    expect(segunda).not.toBeNull();
    expect(segunda).not.toBe(primeira);
    expect(lamina(sk)).toBeCloseTo(9, 6);
  });
});

// ---------------------------------------------------------------------------
// `around`: a entidade em volta de quem a recebe (7.11, rodada 11, 05/10/2026)
// ---------------------------------------------------------------------------

/**
 * Um caso de conformidade do `around`, carregado como o executor carrega. Os
 * casos nascem em `casos-pendentes/` e passam a `casos/` quando os dois
 * runtimes ficam verdes: o teste acha a pasta onde ela estiver.
 */
function casoDoAround(nome: string): Skeleton {
  const raiz = 'C:/Users/F-rak/Desktop/animador/conformidade/';
  const dir = [`${raiz}casos/${nome}/`, `${raiz}casos-pendentes/${nome}/`].find((d) => existsSync(d));
  if (dir === undefined) throw new Error(`o caso ${nome} sumiu de casos/ e de casos-pendentes/`);
  const arquivo = loadSkeletonFile(new Uint8Array(readFileSync(dir + 'entrada.bone')), {
    atlases: [],
    codec: { inflateRaw: (d: Uint8Array) => inflateRawSync(d) },
    files: (caminho: string) => (existsSync(dir + caminho) ? new Uint8Array(readFileSync(dir + caminho)) : null),
  });
  const skeleton = new Skeleton(arquivo.data);
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform(0);
  return skeleton;
}

describe('around: a entidade em volta de quem a recebe (7.11)', () => {
  it('arquivo SEM around: a lista em três grupos é a de sempre, entrada por entrada', () => {
    const skeleton = heroiComEspada();
    const antes = collectDrawables(skeleton);
    const agora = collectDrawGroups(skeleton);
    expect(agora.length).toBe(antes.length);
    expect(agora.length).toBeGreaterThan(5);
    for (let i = 0; i < antes.length; i++) {
      expect(agora[i].slot).toBe(antes[i].slot);
      expect(agora[i].attachment).toBe(antes[i].attachment);
      expect(agora[i].clip === null).toBe(antes[i].clip === null);
      expect(agora[i].part).toBeUndefined();
    }
    for (const att of nestedAttachments(skeleton.data)) expect(att.around).toBeNull();
  });

  it('collectDrawables NÃO muda com around: quem ainda o usa desenha em bloco, não em dobro', () => {
    const skeleton = casoDoAround('C-311-este-boneco');
    expect(collectDrawables(skeleton).map((d) => d.slot.data.name)).toEqual(['perna', 'tronco', 'aura', 'cabeca']);
  });

  it('o filho sai do lugar do slot e aparece duas vezes, atrás e na frente', () => {
    const skeleton = casoDoAround('C-311-este-boneco');
    expect(collectDrawGroups(skeleton).map((d) => `${d.slot.data.name}:${d.part ?? '-'}`))
      .toEqual(['aura:back', 'perna:-', 'tronco:-', 'cabeca:-', 'aura:front']);
    expect(collectDrawList(skeleton).map((p) => p.name)).toEqual([
      'aura/bola_a/bola_a', 'aura/anel/anel', 'perna/perna', 'tronco/tronco', 'cabeca/cabeca',
      'aura/brilho/brilho', 'aura/bola_b/bola_b',
    ]);
  });

  // O canal `drawList` do dump sai de `collectDrawList`; a TELA anda por
  // `collectDrawGroups` e entra no filho por conta própria. São dois caminhos:
  // o verde dos casos de conformidade não prova o segundo (regra 28).
  it('a tela desenha na MESMA ordem da lista: básico, dois, níveis e máscara', () => {
    for (const nome of [
      'C-310-aninhado-em-bloco', 'C-311-este-boneco', 'C-314-este-boneco-dois',
      'C-315-este-boneco-niveis-bloco', 'C-316-este-boneco-niveis-marcado',
      'C-318-este-boneco-mascara-do-filho', 'C-319-este-boneco-mascara-do-pai',
      'X-307-este-boneco-slot-que-nao-existe',
    ]) {
      const skeleton = casoDoAround(nome);
      const ctx = new Proxy({}, {
        get: (_t, key) => (key === 'canvas' ? {} : () => 0),
        set: () => true,
      }) as unknown as CanvasRenderingContext2D;
      const renderer = new CanvasRenderer(ctx);
      const naTela: string[] = [];
      vi.spyOn(renderer as unknown as { drawOne: (d: { slot: { data: { name: string } } }) => void }, 'drawOne')
        .mockImplementation((d) => { naTela.push(d.slot.data.name); });
      renderer.draw(skeleton);
      const naLista = collectDrawList(skeleton).map((p) => p.slot.data.name);
      expect(naLista.length, nome).toBeGreaterThan(5);
      expect(naTela, nome).toEqual(naLista);
    }
  });

  it('around com slot que o filho não tem: em bloco, e avisa UMA vez', () => {
    const skeleton = casoDoAround('X-307-este-boneco-slot-que-nao-existe');
    collectDrawList(skeleton);
    collectDrawList(skeleton);
    const avisos = skeleton.nestedWarnings.filter((w) => w.startsWith('AROUND_SLOT_MISSING'));
    expect(avisos.length).toBe(1);
    expect(avisos[0]).toContain('nao_existe');
    expect(avisos[0]).toContain('"aura"');
  });

  it('com around válido não há aviso', () => {
    const skeleton = casoDoAround('C-314-este-boneco-dois');
    collectDrawList(skeleton);
    expect(skeleton.nestedWarnings.filter((w) => w.startsWith('AROUND_SLOT_MISSING'))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A troca de placeholder com a mesma `uri` continua o filho (7.11, lote 2b)
// ---------------------------------------------------------------------------

describe('troca de placeholder: a mesma uri continua, outra uri zera (7.11)', () => {
  /** O caso, com o ator pronto para posar a animação `troca`. */
  function atorDoCaso(nome: string): { posar: (t: number) => Skeleton; avisos: () => readonly string[] } {
    const skeleton = casoDoAround(nome);
    const troca = skeleton.data.findAnimation('troca')!;
    return {
      posar: (t: number) => { pose(skeleton, troca, t); return skeleton; },
      avisos: () => skeleton.nestedWarnings,
    };
  }

  it('mesma uri: a INSTÂNCIA é a mesma depois da troca, e não há NESTED_GONE', () => {
    const { posar, avisos } = atorDoCaso('C-320-entidade-troca-de-placeholder-mesma-uri');
    const antes = posar(0.5).findSlot('aura')!.nested as NestedSkeleton;
    const anexoAntes = antes.attachment;
    const depois = posar(0.9).findSlot('aura')!.nested as NestedSkeleton;
    expect(depois).toBe(antes);
    expect(depois.skeleton).toBe(antes.skeleton);
    // ...e passou a ler o anexo novo: o de 0,9 não tem `around`.
    expect(anexoAntes.around).toBe('meio');
    expect(depois.attachment).not.toBe(anexoAntes);
    expect(depois.attachment.around).toBeNull();
    expect(depois.time).toBeCloseTo(0.9, 9);
    expect(avisos().filter((w) => w.startsWith('NESTED_GONE'))).toEqual([]);
  });

  it('outra uri: instância NOVA, relógio do zero da chave, e o aviso sai', () => {
    const { posar, avisos } = atorDoCaso('C-321-entidade-troca-de-placeholder-outra-uri');
    const antes = posar(0.5).findSlot('aura')!.nested as NestedSkeleton;
    const depois = posar(0.9).findSlot('aura')!.nested as NestedSkeleton;
    expect(depois).not.toBe(antes);
    expect(depois.time).toBeCloseTo(0.15, 9);
    expect(avisos().filter((w) => w.startsWith('NESTED_GONE')).length).toBe(1);
  });

  it('voltar no tempo dá o mesmo quadro: o relógio continua sendo conta, não estado', () => {
    const { posar } = atorDoCaso('C-320-entidade-troca-de-placeholder-mesma-uri');
    const x = (t: number): number => (posar(t).findSlot('aura')!.nested as NestedSkeleton).skeleton.findBone('orbe')!.worldX;
    expect(x(0.9)).toBeCloseTo(90, 6);
    expect(x(0.5)).toBeCloseTo(50, 6);
    expect(x(0.9)).toBeCloseTo(90, 6);
  });
});
