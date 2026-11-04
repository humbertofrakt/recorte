// SPDX-License-Identifier: Apache-2.0
/**
 * O ponto de entrada do pacote do leitor do Construct (rodada K1, 05/10/2026).
 *
 * É o `runtime/src/index.ts` inteiro, linha a linha, MENOS o desenhador de
 * Canvas 2D (`render/canvas.ts`): ele usa o DOM do navegador e, dentro do
 * Construct, quem desenha é o `drawMesh` (o nosso `desenhador.ts`).
 *
 * Não mexe em `runtime/`: só importa de lá. Se o `index.ts` do runtime ganhar
 * uma linha nova, ela tem de vir para cá também — o teste `pacote.test.ts`
 * compara as duas listas e fica vermelho quando uma esquece a outra.
 *
 * Além do que o `index.ts` exporta, saem daqui as classes de anexo que o
 * `pose-dump` da conformidade usa com `instanceof` (malha, caixa, ponto…):
 * a prova dos casos de `conformidade/casos/` roda SOBRE este pacote, e as classes têm de ser as
 * MESMAS que o pacote usa, não uma segunda cópia.
 */

export * from '../../runtime/src/types.js';
export * from '../../runtime/src/math.js';
export * from '../../runtime/src/curve.js';
export * from '../../runtime/src/data.js';
export * from '../../runtime/src/loader.js';
export * from '../../runtime/src/skeleton.js';
export * from '../../runtime/src/animation.js';
export * from '../../runtime/src/animation-state.js';
export * from '../../runtime/src/sequence-frame.js';
export * from '../../runtime/src/color.js';
export * from '../../runtime/src/render-list.js';
export * from '../../runtime/src/uri.js';
export * from '../../runtime/src/json-text.js';
export * from '../../runtime/src/file.js';
export * from '../../runtime/src/externos.js';
export * from '../../runtime/src/actor.js';
export * from '../../runtime/src/parameters.js';
export * from '../../runtime/src/constraints/constraint.js';

// Os efeitos colaterais do index.ts: o esqueleto aninhado (7.11) e as cinco
// regras reais trocam as fábricas "noop". Sem estes imports, o pacote carrega
// e calcula ERRADO, em silêncio.
import '../../runtime/src/nested.js';
export * from '../../runtime/src/nested.js';
import '../../runtime/src/constraints/ik.js';
import '../../runtime/src/constraints/transform.js';
import '../../runtime/src/constraints/path.js';
import '../../runtime/src/constraints/physics.js';
import '../../runtime/src/constraints/driver.js';
export { IkConstraint } from '../../runtime/src/constraints/ik.js';
export { TransformConstraint } from '../../runtime/src/constraints/transform.js';
export { PathConstraint } from '../../runtime/src/constraints/path.js';
export { PhysicsConstraint } from '../../runtime/src/constraints/physics.js';
export { DriverConstraint } from '../../runtime/src/constraints/driver.js';

// `export * from './render/canvas.js'` do index.ts: FICA DE FORA, de propósito.

export { Attachment } from '../../runtime/src/attachments/attachment.js';
export {
  REGION_BL, REGION_BR, REGION_TR, REGION_TL, REGION_TRIANGLES, computeRegionFrame, type RegionFrameParams,
  RegionAttachment,
} from '../../runtime/src/attachments/region.js';
export { computeMeshRegionUVs, MeshAttachment } from '../../runtime/src/attachments/mesh.js';
export { ELLIPSE_SEGMENTS, BoundingBoxAttachment } from '../../runtime/src/attachments/boundingbox.js';
export { formatNumber } from '../../runtime/src/attachments/sequence.js';

export {
  ParticleAttachment, PARTICLE_ATTACHMENT_TYPE, PARTICLE_SHAPES, PARTICLE_MESH_MODES,
  PARTICLE_SPACES, PARTICLE_SORT_MODES, PARTICLE_FRAME_MODES, isParticleAttachment,
  type ParticleShape, type ParticleSpace, type ParticleSortMode, type ParticleMeshMode,
  type ParticleFrameMode, type ParticleBurst, type OverLifetimeKey,
} from '../../runtime/src/attachments/particle.js';
export * from '../../runtime/src/particles/hash.js';
export * from '../../runtime/src/particles/emission.js';
export * from '../../runtime/src/particles/emitter.js';
export { particleFrame, ParticleCache } from '../../runtime/src/particles/frame.js';

// --- a mais que o index.ts: as classes que a prova usa com `instanceof` ------
export { VertexAttachment } from '../../runtime/src/attachments/vertex-attachment.js';
export { LinkedMeshAttachment } from '../../runtime/src/attachments/linkedmesh.js';
export { PointAttachment } from '../../runtime/src/attachments/point.js';
export { ClippingAttachment } from '../../runtime/src/attachments/clipping.js';
export { BonePoser } from '../../runtime/src/particles/bone-poser.js';

// --- o que é do leitor do Construct --------------------------------------
export * from './desenhador.js';
export * from './carregar.js';
export * from './tocador.js';
export * from './recorte.js';
