#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
//
// Build step for the web validator.
//
// The page must be a plain static file: no bundler, no server, no network
// dependency. But it has to agree with the command line validator down to the
// last error, and the command line validator is Ajv over
// `formato/bone.schema.json`.
//
// So Ajv runs here, once, at build time. `ajv/dist/standalone` turns the three
// compiled validators into plain JavaScript functions, esbuild bundles the few
// helpers they call, and the result is written to `esquema-compilado.js` —
// an ES module the browser imports with no Ajv and no `eval` at runtime.
//
// Run it again whenever `formato/bone.schema.json` changes:
//
//   node site/validador/construir-esquema.mjs
//
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import standaloneCode from 'ajv/dist/standalone/index.js'
import * as esbuild from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..', '..')
const schemaPath = join(root, 'formato', 'bone.schema.json')
const outPath = join(here, 'esquema-compilado.js')
const tempPath = join(here, '.esquema-gerado.mjs')

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))

// Same options as ferramentas/validador/validar.mjs, plus `code` so Ajv emits
// source instead of closures.
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
  code: { source: true, esm: true },
})
addFormats(ajv)

const id = schema.$id ?? 'bone.schema.json'
ajv.addSchema(schema, id)
// One entry point per file type, exactly the three the command line knows.
ajv.addSchema({ $id: 'entrada/esqueleto', $ref: `${id}#` })
ajv.addSchema({ $id: 'entrada/atlas', $ref: `${id}#/definitions/atlas` })
ajv.addSchema({ $id: 'entrada/manifesto', $ref: `${id}#/definitions/manifest` })

// The extensions, so the page applies an extension's own schema by name just
// like the command line does (spec 12.7). Convention in
// `formato/extensions/REGISTRY.md`: `<NOME_DA_EXTENSAO>.schema.json`.
const extDir = join(root, 'formato', 'extensions')
const pontos = {
  validateSkeleton: 'entrada/esqueleto',
  validateAtlas: 'entrada/atlas',
  validateManifest: 'entrada/manifesto',
}
const metaExtensoes = []
let arquivosExt = []
try { arquivosExt = readdirSync(extDir).filter(f => f.endsWith('.schema.json')).sort() } catch { /* sem pasta */ }
for (const arquivo of arquivosExt) {
  const esquemaExt = JSON.parse(readFileSync(join(extDir, arquivo), 'utf8'))
  const nomeExt = esquemaExt['x-extension'] ?? arquivo.replace(/\.schema\.json$/, '')
  // `validateExt_BONE_particles`: um identificador JavaScript legal e legível.
  const exportado = `validateExt_${nomeExt.replace(/[^A-Za-z0-9_]/g, '_')}`
  const idExt = esquemaExt.$id ?? `extensao/${nomeExt}`
  ajv.addSchema(esquemaExt, idExt)
  ajv.addSchema({ $id: `entrada/${nomeExt}`, $ref: `${idExt}#` })
  pontos[exportado] = `entrada/${nomeExt}`
  metaExtensoes.push({
    nome: nomeExt,
    exportado,
    tiposDeAnexo: esquemaExt['x-attachment-types'] ?? [],
    tiposDeTimeline: esquemaExt['x-timeline-types'] ?? [],
  })
}

const generated = standaloneCode(ajv, pontos)

writeFileSync(tempPath, generated)
try {
  await esbuild.build({
    entryPoints: [tempPath],
    bundle: true,
    format: 'esm',
    target: 'es2020',
    outfile: outPath,
    minify: true,
    legalComments: 'none',
    banner: {
      js:
        '// SPDX-License-Identifier: Apache-2.0\n' +
        '// GERADO POR site/validador/construir-esquema.mjs — não edite à mão.\n' +
        '// Vem de formato/bone.schema.json, compilado por Ajv 8 (MIT).\n' +
        '// Rode o script de novo quando o esquema mudar.\n',
    },
  })
} finally {
  rmSync(tempPath, { force: true })
}

// A declaration beside it, so the Vitest test can import the three validators
// without `any`. Generated too: it is three lines and it never drifts.
writeFileSync(join(here, 'esquema-compilado.d.ts'),
  '// SPDX-License-Identifier: Apache-2.0\n' +
  '// GERADO POR site/validador/construir-esquema.mjs — não edite à mão.\n' +
  "import type { ValidadorCompilado } from './nucleo.js'\n\n" +
  'export declare const validateSkeleton: ValidadorCompilado\n' +
  'export declare const validateAtlas: ValidadorCompilado\n' +
  'export declare const validateManifest: ValidadorCompilado\n')

// The names `REGISTRY.md` registers, read from the very table the command line
// reads: a name outside it is L2 `EXT_UNREGISTERED` (spec 2.7).
const registrados = []
try {
  const textoRegistro = readFileSync(join(extDir, 'REGISTRY.md'), 'utf8')
  for (const linha of textoRegistro.split(/\r?\n/)) {
    const m = /^\|\s*`([A-Z][A-Z0-9]{1,7}_[a-z0-9_]+)`\s*\|/.exec(linha)
    if (m && !registrados.includes(m[1])) registrados.push(m[1])
  }
} catch { /* sem registro: nenhum L2, e não é o mesmo que "não registrada" */ }

// The registry the page hands to `nucleo.checarExtensoes`: name → compiled
// schema + the prefixed types that schema describes. Generated too, so a new
// file in `formato/extensions/` reaches the page without anyone editing this.
const linhas = metaExtensoes.map(m =>
  `  ${JSON.stringify(m.nome)}: {\n` +
  `    validar: ${m.exportado},\n` +
  `    tiposDeAnexo: ${JSON.stringify(m.tiposDeAnexo)},\n` +
  `    tiposDeTimeline: ${JSON.stringify(m.tiposDeTimeline)},\n` +
  `  },`)
writeFileSync(join(here, 'extensoes-compiladas.js'),
  '// SPDX-License-Identifier: Apache-2.0\n' +
  '// GERADO POR site/validador/construir-esquema.mjs — não edite à mão.\n' +
  '// O registro de extensões da §12.7: nome da extensão → o schema dela.\n' +
  (metaExtensoes.length
    ? `import { ${metaExtensoes.map(m => m.exportado).join(', ')} } from './esquema-compilado.js'\n\n`
    : '\n') +
  'export const registroDeExtensoes = {\n' + linhas.join('\n') + (linhas.length ? '\n' : '') + '}\n\n' +
  'export const extensoesRegistradas = new Set(' + JSON.stringify(registrados) + ')\n')

writeFileSync(join(here, 'extensoes-compiladas.d.ts'),
  '// SPDX-License-Identifier: Apache-2.0\n' +
  '// GERADO POR site/validador/construir-esquema.mjs — não edite à mão.\n' +
  "import type { RegistroDeExtensoes } from './nucleo.js'\n\n" +
  'export declare const registroDeExtensoes: RegistroDeExtensoes\n' +
  'export declare const extensoesRegistradas: Set<string>\n')

const bytes = readFileSync(outPath).length
console.log(`Gravado ${outPath}`)
console.log(`Tamanho: ${(bytes / 1024).toFixed(1)} kB`)
