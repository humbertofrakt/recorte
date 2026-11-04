// SPDX-License-Identifier: Apache-2.0
// GERADO POR site/validador/construir-esquema.mjs — não edite à mão.
// O registro de extensões da §12.7: nome da extensão → o schema dela.
import { validateExt_BONE_particles } from './esquema-compilado.js'

export const registroDeExtensoes = {
  "BONE_particles": {
    validar: validateExt_BONE_particles,
    tiposDeAnexo: ["BONE_particle"],
    tiposDeTimeline: ["BONE_particle"],
  },
}

export const extensoesRegistradas = new Set(["RECORTE_editor_state","BONE_param_grid","BONE_pendulum","BONE_particles"])
