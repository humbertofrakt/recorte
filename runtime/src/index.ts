// SPDX-License-Identifier: Apache-2.0
/**
 * Recorte runtime — public entry point.
 */

export * from './types.js';
export * from './math.js';
export * from './curve.js';
export * from './data.js';
export * from './loader.js';
export * from './skeleton.js';
export * from './animation.js';
// Tracks, crossfade and per-property mixing (A5 / T5). Runtime only: no field
// of the `.bone` file is added by it.
export * from './animation-state.js';
export * from './sequence-frame.js';
export * from './color.js';
export * from './render-list.js';
export * from './uri.js';
export * from './json-text.js';
// One door in for `.bone`, `.boneb` and `.bonez` (spec 1.2).
export * from './file.js';
// Animations and skins from other files (spec 2.8), folded in before loading.
export * from './externos.js';
// A project with several bodies and the body switch (spec 9.13).
export * from './actor.js';
export * from './parameters.js';
export * from './constraints/constraint.js';

// Nested skeletons of spec 7.11. Imported for the side effect (it installs the
// factory `skeleton.ts` calls) as well as re-exported, so a consumer of the
// entry point gets nested children drawn without importing anything else.
import './nested.js';
export * from './nested.js';

// The real constraint factories replace the noops of `constraint.js` as a side
// effect of importing these modules, so they are imported for the side effect
// as well as re-exported: a re-export of the class alone would be erased by the
// compiler wherever only the type is used.
import './constraints/ik.js';
import './constraints/transform.js';
import './constraints/path.js';
import './constraints/physics.js';
import './constraints/driver.js';
export { IkConstraint } from './constraints/ik.js';
export { TransformConstraint } from './constraints/transform.js';
export { PathConstraint } from './constraints/path.js';
export { PhysicsConstraint } from './constraints/physics.js';
export { DriverConstraint } from './constraints/driver.js';

// Canvas 2D reference renderer (spec 7). Types only touch the DOM lazily.
export * from './render/canvas.js';
export { Attachment } from './attachments/attachment.js';
export {
  REGION_BL, REGION_BR, REGION_TR, REGION_TL, REGION_TRIANGLES, computeRegionFrame, type RegionFrameParams,
} from './attachments/region.js';
export { computeMeshRegionUVs } from './attachments/mesh.js';
export { ELLIPSE_SEGMENTS } from './attachments/boundingbox.js';
export { formatNumber } from './attachments/sequence.js';

// The side module P of the `BONE_particles` extension: an emitter is a pure
// function of (file, animation, t), and nothing here keeps state between
// frames. The law is `formato/extensions/BONE_particles.md` and the eight
// cases P-001..P-008.
export {
  ParticleAttachment, PARTICLE_ATTACHMENT_TYPE, PARTICLE_SHAPES, PARTICLE_MESH_MODES,
  PARTICLE_SPACES, PARTICLE_SORT_MODES, PARTICLE_FRAME_MODES, isParticleAttachment,
  type ParticleShape, type ParticleSpace, type ParticleSortMode, type ParticleMeshMode,
  type ParticleFrameMode, type ParticleBurst, type OverLifetimeKey,
} from './attachments/particle.js';
export * from './particles/hash.js';
export * from './particles/emission.js';
export * from './particles/emitter.js';
// Rodada 15 (04/10/2026): a porta que o desenhador usa, também para o editor
// achar o emissor pelas partículas que estão na tela — a MESMA conta, nunca
// uma segunda.
export { particleFrame, ParticleCache } from './particles/frame.js';
