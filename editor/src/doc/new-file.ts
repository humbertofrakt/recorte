/**
 * The smallest valid `.bone` file (owner A).
 *
 * Used by "Arquivo > Novo" and by the tests. It must load without a single
 * warning: one root bone, the `default` skin, no slots yet.
 */

import type { BoneFile } from '../../../runtime/src/index.js';

/** Format version this editor writes. */
export const FILE_VERSION = '1.0';
/** Oldest reader version that can still open what we write. */
export const FILE_MIN_VERSION = '1.0';
/** Value written into `bone.generator`. */
export const GENERATOR = 'Recorte 0.1.0';

/** Name of the bone every skeleton starts with (spec 2.2: `bones[0]` is root). */
export const ROOT_BONE = 'root';
/** Name of the skin that always exists. */
export const DEFAULT_SKIN = 'default';

/** A fresh, empty, valid document. */
export function createEmptyFile(name = 'sem nome'): BoneFile {
  const now = new Date().toISOString();
  return {
    bone: {
      version: FILE_VERSION,
      minVersion: FILE_MIN_VERSION,
      generator: GENERATOR,
      created: now,
      modified: now,
    },
    skeleton: {
      name,
      fps: 30,
      referenceScale: 100,
    },
    bones: [
      { name: ROOT_BONE },
    ],
    slots: [],
    skins: [
      { name: DEFAULT_SKIN, attachments: {} },
    ],
    animations: [],
  };
}
