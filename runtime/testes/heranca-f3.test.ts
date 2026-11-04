/**
 * F3 — as três heranças que eram reservadas (§5.3): `noRotation`,
 * `noReflection`, `onlyReflection`.
 *
 * Os números de mundo estão nos casos C-283 a C-285, conferidos à mão. Aqui
 * fica o que um caso de conformidade não mede sozinho: a volta (5.5), a
 * virada do esqueleto inteiro e a mira da IK de 1 osso.
 */

import { describe, expect, it } from 'vitest';

import { Skeleton, loadSkeletonData, type Bone } from '../src/index.js';
import { apply1 } from '../src/constraints/ik.js';

const header = { version: '1.0', minVersion: '1.0', generator: 'teste F3' };

/**
 * Pai cisalhado — refletido com `paiScaleY` negativo, o padrão —; um filho em
 * cada modo, com pose local completa.
 */
function esqueleto(paiScaleY = -0.7, filhoShearY = 10): Skeleton {
  const local = { x: 10, y: 5, rotation: 30, scaleX: 1.5, scaleY: 0.8, shearY: filhoShearY };
  const data = loadSkeletonData({
    bone: header,
    bones: [
      { name: 'root' },
      { name: 'pai', parent: 'root', x: 50, y: 20, rotation: 25, scaleX: 2, scaleY: paiScaleY, shearY: 15 },
      { name: 'normal', parent: 'pai', ...local },
      { name: 'onlyTranslation', parent: 'pai', ...local, inheritRotation: false, inheritScale: false, inheritReflection: false },
      { name: 'noRotationOrReflection', parent: 'pai', ...local, inheritRotation: false, inheritReflection: false },
      { name: 'noRotation', parent: 'pai', ...local, inheritRotation: false },
      { name: 'noReflection', parent: 'pai', ...local, inheritReflection: false },
      { name: 'onlyReflection', parent: 'pai', ...local, inheritRotation: false, inheritScale: false },
    ],
  });
  const skeleton = new Skeleton(data);
  skeleton.setToSetupPose();
  return skeleton;
}

function osso(skeleton: Skeleton, name: string): Bone {
  return skeleton.bones.find((b) => b.data.name === name)!;
}

function matriz(b: Bone): number[] {
  return [b.a, b.b, b.c, b.d, b.worldX, b.worldY];
}

function det(b: Bone): number {
  return b.a * b.d - b.b * b.c;
}

describe('F3 — o sinal do determinante, com o pai refletido', () => {
  it('noRotation guarda a reflexão; noReflection e onlyReflection fazem o que o nome diz', () => {
    const skeleton = esqueleto();
    skeleton.updateWorldTransform(0);
    const pai = osso(skeleton, 'pai');
    expect(det(pai)).toBeLessThan(0);
    // Cada novo contra o modo de onde ele parte: o mesmo módulo, o sinal oposto.
    expect(det(osso(skeleton, 'noRotation'))).toBeCloseTo(-det(osso(skeleton, 'noRotationOrReflection')), 9);
    expect(det(osso(skeleton, 'noReflection'))).toBeCloseTo(-det(osso(skeleton, 'normal')), 9);
    expect(det(osso(skeleton, 'onlyReflection'))).toBeCloseTo(-det(osso(skeleton, 'onlyTranslation')), 9);
    expect(det(osso(skeleton, 'noRotation'))).toBeLessThan(0);
    expect(det(osso(skeleton, 'noReflection'))).toBeGreaterThan(0);
    expect(det(osso(skeleton, 'onlyReflection'))).toBeLessThan(0);
  });

  it('com o pai sem reflexão, cada novo é igual ao modo de onde parte', () => {
    const skeleton = esqueleto(0.7);
    skeleton.updateWorldTransform(0);
    expect(matriz(osso(skeleton, 'noRotation'))).toEqual(matriz(osso(skeleton, 'noRotationOrReflection')));
    expect(matriz(osso(skeleton, 'noReflection'))).toEqual(matriz(osso(skeleton, 'normal')));
    expect(matriz(osso(skeleton, 'onlyReflection'))).toEqual(matriz(osso(skeleton, 'onlyTranslation')));
  });

  it('a virada do esqueleto inteiro não conta como reflexão do pai', () => {
    const skeleton = esqueleto(0.7);
    skeleton.scaleX = -1;
    skeleton.updateWorldTransform(0);
    // O pai está refletido só porque o esqueleto virou: os novos não desviram.
    expect(det(osso(skeleton, 'pai'))).toBeLessThan(0);
    expect(matriz(osso(skeleton, 'noRotation'))).toEqual(matriz(osso(skeleton, 'noRotationOrReflection')));
    expect(matriz(osso(skeleton, 'noReflection'))).toEqual(matriz(osso(skeleton, 'normal')));
    expect(matriz(osso(skeleton, 'onlyReflection'))).toEqual(matriz(osso(skeleton, 'onlyTranslation')));
  });
});

describe('F3 — a volta (5.5): mundo → aplicada → mundo', () => {
  // O filho vai SEM cisalhamento: com ele, nem o `normal` volta exato — é a
  // decomposição da 5.5, porte do Spine, e não assunto do F3. O pai continua
  // refletido e cisalhado. O `normal` entra como controle.
  for (const name of ['normal', 'noReflection', 'onlyReflection']) {
    it(`${name}: a pose aplicada e a matriz de mundo voltam iguais`, () => {
      const skeleton = esqueleto(-0.7, 0);
      skeleton.updateWorldTransform(0);
      const b = osso(skeleton, name);
      const mundo = matriz(b);
      const pose = [b.ax, b.ay, b.arotation, b.ascaleX, b.ascaleY, b.ashearX, b.ashearY];
      b.updateAppliedTransform();
      [b.ax, b.ay, b.arotation, b.ascaleX, b.ascaleY, b.ashearX, b.ashearY]
        .forEach((v, i) => expect(v, `pose ${i}`).toBeCloseTo(pose[i]!, 9));
      b.updateWorldTransform();
      matriz(b).forEach((v, i) => expect(v, `mundo ${i}`).toBeCloseTo(mundo[i]!, 9));
    });
  }
});

describe('F3 — a IK de 1 osso mira o alvo', () => {
  for (const name of ['noReflection', 'onlyReflection']) {
    it(`${name}: com mix 1, o eixo X do osso aponta para o alvo`, () => {
      const skeleton = esqueleto();
      skeleton.updateWorldTransform(0);
      const b = osso(skeleton, name);
      const tx = b.worldX + 30;
      const ty = b.worldY - 40;
      apply1(b, tx, ty, false, false, false, 1);
      b.updateWorldTransform();
      const eixo = Math.atan2(b.c, b.a);
      const alvo = Math.atan2(ty - b.worldY, tx - b.worldX);
      const diferenca = Math.abs(((eixo - alvo + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
      expect(diferenca).toBeLessThan(1e-6);
    });
  }
});
